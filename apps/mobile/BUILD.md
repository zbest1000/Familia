# FAMILIA mobile — build & ship

The Expo app builds to iOS (TestFlight + App Store) and Android (Play Console)
via [EAS Build](https://docs.expo.dev/build/introduction/). Local dev uses
Expo Go or a development build; everything past that goes through EAS.

## One-time setup

### 1. Apple Developer account
- Enroll in the **Apple Developer Program** ($99/year).
- In [App Store Connect](https://appstoreconnect.apple.com/), create a new
  app with bundle id `com.familia.app` (matches `app.json:ios.bundleIdentifier`).
- Note your **Apple Team ID** (visible on the Membership page) and the
  **App Store Connect App ID** (the numeric `ascAppId` from the app's URL).

### 2. Google Play account (deferred — iOS first)
- Enroll in the **Play Console** ($25 one-time).
- Create a service account in Google Cloud → grant it the "Release manager"
  role in Play Console → download the JSON key as `apps/mobile/pc-api-key.json`
  (gitignored).

### 3. EAS / Expo
```bash
# Install once
npm install -g eas-cli@latest

# Sign in to your Expo account (or create one)
eas login

# From apps/mobile/, link the project to an EAS project
cd apps/mobile
eas init
# This populates extra.eas.projectId in app.json — commit it.
```

### 4. Replace placeholders
Edit `apps/mobile/app.json` and `apps/mobile/eas.json`, replacing every
`REPLACE_WITH_*` with the real values from the steps above. **Do not commit
real Apple credentials** — `eas.json` only references IDs, not secrets;
secrets live in EAS's secret store.

## Building

Three profiles, each pinned to a different update channel:

| Profile | Distribution | Use for | Channel |
|---|---|---|---|
| `development` | internal (TestFlight not required) | dev clients on simulator + your test device | `development` |
| `preview` | internal (TestFlight) | beta testers, QA, stakeholder reviews | `preview` |
| `production` | App Store / Play Store | public release | `production` |

```bash
# Development build (simulator)
eas build --profile development --platform ios

# Preview build (TestFlight via internal distribution)
eas build --profile preview --platform ios

# Production build (App Store)
eas build --profile production --platform ios
```

### Submitting to TestFlight / App Store

```bash
# Build first (or grab an existing build by id)
eas build --profile production --platform ios

# Submit the latest production build
eas submit --profile production --platform ios
```

`eas submit` reads `apps/mobile/eas.json:submit.production.ios` for the Apple
ID, ASC app id, and team id.

### OTA updates (no rebuild needed)

JS-only changes ship via EAS Update without going through App Store review.
The runtime version is pinned to `appVersion` (see `app.json:runtimeVersion`)
so an OTA update only lands on builds with the same `version` — bumping
`version` forces a rebuild, which is correct.

```bash
# Push an OTA to production-channel installs
eas update --channel production --message "Fix typo in onboarding copy"
```

## API base URL per environment

The build profile's `EXPO_PUBLIC_API_BASE_URL` env variable wins over the
default in `app.json:extra.apiBaseUrl`. So:

- `development` → `http://localhost:3000` (your laptop)
- `preview` → `https://api-staging.familia.example.com`
- `production` → `https://api.familia.example.com`

Replace `api-staging` / `api` hostnames with whatever the K8s Ingress
(deploy/k8s/60-ingress.yaml) terminates.

## What's deferred

- **App icons + splash**: `app.json` references `./src/assets/icon.png`
  and friends, which don't exist yet. EAS Build will fail until you add
  them. Required: 1024×1024 icon (no transparency), 1242×2436 splash.
- **HealthKit entitlements**: the `NSHealthShareUsageDescription` strings
  are present, but the actual HealthKit entitlement requires adding
  `react-native-health` (or similar) and configuring the iOS entitlement
  via an EAS dev-client build. Sprint 2.
- **Push notifications**: APNs key + EAS push token registration. Sprint 2.
- **Privacy nutrition labels** (App Store): fill out in App Store Connect
  before first submission. Lift the data categories from `docs/08_TRUST_AND_SAFETY.md`.

## CI integration

The recommended pattern: trigger preview builds on every PR to main,
production builds on tagged releases.

```yaml
# .github/workflows/eas-preview.yml — sketch
on:
  pull_request:
    branches: [main]
    paths: ["apps/mobile/**", "packages/ui-mobile/**"]
jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install -g eas-cli
      - run: eas build --profile preview --platform ios --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```
