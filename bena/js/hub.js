/*
 * BENA demo hub (#hub) — the unified entry point: choose an experience
 * (public website · enterprise web app · mobile app), a demo role, and a language.
 */
(function () {
  const B = (window.B = window.B || {});
  const { tx, L, icon, esc } = B;

  B.css(`
  .hb { min-height: 100vh; background: var(--bg); color: var(--ink); }
  .hb-wrap { max-width: 1240px; margin: 0 auto; padding: calc(28px + env(safe-area-inset-top, 0px)) 32px 56px; display: flex; flex-direction: column; gap: 44px; }
  .hb-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .hb-top .brand { color: var(--navy); }
  .hb-intro { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 40px; align-items: end; }
  .hb-intro h1 { font-size: clamp(34px, 4.6vw, 56px); line-height: 1.04; letter-spacing: -.03em; }
  html[dir="rtl"] .hb-intro h1 { line-height: 1.25; letter-spacing: 0; }
  .hb-intro h1 em { font-style: normal; color: var(--mint-ink); }
  .hb-intro p { color: var(--text-2); font-size: 16px; max-width: 54ch; }
  .hb-note { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; color: var(--text-2); padding: 14px 16px; border-radius: 14px; border: 1px dashed #B9C6CF; background: #fff; }
  .hb-note svg { width: 18px; height: 18px; color: var(--mint-ink); flex: none; margin-top: 1px; }
  .hb-exps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .hb-exp { background: #fff; border: 1px solid var(--line); border-radius: 22px; overflow: hidden; display: flex; flex-direction: column; text-align: start; transition: transform .25s var(--ease), box-shadow .25s var(--ease), border-color .25s; }
  .hb-exp:hover { transform: translateY(-3px); box-shadow: var(--shadow-2); border-color: #CFDAD6; }
  .hb-prev { height: 220px; position: relative; overflow: hidden; background: #E9EFEC; }
  .hb-body { padding: 20px 22px 22px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
  .hb-body .eyebrow { color: var(--mint-ink); }
  .hb-body h3 { font-size: 21px; }
  .hb-body p { font-size: 14px; color: var(--text-2); }
  .hb-body .go { margin-top: auto; padding-top: 10px; display: inline-flex; align-items: center; gap: 6px; font-weight: 600; font-size: 14px; color: var(--ink); }
  .hb-body .go svg { width: 16px; height: 16px; color: var(--mint-ink); }
  /* previews */
  .pv-site { position: absolute; inset: 18px 18px -10px; border-radius: 12px 12px 0 0; background: var(--navy); overflow: hidden; box-shadow: 0 10px 30px rgba(13,31,43,.25); }
  .pv-site .bar { height: 18px; background: #0D1F2B; display: flex; gap: 5px; align-items: center; padding: 0 8px; }
  .pv-site .bar i { width: 6px; height: 6px; border-radius: 6px; background: #2C4659; }
  .pv-site .art { position: absolute; inset: 18px 0 0 46%; }
  .pv-site .art svg { width: 100%; height: 100%; }
  .pv-site .txt { position: absolute; inset-inline-start: 16px; top: 46px; width: 48%; display: flex; flex-direction: column; gap: 7px; }
  .pv-site .txt b { color: #fff; font-family: var(--font-display); font-size: 17px; line-height: 1.1; }
  .pv-site .txt b em { font-style: normal; color: var(--mint); }
  .pv-site .txt i { display: block; height: 6px; border-radius: 4px; background: rgba(255,255,255,.18); }
  .pv-site .txt span { width: 60px; height: 16px; border-radius: 8px; background: var(--mint); margin-top: 4px; }
  .pv-app { position: absolute; inset: 18px 18px -10px; border-radius: 12px 12px 0 0; background: #fff; overflow: hidden; display: grid; grid-template-columns: 54px 1fr; box-shadow: 0 10px 30px rgba(13,31,43,.18); }
  .pv-app .sb { background: var(--navy); display: flex; flex-direction: column; gap: 8px; padding: 10px 9px; }
  .pv-app .sb i { height: 7px; border-radius: 4px; background: rgba(255,255,255,.16); }
  .pv-app .sb i.on { background: var(--mint); }
  .pv-app .ws { padding: 10px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; align-content: start; }
  .pv-app .ws .k { height: 30px; border-radius: 6px; background: var(--surface-2); border: 1px solid var(--line-2); }
  .pv-app .ws .mp { grid-column: span 2; height: 100px; border-radius: 6px; overflow: hidden; position: relative; }
  .pv-app .ws .mp > div { position: absolute; inset: 0; }
  .pv-app .ws .tb { height: 100px; border-radius: 6px; background: repeating-linear-gradient(180deg, #fff 0 15px, #EDF2F0 15px 16px); border: 1px solid var(--line-2); }
  .pv-mob { position: absolute; left: 50%; top: 18px; width: 150px; margin-left: -75px; height: 260px; border-radius: 26px; background: #0B1218; padding: 6px; box-shadow: 0 14px 34px rgba(13,31,43,.28); }
  .pv-mob .scr { width: 100%; height: 100%; border-radius: 21px; background: var(--bg); overflow: hidden; padding: 22px 10px 0; display: flex; flex-direction: column; gap: 7px; }
  .pv-mob .scr b { font-family: var(--font-display); font-size: 15px; }
  .pv-mob .scr .c { height: 54px; border-radius: 10px; background: var(--navy); }
  .pv-mob .scr .r { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
  .pv-mob .scr .r i { height: 34px; border-radius: 8px; background: #fff; border: 1px solid var(--line-2); }
  .pv-mob .scr .l { height: 14px; border-radius: 6px; background: #fff; }
  .hb-sec-h { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
  .hb-sec-h h2 { font-size: 24px; }
  .hb-sec-h p { color: var(--text-2); font-size: 14px; margin-top: 4px; }
  .hb-roles { background: #fff; border: 1px solid var(--line); border-radius: 22px; overflow: hidden; }
  .hb-role { display: grid; grid-template-columns: 44px minmax(0, 1.3fr) minmax(0, 2fr) 250px; gap: 16px; align-items: center; padding: 14px 20px; border-top: 1px solid var(--line-2); }
  .hb-role:first-child { border-top: 0; }
  .hb-role .ri { width: 44px; height: 44px; border-radius: 13px; background: var(--navy); color: var(--mint); display: grid; place-items: center; }
  .hb-role .ri svg { width: 21px; height: 21px; }
  .hb-role b { font-size: 15px; display: block; }
  .hb-role small { font-size: 12.5px; color: var(--text-3); display: block; }
  .hb-role p { font-size: 13.5px; color: var(--text-2); }
  .hb-role .acts { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
  .hb-foot { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; font-size: 12.5px; color: var(--text-3); border-top: 1px solid var(--line); padding-top: 18px; }
  @media (max-width: 1000px) { .hb-exps { grid-template-columns: 1fr; } .hb-intro { grid-template-columns: 1fr; gap: 18px; } .hb-prev { height: 190px; } }
  @media (max-width: 760px) {
    .hb-wrap { padding-inline: 16px; gap: 32px; }
    .hb-role { grid-template-columns: 40px minmax(0, 1fr); padding: 14px 16px; }
    .hb-role p { grid-column: 2; }
    .hb-role .acts { grid-column: 1 / -1; justify-content: flex-start; }
    .hb-role .acts .btn { flex: 1; }
  }
  `);

  /* Demo roles → experiences (web app route and/or mobile route). */
  const ROLES = [
    { id: 'municipality', icon: 'landmark', name: T('Municipality', 'البلدية'), who: T('Eng. Maha Awad · GIS & Building Registry (sample)', 'م. مها عوض · وحدة نظم المعلومات وسجل المباني (نموذج)'), what: T('Registry, GIS explorer, verification, matching and data quality.', 'السجل ومستكشف الخرائط والتحقق والمطابقة وجودة البيانات.'), web: 'municipality-home' },
    { id: 'muniadmin', icon: 'settings', name: T('Municipal Administrator', 'مسؤول البلدية'), who: T('Municipal tenant administration (sample)', 'إدارة حساب البلدية (نموذج)'), what: T('Users, roles, data sources, verification rules and audit.', 'المستخدمون والأدوار ومصادر البيانات وقواعد التحقق والتدقيق.'), web: 'muniadmin-home' },
    { id: 'owner', icon: 'key', name: T('Property Owner', 'مالك العقار'), who: T('Khaled Mansour · 6 units', 'خالد منصور · 6 وحدات'), what: T('Properties, ownership relationships, leases, income and representatives.', 'العقارات وعلاقات الملكية والعقود والدخل والممثلون.'), web: 'owner-home', mobile: 'm-owner-home' },
    { id: 'resident', icon: 'home', name: T('Resident / Tenant', 'ساكن / مستأجر'), who: T('Lina Haddad · Unit 803', 'لينا حداد · الوحدة 803'), what: T('Home, building, maintenance, payments and services.', 'المنزل والمبنى والصيانة والمدفوعات والخدمات.'), mobile: 'm-resident-home', web: 'resident-home' },
    { id: 'committee', icon: 'users', name: T('Building Committee', 'لجنة المبنى'), who: T('Samer Khoury · Chair, Owners\' Association', 'سامر خوري · رئيس جمعية المالكين'), what: T('Governance, meetings, voting, budget and maintenance.', 'الحوكمة والاجتماعات والتصويت والموازنة والصيانة.'), web: 'committee-home', mobile: 'm-committee-home' },
    { id: 'manager', icon: 'briefcase', name: T('Property Manager', 'مدير العقارات'), who: T('Rania Odeh · Arkan Property Management', 'رانيا عودة · أركان لإدارة العقارات'), what: T('Portfolio, occupancy, leases, rent, receivables and reports.', 'المحفظة والإشغال والعقود والإيجارات والذمم والتقارير.'), web: 'manager-home' },
    { id: 'facility', icon: 'settings', name: T('Facility Manager', 'مدير المرافق'), who: T('Omar Saleh · Sanad Facility Services', 'عمر صالح · سند لخدمات المرافق'), what: T('Assets, work orders, preventive maintenance and inspections.', 'الأصول وأوامر العمل والصيانة الوقائية والفحوصات.'), web: 'facility-home' },
    { id: 'provider', icon: 'wrench', name: T('Service Provider', 'مزوّد الخدمة'), who: T('Yousef Jaber · Jaber Technical Services', 'يوسف جابر · جابر للخدمات الفنية'), what: T('Requests, quotations, jobs, schedule and performance.', 'الطلبات وعروض الأسعار والمهام والجدول والأداء.'), web: 'provider-home', mobile: 'm-provider-home' },
    { id: 'tech', icon: 'tool', name: T('Field Technician', 'فني ميداني'), who: T('On-site technician · Sanad Facility Services', 'فني ميداني · سند لخدمات المرافق'), what: T('Assigned jobs, instructions, photos and completion — built for use on the move.', 'المهام المسندة والتعليمات والصور والإنجاز — مصمَّم للاستخدام أثناء التنقل.'), mobile: 'm-tech-home' },
    { id: 'admin', icon: 'shield', name: T('Platform Administrator', 'مدير المنصة'), who: T('Dana Salem · BENA Platform Ops', 'دانا سالم · عمليات منصة BENA'), what: T('Organizations, users, permissions, categories, data sources and audit.', 'المؤسسات والمستخدمون والصلاحيات والفئات ومصادر البيانات والتدقيق.'), web: 'admin-home' },
  ];
  function T(en, ar) { return { en, ar }; }
  B.demoRoles = ROLES;

  B.exp.hub = () => {
    const mini = B.map.render({ id: 'hub-mini', static: true, focus: 'BN-RAM-00142', focusW: 200, selected: 'BN-RAM-00142', legend: false, badge: false, height: '100px', layers: { parcels: true, labels: false } });
    const exps = [
      { go: 'site', eyebrow: L('Experience 1', 'التجربة 1'), title: L('Public website', 'الموقع العام'), text: L('The story of BENA for the public, institutions, municipalities and partners — editorial and immersive.', 'قصة BENA للجمهور والمؤسسات والبلديات والشركاء — تحريرية وغامرة.'), prev: `<div class="pv-site"><div class="bar"><i></i><i></i><i></i></div><div class="art">${B.art.facade(142, { type: 'residential', floors: 10, sky: 'navy' })}</div><div class="txt"><b>${L('Every building has an <em>identity.</em>', 'لكل مبنى <em>هوية.</em>')}</b><i style="width:90%"></i><i style="width:70%"></i><span></span></div></div>` },
      { go: 'municipality-home', eyebrow: L('Experience 2', 'التجربة 2'), title: L('Enterprise web application', 'تطبيق الويب المؤسسي'), text: L('Desktop-first workspaces for municipalities, property and facility managers, committees, providers and administrators.', 'مساحات عمل مكتبية للبلديات ومديري العقارات والمرافق واللجان ومزودي الخدمات والمسؤولين.'), prev: `<div class="pv-app"><div class="sb"><i class="on"></i><i></i><i></i><i></i><i></i></div><div class="ws"><div class="k"></div><div class="k"></div><div class="k"></div><div class="mp"><div>${mini}</div></div><div class="tb"></div></div></div>` },
      { go: 'm', eyebrow: L('Experience 3', 'التجربة 3'), title: L('Mobile application', 'تطبيق الجوال'), text: L('A touch-first app for residents, owners, committees, field technicians and service providers.', 'تطبيق يعتمد على اللمس للسكان والمالكين واللجان والفنيين الميدانيين ومزودي الخدمات.'), prev: `<div class="pv-mob"><div class="scr"><b>${L('Home', 'الرئيسية')}</b><div class="c"></div><div class="r"><i></i><i></i></div><div class="l"></div><div class="l" style="width:70%"></div></div></div>` },
    ];
    return `<div class="hb" data-exp-root="hub"><div class="hb-wrap">
      <div class="hb-top"><div class="brand dark">${B.logo(36)}<span>BENA<small style="color:var(--text-3)">${L('Product prototype · demo hub', 'النموذج الأولي للمنتج · مركز العرض')}</small></span></div>
        <div class="row-sm"><button class="lang-btn" data-act="lang">${B.isAr() ? 'English' : 'العربية'}</button></div></div>
      <div class="hb-intro">
        <div><div class="eyebrow" style="color:var(--mint-ink);margin-bottom:12px">${L('Buildings. People. Services. Connected.', 'مبانٍ. أشخاص. خدمات. متصلة.')}</div>
          <h1>${L('One platform.<br><em>Three experiences.</em>', 'منصة واحدة.<br><em>ثلاث تجارب.</em>')}</h1></div>
        <div class="stack"><p>${L('BENA proposes a digital identity for every building and a connected ecosystem of the people and services around it. Explore the public website, the enterprise web application and the mobile app — each designed for how it is used.', 'تقترح BENA هويةً رقمية لكل مبنى ومنظومةً متصلة من الأشخاص والخدمات من حوله. استكشف الموقع العام وتطبيق الويب المؤسسي وتطبيق الجوال — صُمّمت كلٌّ منها وفق طريقة استخدامها.')}</p>
          <div class="hb-note">${icon('info')}<span>${L('Interactive prototype. All buildings, people, IDs and figures are fictional sample data. BENA is presented as a vision — not an official registry and not connected to any municipality.', 'نموذج تفاعلي. جميع المباني والأشخاص والأرقام والمعرّفات بيانات نموذجية وهمية. تُعرض BENA كرؤية — وليست سجلاً رسمياً ولا مرتبطة بأي بلدية.')}</span></div></div>
      </div>
      <div class="hb-exps">${exps.map((x) => `<button class="hb-exp" data-go="${x.go}"><div class="hb-prev">${x.prev}</div><div class="hb-body"><div class="eyebrow">${x.eyebrow}</div><h3>${x.title}</h3><p>${x.text}</p><span class="go">${L('Open', 'فتح')}${icon('arrowRight', 'flip')}</span></div></button>`).join('')}</div>
      <section><div class="hb-sec-h"><div><h2>${L('Explore by demo role', 'استكشف حسب الدور التجريبي')}</h2><p>${L('No sign-in — each role opens its own experience. Switch roles any time from inside the app.', 'دون تسجيل دخول — يفتح كل دور تجربته الخاصة. يمكنك التبديل في أي وقت من داخل التطبيق.')}</p></div>
        <div class="row-sm wrap">${B.ui.badge(L('Web app', 'تطبيق الويب'), 'navy', 'grid')}${B.ui.badge(L('Mobile app', 'تطبيق الجوال'), 'mint', 'phone')}</div></div>
        <div class="hb-roles">${ROLES.map((r) => `<div class="hb-role"><span class="ri">${icon(r.icon)}</span><div style="min-width:0"><b>${tx(r.name)}</b><small>${tx(r.who)}</small></div><p>${tx(r.what)}</p>
          <div class="acts">${r.web ? B.ui.btn(L('Web app', 'تطبيق الويب'), { kind: 'dark', size: 'sm', icon: 'grid', go: r.web }) : ''}${r.mobile ? B.ui.btn(L('Mobile app', 'تطبيق الجوال'), { kind: 'primary', size: 'sm', icon: 'phone', go: r.mobile }) : ''}</div></div>`).join('')}</div>
      </section>
      <div class="hb-foot"><span>${L('BENA prototype · frontend-only · data resets on reload', 'نموذج BENA الأولي · واجهات فقط · تُعاد البيانات عند التحديث')}</span><span>${L('Sample locations: Ramallah, Al-Bireh, Birzeit — not affiliated with any municipality', 'مواقع نموذجية: رام الله، البيرة، بيرزيت — دون أي ارتباط بأي بلدية')}</span></div>
    </div></div>`;
  };
})();
