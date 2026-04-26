# @familia/audit

Append-only audit log writer interface. The API implements `AuditSink` against an `audit_entries` table; tests use an in-memory sink.

Audit writes are **synchronous** for the originating business write. The async fan-out to long-term store (per `docs/16` §4) happens after the sync write commits.

## Resilience contract

- Synchronous writes ride along with the originating business transaction. If the audit write fails, the business write is rolled back.
- Async drainage to long-term store is a separate worker. If it lags, recent events still live in `audit_entries` (Postgres) until drained.
- No outbound network dependencies.
