// Privacy invariants for the consent engine â€” see docs/14_TEST_STRATEGY.md Â§4.1.
// fast-check exercises hundreds of (actor, target, resource, purpose, grant)
// combinations and asserts the universal rules hold.

import fc from "fast-check";
import { describe, expect, it } from "vitest";

import type {
  ConsentGrant,
  ConsentPurpose,
  ConsentScope,
  Decision,
  Preset,
  ResourceRef,
  SensitivityTier,
  Uuid,
} from "@familia/domain";

import { evaluateAccess, POLICY_VERSION, tierForScope, type GrantStore } from "../src/index.js";

// â”€â”€â”€ Arbitraries (random generators) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const STANDARD_SCOPES: ConsentScope[] = [
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
  "emergency_profile",
  "check_ins_aggregate",
];
const SENSITIVE_SCOPES: ConsentScope[] = [
  "reproductive",
  "sexual",
  "controlled_substances",
  "substance_use",
  "family_relationship_status",
];
const HIGHLY_SENSITIVE_SCOPES: ConsentScope[] = [
  "mental_health",
  "hrt",
  "dna",
  "hidden_relationship",
  "abuse_legal",
];
const ALL_SCOPES: ConsentScope[] = [
  ...STANDARD_SCOPES,
  ...SENSITIVE_SCOPES,
  ...HIGHLY_SENSITIVE_SCOPES,
];
const PURPOSES: ConsentPurpose[] = ["read", "export", "share_onward", "display_in_summary"];
const PRESETS: Preset[] = ["none", "emergency", "care_bundle", "full_record", "custom"];

const NOW = new Date("2026-04-26T12:00:00Z");
const ALICE: Uuid = "00000000-0000-0000-0000-00000000a11c";
const BOB: Uuid = "00000000-0000-0000-0000-00000000b0b0";

function makeResource(category: ConsentScope, ownerUserId: Uuid = ALICE): ResourceRef {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    category,
    sensitivity: tierForScope(category),
    ownerUserId,
  };
}

function makeGrant(
  partial: Partial<ConsentGrant> & {
    scopes: ConsentScope[];
    purposes: ConsentPurpose[];
    preset: Preset;
  },
): ConsentGrant {
  return {
    id: "g-test",
    grantorUserId: ALICE,
    recipientUserId: BOB,
    preset: partial.preset,
    scopes: partial.scopes,
    purposes: partial.purposes,
    disclosureModeDefault: "identified",
    allowReDisclosure: false,
    consentTermsVersion: POLICY_VERSION,
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: null,
    state: "active",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    supersededByGrantId: null,
    ...partial,
  };
}

function storeWithGrant(grant: ConsentGrant | null): GrantStore {
  return {
    async findActiveGrant() {
      return grant;
    },
    async isInEmergencyAccessList() {
      return false;
    },
  };
}

