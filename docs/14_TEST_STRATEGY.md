# FAMILIA — Test Strategy

A test plan tuned to a privacy-first family health product. Standard "unit + integration + e2e" coverage matters but isn't enough — the surfaces where FAMILIA breaks have specific shapes (consent leaks, wrong-recipient routing, OCR hallucinations, family-graph corruption, sensitive-tier downgrades) that need their own test classes.

This doc defines: what we test, how we test it, what coverage to target, and what to never ship without.

## 1. Test pyramid (with privacy/safety extensions)

```
                    ┌────────────────────┐
                    │  Manual: hostile-  │  rare, scripted, signed-off
                    │  family review     │
                    └────────────────────┘
                  ┌────────────────────────┐
                  │  E2E: critical flows    │  ~25 flows, daily
                  └────────────────────────┘
                ┌──────────────────────────────┐
                │  Privacy / consent invariants  │  ~200 properties, every PR
                └──────────────────────────────┘
              ┌──────────────────────────────────┐
              │  Integration: cross-service flows │  ~150 tests, per service
              └──────────────────────────────────┘
            ┌──────────────────────────────────────┐
            │  Unit: business logic, state machines  │  thousands, every commit
            └──────────────────────────────────────┘
```

The two layers in the middle (privacy/consent invariants, hostile-family review) are the **product-specific** layers most generic test plans omit.

## 2. Unit tests

Standard. Aim for ≥80% coverage on business logic modules; less on glue code.

Specific unit-test classes that matter:
- **State machines** — every valid and invalid transition, every state's side effects, every guard.
- **Consent decision function** — the truth table from [05_PERMISSION_MATRIX](05_PERMISSION_MATRIX.md) §6 implemented as a parameterized test.
- **Message variant selection** — every relationship type × event type → expected variant.
- **Family graph traversal** — biological vs social separation; alert routing per relationship class.
- **OCR/LLM extraction validators** — schema enforcement, null-handling, confidence threshold filtering.
- **Audit log writers** — every transition produces an entry with the required fields.

## 3. Integration tests

Per service and across service boundaries. Run on every PR. Specific scenarios:
- Invite → accept → grant active → recipient reads record → revoke → recipient denied (full lifecycle).
- Document upload → OCR → extraction stage → user accepts → record promoted → appears in trends.
- Wearable connect → first sync → samples stored → daily aggregate computed → appears on Home.
- Alert composed → preview → queued → undo within 60s → no delivery.
- Co-manager action proposed → approval → action executes → audit on profile.
- Consent revocation propagates from API node A to read attempt on API node B within 1 second.

## 4. Privacy / consent invariants (the most important layer)

These are **property-based tests** asserting universal truths. Run on every PR with random sample sizes; nightly with larger samples.

### 4.1 Universal access invariants

Property: **No actor can read a resource they have no active consent for.**
- Generate random (actor, target, resource, purpose) tuples.
- Apply random consent grants and revocations.
- Assert: every successful read has a matching active grant covering category and purpose.
- Assert: every denied read has no matching active grant (or matches an expiration / revocation that explains denial).

Property: **Highly Sensitive resources require per-entry grants.**
- Generate random Highly Sensitive entries.
- Generate random preset-derived grants.
- Assert: no preset-derived grant authorizes a read of a Highly Sensitive entry.

Property: **Revocation is effective within 5 seconds across all API nodes.**
- Run a test that, after revocation, polls reads from N concurrent clients for 5 seconds.
- Assert: zero reads after revocation_at + 5s succeed.

Property: **The hereditary alert variant for non-biological recipients never contains genetic-relevance language.**
- Generate random alerts with mixed recipient types.
- Assert: rendered message variant for adopted/social recipients does not contain disallowed phrases (e.g., "your screening", "you may be at risk", "genetic", "inherited").

Property: **Adopted/biological status leakage check.**
- For any read by a recipient, the response payload must not include the user's `biological_link` flag for relationships other than those specifically shared.
- Generate random combinations; assert payload schema.

Property: **Disclosure mode is honored end-to-end.**
- For each disclosure mode, generate the rendered alert.
- Assert: Anonymous → no sender name appears anywhere in the recipient's view.
- Assert: Relationship-only → no sender name; only relationship label.
- Assert: Identified → sender name and relationship.

Property: **Push payload contains no medical content.**
- Generate random alerts.
- Assert: serialized push payload string never contains any condition name, medication name, lab value, or document title.

