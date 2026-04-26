# FAMILIA — Resilience & Distributed Architecture

A first-class requirement: **no single service failure takes the entire application down.** Users must be able to keep using FAMILIA — even if degraded — when any one component (AI, OCR, wearable API, email provider, push provider, family graph service, even one API node) is unavailable.

This doc specifies the resilience contract: which components are critical, which can degrade, what graceful degradation looks like to the user, the patterns we use, and the test strategy that proves it works.

## 1. Principles

1. **Loose coupling.** Services communicate via well-defined APIs and async messages, not shared internals. No service reaches into another's database.
2. **Critical path is short.** Reading a record requires only the API node, the consent engine, the Postgres primary or replica, and Redis. Everything else is async.
3. **Async by default.** Notifications, AI summaries, OCR extraction, audit log fan-out, wearable sync — all happen via a job queue. Failures retry; users see "in progress" state, not crashes.
4. **Bulkheads.** A failure in one workflow doesn't drain resources from another. AI summary jobs run in their own pool; OCR jobs in another; user-facing API requests have priority.
5. **Circuit breakers.** Outbound calls to third parties (Claude, Textract, wearable APIs, email/SMS providers) are wrapped in circuit breakers. After N failures, the circuit opens for M seconds and falls back to degraded behavior — never blocks the user-facing thread.
6. **Cache aggressively, invalidate correctly.** Reads use Redis as a write-through cache. The consent engine is the single source of truth for invalidation: when a grant changes, the cache is invalidated within 1 second across all nodes.
7. **Stateless workers.** Every worker is restartable at any time. State lives in Postgres, Redis, S3, and the queue.
8. **Multi-AZ from day one.** The database, cache, and API run across at least two availability zones in a region. Multi-region is a Phase 3 concern.
9. **Honest degradation copy.** When something is down or slow, the UI says so plainly. Never hide a failure with a spinner that never resolves.

## 2. Service classification

Each component is classified by **criticality** (does the app work without it?) and **synchronicity** (does the user wait for it?).

| Component | Criticality | Sync? | If it fails… |
|---|---|---|---|
| Identity / auth | **Critical** | Sync | New sign-ins blocked; existing sessions continue (token-based) until expiry |
| Consent engine | **Critical** | Sync (embedded as library) | Reads/writes denied; user sees "we couldn't verify access" — never silently allow |
| Postgres primary | **Critical** | Sync | Writes fail; reads fall back to replica (eventual consistency); user sees "saving paused, your work is held locally" |
| Postgres replica | Important | Sync | Reads fall back to primary; latency increases |
| Redis cache | Important | Sync | Reads fall back to Postgres; latency increases; consent invalidation slower |
| S3 / object storage | Important | Sync (uploads), Async (reads cached) | Uploads queued and retried; existing documents still readable from CDN cache |
| Job queue (BullMQ over Redis) | Important | Async | New jobs accepted, processing delayed; if Redis fully down, see Redis row |
| Family graph service | Important | Sync | Tree views show last-good cache; new relationship changes deferred |
| Health data service | Important | Sync | Same as Postgres — record reads/writes |
| Time-series store (Timescale) | Non-critical | Async | Today's wearable data gap; historical trends still visible |
| Wearable ingestion worker | Non-critical | Async | Wearable data sync delayed; manually-entered data unaffected |
| OCR pipeline worker | Non-critical | Async | Documents still upload + save; extraction queued |
| AI digital twin (LLM) | Non-critical | Async | Summaries don't generate; user sees "Your weekly summary is delayed" |
| Notification service | Important | Async | Pushes/emails delayed; in-app inbox still receives messages immediately |
| Audit logging | **Critical** | Sync (fast path) | Synchronous write to `audit_pending` table; async drainage to long-term store. If sync fails: writes that triggered the audit are also rejected. |
| Email provider (SES) | Non-critical for app, important for some flows | Async | Notifications queued; user-facing flows use push as primary |
| Push provider (APNs/FCM) | Non-critical for the app's correctness | Async | In-app inbox + email still deliver alerts; push catches up |

The user can keep using the app — read records, do a check-in, view family tree, send an alert (delivery is async anyway) — when any **non-critical** component is down, and most **important** components.

## 3. The critical-path read

Reading a single record is the most-traveled path. Its dependencies must be minimal.

```
User → Mobile/Web → API node → Consent engine (in-process library) → Redis cache (read) → Postgres replica (read fallback) → Response
```

