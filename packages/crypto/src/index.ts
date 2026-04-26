// Crypto helpers. Centralizes algorithm choices.
// - Passwords: argon2id (memory-hard, side-channel-resistant).
// - Hashing for tamper-evidence: SHA-256.
// - Random tokens: cryptographically secure.

import { createHash, randomBytes } from "node:crypto";

import argon2 from "argon2";

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19_456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(plaintext: string): Promise<string> {
  return argon2.hash(plaintext, ARGON2_OPTIONS);
}

export async function verifyPassword(hash: string, plaintext: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plaintext);
  } catch {
    return false;
  }
}

export function sha256(input: string | Buffer): string {
  return createHash("sha256").update(input).digest("hex");
}

/**
 * Cryptographically random URL-safe token.
 * Used for invite tokens, recovery codes, etc. The CALLER is responsible for
 * signing/binding to user context as needed.
 */
export function generateToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("base64url");
}
