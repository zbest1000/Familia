# FAMILIA — System Architecture

## 1. Architectural Overview

FAMILIA should be designed as a modular, service-oriented platform with strong boundaries between identity, consent, health data, relationship graph, document storage, analytics, notifications, and AI processing.

The architecture must support:

- Mobile and web clients
- Secure health data storage
- Wearable and IoT ingestion
- Medical record import/export
- Provider system integration
- Family graph modeling
- DNA-based discovery in later phases
- Context-aware alert generation
- AI health summaries
- Audit logging
- Consent enforcement at every access point

## 2. High-Level Components

### 2.1 Client Applications
- iOS app
- Android app
- Web app
- Future clinician portal
- Future admin/compliance portal

### 2.2 API Gateway
Central entry point for all client requests.

Responsibilities:
- Request routing
- Rate limiting
- Authentication verification
- API versioning
- Request logging
- Threat filtering
- Payload validation

### 2.3 Identity Service
Handles:
- User registration
- Login
- MFA
- Device trust
- Session management
- Password resets
- OAuth/OpenID Connect
- Account recovery

### 2.4 Consent and Policy Engine
The most critical backend service.

Responsibilities:
- Evaluate access requests
- Store grants and revocations
- Apply relationship-based rules
- Apply data-scope permissions
- Enforce emergency access
- Log every access decision
- Provide consent previews in UI

### 2.5 Family Graph Service
Stores and manages relationship structure.

Responsibilities:
- Family tree modeling
- Biological and social relationship separation
- Invite links
- Relationship acceptance
- DNA discovery linking
- Relationship visibility controls
- Graph traversal for alert targeting

Recommended database:
- Neo4j
- Amazon Neptune
- ArangoDB
- PostgreSQL with graph extension for early MVP

### 2.6 Health Data Service
Stores structured health records.

Responsibilities:
- Conditions
- Medications
- Allergies
- Encounters
- Labs
- Procedures
- Immunizations
- Dental records
- Vision records
- Mental health entries
- Medical summaries
- User-entered data

Recommended database:
- PostgreSQL

### 2.7 Time-Series Health Signal Service
Stores high-volume wearable/IoT signals.

Responsibilities:
- Heart rate
- HRV
- Steps
- Sleep stages
- Workouts
- Temperature
- Oxygen saturation
- Blood pressure
- Glucose data
- Future IoT feeds

Recommended database:
- TimescaleDB
- InfluxDB
- ClickHouse for analytical scale

### 2.8 Document Vault Service
Stores encrypted files.

Responsibilities:
- Uploads
- Metadata
- OCR pipeline
- Document classification
- Secure downloads
- Export bundles
- File versioning
- Provenance tracking

Recommended storage:
- S3-compatible object storage
- MinIO for self-hosted/dev
- AWS S3/GCP/Azure Blob for cloud

### 2.9 Ingestion Service
Handles all external data sources.

Input types:
- Apple Health exports
- Google Fit / Health Connect
- FHIR APIs
- Uploaded PDFs
- Lab CSVs
- Wearable APIs
- Manual forms
- Future DNA files

Responsibilities:
- Source connection
- Data validation
- Deduplication
- Normalization
- Provenance tagging
- Queue-based processing

### 2.10 Normalization Engine
Transforms source data into FAMILIA canonical health model.

Responsibilities:
- Unit conversion
- Date normalization
- Terminology mapping
- Data type classification
- Duplicate detection
- Confidence scoring
- Source reliability scoring

Examples:
- mg/dL to mmol/L where appropriate
- LOINC mapping for labs
- RxNorm mapping for medications
- SNOMED/ICD mapping for conditions
- FHIR resource normalization

### 2.11 Notification and Alert Service
Handles alerts, invites, reminders, and check-in prompts.

Channels:
- In-app
- Push notification
- Email
- SMS later
- Emergency workflows later

Responsibilities:
- Context-aware message generation
- Recipient-specific templates
- User approval workflow
- Delivery status
- Escalation rules
- Audit logging

### 2.12 AI Digital Twin Service
Generates summaries and insights.

Responsibilities:
- Daily/weekly/monthly summaries
- Visit summaries
- Timeline extraction
- Symptom trend summaries
- Mental health check-in summaries
- Family-aware context summaries
- Non-diagnostic risk indicators
- Record organization assistance

### 2.13 Audit Logging Service
Central immutable event log.

Captures:
- Login attempts
- Data access
- Data updates
- Consent grants
- Consent revocations
- Alert approvals
- Alert sends
- Relationship changes
- Document downloads
- Emergency access events

Recommended:
- Append-only event store
- Write-once retention option
- Tamper-evident hashing

## 3. Data Flow

### 3.1 Wearable Data Flow
1. Mobile app receives data from device ecosystem.
2. App sends authorized payload to ingestion service.
3. Ingestion service validates payload.
4. Normalization engine maps to canonical format.
5. Time-series service stores raw and normalized signal.
6. AI service can use summarized trends.
7. Consent engine controls who can view.

### 3.2 Medical Record Import Flow
1. User uploads PDF or connects provider.
2. File enters document vault.
3. OCR/extraction pipeline reads document.
4. Normalization engine extracts structured data.
5. User reviews extracted data.
6. Approved data enters health data service.
7. File remains linked as source/provenance.

### 3.3 Family Invite Flow
1. User generates 10-minute invite link.
2. Invite token is stored with expiry and intended relationship.
3. Recipient opens link.
4. Recipient authenticates or creates account.
5. Recipient reviews relationship request and access request.
6. Recipient accepts or rejects.
7. Family graph edge is created.
8. Consent rules are applied.

### 3.4 Alert Flow
1. Health event occurs or user creates alert.
2. User selects recipients or group.
3. Consent engine validates allowed recipients.
4. Alert engine builds recipient-specific message variants.
5. User previews all variants.
6. User approves.
7. Notifications are sent.
8. Audit log records message hash, recipients, timestamp, and disclosure mode.

## 4. Event-Driven Design

FAMILIA should use asynchronous events for:

- File upload completed
- OCR completed
- Data normalized
- Check-in submitted
- Consent granted
- Consent revoked
- Relationship accepted
- Alert approved
- Alert delivered
- Wearable batch ingested

Recommended event broker:
- Kafka for large scale
- RabbitMQ for MVP
- NATS for lightweight eventing
- Redis Streams for early-stage simplicity

## 5. Service Boundaries

Do not allow direct database access across services.

Each service owns its data.

Example:
- Consent Service owns consent records.
- Graph Service owns relationships.
- Health Data Service owns health records.
- AI Service requests data through permission-checked APIs.

## 6. Deployment Tiers

### MVP
- Monorepo
- Modular backend
- PostgreSQL
- Redis
- Object storage
- Docker Compose

### Growth Stage
- Microservices
- Separate databases
- Event broker
- Kubernetes
- CI/CD
- Observability stack

### Regulated/Enterprise Stage
- HIPAA-aligned cloud environment
- BAA-supported vendors
- Security monitoring
- Key management
- Disaster recovery
- Formal compliance program

## 7. Recommended Initial Tech Stack

### Frontend
- React Native for mobile
- React / Next.js for web
- TypeScript

### Backend
- Node.js / NestJS or Python FastAPI
- PostgreSQL
- Redis
- MinIO/S3
- Neo4j or PostgreSQL graph modeling initially
- TimescaleDB for time-series

### AI
- Separate AI service
- Retrieval-augmented generation over user-approved records
- Strict safety filters
- No autonomous diagnosis

### DevOps
- Docker
- Docker Compose for MVP
- GitHub Actions
- Terraform later
- Kubernetes later
