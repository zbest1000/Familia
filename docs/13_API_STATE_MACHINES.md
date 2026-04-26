# FAMILIA — API State Machines

The trickiest flows in FAMILIA are not CRUD — they are stateful, multi-party, time-bound, and security-critical. This doc specifies state machines for the four flows where ambiguity becomes risk: **invite**, **consent grant**, **alert delivery**, and **co-managed profile transitions**.

Each machine is given as a state diagram (in prose), with valid transitions, the events that trigger them, and the side effects (audit, notifications, downstream state) each transition entails.

> Implementation note: each machine should be implemented as a typed state in the backend (e.g., XState or a hand-rolled discriminated union in TypeScript), with persisted current state, transitions logged, and invalid-transition attempts rejected and audited.

---

## 1. Invite lifecycle

A family invite has a short, security-critical lifecycle.

### States
- `created` — token generated, not yet delivered
- `pending` — link delivered, awaiting recipient
- `expired` — 10 minutes elapsed without acceptance
- `consumed_pending_acceptance` — recipient opened the link, viewing the proposal
- `accepted` — recipient confirmed the relationship and proposed sharing scope
- `declined` — recipient explicitly declined
- `revoked` — sender revoked before acceptance
- `errored` — system error rendered the invite unusable

### Valid transitions

```
created → pending (on send)
created → revoked (sender cancels before send)
created → errored (system fail at issuance)

pending → consumed_pending_acceptance (recipient opens link)
pending → expired (TTL exceeded)
pending → revoked (sender cancels)

consumed_pending_acceptance → accepted (recipient confirms)
consumed_pending_acceptance → declined (recipient declines)
consumed_pending_acceptance → expired (TTL exceeded mid-review)
consumed_pending_acceptance → revoked (sender cancels)
```

### Invariants
- Single-use: a token can move from `pending → consumed_pending_acceptance` only once. Subsequent attempts get a `consumed` error.
- TTL: enforced in two places — token signature includes expiry; server re-checks at every transition.
- Sender-bound: the token is signed with the sender's account at issuance; cannot be used to invite to a different sender's tree.
- Audit: every transition writes an entry on both sides (sender + recipient if known) once recipient identity is established. Pre-acceptance, only sender side.

### Side effects per transition

| Transition | Side effects |
|---|---|
| `created → pending` | Token issued, audit (`invite_sent`), push to sender on state changes |
| `pending → expired` | No notification by default (sender can opt in); audit |
| `pending → consumed_pending_acceptance` | Audit; sender notified "Elena opened your invite" (optional, off by default) |
| `… → accepted` | Family graph edge created; bidirectional consent grants per agreed scope; audit on both sides; notifications to both |
| `… → declined` | Audit; sender notified neutrally ("Elena chose not to connect right now") |
| `… → revoked` | Audit; recipient (if known) notified neutrally ("[Sender]'s invite was withdrawn") |

### Error handling
- Network failure on send → invite stays in `created`; sender can retry without regenerating.
- Recipient device crash mid-acceptance → token still in `consumed_pending_acceptance`; recipient can re-open if TTL allows; otherwise `expired`.

---

## 2. Consent grant lifecycle

A consent grant is the unit of "what the recipient can see." It is a longer-lived object than an invite.

### States
- `proposed` — created during invite or modify-grant flow, awaiting both-party confirm if reciprocal
- `active` — both parties confirmed (or one-way grant with grantor confirm)
- `paused` — temporarily inactive (user paused all sharing or specific grant)
- `expired` — time-bound grant past its window
- `revoked` — grantor explicitly revoked
- `superseded` — replaced by a newer grant covering same recipient + scope

### Valid transitions

```
proposed → active (confirmation complete)
proposed → declined (recipient refused)
proposed → expired (proposal not acted on within timeout — default 30 days for proposed grants)

active → paused (grantor pauses)
active → expired (TTL hit)
active → revoked (grantor revokes)
active → superseded (new grant covers same scope)

paused → active (grantor unpauses)
paused → revoked (grantor revokes from pause)
paused → expired (TTL hit during pause — pause does not extend TTL)
```

### Invariants
- A grant always references: `grantor_user_id`, `recipient_user_id`, `scope` (list of categories), `purpose`, `disclosure_mode_default` (alerts), `time_bounds`, `consent_terms_version`, `created_at`, `created_via` (preset / custom / migrated)
- Highly Sensitive scope is non-transitive: a grant covering Highly Sensitive cannot be derived from a preset; it must be a per-entry grant with explicit confirmation.
- Re-confirmation: grants of certain types require periodic re-confirmation (see §10 of [05_PERMISSION_MATRIX](05_PERMISSION_MATRIX.md)). On re-confirmation cadence hit, system generates a new grant replacing the old (`superseded` transition).

