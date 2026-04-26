import { z } from "zod";

import { Iso8601, Uuid } from "./common";

// Profile vs Account: see docs/09_PEDIATRIC_AND_PROXY.md §1.
// Every profile has an owner; some are co-managed (minors, dementia, caregiver).

export const ProfileKind = z.enum([
  "self", // The owner's own profile
  "minor", // Parent-managed minor
  "managed_adult", // Voluntarily co-managed adult (e.g., dementia)
  "ghost", // Manual entry; deceased relative; no account
]);
export type ProfileKind = z.infer<typeof ProfileKind>;

export const Profile = z.object({
  id: Uuid,
  kind: ProfileKind,
  ownerUserId: Uuid.nullable(), // null for ghost profiles
  displayName: z.string().min(1),
  dateOfBirth: z.string().nullable(),
  deceasedAt: z.string().nullable(),
  createdAt: Iso8601,
  updatedAt: Iso8601,
  deletedAt: Iso8601.nullable(),
});
export type Profile = z.infer<typeof Profile>;

export const ProfileCoManager = z.object({
  id: Uuid,
  profileId: Uuid,
  userId: Uuid,
  role: z.enum([
    "biological_parent",
    "adoptive_parent",
    "step_parent",
    "foster_parent",
    "guardian",
    "caregiver_view_only",
    "caregiver_coordinator",
    "caregiver_co_manager",
    "power_of_attorney",
    "custom",
  ]),
  status: z.enum(["pending_acceptance", "active", "paused", "removed", "inactive"]),
  validFrom: Iso8601,
  validUntil: Iso8601.nullable(),
  createdAt: Iso8601,
});
export type ProfileCoManager = z.infer<typeof ProfileCoManager>;
