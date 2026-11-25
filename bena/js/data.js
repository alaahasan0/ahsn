/*
 * BENA demo data — fictional records for a sample area of Ramallah.
 * Nothing here is real: names, IDs, parcels, money and people are invented.
 * Shared across every role so the ecosystem stays consistent
 * (the tenant in unit 803 rents from the owner persona, etc.).
 */
(function () {
  const B = (window.B = window.B || {});
  const D = (B.data = {});
  const r = B.rng(20261125);
  const pick = (a) => B.pick(r, a);
  const T = (en, ar) => ({ en, ar });

  /* ---------------- municipality & districts ---------------- */
  D.municipality = {
    id: 'muni_ram', name: T('Ramallah Municipality', 'بلدية رام الله'), short: T('Ramallah', 'رام الله'),
    code: 'RAM', officer: 'p_maha', note: T('Sample tenant — not affiliated with or endorsed by any municipality.', 'جهة تجريبية — غير مرتبطة بأي بلدية أو معتمدة منها.'),
  };
  D.districts = [
    { id: 'manara', name: T('Al-Manara', 'المنارة'), seed: [505, 330], buildings: 2146, gis: 1984, units: 9120 },
    { id: 'masyoun', name: T('Al-Masyoun', 'الماصيون'), seed: [300, 500], buildings: 2318, gis: 2101, units: 11640 },
    { id: 'tireh', name: T('Al-Tireh', 'الطيرة'), seed: [140, 300], buildings: 2051, gis: 1712, units: 8310 },
    { id: 'irsal', name: T('Al-Irsal', 'الإرسال'), seed: [690, 150], buildings: 1786, gis: 1630, units: 8455 },
    { id: 'einmunjed', name: T('Ein Munjed', 'عين منجد'), seed: [300, 230], buildings: 1494, gis: 1260, units: 5912 },
    { id: 'oldcity', name: T('Old City', 'البلدة القديمة'), seed: [860, 380], buildings: 1172, gis: 902, units: 3604 },
    { id: 'maahid', name: T('Al-Ma\'ahid', 'المعاهد'), seed: [460, 110], buildings: 1628, gis: 1449, units: 6702 },
    { id: 'batnalhawa', name: T('Batn Al-Hawa', 'بطن الهوا'), seed: [640, 590], buildings: 2267, gis: 1379, units: 7497 },
  ];
  D.district = (id) => D.districts.find((d) => d.id === id) || D.districts[0];

  /* ---------------- streets (map world is 1000 × 700) ---------------- */
  D.roads = [
    { id: 'irsal', name: T('Al-Irsal St.', 'شارع الإرسال'), w: 9, pts: [[505, 330], [560, 260], [620, 200], [690, 130], [760, 40], [790, -20]] },
    { id: 'rukab', name: T('Rukab St.', 'شارع ركب'), w: 8, pts: [[505, 330], [600, 345], [700, 350], [800, 372], [900, 380], [1020, 392]] },
    { id: 'tireh', name: T('Al-Tireh St.', 'شارع الطيرة'), w: 8, pts: [[505, 330], [420, 318], [330, 300], [240, 296], [140, 290], [-20, 282]] },
    { id: 'jaffa', name: T('Jaffa St.', 'شارع يافا'), w: 8, pts: [[505, 330], [450, 400], [380, 470], [300, 560], [220, 680], [200, 720]] },
    { id: 'quds', name: T('Al-Quds St.', 'شارع القدس'), w: 9, pts: [[505, 330], [540, 420], [580, 510], [640, 620], [700, 720]] },
    { id: 'nahda', name: T('Al-Nahda St.', 'شارع النهضة'), w: 6, pts: [[505, 330], [490, 240], [470, 150], [450, 40], [440, -20]] },
    { id: 'ring', name: T('Ring Rd.', 'الطريق الدائري'), w: 7, pts: [[-20, 560], [120, 520], [220, 440], [260, 330], [300, 190], [380, 80], [520, 50], [640, 70], [760, 160], [840, 260], [900, 330], [960, 470], [900, 600], [780, 660], [640, 690], [520, 700]] },
    { id: 'masyoun', name: T('Al-Masyoun St.', 'شارع الماصيون'), w: 6, pts: [[220, 440], [300, 450], [380, 470], [460, 500], [580, 510]] },
    { id: 'einmunjed', name: T('Ein Munjed St.', 'شارع عين منجد'), w: 5, pts: [[300, 190], [330, 300], [360, 400], [380, 470]] },
    { id: 'maahid', name: T('Al-Ma\'ahid St.', 'شارع المعاهد'), w: 5, pts: [[380, 80], [420, 140], [490, 240]] },
    { id: 'oldcity', name: T('Old City Rd.', 'طريق البلدة القديمة'), w: 4, pts: [[800, 372], [830, 300], [880, 250], [940, 230]] },
    { id: 'hawa', name: T('Batn Al-Hawa Rd.', 'طريق بطن الهوا'), w: 5, pts: [[580, 510], [680, 540], [780, 560], [900, 600]] },
    { id: 'lane1', name: null, w: 3, pts: [[120, 520], [160, 400], [140, 290], [110, 160], [140, 40]] },
    { id: 'lane2', name: null, w: 3, pts: [[620, 200], [700, 260], [760, 160]] },
    { id: 'lane3', name: null, w: 3, pts: [[700, 350], [720, 450], [680, 540]] },
    { id: 'lane4', name: null, w: 3, pts: [[240, 296], [210, 200], [300, 190]] },
    { id: 'lane5', name: null, w: 3, pts: [[450, 400], [540, 420]] },
    { id: 'lane6', name: null, w: 3, pts: [[330, 300], [360, 230], [420, 220], [490, 240]] },
    { id: 'lane7', name: null, w: 3, pts: [[300, 560], [400, 600], [520, 610], [640, 620]] },
    { id: 'lane8', name: null, w: 3, pts: [[600, 345], [640, 440], [580, 510]] },
  ];
  D.parks = [
    { name: T('Al-Masyoun Park', 'حديقة الماصيون'), pts: [[390, 520], [450, 530], [460, 575], [400, 580]] },
    { name: T('Ein Munjed Garden', 'متنزه عين منجد'), pts: [[350, 330], [395, 335], [400, 375], [355, 380]] },
    { name: T('Valley green belt', 'الحزام الأخضر'), pts: [[30, 600], [140, 580], [170, 690], [20, 700]] },
  ];

  const segDist = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1]; const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1))); const x = a[0] + t * dx, y = a[1] + t * dy; return Math.hypot(p[0] - x, p[1] - y); };
  const nearRoad = (p) => { let best = 1e9, ang = 0, road = null; D.roads.forEach((rd) => { for (let i = 0; i < rd.pts.length - 1; i++) { const d = segDist(p, rd.pts[i], rd.pts[i + 1]) - rd.w / 2; if (d < best) { best = d; ang = Math.atan2(rd.pts[i + 1][1] - rd.pts[i][1], rd.pts[i + 1][0] - rd.pts[i][0]); road = rd; } } }); return { d: best, ang, road }; };
  const inPoly = (p, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { if ((poly[i][1] > p[1]) !== (poly[j][1] > p[1]) && p[0] < ((poly[j][0] - poly[i][0]) * (p[1] - poly[i][1])) / (poly[j][1] - poly[i][1]) + poly[i][0]) c = !c; } return c; };
  const districtAt = (p) => { let best = null, bd = 1e9; D.districts.forEach((d) => { const dd = Math.hypot(p[0] - d.seed[0], p[1] - d.seed[1]); if (dd < bd) { bd = dd; best = d; } }); return best.id; };
  B.geo = { nearRoad, districtAt, inPoly };

  /* ---------------- generated building footprints ---------------- */
  const TYPE_MIX = {
    manara: ['commercial', 'commercial', 'mixed', 'mixed', 'office', 'residential', 'public'],
    masyoun: ['residential', 'residential', 'mixed', 'office', 'residential', 'commercial'],
    tireh: ['residential', 'residential', 'residential', 'residential', 'mixed', 'public'],
    irsal: ['office', 'mixed', 'residential', 'commercial', 'residential', 'office'],
    einmunjed: ['residential', 'residential', 'residential', 'mixed', 'public'],
    oldcity: ['residential', 'residential', 'commercial', 'mixed', 'heritage', 'heritage'],
    maahid: ['public', 'residential', 'office', 'residential', 'mixed', 'commercial'],
    batnalhawa: ['residential', 'residential', 'residential', 'mixed', 'industrial'],
  };
  const STREETS_GENERIC = {
    manara: ['Main St.', 'Al-Manara Sq.', 'Dar Ibrahim St.'], masyoun: ['Al-Masyoun St.', 'Ahliyya College St.', 'Park St.'],
    tireh: ['Al-Tireh St.', 'Hilltop Rd.', 'Olive Grove St.'], irsal: ['Al-Irsal St.', 'Radio St.', 'Al-Balou\' Rd.'],
    einmunjed: ['Ein Munjed St.', 'Spring St.', 'Garden Ln.'], oldcity: ['Old City Rd.', 'Market Ln.', 'Church St.'],
    maahid: ['Al-Ma\'ahid St.', 'College St.', 'School Ln.'], batnalhawa: ['Batn Al-Hawa Rd.', 'Valley Rd.', 'Terrace St.'],
  };
  const STREETS_AR = {
    'Main St.': 'الشارع الرئيسي', 'Al-Manara Sq.': 'دوار المنارة', 'Dar Ibrahim St.': 'شارع دار إبراهيم', 'Al-Masyoun St.': 'شارع الماصيون', 'Ahliyya College St.': 'شارع الكلية الأهلية', 'Park St.': 'شارع الحديقة',
    'Al-Tireh St.': 'شارع الطيرة', 'Hilltop Rd.': 'طريق التلة', 'Olive Grove St.': 'شارع كرم الزيتون', 'Al-Irsal St.': 'شارع الإرسال', 'Radio St.': 'شارع الإذاعة', 'Al-Balou\' Rd.': 'طريق البالوع',
    'Ein Munjed St.': 'شارع عين منجد', 'Spring St.': 'شارع النبع', 'Garden Ln.': 'زقاق الحديقة', 'Old City Rd.': 'طريق البلدة القديمة', 'Market Ln.': 'زقاق السوق', 'Church St.': 'شارع الكنيسة',
    'Al-Ma\'ahid St.': 'شارع المعاهد', 'College St.': 'شارع الكلية', 'School Ln.': 'زقاق المدرسة', 'Batn Al-Hawa Rd.': 'طريق بطن الهوا', 'Valley Rd.': 'طريق الوادي', 'Terrace St.': 'شارع المصاطب',
  };
  D.buildings = [];
  let seq = 100;
  const SP = 22;
  for (let gy = 14; gy < 700; gy += SP) {
    for (let gx = 14; gx < 1000; gx += SP) {
      const p = [gx + (r() - 0.5) * 10, gy + (r() - 0.5) * 10];
      const nr = nearRoad(p);
      if (nr.d < 6) continue;
      if (D.parks.some((pk) => inPoly(p, pk.pts))) continue;
      const dist = districtAt(p);
      const density = { manara: .92, oldcity: .9, masyoun: .85, irsal: .82, maahid: .76, einmunjed: .74, tireh: .62, batnalhawa: .58 }[dist];
      if (r() > density) continue;
      if (nr.d > 34 && r() < 0.5) continue; // fewer buildings far from roads (terraced hills)
      const ang = nr.d < 20 ? nr.ang : nr.ang + (r() - 0.5) * 0.5;
      const big = dist === 'manara' || dist === 'irsal' ? 1.15 : dist === 'oldcity' ? 0.8 : 1;
      const w = (9 + r() * 9) * big, h = (8 + r() * 7) * big;
      const c = Math.cos(ang), s = Math.sin(ang);
      const corner = (dx, dy) => [p[0] + dx * c - dy * s, p[1] + dx * s + dy * c];
      let poly = [corner(-w / 2, -h / 2), corner(w / 2, -h / 2), corner(w / 2, h / 2), corner(-w / 2, h / 2)];
      if (r() < 0.22) { // L-shape
        poly = [corner(-w / 2, -h / 2), corner(w / 2, -h / 2), corner(w / 2, 0), corner(0, 0), corner(0, h / 2), corner(-w / 2, h / 2)];
      }
      const type = pick(TYPE_MIX[dist]);
      const independent = r() < ({ batnalhawa: .34, oldcity: .26, tireh: .2 }[dist] || 0.1);
      const v = r();
      const verification = independent ? (v < 0.42 ? 'verified' : v < 0.86 ? 'pendingVerification' : 'unverified') : (v < 0.95 ? 'verified' : 'pendingVerification');
      const floors = type === 'heritage' ? 1 + Math.floor(r() * 2) : type === 'residential' ? 3 + Math.floor(r() * 7) : type === 'industrial' ? 1 + Math.floor(r() * 2) : 3 + Math.floor(r() * 10);
      const units = type === 'public' ? 1 : type === 'heritage' ? 1 + Math.floor(r() * 3) : Math.max(1, Math.round(floors * (1.5 + r() * 2.5)));
      seq += 1 + Math.floor(r() * 3);
      const num = 1 + Math.floor(r() * 140);
      const st = pick(STREETS_GENERIC[dist]);
      const m = 1 + Math.floor(r() * 11), dd = 1 + Math.floor(r() * (m === 11 ? 24 : 27));
      D.buildings.push({
        id: `BN-RAM-${String(seq).padStart(5, '0')}`,
        gis: independent ? null : `RM-GIS-${40000 + seq * 3 + Math.floor(r() * 3)}`,
        ref: independent ? null : `RM/${dist.slice(0, 2).toUpperCase()}/${2000 + Math.floor(r() * 25)}/${String(seq).padStart(4, '0')}`,
        name: T(`${num} ${st}`, `${num} ${STREETS_AR[st]}`),
        address: T(`${num} ${st}, ${D.district(dist).name.en}`, `${num} ${STREETS_AR[st]}، ${D.district(dist).name.ar}`),
        district: dist, type, floors, units,
        source: independent ? 'independent' : 'gis',
        verification,
        status: verification === 'unverified' ? 'draft' : 'registered',
        year: type === 'heritage' ? 1890 + Math.floor(r() * 60) : 1975 + Math.floor(r() * 50),
        updated: `2026-${String(m).padStart(2, '0')}-${String(dd).padStart(2, '0')}`,
        parcel: { basin: 3 + Math.floor(r() * 28), parcel: 10 + Math.floor(r() * 400) },
        poly, c: p,
      });
    }
  }

  /* ---------------- key (detailed) buildings ---------------- */
  const KEY = [
    { id: 'BN-RAM-00142', at: [318, 478], gis: 'RM-GIS-48217', ref: 'RM/MA/2016/0142', name: T('Al-Masyoun Residence Tower', 'برج الماصيون السكني'), street: T('14 Al-Masyoun St.', '14 شارع الماصيون'), district: 'masyoun', type: 'residential', floors: 14, units: 54, year: 2017, source: 'gis', verification: 'verified', committee: 'c_masyoun', manager: 'org_arkan', parcel: { basin: 12, parcel: 87 }, permit: 'RM-BP-2015-0331', area: 7460, parking: 60, elevators: 2, tag: T('Flagship residential tower', 'برج سكني رئيسي'), updated: '2026-11-18' },
    { id: 'BN-RAM-00087', at: [168, 316], gis: 'RM-GIS-43561', ref: 'RM/TI/2011/0087', name: T('Al-Tireh Gardens', 'حدائق الطيرة'), street: T('41 Olive Grove St.', '41 شارع كرم الزيتون'), district: 'tireh', type: 'residential', floors: 8, units: 32, year: 2012, source: 'gis', verification: 'verified', committee: 'c_tireh', manager: null, parcel: { basin: 7, parcel: 214 }, permit: 'RM-BP-2010-1187', area: 4120, parking: 28, elevators: 1, updated: '2026-10-30' },
    { id: 'BN-RAM-00311', at: [548, 296], gis: 'RM-GIS-49902', ref: 'RM/MN/2018/0311', name: T('Manara Business Center', 'مركز المنارة للأعمال'), street: T('3 Al-Irsal St.', '3 شارع الإرسال'), district: 'manara', type: 'office', floors: 12, units: 48, year: 2019, source: 'gis', verification: 'verified', committee: null, manager: 'org_arkan', facility: 'org_sanad', parcel: { basin: 2, parcel: 31 }, permit: 'RM-BP-2017-0912', area: 9800, parking: 120, elevators: 4, updated: '2026-11-21' },
    { id: 'BN-RAM-00415', at: [652, 176], gis: 'RM-GIS-50388', ref: 'RM/IR/2014/0415', name: T('Irsal Plaza', 'بلازا الإرسال'), street: T('88 Al-Irsal St.', '88 شارع الإرسال'), district: 'irsal', type: 'mixed', floors: 10, units: 38, year: 2015, source: 'gis', verification: 'verified', committee: 'c_irsal', manager: 'org_arkan', facility: 'org_sanad', parcel: { basin: 19, parcel: 133 }, permit: 'RM-BP-2013-0420', area: 8650, parking: 90, elevators: 3, updated: '2026-11-09' },
    { id: 'BN-RAM-00203', at: [318, 252], gis: 'RM-GIS-45120', ref: 'RM/EM/2009/0203', name: T('Ein Munjed Residences', 'مساكن عين منجد'), street: T('22 Spring St.', '22 شارع النبع'), district: 'einmunjed', type: 'residential', floors: 6, units: 18, year: 2009, source: 'gis', verification: 'verified', committee: 'c_einmunjed', manager: 'org_arkan', parcel: { basin: 9, parcel: 56 }, permit: 'RM-BP-2007-0644', area: 2380, parking: 14, elevators: 1, updated: '2026-09-14' },
    { id: 'BN-RAM-00529', at: [872, 396], gis: null, ref: null, name: T('Old Town Stone House', 'البيت الحجري في البلدة القديمة'), street: T('7 Market Ln.', '7 زقاق السوق'), district: 'oldcity', type: 'heritage', floors: 3, units: 4, year: 1934, source: 'independent', verification: 'pendingVerification', committee: null, manager: null, parcel: { basin: 1, parcel: 18 }, permit: null, area: 410, parking: 0, elevators: 0, updated: '2026-11-20', status: 'registered' },
    { id: 'BN-RAM-00618', at: [430, 128], gis: 'RM-GIS-51740', ref: 'RM/MH/2020/0618', name: T('Ma\'ahid Medical Plaza', 'مجمع المعاهد الطبي'), street: T('5 College St.', '5 شارع الكلية'), district: 'maahid', type: 'commercial', floors: 7, units: 28, year: 2021, source: 'gis', verification: 'verified', committee: null, manager: null, facility: 'org_sanad', parcel: { basin: 15, parcel: 302 }, permit: 'RM-BP-2019-0118', area: 6200, parking: 70, elevators: 3, updated: '2026-11-15' },
    { id: 'BN-RAM-00744', at: [668, 588], gis: null, ref: null, name: T('Batn Al-Hawa Villas', 'فلل بطن الهوا'), street: T('19 Terrace St.', '19 شارع المصاطب'), district: 'batnalhawa', type: 'residential', floors: 3, units: 6, year: 2022, source: 'independent', verification: 'verified', committee: null, manager: 'org_arkan', parcel: { basin: 27, parcel: 95 }, permit: 'RM-BP-2021-0777', area: 1480, parking: 8, elevators: 0, updated: '2026-08-02' },
    { id: 'BN-RAM-00266', at: [256, 548], gis: 'RM-GIS-46633', ref: 'RM/MA/2013/0266', name: T('Masyoun Heights', 'مرتفعات الماصيون'), street: T('6 Park St.', '6 شارع الحديقة'), district: 'masyoun', type: 'residential', floors: 9, units: 34, year: 2014, source: 'gis', verification: 'verified', committee: 'c_heights', manager: 'org_arkan', parcel: { basin: 12, parcel: 140 }, permit: 'RM-BP-2012-0503', area: 4900, parking: 36, elevators: 2, updated: '2026-10-11' },
    { id: 'BN-RAM-00391', at: [708, 362], gis: 'RM-GIS-47801', ref: 'RM/MN/2006/0391', name: T('Rukab Corner Building', 'عمارة زاوية ركب'), street: T('120 Rukab St.', '120 شارع ركب'), district: 'manara', type: 'mixed', floors: 5, units: 14, year: 2006, source: 'gis', verification: 'pendingVerification', committee: null, manager: null, parcel: { basin: 3, parcel: 77 }, permit: 'RM-BP-2004-0219', area: 1960, parking: 0, elevators: 1, updated: '2026-11-22', status: 'registered' },
  ];
  KEY.forEach((k) => {
    // take over the nearest generated footprint so it sits naturally in the fabric
    let best = null, bd = 1e9;
    D.buildings.forEach((b) => { const d = Math.hypot(b.c[0] - k.at[0], b.c[1] - k.at[1]); if (d < bd && !b.key) { bd = d; best = b; } });
    const big = { residential: 1.35, office: 1.6, mixed: 1.5, commercial: 1.45, heritage: 1 }[k.type] || 1.3;
    const ang = nearRoad(best.c).ang;
    const w = 16 * big, h = 12 * big, c = Math.cos(ang), s = Math.sin(ang), p = best.c;
    const corner = (dx, dy) => [p[0] + dx * c - dy * s, p[1] + dx * s + dy * c];
    Object.assign(best, {
      ...k, key: true, status: k.status || 'registered',
      address: T(`${k.street.en}, ${D.district(k.district).name.en}, Ramallah`, `${k.street.ar}، ${D.district(k.district).name.ar}، رام الله`),
      poly: [corner(-w / 2, -h / 2), corner(w / 2, -h / 2), corner(w / 2, h / 2), corner(-w / 2, h / 2)],
    });
    delete best.at;
  });
  // keep IDs unique if a generated ID collided with a key ID
  const seen = new Set(D.buildings.filter((b) => b.key).map((b) => b.id));
  let extra = 0;
  D.buildings.forEach((b) => { if (b.key) return; while (seen.has(b.id)) b.id = `BN-RAM-${String(seq + (++extra)).padStart(5, '0')}`; seen.add(b.id); });
  D.keyBuildings = D.buildings.filter((b) => b.key);
  D.building = (id) => D.buildings.find((b) => b.id === id);

  D.types = {
    residential: { en: 'Residential', ar: 'سكني', icon: 'home', color: '#7FA7C2' },
    commercial: { en: 'Commercial', ar: 'تجاري', icon: 'store', color: '#F2B35A' },
    office: { en: 'Office', ar: 'مكاتب', icon: 'briefcase', color: '#142B3B' },
    mixed: { en: 'Mixed-use', ar: 'متعدد الاستخدامات', icon: 'layers', color: '#36D6A0' },
    public: { en: 'Public / institutional', ar: 'عام / مؤسسي', icon: 'landmark', color: '#9B8AE0' },
    heritage: { en: 'Heritage', ar: 'تراثي', icon: 'award', color: '#C9A27A' },
    industrial: { en: 'Light industrial', ar: 'صناعي خفيف', icon: 'package', color: '#9AA8B5' },
  };
  D.typeLabel = (t) => B.tx(D.types[t] || t);

  /* ---------------- people ---------------- */
  const P = (id, en, ar, extra = {}) => ({ id, name: T(en, ar), ...extra });
  D.people = {};
  [
    P('p_lina', 'Lina Haddad', 'لينا حداد', { phone: '+970 59 812 4410', email: 'lina.haddad@example.ps' }),
    P('p_khaled', 'Khaled Mansour', 'خالد منصور', { phone: '+970 59 733 2085', email: 'k.mansour@example.ps' }),
    P('p_rana', 'Rana Mansour', 'رنا منصور', { phone: '+970 56 620 1934', email: 'rana.m@example.ps' }),
    P('p_samer', 'Samer Khoury', 'سامر خوري', { phone: '+970 59 901 4462', email: 'samer.k@example.ps' }),
    P('p_hiba', 'Hiba Nasser', 'هبة ناصر', { phone: '+970 59 455 0183' }),
    P('p_fadi', 'Fadi Qassis', 'فادي قسيس', { phone: '+970 56 388 7740' }),
    P('p_mona', 'Mona Daoud', 'منى داود', { phone: '+970 59 270 6618' }),
    P('p_tariq', 'Tariq Hamdan', 'طارق حمدان', { phone: '+970 59 640 1127' }),
    P('p_rania', 'Rania Odeh', 'رانيا عودة', { phone: '+970 2 296 4410', email: 'rania@arkan.example' }),
    P('p_omar', 'Omar Saleh', 'عمر صالح', { phone: '+970 2 298 1170', email: 'omar@sanad.example' }),
    P('p_yousef', 'Yousef Jaber', 'يوسف جابر', { phone: '+970 59 515 9087', email: 'yousef@jabertech.example' }),
    P('p_dana', 'Dana Salem', 'دانا سالم', { email: 'dana@bena.example' }),
    P('p_maha', 'Eng. Maha Awad', 'م. مها عوض', { email: 'gis.office@ramallah-demo.example' }),
    P('p_adel', 'Adel Shami', 'عادل شامي'), P('p_nadia', 'Nadia Habash', 'نادية حبش'), P('p_ibrahim', 'Ibrahim Zaid', 'إبراهيم زيد'),
    P('p_layla', 'Layla Saadeh', 'ليلى سعادة'), P('p_majd', 'Majd Taweel', 'مجد الطويل'), P('p_sireen', 'Sireen Abed', 'سيرين عابد'),
    P('p_hani', 'Hani Rizeq', 'هاني رزق'), P('p_ruba', 'Ruba Khalil', 'ربى خليل'), P('p_basel', 'Basel Hijazi', 'باسل حجازي'),
    P('p_yara', 'Yara Shahin', 'يارا شاهين'), P('p_ahmad', 'Ahmad Odeh', 'أحمد عودة'), P('p_dima', 'Dima Saba', 'ديما صبا'),
    P('p_karim', 'Karim Asfour', 'كريم عصفور'), P('p_reem', 'Reem Barakat', 'ريم بركات'), P('p_nabil', 'Nabil Haddad', 'نبيل حداد'),
    P('p_suha', 'Suha Ghanem', 'سهى غانم'), P('p_jamil', 'Jamil Atallah', 'جميل عطا الله'), P('p_noor', 'Noor Hasan', 'نور حسن'),
    P('p_walid', 'Walid Sabbagh', 'وليد صباغ'), P('p_amal', 'Amal Issa', 'أمل عيسى'), P('p_zaid', 'Zaid Nassar', 'زيد نصار'),
    P('p_lama', 'Lama Farah', 'لمى فرح'), P('p_rami', 'Rami Khoury', 'رامي خوري'), P('p_hala', 'Hala Masri', 'هالة المصري'),
    P('p_firas', 'Firas Awwad', 'فراس عواد'), P('p_salma', 'Salma Odeh', 'سلمى عودة'), P('p_issa', 'Issa Qumsieh', 'عيسى قمصية'),
  ].forEach((p) => { D.people[p.id] = p; });
  D.person = (id) => D.people[id] || { id, name: T('Unknown', 'غير معروف') };
  D.pname = (id) => B.tx(D.person(id).name);
  const POOL = Object.keys(D.people).filter((k) => !['p_rania', 'p_omar', 'p_yousef', 'p_dana', 'p_maha'].includes(k));

  /** Demo personas — who is "signed in" in each role. */
  D.me = { municipality: 'p_maha', owner: 'p_khaled', resident: 'p_lina', committee: 'p_samer', manager: 'p_rania', facility: 'p_omar', provider: 'p_yousef', admin: 'p_dana' };

  /* ---------------- organizations ---------------- */
  D.orgs = {
    muni_ram: { id: 'muni_ram', type: 'municipality', name: D.municipality.name },
    org_arkan: { id: 'org_arkan', type: 'manager', name: T('Arkan Property Management', 'أركان لإدارة العقارات'), since: '2018-03-01', license: 'PM-RAM-2018-044', contact: 'p_rania', phone: '+970 2 296 4410' },
    org_sanad: { id: 'org_sanad', type: 'facility', name: T('Sanad Facility Services', 'سند لخدمات إدارة المرافق'), since: '2016-06-01', contact: 'p_omar', phone: '+970 2 298 1170' },
    org_jaber: { id: 'org_jaber', type: 'provider', name: T('Jaber Technical Services', 'جابر للخدمات الفنية'), since: '2011-01-15', contact: 'p_yousef' },
    org_bena: { id: 'org_bena', type: 'platform', name: T('BENA Platform', 'منصة بينا') },
  };
  D.org = (id) => D.orgs[id];

  /* ---------------- units ---------------- */
  D.units = [];
  const unitPlan = {
    'BN-RAM-00142': { ground: [['shop', 'G01', 86], ['shop', 'G02', 74]], perFloor: 4, floors: 13, kind: 'apartment', areas: [128, 112, 146, 98] },
    'BN-RAM-00087': { perFloor: 4, floors: 8, kind: 'apartment', areas: [118, 104, 132, 96] },
    'BN-RAM-00311': { perFloor: 4, floors: 12, kind: 'office', areas: [210, 160, 180, 140] },
    'BN-RAM-00415': { ground: [['shop', 'G01', 92], ['shop', 'G02', 64], ['shop', 'G03', 70], ['shop', 'G04', 110]], perFloor: 4, floors: 9, kind: 'mixedUpper', areas: [120, 95, 140, 88], extraDrop: 2 },
    'BN-RAM-00203': { perFloor: 3, floors: 6, kind: 'apartment', areas: [136, 122, 150] },
    'BN-RAM-00529': { perFloor: 2, floors: 2, kind: 'apartment', areas: [92, 84] },
    'BN-RAM-00618': { perFloor: 4, floors: 7, kind: 'clinic', areas: [120, 96, 110, 84] },
    'BN-RAM-00744': { perFloor: 2, floors: 3, kind: 'apartment', areas: [210, 196] },
    'BN-RAM-00266': { ground: [['shop', 'G01', 80], ['shop', 'G02', 80]], perFloor: 4, floors: 8, kind: 'apartment', areas: [124, 108, 140, 96] },
    'BN-RAM-00391': { ground: [['shop', 'G01', 60], ['shop', 'G02', 58]], perFloor: 3, floors: 4, kind: 'apartment', areas: [104, 96, 120] },
  };
  const ur = B.rng(777);
  Object.entries(unitPlan).forEach(([bid, pl]) => {
    (pl.ground || []).forEach(([kind, num, area]) => D.units.push({ id: `${bid}-${num}`, building: bid, floor: 0, number: num, kind, area }));
    for (let f = 1; f <= pl.floors; f++) {
      for (let k = 1; k <= pl.perFloor; k++) {
        let kind = pl.kind;
        if (kind === 'mixedUpper') kind = f <= 4 ? 'office' : 'apartment';
        D.units.push({ id: `${bid}-${f}${String(k).padStart(2, '0')}`, building: bid, floor: f, number: `${f}${String(k).padStart(2, '0')}`, kind, area: pl.areas[(k - 1) % pl.areas.length], beds: kind === 'apartment' ? (pl.areas[(k - 1) % pl.areas.length] > 125 ? 3 : 2) : 0 });
      }
    }
  });
  // align declared unit counts with generated units
  D.keyBuildings.forEach((b) => { b.units = D.units.filter((u) => u.building === b.id).length; });
  D.units.forEach((u) => {
    const v = ur();
    u.status = v < 0.36 ? 'ownerOccupied' : v < 0.82 ? 'rented' : v < 0.95 ? 'vacant' : 'maintenance';
    if (u.kind === 'office' || u.kind === 'shop' || u.kind === 'clinic') u.status = v < 0.72 ? 'rented' : v < 0.9 ? 'vacant' : 'ownerOccupied';
    u.owner = POOL[Math.floor(ur() * POOL.length)];
    u.tenant = u.status === 'rented' ? POOL[Math.floor(ur() * POOL.length)] : u.status === 'ownerOccupied' ? u.owner : null;
    u.charge = u.kind === 'shop' ? 240 : u.kind === 'office' || u.kind === 'clinic' ? 320 : 180;
  });
  const setU = (id, o) => { const u = D.units.find((x) => x.id === id); if (u) Object.assign(u, o); return u; };
  // persona links
  setU('BN-RAM-00142-803', { status: 'rented', owner: 'p_khaled', tenant: 'p_lina', beds: 3, area: 146 });
  setU('BN-RAM-00142-1102', { status: 'vacant', owner: 'p_khaled', tenant: null });
  setU('BN-RAM-00142-1201', { status: 'ownerOccupied', owner: 'p_samer', tenant: 'p_samer' });
  setU('BN-RAM-00142-502', { status: 'ownerOccupied', owner: 'p_hiba', tenant: 'p_hiba' });
  setU('BN-RAM-00142-704', { status: 'rented', owner: 'p_fadi', tenant: 'p_tariq' });
  setU('BN-RAM-00142-301', { status: 'maintenance', owner: 'p_mona', tenant: null });
  setU('BN-RAM-00415-G02', { status: 'rented', owner: 'p_khaled', tenant: 'p_basel' });
  setU('BN-RAM-00311-702', { status: 'rented', owner: 'p_khaled', tenant: 'p_karim' });
  setU('BN-RAM-00087-402', { status: 'ownerOccupied', owner: 'p_khaled', tenant: 'p_khaled', coOwners: ['p_rana'] });
  setU('BN-RAM-00266-604', { status: 'vacant', owner: 'p_khaled', tenant: null, coOwners: ['p_rana'] });
  D.unit = (id) => D.units.find((u) => u.id === id);
  D.unitsOf = (bid) => D.units.filter((u) => u.building === bid);
  D.unitKinds = { apartment: T('Apartment', 'شقة'), office: T('Office', 'مكتب'), shop: T('Shop', 'محل تجاري'), clinic: T('Clinic', 'عيادة') };
  D.unitLabel = (u) => `${B.tx(D.unitKinds[u.kind])} ${u.number}`;

  /* ---------------- leases ---------------- */
  D.leases = [];
  const lr = B.rng(4242);
  let lseq = 310;
  D.units.filter((u) => u.status === 'rented').forEach((u) => {
    const startM = Math.floor(lr() * 20); // months back
    const start = new Date(2026, 10 - startM, 1);
    const end = new Date(start.getFullYear() + 1, start.getMonth(), 0);
    const base = u.kind === 'office' ? 14 : u.kind === 'shop' ? 32 : u.kind === 'clinic' ? 16 : 22;
    const rent = Math.round((u.area * base) / 10) * 10 / (u.kind === 'apartment' ? 1 : 1);
    const iso = (d) => d.toISOString().slice(0, 10);
    const days = B.daysBetween(B.today, end);
    D.leases.push({
      id: `L-${start.getFullYear()}-${String(lseq++).padStart(4, '0')}`, unit: u.id, building: u.building, tenant: u.tenant, owner: u.owner,
      start: iso(start), end: iso(end), rent: Math.round(rent / 50) * 50, cur: 'ILS', deposit: Math.round(rent / 50) * 100, payDay: 1,
      status: days < 0 ? 'expired' : days < 75 ? 'expiring' : 'active', manager: D.building(u.building)?.manager || null,
    });
  });
  const setL = (unit, o) => { const l = D.leases.find((x) => x.unit === unit); if (l) Object.assign(l, o); return l; };
  setL('BN-RAM-00142-803', { id: 'L-2026-0803', start: '2026-02-01', end: '2027-01-31', rent: 3200, deposit: 6400, status: 'expiring', amendments: 1 });
  setL('BN-RAM-00415-G02', { id: 'L-2024-0415', start: '2024-06-01', end: '2027-05-31', rent: 4800, deposit: 9600, status: 'active' });
  setL('BN-RAM-00311-702', { id: 'L-2025-0702', start: '2025-03-01', end: '2027-02-28', rent: 5600, cur: 'ILS', deposit: 11200, status: 'active' });
  setL('BN-RAM-00142-704', { status: 'active' });
  D.lease = (id) => D.leases.find((l) => l.id === id);
  D.leaseOfUnit = (uid) => D.leases.find((l) => l.unit === uid);

  /* ---------------- committees / associations ---------------- */
  D.committees = {
    c_masyoun: {
      id: 'c_masyoun', building: 'BN-RAM-00142', kind: 'legal', name: T('Al-Masyoun Tower Owners\' Association', 'جمعية مالكي برج الماصيون'),
      basis: T('Registered under the Floors and Apartments Ownership Law', 'مسجّلة وفق قانون ملكية الطوابق والشقق'), regNo: 'OA-RAM-2018-0217', formed: '2018-04-12', term: T('2025 – 2027', '2025 – 2027'),
      monthly: 180, bank: T('Association account ••• 4410', 'حساب الجمعية ••• 4410'),
      members: [
        { p: 'p_samer', role: T('Chair', 'الرئيس'), unit: 'BN-RAM-00142-1201', since: '2025-01-15', auth: T('Signs contracts up to ₪15,000; calls general assemblies', 'توقيع العقود حتى 15,000 ₪؛ الدعوة للهيئة العامة') },
        { p: 'p_hiba', role: T('Treasurer', 'أمين الصندوق'), unit: 'BN-RAM-00142-502', since: '2025-01-15', auth: T('Collects contributions; co-signs payments', 'تحصيل المساهمات؛ التوقيع المشترك على الدفعات') },
        { p: 'p_fadi', role: T('Secretary', 'أمين السر'), unit: 'BN-RAM-00142-704', since: '2025-01-15', auth: T('Minutes, notices and records', 'المحاضر والإشعارات والسجلات') },
        { p: 'p_mona', role: T('Member — maintenance', 'عضو — الصيانة'), unit: 'BN-RAM-00142-301', since: '2025-01-15', auth: T('Supervises contractors', 'الإشراف على المقاولين') },
        { p: 'p_adel', role: T('Member', 'عضو'), unit: 'BN-RAM-00142-904', since: '2026-03-02', auth: T('—', '—'), delegated: 'p_khaled' },
      ],
    },
    c_tireh: { id: 'c_tireh', building: 'BN-RAM-00087', kind: 'informal', name: T('Al-Tireh Gardens Residents\' Committee', 'لجنة سكان حدائق الطيرة'), basis: T('Informal — agreed by residents\' meeting, no legal registration', 'غير رسمية — بموافقة اجتماع السكان، دون تسجيل قانوني'), formed: '2021-09-05', monthly: 150, members: [{ p: 'p_nadia', role: T('Coordinator', 'المنسقة'), since: '2023-09-01' }, { p: 'p_khaled', role: T('Member', 'عضو'), unit: 'BN-RAM-00087-402', since: '2023-09-01' }, { p: 'p_ibrahim', role: T('Member', 'عضو'), since: '2023-09-01' }] },
    c_einmunjed: { id: 'c_einmunjed', building: 'BN-RAM-00203', kind: 'authorized', name: T('Authorized building manager', 'مدير المبنى المفوّض'), basis: T('Power of attorney signed by 14 of 18 unit owners', 'وكالة موقعة من 14 من أصل 18 مالكاً'), formed: '2024-02-10', monthly: 160, members: [{ p: 'p_layla', role: T('Authorized manager', 'المديرة المفوّضة'), since: '2024-02-10' }] },
    c_irsal: { id: 'c_irsal', building: 'BN-RAM-00415', kind: 'legal', name: T('Irsal Plaza Owners\' Association', 'جمعية مالكي بلازا الإرسال'), basis: T('Registered under the Floors and Apartments Ownership Law', 'مسجّلة وفق قانون ملكية الطوابق والشقق'), regNo: 'OA-RAM-2016-0098', formed: '2016-02-01', monthly: 260, members: [{ p: 'p_walid', role: T('Chair', 'الرئيس'), since: '2024-01-01' }, { p: 'p_amal', role: T('Treasurer', 'أمين الصندوق'), since: '2024-01-01' }] },
    c_heights: { id: 'c_heights', building: 'BN-RAM-00266', kind: 'informal', name: T('Masyoun Heights Committee', 'لجنة مرتفعات الماصيون'), basis: T('Informal residents\' committee', 'لجنة سكان غير رسمية'), formed: '2019-05-20', monthly: 170, members: [{ p: 'p_zaid', role: T('Coordinator', 'المنسق'), since: '2022-05-01' }] },
  };
  D.committeeOf = (bid) => Object.values(D.committees).find((c) => c.building === bid);

  /* ---------------- service providers (marketplace + provider role) ---------------- */
  D.serviceCats = [
    { id: 'cleaning', name: T('Cleaning', 'التنظيف'), icon: 'sparkles' },
    { id: 'plumbing', name: T('Plumbing', 'السباكة'), icon: 'droplet' },
    { id: 'electrical', name: T('Electrical', 'الكهرباء'), icon: 'zap' },
    { id: 'elevators', name: T('Elevators', 'المصاعد'), icon: 'elevator' },
    { id: 'hvac', name: T('HVAC', 'التكييف والتهوية'), icon: 'wind' },
    { id: 'pest', name: T('Pest control', 'مكافحة الحشرات'), icon: 'bug' },
    { id: 'security', name: T('Security', 'الأمن والحراسة'), icon: 'shield' },
    { id: 'tanks', name: T('Water tanks', 'خزانات المياه'), icon: 'tank' },
    { id: 'general', name: T('General maintenance', 'الصيانة العامة'), icon: 'wrench' },
  ];
  D.cat = (id) => D.serviceCats.find((c) => c.id === id) || D.serviceCats[8];
  D.providers = [
    { id: 'sp_jaber', org: 'org_jaber', name: T('Jaber Technical Services', 'جابر للخدمات الفنية'), cats: ['plumbing', 'electrical', 'hvac', 'general'], rating: 4.8, reviews: 214, jobs: 1320, since: 2011, areas: ['manara', 'masyoun', 'tireh', 'einmunjed', 'irsal'], response: T('~2 hrs', '~ساعتان'), verified: true, from: 120, tagline: T('Certified technicians for homes and buildings', 'فنيون معتمدون للمنازل والمباني') },
    { id: 'sp_sparkle', name: T('Sparkle Building Care', 'سباركل للعناية بالمباني'), cats: ['cleaning'], rating: 4.7, reviews: 388, jobs: 2410, since: 2015, areas: ['manara', 'masyoun', 'irsal', 'maahid', 'batnalhawa'], response: T('Same day', 'في نفس اليوم'), verified: true, from: 90, tagline: T('Common-area and deep cleaning contracts', 'عقود تنظيف المناطق المشتركة والتنظيف العميق') },
    { id: 'sp_lift', name: T('LiftLine Elevators', 'لفت لاين للمصاعد'), cats: ['elevators'], rating: 4.9, reviews: 96, jobs: 610, since: 2009, areas: ['manara', 'masyoun', 'irsal', 'maahid', 'tireh', 'einmunjed', 'oldcity', 'batnalhawa'], response: T('24/7 emergency', 'طوارئ 24/7'), verified: true, from: 350, tagline: T('Licensed elevator inspection and maintenance', 'فحص وصيانة مصاعد مرخّصة') },
    { id: 'sp_cool', name: T('CoolAir HVAC', 'كول إير للتكييف'), cats: ['hvac'], rating: 4.5, reviews: 141, jobs: 760, since: 2014, areas: ['manara', 'irsal', 'maahid'], response: T('Next day', 'اليوم التالي'), verified: true, from: 150, tagline: T('Central systems, chillers and split units', 'الأنظمة المركزية والمبردات والوحدات المنفصلة') },
    { id: 'sp_guard', name: T('Guardian Security', 'الحارس للأمن'), cats: ['security'], rating: 4.4, reviews: 58, jobs: 190, since: 2017, areas: ['manara', 'masyoun', 'irsal'], response: T('48 hrs', '48 ساعة'), verified: true, from: 2400, tagline: T('Guards, CCTV and access control', 'حراسة وكاميرات وأنظمة دخول') },
    { id: 'sp_pure', name: T('PureTank Water Services', 'بيور تانك لخدمات المياه'), cats: ['tanks', 'plumbing'], rating: 4.6, reviews: 172, jobs: 980, since: 2013, areas: ['tireh', 'masyoun', 'batnalhawa', 'oldcity', 'einmunjed'], response: T('Same day', 'في نفس اليوم'), verified: true, from: 180, tagline: T('Rooftop tank cleaning, sterilisation and pumps', 'تنظيف وتعقيم خزانات الأسطح والمضخات') },
    { id: 'sp_shield', name: T('ShieldPest', 'شيلد لمكافحة الحشرات'), cats: ['pest'], rating: 4.3, reviews: 77, jobs: 420, since: 2018, areas: ['manara', 'oldcity', 'masyoun', 'irsal'], response: T('Next day', 'اليوم التالي'), verified: false, from: 140, tagline: T('Licensed, low-odour treatments', 'معالجات مرخّصة منخفضة الرائحة') },
    { id: 'sp_volt', name: T('Volt Electric Co.', 'فولت للكهرباء'), cats: ['electrical'], rating: 4.6, reviews: 133, jobs: 870, since: 2012, areas: ['manara', 'maahid', 'irsal', 'einmunjed'], response: T('~3 hrs', '~3 ساعات'), verified: true, from: 110, tagline: T('Panels, generators and building wiring', 'اللوحات والمولدات وتمديدات المباني') },
    { id: 'sp_handy', name: T('Bait Fix Handyman', 'بيت فيكس للصيانة'), cats: ['general', 'plumbing'], rating: 4.2, reviews: 64, jobs: 300, since: 2020, areas: ['tireh', 'einmunjed', 'masyoun'], response: T('Same day', 'في نفس اليوم'), verified: false, from: 80, tagline: T('Small repairs, painting and fit-outs', 'إصلاحات صغيرة ودهان وتجهيزات') },
  ];
  D.provider = (id) => D.providers.find((p) => p.id === id);

  /* ---------------- maintenance & service requests ---------------- */
  const Q = (id, o) => ({ id, ...o });
  D.requests = [
    Q('MR-24518', { building: 'BN-RAM-00142', unit: 'BN-RAM-00142-803', by: 'p_lina', cat: 'plumbing', title: T('Kitchen sink leaking under cabinet', 'تسريب تحت مغسلة المطبخ'), desc: T('Slow leak from the drain pipe; water pooling inside the cabinet since Sunday.', 'تسريب بطيء من أنبوب التصريف؛ تجمّع المياه داخل الخزانة منذ الأحد.'), status: 'inProgress', priority: 'medium', created: '2026-11-22', provider: 'sp_jaber', tech: T('Ali (Jaber Technical)', 'علي (جابر الفنية)'), visit: '2026-11-26', scope: 'unit' }),
    Q('MR-24477', { building: 'BN-RAM-00142', unit: null, by: 'p_fadi', cat: 'elevators', title: T('Elevator B stops between floors 9 and 10', 'المصعد ب يتوقف بين الطابقين 9 و10'), desc: T('Reported by several residents; elevator restarts after a minute.', 'أبلغ عنه عدة سكان؛ يعاود المصعد العمل بعد دقيقة.'), status: 'assigned', priority: 'high', created: '2026-11-20', provider: 'sp_lift', visit: '2026-11-25', scope: 'common' }),
    Q('MR-24390', { building: 'BN-RAM-00142', unit: null, by: 'p_mona', cat: 'tanks', title: T('Quarterly rooftop tank cleaning', 'التنظيف الربعي لخزانات السطح'), desc: T('Scheduled cleaning and sterilisation of 6 rooftop tanks.', 'تنظيف وتعقيم مجدول لـ 6 خزانات على السطح.'), status: 'scheduled', priority: 'low', created: '2026-11-10', provider: 'sp_pure', visit: '2026-12-03', scope: 'common' }),
    Q('MR-24211', { building: 'BN-RAM-00142', unit: 'BN-RAM-00142-803', by: 'p_lina', cat: 'electrical', title: T('Balcony light not working', 'إنارة الشرفة لا تعمل'), desc: T('Replaced bulb; fixture still dead.', 'تم تبديل اللمبة؛ الإنارة ما زالت لا تعمل.'), status: 'completed', priority: 'low', created: '2026-10-28', closed: '2026-10-30', provider: 'sp_jaber', rating: 5, scope: 'unit' }),
    Q('MR-24502', { building: 'BN-RAM-00142', unit: null, by: 'p_hiba', cat: 'cleaning', title: T('Stairwell deep clean after renovation', 'تنظيف عميق للدرج بعد الترميم'), desc: T('Dust from unit 301 works on floors 2–4.', 'غبار من أعمال الوحدة 301 في الطوابق 2–4.'), status: 'open', priority: 'medium', created: '2026-11-23', provider: null, scope: 'common' }),
    Q('MR-24460', { building: 'BN-RAM-00311', unit: 'BN-RAM-00311-702', by: 'p_karim', cat: 'hvac', title: T('Office too warm — VAV not responding', 'المكتب حار — وحدة التهوية لا تستجيب'), desc: T('Zone 7B stays at 27°C.', 'المنطقة 7ب تبقى على 27 درجة.'), status: 'inProgress', priority: 'high', created: '2026-11-21', provider: 'sp_cool', scope: 'unit' }),
    Q('MR-24433', { building: 'BN-RAM-00415', unit: 'BN-RAM-00415-G02', by: 'p_basel', cat: 'electrical', title: T('Shop front sign flickering', 'لافتة المحل تومض'), desc: T('Possible ballast or wiring issue.', 'احتمال مشكلة في المحوّل أو التمديدات.'), status: 'open', priority: 'low', created: '2026-11-19', provider: null, scope: 'unit' }),
    Q('MR-24398', { building: 'BN-RAM-00087', unit: null, by: 'p_nadia', cat: 'pest', title: T('Ants in ground-floor entrance', 'نمل في مدخل الطابق الأرضي'), status: 'quoted', priority: 'low', created: '2026-11-14', provider: 'sp_shield', scope: 'common' }),
    Q('MR-24371', { building: 'BN-RAM-00266', unit: 'BN-RAM-00266-604', by: 'p_rania', cat: 'general', title: T('Repaint vacant unit 604 before viewing', 'إعادة دهان الوحدة الشاغرة 604 قبل المعاينة'), status: 'scheduled', priority: 'medium', created: '2026-11-12', provider: 'sp_handy', visit: '2026-11-29', scope: 'unit' }),
    Q('MR-24355', { building: 'BN-RAM-00203', unit: null, by: 'p_layla', cat: 'plumbing', title: T('Booster pump noisy at night', 'مضخة الضغط مزعجة ليلاً'), status: 'inProgress', priority: 'medium', created: '2026-11-11', provider: 'sp_jaber', scope: 'common' }),
    Q('MR-24320', { building: 'BN-RAM-00618', unit: null, by: 'p_omar', cat: 'elevators', title: T('Annual elevator certification — 3 cars', 'الترخيص السنوي للمصاعد — 3 مصاعد'), status: 'scheduled', priority: 'medium', created: '2026-11-05', provider: 'sp_lift', visit: '2026-12-08', scope: 'common' }),
    Q('MR-24288', { building: 'BN-RAM-00142', unit: 'BN-RAM-00142-1102', by: 'p_khaled', cat: 'general', title: T('Fix bedroom door hinge before new tenant', 'إصلاح مفصلة باب غرفة النوم قبل المستأجر الجديد'), status: 'completed', priority: 'low', created: '2026-10-20', closed: '2026-10-24', provider: 'sp_handy', rating: 4, scope: 'unit' }),
  ];
  D.request = (id) => D.requests.find((q) => q.id === id);
  D.requestsOf = (bid) => D.requests.filter((q) => q.building === bid);

  /* ---------------- announcements ---------------- */
  D.announcements = [
    { id: 'an1', building: 'BN-RAM-00142', by: 'c_masyoun', date: '2026-11-23', pinned: true, title: T('Water cut Thursday 09:00–13:00', 'انقطاع المياه الخميس 09:00–13:00'), body: T('The municipal network will be off for valve works on Al-Masyoun St. Rooftop tanks will cover normal use — please avoid laundry during this window.', 'سيتم قطع الشبكة البلدية لأعمال صمامات في شارع الماصيون. ستغطي خزانات السطح الاستخدام العادي — يرجى تجنب الغسيل خلال هذه الفترة.'), tag: 'notice' },
    { id: 'an2', building: 'BN-RAM-00142', by: 'c_masyoun', date: '2026-11-18', title: T('General assembly — 4 December, 19:00', 'الهيئة العامة — 4 كانون الأول، 19:00'), body: T('Agenda: 2027 budget, elevator modernisation quote, solar panels on the roof. Lobby meeting room.', 'جدول الأعمال: موازنة 2027، عرض تحديث المصعد، ألواح شمسية على السطح. قاعة الاجتماعات في الردهة.'), tag: 'meeting' },
    { id: 'an3', building: 'BN-RAM-00142', by: 'org_arkan', date: '2026-11-09', title: T('Winter generator test', 'اختبار المولد الشتوي'), body: T('The backup generator will be tested on Saturday at 10:00 for about 15 minutes.', 'سيتم اختبار المولد الاحتياطي يوم السبت الساعة 10:00 لمدة 15 دقيقة تقريباً.'), tag: 'maintenance' },
    { id: 'an4', building: 'BN-RAM-00142', by: 'c_masyoun', date: '2026-10-30', title: T('New recycling bins in the parking level', 'حاويات إعادة تدوير جديدة في موقف السيارات'), body: T('Blue for paper and cardboard, yellow for plastic and cans.', 'الأزرق للورق والكرتون، والأصفر للبلاستيك والعلب.'), tag: 'community' },
    { id: 'an5', building: 'BN-RAM-00087', by: 'c_tireh', date: '2026-11-15', title: T('Pest treatment in the entrance', 'معالجة الحشرات في المدخل'), body: T('Scheduled for next week; quote received.', 'مجدولة الأسبوع القادم؛ تم استلام العرض.'), tag: 'maintenance' },
  ];
  D.announcementsOf = (bid) => D.announcements.filter((a) => a.building === bid);

  /* ---------------- building assets & utilities (key buildings) ---------------- */
  D.assets = [
    { id: 'AS-142-EL1', building: 'BN-RAM-00142', name: T('Elevator A (passenger, 8 persons)', 'المصعد أ (ركاب، 8 أشخاص)'), cat: 'elevator', loc: T('Core, all floors', 'النواة، جميع الطوابق'), cond: 'good', status: 'ok', last: '2026-09-14', next: '2026-12-14' },
    { id: 'AS-142-EL2', building: 'BN-RAM-00142', name: T('Elevator B (passenger, 8 persons)', 'المصعد ب (ركاب، 8 أشخاص)'), cat: 'elevator', loc: T('Core, all floors', 'النواة، جميع الطوابق'), cond: 'fair', status: 'fault', last: '2026-09-14', next: '2026-11-25' },
    { id: 'AS-142-GEN', building: 'BN-RAM-00142', name: T('Backup generator 250 kVA', 'مولد احتياطي 250 ك.ف.أ'), cat: 'generator', loc: T('Parking level −1', 'الطابق تحت الأرضي −1'), cond: 'good', status: 'ok', last: '2026-11-14', next: '2027-02-14' },
    { id: 'AS-142-PMP', building: 'BN-RAM-00142', name: T('Water booster pumps (duty/standby)', 'مضخات تعزيز المياه (عاملة/احتياط)'), cat: 'pump', loc: T('Roof plant room', 'غرفة المعدات على السطح'), cond: 'good', status: 'ok', last: '2026-10-02', next: '2027-01-02' },
    { id: 'AS-142-TNK', building: 'BN-RAM-00142', name: T('Rooftop water tanks ×6 (2 m³)', 'خزانات مياه على السطح ×6 (2 م³)'), cat: 'tank', loc: T('Roof', 'السطح'), cond: 'fair', status: 'due', last: '2026-08-30', next: '2026-12-03' },
    { id: 'AS-142-FIR', building: 'BN-RAM-00142', name: T('Fire alarm panel & extinguishers', 'لوحة إنذار الحريق والطفايات'), cat: 'fire', loc: T('Lobby + every floor', 'الردهة + كل طابق'), cond: 'good', status: 'ok', last: '2026-07-20', next: '2027-01-20' },
    { id: 'AS-142-ACC', building: 'BN-RAM-00142', name: T('Lobby access control & intercom', 'نظام الدخول والاتصال الداخلي'), cat: 'access', loc: T('Main entrance', 'المدخل الرئيسي'), cond: 'excellent', status: 'ok', last: '2026-06-11', next: '2026-12-11' },
  ];
  D.assetsOf = (bid) => D.assets.filter((a) => a.building === bid);
  D.utilities = {
    'BN-RAM-00142': [
      { kind: 'electricity', name: T('Common-area electricity', 'كهرباء المناطق المشتركة'), acct: 'EL-3381-0142', last: 2860, trend: [2410, 2380, 2510, 2650, 2790, 2860], status: 'paid' },
      { kind: 'water', name: T('Municipal water (bulk meter)', 'مياه البلدية (العداد الرئيسي)'), acct: 'WT-RM-77120', last: 1940, trend: [1620, 1710, 2050, 2240, 2010, 1940], status: 'due' },
      { kind: 'internet', name: T('Building fibre backbone', 'شبكة الألياف للمبنى'), acct: 'FB-00142', last: 450, trend: [450, 450, 450, 450, 450, 450], status: 'paid' },
      { kind: 'waste', name: T('Municipal waste collection', 'جمع النفايات البلدية'), acct: 'MW-RM-0142', last: 620, trend: [620, 620, 620, 620, 620, 620], status: 'paid' },
    ],
  };

  /* ---------------- resident persona: payments ---------------- */
  D.residentPayments = [
    { id: 'RC-26-1101', date: '2026-11-01', kind: 'rent', label: T('Rent — November 2026', 'الإيجار — تشرين الثاني 2026'), amount: 3200, status: 'paid', method: T('Bank transfer', 'تحويل بنكي') },
    { id: 'SC-26-1101', date: '2026-11-05', kind: 'charge', label: T('Building service charge — November', 'رسوم خدمات المبنى — تشرين الثاني'), amount: 180, status: 'due', method: null },
    { id: 'RC-26-1001', date: '2026-10-01', kind: 'rent', label: T('Rent — October 2026', 'الإيجار — تشرين الأول 2026'), amount: 3200, status: 'paid', method: T('Bank transfer', 'تحويل بنكي') },
    { id: 'SC-26-1001', date: '2026-10-04', kind: 'charge', label: T('Building service charge — October', 'رسوم خدمات المبنى — تشرين الأول'), amount: 180, status: 'paid', method: T('Card', 'بطاقة') },
    { id: 'RC-26-0901', date: '2026-09-01', kind: 'rent', label: T('Rent — September 2026', 'الإيجار — أيلول 2026'), amount: 3200, status: 'paid', method: T('Bank transfer', 'تحويل بنكي') },
    { id: 'SC-26-0901', date: '2026-09-03', kind: 'charge', label: T('Building service charge — September', 'رسوم خدمات المبنى — أيلول'), amount: 180, status: 'paid', method: T('Card', 'بطاقة') },
    { id: 'XP-26-0820', date: '2026-08-20', kind: 'special', label: T('Special levy — lobby renovation (share)', 'مساهمة خاصة — ترميم الردهة (الحصة)'), amount: 240, status: 'paid', method: T('Card', 'بطاقة') },
    { id: 'RC-26-0801', date: '2026-08-01', kind: 'rent', label: T('Rent — August 2026', 'الإيجار — آب 2026'), amount: 3200, status: 'paid', method: T('Bank transfer', 'تحويل بنكي') },
  ];

  /* ---------------- municipal city-wide figures (sample) ---------------- */
  D.city = {
    total: B.sum(D.districts, (d) => d.buildings),
    gis: B.sum(D.districts, (d) => d.gis),
    units: B.sum(D.districts, (d) => d.units),
    pending: 318,
    trend: [212, 238, 251, 230, 274, 296, 318, 305, 342, 366, 391, 412],          // monthly new registrations Dec→Nov
    trendIndependent: [41, 46, 52, 48, 57, 61, 66, 63, 70, 74, 82, 88],
  };
  D.city.independent = D.city.total - D.city.gis;
})();
