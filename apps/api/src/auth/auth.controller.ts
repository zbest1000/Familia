import { Body, Controller, Post } from "@nestjs/common";
import { z } from "zod";

import { AuthService } from "./auth.service";

const StartSignUpDto = z.object({
  email: z.string().email(),
});

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("signup/start")
  async startSignUp(@Body() body: unknown): Promise<{ challengeId: string }> {
    const parsed = StartSignUpDto.parse(body);
    return this.auth.startSignUp(parsed.email);
  }
}
