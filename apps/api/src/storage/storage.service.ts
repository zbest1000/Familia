// Object storage abstraction: S3 when configured, local FS as the dev
// default. Lets the rest of the API treat document uploads uniformly.
//
// Resilience: writes are critical — if storage write fails, the API
// rejects the upload. Reads are cacheable but for now go through to
// the backing store.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { Readable } from "node:stream";

import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type StorageBackend = "s3" | "local";

export type SignedDownload =
  | { backend: "s3"; url: string; expiresAt: string }
  | { backend: "local"; url: null; expiresAt: null };

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly log = new Logger("StorageService");
  private backend: StorageBackend = "local";
  private s3: S3Client | null = null;
  private s3Bucket = "";
  private localRoot = "";

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const region = this.config.get<string>("S3_REGION", "");
    const accessKeyId = this.config.get<string>("AWS_ACCESS_KEY_ID", "");
    const secretAccessKey = this.config.get<string>("AWS_SECRET_ACCESS_KEY", "");
    const bucket = this.config.get<string>("S3_BUCKET", "");
    const endpoint = this.config.get<string>("S3_ENDPOINT", "");

    const isDummy = accessKeyId === "test" && secretAccessKey === "test" && !endpoint;
    if (region && accessKeyId && secretAccessKey && bucket && !isDummy) {
      this.s3 = new S3Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
        ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
      });
      this.s3Bucket = bucket;
      this.backend = "s3";
      this.log.log(`storage backend: s3 (bucket=${bucket}, region=${region})`);
    } else {
      this.localRoot = resolve(
        this.config.get<string>("LOCAL_STORAGE_ROOT", "./tmp/uploads"),
      );
      this.backend = "local";
      this.log.warn(
        `storage backend: local FS at ${this.localRoot}. Set S3_REGION+AWS_ACCESS_KEY_ID+AWS_SECRET_ACCESS_KEY+S3_BUCKET to use S3.`,
      );
    }
  }

  get currentBackend(): StorageBackend {
    return this.backend;
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    if (this.backend === "s3" && this.s3) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.s3Bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
      return;
    }
    const path = join(this.localRoot, key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body);
  }

  async get(key: string): Promise<{ stream: Readable; contentType: string | null }> {
    if (this.backend === "s3" && this.s3) {
      const out = await this.s3.send(
        new GetObjectCommand({ Bucket: this.s3Bucket, Key: key }),
      );
      const body = out.Body as Readable;
      return { stream: body, contentType: out.ContentType ?? null };
    }
    const path = join(this.localRoot, key);
    const buf = await readFile(path);
    return { stream: Readable.from(buf), contentType: null };
  }

  // Returns a short-TTL presigned URL when S3 is configured so clients
  // pull from S3 directly (offloading bandwidth from the API). With the
  // local backend, returns nulls — controllers should fall back to
  // streaming through GET /vault/documents/:id/raw.
  async signedDownloadUrl(
    key: string,
    opts?: { ttlSeconds?: number; downloadFilename?: string },
  ): Promise<SignedDownload> {
    if (this.backend === "s3" && this.s3) {
      const ttl = opts?.ttlSeconds ?? 300; // 5 min default
      const cmd = new GetObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        ...(opts?.downloadFilename
          ? {
              ResponseContentDisposition: `attachment; filename="${opts.downloadFilename.replace(/"/g, "")}"`,
            }
          : {}),
      });
      const url = await getSignedUrl(this.s3, cmd, { expiresIn: ttl });
      return {
        backend: "s3",
        url,
        expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
      };
    }
    return { backend: "local", url: null, expiresAt: null };
  }
}
