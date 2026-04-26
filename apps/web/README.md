# @familia/web

The FAMILIA web app — Next.js 14 (App Router), React 18, Tailwind, Radix.

## Sprint-0 status

- App-router shell with three routes:
  - `/` — landing
  - `/(auth)/signin` — sign-in form (not wired)
  - `/(app)/home` — Today dashboard skeleton
- `@familia/ui-web` components in use (`Card`, `Heading`, `Text`)
- Tailwind tokens sourced from `@familia/tokens`
- Strict CSP-friendly headers in `next.config.mjs`
- Dark mode follows OS

## Resilience contract

- Static + SSG-friendly. No runtime dependency on the API for the marketing/landing pages.
- App pages degrade gracefully when API is unreachable: shells render, data sections show "we'll catch up" copy. (Implementation lands in Sprint 1.)
- All sensitive surfaces (sharing, alerts, audit) are server-component-friendly so we never leak data via client hydration of pre-fetched state.

## Local

```bash
cp .env.example .env.local
pnpm dev
```
