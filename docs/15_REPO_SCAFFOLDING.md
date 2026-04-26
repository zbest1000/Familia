# FAMILIA — Repo Scaffolding

A concrete monorepo layout for FAMILIA. Built for a small team (1 full-stack, 1 mobile, 1 backend, 1 designer) to ship the MVP without architectural mistakes that cost weeks later.

## 1. Top-level layout

```
Familia/
├── README.md
├── package.json                  # workspace root
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .nvmrc
├── .editorconfig
├── .gitignore
├── .gitattributes
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                # lint + test + build per package
│   │   ├── e2e-mobile.yml        # nightly Detox/Maestro
│   │   ├── e2e-web.yml           # nightly Playwright
│   │   ├── security.yml          # Semgrep, deps, secrets
│   │   └── deploy-dev.yml
│   ├── CODEOWNERS
│   └── pull_request_template.md
├── apps/
│   ├── mobile/                   # React Native (iOS + Android)
│   ├── web/                      # Next.js (web app)
│   ├── marketing/                # Next.js (marketing site)
│   └── api/                      # NestJS API
├── packages/
│   ├── tokens/                   # design tokens, single source for native + web
│   ├── ui-mobile/                # React Native components
│   ├── ui-web/                   # React components
│   ├── copy/                     # typed copy library (i18n)
│   ├── sdk/                      # client SDK shared by web + mobile
│   ├── consent-engine/           # consent decision logic, used by api and tested standalone
│   ├── domain/                   # shared domain types and zod schemas
│   ├── state-machines/           # XState machines for invite/consent/alert/co-manager
│   ├── extraction/               # OCR + LLM extraction pipeline
│   ├── audit/                    # audit log writers and queries
│   ├── crypto/                   # encryption helpers, key wrapping
│   ├── eslint-config/
│   ├── tsconfig/
│   └── testing/                  # shared test fixtures, factories, hostile-family checklist runners
├── services/
│   ├── notifier/                 # outbound notifications (push, email)
│   ├── ingest/                   # wearable + FHIR ingestion workers
│   └── ocr-pipeline/             # async OCR + extraction worker
├── infra/
│   ├── terraform/
│   │   ├── envs/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   ├── prod-us-east/
│   │   │   └── prod-eu-west/
│   │   └── modules/
│   ├── kubernetes/
│   └── scripts/
├── docs/                         # (existing) execution + strategy pack
├── initial idea docs/            # (existing) original concept pack
└── tools/
    ├── seed/                     # synthetic test data generator
    ├── migrate/                  # db migration tooling
    └── policy-version-bump/      # consent policy versioning helper
```

## 2. Why a monorepo

- **Shared types**: domain shapes (User, Profile, FamilyRelationship, ConsentGrant, Alert) live in `packages/domain` and are imported by mobile, web, and api. One change updates all three.
- **Shared design tokens**: `packages/tokens` is the only place colors, type, spacing live. Both ui-mobile and ui-web import it.
- **Shared SDK**: `packages/sdk` is the typed API client used by both apps. Generated from API specs; manually composed where ergonomics matter.
- **Shared state machines**: `packages/state-machines` defines the invite/consent/alert lifecycles. The API uses them server-side. Mobile and web use the same definitions for client-side state hints. Tests cover them once.
- **Shared consent engine**: `packages/consent-engine` is the single source of truth for the access-decision function. Used by the API at every record read. Tested in isolation with property-based tests.
- **Shared copy**: `packages/copy` holds every user-facing string. Translations applied here. UI imports from here. No string literals in components.

### Why services are independent processes (resilience)

Per [16_RESILIENCE_AND_DISTRIBUTED_ARCHITECTURE](16_RESILIENCE_AND_DISTRIBUTED_ARCHITECTURE.md), the OCR pipeline, wearable ingestion, AI summarization, and notification dispatcher run as **separate processes** in `services/`. They communicate with the API through the database outbox + BullMQ queue, never via in-process calls. This means:

- The AI worker can crash and the API keeps serving requests.
- The OCR pipeline can be slow without slowing user-facing flows.
- Each service can scale independently.
- Each service has its own deploy cadence.

Every package in this repo carries a `Resilience contract` section in its README documenting its critical dependencies, degraded mode, fallback behavior, retry policy, and circuit breaker tuning.

## 3. Package conventions

### 3.1 Naming
- All packages prefixed `@familia/` (in `package.json` `name` field).
- Apps named for their surface: `@familia/mobile`, `@familia/web`, etc.

### 3.2 Per-package files
Every package has:
- `package.json` with `name`, `version`, `private: true` (workspace), `scripts` (build, test, lint, typecheck), `peerDependencies` for shared core deps
- `tsconfig.json` extending `@familia/tsconfig/base.json`
- `src/index.ts` as the only public export
- `README.md` with one-liner purpose and key exports
- `tests/` with unit tests colocated by area

### 3.3 Boundaries
- `packages/domain` has no runtime deps beyond `zod` and `@familia/tsconfig`.
- `packages/consent-engine` depends only on `@familia/domain`.
- `packages/sdk` depends only on `@familia/domain` and the HTTP client of choice.
- Apps depend on packages, never on each other.
- Services depend on packages, never on apps or other services directly (they communicate via API or queue).

This isolation makes the consent engine and domain models swappable for tests, alternative front-ends, or eventual provider portal.

## 4. Tech stack defaults

Per [11_OPEN_QUESTIONS](11_OPEN_QUESTIONS.md) recommendations:

| Layer | Choice |
|---|---|
| Mobile | React Native (RN 0.74+), TypeScript, Expo (managed workflow for MVP) |
| Web | Next.js 14, React 18, TypeScript, Tailwind, Radix UI / shadcn |
| Backend | Node 20, NestJS, TypeScript, PostgreSQL via Prisma or Drizzle, Redis, BullMQ for jobs |
| Time-series | TimescaleDB (Postgres extension) |
| File storage | S3 with SSE-KMS |
| Auth | Self-hosted: NestJS modules with Argon2 + WebAuthn + TOTP. Avoid third-party auth providers in MVP for posture clarity. |
| Notifications | APNs + FCM directly; SES for email |
| Observability | Sentry + Grafana Cloud (or Datadog) with strict PHI scrubbing |
| LLM | Anthropic Claude (BAA) for extraction + summaries |
| OCR | AWS Textract |
| CI | GitHub Actions |
| Infra | AWS, Terraform-managed |
| Container orchestration | ECS Fargate at MVP; revisit Kubernetes at scale |
| Secrets | AWS Secrets Manager + KMS |

These are defaults with reasoning in [11_OPEN_QUESTIONS](11_OPEN_QUESTIONS.md). Changing them is fine; this just removes a thousand small decisions.

## 5. Workspace tooling

- **Package manager**: pnpm (better monorepo ergonomics, faster, strict deps).
- **Task runner**: turborepo (cache, dependency-aware builds).
- **TypeScript**: strict mode everywhere; `@familia/tsconfig/base.json` is the canonical base.
- **Linting**: ESLint + Prettier; security plugins; consistent across packages.
- **Type-safe routing**: Next.js typed routes; React Navigation typed.
- **API contracts**: OpenAPI 3.1 generated from the API; SDK generated from the spec; types shared via domain package.

## 6. Environment layout

| Env | Purpose | Data |
|---|---|---|
| `local` | Developer machines | Dockerized Postgres + Redis + LocalStack for S3 |
| `dev` | Continuously deployed from main | Synthetic data only |
| `staging` | Manual deploy, mirror of prod infra | Synthetic data only; PHI-free |
| `prod-us-east` | US users | Real user data; HIPAA-aligned |
| `prod-eu-west` | EU users (when launched) | Real user data; GDPR-aligned, regional residency |

## 7. CI pipeline (every PR)

Run in parallel:
- Lint (ESLint + Prettier check)
- Typecheck
- Unit tests with coverage reporting
- Privacy invariants property tests (smaller sample; nightly larger)
- Build all packages and apps
- Security scans (Semgrep + dependency CVEs + secret detection)
- Bundle size diff per app
- Storybook visual regression (web)

