import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Request } from "express";
import { z } from "zod";

import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import type { RequestUser } from "../auth/auth.types";
import { ALLOWED_KINDS, VaultService } from "./vault.service";

const UploadDto = z.object({
  kind: z.enum(ALLOWED_KINDS).default("generic_medical"),
  title: z.string().max(200).optional(),
});

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB; tight enough for sane OCR

function clientIp(req: Request): string | null {
  const fwd = req.headers["x-forwarded-for"];
  return Array.isArray(fwd) ? fwd[0] ?? null : fwd?.split(",")[0]?.trim() ?? req.ip ?? null;
}

@UseGuards(AuthGuard)
@Controller("vault/documents")
export class VaultController {
  constructor(private readonly vault: VaultService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: MAX_BYTES, files: 1 },
    }),
  )
  async upload(
    @CurrentUser() me: RequestUser,
    @UploadedFile()
    file: { buffer: Buffer; mimetype: string; originalname: string; size: number } | undefined,
    @Body() body: unknown,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new Error("missing file (multipart field 'file' required)");
    }
    const dto = UploadDto.parse(body);
    return this.vault.upload(me.userId, file, dto, {
      actorUserId: me.userId,
      clientIp: clientIp(req),
    });
  }

  @Get()
  async list(@CurrentUser() me: RequestUser) {
    return this.vault.list(me.userId);
  }

  @Get(":id")
  async detail(@CurrentUser() me: RequestUser, @Param("id", new ParseUUIDPipe()) id: string) {
    return this.vault.getDetail(me.userId, id);
  }

  @Post(":id/extraction/accept")
  async acceptExtraction(
    @CurrentUser() me: RequestUser,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ) {
    return this.vault.acceptExtraction(me.userId, id, {
      actorUserId: me.userId,
      clientIp: clientIp(req),
    });
  }

  // Returns a short-TTL presigned S3 URL so clients pull the file
  // directly from S3 without proxying through the API. Audit-logged.
  // Falls back to nulls when storage backend is local FS — caller
  // would need a separate /raw streaming endpoint in that case.
  @Get(":id/download")
  async download(
    @CurrentUser() me: RequestUser,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ) {
    return this.vault.getSignedDownload(me.userId, id, {
      actorUserId: me.userId,
      clientIp: clientIp(req),
    });
  }
}