That's at most three external dependencies (Redis, Postgres replica, optionally primary). Everything else — family graph, AI, audit fan-out, document content — is fetched on demand, and only when the user requests it.

If Redis is down: skip cache, go to Postgres. Slower, still works.

If Postgres replica is down: fall through to primary. Slower, still works.

If Postgres primary is down: reads work from replica (read-only mode); writes fail with a clear message and held-in-client retry queue.

If the consent engine is unavailable: we **deny** by default. We never silently allow.

## 4. The critical-path write

Writing a record:

```
User → Mobile/Web → API node → Consent engine (write check) → Postgres primary (write) → Audit log (write, sync) → Async fan-out (cache invalidate, search index, notifications) → Response
```

The synchronous part is: API + consent + Postgres write + audit write. Everything else is async.

If audit write fails synchronously, the record write is rolled back. We never have a record without an audit entry.

## 5. Async patterns

### 5.1 Job queue
- BullMQ over Redis for the MVP. Production-grade, simple, well-supported in Node.
- Distinct queues per job class:
  - `notifications` (email, push)
  - `wearable-sync`
  - `ocr-extraction`
  - `ai-summarization`
  - `audit-drainage`
  - `export-generation` (PDFs)
- Each queue has its own concurrency, priority, and retry policy.

### 5.2 Retries with backoff
- Exponential: 1m, 5m, 15m, 1h, 4h, 24h.
- Permanent failure after 24h surfaces in user UI: "Your scan couldn't be processed. Try again or contact support."
- Dead letter queue for forensic review.

### 5.3 Idempotency
- Every job carries an `idempotency_key`. Re-enqueuing the same key is a no-op while the job is in-flight or recently completed.
- Every API endpoint accepts `Idempotency-Key` (per [13_API_STATE_MACHINES](13_API_STATE_MACHINES.md) §6).

### 5.4 Outbox pattern
- For events that must reliably trigger downstream work (alert delivery, audit fan-out), the API writes to an `outbox` table in the same transaction as the business write. A worker drains the outbox into the queue. This survives Redis being temporarily down.

## 6. Circuit breakers

For every outbound third-party call (LLM, OCR, wearable API, email, push):
- Use `opossum` (or equivalent) library.
- Open after 5 failures in 30 seconds.
- Half-open after 60 seconds.
- Close after 3 successes.
- When open: short-circuit to fallback behavior.

### Fallback behavior per service

| Service | Fallback when circuit is open |
|---|---|
| Claude (LLM) | Skip summary; mark "delayed". Skip OCR LLM extraction; document is saved without structured fields. |
| Textract (OCR) | Document saved as a file only; extraction queued for later retry once circuit closes. |
| Apple Health / Google Health Connect | Sync paused; user sees "syncing paused, last synced X minutes ago." |
| Email provider | Email retried; in-app notification still delivered. |
| Push provider | Push not delivered; in-app inbox + email cover the gap. |

## 7. Bulkheads (resource isolation)

- API node has dedicated thread pool / event loop quotas:
  - 70% capacity for user-facing requests
  - 20% for outbox drainage
  - 10% reserved for health checks
- Workers run in **separate processes / containers** from the API. AI summary worker spinning hot does not slow user-facing requests.
- Postgres connection pools are sized per workload and bulkheaded.

## 8. Graceful degradation copy

The user always sees what's wrong. Examples:

| Situation | Copy |
|---|---|
| AI summary delayed | "Your weekly summary is taking a little longer than usual. We'll post it as soon as it's ready." |
| OCR delayed | "Your document is saved. Reading it for details — we'll let you know when it's ready." |
| Wearable sync paused | "Apple Health hasn't synced in 12 minutes. Pull to retry, or check Settings." |
| Push couldn't deliver | (No copy — silent. The in-app inbox works.) |
| Postgres in read-only | "Saving is paused for a moment. Your changes are held safely on this device." |
| Whole region down | "We're having a brief outage. Your data is safe. Try again in a few minutes." |
| Consent engine down (rare) | "We can't verify access right now. For your safety, we're holding off until we can." (No silent allow.) |

Every status appears as a small, calm banner — never a modal. Never alarmist.

## 9. Multi-AZ and multi-region

