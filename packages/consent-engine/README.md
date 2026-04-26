# @familia/consent-engine

The single source of truth for "can this actor do this with this resource?" Embedded as a library inside the API at every record-touching call. Tested in isolation with property-based tests.

Implements the matrix in [docs/05_PERMISSION_MATRIX.md](../../docs/05_PERMISSION_MATRIX.md) §6.

## Why a library, not a service

Every record read goes through `evaluateAccess`. Making this a network call would put a synchronous external dependency on the critical path — and a network blip would silently allow or deny the wrong thing. As a library, the only failure mode is the in-process call, and we can test it exhaustively.

The cost: every API node must use the same library version. Because the engine is small and stable, this is acceptable.

## Resilience contract

- **Deps**: `@familia/domain` (types), `zod` (runtime validation), and a `GrantStore` provided by the caller (typically backed by Postgres + Redis cache in the API).
- **Failure mode**: if the `GrantStore.findActiveGrant` throws or times out, the API treats it as deny (per `docs/16` §10 critical-component column). The engine itself never throws.
- **Cache invalidation**: when a grant changes state, the API is responsible for invalidating any cached lookups before serving subsequent reads. The engine has no cache of its own.
- **Audit**: the API writes the audit entry — the engine returns the decision and reason for the API to log.
