import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";

import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import type { RequestUser } from "../auth/auth.types";
import { NewMedicationDto, UpdateMedicationDto } from "./dto";
import { MedicationsService } from "./medications.service";

function clientIp(req: Request): string | null {
  const fwd = req.headers["x-forwarded-for"];
  return Array.isArray(fwd) ? fwd[0] ?? null : fwd?.split(",")[0]?.trim() ?? req.ip ?? null;
}

@UseGuards(AuthGuard)
@Controller("health/medications")
export class MedicationsController {
  constructor(private readonly meds: MedicationsService) {}

  @Get()
  async list(@CurrentUser() me: RequestUser, @Query("userId") userIdQ: string | undefined, @Req() req: Request) {
    const targetUserId = userIdQ ?? me.userId;
    return this.meds.list(targetUserId, { actorUserId: me.userId, clientIp: clientIp(req) });
  }

  @Get(":id")
  async get(@CurrentUser() me: RequestUser, @Param("id", new ParseUUIDPipe()) id: string, @Req() req: Request) {
    return this.meds.getById(id, { actorUserId: me.userId, clientIp: clientIp(req) });
  }

  @Post()
  async create(@CurrentUser() me: RequestUser, @Body() body: unknown, @Req() req: Request) {
    const dto = NewMedicationDto.parse(body);
    return this.meds.create(me.userId, dto, { actorUserId: me.userId, clientIp: clientIp(req) });
  }

  @Patch(":id")
  async update(@CurrentUser() me: RequestUser, @Param("id", new ParseUUIDPipe()) id: string, @Body() body: unknown, @Req() req: Request) {
    const dto = UpdateMedicationDto.parse(body);
    return this.meds.update(id, dto, { actorUserId: me.userId, clientIp: clientIp(req) });
  }

  @Delete(":id")
  async remove(@CurrentUser() me: RequestUser, @Param("id", new ParseUUIDPipe()) id: string, @Req() req: Request) {
    return this.meds.softDelete(id, { actorUserId: me.userId, clientIp: clientIp(req) });
  }
}
