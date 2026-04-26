// CLI helper: enqueue a single test notification job, then exit.
// Useful for smoke-testing the worker against the configured Redis (Upstash).
//
// Usage: tsx src/enqueue.ts <recipientUserId> <copyKey>

import { notificationsQueue } from "./index.js";

const recipientUserId = process.argv[2] ?? "smoke-recipient";
const copyKey = process.argv[3] ?? "push.alertReceived";

const job = await notificationsQueue.add(
  "test",
  {
    channel: "push",
    recipientUserId,
    copyKey,
    copyVars: { sender: "Smoke Test" },
  },
  { jobId: `smoke-${Date.now()}` },
);

console.log(`enqueued job ${job.id} (queue: notifications)`);
await notificationsQueue.close();
process.exit(0);
