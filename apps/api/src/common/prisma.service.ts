import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { AsyncLocalStorage } from "node:async_hooks";

// AsyncLocalStorage carries the per-request user id through async call
// chains so the Prisma client can stamp it onto every query before it
// executes — driving the RLS policies in the
// 20260427013000_rls_per_user migration.
//
// AuthGuard sets the user id on each authenticated request; controllers
// that don't yet pass through the guard fall back to NULL (which the RLS
// policies treat as "no rows visible" → safe).
const userContext = new AsyncLocalStorage<{ userId: string | null }>();

export function runWithUserContext<T>(userId: string | null, fn: () => Promise<T>): Promise<T> {
  return userContext.run({ userId }, fn);
}

export function getCurrentUserId(): string | null {
  return userContext.getStore()?.userId ?? null;
}

// Recursion guard for the GUC-setting middleware: $executeRawUnsafe
// itself is a query, which would re-enter the middleware → infinite
// recursion → stack/heap overflow. ALS-based flag pauses the middleware
// while it's already running on this async chain.
const guardSettingGuc = new AsyncLocalStorage<true>();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
    this.$use(async (params, next) => {
      // Skip when we're already setting the GUC on this async chain
      if (guardSettingGuc.getStore()) return next(params);

      const userId = getCurrentUserId();
      if (!userId) return next(params);

      // set_config(name, value, is_local) — is_local=true scopes the
      // setting to the current transaction. Prisma wraps each query in
      // an implicit transaction unless one is already open. With pgBouncer
      // in transaction mode the GUC scope still matches the query.
      try {
        await guardSettingGuc.run(true, async () => {
          await this.$executeRawUnsafe(
            `SELECT set_config('app.current_user_id', $1, true)`,
            userId,
          );
        });
      } catch {
        // RLS not yet applied (dev DB without the migration) — proceed
        // without the GUC. Production-shape: keep the policy migration
        // applied, and missing GUC would correctly deny.
      }
      return next(params);
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
