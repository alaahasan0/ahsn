/*
 * BENA — Property Management Company experience (role id `manager`).
 * Organisation: Arkan Property Management (org_arkan); persona Rania Odeh.
 * Portfolio = key buildings whose manager is org_arkan (6 buildings).
 * Desktop-first operations console (16 screens; part 2 in manager2.js); phones get the navy drawer.
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon } = B;
  const ui = B.ui;
  const D = B.data;
  const T = (en, ar) => ({ en, ar });
  const PAL8 = ['#142B3B', '#36D6A0', '#7FA7C2', '#F2B35A', '#9B8AE0', '#C9D6DF', '#E58A7B', '#5B7A8F'];
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
    if (seedOf(l.id) % 5 === 0 && B.daysBetween(l.end, todayIso) < 110) return; // genuine (recent) holdover
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
   * Extra manager-only records (all fictional sample data)
   * ===================================================================== */
  Object.assign(MX.agreement['BN-RAM-00142'], { end: '2027-12-31', status: 'active' });
  Object.assign(MX.agreement['BN-RAM-00311'], { end: '2027-06-14', status: 'active' });
  Object.assign(MX.agreement['BN-RAM-00415'], { end: '2028-02-29', status: 'active' });
  Object.assign(MX.agreement['BN-RAM-00203'], { end: '2027-02-09', status: 'renewalDue' });
  Object.assign(MX.agreement['BN-RAM-00744'], { end: '2027-08-31', status: 'active' });
  Object.assign(MX.agreement['BN-RAM-00266'], { end: '2027-01-31', status: 'renewalDue' });
  Object.assign(B.statuses, {
    renewalDue: { en: 'Renewal due', ar: 'تجديد مستحق', tone: 'warn', icon: 'refresh' },
    onboarding: { en: 'Onboarding', ar: 'قيد الإعداد', tone: 'info', icon: 'clock' },
    mgPosted: { en: 'Posted', ar: 'مُرحّل', tone: 'ok', icon: 'check' },
    mgDraftRun: { en: 'Draft run', ar: 'دورة مسودة', tone: 'neutral', icon: 'edit' },
    mgSent: { en: 'Sent', ar: 'مُرسل', tone: 'info', icon: 'send' },
    mgPlan: { en: 'Payment plan', ar: 'خطة سداد', tone: 'violet', icon: 'calendar' },
    mgLegal: { en: 'Legal referral', ar: 'إحالة قانونية', tone: 'bad', icon: 'gavel' },
    mgNotice: { en: 'Formal notice', ar: 'إشعار رسمي', tone: 'warn', icon: 'doc' },
  });

  /* Buildings being onboarded (mandate signed, data not yet migrated) — drawn from B.data */
  MX.onboarding = [
    { id: 'BN-RAM-00118', signed: '2026-11-10', golive: '2027-01-01', step: 2, owners: 14, with: T('Owners\' meeting resolution (14 of 19)', 'قرار اجتماع المالكين (14 من 19)') },
    { id: 'BN-RAM-00121', signed: '2026-10-28', golive: '2026-12-15', step: 3, owners: 22, with: T('Single corporate owner', 'مالك واحد (شركة)') },
    { id: 'BN-RAM-00123', signed: '2026-11-19', golive: '2027-02-01', step: 1, owners: 11, with: T('Owners\' association (pending registration)', 'جمعية مالكين (قيد التسجيل)') },
  ].filter((o) => D.building(o.id));
  const ONB_STEPS = [T('Mandate signed', 'توقيع التفويض'), T('Owner & unit data', 'بيانات المالكين والوحدات'), T('Lease migration', 'ترحيل العقود'), T('Bank & billing setup', 'إعداد البنك والفوترة'), T('Go-live', 'بدء التشغيل')];

  /* Arkan management team (fictional staff) */
  MX.staff = [
    { id: 'p_rania', n: T('Rania Odeh', 'رانيا عودة'), role: T('Portfolio director', 'مديرة المحفظة'), team: 'mgmt', b: 'all', phone: '+970 2 296 4410', cap: 30 },
    { id: 's_murad', n: T('Murad Qawasmi', 'مراد القواسمي'), role: T('Property manager', 'مدير عقارات'), team: 'pm', b: ['BN-RAM-00311', 'BN-RAM-00415', 'BN-RAM-00266'], phone: '+970 59 640 2231', cap: 26 },
    { id: 's_tala', n: T('Tala Nimer', 'تالا نمر'), role: T('Property manager', 'مديرة عقارات'), team: 'pm', b: ['BN-RAM-00142', 'BN-RAM-00203', 'BN-RAM-00744'], phone: '+970 59 777 1904', cap: 26 },
    { id: 's_hadeel', n: T('Hadeel Salah', 'هديل صلاح'), role: T('Leasing manager', 'مديرة التأجير'), team: 'leasing', b: ['BN-RAM-00142', 'BN-RAM-00266', 'BN-RAM-00744'], phone: '+970 56 310 4482', cap: 24 },
    { id: 's_nisreen', n: T('Nisreen Taha', 'نسرين طه'), role: T('Leasing agent', 'وكيلة تأجير'), team: 'leasing', b: ['BN-RAM-00311', 'BN-RAM-00415', 'BN-RAM-00203'], phone: '+970 59 218 0077', cap: 20 },
    { id: 's_iyad', n: T('Iyad Shehadeh', 'إياد شحادة'), role: T('Collections officer', 'مسؤول التحصيل'), team: 'finance', b: 'all', phone: '+970 59 455 7310', cap: 28 },
    { id: 's_rasha', n: T('Rasha Khatib', 'رشا الخطيب'), role: T('Accountant — owner statements', 'محاسبة — كشوف المالكين'), team: 'finance', b: 'all', phone: '+970 2 296 4415', cap: 24 },
    { id: 's_bilal', n: T('Bilal Amro', 'بلال عمرو'), role: T('Maintenance coordinator', 'منسق الصيانة'), team: 'ops', b: 'all', phone: '+970 59 903 6625', cap: 22 },
  ];
  MX.teams = { mgmt: T('Management', 'الإدارة'), pm: T('Property management', 'إدارة العقارات'), leasing: T('Leasing', 'التأجير'), finance: T('Finance & collections', 'المالية والتحصيل'), ops: T('Operations', 'العمليات') };
  const staff = (id) => MX.staff.find((s) => s.id === id);
  const staffName = (id) => (staff(id) ? tx(staff(id).n) : D.pname(id));
  const covers = (s, bid) => s.b === 'all' || s.b.includes(bid);
  const pmOf = (bid) => MX.staff.find((s) => s.team === 'pm' && covers(s, bid)) || staff('p_rania');
  const leasingOf = (bid) => MX.staff.find((s) => s.team === 'leasing' && covers(s, bid)) || staff('s_hadeel');

  /* Common-area operating budget = service charges billed (balanced budget) */
  MX.opexCats = [
    { id: 'cleaning', n: T('Cleaning', 'التنظيف'), share: 0.22, icon: 'sparkles', vendor: 'sp_sparkle' },
    { id: 'security', n: T('Security & concierge', 'الأمن والاستقبال'), share: 0.18, icon: 'shield', vendor: 'sp_guard' },
    { id: 'electricity', n: T('Common electricity', 'كهرباء المناطق المشتركة'), share: 0.16, icon: 'zap', vendor: 'util_el' },
    { id: 'elevators', n: T('Elevator contract', 'عقد المصاعد'), share: 0.09, icon: 'elevator', vendor: 'sp_lift' },
    { id: 'water', n: T('Common water', 'مياه المناطق المشتركة'), share: 0.07, icon: 'droplet', vendor: 'util_wt' },
    { id: 'repairs', n: T('Repairs & maintenance', 'الإصلاح والصيانة'), share: 0.14, icon: 'wrench', vendor: 'sp_jaber' },
    { id: 'insurance', n: T('Insurance', 'التأمين'), share: 0.06, icon: 'shieldCheck', vendor: 'ins' },
    { id: 'admin', n: T('Administration', 'الإدارة'), share: 0.08, icon: 'briefcase', vendor: 'org_arkan' },
  ];
  const VENDORS = { util_el: T('Electricity distributor (sample)', 'شركة توزيع الكهرباء (نموذج)'), util_wt: T('Municipal water (sample)', 'مياه البلدية (نموذج)'), ins: T('Building insurer (sample)', 'شركة تأمين المبنى (نموذج)'), org_arkan: T('Arkan Property Management', 'أركان لإدارة العقارات') };
  const vendorName = (v) => (VENDORS[v] ? tx(VENDORS[v]) : D.provider(v) ? tx(D.provider(v).name) : v);
  const catsFor = (bid) => { const b = bld(bid); const list = MX.opexCats.filter((c) => c.id !== 'elevators' || b.elevators); const t = B.sum(list, (c) => c.share); return list.map((c) => ({ ...c, w: c.share / t })); };
  const chargesOf = (bid) => B.sum(D.unitsOf(bid), (u) => u.charge);
  const vary = (k) => 0.84 + (seedOf(k) % 24) / 100;
  const YTD_I = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Jan–Nov 2026 indices into MX.months
  /** Month i (0 = Dec 2025 … 11 = Nov 2026) financials for one building. */
  const finM = (bid, i) => {
    const s = bStats(bid); const a = MX.agreement[bid] || { fee: 7 };
    const rentBilled = i === 11 ? s.roll : Math.round(s.roll * (0.955 + i * 0.004));
    const rentCol = i === 11 ? s.collected : Math.round(rentBilled * MX.rate[i]);
    const ch = chargesOf(bid);
    const chCol = Math.round(ch * (i === 11 ? 0.9 : 0.95 + (seedOf(bid + i) % 5) / 100));
    const opexBy = catsFor(bid).map((c) => ({ id: c.id, v: Math.round(ch * c.w * vary(bid + c.id + i)) }));
    const opex = B.sum(opexBy, (x) => x.v);
    const fee = Math.round((rentCol * a.fee) / 100);
    const unitRep = Math.round(s.roll * 0.02 * vary(bid + 'ur' + i));
    return { i, ym: MX.months[i], rentBilled, rentCol, ch, chCol, opexBy, opex, fee, unitRep, ownerNet: rentCol - fee - unitRep, fund: chCol - opex };
  };
  const finSum = (ids, i) => { const ms = ids.map((b) => finM(b, i)); const k = (f) => B.sum(ms, (m) => m[f]); return { rentBilled: k('rentBilled'), rentCol: k('rentCol'), ch: k('ch'), chCol: k('chCol'), opex: k('opex'), fee: k('fee'), unitRep: k('unitRep'), ownerNet: k('ownerNet'), fund: k('fund') }; };

  /* Service-charge arrears owed by owners (sample) */
  MX.scPaid = {};
  const scArrears = (u) => { if (MX.scPaid[u.id]) return 0; const h = seedOf(u.id + 'sc') % 100; return h < 88 ? 0 : h < 94 ? 1 : h < 98 ? 2 : 4; };
  /* Days a vacant unit has been empty (sample) */
  const vacantDays = (u) => { if (u.status !== 'vacant') return 0; const h = seedOf(u.id) % 100; return h < 45 ? 5 + h : h < 80 ? 50 + (h - 45) * 2 : h < 95 ? 120 + (h - 80) * 4 : 190 + (h - 95) * 10; };
  const listing = (u) => (D.ownerX && D.ownerX.meta && D.ownerX.meta[u.id] && D.ownerX.meta[u.id].listing) || null;
  MX.listReq = {};

  /* Expense ledger — Oct & Nov 2026, reconciles with the opex model */
  MX.exp = (() => {
    const out = []; let n = 4100;
    bIds().forEach((bid) => [10, 11].forEach((i) => finM(bid, i).opexBy.forEach((x) => {
      const c = MX.opexCats.find((k) => k.id === x.id); const h = seedOf(bid + x.id + i);
      const vendor = x.id === 'repairs' ? ['sp_jaber', 'sp_handy', 'sp_pure', 'sp_volt'][h % 4] : c.vendor;
      const date = iso(2026, i === 11 ? 11 : 10, 3 + (h % 20));
      let st = i === 10 ? 'paid' : x.v > 1800 && h % 3 === 0 ? 'pending' : h % 4 === 0 ? 'approved' : 'paid';
      if (i === 10 && h % 23 === 0) st = 'rejected';
      out.push({ id: `EX-26-${n++}`, b: bid, cat: x.id, vendor, amount: x.v, date, ym: MX.months[i], inv: `INV-${String(70000 + (h % 29000))}`, status: st, by: x.id === 'repairs' ? 's_bilal' : pmOf(bid).id, note: x.id === 'repairs' ? T('Common-area repairs as per job sheets', 'إصلاحات المناطق المشتركة حسب أوراق العمل') : null });
    })));
    return out;
  })();
  B.statuses.pendingApproval = { en: 'Pending approval', ar: 'بانتظار الموافقة', tone: 'warn', icon: 'clock' };

  /* Document repository (generated from records) */
  MX.folders = [
    { id: 'agreements', n: T('Management agreements', 'اتفاقيات الإدارة'), icon: 'handshake' },
    { id: 'leases', n: T('Lease contracts', 'عقود الإيجار'), icon: 'contract' },
    { id: 'statements', n: T('Owner statements', 'كشوف المالكين'), icon: 'chart' },
    { id: 'invoices', n: T('Supplier invoices', 'فواتير الموردين'), icon: 'receipt' },
    { id: 'compliance', n: T('Compliance & certificates', 'الامتثال والشهادات'), icon: 'shieldCheck' },
    { id: 'insurance', n: T('Insurance', 'التأمين'), icon: 'shield' },
    { id: 'inspections', n: T('Inspection reports', 'تقارير التفقد'), icon: 'clipboard' },
    { id: 'minutes', n: T('Meeting minutes', 'محاضر الاجتماعات'), icon: 'users' },
  ];
  MX.repo = (() => {
    const out = []; const add = (o) => out.push({ id: `DOC-${String(out.length + 1).padStart(4, '0')}`, size: `${(0.2 + (seedOf(o.n.en) % 40) / 10).toFixed(1)} MB`, ...o });
    blds().forEach((b) => {
      const a = MX.agreement[b.id];
      add({ f: 'agreements', b: b.id, n: T(`Management agreement — ${MX.short[b.id].en}`, `اتفاقية الإدارة — ${MX.short[b.id].ar}`), date: a.since, by: 'p_rania', tags: ['signed'], prov: 'submitted' });
      add({ f: 'insurance', b: b.id, n: T(`Building insurance policy 2026 — ${MX.short[b.id].en}`, `بوليصة تأمين المبنى 2026 — ${MX.short[b.id].ar}`), date: '2026-01-04', by: 's_rasha', tags: ['renews Jan'], prov: 'submitted' });
      add({ f: 'compliance', b: b.id, n: T('Civil defence fire-safety certificate', 'شهادة الدفاع المدني للسلامة من الحريق'), date: '2026-07-20', by: 's_bilal', tags: ['certificate'], prov: 'pending' });
      if (b.elevators) add({ f: 'compliance', b: b.id, n: T(`Elevator certification (${b.elevators} cars)`, `ترخيص المصاعد (${b.elevators})`), date: '2026-09-14', by: 's_bilal', tags: ['certificate'], prov: 'submitted' });
      add({ f: 'inspections', b: b.id, n: T('Common-area inspection — October', 'تفقد المناطق المشتركة — تشرين الأول'), date: '2026-10-28', by: pmOf(b.id).id, tags: ['inspection'], prov: 'submitted' });
      add({ f: 'minutes', b: b.id, n: T('Quarterly owners\' meeting — minutes', 'اجتماع المالكين الربعي — المحضر'), date: '2026-10-14', by: pmOf(b.id).id, tags: ['meeting'], prov: 'submitted' });
      ['2026-10', '2026-11'].forEach((ym) => add({ f: 'statements', b: b.id, n: T(`Owner statements — ${ymLabelEn(ym)} — ${MX.short[b.id].en}`, `كشوف المالكين — ${ymLabelAr(ym)} — ${MX.short[b.id].ar}`), date: `${ym}-${ym === '2026-11' ? '25' : '05'}`, by: 's_rasha', tags: [ym === '2026-11' ? 'draft' : 'sent'], prov: 'demo' }));
    });
    pLeases().forEach((l) => add({ f: 'leases', b: l.building, n: T(`Lease ${l.id} — ${D.unitLabel(D.unit(l.unit))}`, `عقد ${l.id} — ${D.unitLabel(D.unit(l.unit))}`), date: l.start, by: leasingOf(l.building).id, tags: [l.status], prov: 'submitted', lease: l.id }));
    MX.exp.filter((e) => e.ym === '2026-11').forEach((e) => add({ f: 'invoices', b: e.b, n: T(`${e.inv} — ${tx(MX.opexCats.find((c) => c.id === e.cat).n)}`, `${e.inv} — ${MX.opexCats.find((c) => c.id === e.cat).n.ar}`), date: e.date, by: e.by, tags: [e.status], prov: 'submitted', exp: e.id }));
    return out;
  })();
  function ymLabelEn(ym) { const [y, m] = ym.split('-').map(Number); return `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1]} ${y}`; }
  function ymLabelAr(ym) { const [y, m] = ym.split('-').map(Number); return `${['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'][m - 1]} ${y}`; }

  /* =====================================================================
   * Workspace scope (all buildings or one) — shared with the top-bar selector
   * ===================================================================== */
  const scope = () => {
    let v = null;
    try { if (typeof B.workspace === 'function') v = B.workspace(R); } catch (e) { v = null; }
    if (v == null) v = B.get(`ws:${R}`, null);
    if (v == null) v = B.get('mg:scope', 'all');
    return v && v !== 'all' && inPf(v) ? v : 'all';
  };
  const setScope = (v) => { B.vs['mg:scope'] = v; B.vs[`ws:${R}`] = v; if (typeof B.setWorkspace === 'function') { try { B.setWorkspace(R, v); return; } catch (e) { /* fall through */ } } B.refresh(); };
  B.act.mgScope = (v) => setScope(v || 'all');
  B.act.mgScopeMenu = (_, el) => B.menu(el, [{ label: L('All buildings', 'كل المباني'), icon: 'layers', act: 'mgScope', arg: 'all' }].concat(blds().map((b) => ({ label: sName(b.id), icon: 'building', act: 'mgScope', arg: b.id }))));
  const sIds = () => (scope() === 'all' ? bIds() : [scope()]);
  const inScope = (bid) => sIds().includes(bid);
  const sUnits = () => D.units.filter((u) => inScope(u.building));
  const sLeases = () => D.leases.filter((l) => inScope(l.building));
  const scopeLabel = () => (scope() === 'all' ? L(`All buildings (${blds().length})`, `كل المباني (${blds().length})`) : sName(scope()));

  /* =====================================================================
   * Styles (prefixed mg- / xt-)
   * ===================================================================== */
  B.css(`
  .mg-ph { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px 20px; flex-wrap: wrap; margin: 4px 0 16px; }
  .mg-ph h1 { font-size: 24px; letter-spacing: -.015em; line-height: 1.2; }
  .mg-ph .mg-sub { color: var(--text-2); font-size: 14px; margin-top: 4px; max-width: 76ch; }
  .mg-ph .acts { display: flex; gap: 8px; flex-wrap: wrap; }
  .mg-meta { display: flex; align-items: center; gap: 6px 14px; flex-wrap: wrap; font-size: 12.5px; color: var(--text-3); margin-top: 8px; }
  .mg-meta .sep { width: 3px; height: 3px; border-radius: 50%; background: #B9C6CF; }
  .mg-scope { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; color: var(--text-2); }
  .mg-scope svg { width: 14px; height: 14px; color: var(--mint-ink); }
  button.mg-scope { border-radius: 6px; padding: 1px 4px; margin-inline-start: -4px; }
  button.mg-scope:hover { background: var(--hover); color: var(--ink); }
  button.mg-scope svg:last-child { color: var(--text-3); width: 13px; height: 13px; }
  .mg-kband { display: grid; grid-template-columns: repeat(var(--c, 5), minmax(0, 1fr)); gap: 1px; background: var(--line-2); padding: 0; overflow: hidden; }
  .mg-kband > * { background: #fff; padding: 14px 16px; min-width: 0; text-align: start; display: block; width: 100%; }
  .mg-kband > button:hover { background: var(--surface-2); }
  .mg-kband .kb-l { font-size: 12.5px; color: var(--text-2); display: flex; align-items: center; gap: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mg-kband .kb-l svg { width: 14px; height: 14px; color: var(--text-3); flex: none; }
  .mg-kband .kb-v { font-family: var(--font-display); font-size: 24px; font-weight: 700; margin-top: 4px; font-variant-numeric: tabular-nums; letter-spacing: -.02em; line-height: 1.2; }
  .mg-kband .kb-v small { font-size: 13px; color: var(--text-3); font-weight: 600; margin-inline-start: 3px; }
  .mg-kband .kb-f { font-size: 12px; color: var(--text-3); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mg-kband .kb-f.bad { color: var(--bad); } .mg-kband .kb-f.ok { color: var(--ok); } .mg-kband .kb-f.warn { color: var(--warn); }
  .mg-fbar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; }
  .mg-fbar .input-icon { flex: 1 1 220px; max-width: 340px; min-width: 180px; }
  .mg-fbar .input, .mg-fbar .select { height: 36px; font-size: 13.5px; border-radius: 10px; }
  .mg-fbar .input-icon > svg { width: 16px; height: 16px; }
  .mg-fbar .select { width: auto; min-width: 128px; max-width: 220px; }
  .mg-fbar .chips { flex-wrap: nowrap; }
  .mg-fbar .chip { height: 32px; padding: 0 12px; }
  .mg-fbar-r { margin-inline-start: auto; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .mg-fbar .count { font-size: 12.5px; color: var(--text-3); white-space: nowrap; }
  .xt { overflow: hidden; }
  .xt-scroll { overflow: auto; }
  .xt-t { font-size: 13.5px; }
  .xt-t th { padding: 10px 12px; z-index: 2; }
  .xt-t td { padding: 9px 12px; white-space: nowrap; }
  .xt-t td .xt-strong, .xt-t td .xt-sub { max-width: 260px; overflow: hidden; text-overflow: ellipsis; }
  .xt-t td .xt-strong { display: block; white-space: nowrap; }
  .xt-t th.num, .xt-t td.num { text-align: end; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .xt-t th.ctr, .xt-t td.ctr { text-align: center; }
  .xt-t tbody tr.on { background: var(--mint-50); }
  .xt-t tbody tr.on td:first-child { box-shadow: inset 3px 0 0 var(--mint-ink); }
  html[dir="rtl"] .xt-t tbody tr.on td:first-child { box-shadow: inset -3px 0 0 var(--mint-ink); }
  .xt-t tbody tr.sel { background: #F2FBF7; }
  .xt-t .xt-c { width: 38px; padding-inline: 14px 2px; }
  .xt-cb { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid #B4C2CC; display: grid; place-items: center; color: transparent; background: #fff; flex: none; }
  .xt-cb svg { width: 12px; height: 12px; }
  .xt-cb.on { background: var(--navy); border-color: var(--navy); color: var(--mint); }
  .xt-cb.some { background: var(--navy-ink); border-color: var(--navy-ink); color: var(--navy); }
  .xt-t tfoot td { position: sticky; bottom: 0; background: var(--surface-2); border-top: 1px solid var(--line); border-bottom: 0; font-weight: 650; font-variant-numeric: tabular-nums; }
  .xt-bulk { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--navy); color: #fff; font-size: 13px; flex-wrap: wrap; }
  .xt-bulk b { margin-inline-end: 6px; }
  .xt-bulk .btn { height: 30px; padding: 0 10px; font-size: 12.5px; background: rgba(255,255,255,.08); color: #fff; border: 1px solid rgba(255,255,255,.16); }
  .xt-bulk .btn:hover { background: rgba(255,255,255,.16); }
  .xt-bulk .btn svg { width: 15px; height: 15px; color: var(--mint); }
  .xt-bulk .xt-x { margin-inline-start: auto; color: var(--navy-ink); font-size: 12.5px; }
  .xt-cap { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 9px 14px; border-bottom: 1px solid var(--line-2); font-size: 12.5px; color: var(--text-3); flex-wrap: wrap; }
  .xt-cap b { color: var(--ink); font-weight: 650; }
  .xt .pager { border-top: 1px solid var(--line-2); }
  .xt-sub { display: block; font-size: 12px; color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .xt-strong { font-weight: 600; }
  .mg-split { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 16px; align-items: start; }
  .mg-panel { position: sticky; top: calc(var(--topbar-h) + 12px); max-height: calc(100vh - var(--topbar-h) - 24px); overflow: auto; padding: 0; }
  .mg-panel .mp-h { padding: 16px 18px 14px; border-bottom: 1px solid var(--line-2); display: flex; gap: 12px; align-items: flex-start; }
  .mg-panel .mp-h h3 { font-size: 16.5px; line-height: 1.3; }
  .mg-panel .mp-h .sub { font-size: 12.5px; color: var(--text-3); margin-top: 3px; }
  .mg-panel .mp-b { padding: 16px 18px; display: flex; flex-direction: column; gap: 18px; }
  .mg-panel .mp-f { padding: 12px 18px; border-top: 1px solid var(--line-2); display: flex; gap: 8px; flex-wrap: wrap; position: sticky; bottom: 0; background: #fff; }
  .mg-panel .mp-f .btn { flex: 1 1 auto; }
  .mg-h4 { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--text-3); font-weight: 650; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  html[dir="rtl"] .mg-h4 { letter-spacing: 0; }
  .mg-panel .kv { padding: 7px 0; font-size: 13.5px; }
  .mg-pstats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; background: var(--line-2); border: 1px solid var(--line-2); border-radius: 12px; overflow: hidden; }
  .mg-pstats > div { background: var(--surface-2); padding: 10px 12px; min-width: 0; }
  .mg-pstats b { display: block; font-family: var(--font-display); font-size: 17px; font-variant-numeric: tabular-nums; }
  .mg-pstats span { font-size: 12px; color: var(--text-3); }
  .mg-thumb { width: 100%; height: 120px; border-radius: 12px; overflow: hidden; display: block; }
  .mg-thumb svg { width: 100%; height: 100%; }
  .mg-bar { height: 6px; border-radius: 99px; background: var(--line-2); overflow: hidden; display: flex; gap: 2px; min-width: 60px; }
  .mg-bar i { display: block; height: 100%; }
  .mg-occ { display: flex; height: 8px; border-radius: 99px; overflow: hidden; background: var(--line-2); gap: 2px; }
  .mg-occ i { display: block; height: 100%; }
  .mg-occcell { display: grid; grid-template-columns: 42px minmax(60px, 1fr); gap: 8px; align-items: center; }
  .mg-occcell b { font-variant-numeric: tabular-nums; font-size: 13px; text-align: end; }
  .mg-legend { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12px; color: var(--text-2); }
  .mg-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .mg-legend i { width: 9px; height: 9px; border-radius: 3px; display: inline-block; }
  .mg-board { display: grid; grid-template-columns: repeat(var(--n, 4), minmax(0, 1fr)); gap: 12px; align-items: start; }
  .mg-col { background: var(--surface-2); border: 1px solid var(--line); border-radius: 14px; padding: 10px; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
  .mg-col .cl-h { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 2px 4px; font-weight: 650; font-size: 13px; }
  .mg-col .cl-h .c { font-size: 12px; background: #fff; border: 1px solid var(--line); border-radius: 99px; padding: 1px 8px; color: var(--text-2); font-variant-numeric: tabular-nums; }
  .mg-col .cl-s { font-size: 12px; color: var(--text-3); padding: 0 4px; margin-top: -4px; }
  .mg-req { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 7px; text-align: start; min-width: 0; width: 100%; }
  .mg-req:hover { border-color: #C9D5D0; }
  .mg-req.on { border-color: var(--mint-ink); box-shadow: 0 0 0 1px var(--mint-ink) inset; }
  .mg-req .rq-t { font-weight: 600; font-size: 13.5px; line-height: 1.35; }
  .mg-req .rq-m { font-size: 12px; color: var(--text-3); display: flex; flex-wrap: wrap; gap: 4px 10px; }
  .mg-req .rq-f { display: flex; align-items: center; justify-content: space-between; gap: 8px; border-top: 1px solid var(--line-2); padding-top: 7px; font-size: 12px; }
  .mg-req .rq-cat { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: var(--text-2); }
  .mg-req .rq-cat svg { width: 14px; height: 14px; color: var(--mint-ink); }
  .mg-fin { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .mg-fin td, .mg-fin th { padding: 8px 0; border-bottom: 1px solid var(--line-2); font-variant-numeric: tabular-nums; }
  .mg-fin th { font-size: 12px; color: var(--text-3); font-weight: 600; text-align: end; }
  .mg-fin th:first-child, .mg-fin td:first-child { text-align: start; }
  .mg-fin td { text-align: end; }
  .mg-fin tr.sub td { color: var(--text-2); padding-inline-start: 14px; }
  .mg-fin tr.tot td { font-weight: 700; border-bottom: 0; border-top: 1px solid var(--line); }
  .mg-fin .neg { color: var(--bad); } .mg-fin .pos { color: var(--ok); }
  .mg-ws-head { display: grid; grid-template-columns: 168px minmax(0, 1fr) auto; gap: 20px; align-items: center; }
  .mg-ws-head .mg-art { height: 112px; border-radius: 14px; overflow: hidden; }
  .mg-ws-head .mg-art svg { width: 100%; height: 100%; }
  .mg-ws-head h1 { font-size: 24px; line-height: 1.2; }
  .mg-ws-stats { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 1px; background: var(--line-2); border-top: 1px solid var(--line-2); margin: 16px -20px -20px; }
  .mg-ws-stats > div { background: #fff; padding: 12px 16px; min-width: 0; }
  .mg-ws-stats b { display: block; font-family: var(--font-display); font-size: 18px; font-variant-numeric: tabular-nums; }
  .mg-ws-stats span { font-size: 12px; color: var(--text-3); }
  .mg-id-note { display: flex; gap: 8px; align-items: flex-start; font-size: 12.5px; color: var(--text-2); background: var(--surface-2); border: 1px solid var(--line-2); border-radius: 10px; padding: 8px 10px; }
  .mg-id-note svg { width: 15px; height: 15px; color: var(--text-3); flex: none; margin-top: 1px; }
  .mg-heat { display: flex; flex-direction: column; gap: 3px; }
  .mg-heat .hr { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 6px; align-items: center; }
  .mg-heat .hl { font-size: 12px; color: var(--text-3); text-align: end; font-variant-numeric: tabular-nums; }
  .mg-heat .hc { display: grid; grid-template-columns: repeat(var(--n, 4), minmax(0, 1fr)); gap: 3px; }
  .mg-heat .hc button { height: 24px; border-radius: 5px; font-size: 12px; font-weight: 600; color: var(--navy); font-variant-numeric: tabular-nums; }
  .mg-heat .hc button:hover { box-shadow: 0 0 0 2px var(--navy) inset; }
  .mg-steps { display: flex; flex-direction: column; gap: 6px; }
  .mg-steps div { display: flex; gap: 8px; align-items: center; font-size: 13px; }
  .mg-steps i { width: 18px; height: 18px; border-radius: 50%; display: grid; place-items: center; flex: none; background: var(--line-2); color: var(--text-3); font-style: normal; font-size: 12px; }
  .mg-steps i svg { width: 12px; height: 12px; }
  .mg-steps .done i { background: var(--mint); color: var(--navy); } .mg-steps .cur i { background: var(--navy); color: #fff; }
  .mg-steps .todo { color: var(--text-3); }
  .mg-chart .bars .col:nth-last-child(-n+2) .tip { inset-inline-end: 0; }
  .mg-chart .bars .col:nth-child(-n+2) .tip { inset-inline-start: 0; }
  .mg-chart .line-chart .hz:nth-last-child(-n+2) .tip { left: auto; right: 0; transform: none; }
  .mg-chart .line-chart .hz:nth-child(-n+2) .tip { left: 0; transform: none; }
  html[dir="rtl"] .mg-chart .line-chart .hz:nth-last-child(-n+2) .tip { right: auto; left: 0; }
  html[dir="rtl"] .mg-chart .line-chart .hz:nth-child(-n+2) .tip { left: auto; right: 0; }
  .mg-i14 { width: 14px; height: 14px; flex: none; display: inline-block; vertical-align: -2px; }
  .mg-navy .kv { border-color: rgba(255,255,255,.08); }
  .mg-navy .kv > span:first-child { color: var(--navy-ink); }
  .mg-link { color: var(--mint-ink); font-weight: 600; text-align: start; }
  .mg-link:hover { text-decoration: underline; }
  .mg-tag { display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: 6px; font-size: 12px; font-weight: 600; background: var(--line-2); color: var(--text-2); white-space: nowrap; }
  .mg-folders { display: flex; flex-direction: column; gap: 2px; }
  .mg-folders button { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; font-size: 13.5px; text-align: start; color: var(--text-2); width: 100%; }
  .mg-folders button svg { width: 16px; height: 16px; color: var(--text-3); flex: none; }
  .mg-folders button:hover { background: var(--hover); color: var(--ink); }
  .mg-folders button.on { background: var(--navy); color: #fff; }
  .mg-folders button.on svg { color: var(--mint); }
  .mg-folders .c { margin-inline-start: auto; font-size: 12px; font-variant-numeric: tabular-nums; opacity: .8; }
  .mg-docv { border: 1px solid var(--line); border-radius: 12px; padding: 18px; background: var(--surface-2); }
  .mg-docv i { display: block; height: 8px; border-radius: 4px; background: #DDE5E2; margin-top: 8px; }
  .mg-assign { display: grid; gap: 3px; font-size: 12.5px; }
  .mg-assign .ah { font-size: 12px; color: var(--text-3); font-weight: 600; text-align: center; padding: 4px 2px; line-height: 1.2; }
  .mg-assign .an { display: flex; align-items: center; gap: 8px; min-width: 0; padding-inline-end: 8px; }
  .mg-assign .an b { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mg-assign .ac { height: 30px; border-radius: 7px; display: grid; place-items: center; background: var(--surface-2); color: var(--text-3); font-size: 12px; font-weight: 650; }
  .mg-assign .ac.lead { background: var(--navy); color: #fff; } .mg-assign .ac.sup { background: var(--mint-100); color: var(--navy); }
  .mg-wl { display: grid; grid-template-columns: minmax(0, 1fr) 60px; gap: 8px; align-items: center; }
  @media (max-width: 1360px) { .xt-t .xt-wide { display: none; } }
  @media (max-width: 1640px) { .mg-split .xt-t .xt-wide { display: none; } }
  @media (max-width: 1500px) { .mg-split .xt-t .xt-mid { display: none; } .mg-split { grid-template-columns: minmax(0, 1fr) 300px; } }
  .mg-thumb { height: 96px; }
  @media (max-width: 1240px) { .mg-split { grid-template-columns: minmax(0, 1fr) 320px; } .mg-ws-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (max-width: 1100px) { .mg-split { grid-template-columns: minmax(0, 1fr); } .mg-panel { position: static; max-height: none; } .mg-board { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 900px) { .mg-ws-head { grid-template-columns: 120px minmax(0, 1fr); } .mg-ws-head > .acts { grid-column: 1 / -1; } .mg-ws-head .mg-art { height: 96px; } }
  @media (max-width: 767px) {
    .mg-kband { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .mg-kband > * { padding: 12px 14px; }
    .mg-kband > :last-child:nth-child(odd) { grid-column: span 2; }
    .mg-board.mg-pipe { grid-template-columns: repeat(5, 62%); overflow-x: auto; scrollbar-width: none; }
    .mg-board.mg-pipe .mg-col { display: flex !important; }
    .mg-kband .kb-v { font-size: 20px; }
    .mg-ph h1 { font-size: 21px; }
    .mg-ph .acts { width: 100%; } .mg-ph .acts .btn { flex: 1 1 auto; }
    .mg-fbar .input-icon { max-width: none; flex-basis: 100%; }
    .mg-fbar .select { flex: 1 1 calc(50% - 4px); max-width: none; }
    .mg-fbar .chips { flex-wrap: nowrap; overflow-x: auto; max-width: 100%; scrollbar-width: none; }
    .mg-fbar-r { margin-inline-start: 0; }
    .mg-board { grid-template-columns: minmax(0, 1fr); }
    .mg-board .mg-col:not(.show-m) { display: none; }
    .mg-ws-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 14px -16px -16px; }
    .mg-ws-head { grid-template-columns: 84px minmax(0, 1fr); gap: 14px; } .mg-ws-head .mg-art { height: 84px; } .mg-ws-head h1 { font-size: 19px; }
    .mg-chart .bars .col .lbl { white-space: normal; width: 100%; text-align: center; line-height: 1.15; font-size: 12px; bottom: -30px; }
    .mg-chart .bars { margin-bottom: 14px; }
    .xt-bulk .xt-x { margin-inline-start: 0; }
    .mg-board-seg { display: block !important; }
  }
  .mg-board-seg { display: none; }
  `);

  /* =====================================================================
   * Components
   * ===================================================================== */
  /** Page header: title, sub, actions + provenance / scope meta line. */
  const phead = ({ title, sub = '', actions = '', meta = true, scoped = true, extra = '' }) => `<div class="mg-ph"><div style="min-width:0"><h1>${title}</h1>${sub ? `<p class="mg-sub">${sub}</p>` : ''}
      ${meta ? `<div class="mg-meta">${scoped ? `<button class="mg-scope" data-act="mgScopeMenu" data-menu title="${esc(L('Change building scope', 'تغيير نطاق المباني'))}">${icon('building')}${scopeLabel()}${icon('chevD')}</button><span class="sep"></span>` : ''}<span>${L('As of', 'بتاريخ')} ${B.date(todayIso)}</span><span class="sep"></span>${ui.prov('demo')}${extra}</div>` : ''}</div>
    ${actions ? `<div class="acts">${actions}</div>` : ''}</div>`;
  /** KPI band cell */
  const kb = (ic, label, value, foot = '', tone = '', go = '') => `<${go ? `button data-go="${go}"` : 'div'}><div class="kb-l">${icon(ic)}<span class="truncate">${label}</span></div><div class="kb-v">${value}</div>${foot ? `<div class="kb-f ${tone}">${foot}</div>` : ''}</${go ? 'button' : 'div'}>`;
  const kband = (cells, n = 5) => `<section class="card mg-kband" style="--c:${n}">${cells.join('')}</section>`;
  /** Filter bar: items (html) + right side */
  const fbar = (items, right = '') => `<div class="mg-fbar">${items.filter(Boolean).join('')}${right ? `<div class="mg-fbar-r">${right}</div>` : ''}</div>`;
  const scopeSelect = () => `<select class="select" id="f-mgscope" aria-label="${esc(L('Building', 'المبنى'))}" onchange="B.act.mgScope(this.value)">${[{ v: 'all', l: L('All buildings', 'كل المباني') }].concat(blds().map((b) => ({ v: b.id, l: sName(b.id) }))).map((o) => `<option value="${o.v}" ${o.v === scope() ? 'selected' : ''}>${esc(o.l)}</option>`).join('')}</select>`;
  /** Side panel */
  const panel = ({ title, sub = '', eyebrow = '', lead = '', body, foot = '', close }) => `<aside class="card mg-panel" aria-label="${esc(String(title).replace(/<[^>]+>/g, ''))}">
      <div class="mp-h">${lead}<div class="grow" style="min-width:0">${eyebrow ? `<div class="mg-h4" style="margin-bottom:4px">${eyebrow}</div>` : ''}<h3>${title}</h3>${sub ? `<div class="sub">${sub}</div>` : ''}</div>${close ? `<button class="icon-btn" style="width:32px;height:32px" data-act="set" data-arg="${close}=" aria-label="${L('Close', 'إغلاق')}">${icon('x')}</button>` : ''}</div>
      <div class="mp-b">${body}</div>${foot ? `<div class="mp-f">${foot}</div>` : ''}</aside>`;
  const psec = (h, body, right = '') => `<section><div class="mg-h4"><span>${h}</span>${right}</div>${body}</section>`;
  const pstats = (items) => `<div class="mg-pstats" style="grid-template-columns:repeat(${items.length > 4 ? 3 : items.length},minmax(0,1fr))">${items.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('')}</div>`;

  /** Enterprise data table: sticky header, sorting, selection + bulk actions, totals, mobile card list. */
  const selOf = (id) => B.get(`${id}:sel`, []);
  B.act.xtSel = (arg) => { const [id, k] = String(arg).split('|'); const s = selOf(id).slice(); const i = s.indexOf(k); if (i >= 0) s.splice(i, 1); else s.push(k); B.set(`${id}:sel`, s); };
  B.act.xtAll = (arg) => { const [id, keys] = String(arg).split('|'); const ks = keys ? keys.split(',') : []; const s = selOf(id); const all = ks.every((k) => s.includes(k)); B.set(`${id}:sel`, all ? s.filter((k) => !ks.includes(k)) : [...new Set(s.concat(ks))]); };
  B.act.xtClear = (id) => B.set(`${id}:sel`, []);
  B.xtable = (o) => {
    const sk = `${o.id}:sort`, pk = `${o.id}:page`;
    const key = o.key || ((r) => r.id);
    let rows = o.rows.slice();
    const sort = B.get(sk, o.defaultSort || '');
    if (sort) {
      const desc = sort.startsWith('-'); const k = desc ? sort.slice(1) : sort; const col = o.cols.find((c) => c.key === k);
      if (col) { const f = typeof col.sort === 'function' ? col.sort : (r) => { const v = r[k]; return typeof v === 'object' && v ? tx(v) : v; }; rows.sort(B.by(f, desc ? -1 : 1)); }
    }
    const all = rows; const total = rows.length;
    if (o.pageSize) { const p = Math.min(B.get(pk, 0), Math.max(0, Math.ceil(total / o.pageSize) - 1)); rows = rows.slice(p * o.pageSize, (p + 1) * o.pageSize); }
    if (!total) return `<div class="card pad-0 xt">${o.caption ? `<div class="xt-cap">${o.caption}</div>` : ''}${ui.empty(o.empty || { icon: 'search', title: L('No results', 'لا توجد نتائج'), text: L('Try changing the filters or search terms.', 'جرّب تغيير عوامل التصفية أو كلمات البحث.') })}</div>`;
    const selectable = !!o.bulk;
    const sel = selectable ? selOf(o.id).filter((k) => all.some((r) => key(r) === k)) : [];
    const pageKeys = rows.map(key);
    const onPage = pageKeys.filter((k) => sel.includes(k)).length;
    const al = (c) => (c.align === 'end' || c.num ? 'num' : c.align === 'center' ? 'ctr' : '') + (c.wide ? ' xt-wide' : '') + (c.mid ? ' xt-mid' : '') + (c.cls ? ' ' + c.cls : '');
    const cell = (c, r) => (c.render ? c.render(r) : esc(tx(r[c.key])));
    const rowAttr = (r) => { if (o.rowGo) return `data-go="${o.rowGo(r)}"`; if (o.rowAct) { const a = o.rowAct(r); return `data-act="${a.act}" data-arg="${esc(a.arg)}"`; } return ''; };
    const mAttr = (r) => (o.mGo ? `data-go="${o.mGo(r)}"` : rowAttr(r));
    const clickable = o.rowGo || o.rowAct ? 'clickable' : '';
    const th = o.cols.map((c) => {
      if (!c.sort) return `<th class="${al(c)}" ${c.w ? `style="width:${c.w}"` : ''}>${tx(c.label)}</th>`;
      const on = sort === c.key || sort === '-' + c.key; const next = sort === c.key ? '-' + c.key : c.key;
      return `<th class="sortable ${on ? 'sorted' : ''} ${al(c)}" ${c.w ? `style="width:${c.w}"` : ''} data-act="set" data-arg="${sk}=${next}" aria-sort="${on ? (sort.startsWith('-') ? 'descending' : 'ascending') : 'none'}">${tx(c.label)}${icon(on ? (sort.startsWith('-') ? 'arrowDown' : 'arrowUp') : 'sort', 'sort-i')}</th>`;
    }).join('');
    const cbAll = selectable ? `<th class="xt-c" data-stop><button class="xt-cb ${onPage && onPage === pageKeys.length ? 'on' : onPage ? 'some' : ''}" data-act="xtAll" data-arg="${o.id}|${pageKeys.join(',')}" aria-label="${L('Select all on page', 'تحديد الكل في الصفحة')}">${icon(onPage && onPage < pageKeys.length ? 'minus' : 'check')}</button></th>` : '';
    const body = rows.map((r) => { const k = key(r); const isSel = sel.includes(k);
      return `<tr class="${clickable} ${o.active != null && o.active === k ? 'on' : ''} ${isSel ? 'sel' : ''}" ${rowAttr(r)}>${selectable ? `<td class="xt-c" data-stop><button class="xt-cb ${isSel ? 'on' : ''}" data-act="xtSel" data-arg="${o.id}|${k}" aria-label="${L('Select row', 'تحديد الصف')}" aria-pressed="${isSel}">${icon('check')}</button></td>` : ''}${o.cols.map((c) => `<td class="${al(c)}">${cell(c, r)}</td>`).join('')}</tr>`; }).join('');
    const hasTot = o.cols.some((c) => c.total);
    const tfoot = hasTot ? `<tfoot><tr>${selectable ? '<td></td>' : ''}${o.cols.map((c, i) => `<td class="${al(c)}">${c.total ? c.total(all) : i === 0 ? L(`Total · ${total}`, `الإجمالي · ${total}`) : ''}</td>`).join('')}</tr></tfoot>` : '';
    const bulkBar = selectable && sel.length ? `<div class="xt-bulk" role="toolbar"><b>${L(`${sel.length} selected`, `${sel.length} محدد`)}</b>${o.bulk.map((b) => `<button class="btn" data-act="${b.act}" data-arg="${esc(sel.join(','))}">${icon(b.icon || 'check')}<span>${tx(b.label)}</span></button>`).join('')}<button class="xt-x" data-act="xtClear" data-arg="${o.id}">${L('Clear selection', 'إلغاء التحديد')}</button></div>` : '';
    const cap = !bulkBar && o.caption ? `<div class="xt-cap">${o.caption}</div>` : '';
    const tCol = o.cols.find((c) => c.m === 'title') || o.cols[0];
    const subs = o.cols.filter((c) => c.m === 'sub'); const metas = o.cols.filter((c) => c.m === 'meta'); const endC = o.cols.find((c) => c.m === 'end');
    const mob = `<div class="m-list">${rows.map((r) => `<div class="m-row ${clickable || o.mGo ? 'clickable' : ''}" ${clickable || o.mGo ? 'role="button" tabindex="0"' : ''} ${mAttr(r)}>${o.mLead ? o.mLead(r) : ''}<div class="m-body">
        <div class="m-title"><span>${tCol.mRender ? tCol.mRender(r) : cell(tCol, r)}</span>${endC ? `<span class="nowrap">${cell(endC, r)}</span>` : ''}</div>
        ${subs.map((c) => `<div class="m-sub">${cell(c, r)}</div>`).join('')}${metas.length ? `<div class="m-meta">${metas.map((c) => `<span>${cell(c, r)}</span>`).join('')}</div>` : ''}</div></div>`).join('')}</div>`;
    return `<div class="card pad-0 xt ${o.cls || ''}">${bulkBar}${cap}<div class="xt-scroll table-wrap responsive" ${o.maxH ? `style="max-height:${o.maxH}"` : ''}><table class="table xt-t"><thead><tr>${cbAll}${th}</tr></thead><tbody>${body}</tbody>${tfoot}</table></div>${mob}${o.pageSize && total > o.pageSize ? ui.pager(pk, total, o.pageSize) : ''}</div>`;
  };
  const xtable = B.xtable;
  const sub2 = (main, sub) => `<div style="min-width:0"><span class="xt-strong">${main}</span>${sub ? `<span class="xt-sub">${sub}</span>` : ''}</div>`;
  const numc = (n) => `<span class="num">${money(n)}</span>`;
  const occBar = (s) => `<div class="mg-occ"><i style="width:${(s.rented / (s.units || 1)) * 100}%;background:var(--mint)"></i><i style="width:${(s.own / (s.units || 1)) * 100}%;background:#7FA7C2"></i><i style="width:${(s.maint / (s.units || 1)) * 100}%;background:#F2B35A"></i></div>`;
  const occCell = (s) => `<div class="mg-occcell"><b>${B.pct(s.occ)}</b>${occBar(s)}</div>`;
  const occLegend = () => `<div class="mg-legend"><span><i style="background:var(--mint)"></i>${L('Rented', 'مؤجّرة')}</span><span><i style="background:#7FA7C2"></i>${L('Owner-occupied', 'يسكنها المالك')}</span><span><i style="background:#F2B35A"></i>${L('Maintenance', 'صيانة')}</span><span><i style="background:var(--line-2);box-shadow:0 0 0 1px var(--line) inset"></i>${L('Vacant', 'شاغرة')}</span></div>`;
  const facade = (bid, sky) => { const b = bld(bid); return B.art.facade(seedOf(bid) % 997 + 3, { type: b.type, floors: b.floors, sky }); };
  const tenantCell = (l) => `<div class="cell-main">${ui.avatar(D.pname(l.tenant), 'sm')}<div style="min-width:0"><b>${esc(D.pname(l.tenant))}</b><small>${ui.idMono(l.id)}</small></div></div>`;
  const unitCell = (u) => `<div class="cell-main"><div style="min-width:0"><b>${esc(unitName(u))}</b><small>${esc(sName(u.building))} · ${L('Fl.', 'ط')} ${u.floor === 0 ? L('G', 'أرضي') : u.floor}</small></div></div>`;
  const buildingOpts = (all = true) => (all ? [{ v: 'all', l: L('All buildings', 'كل المباني') }] : []).concat(blds().map((b) => ({ v: b.id, l: sName(b.id) })));
  const catIcon = (c) => D.cat(c).icon;
  const openStatuses = ['open', 'new', 'quoted', 'assigned', 'scheduled', 'inProgress'];
  const idNote = () => `<div class="mg-id-note">${icon('info')}<span>${L('The BENA Building ID is a digital reference identity — it is not proof of legal ownership. Ownership shown here is as recorded under Arkan\'s management mandate.', 'رقم بينا للمبنى هوية مرجعية رقمية — وليس إثباتاً للملكية القانونية. الملكية المعروضة هنا كما هي مسجّلة بموجب تفويض إدارة أركان.')}</span></div>`;
  const exportBtn = (what) => ui.btn(L('Export', 'تصدير'), { icon: 'download', act: 'mgExport', arg: what });

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
        ${ui.field({ name: 'building', label: L('Building', 'المبنى'), type: 'select', value: bid || (scope() !== 'all' ? scope() : bIds()[0]), options: buildingOpts(false) })}
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
  B.submit.mgRemind = (data) => { MX.reminded[data.lease] = todayIso; B.success({ title: L('Reminder sent', 'تم إرسال التذكير'), text: L('Delivery is tracked on the receivables page.', 'يمكن تتبع التسليم في صفحة الذمم.') }); B.refresh(); };
  const remindMany = (ls) => {
    ls = ls.filter((l) => arrears(l) > 0 && !MX.reminded[l.id]);
    if (!ls.length) { B.toast(L('Everyone selected was already reminded today', 'تم تذكير جميع المحددين اليوم')); return; }
    B.confirm({ title: L(`Send ${ls.length} reminders?`, `إرسال ${ls.length} تذكيرات؟`), text: L(`App + SMS reminders for ${money(B.sum(ls, outstanding))} outstanding in total. Owners are copied.`, `تذكيرات عبر التطبيق ورسائل نصية لمبلغ ${money(B.sum(ls, outstanding))} مستحق إجمالاً. مع نسخة للمالكين.`), ok: L('Send reminders', 'إرسال التذكيرات'),
      onOk: () => { ls.forEach((l) => { MX.reminded[l.id] = todayIso; }); B.vs['mgArr:sel'] = []; B.vs['mgTen:sel'] = []; B.success({ title: L(`${ls.length} reminders sent`, `تم إرسال ${ls.length} تذكيرات`), ref: B.uid('BATCH') }); B.refresh(); } });
  };
  B.act.mgRemindAll = () => remindMany(sLeases());
  B.act.mgRemindSel = (ids) => remindMany(String(ids).split(',').map((id) => D.lease(id)).filter(Boolean));
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
  B.act.mgRenewSel = (ids) => {
    const ls = String(ids).split(',').map((id) => D.lease(id)).filter((l) => l && !(MX.renewals || {})[l.id]);
    if (!ls.length) { B.toast(L('Renewals were already sent for the selection', 'أُرسلت التجديدات للعقود المحددة مسبقاً')); return; }
    B.confirm({ title: L(`Prepare ${ls.length} renewal offers?`, `إعداد ${ls.length} عروض تجديد؟`), text: L('Each offer uses +3% on current rent, rounded to ₪50, and is sent to the owner for approval first.', 'يستخدم كل عرض زيادة 3% على الإيجار الحالي مقرّبة لأقرب 50 ₪، ويُرسل للمالك للموافقة أولاً.'), ok: L('Prepare offers', 'إعداد العروض'),
      onOk: () => { MX.renewals = MX.renewals || {}; ls.forEach((l) => { MX.renewals[l.id] = { rent: Math.round((l.rent * 1.03) / 50) * 50, sent: todayIso }; }); B.vs['mgLeases:sel'] = []; B.success({ title: L(`${ls.length} renewal offers prepared`, `تم إعداد ${ls.length} عروض تجديد`), text: L('Track them in the renewals pipeline.', 'تابعها في مسار التجديدات.'), ref: B.uid('RNW') }); B.refresh(); } });
  };
  B.act.mgMessage = (pid) => B.modal({
    title: L(`Message ${staff(pid) ? staffName(pid) : D.pname(pid)}`, `رسالة إلى ${staff(pid) ? staffName(pid) : D.pname(pid)}`), size: 'sm', form: 'mgMessage',
    body: `<input type="hidden" name="to" value="${esc(pid)}">${ui.field({ name: 'msg', label: L('Message', 'الرسالة'), type: 'textarea', required: true, placeholder: L('Write your message…', 'اكتب رسالتك…') })}`,
    foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send', 'إرسال'), { kind: 'primary', type: 'submit', icon: 'send' })}`,
  });
  B.submit.mgMessage = (data) => B.success({ title: L('Message sent', 'تم إرسال الرسالة'), text: L(`Delivered to ${staff(data.to) ? staffName(data.to) : D.pname(data.to)} in the BENA app (simulated).`, `أُرسلت إلى ${staff(data.to) ? staffName(data.to) : D.pname(data.to)} في تطبيق بينا (محاكاة).`) });
  B.act.mgMessageSel = (ids) => { const n = String(ids).split(',').filter(Boolean).length; B.modal({ title: L(`Message ${n} recipients`, `رسالة إلى ${n} مستلمين`), size: 'sm', form: 'mgMsgMany', body: `${ui.field({ name: 'msg', label: L('Message', 'الرسالة'), type: 'textarea', required: true, placeholder: L('Write your message…', 'اكتب رسالتك…') })}`, foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send to all', 'إرسال للجميع'), { kind: 'primary', type: 'submit', icon: 'send' })}` }); };
  B.submit.mgMsgMany = () => { ['mgTen:sel', 'mgOwners:sel', 'mgTeam:sel'].forEach((k) => { B.vs[k] = []; }); B.success({ title: L('Messages sent', 'تم إرسال الرسائل'), text: L('Delivered in the BENA app (simulated).', 'أُرسلت في تطبيق بينا (محاكاة).'), ref: B.uid('MSG') }); B.refresh(); };
  B.act.mgCal = (d) => { const [y, m] = B.get('mg:cal', '2026-11').split('-').map(Number); const x = new Date(y, m - 1 + +d, 1); B.set('mg:cal', `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`); };

  /** Simulated export: choose format, "prepare" file, nothing is downloaded. */
  B.act.mgExport = (what) => {
    const name = String(what || L('Report', 'تقرير'));
    B.modal({ title: L('Export', 'تصدير'), sub: esc(name), size: 'sm', form: 'mgExport',
      body: `<input type="hidden" name="what" value="${esc(name)}"><div class="stack">${ui.field({ name: 'fmt', label: L('Format', 'الصيغة'), type: 'radio', value: 'xlsx', options: [{ v: 'xlsx', l: 'Excel (.xlsx)', icon: 'grid' }, { v: 'pdf', l: 'PDF', icon: 'doc' }, { v: 'csv', l: 'CSV', icon: 'list' }] })}
        ${ui.field({ name: 'period', label: L('Period', 'الفترة'), type: 'select', value: '2026-11', options: [{ v: '2026-11', l: ymLabel('2026-11') }, { v: '2026-10', l: ymLabel('2026-10') }, { v: 'ytd', l: L('Year to date 2026', 'منذ بداية 2026') }] })}
        ${ui.callout(L('Simulated export — the file is prepared in the demo but nothing is downloaded or sent.', 'تصدير محاكاة — يُجهَّز الملف في النسخة التجريبية دون تنزيل أو إرسال أي شيء.'), '', 'info')}</div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Prepare file', 'تجهيز الملف'), { kind: 'primary', type: 'submit', icon: 'download' })}` });
  };
  B.submit.mgExport = (d) => B.success({ title: L('File prepared (simulated)', 'تم تجهيز الملف (محاكاة)'), text: L(`${esc(d.what)} · ${String(d.fmt || 'xlsx').toUpperCase()} · ${d.period === 'ytd' ? 'YTD 2026' : ymLabel(d.period || '2026-11')}`, `${esc(d.what)} · ${String(d.fmt || 'xlsx').toUpperCase()} · ${d.period === 'ytd' ? 'منذ بداية 2026' : ymLabel(d.period || '2026-11')}`), ref: B.uid('EXP') });
  B.act.mgExportSel = (ids) => B.act.mgExport(L(`${String(ids).split(',').length} selected rows`, `${String(ids).split(',').length} صفوف محددة`));
  /** Listing requires the owner's explicit authorisation */
  B.act.mgListReq = (uid) => {
    const ids = String(uid).split(',').map((x) => D.unit(x)).filter((u) => u && u.status === 'vacant');
    if (!ids.length) { B.toast(L('Only vacant units can be proposed for listing', 'يمكن اقتراح الوحدات الشاغرة فقط للعرض')); return; }
    B.confirm({ title: L(`Ask ${ids.length === 1 ? 'the owner' : `${new Set(ids.map((u) => u.owner)).size} owners`} to authorise listing?`, `طلب تفويض ${ids.length === 1 ? 'المالك' : `${new Set(ids.map((u) => u.owner)).size} مالكين`} لعرض الوحدات؟`), text: L('Vacant units are never listed automatically. Each owner receives a request in the BENA owner app and decides whether to list, at what rent and through whom.', 'لا تُعرض الوحدات الشاغرة تلقائياً أبداً. يتلقى كل مالك طلباً في تطبيق المالك ويقرر العرض والسعر والجهة.'), ok: L('Send requests', 'إرسال الطلبات'),
      onOk: () => { ids.forEach((u) => { MX.listReq[u.id] = todayIso; }); B.vs['mgUnits:sel'] = []; B.vs['mgVac:sel'] = []; B.success({ title: L('Authorisation requested', 'تم طلب التفويض'), text: L('Units stay unlisted until each owner approves.', 'تبقى الوحدات غير معروضة حتى يوافق كل مالك.'), ref: B.uid('LST') }); B.refresh(); } });
  };
  B.act.mgInspect = (ids) => { const n = String(ids || '').split(',').filter(Boolean).length || 1; B.modal({ title: L('Schedule inspection', 'جدولة تفقد'), sub: L(`${n} item(s)`, `${n} عنصر`), size: 'sm', form: 'mgInspect', body: `<div class="stack">${ui.field({ name: 'date', label: L('Date', 'التاريخ'), type: 'date', value: '2026-12-02', required: true })}${ui.field({ name: 'who', label: L('Inspector', 'المفتش'), type: 'select', options: MX.staff.filter((s) => s.team === 'pm' || s.team === 'ops').map((s) => ({ v: s.id, l: `${tx(s.n)} — ${tx(s.role)}` })) })}${ui.field({ name: 'kind', label: L('Type', 'النوع'), type: 'select', options: [{ v: 'move', l: L('Move-in / move-out', 'دخول / خروج مستأجر') }, { v: 'routine', l: L('Routine condition check', 'فحص دوري للحالة') }, { v: 'common', l: L('Common areas', 'المناطق المشتركة') }] })}</div>`, foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Schedule', 'جدولة'), { kind: 'primary', type: 'submit', icon: 'calendar' })}` }); };
  B.submit.mgInspect = (d) => { ['mgUnits:sel', 'mgBld:sel'].forEach((k) => { B.vs[k] = []; }); B.success({ title: L('Inspection scheduled', 'تمت جدولة التفقد'), text: L(`${staffName(d.who)} · ${B.date(d.date)}`, `${staffName(d.who)} · ${B.date(d.date)}`), ref: B.uid('INS') }); B.refresh(); };
  B.act.mgOwnerReport = (ids) => { const n = String(ids || '').split(',').filter(Boolean).length; B.confirm({ title: L(`Send November reports to ${n ? n + ' selection(s)' : 'owners'}?`, `إرسال تقارير تشرين الثاني إلى ${n ? n + ' محدد' : 'المالكين'}؟`), text: L('Statements are generated from the posted rent and expense ledgers. Draft figures are marked as such.', 'تُنشأ الكشوف من دفاتر الإيجار والمصاريف المرحّلة. تُعلَّم الأرقام المبدئية بذلك.'), ok: L('Send', 'إرسال'), onOk: () => { ['mgBld:sel', 'mgOwners:sel', 'mgStmt:sel'].forEach((k) => { B.vs[k] = []; }); B.success({ title: L('Reports queued', 'تمت جدولة التقارير'), text: L('Owners receive them in the BENA owner app (simulated).', 'يتلقاها المالكون في تطبيق المالك (محاكاة).'), ref: B.uid('STM') }); B.refresh(); } }); };

  /* =====================================================================
   * Aggregates for the current scope
   * ===================================================================== */
  const agg = (ids = sIds()) => {
    const us = D.units.filter((u) => ids.includes(u.building)); const ls = D.leases.filter((l) => ids.includes(l.building));
    const c = (s) => us.filter((u) => u.status === s).length;
    const reqs = D.requests.filter((q) => ids.includes(q.building) && openStatuses.includes(q.status));
    const roll = B.sum(ls, (l) => l.rent);
    const exp90 = ls.filter((l) => { const d = B.daysFromToday(l.end); return d >= 0 && d <= 90; });
    const vac = us.filter((u) => u.status === 'vacant');
    return {
      units: us.length, rented: c('rented'), own: c('ownerOccupied'), vacant: c('vacant'), maint: c('maintenance'),
      occ: ((c('rented') + c('ownerOccupied')) / (us.length || 1)) * 100,
      active: ls.filter((l) => l.status !== 'expired').length, leases: ls.length, holdover: ls.filter((l) => l.status === 'expired').length,
      exp90, roll, out: B.sum(ls, outstanding), arrearsCount: ls.filter((l) => arrears(l) > 0).length,
      collected: roll - B.sum(ls.filter((l) => arrears(l) > 0), (l) => l.rent),
      scOut: B.sum(us, (u) => scArrears(u) * u.charge), scCount: us.filter((u) => scArrears(u) > 0).length,
      reqs, unassigned: reqs.filter((q) => !q.provider).length, high: reqs.filter((q) => q.priority === 'high' || q.priority === 'critical').length,
      vacDays: vac.length ? Math.round(B.sum(vac, vacantDays) / vac.length) : 0, charges: B.sum(us, (u) => u.charge),
    };
  };
  const pct1 = (n) => B.pct(n, 1);
  const delta = (a, b) => (b ? ((a - b) / b) * 100 : 0);
  const dTag = (a, b, inv = false) => { const d = delta(a, b); const good = inv ? d <= 0 : d >= 0; return `<span class="${Math.abs(d) < 0.05 ? 'faint' : good ? 'pos' : 'neg'}">${d > 0 ? '+' : ''}${B.num1(d)}%</span>`; };
  const P = {};
  const ORGL = () => L('Arkan Property Management', 'أركان لإدارة العقارات');
  const crumbs = (...items) => B.crumbs([{ label: ORGL(), go: `${R}-home` }].concat(items));

  /* ---------- 1 · Portfolio overview ---------- */
  P.home = () => {
    crumbs({ label: L('Portfolio overview', 'نظرة عامة على المحفظة') });
    const ids = sIds(); const s = agg(ids);
    const nov = finSum(ids, 11), oct = finSum(ids, 10);
    const ytd = (f) => B.sum(YTD_I, (j) => finSum(ids, j)[f]);
    const bs = ids.map((id) => ({ id, b: bld(id), s: bStats(id), f: finM(id, 11) }));
    const holdover = sLeases().filter((l) => l.status === 'expired');
    const arrearsL = sLeases().filter((l) => arrears(l) >= 2).sort(B.by(outstanding, -1));
    const attnReq = s.reqs.filter((q) => q.priority === 'high' || q.priority === 'critical' || !q.provider);
    const pendingExp = MX.exp.filter((e) => ids.includes(e.b) && e.status === 'pending');
    const attn = [
      ...s.exp90.slice().sort(B.by('end')).slice(0, 3).map((l) => ui.li({ icon: 'calendarCheck', tone: 'warn', title: L(`Lease ending — ${esc(unitName(D.unit(l.unit)))}, ${esc(sName(l.building))}`, `عقد ينتهي — ${esc(unitName(D.unit(l.unit)))}، ${esc(sName(l.building))}`), sub: `${esc(D.pname(l.tenant))} · <b>${B.inDays(l.end)}</b>`, go: `${R}-lease-${l.id}` })),
      ...arrearsL.slice(0, 2).map((l) => ui.li({ icon: 'alertCircle', tone: 'bad', title: L(`${arrears(l)} months in arrears — ${esc(D.pname(l.tenant))}`, `متأخر ${arrears(l)} أشهر — ${esc(D.pname(l.tenant))}`), sub: `${esc(unitName(D.unit(l.unit)))} · ${esc(sName(l.building))} · <b>${money(outstanding(l))}</b>`, go: `${R}-receivables` })),
      ...attnReq.slice(0, 2).map((q) => ui.li({ icon: catIcon(q.cat), tone: 'violet', title: esc(tx(q.title)), sub: `${esc(sName(q.building))} · ${ui.statusLabel(q.priority)} · ${q.provider ? esc(tx(D.provider(q.provider).name)) : `<b>${L('No provider yet', 'لم يُسند بعد')}</b>`}`, go: `${R}-maintenance` })),
      pendingExp.length ? ui.li({ icon: 'receipt', tone: 'info', title: L(`${pendingExp.length} expenses awaiting approval`, `${pendingExp.length} مصاريف بانتظار الموافقة`), sub: `${money(B.sum(pendingExp, (e) => e.amount))} · ${L('above the ₪1,800 threshold', 'فوق حد 1,800 ₪')}`, go: `${R}-expenses` }) : '',
      holdover.length ? ui.li({ icon: 'clock', tone: 'bad', title: L(`${holdover.length} leases past their end date`, `${holdover.length} عقود تجاوزت تاريخ انتهائها`), sub: L('Tenants holding over — renew or regularise', 'مستأجرون بتمديد ضمني — جدّد أو سوِّ الوضع'), go: `${R}-leases` }) : '',
    ].filter(Boolean);
    const trendB = MX.months.map((_, i) => finSum(ids, i).rentBilled), trendC = MX.months.map((_, i) => finSum(ids, i).rentCol);
    const sm = (v) => (v < 0 ? `(${money(-v)})` : money(v));
    const finRow = (label, a, b, y, o = {}) => `<tr class="${o.cls || ''}"><td>${label}</td><td>${o.fmt ? o.fmt(a) : sm(a)}</td><td class="faint">${o.fmt ? o.fmt(b) : sm(b)}</td><td>${o.noDelta ? '' : dTag(a, b, o.inv)}</td><td>${y == null ? '' : o.fmt ? o.fmt(y) : sm(y)}</td></tr>`;
    return `${phead({ title: L('Portfolio overview', 'نظرة عامة على المحفظة'), sub: L(`Good morning, Rania — ${ids.length} building${ids.length > 1 ? 's' : ''}, ${s.units} units under management.`, `صباح الخير يا رانيا — ${ids.length} ${ids.length > 1 ? 'مبانٍ' : 'مبنى'} و${s.units} وحدة تحت الإدارة.`),
      actions: `${exportBtn(L('Portfolio summary', 'ملخص المحفظة'))}${ui.btn(L('New request', 'طلب جديد'), { icon: 'plus', act: 'mgNewReq', arg: '' })}${ui.btn(L('Send reminders', 'إرسال التذكيرات'), { kind: 'primary', icon: 'bell', act: 'mgRemindAll' })}` })}
      <div class="stack">
      ${kband([
        kb('building', L('Managed buildings', 'المباني المُدارة'), ids.length, L(`${MX.onboarding.length} more onboarding`, `${MX.onboarding.length} أخرى قيد الإعداد`), '', `${R}-buildings`),
        kb('layers', L('Total units', 'إجمالي الوحدات'), s.units, L(`${s.rented} rented · ${s.own} owner-occupied`, `${s.rented} مؤجّرة · ${s.own} يسكنها المالك`), '', `${R}-units`),
        kb('pie', L('Occupancy rate', 'نسبة الإشغال'), pct1(s.occ), L('+1.8 pts vs Q2', '+1.8 نقطة عن الربع الثاني'), 'ok', `${R}-occupancy`),
        kb('door', L('Vacant units', 'الوحدات الشاغرة'), s.vacant, L(`avg. ${s.vacDays} days vacant`, `متوسط ${s.vacDays} يوماً شاغرة`), s.vacDays > 60 ? 'warn' : '', `${R}-occupancy`),
        kb('contract', L('Active leases', 'العقود السارية'), s.active, L(`${moneyC(s.roll)} / month rent roll`, `${moneyC(s.roll)} إيجار شهري`), '', `${R}-leases`),
        kb('calendarCheck', L('Expiring ≤ 90 days', 'تنتهي خلال 90 يوماً'), s.exp90.length, L(`${moneyC(B.sum(s.exp90, (l) => l.rent))} / mo at stake`, `${moneyC(B.sum(s.exp90, (l) => l.rent))} شهرياً معرّضة`), 'warn', `${R}-leases`),
        kb('alertCircle', L('Outstanding receivables', 'الذمم المستحقة'), moneyC(s.out + s.scOut), L(`${s.arrearsCount} rent · ${s.scCount} service-charge accounts`, `${s.arrearsCount} إيجار · ${s.scCount} رسوم خدمات`), 'bad', `${R}-receivables`),
        kb('wrench', L('Maintenance requests', 'طلبات الصيانة'), s.reqs.length, L(`${s.unassigned} unassigned · ${s.high} high`, `${s.unassigned} غير مُسندة · ${s.high} عالية`), s.unassigned ? 'warn' : '', `${R}-maintenance`),
        kb('wallet', L('Rent collected · Nov MTD', 'الإيجار المحصّل · ت٢ حتى تاريخه'), moneyC(nov.rentCol), L(`${pct1((nov.rentCol / (nov.rentBilled || 1)) * 100)} of billed · target 95%`, `${pct1((nov.rentCol / (nov.rentBilled || 1)) * 100)} من المفوتر · الهدف 95%`), '', `${R}-rent`),
        kb('coins', L('Net to owners · Nov', 'الصافي للمالكين · ت٢'), moneyC(nov.ownerNet), L('after fees and unit repairs', 'بعد الأتعاب وإصلاحات الوحدات'), '', `${R}-reports`),
      ], 5)}
      <div class="grid g-main">
        ${ui.card({ title: L('Monthly financial summary', 'الملخص المالي الشهري'), sub: L('November 2026 vs October · portfolio ledgers (sample)', 'تشرين الثاني 2026 مقابل تشرين الأول · دفاتر المحفظة (نموذج)'), link: { label: L('Financial reports', 'التقارير المالية'), go: `${R}-reports` },
          body: `<table class="mg-fin"><thead><tr><th>${L('Line', 'البند')}</th><th>${L('Nov (MTD)', 'ت٢ (حتى تاريخه)')}</th><th>${L('Oct', 'ت١')}</th><th>${L('Δ', 'التغير')}</th><th>${L('YTD (Jan–Nov)', 'منذ بداية العام')}</th></tr></thead><tbody>
            ${finRow(L('Rent billed', 'الإيجار المفوتر'), nov.rentBilled, oct.rentBilled, ytd('rentBilled'))}
            ${finRow(L('Rent collected', 'الإيجار المحصّل'), nov.rentCol, oct.rentCol, ytd('rentCol'))}
            ${finRow(L('Collection rate', 'نسبة التحصيل'), (nov.rentCol / nov.rentBilled) * 100, (oct.rentCol / oct.rentBilled) * 100, null, { fmt: pct1, cls: 'sub', noDelta: true })}
            ${finRow(L('Service charges billed', 'رسوم الخدمات المفوترة'), nov.ch, oct.ch, ytd('ch'))}
            ${finRow(L('Service charges collected', 'رسوم الخدمات المحصّلة'), nov.chCol, oct.chCol, ytd('chCol'))}
            ${finRow(L('Common-area expenses', 'مصاريف المناطق المشتركة'), nov.opex, oct.opex, ytd('opex'), { inv: true })}
            ${finRow(L('Arkan management fees', 'أتعاب إدارة أركان'), nov.fee, oct.fee, ytd('fee'), { inv: true })}
            ${finRow(L('Service-charge fund surplus', 'فائض صندوق رسوم الخدمات'), nov.fund, oct.fund, ytd('fund'))}
            ${finRow(`<b>${L('Net distributable to owners', 'الصافي القابل للتوزيع على المالكين')}</b>`, nov.ownerNet, oct.ownerNet, ytd('ownerNet'), { cls: 'tot' })}
          </tbody></table>
          <div class="mg-chart" style="margin-top:18px">${B.charts.line({ labels: MX.months.map((ym) => B.mon(+ym.slice(5) - 1)), series: [{ name: L('Rent collected', 'المحصّل'), color: '#36D6A0', values: trendC, area: true }, { name: L('Rent billed', 'المفوتر'), color: '#142B3B', values: trendB, dashed: true }], height: 150 })}</div>` })}
        <div class="stack">
          ${ui.card({ title: L('Needs attention', 'يحتاج إلى متابعة'), sub: L(`${attn.length} items`, `${attn.length} بنود`), body: attn.length ? ui.list(attn) : ui.empty({ icon: 'checkCircle', title: L('All clear', 'لا شيء معلّق') }) })}
          ${ui.card({ title: L('Occupancy by building', 'الإشغال حسب المبنى'), link: { label: L('Occupancy', 'الإشغال'), go: `${R}-occupancy` }, body: B.charts.hbars({ data: bs.map((x) => ({ label: sName(x.id), sub: L(`${x.s.vacant} vacant`, `${x.s.vacant} شاغرة`), value: Math.round(x.s.occ), color: x.s.occ >= 90 ? '#36D6A0' : x.s.occ >= 80 ? '#7FA7C2' : '#F2B35A' })), max: 100, format: (v) => v + '%' }) })}
        </div>
      </div>
      <div><div class="section-title"><h2>${L('Buildings under management', 'المباني تحت الإدارة')}</h2><button class="link-btn mg-link" data-go="${R}-buildings">${L('Open buildings register', 'فتح سجل المباني')}${icon('chevR', 'flip mg-i14')}</button></div>
      ${xtable({ id: 'mgHomeB', rows: bs, rowGo: (x) => `${R}-workspace-${x.id}`, cols: [
        { key: 'name', label: L('Building', 'المبنى'), m: 'title', sort: (x) => sName(x.id), render: (x) => `<div class="cell-main"><span style="width:36px;height:36px;border-radius:9px;overflow:hidden;flex:none;display:block">${facade(x.id)}</span>${sub2(esc(tx(x.b.name)), `${esc(tx(D.district(x.b.district).name))} · ${ui.idMono(x.id)}`)}</div>`, mRender: (x) => esc(sName(x.id)) },
        { key: 'units', label: L('Units', 'الوحدات'), num: true, sort: (x) => x.s.units, m: 'meta', render: (x) => x.s.units, total: (rs) => B.sum(rs, (x) => x.s.units) },
        { key: 'occ', label: L('Occupancy', 'الإشغال'), sort: (x) => x.s.occ, m: 'sub', w: '150px', render: (x) => occCell(x.s) },
        { key: 'roll', label: L('Rent roll / mo', 'الإيجار الشهري'), num: true, sort: (x) => x.s.roll, m: 'meta', render: (x) => numc(x.s.roll), total: (rs) => numc(B.sum(rs, (x) => x.s.roll)) },
        { key: 'col', label: L('Collected · Nov', 'المحصّل · ت٢'), num: true, sort: (x) => x.s.collected, m: 'hide', render: (x) => numc(x.s.collected), total: (rs) => numc(B.sum(rs, (x) => x.s.collected)) },
        { key: 'out', label: L('Outstanding', 'المستحق'), num: true, sort: (x) => x.s.out, m: 'end', render: (x) => `<b class="num" style="${x.s.out ? 'color:var(--bad)' : ''}">${money(x.s.out)}</b>`, total: (rs) => `<span style="color:var(--bad)">${money(B.sum(rs, (x) => x.s.out))}</span>` },
        { key: 'net', label: L('Net to owners', 'الصافي للمالكين'), num: true, wide: true, sort: (x) => x.f.ownerNet, m: 'hide', render: (x) => numc(x.f.ownerNet), total: (rs) => numc(B.sum(rs, (x) => x.f.ownerNet)) },
        { key: 'reqs', label: L('Open requests', 'طلبات مفتوحة'), num: true, sort: (x) => x.s.reqs, m: 'meta', render: (x) => x.s.reqs, total: (rs) => B.sum(rs, (x) => x.s.reqs) },
      ] })}</div>
      ${ui.demoNote()}
      </div>`;
  };

  /* ---------- 2 · Buildings register ---------- */
  const bRows = () => blds().map((b) => ({ id: b.id, b, s: bStats(b.id), st: MX.agreement[b.id].status, onb: null }))
    .concat(MX.onboarding.map((o) => ({ id: o.id, b: bld(o.id), s: null, st: 'onboarding', onb: o })));
  P.buildings = () => {
    crumbs({ label: L('Buildings', 'المباني') });
    const q = B.get('mg:bq', ''), st = B.get('mg:bst', 'all'), dist = B.get('mg:bdist', 'all'), ob = B.get('mg:bocc', 'all'), ty = B.get('mg:bty', 'all');
    const all = bRows();
    const band = (x) => (!x.s ? 'na' : x.s.occ >= 95 ? 'hi' : x.s.occ >= 85 ? 'mid' : 'lo');
    const rows = all.filter((x) => (st === 'all' || x.st === st) && (dist === 'all' || x.b.district === dist) && (ty === 'all' || x.b.type === ty) && (ob === 'all' || band(x) === ob) && B.match(q, x.b.name, x.id, x.b.gis, D.district(x.b.district).name, MX.short[x.id]));
    const selId = B.get('mg:bsel', '') || (rows[0] && rows[0].id);
    const cur = all.find((x) => x.id === selId) || rows[0];
    const dists = [...new Set(all.map((x) => x.b.district))];
    const table = xtable({ id: 'mgBld', rows, active: cur && cur.id, rowAct: (x) => ({ act: 'set', arg: `mg:bsel=${x.id}` }), mGo: (x) => (x.s ? `${R}-workspace-${x.id}` : `${R}-building-${x.id}`), maxH: 'calc(100vh - 300px)',
      caption: `<span><b>${rows.length}</b> ${L('of', 'من')} ${all.length} ${L('buildings', 'مبانٍ')}</span><span>${L('Click a row for details · double-check mandates before renewal', 'اضغط على صف للتفاصيل')}</span>`,
      bulk: [{ label: L('Send owner reports', 'إرسال تقارير المالكين'), icon: 'send', act: 'mgOwnerReport' }, { label: L('Schedule inspection', 'جدولة تفقد'), icon: 'clipboard', act: 'mgInspect' }, { label: L('Export', 'تصدير'), icon: 'download', act: 'mgExportSel' }],
      cols: [
        { key: 'name', label: L('Building', 'المبنى'), m: 'title', sort: (x) => tx(x.b.name), render: (x) => sub2(esc(tx(x.b.name)), ui.idMono(x.id)), mRender: (x) => esc(tx(x.b.name)) },
        { key: 'district', label: L('District', 'الحي'), sort: (x) => tx(D.district(x.b.district).name), m: 'meta', wide: true, render: (x) => esc(tx(D.district(x.b.district).name)) },
        { key: 'type', label: L('Type', 'النوع'), wide: true, sort: (x) => x.b.type, m: 'hide', render: (x) => esc(D.typeLabel(x.b.type)) },
        { key: 'units', label: L('Units', 'الوحدات'), num: true, sort: (x) => x.b.units, m: 'meta', render: (x) => x.b.units },
        { key: 'occ', label: L('Occupancy', 'الإشغال'), sort: (x) => (x.s ? x.s.occ : -1), w: '130px', m: 'sub', render: (x) => (x.s ? occCell(x.s) : `<span class="faint small">${L('Survey pending', 'بانتظار المسح')}</span>`) },
        { key: 'vac', label: L('Vacant', 'شاغرة'), num: true, wide: true, sort: (x) => (x.s ? x.s.vacant : -1), m: 'hide', render: (x) => (x.s ? x.s.vacant : '—') },
        { key: 'roll', label: L('Rent roll', 'الإيجار'), num: true, sort: (x) => (x.s ? x.s.roll : 0), m: 'meta', render: (x) => (x.s ? numc(x.s.roll) : '—') },
        { key: 'out', label: L('Arrears', 'المتأخرات'), num: true, mid: true, sort: (x) => (x.s ? x.s.out : 0), m: 'hide', render: (x) => (x.s ? `<span class="num" style="${x.s.out ? 'color:var(--bad);font-weight:600' : ''}">${money(x.s.out)}</span>` : '—') },
        { key: 'pm', label: L('Property manager', 'مدير العقار'), wide: true, sort: (x) => tx(pmOf(x.id).n), m: 'hide', render: (x) => `<span class="row-sm nowrap">${ui.avatar(tx(pmOf(x.id).n), 'sm')}${esc(tx(pmOf(x.id).n))}</span>` },
        { key: 'st', label: L('Mandate', 'التفويض'), sort: (x) => x.st, m: 'end', render: (x) => (x.st === 'onboarding' ? ui.status('onboarding') : x.st === 'renewalDue' ? `${ui.status('renewalDue')}` : ui.status('active')) },
      ] });
    let pn = '';
    if (cur) {
      const b = cur.b;
      if (cur.s) {
        const a = MX.agreement[cur.id]; const reqs = D.requestsOf(cur.id).filter((r) => openStatuses.includes(r.status));
        pn = panel({ title: esc(tx(b.name)), sub: `${esc(tx(b.address))}`, close: 'mg:bsel', body: `<span class="mg-thumb">${facade(cur.id)}</span>
          <div class="row-sm wrap">${ui.status(cur.st === 'renewalDue' ? 'renewalDue' : 'active')}${ui.badge(D.types[b.type], '', D.types[b.type].icon)}${b.source === 'gis' ? ui.badge(L('GIS-linked (sample)', 'مرتبط بالبلدية (نموذج)'), '', 'landmark') : ''}</div>
          ${pstats([[cur.s.units, L('units', 'وحدة')], [B.pct(cur.s.occ), L('occupied', 'مشغولة')], [moneyC(cur.s.roll), L('rent / mo', 'إيجار شهري')], [cur.s.vacant, L('vacant', 'شاغرة')], [moneyC(cur.s.out), L('arrears', 'متأخرات')], [cur.s.reqs, L('open requests', 'طلبات مفتوحة')]])}
          ${psec(L('Identity', 'الهوية'), ui.kv([[L('BENA ID', 'رقم بينا'), ui.idMono(b.id)], [L('Municipal GIS ID', 'رقم البلدية'), b.gis ? ui.idMono(b.gis) : '—'], [L('Year · floors', 'السنة · الطوابق'), `${b.year} · ${b.floors}`], [L('Verification', 'التحقق'), ui.status(b.verification)]]))}
          ${psec(L('Mandate', 'التفويض'), ui.kv([[L('With', 'مع'), esc(tx(a.with))], [L('Term', 'المدة'), `${B.dateShort(a.since)} ${a.since.slice(0, 4)} – ${B.date(a.end)}`], [L('Fee', 'الأتعاب'), L(`${a.fee}% of collections`, `${a.fee}% من التحصيل`)], [L('Property manager', 'مدير العقار'), esc(tx(pmOf(cur.id).n))], [L('Facility management', 'إدارة المرافق'), b.facility ? esc(tx(D.org(b.facility).name)) : L('Arkan (in-house)', 'أركان (داخلياً)')]]))}
          ${reqs.length ? psec(L('Open requests', 'طلبات مفتوحة'), ui.list(reqs.slice(0, 3).map((r) => ui.li({ icon: catIcon(r.cat), title: esc(tx(r.title)), sub: `${ui.idMono(r.id)} · ${ui.statusLabel(r.status)}`, go: `${R}-maintenance` })))) : ''}`,
          foot: `${ui.btn(L('Open workspace', 'فتح مساحة العمل'), { kind: 'primary', icon: 'building', go: `${R}-workspace-${cur.id}` })}${ui.btn(L('Building identity', 'هوية المبنى'), { icon: 'fingerprint', go: `${R}-building-${cur.id}` })}` });
      } else {
        const o = cur.onb;
        pn = panel({ title: esc(tx(b.name)), sub: esc(tx(b.address)), close: 'mg:bsel', body: `<span class="mg-thumb">${facade(cur.id)}</span>
          <div class="row-sm wrap">${ui.status('onboarding')}${ui.badge(D.types[b.type], '', D.types[b.type].icon)}</div>
          ${pstats([[b.units, L('units (declared)', 'وحدة (مُعلنة)')], [o.owners, L('owners', 'مالكين')], [B.dateShort(o.golive), L('go-live', 'بدء التشغيل')]])}
          ${psec(L('Onboarding', 'الإعداد'), `<div class="mg-steps">${ONB_STEPS.map((t, i) => `<div class="${i < o.step ? 'done' : i === o.step ? 'cur' : 'todo'}"><i>${i < o.step ? icon('check') : i + 1}</i><span>${tx(t)}</span></div>`).join('')}</div>`)}
          ${psec(L('Mandate', 'التفويض'), ui.kv([[L('With', 'مع'), esc(tx(o.with))], [L('Signed', 'التوقيع'), B.date(o.signed)], [L('BENA ID', 'رقم بينا'), ui.idMono(b.id)], [L('Verification', 'التحقق'), ui.status(b.verification)]]))}
          ${ui.callout(L('Units, owners and leases appear in the portfolio after data migration is approved by the owners.', 'تظهر الوحدات والمالكون والعقود في المحفظة بعد موافقة المالكين على ترحيل البيانات.'), '', 'info')}`,
          foot: `${ui.btn(L('Continue onboarding', 'متابعة الإعداد'), { kind: 'primary', icon: 'arrowRight', iconCls: 'flip', act: 'soon', arg: L('Onboarding wizard', 'معالج الإعداد') })}${ui.btn(L('Building identity', 'هوية المبنى'), { icon: 'fingerprint', go: `${R}-building-${cur.id}` })}` });
      }
    }
    return `${phead({ title: L('Buildings', 'المباني'), sub: L('Every building under an Arkan mandate — live portfolio and onboarding pipeline.', 'كل المباني بموجب تفويض أركان — المحفظة الحالية ومسار الإعداد.'), scoped: false, actions: `${exportBtn(L('Buildings register', 'سجل المباني'))}${ui.btn(L('Add building', 'إضافة مبنى'), { kind: 'primary', icon: 'plus', act: 'soon', arg: L('New mandate', 'تفويض جديد') })}` })}
      ${fbar([ui.search('mg:bq', L('Name, BENA ID, GIS ID or district…', 'الاسم أو رقم بينا أو رقم البلدية أو الحي…'), { reset: 'mgBld:page' }),
        ui.select('mg:bst', [{ v: 'all', l: L('All statuses', 'كل الحالات') }, { v: 'active', l: L('Active mandate', 'تفويض ساري') }, { v: 'renewalDue', l: L('Renewal due', 'تجديد مستحق') }, { v: 'onboarding', l: L('Onboarding', 'قيد الإعداد') }], { label: L('Status', 'الحالة') }),
        ui.select('mg:bdist', [{ v: 'all', l: L('All districts', 'كل الأحياء') }].concat(dists.map((d) => ({ v: d, l: tx(D.district(d).name) }))), { label: L('District', 'الحي') }),
        ui.select('mg:bty', [{ v: 'all', l: L('All types', 'كل الأنواع') }].concat([...new Set(all.map((x) => x.b.type))].map((t) => ({ v: t, l: D.typeLabel(t) }))), { label: L('Type', 'النوع') }),
        ui.chips('mg:bocc', [{ id: 'all', label: L('Any occupancy', 'أي إشغال') }, { id: 'hi', label: '≥ 95%' }, { id: 'mid', label: '85–95%' }, { id: 'lo', label: '< 85%' }], ob)],
        (q || st !== 'all' || dist !== 'all' || ob !== 'all' || ty !== 'all') ? `<button class="btn btn-text btn-sm" data-act="mgClearB">${icon('x')}${L('Clear filters', 'مسح عوامل التصفية')}</button>` : '')}
      <div class="mg-split">${table}${pn}</div>`;
  };
  B.act.mgClearB = () => { ['mg:bq', 'mg:bst', 'mg:bdist', 'mg:bocc', 'mg:bty'].forEach((k) => delete B.vs[k]); B.refresh(); };

  /* ---------- 3 · Building details (workspace) ---------- */
  const unitStack = (bid, mode = 'status') => {
    const us = D.unitsOf(bid); const floors = [...new Set(us.map((u) => u.floor))].sort((x, y) => y - x);
    const color = (u) => {
      if (mode === 'vacancy') return u.status !== 'vacant' ? '#EDF2F0' : vacantDays(u) > 120 ? '#E58A7B' : vacantDays(u) > 60 ? '#F2B35A' : '#F6DDA8';
      if (mode === 'expiry') { const l = D.leaseOfUnit(u.id); if (!l) return '#EDF2F0'; const d = B.daysFromToday(l.end); return d < 0 ? '#E58A7B' : d <= 90 ? '#F2B35A' : d <= 180 ? '#F6DDA8' : '#CDF4E5'; }
      return { rented: '#CDF4E5', ownerOccupied: '#DCE6EE', vacant: '#FFFFFF', maintenance: '#FDE7C3' }[u.status];
    };
    return `<div class="mg-heat">${floors.map((f) => { const fu = us.filter((u) => u.floor === f); return `<div class="hr"><span class="hl">${f === 0 ? L('G', 'أ') : f}</span><div class="hc" style="--n:${fu.length}">${fu.map((u) => `<button style="background:${color(u)};${u.status === 'vacant' && mode === 'status' ? 'box-shadow:0 0 0 1px var(--line) inset' : ''}" data-go="${R}-unit-${u.id}" title="${esc(unitName(u))} · ${esc(ui.statusLabel(u.status))}${u.status === 'vacant' ? ` · ${vacantDays(u)} ${L('days', 'يوماً')}` : ''}">${esc(u.number)}</button>`).join('')}</div></div>`; }).join('')}</div>`;
  };
  const heatLegend = (mode) => mode === 'vacancy' ? `<div class="mg-legend"><span><i style="background:#F6DDA8"></i>${L('Vacant ≤ 60 days', 'شاغرة ≤ 60 يوماً')}</span><span><i style="background:#F2B35A"></i>61–120</span><span><i style="background:#E58A7B"></i>${L('> 120 days', 'أكثر من 120 يوماً')}</span><span><i style="background:#EDF2F0"></i>${L('Occupied', 'مشغولة')}</span></div>`
    : mode === 'expiry' ? `<div class="mg-legend"><span><i style="background:#E58A7B"></i>${L('Holding over', 'تمديد ضمني')}</span><span><i style="background:#F2B35A"></i>${L('≤ 90 days', '≤ 90 يوماً')}</span><span><i style="background:#F6DDA8"></i>91–180</span><span><i style="background:#CDF4E5"></i>${L('> 180 days', 'أكثر من 180 يوماً')}</span><span><i style="background:#EDF2F0"></i>${L('No lease', 'بلا عقد')}</span></div>`
      : `<div class="mg-legend"><span><i style="background:#CDF4E5"></i>${L('Rented', 'مؤجّرة')}</span><span><i style="background:#DCE6EE"></i>${L('Owner-occupied', 'يسكنها المالك')}</span><span><i style="background:#FDE7C3"></i>${L('Maintenance', 'صيانة')}</span><span><i style="background:#fff;box-shadow:0 0 0 1px var(--line) inset"></i>${L('Vacant', 'شاغرة')}</span></div>`;

  P.workspace = (bid) => {
    const b = bld(bid);
    if (!b || b.manager !== ORG) return ui.empty({ icon: 'building', title: L('Not in your portfolio', 'ليس ضمن محفظتك'), action: ui.btn(L('Buildings', 'المباني'), { kind: 'primary', go: `${R}-buildings` }) });
    B.title(sName(bid)); B.navActive('buildings');
    crumbs({ label: L('Buildings', 'المباني'), go: `${R}-buildings` }, { label: sName(bid) });
    const s = bStats(bid); const a = MX.agreement[bid]; const f = finM(bid, 11);
    const us = D.unitsOf(bid); const ls = D.leases.filter((l) => l.building === bid);
    const com = D.committeeOf(bid); const reqs = D.requestsOf(bid);
    const tab = B.get('mg:wt', 'overview');
    const tabs = [
      { id: 'overview', label: L('Overview', 'نظرة عامة'), icon: 'building' }, { id: 'units', label: L('Units', 'الوحدات'), count: us.length }, { id: 'owners', label: L('Owners', 'المالكون') },
      { id: 'leases', label: L('Tenants & leases', 'المستأجرون والعقود'), count: ls.length }, { id: 'financials', label: L('Financials', 'المالية') }, { id: 'charges', label: L('Service charges', 'رسوم الخدمات') },
      { id: 'maintenance', label: L('Maintenance', 'الصيانة'), count: reqs.filter((q) => openStatuses.includes(q.status)).length }, { id: 'documents', label: L('Documents', 'المستندات') }, { id: 'committee', label: L('Committee', 'اللجنة') },
    ];
    const head = `<section class="card"><div class="mg-ws-head"><div class="mg-art">${facade(bid)}</div>
        <div style="min-width:0" class="stack-sm"><div class="row-sm wrap">${ui.status(a.status === 'renewalDue' ? 'renewalDue' : 'active')}${ui.badge(D.types[b.type], '', D.types[b.type].icon)}${b.source === 'gis' ? ui.badge(L('GIS-linked (sample)', 'مرتبط بالبلدية (نموذج)'), '', 'landmark') : ui.badge(L('Independently registered', 'مسجّل بشكل مستقل'), 'outline', 'userCheck')}</div>
          <h1>${esc(tx(b.name))}</h1><div class="row-sm wrap small muted">${icon('pin', 'mg-i14')}<span>${esc(tx(b.address))}</span><span>·</span>${ui.idMono(b.id)}${b.gis ? `<span>·</span>${ui.idMono(b.gis)}` : ''}</div></div>
        <div class="acts row wrap">${ui.btn(L('Building identity', 'هوية المبنى'), { icon: 'fingerprint', go: `${R}-building-${bid}` })}${ui.btn(L('Owner report', 'تقرير المالكين'), { icon: 'send', act: 'mgOwnerReport', arg: bid })}${ui.btn(L('New request', 'طلب جديد'), { icon: 'plus', kind: 'primary', act: 'mgNewReq', arg: bid })}</div></div>
      <div class="mg-ws-stats">${[[s.units, L('units', 'وحدة')], [B.pct(s.occ), L('occupancy', 'الإشغال')], [money(s.roll), L('rent roll / month', 'الإيجار الشهري')], [money(s.collected), L('collected · Nov', 'المحصّل · ت٢')], [money(s.out), L('outstanding rent', 'إيجار مستحق')], [s.reqs, L('open requests', 'طلبات مفتوحة')]].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('')}</div></section>`;
    let body = '';
    const unitCols = [
      { key: 'number', label: L('Unit', 'الوحدة'), m: 'title', render: (u) => sub2(esc(unitName(u)), ui.idMono(u.id)), sort: (u) => u.floor * 100 + (parseInt(u.number.slice(-2), 10) || 0) },
      { key: 'floor', label: L('Floor', 'الطابق'), num: true, sort: true, m: 'meta', render: (u) => (u.floor === 0 ? L('G', 'أرضي') : u.floor) },
      { key: 'area', label: L('Area m²', 'المساحة م²'), num: true, sort: true, m: 'meta', render: (u) => u.area },
      { key: 'owner', label: L('Owner', 'المالك'), sort: (u) => D.pname(u.owner), m: 'sub', render: (u) => esc(D.pname(u.owner)) },
      { key: 'tenant', label: L('Occupant', 'الشاغل'), m: 'hide', render: (u) => (u.status === 'rented' ? esc(D.pname(u.tenant)) : u.status === 'ownerOccupied' ? `<span class="faint">${L('Owner', 'المالك')}</span>` : '<span class="faint">—</span>') },
      { key: 'rent', label: L('Rent', 'الإيجار'), num: true, sort: (u) => (D.leaseOfUnit(u.id) || {}).rent || 0, m: 'hide', render: (u) => { const l = D.leaseOfUnit(u.id); return l ? numc(l.rent) : '<span class="faint">—</span>'; } },
      { key: 'charge', label: L('Service charge', 'رسوم الخدمات'), num: true, m: 'hide', render: (u) => numc(u.charge) },
      { key: 'status', label: L('Status', 'الحالة'), sort: true, m: 'end', render: (u) => ui.status(u.status) },
    ];
    if (tab === 'overview') {
      const mode = B.get('mg:wsm', 'status');
      body = `<div class="grid g-main"><div class="stack">
          ${ui.card({ title: L('Unit stack', 'مخطط الوحدات'), sub: L('Click a unit to open it', 'اضغط على وحدة لفتحها'), headExtra: ui.seg('mg:wsm', [{ id: 'status', label: L('Status', 'الحالة') }, { id: 'vacancy', label: L('Vacancy age', 'عمر الشغور') }, { id: 'expiry', label: L('Lease expiry', 'انتهاء العقود') }], mode), body: `${unitStack(bid, mode)}<div style="margin-top:14px">${heatLegend(mode)}</div>` })}
          ${ui.card({ title: L('Building profile', 'ملف المبنى'), link: { label: L('Open Building Identity', 'فتح هوية المبنى'), go: `${R}-building-${bid}` }, body: ui.kvGrid([
            [L('BENA ID', 'رقم بينا'), ui.idMono(b.id)], [L('Municipal GIS ID', 'رقم البلدية'), b.gis ? ui.idMono(b.gis) : '—'], [L('District', 'الحي'), esc(tx(D.district(b.district).name))], [L('Year built', 'سنة البناء'), b.year],
            [L('Floors', 'الطوابق'), b.floors], [L('Built area', 'المساحة المبنية'), `${B.num(b.area)} ${L('m²', 'م²')}`], [L('Parking', 'المواقف'), b.parking], [L('Elevators', 'المصاعد'), b.elevators],
            [L('Parcel', 'القطعة'), `${b.parcel.basin} / ${b.parcel.parcel}`], [L('Permit', 'الرخصة'), b.permit ? ui.idMono(b.permit) : '—'], [L('Verification', 'التحقق'), ui.status(b.verification)], [L('Facility manager', 'إدارة المرافق'), b.facility ? esc(tx(D.org(b.facility).name)) : L('Arkan (in-house)', 'أركان (داخلياً)')],
          ]) + `<div style="margin-top:14px">${idNote()}</div>` })}
        </div><div class="stack">
          ${ui.card({ cls: 'navy mg-navy', title: L('Management agreement', 'اتفاقية الإدارة'), body: ui.kv([[L('With', 'مع'), `<b>${esc(tx(a.with))}</b>`], [L('Term', 'المدة'), `<b>${B.date(a.since)} – ${B.date(a.end)}</b>`], [L('Scope', 'النطاق'), `<b>${esc(tx(a.scope))}</b>`], [L('Fee', 'الأتعاب'), `<b>${a.fee}% ${L('of collections', 'من التحصيل')}</b>`]]) })}
          ${ui.card({ title: L('November at a glance', 'تشرين الثاني بلمحة'), body: `<table class="mg-fin"><tbody>${[[L('Rent collected', 'الإيجار المحصّل'), f.rentCol], [L('Service charges collected', 'رسوم الخدمات المحصّلة'), f.chCol], [L('Common-area expenses', 'مصاريف المناطق المشتركة'), -f.opex], [L('Management fee', 'أتعاب الإدارة'), -f.fee]].map(([l, v]) => `<tr><td>${l}</td><td class="${v < 0 ? 'neg' : ''}">${v < 0 ? `(${money(-v)})` : money(v)}</td></tr>`).join('')}<tr class="tot"><td>${L('Net to owners', 'الصافي للمالكين')}</td><td>${money(f.ownerNet)}</td></tr></tbody></table>` })}
          ${ui.card({ title: L('Team & contacts', 'الفريق وجهات الاتصال'), body: ui.list([ui.li({ avatar: tx(pmOf(bid).n), title: esc(tx(pmOf(bid).n)), sub: `${esc(tx(pmOf(bid).role))} · Arkan`, act: 'mgMessage', arg: pmOf(bid).id }), ui.li({ avatar: tx(leasingOf(bid).n), title: esc(tx(leasingOf(bid).n)), sub: `${esc(tx(leasingOf(bid).role))} · Arkan`, act: 'mgMessage', arg: leasingOf(bid).id }), com ? ui.li({ avatar: D.pname(com.members[0].p), title: esc(D.pname(com.members[0].p)), sub: `${esc(tx(com.members[0].role))} · ${esc(tx(com.name))}`, act: 'mgMessage', arg: com.members[0].p }) : '', b.facility ? ui.li({ icon: 'tool', tone: 'navy', title: esc(tx(D.org(b.facility).name)), sub: L('Facility management contractor', 'مقاول إدارة المرافق') }) : ''].filter(Boolean)) })}
        </div></div>`;
    } else if (tab === 'units') {
      const fl = B.get('mg:wuf', 'all');
      const rows = us.filter((u) => fl === 'all' || u.status === fl);
      body = `${fbar([ui.chips('mg:wuf', [{ id: 'all', label: L('All', 'الكل'), count: us.length }].concat(['rented', 'ownerOccupied', 'vacant', 'maintenance'].map((k) => ({ id: k, label: ui.statusLabel(k), count: us.filter((u) => u.status === k).length }))), fl)], exportBtn(L(`Units — ${sName(bid)}`, `الوحدات — ${sName(bid)}`)))}
        ${xtable({ id: `mgWsU${bid}`, rows, pageSize: 20, rowGo: (u) => `${R}-unit-${u.id}`, bulk: [{ label: L('Request listing authorisation', 'طلب تفويض العرض'), icon: 'megaphone', act: 'mgListReq' }, { label: L('Schedule inspection', 'جدولة تفقد'), icon: 'clipboard', act: 'mgInspect' }], key: (u) => u.id, cols: unitCols })}`;
    } else if (tab === 'owners') {
      const owners = [...new Set(us.map((u) => u.owner))].map((p) => ({ id: p, p, units: us.filter((u) => u.owner === p) })).sort((x, y) => y.units.length - x.units.length);
      body = `${idNote()}<div style="height:12px"></div>${xtable({ id: `mgWsO${bid}`, rows: owners, pageSize: 15, rowAct: (o) => ({ act: 'mgMessage', arg: o.p }), cols: [
        { key: 'p', label: L('Owner', 'المالك'), m: 'title', sort: (o) => D.pname(o.p), render: (o) => `<div class="cell-main">${ui.avatar(D.pname(o.p), 'sm')}${sub2(esc(D.pname(o.p)), L('As recorded under the mandate', 'كما هو مسجّل في التفويض'))}</div>`, mRender: (o) => esc(D.pname(o.p)) },
        { key: 'units', label: L('Units', 'الوحدات'), m: 'sub', render: (o) => o.units.map((u) => `<button class="mg-link" data-go="${R}-unit-${u.id}" style="margin-inline-end:8px">${esc(u.number)}</button>`).join('') },
        { key: 'n', label: L('Count', 'العدد'), num: true, sort: (o) => o.units.length, m: 'meta', render: (o) => o.units.length },
        { key: 'mix', label: L('Use', 'الاستخدام'), m: 'meta', render: (o) => o.units.map((u) => ui.statusLabel(u.status)).filter((v, i, x) => x.indexOf(v) === i).join(' · ') },
        { key: 'charges', label: L('Service charges / mo', 'رسوم الخدمات شهرياً'), num: true, sort: (o) => B.sum(o.units, (u) => u.charge), m: 'end', render: (o) => numc(B.sum(o.units, (u) => u.charge)), total: (rs) => numc(B.sum(rs, (o) => B.sum(o.units, (u) => u.charge))) },
      ] })}`;
    } else if (tab === 'leases') {
      body = xtable({ id: `mgWsL${bid}`, rows: ls, pageSize: 15, defaultSort: 'end', rowGo: (l) => `${R}-lease-${l.id}`, cols: [
        { key: 'tenant', label: L('Tenant', 'المستأجر'), m: 'title', render: tenantCell, mRender: (l) => esc(D.pname(l.tenant)), sort: (l) => D.pname(l.tenant) },
        { key: 'unit', label: L('Unit', 'الوحدة'), m: 'sub', render: (l) => esc(unitName(D.unit(l.unit))) },
        { key: 'start', label: L('Since', 'منذ'), sort: true, m: 'hide', render: (l) => `<span class="nowrap">${B.date(l.start)}</span>` },
        { key: 'end', label: L('Ends', 'ينتهي'), sort: true, m: 'meta', render: (l) => `<span class="nowrap">${B.date(l.end)}</span>` },
        { key: 'bal', label: L('Balance', 'الرصيد'), num: true, sort: (l) => outstanding(l), m: 'meta', render: (l) => (arrears(l) ? `<b class="num" style="color:var(--bad)">${money(outstanding(l))}</b>` : `<span class="mint-ink small">${L('Up to date', 'منتظم')}</span>`) },
        { key: 'status', label: L('Status', 'الحالة'), m: 'meta', render: (l) => ui.status(leaseState(l)) },
        { key: 'rent', label: L('Rent', 'الإيجار'), num: true, sort: true, m: 'end', render: (l) => `<b class="num">${money(l.rent)}</b>`, total: (rs) => numc(B.sum(rs, (l) => l.rent)) },
      ] });
    } else if (tab === 'financials') {
      const idx = [6, 7, 8, 9, 10, 11]; const ms = idx.map((i) => finM(bid, i));
      body = `<div class="grid g-main">
          ${ui.card({ cls: 'mg-chart', title: L('Rent: billed vs collected', 'الإيجار: المفوتر مقابل المحصّل'), sub: L('Last 6 months', 'آخر 6 أشهر'), body: B.charts.bars({ labels: ms.map((m) => B.mon(+m.ym.slice(5) - 1)), series: [{ name: L('Collected', 'محصّل'), color: '#142B3B', values: ms.map((m) => m.rentCol) }, { name: L('Shortfall', 'العجز'), color: '#F1B5B0', values: ms.map((m) => Math.max(0, m.rentBilled - m.rentCol)) }], height: 200 }) })}
          ${ui.card({ title: L('Common-area spending · Nov', 'إنفاق المناطق المشتركة · ت٢'), sub: money(f.opex), link: { label: L('Expenses', 'المصاريف'), go: `${R}-expenses` }, body: B.charts.hbars({ data: f.opexBy.map((x, i) => ({ label: tx(MX.opexCats.find((c) => c.id === x.id).n), value: x.v, color: PAL8[i % 8] })), format: (v) => money(v) }) })}
        </div>
        <div style="height:16px"></div>
        ${xtable({ id: `mgWsF${bid}`, rows: ms, key: (m) => m.ym, cols: [
          { key: 'ym', label: L('Month', 'الشهر'), m: 'title', render: (m) => `<b>${ymLabel(m.ym)}</b>` },
          { key: 'rentBilled', label: L('Rent billed', 'الإيجار المفوتر'), num: true, m: 'meta', render: (m) => numc(m.rentBilled), total: (rs) => numc(B.sum(rs, (m) => m.rentBilled)) },
          { key: 'rentCol', label: L('Collected', 'المحصّل'), num: true, m: 'meta', render: (m) => numc(m.rentCol), total: (rs) => numc(B.sum(rs, (m) => m.rentCol)) },
          { key: 'chCol', label: L('Service charges', 'رسوم الخدمات'), num: true, m: 'hide', render: (m) => numc(m.chCol), total: (rs) => numc(B.sum(rs, (m) => m.chCol)) },
          { key: 'opex', label: L('Expenses', 'المصاريف'), num: true, m: 'hide', render: (m) => numc(m.opex), total: (rs) => numc(B.sum(rs, (m) => m.opex)) },
          { key: 'fee', label: L('Fee', 'الأتعاب'), num: true, m: 'hide', render: (m) => numc(m.fee), total: (rs) => numc(B.sum(rs, (m) => m.fee)) },
          { key: 'ownerNet', label: L('Net to owners', 'الصافي للمالكين'), num: true, m: 'end', render: (m) => `<b class="num">${money(m.ownerNet)}</b>`, total: (rs) => numc(B.sum(rs, (m) => m.ownerNet)) },
        ] })}`;
    } else if (tab === 'charges') {
      body = chargesBuilding(bid);
    } else if (tab === 'maintenance') {
      body = `${fbar([`<span class="muted small">${L(`${reqs.length} requests on record`, `${reqs.length} طلبات مسجّلة`)}</span>`], ui.btn(L('New request', 'طلب جديد'), { size: 'sm', kind: 'primary', icon: 'plus', act: 'mgNewReq', arg: bid }))}
        ${xtable({ id: `mgWsM${bid}`, rows: reqs, rowGo: () => `${R}-maintenance`, cols: reqCols({ noBuilding: true }) })}`;
    } else if (tab === 'documents') {
      const docs = MX.repo.filter((d) => d.b === bid && d.f !== 'leases' && d.f !== 'invoices');
      body = `${fbar([`<span class="muted small">${L(`${docs.length} documents · lease contracts and invoices are in the repository`, `${docs.length} مستندات · عقود الإيجار والفواتير في المستودع`)}</span>`], `${ui.btn(L('Repository', 'المستودع'), { size: 'sm', icon: 'folder', act: 'mgDocsFor', arg: bid })}${ui.btn(L('Upload', 'رفع'), { size: 'sm', icon: 'upload', act: 'soon', arg: L('Upload', 'الرفع') })}`)}
        ${xtable({ id: `mgWsD${bid}`, rows: docs, rowAct: (d) => ({ act: 'previewDoc', arg: tx(d.n) }), cols: docCols({ noBuilding: true }) })}`;
    } else if (tab === 'committee') {
      body = com ? `<div class="grid g-main">${ui.card({ title: esc(tx(com.name)), sub: esc(tx(com.basis)), headExtra: ui.status(com.kind), body: ui.list(com.members.map((m) => ui.li({ avatar: D.pname(m.p), title: esc(D.pname(m.p)), sub: `${esc(tx(m.role))}${m.unit ? ` · ${esc(D.unitLabel(D.unit(m.unit)))}` : ''}${m.auth && tx(m.auth) !== '—' ? ` · ${esc(tx(m.auth))}` : ''}`, end: `<span class="xs faint">${L('since', 'منذ')} ${B.dateShort(m.since)}</span>`, act: 'mgMessage', arg: m.p }))) })}
          ${ui.card({ title: L('Association details', 'تفاصيل الجمعية'), body: ui.kv([com.regNo ? [L('Registration', 'رقم التسجيل'), ui.idMono(com.regNo)] : null, [L('Formed', 'التأسيس'), B.date(com.formed)], com.term ? [L('Current term', 'الدورة الحالية'), esc(tx(com.term))] : null, [L('Monthly contribution', 'المساهمة الشهرية'), money(com.monthly)], [L('Members', 'الأعضاء'), com.members.length]]) + `<div style="margin-top:14px">${ui.callout(com.kind === 'legal' ? L('Formally documented owners\' association. Arkan reports collections and common-area spending every quarter.', 'جمعية مالكين موثّقة رسمياً. ترفع أركان تقارير التحصيل وإنفاق المناطق المشتركة كل ربع سنة.') : L('Informal committee — BENA does not assign it legal status. Arkan reports to it on a voluntary basis.', 'لجنة غير رسمية — لا تمنحها بينا صفة قانونية. ترفع أركان تقاريرها إليها طوعاً.'), com.kind === 'legal' ? 'mint' : '', com.kind === 'legal' ? 'badgeCheck' : 'info')}</div>` })}</div>`
        : `<div class="card">${ui.empty({ icon: 'users', title: L('No owners\' committee', 'لا توجد لجنة مالكين'), text: L(`Arkan acts as building manager under a mandate from ${tx(a.with)}.`, `تعمل أركان كمدير للمبنى بتفويض من ${tx(a.with)}.`), action: ui.btn(L('Invite owners to form one', 'دعوة المالكين لتشكيل لجنة'), { act: 'soon', arg: L('Committee invitation', 'دعوة اللجنة') }) })}</div>`;
    }
    return `<div class="stack">${head}<div>${ui.tabs('mg:wt', tabs, tab)}</div>${body}</div>`;
  };
  B.act.mgDocsFor = (bid) => { setScope(bid); B.go(`${R}-documents`); };

  /* shared column sets (also used by manager2.js) */
  const reqCols = (o = {}) => [
    { key: 'title', label: L('Request', 'الطلب'), m: 'title', sort: (q) => tx(q.title), render: (q) => `<div class="cell-main"><span class="li-icon" style="width:32px;height:32px;border-radius:9px">${icon(catIcon(q.cat))}</span>${sub2(esc(tx(q.title)), `${ui.idMono(q.id)} · ${esc(tx(D.cat(q.cat).name))}`)}</div>`, mRender: (q) => esc(tx(q.title)) },
    o.noBuilding ? null : { key: 'building', label: L('Building', 'المبنى'), sort: (q) => sName(q.building), m: 'sub', render: (q) => esc(sName(q.building)) },
    { key: 'where', label: L('Location', 'الموقع'), m: o.noBuilding ? 'sub' : 'hide', render: (q) => (q.unit ? esc(unitName(D.unit(q.unit))) : L('Common area', 'منطقة مشتركة')) },
    { key: 'priority', label: L('Priority', 'الأولوية'), sort: (q) => ['critical', 'high', 'medium', 'low'].indexOf(q.priority), m: 'meta', render: (q) => ui.status(q.priority) },
    { key: 'provider', label: L('Provider', 'المزوّد'), wide: true, m: 'hide', render: (q) => (q.provider ? esc(tx(D.provider(q.provider).name)) : `<span class="faint">${L('Unassigned', 'غير مُسند')}</span>`) },
    { key: 'created', label: L('Opened', 'الفتح'), sort: true, m: 'meta', render: (q) => `<span class="nowrap">${B.dateShort(q.created)}</span>` },
    { key: 'status', label: L('Status', 'الحالة'), sort: true, m: 'end', render: (q) => ui.status(q.status) },
  ].filter(Boolean);
  const docCols = (o = {}) => [
    { key: 'n', label: L('Document', 'المستند'), m: 'title', sort: (d) => tx(d.n), render: (d) => `<div class="cell-main"><span class="li-icon" style="width:32px;height:32px;border-radius:9px">${icon(MX.folders.find((f) => f.id === d.f).icon)}</span>${sub2(`<bdi>${esc(tx(d.n))}</bdi>`, `${ui.idMono(d.id)} · PDF · ${d.size}`)}</div>`, mRender: (d) => `<bdi>${esc(tx(d.n))}</bdi>` },
    { key: 'f', label: L('Folder', 'المجلد'), mid: true, sort: (d) => d.f, m: 'meta', render: (d) => esc(tx(MX.folders.find((f) => f.id === d.f).n)) },
    o.noBuilding ? null : { key: 'b', label: L('Building', 'المبنى'), sort: (d) => sName(d.b), m: 'sub', render: (d) => esc(sName(d.b)) },
    { key: 'by', label: L('Uploaded by', 'رفعه'), wide: true, m: 'hide', render: (d) => esc(staffName(d.by)) },
    { key: 'prov', label: L('Source', 'المصدر'), wide: true, m: 'hide', render: (d) => ui.prov(d.prov) },
    { key: 'date', label: L('Date', 'التاريخ'), sort: true, m: 'end', render: (d) => `<span class="nowrap">${B.date(d.date)}</span>` },
  ].filter(Boolean);
  /* Service-charge detail for one building (used by the workspace tab and the Service charges page) */
  function chargesBuilding(bid) {
    const us = D.unitsOf(bid); const ch = chargesOf(bid); const cats = catsFor(bid);
    const ytd = (cid) => B.sum(YTD_I, (j) => finM(bid, j).opexBy.find((x) => x.id === cid).v);
    const lines = cats.map((c) => ({ id: c.id, c, budget: Math.round(ch * c.w * 12), ytd: ytd(c.id) }));
    const totB = B.sum(lines, (x) => x.budget), totA = B.sum(lines, (x) => x.ytd), ytdBud = Math.round((totB * 11) / 12);
    const billedYtd = ch * 11, collectedYtd = B.sum(YTD_I, (j) => finM(bid, j).chCol);
    return `<div class="stack">${kband([
        kb('receipt', L('Annual budget 2026', 'موازنة 2026'), moneyC(totB), L(`${money(ch)} billed / month`, `${money(ch)} مفوترة شهرياً`)),
        kb('chart', L('Spent YTD', 'المنفق منذ بداية العام'), moneyC(totA), L(`${pct1((totA / ytdBud) * 100)} of YTD budget`, `${pct1((totA / ytdBud) * 100)} من موازنة الفترة`), totA > ytdBud ? 'bad' : 'ok'),
        kb('wallet', L('Billed YTD', 'المفوتر منذ بداية العام'), moneyC(billedYtd), L(`${us.length} units`, `${us.length} وحدة`)),
        kb('check', L('Collected YTD', 'المحصّل منذ بداية العام'), moneyC(collectedYtd), pct1((collectedYtd / billedYtd) * 100)),
        kb('alertCircle', L('Owner arrears', 'متأخرات المالكين'), moneyC(B.sum(us, (u) => scArrears(u) * u.charge)), L(`${us.filter((u) => scArrears(u) > 0).length} units`, `${us.filter((u) => scArrears(u) > 0).length} وحدات`), 'bad', `${R}-receivables`),
      ], 5)}
      <div class="grid g-main">
        ${xtable({ id: `mgScB${bid}`, rows: lines, caption: `<span>${L('Budget vs actual by category · Jan–Nov 2026', 'الموازنة مقابل الفعلي حسب الفئة · كانون الثاني–تشرين الثاني 2026')}</span>`, cols: [
          { key: 'c', label: L('Category', 'الفئة'), m: 'title', render: (x) => `<span class="row-sm">${icon(x.c.icon, 'mg-i14')}${esc(tx(x.c.n))}</span>` },
          { key: 'budget', label: L('Budget 2026', 'موازنة 2026'), num: true, sort: true, m: 'meta', render: (x) => numc(x.budget), total: () => numc(totB) },
          { key: 'ytd', label: L('Actual YTD', 'الفعلي'), num: true, sort: true, m: 'meta', render: (x) => numc(x.ytd), total: () => numc(totA) },
          { key: 'var', label: L('vs YTD budget', 'مقابل موازنة الفترة'), num: true, sort: (x) => x.ytd / (x.budget * 11 / 12), m: 'end', render: (x) => { const d = ((x.ytd - (x.budget * 11) / 12) / ((x.budget * 11) / 12)) * 100; return `<span class="num" style="color:${d > 3 ? 'var(--bad)' : d < -3 ? 'var(--ok)' : 'var(--text-2)'}">${d > 0 ? '+' : ''}${B.num1(d)}%</span>`; } },
          { key: 'use', label: L('Used', 'المستخدم'), m: 'hide', w: '120px', render: (x) => { const p = (x.ytd / x.budget) * 100; return ui.progress(p, p > 95 ? 'bad' : p > 88 ? 'warn' : '', 'thin'); } },
        ] })}
        ${ui.card({ title: L('Allocation method', 'طريقة التوزيع'), body: `${ui.kv([[L('Basis', 'الأساس'), L('Tariff by unit type (owners\' resolution)', 'تعرفة حسب نوع الوحدة (قرار المالكين)')], [L('Apartment', 'شقة'), `${money(180)} / ${L('mo', 'شهر')}`], [L('Office / clinic', 'مكتب / عيادة'), `${money(320)} / ${L('mo', 'شهر')}`], [L('Shop', 'محل'), `${money(240)} / ${L('mo', 'شهر')}`], [L('Reserve fund', 'صندوق الاحتياط'), L('Surplus carried to 2027', 'يُرحّل الفائض إلى 2027')]])}
          <div class="row wrap" style="margin-top:14px">${ui.btn(L('Re-run allocation', 'إعادة التوزيع'), { size: 'sm', icon: 'refresh', act: 'mgAlloc', arg: bid })}${ui.btn(L('Draft 2027 budget', 'مسودة موازنة 2027'), { size: 'sm', icon: 'edit', act: 'soon', arg: L('Budget drafting', 'إعداد الموازنة') })}</div>` })}
      </div>
      ${xtable({ id: `mgScU${bid}`, rows: us, pageSize: 15, rowGo: (u) => `${R}-unit-${u.id}`, caption: `<span>${L('Per-unit charges and balances', 'الرسوم والأرصدة لكل وحدة')}</span>`, cols: [
        { key: 'number', label: L('Unit', 'الوحدة'), m: 'title', sort: (u) => u.floor * 100 + (parseInt(u.number.slice(-2), 10) || 0), render: (u) => sub2(esc(unitName(u)), `${u.area} ${L('m²', 'م²')}`) },
        { key: 'owner', label: L('Billed to (owner)', 'المفوتر إليه (المالك)'), sort: (u) => D.pname(u.owner), m: 'sub', render: (u) => esc(D.pname(u.owner)) },
        { key: 'share', label: L('Share', 'الحصة'), num: true, m: 'hide', render: (u) => B.pct((u.charge / ch) * 100, 2) },
        { key: 'charge', label: L('Monthly', 'شهرياً'), num: true, sort: true, m: 'meta', render: (u) => numc(u.charge), total: (rs) => numc(B.sum(rs, (u) => u.charge)) },
        { key: 'ytd', label: L('Billed YTD', 'المفوتر'), num: true, m: 'hide', render: (u) => numc(u.charge * 11), total: (rs) => numc(B.sum(rs, (u) => u.charge * 11)) },
        { key: 'bal', label: L('Balance', 'الرصيد'), num: true, sort: (u) => scArrears(u) * u.charge, m: 'end', render: (u) => (scArrears(u) ? `<b class="num" style="color:var(--bad)">${money(scArrears(u) * u.charge)}</b>` : `<span class="mint-ink small">${L('Paid', 'مسدّد')}</span>`), total: (rs) => `<span style="color:var(--bad)">${money(B.sum(rs, (u) => scArrears(u) * u.charge))}</span>` },
      ] })}</div>`;
  }
  B.act.mgAlloc = (bid) => B.confirm({ title: L(`Re-run allocation for ${sName(bid)}?`, `إعادة توزيع رسوم ${sName(bid)}؟`), text: L('Recalculates each unit\'s share from the approved tariff. No invoices are changed until the next billing run.', 'يعيد حساب حصة كل وحدة من التعرفة المعتمدة. لا تتغير الفواتير حتى دورة الفوترة القادمة.'), ok: L('Re-run', 'إعادة'), onOk: () => B.success({ title: L('Allocation recalculated', 'تمت إعادة الحساب'), text: L('No differences found against the current tariff.', 'لا فروقات عن التعرفة الحالية.'), ref: B.uid('ALC') }) });

  /* ---------- 4 · Units ---------- */
  P.units = () => {
    crumbs({ label: L('Units', 'الوحدات') });
    const f = B.get('mg:uf', 'all'); const q = B.get('mg:uq', ''); const ty = B.get('mg:uty', 'all');
    const base = sUnits().filter((u) => (ty === 'all' || u.kind === ty) && B.match(q, u.number, u.id, D.person(u.owner).name, u.tenant && D.person(u.tenant).name));
    const match = (u, k) => k === 'all' || (k === 'occupied' ? u.status === 'rented' || u.status === 'ownerOccupied' : u.status === k);
    const rows = base.filter((u) => match(u, f));
    const chips = [['all', L('All', 'الكل')], ['occupied', L('Occupied', 'مشغولة')], ['vacant', L('Vacant', 'شاغرة')], ['rented', L('Rented', 'مؤجّرة')], ['ownerOccupied', L('Owner-occupied', 'يسكنها المالك')], ['maintenance', L('Maintenance', 'صيانة')]];
    const sel = B.get('mg:usel', '') || (rows[0] && rows[0].id); const u = rows.find((x) => x.id === sel) || D.unit(sel);
    let pn = '';
    if (u && inScope(u.building)) {
      const l = D.leaseOfUnit(u.id); const ol = listing(u); const pr = prevTenancy(u)[0];
      pn = panel({ title: `${esc(unitName(u))}`, sub: `${esc(sName(u.building))} · ${L('Floor', 'الطابق')} ${u.floor === 0 ? L('G', 'الأرضي') : u.floor} · ${ui.idMono(u.id)}`, close: 'mg:usel', body: `<div class="row-sm wrap">${ui.status(u.status)}${ui.badge(D.unitKinds[u.kind], 'outline')}${scArrears(u) ? ui.badge(L('Service charge arrears', 'متأخرات رسوم'), 'bad', 'alertCircle') : ''}</div>
          ${pstats([[`${u.area}`, L('m²', 'م²')], [l ? moneyC(l.rent) : '—', L('rent / mo', 'إيجار شهري')], [money(u.charge), L('service charge', 'رسوم الخدمات')]])}
          ${psec(L('People', 'الأشخاص'), ui.kv([[L('Owner', 'المالك'), esc(D.pname(u.owner))], [L('Occupant', 'الشاغل'), u.status === 'rented' ? esc(D.pname(u.tenant)) : u.status === 'ownerOccupied' ? L('Owner', 'المالك') : '—'], [L('Owner since', 'مالك منذ'), B.date(ownerSince(u))]]))}
          ${l ? psec(L('Lease', 'العقد'), ui.kv([[L('Contract', 'العقد'), `<button class="mg-link" data-go="${R}-lease-${l.id}">${ui.idMono(l.id)}</button>`], [L('Term', 'المدة'), `${B.dateShort(l.start)} – ${B.date(l.end)}`], [L('Status', 'الحالة'), ui.status(leaseState(l))], [L('Balance', 'الرصيد'), arrears(l) ? `<b style="color:var(--bad)">${money(outstanding(l))}</b>` : `<span class="mint-ink">${L('Up to date', 'منتظم')}</span>`]])) : ''}
          ${u.status === 'vacant' ? psec(L('Vacancy', 'الشغور'), ui.kv([[L('Vacant for', 'شاغرة منذ'), L(`${vacantDays(u)} days`, `${vacantDays(u)} يوماً`)], [L('Last rent', 'آخر إيجار'), pr ? money(pr.rent) : '—'], [L('Listing', 'العرض'), ol && ol.state === 'listed' ? ui.status('listed') : MX.listReq[u.id] ? ui.badge(L('Owner asked', 'طُلب من المالك'), 'info', 'send') : ui.status('notListed')]]) + `<div style="margin-top:10px">${ui.callout(L('Vacant units are never listed automatically — the owner must authorise any listing.', 'لا تُعرض الوحدات الشاغرة تلقائياً — يجب أن يفوّض المالك أي عرض.'), '', 'shield')}</div>`) : ''}`,
        foot: `${ui.btn(L('Open unit', 'فتح الوحدة'), { kind: 'primary', icon: 'door', go: `${R}-unit-${u.id}` })}${u.status === 'vacant' && !(ol && ol.state === 'listed') ? ui.btn(L('Ask owner to list', 'طلب العرض من المالك'), { icon: 'megaphone', act: 'mgListReq', arg: u.id }) : ui.btn(L('Request', 'طلب'), { icon: 'wrench', act: 'mgNewReq', arg: u.building })}` });
    }
    return `${phead({ title: L('Units', 'الوحدات'), sub: L(`${sUnits().length} units in ${sIds().length} building${sIds().length > 1 ? 's' : ''} — status, people, rent and service charges.`, `${sUnits().length} وحدة في ${sIds().length} ${sIds().length > 1 ? 'مبانٍ' : 'مبنى'} — الحالة والأشخاص والإيجار ورسوم الخدمات.`), actions: exportBtn(L('Units register', 'سجل الوحدات')) })}
      ${fbar([ui.search('mg:uq', L('Unit, owner or tenant…', 'وحدة أو مالك أو مستأجر…'), { reset: 'mgUnits:page' }), scopeSelect(),
        ui.select('mg:uty', [{ v: 'all', l: L('All types', 'كل الأنواع') }].concat(Object.keys(D.unitKinds).filter((k) => sUnits().some((x) => x.kind === k)).map((k) => ({ v: k, l: tx(D.unitKinds[k]) }))), { label: L('Type', 'النوع'), reset: 'mgUnits:page' }),
        ui.chips('mg:uf', chips.map(([id, label]) => ({ id, label, count: base.filter((x) => match(x, id)).length })), f)])}
      <div class="mg-split">${xtable({ id: 'mgUnits', rows, pageSize: 25, maxH: 'calc(100vh - 300px)', active: u && u.id, rowAct: (x) => ({ act: 'set', arg: `mg:usel=${x.id}` }), mGo: (x) => `${R}-unit-${x.id}`,
        bulk: [{ label: L('Ask owners to list', 'طلب العرض من المالكين'), icon: 'megaphone', act: 'mgListReq' }, { label: L('Schedule inspection', 'جدولة تفقد'), icon: 'clipboard', act: 'mgInspect' }, { label: L('Export', 'تصدير'), icon: 'download', act: 'mgExportSel' }],
        cols: [
          { key: 'number', label: L('Unit', 'الوحدة'), m: 'title', render: unitCell, mRender: (x) => `${esc(unitName(x))} <span class="faint xs">· ${esc(sName(x.building))}</span>`, sort: (x) => x.building + String(x.floor).padStart(2, '0') + x.number },
          { key: 'kind', label: L('Type · m²', 'النوع · م²'), wide: true, m: 'hide', sort: (x) => x.area, render: (x) => `${esc(tx(D.unitKinds[x.kind]))} · <span class="num">${x.area}</span>` },
          { key: 'owner', label: L('Owner', 'المالك'), m: 'sub', sort: (x) => D.pname(x.owner), render: (x) => esc(D.pname(x.owner)) },
          { key: 'tenant', label: L('Occupant', 'الشاغل'), mid: true, m: 'meta', render: (x) => (x.status === 'rented' ? esc(D.pname(x.tenant)) : x.status === 'ownerOccupied' ? `<span class="faint">${L('Owner', 'المالك')}</span>` : x.status === 'vacant' ? `<span class="faint">${L(`${vacantDays(x)} d vacant`, `شاغرة ${vacantDays(x)} يوماً`)}</span>` : '<span class="faint">—</span>') },
          { key: 'rent', label: L('Rent', 'الإيجار'), num: true, m: 'meta', sort: (x) => (D.leaseOfUnit(x.id) || {}).rent || 0, render: (x) => { const l = D.leaseOfUnit(x.id); return l ? numc(l.rent) : '<span class="faint">—</span>'; } },
          { key: 'charge', label: L('Svc charge', 'رسوم'), num: true, wide: true, m: 'hide', sort: true, render: (x) => numc(x.charge) },
          { key: 'status', label: L('Status', 'الحالة'), m: 'end', sort: true, render: (x) => ui.status(x.status) },
        ] })}${pn}</div>`;
  };

  /* ---------- 4b · Unit detail ---------- */
  P.unit = (id) => {
    const u = D.unit(id);
    if (!u || !inPf(u.building)) return ui.empty({ icon: 'door', title: L('Unit not found in your portfolio', 'الوحدة غير موجودة في محفظتك'), action: ui.btn(L('Units', 'الوحدات'), { kind: 'primary', go: `${R}-units` }) });
    B.title(`${unitName(u)} · ${sName(u.building)}`); B.navActive('units');
    crumbs({ label: L('Units', 'الوحدات'), go: `${R}-units` }, { label: sName(u.building), go: `${R}-workspace-${u.building}` }, { label: unitName(u) });
    const b = bld(u.building); const l = D.leaseOfUnit(u.id);
    const reqs = D.requests.filter((q) => q.unit === u.id);
    const prev = prevTenancy(u);
    const ownHist = D.ownerX && D.ownerX.history && D.ownerX.history[u.id];
    const ev = [];
    if (ownHist) ownHist.forEach((h, i) => ev.push({ date: h.from, icon: 'key', state: i === 0 ? 'current' : 'done', title: L(`Ownership — ${h.owners.map((o) => (o.p ? D.pname(o.p) : tx(o.org)) + (h.owners.length > 1 ? ` (${o.share}%)` : '')).join(', ')}`, `الملكية — ${h.owners.map((o) => (o.p ? D.pname(o.p) : tx(o.org)) + (h.owners.length > 1 ? ` (${o.share}%)` : '')).join('، ')}`), meta: `${B.date(h.from)}${h.to ? ` – ${B.date(h.to)}` : ''}`, body: esc(tx(h.basis)) }));
    else ev.push({ date: ownerSince(u), icon: 'key', state: 'current', title: L(`Ownership recorded — ${D.pname(u.owner)}`, `تسجيل الملكية — ${D.pname(u.owner)}`), meta: B.date(ownerSince(u)), body: L('As declared to Arkan under the management mandate (sample)', 'كما صُرّح بها لأركان بموجب تفويض الإدارة (نموذج)') });
    prev.forEach((p) => { ev.push({ date: p.start, icon: 'contract', state: 'done', title: L(`Lease started — ${D.pname(p.tenant)}`, `بدء عقد — ${D.pname(p.tenant)}`), meta: `${B.date(p.start)} · ${ui.idMono(p.id)}`, body: L(`${money(p.rent)} / month`, `${money(p.rent)} شهرياً`) }); ev.push({ date: p.end, icon: 'flag', state: 'done', title: L(`Lease ended — ${D.pname(p.tenant)}`, `انتهاء عقد — ${D.pname(p.tenant)}`), meta: B.date(p.end), body: L('Deposit settled, unit inspected', 'تمت تسوية التأمين وتفقد الوحدة') }); });
    if (l) ev.push({ date: l.start, icon: 'contract', state: 'current', title: L(`Current lease — ${D.pname(l.tenant)}`, `العقد الحالي — ${D.pname(l.tenant)}`), meta: `${B.date(l.start)} – ${B.date(l.end)} · ${ui.idMono(l.id)}`, body: L(`${money(l.rent)} / month · ${ui.statusLabel(leaseState(l))}`, `${money(l.rent)} شهرياً · ${ui.statusLabel(leaseState(l))}`) });
    reqs.forEach((q) => ev.push({ date: q.created, icon: 'wrench', state: q.status === 'completed' ? 'done' : 'current', title: L(`Maintenance — ${tx(q.title)}`, `صيانة — ${tx(q.title)}`), meta: `${B.date(q.created)} · ${ui.idMono(q.id)} · ${ui.statusLabel(q.status)}`, body: q.provider ? esc(tx(D.provider(q.provider).name)) : L('Awaiting assignment', 'بانتظار الإسناد') }));
    const ol = listing(u);
    if (ol && ol.state === 'listed') ev.push({ date: ol.since, icon: 'megaphone', state: 'current', title: L('Listed on the property marketplace (owner-authorised)', 'معروضة في سوق العقارات (بتفويض المالك)'), meta: `${B.date(ol.since)} · ${ui.idMono(ol.ref)}`, body: L(`${money(ol.ask)} / month · ${ol.inquiries} inquiries`, `${money(ol.ask)} شهرياً · ${ol.inquiries} استفسارات`) });
    ev.sort((x, y) => (x.date < y.date ? 1 : -1));
    const fl = B.get('mg:uhf', 'all');
    const evs = ev.filter((e) => fl === 'all' || (fl === 'owners' ? e.icon === 'key' : fl === 'leases' ? e.icon === 'contract' || e.icon === 'flag' || e.icon === 'megaphone' : e.icon === 'wrench'));
    return `<div class="stack">
      <section class="card"><div class="mg-ws-head" style="grid-template-columns:96px minmax(0,1fr) auto"><div class="mg-art" style="height:96px">${facade(u.building)}</div>
        <div class="stack-sm" style="min-width:0"><div class="row-sm wrap">${ui.status(u.status)}${ui.badge(D.unitKinds[u.kind], 'outline')}${scArrears(u) ? ui.badge(L('Service charge arrears', 'متأخرات رسوم'), 'bad', 'alertCircle') : ''}</div>
          <h1>${esc(unitName(u))} <span class="faint" style="font-weight:600">· ${esc(tx(b.name))}</span></h1>
          <div class="row-sm wrap small muted">${ui.idMono(u.id)}<span>· ${L('Floor', 'الطابق')} ${u.floor === 0 ? L('G', 'الأرضي') : u.floor} · ${u.area} ${L('m²', 'م²')}${u.beds ? ` · ${u.beds} ${L('bedrooms', 'غرف')}` : ''}</span></div></div>
        <div class="acts row wrap">${ui.btn(L('Building', 'المبنى'), { icon: 'building', go: `${R}-workspace-${b.id}` })}${l ? ui.btn(L('Lease', 'العقد'), { icon: 'contract', go: `${R}-lease-${l.id}` }) : ''}${ui.btn(L('Request', 'طلب'), { icon: 'wrench', kind: 'primary', act: 'mgNewReq', arg: b.id })}</div></div></section>
      <div class="grid g-main">
        ${ui.card({ title: L('Relationship history', 'سجل العلاقات'), sub: L('Owners, tenants, leases and maintenance over time', 'المالكون والمستأجرون والعقود والصيانة عبر الزمن'), body: `<div style="margin-bottom:16px">${ui.seg('mg:uhf', [{ id: 'all', label: L('All', 'الكل') }, { id: 'owners', label: L('Owners', 'المالكون') }, { id: 'leases', label: L('Leases', 'العقود') }, { id: 'maint', label: L('Maintenance', 'الصيانة') }], fl)}</div>${evs.length ? ui.timeline(evs) : ui.empty({ icon: 'history', title: L('Nothing in this view', 'لا شيء هنا') })}` })}
        <div class="stack">
          ${ui.card({ title: L('Owner', 'المالك'), body: ui.list([ui.li({ avatar: D.pname(u.owner), title: esc(D.pname(u.owner)), sub: L(`Since ${B.date(ownerSince(u))}`, `منذ ${B.date(ownerSince(u))}`), act: 'mgMessage', arg: u.owner, end: icon('chat', 'chev') })].concat((u.coOwners || []).map((p) => ui.li({ avatar: D.pname(p), title: esc(D.pname(p)), sub: L('Co-owner', 'مالك مشارك'), act: 'mgMessage', arg: p, end: icon('chat', 'chev') })))) + `<div style="margin-top:10px">${idNote()}</div>` })}
          ${l ? ui.card({ title: L('Current lease', 'العقد الحالي'), link: { label: L('Open', 'فتح'), go: `${R}-lease-${l.id}` }, body: `<div class="row" style="margin-bottom:10px">${ui.avatar(D.pname(l.tenant))}<div class="grow"><b>${esc(D.pname(l.tenant))}</b><div class="xs muted">${ui.idMono(l.id)}</div></div>${ui.status(leaseState(l))}</div>${ui.kv([[L('Rent', 'الإيجار'), money(l.rent)], [L('Ends', 'ينتهي'), `${B.date(l.end)}`], [L('Balance', 'الرصيد'), arrears(l) ? `<span style="color:var(--bad)">${money(outstanding(l))}</span>` : `<span class="mint-ink">${L('Up to date', 'منتظم')}</span>`]])}` })
            : ui.card({ title: L('Occupancy', 'الإشغال'), body: `<p class="small muted">${u.status === 'ownerOccupied' ? L('Occupied by the owner. No lease on record.', 'يسكنها المالك. لا يوجد عقد.') : u.status === 'maintenance' ? L('Closed for works — not available to let.', 'مغلقة للأعمال — غير متاحة للتأجير.') : ol && ol.state === 'listed' ? L(`Vacant and listed at ${money(ol.ask)} / month with the owner's authorisation.`, `شاغرة ومعروضة بـ ${money(ol.ask)} شهرياً بتفويض المالك.`) : L(`Vacant for ${vacantDays(u)} days. Listing requires the owner's explicit approval.`, `شاغرة منذ ${vacantDays(u)} يوماً. يتطلب العرض موافقة صريحة من المالك.`)}</p>${u.status === 'vacant' && !(ol && ol.state === 'listed') ? `<div style="margin-top:12px">${ui.btn(MX.listReq[u.id] ? L('Authorisation requested', 'طُلب التفويض') : L('Ask owner to authorise listing', 'طلب تفويض المالك للعرض'), { size: 'sm', icon: 'megaphone', act: 'mgListReq', arg: u.id, disabled: !!MX.listReq[u.id] })}</div>` : ''}` })}
          ${ui.card({ title: L('Unit facts', 'معلومات الوحدة'), body: ui.kv([[L('Monthly service charge', 'رسوم الخدمات الشهرية'), money(u.charge)], [L('Service charge balance', 'رصيد رسوم الخدمات'), scArrears(u) ? `<span style="color:var(--bad)">${money(scArrears(u) * u.charge)}</span>` : L('Paid', 'مسدّد')], [L('Area', 'المساحة'), `${u.area} ${L('m²', 'م²')}`], [L('Type', 'النوع'), esc(tx(D.unitKinds[u.kind]))], [L('Maintenance jobs', 'أعمال الصيانة'), reqs.length]]) })}
        </div></div></div>`;
  };

  /* ---------- 5 · Owners ---------- */
  const ownerRows = () => {
    const us = sUnits(); const map = {};
    us.forEach((u) => { (map[u.owner] = map[u.owner] || []).push(u); });
    return Object.entries(map).map(([p, units]) => {
      const ls = units.map((u) => D.leaseOfUnit(u.id)).filter(Boolean);
      const roll = B.sum(ls, (l) => l.rent); const col = roll - B.sum(ls.filter((l) => arrears(l) > 0), (l) => l.rent);
      const fee = Math.round(B.sum(ls, (l) => (l.rent - (arrears(l) > 0 ? l.rent : 0)) * (MX.agreement[l.building].fee / 100)));
      const occ = units.filter((u) => u.status === 'rented' || u.status === 'ownerOccupied').length;
      return { id: p, p, units, ls, roll, col, fee, net: col - fee, occ: (occ / units.length) * 100, sc: B.sum(units, (u) => scArrears(u) * u.charge), bset: [...new Set(units.map((u) => u.building))] };
    });
  };
  P.owners = () => {
    crumbs({ label: L('Owners', 'المالكون') });
    const q = B.get('mg:oq', ''); const fl = B.get('mg:of', 'all');
    const all = ownerRows();
    const rows = all.slice().sort((a, b) => b.units.length - a.units.length).filter((o) => B.match(q, D.person(o.p).name, ...o.units.map((u) => u.number)) && (fl === 'all' || (fl === 'multi' ? o.units.length > 1 : fl === 'arrears' ? o.sc > 0 : fl === 'vacant' ? o.units.some((u) => u.status === 'vacant') : true)));
    const sel = B.get('mg:osel', '') || (rows[0] && rows[0].id); const o = all.find((x) => x.id === sel);
    const pn = o ? panel({ title: esc(D.pname(o.p)), sub: L(`${o.units.length} unit${o.units.length > 1 ? 's' : ''} · ${o.bset.map(sName).join(', ')}`, `${o.units.length} وحدة · ${o.bset.map(sName).join('، ')}`), lead: ui.avatar(D.pname(o.p)), close: 'mg:osel', body: `
        ${pstats([[moneyC(o.col), L('rent collected · Nov', 'محصّل · ت٢')], [moneyC(o.fee), L('Arkan fee', 'أتعاب أركان')], [moneyC(o.net), L('net to owner', 'الصافي للمالك')]])}
        ${psec(L('Units', 'الوحدات'), ui.list(o.units.map((u) => ui.li({ title: `${esc(unitName(u))} · ${esc(sName(u.building))}`, sub: ui.statusLabel(u.status) + (D.leaseOfUnit(u.id) ? ` · ${money(D.leaseOfUnit(u.id).rent)}` : ''), go: `${R}-unit-${u.id}` }))))}
        ${psec(L('Contact & mandate', 'التواصل والتفويض'), ui.kv([[L('Phone', 'الهاتف'), `<span class="ltr">${esc(D.person(o.p).phone || '+970 59 ••• ••' + String(seedOf(o.p)).slice(-2))}</span>`], [L('Statements', 'الكشوف'), L('Monthly · BENA owner app', 'شهرياً · تطبيق المالك')], [L('Service charge balance', 'رصيد رسوم الخدمات'), o.sc ? `<b style="color:var(--bad)">${money(o.sc)}</b>` : L('Paid', 'مسدّد')]]))}
        ${idNote()}`,
      foot: `${ui.btn(L('Statement', 'الكشف'), { icon: 'doc', act: 'previewDoc', arg: L(`Owner statement — ${D.pname(o.p)} — November 2026`, `كشف المالك — ${D.pname(o.p)} — تشرين الثاني 2026`) })}${ui.btn(L('Message', 'مراسلة'), { kind: 'primary', icon: 'chat', act: 'mgMessage', arg: o.p })}` }) : '';
    return `${phead({ title: L('Owners', 'المالكون'), sub: L('Unit owners Arkan acts for — holdings, collections, fees and statements.', 'مالكو الوحدات الذين تعمل أركان نيابة عنهم — الحيازات والتحصيل والأتعاب والكشوف.'), actions: `${exportBtn(L('Owners register', 'سجل المالكين'))}${ui.btn(L('Send November statements', 'إرسال كشوف تشرين الثاني'), { kind: 'primary', icon: 'send', act: 'mgOwnerReport', arg: '' })}` })}
      ${kband([kb('users', L('Owners', 'المالكون'), all.length, L(`${all.filter((x) => x.units.length > 1).length} with several units`, `${all.filter((x) => x.units.length > 1).length} لديهم عدة وحدات`)), kb('wallet', L('Rent collected for owners · Nov', 'المحصّل للمالكين · ت٢'), moneyC(B.sum(all, (x) => x.col))), kb('percent', L('Arkan fees · Nov', 'أتعاب أركان · ت٢'), moneyC(B.sum(all, (x) => x.fee))), kb('coins', L('Net to owners · Nov', 'الصافي للمالكين · ت٢'), moneyC(B.sum(all, (x) => x.net))), kb('alertCircle', L('Owner service-charge arrears', 'متأخرات رسوم المالكين'), moneyC(B.sum(all, (x) => x.sc)), L(`${all.filter((x) => x.sc).length} owners`, `${all.filter((x) => x.sc).length} مالكين`), 'bad', `${R}-receivables`)], 5)}
      <div style="height:14px"></div>
      ${fbar([ui.search('mg:oq', L('Owner name or unit…', 'اسم المالك أو الوحدة…'), { reset: 'mgOwners:page' }), scopeSelect(), ui.chips('mg:of', [{ id: 'all', label: L('All', 'الكل'), count: all.length }, { id: 'multi', label: L('Several units', 'عدة وحدات') }, { id: 'vacant', label: L('With vacant units', 'لديهم وحدات شاغرة') }, { id: 'arrears', label: L('Service-charge arrears', 'متأخرات رسوم') }], fl)])}
      <div class="mg-split">${xtable({ id: 'mgOwners', rows, pageSize: 25, maxH: 'calc(100vh - 360px)', active: o && o.id, rowAct: (x) => ({ act: 'set', arg: `mg:osel=${x.id}` }), defaultSort: '-n',
        bulk: [{ label: L('Send statements', 'إرسال الكشوف'), icon: 'send', act: 'mgOwnerReport' }, { label: L('Message', 'مراسلة'), icon: 'chat', act: 'mgMessageSel' }, { label: L('Export', 'تصدير'), icon: 'download', act: 'mgExportSel' }],
        cols: [
          { key: 'p', label: L('Owner', 'المالك'), m: 'title', sort: (x) => D.pname(x.p), render: (x) => `<div class="cell-main">${ui.avatar(D.pname(x.p), 'sm')}${sub2(esc(D.pname(x.p)), x.bset.map(sName).join(' · '))}</div>`, mRender: (x) => esc(D.pname(x.p)) },
          { key: 'n', label: L('Units', 'الوحدات'), num: true, sort: (x) => x.units.length, m: 'meta', render: (x) => x.units.length },
          { key: 'occ', label: L('Occupied', 'مشغولة'), num: true, sort: (x) => x.occ, m: 'hide', render: (x) => B.pct(x.occ) },
          { key: 'roll', label: L('Rent roll', 'الإيجار'), num: true, mid: true, sort: (x) => x.roll, m: 'meta', render: (x) => (x.roll ? numc(x.roll) : '<span class="faint">—</span>'), total: (rs) => numc(B.sum(rs, (x) => x.roll)) },
          { key: 'fee', label: L('Fee', 'الأتعاب'), num: true, wide: true, sort: (x) => x.fee, m: 'hide', render: (x) => numc(x.fee), total: (rs) => numc(B.sum(rs, (x) => x.fee)) },
          { key: 'net', label: L('Net · Nov', 'الصافي · ت٢'), num: true, sort: (x) => x.net, m: 'end', render: (x) => `<b class="num">${money(x.net)}</b>`, total: (rs) => numc(B.sum(rs, (x) => x.net)) },
          { key: 'sc', label: L('Svc-charge bal.', 'رصيد الرسوم'), num: true, sort: (x) => x.sc, m: 'hide', render: (x) => (x.sc ? `<span class="num" style="color:var(--bad);font-weight:600">${money(x.sc)}</span>` : '<span class="faint">—</span>') },
        ] })}${pn}</div>`;
  };

  /* ---------- 6 · Tenants ---------- */
  P.tenants = () => {
    crumbs({ label: L('Tenants', 'المستأجرون') });
    const q = B.get('mg:tq', ''); const sf = B.get('mg:ts', 'all');
    const all = sLeases();
    let rows = all.filter((l) => B.match(q, D.person(l.tenant).name, l.id, D.unit(l.unit).number));
    if (sf === 'arrears') rows = rows.filter((l) => arrears(l) > 0); else if (sf === 'expiring') rows = rows.filter((l) => l.status !== 'active'); else if (sf === 'commercial') rows = rows.filter((l) => D.unit(l.unit).kind !== 'apartment');
    const sel = B.get('mg:tsel', '') || (rows[0] && rows[0].id); const l = D.lease(sel);
    let pn = '';
    if (l && inScope(l.building)) {
      const u = D.unit(l.unit); const a = arrears(l);
      const hist = MX.months.slice(6).map((ym, i) => ({ ym, st: ym > '2026-11' ? 'upcoming' : (5 - i) < a ? 'overdue' : l.start.slice(0, 7) > ym ? 'none' : 'paid' })).filter((h) => h.st !== 'none');
      pn = panel({ title: esc(D.pname(l.tenant)), sub: `${esc(unitName(u))} · ${esc(sName(l.building))}`, lead: ui.avatar(D.pname(l.tenant)), close: 'mg:tsel', body: `
          <div class="row-sm wrap">${ui.status(leaseState(l))}${a ? ui.badge(L(`${a} month(s) unpaid`, `${a} شهر غير مدفوع`), 'bad', 'alertCircle') : ui.badge(L('Up to date', 'منتظم'), 'ok', 'check')}${MX.reminded[l.id] ? ui.status('reminded') : ''}</div>
          ${pstats([[moneyC(l.rent), L('rent / mo', 'إيجار شهري')], [moneyC(outstanding(l)), L('balance', 'الرصيد')], [B.dateShort(l.end), L('lease ends', 'ينتهي العقد')]])}
          ${psec(L('Payments · last 6 months', 'الدفعات · آخر 6 أشهر'), `<div class="mg-legend" style="gap:6px">${hist.map((h) => `<span class="badge ${h.st === 'paid' ? 'ok' : h.st === 'overdue' ? 'bad' : 'info'}">${B.mon(+h.ym.slice(5) - 1)}</span>`).join('')}</div>`)}
          ${psec(L('Contact', 'التواصل'), ui.kv([[L('Phone', 'الهاتف'), `<span class="ltr">${esc(D.person(l.tenant).phone || `+970 59 ${String(seedOf(l.tenant)).slice(0, 3)} ${String(seedOf(l.id)).slice(0, 4)}`)}</span>`], [L('Contract', 'العقد'), `<button class="mg-link" data-go="${R}-lease-${l.id}">${ui.idMono(l.id)}</button>`], [L('Deposit held', 'التأمين المحتجز'), money(l.deposit)], [L('Owner', 'المالك'), esc(D.pname(l.owner))]]))}`,
        foot: `${a ? ui.btn(L('Remind', 'تذكير'), { icon: 'bell', act: 'mgRemind', arg: l.id }) : ''}${a ? ui.btn(L('Record payment', 'تسجيل دفعة'), { icon: 'check', act: 'mgRecord', arg: l.id }) : ui.btn(L('Message', 'مراسلة'), { icon: 'chat', act: 'mgMessage', arg: l.tenant })}${ui.btn(L('Open lease', 'فتح العقد'), { kind: 'primary', icon: 'contract', go: `${R}-lease-${l.id}` })}` });
    }
    return `${phead({ title: L('Tenants', 'المستأجرون'), sub: L('Everyone renting in your buildings, with balances and contract status.', 'كل من يستأجر في مبانيك، مع الأرصدة وحالة العقود.'), actions: `${exportBtn(L('Tenants register', 'سجل المستأجرين'))}${ui.btn(L('Remind all in arrears', 'تذكير جميع المتأخرين'), { kind: 'primary', icon: 'bell', act: 'mgRemindAll' })}` })}
      ${kband([kb('users', L('Tenants', 'المستأجرون'), new Set(all.map((x) => x.tenant)).size, L(`${all.length} leases`, `${all.length} عقداً`)), kb('store', L('Commercial tenants', 'مستأجرون تجاريون'), all.filter((x) => D.unit(x.unit).kind !== 'apartment').length, L('offices, shops, clinics', 'مكاتب ومحلات وعيادات')), kb('alertCircle', L('In arrears', 'متأخرون'), all.filter((x) => arrears(x) > 0).length, money(B.sum(all, outstanding)), 'bad', `${R}-receivables`), kb('refresh', L('Renewals to handle', 'تجديدات للمتابعة'), all.filter((x) => x.status !== 'active').length, L('expiring or holding over', 'تنتهي أو بتمديد ضمني'), 'warn', `${R}-leases`)], 4)}
      <div style="height:14px"></div>
      ${fbar([ui.search('mg:tq', L('Tenant, unit or contract…', 'مستأجر أو وحدة أو عقد…'), { reset: 'mgTen:page' }), scopeSelect(), ui.chips('mg:ts', [{ id: 'all', label: L('All', 'الكل') }, { id: 'arrears', label: L('In arrears', 'متأخرون') }, { id: 'expiring', label: L('Expiring / holding over', 'تنتهي / تمديد ضمني') }, { id: 'commercial', label: L('Commercial', 'تجاري') }], sf)])}
      <div class="mg-split">${xtable({ id: 'mgTen', rows, pageSize: 25, maxH: 'calc(100vh - 360px)', active: l && l.id, rowAct: (x) => ({ act: 'set', arg: `mg:tsel=${x.id}` }), mGo: (x) => `${R}-lease-${x.id}`, mLead: (x) => ui.avatar(D.pname(x.tenant)),
        bulk: [{ label: L('Send reminders', 'إرسال تذكيرات'), icon: 'bell', act: 'mgRemindSel' }, { label: L('Message', 'مراسلة'), icon: 'chat', act: 'mgMessageSel' }, { label: L('Export', 'تصدير'), icon: 'download', act: 'mgExportSel' }],
        cols: [
          { key: 'tenant', label: L('Tenant', 'المستأجر'), m: 'title', sort: (x) => D.pname(x.tenant), render: tenantCell, mRender: (x) => esc(D.pname(x.tenant)) },
          { key: 'unit', label: L('Unit', 'الوحدة'), m: 'sub', render: (x) => sub2(esc(unitName(D.unit(x.unit))), esc(sName(x.building))) },
          { key: 'start', label: L('Since', 'منذ'), sort: true, wide: true, m: 'hide', render: (x) => `<span class="nowrap">${B.dateShort(x.start)} ${x.start.slice(0, 4)}</span>` },
          { key: 'rent', label: L('Rent', 'الإيجار'), num: true, sort: true, m: 'meta', render: (x) => numc(x.rent) },
          { key: 'bal', label: L('Balance', 'الرصيد'), num: true, sort: (x) => outstanding(x), m: 'end', render: (x) => (arrears(x) ? `<b class="num" style="color:var(--bad)">${money(outstanding(x))}</b>` : `<span class="mint-ink small">${L('Paid', 'مسدّد')}</span>`), total: (rs) => `<span style="color:var(--bad)">${money(B.sum(rs, outstanding))}</span>` },
          { key: 'status', label: L('Lease', 'العقد'), mid: true, sort: (x) => x.end, m: 'meta', render: (x) => ui.status(leaseState(x)) },
        ] })}${pn}</div>`;
  };

  /* ---------- 7 · Occupancy ---------- */
  P.occupancy = () => {
    crumbs({ label: L('Occupancy', 'الإشغال') });
    const ids = sIds(); const s = agg(ids);
    const potential = B.sum(sUnits().filter((u) => u.status === 'rented' || u.status === 'vacant'), (u) => { const l = D.leaseOfUnit(u.id); if (l) return l.rent; const p = prevTenancy(u)[0]; return p ? p.rent : u.area * 20; });
    const econ = (s.roll / (potential || 1)) * 100;
    const trend = MX.months.map((_, i) => (i === 11 ? Math.round(s.occ * 10) / 10 : Math.round((s.occ - (11 - i) * 0.38 + ((seedOf('occ' + i + ids.join()) % 17) - 8) / 10) * 10) / 10));
    const vac = sUnits().filter((u) => u.status === 'vacant');
    const bk = [[0, 30], [31, 90], [91, 180], [181, 9999]].map(([a, b]) => vac.filter((u) => vacantDays(u) >= a && vacantDays(u) <= b));
    const hb = B.get('mg:ohb', '') && ids.includes(B.get('mg:ohb', '')) ? B.get('mg:ohb') : ids[0];
    const mode = B.get('mg:ohm', 'status');
    const vf = B.get('mg:ovb', 'all');
    const vrows = vac.filter((u) => vf === 'all' || bk[+vf].includes(u));
    return `${phead({ title: L('Occupancy', 'الإشغال'), sub: L('Physical and economic occupancy, vacancy ageing and floor-level heatmaps.', 'الإشغال الفعلي والاقتصادي وعمر الشغور وخرائط الطوابق الحرارية.'), actions: `${exportBtn(L('Occupancy report', 'تقرير الإشغال'))}` })}
      <div class="stack">
      ${kband([kb('pie', L('Physical occupancy', 'الإشغال الفعلي'), pct1(s.occ), L(`${s.rented + s.own} of ${s.units} units`, `${s.rented + s.own} من ${s.units} وحدة`)), kb('coins', L('Economic occupancy', 'الإشغال الاقتصادي'), pct1(econ), L('rent roll ÷ potential rent', 'الإيجار ÷ الإيجار المحتمل')), kb('door', L('Vacant units', 'الوحدات الشاغرة'), s.vacant, L(`${moneyC(potential - s.roll)} / mo potential`, `${moneyC(potential - s.roll)} شهرياً محتملة`), 'warn'), kb('clock', L('Average days vacant', 'متوسط أيام الشغور'), s.vacDays, L(`${bk[3].length} longer than 180 days`, `${bk[3].length} أكثر من 180 يوماً`), bk[3].length ? 'bad' : ''), kb('calendarCheck', L('Leases at risk ≤ 90 d', 'عقود معرّضة ≤ 90 يوماً'), s.exp90.length, L(`${s.holdover} holding over`, `${s.holdover} بتمديد ضمني`), 'warn', `${R}-leases`)], 5)}
      <div class="grid g-main">
        ${ui.card({ cls: 'mg-chart', title: L('Occupancy trend', 'اتجاه الإشغال'), sub: L('Physical occupancy · last 12 months (sample)', 'الإشغال الفعلي · آخر 12 شهراً (نموذج)'), body: B.charts.line({ labels: MX.months.map((ym) => B.mon(+ym.slice(5) - 1)), series: [{ name: L('Occupancy', 'الإشغال'), color: '#36D6A0', values: trend, area: true }], height: 190, min: 70, format: (v) => B.num1(v) + '%' }) })}
        ${ui.card({ title: L('By building', 'حسب المبنى'), body: B.charts.shares({ rows: ids.map((id) => { const x = bStats(id); return { label: sName(id), parts: [{ value: x.rented, color: '#36D6A0', name: L('Rented', 'مؤجّرة') }, { value: x.own, color: '#7FA7C2', name: L('Owner-occupied', 'يسكنها المالك') }, { value: x.maint, color: '#F2B35A', name: L('Maintenance', 'صيانة') }, { value: x.vacant, color: '#DDE5E2', name: L('Vacant', 'شاغرة') }].filter((p) => p.value) }; }) }) + `<div style="margin-top:12px">${occLegend()}</div>` })}
      </div>
      ${ui.card({ title: L('Floor heatmap', 'الخريطة الحرارية للطوابق'), sub: `${esc(tx(bld(hb).name))} · ${L('click a unit to open it', 'اضغط على وحدة لفتحها')}`, headExtra: `<div class="row-sm wrap">${ids.length > 1 ? ui.seg('mg:ohb', ids.map((id) => ({ id, label: sName(id) })), hb) : ''}${ui.seg('mg:ohm', [{ id: 'status', label: L('Status', 'الحالة') }, { id: 'vacancy', label: L('Vacancy age', 'عمر الشغور') }, { id: 'expiry', label: L('Lease expiry', 'انتهاء العقود') }], mode)}</div>`, body: `${unitStack(hb, mode)}<div style="margin-top:14px">${heatLegend(mode)}</div>` })}
      <div><div class="section-title"><h2>${L('Vacancy ageing', 'أعمار الشغور')}</h2>${ui.chips('mg:ovb', [{ id: 'all', label: L('All vacant', 'كل الشاغرة'), count: vac.length }, { id: '0', label: L('0–30 d', '0–30 ي'), count: bk[0].length }, { id: '1', label: L('31–90 d', '31–90 ي'), count: bk[1].length }, { id: '2', label: L('91–180 d', '91–180 ي'), count: bk[2].length }, { id: '3', label: L('180+ d', '+180 ي'), count: bk[3].length }], vf)}</div>
      ${xtable({ id: 'mgVac', rows: vrows, defaultSort: '-days', rowGo: (u) => `${R}-unit-${u.id}`, empty: { icon: 'checkCircle', title: L('No vacant units here', 'لا وحدات شاغرة هنا') },
        bulk: [{ label: L('Ask owners to authorise listing', 'طلب تفويض المالكين للعرض'), icon: 'megaphone', act: 'mgListReq' }, { label: L('Schedule inspection', 'جدولة تفقد'), icon: 'clipboard', act: 'mgInspect' }],
        cols: [
          { key: 'u', label: L('Unit', 'الوحدة'), m: 'title', sort: (u) => u.building + u.number, render: unitCell, mRender: (u) => `${esc(unitName(u))} · ${esc(sName(u.building))}` },
          { key: 'kind', label: L('Type · m²', 'النوع · م²'), m: 'hide', render: (u) => `${esc(tx(D.unitKinds[u.kind]))} · ${u.area}` },
          { key: 'owner', label: L('Owner', 'المالك'), m: 'sub', sort: (u) => D.pname(u.owner), render: (u) => esc(D.pname(u.owner)) },
          { key: 'days', label: L('Days vacant', 'أيام الشغور'), num: true, sort: (u) => vacantDays(u), m: 'end', render: (u) => `<b class="num" style="color:${vacantDays(u) > 120 ? 'var(--bad)' : vacantDays(u) > 60 ? 'var(--warn)' : 'var(--ink)'}">${vacantDays(u)}</b>` },
          { key: 'last', label: L('Last rent', 'آخر إيجار'), num: true, m: 'meta', render: (u) => { const p = prevTenancy(u)[0]; return p ? numc(p.rent) : '<span class="faint">—</span>'; } },
          { key: 'lost', label: L('Rent foregone', 'الإيجار الفائت'), num: true, wide: true, sort: (u) => vacantDays(u) * ((prevTenancy(u)[0] || {}).rent || u.area * 20), m: 'hide', render: (u) => numc(Math.round((vacantDays(u) / 30) * ((prevTenancy(u)[0] || {}).rent || u.area * 20))), total: (rs) => numc(B.sum(rs, (u) => Math.round((vacantDays(u) / 30) * ((prevTenancy(u)[0] || {}).rent || u.area * 20)))) },
          { key: 'list', label: L('Listing (owner decision)', 'العرض (قرار المالك)'), m: 'meta', render: (u) => { const ol = listing(u); return ol && ol.state === 'listed' ? ui.status('listed') : MX.listReq[u.id] ? ui.badge(L('Authorisation requested', 'طُلب التفويض'), 'info', 'send') : ui.status('notListed'); } },
        ] })}</div>
      ${ui.demoNote(L('Vacancy durations and trend values are simulated sample data. Vacant units are never listed without the owner\'s authorisation.', 'مدد الشغور وقيم الاتجاه بيانات نموذجية محاكاة. لا تُعرض الوحدات الشاغرة دون تفويض المالك.'))}
      </div>`;
  };

  /* =====================================================================
   * Role registration (pages continue in manager2.js)
   * ===================================================================== */
  MX.h = { YTD_I, R, ORG, T, MX, money, moneyC, unitName, ymLabel, iso, addDays, todayIso, seedOf, blds, bIds, inPf, bld, sName, arrears, outstanding, daysLate, bucket, leaseState, bStats, agg, finM, finSum, catsFor, chargesOf, scArrears, vacantDays, listing, staff, staffName, covers, pmOf, leasingOf, vendorName, scope, setScope, sIds, inScope, sUnits, sLeases, scopeLabel, phead, kb, kband, fbar, scopeSelect, panel, psec, pstats, xtable, sub2, numc, occCell, occBar, facade, tenantCell, unitCell, buildingOpts, catIcon, openStatuses, idNote, exportBtn, reqCols, docCols, chargesBuilding, crumbs, pct1, dTag, delta, remindMany, prevTenancy };
  MX.P = P;
  const ws = () => [{ id: 'all', label: T('All buildings', 'كل المباني'), icon: 'layers' }].concat(blds().map((b) => ({ id: b.id, label: MX.short[b.id], icon: 'building' })));
  B.role({
    id: R, icon: 'briefcase', nav: 'drawer',
    name: T('Property Management', 'إدارة العقارات'), short: T('Property', 'العقارات'),
    org: T('Arkan Property Management', 'أركان لإدارة العقارات'), tag: T('Operations', 'العمليات'),
    desc: T('Run a portfolio of buildings: units, owners, tenants, leases, rent, receivables, service charges, expenses and reporting.', 'إدارة محفظة مبانٍ: الوحدات والمالكون والمستأجرون والعقود والإيجارات والذمم ورسوم الخدمات والمصاريف والتقارير.'),
    personaTitle: T('Rania Odeh · Arkan Property Management', 'رانيا عودة · أركان لإدارة العقارات'),
    home: 'home',
    workspaces: ws(),
    menu: [
      { group: T('Portfolio', 'المحفظة') },
      { id: 'home', label: T('Portfolio overview', 'نظرة عامة على المحفظة'), icon: 'grid' },
      { id: 'buildings', label: T('Buildings', 'المباني'), icon: 'building', match: ['workspace', 'building'] },
      { id: 'units', label: T('Units', 'الوحدات'), icon: 'layers', match: ['unit'] },
      { id: 'owners', label: T('Owners', 'المالكون'), icon: 'key' },
      { id: 'tenants', label: T('Tenants', 'المستأجرون'), icon: 'users' },
      { id: 'occupancy', label: T('Occupancy', 'الإشغال'), icon: 'pie' },
      { group: T('Leasing & finance', 'التأجير والمالية') },
      { id: 'leases', label: T('Lease management', 'إدارة العقود'), icon: 'contract', match: ['lease', 'calendar'] },
      { id: 'rent', label: T('Rent management', 'إدارة الإيجارات'), icon: 'wallet' },
      { id: 'receivables', label: T('Receivables', 'الذمم المدينة'), icon: 'alertCircle', match: ['payments'] },
      { id: 'charges', label: T('Service charges', 'رسوم الخدمات'), icon: 'receipt' },
      { id: 'expenses', label: T('Expenses', 'المصاريف'), icon: 'banknote' },
      { id: 'reports', label: T('Financial reports', 'التقارير المالية'), icon: 'chart' },
      { group: T('Operations', 'العمليات') },
      { id: 'maintenance', label: T('Maintenance requests', 'طلبات الصيانة'), icon: 'wrench' },
      { id: 'documents', label: T('Documents', 'المستندات'), icon: 'folder' },
      { id: 'team', label: T('Management team', 'فريق الإدارة'), icon: 'userCheck' },
      { id: 'services', label: T('Service providers', 'مزوّدو الخدمات'), icon: 'handshake' },
    ],
    pages: P,
    notifications: () => [
      { icon: 'wrench', tone: 'bad', title: L('Elevator B fault — Masyoun Tower', 'عطل المصعد ب — برج الماصيون'), sub: L('LiftLine visit today · MR-24477', 'زيارة لفت لاين اليوم · MR-24477'), when: L('Today', 'اليوم'), go: `${R}-maintenance` },
      { icon: 'alertCircle', tone: 'warn', title: L(`${pf().arrearsCount} tenants in arrears`, `${pf().arrearsCount} مستأجرين متأخرين`), sub: L(`${money(pf().out)} outstanding`, `${money(pf().out)} مستحقة`), when: L('Today', 'اليوم'), go: `${R}-receivables` },
      { icon: 'receipt', tone: 'info', title: L(`${MX.exp.filter((e) => e.status === 'pending').length} expenses awaiting your approval`, `${MX.exp.filter((e) => e.status === 'pending').length} مصاريف بانتظار موافقتك`), sub: L('Above the ₪1,800 threshold', 'فوق حد 1,800 ₪'), when: L('1 h', '1 س'), go: `${R}-expenses` },
      { icon: 'calendarCheck', tone: 'info', title: L('Lease L-2026-0803 enters notice window', 'العقد L-2026-0803 يدخل فترة الإشعار'), sub: L('Prepare a renewal offer for the owner', 'أعدّ عرض تجديد للمالك'), when: L('1 d', '1 ي'), go: `${R}-lease-L-2026-0803` },
      { icon: 'refresh', tone: 'warn', title: L('Mandate renewal — Masyoun Heights', 'تجديد التفويض — مرتفعات الماصيون'), sub: L('Agreement ends 31 Jan 2027', 'تنتهي الاتفاقية 31 كانون الثاني 2027'), when: L('2 d', '2 ي'), go: `${R}-workspace-BN-RAM-00266` },
    ],
  });
})();
