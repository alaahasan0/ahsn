# ProgrammeOS

**The Operating System for Executive Education.**
*One Programme. One Workspace. One Source of Truth.*

ProgrammeOS is a mobile-first programme-operations platform for executive-education providers,
using Emeritus Education as the sample organisation. This folder contains a complete, interactive
**frontend prototype** for iOS and Android, built with Expo. It covers the internal staff
experience, Faculty Mode and Learner Mode.

> Everything runs on local, fictional sample data. There is no backend, authentication, AI service
> or external integration. Approvals, bookings, readiness changes and the rest are simulated in
> memory, so the interface behaves like the real product.

---

## Run it

Requirements: Node 20 or newer and the **Expo Go** app (SDK 58) on an iPhone or Android phone.

```bash
cd programmeos
npm install
npx expo start            # scan the QR code with Expo Go (Android) or the Camera app (iOS)
```

- **Different network from your phone?** Use `npx expo start --tunnel`.
- **Browser preview:** `npx expo start --web`, then open it with your browser's device toolbar at phone width. The app is designed for phones, not desktop.
- **Static web build:** `npm run web:export` writes to `dist/`.

Other checks:

```bash
npm run typecheck         # TypeScript (strict)
npx eslint src            # ESLint with the Expo flat config + React Compiler rules
npm run validate:data     # every id in the sample data resolves to a real record
```

The prototype runs on a fixed date, **Monday 29 March 2027**, so the scenario stays coherent:
the Executive Leadership Programme starts in 14 days and is 82% ready.

## A 5-minute tour

1. **Welcome → Continue with Emeritus SSO** (simulated). You are Layla Haddad, Programme Manager.
2. **Home** shows one next action: *"ELP is 82% ready"*. Tap **Review readiness**.
3. **Readiness** is computed live from operational records (faculty contracts, approved materials,
   hotel bookings, registrations, flights, venue and AV checklists). Open **Travel**, tap
   **Mark ticketed** on a traveller and watch Travel and the overall percentage update.
   Then **Record decision** to log a Go / No-Go.
4. **Switch role** (More → Switch role, or long-press your avatar on Home) to **Finance Approver**.
   Approve the Creekside Grand hotel deposit. The ELP *Financial Preparation* readiness item
   completes automatically, because there is one source of truth.
5. Try **Faculty Mode** (Prof. Elena Vasquez) and **Learner Mode** (Mariam Al Khatib) from the
   role switcher. Each has its own simplified navigation and no access to internal data.
6. **Ask the assistant** (Home → Ask ProgrammeOS) or try **Voice to action** from Quick actions (+).
7. **Settings → Prototype controls** simulates offline, slow loading and errors across the app;
   **More → UI states gallery** shows every designed state side by side.

## What's included

### Three experiences, one app

| Experience | Navigation | Who |
| --- | --- | --- |
| Internal staff | Home · Programmes · Tasks · Inbox · More | 10 roles, each previewable with its own Home (Programme Manager, Coordinator, Academic Coordinator, Faculty Operations, Logistics, Finance Officer, Finance Approver, Learner Support, Senior Management, Administrator) |
| Faculty Mode | Home · My Schedule · My Programmes · Inbox · Profile | Prof. Elena Vasquez |
| Learner Mode | Home · My Programme · Schedule · Materials · Profile | Mariam Al Khatib |

Access is role-based. Roles without permission see a designed *Permission restricted* state
(for example Finance for a Programme Coordinator), and financial figures are hidden from roles
without finance access. Client and supplier portals are out of scope for this phase. The route
structure leaves room for them.

### The 12 functional modules

1. **Programme management**: directory with search, filters and sort; workspace overview with
   six status dimensions (commercial, operational, academic, logistics, financial, delivery);
   timeline and milestones; activity history; documents; discussion; archive; create and edit.
2. **Scheduling & calendar**: agenda, day, week and month views; programme and faculty
   calendars; resource scheduling; time-zone conversion; conflict detection across time zones;
   session detail; new session with a live availability check; attendance.
3. **Faculty management**: directory, profiles (expertise, schedule, assignments, contracts and
   fees, travel, documents, feedback), availability calendar, and a step-by-step assignment workflow.
4. **Learner management**: directory, person profiles kept separate from programme enrolments,
   registration, nominations, CSV/Excel import with validation preview (simulated), requirements,
   attendance, assessments, certificates.
5. **Academic management**: Programme → Cohort → Module → Session → Materials hierarchy; review
   queue; material detail with Draft / Final / Revised versions; approve, request changes, publish.
6. **Travel & accommodation**: travel overview, boarding-pass itineraries, hotels, booking
   records with confirmation status, rooming lists and room allocation, hotel-booking workflow.
7. **Venue & logistics**: venues, rooms and seating layouts, venue bookings (AV, catering),
   logistics checklist that feeds readiness, on-site run sheet.
8. **Client management**: client directory and profiles, contacts, contracts, programme history,
   requests and approvals, communication history.
9. **Finance**: revenue, invoices and receivables; costs by category; budget vs committed vs
   actual vs pending; transactions (purchase requests and orders, supplier and faculty invoices,
   payment requests, expenses); programme profitability; record expense.
10. **Tasks & workflow**: my, team and programme tasks; task detail with dependencies,
    attachments, comments and history; workflow templates (3-day, 5-day, 6-month hybrid, virtual,
    custom) that generate tasks.
