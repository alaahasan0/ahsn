# BENA — Cinematic Product Launch Film

A 90-second vertical (9:16) launch film for **BENA**, built in Remotion from the real BENA prototype interface (`../bena`), with original footage, score, narration and Arabic subtitles.

| | |
|---|---|
| Master | 1440 × 2560 · 30 fps · 2,700 frames · H.264 High · AAC 48 kHz · −14 LUFS |
| Mobile | 1080 × 1920 export from the same master |
| Subtitles | Arabic (MSA), burned in, plus editable `BENA_Arabic_Subtitles.srt` |
| Narration | English: `BENA_Voiceover_Script.md` (synthetic voice, replaceable; see below) |

## Deliverables

Video files are written to `output/`:
- `BENA_Product_Film_90s.mp4` — master, Arabic subtitles burned in.
- `BENA_Product_Film_90s_NoSubtitles.mp4` — clean master, so subtitles can be changed later.
- `BENA_Product_Film_1080x1920.mp4` — mobile export.
- `BENA_Product_Film_Preview.mp4` — lightweight review copy.

Documents in this folder:
- `BENA_Voiceover_Script.md`
- `BENA_Arabic_Subtitles.srt` (plus `subtitles/BENA_English_Reference.srt`)
- `BENA_Storyboard.md`

## Project layout

```
src/
  index.jsx · Root.jsx · Film.jsx    composition and scene sequencing
  lib.jsx                            brand tokens, fonts, easing, Phone/Tablet frames, headlines, grain
  scenes/                            Opening (S01–02) · Identity (S03–04) · Experiences (S05–07) · Ecosystem (S08–10)
  subtitles/Subtitles.jsx            Arabic subtitle style (preview layer + burn-in cards)
  data/timeline.json                 single source of truth: scenes, narration offsets, subtitle cues, SFX
  data/buildings.json                BENA map geometry used for overlays
public/
  shots/      real BENA screens captured from the prototype (scripts/capture-screens.cjs)
  images/     original generated stills (dusk city, tower, sunrise) + grain texture
  footage/    original generated motion clips (aerial dusk, sunrise crane), upscaled to 1440×2560/30 fps
  voiceover/  vo01–vo10.mp3, one file per narration line
  music/      score.mp3 (original instrumental)
  sfx/        ambience, whooshes, interface taps, reveals
  fonts/      Inter, Plus Jakarta Sans, IBM Plex Sans Arabic (from @fontsource, OFL)
scripts/
  capture-screens.cjs   re-capture BENA screens from ../bena/index.html
  render.cjs            Remotion renders (stills, preview, master, subtitle cards)
  mix-audio.cjs         narration + ducked score + SFX → loudness-normalised mix
  make-srt.cjs          writes the SRT files from timeline.json
  finalize.cjs          burns subtitles, muxes audio, exports 1080×1920 and preview
```

## Preview and edit

```bash
npm install                         # pinned: remotion 4.0.540, react 18.3.1
npx remotion studio src/index.jsx   # interactive timeline preview in the browser
```

Common changes:
- **Text on screen:** edit the `Headline` lines in `src/scenes/*.jsx`.
- **Arabic subtitles:** edit `subtitles[].ar` in `src/data/timeline.json`, then run `node scripts/make-srt.cjs` and the final steps below.
- **Timing:** narration offsets (`voiceover[].at`) and subtitle cue windows are in `timeline.json`. Scene windows are listed there, and the visual sequences are in `src/Film.jsx` (`SEQ`).

## Render again

```bash
node scripts/capture-screens.cjs        # only if the BENA app changed
bash scripts/prepare-footage.sh         # once: upscale/interpolate the clips (ignored by git)
node scripts/mix-audio.cjs              # → output/_audio_mix.wav (−14 LUFS)
node scripts/render.cjs preview         # quick 540×960 check with subtitles (~10 min)
node scripts/render.cjs master          # clean 1440×2560 master (~30–45 min on 4 cores)
node scripts/render.cjs cards           # transparent subtitle cards
node scripts/make-srt.cjs
node scripts/finalize.cjs               # → output/BENA_Product_Film_*.mp4
```

`render.cjs` uses the machine's headless Chromium. Set `BROWSER=/path/to/chrome-headless-shell` if yours lives elsewhere, and `CONCURRENCY=n` to change parallelism. A preview frame range can be passed, e.g. `node scripts/render.cjs preview 480-800`.

## Replacing the narration with a human voice

The narration is a synthetic ElevenLabs voice generated through Magnific. To replace it:
1. Record the ten lines in `BENA_Voiceover_Script.md`.
2. Save them as `public/voiceover/vo01.mp3` … `vo10.mp3`.
3. Adjust any `at` offsets in `timeline.json` if a take is a different length.
4. Run `mix-audio.cjs` then `finalize.cjs`. No video re-render is needed unless the timing changes.

## Asset provenance
- **Interface:** screenshots of the BENA prototype in this repository, with fictional demo data.
- **Footage and stills:** original, generated for this film with Magnific (Seedance 2.5 video; Magnific image models). The clips were delivered as 610 × 1080 previews and upscaled; replace `public/footage/*_1440.mp4` with higher-resolution originals from the Magnific library for maximum sharpness.
- **Music:** original instrumental generated for this film (ElevenLabs Music via Magnific).
- **Sound effects:** generated (ElevenLabs SFX via Magnific).
- **Narration:** synthetic voice (ElevenLabs v4 via Magnific).
- **Fonts:** Inter, Plus Jakarta Sans and IBM Plex Sans Arabic, all under the SIL Open Font License.

## Presentation rules
- BENA is presented as a vision and prototype.
- Interface scenes are labelled as demonstration data.
- Municipal integration is described as *designed to connect*. There is no claimed partnership, live GIS connection, payment processing or endorsement.
- The Building ID is a digital reference identity, not proof of title.
