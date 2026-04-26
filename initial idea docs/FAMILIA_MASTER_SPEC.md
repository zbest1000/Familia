# FAMILIA — MASTER EXPANDED SPECIFICATION



---

# Source File: 00_README.md


# FAMILIA Documentation Pack

FAMILIA is a privacy-first family health intelligence ecosystem designed to unify a person’s full medical profile, current health status, complete medical history, wearable and IoT health signals, documents, optional DNA data, and family-linked health communication into one controlled system.

This pack contains a complete product, technical, data, AI, UX, security, compliance, and execution specification.

## Documents Included

1. `01_PRODUCT_SPEC.md` — Full product definition and feature scope
2. `02_SYSTEM_ARCHITECTURE.md` — Services, infrastructure, data flow, and deployment model
3. `03_API_SPEC.md` — REST and event API design
4. `04_DATABASE_SCHEMA.md` — Core relational, graph, time-series, and document schema
5. `05_CONSENT_AND_ALERT_ENGINE.md` — Consent, access control, context-aware alerts, and message logic
6. `06_AI_DIGITAL_TWIN.md` — AI architecture, health summaries, check-ins, and model behavior
7. `07_UI_UX_SPEC.md` — Mobile/web screens, flows, and user experience requirements
8. `08_SECURITY_COMPLIANCE.md` — Security, privacy, HIPAA posture, audit, encryption, and risk controls
9. `09_MVP_ROADMAP.md` — MVP, phased roadmap, milestones, and development priorities
10. `10_DOCKER_MICROSERVICES_PLAN.md` — Microservices, Docker, deployment, and DevOps plan
11. `11_BUSINESS_AND_MONETIZATION.md` — Market positioning, pricing, GTM, and defensibility
12. `FAMILIA_MASTER_SPEC.md` — Combined master file with all documentation

## Core Product Principle

FAMILIA does not simply store health data.

It creates a controlled, contextual, auditable, family-aware health intelligence layer around the user’s complete health life.



---

# Source File: 01_PRODUCT_SPEC.md


# FAMILIA — Full Product Specification

## 1. Product Vision

FAMILIA is a unified personal and family health intelligence platform. It allows a user to build a complete, living digital profile of their health across medical care, daily wellness, biomarkers, wearable data, documents, optional DNA data, and family health relationships.

The platform is designed around one central problem:

> A person’s health data is fragmented across doctor portals, labs, hospitals, dental offices, pharmacies, wearable apps, fitness platforms, family memory, PDF reports, paper records, and personal notes. No single system forms a complete picture of the person.

FAMILIA solves this by creating a user-controlled health ecosystem that connects:

- Full medical history
- Current health status
- Wearable and IoT data
- Medical documents
- Lab results
- Dental and vision records
- Mental and behavioral health
- Medication and treatment history
- Family tree and relationship context
- Optional DNA and hereditary risk information
- Context-aware family alerts
- AI-generated health summaries and digital twin modeling

## 2. Product Category

FAMILIA combines several product categories:

- Personal Health Record (PHR)
- Family Health Graph
- Health Data Vault
- Wearable and IoT Health Aggregator
- Consent and Identity Platform
- Context-Aware Alerting System
- AI Health Digital Twin
- Medical Document Intelligence Platform
- Optional DNA and Hereditary Awareness Network

## 3. Primary Product Goals

1. Give users ownership and control of their complete health data.
2. Build a complete health profile across all care domains.
3. Make family health information structured, useful, and privacy-aware.
4. Allow selective access sharing with spouses, children, parents, caregivers, and extended relatives.
5. Support biological, adopted, step, guardian, foster, and custom family structures.
6. Make every alert contextual based on relationship, relevance, urgency, and consent.
7. Use AI to summarize, organize, and contextualize health information without making unauthorized diagnoses.
8. Support future integrations with doctors, labs, wearables, pharmacies, insurance systems, and genomic platforms.

## 4. Primary Users

### 4.1 Individual Owner
The main account holder. They own their data, control consent, add records, invite relatives, connect devices, and approve alerts.

### 4.2 Family Member
A connected person in the user’s family graph. They may receive limited access, contextual alerts, emergency updates, or shared summaries based on consent.

### 4.3 Caregiver / Proxy
A trusted person with broader access, such as a spouse, adult child, parent, guardian, or care coordinator.

### 4.4 Dependent / Minor
A child or dependent whose profile may be managed by a parent or guardian.

### 4.5 Clinician / Provider
A future user type that may receive structured summaries, exported records, or direct access through secure clinical workflows.

### 4.6 Research Participant
A future user mode where the user can explicitly opt into de-identified research contribution.

## 5. Complete Health Coverage

FAMILIA must cover every major aspect of a person’s health profile, status, and history.

### 5.1 Core Medical Care
- Primary care visits
- Specialist visits
- Urgent care
- Emergency care
- Telehealth
- Hospital admissions
- Surgeries
- Procedures
- Preventive screenings
- Chronic disease management
- Follow-up care
- Referrals
- Discharge summaries
- Care plans

### 5.2 Dental Health
- Dental exams
- Cleanings
- X-rays
- Fillings
- Root canals
- Extractions
- Implants
- Orthodontics
- Gum disease
- Oral surgery
- Dental prescriptions
- Dental treatment plans

### 5.3 Vision and Eye Health
- Vision exams
- Glasses prescriptions
- Contact lens prescriptions
- Eye pressure tests
- Retinal imaging
- Glaucoma screenings
- Cataract history
- Eye surgeries
- Vision correction procedures

### 5.4 Mental and Behavioral Health
- Psychiatric visits
- Therapy sessions
- Counseling notes
- Diagnoses
- Mood tracking
- Anxiety/stress tracking
- Depression screening
- Medication response
- Crisis plans
- Behavioral patterns
- Sleep and mental health correlation

### 5.5 Medication and Pharmacy
- Active medications
- Historical medications
- Dosage
- Frequency
- Prescribing provider
- Start and stop dates
- Side effects
- Adherence tracking
- Refill history
- Pharmacy information
- Drug allergies
- Supplement use

### 5.6 Allergies and Sensitivities
- Drug allergies
- Food allergies
- Environmental allergies
- Seasonal allergies
- Skin sensitivities
- Reaction severity
- Reaction history
- Emergency treatment instructions

### 5.7 Labs and Biomarkers
- Blood work
- Urine tests
- Hormone panels
- Metabolic panels
- Lipid panels
- Genetic markers
- Cancer markers
- Inflammatory markers
- Vitamin/mineral levels
- Organ function markers
- Trends over time
- Reference ranges
- Unit normalization

### 5.8 Imaging and Diagnostics
- X-rays
- MRI
- CT scans
- Ultrasound
- Mammograms
- ECG/EKG
- EEG
- Colonoscopy reports
- Pathology reports
- Radiology reports
- Uploaded images and documents

### 5.9 Immunizations
- Childhood vaccines
- Adult vaccines
- Travel vaccines
- COVID/flu vaccines
- Vaccine dates
- Lot numbers if available
- Booster reminders

### 5.10 Reproductive and Family Health
- Pregnancy history
- Fertility history
- Menstrual health
- Birth control history
- Reproductive surgeries
- Prenatal care
- Postpartum care
- Family planning notes

### 5.11 Lifestyle and Wellness
- Activity
- Nutrition
- Sleep
- Stress
- Weight
- Hydration
- Alcohol use
- Tobacco use
- Exercise routines
- Recovery
- Energy levels
- Pain scores

