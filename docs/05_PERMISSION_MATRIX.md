# FAMILIA — Permission Matrix

The original consent doc defined the model (ABAC, presets, lifecycle, message variants). This doc nails down the **defaults**, **sensitivity tiers**, **preset content**, and the **decision matrix** the engine evaluates. It is intended to be implementable directly.

## 1. Three orthogonal axes

Every access decision is the product of three axes:

| Axis | Values |
|---|---|
| **Sensitivity tier** | Standard / Sensitive / Highly Sensitive |
| **Sharing preset** | None / Emergency / Care bundle / Full record / Custom |
| **Disclosure mode** | Anonymous / Relationship-only / Partial / Identified |

A grant is `(grantor, recipient, scope, sensitivity rules, disclosure mode, time bounds)`.

## 2. Sensitivity tiers

| Tier | Categories | Default behavior | Sharing requires |
|---|---|---|---|
| **Standard** | Conditions (non-psych), allergies, medications (non-controlled, non-HRT, non-psych), immunizations, dental, vision, encounters, labs, wearables, lifestyle, documents (non-sensitive) | Visible per active grants | Single confirmation |
| **Sensitive** | Reproductive health, sexual health, fertility, contraception, controlled substances, substance use history, family relationship status (adopted/biological), legal documents linked to health | Hidden from Care bundle by default | Two-step confirmation, explicit per-category opt-in |
| **Highly Sensitive** | Mental health (psychiatric, therapy notes, mood entries flagged crisis), HRT and gender-affirming care, DNA / genomic data, hidden relationship status (e.g., a parent excluded from the graph), legal/abuse-related notes | **Never** included in any preset. Each entry is shared individually with explicit confirmation each time. | Two-step + sensitive-tier consent, per-entry opt-in. Re-confirmation at 12-month interval. |

> **Tier reclassification**: a user may move a category up a tier (e.g., make all dental records "Sensitive"). They cannot move a category **down** for tiers that are policy-mandated (e.g., DNA cannot be downgraded from Highly Sensitive).

## 3. Sharing presets — what each contains

Presets are **shortcuts**. Every grant is in fact a list of categories. Presets exist to spare the user from clicking a 40-row matrix.

### 3.1 None
- No data shared.
- Relationship may exist in the graph; recipient sees nothing about user's health.

### 3.2 Emergency (the most common starting share)
| Category | Included | Notes |
|---|---|---|
| Name, photo | Yes | |
| DOB | Yes (year only by default; toggle for full date) | |
| Blood type | Yes | |
| Allergies | Yes (all severity tiers) | |
| Active medications | Yes (name + dose; not full prescriber/pharmacy) | |
| Major conditions | Yes (status: active; severity tag) | |
| Emergency contacts | Yes | |
| Care instructions | Yes (free text the user wrote) | |
| Insurance card images | Optional | Off by default for emergency preset |
| **Anything else** | **No** | |

### 3.3 Care bundle (for spouses, primary caregivers, adult children helping a parent)
| Category | Included | Notes |
|---|---|---|
| Everything in Emergency | Yes | |
| Encounters (visits) | Yes (summary list with provider + date + reason) | Notes only if user opts in per-encounter |
| Lab results | Yes (values + reference ranges) | |
| Imaging reports | Yes (report text); images only if opted in | |
| Procedures and surgeries | Yes (list + dates) | |
| Immunizations | Yes | |
| Dental, vision | Yes (basic) | |
| Wearable summaries | Yes (weekly aggregates only) | Daily granularity off by default |
| Check-in summaries | Yes (weekly aggregate) | Individual check-in entries off by default |
| Documents in Vault | Selective — user picks which | |
| Mental health, HRT, reproductive, DNA | **No** | These never auto-include |

### 3.4 Full record (used for self-management, not a typical share preset)
- Everything **except** Highly Sensitive categories.
- Highly Sensitive categories require explicit per-entry sharing even within Full record.
- Typically used by a power-of-attorney holder under a documented arrangement.

