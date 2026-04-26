import { Injectable } from "@nestjs/common";

import { PrismaService } from "../common/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly db: PrismaService) {}

  async findById(id: string) {
    return this.db.user.findUnique({ where: { id } });
  }

  async count(): Promise<number> {
    return this.db.user.count();
  }
}
