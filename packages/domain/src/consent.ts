import { z } from "zod";

import { Iso8601, SensitivityTier, Uuid } from "./common.js";

// See docs/05_PERMISSION_MATRIX.md and docs/13_API_STATE_MACHINES.md Â§2.

export const ConsentScope = z.enum([
  // Standard tier
  "conditions",
  "medications",
  "allergies",
  "immunizations",
  "encounters",
  "labs",
  "procedures",
  "imaging",
  "dental",
  "vision",
  "lifestyle",
  "wearables_aggregate",
  "wearables_raw",
  "documents_general",
  "emergency_profile",
  "check_ins_aggregate",
  // Sensitive tier
  "reproductive",
  "sexual",
  "controlled_substances",
  "substance_use",
  "family_relationship_status",
  // Highly sensitive tier
  "mental_health",
  "hrt",
  "dna",
  "hidden_relationship",
  "abuse_legal",
]);
export type ConsentScope = z.infer<typeof ConsentScope>;

export const Preset = z.enum(["none", "emergency", "care_bundle", "full_record", "custom"]);
export type Preset = z.infer<typeof Preset>;

export const ConsentState = z.enum([
  "proposed",
  "active",
  "paused",
  "expired",
  "revoked",
  "superseded",
  "declined",
]);
export type ConsentState = z.infer<typeof ConsentState>;

export const ConsentPurpose = z.enum([
  "read",
  "export",
  "share_onward",
  "display_in_summary",
]);
export type ConsentPurpose = z.infer<typeof ConsentPurpose>;

export const DisclosureMode = z.enum([
  "anonymous",
  "relationship_only",
  "partial",
  "identified",
]);
export type DisclosureMode = z.infer<typeof DisclosureMode>;

export const ConsentGrant = z.object({
  id: Uuid,
  grantorUserId: Uuid,
  recipientUserId: Uuid,
  preset: Preset,
  // Explicit list of categories. Even when derived from a preset, we materialize.
  scopes: z.array(ConsentScope),
  // Per-scope permitted purposes.
  purposes: z.array(ConsentPurpose),
  // When sender wants to enforce a specific disclosure mode for alerts under this grant.
  disclosureModeDefault: DisclosureMode.default("identified"),
  // Allow recipient to onward-share (default off).
  allowReDisclosure: z.boolean().default(false),
  // For the consent terms version that was in force at creation.
  consentTermsVersion: z.string(),
  // Effectivity window.
  validFrom: Iso8601,
  validUntil: Iso8601.nullable(),
  state: ConsentState,
  createdAt: Iso8601,
  updatedAt: Iso8601,
  // For superseded grants, the id of the replacement.
  supersededByGrantId: Uuid.nullable(),
});
export type ConsentGrant = z.infer<typeof ConsentGrant>;

// Resource shape for the engine's decision function.
export const ResourceRef = z.object({
  id: Uuid,
  category: ConsentScope,
  sensitivity: SensitivityTier,
  ownerUserId: Uuid,
});
export type ResourceRef = z.infer<typeof ResourceRef>;

// Outcome of a consent decision.
export const Decision = z.object({
  decision: z.enum(["allow", "deny", "allow_emergency"]),
  reason: z.string(),
  grantIdUsed: Uuid.nullable(),
  policyVersion: z.string(),
  evaluatedAt: Iso8601,
});
export type Decision = z.infer<typeof Decision>;
