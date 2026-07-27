#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/release/screenshots/upload"
OUTPUT_DIR="$ROOT_DIR/release/google-play/screenshots"

LOCALE_MAPPINGS=(
  "ko:ko-KR"
  "en-US:en-US"
  "ja:ja-JP"
  "es-ES:es-ES"
  "de-DE:de-DE"
  "fr-FR:fr-FR"
  "pt-BR:pt-BR"
  "zh-Hant:zh-TW"
  "it:it-IT"
  "zh-Hans:zh-CN"
)

rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

for mapping in "${LOCALE_MAPPINGS[@]}"; do
  source_locale="${mapping%%:*}"
  play_locale="${mapping##*:}"
  destination="$OUTPUT_DIR/$play_locale"
  mkdir -p "$destination"

  for source in "$SOURCE_DIR/$source_locale"/*.jpg; do
    filename="$(basename "$source")"
    sips \
      --cropToHeightWidth 2640 1320 \
      --cropOffset 160 0 \
      "$source" \
      --out "$destination/$filename" >/dev/null
  done
done

echo "Prepared Google Play screenshots for ${#LOCALE_MAPPINGS[@]} locales."
