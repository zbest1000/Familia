// Synthetic data factories. Realistic enough to exercise edge cases but
// completely fake — never seeded from real PHI.

import type {
  AlertType,
  ConsentGrant,
  ConsentScope,
  FamilyRelationship,
  Medication,
  RelationshipType,
  User,
} from "@familia/domain";

let counter = 0;
function id(prefix: string): string {
  counter += 1;
  return `${prefix}-${String(counter).padStart(8, "0")}`;
}
function now(): string {
  return new Date("2026-04-26T12:00:00Z").toISOString();
}

export function aUser(overrides: Partial<User> = {}): User {
  return {
    id: id("user"),
    email: `${id("addr")}@example.com`,
    phone: null,
    firstName: "Test",
    lastName: "User",
    dateOfBirth: "1985-06-15",
    sexAtBirth: "female",
    genderIdentity: null,
    preferredUnits: "imperial",
    primaryLanguage: "en",
    timezone: "America/Los_Angeles",
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
    ...overrides,
  };
}

export function aMedication(overrides: Partial<Medication> = {}): Medication {
  return {
    id: id("med"),
    userId: id("user"),
    profileId: id("profile"),
    name: "Levothyroxine",
    genericName: "levothyroxine",
    doseValue: 50,
    doseUnit: "mcg",
    doseText: "50 mcg",
    route: "oral",
    frequencyText: "once daily",
    status: "active",
    startDate: { precision: "year", value: "2018", raw: "2018" },
    stopDate: null,
    prescriber: null,
    pharmacy: null,
    reason: "Hashimoto's",
    source: "manual",
    sensitivity: "standard",
    notes: null,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function aRelationship(
  overrides: Partial<FamilyRelationship> = {},
): FamilyRelationship {
  return {
    id: id("rel"),
    userId: id("user"),
    relatedUserId: id("user"),
    relatedProfileGhostId: null,
    type: "spouse" satisfies RelationshipType,
    biologicalLink: false,
    biologicalConfidence: 0,
    visibility: "visible_to_family",
    doNotAlert: false,
    deceased: false,
    deceasedAt: null,
    notes: null,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function aGrant(overrides: Partial<ConsentGrant> = {}): ConsentGrant {
  return {
    id: id("grant"),
    grantorUserId: id("user"),
    recipientUserId: id("user"),
    preset: "care_bundle",
    scopes: [
      "emergency_profile",
      "conditions",
      "medications",
      "allergies",
      "labs",
      "encounters",
    ] satisfies ConsentScope[],
    purposes: ["read"],
    disclosureModeDefault: "identified",
    allowReDisclosure: false,
    consentTermsVersion: "2026-04-26",
    validFrom: now(),
    validUntil: null,
    state: "active",
    createdAt: now(),
    updatedAt: now(),
    supersededByGrantId: null,
    ...overrides,
  };
}

export function anAlertType(): AlertType {
  return "general_health_update";
}
