# Actual ProgrammeOS screens used

All footage was captured from the ProgrammeOS app in this repository (`programmeos/`), running as its
Expo web build in headless Chromium at a phone viewport of 390×844 CSS px and 3× density
(1170×2532 px per frame). The app was not modified for the film. Every name, programme and figure
is the app's own fictional sample data, on its fixed demo date of Monday 29 March 2027.

Unless noted, the signed-in role is **Programme Manager** (Layla Haddad) in light mode. The full
machine-readable list, including frame counts, is in `footage/manifest.json`.

## Screens in the 150-second film

| Footage | Screen | Route | Role · theme | Film timecode |
| --- | --- | --- | --- | --- |
| `s03_home` | Home dashboard | `/home` | PM | 00:23.9–00:27.5 |
| `s03_home_scroll_elp` (scroll, 77 frames) | Home → Programme readiness list | `/home` | PM | 00:27.5–00:31.6 |
| `s03_elp_overview` | ELP programme workspace, overview | `/programme/p-elp` | PM | 00:31.6–00:32.9 |
| `s03_elp_overview_scroll` (scroll, 108 frames) | ELP workspace, status and sections | `/programme/p-elp` | PM | 00:32.9–00:40.2 |
| `s03_elp_timeline` | ELP timeline and milestones | `/programme/p-elp/timeline` | PM | 00:36.4–00:40.2 |
| `s08_readiness_before` | ELP readiness, 82% | `/programme/p-elp/readiness` | PM | 00:36.4–00:40.2; close-up 01:41.4–01:43.3 |
| `s04_faculty_directory` | Faculty directory | `/faculty` | PM | 00:40.1–00:47.8 |
| `s04_faculty_vasquez` | Faculty profile, Prof. Elena Vasquez | `/faculty/f-vasquez` | PM | 00:40.4–00:47.8 |
| `s04_elp_faculty` | ELP faculty assignments | `/programme/p-elp/faculty` | PM | 00:40.6–00:47.8 |
| `s04_elp_participants_scroll` (scroll, 96 frames) | ELP participants (learner management) | `/programme/p-elp/participants` | PM | 00:47.5–00:55.2 |
| `s04_learner_noor` | Learner profile, Noor Al Hashimi | `/learner/l-13` | PM | 00:51.4–00:55.2 |
| `s05_calendar_week_elp` | Calendar, week view, 12–18 Apr 2027 | `/calendar` (Week, two weeks ahead) | PM | 00:55.0–01:00.6 |
| `s05_session_keynote` | Session detail, Opening Keynote | `/session/ss-elp-1` | PM | 01:00.1–01:04.9 |
| `s05_elp_academics` | ELP academics hierarchy | `/programme/p-elp/academics` | PM | 01:04.2–01:09.2 |
| `s05_elp_sessions_scroll` (scroll, 108 frames) | ELP sessions schedule | `/programme/p-elp/sessions` | PM | 01:04.4–01:09.2 |
| `s05_module_strategy` | Module 2, Leading Strategy | `/module/m-elp-2` | PM | 01:04.2–01:09.2 |
| `s06_itinerary_vasquez` | Travel itinerary, Prof. Vasquez | `/travel/ti-elp-17` | PM | 01:09.0–01:13.6; close-up 01:10.4–01:13.0 |
| `s06_rooming_elp_scroll` (scroll, 96 frames) | ELP rooming list, Creekside Grand Hotel | `/rooming/p-elp` | PM | 01:13.0–01:17.2 |
| `s06_venue_booking` | Venue booking, Al Majlis Ballroom | `/venue-booking/vb-elp-1` | PM | 01:16.6–01:20.8 |
| `s06_checklist_elp` | ELP logistics checklist | `/logistics/checklist/p-elp` | PM | 01:20.2–01:25.3 |
| `s06_rooming_elp` | ELP rooming list (top) | `/rooming/p-elp` | PM | 01:22.6–01:25.3 |
| `s07_elp_finance` | ELP finance summary | `/programme/p-elp/finance` | PM | 01:25.0–01:32.9; tile close-ups 01:28.7–01:33.1 |
| `s07_elp_finance_scroll` (scroll, 120 frames) | ELP finance, cost control | `/programme/p-elp/finance` | PM | 01:32.9–01:39.2 |
| `s07_transactions` | Transactions | `/finance/transactions` | PM | 01:35.4–01:39.2 |
| `s07_report_budget` | Report: Budget vs Actual | `/report/budget` | PM | 01:35.4–01:39.2 |
| `s08_readiness_to_alert` (scroll, 106 frames) | ELP readiness → critical alerts | `/programme/p-elp/readiness` | PM | 01:39.0–01:47.5 |
| `s08_tap_before` | Critical alerts, before "Mark ticketed" | `/programme/p-elp/readiness` | PM | 01:47.5–01:48.3 |
| `s08_tap_after` | Critical alerts 0.7 s after "Mark ticketed", with toast | `/programme/p-elp/readiness` | PM | 01:48.3–01:50.0; close-up 01:48.6–01:50.5 |
| `s08_after_to_top` (scroll, 24 frames) | Readiness, back to top: 83% | `/programme/p-elp/readiness` | PM | 01:50.0–01:51.5 |
| `s08_approval_deposit` | Payment approval, hotel deposit | `/approval/a-01` | **Finance Approver** | 01:51.5–01:56.2 |
| `s08_alerts` | Smart alerts | `/alerts` | PM | 01:51.2–01:56.2 |
| `s08_assistant` | Programme Assistant (concept prototype) | `/assistant?q=What is still pending before ELP?` | PM | 01:51.2–01:56.2 |
| `s09_programmes_scroll` (scroll, 120 frames) | Programmes portfolio | `/programmes` | PM | 01:56.0–02:12.0 |

