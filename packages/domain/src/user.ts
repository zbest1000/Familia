import { z } from "zod";

import { Iso8601, Uuid } from "./common";

export const SexAtBirth = z.enum(["female", "male", "intersex", "unknown", "prefer_not_to_say"]);

export const User = z.object({
  id: Uuid,
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  firstName: z.string().min(1),
  lastName: z.string().min(1).optional(),
  dateOfBirth: z.string().nullable(), // ISO date
  sexAtBirth: SexAtBirth.nullable(),
  genderIdentity: z.string().nullable(),
  preferredUnits: z.enum(["imperial", "metric"]).default("imperial"),
  primaryLanguage: z.string().default("en"),
  timezone: z.string().nullable(),
  createdAt: Iso8601,
  updatedAt: Iso8601,
  deletedAt: Iso8601.nullable(),
});
export type User = z.infer<typeof User>;

export const NewUserInput = User.pick({
  email: true,
  phone: true,
  firstName: true,
  dateOfBirth: true,
  preferredUnits: true,
  primaryLanguage: true,
  timezone: true,
});
export type NewUserInput = z.infer<typeof NewUserInput>;
