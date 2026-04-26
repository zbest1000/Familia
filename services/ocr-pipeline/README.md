# services/ocr-pipeline

OCR + LLM extraction worker. Processes `ocr-extraction` jobs.

## Resilience contract

- **Independent process**. Crashes don't affect the API.
- **Non-critical**: documents are saved synchronously by the API. Extraction is async — if the worker is down, the user sees "saved as a file; reading for details".
- **Bounded concurrency** (2 by default) since OCR + LLM are expensive.
- **Circuit breakers** on Textract and Claude (TODO Sprint 7).
- **Hallucination guardrails**: outputs are validated against schemas in `@familia/extraction` before staging. Anything that fails validation is logged and the document is left in `extraction_pending`.
