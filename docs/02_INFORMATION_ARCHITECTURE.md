# FAMILIA — Information Architecture

Concrete sitemap for both surfaces. The original UX spec listed seven tabs but didn't enumerate every screen, modal, or sheet. This doc does, and decides which surface each lives on.

## 1. Surface principles

- **Mobile is the daily surface**. Anything that can happen in under 60 seconds belongs on mobile first.
- **Web is the management surface**. Anything that requires reading, comparing, organizing, or fine-grained permissioning belongs on web.
- **Both surfaces share state**. There is no "mobile-only" data. Anything captured on one is reflected on the other within a few seconds.
- **Some screens are mobile-only by design** (camera scan, lock-screen emergency, biometric unlock).
- **Some screens are web-only by design** (multi-document review, family tree visualization, audit log explorer, data export).
- **The information architecture must work in low-text-literacy and large-type modes** without losing functionality.

## 2. Top-level navigation

### Mobile (bottom tab bar — 5 tabs max)

| Tab | Purpose | Default landing screen |
|---|---|---|
| **Home** | Today's check-in, recent alerts, quick actions | Today |
| **Health** | Personal profile, conditions, meds, vault entry | Health Overview |
| **Family** | Family graph, alerts, shared profiles I manage | Family Overview |
| **Insights** | AI summaries, trends, visit prep | This Week |
| **Settings** | Account, privacy, sharing, data | Account |

> The "Vault" and "Alerts" tabs from the original UX spec are folded in: Vault becomes a section inside Health; Alerts become a unified inbox accessible from Home and Family.

### Web (left sidebar)

| Section | Subsections |
|---|---|
| **Home** | Today, This Week, Inbox |
| **My Health** | Overview, Timeline, Conditions, Medications, Allergies, Labs, Encounters, Procedures, Immunizations, Dental, Vision, Mental Health, Wearables, DNA |
| **Documents** | All, Labs, Imaging, Visits, Discharge, Prescriptions, Insurance, Other |
| **Family** | Tree, People, Shared with me, Profiles I manage, Invites |
| **Sharing** | Active grants, Audit log, Presets, Hereditary alerts |
| **Insights** | Summaries, Visit prep, Trends, Check-ins |
| **Exports** | Doctor packets, Full export, Scheduled exports |
| **Settings** | Account, Security, Privacy, Notifications, Devices, AI, Integrations, Billing, Legal, Delete account |

## 3. Screen inventory — Mobile

### 3.1 Home tab
- **Today** — check-in card, top 3 alerts, today's meds reminder, today's appointments, quick actions (scan, add med, add note)
- **Inbox** — unified alert feed: family alerts I sent, family alerts I received, system alerts, summary notifications
- **Quick scan** (modal) — opens camera, OCR pipeline, single-tap to save to Vault with default categorization

