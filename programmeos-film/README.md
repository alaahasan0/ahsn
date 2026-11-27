# ProgrammeOS: product film

A 150-second, Apple-style product film for Emeritus leadership, plus a 30-second vertical cut,
built entirely from real footage of the ProgrammeOS prototype in `../programmeos/`.

| Deliverable | File |
| --- | --- |
| Film, 150 s, 3840×2160, 24 fps, H.264 + AAC, English subtitle track | `output/ProgrammeOS_Film_150s_4K_UHD_H264.mp4` (not in git, see below) |
| Same film at 1920×1080 for sharing | `output/ProgrammeOS_Film_150s_1080p_H264.mp4` |
| Vertical social cut, 30 s, 1080×1920 | `output/ProgrammeOS_Social_30s_Vertical_1080x1920_H264.mp4` |
| English voiceover on the film timeline, 150 s | `output/ProgrammeOS_Voiceover_150s.mp3` (the 24-bit WAV is delivered separately and rebuilt by `audio/mix.py` + `encode.sh`) |
| English subtitles | `subtitles/programmeos_film_en.srt` (copy in `output/`) |
| Storyboard and shot list | `docs/storyboard-and-shot-list.md` |
| Actual ProgrammeOS screens used | `docs/screens-used.md` |
| Production notes: simulated capabilities, overlays, audio, checks | `docs/production-notes.md` |
| Quality-control report | `output/qc_report.json` (summary in the production notes) |
| Source footage | `footage/stills/` (PNG), `footage/clips/` (scroll takes as MP4), `footage/manifest.json` |
| Generated assets | `audio/vo/`, `audio/music/`, `audio/sfx/`, `composition/assets/` |
| Editable project | `composition/` (timeline, scenes, renderer, encoder) and `audio/mix.py` |

The 4K master is larger than GitHub's 100 MB file limit, so it is delivered separately and can be
rebuilt from this folder with the steps below.

## How it is made

```
capture/      Playwright scripts that drive the real app and record stills and 24 fps scroll takes
footage/      the captures (unmodified), their edge colours, tap positions and manifest
audio/        narration lines, score, sound effects, and mix.py, which builds the stems and final mixes
subtitles/    make_srt.py and the SRT, timed from the narration's word timings
composition/  timeline.json (scenes, narration and sound timing), film.html + film.js (every frame),
              render.cjs (frames via headless Chromium), encode.sh (ffmpeg delivery files)
docs/         storyboard and shot list, screens used, production notes
output/       delivery files
```

The picture is a deterministic HTML composition: `window.renderFrame(t)` draws the frame at any
time `t`. Footage is only placed, cropped, scaled and transitioned, never altered.

## Rebuild

Requirements: Node 20+, Playwright with Chromium, Python 3 with numpy and Pillow, ffmpeg with
libx264.

```bash
# 0. Footage. Either restore the scroll takes from the committed clips…
footage/clips/extract.sh
#    …or recapture everything from the app. Build and serve its web export first, with a static
#    server that falls back to index.html for app routes:
#    (cd ../programmeos && npm run web:export && npx serve -s dist -l 8790)
#    node capture/capture.cjs http://localhost:8790
#    node capture/capture_home_tap.cjs http://localhost:8790
#    node capture/capture_readiness_tap.cjs http://localhost:8790
#    python3 footage/sample_colors.py     # edge colours for the device-frame strips
#    python3 footage/build_manifest.py    # footage/manifest.json

# 1. Audio stems and mixes (writes audio/vo/vo_full_150s.wav and audio/mix/*.wav)
python3 audio/mix.py

# 2. Subtitles
python3 subtitles/make_srt.py

# 3. Frames (about 13 minutes for the film on 4 cores)
node composition/render.cjs --mode film --out /tmp/frames_film --dpr 2 --workers 4
node composition/render.cjs --mode vertical --out /tmp/frames_vert --dpr 1 --workers 4

# 4. Delivery files
composition/encode.sh /tmp/frames_film /tmp/frames_vert output

# Preview a single frame in a browser: serve this folder and open
#   composition/film.html?t=108.4            (film)
#   composition/film.html?mode=vertical&t=12 (vertical)
```

## Rules the film follows

- Real screenshots and screen recordings of ProgrammeOS only. No AI-generated, redrawn or edited UI.
- The app was not modified to make the film.
- Phone frames are a presentation of the web build, not footage of a physical device.
- Simulated capabilities are labelled on screen and listed in `docs/production-notes.md`.
- No invented logo, no Emeritus brand assets, no claim of endorsement.
