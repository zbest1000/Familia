// Message-variant selection. Given an alert event and a recipient's
// relationship class to the sender, returns the copy key for the message
// variant that should be rendered for that recipient.
//
// Source of truth for the copy strings: packages/copy/src/en.ts and
// docs/04_VOICE_AND_TONE.md §5. Source of truth for the relationship
// classes: docs/13_API_STATE_MACHINES.md §3.

import type { AlertType, RelationshipClass } from "@familia/domain";

/**
 * The message variant keys we render for an alert. Stable strings —
 * downstream copy lookup uses these to find the right template.
 */
export type MessageVariantKey =
  | "alert.hereditary.biological"
  | "alert.hereditary.nonBiological"
  | "alert.spouse"
  | "alert.caregiver"
  | "alert.adultChild"
  | "alert.minorChild"
  | "alert.clinician"
  | "alert.generalFamily"
  | "alert.emergency";

/**
 * Pure function. No side effects, no I/O. The contract:
 *
 * 1. For `hereditary_risk` events: biological_genetic recipients get the
 *    biological variant; **everyone else** gets a non-genetic variant.
 *    This is the single most important invariant — if it ever fails, an
 *    adopted relative could receive a genetic-implication message they
 *    shouldn't.
 *
 * 2. For `emergency` events: all recipients get the emergency variant
 *    regardless of relationship.
 *
 * 3. Otherwise: we route by relationship class.
 */
export function selectMessageVariant(
  type: AlertType,
  recipientClass: RelationshipClass,
): MessageVariantKey {
  if (type === "emergency") {
    return "alert.emergency";
  }

  if (type === "hereditary_risk") {
    return recipientClass === "biological_genetic"
      ? "alert.hereditary.biological"
      : "alert.hereditary.nonBiological";
  }

  // general_health_update and wellness_trend route by recipient.
  switch (recipientClass) {
    case "biological_genetic":
      return "alert.generalFamily";
    case "non_biological_support":
      return "alert.generalFamily";
    case "spouse_partner":
      return "alert.spouse";
    case "caregiver":
      return "alert.caregiver";
    case "adult_child":
      return "alert.adultChild";
    case "minor_child":
      return "alert.minorChild";
    case "clinician":
      return "alert.clinician";
    case "general_family":
      return "alert.generalFamily";
    default: {
      const _exhaustive: never = recipientClass;
      return _exhaustive;
    }
  }
}

/**
 * Tokens that, if present in a rendered hereditary message, would imply
 * genetic risk. Used by the property tests in
 * packages/copy/tests/no-genetic-language.test.ts (and any future renderer
 * test) to assert non-biological recipients never see genetic-implication
 * language.
 */
export const GENETIC_LANGUAGE_TOKENS: ReadonlyArray<string> = [
  "genetic",
  "genetically",
  "hereditary",
  "inherited",
  "carrier",
  "BRCA",
  "Lynch",
  "screening",
];

/**
 * Convenience predicate used by tests and the alert preview renderer
 * to confirm a rendered message does not contain genetic-implication
 * language.
 */
export function containsGeneticLanguage(rendered: string): boolean {
  const lc = rendered.toLowerCase();
  return GENETIC_LANGUAGE_TOKENS.some((tok) => lc.includes(tok.toLowerCase()));
}

/**
 * Variants that ARE allowed to contain genetic-implication language.
 * Anything else carrying genetic language is a privacy bug.
 */
export function variantMayContainGeneticLanguage(v: MessageVariantKey): boolean {
  return v === "alert.hereditary.biological";
}
