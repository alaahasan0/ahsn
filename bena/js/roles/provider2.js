/*
 * BENA — Service Provider portal (B2B web workspace) for Jaber Technical Services.
 * Extends js/roles/provider.js with desktop-first screens: service categories,
 * service coverage (map), schedule with technician lanes, job details and
 * performance overview — and re-registers the role with an 11-screen sidebar.
 * All companies, people, prices and metrics are fictional demonstration data.
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon, ui } = B;
  const D = B.data;
  const M = B.mkt;
  const ek = B.ek;
  const V = B._pv;
  if (!V || !ek) return;
  const T = (en, ar) => ({ en, ar });
  const R = 'provider';
  const { PID, P, TEAM, tech, JOBS, job, QUOTES, where } = V;
  const line = () => B.get('ws:provider', 'all');
  const inLine = (cat) => line() === 'all' || cat === line();

  B.css(`
  .p2-cal { background: #fff; border: 1px solid var(--line); border-radius: var(--r); overflow: auto; }
  .p2-grid { display: grid; min-width: 960px; }
  .p2-grid > div { border-bottom: 1px solid var(--line-2); border-inline-start: 1px solid var(--line-2); min-height: 74px; padding: 6px; position: relative; }
  .p2-grid .hd { min-height: 0; padding: 10px 8px; background: var(--surface-2); font-size: 12px; font-weight: 600; color: var(--text-3); text-align: center; position: sticky; top: 0; z-index: 2; }
  .p2-grid .hd b { display: block; font-family: var(--font-display); font-size: 17px; color: var(--ink); }
  .p2-grid .hd.today b { color: var(--mint-ink); }
  .p2-grid .hd.today { box-shadow: inset 0 -2px 0 var(--mint); }
  .p2-grid .lane { border-inline-start: 0; display: flex; align-items: center; gap: 10px; background: #fff; position: sticky; inset-inline-start: 0; z-index: 1; padding: 8px 12px; }
  .p2-grid .lane b { font-size: 13.5px; display: block; line-height: 1.25; }
  .p2-grid .lane small { font-size: 11.5px; color: var(--text-3); display: block; }
  .p2-grid .off { background: repeating-linear-gradient(135deg, #F8FAF9, #F8FAF9 6px, #F1F5F3 6px, #F1F5F3 12px); }
  .p2-grid .now { background: rgba(54,214,160,.05); }
  .p2-ev { display: block; width: 100%; text-align: start; border-radius: 8px; padding: 6px 8px; font-size: 12px; line-height: 1.3; background: var(--mint-50); border: 1px solid var(--mint-100); color: var(--ink); margin-bottom: 4px; overflow: hidden; }
  .p2-ev b { display: block; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .p2-ev span { color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
  .p2-ev.enroute, .p2-ev.inProgress { background: var(--violet-bg); border-color: #D9D1F7; }
  .p2-ev.completed { background: var(--surface-2); border-color: var(--line); opacity: .75; }
  .p2-ev.survey { background: #fff; border: 1px dashed #9FB1BF; }
  .p2-ev.on { box-shadow: 0 0 0 2px var(--mint); }
  .p2-day { position: relative; }
  .p2-hours { display: grid; min-width: 980px; grid-template-columns: 200px repeat(11, minmax(0, 1fr)); }
  .p2-hours > .h { padding: 8px 6px; font-size: 11.5px; color: var(--text-3); background: var(--surface-2); border-bottom: 1px solid var(--line); border-inline-start: 1px solid var(--line-2); position: sticky; top: 0; z-index: 2; }
  .p2-row { display: grid; grid-template-columns: 200px minmax(0, 1fr); min-width: 980px; border-bottom: 1px solid var(--line-2); }
  .p2-row .lane { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #fff; position: sticky; inset-inline-start: 0; z-index: 1; }
  .p2-row .lane b { font-size: 13.5px; display: block; } .p2-row .lane small { font-size: 11.5px; color: var(--text-3); display: block; }
  .p2-track { position: relative; height: 66px; background-image: linear-gradient(to right, var(--line-2) 1px, transparent 1px); background-size: calc(100% / 11) 100%; }
  html[dir="rtl"] .p2-track { background-image: linear-gradient(to left, var(--line-2) 1px, transparent 1px); }
  .p2-track .p2-ev { position: absolute; top: 8px; bottom: 8px; margin: 0; }
  .p2-nowline { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--bad); opacity: .6; z-index: 1; }
  .p2-cap { display: flex; flex-direction: column; gap: 10px; }
  .p2-cap .r { display: grid; grid-template-columns: minmax(0, 1fr) 90px 44px; gap: 10px; align-items: center; font-size: 13px; }
  .p2-sla { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
  .p2-sla > div { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; display: flex; gap: 14px; align-items: center; }
  .p2-sla b { font-family: var(--font-display); font-size: 15px; display: block; } .p2-sla span { font-size: 12px; color: var(--text-3); display: block; margin-top: 2px; }
  @media (max-width: 1100px) { .p2-sla { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 560px) { .p2-sla { grid-template-columns: minmax(0, 1fr); } }
  .p2-cov { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 16px; align-items: start; }
  @media (max-width: 1180px) { .p2-cov { grid-template-columns: minmax(0, 1fr); } }
  .p2-ly { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
  .p2-ly label { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; padding: 6px 10px; border: 1px solid var(--line); border-radius: 99px; background: #fff; cursor: pointer; }
  .p2-ly input { accent-color: var(--mint-ink); }
  .p2-svc { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 10px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line-2); font-size: 13.5px; }
  .p2-svc:last-child { border-bottom: 0; }
  .p2-svc small { display: block; color: var(--text-3); font-size: 12px; }
  `);
  Object.assign(B.statuses, {
    p2Covered: { en: 'Covered', ar: 'مغطاة', tone: 'ok', icon: 'check' },
    p2NotCovered: { en: 'Not covered', ar: 'غير مغطاة', tone: 'outline' },
    p2Offered: { en: 'Offered', ar: 'متاحة', tone: 'ok', icon: 'check' },
    p2NotOffered: { en: 'Not offered', ar: 'غير متاحة', tone: 'outline' },
    p2Survey: { en: 'Site survey', ar: 'معاينة موقع', tone: 'outline', icon: 'eye' },
  });

  /* ---------------- shared derived data ---------------- */
  const DUR = { electrical: 2, plumbing: 1.5, hvac: 2.5, general: 3 };
  const durOf = (j) => j.dur || (j.id === 'JB-3103' ? 3.5 : DUR[j.cat] || 2);
  const SURVEYS = [
    { id: 'SV-PR-24496', req: 'PR-24496', bid: 'BN-RAM-00142', unit: null, cat: 'plumbing', date: '2026-11-26', time: '14:00', dur: 1, tech: 't_ali', status: 'survey', title: T('Site survey — booster pump switch', 'معاينة — مفتاح مضخة التعزيز') },
    { id: 'SV-PR-24508', req: 'PR-24508', bid: 'BN-RAM-00311', unit: 'BN-RAM-00311-702', cat: 'hvac', date: '2026-11-26', time: '16:00', dur: 1, tech: 't_hadi', status: 'survey', title: T('Site survey — cassette AC drip', 'معاينة — تقطير مكيف الكاسيت') },
    { id: 'SV-PR-24519', req: 'PR-24519', bid: 'BN-RAM-00415', unit: null, cat: 'electrical', date: '2026-11-28', time: '10:00', dur: 1.5, tech: 't_yousef', status: 'survey', title: T('Survey — panel inspection scope', 'معاينة — نطاق فحص اللوحات') },
  ];
  const events = () => JOBS.map((j) => ({ ...j, dur: durOf(j) })).concat(SURVEYS);
  const evGo = (e) => (e.status === 'survey' ? `provider-request-${e.req}` : `provider-job-${e.id}`);
  const hhmm = (t) => { const [h, m] = t.split(':').map(Number); return h + m / 60; };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const TODAY = '2026-11-25';

  /* ======================================================================
     Screen: Schedule (week / day, technician lanes)
     ====================================================================== */
  function schedule() {
    const mode = B.get('p2:sm', 'week');
    const wk = +B.get('p2:wk', 0);
    const day = B.get('p2:day', TODAY);
    const sel = B.get('p2:ev', '');
    const evs = events().filter((e) => inLine(e.cat));
    const start = new Date(2026, 10, 22 + wk * 7); // Sunday
    const days = Array.from({ length: 7 }, (_, i) => iso(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)));
    const lane = (t) => `<div class="lane">${ui.avatar(t.name)}<span style="min-width:0"><b>${esc(tx(t.name))}</b><small>${esc(tx(t.role))}</small></span></div>`;
    const evBtn = (e, style = '') => `<button class="p2-ev ${e.status} ${sel === e.id ? 'on' : ''}" style="${style}" data-act="set" data-arg="p2:ev=${e.id}" title="${esc(tx(e.title))}"><b>${e.time} · ${esc(tx(e.title))}</b><span>${esc(tx(D.building(e.bid)?.name || ''))}</span></button>`;
    let grid;
    if (mode === 'week') {
      grid = `<div class="p2-cal"><div class="p2-grid" style="grid-template-columns:200px repeat(7, minmax(0, 1fr))">
        <div class="hd" style="border-inline-start:0;text-align:start">${L('Technician', 'الفني')}</div>
        ${days.map((d) => { const x = new Date(d + 'T12:00'); return `<div class="hd ${d === TODAY ? 'today' : ''}">${B.dow(x.getDay())}<b>${x.getDate()}</b></div>`; }).join('')}
        ${TEAM.map((t) => lane(t) + days.map((d) => { const x = new Date(d + 'T12:00'); const list = evs.filter((e) => e.tech === t.id && e.date === d).sort(B.by('time')); return `<div class="${x.getDay() === 5 ? 'off' : ''} ${d === TODAY ? 'now' : ''}">${list.map((e) => evBtn(e)).join('')}</div>`; }).join('')).join('')}
      </div></div>`;
    } else {
      const hrs = Array.from({ length: 11 }, (_, i) => 8 + i);
      const pos = (h) => ((h - 8) / 11) * 100;
      grid = `<div class="p2-cal"><div class="p2-hours"><div class="h" style="border-inline-start:0">${L('Technician', 'الفني')}</div>${hrs.map((h) => `<div class="h">${String(h).padStart(2, '0')}:00</div>`).join('')}</div>
        ${TEAM.map((t) => `<div class="p2-row">${lane(t)}<div class="p2-track">${day === TODAY ? `<span class="p2-nowline" style="inset-inline-start:${pos(10)}%"></span>` : ''}${evs.filter((e) => e.tech === t.id && e.date === day).map((e) => evBtn(e, `inset-inline-start:calc(${pos(hhmm(e.time))}% + 2px);width:calc(${(e.dur / 11) * 100}% - 4px)`)).join('')}</div></div>`).join('')}</div>`;
    }
    const e = evs.find((x) => x.id === sel);
    const panel = e ? ek.panel({ close: 'p2:ev', lead: `<span class="li-icon mint">${icon(D.cat(e.cat).icon)}</span>`, title: esc(tx(e.title)), sub: `${ui.idMono(e.id)} · ${esc(where(e.bid, e.unit))}`, badges: ui.status(e.status === 'survey' ? 'p2Survey' : e.status),
      body: `${ui.kv([[L('When', 'الموعد'), `${B.date(e.date)} · ${e.time} – ${(() => { const end = hhmm(e.time) + e.dur; return `${String(Math.floor(end)).padStart(2, '0')}:${end % 1 ? '30' : '00'}`; })()}`], [L('Technician', 'الفني'), esc(tx(tech(e.tech).name))], [L('Customer', 'العميل'), esc(D.pname(e.by || (V.req(e.req) || {}).by || 'p_yousef'))], e.amount ? [L('Agreed price', 'السعر المتفق عليه'), `<b>${B.money(e.amount)}</b>`] : [L('Purpose', 'الغرض'), L('Measure and confirm scope before quoting', 'القياس وتأكيد النطاق قبل التسعير')]])}
        ${B.map.render({ id: 'p2-evmap', static: true, selected: e.bid, focus: e.bid, height: '170px', legend: false, badge: false })}`,
      foot: `${ui.btn(L('Reassign', 'إعادة إسناد'), { icon: 'swap', act: 'p2Reassign', arg: e.id })}${ui.btn(e.status === 'survey' ? L('Open request', 'فتح الطلب') : L('Open job', 'فتح المهمة'), { icon: 'arrowRight', iconCls: 'flip', kind: 'primary', go: evGo(e) })}` }) : '';
    const weekEvs = evs.filter((x) => days.includes(x.date));
    const cap = TEAM.map((t) => { const h = B.sum(weekEvs.filter((x) => x.tech === t.id), (x) => x.dur || 2); return { t, h, pct: (h / 40) * 100 }; });
    const nav = mode === 'week'
      ? `${ui.btn('', { icon: 'chevL', iconCls: 'flip', size: 'sm', act: 'set', arg: `p2:wk=${wk - 1}`, title: L('Previous week', 'الأسبوع السابق') })}<b class="small" style="min-width:170px;text-align:center">${B.dateShort(days[0])} – ${B.date(days[6])}</b>${ui.btn('', { icon: 'chevR', iconCls: 'flip', size: 'sm', act: 'set', arg: `p2:wk=${wk + 1}`, title: L('Next week', 'الأسبوع التالي') })}`
      : `${ui.select('p2:day', days.map((d) => ({ v: d, l: `${B.dow(new Date(d + 'T12:00').getDay())} ${B.dateShort(d)}` })), { label: L('Day', 'اليوم') })}`;
    return `<div class="ek-page">${ek.head({ eyebrow: L('Operations', 'العمليات'), title: L('Schedule', 'الجدول'), sub: L('Visits and site surveys by technician. Select a block for details; customers see status changes live.', 'الزيارات والمعاينات حسب الفني. اختر موعداً لعرض التفاصيل؛ يرى العملاء تغيّر الحالة مباشرة.'), actions: ui.btn(L('Export calendar', 'تصدير التقويم'), { icon: 'download', act: 'soon', arg: L('Calendar export', 'تصدير التقويم') }) + ui.btn(L('Block time', 'حجز وقت'), { icon: 'plus', kind: 'primary', act: 'p2Block' }) })}
      ${ek.tb(`${ui.seg('p2:sm', [{ id: 'week', label: L('Week', 'أسبوع'), icon: 'calendar' }, { id: 'day', label: L('Day', 'يوم'), icon: 'clock' }], mode)}<div class="row-sm">${nav}</div><span class="sp"></span><div class="row-sm wrap xs faint" style="gap:12px"><span class="row-sm"><i class="ek-dot" style="background:var(--mint)"></i>${L('Scheduled', 'مُجدولة')}</span><span class="row-sm"><i class="ek-dot" style="background:var(--violet)"></i>${L('In progress / en route', 'قيد التنفيذ / في الطريق')}</span><span class="row-sm"><i class="ek-dot" style="border:1px dashed #9FB1BF"></i>${L('Site survey', 'معاينة')}</span></div>`)}
      ${ek.split(`<div>${grid}<div class="grid g2" style="margin-top:16px">
        ${ui.card({ title: L('Capacity this week', 'السعة هذا الأسبوع'), sub: L('Booked hours of a 40-hour week', 'الساعات المحجوزة من أسبوع 40 ساعة'), body: `<div class="p2-cap">${cap.map((c) => `<div class="r"><span class="ek-cell">${ui.avatar(c.t.name)}<span class="small">${esc(tx(c.t.name))}</span></span>${ek.mini(c.pct, c.pct > 80 ? 'warn' : 'mint')}<span class="ek-num small">${B.num1(c.h)} h</span></div>`).join('')}</div>` })}
        ${ui.card({ title: L('Waiting to be scheduled', 'بانتظار الجدولة'), sub: L('Quotes sent — book a slot when accepted', 'عروض مُرسلة — احجز موعداً عند القبول'), body: ui.list(QUOTES.filter((q) => q.status === 'sent').map((q) => { const r = V.req(q.req); return r ? ui.li({ icon: D.cat(r.cat).icon, tone: 'violet', title: esc(tx(r.title)), sub: `${ui.idMono(q.id)} · ${B.money(q.amount)} · ${r.pref ? B.dateShort(r.pref.date) + ' ' + V.slotL(r.pref.slot) : ''}`, go: `provider-request-${r.id}` }) : ''; })) })}
      </div></div>`, panel)}</div>`;
  }

  /* ======================================================================
     Screen: Service categories
     ====================================================================== */
  function categories() {
    const p = P();
    const sel = B.get('p2:cat', '');
    const rows = D.serviceCats.map((c) => {
      const jobs = JOBS.filter((j) => j.cat === c.id);
      const sh = jobs.length / JOBS.length;
      return { ...c, on: p.cats.includes(c.id), jobs: Math.round(sh * 72), rev: Math.round((sh * 123240) / 10) * 10, svcs: p.cats.includes(c.id) ? M.services(PID).filter((s) => s.cat === c.id) : [] };
    });
    const c = rows.find((r) => r.id === sel);
    const panel = c ? ek.panel({ close: 'p2:cat', lead: `<span class="li-icon mint">${icon(c.icon)}</span>`, title: tx(c.name), sub: c.on ? L(`${c.svcs.length} services listed in the marketplace`, `${c.svcs.length} خدمات مدرجة في السوق`) : L('Not offered yet', 'غير متاحة بعد'), badges: ui.status(c.on ? 'p2Offered' : 'p2NotOffered'),
      body: c.on ? `${ek.ps(L('Services & starting prices', 'الخدمات وأسعار البدء'), c.svcs.map((s) => `<div class="p2-svc"><span style="min-width:0"><b style="font-weight:600">${tx(s.name)}</b><small>${tx(s.dur)}</small></span><b class="ek-num">${B.money(s.price)} <span class="xs faint" style="font-weight:500">${M.unitLabel(s.unit)}</span></b>${ui.btn('', { icon: 'edit', size: 'sm', act: 'p2Price', arg: s.key, title: L('Edit price', 'تعديل السعر') })}</div>`).join(''))}
        ${ek.ps(L('Qualified technicians', 'الفنيون المؤهلون'), `<div class="row-sm wrap">${TEAM.filter((t) => t.skills.includes(c.id)).map((t) => `<span class="badge outline">${esc(tx(t.name))}</span>`).join('') || `<span class="small muted">${L('None — assign a skill in the team profile', 'لا أحد — أضف المهارة في ملف الفريق')}</span>`}</div>`)}`
        : `${ek.ps(L('Standard services in this category', 'الخدمات القياسية في هذه الفئة'), M.catalog(c.id).map((s) => `<div class="p2-svc"><span style="min-width:0"><b style="font-weight:600">${tx(s.name)}</b><small>${tx(s.d)}</small></span><span class="xs faint ek-num">${L('market', 'السوق')} ~${B.money(s.price)}</span><span></span></div>`).join(''))}${ui.callout(L('Adding a category requires a matching licence or certificate. BENA reviews it before customers can see the category on your profile.', 'تتطلب إضافة فئة رخصة أو شهادة مطابقة. تراجعها بينا قبل أن يرى العملاء الفئة في ملفك.'), '', 'shieldCheck')}`,
      foot: c.on ? `${ui.btn(L('Pause category', 'إيقاف الفئة'), { icon: 'minus', act: 'p2CatToggle', arg: c.id })}${ui.btn(L('Preview in marketplace', 'معاينة في السوق'), { icon: 'eye', kind: 'primary', go: `provider-services-${c.id}` })}` : ui.btn(L('Apply to offer', 'تقديم طلب إضافة'), { icon: 'plus', kind: 'primary', act: 'p2CatToggle', arg: c.id }) }) : '';
    return `<div class="ek-page">${ek.head({ eyebrow: L('Company', 'الشركة'), title: L('Service categories', 'فئات الخدمات'), sub: L('What you offer in the BENA services marketplace, at which starting prices, and how each line performs.', 'ما تقدمه في سوق خدمات بينا، وبأي أسعار بدء، وأداء كل خط خدمة.'), actions: ui.btn(L('Public profile', 'الملف العام'), { icon: 'eye', go: `provider-provider-${PID}` }) })}
      ${ek.strip([{ l: L('Categories offered', 'الفئات المتاحة'), v: p.cats.length, unit: `/ ${D.serviceCats.length}`, icon: 'layers' }, { l: L('Services listed', 'الخدمات المدرجة'), v: M.services(PID).length, icon: 'list' }, { l: L('Lowest starting price', 'أقل سعر بدء'), v: B.money(M.fromPrice(PID)), icon: 'tag' }, { l: L('Top line by revenue', 'الخط الأعلى إيراداً'), v: tx(D.cat(rows.filter((r) => r.on).sort((a, b) => b.rev - a.rev)[0].id).name), icon: 'trend' }])}
      ${ek.split(`<div>${ek.selStyle('p2-ct', sel)}${ui.table({ id: 'p2-ct', cls: 'p2-ct', rows, rowAct: (r) => ({ act: 'set', arg: `p2:cat=${r.id}` }), cols: [
        { key: 'name', label: L('Category', 'الفئة'), m: 'title', render: (r) => ek.cell(r.icon, tx(r.name), r.on ? L(`${r.svcs.length} services`, `${r.svcs.length} خدمات`) : L('Not offered', 'غير متاحة'), r.on ? 'mint' : ''), mRender: (r) => tx(r.name) },
        { key: 'on', label: L('Status', 'الحالة'), m: 'end', render: (r) => ui.status(r.on ? 'p2Offered' : 'p2NotOffered') },
        { key: 'from', label: L('From', 'ابتداءً من'), align: 'end', m: 'meta', render: (r) => (r.on ? `<span class="ek-num">${B.money(Math.min(...r.svcs.map((s) => s.price)))}</span>` : '<span class="faint">—</span>') },
        { key: 'jobs', label: L('Jobs (90 days)', 'المهام (90 يوماً)'), align: 'end', sort: true, m: 'meta', render: (r) => `<span class="ek-num">${r.jobs || '—'}</span>` },
        { key: 'rev', label: L('Revenue (90 days)', 'الإيراد (90 يوماً)'), align: 'end', sort: true, m: 'sub', render: (r) => (r.rev ? `<b class="ek-num">${B.money(r.rev)}</b>` : '<span class="faint">—</span>') },
      ] })}</div>`, panel)}
      <div style="margin-top:16px">${ui.demoNote(L('Prices are starting prices shown to customers; the final price is always confirmed in a quotation.', 'الأسعار المعروضة أسعار بدء؛ ويُثبّت السعر النهائي دائماً في عرض السعر.'))}</div></div>`;
  }

  /* ======================================================================
     Screen: Service coverage (map + districts)
     ====================================================================== */
  const DIST = { manara: [35, 12], masyoun: [25, 8], tireh: [40, 15], einmunjed: [30, 10], irsal: [45, 14], oldcity: [70, 22], maahid: [55, 18], batnalhawa: [80, 25] };
  function coverage() {
    const p = P();
    const ly = { parcels: B.get('p2:lyp', false), labels: B.get('p2:lyl', true), terrain: B.get('p2:lyt', true) };
    const showJobs = B.get('p2:lyj', true);
    const covered = new Set(D.buildings.filter((b) => p.areas.includes(b.district)).map((b) => b.id));
    const active = JOBS.filter((j) => j.status !== 'completed' && inLine(j.cat));
    const markers = showJobs ? [...new Set(active.map((j) => j.bid))].map((bid) => ({ id: bid, label: String(active.filter((j) => j.bid === bid).length), tone: 'navy' })) : [];
    const rows = D.districts.map((d) => ({ ...d, on: p.areas.includes(d.id), jobs: JOBS.filter((j) => D.building(j.bid)?.district === d.id).length, eta: DIST[d.id] }));
    const lyBox = (k, label, v) => `<label><input type="checkbox" id="f-${k.replace(/[^a-z0-9]/gi, '')}" data-model="${k}" ${v ? 'checked' : ''}>${label}</label>`;
    return `<div class="ek-page">${ek.head({ eyebrow: L('Company', 'الشركة'), title: L('Service coverage', 'نطاق الخدمة'), sub: L('Districts where customers can find and invite you. Buildings outside your coverage can still invite you directly.', 'المناطق التي يمكن للعملاء فيها العثور عليك ودعوتك. ويمكن للمباني خارج نطاقك دعوتك مباشرة.'), actions: ui.btn(L('Save coverage', 'حفظ النطاق'), { icon: 'check', kind: 'primary', act: 'toast', arg: L('Coverage saved — marketplace updated', 'تم حفظ النطاق — تم تحديث السوق') }) })}
      ${ek.strip([{ l: L('Districts covered', 'المناطق المغطاة'), v: p.areas.length, unit: `/ ${D.districts.length}`, icon: 'map' }, { l: L('Buildings in range', 'المباني ضمن النطاق'), v: B.num(covered.size), s: L('on the sample map', 'على الخريطة النموذجية'), icon: 'building' }, { l: L('Active jobs on map', 'المهام النشطة على الخريطة'), v: active.length, icon: 'pin' }, { l: L('Avg. travel time', 'متوسط زمن الوصول'), v: `${Math.round(B.sum(rows.filter((r) => r.on), (r) => r.eta[0]) / Math.max(1, p.areas.length))} ${L('min', 'د')}`, s: L('From the Al-Manara workshop', 'من ورشة المنارة'), icon: 'truck' }])}
      <div class="p2-cov">
        <div><div class="p2-ly">${lyBox('p2:lyj', L('Active jobs', 'المهام النشطة'), showJobs)}${lyBox('p2:lyl', L('Labels', 'التسميات'), ly.labels)}${lyBox('p2:lyt', L('Terrain', 'التضاريس'), ly.terrain)}${lyBox('p2:lyp', L('Parcels', 'قطع الأراضي'), ly.parcels)}</div>
          ${B.map.render({ id: 'p2-cov', visible: covered, layers: ly, markers, height: '560px', onSelect: 'p2MapSel', badge: L('Simulated GIS · coverage preview', 'نظم معلومات محاكاة · معاينة النطاق') })}</div>
        <div>${ui.table({ id: 'p2-dt', rows, cols: [
          { key: 'name', label: L('District', 'المنطقة'), m: 'title', render: (d) => `<b>${tx(d.name)}</b><div class="xs faint">${B.num(d.buildings)} ${L('buildings', 'مبنى')}</div>`, mRender: (d) => tx(d.name) },
          { key: 'eta', label: L('Travel', 'الوصول'), align: 'end', m: 'meta', render: (d) => `<span class="ek-num small">${d.eta[0]} ${L('min', 'د')}</span>` },
          { key: 'jobs', label: L('Jobs', 'المهام'), align: 'end', m: 'meta', render: (d) => `<span class="ek-num small">${d.jobs || '—'}</span>` },
          { key: 'on', label: L('Coverage', 'التغطية'), align: 'end', m: 'end', render: (d) => `<label class="switch" data-stop title="${esc(tx(d.name))}"><input type="checkbox" data-act="p2Area" data-arg="${d.id}" ${d.on ? 'checked' : ''}><i></i></label>` },
        ] })}
        <div style="margin-top:12px">${ui.callout(L('Turning a district on lists you for every building there. Travel times are estimates from your workshop in Al-Manara.', 'تفعيل منطقة يُدرجك لكل مبانيها. أزمنة الوصول تقديرية من ورشتك في المنارة.'), '', 'info')}</div></div>
      </div></div>`;
  }

  /* ======================================================================
     Screen: Performance overview
     ====================================================================== */
  function performance() {
    const p = P();
    const done = JOBS.filter((j) => j.status === 'completed');
    const rated = done.filter((j) => j.rating);
    const months = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const rev = [29800, 31200, 33400, 30900, 35600, 37100, 38200, 41500, 36900, 44100, 47300, 31840];
    const resp = [3.1, 2.9, 2.7, 2.8, 2.4, 2.3, 2.2, 2.1, 2.0, 1.9, 1.9, 1.8];
    const Q90 = 123240, N90 = 72;
    const techRows = TEAM.map((t) => { const js = done.filter((j) => j.tech === t.id); const rs = js.filter((j) => j.rating); const sh = t.id === 't_yousef' ? 0.06 : (js.length / done.length) * 0.94; return { t, n: Math.round(sh * N90), rev: Math.round((sh * Q90) / 10) * 10, rating: rs.length ? B.sum(rs, (j) => j.rating) / rs.length : null, ontime: [96, 92, 94, 89, 85][TEAM.indexOf(t)] }; });
    const doneRev = B.sum(done, (j) => j.amount) || 1;
    const byCat = p.cats.map((c, i) => ({ label: tx(D.cat(c).name), value: Math.round((B.sum(done.filter((j) => j.cat === c), (j) => j.amount) / doneRev) * B.sum(rev) / 10) * 10, color: B.charts.palette[i] }));
    const slaRow = (pct, t, s, tone) => `<div>${B.charts.ring(pct, { size: 46, color: tone, label: '' })}<div style="min-width:0"><b>${t}</b><span>${s}</span></div></div>`;
    return `<div class="ek-page">${ek.head({ eyebrow: L('Insights', 'المؤشرات'), title: L('Performance overview', 'نظرة على الأداء'), sub: L('Service levels, customer ratings, response times and revenue — last 12 months.', 'مستويات الخدمة وتقييمات العملاء وأزمنة الاستجابة والإيرادات — آخر 12 شهراً.'), actions: ui.btn(L('Customer feedback', 'آراء العملاء'), { icon: 'star', go: 'provider-feedback' }) + ui.btn(L('Download report', 'تنزيل التقرير'), { icon: 'download', kind: 'primary', act: 'previewDoc', arg: L('Performance report — Nov 2026.pdf', 'تقرير الأداء — ت٢ 2026.pdf') }) })}
      ${ek.strip([{ l: L('Revenue (12 months)', 'الإيراد (12 شهراً)'), v: B.money(B.sum(rev)), s: L('+18% vs previous year', '+18% مقارنة بالعام السابق'), tone: 'ok', icon: 'wallet' }, { l: L('Jobs completed', 'المهام المنجزة'), v: B.num(p.jobs), s: L('23 this month', '23 هذا الشهر'), icon: 'checkCircle' }, { l: L('Average rating', 'متوسط التقييم'), v: B.num1(p.rating), unit: '/ 5', s: L(`${p.reviews} reviews`, `${p.reviews} مراجعة`), icon: 'star' }, { l: L('Median first response', 'وسيط أول رد'), v: '1 h 50', s: L('Marketplace median ~3 h', 'وسيط السوق ~3 ساعات'), tone: 'ok', icon: 'clock' }, { l: L('Quote win rate', 'نسبة قبول العروض'), v: '64%', s: L('90 days', '90 يوماً'), icon: 'trend' }])}
      <div class="p2-sla">
        ${slaRow(94, '94%', L('Requests answered within 4 h · target 90%', 'طلبات رُدّ عليها خلال 4 ساعات · الهدف 90%'), '#36D6A0')}
        ${slaRow(91, '91%', L('On-time arrival · target 90%', 'الوصول في الموعد · الهدف 90%'), '#36D6A0')}
        ${slaRow(88, '88%', L('Finished within quoted time · target 90%', 'الإنجاز ضمن المدة المعروضة · الهدف 90%'), '#E9A23B')}
        ${slaRow(98, '2.1%', L('Callbacks within 30 days · target < 3%', 'إعادة الزيارة خلال 30 يوماً · الهدف < 3%'), '#36D6A0')}
      </div>
      <div class="grid g-main" style="align-items:start">
        <div class="stack">
          ${ui.card({ title: L('Monthly revenue', 'الإيراد الشهري'), sub: L('Paid through BENA · November to date', 'مدفوع عبر بينا · تشرين الثاني حتى الآن'), body: B.charts.bars({ data: months.map((m, i) => ({ label: B.mon(m), value: rev[i], color: i === 11 ? '#36D6A0' : '#142B3B' })), height: 210, format: (v) => '₪' + B.compact(v) }) })}
          ${ui.card({ title: L('Technician performance', 'أداء الفنيين'), sub: L('Last 90 days · owner time includes inspections', 'آخر 90 يوماً · يشمل وقت المالك المعاينات'), cls: 'pad-0', body: ui.table({ id: 'p2-tech', rows: techRows, cols: [
            { key: 't', label: L('Technician', 'الفني'), m: 'title', render: (r) => `<span class="ek-cell">${ui.avatar(r.t.name)}<span><span class="t">${esc(tx(r.t.name))}</span><span class="d">${esc(tx(r.t.role))}</span></span></span>`, mRender: (r) => esc(tx(r.t.name)) },
            { key: 'n', label: L('Jobs', 'المهام'), align: 'end', sort: true, m: 'meta', render: (r) => `<span class="ek-num">${r.n}</span>` },
            { key: 'rating', label: L('Rating', 'التقييم'), align: 'end', sort: (r) => r.rating || 0, m: 'meta', render: (r) => (r.rating ? `<span class="ek-num">★ ${B.num1(r.rating)}</span>` : '<span class="faint">—</span>') },
            { key: 'ontime', label: L('On time', 'في الموعد'), sort: true, m: 'sub', render: (r) => `<div class="row-sm" style="min-width:120px">${ek.mini(r.ontime, r.ontime < 90 ? 'warn' : 'mint')}<span class="ek-num small">${r.ontime}%</span></div>` },
            { key: 'rev', label: L('Revenue', 'الإيراد'), align: 'end', sort: true, m: 'end', render: (r) => `<b class="ek-num">${B.money(r.rev)}</b>` },
          ] }) })}
        </div>
        <div class="stack">
          ${ui.card({ title: L('First-response time', 'زمن أول رد'), sub: L('Median hours per month', 'الوسيط بالساعات شهرياً'), body: B.charts.line({ labels: months.map((m) => B.mon(m)), series: [{ name: L('Hours', 'ساعات'), color: '#36D6A0', values: resp, area: true }], height: 170, format: (v) => B.num1(v) + 'h' }) })}
          ${ui.card({ title: L('Revenue by category', 'الإيراد حسب الفئة'), sub: L('Share of 12-month revenue', 'الحصة من إيراد 12 شهراً'), body: B.charts.donut({ size: 140, data: byCat, center: { value: '₪' + B.compact(B.sum(byCat, (x) => x.value)), label: L('12 months', '12 شهراً') }, format: (v) => B.money(v) }) })}
          ${ui.card({ title: L('Ratings', 'التقييمات'), body: `${M.distBlock(PID)}<div class="xs faint" style="margin-top:10px">${L(`Recent jobs average ★ ${B.num1(B.sum(rated, (j) => j.rating) / rated.length)}`, `متوسط المهام الأخيرة ★ ${B.num1(B.sum(rated, (j) => j.rating) / rated.length)}`)}</div>` })}
        </div>
      </div>
      <div style="margin-top:16px">${ui.demoNote(L('Metrics are simulated demonstration data. Service-level targets are set by the provider, not by BENA.', 'المؤشرات بيانات عرض محاكاة. أهداف مستوى الخدمة يحددها المزوّد وليس بينا.'))}</div></div>`;
  }

  /* ---------------- Job details (menu entry opens the next active job) ---------------- */
  const jobDetail = (id, r) => {
    const target = id || (JOBS.filter((j) => j.status !== 'completed').sort(B.by((j) => j.date + j.time))[0] || JOBS[0]).id;
    const html = V.pages.jobPage(target, r);
    const j = job(target);
    B.navActive(id ? (j && j.status === 'completed' ? 'completed' : 'job') : 'job');
    B.crumbs([{ label: P().name, go: 'provider-home' }, { label: j && j.status === 'completed' ? L('Work history', 'سجل الأعمال') : L('Assigned jobs', 'المهام المسندة'), go: j && j.status === 'completed' ? 'provider-completed' : 'provider-jobs' }, { label: j ? tx(j.title) : L('Job details', 'تفاصيل المهمة') }]);
    const others = JOBS.filter((x) => x.status !== 'completed' && x.id !== target).sort(B.by((x) => x.date + x.time)).slice(0, 6);
    return html + (others.length ? `<div class="ek-sec">${L('Other active jobs', 'مهام نشطة أخرى')}</div><div class="card pad-0">${ui.list(others.map((x) => ui.li({ icon: D.cat(x.cat).icon, tone: 'mint', title: esc(tx(x.title)), sub: `${ui.idMono(x.id)} · ${B.dateShort(x.date)} ${x.time} · ${esc(tx(tech(x.tech).name))}`, end: ui.status(x.status), go: `provider-job-${x.id}` })))}</div>` : '');
  };
  const reqDetail = (id, r) => { const html = V.pages.request(id, r); B.crumbs([{ label: P().name, go: 'provider-home' }, { label: L('Incoming requests', 'الطلبات الواردة'), go: 'provider-requests' }, { label: B._title || id }]); return html; };

  /* ---------------- actions ---------------- */
  const A = B.act;
  A.p2Reassign = (id) => {
    const e = events().find((x) => x.id === id); if (!e) return;
    B.modal({ title: L('Reassign visit', 'إعادة إسناد الزيارة'), sub: esc(tx(e.title)), form: 'p2Reassign', size: 'sm',
      body: `<input type="hidden" name="id" value="${esc(id)}">${ui.field({ name: 'tech', label: L('Technician', 'الفني'), type: 'radio', value: e.tech, options: TEAM.map((t) => ({ v: t.id, l: tx(t.name), d: tx(t.role), icon: t.skills.includes(e.cat) ? 'badgeCheck' : 'user' })) })}`,
      foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${L('Reassign', 'إعادة إسناد')}</button>` });
  };
  B.submit.p2Reassign = (d) => { const j = job(d.id) || SURVEYS.find((s) => s.id === d.id); if (j && d.tech) j.tech = d.tech; B.closeModal(true); B.refresh(); B.toast(L(`Assigned to ${tx(tech(d.tech).name)} — customer notified`, `أُسندت إلى ${tx(tech(d.tech).name)} — تم إشعار العميل`)); };
  A.p2Block = () => B.modal({ title: L('Block time', 'حجز وقت'), form: 'p2Block', size: 'sm', body: `<div class="form-grid">${ui.field({ name: 'tech', label: L('Technician', 'الفني'), type: 'select', full: true, options: TEAM.map((t) => ({ v: t.id, l: t.name })) })}${ui.field({ name: 'date', label: L('Date', 'التاريخ'), type: 'date', value: '2026-11-26' })}${ui.field({ name: 'time', label: L('From', 'من'), type: 'time', value: '08:00' })}${ui.field({ name: 'why', label: L('Reason', 'السبب'), type: 'select', full: true, options: [{ v: 'training', l: L('Training', 'تدريب') }, { v: 'leave', l: L('Leave', 'إجازة') }, { v: 'workshop', l: L('Workshop / stock', 'الورشة / المخزون') }] })}</div>`, foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${L('Block', 'حجز')}</button>` });
  B.submit.p2Block = (d) => { SURVEYS.push({ id: 'BL-' + String(Date.now()).slice(-4), req: null, bid: 'BN-RAM-00311', unit: null, cat: 'general', date: /^\d{4}-\d{2}-\d{2}$/.test(d.date || '') ? d.date : '2026-11-26', time: d.time || '08:00', dur: 2, tech: d.tech || 't_rami', status: 'survey', title: { training: T('Training', 'تدريب'), leave: T('Leave', 'إجازة'), workshop: T('Workshop / stock', 'الورشة / المخزون') }[d.why] || T('Blocked', 'محجوز') }); B.closeModal(true); B.refresh(); B.toast(L('Time blocked in the schedule', 'تم حجز الوقت في الجدول')); };
  A.p2CatToggle = (c) => { const p = P(); if (p.cats.includes(c)) { if (p.cats.length <= 1) return B.toast(L('Keep at least one category', 'أبقِ فئة واحدة على الأقل'), 'info'); p.cats = p.cats.filter((x) => x !== c); B.refresh(); B.toast(L('Category paused — hidden from new searches', 'تم إيقاف الفئة — مخفية من عمليات البحث الجديدة')); } else B.success({ title: L('Application submitted', 'تم تقديم الطلب'), text: L('Upload the matching licence in Company profile. The category goes live after review.', 'ارفع الرخصة المطابقة في ملف الشركة. تُفعّل الفئة بعد المراجعة.'), ref: 'CAT-' + c.toUpperCase().slice(0, 4) }); };
  A.p2Price = (key) => { const s = M.services(PID).find((x) => x.key === key); if (!s) return; B.modal({ title: L('Edit starting price', 'تعديل سعر البدء'), sub: tx(s.name), form: 'p2Price', size: 'sm', body: `<input type="hidden" name="key" value="${esc(key)}">${ui.field({ name: 'price', label: L(`Price (₪) ${M.unitLabel(s.unit)}`, `السعر (₪) ${M.unitLabel(s.unit)}`), type: 'number', value: s.price, min: 1, required: true })}`, foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${L('Save', 'حفظ')}</button>` }); };
  B.submit.p2Price = (d) => { const v = Math.max(1, Math.round(+d.price || 0)); if (v) M.priceOv[d.key] = v; B.closeModal(true); B.refresh(); B.toast(L('Price updated in the marketplace', 'تم تحديث السعر في السوق')); };
  A.p2Area = (id, el) => { const p = P(); const on = el ? el.checked : !p.areas.includes(id); p.areas = on ? [...new Set(p.areas.concat(id))] : p.areas.filter((a) => a !== id); B.refresh(); B.toast(on ? L(`${tx(D.district(id).name)} added to coverage`, `أُضيفت ${tx(D.district(id).name)} إلى النطاق`) : L(`${tx(D.district(id).name)} removed from coverage`, `أُزيلت ${tx(D.district(id).name)} من النطاق`)); };
  A.p2MapSel = (bid) => { const b = D.building(bid); if (!b) return; const p = P(); const on = p.areas.includes(b.district); B.modal({ title: esc(tx(b.name)), sub: `${ui.idMono(b.id)} · ${tx(D.district(b.district).name)}`, size: 'sm', body: `${ui.kv([[L('Type', 'النوع'), D.typeLabel(b.type)], [L('Floors / units', 'الطوابق / الوحدات'), `${b.floors} / ${b.units}`], [L('Coverage', 'التغطية'), ui.status(on ? 'p2Covered' : 'p2NotCovered')], [L('Your jobs here', 'مهامك هنا'), JOBS.filter((j) => j.bid === b.id).length || '—']])}`, foot: ui.btn(L('Building profile', 'ملف المبنى'), { icon: 'building', kind: 'primary', go: `provider-building-${b.id}` }) }); };

  /* ---------------- re-register the role ---------------- */
  const base = B.roles[R];
  B.role(Object.assign({}, base, {
    nav: 'drawer',
    workspaces: [{ id: 'all', label: T('All service lines', 'كل خطوط الخدمة'), icon: 'layers' }].concat(P().cats.map((c) => ({ id: c, label: D.cat(c).name, icon: D.cat(c).icon }))),
    menu: [
      { group: T('Company', 'الشركة') },
      { id: 'home', label: T('Company overview', 'نظرة عامة على الشركة'), icon: 'grid' },
      { id: 'profile', label: T('Company profile', 'ملف الشركة'), icon: 'briefcase' },
      { id: 'categories', label: T('Service categories', 'فئات الخدمات'), icon: 'layers' },
      { id: 'coverage', label: T('Service coverage', 'نطاق الخدمة'), icon: 'map' },
      { group: T('Work', 'العمل') },
      { id: 'requests', label: T('Incoming requests', 'الطلبات الواردة'), icon: 'inbox', match: ['request'], get count() { return V.newCount() || null; } },
      { id: 'quotations', label: T('Quotations', 'عروض الأسعار'), icon: 'receipt' },
      { id: 'jobs', label: T('Assigned jobs', 'المهام المسندة'), icon: 'calendarCheck' },
      { id: 'job', label: T('Job details', 'تفاصيل المهمة'), icon: 'clipboard' },
      { id: 'schedule', label: T('Schedule', 'الجدول'), icon: 'calendar' },
      { id: 'completed', label: T('Work history', 'سجل الأعمال'), icon: 'history' },
      { group: T('Insights', 'المؤشرات') },
      { id: 'performance', label: T('Performance overview', 'نظرة على الأداء'), icon: 'chart', match: ['feedback'] },
      { group: T('Marketplaces', 'الأسواق') },
      { id: 'services', label: T('Services marketplace', 'سوق الخدمات'), icon: 'store', match: ['provider', 'servicedetail', 'quotes', 'servicehistory'] },
      { id: 'properties', label: T('Property marketplace', 'سوق العقارات'), icon: 'home', match: ['listing'] },
    ],
    pages: Object.assign({}, base.pages, { categories, coverage, schedule, performance, job: jobDetail, request: reqDetail }),
  }));
})();
