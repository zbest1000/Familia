import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { z } from "zod";

import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import type { RequestUser } from "../auth/auth.types";
import { WearablesService } from "./wearables.service";

const Sample = z.object({
  source: z.enum(["apple_health", "google_health_connect", "fitbit", "garmin", "oura", "manual"]),
  metric: z.string().min(1).max(60),
  value: z.number().finite(),
  unit: z.string().max(20).optional(),
  capturedAt: z.string().datetime(),
});

const IngestDto = z.object({
  samples: z.array(Sample).min(1).max(1000),
});

function clientIp(req: Request): string | null {
  const fwd = req.headers["x-forwarded-for"];
  return Array.isArray(fwd) ? fwd[0] ?? null : fwd?.split(",")[0]?.trim() ?? req.ip ?? null;
}

@UseGuards(AuthGuard)
@Controller("wearables")
export class WearablesController {
  constructor(private readonly wearables: WearablesService) {}

  @Post("samples")
  async ingest(@CurrentUser() me: RequestUser, @Body() body: unknown, @Req() req: Request) {
    const dto = IngestDto.parse(body);
    return this.wearables.ingest(me.userId, dto.samples, {
      actorUserId: me.userId,
      clientIp: clientIp(req),
    });
  }

  @Get("summary")
  async summary(@CurrentUser() me: RequestUser, @Query("days") daysQ?: string) {
    const days = daysQ ? Math.min(Math.max(Number.parseInt(daysQ, 10), 1), 90) : 7;
    return this.wearables.summary(me.userId, days);
  }
}
