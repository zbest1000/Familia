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
import { NewMedicationDto, UpdateMedicationDto, parseApproxDate } from "./dto";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ReqMeta = { actorUserId: string; clientIp?: string | null };

@Injectable()
export class MedicationsService {
  constructor(
    private readonly db: PrismaService,
    private readonly consent: ConsentService,
    private readonly audit: AuditService,
  ) {}

  async list(targetUserId: string, meta: ReqMeta) {
    await this.evaluateRead({
      actor: meta.actorUserId,
      target: targetUserId,
      ip: meta.clientIp,
    });
    const rows = await this.db.medication.findMany({
      where: { userId: targetUserId },
      orderBy: [{ status: "asc" }, { name: "asc" }],
    });
    return rows;
  }

  async getById(id: string, meta: ReqMeta) {
    const row = await this.db.medication.findUnique({ where: { id } });
    if (!row) throw new NotFoundException();
    await this.evaluateRead({
      actor: meta.actorUserId,
      target: row.userId,
      ip: meta.clientIp,
    });
    return row;
  }

  async create(targetUserId: string, dto: NewMedicationDto, meta: ReqMeta) {
    if (meta.actorUserId !== targetUserId) {
      throw new ForbiddenException("you can only add records to your own profile");
    }
    const profile = await this.db.profile.findFirst({
      where: { ownerUserId: targetUserId, kind: "self" },
    });
    if (!profile) throw new NotFoundException("self-profile missing");

    const created = await this.db.$transaction(async (tx) => {
      const med = await tx.medication.create({
        data: {
          userId: targetUserId,
          profileId: profile.id,
          name: dto.name,
          genericName: dto.genericName ?? null,
          doseValue: dto.doseValue ?? null,
          doseUnit: dto.doseUnit ?? null,
          doseText: dto.doseText ?? null,
          route: dto.route ?? null,
          frequencyText: dto.frequencyText ?? null,
          status: dto.status,
          startDate: parseApproxDate(dto.startDate),
          stopDate: parseApproxDate(dto.stopDate),
          prescriber: dto.prescriber ?? null,
          pharmacy: dto.pharmacy ?? null,
          reason: dto.reason ?? null,
          notes: dto.notes ?? null,
          source: "manual",
          sensitivity: "standard",
        },
      });
      return med;
    });

    await this.audit.write({
      eventType: "record.created",
      subjectId: created.id,
      actorUserId: meta.actorUserId,
      targetUserId,
      fromState: null,
      toState: created.status,
      metadata: { kind: "medication", name: created.name },
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });

    return created;
  }

  async update(id: string, dto: UpdateMedicationDto, meta: ReqMeta) {
    const existing = await this.db.medication.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    if (existing.userId !== meta.actorUserId) {
      throw new ForbiddenException("you can only edit your own records");
    }

    const updated = await this.db.medication.update({
      where: { id },
      data: stripUndef({
        name: dto.name,
        genericName: dto.genericName,
        doseValue: dto.doseValue,
        doseUnit: dto.doseUnit,
        doseText: dto.doseText,
        route: dto.route,
        frequencyText: dto.frequencyText,
        status: dto.status,
        startDate: dto.startDate !== undefined ? parseApproxDate(dto.startDate) : undefined,
        stopDate: dto.stopDate !== undefined ? parseApproxDate(dto.stopDate) : undefined,
        prescriber: dto.prescriber,
        pharmacy: dto.pharmacy,
        reason: dto.reason,
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
      metadata: { kind: "medication", changedKeys: Object.keys(dto) },
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });

    return updated;
  }

  async softDelete(id: string, meta: ReqMeta): Promise<{ ok: true }> {
    const existing = await this.db.medication.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    if (existing.userId !== meta.actorUserId) {
      throw new ForbiddenException("you can only delete your own records");
    }
    // No deletedAt column on Medication yet — for now mark status=completed,
    // a future schema addition will introduce a real soft-delete column.
    const updated = await this.db.medication.update({
      where: { id },
      data: { status: "completed", stopDate: new Date() },
    });
    await this.audit.write({
      eventType: "record.soft_deleted",
      subjectId: id,
      actorUserId: meta.actorUserId,
      targetUserId: existing.userId,
      fromState: existing.status,
      toState: updated.status,
      metadata: { kind: "medication", name: existing.name },
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });
    return { ok: true };
  }

  // ─── helpers ────────────────────────────────────────────────────────────

  private async evaluateRead(args: {
    actor: string;
    target: string;
    ip: string | null | undefined;
  }) {
    if (!UUID_RE.test(args.target)) {
      throw new NotFoundException();
    }
    // Audit FK constraint requires target user to exist. We surface a clean
    // 404 rather than letting the audit insert blow up with a 500.
    if (args.actor !== args.target) {
      const exists = await this.db.user.findUnique({
        where: { id: args.target },
        select: { id: true },
      });
      if (!exists) throw new NotFoundException();
    }

    const decision = await this.consent.evaluate({
      actorUserId: args.actor,
      targetUserId: args.target,
      resource: {
        id: "list",
        category: "medications",
        sensitivity: "standard",
        ownerUserId: args.target,
      },
      purpose: "read",
    });
    await this.audit.write({
      eventType: "consent.access_evaluated",
      subjectId: `medications:${args.target}`,
      actorUserId: args.actor,
      targetUserId: args.target,
      fromState: null,
      toState: decision.decision,
      metadata: { reason: decision.reason, scope: "medications" },
      policyVersion: decision.policyVersion,
      requestSource: "api",
      clientIp: args.ip ?? null,
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
