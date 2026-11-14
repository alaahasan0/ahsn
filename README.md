# Salary — Personal Salary & Payment Tracker

An offline Progressive Web App (PWA) for tracking a monthly salary against
the payments actually received through Smart Office and The Class Solution.

- **No build step.** Plain HTML, CSS and JavaScript (ES modules), served as-is.
- **Private by design.** All financial data stays on the device in IndexedDB.
  This repository holds only the app code. It never holds your data.
- **Exact money maths.** Every amount is stored and calculated as integer cents.

## Project structure

```
index.html              App entry point
manifest.webmanifest    Home Screen install metadata
sw.js                   Service worker (offline support)
css/app.css             Design system (light & dark)
js/app.js               Bootstrap + router
js/state.js             Bridge between storage and screens (+ demo mode)
js/engine/              Financial calculation engine — pure functions, no DOM
js/db/                  IndexedDB storage layer with audit log
js/ui/                  Screens (setup, overview, more) and shared components
tests/                  Engine tests (Node) and browser tests (Playwright)
icons/                  App icons
```

## Phases

1. ✅ Environment & project structure
2. ✅ Financial calculation engine & database
3. ✅ Dashboard & initial configuration
4. Payment entry, transaction history, balance adjustments
5. Monthly statements & company breakdowns
6. Backup, restore & exports
7. Financial scenario testing
8. Deployment & Home Screen install

## Tests

The financial engine has automated tests, including the required scenarios A–D
checked at historical dates:

```
npm test               # engine tests (Node, no dependencies)
npm run test:browser   # IndexedDB + full UI flow in Chromium (needs: python3 -m http.server 8765)
```

Append `?today=YYYY-MM-DD` to the URL to view the app as if it were another day.

```
```

## Releasing an update

Bump `CACHE_VERSION` in `sw.js` (and `APP_VERSION` in `js/app.js`) so installed
copies download the new files.
