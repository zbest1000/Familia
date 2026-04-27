// Wraps each request handler in an AsyncLocalStorage scope carrying the
// authenticated user id. The PrismaService middleware reads from this
// context to set the `app.current_user_id` GUC for RLS.
//
// Registered globally; AuthGuard sets `req.user` first, this interceptor
// runs after guards and before the handler. Unauthenticated requests
// run with userId=null (RLS denies, which is correct for any code that
// accidentally hits a per-user table without going through AuthGuard).

import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import type { Request } from "express";

import { runWithUserContext } from "./prisma.service";

@Injectable()
export class UserContextInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<Request & { user?: { userId?: string } }>();
    const userId = req.user?.userId ?? null;

    // Subscribe to next.handle() INSIDE the ALS scope so context
    // propagates across every await/then in the handler chain.
    return new Observable<unknown>((observer) => {
      runWithUserContext(userId, () => {
        const sub = next.handle().subscribe({
          next: (v) => observer.next(v),
          error: (e) => observer.error(e),
          complete: () => observer.complete(),
        });
        // Return a promise so ALS scope stays open for the duration of
        // the subscription. Resolve when the inner observable completes.
        return new Promise<void>((resolve) => {
          // sub.add fires both on completion and on unsubscribe — either way
          // we let ALS clean up.
          sub.add(() => resolve());
        });
      }).catch((err) => observer.error(err));
    });
  }
}