### 3.5 Custom
- Free-form per-category checkbox grid.
- The user can also set time bounds, disclosure mode, and a purpose label per custom grant.

## 4. Disclosure modes

How the recipient is told **who** the data is from. Independent of what data is shared.

| Mode | Recipient sees | Use for |
|---|---|---|
| **Identified** | "Maya Reyes" + relationship | Most cases — spouse, immediate family caregiver |
| **Relationship-only** | "Your biological sister" | Hereditary alerts, awkward family dynamics |
| **Partial** | "A close family member" | Optional in extended family alerts |
| **Anonymous** | "A family member in your network" | First-tier hereditary alerts when user chooses to remain unnamed |

> Disclosure mode is set **per alert**, not per grant. A spouse with Care bundle access always sees identified content. Disclosure mode applies to **alerts and notifications**, not to ongoing record reads (where identification is implicit because the recipient knows whose record they're reading).

## 5. Default presets offered when adding a relative

When the user adds a relative, FAMILIA suggests a preset based on the relationship type. The user can always override.

| Relationship | Suggested preset (sender → recipient) | Suggested reciprocal (recipient → sender) |
|---|---|---|
| Spouse / partner | Care bundle | Care bundle |
| Biological parent (living) | Emergency | Emergency |
| Biological parent (user is caregiver) | Emergency (sender), Care bundle (reciprocal — caregiver gets Care bundle on parent) | n/a |
| Biological child (minor) | n/a — guardian model, see [09](09_PEDIATRIC_AND_PROXY.md) | n/a |
| Biological child (adult) | Emergency | Emergency |
| Biological sibling | None (until user wants to share) | None |
| Adoptive parent | Emergency | Emergency |
| Step-parent | None | None |
| Foster parent | None | None |
| Guardian | Care bundle (within scope of guardianship) | n/a |
| Caregiver (paid / friend) | Care bundle (time-bound — default 90 days, renewable) | n/a |
| Cousin, aunt/uncle, nephew/niece | None | None |
| Grandparent / grandchild | Emergency | None |
| Custom | None | None |

## 6. Decision matrix (for the access engine)

This is what `evaluate_access(actor, target, resource, purpose)` decides.

```
Inputs:
  actor: the requesting user
  target: the user whose data is being accessed
  resource: a record with category and sensitivity tier
  purpose: read | export | share-onward | display-in-summary

Steps:

1. Identify the relationship class between actor and target (social and biological — both, neither, or one).

2. Look up the active consent grant from target → actor that covers (resource.category, purpose).

3. If no grant covers → check for emergency-mode override.
   - If actor is in target's emergency-access list AND resource is in Emergency preset → allow (audit as emergency).
   - Else → DENY.

4. If grant exists → check sensitivity tier rules:
   - If resource.tier == "Highly Sensitive":
     - The grant must be a per-entry grant (not preset-derived).
     - Re-confirmation must be within last 12 months.
     - If purpose == "share-onward" → DENY (highly sensitive is non-transitive).
   - If resource.tier == "Sensitive":
     - The grant must opt in this category explicitly.
     - If purpose == "share-onward" → DENY (sensitive is non-transitive by default; user can override per-grant).

5. If grant exists and time-bound → check window. If expired → DENY and surface revocation.

6. If grant is paused (user paused all sharing) → DENY.

7. If actor is a co-managed profile guardian and resource is on the managed profile, additional rules apply (see [09](09_PEDIATRIC_AND_PROXY.md)).

8. If all checks pass → ALLOW.

9. Always: write an audit log entry with decision, inputs, and active policy version.
```

## 7. Categorical examples (illustrative, not exhaustive)

| Scenario | Decision |
|---|---|
| Maya's spouse (Care bundle) views Maya's HbA1c result | Allow — labs in Care bundle |
| Maya's spouse (Care bundle) views Maya's psychiatrist note | Deny — Highly Sensitive, not in any preset |
| Maya (caregiver) views her mom Elena's medication list | Allow — Maya has Care bundle on Elena |
| A friend Maya granted Emergency views Maya's recent encounter list | Deny — encounters are not in Emergency preset |
| Maya granted Emergency to a friend; friend views Maya's allergy list | Allow |
| Maya granted Emergency to a friend; friend tries to export the allergy list | Deny — Emergency preset is read-only display, not export |
| Rosa sends a hereditary alert to her adopted brother | Allow alert to send, with non-genetic message variant. Brother does not receive the underlying record. |
| A user in target's network whose grant has expired tries to read | Deny + surface revocation message in their UI |
| The target user themselves accesses their own data | Always allow (no grant needed) |
| AI digital twin retrieves data to generate a summary | Treated as actor=target+ai, scoped to user's own AI consent settings |

## 8. Audit log requirements

Every access decision logs:
- timestamp
- actor user id (or "ai-summarizer" when AI)
- target user id
- resource id, resource category, resource sensitivity tier
- purpose (read / export / share-onward / display-in-summary)
- decision (allow / deny / emergency-allow)
- consent grant id used (or null)
- policy version
- request source (mobile, web, API, scheduled job)
- outcome (success / blocked / surfaced-to-user)

Audit logs are append-only, exportable by the target user, never by the actor.

## 9. Time bounds and re-confirmation

| Grant type | Default duration | Re-confirmation cadence | Auto-revoke |
|---|---|---|---|
| Emergency | Open-ended | None | Only on user revoke |
| Care bundle | Open-ended | 12 months (gentle nudge to confirm) | No |
| Custom | User-set | Per user setting | At end of window |
| Caregiver (paid) | 90 days | Per renewal | Yes — must renew |
| Highly Sensitive per-entry | User-set, default 30 days | Each share is one-time | Yes |

## 10. Reciprocity rules

A grant from A → B does **not** create a grant B → A. Reciprocal access requires its own grant. Defaults at invite-time may suggest reciprocal grants for spouse, parent, and adult-child relationships — but the recipient always confirms separately.

## 11. Inherited / cascading access

By default, **no** cascade. Granting Care bundle to a spouse does not automatically grant Care bundle to the spouse's parents, even if "everyone in the family" might assume it.

## 12. Emergency override

The "break glass" path:

- Available only to users in the target's emergency-access list.
- Reveals only Emergency preset content.
- Always logged with the loudest possible audit entry.
- Surfaces a notification to the target user immediately ("Your emergency profile was accessed by [Name] at [Time]. If this wasn't expected, [Review]").
- Cannot be silenced.
- Cannot be used for export.

## 13. Data lifecycle and revocation propagation

When a grant is revoked:
- All ongoing reads stop within 5 seconds (server enforces; clients re-validate).
- Cached data on the recipient's device is purged at next app open (or within 24h of revocation, whichever first).
- AI summaries previously delivered to the recipient are not retroactively withdrawn (already-delivered content is not recallable, except for an alert in its 24h recall window).
- Documents the recipient downloaded outside the app (e.g., a saved PDF) cannot be recalled — and the user is told this clearly at export time.

## 14. Sharing-onward / re-disclosure

By default, recipients **cannot share onward** what they have access to. This is enforced in two ways:
- **Technical**: export functions on the recipient side are disabled for content they don't own.
- **Social**: the recipient sees a clear "view only — not yours to share" indicator on every record they don't own.

For grants where the user **does** allow re-disclosure (e.g., Maya allowing her sister to forward Mom's records to a specialist), this is an explicit per-grant toggle and noted in audit.

## 15. Edge cases (cross-reference)

See [07_EDGE_CASES_CATALOG](07_EDGE_CASES_CATALOG.md) for how this matrix behaves under: divorce, death, custody changes, age-of-majority transition, dementia, account recovery, and abuse scenarios.
