/*
 * BENA — Facility Management workspace, part 2 (role `facility`).
 * Maintenance calendar (month / week with team lanes), inspections, service history,
 * energy & water (estimated sample readings — no live meters) and facility reports.
 * Uses internals exposed by facility.js on B.data.fmX. All data is fictional.
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon, ui } = B;
  const D = B.data;
  const F = D.fmX;
  if (!F || !B.roles.facility) return;
  const { R, TODAY, T, SITE, SITE_IDS, sshort, CATS, SYSTEMS, ASSETS, asset, assetsOf, healthScore, TECHS, tname, WOS, wo, isOpen, isLate, PM, FREQ, pmOccurs, CHECK, TEAM, nextCell, tag, cond, prio, fIds, inFs, siteSel, fcrumbs, fhead, opsStrip, sec, keysOf } = F;
  const xt = B.xtable;
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const toD = (s) => new Date(s + 'T12:00:00');
  const addD = (s, n) => { const d = toD(s); d.setDate(d.getDate() + n); return iso(d); };
  const seedOf = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const pBy = (p) => (p.by === 'in' ? (TEAM[p.cat] || ['t_yazan'])[0] : 'contractors');
  const pmAsset = (p, site) => ASSETS.find((a) => a.b === `BN-RAM-00${site}` && (a.cat === p.cat || (p.cat === 'water' && a.cat === 'water'))) || ASSETS.find((a) => a.b === `BN-RAM-00${site}`);

  B.css(`
  .fm-cal-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
  .fm-cal-tools h3 { font-size: 16px; min-width: 190px; text-align: center; font-family: var(--font-display); }
  .fm-cal-tools .select { height: 36px; font-size: 13.5px; width: auto; min-width: 150px; }
  .fm-lanes { display: grid; grid-template-columns: 168px repeat(7, minmax(0, 1fr)); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; background: var(--line-2); gap: 1px; }
  .fm-lanes > div { background: #fff; min-width: 0; }
  .fm-lanes .lh { padding: 8px 10px; font-size: 12px; font-weight: 650; color: var(--text-3); background: var(--surface-2); text-align: center; }
  .fm-lanes .lh b { display: block; font-size: 15px; color: var(--ink); font-family: ui-monospace, "SF Mono", Menlo, monospace; }
  .fm-lanes .lh.today { background: var(--navy); color: var(--navy-ink); } .fm-lanes .lh.today b { color: var(--mint); }
  .fm-lanes .ln { padding: 8px 10px; display: flex; align-items: center; gap: 8px; background: var(--surface-2); }
  .fm-lanes .ln b { font-size: 13px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fm-lanes .ln small { font-size: 12px; color: var(--text-3); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fm-lanes .lc { padding: 5px; display: flex; flex-direction: column; gap: 4px; min-height: 64px; }
  .fm-lanes .lc.today { background: #F3FBF8; }
  .fm-ev { display: block; width: 100%; text-align: start; border-radius: 7px; padding: 4px 6px; font-size: 12px; line-height: 1.25; background: #EEF3F6; color: var(--navy); border-inline-start: 3px solid var(--navy); overflow: hidden; }
  .fm-ev span { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fm-ev em { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-style: normal; font-family: ui-monospace, Menlo, monospace; font-size: 12px; color: var(--text-3); }
  .fm-ev.pm { background: #E8FAF3; border-color: var(--mint-ink); }
  .fm-ev.insp { background: #E5EEFC; border-color: var(--info); }
  .fm-ev.crit { background: var(--bad-bg); border-color: var(--bad); }
  .fm-ev.late { background: #FFF4E5; border-color: var(--warn); }
  .fm-ev.done { opacity: .55; }
  .fm-ev:hover { filter: brightness(.97); }
  .fm-cal .cal .day { min-height: 92px; }
  .fm-tmpl { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
  .fm-tmpl button { border: 1px solid var(--line); border-radius: 12px; padding: 12px; background: #fff; text-align: start; display: flex; flex-direction: column; gap: 6px; }
  .fm-tmpl button.on { border-color: var(--navy); box-shadow: 0 0 0 1px var(--navy) inset; }
  .fm-tmpl b { font-size: 14px; } .fm-tmpl span { font-size: 12px; color: var(--text-3); }
  .fm-chk-list { display: flex; flex-direction: column; }
  .fm-chk-list div { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--line-2); font-size: 13.5px; align-items: flex-start; }
  .fm-chk-list div:last-child { border-bottom: 0; }
  .fm-chk-list i { width: 20px; height: 20px; border-radius: 6px; border: 1.5px solid #B4C2CC; flex: none; display: grid; place-items: center; font-style: normal; font-size: 12px; color: var(--text-3); font-family: ui-monospace, Menlo, monospace; }
  .fm-res { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; font-weight: 650; white-space: nowrap; }
  .fm-res svg { width: 14px; height: 14px; }
  .fm-res.pass { color: var(--ok); } .fm-res.minor { color: var(--warn); } .fm-res.fail { color: var(--bad); }
  .fm-score { display: inline-flex; min-width: 46px; justify-content: center; padding: 2px 8px; border-radius: 6px; font-family: ui-monospace, Menlo, monospace; font-size: 12.5px; font-weight: 700; }
  .fm-score.g { background: var(--ok-bg); color: var(--ok); } .fm-score.a { background: var(--warn-bg); color: var(--warn); } .fm-score.r { background: var(--bad-bg); color: var(--bad); }
  .fm-docprev { border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
  .fm-docprev .dh { background: var(--navy); color: #fff; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; }
  .fm-docprev .dh .fm-k { color: var(--mint); }
  .fm-docprev .db { padding: 14px 16px; background: #fff; }
  .fm-docprev .db i { display: block; height: 8px; border-radius: 4px; background: #E3E9EC; margin-top: 8px; }
  .fm-anom { display: grid; grid-template-columns: 4px minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line-2); }
  .fm-anom:last-child { border-bottom: 0; }
  .fm-anom .sev { align-self: stretch; border-radius: 4px; background: #F2B35A; } .fm-anom.hi .sev { background: var(--bad); } .fm-anom.lo .sev { background: #7FA7C2; }
  .fm-anom b { font-size: 13.5px; display: block; } .fm-anom small { font-size: 12px; color: var(--text-3); }
  .fm-est { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 650; color: #8A4108; background: #FDF1DC; border-radius: 6px; padding: 1px 7px; white-space: nowrap; }
  @media (max-width: 1100px) { .fm-lanes { grid-template-columns: 120px repeat(7, minmax(84px, 1fr)); overflow-x: auto; } }
  @media (max-width: 767px) { .fm-lanes-wrap { overflow-x: auto; margin-inline: -16px; padding-inline: 16px; } .fm-lanes { grid-template-columns: 110px repeat(7, 104px); width: max-content; } .fm-cal-tools h3 { min-width: 0; flex: 1; font-size: 15px; } }
  `);

  /* =====================================================================
   * Shared event model (work orders + PM occurrences + statutory inspections)
   * ===================================================================== */
  const LANES = Object.keys(TECHS).concat(['contractors']);
  const laneName = (k) => (k === 'contractors' ? L('Specialist contractors', 'مقاولون متخصصون') : tname(k));
  const laneRole = (k) => (k === 'contractors' ? L('LiftLine · CoolAir · Volt · PureTank', 'لفت لاين · كول إير · فولت · بيور تانك') : tx(TECHS[k].r));
  const eventsIn = (from, to) => {
    const ev = [];
    WOS.forEach((w) => {
      const a = asset(w.asset); if (!a || !inFs(a.b)) return;
      const d = w.status === 'completed' ? w.closed : w.due;
      if (d < from || d > to) return;
      ev.push({ date: d, kind: 'wo', lane: w.tech || (w.contractor ? 'contractors' : 'unassigned'), title: tx(w.title), code: w.id, cls: w.status === 'completed' ? 'done' : w.priority === 'critical' ? 'crit' : isLate(w) ? 'late' : '', go: `${R}-wo-${w.id}`, site: a.b });
    });
    PM.forEach((p) => {
      p.sites.forEach((s) => {
        const bid = `BN-RAM-00${s}`; if (!inFs(bid)) return;
        const dates = new Set();
        const nx = addD(p.next, +s % 3);
        if (nx >= from && nx <= to) dates.add(nx);
        if (p.last && p.last >= from && p.last <= to) dates.add(p.last);
        const a0 = toD(from), a1 = toD(to);
        for (let y = a0.getFullYear(), m = a0.getMonth(); y < a1.getFullYear() || (y === a1.getFullYear() && m <= a1.getMonth()); m === 11 ? (y++, m = 0) : m++) {
          if (!pmOccurs(p, y, m)) continue;
          const day = Math.min(p.day + (+s % 3), new Date(y, m + 1, 0).getDate());
          const k = iso(new Date(y, m, day));
          if (k >= from && k <= to && k > p.next) dates.add(k);
        }
        dates.forEach((d) => { const a = pmAsset(p, s); ev.push({ date: d, kind: 'pm', lane: pBy(p), title: tx(p.n), code: `${p.id} · ${s}`, cls: d < TODAY ? 'done' : 'pm', act: 'fmPM', arg: p.id, site: bid, asset: a && a.tag }); });
      });
    });
    INSP().forEach((x) => { if (x.next >= from && x.next <= to) ev.push({ date: x.next, kind: 'insp', lane: x.lane, title: tx(x.regime), code: x.asset.tag, cls: x.next < TODAY ? 'late' : 'insp', act: 'fmInsGo', arg: x.id, site: x.asset.b }); });
    return ev.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  };
  B.act.fmInsGo = (id) => { B.vs['fm:insSel'] = id; B.vs['fm:insV'] = 'schedule'; B.vs['fm:insS'] = 'all'; B.go(`${R}-inspections`); };

  /* ---------- 8 · Maintenance calendar ---------- */
  const P = B.roles.facility.pages;
  P.calendar = () => {
    fcrumbs({ label: L('Maintenance calendar', 'تقويم الصيانة') });
    const view = B.get('fm:calV', 'week');
    const anchor = B.get('fm:calD', TODAY);
    const team = B.get('fm:calTeam', 'all');
    const a = toD(anchor);
    let from, to, label;
    if (view === 'week') { const s0 = new Date(a); s0.setDate(a.getDate() - a.getDay()); from = iso(s0); to = addD(from, 6); label = `${B.dateShort(from)} – ${B.date(to)}`; }
    else { from = iso(new Date(a.getFullYear(), a.getMonth(), 1)); to = iso(new Date(a.getFullYear(), a.getMonth() + 1, 0)); label = `${B.monLong(a.getMonth())} ${a.getFullYear()}`; }
    const evs = eventsIn(from, to).filter((e) => team === 'all' || e.lane === team);
    const shift = (n) => { if (view === 'week') return addD(anchor, n * 7); const d = new Date(a.getFullYear(), a.getMonth() + n, 1); return iso(d); };
    const evBtn = (e) => `<button class="fm-ev ${e.cls}" ${e.kind === 'wo' ? `data-go="${e.go}"` : `data-act="${e.act}" data-arg="${esc(e.arg)}"`} title="${esc(e.title)} · ${esc(e.code)} · ${esc(sshort(e.site))}"><span>${esc(e.title)}</span><em>${esc(e.code.split(' · ')[0])} · ${esc(sshort(e.site))}</em></button>`;
    let body = '';
    if (view === 'week') {
      const days = Array.from({ length: 7 }, (_, i) => addD(from, i));
      const lanes = (team === 'all' ? LANES : [team]).concat(evs.some((e) => e.lane === 'unassigned') && team === 'all' ? ['unassigned'] : []);
      body = `<div class="fm-lanes-wrap"><div class="fm-lanes"><div class="lh" style="text-align:start">${L('Team lane', 'مسار الفريق')}</div>${days.map((d) => `<div class="lh ${d === TODAY ? 'today' : ''}">${B.dow(toD(d).getDay())}<b>${toD(d).getDate()}</b></div>`).join('')}
        ${lanes.map((ln) => { const mine = evs.filter((e) => e.lane === ln); return `<div class="ln">${ln === 'contractors' ? `<span class="li-icon navy" style="width:30px;height:30px;border-radius:8px">${icon('handshake')}</span>` : ln === 'unassigned' ? `<span class="li-icon warn" style="width:30px;height:30px;border-radius:8px">${icon('userPlus')}</span>` : ui.avatar(TECHS[ln].n, 'sm')}<div style="min-width:0"><b>${ln === 'unassigned' ? L('Unassigned', 'غير مُسند') : esc(laneName(ln))}</b><small>${ln === 'unassigned' ? L('needs dispatch', 'بحاجة لإسناد') : esc(laneRole(ln))} · ${mine.length}</small></div></div>${days.map((d) => `<div class="lc ${d === TODAY ? 'today' : ''}">${mine.filter((e) => e.date === d).map(evBtn).join('')}</div>`).join('')}`; }).join('')}</div></div>`;
    } else {
      const events = evs.map((e) => ({ date: e.date, label: `${e.title}`, tone: e.kind === 'pm' ? (e.cls === 'done' ? 'mint' : '') : e.kind === 'insp' ? 'info' : e.cls === 'crit' ? 'bad' : e.cls === 'late' ? 'warn' : 'info', act: e.kind === 'wo' ? 'go' : e.act, arg: e.kind === 'wo' ? e.go : e.arg }));
      body = `<div class="fm-cal">${ui.calendar({ year: a.getFullYear(), month: a.getMonth(), events })}</div>`;
    }
    const up = eventsIn(TODAY, addD(TODAY, 13)).filter((e) => (team === 'all' || e.lane === team) && e.cls !== 'done');
    const load = LANES.map((k) => ({ label: laneName(k), sub: laneRole(k), value: evs.filter((e) => e.lane === k && e.cls !== 'done').length })).filter((x) => x.value).sort((x, y) => y.value - x.value);
    return `${fhead({ eyebrow: L('Operations · planning', 'العمليات · التخطيط'), title: L('Maintenance calendar', 'تقويم الصيانة'), sub: L('Work orders, preventive maintenance and statutory inspections by day and by team.', 'أوامر العمل والصيانة الوقائية والفحوصات القانونية حسب اليوم والفريق.'), actions: ui.btn(L('Export schedule', 'تصدير الجدول'), { icon: 'download', act: 'fmExport', arg: L('Maintenance schedule', 'جدول الصيانة') }) + ui.btn(L('New work order', 'أمر عمل جديد'), { icon: 'plus', kind: 'primary', act: 'fmNewWO' }) })}
      ${opsStrip([[evs.filter((e) => e.cls !== 'done').length, view === 'week' ? L('Scheduled this week', 'مجدول هذا الأسبوع') : L('Scheduled this month', 'مجدول هذا الشهر')], [evs.filter((e) => e.kind === 'pm' && e.cls !== 'done').length, L('PM visits', 'زيارات وقائية')], [evs.filter((e) => e.kind === 'insp').length, L('Inspections', 'فحوصات'), `${R}-inspections`], [evs.filter((e) => e.kind === 'wo' && e.cls !== 'done').length, L('Work orders due', 'أوامر عمل مستحقة'), `${R}-workorders`], [evs.filter((e) => e.cls === 'late' || e.cls === 'crit').length, L('Late or critical', 'متأخرة أو حرجة'), '', 'bad']])}
      <div class="fm-cal-tools">${ui.seg('fm:calV', [{ id: 'week', label: L('Week · team lanes', 'أسبوع · مسارات الفرق'), icon: 'list' }, { id: 'month', label: L('Month', 'شهر'), icon: 'calendar' }], view)}
        ${ui.btn('', { size: 'sm', icon: 'chevL', iconCls: 'flip', act: 'set', arg: `fm:calD=${shift(-1)}`, title: L('Previous', 'السابق') })}<h3>${label}</h3>${ui.btn('', { size: 'sm', icon: 'chevR', iconCls: 'flip', act: 'set', arg: `fm:calD=${shift(1)}`, title: L('Next', 'التالي') })}${anchor !== TODAY ? ui.btn(L('Today', 'اليوم'), { size: 'sm', act: 'set', arg: `fm:calD=${TODAY}` }) : ''}
        <span style="margin-inline-start:auto"></span>${ui.select('fm:calTeam', [{ v: 'all', l: L('All teams', 'كل الفرق') }].concat(LANES.map((k) => ({ v: k, l: laneName(k) }))), { label: L('Team', 'الفريق') })}${siteSel()}</div>
      <div class="grid g-main" style="grid-template-columns:minmax(0,1fr) ${view === 'week' ? '0' : '300px'}"><div style="min-width:0">${body}
        <div class="fm-legend"><span><i style="background:var(--navy)"></i>${L('Work order', 'أمر عمل')}</span><span><i style="background:var(--mint-ink)"></i>${L('Preventive maintenance', 'صيانة وقائية')}</span><span><i style="background:var(--info)"></i>${L('Statutory inspection', 'فحص قانوني')}</span><span><i style="background:var(--warn)"></i>${L('Late', 'متأخر')}</span><span><i style="background:var(--bad)"></i>${L('Critical', 'حرج')}</span></div></div>${view === 'week' ? '<div></div>' : ''}</div>
      <div class="grid g2" style="margin-top:16px">
        ${ui.card({ title: L('Next 14 days', 'الأيام الـ14 القادمة'), sub: L(`${up.length} scheduled items`, `${up.length} عناصر مجدولة`), body: up.length ? ui.list(up.slice(0, 8).map((e) => ui.li({ icon: e.kind === 'pm' ? 'calendarCheck' : e.kind === 'insp' ? 'checkSquare' : 'clipboard', tone: e.cls === 'crit' ? 'bad' : e.cls === 'late' ? 'warn' : e.kind === 'pm' ? 'mint' : 'info', title: esc(e.title), sub: `${tag(e.code.split(' · ')[0])} · ${esc(sshort(e.site))} · ${e.lane === 'unassigned' ? L('Unassigned', 'غير مُسند') : esc(laneName(e.lane))}`, end: `<span class="xs faint nowrap">${B.dateShort(e.date)}</span>`, go: e.kind === 'wo' ? e.go : undefined, act: e.kind === 'wo' ? undefined : e.act, arg: e.arg }))) : ui.empty({ icon: 'calendar', title: L('Nothing scheduled', 'لا شيء مجدول') }) })}
        ${ui.card({ title: L('Team load in view', 'عبء الفرق في العرض'), sub: L('Open scheduled items per lane', 'العناصر المفتوحة لكل مسار'), body: load.length ? B.charts.hbars({ data: load.map((x) => ({ ...x, color: x.value >= 6 ? '#E5774C' : '#142B3B' })), format: (v) => v }) : ui.empty({ icon: 'users', title: L('No load in view', 'لا عبء في العرض') }) })}
      </div>`;
  };

  /* =====================================================================
   * 9 · Inspections (schedule · findings · checklists)
   * ===================================================================== */
  const REGIMES = {
    elevator: { n: T('Statutory lift inspection', 'الفحص القانوني للمصاعد'), f: 'annual', by: T('Licensed lift inspector (sample)', 'مفتش مصاعد مرخّص (نموذج)'), lane: 'contractors', chk: 'elevator' },
    fire: { n: T('Fire & life-safety test', 'اختبار الحريق والسلامة'), f: 'monthly', by: null, lane: 't_saed', chk: 'fire' },
    generator: { n: T('Generator load test', 'اختبار حمل المولد'), f: 'monthly', by: null, lane: 't_rami', chk: 'power' },
    electrical: { n: T('Thermographic survey', 'المسح الحراري'), f: 'annual', by: T('Volt Electric Co.', 'فولت للكهرباء'), lane: 'contractors', chk: 'power' },
    medgas: { n: T('Medical gas manifold check', 'فحص مجمّع الغازات الطبية'), f: 'monthly', by: null, lane: 't_ahmad', chk: 'plumb' },
    water: { n: T('Water quality sampling', 'أخذ عينات جودة المياه'), f: 'semiannual', by: T('PureTank (accredited lab, sample)', 'بيور تانك (مختبر معتمد، نموذج)'), lane: 'contractors', chk: 'plumb' },
    hvac: { n: T('HEPA integrity & pressure check', 'فحص سلامة HEPA والضغط'), f: 'semiannual', by: null, lane: 't_mahmoud', chk: 'hvac' },
  };
  const INSP = () => ASSETS.filter((a) => REGIMES[a.cat] && (a.cat !== 'hvac' || /HEPA/.test(a.name.en))).map((a) => {
    const r = REGIMES[a.cat]; const d = B.daysFromToday(a.next);
    const h = seedOf(a.tag) % 10;
    return { id: `IN-${a.tag.slice(4)}`, asset: a, regime: r.n, freq: r.f, by: r.by, lane: r.lane, chk: r.chk, last: a.last, next: a.next, st: a.ms === 'fmFault' ? 'fail' : d < 0 ? 'overdue' : d <= 14 ? 'due' : 'scheduled', res: a.ms === 'fmFault' ? 'fail' : a.cond === 'fair' || a.cond === 'poor' || h === 0 ? 'minor' : 'pass' };
  });
  F.FINDINGS = F.FINDINGS || [
    { id: 'FD-26-041', a: 'SND-415-FS-FAP', t: T('Earth fault on loop 3 — retail level 1', 'عطل تأريض في الدائرة 3 — الطابق التجاري 1'), sev: 'critical', raised: '2026-11-24', st: 'open', wo: 'WO-26-1188' },
    { id: 'FD-26-040', a: 'SND-311-EL-03', t: T('Car door reopening intermittently', 'باب المقصورة يعاود الفتح بشكل متقطع'), sev: 'high', raised: '2026-11-18', st: 'open', wo: 'WO-26-1186' },
    { id: 'FD-26-039', a: 'SND-311-FS-SPR', t: T('Quarterly flow test not performed', 'لم يُنفَّذ اختبار التدفق الربعي'), sev: 'high', raised: '2026-11-16', st: 'open', wo: 'WO-26-1184' },
    { id: 'FD-26-038', a: 'SND-415-HV-FAU', t: T('Belt wear and clogged G4 filters', 'تآكل السيور وانسداد فلاتر G4'), sev: 'medium', raised: '2026-11-10', st: 'open', wo: 'WO-26-1185' },
    { id: 'FD-26-037', a: 'SND-618-FS-EXT', t: T('Two extinguishers below gauge pressure', 'طفايتان تحت ضغط المؤشر'), sev: 'medium', raised: '2026-11-21', st: 'open', wo: 'WO-26-1179' },
    { id: 'FD-26-036', a: 'SND-618-HV-AHU02', t: T('HEPA differential pressure trending up', 'ارتفاع فرق ضغط فلاتر HEPA'), sev: 'medium', raised: '2026-11-20', st: 'open', wo: 'WO-26-1183' },
    { id: 'FD-26-035', a: 'SND-618-WT-RO', t: T('RO permeate conductivity drift', 'انحراف موصلية مياه التناضح العكسي'), sev: 'medium', raised: '2026-11-21', st: 'open', wo: 'WO-26-1178' },
    { id: 'FD-26-034', a: 'SND-311-SC-NVR', t: T('Camera P2-04 offline', 'الكاميرا P2-04 غير متصلة'), sev: 'low', raised: '2026-11-24', st: 'open', wo: 'WO-26-1176' },
    { id: 'FD-26-031', a: 'SND-311-GN-01', t: T('Minor oil weep at filter housing', 'رشح زيت بسيط عند حاضنة الفلتر'), sev: 'low', raised: '2026-11-14', st: 'closed', wo: 'WO-26-1175' },
    { id: 'FD-26-029', a: 'SND-415-PM-BST', t: T('Bearing noise on duty pump', 'صوت في محمل المضخة العاملة'), sev: 'medium', raised: '2026-11-09', st: 'closed', wo: 'WO-26-1173' },
  ];
  const resBadge = (r) => `<span class="fm-res ${r}">${icon(r === 'pass' ? 'checkCircle' : r === 'minor' ? 'alertCircle' : 'xCircle')}${r === 'pass' ? L('Pass', 'ناجح') : r === 'minor' ? L('Pass with notes', 'ناجح مع ملاحظات') : L('Fail', 'راسب')}</span>`;
  const inspSt = (s) => (s === 'overdue' ? ui.status('fmOverdue') : s === 'due' ? ui.status('fmDue') : s === 'fail' ? ui.status('fmFault') : ui.status('scheduled'));
  const CHK_N = { elevator: T('Elevator inspection', 'فحص المصاعد'), hvac: T('HVAC / AHU service', 'خدمة التكييف ووحدات المناولة'), fire: T('Fire alarm & life safety', 'إنذار الحريق والسلامة'), power: T('Generator & electrical', 'المولدات والكهرباء'), plumb: T('Pumps, water & gases', 'المضخات والمياه والغازات'), sec: T('Security & access devices', 'أجهزة الأمن والدخول'), bms: T('BMS & lighting', 'إدارة المبنى والإنارة') };
  P.inspections = () => {
    fcrumbs({ label: L('Inspections', 'الفحوصات') });
    const view = B.get('fm:insV', 'schedule');
    const all = INSP().filter((x) => inFs(x.asset.b));
    const fnd = F.FINDINGS.filter((f) => asset(f.a) && inFs(asset(f.a).b));
    let body = '';
    if (view === 'schedule') {
      const sf = B.get('fm:insS', 'all'), q = B.get('fm:insQ', '');
      const rows = all.filter((x) => (sf === 'all' || x.st === sf) && B.match(q, x.asset.tag, x.asset.name, x.regime)).sort(B.by('next'));
      const sel = B.get('fm:insSel', '') || (rows[0] && rows[0].id); const cur = all.find((x) => x.id === sel);
      const pn = cur ? `<aside class="card mg-panel"><div class="mp-h"><div class="grow" style="min-width:0"><div class="mg-h4" style="margin-bottom:4px">${tag(cur.asset.tag)}</div><h3>${tx(cur.regime)}</h3><div class="sub">${tx(cur.asset.name)} · ${sshort(cur.asset.b)}</div></div><button class="icon-btn" style="width:32px;height:32px" data-act="set" data-arg="fm:insSel=" aria-label="${L('Close', 'إغلاق')}">${icon('x')}</button></div>
        <div class="mp-b"><div class="row-sm wrap">${inspSt(cur.st)}<span class="badge">${tx(FREQ[cur.freq])}</span>${resBadge(cur.res)}</div>
          <section><div class="mg-h4">${L('Schedule', 'الجدول')}</div>${ui.kv([[L('Last inspection', 'آخر فحص'), B.date(cur.last)], [L('Next due', 'الاستحقاق القادم'), `<span class="${cur.next < TODAY ? 'fm-due over' : ''}">${B.date(cur.next)} · ${B.inDays(cur.next)}</span>`], [L('Inspector', 'المفتش'), cur.by ? esc(tx(cur.by)) : esc(tname(cur.lane))], [L('Asset condition', 'حالة الأصل'), cond(cur.asset.cond)]])}</section>
          <section><div class="mg-h4">${L('Checklist', 'قائمة التحقق')} · ${tx(CHK_N[cur.chk])}</div><div class="fm-chk-list">${(CHECK[cur.chk] || CHECK.sec).map((c, i) => `<div><i>${i + 1}</i><span>${tx(c)}</span></div>`).join('')}</div></section>
          ${fnd.filter((f) => f.a === cur.asset.tag).length ? `<section><div class="mg-h4">${L('Findings', 'الملاحظات')}</div>${ui.list(fnd.filter((f) => f.a === cur.asset.tag).map((f) => ui.li({ icon: 'alert', tone: f.sev === 'critical' || f.sev === 'high' ? 'bad' : 'warn', title: tx(f.t), sub: `${ui.idMono(f.id)} · ${ui.statusLabel(f.sev)}`, go: `${R}-wo-${f.wo}` })))}</section>` : ''}
        </div><div class="mp-f">${ui.btn(L('Log result', 'تسجيل النتيجة'), { kind: 'primary', icon: 'clipboard', act: 'fmInspect', arg: cur.asset.tag })}${ui.btn(L('Asset', 'الأصل'), { icon: 'cpu', go: `${R}-asset-${cur.asset.tag}` })}</div></aside>` : '';
      body = `<div class="toolbar mg-fbar">${ui.search('fm:insQ', L('Asset tag, name or regime…', 'رمز الأصل أو الاسم أو نوع الفحص…'), { reset: 'fm-ins:page' })}${siteSel()}${ui.chips('fm:insS', [{ id: 'all', label: L('All', 'الكل'), count: all.length }, { id: 'overdue', label: L('Overdue', 'متأخرة'), count: all.filter((x) => x.st === 'overdue').length }, { id: 'due', label: L('Due ≤ 14 d', 'مستحقة ≤ 14 يوماً'), count: all.filter((x) => x.st === 'due').length }, { id: 'fail', label: L('Failed', 'راسبة'), count: all.filter((x) => x.st === 'fail').length }, { id: 'scheduled', label: L('Scheduled', 'مجدولة') }], sf, 'fm-ins:page')}</div>
        <div class="mg-split">${xt({ id: 'fm-ins', rows, pageSize: 20, defaultSort: 'next', active: cur && cur.id, rowAct: (x) => ({ act: 'set', arg: `fm:insSel=${x.id}` }), mGo: (x) => `${R}-asset-${x.asset.tag}`,
          bulk: [{ label: L('Log inspection', 'تسجيل فحص'), icon: 'checkSquare', act: 'fmInsBulk' }, { label: L('Export', 'تصدير'), icon: 'download', act: 'fmExport' }],
          cols: [
            { key: 'tag', label: L('Asset', 'الأصل'), sort: (x) => x.asset.tag, m: 'title', render: (x) => `${tag(x.asset.tag)}<span class="xt-sub">${tx(x.asset.name)}</span>`, mRender: (x) => tx(x.asset.name) },
            { key: 'regime', label: L('Inspection', 'الفحص'), sort: (x) => tx(x.regime), m: 'sub', render: (x) => `<span class="xt-strong">${tx(x.regime)}</span><span class="xt-sub">${tx(FREQ[x.freq])} · ${x.by ? esc(tx(x.by)) : esc(tname(x.lane))}</span>` },
            { key: 'site', label: L('Site', 'الموقع'), sort: (x) => x.asset.b, wide: true, m: 'hide', render: (x) => sshort(x.asset.b) },
            { key: 'res', label: L('Last result', 'آخر نتيجة'), sort: (x) => ['fail', 'minor', 'pass'].indexOf(x.res), wide: true, m: 'hide', render: (x) => resBadge(x.res) },
            { key: 'next', label: L('Next due', 'الاستحقاق'), sort: true, m: 'meta', render: (x) => nextCell(x.asset) },
            { key: 'st', label: L('Status', 'الحالة'), sort: (x) => ['fail', 'overdue', 'due', 'scheduled'].indexOf(x.st), m: 'end', render: (x) => inspSt(x.st) },
          ] })}${pn}</div>`;
    } else if (view === 'findings') {
      const ff = B.get('fm:fdS', 'open');
      const rows = fnd.filter((f) => ff === 'all' || f.st === ff);
      body = `<div class="toolbar mg-fbar">${siteSel()}${ui.chips('fm:fdS', [{ id: 'open', label: L('Open', 'مفتوحة'), count: fnd.filter((f) => f.st === 'open').length }, { id: 'closed', label: L('Closed', 'مغلقة'), count: fnd.filter((f) => f.st === 'closed').length }, { id: 'all', label: L('All', 'الكل'), count: fnd.length }], ff)}</div>
        ${xt({ id: 'fm-fd', rows, rowGo: (f) => `${R}-wo-${f.wo}`, defaultSort: '-raised', cols: [
          { key: 'id', label: L('Finding', 'الملاحظة'), sort: true, m: 'title', render: (f) => `<span class="xt-strong">${tx(f.t)}</span><span class="xt-sub">${ui.idMono(f.id)}</span>`, mRender: (f) => tx(f.t) },
          { key: 'a', label: L('Asset', 'الأصل'), sort: true, m: 'meta', render: (f) => `${tag(f.a)}<span class="xt-sub">${sshort(asset(f.a).b)}</span>` },
          { key: 'sev', label: L('Severity', 'الخطورة'), sort: (f) => ['critical', 'high', 'medium', 'low'].indexOf(f.sev), m: 'meta', render: (f) => prio(f.sev) },
          { key: 'raised', label: L('Raised', 'التاريخ'), sort: true, m: 'hide', render: (f) => `<span class="nowrap">${B.dateShort(f.raised)}</span>` },
          { key: 'wo', label: L('Work order', 'أمر العمل'), m: 'sub', render: (f) => `${ui.idMono(f.wo)} ${wo(f.wo) ? ui.status(wo(f.wo).status) : ''}` },
          { key: 'st', label: L('Status', 'الحالة'), sort: true, m: 'end', render: (f) => (f.st === 'open' ? ui.status('open') : ui.status('resolved')) },
        ] })}`;
    } else {
      const sel = B.get('fm:chk', 'fire');
      body = `<div class="fm-tmpl">${Object.keys(CHECK).map((k) => `<button class="${sel === k ? 'on' : ''}" data-act="set" data-arg="fm:chk=${k}"><b>${tx(CHK_N[k] || T(k, k))}</b><span>${L(`${CHECK[k].length} steps · used by ${all.filter((x) => x.chk === k).length} schedules`, `${CHECK[k].length} خطوات · مستخدمة في ${all.filter((x) => x.chk === k).length} جداول`)}</span></button>`).join('')}</div>
        <div class="grid g-main" style="margin-top:14px">${ui.card({ title: tx(CHK_N[sel] || T(sel, sel)), sub: L('Standard checklist · technicians complete it on the mobile app', 'قائمة تحقق قياسية · يكملها الفنيون على تطبيق الجوال'), body: `<div class="fm-chk-list">${CHECK[sel].map((c, i) => `<div><i>${i + 1}</i><span>${tx(c)}</span></div>`).join('')}</div>`, foot: `${ui.btn(L('Edit template', 'تعديل القالب'), { size: 'sm', icon: 'edit', act: 'soon', arg: L('Template editor', 'محرر القوالب') })}${ui.btn(L('Duplicate', 'نسخ'), { size: 'sm', icon: 'plus', act: 'soon', arg: L('Templates', 'القوالب') })}` })}
          ${ui.card({ title: L('Evidence captured', 'الأدلة الملتقطة'), body: ui.kv([[L('Photos', 'الصور'), L('Before / after, required for fails', 'قبل / بعد، مطلوبة عند الرسوب')], [L('Readings', 'القراءات'), L('Typed values with units', 'قيم مكتوبة مع الوحدات')], [L('Sign-off', 'التوقيع'), L('Technician + supervisor', 'الفني + المشرف')], [L('Certificates', 'الشهادات'), L('Uploaded by the certifying body (sample)', 'يرفعها الجهة المانحة (نموذج)')]]) })}</div>`;
    }
    return `${fhead({ eyebrow: L('Operations · compliance', 'العمليات · الامتثال'), title: L('Inspections', 'الفحوصات'), sub: L('Statutory and routine inspection schedules, checklists and findings.', 'جداول الفحوصات القانونية والدورية وقوائم التحقق والملاحظات.'), actions: ui.btn(L('Compliance pack', 'حزمة الامتثال'), { icon: 'download', act: 'fmExport', arg: L('Inspection compliance pack', 'حزمة امتثال الفحوصات') }) + ui.btn(L('Schedule inspection', 'جدولة فحص'), { icon: 'plus', kind: 'primary', act: 'fmInspect', arg: (all[0] || { asset: ASSETS[0] }).asset.tag }) })}
      ${opsStrip([[all.length, L('Inspection schedules', 'جداول الفحص')], [all.filter((x) => x.st === 'overdue').length, L('Overdue', 'متأخرة'), '', 'bad'], [all.filter((x) => x.st === 'due').length, L('Due ≤ 14 days', 'مستحقة ≤ 14 يوماً'), '', 'warn'], [fnd.filter((f) => f.st === 'open').length, L('Open findings', 'ملاحظات مفتوحة'), '', 'warn'], [`${Math.round((all.filter((x) => x.res === 'pass').length / (all.length || 1)) * 100)}`, L('Clean pass rate', 'نسبة النجاح دون ملاحظات'), '', '', '%']])}
      <div style="margin-bottom:14px">${ui.tabs('fm:insV', [{ id: 'schedule', label: L('Schedule', 'الجدول'), icon: 'calendar' }, { id: 'findings', label: L('Findings', 'الملاحظات'), icon: 'alert', count: fnd.filter((f) => f.st === 'open').length }, { id: 'checklists', label: L('Checklists', 'قوائم التحقق'), icon: 'checkSquare' }], view)}</div>${body}`;
  };
  B.act.fmInsBulk = (arg) => { const tags = keysOf(arg).map((id) => INSP().find((x) => x.id === id)).filter(Boolean).map((x) => x.asset.tag); B.act.fmBulkInspect(tags.join(',')); B.vs['fm-ins:sel'] = []; };

  /* =====================================================================
   * 11 · Service history
   * ===================================================================== */
  const HIST = () => {
    const out = [];
    WOS.filter((w) => w.status === 'completed').forEach((w) => out.push({ id: w.id, date: w.closed, asset: w.asset, type: w.type, title: w.title, by: w.tech || w.contractor, hours: w.labour || 2, cost: Math.round(B.sum(w.parts, (p) => p[1] * p[2])), wo: w.id }));
    PM.forEach((p) => p.sites.forEach((s) => {
      const step = { monthly: 1, quarterly: 3, semiannual: 6, annual: 12 }[p.freq];
      if (!p.last || p.last === '—') return;
      for (let k = 0; k < 4; k++) {
        const d = toD(p.last); d.setMonth(d.getMonth() - k * step); d.setDate(Math.min(28, d.getDate() + (+s % 4)));
        const ds = iso(d); if (ds < '2026-06-01' || ds > TODAY) continue;
        const a = pmAsset(p, s); if (!a) continue;
        const h = seedOf(p.id + s + k);
        out.push({ id: `SH-${p.id.slice(3)}${s}${k}`, date: ds, asset: a.tag, type: 'fmPreventive', title: p.n, by: p.by === 'in' ? (TEAM[p.cat] || ['t_yazan'])[0] : p.by, hours: 1 + (h % 5), cost: p.by === 'in' ? (h % 3) * 40 : 350 + (h % 8) * 60, pm: p.id });
      }
    }));
    const CORR = [
      ['2026-10-29', 'SND-311-HV-AHU01', T('Replaced VFD cooling fan', 'استبدال مروحة تبريد VFD'), 't_mahmoud', 3, 420], ['2026-10-17', 'SND-415-EL-02', T('Door re-levelling after power dip', 'إعادة ضبط مستوى الباب بعد انخفاض الجهد'), 'sp_lift', 2, 0],
      ['2026-10-06', 'SND-618-AC-CTL', T('Reader firmware update — clinical zones', 'تحديث برمجيات القارئات — المناطق الطبية'), 't_nour', 2, 0], ['2026-09-24', 'SND-311-PM-BST', T('Pressure switch replaced', 'استبدال مفتاح الضغط'), 't_ahmad', 2, 180],
      ['2026-09-11', 'SND-415-HV-VRF2', T('Refrigerant top-up, leak repaired', 'تعبئة غاز التبريد وإصلاح التسريب'), 'sp_cool', 4, 960], ['2026-08-28', 'SND-618-GN-01', T('ATS transfer test & relay replacement', 'اختبار مفتاح التحويل واستبدال المرحّل'), 'sp_volt', 3, 640],
      ['2026-08-14', 'SND-311-FS-FAP', T('Detector head replaced — floor 6', 'استبدال رأس كاشف — الطابق 6'), 't_saed', 1, 210], ['2026-07-30', 'SND-415-WT-TNK', T('Float valve replaced on tank 3', 'استبدال صمام العوامة في الخزان 3'), 't_ahmad', 2, 95],
    ];
    CORR.forEach(([d, a, t, by, h, c], i) => out.push({ id: `SH-C${String(i + 1).padStart(2, '0')}`, date: d, asset: a, type: 'fmCorrective', title: t, by, hours: h, cost: c }));
    return out.filter((x) => asset(x.asset)).sort((a, b) => (a.date < b.date ? 1 : -1));
  };
  const byName = (k) => (TECHS[k] ? tname(k) : D.provider(k) ? tx(D.provider(k).name) : '—');
  P.history = () => {
    fcrumbs({ label: L('Service history', 'سجل الخدمة') });
    const per = B.get('fm:hP', '90'), ty = B.get('fm:hT', 'all'), sys = B.get('fm:hS', 'all'), q = B.get('fm:hQ', '');
    const since = addD(TODAY, -(+per));
    const all = HIST().filter((x) => inFs(asset(x.asset).b));
    const rows = all.filter((x) => x.date >= since && (ty === 'all' || x.type === ty) && (sys === 'all' || CATS[asset(x.asset).cat].sys === sys) && B.match(q, x.id, x.title, x.asset));
    const sel = B.get('fm:hSel', '') || (rows[0] && rows[0].id); const cur = all.find((x) => x.id === sel);
    const w = cur && cur.wo ? wo(cur.wo) : null;
    const pn = cur ? `<aside class="card mg-panel"><div class="mp-h"><div class="grow" style="min-width:0"><div class="mg-h4" style="margin-bottom:4px">${ui.idMono(cur.id)}</div><h3>${tx(cur.title)}</h3><div class="sub">${tx(asset(cur.asset).name)} · ${sshort(asset(cur.asset).b)}</div></div><button class="icon-btn" style="width:32px;height:32px" data-act="set" data-arg="fm:hSel=" aria-label="${L('Close', 'إغلاق')}">${icon('x')}</button></div>
      <div class="mp-b"><div class="row-sm wrap">${ui.status(cur.type)}${tag(cur.asset)}${ui.status('completed')}</div>
        <div class="mg-pstats" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div><b>${B.dateShort(cur.date)}</b><span>${L('completed', 'الإنجاز')}</span></div><div><b>${cur.hours} ${L('h', 'س')}</b><span>${L('labour', 'العمل')}</span></div><div><b>${B.money(cur.cost)}</b><span>${L('parts / contractor', 'قطع / مقاول')}</span></div></div>
        <section><div class="mg-h4">${L('Record', 'السجل')}</div>${ui.kv([[L('Performed by', 'المنفّذ'), esc(byName(cur.by))], [L('Asset condition now', 'حالة الأصل الآن'), cond(asset(cur.asset).cond)], cur.pm ? [L('PM plan', 'خطة الصيانة'), ui.idMono(cur.pm)] : null, [L('Source', 'المصدر'), ui.prov('demo')]])}</section>
        ${w ? `<section><div class="mg-h4">${L('Parts used', 'القطع المستخدمة')}</div>${w.parts.length ? w.parts.map((p) => `<div class="row between small" style="padding:6px 0;border-bottom:1px solid var(--line-2)"><span>${tx(p[0])} × ${p[1]}</span><b class="fm-mono">${B.money(p[1] * p[2])}</b></div>`).join('') : `<p class="small muted">${L('No parts recorded.', 'لا قطع مسجلة.')}</p>`}</section>` : ''}
      </div><div class="mp-f">${w ? ui.btn(L('Work order', 'أمر العمل'), { kind: 'primary', icon: 'clipboard', go: `${R}-wo-${w.id}` }) : ui.btn(L('Service report', 'تقرير الخدمة'), { kind: 'primary', icon: 'doc', act: 'previewDoc', arg: `${cur.id} — ${tx(cur.title)}` })}${ui.btn(L('Asset', 'الأصل'), { icon: 'cpu', go: `${R}-asset-${cur.asset}` })}</div></aside>` : '';
    const win = all.filter((x) => x.date >= since);
    return `${fhead({ eyebrow: L('Facilities & assets', 'المرافق والأصول'), title: L('Service history', 'سجل الخدمة'), sub: L('Completed preventive, corrective and contractor work — the maintenance record of every asset.', 'الأعمال الوقائية والتصحيحية وأعمال المقاولين المنجزة — سجل صيانة كل أصل.'), actions: ui.btn(L('Export history', 'تصدير السجل'), { icon: 'download', act: 'fmExport', arg: L('Service history', 'سجل الخدمة') }) })}
      ${opsStrip([[win.length, L(`Jobs completed · ${per} d`, `أعمال منجزة · ${per} يوماً`)], [B.num(B.sum(win, (x) => x.hours)), L('Labour hours', 'ساعات العمل')], [B.compact(B.sum(win, (x) => x.cost)), L('Parts & contractor ₪', 'القطع والمقاولون ₪')], [`${Math.round((win.filter((x) => x.type === 'fmPreventive').length / (win.length || 1)) * 100)}`, L('Planned share', 'نسبة المخطط'), '', '', '%'], ['92', L('First-time fix', 'إصلاح من أول مرة'), '', '', '%']])}
      <div class="toolbar mg-fbar">${ui.search('fm:hQ', L('Record, title or asset tag…', 'السجل أو العنوان أو رمز الأصل…'), { reset: 'fm-hist:page' })}${siteSel()}
        ${ui.select('fm:hS', [{ v: 'all', l: L('All systems', 'كل الأنظمة') }].concat(SYSTEMS.map((s) => ({ v: s.id, l: tx(s.n) }))), { label: L('System', 'النظام'), reset: 'fm-hist:page' })}
        ${ui.select('fm:hT', [{ v: 'all', l: L('All types', 'كل الأنواع') }, { v: 'fmPreventive', l: ui.statusLabel('fmPreventive') }, { v: 'fmCorrective', l: ui.statusLabel('fmCorrective') }, { v: 'fmInspection', l: ui.statusLabel('fmInspection') }], { label: L('Type', 'النوع'), reset: 'fm-hist:page' })}
        ${ui.seg('fm:hP', [{ id: '30', label: L('30 d', '30 ي') }, { id: '90', label: L('90 d', '90 ي') }, { id: '180', label: L('180 d', '180 ي') }], per)}</div>
      <div class="mg-split">${xt({ id: 'fm-hist', rows, pageSize: 20, maxH: 'calc(100vh - 300px)', defaultSort: '-date', active: cur && cur.id, rowAct: (x) => ({ act: 'set', arg: `fm:hSel=${x.id}` }), mGo: (x) => `${R}-asset-${x.asset}`,
        cols: [
          { key: 'date', label: L('Date', 'التاريخ'), sort: true, m: 'meta', render: (x) => `<span class="fm-mono nowrap">${x.date}</span>` },
          { key: 'title', label: L('Work performed', 'العمل المنفّذ'), sort: (x) => tx(x.title), m: 'title', render: (x) => `<span class="xt-strong">${tx(x.title)}</span><span class="xt-sub">${ui.idMono(x.id)} · ${ui.statusLabel(x.type)}</span>`, mRender: (x) => tx(x.title) },
          { key: 'asset', label: L('Asset', 'الأصل'), sort: true, m: 'meta', render: (x) => `${tag(x.asset)}<span class="xt-sub">${sshort(asset(x.asset).b)}</span>` },
          { key: 'by', label: L('Performed by', 'المنفّذ'), sort: (x) => byName(x.by), wide: true, m: 'sub', render: (x) => esc(byName(x.by)) },
          { key: 'hours', label: L('Hours', 'الساعات'), num: true, sort: true, wide: true, m: 'hide', render: (x) => x.hours, total: (rs) => B.sum(rs, (x) => x.hours) },
          { key: 'cost', label: L('Cost', 'التكلفة'), num: true, sort: true, m: 'end', render: (x) => `<span class="fm-mono">${B.money(x.cost)}</span>`, total: (rs) => B.money(B.sum(rs, (x) => x.cost)) },
        ] })}${pn}</div>`;
  };

  /* =====================================================================
   * 12 · Energy & water (estimated / simulated sample readings)
   * ===================================================================== */
  const MONTHS = Array.from({ length: 12 }, (_, i) => { const d = new Date(2025, 11 + i, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; });
  const ELF = [1.06, 1.02, 0.92, 0.84, 0.86, 1.02, 1.18, 1.24, 1.12, 1.0, 0.9, 0.96]; // Dec→Nov seasonal profile
  const WTF = [0.82, 0.8, 0.86, 0.92, 1.0, 1.1, 1.22, 1.26, 1.14, 1.0, 0.9, 0.86];
  const series = (bid, kind) => MONTHS.map((_, i) => Math.round((kind === 'el' ? SITE[bid].energy * ELF[i] / 1.0 : SITE[bid].water * WTF[i]) * (0.97 + (seedOf(bid + kind + i) % 7) / 100)));
  const TARIFF = { el: 0.62, wt: 6.5 };
  const BENCH = { 'BN-RAM-00311': 175, 'BN-RAM-00415': 220, 'BN-RAM-00618': 260 };
  F.readings = F.readings || [];
  P.energy = () => {
    fcrumbs({ label: L('Energy & water', 'الطاقة والمياه') });
    const ids = fIds();
    const metric = B.get('fm:enM', 'el');
    const el = Object.fromEntries(ids.map((b) => [b, series(b, 'el')])); const wt = Object.fromEntries(ids.map((b) => [b, series(b, 'wt')]));
    const ytd = (obj) => B.sum(ids, (b) => B.sum(obj[b].slice(1)));
    const intensity = (b) => B.sum(el[b]) / D.building(b).area;
    const COLORS = ['#142B3B', '#36D6A0', '#7FA7C2'];
    const anomalies = [
      { sev: 'hi', b: 'BN-RAM-00415', t: L('Night-time water flow ~1.2 m³/h at Irsal Plaza (estimated)', 'تدفق مياه ليلي ~1.2 م³/س في بلازا الإرسال (تقديري)'), s: L('Bulk meter readings 02:00–04:00 · possible leak in retail washrooms', 'قراءات العداد الرئيسي 02:00–04:00 · احتمال تسرب في دورات مياه المحلات'), tagv: 'SND-415-WT-TNK' },
      { sev: '', b: 'BN-RAM-00311', t: L('Weekend electricity baseline +14% vs October (estimated)', 'ارتفاع خط أساس كهرباء العطلة 14% عن تشرين الأول (تقديري)'), s: L('AHU-02 schedule may be overridden — check BMS time programs', 'قد يكون جدول AHU-02 معطّلاً — راجع برامج BMS الزمنية'), tagv: 'SND-311-HV-AHU02' },
      { sev: 'lo', b: 'BN-RAM-00618', t: L('RO plant reject water above design ratio', 'مياه الرفض في محطة التناضح أعلى من النسبة التصميمية'), s: L('Linked to open work order WO-26-1178', 'مرتبط بأمر العمل المفتوح WO-26-1178'), tagv: 'SND-618-WT-RO' },
    ].filter((x) => ids.includes(x.b));
    const tableRows = MONTHS.slice().reverse().map((ym, k) => { const i = 11 - k; return { id: ym, ym, el: B.sum(ids, (b) => el[b][i]), wt: B.sum(ids, (b) => wt[b][i]), src: i === 11 ? 'manual' : 'bill' }; });
    const endUse = [{ label: L('HVAC & ventilation', 'التكييف والتهوية'), value: 46, color: '#142B3B' }, { label: L('Lighting', 'الإنارة'), value: 17, color: '#36D6A0' }, { label: L('Tenant small power', 'أحمال المستأجرين'), value: 18, color: '#7FA7C2' }, { label: L('Vertical transport', 'المصاعد'), value: 7, color: '#F2B35A' }, { label: L('Plant, pumps & other', 'المعدات والمضخات وغيرها'), value: 12, color: '#9B8AE0' }];
    return `${fhead({ eyebrow: L('Performance', 'الأداء'), title: L('Energy & water overview', 'نظرة عامة على الطاقة والمياه'), sub: L('Consumption per site from utility bills and manual meter readings. No live meters are connected.', 'الاستهلاك لكل موقع من فواتير الخدمات وقراءات العدادات اليدوية. لا توجد عدادات متصلة مباشرة.'), actions: ui.btn(L('Log meter reading', 'تسجيل قراءة عداد'), { icon: 'edit', act: 'fmReading' }) + ui.btn(L('Export', 'تصدير'), { icon: 'download', kind: 'primary', act: 'fmExport', arg: L('Energy & water report', 'تقرير الطاقة والمياه') }) })}
      ${ui.simRibbon(L('Estimated / simulated sample readings — no live meters are connected. Figures are derived from sample bills and manual readings.', 'قراءات تقديرية / نموذجية محاكاة — لا توجد عدادات متصلة مباشرة. الأرقام مشتقة من فواتير نموذجية وقراءات يدوية.'))}
      <div style="height:14px"></div>
      ${opsStrip([[B.num1(ytd(el) / 1000), L('Electricity YTD · MWh (est.)', 'الكهرباء منذ بداية العام · م.و.س (تقديري)')], [B.num(ytd(wt)), L('Water YTD · m³ (est.)', 'المياه منذ بداية العام · م³ (تقديري)')], [B.num(B.sum(ids, (b) => B.sum(el[b])) / B.sum(ids, (b) => D.building(b).area)), L('kWh / m² · 12 months', 'ك.و.س / م² · 12 شهراً')], [B.compact(ytd(el) * TARIFF.el + ytd(wt) * TARIFF.wt), L('Est. utility cost YTD · ₪', 'التكلفة التقديرية · ₪')], [anomalies.length, L('Anomalies flagged', 'حالات شاذة'), '', anomalies.length ? 'warn' : '']])}
      <div class="mg-fbar">${ui.seg('fm:enM', [{ id: 'el', label: L('Electricity · kWh', 'الكهرباء · ك.و.س'), icon: 'zap' }, { id: 'wt', label: L('Water · m³', 'المياه · م³'), icon: 'droplet' }], metric)}<div class="mg-fbar-r">${siteSel()}</div></div>
      <div class="grid g-main">
        ${ui.card({ cls: 'fm-c', title: metric === 'el' ? L('Electricity by site · last 12 months', 'الكهرباء حسب الموقع · آخر 12 شهراً') : L('Water by site · last 12 months', 'المياه حسب الموقع · آخر 12 شهراً'), sub: `<span class="fm-est">${icon('info')}${L('Estimated', 'تقديري')}</span>`, body: B.charts.line({ labels: MONTHS.map((ym) => B.mon(+ym.slice(5) - 1)), series: ids.map((b, i) => ({ name: sshort(b), color: COLORS[SITE_IDS.indexOf(b)], values: metric === 'el' ? el[b] : wt[b], area: ids.length === 1 })), height: 220, format: (v) => B.compact(v) }) })}
        ${ui.card({ title: L('Energy intensity vs benchmark', 'كثافة الطاقة مقابل المرجع'), sub: L('kWh / m² / year · benchmark = typical for building type (sample)', 'ك.و.س / م² / سنة · المرجع = المعتاد لنوع المبنى (نموذج)'), body: ids.map((b) => { const v = intensity(b); const bm = BENCH[b]; return `<div style="margin-bottom:14px"><div class="row between small" style="margin-bottom:6px"><b>${sshort(b)}</b><span class="fm-mono">${B.num(v)} <span class="faint">/ ${bm}</span></span></div><div style="position:relative">${ui.progress(Math.min(100, (v / (bm * 1.4)) * 100), v > bm ? 'warn' : '')}<i style="position:absolute;top:-3px;bottom:-3px;inset-inline-start:${(bm / (bm * 1.4)) * 100}%;width:2px;background:var(--navy);border-radius:2px"></i></div></div>`; }).join('') + `<div class="fm-legend"><span><i style="background:var(--navy);width:3px"></i>${L('Benchmark', 'المرجع')}</span></div>` })}
      </div>
      <div class="grid g3" style="margin-top:16px">
        ${ui.card({ title: L('Estimated end-use split', 'التوزيع التقديري للاستخدام'), sub: L('Engineering estimate — not sub-metered', 'تقدير هندسي — دون عدادات فرعية'), body: B.charts.donut({ size: 130, data: endUse, format: (v) => v + '%', center: { value: '46%', label: L('HVAC', 'التكييف') } }) })}
        ${ui.card({ cls: 'span-2', title: L('Flagged anomalies', 'حالات شاذة مرصودة'), sub: L('From bill comparisons and manual readings (sample)', 'من مقارنة الفواتير والقراءات اليدوية (نموذج)'), body: anomalies.length ? anomalies.map((x) => `<div class="fm-anom ${x.sev}"><span class="sev"></span><div style="min-width:0"><b>${x.t}</b><small>${x.s} · ${tag(x.tagv)}</small></div><button class="btn btn-soft btn-sm" data-act="fmNewWO" data-arg="${x.tagv}">${icon('plus')}${L('Work order', 'أمر عمل')}</button></div>`).join('') : ui.empty({ icon: 'checkCircle', title: L('No anomalies in this scope', 'لا حالات شاذة في هذا النطاق') }) })}
      </div>
      <div style="margin-top:16px">${sec(L('Monthly readings', 'القراءات الشهرية'))}
      ${xt({ id: 'fm-read', rows: tableRows, key: (r) => r.ym, cols: [
        { key: 'ym', label: L('Month', 'الشهر'), m: 'title', render: (r) => `<b>${B.monthYear(r.ym + '-01')}</b>` },
        { key: 'el', label: L('Electricity kWh', 'الكهرباء ك.و.س'), num: true, sort: true, m: 'meta', render: (r) => `<span class="fm-mono">${B.num(r.el)}</span>`, total: (rs) => B.num(B.sum(rs, (r) => r.el)) },
        { key: 'elc', label: L('Est. cost', 'التكلفة التقديرية'), num: true, m: 'hide', render: (r) => B.money(r.el * TARIFF.el), total: (rs) => B.money(B.sum(rs, (r) => r.el * TARIFF.el)) },
        { key: 'wt', label: L('Water m³', 'المياه م³'), num: true, sort: true, m: 'meta', render: (r) => `<span class="fm-mono">${B.num(r.wt)}</span>`, total: (rs) => B.num(B.sum(rs, (r) => r.wt)) },
        { key: 'wtc', label: L('Est. cost', 'التكلفة التقديرية'), num: true, m: 'hide', render: (r) => B.money(r.wt * TARIFF.wt), total: (rs) => B.money(B.sum(rs, (r) => r.wt * TARIFF.wt)) },
        { key: 'src', label: L('Source', 'المصدر'), m: 'end', render: (r) => (r.src === 'manual' ? `<span class="fm-est">${icon('edit')}${L('Manual reading · partial month', 'قراءة يدوية · شهر جزئي')}</span>` : `<span class="fm-est">${icon('doc')}${L('Sample bill · estimated', 'فاتورة نموذجية · تقديري')}</span>`) },
      ] })}</div>
      ${F.readings.length ? `<div style="margin-top:12px">${ui.callout(L(`${F.readings.length} manual reading(s) logged this session — they are stored only in this demo.`, `${F.readings.length} قراءة يدوية مسجلة في هذه الجلسة — محفوظة في هذا العرض فقط.`), '', 'edit')}</div>` : ''}`;
  };
  B.act.fmReading = () => B.modal({ title: L('Log meter reading', 'تسجيل قراءة عداد'), sub: L('Manual entry — no meters are connected to BENA', 'إدخال يدوي — لا عدادات متصلة ببينا'), size: 'sm', form: 'fmReading', body: `<div class="stack">${ui.field({ name: 'site', label: L('Facility', 'المرفق'), type: 'select', options: SITE_IDS.map((b) => ({ v: b, l: sshort(b) })) })}${ui.field({ name: 'meter', label: L('Meter', 'العداد'), type: 'select', options: [{ v: 'el', l: L('Main electricity meter', 'عداد الكهرباء الرئيسي') }, { v: 'wt', l: L('Bulk water meter', 'عداد المياه الرئيسي') }] })}${ui.field({ name: 'value', label: L('Reading', 'القراءة'), type: 'number', required: true, value: 48213 })}${ui.field({ name: 'date', label: L('Date', 'التاريخ'), type: 'date', value: TODAY })}</div>`, foot: F.foot(L('Save reading', 'حفظ القراءة'), 'check') });
  B.submit.fmReading = (d) => { F.readings.push({ ...d }); B.success({ title: L('Reading saved', 'تم حفظ القراءة'), text: L('Used to refine this month\'s estimate (demo only).', 'تُستخدم لتحسين تقدير هذا الشهر (عرض تجريبي فقط).'), ref: B.uid('MTR') }); B.refresh(); };

  /* =====================================================================
   * 13 · Facility reports
   * ===================================================================== */
  const SCORE = { 'BN-RAM-00311': { pm: 91, sla: 94, mttr: 6.8, fix: 90 }, 'BN-RAM-00415': { pm: 84, sla: 88, mttr: 8.1, fix: 87 }, 'BN-RAM-00618': { pm: 97, sla: 98, mttr: 3.9, fix: 95 } };
  const rag = (v, g, a, inv) => { const good = inv ? v <= g : v >= g; const amb = inv ? v <= a : v >= a; return `<span class="fm-score ${good ? 'g' : amb ? 'a' : 'r'}">${v}</span>`; };
  P.reports = () => {
    fcrumbs({ label: L('Facility reports', 'تقارير المرافق') });
    const ids = fIds();
    const rows = ids.map((b) => { const as = assetsOf(b); const ws = WOS.filter((w) => asset(w.asset).b === b); return { id: b, ...SCORE[b], open: ws.filter(isOpen).length, late: ws.filter(isLate).length, health: healthScore(as), insp: as.filter((a) => a.ms === 'fmOverdue').length, kwh: Math.round((SITE[b].energy * 12) / D.building(b).area) }; });
    const cat = [
      ['chart', L('Monthly client report', 'التقرير الشهري للعميل'), L('KPIs, work completed, issues and next month\'s plan per site', 'المؤشرات والأعمال المنجزة والمشاكل وخطة الشهر القادم لكل موقع')],
      ['calendarCheck', L('PM compliance', 'امتثال الصيانة الوقائية'), L('Planned vs completed by plan, system and site', 'المخطط مقابل المنجز حسب الخطة والنظام والموقع')],
      ['target', L('SLA performance', 'أداء مستوى الخدمة'), L('Response and resolution vs targets, by priority and contractor', 'الاستجابة والحل مقابل الأهداف حسب الأولوية والمقاول')],
      ['cpu', L('Asset condition register', 'سجل حالة الأصول'), L('Condition, criticality and remaining life (estimated)', 'الحالة والأهمية والعمر المتبقي (تقديري)')],
      ['checkSquare', L('Inspection compliance pack', 'حزمة امتثال الفحوصات'), L('Statutory inspections, certificates and open findings', 'الفحوصات القانونية والشهادات والملاحظات المفتوحة')],
      ['zap', L('Energy & water summary', 'ملخص الطاقة والمياه'), L('Estimated consumption, intensity and anomalies', 'الاستهلاك التقديري والكثافة والحالات الشاذة')],
    ];
    return `${fhead({ eyebrow: L('Performance', 'الأداء'), title: L('Facility reports', 'تقارير المرافق'), sub: L('Site scorecards and client-ready reports. Exports are simulated.', 'بطاقات أداء المواقع وتقارير جاهزة للعميل. التصدير محاكاة.'), actions: ui.btn(L('Generate November pack', 'إنشاء حزمة تشرين الثاني'), { icon: 'download', kind: 'primary', act: 'fmExport', arg: L('Facility report pack — November 2026', 'حزمة تقارير المرافق — تشرين الثاني 2026') }) })}
      ${opsStrip([[Math.round(B.sum(rows, (r) => r.pm) / rows.length), L('PM compliance', 'امتثال الصيانة الوقائية'), `${R}-pm`, '', '%'], [Math.round(B.sum(rows, (r) => r.sla) / rows.length), L('SLA met', 'الالتزام بمستوى الخدمة'), '', '', '%'], [B.num1(B.sum(rows, (r) => r.mttr) / rows.length), L('MTTR · hours', 'متوسط الإصلاح · ساعات')], [Math.round(B.sum(rows, (r) => r.health) / rows.length), L('Asset health index', 'مؤشر سلامة الأصول'), `${R}-assets`], [B.sum(rows, (r) => r.late), L('Late work orders', 'أوامر عمل متأخرة'), `${R}-workorders`, 'bad']])}
      ${sec(L('Site scorecard · November 2026', 'بطاقة أداء المواقع · تشرين الثاني 2026'), `<span class="row-sm wrap"><span class="fm-score g">${L('On target', 'ضمن الهدف')}</span><span class="fm-score a">${L('Watch', 'مراقبة')}</span><span class="fm-score r">${L('Action', 'إجراء')}</span></span>`)}
      ${xt({ id: 'fm-score', rows, rowGo: (r) => `${R}-site-${r.id}`, cols: [
        { key: 'id', label: L('Site', 'الموقع'), m: 'title', render: (r) => `<span class="xt-strong">${sshort(r.id)}</span><span class="xt-sub">${tag(r.id)} · SLA ${SITE[r.id].sla}</span>`, mRender: (r) => sshort(r.id) },
        { key: 'pm', label: L('PM %', 'الوقائية %'), align: 'center', sort: true, m: 'meta', render: (r) => rag(r.pm, 92, 85) },
        { key: 'sla', label: L('SLA %', 'SLA %'), align: 'center', sort: true, m: 'meta', render: (r) => rag(r.sla, 95, 90) },
        { key: 'mttr', label: L('MTTR h', 'الإصلاح س'), align: 'center', sort: true, m: 'meta', render: (r) => rag(r.mttr, 6, 8, true) },
        { key: 'fix', label: L('First-time fix %', 'الإصلاح الأول %'), align: 'center', sort: true, m: 'hide', render: (r) => rag(r.fix, 92, 88) },
        { key: 'health', label: L('Asset health', 'سلامة الأصول'), align: 'center', sort: true, m: 'hide', render: (r) => rag(r.health, 85, 75) },
        { key: 'open', label: L('Open WOs', 'أوامر مفتوحة'), num: true, sort: true, m: 'hide', render: (r) => `<span class="fm-mono">${r.open}</span>` },
        { key: 'insp', label: L('Overdue insp.', 'فحوصات متأخرة'), align: 'center', sort: true, m: 'hide', render: (r) => rag(r.insp, 0, 1, true) },
        { key: 'kwh', label: L('kWh/m²·yr (est.)', 'ك.و.س/م²·سنة (تقديري)'), num: true, sort: true, m: 'end', render: (r) => `<span class="fm-mono">${r.kwh}</span>` },
      ] })}
      <div class="grid g-main" style="margin-top:16px">
        ${ui.card({ title: L('Report catalog', 'فهرس التقارير'), body: ui.list(cat.map(([ic, t, d]) => ui.li({ icon: ic, title: t, sub: d, act: 'fmExport', arg: t, end: `<span class="btn btn-ghost btn-sm">${icon('download')}${L('Generate', 'إنشاء')}</span>` }))) })}
        ${ui.card({ title: L('Preview · monthly client report', 'معاينة · التقرير الشهري للعميل'), body: `<div class="fm-docprev"><div class="dh"><div><div class="fm-k">${L('Sanad · client report', 'سند · تقرير العميل')}</div><b style="font-size:15px">${ids.length === 1 ? esc(tx(D.building(ids[0]).name)) : L('Portfolio — 3 sites', 'المحفظة — 3 مواقع')}</b></div><span class="fm-tag dark">2026-11</span></div><div class="db">
          ${rows.map((r) => `<div class="row between small" style="padding:6px 0;border-bottom:1px solid var(--line-2)"><span>${sshort(r.id)}</span><span class="row-sm">${rag(r.pm, 92, 85)}${rag(r.sla, 95, 90)}</span></div>`).join('')}
          ${[92, 78, 86, 60].map((w) => `<i style="width:${w}%"></i>`).join('')}<div class="xs faint" style="margin-top:12px">${L('Sample layout — figures are simulated.', 'تخطيط نموذجي — الأرقام محاكاة.')}</div></div></div>`, foot: ui.btn(L('Open full preview', 'فتح المعاينة الكاملة'), { size: 'sm', icon: 'eye', act: 'previewDoc', arg: L('Sanad client report — November 2026', 'تقرير سند للعميل — تشرين الثاني 2026') }) })}
      </div>`;
  };

})();
