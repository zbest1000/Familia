import { z } from "zod";

import { Iso8601, Uuid } from "./common.js";

// Audit log â€” append-only. See docs/05_PERMISSION_MATRIX.md Â§8 and docs/13_API_STATE_MACHINES.md Â§5.

export const AuditEventType = z.enum([
  "auth.signed_in",
  "auth.signed_out",
  "auth.signin_failed",
  "auth.mfa_enrolled",
  "auth.session_revoked",
  "auth.recovery_requested",

  "user.created",
  "user.updated",
  "user.account_deleted",

  "invite.created",
  "invite.sent",
  "invite.opened",
  "invite.accepted",
  "invite.declined",
  "invite.expired",
  "invite.revoked",

  "consent.granted",
  "consent.modified",
  "consent.paused",
  "consent.unpaused",
  "consent.revoked",
  "consent.expired",
  "consent.superseded",
  "consent.access_evaluated",

  "alert.created",
  "alert.previewed",
  "alert.approved",
  "alert.queued",
  "alert.sent",
  "alert.recalled",
  "alert.delivered",
  "alert.opened",
  "alert.acknowledged",
  "alert.undone",

  "record.read",
  "record.created",
  "record.updated",
  "record.soft_deleted",
  "record.hard_deleted",

  "document.uploaded",
  "document.ocr_completed",
  "document.extracted",
  "document.reviewed",
  "document.downloaded",
  "document.shared",

  "comanager.invited",
  "comanager.accepted",
  "comanager.removed",
  "comanager.action_proposed",
  "comanager.action_approved",
  "comanager.action_declined",
  "comanager.action_expired",

  "export.generated",
  "export.downloaded",

  "emergency.access_used",
  "emergency.profile_updated",

  "security.new_device_signin",
  "security.password_changed",
  "security.mfa_changed",
  "security.signout_everywhere",
]);
export type AuditEventType = z.infer<typeof AuditEventType>;

export const AuditEntry = z.object({
  eventId: Uuid,
  eventType: AuditEventType,
  // The entity that changed (invite/grant/alert/profile/record id).
  subjectId: z.string(),
  // Who caused the change (null for system-triggered).
  actorUserId: Uuid.nullable(),
  // Whose data is touched (the privacy subject).
  targetUserId: Uuid,
  fromState: z.string().nullable(),
  toState: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  policyVersion: z.string(),
  requestSource: z.enum(["mobile", "web", "api", "scheduled_job", "support_tool"]),
  clientIp: z.string().nullable(),
  createdAt: Iso8601,
});
export type AuditEntry = z.infer<typeof AuditEntry>;
