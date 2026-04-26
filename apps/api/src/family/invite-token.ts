import { generateToken, sha256 } from "@familia/crypto";

// Invite tokens are opaque, generated server-side, hashed in DB.
// Sprint-1 keeps it simple; Sprint 3 can wrap in HMAC signing if we want
// signed tokens that can be validated without a DB lookup.

export const INVITE_TOKEN_BYTES = 32;
export const INVITE_TTL_SECONDS = 600; // 10 minutes — see docs/13 §1

export type IssuedInviteToken = {
  /** The plaintext token. Send to the recipient via secure channel. */
  token: string;
  /** sha256 of the token. Stored in the DB. */
  hash: string;
  /** When the token expires. */
  expiresAt: Date;
};

export function issueInviteToken(): IssuedInviteToken {
  const token = generateToken(INVITE_TOKEN_BYTES);
  return {
    token,
    hash: sha256(token),
    expiresAt: new Date(Date.now() + INVITE_TTL_SECONDS * 1000),
  };
}

export function hashInviteToken(token: string): string {
  return sha256(token);
}
