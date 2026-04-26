import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { POLICY_VERSION } from "@familia/consent-engine";

import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../common/prisma.service";
import { ConsentService } from "../consent/consent.service";
import { NewConditionDto, UpdateConditionDto, parseApproxDate } from "./dto";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ReqMeta = { actorUserId: string; clientIp?: string | null };

@Injectable()
export class ConditionsService {
  constructor(
    private readonly db: PrismaService,
    private readonly consent: ConsentService,
    private readonly audit: AuditService,
  ) {}

  async list(targetUserId: string, meta: ReqMeta) {
    await this.evaluateRead(meta.actorUserId, targetUserId, meta.clientIp);
    return this.db.condition.findMany({
      where: { userId: targetUserId },
      orderBy: [{ status: "asc" }, { name: "asc" }],
    });
  }

  async getById(id: string, meta: ReqMeta) {
    const row = await this.db.condition.findUnique({ where: { id } });
    if (!row) throw new NotFoundException();
    await this.evaluateRead(meta.actorUserId, row.userId, meta.clientIp);
    return row;
  }

  async create(targetUserId: string, dto: NewConditionDto, meta: ReqMeta) {
    if (meta.actorUserId !== targetUserId) {
      throw new ForbiddenException("you can only add records to your own profile");
    }
    const profile = await this.db.profile.findFirst({
      where: { ownerUserId: targetUserId, kind: "self" },
    });
    if (!profile) throw new NotFoundException("self-profile missing");

    const created = await this.db.condition.create({
      data: {
        userId: targetUserId,
        profileId: profile.id,
        name: dto.name,
        codeSystem: dto.codeSystem ?? null,
        code: dto.code ?? null,
        status: dto.status,
        onsetDate: parseApproxDate(dto.onsetDate),
        resolvedDate: parseApproxDate(dto.resolvedDate),
        severity: dto.severity ?? null,
        notes: dto.notes ?? null,
        source: "manual",
        sensitivity: "standard",
      },
    });

    await this.audit.write({
      eventType: "record.created",
      subjectId: created.id,
      actorUserId: meta.actorUserId,
      targetUserId,
      fromState: null,
      toState: created.status,
      metadata: { kind: "condition", name: created.name },
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });

    return created;
  }

  async update(id: string, dto: UpdateConditionDto, meta: ReqMeta) {
    const existing = await this.db.condition.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    if (existing.userId !== meta.actorUserId) {
      throw new ForbiddenException("you can only edit your own records");
    }
    const updated = await this.db.condition.update({
      where: { id },
      data: stripUndef({
        name: dto.name,
        codeSystem: dto.codeSystem,
        code: dto.code,
        status: dto.status,
        onsetDate: dto.onsetDate !== undefined ? parseApproxDate(dto.onsetDate) : undefined,
        resolvedDate: dto.resolvedDate !== undefined ? parseApproxDate(dto.resolvedDate) : undefined,
        severity: dto.severity,
        notes: dto.notes,
      }),
    });

    await this.audit.write({
      eventType: "record.updated",
      subjectId: id,
      actorUserId: meta.actorUserId,
      targetUserId: existing.userId,
      fromState: existing.status,
      toState: updated.status,
      metadata: { kind: "condition", changedKeys: Object.keys(dto) },
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });
    return updated;
  }

  async softDelete(id: string, meta: ReqMeta): Promise<{ ok: true }> {
    const existing = await this.db.condition.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    if (existing.userId !== meta.actorUserId) {
      throw new ForbiddenException("you can only delete your own records");
    }
    const updated = await this.db.condition.update({
      where: { id },
      data: { status: "resolved", resolvedDate: new Date() },
    });
    await this.audit.write({
      eventType: "record.soft_deleted",
      subjectId: id,
      actorUserId: meta.actorUserId,
      targetUserId: existing.userId,
      fromState: existing.status,
      toState: updated.status,
      metadata: { kind: "condition", name: existing.name },
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });
    return { ok: true };
  }

  private async evaluateRead(actor: string, target: string, ip?: string | null) {
    if (!UUID_RE.test(target)) throw new NotFoundException();
    if (actor !== target) {
      const exists = await this.db.user.findUnique({
        where: { id: target },
        select: { id: true },
      });
      if (!exists) throw new NotFoundException();
    }

    const decision = await this.consent.evaluate({
      actorUserId: actor,
      targetUserId: target,
      resource: {
        id: "list",
        category: "conditions",
        sensitivity: "standard",
        ownerUserId: target,
      },
      purpose: "read",
    });
    await this.audit.write({
      eventType: "consent.access_evaluated",
      subjectId: `conditions:${target}`,
      actorUserId: actor,
      targetUserId: target,
      fromState: null,
      toState: decision.decision,
      metadata: { reason: decision.reason, scope: "conditions" },
      policyVersion: decision.policyVersion,
      requestSource: "api",
      clientIp: ip ?? null,
    });
    if (decision.decision === "deny") {
      throw new ForbiddenException(`access denied: ${decision.reason}`);
    }
  }
}

function stripUndef<T extends Record<string, unknown>>(obj: T): Prisma.JsonObject {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out as Prisma.JsonObject;
}
