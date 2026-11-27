# ProgrammeOS: Storyboard and shot list

Film: 150.000 s, 3840×2160, 24 fps (3,600 frames). Vertical cut: 30.000 s, 1080×1920, 24 fps.
Timecodes are `mm:ss.s` from the first frame. The narrative thread throughout is one programme:
**Executive Leadership Programme (ELP, PRG-2027-014)** for Meridian Energy Group, 12–16 April 2027,
Creekside Grand Hotel, Dubai. The app's fixed demo date is Monday 29 March 2027, so ELP starts in 14 days.

Every interface image is a real capture of the ProgrammeOS app (footage IDs refer to
`footage/manifest.json`; routes are listed in `screens-used.md`). "Real scroll" means a captured
24 fps scroll take, not a pan over a still.

The source of truth for timing is `composition/timeline.json` (scenes, narration, sound) and
`composition/film.js` (picture).

---

## Scene 01 · The Complexity · 00:00–00:12

| | |
| --- | --- |
| On-screen text | "Behind every exceptional programme…" |
| Narration | 00:02.6 "Behind every exceptional executive education programme..." · 00:06.6 "there is an extraordinary amount of coordination." |
| Sound | Low, filtered score. Soft notification and reminder activity (fades by 00:10.8). Whoosh at 00:09.4 into the convergence. |

| # | In–Out | Shot | Source |
| --- | --- | --- | --- |
| 1.1 | 00:00.0–00:00.9 | Near-black. Activity sounds start. | — |
| 1.2 | 00:00.9–00:07.8 | Eight dark glass cards appear one by one, 0.85 s apart, drifting in depth during a slow dolly-in: email "Re: Fwd: Re: Flight options", calendar "Faculty briefing · moved (again)", sticky note "Hotel deposit due Thursday", spreadsheet "ELP_rooming_list_v7_FINAL(2).xlsx", chat "Has the venue contract been signed?", email "Budget tracker: which version is current?", document "Venue_contract_v4_signed?.pdf", calendar "Go / No-Go review · TBC". | Generic illustrations made in the composition (not ProgrammeOS, not any real product) |
| 1.3 | 00:02.9–00:09.5 | Title rises in word by word, centred. | Typography |
| 1.4 | 00:09.3–00:11.6 | All cards converge to the centre and dissolve into a single point of light. | — |
| 1.5 | 00:11.6–00:12.4 | The light blooms (impact lands at 00:12.0). | — |

## Scene 02 · The Reveal · 00:12–00:24

| | |
| --- | --- |
| On-screen text | ProgrammeOS wordmark · "One unified operating environment." |
| Narration | 00:14.0 "What if every moving part came together..." · 00:17.3 "in one intelligent operating environment?" |
| Sound | Shimmer and impact at 00:12.0; the score opens from filtered to full between 00:09.4 and 00:13.6. |

| # | In–Out | Shot | Source |
| --- | --- | --- | --- |
| 2.1 | 00:12.1–00:13.2 | The ProgrammeOS mark resolves out of the light, centred, on a clean dark field. | App's own mark (`programmeos/src/components/brand/Logo.tsx`) |
| 2.2 | 00:13.3–00:14.7 | The mark slides left as the wordmark "Programme**OS**" wipes in beside it. A soft horizontal light streak travels behind (00:12.5–00:16.8) and a thin horizon line draws under the lockup (00:13.0–00:16.8). | Wordmark set in Inter Bold, as in the app |
| 2.3 | 00:14.8–00:16.3 | A light sheen crosses the wordmark. Slow push-in throughout. | — |
| 2.4 | 00:17.2–00:22.7 | "One unified operating environment." | Typography |
| 2.5 | 00:22.7–00:23.7 | Lockup fades and lifts. Whoosh at 00:23.1. | — |

## Scene 03 · One Programme. One Workspace. · 00:24–00:40

| | |
| --- | --- |
| On-screen text | Eyebrow "PROGRAMME WORKSPACE" · "One programme." · "One workspace." |
| Narration | 00:26.0 "Meet ProgrammeOS." · 00:27.5 "A unified platform designed to bring every programme," · 00:31.5 "every team, and every critical detail into focus." |
| Sound | Tap at 00:31.4. Whoosh at 00:39.6. |

