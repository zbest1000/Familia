# FAMILIA — Personas

Six primary personas anchor design and engineering decisions. Three secondary personas capture important variants the MVP must respect even if it doesn't optimize for them. Anti-personas at the end clarify who FAMILIA is **not** for in the first year.

Each primary persona is built to be specific and inhabitable, not a marketing archetype. If a feature debate ever stalls, ask "what does Maya actually do here?" — not "what does the user want?"

---

## Primary personas

### 1. Maya Reyes — The Organizer (and main account holder archetype)

- **Age 38**, marketing director, Austin TX. Married to Jamal, two kids (Liam 9, Nora 6). Mom (Elena, 67) lives 20 minutes away, manages Type 2 diabetes and recently had a TIA. Dad died of colon cancer at 64.
- **Devices**: iPhone, Apple Watch, MacBook. Comfortable with tech. Uses MyChart for two providers, Quest for labs, Walgreens for pharmacy, Calm for meditation.
- **Health context**: Generally healthy. Hashimoto's, levothyroxine 50mcg daily. Annual mammogram (mom's BRCA2-positive — genetic counseling pending). Mild postpartum depression after Nora, resolved.

**Top jobs-to-be-done**
1. Have one place that knows everything about her health and her mom's, so a new doctor doesn't start from zero.
2. Be ready in 30 seconds when the school nurse calls about Nora's rash.
3. Decide who in the family gets to know what — and change her mind later without confrontation.

**Top anxieties**
1. Forgetting something important when she walks into Mom's neurologist appointment.
2. Sharing too much with her mother-in-law and having it become a topic at Thanksgiving.
3. Her data being sold or breached.

**What success looks like**
She walks into Elena's neurologist appointment with a 1-page printable summary that the doctor actually reads. The doctor's notes from the visit appear in Elena's profile by the next morning. Maya knows her sister Camila saw the summary; Jamal saw only the appointment time.

**What failure looks like**
She uploaded Elena's discharge papers but can't find them three weeks later. Or worse: she added her brother as "biological sibling" and now he gets BRCA-related alerts she never approved.

