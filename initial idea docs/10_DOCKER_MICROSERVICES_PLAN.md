# FAMILIA — Docker and Microservices Plan

## 1. Development Philosophy

Start modular but not overcomplicated.

A practical early architecture:

- Monorepo
- Modular backend services
- Docker Compose
- Shared API gateway
- PostgreSQL
- Redis
- Object storage
- Optional Neo4j/TimescaleDB

Later, split into true microservices when scale requires it.

## 2. Suggested Monorepo Structure

```text
familia/
  apps/
    mobile/
    web/
    api-gateway/
  services/
    identity-service/
    consent-service/
    graph-service/
    health-data-service/
    document-service/
    wearable-service/
    alert-service/
    ai-service/
    audit-service/
  packages/
    shared-types/
    auth-utils/
    consent-policy/
    health-schema/
    ui-components/
  infra/
    docker/
    compose/
    k8s/
    terraform/
  docs/
```

## 3. Services

### identity-service
- Auth
- MFA
- Sessions
- User account lifecycle

### consent-service
- Consent records
- ABAC policy evaluation
- Access decisions

### graph-service
- Family relationships
- Invite links
- Biological/social graph

### health-data-service
- Medical records
- Labs
- medications
- Encounters
- Conditions

### document-service
- Uploads
- Secure file storage
- OCR pipeline
- Metadata

### wearable-service
- Apple/Google health ingestion
- Time-series metrics
- Device source tracking

### alert-service
- Alert preview
- Message variants
- Delivery
- Approval workflow

### ai-service
- Summaries
- RAG
- Timeline generation
- Check-in analysis

### audit-service
- Immutable event logging
- Access logs
- User-visible audit dashboard

## 4. Docker Compose MVP

Example:

```yaml
version: "3.9"

services:
  api-gateway:
    build: ./apps/api-gateway
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - redis

  identity-service:
    build: ./services/identity-service
    environment:
      DATABASE_URL: postgres://familia:familia@postgres:5432/familia

  consent-service:
    build: ./services/consent-service

  graph-service:
    build: ./services/graph-service
    depends_on:
      - neo4j

  health-data-service:
    build: ./services/health-data-service

  document-service:
    build: ./services/document-service
    depends_on:
      - minio

  wearable-service:
    build: ./services/wearable-service
    depends_on:
      - timescale

  alert-service:
    build: ./services/alert-service

  ai-service:
    build: ./services/ai-service

  audit-service:
    build: ./services/audit-service

  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: familia
      POSTGRES_PASSWORD: familia
      POSTGRES_DB: familia
    ports:
      - "5432:5432"

  timescale:
    image: timescale/timescaledb:latest-pg16
    environment:
      POSTGRES_USER: familia
      POSTGRES_PASSWORD: familia
      POSTGRES_DB: familia_timeseries

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  neo4j:
    image: neo4j:5
    environment:
      NEO4J_AUTH: neo4j/familia-password
    ports:
      - "7474:7474"
      - "7687:7687"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: familia
      MINIO_ROOT_PASSWORD: familia-password
    ports:
      - "9000:9000"
      - "9001:9001"
```

## 5. API Gateway Responsibilities

- JWT validation
- Request routing
- Rate limiting
- Common error formatting
- API versioning
- Logging
- Correlation IDs

## 6. Internal Service Communication

Use:
- REST for simple MVP
- gRPC later for internal typed service calls
- Event broker for async workflows

Example events:
- user.created
- relationship.accepted
- consent.granted
- consent.revoked
- document.uploaded
- document.extracted
- wearable.batch_ingested
- alert.approved
- alert.sent
- checkin.created
- ai.summary_generated

## 7. CI/CD

Pipeline:
1. Lint
2. Type check
3. Unit tests
4. Security scan
5. Build containers
6. Run integration tests
7. Push images
8. Deploy to dev/staging/prod

## 8. Environments

- local
- development
- staging
- production

Each environment must have separate:
- Database
- Object storage
- Secrets
- API keys
- Logging streams

## 9. Observability

Use:
- Structured logs
- Metrics
- Distributed tracing
- Error reporting
- Audit logging

Recommended:
- OpenTelemetry
- Prometheus
- Grafana
- Loki
- Sentry

## 10. Secrets Management

Never store secrets in repo.

Use:
- Doppler
- Vault
- AWS Secrets Manager
- GCP Secret Manager
- Azure Key Vault

## 11. Deployment Evolution

### MVP
Docker Compose on cloud VM or managed containers.

### Growth
Managed Postgres, managed Redis, object storage, container service.

### Scale
Kubernetes, service mesh, event broker, autoscaling, data warehouse.

### Regulated
HIPAA-eligible cloud architecture, BAA vendors, hardened network segmentation, SIEM.

## 12. Local Development Priorities

Developers should be able to run:

```bash
docker compose up
```

And get:
- API gateway
- Backend services
- PostgreSQL
- Redis
- MinIO
- Neo4j
- TimescaleDB

## 13. Production Hardening

Required before public launch:
- HTTPS everywhere
- Strict CORS
- Rate limiting
- WAF
- Container scanning
- Database backups
- Encryption at rest
- Key rotation
- Audit monitoring
- Disaster recovery
