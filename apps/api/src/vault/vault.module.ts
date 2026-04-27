import { Module } from "@nestjs/common";

import { AuditModule } from "../audit/audit.module";
import { AuthModule } from "../auth/auth.module";
import { NotifierModule } from "../notifier/notifier.module";
import { VaultController } from "./vault.controller";
import { VaultService } from "./vault.service";

@Module({
  imports: [AuthModule, AuditModule, NotifierModule],
  controllers: [VaultController],
  providers: [VaultService],
  exports: [VaultService],
})
export class VaultModule {}