### 3.2 Health tab
- **Health Overview** — at-a-glance: 3-tile summary (status / what's new / what to discuss with doctor), section list
- **Conditions** — list, add, detail
- **Medications** — list (active / paused / past), add, detail with adherence streak, refill status
- **Allergies** — list, add, severity tagging
- **Labs** — list grouped by date, manual entry, photo of report
- **Encounters** — visit list, add visit, visit detail (notes, attachments, follow-ups)
- **Procedures & Surgeries** — list, add
- **Immunizations** — list, add, scan-from-card
- **Dental / Vision / Mental Health** — separate sub-sections with specialized fields
- **Vault** — documents grid, search, filter by type, upload via camera or files
- **Wearables** — connected sources, last sync, today's signals (steps, sleep, HR, HRV)
- **DNA** (later phase, hidden until enabled) — import status, variants, hereditary flags
- **Emergency profile** — separate quick-access screen, also surfaced from lock screen

### 3.3 Family tab
- **Family Overview** — shows my graph at a glance with cards (avatar, name, relationship, what they can see)
- **People** — full list of people in my graph
- **Person detail** — relationship, what I share with them, what they share with me, audit of their access
- **Shared with me** — profiles I have access to (e.g., my mom's, my child's)
- **Add a relative** — flow choice (manual / invite link / DNA suggestion when enabled)
- **Invite link generator** — generates 10-min single-use link, shows status
- **Family alerts** — alerts I've sent or received, with status
- **Send alert** — start an alert from a health event

### 3.4 Insights tab
- **This Week** — AI weekly summary card, link to full summary
- **Visit Prep** — generates a packet for an upcoming appointment from existing data
- **Trends** — sleep, mood, activity, vitals, meds adherence, lab trends
- **Check-ins history** — list of past check-ins with quick visualization
- **Ask FAMILIA** (later phase) — RAG-grounded Q&A over my own data

### 3.5 Settings tab
- **Account** — name, photo, email, phone
- **Security** — password, MFA, biometric, trusted devices, recovery
- **Privacy** — data residency, telemetry opt-out, AI opt-out scope
- **Sharing** — global defaults, sensitive-data gates, anonymous-mode default
- **Notifications** — channel preferences, quiet hours, alert types
- **Connected devices & apps** — Apple Health, Google Health Connect, Fitbit, Garmin, Oura, providers (later)
- **AI** — what data the AI can see, summary cadence, opt-out from AI features
- **Subscription / billing**
- **Legal** — terms, privacy policy, data processing addendum, BAA (later), licenses
- **Export my data**
- **Delete my account**

### 3.6 System screens
- Onboarding (multi-step, see [03_TASK_FLOWS](03_TASK_FLOWS.md))
- Lock screen emergency profile (with PIN bypass)
- Biometric unlock
- Push notification deep links

## 4. Screen inventory — Web

The web app exposes everything the mobile app does, with these added or expanded screens:

### 4.1 Web-exclusive screens
- **Family tree visualization** — interactive node-link diagram, supporting drag-rearrange, multi-select, hide/show categories (biological / social / inferred)
- **Bulk document review** — multi-document side-by-side, OCR field corrections, batch tagging, batch assignment to encounters
- **Audit log explorer** — filterable, exportable; shows every read of every record
- **Permission designer** — full grid view of every person × every data category × access state, with bulk apply
- **Doctor packet builder** — drag-and-drop assembly of records into a shareable PDF with a preview pane
- **Profiles I manage** — admin panel for any minor/aging-parent profile I'm a co-manager of
- **Two-key approval queue** — pending sensitive actions awaiting a second guardian's approval
- **Scheduled exports** — recurring exports for caregivers, providers, etc.
- **Family graph diagnostics** (admin-ish) — see what your family graph looks like to others, what's hidden, what's inferred, what's confirmed

### 4.2 Web-expanded screens
- **Timeline** — full medical timeline with filters, search, zoom; far richer than the mobile version
- **Lab trends** — multi-marker overlay, reference range bands, annotations from check-ins
- **Person detail** — full audit of every access, message preview history, consent versions
- **Settings** — every setting from mobile plus jurisdiction selector, data residency, advanced security

## 5. Modal / sheet inventory

These are small surfaces that overlay the main app. Listed because they carry a lot of the consent and copy weight.

| Sheet | Surface | Triggered by | What it does |
|---|---|---|---|
| **Sensitive confirm** | Both | Sharing mental health, HRT, DNA, reproductive, substance use | Two-step confirmation with plain-English summary |
| **Recipient preview** | Both | Sending an alert | Shows exact message each recipient will see, grouped by relationship |
| **Disclosure mode picker** | Both | Sending an alert | Anonymous / Relationship-only / Identified / Partial |
| **Undo banner** | Both | After sending an alert | 24-hour window to recall before delivery |
| **Invite link** | Both | Adding a relative | 10-minute single-use link with QR + share sheet |
| **Two-key request** | Both | Co-managed profile sensitive action | Sends approval request to other guardian |
| **Emergency unlock** | Mobile | Long-press on lock screen | Shows emergency profile, logs the access |
| **Quick scan** | Mobile | "+ Scan" from anywhere | Camera → OCR → review → save |
| **Connection consent** | Both | Connecting a wearable / provider | Shows what data will flow, where it goes, who can see it |
| **Sharing summary** | Both | Background — surfaced weekly | Plain-English "here's who saw what this week" |

## 6. Cross-surface state contract

| Action | Surface | Reflected on other surface within |
|---|---|---|
| Add a medication | Mobile | <5s |
| Upload a document | Either | <30s (OCR happens after) |
| Connect a wearable | Mobile | Within first sync (<60s) |
| Send an alert | Either | Inbox updates immediately |
| Recipient acceptance of invite | Either | Family tree updates within 5s |
| Consent revocation | Either | Effective immediately, propagated to recipient view within 5s |
| OCR field correction | Web | Mobile reflects within 30s |
| Delete a record | Either | Soft-deleted, reflected within 5s; hard-delete after grace period |

## 7. Empty states (where they live)

Every primary screen needs a deliberate empty state, not a "no data" message. Specifics in [04_VOICE_AND_TONE](04_VOICE_AND_TONE.md), but the inventory is:

- Today (no check-in yet)
- Conditions / Medications / Allergies / Labs (none added)
- Vault (no documents)
- Family Overview (no relatives added — strongest empty state, drives invite flow)
- Insights (not enough data yet)
- Audit log (no activity)
- Wearables (none connected)
- DNA (feature locked / not imported)

## 8. Notifications inventory

| Notification | Channel | Quiet hours respected? | Default opt-in |
|---|---|---|---|
| Check-in reminder | Push | Yes | On |
| Medication reminder | Push | No (medical) | On |
| New family alert received | Push | No | On |
| Alert recipient accepted/declined | Push | Yes | On |
| Two-key approval requested of you | Push | No | On |
| Document OCR ready for review | Push | Yes | On |
| Wearable signal anomaly | Push | No (depends on tier) | Off (opt-in) |
| Weekly summary ready | Push + email | Yes | On |
| Consent expires in 7 days | Push + email | Yes | On |
| Account security event | Push + email | No | On |
| Marketing / product updates | Email only | n/a | Off (explicit opt-in) |
