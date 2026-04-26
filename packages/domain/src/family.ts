import { z } from "zod";

import { Confidence, Iso8601, Uuid } from "./common.js";

// Family relationships â€” dual-graph model from docs/05_PERMISSION_MATRIX.md.
// Social/legal relationships drive access; biological relationships drive hereditary logic.

export const RelationshipType = z.enum([
  "biological_parent",
  "biological_child",
  "biological_sibling",
  "biological_half_sibling",
  "cousin",
  "aunt_uncle",
  "niece_nephew",
  "grandparent",
  "grandchild",
  "spouse",
  "partner",
  "adoptive_parent",
  "adopted_child",
  "step_parent",
  "step_child",
  "foster_parent",
  "foster_child",
  "guardian",
  "legal_dependent",
  "caregiver",
  "custom",
]);
export type RelationshipType = z.infer<typeof RelationshipType>;

export const RelationshipVisibility = z.enum([
  "private", // Only the relator sees this edge
  "visible_to_family", // Other family members can see this edge
  "visible_only_to_both", // Only the two endpoints see it
]);
export type RelationshipVisibility = z.infer<typeof RelationshipVisibility>;

export const FamilyRelationship = z.object({
  id: Uuid,
  // The user who owns this view of the relationship.
  userId: Uuid,
  // The connected person â€” either a real account or a ghost profile.
  relatedUserId: Uuid.nullable(),
  relatedProfileGhostId: Uuid.nullable(),
  type: RelationshipType,
  // Whether there's a confirmed biological link, with confidence (0..1).
  // Drives hereditary alert routing â€” see docs/05 Â§6 and docs/13 Â§3.
  biologicalLink: z.boolean(),
  biologicalConfidence: Confidence,
  visibility: RelationshipVisibility,
  // Optional: user has chosen not to receive alerts from this person.
  doNotAlert: z.boolean().default(false),
  // Optional: this relative's death.
  deceased: z.boolean().default(false),
  deceasedAt: Iso8601.nullable(),
  notes: z.string().nullable(),
  createdAt: Iso8601,
  updatedAt: Iso8601,
});
export type FamilyRelationship = z.infer<typeof FamilyRelationship>;

// Invite token state â€” see docs/13_API_STATE_MACHINES.md Â§1.
export const InviteState = z.enum([
  "created",
  "pending",
  "consumed_pending_acceptance",
  "accepted",
  "declined",
  "expired",
  "revoked",
  "errored",
]);
export type InviteState = z.infer<typeof InviteState>;

export const FamilyInvite = z.object({
  id: Uuid,
  senderUserId: Uuid,
  proposedRelationship: RelationshipType,
  proposedBiologicalLink: z.boolean(),
  // The sharing preset the sender is offering.
  proposedPreset: z.enum(["none", "emergency", "care_bundle", "full_record", "custom"]),
  // Optional reciprocal preset the sender is asking for.
  proposedReciprocalPreset: z
    .enum(["none", "emergency", "care_bundle", "full_record", "custom"])
    .nullable(),
  state: InviteState,
  // Single-use, signed token â€” never store the actual signed string in plaintext.
  tokenHash: z.string(),
  ttlSeconds: z.number().int().positive().default(600),
  createdAt: Iso8601,
  expiresAt: Iso8601,
  consumedAt: Iso8601.nullable(),
  acceptedAt: Iso8601.nullable(),
  declinedAt: Iso8601.nullable(),
  revokedAt: Iso8601.nullable(),
  recipientUserId: Uuid.nullable(),
});
export type FamilyInvite = z.infer<typeof FamilyInvite>;
