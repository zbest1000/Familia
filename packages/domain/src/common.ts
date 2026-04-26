import { z } from "zod";

export const Uuid = z.string().uuid();
export type Uuid = z.infer<typeof Uuid>;

export const Iso8601 = z.string().datetime({ offset: true });
export type Iso8601 = z.infer<typeof Iso8601>;

export const ApproxDate = z.object({
  // 'exact' if the user knows the date; otherwise increasing levels of fuzziness.
  precision: z.enum(["exact", "month", "year", "approx", "unknown"]),
  value: z.string().nullable(),
  // Free-text the user typed, e.g., "around 2019".
  raw: z.string().nullable(),
});
export type ApproxDate = z.infer<typeof ApproxDate>;

// Source of a record. Drives provenance labels and AI summary attribution.
export const RecordSource = z.enum([
  "manual",
  "ocr_extracted_reviewed",
  "ocr_extracted_pending",
  "wearable",
  "family_shared",
  "fhir_import",
  "system_generated",
]);
export type RecordSource = z.infer<typeof RecordSource>;

export const SensitivityTier = z.enum(["standard", "sensitive", "highly_sensitive"]);
export type SensitivityTier = z.infer<typeof SensitivityTier>;

export const Confidence = z.number().min(0).max(1);
export type Confidence = z.infer<typeof Confidence>;
