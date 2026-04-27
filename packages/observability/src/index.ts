// @familia/observability — shared OpenTelemetry bootstrap.
//
// Two ways to use this:
//   1. `import "@familia/observability/init"` as the FIRST line of your
//      service entry file. The SDK starts at module evaluation, before
//      any HTTP/Redis/PG modules import. This is the only correct order
//      for OTel auto-instrumentation: the SDK monkey-patches globals,
//      and patches must be applied before the patched module is loaded.
//
//   2. `import { startObservability } from "@familia/observability"`
//      and call it explicitly if you need to inject test config. Same
//      ordering caveat applies.
//
// Configuration is env-driven so a single image works in dev, staging,
// and prod:
//   - OTEL_EXPORTER_OTLP_ENDPOINT (e.g. http://otel-collector:4318)
//     If unset, the SDK is a no-op — services run unchanged in dev/CI.
//   - OTEL_SERVICE_NAME (e.g. familia-api)
//   - OTEL_SERVICE_NAMESPACE (default: familia)
//   - OTEL_TRACES_SAMPLER_ARG (default: 1.0; cluster ConfigMap drops to 0.1
//     in prod so traces don't drown the backend)

import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

let sdkInstance: NodeSDK | null = null;

export type ObservabilityHandle = {
  shutdown: () => Promise<void>;
  enabled: boolean;
};

export function startObservability(opts?: {
  serviceName?: string;
  namespace?: string;
  version?: string;
  endpoint?: string;
}): ObservabilityHandle {
  if (sdkInstance) {
    return { shutdown: () => sdkInstance!.shutdown(), enabled: true };
  }

  const endpoint = opts?.endpoint ?? process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!endpoint) {
    return { shutdown: async () => {}, enabled: false };
  }

  if (process.env.OTEL_LOG_LEVEL === "debug") {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  }

  const serviceName =
    opts?.serviceName ?? process.env.OTEL_SERVICE_NAME ?? "familia-unknown";
  const namespace =
    opts?.namespace ?? process.env.OTEL_SERVICE_NAMESPACE ?? "familia";
  const version = opts?.version ?? process.env.npm_package_version ?? "0.0.0";

  // Resource attributes are populated via env (OTEL_RESOURCE_ATTRIBUTES)
  // before the SDK reads its config. This is the most version-stable way to
  // set them and avoids importing the Resource class (whose API changed
  // between OTel JS 1.26 and 1.30).
  process.env.OTEL_SERVICE_NAME = serviceName;
  process.env.OTEL_RESOURCE_ATTRIBUTES = [
    `service.name=${serviceName}`,
    `service.namespace=${namespace}`,
    `service.version=${version}`,
    `deployment.environment=${process.env.NODE_ENV ?? "development"}`,
    process.env.POD_NAME ? `k8s.pod.name=${process.env.POD_NAME}` : "",
    process.env.POD_NAMESPACE ? `k8s.namespace.name=${process.env.POD_NAMESPACE}` : "",
    process.env.NODE_NAME ? `k8s.node.name=${process.env.NODE_NAME}` : "",
  ]
    .filter(Boolean)
    .join(",");

  // sdk options cast through `any`: NodeSDK's typing references the copy
  // of @opentelemetry/sdk-metrics + auto-instrumentations it bundles,
  // while we import from the top-level deps — TS sees two distinct (but
  // structurally identical) types. Runtime is fine; this is purely a
  // version-drift annoyance in OTel JS's monorepo packaging.
  const sdkConfig: any = {
    traceExporter: new OTLPTraceExporter({ url: `${endpoint}/v1/traces` }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({ url: `${endpoint}/v1/metrics` }),
      exportIntervalMillis: 60_000,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // fs is noisy and rarely useful for app-level traces
        "@opentelemetry/instrumentation-fs": { enabled: false },
        // pino auto-injects trace_id + span_id into every log record →
        // logs in the backend correlate with the spans they were emitted under
        "@opentelemetry/instrumentation-pino": {
          logHook: (_span: unknown, record: Record<string, unknown>) => {
            record["service.name"] = serviceName;
          },
        },
      }),
    ],
  };
  const sdk = new NodeSDK(sdkConfig);

  sdk.start();
  sdkInstance = sdk;

  // Best-effort shutdown on SIGTERM so in-flight spans flush
  const shutdown = async () => {
    try {
      await sdk.shutdown();
    } catch {
      // swallow — process is going away anyway
    }
  };
  process.on("SIGTERM", () => {
    void shutdown();
  });

  return { shutdown, enabled: true };
}

export function getObservability(): ObservabilityHandle {
  return {
    shutdown: () => (sdkInstance ? sdkInstance.shutdown() : Promise.resolve()),
    enabled: sdkInstance !== null,
  };
}