Portfolio grid (02:01–02:12, Scene 09), each a still: `s03_home`, `s09_report_executive`
(`/report/executive`), `s07_finance` (`/finance`), `dk_elp_overview` (dark), `s09_report_readiness`
(`/report/readiness`), `s05_calendar_month` (`/calendar`, Month), `s04_faculty_directory`,
`s06_travel_elp` (`/travel?programme=p-elp`), `s06_hotel_creekside` (`/hotel/h-creekside`),
`s07_report_budget`, `s04_elp_participants`, `dk_report_executive` (dark),
`s09_home_exec` (`/home`, **Senior Management** role), `s09_reports` (`/reports`), `s08_alerts`,
`dk_home` (dark), `s05_calendar_agenda` (`/calendar`, Agenda), `s07_transactions`,
`dk_readiness` (dark), `s06_rooming_elp`.

## Screens in the 30-second vertical cut

`s03_elp_overview_scroll`, `s08_tap_before`, `s08_tap_after`, `s08_after_to_top`,
`s06_itinerary_vasquez`, `s06_rooming_elp_scroll`, `s07_elp_finance` (with tile close-ups), and a
25-screen grid: `s09_programmes` (centre) plus `s03_home`, `s09_report_executive`, `s07_finance`,
`dk_elp_overview`, `s09_report_readiness`, `s06_travel_elp`, `s06_hotel_creekside`,
`dk_report_executive`, `s04_elp_participants`, `s09_home_exec`, `s09_reports`, `s08_alerts`,
`s05_calendar_month`, `s07_report_budget`, `dk_home`, `s05_calendar_agenda`, `s07_transactions`,
`dk_readiness`, `s06_rooming_elp`, `s04_faculty_directory`, `s05_elp_sessions`, `s03_elp_timeline`,
`s06_venue_booking`, `dk_elp_finance`.

## Captured but not used in either cut

Kept in the asset folder as source footage: `s03_programmes`, `s06_elp_logistics`,
`s06_venue_creekside`, `dk_itinerary_vasquez`, `s08_readiness_after_toast`,
`s08_readiness_after_top`.

## How the readiness interaction was captured

`capture/capture_readiness_tap.cjs` records one continuous take on `/programme/p-elp/readiness`:
an eased scroll that comes to rest on the first critical alert, the frame before the tap, the real
click on "Mark ticketed", the screen 0.7 s later, and a scroll back to the top. The before and after
frames share the same scroll position. The 65% → 70% and 82% → 83% changes are the app's own
readiness calculation responding to the travel record changing (in-memory sample data).
