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
