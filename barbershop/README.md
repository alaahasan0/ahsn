# Barber House OS — Barbershop Management Platform (Phase 1: UI/UX foundation)

> **One Salon. One Calendar. Every Booking.**

A complete, navigable interface prototype for a barbershop operating system. It has three experiences:

| Experience | Who | Entry |
| --- | --- | --- |
| **Salon owner / manager** | Runs the whole salon: calendar, bookings inbox, customers, team, services, availability, recurring bookings, analytics, notifications, settings | `/owner` |
| **Barber workspace** | A fast, one-handed day view: who's in the chair, who's next, quick bookings, walk-ins, voice assistant | `/barber` |
| **Customer portal** | A mobile-first web booking flow that needs no app and no account, plus the secure booking-management link customers open from WhatsApp/SMS | `/book/the-barber-house`, `/m/<token>` |

This phase is **UI only**. Every interaction runs against local mock state. Nothing is saved to a server and no message is sent. There is no real authentication, AI, payment or notification.

---

## Tech stack

- **Expo SDK 58** (React Native 0.88, React 19.3) with **TypeScript** (strict)
- **Expo Router** with route groups for navigation. The owner and barber areas use custom JS tab bars.
- **react-native-svg** for the brand mark and charts (bar, donut, area, sparkline, progress ring)
- **@expo-google-fonts**: Inter for Latin text, IBM Plex Sans Arabic for Arabic
- **@expo/vector-icons**: Feather, plus Ionicons/MaterialCommunity for a few brand glyphs
- **AsyncStorage** for prototype preferences only (language, theme, role, digit style)
- No state library: React context plus a reducer (`src/store/AppStore.tsx`)

## Getting started

```bash
cd barbershop
npm install
npm run web        # opens the prototype in the browser
npm start          # Expo dev server; scan the QR code with Expo Go (SDK 58) on iOS/Android
npx tsc --noEmit   # type-check
```

Static web build, for sharing with stakeholders:

```bash
npx expo export --platform web      # outputs dist/ (single-page app, any static host)
```

The web output is a single-page app (`"output": "single"`), so the host must fall back to `index.html` for unknown paths.

Self-contained single-file build (scripts and fonts inlined, no asset requests). This is what the shared prototype link uses:

```bash
ARTIFACT_BUILD=1 npx expo export --platform web --output-dir dist-artifact
node scripts/build-artifact.mjs dist-artifact dist-artifact/barber-house.html
```

Append `#owner`, `#barber`, `#assistant`, `#portal` or `#welcome` to the page link to open that area directly.

### Demo tips

- Start at the **welcome screen**. "Explore the prototype" jumps straight into the owner, barber, customer portal or booking-link experience.
- The copper **"Prototype · sample data"** pill on the dashboard and barber home switches experience at any time.
- **Language and theme**: there is a toggle on the welcome/login screens, *More → Prototype*, *Settings → Language / Appearance*, and the barber's *Profile*. Arabic (RTL) is the default.
- The **demo clock is fixed at 2:20 PM today** (`src/lib/clock.ts`), so the salon always looks mid-shift: customers in the chair, a next customer, a partly completed day.
- **More → Prototype → Reset demo data** restores the original mock salon.
- **Voice assistant**: the barber *Assistant* tab, or *Voice assistant* in the owner's quick actions. Tap a suggestion chip. "احجز لأحمد الساعة خمسة." plays the spec's dialogue: 5:00 is taken, 5:30 is offered, "آه.", then a final confirmation. Confirming creates a real (local) booking you can then open.

## Project structure

