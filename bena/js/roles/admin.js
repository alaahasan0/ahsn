/*
 * BENA — Platform administration (persona: Dana Salem, BENA Platform Ops).
 * Tenants, users, permissions, data sources, categories, verification rules,
 * audit log and platform configuration. Everything is fictional demo data;
 * changes live in memory only.
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon } = B;
  const ui = B.ui;
  const D = B.data;
  const R = 'admin';
  const T = (en, ar) => ({ en, ar });
  const C = D.city;

  Object.assign(B.statuses, {
    live: { en: 'Live', ar: 'مُفعّلة', tone: 'ok', icon: 'checkCircle' },
    onboarding: { en: 'Onboarding', ar: 'قيد الإعداد', tone: 'info', icon: 'clock' },
    pilot: { en: 'Pilot', ar: 'تجريبية', tone: 'violet' },
    operational: { en: 'Operational', ar: 'يعمل', tone: 'ok' },
    degraded: { en: 'Degraded', ar: 'أداء منخفض', tone: 'warn', icon: 'alert' },
    synced: B.statuses.synced || { en: 'Synced', ar: 'متزامن', tone: 'ok', icon: 'check' },
    syncing: B.statuses.syncing || { en: 'Syncing', ar: 'قيد المزامنة', tone: 'info', icon: 'refresh' },
    delayed: B.statuses.delayed || { en: 'Delayed', ar: 'متأخر', tone: 'warn', icon: 'clock' },
    syncError: B.statuses.syncError || { en: 'Sync error', ar: 'خطأ في المزامنة', tone: 'bad', icon: 'alertCircle' },
  });
  const hash = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  const pct = (a, b) => (b ? (a / b) * 100 : 0);

  /* ---------------- demo data ---------------- */
  const MUNIS = [
    { id: 'ram', name: T('Ramallah Municipality', 'بلدية رام الله'), code: 'RAM', status: 'live', since: '2025-03-01', buildings: C.total, gis: C.gis, units: C.units, users: 46, feed: 'synced', districts: 8, step: 4 },
    { id: 'bireh', name: T('Al-Bireh Municipality', 'بلدية البيرة'), code: 'BIR', status: 'live', since: '2025-09-15', buildings: 11240, gis: 9012, units: 43980, users: 31, feed: 'synced', districts: 7, step: 4 },
    { id: 'beitunia', name: T('Beitunia Municipality', 'بلدية بيتونيا'), code: 'BTN', status: 'onboarding', since: '2026-08-01', buildings: 6120, gis: 3980, units: 19870, users: 12, feed: 'syncing', districts: 5, step: 2 },
    { id: 'birzeit', name: T('Birzeit Municipality', 'بلدية بيرزيت'), code: 'BRZ', status: 'pilot', since: '2026-10-10', buildings: 2890, gis: 1210, units: 7420, users: 6, feed: 'delayed', districts: 4, step: 1 },
  ];
  const OT = {
    municipality: { l: T('Municipality', 'بلدية'), icon: 'landmark', tone: 'navy' },
    manager: { l: T('Property manager', 'مدير عقارات'), icon: 'key', tone: 'info' },
    facility: { l: T('Facility management', 'إدارة مرافق'), icon: 'wrench', tone: 'warn' },
    provider: { l: T('Service provider', 'مزوّد خدمة'), icon: 'tool', tone: 'violet' },
    association: { l: T('Owners\' association', 'جمعية مالكين'), icon: 'users', tone: 'mint' },
    platform: { l: T('Platform', 'المنصة'), icon: 'shield', tone: '' },
  };
  const ORGS = [
    ...MUNIS.map((m) => ({ id: 'org_m_' + m.id, type: 'municipality', name: m.name, users: m.users, buildings: m.buildings, status: m.status === 'live' ? 'active' : 'invited', since: m.since, contact: m.id === 'ram' ? 'p_maha' : null, city: m.name })),
    { id: 'org_arkan', type: 'manager', name: D.orgs.org_arkan.name, users: 9, buildings: 7, status: 'active', since: '2025-04-11', contact: 'p_rania' },
    { id: 'org_bayt', type: 'manager', name: T('Bayt Property Partners', 'بيت شركاء العقار'), users: 4, buildings: 3, status: 'active', since: '2026-02-20', contact: 'p_suha' },
    { id: 'org_sanad', type: 'facility', name: D.orgs.org_sanad.name, users: 14, buildings: 4, status: 'active', since: '2025-05-02', contact: 'p_omar' },
    { id: 'org_jaber', type: 'provider', name: D.orgs.org_jaber.name, users: 6, buildings: 0, status: 'active', since: '2025-06-18', contact: 'p_yousef' },
    { id: 'org_sparkle', type: 'provider', name: T('Sparkle Building Care', 'سباركل للعناية بالمباني'), users: 5, buildings: 0, status: 'active', since: '2025-07-01', contact: 'p_karim' },
    { id: 'org_lift', type: 'provider', name: T('LiftLine Elevators', 'لفت لاين للمصاعد'), users: 3, buildings: 0, status: 'active', since: '2025-08-09', contact: 'p_basel' },
    { id: 'org_shield', type: 'provider', name: T('ShieldPest', 'شيلد لمكافحة الحشرات'), users: 2, buildings: 0, status: 'invited', since: '2026-11-19', contact: 'p_jamil' },
    { id: 'org_c_masyoun', type: 'association', name: D.committees.c_masyoun.name, users: 5, buildings: 1, status: 'active', since: '2025-03-20', contact: 'p_samer' },
    { id: 'org_c_irsal', type: 'association', name: D.committees.c_irsal.name, users: 2, buildings: 1, status: 'active', since: '2025-10-02', contact: 'p_walid' },
    { id: 'org_c_tireh', type: 'association', name: D.committees.c_tireh.name, users: 3, buildings: 1, status: 'active', since: '2026-01-14', contact: 'p_nadia' },
    { id: 'org_guard', type: 'provider', name: T('Guardian Security', 'الحارس للأمن'), users: 2, buildings: 0, status: 'suspended', since: '2025-11-30', contact: 'p_zaid' },
    { id: 'org_bena', type: 'platform', name: D.orgs.org_bena.name, users: 7, buildings: 0, status: 'active', since: '2025-01-01', contact: 'p_dana' },
  ];
  const ROLES = {
    municipality: { l: T('Municipality officer', 'موظف بلدية'), tone: 'navy', icon: 'landmark' },
    owner: { l: T('Owner', 'مالك'), tone: 'info', icon: 'key' },
    resident: { l: T('Resident', 'ساكن'), tone: 'neutral', icon: 'home' },
    committee: { l: T('Committee', 'لجنة'), tone: 'mint', icon: 'users' },
    manager: { l: T('Property manager', 'مدير عقارات'), tone: 'info', icon: 'briefcase' },
    facility: { l: T('Facility manager', 'مدير مرافق'), tone: 'warn', icon: 'wrench' },
    provider: { l: T('Service provider', 'مزوّد خدمة'), tone: 'violet', icon: 'tool' },
    admin: { l: T('Platform admin', 'مدير المنصة'), tone: 'bad', icon: 'shield' },
  };
  const roleBadge = (r) => ui.badge(ROLES[r].l, ROLES[r].tone, ROLES[r].icon);
  const U = (p, role, org, status, last, mfa = true) => ({ id: 'u_' + p.slice(2), p, role, org, status, last, mfa, email: D.person(p).email || `${p.slice(2)}@example.ps` });
  const USERS = [
    U('p_dana', 'admin', 'org_bena', 'active', '2026-11-25'),
    U('p_maha', 'municipality', 'org_m_ram', 'active', '2026-11-25'),
    U('p_firas', 'municipality', 'org_m_ram', 'active', '2026-11-24'),
    U('p_hala', 'municipality', 'org_m_bireh', 'active', '2026-11-23'),
    U('p_issa', 'municipality', 'org_m_beitunia', 'invited', '2026-11-20', false),
    U('p_rania', 'manager', 'org_arkan', 'active', '2026-11-25'),
    U('p_suha', 'manager', 'org_bayt', 'active', '2026-11-21'),
    U('p_omar', 'facility', 'org_sanad', 'active', '2026-11-25'),
    U('p_yousef', 'provider', 'org_jaber', 'active', '2026-11-24'),
    U('p_karim', 'provider', 'org_sparkle', 'active', '2026-11-18', false),
    U('p_jamil', 'provider', 'org_shield', 'invited', '2026-11-19', false),
    U('p_zaid', 'provider', 'org_guard', 'suspended', '2026-09-30'),
    U('p_samer', 'committee', 'org_c_masyoun', 'active', '2026-11-24'),
    U('p_hiba', 'committee', 'org_c_masyoun', 'active', '2026-11-22'),
    U('p_walid', 'committee', 'org_c_irsal', 'active', '2026-11-12', false),
    U('p_nadia', 'committee', 'org_c_tireh', 'active', '2026-11-16'),
    U('p_khaled', 'owner', null, 'active', '2026-11-25'),
    U('p_rana', 'owner', null, 'active', '2026-11-10', false),
    U('p_fadi', 'owner', null, 'active', '2026-11-19'),
    U('p_lina', 'resident', null, 'active', '2026-11-25'),
    U('p_tariq', 'resident', null, 'active', '2026-11-23', false),
    U('p_basel', 'resident', null, 'active', '2026-11-20', false),
    U('p_noor', 'resident', null, 'invited', '2026-11-24', false),
    U('p_ahmad', 'owner', null, 'active', '2026-11-24'),
  ];
  const orgName = (id) => { const o = ORGS.find((x) => x.id === id); return o ? tx(o.name) : L('Individual', 'فرد'); };
  const TOTAL_USERS = 18436;
  const TOTAL_ORGS = 214;
  const platformBuildings = () => B.sum(MUNIS, (m) => m.buildings);
  const platformUnits = () => B.sum(MUNIS, (m) => m.units);

  const PERM_GROUPS = [
    { g: T('Buildings', 'المباني'), items: [['bView', T('View building registry', 'عرض سجل المباني')], ['bEdit', T('Edit building data', 'تعديل بيانات المباني')], ['bVerify', T('Verify buildings', 'توثيق المباني')], ['bLink', T('Manage GIS links', 'إدارة الربط بنظم المعلومات')]] },
    { g: T('Units & tenancy', 'الوحدات والإيجار'), items: [['uView', T('View units', 'عرض الوحدات')], ['uOwn', T('Manage ownership', 'إدارة الملكية')], ['uLease', T('Manage leases', 'إدارة عقود الإيجار')]] },
    { g: T('Committee & finance', 'اللجنة والمالية'), items: [['cManage', T('Manage committee', 'إدارة اللجنة')], ['fView', T('View finances', 'عرض المالية')], ['fApprove', T('Approve payments', 'اعتماد الدفعات')]] },
    { g: T('Services', 'الخدمات'), items: [['sReq', T('Request services', 'طلب الخدمات')], ['sWork', T('Manage work orders', 'إدارة أوامر العمل')], ['sList', T('List on marketplace', 'العرض في السوق')]] },
    { g: T('Platform', 'المنصة'), items: [['pUsers', T('Manage users', 'إدارة المستخدمين')], ['pSettings', T('Platform settings', 'إعدادات المنصة')], ['pAudit', T('View audit log', 'عرض سجل التدقيق')]] },
  ];
  const DEF = {
    municipality: 'bView bEdit bVerify bLink uView pAudit',
    owner: 'bView uView uOwn uLease fView sReq sList',
    resident: 'bView uView sReq',
    committee: 'bView uView cManage fView fApprove sReq sWork',
    manager: 'bView bEdit uView uLease fView fApprove sReq sWork sList',
    facility: 'bView uView sReq sWork',
    provider: 'sWork sList',
    admin: 'bView bEdit bVerify bLink uView uOwn uLease cManage fView fApprove sReq sWork sList pUsers pSettings pAudit',
  };
  const permOn = (role, p) => B.get(`perm:${role}:${p}`, DEF[role].split(' ').includes(p));

  const SOURCES = [
    { id: 'src1', name: T('Ramallah municipal GIS feed', 'تغذية نظم المعلومات — رام الله'), kind: 'gis', muni: 'ram', proto: 'WFS', status: 'synced', last: '2026-11-25 06:00', records: C.gis, errors: 0 },
    { id: 'src2', name: T('Al-Bireh municipal GIS feed', 'تغذية نظم المعلومات — البيرة'), kind: 'gis', muni: 'bireh', proto: 'WFS', status: 'synced', last: '2026-11-25 05:30', records: 9012, errors: 3 },
    { id: 'src3', name: T('Beitunia GIS — initial load', 'نظم معلومات بيتونيا — التحميل الأولي'), kind: 'gis', muni: 'beitunia', proto: 'Shapefile', status: 'syncing', last: '2026-11-25 09:12', records: 3980, errors: 41 },
    { id: 'src4', name: T('Independent submissions (BENA app)', 'التسجيلات المستقلة (تطبيق بينا)'), kind: 'independent', muni: null, proto: 'API', status: 'synced', last: '2026-11-25 10:01', records: 2445 + 1680 + 820, errors: 0 },
    { id: 'src5', name: T('Committee portal submissions', 'تسجيلات بوابة اللجان'), kind: 'independent', muni: null, proto: 'API', status: 'synced', last: '2026-11-25 09:48', records: 312, errors: 0 },
    { id: 'src6', name: T('Bulk import — Birzeit survey 2026', 'استيراد جماعي — مسح بيرزيت 2026'), kind: 'bulk', muni: 'birzeit', proto: 'CSV', status: 'delayed', last: '2026-11-21 14:20', records: 1210, errors: 87 },
    { id: 'src7', name: T('Bulk import — Al-Bireh permits archive', 'استيراد جماعي — أرشيف رخص البيرة'), kind: 'bulk', muni: 'bireh', proto: 'XLSX', status: 'syncError', last: '2026-11-20 22:05', records: 0, errors: 1 },
  ];
  const SK = { gis: { l: T('Municipal GIS', 'نظم معلومات بلدية'), icon: 'landmark', tone: 'navy' }, independent: { l: T('Independent', 'مستقل'), icon: 'userCheck', tone: 'violet' }, bulk: { l: T('Bulk import', 'استيراد جماعي'), icon: 'upload', tone: 'info' } };

  const CATS = {
    bcats: Object.keys(D.types).map((k, i) => ({ id: k, name: { en: D.types[k].en, ar: D.types[k].ar }, icon: D.types[k].icon, code: k.slice(0, 3).toUpperCase(), uses: [9412, 2210, 1160, 3073, 724, 1251, 241][i] || 100, on: true })),
    ucats: [
      { id: 'apartment', name: T('Apartment', 'شقة'), icon: 'home', code: 'APT', uses: 48210, on: true },
      { id: 'office', name: T('Office', 'مكتب'), icon: 'briefcase', code: 'OFC', uses: 9120, on: true },
      { id: 'shop', name: T('Shop', 'محل تجاري'), icon: 'store', code: 'SHP', uses: 7340, on: true },
      { id: 'clinic', name: T('Clinic', 'عيادة'), icon: 'heart', code: 'CLN', uses: 640, on: true },
      { id: 'storage', name: T('Storage room', 'مخزن'), icon: 'package', code: 'STR', uses: 2210, on: true },
      { id: 'parking', name: T('Parking space', 'موقف سيارة'), icon: 'car', code: 'PRK', uses: 11800, on: true },
      { id: 'roof', name: T('Rooftop unit', 'وحدة على السطح'), icon: 'sun', code: 'ROF', uses: 380, on: false },
    ],
    scats: D.serviceCats.map((c, i) => ({ id: c.id, name: { en: c.name.en, ar: c.name.ar }, icon: c.icon, code: c.id.slice(0, 3).toUpperCase(), uses: [412, 380, 351, 96, 141, 77, 58, 172, 520][i] || 50, on: true })),
  };
  const CATMETA = {
    bcats: { t: T('Building categories', 'فئات المباني'), s: T('Types used to classify buildings in the registry and on the map.', 'الأنواع المستخدمة لتصنيف المباني في السجل وعلى الخريطة.'), unit: T('buildings', 'مبنى'), icon: 'building' },
    ucats: { t: T('Unit categories', 'فئات الوحدات'), s: T('Unit kinds available to owners, managers and committees.', 'أنواع الوحدات المتاحة للمالكين والمديرين واللجان.'), unit: T('units', 'وحدة'), icon: 'grid' },
    scats: { t: T('Service categories', 'فئات الخدمات'), s: T('Categories for the services marketplace and maintenance requests.', 'فئات سوق الخدمات وطلبات الصيانة.'), unit: T('requests (30 days)', 'طلب (30 يوماً)'), icon: 'wrench' },
  };

  const AR = B.rng(2468);
  const EVT = [
    ['auth', 'p_dana', T('Signed in with SSO', 'تسجيل دخول عبر SSO'), T('Admin console', 'لوحة الإدارة'), 'low'],
    ['permissions', 'p_dana', T('Changed role permissions', 'تعديل صلاحيات دور'), T('Property manager · Approve payments', 'مدير عقارات · اعتماد الدفعات'), 'high'],
    ['data', 'p_maha', T('Verified building', 'توثيق مبنى'), T('BN-RAM-00142', 'BN-RAM-00142'), 'medium'],
    ['sync', null, T('GIS sync completed', 'اكتملت مزامنة نظم المعلومات'), T('Ramallah · 214 features', 'رام الله · 214 معلماً'), 'low'],
    ['data', 'p_maha', T('Approved registration request', 'الموافقة على طلب تسجيل'), T('RR-2026-0412', 'RR-2026-0412'), 'medium'],
    ['auth', 'p_zaid', T('Account suspended', 'إيقاف حساب'), T('Guardian Security', 'الحارس للأمن'), 'high'],
    ['config', 'p_dana', T('Updated verification rule', 'تحديث قاعدة تحقق'), T('Auto-verify overlap ≥ 90%', 'التوثيق التلقائي عند تطابق ≥ 90%'), 'medium'],
    ['sync', null, T('Bulk import failed', 'فشل الاستيراد الجماعي'), T('Al-Bireh permits archive', 'أرشيف رخص البيرة'), 'high'],
    ['users', 'p_dana', T('Invited user', 'دعوة مستخدم'), T('issa@example.ps · Municipality officer', 'issa@example.ps · موظف بلدية'), 'low'],
    ['data', 'p_rania', T('Updated unit ownership', 'تحديث ملكية وحدة'), T('BN-RAM-00266-604', 'BN-RAM-00266-604'), 'medium'],
    ['auth', 'p_karim', T('Failed sign-in (3 attempts)', 'محاولات دخول فاشلة (3)'), T('Web portal', 'بوابة الويب'), 'medium'],
    ['users', 'p_hala', T('Changed user role', 'تغيير دور مستخدم'), T('Al-Bireh · GIS viewer → officer', 'البيرة · مشاهد → موظف'), 'medium'],
    ['config', 'p_dana', T('Added service category', 'إضافة فئة خدمة'), T('Water tanks', 'خزانات المياه'), 'low'],
    ['data', 'p_samer', T('Published announcement', 'نشر إعلان'), T('Al-Masyoun Residence Tower', 'برج الماصيون السكني'), 'low'],
  ];
  const AUDIT = Array.from({ length: 30 }, (_, i) => {
    const e = EVT[i % EVT.length];
    const back = 6 + i * 212 + Math.floor(AR() * 90); // minutes before 25 Nov 10:00
    const dt = new Date(2026, 10, 25, 10, 0 - back);
    const hh = String(dt.getHours()).padStart(2, '0'), mm = String(dt.getMinutes()).padStart(2, '0');
    return { id: `EV-${90412 - i}`, cat: e[0], actor: e[1], action: e[2], target: e[3], sev: e[4], date: `2026-11-${String(dt.getDate()).padStart(2, '0')}`, time: `${hh}:${mm}`, ip: `10.20.${hash(e[0] + i) % 200}.${hash(String(i)) % 250}` };
  });
  const AC = { auth: T('Authentication', 'المصادقة'), users: T('Users', 'المستخدمون'), permissions: T('Permissions', 'الصلاحيات'), data: T('Building data', 'بيانات المباني'), sync: T('Sync & imports', 'المزامنة والاستيراد'), config: T('Configuration', 'الإعدادات') };

  const HEALTH = [
    { id: 'api', name: T('API gateway', 'بوابة الواجهات البرمجية'), icon: 'server', status: 'operational', up: '99.98%', p95: '182 ms', spark: [180, 175, 190, 182, 170, 188, 182] },
    { id: 'idp', name: T('Identity & SSO', 'الهوية وتسجيل الدخول الموحد'), icon: 'fingerprint', status: 'operational', up: '99.99%', p95: '96 ms', spark: [90, 98, 92, 94, 101, 96, 96] },
    { id: 'gis', name: T('GIS sync workers', 'عمّال مزامنة نظم المعلومات'), icon: 'layers', status: 'degraded', up: '99.20%', p95: '4.2 s', spark: [2.1, 2.4, 2.2, 3.1, 3.8, 4.4, 4.2] },
    { id: 'search', name: T('Search index', 'فهرس البحث'), icon: 'search', status: 'operational', up: '99.95%', p95: '64 ms', spark: [60, 66, 61, 70, 63, 62, 64] },
    { id: 'notif', name: T('Notifications (SMS / email)', 'الإشعارات (رسائل / بريد)'), icon: 'bell', status: 'operational', up: '99.90%', p95: '1.1 s', spark: [1.2, 1.0, 1.3, 1.1, 0.9, 1.2, 1.1] },
    { id: 'docs', name: T('Document storage', 'تخزين المستندات'), icon: 'folder', status: 'operational', up: '100%', p95: '120 ms', spark: [130, 118, 125, 122, 119, 124, 120] },
  ];

  /* ---------------- styles ---------------- */
  B.css(`
  .ad-m-only { display: none; }
  @media (max-width: 767px) { .ad-m-only { display: inline; } }
  .ad-tag { display: inline-flex; margin-inline-start: 8px; padding: 2px 8px; border-radius: 99px; background: var(--warn-bg); color: var(--warn); font-size: 10.5px; letter-spacing: .04em; vertical-align: 1px; }
  .ad-kpis { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .ad-kpis > div { padding: 20px 22px 14px; border-inline-start: 1px solid var(--line-2); min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .ad-kpis > div:first-child { border-inline-start: 0; }
  .ad-kpis .l { font-size: 12.5px; color: var(--text-2); display: flex; align-items: center; gap: 6px; }
  .ad-kpis .l svg { width: 15px; height: 15px; color: var(--mint-ink); }
  .ad-kpis b { font-family: var(--font-display); font-size: 28px; line-height: 1.1; font-variant-numeric: tabular-nums; }
  .ad-kpis .f { font-size: 11.5px; color: var(--text-3); }
  .ad-kpis .spark { height: 28px; margin-top: 2px; }
  @media (max-width: 1180px) { .ad-kpis { grid-template-columns: repeat(3, minmax(0, 1fr)); } .ad-kpis > div:nth-child(4) { border-inline-start: 0; } .ad-kpis > div:nth-child(n+4) { border-top: 1px solid var(--line-2); } }
  @media (max-width: 640px) { .ad-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); } .ad-kpis > div { padding: 14px 16px 10px; } .ad-kpis > div:nth-child(n) { border-inline-start: 1px solid var(--line-2); border-top: 1px solid var(--line-2); } .ad-kpis > div:nth-child(odd) { border-inline-start: 0; } .ad-kpis > div:nth-child(-n+2) { border-top: 0; } .ad-kpis > div:last-child { grid-column: 1 / -1; border-inline-start: 0; } .ad-kpis b { font-size: 22px; } }
  .ad-kpis.c4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .ad-kpis.c4 > div { padding-bottom: 18px; }
  @media (max-width: 1180px) { .ad-kpis.c4 { grid-template-columns: repeat(2, minmax(0, 1fr)); } .ad-kpis.c4 > div:nth-child(3) { border-inline-start: 0; } .ad-kpis.c4 > div:nth-child(4) { border-inline-start: 1px solid var(--line-2); } .ad-kpis.c4 > div:nth-child(n+3) { border-top: 1px solid var(--line-2); } }
  @media (max-width: 640px) { .ad-kpis.c4 > div:last-child { grid-column: auto; border-inline-start: 1px solid var(--line-2); } }
  .ad-health { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .ad-h { border: 1px solid var(--line); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 10px; background: #fff; min-width: 0; text-align: start; width: 100%; transition: border-color .2s; }
  .ad-h:hover { border-color: #CFDAD6; }
  .ad-h .t { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .ad-h .t b { font-size: 13.5px; font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
  .ad-h .ic { width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center; background: var(--line-2); color: var(--navy); flex: none; }
  .ad-h .ic svg { width: 16px; height: 16px; }
  .ad-h .m { display: grid; grid-template-columns: 1fr 1fr; font-size: 11.5px; color: var(--text-3); gap: 8px; }
  .ad-h .m b { display: block; color: var(--ink); font-size: 14px; font-variant-numeric: tabular-nums; white-space: nowrap; margin-top: 1px; }
  .ad-h .spark { height: 26px; }
  @media (max-width: 1180px) { .ad-health { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 420px) { .ad-health { gap: 8px; } .ad-h { padding: 12px; } .ad-h .spark { display: none; } .ad-h .t b { font-size: 12.5px; white-space: normal; line-height: 1.25; } .ad-h .pulse { align-self: flex-start; margin-top: 4px; } }
  .ad-muni { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1.6fr) 90px 110px; gap: 18px; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--line-2); text-align: start; width: 100%; }
  .ad-muni:last-child { border-bottom: 0; }
  .ad-muni:hover .n { color: var(--mint-ink); }
  .ad-muni .n { font-weight: 600; font-size: 14.5px; transition: color .15s; }
  .ad-muni small { display: block; font-size: 12px; color: var(--text-3); }
  .ad-muni .cv { display: flex; flex-direction: column; gap: 6px; }
  .ad-muni .cv .top { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-2); }
  .ad-muni .cv .top b { color: var(--ink); font-variant-numeric: tabular-nums; }
  .ad-muni .num { text-align: end; font-weight: 600; font-variant-numeric: tabular-nums; }
  @media (max-width: 900px) { .ad-muni { grid-template-columns: minmax(0, 1fr) auto; gap: 10px 14px; } .ad-muni .cv { grid-column: 1 / -1; order: 3; } .ad-muni .num { display: none; } }
  .ad-mx { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13.5px; }
  .ad-mx th { font-size: 11.5px; font-weight: 600; color: var(--text-3); padding: 10px 6px; text-align: center; border-bottom: 1px solid var(--line); background: var(--surface-2); position: sticky; top: 0; }
  .ad-mx th:first-child { text-align: start; padding-inline-start: 20px; }
  .ad-mx th span { display: flex; flex-direction: column; align-items: center; gap: 4px; white-space: normal; line-height: 1.2; }
  .ad-mx th svg { width: 16px; height: 16px; color: var(--navy); }
  .ad-mx td { padding: 9px 6px; border-bottom: 1px solid var(--line-2); text-align: center; }
  .ad-mx td:first-child { text-align: start; padding-inline-start: 20px; color: var(--ink); white-space: nowrap; }
  .ad-mx tr.g td { background: var(--surface-2); font-size: 11.5px; font-weight: 600; color: var(--text-3); letter-spacing: .06em; text-transform: uppercase; padding-top: 12px; }
  html[dir="rtl"] .ad-mx tr.g td { letter-spacing: 0; }
  .ad-mx .switch { display: inline-block; vertical-align: middle; transform: scale(.82); }
  .ad .switch input:disabled + i { opacity: .55; cursor: not-allowed; }
  .ad-mx { table-layout: fixed; }
  .ad-mx th:first-child { width: 210px; }
  .ad-mx-m { display: none; }
  @media (max-width: 900px) { .ad-mx-wrap { display: none; } .ad-mx-m { display: flex; } }
  .ad-prow { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--line-2); font-size: 14px; }
  .ad-prow:last-child { border-bottom: 0; }
  .ad-cat { display: grid; grid-template-columns: 40px minmax(0, 1fr) auto auto; gap: 14px; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--line-2); }
  .ad-cat:last-child { border-bottom: 0; }
  .ad-cat b { font-size: 14px; display: block; }
  .ad-cat small { font-size: 12.5px; color: var(--text-2); display: block; }
  .ad-cat.off b, .ad-cat.off .li-icon { opacity: .5; }
  @media (max-width: 640px) { .ad-cat { grid-template-columns: 40px minmax(0, 1fr) auto; } .ad-cat .ad-uses { display: none; } }
  .ad-uses { font-size: 13px; color: var(--text-2); text-align: end; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .ad-uses b { color: var(--ink); display: inline; }
  .ad-sec { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 28px; padding: 24px 0; border-top: 1px solid var(--line-2); }
  .ad-sec:first-child { border-top: 0; padding-top: 4px; }
  .ad-sec h3 { font-size: 15px; }
  .ad-sec p { font-size: 13px; color: var(--text-2); margin-top: 4px; }
  @media (max-width: 900px) { .ad-sec { grid-template-columns: 1fr; gap: 14px; padding: 20px 0; } }
  .ad-switchrow { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 4px 0; }
  .ad-switchrow b { display: block; font-size: 14px; font-weight: 600; }
  .ad-switchrow small { display: block; font-size: 12.5px; color: var(--text-2); }
  .ad-pre { background: var(--navy); color: #D5E2EA; border-radius: 12px; padding: 14px 16px; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 12px; line-height: 1.6; overflow-x: auto; direction: ltr; text-align: left; white-space: pre; margin: 0; }
  .ad-sticky { position: sticky; bottom: 0; z-index: 5; display: flex; justify-content: flex-end; gap: 8px; padding: 12px 0; background: linear-gradient(to top, var(--bg) 70%, rgba(244,247,246,0)); margin-top: 8px; }
  @media (max-width: 767px) { .ad-sticky .btn { flex: 1; } }
  .ad-docrow { display: grid; grid-template-columns: minmax(0, 1fr) 190px 44px; gap: 14px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line-2); }
  .ad-docrow:last-child { border-bottom: 0; }
  .ad-docrow b { font-size: 14px; font-weight: 600; display: block; }
  .ad-docrow .select { height: 38px; font-size: 13.5px; }
  @media (max-width: 640px) { .ad-docrow { grid-template-columns: minmax(0, 1fr) 44px; } .ad-docrow .select { grid-column: 1 / -1; order: 3; } }
  @media (max-width: 767px) { .ad .bars .col .tip, .ad .line-chart .hz .tip { display: none; } }
  `);

  const head = (o) => ui.pageHead({ ...o, eyebrow: `${L('BENA Platform Ops', 'عمليات منصة بينا')}<span class="ad-tag">${L('Demo environment', 'بيئة تجريبية')}</span>` });
  const sw = (key, on, attrs = '') => `<label class="switch"><input type="checkbox" data-model="${key}" data-norender ${on ? 'checked' : ''} ${attrs}><i></i></label>`;
  const months = (n) => Array.from({ length: n }, (_, i) => B.mon((10 - (n - 1) + i + 24) % 12));

  /* =================================================================
     Overview
     ================================================================= */
  function home() {
    const pb = platformBuildings();
    const cov = pct(B.sum(MUNIS, (m) => m.gis), pb);
    const kp = (ic, l, v, f, sp, c) => `<div><span class="l">${icon(ic)}${l}</span><b>${v}</b><span class="f">${f}</span>${B.charts.spark(sp, c)}</div>`;
    const kpis = `<div class="card pad-0"><div class="ad-kpis">
      ${kp('briefcase', L('Organizations', 'المؤسسات'), B.num(TOTAL_ORGS), L('+9 this month', '+9 هذا الشهر'), [170, 176, 181, 188, 193, 199, 205, 214], '#36D6A0')}
      ${kp('users', L('Users', 'المستخدمون'), B.compact(TOTAL_USERS), L('+6.2% this month', '+6.2% هذا الشهر'), [12.1, 12.9, 13.6, 14.4, 15.3, 16.2, 17.4, 18.4], '#36D6A0')}
      ${kp('building', L('Buildings', 'المباني'), B.num(pb), L('4 municipalities', '4 بلديات'), [30.1, 30.9, 31.6, 32.2, 33.0, 33.9, 34.6, 35.1], '#7FA7C2')}
      ${kp('grid', L('Registered units', 'الوحدات المسجّلة'), B.compact(platformUnits()), L('+1.9% this month', '+1.9% هذا الشهر'), [118, 120, 123, 125, 127, 129, 131, 132.5], '#7FA7C2')}
      ${kp('landmark', L('Municipal GIS coverage', 'تغطية نظم المعلومات البلدية'), B.pct(cov, 1), L('Weighted across tenants', 'مرجّحة عبر الجهات'), [68, 69.5, 70.2, 71.8, 72.4, 73.9, 74.6, cov], '#142B3B')}
    </div></div>`;
    const activity = ui.card({ title: L('User activity', 'نشاط المستخدمين'), sub: L('Weekly active users, last 13 weeks', 'المستخدمون النشطون أسبوعياً خلال آخر 13 أسبوعاً'),
      headExtra: `<span class="delta up">${icon('arrowUp')}8.4%</span>`,
      body: B.charts.line({ labels: Array.from({ length: 13 }, (_, i) => L(`W${36 + i}`, `أ${36 + i}`)), height: 220, series: [{ name: L('Mobile app', 'تطبيق الجوال'), color: '#36D6A0', values: [4.9, 5.2, 5.6, 5.4, 6.1, 6.6, 6.4, 7.0, 7.5, 7.3, 7.9, 8.4, 8.9].map((v) => v * 1000), area: true }, { name: L('Web portals', 'بوابات الويب'), color: '#142B3B', values: [2.0, 2.1, 2.2, 2.3, 2.3, 2.5, 2.6, 2.6, 2.8, 2.9, 3.0, 3.1, 3.3].map((v) => v * 1000) }] }) });
    const reqs = ui.card({ title: L('Registration requests', 'طلبات التسجيل'), sub: L('Open across all municipalities', 'المفتوحة في جميع البلديات'),
      body: `${B.charts.donut({ size: 140, data: [{ label: L('New', 'جديد'), value: 42, color: '#36D6A0' }, { label: L('Under review', 'قيد المراجعة'), value: 67, color: '#7FA7C2' }, { label: L('Needs info', 'بحاجة لمعلومات'), value: 23, color: '#F2B35A' }], center: { value: '132', label: L('open', 'مفتوح') } })}
        <div style="margin-top:16px">${B.charts.hbars({ data: MUNIS.map((m, i) => ({ label: m.name, value: [8 + 46, 41, 26, 11][i], color: i === 0 ? '#142B3B' : '#C9D6DF' })) })}</div>` });
    const health = ui.card({ title: L('System overview', 'نظرة على النظام'), sub: L('Simulated service health — no live monitoring', 'صحة خدمات محاكاة — لا توجد مراقبة حية'),
      headExtra: ui.badge(L('1 degraded', '1 بأداء منخفض'), 'warn', 'alert'),
      body: `<div class="ad-health">${HEALTH.map((h) => `<button class="ad-h" data-act="adHealth" data-arg="${h.id}"><div class="t"><span class="ic">${icon(h.icon)}</span><b>${tx(h.name)}</b><span class="pulse ${h.status === 'degraded' ? 'warn' : ''}"></span></div>
        <div class="m"><span>${L('Uptime 30d', 'التوفر 30 يوماً')}<b>${h.up}</b></span><span>${L('p95 latency', 'زمن الاستجابة')}<b class="ltr">${h.p95}</b></span></div>${B.charts.spark(h.spark, h.status === 'degraded' ? '#E9A23B' : '#36D6A0')}</button>`).join('')}</div>` });
    const audit = ui.card({ title: L('Recent activity', 'النشاط الأخير'), link: { label: L('Audit log', 'سجل التدقيق'), go: `${R}-audit` },
      body: ui.list(AUDIT.slice(0, 5).map((e) => ui.li({ icon: { auth: 'lock', users: 'userPlus', permissions: 'key', data: 'building', sync: 'refresh', config: 'settings' }[e.cat], tone: e.sev === 'high' ? 'bad' : e.sev === 'medium' ? 'warn' : '', title: tx(e.action), sub: `${esc(tx(e.target))} · ${e.actor ? esc(D.pname(e.actor)) : L('System', 'النظام')}`, end: `<span class="xs faint nowrap">${B.dateShort(e.date)} <span class="ltr">${e.time}</span></span>`, act: 'adEvent', arg: e.id }))) });
    const munis = ui.card({ title: L('Municipality coverage', 'تغطية البلديات'), sub: L('Sample tenants — not affiliated with the named municipalities', 'جهات تجريبية — غير مرتبطة بالبلديات المذكورة'), link: { label: L('Municipalities', 'البلديات'), go: `${R}-munis` }, body: muniRows() });
    return `${head({ title: L('Platform overview', 'نظرة عامة على المنصة'), sub: L('Good morning, Dana. Here is how BENA is doing across tenants today.', 'صباح الخير يا دانا. هذا وضع بينا عبر الجهات اليوم.'),
      actions: ui.btn(L('Invite user', 'دعوة مستخدم'), { icon: 'userPlus', act: 'adInvite' }) + ui.btn(L('Onboard municipality', 'إضافة بلدية'), { kind: 'primary', icon: 'plus', act: 'adOnboard' }) })}
      <div class="stack-lg">${kpis}
        <div class="grid g-main">${activity}${reqs}</div>
        <div class="grid g-main">${health}${audit}</div>
        ${munis}
      </div>`;
  }
  B.act.adHealth = (id) => {
    const h = HEALTH.find((x) => x.id === id);
    B.modal({ title: tx(h.name), sub: L('Simulated service status', 'حالة خدمة محاكاة'), size: 'sm',
      body: `<div class="row between" style="margin-bottom:14px">${ui.status(h.status)}<span class="xs faint">${L('Checked 1 min ago', 'آخر فحص قبل دقيقة')}</span></div>${ui.kv([[L('Uptime (30 days)', 'التوفر (30 يوماً)'), h.up], [L('p95 latency', 'زمن الاستجابة p95'), h.p95], [L('Region', 'المنطقة'), L('Primary · Ramallah DC (demo)', 'الرئيسية · مركز بيانات رام الله (تجريبي)')], [L('On-call', 'المناوب'), esc(D.pname('p_dana'))]])}
        ${h.status === 'degraded' ? `<div style="margin-top:14px">${ui.callout(L('Sync queue backlog after the Beitunia initial load. Workers are scaling automatically.', 'تراكم في طابور المزامنة بعد التحميل الأولي لبيتونيا. يتم توسيع العمّال تلقائياً.'), 'warn', 'alert')}</div>` : ''}`,
      foot: `${ui.btn(L('Close', 'إغلاق'), { act: 'closeModal' })}${ui.btn(L('Open status page', 'فتح صفحة الحالة'), { kind: 'primary', icon: 'activity', act: 'soon', arg: L('Status page', 'صفحة الحالة') })}` });
  };

  /* =================================================================
     Organizations
     ================================================================= */
  function orgs() {
    const t = B.get('og:type', 'all'), q = B.get('og:q', '');
    const rows = ORGS.filter((o) => (t === 'all' || o.type === t) && B.match(q, o.name, o.id));
    const chips = [{ id: 'all', label: L('All', 'الكل'), count: ORGS.length }].concat(Object.keys(OT).map((k) => ({ id: k, label: OT[k].l, icon: OT[k].icon, count: ORGS.filter((o) => o.type === k).length })));
    const table = ui.table({
      id: 'ogt', rows, rowAct: (r) => ({ act: 'adOrg', arg: r.id }), defaultSort: 'name',
      mLead: (r) => `<span class="li-icon ${OT[r.type].tone}" style="width:38px;height:38px">${icon(OT[r.type].icon)}</span>`,
      cols: [
        { key: 'name', label: L('Organization', 'المؤسسة'), sort: (r) => tx(r.name), m: 'title', mRender: (r) => esc(tx(r.name)), render: (r) => `<div class="cell-main"><span class="li-icon ${OT[r.type].tone}" style="width:36px;height:36px;border-radius:10px">${icon(OT[r.type].icon)}</span><div style="min-width:0"><b>${esc(tx(r.name))}</b><small>${tx(OT[r.type].l)}</small></div></div>` },
        { key: 'type', label: L('Type', 'النوع'), sort: (r) => tx(OT[r.type].l), render: (r) => tx(OT[r.type].l), m: 'sub' },
        { key: 'users', label: L('Users', 'المستخدمون'), sort: true, align: 'end', render: (r) => `${B.num(r.users)}`, m: 'meta' },
        { key: 'buildings', label: L('Buildings', 'المباني'), sort: true, align: 'end', render: (r) => (r.buildings ? B.num(r.buildings) : '—') },
        { key: 'contact', label: L('Primary contact', 'جهة الاتصال'), render: (r) => (r.contact ? `<span class="nowrap">${esc(D.pname(r.contact))}</span>` : '<span class="faint">—</span>'), m: 'meta' },
        { key: 'since', label: L('Joined', 'تاريخ الانضمام'), sort: true, render: (r) => `<span class="nowrap">${B.date(r.since)}</span>` },
        { key: 'status', label: L('Status', 'الحالة'), sort: true, render: (r) => ui.status(r.status), m: 'end' },
      ],
    });
    return `${head({ title: L('Organizations', 'المؤسسات'), sub: L(`${TOTAL_ORGS} organizations on the platform · ${ORGS.length} shown in this demo`, `${TOTAL_ORGS} مؤسسة على المنصة · ${ORGS.length} معروضة في هذا العرض`),
      actions: ui.btn(L('Export', 'تصدير'), { icon: 'download', act: 'soon', arg: L('Export', 'التصدير') }) + ui.btn(L('Add organization', 'إضافة مؤسسة'), { kind: 'primary', icon: 'plus', act: 'adAddOrg' }) })}
      <div class="stack">${ui.chips('og:type', chips, t)}<div class="toolbar" style="margin-bottom:0">${ui.search('og:q', L('Search organizations', 'ابحث عن مؤسسة'))}</div>${table}</div>`;
  }
  B.act.adOrg = (id) => {
    const o = ORGS.find((x) => x.id === id);
    const members = USERS.filter((u) => u.org === id);
    B.modal({ title: esc(tx(o.name)), sub: `${tx(OT[o.type].l)} · ${ui.idMono(o.id)}`, size: 'md',
      body: `<div class="row-sm wrap" style="margin-bottom:16px">${ui.status(o.status)}${o.type === 'municipality' ? ui.badge(L('Sample tenant', 'جهة تجريبية'), 'outline') : ''}</div>
        ${ui.kvGrid([[L('Users', 'المستخدمون'), B.num(o.users)], [L('Buildings', 'المباني'), o.buildings ? B.num(o.buildings) : '—'], [L('Joined', 'تاريخ الانضمام'), B.date(o.since)], [L('Primary contact', 'جهة الاتصال'), o.contact ? esc(D.pname(o.contact)) : '—']])}
        <div class="eyebrow" style="margin:20px 0 6px">${L('Members in this demo', 'الأعضاء في هذا العرض')}</div>
        ${members.length ? ui.list(members.map((u) => ui.li({ avatar: D.person(u.p).name, title: esc(D.pname(u.p)), sub: esc(u.email), end: roleBadge(u.role) }))) : `<p class="small muted">${L('No members listed in the demo dataset.', 'لا يوجد أعضاء مدرجون في بيانات العرض.')}</p>`}`,
      foot: `${ui.btn(o.status === 'suspended' ? L('Reactivate', 'إعادة التفعيل') : L('Suspend', 'إيقاف'), { kind: o.status === 'suspended' ? 'soft' : 'danger', icon: o.status === 'suspended' ? 'check' : 'lock', act: 'adOrgToggle', arg: o.id })}${ui.btn(L('View users', 'عرض المستخدمين'), { kind: 'primary', icon: 'users', act: 'adOrgUsers', arg: o.id })}` });
  };
  B.act.adOrgToggle = (id) => { const o = ORGS.find((x) => x.id === id); o.status = o.status === 'suspended' ? 'active' : 'suspended'; B.closeModal(true); B.refresh(); B.toast(o.status === 'suspended' ? L('Organization suspended (demo)', 'تم إيقاف المؤسسة (تجريبي)') : L('Organization reactivated (demo)', 'تمت إعادة تفعيل المؤسسة (تجريبي)')); };
  B.act.adOrgUsers = (id) => { B.vs['us:org'] = id; B.vs['us:role'] = 'all'; B.vs['us:st'] = 'all'; B.go(`${R}-users`); };
  B.act.adAddOrg = () => B.modal({ title: L('Add organization', 'إضافة مؤسسة'), form: 'adOrgNew',
    body: `<div class="form-grid">${ui.field({ name: 'name', label: L('Organization name', 'اسم المؤسسة'), required: true, full: true })}
      ${ui.field({ name: 'type', label: L('Type', 'النوع'), type: 'select', options: Object.keys(OT).filter((k) => k !== 'platform').map((k) => ({ v: k, l: OT[k].l })) })}
      ${ui.field({ name: 'reg', label: L('Registration no.', 'رقم التسجيل'), placeholder: 'e.g. 562-118-904' })}
      ${ui.field({ name: 'email', label: L('Admin email', 'بريد المسؤول'), type: 'email', required: true, full: true })}</div>`,
    foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Create & invite', 'إنشاء ودعوة'), { kind: 'primary', type: 'submit', icon: 'send' })}` });
  B.submit.adOrgNew = (d) => {
    ORGS.push({ id: 'org_new_' + ORGS.length, type: d.type || 'provider', name: { en: d.name || 'New organization', ar: d.name || 'مؤسسة جديدة' }, users: 1, buildings: 0, status: 'invited', since: '2026-11-25', contact: null });
    B.refresh(); B.success({ title: L('Organization created', 'تم إنشاء المؤسسة'), text: L('An invitation was sent to the admin email.', 'تم إرسال دعوة إلى بريد المسؤول.'), ref: B.uid('ORG') });
  };

  /* =================================================================
     Users
     ================================================================= */
  function users() {
    const q = B.get('us:q', ''), role = B.get('us:role', 'all'), st = B.get('us:st', 'all'), org = B.get('us:org', '');
    const rows = USERS.filter((u) => (role === 'all' || u.role === role) && (st === 'all' || u.status === st) && (!org || u.org === org) && B.match(q, D.person(u.p).name, u.email, orgName(u.org)));
    const cnt = (s) => USERS.filter((u) => s === 'all' || u.status === s).length;
    const table = ui.table({
      id: 'ust', rows, rowAct: (r) => ({ act: 'adUser', arg: r.id }), pageSize: 12, defaultSort: '-last',
      mLead: (r) => ui.avatar(D.person(r.p).name),
      cols: [
        { key: 'name', label: L('User', 'المستخدم'), sort: (r) => D.pname(r.p), m: 'title', mRender: (r) => esc(D.pname(r.p)), render: (r) => `<div class="cell-main">${ui.avatar(D.person(r.p).name)}<div style="min-width:0"><b>${esc(D.pname(r.p))}</b><small>${esc(r.email)}</small></div></div>` },
        { key: 'role', label: L('Role', 'الدور'), sort: (r) => tx(ROLES[r.role].l), render: (r) => roleBadge(r.role), m: 'meta' },
        { key: 'org', label: L('Organization', 'المؤسسة'), sort: (r) => orgName(r.org), render: (r) => `<span class="${r.org ? '' : 'faint'}">${esc(orgName(r.org))}</span>`, m: 'sub' },
        { key: 'mfa', label: L('2FA', 'التحقق الثنائي'), render: (r) => (r.mfa ? `<span class="badge ok">${icon('lock')}${L('On', 'مفعّل')}</span>` : `<span class="badge">${L('Off', 'غير مفعّل')}</span>`) },
        { key: 'last', label: L('Last active', 'آخر نشاط'), sort: true, render: (r) => `<span class="nowrap">${B.ago(r.last)}</span>`, m: 'meta' },
        { key: 'status', label: L('Status', 'الحالة'), sort: true, render: (r) => ui.status(r.status), m: 'end' },
      ],
    });
    return `${head({ title: L('Users', 'المستخدمون'), sub: L(`${B.num(TOTAL_USERS)} users across all tenants · ${USERS.length} sample accounts below`, `${B.num(TOTAL_USERS)} مستخدماً عبر جميع الجهات · ${USERS.length} حساباً نموذجياً أدناه`),
      actions: ui.btn(L('Invite user', 'دعوة مستخدم'), { kind: 'primary', icon: 'userPlus', act: 'adInvite' }) })}
      <div class="stack">
        ${ui.chips('us:st', ['all', 'active', 'invited', 'suspended'].map((s) => ({ id: s, label: s === 'all' ? L('All', 'الكل') : B.statuses[s], count: cnt(s) })), st)}
        <div class="toolbar" style="margin-bottom:0">${ui.search('us:q', L('Search name, email or organization', 'ابحث بالاسم أو البريد أو المؤسسة'), { reset: 'ust:page' })}
          ${ui.select('us:role', [{ v: 'all', l: L('All roles', 'جميع الأدوار') }].concat(Object.keys(ROLES).map((k) => ({ v: k, l: ROLES[k].l }))), { def: 'all', reset: 'ust:page', label: L('Role', 'الدور') })}</div>
        ${org ? `<div><span class="badge navy lg">${icon('briefcase')}${esc(orgName(org))}<button data-act="set" data-arg="us:org=" style="color:#fff;margin-inline-start:4px" aria-label="${L('Remove filter', 'إزالة التصفية')}">${icon('x')}</button></span></div>` : ''}
        ${table}
      </div>`;
  }
  B.act.adInvite = () => B.modal({ title: L('Invite a user', 'دعوة مستخدم'), sub: L('They will receive an email to set up their BENA account.', 'سيصله بريد لإعداد حسابه في بينا.'), form: 'adInviteUser',
    body: `<div class="form-grid">${ui.field({ name: 'name', label: L('Full name', 'الاسم الكامل'), required: true })}${ui.field({ name: 'email', label: L('Email', 'البريد الإلكتروني'), type: 'email', required: true })}
      ${ui.field({ name: 'role', label: L('Role', 'الدور'), type: 'select', options: Object.keys(ROLES).map((k) => ({ v: k, l: ROLES[k].l })) })}
      ${ui.field({ name: 'org', label: L('Organization', 'المؤسسة'), type: 'select', options: [{ v: '', l: L('None (individual)', 'بدون (فرد)') }].concat(ORGS.map((o) => ({ v: o.id, l: o.name }))) })}
      <label class="check full" style="grid-column:1/-1"><input type="checkbox" name="mfa" checked><span>${L('Require two-factor authentication', 'اشتراط التحقق الثنائي')}</span></label></div>`,
    foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send invitation', 'إرسال الدعوة'), { kind: 'primary', type: 'submit', icon: 'send' })}` });
  B.submit.adInviteUser = (d) => {
    const pid = 'p_inv' + USERS.length;
    D.people[pid] = { id: pid, name: { en: d.name || 'Invited user', ar: d.name || 'مستخدم مدعو' }, email: d.email };
    USERS.unshift({ id: 'u_' + pid, p: pid, role: d.role || 'resident', org: d.org || null, status: 'invited', last: '2026-11-25', mfa: !!d.mfa, email: d.email || 'invited@example.ps' });
    B.refresh(); B.success({ title: L('Invitation sent', 'تم إرسال الدعوة'), text: L(`${esc(d.email || '')} can now join BENA.`, `يمكن لـ ${esc(d.email || '')} الانضمام إلى بينا الآن.`), ref: B.uid('INV') });
  };
  B.act.adUser = (id) => {
    const u = USERS.find((x) => x.id === id);
    const p = D.person(u.p);
    B.modal({ title: esc(tx(p.name)), sub: esc(u.email), size: 'sm', form: 'adUserSave',
      body: `<input type="hidden" name="id" value="${u.id}"><div class="row-sm wrap" style="margin-bottom:14px">${roleBadge(u.role)}${ui.status(u.status)}</div>
        ${ui.kv([[L('Organization', 'المؤسسة'), esc(orgName(u.org))], [L('Last active', 'آخر نشاط'), B.ago(u.last)], [L('Two-factor', 'التحقق الثنائي'), u.mfa ? L('Enabled', 'مفعّل') : L('Not enabled', 'غير مفعّل')]])}
        <div style="margin-top:14px">${ui.field({ name: 'role', label: L('Change role', 'تغيير الدور'), type: 'select', value: u.role, options: Object.keys(ROLES).map((k) => ({ v: k, l: ROLES[k].l })) })}</div>
        <div class="row wrap" style="margin-top:12px">${ui.btn(L('Reset 2FA', 'إعادة ضبط التحقق'), { size: 'sm', icon: 'refresh', act: 'soon', arg: L('2FA reset', 'إعادة ضبط التحقق الثنائي') })}${ui.btn(u.status === 'suspended' ? L('Reactivate', 'إعادة التفعيل') : L('Suspend', 'إيقاف'), { size: 'sm', kind: u.status === 'suspended' ? 'soft' : 'danger', icon: 'lock', act: 'adUserToggle', arg: u.id })}</div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Save changes', 'حفظ التغييرات'), { kind: 'primary', type: 'submit', icon: 'check' })}` });
  };
  B.act.adUserToggle = (id) => { const u = USERS.find((x) => x.id === id); u.status = u.status === 'suspended' ? 'active' : 'suspended'; B.closeModal(true); B.refresh(); B.toast(u.status === 'suspended' ? L('User suspended (demo)', 'تم إيقاف المستخدم (تجريبي)') : L('User reactivated (demo)', 'تمت إعادة تفعيل المستخدم (تجريبي)')); };
  B.submit.adUserSave = (d) => { const u = USERS.find((x) => x.id === d.id); if (u && d.role) u.role = d.role; B.refresh(); B.success({ title: L('User updated', 'تم تحديث المستخدم'), text: L('Role changes apply at the next sign-in.', 'تُطبّق تغييرات الدور عند تسجيل الدخول التالي.') }); };

  /* =================================================================
     Roles & permissions
     ================================================================= */
  function roles() {
    const rk = Object.keys(ROLES);
    const cur = B.get('pm:role', 'manager');
    const desk = `<div class="card pad-0 ad-mx-wrap"><div class="table-wrap"><table class="ad-mx"><thead><tr><th>${L('Permission', 'الصلاحية')}</th>${rk.map((r) => `<th><span>${icon(ROLES[r].icon)}${tx(ROLES[r].l)}</span></th>`).join('')}</tr></thead><tbody>
      ${PERM_GROUPS.map((g) => `<tr class="g"><td colspan="${rk.length + 1}">${tx(g.g)}</td></tr>${g.items.map(([pid, pl]) => `<tr><td>${tx(pl)}</td>${rk.map((r) => `<td>${sw(`perm:${r}:${pid}`, permOn(r, pid), r === 'admin' ? 'disabled' : '')}</td>`).join('')}</tr>`).join('')}`).join('')}
    </tbody></table></div></div>`;
    const mob = `<div class="ad-mx-m stack"><div class="field"><label for="f-pmrole">${L('Role', 'الدور')}</label>${ui.select('pm:role', rk.map((r) => ({ v: r, l: ROLES[r].l })), { def: 'manager' })}</div>
      ${PERM_GROUPS.map((g) => ui.card({ title: g.g, body: g.items.map(([pid, pl]) => `<div class="ad-prow"><span>${tx(pl)}</span>${sw(`perm:${cur}:${pid}`, permOn(cur, pid), cur === 'admin' ? 'disabled' : '')}</div>`).join('') })).join('')}</div>`;
    return `${head({ title: L('Roles & permissions', 'الأدوار والصلاحيات'), sub: L('What each role can see and do. Platform admin permissions are locked.', 'ما يمكن لكل دور رؤيته وفعله. صلاحيات مدير المنصة مقفلة.'),
      actions: ui.btn(L('Reset to defaults', 'استعادة الافتراضي'), { icon: 'refresh', act: 'adPermReset' }) + ui.btn(L('Save changes', 'حفظ التغييرات'), { kind: 'primary', icon: 'check', act: 'adPermSave' }) })}
      <div class="stack">${ui.callout(L('Changes apply to every organization using these roles. Organization admins can restrict — but not extend — these defaults.', 'تنطبق التغييرات على كل مؤسسة تستخدم هذه الأدوار. يمكن لمسؤولي المؤسسات تقييد هذه الإعدادات دون توسيعها.'), '', 'info')}${desk}${mob}</div>`;
  }
  B.act.adPermSave = () => B.success({ title: L('Permissions saved', 'تم حفظ الصلاحيات'), text: L('Updated permissions take effect within a few minutes.', 'تسري الصلاحيات المحدّثة خلال دقائق.'), ref: B.uid('PRM') });
  B.act.adPermReset = () => B.confirm({ title: L('Reset all permissions?', 'استعادة جميع الصلاحيات؟'), text: L('Every role returns to the BENA default permission set.', 'يعود كل دور إلى مجموعة الصلاحيات الافتراضية في بينا.'), ok: L('Reset', 'استعادة'), danger: true,
    onOk: () => { Object.keys(B.vs).filter((k) => k.startsWith('perm:')).forEach((k) => delete B.vs[k]); B.closeModal(true); B.refresh(); B.toast(L('Permissions reset to defaults', 'تمت استعادة الصلاحيات الافتراضية')); } });

  /* =================================================================
     Municipalities
     ================================================================= */
  function muniRows() {
    return MUNIS.map((m) => {
      const c = pct(m.gis, m.buildings);
      return `<button class="ad-muni" data-act="adMuni" data-arg="${m.id}">
        <div style="min-width:0"><div class="n">${tx(m.name)}</div><small>${ui.idMono(m.code)} · ${L(`${m.districts} districts · since ${B.mon(+m.since.slice(5, 7) - 1)} ${m.since.slice(0, 4)}`, `${m.districts} أحياء · منذ ${B.mon(+m.since.slice(5, 7) - 1)} ${m.since.slice(0, 4)}`)}</small></div>
        <div class="cv"><div class="top"><span>${L('GIS coverage', 'تغطية نظم المعلومات')}</span><b>${B.pct(c, 1)}</b></div>${ui.progress(c, c > 75 ? '' : c > 50 ? 'navy' : 'warn')}</div>
        <span class="num">${B.num(m.buildings)}<small>${L('buildings', 'مبنى')}</small></span>
        <span style="text-align:end">${ui.status(m.status)}</span></button>`;
    }).join('');
  }
  function munis() {
    const steps = [L('Agreement', 'الاتفاقية'), L('GIS connection', 'ربط نظم المعلومات'), L('Data load & QA', 'تحميل البيانات والجودة'), L('Staff training', 'تدريب الموظفين'), L('Go live', 'الإطلاق')];
    const onb = MUNIS.filter((m) => m.status !== 'live');
    return `${head({ title: L('Municipalities', 'البلديات'), sub: L('Onboarded municipal tenants and their registry coverage.', 'الجهات البلدية المُضافة وتغطية سجلاتها.'), actions: ui.btn(L('Onboard municipality', 'إضافة بلدية'), { kind: 'primary', icon: 'plus', act: 'adOnboard' }) })}
      <div class="stack-lg">
        ${ui.demoNote(L('Al-Bireh, Beitunia, Birzeit and Ramallah appear as sample tenants only. They are not affiliated with or endorsed by these municipalities, and all figures are fictional.', 'تظهر البيرة وبيتونيا وبيرزيت ورام الله كجهات تجريبية فقط، وهي غير مرتبطة بهذه البلديات أو معتمدة منها، وجميع الأرقام وهمية.'))}
        <div class="card pad-0"><div class="ad-kpis c4">
          <div><span class="l">${icon('landmark')}${L('Tenants', 'الجهات')}</span><b>${MUNIS.length}</b><span class="f">${L('2 live · 2 onboarding', '2 مُفعّلة · 2 قيد الإعداد')}</span></div>
          <div><span class="l">${icon('building')}${L('Buildings', 'المباني')}</span><b>${B.num(platformBuildings())}</b><span class="f">${L('Registered across tenants', 'مسجّلة عبر الجهات')}</span></div>
          <div><span class="l">${icon('layers')}${L('GIS-linked', 'مرتبطة بنظم المعلومات')}</span><b>${B.pct(pct(B.sum(MUNIS, (m) => m.gis), platformBuildings()), 1)}</b><span class="f">${L('Weighted coverage', 'تغطية مرجّحة')}</span></div>
          <div><span class="l">${icon('users')}${L('Municipal staff', 'موظفو البلديات')}</span><b>${B.sum(MUNIS, (m) => m.users)}</b><span class="f">${L('Active accounts', 'حسابات نشطة')}</span></div>
        </div></div>
        <div class="grid g-main">
          ${ui.card({ title: L('Onboarded municipalities', 'البلديات المُضافة'), body: muniRows() })}
          <div class="stack">${onb.map((m) => ui.card({ title: tx(m.name), sub: L('Onboarding progress', 'تقدّم الإعداد'), headExtra: ui.status(m.status), body: `${ui.stepper(steps, m.step)}<div class="small muted">${L('Next', 'التالي')}: <b style="color:var(--ink)">${steps[m.step]}</b></div><div class="row wrap" style="margin-top:14px">${ui.btn(L('Open checklist', 'فتح قائمة المهام'), { size: 'sm', icon: 'clipboard', act: 'adMuni', arg: m.id })}${ui.btn(L('Message contact', 'مراسلة جهة الاتصال'), { size: 'sm', kind: 'text', icon: 'chat', act: 'soon', arg: L('Messaging', 'المراسلة') })}</div>` })).join('')}</div>
        </div>
        ${ui.card({ title: L('Buildings by tenant', 'المباني حسب الجهة'), sub: L('GIS-linked vs independent records', 'السجلات المرتبطة بنظم المعلومات مقابل المستقلة'), body: B.charts.shares({ rows: MUNIS.map((m) => ({ label: m.name, parts: [{ value: m.gis, color: '#142B3B', name: L('GIS-linked', 'مرتبطة') }, { value: m.buildings - m.gis, color: '#B9AAF0', name: L('Independent', 'مستقلة') }] })), legend: [{ name: L('GIS-linked', 'مرتبطة بنظم المعلومات'), color: '#142B3B' }, { name: L('Independent', 'مستقلة'), color: '#B9AAF0' }] }) })}
      </div>`;
  }
  B.act.adMuni = (id) => {
    const m = MUNIS.find((x) => x.id === id);
    const tasks = [[L('Data-sharing agreement signed', 'توقيع اتفاقية مشاركة البيانات'), 0], [L('GIS endpoint connected', 'ربط نقطة نظم المعلومات'), 1], [L('Initial load passed QA (≥ 95%)', 'اجتياز التحميل الأولي لفحص الجودة (≥ 95%)'), 2], [L('Registry staff trained', 'تدريب موظفي السجل'), 3], [L('Public launch', 'الإطلاق العام'), 4]];
    B.modal({ title: tx(m.name), sub: `${ui.idMono(m.code)} · ${ui.statusLabel(m.status)} · ${L('sample tenant', 'جهة تجريبية')}`, size: 'md',
      body: `${ui.kvGrid([[L('Buildings', 'المباني'), B.num(m.buildings)], [L('GIS-linked', 'مرتبطة بنظم المعلومات'), B.num(m.gis)], [L('Units', 'الوحدات'), B.num(m.units)], [L('Staff accounts', 'حسابات الموظفين'), m.users], [L('GIS feed', 'تغذية نظم المعلومات'), ui.status(m.feed)], [L('Tenant since', 'جهة منذ'), B.date(m.since)]])}
        <div class="eyebrow" style="margin:20px 0 6px">${L('Onboarding checklist', 'قائمة مهام الإعداد')}</div>
        ${ui.list(tasks.map(([t, i]) => ui.li({ icon: i < m.step ? 'checkCircle' : i === m.step ? 'clock' : 'minus', tone: i < m.step ? 'mint' : i === m.step ? 'warn' : '', title: t, end: i < m.step ? ui.status('completed') : i === m.step ? ui.status('inProgress') : '' })))}`,
      foot: `${ui.btn(L('Tenant settings', 'إعدادات الجهة'), { icon: 'settings', act: 'soon', arg: L('Tenant settings', 'إعدادات الجهة') })}${ui.btn(L('View data sources', 'عرض مصادر البيانات'), { kind: 'primary', icon: 'database', go: `${R}-sources` })}` });
  };
  B.act.adOnboard = () => B.modal({ title: L('Onboard a municipality', 'إضافة بلدية'), sub: L('Creates a sample tenant workspace (demo).', 'ينشئ مساحة عمل تجريبية لجهة (تجريبي).'), form: 'adOnboardNew',
    body: `<div class="form-grid">${ui.field({ name: 'name', label: L('Municipality name', 'اسم البلدية'), required: true, full: true })}
      ${ui.field({ name: 'code', label: L('Tenant code', 'رمز الجهة'), placeholder: 'e.g. JNN', required: true })}
      ${ui.field({ name: 'gis', label: L('GIS platform', 'منصة نظم المعلومات'), type: 'select', options: [{ v: 'wfs', l: 'OGC WFS' }, { v: 'arcgis', l: 'ArcGIS REST' }, { v: 'shp', l: L('Shapefile upload', 'رفع Shapefile') }, { v: 'none', l: L('No GIS yet', 'لا يوجد نظام بعد') }] })}
      ${ui.field({ name: 'contact', label: L('GIS unit contact email', 'بريد وحدة نظم المعلومات'), type: 'email', required: true, full: true })}
      ${ui.field({ name: 'indep', label: L('Independent registration', 'التسجيل المستقل'), type: 'radio', full: true, options: [{ v: 'yes', l: L('Allowed', 'مسموح'), d: L('Owners can register without a GIS record', 'يمكن للمالكين التسجيل دون سجل GIS'), icon: 'userCheck' }, { v: 'no', l: L('GIS only', 'عبر GIS فقط'), d: L('Only municipal records', 'السجلات البلدية فقط'), icon: 'landmark' }] })}</div>`,
    foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Create tenant', 'إنشاء الجهة'), { kind: 'primary', type: 'submit', icon: 'check' })}` });
  B.submit.adOnboardNew = (d) => B.success({ title: L('Tenant created', 'تم إنشاء الجهة'), text: L('An onboarding checklist was created and the GIS contact invited.', 'تم إنشاء قائمة مهام الإعداد ودعوة جهة اتصال نظم المعلومات.'), ref: `TEN-${String(d.code || 'NEW').toUpperCase().slice(0, 4)}` });

  /* =================================================================
     Building data sources
     ================================================================= */
  function sources() {
    const k = B.get('src:kind', 'all');
    const rows = SOURCES.filter((s) => k === 'all' || s.kind === k);
    const muniN = (id) => (id ? tx(MUNIS.find((m) => m.id === id).name) : L('All tenants', 'جميع الجهات'));
    const table = ui.table({
      id: 'srct', rows, rowAct: (r) => ({ act: 'adSrcLog', arg: r.id }),
      mLead: (r) => `<span class="li-icon ${SK[r.kind].tone}" style="width:38px;height:38px">${icon(SK[r.kind].icon)}</span>`,
      cols: [
        { key: 'name', label: L('Source', 'المصدر'), sort: (r) => tx(r.name), m: 'title', mRender: (r) => esc(tx(r.name)), render: (r) => `<div class="cell-main"><span class="li-icon ${SK[r.kind].tone}" style="width:36px;height:36px;border-radius:10px">${icon(SK[r.kind].icon)}</span><div style="min-width:0"><b>${esc(tx(r.name))}</b><small>${tx(SK[r.kind].l)} · ${esc(r.proto)}</small></div></div>` },
        { key: 'muni', label: L('Tenant', 'الجهة'), render: (r) => `<span class="nowrap">${muniN(r.muni)}</span>`, m: 'sub' },
        { key: 'records', label: L('Records', 'السجلات'), sort: true, align: 'end', render: (r) => `${B.num(r.records)}<span class="ad-m-only"> ${L('records', 'سجل')}</span>`, m: 'meta' },
        { key: 'errors', label: L('Errors', 'الأخطاء'), sort: true, align: 'end', render: (r) => (r.errors ? `<span style="color:var(--bad);font-weight:600">${B.num(r.errors)}<span class="ad-m-only"> ${L('errors', 'أخطاء')}</span></span>` : `<span class="faint">0<span class="ad-m-only"> ${L('errors', 'أخطاء')}</span></span>`), m: 'meta' },
        { key: 'last', label: L('Last sync', 'آخر مزامنة'), sort: true, render: (r) => `<span class="nowrap">${B.dateShort(r.last.slice(0, 10))} <span class="ltr">${r.last.slice(11)}</span></span>`, m: 'meta' },
        { key: 'status', label: L('Status', 'الحالة'), sort: true, render: (r) => ui.status(r.status), m: 'end' },
        { key: 'act', label: '', render: (r) => `<span data-stop>${ui.btn('', { size: 'sm', icon: 'refresh', act: 'adSrcSync', arg: r.id, title: L('Sync now', 'مزامنة الآن') })}</span>` },
      ],
    });
    const days = Array.from({ length: 14 }, (_, i) => B.dateShort(new Date(2026, 10, 12 + i)).split(' ')[0]);
    const r2 = B.rng(55);
    return `${head({ title: L('Building data sources', 'مصادر بيانات المباني'), sub: L('Municipal GIS feeds, independent submissions and bulk imports feeding the national registry.', 'تغذيات نظم المعلومات البلدية والتسجيلات المستقلة والاستيرادات الجماعية التي تغذي السجل الوطني.'),
      actions: ui.btn(L('Add data source', 'إضافة مصدر بيانات'), { kind: 'primary', icon: 'plus', act: 'adSrcAdd' }) })}
      <div class="stack-lg">
        ${ui.simRibbon(L('Simulated connectors — no real municipal systems are connected.', 'موصلات محاكاة — لا توجد أنظمة بلدية حقيقية متصلة.'))}
        ${ui.card({ title: L('Records ingested', 'السجلات المستلمة'), sub: L('Per day, last 14 days', 'يومياً خلال آخر 14 يوماً'), body: B.charts.bars({ labels: days, height: 180, series: [{ name: tx(SK.gis.l), color: '#142B3B', values: days.map(() => Math.round(200 + r2() * 260)) }, { name: tx(SK.independent.l), color: '#9B8AE0', values: days.map(() => Math.round(40 + r2() * 70)) }, { name: tx(SK.bulk.l), color: '#7FA7C2', values: days.map((_, i) => (i === 9 ? 520 : i % 4 === 0 ? Math.round(80 + r2() * 120) : 0)) }] }) })}
        <div class="stack">${ui.chips('src:kind', [{ id: 'all', label: L('All sources', 'جميع المصادر'), count: SOURCES.length }].concat(Object.keys(SK).map((x) => ({ id: x, label: SK[x].l, icon: SK[x].icon, count: SOURCES.filter((s) => s.kind === x).length }))), k)}${table}</div>
      </div>`;
  }
  B.act.adSrcSync = (id) => { const s = SOURCES.find((x) => x.id === id); s.status = 'synced'; s.last = '2026-11-25 10:04'; if (s.kind !== 'bulk') s.errors = 0; B.refresh(); B.toast(L('Sync completed (simulated)', 'اكتملت المزامنة (محاكاة)')); };
  B.act.adSrcLog = (id) => {
    const s = SOURCES.find((x) => x.id === id);
    const lines = [`[${s.last}] start  source=${s.id} proto=${s.proto}`, `[${s.last}] fetch  ${B.num(s.records)} records`, s.errors ? `[${s.last}] warn   ${s.errors} record(s) rejected: missing parcel / invalid geometry` : `[${s.last}] check  geometry + parcel validation passed`, `[${s.last}] ${s.status === 'syncError' ? 'error  could not parse file header (row 1)' : 'done   status=' + s.status}`];
    B.modal({ title: tx(s.name), sub: `${tx(SK[s.kind].l)} · ${esc(s.proto)}`, size: 'md',
      body: `<div class="row-sm wrap" style="margin-bottom:14px">${ui.status(s.status)}<span class="xs faint">${L('Last run', 'آخر تشغيل')} ${B.dateShort(s.last.slice(0, 10))} <span class="ltr">${s.last.slice(11)}</span></span></div><pre class="ad-pre">${esc(lines.join('\n'))}</pre>
        <div style="margin-top:14px">${ui.kv([[L('Schedule', 'الجدولة'), s.kind === 'gis' ? L('Daily at 06:00', 'يومياً 06:00') : s.kind === 'bulk' ? L('Manual', 'يدوي') : L('Real-time', 'فوري')], [L('Records', 'السجلات'), B.num(s.records)], [L('Rejected', 'المرفوضة'), B.num(s.errors)]])}</div>`,
      foot: `${ui.btn(L('Download log', 'تنزيل السجل'), { icon: 'download', act: 'soon', arg: L('Log download', 'تنزيل السجل') })}${ui.btn(L('Sync now', 'مزامنة الآن'), { kind: 'primary', icon: 'refresh', act: 'adSrcSyncClose', arg: s.id })}` });
  };
  B.act.adSrcSyncClose = (id) => { B.closeModal(true); B.act.adSrcSync(id); };
  B.act.adSrcAdd = () => B.modal({ title: L('Add data source', 'إضافة مصدر بيانات'), form: 'adSrcNew',
    body: `<div class="form-grid">${ui.field({ name: 'name', label: L('Name', 'الاسم'), required: true, full: true })}
      ${ui.field({ name: 'kind', label: L('Source type', 'نوع المصدر'), type: 'select', options: Object.keys(SK).map((x) => ({ v: x, l: SK[x].l })) })}
      ${ui.field({ name: 'muni', label: L('Tenant', 'الجهة'), type: 'select', options: MUNIS.map((m) => ({ v: m.id, l: m.name })) })}
      ${ui.field({ name: 'url', label: L('Endpoint URL or file', 'رابط النقطة أو الملف'), full: true, placeholder: 'https://gis.example/wfs' })}
      ${ui.field({ name: 'file', label: L('Or upload a file', 'أو ارفع ملفاً'), type: 'file', full: true, placeholder: L('CSV, XLSX, GeoJSON or zipped Shapefile (demo)', 'CSV أو XLSX أو GeoJSON أو Shapefile مضغوط (تجريبي)') })}</div>`,
    foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Test & add', 'اختبار وإضافة'), { kind: 'primary', type: 'submit', icon: 'check' })}` });
  B.submit.adSrcNew = (d) => {
    SOURCES.push({ id: 'src' + (SOURCES.length + 1), name: { en: d.name || 'New source', ar: d.name || 'مصدر جديد' }, kind: d.kind || 'bulk', muni: d.muni || null, proto: d.kind === 'gis' ? 'WFS' : d.kind === 'independent' ? 'API' : 'CSV', status: 'syncing', last: '2026-11-25 10:05', records: 0, errors: 0 });
    B.refresh(); B.success({ title: L('Data source added', 'تمت إضافة مصدر البيانات'), text: L('Connection test passed. The first sync has started.', 'نجح اختبار الاتصال. بدأت المزامنة الأولى.'), ref: B.uid('SRC') });
  };

  /* =================================================================
     Categories (building / unit / service)
     ================================================================= */
  const ICONS = ['building', 'home', 'store', 'briefcase', 'layers', 'landmark', 'award', 'package', 'car', 'sun', 'heart', 'wrench', 'zap', 'droplet', 'wind', 'shield', 'sparkles', 'bug', 'tank', 'elevator', 'tree', 'grid'];
  const catPage = (kind) => () => {
    const meta = CATMETA[kind];
    const list = CATS[kind];
    const total = B.sum(list, (c) => c.uses);
    const rows = list.map((c) => {
      const on = B.get(`cat:${kind}:${c.id}`, c.on);
      return `<div class="ad-cat ${on ? '' : 'off'}"><span class="li-icon ${on ? 'mint' : ''}">${icon(c.icon)}</span>
        <div style="min-width:0"><b>${esc(tx(c.name))}</b><small>${esc(B.isAr() ? c.name.en : c.name.ar)} · <span class="id-mono" style="font-size:11.5px;color:var(--text-2)">${esc(c.code)}</span></small></div>
        <span class="ad-uses"><b>${B.num(c.uses)}</b> ${tx(meta.unit)}</span>
        <div class="row-sm">${ui.btn('', { size: 'sm', kind: 'ghost', icon: 'edit', act: 'adCatEdit', arg: `${kind}:${c.id}`, title: L('Edit', 'تعديل') })}<label class="switch" title="${esc(L('Enabled', 'مفعّل'))}"><input type="checkbox" data-model="cat:${kind}:${c.id}" ${on ? 'checked' : ''}><i></i></label></div></div>`;
    }).join('');
    const top = list.slice().sort(B.by('uses', -1));
    B.title(tx(meta.t));
    const tabs = `<div class="tabs" role="tablist">${['bcats', 'ucats', 'scats'].map((k) => `<button class="t ${k === kind ? 'active' : ''}" role="tab" aria-selected="${k === kind}" data-go="${R}-${k}">${icon(CATMETA[k].icon)}${tx(CATMETA[k].t)}<span class="c">${CATS[k].length}</span></button>`).join('')}</div>`;
    return `${head({ title: meta.t, sub: meta.s, actions: ui.btn(L('Add category', 'إضافة فئة'), { kind: 'primary', icon: 'plus', act: 'adCatAdd', arg: kind }) })}
      ${tabs}
      <div class="grid g-main">
        ${ui.card({ title: L(`${list.length} categories`, `${list.length} فئات`), sub: L('Disabled categories stay on existing records but cannot be chosen for new ones.', 'تبقى الفئات المعطّلة على السجلات الحالية ولا يمكن اختيارها لسجلات جديدة.'), body: rows })}
        <div class="stack">
          ${ui.card({ title: L('Usage', 'الاستخدام'), sub: L(`${B.num(total)} ${tx(meta.unit)} in total`, `${B.num(total)} ${tx(meta.unit)} إجمالاً`), body: B.charts.hbars({ data: top.map((c, i) => ({ label: c.name, value: c.uses, color: i === 0 ? '#36D6A0' : '#C9D6DF' })) }) })}
          ${ui.callout(L('Every category needs an English and an Arabic name. Codes are used in exports and APIs and cannot be changed once records use them.', 'تحتاج كل فئة إلى اسم بالإنجليزية واسم بالعربية. تُستخدم الرموز في التصدير والواجهات البرمجية ولا يمكن تغييرها بعد استخدامها في السجلات.'), 'dashed', 'globe')}
        </div>
      </div>`;
  };
  const catForm = (kind, c) => `<input type="hidden" name="kind" value="${kind}"><input type="hidden" name="id" value="${c ? c.id : ''}"><div class="form-grid">
    ${ui.field({ name: 'en', label: L('Name (English)', 'الاسم (بالإنجليزية)'), required: true, value: c ? c.name.en : '' })}
    ${ui.field({ name: 'ar', label: L('Name (Arabic)', 'الاسم (بالعربية)'), required: true, value: c ? c.name.ar : '' })}
    ${ui.field({ name: 'code', label: L('Code', 'الرمز'), required: true, value: c ? c.code : '', placeholder: 'e.g. GAR' })}
    ${ui.field({ name: 'icon', label: L('Icon', 'الأيقونة'), type: 'select', value: c ? c.icon : 'building', options: ICONS.map((i) => ({ v: i, l: i })) })}</div>`;
  B.act.adCatAdd = (kind) => B.modal({ title: L('Add category', 'إضافة فئة'), sub: tx(CATMETA[kind].t), form: 'adCatSave', body: catForm(kind, null), foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Add category', 'إضافة فئة'), { kind: 'primary', type: 'submit', icon: 'plus' })}` });
  B.act.adCatEdit = (arg) => { const [kind, id] = arg.split(':'); const c = CATS[kind].find((x) => x.id === id); B.modal({ title: L('Edit category', 'تعديل الفئة'), sub: esc(tx(c.name)), form: 'adCatSave', body: catForm(kind, c), foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Save', 'حفظ'), { kind: 'primary', type: 'submit', icon: 'check' })}` }); };
  B.submit.adCatSave = (d) => {
    const list = CATS[d.kind];
    if (!list) return;
    const ex = d.id && list.find((x) => x.id === d.id);
    if (ex) Object.assign(ex, { name: { en: d.en, ar: d.ar }, code: (d.code || ex.code).toUpperCase(), icon: d.icon || ex.icon });
    else list.push({ id: 'c' + Date.now(), name: { en: d.en || 'New category', ar: d.ar || 'فئة جديدة' }, code: (d.code || 'NEW').toUpperCase().slice(0, 4), icon: d.icon || 'building', uses: 0, on: true });
    B.refresh(); B.success({ title: ex ? L('Category updated', 'تم تحديث الفئة') : L('Category added', 'تمت إضافة الفئة'), text: L('Available to all tenants immediately.', 'متاحة لجميع الجهات فوراً.') });
  };

  /* =================================================================
     Verification settings
     ================================================================= */
  function verification() {
    const docs = [
      ['deed', T('Ownership deed / Tabu extract', 'سند الملكية / إخراج قيد طابو'), 'all'],
      ['permit', T('Building permit', 'رخصة البناء'), 'new'],
      ['plan', T('Site plan & survey', 'مخطط الموقع والمساحة'), 'new'],
      ['photos', T('Site photos (min. 3)', 'صور الموقع (3 على الأقل)'), 'all'],
      ['id', T('Applicant ID', 'هوية مقدّم الطلب'), 'all'],
      ['letter', T('Committee or association letter', 'كتاب اللجنة أو الجمعية'), 'none'],
    ];
    const applies = [{ v: 'all', l: L('All requests', 'جميع الطلبات') }, { v: 'new', l: L('New registrations', 'التسجيلات الجديدة') }, { v: 'link', l: L('Links to GIS', 'الربط بنظم المعلومات') }, { v: 'none', l: L('Optional', 'اختياري') }];
    const sel = (key, opts, def) => ui.select(key, opts, { def });
    return `${head({ title: L('Verification settings', 'إعدادات التحقق'), sub: L('Rules that decide how buildings get registered and verified on BENA.', 'القواعد التي تحدد كيفية تسجيل المباني وتوثيقها في بينا.') })}
      <div class="card">
        <div class="ad-sec"><div><h3>${L('Independent registration', 'التسجيل المستقل')}</h3><p>${L('Where owners may register a building that has no municipal GIS record.', 'الأماكن التي يمكن فيها للمالكين تسجيل مبنى ليس له سجل في نظم المعلومات البلدية.')}</p></div>
          <div class="stack-sm">${MUNIS.map((m) => `<div class="ad-switchrow"><div style="min-width:0"><b>${tx(m.name)}</b><small>${m.id === 'birzeit' ? L('Pilot — field check required', 'تجريبية — يلزم فحص ميداني') : L('Reviewed by the municipal GIS unit', 'تتم المراجعة من وحدة نظم المعلومات البلدية')}</small></div>${sw(`vr:ind:${m.id}`, B.get(`vr:ind:${m.id}`, m.id !== 'beitunia'))}</div>`).join('<div class="divider"></div>')}</div></div>
        <div class="ad-sec"><div><h3>${L('Required documents', 'المستندات المطلوبة')}</h3><p>${L('Applicants must attach these before a request reaches review.', 'يجب على المتقدّمين إرفاقها قبل وصول الطلب للمراجعة.')}</p></div>
          <div>${docs.map(([id, l, d]) => `<div class="ad-docrow"><b>${tx(l)}</b>${sel(`vr:doc:${id}`, applies, d)}${sw(`vr:docOn:${id}`, B.get(`vr:docOn:${id}`, d !== 'none'))}</div>`).join('')}</div></div>
        <div class="ad-sec"><div><h3>${L('Auto-verification', 'التوثيق التلقائي')}</h3><p>${L('Requests that meet every threshold are verified without manual review and sampled for audit.', 'تُوثّق الطلبات المستوفية لجميع الحدود دون مراجعة يدوية وتخضع لعينات تدقيق.')}</p></div>
          <div class="stack">
            <div class="ad-switchrow"><div><b>${L('Enable auto-verification', 'تفعيل التوثيق التلقائي')}</b><small>${L('Applies to links and corrections only', 'ينطبق على الربط والتصحيحات فقط')}</small></div>${sw('vr:auto', B.get('vr:auto', true))}</div>
            <div class="form-grid">
              <div class="field"><label for="f-vrovl">${L('Minimum footprint overlap', 'الحد الأدنى لتطابق المسقط')}</label>${sel('vr:ovl', ['80', '85', '90', '95'].map((v) => ({ v, l: `≥ ${v}%` })), '90')}</div>
              <div class="field"><label for="f-vrunits">${L('Max unit-count difference', 'أقصى فرق في عدد الوحدات')}</label>${sel('vr:units', ['0', '1', '2', '5'].map((v) => ({ v, l: v === '0' ? L('Must match', 'يجب التطابق') : `± ${v}` })), '1')}</div>
              <div class="field"><label for="f-vrsla">${L('Manual review target', 'هدف المراجعة اليدوية')}</label>${sel('vr:sla', [{ v: '3', l: L('3 working days', '3 أيام عمل') }, { v: '5', l: L('5 working days', '5 أيام عمل') }, { v: '10', l: L('10 working days', '10 أيام عمل') }], '5')}</div>
              <div class="field"><label for="f-vrsample">${L('Audit sample', 'عينة التدقيق')}</label>${sel('vr:sample', ['5', '10', '20'].map((v) => ({ v, l: L(`${v}% of auto-verified`, `${v}% من الموثّقة تلقائياً`) })), '10')}</div>
            </div>
            <div class="ad-switchrow"><div><b>${L('Parcel must match land registry', 'يجب تطابق القطعة مع تسجيل الأراضي')}</b></div>${sw('vr:parcel', B.get('vr:parcel', true))}</div>
            <div class="ad-switchrow"><div><b>${L('Applicant identity verified', 'هوية مقدّم الطلب موثّقة')}</b></div>${sw('vr:idv', B.get('vr:idv', true))}</div>
            <div class="ad-switchrow"><div><b>${L('Exclude heritage zones', 'استثناء المناطق التراثية')}</b><small>${L('Always route to the conservation unit', 'التحويل دائماً لوحدة الحفاظ')}</small></div>${sw('vr:her', B.get('vr:her', true))}</div>
          </div></div>
      </div>
      <div class="ad-sticky">${ui.btn(L('Discard', 'تجاهل'), { act: 'adVrReset' })}${ui.btn(L('Save rules', 'حفظ القواعد'), { kind: 'primary', icon: 'check', act: 'adVrSave' })}</div>`;
  }
  B.act.adVrSave = () => B.success({ title: L('Verification rules saved', 'تم حفظ قواعد التحقق'), text: L('New rules apply to requests submitted from now on.', 'تنطبق القواعد الجديدة على الطلبات المقدّمة من الآن.'), ref: B.uid('VRF') });
  B.act.adVrReset = () => { Object.keys(B.vs).filter((k) => k.startsWith('vr:')).forEach((k) => delete B.vs[k]); B.refresh(); B.toast(L('Changes discarded', 'تم تجاهل التغييرات')); };

  /* =================================================================
     Audit log
     ================================================================= */
  function audit() {
    const c = B.get('au:cat', 'all'), q = B.get('au:q', '');
    const rows = AUDIT.filter((e) => (c === 'all' || e.cat === c) && B.match(q, e.action, e.target, e.actor ? D.person(e.actor).name : 'System', e.id));
    const table = ui.table({
      id: 'aut', rows, pageSize: 12, rowAct: (r) => ({ act: 'adEvent', arg: r.id }),
      cols: [
        { key: 'date', label: L('Time', 'الوقت'), sort: (r) => r.date + r.time, render: (r) => `<span class="nowrap">${B.dateShort(r.date)} <span class="ltr faint">${r.time}</span></span>`, m: 'meta' },
        { key: 'action', label: L('Event', 'الحدث'), sort: (r) => tx(r.action), m: 'title', render: (r) => `<b style="font-weight:600">${esc(tx(r.action))}</b><div class="xs faint">${tx(AC[r.cat])}</div>`, mRender: (r) => esc(tx(r.action)) },
        { key: 'target', label: L('Target', 'الهدف'), render: (r) => esc(tx(r.target)), m: 'sub' },
        { key: 'actor', label: L('Actor', 'المنفّذ'), sort: (r) => (r.actor ? D.pname(r.actor) : ''), render: (r) => (r.actor ? `<span class="nowrap">${esc(D.pname(r.actor))}</span>` : `<span class="badge">${icon('cpu')}${L('System', 'النظام')}</span>`), m: 'meta' },
        { key: 'sev', label: L('Severity', 'الخطورة'), sort: (r) => ({ high: 0, medium: 1, low: 2 }[r.sev]), render: (r) => ui.status(r.sev), m: 'end' },
      ],
    });
    return `${head({ title: L('Audit log', 'سجل التدقيق'), sub: L('Security and data events across the platform (preview of the last 30 events).', 'أحداث الأمان والبيانات عبر المنصة (معاينة آخر 30 حدثاً).'),
      actions: ui.btn(L('Export', 'تصدير'), { icon: 'download', act: 'soon', arg: L('Audit export', 'تصدير السجل') }) })}
      <div class="stack">${ui.chips('au:cat', [{ id: 'all', label: L('All', 'الكل'), count: AUDIT.length }].concat(Object.keys(AC).map((k) => ({ id: k, label: AC[k], count: AUDIT.filter((e) => e.cat === k).length }))), c)}
        <div class="toolbar" style="margin-bottom:0">${ui.search('au:q', L('Search events, targets or people', 'ابحث في الأحداث أو الأهداف أو الأشخاص'), { reset: 'aut:page' })}</div>${table}</div>`;
  }
  B.act.adEvent = (id) => {
    const e = AUDIT.find((x) => x.id === id);
    const json = JSON.stringify({ id: e.id, time: `${e.date}T${e.time}:00+02:00`, category: e.cat, actor: e.actor ? (USERS.find((u) => u.p === e.actor) || {}).email || e.actor : 'system', action: tx(e.action), target: tx(e.target), ip: e.ip, severity: e.sev }, null, 2);
    B.modal({ title: esc(tx(e.action)), sub: `${ui.idMono(e.id)} · ${B.date(e.date)} <span class="ltr">${e.time}</span>`, size: 'md', body: `<div class="row-sm wrap" style="margin-bottom:12px">${ui.status(e.sev)}${ui.badge(AC[e.cat])}</div><pre class="ad-pre">${esc(json)}</pre>`,
      foot: `${ui.btn(L('Close', 'إغلاق'), { act: 'closeModal' })}${ui.btn(L('Copy JSON', 'نسخ JSON'), { kind: 'primary', icon: 'clipboard', act: 'toast', arg: L('Copied (demo)', 'تم النسخ (تجريبي)') })}` });
  };

  /* =================================================================
     Platform configuration
     ================================================================= */
  function config() {
    const f = (o) => ui.field(o);
    const swr = (name, label, sub, on) => `<label class="ad-switchrow" style="cursor:pointer"><div><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</div><span class="switch"><input type="checkbox" name="${name}" ${on ? 'checked' : ''}><i></i></span></label>`;
    return `${head({ title: L('Platform configuration', 'إعدادات المنصة'), sub: L('Global defaults for every tenant. Changes are simulated in this demo.', 'الإعدادات الافتراضية العامة لكل الجهات. التغييرات محاكاة في هذا العرض.') })}
      <form data-submit="adConfig">
      <div class="card">
        <div class="ad-sec"><div><h3>${L('General', 'عام')}</h3><p>${L('Name, support contact and locale defaults.', 'الاسم وجهة الدعم والإعدادات المحلية.')}</p></div>
          <div class="form-grid">${f({ name: 'pname', label: L('Platform name', 'اسم المنصة'), value: 'BENA' })}${f({ name: 'support', label: L('Support email', 'بريد الدعم'), type: 'email', value: 'support@bena.example' })}
            ${f({ name: 'lang', label: L('Default language', 'اللغة الافتراضية'), type: 'select', value: 'ar', options: [{ v: 'ar', l: 'العربية' }, { v: 'en', l: 'English' }] })}
            ${f({ name: 'tz', label: L('Time zone', 'المنطقة الزمنية'), type: 'select', value: 'hebron', options: [{ v: 'hebron', l: 'Asia/Hebron (UTC+2)' }, { v: 'gaza', l: 'Asia/Gaza (UTC+2)' }] })}
            ${f({ name: 'cur', label: L('Default currency', 'العملة الافتراضية'), type: 'select', value: 'ILS', options: [{ v: 'ILS', l: L('Shekel (₪)', 'شيكل (₪)') }, { v: 'JOD', l: L('Jordanian dinar (JD)', 'دينار أردني (JD)') }, { v: 'USD', l: L('US dollar ($)', 'دولار أمريكي ($)') }] })}
            ${f({ name: 'months', label: L('Month names', 'أسماء الأشهر'), type: 'select', value: 'lev', options: [{ v: 'lev', l: L('Levantine (كانون الثاني…)', 'شامية (كانون الثاني…)') }, { v: 'msa', l: L('Standard (يناير…)', 'قياسية (يناير…)') }] })}</div></div>
        <div class="ad-sec"><div><h3>${L('Identifiers', 'المعرّفات')}</h3><p>${L('How BENA IDs are generated for new buildings.', 'طريقة توليد أرقام بينا للمباني الجديدة.')}</p></div>
          <div class="form-grid">${f({ name: 'idfmt', label: L('BENA ID format', 'صيغة رقم بينا'), value: 'BN-{TENANT}-{00000}', hint: L('Example: BN-RAM-00142', 'مثال: BN-RAM-00142') })}${f({ name: 'unitfmt', label: L('Unit ID format', 'صيغة رقم الوحدة'), value: '{BENA}-{FLOOR}{NN}', hint: L('Example: BN-RAM-00142-803', 'مثال: BN-RAM-00142-803') })}</div></div>
        <div class="ad-sec"><div><h3>${L('Security', 'الأمان')}</h3><p>${L('Sign-in and session policies.', 'سياسات تسجيل الدخول والجلسات.')}</p></div>
          <div class="stack">${swr('mfaAdmin', L('Require 2FA for administrative roles', 'اشتراط التحقق الثنائي للأدوار الإدارية'), L('Municipality, manager, facility and platform admins', 'البلدية والمديرون والمرافق ومديرو المنصة'), true)}
            ${swr('mfaAll', L('Require 2FA for everyone', 'اشتراط التحقق الثنائي للجميع'), '', false)}
            <div class="form-grid">${f({ name: 'session', label: L('Session timeout', 'مهلة الجلسة'), type: 'select', value: '60', options: [{ v: '30', l: L('30 minutes', '30 دقيقة') }, { v: '60', l: L('1 hour', 'ساعة') }, { v: '480', l: L('8 hours', '8 ساعات') }] })}${f({ name: 'retention', label: L('Audit log retention', 'مدة الاحتفاظ بسجل التدقيق'), type: 'select', value: '7', options: [{ v: '1', l: L('1 year', 'سنة') }, { v: '3', l: L('3 years', '3 سنوات') }, { v: '7', l: L('7 years', '7 سنوات') }] })}</div></div></div>
        <div class="ad-sec"><div><h3>${L('Maintenance', 'الصيانة')}</h3><p>${L('Show a banner to all users ahead of planned work.', 'عرض شريط لجميع المستخدمين قبل الأعمال المخططة.')}</p></div>
          <div class="stack">${swr('banner', L('Show maintenance banner', 'عرض شريط الصيانة'), '', false)}${f({ name: 'bannerMsg', label: L('Banner message', 'نص الشريط'), type: 'textarea', value: L('BENA will be briefly unavailable on Friday 05:00–05:30 for scheduled maintenance.', 'ستتوقف بينا لفترة وجيزة يوم الجمعة 05:00–05:30 لصيانة مجدولة.') })}</div></div>
      </div>
      <div class="ad-sticky">${ui.btn(L('Cancel', 'إلغاء'), { act: 'toast', arg: L('No changes made', 'لم يتم إجراء تغييرات') })}${ui.btn(L('Save configuration', 'حفظ الإعدادات'), { kind: 'primary', type: 'submit', icon: 'check' })}</div>
      </form>`;
  }
  B.submit.adConfig = () => B.success({ title: L('Configuration saved', 'تم حفظ الإعدادات'), text: L('Settings were applied to all tenants (simulated).', 'تم تطبيق الإعدادات على جميع الجهات (محاكاة).'), ref: B.uid('CFG') });

  /* =================================================================
     Role registration
     ================================================================= */
  const pages = { home, orgs, users, roles, munis, sources, bcats: catPage('bcats'), ucats: catPage('ucats'), scats: catPage('scats'), verification, audit, config };
  B.role({
    id: R, icon: 'shield', nav: 'drawer',
    name: { en: 'Platform admin', ar: 'إدارة المنصة' }, short: { en: 'Admin', ar: 'الإدارة' },
    org: { en: 'BENA Platform Ops', ar: 'عمليات منصة بينا' },
    tag: { en: 'Operations', ar: 'العمليات' },
    desc: { en: 'Tenants, users, permissions, data sources, categories and verification rules.', ar: 'الجهات والمستخدمون والصلاحيات ومصادر البيانات والفئات وقواعد التحقق.' },
    personaTitle: { en: 'Dana Salem · Platform Ops', ar: 'دانا سالم · عمليات المنصة' },
    home: 'home',
    menu: [
      { group: { en: 'Overview', ar: 'نظرة عامة' } },
      { id: 'home', label: { en: 'Overview', ar: 'نظرة عامة' }, icon: 'grid' },
      { group: { en: 'Tenants & access', ar: 'الجهات والوصول' } },
      { id: 'orgs', label: { en: 'Organizations', ar: 'المؤسسات' }, icon: 'briefcase' },
      { id: 'users', label: { en: 'Users', ar: 'المستخدمون' }, icon: 'users' },
      { id: 'roles', label: { en: 'Roles & permissions', ar: 'الأدوار والصلاحيات' }, icon: 'key' },
      { id: 'munis', label: { en: 'Municipalities', ar: 'البلديات' }, icon: 'landmark' },
      { group: { en: 'Building data', ar: 'بيانات المباني' } },
      { id: 'sources', label: { en: 'Data sources', ar: 'مصادر البيانات' }, icon: 'database' },
      { id: 'bcats', label: { en: 'Categories', ar: 'الفئات' }, icon: 'tag', match: ['ucats', 'scats'] },
      { id: 'verification', label: { en: 'Verification settings', ar: 'إعدادات التحقق' }, icon: 'shieldCheck' },
      { group: { en: 'System', ar: 'النظام' } },
      { id: 'audit', label: { en: 'Audit log', ar: 'سجل التدقيق' }, icon: 'history' },
      { id: 'config', label: { en: 'Configuration', ar: 'الإعدادات' }, icon: 'settings' },
    ],
    pages: Object.fromEntries(Object.entries(pages).map(([k, fn]) => [k, (id) => `<div class="ad">${fn(id)}</div>`])),
    notifications: () => [
      { icon: 'alert', tone: 'warn', title: L('GIS sync workers degraded', 'أداء عمّال المزامنة منخفض'), sub: L('Queue backlog after Beitunia initial load', 'تراكم في الطابور بعد التحميل الأولي لبيتونيا'), when: L('Today', 'اليوم'), go: `${R}-home` },
      { icon: 'xCircle', tone: 'bad', title: L('Bulk import failed', 'فشل الاستيراد الجماعي'), sub: L('Al-Bireh permits archive — header not recognised', 'أرشيف رخص البيرة — لم يُتعرّف على الترويسة'), when: L('5 days ago', 'قبل 5 أيام'), go: `${R}-sources` },
      { icon: 'userPlus', tone: 'info', title: L('New organization awaiting approval', 'مؤسسة جديدة بانتظار الموافقة'), sub: L('ShieldPest requested provider access', 'طلبت شيلد وصول مزوّد خدمة'), when: L('6 days ago', 'قبل 6 أيام'), go: `${R}-orgs` },
      { icon: 'landmark', tone: 'mint', title: L('Birzeit pilot started', 'بدأت تجربة بيرزيت'), sub: L('Sample tenant created — onboarding step 1 of 5', 'تم إنشاء جهة تجريبية — خطوة الإعداد 1 من 5'), when: L('Nov 10', '10 تشرين الثاني'), go: `${R}-munis` },
    ],
  });
})();
