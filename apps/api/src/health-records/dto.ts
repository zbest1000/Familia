import { z } from "zod";

const ApproxDate = z
  .string()
  .regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, "expected YYYY, YYYY-MM, or YYYY-MM-DD")
  .optional();

export const NewMedicationDto = z.object({
  name: z.string().min(1).max(200),
  genericName: z.string().max(200).optional(),
  doseValue: z.number().nonnegative().optional(),
  doseUnit: z.string().max(20).optional(),
  doseText: z.string().max(60).optional(),
  route: z.string().max(40).optional(),
  frequencyText: z.string().max(120).optional(),
  status: z.enum(["active", "paused", "completed", "unknown"]).default("active"),
  startDate: ApproxDate,
  stopDate: ApproxDate,
  prescriber: z.string().max(120).optional(),
  pharmacy: z.string().max(120).optional(),
  reason: z.string().max(300).optional(),
  notes: z.string().max(2000).optional(),
});
export type NewMedicationDto = z.infer<typeof NewMedicationDto>;

export const UpdateMedicationDto = NewMedicationDto.partial();
export type UpdateMedicationDto = z.infer<typeof UpdateMedicationDto>;

export const NewConditionDto = z.object({
  name: z.string().min(1).max(200),
  codeSystem: z.string().max(40).optional(),
  code: z.string().max(40).optional(),
  status: z.enum(["active", "resolved", "in_remission", "unknown"]).default("active"),
  onsetDate: ApproxDate,
  resolvedDate: ApproxDate,
  severity: z.enum(["mild", "moderate", "severe", "unknown"]).optional(),
  notes: z.string().max(2000).optional(),
});
export type NewConditionDto = z.infer<typeof NewConditionDto>;

export const UpdateConditionDto = NewConditionDto.partial();
export type UpdateConditionDto = z.infer<typeof UpdateConditionDto>;

// Approx date → DateTime parser. "2018" → 2018-01-01, "2018-06" → 2018-06-01.
export function parseApproxDate(s: string | undefined | null): Date | null {
  if (!s) return null;
  if (/^\d{4}$/.test(s)) return new Date(`${s}-01-01T00:00:00Z`);
  if (/^\d{4}-\d{2}$/.test(s)) return new Date(`${s}-01T00:00:00Z`);
  return new Date(`${s}T00:00:00Z`);
}
