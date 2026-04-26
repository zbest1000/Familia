# FAMILIA — Trust & Safety

The security doc covers the cryptography, the audit, and the HIPAA posture. This doc covers what's harder: **the abuse vectors**, especially intimate-partner and family-driven coercion, that a family-health platform must anticipate. These are not theoretical — every consumer health and family-coordination product encounters them.

The policies here protect the user from people who already have proximity, trust, or legal leverage — the threat model that conventional infosec misses.

## 1. Threat model

| Actor | Motivation | Channel |
|---|---|---|
| **Coercive intimate partner** | Control, surveillance, retaliation | Forced sharing, password coercion, account takeover |
| **Estranged family member** | Information access, emotional revenge | Social-engineered invite, claims of caregiver status |
| **Custody adversary** | Legal advantage, child surveillance | Profile takeover, weaponized records |
| **Stalker / ex-partner** | Surveillance, harassment | Account compromise, location inference |
| **Employer / insurer** | Risk underwriting, employment decisions | Coerced data access, leaked exports |
| **Identity thief** | Financial gain, medical identity fraud | Account takeover |
| **Foreign government** | Surveillance, persecution (e.g., LGBTQ+ users in hostile jurisdictions) | Legal request, infrastructure compromise |
| **Account-recovery social engineer** | Account takeover via support pretext | Customer support, recovery contact pressure |
| **Insider (FAMILIA employee)** | Curiosity, malice, third-party bribery | Internal admin tools, log access |

This doc focuses on the first six — the ones the product itself can defend against. Insider threats are governed by [08_SECURITY_COMPLIANCE](../initial%20idea%20docs/08_SECURITY_COMPLIANCE.md).

## 2. The intimate partner abuse pattern (most important)

This is the single most-studied threat in family-coordination apps. Patterns from the literature:

1. Abuser sets up the account "for both of us" or insists on shared credentials.
2. Abuser monitors logs, alerts, location data.
3. Victim attempts to revoke or hide; revocation triggers retaliation.
4. Victim cannot exit safely because exit is visible.

### Product responses

#### 2.1 No coupled accounts
FAMILIA does not support "joint accounts." Every user has their own account. Sharing is always between two distinct accounts. There is no setting that requires both spouses to act together to manage either's data, except for co-management of a third-party profile (a child, an aging parent).

#### 2.2 Quiet revocation
When access is revoked, the recipient sees only "[User]'s access settings changed." Never a reason. Never a timestamp of the original grant. Never a history of what was revoked.

#### 2.3 Audit log privacy
The audit log is visible only to the **target user** (whose data it is). Recipients cannot see what the target user reads about the recipient's access. A grantor can always see who read what; a recipient cannot see what the grantor saw about them.