### Side effects per transition

| Transition | Side effects |
|---|---|
| `proposed → active` | Recipient gains scoped read access immediately; audit on both sides; notification to recipient |
| `active → paused` | Recipient loses access within 5 seconds; recipient sees "[Grantor]'s sharing is paused" (neutral); audit |
| `paused → active` | Recipient regains access within 5 seconds; audit |
| `active → revoked` | Recipient loses access within 5 seconds; recipient sees only "[Grantor]'s access settings changed"; audit; consent engine cache invalidated |
| `active → expired` | Same UX as revoked but with a "your access expired" message to recipient; sender sees expiration in their grant list |
| `active → superseded` | New grant takes over; old grant retained in audit history; recipient may see scope change in their UI |

### Atomicity
- Revocation must be atomic: at the moment of revocation, ALL in-flight reads using the old grant must fail at the consent engine. Implement via a revocation timestamp; consent engine checks `read_initiated_at >= grant.revoked_at_or_now()`.

### Audit fields per grant access
Per [05_PERMISSION_MATRIX](05_PERMISSION_MATRIX.md) §8.

---

## 3. Alert lifecycle

The most carefully audited flow in the product.

### States
- `drafting` — being composed
- `previewing` — recipient preview rendered, awaiting sender approval
- `queued` — approved by sender, in 60-second undo window
- `sent` — delivered (or being delivered) to recipients
- `recalled` — sender recalled within 24 hours
- `expired_recall_window` — 24h elapsed without recall
- `partially_delivered` — some recipients received, some failed (with retry)

### Valid transitions

```
drafting → previewing (sender clicks Preview)
drafting → cancelled (sender backs out)

previewing → drafting (sender edits)
previewing → queued (sender approves)

queued → sent (60s undo elapsed and delivery initiated)
queued → drafting (sender hits Undo within 60s)

sent → partially_delivered (some recipient deliveries fail)
sent → recalled (sender recalls within 24h)
sent → expired_recall_window (24h elapsed without recall)

partially_delivered → sent (retry succeeds)
partially_delivered → recalled (sender recalls)
```

### Per-recipient sub-state
Each recipient has its own delivery sub-state under `sent` and onward:

```
recipient_pending → recipient_delivered → recipient_opened → recipient_acknowledged
                  ↘ recipient_failed (retry queue)
                  ↘ recipient_blocked (recipient muted sender)
recipient_delivered → recipient_recalled (sender recalls)
```

### Invariants
- The push payload contains zero medical content.
- Each recipient sees the message variant chosen for their relationship class (no leakage across classes).
- If the alert is `hereditary_risk` and a recipient is not in the biological graph, they receive the support/awareness variant — never the genetic variant.
- A recipient on the sender's "do not alert" list is excluded at the picker stage (never reaches `recipient_pending`).
- Delivery to recipients in sender's quiet-period skips push but writes inbox.

### Side effects per transition

| Transition | Side effects |
|---|---|
| `previewing → queued` | Audit (`alert_approved`), recipient list locked, message variants finalized and hashed |
| `queued → sent` | Per-recipient delivery jobs created with backoff; push notifications sent (zero-content); inbox entries created |
| `queued → drafting` (undo) | Delivery jobs cancelled; alert returns to draft state with all data intact; audit (`alert_undone`) |
| `sent → recalled` | Recipients' inbox entries marked recalled with neutral copy; pushes already delivered cannot be unsent (we are honest about this); audit (`alert_recalled`) |
| `recipient_delivered` | Recipient inbox + push (zero-content); audit |
| `recipient_opened` | Sender sees opened indicator; audit |
| `recipient_acknowledged` | Sender sees acknowledged indicator; audit |
| `recipient_recalled` | Recipient inbox entry marked recalled with explanatory note; audit |

### Hashed message persistence
For audit, every per-recipient message variant is hashed (SHA-256 of canonical content) and stored. The full content is also stored for the recipient's inbox view, but the hash provides tamper-evidence: "the message I approved is the message that was delivered."

### Failure modes
- Delivery service down → alert remains in `sent` state with `partially_delivered` sub-state per recipient; retry with exponential backoff (1m, 5m, 15m, 1h, 4h); after 24h, mark recipient `failed_permanent` and surface in sender's view.
- Sender device offline at queued → undo window starts when device next syncs; this is a known degradation we accept (alternative is blocking the queue, which is worse UX).

---

## 4. Co-managed profile transitions

For minor profiles and caregiver-managed profiles. Most transitions go through a 72-hour two-key approval queue.

