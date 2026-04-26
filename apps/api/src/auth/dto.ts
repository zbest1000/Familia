// Request DTOs validated with zod.

import { z } from "zod";

export const StartChallengeDto = z.object({
  email: z.string().email(),
});
export type StartChallengeDto = z.infer<typeof StartChallengeDto>;

export const VerifySignupDto = z.object({
  challengeId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100).optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  timezone: z.string().optional(),
});
export type VerifySignupDto = z.infer<typeof VerifySignupDto>;

export const VerifySigninDto = z.object({
  challengeId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/),
});
export type VerifySigninDto = z.infer<typeof VerifySigninDto>;

export const RefreshDto = z.object({
  refreshToken: z.string().min(20),
});
export type RefreshDto = z.infer<typeof RefreshDto>;
