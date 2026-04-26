# FAMILIA — Data Ingestion Playbook

Getting data **in** is the single hardest UX problem FAMILIA faces. Users will not type their entire medical history into a form. Doctors will not adopt our portal in year one. Each ingestion path has its own UX, latency, accuracy, dedupe, and trust profile. This playbook covers the five paths the MVP supports.

| Path | When | Friction | Accuracy |
|---|---|---|---|
| Manual entry | Always available | High | High (user-curated) |
| Document upload + OCR | Existing PDFs / paper records | Medium | Medium (needs review) |
| Wearable / phone health | Continuous biosignals | Low (after setup) | Variable by device |
| Family-shared in-flow | Records flow from a relative who shared with you | Low | High (curated by sharer) |
| Provider FHIR import | Phase 3 — direct from EHR | Low (after auth) | High when supported |

## 1. Manual entry

### 1.1 Principles
- Forms must be **forgiving**. Every field is optional except a single identifier (name, date, or category).
- **Autocomplete from clinical vocabularies** without forcing them. Snomed CT / ICD-10 / RxNorm / LOINC suggestions appear as chips, but free text is always preserved alongside the structured code.
- **Preserve uncertainty**. "I think it was 2019" is a valid date. We store `date_uncertainty` flags.
- **Never block the save** because a structured code wasn't matched.

### 1.2 Add a medication — concrete shape
Inputs (in order shown to user):
1. Name (autocomplete from RxNorm, but free text accepted)
2. Dose (free text + unit suggestion)
3. Frequency (chip suggestions: once daily, twice daily, as needed, etc.; free text accepted)
4. Started (approximate date OK)
5. Why (free text or condition link)
6. Prescriber (optional)
7. Pharmacy (optional)
8. Notes (free text)

Saved structured fields:
- `name` (raw), `name_normalized` (RxNorm if matched), `dose_text`, `dose_value`, `dose_unit`, `frequency_text`, `frequency_normalized`, `start_date`, `start_date_confidence`, `reason_text`, `prescriber_text`, `pharmacy_text`, `notes`, `source: manual`, `entered_by_user_id`, `entered_at`

### 1.3 Add a condition — concrete shape
Inputs:
1. Name (autocomplete SNOMED / ICD)
2. Status (active / resolved / in remission / unknown)
3. Onset (approximate)
4. Severity (mild / moderate / severe / unknown)
5. Diagnosed by (optional)
6. Notes

### 1.4 Quick add (one-tap entries)
For frequent additions — e.g., a one-off urgent care visit. Single input ("what happened?") plus date defaulting to today. Categorize later or never.

### 1.5 Voice input
For any free-text field. Whisper or similar on-device or server. User reviews transcript before save.

## 2. Document upload + OCR

The most common path for getting historical data in. The pipeline:

```
Capture → Save raw → Pre-classify → OCR → Extract → Stage → User review → Promote
```

### 2.1 Capture
- Mobile: camera with edge detection, multi-page support, manual snap fallback.
- Web: drag-and-drop, batch upload.
- Both: photo from gallery, file picker, "share to FAMILIA" iOS share sheet.
- Future: email-to-vault address (e.g., `vault+abc123@familia.app`).

### 2.2 Save raw
- Original file is encrypted at upload (client-side wrapping recommended in later phases; server-side AES-256 at rest at minimum from day one).
- Stored in object storage with metadata: filename, mime, size, capture source, capture timestamp, user id.
- Original is **never modified or replaced** by extraction.

### 2.3 Pre-classify
- Lightweight classifier on first page determines: lab report, imaging report, discharge summary, prescription, dental, vision, insurance, generic medical, generic non-medical.
- The user sees the suggestion and can override with one tap.

### 2.4 OCR
- Standard OCR (e.g., AWS Textract, Google Document AI, or Tesseract for self-hosted).
- Multi-column layouts (lab reports especially) require structured table extraction.
- Confidence scores stored per text block.

### 2.5 Extract
- LLM (with strict structured output) extracts known fields based on document type. For a lab report:
  - Specimen date, collected at, ordered by
  - Per analyte: name, value, unit, reference range, flag (high/low/critical)
- For a discharge summary:
  - Admission date, discharge date, primary diagnosis, secondary diagnoses, procedures, discharge medications, follow-up instructions
