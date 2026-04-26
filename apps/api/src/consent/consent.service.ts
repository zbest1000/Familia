import { Injectable } from "@nestjs/common";

import { evaluateAccess, type GrantStore, POLICY_VERSION } from "@familia/consent-engine";
import type { ConsentGrant, ConsentPurpose, Decision, Iso8601, ResourceRef, Uuid } from "@familia/domain";

import { PrismaService } from "../common/prisma.service";

@Injectable()
export class ConsentService implements GrantStore {
  constructor(private readonly db: PrismaService) {}

  /**
   * Embedded use of the consent engine library — see docs/16 §3.
   * Cache invalidation is the API's job; this method always reads from
   * the source of truth (Postgres) for now. Sprint 6 introduces a Redis
   * read-through cache with revoke-event-driven invalidation.
   */
  async evaluate(input: Parameters<typeof evaluateAccess>[0]): Promise<Decision> {
    return evaluateAccess(input, this);
  }

  // GrantStore implementation -------------------------------------------------

  async findActiveGrant(args: {
    grantorUserId: Uuid;
    recipientUserId: Uuid;
    scope: ResourceRef["category"];
    purpose: ConsentPurpose;
    at: Date;
  }): Promise<ConsentGrant | null> {
    // Sprint-0 stub. Sprint 5-6 wires real Prisma query against the
    // consent_grants table with state='active' and time-window check.
    void args;
    return null;
  }

  async isInEmergencyAccessList(_args: {
    actorUserId: Uuid;
    targetUserId: Uuid;
  }): Promise<boolean> {
    return false;
  }

  policyVersion(): string {
    return POLICY_VERSION;
  }

  // Convenience for tests: deterministic ISO time.
  static now(): Iso8601 {
    return new Date().toISOString();
  }
}
