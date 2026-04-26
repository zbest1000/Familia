// Notifier worker. Processes the `notifications` queue and dispatches
// push (APNs/FCM) and email (SES).
//
// Resilience: see ../../README.md and docs/16. This worker is non-critical:
// failures retry per BullMQ defaults, in-app inbox covers the gap.
//
// Connection: supports both rediss:// (TLS, used by Upstash) and redis://
// (plain, used by local Redis or Memurai). ioredis auto-detects from the URL.

import { Queue, type RedisOptions, Worker } from "bullmq";
import IORedis from "ioredis";
import pino from "pino";

const log = pino({ name: "notifier" });
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

type NotificationJob = {
  channel: "push" | "email";
  recipientUserId: string;
  copyKey: string;
  copyVars?: Record<string, string | number>;
  // No medical content here. See docs/04 §8.
};

function buildRedisOptions(): RedisOptions {
  const u = new URL(REDIS_URL);
  const opts: RedisOptions = {
    host: u.hostname,
    port: Number.parseInt(u.port || "6379", 10),
    username: u.username || undefined,
    password: u.password || undefined,
    maxRetriesPerRequest: null, // BullMQ requirement
    enableReadyCheck: false,
  };
  if (u.protocol === "rediss:") {
    // TLS (Upstash). Empty object enables default TLS settings.
    opts.tls = {};
  }
  return opts;
}

const redisOptions = buildRedisOptions();
const connection = new IORedis(redisOptions);

connection.on("error", (err) => log.warn({ err: err.message }, "redis error"));
connection.on("connect", () => log.info({ host: redisOptions.host, tls: !!redisOptions.tls }, "redis connected"));

export const notificationsQueue = new Queue<NotificationJob>("notifications", {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 60_000 }, // 1m, 2m, 4m, 8m, 16m
    removeOnComplete: { age: 24 * 3600, count: 1000 },
    removeOnFail: { age: 7 * 24 * 3600 }, // keep failures for forensics
  },
});

export function startNotifierWorker() {
  const worker = new Worker<NotificationJob>(
    "notifications",
    async (job) => {
      // Sprint-0: log the dispatch with zero medical content (just channel,
      // recipient, copy key). Real APNs / FCM / SES integrations land in the
      // Phase 2 sprint per docs/10.
      log.info(
        {
          jobId: job.id,
          channel: job.data.channel,
          recipientUserId: job.data.recipientUserId,
          copyKey: job.data.copyKey,
          attempt: job.attemptsMade + 1,
        },
        "dispatching notification",
      );
      return { ok: true, dispatchedAt: new Date().toISOString() };
    },
    {
      connection,
      concurrency: 10,
    },
  );

  worker.on("failed", (job, err) => {
    log.warn({ jobId: job?.id, err: err.message, attempt: job?.attemptsMade }, "notification failed");
  });
  worker.on("completed", (job) => {
    log.info({ jobId: job.id, copyKey: job.data.copyKey }, "notification completed");
  });

  return worker;
}

// Run as a worker when invoked as a script (works for both ESM via tsx and CJS).
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
  const worker = startNotifierWorker();
  log.info("notifier worker started");
  const shutdown = async (signal: string) => {
    log.info({ signal }, "shutting down");
    await worker.close();
    await connection.quit();
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}
