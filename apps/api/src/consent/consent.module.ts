import { Module } from "@nestjs/common";

import { ConsentService } from "./consent.service";

// Sprint-0: service exposes the engine. Endpoints land in Sprint 5-6.
@Module({
  providers: [ConsentService],
  exports: [ConsentService],
})
export class ConsentModule {}
