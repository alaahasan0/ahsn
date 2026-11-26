#!/usr/bin/env bash
# Upscales the generated clips to 1440×2560 and converts 24→30 fps with motion interpolation.
set -euo pipefail
cd "$(dirname "$0")/../public/footage"
for f in aerial_dusk dawn_rise tower_push; do
  ffmpeg -v error -y -i "$f.mp4" -vf "minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:vsbmc=1,scale=1440:2560:flags=lanczos,unsharp=5:5:0.6:5:5:0.0" \
    -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p -an "${f}_1440.mp4"
  echo "prepared ${f}_1440.mp4"
done
