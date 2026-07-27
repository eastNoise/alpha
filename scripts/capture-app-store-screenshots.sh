#!/usr/bin/env bash

set -euo pipefail

UDID="${UDID:-0FB30D46-5E71-4146-9734-7ACC23EB42B0}"
APP_PATH="${APP_PATH:-tmp/DerivedData/Build/Products/Release-iphonesimulator/ALPHA.app}"
OUTPUT_ROOT="${OUTPUT_ROOT:-release/screenshots/raw}"
SIMULATOR_DEVICE="${SIMULATOR_DEVICE:-iPhone 17 Pro Max}"
ONLY_LOCALE="${ONLY_LOCALE:-}"

if [[ ! -d "$APP_PATH" ]]; then
  echo "Missing simulator app at $APP_PATH" >&2
  exit 1
fi

click_simulator() {
  local x="$1"
  local y="$2"
  osascript <<APPLESCRIPT >/dev/null
tell application "Simulator" to activate
tell application "System Events"
  tell process "Simulator"
    set targetWindow to first window whose name starts with "$SIMULATOR_DEVICE"
    perform action "AXRaise" of targetWindow
    set {windowX, windowY} to position of targetWindow
    set {windowWidth, windowHeight} to size of targetWindow
    set clickX to (windowX + ($x * windowWidth / 440)) as integer
    set clickY to (windowY + ($y * windowHeight / 956)) as integer
    delay 0.15
    click at {clickX, clickY}
  end tell
end tell
APPLESCRIPT
}

click_simulator_window_offset() {
  local x="$1"
  local y="$2"
  osascript <<APPLESCRIPT >/dev/null
tell application "Simulator" to activate
tell application "System Events"
  tell process "Simulator"
    set targetWindow to first window whose name starts with "$SIMULATOR_DEVICE"
    perform action "AXRaise" of targetWindow
    set {windowX, windowY} to position of targetWindow
    delay 0.15
    click at {windowX + $x, windowY + $y}
  end tell
end tell
APPLESCRIPT
}

capture() {
  local path="$1"
  xcrun simctl io "$UDID" screenshot "$path" >/dev/null
}

capture_locale() {
  local store_locale="$1"
  local apple_language="$2"
  local apple_locale="$3"
  local output_dir="$OUTPUT_ROOT/$store_locale"

  echo "Capturing $store_locale"
  mkdir -p "$output_dir"
  xcrun simctl terminate "$UDID" com.eastnoise.alpha 2>/dev/null || true
  xcrun simctl uninstall "$UDID" com.eastnoise.alpha 2>/dev/null || true
  xcrun simctl install "$UDID" "$APP_PATH"
  xcrun simctl launch "$UDID" com.eastnoise.alpha --args \
    -AppleLanguages "($apple_language)" -AppleLocale "$apple_locale" >/dev/null
  sleep 3
  # Clear a system alert that may survive the previous simulator run.
  click_simulator 320 572
  sleep 1
  capture "$output_dir/01-onboarding.png"

  click_simulator 220 835
  sleep 3
  # A fresh install requests notification permission after onboarding.
  # Dismiss the system alert before driving the in-app scenario.
  click_simulator 320 572
  sleep 2
  click_simulator 44 454
  click_simulator 44 502
  sleep 1
  capture "$output_dir/02-today.png"

  click_simulator 352 885
  sleep 2
  capture "$output_dir/03-course.png"

  click_simulator 88 885
  sleep 1
  click_simulator 220 690
  sleep 2
  capture "$output_dir/04-day-result.png"

  # Use a window-relative point inside the full-size cancel action.
  click_simulator_window_offset 120 675
  sleep 1
  click_simulator 220 885
  sleep 2
  capture "$output_dir/05-records.png"
}

capture_selected_locale() {
  if [[ -z "$ONLY_LOCALE" || "$ONLY_LOCALE" == "$1" ]]; then
    capture_locale "$@"
  fi
}

xcrun simctl bootstatus "$UDID" -b >/dev/null
xcrun simctl status_bar "$UDID" override \
  --time "9:41" \
  --batteryState charged \
  --batteryLevel 100 \
  --wifiBars 3 \
  --cellularBars 4

capture_selected_locale "ko" "ko" "ko_KR"
capture_selected_locale "en-US" "en" "en_US"
capture_selected_locale "ja" "ja" "ja_JP"
capture_selected_locale "es-ES" "es" "es_ES"
capture_selected_locale "de-DE" "de" "de_DE"
capture_selected_locale "fr-FR" "fr" "fr_FR"
capture_selected_locale "zh-Hans" "zh-Hans" "zh_CN"
capture_selected_locale "pt-BR" "pt-BR" "pt_BR"
capture_selected_locale "zh-Hant" "zh-Hant" "zh_TW"
capture_selected_locale "it" "it" "it_IT"

echo "Screenshots written to $OUTPUT_ROOT"
