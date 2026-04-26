// Wearable + (later) FHIR ingest worker. Sprint-0 skeleton.
//
// Subscribes to `wearable-sync` jobs. Each job represents a user requesting
// a delta sync from a connected source. Failures retry; the user sees
// "syncing paused" if circuit opens.

import { Worker } from "bullmq";
import IORedis from "ioredis";
import pino from "pino";

const log = pino({ name: "ingest" });
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

type WearableSyncJob = {
  userId: string;
  source: "apple_health" | "google_health_connect" | "fitbit" | "garmin" | "oura";
  sinceIso: string | null;
};

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

export function startIngestWorker() {
  const worker = new Worker<WearableSyncJob>(
    "wearable-sync",
    async (job) => {
      log.info({ jobId: job.id, source: job.data.source }, "syncing wearable data");
      // TODO: wire source SDKs with circuit breakers.
      return { ok: true, samplesIngested: 0 };
    },
    {
      connection,
      concurrency: 4,
    },
  );

  worker.on("failed", (job, err) => {
    log.warn({ jobId: job?.id, err: err.message }, "wearable sync failed");
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
  const worker = startIngestWorker();
  log.info("ingest worker started");
  const shutdown = async (signal: string) => {
    log.info({ signal }, "shutting down");
    await worker.close();
    await connection.quit();
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}
