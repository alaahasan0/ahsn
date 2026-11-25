/*
 * BENA — Property Owner experience (role id `owner`).
 * Persona: Khaled Mansour (p_khaled) — six units across five buildings,
 * three of them rented, two vacant (one listed by his manager, one not),
 * one owner-occupied and co-owned with Rana Mansour.
 * Phone-first: bottom tabs, native-feeling cards; desktop gets the sidebar.
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon } = B;
  const ui = B.ui;
  const D = B.data;
  const T = (en, ar) => ({ en, ar });
  const ME = 'p_khaled';
  const R = 'owner';

  /* =====================================================================
   * Owner demo data (consistent with B.data)
   * ===================================================================== */
  const OX = (D.ownerX = D.ownerX || {});

  /* Data fix: the random owner assignment in data.js also gives p_khaled six
   * extra units. The persona owns exactly these six — hand the others to
   * other (fictional) owners so every role sees one consistent portfolio. */
  OX.unitIds = ['BN-RAM-00142-803', 'BN-RAM-00142-1102', 'BN-RAM-00415-G02', 'BN-RAM-00311-702', 'BN-RAM-00087-402', 'BN-RAM-00266-604'];
  (() => {
    const alt = ['p_jamil', 'p_suha', 'p_walid', 'p_amal', 'p_zaid', 'p_lama', 'p_rami', 'p_hala'];
    let i = 0;
    D.units.forEach((u) => {
      if (u.owner !== ME || OX.unitIds.includes(u.id)) return;
      const n = alt[i++ % alt.length];
      u.owner = n;
      if (u.tenant === ME) u.tenant = n;
      D.leases.forEach((l) => { if (l.unit === u.id) l.owner = n; });
    });
  })();

  Object.assign(B.statuses, {
    tenantPays: { en: 'Paid by tenant', ar: 'يدفعها المستأجر', tone: 'outline', icon: 'user' },
    proposed: { en: 'Proposed', ar: 'مقترحة', tone: 'violet', icon: 'vote' },
    late: { en: 'Paid late', ar: 'دُفعت متأخرة', tone: 'warn' },
    offerSent: { en: 'Renewal offer sent', ar: 'تم إرسال عرض التجديد', tone: 'info', icon: 'send' },
    revoked: { en: 'Revoked', ar: 'ملغاة', tone: 'neutral' },
  });

  OX.meta = {
    'BN-RAM-00142-803': { value: 1050000, share: 100, acquired: '2021-09-14', deed: 'TD-RAM-2021-118342', chargeBy: 'tenant', parking: 'P-14', view: T('City view, east-facing', 'إطلالة على المدينة، واجهة شرقية'), finish: T('Fully finished, unfurnished', 'تشطيب كامل، غير مفروشة') },
    'BN-RAM-00142-1102': { value: 806000, share: 100, acquired: '2023-03-02', deed: 'TD-RAM-2023-020911', chargeBy: 'owner', parking: 'P-31', view: T('Valley view, west-facing', 'إطلالة على الوادي، واجهة غربية'), finish: T('Fully finished, unfurnished', 'تشطيب كامل، غير مفروشة'), vacantSince: '2026-09-30', suggested: 2650, listing: { state: 'notListed' } },
    'BN-RAM-00415-G02': { value: 736000, share: 100, acquired: '2016-05-19', deed: 'TD-RAM-2016-077410', chargeBy: 'owner', view: T('Street frontage on Al-Irsal St.', 'واجهة على شارع الإرسال'), finish: T('Shell & core with shopfront', 'هيكل مع واجهة محل') },
    'BN-RAM-00311-702': { value: 1344000, share: 100, acquired: '2019-11-04', deed: 'TD-RAM-2019-104566', chargeBy: 'owner', parking: 'B2-07, B2-08', view: T('Open-plan, north light', 'مساحة مفتوحة، إضاءة شمالية'), finish: T('Fitted office, raised floor', 'مكتب مجهّز، أرضية مرفوعة') },
    'BN-RAM-00087-402': { value: 582000, share: 50, acquired: '2013-01-20', deed: 'TD-RAM-2013-004218', chargeBy: 'owner', parking: 'P-09', view: T('Garden view', 'إطلالة على الحديقة'), finish: T('Family home, furnished', 'منزل العائلة، مفروش') },
    'BN-RAM-00266-604': { value: 605000, share: 50, acquired: '2020-07-02', deed: 'TD-RAM-2020-061733', chargeBy: 'owner', parking: 'P-22', view: T('Park view, south-facing', 'إطلالة على الحديقة، واجهة جنوبية'), finish: T('Being repainted before viewings', 'قيد إعادة الدهان قبل المعاينات'), vacantSince: '2026-08-31', suggested: 2600,
      listing: { state: 'listed', since: '2026-11-12', ask: 2600, views: 148, inquiries: 5, viewings: 2, ref: 'PL-26-0604', by: 'org_arkan', available: '2026-12-01', furnished: 'no' } },
  };

  /* Ownership history: newest first. owners: [{p | org, share}] */
  const DEV = (en, ar) => ({ org: T(en, ar) });
  OX.history = {
    'BN-RAM-00142-803': [
      { from: '2021-09-14', owners: [{ p: ME, share: 100 }], basis: T('Purchase — registered sale transfer', 'شراء — نقل ملكية بيع مسجّل'), doc: 'TD-RAM-2021-118342' },
      { from: '2017-06-08', to: '2021-09-14', owners: [{ p: 'p_nabil', share: 100 }], basis: T('Purchase from developer', 'شراء من المطوّر'), doc: 'TD-RAM-2017-061204' },
      { from: '2017-02-01', to: '2017-06-08', owners: [DEV('Al-Masyoun Development Co.', 'شركة الماصيون للتطوير')], basis: T('First registration — apartment title issued', 'التسجيل الأول — إصدار سند الشقة'), doc: 'RM-BP-2015-0331' },
    ],
    'BN-RAM-00142-1102': [
      { from: '2023-03-02', owners: [{ p: ME, share: 100 }], basis: T('Purchase — registered sale transfer', 'شراء — نقل ملكية بيع مسجّل'), doc: 'TD-RAM-2023-020911' },
      { from: '2017-04-19', to: '2023-03-02', owners: [{ p: 'p_jamil', share: 100 }], basis: T('Purchase from developer', 'شراء من المطوّر'), doc: 'TD-RAM-2017-044017' },
      { from: '2017-02-01', to: '2017-04-19', owners: [DEV('Al-Masyoun Development Co.', 'شركة الماصيون للتطوير')], basis: T('First registration — apartment title issued', 'التسجيل الأول — إصدار سند الشقة'), doc: 'RM-BP-2015-0331' },
    ],
    'BN-RAM-00415-G02': [
      { from: '2016-05-19', owners: [{ p: ME, share: 100 }], basis: T('Purchase from developer', 'شراء من المطوّر'), doc: 'TD-RAM-2016-077410' },
      { from: '2015-09-01', to: '2016-05-19', owners: [DEV('Irsal Plaza Investment Co.', 'شركة بلازا الإرسال للاستثمار')], basis: T('First registration — commercial unit title issued', 'التسجيل الأول — إصدار سند الوحدة التجارية'), doc: 'RM-BP-2013-0420' },
    ],
    'BN-RAM-00311-702': [
      { from: '2019-11-04', owners: [{ p: ME, share: 100 }], basis: T('Purchase — registered sale transfer', 'شراء — نقل ملكية بيع مسجّل'), doc: 'TD-RAM-2019-104566' },
      { from: '2019-06-15', to: '2019-11-04', owners: [DEV('Manara Business Center Ltd.', 'شركة مركز المنارة للأعمال')], basis: T('First registration — office title issued', 'التسجيل الأول — إصدار سند المكتب'), doc: 'RM-BP-2017-0912' },
    ],
    'BN-RAM-00087-402': [
      { from: '2013-01-20', owners: [{ p: ME, share: 50 }, { p: 'p_rana', share: 50 }], basis: T('Joint purchase — equal shares', 'شراء مشترك — حصص متساوية'), doc: 'TD-RAM-2013-004218' },
      { from: '2012-08-01', to: '2013-01-20', owners: [DEV('Tireh Gardens Housing Co.', 'شركة حدائق الطيرة للإسكان')], basis: T('First registration — apartment title issued', 'التسجيل الأول — إصدار سند الشقة'), doc: 'RM-BP-2010-1187' },
    ],
    'BN-RAM-00266-604': [
      { from: '2020-07-02', owners: [{ p: ME, share: 50 }, { p: 'p_rana', share: 50 }], basis: T('Joint purchase — equal shares', 'شراء مشترك — حصص متساوية'), doc: 'TD-RAM-2020-061733' },
      { from: '2014-10-12', to: '2020-07-02', owners: [{ p: 'p_issa', share: 100 }], basis: T('Purchase from developer', 'شراء من المطوّر'), doc: 'TD-RAM-2014-090551' },
      { from: '2014-06-01', to: '2014-10-12', owners: [DEV('Heights Real Estate Co.', 'شركة المرتفعات العقارية')], basis: T('First registration — apartment title issued', 'التسجيل الأول — إصدار سند الشقة'), doc: 'RM-BP-2012-0503' },
    ],
  };

  /* Previous (ended) contracts kept on record */
  OX.pastLeases = [
    { id: 'L-2025-0214', unit: 'BN-RAM-00142-803', building: 'BN-RAM-00142', tenant: 'p_ruba', owner: ME, start: '2025-02-01', end: '2026-01-31', rent: 3000, deposit: 6000, cur: 'ILS', payDay: 1, status: 'expired', manager: 'org_arkan', past: true },
    { id: 'L-2024-1102', unit: 'BN-RAM-00142-1102', building: 'BN-RAM-00142', tenant: 'p_majd', owner: ME, start: '2023-10-01', end: '2026-09-30', rent: 2500, deposit: 5000, cur: 'ILS', payDay: 1, status: 'expired', manager: 'org_arkan', past: true },
  ];

  /* Contract extras: terms + renewal / amendment history (newest first) */
  OX.leaseX = {
    'L-2026-0803': { notice: 60, charges: 'tenant', escalation: T('None during term', 'لا يوجد خلال المدة'), use: T('Residential — family', 'سكني — عائلي'),
      history: [
        { date: '2026-05-01', kind: 'amend', title: T('Amendment 1 — parking space added', 'تعديل 1 — إضافة موقف سيارة'), body: T('Parking space P-14 added to the contract at no extra rent.', 'إضافة الموقف P-14 إلى العقد دون زيادة على الإيجار.') },
        { date: '2026-02-01', kind: 'start', title: T('Contract started', 'بدء العقد'), body: T('12-month residential lease at ₪3,200 / month. Deposit ₪6,400 held by Arkan.', 'عقد سكني لمدة 12 شهراً بقيمة 3,200 ₪ شهرياً. التأمين 6,400 ₪ لدى أركان.') },
        { date: '2026-01-18', kind: 'signed', title: T('Signed by both parties', 'وُقّع من الطرفين'), body: T('Signed digitally by Khaled Mansour and Lina Haddad; witnessed by Arkan.', 'وُقّع إلكترونياً من خالد منصور ولينا حداد؛ بشهادة أركان.') },
      ] },
    'L-2024-0415': { notice: 90, charges: 'owner', escalation: T('3% per year from June', '3% سنوياً اعتباراً من حزيران'), use: T('Retail — mobile accessories shop', 'تجاري — محل إكسسوارات هواتف'),
      history: [
        { date: '2026-06-01', kind: 'amend', title: T('Annual escalation applied', 'تطبيق الزيادة السنوية'), body: T('Rent adjusted to ₪4,800 per the escalation clause.', 'تعديل الإيجار إلى 4,800 ₪ وفق بند الزيادة.') },
        { date: '2025-06-01', kind: 'amend', title: T('Annual escalation applied', 'تطبيق الزيادة السنوية'), body: T('Rent adjusted to ₪4,660.', 'تعديل الإيجار إلى 4,660 ₪.') },
        { date: '2024-06-01', kind: 'start', title: T('Contract started — 3 years', 'بدء العقد — 3 سنوات'), body: T('Retail lease at ₪4,525 / month, 3% yearly escalation.', 'عقد تجاري بقيمة 4,525 ₪ شهرياً مع زيادة سنوية 3%.') },
      ] },
    'L-2025-0702': { notice: 60, charges: 'owner', escalation: T('Reviewed at renewal', 'تُراجع عند التجديد'), use: T('Office — engineering consultancy', 'مكتب — استشارات هندسية'),
      history: [
        { date: '2026-03-01', kind: 'renew', title: T('Renewed for 12 months', 'تجديد لمدة 12 شهراً'), body: T('Renewed to 28 Feb 2027; rent from ₪5,400 to ₪5,600.', 'تجديد حتى 28 شباط 2027؛ الإيجار من 5,400 ₪ إلى 5,600 ₪.') },
        { date: '2025-09-15', kind: 'amend', title: T('Amendment 1 — second parking bay', 'تعديل 1 — موقف ثانٍ'), body: T('Bay B2-08 added for ₪150 / month, included in rent from renewal.', 'إضافة الموقف B2-08 بقيمة 150 ₪ شهرياً، مضمّن بالإيجار عند التجديد.') },
        { date: '2025-03-01', kind: 'start', title: T('Contract started', 'بدء العقد'), body: T('12-month office lease at ₪5,400 / month.', 'عقد مكتب لمدة 12 شهراً بقيمة 5,400 ₪ شهرياً.') },
      ] },
    'L-2025-0214': { notice: 60, charges: 'tenant', escalation: T('None', 'لا يوجد'), use: T('Residential', 'سكني'),
      history: [
        { date: '2026-01-31', kind: 'end', title: T('Ended at term', 'انتهى بانتهاء المدة'), body: T('Tenant relocated; deposit returned in full on 9 Feb 2026.', 'انتقل المستأجر؛ أُعيد التأمين كاملاً في 9 شباط 2026.') },
        { date: '2025-02-01', kind: 'start', title: T('Contract started', 'بدء العقد'), body: T('12-month lease at ₪3,000 / month.', 'عقد لمدة 12 شهراً بقيمة 3,000 ₪ شهرياً.') },
      ] },
    'L-2024-1102': { notice: 60, charges: 'tenant', escalation: T('None', 'لا يوجد'), use: T('Residential', 'سكني'),
      history: [
        { date: '2026-09-30', kind: 'end', title: T('Ended — not renewed', 'انتهى — دون تجديد'), body: T('Tenant bought an apartment; unit inspected and repaired (door hinge, MR-24288).', 'اشترى المستأجر شقة؛ تم فحص الوحدة وإصلاحها (مفصلة الباب، MR-24288).') },
        { date: '2025-10-01', kind: 'renew', title: T('Renewed for 12 months', 'تجديد لمدة 12 شهراً'), body: T('Rent unchanged at ₪2,500.', 'الإيجار دون تغيير 2,500 ₪.') },
        { date: '2023-10-01', kind: 'start', title: T('Contract started', 'بدء العقد'), body: T('24-month lease at ₪2,500 / month.', 'عقد لمدة 24 شهراً بقيمة 2,500 ₪ شهرياً.') },
      ] },
  };
  OX.renewals = {};
  OX.payOverride = { 'L-2025-0702|2026-11': 'overdue' };
  OX.payDay = { 'L-2026-0803': 1, 'L-2024-0415': 3, 'L-2025-0702': 4, 'L-2025-0214': 2, 'L-2024-1102': 1 };
  OX.lateOn = { 'L-2025-0702|2026-09': '2026-09-14' };
  OX.payMethod = { 'L-2026-0803': T('Bank transfer · via Arkan', 'تحويل بنكي · عبر أركان'), 'L-2024-0415': T('Post-dated cheque', 'شيك مؤجل'), 'L-2025-0702': T('Bank transfer · via Arkan', 'تحويل بنكي · عبر أركان'), 'L-2025-0214': T('Bank transfer', 'تحويل بنكي'), 'L-2024-1102': T('Bank transfer · via Arkan', 'تحويل بنكي · عبر أركان') };
  OX.received = {}; // lease|ym → marked received in this session

  /* Building service charges (per unit, per period). share = owner's % */
  const CH = (id, unit, period, amount, share, status, o = {}) => ({ id, unit, building: unit.split('-').slice(0, 3).join('-'), period, amount, share, status, ...o });
  OX.charges = [
    CH('SC-142-1102-2611', 'BN-RAM-00142-1102', '2026-11', 180, 100, 'due'),
    CH('SC-142-1102-2610', 'BN-RAM-00142-1102', '2026-10', 180, 100, 'paid', { paidOn: '2026-10-06' }),
    CH('SC-142-1102-2609', 'BN-RAM-00142-1102', '2026-09', 180, 100, 'paid', { paidOn: '2026-09-04' }),
    CH('SC-142-803-2611', 'BN-RAM-00142-803', '2026-11', 180, 100, 'tenantPays'),
    CH('SC-142-803-2610', 'BN-RAM-00142-803', '2026-10', 180, 100, 'tenantPays'),
    CH('LV-142-ELEV-1102', 'BN-RAM-00142-1102', '2027-01', 420, 100, 'proposed', { label: T('Elevator modernisation levy', 'مساهمة تحديث المصاعد'), levy: true }),
    CH('LV-142-ELEV-803', 'BN-RAM-00142-803', '2027-01', 420, 100, 'proposed', { label: T('Elevator modernisation levy', 'مساهمة تحديث المصاعد'), levy: true }),
    CH('SC-311-702-2611', 'BN-RAM-00311-702', '2026-11', 320, 100, 'due'),
    CH('SC-311-702-2610', 'BN-RAM-00311-702', '2026-10', 320, 100, 'overdue'),
    CH('SC-311-702-2609', 'BN-RAM-00311-702', '2026-09', 320, 100, 'paid', { paidOn: '2026-09-08' }),
    CH('SC-415-G02-2611', 'BN-RAM-00415-G02', '2026-11', 260, 100, 'paid', { paidOn: '2026-11-03' }),
    CH('SC-415-G02-2610', 'BN-RAM-00415-G02', '2026-10', 260, 100, 'paid', { paidOn: '2026-10-02' }),
    CH('SC-087-402-2611', 'BN-RAM-00087-402', '2026-11', 150, 50, 'due'),
    CH('SC-087-402-2610', 'BN-RAM-00087-402', '2026-10', 150, 50, 'paid', { paidOn: '2026-10-05' }),
    CH('SC-266-604-2611', 'BN-RAM-00266-604', '2026-11', 170, 50, 'due'),
    CH('SC-266-604-2610', 'BN-RAM-00266-604', '2026-10', 170, 50, 'paid', { paidOn: '2026-10-07' }),
  ];

  /* Authorised representatives (people acting for Khaled) */
  OX.reps = [
    { id: 'REP-0117', org: 'org_arkan', rel: 'manager', role: T('Property management company', 'شركة إدارة عقارات'), scope: ['leasing', 'collection', 'tenants', 'maintenance'], limit: T('Maintenance approvals up to ₪2,000 per job', 'اعتماد الصيانة حتى 2,000 ₪ للمهمة'), units: ['BN-RAM-00142-803', 'BN-RAM-00142-1102', 'BN-RAM-00311-702', 'BN-RAM-00266-604'], from: '2024-01-01', to: '2027-12-31', status: 'active', doc: 'POA-RAM-2024-0117' },
    { id: 'REP-0042', p: 'p_rana', rel: 'coowner', role: T('Co-owner (50%)', 'مالكة مشاركة (50%)'), scope: ['leasing', 'committee', 'decisions'], limit: T('Joint signature required for sale or mortgage', 'التوقيع المشترك مطلوب للبيع أو الرهن'), units: ['BN-RAM-00087-402', 'BN-RAM-00266-604'], from: '2013-01-20', to: null, status: 'active', doc: 'CO-AGR-2020-0042' },
    { id: 'REP-0388', p: 'p_firas', rel: 'family', role: T('Brother — limited power of attorney', 'أخ — وكالة محدودة'), scope: ['committee', 'collection'], limit: T('Committee votes and receipts only', 'تصويت اللجان واستلام الإيصالات فقط'), units: ['BN-RAM-00415-G02'], from: '2026-11-20', to: '2027-11-19', status: 'pendingVerification', doc: 'POA-RAM-2026-0388' },
    { id: 'REP-0210', p: 'p_hala', rel: 'lawyer', role: T('Lawyer — registry transfer', 'محامية — نقل ملكية في الطابو'), scope: ['registry'], limit: T('Registration of the 1102 purchase only', 'تسجيل شراء الشقة 1102 فقط'), units: ['BN-RAM-00142-1102'], from: '2022-12-01', to: '2023-03-31', status: 'expired', doc: 'POA-RAM-2022-0210' },
  ];
  OX.scopes = {
    leasing: T('Leasing & contracts', 'التأجير والعقود'), collection: T('Rent collection', 'تحصيل الإيجار'), tenants: T('Tenant communication', 'التواصل مع المستأجرين'),
    maintenance: T('Maintenance approvals', 'اعتماد الصيانة'), committee: T('Committee voting', 'التصويت في اللجنة'), decisions: T('Joint decisions', 'القرارات المشتركة'), registry: T('Land registry', 'دائرة تسجيل الأراضي'),
  };
  OX.relLabels = { manager: T('Property manager', 'مدير عقارات'), coowner: T('Co-owner', 'مالك مشارك'), family: T('Family member', 'أحد أفراد العائلة'), lawyer: T('Lawyer', 'محامٍ'), other: T('Other', 'أخرى') };
  /* People Khaled acts for */
  OX.proxies = [
    { p: 'p_adel', unit: 'BN-RAM-00142-904', scope: T('Proxy vote — Al-Masyoun Tower general assembly, 4 Dec 2026', 'تفويض بالتصويت — الهيئة العامة لبرج الماصيون، 4 كانون الأول 2026'), from: '2026-11-10', to: '2026-12-04' },
  ];

  /* Documents */
  const DOC = (cat, en, ar, date, o = {}) => ({ cat, name: T(en, ar), date, ...o });
  OX.docs = [
    DOC('deeds', 'Title deed — Apartment 803, Al-Masyoun Residence Tower', 'سند ملكية — شقة 803، برج الماصيون السكني', '2021-09-14', { unit: 'BN-RAM-00142-803', size: '2.4 MB', icon: 'award' }),
    DOC('deeds', 'Title deed — Apartment 1102, Al-Masyoun Residence Tower', 'سند ملكية — شقة 1102، برج الماصيون السكني', '2023-03-02', { unit: 'BN-RAM-00142-1102', size: '2.1 MB', icon: 'award' }),
    DOC('deeds', 'Title deed — Shop G02, Irsal Plaza', 'سند ملكية — محل G02، بلازا الإرسال', '2016-05-19', { unit: 'BN-RAM-00415-G02', size: '1.8 MB', icon: 'award' }),
    DOC('deeds', 'Title deed — Office 702, Manara Business Center', 'سند ملكية — مكتب 702، مركز المنارة للأعمال', '2019-11-04', { unit: 'BN-RAM-00311-702', size: '2.2 MB', icon: 'award' }),
    DOC('deeds', 'Title deed (joint) — Apartment 402, Al-Tireh Gardens', 'سند ملكية (مشترك) — شقة 402، حدائق الطيرة', '2013-01-20', { unit: 'BN-RAM-00087-402', size: '1.6 MB', icon: 'award' }),
    DOC('deeds', 'Title deed (joint) — Apartment 604, Masyoun Heights', 'سند ملكية (مشترك) — شقة 604، مرتفعات الماصيون', '2020-07-02', { unit: 'BN-RAM-00266-604', size: '1.9 MB', icon: 'award' }),
    DOC('deeds', 'Land registry extract — parcel 87, basin 12', 'إخراج قيد — قطعة 87، حوض 12', '2026-10-02', { unit: 'BN-RAM-00142-803', size: '640 KB', icon: 'landmark' }),
    DOC('contracts', 'Lease L-2026-0803 — Lina Haddad', 'عقد إيجار L-2026-0803 — لينا حداد', '2026-01-18', { unit: 'BN-RAM-00142-803', size: '1.1 MB', icon: 'contract' }),
    DOC('contracts', 'Amendment 1 to L-2026-0803 — parking', 'التعديل 1 على L-2026-0803 — موقف', '2026-05-01', { unit: 'BN-RAM-00142-803', size: '320 KB', icon: 'edit' }),
    DOC('contracts', 'Lease L-2024-0415 — Basel Hijazi (retail)', 'عقد إيجار L-2024-0415 — باسل حجازي (تجاري)', '2024-05-20', { unit: 'BN-RAM-00415-G02', size: '1.4 MB', icon: 'contract' }),
    DOC('contracts', 'Lease L-2025-0702 — renewal 2026', 'عقد إيجار L-2025-0702 — تجديد 2026', '2026-02-20', { unit: 'BN-RAM-00311-702', size: '1.2 MB', icon: 'contract' }),
    DOC('contracts', 'Co-ownership agreement — Rana Mansour', 'اتفاقية ملكية مشتركة — رنا منصور', '2020-07-02', { unit: 'BN-RAM-00266-604', size: '880 KB', icon: 'handshake' }),
    DOC('receipts', 'Rent receipt — November 2026, Apartment 803', 'إيصال إيجار — تشرين الثاني 2026، شقة 803', '2026-11-01', { unit: 'BN-RAM-00142-803', size: '96 KB', icon: 'receipt' }),
    DOC('receipts', 'Rent receipt — November 2026, Shop G02', 'إيصال إيجار — تشرين الثاني 2026، محل G02', '2026-11-03', { unit: 'BN-RAM-00415-G02', size: '94 KB', icon: 'receipt' }),
    DOC('receipts', 'Service charge receipt — Irsal Plaza, November', 'إيصال رسوم خدمات — بلازا الإرسال، تشرين الثاني', '2026-11-03', { unit: 'BN-RAM-00415-G02', size: '88 KB', icon: 'receipt' }),
    DOC('receipts', 'Service charge receipt — Al-Masyoun Tower, October', 'إيصال رسوم خدمات — برج الماصيون، تشرين الأول', '2026-10-06', { unit: 'BN-RAM-00142-1102', size: '88 KB', icon: 'receipt' }),
    DOC('receipts', 'Deposit return — L-2025-0214', 'إعادة التأمين — L-2025-0214', '2026-02-09', { unit: 'BN-RAM-00142-803', size: '72 KB', icon: 'receipt' }),
    DOC('authorisations', 'Power of attorney — Arkan Property Management', 'وكالة — أركان لإدارة العقارات', '2024-01-01', { size: '1.0 MB', icon: 'key' }),
    DOC('authorisations', 'Limited power of attorney — Firas Awwad', 'وكالة محدودة — فراس عواد', '2026-11-20', { size: '540 KB', icon: 'key' }),
    DOC('authorisations', 'Proxy form — Adel Shami (GA 4 Dec)', 'نموذج تفويض — عادل شامي (الهيئة العامة 4 ك١)', '2026-11-10', { size: '210 KB', icon: 'vote' }),
    DOC('building', 'Al-Masyoun Tower — 2027 draft budget', 'برج الماصيون — مسودة موازنة 2027', '2026-11-18', { size: '410 KB', icon: 'chart' }),
    DOC('building', 'Irsal Plaza — association by-laws', 'بلازا الإرسال — النظام الداخلي للجمعية', '2016-02-01', { size: '1.3 MB', icon: 'gavel' }),
  ];
  OX.docCats = [
    { id: 'deeds', label: T('Title deeds & registry', 'سندات الملكية والتسجيل'), icon: 'award' },
    { id: 'contracts', label: T('Contracts & amendments', 'العقود والتعديلات'), icon: 'contract' },
    { id: 'receipts', label: T('Receipts', 'الإيصالات'), icon: 'receipt' },
    { id: 'authorisations', label: T('Authorisations', 'التفويضات'), icon: 'key' },
    { id: 'building', label: T('Building & association', 'المبنى والجمعية'), icon: 'building' },
  ];

  /* =====================================================================
   * Helpers
   * ===================================================================== */
  const myUnits = () => OX.unitIds.map((id) => D.unit(id)).filter((u) => u && u.owner === ME);
  const meta = (u) => OX.meta[u.id || u] || {};
  const bld = (id) => D.building(id);
  const allLeases = () => D.leases.filter((l) => l.owner === ME);
  const leaseById = (id) => D.lease(id) || OX.pastLeases.find((l) => l.id === id);
  const leaseOf = (u) => D.leases.find((l) => l.unit === u.id && l.owner === ME);
  const share = (u) => meta(u).share || 100;
  const money = B.money;
  const moneyC = (n) => (B.isAr() ? `${B.compact(n)} ₪` : `₪${B.compact(n)}`);
  const seedOf = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 997; };
  const facade = (u, sky) => { const b = bld(u.building); return B.art.facade(seedOf(b.id) + 3, { type: b.type, floors: b.floors, sky }); };
  const unitName = (u) => D.unitLabel(u);
  const bName = (bid) => tx(bld(bid).name);
  const ymOf = (iso) => iso.slice(0, 7);
  const todayIso = '2026-11-25';
  const ymLabel = (ym) => { const [y, m] = ym.split('-').map(Number); return `${B.monLong(m - 1)} ${y}`; };
  const iso = (y, m, d = 1) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const personLine = (p) => esc(D.pname(p));
  const unitStatusOf = (u) => (meta(u).listing?.state === 'listed' && u.status === 'vacant' ? 'listed' : u.status);
  const nextDay = (d) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + 1); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
  const occTone = { rented: 'mint', ownerOccupied: 'navy', vacant: 'warn', maintenance: 'warn' };

  /** Monthly rent schedule for a lease: [{ym, due, amount, status, paidOn, method}] */
  const schedule = (l) => {
    const out = [];
    let [y, m] = l.start.split('-').map(Number);
    const [ey, em] = l.end.split('-').map(Number);
    while (y < ey || (y === ey && m <= em)) {
      const ym = `${y}-${String(m).padStart(2, '0')}`;
      const due = iso(y, m, l.payDay || 1);
      let status, paidOn = null;
      const k = `${l.id}|${ym}`;
      if (due > todayIso) status = B.daysBetween(todayIso, due) <= 7 ? 'due' : 'upcoming';
      else if (OX.payOverride[k] && !OX.received[k]) status = OX.payOverride[k];
      else { status = OX.lateOn[k] ? 'late' : 'paid'; paidOn = OX.received[k] || OX.lateOn[k] || iso(y, m, OX.payDay[l.id] || 1); }
      // rent escalation for the retail lease
      let amount = l.rent;
      if (l.id === 'L-2024-0415') amount = ym < '2025-06' ? 4525 : ym < '2026-06' ? 4660 : 4800;
      if (l.id === 'L-2025-0702' && ym < '2026-03') amount = 5400;
      out.push({ id: `${l.id}-${ym}`, lease: l.id, unit: l.unit, ym, due, amount, status, paidOn, method: paidOn ? OX.payMethod[l.id] : null });
      m++; if (m > 12) { m = 1; y++; }
    }
    return out;
  };
  const allPayments = () => allLeases().concat(OX.pastLeases).flatMap(schedule);
  const monthStats = (ym = '2026-11') => {
    const rows = allPayments().filter((p) => p.ym === ym);
    const expected = B.sum(rows, (p) => p.amount);
    const got = B.sum(rows.filter((p) => p.status === 'paid' || p.status === 'late'), (p) => p.amount);
    return { rows, expected, got, overdue: B.sum(rows.filter((p) => p.status === 'overdue'), (p) => p.amount) };
  };
  const overdueRows = () => allPayments().filter((p) => p.status === 'overdue');
  const ownerChargeAmt = (c) => Math.round((c.amount * c.share) / 100);
  const chargesDue = () => OX.charges.filter((c) => c.status === 'due' || c.status === 'overdue');
  const payeeOf = (bid) => { const c = D.committeeOf(bid); if (c) return tx(c.name); const b = bld(bid); return b.manager ? tx(D.org(b.manager).name) : L('Building management', 'إدارة المبنى'); };
  const portfolioValue = () => B.sum(myUnits(), (u) => (meta(u).value || 0) * share(u) / 100);
  const counts = () => { const us = myUnits(); return { all: us.length, rented: us.filter((u) => u.status === 'rented').length, vacant: us.filter((u) => u.status === 'vacant').length, own: us.filter((u) => u.status === 'ownerOccupied').length }; };
  const repName = (r) => (r.org ? tx(D.org(r.org).name) : D.pname(r.p));
  const repsFor = (uid) => OX.reps.filter((r) => r.units.includes(uid) && r.status !== 'expired' && r.status !== 'revoked');
  const ownersLine = (o) => (o.p ? esc(D.pname(o.p)) : esc(tx(o.org)));

  /* =====================================================================
   * Styles (prefixed ow-)
   * ===================================================================== */
  B.css(`
  .ow-hero { position: relative; overflow: hidden; border-radius: var(--r-lg); background: var(--navy); color: var(--navy-ink); padding: 26px 28px; min-height: 230px; display: flex; flex-direction: column; gap: 18px; }
  .ow-hero .oh-art { position: absolute; inset-block: 0; inset-inline-end: 0; width: 46%; pointer-events: none; opacity: .9; }
  .ow-hero .oh-art svg { width: 100%; height: 100%; }
  .ow-hero .oh-art::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, var(--navy) 0%, rgba(20,43,59,.55) 45%, rgba(20,43,59,0) 100%); }
  html[dir="rtl"] .ow-hero .oh-art::after { background: linear-gradient(270deg, var(--navy) 0%, rgba(20,43,59,.55) 45%, rgba(20,43,59,0) 100%); }
  .ow-hero > :not(.oh-art) { position: relative; z-index: 1; }
  .ow-hero .oh-hi { font-size: 14px; color: var(--navy-ink); }
  .ow-hero .oh-val { font-family: var(--font-display); color: #fff; font-size: 40px; font-weight: 700; letter-spacing: -.02em; line-height: 1.05; font-variant-numeric: tabular-nums; }
  .ow-hero .oh-cap { font-size: 12.5px; color: var(--navy-ink); margin-top: 4px; }
  .ow-hero .oh-stats { display: flex; gap: 26px; flex-wrap: wrap; margin-top: auto; }
  .ow-hero .oh-stats b { display: block; color: #fff; font-family: var(--font-display); font-size: 20px; font-variant-numeric: tabular-nums; }
  .ow-hero .oh-stats span { font-size: 12px; }
  .ow-occ { display: flex; height: 8px; border-radius: 99px; overflow: hidden; background: rgba(255,255,255,.12); gap: 2px; max-width: 440px; }
  .ow-occ i { display: block; height: 100%; }
  .ow-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 12px; }
  .ow-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .ow-legend i { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
  .ow-alert { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: var(--r); background: var(--warn-bg); color: #7A3B07; border: 1px solid #F6DDB4; }
  .ow-alert .oa-i { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: #fff; color: var(--warn); flex: none; }
  .ow-alert .oa-i svg { width: 20px; height: 20px; }
  .ow-alert b { color: #5A2C05; }
  .ow-alert .btn { flex: none; }
  .ow-rail { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .ow-pcard { padding: 0; overflow: hidden; display: flex; flex-direction: column; text-align: start; width: 100%; }
  .ow-pcard .media { border-radius: 0; aspect-ratio: 16 / 10; }
  .ow-pcard .pc-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
  .ow-pcard .pc-t { font-weight: 650; font-size: 15px; display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
  .ow-pcard .pc-s { font-size: 12.5px; color: var(--text-2); }
  .ow-pcard .pc-f { margin-top: auto; padding-top: 10px; border-top: 1px solid var(--line-2); display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 13px; }
  .ow-pcard .pc-f b { font-variant-numeric: tabular-nums; }
  .ow-bhead { display: flex; align-items: center; gap: 14px; margin: 6px 0 12px; }
  .ow-bhead .bh-thumb { width: 52px; height: 52px; border-radius: 14px; overflow: hidden; flex: none; background: var(--line-2); }
  .ow-bhead .bh-thumb svg { width: 100%; height: 100%; }
  .ow-bhead h2 { font-size: 17px; }
  .ow-uhero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); padding: 0; overflow: hidden; }
  .ow-uhero .media { border-radius: 0; aspect-ratio: auto; min-height: 280px; height: 100%; }
  .ow-uhero .uh-body { padding: 24px; display: flex; flex-direction: column; gap: 14px; min-width: 0; }
  .ow-uhero h1 { font-size: 26px; line-height: 1.15; }
  .ow-uhero .uh-facts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
  .ow-uhero .uh-facts div { background: var(--surface-2); border-radius: 12px; padding: 10px 12px; min-width: 0; }
  .ow-uhero .uh-facts b { display: block; font-family: var(--font-display); font-size: 17px; font-variant-numeric: tabular-nums; }
  .ow-uhero .uh-facts span { font-size: 11.5px; color: var(--text-3); }
  .ow-stat { display: flex; flex-direction: column; gap: 2px; }
  .ow-stat .s-v { font-family: var(--font-display); font-size: 24px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.1; }
  .ow-stat .s-l { font-size: 12px; color: var(--text-3); }
  .ow-list-cta { border-radius: var(--r); padding: 20px; background: var(--mint-50); border: 1px solid var(--mint-100); display: flex; flex-direction: column; gap: 12px; }
  .ow-list-cta h3 { font-size: 17px; }
  .ow-list-cta p { font-size: 13.5px; color: #0A6E4D; }
  .ow-owner { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .ow-share { display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: 99px; background: var(--line-2); font-size: 11.5px; font-weight: 650; color: var(--text-2); font-variant-numeric: tabular-nums; }
  .ow-tl .tl-body .ow-doc { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; font-size: 12px; font-weight: 600; color: var(--mint-ink); }
  .ow-tl .tl-body .ow-doc svg { width: 14px; height: 14px; }
  .ow-lhead { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 20px; align-items: center; }
  .ow-lhead .lh-rent { font-family: var(--font-display); font-size: 32px; font-weight: 700; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
  .ow-lhead .lh-rent small { font-size: 14px; color: var(--text-3); font-weight: 500; }
  .ow-term { display: flex; align-items: center; gap: 14px; }
  .ow-term .ring b { font-size: 13px; }
  .ow-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .ow-chg { display: flex; flex-direction: column; gap: 14px; }
  .ow-chg .cg-top { display: flex; align-items: center; gap: 12px; }
  .ow-chg .cg-amt { font-family: var(--font-display); font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .ow-pay-items { display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
  .ow-pay-items label { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-bottom: 1px solid var(--line-2); cursor: pointer; font-size: 14px; }
  .ow-pay-items label:last-child { border-bottom: 0; }
  .ow-pay-items input { width: 18px; height: 18px; accent-color: var(--mint-ink); flex: none; }
  .ow-pay-items .pi-b { flex: 1; min-width: 0; }
  .ow-pay-items .pi-b small { display: block; color: var(--text-3); font-size: 12px; }
  .ow-pay-total { display: flex; justify-content: space-between; align-items: baseline; padding: 14px 2px 2px; font-size: 14px; }
  .ow-pay-total b { font-family: var(--font-display); font-size: 22px; font-variant-numeric: tabular-nums; }
  .ow-rep { display: flex; flex-direction: column; gap: 14px; }
  .ow-rep .rp-top { display: flex; gap: 12px; align-items: flex-start; }
  .ow-rep .rp-org { width: 44px; height: 44px; border-radius: 14px; background: var(--navy); color: var(--mint); display: grid; place-items: center; flex: none; }
  .ow-rep .rp-org svg { width: 22px; height: 22px; }
  .ow-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .ow-tag { display: inline-flex; align-items: center; height: 26px; padding: 0 10px; border-radius: 99px; background: var(--surface-2); border: 1px solid var(--line); font-size: 12px; font-weight: 550; color: var(--text-2); }
  .ow-dates { display: flex; gap: 18px; flex-wrap: wrap; font-size: 12.5px; color: var(--text-2); }
  .ow-dates b { color: var(--ink); font-weight: 600; }
  .ow-mk { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .ow-mk button { text-align: start; border-radius: 14px; padding: 14px; border: 1px solid var(--line); background: var(--surface-2); display: flex; flex-direction: column; gap: 8px; transition: border-color .2s; }
  .ow-mk button:hover { border-color: var(--mint); }
  .ow-mk .mk-i { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; background: #fff; color: var(--navy); border: 1px solid var(--line); }
  .ow-mk .mk-i svg { width: 18px; height: 18px; }
  .ow-mk b { font-size: 14px; }
  .ow-mk span { font-size: 12px; color: var(--text-2); }
  .ow-link { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: var(--mint-ink); }
  .ow-link svg { width: 16px; height: 16px; }
  .ow-i14 { width: 14px; height: 14px; flex: none; display: inline-block; vertical-align: -2px; margin-inline-end: 4px; color: var(--text-3); }
  .ow-tl .tl-title .badge { margin-inline-start: 4px; vertical-align: 1px; }
  .ow-chart .bars .col:nth-last-child(-n+2) .tip { inset-inline-end: 0; }
  .ow-chart .bars .col:nth-child(-n+3) .tip { inset-inline-start: 0; }
  .ow-meth { display: block; }
  .m-row .ow-meth { display: inline; }
  .ow-quick-wrap { display: none; }
  @media (max-width: 900px) { .ow-quick-wrap { display: block; } }
  .ow-trio { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .ow-trio .ow-stat { background: var(--surface-2); border-radius: 12px; padding: 10px 12px; min-width: 0; }
  @media (max-width: 640px) { .ow-trio .s-v { font-size: 16px !important; } .ow-trio .ow-stat { padding: 8px 10px; } }
  .ow-review { border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
  .ow-review .media { border-radius: 0; aspect-ratio: 16 / 7; }
  .ow-review .rv-b { padding: 14px 16px; }
  @media (max-width: 1100px) { .ow-uhero .uh-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 900px) { .ow-rail { grid-template-columns: repeat(2, minmax(0, 1fr)); } .ow-uhero { grid-template-columns: minmax(0, 1fr); } .ow-uhero .media { min-height: 0; aspect-ratio: 16 / 9; } }
  @media (max-width: 640px) {
    .ow-hero { padding: 20px; min-height: 0; gap: 14px; border-radius: 22px; }
    .ow-hero .oh-art { width: 62%; opacity: .55; }
    .ow-hero .oh-val { font-size: 34px; }
    .ow-hero .oh-stats { gap: 18px; }
    .ow-rail { display: grid; grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: 80%; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; margin-inline: -16px; padding-inline: 16px; scroll-padding-inline: 16px; gap: 12px; }
    .ow-rail::-webkit-scrollbar { display: none; }
    .ow-rail > * { scroll-snap-align: start; }
    .ow-rail.ow-wrap { grid-auto-flow: row; grid-template-columns: minmax(0, 1fr); grid-auto-columns: auto; overflow: visible; margin-inline: 0; padding-inline: 0; }
    .ow-alert { flex-wrap: wrap; }
    .ow-alert .btn { width: 100%; }
    .ow-uhero .uh-body { padding: 18px; }
    .ow-uhero h1 { font-size: 22px; }
    .ow-lhead { grid-template-columns: minmax(0, 1fr); }
    .ow-lhead .lh-rent { font-size: 28px; }
    .ow-actions .btn { flex: 1 1 calc(50% - 4px); }
    .ow-mk { grid-template-columns: minmax(0, 1fr); }
  }
  `);

  /* =====================================================================
   * Shared fragments
   * ===================================================================== */
  const sectionTitle = (title, extra = '') => `<div class="section-title"><h2>${title}</h2>${extra}</div>`;

  const propCard = (u) => {
    const b = bld(u.building);
    const l = leaseOf(u);
    const m = meta(u);
    const st = unitStatusOf(u);
    let foot;
    if (u.status === 'rented' && l) foot = `<span class="row-sm">${ui.avatar(D.pname(l.tenant), 'sm')}<span class="truncate">${personLine(l.tenant)}</span></span><b>${money(l.rent)}<span class="faint xs"> / ${L('mo', 'شهر')}</span></b>`;
    else if (u.status === 'vacant') foot = m.listing?.state === 'listed' ? `<span class="muted">${L(`${m.listing.inquiries} inquiries`, `${m.listing.inquiries} استفسارات`)}</span><b>${money(m.listing.ask)}<span class="faint xs"> / ${L('mo', 'شهر')}</span></b>` : `<span class="muted">${L(`Vacant since ${B.dateShort(m.vacantSince)}`, `شاغرة منذ ${B.dateShort(m.vacantSince)}`)}</span><span class="mint-ink strong xs">${L('Not listed', 'غير معروضة')}</span>`;
    else foot = `<span class="muted">${L('Your home', 'منزلك')}</span>${share(u) < 100 ? `<span class="ow-share">${L(`${share(u)}% share`, `حصة ${share(u)}%`)}</span>` : ''}`;
    return `<button class="card link ow-pcard" data-go="${R}-property-${u.id}">
      <div class="media">${facade(u)}<span class="m-tag">${ui.status(st)}</span></div>
      <div class="pc-body">
        <div class="pc-t"><span class="truncate">${esc(unitName(u))}</span><span class="xs faint nowrap">${u.area} ${L('m²', 'م²')}</span></div>
        <div class="pc-s truncate">${esc(tx(b.name))}</div>
        <div class="pc-f">${foot}</div>
      </div></button>`;
  };

  const leaseLi = (l) => {
    const u = D.unit(l.unit);
    return ui.li({ avatar: D.pname(l.tenant), title: `${esc(D.pname(l.tenant))}`, sub: `${esc(unitName(u))} · ${esc(bName(l.building))}`, end: `<b class="num">${money(l.rent)}</b>${ui.status(l.status)}`, go: `${R}-lease-${l.id}` });
  };

  /* =====================================================================
   * Actions & forms
   * ===================================================================== */
  /* --- List on marketplace (explicit, two-step) --- */
  B.act.owList = (uid) => {
    const u = D.unit(uid); const m = meta(u);
    const d = OX.draft && OX.draft.unit === uid ? OX.draft : {};
    B.modal({
      title: L('List on the property marketplace', 'العرض في سوق العقارات'),
      sub: `${esc(unitName(u))} · ${esc(bName(u.building))}`,
      size: 'md', form: 'owListReview',
      body: `<input type="hidden" name="unit" value="${esc(uid)}">
        ${ui.callout(L('Vacant units are <b>not listed automatically</b>. Review the details below — nothing is published until you confirm on the next step.', 'الوحدات الشاغرة <b>لا تُعرض تلقائياً</b>. راجع التفاصيل أدناه — لن يُنشر شيء قبل تأكيدك في الخطوة التالية.'), 'mint', 'info')}
        <div class="form-grid" style="margin-top:14px">
          ${ui.field({ name: 'ask', label: L('Asking rent (₪ / month)', 'الإيجار المطلوب (₪ / شهر)'), type: 'number', value: d.ask || m.suggested || 2500, required: true, hint: L(`Suggested ${money(m.suggested || 2500)} from 6 comparable listings nearby`, `المقترح ${money(m.suggested || 2500)} بناءً على 6 عروض مشابهة قريبة`) })}
          ${ui.field({ name: 'available', label: L('Available from', 'متاحة اعتباراً من'), type: 'date', value: d.available || '2026-12-01', required: true })}
          ${ui.field({ name: 'term', label: L('Minimum term', 'الحد الأدنى للمدة'), type: 'select', value: d.term || '12', options: [{ v: '6', l: L('6 months', '6 أشهر') }, { v: '12', l: L('12 months', '12 شهراً') }, { v: '24', l: L('24 months', '24 شهراً') }] })}
          ${ui.field({ name: 'furnished', label: L('Furnishing', 'التأثيث'), type: 'select', value: d.furnished || 'no', options: [{ v: 'no', l: L('Unfurnished', 'غير مفروشة') }, { v: 'semi', l: L('Semi-furnished', 'مفروشة جزئياً') }, { v: 'yes', l: L('Furnished', 'مفروشة') }] })}
          ${ui.field({ name: 'contact', label: L('Who handles inquiries', 'من يتولى الاستفسارات'), type: 'radio', full: true, value: d.contact || 'arkan', options: [{ v: 'arkan', l: L('Arkan Property Management', 'أركان لإدارة العقارات'), d: L('Your authorised manager', 'مديرك المفوّض'), icon: 'briefcase' }, { v: 'me', l: L('Me directly', 'أنا مباشرة'), d: L('Messages come to this app', 'تصلك الرسائل على التطبيق'), icon: 'user' }] })}
          ${ui.field({ name: 'desc', label: L('Description', 'الوصف'), type: 'textarea', full: true, value: d.desc || L(`Bright ${u.beds || 2}-bedroom apartment on floor ${u.floor}, ${tx(m.view || '')}. Building with elevators, generator and parking.`, `شقة مشرقة ${u.beds || 2} غرف نوم في الطابق ${u.floor}، ${tx(m.view || '')}. مبنى مع مصاعد ومولد ومواقف.`) })}
        </div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Review listing', 'مراجعة العرض'), { kind: 'primary', type: 'submit', icon: 'eye' })}`,
    });
  };
  B.submit.owListReview = (data) => {
    OX.draft = data;
    const u = D.unit(data.unit);
    B.modal({
      title: L('Confirm and publish', 'التأكيد والنشر'),
      sub: L('This is how your listing will appear to renters.', 'هكذا سيظهر عرضك للمستأجرين.'),
      size: 'sm',
      body: `<div class="ow-review"><div class="media">${facade(u)}</div><div class="rv-b">
          <div class="row between"><b>${esc(unitName(u))}</b><b class="num">${money(+data.ask || 0)}<span class="faint xs"> / ${L('mo', 'شهر')}</span></b></div>
          <div class="xs muted" style="margin-top:2px">${esc(bName(u.building))} · ${u.area} ${L('m²', 'م²')} · ${u.beds || 2} ${L('bedrooms', 'غرف نوم')}</div></div></div>
        ${ui.kv([[L('Available from', 'متاحة من'), B.date(data.available)], [L('Minimum term', 'أقل مدة'), L(`${data.term} months`, `${data.term} شهراً`)], [L('Inquiries handled by', 'الاستفسارات لدى'), data.contact === 'me' ? L('You', 'أنت') : L('Arkan Property Management', 'أركان لإدارة العقارات')]])}
        <label class="check" style="margin-top:8px"><input type="checkbox" id="ow-confirm" checked><span class="small">${L('I confirm I am the registered owner (or authorised) and the unit is legally available to rent.', 'أؤكد أنني المالك المسجّل (أو مفوّض) وأن الوحدة متاحة قانونياً للتأجير.')}</span></label>`,
      foot: `${ui.btn(L('Back', 'رجوع'), { act: 'owList', arg: data.unit, icon: 'chevL', iconCls: 'flip' })}${ui.btn(L('Publish listing', 'نشر العرض'), { kind: 'primary', act: 'owPublish', arg: data.unit, icon: 'megaphone' })}`,
    });
  };
  B.act.owPublish = (uid) => {
    const cb = document.getElementById('ow-confirm');
    if (cb && !cb.checked) { B.toast(L('Please confirm you are authorised to list this unit', 'يرجى تأكيد أنك مخوّل بعرض هذه الوحدة'), 'info'); return; }
    const d = OX.draft || {};
    const m = OX.meta[uid];
    const ref = `PL-26-${uid.slice(-4).replace(/\D/g, '') || '1102'}`;
    m.listing = { state: 'listed', since: todayIso, ask: +d.ask || m.suggested || 2500, views: 0, inquiries: 0, viewings: 0, ref, by: d.contact === 'me' ? ME : 'org_arkan', available: d.available || '2026-12-01', furnished: d.furnished || 'no' };
    OX.draft = null;
    B.success({ title: L('Your unit is now listed', 'تم عرض وحدتك'), text: L('It is visible on the BENA property marketplace. You can pause or remove the listing at any time.', 'أصبحت ظاهرة في سوق العقارات على بينا. يمكنك إيقاف العرض أو إزالته في أي وقت.'), ref });
    B.refresh();
  };
  B.act.owUnlist = (uid) => B.confirm({
    title: L('Remove this listing?', 'إزالة هذا العرض؟'),
    text: L('The unit will stay vacant and disappear from the marketplace. Existing inquiries are kept.', 'ستبقى الوحدة شاغرة وتختفي من السوق. ستُحفظ الاستفسارات الحالية.'),
    ok: L('Remove listing', 'إزالة العرض'), danger: true,
    onOk: () => { OX.meta[uid].listing = { state: 'notListed' }; B.closeModal(); B.toast(L('Listing removed', 'تمت إزالة العرض')); B.refresh(); },
  });
  B.act.owEditListing = (uid) => { const l = meta(uid).listing; OX.draft = { unit: uid, ask: l.ask, available: l.available, furnished: l.furnished, contact: l.by === ME ? 'me' : 'arkan' }; B.act.owList(uid); };

  /* --- Renew / amend / message --- */
  B.act.owRenew = (lid) => {
    const l = leaseById(lid);
    const endY = +l.end.slice(0, 4) + 1;
    B.modal({
      title: L('Offer a renewal', 'تقديم عرض تجديد'), sub: `${ui.idMono(l.id)} · ${esc(D.pname(l.tenant))}`, form: 'owRenew',
      body: `<input type="hidden" name="lease" value="${l.id}"><div class="form-grid">
        ${ui.field({ name: 'start', label: L('New term starts', 'بداية المدة الجديدة'), type: 'date', value: nextDay(l.end), required: true })}
        ${ui.field({ name: 'term', label: L('Term', 'المدة'), type: 'select', value: '12', options: [{ v: '12', l: L('12 months', '12 شهراً') }, { v: '24', l: L('24 months', '24 شهراً') }, { v: '36', l: L('36 months', '36 شهراً') }] })}
        ${ui.field({ name: 'rent', label: L('Monthly rent (₪)', 'الإيجار الشهري (₪)'), type: 'number', value: Math.round(l.rent * 1.03 / 50) * 50, required: true, hint: L(`Current ${money(l.rent)} · +3% shown`, `الحالي ${money(l.rent)} · مع زيادة 3%`) })}
        ${ui.field({ name: 'deposit', label: L('Deposit', 'التأمين'), type: 'select', options: [{ v: 'keep', l: L(`Keep current (${money(l.deposit)})`, `إبقاء الحالي (${money(l.deposit)})`) }, { v: 'top', l: L('Top up to 2 months', 'رفعه إلى شهرين') }] })}
        ${ui.field({ name: 'note', label: L('Message to tenant', 'رسالة إلى المستأجر'), type: 'textarea', full: true, value: L(`Dear ${D.pname(l.tenant)}, we would be happy to continue the lease for another term from ${endY - 1}. Please review the offer.`, `عزيزتي/عزيزي ${D.pname(l.tenant)}، يسعدنا الاستمرار في العقد لمدة جديدة. يرجى مراجعة العرض.`) })}
        </div><div style="margin-top:12px">${ui.callout(L('The tenant receives the offer in their BENA app and can accept, counter or decline. Arkan is copied as your representative.', 'يستلم المستأجر العرض في تطبيق بينا ويمكنه القبول أو التفاوض أو الرفض. تُرسل نسخة إلى أركان بصفتها ممثلك.'), '', 'info')}</div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send renewal offer', 'إرسال عرض التجديد'), { kind: 'primary', type: 'submit', icon: 'send' })}`,
    });
  };
  B.submit.owRenew = (data) => {
    OX.renewals[data.lease] = { rent: +data.rent || 0, start: data.start, term: data.term, sent: todayIso };
    B.success({ title: L('Renewal offer sent', 'تم إرسال عرض التجديد'), text: L(`Offer of ${money(+data.rent || 0)} / month for ${data.term} months. You'll be notified when the tenant responds.`, `عرض بقيمة ${money(+data.rent || 0)} شهرياً لمدة ${data.term} شهراً. سنعلمك عند رد المستأجر.`), ref: B.uid('RNW') });
    B.refresh();
  };
  B.act.owAmend = (lid) => {
    const l = leaseById(lid);
    B.modal({
      title: L('Propose an amendment', 'اقتراح تعديل'), sub: `${ui.idMono(l.id)} · ${esc(D.pname(l.tenant))}`, form: 'owAmend',
      body: `<input type="hidden" name="lease" value="${l.id}"><div class="form-grid">
        ${ui.field({ name: 'kind', label: L('What changes', 'ما الذي سيتغيّر'), type: 'select', full: true, options: [{ v: 'rent', l: L('Rent amount', 'قيمة الإيجار') }, { v: 'parking', l: L('Parking / storage', 'موقف / مخزن') }, { v: 'occupants', l: L('Occupants', 'الشاغلون') }, { v: 'charges', l: L('Service charge responsibility', 'مسؤولية رسوم الخدمات') }, { v: 'other', l: L('Other clause', 'بند آخر') }] })}
        ${ui.field({ name: 'effective', label: L('Effective date', 'تاريخ السريان'), type: 'date', value: '2026-12-01', required: true })}
        ${ui.field({ name: 'value', label: L('New value (if any)', 'القيمة الجديدة (إن وجدت)'), placeholder: L('e.g. ₪3,300', 'مثال: 3,300 ₪') })}
        ${ui.field({ name: 'desc', label: L('Describe the change', 'صف التعديل'), type: 'textarea', full: true, required: true, placeholder: L('Clause, reason and any conditions…', 'البند والسبب وأي شروط…') })}
        </div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send for signature', 'إرسال للتوقيع'), { kind: 'primary', type: 'submit', icon: 'edit' })}`,
    });
  };
  B.submit.owAmend = (data) => {
    const x = OX.leaseX[data.lease];
    if (x) x.history.unshift({ date: todayIso, kind: 'pending', title: T('Amendment proposed — awaiting tenant signature', 'تعديل مقترح — بانتظار توقيع المستأجر'), body: { en: data.desc || '—', ar: data.desc || '—' } });
    B.success({ title: L('Amendment sent for signature', 'تم إرسال التعديل للتوقيع'), text: L(`Takes effect ${B.date(data.effective)} once both parties sign.`, `يسري في ${B.date(data.effective)} بعد توقيع الطرفين.`), ref: B.uid('AMD') });
    B.refresh();
  };
  B.act.owMessage = (pid) => {
    B.modal({
      title: L(`Message ${D.pname(pid)}`, `رسالة إلى ${D.pname(pid)}`), sub: L('Sent through BENA — the tenant replies in their app.', 'تُرسل عبر بينا — يرد المستأجر من تطبيقه.'), size: 'sm', form: 'owMessage',
      body: `<input type="hidden" name="to" value="${esc(pid)}">${ui.field({ name: 'subject', label: L('Subject', 'الموضوع'), type: 'select', options: [{ v: 'general', l: L('General', 'عام') }, { v: 'rent', l: L('Rent payment', 'دفع الإيجار') }, { v: 'renewal', l: L('Renewal', 'التجديد') }, { v: 'visit', l: L('Inspection visit', 'زيارة تفقدية') }] })}
        <div style="height:12px"></div>${ui.field({ name: 'msg', label: L('Message', 'الرسالة'), type: 'textarea', required: true, placeholder: L('Write your message…', 'اكتب رسالتك…') })}`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send', 'إرسال'), { kind: 'primary', type: 'submit', icon: 'send' })}`,
    });
  };
  B.submit.owMessage = (data) => B.success({ title: L('Message sent', 'تم إرسال الرسالة'), text: L(`${D.pname(data.to)} will see it in the BENA app.`, `سيراها ${D.pname(data.to)} في تطبيق بينا.`) });
  B.act.owRemind = (pid) => {
    const p = allPayments().find((x) => x.id === pid);
    const l = leaseById(p.lease);
    B.modal({
      title: L('Send a payment reminder', 'إرسال تذكير بالدفع'), sub: `${esc(D.pname(l.tenant))} · ${ymLabel(p.ym)}`, size: 'sm', form: 'owRemind',
      body: `<input type="hidden" name="id" value="${esc(pid)}">${ui.kv([[L('Amount', 'المبلغ'), `<b>${money(p.amount)}</b>`], [L('Was due', 'كان مستحقاً'), `${B.date(p.due)} · <span class="mint-ink">${B.inDays(p.due)}</span>`]])}
        <div style="height:10px"></div>${ui.field({ name: 'msg', label: L('Message', 'الرسالة'), type: 'textarea', value: L(`Hello ${D.pname(l.tenant)}, a friendly reminder that the rent for ${ymLabel(p.ym)} (${money(p.amount)}) is outstanding.`, `مرحباً ${D.pname(l.tenant)}، تذكير ودّي بأن إيجار ${ymLabel(p.ym)} (${money(p.amount)}) ما زال مستحقاً.`) })}`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send reminder', 'إرسال التذكير'), { kind: 'primary', type: 'submit', icon: 'bell' })}`,
    });
  };
  B.submit.owRemind = () => B.success({ title: L('Reminder sent', 'تم إرسال التذكير'), text: L('Sent by app notification and SMS. Arkan is copied.', 'أُرسل بإشعار التطبيق ورسالة نصية. تم إعلام أركان.') });
  B.act.owReceived = (pid) => {
    const p = allPayments().find((x) => x.id === pid);
    B.confirm({ title: L('Mark as received?', 'تأكيد الاستلام؟'), text: L(`Record ${money(p.amount)} for ${ymLabel(p.ym)} as paid today.`, `تسجيل ${money(p.amount)} عن ${ymLabel(p.ym)} كمدفوع اليوم.`), ok: L('Mark received', 'تأكيد الاستلام'),
      onOk: () => { OX.received[`${p.lease}|${p.ym}`] = todayIso; B.success({ title: L('Payment recorded', 'تم تسجيل الدفعة'), text: L('A receipt was added to your documents.', 'أُضيف إيصال إلى مستنداتك.'), ref: B.uid('RC') }); B.refresh(); } });
  };

  /* --- Service charges --- */
  B.act.owPay = (bid) => {
    const items = chargesDue().filter((c) => !bid || c.building === bid);
    if (!items.length) { B.toast(L('Nothing due for this building', 'لا توجد مستحقات لهذا المبنى')); return; }
    const total = B.sum(items, ownerChargeAmt);
    const wrap = B.modal({
      title: L('Pay service charges', 'دفع رسوم الخدمات'), sub: bid ? esc(payeeOf(bid)) : L('All buildings', 'جميع المباني'), form: 'owPay',
      body: `<div class="ow-pay-items">${items.map((c) => `<label><input type="checkbox" name="item" value="${c.id}" data-amt="${ownerChargeAmt(c)}" checked>
          <span class="pi-b"><b>${esc(unitName(D.unit(c.unit)))} · ${ymLabel(c.period)}</b><small>${esc(bName(c.building))}${c.share < 100 ? ` · ${L(`your ${c.share}% of ${money(c.amount)}`, `حصتك ${c.share}% من ${money(c.amount)}`)}` : ''}</small></span>
          ${c.status === 'overdue' ? ui.status('overdue') : ''}<b class="num">${money(ownerChargeAmt(c))}</b></label>`).join('')}</div>
        <div class="ow-pay-total"><span class="muted">${L('Total', 'المجموع')}</span><b id="ow-pay-total">${money(total)}</b></div>
        <div style="margin-top:14px">${ui.field({ name: 'method', label: L('Pay with', 'الدفع بواسطة'), type: 'radio', options: [{ v: 'card', l: L('Card •••• 4821', 'بطاقة •••• 4821'), icon: 'card' }, { v: 'bank', l: L('Bank transfer', 'تحويل بنكي'), icon: 'landmark' }, { v: 'wallet', l: L('Rent balance', 'رصيد الإيجارات'), d: L('Deduct from rent collected', 'خصم من الإيجار المحصّل'), icon: 'wallet' }] })}</div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Pay now', 'ادفع الآن'), { kind: 'primary', type: 'submit', icon: 'check' })}`,
    });
    wrap.addEventListener('change', () => {
      const sum = [...wrap.querySelectorAll('input[name=item]:checked')].reduce((s, x) => s + +x.dataset.amt, 0);
      const t = wrap.querySelector('#ow-pay-total'); if (t) t.textContent = money(sum);
    });
  };
  B.submit.owPay = (data, form) => {
    const ids = [...form.querySelectorAll('input[name=item]:checked')].map((x) => x.value);
    if (!ids.length) { B.toast(L('Select at least one charge', 'اختر رسماً واحداً على الأقل'), 'info'); return; }
    let sum = 0;
    ids.forEach((id) => { const c = OX.charges.find((x) => x.id === id); if (c) { c.status = 'paid'; c.paidOn = todayIso; sum += ownerChargeAmt(c); } });
    B.success({ title: L('Payment successful', 'تم الدفع بنجاح'), text: L(`${money(sum)} paid for ${ids.length} charge(s). Receipts are in your documents.`, `تم دفع ${money(sum)} عن ${ids.length} رسوم. الإيصالات في مستنداتك.`), ref: B.uid('PAY') });
    B.refresh();
  };

  /* --- Representatives --- */
  B.act.owAddRep = () => {
    B.modal({
      title: L('Add an authorised representative', 'إضافة ممثل مفوّض'), sub: L('Give someone permission to act for you on selected units.', 'امنح شخصاً صلاحية التصرف نيابةً عنك في وحدات محددة.'), size: 'lg', form: 'owAddRep',
      body: `<div class="form-grid">
        ${ui.field({ name: 'name', label: L('Full name or company', 'الاسم الكامل أو الشركة'), required: true, placeholder: L('e.g. Firas Awwad', 'مثال: فراس عواد') })}
        ${ui.field({ name: 'nid', label: L('National ID / registration no.', 'رقم الهوية / رقم التسجيل'), required: true, placeholder: '9xxxxxxxx' })}
        ${ui.field({ name: 'rel', label: L('Relationship', 'صفة العلاقة'), type: 'select', options: Object.entries(OX.relLabels).map(([v, l]) => ({ v, l })) })}
        ${ui.field({ name: 'phone', label: L('Mobile', 'الجوال'), type: 'tel', placeholder: '+970 5x xxx xxxx' })}
        <div class="field full"><label>${L('Permissions', 'الصلاحيات')}</label><div class="ow-tags">${Object.entries(OX.scopes).filter(([k]) => k !== 'decisions').map(([k, v], i) => `<label class="check" style="width:calc(50% - 6px);min-width:180px"><input type="checkbox" name="scope_${k}" ${i < 2 ? 'checked' : ''}><span>${tx(v)}</span></label>`).join('')}</div></div>
        <div class="field full"><label>${L('Units covered', 'الوحدات المشمولة')}</label><div class="ow-tags">${myUnits().map((u, i) => `<label class="check" style="width:calc(50% - 6px);min-width:180px"><input type="checkbox" name="unit_${u.id}" ${i === 0 ? 'checked' : ''}><span>${esc(unitName(u))} <span class="faint xs">· ${esc(bName(u.building))}</span></span></label>`).join('')}</div></div>
        ${ui.field({ name: 'from', label: L('Valid from', 'سارية من'), type: 'date', value: '2026-12-01', required: true })}
        ${ui.field({ name: 'to', label: L('Valid until', 'سارية حتى'), type: 'date', value: '2027-11-30' })}
        ${ui.field({ name: 'poa', label: L('Power of attorney (notarised)', 'الوكالة (موثّقة)'), type: 'file', full: true })}
        </div><div style="margin-top:12px">${ui.callout(L('Sale, mortgage and transfer of title can never be delegated in BENA — they require you (and any co-owner) in person at the land registry.', 'البيع والرهن ونقل الملكية لا يمكن تفويضها في بينا — تتطلب حضورك (وأي مالك مشارك) شخصياً في دائرة تسجيل الأراضي.'), 'warn', 'shield')}</div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Submit for verification', 'إرسال للتحقق'), { kind: 'primary', type: 'submit', icon: 'shieldCheck' })}`,
    });
  };
  B.submit.owAddRep = (data) => {
    const scope = Object.keys(data).filter((k) => k.startsWith('scope_')).map((k) => k.slice(6));
    const units = Object.keys(data).filter((k) => k.startsWith('unit_')).map((k) => k.slice(5));
    const ref = B.uid('REP');
    OX.reps.unshift({ id: ref, name: data.name || '—', rel: data.rel || 'other', role: OX.relLabels[data.rel] || OX.relLabels.other, scope: scope.length ? scope : ['leasing'], limit: T('As set out in the uploaded power of attorney', 'وفق الوكالة المرفقة'), units: units.length ? units : [myUnits()[0].id], from: data.from || '2026-12-01', to: data.to || null, status: 'pendingVerification', doc: ref });
    B.success({ title: L('Representative submitted', 'تم إرسال طلب التفويض'), text: L('BENA will verify the power of attorney (usually within 2 working days). Until then the representative cannot act.', 'ستتحقق بينا من الوكالة (عادةً خلال يومي عمل). لن يتمكن الممثل من التصرف قبل ذلك.'), ref });
    B.refresh();
  };
  B.act.owRevoke = (id) => {
    const r = OX.reps.find((x) => x.id === id);
    B.confirm({ title: L('Revoke this authorisation?', 'إلغاء هذا التفويض؟'), text: L(`${repName(r)} will immediately lose access to the selected units.`, `سيفقد ${repName(r)} الوصول إلى الوحدات المحددة فوراً.`), ok: L('Revoke', 'إلغاء التفويض'), danger: true,
      onOk: () => { r.status = 'revoked'; r.to = todayIso; B.closeModal(); B.toast(L('Authorisation revoked', 'تم إلغاء التفويض')); B.refresh(); } });
  };
  B.act.owUpload = () => B.modal({
    title: L('Upload a document', 'رفع مستند'), size: 'sm', form: 'owUpload',
    body: `<div class="stack">${ui.field({ name: 'cat', label: L('Category', 'الفئة'), type: 'select', options: OX.docCats.map((c) => ({ v: c.id, l: c.label })) })}
      ${ui.field({ name: 'unit', label: L('Property', 'العقار'), type: 'select', options: [{ v: '', l: L('Not unit-specific', 'غير مرتبط بوحدة') }].concat(myUnits().map((u) => ({ v: u.id, l: `${unitName(u)} · ${bName(u.building)}` }))) })}
      ${ui.field({ name: 'title', label: L('Title', 'العنوان'), required: true, placeholder: L('e.g. Insurance policy 2027', 'مثال: بوليصة التأمين 2027') })}
      ${ui.field({ name: 'file', type: 'file' })}</div>`,
    foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Upload', 'رفع'), { kind: 'primary', type: 'submit', icon: 'upload' })}`,
  });
  B.submit.owUpload = (data) => {
    OX.docs.unshift(DOC(data.cat || 'building', data.title || 'Document', data.title || 'مستند', todayIso, { unit: data.unit || null, size: '1.0 MB', icon: 'doc' }));
    B.success({ title: L('Document uploaded', 'تم رفع المستند'), text: L('Stored privately in your BENA vault.', 'حُفظ بشكل خاص في خزنتك على بينا.') });
    B.refresh();
  };

  /* =====================================================================
   * Pages
   * ===================================================================== */
  const P = {};

  /* ---------- Home ---------- */
  P.home = () => {
    const c = counts();
    const ms = monthStats();
    const due = chargesDue();
    const dueAmt = B.sum(due, ownerChargeAmt);
    const exp = allLeases().filter((l) => l.status === 'expiring' && !OX.renewals[l.id]).sort(B.by('end'));
    const next = monthStats('2026-12');
    const nextDue = '2026-12-01';
    const od = overdueRows();
    const vacantNotListed = myUnits().filter((u) => u.status === 'vacant' && meta(u).listing?.state !== 'listed');
    const pct = (n) => (n / c.all) * 100;
    const hero = `<section class="ow-hero">
        <div class="oh-art">${B.art.facade(29, { type: 'residential', floors: 12, sky: 'navy' })}</div>
        <div><div class="oh-hi">${L('Good morning, Khaled', 'صباح الخير، خالد')}</div>
          <div class="oh-val" style="margin-top:10px">${moneyC(portfolioValue())}</div>
          <div class="oh-cap">${L('Estimated portfolio value · your share', 'القيمة التقديرية للمحفظة · حصتك')}</div></div>
        <div class="stack-sm" style="gap:10px">
          <div class="ow-occ"><i style="width:${pct(c.rented)}%;background:var(--mint)"></i><i style="width:${pct(c.own)}%;background:#7FA7C2"></i><i style="width:${pct(c.vacant)}%;background:rgba(255,255,255,.28)"></i></div>
          <div class="ow-legend"><span><i style="background:var(--mint)"></i>${L(`${c.rented} rented`, `${c.rented} مؤجّرة`)}</span><span><i style="background:#7FA7C2"></i>${L(`${c.own} owner-occupied`, `${c.own} يسكنها المالك`)}</span><span><i style="background:rgba(255,255,255,.4)"></i>${L(`${c.vacant} vacant`, `${c.vacant} شاغرة`)}</span></div>
        </div>
        <div class="oh-stats">
          <div><b>${c.all}</b><span>${L('units', 'وحدات')}</span></div>
          <div><b>${new Set(myUnits().map((u) => u.building)).size}</b><span>${L('buildings', 'مبانٍ')}</span></div>
          <div><b>${money(B.sum(allLeases(), (l) => l.rent))}</b><span>${L('monthly rent roll', 'الإيجار الشهري')}</span></div>
        </div>
      </section>`;
    const alert = exp.length ? `<div class="ow-alert"><span class="oa-i">${icon('calendarCheck')}</span><div class="grow"><b>${L('Contract expiring soon', 'عقد ينتهي قريباً')}</b>
        <div class="small">${L(`${esc(D.pname(exp[0].tenant))}'s lease on ${esc(unitName(D.unit(exp[0].unit)))} ends ${B.date(exp[0].end)} (${B.inDays(exp[0].end)}). Notice period is 60 days.`, `ينتهي عقد ${esc(D.pname(exp[0].tenant))} في ${esc(unitName(D.unit(exp[0].unit)))} بتاريخ ${B.date(exp[0].end)} (${B.inDays(exp[0].end)}). مدة الإشعار 60 يوماً.`)}</div></div>
        ${ui.btn(L('Review renewal', 'مراجعة التجديد'), { kind: 'dark', size: 'sm', go: `${R}-lease-${exp[0].id}`, icon: 'refresh' })}</div>` : '';
    const kpis = `<div class="grid g4">
      ${ui.kpi({ label: L('Rent collected · Nov', 'الإيجار المحصّل · ت٢'), value: money(ms.got), icon: 'wallet', tone: 'mint', foot: `${L(`of ${money(ms.expected)}`, `من ${money(ms.expected)}`)}`, go: `${R}-payments` })}
      ${ui.kpi({ label: L('Overdue rent', 'إيجار متأخر'), value: money(B.sum(od, (p) => p.amount)), icon: 'alertCircle', tone: od.length ? 'bad' : 'mint', foot: od.length ? L(`${od.length} payment · ${esc(D.pname(leaseById(od[0].lease).tenant))}`, `${od.length} دفعة · ${esc(D.pname(leaseById(od[0].lease).tenant))}`) : L('All up to date', 'لا متأخرات'), go: `${R}-payments` })}
      ${ui.kpi({ label: L('Service charges due', 'رسوم خدمات مستحقة'), value: money(dueAmt), icon: 'receipt', tone: 'warn', foot: L(`${due.length} items · ${new Set(due.map((x) => x.building)).size} buildings`, `${due.length} بنود · ${new Set(due.map((x) => x.building)).size} مبانٍ`), go: `${R}-charges` })}
      ${ui.kpi({ label: L('Next rent run', 'الدفعات القادمة'), value: money(next.expected), icon: 'calendar', tone: 'info', foot: `${B.dateShort(nextDue)} · ${B.inDays(nextDue)}`, go: `${R}-payments` })}
    </div>`;
    const quick = `<div class="card"><div class="quick">
      <button class="qa" ${vacantNotListed.length ? `data-act="owList" data-arg="${vacantNotListed[0].id}"` : `data-go="${R}-units"`}><span class="qi mint">${icon('megaphone')}</span>${L('List a unit', 'اعرض وحدة')}</button>
      <button class="qa" data-act="owPay" data-arg=""><span class="qi">${icon('card')}</span>${L('Pay charges', 'ادفع الرسوم')}</button>
      <button class="qa" data-go="${R}-leases"><span class="qi">${icon('contract')}</span>${L('Contracts', 'العقود')}</button>
      <button class="qa" data-go="${R}-documents"><span class="qi">${icon('folder')}</span>${L('Documents', 'المستندات')}</button>
    </div></div>`;
    const rentRows = ms.rows.filter((p) => !leaseById(p.lease).past).map((p) => { const l = leaseById(p.lease); const u = D.unit(l.unit); return ui.li({ avatar: D.pname(l.tenant), title: esc(D.pname(l.tenant)), sub: `${esc(unitName(u))} · ${p.paidOn ? L(`paid ${B.dateShort(p.paidOn)}`, `دُفع ${B.dateShort(p.paidOn)}`) : L(`due ${B.dateShort(p.due)}`, `استحق ${B.dateShort(p.due)}`)}`, end: `<b class="num">${money(p.amount)}</b>${ui.status(p.status)}`, go: `${R}-lease-${l.id}` }); });
    const upcoming = next.rows.map((p) => { const l = leaseById(p.lease); return ui.li({ icon: 'calendar', tone: 'info', title: `${esc(unitName(D.unit(l.unit)))} · ${esc(D.pname(l.tenant))}`, sub: `${B.date(p.due)} · ${B.inDays(p.due)}`, end: `<b class="num">${money(p.amount)}</b>` }); });
    const rentCard = ui.card({ title: L('Rent this month', 'إيجار هذا الشهر'), sub: L('November 2026', 'تشرين الثاني 2026'), link: { label: L('All payments', 'كل الدفعات'), go: `${R}-payments` },
      body: `${ui.progress((ms.got / ms.expected) * 100)}<div class="row between xs muted" style="margin:8px 0 14px"><span>${L(`${money(ms.got)} received`, `استُلم ${money(ms.got)}`)}</span><span>${Math.round((ms.got / ms.expected) * 100)}%</span></div>${ui.list(rentRows)}
        <div class="eyebrow" style="margin:18px 0 8px">${L('Upcoming', 'القادمة')}</div>${ui.list(upcoming)}` });
    const chargesCard = ui.card({ title: L('Service charges', 'رسوم الخدمات'), sub: L('Your share, this period', 'حصتك لهذه الفترة'), link: { label: L('Details', 'التفاصيل'), go: `${R}-charges` },
      body: `<div class="row between" style="margin-bottom:12px"><div class="ow-stat"><span class="s-v">${money(dueAmt)}</span><span class="s-l">${L('outstanding across', 'مستحقة في')} ${new Set(due.map((x) => x.building)).size} ${L('buildings', 'مبانٍ')}</span></div>${ui.btn(L('Pay', 'ادفع'), { kind: 'primary', size: 'sm', act: 'owPay', arg: '', icon: 'card' })}</div>
        ${ui.list([...new Set(due.map((x) => x.building))].map((bid) => { const its = due.filter((x) => x.building === bid); return ui.li({ icon: 'building', title: esc(bName(bid)), sub: esc(payeeOf(bid)), end: `<b class="num">${money(B.sum(its, ownerChargeAmt))}</b>${its.some((x) => x.status === 'overdue') ? ui.status('overdue') : ui.status('due')}` }); }))}` });
    const market = ui.card({ title: L('Marketplaces', 'الأسواق'), body: `<div class="ow-mk">
        <button data-go="${R}-properties"><span class="mk-i">${icon('home')}</span><b>${L('Property marketplace', 'سوق العقارات')}</b><span>${L('See how your listings compare', 'قارن عروضك بالسوق')}</span></button>
        <button data-go="${R}-services"><span class="mk-i">${icon('wrench')}</span><b>${L('Services marketplace', 'سوق الخدمات')}</b><span>${L('Painters, cleaners, technicians', 'دهانون، تنظيف، فنيون')}</span></button></div>` });
    return `<div class="stack-lg">
      ${hero}
      ${alert}
      ${kpis}
      <div class="ow-quick-wrap">${quick}</div>
      <div>${sectionTitle(L('My properties', 'عقاراتي'), `<button class="ow-link" data-go="${R}-units">${L('View all', 'عرض الكل')}${icon('chevR', 'flip')}</button>`)}
        <div class="ow-rail">${myUnits().map(propCard).join('')}</div></div>
      <div class="grid g-main">${rentCard}<div class="stack">${chargesCard}${market}</div></div>
    </div>`;
  };

  /* ---------- My properties ---------- */
  P.units = () => {
    const c = counts();
    const f = B.get('ow:uf', 'all');
    const us = myUnits().filter((u) => f === 'all' || (f === 'occupied' ? u.status === 'rented' || u.status === 'ownerOccupied' : u.status === f));
    const blds = [...new Set(us.map((u) => u.building))];
    return `${ui.pageHead({ title: L('My properties', 'عقاراتي'), sub: L('Every unit you own or co-own, grouped by building.', 'كل الوحدات التي تملكها أو تشارك في ملكيتها، مجمّعة حسب المبنى.'), actions: ui.btn(L('Property marketplace', 'سوق العقارات'), { icon: 'store', go: `${R}-properties` }) })}
      <div class="stack-lg">
      <div class="grid g4">
        ${ui.kpi({ label: L('Units', 'الوحدات'), value: c.all, icon: 'key' })}
        ${ui.kpi({ label: L('Rented', 'مؤجّرة'), value: c.rented, icon: 'users', tone: 'mint' })}
        ${ui.kpi({ label: L('Vacant', 'شاغرة'), value: c.vacant, icon: 'door', tone: 'warn', foot: L(`${myUnits().filter((u) => meta(u).listing?.state === 'listed').length} listed`, `${myUnits().filter((u) => meta(u).listing?.state === 'listed').length} معروضة`) })}
        ${ui.kpi({ label: L('Est. value (your share)', 'القيمة التقديرية (حصتك)'), value: moneyC(portfolioValue()), icon: 'trend', tone: 'info' })}
      </div>
      ${ui.chips('ow:uf', [{ id: 'all', label: L('All', 'الكل'), count: c.all }, { id: 'occupied', label: L('Occupied', 'مشغولة'), count: c.rented + c.own }, { id: 'rented', label: L('Rented', 'مؤجّرة'), count: c.rented }, { id: 'vacant', label: L('Vacant', 'شاغرة'), count: c.vacant }, { id: 'ownerOccupied', label: L('Owner-occupied', 'يسكنها المالك'), count: c.own }], f)}
      ${blds.length ? blds.map((bid) => { const b = bld(bid); const bu = us.filter((u) => u.building === bid); return `<section>
          <div class="ow-bhead"><span class="bh-thumb">${B.art.facade(seedOf(bid) + 3, { type: b.type, floors: b.floors })}</span><div class="grow"><h2 class="truncate">${esc(tx(b.name))}</h2><div class="xs muted truncate">${esc(tx(b.address))} · ${ui.idMono(b.id)}</div></div>
            ${ui.btn(L('Building', 'المبنى'), { size: 'sm', icon: 'building', go: `${R}-building-${bid}` })}</div>
          <div class="ow-rail ow-wrap">${bu.map(propCard).join('')}</div></section>`; }).join('') : ui.empty({ icon: 'key', title: L('No units match this filter', 'لا توجد وحدات مطابقة'), action: ui.btn(L('Show all', 'عرض الكل'), { act: 'set', arg: 'ow:uf=all' }) })}
      </div>`;
  };

  /* ---------- Property profile ---------- */
  P.property = (id) => {
    const u = D.unit(id);
    if (!u || u.owner !== ME) return ui.empty({ icon: 'key', title: L('Property not found', 'العقار غير موجود'), action: ui.btn(L('My properties', 'عقاراتي'), { kind: 'primary', go: `${R}-units` }) });
    B.title(unitName(u)); B.navActive('units');
    const b = bld(u.building); const m = meta(u); const l = leaseOf(u);
    const hist = OX.history[u.id] || [];
    const coOwners = (u.coOwners || []);
    const reps = repsFor(u.id);
    const st = unitStatusOf(u);
    const past = OX.pastLeases.filter((x) => x.unit === u.id);

    const hero = `<section class="card ow-uhero">
      <div class="media">${facade(u)}<span class="m-tag">${ui.status(st)}</span></div>
      <div class="uh-body">
        <div class="row-sm wrap">${ui.badge(D.unitKinds[u.kind], 'outline', u.kind === 'shop' ? 'store' : u.kind === 'office' ? 'briefcase' : 'home')}${share(u) < 100 ? ui.badge(L(`Co-owned · ${share(u)}%`, `ملكية مشتركة · ${share(u)}%`), 'navy', 'users') : ui.badge(L('Sole owner', 'مالك منفرد'), 'navy', 'key')}${ui.status('verified')}</div>
        <div><h1>${esc(unitName(u))}</h1><div class="muted small" style="margin-top:4px">${esc(tx(b.name))} · ${L('Floor', 'الطابق')} ${u.floor === 0 ? L('G', 'الأرضي') : u.floor}</div><div style="margin-top:6px">${ui.idMono(u.id)}</div></div>
        <div class="uh-facts">
          <div><b>${u.area}</b><span>${L('m² area', 'م² المساحة')}</span></div>
          <div><b>${u.beds || '—'}</b><span>${L('bedrooms', 'غرف نوم')}</span></div>
          <div><b>${moneyC(m.value * share(u) / 100)}</b><span>${L('est. value (share)', 'القيمة (حصتك)')}</span></div>
          <div><b>${B.date(m.acquired).split(' ').pop()}</b><span>${L('acquired', 'سنة التملك')}</span></div>
        </div>
        <div class="ow-actions" style="margin-top:auto">
          ${ui.btn(L('Building profile', 'ملف المبنى'), { icon: 'building', go: `${R}-building-${b.id}` })}
          ${l ? ui.btn(L('Contract', 'العقد'), { icon: 'contract', go: `${R}-lease-${l.id}` }) : ''}
          ${u.status === 'vacant' && m.listing?.state !== 'listed' ? ui.btn(L('List on marketplace', 'اعرض في السوق'), { kind: 'primary', icon: 'megaphone', act: 'owList', arg: u.id }) : ''}
          ${ui.btn(L('Request service', 'طلب خدمة'), { icon: 'wrench', go: `${R}-services` })}
        </div>
      </div></section>`;

    /* listing status */
    let listing = '';
    if (u.status === 'vacant') {
      const ls = m.listing || { state: 'notListed' };
      listing = ls.state === 'listed'
        ? ui.card({ title: L('Marketplace listing', 'العرض في السوق'), headExtra: ui.status('listed'), body: `
            <div class="grid g3" style="margin-bottom:14px"><div class="ow-stat"><span class="s-v">${B.num(ls.views)}</span><span class="s-l">${L('views', 'مشاهدة')}</span></div><div class="ow-stat"><span class="s-v">${ls.inquiries}</span><span class="s-l">${L('inquiries', 'استفسارات')}</span></div><div class="ow-stat"><span class="s-v">${ls.viewings}</span><span class="s-l">${L('viewings booked', 'معاينات')}</span></div></div>
            ${ui.kv([[L('Asking rent', 'الإيجار المطلوب'), `<b>${money(ls.ask)} / ${L('month', 'شهر')}</b>`], [L('Listed since', 'معروضة منذ'), B.date(ls.since)], [L('Available from', 'متاحة من'), B.date(ls.available)], [L('Listed by', 'عرضها'), ls.by === ME ? L('You', 'أنت') : esc(tx(D.org(ls.by).name))], [L('Listing ref.', 'رقم العرض'), ui.idMono(ls.ref)]])}`,
            foot: `<div class="ow-actions">${ui.btn(L('View on marketplace', 'عرض في السوق'), { size: 'sm', icon: 'eye', go: `${R}-properties` })}${ui.btn(L('Edit', 'تعديل'), { size: 'sm', icon: 'edit', act: 'owEditListing', arg: u.id })}${ui.btn(L('Remove listing', 'إزالة العرض'), { size: 'sm', kind: 'danger', icon: 'x', act: 'owUnlist', arg: u.id })}</div>` })
        : `<div class="ow-list-cta"><div class="row between">${ui.status('notListed')}<span class="xs muted">${L(`Vacant since ${B.date(m.vacantSince)}`, `شاغرة منذ ${B.date(m.vacantSince)}`)}</span></div>
            <h3>${L('This unit is vacant and not on the marketplace', 'هذه الوحدة شاغرة وغير معروضة في السوق')}</h3>
            <p>${L(`BENA never lists a unit without your say-so. Comparable 2-bed apartments nearby rent for about ${money(m.suggested)} / month.`, `لا تعرض بينا أي وحدة دون موافقتك. الشقق المماثلة القريبة تؤجّر بنحو ${money(m.suggested)} شهرياً.`)}</p>
            <div class="row wrap">${ui.btn(L('List on marketplace', 'اعرض في السوق'), { kind: 'primary', icon: 'megaphone', act: 'owList', arg: u.id })}${ui.btn(L('Prepare unit', 'تجهيز الوحدة'), { icon: 'sparkles', go: `${R}-services` })}</div></div>`;
    }

    /* occupancy & current lease */
    let occ;
    if (u.status === 'rented' && l) {
      const sch = schedule(l); const paid = sch.filter((p) => p.status === 'paid' || p.status === 'late');
      const elapsed = Math.max(0, Math.min(100, (B.daysBetween(l.start, todayIso) / B.daysBetween(l.start, l.end)) * 100));
      occ = ui.card({ title: L('Occupancy & current contract', 'الإشغال والعقد الحالي'), link: { label: L('Open contract', 'فتح العقد'), go: `${R}-lease-${l.id}` }, body: `
        <div class="row" style="margin-bottom:14px">${ui.avatar(D.pname(l.tenant), 'lg')}<div class="grow"><b>${personLine(l.tenant)}</b><div class="xs muted">${L('Tenant since', 'مستأجر منذ')} ${B.date(l.start)}</div></div>${ui.status(l.status)}</div>
        ${ui.kvGrid([[L('Contract', 'العقد'), ui.idMono(l.id)], [L('Monthly rent', 'الإيجار الشهري'), money(l.rent)], [L('Ends', 'ينتهي'), `${B.date(l.end)}`], [L('Deposit held', 'التأمين'), money(l.deposit)]])}
        <div style="margin-top:16px">${ui.meter(L('Term elapsed', 'المدة المنقضية'), `${Math.round(elapsed)}%`, elapsed, l.status === 'expiring' ? 'warn' : '')}</div>
        <div class="row between xs muted" style="margin-top:12px"><span>${L(`${paid.length} of ${sch.length} rent payments received`, `استلام ${paid.length} من ${sch.length} دفعات`)}</span><span>${L('Paid via Arkan', 'الدفع عبر أركان')}</span></div>` });
    } else if (u.status === 'ownerOccupied') {
      occ = ui.card({ title: L('Occupancy', 'الإشغال'), body: `<div class="row">${ui.avatar(D.pname(ME), 'lg')}<div class="grow"><b>${L('Owner-occupied — your family home', 'يسكنها المالك — منزل العائلة')}</b><div class="xs muted">${L('Registered as primary residence with the committee', 'مسجّلة كسكن رئيسي لدى اللجنة')}</div></div>${ui.status('ownerOccupied')}</div>` });
    } else {
      occ = ui.card({ title: L('Occupancy', 'الإشغال'), body: `<div class="row"><span class="li-icon warn">${icon('door')}</span><div class="grow"><b>${L('Vacant', 'شاغرة')}</b><div class="xs muted">${past.length ? L(`Last tenant: ${D.pname(past[0].tenant)} until ${B.date(past[0].end)}`, `آخر مستأجر: ${D.pname(past[0].tenant)} حتى ${B.date(past[0].end)}`) : L(`Since ${B.date(m.vacantSince)}`, `منذ ${B.date(m.vacantSince)}`)}</div></div>${ui.status(st)}</div>
        ${past.length ? `<div style="margin-top:12px">${ui.list(past.map((x) => ui.li({ icon: 'history', title: `${ui.idMono(x.id)} · ${esc(D.pname(x.tenant))}`, sub: `${B.date(x.start)} – ${B.date(x.end)} · ${money(x.rent)} / ${L('mo', 'شهر')}`, go: `${R}-lease-${x.id}` })))}</div>` : ''}` });
    }

    /* rental summary: last 6 months */
    let rental = '';
    const unitPays = allPayments().filter((p) => p.unit === u.id && p.ym >= '2026-06' && p.ym <= '2026-11');
    if (u.status === 'rented' || unitPays.length) {
      const months = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
      const vals = months.map((ym) => B.sum(unitPays.filter((p) => p.ym === ym && (p.status === 'paid' || p.status === 'late')), (p) => p.amount));
      const ytd = B.sum(allPayments().filter((p) => p.unit === u.id && p.ym.startsWith('2026') && (p.status === 'paid' || p.status === 'late')), (p) => p.amount);
      rental = ui.card({ cls: 'ow-chart', title: L('Rental summary', 'ملخص الإيجار'), sub: L('Received, last 6 months', 'المستلم، آخر 6 أشهر'), headExtra: `<div class="ow-stat" style="text-align:end"><span class="s-v">${money(ytd)}</span><span class="s-l">${L('2026 to date', '2026 حتى الآن')}</span></div>`,
        body: B.charts.bars({ labels: months.map((ym) => B.mon(+ym.slice(5) - 1)), data: months.map((ym, i) => ({ label: B.mon(+ym.slice(5) - 1), value: vals[i], color: vals[i] ? '#36D6A0' : '#F1B5B0' })), height: 140, format: (v) => B.compact(v) }) });
    }

    /* ownership history */
    const histCard = ui.card({ title: L('Ownership history', 'سجل الملكية'), sub: L('From the land registry record linked to this unit', 'من سجل دائرة الأراضي المرتبط بهذه الوحدة'), cls: 'ow-tl', body: ui.timeline(hist.map((h, i) => ({
      state: i === 0 ? 'current' : 'done', icon: i === 0 ? 'key' : h.owners[0].org ? 'building' : 'user',
      title: `${h.owners.map((o) => `${ownersLine(o)}${o.share && h.owners.length > 1 ? ` <span class="ow-share">${o.share}%</span>` : ''}`).join(' · ')} ${i === 0 ? ui.status('current') : ui.status('previous')}`,
      meta: `${B.date(h.from)} – ${h.to ? B.date(h.to) : L('present', 'حتى الآن')}`,
      body: `${tx(h.basis)}<br><button class="ow-doc" data-act="previewDoc" data-arg="${esc(h.doc)}">${icon('paperclip')}${esc(h.doc)}</button>`,
    }))) });

    /* co-owners */
    const owners = [{ p: ME, share: share(u) }].concat(coOwners.map((p) => ({ p, share: 100 - share(u) })));
    const coCard = ui.card({ title: L('Owners of record', 'المالكون المسجّلون'), body: ui.list(owners.map((o) => ui.li({ avatar: D.pname(o.p), title: `${esc(D.pname(o.p))}${o.p === ME ? ` <span class="faint xs">(${L('you', 'أنت')})</span>` : ''}`, sub: `${o.p === ME ? L('Registered owner', 'مالك مسجّل') : L('Co-owner', 'مالك مشارك')} · ${L('since', 'منذ')} ${B.date(hist[0]?.from || m.acquired)}`, end: `<span class="ow-share">${o.share}%</span>` })))
      + (coOwners.length ? `<div style="margin-top:12px">${ui.callout(L('Leases and listings on co-owned units need approval from both owners. Rana has approved the current listing.', 'تتطلب العقود والعروض على الوحدات المشتركة موافقة المالكين. وافقت رنا على العرض الحالي.'), '', 'users')}</div>` : '') });

    /* details */
    const details = ui.card({ title: L('Unit details', 'تفاصيل الوحدة'), body: ui.kv([
      [L('BENA unit ID', 'رقم الوحدة في بينا'), ui.idMono(u.id)], [L('Title deed', 'سند الملكية'), ui.idMono(m.deed)], [L('Type', 'النوع'), esc(tx(D.unitKinds[u.kind]))],
      [L('Floor', 'الطابق'), u.floor === 0 ? L('Ground', 'الأرضي') : u.floor], [L('Area', 'المساحة'), `${u.area} ${L('m²', 'م²')}`], m.parking ? [L('Parking', 'الموقف'), esc(m.parking)] : null,
      [L('Aspect', 'الإطلالة'), esc(tx(m.view))], [L('Finish', 'التشطيب'), esc(tx(m.finish))], [L('Parcel', 'القطعة'), `${L('Basin', 'حوض')} ${b.parcel.basin} · ${L('Parcel', 'قطعة')} ${b.parcel.parcel}`],
    ]) });

    /* service charges */
    const ch = OX.charges.filter((c) => c.unit === u.id);
    const chCard = ui.card({ title: L('Service charges', 'رسوم الخدمات'), sub: esc(payeeOf(u.building)), link: { label: L('All charges', 'كل الرسوم'), go: `${R}-charges` },
      body: ch.length ? ui.list(ch.map((c) => ui.li({ icon: c.levy ? 'vote' : 'receipt', tone: c.status === 'overdue' ? 'bad' : c.status === 'paid' ? 'mint' : '', title: c.levy ? esc(tx(c.label)) : L(`Monthly charge · ${ymLabel(c.period)}`, `الرسوم الشهرية · ${ymLabel(c.period)}`), sub: c.share < 100 ? L(`Your ${c.share}% of ${money(c.amount)}`, `حصتك ${c.share}% من ${money(c.amount)}`) : c.status === 'tenantPays' ? L('Tenant pays under clause 7', 'يدفعها المستأجر وفق البند 7') : (c.paidOn ? L(`Paid ${B.date(c.paidOn)}`, `دُفعت ${B.date(c.paidOn)}`) : L('Owner pays', 'يدفعها المالك')), end: `<b class="num">${money(ownerChargeAmt(c))}</b>${ui.status(c.status)}` })))
        : ui.empty({ icon: 'receipt', title: L('No charges', 'لا توجد رسوم') }) });

    /* documents */
    const docs = OX.docs.filter((d) => d.unit === u.id);
    const docCard = ui.card({ title: L('Supporting documents', 'المستندات الداعمة'), link: { label: L('All documents', 'كل المستندات'), go: `${R}-documents` }, body: docs.length ? ui.list(docs.map((d) => ui.doc({ ...d, name: tx(d.name), type: 'PDF', tone: d.cat === 'deeds' ? 'navy' : '' }))) : ui.empty({ icon: 'folder', title: L('No documents yet', 'لا توجد مستندات') }) });

    const repCard = ui.card({ title: L('Who can act for this unit', 'من يحق له التصرف بهذه الوحدة'), link: { label: L('Manage', 'إدارة'), go: `${R}-reps` },
      body: reps.length ? ui.list(reps.map((r) => ui.li({ icon: r.org ? 'briefcase' : 'user', tone: r.org ? 'navy' : 'info', title: esc(repName(r)), sub: r.scope.map((s) => tx(OX.scopes[s])).join(' · '), end: ui.status(r.status) }))) : `<p class="small muted">${L('Only you. Add a representative to let someone act on your behalf.', 'أنت فقط. أضف ممثلاً للسماح لشخص بالتصرف نيابةً عنك.')}</p>` });

    const left = [u.status === 'vacant' ? listing : '', occ, rental, histCard, chCard].filter(Boolean).join('');
    const right = [details, coCard, repCard, docCard].join('');
    return `<div class="stack-lg">
      <div>${ui.btn(L('My properties', 'عقاراتي'), { kind: 'text', icon: 'chevL', iconCls: 'flip', go: `${R}-units` })}</div>
      ${hero}
      <div class="grid g-main"><div class="stack">${left}</div><div class="stack">${right}</div></div></div>`;
  };

  /* ---------- Rental contracts ---------- */
  P.leases = () => {
    const f = B.get('ow:lf', 'current');
    const cur = allLeases();
    const rows = f === 'past' ? OX.pastLeases : f === 'all' ? cur.concat(OX.pastLeases) : cur;
    const nextEnd = cur.slice().sort(B.by('end'))[0];
    const avgMonths = Math.round(B.sum(cur, (l) => B.daysBetween(todayIso, l.end)) / cur.length / 30.4);
    return `${ui.pageHead({ title: L('Rental contracts', 'عقود الإيجار'), sub: L('Active and past leases on your units, with renewals and amendments.', 'العقود السارية والسابقة على وحداتك، مع التجديدات والتعديلات.') })}
      <div class="stack-lg">
      <div class="grid g3">
        ${ui.kpi({ label: L('Active contracts', 'عقود سارية'), value: cur.length, icon: 'contract', tone: 'mint', foot: L(`${money(B.sum(cur, (l) => l.rent))} / month`, `${money(B.sum(cur, (l) => l.rent))} شهرياً`) })}
        ${ui.kpi({ label: L('Next expiry', 'أقرب انتهاء'), value: B.dateShort(nextEnd.end), icon: 'calendarCheck', tone: 'warn', foot: `${esc(unitName(D.unit(nextEnd.unit)))} · ${B.inDays(nextEnd.end)}`, go: `${R}-lease-${nextEnd.id}` })}
        ${ui.kpi({ label: L('Avg. remaining term', 'متوسط المدة المتبقية'), value: avgMonths, unit: L('months', 'أشهر'), icon: 'clock', tone: 'info' })}
      </div>
      <div class="row between wrap">${ui.seg('ow:lf', [{ id: 'current', label: L('Current', 'الحالية') }, { id: 'past', label: L('Past', 'السابقة') }, { id: 'all', label: L('All', 'الكل') }], f)}</div>
      ${ui.table({ id: 'owLeases', rows, rowGo: (l) => `${R}-lease-${l.id}`, cols: [
        { key: 'id', label: L('Contract', 'العقد'), m: 'title', render: (l) => `<div class="cell-main">${ui.avatar(D.pname(l.tenant), 'sm')}<div><b>${esc(D.pname(l.tenant))}</b><small>${ui.idMono(l.id)}</small></div></div>`, mRender: (l) => esc(D.pname(l.tenant)) },
        { key: 'unit', label: L('Property', 'العقار'), m: 'sub', render: (l) => `${esc(unitName(D.unit(l.unit)))} <span class="faint">· ${esc(bName(l.building))}</span>` },
        { key: 'rent', label: L('Monthly rent', 'الإيجار الشهري'), align: 'end', m: 'end', sort: true, render: (l) => `<b class="num">${money(l.rent)}</b>` },
        { key: 'start', label: L('Term', 'المدة'), m: 'meta', sort: true, render: (l) => `${B.dateShort(l.start)} ${B.date(l.start).split(' ').pop()} – ${B.date(l.end)}` },
        { key: 'end', label: L('Expires', 'ينتهي'), sort: true, m: 'meta', render: (l) => (l.past ? `<span class="faint">${L('Ended', 'انتهى')}</span>` : `<span class="${l.status === 'expiring' ? 'mint-ink strong' : ''}">${B.inDays(l.end)}</span>`) },
        { key: 'status', label: L('Status', 'الحالة'), m: 'meta', render: (l) => (OX.renewals[l.id] ? ui.status('offerSent') : ui.status(l.status)) },
      ] })}
      </div>`;
  };

  /* ---------- Contract detail ---------- */
  P.lease = (id) => {
    const l = leaseById(id);
    if (!l || l.owner !== ME) return ui.empty({ icon: 'contract', title: L('Contract not found', 'العقد غير موجود'), action: ui.btn(L('Rental contracts', 'عقود الإيجار'), { kind: 'primary', go: `${R}-leases` }) });
    B.title(l.id); B.navActive('leases');
    const u = D.unit(l.unit); const b = bld(l.building); const x = OX.leaseX[l.id] || { history: [], notice: 60 };
    const tn = D.person(l.tenant);
    const sch = schedule(l);
    const totalDays = B.daysBetween(l.start, l.end);
    const elapsed = Math.max(0, Math.min(100, (B.daysBetween(l.start, todayIso) / totalDays) * 100));
    const rn = OX.renewals[l.id];
    const paid = sch.filter((p) => p.status === 'paid' || p.status === 'late');
    const head = `<section class="card"><div class="ow-lhead">
        <div class="stack-sm" style="gap:10px">
          <div class="row-sm wrap">${ui.idMono(l.id)}${rn ? ui.status('offerSent') : ui.status(l.status)}${ui.badge(tx(x.use || ''), 'outline')}</div>
          <h1 style="font-size:24px">${esc(unitName(u))} <span class="faint" style="font-weight:600">· ${esc(tx(b.name))}</span></h1>
          <div class="lh-rent">${money(l.rent)}<small> / ${L('month', 'شهر')}</small></div>
        </div>
        <div class="ow-term">${B.charts.ring(elapsed, { size: 84, color: l.status === 'expiring' ? '#F2B35A' : '#36D6A0', label: l.past ? L('Ended', 'انتهى') : `${Math.max(0, Math.round(B.daysFromToday(l.end)))}${L('d', 'ي')}` })}
          <div><div class="xs faint">${l.past ? L('Ended on', 'انتهى في') : L('Expires', 'ينتهي')}</div><b>${B.date(l.end)}</b><div class="xs muted">${l.past ? '' : B.inDays(l.end)}</div></div></div>
      </div>
      ${rn ? `<div style="margin-top:16px">${ui.callout(L(`Renewal offer sent ${B.date(rn.sent)}: ${money(rn.rent)} / month for ${rn.term} months from ${B.date(rn.start)}. Waiting for ${esc(tn.name.en)}.`, `أُرسل عرض التجديد في ${B.date(rn.sent)}: ${money(rn.rent)} شهرياً لمدة ${rn.term} شهراً من ${B.date(rn.start)}. بانتظار رد ${esc(tn.name.ar)}.`), '', 'send')}</div>` : l.status === 'expiring' ? `<div style="margin-top:16px">${ui.callout(L(`The ${x.notice}-day notice window opens on ${B.date(new Date(new Date(l.end + 'T12:00:00').getTime() - x.notice * 86400000))}. Send a renewal offer now to give ${esc(tn.name.en)} time to decide.`, `تبدأ فترة الإشعار (${x.notice} يوماً) في ${B.date(new Date(new Date(l.end + 'T12:00:00').getTime() - x.notice * 86400000))}. أرسل عرض التجديد الآن لإعطاء ${esc(tn.name.ar)} وقتاً للقرار.`), 'warn', 'clock')}</div>` : ''}
      <div class="ow-actions" style="margin-top:18px">
        ${l.past ? '' : ui.btn(rn ? L('Revise offer', 'تعديل العرض') : L('Renew', 'تجديد'), { kind: 'primary', icon: 'refresh', act: 'owRenew', arg: l.id })}
        ${l.past ? '' : ui.btn(L('Amend', 'تعديل'), { icon: 'edit', act: 'owAmend', arg: l.id })}
        ${ui.btn(L('Message tenant', 'مراسلة المستأجر'), { icon: 'chat', act: 'owMessage', arg: l.tenant })}
        ${ui.btn(L('Contract PDF', 'ملف العقد'), { icon: 'download', act: 'previewDoc', arg: `${l.id}.pdf` })}
      </div></section>`;

    const schTable = ui.table({ id: `owSch${l.id}`, rows: sch.slice().reverse(), pageSize: 8, cols: [
      { key: 'ym', label: L('Month', 'الشهر'), m: 'title', render: (p) => `<b>${ymLabel(p.ym)}</b>` },
      { key: 'due', label: L('Due date', 'تاريخ الاستحقاق'), m: 'sub', render: (p) => `<span class="nowrap">${B.date(p.due)}</span>` },
      { key: 'amount', label: L('Amount', 'المبلغ'), align: 'end', m: 'end', render: (p) => `<b class="num">${money(p.amount)}</b>` },
      { key: 'status', label: L('Status', 'الحالة'), m: 'meta', render: (p) => ui.status(p.status) },
      { key: 'paidOn', label: L('Paid', 'الدفع'), m: 'meta', render: (p) => (p.paidOn ? `<span class="nowrap">${B.dateShort(p.paidOn)}</span><span class="faint xs ow-meth"> · ${esc(tx(p.method))}</span>` : p.status === 'overdue' ? `<button class="btn btn-soft btn-sm" data-act="owRemind" data-arg="${p.id}">${icon('bell')}${L('Remind', 'تذكير')}</button>` : '<span class="faint">—</span>') },
    ] });
    const odSum = B.sum(sch.filter((p) => p.status === 'overdue'), (p) => p.amount);
    const schCard = `<div>${sectionTitle(L('Payment schedule', 'جدول الدفعات'), `<span class="xs muted">${L(`${paid.length}/${sch.length} paid`, `${paid.length}/${sch.length} مدفوعة`)}${odSum ? ` · <span style="color:var(--bad)">${money(odSum)} ${L('overdue', 'متأخر')}</span>` : ''}</span>`)}${schTable}</div>`;

    const tenantCard = ui.card({ title: L('Tenant', 'المستأجر'), body: `<div class="row" style="margin-bottom:12px">${ui.avatar(tn.name, 'lg')}<div class="grow"><b>${esc(tx(tn.name))}</b><div class="xs muted">${L('Identity verified on BENA', 'هوية موثّقة على بينا')}</div></div>${ui.status('verified')}</div>
      ${ui.kv([[L('Phone', 'الهاتف'), `<span class="ltr">${esc(tn.phone || '+970 59 000 0000')}</span>`], [L('Email', 'البريد'), `<span class="ltr">${esc(tn.email || '—')}</span>`], [L('Payment record', 'سجل الدفع'), odSum ? `<span style="color:var(--bad)">${L('1 late payment', 'دفعة متأخرة واحدة')}</span>` : `<span class="mint-ink">${L('Always on time', 'منتظم دائماً')}</span>`]])}`,
      foot: ui.btn(L('Message', 'رسالة'), { size: 'sm', icon: 'chat', act: 'owMessage', arg: l.tenant, block: true }) });
    const terms = ui.card({ title: L('Contract terms', 'شروط العقد'), body: ui.kv([
      [L('Start', 'البداية'), B.date(l.start)], [L('End', 'النهاية'), B.date(l.end)], [L('Rent due', 'موعد الدفع'), L(`Day ${l.payDay || 1} of each month`, `اليوم ${l.payDay || 1} من كل شهر`)],
      [L('Deposit', 'التأمين'), money(l.deposit)], [L('Notice period', 'مدة الإشعار'), L(`${x.notice} days`, `${x.notice} يوماً`)], [L('Rent escalation', 'زيادة الإيجار'), esc(tx(x.escalation))],
      [L('Service charges', 'رسوم الخدمات'), x.charges === 'tenant' ? L('Paid by tenant', 'يدفعها المستأجر') : L('Included — paid by owner', 'مشمولة — يدفعها المالك')], [L('Managed by', 'الإدارة'), l.manager ? esc(tx(D.org(l.manager).name)) : L('You', 'أنت')],
    ]) });
    const kindIcon = { signed: 'edit', start: 'play', renew: 'refresh', amend: 'edit', end: 'flag', pending: 'clock' };
    const histItems = (rn ? [{ date: rn.sent, kind: 'pending', title: T('Renewal offer sent', 'تم إرسال عرض التجديد'), body: T(`${money(rn.rent)} / month · ${rn.term} months`, `${money(rn.rent)} شهرياً · ${rn.term} شهراً`) }] : []).concat(x.history);
    const histCard = ui.card({ title: L('Renewals & amendments', 'التجديدات والتعديلات'), body: histItems.length ? ui.timeline(histItems.map((h, i) => ({ state: h.kind === 'pending' ? 'current' : 'done', icon: kindIcon[h.kind] || 'check', title: tx(h.title), meta: B.date(h.date), body: esc(tx(h.body)) }))) : ui.empty({ icon: 'history', title: L('No changes yet', 'لا تغييرات بعد') }) });
    return `<div class="stack-lg">
      <div>${ui.btn(L('Rental contracts', 'عقود الإيجار'), { kind: 'text', icon: 'chevL', iconCls: 'flip', go: `${R}-leases` })}</div>
      ${head}
      <div class="grid g-main"><div class="stack">${schCard}${histCard}</div><div class="stack">${tenantCard}${terms}${ui.card({ title: L('Property', 'العقار'), body: ui.list([ui.li({ lead: `<span class="bh-thumb" style="width:44px;height:44px;border-radius:12px;overflow:hidden;flex:none;display:block">${facade(u)}</span>`, title: esc(unitName(u)), sub: esc(tx(b.name)), go: `${R}-property-${u.id}` })]) })}</div></div></div>`;
  };

  /* ---------- Rent payments ---------- */
  P.payments = () => {
    const f = B.get('ow:pf', 'all');
    const uf = B.get('ow:pu', 'all');
    const months = []; for (let i = 11; i >= 0; i--) { const d = new Date(2026, 10 - i, 1); months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); }
    const pays = allPayments();
    const units = [...new Set(allLeases().map((l) => l.unit))];
    const colors = ['#142B3B', '#36D6A0', '#7FA7C2'];
    const series = units.map((uid, i) => ({ name: unitName(D.unit(uid)), color: colors[i % 3], values: months.map((ym) => B.sum(pays.filter((p) => p.unit === uid && p.ym === ym && (p.status === 'paid' || p.status === 'late')), (p) => p.amount)) }));
    const ytd = B.sum(pays.filter((p) => p.ym.startsWith('2026') && p.ym <= '2026-11' && (p.status === 'paid' || p.status === 'late')), (p) => p.amount);
    const exp = B.sum(pays.filter((p) => p.ym.startsWith('2026') && p.ym <= '2026-11'), (p) => p.amount);
    const od = overdueRows();
    const ms = monthStats();
    let rows = pays.filter((p) => p.ym >= '2025-12' && p.ym <= '2027-02');
    if (f !== 'all') rows = rows.filter((p) => (f === 'paid' ? p.status === 'paid' || p.status === 'late' : f === 'upcoming' ? p.status === 'upcoming' || p.status === 'due' : p.status === f));
    if (uf !== 'all') rows = rows.filter((p) => p.unit === uf);
    rows.sort(B.by('due', -1));
    return `${ui.pageHead({ title: L('Rent payments', 'دفعات الإيجار'), sub: L('Rent received and expected across your rented units.', 'الإيجارات المستلمة والمتوقعة في وحداتك المؤجّرة.'), actions: ui.btn(L('Export statement', 'تصدير كشف'), { icon: 'download', act: 'previewDoc', arg: L('Rent statement 2026', 'كشف الإيجارات 2026') }) })}
      <div class="stack-lg">
      <div class="grid g4">
        ${ui.kpi({ label: L('Received in 2026', 'المستلم في 2026'), value: moneyC(ytd), icon: 'banknote', tone: 'mint', foot: L('Jan – Nov', 'ك٢ – ت٢') })}
        ${ui.kpi({ label: L('This month', 'هذا الشهر'), value: money(ms.got), icon: 'wallet', tone: 'info', foot: L(`of ${money(ms.expected)}`, `من ${money(ms.expected)}`) })}
        ${ui.kpi({ label: L('Overdue', 'متأخر'), value: money(B.sum(od, (p) => p.amount)), icon: 'alertCircle', tone: od.length ? 'bad' : 'mint', foot: L(`${od.length} payment(s)`, `${od.length} دفعة`) })}
        ${ui.kpi({ label: L('Collection rate', 'نسبة التحصيل'), value: B.pct((ytd / exp) * 100, 1), icon: 'percent', tone: 'violet', foot: L('2026 to date', '2026 حتى الآن') })}
      </div>
      ${od.length ? `<div class="list boxed card pad-0">${od.map((p) => { const l = leaseById(p.lease); return `<div class="li"><span class="li-icon bad">${icon('alertCircle')}</span><div class="li-body"><div class="li-title">${L(`${esc(D.pname(l.tenant))} — ${ymLabel(p.ym)} rent overdue`, `${esc(D.pname(l.tenant))} — إيجار ${ymLabel(p.ym)} متأخر`)}</div><div class="li-sub">${esc(unitName(D.unit(p.unit)))} · ${money(p.amount)} · ${B.inDays(p.due)}</div></div><div class="row-sm">${ui.btn(L('Remind', 'تذكير'), { size: 'sm', kind: 'soft', icon: 'bell', act: 'owRemind', arg: p.id })}${ui.btn('', { size: 'sm', icon: 'check', act: 'owReceived', arg: p.id, title: L('Mark received', 'تأكيد الاستلام') })}</div></div>`; }).join('')}</div>` : ''}
      ${ui.card({ cls: 'ow-chart', title: L('Rent received by month', 'الإيجار المستلم شهرياً'), sub: L('Last 12 months, by unit', 'آخر 12 شهراً، حسب الوحدة'), body: B.charts.bars({ labels: months.map((ym) => B.mon(+ym.slice(5) - 1)), series, height: 210, format: (v) => B.compact(v) }) })}
      <div class="toolbar" style="margin-bottom:0">${ui.chips('ow:pf', [{ id: 'all', label: L('All', 'الكل') }, { id: 'paid', label: L('Received', 'مستلمة') }, { id: 'overdue', label: L('Overdue', 'متأخرة') }, { id: 'upcoming', label: L('Upcoming', 'قادمة') }], f)}
        ${ui.select('ow:pu', [{ v: 'all', l: L('All units', 'كل الوحدات') }].concat(units.map((uid) => ({ v: uid, l: unitName(D.unit(uid)) }))), { label: L('Unit', 'الوحدة') })}</div>
      ${ui.table({ id: 'owPays', rows, pageSize: 12, empty: { icon: 'wallet', title: L('No payments match', 'لا دفعات مطابقة'), text: L('Try another filter.', 'جرّب فلتراً آخر.') }, cols: [
        { key: 'ym', label: L('Month', 'الشهر'), m: 'title', render: (p) => `<b>${ymLabel(p.ym)}</b>` },
        { key: 'unit', label: L('Unit · tenant', 'الوحدة · المستأجر'), m: 'sub', render: (p) => `${esc(unitName(D.unit(p.unit)))} <span class="faint">· ${esc(D.pname(leaseById(p.lease).tenant))}</span>` },
        { key: 'due', label: L('Due', 'الاستحقاق'), m: 'meta', render: (p) => B.date(p.due) },
        { key: 'status', label: L('Status', 'الحالة'), m: 'meta', render: (p) => ui.status(p.status) },
        { key: 'paidOn', label: L('Received', 'الاستلام'), m: 'meta', render: (p) => (p.paidOn ? B.date(p.paidOn) : p.status === 'overdue' ? `<button class="btn btn-soft btn-sm" data-act="owRemind" data-arg="${p.id}">${icon('bell')}${L('Remind', 'تذكير')}</button>` : '<span class="faint">—</span>') },
        { key: 'amount', label: L('Amount', 'المبلغ'), align: 'end', m: 'end', render: (p) => `<b class="num">${money(p.amount)}</b>` },
      ] })}
      </div>`;
  };

  /* ---------- Building service charges ---------- */
  P.charges = () => {
    const due = chargesDue();
    const dueAmt = B.sum(due, ownerChargeAmt);
    const blds = [...new Set(myUnits().map((u) => u.building))];
    const paidYtd = B.sum(OX.charges.filter((c) => c.status === 'paid'), ownerChargeAmt);
    const cards = blds.map((bid) => {
      const b = bld(bid); const its = OX.charges.filter((c) => c.building === bid);
      const d = its.filter((c) => c.status === 'due' || c.status === 'overdue');
      const units = myUnits().filter((u) => u.building === bid);
      const monthly = B.sum(units, (u) => { const c = its.find((x) => x.unit === u.id && !x.levy); return c ? c.amount : 0; });
      const myShare = B.sum(units, (u) => { const c = its.find((x) => x.unit === u.id && !x.levy); return c ? (c.status === 'tenantPays' ? 0 : ownerChargeAmt(c)) : 0; });
      const levies = its.filter((c) => c.levy);
      return ui.card({ cls: 'ow-chg', body: `<div class="cg-top"><span class="bh-thumb" style="width:48px;height:48px;border-radius:14px;overflow:hidden;flex:none;display:block">${B.art.facade(seedOf(bid) + 3, { type: b.type, floors: b.floors })}</span>
          <div class="grow"><h3 class="truncate" style="font-size:16px">${esc(tx(b.name))}</h3><div class="xs muted truncate">${L('Paid to', 'تُدفع إلى')} ${esc(payeeOf(bid))}</div></div>
          ${d.length ? (d.some((c) => c.status === 'overdue') ? ui.status('overdue') : ui.status('due')) : ui.status('paid')}</div>
        <div class="ow-trio">
          <div class="ow-stat"><span class="s-v" style="font-size:19px">${money(monthly)}</span><span class="s-l">${L('monthly charge', 'الرسوم الشهرية')}</span></div>
          <div class="ow-stat"><span class="s-v" style="font-size:19px">${money(myShare)}</span><span class="s-l">${L('your share / mo', 'حصتك شهرياً')}</span></div>
          <div class="ow-stat"><span class="s-v" style="font-size:19px;${d.length ? 'color:var(--warn)' : ''}">${money(B.sum(d, ownerChargeAmt))}</span><span class="s-l">${L('due now', 'مستحق الآن')}</span></div>
        </div>
        ${ui.list(units.map((u) => { const c = its.find((x) => x.unit === u.id && !x.levy); return ui.li({ icon: 'key', title: esc(unitName(u)), sub: c ? (c.status === 'tenantPays' ? L('Tenant pays under the lease', 'يدفعها المستأجر وفق العقد') : c.share < 100 ? L(`Your ${c.share}% share · co-owned with Rana`, `حصتك ${c.share}% · ملكية مشتركة مع رنا`) : L('100% owner', 'المالك 100%')) : '—', end: c ? ui.status(c.status) : '' }); }))}
        ${levies.length ? ui.callout(L(`<b>Proposed levy:</b> ${money(B.sum(levies, ownerChargeAmt))} for elevator modernisation — on the agenda of the 4 Dec general assembly.`, `<b>مساهمة مقترحة:</b> ${money(B.sum(levies, ownerChargeAmt))} لتحديث المصاعد — على جدول أعمال الهيئة العامة في 4 ك١.`), '', 'vote') : ''}
        <div class="row wrap">${d.length ? ui.btn(L(`Pay ${money(B.sum(d, ownerChargeAmt))}`, `ادفع ${money(B.sum(d, ownerChargeAmt))}`), { kind: 'primary', size: 'sm', icon: 'card', act: 'owPay', arg: bid }) : ''}${ui.btn(L('Building profile', 'ملف المبنى'), { size: 'sm', icon: 'building', go: `${R}-building-${bid}` })}</div>` });
    });
    const hist = OX.charges.filter((c) => c.status === 'paid').sort(B.by('paidOn', -1));
    return `${ui.pageHead({ title: L('Building service charges', 'رسوم خدمات المباني'), sub: L('Your share of common-area costs, paid to each building’s committee or manager.', 'حصتك من تكاليف المناطق المشتركة، تُدفع للجنة أو إدارة كل مبنى.') })}
      <div class="stack-lg">
      <section class="banner"><div class="b-art">${B.art.banner()}</div>
        <div><div class="eyebrow" style="color:var(--mint)">${L('Outstanding now', 'المستحق الآن')}</div><h2 class="num" style="font-size:32px;margin-top:6px">${money(dueAmt)}</h2><p>${L(`${due.length} charges across ${new Set(due.map((c) => c.building)).size} buildings · ${money(paidYtd)} paid recently`, `${due.length} رسوم في ${new Set(due.map((c) => c.building)).size} مبانٍ · ${money(paidYtd)} مدفوعة مؤخراً`)}</p></div>
        ${due.length ? ui.btn(L('Pay all', 'ادفع الكل'), { kind: 'primary', size: 'lg', icon: 'card', act: 'owPay', arg: '' }) : ui.status('paid')}</section>
      <div class="grid g2">${cards.join('')}</div>
      <div>${sectionTitle(L('Payment history', 'سجل الدفعات'))}
      ${ui.table({ id: 'owChHist', rows: hist, cols: [
        { key: 'period', label: L('Period', 'الفترة'), m: 'title', render: (c) => `<b>${ymLabel(c.period)}</b>` },
        { key: 'unit', label: L('Unit', 'الوحدة'), m: 'sub', render: (c) => `${esc(unitName(D.unit(c.unit)))} <span class="faint">· ${esc(bName(c.building))}</span>` },
        { key: 'paidOn', label: L('Paid on', 'تاريخ الدفع'), m: 'meta', render: (c) => B.date(c.paidOn) },
        { key: 'id', label: L('Receipt', 'الإيصال'), m: 'meta', render: (c) => `<button class="btn btn-text btn-sm" data-act="previewDoc" data-arg="${c.id}">${icon('receipt')}${ui.idMono(c.id)}</button>` },
        { key: 'amount', label: L('Your share', 'حصتك'), align: 'end', m: 'end', render: (c) => `<b class="num">${money(ownerChargeAmt(c))}</b>` },
      ] })}</div>
      </div>`;
  };

  /* ---------- Documents ---------- */
  P.documents = () => {
    const q = B.get('ow:dq', '');
    const cat = B.get('ow:dc', 'all');
    const docs = OX.docs.filter((d) => (cat === 'all' || d.cat === cat) && B.match(q, d.name, d.unit && unitName(D.unit(d.unit))));
    const groups = OX.docCats.filter((c) => docs.some((d) => d.cat === c.id));
    return `${ui.pageHead({ title: L('Documents', 'المستندات'), sub: L('Title deeds, contracts, receipts and authorisations — in one private vault.', 'سندات الملكية والعقود والإيصالات والتفويضات — في خزنة خاصة واحدة.'), actions: ui.btn(L('Upload', 'رفع'), { kind: 'primary', icon: 'upload', act: 'owUpload' }) })}
      <div class="stack-lg">
      <div class="toolbar" style="margin-bottom:0">${ui.search('ow:dq', L('Search documents…', 'ابحث في المستندات…'))}</div>
      ${ui.chips('ow:dc', [{ id: 'all', label: L('All', 'الكل'), count: OX.docs.length }].concat(OX.docCats.map((c) => ({ id: c.id, label: c.label, icon: c.icon, count: OX.docs.filter((d) => d.cat === c.id).length }))), cat)}
      ${groups.length ? `<div class="grid g2">${groups.map((g) => ui.card({ title: tx(g.label), sub: L(`${docs.filter((d) => d.cat === g.id).length} files`, `${docs.filter((d) => d.cat === g.id).length} ملفات`), body: ui.list(docs.filter((d) => d.cat === g.id).map((d) => ui.doc({ name: tx(d.name), icon: d.icon, tone: g.id === 'deeds' ? 'navy' : g.id === 'receipts' ? 'mint' : '', date: d.date, size: d.size, sub: `PDF · ${d.size} · ${B.date(d.date)}${d.unit ? ` · ${esc(unitName(D.unit(d.unit)))}` : ''}` }))) })).join('')}</div>`
        : `<div class="card">${ui.empty({ icon: 'search', title: L('No documents found', 'لم يتم العثور على مستندات'), text: L('Try another search or category.', 'جرّب بحثاً أو فئة أخرى.') })}</div>`}
      ${ui.demoNote(L('Documents are sample placeholders. In production, title deeds are pulled from the land registry and verified by BENA.', 'المستندات نماذج توضيحية. في النسخة الفعلية، تُجلب سندات الملكية من دائرة تسجيل الأراضي وتتحقق منها بينا.'))}
      </div>`;
  };

  /* ---------- Authorised representatives ---------- */
  P.reps = () => {
    const card = (r) => {
      const ended = r.status === 'expired' || r.status === 'revoked';
      return ui.card({ cls: 'ow-rep', body: `<div class="rp-top">${r.org ? `<span class="rp-org">${icon('briefcase')}</span>` : ui.avatar(repName(r) || r.name, 'lg')}
          <div class="grow"><b style="font-size:15px">${esc(repName(r) || r.name)}</b><div class="xs muted">${esc(tx(r.role))}</div></div>${ui.status(r.status)}</div>
        <div class="ow-tags">${r.scope.map((s) => `<span class="ow-tag">${tx(OX.scopes[s])}</span>`).join('')}</div>
        <div class="small muted">${icon('shield', 'ow-i14')}${esc(tx(r.limit))}</div>
        <div class="stack-sm">${r.units.map((uid) => { const u = D.unit(uid); return `<button class="row-sm small" data-go="${R}-property-${uid}" style="text-align:start">${icon('key', 'ow-i14')}<span>${esc(unitName(u))} <span class="faint">· ${esc(bName(u.building))}</span></span></button>`; }).join('')}</div>
        <div class="ow-dates"><span>${L('From', 'من')} <b>${B.date(r.from)}</b></span><span>${L('Until', 'حتى')} <b>${r.to ? B.date(r.to) : L('Open-ended', 'غير محددة')}</b></span></div>
        <div class="row wrap">${ui.btn(L('Authorisation', 'سند التفويض'), { size: 'sm', icon: 'doc', act: 'previewDoc', arg: r.doc })}${ended || r.rel === 'coowner' ? '' : ui.btn(L('Revoke', 'إلغاء'), { size: 'sm', kind: 'danger', icon: 'x', act: 'owRevoke', arg: r.id })}</div>` });
    };
    const active = OX.reps.filter((r) => r.status !== 'expired' && r.status !== 'revoked');
    const ended = OX.reps.filter((r) => r.status === 'expired' || r.status === 'revoked');
    return `${ui.pageHead({ title: L('Authorised representatives', 'الممثلون المفوّضون'), sub: L('People and companies allowed to act on your behalf — with exactly what they can do, where, and until when.', 'الأشخاص والشركات المخوّلون بالتصرف نيابةً عنك — بما يمكنهم فعله وأين وحتى متى.'), actions: ui.btn(L('Add representative', 'إضافة ممثل'), { kind: 'primary', icon: 'userPlus', act: 'owAddRep' }) })}
      <div class="stack-lg">
      ${ui.callout(L('Every authorisation is backed by a notarised power of attorney or co-ownership agreement, verified by BENA. Representatives see only the units and actions you grant.', 'كل تفويض مدعوم بوكالة موثّقة أو اتفاقية ملكية مشتركة تتحقق منها بينا. لا يرى الممثلون إلا الوحدات والصلاحيات التي تمنحها.'), 'navy', 'shieldCheck')}
      <div>${sectionTitle(L('Acting for you', 'يتصرفون نيابةً عنك'), `<span class="xs muted">${active.length} ${L('active or pending', 'سارية أو قيد التحقق')}</span>`)}<div class="grid g2">${active.map(card).join('')}</div></div>
      <div>${sectionTitle(L('You act for', 'تتصرف نيابةً عن'))}${ui.card({ body: ui.list(OX.proxies.map((x) => ui.li({ avatar: D.pname(x.p), title: esc(D.pname(x.p)), sub: `${esc(tx(x.scope))} · ${esc(unitName(D.unit(x.unit)))}`, end: `<span class="xs faint">${B.dateShort(x.from)} – ${B.dateShort(x.to)}</span>${ui.status('active')}` }))) })}</div>
      ${ended.length ? `<div>${sectionTitle(L('Ended authorisations', 'تفويضات منتهية'))}<div class="grid g2">${ended.map(card).join('')}</div></div>` : ''}
      </div>`;
  };

  /* =====================================================================
   * Role registration
   * ===================================================================== */
  B.role({
    id: R, icon: 'key', nav: 'tabs',
    name: T('Property Owner', 'مالك العقار'), short: T('Owner', 'المالك'),
    org: T('Khaled Mansour · 6 units', 'خالد منصور · 6 وحدات'), tag: T('Owner app', 'تطبيق المالك'),
    desc: T('Portfolio, tenants, rent, service charges, title documents and listings — in your pocket.', 'المحفظة والمستأجرون والإيجار ورسوم الخدمات وسندات الملكية والعروض — في جيبك.'),
    personaTitle: T('Khaled Mansour · owner of 6 units', 'خالد منصور · مالك 6 وحدات'),
    home: 'home',
    menu: [
      { group: T('Portfolio', 'المحفظة') },
      { id: 'home', label: T('Home', 'الرئيسية'), icon: 'home', tab: true },
      { id: 'units', label: T('My properties', 'عقاراتي'), tabLabel: T('Properties', 'العقارات'), icon: 'key', tab: true, match: ['property', 'building'] },
      { id: 'leases', label: T('Rental contracts', 'عقود الإيجار'), tabLabel: T('Contracts', 'العقود'), icon: 'contract', tab: true, match: ['lease'] },
      { id: 'payments', label: T('Rent payments', 'دفعات الإيجار'), tabLabel: T('Rent', 'الإيجار'), icon: 'wallet', tab: true },
      { id: 'charges', label: T('Service charges', 'رسوم الخدمات'), icon: 'receipt' },
      { group: T('Records', 'السجلات') },
      { id: 'documents', label: T('Documents', 'المستندات'), icon: 'folder' },
      { id: 'reps', label: T('Representatives', 'الممثلون المفوّضون'), icon: 'userCheck' },
      { group: T('Marketplaces', 'الأسواق') },
      { id: 'properties', label: T('Property marketplace', 'سوق العقارات'), icon: 'store' },
      { id: 'services', label: T('Services marketplace', 'سوق الخدمات'), icon: 'wrench' },
    ],
    pages: P,
    notifications: () => [
      { icon: 'alertCircle', tone: 'bad', title: L('Rent overdue — Office 702', 'إيجار متأخر — مكتب 702'), sub: L('Karim Asfour · November · ₪5,600', 'كريم عصفور · تشرين الثاني · 5,600 ₪'), when: L('24 d', '24 ي'), go: `${R}-payments` },
      { icon: 'calendarCheck', tone: 'warn', title: L('Lease L-2026-0803 expires in 67 days', 'العقد L-2026-0803 ينتهي خلال 67 يوماً'), sub: L('Send Lina Haddad a renewal offer', 'أرسل عرض تجديد إلى لينا حداد'), when: L('Today', 'اليوم'), go: `${R}-lease-L-2026-0803` },
      { icon: 'megaphone', title: L('2 viewings booked — Apartment 604', 'حجز معاينتين — شقة 604'), sub: L('Arkan · 29 Nov and 1 Dec', 'أركان · 29 ت٢ و1 ك١'), when: L('Yesterday', 'أمس'), go: `${R}-property-BN-RAM-00266-604` },
      { icon: 'receipt', tone: 'info', title: L('Service charges due', 'رسوم خدمات مستحقة'), sub: L('4 buildings · your share ₪980', '4 مبانٍ · حصتك 980 ₪'), when: L('3 d', '3 ي'), go: `${R}-charges` },
      { icon: 'userCheck', tone: 'violet', title: L('Power of attorney under review', 'الوكالة قيد المراجعة'), sub: L('Firas Awwad · Shop G02', 'فراس عواد · محل G02'), when: L('5 d', '5 ي'), go: `${R}-reps` },
    ],
  });
})();
