import { z } from "zod";

const RelationshipType = z.enum([
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

const Preset = z.enum(["none", "emergency", "care_bundle", "full_record", "custom"]);

export const CreateInviteDto = z.object({
  proposedRelationship: RelationshipType,
  proposedBiologicalLink: z.boolean().default(false),
  proposedPreset: Preset.default("none"),
  proposedReciprocalPreset: Preset.optional(),
});
export type CreateInviteDto = z.infer<typeof CreateInviteDto>;

export const AcceptInviteDto = z.object({
  // Recipient may pin down the relationship if it doesn't match what was proposed.
  acceptedRelationship: RelationshipType.optional(),
});
export type AcceptInviteDto = z.infer<typeof AcceptInviteDto>;
