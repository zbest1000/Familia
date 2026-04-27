import { Module } from "@nestjs/common";

import { AuditModule } from "../audit/audit.module";
import { AuthModule } from "../auth/auth.module";
import { WearablesController } from "./wearables.controller";
import { WearablesService } from "./wearables.service";

@Module({
  imports: [AuthModule, AuditModule],
  controllers: [WearablesController],
  providers: [WearablesService],
  exports: [WearablesService],
})
export class WearablesModule {}
