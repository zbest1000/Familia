import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./common/prisma.module";
import { ConsentModule } from "./consent/consent.module";
import { FamilyModule } from "./family/family.module";
import { HealthModule } from "./health/health.module";
import { HealthRecordsModule } from "./health-records/health-records.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    FamilyModule,
    ConsentModule,
    HealthRecordsModule,
    AuditModule,
  ],
})
export class AppModule {}
