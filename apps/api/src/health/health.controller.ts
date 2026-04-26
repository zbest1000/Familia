import { Controller, Get, Inject } from "@nestjs/common";

import { PrismaService } from "../common/prisma.service";

// Three-endpoint pattern per docs/16 §10.

@Controller("health")
export class HealthController {
  constructor(@Inject(PrismaService) private readonly db: PrismaService) {}

  // Liveness: is the process up?
  @Get("live")
  live(): { status: "ok" } {
    return { status: "ok" };
  }

  // Readiness: are dependencies usable?
  @Get("ready")
  async ready(): Promise<{ status: "ok" | "degraded"; checks: Record<string, string> }> {
    const checks: Record<string, string> = {};
    try {
      await this.db.$queryRaw`SELECT 1`;
      checks.postgres = "ok";
    } catch (err) {
      checks.postgres = `fail:${(err as Error).message}`;
    }
    const status = Object.values(checks).every((v) => v === "ok") ? "ok" : "degraded";
    return { status, checks };
  }

  // Startup: have we warmed up?
  @Get("startup")
  startup(): { status: "ok" } {
    return { status: "ok" };
  }

  // Combined endpoint for the SDK.
  @Get()
  async overall(): Promise<{ status: "ok" | "degraded"; checks: Record<string, string> }> {
    return this.ready();
  }
}
