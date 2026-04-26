import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";

import { POLICY_VERSION } from "@familia/consent-engine";

import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../common/prisma.service";
import { JwtService } from "./jwt.service";
import { OtpService, type OtpVerifyResult } from "./otp.service";
import type { VerifySigninDto, VerifySignupDto } from "./dto";

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  accessTtlSeconds: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService,
    private readonly otp: OtpService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  async startSignup(args: { email: string; ipAddress?: string | null }) {
    return this.otp.issue({ email: args.email, purpose: "signup", ipAddress: args.ipAddress });
  }

  async startSignin(args: { email: string; ipAddress?: string | null }) {
    // We deliberately don't reveal whether the email exists — issue a challenge
    // either way to avoid an enumeration oracle. Verification fails for unknown
    // emails when the OTP is verified.
    return this.otp.issue({ email: args.email, purpose: "signin", ipAddress: args.ipAddress });
  }

  async completeSignup(
    dto: VerifySignupDto,
    meta: { ipAddress?: string | null; userAgent?: string | null },
  ): Promise<{ userId: string } & SessionTokens> {
    const v = await this.otp.verify({ challengeId: dto.challengeId, code: dto.code });
    this.assertOtp(v, "signup");

    if (!v.email) throw new UnauthorizedException("challenge missing email");
    const email = v.email;
    const existing = await this.db.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("an account with that email already exists; sign in instead");
    }

    const created = await this.db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          firstName: dto.firstName,
          lastName: dto.lastName ?? null,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          timezone: dto.timezone ?? null,
        },
      });
      // Create the user's own self-profile.
      await tx.profile.create({
        data: {
          kind: "self",
          ownerUserId: user.id,
          displayName: [user.firstName, user.lastName].filter(Boolean).join(" ").trim(),
          dateOfBirth: user.dateOfBirth,
        },
      });
      return user;
    });

    await this.audit.write({
      eventType: "user.created",
      subjectId: created.id,
      actorUserId: created.id,
      targetUserId: created.id,
      fromState: null,
      toState: "active",
      metadata: { via: "signup" },
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.ipAddress ?? null,
    });

    return { userId: created.id, ...(await this.issueSession(created.id, created.email, meta)) };
  }

  async completeSignin(
    dto: VerifySigninDto,
    meta: { ipAddress?: string | null; userAgent?: string | null },
  ): Promise<{ userId: string } & SessionTokens> {
    const v = await this.otp.verify({ challengeId: dto.challengeId, code: dto.code });
    this.assertOtp(v, "signin");

    if (!v.email) throw new UnauthorizedException("challenge missing email");
    const email = v.email;
    const user = await this.db.user.findUnique({ where: { email } });
    if (!user) {
      // OTP verified but no account — nudge to signup.
      throw new UnauthorizedException("no account for that email");
    }

    return { userId: user.id, ...(await this.issueSession(user.id, user.email, meta)) };
  }

  async refresh(
    refreshToken: string,
    meta: { ipAddress?: string | null; userAgent?: string | null },
  ): Promise<SessionTokens> {
    const hash = this.jwt.hashRefreshToken(refreshToken);
    const session = await this.db.session.findUnique({ where: { refreshTokenHash: hash } });
    if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException("invalid refresh token");
    }
    // Rotate: revoke the old session and mint a new one.
    const newToken = this.jwt.generateRefreshToken();
    const user = await this.db.user.findUnique({ where: { id: session.userId } });
    if (!user) throw new UnauthorizedException("user not found");

    const updated = await this.db.$transaction(async (tx) => {
      await tx.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      return tx.session.create({
        data: {
          userId: session.userId,
          refreshTokenHash: newToken.hash,
          deviceLabel: session.deviceLabel,
          ipAddress: meta.ipAddress ?? null,
          userAgent: meta.userAgent ?? null,
          expiresAt: newToken.expiresAt,
        },
      });
    });

    const accessToken = this.jwt.signAccessToken({
      sub: user.id,
      sid: updated.id,
      email: user.email,
    });

    return {
      accessToken,
      refreshToken: newToken.token,
      accessTtlSeconds: this.jwt.accessTtl,
    };
  }

  async signout(args: { sessionId: string; userId: string; ipAddress?: string | null }) {
    await this.db.session.update({
      where: { id: args.sessionId },
      data: { revokedAt: new Date() },
    });
    await this.audit.write({
      eventType: "auth.signed_out",
      subjectId: args.sessionId,
      actorUserId: args.userId,
      targetUserId: args.userId,
      fromState: "active",
      toState: "revoked",
      metadata: {},
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: args.ipAddress ?? null,
    });
  }

  // ─── helpers ────────────────────────────────────────────────────────────

  private assertOtp(
    v: OtpVerifyResult,
    purpose: "signup" | "signin",
  ): asserts v is Extract<OtpVerifyResult, { ok: true }> {
    if (!v.ok) {
      throw new UnauthorizedException(`otp ${v.reason} (${purpose})`);
    }
  }

  private async issueSession(
    userId: string,
    email: string | null,
    meta: { ipAddress?: string | null; userAgent?: string | null },
  ): Promise<SessionTokens> {
    const refresh = this.jwt.generateRefreshToken();
    const session = await this.db.session.create({
      data: {
        userId,
        refreshTokenHash: refresh.hash,
        deviceLabel: meta.userAgent?.slice(0, 100) ?? null,
        ipAddress: meta.ipAddress ?? null,
        userAgent: meta.userAgent ?? null,
        expiresAt: refresh.expiresAt,
      },
    });
    const accessToken = this.jwt.signAccessToken({
      sub: userId,
      sid: session.id,
      email,
    });
    await this.audit.write({
      eventType: "auth.signed_in",
      subjectId: session.id,
      actorUserId: userId,
      targetUserId: userId,
      fromState: null,
      toState: "active",
      metadata: {},
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.ipAddress ?? null,
    });
    return {
      accessToken,
      refreshToken: refresh.token,
      accessTtlSeconds: this.jwt.accessTtl,
    };
  }
}
