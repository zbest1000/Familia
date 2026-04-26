// Co-manager and sensitive-action state machines. See docs/13_API_STATE_MACHINES.md §4.

export type CoManagerStatus =
  | "inactive"
  | "pending_acceptance"
  | "active"
  | "paused"
  | "removed"
  | "declined"
  | "expired";

export type CoManagerEvent =
  | { type: "invite" }
  | { type: "accept" }
  | { type: "decline" }
  | { type: "activate_succession" } // requires verification
  | { type: "pause" }
  | { type: "resume" }
  | { type: "remove" } // requires two-key
  | { type: "expire" };

const COMANAGER_TRANSITIONS: Record<
  CoManagerStatus,
  Partial<Record<CoManagerEvent["type"], CoManagerStatus>>
> = {
  inactive: {
    activate_succession: "active",
  },
  pending_acceptance: {
    accept: "active",
    decline: "declined",
    expire: "expired",
  },
  active: {
    pause: "paused",
    remove: "removed",
  },
  paused: {
    resume: "active",
    remove: "removed",
  },
  removed: {},
  declined: {},
  expired: {},
};

export function nextCoManagerStatus(
  current: CoManagerStatus,
  event: CoManagerEvent,
):
  | CoManagerStatus
  | { error: "invalid_transition"; from: CoManagerStatus; event: CoManagerEvent } {
  const next = COMANAGER_TRANSITIONS[current][event.type];
  if (!next) return { error: "invalid_transition", from: current, event };
  return next;
}

// Sensitive-action sub-state.
export type SensitiveActionState =
  | "proposed"
  | "awaiting_approval"
  | "approved"
  | "declined"
  | "expired"
  | "cancelled";

export type SensitiveActionEvent =
  | { type: "needs_approval" }
  | { type: "auto_approve" } // when no other approvers required
  | { type: "approve" }
  | { type: "decline" } // any decline blocks
  | { type: "expire" }
  | { type: "cancel" };

const ACTION_TRANSITIONS: Record<
  SensitiveActionState,
  Partial<Record<SensitiveActionEvent["type"], SensitiveActionState>>
> = {
  proposed: {
    needs_approval: "awaiting_approval",
    auto_approve: "approved",
    cancel: "cancelled",
  },
  awaiting_approval: {
    approve: "approved",
    decline: "declined",
    expire: "expired",
    cancel: "cancelled",
  },
  approved: {},
  declined: {},
  expired: {},
  cancelled: {},
};

export function nextSensitiveActionState(
  current: SensitiveActionState,
  event: SensitiveActionEvent,
):
  | SensitiveActionState
  | { error: "invalid_transition"; from: SensitiveActionState; event: SensitiveActionEvent } {
  const next = ACTION_TRANSITIONS[current][event.type];
  if (!next) return { error: "invalid_transition", from: current, event };
  return next;
}

export const SENSITIVE_ACTION_TIMEOUT_MS = 72 * 60 * 60 * 1000; // 72 hours
