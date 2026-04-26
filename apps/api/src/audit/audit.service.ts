import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

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
        metadata: entry.metadata as Prisma.InputJsonValue,
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

  // db is captured by the sink; we don't keep a class-level reference.
  constructor(db: PrismaService) {
    this.writer = new AuditWriter(new PostgresAuditSink(db));
  }

  async write(entry: Omit<AuditEntry, "eventId" | "createdAt"> & { eventId?: string }) {
    await this.writer.write(entry);
  }
}
