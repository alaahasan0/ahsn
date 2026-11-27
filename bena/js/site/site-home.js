/*
 * BENA public website — home page (#site).
 * Hero with the isometric identity tower + floating ID card, intro statement,
 * the two pillars, a map band with anchored ID chips, the "how it connects"
 * sequence, segments index, sample-figure stats and the CTA band.
 */
(function () {
  'use strict';
  const B = window.B;
  const S = B.site;
  const { L, tx, esc, icon } = B;

  const BID = 'BN-RAM-00142';

  /* ---------------- hero ---------------- */
  // Hero visual coordinate system: 600 × 660 (the container keeps this aspect ratio).
  const VW = 600, VH = 660, TWp = 376, TOP = 124, TX = -18;
  const towerToV = (p) => { const b = S.towerBox; const th = TWp * (b.h / b.w); return [TX + ((p[0] - b.x) / b.w) * TWp, TOP + ((p[1] - b.y) / b.h) * th]; };

  const heroVisual = () => {
    const ar = B.isAr();
    const mx = (x) => (ar ? VW - x : x);
    const b = S.towerBox;
    const th = TWp * (b.h / b.w);
    const u = towerToV(S.towerPt(8, 3));
    const roof = towerToV([114.3, -207]);
    const g = towerToV(S.towerPt(0, 2));
    const line = (pts) => pts.map((p) => `${mx(p[0]).toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    const unit = B.data.unit(`${BID}-803`);
    return `
      <div class="ws-hv" data-px="-0.05">
        <svg class="ws-hv-svg" viewBox="0 0 ${VW} ${VH}" aria-hidden="true">
          <defs><radialGradient id="ws-hv-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#36D6A0" stop-opacity=".22"/><stop offset="1" stop-color="#36D6A0" stop-opacity="0"/></radialGradient></defs>
          <ellipse cx="${mx(TWp * 0.48)}" cy="${TOP + th * 0.62}" rx="260" ry="200" fill="url(#ws-hv-glow)"/>
          <svg x="${ar ? VW - TWp - TX : TX}" y="${TOP}" width="${TWp}" height="${th.toFixed(1)}" viewBox="${b.x} ${b.y} ${b.w} ${b.h}" overflow="visible">${S.tower({ theme: 'night', idp: 'hero', lit: ['8-3'], marks: [{ f: 8, k: 3 }], scan: true, trace: true }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg>
          <polyline class="ws-hv-lead" points="${line([roof, [roof[0] + 22, roof[1] - 40], [300, roof[1] - 40]])}" fill="none" stroke="#36D6A0" stroke-width="1.2" stroke-dasharray="3 4"/>
          <circle cx="${mx(roof[0])}" cy="${roof[1]}" r="3.2" fill="#36D6A0"/>
          <polyline class="ws-hv-lead" points="${line([u, [u[0] + 36, u[1]], [u[0] + 104, u[1] + 68], [340, u[1] + 68]])}" fill="none" stroke="#36D6A0" stroke-width="1.2"/>
          <polyline class="ws-hv-lead" points="${line([g, [g[0] + 36, g[1] + 36], [300, g[1] + 36]])}" fill="none" stroke="#36D6A0" stroke-opacity=".6" stroke-width="1" stroke-dasharray="2 3"/>
        </svg>
        <div class="ws-hv-phone" aria-hidden="true">${S.tower({ theme: 'night', idp: 'herom', lit: ['8-3'], marks: [{ f: 8, k: 3 }], trace: true })}</div>
        <div class="ws-idcard">
          <div class="ws-idc-top">${B.logo(26)}<span class="ws-idc-k">${L('BENA ID', 'معرّف BENA')}</span>${S.sampleTag(L('Sample', 'نموذج'))}</div>
          <div class="ws-idc-id">${S.id(BID)}</div>
          <div class="ws-idc-name">${L('Al-Masyoun Residence Tower', 'برج الماصيون السكني')}</div>
          <div class="ws-idc-addr">${L('14 Al-Masyoun St. · Ramallah (sample)', '14 شارع الماصيون · رام الله (نموذج)')}</div>
          <dl class="ws-idc-rows">
            <div><dt>${L('Municipal ref.', 'المرجع البلدي')}</dt><dd>${S.id('RM-GIS-48217')}<span class="ws-idc-note">${L('sample · designed to connect', 'نموذج · مصمَّم للربط')}</span></dd></div>
            <div><dt>${L('Parcel', 'القطعة')}</dt><dd>${L('Basin 12 · Parcel 87', 'حوض 12 · قطعة 87')}</dd></div>
          </dl>
          <div class="ws-idc-foot"><span class="ws-idc-qr">${B.art.qr(142)}</span><span>${L('A digital reference identity — not proof of ownership.', 'هوية مرجعية رقمية — وليست إثباتاً للملكية.')}</span></div>
        </div>
        <div class="ws-chip ws-chip-unit" style="top:${((u[1] + 68 - 22) / VH * 100).toFixed(2)}%">
          <span class="ws-chip-dot"></span><b>${L('Unit 803', 'الوحدة 803')}</b><span>${B.ui.statusLabel(unit ? unit.status : 'rented')} · ${unit ? unit.area : 146} ${L('m²', 'م²')}</span>
        </div>
        <div class="ws-chip ws-chip-req" style="top:${((g[1] + 36 - 22) / VH * 100).toFixed(2)}%">
          ${icon('wrench')}<b>${S.id('MR-24518')}</b><span>${L('Leak repair · in progress', 'إصلاح تسريب · قيد التنفيذ')}</span>
        </div>
      </div>`;
  };

  const ticker = () => {
    const items = B.data.keyBuildings.map((b) => `<span class="ws-tk-item">${S.id(b.id)}<span>${tx(b.name)}</span><i class="${b.verification === 'verified' ? 'ok' : 'pend'}"></i></span>`).join('');
    return `<div class="ws-ticker" aria-label="${esc(L('Sample building identities', 'هويات مبانٍ نموذجية'))}">
      <span class="ws-tk-label">${L('Sample identities', 'هويات نموذجية')}</span>
      <div class="ws-tk-mask"><div class="ws-tk-track">${items}${items}</div></div>
    </div>`;
  };

  const hero = () => `
    <section class="ws-hero">
      <div class="ws-hero-sky" data-px="0.22" aria-hidden="true">${B.art.skyline()}</div>
      <div class="ws-hero-grid" aria-hidden="true"></div>
      <div class="ws-wrap ws-hero-in">
        <div class="ws-hero-text">
          <div class="ws-kicker"><span class="ws-kicker-dot"></span>${L('Building identity infrastructure', 'بنية تحتية لهوية المباني')}<span class="ws-kicker-sep"></span><span class="ws-kicker-muted">${L('Concept prototype', 'نموذج مفاهيمي')}</span></div>
          <h1 class="ws-display ws-hero-h">${L('Every Building <br class="ws-br">Has an <span class="ws-mint">Identity.</span>', 'لكل مبنى <span class="ws-mint">هوية.</span>')}</h1>
          <p class="ws-hero-sub">${L('BENA connects buildings, people, and services through one intelligent digital ecosystem.', 'تربط BENA المباني والناس والخدمات عبر منظومة رقمية ذكية واحدة.')}</p>
          <div class="ws-hero-ctas">
            ${S.btn(L('Explore BENA', 'اكتشف BENA'), { act: 'wsScroll', arg: 'ws-intro', size: 'lg', end: 'arrowDown' })}
            ${S.btn(L('Request a Demo', 'اطلب عرضاً توضيحياً'), { go: 'site-contact', kind: 'line-dark', size: 'lg' })}
          </div>
          <div class="ws-hero-facts">
            <div><b>1</b><span>${L('persistent identity per building', 'هوية دائمة لكل مبنى')}</span></div>
            <div><b>8</b><span>${L('participant groups, one shared record', 'فئات مشاركة حول سجل واحد')}</span></div>
            <div><b>4</b><span>${L('provenance levels on every field', 'مستويات لمصدر كل معلومة')}</span></div>
          </div>
        </div>
        ${heroVisual()}
      </div>
      ${ticker()}
    </section>`;

  /* ---------------- intro ---------------- */
  const intro = () => `
    <section class="ws-sec ws-intro" id="ws-intro">
      <div class="ws-wrap">
        ${S.eyebrow(L('Why BENA', 'لماذا BENA'))}
        <p class="ws-statement" data-rv>${L(
          'Buildings shape every part of daily life. <span>Yet digitally, most of them barely exist — their information scattered across paper files, phone calls and spreadsheets.</span> BENA gives every building a persistent digital identity, then connects the people, units and services around it.',
          'تشكّل المباني كل تفاصيل حياتنا اليومية. <span>ومع ذلك، يكاد معظمها لا يوجد رقمياً — فمعلوماتها موزّعة بين الملفات الورقية والمكالمات والجداول.</span> تمنح BENA كل مبنى هوية رقمية دائمة، ثم تربط به الناس والوحدات والخدمات من حوله.')}</p>
        <div class="ws-intro-cols">
          ${[
            ['01', L('One identity', 'هوية واحدة'), L('A single, persistent reference for the building, its floors and its units — the anchor everything else attaches to.', 'مرجع واحد ودائم للمبنى وطوابقه ووحداته — المرتكز الذي ترتبط به كل المعلومات الأخرى.')],
            ['02', L('Every stakeholder', 'كل الأطراف'), L('Owners, residents, committees, managers, facility teams and providers see the same building — each through their own role.', 'يرى المالكون والسكان واللجان والمديرون وفرق المرافق والمزوّدون المبنى ذاته — كلٌّ من خلال دوره.')],
            ['03', L('Visible provenance', 'مصدر واضح للمعلومة'), L('Every field shows where it came from: a sample official source, a user submission, pending verification, or demo data.', 'تُظهر كل معلومة مصدرها: مصدر رسمي نموذجي، أو إدخال مستخدم، أو بانتظار التحقق، أو بيانات عرض.')],
          ].map(([n, t, d], i) => `<div class="ws-intro-col" data-rv style="--d:${i * 0.08}s"><span class="ws-num">${n}</span><h3 class="ws-h3">${t}</h3><p>${d}</p></div>`).join('')}
        </div>
      </div>
    </section>`;

  /* ---------------- pillars ---------------- */
  const anatomy = () => `
    <div class="ws-anat" aria-hidden="true">
      <div class="ws-anat-id"><span class="a1">BN</span><span class="sep">-</span><span class="a2">RAM</span><span class="sep">-</span><span class="a3">00142</span></div>
      <div class="ws-anat-keys">
        <div><i class="a1"></i><b>BN</b><span>${L('BENA identity namespace', 'نطاق هويات BENA')}</span></div>
        <div><i class="a2"></i><b>RAM</b><span>${L('Locality code (sample)', 'رمز المنطقة (نموذج)')}</span></div>
        <div><i class="a3"></i><b>00142</b><span>${L('Building sequence', 'الرقم التسلسلي للمبنى')}</span></div>
      </div>
      <div class="ws-anat-tree">
        <span>${L('Building', 'المبنى')}</span>${icon('chevR', 'flip')}<span>${L('Floor 8', 'الطابق 8')}</span>${icon('chevR', 'flip')}<span class="on">${S.id('BN-RAM-00142-803')}</span>
      </div>
    </div>`;

  const miniNet = () => {
    const ar = B.isAr();
    const nodes = [[200, 120, 'b'], [70, 50], [330, 46], [372, 150], [318, 236], [86, 224], [34, 134], [200, 260]];
    const mx = (x) => (ar ? 400 - x : x);
    let s = `<svg viewBox="0 0 400 290" class="ws-mininet" aria-hidden="true">`;
    nodes.slice(1).forEach((n, i) => { s += `<line x1="${mx(200)}" y1="120" x2="${mx(n[0])}" y2="${n[1]}" stroke="#36D6A0" stroke-opacity="${0.25 + (i % 3) * 0.12}" stroke-width="1"/>`; });
    [[1, 2], [3, 4], [5, 6], [2, 3], [4, 7], [6, 1]].forEach(([a, b2]) => { s += `<line x1="${mx(nodes[a][0])}" y1="${nodes[a][1]}" x2="${mx(nodes[b2][0])}" y2="${nodes[b2][1]}" stroke="#7FA7C2" stroke-opacity=".25" stroke-dasharray="3 4"/>`; });
    nodes.slice(1).forEach((n) => { s += `<circle cx="${mx(n[0])}" cy="${n[1]}" r="9" fill="#0F2433" stroke="#36D6A0" stroke-width="1.4"/><circle cx="${mx(n[0])}" cy="${n[1]}" r="3" fill="#36D6A0"/>`; });
    s += `<rect x="${mx(200) - 26}" y="94" width="52" height="52" rx="14" fill="#36D6A0"/><g transform="translate(${mx(200) - 12} 108)" stroke="#0F2433" stroke-width="2" fill="none"><rect x="2" y="2" width="20" height="22" rx="2"/><path d="M7 8h3M14 8h3M7 13h3M14 13h3M10 24v-5h4v5"/></g>`;
    if (!S.reduced()) s += `<circle r="3.2" fill="#fff"><animateMotion dur="3.2s" repeatCount="indefinite" path="M${mx(70)} 50 L${mx(200)} 120 L${mx(318)} 236"/></circle>`;
    return s + '</svg>';
  };

  const pillars = () => `
    <section class="ws-sec tight ws-pillars" id="ws-pillars">
      <div class="ws-wrap">
        <div class="ws-sec-head">
          <div>${S.eyebrow(L('Two pillars', 'ركيزتان'))}<h2 class="ws-h2" data-rv>${L('An identity layer for buildings, and the services that grow on it.', 'طبقة هوية للمباني، والخدمات التي تنمو فوقها.')}</h2></div>
          <p class="ws-lead" data-rv style="--d:.08s">${L('BENA is built in two layers. The first makes a building legible. The second makes it work — for everyone connected to it.', 'تُبنى BENA على طبقتين: الأولى تجعل المبنى مقروءاً رقمياً، والثانية تجعله يعمل — لكل من يرتبط به.')}</p>
        </div>
        <div class="ws-pillar-grid">
          <article class="ws-pillar light" data-rv>
            <div class="ws-pillar-k"><span class="ws-num">01</span>${L('Pillar', 'الركيزة')}</div>
            <h3 class="ws-h3">${L('Building Identity Infrastructure', 'بنية تحتية لهوية المباني')}</h3>
            <p>${L('A persistent, structured identity for every building — footprint and parcel, floors and units, documents and roles — with the source of every field made visible.', 'هوية دائمة ومنظّمة لكل مبنى — المسقط والقطعة، الطوابق والوحدات، المستندات والأدوار — مع إظهار مصدر كل معلومة.')}</p>
            ${anatomy()}
            <ul class="ws-ticks">
              <li>${icon('check')}${L('Unique BENA ID for buildings and units', 'معرّف BENA فريد للمباني والوحدات')}</li>
              <li>${icon('check')}${L('Matched to sample municipal references — designed to connect', 'مطابقة مع مراجع بلدية نموذجية — مصمَّمة للربط')}</li>
              <li>${icon('check')}${L('Provenance and verification status on every record', 'المصدر وحالة التحقق لكل سجل')}</li>
            </ul>
            ${S.more(L('Explore a building identity', 'استكشف هوية مبنى'), 'site-identity')}
          </article>
          <article class="ws-pillar dark ws-on-dark" data-rv style="--d:.1s">
            <div class="ws-pillar-k"><span class="ws-num">02</span>${L('Pillar', 'الركيزة')}</div>
            <h3 class="ws-h3">${L('Connected Building Services Ecosystem', 'منظومة خدمات المباني المتصلة')}</h3>
            <p>${L('Owners, residents, committees, managers, facility teams and service providers work around the same identity — requests, approvals, contracts and payments in one continuous flow.', 'يعمل المالكون والسكان واللجان والمديرون وفرق المرافق ومزوّدو الخدمات حول الهوية ذاتها — طلبات وموافقات وعقود ودفعات في مسار واحد متصل.')}</p>
            <div class="ws-pillar-net">${miniNet()}</div>
            <ul class="ws-ticks">
              <li>${icon('check')}${L('Role-based workspaces on web and mobile', 'مساحات عمل حسب الدور على الويب والهاتف')}</li>
              <li>${icon('check')}${L('Maintenance, leases, votes and contributions', 'الصيانة والعقود والتصويت والمساهمات')}</li>
              <li>${icon('check')}${L('A services marketplace tied to real building context', 'سوق خدمات مرتبط بسياق المبنى الفعلي')}</li>
            </ul>
            ${S.more(L('See how the ecosystem connects', 'شاهد كيف تترابط المنظومة'), 'site-ecosystem')}
          </article>
        </div>
      </div>
    </section>`;

  /* ---------------- map band ---------------- */
  const MAP_ID = 'ws-hmap';
  const mapChips = [
    { id: BID, main: true },
    { id: 'BN-RAM-00266' },
    { id: 'BN-RAM-00203' },
    { id: 'BN-RAM-00087' },
  ];
  const mapBand = () => {
    const b = B.data.building(BID);
    const c = B.map.centroid(b.poly);
    const phone = window.innerWidth < 900;
    const w = phone ? 420 : 860, h = w * 0.7;
    const fx = phone ? 0.5 : B.isAr() ? 0.34 : 0.66;
    B.map.setView(MAP_ID, { x: c[0] - w * fx, y: c[1] - h * 0.5, w, h });
    const map = B.map.render({ id: MAP_ID, mode: 'type', layers: { parcels: true }, selected: BID, static: true, legend: false, badge: false, height: phone ? '440px' : '640px' });
    const chips = mapChips.map((m) => {
      const bd = B.data.building(m.id);
      if (!bd) return '';
      return `<div class="ws-mchip ${m.main ? 'is-main' : ''}" data-bid="${m.id}" hidden>${m.main
        ? `<div class="ws-mchip-top">${S.id(m.id)}${B.ui.prov('official')}</div><b>${tx(bd.name)}</b><span>${L('Basin 12 · Parcel 87 · RM-GIS-48217 (sample)', 'حوض 12 · قطعة 87 · RM-GIS-48217 (نموذج)')}</span>`
        : `${S.id(m.id)}<span>${tx(bd.name)}</span>`}</div>`;
    }).join('');
    return `
      <section class="ws-mapband" id="ws-map">
        <div class="ws-mapband-map">${map}<div class="ws-mchips">${chips}</div><div class="ws-map-fade" aria-hidden="true"></div></div>
        <div class="ws-wrap ws-mapband-in">
          <div class="ws-mapcard" data-rv>
            ${S.eyebrow(L('Anchored to place', 'مرتبطة بالمكان'))}
            <h2 class="ws-h2">${L('Every identity sits on the map.', 'كل هوية لها مكانها على الخريطة.')}</h2>
            <p class="ws-body">${L('Each BENA ID is tied to a footprint and a parcel. In this prototype, records are matched to sample municipal references; the platform is designed to connect with official GIS when authorised.', 'ترتبط كل هوية BENA بمسقط وقطعة أرض. في هذا النموذج تُطابق السجلات مع مراجع بلدية نموذجية؛ والمنصة مصمَّمة للربط مع نظم المعلومات الجغرافية الرسمية عند التفويض.')}</p>
            <div class="ws-mapcard-prov">${B.ui.prov('official')}${B.ui.prov('submitted')}${B.ui.prov('pending')}${B.ui.prov('demo')}</div>
            <div class="ws-mapcard-foot">${S.more(L('Open the building identity', 'افتح هوية المبنى'), 'site-identity')}<span class="ws-map-note">${L('Simulated map · sample area', 'خريطة محاكاة · منطقة نموذجية')}</span></div>
          </div>
        </div>
      </section>`;
  };
  const placeChips = () => {
    const shell = document.querySelector(`.ws-mapband .map-shell[data-map="${MAP_ID}"]`);
    if (!shell) return;
    const svg = shell.querySelector('svg');
    const host = shell.parentElement;
    const hr = host.getBoundingClientRect();
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const narrow = hr.width < 700;
    host.querySelectorAll('.ws-mchip').forEach((el) => {
      const bd = B.data.building(el.dataset.bid);
      if (!bd) return;
      const c = B.map.centroid(bd.poly);
      const pt = svg.createSVGPoint(); pt.x = c[0]; pt.y = c[1];
      const p = pt.matrixTransform(ctm);
      const x = p.x - hr.left, y = p.y - hr.top;
      const main = el.classList.contains('is-main');
      const inside = x > 40 && x < hr.width - 40 && y > 60 && y < hr.height - 30;
      el.hidden = !inside || (narrow && !main);
      el.style.left = x + 'px';
      el.style.top = y + 'px';
    });
  };
  S.binders.push((r) => {
    if (r.page !== 'home') return;
    placeChips();
    S.onResize.push(placeChips);
  });

  /* ---------------- how it connects ---------------- */
  const steps = () => [
    { t: L('Identify', 'التعريف'), d: L('A BENA ID is issued for the building and each of its units.', 'يُصدر معرّف BENA للمبنى ولكل وحدة من وحداته.'), a: S.id('BN-RAM-00142') },
    { t: L('Reference', 'الإسناد'), d: L('The identity is matched to a sample municipal reference and parcel — designed to connect.', 'تُطابق الهوية مع مرجع بلدي وقطعة نموذجيين — بتصميم قابل للربط.'), a: S.id('RM-GIS-48217') },
    { t: L('Structure', 'الهيكلة'), d: L('Floors, units, roles and documents are organised — each with visible provenance.', 'تُنظَّم الطوابق والوحدات والأدوار والمستندات — مع إظهار مصدر كل منها.'), a: `<span>${L('14 floors · 54 units', '14 طابقاً · 54 وحدة')}</span>` },
    { t: L('Operate', 'التشغيل'), d: L('Owners, managers and committees run leases, requests, votes and contributions.', 'يدير المالكون والمديرون واللجان العقود والطلبات والتصويت والمساهمات.'), a: S.id('MR-24518') },
    { t: L('Serve', 'الخدمة'), d: L('Qualified providers quote, schedule and complete work — with history kept on the identity.', 'يقدّم المزوّدون المؤهلون عروض الأسعار وينفّذون العمل — ويبقى السجل محفوظاً على الهوية.'), a: `<span>${L('Quote · ₪1,850', 'عرض سعر · 1,850 ₪')}</span>` },
  ];
  const howItConnects = () => `
    <section class="ws-sec ws-dark ws-how">
      <div class="ws-wrap">
        <div class="ws-sec-head">
          <div>${S.eyebrow(L('How it connects', 'كيف تترابط', ''), 'on-dark')}<h2 class="ws-h2" data-rv>${L('From a single identity to a living building.', 'من هوية واحدة إلى مبنى نابض بالحياة.')}</h2></div>
          <p class="ws-lead" data-rv style="--d:.08s">${L('Five steps turn a building into a shared, trusted record that people can act on.', 'خمس خطوات تحوّل المبنى إلى سجل مشترك وموثوق يمكن للناس العمل عليه.')}</p>
        </div>
        <ol class="ws-steps">
          ${steps().map((s, i) => `<li class="ws-step" data-rv style="--d:${i * 0.08}s"><div class="ws-step-node"><span>${String(i + 1).padStart(2, '0')}</span></div><h3>${s.t}</h3><p>${s.d}</p><div class="ws-step-art">${s.a}</div></li>`).join('')}
        </ol>
      </div>
    </section>`;

  /* ---------------- segments index ---------------- */
  const segments = () => `
    <section class="ws-sec ws-segs">
      <div class="ws-wrap">
        <div class="ws-sec-head">
          <div>${S.eyebrow(L('Solutions', 'الحلول'))}<h2 class="ws-h2" data-rv>${L('Built for everyone around a building.', 'مصمَّمة لكل من يحيط بالمبنى.')}</h2></div>
          <p class="ws-lead" data-rv style="--d:.08s">${L('Seven groups, one shared identity. Each gets a workspace shaped around what they actually do.', 'سبع فئات وهوية واحدة مشتركة. لكل فئة مساحة عمل مصمَّمة حول ما تقوم به فعلاً.')}</p>
        </div>
        <div class="ws-seglist">
          ${S.segments.map((sg, i) => `<a class="ws-segrow" href="#site-solutions-${sg.id}" data-go="site-solutions-${sg.id}" data-rv style="--d:${(i % 4) * 0.05}s">
            <span class="ws-segrow-n">${String(i + 1).padStart(2, '0')}</span>
            <span class="ws-segrow-name">${tx(sg.name)}</span>
            <span class="ws-segrow-line">${tx(sg.line)}</span>
            <span class="ws-segrow-go">${icon('arrowRight', 'flip')}</span>
          </a>`).join('')}
        </div>
      </div>
    </section>`;

  /* ---------------- stats ---------------- */
  const stats = () => {
    const D = B.data;
    const blds = B.sum(D.districts, (d) => d.buildings);
    const units = B.sum(D.districts, (d) => d.units);
    const gis = B.sum(D.districts, (d) => d.gis);
    const items = [
      [B.num(blds), L('buildings in the sample area', 'مبنى في المنطقة النموذجية')],
      [B.num(units), L('units modelled across them', 'وحدة ممثّلة ضمنها')],
      [Math.round((gis / blds) * 100) + '%', L('matched to sample municipal references', 'مطابقة مع مراجع بلدية نموذجية')],
      [String(D.districts.length), L('sample districts on the map', 'أحياء نموذجية على الخريطة')],
    ];
    return `
      <section class="ws-sec tight alt ws-stats">
        <div class="ws-wrap">
          <div class="ws-stats-head">${S.eyebrow(L('The prototype in figures', 'النموذج بالأرقام'))}<span class="ws-sample">${L('Prototype figures · fictional sample dataset', 'أرقام النموذج الأولي · بيانات نموذجية خيالية')}</span></div>
          <div class="ws-stats-grid">
            ${items.map(([v, l], i) => `<div class="ws-stat" data-rv style="--d:${i * 0.06}s"><b>${v}</b><span>${l}</span></div>`).join('')}
          </div>
          <p class="ws-stats-note">${L('These numbers describe the demonstration dataset only. They are not statistics about any real city or municipality.', 'تصف هذه الأرقام بيانات العرض فقط، وليست إحصاءات عن أي مدينة أو بلدية حقيقية.')}</p>
        </div>
      </section>`;
  };

  S.render.home = () => `${hero()}${intro()}${pillars()}${mapBand()}${howItConnects()}${segments()}${stats()}${S.ctaBand()}`;

  /* ---------------- styles ---------------- */
  B.css(`
  /* hero */
  .ws-hero { background: radial-gradient(1200px 700px at 78% 40%, #173A50 0%, rgba(23,58,80,0) 60%), linear-gradient(180deg, #0A1A25 0%, #0F2433 70%, #102838 100%); color: #fff; padding-top: clamp(112px, 12vw, 150px); overflow: hidden; }
  html[dir="rtl"] .ws-hero { background: radial-gradient(1200px 700px at 22% 40%, #173A50 0%, rgba(23,58,80,0) 60%), linear-gradient(180deg, #0A1A25 0%, #0F2433 70%, #102838 100%); }
  .ws-hero-sky { position: absolute; inset-inline: 0; bottom: 0; height: 62%; opacity: .2; -webkit-mask-image: linear-gradient(180deg, transparent, #000 40%); mask-image: linear-gradient(180deg, transparent, #000 40%); pointer-events: none; will-change: transform; }
  .ws-hero-sky svg { width: 100%; height: 100%; }
  .ws-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size: 72px 72px; -webkit-mask-image: radial-gradient(circle at 60% 40%, #000 0%, transparent 70%); mask-image: radial-gradient(circle at 60% 40%, #000 0%, transparent 70%); pointer-events: none; }
  .ws-hero-in { position: relative; display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); gap: clamp(24px, 4vw, 56px); align-items: center; padding-bottom: clamp(40px, 5vw, 64px); }
  .ws-kicker { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 10px; font-size: 13.5px; font-weight: 500; color: #CFE0E8; padding: 7px 14px 7px 12px; border: 1px solid rgba(255,255,255,.12); border-radius: 99px; background: rgba(255,255,255,.03); margin-bottom: 30px; }
  .ws-kicker-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--mint); box-shadow: 0 0 0 4px rgba(54,214,160,.18); }
  .ws-kicker-sep { width: 1px; height: 12px; background: rgba(255,255,255,.2); }
  .ws-kicker-muted { color: #8FA8B8; }
  .ws-hero-h { color: #fff; font-size: min(5.4vw, 88px); }
  .ws-hero-h .ws-mint { color: var(--mint); }
  .ws-hero-sub { font-size: clamp(18px, 1.6vw, 23px); line-height: 1.5; color: #B7C9D4; max-width: 30em; margin-top: 28px; }
  .ws-hero .ws-hero-ctas { margin-top: 40px; }
  .ws-hero-facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin-top: clamp(44px, 6vw, 72px); padding-top: 26px; border-top: 1px solid rgba(255,255,255,.1); max-width: 600px; }
  .ws-hero-facts b { display: block; font-family: var(--font-display); font-size: 30px; font-weight: 700; color: #fff; line-height: 1; }
  .ws-hero-facts span { display: block; font-size: 13.5px; line-height: 1.45; color: #8FA8B8; margin-top: 8px; }
  html[dir="rtl"] .ws-hero-facts span { font-size: 14px; }

  .ws-hv { position: relative; width: 100%; aspect-ratio: ${VW} / ${VH}; will-change: transform; }
  .ws-hv-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  .ws-hv-phone { display: none; }
  .ws-hv-lead { opacity: 0; animation: wsFadeIn .8s var(--ease) 1.8s forwards; }
  @keyframes wsFadeIn { to { opacity: 1; } }
  .ws-idcard { position: absolute; top: 2%; inset-inline-end: 0; width: min(52%, 304px); background: rgba(255,255,255,.97); color: var(--ink); border-radius: 18px; padding: 18px 18px 16px; box-shadow: 0 30px 70px -20px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.4) inset; animation: wsFloat 7s ease-in-out infinite; }
  .ws-idc-top { display: flex; align-items: center; gap: 8px; }
  .ws-idc-k { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--text-2); }
  html[dir="rtl"] .ws-idc-k { letter-spacing: 0; }
  .ws-idc-top .ws-sample { margin-inline-start: auto; }
  .ws-idc-id { font-size: 22px; font-weight: 700; margin-top: 12px; color: var(--navy); }
  .ws-idc-name { font-family: var(--font-display); font-weight: 700; font-size: 16px; margin-top: 4px; }
  .ws-idc-addr { font-size: 12.5px; color: var(--text-3); margin-top: 2px; }
  .ws-idc-rows { margin: 14px 0 0; padding: 0; border-top: 1px solid var(--line-2); }
  .ws-idc-rows > div { display: flex; justify-content: space-between; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--line-2); font-size: 12.5px; }
  .ws-idc-rows dt { color: var(--text-2); }
  .ws-idc-rows dd { margin: 0; text-align: end; font-weight: 600; color: var(--ink); display: flex; flex-direction: column; align-items: flex-end; }
  .ws-idc-note { font-size: 11px; font-weight: 500; color: var(--mint-ink); white-space: nowrap; }
  .ws-idc-foot { display: flex; align-items: center; gap: 12px; margin-top: 12px; font-size: 12px; line-height: 1.4; color: var(--text-2); }
  .ws-idc-qr { width: 46px; height: 46px; flex: none; padding: 4px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
  .ws-chip { position: absolute; inset-inline-end: 0; display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 99px; background: rgba(15,36,51,.82); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); border: 1px solid rgba(54,214,160,.35); color: #fff; font-size: 13px; white-space: nowrap; animation: wsFloat 8s ease-in-out infinite; }
  .ws-chip b { font-weight: 700; }
  .ws-chip span { color: #A9BCC9; }
  .ws-chip svg { width: 16px; height: 16px; color: var(--mint); }
  .ws-chip-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--mint); box-shadow: 0 0 0 4px rgba(54,214,160,.2); }
  .ws-chip-unit { inset-inline-end: 4%; animation-delay: -2s; }
  .ws-chip-req { inset-inline-end: 9%; animation-delay: -4s; border-color: rgba(255,255,255,.16); }
  @keyframes wsFloat { 0%, 100% { translate: 0 0; } 50% { translate: 0 -8px; } }

  .ws-ticker { position: relative; display: flex; align-items: center; gap: 24px; border-top: 1px solid rgba(255,255,255,.08); background: rgba(10,26,37,.55); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); height: 60px; padding-inline-start: var(--ws-gut); }
  .ws-tk-label { flex: none; font-size: 12px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--mint); }
  html[dir="rtl"] .ws-tk-label { letter-spacing: 0; font-size: 13px; }
  .ws-tk-mask { flex: 1; min-width: 0; overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }
  .ws-tk-track { display: flex; width: max-content; animation: wsTicker 60s linear infinite; }
  html[dir="rtl"] .ws-tk-track { animation-name: wsTickerRtl; }
  .ws-tk-item { display: inline-flex; align-items: center; gap: 10px; padding-inline-end: 44px; font-size: 13.5px; color: #8FA8B8; white-space: nowrap; }
  .ws-tk-item .ws-mono { color: #E3ECF1; font-size: 13px; }
  .ws-tk-item i { width: 6px; height: 6px; border-radius: 50%; background: var(--mint); }
  .ws-tk-item i.pend { background: #F4B860; }
  @keyframes wsTicker { to { transform: translateX(-50%); } }
  @keyframes wsTickerRtl { to { transform: translateX(50%); } }

  /* intro */
  .ws-statement { font-family: var(--font-display); font-size: clamp(28px, 3.5vw, 50px); line-height: 1.22; letter-spacing: -.025em; font-weight: 700; color: var(--ink); max-width: 25em; }
  .ws-statement span { color: #9AA9B5; }
  html[dir="rtl"] .ws-statement { letter-spacing: 0; line-height: 1.5; }
  .ws-intro-cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(24px, 4vw, 64px); margin-top: clamp(56px, 7vw, 96px); }
  .ws-intro-col { border-top: 1px solid var(--line); padding-top: 24px; }
  .ws-intro-col p { color: var(--text-2); margin-top: 10px; line-height: 1.65; }
  .ws-num { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--mint-ink); letter-spacing: .04em; display: block; margin-bottom: 14px; }

  /* pillars */
  .ws-pillars { padding-top: 0; }
  .ws-pillar-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
  .ws-pillar { border-radius: 28px; padding: clamp(28px, 3.6vw, 52px); display: flex; flex-direction: column; gap: 18px; overflow: hidden; }
  .ws-pillar.light { background: #F4F7F6; }
  .ws-pillar.dark { background: var(--ws-navy); color: #fff; }
  .ws-pillar.dark .ws-h3 { color: #fff; }
  .ws-pillar > p { color: var(--text-2); font-size: 16.5px; line-height: 1.65; max-width: 34em; }
  .ws-pillar.dark > p { color: #A9BCC9; }
  .ws-pillar .ws-h3 { font-size: clamp(26px, 2.5vw, 36px); font-weight: 800; }
  .ws-pillar-k { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: .12em; }
  html[dir="rtl"] .ws-pillar-k { letter-spacing: 0; }
  .ws-pillar-k .ws-num { margin: 0; }
  .ws-pillar.dark .ws-num { color: var(--mint); }
  .ws-ticks { list-style: none; margin: 4px 0 6px; padding: 0; display: grid; gap: 10px; }
  .ws-ticks li { display: flex; gap: 10px; align-items: flex-start; font-size: 15px; line-height: 1.5; }
  .ws-ticks svg { width: 18px; height: 18px; color: var(--mint-ink); flex: none; margin-top: 2px; }
  .ws-pillar.dark .ws-ticks svg { color: var(--mint); }
  .ws-pillar.dark .ws-ticks li { color: #DCE6EC; }
  .ws-pillar .ws-more { margin-top: auto; padding-top: 6px; }
  .ws-anat { background: #fff; border-radius: 18px; padding: 22px; border: 1px solid var(--line); margin: 6px 0; }
  .ws-anat-id { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: clamp(28px, 3.4vw, 44px); font-weight: 700; direction: ltr; display: flex; justify-content: center; gap: 4px; color: var(--navy); }
  .ws-anat-id .a1 { color: var(--navy); } .ws-anat-id .a2 { color: #2D63C8; } .ws-anat-id .a3 { color: var(--mint-ink); } .ws-anat-id .sep { color: #C3CED6; }
  .ws-anat-keys { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--line); }
  .ws-anat-keys div { display: grid; grid-template-columns: auto 1fr; column-gap: 7px; align-items: center; font-size: 12.5px; }
  .ws-anat-keys i { width: 8px; height: 8px; border-radius: 2px; }
  .ws-anat-keys i.a1 { background: var(--navy); } .ws-anat-keys i.a2 { background: #2D63C8; } .ws-anat-keys i.a3 { background: var(--mint-ink); }
  .ws-anat-keys b { font-family: ui-monospace, Menlo, monospace; font-size: 12.5px; }
  .ws-anat-keys span { grid-column: 1 / -1; color: var(--text-2); margin-top: 3px; line-height: 1.4; }
  .ws-anat-tree { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-top: 16px; font-size: 13px; color: var(--text-2); }
  .ws-anat-tree svg { width: 14px; height: 14px; color: var(--text-3); }
  .ws-anat-tree span { padding: 4px 10px; border-radius: 99px; background: var(--surface-2); border: 1px solid var(--line); }
  .ws-anat-tree span.on { background: var(--mint-50); border-color: var(--mint-100); color: var(--mint-ink); font-weight: 600; }
  .ws-pillar-net { border-radius: 18px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); padding: 10px; margin: 6px 0; }
  .ws-mininet { width: 100%; height: auto; max-height: 260px; }

  /* map band */
  .ws-mapband { background: #EDF2EF; min-height: 640px; display: flex; align-items: center; overflow: hidden; }
  .ws-mapband-map { position: absolute; inset: 0; }
  .ws-mapband .map-shell { border: 0; border-radius: 0; height: 100%; touch-action: auto; user-select: auto; }
  .ws-mapband .map-shell svg.map-svg { cursor: default; }
  .ws-map-fade { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, rgba(244,247,246,.92) 0%, rgba(244,247,246,.55) 32%, rgba(244,247,246,0) 55%); }
  html[dir="rtl"] .ws-map-fade { background: linear-gradient(270deg, rgba(244,247,246,.92) 0%, rgba(244,247,246,.55) 32%, rgba(244,247,246,0) 55%); }
  .ws-mapband-in { position: relative; z-index: 2; padding-block: 64px; pointer-events: none; }
  .ws-mapcard { pointer-events: auto; max-width: 500px; background: rgba(255,255,255,.94); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); border-radius: 26px; padding: clamp(28px, 3vw, 44px); box-shadow: 0 30px 80px -30px rgba(13,31,43,.35); border: 1px solid rgba(20,43,59,.06); }
  .ws-mapcard .ws-h2 { font-size: clamp(30px, 3.2vw, 46px); }
  .ws-mapcard .ws-body { margin-top: 18px; }
  .ws-mapcard-prov { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 22px; }
  .ws-mapcard-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 26px; padding-top: 20px; border-top: 1px solid var(--line-2); }
  .ws-map-note { font-size: 12.5px; color: var(--text-3); }
  .ws-mchips { position: absolute; inset: 0; pointer-events: none; }
  .ws-mchip { position: absolute; transform: translate(-50%, calc(-100% - 22px)); background: #fff; border-radius: 12px; padding: 8px 12px; box-shadow: 0 12px 30px -10px rgba(13,31,43,.35); font-size: 12.5px; white-space: nowrap; display: flex; flex-direction: column; gap: 2px; border: 1px solid rgba(20,43,59,.06); }
  .ws-mchip::after { content: ""; position: absolute; left: 50%; bottom: -6px; width: 12px; height: 12px; background: #fff; transform: translateX(-50%) rotate(45deg); border-radius: 2px; }
  .ws-mchip .ws-mono { font-size: 12px; font-weight: 700; color: var(--navy); }
  .ws-mchip span { color: var(--text-2); }
  .ws-mchip.is-main { padding: 14px 16px; border-radius: 16px; transform: translate(-50%, calc(-100% - 40px)); background: var(--ws-navy); color: #fff; border-color: rgba(54,214,160,.3); }
  .ws-mchip.is-main::after { background: var(--ws-navy); }
  .ws-mchip.is-main .ws-mono { color: var(--mint); font-size: 13px; }
  .ws-mchip.is-main b { font-family: var(--font-display); font-size: 15.5px; margin-top: 4px; }
  .ws-mchip.is-main span { color: #A9BCC9; }
  .ws-mchip-top { display: flex; align-items: center; gap: 10px; }
  .ws-mchip[hidden] { display: none; }

  /* how it connects */
  .ws-steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0; position: relative; }
  .ws-steps::before { content: ""; position: absolute; top: 27px; inset-inline: 28px 10%; height: 1px; background: linear-gradient(90deg, rgba(54,214,160,.7), rgba(54,214,160,.15)); }
  html[dir="rtl"] .ws-steps::before { background: linear-gradient(270deg, rgba(54,214,160,.7), rgba(54,214,160,.15)); }
  .ws-step { position: relative; padding-inline-end: 28px; }
  .ws-step-node { width: 56px; height: 56px; border-radius: 50%; background: var(--ws-navy); border: 1px solid rgba(54,214,160,.5); display: grid; place-items: center; position: relative; }
  .ws-step-node span { font-family: var(--font-display); font-weight: 700; font-size: 15px; color: var(--mint); }
  .ws-step h3 { font-family: var(--font-display); font-size: 22px; margin-top: 28px; color: #fff; }
  .ws-step p { color: #A9BCC9; font-size: 15px; line-height: 1.6; margin-top: 10px; }
  .ws-step-art { display: inline-flex; margin-top: 18px; padding: 7px 12px; border-radius: 10px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); font-size: 13px; color: #DCE6EC; }
  .ws-step-art .ws-mono { color: var(--mint); font-size: 12.5px; }

  /* segments index */
  .ws-seglist { border-top: 1px solid var(--line); }
  .ws-segrow { display: grid; grid-template-columns: 64px minmax(0, 1.1fr) minmax(0, 1fr) 56px; gap: 24px; align-items: center; padding: 28px 8px; border-bottom: 1px solid var(--line); transition: background .3s var(--ease), padding .3s var(--ease); }
  .ws-segrow:hover { background: #F4F7F6; padding-inline: 20px; }
  .ws-segrow-n { font-family: var(--font-display); font-weight: 700; font-size: 14px; color: var(--text-3); }
  .ws-segrow-name { font-family: var(--font-display); font-size: clamp(24px, 2.6vw, 36px); font-weight: 700; letter-spacing: -.02em; line-height: 1.15; color: var(--ink); }
  html[dir="rtl"] .ws-segrow-name { letter-spacing: 0; }
  .ws-segrow-line { color: var(--text-2); font-size: 16px; }
  .ws-segrow-go { width: 48px; height: 48px; border-radius: 50%; border: 1px solid var(--line); display: grid; place-items: center; justify-self: end; transition: background .3s, border-color .3s, color .3s; color: var(--navy); }
  .ws-segrow-go svg { width: 20px; height: 20px; }
  .ws-segrow:hover .ws-segrow-go { background: var(--mint); border-color: var(--mint); }

  /* stats */
  .ws-stats-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 40px; }
  .ws-stats-head .ws-eyebrow { margin: 0; }
  .ws-stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; border-top: 1px solid var(--line); }
  .ws-stat { padding: 32px 24px 8px 0; padding-inline: 0 24px; border-inline-end: 1px solid var(--line); }
  .ws-stat + .ws-stat { padding-inline-start: 28px; }
  .ws-stat:last-child { border-inline-end: 0; }
  .ws-stat b { display: block; font-family: var(--font-display); font-weight: 800; font-size: clamp(40px, 4.6vw, 68px); letter-spacing: -.035em; line-height: 1; color: var(--navy); font-variant-numeric: tabular-nums; }
  .ws-stat span { display: block; margin-top: 14px; color: var(--text-2); font-size: 15px; max-width: 16em; }
  .ws-stats-note { margin-top: 36px; font-size: 13.5px; color: var(--text-3); }

  /* responsive */
  @media (max-width: 1180px) {
    .ws-hero-in { grid-template-columns: minmax(0, 1fr); }
    .ws-hero-h { font-size: clamp(44px, 9vw, 84px); }
    .ws-hv { max-width: 600px; margin-inline: auto; margin-top: 12px; }
    .ws-steps { grid-template-columns: repeat(3, minmax(0, 1fr)); row-gap: 48px; }
    .ws-steps::before { display: none; }
  }
  @media (max-width: 960px) {
    .ws-pillar-grid { grid-template-columns: minmax(0, 1fr); }
    .ws-intro-cols { grid-template-columns: minmax(0, 1fr); gap: 0; }
    .ws-intro-col { padding: 24px 0; }
    .ws-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ws-stat:nth-child(2) { border-inline-end: 0; }
    .ws-stat:nth-child(3) { padding-inline-start: 0; }
    .ws-stat:nth-child(n+3) { border-top: 1px solid var(--line); }
    .ws-segrow { grid-template-columns: 44px minmax(0, 1fr) 48px; }
    .ws-segrow-line { grid-column: 2; grid-row: 2; margin-top: -14px; }
    .ws-segrow-go { grid-row: 1 / span 2; grid-column: 3; }
    .ws-mapband { flex-direction: column; align-items: stretch; min-height: 0; }
    .ws-mapband-map { position: relative; inset: auto; height: 440px; order: 2; }
    .ws-map-fade { background: linear-gradient(180deg, rgba(244,247,246,1) 0%, rgba(244,247,246,0) 22%) !important; }
    .ws-mapband-in { order: 1; padding-block: 64px 8px; }
    .ws-mapcard { max-width: none; box-shadow: none; background: transparent; padding: 0; border: 0; -webkit-backdrop-filter: none; backdrop-filter: none; }
  }
  @media (max-width: 640px) {
    .ws-br { display: none; }
    .ws-hero-facts { grid-template-columns: minmax(0, 1fr); gap: 14px; }
    .ws-hero-facts div { display: flex; align-items: baseline; gap: 14px; }
    .ws-hero-facts b { font-size: 24px; min-width: 22px; }
    .ws-hero-facts span { margin: 0; }
    .ws-hero .ws-hero-ctas .ws-btn { flex: 1 1 100%; }
    .ws-hv { aspect-ratio: auto; display: flex; flex-direction: column; align-items: center; }
    .ws-hv-svg { display: none; }
    .ws-hv-phone { display: block !important; width: 78%; max-width: 330px; margin-bottom: -18%; }
    .ws-hv-phone svg { width: 100%; height: auto; }
    .ws-hv-lead, .ws-chip { display: none; }
    .ws-hero-h { font-size: 10.6vw; }
    .ws-idcard { position: relative; top: auto !important; inset-inline-end: auto; width: 100%; animation: none; }
    .ws-steps { grid-template-columns: minmax(0, 1fr); row-gap: 36px; }
    .ws-step { display: grid; grid-template-columns: 56px minmax(0, 1fr); column-gap: 18px; padding: 0; }
    .ws-step-node { grid-row: 1 / span 3; }
    .ws-step h3 { margin-top: 12px; }
    .ws-step-art { justify-self: start; }
    .ws-anat-keys { grid-template-columns: minmax(0, 1fr); }
    .ws-segrow { padding: 22px 0; gap: 14px; grid-template-columns: 32px minmax(0, 1fr) 44px; }
    .ws-segrow:hover { padding-inline: 0; background: transparent; }
    .ws-segrow-go { width: 42px; height: 42px; }
    .ws-segrow-line { margin-top: -8px; font-size: 15px; }
    .ws-stat { padding-inline-end: 12px !important; }
    .ws-stat + .ws-stat { padding-inline-start: 16px; }
    .ws-stat:nth-child(3) { padding-inline-start: 0; }
    .ws-ticker { padding-inline-start: 16px; gap: 14px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ws-tk-track, .ws-idcard, .ws-chip { animation: none; }
    .ws-hv-lead { animation: none; opacity: 1; }
  }
  `);
})();
