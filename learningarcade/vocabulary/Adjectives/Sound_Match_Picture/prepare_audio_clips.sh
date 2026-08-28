#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SOURCE="$ROOT/audio/adjectives-4.17.mp3"
DESTINATION="$ROOT/audio/clips"

mkdir -p "$DESTINATION"
rm -f "$DESTINATION"/*.mp3

declare -a CUES=(
  "01-big|8.30|1.80"
  "02-small|11.45|1.75"
  "03-old|14.50|1.70"
  "04-new|16.95|1.75"
  "05-fast|20.30|1.70"
  "06-slow|23.55|1.60"
  "07-beautiful|26.35|1.95"
  "08-ugly|30.55|1.65"
  "09-cheap|33.15|1.65"
  "10-expensive|37.30|2.10"
  "11-long|40.70|1.55"
  "12-short|44.75|1.55"
  "13-clean|48.85|1.60"
  "14-dirty|52.05|1.55"
  "15-easy|55.15|1.55"
  "16-difficult|59.95|1.85"
)

for cue in "${CUES[@]}"; do
  IFS='|' read -r filename start duration <<< "$cue"
  ffmpeg -hide_banner -loglevel error -y \
    -ss "$start" \
    -i "$SOURCE" \
    -t "$duration" \
    -ac 1 \
    -ar 44100 \
    -codec:a libmp3lame \
    -q:a 3 \
    "$DESTINATION/$filename.mp3"
done

printf 'Created %s replay clips.\n' "${#CUES[@]}"
