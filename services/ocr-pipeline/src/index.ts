// OCR + LLM extraction worker. Sprint-0 skeleton.
//
// Per docs/06 §2: capture → save raw → pre-classify → OCR → extract → stage → review.
// The worker handles the OCR + extract + stage stages; the API handles the
// review (user side) and promotion (when user accepts).

import { Worker } from "bullmq";
import IORedis from "ioredis";
import pino from "pino";

const log = pino({ name: "ocr-pipeline" });
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

type OcrJob = {
  documentId: string;
  storageKey: string;
  contentType: string;
};

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

export function startOcrWorker() {
  const worker = new Worker<OcrJob>(
    "ocr-extraction",
    async (job) => {
      log.info({ jobId: job.id, documentId: job.data.documentId }, "starting OCR + extraction");
      // TODO: wire AWS Textract + Anthropic Claude with circuit breakers.
      // Output: write StagedExtraction to Postgres for user review.
      return { ok: true };
    },
    {
      connection,
      concurrency: 2, // bounded — these are expensive
    },
  );

  worker.on("failed", (job, err) => {
    log.warn({ jobId: job?.id, err: err.message }, "OCR job failed");
  });

  return worker;
}

if (require.main === module) {
  const worker = startOcrWorker();
  log.info("OCR pipeline worker started");
  process.on("SIGTERM", async () => {
    log.info("SIGTERM — shutting down");
    await worker.close();
    await connection.quit();
    process.exit(0);
  });
}
