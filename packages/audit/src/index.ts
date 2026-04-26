// Audit log writer interface.
// The actual sink (Postgres append-only table + async drainage to long-term store)
// lives in apps/api. This package defines the contract so other packages can
// call the audit API without depending on the API.

import type { AuditEntry, AuditEventType, Uuid } from "@familia/domain";

export type AuditSink = {
  /**
   * Synchronously write an audit entry. Must succeed before the calling business
   * write is considered durable. If this throws, the calling write is rolled back.
   */
  writeSync(entry: AuditEntry): Promise<void>;
};

export type AuditWriteInput = Omit<AuditEntry, "eventId" | "createdAt"> & {
  eventId?: Uuid;
};

export class AuditWriter {
  constructor(
    private readonly sink: AuditSink,
    private readonly now: () => Date = () => new Date(),
    private readonly newId: () => Uuid = () => crypto.randomUUID(),
  ) {}

  async write(input: AuditWriteInput): Promise<void> {
    await this.sink.writeSync({
      eventId: input.eventId ?? this.newId(),
      eventType: input.eventType,
      subjectId: input.subjectId,
      actorUserId: input.actorUserId,
      targetUserId: input.targetUserId,
      fromState: input.fromState,
      toState: input.toState,
      metadata: input.metadata,
      policyVersion: input.policyVersion,
      requestSource: input.requestSource,
      clientIp: input.clientIp,
      createdAt: this.now().toISOString(),
    });
  }
}

export type { AuditEntry, AuditEventType };
