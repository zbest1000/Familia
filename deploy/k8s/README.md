# FAMILIA Kubernetes deployment

Production-shaped manifests for the four FAMILIA services. Targets a
multi-tenant SaaS deployment behind a load balancer on a managed cluster
(EKS, GKE, AKS, or self-hosted) with managed Postgres (Neon), managed Redis
(Upstash), and S3-compatible object storage.

## Topology

```
                     Internet
                         │
                  ┌──────┴──────┐
                  │   nginx     │   ←  cert-manager TLS, per-IP rate limit
                  │  ingress    │
                  └──┬───────┬──┘
                     │       │
        ┌────────────┘       └────────────┐
        │                                 │
   ┌────▼────┐                       ┌────▼────┐
   │  api    │  ←  HPA (CPU)         │  web    │  ←  HPA (CPU)
   │ pods x2 │     2-20 replicas     │ pods x2 │     2-10 replicas
   └────┬────┘                       └─────────┘
        │
        ├─► Postgres (Neon)        managed, sslmode=require
        ├─► Redis (Upstash)        managed, rediss://
        ├─► S3                     vault uploads
        ├─► SES                    email
        └─► OTel collector         traces + metrics
                ▲                          ▲
                │                          │
   ┌────────────┴────┐         ┌───────────┴─────┐
   │ ocr-worker pods │         │ notifier pods   │
   │  KEDA 1-20      │         │  KEDA 1-5       │
   │  (queue depth)  │         │  (queue depth)  │
   └─────────────────┘         └─────────────────┘
```

## Prerequisites in the cluster

| Component | Why | Install |
|---|---|---|
| **NGINX Ingress Controller** | TLS termination, rate limit, body-size cap | https://kubernetes.github.io/ingress-nginx/ |
| **cert-manager** | Automated Let's Encrypt certs | https://cert-manager.io |
| **External Secrets Operator** | Pulls DB/Redis/S3/JWT secrets from your secret backend | https://external-secrets.io |
| **KEDA** | Scales workers on Redis queue depth | https://keda.sh |
| **Metrics Server** | Powers the HPA | https://github.com/kubernetes-sigs/metrics-server |

You also need:
- A **`SecretStore`** named `familia-secret-store` in the `familia` namespace pointed at AWS Secrets Manager / GCP Secret Manager / Vault. The keys it must expose match `data[].remoteRef.key` in `02-external-secrets.yaml` (e.g. `familia/prod/database-url`).
- A **`ClusterIssuer`** named `letsencrypt-prod` for cert-manager.
- A container registry holding the four images (defaults assume GHCR at `ghcr.io/zbest1000/familia-{api,web,ocr-worker,notifier}`). Replace with your registry in the `image:` fields.

## Build + push images

```bash
# From repo root
docker build -t ghcr.io/zbest1000/familia-api:$TAG          -f apps/api/Dockerfile .
docker build -t ghcr.io/zbest1000/familia-web:$TAG          -f apps/web/Dockerfile .
docker build -t ghcr.io/zbest1000/familia-ocr-worker:$TAG   -f services/ocr-pipeline/Dockerfile .
docker build -t ghcr.io/zbest1000/familia-notifier:$TAG     -f services/notifier/Dockerfile .

docker push ghcr.io/zbest1000/familia-api:$TAG
docker push ghcr.io/zbest1000/familia-web:$TAG
docker push ghcr.io/zbest1000/familia-ocr-worker:$TAG
docker push ghcr.io/zbest1000/familia-notifier:$TAG
```

In CI: build all four in parallel matrix, tag with the git SHA, then run a sed/yq pass over the manifests before applying so `:latest` becomes `:$TAG`.

## First-time apply

```bash
# Files are numbered by apply order — kubectl handles them in lexicographic
# order so a single apply works.
kubectl apply -f deploy/k8s/

# Verify the migration Job completed before the API pods started taking traffic
kubectl -n familia wait --for=condition=complete job/familia-migrate --timeout=300s

# Check rollouts
kubectl -n familia get pods,svc,hpa,scaledobject,ingress
```

## Rolling a new release

The migration Job uses ttlSecondsAfterFinished=86400, so the previous
release's Job is auto-cleaned. To run a new one:

```bash
# CI replaces :latest with the new SHA tag in the manifests, then:
kubectl -n familia delete job familia-migrate --ignore-not-found
kubectl apply -f deploy/k8s/10-migrate-job.yaml
kubectl -n familia wait --for=condition=complete job/familia-migrate --timeout=300s

# Then roll the deployments
kubectl apply -f deploy/k8s/20-api-deployment.yaml \
              -f deploy/k8s/30-web-deployment.yaml \
              -f deploy/k8s/40-ocr-worker-deployment.yaml \
              -f deploy/k8s/50-notifier-deployment.yaml

kubectl -n familia rollout status deploy/familia-api
kubectl -n familia rollout status deploy/familia-web
kubectl -n familia rollout status deploy/familia-ocr-worker
kubectl -n familia rollout status deploy/familia-notifier
```

GitOps users (Argo CD / Flux): point the app at this directory; the
`PreSync` hook on the migration Job ensures it runs before the
Deployments roll.

## Resource budget (per replica)

| Service | CPU req | CPU limit | Mem req | Mem limit | min/max replicas |
|---|---|---|---|---|---|
| api | 250m | 1000m | 256Mi | 512Mi | 2 / 20 (CPU HPA) |
| web | 100m | 500m | 128Mi | 256Mi | 2 / 10 (CPU HPA) |
| ocr-worker | 500m | 2000m | 512Mi | 2Gi | 1 / 20 (KEDA on `bull:ocr-extraction:wait`) |
| notifier | 50m | 200m | 64Mi | 128Mi | 1 / 5 (KEDA on `bull:notifications:wait`) |

Tesseract is the memory-hungry one — when it rasterizes a 20-page scan,
each page bitmap can be 5-10MB. The 2Gi limit is intentionally
generous; tighten once you have real production data.

## Hardening notes

- **Default-deny network policies** (`70-network-policy.yaml`) require a
  CNI that enforces them (Calico, Cilium). On EKS this means using the
  Calico add-on; on GKE turn on Network Policy.
- **PodSecurity** uses `runAsNonRoot`, `readOnlyRootFilesystem`, and drops
  all capabilities. The Dockerfiles run as a non-root user; tmp is an
  emptyDir mount because the FS is read-only.
- **TLS everywhere**: Ingress terminates TLS via cert-manager.
  Postgres/Redis use TLS to the managed services (Neon `sslmode=require`,
  Upstash `rediss://`). The OTel collector should also be TLS in prod.
- **Secrets never in git**: Only `02-external-secrets.yaml` references
  secrets, and it only names them — the values come from your secret
  backend via External Secrets Operator.

## What's missing (next iterations)

- **Service mesh** (Istio / Linkerd) for mTLS between services and
  centralized retries/timeouts.
- **Backup CronJob** that snapshots the Neon DB to S3 nightly. Neon's
  point-in-time recovery covers this for the managed tier; on a
  self-hosted Postgres add this back.
- **Cluster-wide Prometheus + Grafana** stack — annotations are set on
  the API pod (`prometheus.io/scrape`), but the API itself doesn't yet
  expose `/metrics` (R13 wires OTel but not Prom directly).
- **Vault download SignedURL endpoint** so clients pull from S3
  directly, offloading bandwidth from the API (R14).