```
barbershop/
├── app.json                    Expo config (name, icons, splash, web output)
├── assets/images/              App icon, adaptive icon, splash, favicon
└── src/
    ├── app/                    Expo Router routes (thin files that render feature screens)
    │   ├── _layout.tsx         Providers: preferences → theme → i18n → store; root Stack
    │   ├── index.tsx           Splash
    │   ├── +not-found.tsx
    │   ├── (auth)/             welcome, login, register, forgot-password, verify
    │   ├── onboarding/         salon profile → hours → services → barbers → complete
    │   ├── owner/              Tabs: Home · Calendar · Bookings · Customers · More
    │   ├── barber/             Tabs: Today · Calendar · Assistant · Customers · Profile
    │   ├── appointment/        new (multi-step flow), [id], [id]/reschedule
    │   ├── block-time.tsx, voice.tsx
    │   ├── customers/, trust.tsx, services/, team/, availability/, recurring/
    │   ├── analytics.tsx, notifications/ (+ settings, templates), settings/ (11 screens)
    │   ├── book/[slug]/        Customer portal (separate stack, no auth)
    │   └── m/[token]/          Booking-management link: confirm · reschedule · cancel
    ├── features/<module>/      Screens and module-specific components, one folder per module
    ├── components/
    │   ├── ui/                 Design-system primitives (Text, Button, Card, Input, PhoneInput,
    │   │                       Sheet, Dialog, Toast, SegmentedControl, Chip, ListRow, States…)
    │   ├── domain/             AppointmentCard, StatusBadge, SourceTag, CustomerRow, DateStrip,
    │   │                       TimeSlotGrid, ServiceRow, BarberAvatar, BrandMark, calendar/…
    │   ├── charts/             SVG charts
    │   └── navigation/         TabBar
    ├── theme/                  Tokens (colour, type, spacing, radius, shadow), light/dark, fonts
    ├── i18n/                   Provider, typed keys, plurals, formatters, locales/{en,ar}/<ns>.ts
    ├── store/                  Prototype store + action contracts, selectors, mock availability
    ├── mock/                   Deterministic sample salon ("The Barber House")
    ├── types/models.ts         Domain entities (Salon, User, Barber, Customer, Service,
    │                           Appointment, RecurringSeries, Notification, BookingSource…)
    └── lib/                    Dates, recurrence, phone helpers, ids, demo clock
```

### Architecture notes (for Phase 2)

- **Screens never touch data directly.** They read through hooks in `src/store/selectors.ts` and write through `useActions()` (`createAppointment`, `setAppointmentStatus`, `rescheduleAppointment`, `resendConfirmation`, `createCustomer`, `addBlock`, `createRecurring`…). These signatures are the contract: replace their bodies with Supabase queries and RPCs, and the UI stays the same.
- **Multi-tenant ready.** Every entity carries `salonId`. Branches, users and roles are modelled.
- **Availability is a simulation** (`src/store/availability.ts`): slots, conflicts and alternatives are computed from the in-memory schedule. In production this must become a validated, atomic server-side check.
- **AI must never edit the database directly.** The voice assistant's "intent engine" (`src/features/voice/scripts.ts`) is a set of pure functions. They return assistant turns plus a *proposed* action, and the action only runs after an explicit confirmation tap, through the same store actions the manual UI uses. A real NLU slots in here, and the actions become permission-checked backend calls.
- **Phone numbers.** Phone and WhatsApp are separate fields everywhere. The country code is chosen explicitly (+970 / +972 / +962), and numbers always display left to right.
- **Customer categories** (Trusted / Regular / New) are internal salon classifications. The customer never sees them, and there is no public rating.

## Localization and RTL

- All copy lives in `src/i18n/locales/{en,ar}/<namespace>.ts`. English is the source of truth. The Arabic files are typed `DeepTranslation<typeof en>`, so **TypeScript fails if a key is missing**. Adding a language means adding one folder.
- `t('ns.key', params)`, `tp('ns.plural', count)` (full Arabic plural rules: zero/one/two/few/many/other), and `l(localizedText)` for bilingual content.
- Dates, times, money (₪), durations and phone numbers all go through `useI18n().f`. It uses Levantine month names, ص/م time markers, and optional Arabic-Indic digits (*Settings → Language*).
- **Live RTL switching without a reload.** Direction is applied with Yoga `direction` on native and `dir`/`lang` on web, at the root and inside every modal. All styles use logical properties (`marginStart`, `start`/`end`), and directional icons mirror automatically.
- Arabic copy is written in Palestinian Arabic with professional terms where needed.

## Implemented screens

**Auth and onboarding.** Splash, welcome (with prototype explorer), login (owner/barber), register, forgot password, OTP verification, and 5-step onboarding: salon profile and logo, opening hours, services, barbers, completion.

**Owner.**
- **Dashboard:** today's stats, occupancy ring, revenue vs expected, who's in the chair, up next, pending confirmations, recent activity and quick actions (New appointment, Add customer, Block time, View calendar, Voice assistant).
- **Calendar:** day view with barber columns, a now line, breaks and blocks; week and agenda views; filters for barber, service and status; search; a Today shortcut; tap an empty slot to book.
- **Appointment details:** status-aware actions, a confirmation-link card, notes and a history timeline.
- **New-appointment flow:** customer search or inline add, service, barber or "any available", date, time with a taken-slot alternatives state, booking source, confirmation link and message preview.
- **Reschedule and block time.**
- **Unified booking inbox:** requests, awaiting confirmation, recent, expired links, cancelled and activity, filterable by source.
- **Customers:** list, search, profile, add/edit, and history with an activity timeline.
- **Customer trust.**
- **Services:** list, details, add/edit.
- **Team:** list, profile with stats, add/edit, working hours and days off.
- **Availability:** salon hours, team week grid, holidays, time blocks.
- **Recurring appointments:** list, create with fixed-reservation vs recurring-invitation modes, details with per-occurrence cancel, pause/resume, edit, and cancel series.
- **Analytics:** daily, weekly, monthly or custom ranges, with summary cards, trend chart, booking sources, barber and service performance, and new vs returning customers.
- **Notifications:** notification centre, notification settings, and WhatsApp/SMS message templates in AR/EN with a live preview editor.
- **Settings:** salon profile, branches, users, roles and permissions, subscription, billing, language, appearance, security, and booking and cancellation policies.

