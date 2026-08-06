#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
if [[ -z "${JAVA_HOME:-}" ]]; then
  JAVA_HOME="$(/usr/libexec/java_home -v 17 2>/dev/null || true)"
fi
export JAVA_HOME
export ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
export ALPHA_ANDROID_SIGNING_PROPERTIES="${ALPHA_ANDROID_SIGNING_PROPERTIES:-$HOME/.config/east-noise/alpha/android-upload.properties}"
export CI="${CI:-1}"
export NODE_ENV=production

cd "$ROOT_DIR"

if [[ ! -f "$ALPHA_ANDROID_SIGNING_PROPERTIES" ]]; then
  echo "Missing Android signing properties: $ALPHA_ANDROID_SIGNING_PROPERTIES" >&2
  exit 1
fi

if [[ -z "$JAVA_HOME" || ! -x "$JAVA_HOME/bin/java" ]]; then
  echo "Java 17 is required for the Android release build." >&2
  exit 1
fi

if [[ ! -d "$ANDROID_HOME" ]]; then
  echo "Android SDK not found: $ANDROID_HOME" >&2
  exit 1
fi

npx expo prebuild --platform android --no-install --clean
node scripts/configure-android-release.cjs
printf 'sdk.dir=%s\n' "$ANDROID_HOME" > android/local.properties

(cd android && ./gradlew --no-daemon --max-workers=1 -Dorg.gradle.parallel=false bundleRelease)

VERSION="$(node -p "require('./app.json').expo.version")"
VERSION_CODE="$(node -p "require('./app.json').expo.android.versionCode")"
DEFAULT_OUTPUT_DIR="$ROOT_DIR/release/google-play/build"
mkdir -p "$DEFAULT_OUTPUT_DIR"
OUTPUT="${ALPHA_ANDROID_AAB_OUTPUT:-$DEFAULT_OUTPUT_DIR/ALPHA-${VERSION}-vc${VERSION_CODE}.aab}"
cp android/app/build/outputs/bundle/release/app-release.aab "$OUTPUT"
echo "$OUTPUT"
