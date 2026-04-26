# FAMILIA — Execution & Strategy Pack

This folder is the **execution layer** that sits on top of the original concept pack in [`initial idea docs/`](../initial%20idea%20docs/). The original pack defines **what FAMILIA is** (vision, scope, taxonomies, services, schemas, message variants, security posture, business model). This pack defines **how to actually build, decide, design, ship, and protect users** — the missing connective tissue between concept and product.

Nothing in `initial idea docs/` is rewritten. These docs reference back to it and fill in the gaps a product team, design team, engineering team, investor, or compliance reviewer will keep asking about.

## Index

| # | Doc | Audience | What it answers |
|---|---|---|---|
| 01 | [Personas](01_PERSONAS.md) | Product, Design, Eng, Investors | Who specifically is this for, and what does their day look like |
| 02 | [Information Architecture](02_INFORMATION_ARCHITECTURE.md) | Design, Eng | Every screen on mobile and web, and how they nest |
| 03 | [Task Flows](03_TASK_FLOWS.md) | Design, Eng, QA | 12 end-to-end journeys with steps, errors, acceptance criteria |
| 04 | [Voice & Tone](04_VOICE_AND_TONE.md) | Design, Content, PM | How the product talks, especially in sensitive moments |
| 05 | [Permission Matrix](05_PERMISSION_MATRIX.md) | Eng, Design, Compliance | Concrete sharing presets × data categories × disclosure modes |
| 06 | [Data Ingestion Playbook](06_DATA_INGESTION_PLAYBOOK.md) | Eng, Design | How records actually get in (manual / upload / OCR / wearable / FHIR) |
| 07 | [Edge Cases Catalog](07_EDGE_CASES_CATALOG.md) | Product, Design, Eng, Legal | ~25 scenarios that decide whether the family promise survives reality |
| 08 | [Trust & Safety](08_TRUST_AND_SAFETY.md) | Product, Eng, Legal, Security | Abuse vectors and protective patterns the security doc doesn't cover |
| 09 | [Pediatric & Proxy](09_PEDIATRIC_AND_PROXY.md) | Product, Design, Eng, Legal | Minors, age-of-majority transitions, caregiver delegation, dementia, death |
| 10 | [MVP Build Sequence](10_MVP_BUILD_SEQUENCE.md) | Eng, PM | Sprint-by-sprint plan with acceptance criteria for the first 24 weeks |
| 11 | [Open Questions](11_OPEN_QUESTIONS.md) | Founders, PM | Decisions still required, with proposed defaults and blocking sprints |
| 12 | [Component Inventory](12_COMPONENT_INVENTORY.md) | Design, Eng | Tokens → patterns → modules; complete UI building-block list with required states |
| 13 | [API State Machines](13_API_STATE_MACHINES.md) | Eng, QA | Concrete states, transitions, invariants, and audit for invite, consent, alert, and co-managed actions |
| 14 | [Test Strategy](14_TEST_STRATEGY.md) | Eng, QA, Security | Test pyramid + privacy/consent invariants + adversarial + hostile-family review |
| 15 | [Repo Scaffolding](15_REPO_SCAFFOLDING.md) | Eng | Concrete monorepo layout, tech stack defaults, CI, branching, and Sprint-0 bootstrapping |
| 16 | [Resilience & Distributed Architecture](16_RESILIENCE_AND_DISTRIBUTED_ARCHITECTURE.md) | Eng, SRE, Founders | Service classification, async patterns, circuit breakers, graceful degradation, chaos testing — single-service failure must not take the app down |

## Suggested reading order by role

- **Founder / Investor**: 01 → 11 → 10 (who, what's undecided, when it ships)
- **Product Manager**: 01 → 03 → 07 → 05 → 10
- **Designer**: 01 → 02 → 12 → 03 → 04 → 07
- **Engineer**: 02 → 12 → 13 → 03 → 05 → 06 → 10 → 14 → 15 → 16 → 11
- **QA / SRE**: 13 → 14 → 16 → 08 → 06
- **Legal / Compliance**: 05 → 07 → 08 → 09
- **Security**: 05 → 08 → 13 → 14 → 06

## How this pack relates to the originals

| Original doc | Picked up by |
|---|---|
| 01_PRODUCT_SPEC | grounded by [01_PERSONAS](01_PERSONAS.md), made testable by [03_TASK_FLOWS](03_TASK_FLOWS.md) |
| 02_SYSTEM_ARCHITECTURE | extended by [06_DATA_INGESTION_PLAYBOOK](06_DATA_INGESTION_PLAYBOOK.md) |
| 03_API_SPEC | exercised by the user-facing flows in [03_TASK_FLOWS](03_TASK_FLOWS.md) |
| 04_DATABASE_SCHEMA | constrained by [05_PERMISSION_MATRIX](05_PERMISSION_MATRIX.md) |
| 05_CONSENT_AND_ALERT_ENGINE | concretized by [05_PERMISSION_MATRIX](05_PERMISSION_MATRIX.md) and [04_VOICE_AND_TONE](04_VOICE_AND_TONE.md) |
| 06_AI_DIGITAL_TWIN | scoped by acceptance criteria in [10_MVP_BUILD_SEQUENCE](10_MVP_BUILD_SEQUENCE.md) |
| 07_UI_UX_SPEC | superseded by [02_INFORMATION_ARCHITECTURE](02_INFORMATION_ARCHITECTURE.md) + [03_TASK_FLOWS](03_TASK_FLOWS.md) for execution detail |
| 08_SECURITY_COMPLIANCE | extended by [08_TRUST_AND_SAFETY](08_TRUST_AND_SAFETY.md) |
| 09_MVP_ROADMAP | replaced for execution by [10_MVP_BUILD_SEQUENCE](10_MVP_BUILD_SEQUENCE.md) (originals stay as the strategic phase view) |
| 10_DOCKER_MICROSERVICES_PLAN | extended by [15_REPO_SCAFFOLDING](15_REPO_SCAFFOLDING.md) for code organization |
| 11_BUSINESS_AND_MONETIZATION | not re-touched; pricing assumed |

## A note on scope

This pack is intentionally focused on the first 6 months — what gets to a closed beta with real families. Phase 3+ (provider FHIR, DNA, clinician portal, research) is referenced but not redesigned. The goal is to ship something a family of three can use to coordinate care for a parent with diabetes by week 24.