| # | In–Out | Shot | Source |
| --- | --- | --- | --- |
| 3.1 | 00:23.9–00:26.2 | Device rises into frame on the right, tilting upright: the Home dashboard ("Good morning, Layla", next best action "ELP is 82% ready"). | `s03_home` |
| 3.2 | 00:26.2–00:27.1 | Title block builds on the left. | Typography |
| 3.3 | 00:27.5–00:30.7 | Real scroll down Home to the Programme readiness list. | `s03_home_scroll_elp` |
| 3.4 | 00:31.4 | Tap indicator on the "Executive Leadership Programme" row. | Edit overlay |
| 3.5 | 00:31.6–00:32.2 | Push to the ELP workspace: readiness 82%, "Starts in 14 days", lifecycle stage. | `s03_elp_overview` |
| 3.6 | 00:32.3–00:37.4 | Camera push-in (×1.16) while a real scroll moves through the six status dimensions, next actions, financial summary and workspace sections. | `s03_elp_overview_scroll` |
| 3.7 | 00:36.4–00:39.3 | The workspace moves to centre. Timeline (left) and Readiness (right) join it. Labels: Timeline · Programme overview · Readiness. | `s03_elp_timeline`, `s08_readiness_before` |
| 3.8 | 00:39.3–00:40.2 | Fade. | — |

## Scene 04 · People. Connected. · 00:40–00:55

| | |
| --- | --- |
| On-screen text | "Faculty." "Learners." "Teams." · eyebrow "PEOPLE, CONNECTED" |
| Narration | 00:42.3 "Connect faculty, learners and internal teams..." · 00:45.6 "through one coordinated experience." |
| Sound | Whoosh at 00:54.6. |

| # | In–Out | Shot | Source |
| --- | --- | --- | --- |
| 4.1 | 00:40.1–00:46.9 | Three devices rise in a row: Faculty directory, Prof. Elena Vasquez's profile, ELP faculty assignments (4 contracted). Slow push. | `s04_faculty_directory`, `s04_faculty_vasquez`, `s04_elp_faculty` |
| 4.2 | 00:41.9 / 00:42.9 / 00:44.1 | "Faculty." "Learners." "Teams." appear in a line above the devices. | Typography |
| 4.3 | 00:42.4–00:47.1 | Thin connecting lines with travelling light link the three screens. | Edit overlay |
| 4.4 | 00:46.9–00:48.2 | Faculty screens drop away. The three words re-flow into a left-hand column; eyebrow appears. | — |
| 4.5 | 00:47.5–00:52.0 | Learner management: ELP participants, real scroll. Label "Participants · Executive Leadership Programme". | `s04_elp_participants_scroll` |
| 4.6 | 00:51.2–00:54.3 | A learner profile joins (Noor Al Hashimi: enrolments, accessibility requirement, learning record). | `s04_learner_noor` |
| 4.7 | 00:54.3–00:55.2 | Fade. | — |

## Scene 05 · The Academic Experience · 00:55–01:09

| | |
| --- | --- |
| On-screen text | Eyebrow "ACADEMIC EXPERIENCE" · "Every session." · "Every milestone." |
| Narration | 00:57.0 "Coordinate academic content, schedules," · 01:00.2 "sessions and learning activities..." · 01:02.6 "with clarity and consistency." |
| Sound | Tap at 01:00.0. Whoosh at 01:08.5. |

| # | In–Out | Shot | Source |
| --- | --- | --- | --- |
| 5.1 | 00:55.0–01:00.0 | Calendar, week of 12–18 April 2027: ELP sessions, a schedule conflict flag, Monday's agenda. | `s05_calendar_week_elp` |
| 5.2 | 01:00.0 | Tap indicator on "Opening Keynote: Leading in an Age of Disruption". | Edit overlay |
| 5.3 | 01:00.1–01:04.2 | Push to the session: date and time zone, venue Al Majlis Ballroom, Prof. Elena Vasquez, capacity 21/24. Slow push-in. | `s05_session_keynote` |
| 5.4 | 01:04.2–01:08.3 | Three-screen composition: Academics hierarchy (materials 8/8 approved), Sessions (push, then real scroll), Module 2 "Leading Strategy". Labels. | `s05_elp_academics`, `s05_elp_sessions_scroll`, `s05_module_strategy` |
| 5.5 | 01:08.3–01:09.2 | Fade. | — |

## Scene 06 · Every Detail. Orchestrated. · 01:09–01:25

| | |
| --- | --- |
| On-screen text | Eyebrow "EVERY DETAIL. ORCHESTRATED." · "Travel." "Accommodation." "Venues." "Logistics." |
| Narration | 01:11.5 "From travel and accommodation to venues and logistics..." · 01:15.2 "every operational detail has its place." |
| Sound | Whoosh at 01:24.6. |

