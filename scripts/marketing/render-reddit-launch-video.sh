#!/bin/sh

set -eu

root="$(git rev-parse --show-toplevel)"
cd "$root"

swift scripts/marketing/render-reddit-launch-assets.swift

output="release/marketing/reddit/2026-09-11"

ffmpeg -y \
  -loop 1 -t 1.65 -i "$output/01-program-not-tracker.png" \
  -loop 1 -t 1.65 -i "$output/02-thirty-by-three.png" \
  -loop 1 -t 1.65 -i "$output/03-missed-days-recorded.png" \
  -loop 1 -t 1.65 -i "$output/04-price-privacy.png" \
  -filter_complex "[0:v]scale=1080:1350,setsar=1,fps=30,format=yuv420p[v0];[1:v]scale=1080:1350,setsar=1,fps=30,format=yuv420p[v1];[2:v]scale=1080:1350,setsar=1,fps=30,format=yuv420p[v2];[3:v]scale=1080:1350,setsar=1,fps=30,format=yuv420p[v3];[v0][v1]xfade=transition=fade:duration=0.12:offset=1.53[v01];[v01][v2]xfade=transition=fade:duration=0.12:offset=3.06[v012];[v012][v3]xfade=transition=fade:duration=0.12:offset=4.59[outv]" \
  -map "[outv]" \
  -t 6.24 \
  -an \
  -c:v libx264 \
  -preset slow \
  -crf 17 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  "$output/alpha-reddit-launch-6s.mp4"

ffmpeg -y \
  -i "$output/alpha-reddit-launch-6s.mp4" \
  -vf "select='eq(n,15)+eq(n,60)+eq(n,105)+eq(n,156)',setpts=N/TB,scale=432:540,tile=4x1:padding=8:margin=8:color=#111111" \
  -frames:v 1 \
  -update 1 \
  "$output/video-contact-sheet.jpg"

printf 'Rendered Reddit launch video to %s\n' "$output/alpha-reddit-launch-6s.mp4"
