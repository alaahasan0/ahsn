/**
 * Captures the readiness interaction as one continuous take: an eased scroll on the ELP
 * Readiness screen that comes to rest on the first critical alert, the frame just before
 * the tap ("before"), and the screen 0.7 s after tapping "Mark ticketed" ("after").
 * Writes footage/sequences/s08_readiness_to_alert/, stills/s08_tap_before.png,
 * stills/s08_tap_after.png, sequences/s08_after_to_top/ (scroll back to the recalculated total)
 * and footage/s08_tap.json (button position for the tap indicator).
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
  await page.goto(BASE + '/programme/p-elp/readiness', { waitUntil: 'networkidle' });
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
  const btn = page.getByText('Mark ticketed', { exact: false }).first();
  const b0 = await btn.boundingBox();
  const to = Math.round(b0.y - 413);
  const dir = path.join(OUT, 'sequences', 's08_readiness_to_alert');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const frames = Math.round(4.4 * 24);
  for (let i = 0; i < frames; i++) {
    await el.evaluate((d, v) => { d.scrollTop = v; d.dispatchEvent(new Event('scroll')); }, to * ease(i / (frames - 1)));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.waitForTimeout(30);
    await page.screenshot({ path: path.join(dir, `${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
  await page.waitForTimeout(400);
  const box = await btn.boundingBox();
  await page.screenshot({ path: path.join(OUT, 'stills', 's08_tap_before.png') });
  await btn.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, 'stills', 's08_tap_after.png') });
  // Scroll back to the top to show the recalculated overall readiness (same eased move, 1 s).
  const up = path.join(OUT, 'sequences', 's08_after_to_top');
  fs.rmSync(up, { recursive: true, force: true });
  fs.mkdirSync(up, { recursive: true });
  const from = await el.evaluate((d) => d.scrollTop);
  for (let i = 0; i < 24; i++) {
    await el.evaluate((d, v) => { d.scrollTop = v; d.dispatchEvent(new Event('scroll')); }, from * (1 - ease(i / 23)));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.waitForTimeout(30);
    await page.screenshot({ path: path.join(up, `${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
  fs.writeFileSync(path.join(OUT, 's08_tap.json'), JSON.stringify({ viewport: { width: 390, height: 844 }, scrollTo: to, button: box }, null, 2));
  console.log('to', to, 'button', box, errors.length ? errors : 'no errors');
  await browser.close();
})();
