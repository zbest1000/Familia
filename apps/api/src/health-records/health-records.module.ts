import { Module } from "@nestjs/common";

import { AuditModule } from "../audit/audit.module";
import { AuthModule } from "../auth/auth.module";
import { ConsentModule } from "../consent/consent.module";
import { CheckInsController } from "./check-ins.controller";
import { CheckInsService } from "./check-ins.service";
import { ConditionsController } from "./conditions.controller";
import { ConditionsService } from "./conditions.service";
import { MedicationsController } from "./medications.controller";
import { MedicationsService } from "./medications.service";

@Module({
  imports: [AuthModule, AuditModule, ConsentModule],
  controllers: [MedicationsController, ConditionsController, CheckInsController],
  providers: [MedicationsService, ConditionsService, CheckInsService],
  exports: [MedicationsService, ConditionsService, CheckInsService],
})
export class HealthRecordsModule {}
