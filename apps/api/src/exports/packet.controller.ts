import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { z } from "zod";

import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import type { RequestUser } from "../auth/auth.types";
import { PacketService } from "./packet.service";

const PacketDto = z.object({
  reason: z.string().max(200).optional(),
  includeMedications: z.boolean().optional(),
  includeConditions: z.boolean().optional(),
  includeAllergies: z.boolean().optional(),
  includeRecentEncounters: z.boolean().optional(),
});

function clientIp(req: Request): string | null {
  const fwd = req.headers["x-forwarded-for"];
  return Array.isArray(fwd) ? fwd[0] ?? null : fwd?.split(",")[0]?.trim() ?? req.ip ?? null;
}

@UseGuards(AuthGuard)
@Controller("exports")
export class PacketController {
  constructor(private readonly packets: PacketService) {}

  @Post("doctor-packet")
  async generate(
    @CurrentUser() me: RequestUser,
    @Body() body: unknown,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const opts = PacketDto.parse(body ?? {});
    const stream = await this.packets.generate(opts, {
      actorUserId: me.userId,
      clientIp: clientIp(req),
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="familia-packet-${new Date().toISOString().slice(0, 10)}.pdf"`,
    );
    stream.pipe(res);
  }
}
