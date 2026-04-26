import { Controller, Get, NotFoundException, UseGuards } from "@nestjs/common";

import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import type { RequestUser } from "../auth/auth.types";
import { UsersService } from "./users.service";

@UseGuards(AuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  async me(@CurrentUser() me: RequestUser) {
    const user = await this.users.findById(me.userId);
    if (!user) throw new NotFoundException();
    // Don't return passwordHash even though it's currently always null.
    const { passwordHash: _passwordHash, ...rest } = user;
    return rest;
  }
}
