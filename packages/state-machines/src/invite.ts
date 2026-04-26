// Invite state machine. See docs/13_API_STATE_MACHINES.md §1.

import type { InviteState } from "@familia/domain";

export type InviteEvent =
  | { type: "send" }
  | { type: "open" }
  | { type: "accept" }
  | { type: "decline" }
  | { type: "expire" }
  | { type: "revoke" }
  | { type: "error" };

const TRANSITIONS: Record<InviteState, Partial<Record<InviteEvent["type"], InviteState>>> = {
  created: {
    send: "pending",
    revoke: "revoked",
    error: "errored",
  },
  pending: {
    open: "consumed_pending_acceptance",
    expire: "expired",
    revoke: "revoked",
  },
  consumed_pending_acceptance: {
    accept: "accepted",
    decline: "declined",
    expire: "expired",
    revoke: "revoked",
  },
  accepted: {},
  declined: {},
  expired: {},
  revoked: {},
  errored: {},
};

export function nextInviteState(
  current: InviteState,
  event: InviteEvent,
): InviteState | { error: "invalid_transition"; from: InviteState; event: InviteEvent } {
  const next = TRANSITIONS[current][event.type];
  if (!next) return { error: "invalid_transition", from: current, event };
  return next;
}

export const TERMINAL_INVITE_STATES: ReadonlySet<InviteState> = new Set<InviteState>([
  "accepted",
  "declined",
  "expired",
  "revoked",
  "errored",
]);
