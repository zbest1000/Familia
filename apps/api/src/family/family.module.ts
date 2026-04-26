import { Module } from "@nestjs/common";

import { AuditModule } from "../audit/audit.module";
import { AuthModule } from "../auth/auth.module";
import { FamilyController } from "./family.controller";
import { FamilyService } from "./family.service";

@Module({
  imports: [AuthModule, AuditModule],
  controllers: [FamilyController],
  providers: [FamilyService],
  exports: [FamilyService],
})
export class FamilyModule {}
