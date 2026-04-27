// Wires a BullMQ Queue to Redis (Upstash via TLS or local) so other modules
// can enqueue jobs that the standalone services/notifier worker drains.
//
// Resilience: if Redis is unavailable at startup, ioredis retries in the
// background and queue.add throws. Callers should treat enqueue as
// best-effort (we always also write the equivalent record to Postgres
// for durability — see AlertsService writes to alert_recipients).

import { Module, type OnModuleDestroy, type OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue, type RedisOptions } from "bullmq";
import IORedis from "ioredis";

import { ALERT_QUEUE, NOTIFIER_QUEUE_TOKEN } from "./notifier.tokens";

function buildRedisOptions(url: string): RedisOptions {
  const u = new URL(url);
  const opts: RedisOptions = {
    host: u.hostname,
    port: Number.parseInt(u.port || "6379", 10),
    username: u.username || undefined,
    password: u.password || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
  if (u.protocol === "rediss:") opts.tls = {};
  return opts;
}

let connection: IORedis | null = null;
let queue: Queue | null = null;

@Module({
  providers: [
    {
      provide: NOTIFIER_QUEUE_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>("REDIS_URL", "redis://localhost:6379");
        const log = new Logger("NotifierQueue");
        connection = new IORedis(buildRedisOptions(url));
        connection.on("connect", () => log.log(`redis connected (${new URL(url).hostname})`));
        connection.on("error", (e) => log.warn(`redis error: ${e.message}`));
        queue = new Queue(ALERT_QUEUE, {
          connection,
          defaultJobOptions: {
            attempts: 5,
            backoff: { type: "exponential", delay: 60_000 },
            removeOnComplete: { age: 24 * 3600, count: 1000 },
            removeOnFail: { age: 7 * 24 * 3600 },
          },
        });
        return queue;
      },
    },
  ],
  exports: [NOTIFIER_QUEUE_TOKEN],
})
export class NotifierModule implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    /* connection initialized in factory */
  }

  async onModuleDestroy(): Promise<void> {
    await queue?.close();
    await connection?.quit();
    queue = null;
    connection = null;
  }
}
