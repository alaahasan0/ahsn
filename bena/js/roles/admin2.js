/*
 * BENA — Platform Administration: additional enterprise screens.
 * Extends js/roles/admin.js with a role catalogue (split view) and platform
 * analytics, separates permissions and the three category registers, and
 * re-registers the role with its 14-screen sidebar. Visual prototype only:
 * tenants are sample municipalities and every figure is fictional.
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon, ui } = B;
  const D = B.data;
  const ek = B.ek;
  const A2 = B._ad;
  if (!A2 || !ek) return;
  const T = (en, ar) => ({ en, ar });
  const R = 'admin';
  const { MUNIS, ROLES, USERS, PERM_GROUPS, permOn, head, TOTAL_USERS } = A2;
  const env = () => B.get('ws:admin', 'prod');

  B.css(`
  .a2-env { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; padding: 3px 9px; border-radius: 99px; background: var(--warn-bg); color: var(--warn); margin-bottom: 12px; }
  .a2-env svg { width: 14px; height: 14px; }
  .a2-funnel { display: flex; flex-direction: column; gap: 8px; }
  .a2-funnel .r { display: grid; grid-template-columns: 150px minmax(0, 1fr) 70px; gap: 12px; align-items: center; font-size: 13px; }
  .a2-funnel .b { height: 26px; border-radius: 8px; background: var(--navy); display: flex; align-items: center; padding-inline-start: 10px; color: #fff; font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; min-width: 40px; }
  .a2-funnel .r:nth-child(2) .b { background: #2E5670; } .a2-funnel .r:nth-child(3) .b { background: #7FA7C2; } .a2-funnel .r:nth-child(4) .b { background: var(--mint); color: var(--navy); }
  @media (max-width: 560px) { .a2-funnel .r { grid-template-columns: 100px minmax(0, 1fr) 54px; } }
  .a2-cohort { display: grid; grid-template-columns: 90px repeat(6, minmax(0, 1fr)); gap: 3px; font-size: 11.5px; }
  .a2-cohort span { padding: 7px 4px; text-align: center; border-radius: 5px; font-variant-numeric: tabular-nums; }
  .a2-cohort .h { color: var(--text-3); font-weight: 600; }
  .a2-cohort .l { text-align: start; color: var(--text-2); }
  .a2-perms { display: flex; flex-wrap: wrap; gap: 6px; }
  `);

  /* ---------------- role catalogue ---------------- */
  const RMETA = {
    municipality: { n: 95, exp: 'web', scope: T('Tenant (municipality)', 'جهة (بلدية)'), mfa: true, d: T('Municipal staff who review registrations, verify buildings and manage GIS links for their own municipality only.', 'موظفو البلدية الذين يراجعون التسجيلات ويوثّقون المباني ويديرون الربط بنظم المعلومات لبلديتهم فقط.') },
    owner: { n: 6120, exp: 'both', scope: T('Own units', 'وحداته'), mfa: false, d: T('Unit owners manage their properties, leases and service requests. Ownership on BENA is a reference, not a legal title.', 'يدير المالكون وحداتهم وعقودهم وطلبات الخدمة. الملكية على بينا مرجعية وليست سند ملكية قانونياً.') },
    resident: { n: 10840, exp: 'mobile', scope: T('Own unit', 'وحدته'), mfa: false, d: T('Tenants and residents: building notices, payments, maintenance requests and visitor access.', 'المستأجرون والسكان: إشعارات المبنى والمدفوعات وطلبات الصيانة ودخول الزوار.') },
    committee: { n: 412, exp: 'both', scope: T('One building', 'مبنى واحد'), mfa: false, d: T('Owners’ associations, informal committees and authorised managers. Capabilities follow the documents on file.', 'جمعيات المالكين واللجان غير الرسمية والمديرون المفوّضون. تتبع القدرات المستندات المودعة.') },
    manager: { n: 128, exp: 'web', scope: T('Managed portfolio', 'المحفظة المُدارة'), mfa: true, d: T('Property management companies operating portfolios on behalf of owners.', 'شركات إدارة العقارات التي تشغّل المحافظ نيابة عن المالكين.') },
    facility: { n: 86, exp: 'web', scope: T('Contracted buildings', 'المباني المتعاقد عليها'), mfa: true, d: T('Facility management teams: assets, work orders, preventive maintenance.', 'فرق إدارة المرافق: الأصول وأوامر العمل والصيانة الوقائية.') },
    provider: { n: 748, exp: 'both', scope: T('Own company', 'شركته'), mfa: false, d: T('Service companies and technicians receiving requests through the marketplace.', 'شركات الخدمات والفنيون الذين يستقبلون الطلبات عبر السوق.') },
    admin: { n: 7, exp: 'web', scope: T('Whole platform', 'المنصة بالكامل'), mfa: true, d: T('BENA platform operations. Locked permission set; every action is audited.', 'عمليات منصة بينا. مجموعة صلاحيات مقفلة؛ وكل إجراء خاضع للتدقيق.') },
  };
  const permList = (r) => PERM_GROUPS.flatMap((g) => g.items.filter(([pid]) => permOn(r, pid)).map(([, pl]) => pl));
  const expL = (e) => (e === 'web' ? L('Web app', 'تطبيق الويب') : e === 'mobile' ? L('Mobile app', 'تطبيق الجوال') : L('Web + mobile', 'الويب + الجوال'));
  function roles() {
    const sel = B.get('a2:role', '');
    const rows = Object.keys(ROLES).map((k) => ({ id: k, ...ROLES[k], ...RMETA[k], perms: permList(k).length }));
    const r = rows.find((x) => x.id === sel);
    const total = B.sum(PERM_GROUPS, (g) => g.items.length);
    const panel = r ? ek.panel({ close: 'a2:role', lead: `<span class="li-icon ${r.tone}">${icon(r.icon)}</span>`, title: tx(r.l), sub: `${B.num(r.n)} ${L('users', 'مستخدم')} · ${expL(r.exp)}`, badges: r.id === 'admin' ? ui.badge(L('Locked', 'مقفل'), 'neutral', 'lock') : ui.badge(L('System role', 'دور نظام'), 'outline', 'shield'),
      body: `<p class="small" style="line-height:1.6">${tx(r.d)}</p>
        ${ui.kv([[L('Data scope', 'نطاق البيانات'), tx(r.scope)], [L('Two-factor sign-in', 'الدخول بخطوتين'), r.mfa ? ui.status('enabled') : L('Optional', 'اختياري')], [L('Permissions', 'الصلاحيات'), `${r.perms} / ${total}`]])}
        ${ek.ps(L('Granted permissions', 'الصلاحيات الممنوحة'), `<div class="a2-perms">${permList(r.id).map((p) => `<span class="badge outline">${tx(p)}</span>`).join('')}</div>`)}
        ${ek.ps(L('Sample members', 'أعضاء نموذجيون'), ui.list(USERS.filter((u) => u.role === r.id).slice(0, 4).map((u) => ui.li({ avatar: D.person(u.p).name, title: esc(D.pname(u.p)), sub: esc(A2.orgName(u.org)), end: ui.status(u.status) }))) || `<span class="small muted">—</span>`)}`,
      foot: `${ui.btn(L('Users with this role', 'المستخدمون بهذا الدور'), { icon: 'users', go: `${R}-users` })}${ui.btn(L('Edit permissions', 'تعديل الصلاحيات'), { icon: 'key', kind: 'primary', go: `${R}-permissions` })}` }) : '';
    return `${head({ title: L('Roles', 'الأدوار'), sub: L('System roles available to every tenant: who they are for, what data they can reach and how they sign in.', 'أدوار النظام المتاحة لكل الجهات: لمن هي، وما البيانات التي تصل إليها، وكيف يتم الدخول.'), actions: ui.btn(L('Permission matrix', 'مصفوفة الصلاحيات'), { icon: 'key', go: `${R}-permissions` }) + ui.btn(L('Create custom role', 'إنشاء دور مخصص'), { icon: 'plus', kind: 'primary', act: 'a2Role' }) })}
      ${ek.strip([{ l: L('System roles', 'أدوار النظام'), v: rows.length, icon: 'key' }, { l: L('Users assigned', 'المستخدمون المعيّنون'), v: B.compact(TOTAL_USERS), s: L('All tenants', 'كل الجهات'), icon: 'users' }, { l: L('Roles requiring 2FA', 'أدوار تتطلب الدخول بخطوتين'), v: rows.filter((x) => x.mfa).length, icon: 'fingerprint' }, { l: L('Custom roles', 'أدوار مخصصة'), v: 0, s: L('Tenants may restrict, not extend', 'يمكن للجهات التقييد دون التوسيع'), icon: 'sliders' }])}
      ${ek.split(`<div>${ek.selStyle('a2-rt', sel)}${ui.table({ id: 'a2-rt', cls: 'a2-rt', rows, defaultSort: '-n', rowAct: (x) => ({ act: 'set', arg: `a2:role=${x.id}` }), cols: [
        { key: 'l', label: L('Role', 'الدور'), m: 'title', render: (x) => ek.cell(x.icon, tx(x.l), tx(x.scope), x.tone), mRender: (x) => tx(x.l) },
        { key: 'exp', label: L('Experience', 'التجربة'), m: 'meta', render: (x) => `<span class="small nowrap">${expL(x.exp)}</span>` },
        { key: 'perms', label: L('Permissions', 'الصلاحيات'), sort: true, m: 'sub', render: (x) => `<div class="row-sm" style="min-width:120px">${ek.mini((x.perms / total) * 100)}<span class="ek-num small">${x.perms}/${total}</span></div>` },
        { key: 'mfa', label: L('2FA', 'خطوتان'), m: 'meta', render: (x) => (x.mfa ? ui.badge(L('Required', 'إلزامي'), 'ok', 'lock') : `<span class="small muted">${L('Optional', 'اختياري')}</span>`) },
        { key: 'n', label: L('Users', 'المستخدمون'), sort: true, align: 'end', m: 'end', render: (x) => `<b class="ek-num">${B.num(x.n)}</b>` },
      ] })}</div>`, panel)}`;
  }

  /* ---------------- platform analytics ---------------- */
  function analytics() {
    const per = B.get('a2:per', '12m');
    const ten = B.get('a2:ten', 'all');
    const m = MUNIS.find((x) => x.id === ten);
    const k = m ? m.buildings / B.sum(MUNIS, (x) => x.buildings) : 1;
    const nM = per === '12m' ? 12 : 6;
    const months = Array.from({ length: nM }, (_, i) => (10 - (nM - 1) + i + 12) % 12);
    const s = (arr) => arr.slice(12 - nM).map((v) => Math.round(v * k));
    const wauWeb = s([1420, 1510, 1580, 1660, 1720, 1810, 1900, 1980, 2050, 2140, 2260, 2390]);
    const wauMob = s([3820, 4010, 4230, 4410, 4680, 4920, 5180, 5390, 5620, 5880, 6140, 6420]);
    const regs = s(D.city.trend.map((v) => v * 2.2));
    const reqs = s([310, 342, 365, 351, 398, 420, 446, 471, 502, 533, 561, 598]);
    const fun = [Math.round(5120 * k), Math.round(4380 * k), Math.round(3910 * k), Math.round(3460 * k)];
    const byRole = Object.keys(RMETA).filter((r) => r !== 'admin').map((r, i) => ({ label: ROLES[r].l, value: Math.round(RMETA[r].n * [0.92, 0.48, 0.61, 0.74, 0.88, 0.9, 0.57][i] * k), color: B.charts.palette[i % B.charts.palette.length] }));
    const cohort = [[100, 71, 64, 60, 57, 55], [100, 74, 66, 61, 59], [100, 76, 69, 64], [100, 78, 70], [100, 79], [100]];
    const cm = [5, 6, 7, 8, 9, 10];
    return `${head({ title: L('Platform analytics', 'تحليلات المنصة'), sub: L('Adoption, engagement, data quality and marketplace activity across sample tenants.', 'الاعتماد والتفاعل وجودة البيانات ونشاط السوق عبر الجهات النموذجية.'), actions: ui.btn(L('Export', 'تصدير'), { icon: 'download', act: 'previewDoc', arg: L('Platform analytics — Nov 2026.pdf', 'تحليلات المنصة — ت٢ 2026.pdf') }) })}
      ${ek.tb(`${ui.select('a2:ten', [{ v: 'all', l: L('All sample tenants', 'كل الجهات النموذجية') }].concat(MUNIS.map((x) => ({ v: x.id, l: x.name }))), { label: L('Tenant', 'الجهة') })}${ui.seg('a2:per', [{ id: '6m', label: L('6 months', '6 أشهر') }, { id: '12m', label: L('12 months', '12 شهراً') }], per)}<span class="sp"></span>${ui.prov('demo')}`)}
      ${ek.strip([{ l: L('Weekly active users', 'المستخدمون النشطون أسبوعياً'), v: B.num(wauWeb[nM - 1] + wauMob[nM - 1]), s: L('+8.4% vs last month', '+8.4% مقارنة بالشهر الماضي'), tone: 'ok', icon: 'activity' }, { l: L('Mobile share', 'حصة الجوال'), v: Math.round((wauMob[nM - 1] / (wauWeb[nM - 1] + wauMob[nM - 1])) * 100) + '%', icon: 'phone' }, { l: L('New registrations', 'تسجيلات جديدة'), v: B.num(B.sum(regs)), s: L(`last ${nM} months`, `آخر ${nM} أشهر`), icon: 'building' }, { l: L('Verification rate', 'نسبة التوثيق'), v: Math.round((fun[3] / fun[0]) * 100) + '%', s: L('submitted → verified', 'مُقدّم ← موثّق'), icon: 'shieldCheck' }, { l: L('Service requests', 'طلبات الخدمة'), v: B.num(B.sum(reqs)), s: L('64% quote acceptance', 'قبول العروض 64%'), icon: 'handshake' }])}
      <div class="grid g-main" style="align-items:start">
        <div class="stack">
          ${ui.card({ title: L('Weekly active users', 'المستخدمون النشطون أسبوعياً'), sub: L('Average per month by experience', 'المتوسط الشهري حسب التجربة'), body: B.charts.line({ labels: months.map((x) => B.mon(x)), series: [{ name: L('Mobile app', 'تطبيق الجوال'), color: '#36D6A0', values: wauMob, area: true }, { name: L('Web app', 'تطبيق الويب'), color: '#142B3B', values: wauWeb }], height: 210 }) })}
          ${ui.card({ title: L('Registrations & service requests', 'التسجيلات وطلبات الخدمة'), sub: L('Per month', 'شهرياً'), body: B.charts.bars({ labels: months.map((x) => B.mon(x)), series: [{ name: L('Building registrations', 'تسجيلات المباني'), color: '#142B3B', values: regs }, { name: L('Service requests', 'طلبات الخدمة'), color: '#7FA7C2', values: reqs }], height: 200 }) })}
          ${ui.card({ title: L('Tenant comparison', 'مقارنة الجهات'), sub: L('Sample municipalities — not partners', 'بلديات نموذجية — ليست شركاء'), cls: 'pad-0', body: ui.table({ id: 'a2-ten', rows: MUNIS, cols: [
            { key: 'name', label: L('Tenant', 'الجهة'), m: 'title', render: (x) => `<b>${tx(x.name)}</b><div class="xs faint">${ui.idMono(x.code)}</div>`, mRender: (x) => tx(x.name) },
            { key: 'status', label: L('Status', 'الحالة'), m: 'end', render: (x) => ui.status(x.status) },
            { key: 'buildings', label: L('Buildings', 'المباني'), align: 'end', sort: true, m: 'meta', render: (x) => `<span class="ek-num">${B.num(x.buildings)}</span>` },
            { key: 'gis', label: L('GIS-linked', 'مرتبطة بنظم المعلومات'), sort: (x) => x.gis / x.buildings, m: 'sub', render: (x) => `<div class="row-sm" style="min-width:130px">${ek.mini((x.gis / x.buildings) * 100, 'mint')}<span class="ek-num small">${B.pct((x.gis / x.buildings) * 100, 1)}</span></div>` },
            { key: 'users', label: L('Staff', 'الموظفون'), align: 'end', m: 'meta', render: (x) => `<span class="ek-num">${x.users}</span>` },
            { key: 'act', label: L('Active units', 'وحدات نشطة'), align: 'end', m: 'meta', render: (x) => `<span class="ek-num">${B.num(Math.round(x.units * [0.31, 0.22, 0.09, 0.04][MUNIS.indexOf(x)]))}</span>` },
          ] }) })}
        </div>
        <div class="stack">
          ${ui.card({ title: L('Verification funnel', 'مسار التوثيق'), sub: L(`Independent submissions · last ${nM} months`, `التسجيلات المستقلة · آخر ${nM} أشهر`), body: `<div class="a2-funnel">${[[L('Submitted', 'مُقدّم'), fun[0]], [L('Complete documents', 'مستندات مكتملة'), fun[1]], [L('Reviewed', 'تمت مراجعته'), fun[2]], [L('Verified', 'موثّق'), fun[3]]].map(([l, v]) => `<div class="r"><span class="muted">${l}</span><div><div class="b" style="width:${(v / fun[0]) * 100}%">${B.num(v)}</div></div><span class="ek-num small" style="text-align:end">${Math.round((v / fun[0]) * 100)}%</span></div>`).join('')}</div>` })}
          ${ui.card({ title: L('Weekly active by role', 'النشطون أسبوعياً حسب الدور'), body: B.charts.hbars({ data: byRole }) })}
          ${ui.card({ title: L('Monthly retention', 'الاحتفاظ الشهري'), sub: L('Share of new accounts still active, by sign-up month', 'نسبة الحسابات الجديدة التي بقيت نشطة حسب شهر التسجيل'), body: `<div class="a2-cohort"><span class="h"></span>${['M0', 'M1', 'M2', 'M3', 'M4', 'M5'].map((x) => `<span class="h">${x}</span>`).join('')}${cohort.map((row, i) => `<span class="l">${B.mon(cm[i])}</span>${Array.from({ length: 6 }, (_, j) => row[j] != null ? `<span style="background:color-mix(in srgb, #36D6A0 ${Math.round(row[j] * 0.85)}%, #EDF2F0);color:${row[j] > 70 ? '#0B3B2A' : 'var(--ink)'}">${row[j]}%</span>` : '<span></span>').join('')}`).join('')}</div>` })}
        </div>
      </div>
      <div style="margin-top:16px">${ui.demoNote(L('Analytics are simulated for a visual prototype. Ramallah, Al-Bireh, Beitunia and Birzeit are sample tenants, not partners.', 'التحليلات محاكاة لنموذج مرئي. رام الله والبيرة وبيتونيا وبيرزيت جهات نموذجية وليست شركاء.'))}</div>`;
  }

  B.act.a2Role = () => B.modal({ title: L('Create custom role', 'إنشاء دور مخصص'), form: 'a2Role', size: 'md', body: `<div class="form-grid">${ui.field({ name: 'en', label: L('Name (English)', 'الاسم (بالإنجليزية)'), required: true })}${ui.field({ name: 'ar', label: L('Name (Arabic)', 'الاسم (بالعربية)'), required: true })}${ui.field({ name: 'base', label: L('Start from', 'البدء من'), type: 'select', full: true, options: Object.keys(ROLES).filter((r) => r !== 'admin').map((r) => ({ v: r, l: ROLES[r].l })) })}${ui.field({ name: 'why', label: L('Purpose', 'الغرض'), type: 'textarea', full: true })}</div>${ui.callout(L('Custom roles can only narrow the permissions of the role they start from.', 'يمكن للأدوار المخصصة فقط تضييق صلاحيات الدور الذي تبدأ منه.'), '', 'info')}`, foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${L('Create draft', 'إنشاء مسودة')}</button>` });
  B.submit.a2Role = () => B.success({ title: L('Custom role drafted', 'تم إنشاء مسودة الدور'), text: L('It stays inactive until a second platform admin approves it.', 'يبقى غير مفعّل حتى يوافق عليه مدير منصة ثانٍ.'), ref: B.uid('ROLE') });

  /* ---------------- re-register ---------------- */
  const base = B.roles[R];
  const wrap = (fn) => (id) => `<div class="ad">${env() === 'staging' ? `<div class="a2-env">${icon('alert')}${L('Staging sandbox — changes here never reach production', 'بيئة الاختبار — التغييرات هنا لا تصل إلى الإنتاج')}</div>` : ''}${fn(id)}</div>`;
  const P0 = A2.pages;
  const pages = { home: P0.home, orgs: P0.orgs, users: P0.users, roles, permissions: P0.roles, munis: P0.munis, bcats: P0.bcats, ucats: P0.ucats, scats: P0.scats, sources: P0.sources, verification: P0.verification, config: P0.config, audit: P0.audit, analytics };
  B.role(Object.assign({}, base, {
    workspaces: [{ id: 'prod', label: T('Production (sample)', 'الإنتاج (نموذج)'), icon: 'server' }, { id: 'staging', label: T('Staging sandbox', 'بيئة الاختبار'), icon: 'cpu' }],
    menu: [
      { group: T('Overview', 'نظرة عامة') },
      { id: 'home', label: T('Platform overview', 'نظرة عامة على المنصة'), icon: 'grid' },
      { id: 'analytics', label: T('Platform analytics', 'تحليلات المنصة'), icon: 'chart' },
      { group: T('Tenants & access', 'الجهات والوصول') },
      { id: 'orgs', label: T('Organizations', 'المؤسسات'), icon: 'briefcase' },
      { id: 'users', label: T('Users', 'المستخدمون'), icon: 'users' },
      { id: 'roles', label: T('Roles', 'الأدوار'), icon: 'userCheck' },
      { id: 'permissions', label: T('Permissions', 'الصلاحيات'), icon: 'key' },
      { id: 'munis', label: T('Municipalities', 'البلديات'), icon: 'landmark' },
      { group: T('Registry data', 'بيانات السجل') },
      { id: 'bcats', label: T('Building categories', 'فئات المباني'), icon: 'building' },
      { id: 'ucats', label: T('Unit categories', 'فئات الوحدات'), icon: 'grid' },
      { id: 'scats', label: T('Service categories', 'فئات الخدمات'), icon: 'wrench' },
      { id: 'sources', label: T('Data sources', 'مصادر البيانات'), icon: 'database' },
      { id: 'verification', label: T('Verification settings', 'إعدادات التحقق'), icon: 'shieldCheck' },
      { group: T('System', 'النظام') },
      { id: 'config', label: T('System configuration', 'إعدادات النظام'), icon: 'settings' },
      { id: 'audit', label: T('Audit logs', 'سجلات التدقيق'), icon: 'history' },
      { group: T('Marketplaces', 'الأسواق') },
      { id: 'services', label: T('Services marketplace', 'سوق الخدمات'), icon: 'store', match: ['provider', 'servicedetail', 'quotes', 'servicehistory'] },
      { id: 'properties', label: T('Property marketplace', 'سوق العقارات'), icon: 'home', match: ['listing'] },
    ],
    pages: Object.fromEntries(Object.entries(pages).map(([k, fn]) => [k, wrap(fn)])),
  }));
})();
