// Custom throttler that keys by JWT user id when present, IP otherwise.
//
// Default ThrottlerGuard tracks per-IP, which makes a corporate NAT or a
// shared proxy share one limit across many users. By keying on the
// authenticated user id (set by AuthGuard on the request) we get
// per-user fairness; unauthenticated traffic still falls back to IP.

import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { Request } from "express";

@Injectable()
export class UserScopedThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(req: Request): Promise<string> {
    const userId = (req as Request & { user?: { userId?: string } }).user?.userId;
    if (userId) return `user:${userId}`;
    const fwd = req.headers["x-forwarded-for"];
    const ip =
      (Array.isArray(fwd) ? fwd[0] : fwd?.split(",")[0]?.trim()) ?? req.ip ?? "anon";
    return `ip:${ip}`;
  }
}
