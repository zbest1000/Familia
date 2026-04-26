# @familia/copy

Typed copy library. **Every** user-facing string in FAMILIA passes through here. UI code never embeds string literals.

Why centralized:
- Translations are added by adding a locale file (e.g., `es.ts`).
- Voice review can be done in one place.
- Search-and-tweak is one find-replace away.

See [docs/04_VOICE_AND_TONE.md](../../docs/04_VOICE_AND_TONE.md) for voice principles and the source for these strings.

## Resilience contract

Pure data package — no runtime dependencies, no failure modes.
