import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./common/prisma.module";
import { ConsentModule } from "./consent/consent.module";
import { EmailModule } from "./email/email.module";
import { ExportsModule } from "./exports/exports.module";
import { FamilyModule } from "./family/family.module";
import { HealthModule } from "./health/health.module";
import { HealthRecordsModule } from "./health-records/health-records.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    PrismaModule,
    EmailModule,
    HealthModule,
    AuthModule,
    UsersModule,
    FamilyModule,
    ConsentModule,
    HealthRecordsModule,
    AuditModule,
    ExportsModule,
  ],
})
export class AppModule {}