**Key flows she lives in**: daily check-in (her own, occasionally Elena's), upload-from-camera, share-emergency-with-spouse, send-doctor-packet, alert-recipient-preview.

---

### 2. David Okafor — The Caregiver of an Aging Parent

- **Age 52**, civil engineer, Atlanta GA. Mom Adaeze (78) widowed last year, lives alone, early-stage Alzheimer's. He's the only adult child in the country; his sister Chika is in Lagos and texts daily.
- **Devices**: Pixel, Pixel Watch (recently bought, mostly to see Adaeze's heart rate). Adaeze has a basic Android phone she uses for calls and Pillo medication reminders.
- **Health context (his)**: Hypertension on lisinopril, sleep apnea on CPAP. Sees PCP yearly. Adaeze has Alzheimer's, hypertension, osteoarthritis, history of a hip fracture. Eight active medications.

**Top jobs-to-be-done**
1. Know what Adaeze's medications are at any moment, including what changed at the last visit.
2. Get a heads-up when something is off — missed dose, abnormal vitals, ER visit.
3. Loop Chika in without sending her photos of medication bottles over WhatsApp every week.

**Top anxieties**
1. Adaeze ends up in the ER without her medication list and is given something contraindicated.
2. He becomes the sole keeper of her health story and can't take a vacation.
3. Adaeze finds out he's "tracking" her and feels infantilized.

**What success looks like**
He's a co-manager on Adaeze's profile. Chika has read-only access to medications, appointments, and a weekly summary in English she can forward to her own kids. When Adaeze's smartwatch shows an unusual fall pattern, David gets a push notification, not an alarm.

**What failure looks like**
The app feels surveillance-y. Adaeze refuses to wear the watch. The medication list goes stale because nobody updates it after a visit.

**Key flows**: caregiver setup with two-key sensitive approval, weekly summary export to Chika, medication reconciliation after a visit, fall/anomaly alert from wearable.

---

### 3. Rosa Kim — The Patient with Hereditary Risk (the family communicator)

- **Age 45**, school principal, Portland OR. BRCA1+, found out two years ago after her cousin tested positive. Recently completed prophylactic mastectomy; oophorectomy on the calendar. Married to Hannah, no biological children. Two adult biological half-siblings (different father), one adopted brother.
- **Devices**: iPhone, no wearable.
- **Health context**: BRCA1+, post-surgical, on tamoxifen. Family history of breast and ovarian cancer on her mother's side. Mother passed at 51 from ovarian cancer.

**Top jobs-to-be-done**
1. Tell her two biological half-siblings — only — that they should consider testing, in language that doesn't feel like an emergency.
2. Tell her adopted brother she's having surgery and would love a check-in, **without** implying he's at hereditary risk.
3. Decide if her cousin's adult kids should be looped in (they're not in her family graph yet).

**Top anxieties**
1. Sending an alert that lands like a death sentence.
2. Outing her sister-in-law, who carries the same variant but hasn't told her own kids.
3. Her data ending up with a life insurance company.

**What success looks like**
She sends a hereditary alert to her two biological half-siblings with calm, science-grounded language and a recommendation to talk to a genetic counselor. Her adopted brother gets a different message: "I'm having surgery in three weeks, here's what you should know." She can preview both before sending and has 24 hours to undo.

**What failure looks like**
She sends one generic alert. Her adopted brother thinks he's at genetic risk and panics for a week. Her half-sister forwards the alert to a group chat and Rosa loses control of who knows.

**Key flows**: hereditary alert with multi-recipient preview, disclosure-mode selection, undo window, "support" vs "genetic" message variants.

---

### 4. Jordan Park — The Privacy-Sensitive User (mental health and complex family)

- **Age 29**, software engineer, Brooklyn NY. Queer, non-binary, on weekly therapy and an SSRI. Estranged from biological father; close to mother and stepfather; has an older biological sibling and two younger half-siblings (mom + stepdad).
- **Devices**: Pixel, Garmin, ThinkPad. Highly tech-literate. Uses a password manager, has revoked Apple Health access from three apps in the last year.
- **Health context**: Generalized anxiety + ADHD. Sertraline 100mg, methylphenidate 20mg. Sees psychiatrist quarterly, therapist weekly. Recently started HRT.

**Top jobs-to-be-done**
1. Have one private home for therapy notes, psychiatric records, HRT records — and trust they don't leak via a shared family view.
2. Maintain a family graph that **excludes** their biological father without it being visible to anyone else in the graph that he's hidden.
3. Have an emergency profile for ER visits that does **not** include mental health diagnoses by default.

**Top anxieties**
1. A future controlling partner pressuring them to share access.
2. Their mother seeing therapy notes during a "share with mom" workflow.
3. The HRT timeline becoming visible in a shared health summary.

**What success looks like**
Mental health and HRT records live in a separate sensitive tier with extra confirmation before any sharing. The "share emergency profile with mom" workflow excludes mental health by default and shows them, in plain English, what their mom can and cannot see. The biological father is in the graph as "private — not visible to other family members" and the system never reveals he's been hidden.

**What failure looks like**
A "quick share" preset accidentally includes therapy notes. Their mom asks "what's HRT?" because she saw a medication and Jordan didn't intend that.

**Key flows**: sensitive-tier sharing with extra friction, hidden-relationship-without-leakage, emergency profile excludes-by-default.

---

### 5. Marcus Sullivan — The Co-Parent of a Minor (shared custody)

- **Age 41**, restaurant owner, Denver CO. Divorced from Lana three years ago, 50/50 custody of Maeve (11). Lana lives 15 minutes away, polite but cold relationship. Maeve has Type 1 diabetes, on a Dexcom + Omnipod 5.
- **Devices**: iPhone, Apple Watch. Maeve has an iPhone with the Dexcom app. Lana on Pixel.
- **Health context (Maeve's)**: Type 1 diabetes, well-managed. Allergic to amoxicillin. Annual endocrinology, quarterly labs.

**Top jobs-to-be-done**
1. Co-manage Maeve's profile with Lana so a low at school is handled the same regardless of which parent is on duty.
2. Keep all of Maeve's records in one place — Dexcom data, endo notes, school nurse forms — without one parent gatekeeping the other.
3. When Maeve turns 18, hand the keys over without losing 7 years of data.

**Top anxieties**
1. A custody fight resurfaces and someone tries to use FAMILIA's data as ammunition.
2. He and Lana disagree on a treatment change and the app forces one to "approve."
3. He misses a CGM low because the app over-alerted him into ignoring it.

**What success looks like**
Both parents are equal co-managers on Maeve's profile. Either can update; both see all changes; neither can delete the other. Maeve has a "child view" appropriate for her age. At 18 she gets a guided handoff that preserves history but transfers ownership.

**What failure looks like**
One parent can lock the other out. The app sides with whoever set it up first. Custody documents have to be uploaded as proof to make changes.

**Key flows**: dual-guardian profile setup, audit log visible to both guardians, age-of-majority transition, alert-fatigue tuning.

---

### 6. Robert Bell — The Aging User (still independent)

- **Age 76**, retired teacher, Sarasota FL. Widower (wife passed two years ago). Lives alone in a condo. Two adult daughters (one in Sarasota, one in Seattle).
- **Devices**: iPad (mostly), iPhone (calls and texts), no wearable. Comfortable with iPad mail and Zoom; gets confused by app updates.
- **Health context**: Atrial fibrillation on apixaban, hypertension, prostate cancer in remission, mild macular degeneration. Sees cardiology, urology, ophthalmology, PCP.

**Top jobs-to-be-done**
1. Keep his medication list correct so he doesn't double-dose.
2. Make sure his daughters can step in if he ends up in the ER.
3. Not be made to feel like he can't manage his own health.

**Top anxieties**
1. His daughters monitoring him too closely.
2. Forgetting his next cardiology appointment.
3. Losing his wife's medical history that's in a binder somewhere — he can't bring himself to discard it.

**What success looks like**
Large text. Emergency profile on his lock screen. Both daughters have emergency-only access; the Sarasota one has appointment visibility. He can scan the binder one page at a time and the app builds a timeline of his late wife's records he can choose to keep, share, or eventually delete.

**What failure looks like**
The app is designed for 30-year-olds. He gives up after 4 minutes.

**Key flows**: large-type mode, emergency lock-screen access, single-page-at-a-time scanning, daughter "can see appointments only" preset.

---

## Secondary personas

### 7. Sam Rivera — The Teen Transitioning to Adult Ownership

- **Age 17**, high school junior. Profile has been managed by her mother (Maya, persona 1) since she was 9.
- **Health context**: ADHD on methylphenidate, well-controlled asthma, had an appendectomy at 12.
- **What MVP must support**: a guided handoff at her 18th birthday that gives her full ownership while letting her decide what (if anything) her mother retains. She must be able to make some categories private from day one — including any future mental health entries — without the parent being notified that the category is now hidden.

### 8. Priya Joshi — The Adopted / Donor-Conceived User

- **Age 32**, software designer, San Francisco CA. Adopted at birth (closed adoption from India). Recently took a 23andMe test and found a half-brother she didn't know existed.
- **What MVP must support**: she can have **two separate family contexts** in her graph — her adoptive family (who raised her) and an emerging biological family (who she's just meeting). Adoption status is private by default. The biological half-brother doesn't appear to her adoptive family. DNA discovery is opt-in and the very first match comes with extensive emotional onboarding, not a "you matched!" notification.

### 9. Elena Reyes — The Spouse with Care Bundle Access

- **Age 67**, Maya's mother (persona 1). Type 2 diabetes, recent TIA. Tech-uncomfortable but uses an iPhone for calls and FaceTime.
- **What MVP must support**: she should never be required to log into FAMILIA herself for the basics. Her primary interaction is **as a recipient of shared content from Maya**, via push or email. If she does log in, she should land in a simplified "Care Bundle" view, not the full app.

---

## Anti-personas (who we are NOT building for in year one)

| Anti-persona | Why we're not optimizing for them |
|---|---|
| **The clinician who wants to write notes in FAMILIA** | We are a patient-controlled record, not an EHR. They'll get an export packet. |
| **The biohacker who wants minute-level HRV analytics** | We import wearable data, but the goal is health story, not optimization. |
| **The AI-doctor seeker who wants a diagnosis** | We will explicitly refuse to diagnose. They will be unhappy with us. |
| **The insurance company asking for risk data** | We do not build insurance integrations and will not be a data broker. |
| **The employer wellness program** | Not in year one. We will not enable employer-mandated sharing. |
| **The genealogy hobbyist** | DNA is for hereditary health awareness, not building a Mormon-style ancestry tree. |
| **The hypochondriac looking for symptom checking** | We don't symptom-check. They will ask the digital twin "do I have cancer?" and we will route them to a clinician. |

---

## How to use this doc

When proposing a feature, write in one sentence: "This helps **[persona]** do **[JTBD]** without **[anxiety]**." If you can't, the feature is probably not for the MVP.

When debating defaults, ask: "What should this default to for **Jordan** (privacy-sensitive)? For **Robert** (low tech)? For **Marcus and Lana** (co-parents)?" If the answers conflict, the default is too coarse and needs a setting — but the setting must not be buried.
