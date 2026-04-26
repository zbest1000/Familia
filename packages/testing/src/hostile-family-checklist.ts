// The hostile-family review checklist as runnable items.
// See docs/14_TEST_STRATEGY.md §7 and docs/08_TRUST_AND_SAFETY.md §12.

export type HostileFamilyCheck = {
  id: string;
  question: string;
};

export const HOSTILE_FAMILY_CHECKLIST: ReadonlyArray<HostileFamilyCheck> = [
  {
    id: "coercive_partner_monitoring",
    question:
      "Could a coercive partner use this flow to monitor the user?",
  },
  {
    id: "leak_sensitive_to_family",
    question:
      "Could this flow leak sensitive entries to family the user did not intend?",
  },
  {
    id: "revocation_notifies_third_party",
    question:
      "Does revocation in this flow notify a third party in a damaging way?",
  },
  {
    id: "single_user_per_device",
    question:
      "Does this flow assume only one user per device?",
  },
  {
    id: "safest_exit_three_taps",
    question:
      "Is the safest exit accessible in 3 taps from the home screen?",
  },
  {
    id: "viral_screenshot_test",
    question:
      "If a screenshot of this flow ended up on Twitter, would we be embarrassed?",
  },
  {
    id: "ai_no_diagnosis",
    question:
      "Does the AI-generated content in this flow include anything diagnostic?",
  },
  {
    id: "preview_matches_delivered",
    question:
      "Does the message preview match the actual delivered message exactly?",
  },
  {
    id: "audit_log_captures",
    question:
      "Does the audit log capture this flow's actions?",
  },
  {
    id: "recipient_designed_too",
    question:
      "Is the recipient's experience as carefully designed as the sender's?",
  },
];
