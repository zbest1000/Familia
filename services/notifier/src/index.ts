// Notifier worker. Processes the `notifications` queue and dispatches
// push (APNs/FCM) and email (SES). Sprint-0: skeleton only.
//
// Resilience: see ../../README.md and docs/16. This worker is non-critical:
// failures retry per BullMQ defaults, in-app inbox covers the gap.

import { Queue, Worker } from "bullmq";
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

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

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
      log.info({ jobId: job.id, channel: job.data.channel }, "dispatching notification");
      // TODO: wire APNs / FCM / SES with circuit breakers.
      // For Sprint-0 we just log.
      return { ok: true };
    },
    {
      connection,
      concurrency: 10,
    },
  );

  worker.on("failed", (job, err) => {
    log.warn({ jobId: job?.id, err: err.message }, "notification failed");
  });

  return worker;
}

if (require.main === module) {
  const worker = startNotifierWorker();
  log.info("notifier worker started");
  process.on("SIGTERM", async () => {
    log.info("SIGTERM — shutting down");
    await worker.close();
    await connection.quit();
    process.exit(0);
  });
}
