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

    const tabs = [
      { id: 'overview', label: L('Overview', 'نظرة عامة'), icon: 'grid' },
      { id: 'identity', label: L('Identity & location', 'الهوية والموقع'), icon: 'fingerprint' },
      { id: 'units', label: L('Floors & units', 'الطوابق والوحدات'), icon: 'stack', count: b.units },
      { id: 'people', label: L('Ownership & governance', 'الملكية والإدارة'), icon: 'users' },
      { id: 'services', label: L('Utilities & assets', 'الخدمات والأصول'), icon: 'zap' },
      { id: 'maintenance', label: L('Maintenance', 'الصيانة'), icon: 'wrench', count: openReqs.length || null },
      { id: 'finance', label: L('Finance', 'المالية'), icon: 'wallet' },
      { id: 'related', label: L('Related services', 'خدمات ذات صلة'), icon: 'sparkles' },
    ];
    const body = { overview, identity, units, people, services, maintenance, finance, related }[tab] || overview;
    return `${hero}<div style="height:20px"></div>${ui.tabs('bp:tab', tabs, tab)}${body({ b, o, com, mgr, fac, reqs, openReqs, assets, role })}`;
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
