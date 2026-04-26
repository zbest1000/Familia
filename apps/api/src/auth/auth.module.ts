import { Module } from "@nestjs/common";

import { AuditModule } from "../audit/audit.module";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { JwtService } from "./jwt.service";
import { OtpService } from "./otp.service";

@Module({
  imports: [AuditModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService, OtpService, AuthGuard],
  exports: [AuthService, JwtService, AuthGuard],
})
export class AuthModule {}
