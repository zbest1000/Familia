# FAMILIA — Open Questions Log

Decisions still required to build. Each entry is a question, the realistic options, the recommended default, the tradeoffs, and which sprint blocks on the answer. Not every question must be answered before Sprint 0 — some can wait. The "Required by" column is the latest sprint that depends on a decision.

## How to use

- Status: `OPEN` (no decision), `DECIDED` (record the call inline), `DEFERRED` (intentionally pushed past MVP).
- Owner: who decides. Most are founder/PM calls; some are eng or legal.
- When a question is decided, edit it in place, change status to `DECIDED`, add date and the chosen option with a one-line rationale.

---

## A. Strategic & launch

### A1. Which jurisdiction first?
- **Status**: OPEN
- **Owner**: Founder / Legal
- **Required by**: Sprint 0 (affects data residency setup)
- **Options**:
  1. **US first** — larger TAM, HIPAA-shaped privacy posture, fewer language requirements.
  2. **EU first** — GDPR alignment from day one becomes a brand asset, smaller initial market.
  3. **Both simultaneously** — most expensive, slowest to ship.
- **Recommended**: US first. We can be GDPR-compliant from day one without launching in EU; EU goes live once we have demand and translation budget.
- **Tradeoffs**: US = HIPAA alignment becomes the bigger compliance investment in year one. EU = a smaller launch market but our privacy posture sells itself there.

### A2. Which languages at open beta?
- **Status**: OPEN
- **Owner**: Founder / PM
- **Required by**: Sprint 11 (translation memory bootstrap)
- **Options**: English-only, English + Spanish, English + Spanish + French
- **Recommended**: **English + Spanish** by open beta. Spanish is the most-requested second language in US healthcare consumer apps.
- **Tradeoffs**: Each additional language doubles content review burden for sensitive copy.

### A3. Initial pricing
- **Status**: OPEN
- **Owner**: Founder / PM
- **Required by**: Sprint 12 (closed beta launches free; open beta needs pricing)
- **Options**: per business doc — $9 individual, $19–29 family, $49 premium family
- **Recommended**: free tier with sensible limits + $9/mo individual + $19/mo family (up to 6 members) for open beta. Defer premium tier and caregiver plan pricing until post-open-beta usage data.
- **Tradeoffs**: Free tier is essential for trust ("we're not desperate for your money"), but limits must avoid pushing power users to alternatives.

### A4. Launch wedge
- **Status**: OPEN — business doc proposes "family vault + emergency/caregiver"
- **Owner**: Founder / PM
- **Required by**: Sprint 6 (closed beta marketing copy)
- **Options**:
  1. **Family vault + caregiver** (business doc proposal)
  2. **Hereditary risk awareness for high-risk families**
  3. **Aging-parent care coordination**
  4. **Personal PHR + emergency**
- **Recommended**: **Aging-parent care coordination**. It's a real, urgent pain (the "sandwich generation"), it forces multi-user use cases (which is the moat), and it doesn't depend on hereditary or DNA features. Wedge into "you and your aging parent."
- **Tradeoffs**: We may attract older users initially (great for caregivers, slower for hereditary network effects). Acceptable.

---

## B. Feature priority

### B1. Wearable platform priority
- **Status**: OPEN
- **Owner**: PM / Eng
- **Required by**: Sprint 11
- **Options**: Apple HealthKit first / Google Health Connect first / both in parallel
- **Recommended**: **Both in parallel** — they're symmetric APIs and our two-developer mobile team can split. Skip Fitbit/Garmin/Oura until Sprint 13+.
- **Tradeoffs**: Slightly slower per-platform polish, but the demographic split (Caregivers + aging parents skew Android in many regions) makes it risky to ship one first.

### B2. DNA partner strategy
- **Status**: DEFERRED — not in first 24 weeks
- **Required by**: Phase 4
- **Options**: build raw-data import first / partner with 23andMe via API / partner with AncestryDNA / use a clinical-grade lab partner (Color, Invitae, Helix)
- **Recommended on revisit**: Start with **import** of user-uploaded raw data (.txt/.vcf from existing tests). Partnerships come later once user demand is proven.

### B3. FHIR ingestion approach
- **Status**: DEFERRED — Phase 3
- **Required by**: Phase 3 kickoff
- **Options**: per-EHR OAuth direct (slow, control) / aggregator (1upHealth, Particle, Validic — fast, vendor lock) / hybrid
- **Recommended on revisit**: **Aggregator** for the initial 5–10 EHRs, then direct for top providers as scale justifies.

