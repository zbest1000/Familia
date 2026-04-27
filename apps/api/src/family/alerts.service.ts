import { createHash } from "node:crypto";

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Queue } from "bullmq";

import { POLICY_VERSION } from "@familia/consent-engine";
import { t } from "@familia/copy";
import type { AlertType, AuditEventType, RelationshipClass, RelationshipType } from "@familia/domain";
import {
  containsGeneticLanguage,
  type MessageVariantKey,
  selectMessageVariant,
  variantMayContainGeneticLanguage,
} from "@familia/state-machines";

import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../common/prisma.service";
import { NOTIFIER_QUEUE_TOKEN } from "../notifier/notifier.tokens";
import { Inject } from "@nestjs/common";
import type { CreateAlertDto } from "./dto";

type ReqMeta = { actorUserId: string; clientIp?: string | null };

@Injectable()
export class AlertsService {
  constructor(
    private readonly db: PrismaService,
    private readonly audit: AuditService,
    @Inject(NOTIFIER_QUEUE_TOKEN) private readonly notifier: Queue,
  ) {}

  async preview(dto: CreateAlertDto, meta: ReqMeta) {
    const planned = await this.planRecipients(dto, meta);
    return {
      type: dto.type,
      topic: dto.topic,
      disclosureMode: dto.disclosureMode,
      recipients: planned.rendered.map((r) => ({
        recipientUserId: r.rid,
        relationshipClass: r.relationshipClass,
        variantKey: r.variantKey,
        text: r.text,
      })),
      skipped: planned.skipped,
    };
  }

  async send(dto: CreateAlertDto, meta: ReqMeta) {
    const { rendered, skipped, senderName } = await this.planRecipients(dto, meta);

    const contentHash = createHash("sha256")
      .update(JSON.stringify({ type: dto.type, topic: dto.topic, recipients: rendered.map((r) => ({ rid: r.rid, key: r.variantKey, hash: createHash("sha256").update(r.text).digest("hex") })) }))
      .digest("hex");

    // Persist alert + per-recipient rows + audit (one tx). All planning was
    // done above by planRecipients.
    void senderName; // already baked into rendered[].text
    const created = await this.db.$transaction(async (tx) => {
      const alert = await tx.alert.create({
        data: {
          senderUserId: meta.actorUserId,
          type: dto.type,
          topic: dto.topic,
          personalNote: dto.personalNote ?? null,
          disclosureMode: dto.disclosureMode,
          state: "sent",
          contentHash,
          approvedAt: new Date(),
          sentAt: new Date(),
        },
      });
      for (const r of rendered) {
        await tx.alertRecipient.create({
          data: {
            alertId: alert.id,
            recipientUserId: r.rid,
            relationshipClass: r.relationshipClass,
            messageVariantKey: r.variantKey,
            renderedMessage: r.text,
            renderedMessageHash: createHash("sha256").update(r.text).digest("hex"),
            state: "delivered",
            deliveredAt: new Date(),
          },
        });
      }
      return alert;
    });

    // Audit transitions (drafting → previewing → queued → sent).
    const transitions: Array<{
      from: string | null;
      to: string;
      evt: AuditEventType;
    }> = [
      { from: null, to: "drafting", evt: "alert.created" },
      { from: "drafting", to: "previewing", evt: "alert.previewed" },
      { from: "previewing", to: "queued", evt: "alert.approved" },
      { from: "queued", to: "sent", evt: "alert.sent" },
    ];
    for (const tr of transitions) {
      await this.audit.write({
        eventType: tr.evt,
        subjectId: created.id,
        actorUserId: meta.actorUserId,
        targetUserId: meta.actorUserId,
        fromState: tr.from,
        toState: tr.to,
        metadata: { type: dto.type, recipientCount: rendered.length, skipped: skipped.length },
        policyVersion: POLICY_VERSION,
        requestSource: "api",
        clientIp: meta.clientIp ?? null,
      });
    }

    // Per-recipient deliver audits + enqueue zero-content push notifications.
    for (const r of rendered) {
      await this.audit.write({
        eventType: "alert.delivered",
        subjectId: created.id,
        actorUserId: meta.actorUserId,
        targetUserId: r.rid,
        fromState: "queued",
        toState: "delivered",
        metadata: { variantKey: r.variantKey, relationshipClass: r.relationshipClass },
        policyVersion: POLICY_VERSION,
        requestSource: "api",
        clientIp: meta.clientIp ?? null,
      });
      await this.notifier.add(
        "alert.delivered",
        {
          channel: "push",
          recipientUserId: r.rid,
          copyKey: "push.alertReceived",
          copyVars: { sender: senderName ?? "A family member" },
        },
        { jobId: `alert:${created.id}:${r.rid}` },
      );
    }

    return {
      id: created.id,
      state: created.state,
      sentAt: created.sentAt?.toISOString() ?? null,
      contentHash,
      recipients: rendered.map((r) => ({
        recipientUserId: r.rid,
        relationshipClass: r.relationshipClass,
        variantKey: r.variantKey,
        text: r.text,
      })),
      skipped,
    };
  }

