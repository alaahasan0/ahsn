// End-to-end UI check on an emulated iPhone. Needs: python3 -m http.server 8765
// Run: node tests/browser/ui.check.cjs [screenshotDir]
const { chromium, devices } = require('playwright');
const assert = require('node:assert/strict');
const BASE = process.env.BASE_URL || 'http://localhost:8765/';
const shots = process.argv[2];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 15 Pro'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const shot = async (name) => { if (!shots) return; await page.waitForTimeout(400); await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true }); };

  // Fresh start → setup screen
  await page.goto(`${BASE}?today=2026-12-20`);
  await page.evaluate(async () => { const db = await import('./js/db/store.js'); await db.resetAll(); sessionStorage.clear(); });
  await page.reload();
  await page.waitForSelector('#setup-form');
  assert.equal(await page.isVisible('.tabbar'), false, 'tab bar hidden during setup');
  assert.equal(await page.textContent('#first-due'), '30 Nov 2026');
  await shot('1-setup');

  // Validation: bad salary
  await page.fill('input[name=salary]', 'abc');
  await page.click('button[type=submit]');
  assert.match(await page.textContent('#setup-error'), /salary/i);
  await page.fill('input[name=salary]', '800');
  await page.fill('input[name=opening]', '150');
  await page.click('button[type=submit]');
  await page.waitForSelector('#hero-figure');

  // Add Scenario D payment via storage layer (UI entry arrives in Phase 4)
  await page.evaluate(async () => {
    const s = await import('./js/state.js');
    await s.savePayment({ date: '2026-12-15', totalCents: 50000, smartOfficeCents: 20000, classSolutionCents: 30000, reference: 'TX-77' });
  });
  await page.waitForTimeout(200);
  // opening 150 + Nov 800 − 500 = 450 (Dec salary not due until 31 Dec)
  assert.equal(await page.textContent('#hero-figure'), '$450.00');
  assert.match(await page.textContent('.hero-status'), /Owed to you/);
  assert.match(await page.textContent('main'), /in 11 days/);
  await shot('2-dashboard');

  // Historical as-of: 29 Nov → only opening 150
  await page.evaluate(() => { const i = document.querySelector('#asof-input'); i.value = '2026-11-29'; i.dispatchEvent(new Event('change')); });
  await page.waitForTimeout(100);
  assert.equal(await page.textContent('#hero-figure'), '$150.00');
  await page.evaluate(() => { const i = document.querySelector('#asof-input'); i.value = '2026-12-31'; i.dispatchEvent(new Event('change')); });
  await page.waitForTimeout(100);
  assert.equal(await page.textContent('#hero-figure'), '$1,250.00');
  await page.click('#asof-reset');
  await page.waitForTimeout(100);
  assert.equal(await page.textContent('#hero-figure'), '$450.00');

  // Company sheet
  await page.click('[data-company=classSolution]');
  await page.waitForSelector('.sheet.is-open');
  assert.match(await page.textContent('.sheet'), /\$300\.00/);
  assert.match(await page.textContent('.sheet'), /of \$500\.00 transfer/);
  await shot('3-company-sheet');
  await page.click('.sheet [data-close]');
  await page.waitForTimeout(350);

  // Persistence across reload
  await page.reload();
  await page.waitForSelector('#hero-figure');
  assert.equal(await page.textContent('#hero-figure'), '$450.00');

  // More screen + demo mode
  await page.click('[data-route=more]');
  await page.waitForSelector('#demo-toggle');
  assert.match(await page.textContent('main'), /\$150\.00 owed to you/);
  await page.click('#demo-toggle');
  await page.click('[data-route=home]');
  await page.waitForTimeout(150);
  assert.equal(await page.isVisible('#demo-banner'), true);
  const demoBalance = await page.textContent('#hero-figure');
  await shot('4-demo-dashboard');
  const blocked = await page.evaluate(async () => {
    const s = await import('./js/state.js');
    try { await s.savePayment({ date: '2027-01-01', totalCents: 1, smartOfficeCents: 1, classSolutionCents: 0 }); return false; } catch { return true; }
  });
  assert.ok(blocked, 'demo mode blocks saving');
  await page.click('[data-route=more]');
  await page.click('#demo-toggle');
  await page.click('[data-route=home]');
  await page.waitForTimeout(150);
  assert.equal(await page.textContent('#hero-figure'), '$450.00', 'real data back after demo');

  // Dark mode
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.click('[data-route=more]');
  await shot('5-more-dark');
  await page.click('[data-route=home]');
  await shot('6-dashboard-dark');
  await page.emulateMedia({ colorScheme: 'light' });

  // Erase all (two confirmations) → back to setup
  await page.click('[data-route=more]');
  await page.click('#erase');
  await page.click('.sheet [data-confirm]');
  await page.waitForTimeout(400);
  await page.click('.sheet.is-open [data-confirm]');
  await page.waitForSelector('#setup-form');

  assert.deepEqual(errors, []);
  await browser.close();
  console.log(`UI checks passed ✓ (demo balance ${demoBalance})`);
})().catch((e) => { console.error(e); process.exit(1); });