### 5.12 Wearable and IoT Data
- Heart rate
- Heart rate variability
- Steps
- Sleep stages
- Oxygen saturation
- Temperature
- Workouts
- Calories
- Respiratory rate
- Blood pressure from connected devices
- Glucose from connected devices
- Future environmental sensor data

### 5.13 Documents and Files
- PDF reports
- Lab result PDFs
- Discharge summaries
- Dental records
- Imaging reports
- Prescriptions
- Insurance documents
- Doctor notes
- Photos
- User-uploaded records
- Export bundles

### 5.14 Optional DNA and Genomics
- Imported DNA raw data
- Variant-level records
- Hereditary risk flags
- DNA relationship discovery
- Confirmed biological links
- Genetic relevance logic for alerts

## 6. Family Graph System

FAMILIA must support complex family structures. The family model cannot assume that all family relationships are biological.

### 6.1 Relationship Categories
- Biological parent
- Biological child
- Biological sibling
- Half sibling
- Cousin
- Aunt/uncle
- Niece/nephew
- Grandparent
- Grandchild
- Spouse
- Partner
- Adoptive parent
- Adopted child
- Step-parent
- Step-child
- Foster parent
- Foster child
- Guardian
- Legal dependent
- Caregiver
- Custom relationship

### 6.2 Dual Graph Model
FAMILIA uses two separate but connected graphs.

#### Social / Legal Graph
Controls access, caregiving, family management, support alerts, and user-defined family structure.

#### Biological / Genetic Graph
Controls hereditary relevance, genetic alert routing, and DNA relationship inference.

### 6.3 Core Rule
Social relationships drive access.

Biological relationships drive genetic logic.

These must never be automatically conflated.

## 7. Data Sharing Philosophy

Users should be able to share data at very precise levels.

Examples:

- Share medications with spouse
- Share emergency profile with child
- Share hereditary alert with biological relatives
- Share awareness alert with adopted relatives
- Share full records with caregiver
- Share only summaries with extended family
- Share dental history with a selected person
- Share mental health data with nobody by default

## 8. Context-Aware Messaging

Every message must be contextual.

The same health event may produce different messages for:

- Biological sibling
- Adopted sibling
- Spouse
- Child
- Parent
- Caregiver
- Cousin
- Clinician

Example:

A user reports a hereditary cancer marker.

Biological sibling receives genetic relevance language.

Adopted sibling receives support and awareness language.

Spouse receives care coordination language.

Child receives age-appropriate family awareness language.

## 9. Product Boundaries

FAMILIA should initially avoid regulated diagnostic claims.

The platform can:
- Aggregate data
- Summarize data
- Explain trends
- Help users organize medical history
- Enable consent-based sharing
- Generate non-diagnostic alerts
- Recommend professional follow-up language

The platform should not initially:
- Diagnose disease
- Claim to replace clinicians
- Automatically make treatment decisions
- Send hereditary alerts without user approval
- Reveal identity without consent
- Infer adoption/biological status to others without consent

## 10. Long-Term Vision

FAMILIA can evolve into a complete family health intelligence infrastructure:

- Personal health digital twin
- Family health graph
- AI-powered health history assistant
- Secure clinical export system
- Research-grade consent platform
- Interoperability hub for health data
- Privacy-first genetic communication layer



---

# Source File: 02_SYSTEM_ARCHITECTURE.md


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



---

# Source File: 03_API_SPEC.md


# FAMILIA — API Specification

## 1. API Design Principles

The API must be:

- Consent-aware by default
- Versioned
- Auditable
- Secure
- Explicit about data scopes
- Designed for mobile-first use
- Designed for future clinical integration

Base path:

`/api/v1`

## 2. Authentication

### POST /auth/register
Creates a new user account.

Request:
```json
{
  "email": "user@example.com",
  "password": "string",
  "first_name": "Ada",
  "last_name": "Okafor",
  "date_of_birth": "1990-01-01"
}
```

Response:
```json
{
  "user_id": "uuid",
  "status": "created",
  "mfa_required": true
}
```

### POST /auth/login
Authenticates user.

Request:
```json
{
  "email": "user@example.com",
  "password": "string"
}
```

Response:
```json
{
  "access_token": "jwt",
  "refresh_token": "jwt",
  "expires_in": 3600
}
```

### POST /auth/mfa/verify
Verifies MFA challenge.

### POST /auth/logout
Invalidates session.

## 3. User Profile

### GET /users/me
Returns current user profile.

### PATCH /users/me
Updates user profile.

Request:
```json
{
  "blood_type": "O+",
  "sex_at_birth": "female",
  "preferred_units": "imperial"
}
```

## 4. Family Graph

### POST /family/invites
Creates a temporary invite link.

Request:
```json
{
  "relationship_type": "spouse",
  "relationship_category": "social",
  "expires_in_minutes": 10,
  "requested_access_preset": "spouse_care_bundle"
}
```

Response:
```json
{
  "invite_id": "uuid",
  "link": "https://familia.app/invite/abc123",
  "expires_at": "2026-04-26T10:10:00Z"
}
```

### POST /family/invites/{invite_id}/accept
Accepts invite.

Request:
```json
{
  "accepted": true,
  "relationship_visibility": "private_to_participants"
}
```

### GET /family/tree
Returns user family graph.

Response:
```json
{
  "nodes": [],
  "edges": []
}
```

### POST /family/relationships
Manually creates relationship.

Request:
```json
{
  "related_user_id": "uuid",
  "relationship_type": "adopted_child",
  "relationship_category": "adopted",
  "is_genetic_link": false
}
```

### PATCH /family/relationships/{relationship_id}
Updates relationship metadata.

### DELETE /family/relationships/{relationship_id}
Removes relationship edge.

## 5. Consent

### POST /consents
Creates consent grant.

Request:
```json
{
  "recipient_user_id": "uuid",
  "data_scopes": [
    "medications.read",
    "allergies.read",
    "emergency_profile.read"
  ],
  "purpose": "care_support",
  "duration": "indefinite"
}
```

### GET /consents
Lists active consents.

### GET /consents/{consent_id}
Gets consent details.

### POST /consents/{consent_id}/revoke
Revokes consent.

### POST /consents/evaluate
Evaluates whether access is allowed.

Request:
```json
{
  "requesting_user_id": "uuid",
  "target_user_id": "uuid",
  "resource_type": "lab_result",
  "action": "read",
  "purpose": "care_support"
}
```

Response:
```json
{
  "allowed": true,
  "reason": "active_consent",
  "consent_id": "uuid"
}
```

## 6. Health Profile

### GET /health/profile
Returns high-level health profile.

### PATCH /health/profile
Updates baseline health profile.

## 7. Encounters

### POST /health/encounters
Creates encounter.

Request:
```json
{
  "encounter_type": "psychiatry",
  "provider_name": "Dr. Smith",
  "date": "2026-04-20",
  "reason": "medication follow-up",
  "notes": "User-entered summary",
  "documents": []
}
```

### GET /health/encounters
Lists encounters.

Query parameters:
- type
- start_date
- end_date
- provider
- source

### GET /health/encounters/{encounter_id}
Gets encounter.

### PATCH /health/encounters/{encounter_id}
Updates encounter.

### DELETE /health/encounters/{encounter_id}
Soft-deletes encounter.

## 8. Conditions

### POST /health/conditions
Creates condition.

### GET /health/conditions
Lists conditions.

### PATCH /health/conditions/{condition_id}
Updates condition.

## 9. Medications

### POST /health/medications
Creates medication entry.

