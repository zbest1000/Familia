// Singleton FAMILIA API client for the web app.
// Token storage is intentionally minimal at Sprint-0 — wired to a proper
// session store + refresh rotation in Sprint 1.

import { FamiliaClient } from "@familia/sdk";

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

let token: string | null = null;

export function setAuthToken(t: string | null): void {
  token = t;
}

export const api = new FamiliaClient({
  baseUrl,
  getAuthToken: () => token,
});
