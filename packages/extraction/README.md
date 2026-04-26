# @familia/extraction

OCR + LLM extraction **schemas** and contracts. The actual worker lives in `services/ocr-pipeline` so it can be deployed and scaled independently.

By keeping the schemas here, the API and the user-review UI in `apps/web` can render extracted documents without depending on the worker code.

See [docs/06_DATA_INGESTION_PLAYBOOK.md](../../docs/06_DATA_INGESTION_PLAYBOOK.md) §2 for the full pipeline.

## Resilience contract

- Pure schemas — no runtime deps beyond zod.
- The worker that produces these is async and fault-tolerant: failures retry per [docs/16](../../docs/16_RESILIENCE_AND_DISTRIBUTED_ARCHITECTURE.md) §5.
