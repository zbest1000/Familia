# FAMILIA — Task Flows

Twelve end-to-end journeys that cover the MVP. Each flow specifies trigger, preconditions, steps with screen/system/copy detail, error states, variations, acceptance criteria, and what must feel emotionally right. Personas referenced from [01_PERSONAS](01_PERSONAS.md). Screens from [02_INFORMATION_ARCHITECTURE](02_INFORMATION_ARCHITECTURE.md).

> **Notation**: `S:` = screen, `U:` = user action, `Sys:` = system response, `C:` = copy. Acceptance criteria are written Given/When/Then.

---

## Flow 1 — First-run onboarding (mobile)

**Persona**: any new user, optimized for Maya. **Trigger**: app first opened. **Pre**: nothing. **Goal**: account exists, one piece of health data captured, one privacy promise made, one habit started.

| # | Surface | Action |
|---|---|---|
| 1 | S: Welcome | C: "FAMILIA holds your health story in one place — and lets you decide who sees what." [Get started] [I already have an account] |
| 2 | S: Identity | U: enters phone or email + name + DOB. Sys: sends OTP. |
| 3 | S: Verify | U: enters OTP. Sys: creates account. |
| 4 | S: Privacy promise | C: "Three things we promise. 1. Your data is encrypted and only you decide who sees it. 2. We will never sell or share without your consent. 3. You can export or delete everything, anytime." [I understand] |
| 5 | S: Set unlock | U: enables Face ID / Touch ID / 6-digit PIN. Sys: stores. |
| 6 | S: Quick health snapshot | C: "Let's start with the basics. You can come back to anything." Optional fields: blood type, height, weight, known allergies (chips), current medications (autocomplete). [Skip / Save] |
| 7 | S: Emergency profile | C: "If you end up in an ER, what do they need to know?" Inputs: emergency contact, allergies (pre-filled), critical conditions (pre-filled). Lock-screen access toggle. |
| 8 | S: Family invite (optional) | C: "Health is rarely solo. Invite one person now — or later. You can always revoke." [Invite a relative] [Skip] |
| 9 | S: Notifications | U: chooses channels and quiet hours. |
| 10 | S: Home — first check-in | C: "Take 30 seconds for today's check-in. We'll use it to start understanding your story." [Start] [Maybe later] |

**Error states**
- OTP expires → resend with 60s cooldown.
- Biometric fails → fallback to PIN; 3 fails → 30s lockout.
- Skipped emergency profile → soft prompt the next 3 sessions, then drop.

**Variations**
- Already-account: step 2 detects existing user → sign-in flow.
- Invite-link entry: app launched from a deep link (see Flow 4) skips steps 6–8 and lands directly in invite acceptance.

**Acceptance criteria**
- Given a new user, when they complete onboarding, then they have an account, an unlock method, an explicit acknowledgment of the privacy promise, and at least an empty emergency profile.
- Given a user who skips every optional step, when they reach Home, then the app still works and a single contextual nudge to "complete your profile" appears once per session for the first week.

**Must feel right**: calm, not pushy. No "10 step setup" dot indicator. The privacy promise screen is plain English — not a TOS dump.

---

## Flow 2 — Add a relative manually (no invite)

