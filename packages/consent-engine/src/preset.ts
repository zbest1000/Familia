import type { ConsentScope, Preset, SensitivityTier } from "@familia/domain";

// Materialize a preset into the explicit list of categories it covers.
// Source of truth: docs/05_PERMISSION_MATRIX.md §3.
export function presetScopes(preset: Preset): ConsentScope[] {
  switch (preset) {
    case "none":
      return [];
    case "emergency":
      return ["emergency_profile"];
    case "care_bundle":
      return [
        "emergency_profile",
        "encounters",
        "labs",
        "imaging",
        "procedures",
        "immunizations",
        "dental",
        "vision",
        "wearables_aggregate",
        "check_ins_aggregate",
        "documents_general",
        "conditions",
        "medications",
        "allergies",
      ];
    case "full_record":
      // Everything except Highly Sensitive — those require per-entry grants always.
      return [
        "emergency_profile",
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
        "check_ins_aggregate",
        "reproductive",
        "sexual",
        "controlled_substances",
        "substance_use",
        "family_relationship_status",
      ];
    case "custom":
      // Custom is materialized from explicit user choice elsewhere.
      return [];
    default: {
      // Exhaustiveness check: if a new Preset value is added, this won't compile.
      const _exhaustive: never = preset;
      return _exhaustive;
    }
  }
}

// Sensitivity tier for each scope.
const TIER: Record<ConsentScope, SensitivityTier> = {
  conditions: "standard",
  medications: "standard",
  allergies: "standard",
  immunizations: "standard",
  encounters: "standard",
  labs: "standard",
  procedures: "standard",
  imaging: "standard",
  dental: "standard",
  vision: "standard",
  lifestyle: "standard",
  wearables_aggregate: "standard",
  wearables_raw: "standard",
  documents_general: "standard",
  emergency_profile: "standard",
  check_ins_aggregate: "standard",

  reproductive: "sensitive",
  sexual: "sensitive",
  controlled_substances: "sensitive",
  substance_use: "sensitive",
  family_relationship_status: "sensitive",

  mental_health: "highly_sensitive",
  hrt: "highly_sensitive",
  dna: "highly_sensitive",
  hidden_relationship: "highly_sensitive",
  abuse_legal: "highly_sensitive",
};

export function tierForScope(scope: ConsentScope): SensitivityTier {
  return TIER[scope];
}
