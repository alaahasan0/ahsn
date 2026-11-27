#!/usr/bin/env node
/*
 * BENA UI check — loads routes in Chromium (file://, no server needed) and reports:
 *   - console errors / page errors / "No action" warnings
 *   - horizontal page overflow (body wider than the viewport)
 *   - optional screenshots
 *   - optional "click every control" sweep (--click) to find broken buttons
 *
 * Usage:
 *   node tools/check.cjs --routes resident-home,resident-unit [--w 390 --h 844] [--shots DIR] [--click] [--ar]
 *   node tools/check.cjs --role resident            # every menu page of a role (enterprise app)
 *   node tools/check.cjs --site                     # every public-website page (B.site.pages)
 *   node tools/check.cjs --mrole tech               # every screen of a mobile role (tabs + more)
 */
const path = require('path');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : d; };
const W = +opt('w', 390), H = +opt('h', 844);
const shots = opt('shots', null);
const doClick = !!opt('click', false);
const ar = !!opt('ar', false);
const file = 'file://' + path.resolve(__dirname, '..', 'index.html');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  let issues = [];
  page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /No action/.test(m.text()))) issues.push(`[console.${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => issues.push(`[pageerror] ${e.message}`));
  // block network fonts for speed/offline determinism
  await page.route(/^https?:/, (r) => r.abort());

  let routes = String(opt('routes', '') || '').split(',').filter(Boolean);
  const role = opt('role', null);
  const mrole = opt('mrole', null);
  const site = !!opt('site', false);
  await page.goto(file + '#hub');
  if (ar) { await page.evaluate(() => window.B.setLang('ar')); }
  if (role) {
    const ids = await page.evaluate((r) => window.B.roles[r].menu.filter((m) => m.id).map((m) => m.id), role);
    routes = routes.concat(ids.map((i) => `${role}-${i}`));
  }
  if (mrole) {
    const ids = await page.evaluate((r) => { const R = window.B.mroles[r]; return R ? [...(R.tabs || []), ...(R.more || [])].map((m) => m.id) : null; }, mrole);
    if (!ids) { console.log(`✗ mobile role "${mrole}" is not registered`); await browser.close(); process.exit(1); }
    routes = routes.concat(ids.map((i) => `m-${mrole}-${i}`));
  }
  if (site) {
    const ids = await page.evaluate(() => (window.B.site && window.B.site.pages) || ['home']);
    routes = routes.concat(ids.map((i) => (i === 'home' ? 'site' : `site-${i}`)));
  }
  if (!routes.length) routes = ['hub'];
  let total = 0;
  for (const r of routes) {
    issues = [];
    await page.evaluate((h) => { location.hash = h; }, r);
    await page.waitForTimeout(250);
    const info = await page.evaluate(() => {
      const de = document.documentElement;
      const over = de.scrollWidth > window.innerWidth + 1;
      let culprit = '';
      if (over) {
        const all = [...document.querySelectorAll('.view *, [data-exp-root] *')];
        const bad = all.find((el) => { const b = el.getBoundingClientRect(); return b.right > window.innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('.table-wrap,.chips,.tabs,.seg,.map-shell'); });
        if (bad) culprit = bad.tagName + '.' + [...bad.classList].join('.') + ' "' + (bad.textContent || '').trim().slice(0, 40) + '"';
      }
      const err = document.querySelector('.view, .welcome, [data-exp-root]') ? '' : 'NO VIEW';
      const nf = document.querySelector('.empty h3')?.textContent?.includes('not part of the demo') ? 'NOT FOUND PAGE' : '';
      return { over, sw: de.scrollWidth, culprit, err, nf, title: document.querySelector('.mbar .mt b, .topbar .crumbs b')?.textContent || '' };
    });
    if (info.over) issues.push(`[overflow] scrollWidth ${info.sw} > ${W} ${info.culprit}`);
    if (info.err) issues.push('[render] ' + info.err);
    if (info.nf) issues.push('[route] ' + info.nf);
    if (shots) await page.screenshot({ path: path.join(shots, `${r}${ar ? '-ar' : ''}-${W}.png`), fullPage: !!opt('full', false) });
    if (doClick) {
      const n = await page.evaluate(() => document.querySelectorAll('.view [data-act], .view [data-go], [data-exp-root] [data-act], [data-exp-root] [data-go]').length);
      for (let i = 0; i < Math.min(n, +opt('max', 80)); i++) {
        await page.evaluate((h) => { location.hash = 'hub'; location.hash = h; }, r);
        await page.waitForTimeout(60);
        const desc = await page.evaluate((i) => {
          const el = document.querySelectorAll('.view [data-act], .view [data-go], [data-exp-root] [data-act], [data-exp-root] [data-go]')[i];
          if (!el) return null;
          const d = (el.dataset.act ? 'act:' + el.dataset.act + '(' + (el.dataset.arg || '') + ')' : 'go:' + el.dataset.go);
          el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return d;
        }, i);
        await page.waitForTimeout(40);
        const nf = await page.evaluate(() => document.querySelector('.empty h3')?.textContent?.includes('not part of the demo'));
        if (nf) issues.push(`[route] ${desc} → NOT FOUND PAGE`);
        // submit any open modal form to exercise submit handlers
        await page.evaluate(() => { const f = document.querySelector('.scrim form[data-submit]'); if (f) { f.querySelectorAll('[required]').forEach((x) => { if (!x.value) x.value = x.type === 'number' ? '1' : x.type === 'date' ? '2026-12-01' : 'Test'; }); f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); } });
        await page.waitForTimeout(30);
        await page.evaluate(() => window.B.closeModal(true));
        if (issues.length && !issues[issues.length - 1].includes('←')) issues[issues.length - 1] += `  ← after ${desc}`;
      }
    }
    total += issues.length;
    console.log(`${issues.length ? '✗' : '✓'} ${r} ${info.title ? '— ' + info.title : ''}`);
    issues.forEach((x) => console.log('    ' + x));
  }
  await browser.close();
  console.log(total ? `\n${total} issue(s)` : '\nAll clear');
  process.exit(total ? 1 : 0);
})();