### B4. Mental health architecture
- **Status**: OPEN
- **Owner**: Eng / Legal
- **Required by**: Sprint 5 (sensitivity tier implementation)
- **Options**:
  1. Treat as Highly Sensitive tier within the unified data model
  2. Separate "Mental Health Vault" with isolated encryption and a separate consent model
- **Recommended**: **Highly Sensitive tier within unified model** for MVP. Add per-entry granular sharing and field-level encryption. Re-evaluate separate-vault if user research after closed beta shows users want stronger separation.
- **Tradeoffs**: Separate vault is more reassuring but adds significant complexity and risks fragmenting the user's record into "real health" vs "mental health."

### B5. Default disclosure mode for first hereditary alert
- **Status**: OPEN
- **Owner**: PM / Clinical advisor
- **Required by**: Sprint 9
- **Options**: Anonymous / Relationship-only / Identified
- **Recommended**: **Identified** as the default but with prominent toggles. The user is the one taking action; default to making them visible. We surface anonymous as a thoughtful choice, not the default.
- **Tradeoffs**: Anonymous default is more "privacy-protective" but undermines the family relationship — it's almost passive-aggressive when used by close family.

### B6. Family graph DB choice for MVP
- **Status**: OPEN
- **Owner**: Eng
- **Required by**: Sprint 3
- **Options**: PostgreSQL with recursive CTEs / Neo4j / ArangoDB
- **Recommended**: **PostgreSQL** for MVP (single DB to operate, well-known, recursive queries fine for ~1000 nodes per user). Migrate to Neo4j when query complexity or scale justifies, likely Phase 3+.
- **Tradeoffs**: We will pay a migration cost later. Acceptable.

### B7. Account login: email/OTP only, or also social (Google, Apple)?
- **Status**: OPEN
- **Owner**: PM
- **Required by**: Sprint 1
- **Options**:
  1. Email/OTP only
  2. Add "Sign in with Apple" (required for App Store anyway)
  3. Add Google as well
- **Recommended**: **Email/OTP + Sign in with Apple** at MVP. Skip Google in MVP — we'll add when there's clear demand.
- **Tradeoffs**: Sign in with Apple is mandated by Apple for any app offering social sign-in. Email/OTP avoids social-graph leakage to Google.

### B8. Account-less family viewing?
- **Status**: OPEN
- **Owner**: PM
- **Required by**: Sprint 4
- **Options**: Should a relative be able to view shared content via a magic-link without ever creating an account?
- **Recommended**: **No, account required**. Every recipient creates an account. Better security, audit, accountability. The "one-time visit pass" for clinicians (E2 in [07_EDGE_CASES_CATALOG](07_EDGE_CASES_CATALOG.md)) is different — that's a clinical workflow, not a family one.
- **Tradeoffs**: Slight friction for the family member. Worth it.

### B9. Emergency unlock UX
- **Status**: OPEN
- **Owner**: PM / Design
- **Required by**: Sprint 2
- **Options**: lock-screen widget / accessible from lock screen via long press / require unlock + biometric / QR code on phone case
- **Recommended**: **Lock-screen widget on iOS, persistent notification card on Android, plus QR code option for printing/wallet**. The user opts in.
- **Tradeoffs**: Lock-screen surfaces are powerful but expose to anyone with the phone. The QR option is for users who want a more deliberate "I keep a card in my wallet" workflow.

---

## C. Voice & terminology

### C1. What do we call DNA discovery in the UI?
- **Status**: OPEN
- **Owner**: PM / Content
- **Required by**: Phase 4
- **Options**: "DNA discovery" / "Biological matches" / "Genetic relatives" / "Possible biological family"
- **Recommended on revisit**: **"Possible biological family"**. Less hype-y than "DNA discovery", more honest than "matches" (which sounds like dating).
- **Tradeoffs**: longer string in nav.

### C2. What do we call the AI?
- **Status**: OPEN
- **Owner**: PM / Content
- **Required by**: Sprint 9
- **Options**: "FAMILIA AI" / "Health Twin" / no name (just "FAMILIA noticed…")
- **Recommended**: **No name**. Avoid pseudo-personhood. The AI is an internal capability the product uses to summarize. Refer to it functionally — "FAMILIA noticed", "Your weekly summary", not "Your AI assistant Aria."
- **Tradeoffs**: Less brand surface. Better trust.

### C3. What do we call sharing presets?
- **Status**: DECIDED — see [05_PERMISSION_MATRIX](05_PERMISSION_MATRIX.md): None / Emergency / Care bundle / Full record / Custom.

