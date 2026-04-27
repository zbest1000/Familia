// Typed FAMILIA API client. Used by apps/web and apps/mobile.
// Built on ky for HTTP. Hand-rolled until the OpenAPI generation pipeline lands.

import ky, { type KyInstance } from "ky";

import type { CheckIn, Condition, Medication, User } from "@familia/domain";

// ─── Auth payloads ──────────────────────────────────────────────────────

export type StartChallengeResponse = { challengeId: string };

export type SessionTokens = {
  userId: string;
  accessToken: string;
  refreshToken: string;
  accessTtlSeconds: number;
};

export type SignupVerifyInput = {
  challengeId: string;
  code: string;
  firstName: string;
  lastName?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  timezone?: string;
};

export type SigninVerifyInput = {
  challengeId: string;
  code: string;
};

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

  constructor(opts: FamiliaClientOptions) {
    // Build ky options without setting `fetch` when undefined — exactOptionalPropertyTypes
    // disallows passing undefined explicitly for optional fields.
    const kyOptions: Parameters<typeof ky.create>[0] = {
      prefixUrl: opts.baseUrl.replace(/\/$/, ""),
      timeout: opts.timeoutMs ?? 10_000,
      retry: { limit: opts.retry ?? 2 },
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
    };
    if (opts.fetch) kyOptions.fetch = opts.fetch;
    this.http = ky.create(kyOptions);
  }

  // ---- Health ----
  async health(): Promise<{ status: "ok" | "degraded"; checks: Record<string, string> }> {
    return this.http.get("health").json();
  }

  // ---- Auth ----
  async startSignup(email: string): Promise<StartChallengeResponse> {
    return this.http.post("auth/signup/start", { json: { email } }).json();
  }

  async verifySignup(input: SignupVerifyInput): Promise<SessionTokens> {
    return this.http.post("auth/signup/verify", { json: input }).json();
  }

  async startSignin(email: string): Promise<StartChallengeResponse> {
    return this.http.post("auth/signin/start", { json: { email } }).json();
  }

  async verifySignin(input: SigninVerifyInput): Promise<SessionTokens> {
    return this.http.post("auth/signin/verify", { json: input }).json();
  }

  async refresh(refreshToken: string): Promise<Omit<SessionTokens, "userId">> {
    return this.http.post("auth/refresh", { json: { refreshToken } }).json();
  }

  async signout(): Promise<void> {
    await this.http.delete("auth/signout");
  }

  // ---- Users ----
  async me(): Promise<User> {
    return this.http.get("users/me").json();
  }

  // ---- Medications ----
  async listMedications(userId?: string): Promise<Medication[]> {
    const path = userId ? `health/medications?userId=${encodeURIComponent(userId)}` : "health/medications";
    return this.http.get(path).json();
  }

  async addMedication(input: Partial<Medication>): Promise<Medication> {
    return this.http.post("health/medications", { json: input }).json();
  }

  async updateMedication(id: string, input: Partial<Medication>): Promise<Medication> {
    return this.http.patch(`health/medications/${id}`, { json: input }).json();
  }

  async deleteMedication(id: string): Promise<{ ok: true }> {
    return this.http.delete(`health/medications/${id}`).json();
  }

  // ---- Conditions ----
  async listConditions(userId?: string): Promise<Condition[]> {
    const path = userId ? `health/conditions?userId=${encodeURIComponent(userId)}` : "health/conditions";
    return this.http.get(path).json();
  }

  async addCondition(input: Partial<Condition>): Promise<Condition> {
    return this.http.post("health/conditions", { json: input }).json();
  }

  async updateCondition(id: string, input: Partial<Condition>): Promise<Condition> {
    return this.http.patch(`health/conditions/${id}`, { json: input }).json();
  }

  async deleteCondition(id: string): Promise<{ ok: true }> {
    return this.http.delete(`health/conditions/${id}`).json();
  }

  // ---- Check-ins ----
  async submitCheckIn(input: Partial<CheckIn>): Promise<CheckIn> {
    return this.http.post("health/check-ins", { json: input }).json();
  }

  // ---- Family invites ----
  async createInvite(input: {
    proposedRelationship: string;
    proposedBiologicalLink?: boolean;
    proposedPreset?: string;
    proposedReciprocalPreset?: string;
  }): Promise<{
    id: string;
    state: string;
    expiresAt: string;
    proposedRelationship: string;
    proposedPreset: string;
    token: string;
  }> {
    return this.http.post("family/invites", { json: input }).json();
  }

  async listInvites(): Promise<unknown[]> {
    return this.http.get("family/invites").json();
  }

  async revokeInvite(id: string): Promise<{ state: string }> {
    return this.http.delete(`family/invites/${id}`).json();
  }

  async previewInvite(token: string): Promise<unknown> {
    return this.http.get(`family/invites/by-token/${token}`).json();
  }

  async acceptInvite(
    token: string,
    input?: { acceptedRelationship?: string },
  ): Promise<{ state: string; relationship: string }> {
    return this.http.post(`family/invites/by-token/${token}/accept`, { json: input ?? {} }).json();
  }

  async declineInvite(token: string): Promise<{ state: string }> {
    return this.http.post(`family/invites/by-token/${token}/decline`, { json: {} }).json();
  }

  // ---- Family relationships + grants ----
  async listRelationships(): Promise<
    Array<{
      id: string;
      type: string;
      biologicalLink: boolean;
      visibility: string;
      doNotAlert: boolean;
      deceased: boolean;
      createdAt: string;
      relatedUser: { id: string; firstName: string; lastName: string | null; email: string | null } | null;
    }>
  > {
    return this.http.get("family/relationships").json();
  }

  async removeRelationship(id: string): Promise<{ ok: true; revokedGrants: number }> {
    return this.http.delete(`family/relationships/${id}`).json();
  }

  async listGrants(): Promise<unknown[]> {
    return this.http.get("family/grants").json();
  }

  async revokeGrant(id: string): Promise<{ ok: true }> {
    return this.http.delete(`family/grants/${id}`).json();
  }

  // ---- Alerts ----
  async sendAlert(input: {
    type: "hereditary_risk" | "general_health_update" | "wellness_trend" | "emergency";
    topic: string;
    recipientUserIds: string[];
    disclosureMode?: "anonymous" | "relationship_only" | "partial" | "identified";
    personalNote?: string;
  }): Promise<{
    id: string;
    state: string;
    sentAt: string | null;
    contentHash: string;
    recipients: Array<{
      recipientUserId: string;
      relationshipClass: string;
      variantKey: string;
      text: string;
    }>;
    skipped: Array<{ rid: string; error: string }>;
  }> {
    return this.http.post("family/alerts", { json: input }).json();
  }

  async listSentAlerts(): Promise<unknown[]> {
    return this.http.get("family/alerts").json();
  }

  async listAlertInbox(): Promise<unknown[]> {
    return this.http.get("family/alerts/inbox").json();
  }

  async acknowledgeAlert(id: string): Promise<{ ok: true }> {
    return this.http.post(`family/alerts/${id}/ack`, { json: {} }).json();
  }

  // ---- Audit ----
  async listAudit(opts?: {
    limit?: number;
    cursor?: string;
    eventType?: string;
    scope?: "mine" | "by_me";
  }): Promise<{
    items: Array<{
      eventId: string;
      eventType: string;
      subjectId: string;
      actorUserId: string | null;
      targetUserId: string;
      fromState: string | null;
      toState: string | null;
      metadata: Record<string, unknown>;
      policyVersion: string;
      requestSource: string;
      clientIp: string | null;
      createdAt: string;
    }>;
    nextCursor: string | null;
  }> {
    const qs = new URLSearchParams();
    if (opts?.limit) qs.set("limit", String(opts.limit));
    if (opts?.cursor) qs.set("cursor", opts.cursor);
    if (opts?.eventType) qs.set("eventType", opts.eventType);
    if (opts?.scope) qs.set("scope", opts.scope);
    const path = qs.toString() ? `audit?${qs}` : "audit";
    return this.http.get(path).json();
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