  async listSent(meta: ReqMeta) {
    return this.db.alert.findMany({
      where: { senderUserId: meta.actorUserId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        type: true,
        topic: true,
        state: true,
        disclosureMode: true,
        sentAt: true,
        createdAt: true,
        recipients: {
          select: {
            recipientUserId: true,
            relationshipClass: true,
            messageVariantKey: true,
            state: true,
            openedAt: true,
            acknowledgedAt: true,
          },
        },
      },
    });
  }

  async inbox(meta: ReqMeta) {
    const rows = await this.db.alertRecipient.findMany({
      where: { recipientUserId: meta.actorUserId },
      orderBy: { id: "desc" },
      take: 50,
      include: {
        alert: {
          select: { id: true, senderUserId: true, type: true, topic: true, disclosureMode: true, sentAt: true },
        },
      },
    });
    return rows.map((r) => ({
      alertId: r.alertId,
      type: r.alert.type,
      topic: r.alert.topic,
      disclosureMode: r.alert.disclosureMode,
      sentAt: r.alert.sentAt,
      relationshipClass: r.relationshipClass,
      messageVariantKey: r.messageVariantKey,
      renderedMessage: r.renderedMessage,
      state: r.state,
      openedAt: r.openedAt,
      acknowledgedAt: r.acknowledgedAt,
    }));
  }

