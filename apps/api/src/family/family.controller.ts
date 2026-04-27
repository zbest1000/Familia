import {
  Body,
  Controller,
  Delete,
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
import { AcceptInviteDto, CreateInviteDto } from "./dto";
import { FamilyService } from "./family.service";

function clientIp(req: Request): string | null {
  const fwd = req.headers["x-forwarded-for"];
  return Array.isArray(fwd) ? fwd[0] ?? null : fwd?.split(",")[0]?.trim() ?? req.ip ?? null;
}

@Controller("family")
export class FamilyController {
  constructor(private readonly family: FamilyService) {}

  // ─── Sender ─────────────────────────────────────────────────────────────

  @UseGuards(AuthGuard)
  @Post("invites")
  async create(@CurrentUser() me: RequestUser, @Body() body: unknown, @Req() req: Request) {
    const dto = CreateInviteDto.parse(body);
    return this.family.createInvite(dto, { actorUserId: me.userId, clientIp: clientIp(req) });
  }

  @UseGuards(AuthGuard)
  @Get("invites")
  async list(@CurrentUser() me: RequestUser, @Req() req: Request) {
    return this.family.listOutgoing({ actorUserId: me.userId, clientIp: clientIp(req) });
  }

  @UseGuards(AuthGuard)
  @Delete("invites/:id")
  async revoke(
    @CurrentUser() me: RequestUser,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ) {
    return this.family.revoke(id, { actorUserId: me.userId, clientIp: clientIp(req) });
  }

  // ─── Recipient (auth required so we know who's accepting) ──────────────

  @Get("invites/by-token/:token")
  async preview(@Param("token") token: string) {
    return this.family.previewByToken(token);
  }

  @UseGuards(AuthGuard)
  @Post("invites/by-token/:token/accept")
  async accept(
    @CurrentUser() me: RequestUser,
    @Param("token") token: string,
    @Body() body: unknown,
    @Req() req: Request,
  ) {
    const dto = AcceptInviteDto.parse(body ?? {});
    return this.family.accept(token, dto, { actorUserId: me.userId, clientIp: clientIp(req) });
  }

  @UseGuards(AuthGuard)
  @Post("invites/by-token/:token/decline")
  async decline(
    @CurrentUser() me: RequestUser,
    @Param("token") token: string,
    @Req() req: Request,
  ) {
    return this.family.decline(token, { actorUserId: me.userId, clientIp: clientIp(req) });
  }

  // ─── Relationships + Grants ────────────────────────────────────────────

  @UseGuards(AuthGuard)
  @Get("relationships")
  async listRelationships(@CurrentUser() me: RequestUser, @Req() req: Request) {
    return this.family.listRelationships({ actorUserId: me.userId, clientIp: clientIp(req) });
  }

  @UseGuards(AuthGuard)
  @Delete("relationships/:id")
  async removeRelationship(
    @CurrentUser() me: RequestUser,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ) {
    return this.family.removeRelationship(id, { actorUserId: me.userId, clientIp: clientIp(req) });
  }

  @UseGuards(AuthGuard)
  @Get("grants")
  async listGrants(@CurrentUser() me: RequestUser, @Req() req: Request) {
    return this.family.listOutgoingGrants({ actorUserId: me.userId, clientIp: clientIp(req) });
  }

  @UseGuards(AuthGuard)
  @Delete("grants/:id")
  async revokeGrant(
    @CurrentUser() me: RequestUser,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ) {
    return this.family.revokeGrant(id, { actorUserId: me.userId, clientIp: clientIp(req) });
  }
}
