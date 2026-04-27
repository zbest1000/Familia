import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { POLICY_VERSION } from "@familia/consent-engine";

import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../common/prisma.service";

export const NewCheckInDto = z.object({
  cadence: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  physical: z.number().int().min(1).max(10).optional(),
  mental: z.number().int().min(1).max(10).optional(),
  energy: z.number().int().min(1).max(10).optional(),
  pain: z.number().int().min(1).max(10).optional(),
  symptoms: z.array(z.string().max(60)).max(40).default([]),
  freeText: z.string().max(2000).optional(),
});
export type NewCheckInDto = z.infer<typeof NewCheckInDto>;

@Injectable()
export class CheckInsService {
  constructor(
    private readonly db: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(
    userId: string,
    dto: NewCheckInDto,
    meta: { clientIp?: string | null },
  ) {
    const profile = await this.db.profile.findFirst({
      where: { ownerUserId: userId, kind: "self" },
    });
    if (!profile) throw new NotFoundException("self-profile missing");

    const created = await this.db.checkIn.create({
      data: {
        userId,
        profileId: profile.id,
        cadence: dto.cadence,
        scoredAt: new Date(),
        physical: dto.physical ?? null,
        mental: dto.mental ?? null,
        energy: dto.energy ?? null,
        pain: dto.pain ?? null,
        symptoms: dto.symptoms,
        freeText: dto.freeText ?? null,
      },
    });

    await this.audit.write({
      eventType: "record.created",
      subjectId: created.id,
      actorUserId: userId,
      targetUserId: userId,
      fromState: null,
      toState: "saved",
      metadata: { kind: "check_in", cadence: dto.cadence },
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });

    return created;
  }

  async list(userId: string, limit = 30) {
    return this.db.checkIn.findMany({
      where: { userId },
      orderBy: { scoredAt: "desc" },
      take: limit,
    });
  }

  async latest(userId: string) {
    return this.db.checkIn.findFirst({
      where: { userId },
      orderBy: { scoredAt: "desc" },
    });
  }
}
