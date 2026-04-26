import { z } from "zod";

import { ApproxDate, Iso8601, RecordSource, SensitivityTier, Uuid } from "./common.js";

// Slim shapes for the most-used health record categories.
// Full schemas live in apps/api/prisma/schema.prisma.

export const Condition = z.object({
  id: Uuid,
  userId: Uuid,
  profileId: Uuid,
  name: z.string(),
  codeSystem: z.string().nullable(),
  code: z.string().nullable(),
  status: z.enum(["active", "resolved", "in_remission", "unknown"]),
  onset: ApproxDate.nullable(),
  resolved: ApproxDate.nullable(),
  severity: z.enum(["mild", "moderate", "severe", "unknown"]).nullable(),
  source: RecordSource,
  sensitivity: SensitivityTier.default("standard"),
  notes: z.string().nullable(),
  createdAt: Iso8601,
  updatedAt: Iso8601,
});
export type Condition = z.infer<typeof Condition>;

export const Medication = z.object({
  id: Uuid,
  userId: Uuid,
  profileId: Uuid,
  name: z.string(),
  genericName: z.string().nullable(),
  doseValue: z.number().nullable(),
  doseUnit: z.string().nullable(),
  doseText: z.string().nullable(),
  route: z.string().nullable(),
  frequencyText: z.string().nullable(),
  status: z.enum(["active", "paused", "completed", "unknown"]),
  startDate: ApproxDate.nullable(),
  stopDate: ApproxDate.nullable(),
  prescriber: z.string().nullable(),
  pharmacy: z.string().nullable(),
  reason: z.string().nullable(),
  source: RecordSource,
  sensitivity: SensitivityTier.default("standard"),
  notes: z.string().nullable(),
  createdAt: Iso8601,
  updatedAt: Iso8601,
});
export type Medication = z.infer<typeof Medication>;

export const Allergy = z.object({
  id: Uuid,
  userId: Uuid,
  profileId: Uuid,
  allergen: z.string(),
  allergyType: z.enum(["drug", "food", "environment", "other"]),
  reaction: z.string().nullable(),
  severity: z.enum(["mild", "moderate", "severe", "anaphylaxis", "unknown"]),
  firstObserved: ApproxDate.nullable(),
  source: RecordSource,
  notes: z.string().nullable(),
  createdAt: Iso8601,
  updatedAt: Iso8601,
});
export type Allergy = z.infer<typeof Allergy>;

export const Encounter = z.object({
  id: Uuid,
  userId: Uuid,
  profileId: Uuid,
  type: z.enum([
    "primary_care",
    "specialist",
    "urgent_care",
    "emergency",
    "telehealth",
    "hospital_admission",
    "dental",
    "vision",
    "psychiatric",
    "therapy",
    "other",
  ]),
  providerName: z.string().nullable(),
  facilityName: z.string().nullable(),
  startTime: Iso8601.nullable(),
  endTime: Iso8601.nullable(),
  reason: z.string().nullable(),
  notes: z.string().nullable(),
  source: RecordSource,
  sensitivity: SensitivityTier.default("standard"),
  createdAt: Iso8601,
  updatedAt: Iso8601,
});
export type Encounter = z.infer<typeof Encounter>;

export const CheckIn = z.object({
  id: Uuid,
  userId: Uuid,
  profileId: Uuid,
  cadence: z.enum(["daily", "weekly", "monthly"]),
  scoredAt: Iso8601,
  // Sliders 1..10 each.
  physical: z.number().int().min(1).max(10).nullable(),
  mental: z.number().int().min(1).max(10).nullable(),
  energy: z.number().int().min(1).max(10).nullable(),
  pain: z.number().int().min(1).max(10).nullable(),
  symptoms: z.array(z.string()),
  freeText: z.string().nullable(),
  createdAt: Iso8601,
});
export type CheckIn = z.infer<typeof CheckIn>;
