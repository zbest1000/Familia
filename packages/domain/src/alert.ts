import { z } from "zod";

import { Iso8601, Uuid } from "./common.js";
import { DisclosureMode } from "./consent.js";

// See docs/13_API_STATE_MACHINES.md Â§3.

export const AlertType = z.enum([
  "hereditary_risk",
  "general_health_update",
  "wellness_trend",
  "emergency",
]);
export type AlertType = z.infer<typeof AlertType>;

export const AlertState = z.enum([
  "drafting",
  "previewing",
  "queued",
  "sent",
  "recalled",
  "expired_recall_window",
  "partially_delivered",
  "cancelled",
]);
export type AlertState = z.infer<typeof AlertState>;

export const RecipientDeliveryState = z.enum([
  "pending",
  "delivered",
  "opened",
  "acknowledged",
  "failed",
  "blocked",
  "recalled",
]);
export type RecipientDeliveryState = z.infer<typeof RecipientDeliveryState>;

// Per-recipient relationship class drives the message variant chosen.
// See docs/04_VOICE_AND_TONE.md Â§5.
export const RelationshipClass = z.enum([
  "biological_genetic",
  "non_biological_support",
  "spouse_partner",
  "caregiver",
  "adult_child",
  "minor_child",
  "clinician",
  "general_family",
]);
export type RelationshipClass = z.infer<typeof RelationshipClass>;

export const Alert = z.object({
  id: Uuid,
  senderUserId: Uuid,
  type: AlertType,
  topic: z.string(), // free text from sender, e.g., "BRCA1 â€” confirmed in me"
  personalNote: z.string().nullable(),
  disclosureMode: DisclosureMode,
  state: AlertState,
  // Locked at preview-approval time. Subsequent recipient changes require new preview.
  recipientUserIds: z.array(Uuid),
  // For audit / tamper-evidence.
  contentHash: z.string(),
  // Created/queued/sent timestamps.
  createdAt: Iso8601,
  approvedAt: Iso8601.nullable(),
  sentAt: Iso8601.nullable(),
  recalledAt: Iso8601.nullable(),
});
export type Alert = z.infer<typeof Alert>;

export const AlertRecipient = z.object({
  id: Uuid,
  alertId: Uuid,
  recipientUserId: Uuid,
  relationshipClass: RelationshipClass,
  // The selected variant for this recipient.
  messageVariantKey: z.string(),
  // The literal text rendered for this recipient.
  renderedMessage: z.string(),
  renderedMessageHash: z.string(),
  state: RecipientDeliveryState,
  deliveredAt: Iso8601.nullable(),
  openedAt: Iso8601.nullable(),
  acknowledgedAt: Iso8601.nullable(),
});
export type AlertRecipient = z.infer<typeof AlertRecipient>;
