// EmailService. Sends transactional email via SES v2 when AWS credentials
// are present in the environment; otherwise logs the message and returns ok.
// Dev environments always have a usable email path without needing SES.

import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

type SendInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly log = new Logger("EmailService");
  private ses: SESv2Client | null = null;
  private fromAddress = "FAMILIA <no-reply@example.com>";
  private enabled = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const region = this.config.get<string>("SES_REGION", "");
    const accessKeyId = this.config.get<string>("AWS_ACCESS_KEY_ID", "");
    const secretAccessKey = this.config.get<string>("AWS_SECRET_ACCESS_KEY", "");
    const fromOverride = this.config.get<string>("EMAIL_FROM", "");
    if (fromOverride) this.fromAddress = fromOverride;

    // SES only enabled when all three are set AND not the LocalStack dummy.
    const isDummy = accessKeyId === "test" && secretAccessKey === "test";
    if (region && accessKeyId && secretAccessKey && !isDummy) {
      this.ses = new SESv2Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });
      this.enabled = true;
      this.log.log(`SES enabled (region=${region}, from=${this.fromAddress})`);
    } else {
      this.log.warn(
        "SES not configured — emails will be logged to stderr instead of sent. Set SES_REGION + AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY to enable.",
      );
    }
  }

  async send(input: SendInput): Promise<{ ok: true; via: "ses" | "log" }> {
    if (!this.enabled || !this.ses) {
      this.log.warn(
        `[dev-email] to=${input.to} subject=${JSON.stringify(input.subject)} body=${JSON.stringify(input.text)}`,
      );
      return { ok: true, via: "log" };
    }
    try {
      await this.ses.send(
        new SendEmailCommand({
          FromEmailAddress: this.fromAddress,
          Destination: { ToAddresses: [input.to] },
          Content: {
            Simple: {
              Subject: { Data: input.subject, Charset: "UTF-8" },
              Body: {
                Text: { Data: input.text, Charset: "UTF-8" },
                ...(input.html
                  ? { Html: { Data: input.html, Charset: "UTF-8" } }
                  : {}),
              },
            },
          },
        }),
      );
      return { ok: true, via: "ses" };
    } catch (err) {
      // Important: do NOT throw inside the OTP flow. SES failure must not
      // block sign-in; we degrade to logging so the dev/test path still works.
      this.log.error(
        `SES send failed (to=${input.to}); falling back to log: ${(err as Error).message}`,
      );
      this.log.warn(
        `[dev-email-fallback] to=${input.to} subject=${JSON.stringify(input.subject)} body=${JSON.stringify(input.text)}`,
      );
      return { ok: true, via: "log" };
    }
  }

  async sendOtp(args: { to: string; code: string; purpose: "signup" | "signin" }) {
    const subject =
      args.purpose === "signup" ? "Your FAMILIA sign-up code" : "Your FAMILIA sign-in code";
    const text =
      `Your code is ${args.code}.\n\n` +
      `It expires in 10 minutes. If you didn't request this, you can ignore this message.\n\n` +
      `— FAMILIA`;
    return this.send({ to: args.to, subject, text });
  }
}