#### 2.4 Discreet exit
A "Reset all sharing" action lets a user revoke all grants in one step without per-recipient notifications beyond the standard quiet-revocation. The action is undoable for 60 seconds locally but irreversible to recipients (it doesn't restore in their view automatically).

#### 2.5 Duress / panic gesture (consideration, MVP+1)
A configurable gesture (e.g., specific PIN entry, long-press hold of the app icon) puts the account into "duress mode":
- Hides Highly Sensitive entries from the visible UI temporarily
- Shows a sanitized view of the app
- Does not log the duress activation visibly to the abuser
- Sends a quiet alert to a designated trusted contact (optional)

This is a complex feature with abuse potential of its own (false alarm fatigue, misuse). Plan for **MVP+1**, with deliberate user research before shipping.

#### 2.6 Emergency exit checklist
A single screen accessible without unlocking the full app: "Leaving a difficult situation? Here's what to do." Provides:
- One-tap revoke all sharing
- One-tap force sign-out on every device
- One-tap mute all incoming alerts from a specific person
- Resources for domestic violence support (clearly labeled as external — we do not host this)

#### 2.7 No "shared device" assumption
The app never trusts that the device has only one user. Biometric/PIN required on every open by default. "Trusted device" is a per-device, per-account concept and can be revoked from any other device.

## 3. Account takeover defenses

### 3.1 MFA on by default
MFA is required, not optional, after first session. The user picks the second factor (TOTP, WebAuthn/passkey preferred over SMS).

### 3.2 New-device sign-in friction
A sign-in from a new device requires:
- MFA challenge (always)
- Email and push notification to all other active sessions: "New sign-in from [device], [city]. Was this you?" with one-tap "No, sign me out everywhere."

### 3.3 Sensitive-action elevation
For sensitive actions (changing recovery email, changing MFA, deleting the account, exporting all data), the user must re-authenticate within the last 5 minutes — even if they're already signed in.

### 3.4 Recovery contact friction
If the user has a recovery contact (a designated relative who can help with account recovery):
- Recovery contact requests trigger a **24-hour delay** before recovery completes.
- The user receives notifications on every other channel (email, push to other devices, secondary phone) during the delay.
- The recovery contact must verify with a code sent through a different channel than the user's primary.

This makes pretexting attacks ("hi support, I'm the user's spouse and they're in the hospital") slow enough that the legitimate user can intercept.

### 3.5 No account recovery without proof
Customer support cannot reset an account based on a phone call, email, or social pressure. Recovery requires:
- Government ID document upload + selfie
- Cooldown period (3–7 days)
- Notification to all other channels during the cooldown

This is an inconvenient UX. We choose it deliberately.

## 4. Phishing defenses

### 4.1 Invite link integrity
Family invite links (Flow 3) are:
- Single-use
- 10-minute TTL
- Bound to the sender's account at issuance
- Display the **sender's name and photo** on the recipient side, so an impersonator using a fake link can be spotted
- Show on the sender's side a clear "this link can be opened by anyone with the link — only send to people you trust"

### 4.2 Anti-phishing copy
We never send emails that say "click here to verify your account" with a generic URL. Account verification, password reset, and MFA enrollment use:
- Branded, distinct-looking emails
- Codes the user enters into the app, not links the user clicks (preferred for sensitive actions)
- A clear "FAMILIA will never ask you for your password or recovery code" footer

### 4.3 Push payload sanitization
Push notification content never includes medical information. "Maya sent you a family health update" is the maximum. The user must open the app and authenticate to see any detail.

## 5. Custody and legal weaponization

### 5.1 We are not a court of law
FAMILIA does not adjudicate custody disputes, divorces, or relationship validity. When two parties claim conflicting rights (e.g., both claim to be the child's primary guardian), FAMILIA freezes the contested change and surfaces it to support, who can:
- Request documentation (court order)
- Maintain status quo until resolved
- Refer the parties to legal counsel (we do not provide legal advice)

### 5.2 Data discovery requests
If FAMILIA receives a legal request (subpoena, court order) for user data:
- We notify the affected user **before** complying, except where law forbids notice (in which case we challenge the gag order to the extent legally permissible).
- We comply only with the minimum data required.
- We log every request and publish an annual transparency report.

### 5.3 Co-managed profiles in custody disputes
If two co-managers of a child's profile are in legal dispute:
- Both retain read access by default (changing this requires court documentation).
- Either can request a freeze on **changes** by the other.
- Sensitive changes require both guardians' approval (two-key) — see [09](09_PEDIATRIC_AND_PROXY.md).

## 6. Stalker / ex-partner scenarios

### 6.1 No location inference
FAMILIA does not infer or expose user location based on health data. Lab visits, hospital admissions, and pharmacy refills are never displayed with mappable precision in shared views.

### 6.2 No "last seen" indicators
Family members never see whether the user is "online" or recently active in FAMILIA. There is no presence indicator.

### 6.3 Deletion of past sharing relationships
A user can delete a person from their family graph entirely. This:
- Revokes all grants (in both directions)
- Removes the relationship edge from both users' graphs
- Removes the deleted relative from the user's audit-log filter (the audit entries themselves remain for compliance, but the relative no longer appears in any UI)
- Does not notify the deleted relative beyond the standard quiet-revocation

### 6.4 Anti-stalking emergency
A separate "report this person" flow surfaces internal moderation review. We do not host moderation or community features in MVP, but the surface exists for severe cases.

## 7. Employer / insurer protection

### 7.1 No employer integrations in MVP
We do not build employer wellness program integrations in year one. When we eventually do, the user will be the **gating party** between the employer and any data flow — the employer will never see anything FAMILIA can identify the user with.

### 7.2 No insurer integrations
We do not sell, broker, or facilitate the sale of user data to insurers. This is in the privacy promise. Coerced sharing (an insurer asking the user to grant access via the app) is harder to defeat technically — we mitigate via:
- Audit logs the user can review
- Time-bound grants by default (so coerced sharing has a natural expiry)
- The user always sees who is requesting and what

### 7.3 Export watermarks
Doctor packets and exports include a watermark with the export timestamp and user name, making it traceable if leaked. (Watermarks don't prevent leaks; they discourage casual ones.)

## 8. Foreign jurisdictions / hostile contexts

For users in jurisdictions hostile to specific health categories (HRT, reproductive care, mental health):

### 8.1 Data residency choice
Users in supported jurisdictions can choose data residency at signup (US, EU, others as supported). Data does not transit to other regions for processing.

### 8.2 Categorical hiding
Users can hide entire categories from the UI altogether (the data is still stored encrypted and accessible to the user, but won't appear in default views — useful if a device is searched).

### 8.3 No third-party data sales — period
This is the simplest defense. We have no commercial reason to expose user data to brokers, ad platforms, or anyone else. Our business model (subscription + family plans) does not depend on data exposure.

### 8.4 Transparency reports
Annual report on government and legal requests received and complied with.

## 9. Insider threat

(Briefly, since the security doc covers technical controls.)

- All FAMILIA employee access to user data requires:
  - A documented purpose
  - User consent OR a legitimate support ticket from the user
  - Time-bound access
  - Audit logged and reviewed
- No "god mode" account.
- Customer support sees only the data necessary for the active ticket, with explicit user consent through a support-mediated grant.
- Internal access is **visible to the user** in their audit log, with the same provenance as any other access.

## 10. Telemetry minimization

- We do not log content. We log events.
- Crash reports are scrubbed for any payloads that could contain medical content.
- Analytics is privacy-preserving: aggregated, no per-user behavioral profiles, no third-party SDKs in the medical surfaces.
- Users can opt out of analytics entirely without losing functionality.

## 11. Tooling for the user

Make sure the user can always:

| Action | How |
|---|---|
| See who has access to what | Settings → Sharing → Active grants |
| See who accessed what, when | Settings → Privacy → Audit log |
| Revoke any access | Person detail → Manage access; or Settings → Sharing → Active grants |
| Mass-revoke | Settings → Sharing → Reset all sharing |
| Block a person from inviting | Person detail → Block |
| Sign out of all devices | Settings → Security → Sign out everywhere |
| Force MFA reset | Settings → Security → Reset MFA |
| Set quiet period for incoming alerts | Settings → Notifications → Quiet period |
| Hide a relationship from other family members | Person detail → Visibility |
| Mark a category Sensitive | Settings → Privacy → Sensitivity tiers |
| Activate emergency exit | Settings → Security → Emergency exit |
| Export all data | Settings → Export |
| Delete account | Settings → Account → Delete |

Every one of these is reachable in **3 taps from the home screen**.

## 12. The "hostile family" design review

For every new feature, run this review:

1. Could this feature be used by a coercive partner to monitor the victim?
2. Could this feature reveal information the victim didn't intend (e.g., that they're in therapy, that they're transitioning, that they had an abortion)?
3. Could this feature be used to socially engineer the victim into giving up access?
4. Does revoking this feature notify the wrong people?
5. Is the safest exit hidden behind 5 taps?

If any answer is "yes" or "I'm not sure", the feature does not ship.
