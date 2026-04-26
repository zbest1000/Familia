# FAMILIA — Component Inventory

A complete UI component list for both surfaces, with required states and the consent/safety contracts each carries. This is what a designer builds in Figma and an engineer scaffolds in code (mobile and web). Built so a designer and an engineer can pair without redrawing the same thing twice.

The component system has three layers: **primitives** (the typography, color, spacing tokens), **patterns** (composable building blocks), and **modules** (full-feature surfaces). Each module is composed of patterns; each pattern of primitives.

## 1. Primitives (design tokens)

### 1.1 Color
- **Surface**: `surface/0` (page bg), `surface/1` (card), `surface/2` (raised), `surface/3` (modal)
- **Text**: `text/primary`, `text/secondary`, `text/tertiary`, `text/inverse`, `text/sensitive`
- **Border**: `border/subtle`, `border/strong`
- **Status**: `status/info`, `status/success`, `status/warning`, `status/critical`
- **Sensitivity tiers**: `tier/standard` (no special color), `tier/sensitive` (subtle indigo), `tier/highlysensitive` (subtle violet) — used as accent only, never alarming
- **Sharing state**: `share/private`, `share/shared`, `share/emergency`
- **Dark mode**: every token has a dark variant from day one

### 1.2 Typography
- Display, H1, H2, H3, body, body-small, label, mono (for codes), legal (small print, but readable)
- Dynamic Type / Android font scaling supported up to 200%

### 1.3 Spacing
- 4px base grid: `space/1` through `space/12`
- Touch targets: minimum 44×44pt mobile, 32×32 web

### 1.4 Iconography
- Outline as default; filled for selected state
- Sensitivity tier icons: dot for standard, dot+ring for sensitive, dot+double-ring for highly sensitive
- Sharing icons: shield (has access), bell (receives alerts), lock (restricted), eye (read-only), pencil (editable)
- Relationship line types: solid (biological), dashed (adopted/legal), dotted (inferred/unconfirmed)

### 1.5 Motion
- Default duration: 200ms ease-out
- Sensitive transitions: 300ms (slower deliberately — this is the "wait, am I sure?" moment)
- No bounce. No celebratory animations. No streaks.

### 1.6 Voice tokens
Standard copy strings reusable across the product. See [04_VOICE_AND_TONE](04_VOICE_AND_TONE.md). These ship in a `copy.ts` file with type-safe i18n.

## 2. Patterns

### 2.1 Cards
| Pattern | States |
|---|---|
| `RecordCard` | default, sensitive (visual indicator), highly-sensitive, shared (with whom), staged (awaiting OCR review), conflict |
| `PersonCard` | default, in-tree, pending-invite, expired-invite, paused-sharing, blocked, deceased |
| `AlertCard` | unread, read, queued, sent, recalled, declined-by-recipient |
| `SummaryCard` | default, regenerating, no-data, opted-out |
| `WearableCard` | connected, syncing, stale, disconnected |
| `DocumentCard` | uploaded, ocr-processing, ocr-ready-to-review, accepted, rejected |

### 2.2 Forms
| Pattern | States |
|---|---|
| `Field` | empty, filled, focus, error, disabled, optional, sensitive (renders with subtle indicator) |
| `ChipMultiSelect` | default, all-selected, none-selected |
| `DateApprox` | exact-date, year-only, "around X", unknown |
| `CodeAutocomplete` | typing, suggestions, custom-text-fallback |
| `VoiceInput` | idle, listening, transcribing, error |

### 2.3 Sharing primitives
| Pattern | States |
|---|---|
| `PresetPicker` | None / Emergency / Care bundle / Full record / Custom — visual cards with descriptions |
| `PermissionGrid` | default, dirty (unsaved), preview-mode |
| `DisclosureModeSelect` | Anonymous / Relationship-only / Partial / Identified — pill picker |
| `RecipientPicker` | empty, picking, picked, blocked-recipients-hidden |
| `RecipientPreview` | per-relationship-class grouped view (the most important UX in the product) |
| `SensitiveConfirm` | first-step, second-step, sliding to "Yes I want to share" |

