# FAMILIA — MVP Build Sequence

The original roadmap defines what an MVP is. This doc defines **how to build it** — week by week, sprint by sprint, with acceptance criteria for each story. The target: a closed beta with 50 families by **week 24**, ready for an open beta by week 32.

The build assumes the small team described in [09_MVP_ROADMAP](../initial%20idea%20docs/09_MVP_ROADMAP.md): 1 full-stack, 1 mobile, 1 backend/data, 1 designer, plus part-time security/clinical/legal advisors. Cross-functional tracks (design, content, legal/privacy) run in parallel.

---

## Sprint 0 — Foundations (Week 0, 1 week)

**Goal**: nothing user-visible. Set the table.

| Track | Deliverable |
|---|---|
| Eng | Monorepo (mobile + web + backend), CI/CD, infra-as-code in dev, secrets management, cloud accounts (US-East and EU-West regions ready), KMS, observability stack, error tracking |
| Eng | Skeleton React Native app + Next.js web app + Node/Postgres backend deployed to dev |
| Eng | Design system bootstrap (tokens, type, color, components shell — see Linear/Radix/shadcn baseline) |
| Design | Design system v0 (Figma library, color tokens, type scale, accessibility baseline) |
| Content | Voice doc finalized → seed copy library |
| Legal | Privacy policy v0 draft, terms v0 draft, BAA template kept on file (not yet signing) |
| Security | Threat model v0 (using [08_TRUST_AND_SAFETY](08_TRUST_AND_SAFETY.md)) |

**Exit**: dev environment is reachable, CI green, design system installed in both apps, legal docs in draft.

---

## Sprint 1–2 — Identity & Health Profile CRUD (Weeks 1–4)

**Goal**: a user can create an account, secure it, and add their basic health info on both mobile and web.

### Stories
- As a new user, I can sign up with email + OTP, set a name and DOB, set up biometric/PIN unlock, and accept the privacy promise.
- As a returning user, I can sign in with biometric or PIN, recover with email + recovery code, and review my active sessions.
- As a user, I can enable MFA (TOTP and passkey).
- As a user, I can enter conditions, medications, allergies, immunizations, and lifestyle basics with full CRUD on both surfaces.
- As a user, I can edit my emergency profile.
- As a user, I can view a basic timeline of my own entries.

### Acceptance criteria (excerpts)
- Given a new user completes onboarding, then they have an account, an unlock method, an emergency profile (possibly empty), and an explicit privacy-promise acknowledgment.
- Given a user adds a medication on mobile, then it appears on web within 5 seconds.
- Given a user enables MFA, then a sign-in from a new device requires both password and the MFA factor.
- Given a user attempts to delete their account, then a 30-day soft-delete is in effect with a clear restore path.

### Cross-functional
- Design: onboarding screens, all CRUD forms, empty states, voice-and-tone applied
- Content: error messages, sensitive-tier confirmation copy
- Legal: privacy promise screen copy approved
- Security: pen test of auth flow

### Risks
- Biometric integration on Android (Fingerprint API + Biometric Prompt nuance) — allow extra time
- OTP delivery reliability — pick provider with good multi-region support

---

## Sprint 3–4 — Family Graph + Invite (Weeks 5–8)

**Goal**: a user can build a family tree (manually for now, with invites for living relatives), with biological/social distinction.

### Stories
- As a user, I can add a relative manually (deceased or living, biological / adoptive / step / foster / guardian / custom).
- As a user, I can generate a 10-minute single-use invite link, send it via SMS or email, and see when it's accepted.
- As an invitee, I can accept an invite (with or without an existing account), confirm the relationship, modify proposed sharing, and complete onboarding.
- As a user, I can view my family tree (list view on mobile, simple tree visualization on web — node-link diagram is full Sprint 7).
- As a user, I can edit or remove a relationship.
- As a user, I can mark a relationship as "private — not visible to other family members."

### Acceptance criteria (excerpts)
- Given a user generates an invite, when more than 10 minutes pass, then the link is invalid.
- Given an invitee accepts, then both parties have the relationship and bidirectional consent grants per their agreed scope.
- Given a user marks a relationship private, then no other family member sees that the relationship exists in the user's tree.
- Given a user adds a deceased relative, then no invite or alert option appears.

