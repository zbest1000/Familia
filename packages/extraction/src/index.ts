// OCR + LLM extraction pipeline contracts.
// Concrete OCR + LLM client implementations live in services/ocr-pipeline.
// This package defines the schemas the worker and the API both rely on,
// so user-review UI can render them without depending on the worker.

import { z } from "zod";

import { Confidence } from "@familia/domain";

export const ExtractedAnalyte = z.object({
  name: z.string(),
  loincCode: z.string().nullable(),
  value: z.string(), // raw text; numeric parsing is reviewer's job
  numericValue: z.number().nullable(),
  unit: z.string().nullable(),
  referenceRangeLow: z.number().nullable(),
  referenceRangeHigh: z.number().nullable(),
  flag: z.enum(["high", "low", "critical_high", "critical_low", "normal", "unknown"]).nullable(),
  confidence: Confidence,
  sourceSpan: z.object({
    page: z.number().int().min(1),
    bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).nullable(),
  }).nullable(),
});
export type ExtractedAnalyte = z.infer<typeof ExtractedAnalyte>;

export const ExtractedLabReport = z.object({
  documentId: z.string(),
  specimenDate: z.string().nullable(),
  collectedAt: z.string().nullable(),
  orderedBy: z.string().nullable(),
  facility: z.string().nullable(),
  analytes: z.array(ExtractedAnalyte),
  overallConfidence: Confidence,
  modelVersion: z.string(),
  extractedAt: z.string(),
});
export type ExtractedLabReport = z.infer<typeof ExtractedLabReport>;

export const ExtractedDischargeSummary = z.object({
  documentId: z.string(),
  admissionDate: z.string().nullable(),
  dischargeDate: z.string().nullable(),
  primaryDiagnosis: z.string().nullable(),
  secondaryDiagnoses: z.array(z.string()),
  procedures: z.array(z.string()),
  dischargeMedications: z.array(
    z.object({
      name: z.string(),
      dose: z.string().nullable(),
      frequency: z.string().nullable(),
    }),
  ),
  followUpInstructions: z.string().nullable(),
  overallConfidence: Confidence,
  modelVersion: z.string(),
  extractedAt: z.string(),
});
export type ExtractedDischargeSummary = z.infer<typeof ExtractedDischargeSummary>;

// The worker writes to a typed staging table; the API serves them to the
// user's review queue.
export type StagedExtraction =
  | { kind: "lab_report"; data: ExtractedLabReport }
  | { kind: "discharge_summary"; data: ExtractedDischargeSummary };