Request:
```json
{
  "name": "Metformin",
  "dosage": "500 mg",
  "frequency": "twice daily",
  "status": "active",
  "prescriber": "Dr. Patel",
  "start_date": "2025-09-01"
}
```

### GET /health/medications
Lists medications.

### PATCH /health/medications/{medication_id}
Updates medication.

## 10. Allergies

### POST /health/allergies
Creates allergy.

### GET /health/allergies
Lists allergies.

## 11. Labs

### POST /health/labs
Creates lab panel/result.

### GET /health/labs
Lists lab results.

Query parameters:
- marker
- start_date
- end_date
- abnormal_only

### GET /health/labs/trends/{marker}
Returns trend for marker.

## 12. Documents

### POST /documents/upload
Uploads document.

Content type:
`multipart/form-data`

Metadata:
```json
{
  "document_type": "lab_report",
  "source": "manual_upload",
  "sensitivity": "medical"
}
```

### GET /documents
Lists documents.

### GET /documents/{document_id}
Gets document metadata.

### GET /documents/{document_id}/download
Secure download.

### POST /documents/{document_id}/extract
Starts OCR/extraction.

### GET /documents/{document_id}/extractions
Gets extracted structured data.

## 13. Wearables / IoT

### POST /wearables/connect
Connect source.

Request:
```json
{
  "source": "apple_health",
  "permissions": ["heart_rate", "sleep", "steps"]
}
```

### POST /wearables/batch
Uploads wearable batch.

Request:
```json
{
  "source": "apple_health",
  "metrics": [
    {
      "type": "heart_rate",
      "value": 72,
      "unit": "bpm",
      "timestamp": "2026-04-26T12:00:00Z"
    }
  ]
}
```

### GET /wearables/metrics
Reads metrics.

Query parameters:
- type
- start_date
- end_date
- granularity

## 14. Check-ins

### POST /checkins
Creates check-in.

Request:
```json
{
  "physical_score": 7,
  "mental_score": 6,
  "medical_score": 8,
  "symptoms": ["fatigue", "headache"],
  "free_text": "I feel better than yesterday."
}
```

### GET /checkins
Lists check-ins.

### GET /checkins/summary
Returns summary by date range.

## 15. AI Digital Twin

### POST /ai/summaries/generate
Generates summary.

Request:
```json
{
  "summary_type": "weekly",
  "date_range": {
    "start": "2026-04-20",
    "end": "2026-04-26"
  },
  "include": ["wearables", "checkins", "medications", "encounters"]
}
```

### GET /ai/summaries
Lists summaries.

### POST /ai/question
Ask question against user’s health record.

Request:
```json
{
  "question": "What changed in my sleep and mood this month?",
  "allowed_data_scopes": ["sleep.read", "checkins.read"]
}
```

## 16. Alerts

### POST /alerts/preview
Generates contextual alert preview.

Request:
```json
{
  "event_type": "hereditary_risk",
  "condition": "BRCA-related cancer risk",
  "recipient_ids": ["uuid1", "uuid2"],
  "disclosure_mode": "anonymous"
}
```

Response:
```json
{
  "previews": [
    {
      "recipient_id": "uuid1",
      "relationship_context": "biological_sibling",
      "message_variant": "genetic_relevance",
      "message": "A genetically related family member..."
    },
    {
      "recipient_id": "uuid2",
      "relationship_context": "adopted_sibling",
      "message_variant": "support_awareness",
      "message": "A family member has shared..."
    }
  ]
}
```

### POST /alerts/send
Sends approved alert.

Request:
```json
{
  "preview_id": "uuid",
  "approved": true
}
```

## 17. Export

### POST /exports
Creates export bundle.

Request:
```json
{
  "format": "pdf",
  "sections": ["medications", "allergies", "conditions", "labs"],
  "date_range": null
}
```

### GET /exports/{export_id}
Gets export status.

## 18. Audit

### GET /audit/logs
Returns audit log entries for current user.

Query:
- event_type
- start_date
- end_date
- actor



---

# Source File: 04_DATABASE_SCHEMA.md


# FAMILIA — Database Schema

## 1. Data Storage Strategy

FAMILIA should use multiple storage models because health data has different shapes.

Recommended storage:

- PostgreSQL for structured health data
- Graph database for family relationships
- TimescaleDB/InfluxDB for wearable time-series
- Object storage for documents
- Redis for sessions, caching, and temporary invite tokens
- Append-only audit/event store for compliance logs

## 2. PostgreSQL Core Tables

### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    first_name TEXT,
    last_name TEXT,
    date_of_birth DATE,
    sex_at_birth TEXT,
    gender_identity TEXT,
    blood_type TEXT,
    preferred_units TEXT DEFAULT 'imperial',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP
);
```

### user_profiles
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    ethnicity TEXT,
    emergency_notes TEXT,
    primary_language TEXT,
    timezone TEXT,
    privacy_level TEXT DEFAULT 'standard',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### health_conditions
```sql
CREATE TABLE health_conditions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    code_system TEXT,
    code TEXT,
    status TEXT,
    onset_date DATE,
    resolved_date DATE,
    severity TEXT,
    source TEXT,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### medications
