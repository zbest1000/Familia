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
