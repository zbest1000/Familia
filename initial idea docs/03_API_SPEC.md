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