// â”€â”€â”€ Invariants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe("Universal access invariants", () => {
  // P1: with NO grant and NO emergency access, every (actor, target, resource,
  // purpose) is denied.
  it("no grant + no emergency = always deny", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...ALL_SCOPES),
        fc.constantFrom(...PURPOSES),
        async (scope, purpose) => {
          const out = await evaluateAccess(
            {
              actorUserId: BOB,
              targetUserId: ALICE,
              resource: makeResource(scope),
              purpose,
              evaluatedAt: NOW,
            },
            storeWithGrant(null),
          );
          expect(out.decision).toBe<Decision["decision"]>("deny");
          return true;
        },
      ),
      { numRuns: 200 },
    );
  });

  // P2: every Highly Sensitive read REQUIRES a per-entry grant (preset = 'custom').
  // No preset can authorize highly-sensitive content.
  it("highly-sensitive scopes never accessible via a preset grant", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...HIGHLY_SENSITIVE_SCOPES),
        // Pick any preset OTHER than 'custom'.
        fc.constantFrom<Preset>("none", "emergency", "care_bundle", "full_record"),
        fc.constantFrom(...PURPOSES),
        async (scope, preset, purpose) => {
          const grant = makeGrant({
            preset,
            scopes: [scope],
            purposes: [purpose],
          });
          const out = await evaluateAccess(
            {
              actorUserId: BOB,
              targetUserId: ALICE,
              resource: makeResource(scope),
              purpose,
              evaluatedAt: NOW,
            },
            storeWithGrant(grant),
          );
          expect(out.decision).toBe<Decision["decision"]>("deny");
          expect(out.reason).toBe("highly_sensitive_requires_per_entry_grant");
          return true;
        },
      ),
      { numRuns: 200 },
    );
  });

  // P3: highly-sensitive scopes are non-transitive â€” share_onward always denied.
  it("highly-sensitive scopes are non-transitive (share_onward always denied)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...HIGHLY_SENSITIVE_SCOPES),
        async (scope) => {
          const grant = makeGrant({
            preset: "custom",
            scopes: [scope],
            purposes: ["share_onward"],
            allowReDisclosure: true, // even with re-disclosure allowed
          });
          const out = await evaluateAccess(
            {
              actorUserId: BOB,
              targetUserId: ALICE,
              resource: makeResource(scope),
              purpose: "share_onward",
              evaluatedAt: NOW,
            },
            storeWithGrant(grant),
          );
          expect(out.decision).toBe<Decision["decision"]>("deny");
          expect(out.reason).toBe("highly_sensitive_non_transitive");
          return true;
        },
      ),
    );
  });

  // P4: sensitive scopes require explicit opt-in (Care bundle does NOT include them).
  it("sensitive scopes never authorized by a care_bundle preset that omits the scope", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom(...SENSITIVE_SCOPES), async (scope) => {
        const grant = makeGrant({
          preset: "care_bundle",
          // Care bundle scopes per docs/05 Â§3.3 do NOT include sensitive scopes.
          // We construct a grant that has Care bundle preset BUT a different
          // standard scope â€” so the sensitive scope is not in scopes[].
          scopes: ["medications", "labs"],
          purposes: ["read"],
        });
        const out = await evaluateAccess(
          {
            actorUserId: BOB,
            targetUserId: ALICE,
            resource: makeResource(scope),
            purpose: "read",
            evaluatedAt: NOW,
          },
          storeWithGrant(grant),
        );
        expect(out.decision).toBe<Decision["decision"]>("deny");
        expect(out.reason).toBe("sensitive_requires_explicit_optin");
        return true;
      }),
    );
  });

  // P5: self-access is always allowed.
  it("self-access always allowed regardless of grant or scope", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...ALL_SCOPES),
        fc.constantFrom(...PURPOSES),
        async (scope, purpose) => {
          const out = await evaluateAccess(
            {
              actorUserId: ALICE,
              targetUserId: ALICE,
              resource: makeResource(scope, ALICE),
              purpose,
              evaluatedAt: NOW,
            },
            storeWithGrant(null),
          );
          expect(out.decision).toBe<Decision["decision"]>("allow");
          expect(out.reason).toBe("self_access");
          return true;
        },
      ),
      { numRuns: 200 },
    );
  });

  // P6: resource-owner-mismatch always denied.
  it("rejects when the resource owner doesn't match the target", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...ALL_SCOPES),
        fc.constantFrom(...PURPOSES),
        async (scope, purpose) => {
          const out = await evaluateAccess(
            {
              actorUserId: BOB,
              targetUserId: ALICE,
              resource: makeResource(scope, BOB), // wrong owner
              purpose,
              evaluatedAt: NOW,
            },
            storeWithGrant(makeGrant({
              preset: "full_record",
              scopes: [scope],
              purposes: [purpose],
            })),
          );
          expect(out.decision).toBe<Decision["decision"]>("deny");
          expect(out.reason).toBe("resource_owner_mismatch");
          return true;
        },
      ),
      { numRuns: 200 },
    );
  });

  // P7: every Allow decision references a grant id (or is self/emergency).
  // For non-self, non-emergency allows, grantIdUsed must be set.
  it("every Allow decision (non-self, non-emergency) references a grant id", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom(...STANDARD_SCOPES), async (scope) => {
        const grant = makeGrant({
          preset: "care_bundle",
          scopes: [scope],
          purposes: ["read"],
        });
        const out = await evaluateAccess(
          {
            actorUserId: BOB,
            targetUserId: ALICE,
            resource: makeResource(scope),
            purpose: "read",
            evaluatedAt: NOW,
          },
          storeWithGrant(grant),
        );
        if (out.decision === "allow") {
          expect(out.grantIdUsed).toBe(grant.id);
        }
        return true;
      }),
    );
  });

  // P8: every decision carries the policy version (audit-grade).
  it("every decision carries POLICY_VERSION", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...ALL_SCOPES),
        fc.constantFrom(...PURPOSES),
        async (scope, purpose) => {
          const out = await evaluateAccess(
            {
              actorUserId: BOB,
              targetUserId: ALICE,
              resource: makeResource(scope),
              purpose,
              evaluatedAt: NOW,
            },
            storeWithGrant(null),
          );
          expect(out.policyVersion).toBe(POLICY_VERSION);
          return true;
        },
      ),
    );
  });

  // P9: tier classification is internally consistent â€” every scope returns
  // the right tier.
  it("scope-tier classification is internally consistent", () => {
    fc.assert(
      fc.property(fc.constantFrom(...ALL_SCOPES), (scope) => {
        const tier: SensitivityTier = tierForScope(scope);
        expect(["standard", "sensitive", "highly_sensitive"]).toContain(tier);
        if (HIGHLY_SENSITIVE_SCOPES.includes(scope)) expect(tier).toBe("highly_sensitive");
        if (SENSITIVE_SCOPES.includes(scope)) expect(tier).toBe("sensitive");
        if (STANDARD_SCOPES.includes(scope)) expect(tier).toBe("standard");
      }),
    );
  });
});
