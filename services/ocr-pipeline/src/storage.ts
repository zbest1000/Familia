// Minimal storage reader for the OCR worker. Mirrors the API's
// StorageService: S3 when AWS creds + bucket are set, local FS otherwise.
//
// We do NOT depend on @nestjs/* here so the worker can run as a plain Node
// process without the Nest runtime overhead.

import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const region = process.env.S3_REGION ?? "";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID ?? "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY ?? "";
const bucket = process.env.S3_BUCKET ?? "";
const endpoint = process.env.S3_ENDPOINT ?? "";

const isDummy = accessKeyId === "test" && secretAccessKey === "test" && !endpoint;
const useS3 =
  Boolean(region) && Boolean(accessKeyId) && Boolean(secretAccessKey) && Boolean(bucket) && !isDummy;

const s3 = useS3
  ? new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
      ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    })
  : null;

const localRoot = resolve(process.env.LOCAL_STORAGE_ROOT ?? "./tmp/uploads");

export async function readDocument(storageKey: string): Promise<{
  buffer: Buffer;
  contentType: string | null;
  source: "s3" | "local";
}> {
  if (s3) {
    const out = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: storageKey }));
    const chunks: Buffer[] = [];
    for await (const chunk of out.Body as AsyncIterable<Buffer>) chunks.push(chunk);
    return {
      buffer: Buffer.concat(chunks),
      contentType: out.ContentType ?? null,
      source: "s3",
    };
  }
  const path = join(localRoot, storageKey);
  const buffer = await readFile(path);
  return { buffer, contentType: null, source: "local" };
}

export const storageInfo = useS3
  ? ({ backend: "s3" as const, bucket, region })
  : ({ backend: "local" as const, root: localRoot });
