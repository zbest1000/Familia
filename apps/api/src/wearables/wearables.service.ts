import { Injectable } from "@nestjs/common";

import { POLICY_VERSION } from "@familia/consent-engine";

import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../common/prisma.service";

type ReqMeta = { actorUserId: string; clientIp?: string | null };

export type IngestSample = {
  source: "apple_health" | "google_health_connect" | "fitbit" | "garmin" | "oura" | "manual";
  metric: string;
  value: number;
  unit?: string | null;
  capturedAt: string; // ISO
};

@Injectable()
export class WearablesService {
  constructor(
    private readonly db: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async ingest(userId: string, samples: IngestSample[], meta: ReqMeta) {
    if (samples.length === 0) return { count: 0 };
    await this.db.wearableSample.createMany({
      data: samples.map((s) => ({
        userId,
        source: s.source,
        metric: s.metric,
        value: s.value,
        unit: s.unit ?? null,
        capturedAt: new Date(s.capturedAt),
      })),
    });
    await this.audit.write({
      eventType: "record.created",
      subjectId: userId,
      actorUserId: userId,
      targetUserId: userId,
      fromState: null,
      toState: "ingested",
      metadata: {
        kind: "wearable_sample_batch",
        count: samples.length,
        sources: Array.from(new Set(samples.map((s) => s.source))),
        metrics: Array.from(new Set(samples.map((s) => s.metric))),
      },
      policyVersion: POLICY_VERSION,
      requestSource: "api",
      clientIp: meta.clientIp ?? null,
    });
    return { count: samples.length };
  }

  async summary(userId: string, daysBack = 7) {
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const rows = await this.db.wearableSample.findMany({
      where: { userId, capturedAt: { gte: since } },
      orderBy: { capturedAt: "asc" },
    });

    const byMetric = new Map<string, { values: number[]; min: number; max: number; sum: number; lastValue: number; lastAt: Date }>();
    for (const r of rows) {
      const m = byMetric.get(r.metric);
      if (!m) {
        byMetric.set(r.metric, {
          values: [r.value],
          min: r.value,
          max: r.value,
          sum: r.value,
          lastValue: r.value,
          lastAt: r.capturedAt,
        });
      } else {
        m.values.push(r.value);
        if (r.value < m.min) m.min = r.value;
        if (r.value > m.max) m.max = r.value;
        m.sum += r.value;
        if (r.capturedAt > m.lastAt) {
          m.lastValue = r.value;
          m.lastAt = r.capturedAt;
        }
      }
    }
    return {
      since: since.toISOString(),
      until: new Date().toISOString(),
      sampleCount: rows.length,
      metrics: Object.fromEntries(
        Array.from(byMetric.entries()).map(([metric, agg]) => [
          metric,
          {
            count: agg.values.length,
            min: agg.min,
            max: agg.max,
            avg: Math.round((agg.sum / agg.values.length) * 100) / 100,
            lastValue: agg.lastValue,
            lastAt: agg.lastAt.toISOString(),
          },
        ]),
      ),
    };
  }
}
