/*
 * BENA shell — welcome screen, role selection, responsive navigation
 * (desktop sidebar, tablet icon rail, phone top bar + bottom tabs or drawer).
 */
(function () {
  const B = (window.B = window.B || {});
  const { tx, L, icon, esc } = B;
  const ORDER = ['municipality', 'owner', 'resident', 'committee', 'manager', 'facility', 'provider', 'admin'];
  const roles = () => ORDER.filter((id) => B.roles[id]).map((id) => B.roles[id]).concat(B.roleOrder.filter((id) => !ORDER.includes(id)).map((id) => B.roles[id]));

  /* ---------------- welcome ---------------- */
  B.welcome = () => {
    const D = B.data;
    return `<div class="welcome">
      <div class="welcome-art">${B.art.skyline()}</div>
      <div class="welcome-inner">
        <div class="welcome-top">
          <div class="brand">${B.logo(36)}<span>BENA<small>${L('National building identity & services', 'الهوية الوطنية للمباني والخدمات')}</small></span></div>
          <div class="row-sm"><span class="demo-chip">${icon('info')}${L('Interactive prototype', 'نموذج تفاعلي')}</span><button class="lang-btn on-dark" data-act="lang">${B.isAr() ? 'English' : 'العربية'}</button></div>
        </div>
        <div class="welcome-hero">
          <div>
            <div class="eyebrow" style="color:var(--mint);margin-bottom:14px">${L('Buildings. People. Services. Connected.', 'مبانٍ. أشخاص. خدمات. متصلة.')}</div>
            <h1>${L('One digital identity<br>for <em>every building</em>.', 'هوية رقمية واحدة<br>لـ<em>كل مبنى</em>.')}</h1>
            <p class="lead">${L('BENA links each building to its municipal record, its owners and residents, the committee that runs it and the services that keep it working — in one connected ecosystem.', 'تربط بينا كل مبنى بسجله البلدي ومالكيه وسكانه واللجنة التي تديره والخدمات التي تحافظ عليه — ضمن منظومة واحدة متصلة.')}</p>
            <div class="row wrap" style="margin-top:26px;gap:10px">
              <button class="btn btn-primary btn-lg" data-go="resident-home">${icon('phone')}${L('Try the resident app', 'جرّب تطبيق السكان')}</button>
              <button class="btn btn-lg" style="background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.18)" data-go="municipality-explorer">${icon('map')}${L('Open the GIS explorer', 'افتح مستكشف الخرائط')}</button>
            </div>
          </div>
          <div class="stack">
            <div class="pillars">
              <div class="pillar"><h3>${icon('fingerprint')}${L('National Building Identity', 'الهوية الوطنية للمباني')}</h3><p>${L('Digital registry, municipal GIS links, independent registration and verification.', 'سجل رقمي، ربط بنظم المعلومات البلدية، تسجيل مستقل وتحقق.')}</p></div>
              <div class="pillar"><h3>${icon('handshake')}${L('Commercial Building Ecosystem', 'منظومة المباني التجارية')}</h3><p>${L('Ownership, tenancy, committees, finances, facilities and two marketplaces.', 'الملكية والإيجار واللجان والمالية والمرافق وسوقان رقميان.')}</p></div>
            </div>
            <div class="pillar" style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
              ${[[B.num(D.city.total), L('buildings in the sample city', 'مبنى في المدينة النموذجية')], [B.pct((D.city.gis / D.city.total) * 100, 1), L('linked to municipal GIS', 'مرتبط بنظم البلدية')], [B.num(D.city.units), L('mapped units', 'وحدة مُخططة')]].map(([v, l]) => `<div><b style="color:#fff;font-family:var(--font-display);font-size:22px" class="num">${v}</b><div class="xs" style="color:var(--navy-ink)">${l}</div></div>`).join('')}
            </div>
          </div>
        </div>
        <div class="stack">
          <div class="roles-head"><div><h2>${L('Choose a role to explore', 'اختر دوراً للاستكشاف')}</h2><p>${L('Each role opens its own experience. You can switch at any time.', 'يفتح كل دور تجربته الخاصة. يمكنك التبديل في أي وقت.')}</p></div></div>
          <div class="role-grid">${roles().map((r) => `
            <button class="role-card" data-go="${r.id}-${r.home || 'home'}">
              <div class="row between"><span class="ri">${icon(r.icon)}</span><span class="pill-tag">${tx(r.tag)}</span></div>
              <div><h3>${tx(r.name)}</h3><p style="margin-top:4px">${tx(r.desc)}</p></div>
              <div class="go"><span>${tx(r.personaTitle || '')}</span>${icon('arrowRight', 'flip')}</div>
            </button>`).join('')}</div>
        </div>
        <div class="welcome-foot"><span>${L('UI/UX prototype · all names, buildings and figures are fictional demonstration data', 'نموذج واجهات · جميع الأسماء والمباني والأرقام بيانات تجريبية وهمية')}</span><span>${L('Sample municipality: Ramallah — not affiliated with or endorsed by the municipality', 'البلدية النموذجية: رام الله — غير مرتبطة بالبلدية أو معتمدة منها')}</span></div>
      </div>
    </div>`;
  };

  /* ---------------- shell ---------------- */
  const navItems = (r) => r.menu.filter((m) => m.id);
  const activeId = (r, route) => {
    if (B._navActive) return B._navActive;
    const items = navItems(r);
    const exact = items.find((m) => m.id === route.page);
    if (exact) return exact.id;
    const m = items.find((x) => (x.match || []).includes(route.page));
    return m ? m.id : null;
  };

  const groupOf = (r, id) => { let g = null; for (const m of r.menu) { if (m.group) g = m.group; else if (m.id === id) return g; } return null; };

  B.shell = {
    render(route) {
      const r = B.roles[route.role];
      const fn = (r.pages && r.pages[route.page]) || B.shared[route.page];
      const content = fn ? fn(route.id, route) : notFound(r);
      const act = activeId(r, route);
      const actItem = navItems(r).find((m) => m.id === act);
      const title = B._title || (actItem ? tx(actItem.label) : tx(r.name));
      const D = B.data;
      const me = D.person(D.me[r.id]);
      const tabs = r.nav === 'tabs';
      const collapsed = B.store.get('sbc', false);
      const home = `${r.id}-${r.home || 'home'}`;
      const g = act ? groupOf(r, act) : null;
      const crumbs = B._crumbs || [{ label: r.org || r.name, go: home }, ...(g ? [{ label: g }] : []), ...(actItem && B._title && route.page !== act ? [{ label: actItem.label, go: `${r.id}-${act}` }] : []), { label: title }];
      const crumbHtml = crumbs.map((c, i) => (i === crumbs.length - 1 ? `<b class="truncate">${tx(c.label)}</b>` : c.go ? `<button class="cr-link truncate" data-go="${c.go}">${tx(c.label)}</button>` : `<span class="truncate">${tx(c.label)}</span>`)).join(icon('chevR', 'flip'));
      const ws = r.workspaces && r.workspaces.length ? r.workspaces : null;
      const wsCur = ws ? (ws.find((w) => w.id === B.get(`ws:${r.id}`)) || ws[0]) : null;
      return `<div class="app ${collapsed ? 'sb-collapsed' : ''}">
        <aside class="sidebar" id="sidebar">
          <div class="sb-top"><button class="brand" data-go="${home}" style="background:none">${B.logo(30)}<span>BENA</span></button><button class="sb-collapse" data-act="sbCollapse" title="${esc(collapsed ? L('Expand sidebar', 'توسيع الشريط') : L('Collapse sidebar', 'طيّ الشريط'))}">${icon(collapsed ? 'chevR' : 'chevL', 'flip')}</button></div>
          <button class="org-card" data-act="roleSwitcher"><span class="oi">${icon(r.icon)}</span><span class="grow" style="min-width:0"><span class="on" style="display:block">${tx(r.org || r.name)}</span><span class="or" style="display:block">${tx(r.name)} · ${L('demo', 'تجريبي')}</span></span>${icon('swap', 'chev')}</button>
          <nav class="nav" aria-label="${L('Main', 'الرئيسية')}">${r.menu.map((m) => m.group ? `<div class="nav-group">${tx(m.group)}</div>` : `<button class="nav-item ${m.id === act ? 'active' : ''}" data-go="${r.id}-${m.id}" title="${esc(tx(m.label))}">${icon(m.icon)}<span>${tx(m.label)}</span>${m.count ? `<span class="count">${m.count}</span>` : ''}</button>`).join('')}</nav>
          <div class="side-foot">
            <button class="side-btn" data-act="lang" title="${B.isAr() ? 'English' : 'العربية'}">${icon('globe')}<span>${B.isAr() ? 'English' : 'العربية'}</span></button>
            <button class="side-btn" data-act="roleSwitcher" title="${L('Switch demo role', 'تبديل الدور')}">${icon('swap')}<span>${L('Switch demo role', 'تبديل الدور التجريبي')}</span></button>
            <button class="side-btn" data-go="hub" title="${L('Demo hub', 'مركز العرض')}">${icon('grid')}<span>${L('Demo hub', 'مركز العرض')}</span></button>
            <div class="demo-note">${L('Prototype · sample data — resets on reload.', 'نموذج أولي · بيانات نموذجية — تُعاد عند التحديث.')}</div>
          </div>
        </aside>
        <div class="drawer-scrim" data-act="drawer"></div>
        <div class="main">
          <header class="topbar">
            <nav class="crumbs" aria-label="${L('Breadcrumb', 'مسار التنقل')}">${crumbHtml}</nav>
            ${wsCur ? `<button class="ws-select" data-act="wsMenu" data-menu title="${L('Workspace', 'مساحة العمل')}">${icon('layers')}<span class="truncate">${tx(wsCur.label)}</span>${icon('chevD', 'chev')}</button>` : ''}
            <div class="top-search">${icon('search')}<input type="search" placeholder="${esc(L('Search buildings, IDs, people…', 'ابحث عن مبانٍ أو أرقام أو أشخاص…'))}" data-act="globalSearch" readonly><kbd>/</kbd></div>
            <span class="demo-chip" title="${esc(L('All data in this prototype is fictional sample data', 'جميع البيانات في هذا النموذج بيانات نموذجية وهمية'))}">${icon('info')}${L('Sample data', 'بيانات نموذجية')}</span>
            <button class="icon-btn" data-act="notifications" aria-label="${L('Notifications', 'الإشعارات')}">${icon('bell')}<span class="dot"></span></button>
            <button class="icon-btn" data-act="expMenu" data-menu aria-label="${L('Switch experience', 'تبديل التجربة')}" title="${L('Website · Web app · Mobile', 'الموقع · الويب · الجوال')}">${icon('grid')}</button>
            <button class="lang-btn" data-act="lang">${B.isAr() ? 'EN' : 'عربي'}</button>
            <button class="avatar-btn" data-act="userMenu" data-menu title="${esc(tx(me.name))}">${B.ui.avatar(me.name)}</button>
          </header>
          <header class="mbar">
            ${tabs ? `<button data-go="${home}" aria-label="BENA" style="flex:none">${B.logo(30)}</button>` : `<button class="icon-btn" data-act="drawer" aria-label="${L('Menu', 'القائمة')}">${icon('menu')}</button>`}
            <div class="mt"><b>${title}</b><small>${tx(r.org || r.name)}</small></div>
            <button class="icon-btn" data-act="globalSearch" aria-label="${L('Search', 'بحث')}">${icon('search')}</button>
            <button class="role-pill" data-act="roleSwitcher"><span class="rp-i">${icon(r.icon)}</span><span class="truncate">${tx(r.short || r.name)}</span>${icon('chevD', 'chev')}</button>
          </header>
          <main class="content"><div class="view">${content}</div></main>
        </div>
        ${tabs ? tabbar(r, act) : ''}
      </div>`;
    },
  };

  B.act.sbCollapse = () => { B.store.set('sbc', !B.store.get('sbc', false)); B.refresh(); };
  B.act.wsMenu = (_, el) => {
    const r = B.roles[B.route.role];
    B.menu(el, r.workspaces.map((w) => ({ label: tx(w.label), icon: w.icon || 'layers', act: 'wsPick', arg: w.id })));
  };
  B.act.wsPick = (id) => { const r = B.roles[B.route.role]; B.set(`ws:${r.id}`, id); const w = r.workspaces.find((x) => x.id === id); B.toast(L(`Workspace: ${tx(w.label)}`, `مساحة العمل: ${tx(w.label)}`), 'layers'); };
  B.act.expMenu = (_, el) => {
    const mr = Object.keys(B.mroles || {}).includes(B.route.role) ? `m-${B.route.role}-${B.mroles[B.route.role].home || 'home'}` : 'm';
    B.menu(el, [
      { label: L('Public website', 'الموقع العام'), icon: 'globe', go: 'site' },
      { label: L('Enterprise web app (current)', 'تطبيق الويب المؤسسي (الحالي)'), icon: 'grid', go: `${B.route.role}-${B.roles[B.route.role].home || 'home'}` },
      { label: L('Mobile app', 'تطبيق الجوال'), icon: 'phone', go: mr },
      { label: L('Demo hub', 'مركز العرض'), icon: 'compass', go: 'hub' },
    ]);
  };
  B.act.userMenu = (_, el) => B.menu(el, [
    { label: L('Switch demo role', 'تبديل الدور التجريبي'), icon: 'swap', act: 'roleSwitcher' },
    { label: B.isAr() ? 'English' : 'العربية', icon: 'globe', act: 'lang' },
    { label: L('Profile & preferences (simulated)', 'الملف والتفضيلات (محاكاة)'), icon: 'user', act: 'soon', arg: L('Profile', 'الملف') },
    { label: L('Sign out to website', 'الخروج إلى الموقع'), icon: 'logout', go: 'site' },
  ]);
  document.addEventListener('keydown', (e) => { if (e.key === '/' && B.route.exp === 'app' && !/input|textarea|select/i.test(document.activeElement?.tagName || '')) { e.preventDefault(); B.act.globalSearch(); } });

  function tabbar(r, act) {
    const items = navItems(r).filter((m) => m.tab);
    const rest = navItems(r).filter((m) => !m.tab);
    const show = rest.length ? items.slice(0, 4) : items.slice(0, 5);
    const moreActive = act && !show.find((m) => m.id === act);
    return `<nav class="tabbar" aria-label="${L('Tabs', 'التبويبات')}">${show.map((m) => `<button class="tab ${m.id === act ? 'active' : ''}" data-go="${r.id}-${m.id}"><span class="ti">${icon(m.icon)}</span><span>${tx(m.tabLabel || m.label)}</span></button>`).join('')}
      ${rest.length || items.length > 5 ? `<button class="tab ${moreActive ? 'active' : ''}" data-act="moreSheet"><span class="ti">${icon('grid')}</span><span>${L('More', 'المزيد')}</span></button>` : ''}</nav>`;
  }

  function notFound(r) {
    return B.ui.empty({ icon: 'compass', title: L('This screen is not part of the demo', 'هذه الشاشة ليست ضمن النسخة التجريبية'), text: L('Use the navigation to continue exploring.', 'استخدم القائمة لمتابعة الاستكشاف.'), action: B.ui.btn(L('Go to dashboard', 'الذهاب للوحة الرئيسية'), { kind: 'primary', go: `${r.id}-${r.home || 'home'}` }) });
  }

  /* ---------------- shell actions ---------------- */
  B.act.drawer = () => {
    const s = document.getElementById('sidebar');
    const sc = document.querySelector('.drawer-scrim');
    if (!s) return;
    const open = !s.classList.contains('open');
    s.classList.toggle('open', open);
    sc.classList.toggle('open', open);
  };
  B.act.roleSwitcher = () => {
    const cur = B.route.role;
    B.modal({
      title: L('Switch demo role', 'تبديل الدور التجريبي'),
      sub: L('Each role is a separate experience over the same connected data.', 'كل دور تجربة مستقلة فوق نفس البيانات المتصلة.'),
      body: `<div class="role-list">${roles().map((r) => `<button class="role-opt ${r.id === cur ? 'active' : ''}" data-go="${r.id}-${r.home || 'home'}"><span class="ri">${icon(r.icon)}</span><span style="min-width:0"><b>${tx(r.name)}</b><small>${esc(B.data.pname(B.data.me[r.id]))} · ${tx(r.tag)}</small></span></button>`).join('')}</div>
        <div class="row between wrap" style="margin-top:16px"><button class="btn btn-ghost" data-act="lang">${icon('globe')}${B.isAr() ? 'English' : 'العربية'}</button><button class="btn btn-ghost" data-go="hub">${icon('grid')}${L('Demo hub', 'مركز العرض')}</button></div>`,
    });
  };
  B.act.moreSheet = () => {
    const r = B.roles[B.route.role];
    const rest = navItems(r).filter((m) => !m.tab);
    const items = navItems(r).filter((m) => m.tab).slice(4).concat(rest);
    B.modal({ title: L('More', 'المزيد'), body: B.ui.list(items.map((m) => B.ui.li({ icon: m.icon, title: m.label, go: `${r.id}-${m.id}` }))) + `<div class="row between wrap" style="margin-top:12px"><button class="btn btn-ghost" data-act="roleSwitcher">${icon('swap')}${L('Switch role', 'تبديل الدور')}</button><button class="btn btn-ghost" data-act="lang">${icon('globe')}${B.isAr() ? 'English' : 'العربية'}</button></div>` });
  };
  B.act.notifications = () => {
    const r = B.roles[B.route.role];
    const list = (r.notifications && r.notifications()) || [
      { icon: 'bell', title: L('Welcome to the BENA demo', 'مرحباً بك في نسخة بينا التجريبية'), sub: L('Notifications here are sample events.', 'الإشعارات هنا أحداث نموذجية.') },
    ];
    B.modal({ title: L('Notifications', 'الإشعارات'), sub: L('Sample activity for this role', 'نشاط نموذجي لهذا الدور'), body: B.ui.list(list.map((n) => B.ui.li({ icon: n.icon, tone: n.tone || 'mint', title: n.title, sub: n.sub, end: n.when ? `<span class="xs faint">${n.when}</span>` : '', go: n.go }))) });
  };
  B.act.globalSearch = () => {
    const role = B.route.role;
    const m = B.modal({ title: L('Search BENA', 'البحث في بينا'), sub: L('Buildings by name, BENA ID or municipal GIS ID', 'المباني حسب الاسم أو رقم بينا أو رقم البلدية'), body: `<div class="input-icon">${icon('search')}<input class="input" id="gs-input" type="search" autocomplete="off" placeholder="${esc(L('e.g. Masyoun, BN-RAM-00142, RM-GIS-48217', 'مثال: الماصيون، BN-RAM-00142'))}"></div><div id="gs-results" style="margin-top:12px"></div>` });
    const inp = m.querySelector('#gs-input');
    const out = m.querySelector('#gs-results');
    const draw = () => {
      const q = inp.value.trim();
      const D = B.data;
      const res = (q ? D.buildings.filter((b) => B.match(q, b.name, b.id, b.gis, b.address)) : D.keyBuildings).slice(0, 8);
      out.innerHTML = res.length ? `<div class="eyebrow" style="margin:6px 0 4px">${q ? L('Results', 'النتائج') : L('Featured buildings', 'مبانٍ مميزة')}</div>` + B.ui.list(res.map((b) => B.ui.li({ icon: D.types[b.type]?.icon || 'building', tone: b.source === 'gis' ? 'navy' : 'violet', title: tx(b.name), sub: `<span class="id-mono">${b.id}</span> · ${tx(D.district(b.district).name)}`, go: `${role}-building-${b.id}` }))) : B.ui.empty({ icon: 'search', title: L('No buildings found', 'لم يتم العثور على مبانٍ'), text: L('Check the ID or try another street name.', 'تحقق من الرقم أو جرّب اسم شارع آخر.') });
    };
    inp.addEventListener('input', draw);
    draw();
    setTimeout(() => inp.focus(), 80);
  };
})();
