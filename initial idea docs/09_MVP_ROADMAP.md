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
