import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Request } from "express";

import { AuthService } from "./auth.service";
import { AuthGuard, CurrentUser } from "./auth.guard";
import {
  RefreshDto,
  StartChallengeDto,
  VerifySigninDto,
  VerifySignupDto,
} from "./dto";
import type { RequestUser } from "./auth.types";

function reqMeta(req: Request) {
  const fwd = req.headers["x-forwarded-for"];
  const ip = Array.isArray(fwd) ? fwd[0] : fwd?.split(",")[0]?.trim() ?? req.ip ?? null;
  return {
    ipAddress: ip ?? null,
    userAgent: req.headers["user-agent"] ?? null,
  };
}

// Tighter throttle on every auth endpoint: keyed per-IP since users are
// not yet authenticated. The `auth` named throttler in app.module is
// 10 req / 60s (vs 100 / 60s for the default `short`).
@Throttle({ auth: { limit: 10, ttl: 60_000 } })
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("signup/start")
  @HttpCode(200)
  async startSignup(@Body() body: unknown, @Req() req: Request) {
    const dto = StartChallengeDto.parse(body);
    return this.auth.startSignup({ email: dto.email, ipAddress: reqMeta(req).ipAddress });
  }

  @Post("signup/verify")
  @HttpCode(200)
  async verifySignup(@Body() body: unknown, @Req() req: Request) {
    const dto = VerifySignupDto.parse(body);
    return this.auth.completeSignup(dto, reqMeta(req));
  }

  @Post("signin/start")
  @HttpCode(200)
  async startSignin(@Body() body: unknown, @Req() req: Request) {
    const dto = StartChallengeDto.parse(body);
    return this.auth.startSignin({ email: dto.email, ipAddress: reqMeta(req).ipAddress });
  }

  @Post("signin/verify")
  @HttpCode(200)
  async verifySignin(@Body() body: unknown, @Req() req: Request) {
    const dto = VerifySigninDto.parse(body);
    return this.auth.completeSignin(dto, reqMeta(req));
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(@Body() body: unknown, @Req() req: Request) {
    const dto = RefreshDto.parse(body);
    return this.auth.refresh(dto.refreshToken, reqMeta(req));
  }

  @UseGuards(AuthGuard)
  @Delete("signout")
  @HttpCode(204)
  async signout(@CurrentUser() user: RequestUser, @Req() req: Request) {
    await this.auth.signout({
      sessionId: user.sessionId,
      userId: user.userId,
      ipAddress: reqMeta(req).ipAddress,
    });
  }
}