- Each extracted field has a `confidence` score and a `source_span` pointing back to the original document for audit.
- The model is prompted to **never hallucinate** fields and to leave a field null if not present.

### 2.6 Stage
- Extracted fields are placed in a **staging area**, not directly into the user's record. This is critical: hallucinated or misread values must not silently appear in the timeline.
- The user receives a "Document ready to review" notification.

### 2.7 User review
- Side-by-side: original document on one side, extracted fields on the other.
- Each field shows confidence (with a small visual indicator).
- User can: accept, edit, reject, mark "I'll do this later" (back to staging).
- For high-confidence fields above a threshold (e.g., >0.95), show a "Accept all confident fields" shortcut.

### 2.8 Promote
- Accepted fields become structured records (labs, encounters, etc.) with `source: ocr_extracted_reviewed`.
- Original document remains attached.
- Audit log entry.

### 2.9 Dedupe and conflicts
- If the extracted lab matches a recently-imported wearable or another lab → flag as possible duplicate, ask user to confirm.
- If the extracted med doesn't match an existing active med → suggest as new; user can also link it to an existing med to update dose.

### 2.10 Failure modes
- OCR returns empty: document still saved; staging shows "We couldn't read text. Save as a file?"
- Extraction returns nothing recognized: document saved; user can manually add to a section and link the doc.
- Wrong document type: user changes type; pipeline re-runs.

## 3. Wearable / phone-collected health

### 3.1 Supported sources (priority order — see [11_OPEN_QUESTIONS](11_OPEN_QUESTIONS.md) for sequencing)
1. Apple Health (HealthKit) — iOS
2. Google Health Connect — Android
3. Fitbit — multi-platform (OAuth)
4. Garmin Health — OAuth
5. Oura — OAuth
6. Future: Withings, Whoop, Polar, CGMs (Dexcom, Libre)

### 3.2 Connect flow
See [Flow 7 in 03_TASK_FLOWS](03_TASK_FLOWS.md). Key principles:
- FAMILIA explains what it wants and why **before** the OS permission sheet.
- Connect requests **read-only** access; write-back is never default.
- Connect requests the **minimum useful** data types (heart rate, HRV, sleep, steps, workouts, blood oxygen, body temp). Not everything HealthKit offers.

### 3.3 Sync architecture
- On mobile: background fetch when the OS allows; foreground full sync when app open.
- Initial sync: up to 90 days of historical data by default; user can extend to all-time.
- Subsequent: delta sync.
- Failure: silent retry, then surface in Settings → Connected devices with last-success timestamp.

### 3.4 Data normalization
- Time-series data goes to TimescaleDB / InfluxDB (per architecture doc).
- Each sample tagged with `source` (HealthKit, Garmin, etc.) and `device_id` if known.
- Daily/weekly aggregates pre-computed for fast trend rendering.

### 3.5 Conflict resolution between sources
- If user has both Apple Health and a Garmin connected and both report heart rate: apply preference (user-set in Settings → Wearables → "Primary source for [signal]").
- Default preference: most recently connected source.

### 3.6 Privacy posture for wearable data
- Wearable data is `Standard` tier by default but lives in its own visibility scope.
- Care bundle includes **weekly aggregates** of wearable data, not raw samples.
- Family members never see raw samples without explicit per-share consent.

## 4. Family-shared inbound data