### 2.4 Identity & access
| Pattern | States |
|---|---|
| `BiometricUnlock` | idle, prompting, success, failed, locked |
| `MfaInput` | TOTP, passkey, sms-fallback |
| `SessionList` | current device, other devices, pending-revoke |
| `RecoveryContact` | none, set, pending |

### 2.5 Family graph visuals
| Pattern | States |
|---|---|
| `RelationshipChip` | biological, adoptive, step, foster, guardian, custom — line type matches |
| `TreeNode` | self, family-member, ghost-profile, deceased, hidden-from-others |
| `TreeEdge` | confirmed-biological, confirmed-social, inferred, disputed |
| `TreeView` (web) | full-tree, filtered-by-type, single-branch, focus mode |

### 2.6 Banners and toasts
| Pattern | States |
|---|---|
| `UndoBanner` | 60s window after an alert send |
| `RecallBanner` | 24h window |
| `EmergencyAccessBanner` | shown to user after their emergency profile was accessed |
| `QuietRevocationToast` | one-line, neutral |
| `SyncStatusBanner` | up-to-date, catching-up, offline |
| `OcrReadyBanner` | document is ready for review |

### 2.7 Audit & consent UX
| Pattern | States |
|---|---|
| `AccessTimeline` | per-record view of who read it when |
| `GrantList` | per-recipient view of all active grants |
| `ConsentVersionViewer` | shows the version of consent terms in effect when a grant was created |
| `BlockList` | people the user has blocked from inviting |

### 2.8 Empty states
A single component, `EmptyState`, with variants per surface (see [02_INFORMATION_ARCHITECTURE](02_INFORMATION_ARCHITECTURE.md) §7). Each carries: icon, title, body, primary action.

## 3. Modules (composed surfaces)

These map 1:1 to the screens in [02_INFORMATION_ARCHITECTURE](02_INFORMATION_ARCHITECTURE.md).

### 3.1 Mobile

| Module | Made of |
|---|---|
| `OnboardingFlow` | identity → privacy promise → unlock → quick snapshot → emergency → invite → notifications → first check-in (each a screen with shared progress affordance) |
| `HomeToday` | check-in card + alerts feed (top 3) + meds today + appts today + quick actions |
| `HealthOverview` | section list with status pills |
| `RecordList` (per category) | filter chips + record cards + add-floating-button |
| `RecordDetail` | header + key fields + history + linked documents + sharing status + edit |
| `AddRecordSheet` (per category) | category-specific form |
| `EmergencyProfile` | concise quick-glance card + edit |
| `Vault` | grid + filter chips + scan/upload FAB + ocr-review queue |
| `ScanFlow` | camera → crop → categorize → attach → save |
| `OcrReview` | side-by-side original + extracted fields + accept/edit per field |
| `WearablesSettings` | per-source state + sync status + permissions |
| `CheckIn` | sliders + symptom chips + free text + voice |
| `WeeklyCheckIn` | longer reflection prompts |
| `FamilyOverview` | person cards + add-relative |
| `PersonDetail` | relationship + grants + audit + actions (revoke, block, mark deceased, manage) |
| `AddRelativeFlow` | method → relationship → biological/social → details → visibility → preset → confirm |
| `InviteLinkSheet` | TTL countdown + share + status |
| `AcceptInviteFlow` | preview → install/sign-in → review/modify → confirm |
| `SendAlertFlow` | type → topic → recipients → disclosure → preview → personal note → send |
| `AlertDetailRecipient` | message + resources + actions |
| `Inbox` | unified alert and system message feed |
| `InsightsThisWeek` | summary + trends preview |
| `VisitPrep` | AI-drafted packet for upcoming appointment |
| `Settings` | sectioned list |
| `EmergencyExit` | revoke-all + sign-out-everywhere + mute + resources |

### 3.2 Web (mobile modules + these additions)

