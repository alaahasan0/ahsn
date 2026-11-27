#!/usr/bin/env bash
# Restores footage/sequences/<take>/0000.jpg … from the committed scroll-take clips, so the film can
# be re-rendered from the repository alone. The clips are near-lossless (x264 CRF 10); for bit-exact
# frames, recapture from the app with the scripts in capture/.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
for clip in "$HERE"/*.mp4; do
  name="$(basename "$clip" .mp4)"
  out="$HERE/../sequences/$name"
  rm -rf "$out" && mkdir -p "$out"
  ffmpeg -hide_banner -loglevel error -i "$clip" \
    -vf "scale=in_color_matrix=bt709:in_range=tv,format=rgb24" \
    -q:v 2 -start_number 0 "$out/%04d.jpg"
  echo "$name: $(ls "$out" | wc -l) frames"
done