### 4.1 What this means
A relative who has shared with the user (e.g., Maya's mom Elena shared her med list with Maya as a caregiver) results in records appearing in Maya's view of Elena's profile. These are **not** Maya's records — they are Maya's **read access to Elena's records**.

### 4.2 Storage
- Maya does not get a copy. She gets a permissioned view.
- If Elena revokes, Maya loses the view in 5 seconds.
- If Maya wants to keep a record (e.g., as a family history note for herself), she explicitly **copies** it into her own profile via "Save to my profile". This creates a derived record with attribution.

### 4.3 Family history derivation
- When a relative tags a condition as relevant family history (e.g., Maya marks Elena's heart attack as relevant), this can — with explicit user action — appear in Maya's "Family medical history" section.
- This is **never** automatic.

## 5. Provider FHIR import (phase 3, but designed in now)

### 5.1 Architecture
- Use OAuth-based connections per provider. Most major US EHRs support SMART-on-FHIR.
- Aggregator option (e.g., 1upHealth, Particle Health, Validic) reduces per-provider work but adds a vendor.
- Decision pending — see [11_OPEN_QUESTIONS](11_OPEN_QUESTIONS.md).

### 5.2 What we pull
- Conditions (Condition resource)
- Medications (MedicationStatement, MedicationRequest)
- Allergies (AllergyIntolerance)
- Encounters (Encounter)
- Procedures (Procedure)
- Observations / labs (Observation)
- Immunizations (Immunization)
- Documents (DocumentReference)

### 5.3 Reconciliation
- FHIR data may overlap with manually-entered data and OCR-extracted data.
- Reconciliation engine surfaces conflicts:
  - "Your manually-entered med 'Lipitor' matches the FHIR record for 'atorvastatin'. Combine?"
  - "FHIR shows last A1c on 3/14; you uploaded a 3/14 lab PDF. Combine?"
- Default for reconciliation: **propose, don't auto-merge**. User confirms.

### 5.4 Source of truth
- Each record carries a `source` field with values: `manual`, `ocr_extracted_reviewed`, `wearable`, `family_shared`, `fhir_import:<provider>`.
- The UI always shows source.
- For conflicting values from different sources, show both with provenance and let the user pick or annotate.

## 6. Cross-cutting concerns

### 6.1 Source-of-truth labels
Every record carries provenance. The AI digital twin uses this in its summaries: "Your sleep trend is from your Apple Watch. Your fatigue check-ins are from you. Your last A1c is from a lab PDF you uploaded."

### 6.2 Dedupe rules (heuristics, with user confirm)
- **Medications**: same generic name + overlapping dates → propose dedupe.
- **Labs**: same analyte + same specimen date (±1 day) → propose dedupe.
- **Encounters**: same provider + same date → propose dedupe.
- **Documents**: same hash → auto-dedupe; same filename + date → propose.
- **Conditions**: same SNOMED code → propose merge of timelines.

### 6.3 Normalization
| Field | Normalization |
|---|---|
| Med names | RxNorm |
| Lab analytes | LOINC |
| Conditions | SNOMED CT preferred; ICD-10 retained |
| Allergens | RxNorm + UNII |
| Procedures | CPT + SNOMED |
| Units | SI by default; user preference toggle for imperial / US conventions |

### 6.4 Provenance — what we store with every record
- `source` (enum)
- `original_id` (vendor / provider / document id if applicable)
- `imported_at` (timestamp)
- `imported_by` (user id or system id)
- `confidence` (0.0–1.0 if AI-extracted; null if manual)
- `source_artifact_link` (pointer to original document, FHIR resource, wearable sample, etc.)
- `version` (record-level versioning for edits)

### 6.5 Versioning and edits
- Records are **versioned**, not overwritten. The user can see "edited 3 times" with a history.
- Critical fields (med dose, allergy severity) show edit history inline.
- Family members with read access see only the latest version, but can request "see edit history" if granted.

### 6.6 Soft delete and hard delete
- **Soft delete** (default): record marked deleted, hidden from views, recoverable for 30 days.
- **Hard delete** (user-initiated, requires confirmation): record removed from active storage; only audit-log scaffolding (record id + delete timestamp + actor) retained.
- A user can hard-delete any of their own records. Family members lose their view immediately on soft delete.

## 7. Quality flags

The system tags records with quality issues for the user to act on:
- `unverified` — manually entered, no source document.
- `low_confidence_extraction` — OCR or LLM confidence below threshold.
- `stale` — wearable data not synced in >7 days.
- `conflict` — value disagrees with another source.
- `awaiting_review` — in OCR staging, not yet promoted.
- `family_shared_view_only` — visible because someone shared with you, not yours to edit.

These appear in the UI as small chips, not warnings. They inform; they don't alarm.

## 8. Acceptance criteria

- Given a manually entered medication, then it appears in the user's medication list within 1 second of save.
- Given a 1-page lab PDF uploaded on mobile, then OCR + extraction completes in under 60 seconds and appears in the staging review queue.
- Given the user accepts an extracted lab, then it appears in lab trends within 5 seconds.
- Given a connected wearable, then a delta sync completes within 10 seconds when the app comes to foreground.
- Given two records suspected of being duplicates, then the dedupe prompt is shown without merging until the user confirms.
- Given an FHIR import (when available), then conflicts with existing data are surfaced for review, never silently merged.
- Given a hard delete, then the record is removed from all active queries within 5 seconds and from caches within 24 hours.