11. **Communications**: unified inbox of email, WhatsApp, internal and call-note *references* with
    contextual actions (add note, link to programme, create task, mark resolved, open related
    record); notifications with categories and read states; activity feed.
12. **Reporting & analytics**: 12 reports (executive overview, portfolio, performance, readiness,
    budget vs actual, revenue and costs, profitability, faculty utilisation, learner participation,
    attendance, evaluations, operational performance) with interactive charts.

### Signature capabilities

- **Programme Readiness Engine**: nine dimensions derived from live records, owners and due dates,
  critical alerts, inline resolution, and a Go / No-Go checkpoint with a system recommendation.
- **Workflow visualisations**: A (new programme lifecycle), B (faculty assignment) and C (hotel
  booking) as step timelines driven by real record states.
- **Intelligent features (visual prototypes)**: a programme assistant whose answers come from
  rules over the sample data, voice-to-action (record → transcript → extraction → review), smart
  alerts, and document intelligence (upload → extraction → correction → link).
- **Quick actions** from Home and every programme workspace.

### Designed states

Default · Empty · Loading (skeletons) · Error (with retry) · Offline · Success · No search results ·
No filter results · Permission restricted · Archived · Pending approval · Overdue · Completed ·
Cancelled · Unsaved changes (the programme edit screen asks before discarding).

## Design system

- **Tokens** (`src/theme/tokens.ts`): semantic colours for light, plus a separately tuned dark
  theme (deep charcoal, layered surfaces, lifted semantic colours). Brand palette: Midnight
  `#111827`, Cloud `#F5F6F7`, Accent `#587CFA`, Success `#32B995`, Warning `#D9A441`, Danger `#D85D65`.
  Small-text variants of each colour are contrast-tuned to WCAG AA (4.5:1). The secondary text
  colour is `#646B78` instead of `#7A8290` for the same reason.
- **Typography** (`src/theme/typography.ts`): SF Pro on iOS (the system face), Inter on Android and
  web, with a restrained phone-first scale and tabular numbers for figures.
- **Components** (`src/components`): buttons, icon buttons, cards, status pills (one mapping for
  every status in the model), avatars, list rows and groups, search, segmented controls, tabs,
  chips, progress bars and rings, bottom sheets with drag-to-dismiss, action sheets, searchable
  selects, calendar date picker, wheel time picker, confirmation dialogs, toasts, form fields,
  step indicators, charts (bar, line/area, donut, horizontal bars, gauge, sparkline), timeline,
  document previews, and loading, empty, error, offline and restricted states.
- Light and dark mode follow the system by default. Switch them in Settings or in either profile.
  Reduce Motion is supported.

## Project structure

```
programmeos/
  src/
    app/                 Expo Router routes (thin files that re-export feature screens)
      (staff)/           Staff tab bar: home, programmes, tasks, inbox, more
      faculty-mode/      Faculty tab bar        fm/   Faculty detail screens
      learner-mode/      Learner tab bar        lm/   Learner detail screens
      programme/[id]/    Programme workspace
    features/            Screens grouped by module (programmes, scheduling, finance, …)
      shared/            Domain components reused across modules
    components/          Design system (ui, layout, sheets, forms, charts, data, feedback)
    data/
      models/            Typed conceptual data model (PostgreSQL/API-ready)
      mock/              Interconnected sample data for Emeritus Education
      store.tsx          In-memory store with named actions (future API client shape)
      selectors.ts       Derived data: readiness engine, finance, conflicts, task groups
      session.tsx        Prototype session: active experience, role, preferences
    navigation/          Role access rules and the shared tab bar
    theme/               Tokens, typography, theme provider
    utils/               Dates and time zones, money and formatting
  docs/ROUTES.md         Full route map
  scripts/               Sample-data integrity check
```

### Architecture notes for the next phase

- **Data model.** `src/data/models` defines Organization, User, Person, Role, Client, Contract,
  Programme, Cohort, Module, Session, Faculty Assignment, Enrollment, Task, Booking, Expense,
  Revenue, Invoice, Document, Approval, Notification and Activity Log. Relationships use ids only,
  never nested copies, which maps directly to PostgreSQL tables.
- **Store.** Screens read through `useDB()` and change data only through `useActions()`. Swapping
  the in-memory store for an API client (with optimistic updates and an offline queue) does not
  change any screen.
- **Desktop.** The design tokens, data model, selectors and most domain components are
  layout-independent and can be shared with a future Next.js desktop experience.

## Sample data

Emeritus Education, with 10 programmes: the 8 specified, one archived and one cancelled. Also
12 faculty, 60 learners, 5 institutional and corporate clients, 5 hotels, 5 venues, 36 tasks,
27 sessions, 30 financial records (expense-side transactions plus client invoices), 17 documents,
28 notifications, approvals, communications, activity history and workflow templates. Dates sit
around 2027. Every reference resolves (`npm run validate:data`): a faculty member on a programme
is in the faculty directory, and every hotel booking points at a real programme and a real guest.

## Known limitations

- **Simulated only.** Sign-in, AI answers, speech recognition, document extraction, file picking,
  imports, payments, email and WhatsApp are not real.
- **Changes don't persist.** They reset when the app reloads. Theme, role and preview settings do
  persist. Settings → Reset sample data restores the scenario at any time.
- **Fixed offsets for time zones.** Conversions use offsets valid for spring 2027 instead of a
  full time-zone database.
- **Verification so far.** The prototype was checked in a phone-sized browser through the Expo web
  build. It uses only Expo Go-compatible modules, but it has not been run on a physical device or
  simulator from this environment.
