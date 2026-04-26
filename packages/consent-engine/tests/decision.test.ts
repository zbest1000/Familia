import { describe, expect, it } from "vitest";

import { POLICY_VERSION, evaluateAccess, type GrantStore } from "../src/index.js";

const NOW = new Date("2026-04-26T12:00:00Z");

const ALICE = "00000000-0000-0000-0000-00000000a11c";
const BOB = "00000000-0000-0000-0000-00000000b0b0";
const RESOURCE_ID = "11111111-1111-1111-1111-111111111111";

const noGrants: GrantStore = {
  async findActiveGrant() {
    return null;
  },
  async isInEmergencyAccessList() {
    return false;
  },
};

describe("evaluateAccess", () => {
  it("allows self-access without checking grants", async () => {
    const out = await evaluateAccess(
      {
        actorUserId: ALICE,
        targetUserId: ALICE,
        resource: {
          id: RESOURCE_ID,
          category: "medications",
          sensitivity: "standard",
          ownerUserId: ALICE,
        },
        purpose: "read",
        evaluatedAt: NOW,
      },
      noGrants,
    );
    expect(out.decision).toBe("allow");
    expect(out.reason).toBe("self_access");
    expect(out.policyVersion).toBe(POLICY_VERSION);
  });

  it("denies a stranger with no active grant", async () => {
    const out = await evaluateAccess(
      {
        actorUserId: BOB,
        targetUserId: ALICE,
        resource: {
          id: RESOURCE_ID,
          category: "medications",
          sensitivity: "standard",
          ownerUserId: ALICE,
        },
        purpose: "read",
        evaluatedAt: NOW,
      },
      noGrants,
    );
    expect(out.decision).toBe("deny");
    expect(out.reason).toBe("no_active_grant");
  });

  it("denies if resource owner mismatches target", async () => {
    const out = await evaluateAccess(
      {
        actorUserId: BOB,
        targetUserId: ALICE,
        resource: {
          id: RESOURCE_ID,
          category: "medications",
          sensitivity: "standard",
          ownerUserId: BOB, // wrong owner
        },
        purpose: "read",
        evaluatedAt: NOW,
      },
      noGrants,
    );
    expect(out.decision).toBe("deny");
    expect(out.reason).toBe("resource_owner_mismatch");
  });

  it("allows emergency-list access on emergency_profile", async () => {
    const store: GrantStore = {
      async findActiveGrant() {
        return null;
      },
      async isInEmergencyAccessList() {
        return true;
      },
    };
    const out = await evaluateAccess(
      {
        actorUserId: BOB,
        targetUserId: ALICE,
        resource: {
          id: RESOURCE_ID,
          category: "emergency_profile",
          sensitivity: "standard",
          ownerUserId: ALICE,
        },
        purpose: "read",
        evaluatedAt: NOW,
      },
      store,
    );
    expect(out.decision).toBe("allow_emergency");
  });

  it("denies highly-sensitive access derived from a preset", async () => {
    const store: GrantStore = {
      async findActiveGrant() {
        return {
          id: "g1",
          grantorUserId: ALICE,
          recipientUserId: BOB,
          preset: "care_bundle", // not custom â€” must fail for HS
          scopes: ["mental_health"],
          purposes: ["read"],
          disclosureModeDefault: "identified",
          allowReDisclosure: false,
          consentTermsVersion: POLICY_VERSION,
          validFrom: "2026-01-01T00:00:00Z",
          validUntil: null,
          state: "active",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
          supersededByGrantId: null,
        };
      },
      async isInEmergencyAccessList() {
        return false;
      },
    };
    const out = await evaluateAccess(
      {
        actorUserId: BOB,
        targetUserId: ALICE,
        resource: {
          id: RESOURCE_ID,
          category: "mental_health",
          sensitivity: "highly_sensitive",
          ownerUserId: ALICE,
        },
        purpose: "read",
        evaluatedAt: NOW,
      },
      store,
    );
    expect(out.decision).toBe("deny");
    expect(out.reason).toBe("highly_sensitive_requires_per_entry_grant");
  });

  it("denies share_onward of highly-sensitive even with custom grant", async () => {
    const store: GrantStore = {
      async findActiveGrant() {
        return {
          id: "g1",
          grantorUserId: ALICE,
          recipientUserId: BOB,
          preset: "custom",
          scopes: ["mental_health"],
          purposes: ["share_onward"],
          disclosureModeDefault: "identified",
          allowReDisclosure: true,
          consentTermsVersion: POLICY_VERSION,
          validFrom: "2026-01-01T00:00:00Z",
          validUntil: null,
          state: "active",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
          supersededByGrantId: null,
        };
      },
      async isInEmergencyAccessList() {
        return false;
      },
    };
    const out = await evaluateAccess(
      {
        actorUserId: BOB,
        targetUserId: ALICE,
        resource: {
          id: RESOURCE_ID,
          category: "mental_health",
          sensitivity: "highly_sensitive",
          ownerUserId: ALICE,
        },
        purpose: "share_onward",
        evaluatedAt: NOW,
      },
      store,
    );
    expect(out.decision).toBe("deny");
    expect(out.reason).toBe("highly_sensitive_non_transitive");
  });

  it("denies sensitive scope not explicitly in grant scopes", async () => {
    const store: GrantStore = {
      async findActiveGrant() {
        return {
          id: "g1",
          grantorUserId: ALICE,
          recipientUserId: BOB,
          preset: "care_bundle",
          // 'reproductive' is sensitive â€” must be explicit, not implied by care_bundle.
          scopes: ["medications", "labs"],
          purposes: ["read"],
          disclosureModeDefault: "identified",
          allowReDisclosure: false,
          consentTermsVersion: POLICY_VERSION,
          validFrom: "2026-01-01T00:00:00Z",
          validUntil: null,
          state: "active",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
          supersededByGrantId: null,
        };
      },
      async isInEmergencyAccessList() {
        return false;
      },
    };
    const out = await evaluateAccess(
      {
        actorUserId: BOB,
        targetUserId: ALICE,
        resource: {
          id: RESOURCE_ID,
          category: "reproductive",
          sensitivity: "sensitive",
          ownerUserId: ALICE,
        },
        purpose: "read",
        evaluatedAt: NOW,
      },
      store,
    );
    expect(out.decision).toBe("deny");
    expect(out.reason).toBe("sensitive_requires_explicit_optin");
  });

  it("allows when grant covers scope and purpose", async () => {
    const store: GrantStore = {
      async findActiveGrant() {
        return {
          id: "g1",
          grantorUserId: ALICE,
          recipientUserId: BOB,
          preset: "care_bundle",
          scopes: ["medications", "labs", "encounters"],
          purposes: ["read"],
          disclosureModeDefault: "identified",
          allowReDisclosure: false,
          consentTermsVersion: POLICY_VERSION,
          validFrom: "2026-01-01T00:00:00Z",
          validUntil: null,
          state: "active",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
          supersededByGrantId: null,
        };
      },
      async isInEmergencyAccessList() {
        return false;
      },
    };
    const out = await evaluateAccess(
      {
        actorUserId: BOB,
        targetUserId: ALICE,
        resource: {
          id: RESOURCE_ID,
          category: "medications",
          sensitivity: "standard",
          ownerUserId: ALICE,
        },
        purpose: "read",
        evaluatedAt: NOW,
      },
      store,
    );
    expect(out.decision).toBe("allow");
    expect(out.grantIdUsed).toBe("g1");
  });
});
