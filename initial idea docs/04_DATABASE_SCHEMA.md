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
