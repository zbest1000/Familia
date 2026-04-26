import { z } from "zod";

import { Confidence, Iso8601, RecordSource, SensitivityTier, Uuid } from "./common";

export const DocumentKind = z.enum([
  "lab_report",
  "imaging_report",
  "discharge_summary",
  "prescription",
  "insurance",
  "dental",
  "vision",
  "mental_health",
  "generic_medical",
  "non_medical",
]);
export type DocumentKind = z.infer<typeof DocumentKind>;

export const DocumentExtractionState = z.enum([
  "uploaded",
  "ocr_pending",
  "ocr_complete",
  "extraction_pending",
  "extraction_complete",
  "review_pending",
  "review_accepted",
  "review_rejected",
  "extraction_unavailable",
]);
export type DocumentExtractionState = z.infer<typeof DocumentExtractionState>;

export const VaultDocument = z.object({
  id: Uuid,
  userId: Uuid,
  profileId: Uuid,
  kind: DocumentKind,
  title: z.string(),
  // Object storage pointer (URL or key) — never the file bytes.
  storageKey: z.string(),
  contentType: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  contentHash: z.string(), // sha-256 of the original file bytes — durability check
  pageCount: z.number().int().nonnegative().nullable(),
  capturedAt: Iso8601.nullable(),
  attachedEncounterId: Uuid.nullable(),
  source: RecordSource,
  sensitivity: SensitivityTier.default("standard"),
  extractionState: DocumentExtractionState,
  // For staging-area review.
  extractionConfidence: Confidence.nullable(),
  // Original file is never modified.
  createdAt: Iso8601,
  updatedAt: Iso8601,
});
export type VaultDocument = z.infer<typeof VaultDocument>;
