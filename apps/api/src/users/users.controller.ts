import { Controller, Get, NotFoundException, Req } from "@nestjs/common";
import type { Request } from "express";

import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // Sprint-0 stub. Auth middleware lands in Sprint 1.
  @Get("me")
  async me(@Req() req: Request) {
    const id = (req.headers["x-user-id"] as string | undefined) ?? null;
    if (!id) throw new NotFoundException("auth not wired yet");
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException();
    return user;
  }
}
