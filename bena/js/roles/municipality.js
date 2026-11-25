/*
 * BENA — Municipality portal (sample tenant: Ramallah Municipality).
 * Persona: Eng. Maha Awad, GIS & Building Registry Unit.
 * All requests, figures and records here are fictional demonstration data.
 * Pages: home (dashboard), explorer (GIS), registry, requests (+ request detail),
 * analytics, data (data sources & sync).
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon } = B;
  const ui = B.ui;
  const D = B.data;
  const R = 'municipality';

  /* ---------------- statuses used by this role ---------------- */
  Object.assign(B.statuses, {
    synced: { en: 'Synced', ar: 'متزامن', tone: 'ok', icon: 'check' },
    syncing: { en: 'Syncing', ar: 'قيد المزامنة', tone: 'info', icon: 'refresh' },
    delayed: { en: 'Delayed', ar: 'متأخر', tone: 'warn', icon: 'clock' },
    syncError: { en: 'Sync error', ar: 'خطأ في المزامنة', tone: 'bad', icon: 'alertCircle' },
    paused: { en: 'Paused', ar: 'متوقف مؤقتاً', tone: 'neutral' },
  });

  /* ---------------- helpers ---------------- */
  const hash = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  /** Deterministic data-quality flags for a building (demo). */
  const qf = (b) => {
    const h = hash(b.id);
    return {
      dup: h % 43 === 0,
      geom: h % 57 === 3,
      noParcel: b.source === 'independent' && b.verification !== 'verified' && h % 3 === 0,
      noUnits: b.source === 'independent' && h % 4 === 1,
    };
  };
  const months = () => Array.from({ length: 12 }, (_, i) => B.mon((11 + i) % 12));
  const dName = (id) => tx(D.district(id).name);
  const typeIcon = (t) => (D.types[t] && D.types[t].icon) || 'building';
  const sw = (c) => `<i class="mu-sw" style="background:${c}"></i>`;
  const demoTag = () => `<span class="mu-tag" title="${esc(tx(D.municipality.note))}">${L('Sample tenant', 'جهة تجريبية')}</span>`;
  const head = (o) => ui.pageHead({ ...o, eyebrow: `${tx(D.municipality.name)} · ${L('GIS & Building Registry Unit', 'وحدة نظم المعلومات الجغرافية وسجل المباني')}${demoTag()}` });
  const pct = (a, b) => (b ? (a / b) * 100 : 0);
  const upd = (b) => (b.updated > '2026-11-25' ? '2026-11-25' : b.updated); // data has a few post-today dates
  const units = (n) => `<span class="num">${B.num(n)}</span><span class="mu-m-only"> ${L('units', 'وحدة')}</span>`;

  /* ---------------- fictional registration requests ---------------- */
  const pickB = (f, n = 0) => D.buildings.filter(f)[n] || D.buildings[n];
  const nearest = (bid, f) => {
    const a = D.building(bid); let best = null, bd = 1e9;
    D.buildings.forEach((b) => { if (b.id === bid || !f(b)) return; const d = Math.hypot(b.c[0] - a.c[0], b.c[1] - a.c[1]); if (d < bd) { bd = d; best = b; } });
    return best || D.buildings[0];
  };
  const bNew1 = pickB((b) => b.source === 'independent' && b.verification === 'unverified' && b.district === 'batnalhawa');
  const bNew2 = pickB((b) => b.source === 'independent' && b.verification === 'pendingVerification' && b.district === 'oldcity' && !b.key);
  const bNew3 = pickB((b) => b.source === 'independent' && b.verification === 'pendingVerification' && b.district === 'tireh' && !b.key);
  const bMiss1 = pickB((b) => b.district === 'batnalhawa' && b.source === 'gis', 3);
  const bMiss2 = pickB((b) => b.district === 'tireh' && b.source === 'gis' && b.type === 'residential', 5);
  const bDupA = D.building('BN-RAM-00266');
  const bDupB = nearest('BN-RAM-00266', (b) => b.source === 'independent') ;
  const bDup2A = pickB((b) => b.district === 'manara' && b.source === 'gis' && !b.key, 6);
  const bDup2B = nearest(bDup2A.id, (b) => b.source === 'gis' && !b.key);
  const bCorr3 = pickB((b) => b.district === 'irsal' && b.source === 'gis' && b.type === 'commercial' && !b.key);
  const T = (en, ar) => ({ en, ar });

  const RT = {
    newReg: { en: 'New building registration', ar: 'تسجيل مبنى جديد', short: T('New registration', 'تسجيل جديد'), icon: 'plus', tone: 'mint' },
    missing: { en: 'Missing building report', ar: 'بلاغ عن مبنى غير مُدرج', short: T('Missing building', 'مبنى غير مُدرج'), icon: 'flag', tone: 'warn' },
    correction: { en: 'Information correction', ar: 'تصحيح معلومات', short: T('Correction', 'تصحيح'), icon: 'edit', tone: 'info' },
    duplicate: { en: 'Duplicate report', ar: 'بلاغ تكرار سجل', short: T('Duplicate', 'تكرار'), icon: 'layers', tone: 'violet' },
    link: { en: 'Link to municipal reference', ar: 'ربط بمرجع بلدي', short: T('Link to GIS', 'ربط بـ GIS'), icon: 'link', tone: 'navy' },
  };
  const CH = {
    app: T('BENA app — owner', 'تطبيق بينا — مالك'),
    committee: T('Committee portal', 'بوابة اللجنة'),
    manager: T('Property manager portal', 'بوابة مدير العقار'),
    field: T('Municipal field survey', 'مسح ميداني بلدي'),
    citizen: T('Citizen report', 'بلاغ مواطن'),
  };
  const parcelTxt = (p) => (p ? L(`Basin ${p.basin} · Parcel ${p.parcel}`, `حوض ${p.basin} · قطعة ${p.parcel}`) : null);
  const docs = {
    deed: T('Ownership deed (Tabu extract)', 'سند الملكية (إخراج قيد طابو)'),
    permit: T('Building permit', 'رخصة البناء'),
    plan: T('Site plan & survey', 'مخطط الموقع والمساحة'),
    photos: T('Site photos', 'صور الموقع'),
    id: T('Applicant ID', 'هوية مقدّم الطلب'),
    letter: T('Committee letter', 'كتاب اللجنة'),
    poa: T('Power of attorney', 'وكالة'),
    asbuilt: T('As-built drawings', 'مخططات التنفيذ'),
  };
  const dd = (key, date, type = 'PDF', size = '1.4 MB', icn = 'doc') => ({ name: docs[key], date, type, size, icon: icn });

  const REQ = [
    { id: 'RR-2026-0418', type: 'newReg', status: 'new', priority: 'medium', building: bNew1.id, by: 'p_ahmad', channel: 'app', date: '2026-11-24',
      title: T(`New residential building — ${tx(bNew1.name)}`, `مبنى سكني جديد — ${bNew1.name.ar}`),
      note: T('Completed in 2025; owner requests a municipal reference so units can be listed and leased.', 'اكتمل البناء عام 2025؛ يطلب المالك مرجعاً بلدياً ليتمكن من عرض الوحدات وتأجيرها.'),
      fields: () => [[L('Address', 'العنوان'), tx(bNew1.address), null], [L('Building type', 'نوع المبنى'), D.typeLabel('residential'), null], [L('Floors', 'الطوابق'), '4', null], [L('Units', 'الوحدات'), '8', null], [L('Parcel', 'القطعة'), parcelTxt(bNew1.parcel), null], [L('Building permit', 'رخصة البناء'), 'RM-BP-2024-0912', null], [L('Footprint', 'المسقط'), L('Drawn in app · 214 m²', 'مرسوم في التطبيق · 214 م²'), null]],
      docs: [dd('deed', '2026-11-24'), dd('permit', '2026-11-24'), dd('plan', '2026-11-24', 'DWG', '3.8 MB', 'map'), dd('photos', '2026-11-24', 'JPG ×6', '9.1 MB', 'image')],
      checks: [['ok', T('Parcel exists in land registry layer', 'القطعة موجودة في طبقة تسجيل الأراضي')], ['ok', T('No overlap with existing footprints', 'لا تداخل مع مساقط قائمة')], ['warn', T('Permit year differs from completion year', 'سنة الرخصة تختلف عن سنة الإنجاز')]] },
    { id: 'RR-2026-0417', type: 'correction', status: 'underReview', priority: 'medium', building: 'BN-RAM-00391', by: 'p_majd', channel: 'app', date: '2026-11-23',
      title: T('Unit count correction — Rukab Corner Building', 'تصحيح عدد الوحدات — عمارة زاوية ركب'),
      note: T('Ground-floor shop G02 was split into two shops in 2024 (permit attached).', 'تم تقسيم المحل G02 في الطابق الأرضي إلى محلين عام 2024 (الرخصة مرفقة).'),
      fields: () => { const b = D.building('BN-RAM-00391'); return [[L('Units', 'الوحدات'), '15', String(b.units)], [L('Ground-floor shops', 'محلات الطابق الأرضي'), '3', '2'], [L('Floors', 'الطوابق'), String(b.floors), String(b.floors)], [L('Building type', 'نوع المبنى'), D.typeLabel(b.type), D.typeLabel(b.type)], [L('Parcel', 'القطعة'), parcelTxt(b.parcel), parcelTxt(b.parcel)]]; },
      docs: [dd('permit', '2026-11-23'), dd('asbuilt', '2026-11-23', 'PDF', '5.2 MB', 'map'), dd('photos', '2026-11-23', 'JPG ×3', '4.0 MB', 'image')],
      checks: [['ok', T('Owner verified in BENA', 'المالك موثّق في بينا')], ['ok', T('Alteration permit found: RM-AP-2024-0177', 'تم العثور على رخصة تعديل: RM-AP-2024-0177')]] },
    { id: 'RR-2026-0416', type: 'link', status: 'new', priority: 'high', building: 'BN-RAM-00529', by: 'p_issa', channel: 'app', date: '2026-11-22',
      title: T('Link Old Town Stone House to municipal GIS record', 'ربط البيت الحجري في البلدة القديمة بسجل GIS البلدي'),
      note: T('Independent record created by the owner. A matching heritage footprint exists in the municipal layer.', 'سجل مستقل أنشأه المالك. يوجد مسقط تراثي مطابق في الطبقة البلدية.'),
      gis: 'RM-GIS-41877', ref: 'RM/OC/1998/0529',
      fields: () => { const b = D.building('BN-RAM-00529'); return [[L('Municipal GIS ID', 'رقم GIS البلدي'), 'RM-GIS-41877', null], [L('Municipal reference', 'المرجع البلدي'), 'RM/OC/1998/0529', null], [L('Address', 'العنوان'), tx(b.address), L('7 Market Ln., Old City', '7 زقاق السوق، البلدة القديمة')], [L('Building type', 'نوع المبنى'), D.typeLabel(b.type), D.typeLabel('heritage')], [L('Parcel', 'القطعة'), parcelTxt(b.parcel), parcelTxt(b.parcel)], [L('Footprint match', 'تطابق المسقط'), '94%', '94%']]; },
      docs: [dd('deed', '2026-11-22'), dd('photos', '2026-11-22', 'JPG ×4', '6.3 MB', 'image')],
      checks: [['ok', T('Footprint overlap 94% with RM-GIS-41877', 'تطابق المسقط 94% مع RM-GIS-41877')], ['ok', T('Parcel matches', 'القطعة مطابقة')], ['warn', T('Heritage layer — conservation unit must be notified', 'طبقة تراثية — يجب إبلاغ وحدة الحفاظ')]] },
    { id: 'RR-2026-0415', type: 'duplicate', status: 'underReview', priority: 'high', building: bDupB.id, other: bDupA.id, by: 'p_zaid', channel: 'committee', date: '2026-11-21',
      title: T('Possible duplicate of Masyoun Heights', 'تكرار محتمل لمرتفعات الماصيون'),
      note: T('Committee reports that an independent record appears to describe the same building.', 'تفيد اللجنة بأن سجلاً مستقلاً يبدو أنه يصف المبنى نفسه.'),
      cols: () => [L('Reported record', 'السجل المُبلّغ عنه'), L('Existing municipal record', 'السجل البلدي القائم')],
      fields: () => [[L('BENA ID', 'رقم بينا'), bDupB.id, bDupA.id], [L('Source', 'المصدر'), L('Independent', 'مستقل'), L('Municipal GIS', 'نظم المعلومات البلدية')], [L('Address', 'العنوان'), tx(bDupB.address), tx(bDupA.address)], [L('Parcel', 'القطعة'), parcelTxt({ basin: 12, parcel: 140 }), parcelTxt(bDupA.parcel)], [L('Units', 'الوحدات'), String(bDupB.units), String(bDupA.units)], [L('Footprint overlap', 'تداخل المسقط'), '71%', '71%']],
      docs: [dd('letter', '2026-11-21'), dd('photos', '2026-11-21', 'JPG ×2', '2.2 MB', 'image')],
      checks: [['warn', T('Footprints overlap by 71%', 'تتداخل المساقط بنسبة 71%')], ['warn', T('Same parcel number on both records', 'رقم القطعة نفسه في السجلين')]] },
    { id: 'RR-2026-0414', type: 'missing', status: 'needsInfo', priority: 'medium', building: bMiss1.id, by: 'p_hani', channel: 'citizen', date: '2026-11-20',
      title: T('Building on Valley Rd. not shown on the map', 'مبنى على طريق الوادي غير ظاهر على الخريطة'),
      note: T('Three-storey building behind the reported footprint; access from the terrace stairs.', 'مبنى من ثلاثة طوابق خلف المسقط المُبلّغ عنه؛ الدخول من درج المصاطب.'),
      fields: () => [[L('Reported location', 'الموقع المُبلّغ عنه'), L(`Behind ${tx(bMiss1.name)}`, `خلف ${bMiss1.name.ar}`), L('No footprint at this point', 'لا يوجد مسقط في هذه النقطة')], [L('Estimated floors', 'الطوابق التقديرية'), '3', null], [L('Building type', 'نوع المبنى'), D.typeLabel('residential'), null], [L('Year built (approx.)', 'سنة البناء (تقريباً)'), '2019', null]],
      docs: [dd('photos', '2026-11-20', 'JPG ×2', '3.1 MB', 'image')],
      checks: [['warn', T('No parcel supplied', 'لم تُرفق بيانات القطعة')], ['ok', T('Location inside municipal boundary', 'الموقع ضمن حدود البلدية')]],
      extra: [{ date: '2026-11-21', title: T('Additional information requested', 'طُلبت معلومات إضافية'), body: T('Please share the parcel number or the owner\'s contact.', 'يرجى تزويدنا برقم القطعة أو بيانات التواصل مع المالك.'), who: 'p_maha' }] },
    { id: 'RR-2026-0413', type: 'newReg', status: 'underReview', priority: 'low', building: bNew2.id, by: 'p_layla', channel: 'app', date: '2026-11-19',
      title: T(`Register stone house — ${tx(bNew2.name)}`, `تسجيل بيت حجري — ${bNew2.name.ar}`),
      note: T('Older building with no digital record; owner holds an Ottoman-era deed copy.', 'مبنى قديم دون سجل رقمي؛ يحتفظ المالك بنسخة من سند قديم.'),
      fields: () => [[L('Address', 'العنوان'), tx(bNew2.address), null], [L('Building type', 'نوع المبنى'), D.typeLabel(bNew2.type), null], [L('Floors', 'الطوابق'), String(bNew2.floors), null], [L('Units', 'الوحدات'), String(bNew2.units), null], [L('Parcel', 'القطعة'), parcelTxt(bNew2.parcel), null]],
      docs: [dd('deed', '2026-11-19'), dd('id', '2026-11-19', 'JPG', '0.6 MB', 'image'), dd('photos', '2026-11-19', 'JPG ×5', '7.4 MB', 'image')],
      checks: [['ok', T('Parcel exists', 'القطعة موجودة')], ['warn', T('Located in heritage zone', 'يقع ضمن منطقة تراثية')]] },
    { id: 'RR-2026-0412', type: 'correction', status: 'approved', priority: 'low', building: 'BN-RAM-00142', by: 'p_samer', channel: 'committee', date: '2026-11-12', decided: '2026-11-14',
      title: T('Parking spaces — Al-Masyoun Residence Tower', 'مواقف السيارات — برج الماصيون السكني'),
      note: T('Four extra spaces added in the basement after the 2025 refit.', 'أضيفت أربعة مواقف في الطابق السفلي بعد تأهيل 2025.'),
      fields: () => [[L('Parking spaces', 'مواقف السيارات'), '64', '60'], [L('Elevators', 'المصاعد'), '2', '2'], [L('Units', 'الوحدات'), String(D.building('BN-RAM-00142').units), String(D.building('BN-RAM-00142').units)]],
      docs: [dd('letter', '2026-11-12'), dd('asbuilt', '2026-11-12', 'PDF', '2.9 MB', 'map')],
      checks: [['ok', T('Requested by registered owners\' association', 'مقدّم من جمعية مالكين مسجّلة')]],
      extra: [{ date: '2026-11-14', title: T('Approved — record updated', 'تمت الموافقة — تم تحديث السجل'), body: T('Parking count updated in the municipal record.', 'تم تحديث عدد المواقف في السجل البلدي.'), who: 'p_maha', done: true }] },
    { id: 'RR-2026-0411', type: 'link', status: 'needsInfo', priority: 'medium', building: 'BN-RAM-00744', by: 'p_rania', channel: 'manager', date: '2026-11-12',
      title: T('Link Batn Al-Hawa Villas to municipal reference', 'ربط فلل بطن الهوا بمرجع بلدي'),
      note: T('Registered independently by the developer in 2022; GIS footprint added in the 2026 survey.', 'سُجّلت بشكل مستقل من المطوّر عام 2022؛ أضيف المسقط في مسح 2026.'),
      gis: 'RM-GIS-52210', ref: 'RM/BH/2022/0744',
      fields: () => { const b = D.building('BN-RAM-00744'); return [[L('Municipal GIS ID', 'رقم GIS البلدي'), 'RM-GIS-52210', null], [L('Address', 'العنوان'), tx(b.address), tx(b.address)], [L('Units', 'الوحدات'), String(b.units), '5'], [L('Parcel', 'القطعة'), parcelTxt(b.parcel), parcelTxt(b.parcel)], [L('Footprint match', 'تطابق المسقط'), '88%', '88%']]; },
      docs: [dd('poa', '2026-11-12'), dd('permit', '2026-11-12')],
      checks: [['ok', T('Footprint overlap 88%', 'تطابق المسقط 88%')], ['warn', T('Unit count differs (6 vs 5)', 'عدد الوحدات مختلف (6 مقابل 5)')]],
      extra: [{ date: '2026-11-16', title: T('Additional information requested', 'طُلبت معلومات إضافية'), body: T('Please confirm whether the annex is a separate unit.', 'يرجى تأكيد ما إذا كان الملحق وحدة مستقلة.'), who: 'p_maha' }] },
    { id: 'RR-2026-0410', type: 'duplicate', status: 'rejected', priority: 'low', building: bDup2A.id, other: bDup2B.id, by: 'p_hala', channel: 'citizen', date: '2026-11-06', decided: '2026-11-08',
      title: T('Two records on one plot in Al-Manara', 'سجلان على قطعة واحدة في المنارة'),
      cols: () => [L('Reported record', 'السجل المُبلّغ عنه'), L('Other record', 'السجل الآخر')],
      note: T('Reporter believed the two footprints are the same building.', 'اعتقد المُبلّغ أن المسقطين لمبنى واحد.'),
      fields: () => [[L('BENA ID', 'رقم بينا'), bDup2A.id, bDup2B.id], [L('Address', 'العنوان'), tx(bDup2A.address), tx(bDup2B.address)], [L('Parcel', 'القطعة'), parcelTxt(bDup2A.parcel), parcelTxt(bDup2B.parcel)], [L('Footprint overlap', 'تداخل المسقط'), '0%', '0%']],
      docs: [dd('photos', '2026-11-06', 'JPG', '1.1 MB', 'image')],
      checks: [['ok', T('No footprint overlap', 'لا يوجد تداخل في المساقط')], ['ok', T('Different parcels', 'قطع مختلفة')]],
      extra: [{ date: '2026-11-08', title: T('Rejected — not a duplicate', 'مرفوض — ليس تكراراً'), body: T('Adjacent buildings on separate parcels.', 'مبنيان متجاوران على قطعتين منفصلتين.'), who: 'p_maha', done: true }] },
    { id: 'RR-2026-0409', type: 'missing', status: 'approved', priority: 'low', building: bMiss2.id, by: 'p_firas', channel: 'field', date: '2026-11-03', decided: '2026-11-05',
      title: T('New annex not in GIS — Al-Tireh', 'ملحق جديد غير مُدرج في GIS — الطيرة'),
      note: T('Captured during the autumn field survey.', 'تم رصده خلال المسح الميداني الخريفي.'),
      fields: () => [[L('Reported location', 'الموقع المُبلّغ عنه'), L(`Next to ${tx(bMiss2.name)}`, `بجانب ${bMiss2.name.ar}`), L('No footprint', 'لا يوجد مسقط')], [L('Floors', 'الطوابق'), '2', null], [L('Building type', 'نوع المبنى'), D.typeLabel('residential'), null]],
      docs: [dd('plan', '2026-11-03', 'GeoJSON', '0.2 MB', 'map'), dd('photos', '2026-11-03', 'JPG ×3', '4.4 MB', 'image')],
      checks: [['ok', T('Survey GPS accuracy ±0.8 m', 'دقة GPS للمسح ±0.8 م')]],
      extra: [{ date: '2026-11-05', title: T('Approved — footprint added to layer', 'تمت الموافقة — أضيف المسقط إلى الطبقة'), who: 'p_maha', done: true }] },
    { id: 'RR-2026-0408', type: 'correction', status: 'new', priority: 'low', building: bCorr3.id, by: 'p_karim', channel: 'app', date: '2026-11-24',
      title: T(`Building use change — ${tx(bCorr3.name)}`, `تغيير استخدام المبنى — ${bCorr3.name.ar}`),
      note: T('Upper floors converted from retail to offices.', 'تحويل الطوابق العليا من محلات إلى مكاتب.'),
      fields: () => [[L('Building type', 'نوع المبنى'), D.typeLabel('office'), D.typeLabel(bCorr3.type)], [L('Floors', 'الطوابق'), String(bCorr3.floors), String(bCorr3.floors)], [L('Units', 'الوحدات'), String(bCorr3.units), String(bCorr3.units)]],
      docs: [dd('permit', '2026-11-24')],
      checks: [['warn', T('Change-of-use permit not yet linked', 'رخصة تغيير الاستخدام غير مرتبطة بعد')]] },
    { id: 'RR-2026-0407', type: 'newReg', status: 'approved', priority: 'low', building: bNew3.id, by: 'p_nadia', channel: 'app', date: '2026-10-29', decided: '2026-11-02',
      title: T(`Register family building — ${tx(bNew3.name)}`, `تسجيل مبنى عائلي — ${bNew3.name.ar}`),
      fields: () => [[L('Address', 'العنوان'), tx(bNew3.address), null], [L('Floors', 'الطوابق'), String(bNew3.floors), null], [L('Units', 'الوحدات'), String(bNew3.units), null], [L('Parcel', 'القطعة'), parcelTxt(bNew3.parcel), null]],
      docs: [dd('deed', '2026-10-29'), dd('permit', '2026-10-29'), dd('photos', '2026-10-29', 'JPG ×4', '5.0 MB', 'image')],
      checks: [['ok', T('Parcel exists', 'القطعة موجودة')], ['ok', T('No overlap', 'لا تداخل')]],
      extra: [{ date: '2026-11-02', title: T('Approved — field verification scheduled', 'تمت الموافقة — جُدول التحقق الميداني'), who: 'p_maha', done: true }] },
  ];
  const OPEN = ['new', 'underReview', 'needsInfo'];
  const openCount = () => REQ.filter((q) => OPEN.includes(q.status)).length;
  const reqOf = (id) => REQ.find((q) => q.id === id);
  B.data.muniRequests = REQ; // exposed for other screens (read-only use)

  /* ---------------- styles ---------------- */
  B.css(`
  .mu-tag { display: inline-flex; align-items: center; margin-inline-start: 8px; padding: 2px 8px; border-radius: 99px; background: var(--warn-bg); color: var(--warn); font-size: 10.5px; letter-spacing: .04em; vertical-align: 1px; cursor: help; }
  .mu-sw { width: 12px; height: 12px; border-radius: 4px; display: inline-block; flex: none; }
  .mu-m-only { display: none; }
  @media (max-width: 767px) { .mu-m-only { display: inline; } }
  .mu-hero { background: var(--navy); border-radius: var(--r-lg); color: var(--navy-ink); padding: 26px 28px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.7fr); gap: 28px; align-items: center; }
  .mu-hero .eyebrow { color: var(--navy-ink); opacity: .8; }
  .mu-big { font-family: var(--font-display); font-size: 48px; font-weight: 700; color: #fff; line-height: 1; letter-spacing: -.03em; margin-top: 10px; font-variant-numeric: tabular-nums; }
  .mu-big small { font-size: 14px; font-weight: 500; color: var(--navy-ink); letter-spacing: 0; margin-inline-start: 8px; }
  .mu-split { display: flex; height: 8px; border-radius: 99px; overflow: hidden; background: rgba(255,255,255,.08); margin-top: 18px; gap: 2px; }
  .mu-split i { display: block; height: 100%; }
  .mu-split-l { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 10px; font-size: 12px; }
  .mu-split-l span { display: inline-flex; align-items: center; gap: 6px; }
  .mu-split-l i { width: 8px; height: 8px; border-radius: 50%; }
  .mu-hstats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .mu-hstats > div { padding: 6px 20px; border-inline-start: 1px solid rgba(255,255,255,.1); min-width: 0; }
  .mu-hstats b { display: block; font-family: var(--font-display); font-size: 26px; color: #fff; font-variant-numeric: tabular-nums; line-height: 1.15; margin-top: 6px; }
  .mu-hstats span { font-size: 12.5px; display: block; }
  .mu-hstats small { display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; color: var(--mint); margin-top: 6px; }
  .mu-hstats small svg { width: 12px; height: 12px; }
  @media (max-width: 1180px) { .mu-hero { grid-template-columns: 1fr; gap: 22px; } .mu-hstats > div:first-child { border-inline-start: 0; padding-inline-start: 0; } }
  @media (max-width: 640px) {
    .mu-hero { padding: 20px; border-radius: 18px; }
    .mu-big { font-size: 40px; }
    .mu-hstats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 0; padding-top: 18px; border-top: 1px solid rgba(255,255,255,.1); }
    .mu-hstats > div { padding: 0 14px; }
    .mu-hstats > div:nth-child(odd) { border-inline-start: 0; padding-inline-start: 0; }
    .mu-hstats b { font-size: 22px; }
  }
  .mu-cov { display: flex; flex-direction: column; }
  .mu-cov-row { display: grid; grid-template-columns: minmax(130px, 1.1fr) minmax(0, 2fr) 64px; gap: 16px; align-items: center; padding: 11px 0; border-bottom: 1px solid var(--line-2); text-align: start; width: 100%; }
  .mu-cov-row:last-child { border-bottom: 0; }
  .mu-cov-row:hover b.n { color: var(--mint-ink); }
  .mu-cov-row b.n { display: block; font-size: 14px; font-weight: 600; transition: color .15s; }
  .mu-cov-row small { display: block; font-size: 12px; color: var(--text-3); font-variant-numeric: tabular-nums; }
  .mu-cov-row .p { text-align: end; font-weight: 700; font-variant-numeric: tabular-nums; font-size: 14px; }
  .mu-track { height: 10px; border-radius: 99px; background: var(--line-2); display: flex; overflow: hidden; gap: 2px; }
  .mu-track i { display: block; height: 100%; }
  @media (max-width: 640px) { .mu-cov-row { grid-template-columns: minmax(0, 1fr) 56px; gap: 6px 12px; } .mu-cov-row .mu-track { grid-column: 1 / -1; order: 3; } }
  .mu-dq { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .mu-dq-flags { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 18px; }
  .mu-flag { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 14px; background: var(--surface-2); border: 1px solid var(--line-2); text-align: start; width: 100%; transition: border-color .2s; }
  .mu-flag:hover { border-color: #CFDAD6; }
  .mu-flag b { font-family: var(--font-display); font-size: 20px; font-variant-numeric: tabular-nums; display: block; line-height: 1.1; }
  .mu-flag span { font-size: 12px; color: var(--text-2); display: block; }
  .mu-flag .fi { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; flex: none; background: var(--warn-bg); color: var(--warn); }
  .mu-flag .fi.v { background: var(--violet-bg); color: var(--violet); }
  .mu-flag .fi svg { width: 17px; height: 17px; }
  .mu-flag > svg { width: 16px; height: 16px; color: var(--text-3); flex: none; }
  @media (max-width: 767px) { .mu .bars .col .tip, .mu .line-chart .hz .tip, .mx .bars .col .tip { display: none; } }
  
  .mu-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .mu-strip > div { padding: 16px 20px; border-inline-start: 1px solid var(--line-2); min-width: 0; }
  .mu-strip > div:first-child { border-inline-start: 0; }
  .mu-strip b { display: block; font-family: var(--font-display); font-size: 24px; font-variant-numeric: tabular-nums; line-height: 1.15; }
  .mu-strip span { display: block; font-size: 12.5px; color: var(--text-2); }
  .mu-strip small { display: block; font-size: 11.5px; color: var(--text-3); margin-top: 2px; }
  @media (max-width: 640px) { .mu-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); } .mu-strip > div { padding: 14px 16px; } .mu-strip > div:nth-child(3) { border-inline-start: 0; } .mu-strip > div:nth-child(n+3) { border-top: 1px solid var(--line-2); } .mu-strip b { font-size: 20px; } }
  .mu-2l small { display: block; font-size: 11.5px; color: var(--text-3); margin-top: 2px; white-space: nowrap; }
  .mu-ti { width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center; background: var(--line-2); color: var(--navy); flex: none; }
  .mu-ti svg { width: 16px; height: 16px; }
  .mu-ti.ind { background: var(--violet-bg); color: var(--violet); }
  .mu-chipx { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 6px 0 12px; border-radius: 99px; background: var(--navy); color: #fff; font-size: 12.5px; font-weight: 600; }
  html[dir="rtl"] .mu-chipx { padding: 0 12px 0 6px; }
  .mu-chipx button { width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.14); color: #fff; }
  .mu-chipx svg { width: 12px; height: 12px; }
  .mu-count { font-size: 13px; color: var(--text-2); }

  /* Explorer */
  .mx .page-head { padding-bottom: 14px; }
  .mx-bar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
  .mx-bar .input-icon { flex: 1 1 260px; min-width: 0; }
  .mx-sel { display: flex; gap: 8px; flex-wrap: wrap; }
  .mx-sel .select { width: auto; min-width: 150px; height: 44px; }
  .mx-ftoggle { display: none !important; }
  .mx .explorer .map-shell { --map-h: calc(100dvh - 236px); min-height: 500px; }
  .mx .explorer-panel { max-height: calc(100dvh - 236px); min-height: 500px; }
  @media (min-width: 768px) { .mx .explorer-panel { display: flex; flex-direction: column; } .mx-panel > * { flex-shrink: 0; } .mx-panel > .mx-res { flex: 1 1 auto; flex-shrink: 1; } }
  .mx-panel > .btn, .mx-mresults > .btn { align-self: flex-start; }
  .mx-mresults { display: none; }
  .mx-ph { display: flex; align-items: flex-start; gap: 10px; }
  .mx-id { display: flex; gap: 14px; align-items: center; margin-top: 10px; }
  .mx-art { width: 92px; aspect-ratio: 4 / 3; border-radius: 12px; overflow: hidden; background: var(--line-2); flex: none; }
  .mx-art svg { width: 100%; height: 100%; }
  .mx-title { font-size: 18px; line-height: 1.25; }
  .mx-addr { display: flex; align-items: flex-start; gap: 6px; font-size: 13px; color: var(--text-2); margin-top: 6px; }
  .mx-addr svg { width: 15px; height: 15px; flex: none; margin-top: 2px; color: var(--mint-ink); }
  .mx-panel .kv-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 16px; padding: 16px 0; border-top: 1px solid var(--line-2); border-bottom: 1px solid var(--line-2); margin-top: 14px; }
  .mx-acts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px; }
  .mx-acts .full { grid-column: 1 / -1; }
  .mx-brk { display: flex; flex-direction: column; gap: 2px; }
  .mx-brk button { display: grid; grid-template-columns: 12px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 7px 8px; border-radius: 9px; font-size: 13px; text-align: start; width: 100%; }
  .mx-brk button:hover { background: var(--hover); }
  .mx-brk button.on { background: var(--mint-50); }
  .mx-brk button b { font-variant-numeric: tabular-nums; font-size: 13px; }
  .mx-brk .bar { grid-column: 2 / -1; height: 3px; border-radius: 3px; background: var(--line-2); overflow: hidden; margin-top: -2px; }
  .mx-brk .bar i { display: block; height: 100%; }
  .mx-res { overflow-y: auto; margin-inline: -20px; padding-inline: 20px; flex: 1; min-height: 120px; }
  .mx-res .li { padding: 10px 0; }
  .mx-res .li:first-child { padding-top: 10px; }
  .mx-sum { display: flex; align-items: baseline; gap: 8px; }
  .mx-sum b { font-family: var(--font-display); font-size: 26px; font-variant-numeric: tabular-nums; }
  .mx-lead { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; flex: none; border: 1px solid rgba(20,43,59,.12); }
  .mx-lead svg { width: 16px; height: 16px; color: var(--navy); opacity: .75; }
  @media (max-width: 1180px) { .mx .explorer-panel { min-height: 0; max-height: none; } .mx .explorer .map-shell { --map-h: 560px; } }
  @media (max-width: 767px) {
    .mx-bar { margin-bottom: 10px; gap: 8px; }
    .mx-bar .input-icon { flex: 1 1 0; }
    .mx-ftoggle { display: inline-flex !important; height: 44px; }
    .mx-sel { display: none; width: 100%; }
    .mx-sel.open { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .mx-sel .select { width: 100%; min-width: 0; font-size: 14px; }
    .mx .explorer .map-shell { --map-h: 56dvh; min-height: 340px; }
    .mx-mresults { display: block; margin-top: 12px; }
    .mx .explorer-panel.bottom-sheet-m.open { top: auto; max-height: 72dvh; padding-top: 18px; }
    .mx-art { width: 76px; }
    .mx-res { overflow: visible; margin: 0; padding: 0; }
  }

  /* Request detail */
  .rq-cmp { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; }
  .rq-cmp th { text-align: start; font-size: 12px; color: var(--text-3); font-weight: 600; padding: 0 12px 10px; }
  .rq-cmp td { padding: 11px 12px; border-top: 1px solid var(--line-2); vertical-align: top; overflow-wrap: anywhere; }
  .rq-cmp td:first-child, .rq-cmp th:first-child { padding-inline-start: 0; color: var(--text-2); width: 30%; }
  .rq-cmp td.diff { background: var(--warn-bg); color: #8A4108; font-weight: 600; border-radius: 8px; }
  .rq-cmp td.old { color: var(--text-3); text-decoration: line-through; text-decoration-color: rgba(138,153,168,.6); }
  .rq-cmp td.same { background: var(--mint-50); color: #0A6E4D; font-weight: 600; border-radius: 8px; }
  .rq-cmp td.none { color: var(--text-3); font-style: italic; }
  .rq-cmp .dm { display: none; }
  @media (max-width: 640px) {
    .rq-cmp thead { display: none; }
    .rq-cmp tr { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 10px; padding: 12px 0; border-top: 1px solid var(--line-2); }
    .rq-cmp td { border: 0; padding: 4px 8px; }
    .rq-cmp td:first-child { grid-column: 1 / -1; width: auto; padding: 0; font-size: 12px; font-weight: 600; }
    .rq-cmp .dm { display: block; font-size: 10.5px; font-weight: 600; color: var(--text-3); font-style: normal; text-transform: uppercase; letter-spacing: .04em; }
    html[dir="rtl"] .rq-cmp .dm { letter-spacing: 0; }
  }
  .rq-actbar { display: flex; gap: 8px; flex-wrap: wrap; }
  .rq-mob { display: none; }
  @media (max-width: 767px) { .rq-desk { display: none !important; } .rq-mob { display: block; margin-top: 16px; } }
  .rq-checks { display: flex; flex-direction: column; gap: 10px; }
  .rq-checks div { display: flex; gap: 10px; align-items: flex-start; font-size: 13.5px; }
  .rq-checks svg { width: 18px; height: 18px; flex: none; margin-top: 1px; }
  .rq-checks .ok svg { color: var(--ok); }
  .rq-checks .warn svg { color: var(--warn); }
  .rq-meta { display: flex; flex-wrap: wrap; gap: 8px 18px; font-size: 13px; color: var(--text-2); margin-top: 10px; }
  .rq-meta span { display: inline-flex; align-items: center; gap: 6px; }
  .rq-meta svg { width: 15px; height: 15px; color: var(--text-3); }
  @media (max-width: 767px) { .rq-actbar { position: sticky; bottom: 0; z-index: 5; background: rgba(244,247,246,.94); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); margin-inline: -16px; padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid var(--line); } .rq-actbar .btn { flex: 1; padding: 0 10px; } }

  /* Data sources */
  .ds-layer { display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; gap: 14px; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--line-2); }
  .ds-layer:last-child { border-bottom: 0; }
  .ds-layer .li-icon { width: 44px; height: 44px; }
  .ds-layer b { font-size: 14px; display: block; }
  .ds-layer small { display: block; font-size: 12.5px; color: var(--text-2); margin-top: 2px; }
  .ds-end { display: flex; align-items: center; gap: 10px; }
  @media (max-width: 640px) { .ds-layer { grid-template-columns: 40px minmax(0, 1fr); } .ds-layer .li-icon { width: 40px; height: 40px; } .ds-end { grid-column: 2; flex-wrap: wrap; } }
  .ds-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--line-2); }
  .ds-row:last-child { border-bottom: 0; }
  .ds-row b { display: block; font-size: 14px; font-weight: 600; }
  .ds-row small { display: block; font-size: 12.5px; color: var(--text-2); }
  .mu-heat { display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 6px 12px; align-items: center; }
  .mu-heat .hl { font-size: 12.5px; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mu-heat .heat i { aspect-ratio: auto; height: 22px; }
  .mu-heat .mx { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 4px; font-size: 10.5px; color: var(--text-3); text-align: center; }
  @media (max-width: 640px) { .mu-heat { grid-template-columns: 76px minmax(0, 1fr); } .mu-heat .heat { gap: 2px; } .mu-heat .heat i { height: 18px; border-radius: 3px; } .mu-heat .mx span:nth-child(even) { visibility: hidden; } }
  `);

  /* ---------------- shared computations ---------------- */
  const C = D.city;
  const cityVer = () => { const unver = 127; return { verified: C.total - C.pending - unver, pendingVerification: C.pending, unverified: unver }; };
  const sampleQ = () => {
    const all = D.buildings; const n = all.length; let dup = 0, geom = 0, noParcel = 0, noUnits = 0;
    all.forEach((b) => { const f = qf(b); if (f.dup) dup++; if (f.geom) geom++; if (f.noParcel) noParcel++; if (f.noUnits) noUnits++; });
    return { n, dup, geom, noParcel, noUnits, parcelPct: pct(n - noParcel, n), unitsPct: pct(n - noUnits, n), gisPct: pct(all.filter((b) => b.source === 'gis').length, n) };
  };
  const goDistrict = (id) => {
    const d = D.district(id);
    B.vs['mx:dist'] = id; B.vs['mx:_ld'] = id; B.vs['mx:sel'] = '';
    B.map.setView('muni', { x: d.seed[0] - 210, y: d.seed[1] - 150, w: 420, h: 300 });
    B.go(`${R}-explorer`);
  };
  B.act.muDistrict = (id) => goDistrict(id);
  B.act.muDq = (flag) => { B.vs['rg:dq'] = flag; B.vs['rg:page'] = 0; B.go(`${R}-registry`); };

  /* =================================================================
     Dashboard
     ================================================================= */
  const reqLi = (q) => ui.li({ icon: RT[q.type].icon, tone: RT[q.type].tone === 'navy' ? 'navy' : RT[q.type].tone, title: tx(q.title), sub: `${ui.idMono(q.id)} · ${tx(RT[q.type].short)} · ${B.ago(q.date)}`, end: ui.status(q.status), go: `${R}-request-${q.id}` });

  function home() {
    const q = sampleQ();
    const indep = C.independent;
    const cov = pct(C.gis, C.total);
    const lastM = C.trend[11], prevM = C.trend[10];
    const hero = `<section class="mu-hero">
      <div>
        <div class="eyebrow">${L('Registered buildings', 'المباني المسجّلة')}</div>
        <div class="mu-big">${B.num(C.total)}<small>${L('in 8 districts', 'في 8 أحياء')}</small></div>
        <div class="mu-split"><i style="width:${cov}%;background:var(--mint)"></i><i style="flex:1;background:#B9AAF0"></i></div>
        <div class="mu-split-l"><span><i style="background:var(--mint)"></i>${L('GIS-linked', 'مرتبطة بنظم المعلومات')} ${B.pct(cov, 1)}</span><span><i style="background:#B9AAF0"></i>${L('Independent', 'مستقلة')} ${B.pct(100 - cov, 1)}</span></div>
      </div>
      <div class="mu-hstats">
        <div><span>${L('GIS-linked records', 'سجلات مرتبطة بنظم المعلومات')}</span><b>${B.num(C.gis)}</b><small>${icon('arrowUp')}${L('+184 this month', '+184 هذا الشهر')}</small></div>
        <div><span>${L('Independent records', 'سجلات مستقلة')}</span><b>${B.num(indep)}</b><small>${icon('arrowUp')}${L(`+${C.trendIndependent[11]} this month`, `+${C.trendIndependent[11]} هذا الشهر`)}</small></div>
        <div><span>${L('Pending verification', 'بانتظار التحقق')}</span><b>${B.num(C.pending)}</b><small style="color:#F6C77E">${icon('clock')}${L('42 over 14 days', '42 تجاوزت 14 يوماً')}</small></div>
        <div><span>${L('Mapped units', 'الوحدات المُخططة')}</span><b>${B.num(C.units)}</b><small>${icon('arrowUp')}${L('+1.8% this month', '+1.8% هذا الشهر')}</small></div>
      </div>
    </section>`;

    const trend = ui.card({
      title: L('Registration trend', 'اتجاه التسجيل'), sub: L('New registrations per month, last 12 months', 'التسجيلات الجديدة شهرياً خلال آخر 12 شهراً'),
      headExtra: `<span class="delta up">${icon('arrowUp')}${B.pct(((lastM - prevM) / prevM) * 100, 1)}</span>`,
      body: B.charts.line({ labels: months(), height: 220, series: [{ name: L('All registrations', 'جميع التسجيلات'), color: '#142B3B', values: C.trend, area: true }, { name: L('Independent submissions', 'التسجيلات المستقلة'), color: '#9B8AE0', values: C.trendIndependent, dashed: true }] }),
    });

    const dq = ui.card({
      title: L('Data quality', 'جودة البيانات'), sub: L(`Across ${B.num(q.n)} mapped footprints in the sample area`, `عبر ${B.num(q.n)} مسقطاً في المنطقة النموذجية`),
      body: `<div class="mu-dq">
        ${ui.meter(L('With parcel reference', 'مع مرجع القطعة'), B.pct(q.parcelPct, 1), q.parcelPct)}
        ${ui.meter(L('With confirmed unit count', 'مع عدد وحدات مؤكد'), B.pct(q.unitsPct, 1), q.unitsPct)}
        ${ui.meter(L('Linked to GIS footprint', 'مرتبطة بمسقط GIS'), B.pct(q.gisPct, 1), q.gisPct, 'navy')}
        ${ui.meter(L('Verified records', 'سجلات موثّقة'), B.pct(pct(cityVer().verified, C.total), 1), pct(cityVer().verified, C.total))}
      </div>
      <div class="mu-dq-flags">
        <button class="mu-flag" data-act="muDq" data-arg="dup"><span class="fi v">${icon('layers')}</span><span class="grow"><b>${q.dup}</b><span>${L('Possible duplicates', 'سجلات مكررة محتملة')}</span></span>${icon('chevR', 'flip')}</button>
        <button class="mu-flag" data-act="muDq" data-arg="geom"><span class="fi">${icon('alert')}</span><span class="grow"><b>${q.geom}</b><span>${L('Geometry issues', 'مشكلات في المساقط')}</span></span>${icon('chevR', 'flip')}</button>
      </div>`,
    });

    const covRows = D.districts.slice().sort(B.by((d) => d.gis / d.buildings, -1)).map((d) => {
      const g = pct(d.gis, d.buildings);
      return `<button class="mu-cov-row" data-act="muDistrict" data-arg="${d.id}">
        <div><b class="n">${tx(d.name)}</b><small>${B.num(d.buildings)} ${L('buildings', 'مبنى')} · ${B.num(d.units)} ${L('units', 'وحدة')}</small></div>
        <div class="mu-track"><i style="width:${g}%;background:var(--navy)"></i><i style="flex:1;background:#D9D1F7"></i></div>
        <span class="p">${B.pct(g, 1)}</span></button>`;
    }).join('');
    const coverage = ui.card({
      title: L('Coverage by district', 'التغطية حسب الحي'), sub: L('Share of buildings linked to the municipal GIS layer', 'نسبة المباني المرتبطة بطبقة نظم المعلومات البلدية'),
      link: { label: L('Analytics', 'التحليلات'), go: `${R}-analytics` },
      body: `<div class="mu-cov">${covRows}</div>${B.charts.legend([{ name: L('GIS-linked', 'مرتبطة بنظم المعلومات'), color: '#142B3B' }, { name: L('Independent', 'مستقلة'), color: '#D9D1F7' }])}`,
    });
    const recent = ui.card({
      title: L('Recent registration requests', 'أحدث طلبات التسجيل'), sub: L(`${openCount()} awaiting review`, `${openCount()} بانتظار المراجعة`),
      link: { label: L('Open inbox', 'فتح الوارد'), go: `${R}-requests` },
      body: ui.list(REQ.slice().sort(B.by('date', -1)).slice(0, 4).map(reqLi)),
    });
    const mini = ui.card({
      cls: 'pad-0',
      body: `<div style="position:relative">${B.map.render({ id: 'muni-mini', static: true, mode: 'verification', height: '220px', legend: false, badge: L('Verification status · sample area', 'حالة التحقق · منطقة نموذجية') })}
        <div style="position:absolute;inset-inline-end:12px;bottom:12px">${ui.btn(L('Open GIS explorer', 'فتح المستكشف الجغرافي'), { kind: 'dark', size: 'sm', icon: 'map', go: `${R}-explorer` })}</div></div>`,
    });

    return `${head({ title: L('Good morning, Maha', 'صباح الخير، مها'), sub: L('Building registry overview for Ramallah — sample tenant with demonstration data.', 'نظرة عامة على سجل مباني رام الله — جهة تجريبية ببيانات توضيحية.'),
      actions: ui.btn(L('Export report', 'تصدير التقرير'), { icon: 'download', act: 'soon', arg: L('Report export', 'تصدير التقرير') }) + ui.btn(L('GIS explorer', 'المستكشف الجغرافي'), { kind: 'primary', icon: 'map', go: `${R}-explorer` }) })}
      <div class="stack-lg">
        ${hero}
        <div class="grid g-main">${trend}${dq}</div>
        <div class="grid g-main">${coverage}<div class="stack">${mini}${recent}</div></div>
        ${ui.demoNote(tx(D.municipality.note) + ' ' + L('Figures, requests and records shown are fictional.', 'الأرقام والطلبات والسجلات المعروضة وهمية.'))}
      </div>`;
  }

  /* =================================================================
     GIS Building Explorer
     ================================================================= */
  const MAPID = 'muni';
  const mxFilter = () => {
    const q = B.get('mx:q', '').trim(), t = B.get('mx:type', 'all'), v = B.get('mx:ver', 'all'), s = B.get('mx:src', 'all'), d = B.get('mx:dist', 'all');
    const active = !!q || t !== 'all' || v !== 'all' || s !== 'all' || d !== 'all';
    const list = D.buildings.filter((b) => (t === 'all' || b.type === t) && (v === 'all' || b.verification === v) && (s === 'all' || b.source === s) && (d === 'all' || b.district === d)
      && (!q || B.match(q, b.id, b.gis, b.ref, b.name, b.address, D.district(b.district).name)));
    return { q, t, v, s, d, active, list, nf: [t, v, s, d].filter((x) => x !== 'all').length };
  };
  const optsType = () => [{ v: 'all', l: L('All categories', 'جميع الفئات') }].concat(Object.keys(D.types).map((k) => ({ v: k, l: D.types[k] })));
  const optsVer = () => [{ v: 'all', l: L('Any status', 'أي حالة') }, { v: 'verified', l: B.statuses.verified }, { v: 'pendingVerification', l: B.statuses.pendingVerification }, { v: 'unverified', l: L('Unverified draft', 'مسودة غير موثّقة') }];
  const optsSrc = () => [{ v: 'all', l: L('Any source', 'أي مصدر') }, { v: 'gis', l: L('Municipal GIS', 'نظم المعلومات البلدية') }, { v: 'independent', l: L('Independent', 'مستقل') }];
  const optsDist = () => [{ v: 'all', l: L('All districts', 'جميع الأحياء') }].concat(D.districts.map((d) => ({ v: d.id, l: d.name })));

  B.act.muSelect = (id) => { B.vs['mx:sel'] = id; B.refresh(); };
  B.act.muPick = (id) => { B.map.focus(MAPID, id, 420); B.vs['mx:sel'] = id; B.refresh(); };
  B.act.muClear = () => { B.vs['mx:sel'] = ''; B.refresh(); };
  B.act.muFilt = (arg) => { const [k, v] = arg.split('='); B.vs[k] = B.vs[k] === v ? 'all' : v; B.refresh(); };
  B.act.muResetF = () => { ['mx:type', 'mx:ver', 'mx:src', 'mx:dist'].forEach((k) => { B.vs[k] = 'all'; }); B.vs['mx:q'] = ''; B.vs['mx:_ld'] = 'all'; B.map.setView(MAPID, null); B.refresh(); };

  const breakdown = (list, mode) => {
    let rows;
    const n = list.length || 1;
    if (mode === 'verification') rows = [['verified', L('Verified', 'موثّق'), 'mx:ver'], ['pendingVerification', L('Pending verification', 'بانتظار التحقق'), 'mx:ver'], ['unverified', L('Unverified draft', 'مسودة غير موثّقة'), 'mx:ver']].map(([k, l, f]) => ({ k, l, f, c: B.map.colors.verification[k], n: list.filter((b) => b.verification === k).length }));
    else if (mode === 'source') rows = [['gis', L('Municipal GIS record', 'سجل نظم المعلومات البلدية'), 'mx:src'], ['independent', L('Independently submitted', 'مُسجّل بشكل مستقل'), 'mx:src']].map(([k, l, f]) => ({ k, l, f, c: B.map.colors.source[k], n: list.filter((b) => b.source === k).length }));
    else rows = Object.keys(D.types).map((k) => ({ k, l: tx(D.types[k]), f: 'mx:type', c: B.map.colors.type[k], n: list.filter((b) => b.type === k).length })).filter((r) => r.n).sort(B.by('n', -1));
    return `<div class="mx-brk">${rows.map((r) => `<button class="${B.get(r.f, 'all') === r.k ? 'on' : ''}" data-act="muFilt" data-arg="${r.f}=${r.k}">${sw(r.c)}<span class="truncate">${r.l}</span><b>${B.num(r.n)}</b><span class="bar"><i style="width:${pct(r.n, n)}%;background:${r.c}"></i></span></button>`).join('')}</div>`;
  };

  const resultItem = (b, mode) => ui.li({
    lead: `<span class="mx-lead" style="background:${B.map.fill(b, mode)}">${icon(typeIcon(b.type))}</span>`,
    title: tx(b.name), sub: `${ui.idMono(b.id)} · ${dName(b.district)}`, act: 'muPick', arg: b.id,
  });

  const resultsBody = (f, mode, limit) => {
    const list = f.active ? f.list : D.keyBuildings;
    const shown = list.slice(0, limit);
    return `
      <div class="mx-sum"><b>${B.num(f.list.length)}</b><span class="muted small">${f.active ? L(`of ${B.num(D.buildings.length)} footprints match`, `من ${B.num(D.buildings.length)} مسقطاً مطابقاً`) : L('mapped footprints in view', 'مسقطاً مرسوماً في العرض')}</span></div>
      ${f.active ? `<button class="btn btn-text" style="margin-top:4px" data-act="muResetF">${icon('x')}<span>${L('Clear filters', 'مسح عوامل التصفية')}</span></button>` : `<p class="xs faint" style="margin-top:4px">${L('Tap a footprint on the map, or search by BENA ID, GIS ID, street or area.', 'اضغط على مسقط في الخريطة، أو ابحث برقم بينا أو رقم GIS أو الشارع أو المنطقة.')}</p>`}
      <div style="margin:14px 0 6px" class="eyebrow">${mode === 'type' ? L('By category', 'حسب الفئة') : mode === 'source' ? L('By data source', 'حسب مصدر البيانات') : L('By verification', 'حسب التحقق')}</div>
      ${breakdown(f.list, mode)}
      <div style="margin:18px 0 0" class="eyebrow">${f.active ? L('Matches', 'النتائج المطابقة') : L('Key buildings', 'مبانٍ رئيسية')}</div>
      ${shown.length ? `<div class="mx-res">${ui.list(shown.map((b) => resultItem(b, mode)))}${list.length > limit ? `<p class="xs faint" style="padding:10px 0">${L(`Showing ${limit} of ${B.num(list.length)} — refine the search to narrow down.`, `عرض ${limit} من ${B.num(list.length)} — حسّن البحث لتضييق النتائج.`)}</p>` : ''}</div>`
        : ui.empty({ icon: 'search', title: L('No buildings match', 'لا توجد مبانٍ مطابقة'), text: L('Try another ID, street or district.', 'جرّب رقماً أو شارعاً أو حياً آخر.') })}`;
  };

  const detailBody = (b) => {
    const f = qf(b);
    const flags = [f.dup && L('Possible duplicate record', 'سجل مكرر محتمل'), f.geom && L('Footprint geometry needs review', 'المسقط بحاجة لمراجعة هندسية'), f.noParcel && L('Parcel reference missing', 'مرجع القطعة مفقود'), f.noUnits && L('Unit count not confirmed', 'عدد الوحدات غير مؤكد')].filter(Boolean);
    return `<div class="mx-ph"><div class="grow"><div class="eyebrow">${L('Building information', 'معلومات المبنى')}</div></div><button class="icon-btn" style="margin-block-start:-8px;margin-inline-end:-8px" data-act="muClear" aria-label="${L('Close', 'إغلاق')}">${icon('x')}</button></div>
      <div class="mx-id"><div class="mx-art">${B.art.facade(hash(b.id) % 997, { type: b.type, floors: b.floors })}</div>
      <div style="min-width:0"><h3 class="mx-title">${tx(b.name)}</h3>
      <div class="mx-addr">${icon('pin')}<span>${tx(b.address)}</span></div></div></div>
      <div class="row-sm wrap" style="margin-top:12px">${ui.status(b.verification)}${ui.sourceTag(b.source)}</div>
      ${ui.kvGrid([
        [L('BENA ID', 'رقم بينا'), ui.idMono(b.id)],
        [L('Municipal GIS ID', 'رقم GIS البلدي'), b.gis ? ui.idMono(b.gis) : `<span class="faint">${L('Not linked', 'غير مرتبط')}</span>`],
        [L('Municipal reference', 'المرجع البلدي'), b.ref ? ui.idMono(b.ref) : '—'],
        [L('Type', 'النوع'), D.typeLabel(b.type)],
        [L('Units', 'الوحدات'), B.num(b.units)],
        [L('Floors', 'الطوابق'), B.num(b.floors)],
        [L('Parcel', 'القطعة'), parcelTxt(b.parcel)],
        [L('District', 'الحي'), dName(b.district)],
        [L('Registration', 'التسجيل'), ui.statusLabel(b.status)],
        [L('Last updated', 'آخر تحديث'), B.date(upd(b))],
      ])}
      ${flags.length ? `<div style="margin-top:14px">${ui.callout(`<b>${L('Data quality', 'جودة البيانات')}</b><br>${flags.join(' · ')}`, 'warn', 'alert')}</div>` : ''}
      <div class="mx-acts">
        ${ui.btn(L('Open full profile', 'فتح الملف الكامل'), { kind: 'primary', icon: 'building', go: `${R}-building-${b.id}`, cls: 'full' })}
        ${b.verification === 'verified' ? ui.btn(L('Verified', 'موثّق'), { kind: 'soft', icon: 'shieldCheck', act: 'toast', arg: L('This record is already verified', 'هذا السجل موثّق مسبقاً') }) : ui.btn(L('Verify', 'توثيق'), { kind: 'dark', icon: 'shieldCheck', act: 'muVerify', arg: b.id })}
        ${ui.btn(L('Request correction', 'طلب تصحيح'), { icon: 'edit', act: 'muCorrect', arg: b.id })}
        ${b.source === 'independent' ? ui.btn(L('Link to municipal reference', 'ربط بمرجع بلدي'), { icon: 'link', act: 'muLink', arg: b.id, cls: 'full' }) : ''}
      </div>`;
  };

  function explorer() {
    const mode = B.get('mx:mode', 'type');
    const f = mxFilter();
    // centre on a district when the district filter changes
    if (f.d !== B.get('mx:_ld', 'all')) {
      B.vs['mx:_ld'] = f.d;
      if (f.d === 'all') B.map.setView(MAPID, null);
      else { const d = D.district(f.d); B.map.setView(MAPID, { x: d.seed[0] - 210, y: d.seed[1] - 150, w: 420, h: 300 }); }
    }
    // fit the map to search matches when the query changes
    if (f.q !== B.get('mx:_lq', '')) {
      B.vs['mx:_lq'] = f.q;
      if (f.q && f.list.length && f.list.length <= 80) {
        const xs = [], ys = [];
        f.list.forEach((b) => b.poly.forEach((p) => { xs.push(p[0]); ys.push(p[1]); }));
        const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
        const w = Math.max(320, (x1 - x0) * 1.35, ((y1 - y0) * 1.35) / 0.7);
        B.map.setView(MAPID, { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - (w * 0.7) / 2, w, h: w * 0.7 });
      }
    }
    let sel = B.get('mx:sel', '');
    const sb = sel ? D.building(sel) : null;
    if (!sb) sel = '';
    const vis = f.active ? new Set(f.list.map((b) => b.id)) : null;
    const fOpen = B.get('mx:fopen', false);
    const map = B.map.render({ id: MAPID, mode, visible: vis, selected: sel || null, onSelect: 'muSelect', legendMobile: mode !== 'type', badge: L('Simulated municipal GIS · sample area', 'نظم معلومات بلدية محاكاة · منطقة نموذجية') });
    const panel = `<aside class="card explorer-panel mx-panel bottom-sheet-m ${sb ? 'open' : ''}">${sb ? detailBody(sb) : resultsBody(f, mode, 40)}</aside>`;
    return `<div class="mx">
      ${head({ title: L('GIS Building Explorer', 'مستكشف المباني الجغرافي'), sub: L('Municipal footprints and independently submitted records on one map.', 'المساقط البلدية والسجلات المُقدّمة بشكل مستقل على خريطة واحدة.'),
        actions: ui.seg('mx:mode', [{ id: 'type', label: L('Type', 'النوع'), icon: 'layers' }, { id: 'verification', label: L('Verification', 'التحقق'), icon: 'shieldCheck' }, { id: 'source', label: L('Source', 'المصدر'), icon: 'database' }], mode) })}
      <div class="mx-bar">
        ${ui.search('mx:q', L('Search BENA ID, GIS ID, street or area', 'ابحث برقم بينا أو رقم GIS أو الشارع أو المنطقة'))}
        <button class="btn btn-ghost mx-ftoggle ${fOpen ? 'active' : ''}" data-act="toggle" data-arg="mx:fopen">${icon('sliders')}<span>${L('Filters', 'التصفية')}</span>${f.nf ? `<span class="badge mint" style="height:20px;padding:0 7px">${f.nf}</span>` : ''}</button>
        <div class="mx-sel ${fOpen ? 'open' : ''}">
          ${ui.select('mx:type', optsType(), { def: 'all', label: L('Category', 'الفئة') })}
          ${ui.select('mx:ver', optsVer(), { def: 'all', label: L('Verification status', 'حالة التحقق') })}
          ${ui.select('mx:src', optsSrc(), { def: 'all', label: L('Data source', 'مصدر البيانات') })}
          ${ui.select('mx:dist', optsDist(), { def: 'all', label: L('District', 'الحي') })}
        </div>
      </div>
      <div class="explorer">${map}${panel}</div>
      <div class="mx-mresults card">${resultsBody(f, mode, f.active ? 25 : 10)}</div>
    </div>`;
  }

  /* building actions (explorer + registry) */
  B.act.muVerify = (id) => {
    const b = D.building(id);
    B.confirm({ title: L('Verify this building record?', 'توثيق سجل هذا المبنى؟'), text: L(`${b.id} · ${tx(b.name)} will be marked as verified by the GIS & Building Registry Unit.`, `سيتم توثيق ${b.id} · ${tx(b.name)} من قبل وحدة نظم المعلومات وسجل المباني.`), ok: L('Verify record', 'توثيق السجل'),
      onOk: () => { b.verification = 'verified'; b.status = 'registered'; b.updated = '2026-11-25'; B.closeModal(true); B.refresh(); B.toast(L('Building verified (demo)', 'تم توثيق المبنى (تجريبي)')); } });
  };
  B.act.muCorrect = (id) => {
    const b = D.building(id);
    B.modal({ title: L('Request a correction', 'طلب تصحيح'), sub: `${b.id} · ${esc(tx(b.name))}`, form: 'muCorrection',
      body: `<input type="hidden" name="id" value="${esc(id)}"><div class="form-grid">
        ${ui.field({ name: 'field', label: L('What needs correcting?', 'ما الذي يحتاج للتصحيح؟'), type: 'select', full: true, options: [{ v: 'units', l: L('Unit count', 'عدد الوحدات') }, { v: 'floors', l: L('Number of floors', 'عدد الطوابق') }, { v: 'type', l: L('Building type / use', 'نوع / استخدام المبنى') }, { v: 'address', l: L('Address', 'العنوان') }, { v: 'parcel', l: L('Parcel reference', 'مرجع القطعة') }, { v: 'geometry', l: L('Footprint geometry', 'هندسة المسقط') }] })}
        ${ui.field({ name: 'to', label: L('Send to', 'إرسال إلى'), type: 'select', full: true, options: [{ v: 'owner', l: L('Registered owner(s)', 'المالك/المالكون المسجّلون') }, { v: 'committee', l: L('Building committee', 'لجنة المبنى') }, { v: 'gis', l: L('GIS team (internal)', 'فريق نظم المعلومات (داخلي)') }] })}
        ${ui.field({ name: 'note', label: L('Note', 'ملاحظة'), type: 'textarea', full: true, required: true, placeholder: L('Describe what looks wrong and what evidence is needed.', 'صف ما يبدو خاطئاً والمستندات المطلوبة.') })}
      </div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send request', 'إرسال الطلب'), { kind: 'primary', type: 'submit', icon: 'send' })}` });
  };
  B.submit.muCorrection = () => B.success({ title: L('Correction requested', 'تم طلب التصحيح'), text: L('The recipient will be notified in BENA and the record is flagged until resolved.', 'سيتم إشعار المستلم في بينا وسيبقى السجل مؤشراً حتى المعالجة.'), ref: B.uid('COR') });
  B.act.muLink = (id) => {
    const b = D.building(id);
    B.modal({ title: L('Link to municipal reference', 'ربط بمرجع بلدي'), sub: `${b.id} · ${esc(tx(b.name))}`, form: 'muLinkGis',
      body: `<input type="hidden" name="id" value="${esc(id)}">${ui.callout(L('Linking keeps the BENA ID and attaches the municipal GIS record. The source tag changes to “Municipal GIS record”.', 'يحافظ الربط على رقم بينا ويُرفق سجل نظم المعلومات البلدية. يتغير وسم المصدر إلى «سجل نظم المعلومات البلدية».'), 'mint', 'link')}
        <div class="form-grid" style="margin-top:14px">
        ${ui.field({ name: 'gis', label: L('Municipal GIS ID', 'رقم GIS البلدي'), required: true, value: `RM-GIS-${41000 + (hash(b.id) % 9000)}` })}
        ${ui.field({ name: 'ref', label: L('Municipal reference', 'المرجع البلدي'), value: `RM/${b.district.slice(0, 2).toUpperCase()}/2026/${b.id.slice(-4)}` })}
        </div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Link record', 'ربط السجل'), { kind: 'primary', type: 'submit', icon: 'link' })}` });
  };
  B.submit.muLinkGis = (d) => {
    const b = D.building(d.id);
    if (b) { b.gis = d.gis || b.gis; b.ref = d.ref || b.ref; b.source = 'gis'; b.updated = '2026-11-25'; }
    B.refresh();
    B.success({ title: L('Record linked', 'تم ربط السجل'), text: L('The building now carries the municipal GIS reference.', 'يحمل المبنى الآن مرجع نظم المعلومات البلدية.'), ref: d.gis });
  };

  /* =================================================================
     Building Registry
     ================================================================= */
  const DQ = { dup: T('Possible duplicates', 'سجلات مكررة محتملة'), geom: T('Geometry issues', 'مشكلات في المساقط'), noParcel: T('Parcel reference missing', 'مرجع القطعة مفقود'), noUnits: T('Unit count not confirmed', 'عدد الوحدات غير مؤكد') };
  function registry() {
    const q = B.get('rg:q', ''), t = B.get('rg:type', 'all'), v = B.get('rg:ver', 'all'), s = B.get('rg:src', 'all'), d = B.get('rg:dist', 'all'), dq = B.get('rg:dq', '');
    const rows = D.buildings.filter((b) => (t === 'all' || b.type === t) && (v === 'all' || b.verification === v) && (s === 'all' || b.source === s) && (d === 'all' || b.district === d) && (!dq || qf(b)[dq])
      && B.match(q, b.id, b.gis, b.ref, b.name, b.address));
    const reset = { reset: 'rg:page' };
    const table = ui.table({
      id: 'rg', rows, pageSize: 15, defaultSort: '-updated', rowGo: (r) => `${R}-building-${r.id}`,
      cols: [
        { key: 'id', label: L('BENA ID', 'رقم بينا'), sort: true, render: (r) => `${ui.idMono(r.id)}<span class="mu-m-only"> · ${r.gis ? ui.idMono(r.gis) : `<span style="color:var(--violet)">${L('Independent', 'مستقل')}</span>`}</span>`, m: 'sub' },
        { key: 'gis', label: L('Municipal ref. / GIS ID', 'المرجع البلدي / رقم GIS'), sort: (r) => r.gis || '~', render: (r) => (r.gis ? `<div class="mu-2l">${ui.idMono(r.gis)}<small>${esc(r.ref)}</small></div>` : ui.sourceBadge('independent')) },
        { key: 'name', label: L('Name / address', 'الاسم / العنوان'), sort: (r) => tx(r.name), m: 'title', mRender: (r) => esc(tx(r.name)),
          render: (r) => `<div class="cell-main"><span class="mu-ti ${r.source === 'independent' ? 'ind' : ''}">${icon(typeIcon(r.type))}</span><div style="min-width:0"><b>${esc(tx(r.name))}</b><small>${dName(r.district)}</small></div></div>` },
        { key: 'type', label: L('Type', 'النوع'), sort: (r) => D.typeLabel(r.type), render: (r) => D.typeLabel(r.type), m: 'meta' },
        { key: 'units', label: L('Units', 'الوحدات'), sort: true, align: 'end', render: (r) => units(r.units), m: 'meta' },
        { key: 'status', label: L('Registration', 'التسجيل'), sort: true, render: (r) => ui.status(r.status) },
        { key: 'verification', label: L('Verification', 'التحقق'), sort: true, render: (r) => ui.status(r.verification), m: 'end' },
        { key: 'updated', label: L('Last updated', 'آخر تحديث'), sort: true, render: (r) => `<span class="nowrap">${B.date(upd(r))}</span>`, m: 'meta' },
      ],
    });
    return `${head({ title: L('Building Registry', 'سجل المباني'), sub: L(`${B.num(D.buildings.length)} records in the mapped sample area · ${B.num(C.total)} city-wide`, `${B.num(D.buildings.length)} سجلاً في المنطقة النموذجية · ${B.num(C.total)} على مستوى المدينة`),
      actions: ui.btn(L('Export CSV', 'تصدير CSV'), { icon: 'download', act: 'soon', arg: L('CSV export', 'تصدير CSV') }) + ui.btn(L('Register building', 'تسجيل مبنى'), { kind: 'primary', icon: 'plus', act: 'muNewBuilding' }) })}
      <div class="toolbar">
        ${ui.search('rg:q', L('Search ID, GIS ID, reference or street', 'ابحث بالرقم أو رقم GIS أو المرجع أو الشارع'), reset)}
        ${ui.select('rg:type', optsType(), { def: 'all', label: L('Type', 'النوع'), ...reset })}
        ${ui.select('rg:ver', optsVer(), { def: 'all', label: L('Verification', 'التحقق'), ...reset })}
        ${ui.select('rg:src', optsSrc(), { def: 'all', label: L('Source', 'المصدر'), ...reset })}
        ${ui.select('rg:dist', optsDist(), { def: 'all', label: L('District', 'الحي'), ...reset })}
      </div>
      <div class="row between wrap" style="margin-bottom:12px">
        <span class="mu-count">${L(`${B.num(rows.length)} buildings`, `${B.num(rows.length)} مبنى`)}</span>
        ${dq ? `<span class="mu-chipx">${icon('filter')}${tx(DQ[dq])}<button data-act="set" data-arg="rg:dq=" aria-label="${L('Remove filter', 'إزالة التصفية')}">${icon('x')}</button></span>` : `<span class="xs faint">${L('Select a row to open the building profile', 'اختر صفاً لفتح ملف المبنى')}</span>`}
      </div>
      ${table}`;
  }
  B.act.muNewBuilding = () => B.modal({
    title: L('Register a building', 'تسجيل مبنى'), sub: L('Creates a municipal record and a BENA ID (demo).', 'ينشئ سجلاً بلدياً ورقم بينا (تجريبي).'), form: 'muNewB', size: 'md',
    body: `<div class="form-grid">
      ${ui.field({ name: 'name', label: L('Building name or number', 'اسم المبنى أو رقمه'), required: true, full: true, placeholder: L('e.g. 32 Park St.', 'مثال: 32 شارع الحديقة') })}
      ${ui.field({ name: 'district', label: L('District', 'الحي'), type: 'select', options: D.districts.map((d) => ({ v: d.id, l: d.name })) })}
      ${ui.field({ name: 'type', label: L('Type', 'النوع'), type: 'select', options: Object.keys(D.types).map((k) => ({ v: k, l: D.types[k] })) })}
      ${ui.field({ name: 'floors', label: L('Floors', 'الطوابق'), type: 'number', min: 1, value: '4' })}
      ${ui.field({ name: 'units', label: L('Units', 'الوحدات'), type: 'number', min: 1, value: '8' })}
      ${ui.field({ name: 'basin', label: L('Basin no.', 'رقم الحوض'), type: 'number', min: 1 })}
      ${ui.field({ name: 'parcel', label: L('Parcel no.', 'رقم القطعة'), type: 'number', min: 1 })}
      ${ui.field({ name: 'docs', label: L('Documents', 'المستندات'), type: 'file', full: true })}
    </div>`,
    foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Create record', 'إنشاء السجل'), { kind: 'primary', type: 'submit', icon: 'check' })}`,
  });
  B.submit.muNewB = () => B.success({ title: L('Building registered', 'تم تسجيل المبنى'), text: L('A draft record was created and queued for GIS footprint capture.', 'تم إنشاء سجل مسودة وإدراجه لالتقاط المسقط في نظم المعلومات.'), ref: 'BN-RAM-' + String(Date.now()).slice(-5) });

  /* =================================================================
     Registration Requests
     ================================================================= */
  function requests() {
    const st = B.get('rq:st', 'open'), ty = B.get('rq:type', 'all'), q = B.get('rq:q', '');
    const inSt = (x) => (st === 'all' ? true : st === 'open' ? OPEN.includes(x.status) : x.status === st);
    const rows = REQ.filter((x) => inSt(x) && (ty === 'all' || x.type === ty) && B.match(q, x.id, x.title, x.building, D.pname(x.by)));
    const cnt = (s) => REQ.filter((x) => (s === 'all' ? true : s === 'open' ? OPEN.includes(x.status) : x.status === s)).length;
    const strip = `<div class="card pad-0"><div class="mu-strip">
      <div><span>${L('Open requests', 'طلبات مفتوحة')}</span><b>${openCount()}</b><small>${L(`${REQ.filter((x) => x.status === 'new').length} not yet opened`, `${REQ.filter((x) => x.status === 'new').length} لم تُفتح بعد`)}</small></div>
      <div><span>${L('Avg. review time', 'متوسط مدة المراجعة')}</span><b>${L('2.6 days', '2.6 يوم')}</b><small>${L('Target: 5 days', 'الهدف: 5 أيام')}</small></div>
      <div><span>${L('Needs applicant info', 'بحاجة لمعلومات من المتقدّم')}</span><b>${cnt('needsInfo')}</b><small>${L('Waiting on applicant', 'بانتظار المتقدّم')}</small></div>
      <div><span>${L('Decided this month', 'تم البت فيها هذا الشهر')}</span><b>${REQ.filter((x) => ['approved', 'rejected'].includes(x.status)).length}</b><small>${L('Approval rate 75%', 'نسبة الموافقة 75%')}</small></div>
    </div></div>`;
    const table = ui.table({
      id: 'rqt', rows, rowGo: (r) => `${R}-request-${r.id}`, defaultSort: '-date',
      cols: [
        { key: 'title', label: L('Request', 'الطلب'), sort: (r) => tx(r.title), m: 'title', mRender: (r) => esc(tx(r.title)),
          render: (r) => `<div class="cell-main"><span class="li-icon ${RT[r.type].tone}" style="width:34px;height:34px;border-radius:10px">${icon(RT[r.type].icon)}</span><div style="min-width:0"><b>${esc(tx(r.title))}</b><small>${ui.idMono(r.id)}</small></div></div>` },
        { key: 'type', label: L('Type', 'النوع'), sort: (r) => tx(RT[r.type]), render: (r) => `<span class="nowrap">${tx(RT[r.type].short)}</span>`, m: 'sub' },
        { key: 'building', label: L('Building', 'المبنى'), render: (r) => ui.idMono(r.building), m: 'meta' },
        { key: 'by', label: L('Submitted by', 'مقدّم الطلب'), sort: (r) => D.pname(r.by), render: (r) => `<div class="mu-2l"><span class="nowrap">${esc(D.pname(r.by))}</span><small>${tx(CH[r.channel])}</small></div>`, m: 'meta' },
        { key: 'date', label: L('Submitted', 'تاريخ التقديم'), sort: true, render: (r) => `<span class="nowrap">${B.dateShort(r.date)}</span>`, m: 'meta' },
        { key: 'status', label: L('Status', 'الحالة'), sort: true, render: (r) => ui.status(r.status), m: 'end' },
      ],
      empty: { icon: 'inbox', title: L('Inbox zero', 'لا توجد طلبات'), text: L('No requests match these filters.', 'لا توجد طلبات مطابقة لعوامل التصفية.') },
    });
    const chips = ['open', 'new', 'underReview', 'needsInfo', 'approved', 'rejected', 'all'].map((s) => ({ id: s, label: s === 'open' ? L('Open', 'مفتوحة') : s === 'all' ? L('All', 'الكل') : B.statuses[s], count: cnt(s) }));
    return `${head({ title: L('Registration Requests', 'طلبات التسجيل'), sub: L('Review new registrations, corrections, duplicates and links to municipal records.', 'مراجعة التسجيلات الجديدة والتصحيحات والتكرارات والربط بالسجلات البلدية.'),
      actions: ui.btn(L('Assignment rules', 'قواعد الإسناد'), { icon: 'sliders', act: 'soon', arg: L('Assignment rules', 'قواعد الإسناد') }) })}
      <div class="stack">
        ${strip}
        ${ui.chips('rq:st', chips, st)}
        <div class="toolbar" style="margin-bottom:0">${ui.search('rq:q', L('Search request, building or applicant', 'ابحث بالطلب أو المبنى أو مقدّم الطلب'))}
          ${ui.select('rq:type', [{ v: 'all', l: L('All request types', 'جميع أنواع الطلبات') }].concat(Object.keys(RT).map((k) => ({ v: k, l: RT[k] }))), { def: 'all', label: L('Type', 'النوع') })}</div>
        ${table}
      </div>`;
  }

  function requestDetail(id) {
    const r = reqOf(id);
    if (!r) return ui.empty({ icon: 'inbox', title: L('Request not found', 'الطلب غير موجود'), action: ui.btn(L('Back to requests', 'العودة للطلبات'), { kind: 'primary', go: `${R}-requests` }) });
    B.title(r.id); B.navActive('requests');
    const b = D.building(r.building);
    const meta = RT[r.type];
    const cols = r.cols ? r.cols() : [L('Submitted data', 'البيانات المقدّمة'), L('Municipal record', 'السجل البلدي')];
    const dupMode = r.type === 'duplicate';
    const rows = r.fields().map(([k, s, m]) => {
      const both = m != null && s != null;
      const diff = both && String(s) !== String(m);
      const cls = (v, i) => (v == null ? 'none' : dupMode ? (both && !diff ? 'same' : '') : diff ? (i ? 'old' : 'diff') : '');
      const cell = (v, c, i) => `<td class="${cls(v, i)}"><span class="dm">${c}</span>${v == null ? L('No record', 'لا يوجد سجل') : esc(v)}</td>`;
      return `<tr><td>${k}</td>${cell(s, cols[0], 0)}${cell(m, cols[1], 1)}</tr>`;
    }).join('');
    const ndiff = r.fields().filter(([, s, m]) => m != null && s != null && String(s) !== String(m)).length;
    const nsame = r.fields().filter(([, s, m]) => m != null && s != null && String(s) === String(m)).length;
    const decided = ['approved', 'rejected'].includes(r.status);
    const person = D.person(r.by);
    const tl = [
      { state: 'done', icon: 'send', title: L('Submitted', 'تم التقديم'), meta: `${B.date(r.date)} · ${esc(D.pname(r.by))} · ${tx(CH[r.channel])}` },
      { state: 'done', icon: 'cpu', title: L('Automated checks completed', 'اكتملت الفحوصات الآلية'), meta: B.date(r.date), body: (r.checks || []).map((c) => tx(c[1])).join(' · ') },
      { state: decided || (r.extra || []).length ? 'done' : 'current', icon: 'userCheck', title: L('Assigned to Eng. Maha Awad', 'أُسند إلى م. مها عوض'), meta: B.date(r.date) },
    ].concat((r.extra || []).map((e) => ({ state: e.done ? 'done' : 'current', icon: e.done ? 'check' : 'alertCircle', title: tx(e.title), meta: `${B.date(e.date)} · ${esc(D.pname(e.who))}`, body: e.body ? tx(e.body) : '' })));
    if (!decided) tl.push({ state: '', icon: 'gavel', title: L('Decision', 'القرار'), meta: L('Approve, request info or reject', 'موافقة أو طلب معلومات أو رفض') });

    const actions = decided
      ? `<div class="rq-actbar">${ui.btn(L('Reopen review', 'إعادة فتح المراجعة'), { icon: 'refresh', act: 'muReopen', arg: r.id })}${b ? ui.btn(L('Open building', 'فتح المبنى'), { kind: 'dark', icon: 'building', go: `${R}-building-${b.id}` }) : ''}</div>`
      : `<div class="rq-actbar">${ui.btn(L('Reject', 'رفض'), { kind: 'danger', icon: 'xCircle', act: 'muDecide', arg: `${r.id}:rejected` })}${ui.btn(L('Request info', 'طلب معلومات'), { icon: 'alertCircle', act: 'muDecide', arg: `${r.id}:needsInfo` })}${ui.btn(L('Approve', 'موافقة'), { kind: 'primary', icon: 'check', act: 'muDecide', arg: `${r.id}:approved` })}</div>`;

    const headHtml = `<div class="page-head"><div class="grow">
        <button class="btn btn-text" style="margin-bottom:10px;padding:0" data-go="${R}-requests">${icon('arrowLeft', 'flip')}<span>${L('All requests', 'جميع الطلبات')}</span></button>
        <div class="row-sm wrap" style="margin-bottom:8px">${ui.badge(meta, meta.tone === 'navy' ? 'navy' : meta.tone, meta.icon)}${ui.status(r.status)}${ui.status(r.priority)}<span class="mu-tag" style="margin:0">${L('Demo request', 'طلب تجريبي')}</span></div>
        <h1>${esc(tx(r.title))}</h1>
        <div class="rq-meta"><span>${icon('hash')}${ui.idMono(r.id)}</span><span>${icon('user')}${esc(D.pname(r.by))}</span><span>${icon('calendar')}${B.date(r.date)}</span><span>${icon('inbox')}${tx(CH[r.channel])}</span></div>
      </div><div class="actions rq-desk">${actions}</div></div>`;

    const cmp = ui.card({
      title: L('Submitted data vs municipal record', 'البيانات المقدّمة مقابل السجل البلدي'),
      sub: dupMode ? L(`${nsame} matching field(s) suggest the same building`, `${nsame} حقل/حقول متطابقة تشير إلى المبنى نفسه`) : ndiff ? L(`${ndiff} field(s) differ`, `${ndiff} حقل/حقول مختلفة`) : L('No conflicting fields', 'لا توجد حقول متعارضة'),
      headExtra: dupMode ? (nsame ? ui.badge(L('Matches highlighted', 'التطابقات مظللة'), 'mint', 'layers') : '') : ndiff ? ui.badge(L('Changes highlighted', 'التغييرات مظللة'), 'warn', 'alert') : '',
      body: `${r.note ? `<p class="small muted" style="margin:-4px 0 14px">${tx(r.note)}</p>` : ''}<table class="rq-cmp"><thead><tr><th>${L('Field', 'الحقل')}</th><th>${cols[0]}</th><th>${cols[1]}</th></tr></thead><tbody>${rows}</tbody></table>`,
    });
    const checks = ui.card({ title: L('Automated checks', 'الفحوصات الآلية'), body: `<div class="rq-checks">${(r.checks || []).map(([s, t]) => `<div class="${s}">${icon(s === 'ok' ? 'checkCircle' : 'alert')}<span>${tx(t)}</span></div>`).join('')}</div>` });
    const att = ui.card({ title: L('Attachments', 'المرفقات'), sub: L(`${r.docs.length} files`, `${r.docs.length} ملفات`), body: ui.list(r.docs.map((d) => ui.doc(d))) });
    const mapCard = ui.card({
      cls: 'pad-0',
      body: `${B.map.render({ id: 'rq' + r.id.replace(/\D/g, ''), static: true, mode: 'verification', focus: r.building, focusW: 220, selected: r.building, height: '240px', legend: false, badge: L('Location', 'الموقع') })}
        <div style="padding:14px 16px" class="row between">
          <div style="min-width:0"><div class="strong small truncate">${b ? esc(tx(b.name)) : '—'}</div><div class="xs faint">${b ? `${ui.idMono(b.id)} · ${dName(b.district)}` : ''}</div></div>
          ${ui.btn(L('Explorer', 'المستكشف'), { size: 'sm', icon: 'map', act: 'muShowOnMap', arg: r.building })}
        </div>`,
    });
    const applicant = ui.card({ title: L('Applicant', 'مقدّم الطلب'), body: `${ui.li({ avatar: person.name, title: tx(person.name), sub: tx(CH[r.channel]) })}${ui.kv([[L('Phone', 'الهاتف'), `<span class="ltr">${esc(person.phone || `+970 59 ${100 + (hash(person.id) % 900)} ${1000 + (hash(person.id + 'x') % 9000)}`)}</span>`], [L('Email', 'البريد الإلكتروني'), person.email ? esc(person.email) : `<span class="faint">${L('Not shared', 'غير مُشارك')}</span>`], [L('BENA identity', 'هوية بينا'), ui.status('verified')]])}` });
    const timeline = ui.card({ title: L('Review timeline', 'مسار المراجعة'), body: ui.timeline(tl) });

    return `${headHtml}
      ${decided ? `<div style="margin-bottom:16px">${ ui.callout(L(`Decision recorded on ${B.date(r.decided || '2026-11-25')}: <b>${ui.statusLabel(r.status)}</b>.`, `تم تسجيل القرار في ${B.date(r.decided || '2026-11-25')}: <b>${ui.statusLabel(r.status)}</b>.`), r.status === 'approved' ? 'mint' : '', r.status === 'approved' ? 'checkCircle' : 'info')}</div>` : ''}
      <div class="grid g-main">
        <div class="stack">${cmp}${checks}${att}</div>
        <div class="stack">${mapCard}${timeline}${applicant}</div>
      </div>
      <div class="rq-mob">${actions}</div>`;
  }
  B.act.muShowOnMap = (bid) => { B.vs['mx:sel'] = bid; B.map.focus(MAPID, bid, 420); B.go(`${R}-explorer`); };
  B.act.muReopen = (id) => { const r = reqOf(id); r.status = 'underReview'; r.decided = null; (r.extra = r.extra || []).push({ date: '2026-11-25', title: T('Review reopened', 'أعيد فتح المراجعة'), who: 'p_maha' }); B.refresh(); B.toast(L('Review reopened', 'أعيد فتح المراجعة')); };
  B.act.muDecide = (arg) => {
    const [id, dec] = arg.split(':');
    const r = reqOf(id);
    const cfg = {
      approved: { t: L('Approve request', 'الموافقة على الطلب'), ok: L('Approve', 'موافقة'), kind: 'primary', ic: 'check', ph: L('Optional note to the applicant', 'ملاحظة اختيارية لمقدّم الطلب'),
        extra: r.type === 'link' || r.type === 'correction' || r.type === 'newReg' ? `<label class="check" style="margin-top:12px"><input type="checkbox" name="apply" checked><span>${r.type === 'link' ? L('Link the BENA record to the municipal GIS reference', 'ربط سجل بينا بمرجع نظم المعلومات البلدية') : r.type === 'newReg' ? L('Mark the building as verified and registered', 'اعتماد المبنى كموثّق ومسجّل') : L('Apply the submitted values to the municipal record', 'تطبيق القيم المقدّمة على السجل البلدي')}</span></label>` : '' },
      needsInfo: { t: L('Request more information', 'طلب معلومات إضافية'), ok: L('Send request', 'إرسال الطلب'), kind: 'dark', ic: 'send', ph: L('What should the applicant provide?', 'ما الذي يجب أن يقدّمه المتقدّم؟'), extra: '' },
      rejected: { t: L('Reject request', 'رفض الطلب'), ok: L('Reject', 'رفض'), kind: 'danger', ic: 'xCircle', ph: L('Reason for rejection (shared with the applicant)', 'سبب الرفض (يُرسل لمقدّم الطلب)'), extra: '' },
    }[dec];
    B.modal({ title: cfg.t, sub: `${r.id} · ${esc(tx(r.title))}`, size: 'sm', form: 'muDecision',
      body: `<input type="hidden" name="id" value="${r.id}"><input type="hidden" name="dec" value="${dec}">${ui.field({ name: 'note', label: L('Note', 'ملاحظة'), type: 'textarea', placeholder: cfg.ph, required: dec !== 'approved' })}${cfg.extra}`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(cfg.ok, { kind: cfg.kind, type: 'submit', icon: cfg.ic })}` });
  };
  B.submit.muDecision = (d) => {
    const r = reqOf(d.id);
    if (!r) return;
    r.status = d.dec;
    if (d.dec !== 'needsInfo') r.decided = '2026-11-25';
    const titles = { approved: T('Approved', 'تمت الموافقة'), needsInfo: T('Additional information requested', 'طُلبت معلومات إضافية'), rejected: T('Rejected', 'مرفوض') };
    (r.extra = r.extra || []).push({ date: '2026-11-25', title: titles[d.dec], body: d.note ? { en: d.note, ar: d.note } : null, who: 'p_maha', done: d.dec !== 'needsInfo' });
    const b = D.building(r.building);
    if (d.dec === 'approved' && d.apply && b) {
      if (r.type === 'link') { b.gis = r.gis; b.ref = r.ref; b.source = 'gis'; }
      if (r.type === 'newReg') { b.verification = 'verified'; b.status = 'registered'; }
      b.updated = '2026-11-25';
    }
    B.refresh();
    const msg = { approved: [L('Request approved', 'تمت الموافقة على الطلب'), L('The applicant has been notified and the record updated.', 'تم إشعار مقدّم الطلب وتحديث السجل.')], needsInfo: [L('Information requested', 'تم طلب المعلومات'), L('The request is paused until the applicant replies.', 'تم تعليق الطلب حتى يرد مقدّم الطلب.')], rejected: [L('Request rejected', 'تم رفض الطلب'), L('The applicant will see your reason in BENA.', 'سيرى مقدّم الطلب سبب الرفض في بينا.')] }[d.dec];
    B.success({ title: msg[0], text: msg[1], ref: r.id });
  };

  /* =================================================================
     Analytics
     ================================================================= */
  function analytics() {
    const per = B.get('an:per', '12');
    const n = per === '6' ? 6 : 12;
    const mlab = months().slice(12 - n);
    const sampleTypes = {};
    D.buildings.forEach((b) => { sampleTypes[b.type] = (sampleTypes[b.type] || 0) + 1; });
    const typeData = Object.keys(D.types).map((k) => ({ label: D.types[k], value: Math.round(((sampleTypes[k] || 0) / D.buildings.length) * C.total), color: D.types[k].color })).sort(B.by('value', -1));
    const res = typeData.find((t) => t.label === D.types.residential).value;
    const com = B.sum(typeData.filter((t) => [D.types.commercial, D.types.office, D.types.mixed].includes(t.label)), (t) => t.value);
    const byDist = D.districts.slice().sort(B.by('buildings', -1));
    const ver = cityVer();
    const sumN = B.sum(C.trend.slice(12 - n));

    const distBars = ui.card({ title: L('Buildings by district', 'المباني حسب الحي'), sub: L('Registered buildings, city-wide', 'المباني المسجّلة على مستوى المدينة'),
      body: B.charts.hbars({ data: byDist.map((d, i) => ({ label: d.name, value: d.buildings, sub: L(`${B.num(d.units)} units`, `${B.num(d.units)} وحدة`), color: i === 0 ? '#142B3B' : '#7FA7C2' })) }) });
    const types = ui.card({ title: L('Residential vs commercial', 'السكني مقابل التجاري'), sub: L('By building type (estimated from mapped sample)', 'حسب نوع المبنى (تقدير من العينة المرسومة)'),
      body: `${B.charts.donut({ data: typeData, size: 168, center: { value: B.pct(pct(res, C.total), 0), label: L('residential', 'سكني') } })}
        <div class="row between" style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line-2)"><span class="small muted">${L('Commercial, office & mixed-use', 'تجاري ومكاتب ومتعدد الاستخدامات')}</span><b>${B.num(com)}</b></div>` });
    const stacked = ui.card({ title: L('GIS-linked vs independent by district', 'المرتبطة بنظم المعلومات مقابل المستقلة حسب الحي'), sub: L('Independent records are candidates for linking', 'السجلات المستقلة مرشّحة للربط'),
      body: B.charts.bars({ labels: D.districts.map((d) => d.name), height: 240, series: [{ name: L('GIS-linked', 'مرتبطة بنظم المعلومات'), color: '#142B3B', values: D.districts.map((d) => d.gis) }, { name: L('Independent', 'مستقلة'), color: '#B9AAF0', values: D.districts.map((d) => d.buildings - d.gis) }] }) });
    const trend = ui.card({ title: L('Registration trends', 'اتجاهات التسجيل'), sub: L(`${B.num(sumN)} new registrations in ${n} months`, `${B.num(sumN)} تسجيلاً جديداً خلال ${n} أشهر`),
      headExtra: ui.seg('an:per', [{ id: '6', label: L('6 mo', '6 أشهر') }, { id: '12', label: L('12 mo', '12 شهراً') }], per),
      body: B.charts.bars({ labels: mlab, height: 220, series: [{ name: L('Via municipal GIS', 'عبر نظم المعلومات البلدية'), color: '#36D6A0', values: C.trend.slice(12 - n).map((v, i) => v - C.trendIndependent.slice(12 - n)[i]) }, { name: L('Independent submissions', 'تسجيلات مستقلة'), color: '#9B8AE0', values: C.trendIndependent.slice(12 - n) }] }) });
    const verC = ui.card({ title: L('Verification status', 'حالة التحقق'), sub: L('All registered buildings', 'جميع المباني المسجّلة'),
      body: B.charts.donut({ data: [{ label: L('Verified', 'موثّق'), value: ver.verified, color: '#36D6A0' }, { label: L('Pending verification', 'بانتظار التحقق'), value: ver.pendingVerification, color: '#F2B35A' }, { label: L('Unverified draft', 'مسودة غير موثّقة'), value: ver.unverified, color: '#C9D6DF' }], size: 168, center: { value: B.pct(pct(ver.verified, C.total), 1), label: L('verified', 'موثّق') } }) });
    const hr = B.rng(99);
    const heat = ui.card({ title: L('Registration activity by district', 'نشاط التسجيل حسب الحي'), sub: L('Relative monthly volume', 'الحجم الشهري النسبي'),
      body: `<div class="mu-heat">${D.districts.map((d) => `<span class="hl">${tx(d.name)}</span>${B.charts.heat({ cols: 12, values: Array.from({ length: 12 }, (_, i) => Math.min(1, (0.25 + (i / 14)) * (0.6 + hr() * 0.7) * ((d.buildings - d.gis) / 600 + 0.4))), color: '#0B8A60' })}`).join('')}
        <span></span><div class="mx">${months().map((m) => `<span>${m}</span>`).join('')}</div></div>` });

    return `${head({ title: L('Analytics', 'التحليلات'), sub: L('Coverage, categories and registration trends for the municipal building registry.', 'التغطية والفئات واتجاهات التسجيل في سجل المباني البلدي.'),
      actions: ui.btn(L('Download PDF', 'تنزيل PDF'), { icon: 'download', act: 'soon', arg: L('PDF report', 'تقرير PDF') }) })}
      <div class="stack-lg">
        <div class="card pad-0"><div class="mu-strip">
          <div><span>${L('Coverage (GIS-linked)', 'التغطية (مرتبطة بنظم المعلومات)')}</span><b>${B.pct(pct(C.gis, C.total), 1)}</b><small>${L('+0.6 pts this quarter', '+0.6 نقطة هذا الربع')}</small></div>
          <div><span>${L('Avg. units per building', 'متوسط الوحدات لكل مبنى')}</span><b>${B.num1(C.units / C.total)}</b><small>${L('City-wide', 'على مستوى المدينة')}</small></div>
          <div><span>${L('Independent share', 'نسبة السجلات المستقلة')}</span><b>${B.pct(pct(C.independent, C.total), 1)}</b><small>${L('Highest: Batn Al-Hawa', 'الأعلى: بطن الهوا')}</small></div>
          <div><span>${L('Verified', 'موثّق')}</span><b>${B.pct(pct(ver.verified, C.total), 1)}</b><small>${L(`${B.num(C.pending)} pending`, `${B.num(C.pending)} بانتظار التحقق`)}</small></div>
        </div></div>
        <div class="grid g-main">${trend}${verC}</div>
        ${stacked}
        <div class="grid g2">${distBars}${types}</div>
        ${heat}
      </div>`;
  }

  /* =================================================================
     Data sources & sync (municipality settings)
     ================================================================= */
  const LAYERS = [
    { id: 'fp', icon: 'building', name: T('Building footprints', 'مساقط المباني'), feed: 'WFS · buildings_2026', features: 12417, last: '2026-11-25 06:00', status: 'synced', auto: true },
    { id: 'pc', icon: 'grid', name: T('Basins & parcels', 'الأحواض والقطع'), feed: 'WFS · cadastre', features: 18904, last: '2026-11-25 06:05', status: 'synced', auto: true },
    { id: 'ad', icon: 'pin', name: T('Address points', 'نقاط العناوين'), feed: 'REST · addressing/v2', features: 15230, last: '2026-11-25 09:40', status: 'syncing', auto: true },
    { id: 'st', icon: 'route', name: T('Street centrelines', 'محاور الشوارع'), feed: 'WFS · streets', features: 1288, last: '2026-11-24 22:00', status: 'synced', auto: true },
    { id: 'zn', icon: 'layers', name: T('Zoning & heritage zones', 'التنظيم والمناطق التراثية'), feed: 'WMS · planning (read-only)', features: 214, last: '2026-11-18 03:00', status: 'delayed', auto: false },
    { id: 'bp', icon: 'doc', name: T('Building permits', 'رخص البناء'), feed: 'CSV drop · permits_export', features: 6402, last: '2026-11-21 23:10', status: 'syncError', auto: true },
  ];
  B.act.muSync = (id) => {
    const l = LAYERS.find((x) => x.id === id);
    if (l) { l.status = 'synced'; l.last = '2026-11-25 10:02'; }
    B.refresh(); B.toast(L(`${l ? tx(l.name) : 'Layer'} synced (simulated)`, `تمت مزامنة ${l ? tx(l.name) : 'الطبقة'} (محاكاة)`));
  };
  B.act.muSyncAll = () => { LAYERS.forEach((l) => { l.status = 'synced'; l.last = '2026-11-25 10:02'; }); B.refresh(); B.toast(L('All layers synced (simulated)', 'تمت مزامنة جميع الطبقات (محاكاة)')); };
  function data() {
    const ok = LAYERS.filter((l) => l.status === 'synced').length;
    const layers = LAYERS.map((l) => `<div class="ds-layer"><span class="li-icon ${l.status === 'syncError' ? 'bad' : l.status === 'delayed' ? 'warn' : 'navy'}">${icon(l.icon)}</span>
      <div style="min-width:0"><b>${tx(l.name)}</b><small><span class="id-mono" style="font-size:11.5px;color:var(--text-2)">${esc(l.feed)}</span> · ${B.num(l.features)} ${L('features', 'معلم')} · ${L('last sync', 'آخر مزامنة')} ${B.dateShort(l.last.slice(0, 10))} <span class="ltr">${esc(l.last.slice(11))}</span></small></div>
      <div class="ds-end">${ui.status(l.status)}${ui.btn('', { size: 'sm', icon: 'refresh', act: 'muSync', arg: l.id, title: L('Sync now', 'مزامنة الآن') })}<label class="switch" title="${esc(L('Automatic sync', 'مزامنة تلقائية'))}"><input type="checkbox" data-model="ds:auto:${l.id}" data-norender ${B.get('ds:auto:' + l.id, l.auto) ? 'checked' : ''}><i></i></label></div></div>`).join('');
    const indep = D.districts.map((d) => `<div class="ds-row"><div><b>${tx(d.name)}</b><small>${L(`${B.num(d.buildings - d.gis)} independent records`, `${B.num(d.buildings - d.gis)} سجل مستقل`)}</small></div><label class="switch"><input type="checkbox" data-model="ds:ind:${d.id}" data-norender ${B.get('ds:ind:' + d.id, d.id !== 'oldcity') ? 'checked' : ''}><i></i></label></div>`).join('');
    return `${head({ title: L('Data sources & sync', 'مصادر البيانات والمزامنة'), sub: L('Municipal GIS layers connected to BENA and how independent submissions are handled.', 'طبقات نظم المعلومات البلدية المرتبطة ببينا وكيفية التعامل مع التسجيلات المستقلة.'),
      actions: ui.btn(L('Sync all layers', 'مزامنة جميع الطبقات'), { kind: 'primary', icon: 'refresh', act: 'muSyncAll' }) })}
      <div class="stack-lg">
        ${ui.simRibbon(L('Simulated integration — no connection to any real municipal GIS server.', 'تكامل محاكى — لا يوجد اتصال بأي خادم نظم معلومات بلدي حقيقي.'))}
        <div class="grid g-main">
          <div class="stack">${ui.card({ title: L('GIS layers', 'طبقات نظم المعلومات'), sub: L(`${ok} of ${LAYERS.length} layers up to date`, `${ok} من ${LAYERS.length} طبقات محدّثة`), body: layers })}
          ${ui.card({ title: L('Sync activity', 'نشاط المزامنة'), sub: L('Features changed per day, last 14 days', 'المعالم المتغيّرة يومياً خلال آخر 14 يوماً'),
            body: B.charts.bars({ labels: Array.from({ length: 14 }, (_, i) => String(12 + i)), height: 150, series: [{ name: L('Updated', 'مُحدّث'), color: '#7FA7C2', values: [180, 142, 96, 210, 188, 64, 40, 230, 176, 158, 201, 122, 90, 214] }, { name: L('Added', 'مُضاف'), color: '#36D6A0', values: [12, 9, 4, 18, 11, 2, 1, 21, 14, 8, 16, 7, 5, 19] }] })
              + `<div class="divider" style="margin:16px 0 4px"></div>` + ui.list([
                ui.li({ icon: 'check', tone: 'mint', title: L('Footprints: 214 updated, 19 added', 'المساقط: تحديث 214 وإضافة 19'), sub: L('Today 06:00 · automatic', 'اليوم 06:00 · تلقائي') }),
                ui.li({ icon: 'alertCircle', tone: 'bad', title: L('Building permits: file could not be parsed', 'رخص البناء: تعذرت قراءة الملف'), sub: L('21 Nov 23:10 · column “permit_no” missing', '21 تشرين الثاني 23:10 · العمود «permit_no» مفقود'), act: 'muSync', arg: 'bp', end: `<span class="xs mint-ink strong">${L('Retry', 'إعادة المحاولة')}</span>` }),
                ui.li({ icon: 'clock', tone: 'warn', title: L('Zoning layer: source not updated since 18 Nov', 'طبقة التنظيم: لم يُحدَّث المصدر منذ 18 تشرين الثاني'), sub: L('Planning department publishes weekly', 'تنشر دائرة التخطيط أسبوعياً') }),
              ]) })}</div>
          <div class="stack">
            ${ui.card({ title: L('Sync schedule', 'جدول المزامنة'), body: `<div class="stack">
              ${ui.field({ name: 'freq', label: L('Footprint sync frequency', 'تكرار مزامنة المساقط'), type: 'select', value: 'daily', options: [{ v: 'hourly', l: L('Every hour', 'كل ساعة') }, { v: 'daily', l: L('Daily at 06:00', 'يومياً الساعة 06:00') }, { v: 'weekly', l: L('Weekly (Sunday)', 'أسبوعياً (الأحد)') }] })}
              ${ui.field({ name: 'conflict', label: L('When records conflict', 'عند تعارض السجلات'), type: 'select', value: 'review', options: [{ v: 'review', l: L('Send to review inbox', 'إرسال لصندوق المراجعة') }, { v: 'gis', l: L('Municipal GIS wins', 'الأولوية لنظم المعلومات البلدية') }] })}
              ${ui.field({ name: 'mail', label: L('Sync alerts to', 'إرسال تنبيهات المزامنة إلى'), type: 'email', value: 'gis.office@ramallah-demo.example' })}
              ${ui.btn(L('Save settings', 'حفظ الإعدادات'), { kind: 'dark', icon: 'check', act: 'toast', arg: L('Settings saved (demo)', 'تم حفظ الإعدادات (تجريبي)') })}</div>` })}
            ${ui.card({ title: L('Independent registration', 'التسجيل المستقل'), sub: L('Allow owners to register buildings without a GIS record', 'السماح للمالكين بتسجيل مبانٍ دون سجل في نظم المعلومات'), body: indep })}
          </div>
        </div>
      </div>`;
  }

  /* =================================================================
     Role registration
     ================================================================= */
  B.role({
    id: R, icon: 'landmark', nav: 'drawer',
    name: { en: 'Municipality', ar: 'البلدية' }, short: { en: 'Municipality', ar: 'البلدية' },
    org: { en: 'Ramallah Municipality', ar: 'بلدية رام الله' },
    tag: { en: 'GIS & registry', ar: 'نظم المعلومات والسجل' },
    desc: { en: 'Building registry, GIS explorer, registration review and coverage analytics.', ar: 'سجل المباني ومستكشف الخرائط ومراجعة طلبات التسجيل وتحليلات التغطية.' },
    personaTitle: { en: 'Eng. Maha Awad · GIS unit', ar: 'م. مها عوض · وحدة نظم المعلومات' },
    home: 'home',
    menu: [
      { group: { en: 'Overview', ar: 'نظرة عامة' } },
      { id: 'home', label: { en: 'Dashboard', ar: 'لوحة المتابعة' }, icon: 'grid' },
      { id: 'analytics', label: { en: 'Analytics', ar: 'التحليلات' }, icon: 'chart' },
      { group: { en: 'Registry', ar: 'السجل' } },
      { id: 'explorer', label: { en: 'GIS Explorer', ar: 'المستكشف الجغرافي' }, icon: 'map' },
      { id: 'registry', label: { en: 'Building Registry', ar: 'سجل المباني' }, icon: 'building', match: ['building'] },
      { id: 'requests', label: { en: 'Registration Requests', ar: 'طلبات التسجيل' }, icon: 'inbox', match: ['request'], get count() { return openCount(); } },
      { group: { en: 'Settings', ar: 'الإعدادات' } },
      { id: 'data', label: { en: 'Data sources & sync', ar: 'مصادر البيانات والمزامنة' }, icon: 'database' },
    ],
    pages: Object.fromEntries(Object.entries({ home, explorer, registry, requests, request: requestDetail, analytics, data }).map(([k, f]) => [k, (id) => `<div class="mu">${f(id)}</div>`])),
    notifications: () => [
      { icon: 'inbox', tone: 'mint', title: L('New registration request RR-2026-0418', 'طلب تسجيل جديد RR-2026-0418'), sub: L('New residential building in Batn Al-Hawa', 'مبنى سكني جديد في بطن الهوا'), when: L('Yesterday', 'أمس'), go: `${R}-request-RR-2026-0418` },
      { icon: 'link', tone: 'navy', title: L('Link request for Old Town Stone House', 'طلب ربط للبيت الحجري في البلدة القديمة'), sub: L('Footprint match 94% — ready for review', 'تطابق المسقط 94% — جاهز للمراجعة'), when: L('3 days ago', 'قبل 3 أيام'), go: `${R}-request-RR-2026-0416` },
      { icon: 'refresh', tone: 'info', title: L('Footprint layer synced', 'تمت مزامنة طبقة المساقط'), sub: L('214 features updated at 06:00', 'تم تحديث 214 معلماً الساعة 06:00'), when: L('Today', 'اليوم'), go: `${R}-data` },
      { icon: 'alert', tone: 'warn', title: L('Building permits feed failed', 'فشلت مزامنة رخص البناء'), sub: L('CSV drop could not be parsed — check the export', 'تعذرت قراءة ملف CSV — تحقق من التصدير'), when: L('4 days ago', 'قبل 4 أيام'), go: `${R}-data` },
    ],
  });
})();