| Module | Made of |
|---|---|
| `WebDashboard` | wider Today + this week summary + family snapshot |
| `Timeline` | full-history timeline with filters + zoom + search |
| `LabTrends` | multi-marker overlay + reference bands + check-in annotations |
| `FamilyTreeView` | interactive node-link diagram (drag, zoom, filter, hide categories) |
| `PermissionDesigner` | full grid: people × categories × access |
| `AuditExplorer` | filterable, exportable log |
| `DocumentReview` (web) | side-by-side multi-document view + batch tagging |
| `PacketBuilder` | reason → suggested contents → toggle inclusion → preview PDF → cover note → export |
| `ProfilesIManage` | admin-style list with quick links into managed profiles |
| `TwoKeyApprovalQueue` | pending sensitive actions awaiting another guardian |
| `ScheduledExports` | cron-style scheduled packet generation for caregivers |
| `LegalDocs` | terms, privacy, BAA, transparency report, jurisdiction selector |

## 4. Component states checklist (must-have for each)

For every interactive component, design and engineering must spec:
- Default
- Hover (web)
- Focus (keyboard)
- Active (pressed)
- Loading (with skeleton or shimmer — never spinners over content)
- Empty
- Error (with recovery affordance)
- Disabled (with reason on hover/long-press)
- Read-only (for shared content the user doesn't own)
- Sensitive-tier overlay (when relevant)
- Dark mode equivalent
- Right-to-left equivalent (for Arabic/Hebrew later)
- Screen-reader label and live-region behavior

## 5. Accessibility contracts

Every module ships with:
- Logical focus order (matches visual reading order)
- VoiceOver/TalkBack labels (with semantic role: button, header, link)
- ARIA live regions for async state changes (sync status, OCR ready)
- Color contrast ≥ AA (≥ 4.5:1 for body text, 3:1 for large text)
- Touch targets ≥ 44×44pt mobile
- No reliance on color alone (sensitivity, sharing, status all use icon + text + color)
- Reduced motion respected
- Captions for any video/audio in product (and in marketing)

## 6. Component-to-flow mapping

For traceability — each task flow from [03_TASK_FLOWS](03_TASK_FLOWS.md) lists the modules it uses.

| Flow | Modules |
|---|---|
| F1 First-run onboarding | `OnboardingFlow`, `BiometricUnlock`, `EmergencyProfile`, `CheckIn` |
| F2 Add relative manually | `AddRelativeFlow` |
| F3 Invite a relative | `AddRelativeFlow`, `InviteLinkSheet`, `PresetPicker` |
| F4 Accept an invite | `AcceptInviteFlow`, `OnboardingFlow` (subset) |
| F5 Daily check-in | `CheckIn` |
| F6 Upload a document | `ScanFlow`, `OcrReview` |
| F7 Connect wearable | `WearablesSettings` |
| F8 Send hereditary alert | `SendAlertFlow`, `RecipientPicker`, `RecipientPreview`, `DisclosureModeSelect`, `UndoBanner` |
| F9 Share emergency profile | `PresetPicker` (Emergency variant), `PersonDetail` |
| F10 Revoke access | `PersonDetail`, `GrantList`, `QuietRevocationToast` |
| F11 Doctor packet (web) | `PacketBuilder`, `Timeline`, `LabTrends` |
| F12 Receive an alert | `Inbox`, `AlertDetailRecipient` |

## 7. Design system bootstrap

Recommended starting points:
- **Mobile**: Tamagui or React Native Paper with custom theme; or build minimal primitives with React Native Reanimated for transitions
- **Web**: Radix UI primitives + Tailwind tokens; shadcn/ui as a baseline that matches Radix
- **Shared tokens**: a single `@familia/tokens` package emitting CSS variables for web, JS objects for native — same source

## 8. What's intentionally NOT a component (yet)

- Charting library — use a wrapper that we can swap. For MVP: Victory Native + Recharts on web, both wrapping a shared `@familia/charts` interface.
- PDF rendering — use a library, do not build (server-side: pdfkit + puppeteer for HTML-to-PDF; client preview via inline HTML).
- Map components — we don't show user location on maps in MVP. Avoids feature creep and privacy surface.
