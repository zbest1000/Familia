// MUST be the first import: starts the OTel SDK before any HTTP/Redis/PG
// modules load so auto-instrumentation can patch them. See
// packages/observability/src/init.ts.
import "@familia/observability/init";

import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import pino from "pino";

import { AppModule } from "./app.module";
import { ZodExceptionFilter } from "./common/exceptions.filter";

const log = pino({ name: "api", level: process.env.LOG_LEVEL ?? "info" });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const port = Number.parseInt(process.env.PORT ?? "3000", 10);

  app.use(helmet());
  app.useGlobalFilters(new ZodExceptionFilter());

  // CORS — explicit allowlist driven by env. Defaults are local dev origins.
  const origins = (process.env.WEB_ORIGINS ?? "http://localhost:3001,http://127.0.0.1:3001")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Idempotency-Key"],
    credentials: false,
    maxAge: 600,
  });

  // Graceful shutdown — see docs/16 §1.
  app.enableShutdownHooks();

  await app.listen(port, "0.0.0.0");
  log.info({ port, corsOrigins: origins }, "FAMILIA API listening");
}

bootstrap().catch((err) => {
  log.error({ err }, "API failed to start");
  process.exit(1);
});
