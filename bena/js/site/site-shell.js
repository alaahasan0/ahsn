/*
 * BENA public website — shell (header, mega-menu, mobile menu, footer),
 * shared website primitives (ws- classes), the generated isometric tower
 * used across pages, and scroll behaviours (solid header, reveal, parallax).
 *
 * Pages register into B.site.render[page] = (id) => html  (site-home.js, site-pages.js).
 * Everything is a frontend-only prototype with fictional sample data.
 */
(function () {
  'use strict';
  const B = window.B;
  const { L, tx, esc, icon } = B;

  const S = (B.site = B.site || {});
  S.pages = ['home', 'vision', 'solutions', 'identity', 'ecosystem', 'contact', 'login'];
  S.render = S.render || {};
  /** Hero tone per page — drives the transparent header colour at the top of the page. */
  S.tone = { home: 'dark', vision: 'light', solutions: 'light', identity: 'light', ecosystem: 'dark', contact: 'light', login: 'solid' };
  S.reduced = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

  /* ------------------------------------------------------------------ */
  /* Shared content                                                      */
  /* ------------------------------------------------------------------ */
  S.segments = [
    { id: 'municipalities', icon: 'landmark', demo: 'municipality-home',
      name: { en: 'Municipalities', ar: 'البلديات' },
      line: { en: 'A living, verifiable picture of the built environment.', ar: 'صورة حيّة وقابلة للتحقق عن البيئة العمرانية.' } },
    { id: 'owners', icon: 'key', demo: 'owner-home',
      name: { en: 'Property Owners', ar: 'مالكو العقارات' },
      line: { en: 'Every unit, lease and document in one place.', ar: 'كل وحدة وعقد ومستند في مكان واحد.' } },
    { id: 'property-managers', icon: 'briefcase', demo: 'manager-home',
      name: { en: 'Property Management Companies', ar: 'شركات إدارة العقارات' },
      line: { en: 'Run portfolios with clarity, not spreadsheets.', ar: 'أدِر المحافظ العقارية بوضوح، لا بجداول متفرقة.' } },
    { id: 'facility', icon: 'wrench', demo: 'facility-home',
      name: { en: 'Facility Management', ar: 'إدارة المرافق' },
      line: { en: 'Assets, work orders and maintenance plans, connected.', ar: 'الأصول وأوامر العمل وخطط الصيانة في منظومة متصلة.' } },
    { id: 'committees', icon: 'users', demo: 'committee-home',
      name: { en: 'Building Committees', ar: 'لجان المباني' },
      line: { en: 'Transparent decisions, contributions and votes.', ar: 'قرارات ومساهمات وتصويت بشفافية.' } },
    { id: 'residents', icon: 'home', demo: 'm-resident-home',
      name: { en: 'Residents & Tenants', ar: 'السكان والمستأجرون' },
      line: { en: 'Report, pay and stay informed from your phone.', ar: 'أبلِغ وادفع وابقَ على اطلاع من هاتفك.' } },
    { id: 'providers', icon: 'tool', demo: 'provider-home',
      name: { en: 'Service Providers', ar: 'مزوّدو الخدمات' },
      line: { en: 'Qualified jobs from verified buildings.', ar: 'طلبات عمل مؤهّلة من مبانٍ موثّقة.' } },
  ];
  S.seg = (id) => S.segments.find((s) => s.id === id);

  S.nav = [
    { id: 'vision', label: { en: 'Vision', ar: 'الرؤية' } },
    { id: 'solutions', label: { en: 'Solutions', ar: 'الحلول' }, mega: true },
    { id: 'identity', label: { en: 'Building Identity', ar: 'هوية المبنى' } },
    { id: 'ecosystem', label: { en: 'Ecosystem', ar: 'المنظومة' } },
    { id: 'contact', label: { en: 'Contact', ar: 'تواصل معنا' } },
  ];
  S.href = (page) => (page === 'home' ? 'site' : 'site-' + page);

  /* ------------------------------------------------------------------ */
  /* Primitives                                                          */
  /* ------------------------------------------------------------------ */
  /** ws button: btn(label, { go, act, arg, kind: 'primary'|'light'|'line'|'line-dark'|'dark'|'text', icon, end: iconName, size: 'sm'|'lg', cls, type }) */
  S.btn = (label, o = {}) => {
    const cls = `ws-btn ws-btn-${o.kind || 'primary'} ${o.size ? 'ws-btn-' + o.size : ''} ${o.cls || ''}`;
    const inner = `${o.icon ? icon(o.icon) : ''}<span>${tx(label)}</span>${o.end ? icon(o.end, o.end.match(/arrowRight|chevR|arrowLeft|chevL/) ? 'flip' : '') : ''}`;
    if (o.go) return `<a class="${cls}" href="#${o.go}" data-go="${o.go}">${inner}</a>`;
    return `<button type="${o.type || 'button'}" class="${cls}" ${o.act ? `data-act="${o.act}" data-arg="${esc(o.arg ?? '')}"` : ''} ${o.attrs || ''}>${inner}</button>`;
  };
  /** Inline text link with arrow. */
  S.more = (label, go, cls = '') => `<a class="ws-more ${cls}" href="#${go}" data-go="${go}"><span>${tx(label)}</span>${icon('arrowRight', 'flip')}</a>`;
  S.eyebrow = (text, cls = '') => `<div class="ws-eyebrow ${cls}"><i></i><span>${tx(text)}</span></div>`;
  S.honest = (text, cls = '') => `<div class="ws-honest ${cls}">${icon('info')}<span>${text}</span></div>`;
  S.sampleTag = (text) => `<span class="ws-sample">${text || L('Sample data', 'بيانات نموذجية')}</span>`;
  S.id = (s) => `<bdi class="ws-mono">${esc(s)}</bdi>`;

  /** Standard light page hero (non-home pages). */
  S.pageHero = ({ eyebrow, title, lead, extra = '', aside = '', cls = '' }) => `
    <section class="ws-phero ${cls}">
      <div class="ws-wrap ws-phero-in ${aside ? 'has-aside' : ''}">
        <div class="ws-phero-text">
          ${S.eyebrow(eyebrow)}
          <h1 class="ws-h1" data-rv>${title}</h1>
          ${lead ? `<p class="ws-lead" data-rv style="--d:.08s">${lead}</p>` : ''}
          ${extra}
        </div>
        ${aside ? `<div class="ws-phero-aside" data-rv style="--d:.12s">${aside}</div>` : ''}
      </div>
    </section>`;

  /** CTA band used at the end of most pages. */
  S.ctaBand = (o = {}) => `
    <section class="ws-cta">
      <div class="ws-cta-art" aria-hidden="true">${S.ctaArt()}</div>
      <div class="ws-wrap ws-cta-in" data-rv>
        <div>
          ${S.eyebrow(o.eyebrow || L('See it working', 'شاهِده يعمل'), 'on-dark')}
          <h2 class="ws-h2">${o.title || L('Explore the BENA prototype, or ask us for a guided demo.', 'استكشف النموذج الأولي لـ BENA، أو اطلب عرضاً توضيحياً مع فريقنا.')}</h2>
        </div>
        <div class="ws-cta-actions">
          ${S.btn(L('Request a demo', 'اطلب عرضاً توضيحياً'), { go: 'site-contact', size: 'lg', end: 'arrowRight' })}
          ${S.btn(L('Open the demo workspaces', 'افتح مساحات العمل التجريبية'), { go: 'site-login', kind: 'line-dark', size: 'lg' })}
        </div>
      </div>
    </section>`;
  S.ctaArt = () => `<div class="ws-cta-tower">${S.tower({ theme: 'night', idp: 'cta', lit: ['8-3', '4-1', '11-2', '6-4'] })}</div>`;

  /* ------------------------------------------------------------------ */
  /* Isometric tower — the BENA "digital identity" building              */
  /* ------------------------------------------------------------------ */
  const TW = 132, TD = 92, TG = 26, TF = 19, TN = 14;
  const tz0 = (f) => (f === 0 ? 0 : TG + (f - 1) * TF);
  const tz1 = (f) => (f === 0 ? TG : TG + f * TF);
  const TH = tz1(TN - 1);
  const P = (x, y, z) => [(x - y) * 0.866, (x + y) * 0.5 - z];
  const pts = (arr) => arr.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const qL = (x0, x1, z0, z1) => pts([P(x0, TD, z0), P(x1, TD, z0), P(x1, TD, z1), P(x0, TD, z1)]);
  const qR = (y0, y1, z0, z1) => pts([P(TW, y0, z0), P(TW, y1, z0), P(TW, y1, z1), P(TW, y0, z1)]);
  const PM = 34; // parcel margin
  S.towerBox = { x: -150, y: -TH - 34, w: 336, h: TH + 34 + (TW + TD) * 0.5 + PM + 14 };
  S.towerFloors = TN;
  /** Screen point (viewBox coords) of a unit's centre: f floor, k 1..4 (ground: 1..2). */
  S.towerPt = (f, k) => {
    const zc = (tz0(f) + tz1(f)) / 2;
    if (f === 0) return k === 1 ? P(TW * 0.5, TD, zc) : P(TW, TD * 0.5, zc);
    if (k <= 2) return P(TW * (k - 0.5) / 2, TD, zc);
    return P(TW, TD - TD * (k - 2.5) / 2, zc);
  };
  /** Same point as a percentage of the tower box. */
  S.towerPct = (f, k) => { const p = S.towerPt(f, k); const b = S.towerBox; return [((p[0] - b.x) / b.w) * 100, ((p[1] - b.y) / b.h) * 100]; };

  /**
   * tower({ theme: 'night'|'stone', interactive, selFloor, selUnit: 'f-k', lit: ['8-3'], scan, trace, idp })
   */
  S.tower = (o = {}) => {
    const night = o.theme === 'night';
    const c = night
      ? { L: '#17384D', R: '#102C3F', T: '#1F4A62', edge: '#36D6A0', slab: 'rgba(54,214,160,.20)', win: '#21485F', lit: '#36D6A0', warm: '#F6E2A8', ground: 'rgba(54,214,160,.06)', parcel: '#36D6A0', shadow: 'rgba(0,0,0,.28)' }
      : { L: '#F3EEE5', R: '#E3D9C8', T: '#FAF7F1', edge: '#B9AC97', slab: '#D8CDBB', win: '#4A667A', lit: '#36D6A0', warm: '#F6E2A8', ground: 'rgba(20,43,59,.035)', parcel: '#0B8A60', shadow: 'rgba(20,43,59,.12)' };
    const idp = o.idp || 'tw';
    const lit = new Set(o.lit || []);
    const r = B.rng(o.seed || 142);
    const b = S.towerBox;
    let s = `<svg class="ws-tower ${night ? 'night' : 'stone'}" viewBox="${b.x} ${b.y} ${b.w} ${b.h}" preserveAspectRatio="xMidYMid meet" aria-hidden="${o.interactive ? 'false' : 'true'}" ${o.interactive ? `role="group" aria-label="${esc(L('Floors of Al-Masyoun Residence Tower', 'طوابق برج الماصيون السكني'))}"` : ''}>`;
    s += `<defs><linearGradient id="${idp}-gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#36D6A0" stop-opacity="0"/><stop offset=".85" stop-color="#36D6A0" stop-opacity=".38"/><stop offset="1" stop-color="#36D6A0" stop-opacity=".9"/></linearGradient>
      <clipPath id="${idp}-clip"><polygon points="${pts([P(0, TD, 0), P(TW, TD, 0), P(TW, 0, 0), P(TW, 0, TH), P(0, 0, TH), P(0, TD, TH)])}"/></clipPath></defs>`;
    // parcel + ground
    const par = [P(-PM, -PM, 0), P(TW + PM, -PM, 0), P(TW + PM, TD + PM, 0), P(-PM, TD + PM, 0)];
    s += `<polygon points="${pts(par)}" fill="${c.ground}" stroke="${c.parcel}" stroke-width="1" stroke-dasharray="4 4" stroke-opacity="${night ? 0.7 : 0.6}"/>`;
    par.forEach((p) => { s += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.4" fill="${c.parcel}"/>`; });
    // shadow
    s += `<polygon points="${pts([P(0, TD, 0), P(TW, TD, 0), P(TW + 40, TD + 18, 0), P(40, TD + 18, 0)])}" fill="${c.shadow}" opacity=".6"/>`;
    // floors
    for (let f = 0; f < TN; f++) {
      const z0 = tz0(f), z1 = tz1(f);
      const isSel = o.selFloor === f;
      let g = `<polygon class="ws-fl-l" points="${qL(0, TW, z0, z1)}" fill="${c.L}"/><polygon class="ws-fl-r" points="${qR(TD, 0, z0, z1)}" fill="${c.R}"/>`;
      if (f === 0) {
        // storefront glazing + lobby
        g += `<polygon points="${qL(8, TW * 0.5 - 6, z0 + 3, z1 - 5)}" fill="${night ? '#24546E' : '#5E7F96'}"/>`;
        g += `<polygon points="${qL(TW * 0.5 + 6, TW - 8, z0 + 3, z1 - 5)}" fill="${night ? '#24546E' : '#5E7F96'}" opacity=".85"/>`;
        g += `<polygon points="${qR(TD - 8, TD * 0.5 + 10, z0 + 3, z1 - 5)}" fill="${night ? '#1E4A62' : '#4A667A'}"/>`;
        g += `<polygon points="${qR(TD * 0.5 - 4, 10, z0, z1 - 4)}" fill="${night ? '#0D2433' : '#142B3B'}"/>`;
        g += `<polygon points="${qR(TD * 0.25 + 1, TD * 0.25 - 1, z0, z1 - 4)}" fill="#36D6A0"/>`;
      } else {
        for (let k = 1; k <= 4; k++) {
          const key = f + '-' + k;
          const hot = lit.has(key) || o.selUnit === key;
          for (let w = 0; w < 2; w++) {
            const on = hot || r() < (night ? 0.22 : 0.0);
            const warm = !hot && on && r() < 0.5;
            const fill = hot ? c.lit : on ? (warm ? c.warm : c.lit) : c.win;
            const op = hot ? 1 : on ? (night ? (warm ? 0.55 : 0.42) : 1) : 1;
            if (k <= 2) {
              const u0 = (k - 1) * TW / 2, uw = TW / 2;
              const x0 = u0 + uw * (w === 0 ? 0.12 : 0.55), x1 = x0 + uw * 0.33;
              g += `<polygon class="ws-win ${hot ? 'hot' : ''}" points="${qL(x0, x1, z0 + 4, z1 - 4)}" fill="${fill}" opacity="${op}"/>`;
            } else {
              const u0 = TD - (k - 3) * TD / 2, uw = TD / 2;
              const y0 = u0 - uw * (w === 0 ? 0.12 : 0.55), y1 = y0 - uw * 0.33;
              g += `<polygon class="ws-win ${hot ? 'hot' : ''}" points="${qR(y0, y1, z0 + 4, z1 - 4)}" fill="${fill}" opacity="${op}"/>`;
            }
          }
        }
        // balcony line
        g += `<polyline points="${pts([P(0, TD, z0 + 3.2), P(TW, TD, z0 + 3.2), P(TW, 0, z0 + 3.2)])}" fill="none" stroke="${c.slab}" stroke-width="1.6"/>`;
      }
      g += `<polyline points="${pts([P(0, TD, z1), P(TW, TD, z1), P(TW, 0, z1)])}" fill="none" stroke="${c.slab}" stroke-width=".8"/>`;
      if (o.interactive) {
        g += `<polygon class="ws-fl-hit" points="${pts([P(0, TD, z0), P(TW, TD, z0), P(TW, 0, z0), P(TW, 0, z1), P(TW, TD, z1), P(0, TD, z1)])}"/>`;
        s += `<g class="ws-fl ${isSel ? 'sel' : ''}" data-act="wsFloor" data-arg="${f}" role="button" tabindex="0" aria-pressed="${isSel}" aria-label="${esc(f === 0 ? L('Ground floor', 'الطابق الأرضي') : L('Floor ' + f, 'الطابق ' + f))}">${g}</g>`;
      } else s += `<g>${g}</g>`;
    }
    // roof
    s += `<polygon points="${pts([P(0, 0, TH), P(TW, 0, TH), P(TW, TD, TH), P(0, TD, TH)])}" fill="${c.T}"/>`;
    s += `<polygon points="${pts([P(6, 6, TH), P(TW - 6, 6, TH), P(TW - 6, TD - 6, TH), P(6, TD - 6, TH)])}" fill="none" stroke="${c.slab}" stroke-width="1"/>`;
    // rooftop tanks + solar
    [[22, 20], [40, 20], [58, 20]].forEach(([x, y], i) => {
      const h = 9;
      s += `<polygon points="${pts([P(x, y + 10, TH), P(x + 10, y + 10, TH), P(x + 10, y + 10, TH + h), P(x, y + 10, TH + h)])}" fill="${night ? '#2A5A74' : i === 1 ? '#C4CDD2' : '#8C9AA3'}"/>`;
      s += `<polygon points="${pts([P(x + 10, y + 10, TH), P(x + 10, y, TH), P(x + 10, y, TH + h), P(x + 10, y + 10, TH + h)])}" fill="${night ? '#1F4A62' : '#6F7E88'}"/>`;
      s += `<polygon points="${pts([P(x, y, TH + h), P(x + 10, y, TH + h), P(x + 10, y + 10, TH + h), P(x, y + 10, TH + h)])}" fill="${night ? '#36D6A0' : '#DCE3E6'}" opacity="${night ? 0.35 : 1}"/>`;
    });
    s += `<polygon points="${pts([P(78, 46, TH + 2), P(118, 46, TH + 2), P(118, 80, TH + 9), P(78, 80, TH + 9)])}" fill="${night ? '#1D4E6A' : '#2F4C61'}" stroke="${night ? '#36D6A0' : 'none'}" stroke-opacity=".5" stroke-width=".6"/>`;
    // scan plane (decorative)
    if (o.scan && !S.reduced()) {
      s += `<g clip-path="url(#${idp}-clip)"><rect x="-160" y="0" width="340" height="60" fill="url(#${idp}-gl)"><animate attributeName="y" values="${(TW + TD) * 0.5};${-TH - 60};${-TH - 60}" keyTimes="0;.75;1" dur="6s" repeatCount="indefinite"/></rect></g>`;
    }
    // traced outline
    const out = [P(0, TD, 0), P(TW, TD, 0), P(TW, 0, 0), P(TW, 0, TH), P(0, 0, TH), P(0, TD, TH), P(0, TD, 0)];
    s += `<polyline class="${o.trace ? 'ws-trace' : ''}" points="${pts(out)}" fill="none" stroke="${c.edge}" stroke-width="${night ? 1.4 : 1}" stroke-linejoin="round" ${night ? '' : 'stroke-opacity=".9"'} pathLength="1000"/>`;
    s += `<polyline class="${o.trace ? 'ws-trace' : ''}" points="${pts([P(TW, TD, 0), P(TW, TD, TH), P(0, TD, TH)])}" fill="none" stroke="${c.edge}" stroke-width="${night ? 1.4 : 1}" pathLength="1000" ${night ? '' : 'stroke-opacity=".9"'}/>`;
    s += `<polyline points="${pts([P(TW, TD, TH), P(TW, 0, TH)])}" fill="none" stroke="${c.edge}" stroke-width="${night ? 1.4 : 1}" ${night ? '' : 'stroke-opacity=".9"'}/>`;
    if (night) {
      // corner nodes
      [P(0, TD, 0), P(TW, TD, 0), P(TW, 0, 0), P(TW, 0, TH), P(0, 0, TH), P(0, TD, TH), P(TW, TD, TH)].forEach((p) => { s += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.6" fill="#36D6A0"/>`; });
    }
    // selected unit marker
    (o.marks || []).forEach((m) => {
      const p = S.towerPt(m.f, m.k);
      s += `<g transform="translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})"><circle r="9" fill="#36D6A0" opacity=".25">${S.reduced() ? '' : '<animate attributeName="r" values="5;13;5" dur="2.6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".45;0;.45" dur="2.6s" repeatCount="indefinite"/>'}</circle><circle r="3.6" fill="#36D6A0" stroke="${night ? '#0D1F2B' : '#fff'}" stroke-width="1.5"/></g>`;
    });
    s += '</svg>';
    return s;
  };

  /* ------------------------------------------------------------------ */
  /* Header, menus, footer                                               */
  /* ------------------------------------------------------------------ */
  const brand = (dark) => `<a class="ws-brand" href="#site" data-go="site" aria-label="BENA">${B.logo(32)}<span class="ws-brand-word">BENA</span></a>`;

  const mega = () => `
    <div class="ws-mega" role="menu">
      <div class="ws-mega-in">
        <div class="ws-mega-list">
          <div class="ws-mega-h">${L('Solutions by segment', 'الحلول حسب الفئة')}</div>
          <div class="ws-mega-grid">
            ${S.segments.map((sg) => `<a class="ws-mega-item" role="menuitem" href="#site-solutions-${sg.id}" data-go="site-solutions-${sg.id}">
              <span class="ws-mi-ic">${icon(sg.icon)}</span><span><b>${tx(sg.name)}</b><small>${tx(sg.line)}</small></span></a>`).join('')}
          </div>
        </div>
        <a class="ws-mega-feature" href="#site-identity" data-go="site-identity">
          <div class="ws-mf-art">${S.tower({ theme: 'night', idp: 'mg', lit: ['8-3'], marks: [{ f: 8, k: 3 }] })}</div>
          <div class="ws-mf-text"><span class="ws-mf-k">${L('Interactive', 'تفاعلي')}</span><b>${L('Explore a building identity', 'استكشف هوية مبنى')}</b><small>${L('Floors, units and provenance of a sample tower.', 'طوابق ووحدات ومصادر بيانات برج نموذجي.')}</small></div>
        </a>
      </div>
      <div class="ws-mega-foot"><span>${L('All solutions run on one shared building identity.', 'جميع الحلول تعمل على هوية مبنى واحدة مشتركة.')}</span>${S.more(L('View all solutions', 'عرض جميع الحلول'), 'site-solutions')}</div>
    </div>`;

  const header = (r) => {
    const cur = r.page;
    return `
    <header class="ws-hd" data-tone="${S.tone[cur] || 'light'}">
      <div class="ws-hd-in">
        ${brand()}
        <nav class="ws-nav" aria-label="${L('Main', 'الرئيسية')}">
          ${S.nav.map((n) => n.mega
            ? `<div class="ws-dd">
                <a class="ws-nl ${cur === n.id ? 'on' : ''}" href="#site-${n.id}" data-go="site-${n.id}" aria-haspopup="true">${tx(n.label)}${icon('chevD', 'ws-dd-chev')}</a>
                ${mega()}
              </div>`
            : `<a class="ws-nl ${cur === n.id ? 'on' : ''}" href="#site-${n.id}" data-go="site-${n.id}">${tx(n.label)}</a>`).join('')}
        </nav>
        <div class="ws-hd-end">
          <button class="ws-lang" data-act="lang" aria-label="${L('Switch language', 'تغيير اللغة')}">${icon('globe')}<span>${L('العربية', 'English')}</span></button>
          <a class="ws-login-link" href="#site-login" data-go="site-login">${L('Log in', 'تسجيل الدخول')}</a>
          ${S.btn(L('Request a demo', 'اطلب عرضاً'), { go: 'site-contact', size: 'sm', cls: 'ws-hd-cta' })}
          <button class="ws-burger" data-act="wsMenu" aria-label="${L('Open menu', 'فتح القائمة')}" aria-expanded="false"><i></i><i></i></button>
        </div>
      </div>
    </header>
    <div class="ws-mm" id="ws-mm" aria-hidden="true">
      <div class="ws-mm-top">${brand()}<button class="ws-mm-close" data-act="wsMenu" aria-label="${L('Close menu', 'إغلاق القائمة')}">${icon('x')}</button></div>
      <nav class="ws-mm-nav">
        <a href="#site" data-go="site" class="${cur === 'home' ? 'on' : ''}">${L('Home', 'الرئيسية')}</a>
        ${S.nav.map((n) => `<a href="#site-${n.id}" data-go="site-${n.id}" class="${cur === n.id ? 'on' : ''}">${tx(n.label)}</a>
          ${n.mega ? `<div class="ws-mm-sub">${S.segments.map((sg) => `<a href="#site-solutions-${sg.id}" data-go="site-solutions-${sg.id}">${tx(sg.name)}</a>`).join('')}</div>` : ''}`).join('')}
      </nav>
      <div class="ws-mm-actions">
        ${S.btn(L('Request a demo', 'اطلب عرضاً توضيحياً'), { go: 'site-contact', size: 'lg', cls: 'ws-btn-block' })}
        ${S.btn(L('Log in', 'تسجيل الدخول'), { go: 'site-login', kind: 'line-dark', size: 'lg', cls: 'ws-btn-block' })}
        <button class="ws-mm-lang" data-act="lang">${icon('globe')}<span>${L('العربية', 'English')}</span></button>
      </div>
      <div class="ws-mm-note">${L('Prototype · sample data · not an official registry', 'نموذج أولي · بيانات نموذجية · ليس سجلاً رسمياً')}</div>
    </div>`;
  };

  const footer = () => `
    <footer class="ws-ft">
      <div class="ws-wrap">
        <div class="ws-ft-top">
          <div class="ws-ft-brand">
            ${brand()}
            <p>${L('BENA is a building identity and connected services ecosystem — a vision presented here as an interactive prototype.', 'BENA منظومة لهوية المباني وخدماتها المتصلة — رؤية نعرضها هنا كنموذج أولي تفاعلي.')}</p>
            <div class="ws-ft-lang">
              <button class="${B.isAr() ? '' : 'on'}" data-act="wsLang" data-arg="en">English</button>
              <button class="${B.isAr() ? 'on' : ''}" data-act="wsLang" data-arg="ar">العربية</button>
            </div>
          </div>
          <div class="ws-ft-cols">
            <div><h4>${L('Platform', 'المنصة')}</h4>
              <a href="#site-vision" data-go="site-vision">${L('Vision', 'الرؤية')}</a>
              <a href="#site-identity" data-go="site-identity">${L('Building Identity', 'هوية المبنى')}</a>
              <a href="#site-ecosystem" data-go="site-ecosystem">${L('Connected Ecosystem', 'المنظومة المتصلة')}</a>
              <a href="#site-solutions" data-go="site-solutions">${L('All solutions', 'جميع الحلول')}</a></div>
            <div><h4>${L('Solutions', 'الحلول')}</h4>
              ${S.segments.map((sg) => `<a href="#site-solutions-${sg.id}" data-go="site-solutions-${sg.id}">${tx(sg.name)}</a>`).join('')}</div>
            <div><h4>${L('Prototype', 'النموذج الأولي')}</h4>
              <a href="#site-contact" data-go="site-contact">${L('Request a demo', 'اطلب عرضاً توضيحياً')}</a>
              <a href="#site-login" data-go="site-login">${L('Log in to a demo workspace', 'الدخول إلى مساحة عمل تجريبية')}</a>
              <a href="#m-resident-home" data-go="m-resident-home">${L('Open the mobile app', 'افتح تطبيق الهاتف')}</a>
              <a href="#hub" data-go="hub">${L('Demo hub', 'مركز العروض')}</a></div>
          </div>
        </div>
        <div class="ws-ft-honest">
          <span class="ws-ft-badge">${icon('info')}${L('Prototype · sample data · not an official registry', 'نموذج أولي · بيانات نموذجية · ليس سجلاً رسمياً')}</span>
          <p>${L('All buildings, people, identifiers and figures are fictional. Ramallah, Al-Bireh and Birzeit appear as sample locations only. A BENA ID is a digital reference identity — it is not proof of legal ownership. Municipal integration is a designed capability; this prototype is not connected to any municipality.', 'جميع المباني والأشخاص والمعرّفات والأرقام خيالية. تظهر رام الله والبيرة وبيرزيت كمواقع نموذجية فقط. معرّف BENA هوية مرجعية رقمية وليس إثباتاً قانونياً للملكية. الربط مع البلديات قدرة مصمَّمة؛ وهذا النموذج غير متصل بأي بلدية.')}</p>
        </div>
        <div class="ws-ft-bot"><span>© 2026 BENA · ${L('Concept prototype', 'نموذج مفاهيمي')}</span><span>${L('Frontend demonstration — nothing you enter is sent or stored.', 'عرض واجهات فقط — لا يُرسل أو يُحفظ أي شيء تُدخله.')}</span></div>
      </div>
    </footer>`;

  /* ------------------------------------------------------------------ */
  /* Router entry                                                        */
  /* ------------------------------------------------------------------ */
  const notFound = () => `
    ${S.pageHero({ eyebrow: L('Page not found', 'الصفحة غير موجودة'), title: L('This page isn’t part of the website.', 'هذه الصفحة ليست ضمن الموقع.'), lead: L('Head back to the home page or pick a section from the menu.', 'عد إلى الصفحة الرئيسية أو اختر قسماً من القائمة.'),
      extra: `<div class="ws-hero-ctas">${S.btn(L('Back to home', 'العودة إلى الرئيسية'), { go: 'site', end: 'arrowRight' })}</div>` })}`;

  B.exp.site = (r) => {
    const page = S.render[r.page] ? r.page : null;
    let body;
    try { body = page ? S.render[page](r.id) : notFound(); } catch (e) { console.error(e); body = notFound(); }
    const titles = { home: '', vision: L('Vision', 'الرؤية'), solutions: L('Solutions', 'الحلول'), identity: L('Building Identity', 'هوية المبنى'), ecosystem: L('Ecosystem', 'المنظومة'), contact: L('Request a demo', 'اطلب عرضاً'), login: L('Log in', 'تسجيل الدخول') };
    B.afterRender(() => {
      try { document.title = titles[r.page] ? `${titles[r.page]} — BENA` : L('BENA — Every building has an identity', 'BENA — لكل مبنى هوية'); } catch (e) { /* ignore */ }
      document.documentElement.classList.remove('ws-lock');
      S.bind(r);
    });
    return `<div class="ws ws-p-${page || 'none'} ${navigator.webdriver ? 'ws-auto' : ''}" data-exp-root="site" data-page="${page || 'none'}">
      ${header(r)}
      <main class="ws-main" id="ws-main">${body}</main>
      ${r.page === 'login' ? '' : footer()}
    </div>`;
  };

  /* ------------------------------------------------------------------ */
  /* Behaviour                                                           */
  /* ------------------------------------------------------------------ */
  let io = null, renderedAt = 0, ticking = false;
  const pxEls = [];
  S.onScroll = () => {
    const hd = document.querySelector('.ws-hd');
    if (!hd) return;
    hd.classList.toggle('is-solid', window.scrollY > 24);
    if (ticking || !pxEls.length) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      if (y > window.innerHeight * 1.4) return;
      pxEls.forEach((el) => { el.style.transform = `translate3d(0, ${(y * (+el.dataset.px || 0)).toFixed(1)}px, 0)`; });
    });
  };
  window.addEventListener('scroll', S.onScroll, { passive: true });
  window.addEventListener('resize', () => { if (document.querySelector('.ws')) (S.onResize || []).forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } }); }, { passive: true });

  S.bind = (r) => {
    renderedAt = Date.now();
    S.onResize = [];
    // header state
    S.onScroll();
    // mega menu: hover intent (ignore the hover that is already under the cursor right after a render)
    document.querySelectorAll('.ws-dd').forEach((dd) => {
      let t = null;
      dd.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse' || Date.now() - renderedAt < 450) return; clearTimeout(t); dd.classList.add('open'); });
      dd.addEventListener('pointerleave', () => { clearTimeout(t); t = setTimeout(() => dd.classList.remove('open'), 160); });
      dd.addEventListener('focusin', () => dd.classList.add('open'));
      dd.addEventListener('focusout', (e) => { if (!dd.contains(e.relatedTarget)) dd.classList.remove('open'); });
    });
    // parallax
    pxEls.length = 0;
    if (!S.reduced() && window.matchMedia('(min-width: 768px)').matches) document.querySelectorAll('.ws [data-px]').forEach((el) => pxEls.push(el));
    // reveal on scroll — content is visible by default; this only enhances
    if (io) { io.disconnect(); io = null; }
    const canReveal = !S.reduced() && 'IntersectionObserver' in window && !navigator.webdriver;
    if (canReveal) {
      requestAnimationFrame(() => {
        io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('ws-in'); io && io.unobserve(en.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
        const vh = window.innerHeight;
        document.querySelectorAll('.ws [data-rv]').forEach((el) => {
          const b = el.getBoundingClientRect();
          if (b.top > vh * 0.94) { el.classList.add('ws-pre'); io.observe(el); }
        });
      });
    }
    // anchor scrolling for #site-<page>-<section>
    if (r.id) {
      const target = document.getElementById(`ws-sec-${r.id}`);
      if (target) requestAnimationFrame(() => requestAnimationFrame(() => {
        const y = target.getBoundingClientRect().top + window.scrollY - 76;
        window.scrollTo(0, Math.max(0, y));
      }));
    }
    (S.binders || []).forEach((fn) => { try { fn(r); } catch (e) { console.error(e); } });
  };
  /** Page files register extra bind hooks: S.binders.push((route) => …) */
  S.binders = S.binders || [];

  B.act.wsMenu = () => {
    const mm = document.getElementById('ws-mm');
    if (!mm) return;
    const open = !mm.classList.contains('open');
    mm.classList.toggle('open', open);
    mm.setAttribute('aria-hidden', String(!open));
    document.documentElement.classList.toggle('ws-lock', open);
    document.querySelectorAll('.ws-burger').forEach((b) => b.setAttribute('aria-expanded', String(open)));
  };
  B.act.wsLang = (l) => { if (l !== B.lang) B.setLang(l); };
  /** Smooth-scroll to an element id inside the page. */
  B.act.wsScroll = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: Math.max(0, y), behavior: S.reduced() ? 'auto' : 'smooth' });
  };
  // keyboard activation for SVG / div controls that use role=button
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    const el = ev.target.closest && ev.target.closest('.ws [role="button"][data-act]');
    if (!el || el.tagName === 'BUTTON' || el.tagName === 'A') return;
    ev.preventDefault();
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  /* ------------------------------------------------------------------ */
  /* Styles                                                              */
  /* ------------------------------------------------------------------ */
  B.css(`
  .ws { --ws-gut: clamp(20px, 5vw, 64px); --ws-max: 1280px; --ws-navy: #0F2433; --ws-deep: #0A1A25; background: #fff; color: var(--ink); overflow-x: clip; min-height: 100vh; font-size: 16px; line-height: 1.6; }
  html.ws-lock, html.ws-lock body { overflow: hidden; }
  .ws ::selection { background: var(--mint-100); color: var(--navy); }
  .ws-wrap { width: 100%; max-width: calc(var(--ws-max) + var(--ws-gut) * 2); margin-inline: auto; padding-inline: var(--ws-gut); }
  .ws section { position: relative; }
  .ws-mono { font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace; letter-spacing: -.01em; direction: ltr; unicode-bidi: isolate; }

  /* type */
  .ws-display { font-family: var(--font-display); font-weight: 800; font-size: clamp(46px, 6.6vw, 100px); line-height: .98; letter-spacing: -.04em; margin: 0; }
  .ws-h1 { font-family: var(--font-display); font-weight: 800; font-size: clamp(40px, 5.4vw, 80px); line-height: 1.02; letter-spacing: -.035em; margin: 0; }
  .ws-h2 { font-family: var(--font-display); font-weight: 750; font-weight: 800; font-size: clamp(32px, 3.9vw, 56px); line-height: 1.06; letter-spacing: -.03em; margin: 0; }
  .ws-h3 { font-family: var(--font-display); font-weight: 700; font-size: clamp(22px, 2vw, 28px); line-height: 1.2; letter-spacing: -.02em; margin: 0; }
  .ws-lead { font-size: clamp(18px, 1.55vw, 22px); line-height: 1.55; color: var(--text-2); max-width: 40em; margin-top: 22px; }
  .ws-body { font-size: 17px; line-height: 1.7; color: var(--text-2); }
  .ws-mint { color: var(--mint-ink); }
  .ws-dark .ws-mint, .ws-on-dark .ws-mint { color: var(--mint); }
  html[dir="rtl"] .ws-display, html[dir="rtl"] .ws-h1, html[dir="rtl"] .ws-h2, html[dir="rtl"] .ws-h3 { letter-spacing: 0; line-height: 1.28; font-weight: 700; }
  html[dir="rtl"] .ws-display { line-height: 1.2; }
  .ws-eyebrow { display: inline-flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--mint-ink); margin-bottom: 22px; }
  .ws-eyebrow i { width: 28px; height: 1.5px; background: currentColor; display: block; }
  .ws-eyebrow.on-dark { color: var(--mint); }
  html[dir="rtl"] .ws-eyebrow { letter-spacing: 0; font-size: 14px; }

  /* buttons */
  .ws-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; height: 50px; padding: 0 24px; border-radius: 999px; font-size: 15px; font-weight: 600; white-space: nowrap; border: 1px solid transparent; transition: background .25s var(--ease), color .25s, border-color .25s, transform .25s var(--ease), box-shadow .25s; cursor: pointer; text-decoration: none; }
  .ws-btn svg { width: 18px; height: 18px; flex: none; transition: transform .25s var(--ease); }
  .ws-btn:hover svg:last-child { transform: translateX(3px); }
  html[dir="rtl"] .ws-btn:hover svg.flip:last-child { transform: scaleX(-1) translateX(3px); }
  .ws-btn-primary { background: var(--mint); color: var(--navy); }
  .ws-btn-primary:hover { background: #4BE0AE; box-shadow: 0 10px 30px -10px rgba(54,214,160,.65); }
  .ws-btn-dark { background: var(--navy); color: #fff; }
  .ws-btn-dark:hover { background: var(--navy-2); }
  .ws-btn-line { background: transparent; color: var(--navy); border-color: rgba(20,43,59,.22); }
  .ws-btn-line:hover { border-color: var(--navy); }
  .ws-btn-line-dark { background: rgba(255,255,255,.02); color: #fff; border-color: rgba(255,255,255,.28); }
  .ws-btn-line-dark:hover { border-color: #fff; background: rgba(255,255,255,.07); }
  .ws-btn-light { background: #fff; color: var(--navy); }
  .ws-btn-sm { height: 40px; padding: 0 18px; font-size: 14px; }
  .ws-btn-lg { height: 56px; padding: 0 28px; font-size: 16px; }
  .ws-btn-block { width: 100%; }
  .ws-btn[disabled] { opacity: .6; pointer-events: none; }
  .ws-more { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; color: var(--mint-ink); font-size: 15px; }
  .ws-more svg { width: 17px; height: 17px; transition: transform .25s var(--ease); }
  .ws-more:hover svg { transform: translateX(4px); }
  html[dir="rtl"] .ws-more:hover svg { transform: scaleX(-1) translateX(4px); }
  .ws-on-dark .ws-more, .ws-dark .ws-more { color: var(--mint); }
  .ws-honest { display: inline-flex; align-items: flex-start; gap: 8px; font-size: 13px; line-height: 1.5; color: var(--text-2); }
  .ws-honest svg { width: 16px; height: 16px; flex: none; margin-top: 2px; color: var(--mint-ink); }
  .ws-sample { display: inline-flex; align-items: center; height: 22px; padding: 0 9px; border-radius: 6px; font-size: 11.5px; font-weight: 600; letter-spacing: .02em; color: var(--text-2); background: repeating-linear-gradient(-45deg, #EEF2F1, #EEF2F1 5px, #F7F9F8 5px, #F7F9F8 10px); border: 1px solid var(--line); white-space: nowrap; }
  .ws-on-dark .ws-sample, .ws-dark .ws-sample { color: #B8C8D2; background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.14); }

  /* reveal */
  .ws-pre { opacity: 0; transform: translateY(26px); }
  .ws-pre.ws-in { opacity: 1; transform: none; transition: opacity .9s var(--ease) var(--d, 0s), transform 1s var(--ease) var(--d, 0s); }

  /* header */
  .ws-hd { position: fixed; inset-inline: 0; top: 0; z-index: 60; transition: background .35s var(--ease), border-color .35s, box-shadow .35s, color .35s; border-bottom: 1px solid transparent; color: var(--navy); }
  .ws-hd[data-tone="dark"] { color: #fff; }
  .ws-hd[data-tone="solid"] { background: #fff !important; }
  .ws-hd.is-solid, .ws-hd[data-tone="solid"] { background: rgba(255,255,255,.88); -webkit-backdrop-filter: saturate(1.6) blur(16px); backdrop-filter: saturate(1.6) blur(16px); border-bottom-color: rgba(20,43,59,.08); color: var(--navy); }
  .ws-hd-in { height: 76px; display: flex; align-items: center; gap: 28px; max-width: calc(var(--ws-max) + var(--ws-gut) * 2); margin-inline: auto; padding-inline: var(--ws-gut); transition: height .35s var(--ease); }
  .ws-hd.is-solid .ws-hd-in { height: 66px; }
  .ws-brand { display: inline-flex; align-items: center; gap: 10px; color: inherit; flex: none; }
  .ws-brand-word { font-family: "Plus Jakarta Sans", var(--font); font-weight: 800; font-size: 21px; letter-spacing: .02em; }
  .ws-nav { display: flex; align-items: center; gap: 2px; margin-inline-start: 18px; }
  .ws-nl { position: relative; display: inline-flex; align-items: center; gap: 4px; height: 40px; padding: 0 14px; border-radius: 99px; font-size: 15px; font-weight: 500; color: inherit; opacity: .86; transition: opacity .2s, background .2s; }
  .ws-nl:hover, .ws-dd.open > .ws-nl { opacity: 1; background: rgba(127,148,160,.12); }
  .ws-nl.on { opacity: 1; }
  .ws-nl.on::after { content: ""; position: absolute; inset-inline: 14px; bottom: 5px; height: 2px; border-radius: 2px; background: var(--mint); }
  .ws-dd-chev { width: 15px; height: 15px; transition: transform .25s var(--ease); }
  .ws-dd.open .ws-dd-chev { transform: rotate(180deg); }
  .ws-hd-end { margin-inline-start: auto; display: flex; align-items: center; gap: 8px; }
  .ws-lang { display: inline-flex; align-items: center; gap: 7px; height: 40px; padding: 0 12px; border-radius: 99px; font-size: 14px; font-weight: 500; color: inherit; opacity: .86; }
  .ws-lang:hover { opacity: 1; background: rgba(127,148,160,.12); }
  .ws-lang svg { width: 17px; height: 17px; }
  .ws-login-link { height: 40px; display: inline-flex; align-items: center; padding: 0 12px; font-size: 15px; font-weight: 600; color: inherit; border-radius: 99px; }
  .ws-login-link:hover { background: rgba(127,148,160,.12); }
  .ws-burger { display: none; width: 44px; height: 44px; border-radius: 99px; color: inherit; position: relative; }
  .ws-burger i { position: absolute; inset-inline-start: 12px; width: 20px; height: 1.8px; background: currentColor; border-radius: 2px; }
  .ws-burger i:first-child { top: 17px; } .ws-burger i:last-child { top: 25px; }

  /* mega menu */
  .ws-dd { position: relative; }
  .ws-mega { position: absolute; top: calc(100% + 14px); inset-inline-start: -180px; width: min(900px, calc(100vw - 48px)); background: #fff; color: var(--ink); border-radius: 22px; border: 1px solid rgba(20,43,59,.08); box-shadow: 0 30px 80px -20px rgba(13,31,43,.35); opacity: 0; visibility: hidden; transform: translateY(-8px); transition: opacity .25s var(--ease), transform .3s var(--ease), visibility 0s .3s; overflow: hidden; }
  .ws-mega::before { content: ""; position: absolute; inset-inline: 0; top: -16px; height: 16px; }
  .ws-dd.open .ws-mega { opacity: 1; visibility: visible; transform: none; transition: opacity .25s var(--ease), transform .3s var(--ease); }
  .ws-mega-in { display: grid; grid-template-columns: 1fr 280px; gap: 0; }
  .ws-mega-list { padding: 26px 22px 18px 26px; padding-inline: 26px 18px; }
  .ws-mega-h { font-size: 12px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--text-3); margin: 0 10px 10px; }
  html[dir="rtl"] .ws-mega-h { letter-spacing: 0; }
  .ws-mega-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
  .ws-mega-item { display: flex; gap: 14px; padding: 12px 10px; border-radius: 14px; transition: background .2s; }
  .ws-mega-item:hover { background: var(--surface-2); }
  .ws-mega-item b { display: block; font-size: 14.5px; font-weight: 600; color: var(--ink); }
  .ws-mega-item small { display: block; font-size: 13px; line-height: 1.45; color: var(--text-2); margin-top: 2px; }
  .ws-mi-ic { width: 36px; height: 36px; border-radius: 10px; background: var(--mint-50); color: var(--mint-ink); display: grid; place-items: center; flex: none; }
  .ws-mi-ic svg { width: 18px; height: 18px; }
  .ws-mega-feature { background: var(--ws-navy); color: #fff; padding: 22px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; }
  .ws-mf-art { height: 210px; display: grid; place-items: center; }
  .ws-mf-art svg { height: 100%; width: auto; }
  .ws-mf-k { font-size: 11.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--mint); font-weight: 600; }
  html[dir="rtl"] .ws-mf-k { letter-spacing: 0; }
  .ws-mf-text b { display: block; font-family: var(--font-display); font-size: 18px; margin-top: 4px; }
  .ws-mf-text small { display: block; color: #A9BCC9; font-size: 13px; margin-top: 4px; }
  .ws-mega-foot { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 26px; border-top: 1px solid var(--line-2); background: var(--surface-2); font-size: 13.5px; color: var(--text-2); }

  /* mobile menu */
  .ws-mm { position: fixed; inset: 0; z-index: 80; background: var(--ws-deep); color: #fff; display: flex; flex-direction: column; padding: 0 var(--ws-gut) 28px; overflow-y: auto; opacity: 0; visibility: hidden; transform: translateY(-12px); transition: opacity .3s var(--ease), transform .35s var(--ease), visibility 0s .35s; }
  .ws-mm.open { opacity: 1; visibility: visible; transform: none; transition: opacity .3s var(--ease), transform .35s var(--ease); }
  .ws-mm-top { height: 76px; display: flex; align-items: center; justify-content: space-between; flex: none; }
  .ws-mm-close { width: 44px; height: 44px; border-radius: 99px; display: grid; place-items: center; color: #fff; background: rgba(255,255,255,.08); }
  .ws-mm-close svg { width: 22px; height: 22px; }
  .ws-mm-nav { display: flex; flex-direction: column; padding-top: 18px; }
  .ws-mm-nav > a { font-family: var(--font-display); font-size: clamp(28px, 7vw, 40px); font-weight: 700; letter-spacing: -.02em; padding: 8px 0; color: #fff; border-bottom: 1px solid rgba(255,255,255,.07); }
  html[dir="rtl"] .ws-mm-nav > a { letter-spacing: 0; }
  .ws-mm-nav > a.on { color: var(--mint); }
  .ws-mm-sub { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 0 16px; }
  .ws-mm-sub a { font-size: 14px; padding: 8px 14px; border-radius: 99px; border: 1px solid rgba(255,255,255,.14); color: #CFDCE4; }
  .ws-mm-actions { display: grid; gap: 10px; margin-top: 28px; }
  .ws-mm-lang { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 50px; color: #CFDCE4; font-size: 15px; }
  .ws-mm-lang svg { width: 18px; height: 18px; }
  .ws-mm-note { margin-top: auto; padding-top: 24px; font-size: 12.5px; color: #8BA3B3; text-align: center; }

  /* page hero (light) */
  .ws-phero { padding: clamp(130px, 16vw, 196px) 0 clamp(56px, 7vw, 96px); background: linear-gradient(180deg, #F4F7F6 0%, #fff 100%); overflow: hidden; }
  .ws-phero::before { content: ""; position: absolute; inset: 0; background-image: linear-gradient(rgba(20,43,59,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(20,43,59,.045) 1px, transparent 1px); background-size: 64px 64px; -webkit-mask-image: linear-gradient(180deg, #000 0%, transparent 85%); mask-image: linear-gradient(180deg, #000 0%, transparent 85%); pointer-events: none; }
  .ws-phero-in { position: relative; }
  .ws-phero-in.has-aside { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, .75fr); gap: clamp(32px, 5vw, 80px); align-items: end; }
  .ws-phero-text .ws-h1 { max-width: 15em; }
  .ws-hero-ctas { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 36px; }

  /* sections */
  .ws-sec { padding: clamp(80px, 10vw, 148px) 0; }
  .ws-sec.tight { padding: clamp(56px, 7vw, 96px) 0; }
  .ws-sec.alt { background: #F4F7F6; }
  .ws-dark { background: var(--ws-navy); color: #fff; }
  .ws-dark .ws-h2, .ws-dark .ws-h3, .ws-dark h3, .ws-dark h2 { color: #fff; }
  .ws-dark .ws-lead, .ws-dark .ws-body { color: #A9BCC9; }
  .ws-sec-head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .8fr); gap: clamp(24px, 5vw, 80px); align-items: end; margin-bottom: clamp(40px, 5vw, 72px); }
  .ws-sec-head .ws-lead { margin-top: 0; }

  /* CTA band */
  .ws-cta { background: var(--ws-deep); color: #fff; padding: clamp(72px, 9vw, 128px) 0; overflow: hidden; }
  .ws-cta-art { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .ws-cta-tower { position: absolute; inset-inline-end: max(2vw, calc((100vw - var(--ws-max)) / 2 - 40px)); top: 8%; height: 125%; aspect-ratio: 336 / 467; opacity: .55; -webkit-mask-image: linear-gradient(180deg, #000 45%, transparent 92%); mask-image: linear-gradient(180deg, #000 45%, transparent 92%); }
  .ws-cta-tower svg { width: 100%; height: 100%; }
  .ws-cta-in { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: 36px; align-items: start; }
  .ws-cta-in > div:first-child { max-width: 820px; }
  .ws-cta .ws-h2 { color: #fff; max-width: 16em; }
  .ws-cta-actions { display: flex; flex-wrap: wrap; gap: 12px; }

  /* footer */
  .ws-ft { background: var(--ws-deep); color: #A9BCC9; border-top: 1px solid rgba(255,255,255,.07); padding: 72px 0 32px; font-size: 14.5px; }
  .ws-ft .ws-brand { color: #fff; }
  .ws-ft-top { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr); gap: 56px; }
  .ws-ft-brand p { margin-top: 18px; max-width: 26em; line-height: 1.65; }
  .ws-ft-lang { display: inline-flex; margin-top: 22px; border: 1px solid rgba(255,255,255,.14); border-radius: 99px; padding: 3px; }
  .ws-ft-lang button { height: 34px; padding: 0 14px; border-radius: 99px; font-size: 13.5px; color: #CFDCE4; }
  .ws-ft-lang button.on { background: rgba(255,255,255,.1); color: #fff; }
  .ws-ft-cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; }
  .ws-ft-cols h4 { font-family: var(--font); font-size: 12.5px; text-transform: uppercase; letter-spacing: .12em; color: #fff; font-weight: 600; margin-bottom: 16px; }
  html[dir="rtl"] .ws-ft-cols h4 { letter-spacing: 0; font-size: 14px; }
  .ws-ft-cols a { display: block; padding: 5px 0; color: #A9BCC9; transition: color .2s; }
  .ws-ft-cols a:hover { color: #fff; }
  .ws-ft-honest { margin-top: 56px; padding: 22px 0; border-top: 1px solid rgba(255,255,255,.08); border-bottom: 1px solid rgba(255,255,255,.08); display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 24px; align-items: start; }
  .ws-ft-badge { display: inline-flex; align-items: center; gap: 8px; padding: 7px 12px; border-radius: 8px; background: rgba(54,214,160,.1); color: var(--mint); font-size: 13px; font-weight: 600; white-space: nowrap; }
  .ws-ft-badge svg { width: 16px; height: 16px; }
  .ws-ft-honest p { font-size: 13.5px; line-height: 1.65; color: #8BA3B3; }
  .ws-ft-bot { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding-top: 22px; font-size: 13px; color: #6F8898; }

  /* tower */
  .ws-tower { overflow: visible; }
  .ws-trace { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: wsDraw 2.6s var(--ease) .3s forwards; }
  @keyframes wsDraw { to { stroke-dashoffset: 0; } }
  .ws-fl { cursor: pointer; outline: none; }
  .ws-fl-hit { fill: transparent; transition: fill .2s; }
  .ws-fl:hover .ws-fl-hit, .ws-fl:focus-visible .ws-fl-hit { fill: rgba(54,214,160,.28); }
  .ws-fl.sel .ws-fl-hit { fill: rgba(54,214,160,.55); }
  .ws-fl.sel .ws-win { fill: #1F6E55; }
  .ws-fl.sel .ws-win.hot { fill: #36D6A0; }

  /* responsive */
  @media (max-width: 1180px) {
    .ws-nav, .ws-login-link { display: none; }
    .ws-burger { display: inline-block; }
  }
  @media (max-width: 960px) {
    .ws-cta-tower { opacity: .22; }
    .ws-sec-head, .ws-phero-in.has-aside, .ws-cta-in { grid-template-columns: minmax(0, 1fr); }
    .ws-ft-top { grid-template-columns: minmax(0, 1fr); gap: 40px; }
    .ws-ft-honest { grid-template-columns: minmax(0, 1fr); gap: 12px; }
    .ws-ft-badge { white-space: normal; }
  }
  @media (max-width: 640px) {
    .ws-hd-in { height: 64px; gap: 12px; }
    .ws-hd.is-solid .ws-hd-in { height: 60px; }
    .ws-hd-cta { display: none; }
    .ws-lang span { display: none; }
    .ws-ft-cols { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
    .ws-ft-cols > div:first-child { grid-column: 1 / -1; }
    .ws-btn-lg { height: 54px; padding: 0 22px; }
    .ws-cta-actions .ws-btn { width: 100%; }
    .ws-body { font-size: 16px; }
  }
  /* automated checks / screenshots: show end states of intro animations */
  .ws-auto .ws-trace, .ws-auto .ws-hv-lead { animation: none !important; stroke-dashoffset: 0 !important; opacity: 1 !important; }
  @media (prefers-reduced-motion: reduce) {
    .ws-pre { opacity: 1 !important; transform: none !important; }
    .ws-trace { animation: none; stroke-dashoffset: 0; }
  }
  `);
})();
