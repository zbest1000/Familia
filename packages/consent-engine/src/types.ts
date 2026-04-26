import type { ConsentGrant, ConsentPurpose, ResourceRef, Uuid } from "@familia/domain";

export type EvaluateInput = {
  // The user attempting access.
  actorUserId: Uuid;
  // The user whose data is being accessed.
  targetUserId: Uuid;
  // The resource to read/export/etc.
  resource: ResourceRef;
  // The intended purpose of access.
  purpose: ConsentPurpose;
  // Caller-supplied evaluation time (for tests + replays). Defaults to now.
  evaluatedAt?: Date;
};

// The grant store contract — implementation lives in the API layer.
export type GrantStore = {
  /**
   * Return the active grant for (grantor=target, recipient=actor) that covers the
   * given scope at the given time, or null. Implementations MUST honor pause/revoke/expiry.
   * Implementations MUST be cache-invalidating on revocation events.
   */
  findActiveGrant(args: {
    grantorUserId: Uuid;
    recipientUserId: Uuid;
    scope: ResourceRef["category"];
    purpose: ConsentPurpose;
    at: Date;
  }): Promise<ConsentGrant | null>;

  /**
   * Whether the actor has emergency-mode access to the target.
   * (See docs/05 §12 — break-glass.)
   */
  isInEmergencyAccessList(args: {
    actorUserId: Uuid;
    targetUserId: Uuid;
  }): Promise<boolean>;
};
