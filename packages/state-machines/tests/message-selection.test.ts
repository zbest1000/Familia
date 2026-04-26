// Tests for the message-variant selector. The genetic-language invariant
// is the most important: a non-biological recipient must NEVER be routed
// to the biological hereditary variant. See docs/04 Â§5 and docs/14 Â§4.1.

import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { en, t } from "@familia/copy";

import {
  containsGeneticLanguage,
  GENETIC_LANGUAGE_TOKENS,
  selectMessageVariant,
  variantMayContainGeneticLanguage,
  type MessageVariantKey,
} from "../src/message-selection.js";

const ALERT_TYPES = ["hereditary_risk", "general_health_update", "wellness_trend", "emergency"] as const;
const RECIPIENT_CLASSES = [
  "biological_genetic",
  "non_biological_support",
  "spouse_partner",
  "caregiver",
  "adult_child",
  "minor_child",
  "clinician",
  "general_family",
] as const;

describe("selectMessageVariant", () => {
  // Property: the only variant containing genetic language is
  // alert.hereditary.biological. For any (alertType, recipientClass) where
  // the recipient is NOT biological_genetic, the chosen variant must not
  // be flagged as 'may contain genetic language'.
  it("never routes a non-biological recipient to a genetic-language variant", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALERT_TYPES),
        fc.constantFrom(...RECIPIENT_CLASSES),
        (type, recipientClass) => {
          const v = selectMessageVariant(type, recipientClass);
          if (recipientClass !== "biological_genetic" && variantMayContainGeneticLanguage(v)) {
            // Surface the failing combination clearly.
            throw new Error(
              `non-biological recipient '${recipientClass}' was routed to genetic variant '${v}' for type '${type}'`,
            );
          }
          return true;
        },
      ),
      { numRuns: 256 },
    );
  });

  it("emergency events always route to alert.emergency", () => {
    for (const recipientClass of RECIPIENT_CLASSES) {
      expect(selectMessageVariant("emergency", recipientClass)).toBe<MessageVariantKey>(
        "alert.emergency",
      );
    }
  });

  it("hereditary_risk routes biological recipients to the biological variant", () => {
    expect(selectMessageVariant("hereditary_risk", "biological_genetic")).toBe<MessageVariantKey>(
      "alert.hereditary.biological",
    );
  });

  it("hereditary_risk routes everyone else to the non-biological variant", () => {
    for (const recipientClass of RECIPIENT_CLASSES) {
      if (recipientClass === "biological_genetic") continue;
      expect(selectMessageVariant("hereditary_risk", recipientClass)).toBe<MessageVariantKey>(
        "alert.hereditary.nonBiological",
      );
    }
  });

  it("returns a defined copy key for every combination", () => {
    for (const type of ALERT_TYPES) {
      for (const recipientClass of RECIPIENT_CLASSES) {
        const v = selectMessageVariant(type, recipientClass);
        expect(en[v]).toBeTypeOf("string");
      }
    }
  });
});

describe("containsGeneticLanguage", () => {
  it("flags any token from GENETIC_LANGUAGE_TOKENS regardless of case", () => {
    fc.assert(
      fc.property(fc.constantFrom(...GENETIC_LANGUAGE_TOKENS), (tok) => {
        expect(containsGeneticLanguage(`prefix ${tok} suffix`)).toBe(true);
        expect(containsGeneticLanguage(`prefix ${tok.toUpperCase()} suffix`)).toBe(true);
        expect(containsGeneticLanguage(`prefix ${tok.toLowerCase()} suffix`)).toBe(true);
      }),
    );
  });

  it("does not flag innocuous text", () => {
    expect(containsGeneticLanguage("Your spouse shared a health update.")).toBe(false);
    expect(containsGeneticLanguage("Saved.")).toBe(false);
    expect(containsGeneticLanguage("")).toBe(false);
  });
});

describe("rendered copy compliance", () => {
  // Property: the rendered text for variants OTHER than the biological
  // hereditary one must not contain genetic-language tokens. This is the
  // ground-truth check that copy edits don't accidentally leak genetic
  // implication into the wrong audience.
  const VARIANTS_TO_CHECK: MessageVariantKey[] = [
    "alert.hereditary.nonBiological",
    "alert.spouse",
    "alert.caregiver",
    "alert.adultChild",
    "alert.minorChild",
    "alert.clinician",
    "alert.generalFamily",
    "alert.emergency",
  ];

  for (const v of VARIANTS_TO_CHECK) {
    it(`'${v}' copy does not contain genetic-implication tokens`, () => {
      const rendered = t("en", v, {
        sender: "Maya",
        marker: "BRCA1",
        parentRel: "mother",
        otherGuardian: "Lana",
        profile: "Maeve",
        person: "Jamal",
        user: "Jordan",
        time: "10:00",
      });
      expect(containsGeneticLanguage(rendered)).toBe(false);
    });
  }

  it("'alert.hereditary.biological' IS allowed to contain genetic language", () => {
    const rendered = t("en", "alert.hereditary.biological", {
      sender: "Rosa",
      marker: "BRCA1",
    });
    expect(containsGeneticLanguage(rendered)).toBe(true);
  });
});
