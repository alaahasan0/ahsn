/*
 * BENA — Municipality workspace, part 2 (sample tenant, fictional data).
 * Screens: details (Building Details), verify (Verification Queue), corrections (+ correction-<id>),
 * quality (Data Quality Dashboard), matching (Building Matching Workspace), reports, users
 * (User & Permission Overview) — plus the Municipal Administrator role `muniadmin`
 * (tenant overview, tenant settings, users & roles, data sources, verification rules, audit trail, reports).
 * Registers roles `municipality` and `muniadmin`.
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon } = B;
  const ui = B.ui;
  const D = B.data;
  const M = B.mu;
  if (!M) return;
  const { R, T, hash, qf, dName, typeIcon, pct, upd, units, parcelTxt, srcLabel, rgo, crumbs, hdr, strip, views, dt, selOf, attrs, flagChips, refCell, quickView, sampleTag } = M;
  const today = '2026-11-25';
  const addDays = (d, n) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  const pickH = (h, arr) => arr[h % arr.length];
  const polyArea = (poly) => { let a = 0; poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; }); return Math.abs(a / 2) * 3.6; }; // simulated m² per map unit²
  const ADMIN = 'muniadmin';
  const isAdmin = () => B.route && B.route.role === ADMIN;
  const adminUnit = () => (isAdmin() ? L('Municipal Administration', 'الإدارة البلدية') : null);

  B.css(`
  .mu-rv-nav { display: flex; gap: 4px; }
  .mu-rv-nav .icon-btn { width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--line); }
  .mu-rv-nav .icon-btn svg { width: 15px; height: 15px; }
  .mu-sla { display: flex; flex-direction: column; gap: 3px; min-width: 72px; }
  .mu-sla span { font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .mu-sla i { display: block; height: 4px; border-radius: 4px; background: var(--line-2); overflow: hidden; }
  .mu-sla i b { display: block; height: 100%; border-radius: 4px; }
  .mu-pri { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex: none; }
  .mu-cmp { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
  .mu-cmp th { text-align: start; font-size: 11px; font-weight: 700; color: var(--text-3); padding: 0 8px 8px; text-transform: uppercase; letter-spacing: .04em; vertical-align: bottom; }
  html[dir="rtl"] .mu-cmp th { letter-spacing: 0; }
  .mu-cmp th .prov { margin-top: 4px; text-transform: none; letter-spacing: 0; }
  .mu-sec .badge, .mu-sec .btn { text-transform: none; letter-spacing: 0; }
  .mu-dt .mu-flags { flex-wrap: nowrap; }
  .mu-cmp td { padding: 8px; border-top: 1px solid var(--line-2); vertical-align: top; overflow-wrap: anywhere; }
  .mu-cmp td:first-child, .mu-cmp th:first-child { padding-inline-start: 0; color: var(--text-2); width: 26%; }
  .mu-cmp td.d { background: var(--warn-bg); color: #8A4108; font-weight: 600; }
  .mu-cmp td.m { color: var(--text-3); font-style: italic; }
  .mu-cmp td.ok { color: var(--ok); }
  .mu-cmp td .mi { display: inline-flex; vertical-align: -2px; margin-inline-end: 4px; }
  .mu-cmp td .mi svg { width: 13px; height: 13px; }
  .mu-cmp tr.hl td { background: #FFFCF4; }
  .mu-diff { display: flex; flex-direction: column; gap: 4px; }
  .mu-diff del { color: var(--bad); background: var(--bad-bg); text-decoration: line-through; padding: 1px 6px; border-radius: 5px; width: fit-content; font-size: 13px; }
  .mu-diff ins { color: var(--ok); background: var(--ok-bg); text-decoration: none; padding: 1px 6px; border-radius: 5px; width: fit-content; font-weight: 600; font-size: 13px; }
  .mu-fd { display: inline-flex; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
  .mu-fd button { height: 28px; padding: 0 10px; font-size: 12px; font-weight: 600; color: var(--text-2); display: inline-flex; align-items: center; gap: 4px; }
  .mu-fd button svg { width: 13px; height: 13px; }
  .mu-fd button + button { border-inline-start: 1px solid var(--line); }
  .mu-fd button.on.a { background: var(--ok-bg); color: var(--ok); }
  .mu-fd button.on.r { background: var(--bad-bg); color: var(--bad); }
  .mu-clist { display: flex; flex-direction: column; }
  .mu-clist button { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 10px; padding: 11px 14px; border-bottom: 1px solid var(--line-2); text-align: start; width: 100%; position: relative; }
  .mu-clist button:hover { background: var(--surface-2); }
  .mu-clist button.on { background: var(--mint-50); box-shadow: inset 3px 0 0 var(--mint); }
  html[dir="rtl"] .mu-clist button.on { box-shadow: inset -3px 0 0 var(--mint); }
  .mu-clist b { font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
  .mu-clist small { font-size: 12px; color: var(--text-3); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mu-clist .r { text-align: end; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
  .mu-conf { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .mu-conf i { display: block; width: 56px; height: 5px; border-radius: 4px; background: var(--line-2); overflow: hidden; }
  .mu-conf i b { display: block; height: 100%; border-radius: 4px; }
  .mu-cbk { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px 12px; font-size: 13px; align-items: center; }
  .mu-cbk span { color: var(--text-2); }
  .mu-cbk b { font-variant-numeric: tabular-nums; }
  .mu-cbk .tr { grid-column: 1 / -1; height: 4px; border-radius: 4px; background: var(--line-2); overflow: hidden; margin-top: -2px; }
  .mu-cbk .tr i { display: block; height: 100%; }
  .mu-ring { display: flex; align-items: center; gap: 14px; }
  .mu-ring .ring { flex: none; }
  .mu-geoleg { display: flex; gap: 14px; flex-wrap: wrap; font-size: 12px; color: var(--text-2); padding: 10px 14px; border-top: 1px solid var(--line-2); }
  .mu-geoleg span { display: inline-flex; align-items: center; gap: 6px; }
  .mu-geoleg i { width: 16px; height: 11px; border-radius: 3px; }
  .mu-alt { display: flex; flex-direction: column; gap: 6px; }
  .mu-alt label { display: grid; grid-template-columns: 18px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 9px 10px; border: 1px solid var(--line); border-radius: 10px; font-size: 13px; cursor: pointer; }
  .mu-alt label.on { border-color: var(--mint-ink); background: var(--mint-50); }
  .mu-alt input { accent-color: var(--mint-ink); width: 16px; height: 16px; }
  .mu-alt small { display: block; color: var(--text-3); font-size: 11.5px; }
  .mu-dqm { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13.5px; }
  .mu-dqm th { text-align: start; font-size: 11.5px; color: var(--text-3); font-weight: 600; padding: 9px 12px; background: var(--surface-2); border-bottom: 1px solid var(--line); white-space: nowrap; }
  .mu-dqm td { padding: 6px 12px; border-bottom: 1px solid var(--line-2); }
  .mu-dqm tr:last-child td { border-bottom: 0; }
  .mu-dqm tbody tr { cursor: pointer; }
  .mu-dqm tbody tr:hover td:first-child b { color: var(--mint-ink); }
  .mu-dqm tbody tr.on { background: var(--mint-50); }
  .mu-dqm .c { text-align: center; }
  .mu-dqm .cell { display: inline-flex; align-items: center; justify-content: center; min-width: 58px; height: 26px; border-radius: 6px; font-weight: 600; font-variant-numeric: tabular-nums; font-size: 12.5px; }
  .mu-dqm td:first-child b { font-weight: 600; transition: color .15s; }
  .mu-issues { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .mu-issue { display: grid; grid-template-columns: 34px minmax(0, 1fr) auto; gap: 4px 12px; align-items: center; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--line); background: #fff; text-align: start; width: 100%; transition: border-color .15s; }
  .mu-issue:hover { border-color: #C5D3CD; }
  .mu-issue.on { border-color: var(--mint-ink); background: var(--mint-50); }
  .mu-issue .li-icon { width: 34px; height: 34px; border-radius: 10px; grid-row: span 2; }
  .mu-issue .li-icon svg { width: 16px; height: 16px; }
  .mu-issue b { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mu-issue .n { font-family: var(--font-display); font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; grid-row: span 2; }
  .mu-issue small { font-size: 11.5px; color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  @media (max-width: 1180px) { .mu-issues { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 640px) { .mu-issues { grid-template-columns: minmax(0, 1fr); } .mu-dqm-wrap { overflow-x: auto; } }
  .mu-rpt { display: flex; flex-direction: column; }
  .mu-rpt button { display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--line-2); text-align: start; width: 100%; }
  .mu-rpt button:hover { background: var(--surface-2); }
  .mu-rpt button.on { background: var(--mint-50); box-shadow: inset 3px 0 0 var(--mint); }
  html[dir="rtl"] .mu-rpt button.on { box-shadow: inset -3px 0 0 var(--mint); }
  .mu-rpt .li-icon { width: 32px; height: 32px; border-radius: 9px; }
  .mu-rpt .li-icon svg { width: 15px; height: 15px; }
  .mu-rpt b { font-size: 13.5px; font-weight: 600; display: block; }
  .mu-rpt small { font-size: 11.5px; color: var(--text-3); display: block; }
  .mu-rpt .grp { font-size: 11px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: .06em; padding: 12px 14px 6px; background: var(--surface-2); border-bottom: 1px solid var(--line-2); }
  html[dir="rtl"] .mu-rpt .grp { letter-spacing: 0; }
  .mu-paper-wrap { background: #E9EEEC; border-radius: 12px; padding: 22px; display: flex; justify-content: center; }
  .mu-paper { background: #fff; width: 100%; max-width: 680px; aspect-ratio: 1 / 1.3; border-radius: 4px; box-shadow: 0 2px 10px rgba(20,43,59,.1); padding: 34px 38px; position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 16px; font-size: 12px; }
  .mu-paper::after { content: attr(data-wm); position: absolute; inset: 0; display: grid; place-items: center; font-family: var(--font-display); font-size: 92px; font-weight: 800; color: rgba(20,43,59,.035); transform: rotate(-24deg); pointer-events: none; letter-spacing: .1em; }
  .mu-paper h2 { font-size: 19px; }
  .mu-paper .ph { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding-bottom: 12px; border-bottom: 2px solid var(--navy); }
  .mu-paper .pk { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
  .mu-paper .pk div { border: 1px solid var(--line); border-radius: 6px; padding: 8px 10px; }
  .mu-paper .pk span { display: block; font-size: 10.5px; color: var(--text-3); }
  .mu-paper .pk b { font-family: var(--font-display); font-size: 16px; font-variant-numeric: tabular-nums; }
  .mu-paper table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  .mu-paper th { text-align: start; font-size: 10.5px; color: var(--text-3); border-bottom: 1px solid var(--line); padding: 5px 6px; font-weight: 600; }
  .mu-paper td { padding: 5px 6px; border-bottom: 1px solid var(--line-2); font-variant-numeric: tabular-nums; }
  .mu-paper .pf { margin-top: auto; font-size: 10px; color: var(--text-3); display: flex; justify-content: space-between; gap: 12px; border-top: 1px solid var(--line-2); padding-top: 8px; }
  .mu-paper .bars { --bars-h: 120px; }
  @media (max-width: 640px) { .mu-paper-wrap { padding: 10px; } .mu-paper { aspect-ratio: auto; padding: 18px; } .mu-paper .pk { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  .mu-pm { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
  .mu-pm th { font-size: 11px; color: var(--text-3); font-weight: 600; padding: 10px 8px; background: var(--surface-2); border-bottom: 1px solid var(--line); text-align: center; vertical-align: bottom; line-height: 1.3; position: sticky; top: 0; }
  .mu-pm th:first-child { text-align: start; padding-inline-start: 16px; }
  .mu-pm td { padding: 8px; border-bottom: 1px solid var(--line-2); text-align: center; }
  .mu-pm td:first-child { text-align: start; padding-inline-start: 16px; }
  .mu-pm td:first-child b { display: block; font-weight: 600; font-size: 13px; }
  .mu-pm td:first-child small { display: block; font-size: 11.5px; color: var(--text-3); }
  .mu-pm tr:last-child td { border-bottom: 0; }
  .mu-pm .pf, .mu-pm .pp, .mu-pm .pn { display: inline-grid; place-items: center; width: 24px; height: 24px; border-radius: 7px; }
  .mu-pm .pf { background: var(--ok-bg); color: var(--ok); }
  .mu-pm .pp { background: var(--warn-bg); color: var(--warn); }
  .mu-pm .pn { color: #C5CFCB; }
  .mu-pm svg { width: 13px; height: 13px; }
  .mu-pm th.on { background: var(--mint-50); color: var(--mint-ink); }
  .mu-pm td.on { background: #F6FCF9; }
  .mu-ws { display: inline-flex; gap: 4px; flex-wrap: wrap; }
  .mu-ws span { font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 5px; background: var(--line-2); color: var(--text-2); white-space: nowrap; }
  .mu-rule { display: grid; grid-template-columns: 36px minmax(0, 1fr) auto; gap: 14px; align-items: center; padding: 13px 0; border-bottom: 1px solid var(--line-2); }
  .mu-rule:last-child { border-bottom: 0; }
  .mu-rule .li-icon { width: 36px; height: 36px; border-radius: 10px; }
  .mu-rule .li-icon svg { width: 16px; height: 16px; }
  .mu-rule b { display: block; font-size: 13.5px; font-weight: 600; }
  .mu-rule small { display: block; font-size: 12.5px; color: var(--text-2); margin-top: 2px; }
  .mu-rule .ctl { display: flex; align-items: center; gap: 10px; }
  .mu-rule .ctl .select, .mu-rule .ctl .input { height: 34px; font-size: 13px; width: auto; min-width: 96px; border-radius: 9px; }
  @media (max-width: 640px) { .mu-rule { grid-template-columns: 36px minmax(0, 1fr); } .mu-rule .ctl { grid-column: 2; } }
  .mu-json { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 12px; background: var(--navy); color: #D7E3EA; border-radius: 10px; padding: 12px 14px; white-space: pre-wrap; overflow-wrap: anywhere; direction: ltr; text-align: left; line-height: 1.6; }
  .mu-json .k { color: var(--mint); }
  .mu-json .o { color: #F4A9A0; text-decoration: line-through; }
  .mu-json .n { color: #9FE5CA; }
  .mu-picker { position: relative; width: 320px; max-width: 100%; }
  .mu-picker .input { height: 36px; font-size: 13.5px; border-radius: 10px; }
  .mu-picker .input-icon svg { width: 16px; height: 16px; }
  .mu-pick-res { position: absolute; top: 40px; inset-inline: 0; background: #fff; border: 1px solid var(--line); border-radius: 12px; box-shadow: var(--shadow-2); z-index: 20; padding: 6px; max-height: 320px; overflow: auto; }
  .mu-pick-res button { display: flex; gap: 10px; align-items: center; padding: 7px 8px; border-radius: 8px; width: 100%; text-align: start; }
  .mu-pick-res button:hover { background: var(--hover); }
  .mu-pick-res b { font-size: 13px; display: block; }
  .mu-pick-res small { font-size: 11.5px; color: var(--text-3); display: block; }
  .mu-prov-t td:nth-child(1), .mu-prov-t td:nth-child(3), .mu-prov-t td:nth-child(5) { white-space: nowrap; }
  .mu-prov-t td, .mu-prov-t th { padding: 9px 14px; }
  .mu-wsrow { display: grid; grid-template-columns: 36px minmax(0, 1fr) auto auto; gap: 14px; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--line-2); }
  .mu-wsrow:last-child { border-bottom: 0; }
  .mu-wsrow b { display: block; font-size: 14px; }
  .mu-wsrow small { display: block; font-size: 12px; color: var(--text-3); }
  @media (max-width: 640px) { .mu-wsrow { grid-template-columns: 36px minmax(0, 1fr); } .mu-wsrow > :nth-child(n+3) { grid-column: 2; } }
  `);

  /* =================================================================
     Shared data — verification queue
     ================================================================= */
  const REVIEWERS = ['p_maha', 'p_mu_odai', 'p_mu_lubna', 'p_mu_rasha'];
  const SLA = 14;
  const VQ = D.buildings.filter((b) => b.verification !== 'verified' && !b.key)
    .sort((a, b) => hash(a.id + 'q') - hash(b.id + 'q')).slice(0, 48)
    .map((b, i) => {
      const h = hash(b.id + 'vq');
      const f = qf(b);
      const age = 1 + (h % 27);
      const flags = [];
      if (f.dup) flags.push('dup');
      if (f.geom) flags.push('geom');
      if (f.noParcel) flags.push('parcel');
      if (f.noUnits) flags.push('units');
      if (b.district === 'oldcity' || b.type === 'heritage') flags.push('heritage');
      if (h % 5 === 0) flags.push('permit');
      if (h % 11 === 2 && !flags.includes('dup')) flags.push('overlap');
      const risk = flags.filter((x) => x !== 'heritage').length >= 2 ? 'high' : flags.length ? 'medium' : 'low';
      return {
        id: `VQ-${String(5210 + i * 3 + (h % 3))}`, b: b.id, age, date: addDays(today, -age),
        src: b.source === 'independent' ? pickH(h, ['app', 'app', 'committee', 'manager', 'import']) : pickH(h, ['field', 'import']),
        flags, risk, status: h % 13 === 0 ? 'needsInfo' : 'toReview', who: pickH(h >>> 3, REVIEWERS),
        ref: { floors: b.floors + (h % 7 === 0 ? 1 : 0), units: f.noUnits ? Math.max(1, b.units - 1 - (h % 2)) : b.units, parcel: f.noParcel ? null : b.parcel, area: Math.round(polyArea(b.poly) * (1 + ((h % 9) - 4) / 100)), year: b.year + (h % 6 === 0 ? 2 : 0), type: h % 17 === 0 ? 'mixed' : b.type },
      };
    });
  const VQ_OPEN = ['toReview', 'needsInfo', 'escalated'];
  const vqOpen = () => VQ.filter((x) => VQ_OPEN.includes(x.status));
  const FLAG = {
    dup: [T('Possible duplicate', 'تكرار محتمل'), 'v', 'layers'],
    geom: [T('Geometry', 'المسقط'), 'b', 'alert'],
    parcel: [T('No parcel', 'بلا قطعة'), '', 'grid'],
    units: [T('Unit count', 'عدد الوحدات'), '', 'hash'],
    heritage: [T('Heritage zone', 'منطقة تراثية'), 'n', 'award'],
    permit: [T('Permit not linked', 'رخصة غير مرتبطة'), '', 'doc'],
    overlap: [T('Overlap 63%', 'تداخل 63%'), 'b', 'layers'],
  };
  const flagsHtml = (fl, max = 3) => (fl.length ? `<span class="mu-flags">${fl.slice(0, max).map((k) => `<span class="mu-fl ${FLAG[k][1]}">${icon(FLAG[k][2])}${tx(FLAG[k][0])}</span>`).join('')}${fl.length > max ? `<span class="mu-fl n">+${fl.length - max}</span>` : ''}</span>` : `<span class="faint">—</span>`);
  const slaCell = (x) => {
    const p = Math.min(100, (x.age / SLA) * 100);
    const c = x.age > SLA ? 'var(--bad)' : x.age > SLA - 3 ? 'var(--warn)' : 'var(--mint-ink)';
    return `<div class="mu-sla"><span style="color:${x.age > SLA ? 'var(--bad)' : 'inherit'}">${L(`${x.age} d`, `${x.age} يوم`)}${x.age > SLA ? ` · ${L('over', 'متجاوز')}` : ''}</span><i><b style="width:${p}%;background:${c}"></b></i></div>`;
  };
  const riskDot = (r) => `<span class="mu-pri" style="background:${r === 'high' ? 'var(--bad)' : r === 'medium' ? '#E9A23B' : '#B8C6C0'}" title="${esc(ui.statusLabel(r))}"></span>`;
  const prio = (x) => (x.age / SLA) * 50 + ({ high: 40, medium: 20, low: 0 }[x.risk]) + (x.status === 'escalated' ? 30 : 0);

  /* =================================================================
     Shared data — correction requests (field-level)
     ================================================================= */
  const K = (id, f) => D.building(id) || D.buildings.find(f) || D.buildings[0];
  const b391 = K('BN-RAM-00391', () => true), b142 = K('BN-RAM-00142', () => true), b087 = K('BN-RAM-00087', () => true), b311 = K('BN-RAM-00311', () => true), b415 = K('BN-RAM-00415', () => true);
  const bC3 = D.buildings.find((b) => b.district === 'irsal' && b.source === 'gis' && b.type === 'commercial' && !b.key) || D.buildings[3];
  const bC6 = D.buildings.find((b) => b.source === 'independent' && b.verification === 'verified' && b.district === 'tireh' && !b.key) || D.buildings[6];
  const bC8 = D.buildings.find((b) => b.source === 'gis' && b.type === 'residential' && b.district === 'maahid' && !b.key) || D.buildings[8];
  const FL = { units: T('Units', 'الوحدات'), floors: T('Floors', 'الطوابق'), type: T('Building type', 'نوع المبنى'), parcel: T('Parcel', 'القطعة'), name: T('Address / name', 'العنوان / الاسم'), year: T('Year built', 'سنة البناء'), parking: T('Parking spaces', 'مواقف السيارات'), shops: T('Ground-floor shops', 'محلات الطابق الأرضي') };
  const fmtVal = (f, v) => (v == null ? '—' : f === 'type' ? D.typeLabel(v) : f === 'parcel' ? parcelTxt(v) : f === 'name' ? tx(v) : B.num(v));
  const COR = [
    { id: 'CR-2026-0236', b: b391.id, by: 'p_majd', channel: 'app', date: '2026-11-23', status: 'underReview', reason: T('Ground-floor shop G02 was split into two shops in 2024.', 'تم تقسيم المحل G02 في الطابق الأرضي إلى محلين عام 2024.'),
      changes: [{ f: 'units', cur: b391.units, prop: b391.units + 1, ev: T('Alteration permit RM-AP-2024-0177 (sample)', 'رخصة تعديل RM-AP-2024-0177 (نموذج)') }, { f: 'shops', cur: 2, prop: 3, ev: T('As-built drawings', 'مخططات التنفيذ') }],
      docs: [['permit', 'PDF', '1.2 MB'], ['asbuilt', 'PDF', '5.2 MB'], ['photos', 'JPG ×3', '4.0 MB']] },
    { id: 'CR-2026-0235', b: bC3.id, by: 'p_karim', channel: 'app', date: '2026-11-24', status: 'new', reason: T('Upper floors converted from retail to offices.', 'تحويل الطوابق العليا من محلات إلى مكاتب.'),
      changes: [{ f: 'type', cur: bC3.type, prop: 'office', ev: T('Change-of-use permit — not yet linked', 'رخصة تغيير الاستخدام — غير مرتبطة بعد') }],
      docs: [['permit', 'PDF', '0.9 MB']] },
    { id: 'CR-2026-0233', b: b087.id, by: 'p_samer', channel: 'committee', date: '2026-11-19', status: 'needsInfo', reason: T('A rooftop floor with two apartments was added in 2025.', 'أضيف طابق علوي بشقتين عام 2025.'),
      changes: [{ f: 'floors', cur: b087.floors, prop: b087.floors + 1, ev: T('Committee letter', 'كتاب اللجنة') }, { f: 'units', cur: b087.units, prop: b087.units + 2, ev: T('Committee letter', 'كتاب اللجنة') }, { f: 'parking', cur: b087.parking || 28, prop: (b087.parking || 28) + 2, ev: T('Site photos', 'صور الموقع') }],
      docs: [['letter', 'PDF', '0.4 MB'], ['photos', 'JPG ×5', '6.6 MB']], note: T('Waiting for the building permit for the added floor.', 'بانتظار رخصة البناء للطابق المضاف.') },
    { id: 'CR-2026-0232', b: b311.id, by: 'p_rania', channel: 'manager', date: '2026-11-17', status: 'underReview', reason: T('Entrance moved to the side street; parcel was re-surveyed.', 'نُقل المدخل إلى الشارع الجانبي؛ وأعيد مسح القطعة.'),
      changes: [{ f: 'name', cur: b311.name, prop: T('5 Al-Irsal St.', '5 شارع الإرسال'), ev: T('Addressing notice (sample)', 'إشعار عنونة (نموذج)') }, { f: 'parcel', cur: b311.parcel, prop: { basin: (b311.parcel || {}).basin || 2, parcel: ((b311.parcel || {}).parcel || 31) + 1 }, ev: T('Survey plan', 'مخطط المساحة') }],
      docs: [['plan', 'DWG', '3.1 MB'], ['poa', 'PDF', '0.7 MB']] },
    { id: 'CR-2026-0231', b: bC6.id, by: 'p_ahmad', channel: 'app', date: '2026-11-15', status: 'new', reason: T('Year built and floors were entered incorrectly at registration.', 'أُدخلت سنة البناء وعدد الطوابق بشكل خاطئ عند التسجيل.'),
      changes: [{ f: 'year', cur: bC6.year, prop: bC6.year + 5, ev: T('Building permit', 'رخصة البناء') }, { f: 'floors', cur: bC6.floors, prop: bC6.floors + 1, ev: T('Site photos', 'صور الموقع') }],
      docs: [['permit', 'PDF', '1.0 MB'], ['photos', 'JPG ×2', '2.4 MB']] },
    { id: 'CR-2026-0229', b: bC8.id, by: 'p_mu_khalil', channel: 'field', date: '2026-11-11', status: 'underReview', reason: T('Field survey found shops on the ground floor.', 'رصد المسح الميداني محلات في الطابق الأرضي.'),
      changes: [{ f: 'type', cur: bC8.type, prop: 'mixed', ev: T('Field survey record', 'سجل المسح الميداني') }, { f: 'units', cur: bC8.units, prop: bC8.units + 2, ev: T('Field survey record', 'سجل المسح الميداني') }],
      docs: [['photos', 'JPG ×6', '7.9 MB'], ['plan', 'GeoJSON', '0.1 MB']] },
    { id: 'CR-2026-0234', b: b142.id, by: 'p_samer', channel: 'committee', date: '2026-11-12', decided: '2026-11-14', status: 'applied', reason: T('Four extra spaces added in the basement after the 2025 refit.', 'أضيفت أربعة مواقف في الطابق السفلي بعد تأهيل 2025.'),
      changes: [{ f: 'parking', cur: (b142.parking || 60), prop: (b142.parking || 60) + 4, ev: T('As-built drawings', 'مخططات التنفيذ'), d: 'accept' }],
      docs: [['letter', 'PDF', '0.4 MB'], ['asbuilt', 'PDF', '2.9 MB']] },
    { id: 'CR-2026-0230', b: b415.id, by: 'p_yara', channel: 'app', date: '2026-11-06', decided: '2026-11-09', status: 'rejected', reason: T('Two storage rooms listed as units.', 'تم إدراج غرفتي تخزين كوحدات.'),
      changes: [{ f: 'units', cur: b415.units, prop: b415.units + 2, ev: T('Owner statement', 'إفادة المالك'), d: 'reject' }],
      docs: [['photos', 'JPG ×2', '1.8 MB']], note: T('Storage rooms are not separate units under the building permit.', 'غرف التخزين ليست وحدات مستقلة بموجب رخصة البناء.') },
  ];
  const COR_OPEN = ['new', 'underReview', 'needsInfo'];
  const corOf = (id) => COR.find((c) => c.id === id);
  const DOCN = { permit: T('Building permit', 'رخصة البناء'), asbuilt: T('As-built drawings', 'مخططات التنفيذ'), photos: T('Site photos', 'صور الموقع'), letter: T('Committee letter', 'كتاب اللجنة'), plan: T('Survey plan', 'مخطط المساحة'), poa: T('Power of attorney', 'وكالة'), deed: T('Ownership deed (sample)', 'سند الملكية (نموذج)') };

  /* =================================================================
     Shared data — matching candidates
     ================================================================= */
  const MC = D.buildings.filter((b) => b.source === 'independent' && !b.key)
    .sort((a, b) => hash(a.id + 'm') - hash(b.id + 'm')).slice(0, 26)
    .map((b, i) => {
      const h = hash(b.id + 'mc');
      const overlap = 42 + (h % 57);
      const parcelSame = h % 4 !== 0;
      const addrSame = h % 3 !== 1;
      const du = h % 5 === 0 ? 2 : h % 3 === 0 ? 1 : 0;
      const df = h % 7 === 0 ? 1 : 0;
      const score = Math.round(overlap * 0.4 + (parcelSame ? 25 : 6) + (addrSame ? 15 : 5) + (du === 0 ? 10 : du === 1 ? 6 : 2) + (df ? 4 : 10));
      const ref = {
        gis: `RM-GIS-${51000 + (h % 8000)}`, ref: `RM/${b.district.slice(0, 2).toUpperCase()}/${2004 + (h % 20)}/${String(1000 + (h % 8999)).slice(0, 4)}`,
        type: h % 9 === 0 ? 'mixed' : b.type, floors: b.floors + df, units: b.units + du,
        parcel: parcelSame ? b.parcel : { basin: b.parcel.basin, parcel: b.parcel.parcel + 3 + (h % 9) },
        addr: addrSame ? b.name : T(b.name.en.replace(/^\d+/, String(1 + (h % 120))), b.name.ar.replace(/^\d+/, String(1 + (h % 120)))),
        dx: ((h % 7) - 3) * 0.9, dy: (((h >>> 3) % 7) - 3) * 0.8, s: 0.86 + (overlap / 100) * 0.16,
      };
      const alts = [1, 2].map((k) => ({ gis: `RM-GIS-${51000 + ((h >>> k) % 8000)}`, score: Math.max(18, score - 18 - k * 11 - (h % 9)), overlap: Math.max(8, overlap - 30 - k * 9), note: k === 1 ? T('Adjacent footprint, same street', 'مسقط مجاور، الشارع نفسه') : T('Same parcel, different footprint', 'القطعة نفسها، مسقط مختلف') }));
      return { id: `MC-${String(3100 + i * 7)}`, b: b.id, score: Math.min(98, score), overlap, parcelSame, addrSame, ref, alts, status: 'toReview', pick: ref.gis };
    });
  const mcOf = (id) => MC.find((m) => m.id === id);
  const band = (s) => (s >= 85 ? 'high' : s >= 65 ? 'medium' : 'low');
  const confColor = (s) => (s >= 85 ? 'var(--mint-ink)' : s >= 65 ? '#E9A23B' : 'var(--bad)');
  const confBar = (s) => `<span class="mu-conf"><i><b style="width:${s}%;background:${confColor(s)}"></b></i>${s}%</span>`;

  /* ---------------- quality metrics ---------------- */
  const ISSUES = {
    noParcel: { t: T('Missing parcel', 'قطعة مفقودة'), d: T('No basin/parcel reference', 'لا يوجد مرجع حوض/قطعة'), icon: 'grid', tone: 'warn', f: (b) => qf(b).noParcel },
    noUnits: { t: T('Unit-count mismatch', 'عدم تطابق عدد الوحدات'), d: T('Submitted vs reference differ', 'المقدّم يختلف عن المرجع'), icon: 'hash', tone: 'warn', f: (b) => qf(b).noUnits },
    dup: { t: T('Duplicate geometry', 'مساقط مكررة'), d: T('Overlapping footprints', 'مساقط متداخلة'), icon: 'layers', tone: 'violet', f: (b) => qf(b).dup },
    geom: { t: T('Invalid geometry', 'مسقط غير سليم'), d: T('Self-intersection / slivers', 'تقاطع ذاتي / شظايا'), icon: 'alert', tone: 'bad', f: (b) => qf(b).geom },
    outdated: { t: T('Outdated record', 'سجل قديم'), d: T('Not reviewed for 9+ months', 'لم يُراجع منذ 9 أشهر أو أكثر'), icon: 'clock', tone: '', f: (b) => qf(b).outdated },
    unlinked: { t: T('Verified, not linked', 'موثّق وغير مرتبط'), d: T('No sample municipal ref.', 'بلا مرجع بلدي نموذجي'), icon: 'link', tone: 'info', f: (b) => b.source === 'independent' && b.verification === 'verified' },
  };
  const dqDistrict = (id) => {
    const bs = D.buildings.filter((b) => id === 'all' || b.district === id);
    const n = bs.length || 1;
    let comp = 0, acc = 0, cons = 0, time = 0, issues = 0;
    bs.forEach((b) => { const f = qf(b); if (!f.noParcel && !f.noUnits && (b.ref || b.verification === 'verified')) comp++; if (!f.geom && !f.noUnits) acc++; if (!f.dup && !(b.source === 'independent' && b.verification === 'verified')) cons++; if (!f.outdated) time++; issues += (f.noParcel ? 1 : 0) + (f.noUnits ? 1 : 0) + (f.dup ? 1 : 0) + (f.geom ? 1 : 0) + (f.outdated ? 1 : 0); });
    const r = { n: bs.length, comp: pct(comp, n), acc: pct(acc, n), cons: pct(cons, n), time: pct(time, n), issues };
    r.score = Math.round(r.comp * 0.3 + r.acc * 0.3 + r.cons * 0.2 + r.time * 0.2);
    return r;
  };

  M.queueStats = () => {
    const o = vqOpen();
    const all = dqDistrict('all');
    return { vOpen: o.length, vOver: o.filter((x) => x.age > SLA).length, vHigh: o.filter((x) => x.risk === 'high').length, cOpen: COR.filter((c) => COR_OPEN.includes(c.status)).length, cFields: B.sum(COR.filter((c) => COR_OPEN.includes(c.status)), (c) => c.changes.length), mOpen: MC.filter((m) => m.status === 'toReview').length, mHigh: MC.filter((m) => m.status === 'toReview' && m.score >= 85).length, score: all.score };
  };

  /* =================================================================
     4 · Building Details (in-app dossier; links to the shared profile)
     ================================================================= */
  function details(id) {
    const bid = id || B.get('mu:last', 'BN-RAM-00142');
    const b = D.building(bid) || D.keyBuildings[0];
    B.vs['mu:last'] = b.id;
    B.navActive('details');
    crumbs([[L('Building Details', 'تفاصيل المبنى'), 'details'], [b.id]]);
    const f = qf(b);
    const q = B.get('bd:q', '');
    const res = q ? D.buildings.filter((x) => B.match(q, x.id, x.ref, x.gis, x.name, x.address)).slice(0, 8) : [];
    const picker = `<div class="mu-picker">${ui.search('bd:q', L('Open another building — ID, ref. or street', 'افتح مبنى آخر — الرقم أو المرجع أو الشارع'))}
      ${q ? `<div class="mu-pick-res">${res.length ? res.map((x) => `<button data-act="muBdPick" data-arg="${x.id}"><span class="mu-ti ${x.source === 'independent' ? 'ind' : ''}">${icon(typeIcon(x.type))}</span><span style="min-width:0"><b>${esc(tx(x.name))}</b><small><bdi>${x.id}</bdi> · ${dName(x.district)}</small></span></button>`).join('') : `<p class="xs faint" style="padding:8px">${L('No buildings found', 'لم يتم العثور على مبانٍ')}</p>`}</div>` : ''}</div>`;
    const provRows = [
      [L('BENA Building ID', 'رقم بينا للمبنى'), ui.idMono(b.id), L('BENA registry', 'سجل بينا'), 'official', B.date(b.year && b.source === 'gis' ? '2026-01-14' : upd(b))],
      [L('Sample municipal ref.', 'المرجع البلدي النموذجي'), b.ref ? ui.idMono(b.ref) : '—', b.ref ? L('Municipal GIS (sample)', 'نظم المعلومات البلدية (نموذج)') : L('Not linked', 'غير مرتبط'), b.ref ? 'official' : 'pending', b.ref ? B.date('2026-01-14') : '—'],
      [L('Building type', 'نوع المبنى'), D.typeLabel(b.type), srcLabel(b.source), b.source === 'gis' ? 'official' : 'submitted', B.date(upd(b))],
      [L('Floors', 'الطوابق'), B.num(b.floors), srcLabel(b.source), b.source === 'gis' ? 'official' : 'submitted', B.date(upd(b))],
      [L('Units', 'الوحدات'), B.num(b.units), f.noUnits ? L('Owner submission', 'إفادة المالك') : srcLabel(b.source), f.noUnits ? 'pending' : b.source === 'gis' ? 'official' : 'submitted', B.date(upd(b))],
      [L('Parcel', 'القطعة'), f.noParcel ? '—' : parcelTxt(b.parcel), f.noParcel ? L('Missing', 'مفقود') : L('Cadastre layer (sample)', 'طبقة المساحة (نموذج)'), f.noParcel ? 'pending' : 'official', B.date('2026-11-25')],
      [L('Footprint', 'المسقط'), `${B.num(polyArea(b.poly))} m²`, L('Footprint layer (sample)', 'طبقة المساقط (نموذج)'), f.geom ? 'pending' : 'official', B.date('2026-11-25')],
      [L('Verification', 'التحقق'), ui.status(b.verification), L('GIS & Registry Unit', 'وحدة نظم المعلومات والسجل'), b.verification === 'verified' ? 'official' : 'pending', B.date(upd(b))],
    ];
    const provTable = `<div class="table-wrap"><table class="table mu-prov-t"><thead><tr><th>${L('Attribute', 'السمة')}</th><th>${L('Value', 'القيمة')}</th><th>${L('Source', 'المصدر')}</th><th>${L('Provenance', 'حالة المصدر')}</th><th>${L('Last changed', 'آخر تغيير')}</th></tr></thead><tbody>${provRows.map(([a, v, s, p, d]) => `<tr><td class="muted">${a}</td><td><b>${v}</b></td><td class="small">${s}</td><td>${ui.prov(p)}</td><td class="small nowrap">${d}</td></tr>`).join('')}</tbody></table></div>`;
    const reqs = M.REQ.filter((r) => r.building === b.id || r.other === b.id).map((r) => ui.li({ icon: M.RT[r.type].icon, tone: M.RT[r.type].tone, title: tx(r.title), sub: `${ui.idMono(r.id)} · ${B.dateShort(r.date)}`, end: ui.status(r.status), go: rgo(`request-${r.id}`) }))
      .concat(COR.filter((c) => c.b === b.id).map((c) => ui.li({ icon: 'edit', tone: 'info', title: L(`Correction · ${c.changes.map((x) => tx(FL[x.f])).join(', ')}`, `تصحيح · ${c.changes.map((x) => tx(FL[x.f])).join('، ')}`), sub: `${ui.idMono(c.id)} · ${B.dateShort(c.date)}`, end: ui.status(c.status), go: rgo(`correction-${c.id}`) })))
      .concat(VQ.filter((v) => v.b === b.id).map((v) => ui.li({ icon: 'shieldCheck', tone: 'warn', title: L('Verification review', 'مراجعة التحقق'), sub: `${ui.idMono(v.id)} · ${L(`${v.age} days in queue`, `${v.age} يوماً في القائمة`)}`, end: ui.status(v.status), act: 'muVqOpen', arg: v.id })))
      .concat(MC.filter((m) => m.b === b.id).map((m) => ui.li({ icon: 'link', tone: 'navy', title: L(`Match candidate · ${m.ref.gis}`, `مرشح مطابقة · ${m.ref.gis}`), sub: `${ui.idMono(m.id)} · ${L('confidence', 'الثقة')} ${m.score}%`, end: ui.status(m.status), act: 'muMcOpen', arg: m.id })));
    const hist = [
      { state: 'done', icon: 'plus', title: b.source === 'gis' ? L('Imported from the sample municipal layer', 'استُورد من الطبقة البلدية النموذجية') : L('Registered independently in BENA', 'سُجّل بشكل مستقل في بينا'), meta: B.date(b.source === 'gis' ? '2026-01-14' : addDays(upd(b), -40)) },
      b.ref && b.source === 'gis' ? { state: 'done', icon: 'link', title: L(`Linked to ${b.ref}`, `رُبط بالمرجع ${b.ref}`), meta: B.date('2026-01-14') } : null,
      { state: 'done', icon: 'edit', title: L('Attributes updated', 'تم تحديث السمات'), meta: `${B.date(upd(b))} · ${esc(D.pname('p_mu_rasha'))}` },
      b.verification === 'verified' ? { state: 'done', icon: 'shieldCheck', title: L('Verified by the GIS & Registry Unit', 'وُثّق من وحدة نظم المعلومات والسجل'), meta: B.date(upd(b)) } : { state: 'current', icon: 'clock', title: L('Awaiting verification', 'بانتظار التحقق'), meta: L('In the verification queue', 'في قائمة التحقق') },
    ].filter(Boolean);
    return `${hdr({ title: esc(tx(b.name)), sub: `${esc(tx(b.address))}`, actions: picker,
      extra: `<div class="row-sm wrap" style="margin-top:10px">${ui.idMono(b.id)}${ui.status(b.verification)}${ui.sourceBadge(b.source)}${b.ref ? ui.prov('official') : ui.prov('submitted')}${f.any ? ui.badge(L('Quality flags', 'مؤشرات جودة'), 'warn', 'alert') : ''}</div>` })}
      <div class="row-sm wrap" style="margin-bottom:16px">
        ${ui.btn(L('Open Building Identity workspace', 'فتح مساحة هوية المبنى'), { kind: 'primary', icon: 'fingerprint', go: rgo(`building-${b.id}`) })}
        ${ui.btn(L('Show on map', 'عرض على الخريطة'), { icon: 'map', act: 'muShowOnMap', arg: b.id })}
        ${b.verification !== 'verified' ? ui.btn(L('Verify', 'توثيق'), { kind: 'dark', icon: 'shieldCheck', act: 'muVerify', arg: b.id }) : ''}
        ${ui.btn(L('Request correction', 'طلب تصحيح'), { icon: 'edit', act: 'muCorrect', arg: b.id })}
        ${b.source === 'independent' ? ui.btn(L('Link reference', 'ربط بمرجع'), { icon: 'link', act: 'muLink', arg: b.id }) : ''}
      </div>
      <div class="grid g-main">
        <div class="stack">
          ${ui.card({ title: L('Attribute provenance', 'مصدر السمات'), sub: L('Where each value comes from — official (source-linked), submitted, or pending verification', 'مصدر كل قيمة — رسمي (مرتبط بالمصدر) أو مُقدَّم أو بانتظار التحقق'), cls: 'pad-0', headExtra: '', body: `<div style="padding:0 0 4px">${provTable}</div>` }).replace('<div class="card-head">', '<div class="card-head" style="padding:18px 20px 0">')}
          ${ui.card({ title: L('Linked requests & reviews', 'الطلبات والمراجعات المرتبطة'), sub: L(`${reqs.length} item(s)`, `${reqs.length} عنصر`), body: reqs.length ? ui.list(reqs) : `<p class="small faint">${L('No requests, corrections or reviews for this building.', 'لا توجد طلبات أو تصحيحات أو مراجعات لهذا المبنى.')}</p>` })}
          ${ui.card({ title: L('Record history', 'سجل التغييرات'), body: ui.timeline(hist) })}
        </div>
        <div class="stack">
          ${ui.card({ cls: 'pad-0', body: B.map.render({ id: 'bd' + b.id.replace(/\D/g, ''), static: true, mode: 'verification', focus: b.id, focusW: 200, selected: b.id, height: '230px', legend: false, layers: { parcels: true }, badge: L('Location · sample area', 'الموقع · منطقة نموذجية') }) })}
          ${ui.card({ title: L('Identity & quality', 'الهوية والجودة'), body: `<div class="mu-qv-id"><div class="grow"><div class="l">${L('BENA Building ID', 'رقم بينا للمبنى')}</div><div class="v">${esc(b.id)}</div></div><button class="icon-btn" style="width:30px;height:30px" data-act="muCopy" data-arg="${esc(b.id)}" aria-label="${esc(L('Copy ID', 'نسخ الرقم'))}">${icon('clipboard')}</button></div>
            ${attrs([[L('Sample municipal ref.', 'المرجع البلدي النموذجي'), b.ref ? ui.idMono(b.ref) : `<span class="faint">${L('Not linked', 'غير مرتبط')}</span>`, b.ref ? 'official' : 'submitted'], [L('District', 'الحي'), dName(b.district)], [L('Year built', 'سنة البناء'), b.year ? String(b.year) : null], [L('Quality flags', 'مؤشرات الجودة'), flagChips(b, 4)]])}
            <div class="mu-own">${icon('info')}<span>${L('The BENA Building ID is a digital reference identity — not proof of legal ownership.', 'رقم بينا للمبنى هوية رقمية مرجعية — وليس إثباتاً للملكية القانونية.')}</span></div>` })}
          ${ui.card({ title: L('Documents', 'المستندات'), sub: L('Sample files', 'ملفات نموذجية'), body: ui.list([ui.doc({ name: DOCN.permit, type: 'PDF', size: '1.1 MB', date: '2026-01-14' }), ui.doc({ name: DOCN.plan, type: 'DWG', size: '2.4 MB', date: '2026-01-14', icon: 'map' }), ui.doc({ name: DOCN.photos, type: 'JPG ×3', size: '3.9 MB', date: upd(b), icon: 'image' })]) })}
        </div>
      </div>`;
  }
  B.act.muBdPick = (id) => { B.vs['bd:q'] = ''; B.go(rgo(`details-${id}`)); };

  /* =================================================================
     5 · Building Verification Queue
     ================================================================= */
  const VQ_VIEWS = {
    open: (x) => VQ_OPEN.includes(x.status), over: (x) => VQ_OPEN.includes(x.status) && x.age > SLA, high: (x) => VQ_OPEN.includes(x.status) && x.risk === 'high',
    indep: (x) => VQ_OPEN.includes(x.status) && D.building(x.b).source === 'independent', mine: (x) => VQ_OPEN.includes(x.status) && x.who === 'p_maha', done: (x) => !VQ_OPEN.includes(x.status),
  };
  const SRC = { app: T('Owner app', 'تطبيق المالك'), committee: T('Committee portal', 'بوابة اللجنة'), manager: T('Manager portal', 'بوابة المدير'), import: T('Bulk import', 'استيراد مجمّع'), field: T('Field survey', 'مسح ميداني') };
  B.act.muVqOpen = (id) => { B.vs['vq:cur'] = id; if (B.route.page !== 'verify') B.go(rgo('verify')); else B.refresh(); };
  B.act.muVqX = () => { B.vs['vq:cur'] = ''; B.refresh(); };
  B.act.muVqNav = (dir) => { const ids = B.vs['vq:_ids'] || []; const i = ids.indexOf(B.get('vq:cur', '')); const n = ids[i + (+dir)]; if (n) { B.vs['vq:cur'] = n; B.refresh(); } };
  const vqDecide = (x, st) => {
    x.status = st; x.decided = today;
    const b = D.building(x.b);
    if (st === 'verified') { b.verification = 'verified'; b.status = 'registered'; b.updated = today; }
    if (st === 'rejected') { b.updated = today; }
  };
  B.act.muVqDec = (arg) => {
    const [id, st] = arg.split(':');
    const x = VQ.find((v) => v.id === id);
    if (!x) return;
    const go = () => {
      const ids = B.vs['vq:_ids'] || [];
      vqDecide(x, st);
      const i = ids.indexOf(id);
      const next = ids.slice(i + 1).concat(ids.slice(0, i)).find((k) => { const y = VQ.find((v) => v.id === k); return y && VQ_OPEN.includes(y.status); });
      B.vs['vq:cur'] = next || '';
      B.closeModal(true); B.refresh();
      const msg = { verified: L('Record verified — next item opened (demo)', 'تم توثيق السجل — فُتح العنصر التالي (تجريبي)'), needsInfo: L('Information requested from the submitter (demo)', 'طُلبت معلومات من مقدّم السجل (تجريبي)'), rejected: L('Submission rejected (demo)', 'تم رفض السجل المقدّم (تجريبي)'), escalated: L('Escalated to the unit lead (demo)', 'تم التصعيد إلى رئيس الوحدة (تجريبي)') }[st];
      B.toast(msg);
    };
    if (st === 'rejected') B.confirm({ title: L('Reject this submission?', 'رفض هذا السجل المقدّم؟'), text: L('The submitter will see the reason in BENA. The BENA ID stays reserved.', 'سيرى مقدّم السجل السبب في بينا. يبقى رقم بينا محجوزاً.'), ok: L('Reject', 'رفض'), danger: true, onOk: go });
    else go();
  };
  B.act.muVqBulk = () => {
    const ids = selOf('vq').filter((id) => { const x = VQ.find((v) => v.id === id); return x && VQ_OPEN.includes(x.status); });
    if (!ids.length) { B.toast(L('No open items selected', 'لم يتم تحديد عناصر مفتوحة'), 'info'); return; }
    const risky = ids.filter((id) => VQ.find((v) => v.id === id).risk === 'high').length;
    B.confirm({ title: L(`Verify ${ids.length} records?`, `توثيق ${ids.length} سجلات؟`), text: `${L('Records are marked verified in memory (demo).', 'يتم توثيق السجلات في الذاكرة (تجريبي).')}${risky ? ' ' + L(`${risky} high-risk item(s) included — consider reviewing them individually.`, `يتضمن التحديد ${risky} عنصراً عالي المخاطر — يُفضّل مراجعتها فردياً.`) : ''}`, ok: L('Verify all', 'توثيق الكل'),
      onOk: () => { ids.forEach((id) => vqDecide(VQ.find((v) => v.id === id), 'verified')); B.vs['vq:cur'] = ''; B.vs['vq:sel'] = []; B.closeModal(true); B.refresh(); B.toast(L(`${ids.length} records verified (demo)`, `تم توثيق ${ids.length} سجلات (تجريبي)`)); } });
  };
  B.act.muVqAssign = () => {
    const n = selOf('vq').length;
    B.modal({ title: L('Assign reviewer', 'إسناد إلى مراجع'), sub: L(`${n} selected item(s)`, `${n} عنصر محدد`), size: 'sm', form: 'muVqAssign',
      body: ui.field({ name: 'who', label: L('Reviewer', 'المراجع'), type: 'select', options: REVIEWERS.map((p) => ({ v: p, l: D.person(p).name })) }),
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Assign', 'إسناد'), { kind: 'primary', type: 'submit', icon: 'userCheck' })}` });
  };
  B.submit.muVqAssign = (d) => { selOf('vq').forEach((id) => { const x = VQ.find((v) => v.id === id); if (x) x.who = d.who; }); B.vs['vq:cur'] = B.vs['vq:cur'] || ''; B.vs['vq:sel'] = []; B.closeModal(true); B.refresh(); B.toast(L(`Assigned to ${D.pname(d.who)}`, `أُسند إلى ${D.pname(d.who)}`)); };

  function verify() {
    crumbs([[L('Verification Queue', 'قائمة التحقق')]]);
    const view = B.get('vq:view', 'open'), q = B.get('vq:q', ''), src = B.get('vq:src', 'all'), dist = B.get('vq:dist', 'all'), risk = B.get('vq:risk', 'all');
    const base = VQ.filter((x) => { const b = D.building(x.b); return (src === 'all' || x.src === src) && (dist === 'all' || b.district === dist) && (risk === 'all' || x.risk === risk) && B.match(q, x.id, b.id, b.name, b.address, b.ref); });
    const rows = base.filter(VQ_VIEWS[view] || VQ_VIEWS.open);
    const sortKey = B.get('vq:sort', '-prio');
    let selId = B.get('vq:cur', '');
    const sx = selId ? VQ.find((v) => v.id === selId) : null;
    if (!sx) selId = '';
    const o = vqOpen();
    const table = dt({
      id: 'vq', rows, select: true, active: selId, defaultSort: '-prio', pageSize: 16, maxH: 'calc(100dvh - 360px)',
      rowAct: (r) => ({ act: 'muVqOpen', arg: r.id }),
      bulk: () => `${ui.btn(L('Verify', 'توثيق'), { kind: 'primary', icon: 'shieldCheck', act: 'muVqBulk' })}${ui.btn(L('Assign…', 'إسناد…'), { icon: 'userPlus', act: 'muVqAssign' })}${ui.btn(L('Export', 'تصدير'), { icon: 'download', act: 'soon', arg: L('Export', 'التصدير') })}`,
      cols: [
        { key: 'prio', label: '', sort: (r) => prio(r), w: '22px', render: (r) => riskDot(r.risk) },
        { key: 'b', label: L('Building', 'المبنى'), sort: (r) => tx(D.building(r.b).name), m: 'title', mRender: (r) => esc(tx(D.building(r.b).name)),
          render: (r) => { const b = D.building(r.b); return `<div class="mu-cell"><div><b style="max-width:${selId ? 170 : 240}px">${esc(tx(b.name))}</b><small><bdi>${b.id}</bdi> · ${dName(b.district)}</small></div></div>`; } },
        { key: 'src', label: L('Source', 'المصدر'), sort: (r) => tx(SRC[r.src]), render: (r) => `<div class="mu-2l"><span class="nowrap">${tx(SRC[r.src])}</span><small>${ui.prov(r.src === 'field' ? 'official' : 'submitted').replace('class="prov', 'style="height:18px;font-size:10.5px" class="prov')}</small></div>`, m: 'sub', hide: !!selId },
        { key: 'age', label: L('SLA age', 'عمر المهلة'), sort: true, render: slaCell, m: 'meta' },
        { key: 'flags', label: L('Risk flags', 'مؤشرات المخاطر'), sort: (r) => r.flags.length, render: (r) => flagsHtml(r.flags, selId ? 1 : 2) },
        { key: 'who', label: L('Reviewer', 'المراجع'), sort: (r) => D.pname(r.who), render: (r) => `<span class="nowrap small">${esc(D.pname(r.who))}</span>`, hide: !!selId },
        { key: 'status', label: L('Status', 'الحالة'), sort: true, render: (r) => ui.status(r.status), m: 'end', hide: !!selId },
      ],
      empty: { icon: 'checkCircle', title: L('Queue clear', 'القائمة فارغة'), text: L('No items match this view.', 'لا توجد عناصر مطابقة لهذا العرض.') },
    });
    // keep the ordered ids for prev/next + auto-advance
    const sorted = rows.slice().sort(B.by((r) => prio(r), sortKey === '-prio' || !B.vs['vq:sort'] ? -1 : 1));
    B.vs['vq:_ids'] = (B.vs['vq:sort'] && B.vs['vq:sort'] !== '-prio') ? rows.map((r) => r.id) : sorted.map((r) => r.id);
    const vc = (k) => base.filter(VQ_VIEWS[k]).length;
    const pane = sx ? reviewPane(sx) : '';
    return `${hdr({ title: L('Building Verification Queue', 'قائمة التحقق من المباني'), sub: L(`Prioritised by SLA age (${SLA}-day target) and risk. Decisions update in-memory demo data only.`, `مرتبة حسب عمر المهلة (الهدف ${SLA} يوماً) والمخاطر. تُحدّث القرارات البيانات التجريبية في الذاكرة فقط.`),
      actions: ui.btn(L('Verification rules', 'قواعد التحقق'), { icon: 'sliders', go: B.roles[ADMIN] ? `${ADMIN}-rules` : rgo('verify') }) + ui.btn(L('Review next', 'مراجعة التالي'), { kind: 'primary', icon: 'play', act: 'muVqOpen', arg: (B.vs['vq:_ids'] || [])[0] || '' }) })}
      <div class="stack">
        ${strip([
          { label: L('Open in queue', 'مفتوحة في القائمة'), value: o.length, sub: L(`${o.filter((x) => x.status === 'needsInfo').length} waiting on submitter`, `${o.filter((x) => x.status === 'needsInfo').length} بانتظار مقدّم السجل`) },
          { label: L('Over SLA', 'تجاوزت المهلة'), value: o.filter((x) => x.age > SLA).length, sub: L(`Target ${SLA} days`, `الهدف ${SLA} يوماً`), tone: 'bad', act: 'set', arg: 'vq:view=over' },
          { label: L('Due within 3 days', 'تستحق خلال 3 أيام'), value: o.filter((x) => x.age > SLA - 3 && x.age <= SLA).length, sub: L('Prioritise today', 'أعطها الأولوية اليوم'), tone: 'warn' },
          { label: L('High risk', 'عالية المخاطر'), value: o.filter((x) => x.risk === 'high').length, sub: L('2+ risk flags', 'مؤشرا مخاطر أو أكثر'), act: 'set', arg: 'vq:view=high' },
          { label: L('Avg. age', 'متوسط العمر'), value: L(`${B.num1(B.sum(o, (x) => x.age) / Math.max(1, o.length))} d`, `${B.num1(B.sum(o, (x) => x.age) / Math.max(1, o.length))} يوم`), sub: L('Open items', 'العناصر المفتوحة') },
          { label: L('Verified today', 'وُثّقت اليوم'), value: VQ.filter((x) => x.status === 'verified' && x.decided === today).length, sub: L('This session', 'هذه الجلسة'), tone: 'ok' },
        ])}
        ${views('vq:view', [{ id: 'open', label: L('All open', 'جميع المفتوحة'), count: vc('open') }, { id: 'over', label: L('Over SLA', 'تجاوزت المهلة'), count: vc('over') }, { id: 'high', label: L('High risk', 'عالية المخاطر'), count: vc('high') }, { id: 'indep', label: L('Independent', 'مستقلة'), count: vc('indep') }, { id: 'mine', label: L('Assigned to me', 'المسندة إليّ'), count: vc('mine') }, { id: 'done', label: L('Decided', 'تم البت'), count: vc('done') }], view)}
        <div class="mu-fbar">${ui.search('vq:q', L('Search queue ID, BENA ID, street', 'ابحث برقم القائمة أو رقم بينا أو الشارع'), { reset: 'vq:page' })}
          ${ui.select('vq:src', [{ v: 'all', l: L('All sources', 'جميع المصادر') }].concat(Object.keys(SRC).map((k) => ({ v: k, l: SRC[k] }))), { def: 'all', label: L('Source', 'المصدر'), reset: 'vq:page' })}
          ${ui.select('vq:dist', M.optsDist(), { def: 'all', label: L('District', 'الحي'), reset: 'vq:page' })}
          ${ui.select('vq:risk', [{ v: 'all', l: L('Any risk', 'أي مستوى مخاطر') }, { v: 'high', l: B.statuses.high }, { v: 'medium', l: B.statuses.medium }, { v: 'low', l: B.statuses.low }], { def: 'all', label: L('Risk', 'المخاطر'), reset: 'vq:page' })}
          <span class="mu-count">${L(`${rows.length} items`, `${rows.length} عنصر`)}</span></div>
        ${sx ? `<div class="mu-split wide">${table}${pane}</div>` : table}
      </div>`;
  }

  function reviewPane(x) {
    const b = D.building(x.b);
    const ids = B.vs['vq:_ids'] || [];
    const i = ids.indexOf(x.id);
    const open = VQ_OPEN.includes(x.status);
    const refTitle = b.ref ? L('Sample municipal record', 'السجل البلدي النموذجي') : L('Nearest sample municipal footprint', 'أقرب مسقط بلدي نموذجي');
    const area = Math.round(polyArea(b.poly));
    const rowsC = [
      [L('Building type', 'نوع المبنى'), D.typeLabel(b.type), D.typeLabel(x.ref.type)],
      [L('Floors', 'الطوابق'), B.num(b.floors), B.num(x.ref.floors)],
      [L('Units', 'الوحدات'), B.num(b.units), B.num(x.ref.units)],
      [L('Parcel', 'القطعة'), qf(b).noParcel ? null : parcelTxt(b.parcel), x.ref.parcel ? parcelTxt(x.ref.parcel) : null],
      [L('Footprint area', 'مساحة المسقط'), `${B.num(area)} m²`, `${B.num(x.ref.area)} m²`],
      [L('Year built', 'سنة البناء'), String(b.year), String(x.ref.year)],
      [L('Address', 'العنوان'), esc(tx(b.address)), esc(tx(b.address))],
    ];
    const nd = rowsC.filter(([, s, r]) => s != null && r != null && s !== r).length;
    const cmp = `<table class="mu-cmp"><thead><tr><th>${L('Field', 'الحقل')}</th><th>${L('Submitted', 'المقدّم')}<br>${ui.prov(x.src === 'field' ? 'official' : 'submitted')}</th><th>${refTitle}<br>${ui.prov('official')}</th></tr></thead><tbody>${rowsC.map(([k, s, r]) => {
      const diff = s != null && r != null && s !== r;
      return `<tr class="${diff ? 'hl' : ''}"><td>${k}</td><td class="${s == null ? 'm' : diff ? 'd' : ''}">${s == null ? L('Not supplied', 'غير مُقدّم') : s}</td><td class="${r == null ? 'm' : diff ? '' : 'ok'}">${r == null ? L('No record', 'لا يوجد سجل') : `${!diff && s != null ? `<span class="mi">${icon('check')}</span>` : ''}${r}`}</td></tr>`;
    }).join('')}</tbody></table>`;
    const mapId = 'vqm';
    if (B.vs['vqm:_b'] !== b.id) { B.map.focus(mapId, b.id, 150); B.vs['vqm:_b'] = b.id; }
    const map = B.map.render({ id: mapId, static: true, mode: 'verification', selected: b.id, height: '190px', legend: false, layers: { parcels: true }, badge: L('Footprint & parcel · sample', 'المسقط والقطعة · نموذج') });
    const docsL = [['deed', 'PDF', '1.3 MB', 'doc'], ['photos', 'JPG ×4', '5.2 MB', 'image'], ['plan', 'DWG', '2.7 MB', 'map']].slice(0, 2 + (hash(x.id) % 2)).map(([k, t, s, ic]) => ui.doc({ name: DOCN[k], type: t, size: s, date: x.date, icon: ic }));
    const checks = [
      ['ok', L('BENA identity of submitter verified', 'هوية مقدّم السجل في بينا موثّقة')],
      x.flags.includes('dup') || x.flags.includes('overlap') ? ['warn', L('Footprint overlaps another record', 'المسقط يتداخل مع سجل آخر')] : ['ok', L('No overlap with existing footprints', 'لا تداخل مع مساقط قائمة')],
      x.flags.includes('parcel') ? ['warn', L('Parcel reference missing', 'مرجع القطعة مفقود')] : ['ok', L('Parcel found in cadastre layer (sample)', 'القطعة موجودة في طبقة المساحة (نموذج)')],
      x.flags.includes('heritage') ? ['warn', L('Heritage zone — conservation sign-off required', 'منطقة تراثية — تتطلب موافقة وحدة الحفاظ')] : null,
      x.flags.includes('permit') ? ['warn', L('No building permit linked', 'لا توجد رخصة بناء مرتبطة')] : null,
    ].filter(Boolean);
    return `<aside class="card mu-pane">
      <div class="mu-pane-h"><div class="grow" style="min-width:0">
          <div class="row-sm wrap" style="margin-bottom:6px">${ui.idMono(x.id)}${ui.status(x.status)}${ui.status(x.risk)}</div>
          <h3 style="font-size:16px;line-height:1.3">${esc(tx(b.name))}</h3>
          <div class="xs faint" style="margin-top:2px"><bdi>${b.id}</bdi> · ${dName(b.district)} · ${tx(SRC[x.src])} · ${L(`submitted ${B.dateShort(x.date)}`, `قُدّم ${B.dateShort(x.date)}`)}</div></div>
        <div class="mu-rv-nav"><button class="icon-btn" data-act="muVqNav" data-arg="-1" ${i <= 0 ? 'disabled' : ''} aria-label="${L('Previous', 'السابق')}">${icon('chevL', 'flip')}</button><button class="icon-btn" data-act="muVqNav" data-arg="1" ${i < 0 || i >= ids.length - 1 ? 'disabled' : ''} aria-label="${L('Next', 'التالي')}">${icon('chevR', 'flip')}</button><button class="icon-btn" data-act="muVqX" aria-label="${L('Close', 'إغلاق')}">${icon('x')}</button></div></div>
      <div class="mu-pane-b">
        <div class="mu-sec"><span class="grow">${L('Submitted vs reference', 'المقدّم مقابل المرجع')}</span>${nd ? ui.badge(L(`${nd} difference(s)`, `${nd} اختلاف`), 'warn', 'alert') : ui.badge(L('Consistent', 'متسق'), 'ok', 'check')}</div>
        ${cmp}
        <div class="mu-sec">${L('Location', 'الموقع')}</div>
        <div style="border-radius:12px;overflow:hidden">${map}</div>
        <div class="mu-sec">${L('Automated checks', 'الفحوصات الآلية')}</div>
        <div class="rq-checks">${checks.map(([s, t]) => `<div class="${s}">${icon(s === 'ok' ? 'checkCircle' : 'alert')}<span>${t}</span></div>`).join('')}</div>
        <div class="mu-sec">${L('Documents', 'المستندات')}</div>
        ${ui.list(docsL)}
        <div class="mu-sec">${L('Review note', 'ملاحظة المراجعة')}</div>
        <textarea class="textarea" id="vq-note" data-model="vq:note:${x.id}" data-norender placeholder="${esc(L('Optional note shared with the submitter', 'ملاحظة اختيارية تُرسل لمقدّم السجل'))}" style="min-height:70px">${esc(B.get('vq:note:' + x.id, ''))}</textarea>
        <div class="mu-own">${icon('info')}<span>${L('Verifying confirms the building record matches the reference data. It does not confirm legal ownership.', 'يؤكد التوثيق تطابق سجل المبنى مع البيانات المرجعية، ولا يُثبت الملكية القانونية.')}</span></div>
      </div>
      <div class="mu-pane-f">${open ? `${ui.btn(L('Verify', 'توثيق'), { kind: 'primary', icon: 'shieldCheck', act: 'muVqDec', arg: `${x.id}:verified` })}${ui.btn(L('Request info', 'طلب معلومات'), { icon: 'alertCircle', act: 'muVqDec', arg: `${x.id}:needsInfo` })}${ui.btn(L('Escalate', 'تصعيد'), { icon: 'flag', act: 'muVqDec', arg: `${x.id}:escalated` })}${ui.btn(L('Reject', 'رفض'), { kind: 'danger', icon: 'xCircle', act: 'muVqDec', arg: `${x.id}:rejected` })}`
        : `${ui.callout(L(`Decision recorded: <b>${ui.statusLabel(x.status)}</b>`, `تم تسجيل القرار: <b>${ui.statusLabel(x.status)}</b>`), x.status === 'verified' ? 'mint' : '', 'check')}${ui.btn(L('Reopen', 'إعادة فتح'), { icon: 'refresh', act: 'muVqDec', arg: `${x.id}:toReview` })}`}
        ${ui.btn(L('Building Identity', 'هوية المبنى'), { icon: 'fingerprint', go: rgo(`building-${b.id}`) })}</div>
    </aside>`;
  }

  /* =================================================================
     7 · Correction Requests (list + field-level diff detail)
     ================================================================= */
  const fdKey = (c, f) => `cr:d:${c.id}:${f}`;
  const fdOf = (c, ch) => ch.d || B.get(fdKey(c, ch.f), 'accept');
  B.act.muCrSel = (id) => { B.vs['cr:sel'] = id; if (B.route.page === 'correction') B.go(rgo(`correction-${id}`)); else B.refresh(); };
  B.act.muCrFd = (arg) => { const [id, f, v] = arg.split('|'); B.vs[`cr:d:${id}:${f}`] = v; B.refresh(); };
  B.act.muCrApply = (id) => {
    const c = corOf(id); const b = D.building(c.b);
    const acc = c.changes.filter((ch) => fdOf(c, ch) === 'accept');
    if (!acc.length) { B.toast(L('No fields accepted — use Reject instead', 'لم يُقبل أي حقل — استخدم الرفض بدلاً من ذلك'), 'info'); return; }
    B.confirm({ title: L(`Apply ${acc.length} of ${c.changes.length} change(s)?`, `تطبيق ${acc.length} من ${c.changes.length} تغيير؟`), text: L('Accepted values are written to the municipal record in memory (demo). Rejected fields keep their current values.', 'تُكتب القيم المقبولة في السجل البلدي في الذاكرة (تجريبي). تحتفظ الحقول المرفوضة بقيمها الحالية.'), ok: L('Apply changes', 'تطبيق التغييرات'),
      onOk: () => {
        c.changes.forEach((ch) => { ch.d = fdOf(c, ch); if (ch.d === 'accept' && b && ch.f !== 'shops') b[ch.f] = ch.prop; });
        if (b) { b.updated = today; b._touched = true; }
        c.status = acc.length === c.changes.length ? 'applied' : 'partiallyApplied'; c.decided = today;
        B.closeModal(true); B.refresh(); B.toast(L('Changes applied to the record (demo)', 'تم تطبيق التغييرات على السجل (تجريبي)'));
      } });
  };
  B.act.muCrReject = (id) => { const c = corOf(id); B.confirm({ title: L('Reject this correction request?', 'رفض طلب التصحيح هذا؟'), text: L('No values change. The requester sees the reason in BENA.', 'لن تتغير أي قيم. سيرى مقدّم الطلب السبب في بينا.'), ok: L('Reject', 'رفض'), danger: true, onOk: () => { c.changes.forEach((ch) => { ch.d = 'reject'; }); c.status = 'rejected'; c.decided = today; B.closeModal(true); B.refresh(); B.toast(L('Correction rejected (demo)', 'تم رفض التصحيح (تجريبي)')); } }); };
  B.act.muCrInfo = (id) => { const c = corOf(id); c.status = 'needsInfo'; c.note = T('Additional evidence requested.', 'طُلبت مستندات إضافية.'); B.refresh(); B.toast(L('Evidence requested from the requester (demo)', 'طُلبت مستندات من مقدّم الطلب (تجريبي)')); };
  B.act.muCrReopen = (id) => { const c = corOf(id); c.status = 'underReview'; c.decided = null; c.changes.forEach((ch) => { delete ch.d; }); B.refresh(); };
  const CR_VIEWS = { open: (c) => COR_OPEN.includes(c.status), new: (c) => c.status === 'new', needsInfo: (c) => c.status === 'needsInfo', decided: (c) => !COR_OPEN.includes(c.status), all: () => true };

  function corrections(id) {
    if (id) { B.vs['cr:sel'] = id; B.navActive('corrections'); }
    const view = B.get('cr:view', 'open'), q = B.get('cr:q', '');
    const base = COR.filter((c) => { const b = D.building(c.b); return B.match(q, c.id, b.id, b.name, D.pname(c.by)); });
    const rows = base.filter(CR_VIEWS[view] || CR_VIEWS.open).sort(B.by('date', -1));
    let sel = B.get('cr:sel', '');
    if (!corOf(sel) || (!id && !rows.find((r) => r.id === sel))) sel = rows[0] ? rows[0].id : '';
    const c = corOf(sel);
    crumbs(c && id ? [[L('Correction Requests', 'طلبات التصحيح'), 'corrections'], [c.id]] : [[L('Correction Requests', 'طلبات التصحيح')]]);
    if (id && c) B.title(c.id);
    const list = `<div class="card pad-0">
      <div style="padding:12px 14px;border-bottom:1px solid var(--line-2)" class="mu-fbar">${ui.search('cr:q', L('Search request, building, requester', 'ابحث بالطلب أو المبنى أو مقدّم الطلب'))}</div>
      <div class="mu-clist">${rows.length ? rows.map((r) => { const b = D.building(r.b); return `<button class="${r.id === sel ? 'on' : ''}" data-act="muCrSel" data-arg="${r.id}"><span style="min-width:0"><b>${esc(tx(b.name))}</b><small><bdi>${r.id}</bdi> · ${r.changes.map((x) => tx(FL[x.f])).join(', ')}</small><small>${esc(D.pname(r.by))} · ${B.ago(r.date)}</small></span><span class="r">${ui.status(r.status)}<span class="xs faint">${L(`${r.changes.length} field(s)`, `${r.changes.length} حقل`)}</span></span></button>`; }).join('') : `<div style="padding:20px">${ui.empty({ icon: 'inbox', title: L('No correction requests', 'لا توجد طلبات تصحيح'), text: L('Nothing matches this view.', 'لا شيء يطابق هذا العرض.') })}</div>`}</div></div>`;
    const vc = (k) => base.filter(CR_VIEWS[k]).length;
    return `${hdr({ title: L('Correction Requests', 'طلبات التصحيح'), sub: L('Field-level changes proposed by owners, committees, managers and field surveys. Accept or reject each field, then apply.', 'تغييرات على مستوى الحقول يقترحها المالكون واللجان والمديرون والمسح الميداني. اقبل أو ارفض كل حقل ثم طبّق.'),
      actions: ui.btn(L('Export log', 'تصدير السجل'), { icon: 'download', act: 'soon', arg: L('Export', 'التصدير') }) })}
      <div class="stack">
        ${strip([
          { label: L('Open requests', 'طلبات مفتوحة'), value: COR.filter((x) => COR_OPEN.includes(x.status)).length, sub: L(`${COR.filter((x) => x.status === 'new').length} new`, `${COR.filter((x) => x.status === 'new').length} جديدة`) },
          { label: L('Fields proposed', 'الحقول المقترحة'), value: B.sum(COR.filter((x) => COR_OPEN.includes(x.status)), (x) => x.changes.length), sub: L('Across open requests', 'في الطلبات المفتوحة') },
          { label: L('Waiting on evidence', 'بانتظار المستندات'), value: COR.filter((x) => x.status === 'needsInfo').length, tone: 'warn', sub: L('Requester action', 'إجراء مقدّم الطلب') },
          { label: L('Applied this month', 'طُبّقت هذا الشهر'), value: COR.filter((x) => ['applied', 'partiallyApplied'].includes(x.status)).length, tone: 'ok', sub: L('Record updated', 'تم تحديث السجل') },
        ])}
        ${views('cr:view', [{ id: 'open', label: L('Open', 'مفتوحة'), count: vc('open') }, { id: 'new', label: B.statuses.new, count: vc('new') }, { id: 'needsInfo', label: L('Waiting on evidence', 'بانتظار المستندات'), count: vc('needsInfo') }, { id: 'decided', label: L('Decided', 'تم البت'), count: vc('decided') }, { id: 'all', label: L('All', 'الكل'), count: vc('all') }], view)}
        <div class="mu-split narrow">${list}${c ? corDetail(c) : `<div class="card">${ui.empty({ icon: 'edit', title: L('Select a request', 'اختر طلباً'), text: L('Choose a correction request to review its field-level changes.', 'اختر طلب تصحيح لمراجعة التغييرات على مستوى الحقول.') })}</div>`}</div>
      </div>`;
  }
  function corDetail(c) {
    const b = D.building(c.b);
    const open = COR_OPEN.includes(c.status);
    const acc = c.changes.filter((ch) => fdOf(c, ch) === 'accept').length;
    const rows = c.changes.map((ch) => {
      const d = fdOf(c, ch);
      const ctl = open ? `<span class="mu-fd"><button class="a ${d === 'accept' ? 'on' : ''}" data-act="muCrFd" data-arg="${c.id}|${ch.f}|accept">${icon('check')}${L('Accept', 'قبول')}</button><button class="r ${d === 'reject' ? 'on' : ''}" data-act="muCrFd" data-arg="${c.id}|${ch.f}|reject">${icon('x')}${L('Reject', 'رفض')}</button></span>` : ui.status(d === 'accept' ? 'accepted' : 'rejected');
      return `<tr class="${d === 'reject' ? '' : 'hl'}"><td><b style="color:var(--ink);font-weight:600;display:block">${tx(FL[ch.f])}</b><span class="xs faint">${icon('paperclip').replace('<svg', '<svg style="width:11px;height:11px;display:inline;vertical-align:-1px"')} ${tx(ch.ev)}</span></td><td><div class="mu-diff"><del>${esc(fmtVal(ch.f, ch.cur))}</del></div></td><td><div class="mu-diff"><ins>${esc(fmtVal(ch.f, ch.prop))}</ins></div></td><td style="text-align:end">${ctl}</td></tr>`;
    }).join('');
    const tl = [
      { state: 'done', icon: 'send', title: L('Submitted', 'تم التقديم'), meta: `${B.date(c.date)} · ${esc(D.pname(c.by))} · ${tx(M.CH[c.channel])}` },
      { state: 'done', icon: 'userCheck', title: L('Assigned to Eng. Maha Awad', 'أُسند إلى م. مها عوض'), meta: B.date(c.date) },
      c.status === 'needsInfo' ? { state: 'current', icon: 'alertCircle', title: L('Evidence requested', 'طُلبت مستندات'), meta: c.note ? tx(c.note) : '' } : null,
      !open ? { state: 'done', icon: c.status === 'rejected' ? 'xCircle' : 'check', title: ui.statusLabel(c.status), meta: `${B.date(c.decided || today)}${c.note ? ' · ' + tx(c.note) : ''}` } : { state: '', icon: 'gavel', title: L('Decision', 'القرار'), meta: L('Accept / reject each field, then apply', 'اقبل أو ارفض كل حقل ثم طبّق') },
    ].filter(Boolean);
    return `<div class="stack">
      <section class="card">
        <div class="row between wrap" style="gap:12px;align-items:flex-start">
          <div style="min-width:0"><div class="row-sm wrap" style="margin-bottom:6px">${ui.idMono(c.id)}${ui.status(c.status)}${ui.prov(c.channel === 'field' ? 'official' : 'submitted')}${sampleTag(L('Demo request', 'طلب تجريبي'))}</div>
            <h2 style="font-size:18px">${esc(tx(b.name))}</h2>
            <div class="rq-meta"><span>${icon('hash')}<bdi>${b.id}</bdi></span><span>${icon('user')}${esc(D.pname(c.by))}</span><span>${icon('inbox')}${tx(M.CH[c.channel])}</span><span>${icon('calendar')}${B.date(c.date)}</span></div></div>
          <div class="row-sm">${ui.btn(L('Building Identity', 'هوية المبنى'), { size: 'sm', icon: 'fingerprint', go: rgo(`building-${b.id}`) })}${ui.btn(L('Map', 'الخريطة'), { size: 'sm', icon: 'map', act: 'muShowOnMap', arg: b.id })}</div>
        </div>
        <p class="small muted" style="margin-top:12px">${tx(c.reason)}</p>
      </section>
      ${ui.card({ title: L('Field-level changes', 'التغييرات على مستوى الحقول'), sub: open ? L(`${acc} of ${c.changes.length} field(s) accepted`, `${acc} من ${c.changes.length} حقل مقبول`) : L('Decision recorded', 'تم تسجيل القرار'), cls: 'pad-0',
        body: `<div style="padding:0 20px 6px"><table class="mu-cmp"><thead><tr><th>${L('Field · evidence', 'الحقل · المستند')}</th><th>${L('Current', 'الحالي')}<br>${ui.prov('official')}</th><th>${L('Proposed', 'المقترح')}<br>${ui.prov('submitted')}</th><th style="text-align:end">${L('Decision', 'القرار')}</th></tr></thead><tbody>${rows}</tbody></table></div>`,
        foot: open ? `<div class="rq-actbar">${ui.btn(L('Apply accepted changes', 'تطبيق التغييرات المقبولة'), { kind: 'primary', icon: 'check', act: 'muCrApply', arg: c.id })}${ui.btn(L('Request evidence', 'طلب مستندات'), { icon: 'alertCircle', act: 'muCrInfo', arg: c.id })}${ui.btn(L('Reject request', 'رفض الطلب'), { kind: 'danger', icon: 'xCircle', act: 'muCrReject', arg: c.id })}</div>` : `<div class="rq-actbar">${ui.btn(L('Reopen', 'إعادة فتح'), { icon: 'refresh', act: 'muCrReopen', arg: c.id })}</div>` }).replace('<div class="card-head">', '<div class="card-head" style="padding:18px 20px 0">').replace('<div class="card-foot">', '<div class="card-foot" style="padding:12px 20px 16px">')}
      <div class="grid g2">
        ${ui.card({ title: L('Evidence', 'المستندات'), sub: L(`${c.docs.length} file(s)`, `${c.docs.length} ملف`), body: ui.list(c.docs.map(([k, t, s]) => ui.doc({ name: DOCN[k], type: t, size: s, date: c.date, icon: k === 'photos' ? 'image' : k === 'plan' || k === 'asbuilt' ? 'map' : 'doc' }))) })}
        ${ui.card({ title: L('Timeline', 'المسار'), body: ui.timeline(tl) })}
      </div>
    </div>`;
  }

  /* =================================================================
     8 · Data Quality Dashboard
     ================================================================= */
  B.act.muDqCat = (k) => { B.vs['dq:cat'] = B.get('dq:cat', '') === k ? '' : k; B.vs['dqb:page'] = 0; B.vs['dq:qv'] = ''; B.refresh(); };
  B.act.muDqDist = (k) => { B.vs['dq:dist'] = B.get('dq:dist', 'all') === k ? 'all' : k; B.vs['dqb:page'] = 0; B.vs['dq:qv'] = ''; B.refresh(); };
  B.act.muDqQv = (id) => { B.vs['dq:qv'] = B.get('dq:qv', '') === id ? '' : id; B.refresh(); };
  B.act.muDqQvX = () => { B.vs['dq:qv'] = ''; B.refresh(); };
  B.act.muDqGis = () => { const cat = B.get('dq:cat', ''); B.vs['gx:flag'] = !!cat && cat !== 'outdated' && cat !== 'unlinked'; B.vs['gx:dist'] = B.get('dq:dist', 'all'); B.vs['gx:l:qf'] = true; B.go(`${R}-explorer`); };
  const heatCol = (v) => (v >= 97 ? ['#E3F7EF', '#0A7A55'] : v >= 92 ? ['#EEF8F2', '#2E7D5B'] : v >= 85 ? ['#FDF5E6', '#9A5B0B'] : ['#FBE7E5', '#B0332C']);
  function quality() {
    crumbs([[L('Data Quality', 'جودة البيانات')]]);
    const cat = B.get('dq:cat', ''), dist = B.get('dq:dist', 'all');
    const all = dqDistrict('all');
    const dRows = D.districts.map((d) => ({ d, m: dqDistrict(d.id) })).sort(B.by((x) => x.m.score));
    const cell = (v) => { const [bg, fg] = heatCol(v); return `<span class="cell" style="background:${bg};color:${fg}">${B.pct(v, 1)}</span>`; };
    const matrix = `<div class="mu-dqm-wrap"><table class="mu-dqm"><thead><tr><th>${L('District', 'الحي')}</th><th class="c">${L('Completeness', 'الاكتمال')}</th><th class="c">${L('Accuracy', 'الدقة')}</th><th class="c">${L('Consistency', 'الاتساق')}</th><th class="c">${L('Timeliness', 'الحداثة')}</th><th class="c">${L('Issues', 'المشكلات')}</th><th class="c">${L('Score', 'المؤشر')}</th></tr></thead><tbody>
      ${dRows.map(({ d, m }) => `<tr class="${dist === d.id ? 'on' : ''}" data-act="muDqDist" data-arg="${d.id}"><td><b>${tx(d.name)}</b><div class="xs faint">${L(`${m.n} records in sample`, `${m.n} سجلاً في العينة`)}</div></td><td class="c">${cell(m.comp)}</td><td class="c">${cell(m.acc)}</td><td class="c">${cell(m.cons)}</td><td class="c">${cell(m.time)}</td><td class="c"><b class="num">${m.issues}</b></td><td class="c"><b class="num" style="font-size:15px">${m.score}</b></td></tr>`).join('')}
      </tbody></table></div>`;
    const scope = D.buildings.filter((b) => dist === 'all' || b.district === dist);
    const issueCards = Object.keys(ISSUES).map((k) => {
      const it = ISSUES[k]; const n = scope.filter(it.f).length;
      const tr = Array.from({ length: 8 }, (_, i) => Math.round(n * (1.5 - i * 0.06) + ((hash(k + i) % 5) - 2)));
      return `<button class="mu-issue ${cat === k ? 'on' : ''}" data-act="muDqCat" data-arg="${k}"><span class="li-icon ${it.tone}">${icon(it.icon)}</span><b>${tx(it.t)}</b><span class="n">${n}</span><small>${tx(it.d)} · ${tr[0] > n ? `<span style="color:var(--ok)">↓ ${tr[0] - n}</span>` : ''} ${L('vs 8 wk ago', 'مقارنة بـ 8 أسابيع')}</small></button>`;
    }).join('');
    const ml = M.months();
    const back = (cur, k) => Array.from({ length: 12 }, (_, i) => (i === 11 ? cur : Math.round(cur * (1 + (11 - i) * k) + ((hash(String(cur) + i) % 3) - 1))));
    const trend = ui.card({ title: L('Open issues trend', 'اتجاه المشكلات المفتوحة'), sub: L(`Last 12 months · ${dist === 'all' ? 'all districts' : dName(dist)}`, `آخر 12 شهراً · ${dist === 'all' ? 'جميع الأحياء' : dName(dist)}`),
      body: B.charts.line({ labels: ml, height: 210, series: [
        { name: L('Missing parcel', 'قطعة مفقودة'), color: '#F2B35A', values: back(scope.filter(ISSUES.noParcel.f).length, 0.07) },
        { name: L('Unit-count mismatch', 'عدم تطابق الوحدات'), color: '#7FA7C2', values: back(scope.filter(ISSUES.noUnits.f).length, 0.05) },
        { name: L('Duplicate / invalid geometry', 'مساقط مكررة / غير سليمة'), color: '#9B8AE0', values: back(scope.filter((b) => qf(b).dup || qf(b).geom).length, 0.09) },
      ] }) });
    const compBars = ui.card({ title: L('Completeness by month', 'الاكتمال شهرياً'), sub: L('Share of records with parcel, units and reference', 'نسبة السجلات المكتملة بالقطعة والوحدات والمرجع'),
      body: B.charts.bars({ labels: ml, height: 200, format: (v) => v + '%', series: [{ name: L('Completeness', 'الاكتمال'), color: '#36D6A0', values: [86, 87, 87, 88, 89, 89, 90, 91, 91, 92, 93, Math.round(all.comp)] }] }) });
    // drill-down
    const drill = D.buildings.filter((b) => (dist === 'all' || b.district === dist) && (cat ? ISSUES[cat].f(b) : qf(b).any));
    let qv = B.get('dq:qv', '');
    const qb = qv ? D.building(qv) : null;
    if (!qb) qv = '';
    const table = dt({
      id: 'dqb', rows: drill, pageSize: 10, select: true, active: qv, defaultSort: 'id', rowAct: (r) => ({ act: 'muDqQv', arg: r.id }),
      bulk: () => `${ui.btn(L('Create correction tasks', 'إنشاء مهام تصحيح'), { kind: 'primary', icon: 'edit', act: 'muDqTask' })}${ui.btn(L('Queue field check', 'إدراج للتحقق الميداني'), { icon: 'pin', act: 'muBulkField', arg: 'dqb' })}`,
      cols: [
        { key: 'id', label: L('BENA ID', 'رقم بينا'), sort: true, render: (r) => ui.idMono(r.id), m: 'sub' },
        { key: 'name', label: L('Building', 'المبنى'), sort: (r) => tx(r.name), m: 'title', mRender: (r) => esc(tx(r.name)), render: (r) => `<div class="mu-cell"><div><b>${esc(tx(r.name))}</b><small>${dName(r.district)}</small></div></div>` },
        { key: 'ref', label: L('Sample municipal ref.', 'المرجع البلدي النموذجي'), render: refCell, hide: !!qv },
        { key: 'flags', label: L('Issues', 'المشكلات'), render: (r) => flagChips(r, qv ? 2 : 3) },
        { key: 'verification', label: L('Verification', 'التحقق'), sort: true, render: (r) => ui.status(r.verification), m: 'end' },
      ],
      empty: { icon: 'checkCircle', title: L('No affected buildings', 'لا توجد مبانٍ متأثرة'), text: L('Nothing matches this category and district.', 'لا شيء يطابق هذه الفئة والحي.') },
    });
    const pane = qb ? (() => { const v = quickView(qb, { close: 'muDqQvX' }); return `<aside class="card mu-pane">${v.head}<div class="mu-pane-b">${v.body}</div><div class="mu-pane-f" style="display:block">${v.acts}</div></aside>`; })() : '';
    const scopeLbl = `${cat ? tx(ISSUES[cat].t) : L('All issues', 'جميع المشكلات')} · ${dist === 'all' ? L('All districts', 'جميع الأحياء') : dName(dist)}`;
    return `${hdr({ title: L('Data Quality Dashboard', 'لوحة جودة البيانات'), sub: L('Completeness, accuracy, consistency and timeliness of building records in the sample area. Select a district or issue to drill down.', 'اكتمال سجلات المباني ودقتها واتساقها وحداثتها في المنطقة النموذجية. اختر حياً أو مشكلة للتعمق.'),
      actions: ui.btn(L('Open in GIS', 'فتح في الخريطة'), { icon: 'map', act: 'muDqGis' }) + ui.btn(L('Quality report', 'تقرير الجودة'), { icon: 'doc', act: 'muRpOpen', arg: 'quality' }) })}
      <div class="stack">
        ${strip([
          { label: L('Quality score', 'مؤشر الجودة'), value: `${all.score}<span style="font-size:13px;color:var(--text-3)">/100</span>`, sub: L('+2.1 pts this quarter', '+2.1 نقطة هذا الربع'), tone: 'ok' },
          { label: L('Completeness', 'الاكتمال'), value: B.pct(all.comp, 1), sub: L('Parcel · units · reference', 'القطعة · الوحدات · المرجع') },
          { label: L('Accuracy', 'الدقة'), value: B.pct(all.acc, 1), sub: L('Geometry & unit checks', 'فحوصات المسقط والوحدات') },
          { label: L('Consistency', 'الاتساق'), value: B.pct(all.cons, 1), sub: L('No duplicates / unlinked', 'بلا تكرار / غير مرتبط') },
          { label: L('Timeliness', 'الحداثة'), value: B.pct(all.time, 1), sub: L('Reviewed in 9 months', 'روجعت خلال 9 أشهر') },
          { label: L('Open issues', 'المشكلات المفتوحة'), value: all.issues, sub: L(`${all.n} records checked`, `${all.n} سجلاً مفحوصاً`), tone: 'warn' },
        ])}
        <div class="grid g-main">
          ${ui.card({ title: L('Quality by district', 'الجودة حسب الحي'), sub: L('Lowest score first — select a row to filter', 'الأقل أولاً — اختر صفاً للتصفية'), cls: 'pad-0', headExtra: dist !== 'all' ? `<button class="btn btn-text" style="height:28px;font-size:12.5px" data-act="muDqDist" data-arg="${dist}">${icon('x')}<span>${L('Clear', 'مسح')}</span></button>` : '', body: matrix }).replace('<div class="card-head">', '<div class="card-head" style="padding:16px 18px 0">')}
          <div class="stack">${trend}</div>
        </div>
        <div><div class="mu-sec" style="margin:4px 0 10px"><span class="grow">${L('Issue categories', 'فئات المشكلات')} · ${dist === 'all' ? L('all districts', 'جميع الأحياء') : dName(dist)}</span>${cat ? `<button class="btn btn-text" style="height:24px;font-size:12px;text-transform:none;letter-spacing:0" data-act="muDqCat" data-arg="${cat}">${icon('x')}<span>${L('Clear category', 'مسح الفئة')}</span></button>` : ''}</div><div class="mu-issues">${issueCards}</div></div>
        <div class="grid g2">${compBars}${ui.card({ title: L('Score distribution', 'توزيع المؤشر'), sub: L('Districts by quality score', 'الأحياء حسب مؤشر الجودة'), body: B.charts.hbars({ data: dRows.slice().reverse().map(({ d, m }) => ({ label: d.name, value: m.score, sub: `${m.issues} ${L('issues', 'مشكلة')}`, color: m.score >= 95 ? '#36D6A0' : m.score >= 90 ? '#7FA7C2' : '#F2B35A' })) }) })}</div>
        <div>
          <div class="mu-toolrow" style="margin-top:4px"><div><h3 style="font-size:16px">${L('Affected buildings', 'المباني المتأثرة')}</h3><div class="xs faint">${scopeLbl} · ${L(`${drill.length} records`, `${drill.length} سجلاً`)}</div></div>${ui.btn(L('Export list', 'تصدير القائمة'), { size: 'sm', icon: 'download', act: 'soon', arg: L('Export', 'التصدير') })}</div>
          ${qb ? `<div class="mu-split">${table}${pane}</div>` : table}
        </div>
      </div>`;
  }
  B.act.muDqTask = () => { const n = selOf('dqb').length; B.vs['dqb:sel'] = []; B.refresh(); B.toast(L(`${n} correction task(s) created for the registry team (demo)`, `أُنشئت ${n} مهام تصحيح لفريق السجل (تجريبي)`)); };

  /* =================================================================
     9 · Building Matching Workspace
     ================================================================= */
  const MC_VIEWS = { toReview: (m) => m.status === 'toReview', deferred: (m) => m.status === 'deferred', matched: (m) => m.status === 'matched', rejected: (m) => m.status === 'rejected', all: () => true };
  B.act.muMcOpen = (id) => { B.vs['mc:sel'] = id; if (B.route.page !== 'matching') B.go(rgo('matching')); else B.refresh(); };
  B.act.muMcAlt = (arg) => { const [id, gis] = arg.split('|'); const m = mcOf(id); if (m) m.pick = gis; B.refresh(); };
  B.act.muMcDec = (arg) => {
    const [id, st] = arg.split(':');
    const m = mcOf(id); if (!m) return;
    const go = () => {
      const ids = B.vs['mc:_ids'] || [];
      m.status = st;
      if (st === 'matched') { const b = D.building(m.b); b.gis = m.pick; b.ref = m.pick === m.ref.gis ? m.ref.ref : `RM/${b.district.slice(0, 2).toUpperCase()}/2026/${b.id.slice(-4)}`; b.source = 'gis'; b.updated = today; b._touched = true; }
      const i = ids.indexOf(id);
      const next = ids.slice(i + 1).concat(ids.slice(0, i)).find((k) => { const y = mcOf(k); return y && y.status === 'toReview'; });
      B.vs['mc:sel'] = next || id;
      B.closeModal(true); B.refresh();
      B.toast({ matched: L('Match accepted — BENA record linked to the sample reference (demo)', 'تم قبول المطابقة — رُبط سجل بينا بالمرجع النموذجي (تجريبي)'), rejected: L('Candidate rejected (demo)', 'تم رفض المرشح (تجريبي)'), deferred: L('Deferred for later review', 'تم التأجيل لمراجعة لاحقة'), toReview: L('Returned to review', 'أعيد للمراجعة') }[st]);
    };
    if (st === 'matched') B.confirm({ title: L('Accept this match?', 'قبول هذه المطابقة؟'), text: L(`The BENA record keeps its ID and is linked to ${m.pick}. Linking a reference does not establish legal ownership.`, `يحتفظ سجل بينا برقمه ويُربط بـ ${m.pick}. لا يُثبت ربط المرجع الملكية القانونية.`), ok: L('Accept match', 'قبول المطابقة'), onOk: go });
    else go();
  };
  function matching() {
    crumbs([[L('Building Matching', 'مطابقة المباني')]]);
    const view = B.get('mc:view', 'toReview'), bnd = B.get('mc:band', 'all'), q = B.get('mc:q', '');
    const base = MC.filter((m) => { const b = D.building(m.b); return (bnd === 'all' || band(m.score) === bnd) && B.match(q, m.id, b.id, b.name, m.ref.gis); });
    const rows = base.filter(MC_VIEWS[view] || MC_VIEWS.toReview).sort(B.by('score', -1));
    B.vs['mc:_ids'] = rows.map((r) => r.id);
    let sel = B.get('mc:sel', '');
    if (!mcOf(sel)) sel = rows[0] ? rows[0].id : '';
    const m = mcOf(sel);
    const vc = (k) => base.filter(MC_VIEWS[k]).length;
    const open = MC.filter((x) => x.status === 'toReview');
    const list = `<div class="card pad-0">
      <div style="padding:12px 14px;border-bottom:1px solid var(--line-2)" class="stack-sm">${ui.search('mc:q', L('Search candidate, BENA ID, ref.', 'ابحث بالمرشح أو رقم بينا أو المرجع'))}
        <div class="mu-views" style="margin-top:8px">${[['all', L('Any', 'الكل')], ['high', L('High', 'عالية')], ['medium', L('Medium', 'متوسطة')], ['low', L('Low', 'منخفضة')]].map(([k, l]) => `<button class="mu-vchip ${bnd === k ? 'on' : ''}" data-act="set" data-arg="mc:band=${k}">${l}</button>`).join('')}</div></div>
      <div class="mu-clist" style="max-height:calc(100dvh - 380px);overflow:auto">${rows.length ? rows.map((r) => { const b = D.building(r.b); return `<button class="${r.id === sel ? 'on' : ''}" data-act="muMcOpen" data-arg="${r.id}"><span style="min-width:0"><b>${esc(tx(b.name))}</b><small><bdi>${b.id}</bdi> → <bdi>${r.ref.gis}</bdi></small><small>${dName(b.district)} · ${L(`overlap ${r.overlap}%`, `تداخل ${r.overlap}%`)}</small></span><span class="r">${confBar(r.score)}${r.status !== 'toReview' ? ui.status(r.status) : ''}</span></button>`; }).join('') : `<div style="padding:20px">${ui.empty({ icon: 'link', title: L('No candidates', 'لا يوجد مرشحون'), text: L('Nothing matches this view.', 'لا شيء يطابق هذا العرض.') })}</div>`}</div></div>`;
    return `${hdr({ title: L('Building Matching Workspace', 'مساحة مطابقة المباني'), sub: L('Match independently submitted BENA records to sample municipal references. Confidence combines footprint overlap, parcel, address and attributes.', 'طابق سجلات بينا المُقدّمة بشكل مستقل مع مراجع بلدية نموذجية. تجمع الثقة بين تداخل المسقط والقطعة والعنوان والسمات.'),
      actions: ui.btn(L('Matching rules', 'قواعد المطابقة'), { icon: 'sliders', go: B.roles[ADMIN] ? `${ADMIN}-rules` : rgo('matching') }) + ui.btn(L('Run auto-suggest', 'تشغيل الاقتراح الآلي'), { icon: 'sparkles', act: 'soon', arg: L('Auto-suggest run', 'تشغيل الاقتراح الآلي') }) })}
      <div class="stack">
        ${strip([
          { label: L('Candidates to review', 'مرشحون للمراجعة'), value: open.length, sub: L('Independent records', 'سجلات مستقلة') },
          { label: L('High confidence', 'ثقة عالية'), value: open.filter((x) => x.score >= 85).length, sub: L('≥ 85%', '≥ 85%'), tone: 'ok', act: 'set', arg: 'mc:band=high' },
          { label: L('Needs judgement', 'تحتاج تقديراً'), value: open.filter((x) => x.score < 85 && x.score >= 65).length, sub: L('65–84%', '65–84%'), tone: 'warn' },
          { label: L('Matched this session', 'طوبقت في هذه الجلسة'), value: MC.filter((x) => x.status === 'matched').length, sub: L('Linked to sample refs', 'مرتبطة بمراجع نموذجية') },
        ])}
        ${views('mc:view', [{ id: 'toReview', label: L('To review', 'للمراجعة'), count: vc('toReview') }, { id: 'deferred', label: L('Deferred', 'مؤجلة'), count: vc('deferred') }, { id: 'matched', label: L('Matched', 'مُطابقة'), count: vc('matched') }, { id: 'rejected', label: L('Rejected', 'مرفوضة'), count: vc('rejected') }, { id: 'all', label: L('All', 'الكل'), count: vc('all') }], view)}
        <div class="mu-split narrow">${list}${m ? matchDetail(m) : `<div class="card">${ui.empty({ icon: 'link', title: L('Select a candidate', 'اختر مرشحاً'), text: L('Choose a candidate to compare records.', 'اختر مرشحاً لمقارنة السجلات.') })}</div>`}</div>
      </div>`;
  }
  function matchDetail(m) {
    const b = D.building(m.b);
    const c = b.poly.reduce((a, p) => [a[0] + p[0] / b.poly.length, a[1] + p[1] / b.poly.length], [0, 0]);
    const rp = b.poly.map((p) => [c[0] + (p[0] - c[0]) * m.ref.s + m.ref.dx, c[1] + (p[1] - c[1]) * m.ref.s + m.ref.dy]);
    const mapId = 'mcm';
    if (B.vs['mcm:_b'] !== b.id) { B.map.focus(mapId, b.id, 90); B.vs['mcm:_b'] = b.id; }
    const pts = (ps) => ps.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    let map = B.map.render({ id: mapId, static: true, mode: 'source', height: '250px', legend: false, layers: { parcels: true, terrain: false }, badge: L('Geometry overlay · sample', 'تراكب المساقط · نموذج') });
    map = map.replace('</svg>', `<g pointer-events="none"><polygon points="${pts(b.poly)}" fill="rgba(54,214,160,.35)" stroke="#0B8A60" stroke-width="1.2"/><polygon points="${pts(rp)}" fill="rgba(20,43,59,.06)" stroke="#142B3B" stroke-width="1" stroke-dasharray="2.4 1.6"/></g></svg>`);
    const open = m.status === 'toReview' || m.status === 'deferred';
    const ar = [
      [L('Footprint overlap', 'تداخل المسقط'), `${m.overlap}%`, `${m.overlap}%`, m.overlap >= 80 ? 'ok' : m.overlap >= 60 ? 'partial' : 'bad', 40, Math.round(m.overlap * 0.4)],
      [L('Parcel', 'القطعة'), parcelTxt(b.parcel), parcelTxt(m.ref.parcel), m.parcelSame ? 'ok' : 'bad', 25, m.parcelSame ? 25 : 6],
      [L('Address', 'العنوان'), esc(tx(b.name)), esc(tx(m.ref.addr)), m.addrSame ? 'ok' : 'partial', 15, m.addrSame ? 15 : 5],
      [L('Units', 'الوحدات'), B.num(b.units), B.num(m.ref.units), b.units === m.ref.units ? 'ok' : Math.abs(b.units - m.ref.units) === 1 ? 'partial' : 'bad', 10, b.units === m.ref.units ? 10 : Math.abs(b.units - m.ref.units) === 1 ? 6 : 2],
      [L('Floors', 'الطوابق'), B.num(b.floors), B.num(m.ref.floors), b.floors === m.ref.floors ? 'ok' : 'partial', 10, b.floors === m.ref.floors ? 10 : 4],
      [L('Building type', 'نوع المبنى'), D.typeLabel(b.type), D.typeLabel(m.ref.type), b.type === m.ref.type ? 'ok' : 'partial', 0, 0],
    ];
    const mi = (s) => (s === 'ok' ? `<span class="mi" style="color:var(--ok)">${icon('checkCircle')}</span>` : s === 'partial' ? `<span class="mi" style="color:var(--warn)">${icon('alertCircle')}</span>` : `<span class="mi" style="color:var(--bad)">${icon('xCircle')}</span>`);
    const table = `<table class="mu-cmp"><thead><tr><th>${L('Attribute', 'السمة')}</th><th>${L('BENA record', 'سجل بينا')}<br>${ui.prov('submitted')}</th><th>${L('Sample municipal ref.', 'المرجع البلدي النموذجي')}<br>${ui.prov('official')}</th></tr></thead><tbody>${ar.map(([k, a, r, s]) => `<tr class="${s !== 'ok' ? 'hl' : ''}"><td>${k}</td><td>${a}</td><td>${mi(s)}${r}</td></tr>`).join('')}</tbody></table>`;
    const breakdown = `<div class="mu-cbk">${ar.filter((x) => x[4]).map(([k, , , s, w, got]) => `<span>${k} <span class="xs faint">(${w})</span></span><b>${got}</b><span class="tr"><i style="width:${(got / w) * 100}%;background:${s === 'ok' ? 'var(--mint)' : s === 'partial' ? '#E9A23B' : 'var(--bad)'}"></i></span>`).join('')}</div>`;
    const alts = `<div class="mu-alt">${[{ gis: m.ref.gis, score: m.score, overlap: m.overlap, note: T('Best candidate', 'أفضل مرشح') }].concat(m.alts).map((a) => `<label class="${m.pick === a.gis ? 'on' : ''}" data-act="${open ? 'muMcAlt' : 'muMeasNoop'}" data-arg="${m.id}|${a.gis}"><input type="radio" name="mcalt" ${m.pick === a.gis ? 'checked' : ''} ${open ? '' : 'disabled'} tabindex="-1"><span style="min-width:0"><b class="id-mono">${a.gis}</b><small>${tx(a.note)} · ${L(`overlap ${a.overlap}%`, `تداخل ${a.overlap}%`)}</small></span>${confBar(a.score)}</label>`).join('')}</div>`;
    return `<div class="stack">
      <section class="card">
        <div class="row between wrap" style="gap:12px;align-items:flex-start">
          <div style="min-width:0"><div class="row-sm wrap" style="margin-bottom:6px">${ui.idMono(m.id)}${ui.status(m.status)}${ui.badge(band(m.score) === 'high' ? L('High confidence', 'ثقة عالية') : band(m.score) === 'medium' ? L('Medium confidence', 'ثقة متوسطة') : L('Low confidence', 'ثقة منخفضة'), band(m.score) === 'high' ? 'ok' : band(m.score) === 'medium' ? 'warn' : 'bad')}</div>
            <h2 style="font-size:18px">${esc(tx(b.name))}</h2>
            <div class="rq-meta"><span>${icon('fingerprint')}<bdi>${b.id}</bdi></span><span>${icon('link')}<bdi>${m.pick}</bdi></span><span>${icon('pin')}${dName(b.district)}</span></div></div>
          <div class="mu-ring">${B.charts.ring ? B.charts.ring(m.score, { size: 64, color: m.score >= 85 ? '#36D6A0' : m.score >= 65 ? '#F2B35A' : '#E58A7B', label: `${m.score}%` }) : `<b>${m.score}%</b>`}<div><div class="xs faint">${L('Match confidence', 'ثقة المطابقة')}</div><b style="font-size:13px">${L('Weighted score', 'درجة مرجّحة')}</b></div></div>
        </div>
      </section>
      <div class="grid g2">
        <section class="card pad-0">${map}<div class="mu-geoleg"><span><i style="background:rgba(54,214,160,.35);border:1.5px solid #0B8A60"></i>${L('BENA footprint (submitted)', 'مسقط بينا (مُقدّم)')}</span><span><i style="border:1.5px dashed #142B3B"></i>${L('Sample municipal footprint', 'المسقط البلدي النموذجي')}</span></div></section>
        ${ui.card({ title: L('Confidence breakdown', 'تفصيل الثقة'), sub: L('Weights in brackets', 'الأوزان بين قوسين'), body: breakdown })}
      </div>
      ${ui.card({ title: L('Side-by-side attributes', 'مقارنة السمات'), sub: L(`${ar.filter((x) => x[3] === 'ok').length} of ${ar.length} attributes match`, `${ar.filter((x) => x[3] === 'ok').length} من ${ar.length} سمات متطابقة`), body: table })}
      ${ui.card({ title: L('Candidate references', 'المراجع المرشحة'), sub: L('Choose which sample reference to link', 'اختر المرجع النموذجي المراد ربطه'), body: alts,
        foot: `<div class="rq-actbar">${open ? `${ui.btn(L('Accept match', 'قبول المطابقة'), { kind: 'primary', icon: 'check', act: 'muMcDec', arg: `${m.id}:matched` })}${ui.btn(L('Defer', 'تأجيل'), { icon: 'clock', act: 'muMcDec', arg: `${m.id}:deferred` })}${ui.btn(L('Reject', 'رفض'), { kind: 'danger', icon: 'xCircle', act: 'muMcDec', arg: `${m.id}:rejected` })}` : ui.btn(L('Return to review', 'إعادة للمراجعة'), { icon: 'refresh', act: 'muMcDec', arg: `${m.id}:toReview` })}${ui.btn(L('Building Identity', 'هوية المبنى'), { icon: 'fingerprint', go: rgo(`building-${b.id}`) })}</div>` })}
      <div class="mu-own" style="margin-top:0">${icon('info')}<span>${L('Matching links a BENA record to an external sample reference. The BENA Building ID is a digital reference identity, not proof of ownership.', 'تربط المطابقة سجل بينا بمرجع خارجي نموذجي. رقم بينا للمبنى هوية رقمية مرجعية وليس إثباتاً للملكية.')}</span></div>
    </div>`;
  }

  /* =================================================================
     11 · Reports
     ================================================================= */
  const C = D.city;
  const RPT = [
    { id: 'registry', grp: T('Registry', 'السجل'), icon: 'building', t: T('Monthly registry summary', 'ملخص السجل الشهري'), freq: T('Monthly', 'شهري'), last: '2026-11-01', fmt: 'PDF · XLSX' },
    { id: 'stock', grp: T('Registry', 'السجل'), icon: 'pie', t: T('Building stock by type & district', 'رصيد المباني حسب النوع والحي'), freq: T('Quarterly', 'ربع سنوي'), last: '2026-10-01', fmt: 'PDF · CSV' },
    { id: 'independent', grp: T('Registry', 'السجل'), icon: 'userCheck', t: T('Independent registrations', 'التسجيلات المستقلة'), freq: T('Monthly', 'شهري'), last: '2026-11-01', fmt: 'XLSX' },
    { id: 'sla', grp: T('Operations', 'العمليات'), icon: 'clock', t: T('Verification SLA report', 'تقرير مهلة التحقق'), freq: T('Weekly', 'أسبوعي'), last: '2026-11-23', fmt: 'PDF' },
    { id: 'corrections', grp: T('Operations', 'العمليات'), icon: 'edit', t: T('Correction request outcomes', 'نتائج طلبات التصحيح'), freq: T('Monthly', 'شهري'), last: '2026-11-01', fmt: 'PDF · CSV' },
    { id: 'quality', grp: T('Data', 'البيانات'), icon: 'shieldCheck', t: T('Data quality by district', 'جودة البيانات حسب الحي'), freq: T('Monthly', 'شهري'), last: '2026-11-01', fmt: 'PDF' },
    { id: 'sync', grp: T('Data', 'البيانات'), icon: 'refresh', t: T('GIS sync log', 'سجل مزامنة نظم المعلومات'), freq: T('Daily', 'يومي'), last: '2026-11-25', fmt: 'CSV' },
    { id: 'audit', grp: T('Governance', 'الحوكمة'), icon: 'history', t: T('Audit extract', 'مستخرج سجل التدقيق'), freq: T('On demand', 'عند الطلب'), last: '2026-11-18', fmt: 'CSV' },
  ];
  B.act.muRpOpen = (id) => { B.vs['rp:sel'] = id; B.go(rgo('reports')); };
  B.act.muRpGen = () => { B.vs['rp:gen'] = (B.get('rp:gen', 0) || 0) + 1; B.refresh(); B.toast(L('Report regenerated with current filters', 'أعيد إنشاء التقرير بعوامل التصفية الحالية')); };
  B.act.muRpSched = () => B.modal({ title: L('Schedule report', 'جدولة التقرير'), sub: tx((RPT.find((r) => r.id === B.get('rp:sel', 'registry')) || RPT[0]).t), size: 'sm', form: 'muRpSched',
    body: `<div class="form-grid">${ui.field({ name: 'freq', label: L('Frequency', 'التكرار'), type: 'select', full: true, options: [{ v: 'w', l: L('Weekly (Sunday 07:00)', 'أسبوعياً (الأحد 07:00)') }, { v: 'm', l: L('Monthly (1st, 07:00)', 'شهرياً (اليوم الأول 07:00)') }] })}${ui.field({ name: 'to', label: L('Send to', 'إرسال إلى'), type: 'email', full: true, required: true, value: 'gis.office@sample-municipality.example' })}</div>`,
    foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Schedule', 'جدولة'), { kind: 'primary', type: 'submit', icon: 'calendar' })}` });
  B.submit.muRpSched = () => B.success({ title: L('Report scheduled', 'تمت جدولة التقرير'), text: L('Recipients will get a link to the generated report (demo).', 'سيتلقى المستلمون رابطاً للتقرير المُنشأ (تجريبي).'), ref: B.uid('SCH') });
  const rptBuild = (id, dist) => {
    const ds = dist === 'all' ? D.districts : D.districts.filter((d) => d.id === dist);
    const sum = (f) => B.sum(ds, f);
    if (id === 'sla') { const o = vqOpen(); return { k: [[L('Open items', 'عناصر مفتوحة'), o.length], [L('Over SLA', 'تجاوزت المهلة'), o.filter((x) => x.age > SLA).length], [L('Avg. age (d)', 'متوسط العمر (يوم)'), B.num1(B.sum(o, (x) => x.age) / Math.max(1, o.length))], [L('SLA target', 'هدف المهلة'), `${SLA} d`]], chart: B.charts.bars({ labels: ['0–3', '4–7', '8–11', '12–14', '15–21', '22+'], height: 120, series: [{ name: L('Items', 'عناصر'), color: '#142B3B', values: [[0, 3], [4, 7], [8, 11], [12, 14], [15, 21], [22, 99]].map(([a, z]) => o.filter((x) => x.age >= a && x.age <= z).length) }] }), cols: [L('Reviewer', 'المراجع'), L('Open', 'مفتوحة'), L('Over SLA', 'متجاوزة'), L('High risk', 'عالية المخاطر')], rows: REVIEWERS.map((p) => [esc(D.pname(p)), o.filter((x) => x.who === p).length, o.filter((x) => x.who === p && x.age > SLA).length, o.filter((x) => x.who === p && x.risk === 'high').length]) }; }
    if (id === 'quality') { return { k: [[L('Score', 'المؤشر'), dqDistrict(dist).score], [L('Completeness', 'الاكتمال'), B.pct(dqDistrict(dist).comp, 1)], [L('Accuracy', 'الدقة'), B.pct(dqDistrict(dist).acc, 1)], [L('Issues', 'المشكلات'), dqDistrict(dist).issues]], chart: B.charts.bars({ labels: ds.map((d) => d.name), height: 120, series: [{ name: L('Score', 'المؤشر'), color: '#36D6A0', values: ds.map((d) => dqDistrict(d.id).score) }] }), cols: [L('District', 'الحي'), L('Completeness', 'الاكتمال'), L('Accuracy', 'الدقة'), L('Score', 'المؤشر')], rows: ds.map((d) => { const m = dqDistrict(d.id); return [tx(d.name), B.pct(m.comp, 1), B.pct(m.acc, 1), m.score]; }) }; }
    if (id === 'corrections') return { k: [[L('Requests', 'الطلبات'), COR.length], [L('Applied', 'مُطبّقة'), COR.filter((c) => ['applied', 'partiallyApplied'].includes(c.status)).length], [L('Rejected', 'مرفوضة'), COR.filter((c) => c.status === 'rejected').length], [L('Open', 'مفتوحة'), COR.filter((c) => COR_OPEN.includes(c.status)).length]], chart: B.charts.bars({ labels: Object.keys(FL).map((k) => FL[k]), height: 120, series: [{ name: L('Fields', 'حقول'), color: '#7FA7C2', values: Object.keys(FL).map((k) => B.sum(COR, (c) => c.changes.filter((x) => x.f === k).length)) }] }), cols: [L('Request', 'الطلب'), L('Building', 'المبنى'), L('Fields', 'الحقول'), L('Status', 'الحالة')], rows: COR.map((c) => [`<bdi>${c.id}</bdi>`, `<bdi>${c.b}</bdi>`, c.changes.length, ui.statusLabel(c.status)]) };
    if (id === 'sync' || id === 'audit') return { k: [[L('Events', 'الأحداث'), id === 'sync' ? 233 : AUDIT.length], [L('Errors', 'الأخطاء'), id === 'sync' ? 1 : 0], [L('Sources', 'المصادر'), M.LAYERS.length], [L('Period', 'الفترة'), L('7 days', '7 أيام')]], chart: B.charts.bars({ labels: ['19', '20', '21', '22', '23', '24', '25'], height: 120, series: [{ name: L('Events', 'الأحداث'), color: '#142B3B', values: [176, 158, 201, 122, 90, 214, 233] }] }), cols: [L('Time', 'الوقت'), L('Source / actor', 'المصدر / المنفّذ'), L('Event', 'الحدث'), L('Result', 'النتيجة')], rows: (id === 'sync' ? M.LAYERS.map((l) => [`<span class="ltr">${l.last}</span>`, tx(l.name), L('Scheduled sync', 'مزامنة مجدولة'), ui.statusLabel(l.status)]) : AUDIT.slice(0, 7).map((a) => [`<span class="ltr">${a.t}</span>`, esc(D.pname(a.who)), tx(a.what), tx(a.ent)])) };
    const tot = sum((d) => d.buildings), gis = sum((d) => d.gis);
    return { k: [[L('Buildings', 'المباني'), B.num(tot)], [L('Linked', 'مرتبطة'), B.pct(pct(gis, tot), 1)], [L('Independent', 'مستقلة'), B.num(tot - gis)], [L('Units', 'الوحدات'), B.num(sum((d) => d.units))]],
      chart: B.charts.bars({ labels: M.months(), height: 120, series: [{ name: L('Via municipal GIS', 'عبر نظم المعلومات'), color: '#36D6A0', values: C.trend.map((v, i) => v - C.trendIndependent[i]) }, { name: L('Independent', 'مستقلة'), color: '#9B8AE0', values: C.trendIndependent }] }),
      cols: [L('District', 'الحي'), L('Buildings', 'المباني'), L('Linked', 'مرتبطة'), L('Units', 'الوحدات')], rows: ds.map((d) => [tx(d.name), B.num(d.buildings), B.pct(pct(d.gis, d.buildings), 1), B.num(d.units)]) };
  };
  function reports() {
    crumbs([[L('Reports', 'التقارير')]]);
    const sel = B.get('rp:sel', 'registry'), per = B.get('rp:per', 'nov'), dist = B.get('rp:dist', 'all'), fmt = B.get('rp:fmt', 'pdf');
    const r = RPT.find((x) => x.id === sel) || RPT[0];
    const grps = [...new Set(RPT.map((x) => tx(x.grp)))];
    const cat = `<div class="card pad-0"><div class="mu-rpt">${grps.map((g) => `<div class="grp">${g}</div>${RPT.filter((x) => tx(x.grp) === g).map((x) => `<button class="${x.id === r.id ? 'on' : ''}" data-act="set" data-arg="rp:sel=${x.id}"><span class="li-icon ${x.id === r.id ? 'navy' : ''}">${icon(x.icon)}</span><span style="min-width:0"><b>${tx(x.t)}</b><small>${tx(x.freq)} · ${x.fmt}</small></span><span class="xs faint nowrap">${B.dateShort(x.last)}</span></button>`).join('')}`).join('')}</div></div>`;
    const data = rptBuild(r.id, dist);
    const perL = { nov: L('November 2026', 'تشرين الثاني 2026'), q4: L('Q4 2026 to date', 'الربع الرابع 2026 حتى الآن'), ytd: L('Year to date 2026', 'منذ بداية 2026') }[per];
    const gen = B.get('rp:gen', 0);
    const paper = `<div class="mu-paper-wrap"><div class="mu-paper" data-wm="${esc(L('SAMPLE', 'نموذج'))}">
      <div class="ph"><div><div class="row-sm" style="margin-bottom:8px">${B.logo(22)}<b style="font-family:var(--font-display)">BENA</b><span class="xs faint">· ${M.orgName()}</span></div><h2>${tx(r.t)}</h2><div class="xs faint" style="margin-top:4px">${perL} · ${dist === 'all' ? L('All districts', 'جميع الأحياء') : dName(dist)}</div></div>
        <div class="xs faint" style="text-align:end">${L('Generated', 'أُنشئ')} <span class="ltr">2026-11-25 ${String(10 + (gen % 8)).padStart(2, '0')}:${String(4 + gen * 7 % 50).padStart(2, '0')}</span><br>${L('by Eng. Maha Awad', 'بواسطة م. مها عوض')}<br>${ui.prov('demo')}</div></div>
      <div class="pk">${data.k.map(([l, v]) => `<div><span>${l}</span><b>${v}</b></div>`).join('')}</div>
      <div>${data.chart}</div>
      <table><thead><tr>${data.cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${data.rows.slice(0, 8).map((row) => `<tr>${row.map((v) => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <div class="pf"><span>${L('Sample report — fictional demonstration data. Not an official municipal document.', 'تقرير نموذجي — بيانات توضيحية وهمية. ليس وثيقة بلدية رسمية.')}</span><span>1 / 1</span></div>
    </div></div>`;
    const recent = [['registry', '2026-11-01', 'PDF'], ['sla', '2026-11-23', 'PDF'], ['sync', '2026-11-25', 'CSV'], ['quality', '2026-11-01', 'PDF'], ['audit', '2026-11-18', 'CSV']].map(([id, d, f]) => { const x = RPT.find((y) => y.id === id); return ui.li({ icon: f === 'CSV' ? 'database' : 'doc', title: tx(x.t), sub: `${B.date(d)} · ${f} · ${esc(D.pname(id === 'audit' ? 'p_mu_samah' : 'p_maha'))}`, end: icon('download', 'chev'), act: 'soon', arg: L('Download', 'التنزيل') }); });
    return `${hdr({ title: L('Reports', 'التقارير'), unit: adminUnit(), sub: L('Report catalogue with a live preview. Exports are simulated and contain sample data only.', 'دليل التقارير مع معاينة مباشرة. عمليات التصدير محاكاة وتحتوي بيانات نموذجية فقط.'),
      actions: ui.btn(L('Schedule', 'جدولة'), { icon: 'calendar', act: 'muRpSched' }) + ui.btn(L(`Export ${fmt.toUpperCase()}`, `تصدير ${fmt.toUpperCase()}`), { kind: 'primary', icon: 'download', act: 'soon', arg: L(`${fmt.toUpperCase()} export`, `تصدير ${fmt.toUpperCase()}`) }) })}
      <div class="mu-split narrow">
        <div class="stack">${cat}${ui.card({ title: L('Recent exports', 'آخر عمليات التصدير'), body: ui.list(recent) })}</div>
        <div class="stack">
          <div class="card" style="padding:12px 14px"><div class="mu-fbar">
            ${ui.select('rp:per', [{ v: 'nov', l: L('November 2026', 'تشرين الثاني 2026') }, { v: 'q4', l: L('Q4 2026 to date', 'الربع الرابع 2026') }, { v: 'ytd', l: L('Year to date', 'منذ بداية العام') }], { def: 'nov', label: L('Period', 'الفترة') })}
            ${ui.select('rp:dist', M.optsDist(), { def: 'all', label: L('District', 'الحي') })}
            ${ui.seg('rp:fmt', [{ id: 'pdf', label: 'PDF' }, { id: 'xlsx', label: 'XLSX' }, { id: 'csv', label: 'CSV' }], fmt)}
            <span class="grow"></span>${ui.btn(L('Regenerate', 'إعادة الإنشاء'), { size: 'sm', icon: 'refresh', act: 'muRpGen' })}${ui.btn('', { size: 'sm', icon: 'share', act: 'soon', arg: L('Sharing', 'المشاركة'), title: L('Share', 'مشاركة') })}
          </div></div>
          ${paper}
        </div>
      </div>`;
  }

  /* =================================================================
     13 · User & Permission Overview (read-only) / admin users
     ================================================================= */
  const ROLES = {
    lead: { t: T('GIS & Registry Lead', 'رئيس نظم المعلومات والسجل'), tone: 'navy' },
    admin: { t: T('Municipal Administrator', 'مسؤول البلدية'), tone: 'violet' },
    analyst: { t: T('GIS Analyst', 'محلل نظم معلومات'), tone: 'info' },
    officer: { t: T('Registry Officer', 'موظف السجل'), tone: 'mint' },
    reviewer: { t: T('Verification Reviewer', 'مراجع التحقق'), tone: 'warn' },
    surveyor: { t: T('Field Surveyor', 'مسّاح ميداني'), tone: 'neutral' },
    viewer: { t: T('Read-only viewer', 'مستعرض فقط'), tone: 'outline' },
  };
  const PERMS = [
    ['view', T('View registry & GIS map', 'عرض السجل والخريطة'), T('Read buildings, layers, requests', 'قراءة المباني والطبقات والطلبات'), { lead: 2, admin: 2, analyst: 2, officer: 2, reviewer: 2, surveyor: 2, viewer: 2 }],
    ['edit', T('Edit building attributes', 'تعديل سمات المباني'), T('Type, floors, units, parcel', 'النوع والطوابق والوحدات والقطعة'), { lead: 2, admin: 0, analyst: 2, officer: 2, reviewer: 0, surveyor: 1, viewer: 0 }],
    ['verify', T('Verify building records', 'توثيق سجلات المباني'), T('Decisions in the verification queue', 'القرارات في قائمة التحقق'), { lead: 2, admin: 0, analyst: 1, officer: 0, reviewer: 2, surveyor: 0, viewer: 0 }],
    ['approve', T('Approve registration requests', 'اعتماد طلبات التسجيل'), T('New registrations & duplicates', 'التسجيلات الجديدة والتكرارات'), { lead: 2, admin: 0, analyst: 0, officer: 2, reviewer: 1, surveyor: 0, viewer: 0 }],
    ['correct', T('Apply corrections', 'تطبيق التصحيحات'), T('Field-level changes', 'التغييرات على مستوى الحقول'), { lead: 2, admin: 0, analyst: 1, officer: 2, reviewer: 0, surveyor: 0, viewer: 0 }],
    ['match', T('Match & link references', 'المطابقة والربط بالمراجع'), T('Matching workspace', 'مساحة المطابقة'), { lead: 2, admin: 0, analyst: 2, officer: 1, reviewer: 0, surveyor: 0, viewer: 0 }],
    ['sources', T('Manage data sources', 'إدارة مصادر البيانات'), T('Sync schedules, feeds', 'جداول المزامنة والمصادر'), { lead: 1, admin: 2, analyst: 1, officer: 0, reviewer: 0, surveyor: 0, viewer: 0 }],
    ['export', T('Export reports', 'تصدير التقارير'), T('PDF, XLSX, CSV', 'PDF وXLSX وCSV'), { lead: 2, admin: 2, analyst: 2, officer: 1, reviewer: 1, surveyor: 0, viewer: 1 }],
    ['users', T('Manage users & roles', 'إدارة المستخدمين والأدوار'), T('Invite, suspend, assign roles', 'دعوة وإيقاف وإسناد الأدوار'), { lead: 0, admin: 2, analyst: 0, officer: 0, reviewer: 0, surveyor: 0, viewer: 0 }],
    ['audit', T('View audit trail', 'عرض سجل التدقيق'), T('All tenant activity', 'كامل نشاط الجهة'), { lead: 1, admin: 2, analyst: 0, officer: 0, reviewer: 0, surveyor: 0, viewer: 0 }],
  ];
  const wsLbl = (id) => tx((M.WORKSPACES.find((w) => w.id === id) || {}).label || id).replace(/ \(.*\)$/, '');
  B.act.muUserQv = (id) => { B.vs['us:qv'] = B.get('us:qv', '') === id ? '' : id; B.refresh(); };
  B.act.muInvite = () => B.modal({ title: L('Invite a staff member', 'دعوة موظف'), sub: L('Sends a BENA invitation for this municipal tenant (demo).', 'يرسل دعوة بينا لهذه الجهة البلدية (تجريبي).'), form: 'muInvite', size: 'md',
    body: `<div class="form-grid">${ui.field({ name: 'name', label: L('Full name', 'الاسم الكامل'), required: true })}${ui.field({ name: 'email', label: L('Work email', 'البريد الوظيفي'), type: 'email', required: true, placeholder: 'name@sample-municipality.example' })}
      ${ui.field({ name: 'role', label: L('Role', 'الدور'), type: 'select', options: Object.keys(ROLES).map((k) => ({ v: k, l: ROLES[k].t })) })}${ui.field({ name: 'ws', label: L('Workspace', 'مساحة العمل'), type: 'select', options: M.WORKSPACES.map((w) => ({ v: w.id, l: w.label })) })}</div>
      <label class="check" style="margin-top:12px"><input type="checkbox" name="mfa" checked><span>${L('Require two-factor authentication', 'اشتراط المصادقة الثنائية')}</span></label>`,
    foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send invitation', 'إرسال الدعوة'), { kind: 'primary', type: 'submit', icon: 'send' })}` });
  B.submit.muInvite = (d) => B.success({ title: L('Invitation sent', 'تم إرسال الدعوة'), text: L(`${esc(d.name || 'The user')} will appear as “Invited” until they accept (demo).`, `سيظهر ${esc(d.name || 'المستخدم')} كـ«تمت الدعوة» حتى يقبل (تجريبي).`), ref: B.uid('INV') });
  B.act.muUserSt = (arg) => { const [id, st] = arg.split(':'); const s = M.STAFF.find((x) => x.id === id); if (s) s.status = st; B.refresh(); B.toast(st === 'suspended' ? L('User suspended (demo)', 'تم إيقاف المستخدم (تجريبي)') : L('User reactivated (demo)', 'تمت إعادة تفعيل المستخدم (تجريبي)')); };
  B.act.muUserRole = (id) => { const s = M.STAFF.find((x) => x.id === id); B.modal({ title: L('Change role', 'تغيير الدور'), sub: esc(D.pname(id)), size: 'sm', form: 'muUserRole', body: `<input type="hidden" name="id" value="${id}">${ui.field({ name: 'role', label: L('Role', 'الدور'), type: 'select', value: s.role, options: Object.keys(ROLES).map((k) => ({ v: k, l: ROLES[k].t })) })}`, foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Save', 'حفظ'), { kind: 'primary', type: 'submit', icon: 'check' })}` }); };
  B.submit.muUserRole = (d) => { const s = M.STAFF.find((x) => x.id === d.id); if (s && d.role) s.role = d.role; B.closeModal(true); B.refresh(); B.toast(L('Role updated (demo)', 'تم تحديث الدور (تجريبي)')); };

  function users() {
    const admin = isAdmin();
    crumbs([[admin ? L('Users & Roles', 'المستخدمون والأدوار') : L('Users & Permissions', 'المستخدمون والصلاحيات')]]);
    const q = B.get('us:q', ''), rf = B.get('us:role', 'all'), hr = B.get('us:hl', '');
    const rows = M.STAFF.filter((s) => (rf === 'all' || s.role === rf) && B.match(q, D.person(s.id).name, s.id, s.unit));
    let qv = B.get('us:qv', '');
    const qs = qv ? M.STAFF.find((s) => s.id === qv) : null;
    if (!qs) qv = '';
    const table = dt({
      id: 'us', rows, select: admin, active: qv, defaultSort: 'name', rowAct: (r) => ({ act: 'muUserQv', arg: r.id }),
      bulk: () => `${ui.btn(L('Require 2FA', 'اشتراط المصادقة الثنائية'), { icon: 'shield', act: 'toast', arg: L('2FA required for selected users (demo)', 'تم اشتراط المصادقة الثنائية للمستخدمين المحددين (تجريبي)') })}${ui.btn(L('Export', 'تصدير'), { icon: 'download', act: 'soon', arg: L('Export', 'التصدير') })}`,
      cols: [
        { key: 'name', label: L('Staff member', 'الموظف'), sort: (r) => D.pname(r.id), m: 'title', mRender: (r) => esc(D.pname(r.id)), render: (r) => `<div class="mu-cell">${ui.avatar(D.person(r.id).name)}<div><b>${esc(D.pname(r.id))}</b><small>${esc(D.person(r.id).email || `${r.id.replace('p_mu_', '').replace('p_', '')}@sample-municipality.example`)}</small></div></div>` },
        { key: 'role', label: L('Role', 'الدور'), sort: (r) => tx(ROLES[r.role].t), render: (r) => ui.badge(ROLES[r.role].t, ROLES[r.role].tone), m: 'sub' },
        { key: 'unit', label: L('Unit', 'الوحدة'), sort: (r) => tx(r.unit), render: (r) => `<span class="small">${tx(r.unit)}</span>`, hide: !!qv },
        { key: 'ws', label: L('Workspaces', 'مساحات العمل'), render: (r) => `<span class="mu-ws">${r.ws.map((w) => `<span>${wsLbl(w)}</span>`).join('')}</span>`, hide: !!qv },
        { key: 'mfa', label: L('2FA', 'المصادقة الثنائية'), sort: (r) => (r.mfa ? 1 : 0), render: (r) => (r.mfa ? `<span class="badge ok">${icon('shieldCheck')}${L('On', 'مفعّلة')}</span>` : `<span class="badge warn">${icon('alert')}${L('Off', 'غير مفعّلة')}</span>`) },
        { key: 'last', label: L('Last active', 'آخر نشاط'), sort: (r) => r.last || '', render: (r) => `<span class="small nowrap">${r.last ? B.ago(r.last) : '—'}</span>`, m: 'meta' },
        { key: 'status', label: L('Status', 'الحالة'), sort: true, render: (r) => ui.status(r.status), m: 'end' },
      ],
    });
    const pane = qs ? `<aside class="card mu-pane"><div class="mu-pane-h">${ui.avatar(D.person(qs.id).name)}<div class="grow" style="min-width:0"><h3 style="font-size:16px">${esc(D.pname(qs.id))}</h3><div class="xs faint">${tx(ROLES[qs.role].t)} · ${tx(qs.unit)}</div></div><button class="icon-btn" style="width:32px;height:32px" data-act="muUserQv" data-arg="${qs.id}" aria-label="${L('Close', 'إغلاق')}">${icon('x')}</button></div>
      <div class="mu-pane-b">${attrs([[L('Status', 'الحالة'), ui.status(qs.status)], [L('Role', 'الدور'), ui.badge(ROLES[qs.role].t, ROLES[qs.role].tone)], [L('Workspaces', 'مساحات العمل'), `<span class="mu-ws">${qs.ws.map((w) => `<span>${wsLbl(w)}</span>`).join('')}</span>`], [L('Two-factor auth', 'المصادقة الثنائية'), qs.mfa ? L('Enabled', 'مفعّلة') : L('Not enabled', 'غير مفعّلة')], [L('Last active', 'آخر نشاط'), qs.last ? B.date(qs.last) : '—']])}
        <div class="mu-sec">${L('Effective permissions', 'الصلاحيات الفعلية')}</div>
        <div class="rq-checks">${PERMS.map(([, t, , v]) => `<div class="${v[qs.role] ? 'ok' : ''}" style="${v[qs.role] ? '' : 'color:var(--text-3)'}">${icon(v[qs.role] === 2 ? 'checkCircle' : v[qs.role] === 1 ? 'alertCircle' : 'minus')}<span>${tx(t)}${v[qs.role] === 1 ? ` <span class="xs faint">(${L('limited', 'محدودة')})</span>` : ''}</span></div>`).join('')}</div>
      </div>
      ${admin ? `<div class="mu-pane-f">${ui.btn(L('Change role', 'تغيير الدور'), { icon: 'key', act: 'muUserRole', arg: qs.id })}${qs.status === 'suspended' ? ui.btn(L('Reactivate', 'إعادة التفعيل'), { icon: 'refresh', act: 'muUserSt', arg: `${qs.id}:active` }) : ui.btn(L('Suspend', 'إيقاف'), { kind: 'danger', icon: 'lock', act: 'muUserSt', arg: `${qs.id}:suspended` })}</div>` : `<div class="mu-pane-f">${ui.btn(L('Request a change', 'طلب تغيير'), { icon: 'send', act: 'toast', arg: L('Change request sent to the Municipal Administrator (demo)', 'أُرسل طلب التغيير إلى مسؤول البلدية (تجريبي)') })}</div>`}</aside>` : '';
    const roleKeys = Object.keys(ROLES);
    const pc = (v, on) => `<td class="${on ? 'on' : ''}">${v === 2 ? `<span class="pf" title="${esc(L('Full', 'كاملة'))}">${icon('check')}</span>` : v === 1 ? `<span class="pp" title="${esc(L('Limited', 'محدودة'))}">${icon('minus')}</span>` : `<span class="pn">${icon('x')}</span>`}</td>`;
    const matrix = `<div class="table-wrap"><table class="mu-pm"><thead><tr><th>${L('Permission', 'الصلاحية')}</th>${roleKeys.map((k) => `<th class="${hr === k ? 'on' : ''}" data-act="set" data-arg="us:hl=${hr === k ? '' : k}" style="cursor:pointer">${tx(ROLES[k].t)}<div class="xs" style="font-weight:500;margin-top:2px">${M.STAFF.filter((s) => s.role === k).length} ${L('users', 'مستخدم')}</div></th>`).join('')}</tr></thead><tbody>
      ${PERMS.map(([, t, d, v]) => `<tr><td><b>${tx(t)}</b><small>${tx(d)}</small></td>${roleKeys.map((k) => pc(v[k], hr === k)).join('')}</tr>`).join('')}</tbody></table></div>
      <div class="mu-geoleg"><span><span class="pf" style="display:inline-grid;place-items:center;width:18px;height:18px;border-radius:5px;background:var(--ok-bg);color:var(--ok)">${icon('check')}</span>${L('Full access', 'وصول كامل')}</span><span><span style="display:inline-grid;place-items:center;width:18px;height:18px;border-radius:5px;background:var(--warn-bg);color:var(--warn)">${icon('minus')}</span>${L('Limited (own district / draft only)', 'محدود (الحي الخاص / المسودات فقط)')}</span><span>${L('Select a role column to highlight it', 'اختر عمود دور لتمييزه')}</span></div>`;
    return `${hdr({ title: admin ? L('Users & Roles', 'المستخدمون والأدوار') : L('User & Permission Overview', 'نظرة عامة على المستخدمين والصلاحيات'), unit: adminUnit(), sub: admin ? L('Manage municipal staff accounts, roles and workspace access for this tenant (demo).', 'إدارة حسابات موظفي البلدية وأدوارهم والوصول إلى مساحات العمل لهذه الجهة (تجريبي).') : L('Read-only overview of municipal staff, roles and permissions. Changes are made by the Municipal Administrator.', 'نظرة للقراءة فقط على موظفي البلدية وأدوارهم وصلاحياتهم. يجري مسؤول البلدية التغييرات.'),
      actions: admin ? ui.btn(L('Audit trail', 'سجل التدقيق'), { icon: 'history', go: `${ADMIN}-audit` }) + ui.btn(L('Invite user', 'دعوة مستخدم'), { kind: 'primary', icon: 'userPlus', act: 'muInvite' })
        : ui.btn(L('Municipal Administrator', 'مسؤول البلدية'), { icon: 'settings', go: `${ADMIN}-users` }) + (B.roles.admin ? ui.btn(L('Platform administration', 'إدارة المنصة'), { icon: 'shield', go: 'admin-home' }) : '') })}
      <div class="stack">
        ${admin ? '' : ui.callout(L('This is a read-only view. To change roles or invite staff, open the <b>Municipal Administrator</b> workspace; platform-wide settings live in BENA platform administration.', 'هذا عرض للقراءة فقط. لتغيير الأدوار أو دعوة موظفين، افتح مساحة <b>مسؤول البلدية</b>؛ أما إعدادات المنصة العامة فتوجد في إدارة منصة بينا.'), '', 'lock')}
        ${strip([
          { label: L('Staff accounts', 'حسابات الموظفين'), value: M.STAFF.length, sub: L('Sample tenant', 'جهة تجريبية') },
          { label: L('Active', 'نشطة'), value: M.STAFF.filter((s) => s.status === 'active').length, tone: 'ok', sub: L('Signed in last 30 days', 'دخلت خلال 30 يوماً') },
          { label: L('Pending invitations', 'دعوات معلّقة'), value: M.STAFF.filter((s) => s.status === 'invited').length, sub: L('Awaiting acceptance', 'بانتظار القبول') },
          { label: L('2FA not enabled', 'دون مصادقة ثنائية'), value: M.STAFF.filter((s) => !s.mfa).length, tone: 'warn', sub: L('Security recommendation', 'توصية أمنية') },
          { label: L('Roles', 'الأدوار'), value: Object.keys(ROLES).length, sub: L(`${PERMS.length} permissions`, `${PERMS.length} صلاحيات`) },
        ])}
        <div class="mu-fbar">${ui.search('us:q', L('Search staff, unit', 'ابحث بالموظف أو الوحدة'))}${ui.select('us:role', [{ v: 'all', l: L('All roles', 'جميع الأدوار') }].concat(Object.keys(ROLES).map((k) => ({ v: k, l: ROLES[k].t }))), { def: 'all', label: L('Role', 'الدور') })}<span class="mu-count">${L(`${rows.length} users`, `${rows.length} مستخدم`)}</span></div>
        ${qs ? `<div class="mu-split">${table}${pane}</div>` : table}
        ${ui.card({ title: L('Permission matrix', 'مصفوفة الصلاحيات'), sub: L('Role-based access for the municipal workspace (read-only overview)', 'الوصول حسب الدور لمساحة عمل البلدية (عرض للقراءة فقط)'), cls: 'pad-0', body: matrix }).replace('<div class="card-head">', '<div class="card-head" style="padding:16px 18px 0">')}
      </div>`;
  }

  /* =================================================================
     Municipal Administrator — audit, rules, settings, overview
     ================================================================= */
  const AUDIT = [
    { id: 'EV-90412', t: '2026-11-25 09:58', who: 'p_maha', act: 'verify', what: T('Verified building record', 'وثّق سجل مبنى'), ent: T('BN-RAM-00391', 'BN-RAM-00391'), ip: '10.20.4.17', diff: { verification: ['pendingVerification', 'verified'] } },
    { id: 'EV-90409', t: '2026-11-25 09:41', who: 'p_mu_samah', act: 'role', what: T('Changed user role', 'غيّر دور مستخدم'), ent: T('Lubna Shaheen', 'لبنى شاهين'), ip: '10.20.1.4', diff: { role: ['officer', 'reviewer'] } },
    { id: 'EV-90401', t: '2026-11-25 06:00', who: 'system', act: 'sync', what: T('Footprint layer synced', 'تمت مزامنة طبقة المساقط'), ent: T('WFS · buildings_2026', 'WFS · buildings_2026'), ip: '—', diff: { updated: [0, 214], added: [0, 19] } },
    { id: 'EV-90388', t: '2026-11-24 16:22', who: 'p_mu_odai', act: 'reject', what: T('Rejected verification submission', 'رفض سجلاً مقدّماً للتحقق'), ent: T('VQ-5241', 'VQ-5241'), ip: '10.20.4.22', diff: { status: ['toReview', 'rejected'] } },
    { id: 'EV-90371', t: '2026-11-24 14:05', who: 'p_mu_tamer', act: 'link', what: T('Linked sample municipal reference', 'ربط مرجعاً بلدياً نموذجياً'), ent: T('BN-RAM-00529', 'BN-RAM-00529'), ip: '10.20.4.31', diff: { ref: [null, 'RM/OC/1998/0529'], source: ['independent', 'gis'] } },
    { id: 'EV-90355', t: '2026-11-24 11:47', who: 'p_mu_rasha', act: 'edit', what: T('Edited building attributes', 'عدّل سمات مبنى'), ent: T('BN-RAM-00142', 'BN-RAM-00142'), ip: '10.20.4.12', diff: { parking: [60, 64] } },
    { id: 'EV-90340', t: '2026-11-24 09:12', who: 'p_mu_samah', act: 'invite', what: T('Invited user', 'دعا مستخدماً'), ent: T('Ghada Rimawi', 'غادة الريماوي'), ip: '10.20.1.4', diff: { status: [null, 'invited'], workspace: [null, 'birzeit'] } },
    { id: 'EV-90318', t: '2026-11-23 17:30', who: 'p_maha', act: 'export', what: T('Exported report', 'صدّر تقريراً'), ent: T('Verification SLA report', 'تقرير مهلة التحقق'), ip: '10.20.4.17', diff: { format: [null, 'PDF'] } },
    { id: 'EV-90302', t: '2026-11-23 10:02', who: 'p_mu_samah', act: 'rule', what: T('Updated verification rule', 'حدّث قاعدة تحقق'), ent: T('SLA target', 'هدف المهلة'), ip: '10.20.1.4', diff: { sla_days: [21, 14] } },
    { id: 'EV-90287', t: '2026-11-22 15:44', who: 'p_mu_lubna', act: 'verify', what: T('Verified building record', 'وثّق سجل مبنى'), ent: T('BN-RAM-00744', 'BN-RAM-00744'), ip: '10.20.4.25', diff: { verification: ['pendingVerification', 'verified'] } },
    { id: 'EV-90266', t: '2026-11-21 23:10', who: 'system', act: 'sync', what: T('Permit feed failed', 'فشلت مزامنة الرخص'), ent: T('CSV drop · permits_export', 'CSV drop · permits_export'), ip: '—', diff: { error: [null, 'permit_no missing'] } },
    { id: 'EV-90240', t: '2026-11-21 08:55', who: 'p_mu_samah', act: 'suspend', what: T('Suspended user', 'أوقف مستخدماً'), ent: T('Sawsan Masri', 'سوسن المصري'), ip: '10.20.1.4', diff: { status: ['active', 'suspended'] } },
  ];
  const ACT = { verify: T('Verification', 'التحقق'), role: T('Roles', 'الأدوار'), sync: T('Sync', 'المزامنة'), reject: T('Verification', 'التحقق'), link: T('Linking', 'الربط'), edit: T('Edit', 'التعديل'), invite: T('Users', 'المستخدمون'), export: T('Export', 'التصدير'), rule: T('Rules', 'القواعد'), suspend: T('Users', 'المستخدمون') };
  const actor = (w) => (w === 'system' ? L('System (scheduled)', 'النظام (مجدول)') : esc(D.pname(w)));
  B.act.muAuQv = (id) => { B.vs['au:qv'] = B.get('au:qv', '') === id ? '' : id; B.refresh(); };
  function audit() {
    crumbs([[L('Audit Trail', 'سجل التدقيق')]]);
    const q = B.get('au:q', ''), a = B.get('au:act', 'all'), who = B.get('au:who', 'all'), per = B.get('au:per', '7');
    const rows = AUDIT.filter((e) => (a === 'all' || tx(ACT[e.act]) === a) && (who === 'all' || e.who === who) && (per === '7' || e.t >= '2026-11-25') && B.match(q, e.id, e.what, e.ent, D.pname(e.who)));
    let qv = B.get('au:qv', '');
    const qe = qv ? AUDIT.find((e) => e.id === qv) : null;
    if (!qe) qv = '';
    const table = dt({ id: 'au', rows, active: qv, defaultSort: '-t', rowAct: (r) => ({ act: 'muAuQv', arg: r.id }),
      cols: [
        { key: 't', label: L('Time', 'الوقت'), sort: true, w: '140px', render: (r) => `<span class="ltr small nowrap">${r.t}</span>`, m: 'meta' },
        { key: 'who', label: L('Actor', 'المنفّذ'), sort: (r) => actor(r.who), render: (r) => `<span class="nowrap">${actor(r.who)}</span>`, m: 'sub' },
        { key: 'what', label: L('Action', 'الإجراء'), sort: (r) => tx(r.what), render: (r) => `<b style="font-weight:600">${tx(r.what)}</b>`, m: 'title', mRender: (r) => tx(r.what) },
        { key: 'ent', label: L('Entity', 'الكيان'), render: (r) => `<bdi class="small">${esc(tx(r.ent))}</bdi>`, hide: !!qv },
        { key: 'act', label: L('Category', 'الفئة'), sort: (r) => tx(ACT[r.act]), render: (r) => ui.badge(ACT[r.act], 'neutral'), m: 'end' },
        { key: 'ip', label: L('Source IP', 'عنوان المصدر'), render: (r) => `<span class="ltr small faint">${r.ip}</span>`, hide: !!qv },
      ] });
    const jsonDiff = (d) => `<div class="mu-json">{\n${Object.keys(d).map((k) => `  <span class="k">"${k}"</span>: ${d[k][0] != null ? `<span class="o">${esc(JSON.stringify(d[k][0]))}</span> → ` : ''}<span class="n">${esc(JSON.stringify(d[k][1]))}</span>`).join(',\n')}\n}</div>`;
    const pane = qe ? `<aside class="card mu-pane"><div class="mu-pane-h"><div class="grow"><div class="row-sm" style="margin-bottom:4px">${ui.idMono(qe.id)}${ui.badge(ACT[qe.act], 'neutral')}</div><h3 style="font-size:16px">${tx(qe.what)}</h3></div><button class="icon-btn" style="width:32px;height:32px" data-act="muAuQv" data-arg="${qe.id}" aria-label="${L('Close', 'إغلاق')}">${icon('x')}</button></div>
      <div class="mu-pane-b">${attrs([[L('Time', 'الوقت'), `<span class="ltr">${qe.t}</span>`], [L('Actor', 'المنفّذ'), actor(qe.who)], [L('Entity', 'الكيان'), `<bdi>${esc(tx(qe.ent))}</bdi>`], [L('Workspace', 'مساحة العمل'), wsLbl('ramallah')], [L('Source IP', 'عنوان المصدر'), `<span class="ltr">${qe.ip}</span>`]])}
        <div class="mu-sec">${L('Change set', 'مجموعة التغييرات')}</div>${jsonDiff(qe.diff)}
        <p class="xs faint" style="margin-top:10px">${L('Audit entries are append-only. Sample events — fictional.', 'سجلات التدقيق للإضافة فقط. أحداث نموذجية — وهمية.')}</p></div></aside>` : '';
    const cats = [...new Set(Object.values(ACT).map((x) => tx(x)))];
    return `${hdr({ title: L('Audit Trail', 'سجل التدقيق'), unit: adminUnit(), sub: L('Every change made in this municipal tenant — who, what, when and from where (sample events).', 'كل تغيير في هذه الجهة البلدية — من وماذا ومتى ومن أين (أحداث نموذجية).'),
      actions: ui.btn(L('Export CSV', 'تصدير CSV'), { icon: 'download', act: 'soon', arg: L('Audit export', 'تصدير سجل التدقيق') }) + ui.btn(L('Retention policy', 'سياسة الاحتفاظ'), { icon: 'settings', go: `${ADMIN}-settings` }) })}
      <div class="stack">
        ${views('au:per', [{ id: '1', label: L('Today', 'اليوم'), count: AUDIT.filter((e) => e.t >= '2026-11-25').length }, { id: '7', label: L('Last 7 days', 'آخر 7 أيام'), count: AUDIT.length }], per, { save: false })}
        <div class="mu-fbar">${ui.search('au:q', L('Search event, entity, actor', 'ابحث بالحدث أو الكيان أو المنفّذ'))}
          ${ui.select('au:act', [{ v: 'all', l: L('All categories', 'جميع الفئات') }].concat(cats.map((c) => ({ v: c, l: c }))), { def: 'all', label: L('Category', 'الفئة') })}
          ${ui.select('au:who', [{ v: 'all', l: L('All actors', 'جميع المنفّذين') }, { v: 'system', l: L('System (scheduled)', 'النظام (مجدول)') }].concat(M.STAFF.map((s) => ({ v: s.id, l: D.person(s.id).name }))), { def: 'all', label: L('Actor', 'المنفّذ') })}
          <span class="mu-count">${L(`${rows.length} events`, `${rows.length} حدثاً`)}</span></div>
        ${qe ? `<div class="mu-split">${table}${pane}</div>` : table}
      </div>`;
  }

  const RULES = [
    ['sla', 'clock', T('Verification SLA target', 'هدف مهلة التحقق'), T('Items older than this are flagged as over SLA', 'تُعلَّم العناصر الأقدم كمتجاوزة للمهلة'), 'select', [['7', T('7 days', '7 أيام')], ['14', T('14 days', '14 يوماً')], ['21', T('21 days', '21 يوماً')]], '14'],
    ['parcel', 'grid', T('Require a parcel reference to verify', 'اشتراط مرجع القطعة للتوثيق'), T('Blocks verification when basin/parcel is missing', 'يمنع التوثيق عند غياب الحوض/القطعة'), 'switch', null, true],
    ['overlap', 'layers', T('Flag footprint overlap above', 'تعليم تداخل المساقط فوق'), T('Creates a duplicate-geometry issue', 'يُنشئ مشكلة مسقط مكرر'), 'select', [['40', '40%'], ['60', '60%'], ['80', '80%']], '60'],
    ['heritage', 'award', T('Dual review in heritage zones', 'مراجعة مزدوجة في المناطق التراثية'), T('A second reviewer and conservation sign-off', 'مراجع ثانٍ وموافقة وحدة الحفاظ'), 'switch', null, true],
    ['match', 'link', T('Auto-suggest matches above', 'اقتراح المطابقات آلياً فوق'), T('Candidates below this confidence are hidden', 'تُخفى المرشحات دون هذه الثقة'), 'select', [['50', '50%'], ['65', '65%'], ['85', '85%']], '65'],
    ['automatch', 'sparkles', T('Never auto-accept matches', 'عدم قبول المطابقات آلياً أبداً'), T('Every link to a municipal reference needs a human decision', 'كل ربط بمرجع بلدي يتطلب قراراً بشرياً'), 'switch', null, true],
    ['assign', 'userCheck', T('Auto-assign by district', 'الإسناد الآلي حسب الحي'), T('Route new items to the district reviewer', 'توجيه العناصر الجديدة إلى مراجع الحي'), 'switch', null, true],
    ['indep', 'userPlus', T('Accept independent registrations', 'قبول التسجيلات المستقلة'), T('Owners may register buildings without a municipal record', 'يمكن للمالكين تسجيل مبانٍ دون سجل بلدي'), 'switch', null, true],
  ];
  function rules() {
    crumbs([[L('Verification Rules', 'قواعد التحقق')]]);
    const ctl = ([k, , , , type, opts, def]) => (type === 'switch'
      ? `<label class="switch"><input type="checkbox" data-model="rl:${k}" data-norender ${B.get('rl:' + k, def) ? 'checked' : ''}><i></i></label>`
      : `<select class="select" id="f-rl${k}" data-model="rl:${k}" data-norender>${opts.map(([v, l]) => `<option value="${v}" ${String(B.get('rl:' + k, def)) === v ? 'selected' : ''}>${tx(l)}</option>`).join('')}</select>`);
    const assign = D.districts.map((d, i) => `<div class="ds-row"><div><b>${tx(d.name)}</b><small>${L(`${d.buildings - d.gis} independent records`, `${d.buildings - d.gis} سجلاً مستقلاً`)}</small></div><select class="select" id="f-ra${d.id}" data-model="ra:${d.id}" data-norender style="width:auto;min-width:170px;height:34px;font-size:13px">${REVIEWERS.map((p) => `<option value="${p}" ${B.get('ra:' + d.id, REVIEWERS[i % REVIEWERS.length]) === p ? 'selected' : ''}>${esc(D.pname(p))}</option>`).join('')}</select></div>`).join('');
    return `${hdr({ title: L('Verification Rules', 'قواعد التحقق'), unit: adminUnit(), sub: L('How records are checked, routed and decided in this municipal tenant. Rules apply to demo data only.', 'كيفية فحص السجلات وتوجيهها والبت فيها في هذه الجهة البلدية. تنطبق القواعد على البيانات التجريبية فقط.'),
      actions: ui.btn(L('View change history', 'سجل التغييرات'), { icon: 'history', go: `${ADMIN}-audit` }) + ui.btn(L('Save rules', 'حفظ القواعد'), { kind: 'primary', icon: 'check', act: 'toast', arg: L('Rules saved (demo) — logged in the audit trail', 'تم حفظ القواعد (تجريبي) — سُجّلت في سجل التدقيق') }) })}
      <div class="grid g-main">
        ${ui.card({ title: L('Rules', 'القواعد'), sub: L(`${RULES.length} rules · last changed 23 Nov by Eng. Samah Daher`, `${RULES.length} قواعد · آخر تغيير 23 ت٢ بواسطة م. سماح ضاهر`), body: RULES.map((r) => `<div class="mu-rule"><span class="li-icon">${icon(r[1])}</span><div><b>${tx(r[2])}</b><small>${tx(r[3])}</small></div><div class="ctl">${ctl(r)}</div></div>`).join('') })}
        <div class="stack">
          ${ui.card({ title: L('Reviewer by district', 'المراجع حسب الحي'), sub: L('Used when auto-assign is on', 'يُستخدم عند تفعيل الإسناد الآلي'), body: assign })}
          ${ui.callout(L('Rules never assign legal status. Verification confirms that a building record matches reference data; it is not proof of ownership.', 'لا تمنح القواعد أي صفة قانونية. يؤكد التوثيق تطابق سجل المبنى مع البيانات المرجعية؛ وليس إثباتاً للملكية.'), '', 'info')}
        </div>
      </div>`;
  }

  function settings() {
    crumbs([[L('Tenant Settings', 'إعدادات الجهة')]]);
    const ws = [['ramallah', 'active', 12862, L('Primary workspace', 'مساحة العمل الرئيسية')], ['albireh', 'pilot', 2140, L('Pilot — registry import in progress', 'تجريبي — استيراد السجل قيد التنفيذ')], ['birzeit', 'draft', 0, L('Not configured', 'غير مُهيأة')]];
    const wsSt = { active: ['active', 'ok'], pilot: ['inProgress', 'violet'], draft: ['draft', 'neutral'] };
    return `${hdr({ title: L('Tenant Settings', 'إعدادات الجهة'), unit: adminUnit(), sub: L('Configuration for this sample municipal tenant. BENA is designed to connect to municipal systems — nothing here connects to a real municipality.', 'إعدادات هذه الجهة البلدية النموذجية. صُممت بينا للاتصال بالأنظمة البلدية — لا شيء هنا متصل ببلدية حقيقية.'),
      actions: ui.btn(L('Save changes', 'حفظ التغييرات'), { kind: 'primary', icon: 'check', act: 'toast', arg: L('Settings saved (demo)', 'تم حفظ الإعدادات (تجريبي)') }) })}
      <div class="stack">
        ${ui.simRibbon(L('Sample tenant — not affiliated with or endorsed by any municipality.', 'جهة تجريبية — غير مرتبطة بأي بلدية أو معتمدة منها.'))}
        <div class="grid g-main">
          <div class="stack">
            ${ui.card({ title: L('Tenant profile', 'ملف الجهة'), body: `<div class="form-grid">
              ${ui.field({ name: 'tn', label: L('Display name', 'الاسم المعروض'), value: L('Ramallah Municipality (sample)', 'بلدية رام الله (نموذج)'), full: true })}
              ${ui.field({ name: 'tc', label: L('Tenant code', 'رمز الجهة'), value: 'RAM-SAMPLE' })}
              ${ui.field({ name: 'tp', label: L('BENA ID prefix', 'بادئة رقم بينا'), value: 'BN-RAM' })}
              ${ui.field({ name: 'tl', label: L('Default language', 'اللغة الافتراضية'), type: 'select', value: 'ar', options: [{ v: 'ar', l: 'العربية' }, { v: 'en', l: 'English' }] })}
              ${ui.field({ name: 'tz', label: L('Time zone', 'المنطقة الزمنية'), type: 'select', value: 'heb', options: [{ v: 'heb', l: 'Asia/Hebron (UTC+2)' }] })}
            </div>` })}
            ${ui.card({ title: L('Workspaces', 'مساحات العمل'), sub: L('Sample municipalities under this tenant', 'بلديات نموذجية ضمن هذه الجهة'), link: { label: L('Add workspace', 'إضافة مساحة'), act: 'soon', arg: L('Adding a workspace', 'إضافة مساحة عمل') },
              body: ws.map(([id, st, n, note]) => `<div class="mu-wsrow"><span class="li-icon navy" style="width:36px;height:36px;border-radius:10px">${icon('landmark')}</span><div><b>${tx(M.WORKSPACES.find((w) => w.id === id).label)}</b><small>${note}${n ? ` · ${B.num(n)} ${L('records', 'سجل')}` : ''}</small></div>${ui.badge(B.statuses[wsSt[st][0]], wsSt[st][1])}${ui.btn(L('Configure', 'تهيئة'), { size: 'sm', icon: 'settings', act: 'soon', arg: L('Workspace configuration', 'تهيئة مساحة العمل') })}</div>`).join('') })}
          </div>
          <div class="stack">
            ${ui.card({ title: L('Security', 'الأمان'), body: `<div class="mu-lyr">
              <label><span>${icon('shield')}</span><span>${L('Require two-factor authentication', 'اشتراط المصادقة الثنائية')}<small>${L('3 users currently without 2FA', '3 مستخدمين دون مصادقة ثنائية حالياً')}</small></span><span class="switch"><input type="checkbox" data-model="ts:mfa" data-norender ${B.get('ts:mfa', true) ? 'checked' : ''}><i></i></span></label>
              <label><span>${icon('lock')}</span><span>${L('Single sign-on (designed to connect)', 'الدخول الموحّد (مصمم للاتصال)')}<small>${L('SAML / OIDC — simulated', 'SAML / OIDC — محاكاة')}</small></span><span class="switch"><input type="checkbox" data-model="ts:sso" data-norender ${B.get('ts:sso', false) ? 'checked' : ''}><i></i></span></label>
              <label><span>${icon('globe')}</span><span>${L('Restrict access to office network', 'تقييد الوصول بشبكة المكتب')}<small>10.20.0.0/16 · ${L('simulated', 'محاكاة')}</small></span><span class="switch"><input type="checkbox" data-model="ts:ip" data-norender ${B.get('ts:ip', false) ? 'checked' : ''}><i></i></span></label>
            </div>
            <div style="margin-top:12px">${ui.field({ name: 'ss', label: L('Session timeout', 'مهلة الجلسة'), type: 'select', value: '30', options: [{ v: '15', l: L('15 minutes', '15 دقيقة') }, { v: '30', l: L('30 minutes', '30 دقيقة') }, { v: '60', l: L('60 minutes', '60 دقيقة') }] })}</div>` })}
            ${ui.card({ title: L('Data retention', 'الاحتفاظ بالبيانات'), body: `<div class="stack">${ui.field({ name: 'ar', label: L('Audit trail retention', 'مدة الاحتفاظ بسجل التدقيق'), type: 'select', value: '7', options: [{ v: '3', l: L('3 years', '3 سنوات') }, { v: '7', l: L('7 years', '7 سنوات') }] })}${ui.field({ name: 'rr', label: L('Rejected submissions', 'السجلات المرفوضة'), type: 'select', value: '1', options: [{ v: '1', l: L('Keep 1 year, then anonymise', 'الاحتفاظ سنة ثم إخفاء الهوية') }, { v: '3', l: L('Keep 3 years', 'الاحتفاظ 3 سنوات') }] })}</div>` })}
            ${ui.card({ title: L('Platform', 'المنصة'), body: `<p class="small muted">${L('Platform-wide settings, billing and tenant provisioning are managed by BENA platform administration.', 'تُدار إعدادات المنصة العامة والفوترة وتهيئة الجهات من إدارة منصة بينا.')}</p>${B.roles.admin ? `<div style="margin-top:12px">${ui.btn(L('Open platform administration', 'فتح إدارة المنصة'), { icon: 'shield', go: 'admin-home' })}</div>` : ''}` })}
          </div>
        </div>
      </div>`;
  }

  function adminHome() {
    crumbs([[L('Tenant Overview', 'نظرة عامة على الجهة')]]);
    const S = M.STAFF;
    const byRole = Object.keys(ROLES).map((k) => ({ label: ROLES[k].t, value: S.filter((s) => s.role === k).length })).filter((x) => x.value);
    const LY = M.LAYERS;
    const ok = LY.filter((l) => l.status === 'synced').length;
    return `${hdr({ title: L('Good morning, Samah', 'صباح الخير، سماح'), unit: adminUnit(), sub: L('Municipal tenant administration — users, data sources, verification rules and audit (sample tenant, fictional data).', 'إدارة الجهة البلدية — المستخدمون ومصادر البيانات وقواعد التحقق والتدقيق (جهة تجريبية، بيانات وهمية).'),
      actions: ui.btn(L('Audit trail', 'سجل التدقيق'), { icon: 'history', go: `${ADMIN}-audit` }) + ui.btn(L('Invite user', 'دعوة مستخدم'), { kind: 'primary', icon: 'userPlus', act: 'muInvite' }) })}
      <div class="stack-lg">
        ${strip([
          { label: L('Active users', 'المستخدمون النشطون'), value: S.filter((s) => s.status === 'active').length, sub: L(`of ${S.length} accounts`, `من ${S.length} حسابات`), go: `${ADMIN}-users` },
          { label: L('Pending invitations', 'دعوات معلّقة'), value: S.filter((s) => s.status === 'invited').length, sub: L('Awaiting acceptance', 'بانتظار القبول'), go: `${ADMIN}-users` },
          { label: L('2FA coverage', 'تغطية المصادقة الثنائية'), value: B.pct(pct(S.filter((s) => s.mfa).length, S.length)), sub: L('Target 100%', 'الهدف 100%'), tone: 'warn' },
          { label: L('Data sources healthy', 'مصادر سليمة'), value: `${ok}/${LY.length}`, sub: L('Simulated feeds', 'مصادر محاكاة'), go: `${ADMIN}-sources`, tone: ok < LY.length ? 'warn' : 'ok' },
          { label: L('Active rules', 'القواعد المفعّلة'), value: RULES.length, sub: L('Verification & matching', 'التحقق والمطابقة'), go: `${ADMIN}-rules` },
          { label: L('Audit events (24h)', 'أحداث التدقيق (24 س)'), value: AUDIT.filter((e) => e.t >= '2026-11-24 10:00').length, sub: L('Append-only log', 'سجل للإضافة فقط'), go: `${ADMIN}-audit` },
        ])}
        <div class="grid g-main">
          ${ui.card({ title: L('Workspaces', 'مساحات العمل'), sub: L('Sample municipalities in this tenant', 'بلديات نموذجية في هذه الجهة'), link: { label: L('Tenant settings', 'إعدادات الجهة'), go: `${ADMIN}-settings` },
            body: [['ramallah', 'active', 'ok', 12862, 9], ['albireh', 'inProgress', 'violet', 2140, 3], ['birzeit', 'draft', 'neutral', 0, 1]].map(([id, st, tone, n, u]) => `<div class="mu-wsrow"><span class="li-icon navy" style="width:36px;height:36px;border-radius:10px">${icon('landmark')}</span><div><b>${tx(M.WORKSPACES.find((w) => w.id === id).label)}</b><small>${n ? L(`${B.num(n)} building records`, `${B.num(n)} سجل مبنى`) : L('Not configured yet', 'لم تُهيأ بعد')} · ${L(`${u} users`, `${u} مستخدمين`)}</small></div>${ui.badge(B.statuses[st], tone)}${ui.btn(L('Open', 'فتح'), { size: 'sm', icon: 'arrowRight', iconCls: 'flip', go: id === 'ramallah' ? `${R}-home` : `${ADMIN}-settings` })}</div>`).join('') })}
          ${ui.card({ title: L('Users by role', 'المستخدمون حسب الدور'), link: { label: L('Users & roles', 'المستخدمون والأدوار'), go: `${ADMIN}-users` }, body: B.charts.hbars({ data: byRole.map((r, i) => ({ ...r, color: i === 0 ? '#142B3B' : '#7FA7C2' })) }) })}
        </div>
        <div class="grid g2">
          ${ui.card({ title: L('Sync health', 'سلامة المزامنة'), sub: L('Designed-to-connect feeds (simulated)', 'مصادر مصممة للاتصال (محاكاة)'), link: { label: L('Data sources', 'مصادر البيانات'), go: `${ADMIN}-sources` }, body: ui.list(LY.map((l) => ui.li({ icon: l.icon, tone: l.status === 'syncError' ? 'bad' : l.status === 'delayed' ? 'warn' : 'navy', title: tx(l.name), sub: `${esc(l.feed)} · ${B.dateShort(l.last.slice(0, 10))}`, end: ui.status(l.status) }))) })}
          ${ui.card({ title: L('Recent audit events', 'أحدث أحداث التدقيق'), link: { label: L('Audit trail', 'سجل التدقيق'), go: `${ADMIN}-audit` }, body: ui.list(AUDIT.slice(0, 6).map((e) => ui.li({ icon: { verify: 'shieldCheck', role: 'key', sync: 'refresh', reject: 'xCircle', link: 'link', edit: 'edit', invite: 'userPlus', export: 'download', rule: 'sliders', suspend: 'lock' }[e.act], tone: 'navy', title: tx(e.what), sub: `${actor(e.who)} · <bdi>${esc(tx(e.ent))}</bdi>`, end: `<span class="xs faint ltr">${e.t.slice(5)}</span>`, act: 'muAuGo', arg: e.id }))) })}
        </div>
        ${ui.demoNote(L('Sample tenant — staff, workspaces and events are fictional. BENA is designed to connect to municipal systems; this prototype is not connected to any.', 'جهة تجريبية — الموظفون ومساحات العمل والأحداث وهمية. صُممت بينا للاتصال بالأنظمة البلدية؛ وهذا النموذج غير متصل بأي منها.'))}
      </div>`;
  }
  B.act.muAuGo = (id) => { B.vs['au:qv'] = id; B.go(`${ADMIN}-audit`); };

  /* =================================================================
     Role registration
     ================================================================= */
  const wrap = (fns) => Object.fromEntries(Object.entries(fns).map(([k, f]) => [k, (id, route) => `<div class="mu">${f(id, route)}</div>`]));
  const P = M.pages;
  const muniPages = wrap({ home: P.home, registry: P.registry, explorer: P.explorer, details, verify, requests: P.requests, request: P.request, corrections, correction: corrections, quality, matching, analytics: P.analytics, reports, data: P.data, users });
  const workspaces = M.WORKSPACES;

  B.role({
    id: R, icon: 'landmark', nav: 'drawer',
    name: { en: 'Municipality', ar: 'البلدية' }, short: { en: 'Municipality', ar: 'البلدية' },
    org: { en: 'Ramallah Municipality (sample)', ar: 'بلدية رام الله (نموذج)' },
    tag: { en: 'GIS & registry', ar: 'نظم المعلومات والسجل' },
    desc: { en: 'GIS building explorer, registry, verification queue, matching, data quality and reports for a sample municipality.', ar: 'مستكشف المباني الجغرافي والسجل وقائمة التحقق والمطابقة وجودة البيانات والتقارير لبلدية نموذجية.' },
    personaTitle: { en: 'Eng. Maha Awad · GIS & Building Registry Unit', ar: 'م. مها عوض · وحدة نظم المعلومات وسجل المباني' },
    home: 'home',
    workspaces,
    menu: [
      { group: { en: 'Overview', ar: 'نظرة عامة' } },
      { id: 'home', label: { en: 'Municipal Overview', ar: 'نظرة عامة على البلدية' }, icon: 'grid' },
      { group: { en: 'Buildings', ar: 'المباني' } },
      { id: 'registry', label: { en: 'Building Registry', ar: 'سجل المباني' }, icon: 'building', match: ['building'] },
      { id: 'explorer', label: { en: 'GIS Building Explorer', ar: 'مستكشف المباني الجغرافي' }, icon: 'map' },
      { id: 'details', label: { en: 'Building Details', ar: 'تفاصيل المبنى' }, icon: 'doc' },
      { group: { en: 'Review', ar: 'المراجعة' } },
      { id: 'verify', label: { en: 'Verification Queue', ar: 'قائمة التحقق' }, icon: 'shieldCheck', get count() { return vqOpen().length; } },
      { id: 'requests', label: { en: 'Registration Requests', ar: 'طلبات التسجيل' }, icon: 'inbox', match: ['request'], get count() { return M.REQ.filter((q) => q.type !== 'correction' && M.OPEN.includes(q.status)).length; } },
      { id: 'corrections', label: { en: 'Correction Requests', ar: 'طلبات التصحيح' }, icon: 'edit', match: ['correction'], get count() { return COR.filter((c) => COR_OPEN.includes(c.status)).length; } },
      { id: 'matching', label: { en: 'Building Matching', ar: 'مطابقة المباني' }, icon: 'link' },
      { group: { en: 'Insights', ar: 'الرؤى' } },
      { id: 'quality', label: { en: 'Data Quality', ar: 'جودة البيانات' }, icon: 'activity' },
      { id: 'analytics', label: { en: 'Municipal Analytics', ar: 'التحليلات البلدية' }, icon: 'chart' },
      { id: 'reports', label: { en: 'Reports', ar: 'التقارير' }, icon: 'doc' },
      { group: { en: 'Administration', ar: 'الإدارة' } },
      { id: 'data', label: { en: 'Data Sources', ar: 'مصادر البيانات' }, icon: 'database' },
      { id: 'users', label: { en: 'Users & Permissions', ar: 'المستخدمون والصلاحيات' }, icon: 'users' },
    ],
    pages: muniPages,
    notifications: () => [
      { icon: 'shieldCheck', tone: 'warn', title: L(`${vqOpen().filter((x) => x.age > SLA).length} verification items over SLA`, `${vqOpen().filter((x) => x.age > SLA).length} عناصر تحقق تجاوزت المهلة`), sub: L('Oldest first in the verification queue', 'الأقدم أولاً في قائمة التحقق'), when: L('Today', 'اليوم'), go: `${R}-verify` },
      { icon: 'inbox', tone: 'mint', title: L('New registration request RR-2026-0418', 'طلب تسجيل جديد RR-2026-0418'), sub: L('New residential building in Batn Al-Hawa', 'مبنى سكني جديد في بطن الهوا'), when: L('Yesterday', 'أمس'), go: `${R}-request-RR-2026-0418` },
      { icon: 'edit', tone: 'info', title: L('Correction CR-2026-0235 submitted', 'تم تقديم التصحيح CR-2026-0235'), sub: L('Change of use: commercial → office', 'تغيير الاستخدام: تجاري ← مكاتب'), when: L('Yesterday', 'أمس'), go: `${R}-correction-CR-2026-0235` },
      { icon: 'link', tone: 'navy', title: L(`${MC.filter((m) => m.status === 'toReview' && m.score >= 85).length} high-confidence matches ready`, `${MC.filter((m) => m.status === 'toReview' && m.score >= 85).length} مطابقات عالية الثقة جاهزة`), sub: L('Building Matching Workspace', 'مساحة مطابقة المباني'), when: L('2 days ago', 'قبل يومين'), go: `${R}-matching` },
      { icon: 'alert', tone: 'warn', title: L('Building permits feed failed', 'فشلت مزامنة رخص البناء'), sub: L('CSV drop could not be parsed (simulated)', 'تعذرت قراءة ملف CSV (محاكاة)'), when: L('4 days ago', 'قبل 4 أيام'), go: `${R}-data` },
    ],
  });

  B.role({
    id: ADMIN, icon: 'settings', nav: 'drawer',
    name: { en: 'Municipal Administrator', ar: 'مسؤول البلدية' }, short: { en: 'Muni admin', ar: 'مسؤول البلدية' },
    org: { en: 'Ramallah Municipality (sample)', ar: 'بلدية رام الله (نموذج)' },
    tag: { en: 'Tenant admin', ar: 'إدارة الجهة' },
    desc: { en: 'The municipality’s own administrator: tenant settings, users & roles, data sources, verification rules and audit trail.', ar: 'مسؤول البلدية: إعدادات الجهة والمستخدمون والأدوار ومصادر البيانات وقواعد التحقق وسجل التدقيق.' },
    personaTitle: { en: 'Eng. Samah Daher · IT & Digital Services', ar: 'م. سماح ضاهر · تقنية المعلومات والخدمات الرقمية' },
    home: 'home',
    workspaces,
    menu: [
      { group: { en: 'Overview', ar: 'نظرة عامة' } },
      { id: 'home', label: { en: 'Tenant Overview', ar: 'نظرة عامة على الجهة' }, icon: 'grid' },
      { group: { en: 'Tenant', ar: 'الجهة' } },
      { id: 'settings', label: { en: 'Tenant Settings', ar: 'إعدادات الجهة' }, icon: 'settings' },
      { id: 'users', label: { en: 'Users & Roles', ar: 'المستخدمون والأدوار' }, icon: 'users', get count() { return M.STAFF.filter((s) => s.status === 'invited').length || null; } },
      { id: 'rules', label: { en: 'Verification Rules', ar: 'قواعد التحقق' }, icon: 'sliders' },
      { group: { en: 'Data & governance', ar: 'البيانات والحوكمة' } },
      { id: 'sources', label: { en: 'Data Sources & Sync', ar: 'مصادر البيانات والمزامنة' }, icon: 'database' },
      { id: 'audit', label: { en: 'Audit Trail', ar: 'سجل التدقيق' }, icon: 'history' },
      { id: 'reports', label: { en: 'Reports', ar: 'التقارير' }, icon: 'doc' },
    ],
    pages: wrap({ home: adminHome, settings, users, rules, sources: P.data, audit, reports }),
    notifications: () => [
      { icon: 'userPlus', tone: 'info', title: L('Invitation pending: Ghada Rimawi', 'دعوة معلّقة: غادة الريماوي'), sub: L('Field Surveyor · Birzeit (sample)', 'مسّاح ميداني · بيرزيت (نموذج)'), when: L('Yesterday', 'أمس'), go: `${ADMIN}-users` },
      { icon: 'shield', tone: 'warn', title: L('3 users without two-factor authentication', '3 مستخدمين دون مصادقة ثنائية'), sub: L('Security recommendation', 'توصية أمنية'), when: L('Today', 'اليوم'), go: `${ADMIN}-users` },
      { icon: 'alert', tone: 'warn', title: L('Building permits feed failed', 'فشلت مزامنة رخص البناء'), sub: L('Simulated CSV drop', 'ملف CSV محاكى'), when: L('4 days ago', 'قبل 4 أيام'), go: `${ADMIN}-sources` },
      { icon: 'sliders', tone: 'mint', title: L('Verification SLA changed to 14 days', 'تم تغيير مهلة التحقق إلى 14 يوماً'), sub: L('Logged in the audit trail', 'سُجّل في سجل التدقيق'), when: L('2 days ago', 'قبل يومين'), go: `${ADMIN}-audit` },
    ],
  });
})();