Property: **Audit log completeness.**
- For every state machine transition, an audit entry exists with the required fields.
- For every record read by any actor, an audit entry exists.
- Use a sampling proxy: hook every database query that reads a sensitive table and assert audit was written in the same transaction.

### 4.2 Family graph invariants

Property: **A "private" relationship is invisible to other family members.**
- For any relationship marked private, no query by any other family member should return it.
- Generate random graphs with private edges; assert.

Property: **Hereditary alert routing uses biological graph only.**
- For any hereditary alert, the recipients selected via auto-suggest are exactly those reachable in the biological subgraph at the relevant relationship distance.

Property: **Two-key approval is required for the listed sensitive actions on co-managed profiles.**
- For each sensitive action defined in [09_PEDIATRIC_AND_PROXY](09_PEDIATRIC_AND_PROXY.md) §3.3:
- Attempting the action without sufficient approvals must be rejected and audited.

### 4.3 Data integrity invariants

Property: **Documents are never silently modified by extraction.**
- For any document, the stored bytes hash matches its original at any point in time.

Property: **Source provenance is preserved on every record.**
- Every record has a non-null `source` field with one of the allowed values.

Property: **Versioning preserves history.**
- Edits never lose old versions; versions are reconstructable from history.

## 5. End-to-end tests

The 25 critical flows. Run nightly across both surfaces (mobile via Detox/Maestro, web via Playwright).

| # | Flow |
|---|---|
| 1 | First-run onboarding (mobile) |
| 2 | Add manual relative (deceased) |
| 3 | Add manual relative (living, no invite) |
| 4 | Generate invite, send, recipient accepts, both see grant |
| 5 | Generate invite, recipient declines |
| 6 | Generate invite, expires, regenerate |
| 7 | Daily check-in |
| 8 | Document scan + OCR review + accept |
| 9 | Document scan + OCR returns nothing + still saved |
| 10 | Connect Apple Health, first sync |
| 11 | Send hereditary alert with mixed recipient types |
| 12 | Send alert + undo within 60s |
| 13 | Send alert + recall within 24h |
| 14 | Recipient receives alert, marks acknowledged |
| 15 | Share emergency profile with spouse |
| 16 | Reduce access from Care bundle to Emergency |
| 17 | Revoke access entirely |
| 18 | Doctor packet build + export PDF (web) |
| 19 | Audit log review and export (web) |
| 20 | Co-managed minor profile sensitive action with two-key approval |
| 21 | Co-managed minor profile sensitive action declined |
| 22 | Age-of-majority handoff |
| 23 | Caregiver succession activation |
| 24 | Account deletion + 30-day reversal |
| 25 | Account compromise → sign out everywhere |

Each E2E test must include negative assertions (e.g., flow 11 asserts the adopted recipient does NOT see genetic-relevance copy).

## 6. Adversarial / red team tests

Run before every major release. Specifically test:

### 6.1 Consent engine adversarial
- Bypass attempts: malformed grants, replay of expired grants, token reuse across users.
- Time-of-check-time-of-use: revoke after grant validation but before resource fetch — assert fetch fails.
- SQL injection / NoSQL injection / GraphQL query depth.
- IDOR (Insecure Direct Object Reference): attempt to read records by guessing IDs.

