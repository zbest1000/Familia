// Singleton FAMILIA SDK client for the mobile app, with secure session
// storage backed by expo-secure-store (hardware-backed where available).

import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

import { FamiliaClient } from "@familia/sdk";

const baseUrl =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
  "http://localhost:3000";

const ACCESS_KEY = "familia.accessToken";
const REFRESH_KEY = "familia.refreshToken";
const USER_KEY = "familia.userId";

let cachedAccess: string | null = null;
let cachedRefresh: string | null = null;
let cachedUserId: string | null = null;

let listeners: Array<(token: string | null) => void> = [];

export function onAuthChange(fn: (token: string | null) => void): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

function notify(token: string | null): void {
  for (const l of listeners) l(token);
}

export async function bootstrapSession(): Promise<{ accessToken: string | null; userId: string | null }> {
  cachedAccess = await SecureStore.getItemAsync(ACCESS_KEY);
  cachedRefresh = await SecureStore.getItemAsync(REFRESH_KEY);
  cachedUserId = await SecureStore.getItemAsync(USER_KEY);
  return { accessToken: cachedAccess, userId: cachedUserId };
}

export async function setSession(args: {
  userId?: string;
  accessToken: string;
  refreshToken: string;
}): Promise<void> {
  cachedAccess = args.accessToken;
  cachedRefresh = args.refreshToken;
  if (args.userId) cachedUserId = args.userId;
  await SecureStore.setItemAsync(ACCESS_KEY, args.accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, args.refreshToken);
  if (args.userId) await SecureStore.setItemAsync(USER_KEY, args.userId);
  notify(args.accessToken);
}

export async function clearSession(): Promise<void> {
  cachedAccess = null;
  cachedRefresh = null;
  cachedUserId = null;
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
  notify(null);
}

export function getAccessToken(): string | null {
  return cachedAccess;
}

export function getRefreshToken(): string | null {
  return cachedRefresh;
}

export function getUserId(): string | null {
  return cachedUserId;
}

export const api = new FamiliaClient({
  baseUrl,
  getAuthToken: () => cachedAccess,
});
