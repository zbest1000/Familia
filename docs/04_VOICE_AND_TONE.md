# FAMILIA — Voice & Tone

The product's voice is its second-most-important feature, after the consent model. A privacy-first family health platform either earns trust through how it talks, or loses every bit of trust the engineering earned.

This doc gives writers, designers, and engineers the patterns to use, the patterns to avoid, and a working library of copy for the moments that matter.

## 1. Voice principles

| Principle | What it means | What it kills |
|---|---|---|
| **Calm** | Steady, never alarming. Even on bad news. | Exclamation marks, urgent red banners for non-urgent things, "ALERT!" |
| **Clear** | Plain English. No jargon unless we define it inline. | Medical Latin, acronyms, legalese, "Per our terms..." |
| **Respectful** | The user is an adult managing their own life. We assist, never instruct. | "You should...", "You must...", "Why haven't you..." |
| **Honest** | We say what's true, including what we don't know. | "We've detected a concerning pattern" (we haven't — we noticed three headache check-ins) |
| **Specific** | Reference the actual data, the actual person, the actual scope. | "Your data is safe" (vague). Better: "Your therapy notes are private — no one in your family can see them." |
| **Human** | Sounds like a thoughtful friend, not a chatbot or a hospital portal. | "Your account has been provisioned" |
| **Quiet** | Defaults to silence. Talks when there's something to say. | Engagement bait, streaks, "Don't forget!", weekly recaps for users who haven't logged anything |
| **Non-judgmental** | No moralizing about choices (smoking, drinking, weight, missed meds). | "You missed your medication 3 times this week" with a frown emoji |

## 2. Tone matrix

Tone shifts by moment. Same voice, different register.

| Moment | Tone | Example |
|---|---|---|
| Routine action | Friendly, brief | "Saved." |
| First-time consent | Warm, transparent | "Here's exactly what your spouse will see." |
| Sensitive consent | Slow, deliberate | "Mental health entries are private to you. Sharing them is a separate decision, made one entry at a time." |
| Hereditary alert | Calm, factual | "This is information, not a diagnosis." |
| Emergency | Direct, no extras | "Maya's emergency profile. Allergies: penicillin." |
| Bad news from data | Honest, suggestive | "Your sleep dropped this week. Worth mentioning at your next visit." |
| Error | Honest, recoverable | "We couldn't read this scan. Try better light, or save it as a file." |
| Goodbye (delete account) | Final, clear | "Your data will be removed. We'll keep audit logs as required by law for 7 years. Nothing you did with us will be sold or used." |

## 3. Patterns to avoid

- **Alarmism**. "URGENT", "warning", red icons unless someone is actually in danger.
- **Streaks and gamification**. Health is not Duolingo. No "you're on a 12-day check-in streak!"
- **Pseudo-empathy**. "We know how you feel" — we don't. "We're sorry you're going through this" — only if the moment really calls for it.
- **Diagnosis or prediction**. "You may be developing X." Never. Always: "Your X markers show Y. Worth a conversation with a clinician."
- **Engagement bait**. "Open the app for a surprise!" "Don't lose your data — log in now!"
- **Coercive defaults**. "You haven't shared with anyone — share now?" The empty Family tab should welcome the user, not pressure them.
- **Implicit moralizing**. Never frown, sad-face, or use red text for behaviors. Smoking, weight, alcohol, missed meds get neutral language.
- **Bureaucratic finality**. "Your request has been submitted." Better: "Saved. We'll let you know when it's ready."
- **Apologetic over-explaining**. "We're so sorry but unfortunately due to security policy…" Just say what's true.

## 4. Words and phrases

### Prefer

| Use | Instead of |
|---|---|
| "Family", "relative" | "Subject", "linked user" |
| "Relationship" | "Connection" |
| "Emergency profile" | "EHR snippet", "Quick share" |
| "Visit", "appointment" | "Encounter" (clinical jargon — keep on the back end only) |
| "Medication", "med" | "Pharmaceutical agent" |
| "Note" | "Entry", "record" (when context is informal) |
| "Saved" | "Successfully saved" |
| "We don't know yet" | "Insufficient data" |
| "Worth mentioning to your doctor" | "You should consult a healthcare provider regarding…" |
| "Private to you" | "Restricted access" |
| "Your data" | "User-generated content" |
| "Decline", "Not now" | "Reject", "Cancel" |
| "Take a minute" | "Action required" |

### Avoid

- "AI", "machine learning", "algorithm" — unless the user asks. Say "FAMILIA noticed", not "Our AI detected".
- "Engagement", "retention" — internal words.
- "Premium", "upgrade" — soften to "more storage", "more family", "extended exports".
- "We" without subject — write "Maya, you can…" not "We can do this for you" when describing the user's own action.

## 5. Copy library — sensitive moments

These are vetted patterns for the moments where wording most affects user trust. Not literal — adaptable.

### 5.1 First sharing of any kind

> "Sharing means [Person] will be able to see what's listed below — and only that — until you change it. Updates you make stay current. You can revoke any time."

### 5.2 Sharing the emergency profile

> "[Person] will be able to see your allergies, current medications, major conditions, blood type, and emergency contacts. They won't see anything else. This stays accurate as you update — you don't need to re-share."

### 5.3 Sharing mental health (when user opts to)

> "Mental health entries are private by default. Sharing them is a separate decision, made one entry at a time. [Person] will see the entries you select — nothing more, nothing later. We'll ask again if you choose to share more."

### 5.4 Sharing HRT or hormone-related care

> "Hormone-related entries are private by default. Sharing them is a separate decision. [Person] will see only what you select. We won't surface this in shared summaries unless you tell us to."

### 5.5 Hereditary alert — biological recipient

> "[Sender, your relationship, e.g., your sister] has shared that they have been confirmed [marker / condition]. This may be relevant for your own screening decisions. This is not a diagnosis. Consider a conversation with a genetic counselor or your doctor.
>
> [Optional personal note from sender appears in a separate card, clearly labeled.]"

### 5.6 Hereditary alert — adopted / non-biological recipient

> "[Sender] has shared a health concern they'd like you to be aware of. They are not suggesting you are at inherited risk — they'd appreciate your support.
>
> [Optional personal note from sender appears in a separate card, clearly labeled.]"

### 5.7 Spouse / partner — care coordination message

> "[Sender] shared a health update that may be useful for care, planning, or follow-up. They've included specifics below."

### 5.8 Caregiver — action-oriented message

> "[Sender] shared a health update that may need follow-up, monitoring, or care coordination. Suggested next step: [optional]."

### 5.9 Adult child — family awareness message

> "Your [parent / mother / father] shared a health update they'd like you to know about. Read more if you'd like."

### 5.10 Clinician (export packet cover note)

> "This is a patient-controlled summary prepared by [User] for [Clinician/Specialty]. It includes [Sections]. Source documents are attached. Generated [Date]."

### 5.11 Emergency profile lock-screen view

> "[Name]
> DOB: [Year only]
> Allergies: [list]
> Medications: [list with dose]
> Conditions: [major only]
> Blood type: [type]
> Emergency contact: [name + phone]
> Last updated: [date]"

### 5.12 Revocation notification (recipient sees)

> "[User]'s access settings changed."

(No reasons, no specifics, no "you have been revoked." Just a neutral state change.)

### 5.13 Account deletion confirmation

> "We'll remove all your data within 30 days. Audit logs required by law are kept for 7 years and contain only access events, not content. Anything you've shared with family stays with them only as a copy if they saved it — we'll show you exactly what."

### 5.14 Wearable data import — first time

> "FAMILIA will read [list] from Apple Health. We won't write anything back. Your wearable data is private to you by default — you decide if and when to share."

### 5.15 DNA discovery suggestion (later phase)

> "We found a possible biological match. This is a suggestion, not a confirmation. You're in control — connect, hide, or ignore. Whatever you decide, the other person won't be told you saw this."

## 6. Empty-state copy patterns

Every empty state should: (a) name the section, (b) say what fills it, (c) offer a single primary action, (d) never imply the user is doing something wrong.

| Screen | Empty copy |
|---|---|
| Home — first run | "Welcome. Here's where today shows up. Start with a check-in or add something to your profile." [Start a check-in] |
| Conditions | "No conditions yet. Add anything you've been diagnosed with — past or present." [Add condition] |
| Medications | "No medications yet. Add what you take — including supplements and over-the-counter." [Add medication] |
| Vault | "No documents yet. Snap a lab report or upload a PDF to start your record." [Scan] [Upload] |
| Family Overview | "No relatives in your tree yet. You can add anyone — biological, adopted, step, chosen — and decide who sees what." [Add a relative] |
| Insights | "Not enough data yet. After about a week of check-ins, summaries will appear here." |
| Audit log | "No activity yet. We'll log everything — every read, every share, every change." |
| Wearables | "No connected devices yet. We can pull data from Apple Health, Google Health Connect, and more." [Connect] |

## 7. Microcopy patterns

| Pattern | Example |
|---|---|
| Confirmation, low-stakes | "Saved." |
| Confirmation, medium | "Shared with [Person]." |
| Confirmation, high-stakes | "Sent to 3 family members. Undo within 24 hours." |
| Destructive confirm | "This removes [thing] for everyone. Continue?" — single button "Remove", second button "Keep". No "Are you sure?". |
| Loading | Action-specific verbs: "Reading your scan…", "Building your packet…", not "Loading…" |
| Sync state | "Up to date. Last synced [time]." or "Catching up…" |
| Permission denied | "You don't have access to [thing]. Ask [Person] to share." |

## 8. Notification copy patterns

The push payload contains **zero medical content** by default. The notification gets the user to open the app; the app shows the detail.

| Push | Body |
|---|---|
| New alert from family | "[Sender Name] sent you a family health update." |
| Two-key approval requested | "[Other Guardian] needs your approval on a change to [Profile]." |
| Document ready to review | "Your scan is ready to review." |
| Weekly summary | "Your week is ready." |
| Consent expiring | "An access grant to [Person] expires in 7 days." |
| Security event | "Sign-in from a new device. Review now." |

## 9. Localization considerations

- **Translate copy, not metaphors**. "Family circle" doesn't translate well into many languages. Stick with concrete words.
- **Right-to-left support** required for Arabic, Hebrew. Affects layout of family tree diagrams especially.
- **Numeric formats** must respect locale. Lab values, dates, blood pressure conventions vary.
- **Honorifics matter**. In some cultures, addressing relatives by relationship (e.g., "Mother", "Older brother") is more respectful than first names. Allow display preferences.
- **Adoption / family structure norms vary**. Avoid Western-centric assumptions in copy. "Step-parent" and "adopted parent" may carry very different connotations across cultures — never make either feel like a footnote.
- **Mental health stigma varies**. The default sensitive-tier protections matter even more in cultures where mental health is stigmatized. Don't assume Western openness defaults.

## 10. The trust bar — a final test

Before any user-facing string ships, run it through this:

1. Would a calm, kind, knowledgeable friend say this in this moment? If no, rewrite.
2. Does this make a vulnerable user feel safer or more anxious? If anxious, rewrite — unless the moment requires that anxiety (e.g., security event).
3. Is there a word a 12-year-old wouldn't understand? If yes, replace.
4. Does it imply a diagnosis, prediction, or judgment? If yes, rewrite.
5. Would a screen reader user understand it without context? If no, fix.
6. If this string went viral as a screenshot, would we be embarrassed? If yes, rewrite.
