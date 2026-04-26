// The shape attached to req by AuthGuard. Read via `@CurrentUser()` decorator.

import type { Request } from "express";

export type RequestUser = {
  userId: string;
  sessionId: string;
  email: string | null;
};

export type AuthedRequest = Request & { user?: RequestUser };
