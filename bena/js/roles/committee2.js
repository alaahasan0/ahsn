/*
 * BENA — Building Committee / Owners' Association: enterprise web workspace.
 * Extends js/roles/committee.js (persona Samer Khoury, Chair of Al-Masyoun Tower
 * Owners' Association) with desktop-first screens: roles & delegations, legal &
 * administrative status, documents, minutes, decisions, voting, budget and
 * expenses — and re-registers the role with the full 13-screen sidebar.
 * Every figure, name and document is fictional demonstration data.
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon, ui } = B;
  const D = B.data;
  const ek = B.ek;
  const K = B._cm;
  if (!K || !ek) return;
  const T = (en, ar) => ({ en, ar });
  const R = 'committee';
  const { C, BID, bld, units, share, shareStr, unitLbl, CATS, cat, BUDGET, LEDGER, MONTHS, monthCats, MEETINGS, meeting, kindStatus, voteBar, VOTE_C, VOTE_L, dateTile, P, contrib, cOut, fin } = K;
  const pct = (a, b) => (b ? (a / b) * 100 : 0);
  const fy = () => B.get('ws:committee', 'fy2026');

  B.css(`
  .c2-legal-hero { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 0; background: #fff; border: 1px solid var(--line); border-radius: var(--r); overflow: hidden; margin-bottom: 16px; }
  .c2-legal-hero > div { padding: 20px 22px; min-width: 0; }
  .c2-legal-hero .side { background: var(--surface-2); border-inline-start: 1px solid var(--line-2); }
  .c2-legal-hero h2 { font-size: 19px; margin: 10px 0 4px; }
  .c2-ev { display: grid; grid-template-columns: 22px minmax(0, 1fr) auto; gap: 10px; align-items: start; padding: 10px 0; border-bottom: 1px solid var(--line-2); font-size: 13.5px; }
  .c2-ev:last-child { border-bottom: 0; }
  .c2-ev > svg { width: 18px; height: 18px; margin-top: 1px; }
  .c2-ev .y { color: var(--ok); } .c2-ev .n { color: var(--bad); } .c2-ev .p { color: var(--warn); }
  .c2-ev small { display: block; color: var(--text-3); font-size: 12px; margin-top: 2px; }
  @media (max-width: 900px) { .c2-legal-hero { grid-template-columns: minmax(0, 1fr); } .c2-legal-hero .side { border-inline-start: 0; border-top: 1px solid var(--line-2); } }
  .c2-kinds { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
  .c2-kind { border: 1px solid var(--line); border-radius: 14px; background: #fff; padding: 16px; min-width: 0; }
  .c2-kind.legal { border-color: var(--navy); box-shadow: inset 0 3px 0 var(--navy); }
  .c2-kind.informal { border-style: dashed; border-color: #A9B6C2; }
  .c2-kind.authorized { box-shadow: inset 0 3px 0 var(--info); }
  .c2-kind h4 { font-size: 14.5px; margin: 8px 0 4px; }
  .c2-kind p { font-size: 13px; color: var(--text-2); line-height: 1.5; }
  .c2-kind .here { font-size: 11.5px; font-weight: 700; color: var(--mint-ink); margin-top: 10px; display: flex; gap: 6px; align-items: center; }
  .c2-kind .here svg { width: 14px; height: 14px; }
  @media (max-width: 900px) { .c2-kinds { grid-template-columns: minmax(0, 1fr); } }
  .c2-minutes { background: #fff; border: 1px solid var(--line); border-radius: var(--r); padding: 30px 34px; }
  .c2-minutes .mh { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding-bottom: 16px; border-bottom: 2px solid var(--navy); margin-bottom: 18px; }
  .c2-minutes h2 { font-size: 19px; line-height: 1.3; }
  .c2-minutes h4 { font-size: 12px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: .07em; margin: 20px 0 8px; }
  html[dir="rtl"] .c2-minutes h4 { letter-spacing: 0; }
  .c2-minutes p { font-size: 14.5px; line-height: 1.7; color: var(--text-2); }
  .c2-minutes p + p { margin-top: 10px; }
  .c2-minutes ol { margin: 0; padding-inline-start: 20px; font-size: 14px; line-height: 1.8; }
  .c2-att { display: flex; flex-wrap: wrap; gap: 8px; }
  .c2-att span { display: inline-flex; gap: 6px; align-items: center; font-size: 12.5px; padding: 4px 10px 4px 4px; border-radius: 99px; background: var(--surface-2); border: 1px solid var(--line-2); }
  html[dir="rtl"] .c2-att span { padding: 4px 4px 4px 10px; }
  .c2-att .avatar { width: 22px; height: 22px; font-size: 10px; }
  .c2-att span.off { opacity: .55; }
  .c2-res { border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; margin-top: 10px; }
  .c2-res b { font-size: 13.5px; }
  .c2-sign { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; margin-top: 28px; font-size: 12.5px; color: var(--text-3); }
  .c2-sign div { border-top: 1px dashed #B9C6CF; padding-top: 8px; }
  .c2-sign b { display: block; color: var(--ink); font-size: 13.5px; }
  @media (max-width: 640px) { .c2-minutes { padding: 18px; } }
  .c2-mlist { display: flex; flex-direction: column; gap: 6px; }
  .c2-mi { display: grid; grid-template-columns: 46px minmax(0, 1fr); gap: 12px; align-items: center; text-align: start; width: 100%; padding: 10px 12px; border-radius: 12px; border: 1px solid transparent; }
  .c2-mi:hover { background: #fff; border-color: var(--line); }
  .c2-mi.on { background: #fff; border-color: var(--mint); box-shadow: 0 0 0 3px rgba(54,214,160,.15); }
  .c2-mi b { font-size: 13.5px; display: block; line-height: 1.3; }
  .c2-mi small { font-size: 12px; color: var(--text-3); display: block; margin-top: 2px; }
  .c2-tiers { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
  .c2-tier { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; }
  .c2-tier .w { font-size: 11.5px; font-weight: 700; color: var(--mint-ink); text-transform: uppercase; letter-spacing: .05em; }
  html[dir="rtl"] .c2-tier .w { letter-spacing: 0; }
  .c2-tier b { display: block; font-family: var(--font-display); font-size: 20px; margin: 4px 0 2px; font-variant-numeric: tabular-nums; }
  .c2-tier span { font-size: 12.5px; color: var(--text-2); }
  @media (max-width: 760px) { .c2-tiers { grid-template-columns: minmax(0, 1fr); } }
  .c2-ballot { border: 1px solid var(--line); border-radius: 14px; padding: 16px; background: #fff; }
  .c2-ballot + .c2-ballot { margin-top: 12px; }
  .c2-ballot .top { display: flex; gap: 12px; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .c2-ballot .top b { font-size: 14.5px; display: block; line-height: 1.35; }
  .c2-ballot .top small { color: var(--text-3); font-size: 12px; display: block; margin-top: 3px; }
  .c2-q { position: relative; height: 12px; border-radius: 99px; background: var(--line-2); margin: 8px 0 6px; }
  .c2-q i { position: absolute; inset-block: 0; inset-inline-start: 0; border-radius: 99px; background: var(--mint); }
  .c2-q i.warn { background: #E9A23B; }
  .c2-q em { position: absolute; top: -4px; bottom: -4px; width: 2px; background: var(--navy); border-radius: 2px; }
  .c2-fund { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; background: var(--line-2); border-radius: 12px; overflow: hidden; border: 1px solid var(--line-2); }
  .c2-fund > div { background: #fff; padding: 12px 14px; }
  .c2-fund .l { font-size: 12px; color: var(--text-3); }
  .c2-fund b { font-family: var(--font-display); font-size: 18px; font-variant-numeric: tabular-nums; display: block; margin-top: 3px; }
  .c2-fund b.bad { color: var(--bad); } .c2-fund b.ok { color: var(--ok); }
  .c2-chg.up { color: var(--bad); } .c2-chg.down { color: var(--ok); } .c2-chg { font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
  `);

  Object.assign(B.statuses, {
    c2Done: { en: 'Implemented', ar: 'نُفّذ', tone: 'ok', icon: 'check' },
    c2Doing: { en: 'In progress', ar: 'قيد التنفيذ', tone: 'violet' },
    c2Sched: { en: 'Scheduled', ar: 'مُجدول', tone: 'info', icon: 'calendar' },
    c2Deferred: { en: 'Deferred', ar: 'مؤجّل', tone: 'neutral' },
    c2Draft: { en: 'Draft', ar: 'مسودة', tone: 'neutral' },
    c2Approved: { en: 'Approved', ar: 'مُعتمد', tone: 'ok', icon: 'check' },
    c2Confirmed: { en: 'Confirmed', ar: 'مؤكد', tone: 'ok', icon: 'check' },
    c2NoReply: { en: 'No reply', ar: 'لم يرد', tone: 'outline' },
    c2CoSign: { en: 'Awaiting co-signature', ar: 'بانتظار التوقيع الثاني', tone: 'warn', icon: 'clock' },
    c2Paid: { en: 'Paid', ar: 'مدفوع', tone: 'ok' },
    c2Revoked: { en: 'Revoked', ar: 'ملغاة', tone: 'neutral' },
  });

  /* ======================================================================
     Shared data for the workspace screens
     ====================================================================== */
  const ALL_RES = () => MEETINGS.filter((m) => m.res).flatMap((m) => m.res.map((r) => ({ ...r, m, key: r.id })));
  const IMPL = {
    'D-26-14': ['c2Sched', T('Tank cleaning booked with PureTank for 3 Dec (MR-24390)', 'تم حجز تنظيف الخزانات مع بيور تانك في 3 ك١ (MR-24390)'), 'p_mona'],
    'D-26-15': ['c2Done', T('Formal reminders sent to 3 units on 30 Oct', 'أُرسلت الإنذارات الرسمية لـ 3 وحدات في 30 ت١'), 'p_hiba'],
    'D-26-16': ['c2Done', T('Three quotes received — on the 4 Dec assembly agenda', 'استُلمت ثلاثة عروض — مدرجة على جدول هيئة 4 ك١'), 'p_mona'],
    'D-26-11': ['c2Done', T('Final payment released (EX-26-0907)', 'تم صرف الدفعة النهائية (EX-26-0907)'), 'p_hiba'],
    'D-26-12': ['c2Done', T('Contract signed — runs to Sep 2027', 'تم توقيع العقد — ساري حتى أيلول 2027'), 'p_samer'],
    'R-26-04': ['c2Done', T('Lobby handed over on 16 Sep', 'تم استلام الردهة في 16 أيلول'), 'p_mona'],
    'R-26-05': ['c2Done', T('Levy collected from 52 apartments (₪12,480)', 'تم تحصيل المساهمة من 52 شقة (12,480 ₪)'), 'p_hiba'],
    'R-26-06': ['c2Deferred', T('Moved to the 2027 budget discussion', 'نُقل إلى نقاش موازنة 2027'), 'p_samer'],
    'R-26-01': ['c2Done', T('Accounts filed with the association records', 'أُودعت الحسابات في سجلات الجمعية'), 'p_hiba'],
    'R-26-02': ['c2Done', T('Seat filled from 2 Mar 2026', 'تم شغل المقعد اعتباراً من 2 آذار 2026'), 'p_fadi'],
    'R-26-03': ['c2Done', T('Charges applied from April', 'طُبقت الرسوم اعتباراً من نيسان'), 'p_hiba'],
  };

  /* Document register */
  const DOCREG = [
    { id: 'DOC-0217', name: T('Registration certificate OA-RAM-2018-0217', 'شهادة التسجيل OA-RAM-2018-0217'), cat: 'legal', date: '2018-04-12', by: 'p_samer', size: '310 KB', prov: 'official', vis: 'owners', ver: 1 },
    { id: 'DOC-0221', name: T('Association bylaws (2018, amended 2025)', 'النظام الداخلي للجمعية (2018، معدّل 2025)'), cat: 'legal', date: '2025-01-15', by: 'p_fadi', size: '640 KB', prov: 'submitted', vis: 'owners', ver: 3 },
    { id: 'DOC-0233', name: T('Minutes appointing the 2025–2027 committee', 'محضر تعيين لجنة 2025–2027'), cat: 'governance', date: '2025-01-15', by: 'p_fadi', size: '420 KB', prov: 'submitted', vis: 'owners', ver: 1 },
    { id: 'DOC-0240', name: T('Bank mandate — dual signatories', 'تفويض البنك — توقيع مزدوج'), cat: 'financial', date: '2025-02-03', by: 'p_hiba', size: '190 KB', prov: 'submitted', vis: 'committee', ver: 1 },
    { id: 'DOC-0311', name: T('Proxy — Khaled Mansour to Adel Shami', 'وكالة — خالد منصور إلى عادل شامي'), cat: 'governance', date: '2026-03-02', by: 'p_fadi', size: '150 KB', prov: 'submitted', vis: 'committee', ver: 1 },
    { id: 'DOC-0102', name: T('Building insurance policy 2026', 'بوليصة تأمين المبنى 2026'), cat: 'contracts', date: '2026-01-01', by: 'p_hiba', size: '880 KB', prov: 'submitted', vis: 'owners', ver: 1 },
    { id: 'DOC-0918', name: T('Cleaning contract — Sparkle Building Care (12 months)', 'عقد التنظيف — سباركل للعناية بالمباني (12 شهراً)'), cat: 'contracts', date: '2026-09-18', by: 'p_samer', size: '520 KB', prov: 'submitted', vis: 'committee', ver: 1 },
    { id: 'DOC-0125', name: T('Elevator maintenance contract — LiftLine', 'عقد صيانة المصاعد — لفت لاين'), cat: 'contracts', date: '2026-01-05', by: 'p_mona', size: '470 KB', prov: 'submitted', vis: 'committee', ver: 2 },
    { id: 'DOC-0914', name: T('Elevator annual safety certificate 2026', 'شهادة السلامة السنوية للمصاعد 2026'), cat: 'technical', date: '2026-09-14', by: 'p_mona', size: '230 KB', prov: 'pending', vis: 'owners', ver: 1 },
    { id: 'DOC-0303', name: T('Audited accounts 2025', 'الحسابات المدققة 2025'), cat: 'financial', date: '2026-03-02', by: 'p_hiba', size: '1.4 MB', prov: 'submitted', vis: 'owners', ver: 1 },
    { id: 'DOC-1101', name: T('Draft 2027 budget', 'مسودة موازنة 2027'), cat: 'financial', date: '2026-11-20', by: 'p_hiba', size: '380 KB', prov: 'submitted', vis: 'owners', ver: 4, draft: true },
    { id: 'DOC-1108', name: T('Elevator modernisation — quote comparison', 'تحديث المصاعد — مقارنة العروض'), cat: 'technical', date: '2026-11-08', by: 'p_mona', size: '1.1 MB', prov: 'submitted', vis: 'owners', ver: 1 },
    { id: 'DOC-0716', name: T('Lobby renovation handover report', 'تقرير تسليم ترميم الردهة'), cat: 'technical', date: '2026-09-16', by: 'p_mona', size: '2.3 MB', prov: 'submitted', vis: 'owners', ver: 1 },
    { id: 'DOC-0331', name: T('Building permit RM-BP-2015-0331 (copy)', 'رخصة البناء RM-BP-2015-0331 (نسخة)'), cat: 'legal', date: '2017-06-01', by: 'p_samer', size: '760 KB', prov: 'official', vis: 'owners', ver: 1 },
    { id: 'DOC-1028', name: T('Minutes — committee meeting 28 Oct 2026', 'محضر اجتماع اللجنة 28 ت١ 2026'), cat: 'governance', date: '2026-10-30', by: 'p_fadi', size: '420 KB', prov: 'submitted', vis: 'owners', ver: 1 },
    { id: 'DOC-0709', name: T('Attendance & proxy register — 9 Jul 2026', 'سجل الحضور والوكالات — 9 تموز 2026'), cat: 'governance', date: '2026-07-10', by: 'p_fadi', size: '260 KB', prov: 'submitted', vis: 'committee', ver: 1 },
  ];
  const DCAT = {
    legal: [T('Legal & registration', 'قانوني وتسجيل'), 'badgeCheck', 'navy'],
    governance: [T('Governance', 'الحوكمة'), 'gavel', 'violet'],
    financial: [T('Financial', 'مالي'), 'coins', 'mint'],
    contracts: [T('Contracts & insurance', 'العقود والتأمين'), 'contract', 'info'],
    technical: [T('Technical & safety', 'فني وسلامة'), 'wrench', 'warn'],
  };
  const VIS = { owners: T('All owners', 'جميع المالكين'), committee: T('Committee only', 'اللجنة فقط'), public: T('Public', 'عام') };

  /* Delegations & proxies (committee-level + general-assembly proxies) */
  const DELEGS = [
    { id: 'DG-01', kind: 'proxy', from: 'p_khaled', to: 'p_adel', units: ['1102', '803'], scope: T('General assemblies — all agenda items', 'الهيئات العامة — جميع بنود جدول الأعمال'), start: '2026-03-02', end: '2027-03-01', st: 'active', doc: 'DOC-0311' },
    { id: 'DG-02', kind: 'authority', from: 'p_samer', to: 'p_mona', units: [], scope: T('Approve maintenance work orders up to ₪1,500', 'الموافقة على أوامر الصيانة حتى 1,500 ₪'), start: '2025-02-01', end: '2027-01-14', st: 'active' },
    { id: 'DG-03', kind: 'authority', from: 'p_hiba', to: 'p_fadi', units: [], scope: T('Issue payment receipts while the treasurer is travelling', 'إصدار إيصالات الدفع أثناء سفر أمينة الصندوق'), start: '2026-08-01', end: '2026-08-31', st: 'expired' },
    { id: 'DG-04', kind: 'proxy', from: 'p_tariq', to: 'p_fadi', units: ['702'], scope: T('Assembly of 4 Dec 2026 — budget item only', 'هيئة 4 ك١ 2026 — بند الموازنة فقط'), start: '2026-11-21', end: '2026-12-04', st: 'active' },
    { id: 'DG-05', kind: 'proxy', from: 'p_nabil', to: 'p_samer', units: ['1003'], scope: T('Assembly of 4 Dec 2026 — all items', 'هيئة 4 ك١ 2026 — جميع البنود'), start: '2026-11-19', end: '2026-12-04', st: 'active' },
  ];
  const ROLES = [
    { id: 'chair', n: T('Chair', 'الرئيس'), p: 'p_samer' }, { id: 'treas', n: T('Treasurer', 'أمين الصندوق'), p: 'p_hiba' }, { id: 'sec', n: T('Secretary', 'أمين السر'), p: 'p_fadi' },
    { id: 'maint', n: T('Member — maintenance', 'عضو — الصيانة'), p: 'p_mona' }, { id: 'mem', n: T('Member', 'عضو'), p: 'p_adel' }, { id: 'owner', n: T('Owner (non-member)', 'مالك (غير عضو)'), p: null },
  ];
  const PERMS = [
    [T('Finance', 'المالية')],
    [T('View accounts and statements', 'عرض الحسابات والكشوفات'), 'y', 'y', 'y', 'y', 'y', 'p'],
    [T('Record payments and issue receipts', 'تسجيل الدفعات وإصدار الإيصالات'), 'n', 'y', 'p', 'n', 'n', 'n'],
    [T('Approve expenses up to ₪3,000', 'اعتماد المصاريف حتى 3,000 ₪'), 'y', 'n', 'n', 'p', 'n', 'n'],
    [T('Co-sign payments above ₪3,000', 'التوقيع المشترك للدفعات فوق 3,000 ₪'), 'y', 'y', 'n', 'n', 'n', 'n'],
    [T('Governance', 'الحوكمة')],
    [T('Call a general assembly', 'الدعوة لهيئة عامة'), 'y', 'n', 'p', 'n', 'n', 'n'],
    [T('Record minutes and attendance', 'تدوين المحاضر والحضور'), 'n', 'n', 'y', 'n', 'n', 'n'],
    [T('Register proxies', 'تسجيل الوكالات'), 'y', 'n', 'y', 'n', 'n', 'n'],
    [T('Vote in committee meetings', 'التصويت في اجتماعات اللجنة'), 'y', 'y', 'y', 'y', 'y', 'n'],
    [T('Vote in the general assembly (by share)', 'التصويت في الهيئة العامة (حسب الحصة)'), 'y', 'y', 'y', 'y', 'y', 'y'],
    [T('Operations', 'التشغيل')],
    [T('Approve maintenance requests', 'الموافقة على طلبات الصيانة'), 'y', 'n', 'n', 'y', 'n', 'n'],
    [T('Sign service contracts up to ₪15,000', 'توقيع عقود الخدمات حتى 15,000 ₪'), 'y', 'p', 'n', 'n', 'n', 'n'],
    [T('Publish announcements', 'نشر الإعلانات'), 'y', 'n', 'y', 'y', 'y', 'n'],
    [T('Manage the owners’ register', 'إدارة سجل المالكين'), 'n', 'n', 'y', 'n', 'n', 'n'],
  ];

  /* General-assembly attendance (MT-2612) — deterministic, weighted by unit share */
  const GA = meeting('MT-2612');
  const gaRows = (() => {
    const rng = B.rng(2612);
    const holders = ['p_samer', 'p_fadi', 'p_adel', 'p_hiba', 'p_mona'];
    const order = units.map((u, i) => ({ u, k: rng() + (u.kind === 'shop' ? 0.5 : 0) + (C.members.some((m) => m.unit === u.id) ? -1 : 0) })).sort((a, b) => a.k - b.k).map((x) => x.u);
    const fixed = { '1102': 'p_adel', '803': 'p_adel', '702': 'p_fadi', '1003': 'p_samer' };
    let nConf = 0, nProxy = 0;
    const out = {};
    units.forEach((u) => { if (fixed[u.number]) { out[u.id] = { st: 'cmProxy', holder: fixed[u.number] }; nProxy++; } });
    order.forEach((u) => {
      if (out[u.id]) return;
      if (nProxy < 6 && rng() < 0.18) { out[u.id] = { st: 'cmProxy', holder: B.pick(rng, holders) }; nProxy++; return; }
      if (nConf + nProxy < 29) { out[u.id] = { st: 'c2Confirmed' }; nConf++; return; }
      out[u.id] = { st: rng() < 0.12 ? 'cmApology' : 'c2NoReply' };
    });
    return units.map((u) => ({ u, id: u.id, number: u.number, owner: u.owner, share: share(u), ...out[u.id], ev: null }));
  })();
  const gaSync = () => {
    const att = gaRows.filter((r) => r.st === 'c2Confirmed' || r.st === 'cmProxy');
    GA.rsvpUnits = att.length; GA.proxies = gaRows.filter((r) => r.st === 'cmProxy').length;
    GA.rsvpShare = Math.round(B.sum(att, (r) => r.share) * 10) / 10;
  };
  gaSync();
  const BALLOT = [
    { id: 'GA-27-01', t: T('Approve the 2027 budget and monthly service charge', 'المصادقة على موازنة 2027 ورسوم الخدمات الشهرية'), thr: 50, rule: T('Simple majority of shares present', 'أغلبية بسيطة من الحصص الحاضرة'), adv: [61, 18, 6] },
    { id: 'GA-27-02', t: T('Elevator modernisation — award to LiftLine (₪86,400)', 'تحديث المصاعد — الترسية على لفت لاين (86,400 ₪)'), thr: 66.7, rule: T('Two-thirds of shares present (major works)', 'ثلثا الحصص الحاضرة (أعمال كبرى)'), adv: [58, 27, 15] },
    { id: 'GA-27-03', t: T('Commission a rooftop solar feasibility study (₪2,500)', 'تكليف دراسة جدوى للألواح الشمسية على السطح (2,500 ₪)'), thr: 50, rule: T('Simple majority of shares present', 'أغلبية بسيطة من الحصص الحاضرة'), adv: [72, 10, 18] },
  ];

  /* Expense ledger: Sep–Nov (Nov live from LEDGER) */
  const PAYEE = {
    cleaning: T('Sparkle Building Care', 'سباركل للعناية بالمباني'), elevator: T('LiftLine Elevators', 'لفت لاين للمصاعد'), electricity: T('Electricity utility', 'شركة الكهرباء'),
    pumps: T('PureTank Water Services', 'بيور تانك لخدمات المياه'), diesel: T('Masyoun Fuel Supplies', 'الماصيون لتوريد المحروقات'), security: T('Guardian Security', 'الحارس للأمن'),
    insurance: T('Demo Insurance Co.', 'شركة التأمين التجريبية'), reserve: T('Association reserve account', 'حساب احتياط الجمعية'),
  };
  const EXST = { 'EX-26-1108': 'c2CoSign' };
  const expenses = () => {
    const rows = [];
    [9, 10].forEach((mi) => {
      const mo = MONTHS[mi];
      monthCats[mi].forEach((c, k) => rows.push({ id: `EX-26-${String(mo.m + 1).padStart(2, '0')}${String(k + 1).padStart(2, '0')}`, date: `${mo.y}-${String(mo.m + 1).padStart(2, '0')}-${String(3 + k * 3).padStart(2, '0')}`, cat: c.id, payee: PAYEE[c.id], desc: T(`${cat(c.id).n.en} — ${B.monLong.call(null, mo.m)}`, ''), amount: c.v, mi }));
    });
    rows.push({ id: 'EX-26-0907', date: '2026-09-17', cat: 'project', payee: T('Bait Fix Handyman', 'بيت فيكس للصيانة'), desc: T('Lobby renovation — final payment (D-26-11)', 'ترميم الردهة — الدفعة النهائية (D-26-11)'), amount: 5900, mi: 9 });
    LEDGER.forEach((x) => rows.push({ ...x, mi: 11 }));
    return rows.map((x) => ({ ...x, st: EXST[x.id] || 'c2Paid', appr: x.amount > 3000 ? 'dual' : 'chair' })).sort(B.by('date', -1));
  };
  const catName = (id) => (id === 'project' ? L('Projects (approved by assembly)', 'مشاريع (معتمدة من الهيئة)') : tx(cat(id).n));
  const catIcon = (id) => (id === 'project' ? 'stairs' : cat(id).icon);
  const descOf = (x) => (x.desc && x.desc.ar === '' ? `${catName(x.cat)} — ${B.monLong(MONTHS[x.mi].m)}` : tx(x.desc));

  /* Budget 2026 vs draft 2027 */
  const DRAFT = { cleaning: 0, elevator: 8, electricity: 4, pumps: 0, diesel: 10, security: 5, insurance: 6, reserve: 20 };
  const ytd = (id) => B.sum(monthCats.slice(1), (row) => (row.find((c) => c.id === id) || {}).v || 0);
  const draftOf = (c) => Math.round((c.budget * (1 + DRAFT[c.id] / 100)) / 10) * 10;

  const back = (go, label) => `<button class="btn btn-text btn-sm" style="padding-inline:0;margin-bottom:6px" data-go="${go}">${icon('chevL', 'flip')}${label}</button>`;
  const sampleNote = (t) => `<div style="margin-top:18px">${ui.demoNote(t)}</div>`;

  /* ======================================================================
     Screen: Roles & delegations
     ====================================================================== */
  function roles() {
    const sel = B.get('c2:dg', '');
    const fil = B.get('c2:dgf', 'all');
    const list = DELEGS.filter((d) => fil === 'all' || d.kind === fil);
    const d = DELEGS.find((x) => x.id === sel);
    const panel = d ? ek.panel({
      close: 'c2:dg', title: d.kind === 'proxy' ? L('Voting proxy', 'وكالة تصويت') : L('Delegated authority', 'تفويض صلاحية'), sub: ui.idMono(d.id),
      badges: ui.status(d.st === 'active' ? 'active' : d.st === 'revoked' ? 'c2Revoked' : 'expired'),
      body: `<div class="row" style="gap:10px">${ui.avatar(D.person(d.from).name)}<div class="grow" style="min-width:0"><b class="small">${P(d.from)}</b><div class="xs faint">${L('Grantor', 'المانح')}</div></div>${icon('arrowRight', 'flip faint')}${ui.avatar(D.person(d.to).name)}<div class="grow" style="min-width:0"><b class="small">${P(d.to)}</b><div class="xs faint">${L('Holder', 'الحامل')}</div></div></div>
        ${ek.ps(L('Scope', 'النطاق'), `<p class="small">${tx(d.scope)}</p>`)}
        ${ui.kv([[L('Units covered', 'الوحدات المشمولة'), d.units.length ? d.units.map((n) => `${n} · ${shareStr(units.find((u) => u.number === n) || units[0])}`).join('<br>') : L('— (personal authority)', '— (صلاحية شخصية)')], [L('Valid from', 'سارية من'), B.date(d.start)], [L('Valid until', 'سارية حتى'), B.date(d.end)], [L('Evidence', 'الإثبات'), d.doc ? `<button class="link-btn" data-act="previewDoc" data-arg="${esc(tx(DOCREG.find((x) => x.id === d.doc).name))}.pdf">${L('Signed form', 'النموذج الموقّع')}</button>` : L('Committee minutes', 'محضر اللجنة')]])}
        ${ui.callout(d.kind === 'proxy' ? L('A proxy lets the holder vote the grantor’s unit shares within the stated scope. It does not transfer ownership.', 'تتيح الوكالة لحاملها التصويت بحصص وحدة المانح ضمن النطاق المحدد، ولا تنقل الملكية.') : L('Delegations must stay within the bylaws (art. 14). They are recorded here for transparency.', 'يجب أن تبقى التفويضات ضمن النظام الداخلي (المادة 14). وتُسجّل هنا للشفافية.'), '', 'info')}`,
      foot: d.st === 'active' ? `${ui.btn(L('Revoke', 'إلغاء'), { icon: 'xCircle', kind: 'ghost', act: 'c2Revoke', arg: d.id })}${ui.btn(L('Extend', 'تمديد'), { icon: 'calendar', kind: 'primary', act: 'c2Extend', arg: d.id })}` : ui.btn(L('Renew', 'تجديد'), { icon: 'refresh', kind: 'primary', act: 'c2Extend', arg: d.id }),
    }) : '';
    const matrix = `<div class="ek-scroll"><table class="ek-matrix"><thead><tr><th>${L('Permission', 'الصلاحية')}</th>${ROLES.map((r) => `<th>${tx(r.n)}${r.p ? `<div class="xs faint" style="font-weight:500;margin-top:2px">${P(r.p)}</div>` : ''}</th>`).join('')}</tr></thead><tbody>
      ${PERMS.map((row) => row.length === 1 ? `<tr class="grp"><td colspan="${ROLES.length + 1}">${tx(row[0])}</td></tr>` : `<tr><td>${tx(row[0])}</td>${row.slice(1).map((v, i) => `<td class="${i === 0 ? 'on' : ''}">${ek.mark(v)}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div><div class="row-sm wrap xs faint" style="margin-top:10px;gap:14px"><span class="ek-flag y">${icon('checkCircle')}${L('Allowed', 'مسموح')}</span><span class="ek-flag p">${icon('clock')}${L('With conditions / co-signature', 'بشروط / توقيع مشترك')}</span><span class="ek-flag x">${icon('minus')}${L('Not allowed', 'غير مسموح')}</span><span>${L('Source: association bylaws, art. 9–14 (as amended 2025)', 'المصدر: النظام الداخلي للجمعية، المواد 9–14 (معدّل 2025)')}</span></div>`;
    return `<div class="ek-page">${ek.head({ eyebrow: L('Association', 'الجمعية'), title: L('Roles & delegations', 'الأدوار والتفويضات'), sub: L('Who may do what on behalf of the association, spending thresholds, and every proxy or delegated authority on record.', 'من يحق له التصرف باسم الجمعية، وحدود الإنفاق، وكل وكالة أو تفويض مسجّل.'), actions: ui.btn(L('Export matrix', 'تصدير المصفوفة'), { icon: 'download', act: 'previewDoc', arg: L('Authority matrix.pdf', 'مصفوفة الصلاحيات.pdf') }) + ui.btn(L('New delegation', 'تفويض جديد'), { icon: 'plus', kind: 'primary', act: 'c2NewDeleg' }) })}
      <div class="c2-tiers">
        <div class="c2-tier"><span class="w">${L('Chair alone', 'الرئيس منفرداً')}</span><b>≤ ${B.money(3000)}</b><span>${L('Routine repairs, emergency callouts, consumables', 'الإصلاحات الروتينية واستدعاءات الطوارئ والمستهلكات')}</span></div>
        <div class="c2-tier"><span class="w">${L('Chair + treasurer', 'الرئيس + أمين الصندوق')}</span><b>≤ ${B.money(15000)}</b><span>${L('Service contracts, planned works', 'عقود الخدمات والأعمال المخطط لها')}</span></div>
        <div class="c2-tier"><span class="w">${L('General assembly', 'الهيئة العامة')}</span><b>&gt; ${B.money(15000)}</b><span>${L('Major works, special levies, annual budget', 'الأعمال الكبرى والمساهمات الخاصة والموازنة السنوية')}</span></div>
      </div>
      <div class="ek-card-t"><div><h3>${L('Authority matrix', 'مصفوفة الصلاحيات')}</h3><div class="sub">${L('Committee term 2025 – 2027 · 5 seats', 'دورة اللجنة 2025 – 2027 · 5 مقاعد')}</div></div></div>
      ${matrix}
      <div class="ek-sec">${L('Delegations & proxies', 'التفويضات والوكالات')}</div>
      ${ek.split(`<div>${ek.tb(`${ui.seg('c2:dgf', [{ id: 'all', label: L('All', 'الكل') }, { id: 'proxy', label: L('Voting proxies', 'وكالات التصويت') }, { id: 'authority', label: L('Delegated authority', 'تفويض الصلاحيات') }], fil)}<span class="sp"></span><span class="cnt">${L(`${list.filter((x) => x.st === 'active').length} active`, `${list.filter((x) => x.st === 'active').length} سارية`)}</span>`)}
        ${ek.selStyle('c2-dgt', sel)}${ui.table({ id: 'c2-dgt', cls: 'c2-dgt', rows: list, rowAct: (x) => ({ act: 'set', arg: `c2:dg=${x.id}` }), cols: [
          { key: 'from', label: L('From → to', 'من ← إلى'), m: 'title', render: (x) => `<span class="ek-cell">${ui.avatar(D.person(x.from).name)}<span style="min-width:0"><span class="t">${P(x.from)} → ${P(x.to)}</span><span class="d">${ui.idMono(x.id)}</span></span></span>`, mRender: (x) => `${P(x.from)} → ${P(x.to)}` },
          { key: 'kind', label: L('Type', 'النوع'), m: 'meta', render: (x) => x.kind === 'proxy' ? ui.badge(L('Proxy', 'وكالة'), 'violet', 'userCheck') : ui.badge(L('Authority', 'صلاحية'), 'info', 'key') },
          { key: 'scope', label: L('Scope', 'النطاق'), m: 'sub', render: (x) => `<span class="small">${tx(x.scope)}</span>` },
          { key: 'end', label: L('Until', 'حتى'), sort: true, m: 'meta', render: (x) => `<span class="ek-num">${B.date(x.end)}</span>` },
          { key: 'st', label: L('Status', 'الحالة'), m: 'end', render: (x) => ui.status(x.st === 'active' ? 'active' : x.st === 'revoked' ? 'c2Revoked' : 'expired') },
        ] })}</div>`, panel)}
      ${sampleNote(L('The authority matrix reflects this association’s own bylaws as entered by the committee. It is not legal advice.', 'تعكس مصفوفة الصلاحيات النظام الداخلي لهذه الجمعية كما أدخلته اللجنة، وليست استشارة قانونية.'))}</div>`;
  }

  /* ======================================================================
     Screen: Legal & administrative status
     ====================================================================== */
  const EVIDENCE = [
    ['y', T('Registration certificate', 'شهادة التسجيل'), T('OA-RAM-2018-0217 · checked against the sample registry reference', 'OA-RAM-2018-0217 · مطابقة مع مرجع السجل النموذجي'), 'official'],
    ['y', T('Bylaws adopted by the general assembly', 'نظام داخلي أقرّته الهيئة العامة'), T('Version 3 · amended 15 Jan 2025', 'الإصدار 3 · معدّل 15 ك٢ 2025'), 'submitted'],
    ['y', T('Minutes electing the current committee', 'محضر انتخاب اللجنة الحالية'), T('Term 2025 – 2027 · 5 seats', 'الدورة 2025 – 2027 · 5 مقاعد'), 'submitted'],
    ['y', T('Bank mandate with dual signatories', 'تفويض بنكي بتوقيع مزدوج'), T('Chair + treasurer · account ••• 4410', 'الرئيس + أمين الصندوق · حساب ••• 4410'), 'submitted'],
    ['p', T('Owners’ register reconciled with ownership records', 'مطابقة سجل المالكين مع سجلات الملكية'), T('51 of 54 units matched · 3 awaiting documents', '51 من 54 وحدة مطابقة · 3 بانتظار المستندات'), 'pending'],
    ['n', T('Municipal recognition letter', 'كتاب اعتراف من البلدية'), T('Not on file — not required for registration; upload if issued', 'غير موجود — غير مطلوب للتسجيل؛ يُرفع عند صدوره'), null],
  ];
  function legal() {
    const others = Object.values(D.committees);
    const mine = C.kind;
    const DOCSTATE = (c) => c.kind === 'legal' ? ['y', L('Registration documented', 'التسجيل موثّق')] : c.kind === 'authorized' ? ['p', L('Power of attorney on file', 'الوكالة مودعة')] : ['x', L('No legal registration', 'لا يوجد تسجيل قانوني')];
    const kinds = [
      ['legal', 'badgeCheck', T('Formally documented owners’ association', 'جمعية مالكين موثّقة رسمياً'), T('A registered entity with bylaws, an elected committee and a bank account. Its decisions bind all owners within the law and the bylaws.', 'كيان مسجّل له نظام داخلي ولجنة منتخبة وحساب بنكي. قراراته ملزمة لجميع المالكين ضمن القانون والنظام الداخلي.')],
      ['informal', 'users', T('Informal building committee', 'لجنة مبنى غير رسمية'), T('Volunteers agreed in a residents’ meeting. Useful for coordination, but contributions are voluntary and it cannot sign binding contracts for all owners.', 'متطوعون باتفاق في اجتماع للسكان. مفيدة للتنسيق، لكن المساهمات طوعية ولا يمكنها توقيع عقود ملزمة لجميع المالكين.')],
      ['authorized', 'key', T('Authorized manager', 'مدير مفوّض'), T('One person acting under a power of attorney signed by owners — only within the scope written in that document.', 'شخص واحد يعمل بموجب وكالة موقّعة من المالكين — وضمن النطاق المكتوب فيها فقط.')],
    ];
    return `<div class="ek-page">${ek.head({ eyebrow: L('Association', 'الجمعية'), title: L('Legal & administrative status', 'الوضع القانوني والإداري'), sub: L('What is formally documented about this association — and what is not. BENA records evidence; it never assigns legal status.', 'ما هو موثّق رسمياً عن هذه الجمعية — وما ليس موثّقاً. تسجّل بينا الأدلة ولا تمنح أي صفة قانونية.'), actions: ui.btn(L('Upload evidence', 'رفع إثبات'), { icon: 'upload', act: 'cmUpload' }) + ui.btn(L('Request review', 'طلب مراجعة'), { icon: 'shieldCheck', kind: 'primary', act: 'c2Review' }) })}
      <div class="c2-legal-hero">
        <div>
          <div class="row-sm wrap">${ui.status('legal')}${ui.prov('official')}${ui.idMono(C.regNo)}</div>
          <h2>${tx(C.name)}</h2>
          <p class="muted small">${tx(C.basis)}</p>
          <div style="margin-top:14px">${EVIDENCE.map(([k, t, s, pv]) => `<div class="c2-ev"><span class="${k}">${icon(k === 'y' ? 'checkCircle' : k === 'p' ? 'clock' : 'xCircle')}</span><div><b style="font-weight:600">${tx(t)}</b><small>${tx(s)}</small></div><div>${pv ? ui.prov(pv) : `<span class="badge outline">${L('Not documented', 'غير موثّق')}</span>`}</div></div>`).join('')}</div>
        </div>
        <div class="side">
          <div class="sec-l eyebrow" style="margin-bottom:10px">${L('Administrative record', 'السجل الإداري')}</div>
          ${ui.kv([[L('Type on record', 'النوع المسجّل'), ui.statusLabel('legal')], [L('Registration no.', 'رقم التسجيل'), ui.idMono(C.regNo)], [L('Formed', 'تاريخ التأسيس'), B.date(C.formed)], [L('Committee term', 'دورة اللجنة'), tx(C.term) + ` · ${L('ends Jan 2027', 'تنتهي ك٢ 2027')}`], [L('Authorised signatories', 'المفوّضون بالتوقيع'), `${P('p_samer')} + ${P('p_hiba')}`], [L('Bank account', 'الحساب البنكي'), tx(C.bank)], [L('Building', 'المبنى'), `<button class="link-btn" data-go="${R}-building-${BID}">${tx(bld.name)}</button>`], [L('BENA Building ID', 'رقم بينا للمبنى'), ui.idMono(BID)], [L('Units represented', 'الوحدات الممثّلة'), `${units.length} / ${units.length}`]])}
          <div style="margin-top:14px">${ui.callout(L('<b>BENA Building ID is a digital reference identity, not proof of legal ownership.</b> Registration references shown here are sample data and are not connected to any official registry.', '<b>رقم بينا للمبنى هوية مرجعية رقمية وليس إثباتاً للملكية القانونية.</b> مراجع التسجيل المعروضة بيانات نموذجية وغير متصلة بأي سجل رسمي.'), 'warn', 'alertCircle')}</div>
        </div>
      </div>
      <div class="ek-sec">${L('Three different governance arrangements', 'ثلاثة ترتيبات حوكمة مختلفة')}</div>
      <div class="c2-kinds">${kinds.map(([k, ic, t, d]) => `<div class="c2-kind ${k}">${ui.status(k)}<h4>${tx(t)}</h4><p>${tx(d)}</p>${k === mine ? `<div class="here">${icon('checkCircle')}${L('This association — documented', 'هذه الجمعية — موثّقة')}</div>` : ''}</div>`).join('')}</div>
      <div class="ek-card-t"><div><h3>${L('What each arrangement can do', 'ما يمكن لكل ترتيب القيام به')}</h3><div class="sub">${L('General guidance shown for transparency — the documents on file decide', 'إرشاد عام للشفافية — المستندات المودعة هي المرجع')}</div></div></div>
      <div class="ek-scroll"><table class="ek-matrix"><thead><tr><th>${L('Capability', 'القدرة')}</th><th>${L('Documented association', 'جمعية موثّقة')}</th><th>${L('Informal committee', 'لجنة غير رسمية')}</th><th>${L('Authorized manager', 'مدير مفوّض')}</th></tr></thead><tbody>
        ${K.CAPS.map((c) => `<tr><td>${tx(c[0])}</td>${c.slice(1).map((v, i) => `<td class="${i === 0 ? 'on' : ''}">${ek.mark(v === 'n' ? 'n' : v)}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div>
      <div class="ek-sec">${L('Governance bodies on BENA (sample area)', 'هيئات الحوكمة على بينا (المنطقة النموذجية)')}</div>
      ${ui.table({ id: 'c2-bodies', rows: others, rowGo: (c) => `${R}-building-${c.building}`, cols: [
        { key: 'name', label: L('Body', 'الهيئة'), m: 'title', render: (c) => ek.cell(K.GOV[c.kind]?.icon || 'users', tx(c.name), tx(D.building(c.building).name), c.kind === 'legal' ? 'navy' : c.kind === 'authorized' ? 'info' : ''), mRender: (c) => tx(c.name) },
        { key: 'kind', label: L('Arrangement', 'الترتيب'), m: 'meta', render: (c) => ui.status(c.kind) },
        { key: 'basis', label: L('Basis on file', 'الأساس المودع'), m: 'sub', render: (c) => `<span class="small">${tx(c.basis)}</span>` },
        { key: 'doc', label: L('Documentation', 'التوثيق'), m: 'end', render: (c) => ek.flag(...DOCSTATE(c)) },
      ] })}
      ${sampleNote(L('Committees are never upgraded automatically: an informal committee stays informal on BENA until registration documents are submitted and checked.', 'لا تُرقّى اللجان تلقائياً: تبقى اللجنة غير الرسمية كذلك على بينا حتى تُقدَّم مستندات التسجيل ويتم التحقق منها.'))}</div>`;
  }

  /* ======================================================================
     Screen: Documents
     ====================================================================== */
  function documents() {
    const q = B.get('c2:dq', ''), fc = B.get('c2:dc', 'all'), sel = B.get('c2:doc', '');
    const rows = DOCREG.filter((d) => (fc === 'all' || d.cat === fc) && B.match(q, d.name, d.id));
    const d = DOCREG.find((x) => x.id === sel);
    const panel = d ? ek.panel({ close: 'c2:doc', lead: `<span class="li-icon ${DCAT[d.cat][2]}">${icon(DCAT[d.cat][1])}</span>`, title: `<bdi>${tx(d.name)}</bdi>`, sub: `${ui.idMono(d.id)} · PDF · ${d.size}`, badges: ui.prov(d.prov) + (d.draft ? ui.status('c2Draft') : ''),
      body: `${ek.docPrev(`<bdi>${tx(d.name)}</bdi>`)}
        ${ui.kv([[L('Category', 'الفئة'), tx(DCAT[d.cat][0])], [L('Uploaded by', 'رفعه'), P(d.by)], [L('Date', 'التاريخ'), B.date(d.date)], [L('Version', 'الإصدار'), `v${d.ver}${d.ver > 1 ? ` · ${L(`${d.ver - 1} earlier`, `${d.ver - 1} سابقة`)}` : ''}`], [L('Visible to', 'مرئي لـ'), tx(VIS[d.vis])], [L('Provenance', 'المصدر'), tx(ui.PROV[d.prov].hint)]])}
        ${ek.ps(L('Access log', 'سجل الوصول'), ui.timeline([{ title: L('Viewed by 12 owners', 'شاهده 12 مالكاً'), meta: L('Last 30 days', 'آخر 30 يوماً'), state: 'done', icon: 'eye' }, { title: L(`Uploaded by ${P(d.by)}`, `رفعه ${P(d.by)}`), meta: B.date(d.date), state: 'done', icon: 'upload' }]))}`,
      foot: `${ui.btn(L('Share', 'مشاركة'), { icon: 'share', act: 'soon', arg: L('Sharing', 'المشاركة') })}${ui.btn(L('New version', 'إصدار جديد'), { icon: 'upload', act: 'cmUpload' })}${ui.btn(L('Open', 'فتح'), { icon: 'eye', kind: 'primary', act: 'previewDoc', arg: tx(d.name) + '.pdf' })}` }) : '';
    const counts = Object.fromEntries(Object.keys(DCAT).map((k) => [k, DOCREG.filter((x) => x.cat === k).length]));
    return `<div class="ek-page">${ek.head({ eyebrow: L('Association', 'الجمعية'), title: L('Documents', 'المستندات'), sub: L('The association’s record: registration, bylaws, minutes, contracts, certificates and accounts — with provenance and access.', 'سجل الجمعية: التسجيل والنظام الداخلي والمحاضر والعقود والشهادات والحسابات — مع المصدر وصلاحيات الوصول.'), actions: ui.btn(L('Upload', 'رفع'), { icon: 'upload', kind: 'primary', act: 'cmUpload' }) })}
      ${ek.strip([{ l: L('Documents', 'المستندات'), v: DOCREG.length, s: L('16 files · 10.9 MB', '16 ملفاً · 10.9 ميغابايت'), icon: 'folder' }, { l: L('Source-linked', 'مرتبطة بمصدر'), v: DOCREG.filter((x) => x.prov === 'official').length, s: L('Sample registry references', 'مراجع سجل نموذجية'), icon: 'landmark' }, { l: L('Pending verification', 'بانتظار التحقق'), v: DOCREG.filter((x) => x.prov === 'pending').length, s: L('Elevator certificate', 'شهادة المصاعد'), tone: 'warn', icon: 'clock' }, { l: L('Expiring in 90 days', 'تنتهي خلال 90 يوماً'), v: 1, s: L('Insurance policy · 1 Jan 2027', 'بوليصة التأمين · 1 ك٢ 2027'), tone: 'warn', icon: 'alertCircle' }])}
      ${ek.split(`<div>${ek.tb(`${ui.search('c2:dq', L('Search documents or IDs', 'ابحث في المستندات أو الأرقام'))}${ui.select('c2:dc', [{ v: 'all', l: L('All categories', 'كل الفئات') }].concat(Object.entries(DCAT).map(([k, v]) => ({ v: k, l: `${tx(v[0])} (${counts[k]})` }))), { label: L('Category', 'الفئة') })}<span class="sp"></span><span class="cnt">${L(`${rows.length} documents`, `${rows.length} مستند`)}</span>`)}
        ${ek.selStyle('c2-doct', sel)}${ui.table({ id: 'c2-doct', cls: 'c2-doct', rows, defaultSort: '-date', pageSize: 12, rowAct: (x) => ({ act: 'set', arg: `c2:doc=${x.id}` }), cols: [
          { key: 'name', label: L('Document', 'المستند'), sort: (x) => tx(x.name), m: 'title', render: (x) => ek.cell(DCAT[x.cat][1], `<bdi>${tx(x.name)}</bdi>`, `${ui.idMono(x.id)} · v${x.ver} · ${x.size}`, DCAT[x.cat][2]), mRender: (x) => `<bdi>${tx(x.name)}</bdi>` },
          { key: 'cat', label: L('Category', 'الفئة'), m: 'meta', render: (x) => `<span class="small">${tx(DCAT[x.cat][0])}</span>` },
          { key: 'vis', label: L('Visible to', 'مرئي لـ'), m: 'meta', render: (x) => `<span class="small nowrap">${tx(VIS[x.vis])}</span>` },
          { key: 'prov', label: L('Provenance', 'المصدر'), m: 'sub', render: (x) => ui.prov(x.prov) },
          { key: 'date', label: L('Date', 'التاريخ'), sort: true, align: 'end', m: 'end', render: (x) => `<span class="ek-num small">${B.date(x.date)}</span>` },
        ] })}</div>`, panel)}
      <div style="margin-top:14px">${ui.provLegend()}</div></div>`;
  }

  /* ======================================================================
     Screen: Meeting minutes
     ====================================================================== */
  function minutes() {
    const list = MEETINGS.filter((m) => m.minutes).sort(B.by('date', -1));
    const draftM = MEETINGS.find((m) => m.id === 'MT-2611');
    const sel = B.get('c2:min', list[0].id);
    const m = meeting(sel) || list[0];
    const isGA = m.kind !== 'committee';
    const isDraft = !m.minutes;
    const att = isGA ? '' : `<div class="c2-att">${C.members.map((x) => { const st = (m.attend || {})[x.p] || 'cmAbsent'; return `<span class="${st === 'cmPresent' || st === 'cmProxy' ? '' : 'off'}">${ui.avatar(D.person(x.p).name)}${P(x.p)} · ${ui.statusLabel(st)}</span>`; }).join('')}</div>`;
    const doc = `<article class="c2-minutes">
      <div class="mh"><div><div class="row-sm wrap" style="margin-bottom:8px">${ui.status(kindStatus(m.kind))}${isDraft ? ui.status('c2Draft') : ui.status('c2Approved')}</div><h2>${L('Minutes', 'محضر')} — ${tx(m.title)}</h2><div class="small muted" style="margin-top:4px">${B.date(m.date)} · ${m.time} · ${tx(m.place)}</div></div><div class="brand dark" style="align-self:flex-start">${B.logo(24)}<span style="font-size:14px">BENA</span></div></div>
      <h4>${L('Attendance', 'الحضور')}</h4>
      ${isGA ? `<p>${L(`Owners of ${m.presentUnits} units present in person or by proxy (${m.proxyUnits} by proxy), representing ${B.num1(m.present)}% of unit shares. Quorum required: ${m.quorumReq}%.`, `حضر مالكو ${m.presentUnits} وحدة شخصياً أو بالوكالة (${m.proxyUnits} بالوكالة)، يمثلون ${B.num1(m.present)}% من حصص الوحدات. النصاب المطلوب: ${m.quorumReq}%.`)}</p>` : isDraft ? `<p>${L('Attendance will be captured at the meeting.', 'سيُسجَّل الحضور خلال الاجتماع.')}</p>` : att}
      <h4>${L('Agenda', 'جدول الأعمال')}</h4><ol>${m.agenda.map(([t]) => `<li>${tx(t)}</li>`).join('')}</ol>
      <h4>${L('Proceedings', 'وقائع الجلسة')}</h4>
      ${isDraft ? `<p class="faint">${L('Draft template prepared by the secretary. Notes are added during the meeting and circulated for approval within 7 days.', 'مسودة أعدّها أمين السر. تُضاف الملاحظات خلال الاجتماع وتُعمَّم للاعتماد خلال 7 أيام.')}</p>` : m.minutes.map((p) => `<p>${tx(p)}</p>`).join('')}
      ${m.res ? `<h4>${L('Resolutions', 'القرارات')}</h4>${m.res.map((r) => `<div class="c2-res"><div class="row between" style="align-items:flex-start;gap:10px;margin-bottom:8px"><b>${ui.idMono(r.id)} ${tx(r.t)}</b>${ui.status(r.st)}</div>${voteBar(r)}</div>`).join('')}` : ''}
      <div class="c2-sign"><div><b>${P('p_samer')}</b>${L('Chair', 'الرئيس')}${isDraft ? '' : ` · ${L('signed', 'وُقّع')}`}</div><div><b>${P('p_fadi')}</b>${L('Secretary', 'أمين السر')}${isDraft ? '' : ` · ${L('signed', 'وُقّع')}`}</div></div>
    </article>`;
    const side = `<div><div class="ek-card-t"><h3>${L('Minutes register', 'سجل المحاضر')}</h3><span class="xs faint">${list.length + 1}</span></div><div class="c2-mlist">
      ${[draftM].concat(list).filter(Boolean).map((x) => `<button class="c2-mi ${x.id === m.id ? 'on' : ''}" data-act="set" data-arg="c2:min=${x.id}">${dateTile(x.date, x.kind !== 'committee' ? 'ga' : '')}<span style="min-width:0"><b class="truncate">${tx(x.title)}</b><small>${x.minutes ? L('Approved', 'مُعتمد') : L('Draft · meeting upcoming', 'مسودة · الاجتماع قادم')} · ${ui.idMono(x.id)}</small></span></button>`).join('')}
      </div></div>`;
    return `<div class="ek-page">${ek.head({ eyebrow: L('Governance', 'الحوكمة'), title: L('Meeting minutes', 'محاضر الاجتماعات'), sub: L('Approved minutes of the committee and the general assembly, signed by the chair and the secretary.', 'المحاضر المعتمدة للجنة والهيئة العامة، موقّعة من الرئيس وأمين السر.'),
      actions: (isDraft ? ui.btn(L('Edit draft', 'تحرير المسودة'), { icon: 'edit', act: 'c2EditMin', arg: m.id }) : ui.btn(L('Share with owners', 'مشاركة مع المالكين'), { icon: 'share', act: 'cmShareMinutes' })) + ui.btn(L('Open meeting', 'فتح الاجتماع'), { icon: 'calendar', go: `${R}-meeting-${m.id}` }) + ui.btn(L('Export PDF', 'تصدير PDF'), { icon: 'download', kind: 'primary', act: 'previewDoc', arg: `${L('Minutes', 'محضر')} ${m.id}.pdf` }) })}
      ${ek.split(side, doc, 'left')}</div>`;
  }

  /* ======================================================================
     Screen: Decisions (resolutions register)
     ====================================================================== */
  function decisions() {
    const q = B.get('c2:rq', ''), body = B.get('c2:rb', 'all'), st = B.get('c2:rs', 'all'), sel = B.get('c2:res', '');
    const all = ALL_RES();
    const rows = all.filter((r) => (body === 'all' || (body === 'ga' ? r.m.kind !== 'committee' : r.m.kind === 'committee')) && (st === 'all' || r.st === st) && B.match(q, r.t, r.id));
    const r = all.find((x) => x.id === sel);
    const im = (x) => IMPL[x.id] || ['c2Doing', T('Follow-up in progress', 'المتابعة جارية'), 'p_samer'];
    const panel = r ? ek.panel({ close: 'c2:res', title: tx(r.t), sub: `${ui.idMono(r.id)} · ${tx(r.m.title)}`, badges: ui.status(r.st) + ui.status(im(r)[0]),
      body: `${ek.ps(r.mode === 'share' ? L('Result — weighted by unit share', 'النتيجة — مرجّحة حسب حصة الوحدة') : L('Result — one vote per member', 'النتيجة — صوت لكل عضو'), voteBar(r))}
        ${ui.kv([[L('Decided by', 'الجهة المقرّرة'), ui.statusLabel(kindStatus(r.m.kind))], [L('Date', 'التاريخ'), B.date(r.m.date)], [L('Majority rule', 'قاعدة الأغلبية'), r.thr ? L(`${B.num1(r.thr)}% of shares`, `${B.num1(r.thr)}% من الحصص`) : L('Simple majority of members', 'أغلبية بسيطة من الأعضاء')], [L('Responsible', 'المسؤول'), P(im(r)[2])]])}
        ${ek.ps(L('Implementation', 'التنفيذ'), ui.timeline([{ title: L('Resolution recorded in the minutes', 'تسجيل القرار في المحضر'), meta: B.date(r.m.date), state: 'done' }, { title: tx(im(r)[1]), meta: ui.statusLabel(im(r)[0]), state: im(r)[0] === 'c2Done' ? 'done' : im(r)[0] === 'c2Deferred' ? '' : 'current' }]))}`,
      foot: `${ui.btn(L('Minutes', 'المحضر'), { icon: 'doc', act: 'c2OpenMin', arg: r.m.id })}${ui.btn(L('Open meeting', 'فتح الاجتماع'), { icon: 'calendar', kind: 'primary', go: `${R}-meeting-${r.m.id}` })}` }) : '';
    const passed = all.filter((x) => x.st === 'passed').length;
    return `<div class="ek-page">${ek.head({ eyebrow: L('Governance', 'الحوكمة'), title: L('Decisions', 'القرارات'), sub: L('Register of every resolution of the committee and the general assembly, with voting results and implementation follow-up.', 'سجل كل قرارات اللجنة والهيئة العامة، مع نتائج التصويت ومتابعة التنفيذ.'), actions: ui.btn(L('Export register', 'تصدير السجل'), { icon: 'download', act: 'previewDoc', arg: L('Resolutions register 2026.pdf', 'سجل القرارات 2026.pdf') }) })}
      ${ek.strip([{ l: L('Resolutions in 2026', 'قرارات 2026'), v: all.length, icon: 'gavel' }, { l: L('Passed', 'أُقرّت'), v: passed, s: L(`${all.length - passed} not passed`, `${all.length - passed} لم تُقرّ`), icon: 'checkCircle' }, { l: L('Implemented', 'نُفّذت'), v: all.filter((x) => im(x)[0] === 'c2Done').length, s: L('of passed resolutions', 'من القرارات المُقرّة'), tone: 'ok', icon: 'check' }, { l: L('Open follow-ups', 'متابعات مفتوحة'), v: all.filter((x) => ['c2Doing', 'c2Sched'].includes(im(x)[0])).length, s: L('Tank cleaning on 3 Dec', 'تنظيف الخزانات في 3 ك١'), tone: 'warn', icon: 'clock' }])}
      ${ek.split(`<div>${ek.tb(`${ui.search('c2:rq', L('Search resolutions', 'ابحث في القرارات'))}${ui.select('c2:rb', [{ v: 'all', l: L('All bodies', 'كل الجهات') }, { v: 'ga', l: L('General assembly', 'الهيئة العامة') }, { v: 'committee', l: L('Committee', 'اللجنة') }])}${ui.select('c2:rs', [{ v: 'all', l: L('Any result', 'أي نتيجة') }, { v: 'passed', l: L('Passed', 'أُقرّ') }, { v: 'failed', l: L('Not passed', 'لم يُقرّ') }])}`)}
        ${ek.selStyle('c2-rt', sel)}${ui.table({ id: 'c2-rt', cls: 'c2-rt', rows, rowAct: (x) => ({ act: 'set', arg: `c2:res=${x.id}` }), cols: [
          { key: 'id', label: L('Resolution', 'القرار'), m: 'title', render: (x) => `<span class="ek-cell"><span style="min-width:0"><span class="t">${tx(x.t)}</span><span class="d">${ui.idMono(x.id)} · ${ui.statusLabel(kindStatus(x.m.kind))}</span></span></span>`, mRender: (x) => tx(x.t) },
          { key: 'date', label: L('Date', 'التاريخ'), sort: (x) => x.m.date, m: 'meta', render: (x) => `<span class="ek-num small">${B.date(x.m.date)}</span>` },
          { key: 'res', label: L('In favour', 'مؤيد'), m: 'meta', render: (x) => `<span class="ek-num"><b>${x.mode === 'share' ? B.num1(x.v[0]) + '%' : `${x.v[0]}/${B.sum(x.v)}`}</b></span>` },
          { key: 'st', label: L('Result', 'النتيجة'), m: 'end', render: (x) => ui.status(x.st) },
          { key: 'im', label: L('Implementation', 'التنفيذ'), m: 'sub', render: (x) => ui.status(im(x)[0]) },
        ] })}</div>`, panel)}</div>`;
  }

  /* ======================================================================
     Screen: Voting (weighted shares, proxies)
     ====================================================================== */
  function voting() {
    const fil = B.get('c2:vf', 'all'), q = B.get('c2:vq', '');
    const att = gaRows.filter((r) => r.st === 'c2Confirmed' || r.st === 'cmProxy');
    const shareAtt = B.sum(att, (r) => r.share);
    const rows = gaRows.filter((r) => (fil === 'all' || (fil === 'att' ? (r.st === 'c2Confirmed' || r.st === 'cmProxy') : fil === 'proxy' ? r.st === 'cmProxy' : r.st === 'c2NoReply' || r.st === 'cmApology')) && B.match(q, r.number, D.person(r.owner).name));
    const past = ALL_RES().filter((r) => r.mode === 'share').sort((a, b) => (a.m.date < b.m.date ? 1 : -1));
    const ballot = BALLOT.map((b) => {
      const [f, a, ab] = b.adv; const tot = f + a + ab;
      const forPct = (f / tot) * 100;
      return `<div class="c2-ballot"><div class="top"><div style="min-width:0"><b>${tx(b.t)}</b><small>${ui.idMono(b.id)} · ${tx(b.rule)}</small></div>${forPct >= b.thr ? ui.badge(L('On track', 'على المسار'), 'ok', 'trend') : ui.badge(L('Below threshold', 'دون العتبة'), 'warn', 'alertCircle')}</div>
        <div class="xs faint">${L('Advance e-votes received (share of confirmed attendance)', 'التصويت الإلكتروني المسبق (من الحضور المؤكد)')}</div>
        <div class="c2-q"><i class="${forPct >= b.thr ? '' : 'warn'}" style="width:${forPct}%"></i><em style="inset-inline-start:${b.thr}%"></em></div>
        <div class="cm-vote-l"><span><i style="background:${VOTE_C[0]}"></i>${VOTE_L()[0]} <b>${B.num1(forPct)}%</b></span><span><i style="background:${VOTE_C[1]}"></i>${VOTE_L()[1]} <b>${B.num1((a / tot) * 100)}%</b></span><span><i style="background:${VOTE_C[2]}"></i>${VOTE_L()[2]} <b>${B.num1((ab / tot) * 100)}%</b></span><span class="faint">▏${L(`Threshold ${B.num1(b.thr)}%`, `العتبة ${B.num1(b.thr)}%`)}</span></div></div>`;
    }).join('');
    return `<div class="ek-page">${ek.head({ eyebrow: `${L('Governance', 'الحوكمة')} · ${ui.idMono(GA.id)}`, title: L('Voting', 'التصويت'), sub: L('General assembly of 4 December 2026 — attendance and votes are weighted by each unit’s share (unit area ÷ total area).', 'الهيئة العامة في 4 كانون الأول 2026 — يُرجَّح الحضور والتصويت بحصة كل وحدة (مساحة الوحدة ÷ المساحة الإجمالية).'),
      actions: ui.btn(L('Remind non-responders', 'تذكير من لم يرد'), { icon: 'send', act: 'c2VRemind' }) + ui.btn(L('Register proxy', 'تسجيل وكالة'), { icon: 'userCheck', kind: 'primary', act: 'c2VProxy' }) })}
      ${ek.strip([{ l: L('Confirmed shares', 'الحصص المؤكدة'), v: B.num1(shareAtt) + '%', s: shareAtt >= GA.quorumReq ? L(`Quorum ${GA.quorumReq}% reached`, `تحقق النصاب ${GA.quorumReq}%`) : L(`${B.num1(GA.quorumReq - shareAtt)}% short of quorum`, `ينقص ${B.num1(GA.quorumReq - shareAtt)}% عن النصاب`), tone: shareAtt >= GA.quorumReq ? 'ok' : 'warn', icon: 'pie' }, { l: L('Units confirmed', 'وحدات مؤكدة'), v: att.length, unit: `/ ${units.length}`, icon: 'home' }, { l: L('Proxies registered', 'وكالات مسجلة'), v: GA.proxies, s: L(`${B.num1(B.sum(gaRows.filter((r) => r.st === 'cmProxy'), (r) => r.share))}% of shares`, `${B.num1(B.sum(gaRows.filter((r) => r.st === 'cmProxy'), (r) => r.share))}% من الحصص`), icon: 'userCheck' }, { l: L('No reply yet', 'لم يردوا بعد'), v: gaRows.filter((r) => r.st === 'c2NoReply').length, s: B.inDays(GA.date), icon: 'clock' }])}
      <div class="grid g-main" style="align-items:start">
        <div>
          <div class="ek-card-t"><div><h3>${L('Attendance register — weighted', 'سجل الحضور — مرجّح')}</h3><div class="sub">${L('Total area', 'المساحة الإجمالية')} ${B.num(K.totalArea)} m² · ${units.length} ${L('units', 'وحدة')}</div></div></div>
          ${ek.tb(`${ui.search('c2:vq', L('Unit or owner', 'الوحدة أو المالك'))}${ui.seg('c2:vf', [{ id: 'all', label: L('All', 'الكل') }, { id: 'att', label: L('Attending', 'حاضر') }, { id: 'proxy', label: L('Proxy', 'وكالة') }, { id: 'none', label: L('No reply', 'لم يرد') }], fil)}`)}
          ${ui.table({ id: 'c2-vt', rows, pageSize: 12, defaultSort: '-share', cols: [
            { key: 'number', label: L('Unit', 'الوحدة'), sort: (x) => x.u.floor * 100 + (parseInt(x.number.slice(-2), 10) || 0), m: 'title', render: (x) => `<b>${unitLbl(x.u)}</b>`, mRender: (x) => unitLbl(x.u) },
            { key: 'owner', label: L('Owner', 'المالك'), m: 'sub', render: (x) => `<span class="ek-cell">${ui.avatar(D.person(x.owner).name)}<span class="small">${P(x.owner)}</span></span>` },
            { key: 'share', label: L('Share', 'الحصة'), sort: true, align: 'end', m: 'meta', render: (x) => `<span class="ek-num">${B.num1(Math.round(x.share * 100) / 100)}%</span>` },
            { key: 'st', label: L('Attendance', 'الحضور'), m: 'end', render: (x) => ui.status(x.st) + (x.holder ? `<div class="xs faint" style="margin-top:3px">${L('Holder', 'الحامل')}: ${P(x.holder)}</div>` : '') },
            { key: 'act', label: '', align: 'end', m: 'hide', render: (x) => x.st === 'c2NoReply' ? `<button class="btn btn-text btn-sm" data-act="c2VMark" data-arg="${x.id}">${L('Mark attending', 'تأكيد الحضور')}</button>` : '' },
          ] })}
        </div>
        <div class="stack">
          ${ui.card({ title: L('Quorum', 'النصاب'), sub: L(`${GA.quorumReq}% of unit shares required`, `المطلوب ${GA.quorumReq}% من حصص الوحدات`), body: `<div class="c2-q" style="height:16px"><i class="${shareAtt >= GA.quorumReq ? '' : 'warn'}" style="width:${shareAtt}%"></i><em style="inset-inline-start:${GA.quorumReq}%"></em></div><div class="row between xs faint"><span>${L('In person', 'حضور شخصي')} ${B.num1(B.sum(gaRows.filter((r) => r.st === 'c2Confirmed'), (r) => r.share))}%</span><span>${L('Proxy', 'وكالة')} ${B.num1(B.sum(gaRows.filter((r) => r.st === 'cmProxy'), (r) => r.share))}%</span></div>` })}
          ${ui.card({ title: L('Items for vote', 'البنود المطروحة للتصويت'), sub: L('Simulated e-voting preview', 'معاينة محاكاة للتصويت الإلكتروني'), body: ballot + `<div style="margin-top:12px">${ui.callout(L('Advance votes are indicative. Under the bylaws, binding votes are recorded by the secretary at the assembly.', 'التصويت المسبق استرشادي. وفق النظام الداخلي، يسجّل أمين السر الأصوات الملزمة خلال الهيئة.'), '', 'info')}</div>` })}
        </div>
      </div>
      <div class="ek-sec">${L('Past weighted votes', 'نتائج التصويت المرجّح السابقة')}</div>
      <div class="grid g2">${past.map((r) => `<div class="card"><div class="row between" style="align-items:flex-start;gap:10px;margin-bottom:10px"><div style="min-width:0"><b class="small" style="display:block">${tx(r.t)}</b><span class="xs faint">${ui.idMono(r.id)} · ${B.date(r.m.date)}</span></div>${ui.status(r.st)}</div>${voteBar(r)}</div>`).join('')}</div></div>`;
  }

  /* ======================================================================
     Screen: Building budget
     ====================================================================== */
  function budget() {
    const year = fy();
    const charge = +B.get('c2:chg', 190);
    const rows = CATS.map((c) => ({ ...c, annual: c.budget * 12, ytd: ytd(c.id), draft: draftOf(c) * 12 }));
    const tot = { annual: B.sum(rows, (r) => r.annual), ytd: B.sum(rows, (r) => r.ytd), draft: B.sum(rows, (r) => r.draft) };
    const incomeMo = (ch) => B.sum(units, (u) => (u.kind === 'apartment' ? ch : u.charge));
    const income27 = incomeMo(charge) * 12 * 0.965;
    const gap = income27 - tot.draft;
    const is27 = year === 'fy2027';
    const chart = B.charts.bars({ labels: rows.map((r) => tx(r.n).split(' ')[0]), series: [{ name: L('2026 approved', 'معتمد 2026'), color: '#C9D6DF', values: rows.map((r) => r.annual) }, { name: L('2027 draft', 'مسودة 2027'), color: '#142B3B', values: rows.map((r) => r.draft - r.annual > 0 ? r.draft - r.annual : 0) }], height: 190, format: (v) => B.compact(v) });
    return `<div class="ek-page">${ek.head({ eyebrow: `${L('Finance', 'المالية')} · ${is27 ? L('Fiscal year 2027 (draft)', 'السنة المالية 2027 (مسودة)') : L('Fiscal year 2026', 'السنة المالية 2026')}`, title: L('Building budget', 'موازنة المبنى'), sub: is27 ? L('Draft 2027 budget prepared by the treasurer — to be voted at the general assembly on 4 December (item GA-27-01).', 'مسودة موازنة 2027 من إعداد أمينة الصندوق — للتصويت في الهيئة العامة يوم 4 كانون الأول (البند GA-27-01).') : L('2026 budget approved by the general assembly on 2 March (R-26-03), tracked against actual spending.', 'موازنة 2026 التي أقرّتها الهيئة العامة في 2 آذار (R-26-03)، مع متابعة الإنفاق الفعلي.'),
      actions: ui.seg('ws:committee', [{ id: 'fy2026', label: '2026' }, { id: 'fy2027', label: L('2027 draft', 'مسودة 2027') }], year) + ui.btn(L('Download', 'تنزيل'), { icon: 'download', act: 'previewDoc', arg: is27 ? L('Draft 2027 budget.pdf', 'مسودة موازنة 2027.pdf') : L('Budget 2026.pdf', 'موازنة 2026.pdf') }) + (is27 ? ui.btn(L('Send to owners', 'إرسال للمالكين'), { icon: 'send', kind: 'primary', act: 'c2SendBudget' }) : '') })}
      ${is27 ? ek.strip([{ l: L('Draft expenses 2027', 'مصاريف مسودة 2027'), v: B.money(tot.draft), s: `${tot.draft > tot.annual ? '+' : ''}${B.num1(pct(tot.draft - tot.annual, tot.annual))}% ${L('vs 2026', 'مقارنة بـ 2026')}`, icon: 'wallet' }, { l: L('Projected income', 'الإيرادات المتوقعة'), v: B.money(income27), s: L(`₪${charge} / apartment · 96.5% collection`, `${charge} ₪ / شقة · تحصيل 96.5%`), icon: 'coins' }, { l: gap >= 0 ? L('Projected surplus', 'الفائض المتوقع') : L('Projected shortfall', 'العجز المتوقع'), v: B.money(Math.abs(gap)), tone: gap >= 0 ? 'ok' : 'bad', s: gap >= 0 ? L('Added to reserve', 'يُضاف إلى الاحتياط') : L('Needs a higher charge or cuts', 'يتطلب رفع الرسوم أو التخفيض'), icon: 'trend' }, { l: L('Reserve fund', 'صندوق الاحتياط'), v: B.money(fin().reserve), s: L('Target: 6 months of expenses', 'الهدف: مصاريف 6 أشهر'), icon: 'shieldCheck' }])
        : ek.strip([{ l: L('Approved annual budget', 'الموازنة السنوية المعتمدة'), v: B.money(tot.annual), s: L(`${B.money(BUDGET)} / month`, `${B.money(BUDGET)} / شهرياً`), icon: 'wallet' }, { l: L('Spent Jan – Nov', 'المصروف ك٢ – ت٢'), v: B.money(tot.ytd), s: `${B.num1(pct(tot.ytd, tot.annual))}% ${L('of annual budget', 'من الموازنة السنوية')}`, icon: 'receipt' }, { l: L('Expected at year end', 'المتوقع نهاية العام'), v: B.money(tot.ytd + BUDGET), s: tot.ytd + BUDGET > tot.annual ? L(`${B.money(tot.ytd + BUDGET - tot.annual)} over`, `تجاوز ${B.money(tot.ytd + BUDGET - tot.annual)}`) : L('Within budget', 'ضمن الموازنة'), tone: tot.ytd + BUDGET > tot.annual ? 'bad' : 'ok', icon: 'trend' }, { l: L('Projects (assembly-approved)', 'مشاريع (معتمدة من الهيئة)'), v: B.money(12100), s: L('Lobby renovation · levy-funded', 'ترميم الردهة · بتمويل المساهمة'), icon: 'stairs' }])}
      <div class="grid g-main" style="align-items:start">
        <div>${ui.table({ id: 'c2-bt', rows, cols: is27 ? [
          { key: 'n', label: L('Budget line', 'بند الموازنة'), m: 'title', render: (r) => ek.cell(r.icon, tx(r.n), '', ''), mRender: (r) => tx(r.n) },
          { key: 'annual', label: L('2026 approved', 'معتمد 2026'), align: 'end', sort: true, m: 'meta', render: (r) => `<span class="ek-num">${B.money(r.annual)}</span>` },
          { key: 'draft', label: L('2027 draft', 'مسودة 2027'), align: 'end', sort: true, m: 'end', render: (r) => `<b class="ek-num">${B.money(r.draft)}</b>` },
          { key: 'chg', label: L('Change', 'التغيير'), align: 'end', sort: (r) => DRAFT[r.id], m: 'meta', render: (r) => `<span class="c2-chg ${DRAFT[r.id] > 0 ? 'up' : ''}">${DRAFT[r.id] > 0 ? '+' : ''}${DRAFT[r.id]}%</span>` },
          { key: 'why', label: L('Reason', 'السبب'), m: 'sub', render: (r) => `<span class="small muted">${tx({ cleaning: T('Contract fixed to Sep 2027', 'العقد ثابت حتى أيلول 2027'), elevator: T('Indexation + older cars', 'ربط بالأسعار + مصاعد أقدم'), electricity: T('Tariff increase (sample)', 'زيادة التعرفة (نموذج)'), pumps: T('No change', 'دون تغيير'), diesel: T('Longer winter outages', 'انقطاعات شتوية أطول'), security: T('Night concierge wage', 'أجر الحارس الليلي'), insurance: T('Policy renewal quote', 'عرض تجديد البوليصة'), reserve: T('Build reserve for elevators', 'بناء احتياط للمصاعد') }[r.id])}</span>` },
        ] : [
          { key: 'n', label: L('Budget line', 'بند الموازنة'), m: 'title', render: (r) => ek.cell(r.icon, tx(r.n), L(`${B.money(r.budget)} / month`, `${B.money(r.budget)} / شهرياً`), ''), mRender: (r) => tx(r.n) },
          { key: 'annual', label: L('Approved', 'المعتمد'), align: 'end', sort: true, m: 'meta', render: (r) => `<span class="ek-num">${B.money(r.annual)}</span>` },
          { key: 'ytd', label: L('Actual YTD', 'الفعلي حتى تاريخه'), align: 'end', sort: true, m: 'end', render: (r) => `<b class="ek-num">${B.money(r.ytd)}</b>` },
          { key: 'used', label: L('Used', 'المستخدم'), sort: (r) => r.ytd / r.annual, m: 'sub', render: (r) => { const u = pct(r.ytd, r.annual); return `<div class="row-sm" style="min-width:150px">${ek.mini(u, u > 100 ? 'bad' : u > 92 ? 'warn' : '')}<span class="ek-num small ${u > 100 ? 'strong' : ''}" style="${u > 100 ? 'color:var(--bad)' : ''}">${Math.round(u)}%</span></div>`; } },
          { key: 'rem', label: L('Remaining', 'المتبقي'), align: 'end', sort: (r) => r.annual - r.ytd, m: 'meta', render: (r) => `<span class="ek-num ${r.annual - r.ytd < 0 ? '' : 'muted'}" style="${r.annual - r.ytd < 0 ? 'color:var(--bad)' : ''}">${B.money(r.annual - r.ytd)}</span>` },
        ] })}
        <div class="row between small" style="padding:12px 16px;margin-top:-1px;background:var(--surface-2);border:1px solid var(--line);border-radius:0 0 var(--r) var(--r)"><b>${L('Total', 'الإجمالي')}</b><b class="ek-num">${is27 ? `${B.money(tot.annual)} → ${B.money(tot.draft)}` : `${B.money(tot.ytd)} / ${B.money(tot.annual)}`}</b></div></div>
        <div class="stack">
          ${is27 ? ui.card({ title: L('Service-charge scenario', 'سيناريو رسوم الخدمات'), sub: L('Monthly charge per apartment · shops and offices unchanged', 'الرسوم الشهرية لكل شقة · المحلات والمكاتب دون تغيير'), body: `${ui.seg('c2:chg', [180, 190, 200, 210].map((v) => ({ id: v, label: '₪' + v })), charge)}<div class="c2-fund" style="margin-top:14px"><div><span class="l">${L('Income / yr', 'الإيراد السنوي')}</span><b>${B.compact(income27)}</b></div><div><span class="l">${L('Expenses / yr', 'المصاريف السنوية')}</span><b>${B.compact(tot.draft)}</b></div><div><span class="l">${gap >= 0 ? L('Surplus', 'فائض') : L('Shortfall', 'عجز')}</span><b class="${gap >= 0 ? 'ok' : 'bad'}">${B.compact(Math.abs(gap))}</b></div></div><p class="xs faint" style="margin-top:10px">${L('The treasurer’s draft proposes ₪190. The assembly decides the final amount.', 'تقترح مسودة أمينة الصندوق 190 ₪. تقرّر الهيئة العامة المبلغ النهائي.')}</p>` }) : ''}
          ${ui.card({ title: is27 ? L('Increase by line', 'الزيادة حسب البند') : L('Spending by line — Jan to Nov', 'الإنفاق حسب البند — ك٢ إلى ت٢'), body: is27 ? chart : B.charts.donut({ size: 150, data: rows.map((r) => ({ label: tx(r.n), value: r.ytd, color: r.color })), center: { value: B.compact(tot.ytd), label: L('spent', 'مصروف') }, format: (v) => B.money(v) }) })}
        </div>
      </div>
      ${sampleNote(L('Budget figures are fictional demonstration data for a sample building.', 'أرقام الموازنة بيانات تجريبية وهمية لمبنى نموذجي.'))}</div>`;
  }

  /* ======================================================================
     Screen: Expenses (ledger with approvals)
     ====================================================================== */
  function expensesPage() {
    const all = expenses();
    const q = B.get('c2:xq', ''), mo = B.get('c2:xm', 'all'), cf = B.get('c2:xc', 'all'), sel = B.get('c2:x', '');
    const rows = all.filter((x) => (mo === 'all' || String(x.mi) === String(mo)) && (cf === 'all' || x.cat === cf) && B.match(q, x.payee, x.desc, x.id));
    const x = all.find((e) => e.id === sel);
    const nov = all.filter((e) => e.mi === 11);
    const panel = x ? ek.panel({ close: 'c2:x', lead: `<span class="li-icon">${icon(catIcon(x.cat))}</span>`, title: tx(x.payee), sub: `${ui.idMono(x.id)} · ${B.date(x.date)}`, badges: ui.status(x.st),
      body: `<div><div class="xs faint">${L('Amount', 'المبلغ')}</div><div style="font-family:var(--font-display);font-size:28px;font-weight:700" class="ek-num">${B.money(x.amount)}</div></div>
        ${ui.kv([[L('Description', 'الوصف'), descOf(x)], [L('Budget line', 'بند الموازنة'), catName(x.cat)], [L('Paid from', 'الدفع من'), tx(C.bank)], [L('Approval rule', 'قاعدة الاعتماد'), x.appr === 'dual' ? L('Chair + treasurer (above ₪3,000)', 'الرئيس + أمين الصندوق (فوق 3,000 ₪)') : L('Chair (up to ₪3,000)', 'الرئيس (حتى 3,000 ₪)')]])}
        ${ek.ps(L('Approval chain', 'سلسلة الاعتماد'), ui.timeline([{ title: L('Invoice received', 'استلام الفاتورة'), meta: B.date(x.date), state: 'done', icon: 'receipt' }, { title: L(`Approved by ${P('p_samer')}`, `اعتمدها ${P('p_samer')}`), meta: L('Chair', 'الرئيس'), state: 'done' }].concat(x.appr === 'dual' || x.st === 'c2CoSign' ? [{ title: L(`Co-signed by ${P('p_hiba')}`, `وقّعتها ${P('p_hiba')}`), meta: x.st === 'c2CoSign' ? L('Waiting', 'بالانتظار') : L('Treasurer', 'أمين الصندوق'), state: x.st === 'c2CoSign' ? 'current' : 'done' }] : []).concat([{ title: L('Paid', 'تم الدفع'), meta: x.st === 'c2Paid' ? B.date(x.date) : '', state: x.st === 'c2Paid' ? 'done' : '' }])))}`,
      foot: `${ui.btn(L('Invoice', 'الفاتورة'), { icon: 'doc', act: 'previewDoc', arg: `${x.id}.pdf` })}${x.st === 'c2CoSign' ? ui.btn(L('Request co-signature', 'طلب التوقيع الثاني'), { icon: 'send', kind: 'primary', act: 'c2CoSign', arg: x.id }) : ''}` }) : '';
    return `<div class="ek-page">${ek.head({ eyebrow: L('Finance', 'المالية'), title: L('Expenses', 'المصاريف'), sub: L('Every payment from the association account, with its budget line and approval chain.', 'كل دفعة من حساب الجمعية مع بند الموازنة وسلسلة الاعتماد.'), actions: ui.btn(L('Export CSV', 'تصدير CSV'), { icon: 'download', act: 'soon', arg: L('CSV export', 'تصدير CSV') }) + ui.btn(L('Record expense', 'تسجيل مصروف'), { icon: 'plus', kind: 'primary', act: 'cmExpense' }) })}
      ${ek.strip([{ l: L('November to date', 'تشرين الثاني حتى تاريخه'), v: B.money(B.sum(nov, (e) => e.amount)), s: L(`Budget ${B.money(BUDGET)}`, `الموازنة ${B.money(BUDGET)}`), tone: B.sum(nov, (e) => e.amount) > BUDGET ? 'bad' : '', icon: 'receipt' }, { l: L('October', 'تشرين الأول'), v: B.money(B.sum(all.filter((e) => e.mi === 10), (e) => e.amount)), icon: 'calendar' }, { l: L('September', 'أيلول'), v: B.money(B.sum(all.filter((e) => e.mi === 9), (e) => e.amount)), s: L('Incl. lobby final payment', 'تشمل دفعة الردهة النهائية'), icon: 'calendar' }, { l: L('Awaiting co-signature', 'بانتظار التوقيع الثاني'), v: all.filter((e) => e.st === 'c2CoSign').length, s: L('Treasurer', 'أمين الصندوق'), tone: 'warn', icon: 'clock' }])}
      ${ek.split(`<div>${ek.tb(`${ui.search('c2:xq', L('Payee, description or reference', 'المستفيد أو الوصف أو المرجع'))}${ui.select('c2:xm', [{ v: 'all', l: L('Sep – Nov 2026', 'أيلول – ت٢ 2026') }, { v: '11', l: B.monthYear('2026-11-01') }, { v: '10', l: B.monthYear('2026-10-01') }, { v: '9', l: B.monthYear('2026-09-01') }])}${ui.select('c2:xc', [{ v: 'all', l: L('All budget lines', 'كل البنود') }].concat(CATS.map((c) => ({ v: c.id, l: c.n }))).concat([{ v: 'project', l: L('Projects', 'مشاريع') }]))}<span class="sp"></span><span class="cnt">${B.money(B.sum(rows, (e) => e.amount))} · ${rows.length}</span>`)}
        ${ek.selStyle('c2-xt', sel)}${ui.table({ id: 'c2-xt', cls: 'c2-xt', rows, pageSize: 14, rowAct: (e) => ({ act: 'set', arg: `c2:x=${e.id}` }), cols: [
          { key: 'date', label: L('Date', 'التاريخ'), sort: true, m: 'meta', render: (e) => `<span class="ek-num small">${B.dateShort(e.date)}</span>` },
          { key: 'payee', label: L('Payee', 'المستفيد'), sort: (e) => tx(e.payee), m: 'title', render: (e) => ek.cell(catIcon(e.cat), tx(e.payee), `${ui.idMono(e.id)} · ${esc(descOf(e))}`), mRender: (e) => tx(e.payee) },
          { key: 'cat', label: L('Budget line', 'البند'), m: 'sub', render: (e) => `<span class="small">${catName(e.cat)}</span>` },
          { key: 'st', label: L('Status', 'الحالة'), m: 'meta', render: (e) => ui.status(e.st) },
          { key: 'amount', label: L('Amount', 'المبلغ'), sort: true, align: 'end', m: 'end', render: (e) => `<b class="ek-num">${B.money(e.amount)}</b>` },
        ] })}</div>`, panel)}</div>`;
  }

  /* ======================================================================
     Actions
     ====================================================================== */
  const A = B.act;
  A.c2Revoke = (id) => B.confirm({ title: L('Revoke this delegation?', 'إلغاء هذا التفويض؟'), text: L('Both parties are notified and the change is logged in the association record.', 'يُبلَّغ الطرفان ويُسجَّل التغيير في سجل الجمعية.'), ok: L('Revoke', 'إلغاء التفويض'), danger: true, onOk: () => { const d = DELEGS.find((x) => x.id === id); if (d) d.st = 'revoked'; if (d && d.kind === 'proxy') gaRows.filter((r) => d.units.includes(r.number) && r.st === 'cmProxy').forEach((r) => { r.st = 'c2NoReply'; r.holder = null; }); gaSync(); B.closeModal(true); B.refresh(); B.toast(L('Delegation revoked', 'تم إلغاء التفويض')); } });
  A.c2Extend = (id) => { const d = DELEGS.find((x) => x.id === id); if (!d) return; d.st = 'active'; d.end = '2027-06-30'; B.refresh(); B.toast(L('Extended to 30 Jun 2027', 'تم التمديد حتى 30 حزيران 2027')); };
  A.c2NewDeleg = () => B.modal({ title: L('New delegation', 'تفويض جديد'), sub: tx(C.name), form: 'c2Deleg', size: 'md',
    body: `<div class="form-grid">${ui.field({ name: 'kind', label: L('Type', 'النوع'), type: 'radio', full: true, options: [{ v: 'proxy', l: L('Voting proxy', 'وكالة تصويت'), d: L('An owner lets someone vote their shares', 'يتيح المالك لشخص التصويت بحصصه'), icon: 'userCheck' }, { v: 'authority', l: L('Delegated authority', 'تفويض صلاحية'), d: L('A committee member delegates a task', 'يفوّض عضو اللجنة مهمة'), icon: 'key' }] })}
      ${ui.field({ name: 'from', label: L('From', 'من'), type: 'select', options: C.members.map((m) => ({ v: m.p, l: P(m.p) })).concat([{ v: 'p_nabil', l: P('p_nabil') }]) })}
      ${ui.field({ name: 'to', label: L('To', 'إلى'), type: 'select', options: C.members.map((m) => ({ v: m.p, l: P(m.p) })) })}
      ${ui.field({ name: 'scope', label: L('Scope', 'النطاق'), required: true, full: true, placeholder: L('e.g. Assembly of 4 Dec — all items', 'مثال: هيئة 4 ك١ — جميع البنود') })}
      ${ui.field({ name: 'end', label: L('Valid until', 'سارية حتى'), type: 'date', value: '2026-12-04' })}${ui.field({ name: 'doc', label: L('Signed form', 'النموذج الموقّع'), type: 'file' })}</div>`,
    foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${L('Record delegation', 'تسجيل التفويض')}</button>` });
  B.submit.c2Deleg = (d) => { const id = 'DG-' + String(DELEGS.length + 1).padStart(2, '0'); DELEGS.unshift({ id, kind: d.kind || 'proxy', from: d.from || 'p_samer', to: d.to || 'p_fadi', units: [], scope: { en: d.scope || '—', ar: d.scope || '—' }, start: '2026-11-25', end: /^\d{4}-\d{2}-\d{2}$/.test(d.end || '') ? d.end : '2026-12-04', st: 'active' }); B.vs['c2:dg'] = id; B.refresh(); B.success({ title: L('Delegation recorded', 'تم تسجيل التفويض'), text: L('Both parties were notified in the BENA app.', 'تم إشعار الطرفين في تطبيق بينا.'), ref: id }); };
  A.c2Review = () => B.success({ title: L('Review requested', 'تم طلب المراجعة'), text: L('A BENA data steward will check the pending items. Legal status itself is never changed by BENA.', 'سيتحقق مسؤول بيانات في بينا من البنود المعلّقة. لا تغيّر بينا الصفة القانونية نفسها.'), ref: 'VR-' + String(Date.now()).slice(-5) });
  A.c2OpenMin = (id) => { B.vs['c2:min'] = id; B.go(`${R}-minutes`); };
  A.c2EditMin = () => B.toast(L('Minutes editor opened for the secretary (demo)', 'تم فتح محرّر المحضر لأمين السر (تجريبي)'), 'info');
  A.c2SendBudget = () => B.confirm({ title: L('Send the draft budget to all owners?', 'إرسال مسودة الموازنة إلى جميع المالكين؟'), text: L('54 units receive the draft with the assembly invitation (app + SMS).', 'تستلم 54 وحدة المسودة مع دعوة الهيئة (التطبيق + الرسائل).'), ok: L('Send', 'إرسال'), onOk: () => { B.closeModal(true); B.toast(L('Draft budget sent to 54 units', 'تم إرسال مسودة الموازنة إلى 54 وحدة')); } });
  A.c2CoSign = (id) => { delete EXST[id]; B.refresh(); B.toast(L(`${P('p_hiba')} co-signed the payment`, `وقّعت ${P('p_hiba')} الدفعة`)); };
  A.c2VMark = (id) => { const r = gaRows.find((x) => x.id === id); if (r) { r.st = 'c2Confirmed'; gaSync(); B.refresh(); B.toast(L(`Unit ${r.number} marked as attending`, `تم تأكيد حضور الوحدة ${r.number}`)); } };
  A.c2VRemind = () => { const n = gaRows.filter((r) => r.st === 'c2NoReply').length; B.toast(L(`Reminder sent to ${n} owners`, `تم إرسال تذكير إلى ${n} مالكاً`)); };
  A.c2VProxy = () => B.modal({ title: L('Register a proxy', 'تسجيل وكالة'), sub: tx(GA.title), form: 'c2VProxy', size: 'md',
    body: `<div class="form-grid">${ui.field({ name: 'unit', label: L('Owner’s unit', 'وحدة المالك'), type: 'select', full: true, options: gaRows.filter((r) => r.st === 'c2NoReply' || r.st === 'cmApology').map((r) => ({ v: r.id, l: `${unitLbl(r.u)} — ${P(r.owner)} · ${B.num1(Math.round(r.share * 100) / 100)}%` })) })}
      ${ui.field({ name: 'to', label: L('Proxy holder', 'حامل الوكالة'), type: 'select', full: true, options: C.members.map((x) => ({ v: x.p, l: `${P(x.p)} — ${tx(x.role)}` })) })}${ui.field({ name: 'doc', label: L('Signed proxy form', 'نموذج الوكالة الموقّع'), type: 'file', full: true })}</div>`,
    foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${L('Register proxy', 'تسجيل الوكالة')}</button>` });
  B.submit.c2VProxy = (d) => { const r = gaRows.find((x) => x.id === d.unit) || gaRows.find((x) => x.st === 'c2NoReply'); if (r) { r.st = 'cmProxy'; r.holder = d.to || 'p_samer'; } gaSync(); B.refresh(); B.success({ title: L('Proxy registered', 'تم تسجيل الوكالة'), text: L(`Confirmed shares are now ${B.num1(GA.rsvpShare)}%.`, `أصبحت الحصص المؤكدة ${B.num1(GA.rsvpShare)}%.`), ref: 'PX-' + String(Date.now()).slice(-5) }); };

  /* ======================================================================
     Re-register the role: 13-screen desktop workspace
     ====================================================================== */
  const base = B.roles[R];
  const Pg = K.pages;
  const withCrumb = (fn, label, go) => (id, r) => { const html = fn(id, r); B.crumbs([{ label: C.name, go: `${R}-home` }, { label: label(), go }, { label: B._title || '' }]); return html; };
  B.role(Object.assign({}, base, {
    nav: 'drawer',
    workspaces: [{ id: 'fy2026', label: T('FY 2026', 'السنة المالية 2026'), icon: 'calendarCheck' }, { id: 'fy2027', label: T('FY 2027 draft', 'مسودة 2027'), icon: 'edit' }],
    menu: [
      { group: T('Overview', 'نظرة عامة') },
      { id: 'home', label: T('Committee overview', 'نظرة عامة على اللجنة'), icon: 'grid' },
      { group: T('Association', 'الجمعية') },
      { id: 'members', label: T('Members', 'الأعضاء'), icon: 'users' },
      { id: 'roles', label: T('Roles & delegations', 'الأدوار والتفويضات'), icon: 'key' },
      { id: 'legal', label: T('Legal & administrative status', 'الوضع القانوني والإداري'), icon: 'badgeCheck', match: ['profile'] },
      { id: 'documents', label: T('Documents', 'المستندات'), icon: 'folder' },
      { group: T('Governance', 'الحوكمة') },
      { id: 'meetings', label: T('Meetings', 'الاجتماعات'), icon: 'calendar', match: ['meeting'] },
      { id: 'minutes', label: T('Meeting minutes', 'محاضر الاجتماعات'), icon: 'doc' },
      { id: 'decisions', label: T('Decisions', 'القرارات'), icon: 'gavel' },
      { id: 'voting', label: T('Voting', 'التصويت'), icon: 'vote' },
      { group: T('Finance', 'المالية') },
      { id: 'budget', label: T('Building budget', 'موازنة المبنى'), icon: 'pie' },
      { id: 'expenses', label: T('Expenses', 'المصاريف'), icon: 'receipt' },
      { id: 'finance', label: T('Financial overview', 'النظرة المالية'), icon: 'wallet', match: ['statement'] },
      { group: T('Building', 'المبنى') },
      { id: 'maintenance', label: T('Maintenance', 'الصيانة'), icon: 'wrench' },
      { id: 'announcements', label: T('Announcements', 'الإعلانات'), icon: 'megaphone' },
      { id: 'building', label: T('Building profile', 'ملف المبنى'), icon: 'building' },
      { group: T('Marketplaces', 'الأسواق') },
      { id: 'services', label: T('Services marketplace', 'سوق الخدمات'), icon: 'handshake', match: ['provider', 'servicedetail', 'quotes', 'servicehistory'] },
      { id: 'properties', label: T('Property marketplace', 'سوق العقارات'), icon: 'key', match: ['listing'] },
    ],
    pages: Object.assign({}, base.pages, {
      roles, legal, documents, minutes, decisions, voting, budget, expenses: expensesPage,
      meeting: withCrumb(Pg.meetingDetail, () => L('Meetings', 'الاجتماعات'), `${R}-meetings`),
      statement: withCrumb(Pg.statement, () => L('Financial overview', 'النظرة المالية'), `${R}-finance`),
    }),
  }));
})();
