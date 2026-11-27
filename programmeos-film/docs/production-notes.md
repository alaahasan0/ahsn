# ProgrammeOS film: production notes

These notes say how the film was made, what is real product footage and what was added in the
edit, and which capabilities shown are simulated or conceptual. Read them before the film is shown
outside the team.

## 1. What the viewer sees is the real application

- **Source.** Every interface image is a capture of the ProgrammeOS app in this repository
  (`programmeos/`), running as its Expo web build and driven in headless Chromium at a phone
  viewport of 390×844 CSS px, 3× density. Stills are lossless PNG (1170×2532). Scroll takes are
  24 fps JPEG sequences (quality 92) captured frame by frame while the app's own scroll view moved.
- **No AI-generated, redrawn or retouched interface.** Nothing in `footage/` was edited. The
  composition only places, crops, scales, dims and transitions those pixels. Text, numbers,
  programme names, charts, buttons and navigation are exactly as the app rendered them.
- **The app was not changed for the film.** The film work added capture scripts in
  `programmeos-film/capture/` only. The app's source has no film-specific changes.
- **One programme throughout.** The Executive Leadership Programme (ELP, PRG-2027-014) for
  Meridian Energy Group, 12–16 April 2027, Creekside Grand Hotel, Dubai. The app runs on a fixed demo
  date, Monday 29 March 2027, so the figures stay consistent (ELP 82% ready, starts in 14 days).
- **Sample data.** All people, clients, programmes, bookings and amounts are fictional sample data
  that ship with the prototype.

## 2. How the footage is presented

- **Device frame.** No physical device was filmed. The captures are shown inside a generic,
  unbranded phone frame drawn by the composition (a dark bezel, a camera pill and a soft glass
  reflection). There is **no simulated status bar**, clock, signal or battery. Because the web
  viewport has no status-bar or home-indicator area, the frame adds a plain strip above (12% of
  screen width) and below (5%) each capture, filled with that capture's own edge colour. The strips
  never cover app content. Saying "filmed on a phone" would be inaccurate; "the ProgrammeOS
  prototype, captured from its web build and presented in a device frame" is accurate.
- **Edit overlays.** These sit on or beside the real footage and are not part of the app:
  - Titles, eyebrows, labels and captions (white, grey and blue Inter type on the dark background).
  - **Tap indicators**: a translucent circle at the tapped control (00:31.4, 01:00.0, 01:48.2).
    The readiness tap at 01:48.2 is a real click captured in one continuous take; the next frame is
    what the app showed 0.7 s later. The Home → ELP (00:31.4) and calendar → session (01:00.0) taps
    mark a move between two real captures, with the destination screen opened by its route.
  - **Connecting lines** with travelling light between screens (Scenes 04 and 06), to show
    relationships. They are illustrative only.
  - **Close-ups**: rectangles of a real capture enlarged and floated forward (boarding pass,
    finance tiles, readiness ring, toast). Pixels are unchanged; the edges follow the app's own
    card shapes (16 pt radius).
- **Transitions** (slide-across "push", cross-fade, cuts) and camera moves are editorial. They are
  not claims about the app's own navigation animations.
- **Scene 01 fragments** (spreadsheet, email, calendar, chat, document and sticky-note cards) are
  generic illustrations of disconnected tools, built in the composition. They are not ProgrammeOS
  screens and do not imitate any real product.
- **Branding.** The mark is the app's own (`programmeos/src/components/brand/Logo.tsx`), and the
  wordmark "Programme**OS**" is set in Inter Bold with the app's accent colour, as in the app. No
  other logo was invented. No Emeritus logo or brand asset is used, and the film makes no claim of
  endorsement or partnership.

## 3. Simulated or conceptual capabilities shown

The prototype has no backend, AI service or external integration. Changes are held in memory on
sample data. Where the film shows these areas, this is what is actually behind them:

| Where | What is shown | What it really is |
| --- | --- | --- |
| 01:51–01:56 | **Programme Assistant** answering "What is still pending before ELP?" | **Concept prototype.** Answers come from rules over the sample data, not from an AI model. Labelled on screen "Concept prototype · simulated responses", and the app's own screen says "Prototype: simulated responses from sample data · no AI service connected". |
| 01:51–01:56 | **Smart alerts** ("ProgrammeOS watches every programme…") | **Visual prototype.** The alerts are predefined sample records (`programmeos/src/data/mock/records.ts`) that show how alerts would surface. Nothing is monitored live. |
| 01:39–01:51 | **Readiness Engine**: "Mark ticketed" changes Travel 65% → 70% and overall 82% → 83% | Real behaviour of the prototype: readiness is computed from the records, and changing a travel record recalculates it. Records are in-memory sample data. The system recommends ("Conditional Go"); a person records the Go / No-Go decision. The film does not claim the app decides on its own. |
| 01:51–01:56 | **Approvals** (hotel deposit, Finance Approver view) | Simulated. Approving changes a record in memory. **No payment is processed** and no accounting system is connected. |
| 01:09–01:25 | **Itinerary, rooming list, venue booking** with statuses such as Ticketed, Confirmed, Provisional | Records kept inside ProgrammeOS. **No airline, GDS, hotel or venue system is connected**, and nothing updates in real time from suppliers. |
| 01:25–01:39 | **Finance**: budgets, commitments, actuals, transactions, Budget vs Actual | Sample records and calculations inside the app. **No live accounting integration.** Some report history before March 2027 uses illustrative series (see `programmeos/README.md`). |
| 00:24–00:40 | Home "next best action", status dimensions | Derived by the app from the sample data. |

Not shown in either cut: voice-to-action, document intelligence, sign-in / SSO, imports, email and
WhatsApp messaging.

