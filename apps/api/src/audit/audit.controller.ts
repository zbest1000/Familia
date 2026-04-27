import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { z } from "zod";

import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import type { RequestUser } from "../auth/auth.types";
import { PrismaService } from "../common/prisma.service";

const QueryDto = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  cursor: z.string().uuid().optional(),
  eventType: z.string().optional(),
  scope: z.enum(["mine", "by_me"]).default("mine"),
});

@UseGuards(AuthGuard)
@Controller("audit")
export class AuditController {
  constructor(private readonly db: PrismaService) {}

  /**
   * Returns audit entries for the current user.
   * - scope='mine': entries where the user is the TARGET (privacy view —
   *   "who touched my data"). This is the privacy-promise surface.
   * - scope='by_me': entries where the user is the ACTOR (transparency
   *   view — "what I did").
   *
   * Cursor-paginated by eventId. See docs/14 §11.
   */
  @Get()
  async list(@CurrentUser() me: RequestUser, @Query() rawQuery: unknown) {
    const q = QueryDto.parse(rawQuery);

    const where =
      q.scope === "mine"
        ? { targetUserId: me.userId }
        : { actorUserId: me.userId };

    const rows = await this.db.auditEntry.findMany({
      where: { ...where, ...(q.eventType ? { eventType: q.eventType } : {}) },
      take: q.limit + 1,
      ...(q.cursor ? { skip: 1, cursor: { eventId: q.cursor } } : {}),
      orderBy: [{ createdAt: "desc" }, { eventId: "desc" }],
      select: {
        eventId: true,
        eventType: true,
        subjectId: true,
        actorUserId: true,
        targetUserId: true,
        fromState: true,
        toState: true,
        metadata: true,
        policyVersion: true,
        requestSource: true,
        clientIp: true,
        createdAt: true,
      },
    });

    const hasMore = rows.length > q.limit;
    const items = hasMore ? rows.slice(0, q.limit) : rows;
    const nextCursor = hasMore ? items.at(-1)?.eventId ?? null : null;

    return { items, nextCursor };
  }
}
