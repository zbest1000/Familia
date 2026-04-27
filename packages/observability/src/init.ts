// Side-effect entry point: importing this module starts the SDK.
//
// Usage (must be the FIRST import in your service entry file):
//   import "@familia/observability/init";
//   // ...everything else
//
// Reads OTEL_SERVICE_NAME from env. If your service doesn't set it, the
// SDK falls back to "familia-unknown" — set OTEL_SERVICE_NAME in your
// Deployment env (the K8s manifests in deploy/k8s/ already do this).

import { startObservability } from "./index.js";

startObservability();