### C4. What does "family" mean in our copy?
- **Status**: OPEN
- **Owner**: Content
- **Required by**: Sprint 0 (voice doc baseline)
- **Options**: "family" only / "family or chosen family" / "family circle" / "your people"
- **Recommended**: **"Family"** in default copy with the explicit acknowledgment that "family means whoever you decide" in marketing and onboarding. Avoid "family circle" (cult-y).

---

## D. Operational & legal

### D1. Are we a HIPAA-covered entity?
- **Status**: OPEN
- **Owner**: Legal
- **Required by**: Sprint 5–6 (consent engine work needs to know our posture)
- **Options**:
  1. **Personal Health Record (consumer)** — not a covered entity unless we partner with one
  2. **HIPAA-compliant from day one** — operate as if covered, sign BAAs with vendors
- **Recommended**: **Operate as HIPAA-compliant from day one** for posture. We're not a covered entity yet, but our practices align with HIPAA Security Rule. Once we integrate with a provider (Phase 3), we become a Business Associate and BAA obligations kick in. Operating as HIPAA-aligned from the start avoids retrofits.
- **Tradeoffs**: Higher operational cost (vendor selection constrained to BAA-able). Worth it for trust.

### D2. Data residency commitments at signup?
- **Status**: OPEN
- **Owner**: Legal / Eng
- **Required by**: Sprint 0
- **Options**: US-only at MVP / US + EU at MVP / promise but defer EU
- **Recommended**: **US + EU regions ready in infra**, but launch with US users only at MVP. EU users opt in only when we open EU launch.
- **Tradeoffs**: Slightly more infra cost upfront, but unblocks EU launch later without a migration.

### D3. Cyber insurance for breach response?
- **Status**: OPEN
- **Owner**: Founder / Legal
- **Required by**: Pre-open-beta
- **Recommended**: yes, $5M minimum with health-data-specific carrier.

### D4. Company structure: PBC?
- **Status**: OPEN
- **Owner**: Founder
- **Required by**: Pre-incorporation (likely already done)
- **Options**: C-corp / Public Benefit Corporation
- **Recommended**: **PBC** if not already. Aligns with the privacy-first thesis and gives strategic latitude on later M&A questions.

### D5. Audit log retention period
- **Status**: OPEN
- **Owner**: Legal / Eng
- **Required by**: Sprint 11
- **Options**: 1 year / 3 years / 7 years / forever
- **Recommended**: **7 years** to align with the longest reasonable HIPAA documentation requirement. User's own audit log entries deletable along with the user account, except access events legally required to retain.

### D6. Government / law enforcement request policy
- **Status**: OPEN
- **Owner**: Legal
- **Required by**: Pre-open-beta
- **Recommended**: Default to user-notification before compliance, challenge gag orders to the extent legally permissible, publish annual transparency report. Legal counsel to draft formal policy.

---

## E. Technical & product

### E1. Mobile framework
- **Status**: OPEN — original arch doc suggests React Native
- **Owner**: Eng
- **Required by**: Sprint 0
- **Options**: React Native / Native (Swift + Kotlin) / Flutter
- **Recommended**: **React Native** for MVP. One mobile engineer can ship both platforms credibly. Migrate to native later if performance demands (likely never for this product profile).
- **Tradeoffs**: Camera (scan) and HealthKit/Health Connect bridges are slightly more complex but well-supported by community libraries.

### E2. Web framework
- **Status**: OPEN
- **Owner**: Eng
- **Required by**: Sprint 0
- **Recommended**: **Next.js + React** — server-side rendered for the marketing surfaces, client-rendered for the app surfaces. shadcn/ui + Radix as a base.

### E3. Backend
- **Status**: OPEN
- **Owner**: Eng
- **Required by**: Sprint 0
- **Options**: Node + Express / NestJS / Go / Python (FastAPI) / Rails
- **Recommended**: **Node + NestJS** for MVP. Single language across stack reduces context-switching for a small team.

### E4. Cloud provider
- **Status**: OPEN
- **Owner**: Eng / Legal
- **Required by**: Sprint 0
- **Options**: AWS / GCP / Azure
- **Recommended**: **AWS** for HIPAA tooling maturity (BAA-eligible services well-documented).

### E5. Push notification infrastructure
- **Status**: OPEN
- **Required by**: Sprint 9
- **Options**: APNs + FCM directly / OneSignal / Knock
- **Recommended**: APNs + FCM directly for MVP. Healthcare data + third-party push provider is a BAA conversation we don't need at MVP.

