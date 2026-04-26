# FAMILIA — Pediatric, Proxy, and Lifecycle Transitions

A family health platform must handle the full life arc: a parent managing a newborn, a teen taking over their own profile, an adult co-managing an aging parent, the cognitive transitions of dementia, and what happens after death. This doc specifies the model.

## 1. Core concept: profile vs account

The original spec uses "user" to mean both. They're not the same.

- **Account**: an authenticated identity. Has credentials, devices, audit log of its own actions.
- **Profile**: a person's health record. May or may not be associated with an account.

The combinations:

| Combination | Example |
|---|---|
| Account + own profile | Maya, age 38 |
| Account + manages another profile | Maya managing Liam (her 9-year-old) and Elena (her mom, with caregiver consent) |
| Profile, no account | Liam (no FAMILIA login of his own); a deceased relative entered manually |
| Account, no own profile (rare) | A pure caregiver with no health record of their own (we don't optimize for this — we encourage them to keep their own profile too) |

A profile always has an `owner_account_id` (the legal/effective owner) and zero or more `co_manager_account_ids`.

## 2. Age tiers for minor profiles

| Age | Profile model | Co-managers | Minor's own access |
|---|---|---|---|
| 0–11 | Parent-owned profile | One or both legal guardians | None (minor doesn't have an account) |
| 12–14 | Parent-owned profile, **teen view** invitation possible | Guardian(s) | Read-only minor account, optional |
| 15–17 | Parent-owned profile, **shared management** mode | Guardian(s) + minor as limited co-manager | Edit own daily entries; cannot revoke guardian access |
| 18 (adult) | Profile transition triggered | Per minor's choice | Full ownership, see §4 |

These age thresholds are defaults configurable per jurisdiction. In some jurisdictions (e.g., for certain mature minor doctrines), 14 may be the relevant threshold. See [11_OPEN_QUESTIONS](11_OPEN_QUESTIONS.md).

## 3. Multi-guardian (shared custody / blended families)

A minor profile supports **N** co-managers, each with a labeled relationship (biological parent, adoptive parent, step-parent, foster parent, court-appointed guardian, custom).

### 3.1 Equal co-managers
By default, all co-managers have equal read and write access. None can:
- Remove another co-manager (without escalation)
- Delete the profile
- Lock another co-manager out
- Hide changes from another co-manager

### 3.2 Mutual visibility
- Every change made by one co-manager is visible to the others in the profile's audit log.
- Push notifications inform other co-managers of clinically meaningful changes (new med, new diagnosis, new visit), respecting their notification preferences.

### 3.3 Two-key approval for sensitive changes
Some changes on a minor profile require **two-key approval** — both guardians must consent within 72 hours:
- Adding/removing a co-manager
- Marking the profile inactive
- Granting Care bundle or Full record access to a non-co-manager
- Sharing Highly Sensitive entries (rare for a minor; e.g., adolescent mental health)
- Initiating profile deletion or major export

When one guardian initiates such a change, the other receives a "[Guardian] requested [action]. Approve or decline within 72 hours." If declined or no response, the change does not proceed.

### 3.4 Custody disputes
See [07_EDGE_CASES_CATALOG#A4](07_EDGE_CASES_CATALOG.md). FAMILIA does not adjudicate; we hold status quo and require documented changes for guardian reassignment.

### 3.5 Age-appropriate views
At age 12+, the minor can have their own (limited) account view of their profile. Viewable by default: their meds, their conditions, their vaccinations, their appointments. Initially **hidden**: psychiatric notes by default (parents must explicitly include the minor's view — we err toward minor privacy here, but the law and parental rights vary by jurisdiction; configurable).

## 4. Age-of-majority transition (turning 18)

This is a high-stakes UX moment that the existing roadmap underspecifies.

### 4.1 Pre-transition (60 days before)
- Both guardian(s) and minor (if they have a teen view account) receive a notice: "[Minor] turns 18 in 60 days. Their profile will transition to their own ownership. Here's how to plan."
- Resources offered: a checklist for the minor, a checklist for the guardian.

### 4.2 On the 18th birthday
- A guided handoff workflow opens for the minor (now a young adult):
  1. **Welcome** — explain that they now own this profile and can decide who keeps access.
  2. **Review your record** — paginate through key sections; they can mark anything they want kept private from former guardians.
  3. **Choose what former guardians retain** — default offered:
     - Emergency-only access
     - Or: keep current Care bundle access (one-tap)
     - Or: revoke entirely
  4. **Set your own preferences** — sensitivity tier defaults, AI consent, notification preferences.
  5. **Confirm**.
- Until the new adult completes the workflow, the previous co-manager arrangement holds. There is **no forced lockout** of the former guardians on the birthday — only the **opportunity** for the new adult to change it.

### 4.3 If the new adult never completes the workflow
- After 6 months, a soft prompt to the new adult: "You haven't claimed your profile yet. We'll continue with your guardians' access until you do." 
- After 18 months: another prompt.
- If never claimed: profile remains under previous management indefinitely. We do **not** lock guardians out without the new adult's action. This is to avoid orphaning records.

### 4.4 Reversal
- If a young adult wants their parents to continue managing (e.g., they're in college and overwhelmed), they can grant Full Record co-management to a parent through the same flow. Reversible at any time.

## 5. Caregiver / proxy delegation (for adults)

Distinct from co-management of a minor profile. This is when an adult voluntarily designates another adult to act on their behalf.

### 5.1 Levels of delegation
| Level | What they can do | Approval required |
|---|---|---|
| **View-only** | Read records per a chosen scope (e.g., Care bundle) | User grants once |
| **Coordinator** | Above, plus: schedule appointments, add notes, upload documents on user's behalf | User grants once |
| **Co-manager** | Above, plus: edit records, manage medications | User grants once + sensitive actions still need user approval |
| **Power of attorney** (POA) | Above, plus: act as user for sensitive actions | Document upload + user attestation; cannot be activated without verification |

### 5.2 Time-bounded by default
Caregiver delegations default to time-bounded:
- View-only: open-ended
- Coordinator: 12 months, renewable
- Co-manager: 6 months, renewable
- POA: linked to validity of underlying legal document

### 5.3 Two-key for sensitive actions
Even with co-manager status, the following require the user's own approval (or POA-with-document):
- Sharing Highly Sensitive entries
- Granting access to a third party
- Account closure / deletion
- Changing recovery contact

### 5.4 Activation of pre-arranged caregiver succession
A user can pre-designate a caregiver who is **inactive** until activated. Activation triggers:
- Self-activation (user opens app, taps "Activate my caregiver")
- Medical attestation (a clinician attests via a signed letter or future provider integration)
- Legal attestation (POA document with court attestation)

Activation upgrades the inactive designated relationship to the caregiver level pre-defined by the user. Always notified to the user (if they can receive notice) and audited.

## 6. Cognitive decline scenarios

Designed for cases like David's mother Adaeze (early-stage Alzheimer's) where capacity is declining gradually.

### 6.1 Soft co-management onset
- The user can voluntarily reduce their own ability to make irreversible changes ("Help me not delete things by mistake"). This is a self-imposed Co-manager-required mode for destructive actions, leaving the user fully in control of read/write of records but requiring the caregiver to confirm deletes, big shares, account changes.

### 6.2 Capacity assessment is not ours to make
FAMILIA does not assess cognitive capacity. It does not "lock out" a user based on usage patterns. Capacity changes are recognized only via:
- Self-initiation
- Pre-defined succession plan + valid activation
- POA + court order

### 6.3 Drift detection (informational)
For caregivers, FAMILIA can surface helpful patterns (with the user's consent at setup): "Adaeze hasn't logged a check-in in 14 days; her Pixel Watch hasn't synced." This is a soft observation, not a clinical opinion.

## 7. Death

### 7.1 Pre-arranged
- "Legacy contact" designated: the named person can request memorial mode after verified death.
- "Legacy plan": user pre-defines what happens — preserve for N months, hand off to specific heir, archive, delete.
- "Legacy notes": optional pre-recorded notes the legacy contact receives ("I'd like my kids to know X about my health history").

### 7.2 Memorial mode
After death and verification:
- Account is locked from new sign-ins.
- Legacy contact can:
  - View what they had access to during the user's life (frozen at point of death)
  - Receive the legacy plan and notes
  - Trigger the user's pre-defined post-death actions
- Active alerts in flight are paused.
- Family members who had access during life retain it according to the legacy plan (user-set).

### 7.3 Without pre-arrangement
- Account dormancy: 12 months after last sign-in, with cross-channel checks.
- After 12 months dormant + no response to multi-channel outreach, account is securely deleted.
- Legal requests (court order, executor with documentation) can override dormancy with manual review.

### 7.4 Co-managed profiles after the owner's death
- Most relevant for parent-managed minor profiles where the parent dies.
- Other co-managers retain their role.
- If only one co-manager existed, transition to surviving guardian or court-appointed guardian per legal documentation.

## 8. Special cases

### 8.1 Emancipated minors
Jurisdiction-dependent. With documentation, an emancipated minor can hold their own account without guardian involvement before 18.

### 8.2 Mature minors (medical decision-making)
In some jurisdictions, minors at certain ages can independently consent to certain medical care (mental health, reproductive, substance use). The product should respect this:
- Minor's own account view can include minor-consent care that is **excluded** from guardian view.
- This is a configurable jurisdictional override. Off by default; turned on per supported jurisdiction.

### 8.3 Foster care
- Foster parents are co-managers with role label `foster`.
- When a child moves between foster placements, transition workflow similar to custody change (A4 in [07_EDGE_CASES_CATALOG](07_EDGE_CASES_CATALOG.md)) — required documentation, status quo until resolved.

### 8.4 Adult dependents with disabilities
- Same model as caregiver delegation, with POA documents likely.
- Some users will use co-manager configuration to allow a parent to continue managing health for an adult child with cognitive disabilities.

### 8.5 Step-family without legal status
- Step-parents have no legal authority to manage a minor's profile by default.
- They can be granted **view** access (e.g., Care bundle) by the legal guardian.
- They cannot become co-managers without a court document.

## 9. Acceptance criteria

- Given a minor profile with two equal co-managers, when one initiates a sensitive change, then the other receives a 72-hour approval request and the change does not proceed without their consent or expiry.
- Given a minor turning 18, when the birthday arrives, then the new adult is offered a guided handoff and the previous co-manager arrangement holds until the new adult acts.
- Given a designated caregiver succession, when activated via the defined channel, then the caregiver upgrades to the pre-defined level and both parties are notified.
- Given a user's death and a verified legacy contact request, when memorial mode is activated, then the account is locked from new sign-ins and the legacy contact gets only the access the user pre-defined.
- Given a custody dispute, when conflicting changes are attempted, then status quo is held and support is engaged before any change to co-manager arrangements proceeds.

## 10. UX implications summary

- The minor profile is a first-class object in the app, not a nested view of a parent's record.
- The co-management surface (Profiles I manage on web) is a separate area with its own audit log.
- The age-of-majority workflow is one of the most carefully designed flows in the entire product — invest in user research before shipping.
- Death and dementia are not edge cases; they are recurring lifecycle events the product must dignify.
