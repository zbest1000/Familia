import { Module } from "@nestjs/common";

import { AuditModule } from "../audit/audit.module";
import { AuthModule } from "../auth/auth.module";
import { PacketController } from "./packet.controller";
import { PacketService } from "./packet.service";

@Module({
  imports: [AuthModule, AuditModule],
  controllers: [PacketController],
  providers: [PacketService],
  exports: [PacketService],
})
export class ExportsModule {}
