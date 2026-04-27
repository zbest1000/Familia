import pino from "pino";

const root = pino({ name: "ocr-pipeline" });

export class Logger {
  private base: pino.Logger;
  constructor(name: string) {
    this.base = root.child({ component: name });
  }
  info(...args: Parameters<pino.Logger["info"]>) {
    this.base.info(...args);
  }
  warn(...args: Parameters<pino.Logger["warn"]>) {
    this.base.warn(...args);
  }
  error(...args: Parameters<pino.Logger["error"]>) {
    this.base.error(...args);
  }
}
