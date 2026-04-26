import { randomInt } from "node:crypto";

import { Injectable, Logger } from "@nestjs/common";

import { sha256 } from "@familia/crypto";

import { PrismaService } from "../common/prisma.service";

const CHALLENGE_TTL_SECONDS = 600; // 10 minutes
const MAX_ATTEMPTS = 5;

export type OtpVerifyResult =
  | { ok: true; challengeId: string; email: string | null }
  | { ok: false; reason: "not_found" | "expired" | "consumed" | "too_many_attempts" | "wrong_code" };

@Injectable()
export class OtpService {
  private readonly log = new Logger("OtpService");

  constructor(private readonly db: PrismaService) {}

  async issue(args: {
    email?: string | null;
    purpose: "signup" | "signin";
    ipAddress?: string | null;
  }): Promise<{ challengeId: string }> {
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const codeHash = sha256(code);
    const expiresAt = new Date(Date.now() + CHALLENGE_TTL_SECONDS * 1000);

    const created = await this.db.authChallenge.create({
      data: {
        email: args.email ?? null,
        codeHash,
        purpose: args.purpose,
        expiresAt,
        ipAddress: args.ipAddress ?? null,
      },
    });

    // DEV: log the code so the developer can verify without SES wired.
    // PROD: replace with SES send + remove this log line.
    this.log.warn(
      `[dev-otp] purpose=${args.purpose} email=${args.email ?? "-"} code=${code} (challenge ${created.id})`,
    );

    return { challengeId: created.id };
  }

  async verify(args: { challengeId: string; code: string }): Promise<OtpVerifyResult> {
    const challenge = await this.db.authChallenge.findUnique({
      where: { id: args.challengeId },
    });
    if (!challenge) return { ok: false, reason: "not_found" };
    if (challenge.consumedAt) return { ok: false, reason: "consumed" };
    if (challenge.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };
    if (challenge.attempts >= MAX_ATTEMPTS)
      return { ok: false, reason: "too_many_attempts" };

    const wanted = sha256(args.code);
    if (wanted !== challenge.codeHash) {
      await this.db.authChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      return { ok: false, reason: "wrong_code" };
    }

    await this.db.authChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });
    return { ok: true, challengeId: challenge.id, email: challenge.email };
  }
}
