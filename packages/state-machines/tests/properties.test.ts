// Property-based tests for the state machines. Asserts:
//
// 1. Random sequences of valid events never end in an invalid state.
// 2. Invalid transitions always return the canonical error envelope.
// 3. Terminal states are sticky: no event can leave them.
// 4. Co-manager / sensitive action: declines are absorbing (no path back
//    to approved after a single decline).

import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  alert,
  comanager,
  consent,
  invite,
} from "../src/index.js";

// â”€â”€â”€ Generic helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type Machine<S, E> = {
  initial: S;
  events: ReadonlyArray<E>;
  step: (s: S, e: E) => S | { error: string; from: S; event: E };
  terminal: ReadonlySet<S>;
  validStates: ReadonlySet<S>;
};

function isError<S>(
  result: S | { error: string; from: S; event: unknown },
): result is { error: string; from: S; event: unknown } {
  return typeof result === "object" && result !== null && "error" in result;
}

function runRandomly<S, E>(m: Machine<S, E>, events: E[]): S {
  let state: S = m.initial;
  for (const e of events) {
    const next = m.step(state, e);
    if (isError(next)) continue; // invalid transitions don't change state
    state = next;
  }
  return state;
}

function assertValidStates<S, E>(m: Machine<S, E>) {
  fc.assert(
    fc.property(fc.array(fc.constantFrom(...m.events), { maxLength: 30 }), (events) => {
      const final = runRandomly(m, events);
      expect(m.validStates.has(final), `final state '${String(final)}' not in valid set`).toBe(
        true,
      );
    }),
    { numRuns: 200 },
  );
}

function assertTerminalSticky<S, E>(m: Machine<S, E>) {
  for (const s of m.terminal) {
    for (const e of m.events) {
      const result = m.step(s, e);
      // From a terminal state, every event should be rejected as an
      // invalid transition.
      expect(isError(result), `terminal '${String(s)}' accepted event '${String(e)}'`).toBe(true);
    }
  }
}

// â”€â”€â”€ Invite â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const INVITE_STATES: ReadonlyArray<string> = [
  "created",
  "pending",
  "consumed_pending_acceptance",
  "accepted",
  "declined",
  "expired",
  "revoked",
  "errored",
];
const INVITE_EVENTS = [
  { type: "send" as const },
  { type: "open" as const },
  { type: "accept" as const },
  { type: "decline" as const },
  { type: "expire" as const },
  { type: "revoke" as const },
  { type: "error" as const },
];
const INVITE_TERMINAL: ReadonlySet<string> = new Set([
  "accepted",
  "declined",
  "expired",
  "revoked",
  "errored",
]);

describe("invite state machine", () => {
  const machine: Machine<string, (typeof INVITE_EVENTS)[number]> = {
    initial: "created",
    events: INVITE_EVENTS,
    step: (s, e) => invite.nextInviteState(s as never, e),
    terminal: INVITE_TERMINAL,
    validStates: new Set(INVITE_STATES),
  };

  it("random event sequences end in a valid state", () => assertValidStates(machine));
  it("terminal states are sticky", () => assertTerminalSticky(machine));

  it("a successful happy path is created â†’ pending â†’ consumed â†’ accepted", () => {
    let s: string = "created";
    s = invite.nextInviteState(s as never, { type: "send" }) as string;
    expect(s).toBe("pending");
    s = invite.nextInviteState(s as never, { type: "open" }) as string;
    expect(s).toBe("consumed_pending_acceptance");
    s = invite.nextInviteState(s as never, { type: "accept" }) as string;
    expect(s).toBe("accepted");
  });
});

// â”€â”€â”€ Consent â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CONSENT_STATES: ReadonlyArray<string> = [
  "proposed",
  "active",
  "paused",
  "expired",
  "revoked",
  "superseded",
  "declined",
];
const CONSENT_EVENTS = [
  { type: "confirm_active" as const },
  { type: "decline" as const },
  { type: "pause" as const },
  { type: "unpause" as const },
  { type: "expire" as const },
  { type: "revoke" as const },
  { type: "supersede" as const },
];
const CONSENT_TERMINAL: ReadonlySet<string> = new Set([
  "expired",
  "revoked",
  "superseded",
  "declined",
]);

describe("consent grant state machine", () => {
  const machine: Machine<string, (typeof CONSENT_EVENTS)[number]> = {
    initial: "proposed",
    events: CONSENT_EVENTS,
    step: (s, e) => consent.nextConsentState(s as never, e),
    terminal: CONSENT_TERMINAL,
    validStates: new Set(CONSENT_STATES),
  };

  it("random event sequences end in a valid state", () => assertValidStates(machine));
  it("terminal states are sticky", () => assertTerminalSticky(machine));

  it("a revoke is irreversible", () => {
    let s: string = "active";
    s = consent.nextConsentState(s as never, { type: "revoke" }) as string;
    expect(s).toBe("revoked");
    // No event can resurrect.
    for (const e of CONSENT_EVENTS) {
      const result = consent.nextConsentState(s as never, e);
      expect(isError(result)).toBe(true);
    }
  });
});

