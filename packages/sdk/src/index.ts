// Typed FAMILIA API client. Used by apps/web and apps/mobile.
// Built on ky for HTTP. Hand-rolled until the OpenAPI generation pipeline lands.

import ky, { type KyInstance } from "ky";

import type { CheckIn, Medication, User } from "@familia/domain";

export type FamiliaClientOptions = {
  baseUrl: string;
  /** Provider for the current bearer token (callable so we read latest). */
  getAuthToken?: () => string | null;
  /** For tests / instrumentation. */
  fetch?: typeof fetch;
  /** Idempotency key generator for write endpoints. */
  newIdempotencyKey?: () => string;
  /** Per-request timeout in ms. */
  timeoutMs?: number;
  /** How many times to retry transient failures. */
  retry?: number;
};

export class FamiliaClient {
  private readonly http: KyInstance;
  private readonly opts: FamiliaClientOptions;

  constructor(opts: FamiliaClientOptions) {
    this.opts = opts;
    this.http = ky.create({
      prefixUrl: opts.baseUrl.replace(/\/$/, ""),
      timeout: opts.timeoutMs ?? 10_000,
      retry: { limit: opts.retry ?? 2 },
      fetch: opts.fetch,
      hooks: {
        beforeRequest: [
          (request) => {
            const token = opts.getAuthToken?.();
            if (token) request.headers.set("Authorization", `Bearer ${token}`);
            // Idempotency-Key on writes — see docs/13_API_STATE_MACHINES.md §6.
            const m = request.method.toUpperCase();
            if (m !== "GET" && m !== "HEAD") {
              const k = opts.newIdempotencyKey?.() ?? randomUuid();
              if (!request.headers.get("Idempotency-Key"))
                request.headers.set("Idempotency-Key", k);
            }
          },
        ],
      },
    });
  }

  // ---- Health ----
  async health(): Promise<{ status: "ok" | "degraded"; checks: Record<string, string> }> {
    return this.http.get("health").json();
  }

  // ---- Users ----
  async me(): Promise<User> {
    return this.http.get("users/me").json();
  }

  // ---- Medications ----
  async listMedications(): Promise<Medication[]> {
    return this.http.get("health/medications").json();
  }

  async addMedication(input: Partial<Medication>): Promise<Medication> {
    return this.http.post("health/medications", { json: input }).json();
  }

  // ---- Check-ins ----
  async submitCheckIn(input: Partial<CheckIn>): Promise<CheckIn> {
    return this.http.post("health/check-ins", { json: input }).json();
  }
}

function randomUuid(): string {
  // SDK runs in browser + React Native; both expose crypto.randomUUID under modern targets.
  // RN < 0.74 may need an explicit polyfill (e.g., react-native-get-random-values + uuid).
  const c =
    typeof globalThis !== "undefined"
      ? (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
      : undefined;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  // Fallback — unique enough for idempotency keys, not RFC 4122.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
