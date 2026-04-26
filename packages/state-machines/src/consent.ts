// Consent grant state machine. See docs/13_API_STATE_MACHINES.md §2.

import type { ConsentState } from "@familia/domain";

export type ConsentEvent =
  | { type: "confirm_active" }
  | { type: "decline" }
  | { type: "pause" }
  | { type: "unpause" }
  | { type: "expire" }
  | { type: "revoke" }
  | { type: "supersede" };

const TRANSITIONS: Record<ConsentState, Partial<Record<ConsentEvent["type"], ConsentState>>> = {
  proposed: {
    confirm_active: "active",
    decline: "declined",
    expire: "expired",
  },
  active: {
    pause: "paused",
    expire: "expired",
    revoke: "revoked",
    supersede: "superseded",
  },
  paused: {
    unpause: "active",
    revoke: "revoked",
    expire: "expired",
  },
  expired: {},
  revoked: {},
  superseded: {},
  declined: {},
};

export function nextConsentState(
  current: ConsentState,
  event: ConsentEvent,
): ConsentState | { error: "invalid_transition"; from: ConsentState; event: ConsentEvent } {
  const next = TRANSITIONS[current][event.type];
  if (!next) return { error: "invalid_transition", from: current, event };
  return next;
}

export const TERMINAL_CONSENT_STATES: ReadonlySet<ConsentState> = new Set<ConsentState>([
  "expired",
  "revoked",
  "superseded",
  "declined",
]);
