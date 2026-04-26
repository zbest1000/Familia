// The 6 primary personas from docs/01_PERSONAS.md, instantiated as fixtures.
// Used by tools/seed/ to bootstrap a useful local dev environment.

import type { User } from "@familia/domain";

export const personaUsers: Record<string, Partial<User>> = {
  maya: {
    firstName: "Maya",
    lastName: "Reyes",
    dateOfBirth: "1987-03-12",
    sexAtBirth: "female",
    timezone: "America/Chicago",
    primaryLanguage: "en",
  },
  david: {
    firstName: "David",
    lastName: "Okafor",
    dateOfBirth: "1973-09-22",
    sexAtBirth: "male",
    timezone: "America/New_York",
    primaryLanguage: "en",
  },
  rosa: {
    firstName: "Rosa",
    lastName: "Kim",
    dateOfBirth: "1980-11-01",
    sexAtBirth: "female",
    timezone: "America/Los_Angeles",
    primaryLanguage: "en",
  },
  jordan: {
    firstName: "Jordan",
    lastName: "Park",
    dateOfBirth: "1996-07-18",
    sexAtBirth: "female",
    genderIdentity: "non_binary",
    timezone: "America/New_York",
    primaryLanguage: "en",
  },
  marcus: {
    firstName: "Marcus",
    lastName: "Sullivan",
    dateOfBirth: "1984-01-29",
    sexAtBirth: "male",
    timezone: "America/Denver",
    primaryLanguage: "en",
  },
  robert: {
    firstName: "Robert",
    lastName: "Bell",
    dateOfBirth: "1949-05-04",
    sexAtBirth: "male",
    timezone: "America/New_York",
    primaryLanguage: "en",
  },
};
