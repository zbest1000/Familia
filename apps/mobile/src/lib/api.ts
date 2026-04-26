// Singleton FAMILIA SDK client for the mobile app.
// Token storage uses expo-secure-store (Sprint 1 wires it up).

import Constants from "expo-constants";

import { FamiliaClient } from "@familia/sdk";

const baseUrl =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)
    ?.apiBaseUrl ?? "http://localhost:3000";

let token: string | null = null;

export function setAuthToken(t: string | null): void {
  token = t;
}

export const api = new FamiliaClient({
  baseUrl,
  getAuthToken: () => token,
});
