# @familia/seed-tool

Seeds the local dev database with the 6 primary personas from [docs/01_PERSONAS.md](../../docs/01_PERSONAS.md). Idempotent — safe to run repeatedly.

## Safety

Refuses to run unless `DATABASE_URL` contains `familia_dev` or `familia_test`. There is no override flag. **It will never seed production.**

## Run

```bash
pnpm dev:seed
# or directly:
pnpm --filter @familia/seed-tool seed
```
