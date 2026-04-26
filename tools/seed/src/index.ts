// Seed the local dev database with the 6 primary personas from
// docs/01_PERSONAS.md, plus a handful of family relationships and a few
// medications/conditions, so the app boots into a useful state.
//
// SAFE BY DESIGN: refuses to run unless DATABASE_URL contains 'familia_dev'
// or 'familia_test'. Never run against production.

import { PrismaClient } from "@prisma/client";

import { personaUsers } from "@familia/testing";

const DB_URL = process.env.DATABASE_URL ?? "";
if (!/familia_(dev|test)/.test(DB_URL)) {
  console.error(
    `Refusing to seed: DATABASE_URL must point at familia_dev or familia_test.\nGot: ${DB_URL || "<unset>"}`,
  );
  process.exit(2);
}

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding personas…");

  // Create users + a self profile each.
  const created: Record<string, { userId: string; profileId: string }> = {};

  for (const [key, base] of Object.entries(personaUsers)) {
    const existing = await prisma.user.findFirst({
      where: { firstName: base.firstName, lastName: base.lastName },
    });

    const user =
      existing ??
      (await prisma.user.create({
        data: {
          email: `${(base.firstName ?? key).toLowerCase()}@familia-dev.example.com`,
          firstName: base.firstName ?? "User",
          lastName: base.lastName ?? null,
          dateOfBirth: base.dateOfBirth ? new Date(base.dateOfBirth) : null,
          sexAtBirth: base.sexAtBirth ?? null,
          genderIdentity: base.genderIdentity ?? null,
          timezone: base.timezone ?? "UTC",
          primaryLanguage: base.primaryLanguage ?? "en",
        },
      }));

    let profile = await prisma.profile.findFirst({
      where: { ownerUserId: user.id, kind: "self" },
    });
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          kind: "self",
          ownerUserId: user.id,
          displayName: `${base.firstName} ${base.lastName ?? ""}`.trim(),
          dateOfBirth: base.dateOfBirth ? new Date(base.dateOfBirth) : null,
        },
      });
    }
    created[key] = { userId: user.id, profileId: profile.id };
    console.log(`  ✓ ${key} → user ${user.id}, profile ${profile.id}`);
  }

  // Maya's medication (Hashimoto's, levothyroxine) — concrete persona detail.
  const maya = created.maya;
  if (maya) {
    const exists = await prisma.medication.findFirst({
      where: { userId: maya.userId, name: "Levothyroxine" },
    });
    if (!exists) {
      await prisma.medication.create({
        data: {
          userId: maya.userId,
          profileId: maya.profileId,
          name: "Levothyroxine",
          genericName: "levothyroxine",
          doseValue: 50,
          doseUnit: "mcg",
          doseText: "50 mcg",
          route: "oral",
          frequencyText: "once daily",
          status: "active",
          reason: "Hashimoto's thyroiditis",
          source: "manual",
          sensitivity: "standard",
        },
      });
      console.log("  ✓ Maya: Levothyroxine 50mcg added");
    }
  }

  // David's mom Adaeze — sample managed profile.
  const david = created.david;
  if (david) {
    const adaezeProfile = await prisma.profile.findFirst({
      where: { displayName: "Adaeze Okafor", kind: "managed_adult" },
    });
    if (!adaezeProfile) {
      await prisma.profile.create({
        data: {
          kind: "managed_adult",
          displayName: "Adaeze Okafor",
          dateOfBirth: new Date("1948-02-19"),
          coManagers: {
            create: {
              userId: david.userId,
              role: "caregiver_co_manager",
              status: "active",
            },
          },
        },
      });
      console.log("  ✓ Adaeze (David's mom) created with David as co-manager");
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
