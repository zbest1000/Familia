// Alert state machine. See docs/13_API_STATE_MACHINES.md §3.

import type { AlertState } from "@familia/domain";

export type AlertEvent =
  | { type: "preview" }
  | { type: "edit" }
  | { type: "approve" }
  | { type: "send" }
  | { type: "undo" } // within 60s window
  | { type: "recall" } // within 24h window
  | { type: "expire_recall" }
  | { type: "partial_failure" }
  | { type: "retry_success" }
  | { type: "cancel" };

const TRANSITIONS: Record<AlertState, Partial<Record<AlertEvent["type"], AlertState>>> = {
  drafting: {
    preview: "previewing",
    cancel: "cancelled",
  },
  previewing: {
    edit: "drafting",
    approve: "queued",
    cancel: "cancelled",
  },
  queued: {
    undo: "drafting",
    send: "sent",
    cancel: "cancelled",
  },
  sent: {
    partial_failure: "partially_delivered",
    recall: "recalled",
    expire_recall: "expired_recall_window",
  },
  partially_delivered: {
    retry_success: "sent",
    recall: "recalled",
  },
  recalled: {},
  expired_recall_window: {},
  cancelled: {},
};

export function nextAlertState(
  current: AlertState,
  event: AlertEvent,
): AlertState | { error: "invalid_transition"; from: AlertState; event: AlertEvent } {
  const next = TRANSITIONS[current][event.type];
  if (!next) return { error: "invalid_transition", from: current, event };
  return next;
}

export const UNDO_WINDOW_MS = 60_000;
export const RECALL_WINDOW_MS = 24 * 60 * 60 * 1000;

export const TERMINAL_ALERT_STATES: ReadonlySet<AlertState> = new Set<AlertState>([
  "recalled",
  "expired_recall_window",
  "cancelled",
]);
