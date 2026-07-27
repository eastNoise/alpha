#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"
export ANDROID_HOME="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
export ALPHA_ANDROID_SIGNING_PROPERTIES="${ALPHA_ANDROID_SIGNING_PROPERTIES:-/Users/ustone/MCP , API/alpha-android-upload.properties}"
export CI="${CI:-1}"
export NODE_ENV=production

cd "$ROOT_DIR"

if [[ ! -f "$ALPHA_ANDROID_SIGNING_PROPERTIES" ]]; then
  echo "Missing Android signing properties: $ALPHA_ANDROID_SIGNING_PROPERTIES" >&2
  exit 1
fi

npx expo prebuild --platform android --no-install --clean
node scripts/configure-android-release.cjs
printf 'sdk.dir=%s\n' "$ANDROID_HOME" > android/local.properties

(cd android && ./gradlew --no-daemon --max-workers=1 -Dorg.gradle.parallel=false bundleRelease)

VERSION="$(node -p "require('./app.json').expo.version")"
VERSION_CODE="$(node -p "require('./app.json').expo.android.versionCode")"
OUTPUT="${ALPHA_ANDROID_AAB_OUTPUT:-$HOME/Downloads/ALPHA-${VERSION}-vc${VERSION_CODE}.aab}"
cp android/app/build/outputs/bundle/release/app-release.aab "$OUTPUT"
echo "$OUTPUT"
