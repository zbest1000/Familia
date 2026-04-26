# @familia/state-machines

Hand-rolled, side-effect-free state machines for the four critical lifecycles:

- **invite** — family invitation tokens
- **consent** — consent grants
- **alert** — context-aware alerts (with 60s undo + 24h recall windows)
- **comanager** — co-manager status and sensitive-action two-key approvals

These are the source-of-truth transition tables. The API uses them on every state-changing endpoint to guarantee consistent and auditable state changes. The mobile and web apps use them to compute valid client-side actions.

See [docs/13_API_STATE_MACHINES.md](../../docs/13_API_STATE_MACHINES.md) for the full design.

## Resilience contract

Pure functions — no I/O, no failure modes. Returning `{ error: 'invalid_transition' }` is the only failure path; the API logs and rejects.
