import { Injectable } from "@nestjs/common";

import { AuditWriter, type AuditSink } from "@familia/audit";
import type { AuditEntry } from "@familia/domain";

import { PrismaService } from "../common/prisma.service";

class PostgresAuditSink implements AuditSink {
  constructor(private readonly db: PrismaService) {}

  async writeSync(entry: AuditEntry): Promise<void> {
    await this.db.auditEntry.create({
      data: {
        eventId: entry.eventId,
        eventType: entry.eventType,
        subjectId: entry.subjectId,
        actorUserId: entry.actorUserId,
        targetUserId: entry.targetUserId,
        fromState: entry.fromState,
        toState: entry.toState,
        metadata: entry.metadata as object,
        policyVersion: entry.policyVersion,
        requestSource: entry.requestSource,
        clientIp: entry.clientIp,
        createdAt: new Date(entry.createdAt),
      },
    });
  }
}

@Injectable()
export class AuditService {
  private readonly writer: AuditWriter;

  constructor(private readonly db: PrismaService) {
    this.writer = new AuditWriter(new PostgresAuditSink(db));
  }

  async write(entry: Omit<AuditEntry, "eventId" | "createdAt"> & { eventId?: string }) {
    await this.writer.write(entry);
  }
}
