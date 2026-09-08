# ALPHA

Expo SDK 57 + React Native + TypeScript implementation of the ALPHA v19 mobile app.

Published in the Korean stores: Android `1.0.6 (6)` and iOS `1.0.6 (20)`.
Post-release SDK maintenance is tracked in
`release/post-release-status-2026-09-08.md`; these local patches are not in the
published binaries. See
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