Block on:
- Any privacy invariant failure
- Coverage drop > 2% on a privacy-critical package
- Performance budget regression > 20%
- New high/critical security finding

## 8. Branching, deploys, releases

- `main` always green, deployed continuously to dev.
- Feature branches → PR → review → merge.
- Staging deployed manually with a release tag.
- Production deployed from staging tag, gated on:
  - All E2E nightly tests passed in last 48h
  - Hostile-family review checklist signed for the release
  - No open critical defects in last 24h

## 9. Code review expectations

PR template includes:
- Summary
- Screenshots for UI changes (mobile and web)
- Test coverage on new code
- Privacy invariants affected (and tests added)
- Hostile-family checklist (when applicable)
- Migration plan (if schema change)

CODEOWNERS:
- `/packages/consent-engine/` requires senior eng + security advisor
- `/packages/extraction/` requires senior eng
- `/apps/api/src/auth/` requires senior eng + security advisor
- `/docs/` requires PM
- Privacy policy / legal pages require legal

## 10. Documentation in repo

- `README.md` at root — overview, quickstart for new devs.
- `docs/` (this folder) — execution + strategy pack.
- `initial idea docs/` — concept pack (read-only reference).
- Each package's `README.md` — purpose + public API.
- Architectural Decision Records (ADRs) in `docs/adrs/` for major technical decisions, written as decisions get made (not retroactively).

## 11. Local development

A new contributor should be able to run:

```bash
pnpm install
pnpm run dev:up        # boots Docker compose: postgres, redis, localstack
pnpm run dev:seed      # seeds synthetic data
pnpm run dev:api       # starts API on :3000
pnpm run dev:web       # starts web on :3001
pnpm run dev:mobile    # starts Metro bundler + opens iOS simulator
```

…and have a working FAMILIA running on their machine in under 15 minutes. The seed data should include all six primary personas with realistic family graphs.

## 12. What's NOT in MVP repo (yet)

- Provider FHIR import code (architectural shim only — actual integration in Phase 3).
- DNA import / discovery (Phase 4).
- Clinician portal (post-MVP).
- Multi-tenant admin tooling (post-MVP).
- Embedded consent SDK for third-party apps (long term).

## 13. Naming and casing

- File names: kebab-case for files, PascalCase for React components.
- Component files match component name: `RecipientPreview.tsx`.
- Test files colocated: `RecipientPreview.test.tsx`.
- Story files colocated: `RecipientPreview.stories.tsx`.
- Database table names: snake_case, plural.
- API URLs: kebab-case, plural resources, RESTful with explicit verbs only when REST doesn't fit.

## 14. Initial scaffolding action plan

If we're building this repo:
1. Initialize pnpm workspace + turborepo (Sprint 0, day 1).
2. Set up CI scaffolding (Sprint 0, day 1).
3. Bootstrap `packages/tsconfig`, `packages/eslint-config`, `packages/tokens`, `packages/domain` (Sprint 0, day 2).
4. Scaffold `apps/api` with health endpoint and DB connection (Sprint 0, day 2).
5. Scaffold `apps/mobile` and `apps/web` with placeholder screens (Sprint 0, day 3).
6. Wire shared `@familia/sdk` between apps and api with one round-trip endpoint (Sprint 0, day 4).
7. Add `packages/consent-engine` skeleton with the decision function and a small fixtures-based test (Sprint 0, day 5).
8. Sprint 1 begins.

## 15. Open scaffolding questions

These are listed in [11_OPEN_QUESTIONS](11_OPEN_QUESTIONS.md) but are also relevant here:
- Drizzle vs Prisma (pick one Sprint 0 day 2)
- XState vs hand-rolled state machines (pick one Sprint 0 day 5)
- Tamagui vs custom for ui-mobile (pick one Sprint 1)
- Storybook vs Ladle for component stories (pick one Sprint 1)

Decisions made early are easy to live with. Decisions delayed multiply.