| # | In–Out | Shot | Source |
| --- | --- | --- | --- |
| 6.1 | 01:09.0–01:13.0 | "Travel." Prof. Vasquez's itinerary (Emirates EK 004 LHR→DXB, seat 3A, return EK 005). | `s06_itinerary_vasquez` |
| 6.2 | 01:10.4–01:13.0 | Close-up: the outbound flight card is lifted forward and enlarged. | Crop of `s06_itinerary_vasquez` |
| 6.3 | 01:13.0–01:16.6 | "Accommodation." Push to the ELP rooming list (Creekside Grand Hotel, 26 rooms, 26/26 confirmed), real scroll. | `s06_rooming_elp_scroll` |
| 6.4 | 01:16.6–01:20.2 | "Venues." Push to the venue booking: Al Majlis Ballroom, set-up 7/10, contract awaiting countersignature. | `s06_venue_booking` |
| 6.5 | 01:20.2–01:22.4 | "Logistics." Push to the ELP logistics checklist (11 of 24 complete, feeds readiness). | `s06_checklist_elp` |
| 6.6 | 01:22.3–01:24.5 | The column gives way to the full line "Travel. Accommodation. Venues. Logistics." The four screens sit side by side, joined by connecting lines. Caption: "Executive Leadership Programme · 12–16 April 2027 · Creekside Grand Hotel, Dubai". | Same four captures, connecting lines are an edit overlay |
| 6.7 | 01:24.5–01:25.3 | Fade. | — |

## Scene 07 · Financial Control · 01:25–01:39

| | |
| --- | --- |
| On-screen text | Eyebrow "FINANCIAL CONTROL" · "Financial visibility." · "Operational control." |
| Narration | 01:27.0 "Maintain financial visibility across" · 01:29.4 "budgets, commitments, expenses..." · 01:32.2 "and programme performance." |
| Sound | Whoosh at 01:38.6. |

| # | In–Out | Shot | Source |
| --- | --- | --- | --- |
| 7.1 | 01:25.0–01:28.7 | ELP finance summary on the device. Gentle push-in. | `s07_elp_finance` |
| 7.2 | 01:28.7–01:33.1 | Close-up: the eight summary tiles (contract value $486K, approved budget $312K, committed $239K, actual $46K, pending payments $35K, variance $73K, forecast margin 35.8%, revenue recognised $194K) lift out row by row while the device dims. Numbers are shown exactly as captured. | Crops of `s07_elp_finance` |
| 7.3 | 01:32.9–01:37.9 | Real scroll into cost control and the cost breakdown. | `s07_elp_finance_scroll` |
| 7.4 | 01:35.4–01:38.3 | Three-screen composition: Transactions, Programme finance, Budget vs Actual report. Labels. | `s07_transactions`, `s07_report_budget` |
| 7.5 | 01:38.3–01:39.2 | Fade. | — |

## Scene 08 · Intelligence at Work · 01:39–01:56

| | |
| --- | --- |
| On-screen text | Eyebrow "READINESS ENGINE" · "See what is ready." · "Know what needs attention." · caption "One record updated. Readiness recalculated." / "Travel 65% → 70% · Overall readiness 82% → 83%" · label "Concept prototype · simulated responses" |
| Narration | 01:41.6 "See what is ready." · 01:43.0 "Identify what needs attention." · 01:45.5 "And bring critical decisions closer to the people who make them." |
| Sound | Tap at 01:48.2. Whoosh at 01:55.5. |

| # | In–Out | Shot | Source |
| --- | --- | --- | --- |
| 8.1 | 01:39.0–01:43.1 | ELP Readiness, 82% against a 90% target. Push-in. | `s08_readiness_to_alert` (first frame) |
| 8.2 | 01:41.4–01:43.3 | Close-up: the readiness ring card lifts forward. | Crop of `s08_readiness_before` |
| 8.3 | 01:43.1–01:47.5 | Real scroll down to the dimension tiles and Critical alerts. | `s08_readiness_to_alert` |
| 8.4 | 01:47.5–01:48.3 | Tap indicator on "Mark ticketed" for "Flights for Saeed Al Harthy". | `s08_tap_before` + edit overlay |
| 8.5 | 01:48.3–01:50.0 | The real result 0.7 s after the tap: the alert is cleared, Travel reads 70%, and the app's toast says "Travel now 70% · Overall readiness 83% · updated from the source record". The toast is lifted forward as a close-up (01:48.6–01:50.5). Caption appears on the left. | `s08_tap_after`, crop of `s08_tap_after` |
| 8.6 | 01:50.0–01:51.0 | Real scroll back to the top: overall readiness 83%. | `s08_after_to_top` |
| 8.7 | 01:51.3–01:55.3 | Three-screen composition: Smart alerts · Approvals (hotel deposit, Finance Approver view) · Programme Assistant, labelled "Concept prototype · simulated responses". The centre screen pushes from Readiness to the approval. | `s08_alerts`, `s08_approval_deposit`, `s08_assistant` |
| 8.8 | 01:55.3–01:56.2 | Fade. | — |

