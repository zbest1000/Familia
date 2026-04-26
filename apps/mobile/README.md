# @familia/mobile

The FAMILIA mobile app — React Native via Expo (SDK 51), TypeScript, React Navigation.

## Sprint-0 status

- 5-tab bottom navigation (Home / Health / Family / Insights / Settings) per docs/02.
- Each screen is an empty-state shell using `@familia/ui-mobile` components.
- Metro configured for the pnpm monorepo (workspace package resolution).
- Permissions declared in `app.json`: camera, biometric, photo library, Apple Health, Android Health Connect.
- Tokens come from `@familia/tokens` — colors, spacing, type are NOT hardcoded.

## Resilience contract

- App opens and tabs work without a network connection. Data sections show "we'll catch up" copy when API is down. (Implementation lands in Sprint 1.)
- Token storage via `expo-secure-store` (hardware-backed where available).
- Biometric unlock via `expo-local-authentication`.
- Wearable sync runs as background fetch with retries — see docs/06 §3.

## Local

```bash
cp .env.example .env
pnpm start
# Then press i (iOS sim) or a (Android emulator)
```
