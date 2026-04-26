# @familia/testing

Shared test infrastructure: factories, persona fixtures, and the hostile-family review checklist.

- `factories` — minimal-but-realistic factories for `User`, `Medication`, `FamilyRelationship`, `ConsentGrant` with override support.
- `personas` — the 6 primary personas from [docs/01_PERSONAS.md](../../docs/01_PERSONAS.md), used by `tools/seed`.
- `hostile-family-checklist` — the [docs/08 §12](../../docs/08_TRUST_AND_SAFETY.md) review questions, programmatically.

## Resilience contract

Test-only — never imported by production code.