### Data model snapshot
- `family_relationships` table with fields: `id`, `user_id`, `related_user_id (nullable for ghost profiles)`, `related_profile_ghost_id (nullable for accounts)`, `relationship_type`, `social_role`, `biological_link (boolean + confidence)`, `visibility`, `created_at`, `created_by`, `verified_at`, `disputed_at`
- For MVP: PostgreSQL with recursive CTEs is fine for graph queries up to ~1000 nodes per user. Move to Neo4j when this becomes a bottleneck (likely Sprint 12+).

### Risks
- Invite link security: short TTL, single-use, signed token. Pen test before Sprint 5 ships.
- Ghost profile dedupe: when a user adds a manual ghost (deceased dad), and a sibling later joins and references the same person — dedupe gracefully (later sprint).

---

## Sprint 5–6 — Consent Engine + Sharing Presets (Weeks 9–12)

**Goal**: the user can share with a relative using meaningful defaults and revoke at any time, and access to records is enforced through the consent engine.

### Stories
- As a user, when I add or invite a relative, I can choose a sharing preset (None / Emergency / Care bundle / Full record / Custom).
- As a user, I can view all active grants in a single screen, with what's shared, with whom, when, and for how long.
- As a user, I can revoke any grant, and the recipient loses access within 5 seconds.
- As a user, I can pause all sharing in one tap.
- As a user, I can mark a category as Sensitive or Highly Sensitive, raising sharing friction.
- As a recipient, I can see what's been shared with me (per relative whose data I can view).
- All record-read endpoints validate via the consent engine before returning data.

### Acceptance criteria (excerpts)
- Given a Care bundle grant, when the recipient requests a psych note (Highly Sensitive), then the engine returns a denial with audit.
- Given a revoked grant, when the recipient queries within 5 seconds of revocation, then they receive denial.
- Given a Sensitive category, when sharing is initiated, then the user must complete a two-step confirmation.
- Given the user's audit log, when reviewed, then every read by every actor is visible with timestamp, resource, and decision.

### Cross-functional
- Design: permission designer, person detail, audit log explorer (web)
- Content: sensitive confirmation copy, all preset descriptions in plain English
- Legal: review consent text and audit-log export format
- Security: red team the consent engine with abuse scenarios from [08_TRUST_AND_SAFETY](08_TRUST_AND_SAFETY.md)

### Risks
- Consent engine performance under load — engine evaluation must be cached but invalidate on revocation events. Aim for <50ms p95.
- Bug in engine = privacy breach. This sprint requires the most testing, including chaos testing of revocation propagation.

---

## Sprint 7–8 — Document Vault + Manual Labs (Weeks 13–16)

**Goal**: the user can upload and review documents; OCR + extraction is staged for review; lab values can be added manually.

### Stories
- As a user, I can scan a document with my phone camera (auto-edge detection, multi-page) and upload to the vault.
- As a user, I can upload a file (PDF, JPG, PNG) on web with drag-and-drop.
- As a user, I receive a notification when OCR + extraction is ready to review.
- As a user, I can review extracted fields side-by-side with the original and accept, edit, or reject each.
- As a user, I can add a lab result manually.
- As a user, I can view a lab trend (e.g., HbA1c over time) on web.
- As a user, I can attach a document to a specific encounter or condition.
- As a user, I can also visualize the family tree on web (node-link diagram, drag-rearrange, hide categories).

### Acceptance criteria (excerpts)
- Given a 1-page lab PDF uploaded on mobile, then OCR + extraction completes in under 60 seconds for files <5MB.
- Given a multi-page document, when uploaded, then it is stitched into a single PDF and stored encrypted.
- Given an extracted lab the user accepts, then it appears in lab trends within 5 seconds with provenance `ocr_extracted_reviewed`.
- Given a document with no recognizable extraction, then it is still saved and searchable, with no failure visible to the user beyond an extraction-unavailable note.

### Cross-functional
- Design: vault, scan flow, OCR review side-by-side, lab trends, web tree
- Content: document type chips, extraction confidence labels
- Legal: document storage policy review

