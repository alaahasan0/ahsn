/*
 * BENA — Service provider experience.
 * Persona: Yousef Jaber, owner of Jaber Technical Services (sp_jaber / org_jaber).
 * Incoming requests, quotations, scheduled jobs with status tracking, completed work,
 * customer feedback and the company profile. Uses B.data.requests (provider sp_jaber)
 * plus additional fictional requests below, and requests created in the services
 * marketplace during this session (B.mkt.created). In-memory only.
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon, ui } = B;
  const D = B.data;
  const M = B.mkt;
  const T = (en, ar) => ({ en, ar });
  const PID = 'sp_jaber';
  const P = () => D.provider(PID);

  /* ---------------- team ---------------- */
  const TEAM = [
    { id: 't_yousef', name: T('Yousef Jaber', 'يوسف جابر'), role: T('Owner · master electrician', 'المالك · مهندس كهرباء'), skills: ['electrical'], status: 'office' },
    { id: 't_ali', name: T('Ali Darwish', 'علي درويش'), role: T('Lead plumber', 'رئيس فنيي السباكة'), skills: ['plumbing', 'general'], status: 'onjob' },
    { id: 't_samir', name: T('Samir Qasem', 'سمير قاسم'), role: T('Electrician', 'فني كهرباء'), skills: ['electrical'], status: 'onjob' },
    { id: 't_hadi', name: T('Hadi Nasr', 'هادي نصر'), role: T('HVAC technician', 'فني تكييف'), skills: ['hvac'], status: 'available' },
    { id: 't_rami', name: T('Rami Ayyad', 'رامي عياد'), role: T('Apprentice technician', 'فني متدرب'), skills: ['general', 'plumbing'], status: 'available' },
  ];
  const tech = (id) => TEAM.find((t) => t.id === id) || TEAM[1];

  /* ---------------- requests (incoming / quoted / declined…) ---------------- */
  const RQ = (id, o) => ({ id, ...o });
  const REQS = [
    RQ('PR-24531', { bid: 'BN-RAM-00087', unit: null, by: 'p_nadia', cat: 'electrical', status: 'new', priority: 'medium', created: '2026-11-24', pref: { date: '2026-11-28', slot: 'morning' }, photos: 2,
      title: T('Stairwell lights on timer keep failing', 'إنارة الدرج على المؤقت تتعطل باستمرار'), desc: T('Lights on floors 3–6 switch off after a few seconds or don’t come on at all. Timer unit is in the ground-floor cabinet.', 'إنارة الطوابق 3–6 تنطفئ بعد ثوانٍ أو لا تعمل إطلاقاً. وحدة المؤقت في خزانة الطابق الأرضي.') }),
    RQ('PR-24527', { bid: 'BN-RAM-00142', unit: 'BN-RAM-00142-1102', by: 'p_khaled', cat: 'hvac', status: 'new', priority: 'medium', created: '2026-11-24', pref: { date: '2026-11-30', slot: 'afternoon' }, photos: 3,
      title: T('Install 2 split AC units before new tenant', 'تركيب مكيفين سبليت قبل المستأجر الجديد'), desc: T('Living room (18,000 BTU) and master bedroom (12,000 BTU). Units already purchased; need installation, piping and drain.', 'غرفة المعيشة (18,000 وحدة) وغرفة النوم الرئيسية (12,000 وحدة). الأجهزة مشتراة؛ نحتاج التركيب والأنابيب والتصريف.') }),
    RQ('PR-24522', { bid: 'BN-RAM-00266', unit: 'BN-RAM-00266-703', by: 'p_ruba', cat: 'plumbing', status: 'new', priority: 'high', created: '2026-11-23', pref: { date: '2026-11-26', slot: 'morning' }, photos: 1,
      title: T('Water heater not heating', 'سخان المياه لا يسخّن'), desc: T('80-litre electric heater, about 6 years old. Breaker doesn’t trip but water stays cold.', 'سخان كهربائي سعة 80 لتراً عمره نحو 6 سنوات. القاطع لا يفصل لكن المياه تبقى باردة.') }),
    RQ('PR-24519', { bid: 'BN-RAM-00415', unit: null, by: 'p_rania', cat: 'electrical', status: 'new', priority: 'low', created: '2026-11-23', pref: { date: '2026-12-02', slot: 'morning' }, photos: 0,
      title: T('Quarterly panel inspection — 10 floors', 'الفحص الربعي للوحات — 10 طوابق'), desc: T('Thermal scan and torque check of floor panels plus the main distribution board. Report needed for the owners’ association.', 'مسح حراري وفحص شد للوحات الطوابق ولوحة التوزيع الرئيسية. مطلوب تقرير لجمعية المالكين.') }),
    RQ('PR-24515', { bid: 'BN-RAM-00203', unit: 'BN-RAM-00203-603', by: 'p_fadi', cat: 'general', status: 'new', priority: 'low', created: '2026-11-22', pref: { date: '2026-12-04', slot: 'evening' }, photos: 2,
      title: T('Re-seal bathroom and fix cabinet doors', 'إعادة عزل الحمّام وإصلاح أبواب الخزائن'), desc: T('Silicone around the shower is mouldy; two kitchen cabinet doors are hanging loose.', 'السيليكون حول الدش متعفن؛ وبابا خزانة في المطبخ مرتخيان.') }),
    RQ('PR-24508', { bid: 'BN-RAM-00311', unit: 'BN-RAM-00311-702', by: 'p_karim', cat: 'hvac', status: 'quoted', priority: 'medium', created: '2026-11-20', pref: { date: '2026-11-27', slot: 'morning' }, photos: 2,
      title: T('AC condensate dripping in meeting room', 'تقطير مياه المكيف في قاعة الاجتماعات'), desc: T('Cassette unit drips onto the table after an hour of use.', 'وحدة الكاسيت تُقطّر على الطاولة بعد ساعة من التشغيل.') }),
    RQ('PR-24496', { bid: 'BN-RAM-00142', unit: null, by: 'p_mona', cat: 'plumbing', status: 'quoted', priority: 'medium', created: '2026-11-18', pref: { date: '2026-11-29', slot: 'morning' }, photos: 1,
      title: T('Booster pump pressure switch replacement', 'استبدال مفتاح ضغط مضخة التعزيز'), desc: T('Duty pump short-cycles at night; committee wants a fixed quote before the general assembly.', 'المضخة العاملة تعمل وتتوقف بشكل متكرر ليلاً؛ تريد اللجنة عرضاً ثابتاً قبل الهيئة العامة.') }),
    RQ('PR-24489', { bid: 'BN-RAM-00744', unit: null, by: 'p_basel', cat: 'electrical', status: 'quoted', priority: 'low', created: '2026-11-16', pref: { date: '2026-12-06', slot: 'afternoon' }, photos: 3,
      title: T('Garden lighting circuit for 6 villas', 'دائرة إنارة الحديقة لـ 6 فلل'), desc: T('New outdoor circuit with 14 bollard lights and a photocell.', 'دائرة خارجية جديدة مع 14 عمود إنارة وحساس ضوئي.') }),
    RQ('PR-24480', { bid: 'BN-RAM-00529', unit: null, by: 'p_hala', cat: 'electrical', status: 'declined', priority: 'medium', created: '2026-11-13', photos: 4, reason: T('Fully booked on the requested dates', 'محجوزون بالكامل في المواعيد المطلوبة'),
      title: T('Full rewiring of a 1934 stone house', 'إعادة تمديد كاملة لبيت حجري من 1934'), desc: T('Heritage building; surface conduits preferred.', 'مبنى تراثي؛ يفضّل التمديد الخارجي.') }),
    RQ('PR-24461', { bid: 'BN-RAM-00087', unit: null, by: 'p_nadia', cat: 'general', status: 'lost', priority: 'low', created: '2026-11-04', photos: 2,
      title: T('Replace 6 stairwell windows', 'استبدال 6 نوافذ للدرج'), desc: T('Aluminium frames, double glazing.', 'إطارات ألمنيوم وزجاج مزدوج.') }),
    RQ('PR-24402', { bid: 'BN-RAM-00618', unit: null, by: 'p_omar', cat: 'electrical', status: 'expired', priority: 'low', created: '2026-10-21', photos: 0,
      title: T('Generator ATS functional check', 'فحص وظيفي لمفتاح التحويل الآلي للمولد'), desc: T('Annual transfer switch test.', 'اختبار سنوي لمفتاح التحويل.') }),
  ];
  const QUOTES = [
    { id: 'QT-3381', req: 'PR-24508', amount: 640, sent: '2026-11-21', valid: '2026-12-05', eta: 2, status: 'sent' },
    { id: 'QT-3376', req: 'PR-24496', amount: 980, sent: '2026-11-19', valid: '2026-12-03', eta: 3, status: 'sent' },
    { id: 'QT-3370', req: 'PR-24489', amount: 1450, sent: '2026-11-17', valid: '2026-12-01', eta: 5, status: 'sent' },
    { id: 'QT-3362', req: 'JB-3104', amount: 810, sent: '2026-11-15', valid: '2026-11-29', eta: 4, status: 'accepted' },
    { id: 'QT-3359', req: 'JB-3103', amount: 1850, sent: '2026-11-12', valid: '2026-11-26', eta: 7, status: 'accepted' },
    { id: 'QT-3344', req: 'MR-24355', amount: 740, sent: '2026-11-11', valid: '2026-11-25', eta: 1, status: 'accepted' },
    { id: 'QT-3335', req: 'MR-24518', amount: 210, sent: '2026-11-22', valid: '2026-12-06', eta: 1, status: 'accepted' },
    { id: 'QT-3352', req: 'PR-24461', amount: 2300, sent: '2026-11-05', valid: '2026-11-19', eta: 6, status: 'declined' },
    { id: 'QT-3318', req: 'PR-24402', amount: 450, sent: '2026-10-22', valid: '2026-11-05', eta: 3, status: 'expired' },
  ];

  /* ---------------- jobs ---------------- */
  const CHECK = {
    electrical: [T('Isolate circuit & lock out', 'عزل الدائرة وقفلها'), T('Test with meter', 'الفحص بجهاز القياس'), T('Repair or replace component', 'إصلاح أو استبدال المكوّن'), T('Insulation & RCD test', 'اختبار العزل وقاطع التسرب'), T('Before/after photos', 'صور قبل وبعد'), T('Walk the customer through', 'شرح العمل للعميل')],
    plumbing: [T('Shut off water supply', 'إغلاق مصدر المياه'), T('Locate the source', 'تحديد مصدر المشكلة'), T('Replace fittings / parts', 'استبدال الوصلات / القطع'), T('Pressure test 15 min', 'اختبار ضغط 15 دقيقة'), T('Clean and dry the area', 'تنظيف وتجفيف المكان'), T('Before/after photos', 'صور قبل وبعد')],
    hvac: [T('Isolate power', 'فصل الكهرباء'), T('Clean filters & coils', 'تنظيف الفلاتر والملفات'), T('Flush drain line', 'تنظيف خط التصريف'), T('Check refrigerant pressure', 'فحص ضغط غاز التبريد'), T('10-minute test run', 'تشغيل تجريبي 10 دقائق'), T('Before/after photos', 'صور قبل وبعد')],
    general: [T('Protect floors & furniture', 'حماية الأرضيات والأثاث'), T('Remove old material', 'إزالة المواد القديمة'), T('Install / repair', 'التركيب / الإصلاح'), T('Quality check', 'فحص الجودة'), T('Clean-up', 'التنظيف'), T('Before/after photos', 'صور قبل وبعد')],
  };
  const J = (id, o) => ({ id, notes: '', ...o, check: (CHECK[o.cat] || CHECK.general).map((_, i) => (o.status === 'completed' ? true : o.status === 'inProgress' ? i < 3 : false)) });
  const fromData = (rid, extra) => { const r = D.request(rid); return r ? J(rid, { bid: r.building, unit: r.unit, by: r.by, cat: r.cat, title: r.title, desc: r.desc, ...extra }) : null; };
  const JOBS = [
    J('JB-3101', { bid: 'BN-RAM-00311', unit: null, by: 'p_omar', cat: 'electrical', date: '2026-11-25', time: '10:30', status: 'enroute', tech: 't_samir', amount: 520, title: T('Replace faulty RCD — floor 4 panel', 'استبدال قاطع تسرب معطل — لوحة الطابق 4'), desc: T('RCD trips randomly; tenants on floor 4 losing power.', 'قاطع التسرب يفصل عشوائياً؛ مستأجرو الطابق 4 تنقطع عنهم الكهرباء.') }),
    J('JB-3102', { bid: 'BN-RAM-00087', unit: 'BN-RAM-00087-402', by: 'p_khaled', cat: 'plumbing', date: '2026-11-25', time: '13:00', status: 'scheduled', tech: 't_ali', amount: 260, title: T('Water heater thermostat replacement', 'استبدال ترموستات سخان المياه'), desc: T('Thermostat diagnosed as faulty; part in stock.', 'تم تشخيص عطل الترموستات؛ القطعة متوفرة.') }),
    J('JB-3103', { bid: 'BN-RAM-00142', unit: null, by: 'p_samer', cat: 'electrical', date: '2026-11-25', time: '15:30', status: 'scheduled', tech: 't_samir', amount: 1850, title: T('Lobby lighting retrofit to LED', 'تحويل إنارة الردهة إلى LED'), desc: T('Replace 22 downlights and add a motion sensor, approved by the owners’ association.', 'استبدال 22 سبوت وإضافة حساس حركة، بموافقة جمعية المالكين.') }),
    fromData('MR-24518', { date: '2026-11-26', time: '09:30', status: 'inProgress', tech: 't_ali', amount: 210, notes: T('First visit 23 Nov: drain trap cracked. Returning with new trap and seal.', 'الزيارة الأولى 23 ت٢: سيفون التصريف مشقوق. العودة بسيفون وحشوة جديدة.') }),
    fromData('MR-24355', { date: '2026-11-27', time: '11:00', status: 'scheduled', tech: 't_ali', amount: 740 }),
    J('JB-3104', { bid: 'BN-RAM-00415', unit: null, by: 'p_rania', cat: 'hvac', date: '2026-11-27', time: '09:00', status: 'scheduled', tech: 't_hadi', amount: 810, title: T('AC service — 6 split units (offices)', 'صيانة 6 مكيفات سبليت (مكاتب)'), desc: T('Pre-winter service for the management office and meeting rooms.', 'صيانة ما قبل الشتاء لمكتب الإدارة وقاعات الاجتماعات.') }),
    J('JB-3105', { bid: 'BN-RAM-00618', unit: 'BN-RAM-00618-604', by: 'p_nabil', cat: 'electrical', date: '2026-12-01', time: '10:00', status: 'scheduled', tech: 't_samir', amount: 430, title: T('Add 4 dedicated socket circuits — clinic', 'إضافة 4 دوائر مقابس مخصصة — عيادة'), desc: T('For dental chair and sterilisation equipment.', 'لكرسي الأسنان وأجهزة التعقيم.') }),
    J('JB-3092', { bid: 'BN-RAM-00266', unit: 'BN-RAM-00266-401', by: 'p_fadi', cat: 'electrical', date: '2026-11-24', time: '12:00', status: 'completed', tech: 't_samir', amount: 420, title: T('Replace 6 damaged sockets', 'استبدال 6 مقابس تالفة'), closed: '2026-11-24' }),
    J('JB-3090', { bid: 'BN-RAM-00142', unit: 'BN-RAM-00142-704', by: 'p_tariq', cat: 'hvac', date: '2026-11-23', time: '10:00', status: 'completed', tech: 't_hadi', amount: 300, rating: 4, title: T('Split AC service — 2 units', 'صيانة مكيفين سبليت'), closed: '2026-11-23' }),
    J('JB-3077', { bid: 'BN-RAM-00087', unit: null, by: 'p_ibrahim', cat: 'plumbing', date: '2026-11-21', time: '16:00', status: 'completed', tech: 't_rami', amount: 160, rating: 3, title: T('Leak under the stairwell sink', 'تسريب تحت مغسلة الدرج'), closed: '2026-11-21' }),
    J('JB-3088', { bid: 'BN-RAM-00203', unit: null, by: 'p_layla', cat: 'plumbing', date: '2026-11-18', time: '09:00', status: 'completed', tech: 't_ali', amount: 200, rating: 5, title: T('Booster pump diagnosis', 'تشخيص مضخة التعزيز'), closed: '2026-11-18' }),
    J('JB-3085', { bid: 'BN-RAM-00415', unit: null, by: 'p_rania', cat: 'electrical', date: '2026-11-12', time: '08:30', status: 'completed', tech: 't_samir', amount: 1200, rating: 5, title: T('Emergency lighting test — 10 floors', 'اختبار إنارة الطوارئ — 10 طوابق'), closed: '2026-11-12' }),
    J('JB-3081', { bid: 'BN-RAM-00311', unit: 'BN-RAM-00311-702', by: 'p_karim', cat: 'hvac', date: '2026-11-06', time: '11:00', status: 'completed', tech: 't_hadi', amount: 380, rating: 4, title: T('AC drain line repair', 'إصلاح خط تصريف المكيف'), closed: '2026-11-06' }),
    fromData('MR-24211', { date: '2026-10-30', time: '17:00', status: 'completed', tech: 't_ali', amount: 180, rating: 5, closed: '2026-10-30' }),
    J('JB-3070', { bid: 'BN-RAM-00142', unit: 'BN-RAM-00142-1102', by: 'p_khaled', cat: 'general', date: '2026-09-18', time: '09:00', status: 'completed', tech: 't_rami', amount: 640, rating: 5, title: T('Pre-tenancy fixes — unit 1102', 'إصلاحات قبل التأجير — الوحدة 1102'), closed: '2026-09-18' }),
    J('JB-3061', { bid: 'BN-RAM-00142', unit: null, by: 'p_hiba', cat: 'electrical', date: '2026-08-30', time: '08:00', status: 'completed', tech: 't_samir', amount: 2100, rating: 5, title: T('Stairwell timers — all 14 floors', 'مؤقتات الدرج — جميع الطوابق الـ14'), closed: '2026-08-30' }),
  ].filter(Boolean);
  const job = (id) => JOBS.find((j) => j.id === id);
  const STAGES = ['scheduled', 'enroute', 'inProgress', 'completed'];
  const CUSTOMER_ROLE = { p_lina: T('Tenant', 'مستأجر'), p_khaled: T('Owner', 'مالك'), p_samer: T('Association chair', 'رئيس الجمعية'), p_rania: T('Property manager · Arkan', 'مديرة عقارات · أركان'), p_omar: T('Facility manager · Sanad', 'مدير مرافق · سند'), p_nadia: T('Committee coordinator', 'منسقة اللجنة'), p_mona: T('Committee member', 'عضو لجنة'), p_layla: T('Authorised manager', 'مديرة مفوّضة'), p_hiba: T('Association treasurer', 'أمينة الصندوق') };
  const custRole = (pid) => tx(CUSTOMER_ROLE[pid] || T('Owner', 'مالك'));

  /* incoming requests from the marketplace during this session */
  const marketReqs = () => M.created.filter((q) => (q.invited || []).includes(PID) && !REQS.some((r) => r.id === q.id)).map((q) => {
    const r = RQ(q.id, { bid: q.building, unit: q.unit, by: q.by, cat: q.cat, status: 'new', priority: q.priority, created: q.created, pref: q.pref, photos: 0, title: q.title, desc: q.desc || T('No description provided.', 'لم يتم تقديم وصف.'), fromMkt: true });
    REQS.unshift(r);
    return r;
  });
  /* keep marketplace-originated requests in sync with what the customer decided */
  const syncMarket = () => REQS.filter((r) => r.fromMkt).forEach((r) => {
    const acc = M.accepted[r.id];
    if (!acc || ['won', 'lost'].includes(r.status)) return;
    if (acc !== PID) { r.status = 'lost'; return; }
    r.status = 'won';
    const src = M.request(r.id) || {};
    const amount = (M.sentQuotes[r.id + '|' + PID] || {}).amount || src.amount || 300;
    if (!QUOTES.some((q) => q.req === r.id)) QUOTES.unshift({ id: `QT-${3390 + QUOTES.length}`, req: r.id, amount, sent: '2026-11-25', valid: '2026-12-09', eta: 2, status: 'accepted' });
    else QUOTES.filter((q) => q.req === r.id).forEach((q) => { q.status = 'accepted'; });
    if (!job(r.id)) JOBS.unshift(J(r.id, { bid: r.bid, unit: r.unit, by: r.by, cat: r.cat, title: r.title, desc: r.desc, date: src.visit || (r.pref && r.pref.date) || '2026-11-28', time: (r.pref && r.pref.slot) === 'afternoon' ? '13:00' : (r.pref && r.pref.slot) === 'evening' ? '17:00' : '09:00', status: 'scheduled', tech: r.cat === 'electrical' ? 't_samir' : r.cat === 'hvac' ? 't_hadi' : 't_ali', amount }));
  });
  const reqs = () => { marketReqs(); syncMarket(); return REQS; };
  const req = (id) => reqs().find((r) => r.id === id);
  const quoteOf = (rid) => QUOTES.find((q) => q.req === rid);
  const newCount = () => reqs().filter((r) => r.status === 'new').length;
  const slotL = (s) => ({ morning: L('Morning', 'صباحاً'), afternoon: L('Afternoon', 'بعد الظهر'), evening: L('Evening', 'مساءً') }[s] || '');
  const where = (bid, unit) => { const b = D.building(bid); const u = unit && D.unit(unit); return `${tx(b ? b.name : bid)} · ${u ? L('Unit', 'وحدة') + ' ' + u.number : L('Common areas', 'المناطق المشتركة')}`; };
  const STAT = { new: 'awaitingQuote', quoted: 'quoteSent', declined: 'declined', lost: 'rejected', expired: 'expired', won: 'accepted' };

  /* ---------------- styles ---------------- */
  B.css(`
  .pv-hello { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 10px 0 20px; }
  .pv-hello h1 { font-size: 28px; font-weight: 750; letter-spacing: -.02em; }
  html[dir="rtl"] .pv-hello h1 { letter-spacing: 0; }
  .pv-hello p { color: var(--text-2); margin-top: 4px; font-size: 14px; }
  @media (max-width: 640px) { .pv-hello { padding: 6px 0 14px; } .pv-hello h1 { font-size: 23px; } .pv-hello .row-sm { width: 100%; } .pv-hello .row-sm .btn { flex: 1; } }
  .pv-sched { display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--line-2); align-items: center; text-align: start; width: 100%; }
  .pv-sched:last-child { border-bottom: 0; padding-bottom: 0; }
  .pv-sched:first-child { padding-top: 0; }
  .pv-sched .tm { width: 58px; flex: none; text-align: center; padding: 8px 0; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--line-2); }
  .pv-sched .tm b { display: block; font-family: var(--font-display); font-size: 15px; font-variant-numeric: tabular-nums; }
  .pv-sched .tm small { font-size: 11px; color: var(--text-3); }
  .pv-sched.now .tm { background: var(--navy); border-color: var(--navy); color: #fff; }
  .pv-sched.now .tm small { color: var(--mint); }
  .pv-sched .bd { flex: 1; min-width: 0; }
  .pv-sched .bd b { font-size: 14.5px; display: block; line-height: 1.35; }
  .pv-sched .bd span { font-size: 12.5px; color: var(--text-2); display: block; margin-top: 2px; }
  .pv-sched:hover .bd b { color: var(--mint-ink); }
  .pv-sched .bd .pv-m-st { display: none; margin-top: 6px; }
  @media (max-width: 640px) { .pv-sched .bd .pv-m-st { display: block; } .pv-sched .pv-d-st { display: none; } .pv-sched { align-items: flex-start; } }
  .pv-flush { margin: -4px -20px -20px; border-top: 1px solid var(--line-2); }
  @media (max-width: 640px) { .pv-flush { margin: -2px -16px -16px; } .pv-flush .pv-rq { padding-inline: 16px; } }
  .pv-rq { display: flex; gap: 14px; padding: 16px 18px; border-bottom: 1px solid var(--line-2); align-items: flex-start; text-align: start; width: 100%; transition: background .15s; }
  .pv-rq:last-child { border-bottom: 0; }
  .pv-rq:hover { background: var(--surface-2); }
  .pv-rq .ic { width: 44px; height: 44px; border-radius: 13px; background: var(--mint-50); color: var(--mint-ink); display: grid; place-items: center; flex: none; }
  .pv-rq .ic svg { width: 20px; height: 20px; }
  .pv-rq .bd { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
  .pv-rq .tp { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
  .pv-rq .tp b { font-size: 14.5px; line-height: 1.35; }
  .pv-rq .sb { font-size: 12.5px; color: var(--text-2); }
  .pv-rq .mt { display: flex; gap: 6px 14px; flex-wrap: wrap; font-size: 12px; color: var(--text-3); align-items: center; }
  .pv-rq .mt span { display: inline-flex; align-items: center; gap: 4px; }
  .pv-rq .mt svg { width: 13px; height: 13px; }
  .pv-rq .new-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--mint); flex: none; margin-top: 6px; }
  .pv-track { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; position: relative; }
  .pv-track .s { display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; position: relative; font-size: 12.5px; font-weight: 600; color: var(--text-3); }
  .pv-track .s::before { content: ""; position: absolute; top: 21px; inset-inline-start: calc(-50% + 24px); width: calc(100% - 48px); height: 3px; border-radius: 3px; background: var(--line); }
  .pv-track .s:first-child::before { display: none; }
  .pv-track .s.done::before, .pv-track .s.cur::before { background: var(--mint); }
  .pv-track .c { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: #fff; border: 2px solid var(--line); color: var(--text-3); position: relative; z-index: 1; transition: all .3s var(--ease); }
  .pv-track .c svg { width: 19px; height: 19px; }
  .pv-track .s.done { color: var(--ink); }
  .pv-track .s.done .c { background: var(--navy); border-color: var(--navy); color: var(--mint); }
  .pv-track .s.cur { color: var(--ink); }
  .pv-track .s.cur .c { background: var(--mint); border-color: var(--mint); color: var(--navy); box-shadow: 0 0 0 6px rgba(54,214,160,.18); }
  .pv-track small { display: block; font-weight: 500; font-size: 11px; color: var(--text-3); }
  @media (max-width: 480px) { .pv-track .s { font-size: 11px; } .pv-track .c { width: 38px; height: 38px; } .pv-track .s::before { top: 18px; inset-inline-start: calc(-50% + 21px); width: calc(100% - 42px); } }
  .pv-check { display: flex; gap: 12px; align-items: center; padding: 11px 0; border-bottom: 1px solid var(--line-2); width: 100%; text-align: start; font-size: 14px; }
  .pv-check:last-child { border-bottom: 0; }
  .pv-check .bx { width: 22px; height: 22px; border-radius: 7px; border: 2px solid #C9D5D0; display: grid; place-items: center; flex: none; color: transparent; transition: all .2s; }
  .pv-check .bx svg { width: 14px; height: 14px; }
  .pv-check.on .bx { background: var(--mint); border-color: var(--mint); color: var(--navy); }
  .pv-check.on span:last-child { color: var(--text-3); text-decoration: line-through; }
  .pv-photos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .pv-photos .media { aspect-ratio: 1; border-radius: 12px; }
  .pv-photos .cap { position: absolute; inset-inline-start: 8px; bottom: 8px; display: inline-flex; gap: 4px; align-items: center; font-size: 11px; font-weight: 600; background: rgba(255,255,255,.92); border-radius: 99px; padding: 3px 8px; }
  .pv-photos .cap svg { width: 12px; height: 12px; }
  .pv-lines { display: flex; flex-direction: column; gap: 8px; }
  .pv-line { display: grid; grid-template-columns: minmax(0, 1fr) 70px 110px; gap: 8px; }
  .pv-line .input { height: 42px; font-size: 14px; }
  .pv-line-h { display: grid; grid-template-columns: minmax(0, 1fr) 70px 110px; gap: 8px; font-size: 12px; font-weight: 600; color: var(--text-3); }
  @media (max-width: 480px) { .pv-line, .pv-line-h { grid-template-columns: minmax(0, 1fr) 54px 88px; gap: 6px; } }
  .pv-total { margin-top: 12px; border-radius: 14px; background: var(--surface-2); border: 1px solid var(--line-2); padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; font-size: 13.5px; }
  .pv-total div { display: flex; justify-content: space-between; gap: 12px; }
  .pv-total .g { font-family: var(--font-display); font-size: 20px; font-weight: 750; font-variant-numeric: tabular-nums; color: var(--ink); }
  .pv-days { margin-bottom: 16px; }
  .pv-day { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 62px; padding: 10px 8px; border-radius: 14px; border: 1px solid var(--line); background: #fff; font-size: 11.5px; color: var(--text-2); flex: none; position: relative; }
  .pv-day b { font-family: var(--font-display); font-size: 19px; color: var(--ink); font-variant-numeric: tabular-nums; }
  .pv-day i { width: 6px; height: 6px; border-radius: 50%; background: var(--mint); margin-top: 3px; }
  .pv-day i.none { background: transparent; }
  .pv-day.active { background: var(--navy); border-color: var(--navy); color: var(--navy-ink); }
  .pv-day.active b { color: #fff; }
  .pv-team { display: flex; gap: 12px; align-items: center; padding: 11px 0; border-bottom: 1px solid var(--line-2); }
  .pv-team:last-child { border-bottom: 0; padding-bottom: 0; }
  .pv-team:first-child { padding-top: 0; }
  .pv-team b { font-size: 14px; display: block; }
  .pv-team small { font-size: 12px; color: var(--text-2); }
  .pv-chiptog { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 13px; border-radius: 99px; border: 1px solid var(--line); background: #fff; font-size: 13px; font-weight: 550; color: var(--text-2); transition: all .2s; }
  .pv-chiptog svg { width: 15px; height: 15px; }
  .pv-chiptog.on { background: var(--mint-50); border-color: var(--mint); color: var(--mint-ink); }
  .pv-cover { position: relative; height: 150px; border-radius: var(--r-lg); overflow: hidden; border: 1px solid var(--line); }
  .pv-cover svg { width: 100%; height: 100%; }
  .pv-cohead { display: flex; gap: 16px; align-items: flex-end; margin-top: -40px; padding: 0 22px; position: relative; flex-wrap: wrap; }
  .pv-cohead .mk-logo { border: 4px solid var(--bg); }
  .pv-cohead h2 { font-size: 24px; font-weight: 750; }
  .pv-cohead .grow { padding-bottom: 4px; min-width: min(100%, 240px); }
  @media (max-width: 640px) { .pv-cover { height: 110px; } .pv-cohead { padding: 0 6px; margin-top: -32px; } .pv-cohead h2 { font-size: 20px; } .pv-cohead .mk-logo.xl { width: 66px; height: 66px; font-size: 20px; } }
  .pv-earn { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
  .pv-earn b { font-family: var(--font-display); font-size: 28px; font-weight: 750; font-variant-numeric: tabular-nums; }
  `);

  /* ---------------- shared bits ---------------- */
  const rqRow = (r) => {
    const b = D.building(r.bid);
    const q = quoteOf(r.id);
    return `<button class="pv-rq" data-go="provider-request-${r.id}"><span class="ic">${icon(D.cat(r.cat).icon)}</span><span class="bd">
      <span class="tp"><b>${esc(tx(r.title))}</b>${ui.status(STAT[r.status] || r.status)}</span>
      <span class="sb">${esc(where(r.bid, r.unit))} · ${esc(tx(D.district(b.district).name))}</span>
      <span class="mt"><span>${icon('user')}${esc(D.pname(r.by))}</span><span>${icon('clock')}${B.ago(r.created)}</span>${r.pref ? `<span>${icon('calendar')}${B.dateShort(r.pref.date)} · ${slotL(r.pref.slot)}</span>` : ''}${r.priority === 'high' ? `<span style="color:var(--bad)">${icon('alert')}${L('Urgent', 'عاجل')}</span>` : ''}${q ? `<span>${icon('receipt')}${B.money(q.amount)}</span>` : ''}${r.fromMkt ? `<span style="color:var(--mint-ink)">${icon('sparkles')}${L('Via marketplace', 'عبر السوق')}</span>` : ''}</span>
    </span></button>`;
  };
  const schedRow = (j) => {
    const now = j.status === 'enroute' || (j.status === 'inProgress' && j.date === '2026-11-25');
    return `<button class="pv-sched ${now ? 'now' : ''}" data-go="provider-job-${j.id}"><span class="tm"><b>${j.time}</b><small>${j.date === '2026-11-25' ? L('Today', 'اليوم') : B.dateShort(j.date)}</small></span>
      <span class="bd"><b>${esc(tx(j.title))}</b><span>${esc(where(j.bid, j.unit))}</span><span>${esc(tx(tech(j.tech).name))} · ${esc(D.pname(j.by))}</span><span class="pv-m-st">${ui.status(j.status)}</span></span>${ui.status(j.status, 'pv-d-st')}</button>`;
  };
  const customerCard = (pid, revealed) => {
    const p = D.person(pid);
    const phone = p.phone || '+970 59 000 0000';
    return ui.card({ title: L('Customer', 'العميل'), body: `<div class="row">${ui.avatar(p.name, 'lg')}<div class="grow"><b style="display:block">${esc(tx(p.name))}</b><span class="xs muted">${esc(custRole(pid))} · ${L('BENA identity verified', 'هوية بينا موثّقة')}</span></div></div>
      <div style="margin-top:12px">${ui.kv([[L('Phone', 'الهاتف'), `<span class="ltr">${revealed ? esc(phone) : esc(phone.slice(0, 8)) + ' ••• ••' + esc(phone.slice(-2))}</span>`], [L('Jobs with you', 'مهام سابقة معك'), JOBS.filter((j) => j.by === pid && j.status === 'completed').length]])}</div>
      ${revealed ? '' : `<div class="xs faint" style="margin-top:8px">${L('Full number is shared once the customer accepts your quote.', 'يُشارك الرقم كاملاً بعد قبول العميل لعرضك.')}</div>`}
      <div class="row-sm" style="margin-top:12px">${ui.btn(L('Message', 'مراسلة'), { icon: 'chat', size: 'sm', act: 'soon', arg: L('Messaging', 'المراسلة') })}${revealed ? ui.btn(L('Call', 'اتصال'), { icon: 'phone', size: 'sm', act: 'soon', arg: L('Calling', 'الاتصال') }) : ''}</div>` });
  };
  const buildingCard = (bid, unit, extra = '') => {
    const b = D.building(bid);
    const u = unit && D.unit(unit);
    return ui.card({ title: L('Building & unit', 'المبنى والوحدة'), sub: L('From the building’s BENA identity', 'من هوية المبنى في بينا'), body: `<div class="row" style="margin-bottom:12px"><span class="li-icon navy">${icon('building')}</span><div class="grow"><b style="display:block">${esc(tx(b.name))}</b><span class="xs muted">${esc(tx(b.address))}</span></div></div>
      ${ui.kv([
        [L('BENA ID', 'رقم بينا'), ui.idMono(b.id)],
        [L('Unit / area', 'الوحدة / المنطقة'), u ? `${esc(D.unitLabel(u))} · ${L('floor', 'الطابق')} ${u.floor} · ${u.area} ${L('m²', 'م²')}` : L('Common areas', 'المناطق المشتركة')],
        [L('Building', 'المبنى'), `${esc(D.typeLabel(b.type))} · ${b.floors} ${L('floors', 'طوابق')} · ${b.year}`],
        [L('Elevator access', 'المصعد'), b.elevators ? L(`Yes (${b.elevators})`, `نعم (${b.elevators})`) : L('No — stairs only', 'لا — درج فقط')],
        D.committeeOf(b.id) ? [L('Building contact', 'جهة المبنى'), esc(tx(D.committeeOf(b.id).name))] : null,
      ])}${extra}
      <div style="margin-top:14px">${B.map.render({ id: 'pv-mini-' + bid, static: true, selected: bid, focus: bid, focusW: 240, height: '180px', legend: false, badge: false })}</div>
      <div class="row-sm" style="margin-top:12px">${ui.btn(L('Building profile', 'ملف المبنى'), { icon: 'building', size: 'sm', go: `provider-building-${bid}` })}${ui.btn(L('Directions', 'الاتجاهات'), { icon: 'route', size: 'sm', act: 'soon', arg: L('Navigation', 'الملاحة') })}</div>` });
  };
  const earnings = { labels: [5, 6, 7, 8, 9, 10].map((m) => B.mon(m)), values: [38200, 41500, 36900, 44100, 47300, 31840] };

  /* ---------------- pages ---------------- */
  const home = () => {
    const p = P();
    const today = JOBS.filter((j) => j.date === '2026-11-25' && j.status !== 'completed').sort(B.by('time'));
    const fresh = reqs().filter((r) => r.status === 'new');
    const open = QUOTES.filter((q) => q.status === 'sent');
    const d = M.dist(PID);
    const tot = B.sum(d);
    return `<div class="pv-hello"><div><div class="eyebrow">${L('Wednesday, 25 November', 'الأربعاء، 25 تشرين الثاني')}</div><h1>${L('Good morning, Yousef', 'صباح الخير يا يوسف')}</h1><p>${L(`${today.length} visits today · ${fresh.length} new requests waiting for a quote`, `${today.length} زيارات اليوم · ${fresh.length} طلبات جديدة بانتظار التسعير`)}</p></div>
      <div class="row-sm">${ui.btn(L('Public profile', 'الملف العام'), { icon: 'eye', go: `provider-provider-${PID}` })}${ui.btn(L('Review requests', 'مراجعة الطلبات'), { kind: 'primary', icon: 'inbox', go: 'provider-requests' })}</div></div>
      <div class="grid g4">
        ${ui.kpi({ label: L('New requests', 'طلبات جديدة'), value: fresh.length, icon: 'inbox', tone: 'mint', foot: L('Avg. response 1 h 50 min', 'متوسط الرد ساعة و50 دقيقة'), go: 'provider-requests' })}
        ${ui.kpi({ label: L('Open quotations', 'عروض مفتوحة'), value: open.length, icon: 'receipt', tone: 'violet', foot: B.money(B.sum(open, (q) => q.amount)) + ' ' + L('pending', 'معلّقة'), go: 'provider-quotations' })}
        ${ui.kpi({ label: L('Jobs today', 'مهام اليوم'), value: today.length, icon: 'calendarCheck', tone: 'info', foot: L(`${TEAM.filter((t) => t.status === 'onjob').length} technicians on site`, `${TEAM.filter((t) => t.status === 'onjob').length} فنيين في المواقع`), go: 'provider-jobs' })}
        ${ui.kpi({ label: L('Completed this month', 'منجزة هذا الشهر'), value: 23, icon: 'checkCircle', tone: 'warn', delta: '+12%', dir: 'up', foot: L('vs October', 'مقارنة بتشرين الأول'), go: 'provider-completed' })}
      </div>
      <div class="grid g-main" style="margin-top:16px;align-items:start">
        <div class="stack">
          ${ui.card({ title: L('Today’s schedule', 'جدول اليوم'), sub: L('Tap a visit to update its status', 'اضغط على زيارة لتحديث حالتها'), link: { label: L('All jobs', 'كل المهام'), go: 'provider-jobs' }, body: today.length ? today.map(schedRow).join('') : ui.empty({ icon: 'calendar', title: L('No visits today', 'لا زيارات اليوم') }) })}
          ${ui.card({ title: L('Earnings', 'الإيرادات'), sub: L('Last 6 months · paid through BENA', 'آخر 6 أشهر · مدفوعة عبر بينا'), headExtra: ui.badge(L('November to date', 'تشرين الثاني حتى الآن'), 'neutral'), body: `<div class="pv-earn"><b>${B.money(earnings.values[5])}</b><span class="delta up">${icon('arrowUp')}${L('on track', 'على المسار')}</span><span class="xs faint">${L('October', 'تشرين الأول')}: ${B.money(earnings.values[4])}</span></div>${B.charts.bars({ labels: earnings.labels, data: earnings.values.map((v, i) => ({ label: earnings.labels[i], value: v, color: i === 5 ? '#36D6A0' : '#142B3B' })), height: 190, format: (v) => '₪' + B.compact(v) })}` })}
        </div>
        <div class="stack">
          ${ui.card({ title: L('Your rating', 'تقييمك'), link: { label: L('Feedback', 'الآراء'), go: 'provider-feedback' }, body: `<div class="row" style="gap:18px">${B.charts.ring((p.rating / 5) * 100, { size: 84, label: B.num1(p.rating) })}<div class="grow"><div>${ui.stars(p.rating)}</div><div class="small muted" style="margin-top:4px">${L(`${p.reviews} reviews · top 5% in Ramallah`, `${p.reviews} مراجعة · ضمن أفضل 5% في رام الله`)}</div></div></div>
            <div class="mk-dist" style="margin-top:16px">${d.map((n, i) => `<div class="r"><span>${5 - i}★</span><span class="tr"><i style="width:${(n / tot) * 100}%"></i></span><em>${n}</em></div>`).join('')}</div>` })}
          ${ui.card({ title: L('New requests', 'طلبات جديدة'), link: { label: L('View all', 'عرض الكل'), go: 'provider-requests' }, body: `<div class="pv-flush">${fresh.slice(0, 3).map(rqRow).join('')}</div>` })}
          ${ui.callout(L(`<b>Verified provider.</b> Your licence and insurance are valid until 2027. Keep certifications current to stay featured in the marketplace.`, `<b>مزوّد موثّق.</b> رخصتك وتأمينك ساريان حتى 2027. حافظ على تحديث الشهادات للبقاء ضمن المميزين في السوق.`), 'mint', 'badgeCheck')}
        </div>
      </div>`;
  };

  const requests = () => {
    const f = B.get('pv:rf', 'new');
    const cat = B.get('pv:rc', '');
    const q = B.get('pv:rq', '');
    const all = reqs();
    const counts = { new: 0, quoted: 0, closed: 0 };
    all.forEach((r) => { if (r.status === 'new') counts.new++; else if (r.status === 'quoted') counts.quoted++; else counts.closed++; });
    const list = all.filter((r) => (f === 'all' || (f === 'closed' ? ['declined', 'lost', 'expired', 'won'].includes(r.status) : r.status === f)) && (!cat || r.cat === cat) && B.match(q, r.title, r.id, D.building(r.bid)?.name, D.pname(r.by)));
    return `${ui.pageHead({ title: L('Incoming requests', 'الطلبات الواردة'), sub: L('Requests from buildings in your coverage area. Quote fast — customers usually decide within 48 hours.', 'طلبات من مبانٍ ضمن نطاق خدمتك. سعّر بسرعة — يقرر العملاء عادةً خلال 48 ساعة.') })}
      <div class="toolbar">${ui.search('pv:rq', L('Search by title, building, customer or ID', 'ابحث بالعنوان أو المبنى أو العميل أو الرقم'))}${ui.select('pv:rc', [{ v: '', l: L('All categories', 'كل الفئات') }].concat(P().cats.map((c) => ({ v: c, l: D.cat(c).name }))), { label: L('Category', 'الفئة'), def: '' })}</div>
      <div style="margin-bottom:14px">${ui.chips('pv:rf', [{ id: 'new', label: L('Awaiting quote', 'بانتظار التسعير'), count: counts.new }, { id: 'quoted', label: L('Quoted', 'تم التسعير'), count: counts.quoted }, { id: 'closed', label: L('Closed', 'مغلقة'), count: counts.closed }, { id: 'all', label: L('All', 'الكل'), count: all.length }], f)}</div>
      ${list.length ? `<div class="card pad-0">${list.map(rqRow).join('')}</div>` : `<div class="card">${ui.empty({ icon: 'inbox', title: L('No requests here', 'لا توجد طلبات هنا'), text: L('New requests from your coverage area will appear automatically.', 'ستظهر الطلبات الجديدة من نطاق خدمتك تلقائياً.') })}</div>`}`;
  };

  const request = (id) => {
    const r = req(id);
    B.navActive('requests');
    if (!r) return ui.empty({ icon: 'search', title: L('Request not found', 'لم يتم العثور على الطلب'), action: ui.btn(L('Back to requests', 'العودة للطلبات'), { kind: 'primary', go: 'provider-requests' }) });
    B.title(tx(r.title));
    const q = quoteOf(r.id);
    const c = D.cat(r.cat);
    const photos = r.photos ? `<div class="pv-photos" style="margin-top:16px">${Array.from({ length: Math.min(3, r.photos) }, (_, i) => `<div class="media">${B.art.interior(B.mkt.hash(r.id) % 50 + i * 7)}<span class="cap">${icon('camera')}${L(`Photo ${i + 1}`, `صورة ${i + 1}`)}</span></div>`).join('')}</div><div class="xs faint" style="margin-top:6px">${L('Customer photos (illustrations in the demo)', 'صور العميل (رسوم توضيحية في النسخة التجريبية)')}</div>` : `<div class="callout dashed small" style="margin-top:16px">${icon('camera')}<div>${L('No photos attached. You can ask the customer for photos before quoting.', 'لا توجد صور مرفقة. يمكنك طلب صور من العميل قبل التسعير.')}</div></div>`;
    const actions = r.status === 'new'
      ? `${ui.btn(L('Submit quotation', 'تقديم عرض سعر'), { kind: 'primary', block: true, size: 'lg', icon: 'receipt', act: 'pvQuote', arg: r.id })}<div style="height:8px"></div><div class="row-sm">${ui.btn(L('Ask for photos', 'طلب صور'), { icon: 'camera', act: 'toast', arg: L('Photo request sent to the customer', 'تم إرسال طلب الصور للعميل') })}${ui.btn(L('Decline', 'اعتذار'), { kind: 'danger', icon: 'xCircle', act: 'pvDecline', arg: r.id })}</div>`
      : q ? `${ui.kv([[L('Quote', 'العرض'), `${ui.idMono(q.id)}`], [L('Amount', 'المبلغ'), `<b>${B.money(q.amount)}</b>`], [L('Sent', 'أُرسل'), B.date(q.sent)], [L('Valid until', 'ساري حتى'), B.date(q.valid)], [L('Status', 'الحالة'), ui.status(q.status === 'sent' ? 'quoteSent' : q.status)]])}${q.status === 'sent' ? `<div style="margin-top:12px" class="row-sm">${ui.btn(L('Revise quote', 'تعديل العرض'), { icon: 'edit', act: 'pvQuote', arg: r.id })}${ui.btn(L('Withdraw', 'سحب'), { kind: 'danger', act: 'pvWithdraw', arg: r.id })}</div>` : ''}`
      : r.status === 'won' ? `${ui.callout(`<b>${L('The customer accepted.', 'وافق العميل.')}</b> ${L('A job was created in your schedule.', 'تم إنشاء مهمة في جدولك.')}`, 'mint', 'checkCircle')}<div style="margin-top:12px">${ui.btn(L('Open job', 'فتح المهمة'), { kind: 'primary', block: true, go: `provider-job-${r.id}` })}</div>`
      : r.status === 'lost' ? ui.callout(L('The customer chose another provider.', 'اختار العميل مزوّداً آخر.'), 'dashed', 'info')
      : r.status === 'declined' ? ui.callout(`<b>${L('You declined this request.', 'اعتذرت عن هذا الطلب.')}</b> ${esc(tx(r.reason || T('No reason given', 'دون سبب')))}`, 'dashed', 'xCircle') : '';
    return `<button class="btn btn-text" style="padding:0;margin:4px 0 12px" data-go="provider-requests">${icon('arrowLeft', 'flip')}<span>${L('Incoming requests', 'الطلبات الواردة')}</span></button>
      <div class="page-head" style="padding-top:0"><div class="grow"><div class="row-sm wrap" style="margin-bottom:8px">${ui.idMono(r.id)}${ui.status(STAT[r.status] || r.status)}${r.priority === 'high' ? ui.status('high') : ''}${r.fromMkt ? ui.badge(L('Via marketplace', 'عبر السوق'), 'mint', 'sparkles') : ''}</div><h1>${esc(tx(r.title))}</h1><p>${esc(where(r.bid, r.unit))} · ${L('Received', 'وصل')} ${B.ago(r.created)}</p></div></div>
      <div class="grid g-main" style="align-items:start">
        <div class="stack">
          ${ui.card({ title: L('Request details', 'تفاصيل الطلب'), body: `<div class="row-sm wrap" style="margin-bottom:12px">${M.catChip(r.cat)}${r.pref ? `<span class="mk-tag">${icon('calendar')}${B.date(r.pref.date)} · ${slotL(r.pref.slot)}</span>` : ''}</div><p style="font-size:14.5px;line-height:1.6">${esc(tx(r.desc))}</p>${photos}` })}
          ${buildingCard(r.bid, r.unit)}
        </div>
        <div class="stack">
          ${ui.card({ title: r.status === 'new' ? L('Respond', 'الرد') : L('Your quotation', 'عرضك'), body: actions || ui.empty({ icon: 'receipt', title: L('No quote', 'لا يوجد عرض') }) })}
          ${customerCard(r.by, false)}
          ${ui.card({ title: L('Similar jobs you did', 'مهام مشابهة أنجزتها'), body: ui.list(JOBS.filter((j) => j.cat === r.cat && j.status === 'completed').slice(0, 3).map((j) => ui.li({ icon: c.icon, tone: 'mint', title: tx(j.title), sub: `${B.money(j.amount)} · ${B.dateShort(j.closed)}`, go: `provider-job-${j.id}` }))) })}
        </div>
      </div>`;
  };

  const quotations = () => {
    const f = B.get('pv:qf', 'sent');
    const rows = QUOTES.filter((q) => q.status === f).map((q) => ({ ...q, r: req(q.req) || job(q.req) }));
    const decided = QUOTES.filter((q) => ['accepted', 'declined'].includes(q.status));
    const win = decided.length ? Math.round((QUOTES.filter((q) => q.status === 'accepted').length / decided.length) * 100) : 0;
    return `${ui.pageHead({ title: L('Quotations', 'عروض الأسعار'), sub: L('Every quote you’ve sent through BENA and what happened to it.', 'كل العروض التي أرسلتها عبر بينا وما آلت إليه.'), actions: ui.btn(L('Quote a new request', 'سعّر طلباً جديداً'), { kind: 'primary', icon: 'plus', go: 'provider-requests' }) })}
      <div class="grid g4" style="margin-bottom:18px">
        ${ui.kpi({ label: L('Awaiting customer', 'بانتظار العميل'), value: QUOTES.filter((q) => q.status === 'sent').length, icon: 'clock', tone: 'violet' })}
        ${ui.kpi({ label: L('Pending value', 'القيمة المعلّقة'), value: B.money(B.sum(QUOTES.filter((q) => q.status === 'sent'), (q) => q.amount)), icon: 'wallet', tone: 'mint' })}
        ${ui.kpi({ label: L('Win rate (90 days)', 'نسبة الفوز (90 يوماً)'), value: win + '%', icon: 'trend', tone: 'info', spark: [54, 61, 58, 66, 70, win] })}
        ${ui.kpi({ label: L('Avg. quote', 'متوسط العرض'), value: B.money(B.sum(QUOTES, (q) => q.amount) / QUOTES.length), icon: 'receipt', tone: 'warn' })}
      </div>
      ${ui.tabs('pv:qf', [['sent', L('Sent', 'مُرسلة')], ['accepted', L('Accepted', 'مقبولة')], ['declined', L('Declined', 'مرفوضة')], ['expired', L('Expired', 'منتهية')]].map(([id, label]) => ({ id, label, count: QUOTES.filter((q) => q.status === id).length })), f)}
      ${ui.table({ id: 'pv-quotes', rows, rowGo: (q) => (job(q.req) ? `provider-job-${q.req}` : `provider-request-${q.req}`),
        cols: [
          { key: 'id', label: L('Quote', 'العرض'), render: (q) => ui.idMono(q.id), m: 'meta' },
          { key: 'title', label: L('Request', 'الطلب'), m: 'title', render: (q) => `<div class="cell-main"><span class="li-icon mint" style="width:34px;height:34px">${icon(D.cat(q.r.cat).icon)}</span><div style="min-width:0"><b>${esc(tx(q.r.title))}</b><small>${esc(where(q.r.bid, q.r.unit))}</small></div></div>`, mRender: (q) => esc(tx(q.r.title)) },
          { key: 'cust', label: L('Customer', 'العميل'), render: (q) => esc(D.pname(q.r.by)), m: 'sub' },
          { key: 'sent', label: L('Sent', 'أُرسل'), render: (q) => B.dateShort(q.sent), sort: (q) => q.sent, m: 'meta' },
          { key: 'valid', label: f === 'sent' ? L('Valid until', 'ساري حتى') : L('Status', 'الحالة'), render: (q) => (f === 'sent' ? `${B.dateShort(q.valid)} <span class="xs faint">· ${B.inDays(q.valid)}</span>` : ui.status(q.status)), m: 'meta' },
          { key: 'amount', label: L('Amount', 'المبلغ'), align: 'end', render: (q) => `<b class="num">${B.money(q.amount)}</b>`, sort: (q) => q.amount, m: 'end' },
        ], empty: { icon: 'receipt', title: L('No quotations in this tab', 'لا توجد عروض في هذا التبويب') } })}`;
  };

  const jobs = () => {
    const days = [];
    for (let i = 0; days.length < 7; i++) { const d = new Date(2026, 10, 25 + i); if (d.getDay() !== 5) days.push(d.toISOString().slice(0, 10)); }
    const sel = B.get('pv:jd', '2026-11-25');
    const active = JOBS.filter((j) => j.status !== 'completed');
    const list = (sel === 'all' ? active : JOBS.filter((j) => j.date === sel)).sort(B.by((j) => j.date + j.time));
    return `${ui.pageHead({ title: L('Assigned jobs', 'المهام المسندة'), sub: L('Your team’s schedule. Update status on site — customers see it live in BENA.', 'جدول فريقك. حدّث الحالة من الموقع — يراها العملاء مباشرة في بينا.'), actions: ui.btn(L('Calendar export', 'تصدير التقويم'), { icon: 'calendar', act: 'soon', arg: L('Calendar export', 'تصدير التقويم') }) })}
      <div class="chips pv-days">${days.map((d) => { const x = new Date(d + 'T12:00'); const n = JOBS.filter((j) => j.date === d && j.status !== 'completed').length; return `<button class="pv-day ${sel === d ? 'active' : ''}" data-act="set" data-arg="pv:jd=${d}"><span>${d === '2026-11-25' ? L('Today', 'اليوم') : B.dow(x.getDay())}</span><b>${x.getDate()}</b><i class="${n ? '' : 'none'}"></i></button>`; }).join('')}<button class="pv-day ${sel === 'all' ? 'active' : ''}" data-act="set" data-arg="pv:jd=all"><span>${L('All', 'الكل')}</span><b>${active.length}</b><i class="none"></i></button></div>
      <div class="grid g-main" style="align-items:start">
        ${ui.card({ title: sel === 'all' ? L('All upcoming visits', 'كل الزيارات القادمة') : B.date(sel), sub: L(`${list.length} visit${list.length === 1 ? '' : 's'}`, `${list.length} زيارات`), body: list.length ? list.map(schedRow).join('') : ui.empty({ icon: 'calendar', title: L('Nothing scheduled', 'لا يوجد شيء مجدول'), text: L('Accepted quotes become jobs here.', 'تتحول العروض المقبولة إلى مهام هنا.') }) })}
        <div class="stack">
          ${ui.card({ title: L('Team today', 'الفريق اليوم'), body: TEAM.map((t) => `<div class="pv-team">${ui.avatar(t.name)}<div class="grow"><b>${esc(tx(t.name))}</b><small>${esc(tx(t.role))}</small></div>${ui.badge(t.status === 'onjob' ? L('On a job', 'في مهمة') : t.status === 'office' ? L('Office', 'المكتب') : L('Available', 'متاح'), t.status === 'onjob' ? 'violet' : t.status === 'office' ? 'neutral' : 'ok')}</div>`).join('') })}
          ${ui.callout(L('Status updates notify the customer and, for common areas, the building committee or manager.', 'تحديثات الحالة تُشعر العميل، وللمناطق المشتركة لجنة المبنى أو مديره.'), '', 'bell')}
        </div>
      </div>`;
  };

  const jobPage = (id) => {
    const j = job(id);
    B.navActive(j && j.status === 'completed' ? 'completed' : 'jobs');
    if (!j) return ui.empty({ icon: 'search', title: L('Job not found', 'لم يتم العثور على المهمة'), action: ui.btn(L('Back to jobs', 'العودة للمهام'), { kind: 'primary', go: 'provider-jobs' }) });
    B.title(tx(j.title));
    const si = STAGES.indexOf(j.status);
    const steps = [[L('Scheduled', 'مُجدولة'), 'calendar', `${B.dateShort(j.date)} ${j.time}`], [L('En route', 'في الطريق'), 'truck', j.enrouteAt || ''], [L('In progress', 'قيد التنفيذ'), 'wrench', j.startedAt || ''], [L('Completed', 'مكتملة'), 'checkCircle', j.closed ? B.dateShort(j.closed) : '']];
    const nextBtn = {
      scheduled: ui.btn(L('Start trip', 'بدء التوجّه'), { kind: 'primary', size: 'lg', icon: 'truck', act: 'pvStatus', arg: `${j.id}|enroute` }),
      enroute: ui.btn(L('Arrived — start work', 'وصلت — بدء العمل'), { kind: 'primary', size: 'lg', icon: 'wrench', act: 'pvStatus', arg: `${j.id}|inProgress` }),
      inProgress: ui.btn(L('Complete job', 'إنهاء المهمة'), { kind: 'primary', size: 'lg', icon: 'checkCircle', act: 'pvComplete', arg: j.id }),
      completed: ui.btn(L('View invoice', 'عرض الفاتورة'), { kind: 'dark', size: 'lg', icon: 'receipt', act: 'pvInvoice', arg: j.id }),
    }[j.status];
    const checks = CHECK[j.cat] || CHECK.general;
    const done = j.check.filter(Boolean).length;
    return `<button class="btn btn-text" style="padding:0;margin:4px 0 12px" data-go="provider-${j.status === 'completed' ? 'completed' : 'jobs'}">${icon('arrowLeft', 'flip')}<span>${j.status === 'completed' ? L('Completed work', 'الأعمال المنجزة') : L('Assigned jobs', 'المهام المسندة')}</span></button>
      <div class="page-head" style="padding-top:0"><div class="grow"><div class="row-sm wrap" style="margin-bottom:8px">${ui.idMono(j.id)}${ui.status(j.status)}${M.catChip(j.cat)}</div><h1>${esc(tx(j.title))}</h1><p>${esc(where(j.bid, j.unit))} · ${B.date(j.date)} ${j.time}</p></div></div>
      ${ui.card({ body: `<div class="pv-track">${steps.map(([l, ic, sub], i) => `<div class="s ${i < si || j.status === 'completed' ? 'done' : i === si ? 'cur' : ''}"><span class="c">${icon(i < si || j.status === 'completed' ? 'check' : ic)}</span><span>${l}<small>${sub || '&nbsp;'}</small></span></div>`).join('')}</div>
        <div class="row between wrap" style="margin-top:20px;gap:10px"><span class="small muted">${j.status === 'completed' ? L('Job closed and invoiced through BENA.', 'أُغلقت المهمة وصدرت فاتورتها عبر بينا.') : L('The customer is notified at every step.', 'يتم إشعار العميل في كل خطوة.')}</span><div class="row-sm wrap">${j.status !== 'completed' ? ui.btn(L('Reschedule', 'إعادة جدولة'), { icon: 'calendar', act: 'pvReschedule', arg: j.id }) : ''}${nextBtn}</div></div>` })}
      <div class="grid g-main" style="margin-top:16px;align-items:start">
        <div class="stack">
          ${ui.card({ title: L('Checklist', 'قائمة التحقق'), sub: L(`${done} of ${checks.length} done`, `${done} من ${checks.length} منجزة`), headExtra: B.charts.ring((done / checks.length) * 100, { size: 44 }), body: checks.map((c, i) => `<button class="pv-check ${j.check[i] ? 'on' : ''}" data-act="pvCheck" data-arg="${j.id}|${i}" ${j.status === 'completed' ? 'disabled' : ''}><span class="bx">${icon('check')}</span><span>${tx(c)}</span></button>`).join('') })}
          ${ui.card({ title: L('Job notes', 'ملاحظات المهمة'), sub: L('Visible to your team; summary is shared in the completion report', 'مرئية لفريقك؛ يُشارك الملخص في تقرير الإنجاز'), body: `<textarea class="textarea" id="pv-notes-${j.id}" placeholder="${esc(L('Parts used, findings, follow-ups…', 'القطع المستخدمة، الملاحظات، المتابعات…'))}">${esc(tx(j.notes))}</textarea><div class="row between" style="margin-top:10px"><span class="xs faint">${j.notesSaved ? L('Saved', 'تم الحفظ') : ''}</span>${ui.btn(L('Save notes', 'حفظ الملاحظات'), { size: 'sm', icon: 'check', act: 'pvNotes', arg: j.id })}</div>` })}
          ${j.report ? ui.card({ title: L('Completion report', 'تقرير الإنجاز'), body: ui.kv([[L('Work done', 'العمل المنجز'), esc(j.report.summary)], [L('Time on site', 'الوقت في الموقع'), esc(j.report.time)], [L('Parts', 'القطع'), esc(j.report.parts || '—')], [L('Final amount', 'المبلغ النهائي'), B.money(j.amount)]]) }) : ''}
          ${buildingCard(j.bid, j.unit)}
        </div>
        <div class="stack">
          ${ui.card({ title: L('Visit', 'الزيارة'), body: ui.kv([[L('Date', 'التاريخ'), B.date(j.date)], [L('Time', 'الوقت'), j.time], [L('Technician', 'الفني'), esc(tx(tech(j.tech).name))], [L('Agreed price', 'السعر المتفق عليه'), `<b>${B.money(j.amount)}</b>`], j.rating ? [L('Customer rating', 'تقييم العميل'), ui.stars(j.rating)] : null]) })}
          ${customerCard(j.by, true)}
          ${j.desc ? ui.card({ title: L('Original request', 'الطلب الأصلي'), body: `<p class="small" style="line-height:1.6">${esc(tx(j.desc))}</p>` }) : ''}
        </div>
      </div>`;
  };

  const completed = () => {
    const rows = JOBS.filter((j) => j.status === 'completed').sort(B.by('closed', -1));
    const rated = rows.filter((j) => j.rating);
    return `${ui.pageHead({ title: L('Completed work', 'الأعمال المنجزة'), sub: L('Closed jobs, invoices and customer ratings.', 'المهام المغلقة والفواتير وتقييمات العملاء.'), actions: ui.btn(L('Export statement', 'تصدير كشف'), { icon: 'download', act: 'soon', arg: L('Statement export', 'تصدير الكشف') }) })}
      <div class="grid g4" style="margin-bottom:18px">
        ${ui.kpi({ label: L('Jobs this month', 'مهام هذا الشهر'), value: 23, icon: 'checkCircle', tone: 'mint', delta: '+12%' })}
        ${ui.kpi({ label: L('Earned this month', 'إيرادات هذا الشهر'), value: B.money(earnings.values[5]), icon: 'wallet', tone: 'info' })}
        ${ui.kpi({ label: L('Avg. job rating', 'متوسط تقييم المهام'), value: B.num1(B.sum(rated, (j) => j.rating) / (rated.length || 1)), unit: '/ 5', icon: 'star', tone: 'warn' })}
        ${ui.kpi({ label: L('Repeat customers', 'عملاء متكررون'), value: '64%', icon: 'refresh', tone: 'violet' })}
      </div>
      ${ui.table({ id: 'pv-done', rows, rowGo: (j) => `provider-job-${j.id}`, pageSize: 8, defaultSort: '-closed',
        cols: [
          { key: 'closed', label: L('Date', 'التاريخ'), render: (j) => B.dateShort(j.closed), sort: (j) => j.closed, m: 'meta' },
          { key: 'title', label: L('Job', 'المهمة'), m: 'title', render: (j) => `<div class="cell-main"><span class="li-icon mint" style="width:34px;height:34px">${icon(D.cat(j.cat).icon)}</span><div style="min-width:0"><b>${esc(tx(j.title))}</b><small>${ui.idMono(j.id)}</small></div></div>`, mRender: (j) => esc(tx(j.title)) },
          { key: 'where', label: L('Location', 'الموقع'), render: (j) => esc(where(j.bid, j.unit)), m: 'sub' },
          { key: 'cust', label: L('Customer', 'العميل'), render: (j) => esc(D.pname(j.by)), m: 'meta' },
          { key: 'rating', label: L('Rating', 'التقييم'), render: (j) => (j.rating ? ui.stars(j.rating) : `<span class="xs faint">${L('Awaiting', 'بانتظار')}</span>`), sort: (j) => j.rating || 0, m: 'meta' },
          { key: 'amount', label: L('Amount', 'المبلغ'), align: 'end', render: (j) => `<b class="num">${B.money(j.amount)}</b>`, sort: (j) => j.amount, m: 'end' },
        ] })}
      <div style="margin-top:12px">${ui.demoNote(L('Showing recent jobs recorded in the demo; monthly totals include jobs not listed.', 'تُعرض المهام الأخيرة المسجلة في النسخة التجريبية؛ تشمل المجاميع الشهرية مهام غير مدرجة.'))}</div>`;
  };

  const feedback = () => {
    const p = P();
    const f = B.get('pv:ff', 'all');
    const all = M.reviews(PID);
    const hasReply = (r) => !!(M.replies[r.id] || r.reply);
    const list = all.filter((r) => f === 'all' || (f === 'reply' ? !hasReply(r) : f === 'top' ? r.stars === 5 : r.stars <= 3)).sort(B.by('date', -1));
    const d = M.dist(PID);
    return `${ui.pageHead({ title: L('Customer feedback', 'آراء العملاء'), sub: L('Reviews are written by verified BENA customers after a completed job.', 'يكتب المراجعات عملاء موثّقون في بينا بعد إنجاز المهمة.'), actions: ui.btn(L('View public profile', 'عرض الملف العام'), { icon: 'eye', go: `provider-provider-${PID}` }) })}
      <div class="grid g-main" style="align-items:start">
        <div class="stack">
          ${ui.card({ body: M.distBlock(PID) })}
          <div>${ui.chips('pv:ff', [{ id: 'all', label: L('All', 'الكل'), count: all.length }, { id: 'reply', label: L('Needs reply', 'بحاجة لرد'), count: all.filter((r) => !hasReply(r)).length }, { id: 'top', label: '5★', count: all.filter((r) => r.stars === 5).length }, { id: 'low', label: L('3★ and below', '3★ فأقل'), count: all.filter((r) => r.stars <= 3).length }], f)}</div>
          ${ui.card({ body: list.length ? list.map((r) => M.reviewItem(r, hasReply(r) ? ui.status('replied') : ui.btn(L('Reply', 'رد'), { size: 'sm', kind: 'soft', icon: 'chat', act: 'pvReply', arg: r.id }))).join('') : ui.empty({ icon: 'chat', title: L('Nothing to show', 'لا يوجد ما يُعرض'), text: L('All caught up.', 'لا توجد مراجعات معلّقة.') }) })}
        </div>
        <div class="stack">
          ${ui.card({ title: L('Rating breakdown', 'تفصيل التقييم'), body: `<div class="stack-sm">${[[L('Punctuality', 'الالتزام بالموعد'), 4.7], [L('Quality of work', 'جودة العمل'), 4.9], [L('Communication', 'التواصل'), 4.8], [L('Value for money', 'القيمة مقابل السعر'), 4.6], [L('Cleanliness', 'النظافة'), 4.9]].map(([l, v]) => ui.meter(l, B.num1(v), (v / 5) * 100)).join('')}</div>` })}
          ${ui.card({ title: L('Rating trend', 'اتجاه التقييم'), sub: L('Monthly average', 'المتوسط الشهري'), body: B.charts.line({ labels: earnings.labels, series: [{ name: L('Rating', 'التقييم'), values: [4.6, 4.7, 4.7, 4.8, 4.8, 4.8], color: '#36D6A0', area: true }], min: 4, height: 160, format: (v) => B.num1(v) }) })}
          ${ui.card({ title: L('Reviews by stars', 'المراجعات حسب النجوم'), body: B.charts.hbars({ data: d.map((n, i) => ({ label: `${5 - i}★`, value: n, color: i === 0 ? '#36D6A0' : i < 2 ? '#142B3B' : '#C9D6DF' })), max: d[0] }) })}
          ${ui.callout(L('Tip: replying within 48 hours improves your marketplace ranking.', 'نصيحة: الرد خلال 48 ساعة يحسّن ترتيبك في السوق.'), 'mint', 'sparkles')}
        </div>
      </div>`;
  };

  const profile = () => {
    const p = P();
    const covered = new Set(D.buildings.filter((b) => p.areas.includes(b.district)).map((b) => b.id));
    return `<div class="pv-cover">${M.cover(p, 150)}</div>
      <div class="pv-cohead">${M.logo(p, 'xl')}<div class="grow"><h2>${tx(p.name)}</h2><div class="row-sm wrap" style="gap:12px;margin-top:4px">${M.rating(p.rating, p.reviews)}${M.verified(p)}<span class="xs faint">${L(`Since ${p.since}`, `منذ ${p.since}`)}</span></div></div>
        <div class="row-sm wrap">${ui.btn(L('Preview', 'معاينة'), { icon: 'eye', go: `provider-provider-${PID}` })}${ui.btn(L('Edit profile', 'تعديل الملف'), { kind: 'primary', icon: 'edit', act: 'pvEdit' })}</div></div>
      <div class="grid g-main" style="margin-top:20px;align-items:start">
        <div class="stack">
          ${ui.card({ title: L('About', 'نبذة'), body: `<p style="font-size:14.5px;line-height:1.6">${esc(M.aboutOf(p))}</p><div class="divider" style="margin:16px 0"></div>${ui.kvGrid([[L('Tagline', 'الشعار'), esc(tx(p.tagline))], [L('Typical response', 'زمن الاستجابة'), esc(tx(p.response))], [L('In business since', 'في السوق منذ'), p.since], [L('Phone', 'الهاتف'), `<span class="ltr">${esc(D.person('p_yousef').phone)}</span>`], [L('Email', 'البريد'), esc(D.person('p_yousef').email)], [L('Jobs on BENA', 'مهام على بينا'), B.num(p.jobs)]])}` })}
          ${ui.card({ title: L('Service categories', 'فئات الخدمة'), sub: L('Tap to add or remove. Customers find you by these categories.', 'اضغط للإضافة أو الإزالة. يجدك العملاء من خلال هذه الفئات.'), body: `<div class="row-sm wrap" style="gap:8px">${D.serviceCats.map((c) => `<button class="pv-chiptog ${p.cats.includes(c.id) ? 'on' : ''}" data-act="pvCat" data-arg="${c.id}">${icon(p.cats.includes(c.id) ? 'check' : c.icon)}${tx(c.name)}</button>`).join('')}</div>` })}
          ${ui.card({ title: L('Geographic coverage', 'النطاق الجغرافي'), sub: L(`${p.areas.length} of ${D.districts.length} districts · ${B.num(covered.size)} buildings in range`, `${p.areas.length} من ${D.districts.length} مناطق · ${B.num(covered.size)} مبنى ضمن النطاق`), body: `${B.map.render({ id: 'pv-cov', static: true, visible: covered, height: '300px', legend: false, badge: L('Highlighted: buildings you serve', 'المميّزة: مبانٍ تخدمها') })}<div class="row-sm wrap" style="gap:8px;margin-top:14px">${D.districts.map((d) => `<button class="pv-chiptog ${p.areas.includes(d.id) ? 'on' : ''}" data-act="pvArea" data-arg="${d.id}">${icon(p.areas.includes(d.id) ? 'check' : 'plus')}${tx(d.name)}</button>`).join('')}</div>` })}
        </div>
        <div class="stack">
          ${ui.card({ title: L('Team', 'الفريق'), sub: L('9 technicians · 5 shown', '9 فنيين · يظهر 5'), link: { label: L('Invite', 'دعوة'), act: 'pvInvite' }, body: TEAM.map((t) => `<div class="pv-team">${ui.avatar(t.name)}<div class="grow"><b>${esc(tx(t.name))}</b><small>${esc(tx(t.role))}</small></div><div class="row-sm">${t.skills.map((s) => `<span class="li-icon mint" style="width:28px;height:28px;border-radius:8px" title="${esc(tx(D.cat(s).name))}">${icon(D.cat(s).icon)}</span>`).join('')}</div></div>`).join('') })}
          ${ui.card({ title: L('Licences & certifications', 'التراخيص والشهادات'), link: { label: L('Upload', 'رفع'), act: 'pvCert' }, body: M.certs(p).map(([n, id, v]) => `<div class="mk-cert"><span class="ci">${icon('award')}</span><div class="grow"><b>${tx(n)}</b><small>${ui.idMono(id)} · ${tx(v)}</small></div>${ui.status('verified')}</div>`).join('') })}
          ${ui.demoNote(L('Company details, licences and team are fictional.', 'بيانات الشركة والتراخيص والفريق وهمية.'))}
        </div>
      </div>`;
  };

  /* ---------------- actions ---------------- */
  const lineRow = (i, d = '', q = 1, p = '') => `<div class="pv-line"><input class="input" name="d${i}" value="${esc(d)}" placeholder="${esc(L('Item or labour', 'بند أو أجور عمل'))}" ${i === 0 ? 'required' : ''}><input class="input num" name="q${i}" type="number" min="1" value="${q}" ${i === 0 ? 'required' : ''}><input class="input num" name="p${i}" type="number" min="0" value="${p}" placeholder="₪" ${i === 0 ? 'required' : ''}></div>`;
  const recalc = (form) => {
    let sub = 0;
    form.querySelectorAll('.pv-line').forEach((row) => { const [, q, p] = row.querySelectorAll('input'); sub += (+q.value || 0) * (+p.value || 0); });
    const vat = Math.round(sub * 0.16);
    const out = form.querySelector('#pv-total');
    if (out) out.innerHTML = `<div><span class="muted">${L('Subtotal', 'المجموع الفرعي')}</span><b class="num">${B.money(sub)}</b></div><div><span class="muted">${L('VAT 16%', 'ضريبة 16%')}</span><b class="num">${B.money(vat)}</b></div><div><span class="strong">${L('Total to customer', 'الإجمالي للعميل')}</span><span class="g">${B.money(sub + vat)}</span></div>`;
  };
  B.act.pvQuote = (rid) => {
    const r = req(rid);
    const svc = M.services(PID).find((s) => s.cat === r.cat);
    const base = svc ? svc.price : 150;
    const w = B.modal({ title: L('Submit quotation', 'تقديم عرض سعر'), sub: `${esc(tx(r.title))} · ${ui.idMono(r.id)}`, size: 'lg', form: 'pvQuote',
      body: `<input type="hidden" name="rid" value="${r.id}">
        <div class="field"><label>${L('Line items', 'بنود العرض')}</label><div class="pv-line-h"><span>${L('Description', 'الوصف')}</span><span>${L('Qty', 'الكمية')}</span><span>${L('Unit price', 'سعر الوحدة')}</span></div>
          <div class="pv-lines" id="pv-lines">${lineRow(0, svc ? tx(svc.name) : L('Labour', 'أجور العمل'), 1, base)}${lineRow(1, L('Materials & parts', 'المواد والقطع'), 1, Math.round(base * 0.6 / 10) * 10)}${lineRow(2, L('Call-out & transport', 'الاستدعاء والتنقل'), 1, 50)}</div>
          <button type="button" class="btn btn-text btn-sm" style="align-self:flex-start;margin-top:4px" data-act="pvAddLine">${icon('plus')}${L('Add line', 'إضافة بند')}</button></div>
        <div class="pv-total" id="pv-total"></div>
        <div class="form-grid" style="margin-top:16px">
          ${ui.field({ name: 'eta', type: 'select', label: L('Earliest start', 'أقرب موعد للبدء'), value: '2', options: [{ v: '1', l: L('Tomorrow', 'غداً') }, { v: '2', l: L('Within 2 days', 'خلال يومين') }, { v: '4', l: L('Within 4 days', 'خلال 4 أيام') }, { v: '7', l: L('Within a week', 'خلال أسبوع') }] })}
          ${ui.field({ name: 'visit', type: 'date', label: L('Proposed visit', 'موعد الزيارة المقترح'), value: r.pref ? r.pref.date : '2026-11-28', min: '2026-11-26' })}
          ${ui.field({ name: 'valid', type: 'select', label: L('Quote valid for', 'صلاحية العرض'), value: '14', options: [{ v: '7', l: L('7 days', '7 أيام') }, { v: '14', l: L('14 days', '14 يوماً') }, { v: '30', l: L('30 days', '30 يوماً') }] })}
          ${ui.field({ name: 'warranty', type: 'select', label: L('Workmanship warranty', 'ضمان العمل'), value: '6', options: [{ v: '3', l: L('3 months', '3 أشهر') }, { v: '6', l: L('6 months', '6 أشهر') }, { v: '12', l: L('12 months', '12 شهراً') }] })}
          ${ui.field({ name: 'notes', type: 'textarea', full: true, label: L('Note to customer', 'ملاحظة للعميل'), placeholder: L('Scope, assumptions, what the customer should prepare…', 'النطاق والافتراضات وما يجب على العميل تجهيزه…') })}
        </div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send quotation', 'إرسال العرض'), { kind: 'primary', icon: 'send', type: 'submit' })}` });
    const form = w.querySelector('form');
    form.addEventListener('input', () => recalc(form));
    recalc(form);
  };
  B.act.pvAddLine = () => {
    const box = document.getElementById('pv-lines');
    if (!box) return;
    const n = box.querySelectorAll('.pv-line').length;
    if (n >= 8) { B.toast(L('Up to 8 lines', 'حتى 8 بنود'), 'info'); return; }
    box.insertAdjacentHTML('beforeend', lineRow(n));
    recalc(box.closest('form'));
  };
  B.submit.pvQuote = (d) => {
    const r = req(d.rid);
    let sub = 0;
    for (let i = 0; i < 8; i++) if (d['d' + i] != null) sub += (+d['q' + i] || 0) * (+d['p' + i] || 0);
    const amount = Math.round(sub * 1.16);
    const existing = quoteOf(r.id);
    const id = existing ? existing.id : `QT-${3390 + QUOTES.length}`;
    const valid = new Date(2026, 10, 25 + (+d.valid || 14)).toISOString().slice(0, 10);
    if (existing) Object.assign(existing, { amount, valid, eta: +d.eta || 2, sent: '2026-11-25' });
    else QUOTES.unshift({ id, req: r.id, amount, sent: '2026-11-25', valid, eta: +d.eta || 2, status: 'sent' });
    r.status = 'quoted';
    M.sentQuotes[r.id + '|' + PID] = { amount, eta: +d.eta || 2 };
    B.success({ title: existing ? L('Quotation updated', 'تم تحديث العرض') : L('Quotation sent', 'تم إرسال العرض'), text: L(`${B.money(amount)} incl. VAT sent to ${D.pname(r.by)}. You’ll be notified when they decide.`, `تم إرسال ${B.money(amount)} شامل الضريبة إلى ${D.pname(r.by)}. سيصلك إشعار عند اتخاذ القرار.`), ref: id, done: 'provider-quotations', doneLabel: L('Go to quotations', 'الذهاب للعروض') });
    B.refresh();
  };
  B.act.pvDecline = (rid) => {
    const r = req(rid);
    B.modal({ title: L('Decline this request?', 'الاعتذار عن هذا الطلب؟'), sub: esc(tx(r.title)), size: 'sm', form: 'pvDecline',
      body: `<input type="hidden" name="rid" value="${r.id}">${ui.field({ name: 'reason', type: 'radio', label: L('Reason (shared with the customer)', 'السبب (يُشارك مع العميل)'), value: 'booked', options: [{ v: 'booked', l: L('Fully booked on these dates', 'محجوزون بالكامل في هذه المواعيد') }, { v: 'scope', l: L('Outside our specialty', 'خارج تخصصنا') }, { v: 'area', l: L('Outside our coverage', 'خارج نطاق خدمتنا') }] })}`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Decline request', 'تأكيد الاعتذار'), { kind: 'danger', type: 'submit' })}` });
  };
  B.submit.pvDecline = (d) => {
    const r = req(d.rid);
    r.status = 'declined';
    r.reason = { booked: T('Fully booked on the requested dates', 'محجوزون بالكامل في المواعيد المطلوبة'), scope: T('Outside our specialty', 'خارج تخصصنا'), area: T('Outside our coverage', 'خارج نطاق خدمتنا') }[d.reason] || T('Declined', 'تم الاعتذار');
    B.closeModal();
    B.toast(L('Request declined — the customer was notified', 'تم الاعتذار — تم إشعار العميل'));
    B.go('provider-requests');
  };
  B.act.pvWithdraw = (rid) => B.confirm({ title: L('Withdraw this quote?', 'سحب هذا العرض؟'), text: L('The customer will no longer be able to accept it.', 'لن يتمكن العميل من قبوله بعد الآن.'), danger: true, ok: L('Withdraw', 'سحب'), onOk: () => { const q = quoteOf(rid); if (q) q.status = 'expired'; const r = req(rid); if (r) r.status = 'expired'; delete M.sentQuotes[rid + '|' + PID]; B.closeModal(); B.toast(L('Quote withdrawn', 'تم سحب العرض')); B.refresh(); } });
  B.act.pvStatus = (arg) => {
    const [id, st] = arg.split('|');
    const j = job(id);
    j.status = st;
    if (st === 'enroute') j.enrouteAt = '10:' + String(5 + Math.floor(Math.random() * 50)).padStart(2, '0');
    if (st === 'inProgress') j.startedAt = '11:' + String(Math.floor(Math.random() * 50) + 5).padStart(2, '0');
    B.toast(st === 'enroute' ? L(`${D.pname(j.by)} was notified: technician on the way`, `تم إشعار ${D.pname(j.by)}: الفني في الطريق`) : L('Work started — customer notified', 'بدأ العمل — تم إشعار العميل'));
    B.refresh();
  };
  B.act.pvCheck = (arg) => { const [id, i] = arg.split('|'); const j = job(id); j.check[+i] = !j.check[+i]; B.refresh(); };
  B.act.pvNotes = (id) => { const j = job(id); const el = document.getElementById('pv-notes-' + id); j.notes = el ? el.value : j.notes; j.notesSaved = true; B.toast(L('Notes saved', 'تم حفظ الملاحظات')); B.refresh(); };
  B.act.pvReschedule = (id) => {
    const j = job(id);
    B.modal({ title: L('Reschedule visit', 'إعادة جدولة الزيارة'), sub: esc(tx(j.title)), size: 'sm', form: 'pvReschedule',
      body: `<input type="hidden" name="id" value="${j.id}"><div class="form-grid">${ui.field({ name: 'date', type: 'date', label: L('New date', 'التاريخ الجديد'), value: j.date, min: '2026-11-25', required: true })}${ui.field({ name: 'time', type: 'select', label: L('Time', 'الوقت'), value: j.time, options: ['08:30', '09:00', '09:30', '10:30', '11:00', '13:00', '15:30', '17:00'].map((t) => ({ v: t, l: t })) })}${ui.field({ name: 'why', full: true, label: L('Message to customer', 'رسالة للعميل'), value: L('Sorry for the change — a part delivery was delayed.', 'نعتذر عن التغيير — تأخر توريد قطعة.') })}</div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Propose new time', 'اقتراح موعد جديد'), { kind: 'primary', type: 'submit' })}` });
  };
  B.submit.pvReschedule = (d) => { const j = job(d.id); j.date = d.date || j.date; j.time = d.time || j.time; j.status = 'scheduled'; B.success({ title: L('New time proposed', 'تم اقتراح موعد جديد'), text: L(`${B.date(j.date)} at ${j.time}. The customer will confirm in BENA.`, `${B.date(j.date)} الساعة ${j.time}. سيؤكد العميل عبر بينا.`) }); B.refresh(); };
  B.act.pvComplete = (id) => {
    const j = job(id);
    const left = j.check.filter((x) => !x).length;
    B.modal({ title: L('Completion report', 'تقرير الإنجاز'), sub: `${esc(tx(j.title))} · ${ui.idMono(j.id)}`, form: 'pvComplete',
      body: `<input type="hidden" name="id" value="${j.id}">${left ? `<div style="margin-bottom:14px">${ui.callout(L(`${left} checklist item${left > 1 ? 's are' : ' is'} still open. You can still submit.`, `لا يزال ${left} من بنود القائمة مفتوحاً. يمكنك الإرسال رغم ذلك.`), 'warn', 'alert')}</div>` : ''}
        <div class="form-grid">
          ${ui.field({ name: 'summary', type: 'textarea', full: true, label: L('Work carried out', 'العمل المنجز'), value: tx(j.notes) || '', required: true, placeholder: L('What was found and what was done', 'ما الذي وُجد وما الذي تم') })}
          ${ui.field({ name: 'time', type: 'select', label: L('Time on site', 'الوقت في الموقع'), value: '1.5 h', options: ['0.5 h', '1 h', '1.5 h', '2 h', '3 h', '4 h+'].map((t) => ({ v: t, l: t })) })}
          ${ui.field({ name: 'amount', type: 'number', label: L('Final amount (₪, incl. VAT)', 'المبلغ النهائي (₪، شامل الضريبة)'), value: j.amount, min: 0, required: true })}
          ${ui.field({ name: 'parts', full: true, label: L('Parts used', 'القطع المستخدمة'), placeholder: L('e.g. 1× 40 A RCD, 2 m cable', 'مثال: 1× قاطع تسرب 40 أمبير، 2 م كابل') })}
          ${ui.field({ name: 'photos', type: 'file', full: true, label: L('After photos', 'صور بعد الإنجاز') })}
        </div>
        <label class="check" style="margin-top:14px"><input type="checkbox" name="signed" checked><span>${L('Customer confirmed the work on site', 'أكد العميل العمل في الموقع')}</span></label>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Submit & close job', 'إرسال وإغلاق المهمة'), { kind: 'primary', icon: 'checkCircle', type: 'submit' })}` });
  };
  B.submit.pvComplete = (d) => {
    const j = job(d.id);
    Object.assign(j, { status: 'completed', closed: '2026-11-25', amount: +d.amount || j.amount, report: { summary: d.summary, time: d.time, parts: d.parts }, check: j.check.map(() => true) });
    B.success({ title: L('Job completed', 'تم إنجاز المهمة'), text: L(`Report and invoice for ${B.money(j.amount)} sent to ${D.pname(j.by)}. They’ll be asked to rate the job.`, `تم إرسال التقرير والفاتورة بمبلغ ${B.money(j.amount)} إلى ${D.pname(j.by)}. سيُطلب منه تقييم المهمة.`), ref: `INV-${j.id.replace(/^[A-Z]+-/, '')}`, done: 'provider-completed', doneLabel: L('Completed work', 'الأعمال المنجزة') });
    B.refresh();
  };
  B.act.pvInvoice = (id) => {
    const j = job(id);
    const net = Math.round(j.amount / 1.16);
    B.modal({ title: L('Invoice', 'الفاتورة'), sub: `${ui.idMono('INV-' + j.id.replace(/^[A-Z]+-/, ''))} · ${B.date(j.closed)}`, size: 'sm',
      body: `<div class="mk-receipt"><div class="row between" style="margin-bottom:12px"><div class="row-sm">${M.logo(P(), 'sm')}<b>${tx(P().name)}</b></div>${ui.status('paid')}</div>
        <div class="rl"><span>${esc(tx(j.title))}</span><b class="num">${B.money(Math.round(net * 0.72))}</b></div><div class="rl"><span>${L('Materials', 'المواد')}</span><b class="num">${B.money(net - Math.round(net * 0.72))}</b></div>
        <div class="rl"><span class="muted">${L('VAT 16%', 'ضريبة 16%')}</span><b class="num">${B.money(j.amount - net)}</b></div><div class="rl"><span class="strong">${L('Total', 'الإجمالي')}</span><span class="tot num">${B.money(j.amount)}</span></div></div>
        <div style="margin-top:12px">${ui.kv([[L('Billed to', 'إلى'), esc(D.pname(j.by))], [L('Location', 'الموقع'), esc(where(j.bid, j.unit))], [L('Payout', 'التحويل'), L('Settled to your account in 2 days (demo)', 'يُحوّل لحسابك خلال يومين (تجريبي)')]])}</div>`,
      foot: `${ui.btn(L('Resend', 'إعادة إرسال'), { icon: 'send', act: 'toast', arg: L('Invoice resent to the customer', 'أُعيد إرسال الفاتورة للعميل') })}${ui.btn(L('Download PDF', 'تنزيل PDF'), { kind: 'primary', icon: 'download', act: 'soon', arg: L('Download', 'التنزيل') })}` });
  };
  B.act.pvReply = (rid) => {
    const r = M.reviews(PID).find((x) => x.id === rid);
    B.modal({ title: L('Reply to review', 'الرد على المراجعة'), sub: `${esc(D.pname(r.by))} · ${'★'.repeat(r.stars)}`, size: 'md', form: 'pvReply',
      body: `<input type="hidden" name="rid" value="${r.id}"><div class="callout dashed small" style="margin-bottom:14px">${icon('chat')}<div>${esc(tx(r.text))}</div></div>${ui.field({ name: 'text', type: 'textarea', label: L('Your public reply', 'ردك العلني'), required: true, value: r.stars <= 3 ? L(`Thank you for the honest feedback, ${tx(D.person(r.by).name).split(' ')[0]}. We’ve spoken with the team about arriving on time and calling ahead.`, `شكراً على ملاحظتك الصادقة. تحدثنا مع الفريق بشأن الالتزام بالموعد والاتصال المسبق.`) : L('Thank you — it was a pleasure working with you!', 'شكراً لك — سعدنا بالعمل معك!') })}`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Publish reply', 'نشر الرد'), { kind: 'primary', icon: 'send', type: 'submit' })}` });
  };
  B.submit.pvReply = (d) => { M.replies[d.rid] = { en: d.text, ar: d.text }; B.success({ title: L('Reply published', 'تم نشر الرد'), text: L('It now appears under the review on your public profile.', 'يظهر الآن تحت المراجعة في ملفك العام.') }); B.refresh(); };
  B.act.pvCat = (c) => { const p = P(); if (p.cats.includes(c)) { if (p.cats.length === 1) { B.toast(L('Keep at least one category', 'أبقِ فئة واحدة على الأقل'), 'info'); return; } p.cats = p.cats.filter((x) => x !== c); } else p.cats = p.cats.concat(c); B.toast(L('Categories updated in the marketplace', 'تم تحديث الفئات في السوق')); B.refresh(); };
  B.act.pvArea = (a) => { const p = P(); if (p.areas.includes(a)) { if (p.areas.length === 1) { B.toast(L('Keep at least one district', 'أبقِ منطقة واحدة على الأقل'), 'info'); return; } p.areas = p.areas.filter((x) => x !== a); } else p.areas = p.areas.concat(a); B.toast(L('Coverage updated', 'تم تحديث النطاق')); B.refresh(); };
  B.act.pvEdit = () => {
    const p = P();
    B.modal({ title: L('Edit company profile', 'تعديل ملف الشركة'), sub: L('Shown on your public marketplace profile', 'يظهر في ملفك العام في السوق'), form: 'pvEdit',
      body: `<div class="form-grid">${ui.field({ name: 'tagline', full: true, label: L('Tagline', 'الشعار'), value: tx(p.tagline), required: true })}
        ${ui.field({ name: 'about', type: 'textarea', full: true, label: L('About', 'نبذة'), value: M.aboutOf(p) })}
        ${ui.field({ name: 'response', type: 'select', label: L('Typical response time', 'زمن الاستجابة المعتاد'), value: 'h2', options: [{ v: 'h1', l: L('~1 hr', '~ساعة') }, { v: 'h2', l: L('~2 hrs', '~ساعتان') }, { v: 'same', l: L('Same day', 'في نفس اليوم') }, { v: 'next', l: L('Next day', 'اليوم التالي') }] })}
        ${ui.field({ name: 'phone', type: 'tel', label: L('Business phone', 'هاتف العمل'), value: D.person('p_yousef').phone })}
        ${ui.field({ name: 'logo', type: 'file', full: true, label: L('Logo & cover', 'الشعار والغلاف'), placeholder: L('PNG or SVG, square logo (demo)', 'PNG أو SVG، شعار مربع (تجريبي)') })}</div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Save changes', 'حفظ التغييرات'), { kind: 'primary', type: 'submit' })}` });
  };
  B.submit.pvEdit = (d) => {
    const p = P();
    if (d.tagline) p.tagline = { en: d.tagline, ar: d.tagline };
    if (d.about) M.about[PID] = d.about;
    p.response = { h1: T('~1 hr', '~ساعة'), h2: T('~2 hrs', '~ساعتان'), same: T('Same day', 'في نفس اليوم'), next: T('Next day', 'اليوم التالي') }[d.response] || p.response;
    B.success({ title: L('Profile updated', 'تم تحديث الملف'), text: L('Changes are live on your marketplace profile.', 'التغييرات ظاهرة الآن في ملفك في السوق.'), done: `provider-provider-${PID}`, doneLabel: L('View public profile', 'عرض الملف العام') });
    B.refresh();
  };
  B.act.pvInvite = () => B.modal({ title: L('Invite a technician', 'دعوة فني'), size: 'sm', form: 'pvInvite',
    body: `<div class="form-grid">${ui.field({ name: 'name', full: true, label: L('Full name', 'الاسم الكامل'), required: true })}${ui.field({ name: 'phone', type: 'tel', full: true, label: L('Mobile', 'الجوال'), required: true })}${ui.field({ name: 'skill', type: 'select', full: true, label: L('Main skill', 'المهارة الرئيسية'), options: P().cats.map((c) => ({ v: c, l: D.cat(c).name })) })}</div>`,
    foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send invite', 'إرسال الدعوة'), { kind: 'primary', type: 'submit' })}` });
  B.submit.pvInvite = (d) => B.success({ title: L('Invitation sent', 'تم إرسال الدعوة'), text: L(`${d.name} will get a link to join Jaber Technical Services on BENA.`, `سيصل ${d.name} رابط للانضمام إلى جابر للخدمات الفنية على بينا.`), ref: `TM-${String(B.mkt.hash(d.name || 'x') % 900 + 100)}` });
  B.act.pvCert = () => B.modal({ title: L('Upload certification', 'رفع شهادة'), size: 'sm', form: 'pvCert',
    body: `<div class="form-grid">${ui.field({ name: 'name', full: true, label: L('Certificate name', 'اسم الشهادة'), required: true })}${ui.field({ name: 'exp', type: 'date', full: true, label: L('Expiry date', 'تاريخ الانتهاء'), min: '2026-11-25' })}${ui.field({ name: 'file', type: 'file', full: true })}</div>`,
    foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Submit for review', 'إرسال للمراجعة'), { kind: 'primary', type: 'submit' })}` });
  B.submit.pvCert = () => B.success({ title: L('Submitted for verification', 'أُرسلت للتحقق'), text: L('BENA reviews new certificates within 2 working days.', 'تراجع بينا الشهادات الجديدة خلال يومي عمل.'), ref: `CRT-26-${String(Math.floor(Math.random() * 900) + 100)}` });

  /* ---------------- role ---------------- */
  B.role({
    id: 'provider', icon: 'wrench', nav: 'tabs', home: 'home',
    name: T('Service Provider', 'مزوّد الخدمة'), short: T('Provider', 'مزوّد'),
    org: T('Jaber Technical Services', 'جابر للخدمات الفنية'), tag: T('Business', 'أعمال'),
    desc: T('Receive requests from verified buildings, send quotes, run jobs and build your reputation.', 'استقبل الطلبات من مبانٍ موثّقة، وأرسل العروض، وأدر المهام، وابنِ سمعتك.'),
    personaTitle: T('Yousef Jaber · Owner', 'يوسف جابر · المالك'),
    menu: [
      { group: T('Work', 'العمل') },
      { id: 'home', label: T('Dashboard', 'لوحة التحكم'), tabLabel: T('Home', 'الرئيسية'), icon: 'grid', tab: true },
      { id: 'requests', label: T('Incoming requests', 'الطلبات الواردة'), tabLabel: T('Requests', 'الطلبات'), icon: 'inbox', tab: true, match: ['request'], get count() { return newCount() || null; } },
      { id: 'jobs', label: T('Assigned jobs', 'المهام المسندة'), tabLabel: T('Jobs', 'المهام'), icon: 'calendarCheck', tab: true, match: ['job'] },
      { id: 'quotations', label: T('Quotations', 'عروض الأسعار'), tabLabel: T('Quotes', 'العروض'), icon: 'receipt', tab: true },
      { id: 'completed', label: T('Completed work', 'الأعمال المنجزة'), icon: 'checkCircle' },
      { id: 'feedback', label: T('Customer feedback', 'آراء العملاء'), icon: 'star' },
      { group: T('Company', 'الشركة') },
      { id: 'profile', label: T('Company profile', 'ملف الشركة'), icon: 'briefcase' },
      { id: 'services', label: T('Services marketplace', 'سوق الخدمات'), icon: 'store', match: ['provider', 'servicedetail', 'quotes', 'servicehistory'] },
      { id: 'properties', label: T('Property marketplace', 'سوق العقارات'), icon: 'home', match: ['listing'] },
    ],
    pages: { home, requests, request, quotations, jobs, job: jobPage, completed, feedback, profile },
    notifications: () => {
      const fresh = reqs().filter((r) => r.status === 'new');
      return [
        fresh[0] && { icon: 'inbox', tone: 'mint', title: L(`New request: ${tx(fresh[0].title)}`, `طلب جديد: ${tx(fresh[0].title)}`), sub: where(fresh[0].bid, fresh[0].unit), when: B.ago(fresh[0].created), go: `provider-request-${fresh[0].id}` },
        { icon: 'checkCircle', tone: 'info', title: L('Quote QT-3335 accepted by Lina Haddad', 'قبلت لينا حداد العرض QT-3335'), sub: L('Kitchen sink leak · return visit tomorrow 09:30', 'تسريب مغسلة المطبخ · زيارة متابعة غداً 09:30'), when: L('Yesterday', 'أمس'), go: 'provider-job-MR-24518' },
        { icon: 'truck', tone: 'violet', title: L('Samir is en route to Manara Business Center', 'سمير في الطريق إلى مركز المنارة للأعمال'), sub: L('RCD replacement · 10:30', 'استبدال قاطع التسرب · 10:30'), when: L('Today', 'اليوم'), go: 'provider-job-JB-3101' },
        { icon: 'star', tone: 'warn', title: L('New 3★ review needs a reply', 'مراجعة جديدة 3★ بحاجة لرد'), sub: L('Ibrahim Zaid · Al-Tireh Gardens', 'إبراهيم زيد · حدائق الطيرة'), when: L('4 days ago', 'قبل 4 أيام'), go: 'provider-feedback' },
        { icon: 'clock', tone: 'neutral', title: L('Quote QT-3370 expires in 6 days', 'العرض QT-3370 ينتهي خلال 6 أيام'), sub: L('Garden lighting · Batn Al-Hawa Villas', 'إنارة الحديقة · فلل بطن الهوا'), when: L('Today', 'اليوم'), go: 'provider-request-PR-24489' },
      ].filter(Boolean);
    },
  });
})();
