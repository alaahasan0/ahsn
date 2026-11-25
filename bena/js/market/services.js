/*
 * BENA services marketplace — shared pages reachable from every role.
 *   <role>-services[-<categoryId>]      marketplace home / category
 *   <role>-provider-<providerId>        provider profile
 *   <role>-servicedetail-<pid>~<index>  service details
 *   <role>-quotes[-<requestId>]         quotation comparison
 *   <role>-servicehistory               current persona's service history
 * Shared helpers live on B.mkt (also used by property.js and roles/provider.js).
 * All providers, prices, reviews and quotes are fictional demo data.
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon, ui } = B;
  const D = B.data;
  const T = (en, ar) => ({ en, ar });
  const M = (B.mkt = B.mkt || {});
  const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
  M.hash = hash;
  const R = () => B.route.role;

  /* ---------------- statuses used by the marketplaces ---------------- */
  Object.assign(B.statuses, {
    enroute: { en: 'En route', ar: 'في الطريق', tone: 'info', icon: 'truck' },
    quoteSent: { en: 'Quote sent', ar: 'تم إرسال العرض', tone: 'violet' },
    collecting: { en: 'Collecting quotes', ar: 'بانتظار العروض', tone: 'info', icon: 'clock' },
    awaitingQuote: { en: 'Awaiting quote', ar: 'بانتظار التسعير', tone: 'mint' },
    forRent: { en: 'For rent', ar: 'للإيجار', tone: 'navy' },
    forSale: { en: 'For sale', ar: 'للبيع', tone: 'violet' },
    needsReply: { en: 'Needs reply', ar: 'بحاجة لرد', tone: 'warn' },
    replied: { en: 'Replied', ar: 'تم الرد', tone: 'ok', icon: 'check' },
  });

  /* ---------------- extra demo providers (thin categories get alternatives) ---------------- */
  const EXTRA = [
    { id: 'sp_ascend', name: T('Ascend Lift Services', 'أسند لخدمات المصاعد'), cats: ['elevators'], rating: 4.6, reviews: 71, jobs: 380, since: 2016, areas: ['masyoun', 'tireh', 'einmunjed', 'manara', 'irsal'], response: T('Same day', 'في نفس اليوم'), verified: true, tagline: T('Modernisation, safety gear and monthly contracts', 'التحديث ومعدات السلامة والعقود الشهرية') },
    { id: 'sp_nadeef', name: T('Nadeef Pro Cleaning', 'نظيف برو للتنظيف'), cats: ['cleaning'], rating: 4.5, reviews: 203, jobs: 1460, since: 2018, areas: ['masyoun', 'tireh', 'einmunjed', 'oldcity'], response: T('~4 hrs', '~4 ساعات'), verified: true, tagline: T('Apartments, offices and post-renovation cleaning', 'تنظيف الشقق والمكاتب وما بعد الترميم') },
    { id: 'sp_watch', name: T('Watchpoint Systems', 'ووتش بوينت للأنظمة'), cats: ['security'], rating: 4.6, reviews: 44, jobs: 150, since: 2019, areas: ['masyoun', 'tireh', 'maahid', 'einmunjed'], response: T('Next day', 'اليوم التالي'), verified: true, tagline: T('CCTV, intercoms and smart access', 'كاميرات واتصال داخلي ودخول ذكي') },
    { id: 'sp_ein', name: T('Ein Water Care', 'عين للعناية بالمياه'), cats: ['tanks'], rating: 4.4, reviews: 92, jobs: 540, since: 2015, areas: ['masyoun', 'manara', 'irsal', 'maahid', 'einmunjed'], response: T('Same day', 'في نفس اليوم'), verified: true, tagline: T('Tank hygiene, filters and water testing', 'نظافة الخزانات والفلاتر وفحص المياه') },
    { id: 'sp_green', name: T('GreenGuard Pest Control', 'غرين غارد لمكافحة الحشرات'), cats: ['pest'], rating: 4.6, reviews: 118, jobs: 690, since: 2014, areas: ['masyoun', 'tireh', 'einmunjed', 'batnalhawa', 'maahid'], response: T('Same day', 'في نفس اليوم'), verified: true, tagline: T('Family-safe treatments with a 90-day guarantee', 'معالجات آمنة للعائلات مع ضمان 90 يوماً') },
  ];
  M.providers = () => D.providers.concat(EXTRA);
  M.provider = (id) => M.providers().find((p) => p.id === id);

  /* ---------------- service catalogue ---------------- */
  const UNITS = {
    visit: T('/ visit', '/ زيارة'), month: T('/ month', '/ شهرياً'), hour: T('/ hour', '/ ساعة'), m2: T('/ m²', '/ م²'), unit: T('/ unit', '/ وحدة'),
    point: T('/ point', '/ نقطة'), tank: T('/ tank', '/ خزان'), car: T('/ car · month', '/ مصعد شهرياً'), post: T('/ post · month', '/ نقطة شهرياً'), job: T('/ job', '/ مهمة'),
  };
  const S = (en, ar, price, unit, dur, den, dar) => ({ name: T(en, ar), price, unit, dur, d: T(den, dar) });
  const CATALOG = {
    plumbing: [
      S('Leak detection & repair', 'كشف التسريبات وإصلاحها', 150, 'visit', T('1–2 hrs', '1–2 ساعة'), 'Find and fix leaks in pipes, traps, taps and under-sink drains.', 'تحديد وإصلاح التسريبات في الأنابيب والسيفونات والحنفيات وتصريف المغاسل.'),
      S('Drain unclogging', 'فتح انسداد المجاري', 120, 'visit', T('~1 hr', '~ساعة'), 'Kitchen, bathroom and floor drains cleared with a mechanical snake.', 'فتح مصارف المطبخ والحمّام والأرضيات باستخدام النابض الميكانيكي.'),
      S('Water heater installation', 'تركيب سخان مياه', 350, 'job', T('2–3 hrs', '2–3 ساعات'), 'Electric or solar-assisted heaters, including valves and testing.', 'سخانات كهربائية أو مدعومة بالطاقة الشمسية مع الصمامات والفحص.'),
      S('Booster pump service', 'صيانة مضخة الضغط', 280, 'visit', T('2 hrs', 'ساعتان'), 'Pressure switch, bearings and noise diagnosis for building pumps.', 'فحص مفتاح الضغط والمحامل وتشخيص الضجيج لمضخات المباني.'),
    ],
    electrical: [
      S('Electrical fault finding', 'تشخيص الأعطال الكهربائية', 120, 'visit', T('~1 hr', '~ساعة'), 'Tripping breakers, dead sockets and lighting faults traced and fixed.', 'تتبّع وإصلاح فصل القواطع والمقابس المعطلة وأعطال الإنارة.'),
      S('Socket & fixture installation', 'تركيب مقابس ووحدات إنارة', 90, 'point', T('30 min / point', '30 دقيقة / نقطة'), 'New sockets, switches, pendants and LED panels.', 'مقابس ومفاتيح جديدة وثريات وألواح LED.'),
      S('Distribution panel inspection', 'فحص لوحة التوزيع', 300, 'visit', T('2–3 hrs', '2–3 ساعات'), 'Thermal check, torque test and labelling for building panels.', 'فحص حراري واختبار الشد ووضع ملصقات للوحات المبنى.'),
      S('Generator service', 'صيانة المولد', 450, 'visit', T('3 hrs', '3 ساعات'), 'Oil, filters, battery and load test for backup generators.', 'تغيير الزيت والفلاتر وفحص البطارية واختبار الحِمل للمولدات الاحتياطية.'),
    ],
    hvac: [
      S('Split AC service', 'صيانة مكيف سبليت', 150, 'unit', T('45 min / unit', '45 دقيقة / وحدة'), 'Filter clean, coil wash, drain check and gas pressure reading.', 'تنظيف الفلتر وغسل الملف وفحص التصريف وقراءة ضغط الغاز.'),
      S('AC installation', 'تركيب مكيف', 450, 'unit', T('3–4 hrs', '3–4 ساعات'), 'Wall-mounted split units with up to 3 m of piping and bracket.', 'تركيب وحدات سبليت جدارية مع حتى 3 أمتار من الأنابيب والقاعدة.'),
      S('Central system maintenance', 'صيانة النظام المركزي', 1200, 'visit', T('Half day', 'نصف يوم'), 'Chillers, VAV boxes and ventilation for offices and towers.', 'المبرّدات ووحدات التهوية المتغيرة للمكاتب والأبراج.'),
    ],
    general: [
      S('Handyman hour', 'ساعة صيانة عامة', 80, 'hour', T('Min. 2 hrs', 'حد أدنى ساعتان'), 'Hanging, assembling, sealing and small repairs around the home.', 'تعليق وتركيب وعزل وإصلاحات صغيرة في المنزل.'),
      S('Interior painting', 'دهان داخلي', 22, 'm2', T('2–4 days / unit', '2–4 أيام / وحدة'), 'Two coats of washable paint, including minor crack filling.', 'طبقتان من الدهان القابل للغسل مع معالجة الشقوق البسيطة.'),
      S('Door & lock repair', 'إصلاح الأبواب والأقفال', 110, 'visit', T('~1 hr', '~ساعة'), 'Hinges, handles, cylinders and alignment.', 'المفصلات والمقابض والأسطوانات وضبط المحاذاة.'),
    ],
    cleaning: [
      S('Common-area cleaning contract', 'عقد تنظيف المناطق المشتركة', 1800, 'month', T('Weekly visits', 'زيارات أسبوعية'), 'Stairs, lobby, elevators, parking and bins — weekly schedule.', 'الدرج والردهة والمصاعد والموقف والحاويات — جدول أسبوعي.'),
      S('Apartment deep clean', 'تنظيف عميق للشقة', 450, 'job', T('5–6 hrs', '5–6 ساعات'), 'Kitchen degreasing, bathrooms, windows and floors.', 'إزالة الدهون في المطبخ والحمّامات والنوافذ والأرضيات.'),
      S('Post-renovation cleaning', 'تنظيف ما بعد الترميم', 650, 'job', T('1 day', 'يوم واحد'), 'Dust, paint spots and debris removal after works.', 'إزالة الغبار وبقع الدهان والمخلفات بعد الأعمال.'),
      S('Window & facade washing', 'غسيل النوافذ والواجهات', 900, 'job', T('1 day', 'يوم واحد'), 'Rope-access or lift washing of glass and stone.', 'غسيل الزجاج والحجر بالحبال أو الرافعة.'),
    ],
    elevators: [
      S('Monthly maintenance contract', 'عقد صيانة شهري', 850, 'car', T('Monthly visit', 'زيارة شهرية'), 'Lubrication, door adjustment, safety test and 24/7 callouts.', 'التزييت وضبط الأبواب واختبار السلامة واستدعاءات الطوارئ 24/7.'),
      S('Annual certification inspection', 'فحص الترخيص السنوي', 1400, 'car', T('Half day', 'نصف يوم'), 'Load test and documentation for the annual safety certificate.', 'اختبار الحِمل وتوثيق شهادة السلامة السنوية.'),
      S('Emergency callout', 'استدعاء طارئ', 350, 'visit', T('Within 2 hrs', 'خلال ساعتين'), 'Trapped passengers, stuck cars and door faults.', 'احتجاز ركاب أو توقف المصعد أو أعطال الأبواب.'),
    ],
    pest: [
      S('General pest treatment', 'معالجة عامة للحشرات', 220, 'unit', T('1 hr', 'ساعة'), 'Ants, cockroaches and spiders with low-odour gel and spray.', 'النمل والصراصير والعناكب بجل ورذاذ منخفض الرائحة.'),
      S('Rodent control programme', 'برنامج مكافحة القوارض', 380, 'month', T('3 visits', '3 زيارات'), 'Bait stations, sealing entry points and monitoring.', 'محطات طُعم وإغلاق نقاط الدخول والمتابعة.'),
      S('Common-area treatment', 'معالجة المناطق المشتركة', 600, 'job', T('Half day', 'نصف يوم'), 'Stairs, basements, bins and gardens for a whole building.', 'الدرج والطوابق السفلية والحاويات والحدائق لمبنى كامل.'),
    ],
    security: [
      S('Guard service', 'خدمة الحراسة', 2400, 'post', T('12-hr shifts', 'مناوبات 12 ساعة'), 'Licensed guards for lobbies and parking.', 'حراس مرخّصون للردهات والمواقف.'),
      S('CCTV installation', 'تركيب كاميرات مراقبة', 3500, 'job', T('1–2 days', '1–2 يوم'), '8 HD cameras, recorder and phone viewing.', '8 كاميرات عالية الدقة وجهاز تسجيل ومشاهدة عبر الهاتف.'),
      S('Access control & intercom', 'نظام الدخول والاتصال الداخلي', 2800, 'job', T('1 day', 'يوم واحد'), 'Card or PIN entry with video intercom per unit.', 'دخول بالبطاقة أو الرمز مع اتصال مرئي لكل وحدة.'),
    ],
    tanks: [
      S('Tank cleaning & sterilisation', 'تنظيف وتعقيم الخزانات', 180, 'tank', T('~45 min / tank', '~45 دقيقة / خزان'), 'Drain, scrub, chlorinate and rinse rooftop tanks.', 'تفريغ وفرك وتعقيم بالكلور وشطف خزانات الأسطح.'),
      S('Tank replacement', 'استبدال خزان', 950, 'tank', T('3 hrs', '3 ساعات'), '2 m³ polyethylene tank incl. fittings and float valve.', 'خزان بولي إيثيلين 2 م³ مع الوصلات والعوّامة.'),
      S('Pump installation', 'تركيب مضخة', 700, 'job', T('3–4 hrs', '3–4 ساعات'), 'Booster or transfer pumps with pressure vessel.', 'مضخات ضغط أو نقل مع خزان ضغط.'),
    ],
  };
  const INCLUDES = {
    plumbing: [T('On-site diagnosis', 'التشخيص في الموقع'), T('Standard fittings & sealant', 'الوصلات القياسية ومواد العزل'), T('Pressure test after repair', 'اختبار الضغط بعد الإصلاح'), T('Clean-up of the work area', 'تنظيف منطقة العمل')],
    electrical: [T('Safety isolation & testing', 'عزل وفحص السلامة'), T('Standard cables & connectors', 'الكوابل والموصلات القياسية'), T('Labelled breakers', 'قواطع مُعلّمة'), T('Photo report in BENA', 'تقرير مصوّر في بينا')],
    hvac: [T('Filter and coil cleaning', 'تنظيف الفلتر والملف'), T('Drain line flush', 'تنظيف خط التصريف'), T('Refrigerant pressure check', 'فحص ضغط غاز التبريد'), T('Performance reading', 'قراءة الأداء')],
    general: [T('Tools and consumables', 'العدد والمواد الاستهلاكية'), T('Furniture protection', 'حماية الأثاث'), T('Debris removal', 'إزالة المخلفات'), T('Photo report in BENA', 'تقرير مصوّر في بينا')],
    cleaning: [T('Eco-certified products', 'مواد صديقة للبيئة'), T('Equipment and ladders', 'المعدات والسلالم'), T('Supervisor check', 'تدقيق المشرف'), T('Waste disposal', 'التخلص من النفايات')],
    elevators: [T('Licensed technician', 'فني مرخّص'), T('Safety circuit test', 'اختبار دائرة السلامة'), T('Logbook entry', 'تسجيل في السجل'), T('Report shared with the committee', 'تقرير يُشارك مع اللجنة')],
    pest: [T('Licensed materials', 'مواد مرخّصة'), T('Pet & child safety briefing', 'إرشادات سلامة الأطفال والحيوانات'), T('Follow-up visit', 'زيارة متابعة'), T('Treatment certificate', 'شهادة معالجة')],
    security: [T('Site survey', 'مسح الموقع'), T('Installation & cabling', 'التركيب والتمديدات'), T('User training', 'تدريب المستخدمين'), T('12-month support', 'دعم لمدة 12 شهراً')],
    tanks: [T('Drain and refill', 'التفريغ والتعبئة'), T('Food-grade chlorination', 'تعقيم بالكلور الآمن'), T('Lid & float check', 'فحص الغطاء والعوامة'), T('Hygiene certificate', 'شهادة نظافة')],
  };
  const EXCLUDES = [T('Major spare parts (quoted separately)', 'قطع الغيار الرئيسية (تُسعّر منفصلة)'), T('Structural or civil works', 'الأعمال الإنشائية أو المدنية')];
  const factor = (p) => (p.id === 'sp_jaber' ? 1 : 0.9 + (hash(p.id) % 26) / 100);
  /** Flattened service list for a provider: [{i, cat, name, price, unit, dur, d}] */
  M.services = (pid) => {
    const p = M.provider(pid);
    if (!p) return [];
    const out = [];
    p.cats.forEach((c) => (CATALOG[c] || []).forEach((s) => out.push({ ...s, i: out.length, cat: c, pid, price: Math.max(10, Math.round((s.price * factor(p)) / 5) * 5) })));
    return out;
  };
  M.fromPrice = (pid) => Math.min(...M.services(pid).filter((s) => s.unit !== 'm2').map((s) => s.price));
  M.unitLabel = (u) => tx(UNITS[u] || '');

  /* ---------------- reviews ---------------- */
  const RV_TEXT = [
    [5, T('Arrived on time, explained the problem clearly and left everything clean.', 'وصل في الموعد، وشرح المشكلة بوضوح وترك المكان نظيفاً.')],
    [5, T('Fair price — the quote matched the final invoice exactly.', 'سعر عادل — تطابق العرض مع الفاتورة النهائية تماماً.')],
    [5, T('Booked through BENA in the morning, fixed by the afternoon.', 'حجزت عبر بينا صباحاً وتم الإصلاح بعد الظهر.')],
    [4, T('Good work overall, but the visit was rescheduled once.', 'عمل جيد بشكل عام، لكن تم تأجيل الزيارة مرة واحدة.')],
    [5, T('Professional team. They coordinated roof access with our committee.', 'فريق محترف. نسّقوا الوصول إلى السطح مع لجنة المبنى.')],
    [5, T('Very tidy — shoe covers on and the floor protected the whole time.', 'مرتّبون جداً — ارتدوا أغطية الأحذية وحموا الأرضية طوال الوقت.')],
    [4, T('They sent photos of the finished work and a clear receipt.', 'أرسلوا صوراً للعمل المنجز وإيصالاً واضحاً.')],
    [3, T('Took longer than estimated, but the result is solid.', 'استغرق وقتاً أطول من المتوقع، لكن النتيجة متينة.')],
  ];
  const RV_POOL = ['p_nadia', 'p_ibrahim', 'p_layla', 'p_majd', 'p_sireen', 'p_hani', 'p_ruba', 'p_basel', 'p_yara', 'p_ahmad', 'p_dima', 'p_karim', 'p_reem', 'p_suha', 'p_jamil', 'p_noor', 'p_walid', 'p_amal'];
  const JABER_REVIEWS = [
    { id: 'RV-9012', by: 'p_lina', stars: 5, date: '2026-10-31', cat: 'electrical', bid: 'BN-RAM-00142', job: 'MR-24211', text: T('Ali found a loose neutral in the balcony fixture within minutes. Clear explanation and a tidy job.', 'وجد علي سلكاً محايداً مفكوكاً في إنارة الشرفة خلال دقائق. شرح واضح وعمل مرتّب.'), reply: T('Thank you Lina — glad the balcony is lit again!', 'شكراً لينا — سعداء بعودة الإنارة إلى الشرفة!') },
    { id: 'RV-9007', by: 'p_layla', stars: 5, date: '2026-11-18', cat: 'plumbing', bid: 'BN-RAM-00203', text: T('Diagnosed the noisy booster pump on the first visit and shared a written plan with the owners.', 'شخّصوا ضجيج مضخة الضغط من الزيارة الأولى وشاركوا خطة مكتوبة مع المالكين.') },
    { id: 'RV-8994', by: 'p_rania', stars: 5, date: '2026-11-12', cat: 'electrical', bid: 'BN-RAM-00415', text: T('Reliable partner for our managed buildings. Reports arrive in BENA the same day.', 'شريك موثوق للمباني التي نديرها. تصل التقارير إلى بينا في نفس اليوم.'), reply: T('Always a pleasure working with the Arkan team.', 'دائماً من دواعي سرورنا العمل مع فريق أركان.') },
    { id: 'RV-8981', by: 'p_karim', stars: 4, date: '2026-11-06', cat: 'hvac', bid: 'BN-RAM-00311', text: T('AC drain fixed properly. Would have liked an earlier time slot.', 'تم إصلاح تصريف المكيف بشكل صحيح. كنت أفضّل موعداً أبكر.') },
    { id: 'RV-8966', by: 'p_khaled', stars: 5, date: '2026-09-20', cat: 'general', bid: 'BN-RAM-00142', text: T('Prepared unit 1102 for a new tenant in two days — sockets, doors and silicone all redone.', 'جهّزوا الوحدة 1102 لمستأجر جديد خلال يومين — المقابس والأبواب والسيليكون كلها جُدّدت.'), reply: T('Thanks Khaled, good luck with the new tenancy.', 'شكراً خالد، بالتوفيق مع المستأجر الجديد.') },
    { id: 'RV-8952', by: 'p_ibrahim', stars: 3, date: '2026-11-21', cat: 'plumbing', bid: 'BN-RAM-00087', text: T('The leak is fixed but the technician arrived 40 minutes late without calling.', 'تم إصلاح التسريب لكن الفني تأخر 40 دقيقة دون اتصال.') },
    { id: 'RV-8940', by: 'p_hiba', stars: 5, date: '2026-08-30', cat: 'electrical', bid: 'BN-RAM-00142', text: T('Replaced the stairwell timers on all 14 floors — quick and quiet.', 'استبدلوا مؤقتات الدرج في جميع الطوابق الـ14 — بسرعة وهدوء.') },
    { id: 'RV-8933', by: 'p_tariq', stars: 4, date: '2026-11-23', cat: 'hvac', bid: 'BN-RAM-00142', text: T('Serviced two split units. Good value; one filter needs ordering.', 'صيانة وحدتي سبليت. قيمة جيدة؛ أحد الفلاتر بحاجة لطلب.') },
  ];
  const rvCache = {};
  M.reviews = (pid) => {
    if (pid === 'sp_jaber') return JABER_REVIEWS;
    if (rvCache[pid]) return rvCache[pid];
    const p = M.provider(pid);
    const r = B.rng(hash(pid));
    const list = [];
    for (let i = 0; i < 6; i++) {
      const [stars, text] = RV_TEXT[(Math.floor(r() * RV_TEXT.length) + i) % RV_TEXT.length];
      const d = new Date(2026, 10, 24 - Math.floor(i * 9 + r() * 8));
      list.push({ id: `RV-${pid.slice(3, 6).toUpperCase()}${i}`, by: RV_POOL[Math.floor(r() * RV_POOL.length)], stars: p && p.rating < 4.4 && i === 2 ? 3 : stars, date: d.toISOString().slice(0, 10), cat: p ? p.cats[i % p.cats.length] : 'general', bid: D.keyBuildings[Math.floor(r() * D.keyBuildings.length)].id, text });
    }
    return (rvCache[pid] = list);
  };
  /** Rating distribution [5★..1★] summing to p.reviews */
  M.dist = (pid) => {
    const p = M.provider(pid);
    if (pid === 'sp_jaber') return [182, 24, 5, 2, 1];
    const n = p.reviews, r = p.rating;
    const f5 = Math.max(0.35, Math.min(0.92, (r - 3.6) / 1.4));
    const a = Math.round(n * f5), b = Math.round(n * (1 - f5) * 0.62), c = Math.round(n * (1 - f5) * 0.24), d = Math.round(n * (1 - f5) * 0.09);
    return [a, b, c, d, Math.max(0, n - a - b - c - d)];
  };
  M.replies = M.replies || {};

  /* ---------------- persona context ---------------- */
  /** Places the signed-in persona can request services for: [{bid, unit|null}] */
  M.ctx = () => {
    const role = R();
    const me = D.me[role];
    let places = [];
    if (role === 'resident') places = [{ bid: 'BN-RAM-00142', unit: 'BN-RAM-00142-803' }];
    else if (role === 'owner') {
      const order = { vacant: 0, ownerOccupied: 1, maintenance: 2, rented: 3 };
      places = D.units.filter((u) => u.owner === me || (u.coOwners || []).includes(me)).sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9)).map((u) => ({ bid: u.building, unit: u.id }));
    } else if (role === 'committee') places = [{ bid: 'BN-RAM-00142', unit: null }];
    else if (role === 'manager') places = D.keyBuildings.filter((b) => b.manager === 'org_arkan').map((b) => ({ bid: b.id, unit: null }));
    else if (role === 'facility') places = D.keyBuildings.filter((b) => b.facility === 'org_sanad').map((b) => ({ bid: b.id, unit: null }));
    else places = D.keyBuildings.slice(0, 6).map((b) => ({ bid: b.id, unit: null }));
    if (!places.length) places = [{ bid: 'BN-RAM-00142', unit: null }];
    return { role, me, places, home: places[0], customer: ['resident', 'owner', 'committee', 'manager', 'facility'].includes(role) };
  };
  M.placeLabel = (pl) => {
    const b = D.building(pl.bid);
    const u = pl.unit && D.unit(pl.unit);
    return `${tx(b ? b.name : pl.bid)}${u ? ' · ' + L('Unit', 'وحدة') + ' ' + u.number : ' · ' + L('Common areas', 'المناطق المشتركة')}`;
  };

  /* ---------------- requests (shared data + created in this session) ---------------- */
  M.created = M.created || [];
  M.accepted = M.accepted || {};
  M.rated = M.rated || {};
  const HIST = [
    { id: 'SR-26-0417', role: 'resident', building: 'BN-RAM-00142', unit: 'BN-RAM-00142-803', cat: 'hvac', provider: 'sp_jaber', title: T('Split AC service — 2 units', 'صيانة مكيفين سبليت'), status: 'completed', created: '2026-06-09', closed: '2026-06-12', amount: 300, rating: 5 },
    { id: 'SR-26-0388', role: 'resident', building: 'BN-RAM-00142', unit: 'BN-RAM-00142-803', cat: 'cleaning', provider: 'sp_sparkle', title: T('Deep clean before move-in', 'تنظيف عميق قبل الانتقال'), status: 'completed', created: '2026-01-27', closed: '2026-02-02', amount: 450, rating: 4 },
    { id: 'SR-26-0702', role: 'owner', building: 'BN-RAM-00142', unit: 'BN-RAM-00142-1102', cat: 'general', provider: 'sp_jaber', title: T('Pre-tenancy fixes — unit 1102', 'إصلاحات قبل التأجير — الوحدة 1102'), status: 'completed', created: '2026-09-14', closed: '2026-09-18', amount: 640, rating: 5 },
    { id: 'SR-26-0655', role: 'owner', building: 'BN-RAM-00087', unit: 'BN-RAM-00087-402', cat: 'pest', provider: 'sp_shield', title: T('Kitchen pest treatment', 'معالجة حشرات المطبخ'), status: 'completed', created: '2026-07-10', closed: '2026-07-14', amount: 220, rating: 4 },
    { id: 'SR-26-0811', role: 'committee', building: 'BN-RAM-00142', unit: null, cat: 'elevators', provider: 'sp_lift', title: T('Quarterly elevator maintenance (2 cars)', 'الصيانة الربعية للمصاعد (مصعدان)'), status: 'completed', created: '2026-09-08', closed: '2026-09-14', amount: 1700, rating: 5 },
    { id: 'SR-26-0790', role: 'committee', building: 'BN-RAM-00142', unit: null, cat: 'cleaning', provider: 'sp_sparkle', title: T('Lobby cleaning after renovation', 'تنظيف الردهة بعد الترميم'), status: 'completed', created: '2026-08-24', closed: '2026-08-28', amount: 650, rating: 5 },
    { id: 'SR-26-0844', role: 'manager', building: 'BN-RAM-00142', unit: null, cat: 'electrical', provider: 'sp_volt', title: T('Generator winter service', 'الصيانة الشتوية للمولد'), status: 'completed', created: '2026-11-10', closed: '2026-11-14', amount: 450, rating: 5 },
    { id: 'SR-26-0861', role: 'facility', building: 'BN-RAM-00311', unit: null, cat: 'hvac', provider: 'sp_cool', title: T('Chiller pre-winter check', 'فحص المبرّد قبل الشتاء'), status: 'completed', created: '2026-10-19', closed: '2026-10-22', amount: 1380, rating: 4 },
  ];
  M.allRequests = () => D.requests.concat(M.created);
  M.request = (id) => M.allRequests().find((q) => q.id === id) || HIST.find((h) => h.id === id);
  /** Requests relevant to the signed-in persona (their own, their buildings). */
  M.myRequests = () => {
    const { role, me } = M.ctx();
    const mine = (q) => {
      const b = D.building(q.building) || {};
      if (role === 'resident') return q.by === me;
      if (role === 'owner') { const u = q.unit && D.unit(q.unit); return q.by === me || (u && (u.owner === me || (u.coOwners || []).includes(me))); }
      if (role === 'committee') return q.building === 'BN-RAM-00142';
      if (role === 'manager') return b.manager === 'org_arkan' || q.by === me;
      if (role === 'facility') return b.facility === 'org_sanad' || q.by === me;
      if (role === 'provider') return q.provider === 'sp_jaber';
      return true;
    };
    const base = D.requests.filter(mine);
    const created = M.created.filter((q) => q.role === role);
    const hist = HIST.filter((h) => h.role === role || (role !== 'provider' && !['resident', 'owner', 'committee', 'manager', 'facility'].includes(role)));
    return created.concat(base, hist).sort(B.by((q) => q.created, -1));
  };
  const KNOWN_AMOUNTS = { 'MR-24211': 180, 'MR-24288': 140 }; // match the provider-side invoices
  M.amountOf = (q) => q.amount || KNOWN_AMOUNTS[q.id] || (q.status === 'completed' ? 100 + (hash(q.id) % 30) * 10 : null);

  /* ---------------- quotes ---------------- */
  /** Quotes a provider actually submitted in this session (roles/provider.js): key `${requestId}|${providerId}` */
  M.sentQuotes = M.sentQuotes || {};
  M.quotesFor = (q) => {
    const b = D.building(q.building) || {};
    const pool = M.providers().filter((p) => p.cats.includes(q.cat));
    pool.sort((a, c) => (c.areas.includes(b.district) - a.areas.includes(b.district)) || c.rating - a.rating);
    let list = [];
    if (q.invited && q.invited.length) list = q.invited.map(M.provider).filter(Boolean);
    const fixed = q.provider || (q.invited && q.invited[0]);
    if (fixed && M.provider(fixed)) list.push(M.provider(fixed));
    if (!(q.invited && q.invited.length)) pool.forEach((p) => { if (list.length < 3 && !list.includes(p)) list.push(p); });
    if (list.length < 2 && !(q.invited && q.invited.length)) M.providers().filter((p) => p.cats.includes('general') && !list.includes(p)).slice(0, 2 - list.length).forEach((p) => list.push(p));
    return list.map((p) => {
      const h = hash(q.id + p.id);
      const svc = M.services(p.id).filter((s) => s.cat === q.cat || !p.cats.includes(q.cat))[0] || M.services(p.id)[0];
      const base = svc ? svc.price : 150;
      const sent = M.sentQuotes[q.id + '|' + p.id];
      const amount = sent ? sent.amount : Math.round((base * (1.5 + (h % 120) / 100)) / 10) * 10;
      const eta = sent ? sent.eta : 1 + (h % 4);
      return {
        id: `QT-${String(h % 9000 + 1000)}`, pid: p.id, p, amount, eta, warranty: [3, 6, 12][h % 3], visit: (h >> 3) % 2 ? T('Free inspection visit', 'زيارة معاينة مجانية') : T('Inspection included in price', 'المعاينة مشمولة بالسعر'),
        items: [[svc ? svc.name : T('Labour', 'أجور العمل'), Math.round(amount * 0.62)], [T('Materials & parts', 'المواد والقطع'), Math.round(amount * 0.3)], [T('Call-out & transport', 'الاستدعاء والتنقل'), amount - Math.round(amount * 0.62) - Math.round(amount * 0.3)]],
        valid: new Date(2026, 10, 25 + 7 + (h % 8)).toISOString().slice(0, 10),
      };
    });
  };

  /* ---------------- small visual helpers ---------------- */
  const TINTS = ['#E8FAF3', '#E5EEFC', '#EEEAFB', '#FDF1DC', '#EDF2F0', '#E3F0F5'];
  M.tint = (id) => TINTS[hash(id) % TINTS.length];
  /** Abstract cover art for a provider (contour lines + soft tint). */
  M.cover = (p, h = 120) => {
    const r = B.rng(hash(p.id) + 3);
    const cx = 260 + r() * 120, cy = 20 + r() * 60;
    let lines = '';
    for (let k = 1; k <= 9; k++) {
      const pts = [];
      for (let a = 0; a <= 48; a++) { const t = (a / 48) * Math.PI * 2; const w = 1 + 0.12 * Math.sin(t * 3 + k) + 0.06 * Math.sin(t * 5); pts.push(`${(cx + Math.cos(t) * k * 26 * w * 1.4).toFixed(1)},${(cy + Math.sin(t) * k * 26 * w).toFixed(1)}`); }
      lines += `<polyline points="${pts.join(' ')}" fill="none" stroke="#142B3B" stroke-opacity="${k % 3 === 0 ? 0.1 : 0.05}" stroke-width="1"/>`;
    }
    return `<svg viewBox="0 0 400 ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="${h}" fill="${M.tint(p.id)}"/>${lines}<circle cx="${cx}" cy="${cy}" r="4" fill="#36D6A0"/></svg>`;
  };
  M.logo = (p, cls = '') => `<span class="mk-logo ${cls}">${esc(B.initials(p.name))}</span>`;
  M.rating = (n, count) => `<span class="mk-rate">${icon('star')}<b>${B.num1(n)}</b>${count != null ? `<span>(${B.num(count)})</span>` : ''}</span>`;
  M.verified = (p) => (p.verified ? `<span class="mk-ver" title="${esc(L('BENA verified provider', 'مزوّد موثّق في بينا'))}">${icon('badgeCheck')}${L('Verified', 'موثّق')}</span>` : `<span class="mk-unver">${L('Not yet verified', 'غير موثّق بعد')}</span>`);
  M.areasText = (p, max = 3) => { const n = p.areas.map((a) => tx(D.district(a).name)); return n.slice(0, max).join(B.isAr() ? '، ' : ', ') + (n.length > max ? ` +${n.length - max}` : ''); };
  M.catChip = (c) => `<span class="mk-tag">${icon(D.cat(c).icon)}${tx(D.cat(c).name)}</span>`;

  /* ---------------- styles ---------------- */
  B.css(`
  .mk-wrap { max-width: 1200px; margin: 0 auto; }
  .mk-wrap svg.faint, .mk-wrap svg.chev, .scrim svg.faint { width: 16px; height: 16px; flex: none; color: var(--text-3); }
  .mk-more { display: flex; justify-content: center; margin-top: 14px; }
  .mk-hero { padding: 14px 0 6px; }
  .mk-hero h1 { font-size: clamp(28px, 3.6vw, 40px); font-weight: 750; letter-spacing: -.028em; line-height: 1.08; }
  html[dir="rtl"] .mk-hero h1 { letter-spacing: 0; line-height: 1.3; }
  .mk-hero > p { color: var(--text-2); margin-top: 10px; font-size: 15.5px; max-width: 60ch; }
  .mk-for { display: inline-flex; align-items: center; gap: 8px; margin-top: 14px; padding: 6px 12px 6px 8px; border-radius: 99px; background: #fff; border: 1px solid var(--line); font-size: 12.5px; color: var(--text-2); max-width: 100%; }
  html[dir="rtl"] .mk-for { padding: 6px 8px 6px 12px; }
  .mk-for > svg { width: 22px; height: 22px; padding: 4px; border-radius: 50%; background: var(--navy); color: var(--mint); flex: none; }
  .mk-for b { color: var(--ink); font-weight: 600; }
  .mk-searchbar { margin-top: 18px; display: flex; align-items: center; gap: 4px; background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 6px; box-shadow: var(--shadow-2); }
  .mk-searchbar .input-icon { flex: 1 1 auto; min-width: 0; }
  .mk-searchbar .input, .mk-searchbar .select { border: 0; box-shadow: none !important; height: 48px; background-color: transparent; }
  .mk-searchbar .select { width: auto; min-width: 170px; border-inline-start: 1px solid var(--line); border-radius: 0; }
  .mk-searchbar .btn { height: 48px; border-radius: 13px; padding: 0 22px; }
  @media (max-width: 640px) {
    .mk-searchbar { flex-wrap: wrap; padding: 4px; border-radius: 16px; }
    .mk-searchbar .input-icon { flex-basis: 100%; }
    .mk-searchbar .select { flex: 1 1 auto; min-width: 0; border-inline-start: 0; border-top: 1px solid var(--line); height: 44px; }
    .mk-searchbar .btn { display: none; }
  }
  .mk-sec { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin: 34px 0 14px; }
  .mk-sec h2 { font-size: 21px; font-weight: 700; letter-spacing: -.015em; }
  .mk-sec p { color: var(--text-2); font-size: 13.5px; margin-top: 3px; }
  .mk-sec .link-btn { font-size: 13px; font-weight: 600; color: var(--mint-ink); display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
  .mk-sec .link-btn svg { width: 14px; height: 14px; }
  @media (max-width: 640px) { .mk-sec { margin: 26px 0 12px; } .mk-sec h2 { font-size: 18px; } }
  .chips.mk-cats { display: grid; grid-template-columns: repeat(9, minmax(0, 1fr)); gap: 10px; margin-top: 24px; }
  .mk-cat { display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 14px 6px 12px; border-radius: 16px; background: #fff; border: 1px solid var(--line); font-size: 12.5px; font-weight: 600; color: var(--ink); text-align: center; line-height: 1.25; transition: border-color .2s, transform .2s var(--ease); min-width: 0; }
  .mk-cat:hover { border-color: #C9D5D0; transform: translateY(-2px); }
  .mk-cat .ci { width: 46px; height: 46px; border-radius: 14px; background: var(--mint-50); color: var(--mint-ink); display: grid; place-items: center; transition: background .2s, color .2s; }
  .mk-cat .ci svg { width: 22px; height: 22px; }
  .mk-cat.active { border-color: var(--navy); box-shadow: 0 0 0 1px var(--navy) inset; }
  .mk-cat.active .ci { background: var(--navy); color: var(--mint); }
  @media (max-width: 1000px) { .chips.mk-cats { display: flex; gap: 8px; } .mk-cat { flex: 0 0 96px; } }
  @media (max-width: 640px) { .mk-cat { flex-basis: 78px; padding: 12px 4px 10px; font-size: 11.5px; } .mk-cat .ci { width: 42px; height: 42px; } }
  @media (max-width: 640px) {
    .mk-wrap .mk-svc-grid { display: flex; overflow-x: auto; scrollbar-width: none; gap: 10px; margin-inline: -16px; padding-inline: 16px; scroll-snap-type: x mandatory; }
    .mk-wrap .mk-svc-grid::-webkit-scrollbar { display: none; }
    .mk-wrap .mk-svc-grid .mk-svc { flex: 0 0 76%; scroll-snap-align: start; }
    .mk-pc-cover { display: none; }
    .mk-pcard .mk-pc-body { display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 14px; row-gap: 6px; padding: 16px 16px 14px; }
    .mk-pcard .mk-pc-body > :not(.mk-logo) { grid-column: 2; }
    .mk-pcard .mk-pc-body .mk-logo { margin-top: 0; border: 0; grid-row: span 4; width: 48px; height: 48px; }
    .mk-wrap .mk-pc-foot { padding: 11px 16px; }
    .mk-pgrid { gap: 12px; }
  }
  .mk-pgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 270px), 1fr)); gap: 16px; }
  .mk-pcard { display: flex; flex-direction: column; text-align: start; width: 100%; padding: 0; overflow: hidden; transition: border-color .2s, box-shadow .25s var(--ease), transform .25s var(--ease); }
  .mk-pcard:hover { border-color: #CFDAD6; box-shadow: var(--shadow-2); transform: translateY(-2px); }
  .mk-pc-cover { position: relative; height: 92px; }
  .mk-pc-cover svg { width: 100%; height: 100%; }
  .mk-pc-cover .mk-ci { position: absolute; top: 12px; inset-inline-end: 12px; width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,.85); display: grid; place-items: center; color: var(--navy); }
  .mk-pc-cover .mk-ci svg { width: 17px; height: 17px; }
  .mk-pc-body { padding: 0 18px 16px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
  .mk-pc-body .mk-logo { margin-top: -26px; border: 3px solid #fff; }
  .mk-pc-name { font-family: var(--font-display); font-weight: 700; font-size: 16.5px; line-height: 1.25; letter-spacing: -.01em; }
  .mk-pc-tag { font-size: 13px; color: var(--text-2); line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .mk-meta { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12.5px; color: var(--text-2); }
  .mk-meta span { display: inline-flex; align-items: center; gap: 5px; min-width: 0; }
  .mk-meta svg { width: 14px; height: 14px; color: var(--text-3); flex: none; }
  .mk-pc-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 18px; border-top: 1px solid var(--line-2); font-size: 13px; color: var(--text-2); }
  .mk-pc-foot b { font-family: var(--font-display); font-size: 16px; color: var(--ink); font-variant-numeric: tabular-nums; }
  .mk-pc-foot .go { display: inline-flex; align-items: center; gap: 4px; font-weight: 600; color: var(--mint-ink); }
  .mk-pc-foot .go svg { width: 15px; height: 15px; }
  .mk-logo { width: 52px; height: 52px; border-radius: 15px; background: var(--navy); color: #fff; display: grid; place-items: center; font-family: var(--font-display); font-weight: 700; font-size: 17px; flex: none; position: relative; letter-spacing: .02em; }
  .mk-logo::after { content: ""; position: absolute; bottom: 7px; inset-inline-end: 7px; width: 6px; height: 6px; border-radius: 50%; background: var(--mint); }
  .mk-logo.sm { width: 40px; height: 40px; border-radius: 12px; font-size: 13.5px; }
  .mk-logo.sm::after { bottom: 5px; inset-inline-end: 5px; width: 5px; height: 5px; }
  .mk-logo.xl { width: 84px; height: 84px; border-radius: 22px; font-size: 26px; }
  .mk-logo.xl::after { width: 9px; height: 9px; bottom: 11px; inset-inline-end: 11px; }
  .mk-rate { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: var(--text-2); white-space: nowrap; }
  .mk-rate svg { width: 14px; height: 14px; color: #E9A23B; fill: #E9A23B; }
  .mk-rate b { color: var(--ink); font-weight: 650; font-variant-numeric: tabular-nums; }
  .mk-ver { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--mint-ink); white-space: nowrap; }
  .mk-ver svg { width: 15px; height: 15px; }
  .mk-unver { font-size: 12px; color: var(--text-3); white-space: nowrap; }
  .mk-tag { display: inline-flex; align-items: center; gap: 5px; height: 26px; padding: 0 10px; border-radius: 99px; background: var(--surface-2); border: 1px solid var(--line-2); font-size: 12px; font-weight: 550; color: var(--text-2); white-space: nowrap; }
  .mk-tag svg { width: 13px; height: 13px; color: var(--mint-ink); }
  .mk-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
  .mk-toolbar .select { width: auto; height: 38px; font-size: 13.5px; border-radius: 11px; }
  .mk-toolbar .count { font-size: 13.5px; color: var(--text-2); }
  .mk-toolbar .count b { color: var(--ink); }
  .mk-check { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--text-2); cursor: pointer; white-space: nowrap; }
  .mk-check input { width: 17px; height: 17px; accent-color: var(--mint-ink); }
  .mk-how { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .mk-how > div { padding: 18px; border-radius: 16px; background: #fff; border: 1px solid var(--line); display: flex; gap: 14px; align-items: flex-start; }
  .mk-how .n { width: 34px; height: 34px; border-radius: 11px; background: var(--mint-50); color: var(--mint-ink); display: grid; place-items: center; flex: none; }
  .mk-how .n svg { width: 18px; height: 18px; }
  .mk-how b { font-size: 14.5px; display: block; }
  .mk-how p { font-size: 13px; color: var(--text-2); margin-top: 3px; }
  @media (max-width: 760px) { .mk-how { grid-template-columns: minmax(0, 1fr); } }
  .mk-svc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 12px; }
  .mk-svc { display: flex; gap: 14px; align-items: flex-start; padding: 16px; border-radius: 16px; background: #fff; border: 1px solid var(--line); text-align: start; width: 100%; transition: border-color .2s, box-shadow .2s; }
  .mk-svc:hover { border-color: #CFDAD6; box-shadow: var(--shadow-2); }
  .mk-svc .si { width: 42px; height: 42px; border-radius: 13px; background: var(--mint-50); color: var(--mint-ink); display: grid; place-items: center; flex: none; }
  .mk-svc .si svg { width: 20px; height: 20px; }
  .mk-svc b { font-size: 14.5px; display: block; line-height: 1.3; }
  .mk-svc .sp { font-size: 12.5px; color: var(--text-2); margin-top: 3px; }
  .mk-svc .pr { margin-top: 8px; font-size: 13px; color: var(--text-2); }
  .mk-svc .pr b { display: inline; font-family: var(--font-display); font-size: 15px; color: var(--ink); font-variant-numeric: tabular-nums; }
  .mk-mine { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 16px; background: var(--navy); color: var(--navy-ink); }
  .mk-mine b { color: #fff; font-size: 14.5px; }
  .mk-mine .mi { width: 40px; height: 40px; border-radius: 12px; background: rgba(54,214,160,.16); color: var(--mint); display: grid; place-items: center; flex: none; }
  .mk-mine .mi svg { width: 20px; height: 20px; }
  .mk-mine .btn { flex: none; }
  @media (max-width: 560px) { .mk-mine { flex-wrap: wrap; } .mk-mine .btn { width: 100%; } }

  /* provider profile */
  .mk-prof-cover { position: relative; height: 180px; border-radius: var(--r-lg); overflow: hidden; border: 1px solid var(--line); }
  .mk-prof-cover svg { width: 100%; height: 100%; }
  .mk-prof-head { display: flex; gap: 18px; align-items: flex-end; padding: 0 24px; margin-top: -42px; position: relative; flex-wrap: wrap; }
  .mk-prof-head .mk-logo { border: 4px solid var(--bg); }
  .mk-prof-head h1 { font-size: 28px; font-weight: 750; line-height: 1.15; letter-spacing: -.02em; }
  html[dir="rtl"] .mk-prof-head h1 { letter-spacing: 0; }
  .mk-prof-head .grow { padding-bottom: 4px; min-width: min(100%, 260px); }
  .mk-prof-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; background: #fff; border: 1px solid var(--line); border-radius: 16px; margin-top: 20px; }
  .mk-prof-stats > div { padding: 14px 16px; border-inline-start: 1px solid var(--line-2); }
  .mk-prof-stats > div:first-child { border-inline-start: 0; }
  .mk-prof-stats b { font-family: var(--font-display); font-size: 20px; display: block; font-variant-numeric: tabular-nums; line-height: 1.2; }
  .mk-prof-stats span { font-size: 12px; color: var(--text-3); }
  @media (max-width: 640px) {
    .mk-prof-cover { height: 140px; border-radius: 18px; }
    .mk-prof-head { padding: 0 6px; gap: 12px; margin-top: -34px; }
    .mk-prof-head .mk-logo.xl { width: 68px; height: 68px; font-size: 21px; border-radius: 19px; }
    .mk-prof-head h1 { font-size: 22px; }
    .mk-prof-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .mk-prof-stats > div:nth-child(3) { border-inline-start: 0; }
    .mk-prof-stats > div:nth-child(n+3) { border-top: 1px solid var(--line-2); }
  }
  .mk-book { position: sticky; top: calc(var(--topbar-h) + 12px); }
  .mk-book .price { font-family: var(--font-display); font-size: 26px; font-weight: 750; font-variant-numeric: tabular-nums; }
  .mk-book .price small { font-size: 13px; font-weight: 500; color: var(--text-3); }
  .mk-svc-row { display: flex; gap: 14px; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--line-2); text-align: start; width: 100%; }
  .mk-svc-row:last-child { border-bottom: 0; padding-bottom: 0; }
  .mk-svc-row:first-child { padding-top: 0; }
  .mk-svc-row:hover .t { color: var(--mint-ink); }
  .mk-svc-row .t { font-weight: 600; font-size: 14.5px; transition: color .15s; }
  .mk-svc-row .d { font-size: 12.5px; color: var(--text-2); margin-top: 2px; }
  .mk-svc-row .p { text-align: end; flex: none; }
  .mk-svc-row .p b { font-family: var(--font-display); font-size: 16px; font-variant-numeric: tabular-nums; display: block; }
  .mk-svc-row .p span { font-size: 12px; color: var(--text-3); }
  .mk-rsum { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 24px; align-items: center; }
  .mk-rsum .big { font-family: var(--font-display); font-size: 52px; font-weight: 750; line-height: 1; font-variant-numeric: tabular-nums; }
  .mk-rsum .stars svg { width: 17px; height: 17px; }
  @media (max-width: 560px) { .mk-rsum { grid-template-columns: minmax(0, 1fr); gap: 14px; } }
  .mk-dist { display: flex; flex-direction: column; gap: 7px; }
  .mk-dist .r { display: grid; grid-template-columns: 26px minmax(0, 1fr) 40px; gap: 10px; align-items: center; font-size: 12.5px; color: var(--text-2); }
  .mk-dist .r em { font-style: normal; text-align: end; font-variant-numeric: tabular-nums; }
  .mk-dist .tr { height: 8px; border-radius: 99px; background: var(--line-2); overflow: hidden; }
  .mk-dist .tr i { display: block; height: 100%; border-radius: 99px; background: var(--navy); }
  .mk-rev { padding: 16px 0; border-bottom: 1px solid var(--line-2); }
  .mk-rev:last-child { border-bottom: 0; padding-bottom: 0; }
  .mk-rev:first-child { padding-top: 0; }
  .mk-rev .who { display: flex; align-items: center; gap: 10px; }
  .mk-rev .who b { font-size: 14px; display: block; }
  .mk-rev .who small { font-size: 12px; color: var(--text-3); }
  .mk-rev p { font-size: 14px; margin-top: 10px; line-height: 1.55; }
  .mk-rev .reply { margin-top: 10px; padding: 10px 12px; border-radius: 12px; background: var(--surface-2); border-inline-start: 3px solid var(--mint); font-size: 13px; color: var(--text-2); }
  .mk-rev .reply b { color: var(--ink); font-size: 12.5px; display: block; margin-bottom: 2px; }
  .mk-cert { display: flex; gap: 12px; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--line-2); }
  .mk-cert:last-child { border-bottom: 0; padding-bottom: 0; }
  .mk-cert:first-child { padding-top: 0; }
  .mk-cert .ci { width: 38px; height: 38px; border-radius: 11px; background: var(--navy); color: var(--mint); display: grid; place-items: center; flex: none; }
  .mk-cert .ci svg { width: 18px; height: 18px; }
  .mk-cert b { font-size: 14px; display: block; }
  .mk-cert small { font-size: 12px; color: var(--text-3); }
  .mk-areas { display: flex; flex-wrap: wrap; gap: 8px; }
  .mk-area { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 99px; font-size: 13px; font-weight: 550; border: 1px solid var(--line); color: var(--text-3); background: #fff; }
  .mk-area svg { width: 14px; height: 14px; }
  .mk-area.on { background: var(--mint-50); border-color: var(--mint-100); color: var(--mint-ink); }
  .mk-mobile-cta { display: none; }
  @media (max-width: 1180px) {
    .mk-book { position: static; }
  }
  @media (max-width: 767px) {
    .mk-mobile-cta { display: flex; position: fixed; z-index: 34; inset-inline: 12px; bottom: calc(var(--tabbar-h) + 14px + env(safe-area-inset-bottom, 0px)); padding: 10px 10px 10px 16px; gap: 12px; align-items: center; background: #fff; border: 1px solid var(--line); border-radius: 18px; box-shadow: var(--shadow-2); }
    html[dir="rtl"] .mk-mobile-cta { padding: 10px 16px 10px 10px; }
    body:not(.has-tabbar) .mk-mobile-cta { bottom: calc(14px + env(safe-area-inset-bottom, 0px)); }
    .mk-mobile-cta .grow b { font-family: var(--font-display); font-size: 17px; font-variant-numeric: tabular-nums; }
    .mk-mobile-cta .grow small { display: block; font-size: 11.5px; color: var(--text-3); }
    .mk-has-cta { padding-bottom: 86px; }
  }

  /* service detail */
  .mk-sd-hero { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 0; border-radius: var(--r-lg); overflow: hidden; background: #fff; border: 1px solid var(--line); }
  .mk-sd-hero .art { position: relative; min-height: 240px; }
  .mk-sd-hero .art svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .mk-sd-hero .art .big { position: absolute; inset: 0; display: grid; place-items: center; }
  .mk-sd-hero .art .big span { width: 92px; height: 92px; border-radius: 28px; background: #fff; color: var(--navy); display: grid; place-items: center; box-shadow: var(--shadow-2); }
  .mk-sd-hero .art .big svg { position: static; width: 42px; height: 42px; }
  .mk-sd-hero .body { padding: 26px; display: flex; flex-direction: column; gap: 12px; justify-content: center; }
  .mk-sd-hero h1 { font-size: 28px; font-weight: 750; line-height: 1.15; letter-spacing: -.02em; }
  html[dir="rtl"] .mk-sd-hero h1 { letter-spacing: 0; }
  @media (max-width: 760px) { .mk-sd-hero { grid-template-columns: minmax(0, 1fr); } .mk-sd-hero .art { min-height: 150px; } .mk-sd-hero .body { padding: 18px; } .mk-sd-hero h1 { font-size: 23px; } }
  .mk-inc { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 18px; }
  .mk-inc span { display: flex; gap: 8px; align-items: flex-start; font-size: 14px; }
  .mk-inc svg { width: 18px; height: 18px; flex: none; color: var(--mint-ink); margin-top: 1px; }
  .mk-inc.no svg { color: var(--text-3); }
  @media (max-width: 560px) { .mk-inc { grid-template-columns: minmax(0, 1fr); } }

  /* quotes comparison */
  .mk-qgrid { display: grid; grid-template-columns: repeat(var(--n, 3), minmax(0, 1fr)); gap: 14px; align-items: stretch; }
  @media (max-width: 900px) {
    .mk-wrap .mk-qgrid { display: flex; overflow-x: auto; scrollbar-width: none; scroll-snap-type: x mandatory; margin-inline: -16px; padding: 14px 16px 4px; gap: 12px; }
    .mk-wrap .mk-qgrid::-webkit-scrollbar { display: none; }
    .mk-wrap .mk-qgrid .mk-q { flex: 0 0 min(84%, 340px); scroll-snap-align: start; }
    .mk-wrap .mk-qgrid .mk-q:only-child { flex-basis: 100%; }
  }
  .mk-swipe { display: none; font-size: 12px; color: var(--text-3); align-items: center; gap: 6px; margin-top: -6px; }
  .mk-swipe svg { width: 14px; height: 14px; }
  @media (max-width: 900px) { .mk-swipe { display: flex; } }
  .mk-q { position: relative; display: flex; flex-direction: column; gap: 14px; padding: 20px; border-radius: 18px; background: #fff; border: 1px solid var(--line); }
  .mk-q.best { border-color: var(--mint); box-shadow: 0 0 0 1px var(--mint) inset; }
  .mk-q.won { border-color: var(--navy); box-shadow: 0 0 0 1px var(--navy) inset; }
  .mk-q.lost { opacity: .62; }
  .mk-q .flag { position: absolute; top: -11px; inset-inline-start: 18px; }
  .mk-q .amt { font-family: var(--font-display); font-size: 32px; font-weight: 750; line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
  .mk-q .amt small { font-size: 13px; font-weight: 500; color: var(--text-3); letter-spacing: 0; }
  .mk-q .rows { display: flex; flex-direction: column; border-top: 1px solid var(--line-2); }
  .mk-q .rows > div { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--line-2); font-size: 13.5px; }
  .mk-q .rows > div span:first-child { color: var(--text-2); display: inline-flex; align-items: center; gap: 7px; }
  .mk-q .rows svg { width: 15px; height: 15px; color: var(--text-3); }
  .mk-q .rows b { font-weight: 600; text-align: end; }
  .mk-q .items { font-size: 12.5px; color: var(--text-2); display: flex; flex-direction: column; gap: 5px; }
  .mk-q .items div { display: flex; justify-content: space-between; gap: 10px; }
  .mk-q .items span:last-child { font-variant-numeric: tabular-nums; }
  .mk-q .actions { margin-top: auto; display: flex; gap: 8px; }
  .mk-q .actions .btn { flex: 1; }
  .mk-req-sum { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .mk-req-sum > .grow { flex: 1 1 220px; }
  .mk-req-sum .ri { width: 52px; height: 52px; border-radius: 16px; background: var(--navy); color: var(--mint); display: grid; place-items: center; flex: none; }
  .mk-req-sum .ri svg { width: 24px; height: 24px; }

  /* history */
  .mk-hist { display: flex; gap: 14px; padding: 16px 18px; border-bottom: 1px solid var(--line-2); align-items: flex-start; }
  .mk-hist:last-child { border-bottom: 0; }
  .mk-hist .hi { width: 44px; height: 44px; border-radius: 13px; background: var(--mint-50); color: var(--mint-ink); display: grid; place-items: center; flex: none; }
  .mk-hist .hi svg { width: 20px; height: 20px; }
  .mk-hist .hb { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
  .mk-hist .ht { display: flex; gap: 10px; justify-content: space-between; align-items: flex-start; }
  .mk-hist .ht b { font-size: 14.5px; line-height: 1.35; }
  .mk-hist .hs { font-size: 12.5px; color: var(--text-2); }
  .mk-hist .ha { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; align-items: center; }
  .mk-hist .amt { font-family: var(--font-display); font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .mk-track { display: flex; gap: 4px; margin-top: 6px; max-width: 360px; }
  .mk-track i { flex: 1; height: 4px; border-radius: 99px; background: var(--line); }
  .mk-track i.on { background: var(--mint); }
  .mk-receipt { border: 1px solid var(--line); border-radius: 16px; padding: 20px; background: var(--surface-2); }
  .mk-receipt .rl { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; font-size: 14px; border-bottom: 1px dashed var(--line); }
  .mk-receipt .rl:last-child { border-bottom: 0; }
  .mk-receipt .tot { font-family: var(--font-display); font-size: 20px; font-weight: 750; }

  /* request flow */
  .mk-flow-sum { display: flex; gap: 12px; align-items: center; padding: 12px; border-radius: 14px; background: var(--surface-2); border: 1px solid var(--line-2); margin-bottom: 16px; }
  .mk-flow .radio-cards { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (max-width: 560px) { .mk-flow .radio-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  .mk-flow .radio-cards.two { grid-template-columns: minmax(0, 1fr); }
  .mk-flow .field + .field { margin-top: 14px; }
  .mk-photos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .mk-photos .media { aspect-ratio: 1; border-radius: 12px; }
  `);

  /* Fixed bottom CTA bars: .view keeps a filled transform animation, which makes it the
     containing block for position:fixed. Move the bar to <body> after every render. */
  B.afterRenderGlobal = B.afterRenderGlobal || [];
  B.afterRenderGlobal.push(() => {
    document.querySelectorAll('body > .mk-mobile-cta').forEach((el) => el.remove());
    const cta = document.querySelector('.view .mk-mobile-cta');
    if (cta) document.body.appendChild(cta);
  });

  /* ---------------- shared building blocks ---------------- */
  M.providerCard = (p, o = {}) => {
    const c = D.cat(o.cat && p.cats.includes(o.cat) ? o.cat : p.cats[0]);
    const near = o.district && p.areas.includes(o.district);
    return `<button class="card mk-pcard" data-go="${R()}-provider-${p.id}">
      <div class="mk-pc-cover">${M.cover(p, 92)}<span class="mk-ci">${icon(c.icon)}</span></div>
      <div class="mk-pc-body">
        ${M.logo(p)}
        <div class="mk-pc-name">${tx(p.name)}</div>
        <div class="row-sm wrap" style="gap:10px">${M.rating(p.rating, p.reviews)}${M.verified(p)}</div>
        <div class="mk-pc-tag">${tx(p.tagline)}</div>
        <div class="mk-meta"><span>${icon('clock')}${tx(p.response)}</span><span>${icon('pin')}<span class="truncate">${near ? L('Serves your area', 'يخدم منطقتك') : M.areasText(p, 2)}</span></span></div>
      </div>
      <div class="mk-pc-foot"><span>${L('From', 'ابتداءً من')} <b>${B.money(M.fromPrice(p.id))}</b></span><span class="go">${L('View', 'عرض')}${icon('arrowRight', 'flip')}</span></div>
    </button>`;
  };
  const catTiles = (active) => `<div class="chips mk-cats">${D.serviceCats.map((c) => `<button class="mk-cat ${c.id === active ? 'active' : ''}" data-go="${R()}-services${c.id === active ? '' : '-' + c.id}"><span class="ci">${icon(c.icon)}</span><span>${tx(c.name)}</span></button>`).join('')}</div>`;
  const forPill = () => {
    const c = M.ctx();
    if (!c.customer) return '';
    return `<div class="mk-for">${icon('pin')}<span class="truncate">${L('Requests go to', 'الطلبات لـ')} <b>${esc(M.placeLabel(c.home))}</b></span></div>`;
  };
  const CAT_DESC = {
    cleaning: T('Common areas, deep cleans and post-renovation work.', 'المناطق المشتركة والتنظيف العميق وما بعد الترميم.'),
    plumbing: T('Leaks, drains, heaters and building pumps.', 'التسريبات والمصارف والسخانات ومضخات المباني.'),
    electrical: T('Faults, panels, lighting and generators.', 'الأعطال واللوحات والإنارة والمولدات.'),
    elevators: T('Licensed maintenance, certification and emergency callouts.', 'صيانة مرخّصة وترخيص سنوي واستدعاءات طارئة.'),
    hvac: T('Split units, central systems and ventilation.', 'وحدات السبليت والأنظمة المركزية والتهوية.'),
    pest: T('Licensed, family-safe treatments with guarantees.', 'معالجات مرخّصة وآمنة للعائلات مع ضمان.'),
    security: T('Guards, CCTV and access control for buildings.', 'الحراسة والكاميرات وأنظمة الدخول للمباني.'),
    tanks: T('Rooftop tank cleaning, sterilisation and pumps.', 'تنظيف وتعقيم خزانات الأسطح والمضخات.'),
    general: T('Handyman jobs, painting, doors and small fit-outs.', 'أعمال الصيانة العامة والدهان والأبواب والتجهيزات الصغيرة.'),
  };
  const districtOpts = () => [{ v: '', l: L('All areas of Ramallah', 'كل مناطق رام الله') }].concat(D.districts.map((d) => ({ v: d.id, l: d.name })));

  /* ---------------- page: services (marketplace home / category) ---------------- */
  B.shared.services = (catId) => {
    const cat = catId && D.serviceCats.find((c) => c.id === catId) ? catId : null;
    const q = B.get('mk:q', '');
    const ctx = M.ctx();
    const homeB = D.building(ctx.home.bid);
    const dist = B.get('mk:dist', '');
    const sort = B.get('mk:sort', 'rec');
    const verOnly = B.get('mk:ver', false);
    let list = M.providers().filter((p) => (!cat || p.cats.includes(cat)) && (!dist || p.areas.includes(dist)) && (!verOnly || p.verified)
      && B.match(q, p.name, p.tagline, ...p.cats.map((c) => D.cat(c).name), ...M.services(p.id).map((s) => s.name)));
    const near = homeB ? homeB.district : null;
    const sorters = {
      rec: (a, b) => (b.verified - a.verified) || ((b.areas.includes(near) ? 1 : 0) - (a.areas.includes(near) ? 1 : 0)) || b.rating * Math.log(b.reviews) - a.rating * Math.log(a.reviews),
      rating: (a, b) => b.rating - a.rating, price: (a, b) => M.fromPrice(a.id) - M.fromPrice(b.id), reviews: (a, b) => b.reviews - a.reviews,
    };
    list.sort(sorters[sort] || sorters.rec);
    if (cat) B.title(tx(D.cat(cat).name));
    B.navActive('services');
    const c = cat && D.cat(cat);
    const mine = ctx.customer ? M.myRequests().filter((r) => !['completed', 'cancelled', 'resolved'].includes(r.status)) : [];
    const popular = [];
    if (!cat && !q) {
      [['sp_jaber', 0], ['sp_sparkle', 1], ['sp_lift', 0], ['sp_pure', 0], ['sp_cool', 0], ['sp_volt', 2]].forEach(([pid, i]) => { const s = M.services(pid)[i]; if (s) popular.push(s); });
    }
    const svcs = cat ? list.flatMap((p) => M.services(p.id).filter((s) => s.cat === cat).slice(0, 1)) : popular;
    return `<div class="mk-wrap">
      <div class="mk-hero">
        ${cat ? `<button class="btn btn-text" style="padding:0;margin-bottom:10px" data-go="${R()}-services">${icon('arrowLeft', 'flip')}<span>${L('All services', 'كل الخدمات')}</span></button>` : ''}
        <h1>${cat ? tx(c.name) : L('Trusted services for your building', 'خدمات موثوقة لمبناك')}</h1>
        <p>${cat ? tx(CAT_DESC[cat]) : L('Verified providers, transparent prices and quotes you can compare — all linked to your building’s BENA identity.', 'مزوّدون موثّقون وأسعار واضحة وعروض يمكنك مقارنتها — وكلها مرتبطة بهوية مبناك في بينا.')}</p>
        ${forPill()}
        <div class="mk-searchbar">
          ${ui.search('mk:q', L('Search a service or provider — e.g. leak, AC, elevator', 'ابحث عن خدمة أو مزوّد — مثل تسريب، مكيف، مصعد'))}
          ${ui.select('mk:dist', districtOpts(), { label: L('Area', 'المنطقة'), def: '' })}
          <button class="btn btn-primary" data-act="mkRequest" data-arg="${cat ? 'cat:' + cat : ''}">${icon('plus')}<span>${L('Request service', 'اطلب خدمة')}</span></button>
        </div>
        ${catTiles(cat)}
      </div>
      ${mine.length && !cat ? `<div style="margin-top:22px" class="mk-mine"><span class="mi">${icon('activity')}</span><div class="grow"><b>${L(`${mine.length} active request${mine.length > 1 ? 's' : ''}`, mine.length === 1 ? 'طلب نشط واحد' : mine.length === 2 ? 'طلبان نشطان' : `${mine.length} طلبات نشطة`)}</b><div class="xs" style="margin-top:2px">${esc(tx(mine[0].title))} · ${ui.statusLabel(mine[0].status === 'open' ? 'collecting' : mine[0].status)}</div></div>
        ${mine.some((r) => ['open', 'quoted'].includes(r.status)) ? ui.btn(L('Compare quotes', 'قارن العروض'), { kind: 'primary', size: 'sm', go: `${R()}-quotes-${mine.find((r) => ['open', 'quoted'].includes(r.status)).id}` }) : ''}
        ${ui.btn(L('Service history', 'سجل الخدمات'), { size: 'sm', go: `${R()}-servicehistory` })}</div>` : ''}
      ${svcs.length ? `<div class="mk-sec"><div><h2>${cat ? L('Popular in this category', 'الأكثر طلباً في هذه الفئة') : L('Popular right now', 'الأكثر طلباً الآن')}</h2><p>${L('Fixed starting prices from verified providers', 'أسعار بدء ثابتة من مزوّدين موثّقين')}</p></div></div>
        <div class="mk-svc-grid">${svcs.slice(0, 6).map((s) => { const p = M.provider(s.pid); return `<button class="mk-svc" data-go="${R()}-servicedetail-${s.pid}~${s.i}"><span class="si">${icon(D.cat(s.cat).icon)}</span><span class="grow"><b>${tx(s.name)}</b><span class="sp" style="display:block">${tx(p.name)} · ${M.rating(p.rating)}</span><span class="pr" style="display:block">${L('From', 'ابتداءً من')} <b>${B.money(s.price)}</b> ${M.unitLabel(s.unit)}</span></span></button>`; }).join('')}</div>` : ''}
      <div class="mk-sec"><div><h2>${cat ? L(`${tx(c.name)} providers`, `مزوّدو ${tx(c.name)}`) : L('Providers near you', 'مزوّدون بالقرب منك')}</h2><p>${dist ? L(`Covering ${tx(D.district(dist).name)}`, `يغطون ${tx(D.district(dist).name)}`) : near ? L(`Recommended for ${tx(D.district(near).name)}`, `موصى بهم لمنطقة ${tx(D.district(near).name)}`) : ''}</p></div></div>
      <div class="mk-toolbar">
        <span class="count"><b>${list.length}</b> ${L('providers', 'مزوّد')}</span>
        <div class="row-sm wrap" style="gap:12px">
          <label class="mk-check"><input type="checkbox" id="mk-ver" data-model="mk:ver" ${verOnly ? 'checked' : ''}>${L('Verified only', 'الموثّقون فقط')}</label>
          ${ui.select('mk:sort', [{ v: 'rec', l: L('Recommended', 'موصى به') }, { v: 'rating', l: L('Highest rated', 'الأعلى تقييماً') }, { v: 'reviews', l: L('Most reviewed', 'الأكثر مراجعات') }, { v: 'price', l: L('Lowest price', 'الأقل سعراً') }], { label: L('Sort', 'الترتيب') })}
        </div>
      </div>
      ${list.length ? `<div class="mk-pgrid">${list.map((p) => M.providerCard(p, { cat, district: dist || near })).join('')}</div>` : `<div class="card">${ui.empty({ icon: 'search', title: L('No providers match', 'لا يوجد مزوّدون مطابقون'), text: L('Try another area or clear the search. You can still post a request and let providers come to you.', 'جرّب منطقة أخرى أو امسح البحث. يمكنك نشر طلب وترك المزوّدين يتواصلون معك.'), action: ui.btn(L('Post a request', 'انشر طلباً'), { kind: 'primary', act: 'mkRequest', arg: cat ? 'cat:' + cat : '' }) })}</div>`}
      ${!cat ? `<div class="mk-sec"><div><h2>${L('How it works', 'كيف تعمل الخدمة')}</h2></div></div>
      <div class="mk-how">
        <div><span class="n">${icon('send')}</span><div><b>${L('Describe the job', 'صِف المهمة')}</b><p>${L('Your building and unit are filled in from your BENA identity.', 'يتم تعبئة المبنى والوحدة تلقائياً من هويتك في بينا.')}</p></div></div>
        <div><span class="n">${icon('sliders')}</span><div><b>${L('Compare up to 3 quotes', 'قارن حتى 3 عروض')}</b><p>${L('Price, arrival time, warranty and rating side by side.', 'السعر وموعد الوصول والضمان والتقييم جنباً إلى جنب.')}</p></div></div>
        <div><span class="n">${icon('checkCircle')}</span><div><b>${L('Track, pay and rate', 'تابع وادفع وقيّم')}</b><p>${L('Receipts and reports are saved to your service history.', 'تُحفظ الإيصالات والتقارير في سجل خدماتك.')}</p></div></div>
      </div>` : ''}
      <div style="margin-top:24px">${ui.demoNote(L('Providers, prices and reviews are fictional demonstration data. BENA does not process real bookings or payments.', 'المزوّدون والأسعار والمراجعات بيانات تجريبية وهمية. لا تعالج بينا حجوزات أو مدفوعات حقيقية.'))}</div>
    </div>`;
  };

  /* ---------------- page: provider profile ---------------- */
  const CERTS = {
    sp_jaber: [
      [T('Electrical contractor licence — Class A', 'رخصة مقاول كهرباء — الفئة أ'), 'EC-RAM-2011-118', T('Valid to Dec 2027', 'سارية حتى ك١ 2027')],
      [T('Plumbing & water systems certificate', 'شهادة أنظمة السباكة والمياه'), 'PW-2019-0442', T('Valid to Jun 2027', 'سارية حتى حزيران 2027')],
      [T('Refrigerant handling (HVAC)', 'التعامل مع غازات التبريد (تكييف)'), 'RF-2022-0871', T('Valid to Mar 2027', 'سارية حتى آذار 2027')],
      [T('Public liability insurance — ₪1,000,000', 'تأمين مسؤولية مدنية — 1,000,000 ₪'), 'INS-JT-2026', T('Renewed Jan 2026', 'جُدّد ك٢ 2026')],
    ],
  };
  M.certs = (p) => CERTS[p.id] || [
    [T('Trade licence', 'رخصة مهنة'), `TL-${String(hash(p.id) % 9000 + 1000)}`, T('Valid to 2027', 'سارية حتى 2027')],
    [T('Public liability insurance', 'تأمين مسؤولية مدنية'), `INS-${String(hash(p.id + 'i') % 900 + 100)}`, T('Renewed 2026', 'جُدّد 2026')],
  ].concat(p.verified ? [[T('BENA verified provider', 'مزوّد موثّق في بينا'), `BV-${p.since}-${String(hash(p.id) % 90 + 10)}`, T('Identity, licence and insurance checked', 'تم التحقق من الهوية والرخصة والتأمين')]] : []);
  M.about = M.about || {};
  M.aboutOf = (p) => M.about[p.id] || (p.id === 'sp_jaber'
    ? L('Family-run technical company founded in 2011 by master electrician Yousef Jaber. Our 9 technicians cover electrical, plumbing, HVAC and general maintenance for apartments, towers and offices across central Ramallah, with photo reports for every job in BENA.', 'شركة فنية عائلية أسسها المهندس الكهربائي يوسف جابر عام 2011. يغطي فنيونا التسعة أعمال الكهرباء والسباكة والتكييف والصيانة العامة للشقق والأبراج والمكاتب في وسط رام الله، مع تقرير مصوّر لكل مهمة في بينا.')
    : L(`${tx(p.name)} has served buildings in Ramallah since ${p.since}, completing more than ${B.num(p.jobs)} jobs. ${tx(p.tagline)}.`, `يخدم ${tx(p.name)} المباني في رام الله منذ ${p.since}، وأنجز أكثر من ${B.num(p.jobs)} مهمة. ${tx(p.tagline)}.`));
  M.distBlock = (pid) => {
    const p = M.provider(pid);
    const d = M.dist(pid);
    const tot = B.sum(d) || 1;
    return `<div class="mk-rsum"><div><div class="big">${B.num1(p.rating)}</div><div style="margin-top:8px">${ui.stars(p.rating)}</div><div class="xs faint" style="margin-top:4px">${L(`${B.num(p.reviews)} verified reviews`, `${B.num(p.reviews)} مراجعة موثّقة`)}</div></div>
      <div class="mk-dist">${d.map((n, i) => `<div class="r"><span>${5 - i}★</span><span class="tr"><i style="width:${(n / tot) * 100}%"></i></span><em>${Math.round((n / tot) * 100)}%</em></div>`).join('')}</div></div>`;
  };
  M.reviewItem = (rv, foot = '') => {
    const b = D.building(rv.bid);
    const rep = M.replies[rv.id] || rv.reply;
    return `<div class="mk-rev"><div class="who">${ui.avatar(D.person(rv.by).name)}<div class="grow"><b>${esc(D.pname(rv.by))}</b><small>${tx(D.cat(rv.cat).name)}${b ? ' · ' + esc(tx(b.name)) : ''} · ${B.ago(rv.date)}</small></div>${ui.stars(rv.stars)}</div>
      <p>${esc(tx(rv.text))}</p>${rep ? `<div class="reply"><b>${L('Response from the provider', 'رد المزوّد')}</b>${esc(tx(rep))}</div>` : ''}${foot ? `<div class="row-sm" style="justify-content:flex-end;margin-top:10px">${foot}</div>` : ''}</div>`;
  };

  B.shared.provider = (pid) => {
    const p = M.provider(pid);
    B.navActive('services');
    if (!p) return ui.empty({ icon: 'search', title: L('Provider not found', 'لم يتم العثور على المزوّد'), action: ui.btn(L('Browse services', 'تصفّح الخدمات'), { kind: 'primary', go: `${R()}-services` }) });
    B.title(tx(p.name));
    const svcs = M.services(p.id);
    const isMe = R() === 'provider' && p.id === 'sp_jaber';
    const covered = new Set(D.buildings.filter((b) => p.areas.includes(b.district)).map((b) => b.id));
    const reviews = M.reviews(p.id);
    const homeB = D.building(M.ctx().home.bid);
    const serves = homeB && p.areas.includes(homeB.district);
    return `<div class="mk-wrap mk-has-cta">
      <button class="btn btn-text" style="padding:0;margin:4px 0 12px" data-act="back">${icon('arrowLeft', 'flip')}<span>${L('Back', 'رجوع')}</span></button>
      <div class="mk-prof-cover">${M.cover(p, 210)}</div>
      <div class="mk-prof-head">${M.logo(p, 'xl')}
        <div class="grow"><h1>${tx(p.name)}</h1><div class="row-sm wrap" style="gap:12px;margin-top:6px">${M.rating(p.rating, p.reviews)}${M.verified(p)}<span class="xs faint">${L(`Since ${p.since}`, `منذ ${p.since}`)}</span></div></div>
        <div class="row-sm wrap">${ui.btn('', { icon: 'share', act: 'soon', arg: L('Sharing', 'المشاركة'), title: L('Share', 'مشاركة') })}${ui.btn('', { icon: 'chat', act: 'soon', arg: L('Messaging', 'المراسلة'), title: L('Message', 'مراسلة') })}${isMe ? ui.btn(L('Edit profile', 'تعديل الملف'), { icon: 'edit', go: 'provider-profile' }) : ''}</div>
      </div>
      <div class="mk-prof-stats">
        <div><b>${B.num(p.jobs)}</b><span>${L('Jobs completed', 'مهمة منجزة')}</span></div>
        <div><b>${tx(p.response)}</b><span>${L('Typical response', 'زمن الاستجابة')}</span></div>
        <div><b>${p.areas.length}</b><span>${L('Areas covered', 'منطقة مغطاة')}</span></div>
        <div><b>${2026 - p.since} ${L('yrs', 'سنة')}</b><span>${L('In business', 'في السوق')}</span></div>
      </div>
      <div class="grid g-main" style="margin-top:20px;align-items:start">
        <div class="stack">
          ${ui.card({ title: L('About', 'نبذة'), body: `<p style="font-size:14.5px;line-height:1.6">${esc(M.aboutOf(p))}</p><div class="row-sm wrap" style="margin-top:14px">${p.cats.map(M.catChip).join('')}</div>` })}
          ${ui.card({ title: L('Services & prices', 'الخدمات والأسعار'), sub: L('Starting prices — final price confirmed in the quote', 'أسعار البدء — يُثبّت السعر النهائي في العرض'), body: svcs.slice(0, B.get('mk:allsvc', '') === p.id ? 99 : 6).map((s) => `<button class="mk-svc-row" data-go="${R()}-servicedetail-${p.id}~${s.i}"><span class="li-icon mint">${icon(D.cat(s.cat).icon)}</span><span class="grow"><span class="t" style="display:block">${tx(s.name)}</span><span class="d" style="display:block">${tx(s.dur)} · ${tx(D.cat(s.cat).name)}</span></span><span class="p"><b>${B.money(s.price)}</b><span>${M.unitLabel(s.unit)}</span></span>${icon('chevR', 'flip chev')}</button>`).join('') + (svcs.length > 6 && B.get('mk:allsvc', '') !== p.id ? `<div class="mk-more">${ui.btn(L(`Show all ${svcs.length} services`, `عرض كل الخدمات (${svcs.length})`), { icon: 'chevD', act: 'set', arg: `mk:allsvc=${p.id}` })}</div>` : '') })}
          ${ui.card({ title: L('Ratings & reviews', 'التقييمات والمراجعات'), body: `${M.distBlock(p.id)}<div class="divider" style="margin:20px 0"></div>${reviews.map(M.reviewItem).join('')}`, link: { label: L('All reviews', 'كل المراجعات'), act: 'soon', arg: L('Full review list', 'قائمة المراجعات الكاملة') } })}
        </div>
        <div class="stack mk-book">
          ${ui.card({ body: `<div class="xs faint">${L('Starting from', 'ابتداءً من')}</div><div class="price">${B.money(M.fromPrice(p.id))}<small> ${L('per visit', 'للزيارة')}</small></div>
            <div class="stack-sm" style="margin:14px 0 16px;font-size:13.5px">
              <div class="row-sm">${icon('clock', 'faint')}<span>${L('Responds', 'يرد خلال')} <b>${tx(p.response)}</b></span></div>
              <div class="row-sm">${icon('shieldCheck', 'faint')}<span>${L('Quotes include warranty terms', 'تتضمن العروض شروط الضمان')}</span></div>
              ${homeB ? `<div class="row-sm">${icon(serves ? 'checkCircle' : 'alertCircle', 'faint')}<span>${serves ? L(`Serves ${tx(D.district(homeB.district).name)}`, `يخدم ${tx(D.district(homeB.district).name)}`) : L(`Outside its usual area (${tx(D.district(homeB.district).name)})`, `خارج نطاقه المعتاد (${tx(D.district(homeB.district).name)})`)}</span></div>` : ''}
            </div>
            ${isMe ? ui.btn(L('Manage incoming requests', 'إدارة الطلبات الواردة'), { kind: 'primary', block: true, size: 'lg', go: 'provider-requests' }) : ui.btn(L('Request service', 'اطلب خدمة'), { kind: 'primary', block: true, size: 'lg', act: 'mkRequest', arg: p.id })}
            <div class="xs faint" style="text-align:center;margin-top:10px">${L('Free to request · no payment until you accept a quote', 'الطلب مجاني · لا دفع قبل قبول العرض')}</div>` })}
          ${ui.card({ title: L('Coverage', 'نطاق الخدمة'), body: `${B.map.render({ id: 'mk-cov-' + p.id, static: true, visible: covered, height: '200px', legend: false, badge: false })}<div class="mk-areas" style="margin-top:14px">${D.districts.map((d) => `<span class="mk-area ${p.areas.includes(d.id) ? 'on' : ''}">${icon(p.areas.includes(d.id) ? 'check' : 'minus')}${tx(d.name)}</span>`).join('')}</div>` })}
          ${ui.card({ title: L('Licences & certifications', 'التراخيص والشهادات'), body: M.certs(p).map(([n, id, v]) => `<div class="mk-cert"><span class="ci">${icon('award')}</span><div class="grow"><b>${tx(n)}</b><small>${ui.idMono(id)} · ${tx(v)}</small></div></div>`).join('') + `<div style="margin-top:14px">${ui.demoNote(L('Licence numbers are fictional.', 'أرقام التراخيص وهمية.'))}</div>` })}
        </div>
      </div>
      <div class="mk-mobile-cta"><div class="grow"><b>${B.money(M.fromPrice(p.id))}</b><small>${L('starting price', 'سعر البدء')} · ${M.rating(p.rating)}</small></div>${isMe ? ui.btn(L('Requests', 'الطلبات'), { kind: 'primary', go: 'provider-requests' }) : ui.btn(L('Request service', 'اطلب خدمة'), { kind: 'primary', act: 'mkRequest', arg: p.id })}</div>
    </div>`;
  };

  /* ---------------- page: service details ---------------- */
  const STEPS = [
    [T('Send your request', 'أرسل طلبك'), T('Building and unit come from your BENA identity.', 'المبنى والوحدة من هويتك في بينا.')],
    [T('Receive a fixed quote', 'استلم عرضاً ثابتاً'), T('Usually within the provider’s response time.', 'عادةً خلال زمن استجابة المزوّد.')],
    [T('Visit & work', 'الزيارة والتنفيذ'), T('Track the technician and get a photo report.', 'تابع الفني واستلم تقريراً مصوّراً.')],
    [T('Pay & rate', 'ادفع وقيّم'), T('The receipt is saved to your service history.', 'يُحفظ الإيصال في سجل خدماتك.')],
  ];
  B.shared.servicedetail = (id) => {
    const [pid, si] = String(id || '').split('~');
    const p = M.provider(pid);
    const s = p && M.services(pid)[+si || 0];
    B.navActive('services');
    if (!s) return ui.empty({ icon: 'search', title: L('Service not found', 'لم يتم العثور على الخدمة'), action: ui.btn(L('Browse services', 'تصفّح الخدمات'), { kind: 'primary', go: `${R()}-services` }) });
    B.title(tx(s.name));
    const c = D.cat(s.cat);
    const others = M.services(pid).filter((x) => x.i !== s.i).slice(0, 4);
    const rv = M.reviews(pid).filter((r) => r.cat === s.cat).slice(0, 2);
    const alt = M.providers().filter((x) => x.id !== pid && x.cats.includes(s.cat)).slice(0, 3);
    const isMe = R() === 'provider' && pid === 'sp_jaber';
    return `<div class="mk-wrap mk-has-cta">
      <button class="btn btn-text" style="padding:0;margin:4px 0 12px" data-go="${R()}-provider-${pid}">${icon('arrowLeft', 'flip')}<span>${tx(p.name)}</span></button>
      <div class="mk-sd-hero">
        <div class="art">${M.cover(p, 300)}<div class="big"><span>${icon(c.icon)}</span></div></div>
        <div class="body">
          <span class="mk-tag" style="align-self:flex-start">${icon(c.icon)}${tx(c.name)}</span>
          <h1>${tx(s.name)}</h1>
          <p class="muted" style="font-size:14.5px">${tx(s.d)}</p>
          <div class="row wrap" style="gap:18px;margin-top:4px">
            <div><div class="xs faint">${L('From', 'ابتداءً من')}</div><div style="font-family:var(--font-display);font-size:26px;font-weight:750" class="num">${B.money(s.price)} <span class="small faint" style="font-weight:500">${M.unitLabel(s.unit)}</span></div></div>
            <div><div class="xs faint">${L('Duration', 'المدة')}</div><div class="strong">${tx(s.dur)}</div></div>
          </div>
          <div class="row-sm wrap" style="margin-top:6px">${isMe ? ui.btn(L('Edit in company profile', 'تعديل في ملف الشركة'), { icon: 'edit', go: 'provider-profile' }) : ui.btn(L('Request this service', 'اطلب هذه الخدمة'), { kind: 'primary', size: 'lg', act: 'mkRequest', arg: `${pid}~${s.i}` })}${ui.btn('', { icon: 'heart', act: 'toast', arg: L('Saved to favourites', 'تمت الإضافة للمفضلة'), title: L('Save', 'حفظ'), size: 'lg' })}</div>
        </div>
      </div>
      <div class="grid g-main" style="margin-top:20px;align-items:start">
        <div class="stack">
          ${ui.card({ title: L('What’s included', 'ما الذي تشمله الخدمة'), body: `<div class="mk-inc">${(INCLUDES[s.cat] || []).map((x) => `<span>${icon('checkCircle')}${tx(x)}</span>`).join('')}</div><div class="divider" style="margin:16px 0"></div><div class="eyebrow" style="margin-bottom:10px">${L('Not included', 'غير مشمول')}</div><div class="mk-inc no">${EXCLUDES.map((x) => `<span>${icon('xCircle')}${tx(x)}</span>`).join('')}</div>` })}
          ${ui.card({ title: L('How it works', 'كيف تعمل'), body: ui.timeline(STEPS.map(([t, m], i) => ({ title: t, meta: m, icon: ['send', 'receipt', 'wrench', 'star'][i], state: i === 0 ? 'current' : '' }))) })}
          ${rv.length ? ui.card({ title: L('Reviews for this service', 'مراجعات هذه الخدمة'), body: rv.map(M.reviewItem).join(''), link: { label: L('All reviews', 'كل المراجعات'), go: `${R()}-provider-${pid}` } }) : ''}
        </div>
        <div class="stack">
          ${ui.card({ title: L('Provided by', 'يقدّمها'), body: `<button class="row" style="width:100%;text-align:start" data-go="${R()}-provider-${pid}">${M.logo(p, 'sm')}<span class="grow"><b style="display:block">${tx(p.name)}</b><span class="row-sm" style="margin-top:2px">${M.rating(p.rating, p.reviews)}</span></span>${icon('chevR', 'flip chev faint')}</button>
            <div class="stack-sm" style="margin-top:14px;font-size:13.5px"><div class="row-sm">${icon('shieldCheck', 'faint')}${L('Workmanship warranty: 3–12 months', 'ضمان العمل: 3–12 شهراً')}</div><div class="row-sm">${icon('clock', 'faint')}${L('Responds', 'يرد خلال')} ${tx(p.response)}</div><div class="row-sm">${icon('pin', 'faint')}${esc(M.areasText(p, 4))}</div></div>` })}
          ${others.length ? ui.card({ title: L('More from this provider', 'المزيد من هذا المزوّد'), body: ui.list(others.map((o) => ui.li({ icon: D.cat(o.cat).icon, tone: 'mint', title: tx(o.name), sub: `${B.money(o.price)} ${M.unitLabel(o.unit)}`, go: `${R()}-servicedetail-${pid}~${o.i}` }))) }) : ''}
          ${alt.length ? ui.card({ title: L('Compare with', 'قارن مع'), body: ui.list(alt.map((o) => ui.li({ lead: M.logo(o, 'sm'), title: tx(o.name), sub: `${L('From', 'ابتداءً من')} ${B.money(M.fromPrice(o.id))} · ★ ${B.num1(o.rating)}`, go: `${R()}-provider-${o.id}` }))) }) : ''}
        </div>
      </div>
      ${isMe ? '' : `<div class="mk-mobile-cta"><div class="grow"><b>${B.money(s.price)}</b><small>${M.unitLabel(s.unit)} · ${tx(s.dur)}</small></div>${ui.btn(L('Request', 'اطلب'), { kind: 'primary', act: 'mkRequest', arg: `${pid}~${s.i}` })}</div>`}
    </div>`;
  };

  /* ---------------- request flow (modal stepper) ---------------- */
  const FLOW_STEPS = [T('Service', 'الخدمة'), T('Location', 'الموقع'), T('Details', 'التفاصيل'), T('Review', 'المراجعة')];
  let rq = null;
  const flowModal = (o) => {
    const existing = document.querySelector('.scrim .modal[data-flow]');
    if (!existing) { const w = B.modal(o); w.querySelector('.modal').setAttribute('data-flow', '1'); return w; }
    const inner = `<div class="modal-head"><div class="grow"><h3>${o.title}</h3>${o.sub ? `<p>${o.sub}</p>` : ''}</div><button class="icon-btn" type="button" data-act="closeModal" aria-label="${L('Close', 'إغلاق')}">${icon('x')}</button></div>
      <div class="modal-body">${o.body}</div>${o.foot ? `<div class="modal-foot">${o.foot}</div>` : ''}`;
    existing.className = `modal ${o.size || 'md'}`;
    existing.innerHTML = `<div class="grabber"></div>${o.form ? `<form data-submit="${o.form}" style="display:contents">${inner}</form>` : inner}`;
    return existing.closest('.scrim');
  };
  M.flowModal = flowModal;
  const placesFor = () => {
    const c = M.ctx();
    const blds = [...new Set(c.places.map((p) => p.bid))];
    return { c, blds };
  };
  const unitOpts = (bid) => {
    const c = M.ctx();
    const mineUnits = c.places.filter((p) => p.bid === bid && p.unit).map((p) => p.unit);
    const list = mineUnits.length ? mineUnits.map((id) => D.unit(id)).filter(Boolean) : D.unitsOf(bid);
    return [{ v: '', l: L('Common areas (whole building)', 'المناطق المشتركة (المبنى كاملاً)') }].concat(list.map((u) => ({ v: u.id, l: `${D.unitLabel(u)} · ${L('floor', 'الطابق')} ${u.floor}` })));
  };
  const renderFlow = () => {
    const p = rq.pid && M.provider(rq.pid);
    const stepper = ui.stepper(FLOW_STEPS, rq.step);
    let body = '', foot = '';
    const back = rq.step > 0 ? `<button type="button" class="btn btn-ghost" data-act="mkRqBack">${icon('arrowLeft', 'flip')}<span>${L('Back', 'رجوع')}</span></button>` : `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button>`;
    const next = (label) => `<button type="submit" class="btn btn-primary">${label || L('Continue', 'متابعة')}${icon('arrowRight', 'flip')}</button>`;
    const provSum = p ? `<div class="mk-flow-sum">${M.logo(p, 'sm')}<div class="grow"><b style="display:block;font-size:14px">${tx(p.name)}</b><span class="xs muted">${M.rating(p.rating, p.reviews)}</span></div>${M.verified(p)}</div>` : '';
    if (rq.step === 0) {
      const svcOpts = p ? [{ v: '', l: L('Not sure — describe the job instead', 'لست متأكداً — سأصف المهمة') }].concat(M.services(p.id).map((s) => ({ v: String(s.i), l: `${tx(s.name)} · ${B.money(s.price)} ${M.unitLabel(s.unit)}` }))) : null;
      const cats = p ? D.serviceCats.filter((c) => p.cats.includes(c.id)) : D.serviceCats;
      body = `${stepper}${provSum}
        ${ui.field({ name: 'cat', type: 'radio', label: L('What do you need?', 'ما الذي تحتاجه؟'), value: rq.cat, options: cats.map((c) => ({ v: c.id, l: c.name, icon: c.icon })) })}
        ${svcOpts ? ui.field({ name: 'si', type: 'select', label: L('Service', 'الخدمة'), value: rq.si ?? '', options: svcOpts }) : ''}
        ${p ? ui.field({ name: 'who', type: 'radio', label: L('Who should quote?', 'من يقدّم العرض؟'), value: rq.who || 'only', options: [{ v: 'only', l: L(`Only ${tx(p.name)}`, `${tx(p.name)} فقط`), d: L('Direct request to this provider', 'طلب مباشر لهذا المزوّد') }, { v: 'three', l: L('Also invite 2 similar providers', 'ادعُ مزوّدَين مشابهَين أيضاً'), d: L('Compare up to 3 quotes', 'قارن حتى 3 عروض') }] }) : `<div style="margin-top:14px">${ui.callout(L('BENA will invite up to <b>3 verified providers</b> that cover your area to send a quote.', 'ستدعو بينا حتى <b>3 مزوّدين موثّقين</b> يغطّون منطقتك لإرسال عروضهم.'), 'mint', 'sparkles')}</div>`}`;
      foot = back + next();
    } else if (rq.step === 1) {
      const { c, blds } = placesFor();
      body = `${stepper}
        ${c.customer ? ui.callout(L('Pre-filled from your BENA identity. Providers only see the exact unit after you accept a quote.', 'تمت التعبئة من هويتك في بينا. لا يرى المزوّدون رقم الوحدة إلا بعد قبول العرض.'), 'mint', 'fingerprint') : ''}
        <div style="margin-top:14px">${ui.field({ name: 'bid', type: 'select', label: L('Building', 'المبنى'), value: rq.bid, options: blds.map((id) => ({ v: id, l: `${tx(D.building(id).name)} — ${id}` })) })}</div>
        <div id="mk-unit-wrap">${ui.field({ name: 'unit', type: 'select', label: L('Unit or area', 'الوحدة أو المنطقة'), value: rq.unit || '', options: unitOpts(rq.bid) })}</div>
        ${ui.field({ name: 'access', label: L('Access notes (optional)', 'ملاحظات الوصول (اختياري)'), value: rq.access || '', placeholder: L('e.g. Ring the concierge, parking level −1', 'مثال: اتصل بالحارس، موقف الطابق −1') })}`;
      foot = back + next();
    } else if (rq.step === 2) {
      const minD = '2026-11-26';
      body = `${stepper}
        ${ui.field({ name: 'title', label: L('Short title', 'عنوان مختصر'), value: rq.title || '', required: true, placeholder: L('e.g. Kitchen tap dripping', 'مثال: حنفية المطبخ تُنقّط') })}
        ${ui.field({ name: 'desc', type: 'textarea', label: L('Describe the problem', 'صِف المشكلة'), value: rq.desc || '', placeholder: L('What happened, since when, anything you already tried…', 'ماذا حدث ومنذ متى وما الذي جربته…') })}
        ${ui.field({ name: 'photos', type: 'file', label: L('Photos (optional)', 'صور (اختياري)'), placeholder: L('Up to 6 photos help providers quote accurately', 'حتى 6 صور تساعد المزوّدين على التسعير بدقة') })}
        <div class="form-grid" style="margin-top:14px">
          ${ui.field({ name: 'date', type: 'date', label: L('Preferred date', 'التاريخ المفضّل'), value: rq.date || '2026-11-28', min: minD })}
          ${ui.field({ name: 'urgency', type: 'select', label: L('Urgency', 'الأولوية'), value: rq.urgency || 'normal', options: [{ v: 'normal', l: L('Normal — within a week', 'عادية — خلال أسبوع') }, { v: 'soon', l: L('Soon — within 48 hours', 'قريباً — خلال 48 ساعة') }, { v: 'emergency', l: L('Emergency — today', 'طارئة — اليوم') }] })}
        </div>
        <div style="margin-top:14px">${ui.field({ name: 'slot', type: 'radio', label: L('Time window', 'الفترة الزمنية'), value: rq.slot || 'morning', options: [{ v: 'morning', l: L('Morning', 'صباحاً'), d: '08:00–12:00' }, { v: 'afternoon', l: L('Afternoon', 'بعد الظهر'), d: '12:00–16:00' }, { v: 'evening', l: L('Evening', 'مساءً'), d: '16:00–19:00' }] })}</div>`;
      foot = back + next();
    } else {
      const b = D.building(rq.bid);
      const u = rq.unit && D.unit(rq.unit);
      const s = p && rq.si !== '' && rq.si != null ? M.services(p.id)[+rq.si] : null;
      const slotL = { morning: L('Morning 08:00–12:00', 'صباحاً 08:00–12:00'), afternoon: L('Afternoon 12:00–16:00', 'بعد الظهر 12:00–16:00'), evening: L('Evening 16:00–19:00', 'مساءً 16:00–19:00') }[rq.slot] || '';
      body = `${stepper}
        <div class="mk-flow-sum"><span class="li-icon navy">${icon(D.cat(rq.cat).icon)}</span><div class="grow"><b style="display:block;font-size:14.5px">${esc(rq.title)}</b><span class="xs muted">${tx(D.cat(rq.cat).name)}${s ? ' · ' + tx(s.name) : ''}</span></div></div>
        ${ui.kv([
          [L('Quotes from', 'العروض من'), p ? (rq.who === 'three' ? L(`${tx(p.name)} + 2 similar`, `${tx(p.name)} + 2 مشابهين`) : tx(p.name)) : L('Up to 3 verified providers', 'حتى 3 مزوّدين موثّقين')],
          [L('Building', 'المبنى'), `${esc(tx(b.name))}<div class="xs faint">${ui.idMono(b.id)}</div>`],
          [L('Unit / area', 'الوحدة / المنطقة'), u ? esc(D.unitLabel(u)) : L('Common areas', 'المناطق المشتركة')],
          [L('Preferred time', 'الموعد المفضّل'), `${B.date(rq.date)} · ${slotL}`],
          [L('Requested by', 'مقدّم الطلب'), esc(D.pname(M.ctx().me))],
          s ? [L('Starting price', 'سعر البدء'), `${B.money(s.price)} ${M.unitLabel(s.unit)}`] : null,
        ])}
        ${rq.desc ? `<div class="callout dashed small" style="margin-top:12px">${icon('doc')}<div>${esc(rq.desc)}</div></div>` : ''}
        <label class="check" style="margin-top:16px"><input type="checkbox" name="consent" checked required><span>${L('Share my name and phone number with providers who quote', 'شارك اسمي ورقم هاتفي مع المزوّدين الذين يقدّمون عروضاً')}</span></label>`;
      foot = back + `<button type="submit" class="btn btn-primary">${icon('send')}<span>${L('Send request', 'أرسل الطلب')}</span></button>`;
    }
    const w = flowModal({ title: p ? L('Request service', 'طلب خدمة') : L('New service request', 'طلب خدمة جديد'), sub: tx(FLOW_STEPS[rq.step]) + ` · ${L('Step', 'الخطوة')} ${rq.step + 1}/4`, body: `<div class="mk-flow">${body}</div>`, foot, form: 'mkRq', size: 'md' });
    const bsel = w.querySelector('select[name=bid]');
    if (bsel) bsel.addEventListener('change', () => { rq.bid = bsel.value; rq.unit = ''; w.querySelector('#mk-unit-wrap').innerHTML = ui.field({ name: 'unit', type: 'select', label: L('Unit or area', 'الوحدة أو المنطقة'), value: '', options: unitOpts(rq.bid) }); });
    const mb = w.querySelector('.modal-body');
    if (mb) mb.scrollTop = 0;
  };
  /** Open the request flow. arg: '' | 'cat:<id>' | '<providerId>' | '<providerId>~<serviceIndex>' */
  B.act.mkRequest = (arg = '') => {
    const c = M.ctx();
    rq = { step: 0, pid: null, si: '', cat: 'plumbing', who: 'only', bid: c.home.bid, unit: c.home.unit || '', slot: 'morning', date: '2026-11-28', urgency: 'normal' };
    if (arg.startsWith('cat:')) rq.cat = arg.slice(4);
    else if (arg) {
      const [pid, si] = arg.split('~');
      const p = M.provider(pid);
      if (p) { rq.pid = pid; rq.cat = p.cats[0]; if (si != null) { const s = M.services(pid)[+si]; if (s) { rq.si = String(s.i); rq.cat = s.cat; rq.title = tx(s.name); } } }
    }
    const ex = document.querySelector('.scrim .modal[data-flow]');
    if (ex) ex.removeAttribute('data-flow');
    renderFlow();
  };
  B.act.mkRqBack = () => { rq.step = Math.max(0, rq.step - 1); renderFlow(); };
  B.submit.mkRq = (data) => {
    if (!rq) return;
    Object.keys(data).forEach((k) => { if (k !== 'photos' && k !== 'consent') rq[k] = data[k]; });
    if (rq.step === 0 && rq.pid && rq.si !== '' && !rq.title) { const s = M.services(rq.pid)[+rq.si]; if (s) rq.title = tx(s.name); }
    if (rq.step < 3) { rq.step++; renderFlow(); return; }
    const c = M.ctx();
    const id = `SR-26-${String(1200 + M.created.length * 7 + (hash(rq.title || 'x') % 7))}`;
    const invited = rq.pid ? (rq.who === 'three' ? M.quotesFor({ id, building: rq.bid, cat: rq.cat, provider: rq.pid }).map((x) => x.pid) : [rq.pid]) : M.quotesFor({ id, building: rq.bid, cat: rq.cat }).map((x) => x.pid);
    const rec = { id, building: rq.bid, unit: rq.unit || null, by: c.me, role: c.role, cat: rq.cat, title: { en: rq.title, ar: rq.title }, desc: rq.desc ? { en: rq.desc, ar: rq.desc } : null, status: 'open', priority: rq.urgency === 'emergency' ? 'high' : rq.urgency === 'soon' ? 'medium' : 'low', created: '2026-11-25', provider: null, invited, direct: rq.pid && rq.who !== 'three' ? rq.pid : null, scope: rq.unit ? 'unit' : 'common', pref: { date: rq.date, slot: rq.slot }, access: rq.access, mkt: true };
    M.created.unshift(rec);
    const ex = document.querySelector('.scrim .modal[data-flow]');
    if (ex) ex.removeAttribute('data-flow');
    B.success({ title: L('Request sent', 'تم إرسال الطلب'), text: invited.length > 1 ? L(`${invited.length} verified providers have been invited to quote. You’ll be notified as quotes arrive.`, `تمت دعوة ${invited.length} مزوّدين موثّقين لتقديم عروضهم. سيصلك إشعار عند وصول العروض.`) : L(`${tx(M.provider(invited[0]).name)} will send you a quote, usually within ${tx(M.provider(invited[0]).response)}.`, `سيرسل لك ${tx(M.provider(invited[0]).name)} عرضاً، عادةً خلال ${tx(M.provider(invited[0]).response)}.`), ref: id, done: `${c.role}-quotes-${id}`, doneLabel: L('View quotes', 'عرض العروض') });
    const foot = document.querySelector('.scrim .modal-foot');
    if (foot) foot.insertAdjacentHTML('afterbegin', `<button class="btn btn-ghost btn-block" data-act="closeModal">${L('Close', 'إغلاق')}</button>`);
    rq = null;
    B.refresh();
  };

  /* ---------------- page: quotes comparison ---------------- */
  B.shared.quotes = (rid) => {
    B.navActive(R() === 'provider' ? 'quotations' : 'services');
    const role = R();
    if (!rid) {
      const open = M.myRequests().filter((q) => ['open', 'quoted'].includes(q.status));
      B.title(L('Quotes', 'العروض'));
      return `<div class="mk-wrap">${ui.pageHead({ title: L('Quotes to compare', 'عروض للمقارنة'), sub: L('Requests waiting for your decision', 'طلبات بانتظار قرارك'), actions: ui.btn(L('New request', 'طلب جديد'), { kind: 'primary', icon: 'plus', act: 'mkRequest' }) })}
        ${open.length ? `<div class="card pad-0">${open.map((q) => `<button class="mk-hist" style="width:100%;text-align:start" data-go="${role}-quotes-${q.id}"><span class="hi">${icon(D.cat(q.cat).icon)}</span><span class="hb"><span class="ht"><b>${esc(tx(q.title))}</b>${ui.status(q.status === 'open' ? 'collecting' : q.status)}</span><span class="hs">${esc(M.placeLabel({ bid: q.building, unit: q.unit }))} · ${ui.idMono(q.id)}</span><span class="hs">${L(`${M.quotesFor(q).length} quotes received`, `تم استلام ${M.quotesFor(q).length} عروض`)}</span></span></button>`).join('')}</div>`
          : `<div class="card">${ui.empty({ icon: 'receipt', title: L('No quotes waiting', 'لا توجد عروض بانتظارك'), text: L('Post a request and verified providers will send you fixed quotes to compare.', 'انشر طلباً وسيرسل لك مزوّدون موثّقون عروضاً ثابتة للمقارنة.'), action: ui.btn(L('Request service', 'اطلب خدمة'), { kind: 'primary', act: 'mkRequest' }) })}</div>`}</div>`;
    }
    const q = M.request(rid);
    if (!q) return ui.empty({ icon: 'search', title: L('Request not found', 'لم يتم العثور على الطلب'), action: ui.btn(L('Service history', 'سجل الخدمات'), { kind: 'primary', go: `${role}-servicehistory` }) });
    B.title(L('Compare quotes', 'مقارنة العروض'));
    const quotes = M.quotesFor(q);
    const decided = M.accepted[q.id] || (['assigned', 'scheduled', 'inProgress', 'completed', 'resolved'].includes(q.status) ? q.provider : null);
    const minP = Math.min(...quotes.map((x) => x.amount));
    const maxR = Math.max(...quotes.map((x) => x.p.rating));
    const minE = Math.min(...quotes.map((x) => x.eta));
    const b = D.building(q.building);
    const flag = (x) => (x.amount === minP ? ui.badge(L('Best price', 'أفضل سعر'), 'mint', 'tag') : x.p.rating === maxR ? ui.badge(L('Top rated', 'الأعلى تقييماً'), 'navy', 'star') : x.eta === minE ? ui.badge(L('Fastest', 'الأسرع'), 'info', 'zap') : '');
    const canAct = !decided && ['open', 'quoted'].includes(q.status);
    return `<div class="mk-wrap">
      <button class="btn btn-text" style="padding:0;margin:4px 0 12px" data-act="back">${icon('arrowLeft', 'flip')}<span>${L('Back', 'رجوع')}</span></button>
      <div class="card"><div class="mk-req-sum"><span class="ri">${icon(D.cat(q.cat).icon)}</span><div class="grow"><div class="row-sm wrap">${ui.idMono(q.id)}${ui.status(decided ? 'accepted' : q.status === 'open' ? 'collecting' : q.status)}</div><h1 style="font-size:22px;margin-top:6px">${esc(tx(q.title))}</h1><div class="small muted" style="margin-top:4px">${b ? esc(M.placeLabel({ bid: q.building, unit: q.unit })) + ' · ' : ''}${L('Requested', 'تاريخ الطلب')} ${B.date(q.created)}</div></div>
        ${b ? ui.btn(L('Building profile', 'ملف المبنى'), { icon: 'building', size: 'sm', go: `${role}-building-${b.id}` }) : ''}</div></div>
      <div class="mk-sec"><div><h2>${decided ? L('Quote accepted', 'تم قبول العرض') : L(`${quotes.length} quotes, side by side`, quotes.length === 2 ? 'عرضان جنباً إلى جنب' : `${quotes.length} عروض جنباً إلى جنب`)}</h2><p>${decided ? L('The other quotes were closed automatically.', 'تم إغلاق العروض الأخرى تلقائياً.') : L('Prices are fixed for the stated scope. Accepting one closes the others.', 'الأسعار ثابتة للنطاق المحدد. قبول أحدها يغلق البقية.')}</p></div></div>
      ${quotes.length > 1 ? `<div class="mk-swipe">${icon('arrowRight', 'flip')}${L('Swipe to compare', 'اسحب للمقارنة')}</div>` : ''}
      <div class="mk-qgrid" style="--n:${quotes.length}">${quotes.map((x) => {
        const won = decided === x.pid, lost = decided && !won;
        const f = !decided ? flag(x) : won ? ui.badge(L('Accepted', 'مقبول'), 'navy', 'check') : '';
        return `<div class="mk-q ${won ? 'won' : lost ? 'lost' : x.amount === minP && !decided ? 'best' : ''}">${f ? `<span class="flag">${f}</span>` : ''}
          <button class="row" style="text-align:start;width:100%" data-go="${role}-provider-${x.pid}">${M.logo(x.p, 'sm')}<span class="grow" style="min-width:0"><b style="display:block;font-size:14.5px;line-height:1.3">${tx(x.p.name)}</b><span class="row-sm" style="margin-top:3px;gap:8px">${M.rating(x.p.rating, x.p.reviews)}</span></span></button>
          <div><div class="amt">${B.money(x.amount)}</div><div class="xs faint" style="margin-top:4px">${L('incl. VAT · valid until', 'شامل الضريبة · ساري حتى')} ${B.dateShort(x.valid)}</div></div>
          <div class="rows">
            <div><span>${icon('clock')}${L('Can start', 'يمكن البدء')}</span><b>${x.eta === 1 ? L('Tomorrow', 'غداً') : L(`In ${x.eta} days`, `خلال ${x.eta} أيام`)}</b></div>
            <div><span>${icon('shieldCheck')}${L('Warranty', 'الضمان')}</span><b>${L(`${x.warranty} months`, `${x.warranty} أشهر`)}</b></div>
            <div><span>${icon('star')}${L('Rating', 'التقييم')}</span><b>${B.num1(x.p.rating)} / 5</b></div>
            <div><span>${icon('badgeCheck')}${L('Verified', 'موثّق')}</span><b>${x.p.verified ? L('Yes', 'نعم') : L('Not yet', 'ليس بعد')}</b></div>
          </div>
          <div class="items">${x.items.map(([n, v]) => `<div><span>${tx(n)}</span><span>${B.money(v)}</span></div>`).join('')}<div class="faint">${tx(x.visit)}</div></div>
          <div class="actions">${canAct ? `${ui.btn(L('Details', 'التفاصيل'), { act: 'mkQuoteInfo', arg: `${q.id}|${x.pid}` })}${ui.btn(L('Accept', 'قبول'), { kind: x.amount === minP ? 'primary' : 'dark', act: 'mkAccept', arg: `${q.id}|${x.pid}` })}` : won ? ui.btn(L('Message provider', 'راسل المزوّد'), { icon: 'chat', act: 'soon', arg: L('Messaging', 'المراسلة'), block: true }) : ui.btn(L('View provider', 'عرض المزوّد'), { go: `${role}-provider-${x.pid}`, block: true })}</div>
        </div>`;
      }).join('')}</div>
      ${canAct && quotes.length < 2 && q.mkt ? `<div class="card" style="margin-top:14px"><div class="row wrap between"><div><b>${L('Want to compare?', 'تريد المقارنة؟')}</b><div class="small muted">${L('Invite 2 more verified providers to quote on the same request.', 'ادعُ مزوّدَين موثّقَين آخرين للتسعير على نفس الطلب.')}</div></div>${ui.btn(L('Invite 2 more', 'ادعُ اثنين آخرين'), { icon: 'userPlus', act: 'mkInviteMore', arg: q.id })}</div></div>` : ''}
      <div style="margin-top:18px">${ui.callout(L('Payment is only due after the work is completed and you confirm it in BENA. Quotes are fictional demo data.', 'لا يُستحق الدفع إلا بعد إنجاز العمل وتأكيدك له في بينا. العروض بيانات تجريبية وهمية.'), '', 'info')}</div>
    </div>`;
  };
  B.act.mkInviteMore = (rid) => {
    const q = M.request(rid);
    const b = D.building(q.building) || {};
    const more = M.providers().filter((p) => p.cats.includes(q.cat) && !q.invited.includes(p.id)).sort((a, c) => (c.areas.includes(b.district) - a.areas.includes(b.district)) || c.rating - a.rating).slice(0, 2);
    if (!more.length) { B.toast(L('No other providers cover this category yet', 'لا يوجد مزوّدون آخرون لهذه الفئة بعد'), 'info'); return; }
    q.invited = q.invited.concat(more.map((p) => p.id));
    B.toast(L(`${more.length} more providers invited — quotes received`, `تمت دعوة ${more.length} مزوّدين آخرين — وصلت العروض`));
    B.refresh();
  };
  B.act.mkQuoteInfo = (arg) => {
    const [rid, pid] = arg.split('|');
    const q = M.request(rid);
    const x = M.quotesFor(q).find((y) => y.pid === pid);
    B.modal({ title: L('Quote details', 'تفاصيل العرض'), sub: `${tx(x.p.name)} · ${x.id}`, size: 'sm',
      body: `<div class="mk-receipt">${x.items.map(([n, v]) => `<div class="rl"><span>${tx(n)}</span><b class="num">${B.money(v)}</b></div>`).join('')}<div class="rl"><span class="strong">${L('Total (incl. VAT)', 'المجموع (شامل الضريبة)')}</span><span class="tot num">${B.money(x.amount)}</span></div></div>
        <div style="margin-top:14px">${ui.kv([[L('Warranty', 'الضمان'), L(`${x.warranty} months on workmanship`, `${x.warranty} أشهر على العمل`)], [L('Valid until', 'ساري حتى'), B.date(x.valid)], [L('Visit', 'الزيارة'), tx(x.visit)]])}</div>`,
      foot: `${ui.btn(L('Close', 'إغلاق'), { act: 'closeModal' })}${ui.btn(L('Accept quote', 'قبول العرض'), { kind: 'primary', act: 'mkAccept', arg })}` });
  };
  B.act.mkAccept = (arg) => {
    const [rid, pid] = arg.split('|');
    const q = M.request(rid);
    const x = M.quotesFor(q).find((y) => y.pid === pid);
    B.confirm({ title: L(`Accept ${tx(x.p.name)}’s quote?`, `قبول عرض ${tx(x.p.name)}؟`), text: L(`${B.money(x.amount)} · ${x.warranty}-month warranty. The other quotes will be declined automatically.`, `${B.money(x.amount)} · ضمان ${x.warranty} أشهر. سيتم رفض العروض الأخرى تلقائياً.`), ok: L('Accept quote', 'قبول العرض'),
      onOk: () => {
        M.accepted[rid] = pid;
        if (q.mkt) { q.status = 'scheduled'; q.provider = pid; q.amount = x.amount; q.visit = new Date(2026, 10, 25 + x.eta).toISOString().slice(0, 10); }
        B.success({ title: L('Quote accepted', 'تم قبول العرض'), text: L(`${tx(x.p.name)} will confirm the visit for ${B.date(new Date(2026, 10, 25 + x.eta))}. You can follow progress in your service history.`, `سيؤكد ${tx(x.p.name)} موعد الزيارة في ${B.date(new Date(2026, 10, 25 + x.eta))}. يمكنك متابعة التقدّم في سجل خدماتك.`), ref: `BK-${x.id.slice(3)}-${rid.slice(-3)}`, done: `${R()}-servicehistory`, doneLabel: L('Go to service history', 'الذهاب لسجل الخدمات') });
        B.refresh();
      } });
  };

  /* ---------------- page: service history ---------------- */
  const STAGES = ['open', 'quoted', 'scheduled', 'inProgress', 'completed'];
  const stageIdx = (s) => ({ open: 0, quoted: 1, assigned: 2, scheduled: 2, inProgress: 3, completed: 4, resolved: 4 }[s] ?? 0);
  B.shared.servicehistory = () => {
    const role = R();
    B.navActive(B.roles[role] && B.roles[role].menu.some((m) => m.id === 'servicehistory') ? 'servicehistory' : 'services');
    B.title(L('Service history', 'سجل الخدمات'));
    const all = M.myRequests();
    const f = B.get('mk:hf', 'all');
    const list = all.filter((q) => f === 'all' || (f === 'active' ? !['completed', 'resolved', 'cancelled'].includes(q.status) : ['completed', 'resolved'].includes(q.status)));
    const done = all.filter((q) => ['completed', 'resolved'].includes(q.status));
    const spent = B.sum(done.filter((q) => String(q.closed || q.created).startsWith('2026')), (q) => M.amountOf(q));
    const ratings = done.map((q) => M.rated[q.id] || q.rating).filter(Boolean);
    const prov = (q) => q.provider && M.provider(q.provider);
    return `<div class="mk-wrap">
      ${ui.pageHead({ title: L('Service history', 'سجل الخدمات'), sub: L('Requests, quotes, visits and receipts for your places — in one timeline.', 'الطلبات والعروض والزيارات والإيصالات لأماكنك — في سجل واحد.'), actions: `${ui.btn(L('Browse services', 'تصفّح الخدمات'), { icon: 'search', go: `${role}-services` })}${ui.btn(L('New request', 'طلب جديد'), { kind: 'primary', icon: 'plus', act: 'mkRequest' })}` })}
      <div class="grid g4" style="margin-bottom:18px">
        ${ui.kpi({ label: L('Active requests', 'طلبات نشطة'), value: all.length - done.length, icon: 'activity', tone: 'mint' })}
        ${ui.kpi({ label: L('Completed jobs', 'مهام منجزة'), value: done.length, icon: 'checkCircle', tone: 'info' })}
        ${ui.kpi({ label: L('Spent in 2026', 'الإنفاق في 2026'), value: B.money(spent), icon: 'wallet', tone: 'violet' })}
        ${ui.kpi({ label: L('Avg. rating given', 'متوسط التقييم الممنوح'), value: ratings.length ? B.num1(B.sum(ratings) / ratings.length) : '—', unit: ratings.length ? '/ 5' : '', icon: 'star', tone: 'warn' })}
      </div>
      <div class="mk-toolbar">${ui.seg('mk:hf', [{ id: 'all', label: L('All', 'الكل') }, { id: 'active', label: L('Active', 'نشطة') }, { id: 'done', label: L('Completed', 'منجزة') }], f)}<span class="count"><b>${list.length}</b> ${L('records', 'سجل')}</span></div>
      ${list.length ? `<div class="card pad-0">${list.map((q) => {
        const p = prov(q);
        const isDone = ['completed', 'resolved'].includes(q.status);
        const st = q.status === 'open' ? 'collecting' : q.status;
        const rating = M.rated[q.id] || q.rating;
        const si = stageIdx(q.status);
        return `<div class="mk-hist"><span class="hi">${icon(D.cat(q.cat).icon)}</span><div class="hb">
          <div class="ht"><b>${esc(tx(q.title))}</b>${isDone && M.amountOf(q) ? `<span class="amt">${B.money(M.amountOf(q))}</span>` : ui.status(st)}</div>
          <div class="hs">${p ? esc(tx(p.name)) + ' · ' : ''}${esc(M.placeLabel({ bid: q.building, unit: q.unit }))}</div>
          <div class="hs faint">${ui.idMono(q.id)} · ${isDone ? L('Completed', 'أُنجز') + ' ' + B.date(q.closed || q.created) : L('Requested', 'طُلب') + ' ' + B.date(q.created)}${q.visit && !isDone ? ' · ' + L('Visit', 'الزيارة') + ' ' + B.dateShort(q.visit) : ''}</div>
          ${!isDone ? `<div class="mk-track">${STAGES.map((_, i) => `<i class="${i <= si ? 'on' : ''}"></i>`).join('')}</div>` : ''}
          <div class="ha">
            ${isDone ? `${rating ? `<span class="row-sm">${ui.stars(rating)}<span class="xs faint">${L('Your rating', 'تقييمك')}</span></span>` : ui.btn(L('Rate', 'قيّم'), { size: 'sm', kind: 'soft', icon: 'star', act: 'mkRate', arg: q.id })}${ui.btn(L('Receipt', 'الإيصال'), { size: 'sm', icon: 'receipt', act: 'mkReceipt', arg: q.id })}${p ? ui.btn(L('Book again', 'احجز مجدداً'), { size: 'sm', icon: 'refresh', act: 'mkRequest', arg: p.id }) : ''}`
              : `${['open', 'quoted'].includes(q.status) ? ui.btn(L('Compare quotes', 'قارن العروض'), { size: 'sm', kind: 'primary', go: `${role}-quotes-${q.id}` }) : ''}${p ? ui.btn(tx(p.name), { size: 'sm', go: `${role}-provider-${p.id}` }) : ''}${ui.btn(L('Message', 'مراسلة'), { size: 'sm', icon: 'chat', act: 'soon', arg: L('Messaging', 'المراسلة') })}`}
          </div></div></div>`;
      }).join('')}</div>` : `<div class="card">${ui.empty({ icon: 'history', title: L('Nothing here yet', 'لا يوجد شيء بعد'), text: L('Your service requests and receipts will appear here.', 'ستظهر هنا طلبات الخدمة والإيصالات.'), action: ui.btn(L('Request service', 'اطلب خدمة'), { kind: 'primary', act: 'mkRequest' }) })}</div>`}
    </div>`;
  };
  B.act.mkReceipt = (rid) => {
    const q = M.request(rid);
    const p = M.provider(q.provider);
    const tot = M.amountOf(q);
    const net = Math.round(tot / 1.16);
    B.modal({ title: L('Receipt', 'الإيصال'), sub: `${ui.idMono('RC-' + rid.replace(/^[A-Z]+-/, ''))} · ${B.date(q.closed || q.created)}`, size: 'sm',
      body: `<div class="mk-receipt"><div class="row between" style="margin-bottom:12px"><div class="row-sm">${p ? M.logo(p, 'sm') : ''}<b>${p ? tx(p.name) : ''}</b></div>${ui.status('paid')}</div>
        <div class="rl"><span>${esc(tx(q.title))}</span><b class="num">${B.money(Math.round(net * 0.7))}</b></div>
        <div class="rl"><span>${L('Materials', 'المواد')}</span><b class="num">${B.money(net - Math.round(net * 0.7))}</b></div>
        <div class="rl"><span class="muted">${L('VAT 16%', 'ضريبة القيمة المضافة 16%')}</span><b class="num">${B.money(tot - net)}</b></div>
        <div class="rl"><span class="strong">${L('Total paid', 'المجموع المدفوع')}</span><span class="tot num">${B.money(tot)}</span></div></div>
        <div style="margin-top:12px">${ui.kv([[L('Location', 'الموقع'), esc(M.placeLabel({ bid: q.building, unit: q.unit }))], [L('Paid with', 'طريقة الدفع'), L('Card via BENA (demo)', 'بطاقة عبر بينا (تجريبي)')]])}</div>`,
      foot: `${ui.btn(L('Share', 'مشاركة'), { icon: 'share', act: 'soon', arg: L('Sharing', 'المشاركة') })}${ui.btn(L('Download PDF', 'تنزيل PDF'), { kind: 'primary', icon: 'download', act: 'soon', arg: L('Download', 'التنزيل') })}` });
  };
  B.act.mkRate = (rid) => {
    const q = M.request(rid);
    B.modal({ title: L('Rate this job', 'قيّم هذه المهمة'), sub: esc(tx(q.title)), size: 'sm', form: 'mkRate',
      body: `<input type="hidden" name="rid" value="${esc(rid)}">${ui.field({ name: 'stars', type: 'radio', label: L('Overall', 'التقييم العام'), value: '5', options: [5, 4, 3, 2, 1].map((n) => ({ v: String(n), l: '★'.repeat(n), d: [L('Excellent', 'ممتاز'), L('Good', 'جيد'), L('Okay', 'مقبول'), L('Poor', 'ضعيف'), L('Bad', 'سيئ')][5 - n] })) })}
        <div style="margin-top:14px">${ui.field({ name: 'text', type: 'textarea', label: L('Review (optional)', 'مراجعة (اختياري)'), placeholder: L('What went well? What could be better?', 'ما الذي كان جيداً؟ وما الذي يمكن تحسينه؟') })}</div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Submit rating', 'إرسال التقييم'), { kind: 'primary', type: 'submit' })}` });
  };
  B.submit.mkRate = (d) => { M.rated[d.rid] = +d.stars || 5; B.success({ title: L('Thanks for your rating', 'شكراً على تقييمك'), text: L('Your review helps neighbours choose trusted providers.', 'تساعد مراجعتك جيرانك على اختيار مزوّدين موثوقين.') }); B.refresh(); };
})();
