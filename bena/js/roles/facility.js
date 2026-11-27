/*
 * BENA — Facility Management workspace.
 * Org: Sanad Facility Services (org_sanad) · persona Omar Saleh, Facilities Director.
 * Operational, technical look: navy ops strip, dense status grids, condition colours,
 * monospace asset tags. Sites: Manara Business Center, Irsal Plaza, Ma'ahid Medical Plaza.
 * All assets, work orders, schedules and readings are fictional demo data.
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon, ui } = B;
  const D = B.data;
  const T = (en, ar) => ({ en, ar });
  const R = 'facility';
  const TODAY = '2026-11-25';

  /* ======================================================================
     Styles (prefixed fm-)
     ====================================================================== */
  B.css(`
  .fm-mono { font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace; letter-spacing: -.01em; }
  .fm-tag { font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace; font-size: 12px; font-weight: 600; color: var(--navy); background: #EEF3F6; border: 1px solid #DCE5EB; border-radius: 6px; padding: 2px 6px; white-space: nowrap; direction: ltr; unicode-bidi: isolate; display: inline-block; line-height: 1.4; }
  .fm-tag.dark { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.14); color: #fff; }
  .fm-k { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 12px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--text-3); }
  html[dir="rtl"] .fm-k { letter-spacing: 0; font-family: var(--font-ar); }

  .fm-ops { background: var(--navy); color: var(--navy-ink); border-radius: var(--r-lg); padding: 18px 22px; display: flex; flex-direction: column; gap: 16px; position: relative; overflow: hidden; }
  .fm-ops::before { content: ""; position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size: 22px 22px; pointer-events: none; }
  .fm-ops > * { position: relative; }
  .fm-ops-top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: space-between; }
  .fm-ops-top h1 { color: #fff; font-size: 22px; }
  .fm-ops .fm-k { color: var(--mint); }
  .fm-shift { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 99px; padding: 5px 12px; }
  .fm-stats { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); border-top: 1px solid rgba(255,255,255,.1); padding-top: 14px; }
  .fm-stats > button, .fm-stats > div { padding: 2px 14px; border-inline-start: 1px solid rgba(255,255,255,.1); text-align: start; min-width: 0; color: inherit; }
  .fm-stats > :first-child { border-inline-start: 0; padding-inline-start: 0; }
  .fm-stats b { display: block; font-family: var(--font-display); color: #fff; font-size: 26px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
  .fm-stats b small { font-size: 14px; color: var(--navy-ink); font-weight: 600; margin-inline-start: 2px; }
  .fm-stats span { font-size: 12px; line-height: 1.3; display: block; margin-top: 3px; }
  .fm-stats .warn b { color: #F6C77E; } .fm-stats .bad b { color: #F39C93; }
  .fm-stats > button:hover b { color: var(--mint); }
  @media (max-width: 1100px) { .fm-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); row-gap: 14px; } .fm-stats > :nth-child(4) { border-inline-start: 0; padding-inline-start: 0; } }
  @media (max-width: 640px) { .fm-ops { padding: 16px; } .fm-ops-top h1 { font-size: 19px; } .fm-stats b { font-size: 21px; } .fm-stats > button, .fm-stats > div { padding: 2px 10px; } }

  .fm-sites { display: flex; gap: 8px; flex-wrap: wrap; }
  .fm-site-chip { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; padding: 6px 10px; font-size: 12.5px; color: #fff; }
  .fm-site-chip:hover { border-color: var(--mint); }
  .fm-site-chip em { font-style: normal; font-family: ui-monospace, Menlo, monospace; font-size: 11.5px; color: var(--mint); }

  .fm-cond { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; white-space: nowrap; }
  .fm-cond i { width: 9px; height: 9px; border-radius: 2px; flex: none; }
  .c-excellent i, .cell.c-excellent { background: #0F9F6E; } .c-good i, .cell.c-good { background: #36D6A0; } .c-fair i, .cell.c-fair { background: #F2B35A; } .c-poor i, .cell.c-poor { background: #E5774C; } .c-critical i, .cell.c-critical { background: #C2362F; }
  .fm-scale { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: var(--text-2); }

  .fm-matrix { display: grid; gap: 4px; font-size: 12px; }
  .fm-matrix .h { font-size: 12px; color: var(--text-3); font-weight: 600; text-align: center; display: flex; align-items: flex-end; justify-content: center; line-height: 1.2; padding-bottom: 4px; }
  .fm-matrix .rl { display: flex; flex-direction: column; justify-content: center; min-width: 0; padding-inline-end: 8px; }
  .fm-matrix .rl b { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fm-matrix .cell { height: 44px; border-radius: 8px; display: grid; place-items: center; color: #fff; font-weight: 700; font-family: ui-monospace, Menlo, monospace; font-size: 12px; transition: transform .15s; }
  .fm-matrix .cell:hover { transform: scale(1.05); }
  .fm-matrix .cell { direction: ltr; }
  .fm-matrix .cell.c-good, .fm-matrix .cell.c-fair { color: var(--navy); }
  .fm-matrix .cell.none { background: var(--line-2); color: var(--text-3); }
  @media (max-width: 640px) { .fm-matrix .cell { height: 34px; font-size: 12px; border-radius: 6px; } .fm-matrix .h { font-size: 12px; } .fm-matrix .h span { display: none; } .fm-matrix .rl b { font-size: 12px; } }

  .fm-alert { display: grid; grid-template-columns: 4px minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--line-2); text-align: start; width: 100%; }
  .fm-alert:last-child { border-bottom: 0; padding-bottom: 0; } .fm-alert:first-child { padding-top: 0; }
  .fm-alert .sev { align-self: stretch; border-radius: 4px; background: var(--line); }
  .fm-alert.critical .sev { background: var(--bad); } .fm-alert.high .sev { background: #E5774C; } .fm-alert.medium .sev { background: #F2B35A; } .fm-alert.info .sev { background: #7FA7C2; }
  .fm-alert b { font-size: 14px; display: block; line-height: 1.35; }
  .fm-alert small { font-size: 12px; color: var(--text-2); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-top: 3px; }
  .fm-alert:hover b { color: var(--mint-ink); }

  .fm-fac { display: grid; grid-template-columns: 220px minmax(0, 1fr) 210px; gap: 0; padding: 0; overflow: hidden; text-align: start; width: 100%; }
  .fm-fac .media { aspect-ratio: auto; border-radius: 0; height: 100%; min-height: 180px; }
  .fm-fac .fm-fac-b { padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
  .fm-fac .fm-fac-b h3 { font-size: 18px; }
  .fm-fac .fm-fac-s { border-inline-start: 1px solid var(--line-2); padding: 18px; display: flex; flex-direction: column; gap: 12px; justify-content: center; background: var(--surface-2); }
  @media (max-width: 900px) { .fm-fac { grid-template-columns: minmax(0, 1fr); } .fm-fac .media { min-height: 150px; height: 150px; } .fm-fac .fm-fac-s { border-inline-start: 0; border-top: 1px solid var(--line-2); flex-direction: row; flex-wrap: wrap; justify-content: space-between; } }
  .fm-stat-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
  .fm-stat-row > div { min-width: 0; }
  .fm-stat-row b { display: block; font-family: var(--font-display); font-size: 18px; font-variant-numeric: tabular-nums; }
  .fm-stat-row span { font-size: 11.5px; color: var(--text-3); }
  @media (max-width: 640px) { .fm-stat-row { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

  .fm-sys { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px; }
  .fm-sys-c { border: 1px solid var(--line); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 10px; background: #fff; text-align: start; }
  .fm-sys-c .fm-sys-h { display: flex; align-items: center; gap: 10px; }
  .fm-sys-c .fm-sys-h .li-icon { width: 36px; height: 36px; border-radius: 10px; }
  .fm-sys-c b { font-size: 14px; }
  .fm-sys-c .bar { display: flex; gap: 3px; }
  .fm-sys-c .bar i { flex: 1; height: 6px; border-radius: 2px; }

  .fm-board { display: grid; grid-template-columns: repeat(5, minmax(220px, 1fr)); gap: 12px; overflow-x: auto; padding-bottom: 6px; scroll-snap-type: x mandatory; }
  .fm-col { background: var(--surface-2); border: 1px solid var(--line-2); border-radius: 14px; padding: 10px; display: flex; flex-direction: column; gap: 8px; min-width: 0; scroll-snap-align: start; }
  .fm-col-h { display: flex; justify-content: space-between; align-items: center; padding: 2px 4px 4px; font-size: 13px; font-weight: 650; }
  .fm-col-h span { font-family: ui-monospace, Menlo, monospace; font-size: 11.5px; color: var(--text-3); }
  .fm-wo-card { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 11px 12px; display: flex; flex-direction: column; gap: 7px; text-align: start; width: 100%; transition: border-color .2s; }
  .fm-wo-card:hover { border-color: var(--mint); }
  .fm-wo-card b { font-size: 13.5px; line-height: 1.3; }
  .fm-wo-card .r { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 11.5px; color: var(--text-3); }
  .fm-wo-card.p-critical { box-shadow: inset 3px 0 0 var(--bad); } .fm-wo-card.p-high { box-shadow: inset 3px 0 0 #E5774C; }
  html[dir="rtl"] .fm-wo-card.p-critical { box-shadow: inset -3px 0 0 var(--bad); } html[dir="rtl"] .fm-wo-card.p-high { box-shadow: inset -3px 0 0 #E5774C; }
  @media (max-width: 767px) { .fm-board { grid-template-columns: repeat(5, 78%); } }

  .fm-prio { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; white-space: nowrap; }
  .fm-prio svg { width: 14px; height: 14px; }
  .fm-prio.critical { color: var(--bad); } .fm-prio.high { color: #C55A2E; } .fm-prio.medium { color: var(--warn); } .fm-prio.low { color: var(--text-3); }
  .fm-due.over { color: var(--bad); font-weight: 600; }

  .fm-check { display: flex; flex-direction: column; }
  .fm-check button { display: flex; gap: 12px; align-items: center; padding: 11px 0; border-bottom: 1px solid var(--line-2); text-align: start; font-size: 14px; width: 100%; }
  .fm-check button:last-child { border-bottom: 0; }
  .fm-check .bx { width: 22px; height: 22px; border-radius: 7px; border: 1.5px solid #C3CED6; display: grid; place-items: center; flex: none; color: transparent; transition: all .15s; }
  .fm-check .bx svg { width: 14px; height: 14px; }
  .fm-check .on .bx { background: var(--mint); border-color: var(--mint); color: var(--navy); }
  .fm-check .on span { color: var(--text-3); text-decoration: line-through; }
  .fm-photos { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
  .fm-photos .media { aspect-ratio: 1; border-radius: 10px; }
  .fm-photos .add { aspect-ratio: 1; border-radius: 10px; border: 1.5px dashed #B9C6CF; display: grid; place-items: center; color: var(--text-3); font-size: 12px; text-align: center; gap: 4px; align-content: center; }
  .fm-photos .add svg { width: 20px; height: 20px; margin: 0 auto; }

  .fm-asset-h { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 18px; align-items: center; }
  .fm-asset-h .fm-ai { width: 64px; height: 64px; border-radius: 16px; background: var(--navy); color: var(--mint); display: grid; place-items: center; }
  .fm-asset-h .fm-ai svg { width: 30px; height: 30px; }
  @media (max-width: 640px) { .fm-asset-h { grid-template-columns: auto minmax(0, 1fr); } .fm-asset-h > :last-child { grid-column: 1 / -1; } .fm-asset-h .fm-ai { width: 52px; height: 52px; } }
  .fm-gauge { display: flex; gap: 3px; align-items: flex-end; }
  .fm-gauge i { width: 14px; border-radius: 3px; background: var(--line-2); }
  .fm-gauge i.on.c-excellent, .fm-gauge i.on.c-good, .fm-gauge i.on.c-fair, .fm-gauge i.on.c-poor, .fm-gauge i.on.c-critical { }
  .fm-gauge i.on { background: currentColor; }

  .fm-dev-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
  @media (max-width: 1180px) { .fm-dev-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 640px) { .fm-dev-grid { grid-template-columns: minmax(0, 1fr); } }
  .device .dv-name { display: flex; align-items: center; gap: 10px; font-weight: 650; font-size: 14px; }
  .device .dv-name .li-icon { width: 34px; height: 34px; border-radius: 10px; }
  .device .dv-name .li-icon svg { width: 17px; height: 17px; }
  .device .dv-sub { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; border-top: 1px solid var(--line-2); padding-top: 10px; font-size: 11.5px; color: var(--text-3); }
  .device .dv-sub b { display: block; color: var(--ink); font-size: 14px; font-variant-numeric: tabular-nums; }
  .device.wide { grid-column: span 2; }
  @media (max-width: 640px) { .device.wide { grid-column: auto; } }
  .fm-shafts { display: grid; grid-template-columns: repeat(var(--n, 4), minmax(0, 1fr)); gap: 10px; }
  .fm-shaft { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 12px; color: var(--text-3); }
  .fm-shaft .s { width: 100%; max-width: 46px; height: 92px; border-radius: 8px; background: var(--surface-2); border: 1px solid var(--line); position: relative; }
  .fm-shaft .car { position: absolute; inset-inline: 4px; height: 16px; border-radius: 4px; background: var(--navy); color: var(--mint); font-size: 9.5px; font-weight: 700; display: grid; place-items: center; font-family: ui-monospace, Menlo, monospace; transition: bottom 1s var(--ease); }
  .fm-shaft.off .car { background: var(--bad-bg); color: var(--bad); }
  .fm-floors-heat { display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 4px 8px; align-items: center; font-size: 12px; color: var(--text-3); }
  .fm-floors-heat .row-h { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 3px; }
  .fm-floors-heat .row-h i { height: 14px; border-radius: 3px; }
  .fm-roadmap { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .fm-roadmap > div { border: 1px solid var(--line); border-radius: 14px; padding: 14px; background: #fff; }
  .fm-roadmap .fm-k { color: var(--mint-ink); }
  .fm-roadmap b { display: block; margin: 6px 0 4px; font-size: 14px; }
  .fm-roadmap p { font-size: 12.5px; color: var(--text-2); }
  @media (max-width: 767px) { .fm-roadmap { grid-template-columns: minmax(0, 1fr); } }
  .fm-sim-tag { font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #8A4108; background: #FDF1DC; border-radius: 5px; padding: 2px 6px; }
  html[dir="rtl"] .fm-sim-tag { letter-spacing: 0; }
  .fm-cell { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .fm-cell b { display: block; font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px; }
  .fm-cell small { display: block; font-size: 12px; color: var(--text-3); white-space: nowrap; }
  .fm-cell .li-icon { width: 34px; height: 34px; border-radius: 10px; }
  .fm-cell .li-icon svg { width: 17px; height: 17px; }
  .fm-pmcal .cal .day { min-height: 82px; }
  .fm-c .line-chart .hz:first-child .tip { left: auto; inset-inline-start: 0; transform: none; }
  .fm-c .line-chart .hz:last-child .tip { left: auto; inset-inline-end: 0; transform: none; }
  html[dir="rtl"] .fm-c .line-chart .hz:first-child .tip, html[dir="rtl"] .fm-c .line-chart .hz:last-child .tip { right: auto; }
  .fm-sysl svg { width: 16px; height: 16px; color: var(--text-2); flex: none; }
  .fm-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12px; color: var(--text-2); margin-top: 12px; }
  .fm-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .fm-legend i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
  .fm-meta { display: flex; align-items: center; gap: 6px 12px; flex-wrap: wrap; font-size: 12.5px; color: var(--text-3); margin: -10px 0 16px; }
  .fm-scopek { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; color: var(--text-2); font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 12px; }
  html[dir="rtl"] .fm-scopek { font-family: var(--font-ar); }
  .fm-scopek svg { width: 14px; height: 14px; color: var(--mint-ink); }
  .fm-dot { width: 3px; height: 3px; border-radius: 50%; background: #B9C6CF; }
  .fm-ops-sm { padding: 14px 18px; margin-bottom: 16px; gap: 0; }
  .fm-ops-sm .fm-stats { border-top: 0; padding-top: 0; }
  .fm-ops-sm .fm-stats b { font-size: 22px; font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; letter-spacing: -.02em; }
  .fm-regs { display: grid; grid-template-columns: repeat(auto-fill, minmax(178px, 1fr)); gap: 8px; }
  .fm-reg { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; text-align: start; min-width: 0; }
  .fm-reg:hover { border-color: #B9C6CF; }
  .fm-reg.on { border-color: var(--navy); box-shadow: 0 0 0 1px var(--navy) inset; }
  .fm-reg-h { display: flex; justify-content: space-between; align-items: center; gap: 6px; font-size: 13px; }
  .fm-reg-h svg { width: 16px; height: 16px; color: var(--navy); flex: none; }
  .fm-reg-h b { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fm-reg-h .fm-mono { font-weight: 700; font-size: 14px; }
  .fm-reg .bar { display: flex; gap: 2px; } .fm-reg .bar i { flex: 1; height: 6px; border-radius: 2px; }
  .fm-reg-f { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-3); }
  .fm-att, .fm-okk { display: inline-flex; align-items: center; gap: 3px; font-weight: 700; font-size: 12px; }
  .fm-att { color: var(--bad); } .fm-okk { color: var(--ok); } .fm-att svg, .fm-okk svg { width: 13px; height: 13px; }
  .fm-crit { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 6px; font-family: ui-monospace, Menlo, monospace; font-size: 12px; font-weight: 700; background: var(--line-2); color: var(--text-2); }
  @media (max-width: 1520px) { .xt-t .fm-hide-md { display: none; } }
  .fm-crit.cA { background: var(--navy); color: var(--mint); } .fm-crit.cB { background: #DCE6EE; color: var(--navy); }
  `);

  /* ======================================================================
     Statuses
     ====================================================================== */
  Object.assign(B.statuses, {
    fmOk: { en: 'Operational', ar: 'يعمل', tone: 'ok' },
    fmDue: { en: 'Due soon', ar: 'مستحق قريباً', tone: 'warn', icon: 'clock' },
    fmOverdue: { en: 'Overdue', ar: 'متأخر', tone: 'bad', icon: 'alertCircle' },
    fmRepair: { en: 'In repair', ar: 'قيد الإصلاح', tone: 'violet', icon: 'wrench' },
    fmFault: { en: 'Fault', ar: 'عطل', tone: 'bad', icon: 'alert' },
    fmCorrective: { en: 'Corrective', ar: 'تصحيحية', tone: 'neutral' },
    fmPreventive: { en: 'Preventive', ar: 'وقائية', tone: 'info' },
    fmInspection: { en: 'Inspection', ar: 'فحص', tone: 'outline' },
    fmEmergency: { en: 'Emergency', ar: 'طارئة', tone: 'bad', icon: 'zap' },
    fmInHouse: { en: 'In-house', ar: 'فريق داخلي', tone: 'navy' },
  });

  /* ======================================================================
     Demo data
     ====================================================================== */
  const SITE_IDS = D.keyBuildings.filter((b) => b.facility === 'org_sanad').map((b) => b.id).sort();
  const SITE = {
    'BN-RAM-00311': { code: '311', short: T('Manara BC', 'المنارة للأعمال'), contract: T('Integrated FM — hard & soft services', 'إدارة مرافق متكاملة — خدمات فنية وعامة'), since: '2019-06-01', client: T('Arkan Property Management', 'أركان لإدارة العقارات'), team: 6, sla: 'Gold', hours: T('Mon–Sat · 07:00–20:00', 'الإثنين–السبت · 07:00–20:00'), energy: 142000, water: 1260, seed: 311 },
    'BN-RAM-00415': { code: '415', short: T('Irsal Plaza', 'بلازا الإرسال'), contract: T('Technical FM — hard services', 'إدارة مرافق فنية — خدمات فنية'), since: '2020-01-01', client: T('Arkan / Irsal Plaza Owners\' Association', 'أركان / جمعية مالكي بلازا الإرسال'), team: 4, sla: 'Silver', hours: T('Daily · 08:00–22:00 (retail)', 'يومياً · 08:00–22:00 (تجاري)'), energy: 118000, water: 1840, seed: 415 },
    'BN-RAM-00618': { code: '618', short: T('Ma\'ahid Medical', 'المعاهد الطبي'), contract: T('Critical-environment FM · 24/7', 'إدارة مرافق للبيئات الحرجة · 24/7'), since: '2021-09-01', client: T('Ma\'ahid Medical Plaza owners', 'مالكو مجمع المعاهد الطبي'), team: 5, sla: 'Platinum', hours: T('24/7 · clinics 07:00–21:00', '24/7 · العيادات 07:00–21:00'), energy: 126000, water: 2110, seed: 618 },
  };
  const site = (bid) => SITE[bid];
  const bname = (bid) => tx(D.building(bid).name);
  const sshort = (bid) => tx(SITE[bid].short);
  /* Workspace scope — shared with the top-bar workspace selector (B.vs['ws:facility']) */
  const fscope = () => { const v = B.get(`ws:${R}`, 'all'); return SITE_IDS.includes(v) ? v : 'all'; };
  const fIds = () => (fscope() === 'all' ? SITE_IDS : [fscope()]);
  const inFs = (bid) => fIds().includes(bid);
  const siteSel = () => ui.select(`ws:${R}`, [{ v: 'all', l: L('All facilities', 'كل المرافق') }].concat(SITE_IDS.map((b) => ({ v: b, l: sshort(b) }))), { label: L('Facility', 'المرفق'), def: 'all' });
  const fcrumbs = (...items) => B.crumbs([{ label: L('Sanad Facility Services', 'سند لخدمات إدارة المرافق'), go: `${R}-home` }].concat(items));
  /* Assigned team per asset category: [in-house technician, specialist contractor] */
  const TEAM = { elevator: ['t_yazan', 'sp_lift'], hvac: ['t_mahmoud', 'sp_cool'], pump: ['t_ahmad'], water: ['t_ahmad', 'sp_pure'], medgas: ['t_ahmad'], generator: ['t_rami', 'sp_volt'], electrical: ['t_rami', 'sp_volt'], fire: ['t_saed'], access: ['t_nour'], cctv: ['t_nour', 'sp_guard'], bms: ['t_nour'] };

  const CATS = {
    elevator: { n: T('Elevators', 'المصاعد'), icon: 'elevator', sys: 'vt' },
    hvac: { n: T('HVAC', 'التكييف والتهوية'), icon: 'wind', sys: 'hvac' },
    pump: { n: T('Pumps', 'المضخات'), icon: 'pump', sys: 'plumb' },
    water: { n: T('Water systems', 'أنظمة المياه'), icon: 'droplet', sys: 'plumb' },
    generator: { n: T('Generators', 'المولدات'), icon: 'generator', sys: 'power' },
    electrical: { n: T('Electrical', 'الكهرباء'), icon: 'zap', sys: 'power' },
    fire: { n: T('Fire safety', 'السلامة من الحريق'), icon: 'fireExt', sys: 'fire' },
    access: { n: T('Access control', 'التحكم بالدخول'), icon: 'lock', sys: 'sec' },
    cctv: { n: T('CCTV', 'كاميرات المراقبة'), icon: 'cctv', sys: 'sec' },
    bms: { n: T('BMS', 'نظام إدارة المبنى'), icon: 'cpu', sys: 'bms' },
    medgas: { n: T('Medical gas', 'الغازات الطبية'), icon: 'gauge', sys: 'plumb' },
  };
  const SYSTEMS = [
    { id: 'hvac', n: T('HVAC', 'التكييف'), icon: 'wind' },
    { id: 'vt', n: T('Vertical transport', 'النقل العمودي'), short: T('Lifts', 'المصاعد'), icon: 'elevator' },
    { id: 'power', n: T('Power & generators', 'الطاقة والمولدات'), short: T('Power', 'الطاقة'), icon: 'zap' },
    { id: 'plumb', n: T('Plumbing & water', 'السباكة والمياه'), short: T('Water', 'المياه'), icon: 'droplet' },
    { id: 'fire', n: T('Fire & life safety', 'الحريق والسلامة'), short: T('Fire', 'الحريق'), icon: 'flame' },
    { id: 'sec', n: T('Security & access', 'الأمن والدخول'), short: T('Security', 'الأمن'), icon: 'shield' },
    { id: 'bms', n: T('Building management', 'إدارة المبنى'), short: T('BMS', 'BMS'), icon: 'cpu' },
  ];
  const COND_ORDER = ['excellent', 'good', 'fair', 'poor', 'critical'];

  // [site, code, cat, en, ar, locEn, locAr, cond, ms, last, next, spec, year]
  const A_ROWS = [
    ['311', 'EL-01', 'elevator', 'Passenger elevator 1', 'مصعد ركاب 1', 'Core A · B2–12', 'النواة أ · ط−2–12', 'good', 'fmOk', '2026-10-20', '2026-12-20', '1,000 kg · 1.6 m/s', 2019],
    ['311', 'EL-02', 'elevator', 'Passenger elevator 2', 'مصعد ركاب 2', 'Core A · B2–12', 'النواة أ · ط−2–12', 'good', 'fmOk', '2026-10-20', '2026-12-20', '1,000 kg · 1.6 m/s', 2019],
    ['311', 'EL-03', 'elevator', 'Passenger elevator 3', 'مصعد ركاب 3', 'Core B · B2–12', 'النواة ب · ط−2–12', 'fair', 'fmRepair', '2026-10-21', '2026-11-28', '1,000 kg · 1.6 m/s', 2019],
    ['311', 'EL-04', 'elevator', 'Service & goods elevator', 'مصعد خدمة وبضائع', 'Core B · B2–roof', 'النواة ب · ط−2–السطح', 'good', 'fmOk', '2026-10-21', '2026-12-21', '1,600 kg · 1.0 m/s', 2019],
    ['311', 'HV-CH01', 'hvac', 'Air-cooled chiller 1 (400 kW)', 'مبرّد هوائي 1 (400 ك.واط)', 'Roof plant deck', 'منصة المعدات على السطح', 'good', 'fmOk', '2026-10-05', '2027-01-05', 'Screw · R134a', 2019],
    ['311', 'HV-CH02', 'hvac', 'Air-cooled chiller 2 (400 kW)', 'مبرّد هوائي 2 (400 ك.واط)', 'Roof plant deck', 'منصة المعدات على السطح', 'fair', 'fmDue', '2026-08-30', '2026-11-30', 'Screw · R134a', 2019],
    ['311', 'HV-AHU01', 'hvac', 'AHU — lobby & floors 1–4', 'وحدة مناولة هواء — الردهة والطوابق 1–4', 'Plant room L1', 'غرفة المعدات ط1', 'good', 'fmOk', '2026-11-02', '2026-12-02', '18,000 m³/h · VFD', 2019],
    ['311', 'HV-AHU02', 'hvac', 'AHU — floors 5–8', 'وحدة مناولة هواء — الطوابق 5–8', 'Plant room L5', 'غرفة المعدات ط5', 'fair', 'fmRepair', '2026-11-02', '2026-12-02', '16,000 m³/h · VAV', 2019],
    ['311', 'HV-AHU03', 'hvac', 'AHU — floors 9–12', 'وحدة مناولة هواء — الطوابق 9–12', 'Plant room L9', 'غرفة المعدات ط9', 'good', 'fmOk', '2026-11-03', '2026-12-03', '16,000 m³/h · VAV', 2019],
    ['311', 'PM-CHW', 'pump', 'Chilled-water pumps (duty/standby)', 'مضخات المياه المبردة (عاملة/احتياط)', 'Roof plant deck', 'منصة المعدات على السطح', 'good', 'fmOk', '2026-09-28', '2026-12-28', '2 × 15 kW', 2019],
    ['311', 'PM-BST', 'pump', 'Domestic booster pump set', 'مجموعة مضخات تعزيز المياه', 'Basement B2', 'الطابق −2', 'good', 'fmOk', '2026-10-10', '2027-01-10', '3 × 5.5 kW', 2019],
    ['311', 'GN-01', 'generator', 'Standby generator 500 kVA', 'مولد احتياطي 500 ك.ف.أ', 'Basement B2', 'الطابق −2', 'good', 'fmOk', '2026-11-14', '2026-12-14', 'Diesel · 8 h tank', 2019],
    ['311', 'EE-UPS', 'electrical', 'UPS 60 kVA — server & BMS', 'UPS ‏60 ك.ف.أ — الخوادم وBMS', 'Comms room L1', 'غرفة الاتصالات ط1', 'good', 'fmDue', '2026-06-02', '2026-12-02', 'Online · 20 min', 2021],
    ['311', 'FS-FAP', 'fire', 'Addressable fire alarm panel', 'لوحة إنذار حريق معنونة', 'Security desk, lobby', 'مكتب الأمن، الردهة', 'excellent', 'fmOk', '2026-11-05', '2026-12-05', '4 loops · 612 devices', 2019],
    ['311', 'FS-SPR', 'fire', 'Sprinkler system & fire pump', 'نظام الرشاشات ومضخة الحريق', 'Pump room B2', 'غرفة المضخات ط−2', 'good', 'fmOverdue', '2026-08-15', '2026-11-15', 'Wet pipe · 1,450 heads', 2019],
    ['311', 'FS-EXT', 'fire', 'Portable extinguishers ×48', 'طفايات حريق محمولة ×48', 'All floors', 'جميع الطوابق', 'good', 'fmOk', '2026-11-10', '2026-12-10', 'CO₂ / DCP 6 kg', 2024],
    ['311', 'AC-CTL', 'access', 'Access control & turnstiles', 'التحكم بالدخول والبوابات الدوارة', 'Lobby + 14 doors', 'الردهة + 14 باباً', 'good', 'fmOk', '2026-09-12', '2026-12-12', '6 turnstiles · 42 readers', 2022],
    ['311', 'SC-NVR', 'cctv', 'CCTV recorder (64 ch)', 'مسجل كاميرات (64 قناة)', 'Comms room L1', 'غرفة الاتصالات ط1', 'fair', 'fmOk', '2026-09-12', '2026-12-12', '64 cameras · 30 days', 2019],
    ['311', 'BM-01', 'bms', 'BMS supervisory controller', 'وحدة التحكم الإشرافية لنظام إدارة المبنى', 'Comms room L1', 'غرفة الاتصالات ط1', 'good', 'fmOk', '2026-10-01', '2027-01-01', 'BACnet/IP · 1,920 points', 2019],
    ['415', 'EL-01', 'elevator', 'Passenger elevator 1', 'مصعد ركاب 1', 'Office core · G–9', 'نواة المكاتب · أرضي–9', 'good', 'fmOk', '2026-10-24', '2026-12-24', '800 kg · 1.0 m/s', 2015],
    ['415', 'EL-02', 'elevator', 'Passenger elevator 2', 'مصعد ركاب 2', 'Office core · G–9', 'نواة المكاتب · أرضي–9', 'good', 'fmOk', '2026-10-24', '2026-12-24', '800 kg · 1.0 m/s', 2015],
    ['415', 'EL-03', 'elevator', 'Retail panoramic elevator', 'مصعد بانورامي للمحلات', 'Atrium · G–2', 'الفناء · أرضي–2', 'good', 'fmDue', '2026-10-29', '2026-11-29', '630 kg · 1.0 m/s', 2015],
    ['415', 'HV-VRF1', 'hvac', 'VRF outdoor units — offices', 'وحدات VRF خارجية — المكاتب', 'Roof', 'السطح', 'good', 'fmOk', '2026-10-15', '2027-01-15', '6 × 45 kW', 2018],
    ['415', 'HV-VRF2', 'hvac', 'VRF outdoor units — retail', 'وحدات VRF خارجية — المحلات', 'Roof', 'السطح', 'fair', 'fmDue', '2026-09-01', '2026-12-01', '4 × 56 kW', 2015],
    ['415', 'HV-FAU', 'hvac', 'Fresh-air unit — retail mall', 'وحدة هواء نقي — المركز التجاري', 'Plant room L1', 'غرفة المعدات ط1', 'poor', 'fmOverdue', '2026-08-10', '2026-11-10', '12,000 m³/h', 2015],
    ['415', 'PM-BST', 'pump', 'Domestic booster pump set', 'مجموعة مضخات تعزيز المياه', 'Basement B1', 'الطابق −1', 'fair', 'fmOk', '2026-11-12', '2027-02-12', '2 × 4 kW', 2015],
    ['415', 'WT-TNK', 'water', 'Rooftop water tanks ×8', 'خزانات مياه على السطح ×8', 'Roof', 'السطح', 'good', 'fmOk', '2026-09-20', '2027-03-20', '8 × 3 m³', 2015],
    ['415', 'GN-01', 'generator', 'Standby generator 400 kVA', 'مولد احتياطي 400 ك.ف.أ', 'Basement B1', 'الطابق −1', 'good', 'fmOk', '2026-11-13', '2026-12-13', 'Diesel · 6 h tank', 2015],
    ['415', 'EE-MDB', 'electrical', 'Main distribution board', 'لوحة التوزيع الرئيسية', 'Electrical room B1', 'غرفة الكهرباء ط−1', 'good', 'fmOk', '2026-07-08', '2027-01-08', '1,600 A', 2015],
    ['415', 'FS-FAP', 'fire', 'Fire alarm panel', 'لوحة إنذار الحريق', 'Security desk', 'مكتب الأمن', 'fair', 'fmFault', '2026-11-03', '2026-12-03', '3 loops · 388 devices', 2015],
    ['415', 'FS-SPR', 'fire', 'Sprinklers — retail levels', 'الرشاشات — طوابق المحلات', 'G–2', 'أرضي–2', 'good', 'fmOk', '2026-10-18', '2027-01-18', 'Wet pipe · 620 heads', 2015],
    ['415', 'FS-EXT', 'fire', 'Portable extinguishers ×36', 'طفايات حريق محمولة ×36', 'All floors', 'جميع الطوابق', 'good', 'fmOk', '2026-11-08', '2026-12-08', 'CO₂ / DCP 6 kg', 2024],
    ['415', 'AC-CTL', 'access', 'Access control — office lobby', 'التحكم بالدخول — ردهة المكاتب', 'Office entrance', 'مدخل المكاتب', 'excellent', 'fmOk', '2026-11-08', '2027-02-08', '18 readers', 2025],
    ['415', 'SC-NVR', 'cctv', 'CCTV recorder (32 ch)', 'مسجل كاميرات (32 قناة)', 'Security desk', 'مكتب الأمن', 'good', 'fmOk', '2026-09-30', '2026-12-30', '32 cameras · 30 days', 2020],
    ['618', 'EL-01', 'elevator', 'Bed / stretcher lift', 'مصعد أسرّة ونقالات', 'Clinical core · B1–7', 'النواة الطبية · ط−1–7', 'good', 'fmOk', '2026-11-04', '2026-12-08', '2,000 kg · 1.0 m/s', 2021],
    ['618', 'EL-02', 'elevator', 'Passenger elevator 1', 'مصعد ركاب 1', 'Main core · B1–7', 'النواة الرئيسية · ط−1–7', 'good', 'fmOk', '2026-11-04', '2026-12-08', '1,000 kg · 1.6 m/s', 2021],
    ['618', 'EL-03', 'elevator', 'Passenger elevator 2', 'مصعد ركاب 2', 'Main core · B1–7', 'النواة الرئيسية · ط−1–7', 'good', 'fmOk', '2026-11-04', '2026-12-08', '1,000 kg · 1.6 m/s', 2021],
    ['618', 'HV-CH01', 'hvac', 'Chiller 300 kW', 'مبرّد 300 ك.واط', 'Roof plant deck', 'منصة المعدات على السطح', 'good', 'fmOk', '2026-10-12', '2027-01-12', 'Scroll · R410A', 2021],
    ['618', 'HV-AHU01', 'hvac', 'AHU with HEPA — clinics L1–3', 'وحدة مناولة هواء HEPA — العيادات ط1–3', 'Plant room L1', 'غرفة المعدات ط1', 'excellent', 'fmOk', '2026-11-01', '2026-12-01', '14,000 m³/h · H13', 2021],
    ['618', 'HV-AHU02', 'hvac', 'AHU with HEPA — day surgery L4', 'وحدة مناولة هواء HEPA — جراحة اليوم الواحد ط4', 'Plant room L4', 'غرفة المعدات ط4', 'good', 'fmDue', '2026-10-27', '2026-11-27', '8,000 m³/h · H14 · +15 Pa', 2021],
    ['618', 'MG-O2', 'medgas', 'Medical oxygen manifold', 'مجمّع الأكسجين الطبي', 'Gas store, B1', 'مخزن الغاز ط−1', 'good', 'fmOk', '2026-11-18', '2026-12-18', '2 × 10 cylinders · alarm', 2021],
    ['618', 'GN-01', 'generator', 'Standby generator 630 kVA + ATS', 'مولد احتياطي 630 ك.ف.أ + مفتاح تحويل', 'Generator yard', 'ساحة المولد', 'excellent', 'fmOk', '2026-11-16', '2026-12-16', 'Diesel · 24 h tank · 10 s', 2021],
    ['618', 'EE-UPS', 'electrical', 'UPS 80 kVA — clinical', 'UPS ‏80 ك.ف.أ — الأقسام الطبية', 'Electrical room B1', 'غرفة الكهرباء ط−1', 'good', 'fmOk', '2026-11-18', '2027-05-18', 'Online · 30 min', 2021],
    ['618', 'PM-BST', 'pump', 'Booster pump set', 'مجموعة مضخات التعزيز', 'Basement B1', 'الطابق −1', 'good', 'fmOk', '2026-10-06', '2027-01-06', '2 × 5.5 kW', 2021],
    ['618', 'WT-RO', 'water', 'Water treatment (RO)', 'معالجة المياه (التناضح العكسي)', 'Basement B1', 'الطابق −1', 'fair', 'fmDue', '2026-10-30', '2026-11-30', '2 m³/h · conductivity', 2021],
    ['618', 'FS-FAP', 'fire', 'Fire alarm panel', 'لوحة إنذار الحريق', 'Reception', 'الاستقبال', 'excellent', 'fmOk', '2026-11-09', '2026-12-09', '3 loops · 450 devices', 2021],
    ['618', 'FS-SPR', 'fire', 'Sprinklers & fire pump', 'الرشاشات ومضخة الحريق', 'Pump room B1', 'غرفة المضخات ط−1', 'good', 'fmOk', '2026-10-22', '2027-01-22', 'Wet pipe · 980 heads', 2021],
    ['618', 'FS-EXT', 'fire', 'Portable extinguishers ×30', 'طفايات حريق محمولة ×30', 'All floors', 'جميع الطوابق', 'good', 'fmOverdue', '2026-10-20', '2026-11-20', 'CO₂ / DCP 6 kg', 2024],
    ['618', 'AC-CTL', 'access', 'Access control — clinical zones', 'التحكم بالدخول — المناطق الطبية', 'All floors', 'جميع الطوابق', 'good', 'fmOk', '2026-09-25', '2026-12-25', '36 readers · 4 zones', 2021],
  ];
  const ASSETS = A_ROWS.map((r) => ({
    tag: `SND-${r[0]}-${r[1]}`, b: `BN-RAM-00${r[0]}`, cat: r[2], name: T(r[3], r[4]), loc: T(r[5], r[6]), cond: r[7], ms: r[8], last: r[9], next: r[10], spec: r[11], year: r[12],
    crit: ['elevator', 'fire', 'generator', 'medgas'].includes(r[2]) || (r[0] === '618' && r[2] === 'hvac') ? 'A' : ['hvac', 'electrical', 'pump'].includes(r[2]) ? 'B' : 'C',
  }));
  const asset = (tag) => ASSETS.find((a) => a.tag === tag);
  const assetsOf = (bid) => ASSETS.filter((a) => a.b === bid);
  const worst = (list) => list.reduce((w, a) => (COND_ORDER.indexOf(a.cond) > COND_ORDER.indexOf(w) ? a.cond : w), 'excellent');
  const healthScore = (list) => Math.round(B.sum(list, (a) => ({ excellent: 100, good: 88, fair: 64, poor: 38, critical: 10 }[a.cond])) / (list.length || 1) - list.filter((a) => a.ms === 'fmFault').length * 4);

  const TECHS = {
    t_mahmoud: { n: T('Mahmoud Darwish', 'محمود درويش'), r: T('HVAC technician', 'فني تكييف') },
    t_rami: { n: T('Rami Qasem', 'رامي قاسم'), r: T('Electrical technician', 'فني كهرباء') },
    t_ahmad: { n: T('Ahmad Jaradat', 'أحمد جرادات'), r: T('Plumbing & pumps', 'سباكة ومضخات') },
    t_saed: { n: T('Saed Barghouti', 'سائد برغوثي'), r: T('Fire & life safety', 'الحريق والسلامة') },
    t_nour: { n: T('Nour Hamdan', 'نور حمدان'), r: T('BMS & security systems', 'أنظمة BMS والأمن') },
    t_yazan: { n: T('Yazan Khatib', 'يزن الخطيب'), r: T('General mechanical', 'ميكانيك عام') },
  };
  const tname = (id) => (TECHS[id] ? tx(TECHS[id].n) : '—');

  const W = (id, o) => ({ id, ...o });
  const WOS = [
    W('WO-26-1188', { asset: 'SND-415-FS-FAP', title: T('Fire alarm loop 3 — earth fault', 'لوحة الحريق، الدائرة 3 — عطل تأريض'), type: 'fmEmergency', priority: 'critical', status: 'inProgress', tech: 't_saed', created: '2026-11-24', due: '2026-11-25', desc: T('Panel reports an earth fault on loop 3 (retail level 1). Fire watch posted until the loop is reinstated.', 'تُظهر اللوحة عطل تأريض في الدائرة 3 (الطابق التجاري 1). تم تعيين مراقب حريق حتى إعادة الدائرة.') }),
    W('WO-26-1187', { asset: 'SND-311-HV-AHU02', title: T('Zone 7B VAV not responding — office too warm', 'وحدة VAV في المنطقة 7ب لا تستجيب — المكتب حار'), type: 'fmCorrective', priority: 'high', status: 'inProgress', tech: 't_mahmoud', contractor: 'sp_cool', created: '2026-11-21', due: '2026-11-26', ref: 'MR-24460', desc: T('Tenant in office 702 reports 27 °C. VAV actuator suspected; BMS shows damper stuck at 0%.', 'المستأجر في المكتب 702 يبلغ عن 27 درجة. يُشتبه في محرك VAV؛ يُظهر BMS أن البوابة عالقة عند 0%.') }),
    W('WO-26-1186', { asset: 'SND-311-EL-03', title: T('Elevator 3 door operator replacement', 'استبدال محرك أبواب المصعد 3'), type: 'fmCorrective', priority: 'high', status: 'onHold', tech: 't_yazan', contractor: 'sp_lift', created: '2026-11-18', due: '2026-11-28', desc: T('Car door reopening intermittently. Operator motor ordered — expected 27 Nov. Car out of service.', 'باب المقصورة يعاود الفتح بشكل متقطع. تم طلب محرك جديد — متوقع 27 ت٢. المصعد خارج الخدمة.') }),
    W('WO-26-1185', { asset: 'SND-415-HV-FAU', title: T('Fresh-air unit — belts & filters (overdue PM)', 'وحدة الهواء النقي — السيور والفلاتر (صيانة وقائية متأخرة)'), type: 'fmPreventive', priority: 'medium', status: 'assigned', tech: 't_mahmoud', created: '2026-11-10', due: '2026-11-26', desc: T('Quarterly service missed due to retail access hours. Night shift booked.', 'تأخرت الخدمة الربعية بسبب ساعات عمل المحلات. تم حجز وردية ليلية.') }),
    W('WO-26-1184', { asset: 'SND-311-FS-SPR', title: T('Sprinkler quarterly inspection & flow test', 'الفحص الربعي للرشاشات واختبار التدفق'), type: 'fmInspection', priority: 'medium', status: 'assigned', tech: 't_saed', created: '2026-11-08', due: '2026-11-15', desc: T('Main drain and flow test, inspect valves and gauges, fire pump churn test.', 'اختبار التصريف الرئيسي والتدفق، فحص الصمامات والعدادات، تشغيل مضخة الحريق.') }),
    W('WO-26-1183', { asset: 'SND-618-HV-AHU02', title: T('HEPA pre-filter change — day surgery', 'تغيير فلاتر HEPA الأولية — جراحة اليوم الواحد'), type: 'fmPreventive', priority: 'medium', status: 'scheduled', tech: 't_mahmoud', created: '2026-11-20', due: '2026-11-27', desc: T('Differential pressure trending up. Change outside theatre hours (after 18:00).', 'فرق الضغط في ارتفاع. التغيير خارج ساعات العمليات (بعد 18:00).') }),
    W('WO-26-1182', { asset: 'SND-311-BM-01', title: T('Replace 6 lobby downlights (DALI)', 'استبدال 6 إنارات سقفية في الردهة (DALI)'), type: 'fmCorrective', priority: 'low', status: 'assigned', tech: 't_rami', created: '2026-11-22', due: '2026-11-30' }),
    W('WO-26-1181', { asset: 'SND-311-HV-CH02', title: T('Chiller 2 refrigerant & oil check', 'فحص غاز التبريد والزيت للمبرّد 2'), type: 'fmPreventive', priority: 'medium', status: 'scheduled', tech: 't_mahmoud', contractor: 'sp_cool', created: '2026-11-15', due: '2026-11-30' }),
    W('WO-26-1180', { asset: 'SND-415-EE-MDB', title: T('Shop G02 front sign flickering', 'لافتة المحل G02 تومض'), type: 'fmCorrective', priority: 'low', status: 'new', created: '2026-11-19', due: '2026-11-27', ref: 'MR-24433' }),
    W('WO-26-1179', { asset: 'SND-618-FS-EXT', title: T('Monthly extinguisher visual check', 'الفحص البصري الشهري للطفايات'), type: 'fmInspection', priority: 'medium', status: 'assigned', tech: 't_saed', created: '2026-11-13', due: '2026-11-20' }),
    W('WO-26-1178', { asset: 'SND-618-WT-RO', title: T('RO membrane pressure drift', 'انحراف ضغط أغشية التناضح العكسي'), type: 'fmCorrective', priority: 'medium', status: 'inProgress', tech: 't_ahmad', created: '2026-11-21', due: '2026-12-01' }),
    W('WO-26-1177', { asset: 'SND-618-EL-01', title: T('Annual elevator certification — 3 cars', 'الترخيص السنوي للمصاعد — 3 مصاعد'), type: 'fmInspection', priority: 'medium', status: 'scheduled', contractor: 'sp_lift', created: '2026-11-05', due: '2026-12-08', ref: 'MR-24320' }),
    W('WO-26-1176', { asset: 'SND-311-SC-NVR', title: T('Camera P2-04 offline (parking level 2)', 'الكاميرا P2-04 غير متصلة (موقف ط2)'), type: 'fmCorrective', priority: 'low', status: 'new', created: '2026-11-24', due: '2026-11-29' }),
    W('WO-26-1175', { asset: 'SND-311-GN-01', title: T('Generator monthly load test', 'اختبار الحمل الشهري للمولد'), type: 'fmPreventive', priority: 'medium', status: 'completed', tech: 't_rami', created: '2026-11-10', due: '2026-11-14', closed: '2026-11-14' }),
    W('WO-26-1174', { asset: 'SND-618-EE-UPS', title: T('UPS battery health test', 'اختبار صحة بطاريات UPS'), type: 'fmPreventive', priority: 'medium', status: 'completed', tech: 't_rami', created: '2026-11-12', due: '2026-11-18', closed: '2026-11-18' }),
    W('WO-26-1173', { asset: 'SND-415-PM-BST', title: T('Booster pump bearing noise', 'صوت في محمل مضخة التعزيز'), type: 'fmCorrective', priority: 'medium', status: 'completed', tech: 't_ahmad', created: '2026-11-09', due: '2026-11-12', closed: '2026-11-12' }),
    W('WO-26-1172', { asset: 'SND-311-HV-AHU03', title: T('AHU-03 VFD fault reset & inspection', 'إعادة ضبط وفحص عطل VFD لوحدة AHU-03'), type: 'fmCorrective', priority: 'high', status: 'completed', tech: 't_mahmoud', created: '2026-11-09', due: '2026-11-10', closed: '2026-11-10' }),
    W('WO-26-1171', { asset: 'SND-415-AC-CTL', title: T('Card reader B2-03 replaced', 'استبدال قارئ البطاقات B2-03'), type: 'fmCorrective', priority: 'low', status: 'completed', tech: 't_nour', created: '2026-11-05', due: '2026-11-08', closed: '2026-11-08' }),
  ];
  const CHECK = {
    elevator: [T('Isolate car & apply lock-out', 'عزل المقصورة وتطبيق القفل'), T('Inspect door operator, rollers and sensors', 'فحص محرك الأبواب والبكرات والحساسات'), T('Check brakes, ropes and governor', 'فحص المكابح والحبال ومنظم السرعة'), T('Test emergency phone & alarm bell', 'اختبار هاتف الطوارئ وجرس الإنذار'), T('Return to service & log in register', 'إعادة التشغيل والتسجيل في السجل')],
    hvac: [T('Lock out unit at isolator', 'فصل الوحدة من المفتاح العازل'), T('Inspect / replace filters', 'فحص / استبدال الفلاتر'), T('Check belts, bearings and VFD', 'فحص السيور والمحامل وVFD'), T('Verify setpoints and trends in BMS', 'التحقق من القيم والاتجاهات في BMS'), T('Record supply / return temperatures', 'تسجيل درجات حرارة التغذية والراجع')],
    fire: [T('Notify occupants and monitoring centre', 'إبلاغ الشاغلين ومركز المراقبة'), T('Isolate affected loop / zone', 'عزل الدائرة / المنطقة المتأثرة'), T('Locate fault with loop tester', 'تحديد العطل بجهاز فحص الدوائر'), T('Repair and reinstate devices', 'الإصلاح وإعادة الأجهزة'), T('Full panel test & sign-off', 'اختبار كامل للوحة والتوقيع')],
    power: [T('Visual inspection & leaks', 'فحص بصري والتسريبات'), T('Check fuel / battery levels', 'فحص مستويات الوقود / البطاريات'), T('Run load test (30 min)', 'تشغيل اختبار الحمل (30 دقيقة)'), T('Record voltage & frequency', 'تسجيل الجهد والتردد'), T('Reset alarms & log', 'إعادة ضبط الإنذارات والتسجيل')],
    plumb: [T('Check pressure & flow readings', 'فحص قراءات الضغط والتدفق'), T('Inspect seals and bearings', 'فحص الموانع والمحامل'), T('Test duty / standby changeover', 'اختبار التبديل بين العاملة والاحتياط'), T('Clean strainers', 'تنظيف المصافي'), T('Log readings', 'تسجيل القراءات')],
    sec: [T('Check device status in console', 'فحص حالة الجهاز في لوحة التحكم'), T('Inspect wiring & power supply', 'فحص الأسلاك ومصدر الطاقة'), T('Repair / replace device', 'إصلاح / استبدال الجهاز'), T('Test with card / verify feed', 'الاختبار ببطاقة / التحقق من البث'), T('Update asset record', 'تحديث سجل الأصل')],
    bms: [T('Isolate circuit', 'عزل الدائرة'), T('Replace fittings', 'استبدال الوحدات'), T('Re-address on DALI bus', 'إعادة العنونة على ناقل DALI'), T('Test scenes from BMS', 'اختبار المشاهد من BMS'), T('Update asset record', 'تحديث سجل الأصل')],
  };
  const PARTS = {
    vt: [[T('Door operator motor', 'محرك الأبواب'), 1, 2850], [T('Door roller set', 'طقم بكرات الأبواب'), 2, 120]],
    hvac: [[T('Pleated filter G4 592×592', 'فلتر مطوي G4 ‏592×592'), 6, 38], [T('V-belt SPA 1250', 'سير SPA 1250'), 2, 54], [T('VAV actuator 10 Nm', 'محرك VAV ‏10 نيوتن.م'), 1, 690]],
    fire: [[T('Loop isolator module', 'وحدة عزل الدائرة'), 1, 310], [T('Fire-rated cable 1.5 mm² (m)', 'كابل مقاوم للحريق 1.5 مم² (م)'), 20, 6]],
    power: [[T('Fuel filter', 'فلتر الوقود'), 1, 85], [T('Battery 12 V 100 Ah', 'بطارية 12 فولت 100 أمبير'), 2, 640]],
    plumb: [[T('Mechanical seal kit', 'طقم مانع ميكانيكي'), 1, 260], [T('Bearing 6205-2RS', 'محمل 6205-2RS'), 2, 45]],
    sec: [[T('Card reader (13.56 MHz)', 'قارئ بطاقات (13.56 ميغاهرتز)'), 1, 420]],
    bms: [[T('LED downlight 18 W DALI', 'إنارة سقفية LED ‏18 واط DALI'), 6, 95]],
  };
  const wo = (id) => WOS.find((w) => w.id === id);
  const woSys = (w) => CATS[asset(w.asset).cat].sys;
  WOS.forEach((w) => {
    const sys = woSys(w);
    const list = CHECK[sys === 'vt' ? 'elevator' : sys] || CHECK.sec;
    const n = w.status === 'completed' ? list.length : w.status === 'inProgress' ? 2 : w.status === 'onHold' ? 2 : 0;
    w.checklist = list.map((t, i) => ({ t, done: i < n }));
    w.parts = (PARTS[sys] || []).slice(0, w.id === 'WO-26-1187' ? 3 : 2).filter((p, i) => sys !== 'hvac' || w.id === 'WO-26-1187' || i < 2);
    w.labour = w.status === 'completed' ? 3 + (w.id.charCodeAt(9) % 4) : w.status === 'inProgress' ? 2 : 0;
  });
  const isOpen = (w) => w.status !== 'completed' && w.status !== 'cancelled';
  const isLate = (w) => isOpen(w) && w.due < TODAY;
  const WO_COLS = ['new', 'assigned', 'scheduled', 'inProgress', 'onHold'];

  const PM = [
    { id: 'PM-01', n: T('Elevator monthly maintenance', 'الصيانة الشهرية للمصاعد'), cat: 'elevator', sites: ['311', '415', '618'], freq: 'monthly', day: 20, by: 'sp_lift', comp: 100, last: '2026-11-04', next: '2026-12-04' },
    { id: 'PM-02', n: T('Chiller quarterly service', 'الخدمة الربعية للمبرّدات'), cat: 'hvac', sites: ['311', '618'], freq: 'quarterly', day: 5, anchor: 0, by: 'sp_cool', comp: 92, last: '2026-10-12', next: '2026-11-30' },
    { id: 'PM-03', n: T('AHU filter change', 'تغيير فلاتر وحدات مناولة الهواء'), cat: 'hvac', sites: ['311', '415', '618'], freq: 'monthly', day: 2, by: 'in', comp: 88, last: '2026-11-03', next: '2026-11-27' },
    { id: 'PM-04', n: T('Generator load test', 'اختبار حمل المولدات'), cat: 'generator', sites: ['311', '415', '618'], freq: 'monthly', day: 14, by: 'in', comp: 100, last: '2026-11-16', next: '2026-12-13' },
    { id: 'PM-05', n: T('Fire alarm panel & device test', 'اختبار لوحة وأجهزة إنذار الحريق'), cat: 'fire', sites: ['311', '415', '618'], freq: 'monthly', day: 5, by: 'in', comp: 83, last: '2026-11-09', next: '2026-12-03' },
    { id: 'PM-06', n: T('Sprinkler inspection & flow test', 'فحص الرشاشات واختبار التدفق'), cat: 'fire', sites: ['311', '415', '618'], freq: 'quarterly', day: 15, anchor: 1, by: 'in', comp: 75, last: '2026-10-22', next: '2026-11-15' },
    { id: 'PM-07', n: T('Extinguisher visual inspection', 'الفحص البصري للطفايات'), cat: 'fire', sites: ['311', '415', '618'], freq: 'monthly', day: 10, by: 'in', comp: 91, last: '2026-11-10', next: '2026-11-20' },
    { id: 'PM-08', n: T('Water tank cleaning & disinfection', 'تنظيف وتعقيم خزانات المياه'), cat: 'water', sites: ['415'], freq: 'semiannual', day: 20, anchor: 2, by: 'sp_pure', comp: 100, last: '2026-09-20', next: '2027-03-20' },
    { id: 'PM-09', n: T('Booster pump service', 'خدمة مضخات التعزيز'), cat: 'pump', sites: ['311', '415', '618'], freq: 'quarterly', day: 10, anchor: 1, by: 'in', comp: 95, last: '2026-11-12', next: '2027-01-06' },
    { id: 'PM-10', n: T('UPS battery test', 'اختبار بطاريات UPS'), cat: 'electrical', sites: ['311', '618'], freq: 'semiannual', day: 2, anchor: 5, by: 'sp_volt', comp: 100, last: '2026-11-18', next: '2026-12-02' },
    { id: 'PM-11', n: T('Medical gas manifold inspection', 'فحص مجمّع الغازات الطبية'), cat: 'medgas', sites: ['618'], freq: 'monthly', day: 18, by: 'in', comp: 100, last: '2026-11-18', next: '2026-12-18' },
    { id: 'PM-12', n: T('BMS & access control health check', 'فحص سلامة BMS والتحكم بالدخول'), cat: 'bms', sites: ['311', '415', '618'], freq: 'quarterly', day: 12, anchor: 2, by: 'in', comp: 94, last: '2026-09-12', next: '2026-12-12' },
    { id: 'PM-13', n: T('Annual elevator certification', 'الترخيص السنوي للمصاعد'), cat: 'elevator', sites: ['618'], freq: 'annual', day: 8, anchor: 11, by: 'sp_lift', comp: 100, last: '2025-12-09', next: '2026-12-08' },
    { id: 'PM-14', n: T('RO water treatment service', 'خدمة معالجة المياه بالتناضح العكسي'), cat: 'water', sites: ['618'], freq: 'monthly', day: 30, by: 'in', comp: 80, last: '2026-10-30', next: '2026-11-30' },
  ];
  const FREQ = { weekly: T('Weekly', 'أسبوعي'), monthly: T('Monthly', 'شهري'), quarterly: T('Quarterly', 'ربعي'), semiannual: T('Semi-annual', 'نصف سنوي'), annual: T('Annual', 'سنوي') };
  const pmOccurs = (p, y, m) => { const step = { monthly: 1, quarterly: 3, semiannual: 6, annual: 12 }[p.freq]; return (((m - (p.anchor || 0)) % step) + step) % step === 0; };

  const CONTRACTORS = [
    { p: 'sp_lift', scope: T('Elevator maintenance & certification', 'صيانة المصاعد وترخيصها'), sites: ['311', '415', '618'], ref: 'SND-C-2024-011', resp: T('2 h emergency · 24 h routine', 'ساعتان طوارئ · 24 ساعة عادي'), sla: 97, value: 86400, end: '2027-06-30' },
    { p: 'sp_cool', scope: T('Chillers, AHUs & VRF', 'المبرّدات ووحدات المناولة وVRF'), sites: ['311', '415', '618'], ref: 'SND-C-2023-027', resp: T('4 h critical · 48 h routine', '4 ساعات حرج · 48 ساعة عادي'), sla: 91, value: 64800, end: '2027-03-31' },
    { p: 'sp_volt', scope: T('HV/LV, UPS & generator support', 'الجهد العالي والمنخفض وUPS والمولدات'), sites: ['311', '618'], ref: 'SND-C-2025-004', resp: T('4 h · 24/7', '4 ساعات · 24/7'), sla: 95, value: 22000, end: '2026-12-31' },
    { p: 'sp_guard', scope: T('Guarding & CCTV monitoring', 'الحراسة ومراقبة الكاميرات'), sites: ['311', '415'], ref: 'SND-C-2024-019', resp: T('On-site 24/7', 'في الموقع 24/7'), sla: 89, value: 172800, end: '2027-09-30' },
    { p: 'sp_sparkle', scope: T('Cleaning & washroom services', 'التنظيف وخدمات دورات المياه'), sites: ['311', '415', '618'], ref: 'SND-C-2025-001', resp: T('Daily · 30 min spill response', 'يومي · 30 دقيقة للانسكابات'), sla: 94, value: 198000, end: '2027-01-31' },
    { p: 'sp_shield', scope: T('Integrated pest management', 'المكافحة المتكاملة للآفات'), sites: ['311', '415', '618'], ref: 'SND-C-2025-012', resp: T('Monthly · 24 h call-out', 'شهري · 24 ساعة للطلب'), sla: 100, value: 9600, end: '2027-05-31' },
    { p: 'sp_pure', scope: T('Tank cleaning & water quality', 'تنظيف الخزانات وجودة المياه'), sites: ['415', '618'], ref: 'SND-C-2024-030', resp: T('Semi-annual · 48 h call-out', 'نصف سنوي · 48 ساعة للطلب'), sla: 98, value: 12400, end: '2027-04-30' },
  ];
  const WEEKS = { created: [15, 14, 17, 12, 19, 16, 21, 15, 18, 22, 17, 20, 16], closed: [14, 13, 15, 14, 16, 17, 18, 16, 15, 19, 18, 21, 14] };

  /* ======================================================================
     Helpers
     ====================================================================== */
  const sec = (title, extra = '') => `<div class="section-title"><h2>${title}</h2>${extra}</div>`;
  /** Page header with provenance + scope meta line (technical variant). */
  const fhead = (o) => `${ui.pageHead(o)}<div class="fm-meta"><span class="fm-scopek">${icon('layers')}${fscope() === 'all' ? L(`All facilities (${SITE_IDS.length})`, `كل المرافق (${SITE_IDS.length})`) : sshort(fscope())}</span><span class="fm-dot"></span><span>${L('Shift data as of 25 Nov 2026 · 10:00', 'بيانات الوردية حتى 25 ت٢ 2026 · 10:00')}</span><span class="fm-dot"></span>${ui.prov('demo')}${o.metaExtra || ''}</div>`;
  /** Compact navy operations strip: items [value, label, go, tone, unit] */
  const opsStrip = (items) => `<section class="fm-ops fm-ops-sm"><div class="fm-stats" style="grid-template-columns:repeat(${items.length},minmax(0,1fr))">${items.map(([v, l, go, tone, u]) => `<${go ? `button data-go="${go}"` : 'div'} class="${tone || ''}"><b>${v}${u ? `<small>${u}</small>` : ''}</b><span>${l}</span></${go ? 'button' : 'div'}>`).join('')}</div></section>`;
  const tag = (t, cls = '') => `<span class="fm-tag ${cls}">${esc(t)}</span>`;
  const cond = (c) => `<span class="fm-cond c-${c}"><i></i>${ui.statusLabel(c)}</span>`;
  const PRIO_I = { critical: 'zap', high: 'arrowUp', medium: 'minus', low: 'arrowDown' };
  const prio = (p) => `<span class="fm-prio ${p}">${icon(PRIO_I[p])}${ui.statusLabel(p)}</span>`;
  const due = (w) => (w.status === 'completed' ? `<span class="faint nowrap">${B.dateShort(w.closed)}</span>` : `<span class="fm-due nowrap ${isLate(w) ? 'over' : ''}">${B.dateShort(w.due)}${isLate(w) ? ' · ' + L(`${-B.daysFromToday(w.due)}d late`, `متأخر ${-B.daysFromToday(w.due)} ي`) : ''}</span>`);
  const catIcon = (c) => CATS[c].icon;
  const who = (w) => (w.tech ? tname(w.tech) : w.contractor ? tx(D.provider(w.contractor).name) : L('Unassigned', 'غير مُسند'));
  const pmBy = (p) => (p.by === 'in' ? ui.status('fmInHouse') : `<span class="small">${tx(D.provider(p.by).name)}</span>`);
  const openWOs = () => WOS.filter(isOpen);
  const pmCompletion = () => Math.round(B.sum(PM, (p) => p.comp) / PM.length);
  const overdueInsp = () => ASSETS.filter((a) => a.ms === 'fmOverdue');
  const scale = () => `<div class="fm-scale">${COND_ORDER.map((c) => cond(c)).join('')}</div>`;
  /* technical photo placeholders (plant room / panel / pipework) */
  const photoArt = (seed) => {
    const r = B.rng(seed * 53 + 7); const k = seed % 3;
    const bg = ['#D9E2E8', '#E3E8E4', '#DCE3EC'][k];
    let g = `<rect width="200" height="200" fill="${bg}"/><rect y="150" width="200" height="50" fill="#C9D3DA"/>`;
    if (k === 0) { g += `<rect x="46" y="30" width="108" height="130" rx="6" fill="#F3F5F6" stroke="#9AA9B5"/><rect x="58" y="44" width="84" height="30" rx="3" fill="#142B3B"/><text x="64" y="64" font-family="monospace" font-size="11" fill="#36D6A0">LOOP 3 E/F</text>` + [0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${64 + i * 14}" cy="90" r="4" fill="${i === 2 ? '#C2362F' : '#36D6A0'}"/>`).join('') + `<rect x="58" y="108" width="84" height="38" rx="3" fill="#E2E8EC"/>`; }
    else if (k === 1) { g += [0, 1, 2].map((i) => `<rect x="${20 + i * 58}" y="20" width="16" height="140" fill="#8EA7BA"/><rect x="${14 + i * 58}" y="${60 + r() * 40}" width="28" height="18" rx="3" fill="#E5774C"/>`).join('') + `<rect x="10" y="40" width="180" height="12" fill="#7FA7C2"/><circle cx="150" cy="120" r="18" fill="#F3F5F6" stroke="#55667A" stroke-width="3"/><path d="M150 120 l10 -8" stroke="#C2362F" stroke-width="3"/>`; }
    else { g += `<rect x="30" y="40" width="140" height="90" rx="8" fill="#B7C6D1"/>` + Array.from({ length: 9 }, (_, i) => `<rect x="${42 + i * 14}" y="52" width="8" height="66" rx="2" fill="#E8EEF2"/>`).join('') + `<rect x="30" y="130" width="140" height="10" fill="#8EA7BA"/>`; }
    return `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${g}</svg>`;
  };
  const backLink = (go, label) => `<div class="row-sm" style="margin-bottom:6px"><button class="btn btn-text btn-sm" data-go="${go}">${icon('chevL', 'flip')}${label}</button></div>`;

  const ALERTS = () => {
    const out = [];
    ASSETS.filter((a) => a.ms === 'fmFault').forEach((a) => out.push({ sev: 'critical', t: L(`${tx(a.name)} — loop 3 earth fault`, `${tx(a.name)} — عطل تأريض في الدائرة 3`), s: `${tag(a.tag)} ${sshort(a.b)} · ${L('fire watch posted', 'تم تعيين مراقب حريق')}`, go: `${R}-wo-WO-26-1188` }));
    out.push({ sev: 'high', t: L('Elevator 3 out of service — awaiting door operator', 'المصعد 3 خارج الخدمة — بانتظار محرك الأبواب'), s: `${tag('SND-311-EL-03')} ${sshort('BN-RAM-00311')} · ${L('part due 27 Nov', 'القطعة متوقعة 27 ت٢')}`, go: `${R}-wo-WO-26-1186` });
    overdueInsp().forEach((a) => out.push({ sev: 'medium', t: L(`Inspection overdue — ${tx(a.name)}`, `فحص متأخر — ${tx(a.name)}`), s: `${tag(a.tag)} ${sshort(a.b)} · ${B.inDays(a.next)}`, go: `${R}-asset-${a.tag}` }));
    out.push({ sev: 'info', t: L('Contract renewal — Volt Electric expires 31 Dec', 'تجديد عقد — فولت للكهرباء ينتهي 31 ك١'), s: L('Electrical support · Manara BC & Ma\'ahid', 'الدعم الكهربائي · المنارة والمعاهد'), go: `${R}-contractors` });
    return out;
  };
  const alertRow = (a) => `<button class="fm-alert ${a.sev}" data-go="${a.go}"><span class="sev"></span><span style="min-width:0"><b>${a.t}</b><small>${a.s}</small></span>${icon('chevR', 'chev flip')}</button>`;

  const woRow = (cols) => cols;
  const woTable = (rows, id, pageSize) => ui.table({ id, rows, pageSize, rowGo: (w) => `${R}-wo-${w.id}`, defaultSort: '', cols: [
    { key: 'id', label: L('Work order', 'أمر العمل'), sort: true, render: (w) => `<div class="fm-cell"><span class="li-icon ${w.priority === 'critical' ? 'bad' : ''}">${icon(catIcon(asset(w.asset).cat))}</span><div style="min-width:0"><b>${tx(w.title)}</b><small>${ui.idMono(w.id)} · ${sshort(asset(w.asset).b)}</small></div></div>`, mRender: (w) => tx(w.title), m: 'title' },
    { key: 'priority', label: L('Priority', 'الأولوية'), sort: (w) => ['critical', 'high', 'medium', 'low'].indexOf(w.priority), render: (w) => prio(w.priority), m: 'meta' },
    { key: 'tech', label: L('Assigned', 'المُسند إليه'), render: (w) => (w.tech ? `<span class="row-sm nowrap">${ui.avatar(TECHS[w.tech].n, 'sm')}${tname(w.tech)}</span>` : w.contractor ? `<span class="small">${tx(D.provider(w.contractor).name)}</span>` : `<span class="faint small">${L('Unassigned', 'غير مُسند')}</span>`), m: 'sub' },
    { key: 'status', label: L('Status', 'الحالة'), render: (w) => ui.status(w.status), m: 'end' },
    { key: 'due', label: L('Due', 'الاستحقاق'), sort: true, align: 'end', render: due, m: 'meta' },
  ] });

  /* ======================================================================
     Pages
     ====================================================================== */
  function home() {
    fcrumbs({ label: L('Facility overview', 'نظرة عامة على المرافق') });
    const open = openWOs().filter((w) => inFs(asset(w.asset).b));
    const late = open.filter(isLate);
    const al = ALERTS();
    const crit = open.filter((w) => w.priority === 'critical' || w.priority === 'high');
    const stats = [
      { v: fIds().length, l: L('Facilities under management', 'مرافق تحت الإدارة'), go: `${R}-sites` },
      { v: ASSETS.filter((a) => inFs(a.b)).length, l: L('Registered assets', 'أصول مسجلة'), go: `${R}-assets` },
      { v: open.length, l: L(`Open work orders · ${late.length} late`, `أوامر عمل مفتوحة · ${late.length} متأخرة`), go: `${R}-workorders`, cls: late.length ? 'warn' : '' },
      { v: pmCompletion(), u: '%', l: L('PM completion (Nov)', 'إنجاز الصيانة الوقائية (ت٢)'), go: `${R}-pm` },
      { v: overdueInsp().filter((a) => inFs(a.b)).length, l: L('Overdue inspections', 'فحوصات متأخرة'), go: `${R}-inspections`, cls: 'bad' },
      { v: CONTRACTORS.length, l: L('Active contractors', 'مقاولون نشطون'), go: `${R}-contractors` },
    ];
    const techLoad = Object.keys(TECHS).map((k) => ({ label: tname(k), sub: tx(TECHS[k].r), value: open.filter((w) => w.tech === k).length })).filter((x) => x.value).sort((a, b) => b.value - a.value);
    const week = PM.filter((p) => p.next >= TODAY && p.next <= '2026-12-02').sort(B.by('next'));
    return `
    <section class="fm-ops">
      <div class="fm-ops-top"><div><div class="fm-k">${L('Sanad Facility Services · Operations', 'سند لخدمات إدارة المرافق · العمليات')}</div><h1 style="margin-top:4px">${L('Facility overview', 'نظرة عامة على المرافق')}</h1></div>
        <div class="row-sm wrap"><span class="fm-shift"><span class="pulse"></span>${L('Day shift · Wed 25 Nov · 10:00 (sample)', 'الوردية النهارية · الأربعاء 25 ت٢ · 10:00 (نموذج)')}</span>${ui.btn(L('New work order', 'أمر عمل جديد'), { icon: 'plus', kind: 'primary', size: 'sm', act: 'fmNewWO' })}</div></div>
      <div class="fm-stats">${stats.map((s) => `<button class="${s.cls || ''}" data-go="${s.go}"><b>${s.v}${s.u ? `<small>${s.u}</small>` : ''}</b><span>${s.l}</span></button>`).join('')}</div>
      <div class="fm-sites">${SITE_IDS.map((bid) => `<button class="fm-site-chip" data-go="${R}-site-${bid}"><span class="pulse ${assetsOf(bid).some((a) => a.ms === 'fmFault') ? 'bad' : assetsOf(bid).some((a) => a.ms === 'fmOverdue') ? 'warn' : ''}"></span>${sshort(bid)}<em>${healthScore(assetsOf(bid))}</em></button>`).join('')}</div>
    </section>

    <div class="grid g-main" style="margin-top:16px">
      <div class="stack">
        ${ui.card({ title: L('Critical alerts', 'تنبيهات حرجة'), sub: L(`${al.length} items need attention`, `${al.length} عناصر بحاجة لانتباه`), headExtra: `<span class="badge bad">${icon('alert')}${al.filter((a) => a.sev === 'critical').length} ${L('critical', 'حرج')}</span>`, body: al.map(alertRow).join('') })}
        ${ui.card({ title: L('Work-order trend', 'اتجاه أوامر العمل'), sub: L('Created vs closed · last 13 weeks · all sites', 'المُنشأة مقابل المُغلقة · آخر 13 أسبوعاً · جميع المواقع'), cls: 'fm-c', link: { label: L('Work orders', 'أوامر العمل'), go: `${R}-workorders` },
          body: B.charts.line({ labels: WEEKS.created.map((_, i) => L(`W${35 + i}`, `أ${35 + i}`)), series: [{ name: L('Created', 'مُنشأة'), color: '#142B3B', values: WEEKS.created }, { name: L('Closed', 'مُغلقة'), color: '#36D6A0', values: WEEKS.closed, area: true }], height: 200, format: (v) => B.num(v) }) })}
        ${ui.card({ title: L('Asset health matrix', 'مصفوفة سلامة الأصول'), sub: L('Worst condition per system · number of assets', 'أسوأ حالة لكل نظام · عدد الأصول'), body: matrix() + `<div style="margin-top:14px">${scale()}</div>` })}
      </div>
      <div class="stack">
        ${ui.card({ title: L('Priority work', 'أعمال ذات أولوية'), sub: L('Critical and high, open', 'حرجة وعالية، مفتوحة'), link: { label: L('All', 'الكل'), go: `${R}-workorders` }, body: ui.list(crit.map((w) => ui.li({ icon: catIcon(asset(w.asset).cat), tone: w.priority === 'critical' ? 'bad' : 'warn', title: tx(w.title), sub: `${ui.idMono(w.id)} · ${sshort(asset(w.asset).b)} · ${who(w)}`, end: ui.status(w.status), go: `${R}-wo-${w.id}` }))) })}
        ${ui.card({ title: L('Open work by priority', 'الأعمال المفتوحة حسب الأولوية'), body: B.charts.donut({ size: 128, data: [['critical', '#C2362F'], ['high', '#E5774C'], ['medium', '#F2B35A'], ['low', '#C9D6DF']].map(([k, c]) => ({ label: ui.statusLabel(k), value: open.filter((w) => w.priority === k).length, color: c })), center: { value: open.length, label: L('open', 'مفتوح') } }) })}
        ${ui.card({ title: L('Technician workload', 'عبء عمل الفنيين'), sub: L('Open work orders per technician', 'أوامر العمل المفتوحة لكل فني'), body: B.charts.hbars({ data: techLoad.map((t) => ({ ...t, color: t.value >= 4 ? '#E5774C' : '#142B3B' })), max: 5, format: (v) => v }) })}
        ${ui.card({ title: L('PM due this week', 'صيانة وقائية مستحقة هذا الأسبوع'), link: { label: L('Schedule', 'الجدول'), go: `${R}-pm` }, body: ui.list(week.map((p) => ui.li({ icon: catIcon(p.cat), title: tx(p.n), sub: `${p.sites.map((s) => sshort('BN-RAM-00' + s)).join(' · ')}`, end: `<span class="xs faint nowrap">${B.dateShort(p.next)}</span>`, go: `${R}-pm` }))) })}
      </div>
    </div>`;
  }

  function matrix() {
    const cols = SYSTEMS;
    return `<div class="fm-matrix" style="grid-template-columns: minmax(96px, 1.4fr) repeat(${cols.length}, minmax(0, 1fr))"><div></div>${cols.map((s) => `<div class="h" title="${esc(tx(s.n))}">${tx(s.short || s.n)}</div>`).join('')}
      ${fIds().map((bid) => `<div class="rl"><b>${sshort(bid)}</b><span class="fm-mono xs faint">${bid.slice(-5)}</span></div>${cols.map((s) => { const list = assetsOf(bid).filter((a) => CATS[a.cat].sys === s.id); if (!list.length) return '<div class="cell none">–</div>'; const w = worst(list); const flag = list.some((a) => a.ms === 'fmFault' || a.ms === 'fmOverdue'); return `<button class="cell c-${w}" data-act="fmMatrix" data-arg="${bid}|${s.id}" title="${esc(tx(s.n))} · ${esc(ui.statusLabel(w))}">${list.length}${flag ? '!' : ''}</button>`; }).join('')}`).join('')}</div>`;
  }

  /* ---------------- Facilities ---------------- */
  function sites() {
    fcrumbs({ label: L('Facilities', 'المرافق') });
    return `${fhead({ eyebrow: L('Portfolio', 'المحفظة'), title: L('Facilities', 'المرافق'), sub: L('Buildings operated by Sanad under facility-management contracts.', 'المباني التي تشغّلها سند بموجب عقود إدارة المرافق.'), actions: ui.btn(L('Export portfolio', 'تصدير المحفظة'), { icon: 'download', act: 'previewDoc', arg: L('Sanad portfolio report — Nov 2026.pdf', 'تقرير محفظة سند — ت٢ 2026.pdf') }) })}
    <div class="stack">${SITE_IDS.map((bid) => {
      const b = D.building(bid), s = site(bid), as = assetsOf(bid);
      const ow = WOS.filter((w) => isOpen(w) && asset(w.asset).b === bid);
      const h = healthScore(as);
      return `<button class="card fm-fac link" data-go="${R}-site-${bid}"><div class="media">${B.art.facade(s.seed, { type: b.type, floors: b.floors })}</div>
        <div class="fm-fac-b"><div class="row-sm wrap">${tag(bid)}${ui.badge(D.typeLabel(b.type), 'neutral', D.types[b.type].icon)}${ui.badge(`SLA ${s.sla}`, s.sla === 'Platinum' ? 'navy' : 'outline')}</div>
          <h3>${tx(b.name)}</h3><div class="small muted">${tx(b.address)} · ${tx(s.contract)}</div>
          <div class="fm-stat-row" style="margin-top:auto"><div><b>${as.length}</b><span>${L('Assets', 'أصول')}</span></div><div><b>${ow.length}</b><span>${L('Open WOs', 'أوامر مفتوحة')}</span></div><div><b>${B.num(b.area)}</b><span>${L('m² GFA', 'م² إجمالي')}</span></div><div><b>${s.team}</b><span>${L('On-site staff', 'فريق الموقع')}</span></div></div></div>
        <div class="fm-fac-s"><div class="row">${B.charts.ring(h, { size: 64, color: h >= 80 ? '#36D6A0' : h >= 65 ? '#F2B35A' : '#E5774C' })}<div><div class="fm-k">${L('Health score', 'مؤشر السلامة')}</div><div class="small muted">${L('from asset condition', 'حسب حالة الأصول')}</div></div></div>
          <div class="stack-sm">${as.some((a) => a.ms === 'fmFault') ? ui.status('fmFault') : ''}${as.some((a) => a.ms === 'fmOverdue') ? ui.status('fmOverdue') : ''}${!as.some((a) => a.ms === 'fmFault' || a.ms === 'fmOverdue') ? ui.status('fmOk') : ''}</div></div></button>`;
    }).join('')}</div>
    <div class="grid g2" style="margin-top:16px">
      ${ui.card({ title: L('Monthly energy use', 'استهلاك الطاقة الشهري'), sub: L('kWh · October 2026', 'ك.و.س · تشرين الأول 2026'), body: B.charts.hbars({ data: SITE_IDS.map((bid, i) => ({ label: sshort(bid), sub: `${B.num1(site(bid).energy / D.building(bid).area)} kWh/m²`, value: site(bid).energy, color: ['#142B3B', '#7FA7C2', '#36D6A0'][i] })), format: (v) => B.compact(v) }) })}
      ${ui.card({ title: L('Maintenance spend vs budget', 'مصاريف الصيانة مقابل الموازنة'), sub: L('Year to date · ₪', 'منذ بداية العام · ₪'), body: B.charts.shares({ rows: SITE_IDS.map((bid, i) => ({ label: sshort(bid), parts: [{ name: L('Planned', 'مخطط'), value: [182000, 121000, 164000][i], color: '#142B3B' }, { name: L('Reactive', 'طارئ'), value: [64000, 58000, 31000][i], color: '#F2B35A' }] })), legend: [{ name: L('Planned (PM)', 'مخطط (وقائي)'), color: '#142B3B' }, { name: L('Reactive', 'تصحيحي'), color: '#F2B35A' }] }) })}
    </div>`;
  }

  function siteDetail(bid) {
    const b = D.building(bid), s = site(bid);
    if (!b || !s) return ui.empty({ icon: 'building', title: L('Facility not found', 'المرفق غير موجود'), action: ui.btn(L('All facilities', 'كل المرافق'), { kind: 'primary', go: `${R}-sites` }) });
    B.title(tx(b.name)); B.navActive('sites');
    fcrumbs({ label: L('Facilities', 'المرافق'), go: `${R}-sites` }, { label: sshort(bid) });
    const tab = B.get('fm:siteTab', 'overview');
    const as = assetsOf(bid);
    const ow = WOS.filter((w) => asset(w.asset).b === bid);
    let body = '';
    if (tab === 'overview') {
      body = `<div class="grid g-main"><div class="stack">
        ${ui.card({ title: L('Facility information', 'معلومات المرفق'), body: ui.kvGrid([[L('BENA ID', 'رقم بينا'), ui.idMono(bid)], [L('Municipal GIS', 'رقم البلدية'), ui.idMono(b.gis)], [L('Type', 'النوع'), D.typeLabel(b.type)], [L('Floors', 'الطوابق'), b.floors], [L('Gross floor area', 'المساحة الإجمالية'), `${B.num(b.area)} m²`], [L('Built', 'سنة البناء'), b.year], [L('Elevators', 'المصاعد'), b.elevators], [L('Parking', 'المواقف'), b.parking], [L('Operating hours', 'ساعات التشغيل'), tx(s.hours)], [L('Units / tenants', 'الوحدات / المستأجرون'), b.units]]) })}
        ${ui.card({ title: L('Contract', 'العقد'), body: ui.kv([[L('Service scope', 'نطاق الخدمة'), tx(s.contract)], [L('Client', 'العميل'), tx(s.client)], [L('Since', 'منذ'), B.date(s.since)], [L('SLA tier', 'مستوى الخدمة'), `SLA ${s.sla}`], [L('On-site team', 'فريق الموقع'), L(`${s.team} technicians · supervisor on call`, `${s.team} فنيين · مشرف مناوب`)], [L('Monthly energy', 'الطاقة الشهرية'), `${B.num(s.energy)} kWh`], [L('Monthly water', 'المياه الشهرية'), `${B.num(s.water)} m³`]]) })}
      </div><div class="stack">
        ${ui.card({ title: L('Location', 'الموقع'), sub: tx(b.address), body: B.map.render({ static: true, focus: bid, id: 'fm-' + bid, legend: false, selected: bid, height: '240px', focusW: 300 }), foot: ui.btn(L('Full building profile', 'ملف المبنى الكامل'), { icon: 'building', size: 'sm', kind: 'soft', go: `${R}-building-${bid}` }) })}
        ${ui.card({ title: L('Systems at a glance', 'الأنظمة باختصار'), body: SYSTEMS.map((sy) => { const l = as.filter((a) => CATS[a.cat].sys === sy.id); return l.length ? `<div class="row between" style="padding:7px 0;border-bottom:1px solid var(--line-2)"><span class="row-sm small fm-sysl">${icon(sy.icon)}${tx(sy.n)}</span>${cond(worst(l))}</div>` : ''; }).join('') })}
      </div></div>`;
    } else if (tab === 'systems') {
      body = `<div class="fm-sys">${SYSTEMS.map((sy) => {
        const l = as.filter((a) => CATS[a.cat].sys === sy.id);
        if (!l.length) return '';
        const nx = l.slice().sort(B.by('next'))[0];
        return `<button class="fm-sys-c" data-act="fmMatrix" data-arg="${bid}|${sy.id}"><div class="fm-sys-h"><span class="li-icon navy">${icon(sy.icon)}</span><div class="grow"><b>${tx(sy.n)}</b><div class="xs faint">${L(`${l.length} assets`, `${l.length} أصول`)}</div></div>${cond(worst(l))}</div>
          <div class="bar">${l.map((a) => `<i class="cell c-${a.cond}" title="${esc(a.tag)}"></i>`).join('')}</div>
          <div class="row between xs"><span class="faint">${L('Next service', 'الخدمة القادمة')}</span><span>${tag(nx.tag)} · ${B.dateShort(nx.next)}</span></div>
          ${l.some((a) => a.ms !== 'fmOk') ? `<div class="row-sm wrap">${[...new Set(l.filter((a) => a.ms !== 'fmOk').map((a) => a.ms))].map((m) => ui.status(m)).join('')}</div>` : ''}</button>`;
      }).join('')}</div><div style="margin-top:14px">${scale()}</div>`;
    } else if (tab === 'assets') {
      body = assetTable(as, 'fm-site-as');
    } else if (tab === 'areas') {
      const AREAS = [[T('Main lobby & reception', 'الردهة الرئيسية والاستقبال'), 'door', 'good', T('Cleaned 09:40 · inspected daily', 'نُظّفت 09:40 · فحص يومي')], [T('Parking levels', 'طوابق المواقف'), 'car', 'fair', T(`${b.parking} bays · 2 lights out`, `${b.parking} موقفاً · إنارتان معطلتان`)], [T('Plant rooms', 'غرف المعدات'), 'settings', 'good', T('Weekly walk-through · 21 Nov', 'جولة أسبوعية · 21 ت٢')], [T('Roof & plant deck', 'السطح ومنصة المعدات'), 'sun', 'good', T('Access log controlled', 'دخول مُسجّل ومضبوط')], [T('Washrooms', 'دورات المياه'), 'droplet', 'excellent', T('Hourly checks · 98% score', 'فحص كل ساعة · 98%')], [T('Stairs & escape routes', 'الأدراج ومسارات الهروب'), 'stairs', bid === 'BN-RAM-00415' ? 'fair' : 'good', T('Emergency lighting tested monthly', 'إنارة الطوارئ تُختبر شهرياً')], [T('Loading & waste area', 'منطقة التحميل والنفايات'), 'truck', 'good', T('Collection Mon / Thu', 'الجمع الإثنين / الخميس')]];
      body = `<div class="grid g2">${AREAS.map(([n, ic, c, d]) => `<div class="card pad-sm"><div class="row"><span class="li-icon">${icon(ic)}</span><div class="grow"><b class="small" style="display:block">${tx(n)}</b><span class="xs muted">${tx(d)}</span></div>${cond(c)}</div></div>`).join('')}</div>`;
    } else {
      const done = ow.filter((w) => w.status === 'completed');
      const reqs = D.requestsOf(bid);
      const items = done.map((w) => ({ d: w.closed, title: tx(w.title), meta: `${w.id} · ${tname(w.tech)} · ${B.date(w.closed)}`, icon: 'check', state: 'done' }))
        .concat(reqs.map((q) => ({ d: q.created, title: tx(q.title), meta: `${q.id} · ${L('tenant request', 'طلب مستأجر')} · ${B.date(q.created)}`, icon: q.status === 'completed' ? 'check' : 'clock', state: q.status === 'completed' ? 'done' : 'current' })))
        .concat([{ d: '2026-10-05', title: L('Quarterly chiller / HVAC service', 'الخدمة الربعية للتكييف'), meta: `PM-02 · ${B.date('2026-10-05')}`, icon: 'check', state: 'done' }, { d: '2026-09-12', title: L('BMS & access control health check', 'فحص سلامة BMS والتحكم بالدخول'), meta: `PM-12 · ${B.date('2026-09-12')}`, icon: 'check', state: 'done' }])
        .sort((a, b) => (a.d < b.d ? 1 : -1));
      body = `<div class="grid g-main">${ui.card({ title: L('Maintenance history', 'سجل الصيانة'), sub: L('Completed work orders, tenant requests and PM visits', 'أوامر العمل المكتملة وطلبات المستأجرين وزيارات الصيانة الوقائية'), body: ui.timeline(items) })}
        ${ui.card({ title: L('Work orders by type', 'أوامر العمل حسب النوع'), sub: L('Last 90 days', 'آخر 90 يوماً'), body: B.charts.donut({ size: 130, data: [{ label: ui.statusLabel('fmPreventive'), value: 41, color: '#142B3B' }, { label: ui.statusLabel('fmCorrective'), value: 23, color: '#F2B35A' }, { label: ui.statusLabel('fmInspection'), value: 12, color: '#7FA7C2' }, { label: ui.statusLabel('fmEmergency'), value: 3, color: '#C2362F' }], center: { value: 79, label: L('WOs', 'أمر') } }) })}</div>`;
    }
    return `${backLink(`${R}-sites`, L('Facilities', 'المرافق'))}
    <section class="fm-ops" style="margin-bottom:18px"><div class="fm-ops-top"><div style="min-width:0"><div class="row-sm wrap">${tag(bid, 'dark')}${tag(b.gis, 'dark')}<span class="badge" style="background:rgba(255,255,255,.08);color:#fff">SLA ${s.sla}</span></div><h1 style="margin-top:8px">${tx(b.name)}</h1><div class="small" style="margin-top:2px">${tx(b.address)}</div></div>
      <div class="row-sm wrap">${ui.btn(L('New work order', 'أمر عمل جديد'), { icon: 'plus', kind: 'primary', size: 'sm', act: 'fmNewWO', arg: '|' + bid })}${ui.btn(L('Connected view', 'العرض المتصل'), { icon: 'wifi', size: 'sm', act: 'fmConnected', arg: bid })}</div></div>
      <div class="fm-stats">${[[as.length, L('Assets', 'أصول')], [ow.filter(isOpen).length, L('Open work orders', 'أوامر عمل مفتوحة')], [healthScore(as), L('Health score', 'مؤشر السلامة')], [as.filter((a) => a.ms === 'fmOverdue').length, L('Overdue inspections', 'فحوصات متأخرة')], [b.floors, L('Floors', 'طوابق')], [s.team, L('On-site team', 'فريق الموقع')]].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('')}</div></section>
    ${ui.tabs('fm:siteTab', [{ id: 'overview', label: L('Overview', 'نظرة عامة'), icon: 'info' }, { id: 'systems', label: L('Building systems', 'أنظمة المبنى'), icon: 'layers' }, { id: 'assets', label: L('Assets', 'الأصول'), icon: 'cpu', count: as.length }, { id: 'areas', label: L('Shared areas', 'المناطق المشتركة'), icon: 'grid' }, { id: 'history', label: L('Maintenance history', 'سجل الصيانة'), icon: 'history' }], tab)}
    ${body}`;
  }

  /* ---------------- Assets ---------------- */
  const REG = [
    { id: 'all', n: T('All assets', 'كل الأصول'), cats: null, icon: 'layers' },
    { id: 'elevator', n: T('Elevators', 'المصاعد'), cats: ['elevator'], icon: 'elevator' },
    { id: 'hvac', n: T('HVAC', 'التكييف والتهوية'), cats: ['hvac'], icon: 'wind' },
    { id: 'pumps', n: T('Pumps', 'المضخات'), cats: ['pump'], icon: 'pump' },
    { id: 'gen', n: T('Generators', 'المولدات'), cats: ['generator'], icon: 'generator' },
    { id: 'fire', n: T('Fire safety', 'السلامة من الحريق'), cats: ['fire'], icon: 'fireExt' },
    { id: 'elec', n: T('Electrical systems', 'الأنظمة الكهربائية'), cats: ['electrical'], icon: 'zap' },
    { id: 'water', n: T('Water systems', 'أنظمة المياه'), cats: ['water', 'medgas'], icon: 'droplet' },
    { id: 'sec', n: T('Security & BMS', 'الأمن وإدارة المبنى'), cats: ['access', 'cctv', 'bms'], icon: 'shield' },
  ];
  const teamOf = (a) => TEAM[a.cat] || ['t_yazan'];
  const teamCell = (a) => { const [t, c] = teamOf(a); return `<span class="row-sm nowrap">${ui.avatar(TECHS[t].n, 'sm')}<span style="min-width:0"><span class="xt-strong">${tname(t)}</span>${c ? `<span class="xt-sub">+ ${esc(tx(D.provider(c).name))}</span>` : `<span class="xt-sub">${tx(TECHS[t].r)}</span>`}</span></span>`; };
  const nextCell = (a) => { const d = B.daysFromToday(a.next); return `<span class="nowrap"><span class="xt-strong ${d < 0 ? 'fm-due over' : ''}">${B.dateShort(a.next)}</span><span class="xt-sub" style="${d < 0 ? 'color:var(--bad)' : d <= 7 ? 'color:var(--warn)' : ''}">${d < 0 ? L(`${-d} d overdue`, `متأخر ${-d} يوم`) : d === 0 ? L('today', 'اليوم') : L(`in ${d} d`, `خلال ${d} يوم`)}</span></span>`; };
  function assetTable(rows, id, o = {}) {
    return B.xtable({ id, rows, key: (a) => a.tag, pageSize: o.pageSize || 25, maxH: o.maxH, rowGo: (a) => `${R}-asset-${a.tag}`, defaultSort: o.sort || '',
      bulk: [{ label: L('Create work orders', 'إنشاء أوامر عمل'), icon: 'clipboard', act: 'fmBulkWO' }, { label: L('Log inspection', 'تسجيل فحص'), icon: 'checkSquare', act: 'fmBulkInspect' }, { label: L('Print QR labels', 'طباعة ملصقات QR'), icon: 'qr', act: 'fmBulkQR' }, { label: L('Export', 'تصدير'), icon: 'download', act: 'fmExport' }],
      cols: [
        { key: 'tag', label: L('Asset tag', 'رمز الأصل'), sort: true, m: 'meta', render: (a) => tag(a.tag) },
        { key: 'name', label: L('Asset', 'الأصل'), sort: (a) => tx(a.name), m: 'title', render: (a) => `<div class="fm-cell"><span class="li-icon">${icon(catIcon(a.cat))}</span><div style="min-width:0"><b>${tx(a.name)}</b><small>${tx(CATS[a.cat].n)} · ${esc(a.spec)}</small></div></div>`, mRender: (a) => tx(a.name) },
        { key: 'loc', label: L('Location', 'الموقع'), sort: (a) => a.b + tx(a.loc), m: 'sub', render: (a) => `<span class="xt-strong">${sshort(a.b)}</span><span class="xt-sub">${tx(a.loc)}</span>` },
        { key: 'crit', label: L('Crit.', 'الأهمية'), sort: true, align: 'center', cls: 'fm-hide-md', m: 'hide', render: (a) => `<span class="fm-crit c${a.crit}" title="${esc(L(`Criticality ${a.crit}`, `الأهمية ${a.crit}`))}">${a.crit}</span>` },
        { key: 'cond', label: L('Condition', 'الحالة'), sort: (a) => COND_ORDER.indexOf(a.cond), m: 'meta', render: (a) => cond(a.cond) },
        { key: 'next', label: L('Next maintenance', 'الصيانة القادمة'), sort: true, m: 'meta', render: nextCell },
        { key: 'team', label: L('Assigned team', 'الفريق المسؤول'), sort: (a) => tname(teamOf(a)[0]), m: 'hide', render: teamCell },
        { key: 'ms', label: L('Status', 'الوضع'), sort: (a) => ['fmFault', 'fmOverdue', 'fmRepair', 'fmDue', 'fmOk'].indexOf(a.ms), m: 'end', render: (a) => ui.status(a.ms) },
      ] });
  }
  function assets() {
    fcrumbs({ label: L('Building assets', 'أصول المباني') });
    const reg = B.get('fm:areg', 'all'), q = B.get('fm:aq', ''), fco = B.get('fm:acond', 'all');
    const R0 = REG.find((r) => r.id === reg) || REG[0];
    const scoped = ASSETS.filter((a) => inFs(a.b));
    const inReg = (a, r) => !r.cats || r.cats.includes(a.cat);
    const base = scoped.filter((a) => inReg(a, R0));
    const rows = base.filter((a) => (fco === 'all' || (fco === 'attn' ? a.ms !== 'fmOk' : fco === 'due30' ? B.daysFromToday(a.next) <= 30 : a.cond === fco)) && B.match(q, a.tag, a.name, a.loc, a.spec));
    const counts = COND_ORDER.map((c) => ({ c, n: base.filter((a) => a.cond === c).length }));
    const tiles = REG.slice(1).map((r) => { const l = scoped.filter((a) => inReg(a, r)); if (!l.length) return ''; const nx = l.slice().sort(B.by('next'))[0]; const att = l.filter((a) => a.ms !== 'fmOk').length;
      return `<button class="fm-reg ${reg === r.id ? 'on' : ''}" data-act="set" data-arg="fm:areg=${reg === r.id ? 'all' : r.id}"><div class="fm-reg-h"><span class="row-sm">${icon(r.icon)}<b>${tx(r.n)}</b></span><span class="fm-mono">${l.length}</span></div>
        <div class="bar">${l.map((a) => `<i class="cell c-${a.cond}" title="${esc(a.tag)} · ${esc(ui.statusLabel(a.cond))}"></i>`).join('')}</div>
        <div class="fm-reg-f"><span>${L('Next', 'القادم')} ${B.dateShort(nx.next)}</span>${att ? `<span class="fm-att">${icon('alertCircle')}${att}</span>` : `<span class="fm-okk">${icon('check')}</span>`}</div></button>`; }).join('');
    return `${fhead({ eyebrow: L('Portfolio · asset registers', 'المحفظة · سجلات الأصول'), title: L('Building assets', 'أصول المباني'), sub: L(`${scoped.length} maintainable assets in ${fIds().length} facilit${fIds().length > 1 ? 'ies' : 'y'} — tagged, condition-rated and linked to PM plans and work orders.`, `${scoped.length} أصلاً قابلاً للصيانة في ${fIds().length} ${fIds().length > 1 ? 'مرافق' : 'مرفق'} — مُرمّزة ومقيّمة الحالة ومرتبطة بخطط الصيانة وأوامر العمل.`),
      actions: ui.btn(L('Print QR labels', 'طباعة ملصقات QR'), { icon: 'qr', act: 'fmQR', arg: 'SND-311-EL-01' }) + ui.btn(L('Add asset', 'إضافة أصل'), { icon: 'plus', kind: 'primary', act: 'fmAddAsset' }) })}
    <div class="fm-regs">${tiles}</div>
    <div class="card pad-sm" style="margin:12px 0 14px"><div class="row wrap between" style="gap:14px"><div class="grow" style="min-width:240px"><div class="fm-k" style="margin-bottom:8px">${L('Condition distribution', 'توزيع الحالة')} · ${tx(R0.n)}</div>
      <div style="display:flex;height:10px;border-radius:99px;overflow:hidden;gap:2px">${counts.filter((x) => x.n).map((x) => `<i class="cell c-${x.c}" style="display:block;flex:${x.n}" title="${esc(ui.statusLabel(x.c))}: ${x.n}"></i>`).join('')}</div>
      <div class="fm-scale" style="margin-top:8px">${counts.map((x) => `<span class="fm-cond c-${x.c}"><i></i>${ui.statusLabel(x.c)} <span class="fm-mono faint">${x.n}</span></span>`).join('')}</div></div>
      <div class="row" style="gap:22px">${[[base.filter((a) => a.crit === 'A').length, L('Criticality A', 'أهمية A')], [base.filter((a) => B.daysFromToday(a.next) >= 0 && B.daysFromToday(a.next) <= 7).length, L('Due ≤ 7 days', 'مستحقة ≤ 7 أيام')], [base.filter((a) => a.next < TODAY).length, L('Overdue', 'متأخرة')]].map(([v, l]) => `<div><b class="fm-mono" style="font-size:20px">${v}</b><div class="xs faint">${l}</div></div>`).join('')}</div></div></div>
    <div class="toolbar mg-fbar">${ui.search('fm:aq', L('Search tag, name, location…', 'ابحث بالرمز أو الاسم أو الموقع…'), { reset: 'fm-as:page' })}${siteSel()}
      ${ui.chips('fm:acond', [{ id: 'all', label: L('All', 'الكل'), count: base.length }, { id: 'attn', label: L('Needs attention', 'بحاجة لانتباه'), icon: 'alertCircle', count: base.filter((a) => a.ms !== 'fmOk').length }, { id: 'due30', label: L('Due ≤ 30 d', 'مستحقة ≤ 30 يوماً'), count: base.filter((a) => B.daysFromToday(a.next) <= 30).length }].concat(COND_ORDER.filter((c) => base.some((a) => a.cond === c)).map((c) => ({ id: c, label: ui.statusLabel(c) }))), fco, 'fm-as:page')}</div>
    ${assetTable(rows, 'fm-as', { maxH: 'calc(100vh - 260px)', sort: 'next' })}`;
  }
  function assetDetail(t) {
    const a = asset(t);
    if (!a) return ui.empty({ icon: 'cpu', title: L('Asset not found', 'الأصل غير موجود'), action: ui.btn(L('Asset inventory', 'سجل الأصول'), { kind: 'primary', go: `${R}-assets` }) });
    B.title(a.tag); B.navActive('assets');
    fcrumbs({ label: L('Building assets', 'أصول المباني'), go: `${R}-assets` }, { label: sshort(a.b), go: `${R}-site-${a.b}` }, { label: a.tag });
    const ws = WOS.filter((w) => w.asset === a.tag);
    const plans = PM.filter((p) => p.cat === a.cat && p.sites.includes(a.b.slice(-3)));
    const ci = COND_ORDER.indexOf(a.cond);
    const r = B.rng(a.tag.length * 131 + a.tag.charCodeAt(8));
    const readings = Array.from({ length: 13 }, (_, i) => Math.round(60 + r() * 25 + (a.cond === 'poor' ? i * 1.6 : a.cond === 'fair' ? i * .8 : 0)));
    const hist = ws.map((w) => ({ d: w.closed || w.created, title: tx(w.title), meta: `${w.id} · ${ui.statusLabel(w.status)} · ${B.date(w.closed || w.created)}`, state: w.status === 'completed' ? 'done' : 'current', icon: w.status === 'completed' ? 'check' : 'wrench' }))
      .concat([{ d: a.last, title: L('Routine inspection', 'فحص دوري'), meta: `${L('Condition', 'الحالة')}: ${ui.statusLabel(a.cond)} · ${B.date(a.last)}`, state: 'done', icon: 'clipboard' }, { d: `${a.year}-06-01`, title: L('Installed & commissioned', 'التركيب والتشغيل'), meta: `${a.year}`, state: 'done', icon: 'flag' }])
      .sort((x, y) => (x.d < y.d ? 1 : -1));
    return `${backLink(`${R}-assets`, L('Asset inventory', 'سجل الأصول'))}
    <section class="card" style="margin-bottom:16px"><div class="fm-asset-h"><span class="fm-ai">${icon(catIcon(a.cat))}</span>
      <div style="min-width:0"><div class="row-sm wrap">${tag(a.tag)}${ui.status(a.ms)}${ui.badge(L(`Criticality ${a.crit}`, `الأهمية ${a.crit}`), a.crit === 'A' ? 'navy' : 'outline')}</div><h1 style="font-size:24px;margin-top:8px">${tx(a.name)}</h1><div class="small muted">${bname(a.b)} · ${tx(a.loc)}</div></div>
      <div class="row-sm wrap">${ui.btn(L('Log inspection', 'تسجيل فحص'), { icon: 'clipboard', act: 'fmInspect', arg: a.tag })}${ui.btn(L('Create work order', 'إنشاء أمر عمل'), { icon: 'plus', kind: 'primary', act: 'fmNewWO', arg: a.tag })}</div></div></section>
    <div class="grid g4" style="margin-bottom:16px">
      <div class="card"><div class="fm-k">${L('Condition', 'الحالة')}</div><div class="row between" style="margin-top:10px">${cond(a.cond)}<span class="fm-gauge c-${a.cond}" style="color:${{ excellent: '#0F9F6E', good: '#36D6A0', fair: '#F2B35A', poor: '#E5774C', critical: '#C2362F' }[a.cond]}">${[0, 1, 2, 3, 4].map((i) => `<i class="${i <= 4 - ci ? 'on' : ''}" style="height:${8 + i * 5}px"></i>`).join('')}</span></div></div>
      <div class="card"><div class="fm-k">${L('Last inspection', 'آخر فحص')}</div><b style="display:block;font-family:var(--font-display);font-size:20px;margin-top:8px">${B.date(a.last)}</b><span class="xs faint">${B.ago(a.last)}</span></div>
      <div class="card"><div class="fm-k">${L('Next scheduled', 'الموعد القادم')}</div><b style="display:block;font-family:var(--font-display);font-size:20px;margin-top:8px;${a.next < TODAY ? 'color:var(--bad)' : ''}">${B.date(a.next)}</b><span class="xs ${a.next < TODAY ? '' : 'faint'}" style="${a.next < TODAY ? 'color:var(--bad)' : ''}">${B.inDays(a.next)}</span></div>
      <div class="card"><div class="fm-k">${L('Open work orders', 'أوامر عمل مفتوحة')}</div><b style="display:block;font-family:var(--font-display);font-size:20px;margin-top:8px">${ws.filter(isOpen).length}</b><span class="xs faint">${L(`${ws.length} in 30 days`, `${ws.length} خلال 30 يوماً`)}</span></div>
    </div>
    <div class="grid g-main">
      <div class="stack">
        ${ui.card({ title: L('Specifications', 'المواصفات'), body: ui.kvGrid([[L('Asset tag', 'رمز الأصل'), tag(a.tag)], [L('Category', 'الفئة'), tx(CATS[a.cat].n)], [L('Rating', 'المواصفة'), esc(a.spec)], [L('Installed', 'التركيب'), a.year], [L('Assigned team', 'الفريق المسؤول'), teamCell(a)], [L('Facility', 'المرفق'), `<button class="mint-ink" style="font-weight:600;text-align:start" data-go="${R}-site-${a.b}">${sshort(a.b)}</button>`], [L('Location', 'الموقع'), tx(a.loc)], [L('Warranty', 'الضمان'), a.year >= 2024 ? L('Active until 2027', 'سارٍ حتى 2027') : L('Expired', 'منتهي')], [L('Maintained by', 'الصيانة بواسطة'), plans[0] && plans[0].by !== 'in' ? tx(D.provider(plans[0].by).name) : L('Sanad in-house', 'فريق سند الداخلي')]]) })}
        ${ui.card({ title: L('Work orders', 'أوامر العمل'), link: { label: L('New', 'جديد'), act: 'fmNewWO', arg: a.tag }, body: ws.length ? ui.list(ws.map((w) => ui.li({ icon: 'clipboard', tone: w.status === 'completed' ? 'mint' : w.priority === 'critical' ? 'bad' : '', title: tx(w.title), sub: `${ui.idMono(w.id)} · ${who(w)}`, end: ui.status(w.status), go: `${R}-wo-${w.id}` }))) : ui.empty({ icon: 'checkCircle', title: L('No work orders in the last 30 days', 'لا توجد أوامر عمل في آخر 30 يوماً') }) })}
        ${ui.card({ title: L('Maintenance history', 'سجل الصيانة'), body: ui.timeline(hist) })}
      </div>
      <div class="stack">
        ${ui.card({ title: L('Runtime index', 'مؤشر التشغيل'), sub: L('Load / duty cycle · 13–25 Nov (sample)', 'الحمل / دورة التشغيل · 13–25 ت٢ (نموذج)'), cls: 'fm-c', body: B.charts.line({ labels: readings.map((_, i) => String(13 + i)), series: [{ name: '%', color: a.cond === 'poor' || a.cond === 'fair' ? '#E5774C' : '#36D6A0', values: readings, area: true }], height: 150, format: (v) => Math.round(v) + '%' }) })}
        ${ui.card({ title: L('PM plans', 'خطط الصيانة الوقائية'), body: plans.length ? ui.list(plans.map((p) => ui.li({ icon: 'calendarCheck', tone: 'mint', title: tx(p.n), sub: `${p.id} · ${tx(FREQ[p.freq])} · ${L('next', 'القادم')} ${B.dateShort(p.next)}`, end: `<b class="small">${p.comp}%</b>`, go: `${R}-pm` }))) : `<p class="small muted">${L('Inspected under the general building checklist.', 'يُفحص ضمن قائمة الفحص العامة للمبنى.')}</p>` })}
        ${ui.card({ title: L('Documents', 'المستندات'), body: ui.list([ui.doc({ name: L('O&M manual', 'دليل التشغيل والصيانة') + ` — ${a.tag}.pdf`, date: `${a.year}-06-01`, size: '4.2 MB' }), ui.doc({ name: L('Last inspection report', 'تقرير آخر فحص') + '.pdf', date: a.last, size: '380 KB', icon: 'clipboard' })]), foot: ui.btn(L('QR label', 'ملصق QR'), { icon: 'qr', size: 'sm', act: 'fmQR', arg: a.tag }) })}
      </div>
    </div>`;
  }

  /* ---------------- Work orders ---------------- */
  function workorders() {
    fcrumbs({ label: L('Work orders', 'أوامر العمل') });
    const view = B.get('fm:woView', 'list');
    const sf = B.get('fm:woS', 'open'), pf = B.get('fm:woP', 'all'), tf = B.get('fm:woT', 'all'), q = B.get('fm:woQ', '');
    const scoped = WOS.filter((w) => inFs(asset(w.asset).b));
    const base = scoped.filter((w) => (pf === 'all' || w.priority === pf) && (tf === 'all' || w.type === tf) && B.match(q, w.id, w.title, w.asset));
    const rows = base.filter((w) => (sf === 'all' ? true : sf === 'open' ? isOpen(w) : sf === 'late' ? isLate(w) : w.status === sf));
    const open = scoped.filter(isOpen);
    const board = `<div class="fm-board">${WO_COLS.map((st) => { const l = base.filter((w) => w.status === st); return `<div class="fm-col"><div class="fm-col-h">${ui.statusLabel(st)}<span>${l.length}</span></div>${l.map((w) => `<button class="fm-wo-card p-${w.priority}" data-go="${R}-wo-${w.id}"><div class="r">${ui.idMono(w.id)}${prio(w.priority)}</div><b>${tx(w.title)}</b><div class="r"><span>${tag(w.asset)}</span><span>${due(w)}</span></div><div class="r"><span>${who(w)}</span><span>${sshort(asset(w.asset).b)}</span></div></button>`).join('') || `<div class="xs faint" style="padding:6px">${L('Empty', 'فارغ')}</div>`}</div>`; }).join('')}</div>`;
    const list = B.xtable({ id: 'fm-wo', rows, pageSize: 20, maxH: 'calc(100vh - 280px)', rowGo: (w) => `${R}-wo-${w.id}`, defaultSort: 'due',
      bulk: [{ label: L('Assign technician', 'إسناد فني'), icon: 'userPlus', act: 'fmBulkAssign' }, { label: L('Print job sheets', 'طباعة أوراق العمل'), icon: 'doc', act: 'fmBulkPrint' }, { label: L('Export', 'تصدير'), icon: 'download', act: 'fmExport' }],
      cols: [
        { key: 'id', label: L('Work order', 'أمر العمل'), sort: true, m: 'title', render: (w) => `<div class="fm-cell"><span class="li-icon ${w.priority === 'critical' ? 'bad' : ''}">${icon(catIcon(asset(w.asset).cat))}</span><div style="min-width:0"><b>${tx(w.title)}</b><small>${ui.idMono(w.id)} · ${ui.statusLabel(w.type)}</small></div></div>`, mRender: (w) => tx(w.title) },
        { key: 'asset', label: L('Asset', 'الأصل'), sort: true, m: 'meta', render: (w) => `${tag(w.asset)}<span class="xt-sub">${sshort(asset(w.asset).b)}</span>` },
        { key: 'priority', label: L('Priority', 'الأولوية'), sort: (w) => ['critical', 'high', 'medium', 'low'].indexOf(w.priority), m: 'meta', render: (w) => prio(w.priority) },
        { key: 'tech', label: L('Assigned', 'المُسند إليه'), sort: (w) => who(w), m: 'sub', render: (w) => (w.tech ? `<span class="row-sm nowrap">${ui.avatar(TECHS[w.tech].n, 'sm')}${tname(w.tech)}</span>` : w.contractor ? `<span class="small">${tx(D.provider(w.contractor).name)}</span>` : `<span class="faint small">${L('Unassigned', 'غير مُسند')}</span>`) },
        { key: 'status', label: L('Status', 'الحالة'), sort: true, m: 'end', render: (w) => ui.status(w.status) },
        { key: 'due', label: L('Due', 'الاستحقاق'), sort: true, align: 'end', m: 'meta', render: due },
      ] });
    return `${fhead({ eyebrow: L('Operations', 'العمليات'), title: L('Work orders', 'أوامر العمل'), sub: L('Corrective, preventive, inspection and emergency work across all facilities.', 'الأعمال التصحيحية والوقائية والفحوصات والطوارئ في جميع المرافق.'), actions: ui.seg('fm:woView', [{ id: 'list', icon: 'list', label: L('List', 'قائمة') }, { id: 'board', icon: 'grid', label: L('Board', 'لوحة') }], view) + ui.btn(L('New work order', 'أمر عمل جديد'), { icon: 'plus', kind: 'primary', act: 'fmNewWO' }) })}
    ${opsStrip([[open.length, L('Open', 'مفتوحة'), `${R}-workorders`], [open.filter(isLate).length, L('Late — past due', 'متأخرة — تجاوزت الاستحقاق'), '', 'bad'], [open.filter((w) => w.status === 'new').length, L('New · unassigned', 'جديدة · غير مُسندة'), '', open.some((w) => w.status === 'new') ? 'warn' : ''], [open.filter((w) => w.priority === 'critical' || w.priority === 'high').length, L('Critical & high', 'حرجة وعالية'), '', 'warn'], [74, L('Closed this month', 'مُغلقة هذا الشهر')], ['6.4', L('MTTR · hours (crit./high)', 'متوسط الإصلاح · ساعات'), '', '', 'h']])}
    <div class="toolbar mg-fbar">${ui.search('fm:woQ', L('Search ID, title or asset tag…', 'ابحث بالرقم أو العنوان أو رمز الأصل…'), { reset: 'fm-wo:page' })}
      ${ui.select('fm:woP', [{ v: 'all', l: L('All priorities', 'كل الأولويات') }, { v: 'critical', l: ui.statusLabel('critical') }, { v: 'high', l: ui.statusLabel('high') }, { v: 'medium', l: ui.statusLabel('medium') }, { v: 'low', l: ui.statusLabel('low') }], { reset: 'fm-wo:page', label: L('Priority', 'الأولوية') })}
      ${ui.select('fm:woT', [{ v: 'all', l: L('All types', 'كل الأنواع') }].concat(['fmCorrective', 'fmPreventive', 'fmInspection', 'fmEmergency'].map((k) => ({ v: k, l: ui.statusLabel(k) }))), { reset: 'fm-wo:page', label: L('Type', 'النوع') })}
      ${siteSel()}</div>
    ${view === 'board' ? board : `<div style="margin-bottom:12px">${ui.chips('fm:woS', [{ id: 'open', label: L('Open', 'مفتوحة'), count: base.filter(isOpen).length }, { id: 'late', label: L('Late', 'متأخرة'), count: base.filter(isLate).length }, { id: 'new', label: ui.statusLabel('new') }, { id: 'inProgress', label: ui.statusLabel('inProgress') }, { id: 'onHold', label: ui.statusLabel('onHold') }, { id: 'completed', label: ui.statusLabel('completed') }, { id: 'all', label: L('All', 'الكل'), count: base.length }], sf, 'fm-wo:page')}</div>${list}`}`;
  }
  function woDetail(id) {
    const w = wo(id);
    if (!w) return ui.empty({ icon: 'clipboard', title: L('Work order not found', 'أمر العمل غير موجود'), action: ui.btn(L('Work orders', 'أوامر العمل'), { kind: 'primary', go: `${R}-workorders` }) });
    B.title(w.id); B.navActive('workorders');
    fcrumbs({ label: L('Work orders', 'أوامر العمل'), go: `${R}-workorders` }, { label: w.id });
    const a = asset(w.asset);
    const done = w.checklist.filter((c) => c.done).length;
    const partsTotal = B.sum(w.parts, (p) => p[1] * p[2]);
    const hist = [{ title: L('Work order created', 'تم إنشاء أمر العمل'), meta: `${w.ref ? w.ref + ' · ' : ''}${B.date(w.created)} · ${w.ref ? L('from tenant request', 'من طلب مستأجر') : D.pname('p_omar')}`, state: 'done', icon: 'plus' }];
    if (w.status !== 'new') hist.push({ title: w.tech || !w.contractor ? L(`Assigned to ${who(w)}`, `أُسند إلى ${who(w)}`) : L(`Dispatched to ${who(w)}`, `أُرسل إلى ${who(w)}`), meta: B.date(w.created), state: 'done', icon: 'user' });
    if (['inProgress', 'onHold', 'completed'].includes(w.status)) hist.push({ title: L('Work started on site', 'بدء العمل في الموقع'), meta: L('Checked in via QR on asset', 'تسجيل الدخول عبر رمز QR على الأصل'), state: 'done', icon: 'play' });
    if (w.status === 'onHold') hist.push({ title: L('On hold — waiting for parts', 'معلّق — بانتظار القطع'), meta: L('Supplier ETA 27 Nov', 'موعد المورد 27 ت٢'), state: 'current', icon: 'clock' });
    if (w.status === 'inProgress') hist.push({ title: L('In progress', 'قيد التنفيذ'), meta: L(`${done} of ${w.checklist.length} checklist steps done`, `${done} من ${w.checklist.length} خطوات منجزة`), state: 'current', icon: 'wrench' });
    if (w.status === 'completed') hist.push({ title: L('Completed & signed off', 'مكتمل وموقّع'), meta: `${B.date(w.closed)} · ${L(`${w.labour} labour hours`, `${w.labour} ساعات عمل`)}`, state: 'done', icon: 'check' });
    (w.log || []).forEach((l) => hist.push(l));
    const acts = { new: [[L('Assign', 'إسناد'), 'userPlus', 'primary', 'fmAssign']], assigned: [[L('Start work', 'بدء العمل'), 'play', 'primary', 'fmStart']], scheduled: [[L('Start work', 'بدء العمل'), 'play', 'primary', 'fmStart']], inProgress: [[L('Put on hold', 'تعليق'), 'clock', 'ghost', 'fmHold'], [L('Complete', 'إكمال'), 'check', 'primary', 'fmComplete']], onHold: [[L('Resume', 'استئناف'), 'play', 'primary', 'fmStart']], completed: [[L('Reopen', 'إعادة فتح'), 'refresh', 'ghost', 'fmReopen']] }[w.status] || [];
    return `${backLink(`${R}-workorders`, L('Work orders', 'أوامر العمل'))}
    ${ui.pageHead({ eyebrow: `${w.id} · ${ui.statusLabel(w.type)}`, title: tx(w.title), sub: `${bname(a.b)} · ${tx(a.loc)}`, actions: acts.map(([l, ic, k, act]) => ui.btn(l, { icon: ic, kind: k, act, arg: w.id })).join('') + ui.btn('', { icon: 'moreV', act: 'fmWoMenu', arg: w.id, title: L('More actions', 'إجراءات أخرى') }) })}
    <div class="row-sm wrap" style="margin:-8px 0 18px">${ui.status(w.status)}${prio(w.priority)}${ui.status(w.type)}${tag(a.tag)}${isLate(w) ? ui.badge(L('Past due', 'تجاوز الاستحقاق'), 'bad', 'alertCircle') : ''}</div>
    <div class="grid g-main">
      <div class="stack">
        ${w.desc ? ui.card({ title: L('Description', 'الوصف'), body: `<p class="muted" style="font-size:14px;line-height:1.6">${tx(w.desc)}</p>` }) : ''}
        ${ui.card({ title: L('Checklist', 'قائمة التحقق'), sub: L(`${done} of ${w.checklist.length} done`, `${done} من ${w.checklist.length} منجزة`), headExtra: `<div style="width:120px">${ui.progress((done / w.checklist.length) * 100)}</div>`, body: `<div class="fm-check">${w.checklist.map((c, i) => `<button class="${c.done ? 'on' : ''}" data-act="fmCheck" data-arg="${w.id}|${i}"><span class="bx">${icon('check')}</span><span>${tx(c.t)}</span></button>`).join('')}</div>` })}
        ${ui.card({ title: L('Parts & materials', 'القطع والمواد'), sub: w.parts.length ? L(`Total ${B.money(partsTotal)}`, `الإجمالي ${B.money(partsTotal)}`) : '', link: { label: L('Add part', 'إضافة قطعة'), act: 'fmPart', arg: w.id }, body: w.parts.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>${L('Part', 'القطعة')}</th><th class="t-end">${L('Qty', 'الكمية')}</th><th class="t-end">${L('Unit cost', 'سعر الوحدة')}</th><th class="t-end">${L('Total', 'الإجمالي')}</th></tr></thead><tbody>${w.parts.map((p) => `<tr><td>${tx(p[0])}</td><td class="t-end">${p[1]}</td><td class="t-end">${B.money(p[2])}</td><td class="t-end"><b>${B.money(p[1] * p[2])}</b></td></tr>`).join('')}</tbody></table></div>` : `<p class="small muted">${L('No parts used yet.', 'لم تُستخدم قطع بعد.')}</p>` })}
        ${ui.card({ title: L('Photos', 'الصور'), sub: L('Before / during / after', 'قبل / أثناء / بعد'), body: `<div class="fm-photos">${[1, 2, 3].slice(0, w.status === 'new' ? 0 : w.status === 'completed' ? 3 : 2).map((i) => `<button class="media" data-act="fmPhoto" data-arg="${w.id}">${photoArt(w.id.charCodeAt(9) + i)}</button>`).join('')}<button class="add" data-act="fmPhoto" data-arg="${w.id}">${icon('camera')}<span>${L('Add photo', 'إضافة صورة')}</span></button></div>` })}
      </div>
      <div class="stack">
        ${ui.card({ title: L('Details', 'التفاصيل'), body: ui.kv([[L('Asset', 'الأصل'), `<button data-go="${R}-asset-${a.tag}">${tag(a.tag)}</button>`], [L('Facility', 'المرفق'), `<button class="mint-ink" style="font-weight:600" data-go="${R}-site-${a.b}">${sshort(a.b)}</button>`], [L('Technician', 'الفني'), w.tech ? tname(w.tech) : '—'], [L('Contractor', 'المقاول'), w.contractor ? tx(D.provider(w.contractor).name) : L('In-house', 'داخلي')], [L('Created', 'الإنشاء'), B.date(w.created)], [L('Due', 'الاستحقاق'), due(w)], [L('Labour', 'ساعات العمل'), `${w.labour} h`], w.ref ? [L('Tenant request', 'طلب المستأجر'), ui.idMono(w.ref)] : null]) })}
        ${ui.card({ title: L('SLA', 'اتفاقية مستوى الخدمة'), body: (() => { const total = Math.max(1, B.daysBetween(w.created, w.due)); const used = Math.min(total, Math.max(0, B.daysBetween(w.created, w.status === 'completed' ? w.closed : TODAY))); const p = (used / total) * 100; return ui.meter(L('Time used', 'الوقت المستخدم'), w.status === 'completed' ? L('Met', 'تم الالتزام') : isLate(w) ? L('Breached', 'تم التجاوز') : total - used === 0 ? L('Due today', 'مستحق اليوم') : L(`${total - used} d left`, `باقٍ ${total - used} ي`), w.status === 'completed' ? 100 : p, w.status === 'completed' ? '' : isLate(w) ? 'bad' : p > 70 ? 'warn' : ''); })() + `<div class="xs faint" style="margin-top:8px">${{ critical: L('Critical: respond 1 h · fix 24 h', 'حرج: استجابة ساعة · إصلاح 24 ساعة'), high: L('High: respond 4 h · fix 3 days', 'عالية: استجابة 4 ساعات · إصلاح 3 أيام'), medium: L('Medium: respond 24 h · fix 7 days', 'متوسطة: استجابة 24 ساعة · إصلاح 7 أيام'), low: L('Low: fix within 10 days', 'منخفضة: إصلاح خلال 10 أيام') }[w.priority]}</div>` })}
        ${ui.card({ title: L('History', 'السجل'), body: ui.timeline(hist) })}
      </div>
    </div>`;
  }

  /* ---------------- Preventive maintenance ---------------- */
  function pm() {
    fcrumbs({ label: L('Preventive maintenance', 'الصيانة الوقائية') });
    const mo = B.get('fm:pmM', 10);
    const year = 2026 + Math.floor(mo / 12), month = ((mo % 12) + 12) % 12;
    const events = [];
    const mkey = `${year}-${String(month + 1).padStart(2, '0')}`;
    PM.forEach((p) => {
      const dates = [];
      if (String(p.last).startsWith(mkey)) dates.push([p.last, 'mint']);
      if (String(p.next).startsWith(mkey)) dates.push([p.next, p.next < TODAY ? 'bad' : p.by === 'in' ? '' : 'info']);
      if (!dates.length && pmOccurs(p, year, month) && `${mkey}-99` > p.next) { const d = Math.min(p.day, new Date(year, month + 1, 0).getDate()); const key = `${mkey}-${String(d).padStart(2, '0')}`; dates.push([key, key < TODAY ? 'mint' : p.by === 'in' ? '' : 'info']); }
      dates.forEach(([date, tone]) => events.push({ date, label: tx(p.n), tone, act: 'fmPM', arg: p.id }));
    });
    const sf = fscope();
    const rows = PM.filter((p) => sf === 'all' || p.sites.includes(sf.slice(-3)));
    return `${fhead({ eyebrow: L('Operations', 'العمليات'), title: L('Preventive maintenance', 'الصيانة الوقائية'), sub: L('Planned maintenance plans, schedule and statutory compliance.', 'خطط الصيانة المخططة والجدول والامتثال للمتطلبات القانونية.'), actions: ui.btn(L('Compliance report', 'تقرير الامتثال'), { icon: 'download', act: 'previewDoc', arg: L('PM compliance — November 2026.pdf', 'امتثال الصيانة الوقائية — ت٢ 2026.pdf') }) + ui.btn(L('New PM plan', 'خطة جديدة'), { icon: 'plus', kind: 'primary', act: 'fmNewPM' }) })}
    ${opsStrip([[PM.length, L('Active PM plans', 'خطط وقائية نشطة')], [pmCompletion(), L('Completion · Nov', 'الإنجاز · ت٢'), '', '', '%'], [PM.filter((p) => p.next >= TODAY && p.next <= '2026-12-02').length, L('Due in 7 days', 'مستحقة خلال 7 أيام'), '', 'warn'], [PM.filter((p) => p.next < TODAY).length, L('Overdue', 'متأخرة'), '', 'bad'], [PM.filter((p) => p.by !== 'in').length, L('Contractor-delivered', 'ينفّذها مقاولون'), `${R}-contractors`]])}
    <div class="grid g-main">
      <section class="card fm-pmcal"><div class="card-head" style="flex-wrap:wrap"><div class="grow"><h3>${L('PM calendar', 'تقويم الصيانة الوقائية')}</h3><div class="sub">${L('All facilities', 'جميع المرافق')}</div></div>
        <div class="row-sm">${ui.btn('', { icon: 'chevL', iconCls: 'flip', size: 'sm', act: 'set', arg: `fm:pmM=${mo - 1}`, title: L('Previous month', 'الشهر السابق') })}<b style="min-width:130px;text-align:center">${B.monLong(month)} ${year}</b>${ui.btn('', { icon: 'chevR', iconCls: 'flip', size: 'sm', act: 'set', arg: `fm:pmM=${mo + 1}`, title: L('Next month', 'الشهر التالي') })}</div></div>
        ${ui.calendar({ year, month, events })}
        <div class="fm-legend"><span><i style="background:var(--navy)"></i>${L('In-house', 'داخلي')}</span><span><i style="background:#BBD0F5"></i>${L('Contractor', 'مقاول')}</span><span><i style="background:var(--mint)"></i>${L('Completed', 'مكتمل')}</span><span><i style="background:#F1B5B0"></i>${L('Overdue', 'متأخر')}</span></div></section>
      <div class="stack">
        ${ui.card({ title: L('Compliance by facility', 'الامتثال حسب المرفق'), body: B.charts.hbars({ data: SITE_IDS.map((bid) => { const l = PM.filter((p) => p.sites.includes(bid.slice(-3))); const v = { 'BN-RAM-00311': 91, 'BN-RAM-00415': 84, 'BN-RAM-00618': 97 }[bid]; return { label: sshort(bid), sub: L(`${l.length} plans`, `${l.length} خطة`), value: v, color: v >= 92 ? '#36D6A0' : '#F2B35A' }; }), max: 100, format: (v) => v + '%' }) })}
        ${ui.card({ title: L('Compliance by system', 'الامتثال حسب النظام'), body: B.charts.bars({ data: [['elevator', 'vt'], ['hvac', 'hvac'], ['fire', 'fire'], ['generator', 'power'], ['water', 'plumb']].map(([c]) => { const l = PM.filter((p) => p.cat === c || (c === 'water' && (p.cat === 'pump' || p.cat === 'medgas'))); const v = Math.round(B.sum(l, (p) => p.comp) / l.length); return { label: tx(CATS[c].n).split(' ')[0], value: v, color: v >= 92 ? '#142B3B' : '#F2B35A' }; }), height: 150, max: 100, showValues: true, format: (v) => Math.round(v) + '%' }) })}
      </div>
    </div>
    <section style="margin-top:20px">${sec(L('Maintenance schedule', 'جدول الصيانة'), siteSel().replace('class="select"', 'class="select" style="width:auto;min-width:160px"'))}
      ${ui.table({ id: 'fm-pm', rows, rowAct: (p) => ({ act: 'fmPM', arg: p.id }), cols: [
        { key: 'n', label: L('Plan', 'الخطة'), render: (p) => `<div class="fm-cell"><span class="li-icon">${icon(catIcon(p.cat))}</span><div style="min-width:0"><b>${tx(p.n)}</b><small>${ui.idMono(p.id)} · ${p.sites.map((s) => sshort('BN-RAM-00' + s)).join(', ')}</small></div></div>`, mRender: (p) => tx(p.n), m: 'title' },
        { key: 'freq', label: L('Frequency', 'التكرار'), sort: (p) => ['weekly', 'monthly', 'quarterly', 'semiannual', 'annual'].indexOf(p.freq), render: (p) => `<span class="badge">${tx(FREQ[p.freq])}</span>`, m: 'meta' },
        { key: 'by', label: L('Performed by', 'المنفّذ'), render: pmBy, m: 'sub' },
        { key: 'last', label: L('Last done', 'آخر تنفيذ'), render: (p) => `<span class="small nowrap">${B.dateShort(p.last)}</span>`, m: 'hide' },
        { key: 'next', label: L('Next due', 'الاستحقاق القادم'), sort: true, render: (p) => `<span class="small nowrap ${p.next < TODAY ? 'fm-due over' : ''}">${B.dateShort(p.next)}</span>`, m: 'meta' },
        { key: 'comp', label: L('Compliance', 'الامتثال'), sort: true, align: 'end', render: (p) => `<div style="display:flex;align-items:center;gap:8px;justify-content:flex-end"><div style="width:70px">${ui.progress(p.comp, p.comp >= 92 ? '' : p.comp >= 80 ? 'warn' : 'bad', 'thin')}</div><b class="small fm-mono">${p.comp}%</b></div>`, m: 'end' },
      ] })}</section>`;
  }

  /* ---------------- Contractors ---------------- */
  function contractors() {
    fcrumbs({ label: L('Contractors', 'المقاولون') });
    return `${fhead({ eyebrow: L('Portfolio', 'المحفظة'), title: L('Contractors', 'المقاولون'), sub: L('Specialist contractors under Sanad service agreements, with SLA performance.', 'المقاولون المتخصصون بموجب اتفاقيات خدمة سند، مع أداء مستوى الخدمة.'), actions: ui.btn(L('Find contractors', 'ابحث عن مقاولين'), { icon: 'search', go: `${R}-services` }) + ui.btn(L('Add contractor', 'إضافة مقاول'), { icon: 'plus', kind: 'primary', act: 'fmAddContractor' }) })}
    ${opsStrip([[CONTRACTORS.length, L('Active contracts', 'عقود نشطة')], [Math.round(B.sum(CONTRACTORS, (c) => c.sla) / CONTRACTORS.length), L('Average SLA met', 'متوسط الالتزام بـ SLA'), '', '', '%'], [B.compact(B.sum(CONTRACTORS, (c) => c.value)), L('Annual contract value · ₪', 'القيمة السنوية للعقود · ₪')], [CONTRACTORS.filter((c) => B.daysFromToday(c.end) <= 60).length, L('Renewals ≤ 60 days', 'تجديدات ≤ 60 يوماً'), '', 'warn'], [WOS.filter((w) => isOpen(w) && w.contractor).length, L('Open contractor WOs', 'أوامر مفتوحة للمقاولين'), `${R}-workorders`]])}
    <div class="grid g-main">
      ${ui.table({ id: 'fm-ct', rows: CONTRACTORS, rowAct: (c) => ({ act: 'fmContractor', arg: c.p }), cols: [
        { key: 'p', label: L('Contractor', 'المقاول'), render: (c) => { const p = D.provider(c.p); return `<div class="fm-cell"><span class="li-icon mint">${icon(D.cat(p.cats[0]).icon)}</span><div style="min-width:0"><b>${tx(p.name)}</b><small>${tx(c.scope)}</small></div></div>`; }, mRender: (c) => tx(D.provider(c.p).name), m: 'title' },
        { key: 'sites', label: L('Sites', 'المواقع'), render: (c) => `<span class="row-sm">${c.sites.map((s) => tag(s)).join('')}</span>`, m: 'meta' },
        { key: 'resp', label: L('SLA target', 'هدف SLA'), render: (c) => `<span class="small">${tx(c.resp)}</span>`, m: 'sub' },
        { key: 'sla', label: L('SLA met', 'الالتزام'), sort: true, align: 'end', render: (c) => `<b class="fm-mono" style="color:${c.sla >= 95 ? 'var(--ok)' : c.sla >= 90 ? 'var(--ink)' : 'var(--warn)'}">${c.sla}%</b>`, m: 'end' },
        { key: 'open', label: L('Open WOs', 'أوامر مفتوحة'), align: 'end', render: (c) => WOS.filter((w) => isOpen(w) && w.contractor === c.p).length, m: 'hide' },
        { key: 'end', label: L('Contract end', 'نهاية العقد'), sort: true, render: (c) => `<span class="small nowrap">${B.dateShort(c.end)} ${B.daysFromToday(c.end) <= 60 ? ui.status('expiring') : ''}</span>`, m: 'meta' },
      ] })}
      <div class="stack">
        ${ui.card({ title: L('SLA performance', 'أداء مستوى الخدمة'), sub: L('Share of jobs within target · last 90 days', 'نسبة الأعمال ضمن الهدف · آخر 90 يوماً'), body: B.charts.hbars({ data: CONTRACTORS.slice().sort((a, b) => b.sla - a.sla).map((c) => ({ label: tx(D.provider(c.p).name), value: c.sla, color: c.sla >= 95 ? '#36D6A0' : c.sla >= 90 ? '#142B3B' : '#F2B35A' })), max: 100, format: (v) => v + '%' }) })}
        ${ui.callout(L('<b>Volt Electric Co.</b> contract ends 31 Dec 2026. Start renewal or tender before 1 Dec to keep generator support continuous.', 'ينتهي عقد <b>فولت للكهرباء</b> في 31 ك١ 2026. ابدأ التجديد أو المناقصة قبل 1 ك١ لضمان استمرار دعم المولدات.'), 'warn', 'calendar')}
      </div>
    </div>`;
  }

  /* ---------------- Connected building (simulated) ---------------- */
  function connected() {
    fcrumbs({ label: L('Connected building (preview)', 'المبنى المتصل (معاينة)') });
    const bid = B.get('fm:cnSite', SITE_IDS[0]);
    const b = D.building(bid);
    const r = B.rng(bid.charCodeAt(9) * 977);
    const hours = Array.from({ length: 13 }, (_, i) => String(i * 2).padStart(2, '0'));
    const base = site(bid).energy / 30 / 24;
    const energy = hours.map((_, j) => { const i = j * 2; return Math.round(base * 2 * (i < 6 ? 0.45 : i < 8 ? 0.8 : i < 18 ? 1.35 + r() * 0.15 : i < 21 ? 1.0 : 0.6)); });
    const elevs = assetsOf(bid).filter((a) => a.cat === 'elevator');
    const floors = b.floors;
    const heatColor = (v) => (v > 0.8 ? '#E5774C' : v > 0.6 ? '#F2B35A' : v > 0.35 ? '#9FE5CA' : '#36D6A0');
    const tiles = [
      { ic: 'wind', n: L('HVAC', 'التكييف والتهوية'), st: assetsOf(bid).some((a) => a.cat === 'hvac' && a.ms === 'fmRepair') ? 'warn' : '', v: `13.4<small> °C</small>`, l: L('Supply air temperature', 'حرارة هواء التغذية'), sub: [[L('Chiller load', 'حمل المبرّد'), '62%'], [L('Zones in comfort', 'مناطق مريحة'), bid === 'BN-RAM-00311' ? '46/48' : '31/31'], [L('Setpoint', 'القيمة المطلوبة'), '22.5 °C']], spark: [13.9, 13.7, 13.6, 13.5, 13.8, 13.4, 13.3, 13.4] },
      { ic: 'lock', n: L('Access control', 'التحكم بالدخول'), v: B.num(820 + Math.round(r() * 600)), l: L('Access events today', 'أحداث الدخول اليوم'), sub: [[L('Doors online', 'أبواب متصلة'), bid === 'BN-RAM-00618' ? '36/36' : '42/42'], [L('Forced door', 'باب مفتوح بالقوة'), '0'], [L('Held open', 'باب مفتوح طويلاً'), '1']], spark: [20, 140, 260, 180, 120, 210, 160, 90] },
      { ic: 'cctv', n: L('Security & CCTV', 'الأمن والكاميرات'), st: bid === 'BN-RAM-00311' ? 'warn' : '', v: bid === 'BN-RAM-00311' ? '63<small>/64</small>' : bid === 'BN-RAM-00415' ? '32<small>/32</small>' : '28<small>/28</small>', l: L('Cameras online', 'كاميرات متصلة'), sub: [[L('Recording', 'التسجيل'), '30 d'], [L('Guard rounds', 'جولات الحراسة'), '6/8'], [L('Incidents', 'حوادث'), '0']] },
      { ic: 'droplet', n: L('Water', 'المياه'), v: `${Math.round(70 + r() * 20)}<small>%</small>`, l: L('Roof tank level', 'مستوى خزان السطح'), sub: [[L('Flow now', 'التدفق الآن'), `${(2 + r() * 2).toFixed(1)} m³/h`], [L('Today', 'اليوم'), `${Math.round(site(bid).water / 30)} m³`], [L('Leak sensors', 'حساسات التسرب'), L('0 alarms', '0 إنذار')]], spark: [82, 80, 76, 74, 79, 85, 81, 78] },
    ];
    const devAlerts = [
      { sev: 'warn', t: L('CO₂ 1,180 ppm — floor 9 meeting room', 'ثاني أكسيد الكربون 1,180 جزء بالمليون — قاعة اجتماعات ط9'), s: L('Fresh-air damper increased automatically', 'تمت زيادة فتحة الهواء النقي تلقائياً'), w: '09:52' },
      { sev: 'warn', t: L('Door D-B2-03 held open for 4 min', 'الباب D-B2-03 بقي مفتوحاً 4 دقائق'), s: L('Parking level 2 · guard notified', 'موقف ط2 · تم إبلاغ الحارس'), w: '09:31' },
      { sev: 'bad', t: L('Chiller 2 high discharge pressure', 'ضغط تصريف مرتفع في المبرّد 2'), s: L('Auto-staged to chiller 1 · WO suggested', 'تحويل تلقائي للمبرّد 1 · اقتراح أمر عمل'), w: '08:47' },
      { sev: 'ok', t: L('Generator weekly self-test passed', 'نجح الاختبار الذاتي الأسبوعي للمولد'), s: L('Start 7.8 s · 400 V · 50.0 Hz', 'تشغيل 7.8 ث · 400 فولت · 50.0 هرتز'), w: '07:00' },
    ];
    return `${fhead({ eyebrow: L('Smart building · preview', 'المبنى الذكي · معاينة'), title: L('Connected building', 'المبنى المتصل'), sub: L('A preview of how BENA could bring building systems into one operational view. Not connected to any real equipment.', 'معاينة لكيفية جمع بينا لأنظمة المبنى في عرض تشغيلي واحد. غير متصل بأي معدات حقيقية.'), actions: ui.btn(L('Request integration pilot', 'طلب تجربة تكامل'), { icon: 'send', kind: 'primary', act: 'fmPilot' }) })}
    ${ui.simRibbon()}
    <div class="row between wrap" style="margin:16px 0">${ui.seg('fm:cnSite', SITE_IDS.map((x) => ({ id: x, label: sshort(x) })), bid)}<span class="xs faint row-sm"><span class="pulse"></span>${L('Sample readings refreshed 10:00', 'قراءات نموذجية حُدّثت 10:00')}</span></div>
    <div class="fm-dev-grid">
      <div class="device wide"><div class="dv-top"><span class="dv-name"><span class="li-icon navy">${icon('elevator')}</span>${L('Elevators', 'المصاعد')}</span><span class="row-sm"><span class="fm-sim-tag">${L('Sim', 'محاكاة')}</span><span class="pulse ${elevs.some((e) => e.ms === 'fmRepair') ? 'warn' : ''}"></span></span></div>
        <div class="fm-shafts" style="--n:${elevs.length}">${elevs.map((e, i) => { const off = e.ms === 'fmRepair'; const fl = off ? 0 : Math.floor(r() * floors); return `<div class="fm-shaft ${off ? 'off' : ''}"><div class="s"><span class="car" style="bottom:${4 + (fl / floors) * 70}px">${off ? '×' : fl === 0 ? 'G' : fl}</span></div><span class="fm-mono">${e.tag.split('-').slice(-2).join('-')}</span><span>${off ? L('Out of service', 'خارج الخدمة') : [L('Moving ↑', 'صاعد ↑'), L('Idle', 'متوقف'), L('Moving ↓', 'نازل ↓'), L('Doors open', 'أبواب مفتوحة')][Math.floor(r() * 4)]}</span></div>`; }).join('')}</div>
        <div class="dv-sub"><div><b>${elevs.filter((e) => e.ms !== 'fmRepair').length}/${elevs.length}</b>${L('In service', 'في الخدمة')}</div><div><b>${Math.round(18 + r() * 14)} s</b>${L('Avg. wait', 'متوسط الانتظار')}</div><div><b>${B.num(900 + Math.round(r() * 700))}</b>${L('Trips today', 'رحلات اليوم')}</div></div></div>
      ${tiles.map((t) => `<div class="device"><div class="dv-top"><span class="dv-name"><span class="li-icon">${icon(t.ic)}</span>${t.n}</span><span class="row-sm"><span class="fm-sim-tag">${L('Sim', 'محاكاة')}</span><span class="pulse ${t.st || ''}"></span></span></div><div><div class="dv-val">${t.v}</div><div class="xs faint" style="margin-top:4px">${t.l}</div></div>${t.spark ? B.charts.spark(t.spark, t.st === 'warn' ? '#E9A23B' : '#36D6A0') : ''}<div class="dv-sub">${t.sub.map(([k, v]) => `<div><b>${v}</b>${k}</div>`).join('')}</div></div>`).join('')}
      <div class="device wide fm-c"><div class="dv-top"><span class="dv-name"><span class="li-icon mint">${icon('activity')}</span>${L('Energy — today', 'الطاقة — اليوم')}</span><span class="fm-sim-tag">${L('Sim', 'محاكاة')}</span></div>
        ${B.charts.line({ labels: hours, series: [{ name: L('kWh / 2 h', 'ك.و.س / ساعتان'), color: '#36D6A0', values: energy, area: true }], height: 150, format: (v) => B.num(v) })}
        <div class="dv-sub" style="grid-template-columns:repeat(4,minmax(0,1fr))"><div><b>${B.num(B.sum(energy.slice(0, 5)))}</b>${L('kWh so far', 'ك.و.س حتى الآن')}</div><div><b>${Math.round(base * 1.4)} kW</b>${L('Demand now', 'الطلب الآن')}</div><div><b>${B.num(Math.max(...energy) / 2)} kW</b>${L('Peak forecast', 'الذروة المتوقعة')}</div><div><b>${L('Grid', 'الشبكة')}</b>${L('Generator on standby', 'المولد في وضع الاستعداد')}</div></div></div>
      <div class="device"><div class="dv-top"><span class="dv-name"><span class="li-icon">${icon('thermo')}</span>${L('Smart sensors', 'الحساسات الذكية')}</span><span class="fm-sim-tag">${L('Sim', 'محاكاة')}</span></div>
        <div class="fm-floors-heat">${Array.from({ length: Math.min(floors, 8) }, (_, i) => floors - i).map((f) => `<span class="fm-mono">L${f}</span><div class="row-h">${Array.from({ length: 8 }, () => `<i style="background:${heatColor(r() * (f === 9 ? 1.2 : 0.85))}"></i>`).join('')}</div>`).join('')}</div>
        <div class="fm-legend" style="margin-top:4px"><span><i style="background:#36D6A0"></i>${L('Good', 'جيد')}</span><span><i style="background:#F2B35A"></i>${L('Elevated', 'مرتفع')}</span><span><i style="background:#E5774C"></i>${L('High CO₂', 'CO₂ مرتفع')}</span></div></div>
    </div>
    <div class="grid g-main" style="margin-top:16px">
      ${ui.card({ title: L('Sample alerts', 'تنبيهات نموذجية'), sub: L('How equipment events would appear and turn into work orders', 'كيف ستظهر أحداث المعدات وتتحول إلى أوامر عمل'), body: ui.list(devAlerts.map((a) => ui.li({ icon: a.sev === 'ok' ? 'checkCircle' : 'alert', tone: a.sev === 'ok' ? 'mint' : a.sev, title: a.t, sub: a.s, end: `<span class="xs faint fm-mono">${a.w}</span>${a.sev === 'bad' ? `<button class="btn btn-soft btn-sm" data-act="fmNewWO" data-arg="SND-311-HV-CH02">${L('Create WO', 'أمر عمل')}</button>` : ''}` }))) })}
      ${ui.card({ title: L('Equipment status', 'حالة المعدات'), body: ui.list(assetsOf(bid).filter((a) => ['hvac', 'generator', 'pump', 'fire'].includes(a.cat)).slice(0, 6).map((a) => ui.li({ lead: `<span class="pulse ${a.ms === 'fmFault' ? 'bad' : a.ms === 'fmOk' ? '' : 'warn'}" style="margin-inline:6px"></span>`, title: tx(a.name), sub: tag(a.tag), end: ui.status(a.ms === 'fmFault' ? 'alarm' : a.ms === 'fmOk' ? 'online' : 'warning'), go: `${R}-asset-${a.tag}` }))) })}
    </div>
    <section style="margin-top:20px">${sec(L('Integration roadmap', 'خارطة طريق التكامل'))}
      <div class="fm-roadmap">${[[L('Phase 1', 'المرحلة 1'), L('Read-only BMS gateway', 'بوابة BMS للقراءة فقط'), L('BACnet/IP and Modbus TCP points for HVAC, power and water mirrored into BENA.', 'نقاط BACnet/IP وModbus TCP للتكييف والطاقة والمياه تنعكس في بينا.')], [L('Phase 2', 'المرحلة 2'), L('Alarms → work orders', 'الإنذارات ← أوامر العمل'), L('Equipment alarms open work orders automatically with asset tag, location and checklist.', 'إنذارات المعدات تفتح أوامر عمل تلقائياً مع رمز الأصل والموقع وقائمة التحقق.')], [L('Phase 3', 'المرحلة 3'), L('Sensors & energy analytics', 'الحساسات وتحليلات الطاقة'), L('Wireless IAQ sensors, sub-metering and occupancy-based optimisation.', 'حساسات جودة هواء لاسلكية وعدادات فرعية وتحسين حسب الإشغال.')]].map(([k, t, d]) => `<div><span class="fm-k">${k}</span><b>${t}</b><p>${d}</p></div>`).join('')}</div></section>`;
  }

  function services(id, r) {
    if (B.shared.services) return B.shared.services(id, r);
    return `${backLink(`${R}-contractors`, L('Contractors', 'المقاولون'))}${ui.pageHead({ eyebrow: L('Marketplace', 'السوق'), title: L('Find contractors', 'ابحث عن مقاولين'), sub: L('Verified providers on BENA covering your sites.', 'مزوّدون موثّقون على بينا يغطون مواقعك.') })}
      <div class="grid g3">${D.providers.filter((p) => p.areas.some((a) => ['manara', 'irsal', 'maahid'].includes(a))).map((p) => ui.card({ title: tx(p.name), sub: tx(p.tagline), body: `<div class="row-sm wrap">${p.verified ? ui.status('verified') : ''}${ui.stars(p.rating)}<span class="xs faint">${p.rating} · ${p.reviews}</span></div>`, foot: `<span class="xs muted">${p.cats.map((c) => tx(D.cat(c).name)).join(' · ')}</span>${ui.btn(L('Invite to tender', 'دعوة لمناقصة'), { size: 'sm', kind: 'soft', act: 'soon', arg: L('Tender invitation', 'دعوة المناقصة') })}` })).join('')}</div>`;
  }
  function building(id, r) {
    if (B.shared.building) return B.shared.building(id || SITE_IDS[0], r);
    return siteDetail(id || SITE_IDS[0]);
  }

  /* ======================================================================
     Actions & forms
     ====================================================================== */
  const A = B.act;
  const foot = (label, ic = 'check') => `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${icon(ic)}${label}</button>`;
  const techOpts = () => [{ v: '', l: L('Unassigned', 'غير مُسند') }].concat(Object.keys(TECHS).map((k) => ({ v: k, l: `${tname(k)} — ${tx(TECHS[k].r)}` })));

  A.fmMatrix = (arg) => { const [bid, sys] = String(arg).split('|'); const l = assetsOf(bid).filter((a) => CATS[a.cat].sys === sys); const s = SYSTEMS.find((x) => x.id === sys);
    B.modal({ title: tx(s.n), sub: bname(bid), size: 'md', body: ui.list(l.map((a) => ui.li({ icon: catIcon(a.cat), title: tx(a.name), sub: `${tag(a.tag)} · ${tx(a.loc)}`, end: `${cond(a.cond)}${a.ms !== 'fmOk' ? ui.status(a.ms) : ''}`, go: `${R}-asset-${a.tag}` }))), foot: ui.btn(L('Facility profile', 'ملف المرفق'), { icon: 'building', go: `${R}-site-${bid}` }) }); };
  A.fmConnected = (bid) => { B.vs['fm:cnSite'] = bid; B.go(`${R}-connected`); };

  A.fmNewWO = (arg) => {
    let [t, bid] = String(arg || '').split('|');
    const a = t ? asset(t) : null;
    if (a) bid = a.b;
    const list = bid ? assetsOf(bid) : ASSETS;
    B.modal({ title: L('New work order', 'أمر عمل جديد'), sub: a ? `${a.tag} · ${tx(a.name)}` : bid ? bname(bid) : L('Sanad Facility Services', 'سند لخدمات إدارة المرافق'), form: 'fmNewWO', size: 'lg',
      body: `<div class="stack"><div class="form-grid">
        ${ui.field({ name: 'asset', label: L('Asset', 'الأصل'), type: 'select', full: true, value: a ? a.tag : '', options: list.map((x) => ({ v: x.tag, l: `${x.tag} — ${tx(x.name)}` })) })}
        ${ui.field({ name: 'title', label: L('Title', 'العنوان'), required: true, full: true, placeholder: L('e.g. Replace AHU-02 pre-filters', 'مثال: استبدال الفلاتر الأولية لوحدة AHU-02') })}
        ${ui.field({ name: 'type', label: L('Type', 'النوع'), type: 'select', options: ['fmCorrective', 'fmPreventive', 'fmInspection', 'fmEmergency'].map((k) => ({ v: k, l: ui.statusLabel(k) })) })}
        ${ui.field({ name: 'due', label: L('Due date', 'تاريخ الاستحقاق'), type: 'date', value: '2026-11-28', required: true })}
        ${ui.field({ name: 'tech', label: L('Technician', 'الفني'), type: 'select', options: techOpts() })}
        ${ui.field({ name: 'contractor', label: L('Contractor (optional)', 'المقاول (اختياري)'), type: 'select', options: [{ v: '', l: L('In-house only', 'داخلي فقط') }].concat(CONTRACTORS.map((c) => ({ v: c.p, l: tx(D.provider(c.p).name) }))) })}
      </div>
      ${ui.field({ name: 'priority', label: L('Priority', 'الأولوية'), type: 'radio', value: 'medium', options: [{ v: 'critical', l: ui.statusLabel('critical'), d: L('Respond 1 h', 'استجابة ساعة'), icon: 'zap' }, { v: 'high', l: ui.statusLabel('high'), d: L('Respond 4 h', 'استجابة 4 ساعات'), icon: 'arrowUp' }, { v: 'medium', l: ui.statusLabel('medium'), d: L('Respond 24 h', 'استجابة 24 ساعة'), icon: 'minus' }, { v: 'low', l: ui.statusLabel('low'), d: L('Within 10 days', 'خلال 10 أيام'), icon: 'arrowDown' }] })}
      ${ui.field({ name: 'desc', label: L('Description', 'الوصف'), type: 'textarea', placeholder: L('Symptoms, readings, access notes…', 'الأعراض، القراءات، ملاحظات الدخول…') })}</div>`,
      foot: foot(L('Create work order', 'إنشاء أمر العمل'), 'plus') });
  };
  B.submit.fmNewWO = (d) => {
    const id = 'WO-26-' + (1189 + WOS.length - 18);
    const t = (d.title || '').trim() || L('Work order', 'أمر عمل');
    const ast = asset(d.asset) ? d.asset : ASSETS[0].tag;
    const w = { id, asset: ast, title: { en: t, ar: t }, type: d.type || 'fmCorrective', priority: d.priority || 'medium', status: d.tech || d.contractor ? 'assigned' : 'new', tech: d.tech || null, contractor: d.contractor || null, created: TODAY, due: /^\d{4}-\d{2}-\d{2}$/.test(d.due || '') ? d.due : '2026-11-28', desc: d.desc ? { en: d.desc, ar: d.desc } : null };
    const sys = CATS[asset(ast).cat].sys;
    w.checklist = (CHECK[sys === 'vt' ? 'elevator' : sys] || CHECK.sec).map((x) => ({ t: x, done: false })); w.parts = []; w.labour = 0;
    WOS.unshift(w);
    B.refresh();
    B.success({ title: L('Work order created', 'تم إنشاء أمر العمل'), text: w.tech ? L(`${tname(w.tech)} was notified on the Sanad mobile app.`, `تم إشعار ${tname(w.tech)} على تطبيق سند.`) : L('It is in the queue for dispatch.', 'الأمر في قائمة الانتظار للإسناد.'), ref: id, done: `${R}-wo-${id}`, doneLabel: L('Open work order', 'فتح أمر العمل') });
  };
  const logAdd = (w, title, icon_) => { w.log = w.log || []; w.log.push({ title, meta: L('Today · Omar Saleh', 'اليوم · عمر صالح'), state: 'current', icon: icon_ }); };
  A.fmStart = (id) => { const w = wo(id); if (!w) return; w.status = 'inProgress'; if (!w.labour) w.labour = 0.5; B.refresh(); B.toast(L(`${id} started — technician checked in`, `بدأ ${id} — تم تسجيل دخول الفني`)); };
  A.fmHold = (id) => B.modal({ title: L('Put on hold', 'تعليق أمر العمل'), sub: id, form: 'fmHold', size: 'sm', body: `<input type="hidden" name="id" value="${esc(id)}">${ui.field({ name: 'reason', label: L('Reason', 'السبب'), type: 'select', options: [{ v: 'parts', l: L('Waiting for parts', 'بانتظار القطع') }, { v: 'access', l: L('No access to area', 'لا يمكن الوصول للمنطقة') }, { v: 'contractor', l: L('Waiting for contractor', 'بانتظار المقاول') }, { v: 'approval', l: L('Client approval needed', 'بحاجة لموافقة العميل') }] })}`, foot: foot(L('Put on hold', 'تعليق'), 'clock') });
  B.submit.fmHold = (d) => { const w = wo(d.id); if (w) { w.status = 'onHold'; logAdd(w, L('Put on hold', 'تم التعليق'), 'clock'); } B.refresh(); B.success({ title: L('Work order on hold', 'أمر العمل معلّق'), text: L('The client and the SLA clock were updated.', 'تم تحديث العميل وعدّاد مستوى الخدمة.'), ref: d.id }); };
  A.fmComplete = (id) => { const w = wo(id); if (!w) return; B.modal({ title: L('Complete work order', 'إكمال أمر العمل'), sub: `${id} · ${tx(w.title)}`, form: 'fmComplete', size: 'md',
    body: `<input type="hidden" name="id" value="${esc(id)}"><div class="stack">${w.checklist.some((c) => !c.done) ? ui.callout(L(`${w.checklist.filter((c) => !c.done).length} checklist steps are still open — they will be marked done.`, `${w.checklist.filter((c) => !c.done).length} خطوات ما زالت مفتوحة — سيتم تعليمها كمنجزة.`), 'warn', 'alert') : ''}<div class="form-grid">${ui.field({ name: 'hours', label: L('Labour hours', 'ساعات العمل'), type: 'number', value: Math.max(1, w.labour || 2), min: 0 })}${ui.field({ name: 'cond', label: L('Asset condition after work', 'حالة الأصل بعد العمل'), type: 'select', value: asset(w.asset).cond, options: COND_ORDER.map((c) => ({ v: c, l: ui.statusLabel(c) })) })}</div>${ui.field({ name: 'notes', label: L('Completion notes', 'ملاحظات الإنجاز'), type: 'textarea' })}</div>`, foot: foot(L('Complete', 'إكمال')) }); };
  B.submit.fmComplete = (d) => { const w = wo(d.id); if (w) { w.status = 'completed'; w.closed = TODAY; w.labour = +d.hours || w.labour || 1; w.checklist.forEach((c) => { c.done = true; }); const a = asset(w.asset); if (a && COND_ORDER.includes(d.cond)) { a.cond = d.cond; a.last = TODAY; if (a.ms !== 'fmOk') a.ms = 'fmOk'; } } B.refresh(); B.success({ title: L('Work order completed', 'تم إكمال أمر العمل'), text: L('Asset record and maintenance history were updated. The client receives a completion report.', 'تم تحديث سجل الأصل وسجل الصيانة. يتلقى العميل تقرير الإنجاز.'), ref: d.id }); };
  A.fmReopen = (id) => { const w = wo(id); if (!w) return; w.status = 'assigned'; w.closed = null; logAdd(w, L('Reopened', 'أُعيد فتحه'), 'refresh'); B.refresh(); B.toast(L(`${id} reopened`, `أُعيد فتح ${id}`)); };
  A.fmAssign = (id) => B.modal({ title: L('Assign work order', 'إسناد أمر العمل'), sub: id, form: 'fmAssign', size: 'sm', body: `<input type="hidden" name="id" value="${esc(id)}"><div class="stack">${ui.field({ name: 'tech', label: L('Technician', 'الفني'), type: 'select', options: techOpts().slice(1) })}${ui.field({ name: 'due', label: L('Due date', 'تاريخ الاستحقاق'), type: 'date', value: (wo(id) || {}).due })}</div>`, foot: foot(L('Assign', 'إسناد'), 'userPlus') });
  B.submit.fmAssign = (d) => { const w = wo(d.id); if (w) { w.tech = d.tech || 't_yazan'; w.status = 'assigned'; if (/^\d{4}-\d{2}-\d{2}$/.test(d.due || '')) w.due = d.due; } B.refresh(); B.success({ title: L('Assigned', 'تم الإسناد'), text: L(`${tname(w ? w.tech : 't_yazan')} was notified.`, `تم إشعار ${tname(w ? w.tech : 't_yazan')}.`), ref: d.id }); };
  A.fmWoMenu = (id, el) => B.menu(el, [{ label: L('Reassign', 'إعادة الإسناد'), icon: 'userPlus', act: 'fmAssign', arg: id }, { label: L('Print job sheet', 'طباعة ورقة العمل'), icon: 'doc', act: 'previewDoc', arg: `${id}.pdf` }, { label: L('Share with client', 'مشاركة مع العميل'), icon: 'share', act: 'soon', arg: L('Sharing', 'المشاركة') }]);
  A.fmCheck = (arg) => { const [id, i] = String(arg).split('|'); const w = wo(id); if (!w || !w.checklist[+i]) return; w.checklist[+i].done = !w.checklist[+i].done; if (w.status === 'assigned' || w.status === 'scheduled' || w.status === 'new') { w.status = 'inProgress'; } B.refresh(); };
  A.fmPart = (id) => B.modal({ title: L('Add part', 'إضافة قطعة'), sub: id, form: 'fmPart', size: 'sm', body: `<input type="hidden" name="id" value="${esc(id)}"><div class="stack">${ui.field({ name: 'name', label: L('Part', 'القطعة'), required: true })}<div class="form-grid">${ui.field({ name: 'qty', label: L('Qty', 'الكمية'), type: 'number', value: 1, min: 1 })}${ui.field({ name: 'cost', label: L('Unit cost (₪)', 'سعر الوحدة (₪)'), type: 'number', value: 50, min: 0 })}</div></div>`, foot: foot(L('Add', 'إضافة'), 'plus') });
  B.submit.fmPart = (d) => { const w = wo(d.id); if (w) w.parts.push([{ en: d.name || 'Part', ar: d.name || 'قطعة' }, Math.max(1, +d.qty || 1), Math.max(0, +d.cost || 0)]); B.refresh(); B.closeModal(); B.toast(L('Part added and stock reserved', 'تمت إضافة القطعة وحجزها من المخزون')); };
  A.fmPhoto = (id) => B.modal({ title: L('Work photos', 'صور العمل'), sub: id, size: 'md', body: `<div class="fm-photos" style="grid-template-columns:repeat(2,minmax(0,1fr))">${[1, 2, 3, 4].map((i) => `<div class="media">${photoArt(id.charCodeAt(9) + i)}</div>`).join('')}</div><p class="xs faint" style="margin-top:10px">${L('Illustrative placeholders — technicians attach photos from the mobile app.', 'صور توضيحية — يرفق الفنيون الصور من تطبيق الجوال.')}</p>`, foot: ui.btn(L('Upload photo', 'رفع صورة'), { icon: 'upload', kind: 'primary', act: 'soon', arg: L('Photo upload', 'رفع الصور') }) });
  A.fmInspect = (t) => { const a = asset(t); if (!a) return; B.modal({ title: L('Log inspection', 'تسجيل فحص'), sub: `${a.tag} · ${tx(a.name)}`, form: 'fmInspect', size: 'sm', body: `<input type="hidden" name="tag" value="${esc(t)}"><div class="stack">${ui.field({ name: 'cond', label: L('Condition', 'الحالة'), type: 'select', value: a.cond, options: COND_ORDER.map((c) => ({ v: c, l: ui.statusLabel(c) })) })}${ui.field({ name: 'notes', label: L('Findings', 'الملاحظات'), type: 'textarea' })}</div>`, foot: foot(L('Save inspection', 'حفظ الفحص'), 'clipboard') }); };
  B.submit.fmInspect = (d) => { const a = asset(d.tag); if (a) { if (COND_ORDER.includes(d.cond)) a.cond = d.cond; a.last = TODAY; if (a.ms === 'fmOverdue' || a.ms === 'fmDue') { a.ms = 'fmOk'; const n = new Date(B.today.getTime() + 30 * 86400000); a.next = n.toISOString().slice(0, 10); } } B.refresh(); B.success({ title: L('Inspection logged', 'تم تسجيل الفحص'), text: L('Next inspection was rescheduled automatically.', 'تمت إعادة جدولة الفحص القادم تلقائياً.'), ref: d.tag }); };
  A.fmQR = (t) => { const a = asset(t) || ASSETS[0]; B.modal({ title: L('Asset QR label', 'ملصق QR للأصل'), sub: tx(a.name), size: 'sm', body: `<div style="border:1px dashed #B9C6CF;border-radius:14px;padding:18px;display:flex;gap:16px;align-items:center"><div style="width:110px;height:110px;flex:none">${B.art.qr(a.tag.length * 17)}</div><div class="stack-sm"><span class="row-sm">${B.logo(18)}<b class="small">BENA · Sanad</b></span>${tag(a.tag)}<span class="xs muted">${bname(a.b)}</span><span class="xs faint">${tx(a.loc)}</span></div></div><p class="xs faint" style="margin-top:10px">${L('Technicians scan to open the asset, check in and log work.', 'يمسح الفنيون الرمز لفتح الأصل وتسجيل الدخول والعمل.')}</p>`, foot: ui.btn(L('Print labels', 'طباعة الملصقات'), { icon: 'download', kind: 'primary', act: 'soon', arg: L('Label printing', 'طباعة الملصقات') }) }); };
  A.fmAddAsset = () => B.modal({ title: L('Add asset', 'إضافة أصل'), form: 'fmAddAsset', size: 'md', body: `<div class="form-grid">${ui.field({ name: 'name', label: L('Asset name', 'اسم الأصل'), required: true, full: true })}${ui.field({ name: 'site', label: L('Facility', 'المرفق'), type: 'select', options: SITE_IDS.map((b) => ({ v: b, l: sshort(b) })) })}${ui.field({ name: 'cat', label: L('Category', 'الفئة'), type: 'select', options: Object.keys(CATS).map((k) => ({ v: k, l: tx(CATS[k].n) })) })}${ui.field({ name: 'loc', label: L('Location', 'الموقع'), full: true })}${ui.field({ name: 'spec', label: L('Rating / model', 'المواصفة / الطراز') })}${ui.field({ name: 'year', label: L('Install year', 'سنة التركيب'), type: 'number', value: 2026 })}</div>`, foot: foot(L('Add asset', 'إضافة الأصل'), 'plus') });
  B.submit.fmAddAsset = (d) => { const bid = SITE_IDS.includes(d.site) ? d.site : SITE_IDS[0]; const cat = CATS[d.cat] ? d.cat : 'hvac'; const code = { elevator: 'EL', hvac: 'HV', pump: 'PM', water: 'WT', generator: 'GN', electrical: 'EE', fire: 'FS', access: 'AC', cctv: 'SC', bms: 'BM', medgas: 'MG' }[cat]; const t = `SND-${bid.slice(-3)}-${code}-N${String(ASSETS.length).slice(-2)}`; const n = (d.name || '').trim() || L('New asset', 'أصل جديد');
    ASSETS.push({ tag: t, b: bid, cat, name: { en: n, ar: n }, loc: { en: d.loc || '—', ar: d.loc || '—' }, cond: 'excellent', ms: 'fmOk', last: TODAY, next: '2027-02-25', spec: d.spec || '—', year: +d.year || 2026, crit: 'C' }); B.refresh(); B.success({ title: L('Asset added', 'تمت إضافة الأصل'), text: L('A QR label is ready to print.', 'ملصق QR جاهز للطباعة.'), ref: t, done: `${R}-asset-${t}`, doneLabel: L('Open asset', 'فتح الأصل') }); };
  A.fmPM = (id) => { const p = PM.find((x) => x.id === id); if (!p) return; B.modal({ title: tx(p.n), sub: `${p.id} · ${tx(FREQ[p.freq])}`, size: 'md', body: `${ui.kv([[L('Facilities', 'المرافق'), p.sites.map((s) => sshort('BN-RAM-00' + s)).join(', ')], [L('Performed by', 'المنفّذ'), p.by === 'in' ? L('Sanad in-house team', 'فريق سند الداخلي') : tx(D.provider(p.by).name)], [L('Last done', 'آخر تنفيذ'), B.date(p.last)], [L('Next due', 'الاستحقاق القادم'), `<span class="${p.next < TODAY ? 'fm-due over' : ''}">${B.date(p.next)} · ${B.inDays(p.next)}</span>`], [L('Compliance (12 mo)', 'الامتثال (12 شهراً)'), `${p.comp}%`]])}<div style="margin-top:12px">${ui.progress(p.comp, p.comp >= 92 ? '' : 'warn')}</div>`, foot: `${ui.btn(L('Generate work orders', 'إنشاء أوامر العمل'), { icon: 'clipboard', act: 'fmGenPM', arg: p.id })}${ui.btn(L('Mark done', 'تعليم كمنجز'), { icon: 'check', kind: 'primary', act: 'fmDonePM', arg: p.id })}` }); };
  A.fmGenPM = (id) => { B.closeModal(true); B.toast(L(`Work orders generated for ${id}`, `تم إنشاء أوامر عمل للخطة ${id}`)); };
  A.fmDonePM = (id) => { const p = PM.find((x) => x.id === id); if (p) { p.last = TODAY; const step = { monthly: 1, quarterly: 3, semiannual: 6, annual: 12 }[p.freq]; const n = new Date(2026, 10 + step, Math.min(p.day, 28)); p.next = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`; p.comp = Math.min(100, p.comp + 3); } B.closeModal(true); B.refresh(); B.toast(L('Marked done — next occurrence scheduled', 'تم التعليم كمنجز — جُدول الموعد القادم')); };
  A.fmNewPM = () => B.modal({ title: L('New PM plan', 'خطة صيانة وقائية جديدة'), form: 'fmNewPM', size: 'md', body: `<div class="form-grid">${ui.field({ name: 'name', label: L('Plan name', 'اسم الخطة'), required: true, full: true })}${ui.field({ name: 'cat', label: L('Asset category', 'فئة الأصل'), type: 'select', options: Object.keys(CATS).map((k) => ({ v: k, l: tx(CATS[k].n) })) })}${ui.field({ name: 'freq', label: L('Frequency', 'التكرار'), type: 'select', options: Object.keys(FREQ).map((k) => ({ v: k, l: tx(FREQ[k]) })), value: 'monthly' })}${ui.field({ name: 'start', label: L('First due', 'أول استحقاق'), type: 'date', value: '2026-12-10', required: true })}${ui.field({ name: 'by', label: L('Performed by', 'المنفّذ'), type: 'select', options: [{ v: 'in', l: L('In-house', 'داخلي') }].concat(CONTRACTORS.map((c) => ({ v: c.p, l: tx(D.provider(c.p).name) }))) })}</div>`, foot: foot(L('Create plan', 'إنشاء الخطة'), 'calendarCheck') });
  B.submit.fmNewPM = (d) => { const id = 'PM-' + String(PM.length + 1).padStart(2, '0'); const n = (d.name || '').trim() || L('PM plan', 'خطة'); const start = /^\d{4}-\d{2}-\d{2}$/.test(d.start || '') ? d.start : '2026-12-10'; PM.push({ id, n: { en: n, ar: n }, cat: CATS[d.cat] ? d.cat : 'hvac', sites: ['311', '415', '618'], freq: FREQ[d.freq] ? d.freq : 'monthly', day: +start.slice(8, 10), anchor: +start.slice(5, 7) - 1, by: d.by || 'in', comp: 100, last: '—', next: start }); B.refresh(); B.success({ title: L('PM plan created', 'تم إنشاء الخطة'), text: L('Occurrences were added to the calendar.', 'تمت إضافة المواعيد إلى التقويم.'), ref: id }); };
  A.fmContractor = (pid) => { const c = CONTRACTORS.find((x) => x.p === pid); if (!c) return; const p = D.provider(pid); const ws = WOS.filter((w) => w.contractor === pid);
    B.modal({ title: tx(p.name), sub: tx(c.scope), size: 'md', body: `<div class="row-sm wrap" style="margin-bottom:12px">${p.verified ? ui.status('verified') : ''}${ui.stars(p.rating)}<span class="xs faint">${p.rating} · ${p.reviews}</span></div>${ui.kv([[L('Contract', 'العقد'), ui.idMono(c.ref)], [L('Sites', 'المواقع'), c.sites.map((s) => sshort('BN-RAM-00' + s)).join(', ')], [L('SLA target', 'هدف SLA'), tx(c.resp)], [L('SLA met (90 days)', 'الالتزام (90 يوماً)'), `<b>${c.sla}%</b>`], [L('Annual value', 'القيمة السنوية'), B.money(c.value)], [L('Contract end', 'نهاية العقد'), B.date(c.end)]])}${ws.length ? `<div class="fm-k" style="margin:16px 0 4px">${L('Work orders', 'أوامر العمل')}</div>${ui.list(ws.map((w) => ui.li({ icon: 'clipboard', title: tx(w.title), sub: ui.idMono(w.id), end: ui.status(w.status), go: `${R}-wo-${w.id}` })))}` : ''}`,
      foot: `${ui.btn(L('Contract PDF', 'العقد PDF'), { icon: 'doc', act: 'previewDoc', arg: `${c.ref}.pdf` })}${ui.btn(B.daysFromToday(c.end) <= 60 ? L('Start renewal', 'بدء التجديد') : L('Message', 'مراسلة'), { icon: B.daysFromToday(c.end) <= 60 ? 'refresh' : 'chat', kind: 'primary', act: 'soon', arg: B.daysFromToday(c.end) <= 60 ? L('Contract renewal', 'تجديد العقد') : L('Messaging', 'المراسلة') })}` }); };
  A.fmAddContractor = () => B.modal({ title: L('Add contractor', 'إضافة مقاول'), form: 'fmAddContractor', size: 'md', body: `<div class="form-grid">${ui.field({ name: 'p', label: L('Provider on BENA', 'مزوّد على بينا'), type: 'select', full: true, options: D.providers.filter((p) => !CONTRACTORS.some((c) => c.p === p.id)).map((p) => ({ v: p.id, l: `${tx(p.name)} — ${p.cats.map((x) => tx(D.cat(x).name)).join(', ')}` })) })}${ui.field({ name: 'ref', label: L('Contract reference', 'مرجع العقد'), placeholder: 'SND-C-2026-…' })}${ui.field({ name: 'end', label: L('Contract end', 'نهاية العقد'), type: 'date', value: '2027-11-30' })}${ui.field({ name: 'resp', label: L('SLA response target', 'هدف زمن الاستجابة'), full: true, placeholder: L('e.g. 4 h critical · 48 h routine', 'مثال: 4 ساعات حرج · 48 ساعة عادي') })}</div>`, foot: foot(L('Add contractor', 'إضافة المقاول'), 'plus') });
  B.submit.fmAddContractor = (d) => { const p = D.provider(d.p) || D.providers.find((x) => !CONTRACTORS.some((c) => c.p === x.id)); if (p && !CONTRACTORS.some((c) => c.p === p.id)) CONTRACTORS.push({ p: p.id, scope: p.tagline, sites: ['311'], ref: d.ref || 'SND-C-2026-0' + CONTRACTORS.length, resp: { en: d.resp || '48 h', ar: d.resp || '48 ساعة' }, sla: 100, value: 0, end: /^\d{4}-\d{2}-\d{2}$/.test(d.end || '') ? d.end : '2027-11-30' }); B.refresh(); B.success({ title: L('Contractor added', 'تمت إضافة المقاول'), text: L('They can now receive work orders for assigned sites.', 'يمكنه الآن استلام أوامر العمل للمواقع المحددة.'), ref: d.ref || '' }); };
  A.fmPilot = () => B.modal({ title: L('Request an integration pilot', 'طلب تجربة تكامل'), sub: L('Connect one building\'s systems to BENA (future capability)', 'ربط أنظمة مبنى واحد ببينا (قدرة مستقبلية)'), form: 'fmPilot', size: 'md', body: `<div class="stack">${ui.field({ name: 'site', label: L('Facility', 'المرفق'), type: 'select', options: SITE_IDS.map((b) => ({ v: b, l: bname(b) })) })}<div class="field"><span class="label">${L('Systems to include', 'الأنظمة المشمولة')}</span><div class="row wrap" style="gap:14px">${[L('HVAC / BMS', 'التكييف / BMS'), L('Elevators', 'المصاعد'), L('Access control', 'التحكم بالدخول'), L('CCTV', 'الكاميرات'), L('Energy meters', 'عدادات الطاقة'), L('Water & leak sensors', 'المياه وحساسات التسرب')].map((l, i) => `<label class="check"><input type="checkbox" name="s${i}" ${i < 2 ? 'checked' : ''}>${l}</label>`).join('')}</div></div>${ui.field({ name: 'notes', label: L('Notes', 'ملاحظات'), type: 'textarea', placeholder: L('Existing BMS vendor, protocols, IT contact…', 'مزوّد BMS الحالي، البروتوكولات، جهة اتصال تقنية المعلومات…') })}</div>`, foot: foot(L('Send request', 'إرسال الطلب'), 'send') });
  B.submit.fmPilot = () => B.success({ title: L('Pilot request sent', 'تم إرسال طلب التجربة'), text: L('The BENA integrations team will contact you to plan a site survey. No equipment is connected in this demo.', 'سيتواصل معك فريق التكامل في بينا لتخطيط مسح الموقع. لا توجد معدات متصلة في هذه النسخة التجريبية.'), ref: 'INT-' + String(Date.now()).slice(-5) });

  /* bulk actions on registers / work orders */
  const keysOf = (arg) => String(arg || '').split(',').filter(Boolean);
  A.fmBulkWO = (arg) => { const ts = keysOf(arg).filter((t) => asset(t)); B.confirm({ title: L(`Create ${ts.length} work orders?`, `إنشاء ${ts.length} أوامر عمل؟`), text: L('One corrective work order per asset, routed to the assigned team with the standard checklist.', 'أمر عمل تصحيحي لكل أصل، يُوجَّه للفريق المسؤول مع قائمة التحقق القياسية.'), ok: L('Create', 'إنشاء'), onOk: () => { ts.forEach((t) => { const a = asset(t); const id = 'WO-26-' + (1189 + WOS.length - 18); const sys = CATS[a.cat].sys; WOS.unshift({ id, asset: t, title: { en: `Inspection follow-up — ${a.name.en}`, ar: `متابعة فحص — ${a.name.ar}` }, type: 'fmCorrective', priority: 'medium', status: 'assigned', tech: teamOf(a)[0], contractor: null, created: TODAY, due: '2026-12-02', checklist: (CHECK[sys === 'vt' ? 'elevator' : sys] || CHECK.sec).map((x) => ({ t: x, done: false })), parts: [], labour: 0 }); }); B.vs['fm-as:sel'] = []; B.success({ title: L(`${ts.length} work orders created`, `تم إنشاء ${ts.length} أوامر عمل`), text: L('Technicians were notified on the Sanad mobile app (simulated).', 'تم إشعار الفنيين على تطبيق سند (محاكاة).'), ref: B.uid('WO') }); B.refresh(); } }); };
  A.fmBulkInspect = (arg) => { const ts = keysOf(arg); B.confirm({ title: L(`Log inspection for ${ts.length} assets?`, `تسجيل فحص لـ ${ts.length} أصول؟`), text: L('Records a satisfactory visual inspection today and reschedules overdue items in 30 days.', 'يسجّل فحصاً بصرياً مُرضياً اليوم ويعيد جدولة المتأخر بعد 30 يوماً.'), ok: L('Log inspection', 'تسجيل'), onOk: () => { ts.forEach((t) => { const a = asset(t); if (!a) return; a.last = TODAY; if (a.ms === 'fmOverdue' || a.ms === 'fmDue') { a.ms = 'fmOk'; a.next = '2026-12-25'; } }); B.vs['fm-as:sel'] = []; B.success({ title: L('Inspections logged', 'تم تسجيل الفحوصات'), ref: B.uid('INS') }); B.refresh(); } }); };
  A.fmBulkQR = (arg) => { const n = keysOf(arg).length; B.success({ title: L(`${n} QR labels ready`, `${n} ملصقات QR جاهزة`), text: L('Label sheet prepared for printing (simulated).', 'تم تجهيز ورقة الملصقات للطباعة (محاكاة).'), ref: B.uid('QR') }); };
  A.fmBulkAssign = (arg) => { const ids = keysOf(arg); B.modal({ title: L(`Assign ${ids.length} work orders`, `إسناد ${ids.length} أوامر عمل`), size: 'sm', form: 'fmBulkAssign', body: `<input type="hidden" name="ids" value="${esc(ids.join(','))}">${ui.field({ name: 'tech', label: L('Technician', 'الفني'), type: 'select', options: techOpts().slice(1) })}`, foot: foot(L('Assign', 'إسناد'), 'userPlus') }); };
  B.submit.fmBulkAssign = (d) => { keysOf(d.ids).forEach((id) => { const w = wo(id); if (w && isOpen(w)) { w.tech = d.tech || 't_yazan'; if (w.status === 'new') w.status = 'assigned'; } }); B.vs['fm-wo:sel'] = []; B.success({ title: L('Work orders assigned', 'تم إسناد أوامر العمل'), text: L(`${tname(d.tech || 't_yazan')} was notified.`, `تم إشعار ${tname(d.tech || 't_yazan')}.`), ref: B.uid('ASG') }); B.refresh(); };
  A.fmBulkPrint = (arg) => B.success({ title: L('Job sheets prepared', 'تم تجهيز أوراق العمل'), text: L(`${keysOf(arg).length} job sheets with QR check-in codes (simulated).`, `${keysOf(arg).length} أوراق عمل مع رموز QR لتسجيل الدخول (محاكاة).`), ref: B.uid('JOB') });
  /** Simulated export (format + period); nothing is downloaded. */
  A.fmExport = (what) => { const name = keysOf(what).length > 1 || /^(SND|WO)-/.test(String(what)) ? L(`${keysOf(what).length} selected rows`, `${keysOf(what).length} صفوف محددة`) : String(what || L('Report', 'تقرير')); B.modal({ title: L('Export', 'تصدير'), sub: esc(name), size: 'sm', form: 'fmExport', body: `<input type="hidden" name="what" value="${esc(name)}"><div class="stack">${ui.field({ name: 'fmt', label: L('Format', 'الصيغة'), type: 'radio', value: 'pdf', options: [{ v: 'pdf', l: 'PDF', icon: 'doc' }, { v: 'xlsx', l: 'Excel (.xlsx)', icon: 'grid' }, { v: 'csv', l: 'CSV', icon: 'list' }] })}${ui.callout(L('Simulated export — the file is prepared in the demo but nothing is downloaded or sent.', 'تصدير محاكاة — يُجهَّز الملف في النسخة التجريبية دون تنزيل أو إرسال أي شيء.'), '', 'info')}</div>`, foot: foot(L('Prepare file', 'تجهيز الملف'), 'download') }); };
  B.submit.fmExport = (d) => B.success({ title: L('File prepared (simulated)', 'تم تجهيز الملف (محاكاة)'), text: `${esc(d.what)} · ${String(d.fmt || 'pdf').toUpperCase()}`, ref: B.uid('EXP') });

  /* Internals shared with facility2.js */
  D.fmX = { R, TODAY, T, SITE, SITE_IDS, site, sshort, bname, CATS, SYSTEMS, COND_ORDER, ASSETS, asset, assetsOf, worst, healthScore, TECHS, tname, WOS, wo, isOpen, isLate, PM, FREQ, pmOccurs, CONTRACTORS, CHECK, TEAM, teamOf, teamCell, nextCell, tag, cond, prio, due, catIcon, who, fscope, fIds, inFs, siteSel, fcrumbs, fhead, opsStrip, sec, photoArt, keysOf, foot, techOpts, REG };

  /* ======================================================================
     Register role
     ====================================================================== */
  B.role({
    id: R, icon: 'settings', nav: 'drawer',
    name: T('Facility Management', 'إدارة المرافق'),
    short: T('Facilities', 'المرافق'),
    org: T('Sanad Facility Services', 'سند لخدمات إدارة المرافق'),
    tag: T('Operations', 'العمليات'),
    desc: T('Assets, work orders, preventive maintenance and contractors across commercial buildings.', 'الأصول وأوامر العمل والصيانة الوقائية والمقاولون في المباني التجارية.'),
    personaTitle: T('Omar Saleh · Facilities Director', 'عمر صالح · مدير المرافق'),
    home: 'home',
    workspaces: [{ id: 'all', label: T('All facilities', 'كل المرافق'), icon: 'layers' }].concat(SITE_IDS.map((b) => ({ id: b, label: SITE[b].short, icon: 'building' }))),
    menu: [
      { group: T('Operations', 'العمليات') },
      { id: 'home', label: T('Facility overview', 'نظرة عامة على المرافق'), icon: 'gauge' },
      { id: 'workorders', label: T('Work orders', 'أوامر العمل'), icon: 'clipboard', match: ['wo'], count: WOS.filter(isOpen).length },
      { id: 'calendar', label: T('Maintenance calendar', 'تقويم الصيانة'), icon: 'calendar' },
      { id: 'pm', label: T('Preventive maintenance', 'الصيانة الوقائية'), icon: 'calendarCheck' },
      { id: 'inspections', label: T('Inspections', 'الفحوصات'), icon: 'checkSquare' },
      { group: T('Facilities & assets', 'المرافق والأصول') },
      { id: 'sites', label: T('Facilities', 'المرافق'), icon: 'city', match: ['site'] },
      { id: 'assets', label: T('Building assets', 'أصول المباني'), icon: 'cpu', match: ['asset'] },
      { id: 'history', label: T('Service history', 'سجل الخدمة'), icon: 'history' },
      { id: 'contractors', label: T('Contractors', 'المقاولون'), icon: 'handshake' },
      { group: T('Performance', 'الأداء') },
      { id: 'energy', label: T('Energy & water', 'الطاقة والمياه'), icon: 'zap' },
      { id: 'reports', label: T('Facility reports', 'تقارير المرافق'), icon: 'chart' },
      { id: 'connected', label: T('Connected building · preview', 'المبنى المتصل · معاينة'), icon: 'wifi' },
    ],
    pages: { home, workorders, wo: woDetail, pm, sites, site: siteDetail, assets, asset: assetDetail, contractors, connected, services, building },
    notifications: () => [
      { icon: 'flame', tone: 'bad', title: L('Irsal Plaza — fire alarm loop 3 earth fault', 'بلازا الإرسال — عطل تأريض في دائرة الحريق 3'), sub: 'WO-26-1188 · ' + L('Saed on site', 'سائد في الموقع'), when: '08:12', go: `${R}-wo-WO-26-1188` },
      { icon: 'elevator', tone: 'warn', title: L('Manara BC — elevator 3 part arrives 27 Nov', 'المنارة للأعمال — قطعة المصعد 3 تصل 27 ت٢'), sub: 'WO-26-1186', when: L('Yesterday', 'أمس'), go: `${R}-wo-WO-26-1186` },
      { icon: 'clipboard', tone: 'warn', title: L('Sprinkler inspection 10 days overdue', 'فحص الرشاشات متأخر 10 أيام'), sub: 'SND-311-FS-SPR', when: L('3 days', '3 أيام'), go: `${R}-asset-SND-311-FS-SPR` },
      { icon: 'wind', tone: 'info', title: L('New tenant request linked: office 702 too warm', 'ربط طلب مستأجر جديد: المكتب 702 حار'), sub: 'MR-24460 → WO-26-1187', when: L('4 days', '4 أيام'), go: `${R}-wo-WO-26-1187` },
      { icon: 'handshake', tone: 'mint', title: L('Volt Electric contract renewal due', 'تجديد عقد فولت للكهرباء مستحق'), sub: L('Ends 31 Dec 2026', 'ينتهي 31 ك١ 2026'), when: L('1 wk', 'أسبوع'), go: `${R}-contractors` },
    ],
  });
})();
