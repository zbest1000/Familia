// Singleton FAMILIA API client for the web app.
//
// Token storage: sessionStorage in the browser (per-tab, cleared on tab close).
// This is intentional — refresh tokens stored in sessionStorage have a smaller
// blast radius than localStorage. A future iteration moves to httpOnly cookies
// once we add a same-origin BFF or set up cross-origin cookie support.

import { FamiliaClient } from "@familia/sdk";

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

const ACCESS_KEY = "familia.accessToken";
const REFRESH_KEY = "familia.refreshToken";
const USER_KEY = "familia.userId";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return window.sessionStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return window.sessionStorage.getItem(REFRESH_KEY);
}

export function getUserId(): string | null {
  if (!isBrowser()) return null;
  return window.sessionStorage.getItem(USER_KEY);
}

export function setSession(args: {
  userId?: string;
  accessToken: string;
  refreshToken: string;
}): void {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(ACCESS_KEY, args.accessToken);
  window.sessionStorage.setItem(REFRESH_KEY, args.refreshToken);
  if (args.userId) window.sessionStorage.setItem(USER_KEY, args.userId);
}

export function clearSession(): void {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(ACCESS_KEY);
  window.sessionStorage.removeItem(REFRESH_KEY);
  window.sessionStorage.removeItem(USER_KEY);
}

export const api = new FamiliaClient({
  baseUrl,
  getAuthToken: () => getAccessToken(),
});
