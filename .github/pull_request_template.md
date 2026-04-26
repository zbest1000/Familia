# What this changes

<!-- One paragraph: what the user-visible or system-visible change is. -->

## Why

<!-- Link to docs/ or issue. Why is this change being made? -->

## How to verify

- [ ] Unit tests added/updated
- [ ] Integration tests if cross-service flow changed
- [ ] Privacy/consent invariant tests if access logic changed
- [ ] Manual verification steps (optional, listed below)

```
# Steps to verify locally
```

## Privacy & safety review

If this PR affects sharing, alerts, family relationships, or any sensitive surface, complete the **hostile-family review** from `docs/14_TEST_STRATEGY.md` §7 and link the checklist here.

- [ ] Could this enable a coercive partner to monitor the user?
- [ ] Could this leak sensitive entries to family the user didn't intend?
- [ ] Does revocation in this flow notify the wrong people?
- [ ] Is the safest exit accessible in 3 taps?
- [ ] Does the message preview match the actual delivered message?
- [ ] Does AI-generated content avoid diagnostic language?
- [ ] Does this assume only one user per device?
- [ ] N/A — does not touch sharing, alerts, or sensitive surfaces

## Resilience review

If this PR adds or modifies a service or worker:

- [ ] Documented degraded mode in package README's `## Resilience contract`
- [ ] Outbound calls use circuit breakers
- [ ] Idempotency keys honored
- [ ] Health check endpoints functioning
- [ ] N/A — pure UI / docs / config

## Schema / migration plan

- [ ] No schema change
- [ ] Schema change with migration; tested forward & backward; documented in PR description

## Screenshots / recordings

<!-- Required for UI changes. Mobile and web. -->
