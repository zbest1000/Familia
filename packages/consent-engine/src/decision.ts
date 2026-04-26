import type { Decision } from "@familia/domain";

import { POLICY_VERSION } from "./policy-version";
import { tierForScope } from "./preset";
import type { EvaluateInput, GrantStore } from "./types";

/**
 * Evaluate whether the actor can perform `purpose` on `resource` belonging to `targetUserId`.
 *
 * Implements the matrix in docs/05_PERMISSION_MATRIX.md §6.
 *
 * Invariants:
 * - When in doubt, deny. Never silently allow.
 * - Highly Sensitive scopes require per-entry grants (not preset-derived).
 * - Highly Sensitive purposes excluded from `share_onward`.
 * - Sensitive purposes excluded from `share_onward` unless explicitly enabled per grant.
 * - Emergency-mode access is always audited as such.
 */
export async function evaluateAccess(
  input: EvaluateInput,
  store: GrantStore,
): Promise<Decision> {
  const at = input.evaluatedAt ?? new Date();
  const evaluatedAtIso = at.toISOString();

  // 0. The user can always access their own data.
  if (input.actorUserId === input.targetUserId) {
    return decision("allow", "self_access", null, evaluatedAtIso);
  }

  // 1. Sanity: resource must belong to the target.
  if (input.resource.ownerUserId !== input.targetUserId) {
    return decision("deny", "resource_owner_mismatch", null, evaluatedAtIso);
  }

  const expectedTier = tierForScope(input.resource.category);
  if (expectedTier !== input.resource.sensitivity) {
    // The caller asserted a sensitivity that doesn't match the schema for this scope.
    return decision(
      "deny",
      `sensitivity_mismatch_expected_${expectedTier}`,
      null,
      evaluatedAtIso,
    );
  }

  // 2. Look up active grant.
  const grant = await store.findActiveGrant({
    grantorUserId: input.targetUserId,
    recipientUserId: input.actorUserId,
    scope: input.resource.category,
    purpose: input.purpose,
    at,
  });

  // 3. No grant → check emergency override.
  if (!grant) {
    if (input.resource.category === "emergency_profile") {
      const emergency = await store.isInEmergencyAccessList({
        actorUserId: input.actorUserId,
        targetUserId: input.targetUserId,
      });
      if (emergency && input.purpose === "read") {
        return decision(
          "allow_emergency",
          "emergency_access_used",
          null,
          evaluatedAtIso,
        );
      }
    }
    return decision("deny", "no_active_grant", null, evaluatedAtIso);
  }

  // 4. Sensitivity-tier rules.
  if (input.resource.sensitivity === "highly_sensitive") {
    // Highly Sensitive must be a per-entry grant — never preset-derived.
    if (grant.preset !== "custom") {
      return decision(
        "deny",
        "highly_sensitive_requires_per_entry_grant",
        grant.id,
        evaluatedAtIso,
      );
    }
    // Never transitive.
    if (input.purpose === "share_onward") {
      return decision(
        "deny",
        "highly_sensitive_non_transitive",
        grant.id,
        evaluatedAtIso,
      );
    }
  }

  if (input.resource.sensitivity === "sensitive") {
    // Sensitive must explicitly opt in this category — Care bundle does not include it.
    if (!grant.scopes.includes(input.resource.category)) {
      return decision(
        "deny",
        "sensitive_requires_explicit_optin",
        grant.id,
        evaluatedAtIso,
      );
    }
    // Sensitive non-transitive unless allow_re_disclosure is set.
    if (input.purpose === "share_onward" && !grant.allowReDisclosure) {
      return decision(
        "deny",
        "sensitive_non_transitive_default",
        grant.id,
        evaluatedAtIso,
      );
    }
  }

  // 5. Standard scopes must still be in the grant's scope list.
  if (!grant.scopes.includes(input.resource.category)) {
    return decision(
      "deny",
      "scope_not_in_grant",
      grant.id,
      evaluatedAtIso,
    );
  }

  // 6. Purpose must be permitted by the grant.
  if (!grant.purposes.includes(input.purpose)) {
    return decision(
      "deny",
      "purpose_not_in_grant",
      grant.id,
      evaluatedAtIso,
    );
  }

  // 7. (state, validity windows, pause) are validated by the grant store. Reaching
  //    this point implies an active, valid, in-window grant.
  return decision("allow", "active_grant", grant.id, evaluatedAtIso);
}

function decision(
  result: "allow" | "deny" | "allow_emergency",
  reason: string,
  grantId: string | null,
  at: string,
): Decision {
  return {
    decision: result,
    reason,
    grantIdUsed: grantId,
    policyVersion: POLICY_VERSION,
    evaluatedAt: at,
  };
}