## 4. Sound and voice

| Element | How it was made |
| --- | --- |
| Narration | Generated with the ElevenLabs v4 text-to-speech model through Magnific, library voice "Evelyn Vale" (warm, measured, confident direction, stability 0.55), recorded as ten lines and placed on the timeline. "ProgrammeOS" was written as "Programme O.S." so it is said "Programme O-S". |
| Score | Original instrumental generated with ElevenLabs Music v2 through Magnific (150 s, cinematic electronic). The arc in the brief (filtered opening, lift at the reveal, build, resolution) was shaped in the mix with filter and level automation (`audio/mix.py`). |
| Sound design | Original effects generated through Magnific: soft digital activity, reveal shimmer and impact, three whooshes, two interface taps, logo resolve. |
| Mix | `audio/mix.py` (numpy + ffmpeg). Narration is ducked against the score on every line and sits 9.5–12.6 dB above it. Final film mix: −14 LUFS integrated, −1 dBTP, exactly 150.000 s. Vertical mix: same targets, 30.000 s. |
| Subtitles | `subtitles/programmeos_film_en.srt`, 28 cues built from the narration's word timings. Also embedded in the MP4s as a selectable English track (not burned in). |

**Licensing.** No stock or third-party music or effects were used. The narration, score and effects
were generated on the account's Magnific plan. Confirm that the plan's commercial-use terms cover
the intended distribution before the film is published externally.

## 5. Checks a person still needs to make

- **Listen through on good speakers or headphones.** The mix was verified by measurement
  (loudness, narration-to-music ratio, word alignment of every line), but no one has listened to it
  yet. Check the pronunciation of "ProgrammeOS" and the tone of the voice.
- **Watch the 4K master on a large screen** to judge interface legibility and motion.
- **Confirm use of the name "Emeritus".** The app's sample data names Emeritus Education as the
  sample organisation, so the words appear as plain interface text on a few screens (for example the
  "Emeritus Education" report headers and a faculty profile line "All-time with Emeritus"). No logo
  or brand asset is shown. Check with Emeritus before sharing outside the intended audience.

## 6. Rebuilding and editing

The film is a deterministic composition, not a timeline in a desktop editor:
`composition/film.html` + `film.js` draw any frame from `composition/timeline.json` and the footage,
`composition/render.cjs` renders frames, and `composition/encode.sh` produces the deliverables. To
change a title, a timing or a shot, edit `film.js` (each scene is one block) and re-render. See the
README in this folder for the full sequence of commands.

## 7. Quality control (measured on the delivery files)

`composition/qc.py output` writes `output/qc_report.json`. Results for this delivery:

| Check | 4K master | 1080p | Vertical |
| --- | --- | --- | --- |
| Frames · duration | 3,600 · 150.000 s | 3,600 · 150.000 s | 720 · 30.000 s |
| Audio duration | 150.000 s | 150.000 s | 30.000 s |
| Resolution · rate | 3840×2160 · 24 fps | 1920×1080 · 24 fps | 1080×1920 · 24 fps |
| Video | H.264 High, 4:2:0, Rec.709 | H.264 High, 4:2:0, Rec.709 | H.264 High, 4:2:0, Rec.709 |
| Audio | AAC 48 kHz stereo, 320 kb/s | AAC 48 kHz stereo, 256 kb/s | AAC 48 kHz stereo, 256 kb/s |
| Loudness · true peak | −14.0 LUFS · −0.9 dBTP | −14.0 LUFS · −0.9 dBTP | −14.0 LUFS · −1.0 dBTP |
| Subtitles | English track (mov_text) | English track (mov_text) | none (no narration until the closing line, which is on screen) |
| Size | 270 MB | 59 MB | 21 MB |

- Subtitles: 28 cues, first at 00:02.560, last ends at 02:22.890, all inside the film, no overlaps.
- Picture fidelity: frames decoded from the 4K master match the rendered frames at 40–48 dB PSNR
  with under 1.5 levels of average colour difference (checked at 00:06, 00:31.4, 01:30.5, 01:49.5,
  02:05 and 02:25).
- Every scene was reviewed frame by frame at its transitions; overlaps between titles and incoming
  screens and two cross-fade double exposures were fixed before the final render.
- Brief checklist: duration exactly 150 s ✓ · storyboard followed (10 scenes, brief timings) ✓ ·
  real application shown accurately ✓ · no fabricated features presented as live ✓ (see §3) · no
  fake integrations ✓ · interface text readable at 4K (close-ups for key figures) ✓ · captions
  synchronised to word timings ✓ · narration 9.5–12.6 dB above the score ✓ · consistent ProgrammeOS
  branding ✓ · no Emeritus logos or brand assets ✓ · pronunciation and overall feel: needs a human
  listen (§5).

## 8. Final creative test

*Would an Emeritus executive with no prior knowledge understand that this is a serious platform
bringing order, visibility and operational control to complex programmes?*

- **Understands the complexity.** Scene 01 opens on the real mess of a programme: rooming-list
  versions, missing flights, a moved faculty briefing, an unsigned venue contract, an unowned
  deposit reminder.
- **Brings disconnected workflows together.** From Scene 03 every shot stays on one programme,
  ELP. The same faculty, sessions, hotel, venue and budget figures recur across modules, and the
  readiness tap shows one record update flowing into the overall status.
- **Worth exploring strategically.** Scene 09 widens from one programme to the portfolio, and the
  close carries the positioning: "Beyond Training Management. One Platform. Every Programme.
  Complete Control."

The film is honest about what is a prototype (§3), which matters with a leadership audience that
may later evaluate the product in detail.
