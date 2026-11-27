#!/usr/bin/env bash
# ProgrammeOS film — encode rendered frames and the final mixes into the delivery files.
#
#   composition/encode.sh FILM_FRAMES_DIR VERTICAL_FRAMES_DIR [OUT_DIR]
#
# Frames come from composition/render.cjs (JPEG, sRGB). They are converted to Rec.709 limited range
# and tagged as such, so colours match the browser render on standard players.
set -euo pipefail
FILM="$(cd "$(dirname "$0")/.." && pwd)"
FRAMES="${1:?film frames dir}"
VFRAMES="${2:?vertical frames dir}"
OUT="${3:-$FILM/output}"
mkdir -p "$OUT"

TO709="scale=in_color_matrix=bt601:in_range=full:out_color_matrix=bt709:out_range=tv"
TAGS=(-color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv)

# 1. Master: 3840×2160, 24 fps, H.264 High, AAC 320 kb/s, English subtitle track (toggleable, not burned in).
ffmpeg -hide_banner -y -framerate 24 -i "$FRAMES/%06d.jpg" -i "$FILM/audio/mix/film_mix.wav" -i "$FILM/subtitles/programmeos_film_en.srt" \
  -map 0:v -map 1:a -map 2:s -vf "$TO709,format=yuv420p" "${TAGS[@]}" \
  -c:v libx264 -preset medium -crf 17 -profile:v high -level:v 5.1 -tune film -g 48 \
  -c:a aac -b:a 320k -ar 48000 -c:s mov_text -metadata:s:a:0 language=eng -metadata:s:s:0 language=eng -metadata:s:s:0 title="English" \
  -metadata title="ProgrammeOS — Product Film" -t 150 -movflags +faststart "$OUT/ProgrammeOS_Film_150s_4K_UHD_H264.mp4"

# 2. Sharing copy: 1920×1080 from the same frames.
ffmpeg -hide_banner -y -framerate 24 -i "$FRAMES/%06d.jpg" -i "$FILM/audio/mix/film_mix.wav" -i "$FILM/subtitles/programmeos_film_en.srt" \
  -map 0:v -map 1:a -map 2:s -vf "scale=1920:1080:flags=lanczos,$TO709,format=yuv420p" "${TAGS[@]}" \
  -c:v libx264 -preset slow -crf 19 -profile:v high -level:v 4.1 -tune film -g 48 \
  -c:a aac -b:a 256k -ar 48000 -c:s mov_text -metadata:s:a:0 language=eng -metadata:s:s:0 language=eng -metadata:s:s:0 title="English" \
  -metadata title="ProgrammeOS — Product Film" -t 150 -movflags +faststart "$OUT/ProgrammeOS_Film_150s_1080p_H264.mp4"

# 3. Vertical social cut: 1080×1920, 30 s.
ffmpeg -hide_banner -y -framerate 24 -i "$VFRAMES/%06d.jpg" -i "$FILM/audio/mix/social_mix.wav" \
  -map 0:v -map 1:a -vf "$TO709,format=yuv420p" "${TAGS[@]}" \
  -c:v libx264 -preset slow -crf 18 -profile:v high -level:v 4.2 -tune film -g 48 \
  -c:a aac -b:a 256k -ar 48000 -metadata:s:a:0 language=eng \
  -metadata title="ProgrammeOS — 30s Vertical" -t 30 -movflags +faststart "$OUT/ProgrammeOS_Social_30s_Vertical_1080x1920_H264.mp4"

# 4. Voiceover deliverables: narration stem on the film timeline (exactly 150 s).
ffmpeg -hide_banner -y -i "$FILM/audio/vo/vo_full_150s.wav" -c:a pcm_s24le -ar 48000 "$OUT/ProgrammeOS_Voiceover_150s.wav"
ffmpeg -hide_banner -y -i "$FILM/audio/vo/vo_full_150s.wav" -c:a libmp3lame -b:a 320k "$OUT/ProgrammeOS_Voiceover_150s.mp3"
cp "$FILM/subtitles/programmeos_film_en.srt" "$OUT/ProgrammeOS_Film_150s_EN.srt"
echo "done → $OUT"
