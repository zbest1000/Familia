# services/ingest

Wearable + (later) FHIR ingest worker. Pulls data from connected sources via async jobs.

## Resilience contract

- **Independent process**. Failures don't affect the API or other workers.
- **Non-critical**: app remains usable when ingest is down. UI shows "syncing paused".
- **Circuit breakers** on outbound source APIs (TODO Sprint 11).
- **Retries**: standard exponential backoff. After 24h permanent fail, surface in user UI.
