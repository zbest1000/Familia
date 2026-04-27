import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { POLICY_VERSION, presetScopes } from "@familia/consent-engine";
import { invite as inviteFsm } from "@familia/state-machines";

import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../common/prisma.service";
import { AcceptInviteDto, CreateInviteDto } from "./dto";
import { hashInviteToken, issueInviteToken } from "./invite-token";

type ReqMeta = { actorUserId: string; clientIp?: string | null };

@Injectable()
export class FamilyService {
  constructor(
    private readonly db: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ─── Sender-side ────────────────────────────────────────────────────────

  async createInvite(dto: CreateInviteDto, meta: ReqMeta) {
    const issued = issueInviteToken();
    const created = await this.db.familyInvite.create({
      data: {
        senderUserId: meta.actorUserId,
        proposedRelationship: dto.proposedRelationship,
        proposedBiologicalLink: dto.proposedBiologicalLink,
        proposedPreset: dto.proposedPreset,
        proposedReciprocalPreset: dto.proposedReciprocalPreset ?? null,
        state: "pending",
        tokenHash: issued.hash,
        expiresAt: issued.expiresAt,
      },
    });

    await this.audit.write({
      eventType: "invite.created",
      subjectId: created.id,
      actorUserId: meta.actorUserId,
      targetUserId: meta.actorUserId,
      fromState: null,
      toState: "pending",
      metadata: {
        proposedRelationship: dto.proposedRelationship,
        proposedPreset: dto.proposedPreset,
      },
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });
    await this.audit.write({
      eventType: "invite.sent",
      subjectId: created.id,
      actorUserId: meta.actorUserId,
      targetUserId: meta.actorUserId,
      fromState: "created",
      toState: "pending",
      metadata: {},
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });

    return {
      id: created.id,
      state: created.state,
      expiresAt: created.expiresAt.toISOString(),
      proposedRelationship: created.proposedRelationship,
      proposedPreset: created.proposedPreset,
      // Plaintext token is returned ONCE here. Only the sender ever sees it
      // again as a hash in the DB.
      token: issued.token,
    };
  }

  async listOutgoing(meta: ReqMeta) {
    return this.db.familyInvite.findMany({
      where: { senderUserId: meta.actorUserId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        proposedRelationship: true,
        proposedPreset: true,
        state: true,
        createdAt: true,
        expiresAt: true,
        recipientUserId: true,
      },
    });
  }

  // ─── Relationships + Grants ────────────────────────────────────────────

  async listRelationships(meta: ReqMeta) {
    const rows = await this.db.familyRelationship.findMany({
      where: { userId: meta.actorUserId },
      orderBy: { createdAt: "desc" },
      include: {
        relatedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      biologicalLink: r.biologicalLink,
      visibility: r.visibility,
      doNotAlert: r.doNotAlert,
      deceased: r.deceased,
      createdAt: r.createdAt,
      relatedUser: r.relatedUser,
    }));
  }

  async listOutgoingGrants(meta: ReqMeta) {
    return this.db.consentGrant.findMany({
      where: { grantorUserId: meta.actorUserId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        recipientUserId: true,
        preset: true,
        scopes: true,
        purposes: true,
        disclosureModeDefault: true,
        state: true,
        validFrom: true,
        validUntil: true,
        createdAt: true,
      },
    });
  }

  /**
   * Removes a family relationship. Cascades:
   *  - Marks the inverse relationship deleted (if present).
   *  - Revokes all active consent grants between the two parties (in either
   *    direction) — see docs/05 §13 + docs/13 §2.
   *  - Audits relationship.removed + per-grant consent.revoked.
   */
  async removeRelationship(relationshipId: string, meta: ReqMeta) {
    const rel = await this.db.familyRelationship.findUnique({ where: { id: relationshipId } });
    if (!rel) throw new NotFoundException();
    if (rel.userId !== meta.actorUserId) {
      throw new ForbiddenException("you can only remove your own relationships");
    }
    const otherId = rel.relatedUserId;
    const inverse = otherId
      ? await this.db.familyRelationship.findFirst({
          where: { userId: otherId, relatedUserId: meta.actorUserId },
        })
      : null;

    const grants = otherId
      ? await this.db.consentGrant.findMany({
          where: {
            state: "active",
            OR: [
              { grantorUserId: meta.actorUserId, recipientUserId: otherId },
              { grantorUserId: otherId, recipientUserId: meta.actorUserId },
            ],
          },
        })
      : [];

    await this.db.$transaction(async (tx) => {
      await tx.familyRelationship.delete({ where: { id: rel.id } });
      if (inverse) await tx.familyRelationship.delete({ where: { id: inverse.id } });
      for (const g of grants) {
        await tx.consentGrant.update({
          where: { id: g.id },
          data: { state: "revoked" },
        });
      }
    });

    // Audit on the originating side.
    await this.audit.write({
      eventType: "comanager.removed", // closest existing event; relationship removal also covers managed cases
      subjectId: rel.id,
      actorUserId: meta.actorUserId,
      targetUserId: otherId ?? meta.actorUserId,
      fromState: "active",
      toState: "removed",
      metadata: { type: rel.type, cascadedGrants: grants.length },
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });
    for (const g of grants) {
      await this.audit.write({
        eventType: "consent.revoked",
        subjectId: g.id,
        actorUserId: meta.actorUserId,
        targetUserId: g.grantorUserId === meta.actorUserId ? g.recipientUserId : g.grantorUserId,
        fromState: g.state,
        toState: "revoked",
        metadata: { reason: "relationship_removed" },
        policyVersion: POLICY_VERSION,
        requestSource: "api",
        clientIp: meta.clientIp ?? null,
      });
    }

    return { ok: true, revokedGrants: grants.length };
  }

  async revokeGrant(grantId: string, meta: ReqMeta) {
    const g = await this.db.consentGrant.findUnique({ where: { id: grantId } });
    if (!g) throw new NotFoundException();
    if (g.grantorUserId !== meta.actorUserId) {
      throw new ForbiddenException("only the grantor can revoke a grant");
    }
    if (g.state === "revoked" || g.state === "expired" || g.state === "superseded") {
      return { ok: true, alreadyTerminal: g.state };
    }
    await this.db.consentGrant.update({
      where: { id: g.id },
      data: { state: "revoked" },
    });
    await this.audit.write({
      eventType: "consent.revoked",
      subjectId: g.id,
      actorUserId: meta.actorUserId,
      targetUserId: g.recipientUserId,
      fromState: g.state,
      toState: "revoked",
      metadata: { preset: g.preset },
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });
    return { ok: true };
  }

  async revoke(inviteId: string, meta: ReqMeta) {
    const inv = await this.db.familyInvite.findUnique({ where: { id: inviteId } });
    if (!inv) throw new NotFoundException();
    if (inv.senderUserId !== meta.actorUserId) {
      throw new ForbiddenException("only the sender can revoke an invite");
    }
    const next = inviteFsm.nextInviteState(inv.state as never, { type: "revoke" });
    if (typeof next !== "string") {
      throw new ConflictException(`cannot revoke from state ${inv.state}`);
    }

    const updated = await this.db.familyInvite.update({
      where: { id: inviteId },
      data: { state: next, revokedAt: new Date() },
    });

    await this.audit.write({
      eventType: "invite.revoked",
      subjectId: inviteId,
      actorUserId: meta.actorUserId,
      targetUserId: meta.actorUserId,
      fromState: inv.state,
      toState: updated.state,
      metadata: {},
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });
    return { state: updated.state };
  }

  // ─── Recipient-side (token-bearing) ────────────────────────────────────

  async previewByToken(token: string) {
    const inv = await this.tokenLookup(token);
    return {
      id: inv.id,
      state: inv.state,
      proposedRelationship: inv.proposedRelationship,
      proposedBiologicalLink: inv.proposedBiologicalLink,
      proposedPreset: inv.proposedPreset,
      proposedReciprocalPreset: inv.proposedReciprocalPreset,
      sender: { id: inv.senderUserId },
      expiresAt: inv.expiresAt.toISOString(),
    };
  }

  async accept(token: string, dto: AcceptInviteDto, meta: ReqMeta) {
    const inv = await this.tokenLookup(token);
    if (inv.senderUserId === meta.actorUserId) {
      throw new ConflictException("you cannot accept your own invite");
    }
    const next = inviteFsm.nextInviteState(inv.state as never, { type: "accept" });
    if (typeof next !== "string") {
      // Allow direct pending → accepted as a Sprint-1 simplification.
      // The state machine routes through consumed_pending_acceptance; we
      // handle both the open + accept atomically here.
      const consumed = inviteFsm.nextInviteState(inv.state as never, { type: "open" });
      if (typeof consumed !== "string") {
        throw new ConflictException(`cannot accept from state ${inv.state}`);
      }
      const accepted = inviteFsm.nextInviteState(consumed as never, { type: "accept" });
      if (typeof accepted !== "string") {
        throw new ConflictException(`cannot accept from state ${inv.state}`);
      }
    }

    const acceptedRel = dto.acceptedRelationship ?? inv.proposedRelationship;

    const result = await this.db.$transaction(async (tx) => {
      const now = new Date();
      const accepted = await tx.familyInvite.update({
        where: { id: inv.id },
        data: {
          state: "accepted",
          consumedAt: now,
          acceptedAt: now,
          recipientUserId: meta.actorUserId,
        },
      });

      // Create both sides of the family relationship.
      await tx.familyRelationship.upsert({
        where: {
          // composite unique on (userId, relatedUserId, type) — see schema
          userId_relatedUserId_type: {
            userId: inv.senderUserId,
            relatedUserId: meta.actorUserId,
            type: acceptedRel,
          },
        },
        update: {},
        create: {
          userId: inv.senderUserId,
          relatedUserId: meta.actorUserId,
          type: acceptedRel,
          biologicalLink: inv.proposedBiologicalLink,
          biologicalConfidence: inv.proposedBiologicalLink ? 1 : 0,
          visibility: "visible_to_family",
        },
      });
      await tx.familyRelationship.upsert({
        where: {
          userId_relatedUserId_type: {
            userId: meta.actorUserId,
            relatedUserId: inv.senderUserId,
            type: inverseRelationship(acceptedRel),
          },
        },
        update: {},
        create: {
          userId: meta.actorUserId,
          relatedUserId: inv.senderUserId,
          type: inverseRelationship(acceptedRel),
          biologicalLink: inv.proposedBiologicalLink,
          biologicalConfidence: inv.proposedBiologicalLink ? 1 : 0,
          visibility: "visible_to_family",
        },
      });

      // Sender→Recipient consent grant per proposed preset.
      if (inv.proposedPreset !== "none") {
        const scopes = presetScopes(inv.proposedPreset as never);
        await tx.consentGrant.create({
          data: {
            grantorUserId: inv.senderUserId,
            recipientUserId: meta.actorUserId,
            preset: inv.proposedPreset,
            scopes,
            purposes: ["read"],
            disclosureModeDefault: "identified",
            allowReDisclosure: false,
            consentTermsVersion: POLICY_VERSION,
            validFrom: now,
            state: "active",
          },
        });
      }

      return accepted;
    });

    await this.audit.write({
      eventType: "invite.accepted",
      subjectId: inv.id,
      actorUserId: meta.actorUserId,
      targetUserId: inv.senderUserId,
      fromState: inv.state,
      toState: "accepted",
      metadata: { acceptedRelationship: acceptedRel, preset: inv.proposedPreset },
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });

    return { state: result.state, relationship: acceptedRel };
  }

  async decline(token: string, meta: ReqMeta) {
    const inv = await this.tokenLookup(token);
    if (inv.senderUserId === meta.actorUserId) {
      throw new ConflictException("you cannot decline your own invite");
    }
    // The state machine routes pending → consumed_pending_acceptance → declined.
    // Collapse to one transition for Sprint-1.
    const updated = await this.db.familyInvite.update({
      where: { id: inv.id },
      data: {
        state: "declined",
        consumedAt: new Date(),
        declinedAt: new Date(),
        recipientUserId: meta.actorUserId,
      },
    });

    await this.audit.write({
      eventType: "invite.declined",
      subjectId: inv.id,
      actorUserId: meta.actorUserId,
      targetUserId: inv.senderUserId,
      fromState: inv.state,
      toState: updated.state,
      metadata: {},
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });

    return { state: updated.state };
  }

  // ─── helpers ────────────────────────────────────────────────────────────

  private async tokenLookup(token: string) {
    const hash = hashInviteToken(token);
    const inv = await this.db.familyInvite.findUnique({ where: { tokenHash: hash } });
    if (!inv) throw new NotFoundException("invite not found");
    if (inv.state === "expired" || inv.expiresAt.getTime() < Date.now()) {
      // Lazy-mark as expired if past TTL.
      if (inv.state === "pending" || inv.state === "consumed_pending_acceptance") {
        await this.db.familyInvite.update({
          where: { id: inv.id },
          data: { state: "expired" },
        });
      }
      throw new NotFoundException("invite expired");
    }
    if (inv.state === "revoked" || inv.state === "declined" || inv.state === "accepted") {
      throw new NotFoundException(`invite ${inv.state}`);
    }
    return inv;
  }
}

// Naive inverse relationship — mostly identity, with the obvious flips.
function inverseRelationship(t: string): string {
  switch (t) {
    case "biological_parent":
      return "biological_child";
    case "biological_child":
      return "biological_parent";
    case "adoptive_parent":
      return "adopted_child";
    case "adopted_child":
      return "adoptive_parent";
    case "step_parent":
      return "step_child";
    case "step_child":
      return "step_parent";
    case "foster_parent":
      return "foster_child";
    case "foster_child":
      return "foster_parent";
    case "grandparent":
      return "grandchild";
    case "grandchild":
      return "grandparent";
    case "aunt_uncle":
      return "niece_nephew";
    case "niece_nephew":
      return "aunt_uncle";
    case "guardian":
      return "legal_dependent";
    case "legal_dependent":
      return "guardian";
    // Symmetric:
    case "biological_sibling":
    case "biological_half_sibling":
    case "cousin":
    case "spouse":
    case "partner":
    case "caregiver":
    case "custom":
      return t;
    default:
      return t;
  }
}