### 6.2 Family graph adversarial
- Craft an invite token signed by a different account.
- Modify relationship type post-acceptance to escalate (assert old type's audit preserved).
- Attempt to add the same person as biological by user A and adopted by user B; assert no leakage.

### 6.3 Alert adversarial
- Modify recipient list after preview, before send (assert refused — recipients locked at preview).
- Inject content into "personal note" that includes other recipients' names (assert sanitized).
- Push payload inspection: capture every push during a test session; assert no medical content.

### 6.4 Document adversarial
- Upload a document with embedded JavaScript or active content; assert sanitized.
- Upload a malicious file masquerading as a PDF; assert detected and rejected.
- OCR of a document containing what looks like a medical record but with adversarial values (e.g., "HbA1c: <script>"); assert sanitized.

### 6.5 Authentication adversarial
- Phishing simulation: ensure email and push copy doesn't enable common phishing patterns.
- Recovery-contact pretexting: simulate a coercive recovery attempt; assert 24h delay enforced and victim is notified.
- Session hijack: tamper with a session token; assert rejected and security event raised.

## 7. Hostile-family review (manual, scripted)

Before any release of a flow that affects family relationships, sharing, or alerts, run a "hostile-family" review checklist on the new flow:

1. Could a coercive partner monitor the user via this flow?
2. Could this flow leak the user's sensitive entries to family they didn't intend?
3. Does revocation in this flow notify a third party in a damaging way?
4. Does this flow assume only-one-user-per-device?
5. Is the safest exit accessible in 3 taps?
6. If a screenshot of this flow ended up on Twitter, would we be embarrassed?
7. Does the AI-generated content in this flow include anything diagnostic?
8. Does the message preview match the actual delivered message?
9. Does the audit log capture this flow's actions?
10. Is the recipient's experience as carefully designed as the sender's?

A senior PM or design reviewer signs off this checklist for each flow, in writing, in PR. Flows fail this review more often than expected — that's the point.

## 8. Accessibility tests

Automated:
- Axe / pa11y on every web screen.
- React Native Accessibility Testing on mobile.
- Color contrast linter in design tokens.

Manual (per release):
- Every critical flow walked through with VoiceOver and TalkBack.
- Every form completable via keyboard only on web.
- Dynamic Type / font scaling tested at 200%.

## 9. Localization tests

When second language ships:
- All user-facing strings in translation memory.
- Visual regression tests at the longest-string locale (often German / Russian).
- Right-to-left layout tests when Arabic ships.
- Date / number / unit formatting per locale.

## 10. Performance budgets

| Metric | Budget |
|---|---|
| App cold start (mobile) | <2s on midrange Android, <1.5s on iPhone 12+ |
| Login → Home time | <1s after biometric on warm start |
| Consent decision latency | <50ms p95 |
| Record read (single) | <200ms p95 |
| Document upload to staging | <5s for 5MB on LTE |
| OCR + extraction completion | <60s for 5MB single-page lab |
| Wearable delta sync | <10s |
| Doctor packet PDF generation (web) | <8s |
| Push notification fan-out (10 recipients) | <2s end-to-end |

Performance regressions ≥20% break CI.

## 11. Data-loss / data-integrity tests

- Backup + restore cycle: random user data, backup, wipe, restore; assert byte-identical recovery.
- Migration tests: every schema migration tested forward and backward against representative data.
- Soft-delete reversal: 30-day window respected; restore returns identical state.
- Hard-delete: remaining audit scaffolding contains no PHI.

## 12. AI / LLM-specific tests

The AI surfaces (summaries, extraction, Q&A) require their own test layer:

- **Refusal tests**: a battery of "can you diagnose this?" prompts, each must be refused with the standardized routing copy.
- **Hallucination tests**: golden datasets of medical documents with known ground truth; extraction accuracy ≥ threshold; null-rate on uncertain fields ≥ threshold.
- **Provenance tests**: every AI-generated string carries provenance back to source records.
- **Consent-respecting tests**: AI never includes Highly Sensitive entries in summaries unless explicitly enabled.
- **Tone tests**: a battery of generated summaries scored against the voice rules (no diagnosis, no judgment, source-labeled).

## 13. Security tests

Per [10_MVP_BUILD_SEQUENCE](10_MVP_BUILD_SEQUENCE.md) cross-functional security track:
- Penetration testing per major area (auth, consent, invite, alerts, exports, wearable).
- Static analysis on every PR (Semgrep, eslint security rules).
- Dependency vulnerability scanning daily.
- Secret scanning pre-commit and in CI.
- Container scanning.
- Threat model review per quarter.

## 14. What we never ship

A release is blocked if any of the following is true:
- A critical-tier privacy invariant test fails.
- A hostile-family review checklist item is unanswered.
- A wrong-recipient-routing bug is open.
- An audit log gap is open.
- A push payload contains medical content in any test.
- The AI surfaces produce a diagnosis in any tested scenario.
- An accessibility AA failure is unresolved on a critical surface.

## 15. Test data and PHI handling in tests

- Test environments use synthetic data only. No production PHI in dev or staging.
- Synthetic data is realistic enough to exercise edge cases (Unicode names, very long medication lists, deceased relatives, blended families, multiple guardians).
- Test fixtures versioned and seedable.

## 16. Continuous chaos (post-MVP)

Once stable:
- Monthly "consent chaos" exercise: random revocations across the staging system; assert reads stop.
- Monthly "family chaos": random relationship modifications; assert hereditary alert routing remains correct.
- Quarterly disaster recovery: full region failover.
