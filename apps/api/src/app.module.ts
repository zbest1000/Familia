import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";

import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./common/prisma.module";
import { UserScopedThrottlerGuard } from "./common/throttler.guard";
import { UserContextInterceptor } from "./common/user-context.interceptor";
import { ConsentModule } from "./consent/consent.module";
import { EmailModule } from "./email/email.module";
import { ExportsModule } from "./exports/exports.module";
import { FamilyModule } from "./family/family.module";
import { HealthModule } from "./health/health.module";
import { HealthRecordsModule } from "./health-records/health-records.module";
import { StorageModule } from "./storage/storage.module";
import { UsersModule } from "./users/users.module";
import { VaultModule } from "./vault/vault.module";
import { WearablesModule } from "./wearables/wearables.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    // Per-user / per-IP rate limits. Two tiers:
    //   - "short": burst protection (100 req per 60s)
    //   - "auth":  tight cap on the auth endpoints (10 req per 60s) —
    //             override applied at the controller level
    // Identification: by JWT user id when present, IP otherwise.
    // The Ingress (deploy/k8s/60-ingress.yaml) also enforces a per-IP
    // limit at the edge; this is defense in depth + per-user fairness.
    ThrottlerModule.forRoot([
      { name: "short", ttl: 60_000, limit: 100 },
      { name: "auth", ttl: 60_000, limit: 10 },
    ]),
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
    StorageModule,
    VaultModule,
    WearablesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: UserScopedThrottlerGuard,
    },
    {
      // Wraps every request handler in an ALS scope carrying the user id
      // → the PrismaService middleware sets `app.current_user_id` GUC
      // → RLS policies in 20260427013000_rls_per_user enforce per-user
      // visibility at the database layer.
      provide: APP_INTERCEPTOR,
      useClass: UserContextInterceptor,
    },
  ],
})
export class AppModule {}