**Barber.**
- **Today:** in the chair, next customer, timeline with free gaps, pending confirmations, and thumb-zone quick actions: New booking, Walk-in, Block time, Assistant.
- **Calendar** (single-barber mode), **customers**, **voice assistant** and **profile.**

**Voice assistant.** States: idle, listening (live transcription), processing, responding, awaiting confirmation (with alternative times), completed and error. It keeps conversation history and ships scripted commands from the spec (book, next customer, today's list, cancel, usual appointment, close a day, count). It always asks for a final confirmation.

**Customer portal.** Salon landing, info, service, barber or any available, date, time, details (separate phone and WhatsApp fields, preferred channel), phone verification, review with cancellation policy, confirmation, and manage-my-booking. The booking-management link offers confirm, reschedule and cancel. It enforces the cancellation window and handles expired, cancelled, completed and unknown links.

## Mock data

`src/mock/` deterministically generates **"The Barber House" (بيت الحلاق), Ramallah**, relative to the demo day:

- **Team and services:** 3 barbers with different schedules and specialities, a receptionist user, 9 services (one owner-only and phone-only), and 2 branches.
- **Customers:** 296 in total. 26 have hand-written profiles; the rest form a wider generated client base so visit counts stay realistic. Some deliberately have a WhatsApp number that differs from the phone number, including +970/+972 mixes, and some have no WhatsApp.
- **Appointments:** about 1,600 across 10 weeks of history and 3 weeks ahead. Every status, every booking source, confirmation links (sent, opened, expired), notes, a rescheduled pair, and online booking requests.
- **Recurring and messaging:** 6 recurring series (fixed and invitation, weekly / biweekly / monthly / every 6 weeks, one paused), time blocks, message templates in AR/EN for WhatsApp/SMS, and a notification feed.

## Known limitations

- **No backend.** All changes live in memory and are lost on reload. Preferences persist in local storage only.
- **No real integrations.** Authentication, OTP, WhatsApp/SMS, calls, push notifications, payments, speech recognition and AI are UI simulations. Outward-facing actions show a "simulated" toast.
- **Verified on web only.** The prototype was checked in a headless browser (Chromium, 390px phone width, and the portal at 1280px) in Arabic/English and light/dark. It uses only Expo Go-compatible modules, but it hasn't been run on a physical iOS/Android device in this phase. `expo-doctor` couldn't reach Expo's API from the build environment.
- **Native RTL stack animations.** On native, the push direction follows `LocaleProvider`/`slide_from_left`. A production build should also call `I18nManager.forceRTL` at startup so system controls mirror too.
- **Charts are custom SVG** and not interactive (no tooltips or scrubbing).
- **Day view with many barbers.** On narrow phones with more than 3 barbers it scrolls horizontally, and the time column scrolls with it.
- **Local-only settings.** Notification settings, role permission toggles, quiet hours and security sessions are kept in screen state only.
- **Notes stay in their original language.** Staff notes in the mock data are English and are not translated.

## Recommended next phase

1. **Supabase foundation:** a schema matching `src/types/models.ts` with `salon_id` row-level security, auth (phone OTP for staff and customers), and storage for logos and avatars.
2. **Replace the store bodies** with repository calls (React Query or similar). Keep the action signatures.
3. **Booking engine as server functions:** atomic availability checks, booking-rule validation, confirmation-link tokens with expiry, and cancellation-window enforcement.
4. **Messaging:** WhatsApp Business API and SMS providers driven by the template system, plus delivery and read status in the inbox.
5. **Push notifications** and reminders (scheduled jobs).
6. **Voice assistant:** speech-to-text for Palestinian Arabic/MSA/English, an LLM intent layer that calls the same validated actions with permission checks, and a mandatory confirmation step.
7. **Device QA** on iOS/Android development builds, accessibility audit, and analytics instrumentation.