```sql
CREATE TABLE medications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    generic_name TEXT,
    dosage TEXT,
    route TEXT,
    frequency TEXT,
    status TEXT,
    prescriber TEXT,
    pharmacy TEXT,
    start_date DATE,
    stop_date DATE,
    reason TEXT,
    side_effects TEXT,
    source TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### allergies
```sql
CREATE TABLE allergies (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    allergen TEXT NOT NULL,
    allergy_type TEXT,
    reaction TEXT,
    severity TEXT,
    first_observed DATE,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### encounters
```sql
CREATE TABLE encounters (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    encounter_type TEXT NOT NULL,
    provider_name TEXT,
    facility_name TEXT,
    location TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    reason_for_visit TEXT,
    summary TEXT,
    outcome TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    source TEXT,
    sensitivity_level TEXT DEFAULT 'medical',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

Encounter types should include:
- primary_care
- specialist
- dental
- vision
- psychiatry
- therapy
- emergency
- urgent_care
- telehealth
- surgery
- physical_therapy
- other

### labs
```sql
CREATE TABLE lab_results (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    panel_name TEXT,
    marker_name TEXT NOT NULL,
    loinc_code TEXT,
    value_numeric NUMERIC,
    value_text TEXT,
    unit TEXT,
    reference_low NUMERIC,
    reference_high NUMERIC,
    abnormal_flag TEXT,
    collected_at TIMESTAMP,
    resulted_at TIMESTAMP,
    lab_name TEXT,
    source TEXT,
    document_id UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### procedures
```sql
CREATE TABLE procedures (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    procedure_name TEXT NOT NULL,
    procedure_type TEXT,
    code_system TEXT,
    code TEXT,
    performed_at TIMESTAMP,
    provider_name TEXT,
    facility_name TEXT,
    outcome TEXT,
    complications TEXT,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### immunizations
```sql
CREATE TABLE immunizations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    vaccine_name TEXT NOT NULL,
    dose_number TEXT,
    administered_at DATE,
    provider_name TEXT,
    lot_number TEXT,
    manufacturer TEXT,
    next_due_date DATE,
    source TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### documents
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    file_name TEXT NOT NULL,
    document_type TEXT,
    storage_key TEXT NOT NULL,
    mime_type TEXT,
    file_size_bytes BIGINT,
    sensitivity_level TEXT,
    source TEXT,
    uploaded_at TIMESTAMP,
    extracted_status TEXT DEFAULT 'pending',
    checksum TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### checkins
```sql
CREATE TABLE checkins (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    checkin_type TEXT DEFAULT 'daily',
    physical_score INT,
    mental_score INT,
    medical_score INT,
    pain_score INT,
    energy_score INT,
    stress_score INT,
    sleep_quality_score INT,
    symptoms TEXT[],
    free_text TEXT,
    created_at TIMESTAMP
);
```

### consents
```sql
CREATE TABLE consents (
    id UUID PRIMARY KEY,
    grantor_user_id UUID REFERENCES users(id),
    recipient_user_id UUID REFERENCES users(id),
    purpose TEXT NOT NULL,
    data_scopes TEXT[] NOT NULL,
    access_level TEXT NOT NULL,
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP,
    revoked_at TIMESTAMP,
    revocation_reason TEXT
);
```

### alerts
```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    sender_user_id UUID REFERENCES users(id),
    event_type TEXT NOT NULL,
    condition_or_topic TEXT,
    disclosure_mode TEXT,
    approval_status TEXT DEFAULT 'pending',
    approved_at TIMESTAMP,
    created_at TIMESTAMP
);
```

### alert_recipients
```sql
CREATE TABLE alert_recipients (
    id UUID PRIMARY KEY,
    alert_id UUID REFERENCES alerts(id),
    recipient_user_id UUID REFERENCES users(id),
    relationship_context TEXT,
    message_variant TEXT,
    genetic_relevance_flag BOOLEAN DEFAULT FALSE,
    message_hash TEXT,
    delivery_status TEXT,
    delivered_at TIMESTAMP
);
```

### audit_logs
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    actor_user_id UUID,
    target_user_id UUID,
    event_type TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    action TEXT,
    decision TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL
);
```

## 3. Graph Database Model

### Nodes
- User
- FamilyUnit
- DNAProfile
- RelationshipGroup

### Edges
- BIOLOGICAL_PARENT_OF
- BIOLOGICAL_CHILD_OF
- BIOLOGICAL_SIBLING_OF
- ADOPTIVE_PARENT_OF
- ADOPTED_CHILD_OF
- STEP_PARENT_OF
- SPOUSE_OF
- GUARDIAN_OF
- CAREGIVER_OF
- COUSIN_OF
- EXTENDED_RELATIVE_OF
- DNA_MATCHED_WITH

### Edge Properties
```json
{
  "relationship_type": "adopted_child",
  "relationship_category": "adopted",
  "is_genetic_link": false,
  "confirmed_by_user": true,
  "visibility": "private_to_participants",
  "confidence_score": null,
  "created_at": "timestamp"
}
```

## 4. Time-Series Schema

Metric fields:
- user_id
- metric_type
- value
- unit
- timestamp
- source
- device_id
- confidence
- metadata

Example metrics:
- heart_rate
- hrv
- steps
- sleep_stage
- oxygen_saturation
- respiratory_rate
- body_temperature
- blood_pressure_systolic
- blood_pressure_diastolic
- glucose
- weight
- workout_energy

## 5. Object Storage Structure

Recommended bucket paths:

```text
/users/{user_id}/documents/{document_id}/original.pdf
/users/{user_id}/documents/{document_id}/preview.png
/users/{user_id}/documents/{document_id}/extracted.json
/users/{user_id}/exports/{export_id}/health_bundle.pdf
```

## 6. Indexing Strategy

Important indexes:

```sql
CREATE INDEX idx_conditions_user ON health_conditions(user_id);
CREATE INDEX idx_medications_user_status ON medications(user_id, status);
CREATE INDEX idx_labs_user_marker_date ON lab_results(user_id, marker_name, collected_at);
CREATE INDEX idx_encounters_user_date ON encounters(user_id, start_time);
CREATE INDEX idx_documents_user_type ON documents(user_id, document_type);
CREATE INDEX idx_consents_grantor_recipient ON consents(grantor_user_id, recipient_user_id);
CREATE INDEX idx_audit_actor_date ON audit_logs(actor_user_id, created_at);
```

## 7. Soft Delete Policy

Medical data should generally not be hard-deleted immediately.

Use:
- deleted_at
- retention policy
- user-visible removal
- export before deletion option
- compliance review for certain logs

## 8. Provenance Requirement

Every health record should include:
- source
- source_system
- created_by
- imported_at
- document_id if extracted from file
- confidence_score if AI-extracted
- user_verified flag

This is important because AI-extracted data must not be treated the same as clinician-verified data unless reviewed.



---

# Source File: 05_CONSENT_AND_ALERT_ENGINE.md


# FAMILIA — Consent and Context-Aware Alert Engine

## 1. Purpose

The Consent and Alert Engine is the core differentiator of FAMILIA.

Most health platforms focus on storing data. FAMILIA focuses on controlling how data moves between people, especially within family systems.

The engine must answer:

- Who can access this?
- What can they see?
- Why are they seeing it?
- How long can they see it?
- What should the message say?
- Should genetic relevance be included?
- Has the user approved this disclosure?
- Has this event been audited?

## 2. Consent Model

FAMILIA should use Attribute-Based Access Control (ABAC), not simple role-based access only.

Access decision inputs:

- Actor
- Target user
- Relationship category
- Relationship type
- Data type
- Data sensitivity
- Purpose
- Time window
- Consent status
- Emergency status
- Disclosure mode
- Recipient opt-in settings

## 3. Consent Scope Examples

### Emergency Profile
Includes:
- Name
- Age
- Emergency contacts
- Allergies
- Medications
- Major conditions
- Blood type
- Care instructions

### Spouse Care Bundle
Includes:
- Medications
- Allergies
- Conditions
- Encounters summary
- Labs summary
- Emergency notes

### Child / Dependent Management
Includes:
- Full record access
- Appointment tracking
- Medication tracking
- Immunizations
- Documents

### Hereditary Awareness
Includes:
- Condition/topic alert only
- No full medical record unless separately granted
- Optional anonymous mode

### Mental Health Restricted
Default:
- Private
- Explicit sharing only
- Separate consent category
- Stronger warning before sharing

## 4. Consent Lifecycle

### 4.1 Create Consent
User selects:
- Recipient
- Data categories
- Purpose
- Duration
- Disclosure detail
- Revocation options

### 4.2 Active Consent
Recipient can access only allowed data.

### 4.3 Revocation
User can revoke at any time.

### 4.4 Expiration
Time-limited consent automatically expires.

### 4.5 Audit
Every grant, access, change, and revocation is logged.

## 5. Relationship-Aware Alerting

All alert messages must be contextual.

The same event produces different messages for:

- Biological relative
- Adopted relative
- Step-relative
- Spouse
- Guardian
- Caregiver
- Minor child
- Adult child
- Clinician

## 6. Alert Event Types

### 6.1 Hereditary Risk Alert
Used for potential family-relevant inherited conditions.

Examples:
- BRCA-related cancer risk
- Lynch syndrome
- Familial hypercholesterolemia
- Sickle cell trait/disease
- Certain cardiac inherited conditions

Important:
This should be informational and should encourage professional follow-up.

### 6.2 General Health Update
Used for user-approved health updates.

Examples:
- New diagnosis
- Hospital admission
- Surgery completed
- Medication change

### 6.3 Wellness Trend Alert
Used for pattern-based notifications.

Examples:
- Sleep quality dropped
- Check-ins show worsening stress
- Activity fell sharply

### 6.4 Emergency Alert
Used for urgent user-approved or emergency-configured notifications.

Examples:
- Fall detected
- Emergency profile opened
- User pressed emergency notify
- Abnormal connected-device event, if supported

## 7. Message Variants

### 7.1 Biological Relative — Genetic Relevance
Example:
“A genetically related family member has approved sharing a hereditary health concern that may be relevant to your own screening decisions. This is not a diagnosis. Consider discussing this information with a qualified medical professional.”

### 7.2 Adopted / Non-Biological Relative — Support Awareness
Example:
“A family member in your network has approved sharing a health-related concern with you for awareness and support. This message does not imply inherited genetic risk.”

### 7.3 Spouse / Partner — Care Coordination
Example:
“Your spouse/partner has approved sharing a health update that may be relevant for care support, planning, or follow-up.”

### 7.4 Adult Child — Family Awareness
Example:
“A parent in your family network has approved sharing a health update that may be relevant for family awareness and care planning.”

### 7.5 Caregiver — Action-Oriented
Example:
“A person you support has approved sharing a health update that may require follow-up, monitoring, or care coordination.”

### 7.6 Clinician — Clinical Summary Mode
Example:
“The patient has shared a structured summary of recent health updates. Review the attached record bundle and source documents.”

## 8. Alert Workflow

1. Event is created or detected.
2. User chooses alert recipients.
3. Consent engine validates recipients.
4. System determines relationship context.
5. Alert engine selects message variant.
6. User sees a preview for each recipient type.
7. User approves.
8. Alert is sent.
9. Delivery is logged.
10. Message hash is stored for audit.

## 9. Approval Requirement

No sensitive alert should be sent without approval unless:

- The user configured emergency automation
- The recipient already has emergency access
- The system is operating under a legally valid caregiver/dependent workflow

For normal hereditary or medical alerts:
- Approval must be explicit
- Approval must be timestamped
- Message preview must be stored or hashed

## 10. Disclosure Modes

### Anonymous
Recipient sees:
“A family member...”

### Relationship-Only
Recipient sees:
“A biological sibling...”
or
“A parent...”

### Identified
Recipient sees:
“[Name] has shared...”

### Partial
Recipient sees:
“A close family member...”

Identity reveal should require:
- Sender approval
- Recipient acceptance if two-way reveal is involved

## 11. Adopted Relative Logic

Adopted relatives can receive alerts.

However:
- They should not receive genetic-risk wording unless there is a confirmed biological link.
- They may receive support, awareness, care, or family coordination messages.
- User can manually include them in any alert group.
- The message must not imply inherited risk by default.

## 12. DNA-Based Discovery

DNA discovery should be opt-in.

Rules:
- Only users who enabled discovery can be matched.
- Matches are suggestions, not forced relationships.
- DNA discovery cannot overwrite adopted/legal relationships.
- Unexpected parentage/adoption revelations must never be disclosed automatically.
- User controls whether to connect, hide, or ignore matches.

## 13. Policy Engine Pseudocode

```python
def evaluate_access(actor, target, resource, purpose):
    relationship = graph.get_relationship(actor, target)
    consent = consent_store.find_active_consent(
        grantor=target,
        recipient=actor,
        resource_scope=resource.scope,
        purpose=purpose
    )

    if resource.sensitivity == "mental_health" and not consent.explicit_sensitive:
        return Deny("Sensitive category requires explicit consent")

    if consent and consent.is_valid():
        return Allow("Active consent")

    if emergency_mode_enabled(actor, target, resource):
        audit("break_glass_access")
        return Allow("Emergency access")

    return Deny("No active consent")
```

## 14. Alert Message Selection Pseudocode

```python
def select_message_variant(event, recipient_context):
    if event.type == "hereditary_risk":
        if recipient_context.is_genetic_link:
            return "genetic_relevance"
        else:
            return "support_awareness"

    if recipient_context.relationship_type in ["spouse", "caregiver"]:
        return "care_coordination"

    if event.urgency == "emergency":
        return "emergency"

    return "general_awareness"
```

## 15. Audit Requirements

Each alert must log:
- Sender
- Recipient
- Alert type
- Relationship context
- Message variant
- Disclosure mode
- Approval timestamp
- Delivery status
- Message hash
- Consent policy version

## 16. Product Differentiator

The system does not send generic alerts.

It sends context-aware, consent-approved, relationship-specific communication.



---

# Source File: 06_AI_DIGITAL_TWIN.md


# FAMILIA — AI Digital Twin Specification

## 1. Purpose

The AI Digital Twin is the intelligence layer that turns fragmented health data into an understandable, living model of the user’s health.

It should help answer:

- What is my current health status?
- What has changed recently?
- What patterns are emerging?
- What should I remember to discuss with my doctor?
- What health events happened over time?
- What should my family/caregiver know if I approve sharing?
- How do my sleep, mood, activity, medications, and symptoms relate?

## 2. Core Principle

The AI Digital Twin is informational and organizational.

It should not diagnose, prescribe, or replace a clinician.

## 3. Inputs

### 3.1 Structured Medical Data
- Conditions
- Medications
- Allergies
- Labs
- Procedures
- Encounters
- Immunizations
- Care plans

### 3.2 Documents
- PDFs
- Medical reports
- Lab PDFs
- Discharge summaries
- Dental records
- Psychiatric notes
- Therapy notes
- Imaging reports

### 3.3 Wearable/IoT Data
- Heart rate
- HRV
- Sleep
- Activity
- Workouts
- Oxygen saturation
- Temperature
- Blood pressure
- Glucose

### 3.4 User Check-ins
- Physical status
- Mental status
- Medical concerns
- Symptoms
- Pain
- Energy
- Mood
- Stress
- Free-text notes

### 3.5 Family Context
- Biological relationships
- Social/caregiver relationships
- Shared alerts
- Family-reported condition patterns

## 4. Outputs

### 4.1 Daily Summary
A short summary of:
- Sleep
- Activity
- Mood
- Symptoms
- Medication adherence
- Notable changes

### 4.2 Weekly Summary
A broader trend summary:
- Improvements
- Declines
- Stable areas
- Questions to ask clinician
- Check-in patterns
- Wearable trends

### 4.3 Monthly Summary
A longitudinal review:
- Lab changes
- New encounters
- Medication changes
- Symptom trends
- Mental health patterns
- Fitness and sleep changes

### 4.4 Medical Timeline
AI-generated timeline of:
- Diagnoses
- Surgeries
- Hospitalizations
- medication changes
- major lab changes
- care events

### 4.5 Visit Preparation Summary
Before a doctor visit:
- Recent symptoms
- Current medications
- Relevant labs
- Questions to ask
- Recent changes
- Documents to bring

### 4.6 Caregiver Summary
When approved:
- Care-relevant updates
- Medication changes
- Appointments
- Emergency considerations
- Support needs

### 4.7 Family Alert Explanation
For approved alerts:
- Why recipient received it
- Whether it has genetic relevance
- Whether it is support-only
- What action is reasonable

## 5. AI Safety Rules

The AI must:

- Avoid diagnosis
- Avoid treatment instructions
- Avoid certainty when data is incomplete
- Identify data source
- Separate user-reported from clinician-reported data
- Separate wearable signals from clinical evidence
- Avoid genetic implications for non-biological relatives
- Warn when a topic requires professional evaluation
- Respect consent scope strictly
- Avoid revealing hidden relationship categories

## 6. RAG Architecture

Use retrieval-augmented generation.

Flow:
1. User asks question or summary is requested.
2. Consent engine determines allowed data.
3. Retrieval service fetches only permitted records.
4. AI receives source-grounded context.
5. AI generates summary.
6. Output includes provenance labels.
7. Summary stored with generation metadata.

## 7. AI Data Provenance Labels

Every AI output should distinguish:

- User-entered
- Wearable-derived
- Provider-imported
- Document-extracted
- AI-inferred
- Family-shared
- DNA-imported

Example:
“Your sleep trend is based on wearable data from Apple Health. Your fatigue reports are based on daily check-ins.”

## 8. Digital Twin Health Dimensions

The system should maintain a multidimensional health state:

### Physical
- Pain
- Energy
- Mobility
- Vitals
- Fitness
- Sleep

### Medical
- Conditions
- Medications
- Labs
- Procedures
- Encounters
- Follow-ups

### Mental
- Mood
- Anxiety/stress
- Depression indicators
- Therapy/psychiatry notes
- Sleep correlation

### Lifestyle
- Activity
- Nutrition
- Hydration
- Habits
- Recovery

### Family Context
- Relevant family health patterns
- Caregiver relationships
- Approved family alerts

## 9. Digital Twin Scoring

The system may use non-diagnostic status indicators.

Examples:
- Stability score
- Sleep consistency score
- Activity consistency score
- Medication adherence score
- Check-in trend status
- Care follow-up readiness

Avoid:
- “Cancer risk score” unless clinically validated and regulated
- Diagnosis prediction in early versions

## 10. Check-In Questions

### Daily
- How do you feel physically today?
- How do you feel mentally today?
- Any new symptoms?
- Pain level?
- Energy level?
- Sleep quality?
- Did you take your medications?

### Weekly
- What changed this week?
- Any doctor visits?
- Any new medications?
- Any worsening symptoms?
- Any major stressors?
- Any health goals?

### Monthly
- Any new diagnoses?
- Any labs or medical reports?
- Any hospital/urgent care visits?
- Any dental/vision/mental health visits?
- Any family health updates?

## 11. AI Summary Example

Weekly Summary:

“This week, your sleep duration decreased compared with your previous 4-week average, while your stress check-ins increased. You also reported headaches on 3 days. No new medications or encounters were added. This may be useful to mention at your next visit if it continues. This summary is based on wearable sleep data and self-reported check-ins.”

## 12. AI Memory

The AI should maintain structured long-term memory inside the user’s health model, not arbitrary conversational memory.

Examples:
- User has asthma
- User takes medication X
- User reports migraines monthly
- User has family history of colon cancer
- User prefers spouse to receive emergency alerts

## 13. Guardrails for Family Summaries

If sharing with family:
- Use only approved data scopes
- Remove restricted notes
- Avoid identity reveal unless approved
- Contextualize genetic relevance
- Use support wording for non-biological relatives

## 14. Future AI Capabilities

- Doctor visit auto-summary
- Document extraction validation
- Personalized health timeline
- Medical term simplification
- Caregiver briefings
- Risk communication support
- Smart reminders
- Pattern detection
- Clinical handoff packet generation



---

# Source File: 07_UI_UX_SPEC.md


# FAMILIA — UI/UX Specification

## 1. UX Philosophy

FAMILIA handles sensitive data. The design must feel:

- Trustworthy
- Calm
- Clear
- Human-centered
- Privacy-first
- Not overwhelming

The user should always understand:
- What data exists
- Who can see it
- Why they can see it
- What has been shared
- What has changed

## 2. Primary Applications

### Mobile App
Primary daily use:
- Check-ins
- Wearable sync
- Notifications
- Family alerts
- Quick access to health profile
- Emergency profile
- Document uploads via camera

### Web App
Management use:
- Full health profile
- Family tree
- Consent settings
- Documents
- Exports
- Timeline review
- Advanced settings

## 3. Core Navigation

Recommended tabs:

1. Home
2. Health
3. Family
4. Vault
5. Insights
6. Alerts
7. Settings

## 4. Home Dashboard

Should display:
- Current health snapshot
- Today’s check-in prompt
- Recent alerts
- Upcoming appointments
- Medication reminders
- Wearable sync status
- Recent documents
- AI summary card

Example cards:
- “Sleep dropped 18% this week”
- “2 medications active”
- “1 document needs review”
- “Spouse has emergency profile access”

## 5. Health Profile Screen

Sections:
- Overview
- Conditions
- Medications
- Allergies
- Labs
- Encounters
- Procedures
- Immunizations
- Dental
- Vision
- Mental health
- Documents
- Wearables
- DNA

Each section should show:
- Latest status
- Timeline
- Source
- Sharing status
- Add/edit button

## 6. Complete Medical Timeline

Timeline filters:
- All events
- Doctor visits
- Labs
- Medications
- Surgeries
- Dental
- Vision
- Mental health
- Documents
- Wearables
- Family alerts

Each event card:
- Date
- Type
- Title
- Source
- Summary
- Linked documents
- Sharing status

## 7. Family Tree UI

The family tree must support:
- Biological relationships
- Adopted relationships
- Step relationships
- Guardianship
- Spouse/partner
- Extended family

Visual conventions:
- Solid line = biological
- Dashed line = adopted/legal
- Dotted line = inferred/unconfirmed DNA
- Shield icon = has access
- Bell icon = can receive alerts
- Lock icon = restricted data

User must be able to:
- Add relative manually
- Generate invite link
- Accept/decline links
- Assign relationship type
- Set biological/genetic status
- Hide relationship type from others
- Review consent per person

## 8. Add Relative Flow

Steps:
1. Select method:
   - Manual
   - Invite link
   - DNA discovery
2. Choose relationship:
   - spouse
   - child
   - adopted child
   - sibling
   - cousin
   - nephew/niece
   - guardian
   - custom
3. Choose visibility:
   - private
   - visible to family
   - visible only to both parties
4. Choose access preset:
   - no access
   - emergency only
   - care bundle
   - custom
5. Confirm

## 9. Expiring Link ID Flow

User action:
- Generate link
- Link expires in 10 minutes
- Link is single-use

Recipient:
- Opens link
- Reviews request
- Creates account or signs in
- Accepts relationship
- Reviews requested access
- Accepts or modifies permissions

## 10. Consent UX

Consent should be visual and understandable.

For each person, show:
- What they can see
- What they cannot see
- Why they have access
- When access expires
- Last time they accessed data
- Revoke button

Use plain language.

Example:
“Your spouse can see medications, allergies, emergency notes, and upcoming appointments. They cannot see mental health notes or DNA data.”

## 11. Alert Preview UX

Before sending alerts:
- Show recipients grouped by message type
- Show exact message preview
- Show disclosure mode
- Show genetic relevance
- Show warning for sensitive alerts
- Require explicit approval

Example groups:
- Biological relatives: genetic relevance message
- Adopted relatives: awareness/support message
- Spouse/caregiver: care coordination message

## 12. Check-In UX

Daily check-in should be fast.

Example:
- Physical: 1–10
- Mental: 1–10
- Medical: 1–10
- Pain: 1–10
- Energy: 1–10
- Symptoms: chips
- Free text: optional

Weekly check-in:
- Longer reflection
- New visits
- Medication changes
- New documents

Monthly check-in:
- Full health review
- Major changes
- Summary generation

## 13. Vault UX

Document vault sections:
- All documents
- Labs
- Medical records
- Dental
- Vision
- Mental health
- Prescriptions
- Imaging
- Insurance
- Exports

Upload options:
- Camera scan
- File upload
- Email-to-vault later
- Provider import later

Document card:
- Title
- Type
- Date
- Source
- Extracted status
- Linked health records
- Sharing status

## 14. Insights UX

Insight categories:
- Daily
- Weekly
- Monthly
- Sleep
- Fitness
- Mood
- Labs
- Medications
- Medical timeline
- Family context

Each insight should show:
- Summary
- Data source
- Confidence/provenance
- Not medical advice note
- Share option

## 15. Emergency Mode UX

Emergency profile:
- Allergies
- Medications
- Conditions
- Emergency contacts
- Blood type
- Care instructions
- QR code option
- Last updated date

Emergency access must be logged.

## 16. Settings UX

Sections:
- Account
- Security
- Privacy
- Consent
- Family visibility
- Data sources
- Notifications
- AI settings
- Export/delete data

## 17. UX Safety Requirements

- Never surprise the user with sharing
- Always show who can see what
- Always preview alerts
- Use extra confirmation for mental health, DNA, and sensitive data
- Clearly distinguish biological and social relationships
- Never reveal adoption/genetic status automatically



---

# Source File: 08_SECURITY_COMPLIANCE.md


# FAMILIA — Security, Privacy, and Compliance Specification

## 1. Security Philosophy

FAMILIA handles highly sensitive data. Health data and DNA data are not like normal application data. If compromised, they can affect the user and their relatives permanently.

Security must be foundational, not added later.

## 2. Data Sensitivity Categories

### Standard
- Basic profile
- Preferences

### Medical
- Conditions
- Medications
- Labs
- Encounters
- Documents

### Highly Sensitive
- Mental health
- Psychiatric notes
- Reproductive health
- Genetic/DNA data
- Substance use
- Family relationship status
- Adoption/biological relationship information

### Emergency
- Allergies
- Medications
- Major conditions
- Emergency contacts

## 3. Authentication

Requirements:
- MFA
- Device trust
- Session expiration
- Refresh token rotation
- Secure password storage
- Biometric unlock on mobile
- Risk-based login prompts

## 4. Authorization

Use:
- Attribute-Based Access Control
- Relationship context
- Consent grants
- Data sensitivity
- Purpose limitation

Never rely only on simple roles.

## 5. Encryption

### In Transit
- TLS 1.2 minimum
- TLS 1.3 preferred

### At Rest
- AES-256
- Database encryption
- Object storage encryption

### Field-Level Encryption
Required for:
- DNA/genomic data
- Mental health notes
- Reproductive health
- Sensitive documents
- Relationship hidden status

## 6. Key Management

Use:
- Cloud KMS
- Separate keys by environment
- Key rotation
- Access logging
- No hardcoded secrets

## 7. Audit Logging

Must log:
- Login
- Failed login
- Data viewed
- Data exported
- Consent granted
- Consent revoked
- Alert approved
- Alert sent
- Relationship changed
- Emergency access
- Document downloaded

Audit logs should be:
- Append-only
- Tamper-evident
- Searchable by user
- Available in user privacy dashboard

## 8. HIPAA Posture

FAMILIA may begin as a consumer-controlled PHR. However, once it integrates with healthcare providers, health plans, or covered entities, HIPAA obligations may apply.

Prepare for:
- Business Associate Agreements
- HIPAA Security Rule controls
- Breach notification process
- Minimum necessary access
- Audit controls
- Administrative safeguards
- Technical safeguards
- Physical safeguards if infrastructure applies

## 9. Consent and Privacy

Consent must be:
- Explicit
- Granular
- Revocable
- Auditable
- Understandable
- Purpose-limited

The user must be able to see:
- Who has access
- What they can access
- When they accessed it
- How to revoke it

## 10. DNA and Family Privacy

High-risk areas:
- Unexpected parentage
- Adoption disclosure
- Unknown siblings
- Family conflict
- Hereditary disease anxiety
- Genetic discrimination concerns

Rules:
- DNA discovery is opt-in.
- No automatic relationship disclosure.
- Adoption/biological status is private by default.
- DNA match suggestions require user confirmation.
- Hereditary alerts require user approval.
- Non-biological relatives receive support/awareness wording unless genetic link is confirmed.

## 11. AI Safety

AI must:
- Use only permitted data
- Respect consent
- Avoid diagnosis
- Avoid treatment instructions
- Show source/provenance
- Use cautious language
- Recommend professional consultation for clinical concerns
- Avoid revealing hidden relationship details

## 12. Data Deletion

Users should be able to:
- Delete documents
- Remove records
- Revoke consent
- Export their data
- Close account

System should:
- Soft-delete first
- Retain required audit logs
- Clearly explain what cannot be deleted immediately due to compliance or security logging

## 13. Data Portability

Export formats:
- PDF summary
- JSON
- CSV for selected data
- FHIR bundle in later phases

## 14. Breach Response

Required process:
1. Detect
2. Contain
3. Assess scope
4. Notify affected users
5. Notify authorities if required
6. Rotate keys/secrets
7. Publish post-incident remediation
8. Improve controls

## 15. Security Testing

Required:
- Penetration testing
- Static application security testing
- Dependency scanning
- Secret scanning
- Container scanning
- API fuzzing
- Threat modeling
- Access control testing
- Audit log validation

## 16. Compliance Roadmap

### Phase 1
- Privacy-first architecture
- Secure auth
- Encryption
- Audit logging
- User consent controls

### Phase 2
- HIPAA readiness review
- Vendor BAA review
- Formal security policies

### Phase 3
- SOC 2 readiness
- HIPAA-aligned operations
- Formal incident response

### Phase 4
- Clinical and enterprise compliance
- Research data governance
- Advanced privacy-preserving analytics



---

# Source File: 09_MVP_ROADMAP.md


# FAMILIA — MVP and Roadmap

## 1. MVP Strategy

The MVP should prove the core product thesis:

> People need one place to organize their health data and selectively share contextual health information with family.

The MVP should avoid:
- Full DNA processing
- Heavy clinical claims
- Complex provider integrations
- Regulated diagnosis features

The MVP should include:
- Account creation
- Family graph
- Manual health profile
- Document vault
- Wearable import/basic sync
- Check-ins
- Consent sharing
- Context-aware alerts
- AI summaries

## 2. MVP Core Features

### 2.1 Identity
- Register/login
- MFA
- Profile setup
- Security settings

### 2.2 Health Profile
- Conditions
- Medications
- Allergies
- Surgeries/procedures
- Labs manual entry
- Encounters
- Dental
- Vision
- Mental health entries
- Emergency profile

### 2.3 Family Graph
- Add family manually
- Invite by 10-minute link
- Relationship type/category
- Biological vs adopted/social distinction
- Visibility settings

### 2.4 Consent
- Emergency access preset
- Spouse/caregiver preset
- Custom data sharing
- Revoke access
- Access audit

### 2.5 Document Vault
- Upload documents
- Tag document type
- Attach to encounter
- Basic OCR later in MVP

### 2.6 Check-ins
- Daily/weekly/monthly
- Physical/mental/medical score
- Symptoms
- Notes

### 2.7 Alerts
- Create alert
- Select recipients
- Preview contextual messages
- Approve and send
- Audit log

### 2.8 AI
- Weekly summary
- Visit summary
- Health timeline summary
- Question answering over user-approved data

## 3. Phase 1 — Prototype

Timeline: 8–12 weeks

Goals:
- Clickable product
- Core database
- Auth
- Health profile CRUD
- Family graph CRUD
- Consent UI
- Alert preview

Deliverables:
- React Native app shell
- Web dashboard
- Backend API
- PostgreSQL schema
- Basic graph model
- Document upload
- Manual check-ins

## 4. Phase 2 — MVP

Timeline: 3–6 months

Goals:
- Usable beta product
- Family invite links
- Consent engine
- Basic AI summaries
- Wearable data import
- Audit logs
- Export PDF

Deliverables:
- Mobile app beta
- Web app beta
- Consent engine v1
- Alert engine v1
- Health vault
- Check-ins
- Weekly AI summary

## 5. Phase 3 — Health Integrations

Timeline: 6–12 months

Goals:
- Provider data ingestion
- FHIR support
- Better wearable support
- OCR extraction
- Structured data review

Deliverables:
- FHIR connector v1
- Apple Health/Google Fit/Health Connect pipeline
- Document OCR
- Lab trend charts
- Medication adherence tracking

## 6. Phase 4 — DNA and Genetic Discovery

Timeline: 12–18 months

Goals:
- DNA import
- DNA matching for opted-in users
- Biological graph support
- Hereditary alert logic

Deliverables:
- DNA import parser
- Variant storage
- DNA discovery opt-in
- Genetic relevance alert rules
- Privacy controls for unexpected matches

## 7. Phase 5 — Clinical / Enterprise

Timeline: 18+ months

Goals:
- Provider portal
- Caregiver workflows
- Clinical handoff
- B2B partnerships
- Research consent platform

Deliverables:
- Clinician portal
- FHIR export
- Care plans
- Research consent
- Enterprise security

## 8. Team Needed

### MVP Small Team
- Full-stack engineer
- Mobile engineer
- Backend/data engineer
- UI/UX designer
- Security/privacy advisor
- Clinical advisor
- Legal/compliance advisor

### Later Team
- Health informatics specialist
- Genetic counselor advisor
- ML engineer
- DevOps engineer
- Compliance officer
- Product manager

## 9. Initial Build Priorities

Priority order:

1. Identity/auth
2. Health profile data model
3. Family graph
4. Consent engine
5. Alerts
6. Document vault
7. Check-ins
8. AI summaries
9. Wearable sync
10. FHIR/DNA later

## 10. Success Metrics

### Activation
- User completes health profile
- User adds at least one family member
- User uploads at least one document
- User completes first check-in

### Engagement
- Weekly check-ins
- Document uploads
- Wearable sync
- AI summary views

### Network Effect
- Average relatives invited per user
- Consent grants per family group
- Alert usage

### Trust
- Low consent revocation due to confusion
- Low privacy complaints
- Clear user understanding of sharing settings

## 11. MVP Non-Goals

Do not build first:
- In-house DNA testing
- Diagnosis engine
- Insurance billing
- Full EHR replacement
- Medical advice chatbot
- Broad B2B enterprise sales



---

# Source File: 10_DOCKER_MICROSERVICES_PLAN.md


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



---

# Source File: 11_BUSINESS_AND_MONETIZATION.md


# FAMILIA — Business and Monetization Strategy

## 1. Market Thesis

Health data is fragmented and family health communication is poorly structured.

Consumers already use:
- Doctor portals
- Lab portals
- Pharmacy apps
- Apple Health / Google Fit
- Fitness trackers
- Dental offices
- Mental health platforms
- Paper/PDF records
- Family text messages
- DNA platforms

But these systems do not form a single unified, family-aware health intelligence layer.

## 2. Core Market Position

FAMILIA is positioned as:

> A privacy-first family health intelligence platform that unifies personal health data, wearable signals, medical records, and family health communication.

## 3. Differentiation

### Existing Health Apps
Usually individual-focused.

### EHR Portals
Provider-focused, fragmented by provider.

### Wearable Apps
Signal-focused, not full medical history.

### DNA Platforms
Genetics-focused, not complete health profile.

### FAMILIA
Family-centered, consent-aware, context-aware, full-profile health intelligence.

## 4. Core Moats

### 4.1 Family Graph
As users invite family, the platform gains network effect.

### 4.2 Consent Engine
Fine-grained, auditable sharing is hard to replicate.

### 4.3 Longitudinal Health Profile
The longer a user stays, the more valuable the health timeline becomes.

### 4.4 Trust Layer
Privacy-first architecture becomes a brand moat.

### 4.5 Context-Aware Communication
Relationship-specific health messaging is a strong differentiator.

## 5. Revenue Models

### 5.1 Freemium
Free:
- Basic profile
- Limited records
- Limited family members
- Basic check-ins

Paid:
- Unlimited records
- Advanced sharing
- AI summaries
- Export bundles
- Family graph expansion
- Advanced alerts

### 5.2 Family Plan
Monthly subscription for family groups.

Example:
- Individual: $9/month
- Family: $19–29/month
- Premium family: $49/month

### 5.3 Caregiver Plan
For adult children managing aging parents.

Features:
- Medication tracking
- Appointment summaries
- Emergency profile
- Care notes
- Shared calendar

### 5.4 Clinical Export / Concierge
Paid one-time or subscription:
- Doctor visit packets
- Medical history summaries
- PDF export
- Timeline generation

### 5.5 B2B Later
- Care coordination companies
- Concierge medicine
- Functional medicine
- Senior care
- Employer wellness, with strict privacy boundaries
- Research organizations, with explicit consent only

## 6. Go-To-Market Strategy

### Phase 1: Family Health Organizer
Target:
- Parents
- Caregivers
- People managing chronic conditions
- Adult children caring for parents
- Families with complex medical history

Message:
“Organize your health and safely share what matters with family.”

### Phase 2: Health Data + Wearables
Target:
- Fitness/wellness users
- Biohackers
- Smartwatch users
- Chronic condition monitoring users

Message:
“Connect your daily health signals to your full medical story.”

### Phase 3: Family Alerts and Hereditary Awareness
Target:
- Families with cancer history
- Families with inherited conditions
- DNA data users

Message:
“Share hereditary health awareness without losing privacy.”

### Phase 4: Provider/Care Partnerships
Target:
- Clinics
- Senior care groups
- Care coordinators
- Direct primary care

Message:
“Receive cleaner patient histories and family-supported care context.”

## 7. MVP Market Wedge

Best initial wedge:

> A family health vault and emergency/caregiver sharing app.

This avoids heavy DNA regulation early while proving the family health graph and consent model.

## 8. Expansion Path

1. Health vault
2. Family sharing
3. AI summaries
4. Wearable integration
5. Provider import
6. DNA import
7. Hereditary alerts
8. Clinical/research partnerships

## 9. Brand Positioning

Name:
FAMILIA

Meaning:
Family Accountable Medical & Intelligence Link Architecture

Tagline:
Your Health. Your Family. Your Control.

Brand attributes:
- Secure
- Human
- Intelligent
- Calm
- Trustworthy
- Family-centered

## 10. Risks

### Trust Risk
Users may fear health data misuse.

Mitigation:
- Clear privacy policy
- No data sale by default
- Explicit consent
- Audit dashboard

### Regulatory Risk
Clinical claims may trigger oversight.

Mitigation:
- Informational framing
- Medical professional review
- No diagnosis in MVP

### Adoption Risk
Family graph requires multiple users.

Mitigation:
- Useful even as solo health vault
- Invite flows
- Caregiver use cases

### Integration Risk
FHIR and wearable APIs vary.

Mitigation:
- Start manual + file upload
- Add integrations gradually

## 11. Why This Could Be Large

FAMILIA has billion-dollar potential if it becomes the trusted family health graph.

The value is not just health records.

The value is:
- Identity
- Consent
- Relationships
- Longitudinal data
- AI summaries
- Family communication
- Trust infrastructure

If executed correctly, FAMILIA becomes the control layer for personal and family health data.
