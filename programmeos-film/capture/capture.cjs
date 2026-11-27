/**
 * ProgrammeOS film — footage capture.
 *
 * Drives the real ProgrammeOS app (Expo web build of /programmeos, served locally) in a
 * phone-sized Chromium viewport and captures:
 *   - stills:    footage/stills/<name>.png            (1170×2532, 3× density)
 *   - sequences: footage/sequences/<name>/0000.jpg     (24 fps scroll moves, 3× density)
 *
 * Nothing in the app is modified: all content is the app's own sample data and UI.
 * Two takes that need exact positions live in their own scripts: capture_home_tap.cjs (Home → ELP)
 * and capture_readiness_tap.cjs (the readiness interaction).
 * Usage: node capture.cjs [base-url] [only-shot-name|-] [resume-from-shot]
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.argv[2] || 'http://localhost:8790';
const ONLY = process.argv[3];
const FROM = process.argv[4];
const OUT = path.resolve(__dirname, '../footage');
const VIEW = { width: 390, height: 844 };
const DPR = 3;

const session = (extra = {}) => JSON.stringify({ signedIn: true, mode: 'staff', role: 'programme_manager', themePreference: 'light', ...extra });

/** Each shot: route, optional setup steps, and either a still or a scroll sequence. */
const SHOTS = [
  // Scene 03 — one programme, one workspace
  { name: 's03_home', route: '/home' },
  { name: 's03_programmes', route: '/programmes' },
  { name: 's03_elp_overview', route: '/programme/p-elp' },
  { name: 's03_elp_overview_scroll', route: '/programme/p-elp', seq: { to: 900, seconds: 4.5 } },
  { name: 's03_elp_timeline', route: '/programme/p-elp/timeline' },
  // Scene 04 — people
  { name: 's04_faculty_directory', route: '/faculty' },
  { name: 's04_faculty_vasquez', route: '/faculty/f-vasquez' },
  { name: 's04_elp_faculty', route: '/programme/p-elp/faculty' },
  { name: 's04_elp_participants', route: '/programme/p-elp/participants' },
  { name: 's04_elp_participants_scroll', route: '/programme/p-elp/participants', seq: { to: 700, seconds: 4 } },
  { name: 's04_learner_noor', route: '/learner/l-13' },
  // Scene 05 — academic experience
  { name: 's05_calendar_agenda', route: '/calendar' },
  { name: 's05_calendar_week_elp', route: '/calendar', steps: [['click', 'Week'], ['wait', 500], ['label', 'Next'], ['wait', 400], ['label', 'Next'], ['wait', 700]] },
  { name: 's05_calendar_month', route: '/calendar', steps: [['click', 'Month'], ['wait', 700]] },
  { name: 's05_elp_sessions', route: '/programme/p-elp/sessions' },
  { name: 's05_elp_sessions_scroll', route: '/programme/p-elp/sessions', seq: { to: 900, seconds: 4.5 } },
  { name: 's05_session_keynote', route: '/session/ss-elp-1' },
  { name: 's05_elp_academics', route: '/programme/p-elp/academics' },
  { name: 's05_module_strategy', route: '/module/m-elp-2' },
  // Scene 06 — travel, accommodation, venues, logistics
  { name: 's06_elp_logistics', route: '/programme/p-elp/logistics' },
  { name: 's06_itinerary_vasquez', route: '/travel/ti-elp-17' },
  { name: 's06_rooming_elp', route: '/rooming/p-elp' },
  { name: 's06_rooming_elp_scroll', route: '/rooming/p-elp', seq: { to: 650, seconds: 4 } },
  { name: 's06_hotel_creekside', route: '/hotel/h-creekside' },
  { name: 's06_venue_booking', route: '/venue-booking/vb-elp-1' },
  { name: 's06_venue_creekside', route: '/venue/v-creekside' },
  { name: 's06_checklist_elp', route: '/logistics/checklist/p-elp' },
  { name: 's06_travel_elp', route: '/travel?programme=p-elp' },
  // Scene 07 — financial control
  { name: 's07_elp_finance', route: '/programme/p-elp/finance' },
  { name: 's07_elp_finance_scroll', route: '/programme/p-elp/finance', seq: { to: 950, seconds: 5 } },
  { name: 's07_finance', route: '/finance' },
  { name: 's07_transactions', route: '/finance/transactions' },
  { name: 's07_report_budget', route: '/report/budget' },
  // Scene 08 — intelligence at work (readiness engine)
  { name: 's08_readiness_before', route: '/programme/p-elp/readiness' },
  { name: 's08_readiness_after_toast', route: '/programme/p-elp/readiness', steps: [['clickp', 'Mark ticketed'], ['wait', 900]] },
  { name: 's08_readiness_after_top', route: '/programme/p-elp/readiness', steps: [['clickp', 'Mark ticketed'], ['wait', 3200], ['scrollTop', 0], ['wait', 900]] },
  { name: 's08_alerts', route: '/alerts' },
  { name: 's08_assistant', route: '/assistant?q=What%20is%20still%20pending%20before%20ELP%3F', steps: [['wait', 1800]] },
  { name: 's08_approval_deposit', route: '/approval/a-01', session: { role: 'finance_approver' } },
  // Scene 09 — portfolio
  { name: 's09_programmes', route: '/programmes' },
  { name: 's09_programmes_scroll', route: '/programmes', seq: { to: 1100, seconds: 5 } },
  { name: 's09_report_executive', route: '/report/executive' },
  { name: 's09_report_readiness', route: '/report/readiness' },
  { name: 's09_reports', route: '/reports' },
  { name: 's09_home_exec', route: '/home', session: { role: 'senior_management' } },
  // Dark-mode variants for visual rhythm
  { name: 'dk_elp_overview', route: '/programme/p-elp', session: { themePreference: 'dark' } },
  { name: 'dk_readiness', route: '/programme/p-elp/readiness', session: { themePreference: 'dark' } },
  { name: 'dk_elp_finance', route: '/programme/p-elp/finance', session: { themePreference: 'dark' } },
  { name: 'dk_home', route: '/home', session: { themePreference: 'dark' } },
  { name: 'dk_report_executive', route: '/report/executive', session: { themePreference: 'dark' } },
  { name: 'dk_itinerary_vasquez', route: '/travel/ti-elp-17', session: { themePreference: 'dark' } },
];

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

