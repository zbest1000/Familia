import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
} from "@nestjs/common";

import { PrismaService } from "../common/prisma.service";
import { JwtService } from "./jwt.service";
import type { AuthedRequest, RequestUser } from "./auth.types";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly db: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const auth = req.headers.authorization ?? "";
    const m = /^Bearer\s+(.+)$/i.exec(auth);
    if (!m) throw new UnauthorizedException("missing bearer token");
    const token = m[1] ?? "";
    const payload = this.jwt.verifyAccessToken(token);
    if (!payload) throw new UnauthorizedException("invalid token");

    // Confirm session is still active. A revoked session must reject the
    // access token even if its JWT exp is still in the future.
    const session = await this.db.session.findUnique({ where: { id: payload.sid } });
    if (!session || session.revokedAt || session.userId !== payload.sub) {
      throw new UnauthorizedException("session revoked");
    }

    const reqUser: RequestUser = {
      userId: payload.sub,
      sessionId: payload.sid,
      email: payload.email,
    };
    req.user = reqUser;

    // Best-effort touch of last-seen — don't await (fire and forget).
    void this.db.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });

    return true;
  }
}

// Param decorator: `@CurrentUser() user: RequestUser`
export const CurrentUser = createParamDecorator((_data, ctx: ExecutionContext): RequestUser => {
  const req = ctx.switchToHttp().getRequest<AuthedRequest>();
  if (!req.user) throw new UnauthorizedException("no user attached");
  return req.user;
});
