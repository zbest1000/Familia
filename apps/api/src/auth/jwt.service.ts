import { randomBytes } from "node:crypto";

import { Injectable, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import jwt from "jsonwebtoken";

import { sha256 } from "@familia/crypto";

export type AccessTokenPayload = {
  sub: string; // userId
  sid: string; // sessionId
  email: string | null;
};

@Injectable()
export class JwtService implements OnModuleInit {
  private secret = "";
  private accessTtlSeconds = 900;
  private refreshTtlSeconds = 60 * 60 * 24 * 30;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const secret = this.config.get<string>("JWT_SECRET", "dev-only-change-me");
    if (this.config.get<string>("NODE_ENV") === "production" && secret === "dev-only-change-me") {
      throw new Error("Refusing to start: JWT_SECRET is the dev placeholder in production");
    }
    this.secret = secret;
    this.accessTtlSeconds = Number.parseInt(
      this.config.get<string>("JWT_ACCESS_TTL_SECONDS", "900"),
      10,
    );
    this.refreshTtlSeconds = Number.parseInt(
      this.config.get<string>("JWT_REFRESH_TTL_SECONDS", String(60 * 60 * 24 * 30)),
      10,
    );
  }

  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.secret, {
      algorithm: "HS256",
      expiresIn: this.accessTtlSeconds,
    });
  }

  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret, { algorithms: ["HS256"] });
      if (typeof decoded !== "object" || decoded === null) return null;
      const p = decoded as Partial<AccessTokenPayload> & { exp?: number };
      if (typeof p.sub !== "string" || typeof p.sid !== "string") return null;
      return { sub: p.sub, sid: p.sid, email: p.email ?? null };
    } catch {
      return null;
    }
  }

  // Refresh tokens are opaque (NOT JWTs). Caller stores sha256 in DB.
  generateRefreshToken(): { token: string; hash: string; expiresAt: Date } {
    const token = randomBytes(48).toString("base64url");
    return {
      token,
      hash: sha256(token),
      expiresAt: new Date(Date.now() + this.refreshTtlSeconds * 1000),
    };
  }

  hashRefreshToken(token: string): string {
    return sha256(token);
  }

  get accessTtl(): number {
    return this.accessTtlSeconds;
  }
}