async function mainScroller(page) {
  return page.evaluateHandle(() => {
    const els = [...document.querySelectorAll('div')].filter((d) => {
      const s = getComputedStyle(d);
      if (!/(auto|scroll)/.test(s.overflowY) || d.scrollHeight <= d.clientHeight + 8) return false;
      const r = d.getBoundingClientRect();
      return r.width > 300 && r.height > 400 && r.top < 100 && d.offsetParent !== null;
    });
    els.sort((a, b) => b.clientHeight * b.clientWidth - a.clientHeight * a.clientWidth);
    return els[0] || null;
  });
}

async function settle(page, ms = 250) {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  if (ms) await page.waitForTimeout(ms);
}

(async () => {
  fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'sequences'), { recursive: true });
  const browser = await chromium.launch();
  const manifest = [];
  let started = !FROM;
  for (const shot of SHOTS) {
    if (FROM && shot.name === FROM) started = true;
    if (!started) continue;
    if (ONLY && ONLY !== '-' && shot.name !== ONLY) continue;
    const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: DPR, isMobile: true, hasTouch: true, colorScheme: shot.session?.themePreference === 'dark' ? 'dark' : 'light' });
    await ctx.addInitScript((s) => localStorage.setItem('programmeos.session.v1', s), session(shot.session));
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE + shot.route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500); // first-visit skeletons and entry animations settle
    for (const [kind, arg] of shot.steps || []) {
      if (kind === 'click') await page.getByText(arg, { exact: true }).first().click();
      else if (kind === 'clickp') await page.getByText(arg, { exact: false }).first().click();
      else if (kind === 'label') await page.getByLabel(arg, { exact: false }).first().click();
      else if (kind === 'wait') await page.waitForTimeout(arg);
      else if (kind === 'scrollTop') {
        const el = await mainScroller(page);
        await el.evaluate((d, v) => d.scrollTo({ top: v }), arg);
      }
    }
    if (shot.seq) {
      const dir = path.join(OUT, 'sequences', shot.name);
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      const el = await mainScroller(page);
      const max = await el.evaluate((d) => d.scrollHeight - d.clientHeight);
      const to = Math.min(shot.seq.to, max);
      const frames = Math.round(shot.seq.seconds * 24);
      for (let i = 0; i < frames; i++) {
        const y = to * ease(i / (frames - 1));
        await el.evaluate((d, v) => {
          d.scrollTop = v;
          d.dispatchEvent(new Event('scroll'));
        }, y);
        await settle(page, 30);
        await page.screenshot({ path: path.join(dir, `${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
      }
      manifest.push({ name: shot.name, route: shot.route, type: 'sequence', frames, scrollTo: to, theme: shot.session?.themePreference || 'light', role: shot.session?.role || 'programme_manager' });
    } else {
      await settle(page, 200);
      await page.screenshot({ path: path.join(OUT, 'stills', `${shot.name}.png`) });
      manifest.push({ name: shot.name, route: shot.route, type: 'still', theme: shot.session?.themePreference || 'light', role: shot.session?.role || 'programme_manager' });
    }
    console.log(`${shot.name}: ${errors.length ? 'ERRORS ' + errors.join(' | ') : 'ok'}`);
    await ctx.close();
  }
  // footage/manifest.json is built by footage/build_manifest.py from this list and the other capture scripts.
  void manifest;
  await browser.close();
})();
