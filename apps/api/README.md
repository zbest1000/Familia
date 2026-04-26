# @familia/api

The FAMILIA backend API. NestJS + Prisma + Postgres + Redis + BullMQ.

## Sprint-0 status

- Health endpoints (`/health/live`, `/health/ready`, `/health/startup`)
- Auth controller stub (`POST /auth/signup/start`) — full sign-up flow lands in Sprint 1
- Users controller stub (`GET /users/me` reads `X-User-Id` until auth lands)
- Modules: Auth, Users, Family, Consent, HealthRecords, Audit (most are placeholders that import the engine + state machines)
- PrismaService wired; schema lives at `prisma/schema.prisma`
- Audit writer wired against an `audit_entries` Postgres table

## Resilience contract

- **Critical** (per `docs/16 §2`). Multi-AZ, ≥2 instances behind ALB.
- Embedded `@familia/consent-engine` — no network hop on the read critical path.
- Synchronous audit write inside the same DB transaction as the originating write; rolls back if audit fails.
- Helmet + global Zod exception filter; never leaks stack traces.
- `enableShutdownHooks()` for graceful drain.
- Prisma reads can fall back to a read replica (Sprint 12+).
- Redis cache for grant lookups (Sprint 6).

## Local

```bash
cp .env.example .env
pnpm prisma:migrate:dev
pnpm dev
```
