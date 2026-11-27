/*
 * BENA — Property Management (role `manager`), part 2.
 * Leasing & finance (leases, rent, receivables, service charges, expenses,
 * financial reports) and operations (maintenance, documents, team).
 * Uses the helpers exposed by manager.js on B.data.managerX.h. All figures are fictional sample data.
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon } = B;
  const ui = B.ui;
  const D = B.data;
  const MX = D.managerX;
  if (!MX || !MX.h) return;
  const {
    YTD_I, R, money, moneyC, unitName, ymLabel, iso, addDays, todayIso, seedOf, blds, bIds, bld, sName, arrears, outstanding, daysLate, leaseState, bStats,
    agg, finM, finSum, catsFor, chargesOf, scArrears, vacantDays, staff, staffName, covers, pmOf, leasingOf, vendorName, scope, setScope, sIds, inScope, sUnits, sLeases,
    phead, kb, kband, fbar, scopeSelect, panel, psec, pstats, xtable, sub2, numc, tenantCell, unitCell, catIcon, openStatuses, exportBtn, reqCols, docCols, chargesBuilding, crumbs, pct1, remindMany, prevTenancy,
  } = MX.h;
  const P = MX.P;
  const T = (en, ar) => ({ en, ar });
  const sgn = (v) => (v < 0 ? `(${money(-v)})` : money(v));
  const PAL8 = ['#142B3B', '#36D6A0', '#7FA7C2', '#F2B35A', '#9B8AE0', '#C9D6DF', '#E58A7B', '#5B7A8F'];

  /* =====================================================================
   * 8 · Lease management (register · renewals · calendar · expiry profile)
   * ===================================================================== */
  const stageOf = (l) => {
    if (l.status === 'expired') return 'hold';
    if ((MX.renewals || {})[l.id]) return 'offer';
    if (l.autoRenewed && B.daysBetween(l.autoRenewed, todayIso) <= 75) return 'done';
    const d = B.daysFromToday(l.end);
    if (d >= 0 && d <= 90) return seedOf(l.id) % 4 === 0 ? 'owner' : 'notice';
    return null;
  };
  const wale = (ls) => { const r = B.sum(ls, (l) => l.rent); return r ? B.sum(ls, (l) => l.rent * Math.max(0, B.daysFromToday(l.end)) / 365) / r : 0; };
  P.leases = () => {
    crumbs({ label: L('Lease management', 'إدارة العقود') });
    const view = B.get('mg:lv', 'register');
    const all = sLeases();
    const kbs = kband([
      kb('contract', L('Active leases', 'العقود السارية'), all.filter((l) => l.status !== 'expired').length, L(`${all.length} on record`, `${all.length} مسجّلة`)),
      kb('calendarCheck', L('Expiring ≤ 90 days', 'تنتهي خلال 90 يوماً'), all.filter((l) => { const d = B.daysFromToday(l.end); return d >= 0 && d <= 90; }).length, L('in renewal window', 'في فترة التجديد'), 'warn'),
      kb('clock', L('Holding over', 'تمديد ضمني'), all.filter((l) => l.status === 'expired').length, L('past end date', 'تجاوزت تاريخ الانتهاء'), 'bad'),
      kb('send', L('Renewal offers out', 'عروض تجديد مُرسلة'), Object.keys(MX.renewals || {}).filter((id) => all.some((l) => l.id === id)).length, L('this session', 'هذه الجلسة')),
      kb('target', L('WALE', 'متوسط مدة العقود المرجّح'), `${B.num1(wale(all))}<small>${L('yrs', 'سنة')}</small>`, L('weighted by rent', 'مرجّح بالإيجار')),
    ], 5);
    let body = '';
    if (view === 'register') {
      const sf = B.get('mg:lf', 'all'); const q = B.get('mg:lq', '');
      const base = all.filter((l) => B.match(q, l.id, D.person(l.tenant).name, D.person(l.owner).name, D.unit(l.unit).number));
      const rows = base.filter((l) => sf === 'all' || l.status === sf);
      body = `${fbar([ui.search('mg:lq', L('Contract, tenant or owner…', 'عقد أو مستأجر أو مالك…'), { reset: 'mgLeases:page' }), scopeSelect(),
        ui.chips('mg:lf', [{ id: 'all', label: L('All', 'الكل'), count: base.length }, { id: 'active', label: ui.statusLabel('active'), count: base.filter((l) => l.status === 'active').length }, { id: 'expiring', label: ui.statusLabel('expiring'), count: base.filter((l) => l.status === 'expiring').length }, { id: 'expired', label: L('Holding over', 'تمديد ضمني'), count: base.filter((l) => l.status === 'expired').length }], sf)])}
        ${xtable({ id: 'mgLeases', rows, pageSize: 25, maxH: 'calc(100vh - 320px)', defaultSort: 'end', rowGo: (l) => `${R}-lease-${l.id}`,
          bulk: [{ label: L('Prepare renewal offers', 'إعداد عروض التجديد'), icon: 'refresh', act: 'mgRenewSel' }, { label: L('Send reminders', 'إرسال تذكيرات'), icon: 'bell', act: 'mgRemindSel' }, { label: L('Export', 'تصدير'), icon: 'download', act: 'mgExportSel' }],
          cols: [
            { key: 'tenant', label: L('Tenant', 'المستأجر'), m: 'title', render: tenantCell, mRender: (l) => esc(D.pname(l.tenant)), sort: (l) => D.pname(l.tenant) },
            { key: 'unit', label: L('Unit', 'الوحدة'), m: 'sub', sort: (l) => l.unit, render: (l) => sub2(esc(unitName(D.unit(l.unit))), esc(sName(l.building))) },
            { key: 'owner', label: L('Owner', 'المالك'), wide: true, m: 'hide', sort: (l) => D.pname(l.owner), render: (l) => esc(D.pname(l.owner)) },
            { key: 'start', label: L('Start', 'البداية'), sort: true, wide: true, m: 'hide', render: (l) => `<span class="nowrap">${B.date(l.start)}</span>` },
            { key: 'end', label: L('End', 'النهاية'), sort: true, m: 'meta', render: (l) => `<span class="nowrap">${B.date(l.end)}</span>` },
            { key: 'left', label: L('Days left', 'المتبقي'), num: true, sort: (l) => B.daysFromToday(l.end), m: 'hide', render: (l) => { const d = B.daysFromToday(l.end); return `<span class="num" style="color:${d < 0 ? 'var(--bad)' : d <= 90 ? 'var(--warn)' : 'var(--text-2)'};font-weight:600">${d}</span>`; } },
            { key: 'rent', label: L('Rent', 'الإيجار'), num: true, sort: true, m: 'end', render: (l) => `<b class="num">${money(l.rent)}</b>`, total: (rs) => numc(B.sum(rs, (l) => l.rent)) },
            { key: 'status', label: L('Status', 'الحالة'), sort: (l) => l.status, m: 'meta', render: (l) => `${ui.status(leaseState(l))}${(MX.renewals || {})[l.id] ? ` ${ui.badge(L('Offer sent', 'أُرسل العرض'), 'info', 'send')}` : ''}` },
          ] })}`;
    } else if (view === 'renewals') {
      const cols = [
        { id: 'notice', label: L('Renewal window · action needed', 'فترة التجديد · يلزم إجراء'), sub: L('≤ 90 days, no offer yet', '≤ 90 يوماً، دون عرض بعد') },
        { id: 'owner', label: L('Owner approved · awaiting tenant', 'وافق المالك · بانتظار المستأجر'), sub: L('Offer accepted by owner (sample)', 'قبل المالك العرض (نموذج)') },
        { id: 'offer', label: L('Offer sent', 'أُرسل العرض'), sub: L('Owner approval requested', 'طُلبت موافقة المالك') },
        { id: 'hold', label: L('Holding over', 'تمديد ضمني'), sub: L('Regularise or terminate', 'سوِّ الوضع أو أنهِ العقد') },
        { id: 'done', label: L('Renewed recently', 'جُدّدت مؤخراً'), sub: L('Auto-renewed in the last 75 days', 'تجديد تلقائي خلال 75 يوماً') },
      ];
      const mc = B.get('mg:lrc', 'notice');
      body = `<div class="mg-board-seg" style="margin-bottom:10px">${ui.seg('mg:lrc', cols.map((c) => ({ id: c.id, label: `${all.filter((l) => stageOf(l) === c.id).length}` + ' · ' + c.label.split(' · ')[0] })), mc)}</div>
        <div class="mg-board" style="--n:5">${cols.map((c) => { const its = all.filter((l) => stageOf(l) === c.id).sort(B.by('end')); return `<div class="mg-col ${mc === c.id ? 'show-m' : ''}"><div class="cl-h"><span>${c.label}</span><span class="c">${its.length}</span></div><div class="cl-s">${c.sub} · ${moneyC(B.sum(its, (l) => l.rent))}/${L('mo', 'شهر')}</div>
          ${its.length ? its.slice(0, 8).map((l) => `<div class="mg-req"><div class="row between" style="gap:8px"><b class="small">${esc(unitName(D.unit(l.unit)))} · ${esc(sName(l.building))}</b>${ui.idMono(l.id)}</div>
            <div class="rq-m"><span>${esc(D.pname(l.tenant))}</span><span>${money(l.rent)}</span><span>${c.id === 'done' ? L(`renewed ${B.dateShort(addDays(l.autoRenewed, 1))}`, `جُدّد ${B.dateShort(addDays(l.autoRenewed, 1))}`) : B.inDays(l.end)}</span></div>
            <div class="rq-f"><button class="mg-link small" data-go="${R}-lease-${l.id}">${L('Open', 'فتح')}</button>${c.id === 'notice' || c.id === 'hold' ? ui.btn(L('Prepare offer', 'إعداد عرض'), { size: 'sm', kind: 'primary', act: 'mgRenew', arg: l.id }) : c.id === 'offer' ? `<span class="xs faint">${L('proposed', 'مقترح')} ${money(MX.renewals[l.id].rent)}</span>` : c.id === 'owner' ? ui.btn(L('Send for signature', 'إرسال للتوقيع'), { size: 'sm', act: 'soon', arg: L('E-signature', 'التوقيع الإلكتروني') }) : `<span class="xs faint">${L('next end', 'النهاية القادمة')} ${B.dateShort(l.end)}</span>`}</div></div>`).join('') + (its.length > 8 ? `<div class="xs faint" style="padding:4px">${L(`+ ${its.length - 8} more — use the register`, `+ ${its.length - 8} أخرى — استخدم السجل`)}</div>` : '') : `<div class="xs faint" style="padding:8px 4px">${L('Nothing here', 'لا شيء هنا')}</div>`}</div>`; }).join('')}</div>`;
    } else if (view === 'calendar') {
      body = leaseCalendar(all);
    } else {
      const months = Array.from({ length: 12 }, (_, i) => { const d = new Date(2026, 11 + i, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; });
      const by = months.map((ym) => all.filter((l) => l.end.slice(0, 7) === ym));
      body = `<div class="grid g-main">${ui.card({ cls: 'mg-chart', title: L('Lease expiry profile', 'ملف انتهاء العقود'), sub: L('Monthly rent expiring · next 12 months', 'الإيجار الشهري المنتهي · الأشهر الـ12 القادمة'), body: B.charts.bars({ labels: months.map((ym) => B.mon(+ym.slice(5) - 1)), series: [{ name: L('Residential', 'سكني'), color: '#7FA7C2', values: by.map((ls) => B.sum(ls.filter((l) => D.unit(l.unit).kind === 'apartment'), (l) => l.rent)) }, { name: L('Commercial', 'تجاري'), color: '#142B3B', values: by.map((ls) => B.sum(ls.filter((l) => D.unit(l.unit).kind !== 'apartment'), (l) => l.rent)) }], height: 220 }) })}
        ${ui.card({ title: L('Concentration', 'التركّز'), body: ui.kv([[L('Largest single lease', 'أكبر عقد'), (() => { const l = all.slice().sort(B.by('rent', -1))[0]; return l ? `${money(l.rent)} · ${esc(unitName(D.unit(l.unit)))}` : '—'; })()], [L('Top 10 leases share', 'حصة أكبر 10 عقود'), pct1((B.sum(all.slice().sort(B.by('rent', -1)).slice(0, 10), (l) => l.rent) / (B.sum(all, (l) => l.rent) || 1)) * 100)], [L('Expiring in peak month', 'المنتهي في شهر الذروة'), money(Math.max(...by.map((ls) => B.sum(ls, (l) => l.rent))))], [L('Commercial share of rent', 'حصة التجاري من الإيجار'), pct1((B.sum(all.filter((l) => D.unit(l.unit).kind !== 'apartment'), (l) => l.rent) / (B.sum(all, (l) => l.rent) || 1)) * 100)]]) + `<div style="margin-top:12px">${ui.callout(L('Stagger renewals in peak months: offer 13- or 18-month terms to spread expiries.', 'وزّع التجديدات في أشهر الذروة: اعرض مدداً من 13 أو 18 شهراً لتوزيع تواريخ الانتهاء.'), 'mint', 'info')}</div>` })}</div>`;
    }
    return `${phead({ title: L('Lease management', 'إدارة العقود'), sub: L('All rental contracts Arkan administers on behalf of owners — register, renewals and expiries.', 'كل عقود الإيجار التي تديرها أركان نيابةً عن المالكين — السجل والتجديدات وتواريخ الانتهاء.'), actions: `${exportBtn(L('Lease register', 'سجل العقود'))}${ui.btn(L('New lease', 'عقد جديد'), { kind: 'primary', icon: 'plus', act: 'soon', arg: L('Lease drafting', 'صياغة العقد') })}` })}
      <div class="stack">${kbs}<div>${ui.tabs('mg:lv', [{ id: 'register', label: L('Register', 'السجل'), icon: 'list' }, { id: 'renewals', label: L('Renewals pipeline', 'مسار التجديدات'), icon: 'refresh' }, { id: 'calendar', label: L('Expiry calendar', 'تقويم الانتهاء'), icon: 'calendar' }, { id: 'profile', label: L('Expiry profile', 'ملف الانتهاء'), icon: 'chart' }], view)}</div>${body}</div>`;
  };
  P.calendar = () => { B.vs['mg:lv'] = 'calendar'; return P.leases(); };

  function leaseCalendar(ls) {
    const ym = B.get('mg:cal', '2026-11');
    const [y, m] = ym.split('-').map(Number);
    const events = [];
    ls.forEach((l) => {
      const u = D.unit(l.unit);
      events.push({ date: l.end, kind: 'end', l, label: L(`${u.number} ends`, `${u.number} ينتهي`), tone: l.status === 'expired' ? 'bad' : l.status === 'expiring' ? 'warn' : '', act: 'go', arg: `${R}-lease-${l.id}` });
      events.push({ date: addDays(l.end, -60), kind: 'notice', l, label: L(`Notice · ${u.number}`, `إشعار · ${u.number}`), tone: 'info', act: 'go', arg: `${R}-lease-${l.id}` });
      const rn = MX.renewals && MX.renewals[l.id];
      if (rn) events.push({ date: addDays(l.end, 1), kind: 'renewal', l, label: L(`${u.number} renewal`, `${u.number} تجديد`), tone: 'mint', act: 'go', arg: `${R}-lease-${l.id}` });
      if (l.autoRenewed) events.push({ date: addDays(l.autoRenewed, 1), kind: 'renewal', l, label: L(`${u.number} renewed`, `${u.number} جُدّد`), tone: 'mint', act: 'go', arg: `${R}-lease-${l.id}` });
      const sd = seedOf(l.id);
      if (l.status === 'expiring') { const span = Math.max(1, B.daysBetween(todayIso, l.end) - 4); events.push({ date: addDays(todayIso, 2 + (sd % span)), kind: 'meeting', l, label: L(`Meet · ${u.number}`, `اجتماع · ${u.number}`), tone: 'mint', act: 'go', arg: `${R}-lease-${l.id}` }); }
      if (l.status === 'expired') events.push({ date: addDays(todayIso, 3 + (sd % 24)), kind: 'inspect', l, label: L(`Inspect · ${u.number}`, `تفقد · ${u.number}`), tone: 'bad', act: 'go', arg: `${R}-lease-${l.id}` });
    });
    const inMonth = events.filter((e) => e.date.startsWith(ym)).sort(B.by('date'));
    const kindLabel = { end: L('Lease ends', 'انتهاء عقد'), notice: L('Notice deadline (60 days)', 'آخر موعد للإشعار (60 يوماً)'), renewal: L('Renewal effective', 'سريان التجديد'), meeting: L('Renewal meeting with tenant', 'اجتماع تجديد مع المستأجر'), inspect: L('Holdover inspection & regularisation', 'تفقد وتسوية التمديد الضمني') };
    const kindIcon = { end: 'flag', notice: 'bell', renewal: 'refresh', meeting: 'users', inspect: 'clipboard' };
    const showAll = B.get('mg:calAll', false);
    return `<div class="grid g-main">
      ${ui.card({ body: `<div class="row between wrap" style="margin-bottom:14px"><div class="row-sm">${ui.btn('', { size: 'sm', icon: 'chevL', iconCls: 'flip', act: 'mgCal', arg: '-1', title: L('Previous month', 'الشهر السابق') })}<h3 style="min-width:150px;text-align:center">${B.monLong(m - 1)} ${y}</h3>${ui.btn('', { size: 'sm', icon: 'chevR', iconCls: 'flip', act: 'mgCal', arg: '1', title: L('Next month', 'الشهر التالي') })}</div><div class="row-sm">${ym !== '2026-11' ? ui.btn(L('Today', 'اليوم'), { size: 'sm', act: 'set', arg: 'mg:cal=2026-11' }) : ''}${scopeSelect()}</div></div>${B.ui.calendar({ year: y, month: m - 1, events })}<div class="mg-legend" style="margin-top:14px"><span><i style="background:#F2C27A"></i>${L('Expiring', 'تنتهي قريباً')}</span><span><i style="background:#F1B5B0"></i>${L('Holding over', 'تمديد ضمني')}</span><span><i style="background:var(--navy)"></i>${L('Lease end', 'انتهاء عقد')}</span><span><i style="background:#BBD0F5"></i>${L('Notice deadline', 'موعد الإشعار')}</span><span><i style="background:var(--mint)"></i>${L('Renewal / meeting', 'تجديد / اجتماع')}</span></div>` })}
      ${ui.card({ title: L('This month', 'هذا الشهر'), sub: L(`${inMonth.length} events`, `${inMonth.length} أحداث`), body: inMonth.length ? ui.list((showAll ? inMonth : inMonth.slice(0, 10)).map((e) => ui.li({ icon: kindIcon[e.kind], tone: e.kind === 'renewal' || e.kind === 'meeting' ? 'mint' : e.kind === 'notice' ? 'info' : e.l.status === 'expired' ? 'bad' : 'warn', title: `${esc(unitName(D.unit(e.l.unit)))} · ${esc(sName(e.l.building))}`, sub: `${kindLabel[e.kind]} · ${B.dateShort(e.date)} · ${esc(D.pname(e.l.tenant))}`, go: `${R}-lease-${e.l.id}` }))) + (inMonth.length > 10 ? `<div style="margin-top:12px">${ui.btn(showAll ? L('Show fewer', 'عرض أقل') : L(`Show all ${inMonth.length}`, `عرض الكل (${inMonth.length})`), { size: 'sm', block: true, act: 'toggle', arg: 'mg:calAll' })}</div>` : '') : ui.empty({ icon: 'calendar', title: L('No events this month', 'لا أحداث هذا الشهر'), action: ui.btn(L('Next month', 'الشهر التالي'), { size: 'sm', act: 'mgCal', arg: '1' }) }) })}
    </div>`;
  }

  /* ---------- 8b · Lease detail ---------- */
  P.lease = (id) => {
    const l = D.lease(id);
    if (!l || !MX.h.inPf(l.building)) return ui.empty({ icon: 'contract', title: L('Contract not found', 'العقد غير موجود'), action: ui.btn(L('Leases', 'العقود'), { kind: 'primary', go: `${R}-leases` }) });
    B.title(l.id); B.navActive('leases');
    crumbs({ label: L('Lease management', 'إدارة العقود'), go: `${R}-leases` }, { label: l.id });
    const u = D.unit(l.unit); const b = bld(l.building);
    const a = arrears(l); const rn = MX.renewals && MX.renewals[l.id];
    const elapsed = Math.max(0, Math.min(100, (B.daysBetween(l.start, todayIso) / B.daysBetween(l.start, l.end)) * 100));
    const sched = []; let [y, m] = l.start.split('-').map(Number); const [ey, em] = l.end.split('-').map(Number);
    let guard = 0;
    while ((y < ey || (y === ey && m <= em)) && guard++ < 48) { const due = iso(y, m, l.payDay || 1); const back = (2026 - y) * 12 + (11 - m); sched.push({ id: due, ym: `${y}-${String(m).padStart(2, '0')}`, due, amount: l.rent, status: due > todayIso ? 'upcoming' : back < a ? 'overdue' : 'paid' }); m++; if (m > 12) { m = 1; y++; } }
    if (l.status === 'expired') { let [hy, hm] = [ey, em + 1]; if (hm > 12) { hm = 1; hy++; } while (iso(hy, hm, 1) <= todayIso && guard++ < 60) { const back = (2026 - hy) * 12 + (11 - hm); sched.push({ id: iso(hy, hm, 1), ym: `${hy}-${String(hm).padStart(2, '0')}`, due: iso(hy, hm, 1), amount: l.rent, status: back < a ? 'overdue' : 'paid', hold: true }); hm++; if (hm > 12) { hm = 1; hy++; } } }
    const head = `<section class="card"><div class="row wrap" style="justify-content:space-between;gap:20px">
        <div class="stack-sm" style="gap:10px;min-width:0"><div class="row-sm wrap">${ui.idMono(l.id)}${ui.status(leaseState(l))}${a ? ui.badge(L(`${a} month(s) unpaid`, `${a} شهر غير مدفوع`), 'bad', 'alertCircle') : ''}${rn ? ui.badge(L('Renewal sent', 'أُرسل التجديد'), 'info', 'send') : ''}</div>
          <h1 style="font-size:24px">${esc(unitName(u))} <span class="faint" style="font-weight:600">· ${esc(tx(b.name))}</span></h1>
          <div class="row-sm" style="align-items:baseline"><b class="num" style="font-family:var(--font-display);font-size:28px">${money(l.rent)}</b><span class="faint small">/ ${L('month', 'شهر')}</span></div></div>
        <div class="row" style="gap:14px">${B.charts.ring(elapsed, { size: 76, color: l.status === 'active' ? '#36D6A0' : l.status === 'expiring' ? '#F2B35A' : '#E58A7B', label: `${Math.round(elapsed)}%` })}<div><div class="xs faint">${L('Term', 'المدة')}</div><b>${B.dateShort(l.start)} ${l.start.slice(0, 4)} – ${B.date(l.end)}</b><div class="xs muted">${B.inDays(l.end)}</div></div></div>
      </div>
      <div class="row wrap" style="margin-top:16px">${ui.btn(rn ? L('Revise renewal', 'تعديل التجديد') : L('Prepare renewal', 'إعداد التجديد'), { kind: 'primary', icon: 'refresh', act: 'mgRenew', arg: l.id })}${a ? ui.btn(L('Send reminder', 'إرسال تذكير'), { icon: 'bell', act: 'mgRemind', arg: l.id }) : ''}${a ? ui.btn(L('Record payment', 'تسجيل دفعة'), { icon: 'check', act: 'mgRecord', arg: l.id }) : ''}${ui.btn(L('Message tenant', 'مراسلة المستأجر'), { icon: 'chat', act: 'mgMessage', arg: l.tenant })}${ui.btn(L('Contract PDF', 'ملف العقد'), { icon: 'download', act: 'previewDoc', arg: `${l.id}.pdf` })}</div></section>`;
    const party = (p, role) => ui.li({ avatar: D.pname(p), title: esc(D.pname(p)), sub: `${role}${D.person(p).phone ? ` · <span class="ltr">${esc(D.person(p).phone)}</span>` : ''}`, act: 'mgMessage', arg: p, end: icon('chat', 'chev') });
    return `<div class="stack">${head}
      <div class="grid g-main"><div><div class="section-title"><h2>${L('Payment schedule', 'جدول الدفعات')}</h2>${a ? `<span class="small" style="color:var(--bad);font-weight:600">${money(outstanding(l))} ${L('outstanding', 'مستحق')}</span>` : `<span class="small mint-ink strong">${L('Up to date', 'منتظم')}</span>`}</div>
        ${xtable({ id: `mgSch${l.id}`, rows: sched.slice().reverse(), pageSize: 12, cols: [
          { key: 'ym', label: L('Month', 'الشهر'), m: 'title', render: (p) => `<b>${ymLabel(p.ym)}</b>${p.hold ? ` <span class="xs faint">${L('(holding over)', '(تمديد ضمني)')}</span>` : ''}` },
          { key: 'due', label: L('Due', 'الاستحقاق'), m: 'sub', render: (p) => `<span class="nowrap">${B.date(p.due)}</span>` },
          { key: 'status', label: L('Status', 'الحالة'), m: 'meta', render: (p) => ui.status(p.status) },
          { key: 'amount', label: L('Amount', 'المبلغ'), num: true, m: 'end', render: (p) => `<b class="num">${money(p.amount)}</b>` },
        ] })}</div>
        <div class="stack">
          ${ui.card({ title: L('Parties', 'الأطراف'), body: ui.list([party(l.tenant, L('Tenant', 'المستأجر')), party(l.owner, L('Owner (landlord)', 'المالك (المؤجر)')), ui.li({ icon: 'briefcase', tone: 'navy', title: L('Arkan Property Management', 'أركان لإدارة العقارات'), sub: L(`Managing agent · ${tx(leasingOf(l.building).n)}`, `الوكيل المدير · ${tx(leasingOf(l.building).n)}`) })]) })}
          ${ui.card({ title: L('Terms', 'الشروط'), body: ui.kv([[L('Start', 'البداية'), B.date(l.start)], [L('End', 'النهاية'), B.date(l.end)], [L('Rent due', 'موعد الدفع'), L(`Day ${l.payDay || 1}`, `اليوم ${l.payDay || 1}`)], [L('Deposit', 'التأمين'), money(l.deposit)], [L('Unit', 'الوحدة'), `<button data-go="${R}-unit-${u.id}" class="mg-link">${esc(unitName(u))}</button>`], [L('Service charge (owner)', 'رسوم الخدمات (المالك)'), money(u.charge)], l.autoRenewed ? [L('Auto-renewed', 'تجديد تلقائي'), B.date(addDays(l.autoRenewed, 1))] : null]) })}
          ${ui.card({ title: L('Activity', 'النشاط'), body: ui.timeline([rn ? { state: 'current', icon: 'send', title: L(`Renewal proposed at ${money(rn.rent)}`, `اقتراح تجديد بقيمة ${money(rn.rent)}`), meta: B.date(rn.sent) } : null, MX.reminded[l.id] ? { state: 'current', icon: 'bell', title: L('Payment reminder sent', 'أُرسل تذكير بالدفع'), meta: B.date(MX.reminded[l.id]) } : null, l.status !== 'active' ? { state: 'current', icon: 'clock', title: l.status === 'expired' ? L('Term ended — tenant holding over', 'انتهت المدة — تمديد ضمني') : L('Entered renewal window', 'دخل فترة التجديد'), meta: B.date(l.status === 'expired' ? l.end : addDays(l.end, -75)) } : null, { state: 'done', icon: 'play', title: L('Lease started', 'بدء العقد'), meta: B.date(l.start) }, { state: 'done', icon: 'edit', title: L('Signed by owner and tenant', 'وُقّع من المالك والمستأجر'), meta: B.date(addDays(l.start, -12)) }].filter(Boolean)) })}
        </div></div></div>`;
  };

  /* =====================================================================
   * 9 · Rent management (rent roll · billing runs · schedule)
   * ===================================================================== */
  MX.runs = MX.runs || {};
  const runsList = () => {
    const ids = sIds(); const out = [];
    for (let i = 7; i <= 12; i++) {
      const d = new Date(2026, i - 1, 1); const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const idx = MX.months.indexOf(ym);
      const f = idx >= 0 ? finSum(ids, idx) : null;
      const rent = f ? f.rentBilled : B.sum(sLeases().filter((l) => l.end >= `${ym}-01`), (l) => l.rent);
      const ch = f ? f.ch : B.sum(sUnits(), (u) => u.charge);
      const n = (f ? sLeases().filter((l) => l.start <= `${ym}-28`).length : sLeases().filter((l) => l.end >= `${ym}-01`).length) + sUnits().length;
      out.push({ id: `RUN-${ym}`, ym, date: `${ym}-01`, rent, ch, n, col: f ? (f.rentCol + f.chCol) / (f.rentBilled + f.ch) : 0, status: ym === '2026-12' ? (MX.runs[ym] ? 'mgPosted' : 'mgDraftRun') : 'mgPosted' });
    }
    return out;
  };
  P.rent = () => {
    crumbs({ label: L('Rent management', 'إدارة الإيجارات') });
    const view = B.get('mg:rv', 'roll');
    const ls = sLeases(); const roll = B.sum(ls, (l) => l.rent);
    const sqm = (k) => { const x = ls.filter((l) => (k === 'res' ? D.unit(l.unit).kind === 'apartment' : D.unit(l.unit).kind !== 'apartment')); return B.sum(x, (l) => l.rent) / (B.sum(x, (l) => D.unit(l.unit).area) || 1); };
    const runs = runsList(); const next = runs[runs.length - 1];
    const reviews = ls.filter((l) => { const d = B.daysFromToday(l.end); return d >= 0 && d <= 90; });
    let body = '';
    if (view === 'roll') {
      const q = B.get('mg:rq', ''); const k = B.get('mg:rk', 'all');
      const rows = ls.filter((l) => B.match(q, l.id, D.person(l.tenant).name, D.unit(l.unit).number) && (k === 'all' || (k === 'res' ? D.unit(l.unit).kind === 'apartment' : D.unit(l.unit).kind !== 'apartment')));
      body = `${fbar([ui.search('mg:rq', L('Tenant, unit or contract…', 'مستأجر أو وحدة أو عقد…'), { reset: 'mgRoll:page' }), scopeSelect(), ui.chips('mg:rk', [{ id: 'all', label: L('All', 'الكل') }, { id: 'res', label: L('Residential', 'سكني') }, { id: 'com', label: L('Commercial', 'تجاري') }], k)], exportBtn(L('Rent roll', 'كشف الإيجارات')))}
        ${xtable({ id: 'mgRoll', rows, pageSize: 25, maxH: 'calc(100vh - 340px)', defaultSort: 'unit', rowGo: (l) => `${R}-lease-${l.id}`,
          bulk: [{ label: L('Prepare renewal offers', 'إعداد عروض التجديد'), icon: 'refresh', act: 'mgRenewSel' }, { label: L('Export', 'تصدير'), icon: 'download', act: 'mgExportSel' }],
          cols: [
            { key: 'unit', label: L('Unit', 'الوحدة'), m: 'title', sort: (l) => l.building + String(D.unit(l.unit).floor).padStart(2, '0') + l.unit, render: (l) => unitCell(D.unit(l.unit)), mRender: (l) => `${esc(unitName(D.unit(l.unit)))} · ${esc(sName(l.building))}` },
            { key: 'tenant', label: L('Tenant', 'المستأجر'), m: 'sub', sort: (l) => D.pname(l.tenant), render: (l) => sub2(esc(D.pname(l.tenant)), ui.idMono(l.id)) },
            { key: 'area', label: L('m²', 'م²'), num: true, sort: (l) => D.unit(l.unit).area, m: 'hide', render: (l) => D.unit(l.unit).area, total: (rs) => B.num(B.sum(rs, (l) => D.unit(l.unit).area)) },
            { key: 'rent', label: L('Rent / mo', 'الإيجار الشهري'), num: true, sort: true, m: 'end', render: (l) => `<b class="num">${money(l.rent)}</b>`, total: (rs) => numc(B.sum(rs, (l) => l.rent)) },
            { key: 'psm', label: L('₪ / m²', '₪ / م²'), num: true, sort: (l) => l.rent / D.unit(l.unit).area, m: 'meta', render: (l) => B.num1(l.rent / D.unit(l.unit).area) },
            { key: 'annual', label: L('Annual', 'سنوياً'), num: true, wide: true, sort: (l) => l.rent, m: 'hide', render: (l) => numc(l.rent * 12), total: (rs) => numc(B.sum(rs, (l) => l.rent * 12)) },
            { key: 'due', label: L('Due day', 'يوم الاستحقاق'), num: true, wide: true, m: 'hide', render: (l) => l.payDay || 1 },
            { key: 'review', label: L('Next review', 'المراجعة القادمة'), sort: (l) => l.end, m: 'meta', render: (l) => `<span class="nowrap">${B.dateShort(addDays(l.end, 1))} ${addDays(l.end, 1).slice(0, 4)}</span>` },
            { key: 'esc', label: L('Escalation', 'الزيادة'), m: 'hide', render: (l) => (D.unit(l.unit).kind === 'apartment' ? L('3% at renewal', '3% عند التجديد') : L('5% / 2 yrs', '5% / سنتان')) },
            { key: 'deposit', label: L('Deposit', 'التأمين'), num: true, wide: true, sort: true, m: 'hide', render: (l) => numc(l.deposit), total: (rs) => numc(B.sum(rs, (l) => l.deposit)) },
          ] })}`;
    } else if (view === 'runs') {
      const sel = B.get('mg:run', next.id); const r = runs.find((x) => x.id === sel) || next;
      const byB = sIds().map((bid) => { const idx = MX.months.indexOf(r.ym); const f = idx >= 0 ? finM(bid, idx) : null; return { id: bid, rent: f ? f.rentBilled : B.sum(D.leases.filter((l) => l.building === bid && l.end >= `${r.ym}-01`), (l) => l.rent), ch: f ? f.ch : chargesOf(bid) }; });
      body = `<div class="mg-split">${xtable({ id: 'mgRuns', rows: runs.slice().reverse(), active: r.id, rowAct: (x) => ({ act: 'set', arg: `mg:run=${x.id}` }), caption: `<span>${L('Billing runs issue rent invoices to tenants and service-charge invoices to owners on the 1st of each month.', 'تُصدر دورات الفوترة فواتير الإيجار للمستأجرين ورسوم الخدمات للمالكين في الأول من كل شهر.')}</span>`, cols: [
          { key: 'id', label: L('Run', 'الدورة'), m: 'title', render: (x) => sub2(ymLabel(x.ym), ui.idMono(x.id)) },
          { key: 'date', label: L('Run date', 'تاريخ الدورة'), m: 'meta', render: (x) => `<span class="nowrap">${B.date(x.date)}</span>` },
          { key: 'n', label: L('Invoices', 'الفواتير'), num: true, m: 'meta', render: (x) => x.n },
          { key: 'rent', label: L('Rent', 'الإيجار'), num: true, m: 'hide', render: (x) => numc(x.rent) },
          { key: 'ch', label: L('Service charges', 'رسوم الخدمات'), num: true, m: 'hide', render: (x) => numc(x.ch) },
          { key: 'col', label: L('Collected', 'المحصّل'), num: true, m: 'hide', render: (x) => (x.col ? pct1(x.col * 100) : '<span class="faint">—</span>') },
          { key: 'status', label: L('Status', 'الحالة'), m: 'end', render: (x) => ui.status(x.status) },
        ] })}
        ${panel({ eyebrow: ui.idMono(r.id), title: L(`Billing run — ${ymLabel(r.ym)}`, `دورة الفوترة — ${ymLabel(r.ym)}`), sub: `${ui.statusLabel(r.status)} · ${B.date(r.date)}`, body: `${pstats([[r.n, L('invoices', 'فاتورة')], [moneyC(r.rent), L('rent', 'إيجار')], [moneyC(r.ch), L('service charges', 'رسوم خدمات')]])}
          ${psec(L('By building', 'حسب المبنى'), `<table class="mg-fin"><thead><tr><th>${L('Building', 'المبنى')}</th><th>${L('Rent', 'الإيجار')}</th><th>${L('Charges', 'الرسوم')}</th></tr></thead><tbody>${byB.map((x) => `<tr><td>${esc(sName(x.id))}</td><td>${money(x.rent)}</td><td>${money(x.ch)}</td></tr>`).join('')}<tr class="tot"><td>${L('Total', 'الإجمالي')}</td><td>${money(r.rent)}</td><td>${money(r.ch)}</td></tr></tbody></table>`)}
          ${r.status === 'mgDraftRun' ? ui.callout(L('Draft run: invoices are generated from active leases and the approved service-charge tariff. Review exceptions before posting.', 'دورة مسودة: تُنشأ الفواتير من العقود السارية وتعرفة رسوم الخدمات المعتمدة. راجع الاستثناءات قبل الترحيل.'), 'warn', 'info') : ui.callout(L('Posted — invoices were delivered to tenants and owners in the BENA app (simulated).', 'مُرحّلة — سُلّمت الفواتير للمستأجرين والمالكين في تطبيق بينا (محاكاة).'), 'mint', 'check')}`,
          foot: r.status === 'mgDraftRun' ? `${ui.btn(L('Preview invoices', 'معاينة الفواتير'), { icon: 'eye', act: 'previewDoc', arg: L(`Invoices — ${ymLabel(r.ym)} (draft)`, `الفواتير — ${ymLabel(r.ym)} (مسودة)`) })}${ui.btn(L('Post run', 'ترحيل الدورة'), { kind: 'primary', icon: 'check', act: 'mgPostRun', arg: r.ym })}` : `${ui.btn(L('Invoice register', 'سجل الفواتير'), { icon: 'doc', act: 'previewDoc', arg: L(`Invoice register — ${ymLabel(r.ym)}`, `سجل الفواتير — ${ymLabel(r.ym)}`) })}${ui.btn(L('Export', 'تصدير'), { icon: 'download', act: 'mgExport', arg: r.id })}` })}</div>`;
    } else {
      const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(2026, 11 + i, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; });
      const contracted = months.map((ym) => B.sum(ls.filter((l) => l.end >= `${ym}-01`), (l) => l.rent));
      const atRisk = months.map((ym, i) => roll - contracted[i]);
      const changes = ls.filter((l) => l.end >= todayIso && l.end <= '2027-05-31').sort(B.by('end'));
      body = `<div class="grid g-main">${ui.card({ cls: 'mg-chart', title: L('Scheduled rent · next 6 months', 'الإيجار المجدول · الأشهر الستة القادمة'), sub: L('Contracted vs. subject to renewal', 'المتعاقد عليه مقابل الخاضع للتجديد'), body: B.charts.bars({ labels: months.map((ym) => B.mon(+ym.slice(5) - 1)), series: [{ name: L('Contracted', 'متعاقد عليه'), color: '#142B3B', values: contracted }, { name: L('Subject to renewal', 'خاضع للتجديد'), color: '#F2B35A', values: atRisk }], height: 220 }) })}
        ${ui.card({ title: L('Collection calendar', 'تقويم التحصيل'), body: ui.kv([[L('Rent due', 'استحقاق الإيجار'), L('1st of each month', 'الأول من كل شهر')], [L('Grace period', 'فترة السماح'), L('7 days', '7 أيام')], [L('Reminder 1 (app + SMS)', 'التذكير 1 (تطبيق + رسالة)'), L('Day 8', 'اليوم 8')], [L('Reminder 2', 'التذكير 2'), L('Day 15', 'اليوم 15')], [L('Formal notice', 'إشعار رسمي'), L('Day 35', 'اليوم 35')], [L('Owner escalation', 'تصعيد للمالك'), L('Day 60', 'اليوم 60')]]) })}</div>
        <div style="height:16px"></div>
        ${xtable({ id: 'mgRentChg', rows: changes, pageSize: 15, rowGo: (l) => `${R}-lease-${l.id}`, caption: `<span><b>${changes.length}</b> ${L('scheduled changes until May 2027 — lease ends and renewal reviews', 'تغييرات مجدولة حتى أيار 2027 — انتهاء العقود ومراجعات التجديد')}</span>`, cols: [
          { key: 'end', label: L('Effective', 'السريان'), sort: true, m: 'meta', render: (l) => `<span class="nowrap">${B.date(addDays(l.end, 1))}</span>` },
          { key: 'unit', label: L('Unit', 'الوحدة'), m: 'title', render: (l) => unitCell(D.unit(l.unit)), mRender: (l) => esc(unitName(D.unit(l.unit))) },
          { key: 'tenant', label: L('Tenant', 'المستأجر'), m: 'sub', render: (l) => esc(D.pname(l.tenant)) },
          { key: 'cur', label: L('Current', 'الحالي'), num: true, m: 'meta', render: (l) => numc(l.rent) },
          { key: 'prop', label: L('Proposed', 'المقترح'), num: true, m: 'end', render: (l) => { const r = (MX.renewals || {})[l.id]; const v = r ? r.rent : Math.round((l.rent * 1.03) / 50) * 50; return `<b class="num">${money(v)}</b>${r ? '' : ` <span class="xs faint">${L('(+3% default)', '(+3% افتراضي)')}</span>`}`; } },
          { key: 'st', label: L('Stage', 'المرحلة'), m: 'hide', render: (l) => ((MX.renewals || {})[l.id] ? ui.badge(L('Offer sent', 'أُرسل العرض'), 'info', 'send') : ui.status(leaseState(l))) },
        ] })}`;
    }
    return `${phead({ title: L('Rent management', 'إدارة الإيجارات'), sub: L('Rent roll, monthly billing runs and the forward rent schedule.', 'كشف الإيجارات ودورات الفوترة الشهرية والجدول المستقبلي للإيجار.'), actions: `${ui.btn(L('Billing run · Dec', 'دورة الفوترة · ك١'), { kind: 'primary', icon: 'receipt', act: 'set', arg: 'mg:rv=runs' })}` })}
      <div class="stack">${kband([
        kb('wallet', L('Monthly rent roll', 'الإيجار الشهري'), moneyC(roll), L(`${ls.length} leases`, `${ls.length} عقداً`)),
        kb('trend', L('Annualised', 'سنوياً'), moneyC(roll * 12), L('contracted rent', 'إيجار متعاقد عليه')),
        kb('ruler', L('Residential ₪/m²', 'السكني ₪/م²'), B.num1(sqm('res')), L('per month', 'شهرياً')),
        kb('store', L('Commercial ₪/m²', 'التجاري ₪/م²'), B.num1(sqm('com')), L('per month', 'شهرياً')),
        kb('receipt', L('Next run · 1 Dec', 'الدورة القادمة · 1 ك١'), moneyC(next.rent + next.ch), L(`${next.n} invoices · ${ui.statusLabel(next.status)}`, `${next.n} فاتورة · ${ui.statusLabel(next.status)}`), next.status === 'mgDraftRun' ? 'warn' : 'ok'),
      ], 5)}
      <div>${ui.tabs('mg:rv', [{ id: 'roll', label: L('Rent roll', 'كشف الإيجارات'), icon: 'list' }, { id: 'runs', label: L('Billing runs', 'دورات الفوترة'), icon: 'receipt', count: runs.filter((x) => x.status === 'mgDraftRun').length || null }, { id: 'schedule', label: L('Schedule', 'الجدول'), icon: 'calendar', count: reviews.length }], view)}</div>${body}</div>`;
  };
  B.act.mgPostRun = (ym) => B.confirm({ title: L(`Post the ${ymLabel(ym)} billing run?`, `ترحيل دورة فوترة ${ymLabel(ym)}؟`), text: L('Invoices are issued to tenants (rent) and owners (service charges) and appear in the BENA apps. This is simulated.', 'تُصدر الفواتير للمستأجرين (الإيجار) والمالكين (رسوم الخدمات) وتظهر في تطبيقات بينا. هذا محاكاة.'), ok: L('Post run', 'ترحيل'), onOk: () => { MX.runs[ym] = todayIso; B.success({ title: L('Billing run posted', 'تم ترحيل دورة الفوترة'), ref: `RUN-${ym}` }); B.refresh(); } });

  /* =====================================================================
   * 10 · Receivables (ageing · collections pipeline · reminders)
   * ===================================================================== */
  const STAGES = [
    { id: 'due', n: T('Reminder due', 'تذكير مستحق'), icon: 'bell' },
    { id: 'reminded', n: T('Reminded', 'تم التذكير'), icon: 'send' },
    { id: 'notice', n: T('Formal notice', 'إشعار رسمي'), icon: 'doc' },
    { id: 'plan', n: T('Payment plan', 'خطة سداد'), icon: 'calendar' },
    { id: 'legal', n: T('Legal referral', 'إحالة قانونية'), icon: 'gavel' },
  ];
  const BUCKETS = [{ id: 'b1', n: T('1–30 days', '1–30 يوماً'), a: 1, b: 30 }, { id: 'b2', n: T('31–60 days', '31–60 يوماً'), a: 31, b: 60 }, { id: 'b3', n: T('61–90 days', '61–90 يوماً'), a: 61, b: 90 }, { id: 'b4', n: T('90+ days', '+90 يوماً'), a: 91, b: 99999 }];
  const recItems = () => {
    const out = [];
    sLeases().filter((l) => arrears(l) > 0).forEach((l) => {
      const a = arrears(l); const days = daysLate(l);
      const st = MX.reminded[l.id] ? 'reminded' : a === 1 ? 'due' : a === 2 ? 'notice' : seedOf(l.id) % 2 ? 'legal' : 'plan';
      out.push({ id: l.id, kind: 'rent', party: l.tenant, unit: l.unit, b: l.building, amount: outstanding(l), months: a, days, stage: st, lease: l });
    });
    sUnits().filter((u) => scArrears(u) > 0).forEach((u) => {
      const a = scArrears(u); const days = B.daysBetween(iso(2026, 12 - a, 5), todayIso);
      out.push({ id: `SC-${u.id}`, kind: 'sc', party: u.owner, unit: u.id, b: u.building, amount: a * u.charge, months: a, days, stage: (MX.scRem || {})[u.id] ? 'reminded' : a >= 4 ? 'notice' : 'due' });
    });
    return out;
  };
  MX.scRem = MX.scRem || {};
  P.receivables = () => {
    crumbs({ label: L('Receivables', 'الذمم المدينة') });
    const all = recItems();
    const bk = B.get('mg:rb', 'all'), stf = B.get('mg:rst', 'all'), kf = B.get('mg:rkf', 'all'), q = B.get('mg:rcq', '');
    const inB = (x, id) => { const k = BUCKETS.find((b) => b.id === id); return x.days >= k.a && x.days <= k.b; };
    const rows = all.filter((x) => (bk === 'all' || inB(x, bk)) && (stf === 'all' || x.stage === stf) && (kf === 'all' || x.kind === kf) && B.match(q, D.person(x.party).name, x.id, D.unit(x.unit).number)).sort(B.by('amount', -1));
    const tot = B.sum(all, (x) => x.amount);
    const nov = finSum(sIds(), 11);
    const dso = Math.round((B.sum(all, (x) => x.amount) / ((nov.rentBilled + nov.ch) || 1)) * 30);
    const ageCard = (k) => { const its = all.filter((x) => inB(x, k.id)); const r = B.sum(its.filter((x) => x.kind === 'rent'), (x) => x.amount), s = B.sum(its.filter((x) => x.kind === 'sc'), (x) => x.amount);
      return `<button data-act="set" data-arg="mg:rb=${bk === k.id ? 'all' : k.id}" style="${bk === k.id ? 'box-shadow:inset 0 -3px 0 var(--mint-ink)' : ''}"><div class="kb-l">${icon('clock')}<span>${tx(k.n)}</span></div><div class="kb-v">${moneyC(r + s)}</div><div class="mg-bar" style="margin:8px 0 6px"><i style="width:${tot ? ((r) / tot) * 100 : 0}%;background:var(--navy)"></i><i style="width:${tot ? (s / tot) * 100 : 0}%;background:#7FA7C2"></i></div><div class="kb-f">${L(`${its.length} accounts`, `${its.length} حسابات`)}</div></button>`; };
    const sel = B.get('mg:rsel', '') || (rows[0] && rows[0].id); const cur = all.find((x) => x.id === sel);
    let pn = '';
    if (cur) {
      const u = D.unit(cur.unit);
      const log = [
        cur.kind === 'rent' && MX.reminded[cur.id] ? { state: 'current', icon: 'bell', title: L('Reminder sent (app + SMS)', 'أُرسل تذكير (تطبيق + رسالة)'), meta: B.date(MX.reminded[cur.id]) } : null,
        cur.kind === 'sc' && MX.scRem[u.id] ? { state: 'current', icon: 'bell', title: L('Service-charge reminder sent', 'أُرسل تذكير برسوم الخدمات'), meta: B.date(MX.scRem[u.id]) } : null,
        cur.months >= 2 ? { state: 'done', icon: 'doc', title: L('Formal notice issued', 'صدر إشعار رسمي'), meta: B.date(addDays(todayIso, -6)) } : null,
        { state: 'done', icon: 'send', title: L('Automatic reminder — day 8', 'تذكير تلقائي — اليوم 8'), meta: B.date(iso(2026, 11, 8)) },
        { state: 'done', icon: 'receipt', title: L('Invoice issued', 'صدرت الفاتورة'), meta: B.date(iso(2026, 12 - cur.months, 1)) },
      ].filter(Boolean);
      pn = panel({ eyebrow: cur.kind === 'rent' ? L('Rent arrears', 'متأخرات إيجار') : L('Service-charge arrears', 'متأخرات رسوم خدمات'), title: esc(D.pname(cur.party)), sub: `${esc(unitName(u))} · ${esc(sName(cur.b))}`, lead: ui.avatar(D.pname(cur.party)), close: 'mg:rsel', body: `
          ${pstats([[moneyC(cur.amount), L('outstanding', 'مستحق')], [cur.months, L('months', 'أشهر')], [cur.days, L('days late', 'أيام تأخير')]])}
          ${psec(L('Collection stage', 'مرحلة التحصيل'), `<div class="mg-steps">${STAGES.map((s, i) => { const ci = STAGES.findIndex((x) => x.id === cur.stage); return `<div class="${i < ci ? 'done' : i === ci ? 'cur' : 'todo'}"><i>${i < ci ? icon('check') : i + 1}</i><span>${tx(s.n)}</span></div>`; }).join('')}</div>`)}
          ${psec(L('Activity', 'النشاط'), ui.timeline(log))}
          ${cur.kind === 'sc' ? ui.callout(L('Service charges are billed to the owner, not the tenant.', 'تُفوتر رسوم الخدمات على المالك وليس على المستأجر.'), '', 'info') : ''}`,
        foot: cur.kind === 'rent' ? `${ui.btn(L('Remind', 'تذكير'), { icon: 'bell', act: 'mgRemind', arg: cur.id })}${ui.btn(L('Record payment', 'تسجيل دفعة'), { kind: 'primary', icon: 'check', act: 'mgRecord', arg: cur.id })}${ui.btn(L('Offer payment plan', 'عرض خطة سداد'), { icon: 'calendar', act: 'soon', arg: L('Payment plans', 'خطط السداد') })}` : `${ui.btn(L('Remind owner', 'تذكير المالك'), { icon: 'bell', act: 'mgScRemind', arg: u.id })}${ui.btn(L('Record payment', 'تسجيل دفعة'), { kind: 'primary', icon: 'check', act: 'mgScPaid', arg: u.id })}` });
    }
    return `${phead({ title: L('Receivables', 'الذمم المدينة'), sub: L('Rent and service-charge arrears — ageing, collections pipeline and reminders.', 'متأخرات الإيجار ورسوم الخدمات — الأعمار ومسار التحصيل والتذكيرات.'), actions: `${exportBtn(L('Arrears ageing', 'أعمار الذمم'))}${ui.btn(L('Remind all rent arrears', 'تذكير جميع متأخري الإيجار'), { kind: 'primary', icon: 'bell', act: 'mgRemindAll' })}` })}
      <div class="stack">
      ${kband([kb('alertCircle', L('Total outstanding', 'إجمالي المستحق'), moneyC(tot), L(`${all.length} accounts`, `${all.length} حسابات`), 'bad'), kb('contract', L('Rent arrears', 'متأخرات الإيجار'), moneyC(B.sum(all.filter((x) => x.kind === 'rent'), (x) => x.amount)), L(`${all.filter((x) => x.kind === 'rent').length} tenants`, `${all.filter((x) => x.kind === 'rent').length} مستأجرين`)), kb('receipt', L('Service-charge arrears', 'متأخرات رسوم الخدمات'), moneyC(B.sum(all.filter((x) => x.kind === 'sc'), (x) => x.amount)), L(`${all.filter((x) => x.kind === 'sc').length} owners`, `${all.filter((x) => x.kind === 'sc').length} مالكين`)), kb('percent', L('Collection rate · Nov', 'نسبة التحصيل · ت٢'), pct1(((nov.rentCol + nov.chCol) / ((nov.rentBilled + nov.ch) || 1)) * 100), L('rent + service charges', 'الإيجار + الرسوم')), kb('clock', L('Days sales outstanding', 'أيام التحصيل'), `${dso}<small>${L('days', 'يوماً')}</small>`, L('target ≤ 5', 'الهدف ≤ 5'), dso > 5 ? 'warn' : 'ok')], 5)}
      <section class="card mg-kband" style="--c:4">${BUCKETS.map(ageCard).join('')}</section>
      <div class="mg-legend"><span><i style="background:var(--navy)"></i>${L('Rent (tenants)', 'الإيجار (المستأجرون)')}</span><span><i style="background:#7FA7C2"></i>${L('Service charges (owners)', 'رسوم الخدمات (المالكون)')}</span><span class="faint">${L('Click an age bucket to filter', 'اضغط على فئة عمرية للتصفية')}</span></div>
      <div class="mg-board mg-pipe" style="--n:5">${STAGES.map((s) => { const its = all.filter((x) => x.stage === s.id); return `<button class="mg-col" style="text-align:start;${stf === s.id ? 'border-color:var(--navy);box-shadow:0 0 0 1px var(--navy) inset' : ''}" data-act="set" data-arg="mg:rst=${stf === s.id ? 'all' : s.id}"><div class="cl-h"><span class="row-sm">${icon(s.icon, 'mg-i14')}${tx(s.n)}</span><span class="c">${its.length}</span></div><div class="cl-s" style="margin-top:0"><b class="num" style="font-size:16px;color:var(--ink)">${money(B.sum(its, (x) => x.amount))}</b></div></button>`; }).join('')}</div>
      ${fbar([ui.search('mg:rcq', L('Name, unit or contract…', 'الاسم أو الوحدة أو العقد…'), { reset: 'mgArr:page' }), scopeSelect(), ui.chips('mg:rkf', [{ id: 'all', label: L('All types', 'كل الأنواع') }, { id: 'rent', label: L('Rent', 'الإيجار') }, { id: 'sc', label: L('Service charges', 'رسوم الخدمات') }], kf)], (bk !== 'all' || stf !== 'all') ? `<button class="btn btn-text btn-sm" data-act="mgClearRec">${icon('x')}${L('Clear filters', 'مسح عوامل التصفية')}</button>` : '')}
      <div class="mg-split">${xtable({ id: 'mgArr', rows, pageSize: 20, active: cur && cur.id, rowAct: (x) => ({ act: 'set', arg: `mg:rsel=${x.id}` }), empty: { icon: 'checkCircle', title: L('No arrears here', 'لا توجد متأخرات'), text: L('Every account in this view is up to date.', 'جميع الحسابات في هذا العرض منتظمة.') },
        bulk: [{ label: L('Send reminders', 'إرسال تذكيرات'), icon: 'bell', act: 'mgRecRemind' }, { label: L('Export', 'تصدير'), icon: 'download', act: 'mgExportSel' }],
        cols: [
          { key: 'party', label: L('Account', 'الحساب'), m: 'title', sort: (x) => D.pname(x.party), render: (x) => `<div class="cell-main">${ui.avatar(D.pname(x.party), 'sm')}${sub2(esc(D.pname(x.party)), x.kind === 'rent' ? ui.idMono(x.id) : L('Owner · service charges', 'مالك · رسوم خدمات'))}</div>`, mRender: (x) => esc(D.pname(x.party)) },
          { key: 'unit', label: L('Unit', 'الوحدة'), mid: true, m: 'sub', render: (x) => sub2(esc(unitName(D.unit(x.unit))), esc(sName(x.b))) },
          { key: 'kind', label: L('Type', 'النوع'), wide: true, m: 'hide', render: (x) => (x.kind === 'rent' ? ui.badge(L('Rent', 'إيجار'), 'navy') : ui.badge(L('Service charge', 'رسوم خدمات'), 'outline')) },
          { key: 'days', label: L('Days', 'الأيام'), num: true, sort: true, m: 'meta', render: (x) => `<span class="num" style="font-weight:600;color:${x.days > 60 ? 'var(--bad)' : x.days > 30 ? 'var(--warn)' : 'var(--text-2)'}">${x.days}</span>` },
          { key: 'stage', label: L('Stage', 'المرحلة'), sort: (x) => STAGES.findIndex((s) => s.id === x.stage), m: 'meta', render: (x) => { const s = STAGES.find((k) => k.id === x.stage); return ui.badge(s.n, x.stage === 'legal' ? 'bad' : x.stage === 'notice' ? 'warn' : x.stage === 'plan' ? 'violet' : x.stage === 'reminded' ? 'info' : 'neutral', s.icon); } },
          { key: 'amount', label: L('Outstanding', 'المستحق'), num: true, sort: true, m: 'end', render: (x) => `<b class="num" style="color:var(--bad)">${money(x.amount)}</b>`, total: (rs) => `<span style="color:var(--bad)">${money(B.sum(rs, (x) => x.amount))}</span>` },
        ] })}${pn}</div>
      </div>`;
  };
  P.payments = () => { B.navActive('receivables'); return P.receivables(); };
  B.act.mgClearRec = () => { ['mg:rb', 'mg:rst', 'mg:rkf', 'mg:rcq'].forEach((k) => delete B.vs[k]); B.refresh(); };
  B.act.mgRecRemind = (ids) => { const list = String(ids).split(','); list.filter((x) => x.startsWith('SC-')).forEach((x) => { MX.scRem[x.slice(3)] = todayIso; }); const ls = list.filter((x) => !x.startsWith('SC-')).map((x) => D.lease(x)).filter(Boolean); if (ls.length) remindMany(ls); else { B.vs['mgArr:sel'] = []; B.success({ title: L('Owner reminders sent', 'أُرسلت تذكيرات المالكين'), ref: B.uid('BATCH') }); B.refresh(); } };
  B.act.mgScRemind = (uid) => { MX.scRem[uid] = todayIso; B.toast(L('Reminder sent to the owner', 'أُرسل تذكير إلى المالك')); B.refresh(); };
  B.act.mgScPaid = (uid) => B.confirm({ title: L('Record service-charge payment?', 'تسجيل دفعة رسوم الخدمات؟'), text: L('Marks the full balance as received and issues a receipt to the owner.', 'يعلّم الرصيد كاملاً كمستلم ويصدر إيصالاً للمالك.'), ok: L('Record', 'تسجيل'), onOk: () => { MX.scPaid[uid] = todayIso; B.vs['mg:rsel'] = ''; B.success({ title: L('Payment recorded', 'تم تسجيل الدفعة'), ref: B.uid('RC') }); B.refresh(); } });

  /* =====================================================================
   * 11 · Service charges
   * ===================================================================== */
  P.charges = () => {
    crumbs({ label: L('Service charges', 'رسوم الخدمات') });
    const ids = sIds();
    const rows = ids.map((bid) => { const ch = chargesOf(bid); const ytdA = B.sum(YTD_I, (j) => finM(bid, j).opex); const col = B.sum(YTD_I, (j) => finM(bid, j).chCol); const us = D.unitsOf(bid); return { id: bid, ch, budget: ch * 12, ytdA, ytdB: ch * 11, col, rate: col / (ch * 11), arr: B.sum(us, (u) => scArrears(u) * u.charge), fund: col - ytdA, units: us.length }; });
    const cur = scope() !== 'all' ? scope() : (B.get('mg:scb', '') && ids.includes(B.get('mg:scb')) ? B.get('mg:scb') : ids[0]);
    return `${phead({ title: L('Service charges', 'رسوم الخدمات'), sub: L('Common-area budgets, charges billed to owners, allocation and fund balance per building.', 'موازنات المناطق المشتركة والرسوم المفوترة على المالكين والتوزيع ورصيد الصندوق لكل مبنى.'), actions: `${exportBtn(L('Service charge statement', 'كشف رسوم الخدمات'))}` })}
      <div class="stack">
      ${ids.length > 1 ? xtable({ id: 'mgScAll', rows, active: cur, rowAct: (x) => ({ act: 'set', arg: `mg:scb=${x.id}` }), caption: `<span>${L('Portfolio summary · Jan–Nov 2026 · click a building for its budget and per-unit charges', 'ملخص المحفظة · كانون الثاني–تشرين الثاني 2026 · اضغط على مبنى لعرض موازنته ورسوم وحداته')}</span>`, cols: [
        { key: 'id', label: L('Building', 'المبنى'), m: 'title', sort: (x) => sName(x.id), render: (x) => sub2(esc(sName(x.id)), L(`${x.units} units`, `${x.units} وحدة`)) },
        { key: 'ch', label: L('Billed / month', 'المفوتر شهرياً'), num: true, sort: true, m: 'meta', render: (x) => numc(x.ch), total: (rs) => numc(B.sum(rs, (x) => x.ch)) },
        { key: 'budget', label: L('Budget 2026', 'موازنة 2026'), num: true, sort: true, m: 'hide', render: (x) => numc(x.budget), total: (rs) => numc(B.sum(rs, (x) => x.budget)) },
        { key: 'ytdA', label: L('Spent YTD', 'المنفق'), num: true, sort: true, m: 'meta', render: (x) => numc(x.ytdA), total: (rs) => numc(B.sum(rs, (x) => x.ytdA)) },
        { key: 'var', label: L('vs budget', 'مقابل الموازنة'), num: true, sort: (x) => x.ytdA / x.ytdB, m: 'hide', render: (x) => { const d = ((x.ytdA - x.ytdB) / x.ytdB) * 100; return `<span class="num" style="color:${d > 3 ? 'var(--bad)' : d < -3 ? 'var(--ok)' : 'var(--text-2)'}">${d > 0 ? '+' : ''}${B.num1(d)}%</span>`; } },
        { key: 'rate', label: L('Collected', 'المحصّل'), num: true, sort: true, m: 'hide', render: (x) => pct1(x.rate * 100) },
        { key: 'arr', label: L('Owner arrears', 'متأخرات المالكين'), num: true, sort: true, m: 'hide', render: (x) => (x.arr ? `<span class="num" style="color:var(--bad);font-weight:600">${money(x.arr)}</span>` : '—'), total: (rs) => `<span style="color:var(--bad)">${money(B.sum(rs, (x) => x.arr))}</span>` },
        { key: 'fund', label: L('Fund balance', 'رصيد الصندوق'), num: true, sort: true, m: 'end', render: (x) => `<b class="num" style="color:${x.fund < 0 ? 'var(--bad)' : 'var(--ink)'}">${sgn(x.fund)}</b>`, total: (rs) => sgn(B.sum(rs, (x) => x.fund)) },
      ] }) : ''}
      <div class="section-title"><h2>${esc(tx(bld(cur).name))}</h2>${ui.btn(L('Building workspace', 'مساحة عمل المبنى'), { size: 'sm', icon: 'building', go: `${R}-workspace-${cur}` })}</div>
      ${chargesBuilding(cur)}
      ${ui.demoNote(L('Budgets, expenses and balances are simulated sample figures that reconcile across this prototype.', 'الموازنات والمصاريف والأرصدة أرقام نموذجية محاكاة متسقة عبر هذا النموذج.'))}
      </div>`;
  };

  /* =====================================================================
   * 12 · Maintenance requests (board · table · detail panel)
   * ===================================================================== */
  P.maintenance = () => {
    crumbs({ label: L('Maintenance requests', 'طلبات الصيانة') });
    const COLSX = [
      { id: 'new', label: L('New', 'جديد'), match: ['open', 'new', 'quoted'] },
      { id: 'assigned', label: L('Assigned & scheduled', 'مُسند ومجدول'), match: ['assigned', 'scheduled'] },
      { id: 'inProgress', label: L('In progress', 'قيد التنفيذ'), match: ['inProgress'] },
      { id: 'done', label: L('Completed', 'مكتمل'), match: ['completed', 'resolved'] },
    ];
    const view = B.get('mg:mv', 'board'); const cf = B.get('mg:mcat', 'all'); const pr = B.get('mg:mpr', 'all'); const q = B.get('mg:mq', '');
    const base = D.requests.filter((r) => inScope(r.building));
    const reqs = base.filter((r) => (cf === 'all' || r.cat === cf) && (pr === 'all' || r.priority === pr) && B.match(q, r.id, r.title));
    const open = base.filter((r) => openStatuses.includes(r.status));
    const sel = B.get('mg:msel', '') || (reqs.find((r) => openStatuses.includes(r.status)) || reqs[0] || {}).id; const cur = D.request(sel);
    const mcol = B.get('mg:mc', 'new');
    const card = (r) => `<button class="mg-req ${cur && cur.id === r.id ? 'on' : ''}" data-act="set" data-arg="mg:msel=${r.id}">
        <div class="row between" style="gap:8px"><span class="rq-cat">${icon(catIcon(r.cat))}${esc(tx(D.cat(r.cat).name))}</span>${ui.status(r.priority)}</div>
        <div class="rq-t">${esc(tx(r.title))}</div>
        <div class="rq-m"><span>${esc(sName(r.building))}</span><span>${r.unit ? esc(unitName(D.unit(r.unit))) : L('Common area', 'منطقة مشتركة')}</span><span>${ui.idMono(r.id)}</span></div>
        <div class="rq-f">${r.provider ? `<span class="row-sm" style="min-width:0">${ui.avatar(tx(D.provider(r.provider).name), 'sm')}<span class="truncate">${esc(tx(D.provider(r.provider).name))}</span></span>` : `<span class="faint">${L('Unassigned', 'غير مُسند')} · ${B.ago(r.created)}</span>`}<span class="xs faint nowrap">${r.visit && openStatuses.includes(r.status) ? `${icon('calendar', 'mg-i14')} ${B.dateShort(r.visit)}` : r.closed ? B.dateShort(r.closed) : ''}</span></div></button>`;
    let pn = '';
    if (cur && inScope(cur.building)) {
      const tl = [{ state: 'done', icon: 'plus', title: L('Request created', 'إنشاء الطلب'), meta: `${B.date(cur.created)} · ${esc(D.pname(cur.by))}` }];
      if (cur.provider) tl.push({ state: 'done', icon: 'userCheck', title: L(`Assigned to ${tx(D.provider(cur.provider).name)}`, `أُسند إلى ${tx(D.provider(cur.provider).name)}`), meta: `${L('by', 'بواسطة')} ${esc(tx(pmOf(cur.building).n))}` });
      if (cur.visit) tl.push({ state: cur.status === 'completed' ? 'done' : 'current', icon: 'calendar', title: L('Visit scheduled', 'موعد الزيارة'), meta: B.date(cur.visit) });
      if (cur.status === 'inProgress') tl.push({ state: 'current', icon: 'wrench', title: L('Work in progress', 'العمل جارٍ'), meta: L('Provider on site', 'المزوّد في الموقع') });
      if (cur.status === 'completed') tl.push({ state: 'done', icon: 'check', title: L('Completed', 'مكتمل'), meta: `${B.date(cur.closed)}${cur.rating ? ` · ★ ${cur.rating}` : ''}` });
      const nextAct = ['open', 'new', 'quoted'].includes(cur.status) ? ui.btn(L('Assign provider', 'إسناد مزوّد'), { kind: 'primary', icon: 'userPlus', act: 'mgAssign', arg: cur.id }) : ['assigned', 'scheduled'].includes(cur.status) ? ui.btn(L('Mark started', 'بدء العمل'), { kind: 'primary', icon: 'play', act: 'mgAdvance', arg: cur.id }) : cur.status === 'inProgress' ? ui.btn(L('Mark completed', 'تعليم كمكتمل'), { kind: 'primary', icon: 'check', act: 'mgAdvance', arg: cur.id }) : ui.btn(L('Job report', 'تقرير العمل'), { icon: 'doc', act: 'previewDoc', arg: `${cur.id} — ${tx(cur.title)}` });
      pn = panel({ eyebrow: `${ui.idMono(cur.id)}`, title: esc(tx(cur.title)), sub: `${esc(sName(cur.building))} · ${cur.unit ? esc(unitName(D.unit(cur.unit))) : L('Common area', 'منطقة مشتركة')}`, close: 'mg:msel', body: `
          <div class="row-sm wrap">${ui.status(cur.status)}${ui.status(cur.priority)}${ui.badge(D.cat(cur.cat).name, 'outline', catIcon(cur.cat))}</div>
          ${cur.desc ? `<p class="small muted" style="line-height:1.55">${esc(tx(cur.desc))}</p>` : ''}
          ${psec(L('Details', 'التفاصيل'), ui.kv([[L('Reported by', 'أبلغ عنه'), esc(D.pname(cur.by))], [L('Provider', 'المزوّد'), cur.provider ? esc(tx(D.provider(cur.provider).name)) : `<span class="faint">${L('Unassigned', 'غير مُسند')}</span>`], [L('Coordinator', 'المنسّق'), esc(tx(pmOf(cur.building).n))], [L('Opened', 'الفتح'), `${B.date(cur.created)} · ${B.ago(cur.created)}`], cur.building === 'BN-RAM-00311' || cur.building === 'BN-RAM-00415' ? [L('Facility contractor', 'مقاول المرافق'), L('Sanad Facility Services', 'سند لخدمات إدارة المرافق')] : null]))}
          ${psec(L('Timeline', 'المسار الزمني'), ui.timeline(tl))}`,
        foot: `${nextAct}${cur.unit && D.unit(cur.unit).tenant ? ui.btn(L('Message tenant', 'مراسلة المستأجر'), { icon: 'chat', act: 'mgMessage', arg: D.unit(cur.unit).tenant }) : ui.btn(L('Message', 'مراسلة'), { icon: 'chat', act: 'mgMessage', arg: cur.by })}` });
    }
    const board = `<div class="mg-board-seg" style="margin-bottom:10px">${ui.seg('mg:mc', COLSX.map((c) => ({ id: c.id, label: `${c.label} ${reqs.filter((r) => c.match.includes(r.status)).length}` })), mcol)}</div>
      <div class="mg-board">${COLSX.map((c) => { const its = reqs.filter((r) => c.match.includes(r.status)); return `<div class="mg-col ${mcol === c.id ? 'show-m' : ''}"><div class="cl-h"><span>${c.label}</span><span class="c">${its.length}</span></div>${its.length ? its.map(card).join('') : `<div class="xs faint" style="padding:8px 4px">${L('Nothing here', 'لا شيء هنا')}</div>`}</div>`; }).join('')}</div>`;
    const table = xtable({ id: 'mgReq', rows: reqs, pageSize: 20, active: cur && cur.id, rowAct: (r) => ({ act: 'set', arg: `mg:msel=${r.id}` }), defaultSort: '-created',
      bulk: [{ label: L('Schedule visits', 'جدولة الزيارات'), icon: 'calendar', act: 'mgBulkSched' }, { label: L('Export', 'تصدير'), icon: 'download', act: 'mgExportSel' }], cols: reqCols() });
    const avgClose = (() => { const done = base.filter((r) => r.closed); return done.length ? B.num1(B.sum(done, (r) => B.daysBetween(r.created, r.closed)) / done.length) : '—'; })();
    return `${phead({ title: L('Maintenance requests', 'طلبات الصيانة'), sub: L('Tenant and common-area requests — triage, assignment to providers and follow-up.', 'طلبات المستأجرين والمناطق المشتركة — الفرز والإسناد للمزوّدين والمتابعة.'), actions: `${ui.btn(L('Find a provider', 'ابحث عن مزوّد'), { icon: 'search', go: `${R}-services` })}${ui.btn(L('New request', 'طلب جديد'), { kind: 'primary', icon: 'plus', act: 'mgNewReq', arg: scope() === 'all' ? '' : scope() })}` })}
      <div class="stack">
      ${kband([kb('wrench', L('Open requests', 'طلبات مفتوحة'), open.length, L(`${base.length} on record`, `${base.length} مسجّلة`)), kb('userPlus', L('Unassigned', 'غير مُسندة'), open.filter((r) => !r.provider).length, L('need a provider', 'بحاجة لمزوّد'), open.some((r) => !r.provider) ? 'warn' : ''), kb('alert', L('High / critical', 'عالية / حرجة'), open.filter((r) => r.priority === 'high' || r.priority === 'critical').length, L('respond within 4 h', 'استجابة خلال 4 ساعات'), 'bad'), kb('clock', L('Avg. days to close', 'متوسط أيام الإغلاق'), avgClose, L('completed requests', 'الطلبات المكتملة')), kb('star', L('Provider rating', 'تقييم المزوّدين'), '4.6', L('last 90 days (sample)', 'آخر 90 يوماً (نموذج)'))], 5)}
      ${fbar([ui.search('mg:mq', L('Request ID or title…', 'رقم الطلب أو العنوان…'), { reset: 'mgReq:page' }), scopeSelect(), ui.select('mg:mcat', [{ v: 'all', l: L('All categories', 'كل الفئات') }].concat(D.serviceCats.filter((c) => base.some((r) => r.cat === c.id)).map((c) => ({ v: c.id, l: tx(c.name) }))), { label: L('Category', 'الفئة') }), ui.select('mg:mpr', [{ v: 'all', l: L('All priorities', 'كل الأولويات') }].concat(['critical', 'high', 'medium', 'low'].map((v) => ({ v, l: ui.statusLabel(v) }))), { label: L('Priority', 'الأولوية') })],
        ui.seg('mg:mv', [{ id: 'board', icon: 'grid', label: L('Board', 'لوحة') }, { id: 'table', icon: 'list', label: L('Table', 'جدول') }], view))}
      <div class="mg-split">${view === 'board' ? `<div style="min-width:0">${board}</div>` : table}${pn}</div>
      </div>`;
  };
  B.act.mgBulkSched = (ids) => { const n = String(ids).split(',').length; B.modal({ title: L(`Schedule ${n} visit(s)`, `جدولة ${n} زيارة`), size: 'sm', form: 'mgBulkSched', body: `<input type="hidden" name="ids" value="${esc(ids)}">${ui.field({ name: 'date', label: L('Visit date', 'موعد الزيارة'), type: 'date', value: '2026-11-30', required: true })}`, foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Schedule', 'جدولة'), { kind: 'primary', type: 'submit', icon: 'calendar' })}` }); };
  B.submit.mgBulkSched = (d) => { String(d.ids).split(',').forEach((id) => { const r = D.request(id); if (r && openStatuses.includes(r.status)) { r.visit = d.date; if (r.provider && ['open', 'new', 'quoted', 'assigned'].includes(r.status)) r.status = 'scheduled'; } }); B.vs['mgReq:sel'] = []; B.success({ title: L('Visits scheduled', 'تمت جدولة الزيارات'), text: L('Requests without a provider keep the date as a target.', 'تحتفظ الطلبات غير المُسندة بالتاريخ كهدف.'), ref: B.uid('SCH') }); B.refresh(); };

  /* =====================================================================
   * 13 · Expenses (ledger · approvals)
   * ===================================================================== */
  const APPROVAL = 1800;
  P.expenses = () => {
    crumbs({ label: L('Expenses', 'المصاريف') });
    const ids = sIds(); const base = MX.exp.filter((e) => ids.includes(e.b));
    const sf = B.get('mg:exs', 'all'), cf = B.get('mg:exc', 'all'), mf = B.get('mg:exm', 'all'), q = B.get('mg:exq', '');
    const rows = base.filter((e) => (sf === 'all' || e.status === sf) && (cf === 'all' || e.cat === cf) && (mf === 'all' || e.ym === mf) && B.match(q, e.id, e.inv, vendorName(e.vendor)));
    const nov = base.filter((e) => e.ym === '2026-11'), oct = base.filter((e) => e.ym === '2026-10');
    const pend = base.filter((e) => e.status === 'pending');
    const sel = B.get('mg:exsel', '') || (rows[0] && rows[0].id); const cur = base.find((e) => e.id === sel);
    const catN = (c) => tx(MX.opexCats.find((k) => k.id === c).n);
    const byCat = MX.opexCats.map((c, i) => ({ label: tx(c.n), value: B.sum(nov.filter((e) => e.cat === c.id), (e) => e.amount), color: PAL8[i % 8] })).filter((x) => x.value);
    let pn = '';
    if (cur) {
      const chain = [{ who: staffName(cur.by), r: L('Raised', 'أنشأها'), st: 'done' }, { who: staffName(pmOf(cur.b).id), r: L('Property manager', 'مدير العقار'), st: 'done' }];
      if (cur.amount > APPROVAL) chain.push({ who: staffName('p_rania'), r: L('Portfolio director (> ₪1,800)', 'مديرة المحفظة (> 1,800 ₪)'), st: cur.status === 'pending' ? 'cur' : cur.status === 'rejected' ? 'rej' : 'done' });
      if (cur.amount > 5000) chain.push({ who: D.committeeOf(cur.b) ? tx(D.committeeOf(cur.b).name) : L('Owners\' representative', 'ممثل المالكين'), r: L('Committee (> ₪5,000)', 'اللجنة (> 5,000 ₪)'), st: cur.status === 'pending' ? 'todo' : 'done' });
      pn = panel({ eyebrow: `${ui.idMono(cur.id)} · ${ui.idMono(cur.inv)}`, title: esc(vendorName(cur.vendor)), sub: `${esc(catN(cur.cat))} · ${esc(sName(cur.b))}`, close: 'mg:exsel', body: `
          <div class="row-sm wrap">${ui.status(cur.status === 'pending' ? 'pendingApproval' : cur.status)}${ui.prov('submitted')}</div>
          ${pstats([[money(cur.amount), L('amount', 'المبلغ')], [B.dateShort(cur.date), L('invoice date', 'تاريخ الفاتورة')], [ymLabel(cur.ym).split(' ')[0], L('period', 'الفترة')]])}
          <div class="mg-docv"><div class="row between"><b class="small">${esc(vendorName(cur.vendor))}</b><span class="mg-tag">${L('Invoice (sample)', 'فاتورة (نموذج)')}</span></div>${[94, 70, 86, 52].map((w) => `<i style="width:${w}%"></i>`).join('')}<div class="row between" style="margin-top:14px;font-size:13px"><span class="faint">${esc(cur.inv)}</span><b class="num">${money(cur.amount)}</b></div></div>
          ${psec(L('Approval chain', 'مسار الموافقة'), `<div class="mg-steps">${chain.map((c, i) => `<div class="${c.st === 'done' ? 'done' : c.st === 'cur' ? 'cur' : 'todo'}"><i>${c.st === 'done' ? icon('check') : c.st === 'rej' ? icon('x') : i + 1}</i><span>${esc(c.who)} <span class="faint">· ${c.r}</span></span></div>`).join('')}</div>`)}
          ${cur.note ? `<p class="small muted">${esc(tx(cur.note))}</p>` : ''}`,
        foot: cur.status === 'pending' ? `${ui.btn(L('Reject', 'رفض'), { icon: 'x', act: 'mgExpSet', arg: `${cur.id}|rejected` })}${ui.btn(L('Approve', 'موافقة'), { kind: 'primary', icon: 'check', act: 'mgExpSet', arg: `${cur.id}|approved` })}` : cur.status === 'approved' ? `${ui.btn(L('Schedule payment', 'جدولة الدفع'), { kind: 'primary', icon: 'banknote', act: 'mgExpSet', arg: `${cur.id}|paid` })}` : ui.btn(L('Open invoice', 'فتح الفاتورة'), { icon: 'doc', act: 'previewDoc', arg: `${cur.inv} — ${vendorName(cur.vendor)}` }) });
    }
    return `${phead({ title: L('Expenses', 'المصاريف'), sub: L('Supplier invoices for common areas — by building and category, with approval thresholds.', 'فواتير الموردين للمناطق المشتركة — حسب المبنى والفئة، مع حدود الموافقة.'), actions: `${exportBtn(L('Expense ledger', 'دفتر المصاريف'))}${ui.btn(L('Add expense', 'إضافة مصروف'), { kind: 'primary', icon: 'plus', act: 'mgAddExp' })}` })}
      <div class="stack">
      ${kband([kb('banknote', L('Spent · November', 'المنفق · تشرين الثاني'), moneyC(B.sum(nov, (e) => e.amount)), L(`${nov.length} invoices`, `${nov.length} فاتورة`)), kb('history', L('Spent · October', 'المنفق · تشرين الأول'), moneyC(B.sum(oct, (e) => e.amount)), L(`${oct.length} invoices`, `${oct.length} فاتورة`)), kb('clock', L('Awaiting approval', 'بانتظار الموافقة'), pend.length, money(B.sum(pend, (e) => e.amount)), pend.length ? 'warn' : ''), kb('check', L('Approved · to pay', 'معتمدة · للدفع'), base.filter((e) => e.status === 'approved').length, money(B.sum(base.filter((e) => e.status === 'approved'), (e) => e.amount))), kb('xCircle', L('Rejected', 'مرفوضة'), base.filter((e) => e.status === 'rejected').length, L('returned to supplier', 'أُعيدت للمورد'))], 5)}
      ${fbar([ui.search('mg:exq', L('Vendor, invoice or ID…', 'المورد أو الفاتورة أو الرقم…'), { reset: 'mgExp:page' }), scopeSelect(), ui.select('mg:exc', [{ v: 'all', l: L('All categories', 'كل الفئات') }].concat(MX.opexCats.map((c) => ({ v: c.id, l: tx(c.n) }))), { label: L('Category', 'الفئة'), reset: 'mgExp:page' }), ui.select('mg:exm', [{ v: 'all', l: L('Oct + Nov', 'ت١ + ت٢') }, { v: '2026-11', l: ymLabel('2026-11') }, { v: '2026-10', l: ymLabel('2026-10') }], { label: L('Month', 'الشهر'), reset: 'mgExp:page' }),
        ui.chips('mg:exs', [{ id: 'all', label: L('All', 'الكل'), count: base.length }, { id: 'pending', label: L('Pending', 'معلّقة'), count: pend.length }, { id: 'approved', label: ui.statusLabel('approved') }, { id: 'paid', label: ui.statusLabel('paid') }, { id: 'rejected', label: ui.statusLabel('rejected') }], sf)])}
      <div class="mg-split">${xtable({ id: 'mgExp', rows, pageSize: 20, active: cur && cur.id, rowAct: (e) => ({ act: 'set', arg: `mg:exsel=${e.id}` }), defaultSort: '-date',
        bulk: [{ label: L('Approve', 'موافقة'), icon: 'check', act: 'mgExpBulkOk' }, { label: L('Reject', 'رفض'), icon: 'x', act: 'mgExpBulkNo' }, { label: L('Export', 'تصدير'), icon: 'download', act: 'mgExportSel' }],
        cols: [
          { key: 'vendor', label: L('Vendor', 'المورد'), m: 'title', sort: (e) => vendorName(e.vendor), render: (e) => sub2(esc(vendorName(e.vendor)), `${ui.idMono(e.inv)}`), mRender: (e) => esc(vendorName(e.vendor)) },
          { key: 'cat', label: L('Category', 'الفئة'), sort: (e) => catN(e.cat), m: 'sub', render: (e) => esc(catN(e.cat)) },
          { key: 'b', label: L('Building', 'المبنى'), mid: true, sort: (e) => sName(e.b), m: 'meta', render: (e) => esc(sName(e.b)) },
          { key: 'date', label: L('Date', 'التاريخ'), sort: true, m: 'hide', render: (e) => `<span class="nowrap">${B.dateShort(e.date)}</span>` },
          { key: 'status', label: L('Status', 'الحالة'), sort: true, m: 'meta', render: (e) => ui.status(e.status === 'pending' ? 'pendingApproval' : e.status) },
          { key: 'amount', label: L('Amount', 'المبلغ'), num: true, sort: true, m: 'end', render: (e) => `<b class="num">${money(e.amount)}</b>`, total: (rs) => numc(B.sum(rs, (e) => e.amount)) },
        ] })}${pn}</div>
      <div class="grid g2">${ui.card({ title: L('November by category', 'تشرين الثاني حسب الفئة'), sub: money(B.sum(nov, (e) => e.amount)), body: B.charts.hbars({ data: byCat, format: (v) => money(v) }) })}
        ${ui.card({ title: L('November by building', 'تشرين الثاني حسب المبنى'), sub: L('Stacked by category · October total for comparison', 'مكدّس حسب الفئة · إجمالي تشرين الأول للمقارنة'), body: B.charts.shares({ rows: ids.map((b) => ({ label: `${sName(b)} <span class="faint xs">· ${L('Oct', 'ت١')} ${money(B.sum(oct.filter((e) => e.b === b), (e) => e.amount))}</span>`, parts: MX.opexCats.map((c, i) => ({ name: tx(c.n), value: B.sum(nov.filter((e) => e.b === b && e.cat === c.id), (e) => e.amount), color: PAL8[i % 8] })).filter((x) => x.value) })), legend: MX.opexCats.map((c, i) => ({ name: tx(c.n), color: PAL8[i % 8] })) }) })}</div>
      </div>`;
  };
  const expSet = (ids, st) => { let n = 0; ids.forEach((id) => { const e = MX.exp.find((x) => x.id === id); if (!e) return; if (st === 'paid' ? e.status === 'approved' : e.status === 'pending') { e.status = st; n++; } }); return n; };
  B.act.mgExpSet = (arg) => { const [id, st] = String(arg).split('|'); expSet([id], st); B.toast(st === 'approved' ? L(`${id} approved`, `تمت الموافقة على ${id}`) : st === 'rejected' ? L(`${id} rejected — supplier notified`, `رُفض ${id} — تم إشعار المورد`) : L(`${id} scheduled for payment`, `جُدول ${id} للدفع`)); B.refresh(); };
  B.act.mgExpBulkOk = (ids) => { const n = expSet(String(ids).split(','), 'approved'); B.vs['mgExp:sel'] = []; B.toast(n ? L(`${n} expenses approved`, `تمت الموافقة على ${n} مصاريف`) : L('Only pending expenses can be approved', 'يمكن الموافقة على المصاريف المعلّقة فقط'), n ? 'check' : 'info'); B.refresh(); };
  B.act.mgExpBulkNo = (ids) => B.confirm({ title: L('Reject selected expenses?', 'رفض المصاريف المحددة؟'), text: L('Suppliers are notified and invoices returned. Only pending items change.', 'يُشعَر الموردون وتُعاد الفواتير. تتغير المعلّقة فقط.'), danger: true, ok: L('Reject', 'رفض'), onOk: () => { const n = expSet(String(ids).split(','), 'rejected'); B.vs['mgExp:sel'] = []; B.closeModal(); B.toast(L(`${n} expenses rejected`, `رُفض ${n} مصاريف`)); B.refresh(); } });
  B.act.mgAddExp = () => B.modal({ title: L('Add expense', 'إضافة مصروف'), form: 'mgAddExp', body: `<div class="form-grid">${MX.h.buildingOpts ? ui.field({ name: 'b', label: L('Building', 'المبنى'), type: 'select', value: scope() !== 'all' ? scope() : bIds()[0], options: MX.h.buildingOpts(false) }) : ''}${ui.field({ name: 'cat', label: L('Category', 'الفئة'), type: 'select', options: MX.opexCats.map((c) => ({ v: c.id, l: tx(c.n) })) })}${ui.field({ name: 'vendor', label: L('Vendor', 'المورد'), type: 'select', options: D.providers.map((p) => ({ v: p.id, l: tx(p.name) })) })}${ui.field({ name: 'amount', label: L('Amount (₪)', 'المبلغ (₪)'), type: 'number', value: 650, required: true })}${ui.field({ name: 'inv', label: L('Invoice number', 'رقم الفاتورة'), placeholder: 'INV-…' })}${ui.field({ name: 'date', label: L('Invoice date', 'تاريخ الفاتورة'), type: 'date', value: todayIso })}${ui.field({ name: 'file', type: 'file', full: true })}</div>`, foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Submit for approval', 'إرسال للموافقة'), { kind: 'primary', type: 'submit', icon: 'send' })}` });
  B.submit.mgAddExp = (d) => { const amt = Math.max(0, +d.amount || 0); const id = `EX-26-${4100 + MX.exp.length}`; MX.exp.unshift({ id, b: d.b || bIds()[0], cat: d.cat || 'repairs', vendor: d.vendor || 'sp_jaber', amount: amt, date: d.date || todayIso, ym: '2026-11', inv: d.inv || `INV-${String(Date.now()).slice(-5)}`, status: amt > APPROVAL ? 'pending' : 'approved', by: 'p_rania' }); B.vs['mg:exsel'] = id; B.success({ title: L('Expense recorded', 'تم تسجيل المصروف'), text: amt > APPROVAL ? L('Above ₪1,800 — sent for approval.', 'فوق 1,800 ₪ — أُرسل للموافقة.') : L('Within the property manager\'s limit — approved.', 'ضمن حد مدير العقار — معتمد.'), ref: id }); B.refresh(); };

  /* =====================================================================
   * 14 · Financial reports (P&L by building · owner statements · catalog)
   * ===================================================================== */
  P.reports = () => {
    crumbs({ label: L('Financial reports', 'التقارير المالية') });
    const view = B.get('mg:rpv', 'pnl'); const per = B.get('mg:rpp', 'nov');
    const idxs = per === 'nov' ? [11] : per === 'oct' ? [10] : MX.months.map((_, i) => i).slice(1);
    const perL = per === 'nov' ? ymLabel('2026-11') : per === 'oct' ? ymLabel('2026-10') : L('Jan–Nov 2026', 'كانون الثاني–تشرين الثاني 2026');
    const ids = sIds();
    const pnl = ids.map((bid) => { const ms = idxs.map((i) => finM(bid, i)); const k = (f) => B.sum(ms, (m) => m[f]); const inc = k('rentCol') + k('chCol'); const net = k('ownerNet'); return { id: bid, rent: k('rentCol'), ch: k('chCol'), inc, opex: k('opex'), rep: k('unitRep'), fee: k('fee'), net, fund: k('fund'), margin: (net / (k('rentCol') || 1)) * 100 }; });
    let body = '';
    if (view === 'pnl') {
      body = `${fbar([ui.seg('mg:rpp', [{ id: 'nov', label: L('November', 'تشرين الثاني') }, { id: 'oct', label: L('October', 'تشرين الأول') }, { id: 'ytd', label: L('Year to date', 'منذ بداية العام') }], per), scopeSelect()], `${ui.btn(L('Export P&L', 'تصدير قائمة الدخل'), { icon: 'download', act: 'mgExport', arg: L(`P&L by building — ${perL}`, `قائمة الدخل حسب المبنى — ${perL}`) })}`)}
        ${xtable({ id: 'mgPnl', rows: pnl, rowGo: (x) => `${R}-workspace-${x.id}`, caption: `<span>${L('Profit & loss by building', 'قائمة الدخل حسب المبنى')} · <b>${perL}</b> · ${L('cash basis', 'أساس نقدي')}</span>${ui.prov('demo')}`, cols: [
          { key: 'id', label: L('Building', 'المبنى'), m: 'title', sort: (x) => sName(x.id), render: (x) => `<b>${esc(sName(x.id))}</b>` },
          { key: 'rent', label: L('Rent collected', 'الإيجار المحصّل'), num: true, sort: true, m: 'meta', render: (x) => numc(x.rent), total: (rs) => numc(B.sum(rs, (x) => x.rent)) },
          { key: 'ch', label: L('Service charges', 'رسوم الخدمات'), num: true, sort: true, m: 'hide', render: (x) => numc(x.ch), total: (rs) => numc(B.sum(rs, (x) => x.ch)) },
          { key: 'opex', label: L('Common opex', 'مصاريف مشتركة'), num: true, sort: true, m: 'hide', render: (x) => `<span class="num">(${money(x.opex)})</span>`, total: (rs) => `(${money(B.sum(rs, (x) => x.opex))})` },
          { key: 'rep', label: L('Unit repairs', 'إصلاح الوحدات'), num: true, wide: true, sort: true, m: 'hide', render: (x) => `<span class="num">(${money(x.rep)})</span>`, total: (rs) => `(${money(B.sum(rs, (x) => x.rep))})` },
          { key: 'fee', label: L('Mgmt fee', 'أتعاب الإدارة'), num: true, sort: true, m: 'hide', render: (x) => `<span class="num">(${money(x.fee)})</span>`, total: (rs) => `(${money(B.sum(rs, (x) => x.fee))})` },
          { key: 'net', label: L('Net to owners', 'الصافي للمالكين'), num: true, sort: true, m: 'end', render: (x) => `<b class="num">${money(x.net)}</b>`, total: (rs) => numc(B.sum(rs, (x) => x.net)) },
          { key: 'fund', label: L('Fund surplus', 'فائض الصندوق'), num: true, sort: true, m: 'hide', render: (x) => `<span class="num" style="color:${x.fund < 0 ? 'var(--bad)' : 'var(--ok)'}">${sgn(x.fund)}</span>`, total: (rs) => sgn(B.sum(rs, (x) => x.fund)) },
          { key: 'margin', label: L('Net margin', 'الهامش'), num: true, sort: true, m: 'meta', render: (x) => pct1(x.margin) },
        ] })}
        <div class="grid g2">${ui.card({ cls: 'mg-chart', title: L('Net to owners by building', 'الصافي للمالكين حسب المبنى'), sub: perL, body: B.charts.bars({ data: pnl.map((x) => ({ label: sName(x.id), value: x.net, color: '#142B3B' })), height: 180, showValues: true }) })}
          ${ui.card({ title: L('How the figures are built', 'كيف تُحتسب الأرقام'), body: ui.kv([[L('Rent collected', 'الإيجار المحصّل'), L('Receipts against lease invoices', 'المقبوضات مقابل فواتير العقود')], [L('Service charges', 'رسوم الخدمات'), L('Owner receipts; fund common opex', 'مقبوضات المالكين؛ تموّل المصاريف المشتركة')], [L('Mgmt fee', 'أتعاب الإدارة'), L('Mandate % of rent collected', 'نسبة التفويض من الإيجار المحصّل')], [L('Net to owners', 'الصافي للمالكين'), L('Rent − fee − unit repairs', 'الإيجار − الأتعاب − إصلاح الوحدات')]]) + `<div style="margin-top:12px">${ui.callout(L('Sample ledgers — not audited accounts. Statements are management information for owners.', 'دفاتر نموذجية — ليست حسابات مدققة. الكشوف معلومات إدارية للمالكين.'), '', 'info')}</div>` })}</div>`;
    } else if (view === 'statements') {
      const ow = (MX.h && P.owners) ? ownerStatementRows() : [];
      body = `${fbar([scopeSelect(), `<span class="muted small">${L('Period: November 2026 · statements are drafts until the month closes on 30 Nov', 'الفترة: تشرين الثاني 2026 · الكشوف مسودات حتى إغلاق الشهر في 30 ت٢')}</span>`], ui.btn(L('Generate all', 'إنشاء الكل'), { kind: 'primary', size: 'sm', icon: 'refresh', act: 'mgGenStmts' }))}
        ${xtable({ id: 'mgStmt', rows: ow, pageSize: 20, rowAct: (o) => ({ act: 'previewDoc', arg: L(`Owner statement — ${D.pname(o.p)} — November 2026`, `كشف المالك — ${D.pname(o.p)} — تشرين الثاني 2026`) }), defaultSort: '-net',
          bulk: [{ label: L('Send statements', 'إرسال الكشوف'), icon: 'send', act: 'mgOwnerReport' }, { label: L('Export', 'تصدير'), icon: 'download', act: 'mgExportSel' }],
          cols: [
            { key: 'p', label: L('Owner', 'المالك'), m: 'title', sort: (o) => D.pname(o.p), render: (o) => `<div class="cell-main">${ui.avatar(D.pname(o.p), 'sm')}${sub2(esc(D.pname(o.p)), L(`${o.units} unit(s)`, `${o.units} وحدة`))}</div>`, mRender: (o) => esc(D.pname(o.p)) },
            { key: 'rent', label: L('Rent collected', 'الإيجار المحصّل'), num: true, sort: true, m: 'meta', render: (o) => numc(o.rent), total: (rs) => numc(B.sum(rs, (o) => o.rent)) },
            { key: 'fee', label: L('Fee', 'الأتعاب'), num: true, m: 'hide', render: (o) => `(${money(o.fee)})`, total: (rs) => `(${money(B.sum(rs, (o) => o.fee))})` },
            { key: 'sc', label: L('Service charges', 'رسوم الخدمات'), num: true, m: 'hide', render: (o) => `(${money(o.sc)})`, total: (rs) => `(${money(B.sum(rs, (o) => o.sc))})` },
            { key: 'net', label: L('Net payable', 'الصافي المستحق'), num: true, sort: true, m: 'end', render: (o) => `<b class="num">${money(o.net)}</b>`, total: (rs) => numc(B.sum(rs, (o) => o.net)) },
            { key: 'oct', label: L('October', 'تشرين الأول'), m: 'hide', render: () => ui.status('mgSent') },
            { key: 'st', label: L('November', 'تشرين الثاني'), m: 'meta', render: () => (MX.stmtGen ? ui.badge(L('Generated', 'أُنشئ'), 'ok', 'check') : ui.status('draft')) },
          ] })}`;
    } else {
      const cat = [
        ['list', L('Rent roll', 'كشف الإيجارات'), L('Every lease with rent, ₪/m², deposit and review date', 'كل العقود مع الإيجار وسعر المتر والتأمين وموعد المراجعة')],
        ['alertCircle', L('Arrears ageing', 'أعمار الذمم'), L('Rent and service-charge arrears by age bucket and stage', 'متأخرات الإيجار والرسوم حسب العمر والمرحلة')],
        ['pie', L('Occupancy & vacancy', 'الإشغال والشغور'), L('Physical/economic occupancy, vacancy ageing', 'الإشغال الفعلي والاقتصادي وأعمار الشغور')],
        ['receipt', L('Service charge budget vs actual', 'موازنة رسوم الخدمات مقابل الفعلي'), L('Per building and category, with fund balance', 'لكل مبنى وفئة مع رصيد الصندوق')],
        ['banknote', L('Expense ledger', 'دفتر المصاريف'), L('Supplier invoices with approval trail', 'فواتير الموردين مع مسار الموافقة')],
        ['calendarCheck', L('Lease expiry schedule', 'جدول انتهاء العقود'), L('Next 12 months, WALE and concentration', 'الأشهر الـ12 القادمة ومتوسط المدة والتركّز')],
        ['chart', L('Owner statements', 'كشوف المالكين'), L('Monthly statement per owner (PDF pack)', 'كشف شهري لكل مالك (حزمة PDF)')],
        ['percent', L('Management fee invoice', 'فاتورة أتعاب الإدارة'), L('Arkan fees per mandate for the period', 'أتعاب أركان لكل تفويض للفترة')],
      ];
      body = `<div class="grid g2">${cat.map(([ic, t, d]) => `<div class="card pad-sm"><div class="row"><span class="li-icon">${icon(ic)}</span><div class="grow" style="min-width:0"><b style="display:block">${t}</b><span class="xs muted">${d}</span></div>${ui.btn(L('Generate', 'إنشاء'), { size: 'sm', icon: 'download', act: 'mgExport', arg: t })}</div></div>`).join('')}</div>`;
    }
    const tot = (f) => B.sum(pnl, (x) => x[f]);
    return `${phead({ title: L('Financial reports', 'التقارير المالية'), sub: L('Profit & loss by building, owner statements and the report catalog. Exports are simulated.', 'قائمة الدخل حسب المبنى وكشوف المالكين وفهرس التقارير. التصدير محاكاة.') })}
      <div class="stack">${kband([kb('wallet', L('Income', 'الإيرادات'), moneyC(tot('inc')), perL), kb('banknote', L('Common opex', 'المصاريف المشتركة'), moneyC(tot('opex')), perL), kb('percent', L('Arkan fees', 'أتعاب أركان'), moneyC(tot('fee')), perL), kb('coins', L('Net to owners', 'الصافي للمالكين'), moneyC(tot('net')), pct1((tot('net') / (tot('rent') || 1)) * 100) + L(' of rent', ' من الإيجار'))], 4)}
      <div>${ui.tabs('mg:rpv', [{ id: 'pnl', label: L('P&L by building', 'قائمة الدخل حسب المبنى'), icon: 'chart' }, { id: 'statements', label: L('Owner statements', 'كشوف المالكين'), icon: 'doc' }, { id: 'catalog', label: L('Report catalog', 'فهرس التقارير'), icon: 'list' }], view)}</div>${body}</div>`;
  };
  function ownerStatementRows() {
    const map = {};
    sUnits().forEach((u) => { (map[u.owner] = map[u.owner] || []).push(u); });
    return Object.entries(map).map(([p, us]) => { const ls = us.map((u) => D.leaseOfUnit(u.id)).filter(Boolean); const rent = B.sum(ls.filter((l) => !arrears(l)), (l) => l.rent); const fee = Math.round(B.sum(ls.filter((l) => !arrears(l)), (l) => l.rent * (MX.agreement[l.building].fee / 100))); const sc = B.sum(us, (u) => u.charge); return { id: p, p, units: us.length, rent, fee, sc, net: rent - fee - sc }; });
  }
  B.act.mgGenStmts = () => { MX.stmtGen = true; B.success({ title: L('Statements generated', 'تم إنشاء الكشوف'), text: L('Drafts are ready for review before sending (simulated).', 'المسودات جاهزة للمراجعة قبل الإرسال (محاكاة).'), ref: B.uid('STM') }); B.refresh(); };

  /* =====================================================================
   * 15 · Documents (folders · filters · preview)
   * ===================================================================== */
  P.documents = () => {
    crumbs({ label: L('Documents', 'المستندات') });
    const f = B.get('mg:df', 'all'); const q = B.get('mg:dq', ''); const pv = B.get('mg:dp', 'all');
    const base = MX.repo.filter((d) => inScope(d.b));
    const rows = base.filter((d) => (f === 'all' || d.f === f) && (pv === 'all' || d.prov === pv) && B.match(q, d.n, d.id));
    const sel = B.get('mg:dsel', '') || (rows[0] && rows[0].id); const cur = base.find((d) => d.id === sel);
    const folders = `<section class="card pad-sm mg-frail" style="align-self:start"><div class="mg-h4" style="padding:0 6px">${L('Folders', 'المجلدات')}</div><div class="mg-folders"><button class="${f === 'all' ? 'on' : ''}" data-act="set" data-arg="mg:df=all">${icon('folder')}<span>${L('All documents', 'كل المستندات')}</span><span class="c">${base.length}</span></button>${MX.folders.map((x) => `<button class="${f === x.id ? 'on' : ''}" data-act="set" data-arg="mg:df=${x.id}">${icon(x.icon)}<span>${tx(x.n)}</span><span class="c">${base.filter((d) => d.f === x.id).length}</span></button>`).join('')}</div>
      <div style="border-top:1px solid var(--line-2);margin:12px 0 10px"></div><div class="mg-h4" style="padding:0 6px">${L('Storage', 'التخزين')}</div><div style="padding:0 6px">${ui.progress(38)}<div class="xs faint" style="margin-top:6px">${L('3.8 GB of 10 GB used (sample)', '3.8 غيغابايت من 10 مستخدمة (نموذج)')}</div></div></section>`;
    const pn = cur ? panel({ eyebrow: ui.idMono(cur.id), title: `<bdi>${esc(tx(cur.n))}</bdi>`, sub: `${esc(tx(MX.folders.find((x) => x.id === cur.f).n))} · ${esc(sName(cur.b))}`, close: 'mg:dsel', body: `
        <div class="mg-docv"><div class="row between"><div class="row-sm">${B.logo(20)}<b class="small">BENA · Arkan</b></div><span class="mg-tag">PDF · ${cur.size}</span></div>${[92, 100, 76, 88, 64, 95, 40, 82].map((w) => `<i style="width:${w}%"></i>`).join('')}<div class="row between xs faint" style="margin-top:14px"><span>${L('Preview (sample)', 'معاينة (نموذج)')}</span><span>1 / 3</span></div></div>
        ${psec(L('Details', 'التفاصيل'), ui.kv([[L('Uploaded by', 'رفعه'), esc(staffName(cur.by))], [L('Date', 'التاريخ'), B.date(cur.date)], [L('Building', 'المبنى'), esc(sName(cur.b))], [L('Source', 'المصدر'), ui.prov(cur.prov)], cur.lease ? [L('Linked lease', 'العقد المرتبط'), `<button class="mg-link" data-go="${R}-lease-${cur.lease}">${ui.idMono(cur.lease)}</button>`] : null, [L('Tags', 'الوسوم'), `<span class="row-sm wrap">${cur.tags.map((t) => `<span class="mg-tag">${esc(ui.statusLabel(t) || t)}</span>`).join('')}</span>`]]))}
        ${psec(L('Access', 'الوصول'), ui.kv([[L('Arkan team', 'فريق أركان'), L('View & edit', 'عرض وتعديل')], [L('Owners', 'المالكون'), cur.f === 'statements' || cur.f === 'agreements' || cur.f === 'minutes' ? L('View', 'عرض') : L('No access', 'بلا وصول')], [L('Tenants', 'المستأجرون'), cur.f === 'leases' ? L('Own lease only', 'عقده فقط') : L('No access', 'بلا وصول')]]))}`,
      foot: `${ui.btn(L('Open', 'فتح'), { icon: 'eye', act: 'previewDoc', arg: tx(cur.n) })}${ui.btn(L('Download', 'تنزيل'), { kind: 'primary', icon: 'download', act: 'soon', arg: L('Download', 'التنزيل') })}` }) : '';
    return `${phead({ title: L('Documents', 'المستندات'), sub: L('Repository for agreements, leases, statements, invoices, certificates and minutes.', 'مستودع الاتفاقيات والعقود والكشوف والفواتير والشهادات والمحاضر.'), actions: `${ui.btn(L('New folder', 'مجلد جديد'), { icon: 'folder', act: 'soon', arg: L('Folders', 'المجلدات') })}${ui.btn(L('Upload', 'رفع'), { kind: 'primary', icon: 'upload', act: 'soon', arg: L('Upload', 'الرفع') })}` })}
      ${fbar([ui.search('mg:dq', L('Search documents…', 'ابحث في المستندات…'), { reset: 'mgDocs:page' }), scopeSelect(), ui.select('mg:dp', [{ v: 'all', l: L('Any source', 'أي مصدر') }, { v: 'submitted', l: tx(ui.PROV.submitted) }, { v: 'pending', l: tx(ui.PROV.pending) }, { v: 'demo', l: tx(ui.PROV.demo) }], { label: L('Source', 'المصدر'), reset: 'mgDocs:page' })], `<span class="count">${L(`${rows.length} documents`, `${rows.length} مستند`)}</span>`)}
      <div class="mg-fchips" style="margin-bottom:12px">${ui.chips('mg:df', [{ id: 'all', label: L('All', 'الكل'), count: base.length }].concat(MX.folders.map((x) => ({ id: x.id, label: x.n, icon: x.icon, count: base.filter((d) => d.f === x.id).length }))), f)}</div>
      <div class="mg-docs-grid">${folders}<div class="mg-split">${xtable({ id: 'mgDocs', rows, pageSize: 20, defaultSort: '-date', active: cur && cur.id, rowAct: (d) => ({ act: 'set', arg: `mg:dsel=${d.id}` }), mGo: null,
        bulk: [{ label: L('Download', 'تنزيل'), icon: 'download', act: 'mgExportSel' }, { label: L('Share with owners', 'مشاركة مع المالكين'), icon: 'share', act: 'mgShareDocs' }], cols: docCols() })}${pn}</div></div>`;
  };
  B.act.mgShareDocs = (ids) => { B.vs['mgDocs:sel'] = []; B.success({ title: L('Shared with owners', 'تمت المشاركة مع المالكين'), text: L(`${String(ids).split(',').length} documents are visible in the owner app (simulated).`, `${String(ids).split(',').length} مستندات ظاهرة في تطبيق المالك (محاكاة).`), ref: B.uid('SHR') }); B.refresh(); };
  B.css(`.mg-docs-grid { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 16px; align-items: start; }
    .mg-fchips { display: none; } .mg-fchips .chips { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
    @media (max-width: 1640px) { .mg-docs-grid { grid-template-columns: minmax(0, 1fr); } .mg-docs-grid > .mg-frail { display: none; } .mg-fchips { display: block; } }`);

  /* =====================================================================
   * 16 · Management team (staff · assignments · workload)
   * ===================================================================== */
  const tasksOf = (s) => {
    const bs = bIds().filter((b) => covers(s, b));
    const reqs = D.requests.filter((r) => bs.includes(r.building) && openStatuses.includes(r.status)).length;
    const exp = D.leases.filter((l) => bs.includes(l.building) && (l.status === 'expiring' || l.status === 'expired')).length;
    const vac = D.units.filter((u) => bs.includes(u.building) && u.status === 'vacant').length;
    const arr = D.leases.filter((l) => bs.includes(l.building) && arrears(l) > 0).length;
    const pend = MX.exp.filter((e) => bs.includes(e.b) && e.status === 'pending').length;
    const t = s.team === 'pm' ? { [L('Open requests', 'طلبات مفتوحة')]: reqs, [L('Renewals', 'تجديدات')]: exp, [L('Pending expenses', 'مصاريف معلّقة')]: pend, [L('Inspections', 'تفقدات')]: bs.length * 2 }
      : s.team === 'leasing' ? { [L('Renewals', 'تجديدات')]: exp, [L('Vacant units to let', 'وحدات للتأجير')]: vac, [L('Viewings', 'معاينات')]: Math.round(vac / 2) }
        : s.id === 's_iyad' ? { [L('Arrears cases', 'حالات متأخرات')]: arr + D.units.filter((u) => scArrears(u) > 0).length, [L('Payment plans', 'خطط سداد')]: 3 }
          : s.id === 's_rasha' ? { [L('Owner statements', 'كشوف المالكين')]: Math.round(new Set(D.units.filter((u) => bs.includes(u.building)).map((u) => u.owner)).size / 6), [L('Supplier payments', 'دفعات موردين')]: MX.exp.filter((e) => e.status === 'approved').length }
            : s.team === 'ops' ? { [L('Open requests', 'طلبات مفتوحة')]: reqs, [L('Provider follow-ups', 'متابعات المزوّدين')]: Math.round(reqs / 2) + 2 }
              : { [L('Approvals', 'موافقات')]: pend, [L('Mandate renewals', 'تجديد التفويضات')]: bIds().filter((b) => MX.agreement[b].status === 'renewalDue').length, [L('Onboarding', 'الإعداد')]: MX.onboarding.length };
    const n = B.sum(Object.values(t));
    return { t, n, pct: Math.min(130, (n / s.cap) * 100), bs };
  };
  P.team = () => {
    crumbs({ label: L('Management team', 'فريق الإدارة') });
    const tf = B.get('mg:tmf', 'all'); const q = B.get('mg:tmq', '');
    const rows = MX.staff.filter((s) => (tf === 'all' || s.team === tf) && B.match(q, s.n, s.role)).map((s) => ({ ...s, w: tasksOf(s) }));
    const sel = B.get('mg:tmsel', '') || (rows[0] && rows[0].id); const cur = rows.find((s) => s.id === sel) || (MX.staff.find((s) => s.id === sel) && { ...MX.staff.find((s) => s.id === sel), w: tasksOf(MX.staff.find((s) => s.id === sel)) });
    const ids = bIds();
    const matrix = `<div class="mg-assign" style="grid-template-columns:minmax(150px,1.6fr) repeat(${ids.length},minmax(0,1fr))"><div></div>${ids.map((b) => `<div class="ah">${esc(sName(b))}</div>`).join('')}
      ${MX.staff.map((s) => `<div class="an">${ui.avatar(tx(s.n), 'sm')}<b>${esc(tx(s.n))}</b></div>${ids.map((b) => { const lead = (s.team === 'pm' && pmOf(b).id === s.id) || (s.team === 'leasing' && leasingOf(b).id === s.id); const on = covers(s, b); return `<div class="ac ${lead ? 'lead' : on ? 'sup' : ''}" title="${esc(tx(s.n))} · ${esc(sName(b))}">${lead ? L('Lead', 'رئيسي') : on ? '✓' : '·'}</div>`; }).join('')}`).join('')}</div>
      <div class="mg-legend" style="margin-top:12px"><span><i style="background:var(--navy)"></i>${L('Lead for this building', 'مسؤول رئيسي للمبنى')}</span><span><i style="background:var(--mint-100)"></i>${L('Covers / supports', 'يغطي / يدعم')}</span></div>`;
    const pn = cur ? panel({ title: esc(tx(cur.n)), sub: `${esc(tx(cur.role))} · ${esc(tx(MX.teams[cur.team]))}`, lead: ui.avatar(tx(cur.n)), close: 'mg:tmsel', body: `
        ${pstats([[cur.w.n, L('open tasks', 'مهام مفتوحة')], [B.pct(cur.w.pct), L('of capacity', 'من الطاقة')], [cur.b === 'all' ? L('All', 'الكل') : cur.b.length, L('buildings', 'مبانٍ')]])}
        ${psec(L('Workload', 'عبء العمل'), Object.entries(cur.w.t).map(([k, v]) => `<div class="row between small" style="padding:6px 0;border-bottom:1px solid var(--line-2)"><span class="muted">${k}</span><b class="num">${v}</b></div>`).join(''))}
        ${psec(L('Buildings', 'المباني'), `<div class="row-sm wrap">${cur.w.bs.map((b) => `<button class="mg-tag" data-go="${R}-workspace-${b}">${esc(sName(b))}</button>`).join('')}</div>`)}
        ${psec(L('Contact', 'التواصل'), ui.kv([[L('Phone', 'الهاتف'), `<span class="ltr">${esc(cur.phone)}</span>`], [L('BENA access', 'صلاحيات بينا'), cur.team === 'mgmt' ? L('Administrator', 'مسؤول') : cur.team === 'finance' ? L('Finance · approvals ≤ ₪1,800', 'المالية · موافقات ≤ 1,800 ₪') : L('Standard · assigned buildings', 'عادية · المباني المسندة')]]))}`,
      foot: `${ui.btn(L('Reassign buildings', 'إعادة إسناد المباني'), { icon: 'swap', act: 'mgReassign', arg: cur.id })}${ui.btn(L('Message', 'مراسلة'), { kind: 'primary', icon: 'chat', act: 'mgMessage', arg: cur.id })}` }) : '';
    const all = MX.staff.map((s) => tasksOf(s));
    return `${phead({ title: L('Management team', 'فريق الإدارة'), sub: L('Arkan staff, roles, building assignments and current workload.', 'موظفو أركان وأدوارهم وإسناد المباني وعبء العمل الحالي.'), scoped: false, actions: `${exportBtn(L('Team roster', 'قائمة الفريق'))}${ui.btn(L('Invite member', 'دعوة عضو'), { kind: 'primary', icon: 'userPlus', act: 'mgInvite' })}` })}
      <div class="stack">
      ${kband([kb('users', L('Team members', 'أعضاء الفريق'), MX.staff.length, L(`${Object.keys(MX.teams).length} functions`, `${Object.keys(MX.teams).length} وظائف`)), kb('building', L('Buildings covered', 'المباني المغطاة'), ids.length, L('each with a lead manager', 'لكل منها مدير رئيسي')), kb('clipboard', L('Open tasks', 'المهام المفتوحة'), B.sum(all, (w) => w.n), L('requests, renewals, cases', 'طلبات وتجديدات وحالات')), kb('gauge', L('Average load', 'متوسط العبء'), B.pct(B.sum(all, (w) => w.pct) / all.length), L(`${all.filter((w) => w.pct > 90).length} above 90%`, `${all.filter((w) => w.pct > 90).length} فوق 90%`), all.some((w) => w.pct > 90) ? 'warn' : '')], 4)}
      ${ui.card({ title: L('Building assignments', 'إسناد المباني'), sub: L('Who leads and supports each building', 'من يقود ويدعم كل مبنى'), body: `<div style="overflow-x:auto">${matrix}</div>` })}
      ${fbar([ui.search('mg:tmq', L('Name or role…', 'الاسم أو الدور…')), ui.chips('mg:tmf', [{ id: 'all', label: L('All', 'الكل'), count: MX.staff.length }].concat(Object.keys(MX.teams).map((k) => ({ id: k, label: MX.teams[k], count: MX.staff.filter((s) => s.team === k).length }))), tf)])}
      <div class="mg-split">${xtable({ id: 'mgTeam', rows, active: cur && cur.id, rowAct: (s) => ({ act: 'set', arg: `mg:tmsel=${s.id}` }),
        bulk: [{ label: L('Message', 'مراسلة'), icon: 'chat', act: 'mgMessageSel' }, { label: L('Export', 'تصدير'), icon: 'download', act: 'mgExportSel' }],
        cols: [
          { key: 'n', label: L('Member', 'العضو'), m: 'title', sort: (s) => tx(s.n), render: (s) => `<div class="cell-main">${ui.avatar(tx(s.n), 'sm')}${sub2(esc(tx(s.n)), esc(tx(s.role)))}</div>`, mRender: (s) => esc(tx(s.n)) },
          { key: 'team', label: L('Function', 'الوظيفة'), mid: true, sort: (s) => s.team, m: 'sub', render: (s) => esc(tx(MX.teams[s.team])) },
          { key: 'b', label: L('Buildings', 'المباني'), wide: true, m: 'hide', render: (s) => (s.b === 'all' ? `<span class="mg-tag">${L('All buildings', 'كل المباني')}</span>` : `<span class="row-sm wrap">${s.b.map((b) => `<span class="mg-tag">${esc(sName(b))}</span>`).join('')}</span>`) },
          { key: 'tasks', label: L('Open tasks', 'مهام مفتوحة'), num: true, sort: (s) => s.w.n, m: 'meta', render: (s) => s.w.n, total: (rs) => B.sum(rs, (s) => s.w.n) },
          { key: 'load', label: L('Workload', 'العبء'), sort: (s) => s.w.pct, w: '170px', m: 'end', render: (s) => `<div class="mg-wl">${ui.progress(Math.min(100, s.w.pct), s.w.pct > 90 ? 'bad' : s.w.pct > 70 ? 'warn' : '', 'thin')}<b class="num small" style="text-align:end">${B.pct(s.w.pct)}</b></div>` },
        ] })}${pn}</div>
      </div>`;
  };
  B.act.mgInvite = () => B.modal({ title: L('Invite team member', 'دعوة عضو للفريق'), form: 'mgInvite', body: `<div class="form-grid">${ui.field({ name: 'name', label: L('Full name', 'الاسم الكامل'), required: true })}${ui.field({ name: 'email', label: L('Work email', 'البريد الإلكتروني للعمل'), type: 'email', placeholder: 'name@arkan.example' })}${ui.field({ name: 'team', label: L('Function', 'الوظيفة'), type: 'select', options: Object.keys(MX.teams).map((k) => ({ v: k, l: tx(MX.teams[k]) })) })}${ui.field({ name: 'b', label: L('Buildings', 'المباني'), type: 'select', options: [{ v: 'all', l: L('All buildings', 'كل المباني') }].concat(bIds().map((b) => ({ v: b, l: sName(b) }))) })}</div>`, foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send invitation', 'إرسال الدعوة'), { kind: 'primary', type: 'submit', icon: 'send' })}` });
  B.submit.mgInvite = (d) => B.success({ title: L('Invitation sent', 'تم إرسال الدعوة'), text: L(`${esc(d.name || 'The new member')} will appear here after accepting (simulated).`, `سيظهر ${esc(d.name || 'العضو الجديد')} هنا بعد القبول (محاكاة).`), ref: B.uid('INV') });
  B.act.mgReassign = (sid) => { const s = staff(sid); B.modal({ title: L(`Reassign buildings — ${tx(s.n)}`, `إعادة إسناد المباني — ${tx(s.n)}`), size: 'sm', form: 'mgReassign', body: `<input type="hidden" name="sid" value="${esc(sid)}"><div class="stack">${bIds().map((b) => `<label class="check"><input type="checkbox" name="b_${b}" ${covers(s, b) ? 'checked' : ''}><span>${esc(sName(b))}</span></label>`).join('')}</div>`, foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Save', 'حفظ'), { kind: 'primary', type: 'submit', icon: 'check' })}` }); };
  B.submit.mgReassign = (d) => { const s = staff(d.sid); if (s && s.team !== 'mgmt' && s.team !== 'finance' && s.team !== 'ops') { const sel = bIds().filter((b) => d[`b_${b}`]); if (sel.length) s.b = sel; } B.success({ title: L('Assignments updated', 'تم تحديث الإسناد'), text: s && (s.team === 'mgmt' || s.team === 'finance' || s.team === 'ops') ? L('Portfolio-wide roles keep access to all buildings.', 'تحتفظ الأدوار العامة بالوصول لكل المباني.') : '' }); B.refresh(); };

})();
