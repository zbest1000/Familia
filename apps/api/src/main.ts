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

  // Graceful shutdown — see docs/16 §1.
  app.enableShutdownHooks();

  await app.listen(port, "0.0.0.0");
  log.info({ port }, "FAMILIA API listening");
}

bootstrap().catch((err) => {
  log.error({ err }, "API failed to start");
  process.exit(1);
});
