# FAMILIA — Edge Cases Catalog

Family-health software lives or dies on its handling of edge cases. These aren't rare — every family has them. This catalog covers ~30 scenarios in seven categories and prescribes product, copy, and technical responses for each.

> Format: **Scenario** → *what's happening* → **Default behavior** → *what FAMILIA does without explicit user action* → **Recommended product behavior** → *what we should do, including copy and technical implications.*

---

## A. Family graph dynamics

### A1. Divorce — sharing reduction
A user is divorcing a spouse who has Care bundle access. They want to reduce access without an emotional confrontation.

- **Default**: revocation is instant, recipient sees "[User]'s access settings changed." No reasons disclosed.
- **Recommended**:
  - Offer a "Pause sharing" interim state (one tap, recipient still sees relationship but no data) for users who aren't ready to fully revoke.
  - Surface a "post-revoke checklist": review what they downloaded, check audit log, consider revoking emergency override.
  - Never auto-prompt the user to revoke based on relationship type changes — it's not our place to assume.

### A2. Death of a relative who was a co-manager
The user co-managed a parent's profile with their sibling, who has died.

- **Default**: nothing — the deceased account remains a co-manager indefinitely.
- **Recommended**:
  - Provide a "Mark relative deceased" action that:
    - Removes them from active co-manager role
    - Preserves their historical edits in audit
    - Offers to designate a replacement co-manager
  - If the deceased was the **only** co-manager of a managed profile (e.g., a minor's), force a transition workflow (see [09](09_PEDIATRIC_AND_PROXY.md)).
  - Copy: "We're sorry for your loss. Marking [Name] as deceased will remove their access and pause any alerts in their direction. Their past entries stay as part of [Profile]'s history."

### A3. Death of the account owner
The account owner dies. Family wants emergency access to records (e.g., for funeral arrangements, insurance claims).

- **Default**: nothing — the account is closed only on user action, otherwise sits dormant.
- **Recommended**:
  - **Legacy contact** (set up by user in advance): one named person who can request a "memorial mode" for the account.
  - On verified death (death certificate), legacy contact can:
    - Request export of records they had Care bundle access to during the user's life
    - Receive the user's own pre-recorded "in case of death" notes
  - Cannot read anything new the user did not share during their life.
  - Process: documented, manual review by FAMILIA support team. Not self-serve.
  - For users who **didn't** designate a legacy contact: account goes into a 12-month dormancy, then is securely deleted unless a verified legal request is made.

### A4. Custody change for a minor
A minor's custody arrangement changes (one parent loses rights, both gain rights, third-party guardianship).

- **Default**: existing co-managers retain access until manually revoked.
- **Recommended**:
  - "Custody change" workflow that requires uploading a court document (or attestation) before reassigning co-management.
  - Both old and new co-managers receive notice.
  - Audit log permanently records the change.
  - In contested cases: FAMILIA does not adjudicate. We surface "this profile has multiple guardian claims pending" and freeze sensitive changes until support reviews.

### A5. Estranged biological relative wants to be excluded from hereditary alerts
Jordan's biological father is in their family graph as "private" (not visible to other family members). Some relatives might still try to send him hereditary alerts via the graph.

- **Default**: a relative listed in the user's biological graph is a candidate for hereditary alerts unless excluded.
- **Recommended**:
  - Per-relative "Do not alert" toggle, settable by either the alerter or the relative themselves (the relative's setting wins).
  - When the relative has set "Do not contact me about health matters", they are silently excluded from any alerter's recipient picker — with a small note: "Some relatives have chosen not to receive alerts."

### A6. Surprise paternity revealed by DNA
A DNA discovery (phase 4) reveals that a user's biological father is not who they thought.

- **Default**: nothing — DNA discovery is opt-in, all matches are user-confirmed.
- **Recommended**:
  - **Never** display this as a "match" surprise. The opt-in onboarding for DNA discovery includes explicit acknowledgment that "you may discover unexpected family relationships, including parentage that may differ from what you knew."
  - When a high-probability "non-paternal event" pattern is detected, FAMILIA does not surface it as such. It surfaces only as "potential biological relative" with no claim about exact relationship.
  - The product **never** notifies anyone else automatically.
  - Resources for support (genetic counselors, NPE communities) are surfaced gently and only if the user dwells on the match.

### A7. Donor-conceived user discovers a half-sibling
A donor-conceived user (Priya, secondary persona) discovers a half-sibling via DNA discovery.

- **Default**: same as A6 — nothing happens without user action.
- **Recommended**:
  - "Two graphs" model — Priya can keep her adoptive/social family graph entirely separate from her biological discoveries.
  - The new biological half-sibling is added (if Priya wants) only to the biological graph, with the social graph untouched.
  - No relative in either graph is shown the existence of the other graph.

### A8. Adoption disclosure is a third-party secret
A user knows that their nephew is adopted but the nephew himself does not. The user adds the nephew to their family graph.

- **Default**: relationships are private to the relator.
- **Recommended**:
  - Adding a relative as "adopted" is a private fact about the user's view of the relationship — it does not propagate to the adoptee.
  - When the adoptee joins, they don't see how anyone else categorized them.
  - The adoptee's own self-categorization is the only one shown to them.

### A9. Blended family — multiple parents at the same level
A user has biological parents, step-parents, an adoptive parent — five "parent" figures.

- **Default**: family graph supports many parents per child.
- **Recommended**:
  - Graph allows N parents, each tagged by type (biological / adoptive / step / foster / guardian / chosen).
  - UI sorts parents in a user-customizable order on display, with type chips.
  - Hereditary alert logic respects only `biological` type for genetic-relevance routing.

### A10. Polyamorous / multi-partner family
A user has more than one long-term partner.

- **Default**: graph allows multiple `partner` relationships.
- **Recommended**:
  - No "primary" implied by the schema unless the user opts to mark one.
  - Each partner gets their own preset configuration; sharing decisions are independent.
  - Relationship visibility (whether other partners can see one another) is user-controlled.

---

## B. Lifecycle transitions

### B1. Minor reaching age of majority (18 in most US jurisdictions)
A minor whose profile has been parent-managed turns 18.

- **Default**: nothing — the parent could continue to manage indefinitely.
- **Recommended**:
  - 60 days before the 18th birthday: gentle prompt to parent and minor (if minor has a teen view) to plan the transition.
  - On the birthday: a guided handoff workflow — minor reviews everything in their record, decides what to keep private from parent post-handoff, accepts ownership.
  - Default after handoff: parent retains **emergency-only** access; everything else requires explicit grant by the new owner.
  - Handoff can be deferred at the new adult's request (e.g., they want their parent to continue managing while they're in college).
  - See [09](09_PEDIATRIC_AND_PROXY.md) for full flow.

### B2. Cognitive decline of account owner — pre-arranged caregiver activation
A user with early dementia loses capacity. They previously designated their adult child as caregiver.

- **Default**: caregiver has whatever Care bundle access was previously granted.
- **Recommended**:
  - Users can pre-designate a "succession caregiver" who, on activation by:
    - The user themselves (best case), or
    - A verified medical/legal attestation (clinical opinion, power-of-attorney document upload)
  - Receives expanded access according to a pre-defined "succession plan" the user wrote.
  - Activation is always logged, both parties notified.
  - Cannot be activated unilaterally without verification.

### B3. Terminal illness — preparing to hand off
A user with a terminal diagnosis wants to set things up for their family.

- **Default**: standard sharing controls available.
- **Recommended**:
  - "Legacy planning" optional flow surfaces:
    - Designate legacy contact (see A3)
    - Pre-record "in case of death" notes (free text, optional voice memos)
    - Pre-define what happens to the account after death (preserve / archive / delete after N months)
    - Pre-grant escalated permissions to specific family members effective on death
  - Copy: matter-of-fact, never morbid. "Some users use this to plan ahead."

---

## C. Account management

### C1. Lost device, no biometric
User's phone is lost; biometric unlock unavailable.

- **Default**: account-level password fallback, MFA recovery codes.
- **Recommended**:
  - Multiple recovery options offered at signup (any 2 of: recovery codes, recovery email, hardware key, designated recovery contact).
  - Recovery contact: a relative who can confirm identity via a separate channel (NOT the lost device). Their confirmation triggers a 24-hour delay before access is restored — to thwart social engineering.

### C2. Forgot MFA, no recovery codes
- **Default**: support-mediated recovery with strong identity proofing.
- **Recommended**:
  - Document upload (government ID + selfie + handwritten code).
  - Cooldown period (3–7 days) before recovery completes.
  - Recovery is **not** instant. Users are warned about this at MFA setup.

### C3. Account compromise suspected
User suspects their account has been accessed.

- **Default**: standard "review devices" view in Settings → Security.
- **Recommended**:
  - Single button: "Sign out everywhere and reset". This:
    - Invalidates all active sessions
    - Forces password and MFA re-setup
    - Audits the user through every recent access
    - Optionally pauses all family-shared access (recipient sees "paused due to security review")
  - Audit log highlights anomalies (new device, unusual location).

### C4. Account closure
User wants to delete account.

- **Default**: 30-day soft delete, then permanent deletion.
- **Recommended**:
  - Pre-deletion options:
    - Export all data (PDF + JSON + FHIR bundle)
    - Designate a legacy data inheritor (one-time export to a trusted person)
  - 30-day reversible window with clear copy: "You can restore your account within 30 days. After that, your data is permanently deleted."
  - Family members lose their access to the user's data immediately on initiated deletion (not waiting 30 days), with notice "Their account is being closed."

---

## D. Data quality and integrity

### D1. Conflicting data from two sources
FHIR import says A1c is 7.2 on 3/14; uploaded lab PDF for the same date says 6.9.

- **Default**: dedupe heuristic prompts user.
- **Recommended**:
  - Show both with provenance. User picks which is canonical, or marks both as "see source."
  - Both retained in record history with clear source labels.

### D2. Duplicate records from import
FHIR brings in 5 instances of the same med because of refill events.

- **Default**: each kept as a record.
- **Recommended**:
  - Aggregation engine detects same med + overlapping date ranges, merges into a single "Medication" with a "fill history" sub-list.
  - Original records remain in source-of-truth audit.

### D3. Wrong family member tagged
User attributes a condition to the wrong relative.

- **Default**: editable.
- **Recommended**:
  - "Move to a different relative" action (without losing the entry).
  - Audit shows the move.

### D4. Stale data
Wearable hasn't synced in two weeks; user is also off check-ins.

- **Default**: surfaces as a quality flag.
- **Recommended**:
  - Subtle "Last synced 2 weeks ago" label on the wearable card.
  - AI summaries explicitly say "Recent wearable data is unavailable."
  - No nag.

### D5. Wrong relationship type
User added someone as "biological sibling" who is actually a half-sibling, or vice versa.

- **Default**: editable, but downstream alerts may have already routed.
- **Recommended**:
  - Editing a relationship type prompts: "This may affect what alerts they receive in the future. Past alerts won't change."
  - Genetic-relevance logic re-evaluated for future events only.

---

## E. Sharing edge cases

### E1. Recipient on a shared device
Maya's mom Elena uses an iPad shared with Maya's brother. He could see Elena's data if it auto-opens.

- **Default**: app sign-in required.
- **Recommended**:
  - "Shared device mode" toggle that enforces re-auth on every open and disables persistent push notification content.
  - Per-app-instance device fingerprint logged in audit.

### E2. Doctor visit — temporary clinical access
Maya wants her PCP to see her records during a visit, without a permanent grant.

- **Default**: export packet (PDF + secure link).
- **Recommended**:
  - Short-lived "Visit pass" — a temporary read-only link (default expiry 4 hours) with PIN.
  - Doctor opens link, views structured records (subset chosen by user).
  - Audit captures access events.
  - Pass auto-expires; user can revoke instantly.

### E3. Spouse refuses to consent to reciprocal share
Maya offers Care bundle to Jamal; Jamal accepts but doesn't share back.

- **Default**: one-way grant.
- **Recommended**:
  - One-way grants are perfectly valid.
  - No nag on either side.
  - Maya sees "Sharing one-way" indicator; not framed negatively.

### E4. Jealous family member trying to gain visibility
A user's mother-in-law repeatedly requests sharing.

- **Default**: requests are allowed.
- **Recommended**:
  - User can mute a person's sharing requests for a configurable period or permanently.
  - "Block from inviting" prevents new invite attempts.
  - Other family members are not informed of the block.

### E5. Sharing summary the user didn't realize they shared
User shared "weekly summary" but didn't realize it included a sensitive entry that wasn't pre-flagged.

- **Default**: shared per preset.
- **Recommended**:
  - The system is **conservative**. Sensitive-tier entries are auto-excluded from any AI-generated summary regardless of preset.
  - User can opt sensitive entries into summaries individually with explicit confirmation.

### E6. Recipient screenshot a sensitive record
Recipient takes a screenshot of a record the user didn't expect them to keep.

- **Default**: not preventable.
- **Recommended**:
  - Be honest in the UI: "Once shared, this can be viewed and may be saved. We can't prevent screenshots."
  - For Highly Sensitive sharing, consider watermarking the recipient's view with their own name and timestamp.

### E7. Recipient onward-shares (re-disclosure)
A recipient with read access wants to forward a record to their own care team.

- **Default**: no — recipients cannot share onward.
- **Recommended**:
  - Per-grant toggle "Allow re-disclosure". Default off.
  - When on, every onward share is logged and visible to the original owner.
  - Recipient can request re-disclosure from the owner without it being granted automatically.

---

## F. DNA / hereditary edge cases (phase 4 design surface)

### F1. DNA match suggests a relationship the user is not ready to know
- See A6 — never automatic.
- Add: "I'm not ready to see new matches" toggle that pauses match surfacing for a user-defined period.

### F2. A relative wants to revoke their DNA participation after a match has been made
- The relationship in the social graph is preserved if both confirmed it.
- The DNA-derived inferred edge is removed.
- Past hereditary alerts that were sent are not retracted; future ones use the updated graph.

### F3. Carrier vs affected — different hereditary message
A user is a carrier of a recessive condition (no clinical impact for them, but relevant to children).

- **Recommended**: hereditary alert for these cases uses **carrier-aware language** that distinguishes "you may be a carrier; this matters for family planning" from "you may develop this condition."

### F4. Inconclusive DNA match (3rd cousin or further)
- Not surfaced as a match. Discoverable only via explicit "show distant matches" toggle.

---

## G. Trust and emotional edge cases

### G1. User reading their own record gets distressing news
A user opens an OCR-extracted lab and sees a critical flag they hadn't been told about.

- **Default**: the flag is shown.
- **Recommended**:
  - When ingesting documents containing critical-flag values, FAMILIA does **not** create an alarming notification. The document goes to staging review like any other.
  - On opening, critical values are shown with neutral language and a single suggestion: "This value is outside the typical range. Worth a conversation with your doctor."
  - We do not interpret. We do not catastrophize.

### G2. AI summary surfaces something the user didn't want to think about
A weekly summary mentions "you reported feeling sad on 3 days this week."

- **Recommended**:
  - The user can dismiss any summary card.
  - The user can opt out of mood-related summaries while keeping mood logging.
  - Summaries respect a "tone" setting: factual / supportive / minimal.

### G3. Family member receives an alert at a bad time
Recipient of a hereditary alert is in a difficult life moment (e.g., postpartum, recent bereavement).

- **Recommended**:
  - Recipients can set "Quiet period" (a date range) during which non-emergency alerts hold.
  - Senders see "[Person] has set a quiet period — your alert will deliver on [date]" before they confirm.
  - Senders can override only for emergency-tier alerts.

### G4. Coercive partner pressuring user to share more
See [08_TRUST_AND_SAFETY](08_TRUST_AND_SAFETY.md) for the full pattern. Key product hook: a "duress profile" or "discreet revocation" pattern that doesn't notify the abuser.

---

## How to use this catalog

For each MVP feature being designed: walk through the relevant categories and confirm the feature handles each scenario gracefully. Add new scenarios here as they emerge from beta.
