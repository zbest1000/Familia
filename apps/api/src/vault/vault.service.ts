import { createHash, randomUUID } from "node:crypto";

import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { Queue } from "bullmq";

import { POLICY_VERSION } from "@familia/consent-engine";

import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../common/prisma.service";
import { OCR_QUEUE_TOKEN } from "../notifier/notifier.tokens";
import { StorageService } from "../storage/storage.service";

type ReqMeta = { actorUserId: string; clientIp?: string | null };

export const ALLOWED_KINDS = [
  "lab_report",
  "imaging_report",
  "discharge_summary",
  "prescription",
  "insurance",
  "dental",
  "vision",
  "mental_health",
  "generic_medical",
  "non_medical",
] as const;

@Injectable()
export class VaultService {
  private readonly log = new Logger("VaultService");
  constructor(
    private readonly db: PrismaService,
    private readonly audit: AuditService,
    private readonly storage: StorageService,
    @Inject(OCR_QUEUE_TOKEN) private readonly ocrQueue: Queue,
  ) {}

  async upload(
    userId: string,
    file: { buffer: Buffer; mimetype: string; originalname: string; size: number },
    args: { kind: (typeof ALLOWED_KINDS)[number]; title?: string },
    meta: ReqMeta,
  ) {
    const profile = await this.db.profile.findFirst({
      where: { ownerUserId: userId, kind: "self" },
    });
    if (!profile) throw new NotFoundException("self-profile missing");

    const documentId = randomUUID();
    const storageKey = `users/${userId}/documents/${documentId}`;
    const contentHash = createHash("sha256").update(file.buffer).digest("hex");

    await this.storage.put(storageKey, file.buffer, file.mimetype);

    const doc = await this.db.vaultDocument.create({
      data: {
        id: documentId,
        userId,
        profileId: profile.id,
        kind: args.kind,
        title: args.title?.trim() || file.originalname,
        storageKey,
        contentType: file.mimetype,
        sizeBytes: file.size,
        contentHash,
        source: "manual",
        sensitivity: args.kind === "mental_health" ? "highly_sensitive" : "standard",
        extractionState: "ocr_pending",
      },
    });

    await this.audit.write({
      eventType: "document.uploaded",
      subjectId: doc.id,
      actorUserId: userId,
      targetUserId: userId,
      fromState: null,
      toState: "uploaded",
      metadata: { kind: args.kind, sizeBytes: file.size, contentType: file.mimetype },
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });

    // Best-effort enqueue. Failure to enqueue does not block the upload —
    // the document stays in 'ocr_pending' until the OCR worker drains it.
    // Resilience contract: docs/16 §6.
    try {
      const job = await this.ocrQueue.add(
        "extract",
        { documentId: doc.id },
        { jobId: `ocr-${doc.id}` },
      );
      this.log.log(`enqueued OCR job ${job.id} for document ${doc.id}`);
    } catch (err) {
      this.log.warn(
        `failed to enqueue OCR job for document ${doc.id}: ${(err as Error).message}`,
      );
    }

    return {
      id: doc.id,
      kind: doc.kind,
      title: doc.title,
      storageKey: doc.storageKey,
      contentType: doc.contentType,
      sizeBytes: doc.sizeBytes,
      extractionState: doc.extractionState,
      createdAt: doc.createdAt,
    };
  }

  async list(userId: string) {
    const rows = await this.db.vaultDocument.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        kind: true,
        title: true,
        contentType: true,
        sizeBytes: true,
        extractionState: true,
        createdAt: true,
        sensitivity: true,
      },
    });
    return rows;
  }

  async getDetail(userId: string, id: string) {
    const doc = await this.db.vaultDocument.findUnique({
      where: { id },
      include: { stagedExtraction: true },
    });
    if (!doc) throw new NotFoundException();
    if (doc.userId !== userId) throw new ForbiddenException();
    return {
      id: doc.id,
      kind: doc.kind,
      title: doc.title,
      contentType: doc.contentType,
      sizeBytes: doc.sizeBytes,
      extractionState: doc.extractionState,
      sensitivity: doc.sensitivity,
      createdAt: doc.createdAt,
      extraction: doc.stagedExtraction
        ? {
            kind: doc.stagedExtraction.kind,
            modelVersion: doc.stagedExtraction.modelVersion,
            overallConfidence: doc.stagedExtraction.overallConfidence,
            data: doc.stagedExtraction.data,
            createdAt: doc.stagedExtraction.createdAt,
          }
        : null,
    };
  }

  async getSignedDownload(userId: string, id: string, meta: ReqMeta) {
    const doc = await this.db.vaultDocument.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException();
    if (doc.userId !== userId) throw new ForbiddenException();

    const signed = await this.storage.signedDownloadUrl(doc.storageKey, {
      ttlSeconds: 300,
      downloadFilename: doc.title || `document-${doc.id}`,
    });

    await this.audit.write({
      eventType: "document.downloaded",
      subjectId: doc.id,
      actorUserId: userId,
      targetUserId: userId,
      fromState: null,
      toState: null,
      metadata: { kind: doc.kind, backend: signed.backend, ttlSeconds: 300 },
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });

    if (signed.backend === "s3") {
      return {
        backend: "s3" as const,
        url: signed.url,
        expiresAt: signed.expiresAt,
        contentType: doc.contentType,
        sizeBytes: doc.sizeBytes,
      };
    }
    // Local backend has no presigning — caller must stream via /raw
    return {
      backend: "local" as const,
      url: null,
      expiresAt: null,
      contentType: doc.contentType,
      sizeBytes: doc.sizeBytes,
    };
  }

  async acceptExtraction(userId: string, id: string, meta: ReqMeta) {
    const doc = await this.db.vaultDocument.findUnique({
      where: { id },
      include: { stagedExtraction: true },
    });
    if (!doc) throw new NotFoundException();
    if (doc.userId !== userId) throw new ForbiddenException();
    if (!doc.stagedExtraction) throw new NotFoundException("no extraction to accept");

    const updated = await this.db.vaultDocument.update({
      where: { id },
      data: { extractionState: "review_accepted" },
    });
    await this.audit.write({
      eventType: "document.reviewed",
      subjectId: id,
      actorUserId: userId,
      targetUserId: userId,
      fromState: doc.extractionState,
      toState: updated.extractionState,
      metadata: { kind: doc.kind, decision: "accepted" },
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });
    return { ok: true, extractionState: updated.extractionState };
  }
}