### Co-manager state
- `inactive` — designated but not yet active (succession plan)
- `pending_acceptance` — invited but not yet accepted by the candidate
- `active` — full co-management
- `paused` — temporarily suspended (e.g., during legal dispute)
- `removed` — formally removed from co-management

### Sensitive-action states (per pending action)
- `proposed` — one co-manager initiated
- `awaiting_approval` — others must approve within 72 hours
- `approved` — all required co-managers approved; action proceeds
- `declined` — one or more co-managers declined; action does not proceed
- `expired` — 72 hours elapsed without sufficient approvals
- `cancelled` — proposer cancelled

### Valid transitions (co-manager state)

```
inactive → active (succession activated; verification required)
pending_acceptance → active (candidate accepts)
pending_acceptance → declined (candidate declines)
pending_acceptance → expired (no response within 7 days)

active → paused (legal dispute, status quo lock)
active → removed (with appropriate approval per profile rules)

paused → active (dispute resolved)
paused → removed (resolution removes co-manager)
```

### Valid transitions (sensitive action)

```
proposed → awaiting_approval (auto, when other co-manager(s) exist)
proposed → approved (auto, if no other approval needed for this action type)

awaiting_approval → approved (sufficient approvals)
awaiting_approval → declined (one decline = blocks action)
awaiting_approval → expired (72h no response from required approvers)

(any) → cancelled (proposer cancels before resolution)
```

### Invariants
- The list of "sensitive actions requiring two-key" is defined in [09_PEDIATRIC_AND_PROXY](09_PEDIATRIC_AND_PROXY.md) §3.3.
- A co-manager cannot remove another co-manager unilaterally for an active profile — always two-key or court documentation.
- A co-manager removal that would leave the profile with zero co-managers (orphaning a minor) is blocked; transition workflow per [09](09_PEDIATRIC_AND_PROXY.md) §7.4.
- Pre-arranged caregiver succession requires verification (self-activation by the user; medical attestation; legal POA).

### Side effects per transition

| Transition | Side effects |
|---|---|
| `inactive → active` (succession) | All co-managers notified; audit; expanded scope per pre-defined plan |
| `pending_acceptance → active` | Profile gains a co-manager; audit on profile and on candidate's account |
| `active → paused` | Sensitive actions block; reads continue; audit |
| `proposed → awaiting_approval` | Each required approver receives a push + email + persistent badge in their queue |
| `… → approved` | The underlying action executes; all co-managers notified; audit |
| `… → declined` | Proposer notified; audit; action does not execute |
| `… → expired` | Proposer notified; audit; action does not execute (default deny) |

---

## 5. Cross-cutting: audit log entries

Every state machine transition writes an audit entry with:
- `event_id` (UUID)
- `event_type` (e.g., `invite.accepted`, `consent.revoked`, `alert.recalled`, `comanager.action_approved`)
- `subject_id` (the entity whose state changed: invite_id, grant_id, alert_id, profile_id)
- `actor_user_id` (who caused the transition; nullable for system-triggered transitions like TTL expiry)
- `target_user_id` (whose data is affected)
- `from_state`
- `to_state`
- `metadata` (JSON: scope changes, message hashes, etc.)
- `policy_version` (current policy version when transition happened)
- `request_source` (mobile app, web app, scheduled job, support tool)
- `client_ip` (when applicable)
- `created_at`

Audit entries are append-only. The user (whose data) can read all entries about themselves. Other actors can read only their own actions.

## 6. Idempotency

All API endpoints supporting state transitions accept an `Idempotency-Key` header. Re-submitting the same request with the same key returns the original response (or current state if the original transition is in progress). This prevents:
- Double-sending alerts on flaky networks
- Duplicate consent grants from retries
- Multi-tap UI causing multiple co-manager approvals

## 7. Implementation notes

- Persist current state in a dedicated column per object; never derive solely from event log (events are for audit, not source of truth for state).
- Use database transactions to make state transitions + side effect writes atomic.
- Background jobs handle TTL expirations: a single sweep every 60 seconds for invites, every 5 minutes for consents/alerts.
- Consent engine cache invalidation on `revoked` / `paused` / `superseded` is the highest-priority signal — propagate via pub/sub to every API node within 1 second.
- Test these state machines exhaustively. They are the surfaces where a bug becomes a privacy breach.

## 8. Test patterns

For each state machine:
- Property-based tests: random sequences of valid events should never end in an invalid state.
- Adversarial tests: attempts at invalid transitions must be rejected and audited.
- Race condition tests: concurrent revocation + read; concurrent two-key approvals; concurrent invite re-use attempts.
- Replay tests: rebuilding state from the audit log should match the persisted state (a check on integrity).