**Persona**: Maya adding her late father (deceased, can't be invited) to enable hereditary context. **Trigger**: from Family tab → Add a relative → Manual.

| # | Action |
|---|---|
| 1 | S: Add a relative → choice: Manual / Invite link / Suggested from DNA (later). U: picks Manual. |
| 2 | S: Relationship type. C: "How is this person related to you?" Buckets: parents, children, siblings, grandparents, partners, extended, custom. U: picks "Father". |
| 3 | S: Biological / social distinction. C: "Is this a biological father, adoptive father, step-father, or other?" U: picks "Biological". Sys: sets graph type for hereditary logic. |
| 4 | S: Basic details. U: enters first name, last name, optional DOB, optional sex assigned at birth. Optional: deceased toggle + date. |
| 5 | S: Visibility. C: "Who in your family can see that this person is in your tree?" Default: private to me. Options: private / visible to family / visible only on direct request. |
| 6 | S: Optional health context (Maya's notes). C: "Anything you know about their health history? You can edit this anytime." Free text + structured fields (conditions, cause of death, age at death). |
| 7 | S: Confirm. Summary card. [Add to family] |
| 8 | Sys: creates a "ghost profile" — no account associated. Marked as `manual_entry`, `unverifiable_health_info`. |

**Error states**
- Network fail at step 7 → save draft locally, retry on reconnect.
- Duplicate detection → "It looks like you may already have a Father in your tree. Add anyway? Merge?"

**Variations**
- For a living relative, step 4 surfaces the "Want to invite them?" CTA. They can still be added manually now, with an invite later.

**Acceptance criteria**
- Given a user adds a deceased parent, then the parent appears in the family tree as a ghost profile with all hereditary fields available.
- Given a user adds a manually entered relative, then the system never auto-suggests a real account match without user opt-in.
- Given the relative is marked deceased, then no invite, alert, or share-with action is offered.

**Must feel right**: adding a deceased parent is not jarring. The deceased toggle is matter-of-fact, not gilded. "Cause of death" is optional and never pre-checked.

---

## Flow 3 — Invite a relative via 10-minute link (sender side)

**Persona**: Maya inviting her mother Elena. **Trigger**: from Family → Add → Invite link.

| # | Action |
|---|---|
| 1 | S: Relationship type → "Mother" → "Biological". |
| 2 | S: Initial sharing preset. C: "What can your mother see when she joins? You can change this anytime." Choices: No access / Emergency only / Care bundle / Custom. Maya picks Care bundle. Sys: shows in plain English what that includes ([05_PERMISSION_MATRIX](05_PERMISSION_MATRIX.md)). |
| 3 | S: What you'd like from her. C: "Would you like Elena to share anything back with you, by default?" Optional reciprocal request preset. Maya picks "Care bundle (mutual)". |
| 4 | S: Generate link. C: "We'll create a one-time link that expires in 10 minutes. Send it to Elena now." [Generate]. |
| 5 | Sys: creates invite token (signed, single-use, 10-min TTL, scoped to grantor + intended recipient context). |
| 6 | S: Share sheet — copy link / send via SMS / email / show QR. Live countdown of TTL. C: "Elena will see your name and what you're proposing to share. She can change or refuse anything before accepting." |
| 7 | Sys: link opens Flow 4 on the recipient device. |
| 8 | S: Status. Waiting → Accepted / Declined / Expired. Maya gets a push when the state changes. |

**Error states**
- Link expires → user can re-generate without re-doing relationship setup. Copy: "Links expire in 10 minutes for security. Make a new one any time."
- Recipient declines → status updates with optional message. Maya can re-invite once after a 24-hour cooldown.

**Variations**
- For a minor (e.g., child), the link is sent to the **other guardian**, not the child. See [09_PEDIATRIC_AND_PROXY](09_PEDIATRIC_AND_PROXY.md).

**Acceptance criteria**
- Given a sent invite, when the link is opened more than 10 minutes after generation, then it shows an expiration screen and offers to ping the sender.
- Given a sent invite, when used once, then any further use returns "already used."
- Given a sent invite, when the recipient accepts, then the relationship and proposed sharing both take effect after a final confirmation by both parties.

**Must feel right**: the recipient is never made to feel summoned. The sender preview shows what their relative will see, including the sender's name and proposed access — no surprises.

---

## Flow 4 — Accept an invite (recipient side)

**Persona**: Elena, receiving Maya's invite. **Trigger**: link opened on phone (with or without FAMILIA installed).

| # | Action |
|---|---|
| 1 | Sys: link → web app preview, even if FAMILIA isn't installed yet. C: "Maya Reyes wants to add you to her FAMILIA family." Shows: relationship Maya proposed (Mother), what Maya is offering to share ("Maya wants to share medications, allergies, and emergency info with you"), what Maya is asking from Elena ("Maya is asking to see the same in return — you can refuse or change this"). |
| 2 | S: Continue → install or sign in. If installed and signed in, jump to step 4. |
| 3 | Onboarding subset (Flow 1, abridged). |
| 4 | S: Review. C: "Here's exactly what Maya will see if you accept and share back." Itemized list. [Accept] / [Modify what I share] / [Just connect, don't share for now] / [Decline]. |
| 5 | If Modify: jump to a slim permission designer. |
| 6 | If Accept: Sys: creates bidirectional consent grants per the agreed scope. Family graph edge created. Audit log entries created on both sides. |
| 7 | S: Welcome. Brief tour of where Elena can see what Maya shared. |

**Error states**
- Recipient already has an account under a different email → recognize and prompt sign-in.
- Recipient accepts on a device that fails biometric → email-link confirm fallback.

**Variations**
- "Just connect, don't share for now" creates the relationship in the graph but with **no consent grants** in either direction. Useful for shy starts.

**Acceptance criteria**
- Given Elena accepts, then both parties see the relationship, both see the consent grants, and both have an audit-log entry.
- Given Elena declines, then Maya is notified with a generic "Elena chose not to connect right now" — never with reasons.
- Given Elena modifies, then the final scope is the **intersection** of what Maya offered and what Elena agreed to.

**Must feel right**: the recipient is in control. The flow never tries to upsell or auto-connect.

---

## Flow 5 — Daily check-in (mobile)

**Persona**: Maya, doing a quick check-in on her commute. **Trigger**: Home → Check-in card, or push notification.

| # | Action |
|---|---|
| 1 | S: Check-in screen. Single-screen layout. C: "30 seconds. How are you today?" |
| 2 | Sliders or chips: Physical 1–10, Mental 1–10, Energy 1–10, Pain 1–10. |
| 3 | Symptom chips (multi-select): headache, nausea, fatigue, anxious, low mood, joint pain, etc. (~12 default chips). |
| 4 | Free text: optional. Voice input enabled. |
| 5 | "Anything you took today that we don't already know about?" Optional med chip add. |
| 6 | [Save]. Sys: stores check-in, updates twin model. |
| 7 | If meaningful pattern detected (e.g., 3rd headache day this week): subtle banner on Home — "I noticed 3 headache check-ins this week. I'll surface this in your next visit prep." Not an alert. |

**Error states**
- Offline: save locally, sync on reconnect.
- Speech-to-text fails: fallback to keyboard.

**Variations**
- Weekly: longer prompt offered every Sunday. Adds: new visits, med changes, doctor questions, goals.
- Monthly: longer review with timeline reflection.

**Acceptance criteria**
- Given a daily check-in is offered, when the user starts it, then it can be completed in under 60 seconds with all required inputs being optional except a single overall rating.
- Given the user completes a check-in, then the AI digital twin updates within 5 seconds and the timeline shows the new entry.
- Given 7 missed days of check-ins, then the app stops nudging and waits to be opened by the user.

**Must feel right**: not a chore. Not gamified. The "good day" check-in is as easy and delightful as the "bad day" one. No streaks. No "you're falling behind."

---

## Flow 6 — Upload a document (mobile camera)

**Persona**: Robert, scanning a one-page lab report from his cardiologist. **Trigger**: Health → Vault → + Scan.

| # | Action |
|---|---|
| 1 | S: Camera. Auto-detect document edges, snap when stable. Manual snap as fallback. |
| 2 | S: Crop / rotate / multi-page (add another). |
| 3 | S: Categorize. C: "What kind of document is this?" Suggested chip: "Lab report" (from OCR pre-pass). Other chips: imaging, prescription, discharge, insurance, dental, vision, mental health, other. |
| 4 | S: Attach to. C: "Is this from a recent visit?" Suggested: a recent encounter from the timeline. [Attach] / [No, just save]. |
| 5 | S: Visibility. Default: private. C: "This is private to you unless you change it. You can share it later." |
| 6 | Sys: uploads encrypted to vault. OCR + LLM extraction runs server-side. User gets a notification when extraction is ready to review. |
| 7 | S (later, on extraction-ready notification): Review extracted fields. User can correct, accept, or skip. Original document is preserved. |

**Error states**
- Poor lighting / blur → "Looks blurry. Try again or proceed?" Always allow proceed (we'd rather have a bad scan than no scan).
- Camera permission denied → fallback to file picker.
- OCR fails → document still saved; "Extraction unavailable, saved as a file."

**Variations**
- Multi-page: stitched into one PDF in the vault.
- Web: drag-and-drop zone, batch upload.

**Acceptance criteria**
- Given a single-page lab report scan, when the user completes the flow, then the document is in the vault within 5 seconds and OCR review is offered within 60 seconds for documents under 5MB.
- Given OCR extracts a recognized lab marker (e.g., HbA1c 6.7), then the structured value is **proposed** to the labs section and the user must confirm before it appears in trends.
- Given the user skips review, then the document is still searchable by date and category.

**Must feel right**: the user doesn't have to be a librarian. Defaults are sensible. Wrong category is easy to fix. Nothing irreversible.

---

## Flow 7 — Connect a wearable (Apple Health)

**Persona**: David connecting his Pixel Watch (variant: Apple Watch flow shown). **Trigger**: Settings → Connected devices → + Connect.

| # | Action |
|---|---|
| 1 | S: Sources list. Apple Health, Google Health Connect, Fitbit, Garmin, Oura. (See [11_OPEN_QUESTIONS](11_OPEN_QUESTIONS.md) for which is first.) |
| 2 | U: picks Apple Health. |
| 3 | S: Permissions sheet. Plain English: "What FAMILIA wants to read from Apple Health: heart rate, HRV, sleep, steps, workouts. We will not write back, and we won't read anything you don't approve." |
| 4 | OS-level Apple Health permission sheet appears. |
| 5 | After permission: S: Where this data lives. C: "Wearable data is private to you by default. You decide if and when family sees it." |
| 6 | S: First sync. Loading state with friendly progress. |
| 7 | S: First-sync summary. C: "Synced 90 days of data: ~120k heart rate samples, 87 nights of sleep, 52 workouts." |
| 8 | Home updates with new wearable cards. |

**Error states**
- User denies OS permission → "No problem. You can change this in Settings → Health → Apps." We don't nag.
- Sync fails → silent retry up to 3x, then surfaces a small error in Settings → Connected devices.

**Acceptance criteria**
- Given a user connects Apple Health, when first sync completes, then they can see at least one wearable signal on Home.
- Given a user disconnects a wearable, then no further data flows in **and** historical data is preserved with an attribution flag (so trends don't break) — with a UI toggle to also delete historical data.

**Must feel right**: the consent screens are FAMILIA's, not the OS's. The OS permission feels like the second step, not the first.

---

## Flow 8 — Send a hereditary alert with multi-recipient preview

**Persona**: Rosa sending a BRCA1 awareness alert. **Trigger**: Family → Send alert, or from a relevant health entry's "share with family" action.

| # | Action |
|---|---|
| 1 | S: What's the alert about? Choice: General health update / Hereditary risk / Wellness trend / Emergency. U: picks Hereditary risk. |
| 2 | S: Topic. Free text + suggested chips (BRCA1, BRCA2, Lynch, FH, etc.). U: types "BRCA1 — confirmed in me; recommending genetic counseling for biological siblings". |
| 3 | S: Pick recipients. Sys: by default, lists only **biological relatives** for hereditary type. U can add others manually. Rosa picks her two biological half-siblings + adopted brother (with a system warning when she adds the adopted brother — see step 4). |
| 4 | S: System warning. C: "Your adopted brother does not have a confirmed biological link, so he won't receive genetic-risk wording. He'll receive a support-and-awareness message instead. Would you like to preview both?" [Yes, preview] |
| 5 | S: Disclosure mode. Choice: Anonymous / Relationship-only / Identified. C: explains tradeoff in plain English. Default for hereditary: Identified (you can change). U: picks Identified. |
| 6 | S: Preview, grouped by recipient type. <br>**Biological siblings (2)**: "Rosa Kim (your sister) has shared that she has been confirmed BRCA1 positive. This may be relevant to your own screening decisions. This is not a diagnosis. Consider a conversation with a genetic counselor — Rosa included a few resources below."<br>**Adopted brother (1)**: "Rosa Kim has shared that she has a health concern she'd like you to be aware of. She is not implying inherited risk — she'd love your support. Read more if you'd like." |
| 7 | S: Optional personal note (one per group, or one shared note). U writes a few lines. Sys: keeps note separate from the structured alert content. |
| 8 | S: Confirm. C: "We'll send this immediately. You have a 24-hour undo window." [Send] |
| 9 | Sys: queues the alert. Holds for 60 seconds before delivery to allow undo via banner. After 24h, undo is disabled. |
| 10 | S: Status. Tracking: delivered / opened / acknowledged. Recipients can mark "I've read this" — Rosa sees that, never sees if they panic. |

**Error states**
- Recipient has revoked Rosa's alert permissions → that recipient is hidden from the picker with a small note: "Some relatives have chosen not to receive alerts from you."
- Network fail on send → queued; sender notified when sent.

**Variations**
- The same flow handles a general health update (no genetic-relevance warning), wellness trend (auto-detected pattern; user must still approve), and emergency (an opt-in fast-path that skips some preview).

**Acceptance criteria**
- Given a hereditary alert with mixed recipient types, when the user reaches preview, then they see a separate, distinct message for each relationship class.
- Given an alert is sent, when within 60 seconds the user taps Undo, then no recipient is delivered the alert.
- Given an alert is sent, when within 24 hours the user taps Recall, then a soft retraction is sent and the original is marked recalled in recipient inboxes.
- Given a recipient is in the user's "do not alert" list, then they never appear in the picker.

**Must feel right**: this is the moment FAMILIA either earns trust or loses it forever. The preview must be **literally** what they will see. The disclosure-mode picker must explain consequences in one short sentence, not a paragraph. Adoption / biological status must never leak.

---

## Flow 9 — Share emergency profile with spouse

**Persona**: Maya sharing emergency profile with Jamal. **Trigger**: Settings → Sharing → Emergency, or first-time prompt.

| # | Action |
|---|---|
| 1 | S: Pick recipient. Choice: existing relatives in graph, or invite a new one (Flow 3). |
| 2 | S: Confirm scope. Plain-English summary of the Emergency preset (allergies, current medications, major conditions, blood type, emergency contacts, care instructions). C: "Jamal will be able to see this info anytime. Updates are reflected automatically. He won't see your other records." |
| 3 | S: Confirm. [Share]. Sys: creates persistent emergency-scope consent grant. |
| 4 | Recipient gets a soft notification: "Maya granted you emergency access. You can view it any time from her profile." |

**Error states**
- Recipient has not yet installed the app → grant is held; once they sign up via flow 4 and accept the relationship, the grant activates.

**Acceptance criteria**
- Given an emergency grant exists, when emergency profile is updated, then the recipient sees the update within 5 seconds without needing a re-share.
- Given the user revokes, then the recipient's access is gone within 5 seconds and the audit log shows the revocation.

**Must feel right**: the user understands "emergency only" means **only** these fields, even if the recipient is family. No drift. No additional data quietly added later.

---

## Flow 10 — Revoke access (with grace)

**Persona**: Jordan revoking access from a partner after a breakup. **Trigger**: Family → Person → Revoke access.

| # | Action |
|---|---|
| 1 | S: Person detail. "Manage access" tile. |
| 2 | S: Manage access. C: shows what they currently can see. Two paths: "Reduce access" (granular) / "Revoke completely". |
| 3 | If Revoke completely: C: "We'll immediately stop their access to all of your data. They'll be notified that access has changed — but never with reasons. The relationship in your tree stays unless you remove it separately." [Revoke] |
| 4 | Sys: marks all relevant grants revoked. Removes derived family-shared data from the recipient's caches. Adds audit entry. |
| 5 | S: Confirmation with two next-step options: [Also remove from family tree] [Keep in tree as a record] |

**Error states**
- The person is a co-manager of a profile (e.g., Jordan's mother manages Jordan's child profile) → block revocation with explanation, point to co-management settings.

**Variations**
- "Reduce access" lets user dial back to a smaller scope (e.g., from Care bundle to Emergency-only).
- Mass-revoke from Settings → Sharing for users who want a clean slate.

**Acceptance criteria**
- Given a revocation, then within 5 seconds the recipient has no further access and an audit entry exists for both parties.
- Given a revocation, then the notification to the recipient says "[User]'s access settings changed" — never reveals what or why.

**Must feel right**: this is also a moment of trust. No friction beyond what is necessary for safety. No "are you sure" loop. One confirmation, decisive action.

---

## Flow 11 — Export a doctor visit packet (web)

**Persona**: Maya preparing for Elena's neurology appointment. **Trigger**: web → Exports → Doctor packet builder.

| # | Action |
|---|---|
| 1 | S: New packet. Pick whose profile (must have permission). For Maya: her own, Elena's (since Maya is Elena's caregiver). |
| 2 | S: Reason / specialty. Maya picks "Neurology — follow-up TIA". |
| 3 | S: Suggested contents. AI proposes a default packet (recent encounters, current meds, recent labs, relevant imaging, family history, recent check-ins). User edits inclusion checkboxes. |
| 4 | S: Preview. PDF preview pane. Live updates as toggles change. |
| 5 | S: Add a one-page cover note. AI drafts; Maya edits. |
| 6 | S: Export options. PDF / encrypted link with PIN / scheduled email to provider (if FHIR provider integration available — phase 3). |
| 7 | Sys: generates PDF; logs export in audit log; offers re-generation in one click for next visit. |

**Error states**
- Selected records too large for PDF → split into Part 1 / Part 2.
- Profile permissions don't allow inclusion of a record (e.g., Maya tries to include a sealed record) → record shown as "restricted — not included."

**Acceptance criteria**
- Given a generated packet, when the user re-runs it for a future appointment, then the system uses the same template and updates with new data automatically.
- Given a packet is exported, then an audit-log entry is recorded with timestamp, contents hash, and recipient method.

**Must feel right**: like preparing a calm, professional briefing. Not a wall of data. The cover note humanizes it.

---

## Flow 12 — Receive and respond to an alert (recipient side)

**Persona**: Rosa's biological half-sister receiving the alert from Flow 8. **Trigger**: push or email.

| # | Action |
|---|---|
| 1 | Push: "Rosa Kim sent you a family health update." (No content in the push payload.) |
| 2 | App opens to Inbox → Alert detail. |
| 3 | S: Alert detail. C: the message variant Rosa approved. Resources from FAMILIA (genetic counselor finder, NCCN screening guidelines summary). Optional personal note from Rosa, separated visually. |
| 4 | Action options: [Mark as read] [I'd like to talk to Rosa about this] [Not now]. |
| 5 | If "I'd like to talk": offers a calendar link or "send a quick message" — both go through the recipient's existing channels (their phone, their email), not via FAMILIA's chat. (FAMILIA does not host conversations.) |
| 6 | Recipient can also: [Save to my own profile] (creates a "Family history note" in their own conditions section, with attribution to Rosa). |

**Error states**
- Recipient has muted alerts from this sender → push is suppressed but Inbox still receives, with a banner: "You muted alerts from Rosa. View anyway?"

**Acceptance criteria**
- Given an alert is delivered, then the push payload contains zero medical content (only sender name + neutral phrase).
- Given the recipient saves to own profile, then a "family history" entry exists with explicit attribution and a link back to the original alert.

**Must feel right**: the recipient feels respected. They are not given a quiz, an upsell, or a panic banner.

---

## Cross-flow design contracts

These contracts apply to every flow above:

- **No silent state changes**: the user is always told when access changes, when their data is read by another user, when an alert is queued or sent.
- **Reversible by default**: alerts have a 60s undo + 24h recall. Document categorization is editable forever. Family relationships can be modified or removed.
- **Sensitive friction**: any flow touching mental health, HRT, reproductive, DNA, substance use, or "highly sensitive" tier requires a two-step confirmation.
- **Plain English over legalese**: every consent moment has a one-sentence summary with a "details" disclosure.
- **No streaks, badges, or gamification**: this is health, not a fitness app.
- **Empty-state-led learning**: every screen teaches the next action through the empty state, not a tutorial.
