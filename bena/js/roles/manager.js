/*
 * BENA — Property Management Company experience (role id `manager`).
 * Organisation: Arkan Property Management (org_arkan); persona Rania Odeh.
 * Portfolio = key buildings whose manager is org_arkan (6 buildings).
 * Desktop-first operations console; phones get the navy drawer.
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon } = B;
  const ui = B.ui;
  const D = B.data;
  const T = (en, ar) => ({ en, ar });
  const R = 'manager';
  const ORG = 'org_arkan';

  Object.assign(B.statuses, {
    reminded: { en: 'Reminder sent', ar: 'أُرسل تذكير', tone: 'info', icon: 'bell' },
    holdover: { en: 'Holding over', ar: 'تمديد ضمني', tone: 'bad', icon: 'clock' },
    current: B.statuses.current || { en: 'Current', ar: 'حالي', tone: 'mint' },
    noticeDue: { en: 'Notice due', ar: 'موعد الإشعار', tone: 'warn', icon: 'bell' },
  });

  /* =====================================================================
   * Portfolio data (derived from B.data, plus manager-only records)
   * ===================================================================== */
  const MX = (D.managerX = D.managerX || {});
  const todayIso = '2026-11-25';
  const seedOf = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const blds = () => D.keyBuildings.filter((b) => b.manager === ORG);
  const bIds = () => blds().map((b) => b.id);
  const inPf = (bid) => bIds().includes(bid);
  const pUnits = () => D.units.filter((u) => inPf(u.building));
  const pLeases = () => D.leases.filter((l) => inPf(l.building));
  const bld = (id) => D.building(id);
  const money = B.money;
  const moneyC = (n) => (B.isAr() ? `${B.compact(n)} ₪` : `₪${B.compact(n)}`);
  const unitName = (u) => D.unitLabel(u);
  const ymLabel = (ym) => { const [y, m] = ym.split('-').map(Number); return `${B.monLong(m - 1)} ${y}`; };
  const iso = (y, m, d = 1) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const addDays = (d, n) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return iso(x.getFullYear(), x.getMonth() + 1, x.getDate()); };

  /* Data fix: generated leases put ~1 in 3 Arkan contracts past their end
   * date. Arkan contracts auto-renew yearly unless notice is given, so roll
   * most of them forward one term at a time; keep a few genuine holdovers. */
  D.leases.forEach((l) => {
    if (l.status !== 'expired' || !inPf(l.building) || l._rolled) return;
    if (seedOf(l.id) % 5 === 0) return; // genuine holdover
    let end = l.end; const was = l.end;
    while (end < todayIso) { const [y, m, d] = end.split('-').map(Number); end = iso(y + 1, m, d); }
    l.end = end; l.autoRenewed = was; l._rolled = true;
    const days = B.daysBetween(todayIso, end);
    l.status = days < 75 ? 'expiring' : 'active';
  });

  MX.short = {
    'BN-RAM-00142': T('Masyoun Tower', 'برج الماصيون'), 'BN-RAM-00311': T('Manara BC', 'مركز المنارة'), 'BN-RAM-00415': T('Irsal Plaza', 'بلازا الإرسال'),
    'BN-RAM-00203': T('Ein Munjed', 'عين منجد'), 'BN-RAM-00744': T('Batn Al-Hawa', 'بطن الهوا'), 'BN-RAM-00266': T('Masyoun Heights', 'مرتفعات الماصيون'),
  };
  const sName = (bid) => tx(MX.short[bid] || bld(bid).name);
  MX.agreement = {
    'BN-RAM-00142': { since: '2019-01-01', fee: 6, scope: T('Leasing, collection, common-area operations', 'التأجير والتحصيل وتشغيل المناطق المشتركة'), with: T('Al-Masyoun Tower Owners\' Association', 'جمعية مالكي برج الماصيون') },
    'BN-RAM-00311': { since: '2019-06-15', fee: 8, scope: T('Full building management (no owners\' association)', 'إدارة كاملة للمبنى (دون جمعية مالكين)'), with: T('Majority of unit owners (31 of 48)', 'أغلبية مالكي الوحدات (31 من 48)') },
    'BN-RAM-00415': { since: '2018-03-01', fee: 7, scope: T('Leasing and retail tenant management; facilities by Sanad', 'التأجير وإدارة المستأجرين التجاريين؛ المرافق لدى سند'), with: T('Irsal Plaza Owners\' Association', 'جمعية مالكي بلازا الإرسال') },
    'BN-RAM-00203': { since: '2024-02-10', fee: 6, scope: T('Collection and maintenance coordination', 'التحصيل وتنسيق الصيانة'), with: T('Authorized building manager (Layla Saadeh)', 'المديرة المفوّضة (ليلى سعادة)') },
    'BN-RAM-00744': { since: '2022-09-01', fee: 9, scope: T('Villa leasing and upkeep', 'تأجير الفلل وصيانتها'), with: T('Six villa owners (individual mandates)', 'ستة مالكي فلل (تفويضات فردية)') },
    'BN-RAM-00266': { since: '2020-05-01', fee: 6, scope: T('Leasing, collection, vacant-unit marketing', 'التأجير والتحصيل وتسويق الوحدات الشاغرة'), with: T('Masyoun Heights Committee', 'لجنة مرتفعات الماصيون') },
  };

  /* Arrears per lease (months unpaid, newest first). Consistent with the owner app. */
  MX.arrOverride = { 'L-2025-0702': 1, 'L-2026-0803': 0, 'L-2024-0415': 0 };
  MX.paid = {};       // lease id → recorded in this session
  MX.reminded = {};   // lease id → date
  const arrears = (l) => {
    if (MX.paid[l.id]) return 0;
    if (l.id in MX.arrOverride) return MX.arrOverride[l.id];
    if (l.start > todayIso) return 0;
    const h = seedOf(l.id) % 100;
    return h < 84 ? 0 : h < 93 ? 1 : h < 97 ? 2 : 3;
  };
  const outstanding = (l) => arrears(l) * l.rent;
  const daysLate = (l) => { const a = arrears(l); return a ? B.daysBetween(iso(2026, 12 - a, 1), todayIso) : 0; };
  const bucket = (l) => { const d = daysLate(l); return !d ? null : d <= 30 ? 'b30' : d <= 60 ? 'b60' : 'b90'; };
  const leaseState = (l) => (l.status === 'expired' ? 'holdover' : l.status);

  /* Previous tenancies (for unit relationship history) */
  const POOL = ['p_adel', 'p_nadia', 'p_ibrahim', 'p_layla', 'p_majd', 'p_sireen', 'p_hani', 'p_ruba', 'p_yara', 'p_ahmad', 'p_dima', 'p_reem', 'p_suha', 'p_noor', 'p_lama', 'p_salma'];
  const prevTenancy = (u) => {
    const ox = D.ownerX && D.ownerX.pastLeases ? D.ownerX.pastLeases.filter((x) => x.unit === u.id) : [];
    if (ox.length) return ox.map((x) => ({ tenant: x.tenant, start: x.start, end: x.end, rent: x.rent, id: x.id }));
    const h = seedOf(u.id);
    if (h % 3 === 0) return [];
    const l = D.leaseOfUnit(u.id);
    const end = l ? addDays(l.start, -1) : '2026-06-30';
    const y = +end.slice(0, 4) - 1 - (h % 2);
    return [{ tenant: POOL[h % POOL.length], start: `${y}-${end.slice(5, 7)}-01`, end, rent: Math.round(((l ? l.rent : 2400) * 0.94) / 50) * 50, id: `L-${y}-${String(1000 + (h % 8000)).slice(0, 4)}` }];
  };
  const ownerSince = (u) => {
    const h = D.ownerX && D.ownerX.history && D.ownerX.history[u.id];
    if (h) return h[0].from;
    const b = bld(u.building); const s = seedOf(u.id);
    return iso(Math.min(2025, b.year + (s % 6)), 1 + (s % 12), 1 + (s % 27));
  };

  /* Service accounts */
  MX.utilities = (bid) => {
    if (D.utilities[bid]) return D.utilities[bid];
    const b = bld(bid); const n = b.units; const s = seedOf(bid);
    const tr = (base) => Array.from({ length: 6 }, (_, i) => Math.round(base * (0.88 + ((s >> i) % 7) * 0.035)));
    const code = bid.slice(-3);
    const el = Math.round(n * 48 / 10) * 10, wt = Math.round(n * 34 / 10) * 10;
    const list = [
      { kind: 'electricity', name: T('Common-area electricity', 'كهرباء المناطق المشتركة'), acct: `EL-${3300 + (s % 90)}-0${code}`, trend: tr(el), status: 'paid' },
      { kind: 'water', name: T('Municipal water (bulk meter)', 'مياه البلدية (العداد الرئيسي)'), acct: `WT-RM-${70000 + (s % 9000)}`, trend: tr(wt), status: s % 2 ? 'due' : 'paid' },
      { kind: 'waste', name: T('Municipal waste collection', 'جمع النفايات البلدية'), acct: `MW-RM-0${code}`, trend: tr(Math.round(n * 11)).map(() => Math.round(n * 11)), status: 'paid' },
    ];
    if (b.elevators) list.push({ kind: 'elevator', name: T('Elevator maintenance contract', 'عقد صيانة المصاعد'), acct: `LL-${code}-${b.elevators}C`, trend: tr(b.elevators * 350).map(() => b.elevators * 350), status: 'paid' });
    list.forEach((x) => { x.last = x.trend[5]; });
    return list;
  };
  const utilIcon = { electricity: 'zap', water: 'droplet', internet: 'wifi', waste: 'trash', elevator: 'elevator' };

  /* Building documents */
  MX.docs = (bid) => {
    const b = bld(bid); const a = MX.agreement[bid];
    return [
      { name: L(`Management agreement — ${sName(bid)}`, `اتفاقية الإدارة — ${sName(bid)}`), date: a.since, icon: 'handshake', tone: 'navy', size: '1.6 MB' },
      { name: L('Building insurance policy 2026', 'بوليصة تأمين المبنى 2026'), date: '2026-01-04', icon: 'shield', size: '2.3 MB' },
      { name: L('Civil defence fire-safety certificate', 'شهادة الدفاع المدني للسلامة من الحريق'), date: '2026-07-20', icon: 'fireExt', size: '540 KB' },
      b.elevators ? { name: L('Elevator certification', 'ترخيص المصاعد'), date: '2026-09-14', icon: 'elevator', size: '410 KB' } : null,
      b.permit ? { name: L(`Building permit ${b.permit}`, `رخصة البناء ${b.permit}`), date: `${b.year - 2}-05-10`, icon: 'landmark', size: '3.1 MB' } : null,
      { name: L('Q3 2026 owners\' financial statement', 'البيان المالي للمالكين — الربع الثالث 2026'), date: '2026-10-10', icon: 'chart', tone: 'mint', size: '780 KB' },
      { name: L('Common-area inspection report — October', 'تقرير تفقد المناطق المشتركة — تشرين الأول'), date: '2026-10-28', icon: 'clipboard', size: '1.2 MB' },
    ].filter(Boolean);
  };

  /* Monthly collections trend for the portfolio (Dec → Nov) */
  MX.months = (() => { const out = []; for (let i = 11; i >= 0; i--) { const d = new Date(2026, 10 - i, 1); out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); } return out; })();
  MX.rate = [0.93, 0.95, 0.92, 0.96, 0.94, 0.97, 0.95, 0.93, 0.96, 0.95, 0.94, 0.0];

  /* =====================================================================
   * Derived figures
   * ===================================================================== */
  const bStats = (bid) => {
    const us = D.unitsOf(bid); const ls = D.leases.filter((l) => l.building === bid);
    const c = (s) => us.filter((u) => u.status === s).length;
    const roll = B.sum(ls, (l) => l.rent);
    const out = B.sum(ls, outstanding);
    const novOut = B.sum(ls.filter((l) => arrears(l) > 0), (l) => l.rent);
    const reqs = D.requestsOf(bid).filter((q) => !['completed', 'resolved', 'cancelled'].includes(q.status));
    return { units: us.length, rented: c('rented'), own: c('ownerOccupied'), vacant: c('vacant'), maint: c('maintenance'), occ: ((c('rented') + c('ownerOccupied')) / (us.length || 1)) * 100, leases: ls.length, roll, out, collected: roll - novOut, reqs: reqs.length, charges: B.sum(us, (u) => u.charge) };
  };
  const pf = () => {
    const us = pUnits(); const ls = pLeases();
    const occ = us.filter((u) => u.status === 'rented' || u.status === 'ownerOccupied').length;
    const reqs = D.requests.filter((q) => inPf(q.building) && !['completed', 'resolved', 'cancelled'].includes(q.status));
    return { units: us.length, occ, occPct: (occ / us.length) * 100, vacant: us.filter((u) => u.status === 'vacant').length, maint: us.filter((u) => u.status === 'maintenance').length, active: ls.filter((l) => l.status !== 'expired').length, leases: ls.length, out: B.sum(ls, outstanding), arrearsCount: ls.filter((l) => arrears(l) > 0).length, roll: B.sum(ls, (l) => l.rent), reqs };
  };

  /* =====================================================================
   * Styles (prefixed mg-)
   * ===================================================================== */
  B.css(`
  .mg-kband { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; padding: 0; overflow: hidden; }
  .mg-kband > div { padding: 18px 20px; border-inline-end: 1px solid var(--line-2); border-bottom: 1px solid var(--line-2); min-width: 0; }
  .mg-kband > div:nth-child(4n) { border-inline-end: 0; }
  .mg-kband > div:nth-last-child(-n+4) { border-bottom: 0; }
  .mg-kband .kb-l { font-size: 12.5px; color: var(--text-2); display: flex; align-items: center; gap: 6px; }
  .mg-kband .kb-l svg { width: 15px; height: 15px; color: var(--text-3); }
  .mg-kband .kb-v { font-family: var(--font-display); font-size: 26px; font-weight: 700; margin-top: 6px; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
  .mg-kband .kb-v small { font-size: 13px; color: var(--text-3); font-weight: 600; margin-inline-start: 3px; }
  .mg-kband .kb-f { font-size: 12px; color: var(--text-3); margin-top: 2px; }
  .mg-kband .kb-f.bad { color: var(--bad); } .mg-kband .kb-f.ok { color: var(--ok); }
  .mg-welcome { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .mg-welcome h1 { font-size: 26px; }
  .mg-bcard { padding: 0; overflow: hidden; display: flex; flex-direction: column; text-align: start; width: 100%; }
  .mg-bcard .media { border-radius: 0; aspect-ratio: 16 / 9; }
  .mg-bcard .bc-b { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .mg-bcard h3 { font-size: 16px; }
  .mg-occ { display: flex; height: 8px; border-radius: 99px; overflow: hidden; background: var(--line-2); gap: 2px; }
  .mg-occ i { display: block; height: 100%; }
  .mg-mini { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .mg-mini div { background: var(--surface-2); border-radius: 10px; padding: 8px 10px; min-width: 0; }
  .mg-mini b { display: block; font-size: 15px; font-variant-numeric: tabular-nums; }
  .mg-mini span { font-size: 11px; color: var(--text-3); }
  .mg-legend { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12px; color: var(--text-2); }
  .mg-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .mg-legend i { width: 8px; height: 8px; border-radius: 3px; display: inline-block; }
  .mg-board { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; align-items: start; }
  .mg-col { background: var(--surface-2); border: 1px solid var(--line); border-radius: var(--r); padding: 12px; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
  .mg-col .cl-h { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 2px 4px; font-weight: 650; font-size: 13.5px; }
  .mg-col .cl-h .c { font-size: 11.5px; background: #fff; border: 1px solid var(--line); border-radius: 99px; padding: 1px 8px; color: var(--text-2); }
  .mg-req { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 8px; text-align: start; min-width: 0; }
  .mg-req .rq-t { font-weight: 600; font-size: 13.5px; line-height: 1.35; }
  .mg-req .rq-m { font-size: 12px; color: var(--text-3); display: flex; flex-wrap: wrap; gap: 4px 10px; }
  .mg-req .rq-f { display: flex; align-items: center; justify-content: space-between; gap: 8px; border-top: 1px solid var(--line-2); padding-top: 8px; font-size: 12px; }
  .mg-req .rq-cat { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 600; color: var(--text-2); }
  .mg-req .rq-cat svg { width: 14px; height: 14px; color: var(--mint-ink); }
  .mg-ws-head { display: grid; grid-template-columns: minmax(0, 1fr) 300px; }
  .mg-ws-head .bh-art { min-height: 220px; }
  .mg-aging { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .mg-age { border-radius: 14px; padding: 14px 16px; border: 1px solid var(--line); background: #fff; text-align: start; display: flex; flex-direction: column; gap: 4px; width: 100%; }
  .mg-age.on { border-color: var(--navy); box-shadow: 0 0 0 1px var(--navy) inset; }
  .mg-age .ag-l { font-size: 12px; color: var(--text-2); display: flex; justify-content: space-between; gap: 6px; }
  .mg-age .ag-v { font-family: var(--font-display); font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .mg-age .progress { margin-top: 6px; }
  .mg-cal-h { display: flex; align-items: center; gap: 8px; }
  .mg-cal-h h3 { font-size: 17px; min-width: 150px; text-align: center; }
  .mg-floors .floor .fu button { font-size: 10px; }
  .mg-i14 { width: 14px; height: 14px; flex: none; display: inline-block; vertical-align: -2px; }
  .mg-attn .li-sub b { color: var(--ink); }
  .mg-chart .bars .col:nth-last-child(-n+2) .tip { inset-inline-end: 0; }
  .mg-chart .bars .col:nth-child(-n+2) .tip { inset-inline-start: 0; }
  .mg-chart .line-chart .hz:nth-last-child(-n+2) .tip { left: auto; right: 0; transform: none; }
  .mg-chart .line-chart .hz:nth-child(-n+2) .tip { left: 0; transform: none; }
  html[dir="rtl"] .mg-chart .line-chart .hz:nth-last-child(-n+2) .tip { right: auto; left: 0; }
  html[dir="rtl"] .mg-chart .line-chart .hz:nth-child(-n+2) .tip { left: auto; right: 0; }
  .mg-ws-head .id-mono { color: var(--navy-ink); }
  .mg-navy .kv { border-color: rgba(255,255,255,.08); }
  .mg-navy .kv > span:first-child { color: var(--navy-ink); }
  .mg-chip-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  .mg-board-seg { display: none; }
  @media (max-width: 1180px) { .mg-board { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 900px) { .mg-ws-head { grid-template-columns: minmax(0, 1fr); } .mg-ws-head .bh-art { min-height: 150px; order: -1; } }
  @media (max-width: 767px) {
    .mg-kband { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .mg-kband > div { padding: 14px 16px; border-bottom: 1px solid var(--line-2) !important; border-inline-end: 1px solid var(--line-2) !important; }
    .mg-kband > div:nth-child(2n) { border-inline-end: 0 !important; }
    .mg-kband > div:nth-last-child(-n+2) { border-bottom: 0 !important; }
    .mg-kband .kb-v { font-size: 22px; }
    .mg-board { grid-template-columns: minmax(0, 1fr); }
    .mg-chart .bars .col .lbl { white-space: normal; width: 100%; text-align: center; line-height: 1.15; font-size: 10px; bottom: -30px; }
    .mg-chart .bars { margin-bottom: 14px; }
    .mg-board-seg { display: block; }
    .mg-board .mg-col:not(.show-m) { display: none; }
    .mg-aging { grid-template-columns: minmax(0, 1fr); gap: 8px; }
    .mg-welcome h1 { font-size: 22px; }
    .mg-cal-h h3 { min-width: 0; flex: 1; font-size: 15px; }
  }
  `);

  /* =====================================================================
   * Fragments
   * ===================================================================== */
  const sectionTitle = (title, extra = '') => `<div class="section-title"><h2>${title}</h2>${extra}</div>`;
  const occBar = (s) => `<div class="mg-occ"><i style="width:${(s.rented / s.units) * 100}%;background:var(--mint)"></i><i style="width:${(s.own / s.units) * 100}%;background:#7FA7C2"></i><i style="width:${(s.maint / s.units) * 100}%;background:#F2B35A"></i></div>`;
  const occLegend = () => `<div class="mg-legend"><span><i style="background:var(--mint)"></i>${L('Rented', 'مؤجّرة')}</span><span><i style="background:#7FA7C2"></i>${L('Owner-occupied', 'يسكنها المالك')}</span><span><i style="background:#F2B35A"></i>${L('Maintenance', 'صيانة')}</span><span><i style="background:var(--line-2);box-shadow:0 0 0 1px var(--line) inset"></i>${L('Vacant', 'شاغرة')}</span></div>`;
  const facade = (bid, sky) => { const b = bld(bid); return B.art.facade(seedOf(bid) % 997 + 3, { type: b.type, floors: b.floors, sky }); };
  const tenantCell = (l) => `<div class="cell-main">${ui.avatar(D.pname(l.tenant), 'sm')}<div style="min-width:0"><b>${esc(D.pname(l.tenant))}</b><small>${ui.idMono(l.id)}</small></div></div>`;
  const unitCell = (u) => `<div class="cell-main"><div style="min-width:0"><b>${esc(unitName(u))}</b><small>${esc(sName(u.building))} · ${L('Fl.', 'ط')} ${u.floor === 0 ? L('G', 'أرضي') : u.floor}</small></div></div>`;
  const buildingOpts = (all = true) => (all ? [{ v: 'all', l: L('All buildings', 'كل المباني') }] : []).concat(blds().map((b) => ({ v: b.id, l: sName(b.id) })));
  const catIcon = (c) => D.cat(c).icon;
  const openStatuses = ['open', 'new', 'quoted', 'assigned', 'scheduled', 'inProgress'];

  const leaseCols = (o = {}) => [
    { key: 'tenant', label: L('Tenant', 'المستأجر'), m: 'title', render: tenantCell, mRender: (l) => esc(D.pname(l.tenant)), sort: (l) => D.pname(l.tenant) },
    { key: 'unit', label: L('Unit', 'الوحدة'), m: 'sub', render: (l) => `${esc(unitName(D.unit(l.unit)))}${o.noBuilding ? '' : ` <span class="faint">· ${esc(sName(l.building))}</span>`}` },
    { key: 'owner', label: L('Owner', 'المالك'), m: 'hide', render: (l) => esc(D.pname(l.owner)) },
    { key: 'end', label: L('Ends', 'ينتهي'), sort: true, m: 'meta', render: (l) => `<span class="nowrap">${B.date(l.end)}</span>` },
    { key: 'status', label: L('Status', 'الحالة'), m: 'meta', render: (l) => ui.status(leaseState(l)) },
    { key: 'rent', label: L('Rent', 'الإيجار'), align: 'end', sort: true, m: 'end', render: (l) => `<b class="num">${money(l.rent)}</b>` },
  ];

  /* =====================================================================
   * Actions & forms
   * ===================================================================== */
  B.act.mgAssign = (rid) => {
    const q = D.request(rid);
    const provs = D.providers.filter((p) => p.cats.includes(q.cat));
    const list = provs.concat(D.providers.filter((p) => !provs.includes(p) && p.cats.includes('general'))).slice(0, 4);
    B.modal({
      title: q.provider ? L('Reassign provider', 'إعادة إسناد مزوّد') : L('Assign a provider', 'إسناد إلى مزوّد'), sub: `${ui.idMono(q.id)} · ${esc(tx(q.title))}`, form: 'mgAssign',
      body: `<input type="hidden" name="id" value="${q.id}"><div class="stack">
        ${ui.field({ name: 'provider', label: L(`Providers for ${tx(D.cat(q.cat).name)} in ${tx(D.district(bld(q.building).district).name)}`, `مزوّدو ${tx(D.cat(q.cat).name)} في ${tx(D.district(bld(q.building).district).name)}`), type: 'radio', value: q.provider || list[0].id, options: list.map((p) => ({ v: p.id, l: tx(p.name), d: `★ ${p.rating} · ${tx(p.response)}${p.verified ? ` · ${L('Verified', 'موثّق')}` : ''}`, icon: catIcon(p.cats[0]) })) })}
        <div class="form-grid">
          ${ui.field({ name: 'visit', label: L('Visit date', 'موعد الزيارة'), type: 'date', value: q.visit || '2026-11-27', required: true })}
          ${ui.field({ name: 'priority', label: L('Priority', 'الأولوية'), type: 'select', value: q.priority, options: ['low', 'medium', 'high', 'critical'].map((v) => ({ v, l: ui.statusLabel(v) })) })}
          ${ui.field({ name: 'budget', label: L('Approved budget (₪)', 'الميزانية المعتمدة (₪)'), type: 'number', value: 450 })}
          ${ui.field({ name: 'access', label: L('Access', 'الدخول'), type: 'select', options: [{ v: 'tenant', l: L('Tenant will be home', 'المستأجر متواجد') }, { v: 'keys', l: L('Keys at Arkan desk', 'المفاتيح لدى مكتب أركان') }, { v: 'guard', l: L('Building guard', 'حارس المبنى') }] })}
          ${ui.field({ name: 'note', label: L('Note to provider', 'ملاحظة للمزوّد'), type: 'textarea', full: true, value: tx(q.desc || '') })}
        </div></div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Assign & notify', 'إسناد وإشعار'), { kind: 'primary', type: 'submit', icon: 'send' })}`,
    });
  };
  B.submit.mgAssign = (data) => {
    const q = D.request(data.id);
    if (q) { q.provider = data.provider || q.provider; q.status = 'assigned'; q.visit = data.visit || q.visit; if (data.priority) q.priority = data.priority; }
    const p = D.provider(q.provider);
    B.success({ title: L('Provider assigned', 'تم الإسناد'), text: L(`${tx(p.name)} will visit on ${B.date(q.visit)}. The ${q.unit ? 'tenant' : 'committee'} has been notified.`, `سيزور ${tx(p.name)} بتاريخ ${B.date(q.visit)}. تم إشعار ${q.unit ? 'المستأجر' : 'اللجنة'}.`), ref: q.id });
    B.refresh();
  };
  B.act.mgAdvance = (rid) => {
    const q = D.request(rid);
    const next = { assigned: 'inProgress', scheduled: 'inProgress', inProgress: 'completed' }[q.status];
    if (!next) return;
    q.status = next; if (next === 'completed') q.closed = todayIso;
    B.toast(L(`${q.id} moved to ${ui.statusLabel(next)}`, `نُقل ${q.id} إلى ${ui.statusLabel(next)}`));
    B.refresh();
  };
  B.act.mgNewReq = (bid) => {
    B.modal({
      title: L('New maintenance request', 'طلب صيانة جديد'), form: 'mgNewReq',
      body: `<div class="form-grid">
        ${ui.field({ name: 'building', label: L('Building', 'المبنى'), type: 'select', value: bid || bIds()[0], options: buildingOpts(false) })}
        ${ui.field({ name: 'scope', label: L('Location', 'الموقع'), type: 'select', options: [{ v: 'common', l: L('Common area', 'منطقة مشتركة') }, { v: 'unit', l: L('Inside a unit', 'داخل وحدة') }] })}
        ${ui.field({ name: 'cat', label: L('Category', 'الفئة'), type: 'select', options: D.serviceCats.map((c) => ({ v: c.id, l: c.name })) })}
        ${ui.field({ name: 'priority', label: L('Priority', 'الأولوية'), type: 'select', value: 'medium', options: ['low', 'medium', 'high', 'critical'].map((v) => ({ v, l: ui.statusLabel(v) })) })}
        ${ui.field({ name: 'title', label: L('Title', 'العنوان'), full: true, required: true, placeholder: L('e.g. Lobby door closer broken', 'مثال: مغلق باب الردهة معطّل') })}
        ${ui.field({ name: 'desc', label: L('Details', 'التفاصيل'), type: 'textarea', full: true })}
        ${ui.field({ name: 'photos', type: 'file', full: true, placeholder: L('Photos help providers quote faster', 'الصور تساعد المزوّدين على التسعير أسرع') })}
      </div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Create request', 'إنشاء الطلب'), { kind: 'primary', type: 'submit', icon: 'plus' })}`,
    });
  };
  B.submit.mgNewReq = (data) => {
    const id = `MR-${24520 + D.requests.length}`;
    D.requests.unshift({ id, building: data.building || bIds()[0], unit: null, by: 'p_rania', cat: data.cat || 'general', title: { en: data.title || 'Request', ar: data.title || 'طلب' }, desc: { en: data.desc || '', ar: data.desc || '' }, status: 'open', priority: data.priority || 'medium', created: todayIso, provider: null, scope: data.scope || 'common' });
    B.success({ title: L('Request created', 'تم إنشاء الطلب'), text: L('It is now in the “New” column. Assign a provider when ready.', 'أصبح في عمود «جديد». أسنده إلى مزوّد عند الجاهزية.'), ref: id });
    B.refresh();
  };
  B.act.mgRemind = (lid) => {
    const l = D.lease(lid);
    B.modal({
      title: L('Send payment reminder', 'إرسال تذكير بالدفع'), sub: `${esc(D.pname(l.tenant))} · ${esc(unitName(D.unit(l.unit)))}`, size: 'sm', form: 'mgRemind',
      body: `<input type="hidden" name="lease" value="${l.id}">${ui.kv([[L('Outstanding', 'المستحق'), `<b>${money(outstanding(l))}</b>`], [L('Months', 'الأشهر'), arrears(l)], [L('Days late', 'أيام التأخير'), daysLate(l)]])}
        <div style="height:12px"></div>${ui.field({ name: 'channel', label: L('Channel', 'القناة'), type: 'radio', options: [{ v: 'app', l: L('App + SMS', 'التطبيق + رسالة'), icon: 'bell' }, { v: 'letter', l: L('Formal notice', 'إشعار رسمي'), icon: 'doc' }] })}
        <div style="height:12px"></div>${ui.field({ name: 'msg', label: L('Message', 'الرسالة'), type: 'textarea', value: L(`Dear ${D.pname(l.tenant)}, our records show ${money(outstanding(l))} outstanding on your lease ${l.id}. Please settle or contact Arkan.`, `عزيزي/عزيزتي ${D.pname(l.tenant)}، تُظهر سجلاتنا مبلغ ${money(outstanding(l))} مستحقاً على عقدك ${l.id}. يرجى السداد أو التواصل مع أركان.`) })}
        <label class="check" style="margin-top:10px"><input type="checkbox" name="cc" checked><span class="small">${L(`Copy the owner (${D.pname(l.owner)})`, `إرسال نسخة إلى المالك (${D.pname(l.owner)})`)}</span></label>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send reminder', 'إرسال التذكير'), { kind: 'primary', type: 'submit', icon: 'send' })}`,
    });
  };
  B.submit.mgRemind = (data) => { MX.reminded[data.lease] = todayIso; B.success({ title: L('Reminder sent', 'تم إرسال التذكير'), text: L('Delivery is tracked on the payments page.', 'يمكن تتبع التسليم في صفحة الدفعات.') }); B.refresh(); };
  B.act.mgRemindAll = () => {
    const ls = pLeases().filter((l) => arrears(l) > 0 && !MX.reminded[l.id]);
    if (!ls.length) { B.toast(L('All tenants in arrears were already reminded today', 'تم تذكير جميع المتأخرين اليوم')); return; }
    B.confirm({ title: L(`Send ${ls.length} reminders?`, `إرسال ${ls.length} تذكيرات؟`), text: L(`App + SMS reminders to every tenant with an outstanding balance (${money(B.sum(ls, outstanding))} in total). Owners are copied.`, `تذكيرات عبر التطبيق ورسائل نصية لكل مستأجر لديه رصيد مستحق (${money(B.sum(ls, outstanding))} إجمالاً). مع نسخة للمالكين.`), ok: L('Send all', 'إرسال الكل'),
      onOk: () => { ls.forEach((l) => { MX.reminded[l.id] = todayIso; }); B.success({ title: L(`${ls.length} reminders sent`, `تم إرسال ${ls.length} تذكيرات`), ref: B.uid('BATCH') }); B.refresh(); } });
  };
  B.act.mgRecord = (lid) => {
    const l = D.lease(lid);
    B.modal({
      title: L('Record a payment', 'تسجيل دفعة'), sub: `${esc(D.pname(l.tenant))} · ${ui.idMono(l.id)}`, size: 'sm', form: 'mgRecord',
      body: `<input type="hidden" name="lease" value="${l.id}"><div class="stack">
        ${ui.field({ name: 'amount', label: L('Amount received (₪)', 'المبلغ المستلم (₪)'), type: 'number', value: outstanding(l), required: true })}
        ${ui.field({ name: 'date', label: L('Date received', 'تاريخ الاستلام'), type: 'date', value: todayIso, required: true })}
        ${ui.field({ name: 'method', label: L('Method', 'الطريقة'), type: 'select', options: [{ v: 'bank', l: L('Bank transfer', 'تحويل بنكي') }, { v: 'cheque', l: L('Cheque', 'شيك') }, { v: 'cash', l: L('Cash at office', 'نقداً في المكتب') }] })}</div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Record payment', 'تسجيل الدفعة'), { kind: 'primary', type: 'submit', icon: 'check' })}`,
    });
  };
  B.submit.mgRecord = (data) => { MX.paid[data.lease] = data.date || todayIso; B.success({ title: L('Payment recorded', 'تم تسجيل الدفعة'), text: L('Receipt issued to the tenant and the owner statement updated.', 'صدر إيصال للمستأجر وتم تحديث كشف المالك.'), ref: B.uid('RC') }); B.refresh(); };
  B.act.mgRenew = (lid) => {
    const l = D.lease(lid);
    B.modal({
      title: L('Prepare renewal', 'إعداد التجديد'), sub: `${ui.idMono(l.id)} · ${esc(D.pname(l.tenant))}`, form: 'mgRenew',
      body: `<input type="hidden" name="lease" value="${l.id}"><div class="form-grid">
        ${ui.field({ name: 'start', label: L('New term starts', 'بداية المدة الجديدة'), type: 'date', value: addDays(l.end, 1), required: true })}
        ${ui.field({ name: 'term', label: L('Term', 'المدة'), type: 'select', value: '12', options: [{ v: '12', l: L('12 months', '12 شهراً') }, { v: '24', l: L('24 months', '24 شهراً') }] })}
        ${ui.field({ name: 'rent', label: L('Proposed rent (₪)', 'الإيجار المقترح (₪)'), type: 'number', value: Math.round((l.rent * 1.03) / 50) * 50, required: true })}
        ${ui.field({ name: 'approval', label: L('Owner approval', 'موافقة المالك'), type: 'select', options: [{ v: 'request', l: L(`Request from ${D.pname(l.owner)}`, `طلب من ${D.pname(l.owner)}`) }, { v: 'mandate', l: L('Within my mandate (±5%)', 'ضمن تفويضي (±5%)') }] })}
      </div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send to owner & tenant', 'إرسال للمالك والمستأجر'), { kind: 'primary', type: 'submit', icon: 'send' })}`,
    });
  };
  B.submit.mgRenew = (data) => { (MX.renewals = MX.renewals || {})[data.lease] = { rent: +data.rent || 0, sent: todayIso }; B.success({ title: L('Renewal sent', 'تم إرسال التجديد'), text: L('Owner approval and tenant signature are tracked on the contract.', 'تُتابع موافقة المالك وتوقيع المستأجر على العقد.'), ref: B.uid('RNW') }); B.refresh(); };
  B.act.mgMessage = (pid) => B.modal({
    title: L(`Message ${D.pname(pid)}`, `رسالة إلى ${D.pname(pid)}`), size: 'sm', form: 'mgMessage',
    body: `<input type="hidden" name="to" value="${esc(pid)}">${ui.field({ name: 'msg', label: L('Message', 'الرسالة'), type: 'textarea', required: true, placeholder: L('Write your message…', 'اكتب رسالتك…') })}`,
    foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send', 'إرسال'), { kind: 'primary', type: 'submit', icon: 'send' })}`,
  });
  B.submit.mgMessage = (data) => B.success({ title: L('Message sent', 'تم إرسال الرسالة'), text: L(`Delivered to ${D.pname(data.to)} in the BENA app.`, `أُرسلت إلى ${D.pname(data.to)} في تطبيق بينا.`) });
  B.act.mgCal = (d) => { const [y, m] = B.get('mg:cal', '2026-11').split('-').map(Number); const x = new Date(y, m - 1 + +d, 1); B.set('mg:cal', `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`); };

  /* =====================================================================
   * Pages
   * ===================================================================== */
  const P = {};

  /* ---------- Portfolio overview ---------- */
  P.home = () => {
    const s = pf();
    const bs = blds().map((b) => ({ b, s: bStats(b.id) }));
    const expiring = pLeases().filter((l) => l.status === 'expiring').sort(B.by('end'));
    const holdover = pLeases().filter((l) => l.status === 'expired');
    const arrearsL = pLeases().filter((l) => arrears(l) >= 2).sort(B.by(outstanding, -1));
    const highReq = s.reqs.filter((q) => q.priority === 'high' || q.priority === 'critical' || (q.status === 'open' && !q.provider));
    const vac = pUnits().filter((u) => u.status === 'vacant');
    const kb = (ic, l, v, f = '', tone = '', go = '') => `<div ${go ? `data-go="${go}" style="cursor:pointer"` : ''}><div class="kb-l">${icon(ic)}${l}</div><div class="kb-v">${v}</div>${f ? `<div class="kb-f ${tone}">${f}</div>` : ''}</div>`;
    const collected = B.sum(bs, (x) => x.s.collected);
    const trendVals = MX.months.map((ym, i) => (i === 11 ? collected : Math.round(s.roll * (0.94 + i * 0.004) * MX.rate[i])));
    const attn = [
      ...expiring.slice(0, 3).map((l) => ui.li({ icon: 'calendarCheck', tone: 'warn', title: L(`Lease ending — ${esc(unitName(D.unit(l.unit)))}, ${esc(sName(l.building))}`, `عقد ينتهي — ${esc(unitName(D.unit(l.unit)))}، ${esc(sName(l.building))}`), sub: `${esc(D.pname(l.tenant))} · <b>${B.inDays(l.end)}</b>`, go: `${R}-lease-${l.id}` })),
      ...arrearsL.slice(0, 2).map((l) => ui.li({ icon: 'alertCircle', tone: 'bad', title: L(`${arrears(l)} months in arrears — ${esc(D.pname(l.tenant))}`, `متأخر ${arrears(l)} أشهر — ${esc(D.pname(l.tenant))}`), sub: `${esc(unitName(D.unit(l.unit)))} · ${esc(sName(l.building))} · <b>${money(outstanding(l))}</b>`, go: `${R}-payments` })),
      ...highReq.slice(0, 2).map((q) => ui.li({ icon: catIcon(q.cat), tone: 'violet', title: esc(tx(q.title)), sub: `${esc(sName(q.building))} · ${ui.statusLabel(q.priority)} · ${q.provider ? esc(tx(D.provider(q.provider).name)) : `<b>${L('No provider yet', 'لم يُسند بعد')}</b>`}`, go: `${R}-maintenance` })),
      holdover.length ? ui.li({ icon: 'clock', tone: 'bad', title: L(`${holdover.length} leases past their end date`, `${holdover.length} عقود تجاوزت تاريخ انتهائها`), sub: L('Tenants holding over — renew or regularise', 'مستأجرون بتمديد ضمني — جدّد أو سوِّ الوضع'), go: `${R}-leases` }) : '',
    ].filter(Boolean);
    return `<div class="stack-lg">
      <div class="mg-welcome"><div><div class="eyebrow" style="margin-bottom:6px">${L('Arkan Property Management', 'أركان لإدارة العقارات')} · ${B.date(todayIso)}</div><h1>${L('Good morning, Rania', 'صباح الخير، رانيا')}</h1><p class="muted small" style="margin-top:4px">${L(`${blds().length} buildings · ${s.units} units under management · ${s.reqs.length} open requests`, `${blds().length} مبانٍ · ${s.units} وحدة تحت الإدارة · ${s.reqs.length} طلبات مفتوحة`)}</p></div>
        <div class="row wrap">${ui.btn(L('New request', 'طلب جديد'), { icon: 'plus', act: 'mgNewReq', arg: '' })}${ui.btn(L('Send reminders', 'إرسال التذكيرات'), { kind: 'primary', icon: 'bell', act: 'mgRemindAll' })}</div></div>
      <section class="card mg-kband">
        ${kb('building', L('Buildings', 'المباني'), blds().length, L(`${s.units} units`, `${s.units} وحدة`), '', `${R}-buildings`)}
        ${kb('pie', L('Occupancy', 'نسبة الإشغال'), B.pct(s.occPct, 1), L('+1.8 pts vs. Q2', '+1.8 نقطة عن الربع الثاني'), 'ok', `${R}-units`)}
        ${kb('contract', L('Active leases', 'عقود سارية'), s.active, L(`${expiring.length} expiring in 75 days`, `${expiring.length} تنتهي خلال 75 يوماً`), '', `${R}-leases`)}
        ${kb('door', L('Vacant units', 'وحدات شاغرة'), s.vacant, L(`${s.maint} under maintenance`, `${s.maint} تحت الصيانة`), '', `${R}-units`)}
        ${kb('wallet', L('Rent roll / month', 'الإيجار الشهري'), moneyC(s.roll), L(`${s.leases} leases`, `${s.leases} عقداً`))}
        ${kb('alertCircle', L('Outstanding rent', 'إيجارات مستحقة'), moneyC(s.out), L(`${s.arrearsCount} tenants in arrears`, `${s.arrearsCount} مستأجرين متأخرين`), 'bad', `${R}-payments`)}
        ${kb('wrench', L('Open maintenance', 'صيانة مفتوحة'), s.reqs.length, L(`${s.reqs.filter((q) => !q.provider).length} unassigned`, `${s.reqs.filter((q) => !q.provider).length} غير مُسندة`), '', `${R}-maintenance`)}
        ${kb('percent', L('Collection rate · Nov', 'نسبة التحصيل · ت٢'), B.pct((collected / s.roll) * 100, 1), L('Target 95%', 'الهدف 95%'))}
      </section>
      <div class="grid g-main">
        ${ui.card({ cls: 'mg-chart', title: L('Building financial performance', 'الأداء المالي للمباني'), sub: L('November rent: collected vs outstanding', 'إيجار تشرين الثاني: المحصّل مقابل المستحق'), link: { label: L('Payments', 'الدفعات'), go: `${R}-payments` },
          body: B.charts.bars({ labels: bs.map((x) => sName(x.b.id)), series: [{ name: L('Collected', 'محصّل'), color: '#142B3B', values: bs.map((x) => x.s.collected) }, { name: L('Outstanding', 'مستحق'), color: '#36D6A0', values: bs.map((x) => x.s.roll - x.s.collected) }], height: 250, format: (v) => B.compact(v) })
            + `<div class="mg-mini" style="margin-top:18px"><div><b>${money(s.roll)}</b><span>${L('due this month', 'مستحق هذا الشهر')}</span></div><div><b>${money(collected)}</b><span>${L('collected', 'محصّل')}</span></div><div><b style="color:var(--bad)">${money(s.roll - collected)}</b><span>${L('still open', 'ما زال مفتوحاً')}</span></div></div>` })}
        ${ui.card({ title: L('Needs attention', 'يحتاج إلى متابعة'), sub: L(`${attn.length} items`, `${attn.length} بنود`), cls: 'mg-attn', body: ui.list(attn) })}
      </div>
      <div class="grid g3">
        ${ui.card({ cls: 'mg-chart span-2', title: L('Rent collected — portfolio', 'الإيجار المحصّل — المحفظة'), sub: L('Last 12 months', 'آخر 12 شهراً'), headExtra: `<div style="text-align:end"><b class="num" style="font-size:18px">${moneyC(B.sum(trendVals, (v) => v))}</b><div class="xs faint">${L('12-month total', 'إجمالي 12 شهراً')}</div></div>`,
          body: B.charts.line({ labels: MX.months.map((ym) => B.mon(+ym.slice(5) - 1)), series: [{ name: L('Collected', 'محصّل'), color: '#36D6A0', values: trendVals, area: true }, { name: L('Rent roll', 'الإيجار المستحق'), color: '#142B3B', values: MX.months.map((_, i) => Math.round(s.roll * (0.94 + i * 0.004))), dashed: true }], height: 200 }) })}
        ${ui.card({ title: L('Unit mix', 'توزيع الوحدات'), body: B.charts.donut({ size: 150, center: { value: B.pct(s.occPct), label: L('occupied', 'مشغولة') }, data: [{ label: L('Rented', 'مؤجّرة'), value: pUnits().filter((u) => u.status === 'rented').length, color: '#36D6A0' }, { label: L('Owner-occupied', 'يسكنها المالك'), value: pUnits().filter((u) => u.status === 'ownerOccupied').length, color: '#7FA7C2' }, { label: L('Vacant', 'شاغرة'), value: s.vacant, color: '#C9D6DF' }, { label: L('Maintenance', 'صيانة'), value: s.maint, color: '#F2B35A' }] }) })}
      </div>
      <div>${sectionTitle(L('Buildings under management', 'المباني تحت الإدارة'), `<button class="link-btn" data-go="${R}-buildings" style="display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:600;color:var(--mint-ink)">${L('All buildings', 'كل المباني')}${icon('chevR', 'flip mg-i14')}</button>`)}
      ${ui.table({ id: 'mgHomeB', rows: bs, rowGo: (x) => `${R}-workspace-${x.b.id}`, cols: [
        { key: 'name', label: L('Building', 'المبنى'), m: 'title', render: (x) => `<div class="cell-main"><span style="width:40px;height:40px;border-radius:10px;overflow:hidden;flex:none;display:block">${facade(x.b.id)}</span><div style="min-width:0"><b>${esc(tx(x.b.name))}</b><small>${esc(tx(D.district(x.b.district).name))} · ${x.s.units} ${L('units', 'وحدة')}</small></div></div>`, mRender: (x) => esc(sName(x.b.id)) },
        { key: 'occ', label: L('Occupancy', 'الإشغال'), m: 'sub', render: (x) => `<div style="min-width:130px"><div class="row between xs" style="margin-bottom:4px"><span class="muted">${B.pct(x.s.occ)}</span><span class="faint">${x.s.vacant} ${L('vacant', 'شاغرة')}</span></div>${occBar(x.s)}</div>` },
        { key: 'roll', label: L('Rent roll', 'الإيجار'), align: 'end', m: 'meta', render: (x) => `<span class="num">${money(x.s.roll)}</span>` },
        { key: 'out', label: L('Outstanding', 'المستحق'), align: 'end', m: 'end', render: (x) => `<b class="num" style="${x.s.out ? 'color:var(--bad)' : ''}">${money(x.s.out)}</b>` },
        { key: 'reqs', label: L('Open requests', 'طلبات مفتوحة'), align: 'end', m: 'meta', render: (x) => `${x.s.reqs} <span class="faint xs">${L('requests', 'طلبات')}</span>` },
      ] })}</div>
    </div>`;
  };

  /* ---------- Buildings ---------- */
  P.buildings = () => {
    const q = B.get('mg:bq', '');
    const list = blds().filter((b) => B.match(q, b.name, b.id, D.district(b.district).name));
    return `${ui.pageHead({ title: L('Buildings', 'المباني'), sub: L('Every building Arkan manages, with occupancy and open work at a glance.', 'كل المباني التي تديرها أركان، مع الإشغال والأعمال المفتوحة بلمحة.') })}
      <div class="stack-lg">
      <div class="toolbar" style="margin-bottom:0">${ui.search('mg:bq', L('Search by name, BENA ID or district…', 'ابحث بالاسم أو رقم بينا أو الحي…'))}</div>
      ${occLegend()}
      ${list.length ? `<div class="grid g3">${list.map((b) => { const s = bStats(b.id); return `<button class="card link mg-bcard" data-go="${R}-workspace-${b.id}">
          <div class="media">${facade(b.id)}<span class="m-tag">${ui.badge(D.types[b.type], 'outline', D.types[b.type].icon, '').replace('badge outline', 'badge outline" style="background:#fff')}</span></div>
          <div class="bc-b"><div><h3 class="truncate">${esc(tx(b.name))}</h3><div class="xs muted truncate" style="margin-top:2px">${esc(tx(b.address))}</div></div>
            <div><div class="row between xs" style="margin-bottom:6px"><span><b>${B.pct(s.occ)}</b> <span class="muted">${L('occupied', 'مشغولة')}</span></span><span class="faint">${s.units} ${L('units', 'وحدة')}</span></div>${occBar(s)}</div>
            <div class="mg-mini"><div><b>${s.vacant}</b><span>${L('vacant', 'شاغرة')}</span></div><div><b style="${s.out ? 'color:var(--bad)' : ''}">${moneyC(s.out)}</b><span>${L('outstanding', 'مستحق')}</span></div><div><b>${s.reqs}</b><span>${L('open requests', 'طلبات مفتوحة')}</span></div></div>
          </div></button>`; }).join('')}</div>` : `<div class="card">${ui.empty({ icon: 'search', title: L('No buildings found', 'لا توجد مبانٍ'), text: L('Try another search.', 'جرّب بحثاً آخر.') })}</div>`}
      </div>`;
  };

  /* ---------- Building workspace ---------- */
  P.workspace = (bid) => {
    const b = bld(bid);
    if (!b || b.manager !== ORG) return ui.empty({ icon: 'building', title: L('Not in your portfolio', 'ليس ضمن محفظتك'), action: ui.btn(L('Buildings', 'المباني'), { kind: 'primary', go: `${R}-buildings` }) });
    B.title(sName(bid)); B.navActive('buildings');
    const s = bStats(bid); const a = MX.agreement[bid];
    const us = D.unitsOf(bid); const ls = D.leases.filter((l) => l.building === bid);
    const com = D.committeeOf(bid); const reqs = D.requestsOf(bid);
    const tab = B.get('mg:wt', 'profile');
    const tabs = [
      { id: 'profile', label: L('Profile', 'الملف'), icon: 'building' }, { id: 'units', label: L('Units', 'الوحدات'), count: us.length }, { id: 'owners', label: L('Owners', 'المالكون') },
      { id: 'tenants', label: L('Tenants', 'المستأجرون') }, { id: 'leases', label: L('Leases', 'العقود'), count: ls.length }, { id: 'committee', label: L('Committee', 'اللجنة') },
      { id: 'financials', label: L('Financials', 'المالية') }, { id: 'services', label: L('Service accounts', 'حسابات الخدمات') }, { id: 'documents', label: L('Documents', 'المستندات') },
      { id: 'maintenance', label: L('Maintenance', 'الصيانة'), count: reqs.filter((q) => openStatuses.includes(q.status)).length },
    ];
    const head = `<section class="b-hero mg-ws-head"><div class="bh-body">
        <div class="row-sm wrap">${ui.badge(L('Managed by Arkan', 'بإدارة أركان'), 'mint', 'briefcase')}${ui.badge(D.types[b.type], '', D.types[b.type].icon)}${b.source === 'gis' ? ui.badge(L('GIS-linked', 'مرتبط بالبلدية'), '', 'landmark') : ''}</div>
        <div><h1>${esc(tx(b.name))}</h1><div class="bh-addr" style="margin-top:6px">${icon('pin')}${esc(tx(b.address))}</div><div style="margin-top:8px;color:#fff">${ui.idMono(b.id)}</div></div>
        <div class="bh-stats"><div><b>${s.units}</b><span>${L('units', 'وحدة')}</span></div><div><b>${B.pct(s.occ)}</b><span>${L('occupied', 'مشغولة')}</span></div><div><b>${money(s.roll)}</b><span>${L('rent roll / mo', 'الإيجار الشهري')}</span></div><div><b>${s.reqs}</b><span>${L('open requests', 'طلبات مفتوحة')}</span></div></div>
      </div><div class="bh-art">${facade(bid, 'navy')}</div></section>`;
    let body = '';
    const unitRowsTable = (rows, id) => ui.table({ id, rows, pageSize: 12, rowGo: (u) => `${R}-unit-${u.id}`, cols: [
      { key: 'number', label: L('Unit', 'الوحدة'), m: 'title', render: (u) => `<b>${esc(unitName(u))}</b>`, sort: (u) => u.floor * 100 + (parseInt(u.number.slice(-2), 10) || 0) },
      { key: 'floor', label: L('Floor', 'الطابق'), m: 'meta', render: (u) => (u.floor === 0 ? L('Ground', 'الأرضي') : u.floor) },
      { key: 'area', label: L('Area', 'المساحة'), m: 'meta', render: (u) => `${u.area} ${L('m²', 'م²')}` },
      { key: 'owner', label: L('Owner', 'المالك'), m: 'sub', render: (u) => esc(D.pname(u.owner)) },
      { key: 'tenant', label: L('Occupant', 'الشاغل'), m: 'hide', render: (u) => (u.status === 'rented' ? esc(D.pname(u.tenant)) : u.status === 'ownerOccupied' ? `<span class="faint">${L('Owner', 'المالك')}</span>` : '<span class="faint">—</span>') },
      { key: 'status', label: L('Status', 'الحالة'), m: 'end', render: (u) => ui.status(u.status) },
    ] });
    if (tab === 'profile') {
      const floors = [...new Set(us.map((u) => u.floor))].sort((x, y) => y - x);
      const cls = { rented: 'u-rented', ownerOccupied: 'u-owner', vacant: 'u-vacant', maintenance: 'u-maint' };
      body = `<div class="grid g-main"><div class="stack">
          ${ui.card({ title: L('Building profile', 'ملف المبنى'), link: { label: L('Full BENA profile', 'ملف بينا الكامل'), go: `${R}-building-${bid}` }, body: ui.kvGrid([
            [L('BENA ID', 'رقم بينا'), ui.idMono(b.id)], [L('Municipal GIS ID', 'رقم البلدية'), b.gis ? ui.idMono(b.gis) : '—'], [L('District', 'الحي'), esc(tx(D.district(b.district).name))], [L('Year built', 'سنة البناء'), b.year],
            [L('Floors', 'الطوابق'), b.floors], [L('Built area', 'المساحة المبنية'), `${B.num(b.area)} ${L('m²', 'م²')}`], [L('Parking', 'المواقف'), b.parking], [L('Elevators', 'المصاعد'), b.elevators],
            [L('Parcel', 'القطعة'), `${b.parcel.basin} / ${b.parcel.parcel}`], [L('Permit', 'الرخصة'), b.permit ? ui.idMono(b.permit) : '—'], [L('Verification', 'التحقق'), ui.status(b.verification)], [L('Facility manager', 'إدارة المرافق'), b.facility ? esc(tx(D.org(b.facility).name)) : L('Arkan (in-house)', 'أركان (داخلياً)')],
          ]) })}
          ${ui.card({ title: L('Unit stack', 'مخطط الوحدات'), sub: L('Tap a unit to open it', 'اضغط على وحدة لفتحها'), headExtra: '', body: `<div class="floors mg-floors">${floors.map((f) => { const fu = us.filter((u) => u.floor === f); return `<div class="floor"><span class="fl">${f === 0 ? L('G', 'أ') : f}</span><div class="fu" style="--n:${fu.length}">${fu.map((u) => `<button class="${cls[u.status]}" data-go="${R}-unit-${u.id}" title="${esc(unitName(u))} · ${esc(ui.statusLabel(u.status))}">${esc(u.number)}</button>`).join('')}</div></div>`; }).join('')}</div><div style="margin-top:14px">${occLegend()}</div>` })}
        </div><div class="stack">
          ${ui.card({ cls: 'navy mg-navy', title: L('Management agreement', 'اتفاقية الإدارة'), body: ui.kv([[L('With', 'مع'), `<b>${esc(tx(a.with))}</b>`], [L('Since', 'منذ'), `<b>${B.date(a.since)}</b>`], [L('Scope', 'النطاق'), `<b>${esc(tx(a.scope))}</b>`], [L('Fee', 'الأتعاب'), `<b>${a.fee}% ${L('of collections', 'من التحصيل')}</b>`]]) })}
          ${ui.card({ title: L('Occupancy', 'الإشغال'), body: B.charts.donut({ size: 130, center: { value: B.pct(s.occ), label: L('occupied', 'مشغولة') }, data: [{ label: L('Rented', 'مؤجّرة'), value: s.rented, color: '#36D6A0' }, { label: L('Owner-occupied', 'يسكنها المالك'), value: s.own, color: '#7FA7C2' }, { label: L('Vacant', 'شاغرة'), value: s.vacant, color: '#C9D6DF' }, { label: L('Maintenance', 'صيانة'), value: s.maint, color: '#F2B35A' }] }) })}
          ${ui.card({ title: L('Contacts', 'جهات الاتصال'), body: ui.list([ui.li({ avatar: D.pname('p_rania'), title: esc(D.pname('p_rania')), sub: L('Portfolio manager · Arkan', 'مديرة المحفظة · أركان'), end: `<span class="xs faint ltr">${esc(D.person('p_rania').phone)}</span>` }), com ? ui.li({ avatar: D.pname(com.members[0].p), title: esc(D.pname(com.members[0].p)), sub: `${esc(tx(com.members[0].role))} · ${esc(tx(com.name))}`, act: 'mgMessage', arg: com.members[0].p }) : '', b.facility ? ui.li({ icon: 'tool', tone: 'navy', title: esc(tx(D.org(b.facility).name)), sub: L('Facility management', 'إدارة المرافق') }) : ''].filter(Boolean)) })}
        </div></div>`;
    } else if (tab === 'units') {
      const f = B.get('mg:wuf', 'all');
      const rows = us.filter((u) => f === 'all' || u.status === f);
      body = `<div class="stack">${ui.chips('mg:wuf', [{ id: 'all', label: L('All', 'الكل'), count: us.length }].concat(['rented', 'ownerOccupied', 'vacant', 'maintenance'].map((k) => ({ id: k, label: ui.statusLabel(k), count: us.filter((u) => u.status === k).length }))), f)}${unitRowsTable(rows, `mgWsU${bid}`)}</div>`;
    } else if (tab === 'owners') {
      const owners = [...new Set(us.map((u) => u.owner))].map((p) => ({ p, units: us.filter((u) => u.owner === p) })).sort((x, y) => y.units.length - x.units.length);
      body = ui.table({ id: `mgWsO${bid}`, rows: owners, pageSize: 12, cols: [
        { key: 'p', label: L('Owner', 'المالك'), m: 'title', render: (o) => `<div class="cell-main">${ui.avatar(D.pname(o.p), 'sm')}<div><b>${esc(D.pname(o.p))}</b><small>${L('Verified owner', 'مالك موثّق')}</small></div></div>`, mRender: (o) => esc(D.pname(o.p)) },
        { key: 'units', label: L('Units', 'الوحدات'), m: 'sub', render: (o) => o.units.map((u) => `<button class="ow-u" data-go="${R}-unit-${u.id}" style="color:var(--mint-ink);font-weight:600;margin-inline-end:8px">${esc(u.number)}</button>`).join('') },
        { key: 'mix', label: L('Use', 'الاستخدام'), m: 'meta', render: (o) => o.units.map((u) => ui.statusLabel(u.status)).filter((v, i, a) => a.indexOf(v) === i).join(' · ') },
        { key: 'charges', label: L('Service charges / mo', 'رسوم الخدمات شهرياً'), align: 'end', m: 'end', render: (o) => `<b class="num">${money(B.sum(o.units, (u) => u.charge))}</b>` },
      ] });
    } else if (tab === 'tenants') {
      body = ui.table({ id: `mgWsT${bid}`, rows: ls, pageSize: 12, rowGo: (l) => `${R}-lease-${l.id}`, cols: [
        { key: 'tenant', label: L('Tenant', 'المستأجر'), m: 'title', render: tenantCell, mRender: (l) => esc(D.pname(l.tenant)) },
        { key: 'unit', label: L('Unit', 'الوحدة'), m: 'sub', render: (l) => esc(unitName(D.unit(l.unit))) },
        { key: 'since', label: L('Since', 'منذ'), m: 'meta', render: (l) => B.date(l.start) },
        { key: 'bal', label: L('Balance', 'الرصيد'), m: 'meta', render: (l) => (arrears(l) ? `<span style="color:var(--bad);font-weight:600">${money(outstanding(l))}</span>` : `<span class="mint-ink">${L('Up to date', 'منتظم')}</span>`) },
        { key: 'status', label: L('Lease', 'العقد'), m: 'end', render: (l) => ui.status(leaseState(l)) },
      ] });
    } else if (tab === 'leases') {
      body = ui.table({ id: `mgWsL${bid}`, rows: ls, pageSize: 12, defaultSort: 'end', rowGo: (l) => `${R}-lease-${l.id}`, cols: leaseCols({ noBuilding: true }) });
    } else if (tab === 'committee') {
      body = com ? `<div class="grid g-main">${ui.card({ title: esc(tx(com.name)), sub: esc(tx(com.basis)), headExtra: ui.status(com.kind), body: ui.list(com.members.map((m) => ui.li({ avatar: D.pname(m.p), title: esc(D.pname(m.p)), sub: `${esc(tx(m.role))}${m.unit ? ` · ${esc(D.unitLabel(D.unit(m.unit)))}` : ''}${m.auth && tx(m.auth) !== '—' ? ` · ${esc(tx(m.auth))}` : ''}`, end: `<span class="xs faint">${L('since', 'منذ')} ${B.dateShort(m.since)}</span>`, act: 'mgMessage', arg: m.p }))) })}
          ${ui.card({ title: L('Association details', 'تفاصيل الجمعية'), body: ui.kv([com.regNo ? [L('Registration', 'رقم التسجيل'), ui.idMono(com.regNo)] : null, [L('Formed', 'التأسيس'), B.date(com.formed)], com.term ? [L('Current term', 'الدورة الحالية'), esc(tx(com.term))] : null, [L('Monthly contribution', 'المساهمة الشهرية'), money(com.monthly)], [L('Members', 'الأعضاء'), com.members.length]]) + `<div style="margin-top:14px">${ui.callout(L('Arkan reports collections and common-area spending to the committee every quarter.', 'ترفع أركان تقارير التحصيل وإنفاق المناطق المشتركة للجنة كل ربع سنة.'), 'mint', 'handshake')}</div>` })}</div>`
        : `<div class="card">${ui.empty({ icon: 'users', title: L('No owners\' committee', 'لا توجد لجنة مالكين'), text: L(`Arkan acts as building manager under a mandate from ${tx(a.with)}.`, `تعمل أركان كمدير للمبنى بتفويض من ${tx(a.with)}.`), action: ui.btn(L('Invite owners to form one', 'دعوة المالكين لتشكيل لجنة'), { act: 'soon', arg: L('Committee invitation', 'دعوة اللجنة') }) })}</div>`;
    } else if (tab === 'financials') {
      const months = MX.months.slice(6);
      const exp = months.map((_, i) => Math.round(s.roll * (0.97 + i * 0.006)));
      const col = months.map((ym, i) => (i === 5 ? s.collected : Math.round(exp[i] * MX.rate[6 + i])));
      const spend = [{ label: L('Cleaning', 'التنظيف'), value: Math.round(s.units * 38), color: '#142B3B' }, { label: L('Electricity (common)', 'الكهرباء (مشتركة)'), value: MX.utilities(bid)[0].last, color: '#36D6A0' }, { label: L('Repairs & maintenance', 'الإصلاح والصيانة'), value: Math.round(s.units * 41), color: '#7FA7C2' }, { label: L('Security & concierge', 'الأمن والاستقبال'), value: Math.round(s.units * 26), color: '#F2B35A' }, { label: L('Management fee', 'أتعاب الإدارة'), value: Math.round((s.collected * a.fee) / 100), color: '#9B8AE0' }];
      body = `<div class="stack"><div class="grid g4">
          ${ui.kpi({ label: L('Rent roll / month', 'الإيجار الشهري'), value: money(s.roll), icon: 'wallet' })}
          ${ui.kpi({ label: L('Collected · Nov', 'المحصّل · ت٢'), value: money(s.collected), icon: 'check', tone: 'mint', foot: B.pct((s.collected / (s.roll || 1)) * 100, 1) })}
          ${ui.kpi({ label: L('Outstanding', 'المستحق'), value: money(s.out), icon: 'alertCircle', tone: s.out ? 'bad' : 'mint' })}
          ${ui.kpi({ label: L('Service charges / mo', 'رسوم الخدمات شهرياً'), value: money(s.charges), icon: 'receipt', tone: 'info' })}
        </div><div class="grid g-main">
          ${ui.card({ cls: 'mg-chart', title: L('Collections vs expected', 'التحصيل مقابل المتوقع'), sub: L('Last 6 months', 'آخر 6 أشهر'), body: B.charts.bars({ labels: months.map((ym) => B.mon(+ym.slice(5) - 1)), series: [{ name: L('Collected', 'محصّل'), color: '#142B3B', values: col }, { name: L('Shortfall', 'العجز'), color: '#F1B5B0', values: exp.map((e, i) => Math.max(0, e - col[i])) }], height: 200 }) })}
          ${ui.card({ title: L('Common-area spending · Nov', 'إنفاق المناطق المشتركة · ت٢'), sub: money(B.sum(spend, (x) => x.value)), body: B.charts.hbars({ data: spend, format: (v) => money(v) }) })}
        </div></div>`;
    } else if (tab === 'services') {
      const ut = MX.utilities(bid);
      body = `<div class="grid g2">${ut.map((x) => ui.card({ body: `<div class="row" style="margin-bottom:12px"><span class="li-icon ${x.status === 'due' ? 'warn' : 'mint'}">${icon(utilIcon[x.kind] || 'zap')}</span><div class="grow"><b>${esc(tx(x.name))}</b><div class="xs muted">${ui.idMono(x.acct)}</div></div>${ui.status(x.status)}</div>
          <div class="row between" style="align-items:flex-end"><div><div class="xs faint">${L('Last bill', 'آخر فاتورة')}</div><b class="num" style="font-size:20px">${money(x.last)}</b></div><div style="width:46%">${B.charts.spark(x.trend, x.status === 'due' ? '#F2B35A' : '#36D6A0')}</div></div>`,
          foot: `<div class="row between"><span class="xs faint">${L('6-month trend', 'اتجاه 6 أشهر')}</span>${x.status === 'due' ? ui.btn(L('Pay bill', 'دفع الفاتورة'), { size: 'sm', kind: 'primary', act: 'soon', arg: L('Utility payment', 'دفع الفاتورة') }) : ui.btn(L('Statement', 'كشف الحساب'), { size: 'sm', icon: 'doc', act: 'previewDoc', arg: x.acct })}</div>` })).join('')}</div>`;
    } else if (tab === 'documents') {
      body = ui.card({ title: L('Building documents', 'مستندات المبنى'), headExtra: ui.btn(L('Upload', 'رفع'), { size: 'sm', icon: 'upload', act: 'soon', arg: L('Upload', 'الرفع') }), body: ui.list(MX.docs(bid).map((d) => ui.doc({ ...d, type: 'PDF' }))) });
    } else if (tab === 'maintenance') {
      body = `<div class="stack"><div class="row between wrap"><span class="muted small">${L(`${reqs.length} requests on record`, `${reqs.length} طلبات مسجّلة`)}</span>${ui.btn(L('New request', 'طلب جديد'), { size: 'sm', kind: 'primary', icon: 'plus', act: 'mgNewReq', arg: bid })}</div>
        ${reqs.length ? ui.card({ cls: 'pad-0', body: `<div class="list boxed">${reqs.map(reqLi).join('')}</div>` }) : `<div class="card">${ui.empty({ icon: 'wrench', title: L('No requests', 'لا توجد طلبات') })}</div>`}</div>`;
    }
    return `<div class="stack-lg">
      <div>${ui.btn(L('Buildings', 'المباني'), { kind: 'text', icon: 'chevL', iconCls: 'flip', go: `${R}-buildings` })}</div>
      ${head}
      <div>${ui.tabs('mg:wt', tabs, tab)}${body}</div></div>`;
  };
  const reqLi = (q) => ui.li({ icon: catIcon(q.cat), tone: q.status === 'completed' ? 'mint' : q.priority === 'high' || q.priority === 'critical' ? 'bad' : '', title: `${esc(tx(q.title))}`,
    sub: `${ui.idMono(q.id)} · ${q.unit ? esc(unitName(D.unit(q.unit))) : L('Common area', 'منطقة مشتركة')} · ${q.provider ? esc(tx(D.provider(q.provider).name)) : L('Unassigned', 'غير مُسند')}${q.visit && q.status !== 'completed' ? ` · ${L('visit', 'زيارة')} ${B.dateShort(q.visit)}` : ''}`,
    end: `${ui.status(q.status)}`, act: q.status === 'completed' ? 'soon' : 'mgAssign', arg: q.status === 'completed' ? L('Job report', 'تقرير العمل') : q.id });

  /* ---------- Units ---------- */
  P.units = () => {
    const f = B.get('mg:uf', 'all'); const bf = B.get('mg:ub', 'all'); const q = B.get('mg:uq', '');
    const base = pUnits().filter((u) => (bf === 'all' || u.building === bf) && B.match(q, u.number, u.id, D.person(u.owner).name, u.tenant && D.person(u.tenant).name));
    const match = (u, k) => k === 'all' || (k === 'occupied' ? u.status === 'rented' || u.status === 'ownerOccupied' : u.status === k);
    const rows = base.filter((u) => match(u, f));
    const chips = [['all', L('All', 'الكل')], ['occupied', L('Occupied', 'مشغولة')], ['vacant', L('Vacant', 'شاغرة')], ['ownerOccupied', L('Owner-occupied', 'يسكنها المالك')], ['rented', L('Rented', 'مؤجّرة')], ['maintenance', L('Under maintenance', 'تحت الصيانة')]];
    return `${ui.pageHead({ title: L('Units', 'الوحدات'), sub: L(`${pUnits().length} units across ${blds().length} buildings.`, `${pUnits().length} وحدة في ${blds().length} مبانٍ.`), actions: ui.btn(L('Export', 'تصدير'), { icon: 'download', act: 'soon', arg: L('Export', 'التصدير') }) })}
      <div class="stack">
      <div class="toolbar" style="margin-bottom:0">${ui.search('mg:uq', L('Search unit, owner or tenant…', 'ابحث عن وحدة أو مالك أو مستأجر…'), { reset: 'mgUnits:page' })}${ui.select('mg:ub', buildingOpts(), { label: L('Building', 'المبنى'), reset: 'mgUnits:page' })}</div>
      ${ui.chips('mg:uf', chips.map(([id, label]) => ({ id, label, count: base.filter((u) => match(u, id)).length })), f)}
      ${ui.table({ id: 'mgUnits', rows, pageSize: 15, rowGo: (u) => `${R}-unit-${u.id}`, cols: [
        { key: 'number', label: L('Unit', 'الوحدة'), m: 'title', render: unitCell, mRender: (u) => `${esc(unitName(u))} <span class="faint xs">· ${esc(sName(u.building))}</span>`, sort: (u) => u.building + String(u.floor).padStart(2, '0') + u.number },
        { key: 'kind', label: L('Type', 'النوع'), m: 'hide', render: (u) => `${esc(tx(D.unitKinds[u.kind]))} · ${u.area} ${L('m²', 'م²')}` },
        { key: 'owner', label: L('Owner', 'المالك'), m: 'sub', sort: (u) => D.pname(u.owner), render: (u) => `<span class="muted">${L('Owner', 'المالك')}:</span> ${esc(D.pname(u.owner))}` },
        { key: 'tenant', label: L('Tenant', 'المستأجر'), m: 'meta', render: (u) => (u.status === 'rented' ? esc(D.pname(u.tenant)) : '<span class="faint">—</span>') },
        { key: 'rent', label: L('Rent', 'الإيجار'), align: 'end', m: 'meta', render: (u) => { const l = D.leaseOfUnit(u.id); return l ? `<span class="num">${money(l.rent)}</span>` : '<span class="faint">—</span>'; } },
        { key: 'status', label: L('Status', 'الحالة'), m: 'end', render: (u) => ui.status(u.status) },
      ] })}
      </div>`;
  };

  /* ---------- Unit detail ---------- */
  P.unit = (id) => {
    const u = D.unit(id);
    if (!u || !inPf(u.building)) return ui.empty({ icon: 'door', title: L('Unit not found in your portfolio', 'الوحدة غير موجودة في محفظتك'), action: ui.btn(L('Units', 'الوحدات'), { kind: 'primary', go: `${R}-units` }) });
    B.title(`${unitName(u)} · ${sName(u.building)}`); B.navActive('units');
    const b = bld(u.building); const l = D.leaseOfUnit(u.id);
    const reqs = D.requests.filter((q) => q.unit === u.id);
    const prev = prevTenancy(u);
    const ownHist = D.ownerX && D.ownerX.history && D.ownerX.history[u.id];
    const ev = [];
    if (ownHist) ownHist.forEach((h, i) => ev.push({ date: h.from, icon: 'key', state: i === 0 ? 'current' : 'done', title: L(`Ownership — ${h.owners.map((o) => (o.p ? D.pname(o.p) : tx(o.org)) + (h.owners.length > 1 ? ` (${o.share}%)` : '')).join(', ')}`, `الملكية — ${h.owners.map((o) => (o.p ? D.pname(o.p) : tx(o.org)) + (h.owners.length > 1 ? ` (${o.share}%)` : '')).join('، ')}`), meta: `${B.date(h.from)}${h.to ? ` – ${B.date(h.to)}` : ''}`, body: esc(tx(h.basis)) }));
    else ev.push({ date: ownerSince(u), icon: 'key', state: 'current', title: L(`Ownership registered — ${D.pname(u.owner)}`, `تسجيل الملكية — ${D.pname(u.owner)}`), meta: B.date(ownerSince(u)), body: L('Title verified against the land registry', 'تم التحقق من السند مع دائرة الأراضي') });
    prev.forEach((p) => { ev.push({ date: p.start, icon: 'contract', state: 'done', title: L(`Lease started — ${D.pname(p.tenant)}`, `بدء عقد — ${D.pname(p.tenant)}`), meta: `${B.date(p.start)} · ${ui.idMono(p.id)}`, body: L(`${money(p.rent)} / month`, `${money(p.rent)} شهرياً`) }); ev.push({ date: p.end, icon: 'flag', state: 'done', title: L(`Lease ended — ${D.pname(p.tenant)}`, `انتهاء عقد — ${D.pname(p.tenant)}`), meta: B.date(p.end), body: L('Deposit settled, unit inspected', 'تمت تسوية التأمين وتفقد الوحدة') }); });
    if (l) ev.push({ date: l.start, icon: 'contract', state: 'current', title: L(`Current lease — ${D.pname(l.tenant)}`, `العقد الحالي — ${D.pname(l.tenant)}`), meta: `${B.date(l.start)} – ${B.date(l.end)} · ${ui.idMono(l.id)}`, body: L(`${money(l.rent)} / month · ${ui.statusLabel(leaseState(l))}`, `${money(l.rent)} شهرياً · ${ui.statusLabel(leaseState(l))}`) });
    reqs.forEach((q) => ev.push({ date: q.created, icon: 'wrench', state: q.status === 'completed' ? 'done' : 'current', title: L(`Maintenance — ${tx(q.title)}`, `صيانة — ${tx(q.title)}`), meta: `${B.date(q.created)} · ${ui.idMono(q.id)} · ${ui.statusLabel(q.status)}`, body: q.provider ? esc(tx(D.provider(q.provider).name)) : L('Awaiting assignment', 'بانتظار الإسناد') }));
    const ol = D.ownerX && D.ownerX.meta && D.ownerX.meta[u.id] && D.ownerX.meta[u.id].listing;
    if (ol && ol.state === 'listed') ev.push({ date: ol.since, icon: 'megaphone', state: 'current', title: L('Listed on the property marketplace', 'عُرضت في سوق العقارات'), meta: `${B.date(ol.since)} · ${ui.idMono(ol.ref)}`, body: L(`${money(ol.ask)} / month · ${ol.inquiries} inquiries`, `${money(ol.ask)} شهرياً · ${ol.inquiries} استفسارات`) });
    ev.sort((x, y) => (x.date < y.date ? 1 : -1));
    const fl = B.get('mg:uhf', 'all');
    const evs = ev.filter((e) => fl === 'all' || (fl === 'owners' ? e.icon === 'key' : fl === 'leases' ? e.icon === 'contract' || e.icon === 'flag' || e.icon === 'megaphone' : e.icon === 'wrench'));
    return `<div class="stack-lg">
      <div>${ui.btn(L('Units', 'الوحدات'), { kind: 'text', icon: 'chevL', iconCls: 'flip', go: `${R}-units` })}</div>
      <section class="card"><div class="row wrap" style="gap:18px;align-items:flex-start">
        <span style="width:96px;height:96px;border-radius:18px;overflow:hidden;flex:none;display:block">${facade(u.building)}</span>
        <div class="grow stack-sm"><div class="row-sm wrap">${ui.status(u.status)}${ui.badge(D.unitKinds[u.kind], 'outline')}</div>
          <h1 style="font-size:24px">${esc(unitName(u))} <span class="faint" style="font-weight:600">· ${esc(tx(b.name))}</span></h1>
          <div class="row-sm wrap small muted">${ui.idMono(u.id)}<span>· ${L('Floor', 'الطابق')} ${u.floor === 0 ? L('G', 'الأرضي') : u.floor} · ${u.area} ${L('m²', 'م²')}${u.beds ? ` · ${u.beds} ${L('bedrooms', 'غرف')}` : ''}</span></div></div>
        <div class="row wrap">${ui.btn(L('Workspace', 'مساحة العمل'), { icon: 'building', go: `${R}-workspace-${b.id}` })}${l ? ui.btn(L('Lease', 'العقد'), { icon: 'contract', go: `${R}-lease-${l.id}` }) : ''}${ui.btn(L('Request', 'طلب'), { icon: 'wrench', kind: 'primary', act: 'mgNewReq', arg: b.id })}</div>
      </div></section>
      <div class="grid g-main">
        ${ui.card({ title: L('Relationship history', 'سجل العلاقات'), sub: L('Owners, tenants, leases and maintenance over time', 'المالكون والمستأجرون والعقود والصيانة عبر الزمن'), body: `<div style="margin-bottom:16px">${ui.seg('mg:uhf', [{ id: 'all', label: L('All', 'الكل') }, { id: 'owners', label: L('Owners', 'المالكون') }, { id: 'leases', label: L('Leases', 'العقود') }, { id: 'maint', label: L('Maintenance', 'الصيانة') }], fl)}</div>${evs.length ? ui.timeline(evs) : ui.empty({ icon: 'history', title: L('Nothing in this view', 'لا شيء هنا') })}` })}
        <div class="stack">
          ${ui.card({ title: L('Owner', 'المالك'), body: ui.list([ui.li({ avatar: D.pname(u.owner), title: esc(D.pname(u.owner)), sub: L(`Since ${B.date(ownerSince(u))}`, `منذ ${B.date(ownerSince(u))}`), act: 'mgMessage', arg: u.owner, end: icon('chat', 'chev') })].concat((u.coOwners || []).map((p) => ui.li({ avatar: D.pname(p), title: esc(D.pname(p)), sub: L('Co-owner', 'مالك مشارك'), act: 'mgMessage', arg: p, end: icon('chat', 'chev') })))) })}
          ${l ? ui.card({ title: L('Current lease', 'العقد الحالي'), link: { label: L('Open', 'فتح'), go: `${R}-lease-${l.id}` }, body: `<div class="row" style="margin-bottom:10px">${ui.avatar(D.pname(l.tenant))}<div class="grow"><b>${esc(D.pname(l.tenant))}</b><div class="xs muted">${ui.idMono(l.id)}</div></div>${ui.status(leaseState(l))}</div>${ui.kv([[L('Rent', 'الإيجار'), money(l.rent)], [L('Ends', 'ينتهي'), `${B.date(l.end)}`], [L('Balance', 'الرصيد'), arrears(l) ? `<span style="color:var(--bad)">${money(outstanding(l))}</span>` : `<span class="mint-ink">${L('Up to date', 'منتظم')}</span>`]])}` })
            : ui.card({ title: L('Occupancy', 'الإشغال'), body: `<p class="small muted">${u.status === 'ownerOccupied' ? L('Occupied by the owner. No lease on record.', 'يسكنها المالك. لا يوجد عقد.') : u.status === 'maintenance' ? L('Closed for works — not available to let.', 'مغلقة للأعمال — غير متاحة للتأجير.') : ol && ol.state === 'listed' ? L(`Vacant and listed at ${money(ol.ask)} / month.`, `شاغرة ومعروضة بـ ${money(ol.ask)} شهرياً.`) : L('Vacant. Listing requires the owner\'s explicit approval.', 'شاغرة. يتطلب العرض موافقة صريحة من المالك.')}</p>` })}
          ${ui.card({ title: L('Unit facts', 'معلومات الوحدة'), body: ui.kv([[L('Monthly service charge', 'رسوم الخدمات الشهرية'), money(u.charge)], [L('Area', 'المساحة'), `${u.area} ${L('m²', 'م²')}`], [L('Type', 'النوع'), esc(tx(D.unitKinds[u.kind]))], [L('Maintenance jobs', 'أعمال الصيانة'), reqs.length]]) })}
        </div></div></div>`;
  };

  /* ---------- Tenants ---------- */
  P.tenants = () => {
    const q = B.get('mg:tq', ''); const bf = B.get('mg:tb', 'all'); const sf = B.get('mg:ts', 'all');
    let rows = pLeases().filter((l) => (bf === 'all' || l.building === bf) && B.match(q, D.person(l.tenant).name, l.id, D.unit(l.unit).number));
    if (sf === 'arrears') rows = rows.filter((l) => arrears(l) > 0); else if (sf === 'expiring') rows = rows.filter((l) => l.status !== 'active');
    const all = pLeases();
    return `${ui.pageHead({ title: L('Tenants', 'المستأجرون'), sub: L('Everyone renting in your buildings, with balances and contract status.', 'كل من يستأجر في مبانيك، مع الأرصدة وحالة العقود.') })}
      <div class="stack">
      <div class="grid g3">
        ${ui.kpi({ label: L('Tenants', 'المستأجرون'), value: new Set(all.map((l) => l.tenant)).size, icon: 'users', foot: L(`${all.length} leases`, `${all.length} عقداً`) })}
        ${ui.kpi({ label: L('In arrears', 'متأخرون'), value: all.filter((l) => arrears(l) > 0).length, icon: 'alertCircle', tone: 'bad', go: `${R}-payments` })}
        ${ui.kpi({ label: L('Renewals to handle', 'تجديدات للمتابعة'), value: all.filter((l) => l.status !== 'active').length, icon: 'refresh', tone: 'warn', go: `${R}-calendar` })}
      </div>
      <div class="toolbar" style="margin-bottom:0">${ui.search('mg:tq', L('Search tenant, unit or contract…', 'ابحث عن مستأجر أو وحدة أو عقد…'), { reset: 'mgTen:page' })}${ui.select('mg:tb', buildingOpts(), { label: L('Building', 'المبنى'), reset: 'mgTen:page' })}</div>
      ${ui.chips('mg:ts', [{ id: 'all', label: L('All', 'الكل') }, { id: 'arrears', label: L('In arrears', 'متأخرون') }, { id: 'expiring', label: L('Expiring / holding over', 'تنتهي / تمديد ضمني') }], sf)}
      ${ui.table({ id: 'mgTen', rows, pageSize: 15, rowGo: (l) => `${R}-lease-${l.id}`, mLead: (l) => ui.avatar(D.pname(l.tenant)), cols: [
        { key: 'tenant', label: L('Tenant', 'المستأجر'), m: 'title', sort: (l) => D.pname(l.tenant), render: (l) => `<div class="cell-main">${ui.avatar(D.pname(l.tenant), 'sm')}<div style="min-width:0"><b>${esc(D.pname(l.tenant))}</b><small class="ltr">${esc(D.person(l.tenant).phone || `+970 59 ${String(seedOf(l.tenant)).slice(0, 3)} ${String(seedOf(l.id)).slice(0, 4)}`)}</small></div></div>`, mRender: (l) => esc(D.pname(l.tenant)) },
        { key: 'unit', label: L('Unit', 'الوحدة'), m: 'sub', render: (l) => `${esc(unitName(D.unit(l.unit)))} <span class="faint">· ${esc(sName(l.building))}</span>` },
        { key: 'rent', label: L('Rent', 'الإيجار'), align: 'end', sort: true, m: 'meta', render: (l) => `<span class="num">${money(l.rent)}</span>` },
        { key: 'bal', label: L('Balance', 'الرصيد'), align: 'end', sort: (l) => outstanding(l), m: 'end', render: (l) => (arrears(l) ? `<b class="num" style="color:var(--bad)">${money(outstanding(l))}</b>` : `<span class="mint-ink small strong">${L('Paid', 'مسدّد')}</span>`) },
        { key: 'status', label: L('Lease', 'العقد'), m: 'meta', render: (l) => ui.status(leaseState(l)) },
      ] })}
      </div>`;
  };

  /* ---------- Leases ---------- */
  P.leases = () => {
    const sf = B.get('mg:lf', 'all'); const bf = B.get('mg:lb', 'all'); const q = B.get('mg:lq', '');
    const base = pLeases().filter((l) => (bf === 'all' || l.building === bf) && B.match(q, l.id, D.person(l.tenant).name, D.person(l.owner).name, D.unit(l.unit).number));
    const rows = base.filter((l) => sf === 'all' || l.status === sf);
    return `${ui.pageHead({ title: L('Leases', 'العقود'), sub: L('All rental contracts Arkan administers on behalf of owners.', 'كل عقود الإيجار التي تديرها أركان نيابةً عن المالكين.'), actions: ui.btn(L('Expiration calendar', 'تقويم الانتهاء'), { icon: 'calendar', go: `${R}-calendar` }) })}
      <div class="stack">
      <div class="toolbar" style="margin-bottom:0">${ui.search('mg:lq', L('Search contract, tenant or owner…', 'ابحث عن عقد أو مستأجر أو مالك…'), { reset: 'mgLeases:page' })}${ui.select('mg:lb', buildingOpts(), { label: L('Building', 'المبنى'), reset: 'mgLeases:page' })}</div>
      ${ui.chips('mg:lf', [{ id: 'all', label: L('All', 'الكل'), count: base.length }, { id: 'active', label: ui.statusLabel('active'), count: base.filter((l) => l.status === 'active').length }, { id: 'expiring', label: ui.statusLabel('expiring'), count: base.filter((l) => l.status === 'expiring').length }, { id: 'expired', label: L('Expired / holding over', 'منتهية / تمديد ضمني'), count: base.filter((l) => l.status === 'expired').length }], sf)}
      ${ui.table({ id: 'mgLeases', rows, pageSize: 15, defaultSort: 'end', rowGo: (l) => `${R}-lease-${l.id}`, cols: leaseCols() })}
      </div>`;
  };

  /* ---------- Lease detail ---------- */
  P.lease = (id) => {
    const l = D.lease(id);
    if (!l || !inPf(l.building)) return ui.empty({ icon: 'contract', title: L('Contract not found', 'العقد غير موجود'), action: ui.btn(L('Leases', 'العقود'), { kind: 'primary', go: `${R}-leases` }) });
    B.title(l.id); B.navActive('leases');
    const u = D.unit(l.unit); const b = bld(l.building);
    const a = arrears(l); const rn = MX.renewals && MX.renewals[l.id];
    const elapsed = Math.max(0, Math.min(100, (B.daysBetween(l.start, todayIso) / B.daysBetween(l.start, l.end)) * 100));
    const sched = []; let [y, m] = l.start.split('-').map(Number); const [ey, em] = l.end.split('-').map(Number);
    let guard = 0;
    while ((y < ey || (y === ey && m <= em)) && guard++ < 48) { const due = iso(y, m, l.payDay || 1); const back = (2026 - y) * 12 + (11 - m); sched.push({ ym: `${y}-${String(m).padStart(2, '0')}`, due, amount: l.rent, status: due > todayIso ? 'upcoming' : back < a ? 'overdue' : 'paid' }); m++; if (m > 12) { m = 1; y++; } }
    // holding over: add months after end up to today
    if (l.status === 'expired') { let [hy, hm] = [ey, em + 1]; if (hm > 12) { hm = 1; hy++; } while (iso(hy, hm, 1) <= todayIso && guard++ < 60) { const back = (2026 - hy) * 12 + (11 - hm); sched.push({ ym: `${hy}-${String(hm).padStart(2, '0')}`, due: iso(hy, hm, 1), amount: l.rent, status: back < a ? 'overdue' : 'paid', hold: true }); hm++; if (hm > 12) { hm = 1; hy++; } } }
    const head = `<section class="card"><div class="row wrap" style="justify-content:space-between;gap:20px">
        <div class="stack-sm" style="gap:10px;min-width:0"><div class="row-sm wrap">${ui.idMono(l.id)}${ui.status(leaseState(l))}${a ? ui.badge(L(`${a} month(s) unpaid`, `${a} شهر غير مدفوع`), 'bad', 'alertCircle') : ''}${rn ? ui.badge(L('Renewal sent', 'أُرسل التجديد'), 'info', 'send') : ''}</div>
          <h1 style="font-size:24px">${esc(unitName(u))} <span class="faint" style="font-weight:600">· ${esc(tx(b.name))}</span></h1>
          <div class="row-sm" style="align-items:baseline"><b class="num" style="font-family:var(--font-display);font-size:30px">${money(l.rent)}</b><span class="faint small">/ ${L('month', 'شهر')}</span></div></div>
        <div class="row" style="gap:14px">${B.charts.ring(elapsed, { size: 80, color: l.status === 'active' ? '#36D6A0' : l.status === 'expiring' ? '#F2B35A' : '#E58A7B', label: `${Math.round(elapsed)}%` })}<div><div class="xs faint">${L('Term', 'المدة')}</div><b>${B.dateShort(l.start)} ${l.start.slice(0, 4)} – ${B.date(l.end)}</b><div class="xs muted">${B.inDays(l.end)}</div></div></div>
      </div>
      <div class="row wrap" style="margin-top:18px">${ui.btn(rn ? L('Revise renewal', 'تعديل التجديد') : L('Prepare renewal', 'إعداد التجديد'), { kind: 'primary', icon: 'refresh', act: 'mgRenew', arg: l.id })}${a ? ui.btn(L('Send reminder', 'إرسال تذكير'), { icon: 'bell', act: 'mgRemind', arg: l.id }) : ''}${a ? ui.btn(L('Record payment', 'تسجيل دفعة'), { icon: 'check', act: 'mgRecord', arg: l.id }) : ''}${ui.btn(L('Message tenant', 'مراسلة المستأجر'), { icon: 'chat', act: 'mgMessage', arg: l.tenant })}${ui.btn(L('Contract PDF', 'ملف العقد'), { icon: 'download', act: 'previewDoc', arg: `${l.id}.pdf` })}</div></section>`;
    const party = (p, role) => ui.li({ avatar: D.pname(p), title: esc(D.pname(p)), sub: `${role}${D.person(p).phone ? ` · <span class="ltr">${esc(D.person(p).phone)}</span>` : ''}`, act: 'mgMessage', arg: p, end: icon('chat', 'chev') });
    return `<div class="stack-lg">
      <div>${ui.btn(L('Leases', 'العقود'), { kind: 'text', icon: 'chevL', iconCls: 'flip', go: `${R}-leases` })}</div>
      ${head}
      <div class="grid g-main"><div>${sectionTitle(L('Payment schedule', 'جدول الدفعات'), a ? `<span class="small" style="color:var(--bad);font-weight:600">${money(outstanding(l))} ${L('outstanding', 'مستحق')}</span>` : `<span class="small mint-ink strong">${L('Up to date', 'منتظم')}</span>`)}
        ${ui.table({ id: `mgSch${l.id}`, rows: sched.slice().reverse(), pageSize: 8, cols: [
          { key: 'ym', label: L('Month', 'الشهر'), m: 'title', render: (p) => `<b>${ymLabel(p.ym)}</b>${p.hold ? ` <span class="xs faint">${L('(holding over)', '(تمديد ضمني)')}</span>` : ''}` },
          { key: 'due', label: L('Due', 'الاستحقاق'), m: 'sub', render: (p) => `<span class="nowrap">${B.date(p.due)}</span>` },
          { key: 'status', label: L('Status', 'الحالة'), m: 'meta', render: (p) => ui.status(p.status) },
          { key: 'amount', label: L('Amount', 'المبلغ'), align: 'end', m: 'end', render: (p) => `<b class="num">${money(p.amount)}</b>` },
        ] })}</div>
        <div class="stack">
          ${ui.card({ title: L('Parties', 'الأطراف'), body: ui.list([party(l.tenant, L('Tenant', 'المستأجر')), party(l.owner, L('Owner (landlord)', 'المالك (المؤجر)')), ui.li({ icon: 'briefcase', tone: 'navy', title: L('Arkan Property Management', 'أركان لإدارة العقارات'), sub: L('Managing agent · POA on file', 'الوكيل المدير · وكالة محفوظة') })]) })}
          ${ui.card({ title: L('Terms', 'الشروط'), body: ui.kv([[L('Start', 'البداية'), B.date(l.start)], [L('End', 'النهاية'), B.date(l.end)], [L('Rent due', 'موعد الدفع'), L(`Day ${l.payDay || 1}`, `اليوم ${l.payDay || 1}`)], [L('Deposit', 'التأمين'), money(l.deposit)], [L('Unit', 'الوحدة'), `<button data-go="${R}-unit-${u.id}" style="color:var(--mint-ink);font-weight:600">${esc(unitName(u))}</button>`], [L('Service charge', 'رسوم الخدمات'), money(u.charge)]]) })}
          ${ui.card({ title: L('Activity', 'النشاط'), body: ui.timeline([rn ? { state: 'current', icon: 'send', title: L(`Renewal proposed at ${money(rn.rent)}`, `اقتراح تجديد بقيمة ${money(rn.rent)}`), meta: B.date(rn.sent) } : null, MX.reminded[l.id] ? { state: 'current', icon: 'bell', title: L('Payment reminder sent', 'أُرسل تذكير بالدفع'), meta: B.date(MX.reminded[l.id]) } : null, l.status !== 'active' ? { state: 'current', icon: 'clock', title: l.status === 'expired' ? L('Term ended — tenant holding over', 'انتهت المدة — تمديد ضمني') : L('Entered renewal window', 'دخل فترة التجديد'), meta: B.date(l.status === 'expired' ? l.end : addDays(l.end, -75)) } : null, { state: 'done', icon: 'play', title: L('Lease started', 'بدء العقد'), meta: B.date(l.start) }, { state: 'done', icon: 'edit', title: L('Signed by owner and tenant', 'وُقّع من المالك والمستأجر'), meta: B.date(addDays(l.start, -12)) }].filter(Boolean)) })}
        </div></div></div>`;
  };

  /* ---------- Expiration calendar ---------- */
  P.calendar = () => {
    const ym = B.get('mg:cal', '2026-11');
    const [y, m] = ym.split('-').map(Number);
    const bf = B.get('mg:cb', 'all');
    const ls = pLeases().filter((l) => bf === 'all' || l.building === bf);
    const events = [];
    ls.forEach((l) => {
      const u = D.unit(l.unit);
      events.push({ date: l.end, kind: 'end', l, label: L(`${u.number} ends`, `${u.number} ينتهي`), tone: l.status === 'expired' ? 'bad' : l.status === 'expiring' ? 'warn' : '', act: 'go', arg: `${R}-lease-${l.id}` });
      const notice = addDays(l.end, -60);
      events.push({ date: notice, kind: 'notice', l, label: L(`Notice · ${u.number}`, `إشعار · ${u.number}`), tone: 'info', act: 'go', arg: `${R}-lease-${l.id}` });
      if (l.id === 'L-2025-0702') events.push({ date: '2026-03-01', kind: 'renewal', l, label: L(`${u.number} renewed`, `${u.number} جُدّد`), tone: 'mint', act: 'go', arg: `${R}-lease-${l.id}` });
      const rn = MX.renewals && MX.renewals[l.id];
      if (rn) events.push({ date: addDays(l.end, 1), kind: 'renewal', l, label: L(`${u.number} renewal`, `${u.number} تجديد`), tone: 'mint', act: 'go', arg: `${R}-lease-${l.id}` });
      if (l.autoRenewed) events.push({ date: addDays(l.autoRenewed, 1), kind: 'renewal', l, label: L(`${u.number} renewed`, `${u.number} جُدّد`), tone: 'mint', act: 'go', arg: `${R}-lease-${l.id}` });
      const sd = seedOf(l.id);
      if (l.status === 'expiring') { const span = Math.max(1, B.daysBetween(todayIso, l.end) - 4); events.push({ date: addDays(todayIso, 2 + (sd % span)), kind: 'meeting', l, label: L(`Meet · ${u.number}`, `اجتماع · ${u.number}`), tone: 'mint', act: 'go', arg: `${R}-lease-${l.id}` }); }
      if (l.status === 'expired') events.push({ date: addDays(todayIso, 3 + (sd % 24)), kind: 'inspect', l, label: L(`Inspect · ${u.number}`, `تفقد · ${u.number}`), tone: 'bad', act: 'go', arg: `${R}-lease-${l.id}` });
    });
    const inMonth = events.filter((e) => e.date.startsWith(ym)).sort(B.by('date'));
    const kindLabel = { end: L('Lease ends', 'انتهاء عقد'), notice: L('Notice deadline (60 days)', 'آخر موعد للإشعار (60 يوماً)'), renewal: L('Renewal effective', 'سريان التجديد'), meeting: L('Renewal meeting with tenant', 'اجتماع تجديد مع المستأجر'), inspect: L('Holdover inspection & regularisation', 'تفقد وتسوية التمديد الضمني') };
    const kindIcon = { end: 'flag', notice: 'bell', renewal: 'refresh', meeting: 'users', inspect: 'clipboard' };
    const showAll = B.get('mg:calAll', false);
    const next90 = ls.filter((l) => { const d = B.daysFromToday(l.end); return d >= 0 && d <= 90; });
    return `${ui.pageHead({ title: L('Expiration calendar', 'تقويم انتهاء العقود'), sub: L('Lease ends, notice deadlines and renewals across the portfolio.', 'انتهاء العقود ومواعيد الإشعار والتجديدات في المحفظة.') })}
      <div class="stack-lg">
      <div class="grid g3">
        ${ui.kpi({ label: L('Ending in 90 days', 'تنتهي خلال 90 يوماً'), value: next90.length, icon: 'calendarCheck', tone: 'warn', foot: money(B.sum(next90, (l) => l.rent)) + L(' / mo at stake', ' شهرياً معرّضة') })}
        ${ui.kpi({ label: L('Holding over', 'تمديد ضمني'), value: ls.filter((l) => l.status === 'expired').length, icon: 'clock', tone: 'bad', go: `${R}-leases` })}
        ${ui.kpi({ label: L('Renewed in 2026', 'جُدّدت في 2026'), value: ls.filter((l) => l.autoRenewed && l.autoRenewed >= '2025-12-31').length + Object.keys(MX.renewals || {}).length, icon: 'refresh', tone: 'mint', foot: L('Auto-renewed or re-signed', 'تجديد تلقائي أو توقيع جديد') })}
      </div>
      <div class="grid g-main">
        ${ui.card({ body: `<div class="row between wrap" style="margin-bottom:14px"><div class="mg-cal-h">${ui.btn('', { size: 'sm', icon: 'chevL', iconCls: 'flip', act: 'mgCal', arg: '-1', title: L('Previous month', 'الشهر السابق') })}<h3>${B.monLong(m - 1)} ${y}</h3>${ui.btn('', { size: 'sm', icon: 'chevR', iconCls: 'flip', act: 'mgCal', arg: '1', title: L('Next month', 'الشهر التالي') })}</div><div class="row-sm">${ym !== '2026-11' ? ui.btn(L('Today', 'اليوم'), { size: 'sm', act: 'set', arg: 'mg:cal=2026-11' }) : ''}${ui.select('mg:cb', buildingOpts(), { label: L('Building', 'المبنى') })}</div></div>${B.ui.calendar({ year: y, month: m - 1, events })}<div class="mg-legend" style="margin-top:14px"><span><i style="background:#F2C27A"></i>${L('Expiring', 'تنتهي قريباً')}</span><span><i style="background:#F1B5B0"></i>${L('Expired', 'منتهية')}</span><span><i style="background:var(--navy)"></i>${L('Lease end', 'انتهاء عقد')}</span><span><i style="background:#BBD0F5"></i>${L('Notice deadline', 'موعد الإشعار')}</span><span><i style="background:var(--mint)"></i>${L('Renewal / meeting', 'تجديد / اجتماع')}</span></div>` })}
        ${ui.card({ title: L('This month', 'هذا الشهر'), sub: L(`${inMonth.length} events`, `${inMonth.length} أحداث`), body: inMonth.length ? ui.list((showAll ? inMonth : inMonth.slice(0, 10)).map((e) => ui.li({ icon: kindIcon[e.kind], tone: e.kind === 'renewal' || e.kind === 'meeting' ? 'mint' : e.kind === 'notice' ? 'info' : e.l.status === 'expired' ? 'bad' : 'warn', title: `${esc(unitName(D.unit(e.l.unit)))} · ${esc(sName(e.l.building))}`, sub: `${kindLabel[e.kind]} · ${B.dateShort(e.date)} · ${esc(D.pname(e.l.tenant))}`, go: `${R}-lease-${e.l.id}` }))) + (inMonth.length > 10 ? `<div style="margin-top:12px">${ui.btn(showAll ? L('Show fewer', 'عرض أقل') : L(`Show all ${inMonth.length}`, `عرض الكل (${inMonth.length})`), { size: 'sm', block: true, act: 'toggle', arg: 'mg:calAll' })}</div>` : '') : ui.empty({ icon: 'calendar', title: L('No events this month', 'لا أحداث هذا الشهر'), action: ui.btn(L('Next month', 'الشهر التالي'), { size: 'sm', act: 'mgCal', arg: '1' }) }) })}
      </div></div>`;
  };

  /* ---------- Payments & outstanding ---------- */
  P.payments = () => {
    const ag = B.get('mg:ag', 'all'); const bf = B.get('mg:pb', 'all');
    const arr = pLeases().filter((l) => arrears(l) > 0 && (bf === 'all' || l.building === bf));
    const sumB = (k) => B.sum(arr.filter((l) => bucket(l) === k), outstanding);
    const tot = B.sum(arr, outstanding);
    const rows = arr.filter((l) => ag === 'all' || bucket(l) === ag).sort(B.by(outstanding, -1));
    const s = pf();
    const dec = pLeases().filter((l) => l.end >= '2026-12-01' || l.status === 'expired');
    const age = (k, label, tone) => `<button class="mg-age ${ag === k ? 'on' : ''}" data-act="set" data-arg="mg:ag=${ag === k ? 'all' : k}"><span class="ag-l"><span>${label}</span><span class="faint">${arr.filter((l) => bucket(l) === k).length} ${L('tenants', 'مستأجرين')}</span></span><span class="ag-v">${money(sumB(k))}</span>${ui.progress(tot ? (sumB(k) / tot) * 100 : 0, tone)}</button>`;
    return `${ui.pageHead({ title: L('Payments & outstanding', 'الدفعات والمستحقات'), sub: L('Rent schedules, arrears aging and reminders across all managed leases.', 'جداول الإيجار وأعمار الديون والتذكيرات لكل العقود المُدارة.'), actions: `${ui.btn(L('Owner statements', 'كشوف المالكين'), { icon: 'doc', act: 'previewDoc', arg: L('Owner statements — November 2026', 'كشوف المالكين — تشرين الثاني 2026') })}${ui.btn(L('Remind all', 'تذكير الجميع'), { kind: 'primary', icon: 'bell', act: 'mgRemindAll' })}` })}
      <div class="stack-lg">
      <div class="grid g-main">
        ${ui.card({ title: L('Outstanding by age', 'المستحقات حسب العمر'), sub: L(`${money(tot)} across ${arr.length} leases · tap a bucket to filter`, `${money(tot)} في ${arr.length} عقود · اضغط على فئة للتصفية`), body: `<div class="mg-aging">${age('b30', L('0–30 days', '0–30 يوماً'), '')}${age('b60', L('31–60 days', '31–60 يوماً'), 'warn')}${age('b90', L('60+ days', 'أكثر من 60 يوماً'), 'bad')}</div>` })}
        ${ui.card({ title: L('Next rent run', 'الدفعات القادمة'), sub: L('Due 1 December 2026', 'مستحقة في 1 كانون الأول 2026'), body: `<div class="row between" style="align-items:flex-end"><div><b class="num" style="font-family:var(--font-display);font-size:28px">${money(B.sum(dec, (l) => l.rent))}</b><div class="xs faint">${L(`${dec.length} scheduled payments`, `${dec.length} دفعة مجدولة`)}</div></div>${B.charts.ring((s.roll - s.out / 2) / s.roll * 100, { size: 64, label: B.pct(94) })}</div><div style="margin-top:14px">${ui.meter(L('Expected on time (history)', 'المتوقع في الموعد (تاريخياً)'), '94%', 94)}</div>` })}
      </div>
      <div class="toolbar" style="margin-bottom:0">${ui.chips('mg:ag', [{ id: 'all', label: L('All arrears', 'كل المتأخرات'), count: arr.length }, { id: 'b30', label: L('0–30', '0–30') }, { id: 'b60', label: L('31–60', '31–60') }, { id: 'b90', label: L('60+', '+60') }], ag)}${ui.select('mg:pb', buildingOpts(), { label: L('Building', 'المبنى') })}</div>
      ${ui.table({ id: 'mgArr', rows, pageSize: 12, empty: { icon: 'checkCircle', title: L('No arrears here', 'لا توجد متأخرات'), text: L('Every tenant in this view is up to date.', 'جميع المستأجرين في هذا العرض منتظمون.') }, cols: [
        { key: 'tenant', label: L('Tenant', 'المستأجر'), m: 'title', render: tenantCell, mRender: (l) => esc(D.pname(l.tenant)) },
        { key: 'unit', label: L('Unit', 'الوحدة'), m: 'sub', render: (l) => `${esc(unitName(D.unit(l.unit)))} <span class="faint">· ${esc(sName(l.building))}</span>` },
        { key: 'age', label: L('Age', 'العمر'), m: 'meta', render: (l) => `${ui.badge(`${daysLate(l)} ${L('days', 'يوماً')}`, bucket(l) === 'b90' ? 'bad' : bucket(l) === 'b60' ? 'warn' : 'neutral')}` },
        { key: 'months', label: L('Months', 'الأشهر'), m: 'meta', render: (l) => L(`${arrears(l)} × ${money(l.rent)}`, `${arrears(l)} × ${money(l.rent)}`) },
        { key: 'rem', label: L('Actions', 'الإجراءات'), m: 'meta', render: (l) => `<span class="row-sm">${MX.reminded[l.id] ? ui.status('reminded') : `<button class="btn btn-soft btn-sm" data-act="mgRemind" data-arg="${l.id}">${icon('bell')}${L('Remind', 'تذكير')}</button>`}${ui.btn('', { size: 'sm', icon: 'check', act: 'mgRecord', arg: l.id, title: L('Record payment', 'تسجيل دفعة') })}${ui.btn('', { size: 'sm', icon: 'chevR', iconCls: 'flip', go: `${R}-lease-${l.id}`, title: L('Open lease', 'فتح العقد') })}</span>` },
        { key: 'out', label: L('Outstanding', 'المستحق'), align: 'end', m: 'end', render: (l) => `<b class="num" style="color:var(--bad)">${money(outstanding(l))}</b>` },
      ] })}
      </div>`;
  };

  /* ---------- Maintenance board ---------- */
  P.maintenance = () => {
    const bf = B.get('mg:mb', 'all'); const mcol = B.get('mg:mc', 'new');
    const reqs = D.requests.filter((q) => inPf(q.building) && (bf === 'all' || q.building === bf));
    const cols = [
      { id: 'new', label: L('New', 'جديد'), short: L('New', 'جديد'), match: ['open', 'new', 'quoted'] },
      { id: 'assigned', label: L('Assigned & scheduled', 'مُسند ومجدول'), short: L('Assigned', 'مُسند'), match: ['assigned', 'scheduled'] },
      { id: 'inProgress', label: L('In progress', 'قيد التنفيذ'), short: L('Active', 'جارٍ'), match: ['inProgress'] },
      { id: 'done', label: L('Completed', 'مكتمل'), short: L('Done', 'منجز'), match: ['completed', 'resolved'] },
    ];
    const card = (q) => `<div class="mg-req">
        <div class="row between" style="gap:8px"><span class="rq-cat">${icon(catIcon(q.cat))}${esc(tx(D.cat(q.cat).name))}</span>${ui.status(q.priority)}</div>
        <div class="rq-t">${esc(tx(q.title))}</div>
        <div class="rq-m"><span>${esc(sName(q.building))}</span><span>${q.unit ? esc(unitName(D.unit(q.unit))) : L('Common area', 'منطقة مشتركة')}</span><span>${ui.idMono(q.id)}</span></div>
        <div class="rq-f">${q.provider ? `<span class="row-sm" style="min-width:0">${ui.avatar(tx(D.provider(q.provider).name), 'sm')}<span class="truncate">${esc(tx(D.provider(q.provider).name))}</span></span>` : `<span class="faint">${L('Unassigned', 'غير مُسند')} · ${B.ago(q.created)}</span>`}
          ${['open', 'new', 'quoted'].includes(q.status) ? ui.btn(L('Assign', 'إسناد'), { size: 'sm', kind: 'primary', act: 'mgAssign', arg: q.id }) : ['assigned', 'scheduled'].includes(q.status) ? ui.btn(L('Start', 'بدء'), { size: 'sm', act: 'mgAdvance', arg: q.id }) : q.status === 'inProgress' ? ui.btn(L('Complete', 'إكمال'), { size: 'sm', kind: 'soft', act: 'mgAdvance', arg: q.id }) : `<span class="xs faint nowrap">${q.closed ? B.dateShort(q.closed) : ''}${q.rating ? ` · ★ ${q.rating}` : ''}</span>`}</div>
        ${q.visit && !['completed', 'resolved'].includes(q.status) ? `<div class="xs muted row-sm">${icon('calendar', 'mg-i14')}${L('Visit', 'الزيارة')} ${B.date(q.visit)}</div>` : ''}
      </div>`;
    const openN = reqs.filter((q) => openStatuses.includes(q.status)).length;
    return `${ui.pageHead({ title: L('Maintenance board', 'لوحة الصيانة'), sub: L(`${openN} open requests across ${bf === 'all' ? blds().length + ' buildings' : sName(bf)}.`, `${openN} طلبات مفتوحة في ${bf === 'all' ? blds().length + ' مبانٍ' : sName(bf)}.`), actions: `${ui.btn(L('Find a provider', 'ابحث عن مزوّد'), { icon: 'search', go: `${R}-services` })}${ui.btn(L('New request', 'طلب جديد'), { kind: 'primary', icon: 'plus', act: 'mgNewReq', arg: bf === 'all' ? '' : bf })}` })}
      <div class="stack">
      <div class="toolbar" style="margin-bottom:0">${ui.select('mg:mb', buildingOpts(), { label: L('Building', 'المبنى') })}<span class="muted small">${L(`${reqs.filter((q) => !q.provider && openStatuses.includes(q.status)).length} need a provider`, `${reqs.filter((q) => !q.provider && openStatuses.includes(q.status)).length} بحاجة إلى مزوّد`)}</span></div>
      <div class="mg-board-seg">${ui.seg('mg:mc', cols.map((c) => ({ id: c.id, label: `${c.short} ${reqs.filter((q) => c.match.includes(q.status)).length}` })), mcol)}</div>
      <div class="mg-board">${cols.map((c) => { const its = reqs.filter((q) => c.match.includes(q.status)); return `<div class="mg-col ${mcol === c.id ? 'show-m' : ''}"><div class="cl-h"><span>${c.label}</span><span class="c">${its.length}</span></div>${its.length ? its.map(card).join('') : `<div class="xs faint" style="padding:8px 4px">${L('Nothing here', 'لا شيء هنا')}</div>`}</div>`; }).join('')}</div>
      </div>`;
  };

  /* =====================================================================
   * Role registration
   * ===================================================================== */
  B.role({
    id: R, icon: 'briefcase', nav: 'drawer',
    name: T('Property Management Company', 'شركة إدارة العقارات'), short: T('Manager', 'المدير'),
    org: T('Arkan Property Management', 'أركان لإدارة العقارات'), tag: T('Operations', 'العمليات'),
    desc: T('Run a portfolio of buildings: units, owners, tenants, leases, collections and maintenance.', 'إدارة محفظة مبانٍ: الوحدات والمالكون والمستأجرون والعقود والتحصيل والصيانة.'),
    personaTitle: T('Rania Odeh · Arkan Property Management', 'رانيا عودة · أركان لإدارة العقارات'),
    home: 'home',
    menu: [
      { group: T('Portfolio', 'المحفظة') },
      { id: 'home', label: T('Portfolio overview', 'نظرة عامة على المحفظة'), icon: 'grid' },
      { id: 'buildings', label: T('Buildings', 'المباني'), icon: 'building', match: ['workspace', 'building'] },
      { id: 'units', label: T('Units', 'الوحدات'), icon: 'layers', match: ['unit'] },
      { group: T('Leasing', 'التأجير') },
      { id: 'tenants', label: T('Tenants', 'المستأجرون'), icon: 'users' },
      { id: 'leases', label: T('Leases', 'العقود'), icon: 'contract', match: ['lease'] },
      { id: 'calendar', label: T('Expiration calendar', 'تقويم الانتهاء'), icon: 'calendar' },
      { group: T('Finance & operations', 'المالية والعمليات') },
      { id: 'payments', label: T('Payments & arrears', 'الدفعات والمتأخرات'), icon: 'wallet' },
      { id: 'maintenance', label: T('Maintenance board', 'لوحة الصيانة'), icon: 'wrench' },
      { id: 'services', label: T('Services marketplace', 'سوق الخدمات'), icon: 'handshake' },
    ],
    pages: P,
    notifications: () => [
      { icon: 'wrench', tone: 'bad', title: L('Elevator B fault — Masyoun Tower', 'عطل المصعد ب — برج الماصيون'), sub: L('LiftLine visit today · MR-24477', 'زيارة لفت لاين اليوم · MR-24477'), when: L('Today', 'اليوم'), go: `${R}-maintenance` },
      { icon: 'alertCircle', tone: 'warn', title: L(`${pf().arrearsCount} tenants in arrears`, `${pf().arrearsCount} مستأجرين متأخرين`), sub: L(`${money(pf().out)} outstanding`, `${money(pf().out)} مستحقة`), when: L('Today', 'اليوم'), go: `${R}-payments` },
      { icon: 'megaphone', title: L('New inquiry — Apartment 604, Masyoun Heights', 'استفسار جديد — شقة 604، مرتفعات الماصيون'), sub: L('Listed for Khaled & Rana Mansour', 'معروضة لخالد ورنا منصور'), when: L('2 h', '2 س'), go: `${R}-unit-BN-RAM-00266-604` },
      { icon: 'calendarCheck', tone: 'info', title: L('Lease L-2026-0803 enters notice window', 'العقد L-2026-0803 يدخل فترة الإشعار'), sub: L('Owner sent a renewal offer reminder', 'تذكير بإرسال عرض التجديد'), when: L('1 d', '1 ي'), go: `${R}-lease-L-2026-0803` },
      { icon: 'userCheck', tone: 'violet', title: L('Power of attorney renewed', 'تجديد الوكالة'), sub: L('Khaled Mansour · 4 units through 2027', 'خالد منصور · 4 وحدات حتى 2027'), when: L('3 d', '3 ي') },
    ],
  });
})();
