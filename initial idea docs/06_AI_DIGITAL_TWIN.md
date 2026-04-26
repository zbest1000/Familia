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
