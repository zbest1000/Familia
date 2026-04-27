// OCR + extraction worker. Drains the `ocr-extraction` queue.
//
// Per docs/06 §2 (capture → save raw → pre-classify → OCR → extract →
// stage → review), this worker handles OCR + extract + stage. The API
// handles review (user accepts/rejects) and promotion (extracted fields
// become first-class records).
//
// Engines (open-source, enterprise-grade):
//   - tesseract.js (Apache-2.0) — Google Tesseract via WASM
//   - pdf-parse (MIT) — PDF text-layer reader
// See ./extract.ts for the full strategy.
//
// Resilience: failures retry per BullMQ defaults; cap of 3 attempts so
// pathological docs don't loop forever. Document is left in
// extraction_unavailable on permanent fail so the API can show that
// state to the user (with a retry option) instead of a perpetual spinner.

import { PrismaClient } from "@prisma/client";
import { type Job, Worker } from "bullmq";
import IORedis from "ioredis";
import pino from "pino";

import { extract, shutdownExtractor } from "./extract.js";
import { readDocument, storageInfo } from "./storage.js";

const log = pino({ name: "ocr-pipeline" });
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

type OcrJob = {
  documentId: string;
};

function buildRedisOptions() {
  const u = new URL(REDIS_URL);
  return {
    host: u.hostname,
    port: Number.parseInt(u.port || "6379", 10),
    username: u.username || undefined,
    password: u.password || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    ...(u.protocol === "rediss:" ? { tls: {} } : {}),
  } as const;
}

const connection = new IORedis(buildRedisOptions());
const prisma = new PrismaClient();

connection.on("connect", () =>
  log.info({ tls: REDIS_URL.startsWith("rediss://") }, "redis connected"),
);
connection.on("error", (e) => log.warn({ err: e.message }, "redis error"));

export function startOcrWorker() {
  const worker = new Worker<OcrJob>(
    "ocr-extraction",
    async (job: Job<OcrJob>) => {
      const { documentId } = job.data;
      log.info(
        { jobId: job.id, documentId, attempt: job.attemptsMade + 1 },
        "starting extraction",
      );

      const doc = await prisma.vaultDocument.findUnique({ where: { id: documentId } });
      if (!doc) {
        log.warn({ documentId }, "document not found, skipping");
        return { ok: false, reason: "document_not_found" };
      }

      const file = await readDocument(doc.storageKey);
      const result = await extract({
        buffer: file.buffer,
        contentType: doc.contentType || file.contentType || "application/octet-stream",
      });

      const hasUseful =
        result.rawText.replace(/\s+/g, " ").trim().length > 0 || result.analytes.length > 0;

      if (!hasUseful) {
        await prisma.vaultDocument.update({
          where: { id: documentId },
          data: { extractionState: "extraction_unavailable" },
        });
        log.warn({ documentId }, "no usable text extracted; marking unavailable");
        return { ok: false, reason: "no_text" };
      }

      // Compute an overall confidence: weighted by how many analytes matched
      // and the source.
      const baseConfidence = result.textLayerSource === "pdf-text-layer" ? 0.95 : 0.7;
      const analyteBoost = Math.min(0.05 * result.analytes.length, 0.2);
      const overallConfidence = Math.min(baseConfidence + analyteBoost, 0.98);

      // Decide a kind for the staged extraction. We default to lab_report
      // when we matched any analytes; otherwise discharge_summary (closest
      // generic in our schema). The user can fix in review.
      const kind = result.analytes.length > 0 ? "lab_report" : "discharge_summary";

      const data = {
        kind,
        rawText: result.rawText.slice(0, 50_000), // hard cap to keep JSON sane
        rawTextLength: result.rawText.length,
        pages: result.pages,
        textLayerSource: result.textLayerSource,
        durationMs: result.durationMs,
        analytes: result.analytes,
      };

      await prisma.$transaction(async (tx) => {
        await tx.stagedExtraction.upsert({
          where: { documentId },
          update: {
            kind,
            data,
            modelVersion: result.modelVersion,
            overallConfidence,
          },
          create: {
            documentId,
            kind,
            data,
            modelVersion: result.modelVersion,
            overallConfidence,
          },
        });
        await tx.vaultDocument.update({
          where: { id: documentId },
          data: { extractionState: "review_pending", extractionConfidence: overallConfidence },
        });
      });

      log.info(
        {
          jobId: job.id,
          documentId,
          source: result.textLayerSource,
          chars: result.rawText.length,
          analytes: result.analytes.length,
          confidence: overallConfidence,
          ms: result.durationMs,
        },
        "extraction complete",
      );
      return { ok: true, analytes: result.analytes.length, confidence: overallConfidence };
    },
    {
      connection,
      concurrency: 2,
    },
  );

  worker.on("failed", (job, err) => {
    log.warn(
      { jobId: job?.id, err: err.message, attempt: job?.attemptsMade },
      "OCR job failed",
    );
  });
  worker.on("completed", (job, result) => {
    log.info({ jobId: job.id, result }, "OCR job completed");
  });

  return worker;
}

const isEntry = (() => {
  try {
    const argv1 = process.argv[1];
    if (!argv1) return false;
    return import.meta.url === new URL(`file://${argv1}`).href;
  } catch {
    return false;
  }
})();

if (isEntry) {
  const worker = startOcrWorker();
  log.info({ storage: storageInfo }, "OCR pipeline worker started");
  // Native engines (leptonica inside tesseract.js, pdfjs internals) can
  // throw via process.nextTick out of band. Without this guard one bad
  // document kills the entire worker. Log it and let BullMQ retry the job.
  process.on("uncaughtException", (err) => {
    log.error({ err: err.message, stack: err.stack }, "uncaughtException");
  });
  process.on("unhandledRejection", (reason) => {
    log.error({ reason: String(reason) }, "unhandledRejection");
  });
  const shutdown = async (signal: string) => {
    log.info({ signal }, "shutting down");
    await worker.close();
    await shutdownExtractor();
    await connection.quit();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}