### E6. Email provider
- **Status**: OPEN
- **Required by**: Sprint 1
- **Options**: SES / Postmark / SendGrid / Resend
- **Recommended**: **SES** for transactional (HIPAA-eligible with BAA), **Resend** for marketing emails (no PHI).

### E7. AI provider for summarization & extraction
- **Status**: OPEN
- **Required by**: Sprint 7 (extraction) and Sprint 9 (summarization)
- **Options**: Anthropic Claude / OpenAI GPT / Google Gemini / open-weight self-hosted
- **Recommended**: **Anthropic Claude** for the production path (BAA available, strong safety posture, structured output reliability). Self-hosted open-weight as a research path for sensitive-tier processing if user research shows users want it.
- **Tradeoffs**: Per-call cost is meaningful at scale; cache aggressively, RAG only what's needed.

### E8. OCR provider
- **Status**: OPEN
- **Required by**: Sprint 7
- **Options**: AWS Textract / Google Document AI / Azure Document Intelligence / open-source (Tesseract) + LLM extraction
- **Recommended**: **AWS Textract** for documents with tables (lab reports especially) + **LLM extraction** as the structuring pass. BAA-eligible.

### E9. File storage
- **Status**: OPEN
- **Required by**: Sprint 7
- **Options**: S3 / GCS / Azure Blob
- **Recommended**: **S3** with SSE-KMS, customer-managed keys per region.

### E10. Time-series store for wearable data
- **Status**: OPEN
- **Required by**: Sprint 11
- **Options**: TimescaleDB / InfluxDB / native Postgres with partitions
- **Recommended**: **TimescaleDB** — runs alongside Postgres, single ops surface for MVP.

### E11. Observability and error tracking
- **Status**: OPEN
- **Required by**: Sprint 0
- **Options**: Datadog / Honeycomb / Grafana Cloud / Sentry for errors
- **Recommended**: **Sentry for errors + Grafana Cloud or Datadog** for metrics/logs. Avoid sending PHI to observability providers (scrub aggressively, BAA where applicable).

---

## F. UX & copy

### F1. Streaks, badges, gamification — confirmed off?
- **Status**: DECIDED. **Off.** No streaks, no badges, no gamification. See [04_VOICE_AND_TONE](04_VOICE_AND_TONE.md).

### F2. Push notifications during quiet hours
- **Status**: OPEN
- **Owner**: PM / Design
- **Required by**: Sprint 9
- **Options**: Strict respect / time-shift to first non-quiet hour / categorical (medical = always, marketing = quiet)
- **Recommended**: **Categorical**. Medical and security = always. Family alerts = respect quiet hours. Marketing = email only.

### F3. Default to dark mode?
- **Status**: OPEN
- **Required by**: Sprint 0 (design system)
- **Recommended**: **Follow OS** default. Both modes designed from the start.

### F4. Default font size for older users
- **Status**: OPEN
- **Recommended**: respect OS dynamic type. Test specifically with iOS dynamic type at AAA size and Android font scaling at 1.3x.

### F5. Voice input on check-ins
- **Status**: OPEN
- **Required by**: Sprint 9
- **Options**: on-device (Apple Speech, Android Speech) / server-side (Whisper-class) / hybrid
- **Recommended**: **on-device** for MVP. Privacy advantage and lower latency. Server-side as fallback for languages not on-device-supported.

---

## G. Beta & research

### G1. How do we recruit closed beta families?
- **Status**: OPEN
- **Owner**: Founder / PM
- **Required by**: Sprint 18
- **Recommended**: 50% personal network of founders, 30% via a posting on disease-specific support communities (with their permission), 20% via a single newsletter mention. Avoid Twitter/X to minimize tech-bro bias in beta cohort.

### G2. What feedback do we collect from closed beta?
- **Status**: OPEN
- **Required by**: Sprint 24
- **Recommended**: in-product "what's working / what isn't" prompt weekly + 30-min observation calls with each family monthly + privacy-survey at week 4 and week 12.

### G3. What's the beta exit criteria for going to open beta?
- **Status**: OPEN
- **Required by**: Sprint 32
- **Recommended**: see metrics in [10_MVP_BUILD_SEQUENCE](10_MVP_BUILD_SEQUENCE.md), plus a "no critical defect that affected sharing or alert routing in last 2 weeks."

---

## When to revisit

This log should be reviewed at the start of every sprint planning. As decisions are made, edit in place; do not delete. The history of "we considered X" is itself useful institutional memory.
