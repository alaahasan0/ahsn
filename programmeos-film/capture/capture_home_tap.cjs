/**
 * Captures the home → ELP hand-off: an eased scroll on Home that stops with the
 * Executive Leadership Programme readiness row mid-screen, plus that row's position
 * (for the tap indicator). Same viewport, density and easing as capture.cjs.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const BASE = process.argv[2] || 'http://localhost:8790';
const OUT = path.resolve(__dirname, '../footage');
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await ctx.addInitScript((s) => localStorage.setItem('programmeos.session.v1', s), JSON.stringify({ signedIn: true, mode: 'staff', role: 'programme_manager', themePreference: 'light' }));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE + '/home', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const el = await page.evaluateHandle(() => {
    const els = [...document.querySelectorAll('div')].filter((d) => {
      const s = getComputedStyle(d);
      if (!/(auto|scroll)/.test(s.overflowY) || d.scrollHeight <= d.clientHeight + 8) return false;
      const r = d.getBoundingClientRect();
      return r.width > 300 && r.height > 400 && r.top < 100 && d.offsetParent !== null;
    });
    els.sort((a, b) => b.clientHeight * b.clientWidth - a.clientHeight * a.clientWidth);
    return els[0];
  });
  const row = page.getByText('Executive Leadership Programme', { exact: true }).first();
  const b0 = await row.boundingBox();
  const to = Math.round(b0.y - 400);
  const dir = path.join(OUT, 'sequences', 's03_home_scroll_elp');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const frames = Math.round(3.2 * 24);
  for (let i = 0; i < frames; i++) {
    await el.evaluate((d, v) => { d.scrollTop = v; d.dispatchEvent(new Event('scroll')); }, to * ease(i / (frames - 1)));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.waitForTimeout(30);
    await page.screenshot({ path: path.join(dir, `${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
  const b1 = await row.boundingBox();
  fs.writeFileSync(path.join(OUT, 's03_home_tap.json'), JSON.stringify({ viewport: { width: 390, height: 844 }, scrollTo: to, row: b1 }, null, 2));
  console.log('to', to, 'row', b1, errors.length ? errors : 'no errors');
  await browser.close();
})();
