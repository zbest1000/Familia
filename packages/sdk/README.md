# @familia/sdk

Typed client for the FAMILIA API. Used by both `apps/web` and `apps/mobile`.

Currently hand-rolled. Future: generate from OpenAPI spec emitted by the API.

## Resilience contract

- Default per-request timeout: 10s.
- Built-in retry: 2 attempts with exponential backoff (transient failures only).
- Circuit-breaking is left to the **caller** (e.g., a higher-level UI hook). The SDK itself only retries.
- Always sets `Idempotency-Key` on non-GET requests so the API can de-dupe retries safely.