### MVP — single region, multi-AZ
- US-East: Postgres Multi-AZ, Redis with replica, API across 2+ AZs, S3 (multi-AZ by default).
- EU-West infra ready (per [11_OPEN_QUESTIONS](11_OPEN_QUESTIONS.md) D2) but no users routed there at MVP.

### Phase 3 — active-passive across regions
- Postgres logical replication to standby region.
- Manual failover, ≤30 minute RTO, ≤5 minute RPO.

### Phase 5 — active-active (long-term)
- Per-region writes for users in that region.
- Cross-region sync only for explicit cross-border family relationships.
- Avoid until necessary — adds significant complexity.

## 10. Health checks and observability

Every service exposes:
- `GET /health/live` — process is up
- `GET /health/ready` — process is ready to receive traffic (db connection ok, cache ok)
- `GET /health/startup` — process is past startup (warmed up)

ALB / k8s uses these for routing.

Metrics (per service):
- Request rate, error rate, p50/p95/p99 latency
- Queue depth per queue
- Circuit breaker state per circuit
- Cache hit rate
- Database connection pool utilization
- Job processing rate, failure rate
- AI/OCR per-call latency and cost

Alerting (with anti-page-fatigue tuning):
- Error rate >1% sustained 5 minutes → on-call page
- p95 latency >2x baseline sustained 10 minutes → on-call page
- Queue depth backlog over threshold for 30 minutes → on-call page
- Circuit breaker open >5 minutes → ticket (not page) unless critical service
- Audit log failure → immediate page

## 11. Synthetic user journey monitoring

Continuous synthetic traffic against staging and prod:
- Every 60s: log in, read a record, sign out — verifies critical-path read.
- Every 5m: write a record, read it back — verifies critical-path write.
- Every 15m: send a synthetic alert end-to-end (test recipient) — verifies alert delivery pipeline.
- Every 1h: upload a small synthetic document; assert OCR completes within 5 minutes.

If any synthetic fails repeatedly, on-call gets paged before users notice.

## 12. Chaos engineering

Post-MVP (around Sprint 14+), introduce chaos in staging:
- Kill random API nodes; assert no user-visible failure.
- Kill the AI worker; assert summaries delay gracefully and recover.
- Kill the OCR worker; assert documents still upload.
- Kill Redis; assert reads degrade to Postgres without errors.
- Kill the email provider integration; assert in-app notifications still work.
- Saturate the queue; assert priority queues unaffected.
- Add 500ms latency to Postgres; assert app remains usable.
- Drop 30% of packets; assert clients reconnect.

Each chaos exercise is scripted and run monthly.

## 13. Data durability

- Postgres backups: continuous WAL shipping to S3, point-in-time-recovery to any second in last 30 days.
- S3 documents: server-side encryption with KMS, versioning enabled, lifecycle to Glacier after 1 year.
- Restores tested **quarterly** — a backup that hasn't been restored is hypothetical.
- Cross-region backup copy from Sprint 14+.

## 14. Failure-domain ownership in the codebase

Each service / package documents:
- Its critical dependencies
- Its degraded mode
- Its fallback behavior
- Its retry/backoff policy
- Its circuit breaker tuning
- Its observability contract (metrics, health checks)
- Its restart safety properties

This documentation lives in the package's `README.md` under `## Resilience contract`.

## 15. What we are deliberately NOT doing in MVP

- **Cross-region active-active.** Too complex; defer until needed.
- **Service mesh (Istio/Linkerd).** Useful at scale, overkill at MVP team size.
- **Multi-cloud.** Adds enormous operational burden for marginal benefit.
- **Serverless functions for the core API.** We use long-running ECS tasks for predictable behavior; FaaS for niche async workloads only.
- **Global CDN for the API.** Static assets only via CloudFront; API is regional.

## 16. Updates to other docs

- `10_MVP_BUILD_SEQUENCE.md` adds a "resilience track" running across all sprints — not a separate sprint, but a checklist applied to each new component.
- `14_TEST_STRATEGY.md` §6 already includes adversarial tests; add "chaos invariants" testing single-component-failure scenarios.
- `15_REPO_SCAFFOLDING.md` makes services and packages independent and adds a `Resilience contract` section to each package README.

## 17. The simple rule

> When in doubt, ask: **"If [component] is down for an hour, can the user still meaningfully use FAMILIA?"**

If the answer is no for anything except identity, consent, Postgres primary (with replica fallback), and audit — the architecture has drift, and we fix it.
