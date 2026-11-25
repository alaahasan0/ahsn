/*
 * BENA — Resident / Tenant mobile experience.
 * Persona: Lina Haddad, tenant of unit 803, Al-Masyoun Residence Tower.
 */
(function () {
  const B = (window.B = window.B || {});
  const { tx, L, icon, esc, ui } = B;
  const D = () => B.data;
  const BID = 'BN-RAM-00142';
  const UID = 'BN-RAM-00142-803';
  const me = () => D().me.resident;

  B.css(`
    .rs-hello { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 4px 0 18px; }
    .rs-hello h1 { font-size: 26px; }
    .rs-hello p { color: var(--text-2); font-size: 14px; margin-top: 2px; }
    .rs-home { position: relative; border-radius: 22px; overflow: hidden; background: var(--navy); color: #fff; display: grid; grid-template-columns: minmax(0, 1fr) 42%; min-height: 188px; }
    .rs-home .rh-body { padding: 20px; display: flex; flex-direction: column; gap: 10px; position: relative; z-index: 1; }
    .rs-home .rh-art { position: relative; }
    .rs-home .rh-art svg { position: absolute; inset: 0; width: 100%; height: 100%; }
    .rs-home h2 { color: #fff; font-size: 19px; line-height: 1.25; }
    .rs-home .rh-meta { display: flex; gap: 8px; flex-wrap: wrap; }
    .rs-home .rh-meta span { font-size: 12px; background: rgba(255,255,255,.1); color: #fff; border-radius: 99px; padding: 4px 10px; display: inline-flex; gap: 5px; align-items: center; }
    .rs-home .rh-meta svg { width: 13px; height: 13px; color: var(--mint); }
    .rs-home .rh-id { font-size: 12px; color: var(--navy-ink); margin-top: auto; display: flex; align-items: center; gap: 6px; }
    .rs-home .rh-id svg { width: 14px; height: 14px; color: var(--mint); }
    .rs-dues { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .rs-due { border-radius: 18px; padding: 16px; background: #fff; border: 1px solid var(--line); display: flex; flex-direction: column; gap: 6px; text-align: start; }
    .rs-due .dl { font-size: 12.5px; color: var(--text-2); display: flex; align-items: center; gap: 6px; }
    .rs-due .dl svg { width: 15px; height: 15px; }
    .rs-due .dv { font-family: var(--font-display); font-size: 24px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.1; }
    .rs-due .dd { font-size: 12px; color: var(--text-3); }
    .rs-due.alert { border-color: #F4D9A8; background: #FFFBF3; }
    .rs-due.alert .dl { color: var(--warn); }
    .rs-req { display: flex; flex-direction: column; gap: 10px; padding: 14px 0; border-bottom: 1px solid var(--line-2); text-align: start; width: 100%; }
    .rs-req:last-child { border-bottom: 0; padding-bottom: 0; }
    .rs-req:first-child { padding-top: 0; }
    .rs-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
    .rs-steps i { height: 4px; border-radius: 99px; background: var(--line); }
    .rs-steps i.on { background: var(--mint); }
    .rs-ann { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--line-2); text-align: start; width: 100%; }
    .rs-ann:last-child { border-bottom: 0; padding-bottom: 0; }
    .rs-ann:first-child { padding-top: 0; }
    .rs-ann .ad { width: 46px; flex: none; text-align: center; border-radius: 12px; background: var(--surface-2); padding: 6px 0; }
    .rs-ann .ad b { display: block; font-family: var(--font-display); font-size: 18px; line-height: 1; }
    .rs-ann .ad span { font-size: 11px; color: var(--text-3); }
    .rs-ann .at { font-weight: 600; font-size: 14px; }
    .rs-ann .ab { font-size: 13px; color: var(--text-2); margin-top: 3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .rs-facility { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 14px; border-radius: 16px; background: var(--surface-2); border: 1px solid var(--line-2); }
    .rs-facility svg { width: 22px; height: 22px; color: var(--mint-ink); }
    .rs-facility b { font-size: 13.5px; }
    .rs-facility span { font-size: 12px; color: var(--text-2); }
    .rs-chat { display: flex; flex-direction: column; gap: 10px; }
    .rs-msg { max-width: 82%; padding: 10px 14px; border-radius: 16px; font-size: 13.5px; background: var(--surface-2); border: 1px solid var(--line-2); }
    .rs-msg small { display: block; font-size: 11px; color: var(--text-3); margin-top: 4px; }
    .rs-msg.mine { align-self: flex-end; background: var(--mint-50); border-color: var(--mint-100); }
    .rs-find-result { display: flex; gap: 12px; align-items: center; padding: 12px; border-radius: 14px; border: 1px solid var(--line); background: #fff; text-align: start; width: 100%; transition: border-color .2s; }
    .rs-find-result:hover, .rs-find-result.on { border-color: var(--mint); }
    .rs-find-result.on { background: var(--mint-50); }
    .rs-sel { position: sticky; bottom: calc(var(--tabbar-h) + 12px + env(safe-area-inset-bottom, 0px)); z-index: 20; box-shadow: var(--shadow-2); }
    @media (min-width: 768px) { .rs-sel { position: static; box-shadow: none; } }
    @media (max-width: 420px) { .rs-home { grid-template-columns: 1fr; } .rs-home .rh-art { height: 120px; order: -1; } .rs-dues { gap: 10px; } .rs-due { padding: 14px; } .rs-due .dv { font-size: 21px; } }
  `);

  /* ---------------- helpers ---------------- */
  const building = () => D().building(BID);
  const unit = () => D().unit(UID);
  const lease = () => D().leaseOfUnit(UID);
  const myReqs = () => D().requests.filter((q) => q.by === me() || (q.building === BID && q.scope === 'common'));
  const due = () => D().residentPayments.filter((p) => p.status === 'due');
  const stepOf = (s) => ({ open: 1, new: 1, quoted: 1, assigned: 2, scheduled: 2, inProgress: 3, completed: 4, resolved: 4 }[s] || 1);
  const greet = () => { const h = new Date().getHours(); return h < 12 ? L('Good morning', 'صباح الخير') : h < 18 ? L('Good afternoon', 'مساء الخير') : L('Good evening', 'مساء الخير'); };
  const tagMeta = { notice: ['alert', 'warn', L('Notice', 'تنبيه')], meeting: ['calendar', 'info', L('Meeting', 'اجتماع')], maintenance: ['wrench', 'mint', L('Maintenance', 'صيانة')], community: ['users', 'violet', L('Community', 'مجتمع')] };

  const reqRow = (q) => {
    const s = stepOf(q.status);
    return `<button class="rs-req" data-go="resident-request-${q.id}">
      <div class="row between" style="align-items:flex-start"><div class="row" style="align-items:flex-start"><span class="li-icon ${q.status === 'completed' ? '' : 'mint'}">${icon(D().cat(q.cat).icon)}</span><div class="grow"><div class="li-title">${esc(tx(q.title))}</div><div class="li-sub"><span class="id-mono">${q.id}</span> · ${q.scope === 'common' ? L('Common area', 'منطقة مشتركة') : L('My unit', 'وحدتي')}</div></div></div>${ui.status(q.status)}</div>
      <div class="rs-steps">${[1, 2, 3, 4].map((i) => `<i class="${i <= s ? 'on' : ''}"></i>`).join('')}</div>
      <div class="xs faint">${q.visit && q.status !== 'completed' ? L(`Technician visit ${B.date(q.visit)}`, `زيارة الفني ${B.date(q.visit)}`) : q.status === 'completed' ? L(`Completed ${B.date(q.closed)}`, `اكتمل ${B.date(q.closed)}`) : L(`Reported ${B.ago(q.created)}`, `أُبلغ ${B.ago(q.created)}`)}</div>
    </button>`;
  };
  const annRow = (a) => {
    const d = new Date(a.date + 'T12:00:00');
    const m = tagMeta[a.tag] || tagMeta.notice;
    return `<button class="rs-ann" data-act="rsAnn" data-arg="${a.id}"><div class="ad"><b>${d.getDate()}</b><span>${B.mon(d.getMonth())}</span></div><div class="grow"><div class="row-sm wrap" style="margin-bottom:4px">${ui.badge(m[2], m[1], m[0])}${a.pinned ? ui.badge(L('Pinned', 'مثبّت'), 'navy', 'flag') : ''}</div><div class="at">${esc(tx(a.title))}</div><div class="ab">${esc(tx(a.body))}</div></div></button>`;
  };

  /* ---------------- pages ---------------- */
  const home = () => {
    const b = building(), u = unit(), l = lease();
    const reqs = myReqs().filter((q) => q.status !== 'completed').slice(0, 2);
    const charges = due();
    const outstanding = B.sum(charges, (p) => p.amount);
    const nextRent = '2026-12-01';
    const anns = D().announcementsOf(BID).slice(0, 2);
    const leaseDays = B.daysFromToday(l.end);
    return `<div class="phone-col stack-lg">
      <div class="rs-hello"><div><h1>${greet()}, ${esc(tx(D().person(me()).name).split(' ')[0])}</h1><p>${B.date(B.today)} · ${L('Ramallah', 'رام الله')} 14°</p></div>${ui.avatar(D().person(me()).name, 'lg')}</div>
      <button class="rs-home" data-go="resident-mybuilding" style="text-align:start">
        <div class="rh-body">
          <span class="eyebrow" style="color:var(--mint)">${L('My home', 'منزلي')}</span>
          <h2>${esc(tx(b.name))}</h2>
          <div class="rh-meta"><span>${icon('door')}${L('Unit', 'وحدة')} ${u.number}</span><span>${icon('key')}${L('Tenant', 'مستأجرة')}</span><span>${icon('checkCircle')}${L('Occupied', 'مشغولة')}</span></div>
          <div class="rh-id">${icon('shieldCheck')}<span>${L('Verified building', 'مبنى موثّق')}</span><span class="id-mono" style="color:#fff">${b.id}</span></div>
        </div>
        <div class="rh-art">${B.art.facade(142, { type: 'residential', floors: 14, sky: 'navy' })}</div>
      </button>
      <div class="rs-dues">
        <button class="rs-due ${outstanding ? 'alert' : ''}" data-go="resident-payments"><span class="dl">${icon(outstanding ? 'alertCircle' : 'checkCircle')}${L('Building charges', 'رسوم المبنى')}</span><span class="dv">${B.money(outstanding)}</span><span class="dd">${outstanding ? L('Outstanding · November', 'مستحقة · تشرين الثاني') : L('All paid', 'كلها مدفوعة')}</span></button>
        <button class="rs-due" data-go="resident-payments"><span class="dl">${icon('calendar')}${L('Next rent', 'الإيجار القادم')}</span><span class="dv">${B.money(l.rent)}</span><span class="dd">${L('Due', 'يستحق')} ${B.dateShort(nextRent)} · ${B.inDays(nextRent)}</span></button>
      </div>
      ${outstanding ? `<button class="btn btn-primary btn-lg btn-block" data-act="rsPay" data-arg="SC-26-1101">${icon('card')}${L(`Pay ${B.money(outstanding)} now`, `ادفع ${B.money(outstanding)} الآن`)}</button>` : ''}
      <div class="quick">
        <button class="qa" data-act="newRequest"><span class="qi mint">${icon('wrench')}</span>${L('Report issue', 'إبلاغ عن عطل')}</button>
        <button class="qa" data-go="resident-payments"><span class="qi">${icon('wallet')}</span>${L('Payments', 'المدفوعات')}</button>
        <button class="qa" data-go="resident-services"><span class="qi">${icon('sparkles')}</span>${L('Book service', 'حجز خدمة')}</button>
        <button class="qa" data-go="resident-documents"><span class="qi">${icon('folder')}</span>${L('Documents', 'المستندات')}</button>
      </div>
      ${leaseDays < 90 ? ui.callout(L(`<b>Your lease ends ${B.date(l.end)}</b> (${leaseDays} days). Your landlord can send a renewal offer through BENA.`, `<b>ينتهي عقد إيجارك في ${B.date(l.end)}</b> (${leaseDays} يوماً). يمكن للمالك إرسال عرض تجديد عبر بينا.`), 'mint', 'contract') : ''}
      ${ui.card({ title: L('Maintenance requests', 'طلبات الصيانة'), link: { label: L('All', 'الكل'), go: 'resident-requests' }, body: reqs.length ? reqs.map(reqRow).join('') : ui.empty({ icon: 'wrench', title: L('No open requests', 'لا توجد طلبات مفتوحة') }) })}
      ${ui.card({ title: L('Announcements', 'الإعلانات'), sub: L('From your building committee', 'من لجنة المبنى'), link: { label: L('All', 'الكل'), go: 'resident-announcements' }, body: anns.map(annRow).join('') })}
    </div>`;
  };

  const mybuilding = () => {
    const b = building(), data = D();
    const com = data.committeeOf(BID), mgr = data.org(b.manager);
    const chair = com.members[0];
    const facilities = [
      ['car', L('Parking', 'موقف سيارات'), L('Level −1 · 60 spaces', 'الطابق −1 · 60 موقفاً')], ['generator', L('Backup generator', 'مولد احتياطي'), L('250 kVA · auto start', '250 ك.ف.أ · تشغيل تلقائي')],
      ['elevator', L('2 elevators', 'مصعدان'), L('Elevator B under repair', 'المصعد ب قيد الإصلاح')], ['tree', L('Roof garden', 'حديقة السطح'), L('Open 07:00–22:00', 'مفتوحة 07:00–22:00')],
      ['package', L('Storage rooms', 'غرف تخزين'), L('Ask the committee', 'اسأل اللجنة')], ['users', L('Meeting room', 'قاعة اجتماعات'), L('Book in advance', 'احجز مسبقاً')],
    ];
    return `<div class="phone-col stack-lg">
      <section class="b-hero" style="grid-template-columns:1fr">
        <div class="bh-art" style="height:170px;order:-1">${B.art.facade(142, { type: 'residential', floors: 14, sky: 'navy' })}</div>
        <div class="bh-body"><div class="row-sm wrap"><span class="badge mint">${icon('shieldCheck')}${L('Verified municipal record', 'سجل بلدي موثّق')}</span></div>
          <h1 style="font-size:24px">${esc(tx(b.name))}</h1><div class="bh-addr">${icon('pin')}${esc(tx(b.address))}</div>
          <div class="bh-stats"><div><b>${b.floors}</b><span>${L('Floors', 'طوابق')}</span></div><div><b>${b.units}</b><span>${L('Units', 'وحدات')}</span></div><div><b>${b.year}</b><span>${L('Built', 'البناء')}</span></div></div>
          <div class="bp-actions"><button class="btn btn-primary btn-sm" data-go="resident-building-${BID}">${icon('fingerprint')}${L('Full building profile', 'ملف المبنى الكامل')}</button></div>
        </div>
      </section>
      ${ui.card({ title: L('Building identity', 'هوية المبنى'), body: ui.kv([[L('BENA Building ID', 'رقم المبنى في بينا'), ui.idMono(b.id)], [L('Municipal GIS ID', 'رقم نظم البلدية'), ui.idMono(b.gis)], [L('Land parcel', 'قطعة الأرض'), L(`Basin ${b.parcel.basin} · Parcel ${b.parcel.parcel}`, `حوض ${b.parcel.basin} · قطعة ${b.parcel.parcel}`)], [L('Building type', 'نوع المبنى'), data.typeLabel(b.type)]]) })}
      ${ui.card({ title: L('Location', 'الموقع'), body: B.map.render({ id: 'rs-loc', static: true, focus: BID, focusW: 240, selected: BID, legend: false, badge: false, height: '190px' }) + `<div class="row between" style="margin-top:12px"><span class="small muted">${esc(tx(b.address))}</span>${ui.btn(L('Directions', 'الاتجاهات'), { size: 'sm', icon: 'route', act: 'soon', arg: L('Directions', 'الاتجاهات') })}</div>` })}
      ${ui.card({ title: L('Shared facilities', 'المرافق المشتركة'), body: `<div class="grid g3" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr))">${facilities.map(([i, t, s]) => `<div class="rs-facility">${icon(i)}<b>${t}</b><span>${s}</span></div>`).join('')}</div>` })}
      ${ui.card({ title: L('Committee & management', 'اللجنة والإدارة'), body: `<div class="stack">
        <div class="row"><span class="li-icon navy">${icon('gavel')}</span><div class="grow"><b>${tx(com.name)}</b><div class="small muted">${tx(com.basis)}</div></div></div>${ui.status('legal')}
        <div class="divider"></div>
        ${ui.list([ui.li({ avatar: data.person(chair.p).name, title: data.pname(chair.p), sub: tx(chair.role), end: ui.btn('', { icon: 'chat', size: 'sm', title: L('Message', 'رسالة'), act: 'rsMessage', arg: chair.p }) }), ui.li({ icon: 'briefcase', tone: 'mint', title: tx(mgr.name), sub: L('Property management office', 'مكتب إدارة العقار'), end: ui.btn('', { icon: 'phone', size: 'sm', title: L('Call', 'اتصال'), act: 'rsCall', arg: mgr.phone }) })])}</div>` })}
      ${ui.card({ title: L('Announcements', 'الإعلانات'), link: { label: L('All', 'الكل'), go: 'resident-announcements' }, body: D().announcementsOf(BID).slice(0, 3).map(annRow).join('') })}
      ${ui.card({ title: L('Building documents', 'مستندات المبنى'), body: ui.list([
        ui.doc({ name: L('Building rules & bylaws 2025', 'نظام المبنى والقواعد 2025'), date: '2025-02-01', size: '640 KB' }),
        ui.doc({ name: L('Fire safety certificate', 'شهادة السلامة من الحريق'), date: '2026-07-20', size: '310 KB', icon: 'shieldCheck', tone: 'mint' }),
        ui.doc({ name: L('Elevator inspection report — Sep 2026', 'تقرير فحص المصاعد — أيلول 2026'), date: '2026-09-14', size: '1.1 MB' }),
      ]) })}
      ${ui.card({ title: L('Contacts', 'جهات الاتصال'), body: ui.list([
        ui.li({ icon: 'alert', tone: 'bad', title: L('Building emergency line', 'خط طوارئ المبنى'), sub: '<span class="ltr">+970 59 900 0142</span>', act: 'rsCall', arg: '+970 59 900 0142' }),
        ui.li({ icon: 'briefcase', title: L('Management office', 'مكتب الإدارة'), sub: `<span class="ltr">${mgr.phone}</span> · ${L('Sun–Thu 08:30–16:30', 'الأحد–الخميس 08:30–16:30')}`, act: 'rsCall', arg: mgr.phone }),
        ui.li({ icon: 'shield', title: L('Lobby security', 'أمن الردهة'), sub: L('24/7 · intercom 0', 'على مدار الساعة · الاتصال الداخلي 0'), act: 'soon', arg: L('Intercom', 'الاتصال الداخلي') }),
      ]) })}
    </div>`;
  };

  const myunit = () => {
    const u = unit(), l = lease(), data = D();
    const days = B.daysFromToday(l.end);
    const elapsed = Math.round(((B.daysBetween(l.start, B.today)) / B.daysBetween(l.start, l.end)) * 100);
    return `<div class="phone-col stack-lg">
      ${ui.pageHead({ title: L(`Unit ${u.number}`, `الوحدة ${u.number}`), sub: L(`Floor ${u.floor} · Al-Masyoun Residence Tower`, `الطابق ${u.floor} · برج الماصيون السكني`) })}
      <div class="media" style="aspect-ratio:16/9">${B.art.floorplan(803)}<span class="m-tag">${ui.badge(L('Floor plan · sample', 'المخطط · نموذج'), 'navy')}</span></div>
      <div class="grid g4">
        ${ui.kpi({ label: L('Area', 'المساحة'), value: u.area, unit: 'm²', icon: 'ruler' })}
        ${ui.kpi({ label: L('Bedrooms', 'غرف النوم'), value: u.beds, icon: 'bed' })}
        ${ui.kpi({ label: L('Bathrooms', 'الحمامات'), value: 2, icon: 'bath' })}
        ${ui.kpi({ label: L('Parking', 'الموقف'), value: 'P-34', icon: 'car' })}
      </div>
      ${ui.card({ title: L('My relationship to this unit', 'علاقتي بهذه الوحدة'), body: `<div class="row" style="margin-bottom:14px"><span class="li-icon mint">${icon('key')}</span><div class="grow"><b>${L('Tenant', 'مستأجرة')}</b><div class="small muted">${L(`Since ${B.date(l.start)} · verified by lease`, `منذ ${B.date(l.start)} · موثّق بعقد إيجار`)}</div></div>${ui.status('occupied')}</div>` + ui.kv([[L('Occupancy status', 'حالة الإشغال'), ui.status('rented')], [L('Household', 'الأسرة'), L('2 adults, 1 child', 'شخصان بالغان وطفل')], [L('Landlord', 'المالك'), `${esc(data.pname(u.owner))} <span class="faint xs">· ${L('via BENA', 'عبر بينا')}</span>`]]) })}
      ${ui.card({ title: L('Lease', 'عقد الإيجار'), sub: ui.idMono(l.id), headExtra: ui.status(l.status), body: `<div class="stack">${ui.kvGrid([[L('Start', 'البداية'), B.date(l.start)], [L('End', 'النهاية'), B.date(l.end)], [L('Monthly rent', 'الإيجار الشهري'), B.money(l.rent)], [L('Deposit held', 'التأمين'), B.money(l.deposit)], [L('Payment day', 'يوم الدفع'), L('1st of month', 'الأول من كل شهر')], [L('Amendments', 'التعديلات'), l.amendments || 0]])}
        ${ui.meter(L('Lease term elapsed', 'المدة المنقضية من العقد'), L(`${days} days left`, `متبقي ${days} يوماً`), elapsed, days < 75 ? 'warn' : '')}</div>`, foot: `${ui.btn(L('View contract', 'عرض العقد'), { icon: 'doc', size: 'sm', act: 'previewDoc', arg: L('Lease contract L-2026-0803', 'عقد الإيجار L-2026-0803') })}${ui.btn(L('Ask about renewal', 'الاستفسار عن التجديد'), { icon: 'chat', size: 'sm', kind: 'soft', act: 'rsMessage', arg: u.owner })}` })}
      ${ui.card({ title: L('Service accounts', 'حسابات الخدمات'), body: ui.list([
        ui.li({ icon: 'zap', tone: 'mint', title: L('Electricity — prepaid meter', 'الكهرباء — عداد مسبق الدفع'), sub: `<span class="id-mono">EM-803-55190</span> · ${L('balance ₪84', 'الرصيد 84 ₪')}`, end: ui.btn(L('Top up', 'شحن'), { size: 'sm', act: 'soon', arg: L('Top-up', 'الشحن') }) }),
        ui.li({ icon: 'droplet', tone: 'info', title: L('Water sub-meter', 'عداد المياه الفرعي'), sub: `<span class="id-mono">WS-142-803</span> · ${L('billed with service charge', 'يُحتسب مع رسوم الخدمات')}` }),
        ui.li({ icon: 'wifi', tone: 'violet', title: L('Fibre internet', 'إنترنت الألياف'), sub: L('Building backbone · 100 Mbps plan', 'شبكة المبنى · باقة 100 ميغابت') }),
      ]) })}
      ${ui.card({ title: L('Unit documents', 'مستندات الوحدة'), link: { label: L('All', 'الكل'), go: 'resident-documents' }, body: ui.list([ui.doc({ name: L('Lease contract L-2026-0803', 'عقد الإيجار L-2026-0803'), date: '2026-01-24', size: '2.4 MB', icon: 'contract' }), ui.doc({ name: L('Move-in inspection report', 'تقرير الفحص عند الاستلام'), date: '2026-02-01', size: '3.8 MB', icon: 'clipboard' })]) })}
    </div>`;
  };

  const requests = () => {
    const tab = B.get('rs:reqTab', 'active');
    const all = myReqs();
    const list = all.filter((q) => (tab === 'active' ? !['completed', 'cancelled'].includes(q.status) : q.status === 'completed'));
    return `<div class="phone-col">
      ${ui.pageHead({ title: L('Maintenance', 'الصيانة'), sub: L('Your unit and the building\'s common areas', 'وحدتك والمناطق المشتركة في المبنى'), actions: ui.btn(L('New request', 'طلب جديد'), { kind: 'primary', icon: 'plus', act: 'newRequest' }) })}
      ${ui.seg('rs:reqTab', [{ id: 'active', label: L(`Active (${all.filter((q) => q.status !== 'completed').length})`, `نشطة (${all.filter((q) => q.status !== 'completed').length})`) }, { id: 'done', label: L('Completed', 'مكتملة') }], tab)}
      <div class="card" style="margin-top:16px">${list.length ? list.map(reqRow).join('') : ui.empty({ icon: 'checkCircle', title: L('Nothing here', 'لا يوجد شيء هنا'), text: L('Completed requests will be listed here.', 'ستظهر الطلبات المكتملة هنا.') })}</div>
    </div>`;
  };

  const request = (id) => {
    const data = D();
    const q = data.request(id);
    if (!q) return ui.empty({ title: L('Request not found', 'الطلب غير موجود') });
    B.title(q.id); B.navActive('requests');
    const prov = q.provider ? data.provider(q.provider) : null;
    const s = stepOf(q.status);
    const tl = [
      { title: L('Request submitted', 'تم تقديم الطلب'), meta: B.date(q.created), state: 'done' },
      { title: L('Reviewed by building management', 'تمت المراجعة من إدارة المبنى'), meta: s >= 2 ? B.date(q.created) : '', state: s >= 2 ? 'done' : s === 1 ? 'current' : '' },
      { title: prov ? L(`Assigned to ${tx(prov.name)}`, `أُسند إلى ${tx(prov.name)}`) : L('Assign a provider', 'إسناد لمزود'), meta: q.visit ? L(`Visit ${B.date(q.visit)}, 10:00–12:00`, `الزيارة ${B.date(q.visit)}، 10:00–12:00`) : '', state: s >= 3 ? 'done' : s === 2 ? 'current' : '' },
      { title: L('Work in progress', 'العمل جارٍ'), state: s >= 4 ? 'done' : s === 3 ? 'current' : '' },
      { title: L('Completed', 'مكتمل'), meta: q.closed ? B.date(q.closed) : '', state: s >= 4 ? 'done' : '' },
    ];
    return `<div class="phone-col stack-lg">
      <button class="bp-back" data-go="resident-requests">${icon('arrowLeft', 'flip')}${L('Maintenance', 'الصيانة')}</button>
      <div><div class="row-sm wrap" style="margin-bottom:8px">${ui.status(q.status)}${ui.status(q.priority)}${ui.badge(tx(data.cat(q.cat).name), 'neutral', data.cat(q.cat).icon)}</div><h1 style="font-size:24px">${esc(tx(q.title))}</h1><p class="muted small" style="margin-top:6px"><span class="id-mono">${q.id}</span> · ${q.scope === 'common' ? L('Common area', 'منطقة مشتركة') : L('Unit 803', 'الوحدة 803')}</p></div>
      ${q.desc ? ui.card({ title: L('Description', 'الوصف'), body: `<p class="muted">${esc(tx(q.desc))}</p><div class="grid g3" style="margin-top:14px;grid-template-columns:repeat(3,minmax(0,1fr))">${[1, 2].map((i) => `<div class="media" style="aspect-ratio:1">${B.art.interior(i + 3)}</div>`).join('')}</div>` }) : ''}
      ${ui.card({ title: L('Progress', 'التقدم'), body: ui.timeline(tl) })}
      ${prov ? ui.card({ title: L('Service provider', 'مزود الخدمة'), body: ui.li({ avatar: prov.name, avatarCls: 'lg', title: tx(prov.name), sub: `${q.tech ? tx(q.tech) + ' · ' : ''}${prov.rating} ★ · ${tx(prov.response)}`, go: `resident-provider-${prov.id}` }) }) : ''}
      ${ui.card({ title: L('Updates', 'التحديثات'), body: `<div class="rs-chat">
        <div class="rs-msg mine">${L('Water keeps collecting in the cabinet, I put a bucket under it.', 'المياه تتجمع في الخزانة، وضعت دلواً تحتها.')}<small>${L('You', 'أنت')} · ${B.dateShort(q.created)}</small></div>
        ${s >= 2 ? `<div class="rs-msg">${L('Thanks Lina — we\'ve assigned a plumber. Please keep the cabinet clear for the visit.', 'شكراً لينا — تم إسناد الطلب لسبّاك. يرجى إفراغ الخزانة قبل الزيارة.')}<small>${L('Arkan Property Management', 'أركان لإدارة العقارات')}</small></div>` : ''}
        ${s >= 3 ? `<div class="rs-msg">${L('I\'ll come Thursday between 10 and 12 with a replacement trap.', 'سآتي يوم الخميس بين 10 و12 مع قطعة بديلة.')}<small>${q.tech ? tx(q.tech) : tx(prov?.name || '')}</small></div>` : ''}
      </div><form data-submit="rsMsg" class="row" style="margin-top:14px"><input class="input" name="m" id="rs-msg-in" placeholder="${esc(L('Write a message…', 'اكتب رسالة…'))}" required><button class="btn btn-primary btn-icon" type="submit" aria-label="send">${icon('send', 'flip')}</button></form>` })}
      ${q.status === 'completed' ? ui.btn(L('Rate this service', 'قيّم هذه الخدمة'), { kind: 'primary', block: true, icon: 'starO', act: 'rsRate', arg: q.id }) : ui.btn(L('Cancel request', 'إلغاء الطلب'), { kind: 'ghost', block: true, act: 'rsCancel', arg: q.id })}
    </div>`;
  };

  const payments = () => {
    const pays = D().residentPayments;
    const dueList = pays.filter((p) => p.status === 'due');
    const outstanding = B.sum(dueList, (p) => p.amount);
    const filter = B.get('rs:payF', 'all');
    const hist = pays.filter((p) => p.status === 'paid' && (filter === 'all' || p.kind === filter || (filter === 'charge' && p.kind === 'special')));
    const exp = [
      { label: L('Common electricity', 'كهرباء مشتركة'), value: 53, color: '#36D6A0' }, { label: L('Cleaning', 'التنظيف'), value: 39, color: '#7FA7C2' },
      { label: L('Elevators', 'المصاعد'), value: 31, color: '#142B3B' }, { label: L('Water & pumps', 'المياه والمضخات'), value: 17, color: '#F2B35A' },
      { label: L('Security', 'الأمن'), value: 15, color: '#9B8AE0' }, { label: L('Reserve fund', 'صندوق الاحتياط'), value: 25, color: '#C9D6DF' },
    ];
    return `<div class="phone-col stack-lg">
      ${ui.pageHead({ title: L('Payments', 'المدفوعات'), sub: L('Rent, building charges and receipts', 'الإيجار ورسوم المبنى والإيصالات') })}
      <div class="card navy"><div class="row between wrap" style="gap:16px"><div><div class="small" style="color:var(--navy-ink)">${L('Outstanding balance', 'الرصيد المستحق')}</div><div style="font-family:var(--font-display);font-size:34px;font-weight:700;color:#fff" class="num">${B.money(outstanding)}</div><div class="small" style="color:var(--navy-ink)">${outstanding ? L('Building service charge — November', 'رسوم خدمات المبنى — تشرين الثاني') : L('You\'re all paid up', 'لا توجد مستحقات')}</div></div>${outstanding ? `<button class="btn btn-primary" data-act="rsPay" data-arg="${dueList[0].id}">${icon('card')}${L('Pay now', 'ادفع الآن')}</button>` : `<span class="badge mint">${icon('check')}${L('Paid', 'مدفوع')}</span>`}</div></div>
      ${ui.card({ title: L('Upcoming', 'القادم'), body: ui.list([ui.li({ icon: 'calendar', tone: 'info', title: L('Rent — December 2026', 'الإيجار — كانون الأول 2026'), sub: `${L('Due', 'يستحق')} ${B.date('2026-12-01')} · ${L('to Khaled Mansour', 'إلى خالد منصور')}`, end: `<b class="num">${B.money(3200)}</b>` }), ui.li({ icon: 'receipt', title: L('Building charge — December', 'رسوم المبنى — كانون الأول'), sub: `${L('Due', 'يستحق')} ${B.date('2026-12-05')}`, end: `<b class="num">${B.money(180)}</b>` })]) })}
      ${ui.card({ title: L('Where your building charge goes', 'أين تذهب رسوم المبنى'), sub: L('Your monthly ₪180 share, by category', 'حصتك الشهرية 180 ₪ حسب الفئة'), body: B.charts.donut({ data: exp, size: 150, format: (v) => B.money(v), center: { value: B.money(180), label: L('per month', 'شهرياً') } }) })}
      ${ui.card({ title: L('Payment history', 'سجل المدفوعات'), headExtra: '', body: `<div style="margin-bottom:12px">${ui.chips('rs:payF', [{ id: 'all', label: L('All', 'الكل') }, { id: 'rent', label: L('Rent', 'الإيجار') }, { id: 'charge', label: L('Building charges', 'رسوم المبنى') }], filter)}</div>` + ui.list(hist.map((p) => ui.li({ icon: p.kind === 'rent' ? 'home' : 'receipt', tone: p.kind === 'rent' ? 'navy' : 'mint', title: tx(p.label), sub: `${B.date(p.date)} · ${tx(p.method)}`, end: `<b class="num">${B.money(p.amount)}</b><span class="xs mint-ink">${L('Receipt', 'إيصال')}</span>`, act: 'rsReceipt', arg: p.id }))) })}
    </div>`;
  };

  const announcements = () => {
    const f = B.get('rs:annF', 'all');
    const list = D().announcementsOf(BID).filter((a) => f === 'all' || a.tag === f);
    return `<div class="phone-col">${ui.pageHead({ title: L('Announcements', 'الإعلانات'), sub: L('Al-Masyoun Residence Tower', 'برج الماصيون السكني') })}
      <div style="margin-bottom:16px">${ui.chips('rs:annF', [{ id: 'all', label: L('All', 'الكل') }, { id: 'notice', label: L('Notices', 'تنبيهات') }, { id: 'meeting', label: L('Meetings', 'اجتماعات') }, { id: 'maintenance', label: L('Maintenance', 'صيانة') }, { id: 'community', label: L('Community', 'مجتمع') }], f)}</div>
      <div class="card">${list.length ? list.map(annRow).join('') : ui.empty({ icon: 'megaphone', title: L('No announcements in this category', 'لا توجد إعلانات في هذه الفئة') })}</div></div>`;
  };

  const documents = () => `<div class="phone-col stack-lg">${ui.pageHead({ title: L('Documents', 'المستندات'), sub: L('Your lease, receipts and building files', 'عقدك وإيصالاتك وملفات المبنى'), actions: ui.btn(L('Upload', 'رفع'), { icon: 'upload', act: 'soon', arg: L('Upload', 'الرفع') }) })}
    ${ui.card({ title: L('Tenancy', 'الإيجار'), body: ui.list([ui.doc({ name: L('Lease contract L-2026-0803', 'عقد الإيجار L-2026-0803'), date: '2026-01-24', size: '2.4 MB', icon: 'contract' }), ui.doc({ name: L('Lease amendment #1 — parking space', 'تعديل العقد رقم 1 — موقف السيارة'), date: '2026-04-10', size: '420 KB', icon: 'edit' }), ui.doc({ name: L('Move-in inspection report', 'تقرير الفحص عند الاستلام'), date: '2026-02-01', size: '3.8 MB', icon: 'clipboard' })]) })}
    ${ui.card({ title: L('Receipts', 'الإيصالات'), body: ui.list(D().residentPayments.filter((p) => p.status === 'paid').slice(0, 4).map((p) => ui.doc({ name: `${p.id} · ${tx(p.label)}`, date: p.date, size: '96 KB', icon: 'receipt', tone: 'mint' }))) })}
    ${ui.card({ title: L('Building', 'المبنى'), body: ui.list([ui.doc({ name: L('Building rules & bylaws 2025', 'نظام المبنى والقواعد 2025'), date: '2025-02-01', size: '640 KB' }), ui.doc({ name: L('Fire safety certificate', 'شهادة السلامة من الحريق'), date: '2026-07-20', size: '310 KB', icon: 'shieldCheck' })]) })}
  </div>`;

  /* ---------------- Find my building ---------------- */
  const PERMIT = { oldcity: false, manara: true };
  const permitted = (d) => PERMIT[d] !== false;
  const find = () => {
    const data = D();
    const q = B.get('rs:findQ', '');
    const sel = B.get('rs:findSel', null);
    const matches = q ? data.buildings.filter((b) => B.match(q, b.name, b.id, b.gis, b.address, data.district(b.district).name)).slice(0, 30) : [];
    const vis = q ? new Set(matches.map((b) => b.id)) : null;
    const b = sel ? data.building(sel) : null;
    const suggestions = data.keyBuildings.slice(0, 4);
    const selCard = b ? `<div class="card rs-sel">
        <div class="row between" style="align-items:flex-start"><div class="grow"><div class="row-sm wrap" style="margin-bottom:6px">${ui.sourceTag(b.source)}</div><h3 style="font-size:17px">${esc(tx(b.name))}</h3><div class="small muted">${esc(tx(b.address))}</div></div><button class="icon-btn" data-act="set" data-arg="rs:findSel=" aria-label="close">${icon('x')}</button></div>
        <div class="kv-grid" style="margin-top:12px">${[[L('BENA ID', 'رقم بينا'), ui.idMono(b.id)], [L('Municipal GIS ID', 'رقم البلدية'), b.gis ? ui.idMono(b.gis) : `<span class="faint">${L('Not linked', 'غير مرتبط')}</span>`], [L('Status', 'الحالة'), ui.status(b.verification)], [L('Units', 'الوحدات'), b.units]].map(([k, v]) => `<div class="kv-cell"><div class="l">${k}</div><div class="v">${v}</div></div>`).join('')}</div>
        ${b.source === 'gis' ? ui.callout(L('<b>Already registered.</b> This building has a verified municipal identity — join it instead of creating a new record.', '<b>مسجّل مسبقاً.</b> لهذا المبنى هوية بلدية موثقة — انضم إليه بدلاً من إنشاء سجل جديد.'), 'mint', 'shieldCheck') : ui.callout(L('<b>Independently submitted record.</b> Created by an owner or resident; awaiting or completed municipal verification. It is shown separately from municipal records.', '<b>سجل مُسجّل بشكل مستقل.</b> أنشأه مالك أو ساكن؛ بانتظار تحقق البلدية أو تم. يُعرض بشكل منفصل عن السجلات البلدية.'), 'warn', 'userCheck')}
        <div class="row" style="margin-top:14px">${ui.btn(L('Request to join', 'طلب الانضمام'), { kind: 'primary', icon: 'userPlus', act: 'joinBuilding', arg: b.id, cls: 'grow' })}${ui.btn(L('Profile', 'الملف'), { icon: 'building', go: `resident-building-${b.id}` })}</div>
      </div>` : '';
    return `<div class="stack">
      ${ui.pageHead({ title: L('Find my building', 'ابحث عن مبناي'), sub: L('Search the BENA registry by name, street, BENA ID or municipal GIS ID — or tap a building on the map.', 'ابحث في سجل بينا بالاسم أو الشارع أو رقم بينا أو رقم البلدية — أو اضغط على مبنى في الخريطة.') })}
      ${ui.search('rs:findQ', L('e.g. Masyoun, Spring St., BN-RAM-00203', 'مثال: الماصيون، شارع النبع، BN-RAM-00203'))}
      <div class="grid g-main" style="align-items:start">
        <div class="stack">
          ${B.map.render({ id: 'rs-find', mode: 'verification', visible: vis, selected: sel, onSelect: 'rsFindSel', height: 'min(62dvh, 520px)', legendMobile: true })}
        </div>
        <div class="stack">
          ${selCard}
          ${q ? ui.card({ title: L(`${matches.length} matches`, `${matches.length} نتيجة`), body: matches.length ? `<div class="stack-sm">${matches.slice(0, 8).map((m) => `<button class="rs-find-result ${m.id === sel ? 'on' : ''}" data-act="rsFindSel" data-arg="${m.id}" data-center="1"><span class="li-icon ${m.source === 'gis' ? 'navy' : 'violet'}">${icon(m.source === 'gis' ? 'landmark' : 'userCheck')}</span><div class="grow" style="min-width:0"><div class="li-title truncate">${esc(tx(m.name))}</div><div class="li-sub"><span class="id-mono">${m.id}</span> · ${tx(data.district(m.district).name)}</div></div>${ui.status(m.verification)}</button>`).join('')}</div>` : ui.empty({ icon: 'search', title: L('No building matches', 'لا يوجد مبنى مطابق'), text: L('Check the spelling or ID — or register it if it\'s missing.', 'تحقق من الكتابة أو الرقم — أو سجّله إن لم يكن موجوداً.') }) }) : !b ? ui.card({ title: L('Popular in your area', 'شائع في منطقتك'), body: `<div class="stack-sm">${suggestions.map((m) => `<button class="rs-find-result" data-act="rsFindSel" data-arg="${m.id}" data-center="1"><span class="li-icon ${m.source === 'gis' ? 'navy' : 'violet'}">${icon(m.source === 'gis' ? 'landmark' : 'userCheck')}</span><div class="grow" style="min-width:0"><div class="li-title truncate">${esc(tx(m.name))}</div><div class="li-sub">${tx(data.district(m.district).name)}</div></div>${icon('chevR', 'flip chev')}</button>`).join('')}</div>` }) : ''}
          ${ui.card({ cls: 'flat', body: `<div class="row" style="align-items:flex-start"><span class="li-icon violet">${icon('plus')}</span><div class="grow"><b>${L('Can\'t find your building?', 'لا تجد مبناك؟')}</b><p class="small muted" style="margin:4px 0 12px">${L('Register it independently where the municipality permits it. It stays marked as independently submitted until verified.', 'سجّله بشكل مستقل حيث تسمح البلدية بذلك. يبقى مُعلّماً كسجل مستقل حتى يتم التحقق منه.')}</p>${ui.btn(L('Register a building', 'تسجيل مبنى'), { kind: 'dark', size: 'sm', icon: 'arrowRight', iconCls: 'flip', go: 'resident-register' })}</div></div>` })}
        </div>
      </div></div>`;
  };

  /* Independent registration wizard */
  const register = () => {
    const data = D();
    B.navActive('find'); B.title(L('Register a building', 'تسجيل مبنى'));
    const step = B.get('rs:regStep', 0);
    const dist = B.get('rs:regDist', 'masyoun');
    const ok = permitted(dist);
    const steps = [L('Area', 'المنطقة'), L('Building', 'المبنى'), L('Relationship', 'العلاقة'), L('Review', 'المراجعة')];
    const v = (k, d = '') => esc(B.get('rs:reg:' + k, d));
    const inp = (k, label, ph = '', type = 'text') => `<div class="field"><label for="f-rsreg${k}">${label}</label><input class="input" id="f-rsreg${k}" type="${type}" data-model="rs:reg:${k}" data-norender value="${v(k)}" placeholder="${esc(ph)}"></div>`;
    let body = '';
    if (step === 0) {
      body = `<div class="stack">
        <div class="field"><label>${L('District', 'الحي')}</label>${ui.select('rs:regDist', data.districts.map((d) => ({ v: d.id, l: d.name })), { def: 'masyoun' })}</div>
        ${ok ? ui.callout(L(`<b>Independent registration is permitted in ${tx(data.district(dist).name)}.</b> The record will be reviewed by the municipality before it is marked verified.`, `<b>التسجيل المستقل مسموح في ${tx(data.district(dist).name)}.</b> ستراجع البلدية السجل قبل اعتماده كموثّق.`), 'mint', 'checkCircle') : ui.callout(L(`<b>Not available in ${tx(data.district(dist).name)}.</b> This is a protected heritage zone where only the municipality can create building records. You can report a missing building instead.`, `<b>غير متاح في ${tx(data.district(dist).name)}.</b> هذه منطقة تراثية محمية لا يُنشئ فيها سجلات المباني سوى البلدية. يمكنك بدلاً من ذلك الإبلاغ عن مبنى مفقود.`), 'warn', 'lock')}
        ${B.map.render({ id: 'rs-reg', mode: 'source', height: '260px', legend: false, badge: L('Drop a pin on the building (demo)', 'ضع دبوساً على المبنى (تجريبي)'), onSelect: 'rsRegPin', selected: B.get('rs:regPin', null) })}
        ${B.get('rs:regPin') ? ui.callout(L('That footprint already has a BENA record — check it before registering a duplicate.', 'هذا المبنى لديه سجل في بينا — تحقق منه قبل تسجيل نسخة مكررة.') + ` <button class="btn btn-text" data-go="resident-building-${B.get('rs:regPin')}">${L('View record', 'عرض السجل')}</button>`, 'dashed', 'info') : ''}
      </div>`;
    } else if (step === 1) {
      body = `<div class="form-grid">${inp('name', L('Building name', 'اسم المبنى'), L('e.g. Al-Zaytoun Building', 'مثال: عمارة الزيتون'))}${inp('street', L('Street & number', 'الشارع والرقم'), L('e.g. 12 Garden Ln.', 'مثال: 12 زقاق الحديقة'))}${inp('floors', L('Floors', 'الطوابق'), '5', 'number')}${inp('units', L('Units', 'الوحدات'), '10', 'number')}
        <div class="field full"><label>${L('Building type', 'نوع المبنى')}</label>${ui.select('rs:reg:type', ['residential', 'mixed', 'commercial', 'office'].map((t) => ({ v: t, l: data.types[t] })), { def: 'residential' })}</div>
        ${inp('parcel', L('Basin / parcel (if known)', 'الحوض / القطعة (إن وُجد)'), L('e.g. Basin 12 / Parcel 140', 'مثال: حوض 12 / قطعة 140'))}${inp('year', L('Year built', 'سنة البناء'), '2015', 'number')}</div>`;
    } else if (step === 2) {
      const rel = B.get('rs:reg:rel', 'owner');
      body = `<div class="stack"><div class="radio-cards">${[['owner', L('Owner', 'مالك'), 'key', L('Title deed or sale contract', 'سند ملكية أو عقد بيع')], ['tenant', L('Tenant', 'مستأجر'), 'home', L('Signed lease', 'عقد إيجار موقّع')], ['committee', L('Committee member', 'عضو لجنة'), 'gavel', L('Committee letter', 'كتاب من اللجنة')]].map(([id, l, ic, d]) => `<label class="radio-card"><input type="radio" name="rsrel" data-model="rs:reg:rel" id="f-rsrel-${id}" value="${id}" ${rel === id ? 'checked' : ''}>${icon(ic)}<b>${l}</b><span>${d}</span></label>`).join('')}</div>
        ${ui.field({ name: 'docs', type: 'file', label: L('Supporting documents', 'المستندات الداعمة') })}
        <label class="check"><input type="checkbox" id="f-rsregconsent" data-model="rs:reg:consent" ${B.get('rs:reg:consent') ? 'checked' : ''}><span>${L('I confirm the information is accurate and agree that the municipality may contact me to verify it.', 'أؤكد صحة المعلومات وأوافق على تواصل البلدية معي للتحقق منها.')}</span></label></div>`;
    } else {
      body = `<div class="stack">${ui.kv([[L('District', 'الحي'), tx(data.district(dist).name)], [L('Building name', 'اسم المبنى'), v('name') || '—'], [L('Address', 'العنوان'), v('street') || '—'], [L('Floors / units', 'الطوابق / الوحدات'), `${v('floors') || '—'} / ${v('units') || '—'}`], [L('Type', 'النوع'), tx(data.types[B.get('rs:reg:type', 'residential')])], [L('Your relationship', 'علاقتك'), { owner: L('Owner', 'مالك'), tenant: L('Tenant', 'مستأجر'), committee: L('Committee member', 'عضو لجنة') }[B.get('rs:reg:rel', 'owner')]]])}
        ${ui.callout(L('Your building will receive a BENA ID immediately and be labelled <b>Independently submitted · Pending verification</b> until the municipality reviews it.', 'سيحصل مبناك على رقم بينا فوراً ويُعلَّم <b>مُسجّل بشكل مستقل · بانتظار التحقق</b> حتى تراجعه البلدية.'), '', 'info')}</div>`;
    }
    const next = step < 3 ? ui.btn(L('Continue', 'متابعة'), { kind: 'primary', act: 'set', arg: `rs:regStep=${step + 1}`, disabled: (step === 0 && !ok) || (step === 2 && !B.get('rs:reg:consent')) }) : ui.btn(L('Submit for verification', 'إرسال للتحقق'), { kind: 'primary', icon: 'send', act: 'rsRegSubmit' });
    return `<div class="phone-col">
      <button class="bp-back" data-go="resident-find">${icon('arrowLeft', 'flip')}${L('Find my building', 'ابحث عن مبناي')}</button>
      ${ui.pageHead({ title: L('Register a building', 'تسجيل مبنى'), sub: L('Independent registration — for buildings missing from the municipal registry', 'تسجيل مستقل — للمباني غير الموجودة في السجل البلدي') })}
      ${ui.stepper(steps, step)}
      ${ui.card({ title: steps[step], body, foot: `${step > 0 ? ui.btn(L('Back', 'رجوع'), { act: 'set', arg: `rs:regStep=${step - 1}` }) : ui.btn(L('Report missing building instead', 'الإبلاغ عن مبنى مفقود بدلاً من ذلك'), { kind: 'text', act: 'rsMissing' })}${next}` })}
    </div>`;
  };

  /* ---------------- role ---------------- */
  B.role({
    id: 'resident', icon: 'home', nav: 'tabs', home: 'home',
    name: { en: 'Resident / Tenant', ar: 'ساكن / مستأجر' }, short: { en: 'Resident', ar: 'ساكن' },
    org: { en: 'Al-Masyoun Residence Tower', ar: 'برج الماصيون السكني' },
    tag: { en: 'Mobile app', ar: 'تطبيق جوال' }, personaTitle: { en: 'Lina · Unit 803', ar: 'لينا · الوحدة 803' },
    desc: { en: 'Your home, building, payments and maintenance in one app.', ar: 'منزلك ومبناك ومدفوعاتك وطلبات الصيانة في تطبيق واحد.' },
    menu: [
      { group: { en: 'My home', ar: 'منزلي' } },
      { id: 'home', label: { en: 'Home', ar: 'الرئيسية' }, icon: 'home', tab: true },
      { id: 'mybuilding', label: { en: 'My building', ar: 'مبناي' }, tabLabel: { en: 'Building', ar: 'المبنى' }, icon: 'building', tab: true, match: ['building'] },
      { id: 'requests', label: { en: 'Maintenance', ar: 'الصيانة' }, icon: 'wrench', tab: true, match: ['request'] },
      { id: 'payments', label: { en: 'Payments', ar: 'المدفوعات' }, icon: 'wallet', tab: true, count: 1 },
      { id: 'myunit', label: { en: 'My unit', ar: 'وحدتي' }, icon: 'door' },
      { id: 'announcements', label: { en: 'Announcements', ar: 'الإعلانات' }, icon: 'megaphone' },
      { id: 'documents', label: { en: 'Documents', ar: 'المستندات' }, icon: 'folder' },
      { group: { en: 'Discover', ar: 'استكشف' } },
      { id: 'find', label: { en: 'Find a building', ar: 'ابحث عن مبنى' }, icon: 'search', match: ['register'] },
      { id: 'services', label: { en: 'Services marketplace', ar: 'سوق الخدمات' }, icon: 'sparkles', match: ['provider', 'servicedetail', 'quotes', 'servicehistory'] },
      { id: 'properties', label: { en: 'Property marketplace', ar: 'سوق العقارات' }, icon: 'store', match: ['listing'] },
    ],
    pages: { home, mybuilding, myunit, requests, request, payments, announcements, documents, find, register },
    notifications: () => [
      { icon: 'wrench', title: L('Plumber visit confirmed for Thursday', 'تأكيد زيارة السبّاك يوم الخميس'), sub: 'MR-24518', when: L('2h', 'منذ ساعتين'), go: 'resident-request-MR-24518' },
      { icon: 'receipt', tone: 'warn', title: L('November building charge is due', 'رسوم المبنى لشهر تشرين الثاني مستحقة'), sub: B.money(180), when: L('Today', 'اليوم'), go: 'resident-payments' },
      { icon: 'megaphone', title: L('Water cut Thursday 09:00–13:00', 'انقطاع المياه الخميس 09:00–13:00'), sub: L('Owners\' Association', 'جمعية المالكين'), when: L('2d', 'منذ يومين'), go: 'resident-announcements' },
      { icon: 'contract', tone: 'info', title: L('Lease ends in 67 days', 'ينتهي العقد خلال 67 يوماً'), sub: 'L-2026-0803', when: L('1w', 'منذ أسبوع'), go: 'resident-myunit' },
    ],
  });

  /* ---------------- actions ---------------- */
  B.act.rsFindSel = (id, el) => {
    if (!id) return;
    if (el && el.dataset.center) B.map.focus('rs-find', id, 280);
    B.set('rs:findSel', id);
    if (window.matchMedia('(max-width: 767px)').matches) setTimeout(() => document.querySelector('.rs-sel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  };
  B.act.rsRegPin = (id) => B.set('rs:regPin', id);
  B.act.rsRegSubmit = () => {
    const ref = 'BN-RAM-' + String(900 + Math.floor(Math.random() * 90)).padStart(5, '0');
    B.success({ title: L('Building submitted', 'تم تسجيل المبنى'), text: L('Your building now has a BENA ID and is marked “Independently submitted · Pending verification”. The municipality will review it, usually within 10 working days.', 'حصل مبناك على رقم بينا وتم تعليمه «مُسجّل بشكل مستقل · بانتظار التحقق». ستراجعه البلدية عادة خلال 10 أيام عمل.'), ref, done: 'resident-find', doneLabel: L('Back to search', 'العودة للبحث') });
    Object.keys(B.vs).filter((k) => k.startsWith('rs:reg')).forEach((k) => delete B.vs[k]);
  };
  B.act.rsMissing = () => {
    B.modal({ title: L('Report a missing building', 'الإبلاغ عن مبنى مفقود'), sub: L('Sent to the municipality\'s building registry unit', 'يُرسل إلى وحدة سجل المباني في البلدية'), form: 'rsMissing', body: `<div class="stack">${ui.field({ name: 'addr', label: L('Address or nearest landmark', 'العنوان أو أقرب معلم'), required: true })}${ui.field({ name: 'note', type: 'textarea', label: L('What do you know about it?', 'ماذا تعرف عنه؟'), placeholder: L('Floors, number of units, year built…', 'عدد الطوابق والوحدات وسنة البناء…') })}${ui.field({ name: 'photo', type: 'file', label: L('Photo of the building', 'صورة للمبنى') })}</div>`, foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${L('Send report', 'إرسال البلاغ')}</button>` });
  };
  B.submit.rsMissing = () => B.success({ title: L('Report sent to the municipality', 'تم إرسال البلاغ للبلدية'), text: L('A surveyor may visit to map the building. You\'ll be notified when it is added to the registry.', 'قد يزور مسّاح الموقع لتوثيق المبنى. سيصلك إشعار عند إضافته للسجل.'), ref: B.uid('MB') });

  B.act.newRequest = () => {
    const cats = ['plumbing', 'electrical', 'elevators', 'hvac', 'cleaning', 'general'];
    B.modal({ title: L('Report a maintenance issue', 'الإبلاغ عن مشكلة صيانة'), sub: L('Al-Masyoun Residence Tower · Unit 803', 'برج الماصيون السكني · الوحدة 803'), form: 'newRequest', size: 'md', body: `<div class="stack">
      ${ui.field({ name: 'cat', type: 'radio', label: L('Category', 'الفئة'), options: cats.map((c) => ({ v: c, l: D().cat(c).name, icon: D().cat(c).icon })) })}
      ${ui.field({ name: 'where', type: 'select', label: L('Location', 'المكان'), options: [{ v: 'unit', l: L('My unit (803)', 'وحدتي (803)') }, { v: 'common', l: L('Common area (lobby, stairs, roof…)', 'منطقة مشتركة (الردهة، الدرج، السطح…)') }] })}
      ${ui.field({ name: 'title', label: L('Short title', 'عنوان مختصر'), placeholder: L('e.g. Bathroom tap dripping', 'مثال: صنبور الحمام يقطر'), required: true })}
      ${ui.field({ name: 'desc', type: 'textarea', label: L('Describe the problem', 'صف المشكلة'), placeholder: L('When did it start? Is it getting worse?', 'متى بدأت؟ هل تزداد سوءاً؟') })}
      <div class="form-grid">${ui.field({ name: 'when', type: 'select', label: L('Preferred visit time', 'وقت الزيارة المفضل'), options: [{ v: 'am', l: L('Morning 09:00–12:00', 'صباحاً 09:00–12:00') }, { v: 'pm', l: L('Afternoon 12:00–16:00', 'ظهراً 12:00–16:00') }, { v: 'eve', l: L('Evening 16:00–19:00', 'مساءً 16:00–19:00') }] })}${ui.field({ name: 'urgent', type: 'select', label: L('Urgency', 'الاستعجال'), options: [{ v: 'low', l: L('Can wait', 'يمكن الانتظار') }, { v: 'medium', l: L('This week', 'هذا الأسبوع') }, { v: 'high', l: L('Urgent', 'عاجل') }] })}</div>
      ${ui.field({ name: 'photos', type: 'file', label: L('Photos', 'الصور') })}</div>`, foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${L('Submit request', 'إرسال الطلب')}</button>` });
  };
  B.submit.newRequest = (d) => {
    const id = 'MR-' + (24519 + D().requests.filter((q) => q.local).length);
    D().requests.unshift({ id, local: true, building: BID, unit: d.where === 'unit' ? UID : null, by: me(), cat: d.cat || 'general', title: { en: d.title || 'Maintenance request', ar: d.title || 'طلب صيانة' }, desc: d.desc ? { en: d.desc, ar: d.desc } : null, status: 'open', priority: d.urgent || 'medium', created: '2026-11-25', provider: null, scope: d.where || 'unit' });
    B.success({ title: L('Request submitted', 'تم إرسال الطلب'), text: L('Your building management has been notified. Track progress under Maintenance.', 'تم إشعار إدارة المبنى. تابع التقدم في قسم الصيانة.'), ref: id, done: `resident-request-${id}`, doneLabel: L('Track request', 'متابعة الطلب') });
  };
  B.act.rsPay = (pid) => {
    const p = D().residentPayments.find((x) => x.id === pid);
    B.modal({ title: L('Pay building charge', 'دفع رسوم المبنى'), sub: tx(p.label), size: 'sm', form: 'rsPay', body: `<div class="stack"><div class="card flat" style="text-align:center"><div class="small muted">${L('Amount', 'المبلغ')}</div><div style="font-family:var(--font-display);font-size:32px;font-weight:700" class="num">${B.money(p.amount)}</div><div class="xs faint">${L('to Al-Masyoun Tower Owners\' Association', 'إلى جمعية مالكي برج الماصيون')}</div></div>
      ${ui.field({ name: 'method', type: 'radio', label: L('Payment method', 'طريقة الدفع'), options: [{ v: 'card', l: L('Card ••• 4821', 'بطاقة ••• 4821'), icon: 'card' }, { v: 'bank', l: L('Bank transfer', 'تحويل بنكي'), icon: 'landmark' }, { v: 'wallet', l: L('Mobile wallet', 'محفظة إلكترونية'), icon: 'wallet' }] })}
      ${ui.callout(L('Demo only — no payment is processed.', 'نسخة تجريبية — لا تتم أي عملية دفع.'), 'dashed', 'info')}</div>`, foot: `<button type="submit" class="btn btn-primary btn-block">${L(`Pay ${B.money(p.amount)}`, `ادفع ${B.money(p.amount)}`)}</button>` });
    B._payId = pid;
  };
  B.submit.rsPay = () => {
    const p = D().residentPayments.find((x) => x.id === B._payId);
    if (p) { p.status = 'paid'; p.method = { en: 'Card', ar: 'بطاقة' }; p.date = '2026-11-25'; }
    const role = B.roles.resident.menu.find((m) => m.id === 'payments'); if (role) role.count = 0;
    B.success({ title: L('Payment successful', 'تم الدفع بنجاح'), text: L('A receipt has been added to your documents.', 'تمت إضافة الإيصال إلى مستنداتك.'), ref: 'RCPT-' + B._payId });
    setTimeout(() => B.refresh(), 0);
  };
  B.act.rsReceipt = (pid) => {
    const p = D().residentPayments.find((x) => x.id === pid);
    B.modal({ title: L('Receipt', 'إيصال'), sub: ui.idMono(p.id), size: 'sm', body: `<div style="border:1px dashed var(--line);border-radius:14px;padding:18px"><div class="row between" style="margin-bottom:14px"><div class="brand dark">${B.logo(24)}<span style="font-size:15px">BENA</span></div>${ui.status('paid')}</div>${ui.kv([[L('Description', 'الوصف'), tx(p.label)], [L('Date', 'التاريخ'), B.date(p.date)], [L('Method', 'الطريقة'), tx(p.method)], [L('Paid to', 'المستفيد'), p.kind === 'rent' ? esc(D().pname('p_khaled')) : L('Owners\' Association', 'جمعية المالكين')], [L('Amount', 'المبلغ'), `<b class="num">${B.money(p.amount)}</b>`]])}</div>`, foot: ui.btn(L('Download PDF', 'تنزيل PDF'), { kind: 'primary', icon: 'download', block: true, act: 'soon', arg: L('Download', 'التنزيل') }) });
  };
  B.act.rsAnn = (aid) => {
    const a = D().announcements.find((x) => x.id === aid);
    const by = D().committees[a.by] ? tx(D().committees[a.by].name) : tx(D().org(a.by)?.name || '');
    B.modal({ title: esc(tx(a.title)), sub: `${by} · ${B.date(a.date)}`, body: `<p style="line-height:1.65">${esc(tx(a.body))}</p>`, foot: `${ui.btn(L('Add to calendar', 'إضافة للتقويم'), { icon: 'calendar', act: 'toast', arg: L('Added to your calendar', 'تمت الإضافة للتقويم') })}${ui.btn(L('Got it', 'حسناً'), { kind: 'primary', act: 'closeModal' })}` });
  };
  B.act.rsMessage = (pid) => {
    B.modal({ title: L(`Message ${D().pname(pid)}`, `مراسلة ${D().pname(pid)}`), sub: L('Sent through BENA — your phone number stays private', 'تُرسل عبر بينا — يبقى رقم هاتفك خاصاً'), form: 'rsMessage', size: 'sm', body: ui.field({ name: 'msg', type: 'textarea', label: L('Message', 'الرسالة'), required: true }), foot: `<button type="submit" class="btn btn-primary btn-block">${icon('send', 'flip')}${L('Send', 'إرسال')}</button>` });
  };
  B.submit.rsMessage = () => { B.closeModal(); B.toast(L('Message sent', 'تم إرسال الرسالة')); };
  B.submit.rsMsg = (d, f) => { f.reset(); B.toast(L('Update sent', 'تم إرسال التحديث')); };
  B.act.rsCall = (num) => B.modal({ title: L('Call', 'اتصال'), size: 'sm', body: `<div class="success-state"><div class="s-icon">${icon('phone')}</div><h3 class="ltr">${esc(num)}</h3><p>${L('Use your phone to call this number.', 'استخدم هاتفك للاتصال بهذا الرقم.')}</p></div>`, foot: ui.btn(L('Close', 'إغلاق'), { kind: 'primary', block: true, act: 'closeModal' }) });
  B.act.rsRate = (qid) => B.modal({ title: L('Rate this service', 'قيّم هذه الخدمة'), size: 'sm', form: 'rsRate', body: `<div class="stack">${ui.field({ name: 'stars', type: 'radio', label: L('Your rating', 'تقييمك'), options: [5, 4, 3].map((n) => ({ v: n, l: '★'.repeat(n), d: n === 5 ? L('Excellent', 'ممتاز') : n === 4 ? L('Good', 'جيد') : L('Okay', 'مقبول') })) })}${ui.field({ name: 'c', type: 'textarea', label: L('Comment', 'تعليق') })}</div>`, foot: `<button type="submit" class="btn btn-primary btn-block">${L('Submit rating', 'إرسال التقييم')}</button>` });
  B.submit.rsRate = () => B.success({ title: L('Thanks for your feedback', 'شكراً لملاحظاتك'), text: L('Ratings help your building choose reliable providers.', 'تساعد التقييمات مبناك على اختيار مزودين موثوقين.') });
  B.act.rsCancel = (qid) => B.confirm({ title: L('Cancel this request?', 'إلغاء هذا الطلب؟'), text: L('The provider and management will be notified.', 'سيتم إشعار المزود والإدارة.'), ok: L('Cancel request', 'إلغاء الطلب'), danger: true, onOk: () => { const q = D().request(qid); if (q) q.status = 'cancelled'; B.closeModal(true); B.toast(L('Request cancelled', 'تم إلغاء الطلب')); B.go('resident-requests'); } });
})();
