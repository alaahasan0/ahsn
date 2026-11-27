/*
 * BENA property marketplace — shared pages reachable from every role.
 *   <role>-properties[-rent|-sale]   search (list / map)
 *   <role>-listing-<listingId>       listing details
 * Listings are tied to real BENA building IDs (and unit records where they exist).
 * Only units whose owners chose to publish them appear; vacancy alone never lists a unit.
 * All listings, prices and contacts are fictional demo data.
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon, ui } = B;
  const D = B.data;
  const T = (en, ar) => ({ en, ar });
  const M = (B.mkt = B.mkt || {});
  const R = () => B.route.role;

  /* ---------------- listings ---------------- */
  const X = (id, o) => ({ id, ...o });
  const LISTINGS = [
    X('LS-26-1102', { bid: 'BN-RAM-00142', unit: 'BN-RAM-00142-1102', mode: 'rent', type: 'residential', price: 2900, by: 'p_khaled', listed: '2026-11-17', avail: '2026-12-01', furnished: 'semi', views: 214, saves: 31, inquiries: 3,
      title: T('Bright 2-bedroom with valley views', 'شقة مشرقة بغرفتي نوم وإطلالة على الوادي'),
      desc: T('Eleventh-floor apartment in Al-Masyoun Residence Tower with a west-facing balcony, new kitchen fittings and a refreshed bathroom. Doors and fixtures were serviced in October. Building has 24/7 backup power, two elevators and a legally registered owners’ association.', 'شقة في الطابق الحادي عشر في برج الماصيون السكني مع شرفة غربية وتجهيزات مطبخ جديدة وحمّام مُجدّد. تمت صيانة الأبواب والتجهيزات في تشرين الأول. يتوفر في المبنى مولد احتياطي على مدار الساعة ومصعدان وجمعية مالكين مسجّلة قانونياً.') }),
    X('LS-26-0604', { bid: 'BN-RAM-00266', unit: 'BN-RAM-00266-604', mode: 'rent', type: 'residential', price: 2400, by: 'p_khaled', agent: 'org_arkan', listed: '2026-11-12', avail: '2026-12-05', furnished: 'no', views: 162, saves: 18, inquiries: 5,
      title: T('Freshly repainted 2-bedroom by Al-Masyoun Park', 'شقة بغرفتي نوم مدهونة حديثاً قرب حديقة الماصيون'),
      desc: T('Quiet sixth-floor unit, being repainted before viewings. Two bedrooms, open living and dining, and a covered parking space. Managed by Arkan Property Management on behalf of the owners.', 'وحدة هادئة في الطابق السادس يجري دهانها قبل المعاينات. غرفتا نوم ومساحة معيشة وطعام مفتوحة وموقف سيارة مغطى. تديرها أركان لإدارة العقارات نيابة عن المالكين.') }),
    X('LS-26-0303', { bid: 'BN-RAM-00142', unit: 'BN-RAM-00142-303', mode: 'rent', type: 'residential', price: 3400, by: 'p_dima', listed: '2026-11-20', avail: '2026-11-30', furnished: 'yes', views: 98, saves: 22, inquiries: 2,
      title: T('Furnished 3-bedroom family apartment', 'شقة عائلية مفروشة بثلاث غرف نوم'),
      desc: T('Spacious corner apartment, fully furnished with appliances. Two bathrooms, a separate laundry room and a large balcony over Al-Masyoun Street.', 'شقة زاوية واسعة مفروشة بالكامل مع الأجهزة. حمّامان وغرفة غسيل منفصلة وشرفة كبيرة تطل على شارع الماصيون.') }),
    X('LS-26-8303', { bid: 'BN-RAM-00087', unit: 'BN-RAM-00087-303', mode: 'rent', type: 'residential', price: 2700, by: 'p_layla', listed: '2026-11-08', avail: '2026-12-15', furnished: 'no', views: 141, saves: 16, inquiries: 4,
      title: T('3-bedroom with garden views in Al-Tireh', 'شقة بثلاث غرف وإطلالة على الحدائق في الطيرة'),
      desc: T('Third-floor apartment overlooking the olive terraces. Solar water heating, double-glazed windows and a residents’ committee that keeps common areas spotless.', 'شقة في الطابق الثالث تطل على مصاطب الزيتون. تسخين شمسي للمياه ونوافذ بزجاج مزدوج ولجنة سكان تحافظ على نظافة المناطق المشتركة.') }),
    X('LS-26-4501', { bid: 'BN-RAM-00415', unit: 'BN-RAM-00415-501', mode: 'rent', type: 'residential', price: 2600, by: 'p_mona', listed: '2026-11-03', avail: '2026-12-01', furnished: 'semi', views: 87, saves: 9, inquiries: 1,
      title: T('City apartment above Irsal Plaza', 'شقة في قلب المدينة فوق بلازا الإرسال'),
      desc: T('Two bedrooms on the fifth floor with shops, cafés and parking downstairs. Separate residential entrance and 24/7 security desk.', 'غرفتا نوم في الطابق الخامس مع محلات ومقاهٍ وموقف في الأسفل. مدخل سكني منفصل ومكتب أمن على مدار الساعة.') }),
    X('LS-26-5101', { bid: 'BN-RAM-00529', unit: 'BN-RAM-00529-101', mode: 'rent', type: 'residential', price: 2200, by: 'p_hala', listed: '2026-10-29', avail: '2026-12-01', furnished: 'semi', views: 233, saves: 47, inquiries: 6,
      title: T('Restored stone flat in the Old City', 'شقة حجرية مُرمّمة في البلدة القديمة'),
      desc: T('Vaulted ceilings, original floor tiles and a shared courtyard in a 1934 stone house. The building record was independently submitted and is pending municipal verification.', 'أسقف معقودة وبلاط أصلي وفناء مشترك في بيت حجري يعود لعام 1934. سجل المبنى مُسجّل بشكل مستقل وبانتظار تحقق البلدية.') }),
    X('LS-26-3703', { bid: 'BN-RAM-00311', unit: 'BN-RAM-00311-703', mode: 'rent', type: 'office', price: 4300, by: 'p_lama', agent: 'org_arkan', listed: '2026-11-15', avail: '2027-01-01', furnished: 'no', views: 76, saves: 8, inquiries: 2,
      title: T('180 m² office with meeting room', 'مكتب بمساحة 180 م² مع قاعة اجتماعات'),
      desc: T('Open-plan office on the seventh floor of Manara Business Center: meeting room, kitchenette, raised floor and fibre-ready. Two reserved parking spaces.', 'مكتب مفتوح في الطابق السابع من مركز المنارة للأعمال: قاعة اجتماعات ومطبخ صغير وأرضية مرتفعة وجاهز للألياف. موقفان محجوزان.') }),
    X('LS-26-4203', { bid: 'BN-RAM-00415', unit: 'BN-RAM-00415-203', mode: 'rent', type: 'office', price: 3100, by: 'p_fadi', listed: '2026-11-19', avail: '2026-12-01', furnished: 'yes', views: 54, saves: 6, inquiries: 1,
      title: T('Furnished office suite on Al-Irsal Street', 'جناح مكتبي مفروش في شارع الإرسال'),
      desc: T('Three private rooms and a reception area, ready to move in. Shared meeting room on the floor and visitor parking.', 'ثلاث غرف خاصة ومنطقة استقبال، جاهز للانتقال. قاعة اجتماعات مشتركة في الطابق وموقف للزوار.') }),
    X('LS-26-6502', { bid: 'BN-RAM-00618', unit: 'BN-RAM-00618-502', mode: 'rent', type: 'commercial', price: 3300, by: 'p_jamil', listed: '2026-11-10', avail: '2026-12-10', furnished: 'no', views: 61, saves: 5, inquiries: 2,
      title: T('Clinic unit in Ma’ahid Medical Plaza', 'وحدة عيادة في مجمع المعاهد الطبي'),
      desc: T('Ready for a dental or GP practice: two treatment rooms, waiting area, medical-grade ventilation and a patient elevator.', 'جاهزة لعيادة أسنان أو طب عام: غرفتا علاج ومنطقة انتظار وتهوية طبية ومصعد للمرضى.') }),
    X('LS-26-0407', { bid: 'BN-RAM-00407', unit: null, unitNo: 'G01', floor: 0, area: 64, mode: 'rent', type: 'shop', price: 3800, by: 'p_walid', listed: '2026-11-21', avail: '2026-12-01', furnished: 'no', views: 119, saves: 14, inquiries: 3,
      title: T('Corner shop with 9 m frontage', 'محل زاوية بواجهة 9 أمتار'),
      desc: T('Ground-floor retail unit on a busy Irsal corner with full-height glazing, a storage mezzanine and three-phase power.', 'محل في الطابق الأرضي على زاوية حيوية في الإرسال بواجهة زجاجية كاملة وسدة تخزين وكهرباء ثلاثية الطور.') }),
    X('LS-26-0648', { bid: 'BN-RAM-00648', unit: null, unitNo: 'G', floor: 0, area: 38, mode: 'rent', type: 'shop', price: 1900, by: 'p_issa', listed: '2026-11-05', avail: '2026-11-28', furnished: 'no', views: 92, saves: 19, inquiries: 2,
      title: T('Stone-vaulted shop on the market lane', 'محل بعقد حجري في زقاق السوق'),
      desc: T('Characterful small shop in a heritage building — ideal for crafts, coffee or a gallery. Steady foot traffic on weekends.', 'محل صغير مميز في مبنى تراثي — مثالي للحرف أو القهوة أو معرض فني. حركة مشاة منتظمة في عطلات نهاية الأسبوع.') }),
    X('LS-26-1302', { bid: 'BN-RAM-00142', unit: 'BN-RAM-00142-1302', mode: 'sale', type: 'residential', price: 178000, cur: 'USD', by: 'p_nabil', listed: '2026-11-02', avail: '2027-01-15', furnished: 'no', views: 305, saves: 52, inquiries: 7,
      title: T('Top-floor 2-bedroom in Al-Masyoun Tower', 'شقة بغرفتي نوم في الطابق الأخير ببرج الماصيون'),
      desc: T('Thirteenth-floor apartment with panoramic views, registered title and no outstanding association dues. One deeded parking space included.', 'شقة في الطابق الثالث عشر بإطلالة بانورامية وسند ملكية مسجّل ودون مستحقات للجمعية. يشمل موقف سيارة مُسجّلاً.') }),
    X('LS-26-2603', { bid: 'BN-RAM-00203', unit: 'BN-RAM-00203-603', mode: 'sale', type: 'residential', price: 215000, cur: 'USD', by: 'p_fadi', listed: '2026-10-22', avail: '2026-12-20', furnished: 'no', views: 188, saves: 29, inquiries: 4,
      title: T('Penthouse-level 3-bedroom in Ein Munjed', 'شقة بثلاث غرف في الطابق العلوي بعين منجد'),
      desc: T('150 m² sixth-floor apartment with a private roof terrace, two bathrooms and a master suite. Quiet street near the spring garden.', 'شقة بمساحة 150 م² في الطابق السادس مع سطح خاص وحمّامين وجناح رئيسي. شارع هادئ قرب حديقة النبع.') }),
    X('LS-26-6803', { bid: 'BN-RAM-00266', unit: 'BN-RAM-00266-803', mode: 'sale', type: 'residential', price: 189000, cur: 'USD', by: 'p_hala', agent: 'org_arkan', listed: '2026-11-14', avail: '2027-02-01', furnished: 'no', views: 140, saves: 21, inquiries: 3,
      title: T('3-bedroom corner unit, Masyoun Heights', 'شقة زاوية بثلاث غرف في مرتفعات الماصيون'),
      desc: T('Eighth-floor corner apartment with two balconies and morning sun. Building has a residents’ committee, rooftop solar and two elevators.', 'شقة زاوية في الطابق الثامن مع شرفتين وشمس صباحية. يوجد في المبنى لجنة سكان وألواح شمسية على السطح ومصعدان.') }),
    X('LS-26-3902', { bid: 'BN-RAM-00311', unit: 'BN-RAM-00311-902', mode: 'sale', type: 'office', price: 265000, cur: 'USD', by: 'p_hani', listed: '2026-11-09', avail: '2027-01-01', furnished: 'no', views: 64, saves: 7, inquiries: 1,
      title: T('Grade-A office floor plate, 160 m²', 'مكتب من الفئة الأولى بمساحة 160 م²'),
      desc: T('Ninth-floor office with city views, sold with an existing fit-out. Ideal for owner-occupiers or as an investment with Arkan management.', 'مكتب في الطابق التاسع بإطلالة على المدينة يُباع مع التجهيزات الحالية. مثالي للاستخدام الشخصي أو كاستثمار بإدارة أركان.') }),
    X('LS-26-9201', { bid: 'BN-RAM-00391', unit: 'BN-RAM-00391-201', mode: 'sale', type: 'residential', price: 128000, cur: 'USD', by: 'p_layla', listed: '2026-11-22', avail: '2026-12-15', furnished: 'semi', views: 47, saves: 4, inquiries: 1,
      title: T('Starter 2-bedroom on Rukab Street', 'شقة أولى بغرفتي نوم في شارع ركب'),
      desc: T('Walk to Al-Manara and Rukab’s cafés. Renovated kitchen, new electrical panel (2025). The building record is pending verification.', 'على مسافة قصيرة من المنارة ومقاهي ركب. مطبخ مُجدّد ولوحة كهرباء جديدة (2025). سجل المبنى بانتظار التحقق.') }),
    X('LS-26-1055', { bid: 'BN-RAM-01055', unit: null, unitNo: '401', floor: 4, area: 135, beds: 3, mode: 'sale', type: 'residential', price: 158000, cur: 'USD', by: 'p_ahmad', listed: '2026-11-18', avail: '2027-01-01', furnished: 'no', views: 72, saves: 11, inquiries: 2,
      title: T('Family 3-bedroom in a quiet Al-Tireh street', 'شقة عائلية بثلاث غرف في شارع هادئ بالطيرة'),
      desc: T('Fourth-floor apartment with a large kitchen, storage room and a shared garden. Close to schools and the Tireh bus line.', 'شقة في الطابق الرابع مع مطبخ واسع وغرفة تخزين وحديقة مشتركة. قريبة من المدارس وخط حافلات الطيرة.') }),
  ];
  M.listings = () => LISTINGS.filter((l) => D.building(l.bid));
  M.listing = (id) => M.listings().find((l) => l.id === id);
  M.favs = M.favs || {};
  M.inquiries = M.inquiries || [];
  const TYPES = {
    residential: { l: T('Apartment', 'شقة'), pl: T('Apartments', 'شقق'), icon: 'home' },
    office: { l: T('Office', 'مكتب'), pl: T('Offices', 'مكاتب'), icon: 'briefcase' },
    shop: { l: T('Shop', 'محل'), pl: T('Shops', 'محلات'), icon: 'store' },
    commercial: { l: T('Clinic / commercial', 'عيادة / تجاري'), pl: T('Clinics & commercial', 'عيادات وتجاري'), icon: 'landmark' },
  };
  /** Derived facts: {area, beds, baths, floor, unitNo} */
  M.facts = (l) => {
    const u = l.unit && D.unit(l.unit);
    const area = u ? u.area : l.area;
    const beds = l.type === 'residential' ? (l.beds || (u && u.beds) || 2) : 0;
    const baths = l.type === 'residential' ? (beds >= 3 ? 2 : 1) : area > 150 ? 2 : 1;
    return { area, beds, baths, floor: u ? u.floor : l.floor, unitNo: u ? u.number : l.unitNo };
  };
  const price = (l, small = true) => `${B.money(l.price, l.cur || 'ILS')}${l.mode === 'rent' && small ? `<small> ${L('/ month', '/ شهرياً')}</small>` : ''}`;
  const floorLabel = (f) => (f === 0 ? L('Ground floor', 'الطابق الأرضي') : L(`Floor ${f}`, `الطابق ${f}`));
  const artType = (b) => (b.type === 'office' ? 'office' : b.type === 'heritage' ? 'heritage' : b.type === 'commercial' ? 'commercial' : b.type === 'mixed' ? 'mixed' : 'residential');
  M.listingArt = (l, kind = 'facade') => {
    const b = D.building(l.bid);
    const seed = B.mkt.hash(l.id) % 997;
    if (kind === 'interior') return B.art.interior(seed);
    if (kind === 'interior2') return B.art.interior(seed + 5);
    if (kind === 'plan') return B.art.floorplan(seed);
    return B.art.facade(seed, { type: artType(b), floors: b.floors });
  };
  const verifBadge = (b, compact) => b.verification === 'verified'
    ? `<span class="mk-vb ok">${icon('shieldCheck')}${compact ? L('Verified', 'موثّق') : L('Verified building', 'مبنى موثّق')}</span>`
    : `<span class="mk-vb warn">${icon('clock')}${compact ? L('Pending', 'قيد التحقق') : L('Verification pending', 'بانتظار التحقق')}</span>`;
  const shortName = (pid) => { const n = tx(D.person(pid).name).split(/\s+/); return n.length > 1 ? `${n[0]} ${n[n.length - 1][0]}.` : n[0]; };

  /* ---------------- styles ---------------- */
  B.css(`
  .mk-lgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: 22px 18px; }
  .mk-lc { display: flex; flex-direction: column; gap: 12px; cursor: pointer; text-align: start; min-width: 0; }
  .mk-lc .media { aspect-ratio: 4 / 3; border-radius: 18px; }
  .mk-lc:hover .media svg { transform: scale(1.03); }
  .mk-lc .media svg { transition: transform .5s var(--ease); }
  .mk-lc .m-fav { border: 0; cursor: pointer; }
  .mk-lc .m-fav.on svg { fill: currentColor; }
  .mk-lc .lc-body { display: flex; flex-direction: column; gap: 5px; padding: 0 2px; }
  .mk-lc .lc-top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .mk-lc .lc-price { font-family: var(--font-display); font-size: 19px; font-weight: 750; font-variant-numeric: tabular-nums; letter-spacing: -.01em; white-space: nowrap; }
  .mk-lc .lc-price small { font-size: 13px; font-weight: 500; color: var(--text-3); letter-spacing: 0; }
  .mk-lc .lc-title { font-weight: 600; font-size: 14.5px; line-height: 1.35; }
  .mk-lc .lc-loc { font-size: 13px; color: var(--text-2); display: flex; align-items: center; gap: 5px; min-width: 0; }
  .mk-lc .lc-loc svg { width: 14px; height: 14px; color: var(--text-3); flex: none; }
  .mk-lc .facts { margin-top: 3px; gap: 12px; }
  .mk-lc .m-tag2 { position: absolute; bottom: 10px; inset-inline-start: 10px; display: inline-flex; align-items: center; gap: 5px; height: 26px; padding: 0 9px; border-radius: 99px; background: rgba(255,255,255,.94); font-size: 11.5px; font-weight: 600; color: var(--ink); direction: ltr; }
  .mk-lc .m-tag2 svg { width: 13px; height: 13px; color: var(--mint-ink); }
  .mk-vb { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; white-space: nowrap; }
  .mk-vb svg { width: 14px; height: 14px; }
  .mk-vb.ok { color: var(--mint-ink); }
  .mk-vb.warn { color: var(--warn); }
  .mk-filters { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 16px; }
  .mk-filters .select { width: auto; height: 38px; font-size: 13.5px; border-radius: 11px; min-width: 0; }
  @media (max-width: 640px) {
    .mk-filters .select { flex: 1 1 calc(50% - 4px); }
    .mk-filters .seg { flex: 1 1 100%; }
    .mk-filters .seg button { flex: 1; justify-content: center; }
  }
  .mk-pin { cursor: pointer; }
  .mk-pin rect, .mk-pin path { fill: #fff; stroke: rgba(20,43,59,.25); stroke-width: .6; }
  .mk-pin text { font: 700 7.6px var(--font); fill: var(--ink); direction: ltr; }
  .mk-pin:hover rect, .mk-pin:hover path, .mk-pin.on rect, .mk-pin.on path { fill: var(--navy); stroke: var(--navy); }
  .mk-pin:hover text, .mk-pin.on text { fill: #fff; }
  .mk-mapgrid { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 16px; align-items: start; }
  .mk-mapgrid .map-shell { --map-h: calc(100dvh - 240px); min-height: 480px; }
  .mk-mapside { display: flex; flex-direction: column; gap: 10px; max-height: calc(100dvh - 240px); min-height: 480px; overflow-y: auto; padding-inline-end: 2px; }
  .mk-mrow { display: flex; gap: 12px; align-items: center; padding: 10px; border-radius: 16px; background: #fff; border: 1px solid var(--line); cursor: pointer; text-align: start; width: 100%; transition: border-color .2s; }
  .mk-mrow:hover, .mk-mrow.on { border-color: var(--navy); }
  .mk-mrow .media { width: 92px; flex: none; aspect-ratio: 1; border-radius: 12px; }
  .mk-mrow b { font-family: var(--font-display); font-size: 15.5px; font-variant-numeric: tabular-nums; }
  .mk-mrow b small { font-size: 12px; color: var(--text-3); font-weight: 500; }
  .mk-mrow .t { font-size: 13px; font-weight: 600; line-height: 1.3; margin-top: 2px; }
  .mk-mrow .s { font-size: 12px; color: var(--text-2); margin-top: 3px; }
  @media (max-width: 1100px) {
    .mk-mapgrid { grid-template-columns: minmax(0, 1fr); }
    .mk-mapgrid .map-shell { --map-h: 56dvh; min-height: 340px; }
    .mk-mapside { max-height: none; min-height: 0; overflow: visible; }
  }
  .mk-l-head { display: flex; gap: 16px; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; margin-bottom: 16px; }
  .mk-l-head h1 { font-size: 28px; font-weight: 750; line-height: 1.15; letter-spacing: -.02em; }
  html[dir="rtl"] .mk-l-head h1 { letter-spacing: 0; }
  .mk-l-head .addr { display: flex; align-items: center; gap: 6px; color: var(--text-2); font-size: 14px; margin-top: 6px; flex-wrap: wrap; }
  .mk-l-head .addr svg { width: 16px; height: 16px; color: var(--text-3); }
  @media (max-width: 640px) { .mk-l-head h1 { font-size: 23px; } }
  .gallery.mk-gal { height: 420px; }
  .gallery.mk-gal > * { cursor: zoom-in; }
  .gallery.mk-gal .g-more svg, .gallery.mk-gal .g-count svg { width: 15px; height: 15px; }
  .gallery.mk-gal .g-more { box-shadow: var(--shadow-2); }
  .gallery.mk-gal .g-count { position: absolute; bottom: 12px; inset-inline-start: 12px; display: none; }
  @media (max-width: 640px) { .gallery.mk-gal { height: 250px; border-radius: 18px; margin-inline: 0; } .gallery.mk-gal .g-count { display: inline-flex; } }
  .mk-keyfacts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; border: 1px solid var(--line); border-radius: 16px; background: #fff; }
  .mk-keyfacts > div { padding: 14px 16px; border-inline-start: 1px solid var(--line-2); display: flex; flex-direction: column; gap: 4px; }
  .mk-keyfacts > div:first-child { border-inline-start: 0; }
  .mk-keyfacts svg { width: 20px; height: 20px; color: var(--mint-ink); }
  .mk-keyfacts b { font-family: var(--font-display); font-size: 18px; font-variant-numeric: tabular-nums; }
  .mk-keyfacts span { font-size: 12px; color: var(--text-3); }
  @media (max-width: 640px) { .mk-keyfacts { grid-template-columns: repeat(2, minmax(0, 1fr)); } .mk-keyfacts > div:nth-child(3) { border-inline-start: 0; } .mk-keyfacts > div:nth-child(n+3) { border-top: 1px solid var(--line-2); } }
  .mk-feats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 18px; }
  .mk-feats span { display: flex; gap: 10px; align-items: center; font-size: 14px; }
  .mk-feats svg { width: 19px; height: 19px; color: var(--text-2); flex: none; }
  .mk-pricecard .p { font-family: var(--font-display); font-size: 30px; font-weight: 750; line-height: 1.1; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
  .mk-pricecard .p small { font-size: 14px; font-weight: 500; color: var(--text-3); letter-spacing: 0; }
  .mk-idblock .id-card { margin-bottom: 16px; }
  .mk-idblock .id-card .idc-id { font-size: 19px; }
  .mk-amen { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .mk-person { display: flex; gap: 12px; align-items: center; }
  .mk-person b { font-size: 15px; display: block; }
  .mk-person small { font-size: 12.5px; color: var(--text-2); display: block; }
  .mk-gal-all { display: grid; gap: 10px; }
  .mk-gal-all .media { aspect-ratio: 4 / 3; border-radius: 14px; }
  .mk-days { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .mk-days .radio-card { padding: 10px; align-items: center; text-align: center; }
  .mk-days .radio-card b { font-size: 18px; font-family: var(--font-display); }
  `);

  /* ---------------- cards ---------------- */
  M.listingCard = (l) => {
    const b = D.building(l.bid);
    const f = M.facts(l);
    const fav = !!M.favs[l.id];
    return `<div class="mk-lc" data-go="${R()}-listing-${l.id}" role="link" tabindex="0">
      <div class="media">${M.listingArt(l)}<span class="m-tag">${ui.status(l.mode === 'rent' ? 'forRent' : 'forSale')}</span>
        <button class="m-fav ${fav ? 'on' : ''}" data-stop data-act="mkFav" data-arg="${l.id}" aria-label="${esc(L('Save', 'حفظ'))}">${icon('heart')}</button>
        <span class="m-tag2">${icon('fingerprint')}${esc(b.id)}</span></div>
      <div class="lc-body">
        <div class="lc-top"><span class="lc-price">${price(l)}</span>${verifBadge(b, true)}</div>
        <div class="lc-title">${esc(tx(l.title))}</div>
        <div class="lc-loc">${icon('pin')}<span class="truncate">${esc(tx(D.district(b.district).name))} · ${esc(tx(b.name))}</span></div>
        <div class="facts"><span>${icon('ruler')}${f.area} ${L('m²', 'م²')}</span>${f.beds ? `<span>${icon('bed')}${f.beds}</span>` : `<span>${icon(TYPES[l.type].icon)}${tx(TYPES[l.type].l)}</span>`}<span>${icon('bath')}${f.baths}</span><span>${icon('stairs')}${f.floor === 0 ? L('G', 'أرضي') : f.floor}</span></div>
      </div></div>`;
  };
  B.act.mkFav = (id) => { M.favs[id] = !M.favs[id]; B.toast(M.favs[id] ? L('Saved to favourites', 'تمت الإضافة إلى المفضلة') : L('Removed from favourites', 'تمت الإزالة من المفضلة'), 'heart'); B.refresh(); };

  /* ---------------- page: properties ---------------- */
  const BANDS = {
    rent: [{ v: '', l: T('Any price', 'أي سعر') }, { v: '0-2500', l: T('Under ₪2,500', 'أقل من 2,500 ₪') }, { v: '2500-3500', l: T('₪2,500 – 3,500', '2,500 – 3,500 ₪') }, { v: '3500-', l: T('Over ₪3,500', 'أكثر من 3,500 ₪') }],
    sale: [{ v: '', l: T('Any price', 'أي سعر') }, { v: '0-150000', l: T('Under $150k', 'أقل من 150 ألف $') }, { v: '150000-200000', l: T('$150k – 200k', '150 – 200 ألف $') }, { v: '200000-', l: T('Over $200k', 'أكثر من 200 ألف $') }],
  };
  /** Price pills drawn inside the map SVG (world coordinates) so they pan/zoom with it. */
  const short = (l) => (l.mode === 'rent' ? `₪${B.num1(l.price / 1000)}k` : `$${Math.round(l.price / 1000)}k`);
  const pricePins = (html, list, pick) => {
    const by = {};
    list.forEach((l) => { (by[l.bid] = by[l.bid] || []).push(l); });
    const pins = Object.entries(by).map(([bid, ls]) => {
      const b = D.building(bid);
      const [x, y] = B.map.centroid(b.poly);
      const cheapest = ls.slice().sort((a, c) => a.price - c.price)[0];
      const label = short(cheapest) + (ls.length > 1 ? ` +${ls.length - 1}` : '');
      const w = 9 + label.length * 5.4;
      const on = bid === pick;
      return `<g class="mk-pin ${on ? 'on' : ''}" data-act="mkMapPick" data-arg="${bid}" data-x="${x.toFixed(1)}" data-y="${y.toFixed(1)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(2)"><title>${esc(tx(b.name))}</title>
        <path d="M-4 -5 L0 0 L4 -5Z" /><rect x="${-w / 2}" y="-19" width="${w}" height="14" rx="7"/><text y="-9.4" text-anchor="middle">${esc(label)}</text></g>`;
    }).join('');
    const i = html.indexOf('</svg>');
    B.afterRender(bindPins);
    return i < 0 ? html : html.slice(0, i) + `<g class="mk-pins">${pins}</g>` + html.slice(i);
  };
  /* keep pills at a constant on-screen size (≈11px text) whatever the zoom level */
  const sizePins = (svg) => {
    const r = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    if (!r.width || !vb || !vb.width) return;
    const ppu = Math.max(r.width / vb.width, r.height / vb.height);
    const k = Math.max(0.6, Math.min(6, 11 / (7.6 * ppu)));
    svg.querySelectorAll('.mk-pin').forEach((g) => g.setAttribute('transform', `translate(${g.dataset.x} ${g.dataset.y}) scale(${k.toFixed(3)})`));
  };
  const bindPins = () => {
    const shell = document.querySelector('.map-shell[data-map="mk-props"]');
    const svg = shell && shell.querySelector('svg');
    if (!svg) return;
    sizePins(svg);
    let raf = 0;
    const again = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => sizePins(svg)); };
    ['wheel', 'pointerup', 'pointermove', 'click'].forEach((ev) => shell.addEventListener(ev, again, { passive: true }));
  };
  B.shared.properties = (id) => {
    if (id === 'rent' || id === 'sale') { if (B.vs['mk:pm:set'] !== id) { B.vs['mk:pm'] = id; B.vs['mk:pm:set'] = id; } }
    B.navActive('properties');
    B.title(L('Property marketplace', 'سوق العقارات'));
    const mode = B.get('mk:pm', 'rent');
    const type = B.get('mk:pt', 'all');
    const dist = B.get('mk:pd', '');
    const band = B.get('mk:pp', '');
    const beds = +B.get('mk:pb', 0);
    const sort = B.get('mk:ps', 'new');
    const q = B.get('mk:pq', '');
    const favOnly = B.get('mk:pf', false);
    const verOnly = B.get('mk:pver', false);
    const furn = B.get('mk:pfu', '');
    const view = B.get('mk:pv', 'split');
    const fOpen = B.get('mk:fo', false);
    const [lo, hi] = band ? band.split('-').map((x) => (x === '' ? null : +x)) : [null, null];
    const all = M.listings();
    const pass = (l, skipType) => {
      const b = D.building(l.bid);
      const f = M.facts(l);
      return l.mode === mode && (skipType || type === 'all' || l.type === type) && (!dist || b.district === dist) && (lo == null || l.price >= lo) && (hi == null || l.price < hi)
        && (!beds || f.beds >= beds) && (!favOnly || M.favs[l.id]) && (!verOnly || b.verification === 'verified') && (!furn || mode !== 'rent' || l.furnished === furn)
        && B.match(q, l.title, b.name, b.address, b.id, D.district(b.district).name);
    };
    const list = all.filter((l) => pass(l));
    const sorts = { new: (a, b) => (a.listed < b.listed ? 1 : -1), low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, area: (a, b) => M.facts(b).area - M.facts(a).area };
    list.sort(sorts[sort] || sorts.new);
    const pick = B.get('mk:ppick', null);
    if (pick) list.sort((a, b) => (b.bid === pick) - (a.bid === pick));
    const nFav = all.filter((l) => M.favs[l.id]).length;
    const nActive = [dist, band, beds, favOnly, verOnly, furn && mode === 'rent', q].filter(Boolean).length;
    const chips = [dist && [tx(D.district(dist).name), 'mk:pd='], band && [tx(BANDS[mode].find((x) => x.v === band)?.l || band), 'mk:pp='], beds && [L(`${beds}+ bedrooms`, `${beds}+ غرف`), 'mk:pb=0'], verOnly && [L('Verified buildings', 'مبانٍ موثّقة'), 'mk:pver=false'], favOnly && [L('Saved', 'المحفوظة'), 'mk:pf=false'], furn && mode === 'rent' && [{ yes: L('Furnished', 'مفروش'), semi: L('Semi-furnished', 'نصف مفروش'), no: L('Unfurnished', 'غير مفروش') }[furn], 'mk:pfu='], q && [`“${esc(q)}”`, 'mk:pq=']].filter(Boolean);
    const aside = `<aside class="mk2-aside ${fOpen ? 'open' : ''}" aria-label="${esc(L('Filters', 'عوامل التصفية'))}">
      <div class="mk2-fs"><h4>${L('Purpose', 'الغرض')}</h4>${ui.seg('mk:pm', [{ id: 'rent', label: L('For rent', 'للإيجار') }, { id: 'sale', label: L('For sale', 'للبيع') }], mode)}</div>
      <div class="mk2-fs"><h4>${L('Property type', 'نوع العقار')}</h4>
        ${M.opt(type === 'all', 'grid', L('All types', 'كل الأنواع'), 'data-act="set" data-arg="mk:pt=all"', all.filter((l) => pass(l, true)).length)}
        ${Object.entries(TYPES).map(([k, t]) => M.opt(type === k, t.icon, tx(t.pl), `data-act="set" data-arg="mk:pt=${k}"`, all.filter((l) => pass(l, true) && l.type === k).length)).join('')}</div>
      <div class="mk2-fs"><h4>${L('Area', 'المنطقة')}</h4>${ui.select('mk:pd', [{ v: '', l: L('All areas', 'كل المناطق') }].concat(D.districts.map((d) => ({ v: d.id, l: d.name }))), { label: L('Area', 'المنطقة'), def: '' })}</div>
      <div class="mk2-fs"><h4>${L('Price', 'السعر')}</h4>${BANDS[mode].map((x) => M.opt(band === x.v, band === x.v ? 'checkCircle' : 'minus', tx(x.l), `data-act="set" data-arg="mk:pp=${x.v}"`)).join('')}</div>
      <div class="mk2-fs"><h4>${L('Bedrooms', 'غرف النوم')}</h4>${ui.seg('mk:pb', [{ id: 0, label: L('Any', 'الكل') }, { id: 1, label: '1+' }, { id: 2, label: '2+' }, { id: 3, label: '3+' }], beds)}</div>
      ${mode === 'rent' ? `<div class="mk2-fs"><h4>${L('Furnishing', 'التأثيث')}</h4>${ui.select('mk:pfu', [{ v: '', l: L('Any', 'الكل') }, { v: 'yes', l: L('Furnished', 'مفروش') }, { v: 'semi', l: L('Semi-furnished', 'نصف مفروش') }, { v: 'no', l: L('Unfurnished', 'غير مفروش') }], { label: L('Furnishing', 'التأثيث'), def: '' })}</div>` : ''}
      <div class="mk2-fs"><h4>${L('Trust', 'الموثوقية')}</h4><div class="stack-sm"><label class="mk-check"><input type="checkbox" id="mk-pver" data-model="mk:pver" ${verOnly ? 'checked' : ''}>${L('Verified buildings only', 'المباني الموثّقة فقط')}</label><label class="mk-check"><input type="checkbox" id="mk-pf" data-model="mk:pf" ${favOnly ? 'checked' : ''}>${L(`Saved listings (${nFav})`, `العروض المحفوظة (${nFav})`)}</label></div></div>
      <div class="mk2-fs"><div class="xs muted" style="line-height:1.5;margin-bottom:10px">${icon('lock', 'faint')} ${L('Vacant units are never listed automatically. Publishing requires the owner’s authorisation.', 'لا تُعرض الوحدات الشاغرة تلقائياً. يتطلب النشر تفويض المالك.')}</div>${ui.btn(L('List a property', 'اعرض عقاراً'), { icon: 'plus', block: true, act: 'mkListOwn' })}</div>
    </aside>`;
    const facts = (l) => { const f = M.facts(l); return `<span class="row-sm">${icon('ruler')}${f.area} ${L('m²', 'م²')}</span>${f.beds ? `<span class="row-sm">${icon('bed')}${f.beds}</span>` : `<span class="row-sm">${icon(TYPES[l.type].icon)}${tx(TYPES[l.type].l)}</span>`}<span class="row-sm">${icon('stairs')}${f.floor === 0 ? L('G', 'أرضي') : f.floor}</span>`; };
    const row = (l) => { const b = D.building(l.bid); return `<div class="mk2-row prop ${l.bid === pick ? 'on' : ''}" data-go="${R()}-listing-${l.id}" role="link" tabindex="0"><span class="thumb">${M.listingArt(l)}</span><span style="min-width:0"><span class="t">${esc(tx(l.title))}</span><span class="s"><span class="row-sm" style="min-width:0;max-width:100%">${icon('pin')}<span class="truncate">${esc(tx(D.district(b.district).name))} · ${esc(tx(b.name))}</span></span></span><span class="s">${facts(l)}${verifBadge(b, true)}<span class="id-mono" style="font-size:11.5px">${esc(b.id)}</span></span></span><span class="p"><b>${price(l, false)}</b><small>${l.mode === 'rent' ? L('per month', 'شهرياً') : L('asking price', 'السعر المطلوب')}</small><button class="icon-btn" data-stop data-act="mkFav" data-arg="${l.id}" aria-label="${esc(L('Save', 'حفظ'))}" style="margin-top:4px;margin-inline-start:auto;${M.favs[l.id] ? 'color:var(--bad)' : ''}">${icon('heart')}</button></span></div>`; };
    const map = () => pricePins(B.map.render({ id: 'mk-props', mode: 'type', visible: new Set(list.map((l) => l.bid)), selected: pick && list.some((l) => l.bid === pick) ? pick : null, onSelect: 'mkMapPick', legend: false, badge: L('Listings on the BENA map · sample area', 'العروض على خريطة بينا · منطقة نموذجية') }), list, pick);
    const empty = `<div class="card">${ui.empty({ icon: 'search', title: favOnly ? L('No saved listings yet', 'لا توجد عروض محفوظة بعد') : L('No listings match these filters', 'لا توجد عروض تطابق هذه الفلاتر'), text: L('Try widening the price range or choosing another area.', 'جرّب توسيع نطاق السعر أو اختيار منطقة أخرى.'), action: ui.btn(L('Reset filters', 'إعادة ضبط الفلاتر'), { kind: 'primary', act: 'mkPReset' }) })}</div>`;
    const results = !list.length ? empty : view === 'grid' ? `<div class="mk-lgrid">${list.map(M.listingCard).join('')}</div>`
      : view === 'list' ? `<div class="mk2-rows">${list.map(row).join('')}</div>`
      : `<div class="mk2-split"><div class="mk2-rows">${pick ? `<div class="row between"><span class="xs faint">${L('Selected on map', 'محدد على الخريطة')}: <b>${esc(tx(D.building(pick).name))}</b></span><button class="btn btn-text btn-sm" data-act="set" data-arg="mk:ppick=">${icon('x')}${L('Clear', 'مسح')}</button></div>` : ''}${list.map(row).join('')}</div><div class="mk2-mapcol">${map()}</div></div>`;
    return `<div class="mk2">
      <div class="mk2-top"><div class="grow"><h1>${L('Property marketplace', 'سوق العقارات')}</h1><p>${L('Homes, offices and shops for rent or sale — every listing is linked to its BENA building record and published by the owner.', 'منازل ومكاتب ومحلات للإيجار أو البيع — كل عرض مرتبط بسجل المبنى في بينا ومنشور من قبل المالك.')}</p></div>
        <div class="mk2-search">${ui.search('mk:pq', L('Search by area, building, street or BENA ID', 'ابحث حسب المنطقة أو المبنى أو الشارع أو رقم بينا'))}${ui.seg('mk:pm', [{ id: 'rent', label: L('Rent', 'إيجار') }, { id: 'sale', label: L('Buy', 'شراء') }], mode)}</div></div>
      <div class="mk2-layout">${aside}
        <div style="min-width:0">
          <div class="mk2-bar"><span class="count"><b>${list.length}</b> ${mode === 'rent' ? L('places for rent', 'عقار للإيجار') : L('places for sale', 'عقار للبيع')}</span>
            <button class="btn btn-ghost btn-sm mk2-fbtn" data-act="toggle" data-arg="mk:fo">${icon('filter')}<span>${L('Filters', 'التصفية')}${nActive ? ` (${nActive})` : ''}</span></button>
            ${ui.select('mk:ps', [{ v: 'new', l: L('Newest', 'الأحدث') }, { v: 'low', l: L('Price: low to high', 'السعر: من الأقل') }, { v: 'high', l: L('Price: high to low', 'السعر: من الأعلى') }, { v: 'area', l: L('Largest', 'الأكبر مساحة') }], { label: L('Sort', 'الترتيب') })}
            ${ui.seg('mk:pv', [{ id: 'split', label: L('Map', 'خريطة'), icon: 'map' }, { id: 'list', label: L('List', 'قائمة'), icon: 'list' }, { id: 'grid', label: L('Grid', 'شبكة'), icon: 'grid' }], view)}</div>
          ${chips.length ? `<div class="mk2-active">${chips.map(([l, a]) => `<button data-act="set" data-arg="${a}">${l}${icon('x')}</button>`).join('')}<button data-act="mkPReset">${L('Clear all', 'مسح الكل')}</button></div>` : ''}
          ${results}
          <div style="margin-top:18px" class="stack-sm">
            ${ui.callout(L('<b>Only owner-published units appear here.</b> A unit shown as vacant in BENA is never listed automatically — the owner (or their authorised manager) decides whether to publish it.', '<b>تظهر هنا فقط الوحدات التي نشرها مالكوها.</b> لا تُعرض الوحدة الشاغرة في بينا تلقائياً — يقرر المالك (أو مديره المفوّض) نشرها.'), '', 'info')}
            ${ui.demoNote(L('Listings, prices and contacts are fictional demonstration data. The BENA Building ID is a digital reference, not proof of ownership.', 'العروض والأسعار وجهات الاتصال بيانات تجريبية وهمية. رقم بينا للمبنى مرجع رقمي وليس إثباتاً للملكية.'))}
          </div>
        </div></div>
    </div>`;
  };
  B.act.mkMapPick = (bid) => { B.vs['mk:ppick'] = bid; if (B.get('mk:pv', 'split') !== 'split') B.vs['mk:pv'] = 'split'; B.refresh(); };
  B.act.mkPReset = () => { ['mk:pt', 'mk:pd', 'mk:pp', 'mk:pb', 'mk:pq', 'mk:pf', 'mk:ppick', 'mk:pver', 'mk:pfu'].forEach((k) => delete B.vs[k]); B.refresh(); };
  B.act.mkListOwn = () => {
    const role = R();
    const me = D.me[role];
    const mine = D.units.filter((u) => (u.owner === me || (u.coOwners || []).includes(me)) && u.status === 'vacant');
    const can = role === 'owner' || role === 'manager';
    B.modal({ title: L('List a property', 'اعرض عقاراً'), sub: L('Publishing requires the owner’s authorisation', 'يتطلب النشر تفويض المالك'), size: 'md', form: can && mine.length ? 'mkListOwn' : null,
      body: can && mine.length ? `<div class="stack">${ui.field({ name: 'unit', label: L('Your vacant unit', 'وحدتك الشاغرة'), type: 'radio', options: mine.map((u) => ({ v: u.id, l: `${tx(D.building(u.building).name)} · ${D.unitLabel(u)}`, d: `${u.area} ${L('m²', 'م²')} · ${ui.statusLabel(u.status)}`, icon: 'home' })) })}
          <label class="check"><input type="checkbox" name="auth" required>${L('I am the owner (or hold a written authorisation) and I authorise BENA to publish this unit.', 'أنا المالك (أو أحمل تفويضاً مكتوباً) وأفوّض بينا بنشر هذه الوحدة.')}</label>
          ${ui.callout(L('The listing is created as a draft. Nothing is published until you review and confirm it.', 'يُنشأ العرض كمسودة. لا يُنشر شيء حتى تراجعه وتؤكده.'), '', 'info')}</div>`
        : `${ui.callout(L('Only a unit’s owner — or a property manager holding the owner’s written authorisation — can publish a listing. BENA never lists vacant units automatically.', 'يمكن فقط لمالك الوحدة — أو لمدير عقار يحمل تفويضاً مكتوباً من المالك — نشر عرض. لا تعرض بينا الوحدات الشاغرة تلقائياً.'), '', 'lock')}<p class="small muted" style="margin-top:12px">${L('Switch to the owner role to try the listing flow with a sample vacant unit.', 'انتقل إلى دور المالك لتجربة مسار العرض بوحدة شاغرة نموذجية.')}</p>`,
      foot: can && mine.length ? `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${L('Create draft listing', 'إنشاء مسودة عرض')}</button>` : `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Close', 'إغلاق')}</button>${ui.btn(L('Open owner role', 'فتح دور المالك'), { kind: 'primary', go: 'owner-properties' })}` });
  };
  B.submit.mkListOwn = (d) => B.success({ title: L('Draft listing created', 'تم إنشاء مسودة العرض'), text: L('Add photos and a price, then publish when ready. It stays private until you confirm.', 'أضف الصور والسعر ثم انشر عندما تكون جاهزاً. يبقى خاصاً حتى تؤكد.'), ref: 'LS-DRAFT-' + String(d.unit || '').slice(-4) });

  /* ---------------- page: listing details ---------------- */
  const NEARBY = {
    masyoun: [[T('Al-Masyoun Park', 'حديقة الماصيون'), 6, 'tree'], [T('Ahliyya College', 'الكلية الأهلية'), 9, 'landmark'], [T('Jaffa St. bus stop', 'موقف حافلات شارع يافا'), 4, 'car']],
    tireh: [[T('Olive terraces walk', 'ممشى مصاطب الزيتون'), 3, 'tree'], [T('Al-Tireh schools', 'مدارس الطيرة'), 7, 'landmark'], [T('Tireh bus line', 'خط حافلات الطيرة'), 5, 'car']],
    manara: [[T('Al-Manara Square', 'دوار المنارة'), 5, 'landmark'], [T('Rukab St. cafés', 'مقاهي شارع ركب'), 3, 'store'], [T('Central taxi rank', 'موقف التاكسي المركزي'), 6, 'car']],
    irsal: [[T('Al-Irsal business strip', 'شارع الإرسال التجاري'), 2, 'briefcase'], [T('Radio St. pharmacy', 'صيدلية شارع الإذاعة'), 4, 'store'], [T('Ring Rd. access', 'مدخل الطريق الدائري'), 6, 'car']],
    einmunjed: [[T('Ein Munjed Garden', 'متنزه عين منجد'), 4, 'tree'], [T('Spring St. bakery', 'مخبز شارع النبع'), 3, 'store'], [T('Ring Rd. access', 'مدخل الطريق الدائري'), 7, 'car']],
    oldcity: [[T('Market lane', 'زقاق السوق'), 1, 'store'], [T('Old City church square', 'ساحة كنيسة البلدة القديمة'), 4, 'landmark'], [T('Rukab St.', 'شارع ركب'), 8, 'car']],
    maahid: [[T('College campus', 'حرم الكلية'), 5, 'landmark'], [T('Ma’ahid clinics', 'عيادات المعاهد'), 3, 'store'], [T('Al-Nahda St. buses', 'حافلات شارع النهضة'), 6, 'car']],
    batnalhawa: [[T('Valley green belt', 'الحزام الأخضر'), 6, 'tree'], [T('Terrace St. shops', 'محلات شارع المصاطب'), 4, 'store'], [T('Al-Quds St.', 'شارع القدس'), 9, 'car']],
  };
  const amenities = (b) => {
    const a = [];
    const assets = D.assetsOf(b.id);
    if (b.elevators) a.push(['elevator', L(`${b.elevators} elevator${b.elevators > 1 ? 's' : ''}`, `${b.elevators} مصعد`)]);
    if (b.parking) a.push(['car', L(`${b.parking} parking spaces`, `${b.parking} موقف سيارات`)]);
    if (assets.some((x) => x.cat === 'generator') || (b.floors >= 8 && b.key)) a.push(['generator', L('Backup generator', 'مولد احتياطي')]);
    a.push(['tank', L('Rooftop water tanks', 'خزانات مياه على السطح')]);
    if (assets.some((x) => x.cat === 'access') || b.type === 'office') a.push(['lock', L('Access control', 'نظام دخول')]);
    if (assets.some((x) => x.cat === 'fire') || b.key) a.push(['fireExt', L('Fire safety system', 'نظام سلامة من الحريق')]);
    if (b.type === 'heritage') a.push(['award', L('Heritage stone building', 'مبنى حجري تراثي')]);
    return a;
  };
  M.buildingIdentity = (bid, opts = {}) => {
    const b = D.building(bid);
    const role = R();
    const com = D.committeeOf(b.id);
    const mgr = b.manager && D.org(b.manager);
    return `<div class="mk-idblock">
      <div class="id-card"><div class="idc-top"><div><div class="eyebrow" style="color:var(--navy-ink)">${L('BENA building identity', 'هوية المبنى في بينا')}</div><div class="idc-id">${esc(b.id)}</div><div style="color:#fff;font-weight:600;margin-top:4px;font-size:14px">${esc(tx(b.name))}</div></div><span class="qr">${B.art.qr(B.mkt.hash(b.id) % 500)}</span></div>
        <div class="idc-grid"><div>${L('Municipal GIS', 'نظم البلدية')}<b>${b.gis ? `${L('Linked', 'مرتبط')} · <span class="id-mono" style="color:#fff">${esc(b.gis)}</span>` : L('Independent record', 'سجل مستقل')}</b></div><div>${L('Built', 'سنة البناء')}<b>${b.year}</b></div><div>${L('Floors · units', 'الطوابق · الوحدات')}<b>${b.floors} · ${b.units}</b></div><div>${L('Parcel', 'القطعة')}<b>${L(`Basin ${b.parcel.basin} / ${b.parcel.parcel}`, `حوض ${b.parcel.basin} / ${b.parcel.parcel}`)}</b></div></div></div>
      ${ui.kv([
        [L('Record source', 'مصدر السجل'), ui.sourceTag(b.source)],
        [L('Verification', 'التحقق'), ui.status(b.verification)],
        [L('Building type', 'نوع المبنى'), esc(D.typeLabel(b.type))],
        com ? [L('Owners’ body', 'جهة المالكين'), `${esc(tx(com.name))}<div style="margin-top:4px">${ui.status(com.kind)}</div>`] : null,
        mgr ? [L('Managed by', 'تديره'), esc(tx(mgr.name))] : null,
      ])}
      ${opts.amen !== false ? `<div class="mk-amen">${amenities(b).map(([i, t]) => `<span class="mk-tag">${icon(i)}${t}</span>`).join('')}</div>` : ''}
      <div style="margin-top:16px">${ui.btn(L('Open building profile', 'فتح ملف المبنى'), { icon: 'building', block: true, go: `${role}-building-${b.id}` })}</div>
    </div>`;
  };
  B.shared.listing = (id) => {
    const l = M.listing(id);
    const role = R();
    B.navActive('properties');
    if (!l) return ui.empty({ icon: 'search', title: L('Listing not available', 'العرض غير متاح'), text: L('It may have been unpublished by its owner.', 'ربما ألغى المالك نشره.'), action: ui.btn(L('Browse properties', 'تصفّح العقارات'), { kind: 'primary', go: `${role}-properties` }) });
    B.title(tx(l.title));
    const b = D.building(l.bid);
    const f = M.facts(l);
    const u = l.unit && D.unit(l.unit);
    const fav = !!M.favs[l.id];
    const agent = l.agent && D.org(l.agent);
    const mine = role === 'owner' && l.by === D.me.owner;
    const similar = M.listings().filter((x) => x.id !== l.id && x.mode === l.mode).sort((a, c) => (c.type === l.type) - (a.type === l.type) || Math.abs(a.price - l.price) - Math.abs(c.price - l.price)).slice(0, 3);
    const furn = { yes: L('Furnished', 'مفروشة'), semi: L('Semi-furnished', 'مفروشة جزئياً'), no: L('Unfurnished', 'غير مفروشة') }[l.furnished];
    const deposit = l.mode === 'rent' ? l.price * (l.type === 'residential' ? 2 : 3) : null;
    const charge = u ? u.charge : l.type === 'shop' ? 240 : 180;
    const feats = [
      ['ruler', L(`${f.area} m² internal area`, `${f.area} م² مساحة داخلية`)],
      l.type === 'residential' ? ['bed', L(`${f.beds} bedrooms`, `${f.beds} غرف نوم`)] : ['briefcase', tx(TYPES[l.type].l)],
      ['bath', L(`${f.baths} bathroom${f.baths > 1 ? 's' : ''}`, `${f.baths} حمّام`)],
      ['sofa', furn],
      ['stairs', floorLabel(f.floor)],
      ['calendar', L(`Available ${B.dateShort(l.avail)}`, `متاح من ${B.dateShort(l.avail)}`)],
      b.parking ? ['car', L('Parking in building', 'موقف في المبنى')] : ['car', L('Street parking', 'موقف في الشارع')],
      ['sun', l.type === 'residential' ? L('Balcony', 'شرفة') : L('Natural light', 'إضاءة طبيعية')],
    ];
    const nearby = NEARBY[b.district] || NEARBY.masyoun;
    return `<div class="mk-wrap mk-has-cta">
      <button class="btn btn-text" style="padding:0;margin:4px 0 12px" data-act="back">${icon('arrowLeft', 'flip')}<span>${L('Back to results', 'العودة للنتائج')}</span></button>
      ${mine ? `<div style="margin-bottom:14px">${ui.callout(`<b>${L('This is your listing.', 'هذا عرضك.')}</b> ${L(`${l.views} views · ${l.saves} saves · ${l.inquiries} inquiries this month. You chose to publish this unit; other vacant units stay private.`, `${l.views} مشاهدة · ${l.saves} حفظ · ${l.inquiries} استفسارات هذا الشهر. أنت اخترت نشر هذه الوحدة؛ تبقى الوحدات الشاغرة الأخرى خاصة.`)}`, 'mint', 'eye')}</div>` : ''}
      <div class="mk-l-head"><div class="grow" style="min-width:min(100%,300px)">
          <div class="row-sm wrap" style="margin-bottom:8px">${ui.status(l.mode === 'rent' ? 'forRent' : 'forSale')}${verifBadge(b)}<span class="xs faint">${L('Listed', 'نُشر')} ${B.ago(l.listed)} · ${ui.idMono(l.id)}</span></div>
          <h1>${esc(tx(l.title))}</h1>
          <div class="addr">${icon('pin')}<span>${esc(tx(b.address))}</span>${f.unitNo ? `<span class="faint">· ${L('Unit', 'وحدة')} ${esc(f.unitNo)}</span>` : ''}</div></div>
        <div class="row-sm">${ui.btn(L('Share', 'مشاركة'), { icon: 'share', act: 'soon', arg: L('Sharing', 'المشاركة') })}<button class="btn btn-ghost" data-act="mkFav" data-arg="${l.id}">${icon('heart')}<span>${fav ? L('Saved', 'محفوظ') : L('Save', 'حفظ')}</span></button></div></div>
      <div class="gallery mk-gal">
        <div data-act="mkGallery" data-arg="${l.id}">${M.listingArt(l)}<span class="g-count badge">${icon('image')}1 / 4</span></div>
        <div data-act="mkGallery" data-arg="${l.id}">${M.listingArt(l, 'interior')}</div>
        <div data-act="mkGallery" data-arg="${l.id}">${M.listingArt(l, 'plan')}<button class="btn btn-ghost btn-sm g-more" data-act="mkGallery" data-arg="${l.id}">${icon('grid')}${L('All photos', 'كل الصور')}</button></div>
      </div>
      <div class="grid g-main" style="margin-top:22px;align-items:start">
        <div class="stack">
          <div class="mk-keyfacts">
            <div>${icon('ruler')}<b>${f.area} ${L('m²', 'م²')}</b><span>${L('Area', 'المساحة')}</span></div>
            <div>${icon(f.beds ? 'bed' : TYPES[l.type].icon)}<b>${f.beds || tx(TYPES[l.type].l)}</b><span>${f.beds ? L('Bedrooms', 'غرف النوم') : L('Use', 'الاستخدام')}</span></div>
            <div>${icon('bath')}<b>${f.baths}</b><span>${L('Bathrooms', 'الحمّامات')}</span></div>
            <div>${icon('stairs')}<b>${f.floor === 0 ? L('G', 'أرضي') : f.floor}</b><span>${L(`of ${b.floors} floors`, `من ${b.floors} طوابق`)}</span></div>
          </div>
          ${ui.card({ title: L('About this place', 'عن هذا العقار'), body: `<p style="font-size:14.5px;line-height:1.65">${esc(tx(l.desc))}</p><div class="divider" style="margin:18px 0"></div><div class="mk-feats">${feats.map(([i, t]) => `<span>${icon(i)}${t}</span>`).join('')}</div>` })}
          ${ui.card({ title: L('Building identity', 'هوية المبنى'), sub: L('Every BENA listing is tied to a registered building record', 'كل عرض في بينا مرتبط بسجل مبنى مُسجّل'), body: M.buildingIdentity(b.id) })}
          ${ui.card({ title: L('Location', 'الموقع'), sub: esc(tx(b.address)), body: `${B.map.render({ id: 'mk-loc-' + l.id, static: true, selected: b.id, focus: b.id, focusW: 260, height: '260px', legend: false, badge: false })}
            <div class="list" style="margin-top:14px">${nearby.map(([n, m, i]) => ui.li({ icon: i, title: tx(n), end: `<span class="xs muted">${L(`${m} min walk`, `${m} دقائق مشياً`)}</span>` })).join('')}</div>` })}
        </div>
        <div class="stack mk-book">
          ${ui.card({ cls: 'mk-pricecard', body: `<div class="p">${price(l)}</div>${l.mode === 'sale' ? `<div class="xs faint" style="margin-top:4px">≈ ${B.money(Math.round(l.price / f.area), 'USD')} ${L('per m²', 'للمتر المربع')}</div>` : ''}
            <div style="margin:14px 0 16px">${ui.kv([
              l.mode === 'rent' ? [L('Security deposit', 'التأمين'), B.money(deposit)] : [L('Title', 'السند'), L('Registered — ready to transfer', 'مُسجّل — جاهز للنقل')],
              l.mode === 'rent' ? [L('Minimum term', 'الحد الأدنى للمدة'), L('12 months', '12 شهراً')] : [L('Payment', 'الدفع'), L('Cash or bank mortgage', 'نقداً أو بقرض بنكي')],
              [L('Building service charge', 'رسوم خدمات المبنى'), `${B.money(charge)} ${L('/ month', '/ شهرياً')}`],
              [L('Available from', 'متاح من'), B.date(l.avail)],
            ])}</div>
            ${mine ? ui.btn(L('Edit listing', 'تعديل العرض'), { kind: 'primary', block: true, size: 'lg', icon: 'edit', act: 'soon', arg: L('Listing editor', 'محرر العرض') }) : `${ui.btn(L('Contact', 'تواصل') + ' ' + (agent ? L('agent', 'الوكيل') : L('owner', 'المالك')), { kind: 'primary', block: true, size: 'lg', icon: 'chat', act: 'mkInquire', arg: l.id })}<div style="height:8px"></div>${ui.btn(L('Schedule a viewing', 'حجز موعد معاينة'), { block: true, size: 'lg', icon: 'calendarCheck', act: 'mkViewing', arg: l.id })}`}
            <div class="xs faint" style="text-align:center;margin-top:10px">${L(`${l.views} views · ${l.saves} people saved this`, `${l.views} مشاهدة · ${l.saves} حفظوا هذا العرض`)}</div>` })}
          ${ui.card({ title: agent ? L('Listing agent', 'وكيل العرض') : L('Listed by the owner', 'معروض من المالك'), body: agent
            ? `<div class="mk-person"><span class="mk-logo sm">${esc(B.initials(agent.name))}</span><div class="grow"><b>${esc(tx(agent.name))}</b><small>${esc(D.pname(agent.contact))} · ${L('Licence', 'رخصة')} ${ui.idMono(agent.license || '—')}</small></div></div><div style="margin-top:12px">${ui.callout(L('Authorised by the owner in BENA to market and show this unit.', 'مفوّض من المالك في بينا لتسويق هذه الوحدة وعرضها.'), 'mint', 'key')}</div>`
            : `<div class="mk-person">${ui.avatar(D.person(l.by).name, 'lg')}<div class="grow"><b>${esc(shortName(l.by))}</b><small>${L('Ownership verified via BENA record', 'الملكية موثّقة عبر سجل بينا')}</small><small>${L('Usually replies within a day', 'يرد عادةً خلال يوم')}</small></div></div>` })}
        </div>
      </div>
      ${similar.length ? `<div class="mk-sec"><div><h2>${L('Similar places', 'عقارات مشابهة')}</h2></div><button class="link-btn" data-go="${role}-properties">${L('See all', 'عرض الكل')}${icon('chevR', 'flip')}</button></div><div class="mk-lgrid">${similar.map(M.listingCard).join('')}</div>` : ''}
      <div style="margin-top:22px">${ui.demoNote(L('Listing, contacts and price are fictional demonstration data.', 'العرض وجهات الاتصال والسعر بيانات تجريبية وهمية.'))}</div>
      <div class="mk-mobile-cta"><div class="grow"><b>${price(l, false)}</b><small>${l.mode === 'rent' ? L('per month', 'شهرياً') : L('asking price', 'السعر المطلوب')} · ${f.area} ${L('m²', 'م²')}</small></div>${mine ? ui.btn(L('Edit', 'تعديل'), { kind: 'primary', act: 'soon', arg: L('Listing editor', 'محرر العرض') }) : `${ui.btn('', { icon: 'calendarCheck', act: 'mkViewing', arg: l.id, title: L('Schedule a viewing', 'حجز موعد معاينة') })}${ui.btn(L('Contact', 'تواصل'), { kind: 'primary', act: 'mkInquire', arg: l.id })}`}</div>
    </div>`;
  };
  B.act.mkGallery = (id) => {
    const l = M.listing(id);
    B.modal({ title: esc(tx(l.title)), sub: L('Illustrations — photos are not part of the demo', 'رسوم توضيحية — الصور ليست ضمن النسخة التجريبية'), size: 'lg',
      body: `<div class="mk-gal-all">${['facade', 'interior', 'interior2', 'plan'].map((k) => `<div class="media">${M.listingArt(l, k)}</div>`).join('')}</div>` });
  };
  B.act.mkInquire = (id) => {
    const l = M.listing(id);
    const me = D.person(D.me[R()]);
    B.modal({ title: L('Contact about this place', 'تواصل بخصوص هذا العقار'), sub: esc(tx(l.title)), form: 'mkInquire',
      body: `<input type="hidden" name="lid" value="${l.id}"><div class="form-grid">
        ${ui.field({ name: 'name', label: L('Your name', 'اسمك'), value: tx(me.name), required: true })}
        ${ui.field({ name: 'phone', type: 'tel', label: L('Phone', 'الهاتف'), value: me.phone || '', required: true })}
        ${ui.field({ name: 'msg', type: 'textarea', full: true, label: L('Message', 'الرسالة'), value: L(`Hello, I’m interested in ${tx(l.title)} (${l.id}). Is it still available?`, `مرحباً، أنا مهتم بـ ${tx(l.title)} (${l.id}). هل ما زال متاحاً؟`), required: true })}
        ${ui.field({ name: 'via', type: 'radio', full: true, label: L('Preferred contact', 'طريقة التواصل المفضلة'), options: [{ v: 'bena', l: L('BENA message', 'رسالة بينا'), icon: 'chat' }, { v: 'call', l: L('Phone call', 'اتصال هاتفي'), icon: 'phone' }, { v: 'wa', l: 'WhatsApp', icon: 'send' }] })}
      </div><div style="margin-top:14px">${ui.callout(L('Your BENA identity is shared so the owner knows the inquiry is genuine.', 'تتم مشاركة هويتك في بينا ليعرف المالك أن الاستفسار حقيقي.'), 'mint', 'shieldCheck')}</div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send inquiry', 'إرسال الاستفسار'), { kind: 'primary', icon: 'send', type: 'submit' })}` });
  };
  B.submit.mkInquire = (d) => {
    const l = M.listing(d.lid);
    const ref = `INQ-${l.id.slice(-4)}-${String(M.inquiries.length + 31).padStart(3, '0')}`;
    M.inquiries.push({ ref, lid: l.id, via: d.via });
    B.success({ title: L('Inquiry sent', 'تم إرسال الاستفسار'), text: l.agent ? L(`${tx(D.org(l.agent).name)} usually replies within a few hours.`, `يرد ${tx(D.org(l.agent).name)} عادةً خلال ساعات قليلة.`) : L('The owner has been notified and will reply in BENA.', 'تم إشعار المالك وسيرد عبر بينا.'), ref });
  };
  B.act.mkViewing = (id) => {
    const l = M.listing(id);
    const days = [];
    for (let i = 1; days.length < 6; i++) { const d = new Date(2026, 10, 25 + i); if (d.getDay() !== 5) days.push(d); }
    B.modal({ title: L('Schedule a viewing', 'حجز موعد معاينة'), sub: esc(tx(l.title)), form: 'mkViewing',
      body: `<input type="hidden" name="lid" value="${l.id}"><div class="field"><label>${L('Day', 'اليوم')}</label><div class="radio-cards mk-days">${days.map((d, i) => `<label class="radio-card"><input type="radio" name="day" value="${d.toISOString().slice(0, 10)}" ${i === 0 ? 'checked' : ''}><span>${B.dow(d.getDay())}</span><b>${d.getDate()}</b><span>${B.monLong(d.getMonth())}</span></label>`).join('')}</div></div>
        <div class="form-grid" style="margin-top:14px">
          ${ui.field({ name: 'time', type: 'select', label: L('Time', 'الوقت'), options: ['10:00', '11:30', '13:00', '16:30', '18:00'].map((t) => ({ v: t, l: t })) })}
          ${ui.field({ name: 'people', type: 'select', label: L('Attending', 'عدد الحضور'), options: [1, 2, 3, 4].map((n) => ({ v: n, l: L(`${n} ${n > 1 ? 'people' : 'person'}`, `${n} ${n > 1 ? 'أشخاص' : 'شخص'}`) })) })}
          ${ui.field({ name: 'note', full: true, label: L('Note (optional)', 'ملاحظة (اختياري)'), placeholder: L('e.g. I’d like to see the parking space too', 'مثال: أود رؤية موقف السيارة أيضاً') })}
        </div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Request viewing', 'طلب المعاينة'), { kind: 'primary', icon: 'calendarCheck', type: 'submit' })}` });
  };
  B.submit.mkViewing = (d) => {
    const l = M.listing(d.lid);
    B.success({ title: L('Viewing requested', 'تم طلب المعاينة'), text: L(`${B.date(d.day)} at ${d.time}. You’ll get a confirmation from ${l.agent ? tx(D.org(l.agent).name) : L('the owner', 'المالك')} — the building’s BENA ID ${l.bid} is in your calendar invite.`, `${B.date(d.day)} الساعة ${d.time}. سيصلك تأكيد من ${l.agent ? tx(D.org(l.agent).name) : 'المالك'} — رقم بينا للمبنى ${l.bid} مرفق بدعوة التقويم.`), ref: `VW-${l.id.slice(-4)}-${d.day ? d.day.slice(8) : '00'}` });
  };
})();