## Scene 09 · From Programmes to Portfolio · 01:56–02:12

| | |
| --- | --- |
| On-screen text | Eyebrow "PORTFOLIO" · "From individual programmes" / "to your entire portfolio." |
| Narration | 01:57.9 "And as your portfolio grows, ProgrammeOS" · 02:01.1 "gives you the visibility to scale..." · 02:03.3 "without losing control." |
| Sound | Score at its fullest. Whoosh at 02:11.4. |

| # | In–Out | Shot | Source |
| --- | --- | --- | --- |
| 9.1 | 01:56.0–02:01.4 | Centred device: the Programmes portfolio, real scroll through programmes in delivery and upcoming. | `s09_programmes_scroll` |
| 9.2 | 02:01.0–02:07.0 | Cinematic zoom-out: the screen becomes one of 21 real screens in a tilted grid (dashboards, executive and readiness reports, finance, calendars, faculty, participants, travel, hotel, light and dark mode). | 20 stills, see `screens-used.md` |
| 9.3 | 02:02.2–02:11.0 | Title builds at the top over a soft scrim. The grid keeps drifting. | Typography |
| 9.4 | 02:11.0–02:12.0 | Fade to black. | — |

## Scene 10 · The Product Statement · 02:12–02:30

| | |
| --- | --- |
| On-screen text | ProgrammeOS · "Beyond Training Management." · "One Platform." "Every Programme." "Complete Control." · "Designed for the complexity of modern executive education." |
| Narration | 02:14.5 "ProgrammeOS." · 02:16.4 "Beyond training management." · 02:18.7 "One platform." · 02:20.0 "Every programme." · 02:21.4 "Complete control." |
| Sound | Logo resolve at 02:14.5. Shimmer peaking on "Complete control." at 02:21.4. Score resolves; audio fades out by 02:30.0. |

| # | In–Out | Shot | Source |
| --- | --- | --- | --- |
| 10.1 | 02:12.3–02:15.1 | Clean dark field, one soft diagonal light sweep. | — |
| 10.2 | 02:14.3–02:15.7 | Mark and wordmark resolve together, in time with the spoken name. | App's own mark + wordmark |
| 10.3 | 02:16.4 | "Beyond Training Management." | Typography |
| 10.4 | 02:18.6 / 02:19.9 / 02:21.3 | "One Platform." "Every Programme." "Complete Control." (accent gradient, light sheen), each with its spoken line. | Typography |
| 10.5 | 02:24.2 | Supporting line. | Typography |
| 10.6 | 02:24.2–02:30.0 | Clean final frame holds to the end. No call-to-action buttons, no third-party logos. | — |

---

## Vertical social cut (30 s, 9:16)

Audio: the film score from 01:56 to 02:26, shimmer at 00:01.6, logo resolve at 00:03.1, and the closing
narration "One platform. Every programme. Complete control." from 00:24.8.

| # | In–Out | Shot | Source |
| --- | --- | --- | --- |
| V1 | 00:00.0–00:02.4 | Six fragment cards around "Behind every / exceptional programme…", converging into light. | Illustrations |
| V2 | 00:02.2–00:06.5 | Mark resolves, wordmark wipes in, "One unified operating environment." | App mark + wordmark |
| V3 | 00:06.3–00:11.0 | Large device rises: ELP workspace, real scroll. "One programme. / One workspace." | `s03_elp_overview_scroll` |
| V4 | 00:11.0–00:15.0 | Push to Readiness critical alerts, tap on "Mark ticketed", real result with toast, real scroll back to 83%. "See what is ready." + "Travel 65% → 70% · Readiness 82% → 83%". | `s08_tap_before`, `s08_tap_after`, `s08_after_to_top` |
| V5 | 00:15.0–00:18.5 | Itinerary, then rooming list (real scroll). "Travel. Accommodation. / Venues. Logistics." | `s06_itinerary_vasquez`, `s06_rooming_elp_scroll` |
| V6 | 00:18.5–00:21.6 | ELP finance with the eight summary tiles lifted out. "Financial visibility. / Operational control." | `s07_elp_finance` + crops |
| V7 | 00:21.1–00:24.9 | Zoom-out from Programmes to a 25-screen grid. "From individual programmes / to your entire portfolio." | 25 stills |
| V8 | 00:24.3–00:30.0 | End card: lockup, "Beyond Training Management.", "One Platform." (00:24.9) "Every Programme." (00:26.2) "Complete Control." (00:27.5), supporting line. Clean final frame. | Typography |
