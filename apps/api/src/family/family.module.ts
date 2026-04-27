import { Module } from "@nestjs/common";

import { AuditModule } from "../audit/audit.module";
import { AuthModule } from "../auth/auth.module";
import { NotifierModule } from "../notifier/notifier.module";
import { AlertsController } from "./alerts.controller";
import { AlertsService } from "./alerts.service";
import { FamilyController } from "./family.controller";
import { FamilyService } from "./family.service";

@Module({
  imports: [AuthModule, AuditModule, NotifierModule],
  controllers: [FamilyController, AlertsController],
  providers: [FamilyService, AlertsService],
  exports: [FamilyService, AlertsService],
})
export class FamilyModule {}