### Risks
- OCR accuracy varies wildly across labs. Plan for ~70% acceptable accuracy at MVP; user review is the trust bridge.
- LLM extraction hallucinations — tighten prompts, validate via JSON schema, leave fields null if unsure.
- Cost of OCR + LLM extraction. Budget ~$0.10–0.25 per document at this stage. Cache.

---

## Sprint 9–10 — Check-ins + AI Summary v1 + Alert Engine v1 (Weeks 17–20)

**Goal**: the user has a daily/weekly/monthly check-in and a weekly AI summary; users can send context-aware alerts to family with multi-recipient preview.

### Stories
- As a user, I can complete a daily check-in in under 60 seconds.
- As a user, I can complete a weekly check-in (Sundays prompt) and a monthly review.
- As a user, every Sunday I receive an AI weekly summary that uses my own data, respects my consent settings, and labels provenance.
- As a user, I can ask a one-shot question of my data ("what was my last A1c?") and get a grounded answer from the AI digital twin (basic RAG over user's own data).
- As a user, I can send a context-aware alert to family members with multi-recipient preview, disclosure mode, and 60s undo + 24h recall.
- As a recipient, I can view alerts in my inbox with the message variant approved by the sender.
- As a sender, I can see delivery status (delivered, opened, acknowledged).

### Acceptance criteria (excerpts)
- Given a daily check-in, when started, then it can be completed in under 60 seconds with all required inputs being optional except a single overall rating.
- Given a hereditary alert with mixed recipient types, when reaching preview, then biological and non-biological recipients see different message variants.
- Given an alert sent, when within 60 seconds the user taps Undo, then no recipient is delivered.
- Given the AI summary is generated, then every claim is provenance-labeled (wearable / check-in / lab / etc.).
- Given a recipient on a "do not alert" list, then they never appear in the picker.
- Given the AI is asked a clinical question ("do I have cancer?"), then it refuses to interpret and routes to professional consultation copy.

### Cross-functional
- Design: check-in UX, weekly summary card, alert flow with preview
- Content: every message variant from [04_VOICE_AND_TONE](04_VOICE_AND_TONE.md) instantiated; AI tone settings
- Clinical advisor: review summary template and alert message library
- Legal: review AI safety disclaimers

### Risks
- AI summary quality: LLMs can confabulate. Strict RAG with citations only. Hold weekly summaries to 4–6 sentences max.
- Alert delivery race conditions: undo within 60s window must reliably prevent delivery. Use a queue with delayed dispatch, not direct send.
- Message variant routing bug = wrong message to wrong audience = trust breach. Heavy unit and integration testing.

---

## Sprint 11–12 — Wearable Import + Audit Log + Export PDF (Weeks 21–24)

**Goal**: wearable data flows into the app; audit log is fully exposed; users can generate doctor packets.

### Stories
- As an iOS user, I can connect Apple HealthKit and pull heart rate, HRV, sleep, steps, workouts, and blood oxygen from the last 90 days, then continuously thereafter.
- As an Android user, I can connect Google Health Connect with the same scope.
- As a user, I can see my wearable data on Home (today) and on Insights (trends).
- As a user, I can view my full audit log on web with filtering by actor, target, action, and date range.
- As a user, I can export my audit log as CSV.
- As a user, I can generate a doctor visit packet (web): pick whose profile (own or co-managed), pick a specialty, AI proposes contents, I edit, preview, and export PDF.
- As a user, I can save a packet template to re-run for the next visit.

### Acceptance criteria (excerpts)
- Given a connected Apple HealthKit, when the app opens, then a delta sync completes within 10 seconds.
- Given a generated PDF packet, then it includes a watermark with my name and the export timestamp, and an audit log entry exists.
- Given the audit log on web, then the user can filter by date and see every read of every record by every actor in the last 90 days, with the option to export.
- Given a re-run packet template, then it produces an updated PDF with new data without re-asking the user about contents (unless they edit).

### Cross-functional
- Design: wearable connection screens, trends, audit log explorer, packet builder
- Content: wearable consent copy, packet cover note templates
- Legal: audit log retention policy review (state-by-state HIPAA timing)

### Risks
- Wearable APIs throttle. Build with backoff + observability.
- Initial sync of 90 days of data can be hundreds of thousands of samples — chunk and progress visibly.
- PDF generation at scale needs a worker queue (don't block the API).

---

## Beta tracks (Weeks 21–32)

### Closed beta — week 24
- 50 families recruited (mix of personas: at least 5 each of Maya, David, Rosa, Jordan, Marcus, Robert).
- In-product feedback channel.
- Direct support.
- Weekly observation sessions.
- All core flows from [03_TASK_FLOWS](03_TASK_FLOWS.md) working end-to-end.

### Open beta — week 32
- 500–1000 users.
- Self-service support.
- Public-facing privacy policy and terms.
- App Store submission (mobile) and SOC 2 readiness review (eng).

## What is **NOT** in the first 24 weeks

Explicitly **not in MVP**:
- DNA import or discovery (Phase 4 — Q3)
- FHIR provider import (Phase 3 — Q2 next year, but architectural scaffolding ready)
- Caregiver succession activation flows beyond manual user-initiated grants
- Two-key approval for all sensitive changes (basic two-step confirm yes; full two-key for sensitive shares: Sprint 13–14)
- Third-party clinician portal
- Shared calendaring
- Medication reminders with refill tracking (Phase 3)
- Watch-app companion (Apple Watch native UI)
- Web Tablet-optimized layouts
- Multi-language (English + Spanish recommended at open beta; see [11_OPEN_QUESTIONS](11_OPEN_QUESTIONS.md))
- Insurance integrations (never in MVP)
- Employer wellness integrations (not year one)

## Cross-functional tracks running throughout

### Design track
- Sprint 0: design system v0
- Sprints 1–2: onboarding, profile CRUD
- Sprints 3–4: family graph, invite UX
- Sprints 5–6: permission designer, audit explorer
- Sprints 7–8: vault, scan, OCR review, web tree
- Sprints 9–10: check-ins, alert preview, AI summary card
- Sprints 11–12: wearable, packet builder
- Continuous: voice/tone enforcement, accessibility audits

### Content track
- Sprint 0: voice doc finalized
- Sprints 1–12: copy library expansion in lockstep with each sprint's surfaces
- Sprint 11–12: localization-readiness for English + Spanish

### Legal / Privacy track
- Sprint 0: drafts of privacy policy, terms, data-processing addendum
- Sprints 5–6: consent legal review
- Sprints 9–10: AI safety disclaimers, alert legal review
- Sprints 11–12: export legal review, audit log retention spec
- Sprint 13+: HIPAA readiness review

### Security track
- Sprint 0: threat model
- Sprint 2: pen test of auth
- Sprint 6: pen test of consent engine + invite flow
- Sprint 10: pen test of alert flow
- Sprint 12: pen test of export + wearable
- Sprint 14: SOC 2 readiness assessment

### Clinical advisory
- Sprint 9: review AI summary tone, ensure no diagnostic language
- Sprint 10: review alert message library
- Sprint 12: review packet templates by specialty

## Definition of done — at every sprint

- All stories meet acceptance criteria.
- All copy reviewed against [04_VOICE_AND_TONE](04_VOICE_AND_TONE.md).
- All sensitive surfaces reviewed against the "hostile family" check in [08_TRUST_AND_SAFETY](08_TRUST_AND_SAFETY.md).
- Accessibility: WCAG 2.1 AA on all new screens (color contrast, focus order, touch target size, screen reader labels).
- Audit log entries written for every record-touching action.
- Tests: unit coverage for new modules ≥80%, integration tests for cross-service flows.
- Documentation updated: API docs for any new endpoints, onboarding doc for any new feature.
- Security: no new high or critical findings from the static scanner.
- A real user (someone outside the team) walked through the new flow.

## Success metrics for closed beta (week 24 → week 32)

| Metric | Target |
|---|---|
| Onboarding completion | ≥75% reach Home |
| First check-in within 7 days | ≥60% |
| First family member added within 14 days | ≥40% |
| First document uploaded within 14 days | ≥35% |
| Wearable connected within 21 days | ≥50% |
| Weekly active families (≥1 user per family active in past 7 days) | ≥60% in week 32 |
| Privacy-related support contacts per 100 users per week | <5 |
| Critical defect rate (data leak, wrong recipient) | 0 |
| User trust survey: "I feel I can control who sees my health data" | ≥4.3/5 |
