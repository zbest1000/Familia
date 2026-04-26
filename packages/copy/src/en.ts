// English copy. Patterns are from docs/04_VOICE_AND_TONE.md §5.
// Keep keys descriptive, kebab-style. Use {var} placeholders.

export const en = {
  // Generic
  "action.save": "Save",
  "action.cancel": "Cancel",
  "action.delete": "Delete",
  "action.share": "Share",
  "action.continue": "Continue",
  "action.notNow": "Not now",
  "action.back": "Back",
  "action.confirm": "Confirm",
  "action.undo": "Undo",
  "action.recall": "Recall",
  "action.viewDetails": "View details",
  "action.markAsRead": "Mark as read",

  "state.saved": "Saved.",
  "state.upToDate": "Up to date. Last synced {time}.",
  "state.catchingUp": "Catching up…",
  "state.delayed": "Taking a little longer than usual—we'll post it as soon as it's ready.",

  // Sharing — see Voice & Tone §5
  "share.firstShare":
    "Sharing means {person} will be able to see what's listed below — and only that — until you change it. Updates you make stay current. You can revoke any time.",
  "share.emergency":
    "{person} will be able to see your allergies, current medications, major conditions, blood type, and emergency contacts. They won't see anything else. This stays accurate as you update — you don't need to re-share.",
  "share.mentalHealth":
    "Mental health entries are private by default. Sharing them is a separate decision, made one entry at a time. {person} will see the entries you select — nothing more, nothing later. We'll ask again if you choose to share more.",
  "share.hrt":
    "Hormone-related entries are private by default. Sharing them is a separate decision. {person} will see only what you select. We won't surface this in shared summaries unless you tell us to.",

  // Hereditary alerts
  "alert.hereditary.biological":
    "{sender} has shared that they have been confirmed {marker}. This may be relevant for your own screening decisions. This is not a diagnosis. Consider a conversation with a genetic counselor or your doctor.",
  "alert.hereditary.nonBiological":
    "{sender} has shared a health concern they'd like you to know about. They asked us to share this with family for awareness and support — they are not suggesting you may be affected.",
  "alert.spouse":
    "{sender} shared a health update that may be useful for care, planning, or follow-up. They've included specifics below.",
  "alert.caregiver":
    "{sender} shared a health update that may need follow-up, monitoring, or care coordination.",
  "alert.adultChild":
    "Your {parentRel} shared a health update they'd like you to know about. Read more if you'd like.",
  "alert.minorChild":
    "Someone in your family shared a health update for you to know about. Talk to a parent or guardian if you have questions.",
  "alert.clinician":
    "{sender} shared a structured summary of recent health updates for clinical review. Source documents are attached.",
  "alert.generalFamily":
    "{sender} shared a health update they'd like you to know about.",
  "alert.emergency":
    "{sender} marked this as urgent. They asked us to let you know immediately.",

  // Quiet revocation
  "revocation.recipientNotice": "{user}'s access settings changed.",

  // Push payloads — never include medical content
  "push.alertReceived": "{sender} sent you a family health update.",
  "push.twoKeyApproval":
    "{otherGuardian} needs your approval on a change to {profile}.",
  "push.documentReady": "Your scan is ready to review.",
  "push.weeklySummary": "Your week is ready.",
  "push.consentExpiring": "An access grant to {person} expires in 7 days.",
  "push.securityEvent": "Sign-in from a new device. Review now.",

  // Empty states
  "empty.home":
    "Welcome. Here's where today shows up. Start with a check-in or add something to your profile.",
  "empty.conditions":
    "No conditions yet. Add anything you've been diagnosed with — past or present.",
  "empty.medications":
    "No medications yet. Add what you take — including supplements and over-the-counter.",
  "empty.vault":
    "No documents yet. Snap a lab report or upload a PDF to start your record.",
  "empty.family":
    "No relatives in your tree yet. You can add anyone — biological, adopted, step, chosen — and decide who sees what.",
  "empty.insights":
    "Not enough data yet. After about a week of check-ins, summaries will appear here.",
  "empty.audit":
    "No activity yet. We'll log everything — every read, every share, every change.",
  "empty.wearables":
    "No connected devices yet. We can pull data from Apple Health, Google Health Connect, and more.",

  // Privacy promise
  "promise.title": "Three things we promise.",
  "promise.line1":
    "Your data is encrypted and only you decide who sees it.",
  "promise.line2":
    "We will never sell or share without your consent.",
  "promise.line3":
    "You can export or delete everything, anytime.",

  // Account deletion
  "delete.confirm":
    "We'll remove all your data within 30 days. Audit logs required by law are kept for 7 years and contain only access events, not content. Anything you've shared with family stays with them only as a copy if they saved it — we'll show you exactly what.",
} as const;
