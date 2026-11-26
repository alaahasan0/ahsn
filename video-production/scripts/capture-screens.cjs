#!/usr/bin/env node
/*
 * Captures real BENA prototype screens (../bena/index.html) at high resolution
 * for use in the film. Output: public/shots/*.png + public/shots/manifest.json
 * Usage: node scripts/capture-screens.cjs
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const APP = 'file://' + path.resolve(__dirname, '../../bena/index.html');
const OUT = path.resolve(__dirname, '../public/shots');
fs.mkdirSync(OUT, { recursive: true });

const PHONE = { width: 390, height: 844, scale: 3 };
const TABLET = { width: 820, height: 1180, scale: 2 };
const DESK = { width: 1440, height: 900, scale: 2 };
const B142 = 'BN-RAM-00142';

// kind: 'phone' (full page body + separate header/tabbar), 'view' (viewport only), 'full'
const SHOTS = [
  { id: 'p_res_home', dev: PHONE, route: 'resident-home', kind: 'phone' },
  { id: 'p_res_mybuilding', dev: PHONE, route: 'resident-mybuilding', kind: 'phone' },
  { id: 'p_profile_overview', dev: PHONE, route: `resident-building-${B142}`, kind: 'phone', vs: { 'bp:tab': 'overview' } },
  { id: 'p_profile_identity', dev: PHONE, route: `resident-building-${B142}`, kind: 'phone', vs: { 'bp:tab': 'identity' } },
  { id: 'p_profile_units', dev: PHONE, route: `resident-building-${B142}`, kind: 'phone', vs: { 'bp:tab': 'units' } },
  { id: 'p_res_find', dev: PHONE, route: 'resident-find', kind: 'phone', vs: { 'rs:findSel': B142 }, focus: ['rs-find', B142, 300] },
  { id: 'p_owner_home', dev: PHONE, route: 'owner-home', kind: 'phone' },
  { id: 'p_committee_home', dev: PHONE, route: 'committee-home', kind: 'phone' },
  { id: 'p_committee_finance', dev: PHONE, route: 'committee-finance', kind: 'phone' },
  { id: 'p_res_requests', dev: PHONE, route: 'resident-request-MR-24518', kind: 'phone' },
  { id: 'p_services', dev: PHONE, route: 'resident-services', kind: 'phone' },
  { id: 'p_properties', dev: PHONE, route: 'resident-properties', kind: 'phone' },
  { id: 'p_listing', dev: PHONE, route: 'resident-listing-LS-26-1102', kind: 'phone' },
  { id: 'p_provider_home', dev: PHONE, route: 'provider-home', kind: 'phone' },
  { id: 't_muni_explorer', dev: TABLET, route: 'municipality-explorer', kind: 'view', act: ['muPick', B142] },
  { id: 't_muni_home', dev: TABLET, route: 'municipality-home', kind: 'full' },
  { id: 't_muni_registry', dev: TABLET, route: 'municipality-registry', kind: 'full' },
  { id: 't_manager_home', dev: TABLET, route: 'manager-home', kind: 'full' },
  { id: 't_manager_workspace', dev: TABLET, route: `manager-workspace-${B142}`, kind: 'full' },
  { id: 't_facility_home', dev: TABLET, route: 'facility-home', kind: 'full' },
  { id: 't_facility_assets', dev: TABLET, route: 'facility-assets', kind: 'full' },
  { id: 't_facility_pm', dev: TABLET, route: 'facility-pm', kind: 'full' },
  { id: 't_facility_wo', dev: TABLET, route: 'facility-workorders', kind: 'full' },
  { id: 't_committee_finance', dev: TABLET, route: 'committee-finance', kind: 'full' },
  { id: 'd_muni_explorer', dev: DESK, route: 'municipality-explorer', kind: 'view', act: ['muPick', B142] },
  { id: 'd_profile', dev: DESK, route: `municipality-building-${B142}`, kind: 'full', vs: { 'bp:tab': 'overview' } },
  { id: 'd_manager_home', dev: DESK, route: 'manager-home', kind: 'view' },
  { id: 'd_facility_home', dev: DESK, route: 'facility-home', kind: 'view' },
  { id: 'd_owner_home', dev: DESK, route: 'owner-home', kind: 'view' },
  { id: 'd_admin_home', dev: DESK, route: 'admin-home', kind: 'view' },
  { id: 'welcome', dev: PHONE, route: 'welcome', kind: 'full' },
];

// Clean large renders of the BENA city map (no controls), 1440×2560.
const MAPS = [
  { id: 'map_city_type', mode: 'type', view: { x: 150, y: 0, w: 394, h: 700 } },
  { id: 'map_city_ver', mode: 'verification', view: { x: 150, y: 0, w: 394, h: 700 } },
  { id: 'map_zoom', mode: 'type', focus: B142, w: 210 },
  { id: 'map_zoom_ver', mode: 'verification', focus: B142, w: 210 },
  { id: 'map_wide_source', mode: 'source', view: { x: 300, y: 0, w: 394, h: 700 } },
];

(async () => {
  const browser = await chromium.launch();
  const manifest = {};
  for (const s of (process.env.ONLY_MAPS ? [] : SHOTS)) {
    const ctx = await browser.newContext({ viewport: { width: s.dev.width, height: s.dev.height }, deviceScaleFactor: s.dev.scale });
    const page = await ctx.newPage();
    await page.goto(APP + '#welcome');
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(({ s }) => {
      const B = window.B;
      Object.assign(B.vs, s.vs || {});
      if (s.focus) B.map.focus(...s.focus);
      if (s.route === 'welcome') B.go('welcome'); else B.go(s.route);
      if (s.act) B.act[s.act[0]](s.act[1]);
    }, { s });
    await page.waitForTimeout(900);
    await page.evaluate(() => document.querySelectorAll('.view-enter').forEach((v) => v.classList.remove('view-enter')));
    await page.evaluate(() => window.scrollTo(0, 0));
    const file = path.join(OUT, s.id + '.png');
    if (s.kind === 'phone') {
      const h = await page.evaluate(() => ({ bar: document.querySelector('.mbar')?.getBoundingClientRect().height || 0, tab: document.querySelector('.tabbar')?.getBoundingClientRect().height || 0 }));
      await page.screenshot({ path: path.join(OUT, s.id + '_bar.png'), clip: { x: 0, y: 0, width: s.dev.width, height: h.bar } });
      if (h.tab) await page.screenshot({ path: path.join(OUT, s.id + '_tab.png'), clip: { x: 0, y: s.dev.height - h.tab, width: s.dev.width, height: h.tab } });
      await page.addStyleTag({ content: '.mbar,.tabbar{visibility:hidden!important}' });
      await page.screenshot({ path: file, fullPage: true });
      const dims = await page.evaluate(() => document.documentElement.scrollHeight);
      manifest[s.id] = { w: s.dev.width * s.dev.scale, h: dims * s.dev.scale, bar: Math.round(h.bar * s.dev.scale), tab: Math.round(h.tab * s.dev.scale), dev: s.dev };
    } else {
      await page.screenshot({ path: file, fullPage: s.kind === 'full' });
      const dims = await page.evaluate((full) => (full ? document.documentElement.scrollHeight : window.innerHeight), s.kind === 'full');
      manifest[s.id] = { w: s.dev.width * s.dev.scale, h: dims * s.dev.scale, dev: s.dev };
    }
    console.log('✓', s.id);
    await ctx.close();
  }
  for (const m of MAPS) {
    const ctx = await browser.newContext({ viewport: { width: 480, height: 853 }, deviceScaleFactor: 3 });
    const page = await ctx.newPage();
    await page.goto(APP + '#welcome');
    await page.evaluate((m) => {
      const B = window.B;
      if (m.view) B.map.setView('film', m.view);
      if (m.focus) { const c = B.map.centroid(B.data.building(m.focus).poly); const h = m.w * 853 / 480; m.view = { x: c[0] - m.w / 2, y: c[1] - h * 0.55, w: m.w, h }; B.map.setView('film', m.view); }
      document.body.style.margin = '0';
      document.getElementById('app').innerHTML = `<div style="height:100vh">${B.map.render({ id: 'film', mode: m.mode, static: true, legend: false, badge: false, selected: m.selected || null, height: '100vh' })}</div>`;
      document.querySelector('.map-shell').style.borderRadius = '0';
      document.querySelector('.map-shell').style.border = '0';
      return m.view;
    }, m).then((v) => { m.view = v; });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, m.id + '.png') });
    manifest[m.id] = { w: 1440, h: 2559, view: m.view };
    console.log('✓', m.id);
    await ctx.close();
  }
  // building geometry for overlays drawn in the film
  {
    const ctx = await browser.newContext(); const page = await ctx.newPage();
    await page.goto(APP + '#welcome');
    const geo = await page.evaluate(() => window.B.data.buildings.map((b) => ({ id: b.id, poly: b.poly.map((p) => [+p[0].toFixed(1), +p[1].toFixed(1)]), c: window.B.map.centroid(b.poly).map((v) => +v.toFixed(1)), type: b.type, source: b.source, ver: b.verification, key: !!b.key })));
    fs.mkdirSync(path.resolve(__dirname, '../src/data'), { recursive: true });
    fs.writeFileSync(path.resolve(__dirname, '../src/data/buildings.json'), JSON.stringify(geo));
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await browser.close();
})();