// â”€â”€â”€ Alert â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ALERT_STATES: ReadonlyArray<string> = [
  "drafting",
  "previewing",
  "queued",
  "sent",
  "recalled",
  "expired_recall_window",
  "partially_delivered",
  "cancelled",
];
const ALERT_EVENTS = [
  { type: "preview" as const },
  { type: "edit" as const },
  { type: "approve" as const },
  { type: "send" as const },
  { type: "undo" as const },
  { type: "recall" as const },
  { type: "expire_recall" as const },
  { type: "partial_failure" as const },
  { type: "retry_success" as const },
  { type: "cancel" as const },
];
const ALERT_TERMINAL: ReadonlySet<string> = new Set([
  "recalled",
  "expired_recall_window",
  "cancelled",
]);

describe("alert state machine", () => {
  const machine: Machine<string, (typeof ALERT_EVENTS)[number]> = {
    initial: "drafting",
    events: ALERT_EVENTS,
    step: (s, e) => alert.nextAlertState(s as never, e),
    terminal: ALERT_TERMINAL,
    validStates: new Set(ALERT_STATES),
  };

  it("random event sequences end in a valid state", () => assertValidStates(machine));
  it("terminal states are sticky", () => assertTerminalSticky(machine));

  it("undo from queued returns to drafting", () => {
    let s: string = "queued";
    s = alert.nextAlertState(s as never, { type: "undo" }) as string;
    expect(s).toBe("drafting");
  });
});

// â”€â”€â”€ Co-manager â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const COMANAGER_STATES: ReadonlyArray<string> = [
  "inactive",
  "pending_acceptance",
  "active",
  "paused",
  "removed",
  "declined",
  "expired",
];
const COMANAGER_EVENTS = [
  { type: "invite" as const },
  { type: "accept" as const },
  { type: "decline" as const },
  { type: "activate_succession" as const },
  { type: "pause" as const },
  { type: "resume" as const },
  { type: "remove" as const },
  { type: "expire" as const },
];
const COMANAGER_TERMINAL: ReadonlySet<string> = new Set(["removed", "declined", "expired"]);

describe("co-manager state machine", () => {
  const machine: Machine<string, (typeof COMANAGER_EVENTS)[number]> = {
    initial: "pending_acceptance",
    events: COMANAGER_EVENTS,
    step: (s, e) => comanager.nextCoManagerStatus(s as never, e),
    terminal: COMANAGER_TERMINAL,
    validStates: new Set(COMANAGER_STATES),
  };

  it("random event sequences end in a valid state", () => assertValidStates(machine));
  it("terminal states are sticky", () => assertTerminalSticky(machine));
});

// â”€â”€â”€ Sensitive action â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SENSITIVE_STATES: ReadonlyArray<string> = [
  "proposed",
  "awaiting_approval",
  "approved",
  "declined",
  "expired",
  "cancelled",
];
const SENSITIVE_EVENTS = [
  { type: "needs_approval" as const },
  { type: "auto_approve" as const },
  { type: "approve" as const },
  { type: "decline" as const },
  { type: "expire" as const },
  { type: "cancel" as const },
];
const SENSITIVE_TERMINAL: ReadonlySet<string> = new Set([
  "approved",
  "declined",
  "expired",
  "cancelled",
]);

describe("sensitive-action state machine", () => {
  const machine: Machine<string, (typeof SENSITIVE_EVENTS)[number]> = {
    initial: "proposed",
    events: SENSITIVE_EVENTS,
    step: (s, e) => comanager.nextSensitiveActionState(s as never, e),
    terminal: SENSITIVE_TERMINAL,
    validStates: new Set(SENSITIVE_STATES),
  };

  it("random event sequences end in a valid state", () => assertValidStates(machine));
  it("terminal states are sticky", () => assertTerminalSticky(machine));

  it("a single decline is absorbing â€” no path to approved", () => {
    let s: string = "awaiting_approval";
    s = comanager.nextSensitiveActionState(s as never, { type: "decline" }) as string;
    expect(s).toBe("declined");
    // Cannot transition out of declined.
    for (const e of SENSITIVE_EVENTS) {
      const result = comanager.nextSensitiveActionState(s as never, e);
      expect(isError(result)).toBe(true);
    }
  });
});
