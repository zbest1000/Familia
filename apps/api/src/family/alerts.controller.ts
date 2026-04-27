import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";

import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import type { RequestUser } from "../auth/auth.types";
import { AlertsService } from "./alerts.service";
import { CreateAlertDto } from "./dto";

function clientIp(req: Request): string | null {
  const fwd = req.headers["x-forwarded-for"];
  return Array.isArray(fwd) ? fwd[0] ?? null : fwd?.split(",")[0]?.trim() ?? req.ip ?? null;
}

@UseGuards(AuthGuard)
@Controller("family/alerts")
export class AlertsController {
  constructor(private readonly alerts: AlertsService) {}

  @Post()
  async send(@CurrentUser() me: RequestUser, @Body() body: unknown, @Req() req: Request) {
    const dto = CreateAlertDto.parse(body);
    return this.alerts.send(dto, { actorUserId: me.userId, clientIp: clientIp(req) });
  }

  @Get()
  async listSent(@CurrentUser() me: RequestUser, @Req() req: Request) {
    return this.alerts.listSent({ actorUserId: me.userId, clientIp: clientIp(req) });
  }

  @Get("inbox")
  async inbox(@CurrentUser() me: RequestUser, @Req() req: Request) {
    return this.alerts.inbox({ actorUserId: me.userId, clientIp: clientIp(req) });
  }

  @Post(":id/ack")
  async ack(
    @CurrentUser() me: RequestUser,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ) {
    return this.alerts.acknowledge(id, { actorUserId: me.userId, clientIp: clientIp(req) });
  }
}
