/*
 * BENA — the complete building profile (shared by every role).
 * Route: <role>-building-<BENA ID>, e.g. #municipality-building-BN-RAM-00142
 */
(function () {
  const B = (window.B = window.B || {});
  const { tx, L, icon, esc, ui } = B;
  const D = () => B.data;

  B.css(`
    .hub { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .hub svg.hub-lines { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
    .hub-node { position: relative; z-index: 1; background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 8px; text-align: start; transition: border-color .2s, transform .2s var(--ease); min-width: 0; }
    .hub-node:hover { border-color: var(--mint); transform: translateY(-2px); }
    .hub-node .hn-i { width: 36px; height: 36px; border-radius: 11px; background: var(--mint-50); color: var(--mint-ink); display: grid; place-items: center; }
    .hub-node .hn-i svg { width: 18px; height: 18px; }
    .hub-node b { font-size: 13.5px; line-height: 1.3; }
    .hub-node small { font-size: 12px; color: var(--text-2); line-height: 1.35; overflow-wrap: anywhere; }
    .hub-node.empty-n { border-style: dashed; background: var(--surface-2); }
    .hub-node.empty-n .hn-i { background: var(--line-2); color: var(--text-3); }
    .hub-center { position: relative; z-index: 1; background: var(--navy); color: #fff; border-radius: 18px; padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 8px; box-shadow: 0 0 0 6px rgba(54,214,160,.14); }
    .hub-center .hc-i { width: 46px; height: 46px; border-radius: 14px; background: var(--mint); color: var(--navy); display: grid; place-items: center; }
    .hub-center .hc-i svg { width: 24px; height: 24px; }
    .hub-center b { font-size: 14px; line-height: 1.25; }
    .hub-center .id-mono { color: var(--mint); font-size: 11.5px; }
    @media (max-width: 640px) {
      .hub { gap: 8px; }
      .hub-node { padding: 10px; border-radius: 13px; gap: 6px; }
      .hub-node .hn-i { width: 30px; height: 30px; border-radius: 9px; }
      .hub-node b { font-size: 12px; }
      .hub-node small { font-size: 11px; }
      .hub-center { padding: 10px 6px; border-radius: 14px; }
      .hub-center b { font-size: 12px; }
      .hub-center .hc-i { width: 36px; height: 36px; }
      .hub-center .id-mono { font-size: 9.5px; }
    }
    .bp-back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--text-2); margin-bottom: 12px; }
    .bp-back svg { width: 16px; height: 16px; }
    .bp-back:hover { color: var(--ink); }
    .bp-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .bp-actions .btn { background: rgba(255,255,255,.08); color: #fff; border-color: rgba(255,255,255,.16); }
    .bp-actions .btn-primary { background: var(--mint); color: var(--navy); border-color: var(--mint); }
    .unit-legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 12px; color: var(--text-2); }
    .unit-legend span { display: inline-flex; align-items: center; gap: 6px; }
    .unit-legend i { width: 14px; height: 14px; border-radius: 4px; display: inline-block; }
    .verify-steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
    .verify-steps div { border-radius: 12px; padding: 12px; background: var(--surface-2); border: 1px solid var(--line-2); font-size: 12px; color: var(--text-2); }
    .verify-steps div b { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--ink); margin-bottom: 4px; }
    .verify-steps div b svg { width: 16px; height: 16px; color: var(--mint-ink); }
    .verify-steps div.todo b svg { color: var(--text-3); }
    .verify-steps div.now { background: var(--warn-bg); border-color: #F4D9A8; }
    .verify-steps div.now b svg { color: var(--warn); }
    @media (max-width: 640px) { .verify-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  `);

  const coords = (b) => { const c = B.map.centroid(b.poly); return { lat: (31.9192 - c[1] * 0.000031).toFixed(5), lon: (35.1868 + c[0] * 0.000036).toFixed(5) }; };
  B.buildingCoords = coords;
  const seedOf = (b) => parseInt(b.id.replace(/\D/g, ''), 10) || 1;

  /** Occupancy summary for a building (detailed units if mapped, else estimate). */
  const occ = (b) => {
    const us = D().unitsOf(b.id);
    if (!us.length) return null;
    const c = { ownerOccupied: 0, rented: 0, vacant: 0, maintenance: 0 };
    us.forEach((u) => { c[u.status] = (c[u.status] || 0) + 1; });
    return { total: us.length, ...c, rate: Math.round(((c.ownerOccupied + c.rented) / us.length) * 100) };
  };
  B.buildingOcc = occ;

  B.shared.building = (id) => {
    const data = D();
    const b = data.building(id);
    if (!b) return ui.empty({ icon: 'building', title: L('Building not found', 'المبنى غير موجود'), text: L('Check the BENA Building ID and try again.', 'تحقق من رقم المبنى في بينا وحاول مرة أخرى.'), action: ui.btn(L('Back', 'رجوع'), { act: 'back', icon: 'arrowLeft', iconCls: 'flip' }) });
    B.title(tx(b.name));
    const role = B.route.role;
    const tab = B.get('bp:tab', 'overview');
    const o = occ(b);
    const com = data.committeeOf(b.id);
    const mgr = b.manager ? data.org(b.manager) : null;
    const fac = b.facility ? data.org(b.facility) : null;
    const reqs = data.requestsOf(b.id);
    const openReqs = reqs.filter((q) => !['completed', 'cancelled'].includes(q.status));
    const assets = data.assetsOf(b.id);
    const t = data.types[b.type] || {};
    const verBadge = ui.status(b.verification === 'pendingVerification' ? 'pendingVerification' : b.verification);
    const roleActions = {
      resident: [ui.btn(L('Request to join', 'طلب الانضمام'), { kind: 'primary', icon: 'userPlus', act: 'joinBuilding', arg: b.id })],
      municipality: [ui.btn(L('Review record', 'مراجعة السجل'), { kind: 'primary', icon: 'shieldCheck', act: 'bpVerify', arg: b.id })],
      owner: [ui.btn(L('Request service', 'طلب خدمة'), { kind: 'primary', icon: 'wrench', go: `${role}-services` })],
    };

    const hero = `
      <button class="bp-back" data-act="back">${icon('arrowLeft', 'flip')}${L('Back', 'رجوع')}</button>
      <section class="b-hero">
        <div class="bh-body">
          <div class="row-sm wrap">${b.verification === 'verified' ? `<span class="badge mint">${icon('shieldCheck')}${L('Verified', 'موثّق')}</span>` : `<span class="badge warn">${icon('clock')}${ui.statusLabel(b.verification)}</span>`}
            <span class="badge">${icon(b.source === 'gis' ? 'landmark' : 'userCheck')}${b.source === 'gis' ? L('Municipal GIS record', 'سجل بلدي') : L('Independently submitted', 'مُسجّل بشكل مستقل')}</span>
            <span class="badge">${icon(t.icon || 'building')}${tx(t)}</span></div>
          <div><h1>${esc(tx(b.name))}</h1><div class="bh-addr" style="margin-top:8px">${icon('pin')}${esc(tx(b.address))}</div></div>
          <div class="row-sm wrap" style="color:var(--navy-ink);font-size:13px"><span>${L('BENA ID', 'رقم بينا')}</span><b class="id-mono" style="color:#fff">${b.id}</b>${b.gis ? `<span style="opacity:.5">·</span><span>${L('GIS', 'البلدية')}</span><b class="id-mono" style="color:#fff">${b.gis}</b>` : ''}</div>
          <div class="bh-stats">
            <div><b>${b.floors}</b><span>${L('Floors', 'طوابق')}</span></div>
            <div><b>${b.units}</b><span>${L('Units', 'وحدات')}</span></div>
            <div><b>${b.year}</b><span>${L('Built', 'سنة البناء')}</span></div>
            ${o ? `<div><b>${o.rate}%</b><span>${L('Occupied', 'مشغول')}</span></div>` : ''}
          </div>
          <div class="bp-actions">${(roleActions[role] || []).join('')}
            ${ui.btn(L('Share ID', 'مشاركة الرقم'), { icon: 'share', act: 'bpShare', arg: b.id, size: 'sm' })}
            ${ui.btn(L('Report an issue', 'الإبلاغ عن مشكلة'), { icon: 'flag', act: 'bpReport', arg: b.id, size: 'sm' })}</div>
        </div>
        <div class="bh-art">${B.art.facade(seedOf(b), { type: b.type, floors: b.floors, sky: 'navy' })}</div>
      </section>`;

    // Building Identity workspace: grouped section navigator (sticky on desktop, chips on phones)
    const ALIAS = { people: 'ownership', services: 'assets', related: 'services' };
    const sec = ALIAS[tab] || tab;
    const us = data.unitsOf(b.id);
    const SECTIONS = [
      { group: L('Identity', 'الهوية'), items: [
        ['overview', L('Building overview', 'نظرة عامة على المبنى'), 'grid'], ['identity', L('BENA Building ID', 'رقم المبنى في BENA'), 'fingerprint'], ['location', L('Location & map', 'الموقع والخريطة'), 'pin'],
        ['municipal', L('Municipal reference', 'المرجع البلدي'), 'landmark'], ['external', L('External identifiers', 'المعرّفات الخارجية'), 'link'], ['classification', L('Classification', 'التصنيف'), 'tag']] },
      { group: L('Structure', 'البنية'), items: [['floors', L('Floors', 'الطوابق'), 'stairs', b.floors], ['units', L('Units', 'الوحدات'), 'stack', b.units]] },
      { group: L('Relationships', 'العلاقات'), items: [
        ['ownership', L('Ownership relationships', 'علاقات الملكية'), 'key'], ['occupancy', L('Occupancy relationships', 'علاقات الإشغال'), 'users'],
        ['management', L('Building management', 'إدارة المبنى'), 'briefcase'], ['committee', L('Committee / association', 'اللجنة / الجمعية'), 'gavel']] },
      { group: L('Operations', 'التشغيل'), items: [
        ['assets', L('Assets & utilities', 'الأصول والمرافق'), 'cpu'], ['maintenance', L('Maintenance', 'الصيانة'), 'wrench', openReqs.length || null], ['finance', L('Finance', 'المالية'), 'wallet'],
        ['services', L('Services', 'الخدمات'), 'sparkles'], ['documents', L('Documents', 'المستندات'), 'folder']] },
      { group: L('Data governance', 'حوكمة البيانات'), items: [['sources', L('Data sources', 'مصادر البيانات'), 'database'], ['verification', L('Verification history', 'سجل التحقق'), 'shieldCheck'], ['activity', L('Activity history', 'سجل النشاط'), 'history']] },
    ];
    const all = SECTIONS.flatMap((g) => g.items);
    const cur = all.find((x) => x[0] === sec) || all[0];
    const FN = { overview, identity: identityCard, location, municipal, external, classification, floors, units, ownership, occupancy, management, committee: people, assets: services, maintenance, finance, services: related, documents, sources, verification, activity };
    const navHtml = `<nav class="bw-nav" aria-label="${L('Building sections', 'أقسام المبنى')}">${SECTIONS.map((g) => `<div class="bw-group">${tx(g.group)}</div>${g.items.map(([id, label, ic, count]) => `<button class="bw-item ${id === cur[0] ? 'on' : ''}" data-act="set" data-arg="bp:tab=${id}">${icon(ic)}<span>${label}</span>${count ? `<em>${count}</em>` : ''}</button>`).join('')}`).join('')}</nav>`;
    const chips = `<div class="bw-chips">${all.map(([id, label, ic]) => `<button class="chip ${id === cur[0] ? 'active' : ''}" data-act="set" data-arg="bp:tab=${id}">${icon(ic)}${label}</button>`).join('')}</div>`;
    const ctx = { b, o, com, mgr, fac, reqs, openReqs, assets, role, us };
    const R = B.roles[role];
    if (R) B.crumbs([{ label: R.org || R.name, go: `${role}-${R.home || 'home'}` }, { label: L('Building Identity', 'هوية المبنى') }, { label: tx(b.name) }]);
    return `${hero}
      <div class="bw-legend"><span class="bw-legend-l">${L('Data provenance', 'مصدر البيانات')}</span>${ui.provLegend()}<span class="bw-legend-n">${L('BENA Building ID is a digital reference identity — not proof of legal ownership.', 'رقم المبنى في BENA هوية مرجعية رقمية — وليس إثباتاً قانونياً للملكية.')}</span></div>
      <div class="bw">${navHtml}<div class="bw-main">${chips}<div class="bw-head"><h2>${icon(cur[2])}${cur[1]}</h2></div>${FN[cur[0]](ctx)}</div></div>`;
  };

  /* ---------------- tabs ---------------- */
  function overview({ b, o, com, mgr, fac, openReqs, role }) {
    const data = D();
    const owners = o ? new Set(data.unitsOf(b.id).map((u) => u.owner)).size : null;
    const residents = o ? data.unitsOf(b.id).filter((u) => u.tenant).length : null;
    const provs = new Set(data.requestsOf(b.id).map((q) => q.provider).filter(Boolean)).size;
    const node = (ic, title, sub, go, empty) => `<button class="hub-node ${empty ? 'empty-n' : ''}" ${go ? `data-act="set" data-arg="bp:tab=${go}"` : ''}><span class="hn-i">${icon(ic)}</span><b>${title}</b><small>${sub}</small></button>`;
    const nodes = [
      node('landmark', L('Municipality', 'البلدية'), b.gis ? `${L('Linked', 'مرتبط')} · <span class="id-mono">${b.gis}</span>` : L('Not linked yet', 'غير مرتبط بعد'), 'identity', !b.gis),
      node('key', L('Owners', 'المالكون'), owners != null ? L(`${owners} owners`, `${owners} مالكاً`) : L('Not mapped', 'غير مُدخل'), 'people', owners == null),
      node('users', L('Residents', 'السكان'), residents != null ? L(`${residents} households`, `${residents} أسرة`) : L('Not mapped', 'غير مُدخل'), 'units', residents == null),
      node('gavel', L('Committee', 'اللجنة'), com ? ui.statusLabel(com.kind) : L('None registered', 'لا توجد لجنة مسجلة'), 'people', !com),
      node('briefcase', L('Management', 'الإدارة'), mgr ? tx(mgr.name) : fac ? tx(fac.name) : L('Self-managed', 'إدارة ذاتية'), 'people', !mgr && !fac),
      node('wrench', L('Service providers', 'مزودو الخدمات'), provs ? L(`${provs} active`, `${provs} نشط`) : L('None yet', 'لا يوجد بعد'), 'related', !provs),
      node('zap', L('Utilities', 'المرافق'), data.utilities[b.id] ? L(`${data.utilities[b.id].length} accounts`, `${data.utilities[b.id].length} حسابات`) : L('Not connected', 'غير متصل'), 'services', !data.utilities[b.id]),
      node('store', L('Marketplace', 'السوق'), L('Listings & services', 'العروض والخدمات'), 'related', false),
    ];
    const center = `<div class="hub-center"><span class="hc-i">${icon('building')}</span><b>${esc(tx(b.name))}</b><span class="id-mono">${b.id}</span></div>`;
    const hub = `<div class="hub"><svg class="hub-lines" viewBox="0 0 300 300" preserveAspectRatio="none">${[[50, 50], [150, 50], [250, 50], [50, 150], [250, 150], [50, 250], [150, 250], [250, 250]].map(([x, y]) => `<line x1="150" y1="150" x2="${x}" y2="${y}" stroke="#36D6A0" stroke-width="1.5" stroke-dasharray="4 4" vector-effect="non-scaling-stroke"/>`).join('')}</svg>
      ${nodes.slice(0, 4).join('')}${center}${nodes.slice(4).join('')}</div>`;
    const t = data.types[b.type] || {};
    const facts = ui.kvGrid([
      [L('Building type', 'نوع المبنى'), tx(t)],
      [L('District', 'الحي'), tx(data.district(b.district).name)],
      [L('Floors', 'الطوابق'), b.floors],
      [L('Units', 'الوحدات'), b.units],
      [L('Year built', 'سنة البناء'), b.year],
      [L('Built area', 'المساحة المبنية'), b.area ? `${B.num(b.area)} m²` : '—'],
      [L('Parking spaces', 'مواقف السيارات'), b.parking != null ? b.parking : '—'],
      [L('Elevators', 'المصاعد'), b.elevators != null ? b.elevators : '—'],
    ]);
    const occCard = o ? B.charts.donut({ size: 140, data: [
      { label: L('Owner-occupied', 'يسكنها المالك'), value: o.ownerOccupied, color: '#142B3B' },
      { label: L('Rented', 'مؤجرة'), value: o.rented, color: '#36D6A0' },
      { label: L('Vacant', 'شاغرة'), value: o.vacant, color: '#C9D6DF' },
      { label: L('Under maintenance', 'تحت الصيانة'), value: o.maintenance, color: '#F2B35A' },
    ], center: { value: o.rate + '%', label: L('occupied', 'مشغول') } }) : ui.empty({ icon: 'stack', title: L('Units not mapped yet', 'لم تُدخل الوحدات بعد'), text: L('The municipal record lists the unit count, but unit-level ownership and occupancy have not been added by a committee or manager.', 'يذكر السجل البلدي عدد الوحدات، لكن لم تُضف بيانات الملكية والإشغال لكل وحدة من قبل لجنة أو مدير.') });
    return `<div class="stack-lg">
      <div class="grid g-main">
        ${ui.card({ title: L('How this building is connected', 'كيف يرتبط هذا المبنى'), sub: L('One identity links the record, the people and the services', 'هوية واحدة تربط السجل والأشخاص والخدمات'), body: hub })}
        <div class="stack">
          ${ui.card({ title: L('Ownership & occupancy', 'الملكية والإشغال'), body: occCard })}
          ${ui.card({ title: L('Location', 'الموقع'), link: { label: L('Details', 'التفاصيل'), act: 'set', arg: 'bp:tab=identity' }, body: B.map.render({ id: 'bp-mini-' + b.id, static: true, focus: b.id, focusW: 260, selected: b.id, legend: false, badge: false, height: '200px' }) })}
        </div>
      </div>
      <div class="grid g-main">
        ${ui.card({ title: L('Key facts', 'معلومات أساسية'), body: facts })}
        ${ui.card({ title: L('At a glance', 'لمحة سريعة'), body: ui.list([
          ui.li({ icon: 'wrench', tone: openReqs.length ? 'warn' : 'mint', title: L(`${openReqs.length} open maintenance requests`, `${openReqs.length} طلبات صيانة مفتوحة`), sub: openReqs[0] ? tx(openReqs[0].title) : L('Nothing pending', 'لا شيء معلّق'), act: 'set', arg: 'bp:tab=maintenance' }),
          ui.li({ icon: 'gavel', tone: com ? 'navy' : '', title: com ? tx(com.name) : L('No committee registered', 'لا توجد لجنة مسجلة'), sub: com ? tx(com.basis) : L('Owners can form one in BENA', 'يمكن للمالكين تشكيل لجنة عبر بينا'), act: 'set', arg: 'bp:tab=people' }),
          ui.li({ icon: 'shieldCheck', tone: b.verification === 'verified' ? 'mint' : 'warn', title: ui.statusLabel(b.verification), sub: b.source === 'gis' ? L('Matched to municipal GIS layer', 'مطابق لطبقة نظم المعلومات البلدية') : L('Submitted independently; municipal review applies', 'مُسجّل بشكل مستقل؛ يخضع لمراجعة البلدية'), act: 'set', arg: 'bp:tab=identity' }),
        ]) })}
      </div></div>`;
  }

  function identity({ b }) {
    const data = D();
    const c = coords(b);
    const steps = b.source === 'gis'
      ? [['Record imported from municipal GIS', 'استيراد السجل من نظم البلدية', 'done'], ['Matched to parcel & permit', 'مطابقة القطعة والرخصة', 'done'], ['BENA ID issued', 'إصدار رقم بينا', 'done'], [b.verification === 'verified' ? 'Verified by municipality' : 'Awaiting municipal verification', b.verification === 'verified' ? 'تم التحقق من البلدية' : 'بانتظار تحقق البلدية', b.verification === 'verified' ? 'done' : 'now']]
      : [['Submitted by owner / resident', 'مُقدّم من مالك / ساكن', 'done'], ['Documents uploaded', 'رفع المستندات', 'done'], ['BENA ID issued', 'إصدار رقم بينا', 'done'], [b.verification === 'verified' ? 'Verified with documents' : 'Municipal verification pending', b.verification === 'verified' ? 'تم التحقق بالمستندات' : 'بانتظار تحقق البلدية', b.verification === 'verified' ? 'done' : 'now']];
    return `<div class="grid g-side">
      <div class="stack">
        <div class="id-card">
          <div class="idc-top"><div><div class="eyebrow" style="color:var(--mint)">${L('BENA Building Identity', 'هوية المبنى في بينا')}</div><div class="idc-id">${b.id}</div></div><div class="qr">${B.art.qr(seedOf(b))}</div></div>
          <div class="idc-grid">
            <div>${L('Municipal GIS ID', 'رقم نظم البلدية')}<b class="id-mono" style="color:#fff">${b.gis || '—'}</b></div>
            <div>${L('Municipal reference', 'المرجع البلدي')}<b class="id-mono" style="color:#fff">${b.ref || '—'}</b></div>
            <div>${L('Land parcel', 'قطعة الأرض')}<b>${L(`Basin ${b.parcel.basin} · Parcel ${b.parcel.parcel}`, `حوض ${b.parcel.basin} · قطعة ${b.parcel.parcel}`)}</b></div>
            <div>${L('Building permit', 'رخصة البناء')}<b class="id-mono" style="color:#fff">${b.permit || '—'}</b></div>
          </div>
        </div>
        ${ui.card({ title: L('Data source', 'مصدر البيانات'), body: `<div class="stack-sm">${ui.sourceTag(b.source)}<p class="small muted">${b.source === 'gis' ? L('This identity is anchored to the municipality\'s GIS layer. Geometry and reference numbers are maintained by the municipality.', 'هذه الهوية مرتبطة بطبقة نظم المعلومات البلدية. تحتفظ البلدية بالشكل الهندسي والأرقام المرجعية.') : L('This record was created by an owner or resident in an area where independent registration is permitted. It is clearly separated from verified municipal records until reviewed.', 'أُنشئ هذا السجل من قبل مالك أو ساكن في منطقة يُسمح فيها بالتسجيل المستقل. ويبقى منفصلاً بوضوح عن السجلات البلدية الموثقة حتى تتم مراجعته.')}</p></div>` })}
      </div>
      <div class="stack">
        ${ui.card({ title: L('Location', 'الموقع'), sub: tx(b.address), body: B.map.render({ id: 'bp-loc-' + b.id, focus: b.id, focusW: 300, selected: b.id, mode: 'type', legend: false, height: '320px' }) + `<div class="kv-grid" style="margin-top:14px">${[[L('Latitude', 'خط العرض'), `<span class="id-mono">${c.lat}° N</span>`], [L('Longitude', 'خط الطول'), `<span class="id-mono">${c.lon}° E</span>`], [L('District', 'الحي'), tx(data.district(b.district).name)], [L('Last updated', 'آخر تحديث'), B.date(b.updated)]].map(([k, v]) => `<div class="kv-cell"><div class="l">${k}</div><div class="v">${v}</div></div>`).join('')}</div>` })}
        ${ui.card({ title: L('Verification', 'التحقق'), body: `<div class="verify-steps">${steps.map(([en, ar, s]) => `<div class="${s}"><b>${icon(s === 'done' ? 'checkCircle' : 'clock')}${s === 'done' ? L('Done', 'تم') : L('In progress', 'جارٍ')}</b>${L(en, ar)}</div>`).join('')}</div>` })}
      </div>
    </div>`;
  }

  function units({ b, role }) {
    const data = D();
    const us = data.unitsOf(b.id);
    if (!us.length) return ui.card({ body: ui.empty({ icon: 'stack', title: L('Unit records not mapped yet', 'لم تُدخل سجلات الوحدات بعد'), text: L(`The municipal record lists ${b.units} units across ${b.floors} floors. A committee or property manager can map each unit, its owner and occupancy.`, `يذكر السجل البلدي ${b.units} وحدة على ${b.floors} طوابق. يمكن للجنة أو مدير العقار إدخال كل وحدة ومالكها وحالة إشغالها.`), action: ui.btn(L('Invite the building committee', 'دعوة لجنة المبنى'), { kind: 'primary', icon: 'send', act: 'soon', arg: L('Invitation', 'الدعوة') }) }) });
    const floors = {};
    us.forEach((u) => { (floors[u.floor] = floors[u.floor] || []).push(u); });
    const cls = (u) => (u.kind !== 'apartment' && u.status !== 'vacant' && u.status !== 'maintenance' ? 'u-commercial' : { ownerOccupied: 'u-owner', rented: 'u-rented', vacant: 'u-vacant', maintenance: 'u-maint' }[u.status]);
    const stack = `<div class="floors">${Object.keys(floors).map(Number).sort((a, c) => c - a).map((f) => `<div class="floor"><span class="fl">${f === 0 ? L('G', 'أرضي') : f}</span><div class="fu" style="--n:${Math.max(4, floors[f].length)}">${floors[f].map((u) => `<button class="${cls(u)}" data-act="bpUnit" data-arg="${u.id}" title="${esc(data.unitLabel(u))}">${u.number}</button>`).join('')}</div></div>`).join('')}</div>`;
    const legend = `<div class="unit-legend" style="margin-top:14px"><span><i class="u-owner"></i>${L('Owner-occupied', 'يسكنها المالك')}</span><span><i class="u-rented"></i>${L('Rented', 'مؤجرة')}</span><span><i class="u-vacant"></i>${L('Vacant', 'شاغرة')}</span><span><i class="u-maint"></i>${L('Maintenance', 'صيانة')}</span><span><i class="u-commercial"></i>${L('Commercial in use', 'تجاري مستخدم')}</span></div>`;
    const kinds = {};
    us.forEach((u) => { kinds[u.kind] = (kinds[u.kind] || 0) + 1; });
    const area = B.sum(us, (u) => u.area);
    return `<div class="grid g-main">
      ${ui.card({ title: L('Floor stack', 'مخطط الطوابق'), sub: L('Tap a unit for details', 'اضغط على وحدة لعرض التفاصيل'), body: stack + legend })}
      <div class="stack">
        ${ui.card({ title: L('Unit mix', 'تركيبة الوحدات'), body: B.charts.hbars({ data: Object.entries(kinds).map(([k, v], i) => ({ label: tx(data.unitKinds[k]), value: v, color: ['#142B3B', '#36D6A0', '#7FA7C2', '#F2B35A'][i] })) }) + `<div class="divider" style="margin:16px 0"></div>` + ui.kv([[L('Total mapped units', 'إجمالي الوحدات المُدخلة'), `<b>${us.length}</b>`], [L('Total unit area', 'إجمالي مساحة الوحدات'), `<b>${B.num(area)} m²</b>`], [L('Average unit size', 'متوسط مساحة الوحدة'), `<b>${Math.round(area / us.length)} m²</b>`]]) })}
        ${ui.callout(role === 'resident' || role === 'provider' ? L('Owner and tenant names are only visible to authorized roles (committee, managers, owners of the unit).', 'أسماء المالكين والمستأجرين متاحة فقط للأدوار المخوّلة (اللجنة، المدراء، مالكي الوحدة).') : L('Unit relationships are shown according to your role\'s permissions in this building.', 'تظهر علاقات الوحدات وفق صلاحيات دورك في هذا المبنى.'), '', 'lock')}
      </div></div>`;
  }

  function people({ b, o, com, mgr, fac, role }) {
    const data = D();
    const comCard = com ? ui.card({ title: tx(com.name), sub: tx(com.basis), headExtra: ui.status(com.kind), body: ui.list(com.members.map((m) => ui.li({ avatar: data.person(m.p).name, title: data.pname(m.p), sub: `${tx(m.role)} · ${L('since', 'منذ')} ${B.date(m.since)}`, end: m.delegated ? ui.badge(L('Proxy holder', 'حامل تفويض'), 'info', 'key') : '' }))), foot: `<span class="xs muted">${com.regNo ? L('Registration', 'رقم التسجيل') + ' <b class="id-mono">' + com.regNo + '</b>' : L('Not legally registered', 'غير مسجلة قانونياً')}</span>${role === 'committee' ? ui.btn(L('Open workspace', 'فتح مساحة العمل'), { kind: 'soft', size: 'sm', go: 'committee-home' }) : ''}` })
      : ui.card({ title: L('Building committee', 'لجنة المبنى'), body: ui.empty({ icon: 'gavel', title: L('No committee or association registered', 'لا توجد لجنة أو جمعية مسجلة'), text: L('Owners can register an owners\' association, an informal committee or an authorized manager.', 'يمكن للمالكين تسجيل جمعية مالكين أو لجنة غير رسمية أو مدير مفوّض.'), action: ui.btn(L('Start a committee', 'تشكيل لجنة'), { kind: 'primary', icon: 'plus', act: 'soon', arg: L('Committee setup', 'تشكيل اللجنة') }) }) });
    const orgCard = (org, label) => ui.card({ title: label, body: `<div class="row"><span class="li-icon navy">${icon(org.type === 'facility' ? 'settings' : 'briefcase')}</span><div class="grow"><b>${tx(org.name)}</b><div class="small muted">${L('Since', 'منذ')} ${B.date(org.since)}${org.license ? ` · <span class="id-mono">${org.license}</span>` : ''}</div></div></div>${org.contact ? `<div class="divider" style="margin:14px 0"></div>${ui.kv([[L('Account manager', 'مدير الحساب'), esc(data.pname(org.contact))], [L('Phone', 'الهاتف'), `<span class="ltr">${org.phone || data.person(org.contact).phone || '—'}</span>`]])}` : ''}` });
    const ownersList = o ? (() => {
      const map = {};
      data.unitsOf(b.id).forEach((u) => { map[u.owner] = (map[u.owner] || 0) + 1; });
      const top = Object.entries(map).sort((a, c) => c[1] - a[1]).slice(0, 6);
      const priv = role === 'resident' || role === 'provider';
      return ui.card({ title: L('Owners', 'المالكون'), sub: L(`${Object.keys(map).length} registered owners`, `${Object.keys(map).length} مالكاً مسجلاً`), body: priv ? ui.empty({ icon: 'lock', title: L('Owner list is private', 'قائمة المالكين خاصة'), text: L('Visible to the committee, managers and municipality.', 'متاحة للجنة والمدراء والبلدية.') }) : ui.list(top.map(([p, n]) => ui.li({ avatar: data.person(p).name, title: data.pname(p), sub: L(`${n} unit${n > 1 ? 's' : ''}`, `${n} وحدة`) }))) });
    })() : '';
    return `<div class="grid g2">${comCard}<div class="stack">${mgr ? orgCard(mgr, L('Property management', 'إدارة العقار')) : ''}${fac ? orgCard(fac, L('Facility management', 'إدارة المرافق')) : ''}${!mgr && !fac ? ui.card({ title: L('Management', 'الإدارة'), body: ui.empty({ icon: 'briefcase', title: L('Self-managed building', 'مبنى بإدارة ذاتية'), text: L('No property or facility manager is linked.', 'لا يوجد مدير عقار أو مرافق مرتبط.') }) }) : ''}${ownersList}</div></div>`;
  }

  function services({ b, assets }) {
    const data = D();
    const util = data.utilities[b.id];
    const ic = { electricity: 'zap', water: 'droplet', internet: 'wifi', waste: 'trash' };
    const utilCard = util ? ui.card({ title: L('Utility & service accounts', 'حسابات المرافق والخدمات'), sub: L('Common areas — last 6 months', 'المناطق المشتركة — آخر 6 أشهر'), body: `<div class="grid g2">${util.map((u) => `<div class="card flat pad-sm"><div class="row between"><div class="row-sm"><span class="li-icon mint" style="width:32px;height:32px">${icon(ic[u.kind])}</span><b class="small">${tx(u.name)}</b></div>${ui.status(u.status)}</div><div class="row between" style="margin-top:10px;align-items:flex-end"><div><div class="xs faint">${L('Last bill', 'آخر فاتورة')}</div><b class="num" style="font-size:18px">${B.money(u.last)}</b></div><div style="width:46%">${B.charts.spark(u.trend, u.kind === 'water' ? '#7FA7C2' : '#36D6A0')}</div></div><div class="xs faint" style="margin-top:6px">${L('Account', 'الحساب')} <span class="id-mono">${u.acct}</span></div></div>`).join('')}</div>` })
      : ui.card({ title: L('Utility & service accounts', 'حسابات المرافق والخدمات'), body: ui.empty({ icon: 'plug', title: L('No accounts connected', 'لا توجد حسابات مرتبطة'), text: L('Committees and managers can link electricity, water and internet accounts to track shared costs.', 'يمكن للجان والمدراء ربط حسابات الكهرباء والمياه والإنترنت لمتابعة التكاليف المشتركة.') }) });
    const catIcon = { elevator: 'elevator', generator: 'generator', pump: 'pump', tank: 'tank', fire: 'fireExt', access: 'lock', hvac: 'wind' };
    const assetCard = ui.card({ title: L('Shared assets', 'الأصول المشتركة'), sub: assets.length ? L(`${assets.length} registered assets`, `${assets.length} أصول مسجلة`) : '', body: assets.length ? ui.list(assets.map((a) => ui.li({ icon: catIcon[a.cat] || 'cpu', tone: a.status === 'fault' ? 'bad' : a.status === 'due' ? 'warn' : 'mint', title: tx(a.name), sub: `${tx(a.loc)} · ${L('next service', 'الصيانة القادمة')} ${B.date(a.next)}`, end: a.status === 'fault' ? ui.badge(L('Fault reported', 'عطل مُبلغ'), 'bad') : a.status === 'due' ? ui.badge(L('Service due', 'صيانة مستحقة'), 'warn') : ui.status(a.cond) }))) : ui.empty({ icon: 'cpu', title: L('No assets registered', 'لا توجد أصول مسجلة'), text: L('Elevators, pumps, generators and safety systems appear here once added.', 'تظهر هنا المصاعد والمضخات والمولدات وأنظمة السلامة بعد إضافتها.') }) });
    return `<div class="grid g2">${utilCard}${assetCard}</div>`;
  }

  function maintenance({ b, reqs, openReqs, role }) {
    const done = reqs.filter((q) => q.status === 'completed');
    return `<div class="grid g-main">
      ${ui.card({ title: L('Maintenance requests', 'طلبات الصيانة'), sub: L(`${openReqs.length} open · ${done.length} completed`, `${openReqs.length} مفتوحة · ${done.length} مكتملة`), body: reqs.length ? ui.list(reqs.map((q) => ui.li({ icon: D().cat(q.cat).icon, tone: q.priority === 'high' ? 'bad' : 'mint', title: tx(q.title), sub: `<span class="id-mono">${q.id}</span> · ${q.scope === 'common' ? L('Common area', 'منطقة مشتركة') : L('Unit', 'وحدة')} · ${B.date(q.created)}`, end: ui.status(q.status), act: 'bpRequest', arg: q.id }))) : ui.empty({ icon: 'wrench', title: L('No requests yet', 'لا توجد طلبات بعد'), text: L('Requests from residents, committees and managers will appear here.', 'ستظهر هنا الطلبات من السكان واللجان والمدراء.') }) })}
      <div class="stack">
        ${ui.card({ title: L('Service levels', 'مستويات الخدمة'), body: `<div class="stack">${ui.meter(L('Requests resolved within SLA', 'طلبات حُلّت ضمن المدة'), '91%', 91)}${ui.meter(L('Preventive tasks on schedule', 'مهام وقائية في موعدها'), '84%', 84)}${ui.meter(L('Resident satisfaction', 'رضا السكان'), '4.6 / 5', 92)}</div>` })}
        ${ui.btn(L('Report a maintenance issue', 'الإبلاغ عن مشكلة صيانة'), { kind: 'primary', icon: 'plus', block: true, act: role === 'resident' ? 'newRequest' : 'bpReport', arg: b.id })}
      </div></div>`;
  }

  function finance({ b, com, o }) {
    if (!com || !o) return ui.card({ body: ui.empty({ icon: 'wallet', title: L('No shared finances published', 'لا توجد بيانات مالية منشورة'), text: L('When a committee or manager runs building accounts in BENA, a summary of income and common expenses is shared here.', 'عندما تدير لجنة أو مدير حسابات المبنى عبر بينا، يُعرض هنا ملخص الإيرادات والمصاريف المشتركة.') }) });
    const units = D().unitsOf(b.id);
    const monthly = B.sum(units, (u) => u.charge);
    const collected = Math.round(monthly * 0.87);
    const exp = [
      { label: L('Cleaning', 'التنظيف'), value: 2100, color: '#7FA7C2' }, { label: L('Elevator contract', 'عقد المصاعد'), value: 1650, color: '#142B3B' },
      { label: L('Common electricity', 'كهرباء مشتركة'), value: 2860, color: '#36D6A0' }, { label: L('Water & pumps', 'المياه والمضخات'), value: 940, color: '#F2B35A' },
      { label: L('Security & intercom', 'الأمن والاتصال'), value: 800, color: '#9B8AE0' }, { label: L('Reserve fund', 'صندوق الاحتياط'), value: 1000, color: '#C9D6DF' },
    ];
    return `<div class="grid g4" style="margin-bottom:16px">
        ${ui.kpi({ label: L('Monthly charges', 'الرسوم الشهرية'), value: B.money(monthly), icon: 'receipt' })}
        ${ui.kpi({ label: L('Collected (Nov)', 'المُحصّل (ت٢)'), value: B.money(collected), icon: 'checkCircle', tone: 'mint', delta: '87%', dir: 'up', foot: L('collection rate', 'نسبة التحصيل') })}
        ${ui.kpi({ label: L('Expenses (Nov)', 'المصاريف (ت٢)'), value: B.money(B.sum(exp, (e) => e.value)), icon: 'card', tone: 'info' })}
        ${ui.kpi({ label: L('Reserve balance', 'رصيد الاحتياط'), value: B.money(38400), icon: 'wallet', tone: 'violet' })}
      </div>
      <div class="grid g2">
        ${ui.card({ title: L('Where the service charge goes', 'أين تُصرف رسوم الخدمات'), body: B.charts.donut({ data: exp, format: (v) => B.money(v), center: { value: B.money(B.sum(exp, (e) => e.value)), label: L('this month', 'هذا الشهر') } }) })}
        ${ui.card({ title: L('Collections — last 6 months', 'التحصيل — آخر 6 أشهر'), body: B.charts.bars({ labels: [5, 6, 7, 8, 9, 10].map((m) => B.mon(m)), series: [{ name: L('Collected', 'المُحصّل'), color: '#36D6A0', values: [8.1, 8.6, 8.9, 8.4, 9.1, collected / 1000] }, { name: L('Outstanding', 'المتأخر'), color: '#E2E9E6', values: [1.6, 1.1, 0.8, 1.3, 0.6, (monthly - collected) / 1000] }], format: (v) => '₪' + B.num1(v) + 'K', height: 190 }) })}
      </div>`;
  }

  function related({ b }) {
    const data = D();
    const role = B.route.role;
    const cats = b.type === 'office' || b.type === 'commercial' ? ['hvac', 'elevators', 'cleaning', 'security'] : ['tanks', 'plumbing', 'cleaning', 'elevators'];
    const provs = data.providers.filter((p) => p.cats.some((c) => cats.includes(c)) && p.areas.includes(b.district)).slice(0, 4);
    return `<div class="stack">
      <div class="chips">${cats.map((c) => `<button class="chip" data-go="${role}-services-${c}">${icon(data.cat(c).icon)}${tx(data.cat(c).name)}</button>`).join('')}</div>
      <div class="grid g2">${provs.map((p) => `<button class="card link" data-go="${role}-provider-${p.id}"><div class="row"><span class="avatar lg sq" style="background:var(--mint-50);color:var(--mint-ink)">${esc(B.initials(p.name))}</span><div class="grow"><div class="row-sm"><b>${tx(p.name)}</b>${p.verified ? `<span class="mint-ink" title="verified">${icon('badgeCheck')}</span>` : ''}</div><div class="small muted">${tx(p.tagline)}</div><div class="row-sm" style="margin-top:6px">${ui.stars(p.rating)}<span class="xs faint">${p.rating} · ${p.reviews} ${L('reviews', 'تقييم')}</span></div></div>${icon('chevR', 'flip chev')}</div></button>`).join('') || ui.empty({ icon: 'sparkles', title: L('No providers cover this area yet', 'لا يوجد مزودون يغطون هذه المنطقة بعد') })}</div>
      ${ui.card({ cls: 'mint', body: `<div class="row between wrap"><div><b>${L('Need something else for this building?', 'تحتاج خدمة أخرى لهذا المبنى؟')}</b><div class="small muted">${L('Browse all categories in the BENA services marketplace.', 'تصفح جميع الفئات في سوق خدمات بينا.')}</div></div>${ui.btn(L('Open marketplace', 'فتح السوق'), { kind: 'dark', icon: 'store', go: `${role}-services` })}</div>` })}
    </div>`;
  }

  /* ---------------- Building Identity workspace sections ---------------- */
  const tbl = (head, rows) => `<div class="card pad-0"><div class="table-wrap"><table class="table"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  const priv = (role) => role === 'resident' || role === 'provider';
  const isOfficial = (b) => b.source === 'gis';

  function identityCard({ b }) {
    return `<div class="grid g-side">
      <div class="stack">
        <div class="id-card">
          <div class="idc-top"><div><div class="eyebrow" style="color:var(--mint)">${L('BENA Building Identity', 'هوية المبنى في BENA')}</div><div class="idc-id">${b.id}</div></div><div class="qr">${B.art.qr(seedOf(b))}</div></div>
          <div class="idc-grid">
            <div>${L('Issued', 'تاريخ الإصدار')}<b>${B.date(b.key ? '2025-03-0' + (seedOf(b) % 9 + 1) : '2025-06-14')}</b></div>
            <div>${L('Status', 'الحالة')}<b>${ui.statusLabel(b.verification)}</b></div>
            <div>${L('Type', 'النوع')}<b>${D().typeLabel(b.type)}</b></div>
            <div>${L('District (sample)', 'الحي (نموذج)')}<b>${tx(D().district(b.district).name)}</b></div>
          </div>
        </div>
        ${ui.callout(L('<b>What the BENA ID is:</b> a permanent internal reference that links this building\'s information, units, relationships and services. <b>What it is not:</b> a title deed, a land-registry record or proof of ownership.', '<b>ما هو رقم BENA:</b> مرجع داخلي دائم يربط معلومات المبنى ووحداته وعلاقاته وخدماته. <b>ما ليس هو:</b> سند ملكية أو قيد في سجل الأراضي أو إثبات للملكية.'), '', 'fingerprint')}
      </div>
      <div class="stack">
        ${ui.card({ title: L('Identity at a glance', 'الهوية باختصار'), body: ui.kv([
          [L('BENA Building ID', 'رقم المبنى في BENA'), `${ui.idMono(b.id)} ${ui.prov('official').replace('Official source', 'BENA').replace('مصدر رسمي', 'BENA')}`],
          [L('Sample municipal reference', 'مرجع بلدي نموذجي'), b.gis ? `${ui.idMono(b.gis)} ${ui.prov('official')}` : `<span class="faint">${L('Not linked', 'غير مرتبط')}</span> ${ui.prov('pending')}`],
          [L('Record origin', 'أصل السجل'), isOfficial(b) ? L('Imported from a sample municipal GIS layer', 'مستورد من طبقة نظم معلومات بلدية نموذجية') : L('Independently submitted by an owner', 'مُسجّل بشكل مستقل من قبل مالك')],
          [L('Verification', 'التحقق'), ui.status(b.verification)],
          [L('Last updated', 'آخر تحديث'), B.date(b.updated)],
        ]) })}
        ${ui.card({ title: L('BENA identity vs. official ownership records', 'هوية BENA مقابل سجلات الملكية الرسمية'), body: `<div class="bw-compare">
          <div><b>${icon('fingerprint')}${L('BENA Building ID', 'رقم المبنى في BENA')}</b><ul><li>${L('Digital reference for coordination', 'مرجع رقمي للتنسيق')}</li><li>${L('Links units, people, services and data sources', 'يربط الوحدات والأشخاص والخدمات ومصادر البيانات')}</li><li>${L('Maintained in BENA with provenance and verification history', 'يُدار في BENA مع مصدر البيانات وسجل التحقق')}</li></ul></div>
          <div><b>${icon('landmark')}${L('Official ownership records', 'سجلات الملكية الرسمية')}</b><ul><li>${L('Held by the competent land and property authorities', 'تحتفظ بها جهات الأراضي والعقارات المختصة')}</li><li>${L('The legal source of title and rights', 'المصدر القانوني للملكية والحقوق')}</li><li>${L('BENA may reference them — it never replaces them', 'قد تشير إليها BENA — ولا تحلّ محلها')}</li></ul></div></div>` })}
      </div></div>`;
  }

  function location({ b }) {
    const c = coords(b);
    const ly = B.get('bp:ly', 'parcels');
    return `<div class="grid g-main">
      ${ui.card({ title: L('Location', 'الموقع'), sub: tx(b.address), headExtra: ui.seg('bp:ly', [{ id: 'parcels', label: L('Parcels', 'القطع') }, { id: 'plain', label: L('Footprints', 'المباني') }, { id: 'ver', label: L('Verification', 'التحقق') }], ly), body: B.map.render({ id: 'bw-loc-' + b.id, focus: b.id, focusW: 240, selected: b.id, mode: ly === 'ver' ? 'verification' : 'type', layers: { parcels: ly !== 'plain' }, legend: ly === 'ver', height: '440px', badge: L('Sample geometry · not cadastral data', 'هندسة نموذجية · ليست بيانات مساحية') }) })}
      <div class="stack">
        ${ui.card({ title: L('Coordinates & address', 'الإحداثيات والعنوان'), body: ui.kv([[L('Latitude', 'خط العرض'), `<span class="id-mono">${c.lat}° N</span>`], [L('Longitude', 'خط الطول'), `<span class="id-mono">${c.lon}° E</span>`], [L('Street address', 'العنوان'), esc(tx(b.address))], [L('District', 'الحي'), tx(D().district(b.district).name)], [L('Geometry source', 'مصدر الهندسة'), isOfficial(b) ? ui.prov('official') : ui.prov('submitted')]]) })}
        ${ui.card({ title: L('Land parcel (sample reference)', 'قطعة الأرض (مرجع نموذجي)'), body: ui.kv([[L('Basin', 'الحوض'), b.parcel.basin], [L('Parcel', 'القطعة'), b.parcel.parcel], [L('Source', 'المصدر'), isOfficial(b) ? ui.prov('official') : ui.prov('pending')]]) + `<p class="xs faint" style="margin-top:10px">${L('Parcel outlines on this map are illustrative demonstration geometry.', 'حدود القطع في هذه الخريطة هندسة توضيحية للعرض.')}</p>` })}
      </div></div>`;
  }

  function municipal({ b }) {
    if (!b.gis) return ui.card({ body: ui.empty({ icon: 'landmark', title: L('No municipal reference linked yet', 'لا يوجد مرجع بلدي مرتبط بعد'), text: L('This record was submitted independently. A municipal officer can match it to a sample municipal reference in the Building Matching workspace.', 'قُدّم هذا السجل بشكل مستقل. يمكن لموظف البلدية مطابقته مع مرجع بلدي نموذجي في مساحة مطابقة المباني.'), action: `<div class="row wrap" style="justify-content:center">${ui.prov('submitted')}${ui.prov('pending')}</div>` }) });
    return `<div class="grid g2">
      ${ui.card({ title: L('Sample municipal reference', 'المرجع البلدي النموذجي'), headExtra: ui.prov('official'), body: ui.kv([[L('Municipal GIS ID', 'رقم نظم المعلومات البلدية'), ui.idMono(b.gis)], [L('Municipal file reference', 'مرجع الملف البلدي'), ui.idMono(b.ref)], [L('Building permit', 'رخصة البناء'), b.permit ? ui.idMono(b.permit) : '—'], [L('Sample municipality', 'البلدية النموذجية'), tx(D().municipality.name) + ` <span class="faint xs">(${L('sample', 'نموذج')})</span>`], [L('Last synchronised', 'آخر مزامنة'), B.date(b.updated)]]) })}
      ${ui.card({ title: L('How the link works (designed capability)', 'كيف يعمل الربط (قدرة مصمَّمة)'), body: ui.timeline([
        { title: L('Municipal layer published', 'نشر الطبقة البلدية'), meta: L('Municipality maintains geometry and references', 'تحتفظ البلدية بالهندسة والمراجع'), state: 'done', icon: 'landmark' },
        { title: L('Matched to BENA identity', 'المطابقة مع هوية BENA'), meta: L('Parcel, address and footprint compared', 'مقارنة القطعة والعنوان والمسقط'), state: 'done', icon: 'link' },
        { title: L('Changes flow both ways for review', 'تتدفق التغييرات في الاتجاهين للمراجعة'), meta: L('Corrections are proposed, never overwritten', 'تُقترح التصحيحات ولا تُستبدل تلقائياً'), state: 'current', icon: 'refresh' },
      ]) + ui.callout(L('In this prototype the municipal reference is sample data. BENA is designed to connect with municipal systems; no live connection exists.', 'في هذا النموذج المرجع البلدي بيانات نموذجية. صُمّمت BENA للارتباط بأنظمة البلديات؛ ولا يوجد اتصال فعلي.'), 'dashed', 'info') })}
    </div>`;
  }

  function external({ b, role }) {
    const rows = [
      [L('BENA Building ID', 'رقم المبنى في BENA'), ui.idMono(b.id), L('BENA', 'BENA'), B.date(b.updated), ui.prov('official').replace('Official source', 'BENA').replace('مصدر رسمي', 'BENA')],
      [L('Municipal GIS ID', 'رقم نظم المعلومات البلدية'), b.gis ? ui.idMono(b.gis) : '—', L('Sample municipal GIS layer', 'طبقة نظم معلومات بلدية نموذجية'), b.gis ? B.date(b.updated) : '—', b.gis ? ui.prov('official') : ui.prov('pending')],
      [L('Municipal file reference', 'مرجع الملف البلدي'), b.ref ? ui.idMono(b.ref) : '—', L('Sample municipal records', 'سجلات بلدية نموذجية'), b.ref ? '2026-02-11' : '—', b.ref ? ui.prov('official') : ui.prov('pending')],
      [L('Land parcel', 'قطعة الأرض'), L(`Basin ${b.parcel.basin} · Parcel ${b.parcel.parcel}`, `حوض ${b.parcel.basin} · قطعة ${b.parcel.parcel}`), L('Sample land reference', 'مرجع أراضٍ نموذجي'), '2025-11-02', isOfficial(b) ? ui.prov('official') : ui.prov('pending')],
      [L('Building permit', 'رخصة البناء'), b.permit ? ui.idMono(b.permit) : '—', L('Sample permit archive', 'أرشيف رخص نموذجي'), b.permit ? '2025-09-18' : '—', b.permit ? ui.prov('official') : ui.prov('submitted')],
      [L('Utility service points', 'نقاط خدمة المرافق'), L('4 accounts', '4 حسابات'), L('Committee / manager', 'اللجنة / المدير'), '2026-10-30', ui.prov('submitted')],
      [L('Postal address', 'العنوان البريدي'), esc(tx(b.street || b.name)), L('Owner submission', 'تقديم المالك'), '2026-06-01', ui.prov('submitted')],
      [L('Coordinates', 'الإحداثيات'), `<span class="id-mono">${coords(b).lat}, ${coords(b).lon}</span>`, L('Derived from footprint (demo)', 'مشتقة من المسقط (عرض)'), '—', ui.prov('demo')],
    ];
    return tbl([L('Identifier', 'المعرّف'), L('Value', 'القيمة'), L('Source', 'المصدر'), L('Last synced', 'آخر مزامنة'), L('Provenance', 'المصدر')], rows.map((r) => [ `<b>${r[0]}</b>`, r[1], `<span class="muted">${r[2]}</span>`, r[3] === '—' ? '—' : B.date(r[3]), r[4] ])) + `<div style="margin-top:12px" class="row wrap">${role === 'municipality' || role === 'admin' ? ui.btn(L('Link another reference', 'ربط مرجع آخر'), { icon: 'link', act: 'soon', arg: L('Reference linking', 'ربط المراجع'), size: 'sm' }) : ''}${ui.btn(L('Propose a correction', 'اقتراح تصحيح'), { icon: 'edit', act: 'bpReport', arg: b.id, size: 'sm' })}</div>`;
  }

  function classification({ b, us }) {
    const t = D().types[b.type] || {};
    const height = b.floors >= 10 ? L('High-rise (10+ floors)', 'مرتفع (10 طوابق فأكثر)') : b.floors >= 5 ? L('Mid-rise (5–9 floors)', 'متوسط الارتفاع (5–9 طوابق)') : L('Low-rise (1–4 floors)', 'منخفض (1–4 طوابق)');
    const kinds = {}; us.forEach((u) => { kinds[u.kind] = (kinds[u.kind] || 0) + 1; });
    return `<div class="grid g2">
      ${ui.card({ title: L('Building classification', 'تصنيف المبنى'), body: ui.kv([[L('Primary use', 'الاستخدام الرئيسي'), `${tx(t)} ${isOfficial(b) ? ui.prov('official') : ui.prov('submitted')}`], [L('Height class', 'فئة الارتفاع'), `${height} ${ui.prov('demo')}`], [L('Year built', 'سنة البناء'), `${b.year} ${isOfficial(b) ? ui.prov('official') : ui.prov('submitted')}`], [L('Construction', 'الإنشاء'), `${b.type === 'heritage' ? L('Load-bearing limestone', 'حجر جيري حامل') : L('Reinforced concrete, limestone cladding', 'خرسانة مسلّحة بواجهة حجرية')} ${ui.prov('submitted')}`], [L('Heritage designation', 'التصنيف التراثي'), b.type === 'heritage' ? `${L('Listed in sample heritage zone', 'ضمن منطقة تراثية نموذجية')} ${ui.prov('pending')}` : L('None', 'لا يوجد')], [L('Gross floor area', 'المساحة الطابقية'), b.area ? `${B.num(b.area)} m² ${ui.prov('submitted')}` : '—']]) })}
      ${ui.card({ title: L('Unit categories', 'فئات الوحدات'), body: us.length ? B.charts.hbars({ data: Object.entries(kinds).map(([k, v], i) => ({ label: tx(D().unitKinds[k]), value: v, color: ['#142B3B', '#36D6A0', '#7FA7C2', '#F2B35A'][i] })) }) : ui.empty({ icon: 'stack', title: L('Units not mapped yet', 'لم تُدخل الوحدات بعد') }) })}
    </div>`;
  }

  function floors({ b, us }) {
    const by = {}; us.forEach((u) => { (by[u.floor] = by[u.floor] || []).push(u); });
    const rows = Array.from({ length: b.floors }, (_, i) => b.floors - 1 - i).map((f) => {
      const list = by[f] || [];
      const use = f === 0 ? L('Lobby & shops', 'الردهة والمحلات') : list[0] ? tx(D().unitKinds[list[0].kind]) : L('Not mapped', 'غير مُدخل');
      const occ = list.filter((u) => u.status === 'rented' || u.status === 'ownerOccupied').length;
      return [`<b class="num">${f === 0 ? L('Ground', 'الأرضي') : f}</b>`, use, list.length || '—', list.length ? `${occ}/${list.length}` : '—', list.length ? ui.progress((occ / list.length) * 100, '', 'thin') : '<span class="faint">—</span>'];
    });
    return tbl([L('Floor', 'الطابق'), L('Use', 'الاستخدام'), L('Units', 'الوحدات'), L('Occupied', 'المشغولة'), L('Occupancy', 'الإشغال')], rows);
  }

  function ownership({ b, us, role }) {
    if (!us.length) return ui.card({ body: ui.empty({ icon: 'key', title: L('No ownership relationships recorded', 'لا توجد علاقات ملكية مسجّلة'), text: L('Owners can register their relationship to a unit; it stays "pending verification" until supporting documents are reviewed.', 'يمكن للمالكين تسجيل علاقتهم بالوحدة؛ وتبقى «بانتظار التحقق» حتى تُراجع المستندات الداعمة.') }) });
    const note = ui.callout(L('<b>Relationship records, not title.</b> BENA records who is associated with each unit so people and services can coordinate. Legal ownership is established only by the competent authorities.', '<b>سجلات علاقات وليست سندات ملكية.</b> تسجّل BENA الأشخاص المرتبطين بكل وحدة لتسهيل التنسيق. تُثبت الملكية القانونية فقط من الجهات المختصة.'), 'warn', 'key');
    if (priv(role)) return note + ui.card({ body: ui.empty({ icon: 'lock', title: L('Ownership relationships are private', 'علاقات الملكية خاصة'), text: L('Visible to the unit owners, the committee, authorised managers and the municipality.', 'متاحة لمالكي الوحدات واللجنة والمدراء المخوّلين والبلدية.') }) });
    const rows = us.slice(0, 14).map((u, i) => [ui.idMono(u.number), esc(D().pname(u.owner)) + (u.coOwners ? ` <span class="faint xs">+ ${u.coOwners.map((c) => esc(D().pname(c))).join(', ')}</span>` : ''), u.coOwners ? '50%' : '100%', B.date(`20${14 + (i % 10)}-0${1 + (i % 9)}-1${i % 9}`), i % 5 === 3 ? ui.prov('pending') : ui.prov('submitted')]);
    return note + `<div style="height:12px"></div>` + tbl([L('Unit', 'الوحدة'), L('Owner(s) of record', 'المالك/المالكون'), L('Share', 'الحصة'), L('Since', 'منذ'), L('Provenance', 'المصدر')], rows) + (us.length > 14 ? `<p class="xs faint" style="margin-top:8px">${L(`Showing 14 of ${us.length} units`, `عرض 14 من ${us.length} وحدة`)}</p>` : '');
  }

  function occupancy({ b, o, us, role }) {
    if (!o) return ui.card({ body: ui.empty({ icon: 'users', title: L('Occupancy not mapped yet', 'لم يُدخل الإشغال بعد') }) });
    const rows = us.filter((u) => u.status === 'rented' || u.status === 'ownerOccupied').slice(0, 12).map((u) => { const l = D().leaseOfUnit(u.id); return [ui.idMono(u.number), u.status === 'rented' ? ui.status('rented') : ui.status('ownerOccupied'), priv(role) ? `<span class="faint">${L('Private', 'خاص')}</span>` : esc(D().pname(u.tenant)), l ? ui.idMono(l.id) : '—', l ? B.date(l.end) : '—', l ? ui.status(l.status) : ui.prov('submitted')]; });
    return `<div class="grid g4" style="margin-bottom:14px">${ui.kpi({ label: L('Occupied', 'مشغولة'), value: o.rate + '%', icon: 'users', tone: 'mint' })}${ui.kpi({ label: L('Rented', 'مؤجرة'), value: o.rented, icon: 'key' })}${ui.kpi({ label: L('Owner-occupied', 'يسكنها المالك'), value: o.ownerOccupied, icon: 'home' })}${ui.kpi({ label: L('Vacant', 'شاغرة'), value: o.vacant, icon: 'door', tone: 'warn' })}</div>` + tbl([L('Unit', 'الوحدة'), L('Relationship', 'العلاقة'), L('Occupant', 'الشاغل'), L('Lease', 'العقد'), L('Lease ends', 'ينتهي العقد'), L('Status', 'الحالة')], rows);
  }

  function management({ mgr, fac, b }) {
    const card = (org, label, scope) => ui.card({ title: label, headExtra: ui.prov('submitted'), body: `<div class="row"><span class="li-icon navy">${icon(org.type === 'facility' ? 'settings' : 'briefcase')}</span><div class="grow"><b>${tx(org.name)}</b><div class="small muted">${L('Since', 'منذ')} ${B.date(org.since)}${org.license ? ` · <span class="id-mono">${org.license}</span>` : ''}</div></div></div><div class="divider" style="margin:14px 0"></div>${ui.kv([[L('Scope', 'النطاق'), scope], [L('Account manager', 'مدير الحساب'), esc(D().pname(org.contact))], [L('Agreement', 'الاتفاقية'), L('Signed by the owners\' association (sample)', 'موقّعة من جمعية المالكين (نموذج)')]])}` });
    if (!mgr && !fac) return ui.card({ body: ui.empty({ icon: 'briefcase', title: L('Self-managed building', 'مبنى بإدارة ذاتية'), text: L('No property or facility manager is linked to this building.', 'لا يوجد مدير عقار أو مرافق مرتبط بهذا المبنى.') }) });
    return `<div class="grid g2">${mgr ? card(mgr, L('Property management', 'إدارة العقار'), L('Leasing, rent collection, owner reporting, maintenance coordination', 'التأجير وتحصيل الإيجارات وتقارير المالكين وتنسيق الصيانة')) : ''}${fac ? card(fac, L('Facility management', 'إدارة المرافق'), L('Assets, preventive maintenance, inspections, contractors', 'الأصول والصيانة الوقائية والفحوصات والمقاولون')) : ''}</div>`;
  }

  function documents({ b, role }) {
    const docs = [
      [L('Building permit (sample copy)', 'رخصة البناء (نسخة نموذجية)'), 'official', '2015-08-02', '1.8 MB'],
      [L('Site plan & parcel extract (sample)', 'مخطط الموقع ومخطط القطعة (نموذج)'), 'official', '2016-01-20', '3.2 MB'],
      [L('Owners\' association bylaws', 'النظام الداخلي لجمعية المالكين'), 'submitted', '2018-04-12', '640 KB'],
      [L('Fire safety certificate', 'شهادة السلامة من الحريق'), 'submitted', '2026-07-20', '310 KB'],
      [L('Elevator inspection report — Sep 2026', 'تقرير فحص المصاعد — أيلول 2026'), 'submitted', '2026-09-14', '1.1 MB'],
      [L('Unit-count correction request', 'طلب تصحيح عدد الوحدات'), 'pending', '2026-11-18', '220 KB'],
    ];
    return tbl([L('Document', 'المستند'), L('Provenance', 'المصدر'), L('Date', 'التاريخ'), L('Size', 'الحجم'), ''], docs.map(([n, p, d, sz]) => [`<b>${n}</b>`, ui.prov(p), B.date(d), sz, `<button class="btn btn-sm btn-ghost" data-act="previewDoc" data-arg="${esc(n)}">${icon('eye')}${L('Preview', 'معاينة')}</button>`]));
  }

  function sources({ b }) {
    const rows = [
      [L('Sample municipal GIS layer', 'طبقة نظم معلومات بلدية نموذجية'), L('Footprint, GIS ID, file reference', 'المسقط ورقم النظام ومرجع الملف'), isOfficial(b) ? ui.prov('official') : '—', L('Weekly (designed)', 'أسبوعياً (مصمَّم)'), B.date(b.updated)],
      [L('Owner & resident submissions', 'تقديمات المالكين والسكان'), L('Units, relationships, contacts', 'الوحدات والعلاقات وجهات الاتصال'), ui.prov('submitted'), L('On change', 'عند التغيير'), B.date('2026-11-20')],
      [L('Committee records', 'سجلات اللجنة'), L('Governance, budget, documents', 'الحوكمة والموازنة والمستندات'), ui.prov('submitted'), L('On change', 'عند التغيير'), B.date('2026-11-18')],
      [L('Manager & facility systems', 'أنظمة المدير والمرافق'), L('Leases, assets, work orders', 'العقود والأصول وأوامر العمل'), ui.prov('submitted'), L('Daily (simulated)', 'يومياً (محاكاة)'), B.date('2026-11-25')],
      [L('BENA field survey', 'مسح BENA الميداني'), L('Photos, floor count check', 'الصور والتحقق من عدد الطوابق'), ui.prov('pending'), L('Ad hoc', 'عند الحاجة'), B.date('2026-10-02')],
      [L('Prototype demonstration data', 'بيانات العرض في النموذج'), L('Figures, people and IDs on this page', 'الأرقام والأشخاص والمعرّفات في هذه الصفحة'), ui.prov('demo'), '—', '—'],
    ];
    return tbl([L('Source', 'المصدر'), L('Provides', 'يوفّر'), L('Provenance', 'المصدر'), L('Refresh', 'التحديث'), L('Last update', 'آخر تحديث')], rows.map((r) => [`<b>${r[0]}</b>`, `<span class="muted">${r[1]}</span>`, r[2], r[3], r[4]]));
  }

  function verification({ b }) {
    const ok = b.verification === 'verified';
    const items = isOfficial(b) ? [
      { title: L('Record imported from sample municipal layer', 'استيراد السجل من الطبقة البلدية النموذجية'), meta: B.date('2025-03-02') + ' · ' + L('System', 'النظام'), state: 'done', icon: 'database' },
      { title: L('Parcel & permit matched', 'مطابقة القطعة والرخصة'), meta: B.date('2025-03-02') + ' · ' + L('Automated check', 'فحص آلي'), state: 'done', icon: 'link' },
      { title: L('BENA Building ID issued', 'إصدار رقم المبنى في BENA'), meta: B.date('2025-03-02'), state: 'done', icon: 'fingerprint' },
      { title: L('Units mapped by the committee', 'إدخال الوحدات من قبل اللجنة'), meta: B.date('2025-05-19') + ' · ' + L('User-submitted', 'مُقدَّم من مستخدم'), state: 'done', icon: 'stack' },
      { title: ok ? L('Verified by municipal officer (sample)', 'تحقق موظف البلدية (نموذج)') : L('Awaiting municipal verification', 'بانتظار تحقق البلدية'), meta: ok ? B.date('2025-06-03') + ' · Eng. Maha Awad' : L('In queue', 'في قائمة الانتظار'), state: ok ? 'done' : 'current', icon: 'shieldCheck' },
      { title: L('Unit-count correction proposed', 'اقتراح تصحيح عدد الوحدات'), meta: B.date('2026-11-18') + ' · ' + L('Pending review', 'بانتظار المراجعة'), state: 'current', icon: 'edit' },
    ] : [
      { title: L('Submitted independently by an owner', 'قدّمه مالك بشكل مستقل'), meta: B.date('2026-10-28'), state: 'done', icon: 'userCheck' },
      { title: L('Documents uploaded', 'رفع المستندات'), meta: B.date('2026-10-28'), state: 'done', icon: 'doc' },
      { title: L('BENA Building ID issued (independent)', 'إصدار رقم BENA (مستقل)'), meta: B.date('2026-10-29'), state: 'done', icon: 'fingerprint' },
      { title: ok ? L('Verified with documents', 'تم التحقق بالمستندات') : L('Municipal verification pending', 'تحقق البلدية معلّق'), meta: ok ? B.date('2026-11-10') : L('In queue · SLA 10 working days', 'في الانتظار · المهلة 10 أيام عمل'), state: ok ? 'done' : 'current', icon: 'shieldCheck' },
    ];
    return `<div class="grid g-main">${ui.card({ title: L('Verification history', 'سجل التحقق'), headExtra: ui.status(b.verification), body: ui.timeline(items) })}${ui.card({ title: L('Verification rules (sample)', 'قواعد التحقق (نموذج)'), body: ui.list([ui.li({ icon: 'landmark', tone: 'navy', title: L('Municipal match', 'مطابقة بلدية'), sub: L('Footprint overlap ≥ 85% and parcel agreement', 'تداخل المسقط ≥ 85% وتطابق القطعة') }), ui.li({ icon: 'doc', tone: 'mint', title: L('Documentary evidence', 'أدلة مستندية'), sub: L('Permit or site plan for independent records', 'رخصة أو مخطط موقع للسجلات المستقلة') }), ui.li({ icon: 'users', tone: 'info', title: L('Two-person review', 'مراجعة من شخصين'), sub: L('Changes to identity fields need a second reviewer', 'تحتاج تغييرات حقول الهوية لمراجع ثانٍ') })]) })}</div>`;
  }

  function activity({ b, reqs }) {
    const ev = [
      ['2026-11-25', 'wrench', L('Maintenance request updated', 'تحديث طلب صيانة'), reqs[0] ? tx(reqs[0].title) : '', 'submitted'],
      ['2026-11-23', 'megaphone', L('Announcement published by the committee', 'نشر إعلان من اللجنة'), L('Water cut Thursday 09:00–13:00', 'انقطاع المياه الخميس 09:00–13:00'), 'submitted'],
      ['2026-11-20', 'key', L('Ownership relationship added', 'إضافة علاقة ملكية'), L('Unit 1102 · pending documents', 'الوحدة 1102 · بانتظار المستندات'), 'pending'],
      ['2026-11-18', 'edit', L('Correction proposed', 'اقتراح تصحيح'), L('Unit count 54 → 56', 'عدد الوحدات 54 ← 56'), 'pending'],
      ['2026-11-09', 'refresh', L('Municipal layer synchronised (simulated)', 'مزامنة الطبقة البلدية (محاكاة)'), L('No geometry changes', 'لا تغييرات في الهندسة'), 'official'],
      ['2026-10-30', 'contract', L('Lease registered', 'تسجيل عقد إيجار'), 'L-2026-0803', 'submitted'],
      ['2026-10-02', 'camera', L('Field survey photos added', 'إضافة صور المسح الميداني'), L('6 photos', '6 صور'), 'pending'],
    ];
    return ui.card({ body: `<div class="bw-feed">${ev.map(([d, ic, t, sub, p]) => `<div class="bw-ev"><span class="li-icon">${icon(ic)}</span><div class="grow"><b>${t}</b><div class="small muted">${sub}</div></div><div class="bw-ev-end">${ui.prov(p)}<span class="xs faint">${B.date(d)}</span></div></div>`).join('')}</div>` });
  }

  /* ---------------- actions ---------------- */
  B.act.bpShare = (id) => {
    const b = D().building(id);
    B.modal({ title: L('Share building identity', 'مشاركة هوية المبنى'), size: 'sm', body: `<div class="id-card" style="margin-bottom:14px"><div class="idc-top"><div><div class="eyebrow" style="color:var(--mint)">BENA</div><div class="idc-id">${b.id}</div><div class="small" style="margin-top:6px">${esc(tx(b.name))}</div></div><div class="qr">${B.art.qr(seedOf(b))}</div></div></div><div class="input-icon">${icon('link')}<input class="input" id="share-link" readonly value="bena.example/b/${b.id}"></div>`, foot: `<button class="btn btn-primary btn-block" data-act="copyShare">${icon('link')}${L('Copy link', 'نسخ الرابط')}</button>` });
  };
  B.act.copyShare = () => {
    const v = document.getElementById('share-link')?.value || '';
    const done = () => { B.closeModal(); B.toast(L('Link copied', 'تم نسخ الرابط')); };
    try { navigator.clipboard.writeText(v).then(done, () => { document.getElementById('share-link')?.select(); B.toast(L('Select and copy the link', 'حدّد الرابط وانسخه'), 'info'); }); } catch (e) { done(); }
  };
  B.act.bpReport = (id) => {
    B.modal({ title: L('Report an issue with this building', 'الإبلاغ عن مشكلة في هذا المبنى'), sub: esc(id), form: 'bpReport', body: `<div class="stack">${ui.field({ name: 'kind', type: 'radio', label: L('What is the issue?', 'ما هي المشكلة؟'), options: [{ v: 'info', l: L('Wrong information', 'معلومات خاطئة'), icon: 'edit' }, { v: 'dup', l: L('Duplicate record', 'سجل مكرر'), icon: 'layers' }, { v: 'maint', l: L('Maintenance problem', 'مشكلة صيانة'), icon: 'wrench' }] })}${ui.field({ name: 'details', type: 'textarea', label: L('Details', 'التفاصيل'), placeholder: L('Describe what needs attention', 'صف ما يحتاج إلى معالجة'), required: true })}</div>`, foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${L('Send report', 'إرسال البلاغ')}</button>` });
  };
  B.submit.bpReport = () => B.success({ title: L('Report sent', 'تم إرسال البلاغ'), text: L('The building\'s data steward will review it. You\'ll get a notification when it is resolved.', 'سيراجعه المسؤول عن بيانات المبنى. سيصلك إشعار عند حل المشكلة.'), ref: B.uid('RPT') });
  B.act.bpVerify = (id) => {
    const b = D().building(id);
    B.modal({ title: L('Review building record', 'مراجعة سجل المبنى'), sub: `${esc(tx(b.name))} · ${b.id}`, form: 'bpVerify', body: `<div class="stack">${ui.kv([[L('Source', 'المصدر'), ui.sourceBadge(b.source)], [L('Current status', 'الحالة الحالية'), ui.status(b.verification)], [L('Parcel', 'القطعة'), L(`Basin ${b.parcel.basin} · Parcel ${b.parcel.parcel}`, `حوض ${b.parcel.basin} · قطعة ${b.parcel.parcel}`)]])}${ui.field({ name: 'decision', type: 'radio', label: L('Decision', 'القرار'), options: [{ v: 'verify', l: L('Mark verified', 'تأكيد التحقق'), icon: 'shieldCheck' }, { v: 'info', l: L('Request information', 'طلب معلومات'), icon: 'alertCircle' }] })}${ui.field({ name: 'note', type: 'textarea', label: L('Note to record', 'ملاحظة على السجل'), placeholder: L('Optional', 'اختياري') })}</div>`, foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${L('Save decision', 'حفظ القرار')}</button>` });
    B._verifyId = id;
  };
  B.submit.bpVerify = (d) => {
    const b = D().building(B._verifyId);
    if (b && d.decision === 'verify') { b.verification = 'verified'; b.updated = '2026-11-25'; }
    B.success({ title: d.decision === 'verify' ? L('Record verified', 'تم التحقق من السجل') : L('Information requested', 'تم طلب المعلومات'), text: L('The record history has been updated (demo).', 'تم تحديث سجل التغييرات (تجريبي).') });
    setTimeout(() => B.refresh(), 0);
  };
  B.act.bpUnit = (uid) => {
    const data = D();
    const u = data.unit(uid);
    const role = B.route.role;
    const priv = role === 'resident' || role === 'provider';
    const lease = data.leaseOfUnit(uid);
    B.modal({ title: data.unitLabel(u), sub: `${L('Floor', 'الطابق')} ${u.floor === 0 ? L('Ground', 'الأرضي') : u.floor} · ${u.area} m²`, body: `<div class="stack">${ui.kv([
      [L('Status', 'الحالة'), ui.status(u.status)],
      [L('Type', 'النوع'), tx(data.unitKinds[u.kind])],
      u.beds ? [L('Bedrooms', 'غرف النوم'), u.beds] : null,
      [L('Monthly service charge', 'رسوم الخدمات الشهرية'), B.money(u.charge)],
      [L('Owner', 'المالك'), priv ? `<span class="faint">${icon('lock', '').replace('<svg', '<svg style="width:14px;height:14px;display:inline;vertical-align:-2px"')} ${L('Private', 'خاص')}</span>` : esc(data.pname(u.owner))],
      u.status === 'rented' ? [L('Tenant', 'المستأجر'), priv ? `<span class="faint">${L('Private', 'خاص')}</span>` : esc(data.pname(u.tenant))] : null,
      lease && !priv ? [L('Lease', 'عقد الإيجار'), `<span class="id-mono">${lease.id}</span> · ${L('ends', 'ينتهي')} ${B.date(lease.end)}`] : null,
    ])}</div>`, foot: role === 'manager' ? ui.btn(L('Open unit', 'فتح الوحدة'), { kind: 'primary', go: `manager-unit-${uid}` }) : role === 'owner' && u.owner === data.me.owner ? ui.btn(L('Open my property', 'فتح عقاري'), { kind: 'primary', go: `owner-property-${uid}` }) : '' });
  };
  B.act.bpRequest = (qid) => {
    const data = D();
    const q = data.request(qid);
    const role = B.route.role;
    if (role === 'resident' && q.by === data.me.resident) return B.go(`resident-request-${qid}`);
    const prov = q.provider ? data.provider(q.provider) : null;
    B.modal({ title: tx(q.title), sub: `<span class="id-mono">${q.id}</span>`, body: `${q.desc ? `<p class="muted" style="margin-bottom:14px">${tx(q.desc)}</p>` : ''}${ui.kv([[L('Status', 'الحالة'), ui.status(q.status)], [L('Priority', 'الأولوية'), ui.status(q.priority)], [L('Category', 'الفئة'), tx(data.cat(q.cat).name)], [L('Reported', 'تاريخ البلاغ'), B.date(q.created)], [L('Provider', 'المزود'), prov ? tx(prov.name) : L('Not assigned', 'غير مُسند')], q.visit ? [L('Visit', 'الزيارة'), B.date(q.visit)] : null])}` });
  };
  B.act.joinBuilding = (id) => {
    const b = D().building(id);
    B.modal({ title: L('Request to join this building', 'طلب الانضمام لهذا المبنى'), sub: `${esc(tx(b.name))} · <span class="id-mono">${b.id}</span>`, form: 'joinBuilding', body: `<div class="stack">
      ${b.source === 'gis' ? ui.callout(L('<b>Verified municipal record.</b> Your request goes to the building\'s committee or manager for approval.', '<b>سجل بلدي موثّق.</b> يُرسل طلبك إلى لجنة المبنى أو مديره للموافقة.'), 'mint', 'shieldCheck') : ui.callout(L('<b>Independently submitted record.</b> It is pending municipal verification; your link will be confirmed by the submitter or committee.', '<b>سجل مُسجّل بشكل مستقل.</b> بانتظار تحقق البلدية؛ سيؤكد صاحب التسجيل أو اللجنة ارتباطك.'), 'warn', 'userCheck')}
      ${ui.field({ name: 'rel', type: 'radio', label: L('Your relationship to the unit', 'علاقتك بالوحدة'), options: [{ v: 'tenant', l: L('Tenant', 'مستأجر'), icon: 'key' }, { v: 'owner', l: L('Owner', 'مالك'), icon: 'home' }, { v: 'family', l: L('Household member', 'فرد من الأسرة'), icon: 'users' }] })}
      <div class="form-grid">${ui.field({ name: 'unit', label: L('Unit number', 'رقم الوحدة'), placeholder: '803', required: true })}${ui.field({ name: 'since', type: 'date', label: L('Living here since', 'أسكن هنا منذ') })}</div>
      ${ui.field({ name: 'proof', type: 'file', label: L('Proof of relationship', 'إثبات العلاقة'), placeholder: L('Lease, title deed or utility bill (demo)', 'عقد إيجار أو سند ملكية أو فاتورة (تجريبي)') })}</div>`, foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${L('Send request', 'إرسال الطلب')}</button>` });
  };
  B.submit.joinBuilding = () => B.success({ title: L('Request sent', 'تم إرسال الطلب'), text: L('The committee usually responds within 2 working days. You\'ll be notified in BENA.', 'تستجيب اللجنة عادة خلال يومي عمل. سيصلك إشعار في بينا.'), ref: B.uid('JN') });
})();