  // Shared planner used by both preview() and send(). Looks up relationships,
  // chooses message variant per recipient, renders text, runs the genetic-
  // language guard. Throws if no recipients are deliverable.
  private async planRecipients(dto: CreateAlertDto, meta: ReqMeta) {
    const filteredRecipientIds = Array.from(
      new Set(dto.recipientUserIds.filter((id) => id !== meta.actorUserId)),
    );
    if (filteredRecipientIds.length === 0) {
      throw new ForbiddenException("alert needs at least one recipient that is not yourself");
    }

    const relationships = await this.db.familyRelationship.findMany({
      where: {
        userId: meta.actorUserId,
        relatedUserId: { in: filteredRecipientIds },
      },
    });
    const relMap = new Map(relationships.map((r) => [r.relatedUserId!, r]));

    const recipientPlans = filteredRecipientIds.map((rid) => {
      const rel = relMap.get(rid);
      if (!rel) return { rid, error: "no_relationship" as const };
      if (rel.doNotAlert) return { rid, error: "muted" as const };
      const cls = relationshipClassFor(rel.type as RelationshipType, rel.biologicalLink);
      const variant = selectMessageVariant(dto.type as AlertType, cls);
      const senderLabel =
        dto.disclosureMode === "anonymous"
          ? "A family member"
          : dto.disclosureMode === "relationship_only"
            ? `Your ${humanizeRelationshipFromRecipient(rel.type as RelationshipType)}`
            : "";
      return {
        rid,
        relationshipClass: cls,
        variantKey: variant,
        senderLabel,
        biologicalLink: rel.biologicalLink,
      };
    });

    const ok = recipientPlans.filter(
      (p): p is Extract<typeof p, { variantKey: MessageVariantKey }> => "variantKey" in p,
    );
    const skipped = recipientPlans.filter(
      (p): p is Extract<typeof p, { error: string }> => "error" in p,
    );

    if (ok.length === 0) {
      throw new ForbiddenException(
        `no deliverable recipients (skipped: ${skipped.map((s) => `${s.rid}:${s.error}`).join(", ")})`,
      );
    }

    let senderName: string | null = null;
    if (dto.disclosureMode === "identified") {
      const sender = await this.db.user.findUnique({
        where: { id: meta.actorUserId },
        select: { firstName: true, lastName: true },
      });
      senderName = sender
        ? [sender.firstName, sender.lastName].filter(Boolean).join(" ").trim()
        : "A family member";
    }

    const rendered = ok.map((plan) => {
      const senderForCopy = senderName ?? plan.senderLabel;
      const text = t("en", plan.variantKey, {
        sender: senderForCopy,
        marker: dto.topic,
        parentRel: "parent",
      });
      if (
        plan.relationshipClass !== "biological_genetic" &&
        !variantMayContainGeneticLanguage(plan.variantKey) &&
        containsGeneticLanguage(text)
      ) {
        throw new Error(
          `internal: rendered alert variant '${plan.variantKey}' for non-biological recipient contains genetic language`,
        );
      }
      return { ...plan, text };
    });

    return { rendered, skipped, senderName };
  }

  async acknowledge(alertId: string, meta: ReqMeta) {
    const row = await this.db.alertRecipient.findFirst({
      where: { alertId, recipientUserId: meta.actorUserId },
    });
    if (!row) throw new NotFoundException();
    await this.db.alertRecipient.update({
      where: { id: row.id },
      data: { state: "acknowledged", acknowledgedAt: new Date(), openedAt: row.openedAt ?? new Date() },
    });
    await this.audit.write({
      eventType: "alert.acknowledged",
      subjectId: alertId,
      actorUserId: meta.actorUserId,
      targetUserId: meta.actorUserId,
      fromState: row.state,
      toState: "acknowledged",
      metadata: {},
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });
    return { ok: true };
  }
}

// ─── helpers ─────────────────────────────────────────────────────────────

function relationshipClassFor(type: RelationshipType, biological: boolean): RelationshipClass {
  if (type === "spouse" || type === "partner") return "spouse_partner";
  if (type === "caregiver" || type === "guardian") return "caregiver";
  if (
    biological &&
    [
      "biological_parent",
      "biological_child",
      "biological_sibling",
      "biological_half_sibling",
      "cousin",
      "aunt_uncle",
      "niece_nephew",
      "grandparent",
      "grandchild",
    ].includes(type)
  ) {
    return "biological_genetic";
  }
  if (
    [
      "adoptive_parent",
      "adopted_child",
      "step_parent",
      "step_child",
      "foster_parent",
      "foster_child",
    ].includes(type)
  ) {
    return "non_biological_support";
  }
  if (type === "biological_child" || type === "adopted_child") return "adult_child"; // (defaulting; minor handling later)
  return "general_family";
}

function humanizeRelationshipFromRecipient(t: RelationshipType): string {
  // Used only for "Your sister/brother/etc." in relationship_only disclosure.
  switch (t) {
    case "biological_sibling":
    case "biological_half_sibling":
      return "sibling";
    case "biological_parent":
    case "adoptive_parent":
    case "step_parent":
    case "foster_parent":
      return "parent";
    case "biological_child":
    case "adopted_child":
    case "step_child":
    case "foster_child":
      return "child";
    case "spouse":
      return "spouse";
    case "partner":
      return "partner";
    default:
      return "family member";
  }
}

