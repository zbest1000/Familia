# FAMILIA

A privacy-first, family-centered health intelligence ecosystem. Mobile + web. Built so a person can collect, organize, understand, and selectively share every important part of their health life — and so families can communicate health information safely without exposing more than necessary.

This repo holds the planning pack and the application code for the MVP.

## Repo layout

```
Familia/
├── apps/
│   ├── mobile/        React Native (Expo) — daily-use surface
│   ├── web/           Next.js — management surface
│   └── api/           NestJS — REST API + workers
├── packages/
│   ├── tokens/        design tokens (single source for native + web)
│   ├── domain/        shared types + zod schemas
│   ├── consent-engine/  access decision function (single source of truth)
│   ├── state-machines/  invite, consent, alert, co-manager lifecycles
│   ├── sdk/           typed API client used by both apps
│   ├── copy/          typed copy library (i18n)
│   ├── audit/         audit log writer interface
│   ├── crypto/        encryption helpers
│   ├── extraction/    OCR + LLM extraction pipeline
│   ├── ui-mobile/     React Native components
│   ├── ui-web/        React components
│   ├── testing/       shared fixtures, factories, hostile-family checklists
│   ├── tsconfig/      shared TypeScript configs
│   └── eslint-config/ shared lint rules
├── services/
│   ├── notifier/      outbound notifications (push, email)
│   ├── ingest/        wearable + FHIR ingestion workers
│   └── ocr-pipeline/  async OCR + extraction worker
├── docs/              execution & strategy pack — start here
├── initial idea docs/ original concept pack
├── infra/             terraform + scripts (bootstrapped per env)
├── tools/             seed data, migrations, ops helpers
├── docker-compose.yml local dev stack: Postgres + Redis + LocalStack
└── ...
```

## Where to start

- **Product**: [docs/00_README.md](docs/00_README.md) → personas → task flows → MVP build sequence
- **Engineering**: [docs/15_REPO_SCAFFOLDING.md](docs/15_REPO_SCAFFOLDING.md) → [docs/13_API_STATE_MACHINES.md](docs/13_API_STATE_MACHINES.md) → [docs/16_RESILIENCE_AND_DISTRIBUTED_ARCHITECTURE.md](docs/16_RESILIENCE_AND_DISTRIBUTED_ARCHITECTURE.md)
- **Design**: [docs/01_PERSONAS.md](docs/01_PERSONAS.md) → [docs/02_INFORMATION_ARCHITECTURE.md](docs/02_INFORMATION_ARCHITECTURE.md) → [docs/12_COMPONENT_INVENTORY.md](docs/12_COMPONENT_INVENTORY.md)
- **Privacy / Trust & Safety**: [docs/05_PERMISSION_MATRIX.md](docs/05_PERMISSION_MATRIX.md) → [docs/08_TRUST_AND_SAFETY.md](docs/08_TRUST_AND_SAFETY.md) → [docs/14_TEST_STRATEGY.md](docs/14_TEST_STRATEGY.md)

## Local development

```bash
# Prerequisites: Node 20+, pnpm 9+, Docker Desktop

pnpm install
pnpm dev:up        # boots Postgres + Redis + LocalStack via docker-compose
pnpm dev:seed      # seeds synthetic data (personas from docs/01_PERSONAS.md)
pnpm dev:api       # starts API on :3000
pnpm dev:web       # starts web on :3001
pnpm dev:mobile    # starts Expo (mobile)
```

## Tech stack at a glance

| Layer | Choice |
|---|---|
| Mobile | React Native (Expo, RN 0.74+), TypeScript |
| Web | Next.js 14 (App Router), React 18, TypeScript, Tailwind, Radix |
| Backend | Node 20, NestJS, TypeScript, PostgreSQL via Prisma, Redis, BullMQ |
| Time-series | TimescaleDB (Postgres extension) |
| Async | BullMQ over Redis; outbox pattern |
| File storage | S3 with SSE-KMS (LocalStack in dev) |
| LLM | Anthropic Claude (BAA path) |
| OCR | AWS Textract |
| Auth | Self-hosted: Argon2 + WebAuthn + TOTP |
| Cloud | AWS, Terraform-managed |
| CI | GitHub Actions |

Reasoning for each choice is in [docs/11_OPEN_QUESTIONS.md](docs/11_OPEN_QUESTIONS.md).

## Resilience contract

FAMILIA is built so a single service failure does **not** take the application down. Critical-path reads need only the API node, the consent engine, Postgres, and Redis. Everything else (AI, OCR, wearables, push, email, summaries) is async and degrades gracefully. See [docs/16_RESILIENCE_AND_DISTRIBUTED_ARCHITECTURE.md](docs/16_RESILIENCE_AND_DISTRIBUTED_ARCHITECTURE.md).

## License

TBD. This is private, pre-launch source. Do not redistribute.
