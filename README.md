# ALPHA

Expo SDK 57 + React Native + TypeScript implementation of the ALPHA v19 mobile app.

Published in the Korean stores: Android `1.0.6 (6)` and iOS `1.0.6 (20)`.
Maintenance release `1.0.7` is submitted: Android code `7` (production and closed
Alpha track), iOS build `21` (waiting for review, automatic release after approval).
These patches are not yet in the published `1.0.6` binaries. Current evidence and
remaining external gates are in `release/release-status-1.0.7-2026-09-08.md`.
Earlier post-release maintenance is in
`release/post-release-status-2026-09-08.md`. See
`release/google-play/release-status-2026-09-03.md` and
`release/ios/release-status-2026-09-03.md` for the verified build and
submission states.

## Project

- Native React Native components, not a WebView wrapper
- Expo SDK app with generated iOS project for Xcode/TestFlight workflows
- AsyncStorage-backed local routine, closing, and reflection state
- Design tokens in `src/theme.ts`
- Visual assets in `assets/visuals/`

## Reference Docs

The original ALPHA v19 planning and design handoff files are kept in:

- `docs/alpha-v19/alpha_v19_codex_handoff.md`
- `docs/alpha-v19/alpha_v19_designer_planning.md`
- `docs/alpha-v19/alpha_v19_reference_protocol_v8.html`

## Commands

```sh
nvm use 22 # Node.js 22.13 or newer
npm install
npx expo start
npx tsc --noEmit
npm run verify:core
npm run verify:i18n
npm run verify:google-play
npm run verify:xcode
npm run build:android:release
```

The Android release build regenerates the native project with Expo Prebuild.
The local iOS config plugin keeps the ten localized photo-permission strings
when the iOS project is regenerated.
