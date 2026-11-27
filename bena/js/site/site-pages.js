/*
 * BENA public website — inner pages:
 *   #site-vision · #site-solutions[-<segment>] · #site-identity · #site-ecosystem · #site-contact · #site-login
 * Frontend-only prototype; forms are simulated and nothing is sent.
 */
(function () {
  'use strict';
  const B = window.B;
  const S = B.site;
  const { L, tx, esc, icon } = B;
  const BID = 'BN-RAM-00142';
  const ui = B.ui;

  /* ================================================================== */
  /* VISION                                                              */
  /* ================================================================== */
  const vToc = () => [
    ['v1', L('The invisible building', 'المبنى غير المرئي')],
    ['v2', L('A persistent identity', 'هوية دائمة')],
    ['v3', L('What the identity links', 'ما الذي تربطه الهوية')],
    ['v4', L('Principles', 'المبادئ')],
    ['v5', L('What BENA is not', 'ما ليست عليه BENA')],
  ];

  const scatterDiagram = () => {
    const items = [
      [L('Paper permits', 'رخص ورقية'), 8, 14], [L('Group chats', 'مجموعات الدردشة'), 52, 6], [L('Spreadsheets', 'جداول بيانات'), 24, 46],
      [L('Notice board', 'لوحة الإعلانات'), 66, 40], [L('Phone calls', 'مكالمات هاتفية'), 10, 76], [L('Bank transfers', 'حوالات بنكية'), 56, 78],
    ];
    const today = items.map(([t, x, y], i) => `<span class="ws-sc-chip" style="inset-inline-start:${x}%;top:${y}%;rotate:${(i % 2 ? 1 : -1) * (2 + i)}deg">${t}</span>`).join('');
    const bena = items.map(([t], i) => `<span class="ws-sc-row"><i></i>${t}</span>`).join('');
    return `
      <figure class="ws-fig ws-scatter" data-rv>
        <div class="ws-sc-panel">
          <div class="ws-fig-k">${L('Today', 'اليوم')}</div>
          <div class="ws-sc-field">${today}</div>
          <figcaption>${L('Information exists, but nothing connects it to the building.', 'المعلومات موجودة، لكن لا شيء يربطها بالمبنى.')}</figcaption>
        </div>
        <div class="ws-sc-arrow">${icon('arrowRight', 'flip')}</div>
        <div class="ws-sc-panel on">
          <div class="ws-fig-k">${L('With BENA', 'مع BENA')}</div>
          <div class="ws-sc-anchor"><span class="ws-sc-id">${S.id(BID)}</span><div class="ws-sc-list">${bena}</div></div>
          <figcaption>${L('The same information, attached to one identity — with its source.', 'المعلومات ذاتها، مرتبطة بهوية واحدة — مع مصدرها.')}</figcaption>
        </div>
      </figure>`;
  };

  const ringsDiagram = () => {
    const rings = [
      [210, L('Services', 'الخدمات'), '#E8FAF3'],
      [168, L('People & roles', 'الأشخاص والأدوار'), '#D9F3E9'],
      [126, L('Units', 'الوحدات'), '#C6EEDF'],
      [84, L('Floors', 'الطوابق'), '#A8E6CF'],
    ];
    let s = `<svg viewBox="0 0 460 460" class="ws-rings" role="img" aria-label="${esc(L('Identity layers: building, floors, units, people and roles, services', 'طبقات الهوية: المبنى، الطوابق، الوحدات، الأشخاص والأدوار، الخدمات'))}">`;
    rings.forEach(([r, t, c]) => {
      s += `<circle cx="230" cy="230" r="${r}" fill="${c}" stroke="#36D6A0" stroke-opacity=".5"/>`;
      s += `<text x="230" y="${230 - r + 24}" text-anchor="middle" class="ws-ring-t">${esc(t)}</text>`;
    });
    s += `<circle cx="230" cy="230" r="44" fill="#142B3B"/><text x="230" y="226" text-anchor="middle" class="ws-ring-c">${esc(L('Building', 'المبنى'))}</text><text x="230" y="244" text-anchor="middle" class="ws-ring-id">BN-RAM-00142</text>`;
    [[60, 120], [380, 150], [96, 360], [350, 372]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="4" fill="#0B8A60"/>`; });
    return s + '</svg>';
  };

  const linksDiagram = () => {
    const items = [
      { ic: 'building', t: L('Building information', 'معلومات المبنى'), d: L('Type, floors, area, year, documents', 'النوع والطوابق والمساحة والسنة والمستندات'), p: 'official' },
      { ic: 'landmark', t: L('Municipal references', 'المراجع البلدية'), d: L('Sample references — designed to connect, not connected', 'مراجع نموذجية — مصمَّمة للربط وغير متصلة'), p: 'official' },
      { ic: 'users', t: L('People & roles', 'الأشخاص والأدوار'), d: L('Owners, residents, committee, managers', 'المالكون والسكان واللجنة والمديرون'), p: 'submitted' },
      { ic: 'grid', t: L('Units', 'الوحدات'), d: L('Each unit has its own sub-identity', 'لكل وحدة هوية فرعية خاصة بها'), p: 'official' },
      { ic: 'briefcase', t: L('Management', 'الإدارة'), d: L('Mandates, leases, budgets and votes', 'التفويضات والعقود والميزانيات والتصويت'), p: 'submitted' },
      { ic: 'wrench', t: L('Services', 'الخدمات'), d: L('Requests, providers, contracts, history', 'الطلبات والمزوّدون والعقود والسجل'), p: 'pending' },
    ];
    const tile = (it) => `<div class="ws-lk-tile"><span class="ws-lk-ic">${icon(it.ic)}</span><div><b>${it.t}</b><small>${it.d}</small><div class="ws-lk-prov">${ui.prov(it.p)}</div></div></div>`;
    return `
      <figure class="ws-fig ws-links" data-rv>
        <div class="ws-lk-col">${items.slice(0, 3).map(tile).join('')}</div>
        <div class="ws-lk-core"><div class="ws-lk-card">${B.logo(30)}<span class="ws-lk-k">${L('BENA ID', 'معرّف BENA')}</span>${S.id(BID)}<small>${L('Digital reference identity', 'هوية مرجعية رقمية')}</small></div></div>
        <div class="ws-lk-col">${items.slice(3).map(tile).join('')}</div>
      </figure>`;
  };

  S.render.vision = () => `
    ${S.pageHero({
      eyebrow: L('Vision', 'الرؤية'),
      title: L('A digital identity for every building.', 'هوية رقمية لكل مبنى.'),
      lead: L('Cities run on buildings, yet buildings have no shared digital presence. BENA proposes one: a persistent identity that links what a building is, where it stands, who is connected to it, and the services that keep it running.', 'تقوم المدن على المباني، لكن المباني لا تملك حضوراً رقمياً مشتركاً. تقترح BENA هذا الحضور: هوية دائمة تربط ماهية المبنى وموقعه ومن يرتبط به والخدمات التي تبقيه يعمل.'),
      aside: `<div class="ws-toc"><div class="ws-toc-k">${L('In this essay', 'في هذا المقال')}</div>${vToc().map(([id, t], i) => `<button data-act="wsScroll" data-arg="ws-${id}"><span>${String(i + 1).padStart(2, '0')}</span>${t}</button>`).join('')}</div>`,
    })}
    <article class="ws-essay">
      <section class="ws-sec tight" id="ws-v1">
        <div class="ws-wrap ws-essay-grid">
          <div class="ws-essay-n">01</div>
          <div class="ws-essay-body">
            <h2 class="ws-h2" data-rv>${L('The invisible building', 'المبنى غير المرئي')}</h2>
            <p class="ws-body ws-drop" data-rv>${L('A residential tower can house two hundred people, a dozen businesses and decades of history — and still have no single place where its information lives. Permits sit in archives. Contributions are tracked in notebooks. A leaking pipe becomes a chain of phone calls. Each party holds a fragment, and the building itself is never the subject.', 'قد يضم برج سكني مئتي شخص وعشرات المحال وعقوداً من التاريخ، ومع ذلك لا يوجد مكان واحد تُحفظ فيه معلوماته. الرخص في الأرشيف، والمساهمات في دفاتر، وتسريب الماء يتحوّل إلى سلسلة من المكالمات. كل طرف يملك جزءاً، ولا يكون المبنى نفسه محور الاهتمام أبداً.')}</p>
            ${scatterDiagram()}
          </div>
        </div>
      </section>
      <section class="ws-sec tight alt" id="ws-v2">
        <div class="ws-wrap ws-essay-grid">
          <div class="ws-essay-n">02</div>
          <div class="ws-essay-body ws-essay-split">
            <div>
              <h2 class="ws-h2" data-rv>${L('A persistent identity', 'هوية دائمة')}</h2>
              <p class="ws-body" data-rv>${L('BENA starts by giving the building a stable reference — the BENA ID — and extends it inward to floors and units. Around that core, people take on roles, and services attach to the exact place they are delivered. The identity outlives any owner, tenant or contract; it is the thread that keeps the history together.', 'تبدأ BENA بمنح المبنى مرجعاً ثابتاً — معرّف BENA — ثم تمدّه إلى الطوابق والوحدات. حول هذه النواة يتولى الأشخاص أدوارهم، وترتبط الخدمات بالمكان الدقيق الذي تُقدَّم فيه. تبقى الهوية بعد تغيّر المالكين والمستأجرين والعقود؛ فهي الخيط الذي يحفظ تاريخ المبنى متصلاً.')}</p>
              <blockquote class="ws-quote" data-rv>${L('“A building that can be identified can be cared for.”', '«المبنى الذي يمكن التعرّف عليه، يمكن العناية به.»')}</blockquote>
            </div>
            <figure class="ws-fig ws-rings-fig" data-rv style="--d:.1s">${ringsDiagram()}<figcaption>${L('Layers of a building identity, from structure to services.', 'طبقات هوية المبنى، من البنية إلى الخدمات.')}</figcaption></figure>
          </div>
        </div>
      </section>
      <section class="ws-sec tight" id="ws-v3">
        <div class="ws-wrap ws-essay-grid">
          <div class="ws-essay-n">03</div>
          <div class="ws-essay-body">
            <h2 class="ws-h2" data-rv>${L('What the identity links', 'ما الذي تربطه الهوية')}</h2>
            <p class="ws-body" data-rv>${L('Six kinds of information meet at the BENA ID. Each keeps its own source and verification status, so nobody has to guess what is confirmed and what is self-reported. Municipal references are a designed capability: in this prototype they are sample values, ready to connect to official systems when an authority chooses to.', 'تلتقي ستة أنواع من المعلومات عند معرّف BENA، ويحتفظ كلٌّ منها بمصدره وحالة التحقق منه، فلا حاجة للتخمين بين ما هو مؤكد وما هو مُصرَّح به ذاتياً. المراجع البلدية قدرة مصمَّمة: في هذا النموذج هي قيم نموذجية، جاهزة للربط مع الأنظمة الرسمية عندما تقرر الجهة المختصة ذلك.')}</p>
            ${linksDiagram()}
          </div>
        </div>
      </section>
      <section class="ws-sec tight alt" id="ws-v4">
        <div class="ws-wrap ws-essay-grid">
          <div class="ws-essay-n">04</div>
          <div class="ws-essay-body">
            <h2 class="ws-h2" data-rv>${L('Principles', 'المبادئ')}</h2>
            <div class="ws-princ">
              ${[
                [L('Reference, not registry', 'مرجع لا سجل'), L('BENA identifies and connects. It does not replace official registries or decide legal questions.', 'تعرّف BENA المباني وتربطها، ولا تحل محل السجلات الرسمية ولا تفصل في المسائل القانونية.')],
                [L('Provenance, always visible', 'المصدر ظاهر دائماً'), L('Every field carries its origin: official source, user-submitted, pending verification or demo data.', 'تحمل كل معلومة مصدرها: مصدر رسمي، أو إدخال مستخدم، أو بانتظار التحقق، أو بيانات عرض.')],
                [L('Roles and consent', 'الأدوار والموافقة'), L('People see what their role allows. Vacant units are never listed without the owner’s authorisation.', 'يرى كل شخص ما يسمح به دوره، ولا تُعرض الوحدات الشاغرة دون تفويض من المالك.')],
                [L('Designed to connect', 'مصمَّمة للربط'), L('Open, documented interfaces so municipalities and partners can link their systems — on their terms.', 'واجهات مفتوحة وموثّقة تتيح للبلديات والشركاء ربط أنظمتهم — وفق شروطهم.')],
              ].map(([t, d], i) => `<div class="ws-princ-item" data-rv style="--d:${i * 0.06}s"><span class="ws-num">${String(i + 1).padStart(2, '0')}</span><h3 class="ws-h3">${t}</h3><p>${d}</p></div>`).join('')}
            </div>
          </div>
        </div>
      </section>
      <section class="ws-sec tight ws-dark" id="ws-v5">
        <div class="ws-wrap ws-essay-grid">
          <div class="ws-essay-n">05</div>
          <div class="ws-essay-body">
            <h2 class="ws-h2" data-rv>${L('What BENA is not', 'ما ليست عليه BENA')}</h2>
            <p class="ws-body" data-rv>${L('Clarity about limits is part of the design. This website and its demo are a vision prototype.', 'الوضوح بشأن الحدود جزء من التصميم. هذا الموقع وعرضه التجريبي نموذج أولي لرؤية.')}</p>
            <div class="ws-nots">
              ${[
                [L('Not an official registry', 'ليست سجلاً رسمياً'), L('BENA is a prototype. It is not a national or municipal register of buildings.', 'BENA نموذج أولي، وليست سجلاً وطنياً أو بلدياً للمباني.')],
                [L('Not proof of ownership', 'ليست إثباتاً للملكية'), L('A BENA ID is a digital reference. Ownership is established only by records held by the competent authorities.', 'معرّف BENA مرجع رقمي. تثبت الملكية فقط بالسجلات التي تحفظها الجهات المختصة.')],
                [L('Not connected to any municipality', 'غير متصلة بأي بلدية'), L('Municipal integration is designed, not live. All references shown are fictional samples.', 'الربط مع البلديات مصمَّم وليس فعلياً. جميع المراجع المعروضة نماذج خيالية.')],
              ].map(([t, d], i) => `<div class="ws-not" data-rv style="--d:${i * 0.06}s"><span class="ws-not-ic">${icon('x')}</span><div><h3>${t}</h3><p>${d}</p></div></div>`).join('')}
            </div>
          </div>
        </div>
      </section>
    </article>
    ${S.ctaBand({ title: L('See the vision as a working prototype.', 'شاهد الرؤية كنموذج أولي يعمل.') })}`;

  /* ================================================================== */
  /* SOLUTIONS                                                           */
  /* ================================================================== */
  const frame = (title, body, cls = '') => `<div class="ws-ui ${cls}"><div class="ws-ui-bar"><i></i><i></i><i></i><span>${title}</span></div><div class="ws-ui-body">${body}</div></div>`;
  const bar = (pct, tone = '') => `<span class="ws-bar ${tone}"><i style="width:${pct}%"></i></span>`;

  const visuals = {
    municipalities: () => {
      const map = B.map.render({ id: 'ws-sol-map', mode: 'verification', layers: { parcels: false }, selected: BID, static: true, legend: false, badge: false, height: '100%' });
      return `<div class="ws-vis-muni">${frame(L('Municipality · Registry overview', 'البلدية · نظرة على السجل'), `<div class="ws-vm-map">${map}</div>`)}
        <div class="ws-float ws-vm-kpi"><span class="ws-fk">${L('Verified records', 'سجلات موثّقة')}</span><b>83.5%</b>${bar(83.5)}<small>${L('Sample area · 14,862 buildings', 'منطقة نموذجية · 14,862 مبنى')}</small></div>
        <div class="ws-float ws-vm-q"><span class="ws-fk">${L('Verification queue', 'قائمة التحقق')}</span>
          <div class="ws-vq-row">${ui.prov('pending')}<span>${S.id('RR-2026-0418')}</span></div>
          <div class="ws-vq-row">${ui.prov('submitted')}<span>${S.id('RR-2026-0416')}</span></div></div></div>`;
    },
    owners: () => frame(L('Owner · My properties', 'المالك · عقاراتي'), `
      <div class="ws-vo-head"><div><span class="ws-fk">${L('Rent collected · Nov', 'الإيجار المحصّل · ت٢')}</span><b>${B.money(9600)}</b></div><div><span class="ws-fk">${L('Units', 'الوحدات')}</span><b>4</b></div><div><span class="ws-fk">${L('Open requests', 'طلبات مفتوحة')}</span><b>2</b></div></div>
      ${[
        [L('Apartment 803', 'شقة 803'), L('Al-Masyoun Residence Tower', 'برج الماصيون السكني'), ui.status('expiring'), B.money(3200) + L('/mo', '/شهر')],
        [L('Apartment 1102', 'شقة 1102'), L('Vacant · not listed — awaiting your authorisation', 'شاغرة · غير معروضة — بانتظار تفويضك'), ui.status('notListed'), '—'],
        [L('Apartment 704', 'شقة 704'), L('Al-Masyoun Residence Tower', 'برج الماصيون السكني'), ui.status('active'), B.money(2900) + L('/mo', '/شهر')],
      ].map(([t, s, st, v]) => `<div class="ws-vrow"><span class="ws-vrow-ic">${icon('key')}</span><div class="ws-vrow-b"><b>${t}</b><small>${s}</small></div><div class="ws-vrow-e">${st}<small>${v}</small></div></div>`).join('')}`),
    'property-managers': () => frame(L('Manager · Portfolio', 'المدير · المحفظة'), `
      <div class="ws-vt"><div class="ws-vt-h"><span>${L('Building', 'المبنى')}</span><span>${L('Occupancy', 'الإشغال')}</span><span>${L('Collected', 'المحصّل')}</span></div>
      ${[
        [L('Al-Masyoun Residence Tower', 'برج الماصيون السكني'), 92, '96%'],
        [L('Masyoun Heights', 'مرتفعات الماصيون'), 81, '88%'],
        [L('Irsal Plaza', 'بلازا الإرسال'), 74, '91%'],
        [L('Ein Munjed Residences', 'مساكن عين منجد'), 88, '79%'],
      ].map(([n, o, c]) => `<div class="ws-vt-r"><span class="ws-vt-n">${icon('building')}${n}</span><span class="ws-vt-o">${bar(o)}<small>${o}%</small></span><span class="ws-vt-c">${c}</span></div>`).join('')}</div>
      <div class="ws-vm-foot"><span>${ui.status('expiring')}</span><span>${L('6 leases renew in the next 60 days', '6 عقود تتجدد خلال 60 يوماً')}</span></div>`),
    facility: () => frame(L('Facility · Assets', 'المرافق · الأصول'), `
      <div class="ws-sim">${icon('activity')}${L('Simulated preview — not a live integration', 'معاينة محاكاة — ليست تكاملاً حياً')}</div>
      <div class="ws-va">
        ${[
          ['elevator', L('Elevator B', 'المصعد ب'), 'warning', L('Stops between 9–10', 'يتوقف بين 9 و10')],
          ['pump', L('Water pumps', 'مضخات المياه'), 'online', L('2.4 bar · normal', '2.4 بار · طبيعي')],
          ['generator', L('Generator', 'المولّد'), 'online', L('Test run 1 Dec', 'تشغيل تجريبي 1 ك١')],
          ['tank', L('Rooftop tanks', 'خزانات السطح'), 'upcoming', L('Cleaning due 3 Dec', 'التنظيف في 3 ك١')],
        ].map(([ic, n, st, s]) => `<div class="ws-va-t"><div class="ws-va-top"><span class="ws-va-ic">${icon(ic)}</span>${ui.status(st)}</div><b>${n}</b><small>${s}</small></div>`).join('')}
      </div>`),
    committees: () => frame(L('Committee · Votes', 'اللجنة · التصويت'), `
      <div class="ws-vc-top">${ui.status('legal')}<span class="ws-fk">${L('Al-Masyoun Tower Owners’ Association', 'جمعية مالكي برج الماصيون')}</span></div>
      <div class="ws-vc-q"><b>${L('Modernise Elevator B', 'تحديث المصعد ب')}</b><small>${L('Quote from LiftLine · ₪48,000 · closes 4 Dec', 'عرض لفت لاين · 48,000 ₪ · يُغلق 4 ك١')}</small></div>
      ${[[L('In favour', 'مع'), 62, ''], [L('Against', 'ضد'), 14, 'navy'], [L('Not yet voted', 'لم يصوّت بعد'), 24, 'grey']].map(([t, p, tone]) => `<div class="ws-vc-opt"><div><span>${t}</span><b>${p}%</b></div>${bar(p, tone)}</div>`).join('')}
      <div class="ws-vm-foot"><span>${icon('wallet')}</span><span>${L('Maintenance fund: ₪31,240 · 91% of contributions paid', 'صندوق الصيانة: 31,240 ₪ · 91% من المساهمات مدفوعة')}</span></div>`),
    residents: () => `<div class="ws-phone"><div class="ws-phone-in">
      <div class="ws-ph-top"><span>9:41</span><span class="ws-ph-notch"></span><span>${icon('wifi')}</span></div>
      <div class="ws-ph-h"><small>${L('Good evening', 'مساء الخير')}</small><b>${L('Lina', 'لينا')}</b></div>
      <div class="ws-ph-unit">${icon('home')}<div><b>${L('Apartment 803', 'شقة 803')}</b><small>${L('Al-Masyoun Residence Tower', 'برج الماصيون السكني')}</small></div></div>
      <div class="ws-ph-card"><div class="ws-ph-row"><b>${L('Kitchen sink leak', 'تسريب مغسلة المطبخ')}</b>${ui.status('inProgress')}</div><small>${S.id('MR-24518')} · ${L('Visit Thu 26 Nov', 'زيارة الخميس 26 ت٢')}</small>
        <div class="ws-ph-steps">${[1, 1, 1, 0].map((d, i) => `<i class="${d ? 'on' : ''}"></i>`).join('')}</div>
        <div class="ws-ph-sl">${L('Step 3 of 4 · Technician assigned', 'الخطوة 3 من 4 · تم إسناد فني')}</div></div>
      <div class="ws-ph-due"><div><small>${L('Service charge · Dec', 'رسوم الخدمات · ك١')}</small><b>${B.money(180)}</b></div><span class="ws-ph-pay">${L('Pay', 'ادفع')}</span></div>
      <div class="ws-ph-tabs">${['home', 'wrench', 'wallet', 'bell'].map((n, i) => `<span class="${i === 0 ? 'on' : ''}">${icon(n)}</span>`).join('')}</div>
    </div></div>`,
    providers: () => frame(L('Provider · Job inbox', 'المزوّد · صندوق الطلبات'), `
      ${[
        [L('Kitchen sink leaking under cabinet', 'تسريب تحت مغسلة المطبخ'), L('Al-Masyoun Tower · Unit 803', 'برج الماصيون · وحدة 803'), ui.status('inProgress'), L('Visit Thu 26 Nov · Ali', 'زيارة الخميس 26 ت٢ · علي')],
        [L('Quarterly rooftop tank cleaning', 'التنظيف الربعي لخزانات السطح'), L('Al-Masyoun Tower · common areas', 'برج الماصيون · المناطق المشتركة'), ui.status('quoted'), L('Quote sent · ₪1,850', 'أُرسل العرض · 1,850 ₪')],
      ].map(([t, s, st, m]) => `<div class="ws-vj"><div class="ws-vj-top"><b>${t}</b>${st}</div><small>${icon('building')}${s}</small><div class="ws-vj-m">${icon('calendar')}${m}</div></div>`).join('')}
      <div class="ws-vm-foot"><span class="ws-stars">${ui.stars(4.8)}</span><span>${L('4.8 average · 126 completed jobs (sample)', 'متوسط 4.8 · 126 مهمة منجزة (نموذج)')}</span></div>`),
  };

  const solContent = {
    municipalities: {
      h: L('See the built environment as it really is.', 'رؤية البيئة العمرانية كما هي فعلاً.'),
      p: L('A living register view of buildings and units, with data quality you can measure. Records are matched to your own references — in this prototype, sample ones — with verification workflows and clear provenance.', 'عرض حيّ لسجل المباني والوحدات مع جودة بيانات قابلة للقياس. تُطابق السجلات مع مراجعكم الخاصة — وهي في هذا النموذج مراجع نموذجية — مع مسارات تحقق ومصادر واضحة.'),
      caps: [[L('Coverage and data-quality map', 'خريطة التغطية وجودة البيانات'), L('See verified, pending and draft records by district.', 'السجلات الموثّقة والمعلّقة والمسودات حسب الحي.')],
        [L('Verification queue', 'قائمة التحقق'), L('Review records submitted by owners and committees.', 'مراجعة السجلات المقدّمة من المالكين واللجان.')],
        [L('Reference matching — designed to connect', 'مطابقة المراجع — مصمَّمة للربط'), L('Match identities to GIS parcels and permits when authorised.', 'مطابقة الهويات مع القطع والرخص عند التفويض.')],
        [L('Area insights', 'مؤشرات المناطق'), L('Occupancy, building age and service demand for planning.', 'الإشغال وعمر المباني والطلب على الخدمات لأغراض التخطيط.')]],
      cta: L('Opens the municipality workspace · sample data', 'يفتح مساحة عمل البلدية · بيانات نموذجية'),
    },
    owners: {
      h: L('Your property, finally in one place.', 'عقارك، أخيراً في مكان واحد.'),
      p: L('Units, tenants, leases, payments and documents — organised around the building identity, so nothing depends on memory or paper.', 'الوحدات والمستأجرون والعقود والدفعات والمستندات — منظّمة حول هوية المبنى، فلا شيء يعتمد على الذاكرة أو الورق.'),
      caps: [[L('Portfolio at a glance', 'المحفظة بنظرة واحدة'), L('Every unit with its status, tenant and lease.', 'كل وحدة مع حالتها ومستأجرها وعقدها.')],
        [L('Rent and service charges', 'الإيجار ورسوم الخدمات'), L('Track what is paid, due and overdue.', 'متابعة المدفوع والمستحق والمتأخر.')],
        [L('Documents per unit', 'مستندات لكل وحدة'), L('Contracts, permits and receipts where they belong.', 'العقود والرخص والإيصالات في مكانها الصحيح.')],
        [L('You authorise every listing', 'أنت من يفوّض كل عرض'), L('Vacant units are never listed automatically.', 'لا تُعرض الوحدات الشاغرة تلقائياً أبداً.')]],
      cta: L('Opens the owner workspace · sample data', 'يفتح مساحة عمل المالك · بيانات نموذجية'),
    },
    'property-managers': {
      h: L('Run every building from one calm workspace.', 'أدِر كل مبنى من مساحة عمل واحدة هادئة.'),
      p: L('Portfolio dashboards, leases, collections and work orders — with each building’s identity as the shared reference between your team, owners and residents.', 'لوحات المحفظة والعقود والتحصيل وأوامر العمل — وهوية كل مبنى مرجع مشترك بين فريقك والمالكين والسكان.'),
      caps: [[L('Portfolio dashboard', 'لوحة المحفظة'), L('Occupancy, collections and arrears across buildings.', 'الإشغال والتحصيل والمتأخرات عبر المباني.')],
        [L('Leases and renewals', 'العقود والتجديد'), L('Expiry alerts, amendments and notices.', 'تنبيهات الانتهاء والتعديلات والإشعارات.')],
        [L('Work orders', 'أوامر العمل'), L('Route requests to facility teams and providers.', 'توجيه الطلبات إلى فرق المرافق والمزوّدين.')],
        [L('Owner reporting', 'تقارير المالكين'), L('Clear monthly statements per owner.', 'كشوف شهرية واضحة لكل مالك.')]],
      cta: L('Opens the manager workspace · sample data', 'يفتح مساحة عمل المدير · بيانات نموذجية'),
    },
    facility: {
      h: L('Keep assets healthy before they fail.', 'حافظ على سلامة الأصول قبل أن تتعطل.'),
      p: L('An asset register per building, preventive maintenance plans and dispatch — with sensor views shown as a simulated preview, ready for real integrations later.', 'سجل أصول لكل مبنى وخطط صيانة وقائية وتوزيع للمهام — مع عرض الحساسات كمعاينة محاكاة، جاهزة للتكامل الفعلي لاحقاً.'),
      caps: [[L('Asset register', 'سجل الأصول'), L('Elevators, pumps, generators and tanks per building.', 'المصاعد والمضخات والمولدات والخزانات لكل مبنى.')],
        [L('Preventive plans', 'خطط وقائية'), L('Schedules that turn into work orders automatically.', 'جداول تتحول إلى أوامر عمل تلقائياً.')],
        [L('Dispatch and SLAs', 'التوزيع ومستويات الخدمة'), L('Assign technicians and track response times.', 'إسناد الفنيين ومتابعة أزمنة الاستجابة.')],
        [L('Monitoring — simulated preview', 'المراقبة — معاينة محاكاة'), L('No live IoT in the prototype; readings are generated.', 'لا يوجد ربط حي بالحساسات في النموذج؛ القراءات مولّدة.')]],
      cta: L('Opens the facility workspace · sample data', 'يفتح مساحة عمل المرافق · بيانات نموذجية'),
    },
    committees: {
      h: L('Decide together, with everything on record.', 'قرّروا معاً، وكل شيء موثّق.'),
      p: L('Votes, contributions, spending and resident requests in one transparent place. Formally documented owners’ associations and informal committees are always clearly distinguished.', 'التصويت والمساهمات والإنفاق وطلبات السكان في مكان واحد شفاف، مع تمييز واضح دائماً بين جمعيات المالكين الموثّقة رسمياً واللجان غير الرسمية.'),
      caps: [[L('Formal or informal — stated clearly', 'رسمية أو غير رسمية — بوضوح'), L('BENA never assigns legal status automatically.', 'لا تمنح BENA أي صفة قانونية تلقائياً.')],
        [L('Votes and assemblies', 'التصويت والهيئات العامة'), L('Proposals, quorum and results on record.', 'المقترحات والنصاب والنتائج موثّقة.')],
        [L('Contributions and spending', 'المساهمات والإنفاق'), L('Every shekel in and out, visible to members.', 'كل شيكل وارد وصادر، ظاهر للأعضاء.')],
        [L('Resident requests', 'طلبات السكان'), L('Approve repairs and choose providers together.', 'اعتماد الإصلاحات واختيار المزوّدين معاً.')]],
      cta: L('Opens the committee workspace · sample data', 'يفتح مساحة عمل اللجنة · بيانات نموذجية'),
    },
    residents: {
      h: L('Everything about your home, in your pocket.', 'كل ما يخص منزلك، في جيبك.'),
      p: L('Report a problem in seconds, follow the repair step by step, pay service charges and take part in building decisions — from a simple mobile app.', 'أبلِغ عن مشكلة في ثوانٍ، وتابع الإصلاح خطوة بخطوة، وادفع رسوم الخدمات، وشارك في قرارات المبنى — من تطبيق هاتف بسيط.'),
      caps: [[L('Report with photos', 'أبلِغ مع الصور'), L('Requests go straight to the right people.', 'تصل الطلبات مباشرة إلى الأشخاص المعنيين.')],
        [L('Track every repair', 'تابع كل إصلاح'), L('From reported to done, with visit times.', 'من البلاغ حتى الإنجاز، مع مواعيد الزيارات.')],
        [L('Pay service charges', 'ادفع رسوم الخدمات'), L('See what is due and keep your receipts.', 'اعرف المستحق واحتفظ بإيصالاتك.')],
        [L('Notices and votes', 'الإشعارات والتصويت'), L('Stay informed and have your say.', 'ابقَ على اطلاع وأبدِ رأيك.')]],
      cta: L('Opens the resident mobile app · sample data', 'يفتح تطبيق السكان · بيانات نموذجية'),
    },
    providers: {
      h: L('Qualified work from verified buildings.', 'عمل مؤهّل من مبانٍ موثّقة.'),
      p: L('Receive requests with full building context, send quotes, schedule technicians and build a reputation tied to work you have actually completed.', 'استقبل الطلبات مع سياق المبنى الكامل، وأرسل عروض الأسعار، وجدول الفنيين، وابنِ سمعة مرتبطة بأعمال أنجزتها فعلاً.'),
      caps: [[L('Jobs with context', 'طلبات مع السياق'), L('Building, unit, history and access notes.', 'المبنى والوحدة والسجل وملاحظات الدخول.')],
        [L('Quotes and scheduling', 'العروض والجدولة'), L('Send quotes and plan visits in one place.', 'أرسل العروض وخطط الزيارات في مكان واحد.')],
        [L('Ratings that mean something', 'تقييمات ذات معنى'), L('Only completed jobs can be reviewed.', 'لا تُقيَّم إلا الأعمال المنجزة.')],
        [L('Marketplace presence', 'حضور في سوق الخدمات'), L('Be found by committees and managers.', 'ليجدك أعضاء اللجان والمديرون.')]],
      cta: L('Opens the provider workspace · sample data', 'يفتح مساحة عمل المزوّد · بيانات نموذجية'),
    },
  };

  S.render.solutions = () => `
    ${S.pageHero({
      eyebrow: L('Solutions', 'الحلول'),
      title: L('One building identity. Seven ways to work with it.', 'هوية مبنى واحدة. سبع طرق للعمل بها.'),
      lead: L('Every group around a building gets a workspace designed for what it actually does — all of them reading from, and writing to, the same trusted identity.', 'تحصل كل فئة حول المبنى على مساحة عمل مصمَّمة لما تقوم به فعلاً — وجميعها تقرأ من الهوية الموثوقة ذاتها وتكتب فيها.'),
    })}
    <div class="ws-segnav"><div class="ws-wrap"><div class="ws-segnav-in">${S.segments.map((sg, i) => `<button data-act="wsScroll" data-arg="ws-sec-${sg.id}"><span>${String(i + 1).padStart(2, '0')}</span>${tx(sg.name)}</button>`).join('')}</div></div></div>
    ${S.segments.map((sg, i) => {
      const c = solContent[sg.id];
      return `<section class="ws-sec ws-sol ${i % 2 ? 'alt ws-sol-rev' : ''}" id="ws-sec-${sg.id}">
        <div class="ws-wrap ws-sol-grid">
          <div class="ws-sol-text">
            <div class="ws-sol-k"><span class="ws-num">${String(i + 1).padStart(2, '0')}</span><span class="ws-sol-seg">${icon(sg.icon)}${tx(sg.name)}</span></div>
            <h2 class="ws-h2" data-rv>${c.h}</h2>
            <p class="ws-body" data-rv>${c.p}</p>
            <ul class="ws-caps">${c.caps.map(([t, d], k) => `<li data-rv style="--d:${k * 0.05}s"><span class="ws-cap-n">${icon('check')}</span><div><b>${t}</b><span>${d}</span></div></li>`).join('')}</ul>
            <div class="ws-sol-cta">${S.btn(L('See it in the demo', 'شاهده في العرض التجريبي'), { go: sg.demo, kind: 'dark', end: 'arrowRight' })}<span class="ws-sol-demo">${c.cta}</span></div>
          </div>
          <div class="ws-sol-vis" data-rv style="--d:.1s">${visuals[sg.id]()}</div>
        </div>
      </section>`;
    }).join('')}
    ${S.ctaBand({ title: L('Not sure where to start? We’ll walk you through the workspace that fits.', 'لا تعرف من أين تبدأ؟ سنرافقك في مساحة العمل الأنسب لك.') })}`;

  /* ================================================================== */
  /* BUILDING IDENTITY                                                   */
  /* ================================================================== */
  const bld = () => B.data.building(BID);
  const unitsOn = (f) => B.data.unitsOf(BID).filter((u) => u.floor === f);
  const kOf = (u) => (u.floor === 0 ? (u.number === 'G01' ? 1 : 2) : +String(u.number).slice(-2));

  const idCardBig = () => {
    const b = bld();
    const rows = [
      [L('Municipal reference', 'المرجع البلدي'), `${S.id(b.gis)} <span class="ws-small">${L('sample', 'نموذج')}</span>`, 'official'],
      [L('Parcel', 'القطعة'), L('Basin 12 · Parcel 87', 'حوض 12 · قطعة 87'), 'official'],
      [L('Building permit', 'رخصة البناء'), S.id(b.permit), 'official'],
      [L('Floors · units', 'الطوابق · الوحدات'), L(`${b.floors} floors · ${b.units} units`, `${b.floors} طابقاً · ${b.units} وحدة`), 'official'],
      [L('Year completed', 'سنة الإنجاز'), String(b.year), 'submitted'],
      [L('Parking spaces', 'مواقف السيارات'), String(b.parking), 'pending'],
    ];
    return `<div class="ws-idbig">
      <div class="ws-idbig-top">${B.logo(30)}<div><span class="ws-idc-k">${L('BENA ID', 'معرّف BENA')}</span><div class="ws-idbig-id">${S.id(BID)}</div></div>${ui.prov('demo')}</div>
      <div class="ws-idbig-name">${tx(b.name)}</div>
      <div class="ws-idbig-addr">${tx(b.street)} · ${L('Al-Masyoun, Ramallah — sample location', 'الماصيون، رام الله — موقع نموذجي')}</div>
      <dl class="ws-idbig-rows">${rows.map(([k, v, p]) => `<div><dt>${k}</dt><dd><span>${v}</span>${ui.prov(p)}</dd></div>`).join('')}</dl>
      <div class="ws-idbig-foot"><span class="ws-idc-qr">${B.art.qr(142)}</span><p>${L('A digital reference identity. It does not prove, create or transfer ownership.', 'هوية مرجعية رقمية؛ لا تُثبت الملكية ولا تُنشئها ولا تنقلها.')}</p></div>
    </div>`;
  };

  const floorPanel = (f, uid) => {
    const units = unitsOn(f);
    const label = f === 0 ? L('Ground floor', 'الطابق الأرضي') : L(`Floor ${f}`, `الطابق ${f}`);
    const tile = (u) => {
      if (!u) return '';
      const kind = tx(B.data.unitKinds[u.kind] || u.kind);
      return `<button class="ws-unit ${u.id === uid ? 'on' : ''} st-${u.status}" data-act="wsUnit" data-arg="${u.id}" aria-pressed="${u.id === uid}">
        <span class="ws-unit-n">${esc(u.number)}</span><span class="ws-unit-k">${kind} · ${u.area} ${L('m²', 'م²')}</span><span class="ws-unit-s"><i></i>${ui.statusLabel(u.status)}</span></button>`;
    };
    const by = (k) => units.find((u) => kOf(u) === k);
    const plan = f === 0
      ? `<div class="ws-plan g">${tile(by(1))}<div class="ws-plan-core">${icon('door')}<span>${L('Lobby · lifts', 'المدخل · المصاعد')}</span></div>${tile(by(2))}</div>`
      : `<div class="ws-plan">${tile(by(1))}${tile(by(2))}<div class="ws-plan-core">${icon('elevator')}<span>${L('Core · lifts & stairs', 'النواة · المصاعد والدرج')}</span></div>${tile(by(3))}${tile(by(4))}</div>`;
    return `<div class="ws-floorp">
      <div class="ws-floorp-h"><div><span class="ws-fk">${L('Selected floor', 'الطابق المحدد')}</span><h3>${label}</h3></div><div class="ws-floorp-nav">
        <button class="ws-icbtn" data-act="wsFloor" data-arg="${Math.max(0, f - 1)}" ${f === 0 ? 'disabled' : ''} aria-label="${esc(L('Floor below', 'الطابق الأدنى'))}">${icon('chevD')}</button>
        <button class="ws-icbtn" data-act="wsFloor" data-arg="${Math.min(S.towerFloors - 1, f + 1)}" ${f === S.towerFloors - 1 ? 'disabled' : ''} aria-label="${esc(L('Floor above', 'الطابق الأعلى'))}">${icon('chevU')}</button></div></div>
      ${plan}
      <div class="ws-legend">${['ownerOccupied', 'rented', 'vacant', 'maintenance'].map((s) => `<span class="st-${s}"><i></i>${ui.statusLabel(s)}</span>`).join('')}</div>
    </div>`;
  };

  const unitPanel = (uid) => {
    const u = uid && B.data.unit(uid);
    if (!u) return `<div class="ws-unitp is-empty">${icon('grid')}<b>${L('Select a unit', 'اختر وحدة')}</b><p>${L('Pick a unit on the floor plan to see its identity record.', 'اختر وحدة من مخطط الطابق لعرض سجل هويتها.')}</p></div>`;
    const kind = tx(B.data.unitKinds[u.kind] || u.kind);
    const lease = B.data.leaseOfUnit && B.data.leaseOfUnit(u.id);
    const rows = [
      [L('Floor', 'الطابق'), u.floor === 0 ? L('Ground', 'الأرضي') : String(u.floor), 'official'],
      [L('Area', 'المساحة'), `${u.area} ${L('m²', 'م²')}`, 'official'],
      u.beds ? [L('Bedrooms', 'غرف النوم'), String(u.beds), 'submitted'] : null,
      [L('Occupancy', 'الإشغال'), ui.statusLabel(u.status), 'submitted'],
      lease && u.status === 'rented' ? [L('Lease', 'العقد'), lease.status === 'expiring' ? L('On record · expiring soon', 'مسجّل · ينتهي قريباً') : L('On record', 'مسجّل'), 'submitted'] : null,
      [L('Service charge', 'رسوم الخدمات'), B.money(u.charge || 180) + L(' / month', ' / شهرياً'), 'demo'],
    ].filter(Boolean);
    return `<div class="ws-unitp">
      <div class="ws-unitp-h"><div><span class="ws-fk">${kind}</span><h3>${kind} ${esc(u.number)}</h3></div>${ui.status(u.status)}</div>
      <div class="ws-unitp-id">${S.id(u.id)}</div>
      <dl class="ws-unitp-rows">${rows.map(([k, v, p]) => `<div><dt>${k}</dt><dd><span>${v}</span>${ui.prov(p)}</dd></div>`).join('')}</dl>
      <div class="ws-unitp-note">${icon('lock')}<span>${L('Owner and tenant identities are visible only to authorised roles.', 'هويات المالك والمستأجر لا تظهر إلا للأدوار المفوّضة.')}</span></div>
      ${u.status === 'vacant' ? `<div class="ws-unitp-note warn">${icon('info')}<span>${L('Vacant units are never listed automatically — the owner must authorise a listing.', 'لا تُعرض الوحدات الشاغرة تلقائياً — يجب أن يفوّض المالك عرضها.')}</span></div>` : ''}
    </div>`;
  };

  const explorer = () => {
    const f = B.get('ws:floor', 8);
    let uid = B.get('ws:unit', `${BID}-803`);
    const u = uid && B.data.unit(uid);
    if (!u || u.floor !== f) uid = null;
    const sel = u && u.floor === f ? `${f}-${kOf(u)}` : null;
    return `<div class="ws-explorer" id="ws-explorer">
      <div class="ws-ex-tower">
        <div class="ws-ex-hint">${icon('target')}<span>${L('Select a floor on the building', 'اختر طابقاً على المبنى')}</span></div>
        ${S.tower({ theme: 'stone', interactive: true, selFloor: f, selUnit: sel, idp: 'idt' })}
        <div class="ws-ex-cap">${tx(bld().name)} · ${L('illustrative model', 'نموذج توضيحي')}</div>
      </div>
      <div class="ws-ex-side">${floorPanel(f, uid)}${unitPanel(uid)}</div>
    </div>`;
  };
  const patchExplorer = () => { const el = document.getElementById('ws-explorer'); if (el) el.outerHTML = explorer(); };
  B.act.wsFloor = (f) => { B.set('ws:floor', +f, false); const u = B.data.unit(B.get('ws:unit', '')); if (!u || u.floor !== +f) { const first = unitsOn(+f)[0]; B.set('ws:unit', first ? first.id : null, false); } patchExplorer(); };
  B.act.wsUnit = (id) => { B.set('ws:unit', id, false); patchExplorer(); };

  const compare = () => {
    const rows = [
      [L('What it is', 'ما هو'), L('A digital reference identity for a building and its units.', 'هوية مرجعية رقمية للمبنى ووحداته.'), L('The legal record of who owns a property and what rights apply.', 'السجل القانوني لمالك العقار والحقوق المترتبة عليه.')],
      [L('Who holds it', 'من يحفظه'), L('BENA — shown here as a prototype.', 'BENA — معروضة هنا كنموذج أولي.'), L('The competent land and property authorities.', 'الجهات المختصة بالأراضي والعقارات.')],
      [L('Legal effect', 'الأثر القانوني'), L('None. It does not create, prove or transfer rights.', 'لا يوجد. لا تُنشئ حقوقاً ولا تُثبتها ولا تنقلها.'), L('Establishes and protects ownership rights.', 'تُنشئ حقوق الملكية وتحميها.')],
      [L('Used for', 'الاستخدام'), L('Coordinating management, maintenance, services and communication.', 'تنسيق الإدارة والصيانة والخدمات والتواصل.'), L('Sale, inheritance, mortgage and resolving disputes.', 'البيع والإرث والرهن وتسوية النزاعات.')],
      [L('Relationship', 'العلاقة بينهما'), L('May reference official records when authorised — designed to connect.', 'قد تشير إلى السجلات الرسمية عند التفويض — مصمَّمة للربط.'), L('Remain the authoritative source. BENA never replaces them.', 'تبقى المصدر المعتمد، ولا تحل BENA محلها أبداً.')],
    ];
    return `<div class="ws-cmp" data-rv>
      <div class="ws-cmp-col a"><div class="ws-cmp-h">${B.logo(28)}<div><span class="ws-fk">${L('BENA identity', 'هوية BENA')}</span><b>${L('A digital reference', 'مرجع رقمي')}</b></div></div>
        ${rows.map(([k, a]) => `<div class="ws-cmp-r"><span>${k}</span><p>${a}</p></div>`).join('')}</div>
      <div class="ws-cmp-col b"><div class="ws-cmp-h"><span class="ws-cmp-ic">${icon('landmark')}</span><div><span class="ws-fk">${L('Official ownership records', 'سجلات الملكية الرسمية')}</span><b>${L('Held by the competent authorities', 'تحفظها الجهات المختصة')}</b></div></div>
        ${rows.map(([k, , b]) => `<div class="ws-cmp-r"><span>${k}</span><p>${b}</p></div>`).join('')}</div>
    </div>`;
  };

  S.render.identity = () => `
    ${S.pageHero({
      eyebrow: L('Building Identity', 'هوية المبنى'),
      title: L('One building. One identity. Every detail in its place.', 'مبنى واحد. هوية واحدة. وكل تفصيل في مكانه.'),
      lead: L('Explore the identity of a sample building — Al-Masyoun Residence Tower. Select a floor, then a unit, and see how each piece of information carries its source.', 'استكشف هوية مبنى نموذجي — برج الماصيون السكني. اختر طابقاً ثم وحدة، وشاهد كيف تحمل كل معلومة مصدرها.'),
      extra: `<div class="ws-phero-note">${S.honest(L('Sample building and fictional data. The BENA ID is a digital reference, not proof of ownership.', 'مبنى نموذجي وبيانات خيالية. معرّف BENA مرجع رقمي وليس إثباتاً للملكية.'))}</div>`,
      aside: idCardBig(),
    })}
    <section class="ws-sec tight ws-ex-sec">
      <div class="ws-wrap">
        <div class="ws-sec-head"><div>${S.eyebrow(L('Interactive demonstration', 'عرض تفاعلي'))}<h2 class="ws-h2">${L('From building, to floor, to unit.', 'من المبنى، إلى الطابق، إلى الوحدة.')}</h2></div>
          <p class="ws-lead">${L('Each floor and unit has its own sub-identity under the building’s BENA ID, so requests, leases and services always point to the exact place.', 'لكل طابق ووحدة هوية فرعية تحت معرّف BENA للمبنى، فتشير الطلبات والعقود والخدمات دائماً إلى المكان الدقيق.')}</p></div>
        ${explorer()}
      </div>
    </section>
    <section class="ws-sec tight alt">
      <div class="ws-wrap">
        <div class="ws-sec-head"><div>${S.eyebrow(L('Provenance', 'مصدر البيانات'))}<h2 class="ws-h2">${L('Every field says where it came from.', 'كل معلومة تُخبرك من أين جاءت.')}</h2></div>
          <p class="ws-lead">${L('Four markers are used consistently across BENA, so people can tell what is confirmed from what is self-reported.', 'تُستخدم أربع علامات بشكل موحّد في BENA، ليميّز الناس بين ما هو مؤكد وما هو مُصرَّح به ذاتياً.')}</p></div>
        <div class="ws-provgrid">
          ${['official', 'submitted', 'pending', 'demo'].map((k, i) => `<div class="ws-provcard" data-rv style="--d:${i * 0.06}s">${ui.prov(k)}<p>${tx(ui.PROV[k].hint)}</p><small>${[
            L('e.g. municipal reference, parcel, permit (sample values)', 'مثل: المرجع البلدي، القطعة، الرخصة (قيم نموذجية)'),
            L('e.g. occupancy, bedrooms, year completed', 'مثل: الإشغال، غرف النوم، سنة الإنجاز'),
            L('e.g. parking spaces awaiting review', 'مثل: مواقف السيارات بانتظار المراجعة'),
            L('e.g. service charges shown for illustration', 'مثل: رسوم خدمات معروضة للتوضيح'),
          ][i]}</small></div>`).join('')}
        </div>
      </div>
    </section>
    <section class="ws-sec tight">
      <div class="ws-wrap">
        <div class="ws-sec-head"><div>${S.eyebrow(L('Identity is not ownership', 'الهوية ليست ملكية'))}<h2 class="ws-h2">${L('A reference that points to the truth — never a replacement for it.', 'مرجع يشير إلى الحقيقة — ولا يحل محلها أبداً.')}</h2></div>
          <p class="ws-lead">${L('BENA identities help people coordinate around a building. Legal ownership is a separate matter, recorded and protected by the competent authorities.', 'تساعد هويات BENA الناس على التنسيق حول المبنى. أما الملكية القانونية فمسألة منفصلة تسجّلها الجهات المختصة وتحميها.')}</p></div>
        ${compare()}
        <div class="ws-ex-more">${S.more(L('Open the full building profile in the demo', 'افتح ملف المبنى الكامل في العرض التجريبي'), `owner-building-${BID}`)}</div>
      </div>
    </section>
    ${S.ctaBand()}`;

  /* ================================================================== */
  /* CONNECTED ECOSYSTEM                                                 */
  /* ================================================================== */
  const PARTS = [
    { id: 'municipality', icon: 'landmark', name: { en: 'Municipality', ar: 'البلدية' }, d: { en: 'Keeps a verified view of buildings in its area and matches identities to its own references — a designed capability, not connected in this prototype.', ar: 'تحتفظ بصورة موثّقة عن المباني في نطاقها وتطابق الهويات مع مراجعها — قدرة مصمَّمة وغير متصلة في هذا النموذج.' }, demo: 'municipality-home' },
    { id: 'owners', icon: 'key', name: { en: 'Owners', ar: 'المالكون' }, d: { en: 'Manage units, leases and documents, authorise listings and see the full cost history of their property.', ar: 'يديرون الوحدات والعقود والمستندات، ويفوّضون العروض، ويطّلعون على سجل التكاليف الكامل لعقارهم.' }, demo: 'owner-home' },
    { id: 'managers', icon: 'briefcase', name: { en: 'Property managers', ar: 'مديرو العقارات' }, d: { en: 'Run day-to-day operations for owners: leases, collections, notices and work orders.', ar: 'يديرون العمليات اليومية نيابة عن المالكين: العقود والتحصيل والإشعارات وأوامر العمل.' }, demo: 'manager-home' },
    { id: 'facility', icon: 'wrench', name: { en: 'Facility teams', ar: 'فرق المرافق' }, d: { en: 'Maintain assets with preventive plans and dispatch technicians — sensor views are a simulated preview.', ar: 'يصونون الأصول بخطط وقائية ويوزّعون الفنيين — وعرض الحساسات معاينة محاكاة.' }, demo: 'facility-home' },
    { id: 'providers', icon: 'tool', name: { en: 'Service providers', ar: 'مزوّدو الخدمات' }, d: { en: 'Receive qualified jobs with building context, quote, schedule and complete the work.', ar: 'يستقبلون طلبات مؤهّلة مع سياق المبنى، ويقدّمون العروض ويجدولون العمل وينجزونه.' }, demo: 'provider-home' },
    { id: 'committee', icon: 'users', name: { en: 'Building committee', ar: 'لجنة المبنى' }, d: { en: 'Approves repairs, runs votes and manages contributions — formal associations and informal committees are clearly distinguished.', ar: 'تعتمد الإصلاحات وتدير التصويت والمساهمات — مع تمييز واضح بين الجمعيات الرسمية واللجان غير الرسمية.' }, demo: 'committee-home' },
    { id: 'residents', icon: 'home', name: { en: 'Residents & tenants', ar: 'السكان والمستأجرون' }, d: { en: 'Report issues, follow repairs, pay service charges and take part in building decisions.', ar: 'يبلّغون عن المشكلات ويتابعون الإصلاحات ويدفعون رسوم الخدمات ويشاركون في قرارات المبنى.' }, demo: 'm-resident-home' },
    { id: 'buyers', icon: 'search', name: { en: 'Buyers & future tenants', ar: 'المشترون والمستأجرون المحتملون' }, d: { en: 'Discover units that owners have chosen to list, with trustworthy building information.', ar: 'يكتشفون الوحدات التي اختار المالكون عرضها، مع معلومات موثوقة عن المبنى.' }, demo: 'owner-home' },
  ];
  const EDGES = [
    ['municipality', 'owners', { en: 'Permits & sample references', ar: 'رخص ومراجع نموذجية' }],
    ['municipality', 'committee', { en: 'Building notices (designed)', ar: 'إشعارات المبنى (مصمَّمة)' }],
    ['owners', 'managers', { en: 'Management mandate', ar: 'تفويض بالإدارة' }],
    ['owners', 'residents', { en: 'Leases & notices', ar: 'العقود والإشعارات' }],
    ['owners', 'buyers', { en: 'Authorised listings', ar: 'عروض بتفويض المالك' }],
    ['managers', 'facility', { en: 'Work orders', ar: 'أوامر العمل' }],
    ['managers', 'residents', { en: 'Collections & service', ar: 'التحصيل والخدمة' }],
    ['managers', 'buyers', { en: 'Viewings & applications', ar: 'المعاينات والطلبات' }],
    ['facility', 'providers', { en: 'Assigned jobs', ar: 'مهام مُسندة' }],
    ['facility', 'committee', { en: 'Maintenance plans', ar: 'خطط الصيانة' }],
    ['providers', 'committee', { en: 'Quotes & contracts', ar: 'عروض أسعار وعقود' }],
    ['providers', 'residents', { en: 'Visits & completion', ar: 'الزيارات وإنجاز العمل' }],
    ['committee', 'residents', { en: 'Requests, votes & contributions', ar: 'طلبات وتصويت ومساهمات' }],
  ];
  const FLOWS = [
    { id: 'leak', name: { en: 'Leak repair', ar: 'إصلاح تسريب' }, steps: [
      ['residents', { en: 'Resident reports a leak in unit 803, with photos.', ar: 'يبلّغ الساكن عن تسريب في الوحدة 803 مع صور.' }],
      ['committee', { en: 'Committee reviews and approves the repair.', ar: 'تراجع اللجنة الطلب وتعتمد الإصلاح.' }],
      ['providers', { en: 'A verified provider sends a quote — ₪1,850.', ar: 'يرسل مزوّد موثّق عرض سعر — 1,850 ₪.' }],
      ['facility', { en: 'Technician completes the job; the facility team signs it off.', ar: 'ينجز الفني العمل ويعتمده فريق المرافق.' }],
      ['owners', { en: 'Owner sees the cost and the full history on the unit.', ar: 'يرى المالك التكلفة والسجل الكامل على الوحدة.' }],
    ] },
    { id: 'lease', name: { en: 'New lease', ar: 'عقد إيجار جديد' }, steps: [
      ['owners', { en: 'Owner authorises a listing for vacant unit 1102.', ar: 'يفوّض المالك عرض الوحدة الشاغرة 1102.' }],
      ['buyers', { en: 'A prospective tenant finds the unit and books a viewing.', ar: 'يجد مستأجر محتمل الوحدة ويحجز موعد معاينة.' }],
      ['managers', { en: 'The property manager prepares the lease.', ar: 'يُعدّ مدير العقار عقد الإيجار.' }],
      ['residents', { en: 'The new tenant joins the building in the resident app.', ar: 'ينضم المستأجر الجديد إلى المبنى عبر تطبيق السكان.' }],
      ['committee', { en: 'The committee welcomes them to the building directory.', ar: 'ترحّب اللجنة به في دليل المبنى.' }],
    ] },
    { id: 'lift', name: { en: 'Elevator upgrade', ar: 'تحديث المصعد' }, steps: [
      ['facility', { en: 'Facility team flags Elevator B (simulated sensor preview).', ar: 'ينبّه فريق المرافق إلى المصعد ب (معاينة حساسات محاكاة).' }],
      ['committee', { en: 'The committee puts modernisation to a vote.', ar: 'تطرح اللجنة التحديث للتصويت.' }],
      ['owners', { en: 'Owners approve — 62% in favour.', ar: 'يوافق المالكون — 62% مع القرار.' }],
      ['providers', { en: 'A lift specialist is contracted.', ar: 'يُتعاقد مع مزوّد متخصص بالمصاعد.' }],
      ['residents', { en: 'Residents receive the works schedule.', ar: 'يتلقى السكان جدول الأعمال.' }],
    ] },
    { id: 'register', name: { en: 'Building registration', ar: 'تسجيل مبنى' }, steps: [
      ['owners', { en: 'An owner submits the building and its documents.', ar: 'يقدّم مالك بيانات المبنى ومستنداته.' }],
      ['building', { en: 'BENA issues the identity BN-RAM-00142.', ar: 'تُصدر BENA الهوية BN-RAM-00142.' }],
      ['municipality', { en: 'The record is matched to a sample municipal reference — pending verification.', ar: 'يُطابق السجل مع مرجع بلدي نموذجي — بانتظار التحقق.' }],
      ['managers', { en: 'The owner appoints a property manager.', ar: 'يعيّن المالك مديراً للعقار.' }],
      ['residents', { en: 'Residents are invited to the building.', ar: 'يُدعى السكان للانضمام إلى المبنى.' }],
    ] },
  ];

  const ecoGeom = () => {
    const tall = window.innerWidth < 720;
    const W = 1000, H = tall ? 1240 : 640;
    const cx = W / 2, cy = H / 2;
    const rx = tall ? 340 : 410, ry = tall ? 500 : 240;
    const pos = {};
    PARTS.forEach((p, i) => {
      const a = (-90 + i * 45) * (Math.PI / 180);
      let x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
      if (B.isAr()) x = W - x;
      pos[p.id] = [x, y];
    });
    pos.building = [cx, cy];
    return { W, H, pos, tall };
  };

  const constellation = () => {
    const g = ecoGeom();
    const { W, H, pos } = g;
    let svg = `<svg class="ws-eco-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">`;
    svg += `<ellipse cx="${W / 2}" cy="${H / 2}" rx="${g.tall ? 340 : 410}" ry="${g.tall ? 500 : 240}" fill="none" stroke="rgba(255,255,255,.06)" stroke-dasharray="2 6"/>`;
    PARTS.forEach((p) => { const [x, y] = pos[p.id]; svg += `<line class="ws-eco-spoke" data-a="${p.id}" x1="${W / 2}" y1="${H / 2}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; });
    EDGES.forEach(([a, b], i) => {
      const [x1, y1] = pos[a], [x2, y2] = pos[b];
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const dx = W / 2 - mx, dy = H / 2 - my;
      const k = 0.22;
      svg += `<path class="ws-eco-edge" data-a="${a}" data-b="${b}" id="ws-ee-${i}" d="M${x1.toFixed(1)} ${y1.toFixed(1)} Q${(mx + dx * k).toFixed(1)} ${(my + dy * k).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}"/>`;
    });
    svg += `<line class="ws-eco-flow" x1="0" y1="0" x2="0" y2="0"/>`;
    if (!S.reduced()) svg += `<circle class="ws-eco-pk" r="6"><animateMotion id="ws-eco-mo" dur="1.4s" repeatCount="indefinite" path="M0 0 L0 0"/></circle>`;
    svg += '</svg>';
    const pct = (p) => `left:${(p[0] / W * 100).toFixed(2)}%;top:${(p[1] / H * 100).toFixed(2)}%`;
    const nodes = PARTS.map((p) => `<button class="ws-eco-node" data-act="wsEco" data-arg="${p.id}" data-id="${p.id}" style="${pct(pos[p.id])}"><span class="ws-eco-dot">${icon(p.icon)}</span><span class="ws-eco-lbl">${tx(p.name)}</span></button>`).join('');
    const center = `<div class="ws-eco-center" data-id="building" style="${pct(pos.building)}"><span class="ws-eco-bld">${icon('building')}</span><span class="ws-eco-cid">${S.id(BID)}</span><span class="ws-eco-clbl">${L('Building identity', 'هوية المبنى')}</span></div>`;
    return `<div class="ws-eco-map ${g.tall ? 'tall' : ''}" style="aspect-ratio:${W} / ${H}">${svg}${center}${nodes}</div>`;
  };

  const ecoPanel = () => {
    const mode = B.get('ws:ecomode', 'node');
    if (mode === 'flow') {
      const fl = FLOWS.find((f) => f.id === B.get('ws:flow', 'leak')) || FLOWS[0];
      const st = B.get('ws:step', 0);
      return `<div class="ws-eco-pn">
        <span class="ws-fk">${L('Example flow', 'مسار نموذجي')}</span><h3>${tx(fl.name)}</h3>
        <ol class="ws-flow-steps">${fl.steps.map(([who, t], i) => {
          const p = PARTS.find((x) => x.id === who);
          return `<li class="${i < st ? 'done' : i === st ? 'on' : ''}"><button data-act="wsStep" data-arg="${i}"><span class="ws-fs-n">${i + 1}</span><span><b>${p ? tx(p.name) : L('BENA', 'BENA')}</b><small>${tx(t)}</small></span></button></li>`;
        }).join('')}</ol>
        <div class="ws-eco-pn-foot">${S.btn(B.get('ws:playing', false) ? L('Pause', 'إيقاف مؤقت') : st >= fl.steps.length - 1 ? L('Replay flow', 'إعادة التشغيل') : L('Play flow', 'تشغيل المسار'), { act: 'wsPlay', kind: 'primary', size: 'sm', icon: B.get('ws:playing', false) ? 'clock' : 'play' })}<span class="ws-small">${L('Illustrative sequence · sample data', 'تسلسل توضيحي · بيانات نموذجية')}</span></div>
      </div>`;
    }
    const id = B.get('ws:eco', 'committee');
    const p = PARTS.find((x) => x.id === id) || PARTS[5];
    const rel = EDGES.filter(([a, b]) => a === p.id || b === p.id).map(([a, b, l]) => { const o = PARTS.find((x) => x.id === (a === p.id ? b : a)); return `<li><button data-act="wsEco" data-arg="${o.id}">${icon(o.icon)}<span><b>${tx(o.name)}</b><small>${tx(l)}</small></span></button></li>`; }).join('');
    return `<div class="ws-eco-pn">
      <span class="ws-fk">${L('Participant', 'المشارك')}</span>
      <h3><span class="ws-eco-pic">${icon(p.icon)}</span>${tx(p.name)}</h3>
      <p>${tx(p.d)}</p>
      <div class="ws-fk ws-eco-relk">${L('Works with', 'يتعامل مع')}</div>
      <ul class="ws-eco-rel">${rel}</ul>
      <div class="ws-eco-pn-foot">${S.more(L('See their workspace in the demo', 'شاهد مساحة عملهم في العرض'), p.demo)}</div>
    </div>`;
  };

  let playTimer = null;
  const stopPlay = () => { if (playTimer) { clearInterval(playTimer); playTimer = null; } B.set('ws:playing', false, false); };
  const ecoApply = () => {
    const map = document.querySelector('.ws-eco-map');
    if (!map) { stopPlay(); return; }
    const pn = document.getElementById('ws-eco-pn');
    if (pn) pn.innerHTML = ecoPanel();
    const mode = B.get('ws:ecomode', 'node');
    const g = ecoGeom();
    let active = new Set(), edgeOn = () => false, focus = null, prev = null;
    if (mode === 'flow') {
      const fl = FLOWS.find((f) => f.id === B.get('ws:flow', 'leak')) || FLOWS[0];
      const st = Math.min(B.get('ws:step', 0), fl.steps.length - 1);
      focus = fl.steps[st][0];
      prev = st > 0 ? fl.steps[st - 1][0] : null;
      fl.steps.slice(0, st + 1).forEach(([w]) => active.add(w));
      edgeOn = (a, b) => prev && ((a === prev && b === focus) || (b === prev && a === focus));
    } else {
      focus = B.get('ws:eco', 'committee');
      active.add(focus);
      EDGES.forEach(([a, b]) => { if (a === focus) active.add(b); if (b === focus) active.add(a); });
      edgeOn = (a, b) => a === focus || b === focus;
    }
    map.classList.toggle('has-focus', !!focus);
    map.querySelectorAll('[data-id]').forEach((n) => { n.classList.toggle('on', active.has(n.dataset.id)); n.classList.toggle('focus', n.dataset.id === focus); });
    map.querySelectorAll('.ws-eco-edge').forEach((e) => e.classList.toggle('on', !!edgeOn(e.dataset.a, e.dataset.b)));
    map.querySelectorAll('.ws-eco-spoke').forEach((e) => e.classList.toggle('on', mode === 'node' ? e.dataset.a === focus : e.dataset.a === focus || e.dataset.a === prev));
    // flow line + packet
    const fline = map.querySelector('.ws-eco-flow');
    const pk = map.querySelector('.ws-eco-pk');
    const mo = map.querySelector('#ws-eco-mo');
    if (mode === 'flow' && prev && g.pos[prev] && g.pos[focus]) {
      const [x1, y1] = g.pos[prev], [x2, y2] = g.pos[focus];
      fline.setAttribute('x1', x1); fline.setAttribute('y1', y1); fline.setAttribute('x2', x2); fline.setAttribute('y2', y2);
      fline.classList.add('on');
      if (mo) { mo.setAttribute('path', `M${x1} ${y1} L${x2} ${y2}`); pk.classList.add('on'); try { mo.beginElement(); } catch (e) { /* ignore */ } }
    } else {
      fline.classList.remove('on');
      if (pk) pk.classList.remove('on');
    }
    document.querySelectorAll('.ws-flowtabs button').forEach((b) => b.classList.toggle('on', mode === 'flow' && b.dataset.arg === B.get('ws:flow', 'leak')));
  };
  B.act.wsEco = (id) => { stopPlay(); B.set('ws:ecomode', 'node', false); B.set('ws:eco', id, false); ecoApply(); };
  B.act.wsFlow = (id) => { stopPlay(); B.set('ws:ecomode', 'flow', false); B.set('ws:flow', id, false); B.set('ws:step', 0, false); ecoApply(); };
  B.act.wsStep = (i) => { stopPlay(); B.set('ws:ecomode', 'flow', false); B.set('ws:step', +i, false); ecoApply(); };
  B.act.wsPlay = () => {
    if (B.get('ws:playing', false)) { stopPlay(); ecoApply(); return; }
    B.set('ws:ecomode', 'flow', false);
    const fl = FLOWS.find((f) => f.id === B.get('ws:flow', 'leak')) || FLOWS[0];
    if (B.get('ws:step', 0) >= fl.steps.length - 1) B.set('ws:step', 0, false);
    B.set('ws:playing', true, false);
    ecoApply();
    playTimer = setInterval(() => {
      if (!document.querySelector('.ws-eco-map')) { stopPlay(); return; }
      const s = B.get('ws:step', 0) + 1;
      if (s >= fl.steps.length) { stopPlay(); ecoApply(); return; }
      B.set('ws:step', s, false);
      ecoApply();
    }, S.reduced() ? 2600 : 1900);
  };
  S.binders.push((r) => {
    if (r.page !== 'ecosystem') { stopPlay(); return; }
    ecoApply();
    let tall = ecoGeom().tall;
    S.onResize.push(() => { const t = ecoGeom().tall; if (t !== tall) { tall = t; const m = document.querySelector('.ws-eco-map'); if (m) { m.outerHTML = constellation(); bindHover(); ecoApply(); } } });
    const bindHover = () => document.querySelectorAll('.ws-eco-node').forEach((n) => n.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || B.get('ws:playing', false)) return;
      if (B.get('ws:ecomode', 'node') === 'node' && B.get('ws:eco') === n.dataset.id) return;
      B.set('ws:ecomode', 'node', false); B.set('ws:eco', n.dataset.id, false); ecoApply();
    }));
    bindHover();
  });

  S.render.ecosystem = () => `
    <section class="ws-eco-hero ws-dark">
      <div class="ws-wrap">
        ${S.eyebrow(L('Connected Ecosystem', 'المنظومة المتصلة'), 'on-dark')}
        <h1 class="ws-h1" data-rv>${L('Everyone around a building, working from the same page.', 'كل من يحيط بالمبنى، يعمل من الصفحة ذاتها.')}</h1>
        <p class="ws-lead" data-rv style="--d:.08s">${L('Eight groups of participants interact around every building. BENA gives them one shared identity to coordinate on — each seeing what their role allows. Hover or tap a participant, or play an example flow.', 'تتفاعل ثماني فئات من المشاركين حول كل مبنى. تمنحهم BENA هوية مشتركة واحدة للتنسيق حولها — ويرى كلٌّ منهم ما يسمح به دوره. مرّر المؤشر أو اضغط على مشارك، أو شغّل مساراً نموذجياً.')}</p>
      </div>
    </section>
    <section class="ws-eco ws-dark">
      <div class="ws-wrap">
        <div class="ws-flowtabs" role="tablist" aria-label="${esc(L('Example flows', 'مسارات نموذجية'))}">
          <span class="ws-fk">${L('Example flows', 'مسارات نموذجية')}</span>
          ${FLOWS.map((f) => `<button role="tab" data-act="wsFlow" data-arg="${f.id}">${tx(f.name)}</button>`).join('')}
        </div>
        <div class="ws-eco-grid">
          ${constellation()}
          <aside class="ws-eco-side" id="ws-eco-pn" aria-live="polite">${ecoPanel()}</aside>
        </div>
        <p class="ws-eco-note">${S.honest(L('Illustrative interactions with fictional participants. Municipal links are a designed capability; this prototype is not connected to any municipality.', 'تفاعلات توضيحية بمشاركين خياليين. الربط مع البلديات قدرة مصمَّمة؛ وهذا النموذج غير متصل بأي بلدية.'), 'on-dark')}</p>
      </div>
    </section>
    <section class="ws-sec tight">
      <div class="ws-wrap">
        <div class="ws-sec-head"><div>${S.eyebrow(L('Why it matters', 'لماذا يهم ذلك'))}<h2 class="ws-h2">${L('Fewer phone calls. More trust. A history that stays with the building.', 'مكالمات أقل. ثقة أكبر. وسجل يبقى مع المبنى.')}</h2></div></div>
        <div class="ws-why">
          ${[
            ['link', L('One shared reference', 'مرجع واحد مشترك'), L('Everyone points to the same building, floor and unit — no more “which apartment?”.', 'الجميع يشير إلى المبنى والطابق والوحدة ذاتها — لا مزيد من «أي شقة؟».')],
            ['shieldCheck', L('Role-based visibility', 'ظهور حسب الدور'), L('People see what their role needs, and personal details stay protected.', 'يرى كل شخص ما يحتاجه دوره، وتبقى البيانات الشخصية محمية.')],
            ['history', L('Memory that lasts', 'ذاكرة تدوم'), L('Repairs, decisions and costs remain on the identity when people move on.', 'تبقى الإصلاحات والقرارات والتكاليف على الهوية حين يتغيّر الأشخاص.')],
          ].map(([ic, t, d], i) => `<div class="ws-why-item" data-rv style="--d:${i * 0.06}s"><span class="ws-why-ic">${icon(ic)}</span><h3 class="ws-h3">${t}</h3><p>${d}</p></div>`).join('')}
        </div>
      </div>
    </section>
    ${S.ctaBand()}`;

  /* ================================================================== */
  /* CONTACT / REQUEST A DEMO                                            */
  /* ================================================================== */
  const INTERESTS = [
    ['identity', L('Building identity', 'هوية المباني')], ['municipal', L('Municipal data', 'بيانات البلديات')], ['management', L('Property management', 'إدارة العقارات')],
    ['facility', L('Facility & maintenance', 'المرافق والصيانة')], ['committees', L('Committees', 'اللجان')], ['residents', L('Resident app', 'تطبيق السكان')], ['market', L('Services marketplace', 'سوق الخدمات')],
  ];
  const contactForm = () => {
    const v = B.get('ws:cf', {});
    const err = B.get('ws:cfErr', {});
    const fld = (name, label, ctl, opt = {}) => `<div class="ws-f ${opt.full ? 'full' : ''} ${err[name] ? 'bad' : ''}"><label for="wsf-${name}">${label}${opt.req ? '<i aria-hidden="true">*</i>' : `<span class="ws-opt">${L('optional', 'اختياري')}</span>`}</label>${ctl}<span class="ws-err" id="wsf-${name}-err">${err[name] || ''}</span></div>`;
    const inp = (name, type = 'text', ph = '', extra = '') => `<input class="ws-in" id="wsf-${name}" name="${name}" type="${type}" value="${esc(v[name] || '')}" placeholder="${esc(ph)}" ${err[name] ? `aria-invalid="true" aria-describedby="wsf-${name}-err"` : ''} ${extra}>`;
    const ints = v.interests || [];
    return `<form class="ws-form" data-submit="wsContact" novalidate>
      <div class="ws-form-grid">
        ${fld('name', L('Full name', 'الاسم الكامل'), inp('name', 'text', L('e.g. Rana Haddad', 'مثال: رنا حداد'), 'autocomplete="name"'), { req: true })}
        ${fld('org', L('Organisation', 'الجهة'), inp('org', 'text', L('Municipality, company…', 'بلدية أو شركة…'), 'autocomplete="organization"'), { req: true })}
        ${fld('seg', L('Role / segment', 'الدور / الفئة'), `<select class="ws-in ws-sel" id="wsf-seg" name="seg" ${err.seg ? 'aria-invalid="true"' : ''}><option value="">${L('Select…', 'اختر…')}</option>${S.segments.map((s) => `<option value="${s.id}" ${v.seg === s.id ? 'selected' : ''}>${tx(s.name)}</option>`).join('')}<option value="other" ${v.seg === 'other' ? 'selected' : ''}>${L('Other', 'أخرى')}</option></select>`, { req: true })}
        ${fld('country', L('Country', 'الدولة'), `<select class="ws-in ws-sel" id="wsf-country" name="country" ${err.country ? 'aria-invalid="true"' : ''}><option value="">${L('Select…', 'اختر…')}</option>${[['ps', L('Palestine', 'فلسطين')], ['jo', L('Jordan', 'الأردن')], ['other', L('Other', 'أخرى')]].map(([k, t]) => `<option value="${k}" ${v.country === k ? 'selected' : ''}>${t}</option>`).join('')}</select>`, { req: true })}
        ${fld('city', L('City', 'المدينة'), inp('city', 'text', L('e.g. Ramallah', 'مثال: رام الله'), 'autocomplete="address-level2"'))}
        ${fld('email', L('Work email', 'البريد الإلكتروني للعمل'), inp('email', 'email', 'name@organisation.org', 'autocomplete="email" dir="ltr"'), { req: true })}
        ${fld('phone', L('Phone', 'الهاتف'), inp('phone', 'tel', '+970 …', 'autocomplete="tel" dir="ltr"'))}
        <fieldset class="ws-f full ${err.interests ? 'bad' : ''}"><legend>${L('What would you like to see?', 'ما الذي تودّ مشاهدته؟')}<i aria-hidden="true">*</i></legend>
          <div class="ws-checks">${INTERESTS.map(([k, t]) => `<label class="ws-check"><input type="checkbox" name="interests" value="${k}" ${ints.includes(k) ? 'checked' : ''}><span>${icon('check')}</span>${t}</label>`).join('')}</div>
          <span class="ws-err">${err.interests || ''}</span></fieldset>
        ${fld('msg', L('Message', 'رسالتك'), `<textarea class="ws-in ws-ta" id="wsf-msg" name="msg" rows="4" placeholder="${esc(L('Tell us about your buildings, portfolio or area…', 'حدّثنا عن مبانيك أو محفظتك أو منطقتك…'))}">${esc(v.msg || '')}</textarea>`, { full: true })}
        <div class="ws-f full ${err.consent ? 'bad' : ''}"><label class="ws-consent"><input type="checkbox" name="consent" value="yes" ${v.consent ? 'checked' : ''}><span>${icon('check')}</span>${L('I understand this is a prototype — nothing I enter is sent or stored.', 'أفهم أن هذا نموذج أولي — ولن يُرسل أو يُحفظ أي شيء أُدخله.')}</label><span class="ws-err">${err.consent || ''}</span></div>
      </div>
      <div class="ws-form-foot">${S.btn(L('Request a demo', 'اطلب العرض التوضيحي'), { type: 'submit', size: 'lg', end: 'arrowRight', cls: 'ws-submit' })}<span class="ws-small">${L('Fields marked * are required.', 'الحقول المعلّمة بـ * مطلوبة.')}</span></div>
    </form>`;
  };
  const contactDone = () => {
    const d = B.get('ws:cfDone');
    return `<div class="ws-done" role="status">
      <div class="ws-done-ic">${icon('check')}</div>
      <h2 class="ws-h3">${L(`Thank you, ${esc(d.name)}.`, `شكراً لك، ${esc(d.name)}.`)}</h2>
      <p>${L('Your demo request has been recorded in this prototype. In a live service, our team would contact you within two working days.', 'تم تسجيل طلب العرض في هذا النموذج. في الخدمة الفعلية، سيتواصل معك فريقنا خلال يومي عمل.')}</p>
      <div class="ws-done-ref"><span>${L('Reference', 'المرجع')}</span>${S.id(d.ref)}</div>
      <div class="ws-done-note">${icon('info')}${L('Demo only — nothing was sent or saved.', 'نسخة تجريبية — لم يُرسل أو يُحفظ أي شيء.')}</div>
      <div class="ws-done-act">${S.btn(L('Explore the demo workspaces', 'استكشف مساحات العمل التجريبية'), { go: 'site-login', end: 'arrowRight' })}${S.btn(L('Send another request', 'إرسال طلب آخر'), { act: 'wsContactReset', kind: 'line' })}</div>
    </div>`;
  };
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  B.submit.wsContact = (data, form) => {
    const v = {
      name: (data.name || '').trim(), org: (data.org || '').trim(), seg: data.seg || '', country: data.country || '', city: (data.city || '').trim(),
      email: (data.email || '').trim(), phone: (data.phone || '').trim(), msg: (data.msg || '').trim(),
      interests: [...form.querySelectorAll('input[name="interests"]:checked')].map((x) => x.value), consent: !!form.querySelector('input[name="consent"]:checked'),
    };
    const e = {};
    if (v.name.length < 2) e.name = L('Please enter your name.', 'يرجى إدخال اسمك.');
    if (!v.org) e.org = L('Please enter your organisation.', 'يرجى إدخال اسم الجهة.');
    if (!v.seg) e.seg = L('Please choose the option that fits you best.', 'يرجى اختيار الفئة الأنسب لك.');
    if (!v.country) e.country = L('Please choose a country.', 'يرجى اختيار الدولة.');
    if (!EMAIL.test(v.email)) e.email = L('Please enter a valid email address.', 'يرجى إدخال بريد إلكتروني صحيح.');
    if (v.phone && !/^[+\d][\d\s()-]{6,}$/.test(v.phone)) e.phone = L('Please use digits, spaces and an optional +.', 'يرجى استخدام الأرقام والمسافات وعلامة + اختيارياً.');
    if (!v.interests.length) e.interests = L('Choose at least one topic.', 'اختر موضوعاً واحداً على الأقل.');
    if (!v.consent) e.consent = L('Please confirm you understand this is a prototype.', 'يرجى التأكيد على أنك تدرك أن هذا نموذج أولي.');
    B.set('ws:cf', v, false);
    B.set('ws:cfErr', e, false);
    const host = document.getElementById('ws-cf');
    if (Object.keys(e).length) {
      if (host) { host.innerHTML = contactForm(); const first = host.querySelector('.bad input, .bad select, .bad textarea'); if (first) first.focus(); }
      return;
    }
    const btn = form.querySelector('.ws-submit');
    if (btn) { btn.disabled = true; btn.innerHTML = `<span class="ws-spin"></span><span>${L('Sending…', 'جارٍ الإرسال…')}</span>`; }
    setTimeout(() => {
      B.set('ws:cfDone', { name: v.name.split(' ')[0], ref: 'DEMO-REQ-' + String(Date.now()).slice(-5) }, false);
      const h = document.getElementById('ws-cf');
      if (h) { h.innerHTML = contactDone(); h.scrollIntoView({ block: 'nearest', behavior: S.reduced() ? 'auto' : 'smooth' }); }
    }, 950);
  };
  B.act.wsContactReset = () => { B.set('ws:cfDone', null, false); B.set('ws:cf', {}, false); B.set('ws:cfErr', {}, false); const h = document.getElementById('ws-cf'); if (h) h.innerHTML = contactForm(); };

  S.render.contact = () => `
    <section class="ws-contact">
      <div class="ws-wrap ws-contact-grid">
        <div class="ws-contact-text">
          ${S.eyebrow(L('Request a demo', 'اطلب عرضاً توضيحياً'))}
          <h1 class="ws-h1" data-rv>${L('Let’s look at your buildings together.', 'لننظر في مبانيك معاً.')}</h1>
          <p class="ws-lead" data-rv style="--d:.06s">${L('Tell us a little about your organisation and what you’d like to see. We’ll tailor a walkthrough of the BENA prototype to your context.', 'أخبرنا قليلاً عن جهتك وما تودّ رؤيته، وسنُعدّ جولة في نموذج BENA تناسب سياقك.')}</p>
          <ol class="ws-expect">
            ${[
              [L('A short conversation', 'حديث قصير'), L('We learn about your buildings, portfolio or area.', 'نتعرّف على مبانيك أو محفظتك أو منطقتك.')],
              [L('A guided walkthrough', 'جولة موجّهة'), L('The workspaces that matter to you, with sample data.', 'مساحات العمل التي تهمّك، ببيانات نموذجية.')],
              [L('Next steps, honestly', 'الخطوات التالية، بصراحة'), L('What a pilot could look like, and what it would need.', 'كيف يمكن أن يبدو المشروع التجريبي، وما الذي يحتاجه.')],
            ].map(([t, d], i) => `<li data-rv style="--d:${0.1 + i * 0.05}s"><span>${String(i + 1).padStart(2, '0')}</span><div><b>${t}</b><small>${d}</small></div></li>`).join('')}
          </ol>
          <div class="ws-contact-note">${icon('info')}<p>${L('This is a frontend prototype. The form validates your input and shows a confirmation, but nothing is sent anywhere.', 'هذا نموذج واجهات فقط. يتحقق النموذج من مدخلاتك ويعرض تأكيداً، لكن لا يُرسل أي شيء إلى أي جهة.')}</p></div>
        </div>
        <div class="ws-contact-card" id="ws-cf">${B.get('ws:cfDone') ? contactDone() : contactForm()}</div>
      </div>
    </section>`;

  /* ================================================================== */
  /* LOGIN / ACCESS PORTAL                                               */
  /* ================================================================== */
  const WORKSPACES = [
    { go: 'municipality-home', icon: 'landmark', name: L('Municipality', 'البلدية'), d: L('Registry, verification and area insights', 'السجل والتحقق ومؤشرات المناطق') },
    { go: 'manager-home', icon: 'briefcase', name: L('Property management', 'إدارة العقارات'), d: L('Portfolio, leases and collections', 'المحفظة والعقود والتحصيل') },
    { go: 'facility-home', icon: 'wrench', name: L('Facility management', 'إدارة المرافق'), d: L('Assets, plans and work orders', 'الأصول والخطط وأوامر العمل') },
    { go: 'owner-home', icon: 'key', name: L('Property owner', 'مالك العقار'), d: L('Units, tenants and payments', 'الوحدات والمستأجرون والدفعات') },
    { go: 'committee-home', icon: 'users', name: L('Building committee', 'لجنة المبنى'), d: L('Votes, contributions and requests', 'التصويت والمساهمات والطلبات') },
    { go: 'provider-home', icon: 'tool', name: L('Service provider', 'مزوّد الخدمات'), d: L('Jobs, quotes and schedule', 'الطلبات والعروض والجدول') },
    { go: 'admin-home', icon: 'shield', name: L('Platform administration', 'إدارة المنصة'), d: L('Tenants, users and data sources', 'الجهات والمستخدمون ومصادر البيانات') },
    { go: 'm-resident-home', icon: 'phone', name: L('Open the mobile app', 'افتح تطبيق الهاتف'), d: L('Resident experience on a phone', 'تجربة الساكن على الهاتف'), mobile: true },
  ];
  B.submit.wsLogin = (data, form) => {
    const email = (data.email || '').trim();
    const errEl = form.querySelector('.ws-login-err');
    if (!EMAIL.test(email) || !(data.password || '').length) {
      if (errEl) errEl.textContent = L('Enter any email address and password — this is a demo.', 'أدخل أي بريد إلكتروني وكلمة مرور — هذا عرض تجريبي.');
      form.querySelector(!EMAIL.test(email) ? '[name=email]' : '[name=password]').focus();
      return;
    }
    if (errEl) errEl.textContent = '';
    const btn = form.querySelector('.ws-submit');
    if (btn) { btn.disabled = true; btn.innerHTML = `<span class="ws-spin"></span><span>${L('Signing in…', 'جارٍ تسجيل الدخول…')}</span>`; }
    const to = data.workspace || 'municipality-home';
    B.set('ws:loginWs', to, false);
    setTimeout(() => B.go(to), 900);
  };
  S.render.login = () => {
    const cur = B.get('ws:loginWs', 'municipality-home');
    return `
    <section class="ws-login">
      <div class="ws-login-brand ws-dark">
        <div class="ws-login-art" aria-hidden="true">${B.art.skyline()}</div>
        <div class="ws-login-bi">
          ${S.eyebrow(L('BENA access portal', 'بوابة الدخول إلى BENA'), 'on-dark')}
          <h1 class="ws-h1">${L('Every building has an identity. <span class="ws-mint">Sign in to yours.</span>', 'لكل مبنى هوية. <span class="ws-mint">ادخل إلى هويتك.</span>')}</h1>
          <p class="ws-lead">${L('One sign-in for municipalities, owners, managers, committees, facility teams and providers — each landing in their own workspace.', 'دخول واحد للبلديات والمالكين والمديرين واللجان وفرق المرافق والمزوّدين — ولكلٍّ مساحة عمله الخاصة.')}</p>
          <div class="ws-login-tower">${S.tower({ theme: 'night', idp: 'lg', lit: ['8-3', '5-2', '11-4'], marks: [{ f: 8, k: 3 }] })}</div>
          <div class="ws-login-honest">${icon('info')}<span>${L('Prototype · sample data · not an official registry', 'نموذج أولي · بيانات نموذجية · ليس سجلاً رسمياً')}</span></div>
        </div>
      </div>
      <div class="ws-login-main">
        <div class="ws-login-card">
          <h2 class="ws-h3">${L('Log in to BENA', 'تسجيل الدخول إلى BENA')}</h2>
          <p class="ws-small">${L('Demo access — any email and password will do. Nothing is checked or stored.', 'دخول تجريبي — يكفي أي بريد إلكتروني وكلمة مرور. لا يتم التحقق من أي شيء أو حفظه.')}</p>
          <form class="ws-login-form" data-submit="wsLogin" novalidate>
            <div class="ws-f"><label for="wsl-email">${L('Email', 'البريد الإلكتروني')}</label><input class="ws-in" id="wsl-email" name="email" type="email" autocomplete="username" dir="ltr" placeholder="you@organisation.org"></div>
            <div class="ws-f"><label for="wsl-pass">${L('Password', 'كلمة المرور')}</label><input class="ws-in" id="wsl-pass" name="password" type="password" autocomplete="current-password" placeholder="••••••••"></div>
            <div class="ws-f"><label for="wsl-ws">${L('Workspace', 'مساحة العمل')}</label><select class="ws-in ws-sel" id="wsl-ws" name="workspace">${WORKSPACES.map((w) => `<option value="${w.go}" ${w.go === cur ? 'selected' : ''}>${w.name}</option>`).join('')}</select></div>
            <div class="ws-login-row"><label class="ws-consent small"><input type="checkbox" name="remember" value="1"><span>${icon('check')}</span>${L('Keep me signed in', 'تذكّرني')}</label><button type="button" class="ws-linkbtn" data-act="soon" data-arg="${esc(L('Password reset', 'استعادة كلمة المرور'))}">${L('Forgot password?', 'نسيت كلمة المرور؟')}</button></div>
            <div class="ws-login-err" role="alert"></div>
            ${S.btn(L('Sign in', 'تسجيل الدخول'), { type: 'submit', size: 'lg', cls: 'ws-btn-block ws-submit', kind: 'dark' })}
          </form>
        </div>
        <div class="ws-login-ws">
          <div class="ws-login-ws-h"><h2 class="ws-h3">${L('Choose a demo workspace', 'اختر مساحة عمل تجريبية')}</h2>${S.more(L('Demo hub', 'مركز العروض'), 'hub')}</div>
          <div class="ws-wsgrid">${WORKSPACES.map((w) => `<a class="ws-wscard ${w.mobile ? 'mobile' : ''}" href="#${w.go}" data-go="${w.go}"><span class="ws-wscard-ic">${icon(w.icon)}</span><span class="ws-wscard-t"><b>${w.name}</b><small>${w.d}</small></span>${icon('arrowRight', 'flip ws-wscard-go')}</a>`).join('')}</div>
        </div>
      </div>
    </section>`;
  };

  /* ================================================================== */
  /* STYLES                                                              */
  /* ================================================================== */
  B.css(`
  .ws-small { font-size: 13px; color: var(--text-2); }
  .ws-fk { display: block; font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--text-3); }
  html[dir="rtl"] .ws-fk { letter-spacing: 0; font-size: 12.5px; }
  .ws-phero-note { margin-top: 28px; }
  .ws-icbtn { width: 38px; height: 38px; border-radius: 10px; border: 1px solid var(--line); display: grid; place-items: center; background: #fff; color: var(--navy); }
  .ws-icbtn svg { width: 18px; height: 18px; }
  .ws-icbtn[disabled] { opacity: .35; pointer-events: none; }
  .ws-honest.on-dark { color: #A9BCC9; } .ws-honest.on-dark svg { color: var(--mint); }

  /* vision */
  .ws-toc { background: #fff; border: 1px solid var(--line); border-radius: 20px; padding: 22px; box-shadow: 0 20px 50px -30px rgba(13,31,43,.25); }
  .ws-toc-k { font-size: 12px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--text-3); margin-bottom: 8px; }
  html[dir="rtl"] .ws-toc-k { letter-spacing: 0; }
  .ws-toc button { display: flex; align-items: baseline; gap: 14px; width: 100%; text-align: start; padding: 11px 0; border-bottom: 1px solid var(--line-2); font-size: 15.5px; font-weight: 500; color: var(--ink); transition: color .2s; }
  .ws-toc button:last-child { border-bottom: 0; }
  .ws-toc button span { font-family: var(--font-display); font-size: 12.5px; font-weight: 700; color: var(--mint-ink); }
  .ws-toc button:hover { color: var(--mint-ink); }
  .ws-essay-grid { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 24px; }
  .ws-essay-n { font-family: var(--font-display); font-weight: 800; font-size: 56px; line-height: 1; color: transparent; -webkit-text-stroke: 1.2px #B8C7C1; position: sticky; top: 110px; align-self: start; }
  .ws-dark .ws-essay-n { -webkit-text-stroke-color: rgba(54,214,160,.5); }
  .ws-essay-body { max-width: 980px; }
  .ws-essay-body > .ws-body { max-width: 44em; margin-top: 22px; }
  .ws-essay-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .9fr); gap: clamp(28px, 4vw, 64px); align-items: center; max-width: none; }
  .ws-essay-split .ws-body { margin-top: 22px; }
  .ws-drop::first-letter { font-family: var(--font-display); font-weight: 800; float: inline-start; font-size: 64px; line-height: .9; padding-inline-end: 10px; padding-top: 6px; color: var(--navy); }
  html[dir="rtl"] .ws-drop::first-letter { font-size: inherit; float: none; padding: 0; line-height: inherit; }
  .ws-quote { margin: 34px 0 0; padding-inline-start: 22px; border-inline-start: 3px solid var(--mint); font-family: var(--font-display); font-size: clamp(22px, 2.2vw, 30px); font-weight: 700; line-height: 1.3; color: var(--navy); letter-spacing: -.015em; }
  html[dir="rtl"] .ws-quote { letter-spacing: 0; line-height: 1.6; }
  .ws-fig { margin: 44px 0 0; }
  .ws-fig figcaption { font-size: 13.5px; color: var(--text-3); margin-top: 14px; }
  .ws-fig-k { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--text-3); }
  html[dir="rtl"] .ws-fig-k { letter-spacing: 0; }
  .ws-scatter { display: grid; grid-template-columns: minmax(0, 1fr) 48px minmax(0, 1fr); gap: 12px; align-items: stretch; }
  .ws-sc-panel { border: 1px dashed #C9D5D0; border-radius: 22px; padding: 22px; display: flex; flex-direction: column; background: #FBFCFC; }
  .ws-sc-panel.on { border: 1px solid var(--mint-100); background: var(--mint-50); }
  .ws-sc-field { position: relative; height: 230px; margin-top: 10px; }
  .ws-sc-chip { position: absolute; padding: 8px 12px; border-radius: 10px; background: #fff; border: 1px solid var(--line); font-size: 13.5px; color: var(--text-2); box-shadow: 0 6px 16px -10px rgba(13,31,43,.3); white-space: nowrap; }
  .ws-sc-arrow { display: grid; place-items: center; color: var(--mint-ink); }
  .ws-sc-arrow svg { width: 28px; height: 28px; }
  .ws-sc-anchor { flex: 1; display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }
  .ws-sc-id { display: inline-flex; align-self: flex-start; padding: 8px 14px; border-radius: 10px; background: var(--navy); color: var(--mint); font-weight: 700; font-size: 14px; }
  .ws-sc-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding-inline-start: 16px; border-inline-start: 2px solid var(--mint); }
  .ws-sc-row { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--ink); background: #fff; border-radius: 10px; padding: 8px 10px; border: 1px solid var(--mint-100); }
  .ws-sc-row i { width: 6px; height: 6px; border-radius: 50%; background: var(--mint-ink); flex: none; }
  .ws-rings-fig { margin: 0; text-align: center; }
  .ws-rings { width: 100%; max-width: 460px; margin-inline: auto; height: auto; }
  .ws-ring-t { font-family: var(--font); font-size: 13px; font-weight: 600; fill: #0B6B4C; }
  html[dir="rtl"] .ws-ring-t, html[dir="rtl"] .ws-ring-c { font-family: var(--font-ar); }
  .ws-ring-c { font-family: var(--font-display); font-size: 13px; font-weight: 700; fill: #fff; }
  .ws-ring-id { font-family: ui-monospace, Menlo, monospace; font-size: 9.5px; fill: #36D6A0; }
  .ws-links { display: grid; grid-template-columns: minmax(0, 1fr) minmax(200px, .7fr) minmax(0, 1fr); gap: 0; align-items: center; }
  .ws-lk-col { display: grid; gap: 14px; position: relative; z-index: 1; }
  .ws-lk-tile { display: flex; gap: 14px; padding: 18px; border-radius: 18px; background: #fff; border: 1px solid var(--line); position: relative; }
  .ws-lk-col:first-child .ws-lk-tile::after, .ws-lk-col:last-child .ws-lk-tile::after { content: ""; position: absolute; top: 50%; width: 40px; height: 1px; background: linear-gradient(90deg, var(--mint), rgba(54,214,160,.2)); }
  .ws-lk-col:first-child .ws-lk-tile::after { inset-inline-start: 100%; }
  .ws-lk-col:last-child .ws-lk-tile::after { inset-inline-end: 100%; }
  .ws-lk-ic { width: 40px; height: 40px; border-radius: 12px; background: var(--mint-50); color: var(--mint-ink); display: grid; place-items: center; flex: none; }
  .ws-lk-ic svg { width: 20px; height: 20px; }
  .ws-lk-tile b { display: block; font-size: 15px; }
  .ws-lk-tile small { display: block; font-size: 13px; color: var(--text-2); margin-top: 2px; line-height: 1.45; }
  .ws-lk-prov { margin-top: 10px; }
  .ws-lk-core { display: grid; place-items: center; padding: 0 40px; }
  .ws-lk-card { width: 100%; aspect-ratio: 1; border-radius: 28px; background: var(--navy); color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; padding: 16px; box-shadow: 0 0 0 10px rgba(54,214,160,.08), 0 0 0 22px rgba(54,214,160,.05); }
  .ws-lk-card .ws-mono { color: var(--mint); font-weight: 700; font-size: 15px; }
  .ws-lk-k { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: #A9BCC9; font-weight: 600; }
  html[dir="rtl"] .ws-lk-k { letter-spacing: 0; }
  .ws-lk-card small { font-size: 12.5px; color: #A9BCC9; }
  .ws-princ { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 36px; }
  .ws-princ-item { background: #fff; border-radius: 22px; padding: 28px; border: 1px solid var(--line); }
  .ws-princ-item p { color: var(--text-2); margin-top: 10px; line-height: 1.65; }
  .ws-nots { display: grid; gap: 14px; margin-top: 34px; max-width: 880px; }
  .ws-not { display: flex; gap: 18px; padding: 22px 24px; border-radius: 18px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); }
  .ws-not-ic { width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(244,184,96,.5); color: #F4B860; display: grid; place-items: center; flex: none; }
  .ws-not-ic svg { width: 18px; height: 18px; }
  .ws-not h3 { font-family: var(--font-display); font-size: 19px; color: #fff; }
  .ws-not p { color: #A9BCC9; margin-top: 4px; }

  /* solutions */
  .ws-segnav { position: sticky; top: 66px; z-index: 20; background: rgba(255,255,255,.92); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); border-block: 1px solid var(--line-2); }
  .ws-segnav-in { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; padding: 10px 0; }
  .ws-segnav-in::-webkit-scrollbar { display: none; }
  .ws-segnav button { flex: none; display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 14px; border-radius: 99px; font-size: 14px; font-weight: 500; color: var(--text-2); white-space: nowrap; transition: background .2s, color .2s; }
  .ws-segnav button span { font-family: var(--font-display); font-size: 11.5px; font-weight: 700; color: var(--text-3); }
  .ws-segnav button:hover { background: var(--surface-2); color: var(--ink); }
  .ws-sol { scroll-margin-top: 130px; }
  .ws-sol-grid { display: grid; grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); gap: clamp(36px, 6vw, 96px); align-items: center; }
  .ws-sol.ws-sol-rev .ws-sol-text { order: 2; }
  .ws-sol-k { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; }
  .ws-sol-k .ws-num { margin: 0; }
  .ws-sol-seg { display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 14px; border-radius: 99px; background: var(--mint-50); color: var(--mint-ink); font-size: 14px; font-weight: 600; }
  .ws-sol-seg svg { width: 17px; height: 17px; }
  .ws-sol .ws-body { margin-top: 20px; max-width: 34em; }
  .ws-caps { list-style: none; padding: 0; margin: 30px 0 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px 28px; }
  .ws-caps li { display: flex; gap: 12px; }
  .ws-cap-n { width: 26px; height: 26px; border-radius: 8px; background: var(--navy); color: var(--mint); display: grid; place-items: center; flex: none; margin-top: 1px; }
  .ws-cap-n svg { width: 15px; height: 15px; }
  .ws-caps b { display: block; font-size: 15.5px; font-weight: 600; }
  .ws-caps li > div > span { display: block; font-size: 14.5px; color: var(--text-2); margin-top: 2px; line-height: 1.5; }
  .ws-sol-cta { display: flex; align-items: center; flex-wrap: wrap; gap: 16px; margin-top: 36px; }
  .ws-sol-demo { font-size: 13.5px; color: var(--text-3); }
  .ws-sol-vis { position: relative; }
  .ws-ui { background: #fff; border-radius: 20px; border: 1px solid rgba(20,43,59,.08); box-shadow: 0 40px 80px -40px rgba(13,31,43,.35), 0 2px 6px rgba(13,31,43,.04); overflow: hidden; }
  .ws-ui-bar { display: flex; align-items: center; gap: 6px; height: 40px; padding: 0 16px; border-bottom: 1px solid var(--line-2); background: var(--surface-2); }
  .ws-ui-bar i { width: 9px; height: 9px; border-radius: 50%; background: #DCE3E0; }
  .ws-ui-bar span { margin-inline-start: 10px; font-size: 12.5px; font-weight: 600; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ws-ui-body { padding: 20px; display: grid; gap: 12px; }
  .ws-bar { display: block; height: 6px; border-radius: 3px; background: var(--line-2); overflow: hidden; }
  .ws-bar i { display: block; height: 100%; border-radius: 3px; background: var(--mint); }
  .ws-bar.navy i { background: var(--navy); } .ws-bar.grey i { background: #C9D6DF; }
  .ws-float { position: absolute; background: #fff; border-radius: 16px; padding: 16px; box-shadow: 0 24px 50px -20px rgba(13,31,43,.4); border: 1px solid rgba(20,43,59,.06); }
  .ws-vis-muni { position: relative; padding-bottom: 36px; padding-inline-end: 24px; }
  .ws-vis-muni .ws-ui-body { padding: 0; }
  .ws-vm-map { height: 340px; }
  .ws-vm-map .map-shell { height: 100%; border: 0; border-radius: 0; touch-action: auto; }
  .ws-vm-map .map-shell svg.map-svg { cursor: default; }
  .ws-vm-kpi { inset-inline-end: 0; bottom: 0; width: 220px; display: grid; gap: 6px; }
  .ws-vm-kpi b { font-family: var(--font-display); font-size: 30px; line-height: 1; }
  .ws-vm-kpi small { font-size: 12px; color: var(--text-3); }
  .ws-vm-q { inset-inline-start: -24px; top: 70px; width: 270px; display: grid; gap: 8px; }
  .ws-vq-row .ws-mono { white-space: nowrap; font-size: 12.5px; }
  .ws-vq-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12.5px; }
  .ws-vo-head { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 12px; padding: 4px 0 14px; border-bottom: 1px solid var(--line-2); }
  .ws-vo-head b { display: block; font-family: var(--font-display); font-size: 22px; margin-top: 4px; }
  .ws-vrow { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 14px; border: 1px solid var(--line-2); }
  .ws-vrow-ic { width: 38px; height: 38px; border-radius: 10px; background: var(--surface-2); display: grid; place-items: center; color: var(--navy); flex: none; }
  .ws-vrow-ic svg { width: 18px; height: 18px; }
  .ws-vrow-b { flex: 1; min-width: 0; }
  .ws-vrow-b b { display: block; font-size: 14.5px; }
  .ws-vrow-b small { display: block; font-size: 12.5px; color: var(--text-2); }
  .ws-vrow-e { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
  .ws-vrow-e small { font-size: 12.5px; font-weight: 600; }
  .ws-vt { display: grid; gap: 2px; }
  .ws-vt-h, .ws-vt-r { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) 70px; gap: 14px; align-items: center; }
  .ws-vt-h { font-size: 12px; font-weight: 600; color: var(--text-3); padding: 0 4px 8px; border-bottom: 1px solid var(--line-2); }
  .ws-vt-h span:last-child, .ws-vt-c { text-align: end; }
  .ws-vt-r { padding: 12px 4px; border-bottom: 1px solid var(--line-2); font-size: 14px; }
  .ws-vt-n { display: flex; align-items: center; gap: 8px; font-weight: 600; min-width: 0; }
  .ws-vt-n svg { width: 16px; height: 16px; color: var(--text-3); flex: none; }
  .ws-vt-o { display: grid; grid-template-columns: 1fr 36px; align-items: center; gap: 8px; }
  .ws-vt-o small { font-size: 12.5px; color: var(--text-2); text-align: end; }
  .ws-vt-c { font-weight: 700; font-variant-numeric: tabular-nums; }
  .ws-vm-foot { display: flex; align-items: center; gap: 10px; padding-top: 12px; border-top: 1px solid var(--line-2); font-size: 13px; color: var(--text-2); }
  .ws-vm-foot svg { width: 17px; height: 17px; color: var(--mint-ink); }
  .ws-sim { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 10px; background: var(--info-bg); color: var(--info); font-size: 12.5px; font-weight: 600; }
  .ws-sim svg { width: 16px; height: 16px; }
  .ws-va { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .ws-va-t { border: 1px solid var(--line-2); border-radius: 14px; padding: 14px; display: grid; gap: 4px; }
  .ws-va-top { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 8px; }
  .ws-va-ic { width: 36px; height: 36px; border-radius: 10px; background: var(--surface-2); display: grid; place-items: center; color: var(--navy); }
  .ws-va-ic svg { width: 18px; height: 18px; }
  .ws-va-t b { font-size: 14.5px; }
  .ws-va-t small { font-size: 12.5px; color: var(--text-2); }
  .ws-vc-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .ws-vc-top .ws-fk { text-transform: none; letter-spacing: 0; font-size: 13px; }
  .ws-vc-q { padding: 14px; border-radius: 14px; background: var(--surface-2); }
  .ws-vc-q b { display: block; font-family: var(--font-display); font-size: 18px; }
  .ws-vc-q small { display: block; font-size: 13px; color: var(--text-2); margin-top: 3px; }
  .ws-vc-opt { display: grid; gap: 6px; }
  .ws-vc-opt > div { display: flex; justify-content: space-between; font-size: 13.5px; }
  .ws-vj { border: 1px solid var(--line-2); border-radius: 14px; padding: 14px; display: grid; gap: 6px; }
  .ws-vj-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
  .ws-vj-top b { font-size: 14.5px; }
  .ws-vj small, .ws-vj-m { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--text-2); }
  .ws-vj svg { width: 14px; height: 14px; flex: none; }
  .ws-vj-m { color: var(--mint-ink); font-weight: 600; }
  .ws-stars svg { width: 15px; height: 15px; }
  .ws-phone { width: 290px; margin-inline: auto; border-radius: 46px; background: var(--navy); padding: 12px; box-shadow: 0 50px 90px -40px rgba(13,31,43,.6); }
  .ws-phone-in { background: #F4F7F6; border-radius: 36px; overflow: hidden; padding: 12px 16px 0; display: grid; gap: 12px; }
  .ws-ph-top { display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 600; padding: 0 6px; height: 22px; }
  .ws-ph-top svg { width: 14px; height: 14px; }
  .ws-ph-notch { width: 80px; height: 22px; border-radius: 12px; background: var(--navy); }
  .ws-ph-h small { display: block; font-size: 12.5px; color: var(--text-2); }
  .ws-ph-h b { font-family: var(--font-display); font-size: 26px; }
  .ws-ph-unit { display: flex; align-items: center; gap: 10px; background: var(--navy); color: #fff; border-radius: 16px; padding: 12px; }
  .ws-ph-unit svg { width: 20px; height: 20px; color: var(--mint); }
  .ws-ph-unit b { display: block; font-size: 14px; }
  .ws-ph-unit small { display: block; font-size: 12px; color: #A9BCC9; }
  .ws-ph-card { background: #fff; border-radius: 16px; padding: 12px; display: grid; gap: 6px; }
  .ws-ph-card > small { font-size: 12px; color: var(--text-2); }
  .ws-ph-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
  .ws-ph-row b { font-size: 14px; }
  .ws-ph-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-top: 4px; }
  .ws-ph-steps i { height: 4px; border-radius: 2px; background: var(--line); }
  .ws-ph-steps i.on { background: var(--mint); }
  .ws-ph-sl { font-size: 12px; color: var(--text-2); }
  .ws-ph-due { display: flex; align-items: center; justify-content: space-between; background: #fff; border-radius: 16px; padding: 12px; }
  .ws-ph-due small { display: block; font-size: 12px; color: var(--text-2); }
  .ws-ph-due b { font-family: var(--font-display); font-size: 18px; }
  .ws-ph-pay { height: 34px; padding: 0 16px; border-radius: 99px; background: var(--mint); color: var(--navy); font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; }
  .ws-ph-tabs { display: flex; justify-content: space-around; padding: 12px 0 18px; border-top: 1px solid var(--line); margin-inline: -16px; background: #fff; }
  .ws-ph-tabs span { color: var(--text-3); } .ws-ph-tabs span.on { color: var(--mint-ink); }
  .ws-ph-tabs svg { width: 22px; height: 22px; }

  /* identity */
  .ws-idbig { background: #fff; border-radius: 26px; padding: 26px; border: 1px solid rgba(20,43,59,.07); box-shadow: 0 40px 80px -40px rgba(13,31,43,.35); }
  .ws-idbig-top { display: flex; align-items: center; gap: 12px; }
  .ws-idbig-top .prov { margin-inline-start: auto; }
  .ws-idbig-top .ws-idc-k { font-size: 11.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--text-3); }
  html[dir="rtl"] .ws-idbig-top .ws-idc-k { letter-spacing: 0; }
  .ws-idbig-id { font-size: 24px; font-weight: 700; color: var(--navy); line-height: 1.2; }
  .ws-idbig-name { font-family: var(--font-display); font-size: 21px; font-weight: 700; margin-top: 18px; }
  .ws-idbig-addr { font-size: 13.5px; color: var(--text-2); margin-top: 2px; }
  .ws-idbig-rows { margin: 16px 0 0; border-top: 1px solid var(--line-2); }
  .ws-idbig-rows > div, .ws-unitp-rows > div { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--line-2); font-size: 14px; }
  .ws-idbig-rows dt, .ws-unitp-rows dt { color: var(--text-2); }
  .ws-idbig-rows dd, .ws-unitp-rows dd { margin: 0; display: flex; align-items: center; gap: 10px; font-weight: 600; text-align: end; flex-wrap: wrap; justify-content: flex-end; }
  .ws-idbig-foot { display: flex; align-items: center; gap: 14px; margin-top: 16px; }
  .ws-idbig-foot p { font-size: 13px; color: var(--text-2); line-height: 1.45; }
  .ws-idc-qr { width: 52px; height: 52px; flex: none; padding: 5px; border: 1px solid var(--line); border-radius: 10px; background: #fff; }
  .ws-idc-k { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--text-2); }
  .ws-ex-sec { padding-top: clamp(40px, 5vw, 72px); }
  .ws-explorer { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 24px; align-items: start; }
  .ws-ex-tower { position: sticky; top: 90px; background: linear-gradient(180deg, #EEF3F1, #F8FAF9); border-radius: 28px; padding: 64px 24px 24px; border: 1px solid var(--line-2); }
  .ws-ex-tower .ws-tower { width: 100%; max-width: 440px; margin-inline: auto; height: auto; max-height: 620px; }
  .ws-ex-hint { position: absolute; top: 20px; inset-inline-start: 20px; display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 14px; border-radius: 99px; background: #fff; border: 1px solid var(--line); font-size: 13px; font-weight: 600; color: var(--navy); }
  .ws-ex-hint svg { width: 16px; height: 16px; color: var(--mint-ink); }
  .ws-ex-cap { text-align: center; font-size: 12.5px; color: var(--text-3); margin-top: 8px; }
  .ws-ex-side { display: grid; gap: 16px; }
  .ws-floorp, .ws-unitp { background: #fff; border: 1px solid var(--line); border-radius: 24px; padding: 24px; }
  .ws-floorp-h { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
  .ws-floorp-h h3 { font-family: var(--font-display); font-size: 26px; margin-top: 4px; }
  .ws-floorp-nav { display: flex; gap: 8px; }
  .ws-plan { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto auto; gap: 8px; padding: 10px; border-radius: 18px; background: #F4F7F6; border: 2px solid var(--navy); }
  .ws-plan > .ws-unit:nth-child(1) { grid-column: 1; grid-row: 1; } .ws-plan > .ws-unit:nth-child(2) { grid-column: 2; grid-row: 1; }
  .ws-plan .ws-plan-core { grid-column: 1 / -1; grid-row: 2; }
  .ws-plan > .ws-unit:nth-child(4) { grid-column: 1; grid-row: 3; } .ws-plan > .ws-unit:nth-child(5) { grid-column: 2; grid-row: 3; }
  .ws-plan.g { grid-template-columns: 1fr auto 1fr; grid-template-rows: auto; }
  .ws-plan.g .ws-plan-core { grid-column: 2; grid-row: 1; flex-direction: column; padding: 12px 16px; }
  .ws-plan.g > .ws-unit:first-child { grid-column: 1; } .ws-plan.g > .ws-unit:last-child { grid-column: 3; grid-row: 1; }
  .ws-plan-core { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px; border-radius: 10px; background: repeating-linear-gradient(-45deg, #E6ECE9, #E6ECE9 6px, #EEF2F0 6px, #EEF2F0 12px); font-size: 12.5px; color: var(--text-2); font-weight: 600; text-align: center; }
  .ws-plan-core svg { width: 16px; height: 16px; }
  .ws-unit { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 16px; border-radius: 12px; background: #fff; border: 1.5px solid transparent; text-align: start; min-height: 112px; transition: border-color .2s, box-shadow .2s, transform .2s var(--ease); }
  .ws-unit:hover { border-color: #B9C8C2; }
  .ws-unit.on { border-color: var(--mint); box-shadow: 0 0 0 4px rgba(54,214,160,.18); }
  .ws-unit-n { font-family: var(--font-display); font-weight: 800; font-size: 24px; line-height: 1; color: var(--navy); direction: ltr; }
  .ws-unit-k { font-size: 12.5px; color: var(--text-2); }
  .ws-unit-s { display: inline-flex; align-items: center; gap: 6px; margin-top: auto; font-size: 12.5px; font-weight: 600; }
  .ws-unit-s i, .ws-legend i { width: 8px; height: 8px; border-radius: 50%; background: var(--text-3); }
  .st-rented i { background: var(--mint-ink) !important; } .st-ownerOccupied i { background: var(--navy) !important; } .st-vacant i { background: #C9D6DF !important; border: 1px solid #9FB2BF; } .st-maintenance i { background: #E9A23B !important; }
  .ws-legend { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-top: 14px; font-size: 12.5px; color: var(--text-2); }
  .ws-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .ws-unitp-h { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .ws-unitp-h h3 { font-family: var(--font-display); font-size: 24px; margin-top: 4px; }
  .ws-unitp-id { margin-top: 8px; font-size: 14px; font-weight: 700; color: var(--mint-ink); }
  .ws-unitp-rows { margin: 14px 0 0; border-top: 1px solid var(--line-2); }
  .ws-unitp-note { display: flex; gap: 10px; align-items: flex-start; margin-top: 14px; padding: 12px 14px; border-radius: 12px; background: var(--surface-2); font-size: 13px; color: var(--text-2); }
  .ws-unitp-note svg { width: 16px; height: 16px; flex: none; margin-top: 2px; color: var(--navy); }
  .ws-unitp-note.warn { background: var(--warn-bg); color: var(--warn); } .ws-unitp-note.warn svg { color: var(--warn); }
  .ws-unitp.is-empty { display: grid; justify-items: center; text-align: center; gap: 6px; padding: 36px 24px; color: var(--text-2); }
  .ws-unitp.is-empty svg { width: 28px; height: 28px; color: var(--text-3); }
  .ws-unitp.is-empty b { color: var(--ink); font-size: 16px; }
  .ws-provgrid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
  .ws-provcard { background: #fff; border-radius: 20px; padding: 24px; border: 1px solid var(--line); display: grid; gap: 12px; align-content: start; }
  .ws-provcard .prov { justify-self: start; height: 26px; font-size: 12.5px; }
  .ws-provcard p { font-weight: 600; color: var(--ink); line-height: 1.45; }
  .ws-provcard small { font-size: 13.5px; color: var(--text-2); line-height: 1.5; }
  .ws-cmp { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-radius: 28px; overflow: hidden; border: 1px solid var(--line); }
  .ws-cmp-col { padding: clamp(24px, 3vw, 40px); }
  .ws-cmp-col.a { background: var(--mint-50); }
  .ws-cmp-col.b { background: #fff; border-inline-start: 1px solid var(--line); }
  .ws-cmp-h { display: flex; align-items: center; gap: 14px; padding-bottom: 22px; border-bottom: 1px solid rgba(20,43,59,.1); margin-bottom: 8px; }
  .ws-cmp-h b { display: block; font-family: var(--font-display); font-size: 21px; margin-top: 2px; }
  .ws-cmp-ic { width: 28px; height: 28px; border-radius: 8px; background: var(--navy); color: #fff; display: grid; place-items: center; }
  .ws-cmp-ic svg { width: 16px; height: 16px; }
  .ws-cmp-r { padding: 16px 0; border-bottom: 1px solid rgba(20,43,59,.07); display: grid; grid-template-columns: 130px minmax(0, 1fr); gap: 16px; }
  .ws-cmp-r:last-child { border-bottom: 0; }
  .ws-cmp-r span { font-size: 13px; font-weight: 600; color: var(--text-3); padding-top: 2px; }
  .ws-cmp-r p { font-size: 15.5px; color: var(--ink); line-height: 1.55; }
  .ws-ex-more { margin-top: 28px; }

  /* ecosystem */
  .ws-eco-hero { padding: clamp(130px, 15vw, 190px) 0 clamp(24px, 3vw, 40px); background: radial-gradient(900px 500px at 50% 120%, #173A50 0%, rgba(23,58,80,0) 70%), var(--ws-deep); }
  .ws-eco-hero .ws-h1 { color: #fff; max-width: 15em; }
  .ws-eco-hero .ws-lead { max-width: 44em; }
  .ws-eco { background: var(--ws-deep); padding: 24px 0 clamp(64px, 8vw, 112px); }
  .ws-flowtabs { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 24px; }
  .ws-flowtabs .ws-fk { color: #8FA8B8; margin-inline-end: 8px; }
  .ws-flowtabs button { height: 40px; padding: 0 16px; border-radius: 99px; border: 1px solid rgba(255,255,255,.16); color: #DCE6EC; font-size: 14px; font-weight: 500; transition: background .2s, border-color .2s, color .2s; }
  .ws-flowtabs button:hover { border-color: rgba(255,255,255,.4); }
  .ws-flowtabs button.on { background: var(--mint); border-color: var(--mint); color: var(--navy); font-weight: 600; }
  .ws-eco-grid { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 24px; align-items: start; }
  .ws-eco-map { position: relative; width: 100%; border-radius: 28px; background: radial-gradient(circle at 50% 50%, rgba(54,214,160,.08), rgba(54,214,160,0) 60%), #0C1E2A; border: 1px solid rgba(255,255,255,.06); }
  .ws-eco-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .ws-eco-spoke { stroke: rgba(127,167,194,.18); stroke-width: 1; stroke-dasharray: 2 5; transition: stroke .3s; }
  .ws-eco-spoke.on { stroke: rgba(54,214,160,.6); stroke-dasharray: none; }
  .ws-eco-edge { fill: none; stroke: rgba(127,167,194,.22); stroke-width: 1.2; transition: stroke .3s, stroke-width .3s, opacity .3s; }
  .ws-eco-map.has-focus .ws-eco-edge { opacity: .35; }
  .ws-eco-edge.on { stroke: var(--mint); stroke-width: 2.2; opacity: 1 !important; }
  .ws-eco-flow { stroke: var(--mint); stroke-width: 2.5; opacity: 0; stroke-dasharray: 6 6; transition: opacity .3s; }
  .ws-eco-flow.on { opacity: 1; animation: wsDash 1s linear infinite; }
  @keyframes wsDash { to { stroke-dashoffset: -24; } }
  .ws-eco-pk { fill: #fff; opacity: 0; } .ws-eco-pk.on { opacity: 1; }
  .ws-eco-node { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 8px; width: 140px; text-align: center; color: #DCE6EC; transition: opacity .3s, color .3s; }
  .ws-eco-dot { width: 58px; height: 58px; border-radius: 50%; display: grid; place-items: center; background: #102A3B; border: 1.5px solid rgba(127,167,194,.4); color: #CFE0E8; transition: background .3s, border-color .3s, color .3s, transform .3s var(--ease), box-shadow .3s; }
  .ws-eco-dot svg { width: 24px; height: 24px; }
  .ws-eco-lbl { font-size: 14px; font-weight: 600; line-height: 1.3; padding: 3px 9px; border-radius: 8px; background: rgba(12,30,42,.88); }
  .ws-eco-map.has-focus .ws-eco-node { opacity: .45; }
  .ws-eco-node.on { opacity: 1 !important; }
  .ws-eco-node.on .ws-eco-dot { border-color: var(--mint); color: var(--mint); }
  .ws-eco-node.focus .ws-eco-dot { background: var(--mint); color: var(--navy); transform: scale(1.1); box-shadow: 0 0 0 8px rgba(54,214,160,.15); }
  .ws-eco-node.focus .ws-eco-lbl { color: #fff; }
  .ws-eco-node:hover .ws-eco-dot { border-color: var(--mint); }
  .ws-eco-center { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; pointer-events: none; }
  .ws-eco-bld { width: 92px; height: 92px; border-radius: 26px; background: var(--mint); color: var(--navy); display: grid; place-items: center; box-shadow: 0 0 0 12px rgba(54,214,160,.1), 0 0 0 26px rgba(54,214,160,.05); transition: transform .3s var(--ease); }
  .ws-eco-center.focus .ws-eco-bld { transform: scale(1.08); }
  .ws-eco-bld svg { width: 40px; height: 40px; }
  .ws-eco-cid { margin-top: 14px; font-size: 13px; font-weight: 700; color: var(--mint); }
  .ws-eco-clbl { font-size: 12.5px; color: #8FA8B8; }
  .ws-eco-side { background: #fff; color: var(--ink); border-radius: 24px; padding: 26px; min-height: 100%; }
  .ws-eco-side h3 { color: var(--ink); }
  .ws-eco-side .ws-more { color: var(--mint-ink); }
  .ws-eco-pn h3 { display: flex; align-items: center; gap: 12px; font-family: var(--font-display); font-size: 24px; margin-top: 6px; }
  .ws-eco-pic { width: 42px; height: 42px; border-radius: 12px; background: var(--mint-50); color: var(--mint-ink); display: grid; place-items: center; flex: none; }
  .ws-eco-pic svg { width: 21px; height: 21px; }
  .ws-eco-pn > p { color: var(--text-2); margin-top: 12px; line-height: 1.6; font-size: 15px; }
  .ws-eco-relk { margin-top: 22px; }
  .ws-eco-rel { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 2px; }
  .ws-eco-rel button { display: flex; gap: 12px; align-items: flex-start; width: 100%; padding: 10px; border-radius: 12px; text-align: start; transition: background .2s; }
  .ws-eco-rel button:hover { background: var(--surface-2); }
  .ws-eco-rel svg { width: 18px; height: 18px; color: var(--mint-ink); flex: none; margin-top: 2px; }
  .ws-eco-rel b { display: block; font-size: 14.5px; }
  .ws-eco-rel small { display: block; font-size: 13px; color: var(--text-2); }
  .ws-eco-pn-foot { margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--line-2); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .ws-flow-steps { list-style: none; margin: 16px 0 0; padding: 0; display: grid; gap: 4px; }
  .ws-flow-steps button { display: flex; gap: 12px; align-items: flex-start; width: 100%; text-align: start; padding: 10px; border-radius: 12px; transition: background .2s, opacity .2s; opacity: .6; }
  .ws-flow-steps li.done button, .ws-flow-steps li.on button { opacity: 1; }
  .ws-flow-steps li.on button { background: var(--mint-50); }
  .ws-fs-n { width: 26px; height: 26px; border-radius: 50%; border: 1.5px solid var(--line); display: grid; place-items: center; font-size: 12.5px; font-weight: 700; flex: none; color: var(--text-2); }
  .ws-flow-steps li.done .ws-fs-n { background: var(--navy); border-color: var(--navy); color: #fff; }
  .ws-flow-steps li.on .ws-fs-n { background: var(--mint); border-color: var(--mint); color: var(--navy); }
  .ws-flow-steps b { display: block; font-size: 14px; }
  .ws-flow-steps small { display: block; font-size: 13.5px; color: var(--text-2); line-height: 1.45; margin-top: 1px; }
  .ws-eco-note { margin-top: 22px; }
  .ws-why { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(20px, 3vw, 40px); }
  .ws-why-item { border-top: 1px solid var(--line); padding-top: 26px; }
  .ws-why-ic { width: 46px; height: 46px; border-radius: 14px; background: var(--navy); color: var(--mint); display: grid; place-items: center; margin-bottom: 20px; }
  .ws-why-ic svg { width: 22px; height: 22px; }
  .ws-why-item p { color: var(--text-2); margin-top: 10px; line-height: 1.65; }

  /* forms */
  .ws-f { display: flex; flex-direction: column; gap: 7px; min-width: 0; border: 0; margin: 0; padding: 0; }
  .ws-f.full { grid-column: 1 / -1; }
  .ws-f > label, .ws-f > legend { font-size: 14px; font-weight: 600; color: var(--ink); display: flex; align-items: baseline; gap: 4px; padding: 0; }
  .ws-f > label i, .ws-f > legend i { color: var(--mint-ink); font-style: normal; }
  .ws-opt { font-weight: 400; color: var(--text-3); font-size: 12.5px; margin-inline-start: 4px; }
  .ws-in { width: 100%; height: 50px; border-radius: 12px; border: 1px solid #D5DFDB; background: #fff; padding: 0 16px; font-size: 15.5px; color: var(--ink); transition: border-color .2s, box-shadow .2s; }
  .ws-in::placeholder { color: #A3B0BB; }
  .ws-in:focus { outline: none; border-color: var(--mint-ink); box-shadow: 0 0 0 4px rgba(54,214,160,.18); }
  .ws-ta { height: auto; padding: 14px 16px; resize: vertical; min-height: 110px; line-height: 1.5; }
  .ws-sel { appearance: none; -webkit-appearance: none; padding-inline-end: 42px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2355667A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; background-size: 18px; }
  html[dir="rtl"] .ws-sel { background-position: left 14px center; }
  .ws-f.bad .ws-in { border-color: var(--bad); }
  .ws-f.bad .ws-in:focus { box-shadow: 0 0 0 4px rgba(194,54,47,.14); }
  .ws-err { font-size: 13px; color: var(--bad); min-height: 0; }
  .ws-err:empty { display: none; }
  .ws-checks { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; }
  .ws-check, .ws-consent { position: relative; display: inline-flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14.5px; }
  .ws-check { height: 44px; padding: 0 16px 0 12px; padding-inline: 12px 16px; border-radius: 99px; border: 1px solid #D5DFDB; background: #fff; transition: border-color .2s, background .2s; }
  .ws-check input, .ws-consent input { position: absolute; opacity: 0; width: 1px; height: 1px; }
  .ws-check > span, .ws-consent > span { width: 20px; height: 20px; border-radius: 6px; border: 1.5px solid #B9C8C2; display: grid; place-items: center; color: transparent; flex: none; transition: background .2s, border-color .2s, color .2s; background: #fff; }
  .ws-check > span svg, .ws-consent > span svg { width: 14px; height: 14px; }
  .ws-check:has(input:checked) { border-color: var(--mint-ink); background: var(--mint-50); }
  .ws-check input:checked + span, .ws-consent input:checked + span { background: var(--mint-ink); border-color: var(--mint-ink); color: #fff; }
  .ws-check input:focus-visible + span, .ws-consent input:focus-visible + span { box-shadow: 0 0 0 4px rgba(54,214,160,.3); }
  .ws-consent { align-items: flex-start; line-height: 1.45; color: var(--text-2); }
  .ws-f > label.ws-consent { font-weight: 400; display: inline-flex; color: var(--text-2); font-size: 14.5px; align-items: flex-start; gap: 10px; }
  .ws-consent.small { font-size: 14px; align-items: center; }
  .ws-spin { width: 18px; height: 18px; border-radius: 50%; border: 2px solid currentColor; border-top-color: transparent; animation: wsSpin .8s linear infinite; }
  @keyframes wsSpin { to { transform: rotate(360deg); } }

  /* contact */
  .ws-contact { padding: clamp(120px, 14vw, 170px) 0 clamp(64px, 8vw, 120px); background: linear-gradient(180deg, #F4F7F6 0%, #fff 60%); }
  .ws-contact-grid { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: clamp(32px, 6vw, 96px); align-items: start; }
  .ws-contact-text { position: sticky; top: 110px; }
  .ws-expect { list-style: none; margin: 40px 0 0; padding: 0; display: grid; gap: 0; border-top: 1px solid var(--line); }
  .ws-expect li { display: flex; gap: 18px; padding: 18px 0; border-bottom: 1px solid var(--line); }
  .ws-expect li > span { font-family: var(--font-display); font-weight: 700; font-size: 13px; color: var(--mint-ink); padding-top: 3px; }
  .ws-expect b { display: block; font-size: 16px; }
  .ws-expect small { display: block; font-size: 14.5px; color: var(--text-2); margin-top: 2px; }
  .ws-contact-note { display: flex; gap: 12px; margin-top: 28px; padding: 16px 18px; border-radius: 16px; background: var(--mint-50); color: var(--ink); font-size: 14px; line-height: 1.55; }
  .ws-contact-note svg { width: 18px; height: 18px; color: var(--mint-ink); flex: none; margin-top: 2px; }
  .ws-contact-card { background: #fff; border-radius: 28px; padding: clamp(24px, 3.4vw, 44px); border: 1px solid rgba(20,43,59,.07); box-shadow: 0 50px 100px -50px rgba(13,31,43,.35); }
  .ws-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px 18px; }
  .ws-form-foot { display: flex; align-items: center; flex-wrap: wrap; gap: 16px; margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--line-2); }
  .ws-done { text-align: center; display: grid; justify-items: center; gap: 14px; padding: 36px 8px; }
  .ws-done-ic { width: 72px; height: 72px; border-radius: 50%; background: var(--mint); color: var(--navy); display: grid; place-items: center; box-shadow: 0 0 0 12px rgba(54,214,160,.15); animation: wsPop .5s var(--ease); }
  .ws-done-ic svg { width: 34px; height: 34px; stroke-width: 2.4; }
  @keyframes wsPop { from { transform: scale(.6); opacity: 0; } }
  .ws-done h2 { margin-top: 10px; font-size: 28px; }
  .ws-done p { color: var(--text-2); max-width: 30em; line-height: 1.6; }
  .ws-done-ref { display: inline-flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--line); font-size: 14px; }
  .ws-done-ref .ws-mono { font-weight: 700; }
  .ws-done-note { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-3); }
  .ws-done-note svg { width: 15px; height: 15px; }
  .ws-done-act { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 10px; }

  /* login */
  .ws-login { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); min-height: 100vh; }
  .ws-login-brand { position: relative; overflow: hidden; padding: 128px clamp(24px, 4vw, 64px) 48px; display: flex; }
  .ws-login-art { position: absolute; inset-inline: 0; bottom: 0; height: 55%; opacity: .35; pointer-events: none; }
  .ws-login-art svg { width: 100%; height: 100%; }
  .ws-login-bi { position: relative; display: flex; flex-direction: column; max-width: 560px; }
  .ws-login-bi .ws-h1 { color: #fff; font-size: clamp(36px, 3.8vw, 58px); }
  .ws-login-bi .ws-lead { font-size: 17px; }
  .ws-login-tower { width: 230px; margin: 36px 0 24px; }
  .ws-login-tower .ws-tower { width: 100%; height: auto; }
  .ws-login-honest { margin-top: auto; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: #8FA8B8; }
  .ws-login-honest svg { width: 16px; height: 16px; color: var(--mint); }
  .ws-login-main { background: #F4F7F6; padding: 112px clamp(20px, 4vw, 64px) 56px; display: grid; gap: 32px; align-content: start; }
  .ws-login-main > * { width: 100%; max-width: 740px; }
  .ws-login-card { background: #fff; border-radius: 26px; padding: clamp(24px, 3vw, 40px); border: 1px solid rgba(20,43,59,.07); box-shadow: 0 40px 80px -50px rgba(13,31,43,.35); }
  .ws-login-card > .ws-small { margin-top: 6px; display: block; }
  .ws-login-form { display: grid; gap: 16px; margin-top: 22px; }
  .ws-login-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .ws-linkbtn { font-size: 14px; font-weight: 600; color: var(--mint-ink); }
  .ws-login-err { font-size: 13.5px; color: var(--bad); }
  .ws-login-err:empty { display: none; }
  .ws-login-ws-h { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
  .ws-login-ws-h .ws-h3 { font-size: 20px; }
  .ws-wsgrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .ws-wscard { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 16px; background: #fff; border: 1px solid var(--line); transition: border-color .2s, transform .25s var(--ease), box-shadow .25s; }
  .ws-wscard:hover { border-color: var(--mint); transform: translateY(-2px); box-shadow: 0 16px 30px -20px rgba(13,31,43,.35); }
  .ws-wscard-ic { width: 42px; height: 42px; border-radius: 12px; background: var(--navy); color: var(--mint); display: grid; place-items: center; flex: none; }
  .ws-wscard-ic svg { width: 20px; height: 20px; }
  .ws-wscard.mobile .ws-wscard-ic { background: var(--mint); color: var(--navy); }
  .ws-wscard-t { flex: 1; min-width: 0; }
  .ws-wscard-t b { display: block; font-size: 15px; }
  .ws-wscard-t small { display: block; font-size: 13px; color: var(--text-2); }
  .ws-wscard-go { width: 18px; height: 18px; color: var(--text-3); flex: none; }

  /* responsive */
  @media (max-width: 1180px) {
    .ws-provgrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ws-eco-grid { grid-template-columns: minmax(0, 1fr); }
    .ws-login { grid-template-columns: minmax(0, 1fr); }
    .ws-login-brand { padding-top: 112px; padding-bottom: 40px; }
    .ws-login-tower { display: none; }
    .ws-login-honest { margin-top: 24px; }
    .ws-login-main { padding-top: 40px; justify-items: center; }
    .ws-links { grid-template-columns: minmax(0, 1fr); gap: 14px; }
    .ws-lk-core { order: -1; padding: 10px 0 18px; }
    .ws-lk-card { aspect-ratio: auto; max-width: 340px; }
    .ws-lk-tile::after { display: none; }
  }
  @media (max-width: 960px) {
    .ws-essay-grid { grid-template-columns: minmax(0, 1fr); gap: 8px; }
    .ws-essay-n { position: static; font-size: 44px; }
    .ws-essay-split { grid-template-columns: minmax(0, 1fr); }
    .ws-sol-grid { grid-template-columns: minmax(0, 1fr); }
    .ws-sol.ws-sol-rev .ws-sol-text { order: 0; }
    .ws-explorer { grid-template-columns: minmax(0, 1fr); }
    .ws-ex-tower { position: relative; top: auto; }
    .ws-ex-tower .ws-tower { max-height: 460px; }
    .ws-contact-grid { grid-template-columns: minmax(0, 1fr); }
    .ws-contact-text { position: static; }
    .ws-cmp { grid-template-columns: minmax(0, 1fr); }
    .ws-cmp-col.b { border-inline-start: 0; border-top: 1px solid var(--line); }
    .ws-why { grid-template-columns: minmax(0, 1fr); }
  }
  @media (max-width: 720px) {
    .ws-eco-node { width: 110px; }
    .ws-eco-dot { width: 52px; height: 52px; }
    .ws-eco-lbl { font-size: 13px; }
    .ws-eco-bld { width: 76px; height: 76px; border-radius: 22px; }
    .ws-eco-bld svg { width: 32px; height: 32px; }
  }
  @media (max-width: 640px) {
    .ws-scatter { grid-template-columns: minmax(0, 1fr); }
    .ws-sc-arrow { transform: rotate(90deg); height: 36px; }
    .ws-sc-list { grid-template-columns: minmax(0, 1fr); }
    .ws-princ { grid-template-columns: minmax(0, 1fr); }
    .ws-caps { grid-template-columns: minmax(0, 1fr); }
    .ws-segnav { top: 60px; }
    .ws-vis-muni { padding: 0; display: grid; gap: 10px; }
    .ws-vis-muni .ws-float { position: static; width: auto; box-shadow: 0 10px 30px -18px rgba(13,31,43,.35); }
    .ws-vm-map { height: 260px; }
    .ws-vo-head { grid-template-columns: 1fr 1fr; }
    .ws-vo-head > div:first-child { grid-column: 1 / -1; }
    .ws-vrow { flex-wrap: wrap; }
    .ws-vrow-e { flex-direction: row; align-items: center; width: 100%; justify-content: space-between; padding-inline-start: 50px; }
    .ws-vt-h, .ws-vt-r { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) 46px; gap: 8px; }
    .ws-vt-o { grid-template-columns: minmax(0, 1fr); }
    .ws-vt-o small { display: none; }
    .ws-va { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
    .ws-ui-body { padding: 14px; }
    .ws-provgrid { grid-template-columns: minmax(0, 1fr); }
    .ws-cmp-r { grid-template-columns: minmax(0, 1fr); gap: 4px; }
    .ws-idbig { padding: 20px; }
    .ws-idbig-rows > div { flex-wrap: wrap; }
    .ws-ex-tower { padding: 60px 12px 16px; }
    .ws-floorp, .ws-unitp { padding: 18px; }
    .ws-unit { padding: 12px; min-height: 100px; }
    .ws-unit-n { font-size: 21px; }
    .ws-form-grid { grid-template-columns: minmax(0, 1fr); }
    .ws-form-foot .ws-btn { width: 100%; }
    .ws-wsgrid { grid-template-columns: minmax(0, 1fr); }
    .ws-eco-side { padding: 20px; }
    .ws-flowtabs .ws-fk { width: 100%; }
    .ws-phone { width: 270px; }
  }
  `);
})();
