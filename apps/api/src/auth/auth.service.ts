import { Injectable } from "@nestjs/common";

import { hashPassword, sha256, verifyPassword } from "@familia/crypto";

@Injectable()
export class AuthService {
  // Sprint-0 stub. Sprint 1 wires this up to PrismaService and proper JWT issuance.
  async startSignUp(email: string): Promise<{ challengeId: string }> {
    // TODO: persist a challenge, send OTP via SES.
    return { challengeId: sha256(email + Date.now().toString()) };
  }

  async hashUserPassword(plaintext: string): Promise<string> {
    return hashPassword(plaintext);
  }

  async verifyUserPassword(hash: string, plaintext: string): Promise<boolean> {
    return verifyPassword(hash, plaintext);
  }
}
