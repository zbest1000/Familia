# @familia/domain

Shared domain types and Zod schemas for FAMILIA. Used by the API for validation, by the SDK for type safety, by the consent engine for resource shape, by tests for fixture generation.

The single source of truth for the **shape** of the data — not for storage (that's `apps/api/prisma/schema.prisma`) or for behavior (that's the consent engine, state machines, and services).

## Resilience contract

Pure data + validation package — no runtime dependencies, no failure modes.
