import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";

import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import type { RequestUser } from "../auth/auth.types";
import { CheckInsService, NewCheckInDto } from "./check-ins.service";

function clientIp(req: Request): string | null {
  const fwd = req.headers["x-forwarded-for"];
  return Array.isArray(fwd) ? fwd[0] ?? null : fwd?.split(",")[0]?.trim() ?? req.ip ?? null;
}

@UseGuards(AuthGuard)
@Controller("health/check-ins")
export class CheckInsController {
  constructor(private readonly checkIns: CheckInsService) {}

  @Post()
  async create(@CurrentUser() me: RequestUser, @Body() body: unknown, @Req() req: Request) {
    const dto = NewCheckInDto.parse(body);
    return this.checkIns.create(me.userId, dto, { clientIp: clientIp(req) });
  }

  @Get()
  async list(@CurrentUser() me: RequestUser, @Query("limit") limit?: string) {
    const n = limit ? Math.min(Math.max(Number.parseInt(limit, 10), 1), 200) : 30;
    return this.checkIns.list(me.userId, n);
  }

  @Get("latest")
  async latest(@CurrentUser() me: RequestUser) {
    return this.checkIns.latest(me.userId);
  }
}
