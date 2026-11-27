/*
 * BENA — Building Committee / Owners' Association workspace.
 * Persona: Samer Khoury, Chair of Al-Masyoun Tower Owners' Association (c_masyoun,
 * building BN-RAM-00142). Governance, finances, meetings & resolutions, members,
 * maintenance approvals and announcements. All figures are fictional demo data.
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon, ui } = B;
  const D = B.data;
  const T = (en, ar) => ({ en, ar });
  const BID = 'BN-RAM-00142';
  const C = D.committees.c_masyoun;
  const R = 'committee';

  /* ======================================================================
     Styles (prefixed cm-)
     ====================================================================== */
  B.css(`
  .cm-hero { background: var(--navy); color: var(--navy-ink); border-radius: var(--r-lg); padding: 22px 24px; display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 22px 32px; position: relative; overflow: hidden; }
  .cm-hero::after { content: ""; position: absolute; inset-inline-end: -60px; top: -80px; width: 260px; height: 260px; border-radius: 50%; border: 1px solid rgba(54,214,160,.18); box-shadow: 0 0 0 40px rgba(54,214,160,.035), 0 0 0 80px rgba(54,214,160,.025); pointer-events: none; }
  .cm-hero > * { position: relative; z-index: 1; min-width: 0; }
  .cm-hero h1 { color: #fff; font-size: 26px; line-height: 1.2; margin-top: 10px; }
  .cm-hero .cm-org { font-size: 13.5px; margin-top: 4px; }
  .cm-hero .badge.navy { background: rgba(255,255,255,.1); }
  .cm-hero .id-mono { color: var(--navy-ink); font-size: 12px; }
  .cm-hero .cm-next { margin-top: 16px; display: flex; gap: 12px; align-items: center; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 14px; padding: 10px 12px; text-align: start; width: 100%; transition: background .2s; }
  .cm-hero .cm-next:hover { background: rgba(255,255,255,.1); }
  .cm-hero .cm-nt b { color: #fff; font-size: 14px; display: block; }
  .cm-hero .cm-nt small { font-size: 12px; display: block; }
  .cm-hero .cm-dt { background: #fff; border-color: #fff; }
  .cm-hero .cm-next .chev { width: 16px; height: 16px; margin-inline-start: auto; color: var(--navy-ink); flex: none; }
  .cm-fin { display: flex; flex-direction: column; gap: 14px; }
  .cm-fin .cm-bal-l { font-size: 12.5px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .cm-fin .cm-bal { font-family: var(--font-display); color: #fff; font-size: 36px; font-weight: 700; letter-spacing: -.02em; line-height: 1.05; font-variant-numeric: tabular-nums; }
  .cm-fin .cm-bal-sub { font-size: 12.5px; }
  .cm-fin .cm-bal-sub b { color: var(--mint); font-weight: 600; }
  .cm-split { height: 10px; border-radius: 99px; background: rgba(255,255,255,.1); display: flex; overflow: hidden; gap: 2px; }
  .cm-split i { display: block; height: 100%; }
  .cm-split-l { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; margin-top: 7px; flex-wrap: wrap; }
  .cm-split-l span { display: inline-flex; align-items: center; gap: 6px; }
  .cm-split-l i { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
  .cm-split-l b { color: #fff; font-variant-numeric: tabular-nums; }
  .cm-hstats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; border-top: 1px solid rgba(255,255,255,.1); padding-top: 14px; }
  .cm-hstats div { min-width: 0; }
  .cm-hstats b { display: block; color: #fff; font-family: var(--font-display); font-size: 17px; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .cm-hstats span { font-size: 11.5px; line-height: 1.3; display: block; }
  .cm-hstats .over { color: #F6C77E; }
  @media (max-width: 900px) { .cm-hero { grid-template-columns: minmax(0, 1fr); padding: 20px; } .cm-hero h1 { font-size: 22px; } }
  @media (max-width: 640px) { .cm-fin .cm-bal { font-size: 32px; } .cm-hstats b { font-size: 15px; } }

  .cm-quick { margin: 18px 0 22px; }
  @media (max-width: 767px) { .cm-quick { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; } .cm-quick .qa { font-size: 11px; line-height: 1.25; } .cm-quick .qa .qi { width: 52px; height: 52px; border-radius: 16px; } }
  @media (min-width: 768px) { .cm-quick { display: flex; gap: 10px; flex-wrap: wrap; } .cm-quick .qa { flex-direction: row; background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 8px 14px 8px 8px; gap: 10px; font-size: 13.5px; font-weight: 600; } html[dir="rtl"] .cm-quick .qa { padding: 8px 8px 8px 14px; } .cm-quick .qa .qi { width: 34px; height: 34px; border-radius: 10px; border: 0; background: var(--mint-50); color: var(--mint-ink); } .cm-quick .qa .qi svg { width: 18px; height: 18px; } .cm-quick .qa:hover { border-color: var(--mint); } .cm-quick .qa:hover .qi { transform: none; } }

  .cm-dt { width: 46px; height: 50px; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--line); display: flex; flex-direction: column; align-items: center; justify-content: center; flex: none; line-height: 1.05; }
  .cm-dt small { font-size: 10.5px; font-weight: 700; color: var(--mint-ink); text-transform: uppercase; letter-spacing: .04em; }
  .cm-dt b { font-family: var(--font-display); font-size: 19px; font-variant-numeric: tabular-nums; }
  .cm-dt.ga { background: var(--navy); border-color: var(--navy); } .cm-dt.ga b { color: #fff; } .cm-dt.ga small { color: var(--mint); }
  .cm-dt.past { opacity: .7; }
  .cm-hero .cm-dt b { color: var(--ink); }
  .cm-hero .cm-dt.ga { background: var(--mint); border-color: var(--mint); } .cm-hero .cm-dt.ga b, .cm-hero .cm-dt.ga small { color: var(--navy); }

  .cm-attn { display: flex; flex-direction: column; gap: 8px; }
  .cm-attn .li { padding: 12px 14px; border: 1px solid var(--line); border-radius: 14px; background: #fff; }
  .cm-attn .li:first-child { padding-top: 12px; }
  .cm-attn .li:last-child { border-bottom: 1px solid var(--line); }

  .cm-post textarea { min-height: 84px; }
  .cm-post .cm-post-f { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 10px; flex-wrap: wrap; }

  .cm-members-strip { display: flex; flex-direction: column; gap: 2px; }
  .cm-role-tag { font-size: 11.5px; font-weight: 600; color: var(--text-2); background: var(--line-2); border-radius: 6px; padding: 2px 7px; white-space: nowrap; }
  .cm-role-tag.chair { background: var(--navy); color: #fff; }

  /* governance types */
  .cm-gov-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
  @media (max-width: 900px) { .cm-gov-grid { grid-template-columns: minmax(0, 1fr); } }
  .cm-gov { border-radius: 18px; padding: 18px; display: flex; flex-direction: column; gap: 12px; text-align: start; min-width: 0; position: relative; transition: transform .2s var(--ease), box-shadow .2s; width: 100%; }
  .cm-gov:hover { transform: translateY(-2px); }
  .cm-gov h4 { font-size: 15px; line-height: 1.3; }
  .cm-gov .cm-gov-k { font-size: 11.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
  html[dir="rtl"] .cm-gov .cm-gov-k { letter-spacing: 0; }
  .cm-gov .cm-gov-k svg { width: 15px; height: 15px; }
  .cm-gov p { font-size: 13px; }
  .cm-gov.legal { background: var(--navy); color: var(--navy-ink); border: 1px solid var(--navy); }
  .cm-gov.legal h4 { color: #fff; } .cm-gov.legal .cm-gov-k { color: var(--mint); }
  .cm-gov.informal { background: #fff; border: 1.5px dashed #A9B6C2; color: var(--text-2); }
  .cm-gov.informal .cm-gov-k { color: var(--text-2); }
  .cm-gov.authorized { background: var(--info-bg); border: 1px solid #C9D9F6; color: #24467F; }
  .cm-gov.authorized h4 { color: #183E85; } .cm-gov.authorized .cm-gov-k { color: var(--info); }
  .cm-gov.legal .id-mono { color: #fff; }
  .cm-cap-l em { font-style: normal; color: var(--text-2); }
  .cm-legend-dots svg { width: 15px; height: 15px; }
  .cm-gov.sel { box-shadow: 0 0 0 3px var(--mint); }
  .cm-gov .cm-seal { position: absolute; top: 16px; inset-inline-end: 16px; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; }
  .cm-gov.legal .cm-seal { border: 1.5px solid rgba(54,214,160,.5); color: var(--mint); box-shadow: 0 0 0 4px rgba(54,214,160,.08); }
  .cm-gov.informal .cm-seal { border: 1.5px dashed #A9B6C2; color: var(--text-3); }
  .cm-gov.authorized .cm-seal { background: #fff; color: var(--info); }
  .cm-gov .cm-seal svg { width: 20px; height: 20px; }
  .cm-gov .cm-gov-head { padding-inline-end: 54px; }
  .cm-gov .cm-gov-meta { font-size: 12px; display: flex; flex-direction: column; gap: 3px; margin-top: auto; padding-top: 10px; border-top: 1px solid rgba(127,140,150,.2); }
  .cm-gov.legal .cm-gov-meta { border-top-color: rgba(255,255,255,.1); }
  .cm-gov .cm-gov-meta b { font-weight: 600; }
  .cm-gov.legal .cm-gov-meta b { color: #fff; }
  .cm-cap { display: grid; grid-template-columns: minmax(0, 1.6fr) repeat(3, minmax(0, 1fr)); font-size: 13px; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
  .cm-cap > div { padding: 10px 12px; border-bottom: 1px solid var(--line-2); display: flex; align-items: center; min-width: 0; }
  .cm-cap > div.h { background: var(--surface-2); font-size: 11.5px; font-weight: 700; color: var(--text-2); justify-content: center; text-align: center; }
  .cm-cap > div.h:first-child { justify-content: flex-start; }
  .cm-cap > div.c { justify-content: center; }
  .cm-cap > div.c.on { background: rgba(54,214,160,.06); }
  .cm-cap > div:nth-last-child(-n+4) { border-bottom: 0; }
  .cm-cap svg { width: 17px; height: 17px; }
  .cm-cap .y { color: var(--ok); } .cm-cap .n { color: #C3CCD3; } .cm-cap .p { color: var(--warn); }
  @media (max-width: 640px) { .cm-cap { font-size: 12px; grid-template-columns: minmax(0, 1.3fr) repeat(3, minmax(0, .7fr)); } .cm-cap > div { padding: 9px 8px; } .cm-cap > div.h { font-size: 10.5px; } }

  /* votes */
  .cm-vote { display: flex; flex-direction: column; gap: 8px; }
  .cm-vote-bar { display: flex; height: 14px; border-radius: 99px; overflow: hidden; background: var(--line-2); gap: 2px; }
  .cm-vote-bar i { display: block; height: 100%; }
  .cm-vote-l { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12px; color: var(--text-2); }
  .cm-vote-l span { display: inline-flex; gap: 6px; align-items: center; }
  .cm-vote-l i { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
  .cm-vote-l b { color: var(--ink); font-variant-numeric: tabular-nums; }
  .cm-res { border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
  .cm-res + .cm-res { margin-top: 10px; }
  .cm-res-top { display: flex; gap: 10px; align-items: flex-start; justify-content: space-between; }
  .cm-res-top b { font-size: 14px; line-height: 1.35; display: block; }
  .cm-res-top small { font-size: 12px; color: var(--text-3); display: block; margin-top: 2px; }
  .cm-thr { position: relative; }
  .cm-thr::after { content: ""; position: absolute; top: -3px; bottom: -3px; inset-inline-start: var(--thr); width: 2px; background: var(--navy); border-radius: 2px; }

  .cm-agenda { list-style: none; margin: 0; padding: 0; counter-reset: ag; display: flex; flex-direction: column; }
  .cm-agenda li { counter-increment: ag; display: grid; grid-template-columns: 30px minmax(0, 1fr) auto; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--line-2); align-items: start; font-size: 14px; }
  .cm-agenda li:last-child { border-bottom: 0; }
  .cm-agenda li::before { content: counter(ag); width: 26px; height: 26px; border-radius: 8px; background: var(--mint-50); color: var(--mint-ink); font-weight: 700; font-size: 12.5px; display: grid; place-items: center; }
  .cm-agenda li small { display: block; color: var(--text-3); font-size: 12px; margin-top: 2px; }
  .cm-minutes p { font-size: 14px; color: var(--text-2); line-height: 1.65; }
  .cm-minutes p + p { margin-top: 10px; }
  .cm-minutes b { color: var(--ink); }

  /* statement document */
  .cm-stmt { background: #fff; border: 1px solid var(--line); border-radius: var(--r); padding: 28px; max-width: 860px; }
  .cm-stmt-h { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding-bottom: 18px; border-bottom: 2px solid var(--navy); }
  .cm-stmt-h h2 { font-size: 20px; }
  .cm-stmt table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 4px; }
  .cm-stmt td { padding: 9px 0; border-bottom: 1px solid var(--line-2); }
  .cm-stmt td:last-child { text-align: end; font-variant-numeric: tabular-nums; white-space: nowrap; padding-inline-start: 12px; }
  .cm-stmt tr.sub td { font-weight: 700; border-bottom: 1px solid var(--line); background: var(--surface-2); padding-inline: 10px; }
  .cm-stmt tr.tot td { font-weight: 700; font-size: 15.5px; border-bottom: 0; border-top: 2px solid var(--navy); padding-top: 12px; }
  .cm-stmt tr.neg td:last-child { color: var(--text-2); }
  .cm-stmt .cm-stmt-sec { font-size: 11.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--text-3); margin: 22px 0 4px; }
  html[dir="rtl"] .cm-stmt .cm-stmt-sec { letter-spacing: 0; }
  .cm-stmt-sign { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; margin-top: 28px; font-size: 12.5px; color: var(--text-3); }
  .cm-stmt-sign div { border-top: 1px dashed #B9C6CF; padding-top: 8px; }
  .cm-stmt-sign b { display: block; color: var(--ink); font-size: 13.5px; }
  @media (max-width: 640px) { .cm-stmt { padding: 18px; } .cm-stmt table { font-size: 13px; } }

  .cm-bva { display: flex; flex-direction: column; gap: 14px; }
  .cm-bva-row { display: grid; grid-template-columns: 26px minmax(0, 1fr); gap: 10px; align-items: start; }
  .cm-bva-row .bi { width: 26px; height: 26px; border-radius: 8px; background: var(--line-2); display: grid; place-items: center; color: var(--navy); }
  .cm-bva-row .bi svg { width: 14px; height: 14px; }
  .cm-bva-top { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; margin-bottom: 6px; }
  .cm-bva-top b { font-variant-numeric: tabular-nums; white-space: nowrap; }
  .cm-bva-top b.over { color: var(--bad); }
  .cm-bva-track { position: relative; height: 8px; border-radius: 99px; background: var(--line-2); }
  .cm-bva-track i { position: absolute; inset-block: 0; inset-inline-start: 0; border-radius: 99px; background: var(--navy); }
  .cm-bva-track i.over { background: var(--bad); }
  .cm-bva-track em { position: absolute; top: -3px; bottom: -3px; width: 2px; background: var(--mint-ink); border-radius: 2px; }

  .cm-reserve { display: flex; gap: 16px; align-items: center; }
  .cm-kv-inline { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 12.5px; color: var(--text-2); }
  .cm-kv-inline b { color: var(--ink); font-weight: 600; }

  .cm-req { display: flex; flex-direction: column; gap: 10px; }
  .cm-req-card { background: #fff; border: 1px solid var(--line); border-radius: var(--r); padding: 16px; display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; gap: 14px; align-items: start; }
  .cm-req-card .li-icon { width: 44px; height: 44px; }
  .cm-req-card h4 { font-size: 15px; line-height: 1.35; }
  .cm-req-card p { font-size: 13px; color: var(--text-2); margin-top: 3px; }
  .cm-req-card .cm-req-act { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
  .cm-req-card.attn { border-color: #F4D9A8; box-shadow: inset 3px 0 0 #E9A23B; }
  html[dir="rtl"] .cm-req-card.attn { box-shadow: inset -3px 0 0 #E9A23B; }
  @media (max-width: 767px) { .cm-req-card { grid-template-columns: 40px minmax(0, 1fr); } .cm-req-card .li-icon { width: 40px; height: 40px; } .cm-req-card .cm-req-act { grid-column: 1 / -1; justify-content: stretch; } .cm-req-card .cm-req-act .btn { flex: 1; } }

  .cm-ann { display: grid; grid-template-columns: 4px minmax(0, 1fr); gap: 16px; padding: 18px 20px; }
  .cm-ann .bar { border-radius: 4px; background: var(--line); }
  .cm-ann.pinned .bar { background: var(--mint); }
  .cm-ann h3 { font-size: 16px; line-height: 1.35; }
  .cm-ann p { font-size: 14px; color: var(--text-2); margin-top: 6px; line-height: 1.6; }
  .cm-ann .cm-ann-f { display: flex; gap: 8px 16px; flex-wrap: wrap; align-items: center; margin-top: 12px; font-size: 12px; color: var(--text-3); }
  .cm-ann .cm-ann-f span { display: inline-flex; gap: 5px; align-items: center; }
  .cm-ann .cm-ann-f svg { width: 14px; height: 14px; }

  .cm-prof-head { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 20px; align-items: center; }
  .cm-prof-head .media { aspect-ratio: 1; border-radius: 18px; }
  @media (max-width: 640px) { .cm-prof-head { grid-template-columns: 72px minmax(0, 1fr); gap: 14px; } .cm-prof-head .media { border-radius: 14px; } .cm-prof-head h2 { font-size: 18px !important; } }
  .cm-auth { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .cm-auth > div { border-radius: 14px; padding: 14px; background: var(--surface-2); border: 1px solid var(--line-2); }
  .cm-auth b { display: block; font-family: var(--font-display); font-size: 18px; font-variant-numeric: tabular-nums; }
  .cm-auth span { font-size: 12.5px; color: var(--text-2); }
  .cm-auth .who { font-size: 11.5px; font-weight: 700; color: var(--mint-ink); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; display: block; }
  html[dir="rtl"] .cm-auth .who { letter-spacing: 0; }
  @media (max-width: 640px) { .cm-auth { grid-template-columns: minmax(0, 1fr); } }

  .cm-deleg { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .cm-deleg .arrow { width: 28px; height: 28px; border-radius: 50%; background: var(--mint-50); color: var(--mint-ink); display: grid; place-items: center; flex: none; }
  .cm-deleg .arrow svg { width: 15px; height: 15px; }
  .cm-who { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .cm-who b { display: block; font-size: 14px; } .cm-who small { display: block; font-size: 12px; color: var(--text-3); }
  .cm-cell { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .cm-cell b { display: block; font-weight: 600; font-size: 14px; white-space: nowrap; }
  .cm-cell small { display: block; font-size: 12px; color: var(--text-3); white-space: nowrap; }
  .cm-calnav { display: flex; align-items: center; gap: 6px; }
  .cm-calhead { flex-wrap: wrap; }
  @media (max-width: 640px) { .cm-calhead .cm-calnav { width: 100%; justify-content: space-between; } }
  .cm-calnav b { min-width: 140px; text-align: center; font-size: 15px; }
  .cm-legend-dots { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12px; color: var(--text-2); margin-top: 12px; }
  .cm-legend-dots span { display: inline-flex; align-items: center; gap: 6px; }
  .cm-legend-dots i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
  .cm-mini-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .cm-mini-stats > div { background: var(--surface-2); border-radius: 12px; padding: 10px 12px; min-width: 0; }
  .cm-mini-stats b { display: block; font-family: var(--font-display); font-size: 18px; font-variant-numeric: tabular-nums; }
  .cm-mini-stats span { font-size: 11.5px; color: var(--text-3); }
  .cm-dstack .donut-wrap { flex-direction: column; align-items: stretch; gap: 18px; } .cm-dstack .donut { align-self: center; }
  .cm-c .line-chart .hz:first-child .tip { left: auto; inset-inline-start: 0; transform: none; }
  .cm-c .line-chart .hz:last-child .tip { left: auto; inset-inline-end: 0; transform: none; }
  html[dir="rtl"] .cm-c .line-chart .hz:first-child .tip, html[dir="rtl"] .cm-c .line-chart .hz:last-child .tip { right: auto; }
  `);

  /* ======================================================================
     Statuses
     ====================================================================== */
  Object.assign(B.statuses, {
    cmPresent: { en: 'Present', ar: 'حاضر', tone: 'ok', icon: 'check' },
    cmProxy: { en: 'By proxy', ar: 'بالوكالة', tone: 'info', icon: 'userCheck' },
    cmAbsent: { en: 'Absent', ar: 'غائب', tone: 'neutral' },
    cmApology: { en: 'Apologised', ar: 'معتذر', tone: 'neutral' },
    cmHolds: { en: 'Holds proxy', ar: 'يحمل وكالة', tone: 'violet', icon: 'userCheck' },
    cmReminded: { en: 'Reminder sent', ar: 'أُرسل تذكير', tone: 'info', icon: 'send' },
    cmGA: { en: 'General assembly', ar: 'هيئة عامة', tone: 'navy', icon: 'users' },
    cmEGA: { en: 'Extraordinary assembly', ar: 'هيئة عامة غير عادية', tone: 'violet', icon: 'gavel' },
    cmCommittee: { en: 'Committee meeting', ar: 'اجتماع اللجنة', tone: 'outline', icon: 'chat' },
    cmQuorum: { en: 'Quorum met', ar: 'النصاب مكتمل', tone: 'ok', icon: 'checkCircle' },
    cmNoQuorum: { en: 'Quorum pending', ar: 'النصاب غير مكتمل', tone: 'warn', icon: 'clock' },
    cmNeedsApproval: { en: 'Needs approval', ar: 'بانتظار الموافقة', tone: 'warn', icon: 'alertCircle' },
  });

  /* ======================================================================
     Demo data (association-specific; consistent with B.data)
     ====================================================================== */
  const bld = D.building(BID);
  const units = D.unitsOf(BID).slice().sort((a, b) => a.floor - b.floor || String(a.number).localeCompare(String(b.number)));
  const totalArea = B.sum(units, (u) => u.area);
  const share = (u) => (u.area / totalArea) * 100;
  const shareStr = (u) => B.num1(Math.round(share(u) * 100) / 100) + '%';
  const unitById = (num) => units.find((u) => u.number === num);
  const unitLbl = (u) => (u ? D.unitLabel(u) : '—');
  const pmon = (d) => { const x = new Date(d + 'T12:00:00'); return x; };

  /* --- service-charge contributions (November 2026, due by month end) --- */
  const ARREARS = { '803': 1, '1004': 1, '1103': 1, '602': 1, '203': 1, '1302': 1, '404': 1, '902': 3, '1303': 2, 'G02': 2 };
  const PARTIAL = { '604': 90 };
  const S = { reminded: {}, paidNow: {} };
  const contrib = units.map((u, i) => {
    const months = ARREARS[u.number] || 0;
    const part = PARTIAL[u.number] || 0;
    return {
      u, id: u.id, number: u.number, owner: u.owner, charge: u.charge,
      months, outstanding: months * u.charge + part,
      paidNov: months ? 0 : part ? u.charge - part : u.charge,
      lastPaid: months ? `2026-${String(11 - months).padStart(2, '0')}-0${(i % 6) + 2}` : `2026-11-${String(2 + ((i * 7) % 22)).padStart(2, '0')}`,
      method: [T('Bank transfer', 'تحويل بنكي'), T('BENA Pay', 'بينا باي'), T('Card', 'بطاقة'), T('Cash — treasurer', 'نقداً — أمين الصندوق')][i % 4],
    };
  });
  const cStatus = (c) => (S.paidNow[c.id] ? 'paid' : c.months >= 2 ? 'overdue' : c.months === 1 ? 'due' : c.outstanding > 0 ? 'partial' : 'paid');
  const cOut = (c) => (S.paidNow[c.id] ? 0 : c.outstanding);

  /* --- budget categories & ledger --- */
  const CATS = [
    { id: 'cleaning', n: T('Cleaning', 'التنظيف'), icon: 'sparkles', budget: 1650, color: '#7FA7C2' },
    { id: 'elevator', n: T('Elevator contract', 'عقد صيانة المصاعد'), icon: 'elevator', budget: 1350, color: '#142B3B' },
    { id: 'electricity', n: T('Common electricity', 'كهرباء المناطق المشتركة'), icon: 'zap', budget: 2600, color: '#F2B35A' },
    { id: 'pumps', n: T('Water pumps', 'مضخات المياه'), icon: 'pump', budget: 650, color: '#5FB7D4' },
    { id: 'diesel', n: T('Generator diesel', 'سولار المولد'), icon: 'generator', budget: 700, color: '#E58A7B' },
    { id: 'security', n: T('Security', 'الأمن والحراسة'), icon: 'shield', budget: 1400, color: '#9B8AE0' },
    { id: 'insurance', n: T('Insurance', 'التأمين'), icon: 'shieldCheck', budget: 410, color: '#C9D6DF' },
    { id: 'reserve', n: T('Reserve fund', 'صندوق الاحتياط'), icon: 'coins', budget: 980, color: '#36D6A0' },
  ];
  const cat = (id) => CATS.find((c) => c.id === id);
  const BUDGET = B.sum(CATS, (c) => c.budget);
  const LEDGER = [
    { id: 'EX-26-1101', date: '2026-11-03', cat: 'cleaning', payee: T('Sparkle Building Care', 'سباركل للعناية بالمباني'), desc: T('Common-area cleaning — November contract', 'تنظيف المناطق المشتركة — عقد تشرين الثاني'), amount: 1650 },
    { id: 'EX-26-1102', date: '2026-11-05', cat: 'elevator', payee: T('LiftLine Elevators', 'لفت لاين للمصاعد'), desc: T('Monthly maintenance contract — 2 cars', 'عقد الصيانة الشهري — مصعدان'), amount: 1350 },
    { id: 'EX-26-1103', date: '2026-11-06', cat: 'electricity', payee: T('Electricity utility', 'شركة الكهرباء'), desc: T('Common-area meter EL-3381-0142 — October bill', 'عداد المناطق المشتركة EL-3381-0142 — فاتورة تشرين الأول'), amount: 2860 },
    { id: 'EX-26-1104', date: '2026-11-08', cat: 'security', payee: T('Guardian Security', 'الحارس للأمن'), desc: T('Night concierge & CCTV monitoring', 'حارس ليلي ومراقبة الكاميرات'), amount: 1400 },
    { id: 'EX-26-1105', date: '2026-11-09', cat: 'diesel', payee: T('Masyoun Fuel Supplies', 'الماصيون لتوريد المحروقات'), desc: T('Diesel 300 L — generator winter top-up', 'سولار 300 لتر — تعبئة المولد الشتوية'), amount: 920 },
    { id: 'EX-26-1106', date: '2026-11-12', cat: 'insurance', payee: T('Demo Insurance Co.', 'شركة التأمين التجريبية'), desc: T('Building & public liability — monthly instalment', 'تأمين المبنى والمسؤولية المدنية — قسط شهري'), amount: 410 },
    { id: 'EX-26-1107', date: '2026-11-14', cat: 'pumps', payee: T('PureTank Water Services', 'بيور تانك لخدمات المياه'), desc: T('Booster pump service & pressure switch', 'صيانة مضخة التعزيز ومفتاح الضغط'), amount: 380 },
    { id: 'EX-26-1108', date: '2026-11-20', cat: 'elevator', payee: T('LiftLine Elevators', 'لفت لاين للمصاعد'), desc: T('Emergency callout — Elevator B (MR-24477)', 'زيارة طارئة — المصعد ب (MR-24477)'), amount: 450 },
    { id: 'EX-26-1109', date: '2026-11-25', cat: 'reserve', payee: T('Association reserve account', 'حساب احتياط الجمعية'), desc: T('Monthly transfer to reserve fund (10%)', 'التحويل الشهري لصندوق الاحتياط (10%)'), amount: 980 },
  ];
  const actualOf = (id) => B.sum(LEDGER.filter((x) => x.cat === id), (x) => x.amount);

  /* --- 12-month history (Dec 2025 → Nov 2026) --- */
  const MONTHS = []; for (let i = 0; i < 12; i++) { const d = new Date(2025, 11 + i, 1); MONTHS.push({ y: d.getFullYear(), m: d.getMonth(), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }); }
  const ELEC = [2720, 2840, 2790, 2600, 2480, 2420, 2410, 2380, 2510, 2650, 2790, 2860];
  const DIESEL = [980, 1120, 1040, 760, 520, 480, 450, 460, 470, 520, 640, 920];
  const INCOME = [9180, 9340, 9420, 9510, 9300, 9660, 9600, 9720, 9480, 9690, 9560, 0];
  const LEVY = [0, 0, 0, 0, 0, 0, 0, 0, 12480, 0, 0, 0];
  const PROJECT = [0, 0, 0, 0, 0, 0, 0, 0, 6200, 5900, 0, 0];
  const monthCats = MONTHS.map((mo, i) => {
    if (i === 11) return CATS.map((c) => ({ id: c.id, v: actualOf(c.id) }));
    const wob = (k) => Math.round(((i * 37 + k * 13) % 9) - 4) * 10;
    return CATS.map((c, k) => ({ id: c.id, v: c.id === 'electricity' ? ELEC[i] : c.id === 'diesel' ? DIESEL[i] : c.id === 'reserve' || c.id === 'insurance' || c.id === 'cleaning' || c.id === 'security' ? c.budget : c.budget + wob(k) }));
  });
  const novCollected = () => B.sum(contrib, (c) => (S.paidNow[c.id] ? c.charge : c.paidNov));
  INCOME[11] = B.sum(contrib, (c) => c.paidNov) + 360; // + arrears collected from earlier months
  const expOf = (i) => B.sum(monthCats[i], (c) => c.v) + PROJECT[i];
  const incOf = (i) => INCOME[i] + LEVY[i];
  const CLOSE_NOV = 18640;
  const RESERVE = 46300;
  const closing = []; closing[11] = CLOSE_NOV;
  for (let i = 11; i > 0; i--) closing[i - 1] = closing[i] - incOf(i) + expOf(i);
  const openingOf = (i) => closing[i] - incOf(i) + expOf(i);

  const fin = () => {
    const charges = B.sum(units, (u) => u.charge);
    const collected = novCollected();
    const outstanding = B.sum(contrib, cOut);
    const novOut = charges - collected;
    const expenses = B.sum(LEDGER, (x) => x.amount);
    const arrearsUnits = contrib.filter((c) => cOut(c) > 0).length;
    return { charges, collected, outstanding, novOut, expenses, arrearsUnits, cash: CLOSE_NOV + B.sum(Object.keys(S.paidNow), (k) => S.paidNow[k]), reserve: RESERVE };
  };

  /* --- meetings, agendas, minutes, resolutions --- */
  const P = (p) => D.pname(p);
  const MEETINGS = [
    { id: 'MT-2612', kind: 'ga', status: 'scheduled', date: '2026-12-04', time: '19:00', place: T('Lobby meeting room, ground floor', 'قاعة الاجتماعات في الردهة، الطابق الأرضي'),
      title: T('General assembly — 2027 budget', 'الهيئة العامة — موازنة 2027'), quorumReq: 50, rsvpShare: 52.3, rsvpUnits: 29, proxies: 6,
      agenda: [[T('Approve minutes of the extraordinary assembly (9 July)', 'المصادقة على محضر الهيئة غير العادية (9 تموز)'), T('Secretary', 'أمين السر')], [T('2027 budget and monthly service charge', 'موازنة 2027 ورسوم الخدمات الشهرية'), T('Treasurer · vote by unit share', 'أمين الصندوق · تصويت حسب الحصص')], [T('Elevator modernisation — three quotes received', 'تحديث المصاعد — استلام ثلاثة عروض'), T('Maintenance member · vote', 'عضو الصيانة · تصويت')], [T('Rooftop solar panels for common-area electricity', 'ألواح شمسية على السطح لكهرباء المناطق المشتركة'), T('Discussion · feasibility study', 'نقاش · دراسة جدوى')], [T('Any other business', 'ما يستجد من أعمال'), T('Open floor', 'باب مفتوح')]],
      docs: [T('Draft 2027 budget.pdf', 'مسودة موازنة 2027.pdf'), T('Elevator modernisation — quote comparison.pdf', 'تحديث المصاعد — مقارنة العروض.pdf'), T('Proxy form (blank).pdf', 'نموذج وكالة (فارغ).pdf')] },
    { id: 'MT-2611', kind: 'committee', status: 'scheduled', date: '2026-11-27', time: '18:30', place: T('Online — BENA meeting room', 'عبر الإنترنت — غرفة اجتماعات بينا'),
      title: T('Monthly committee meeting — November', 'اجتماع اللجنة الشهري — تشرين الثاني'), quorumReq: 60,
      agenda: [[T('Elevator B intermittent stops — LiftLine report', 'توقف المصعد ب المتكرر — تقرير لفت لاين'), T('Mona Daoud', 'منى داود')], [T('Stairwell deep clean after unit 301 works', 'تنظيف عميق للدرج بعد أعمال الوحدة 301'), T('Approve quote', 'الموافقة على العرض')], [T('Arrears follow-up — 3 units with 2+ months', 'متابعة المتأخرات — 3 وحدات بأكثر من شهرين'), T('Hiba Nasser', 'هبة ناصر')], [T('Prepare general assembly pack', 'تحضير ملف الهيئة العامة'), T('Fadi Qassis', 'فادي قسيس')]],
      docs: [T('LiftLine fault report — Elevator B.pdf', 'تقرير عطل لفت لاين — المصعد ب.pdf')] },
    { id: 'MT-2610', kind: 'committee', status: 'completed', date: '2026-10-28', time: '18:30', place: T('Lobby meeting room', 'قاعة الاجتماعات في الردهة'),
      title: T('Monthly committee meeting — October', 'اجتماع اللجنة الشهري — تشرين الأول'), quorumReq: 60,
      attend: { p_samer: 'cmPresent', p_hiba: 'cmPresent', p_fadi: 'cmPresent', p_mona: 'cmPresent', p_adel: 'cmApology' },
      agenda: [[T('September accounts and collection rate', 'حسابات أيلول ونسبة التحصيل'), T('Treasurer', 'أمين الصندوق')], [T('Quarterly rooftop tank cleaning', 'التنظيف الربعي لخزانات السطح'), T('Quote from PureTank', 'عرض من بيور تانك')], [T('Units with arrears of 2+ months', 'الوحدات المتأخرة شهرين فأكثر'), T('Formal reminders', 'إنذارات رسمية')], [T('Elevator modernisation — next steps', 'تحديث المصاعد — الخطوات التالية'), T('Discussion', 'نقاش')]],
      minutes: [T('The chair opened the meeting at 18:35 with four of five members present (quorum met). Adel Shami sent apologies.', 'افتتح الرئيس الاجتماع الساعة 18:35 بحضور أربعة من أصل خمسة أعضاء (النصاب مكتمل). واعتذر عادل شامي.'), T('The treasurer reported a September collection rate of 96.3% and a closing operating balance in line with the budget. The lobby renovation is fully paid.', 'أفادت أمينة الصندوق بأن نسبة التحصيل في أيلول بلغت 96.3% وأن الرصيد التشغيلي الختامي ضمن الموازنة. وتم سداد كامل تكاليف ترميم الردهة.'), T('Members agreed to proceed with the quarterly tank cleaning and to send formal reminders to owners with two or more months outstanding. Three quotes for elevator modernisation will be collected before the general assembly.', 'وافق الأعضاء على المضي في التنظيف الربعي للخزانات وإرسال إنذارات رسمية للمالكين المتأخرين شهرين أو أكثر. وسيتم جمع ثلاثة عروض لتحديث المصاعد قبل الهيئة العامة.')],
      res: [{ id: 'D-26-14', t: T('Approve quarterly tank cleaning with PureTank (₪1,140)', 'الموافقة على التنظيف الربعي للخزانات مع بيور تانك (1,140 ₪)'), mode: 'count', v: [4, 0, 0, 1], st: 'passed' }, { id: 'D-26-15', t: T('Send formal reminders to units with 2+ months of arrears', 'إرسال إنذارات رسمية للوحدات المتأخرة شهرين فأكثر'), mode: 'count', v: [4, 0, 0, 1], st: 'passed' }, { id: 'D-26-16', t: T('Collect three quotes for elevator modernisation', 'جمع ثلاثة عروض لتحديث المصاعد'), mode: 'count', v: [3, 0, 1, 1], st: 'passed' }],
      docs: [T('Minutes — committee meeting 28 Oct 2026.pdf', 'محضر اجتماع اللجنة 28 تشرين الأول 2026.pdf'), T('PureTank quote Q-7781.pdf', 'عرض بيور تانك Q-7781.pdf')] },
    { id: 'MT-2609', kind: 'committee', status: 'completed', date: '2026-09-16', time: '18:30', place: T('Lobby meeting room', 'قاعة الاجتماعات في الردهة'),
      title: T('Monthly committee meeting — September', 'اجتماع اللجنة الشهري — أيلول'), quorumReq: 60,
      attend: { p_samer: 'cmPresent', p_hiba: 'cmPresent', p_fadi: 'cmPresent', p_mona: 'cmPresent', p_adel: 'cmPresent' },
      agenda: [[T('Lobby renovation — final handover', 'ترميم الردهة — التسليم النهائي'), T('Inspection', 'معاينة')], [T('New cleaning contract', 'عقد التنظيف الجديد'), T('Two offers', 'عرضان')]],
      minutes: [T('All five members present. The lobby works were inspected and accepted with two minor snag items.', 'حضر جميع الأعضاء الخمسة. تمت معاينة أعمال الردهة واستلامها مع ملاحظتين بسيطتين.'), T('The committee compared two cleaning offers and selected Sparkle Building Care at ₪1,650 per month for 12 months.', 'قارنت اللجنة عرضين للتنظيف واختارت سباركل للعناية بالمباني بقيمة 1,650 ₪ شهرياً لمدة 12 شهراً.')],
      res: [{ id: 'D-26-11', t: T('Release final payment for lobby works (₪5,900)', 'صرف الدفعة النهائية لأعمال الردهة (5,900 ₪)'), mode: 'count', v: [5, 0, 0, 0], st: 'passed' }, { id: 'D-26-12', t: T('Award 12-month cleaning contract to Sparkle (₪1,650/month)', 'ترسية عقد التنظيف لمدة 12 شهراً على سباركل (1,650 ₪ شهرياً)'), mode: 'count', v: [4, 0, 1, 0], st: 'passed' }],
      docs: [T('Minutes — committee meeting 16 Sep 2026.pdf', 'محضر اجتماع اللجنة 16 أيلول 2026.pdf'), T('Lobby handover report.pdf', 'تقرير تسليم الردهة.pdf')] },
    { id: 'MT-2607', kind: 'ega', status: 'completed', date: '2026-07-09', time: '19:00', place: T('Lobby meeting room', 'قاعة الاجتماعات في الردهة'),
      title: T('Extraordinary assembly — lobby renovation', 'هيئة عامة غير عادية — ترميم الردهة'), quorumReq: 50, present: 87.8, presentUnits: 46, proxyUnits: 7,
      agenda: [[T('Lobby renovation scope and contractor', 'نطاق ترميم الردهة والمقاول'), T('Vote by unit share — ⅔ of shares present', 'تصويت حسب الحصص — ثلثا الحصص الحاضرة')], [T('Special levy of ₪240 per apartment', 'مساهمة خاصة 240 ₪ لكل شقة'), T('Vote', 'تصويت')], [T('Replace the CCTV system now (₪18,500)', 'استبدال نظام الكاميرات الآن (18,500 ₪)'), T('Vote', 'تصويت')]],
      minutes: [T('The assembly opened at 19:10 with owners of 46 units present in person or by proxy, representing 87.8% of unit shares. Quorum was declared.', 'افتتحت الهيئة الساعة 19:10 بحضور مالكي 46 وحدة شخصياً أو بالوكالة يمثلون 87.8% من الحصص. وأُعلن اكتمال النصاب.'), T('After discussion, the renovation and the special levy were approved. The CCTV replacement did not reach the required majority and was deferred to the 2027 budget.', 'بعد النقاش، تمت الموافقة على الترميم والمساهمة الخاصة. ولم يحصل استبدال الكاميرات على الأغلبية المطلوبة وتم تأجيله إلى موازنة 2027.')],
      res: [{ id: 'R-26-04', t: T('Renovate the lobby (₪12,100) — contractor: Bait Fix', 'ترميم الردهة (12,100 ₪) — المقاول: بيت فيكس'), mode: 'share', v: [68.3, 14.9, 4.6, 12.2], thr: 66.7, st: 'passed' }, { id: 'R-26-05', t: T('Special levy of ₪240 per apartment', 'مساهمة خاصة 240 ₪ لكل شقة'), mode: 'share', v: [64.1, 17.8, 5.9, 12.2], thr: 50, st: 'passed' }, { id: 'R-26-06', t: T('Replace the CCTV system now (₪18,500)', 'استبدال نظام الكاميرات الآن (18,500 ₪)'), mode: 'share', v: [31.0, 49.2, 7.6, 12.2], thr: 50, st: 'failed' }],
      docs: [T('Minutes — extraordinary assembly 9 Jul 2026.pdf', 'محضر الهيئة غير العادية 9 تموز 2026.pdf'), T('Lobby renovation drawings.pdf', 'مخططات ترميم الردهة.pdf'), T('Attendance & proxy register.pdf', 'سجل الحضور والوكالات.pdf')] },
    { id: 'MT-2603', kind: 'ga', status: 'completed', date: '2026-03-02', time: '19:00', place: T('Lobby meeting room', 'قاعة الاجتماعات في الردهة'),
      title: T('Annual general assembly 2026', 'الهيئة العامة السنوية 2026'), quorumReq: 50, present: 88.8, presentUnits: 47, proxyUnits: 9,
      agenda: [[T('2025 audited accounts', 'الحسابات المدققة لعام 2025'), T('Auditor report', 'تقرير المدقق')], [T('Elect a committee member (vacant seat)', 'انتخاب عضو لجنة (مقعد شاغر)'), T('Two candidates', 'مرشحان')], [T('2026 budget and ₪180 monthly charge', 'موازنة 2026 ورسوم شهرية 180 ₪'), T('Vote', 'تصويت')]],
      minutes: [T('Owners of 47 units attended (88.8% of shares, 9 by proxy). The auditor presented the 2025 accounts with no material findings.', 'حضر مالكو 47 وحدة (88.8% من الحصص، 9 بالوكالة). وعرض المدقق حسابات 2025 دون ملاحظات جوهرية.'), T('Adel Shami (unit 904) was elected to the vacant committee seat. The 2026 budget and the monthly charge of ₪180 per apartment were approved.', 'تم انتخاب عادل شامي (الوحدة 904) للمقعد الشاغر في اللجنة. وتمت الموافقة على موازنة 2026 والرسوم الشهرية 180 ₪ لكل شقة.')],
      res: [{ id: 'R-26-01', t: T('Approve the 2025 audited accounts', 'المصادقة على الحسابات المدققة لعام 2025'), mode: 'share', v: [78.2, 4.1, 6.5, 11.2], thr: 50, st: 'passed' }, { id: 'R-26-02', t: T('Elect Adel Shami to the committee', 'انتخاب عادل شامي عضواً في اللجنة'), mode: 'share', v: [64.0, 12.3, 12.5, 11.2], thr: 50, st: 'passed' }, { id: 'R-26-03', t: T('2026 budget and ₪180 monthly service charge', 'موازنة 2026 ورسوم خدمات شهرية 180 ₪'), mode: 'share', v: [70.6, 15.0, 3.2, 11.2], thr: 50, st: 'passed' }],
      docs: [T('Minutes — annual general assembly 2026.pdf', 'محضر الهيئة العامة السنوية 2026.pdf'), T('Audited accounts 2025.pdf', 'الحسابات المدققة 2025.pdf')] },
  ];
  const meeting = (id) => MEETINGS.find((m) => m.id === id);
  const kindStatus = (k) => (k === 'ga' ? 'cmGA' : k === 'ega' ? 'cmEGA' : 'cmCommittee');
  const upcoming = () => MEETINGS.filter((m) => m.status === 'scheduled').sort(B.by('date'));

  /* --- delegations --- */
  const DELEG = [
    { from: 'p_khaled', to: 'p_adel', units: ['1102', '803'], scope: T('General assemblies — all agenda items', 'الهيئات العامة — جميع بنود جدول الأعمال'), from_d: '2026-03-02', until: '2027-03-01', status: 'active' },
  ];
  const DOCS = [
    { name: T('Association bylaws (2018, amended 2025).pdf', 'النظام الداخلي للجمعية (2018، معدّل 2025).pdf'), date: '2025-01-15', size: '640 KB', icon: 'doc' },
    { name: T('Registration certificate OA-RAM-2018-0217.pdf', 'شهادة التسجيل OA-RAM-2018-0217.pdf'), date: '2018-04-12', size: '310 KB', icon: 'badgeCheck', tone: 'mint' },
    { name: T('Minutes appointing the 2025–2027 committee.pdf', 'محضر تعيين لجنة 2025–2027.pdf'), date: '2025-01-15', size: '420 KB', icon: 'gavel' },
    { name: T('Bank mandate — dual signatories.pdf', 'تفويض البنك — توقيع مزدوج.pdf'), date: '2025-02-03', size: '190 KB', icon: 'banknote' },
    { name: T('Proxy — Khaled Mansour to Adel Shami.pdf', 'وكالة — خالد منصور إلى عادل شامي.pdf'), date: '2026-03-02', size: '150 KB', icon: 'userCheck', tone: 'violet' },
    { name: T('Building insurance policy 2026.pdf', 'بوليصة تأمين المبنى 2026.pdf'), date: '2026-01-01', size: '880 KB', icon: 'shieldCheck' },
  ];
  const RESP = {
    p_samer: T('Chairs meetings, signs contracts, represents the association before the municipality', 'يرأس الاجتماعات، يوقّع العقود، يمثّل الجمعية أمام البلدية'),
    p_hiba: T('Collections, bank account, monthly statements', 'التحصيل، الحساب البنكي، الكشوفات الشهرية'),
    p_fadi: T('Notices, minutes, owners\' register', 'الإشعارات، المحاضر، سجل المالكين'),
    p_mona: T('Contractors, inspections, maintenance approvals', 'المقاولون، الكشوفات، الموافقة على الصيانة'),
    p_adel: T('Community, recycling and lobby', 'المجتمع، إعادة التدوير والردهة'),
  };

  /* ======================================================================
     Helpers
     ====================================================================== */
  const sec = (title, extra = '') => `<div class="section-title"><h2>${title}</h2>${extra}</div>`;
  const dateTile = (d, cls = '') => { const x = pmon(d); return `<span class="cm-dt ${cls}"><small>${B.mon(x.getMonth())}</small><b>${x.getDate()}</b></span>`; };
  const pct = (a, b) => (b ? (a / b) * 100 : 0);
  const reqOpen = (q) => !['completed', 'cancelled', 'resolved'].includes(q.status);
  const needsApproval = (q) => q.status === 'open' || q.status === 'quoted';
  const prov = (id) => (id ? D.provider(id) : null);
  const VOTE_C = ['#36D6A0', '#E58A7B', '#F2B35A', '#D5DEDA'];
  const VOTE_L = () => [L('For', 'مع'), L('Against', 'ضد'), L('Abstain', 'امتناع'), L('Absent', 'غائب')];

  const voteBar = (r) => {
    const tot = B.sum(r.v);
    const parts = r.v.map((v, i) => `<i style="width:${pct(v, tot)}%;background:${VOTE_C[i]}" title="${esc(VOTE_L()[i])}"></i>`).join('');
    const fmt = (v) => (r.mode === 'share' ? B.num1(v) + '%' : B.num(v));
    return `<div class="cm-vote"><div class="cm-vote-bar ${r.thr ? 'cm-thr' : ''}" style="${r.thr ? `--thr:${r.thr}%` : ''}">${parts}</div>
      <div class="cm-vote-l">${r.v.map((v, i) => `<span><i style="background:${VOTE_C[i]}"></i>${VOTE_L()[i]} <b>${fmt(v)}</b></span>`).join('')}
      ${r.thr ? `<span class="faint">▏${L(`Threshold ${B.num1(r.thr)}% of shares`, `العتبة ${B.num1(r.thr)}% من الحصص`)}</span>` : `<span class="faint">${L('Members\' votes', 'أصوات الأعضاء')}</span>`}</div></div>`;
  };

  /* ======================================================================
     Pages
     ====================================================================== */

  /* ---------------- Dashboard ---------------- */
  function home() {
    const f = fin();
    const reqs = D.requestsOf(BID).filter(reqOpen).sort((a, b) => (needsApproval(b) - needsApproval(a)) || ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]));
    const ups = upcoming();
    const next = ups[0];
    const anns = D.announcementsOf(BID).slice().sort(B.by('date', -1)).slice(0, 2);
    const collPct = pct(f.collected, f.charges);
    const overBudget = f.expenses > BUDGET;
    const attn = [];
    const appr = D.requestsOf(BID).filter(needsApproval);
    if (appr.length) attn.push(ui.li({ icon: 'clipboard', tone: 'warn', title: L(`${appr.length} maintenance request${appr.length > 1 ? 's' : ''} awaiting approval`, `${appr.length} طلب صيانة بانتظار الموافقة`), sub: tx(appr[0].title), go: `${R}-maintenance` }));
    const over2 = contrib.filter((c) => cOut(c) > 0 && c.months >= 2);
    if (over2.length) attn.push(ui.li({ icon: 'alertCircle', tone: 'bad', title: L(`${over2.length} units with 2+ months of arrears`, `${over2.length} وحدات متأخرة شهرين فأكثر`), sub: over2.map((c) => c.number).join(' · ') + ' — ' + B.money(B.sum(over2, cOut)), go: `${R}-finance` }));
    const elev = D.requestsOf(BID).find((q) => q.id === 'MR-24477' && reqOpen(q));
    if (elev) attn.push(ui.li({ icon: 'elevator', tone: 'info', title: L('Elevator B — LiftLine visit today', 'المصعد ب — زيارة لفت لاين اليوم'), sub: L('High priority · reported by 6 residents', 'أولوية عالية · أبلغ عنه 6 سكان'), go: `${R}-maintenance` }));

    return `
    <section class="cm-hero">
      <div>
        <div class="row-sm wrap">${ui.status('legal')}${ui.idMono(BID)}</div>
        <h1>${L('Good morning, Samer', 'صباح الخير يا سامر')}</h1>
        <p class="cm-org">${tx(C.name)} · ${L('Chair', 'الرئيس')}</p>
        ${next ? `<button class="cm-next" data-go="${R}-meeting-${next.id}">${dateTile(next.date, next.kind === 'ga' ? 'ga' : '')}<span class="cm-nt" style="min-width:0"><small>${L('Next meeting', 'الاجتماع القادم')} · ${B.inDays(next.date)}</small><b class="truncate" style="display:block">${tx(next.title)}</b><small>${next.time} · ${tx(next.place)}</small></span>${icon('chevR', 'chev flip')}</button>` : ''}
      </div>
      <div class="cm-fin">
        <div class="cm-bal-l"><span>${L('Operating cash balance', 'الرصيد النقدي التشغيلي')}</span><button class="btn btn-sm" style="background:rgba(255,255,255,.08);color:#fff" data-go="${R}-statement-2026-11">${icon('receipt')}<span>${L('Statement', 'الكشف')}</span></button></div>
        <div><div class="cm-bal">${B.money(f.cash)}</div><div class="cm-bal-sub">${L('Reserve fund', 'صندوق الاحتياط')} <b>${B.money(f.reserve)}</b> · ${L('as of 25 Nov', 'حتى 25 ت٢')}</div></div>
        <div>
          <div class="cm-split"><i style="width:${collPct}%;background:var(--mint)"></i><i style="width:${100 - collPct}%;background:#E9A23B"></i></div>
          <div class="cm-split-l"><span><i style="background:var(--mint)"></i>${L('Collected', 'محصّل')} <b>${B.money(f.collected)}</b> <span>(${B.pct(collPct)})</span></span><span><i style="background:#E9A23B"></i>${L('Outstanding (Nov)', 'غير محصّل (ت٢)')} <b>${B.money(f.novOut)}</b></span></div>
        </div>
        <div class="cm-hstats">
          <div><b>${B.money(f.charges)}</b><span>${L('Monthly charges', 'الرسوم الشهرية')}</span></div>
          <div><b class="${overBudget ? 'over' : ''}">${B.money(f.expenses)}</b><span>${L('Expenses this month', 'مصاريف هذا الشهر')}</span></div>
          <div><b>${B.money(f.outstanding)}</b><span>${L(`Total arrears · ${f.arrearsUnits} units`, `إجمالي المتأخرات · ${f.arrearsUnits} وحدة`)}</span></div>
        </div>
      </div>
    </section>

    <div class="quick cm-quick">
      <button class="qa" data-act="cmNewMeeting"><span class="qi">${icon('calendar')}</span><span>${L('New meeting', 'اجتماع جديد')}</span></button>
      <button class="qa" data-act="cmCompose"><span class="qi">${icon('megaphone')}</span><span>${L('Announce', 'إعلان')}</span></button>
      <button class="qa" data-act="cmRemindAll"><span class="qi">${icon('send')}</span><span>${L('Remind dues', 'تذكير بالمستحقات')}</span></button>
      <button class="qa" data-go="${R}-services"><span class="qi">${icon('handshake')}</span><span>${L('Find provider', 'ابحث عن مزوّد')}</span></button>
      <button class="qa" data-go="${R}-building-${BID}"><span class="qi">${icon('building')}</span><span>${L('Building profile', 'ملف المبنى')}</span></button>
    </div>

    <div class="grid g-main">
      <div class="stack">
        ${attn.length ? `<section>${sec(L('Needs your attention', 'بحاجة لانتباهك'))}<div class="list cm-attn">${attn.join('')}</div></section>` : ''}
        ${ui.card({ title: L('Active maintenance', 'الصيانة الجارية'), sub: L(`${reqs.length} open requests in the building`, `${reqs.length} طلبات مفتوحة في المبنى`), link: { label: L('All requests', 'كل الطلبات'), go: `${R}-maintenance` },
          body: ui.list(reqs.slice(0, 5).map((q) => ui.li({ icon: D.cat(q.cat).icon, tone: q.priority === 'high' ? 'bad' : q.scope === 'common' ? 'navy' : '', title: tx(q.title), sub: `${ui.idMono(q.id)} · ${q.scope === 'common' ? L('Common area', 'منطقة مشتركة') : L('Unit ', 'الوحدة ') + (D.unit(q.unit)?.number || '')}${q.provider ? ' · ' + tx(prov(q.provider).name) : ''}`, end: needsApproval(q) ? ui.status('cmNeedsApproval') : ui.status(q.status), act: 'cmReq', arg: q.id }))) })}
        ${ui.card({ title: L('Common expenses', 'المصاريف المشتركة'), sub: L('Last 6 months · November to date', 'آخر 6 أشهر · تشرين الثاني حتى تاريخه'), link: { label: L('Finances', 'المالية'), go: `${R}-finance` },
          body: B.charts.bars({ data: MONTHS.slice(6).map((m, i) => ({ label: B.mon(m.m), value: expOf(i + 6), color: i === 5 ? '#36D6A0' : '#142B3B' })), height: 170, showValues: true, format: (v) => B.compact(v) }) + `<div class="cm-kv-inline" style="margin-top:12px"><span>${L('Monthly budget', 'الموازنة الشهرية')} <b>${B.money(BUDGET)}</b></span><span>${L('Aug–Sep include the lobby renovation', 'آب–أيلول تشمل ترميم الردهة')}</span></div>` })}
      </div>
      <div class="stack">
        ${ui.card({ title: L('Upcoming meetings', 'الاجتماعات القادمة'), link: { label: L('Calendar', 'التقويم'), go: `${R}-meetings` },
          body: ui.list(ups.map((m) => ui.li({ lead: dateTile(m.date, m.kind === 'ga' ? 'ga' : ''), title: tx(m.title), sub: `${m.time} · ${B.inDays(m.date)}${m.kind === 'ga' ? ' · ' + L(`${m.rsvpUnits} units confirmed`, `${m.rsvpUnits} وحدة أكدت الحضور`) : ''}`, go: `${R}-meeting-${m.id}` }))),
          foot: ui.btn(L('Schedule a meeting', 'جدولة اجتماع'), { icon: 'plus', kind: 'soft', size: 'sm', act: 'cmNewMeeting' }) })}
        ${ui.card({ title: L('Committee members', 'أعضاء اللجنة'), sub: L('Term 2025 – 2027', 'الدورة 2025 – 2027'), link: { label: L('Members', 'الأعضاء'), go: `${R}-members` },
          body: ui.list(C.members.map((m) => ui.li({ avatar: D.person(m.p).name, title: P(m.p) + (m.p === 'p_samer' ? ` <span class="faint xs">· ${L('you', 'أنت')}</span>` : ''), sub: tx(m.role) + (m.delegated ? ` · ${L('holds proxy', 'يحمل وكالة')}` : ''), end: m.unit ? `<span class="xs faint">${L('Unit', 'وحدة')} ${D.unit(m.unit)?.number}</span>` : '' }))) })}
        ${ui.card({ title: L('Post an announcement', 'نشر إعلان'), sub: L('Goes to all 54 units in the BENA resident app', 'يصل إلى جميع الوحدات الـ 54 في تطبيق السكان'), cls: 'cm-post',
          body: `<textarea class="textarea" id="cm-quick" placeholder="${esc(L('e.g. Elevator B will be out of service on Wednesday 10:00–12:00 for repairs.', 'مثال: سيتوقف المصعد ب يوم الأربعاء 10:00–12:00 للصيانة.'))}"></textarea>
            <div class="cm-post-f"><button class="btn btn-text btn-sm" data-act="cmCompose">${icon('sliders')}${L('More options', 'خيارات أكثر')}</button>${ui.btn(L('Post now', 'انشر الآن'), { icon: 'send', kind: 'primary', size: 'sm', act: 'cmQuickPost' })}</div>
            <div class="divider" style="margin:16px 0 6px"></div>${ui.list(anns.map((a) => ui.li({ icon: a.pinned ? 'flag' : 'megaphone', tone: a.pinned ? 'mint' : '', title: tx(a.title), sub: B.ago(a.date), go: `${R}-announcements` })))}` })}
      </div>
    </div>`;
  }

  /* ---------------- Committee profile & governance types ---------------- */
  const GOV = {
    legal: { c: 'c_masyoun', k: 'legal', icon: 'badgeCheck', short: T('Legal association', 'جمعية قانونية'), kind: T('Legally documented owners\' association', 'جمعية مالكين موثّقة قانونياً'), d: T('Registered entity with bylaws, elected committee and a bank account. Decisions bind all owners.', 'كيان مسجّل له نظام داخلي ولجنة منتخبة وحساب بنكي. قراراته ملزمة لجميع المالكين.') },
    informal: { c: 'c_tireh', k: 'informal', icon: 'users', short: T('Informal committee', 'لجنة غير رسمية'), kind: T('Informal building committee', 'لجنة مبنى غير رسمية'), d: T('Volunteer residents agreed in a building meeting. Coordinates services; contributions are voluntary.', 'سكان متطوعون باتفاق في اجتماع المبنى. تنسّق الخدمات والمساهمات طوعية.') },
    authorized: { c: 'c_einmunjed', k: 'authorized', icon: 'key', short: T('Authorized manager', 'مدير مفوّض'), kind: T('Authorized building manager', 'مدير مبنى مفوّض'), d: T('An individual acting under a power of attorney from a majority of owners, within its stated scope.', 'شخص يعمل بموجب وكالة من أغلبية المالكين وضمن النطاق المحدد فيها.') },
  };
  const CAPS = [
    [T('Legal standing / can be sued', 'شخصية اعتبارية / أهلية التقاضي'), 'y', 'n', 'p'],
    [T('Open a bank account in its name', 'فتح حساب بنكي باسمها'), 'y', 'n', 'n'],
    [T('Mandatory service charges', 'رسوم خدمات إلزامية'), 'y', 'n', 'p'],
    [T('Sign service contracts', 'توقيع عقود الخدمات'), 'y', 'p', 'y'],
    [T('Binding votes by unit share', 'تصويت ملزم حسب الحصص'), 'y', 'n', 'n'],
    [T('Represent owners before the municipality', 'تمثيل المالكين أمام البلدية'), 'y', 'p', 'p'],
    [T('Post announcements on BENA', 'نشر الإعلانات على بينا'), 'y', 'y', 'y'],
  ];
  const govCard = (key, sel) => {
    const g = GOV[key];
    const c = D.committees[g.c];
    const b = D.building(c.building);
    const lead = c.members[0];
    return `<button class="cm-gov ${key} ${sel ? 'sel' : ''}" data-act="set" data-arg="cm:gov=${key}">
      <span class="cm-seal">${icon(g.icon)}</span>
      <div class="cm-gov-head"><div class="cm-gov-k">${tx(g.short)}</div><h4 style="margin-top:8px">${tx(c.name)}</h4></div>
      <p>${tx(g.d)}</p>
      <div class="cm-gov-meta">
        <span>${L('Building', 'المبنى')}: <b>${tx(b.name)}</b></span>
        <span>${L('Basis', 'الأساس')}: <b>${tx(c.basis)}</b></span>
        <span>${c.regNo ? `${L('Registration', 'رقم التسجيل')}: ${ui.idMono(c.regNo)}` : `${L('Lead', 'المسؤول')}: <b>${P(lead.p)}</b> · ${tx(lead.role)}`}</span>
      </div>
    </button>`;
  };
  function profile() {
    const gsel = B.get('cm:gov', 'legal');
    const g = GOV[gsel];
    const gc = D.committees[g.c];
    const col = { legal: 1, informal: 2, authorized: 3 }[gsel];
    const capIcon = (v) => (v === 'y' ? `<span class="y" title="${esc(L('Yes', 'نعم'))}">${icon('checkCircle')}</span>` : v === 'p' ? `<span class="p" title="${esc(L('Limited', 'محدود'))}">${icon('minus')}</span>` : `<span class="n" title="${esc(L('No', 'لا'))}">${icon('xCircle')}</span>`);
    const capGrid = `<div class="cm-cap" role="table"><div class="h">${L('Capability', 'الصلاحية')}</div>${['legal', 'informal', 'authorized'].map((k, i) => `<div class="h ${col === i + 1 ? 'c on' : ''}">${{ legal: L('Legal assoc.', 'جمعية قانونية'), informal: L('Informal', 'غير رسمية'), authorized: L('Authorized', 'مفوّض') }[k]}</div>`).join('')}
      ${CAPS.map((r) => `<div>${tx(r[0])}</div>${[1, 2, 3].map((i) => `<div class="c ${col === i ? 'on' : ''}">${capIcon(r[i])}</div>`).join('')}`).join('')}</div>`;

    return `${ui.pageHead({ eyebrow: L('Association', 'الجمعية'), title: L('Committee profile', 'ملف اللجنة'), sub: L('Legal status, mandate, members and delegated authority of the association that governs this building.', 'الوضع القانوني والتفويض والأعضاء والصلاحيات المفوّضة للجمعية التي تدير هذا المبنى.'),
      actions: ui.btn(L('Edit profile', 'تعديل الملف'), { icon: 'edit', act: 'soon', arg: L('Editing the profile', 'تعديل الملف') }) + ui.btn(L('Building profile', 'ملف المبنى'), { icon: 'building', kind: 'dark', go: `${R}-building-${BID}` }) })}

    <div class="grid g-main">
      <div class="stack">
        <section class="card">
          <div class="cm-prof-head">
            <div class="media">${B.art.facade(142, { type: 'residential', floors: 14 })}</div>
            <div class="stack-sm" style="min-width:0">
              <div class="row-sm wrap">${ui.status('legal', 'lg')}${ui.status('verified')}</div>
              <h2 style="font-size:22px">${tx(C.name)}</h2>
              <div class="muted small">${tx(C.basis)}</div>
            </div>
          </div>
          <div class="divider" style="margin:18px 0"></div>
          ${ui.kvGrid([[L('Type', 'النوع'), L('Owners\' association', 'جمعية مالكين')], [L('Registration no.', 'رقم التسجيل'), ui.idMono(C.regNo)], [L('Formed', 'تاريخ التأسيس'), B.date(C.formed)], [L('Current term', 'الدورة الحالية'), tx(C.term)], [L('Building', 'المبنى'), `<button class="link-btn mint-ink" data-go="${R}-building-${BID}" style="font-weight:600;text-align:start">${tx(bld.name)}</button>`], [L('BENA ID', 'رقم بينا'), ui.idMono(BID)], [L('Units represented', 'الوحدات الممثلة'), L(`${units.length} of ${units.length}`, `${units.length} من ${units.length}`)], [L('Bank account', 'الحساب البنكي'), tx(C.bank)], [L('Monthly charge', 'الرسوم الشهرية'), `${B.money(C.monthly)} ${L('/ apartment', '/ شقة')}`], [L('Property manager', 'شركة الإدارة'), tx(D.org(bld.manager).name)]])}
        </section>

        ${ui.card({ title: L('Delegated authority', 'الصلاحيات المفوّضة'), sub: L('Spending and signing limits set by the general assembly (bylaws art. 14)', 'حدود الصرف والتوقيع المحددة من الهيئة العامة (النظام الداخلي م 14)'),
          body: `<div class="cm-auth">
            <div><span class="who">${L('Chair alone', 'الرئيس منفرداً')}</span><b>≤ ${B.money(3000)}</b><span>${L('Routine repairs and emergency callouts', 'الإصلاحات الروتينية والزيارات الطارئة')}</span></div>
            <div><span class="who">${L('Chair + treasurer', 'الرئيس + أمين الصندوق')}</span><b>≤ ${B.money(15000)}</b><span>${L('Service contracts, planned works', 'عقود الخدمات والأعمال المخططة')}</span></div>
            <div><span class="who">${L('General assembly', 'الهيئة العامة')}</span><b>&gt; ${B.money(15000)}</b><span>${L('Major works, special levies, budget', 'الأعمال الكبرى والمساهمات الخاصة والموازنة')}</span></div>
          </div>` + `<div style="margin-top:14px">${ui.callout(L('Payments above ₪3,000 require two signatures from the chair, treasurer or secretary.', 'تتطلب الدفعات التي تزيد عن 3,000 ₪ توقيعين من الرئيس أو أمين الصندوق أو أمين السر.'), 'mint', 'shieldCheck')}</div>` })}

        <section>
          ${sec(L('Governance types on BENA', 'أنواع الحوكمة على بينا'), `<span class="xs faint">${L('Tap a card to compare', 'اضغط على بطاقة للمقارنة')}</span>`)}
          <div class="cm-gov-grid">${['legal', 'informal', 'authorized'].map((k) => govCard(k, k === gsel)).join('')}</div>
          <div class="card" style="margin-top:14px">
            <div class="card-head"><div class="grow"><h3>${L('What each type can do', 'ما يمكن لكل نوع فعله')}</h3><div class="sub">${L('Previewing', 'معاينة')}: ${tx(gc.name)} · ${ui.status(g.k)}</div></div></div>
            ${capGrid}
            <div class="cm-legend-dots cm-cap-l"><span style="color:var(--ok)">${icon('checkCircle')}<em>${L('Yes', 'نعم')}</em></span><span style="color:var(--warn)">${icon('minus')}<em>${L('Limited / within mandate', 'محدود / ضمن التفويض')}</em></span><span style="color:#B5C0C8">${icon('xCircle')}<em>${L('Not available', 'غير متاح')}</em></span></div>
          </div>
        </section>
      </div>

      <div class="stack">
        ${ui.card({ title: L('Committee members', 'أعضاء اللجنة'), sub: L(`Elected ${B.date('2025-01-15')}`, `انتُخبت في ${B.date('2025-01-15')}`), link: { label: L('Manage', 'إدارة'), go: `${R}-members` },
          body: `<div class="stack">${C.members.map((m) => `<div class="cm-who">${ui.avatar(D.person(m.p).name)}<div class="grow" style="min-width:0"><div class="row-sm wrap"><b>${P(m.p)}</b><span class="cm-role-tag ${m.p === 'p_samer' ? 'chair' : ''}">${tx(m.role)}</span></div><small>${tx(RESP[m.p] || m.auth)}</small><small>${L('Since', 'منذ')} ${B.date(m.since)} · ${L('Unit', 'وحدة')} ${D.unit(m.unit)?.number || '—'}</small></div></div>`).join('')}</div>` })}
        ${ui.card({ title: L('Supporting documents', 'المستندات الداعمة'), sub: L('Visible to owners and the municipality on request', 'متاحة للمالكين وللبلدية عند الطلب'),
          body: ui.list(DOCS.map((d) => ui.doc({ name: tx(d.name), icon: d.icon, tone: d.tone, date: d.date, size: d.size }))), foot: ui.btn(L('Upload document', 'رفع مستند'), { icon: 'upload', size: 'sm', act: 'cmUpload' }) })}
        ${ui.card({ title: L('Active delegations', 'الوكالات السارية'), body: DELEG.map((d) => `<div class="cm-deleg">${ui.avatar(D.person(d.from).name, 'sm')}<b class="small">${P(d.from)}</b><span class="arrow">${icon('arrowRight', 'flip')}</span>${ui.avatar(D.person(d.to).name, 'sm')}<b class="small">${P(d.to)}</b></div><div class="xs muted" style="margin-top:8px">${tx(d.scope)} · ${L('Units', 'الوحدات')} ${d.units.join(', ')} · ${L('until', 'حتى')} ${B.date(d.until)}</div>`).join(''), link: { label: L('Details', 'التفاصيل'), go: `${R}-members` } })}
      </div>
    </div>`;
  }

  /* ---------------- Meetings & decisions ---------------- */
  function meetings() {
    const cm = B.get('cm:calM', 10); // month index in 2026 (0-based)
    const year = 2026 + Math.floor(cm / 12), month = ((cm % 12) + 12) % 12;
    const events = [];
    MEETINGS.forEach((m) => events.push({ date: m.date, label: `${m.time} ${tx(m.title)}`, tone: m.kind === 'ga' || m.kind === 'ega' ? '' : 'mint', act: 'go', arg: `${R}-meeting-${m.id}` }));
    D.requestsOf(BID).filter((q) => q.visit).forEach((q) => events.push({ date: q.visit, label: `${L('Visit', 'زيارة')}: ${tx(q.title)}`, tone: 'info', act: 'cmReq', arg: q.id }));
    [['2026-11-30', L('Service charges due', 'استحقاق رسوم الخدمات')], ['2026-12-31', L('Service charges due', 'استحقاق رسوم الخدمات')], ['2026-10-31', L('Service charges due', 'استحقاق رسوم الخدمات')]].forEach(([d, l]) => events.push({ date: d, label: l, tone: 'warn', act: 'go', arg: `${R}-finance` }));
    const past = MEETINGS.filter((m) => m.status === 'completed').sort(B.by('date', -1));
    const allRes = past.flatMap((m) => (m.res || []).map((r) => ({ ...r, m })));
    const ups = upcoming();
    return `${ui.pageHead({ eyebrow: L('Governance', 'الحوكمة'), title: L('Meetings & decisions', 'الاجتماعات والقرارات'), sub: L('Plan assemblies and committee meetings, record attendance and minutes, and keep a register of resolutions.', 'خطّط للهيئات العامة واجتماعات اللجنة، وسجّل الحضور والمحاضر، واحتفظ بسجل القرارات.'),
      actions: ui.btn(L('Resolutions register', 'سجل القرارات'), { icon: 'gavel', act: 'cmResRegister' }) + ui.btn(L('New meeting', 'اجتماع جديد'), { icon: 'plus', kind: 'primary', act: 'cmNewMeeting' }) })}
    <div class="grid g-main">
      <div class="stack">
        <section class="card">
          <div class="card-head cm-calhead"><div class="grow"><h3>${L('Meeting calendar', 'تقويم الاجتماعات')}</h3><div class="sub">${L('Meetings, contractor visits and payment deadlines', 'الاجتماعات وزيارات المقاولين ومواعيد الدفع')}</div></div>
            <div class="cm-calnav">${ui.btn('', { icon: 'chevL', iconCls: 'flip', size: 'sm', act: 'set', arg: `cm:calM=${cm - 1}`, title: L('Previous month', 'الشهر السابق') })}<b>${B.monLong(month)} ${year}</b>${ui.btn('', { icon: 'chevR', iconCls: 'flip', size: 'sm', act: 'set', arg: `cm:calM=${cm + 1}`, title: L('Next month', 'الشهر التالي') })}</div></div>
          ${ui.calendar({ year, month, events })}
          <div class="cm-legend-dots"><span><i style="background:var(--navy)"></i>${L('General assembly', 'هيئة عامة')}</span><span><i style="background:var(--mint)"></i>${L('Committee meeting', 'اجتماع اللجنة')}</span><span><i style="background:#BBD0F5"></i>${L('Contractor visit', 'زيارة مقاول')}</span><span><i style="background:#F2C27A"></i>${L('Payment deadline', 'موعد الدفع')}</span></div>
        </section>
        <section>
          ${sec(L('Past meetings', 'الاجتماعات السابقة'))}
          ${ui.table({ id: 'cm-past', rows: past, rowGo: (m) => `${R}-meeting-${m.id}`, cols: [
            { key: 'date', label: L('Date', 'التاريخ'), sort: true, render: (m) => `<div class="cm-cell">${dateTile(m.date, (m.kind === 'ga' || m.kind === 'ega' ? 'ga ' : '') + 'past')}<div style="min-width:0"><b class="truncate" style="max-width:300px">${tx(m.title)}</b><small>${ui.idMono(m.id)} · ${ui.statusLabel(kindStatus(m.kind))}</small></div></div>`, mRender: (m) => tx(m.title), m: 'title' },
            { key: 'att', label: L('Attendance', 'الحضور'), render: (m) => `<span class="nowrap">${m.present ? `${B.num1(m.present)}% ${L('of shares', 'من الحصص')}` : `${Object.values(m.attend || {}).filter((v) => v !== 'cmApology' && v !== 'cmAbsent').length}/${C.members.length} ${L('members', 'أعضاء')}`}</span>`, m: 'sub' },
            { key: 'res', label: L('Resolutions', 'القرارات'), align: 'end', render: (m) => `<span class="nowrap">${(m.res || []).filter((r) => r.st === 'passed').length} ${L('passed', 'أُقرّ')}${(m.res || []).some((r) => r.st === 'failed') ? ` · <span style="color:var(--bad)">${(m.res || []).filter((r) => r.st === 'failed').length} ${L('not passed', 'لم يُقرّ')}</span>` : ''}</span>`, m: 'meta' },
          ] })}
        </section>
      </div>
      <div class="stack">
        ${ui.card({ title: L('Upcoming', 'القادمة'), body: `<div class="stack">${ups.map((m) => `<button class="card link pad-sm" data-go="${R}-meeting-${m.id}" style="border-radius:14px"><div class="row">${dateTile(m.date, m.kind === 'ga' ? 'ga' : '')}<div class="grow"><div class="row-sm wrap">${ui.status(kindStatus(m.kind))}<span class="xs faint">${B.inDays(m.date)}</span></div><b style="display:block;margin-top:6px;font-size:14px">${tx(m.title)}</b><span class="xs muted">${m.time} · ${tx(m.place)}</span></div></div>
          ${m.kind === 'ga' ? `<div style="margin-top:12px">${ui.meter(L('Confirmed attendance (shares)', 'الحضور المؤكد (الحصص)'), `${B.num1(m.rsvpShare)}% · ${L('quorum', 'النصاب')} ${m.quorumReq}%`, m.rsvpShare, m.rsvpShare >= m.quorumReq ? '' : 'warn')}</div>` : ''}</button>`).join('')}</div>` })}
        ${ui.card({ title: L('Latest resolutions', 'أحدث القرارات'), link: { label: L('Register', 'السجل'), act: 'cmResRegister' }, body: ui.list(allRes.slice(0, 5).map((r) => ui.li({ icon: r.st === 'passed' ? 'checkCircle' : 'xCircle', tone: r.st === 'passed' ? 'mint' : 'bad', title: tx(r.t), sub: `${ui.idMono(r.id)} · ${B.date(r.m.date)}`, go: `${R}-meeting-${r.m.id}` }))) })}
      </div>
    </div>`;
  }

  function meetingDetail(id) {
    const m = meeting(id);
    if (!m) return ui.empty({ icon: 'calendar', title: L('Meeting not found', 'الاجتماع غير موجود'), action: ui.btn(L('Back to meetings', 'العودة للاجتماعات'), { kind: 'primary', go: `${R}-meetings` }) });
    B.title(tx(m.title));
    const done = m.status === 'completed';
    const isGA = m.kind !== 'committee';
    const attendRows = !isGA && m.attend ? C.members.map((mem) => ui.li({ avatar: D.person(mem.p).name, title: P(mem.p), sub: tx(mem.role), end: ui.status(m.attend[mem.p] || 'cmAbsent') })) : null;
    let quorumBlock = '';
    if (done && isGA) {
      const inPerson = m.present - (m.proxyUnits / units.length) * 100 * 0.9;
      quorumBlock = B.charts.donut({ size: 140, data: [{ label: L(`In person · ${m.presentUnits - m.proxyUnits} units`, `حضور شخصي · ${m.presentUnits - m.proxyUnits} وحدة`), value: Math.round(inPerson * 10) / 10, color: '#142B3B' }, { label: L(`By proxy · ${m.proxyUnits} units`, `بالوكالة · ${m.proxyUnits} وحدة`), value: Math.round((m.present - inPerson) * 10) / 10, color: '#36D6A0' }, { label: L(`Absent · ${units.length - m.presentUnits} units`, `غائب · ${units.length - m.presentUnits} وحدة`), value: Math.round((100 - m.present) * 10) / 10, color: '#D5DEDA' }], center: { value: B.num1(m.present) + '%', label: L('of shares', 'من الحصص') }, format: () => '' });
    } else if (done) {
      const n = Object.values(m.attend).filter((v) => v === 'cmPresent' || v === 'cmProxy').length;
      quorumBlock = `<div class="row">${B.charts.ring((n / C.members.length) * 100, { size: 76, label: `${n}/${C.members.length}` })}<div class="stack-sm">${ui.status('cmQuorum')}<span class="small muted">${L(`Required: ${Math.ceil(C.members.length * m.quorumReq / 100)} of ${C.members.length} members`, `المطلوب: ${Math.ceil(C.members.length * m.quorumReq / 100)} من ${C.members.length} أعضاء`)}</span></div></div>`;
    } else if (isGA) {
      quorumBlock = `<div class="row">${B.charts.ring(m.rsvpShare, { size: 76, color: m.rsvpShare >= m.quorumReq ? '#36D6A0' : '#E9A23B', label: B.num1(m.rsvpShare) + '%' })}<div class="stack-sm">${ui.status(m.rsvpShare >= m.quorumReq ? 'cmQuorum' : 'cmNoQuorum')}<span class="small muted">${L(`${m.rsvpUnits} units confirmed · ${m.proxies} proxies registered · ${m.quorumReq}% of shares required`, `${m.rsvpUnits} وحدة أكدت · ${m.proxies} وكالات مسجلة · المطلوب ${m.quorumReq}% من الحصص`)}</span></div></div>`;
    } else {
      quorumBlock = `<div class="row">${B.charts.ring(80, { size: 76, label: '4/5' })}<div class="stack-sm">${ui.status('cmQuorum')}<span class="small muted">${L('4 of 5 members confirmed · Adel Shami pending', '4 من 5 أعضاء أكدوا · عادل شامي لم يرد')}</span></div></div>`;
    }
    const actions = done
      ? ui.btn(L('Share minutes', 'مشاركة المحضر'), { icon: 'share', act: 'cmShareMinutes' }) + ui.btn(L('Download minutes', 'تنزيل المحضر'), { icon: 'download', kind: 'dark', act: 'previewDoc', arg: tx(m.docs[0]) })
      : ui.btn(L('Register proxy', 'تسجيل وكالة'), { icon: 'userCheck', act: 'cmProxy', arg: m.id }) + ui.btn(L('Send notice', 'إرسال إشعار'), { icon: 'send', kind: 'primary', act: 'cmNotice', arg: m.id });

    return `<div class="row-sm" style="margin-bottom:6px"><button class="btn btn-text btn-sm" data-go="${R}-meetings">${icon('chevL', 'flip')}${L('Meetings', 'الاجتماعات')}</button></div>
    ${ui.pageHead({ eyebrow: `${m.id}`, title: tx(m.title), sub: `${B.date(m.date)} · ${m.time} · ${tx(m.place)}`, actions })}
    <div class="row-sm wrap" style="margin:-8px 0 18px">${ui.status(kindStatus(m.kind))}${ui.status(done ? 'completed' : 'scheduled')}${!done ? `<span class="badge">${icon('clock')}${B.inDays(m.date)}</span>` : ''}</div>
    <div class="grid g-main">
      <div class="stack">
        ${ui.card({ title: L('Agenda', 'جدول الأعمال'), sub: L(`${m.agenda.length} items`, `${m.agenda.length} بنود`), body: `<ol class="cm-agenda">${m.agenda.map(([t, s]) => `<li><span><b style="font-weight:600">${tx(t)}</b><small>${tx(s)}</small></span><span></span></li>`).join('')}</ol>`, headExtra: !done ? ui.btn(L('Edit', 'تعديل'), { icon: 'edit', size: 'sm', act: 'soon', arg: L('Editing the agenda', 'تعديل جدول الأعمال') }) : '' })}
        ${done ? ui.card({ title: L('Minutes', 'المحضر'), sub: L(`Recorded by ${P('p_fadi')}, secretary · approved`, `دوّنه ${P('p_fadi')}، أمين السر · مُعتمد`), body: `<div class="cm-minutes">${m.minutes.map((p) => `<p>${tx(p)}</p>`).join('')}</div>` }) : ui.callout(L('<b>Minutes will be recorded during the meeting.</b> The secretary can take notes in BENA, and attendance is captured from check-ins and registered proxies.', '<b>سيتم تدوين المحضر أثناء الاجتماع.</b> يمكن لأمين السر تدوين الملاحظات في بينا، ويُسجّل الحضور من تسجيلات الدخول والوكالات المسجلة.'), '', 'info')}
        ${done && m.res ? ui.card({ title: L('Decisions & voting results', 'القرارات ونتائج التصويت'), sub: isGA ? L('Weighted by unit share (area-based, total 100%)', 'مرجّحة حسب حصة الوحدة (حسب المساحة، الإجمالي 100%)') : L('One vote per committee member', 'صوت واحد لكل عضو في اللجنة'),
          body: m.res.map((r) => `<div class="cm-res"><div class="cm-res-top"><div style="min-width:0"><b>${tx(r.t)}</b><small>${ui.idMono(r.id)}${r.thr && r.thr > 50 ? ' · ' + L('special majority', 'أغلبية خاصة') : ''}</small></div>${ui.status(r.st)}</div>${voteBar(r)}</div>`).join('') }) : ''}
        ${done && isGA && m.res ? ui.card({ title: L('Votes in favour by resolution', 'الأصوات المؤيدة حسب القرار'), sub: L('Share of total unit shares', 'من إجمالي حصص الوحدات'), body: B.charts.bars({ data: m.res.map((r) => ({ label: r.id, value: r.v[0], color: r.st === 'passed' ? '#36D6A0' : '#E58A7B' })), height: 160, showValues: true, max: 100, format: (v) => Math.round(v) + '%' }) }) : ''}
      </div>
      <div class="stack">
        ${ui.card({ cls: 'cm-dstack', title: done ? L('Attendance & quorum', 'الحضور والنصاب') : L('Expected attendance', 'الحضور المتوقع'), body: quorumBlock + (attendRows ? `<div class="divider" style="margin:16px 0 8px"></div>${ui.list(attendRows)}` : '') })}
        ${ui.card({ title: L('Details', 'التفاصيل'), body: ui.kv([[L('Chair', 'الرئيس'), P('p_samer')], [L('Secretary', 'أمين السر'), P('p_fadi')], [L('Notice sent', 'إرسال الدعوة'), B.date(new Date(pmon(m.date).getTime() - 14 * 86400000))], [L('Quorum rule', 'قاعدة النصاب'), isGA ? L(`${m.quorumReq}% of unit shares`, `${m.quorumReq}% من حصص الوحدات`) : L('3 of 5 members', '3 من 5 أعضاء')], [L('Voting', 'التصويت'), isGA ? L('By unit share', 'حسب حصة الوحدة') : L('Simple majority', 'أغلبية بسيطة')]]) })}
        ${ui.card({ title: L('Attachments', 'المرفقات'), body: ui.list(m.docs.map((d, i) => ui.doc({ name: tx(d), date: m.date, size: ['420 KB', '1.1 MB', '260 KB'][i % 3] }))), foot: ui.btn(L('Add attachment', 'إضافة مرفق'), { icon: 'paperclip', size: 'sm', act: 'cmUpload' }) })}
      </div>
    </div>`;
  }

  /* ---------------- Financial management ---------------- */
  function finance() {
    const tab = B.get('cm:fin', 'overview');
    const f = fin();
    const tabs = ui.tabs('cm:fin', [
      { id: 'overview', label: L('Overview', 'نظرة عامة'), icon: 'pie' },
      { id: 'dues', label: L('Contributions', 'المساهمات'), icon: 'users', count: contrib.filter((c) => cOut(c) > 0).length },
      { id: 'expenses', label: L('Expenses', 'المصاريف'), icon: 'receipt' },
      { id: 'statements', label: L('Statements', 'الكشوفات'), icon: 'doc' },
    ], tab);
    let body = '';
    if (tab === 'overview') body = finOverview(f);
    else if (tab === 'dues') body = finDues(f);
    else if (tab === 'expenses') body = finExpenses(f);
    else body = finStatements();
    return `${ui.pageHead({ eyebrow: L('Finances · November 2026', 'المالية · تشرين الثاني 2026'), title: L('Financial management', 'الإدارة المالية'), sub: L('Service charges, common expenses, reserve fund and monthly statements for owners.', 'رسوم الخدمات والمصاريف المشتركة وصندوق الاحتياط والكشوفات الشهرية للمالكين.'),
      actions: ui.btn(L('Record expense', 'تسجيل مصروف'), { icon: 'plus', act: 'cmExpense' }) + ui.btn(L('Send reminders', 'إرسال تذكيرات'), { icon: 'send', kind: 'primary', act: 'cmRemindAll' }) })}
    ${tabs}${body}`;
  }

  function finOverview(f) {
    const collPct = pct(f.collected, f.charges);
    const nov = monthCats[11];
    const donutData = CATS.map((c) => ({ label: tx(c.n), value: nov.find((x) => x.id === c.id).v, color: c.color }));
    return `<div class="grid g4">
      ${ui.kpi({ label: L('Monthly charges', 'الرسوم الشهرية'), value: B.money(f.charges), icon: 'coins', foot: L(`${units.length} units · ₪180 / apartment`, `${units.length} وحدة · 180 ₪ / شقة`) })}
      ${ui.kpi({ label: L('Collected this month', 'المحصّل هذا الشهر'), value: B.money(f.collected), icon: 'checkCircle', tone: 'mint', foot: L(`${B.pct(collPct)} of charges · 5 days left`, `${B.pct(collPct)} من الرسوم · باقٍ 5 أيام`) })}
      ${ui.kpi({ label: L('Outstanding', 'غير المحصّل'), value: B.money(f.outstanding), icon: 'alertCircle', tone: 'warn', foot: L(`${f.arrearsUnits} units incl. older arrears`, `${f.arrearsUnits} وحدة شاملة المتأخرات السابقة`), })}
      ${ui.kpi({ label: L('Expenses this month', 'مصاريف هذا الشهر'), value: B.money(f.expenses), icon: 'receipt', tone: f.expenses > BUDGET ? 'bad' : 'info', foot: f.expenses > BUDGET ? `<span style="color:var(--bad);font-weight:600">${L(`${B.pct(pct(f.expenses - BUDGET, BUDGET), 1)} over budget`, `تجاوز الموازنة ${B.pct(pct(f.expenses - BUDGET, BUDGET), 1)}`)}</span> · ${B.money(BUDGET)}` : L(`of ${B.money(BUDGET)} budget`, `من موازنة ${B.money(BUDGET)}`) })}
    </div>
    <div class="grid g-main" style="margin-top:16px">
      <div class="stack">
        ${ui.card({ cls: 'cm-c', title: L('Income and expenses — 12 months', 'الإيرادات والمصاريف — 12 شهراً'), sub: L('Service charges collected vs common expenses (incl. lobby project)', 'رسوم الخدمات المحصلة مقابل المصاريف المشتركة (شاملة مشروع الردهة)'),
          body: B.charts.line({ labels: MONTHS.map((m) => B.mon(m.m)), series: [{ name: L('Income', 'الإيرادات'), color: '#36D6A0', values: MONTHS.map((_, i) => incOf(i)), area: true }, { name: L('Expenses', 'المصاريف'), color: '#142B3B', values: MONTHS.map((_, i) => expOf(i)) }], height: 220, format: (v) => B.compact(v) }) })}
        ${ui.card({ title: L('Budget vs actual — November', 'الموازنة مقابل الفعلي — تشرين الثاني'), sub: L('Marker shows the monthly budget for each category', 'العلامة تمثل الموازنة الشهرية لكل بند'), link: { label: L('Ledger', 'دفتر الحسابات'), act: 'set', arg: 'cm:fin=expenses' }, body: bva() })}
      </div>
      <div class="stack">
        ${ui.card({ cls: 'cm-dstack', title: L('Common expenses by category', 'المصاريف المشتركة حسب البند'), sub: L('November to date', 'تشرين الثاني حتى تاريخه'), body: B.charts.donut({ data: donutData, size: 150, center: { value: B.compact(f.expenses), label: L('₪ this month', '₪ هذا الشهر') }, format: (v) => B.money(v) }) })}
        ${ui.card({ title: L('Reserve fund', 'صندوق الاحتياط'), sub: L('Target: elevator modernisation (2027)', 'الهدف: تحديث المصاعد (2027)'), body: `<div class="cm-reserve">${B.charts.ring(pct(f.reserve, 60000), { size: 84 })}<div class="stack-sm"><b style="font-family:var(--font-display);font-size:22px">${B.money(f.reserve)}</b><span class="small muted">${L(`of ${B.money(60000)} target · +${B.money(980)} / month`, `من هدف ${B.money(60000)} · +${B.money(980)} شهرياً`)}</span></div></div>` })}
        ${ui.card({ title: L('Collection rate', 'نسبة التحصيل'), sub: L('Share of monthly charges paid by month end', 'نسبة الرسوم المدفوعة بنهاية الشهر'), body: B.charts.bars({ labels: MONTHS.slice(5).map((m) => B.mon(m.m)), data: undefined, series: [{ name: L('Collection', 'التحصيل'), color: '#142B3B', values: MONTHS.slice(5).map((_, i) => (i === 6 ? Math.round(collPct) : Math.round(pct(INCOME[i + 5], f.charges)))) }], height: 150, showValues: true, max: 100, highlight: 6, format: (v) => Math.round(v) + '%' }) })}
      </div>
    </div>`;
  }

  function bva() {
    return `<div class="cm-bva">${CATS.map((c) => {
      const a = actualOf(c.id);
      const max = Math.max(...CATS.map((x) => Math.max(x.budget, actualOf(x.id))));
      const over = a > c.budget;
      return `<div class="cm-bva-row"><span class="bi">${icon(c.icon)}</span><div style="min-width:0"><div class="cm-bva-top"><span>${tx(c.n)}</span><b class="${over ? 'over' : ''}">${B.money(a)} <span class="faint" style="font-weight:500">/ ${B.money(c.budget)}</span></b></div>
        <div class="cm-bva-track"><i class="${over ? 'over' : ''}" style="width:${pct(a, max)}%"></i><em style="inset-inline-start:${pct(c.budget, max)}%"></em></div></div></div>`;
    }).join('')}</div>`;
  }

  function finDues(f) {
    const flt = B.get('cm:duesF', 'out');
    const q = B.get('cm:duesQ', '');
    const rows = contrib.filter((c) => (flt === 'all' ? true : flt === 'out' ? cOut(c) > 0 : cStatus(c) === 'paid')).filter((c) => B.match(q, c.number, D.person(c.owner).name));
    const counts = { all: contrib.length, out: contrib.filter((c) => cOut(c) > 0).length, paid: contrib.filter((c) => cStatus(c) === 'paid').length };
    const payments = contrib.filter((c) => cStatus(c) === 'paid' || c.paidNov > 0).slice().sort(B.by('lastPaid', -1)).slice(0, 8);
    return `<div class="grid g-main">
      <div class="stack">
        <div class="toolbar" style="margin-bottom:0">${ui.search('cm:duesQ', L('Search unit or owner', 'ابحث عن وحدة أو مالك'))}</div>
        ${ui.chips('cm:duesF', [{ id: 'out', label: L('Outstanding', 'غير مدفوع'), count: counts.out }, { id: 'paid', label: L('Paid', 'مدفوع'), count: counts.paid }, { id: 'all', label: L('All units', 'كل الوحدات'), count: counts.all }], flt)}
        ${ui.table({ id: 'cm-dues', rows, pageSize: 12, defaultSort: '-out', cols: [
          { key: 'number', label: L('Unit', 'الوحدة'), sort: (c) => c.u.floor * 100 + parseInt(String(c.number).replace(/\D/g, '') || '0', 10), render: (c) => `<div class="cm-cell"><span class="li-icon" style="width:34px;height:34px;border-radius:10px">${icon(c.u.kind === 'shop' ? 'store' : 'home')}</span><div><b>${unitLbl(c.u)}</b><small>${L('Floor', 'الطابق')} ${c.u.floor} · ${shareStr(c.u)} ${L('share', 'حصة')}</small></div></div>`, mRender: (c) => unitLbl(c.u), m: 'title' },
          { key: 'owner', label: L('Owner', 'المالك'), render: (c) => esc(P(c.owner)), m: 'sub' },
          { key: 'charge', label: L('Monthly', 'شهرياً'), align: 'end', render: (c) => B.money(c.charge), m: 'hide' },
          { key: 'months', label: L('Months due', 'أشهر مستحقة'), align: 'end', render: (c) => (cOut(c) > 0 ? (c.months || L('part', 'جزئي')) : '—'), m: 'hide' },
          { key: 'out', label: L('Outstanding', 'المستحق'), align: 'end', sort: (c) => cOut(c), render: (c) => (cOut(c) ? `<b>${B.money(cOut(c))}</b>` : `<span class="faint">${B.money(0)}</span>`), m: 'end' },
          { key: 'st', label: L('Status', 'الحالة'), render: (c) => `<span class="row-sm">${ui.status(cStatus(c))}${S.reminded[c.id] && cOut(c) ? ui.status('cmReminded') : ''}</span>`, m: 'meta' },
          { key: 'act', label: '', align: 'end', render: (c) => (cOut(c) ? `<span class="row-sm" style="justify-content:flex-end">${ui.btn(S.reminded[c.id] ? L('Sent', 'أُرسل') : L('Remind', 'تذكير'), { icon: S.reminded[c.id] ? 'check' : 'send', size: 'sm', kind: S.reminded[c.id] ? 'ghost' : 'soft', act: 'cmRemind', arg: c.id, disabled: !!S.reminded[c.id] })}${ui.btn('', { icon: 'banknote', size: 'sm', act: 'cmPay', arg: c.id, title: L('Record payment', 'تسجيل دفعة') })}</span>` : `<span class="xs faint">${B.dateShort(c.lastPaid)}</span>`), m: 'meta' },
        ] })}
      </div>
      <div class="stack">
        ${ui.card({ title: L('Arrears summary', 'ملخص المتأخرات'), body: `<div class="cm-mini-stats"><div><b>${B.money(f.outstanding)}</b><span>${L('Total due', 'إجمالي المستحق')}</span></div><div><b>${f.arrearsUnits}</b><span>${L('Units', 'وحدات')}</span></div><div><b>${contrib.filter((c) => cOut(c) && c.months >= 2).length}</b><span>${L('2+ months', 'شهران فأكثر')}</span></div></div>` +
          `<div style="margin-top:14px">${B.charts.hbars({ data: [{ label: L('Current month', 'الشهر الحالي'), value: B.sum(contrib.filter((c) => cOut(c) && c.months <= 1), cOut), color: '#F2B35A' }, { label: L('2 months', 'شهران'), value: B.sum(contrib.filter((c) => cOut(c) && c.months === 2), cOut), color: '#E58A7B' }, { label: L('3+ months', '3 أشهر فأكثر'), value: B.sum(contrib.filter((c) => cOut(c) && c.months >= 3), cOut), color: '#C2362F' }], format: (v) => B.money(v) })}</div>`,
          foot: `<span class="xs muted">${L('Reminders go by app notification and SMS', 'تُرسل التذكيرات عبر إشعار التطبيق والرسائل القصيرة')}</span>${ui.btn(L('Remind all', 'تذكير الجميع'), { icon: 'send', size: 'sm', kind: 'primary', act: 'cmRemindAll' })}` })}
        ${ui.card({ title: L('Payment history', 'سجل الدفعات'), sub: L('Latest receipts', 'أحدث الإيصالات'), body: ui.list(payments.map((c, i) => ui.li({ icon: 'receipt', tone: 'mint', title: `${unitLbl(c.u)} · ${P(c.owner)}`, sub: `${ui.idMono(`RC-142-${c.lastPaid.slice(2, 7).replace('-', '')}-${String(100 + i * 7).slice(-3)}`)} · ${tx(c.method)}`, end: `<b>${B.money(S.paidNow[c.id] || c.paidNov || c.charge)}</b><span class="xs faint">${B.dateShort(c.lastPaid)}</span>` }))) })}
      </div>
    </div>`;
  }

  function finExpenses(f) {
    const cf = B.get('cm:expC', 'all');
    const rows = LEDGER.filter((x) => cf === 'all' || x.cat === cf).slice().sort(B.by('date', -1));
    return `<div class="grid g-side">
      <div class="stack">
        ${ui.card({ title: L('Budget vs actual', 'الموازنة مقابل الفعلي'), sub: L(`Total ${B.money(f.expenses)} of ${B.money(BUDGET)} budget`, `الإجمالي ${B.money(f.expenses)} من موازنة ${B.money(BUDGET)}`), body: bva() })}
        ${ui.callout(L(`<b>Over budget by ${B.money(f.expenses - BUDGET)}.</b> Driven by the Elevator B emergency callout and the winter diesel top-up. Both are within the chair's delegated authority.`, `<b>تجاوز الموازنة بمبلغ ${B.money(f.expenses - BUDGET)}.</b> بسبب الزيارة الطارئة للمصعد ب وتعبئة السولار الشتوية، وكلاهما ضمن صلاحيات الرئيس المفوّضة.`), 'warn', 'alert')}
      </div>
      <div class="stack">
        ${ui.chips('cm:expC', [{ id: 'all', label: L('All', 'الكل') }].concat(CATS.map((c) => ({ id: c.id, label: tx(c.n), icon: c.icon }))), cf)}
        ${ui.table({ id: 'cm-ledger', rows, cols: [
          { key: 'date', label: L('Date', 'التاريخ'), sort: true, render: (x) => `<span class="nowrap">${B.dateShort(x.date)}</span>`, m: 'meta' },
          { key: 'payee', label: L('Payee', 'المستفيد'), render: (x) => `<div class="cm-cell"><span class="li-icon" style="width:34px;height:34px;border-radius:10px">${icon(cat(x.cat).icon)}</span><div style="min-width:0"><b class="truncate" style="max-width:260px">${tx(x.payee)}</b><small class="truncate" style="max-width:260px">${tx(x.desc)}</small></div></div>`, mRender: (x) => tx(x.payee), m: 'title' },
          { key: 'desc', label: L('Category', 'البند'), render: (x) => `<span class="badge">${tx(cat(x.cat).n)}</span>`, m: 'meta' },
          { key: 'ref', label: L('Ref.', 'المرجع'), render: (x) => ui.idMono(x.id), m: 'meta' },
          { key: 'amount', label: L('Amount', 'المبلغ'), align: 'end', sort: true, render: (x) => `<b>${B.money(x.amount)}</b>`, m: 'end' },
        ], rowAct: (x) => ({ act: 'cmExpDetail', arg: x.id }) })}
      </div>
    </div>`;
  }

  function finStatements() {
    const list = MONTHS.slice().reverse().slice(0, 8);
    return `<div class="grid g-main">
      <div>${ui.table({ id: 'cm-stmts', rows: list.map((mo) => ({ mo, i: MONTHS.indexOf(mo) })), rowGo: (r) => `${R}-statement-${r.mo.key}`, cols: [
        { key: 'm', label: L('Month', 'الشهر'), render: (r) => `<div class="cm-cell"><span class="li-icon navy" style="width:34px;height:34px;border-radius:10px">${icon('doc')}</span><div><b>${B.monLong(r.mo.m)} ${r.mo.y}</b><small>${r.i === 11 ? L('Month to date', 'حتى تاريخه') : L('Closed · shared with owners', 'مغلق · تمت مشاركته مع المالكين')}</small></div></div>`, mRender: (r) => `${B.monLong(r.mo.m)} ${r.mo.y}`, m: 'title' },
        { key: 'inc', label: L('Income', 'الإيرادات'), align: 'end', render: (r) => B.money(incOf(r.i)), m: 'meta' },
        { key: 'exp', label: L('Expenses', 'المصاريف'), align: 'end', render: (r) => B.money(expOf(r.i)), m: 'meta' },
        { key: 'cl', label: L('Closing balance', 'الرصيد الختامي'), align: 'end', render: (r) => `<b>${B.money(closing[r.i])}</b>`, m: 'end' },
        { key: 'st', label: L('Status', 'الحالة'), render: (r) => ui.status(r.i === 11 ? 'draft' : 'approved'), m: 'meta' },
      ] })}</div>
      <div class="stack">
        ${ui.card({ cls: 'cm-c', title: L('Closing balance trend', 'اتجاه الرصيد الختامي'), body: B.charts.line({ labels: MONTHS.map((m) => B.mon(m.m)), series: [{ name: L('Balance', 'الرصيد'), color: '#142B3B', values: closing, area: true }], height: 170 }) })}
        ${ui.callout(L('Statements are approved by the treasurer and chair, then published to every owner in the BENA app.', 'يعتمد أمين الصندوق والرئيس الكشوفات، ثم تُنشر لكل مالك في تطبيق بينا.'), 'mint', 'shieldCheck')}
      </div>
    </div>`;
  }

  function statement(key) {
    const i = Math.max(0, MONTHS.findIndex((m) => m.key === key));
    const mo = MONTHS[i];
    B.title(L('Monthly statement', 'الكشف الشهري'));
    B.navActive('finance');
    const cats = monthCats[i];
    const charges = INCOME[i];
    const rows = (arr) => arr.map(([l, v, cls = '']) => `<tr class="${cls}"><td>${l}</td><td>${v}</td></tr>`).join('');
    const prevKey = i > 0 ? MONTHS[i - 1].key : null, nextKey = i < 11 ? MONTHS[i + 1].key : null;
    return `<div class="row between wrap" style="margin-bottom:6px"><button class="btn btn-text btn-sm" data-act="cmBackFin">${icon('chevL', 'flip')}${L('Statements', 'الكشوفات')}</button>
      <div class="row-sm">${ui.btn('', { icon: 'chevL', iconCls: 'flip', size: 'sm', go: prevKey ? `${R}-statement-${prevKey}` : null, disabled: !prevKey, title: L('Previous month', 'الشهر السابق') })}${ui.btn('', { icon: 'chevR', iconCls: 'flip', size: 'sm', go: nextKey ? `${R}-statement-${nextKey}` : null, disabled: !nextKey, title: L('Next month', 'الشهر التالي') })}</div></div>
    ${ui.pageHead({ eyebrow: L('Financial statement', 'كشف مالي'), title: `${B.monLong(mo.m)} ${mo.y}`, sub: tx(C.name), actions: ui.btn(L('Share with owners', 'مشاركة مع المالكين'), { icon: 'share', act: 'cmShareStmt' }) + ui.btn(L('Download PDF', 'تنزيل PDF'), { icon: 'download', kind: 'dark', act: 'previewDoc', arg: L(`Statement ${B.monLong(mo.m)} ${mo.y}.pdf`, `كشف ${B.monLong(mo.m)} ${mo.y}.pdf`) }) })}
    <article class="cm-stmt">
      <div class="cm-stmt-h"><div><div class="brand dark row-sm">${B.logo(22)}<b>BENA</b></div><h2 style="margin-top:10px">${L('Statement of income and expenses', 'كشف الإيرادات والمصاريف')}</h2><div class="small muted">${tx(C.name)} · ${ui.idMono(C.regNo)}</div></div>
        <div style="text-align:end" class="small muted"><div>${L('Period', 'الفترة')}: <b style="color:var(--ink)">${B.date(`${mo.key}-01`)} – ${i === 11 ? B.date('2026-11-25') : B.date(new Date(mo.y, mo.m + 1, 0))}</b></div><div>${L('Building', 'المبنى')}: ${ui.idMono(BID)}</div><div>${i === 11 ? ui.status('draft') : ui.status('approved')}</div></div></div>
      <table>${rows([[`<b>${L('Opening balance', 'الرصيد الافتتاحي')}</b>`, `<b>${B.money(openingOf(i))}</b>`]])}</table>
      <div class="cm-stmt-sec">${L('Income', 'الإيرادات')}</div>
      <table>${rows([[L('Service charges collected', 'رسوم الخدمات المحصلة'), B.money(charges)]].concat(LEVY[i] ? [[L('Special levy — lobby renovation', 'مساهمة خاصة — ترميم الردهة'), B.money(LEVY[i])]] : []).concat([[L('Total income', 'إجمالي الإيرادات'), B.money(incOf(i)), 'sub']]))}</table>
      <div class="cm-stmt-sec">${L('Expenses', 'المصاريف')}</div>
      <table>${rows(cats.map((c) => [tx(cat(c.id).n), '−' + B.money(c.v), 'neg']).concat(PROJECT[i] ? [[L('Lobby renovation (project)', 'ترميم الردهة (مشروع)'), '−' + B.money(PROJECT[i]), 'neg']] : []).concat([[L('Total expenses', 'إجمالي المصاريف'), '−' + B.money(expOf(i)), 'sub']]))}</table>
      <table style="margin-top:14px">${rows([[L('Closing balance', 'الرصيد الختامي'), B.money(closing[i]), 'tot']])}</table>
      <div class="cm-stmt-sign"><div><b>${P('p_hiba')}</b>${L('Treasurer', 'أمين الصندوق')}</div><div><b>${P('p_samer')}</b>${L('Chair', 'الرئيس')}</div></div>
      <p class="xs faint" style="margin-top:20px">${L('Sample statement generated from fictional demo data.', 'كشف نموذجي مُولّد من بيانات تجريبية وهمية.')}</p>
    </article>`;
  }

  /* ---------------- Members ---------------- */
  function members() {
    const q = B.get('cm:ownQ', '');
    const owners = units.filter((u) => B.match(q, u.number, D.person(u.owner).name));
    const memberRow = (m) => ({ ...m, unitObj: D.unit(m.unit) });
    return `${ui.pageHead({ eyebrow: L('Association', 'الجمعية'), title: L('Members & owners', 'الأعضاء والمالكون'), sub: L('Committee seats, responsibilities, delegations and the owners\' register with voting shares.', 'مقاعد اللجنة والمسؤوليات والوكالات وسجل المالكين مع حصص التصويت.'),
      actions: ui.btn(L('Record delegation', 'تسجيل وكالة'), { icon: 'userCheck', act: 'cmProxy', arg: 'MT-2612' }) + ui.btn(L('Invite member', 'دعوة عضو'), { icon: 'userPlus', kind: 'primary', act: 'cmInvite' }) })}
    ${sec(L('Committee', 'اللجنة'), `<span class="xs faint">${L(`${C.members.length} seats · term ${tx(C.term)}`, `${C.members.length} مقاعد · الدورة ${tx(C.term)}`)}</span>`)}
    ${ui.table({ id: 'cm-mem', rows: C.members.map(memberRow), rowAct: (m) => ({ act: 'cmMember', arg: m.p }), cols: [
      { key: 'p', label: L('Member', 'العضو'), render: (m) => `<div class="cm-cell">${ui.avatar(D.person(m.p).name)}<div><b>${P(m.p)}</b><small class="ltr">${esc(D.person(m.p).phone || '')}</small></div></div>`, mRender: (m) => P(m.p), m: 'title' },
      { key: 'role', label: L('Position', 'المنصب'), render: (m) => `<span class="cm-role-tag ${m.p === 'p_samer' ? 'chair' : ''}">${tx(m.role)}</span>`, m: 'end' },
      { key: 'resp', label: L('Responsibilities', 'المسؤوليات'), render: (m) => `<span class="small muted">${tx(RESP[m.p] || m.auth)}</span>`, m: 'sub' },
      { key: 'unit', label: L('Unit', 'الوحدة'), render: (m) => (m.unitObj ? `${m.unitObj.number} <span class="xs faint">· ${shareStr(m.unitObj)}</span>` : '—'), m: 'meta' },
      { key: 'since', label: L('Appointed', 'تاريخ التعيين'), render: (m) => `<span class="nowrap">${B.date(m.since)}</span>`, m: 'meta' },
      { key: 'deleg', label: L('Delegation', 'الوكالة'), render: (m) => (m.delegated ? `<span title="${esc(P(m.delegated))}">${ui.status('cmHolds')}</span> <span class="xs muted">${L('from', 'من')} ${P(m.delegated)}</span>` : `<span class="faint xs">${L('No proxy held', 'لا يحمل وكالة')}</span>`), m: 'meta' },
    ] })}
    <div class="grid g-side" style="margin-top:22px">
      <div class="stack">
        ${ui.card({ title: L('Delegations & proxies', 'الوكالات والإنابات'), sub: L('Owners who authorised another person to vote for them', 'مالكون فوّضوا شخصاً آخر للتصويت عنهم'), body: DELEG.map((d) => `<div class="stack-sm"><div class="cm-deleg">${ui.avatar(D.person(d.from).name, 'sm')}<span class="small"><b>${P(d.from)}</b><br><span class="xs faint">${L('Owner', 'مالك')} · ${d.units.map((n) => L('Unit ', 'وحدة ') + n).join(', ')}</span></span><span class="arrow">${icon('arrowRight', 'flip')}</span>${ui.avatar(D.person(d.to).name, 'sm')}<span class="small"><b>${P(d.to)}</b><br><span class="xs faint">${L('Committee member', 'عضو لجنة')}</span></span></div>
          ${ui.kv([[L('Scope', 'النطاق'), tx(d.scope)], [L('Valid', 'سارية'), `${B.date(d.from_d)} – ${B.date(d.until)}`], [L('Voting weight', 'وزن التصويت'), B.num1(B.sum(d.units.map(unitById).filter(Boolean), share)) + '%'], [L('Status', 'الحالة'), ui.status(d.status)]])}</div>`).join(''), foot: ui.btn(L('View proxy document', 'عرض وثيقة الوكالة'), { icon: 'doc', size: 'sm', act: 'previewDoc', arg: tx(DOCS[4].name) }) })}
        ${ui.callout(L('Owner names and unit links are visible to committee members only, as authorised by the association bylaws. Residents see the committee, not the register.', 'أسماء المالكين وربطها بالوحدات مرئية لأعضاء اللجنة فقط وفق النظام الداخلي. يرى السكان اللجنة وليس السجل.'), 'dashed', 'lock')}
      </div>
      <section class="stack">
        <div class="row between wrap"><h2 style="font-size:18px">${L('Owners\' register', 'سجل المالكين')}</h2><span class="xs faint">${L(`${units.length} units · shares by floor area`, `${units.length} وحدة · الحصص حسب المساحة`)}</span></div>
        <div class="toolbar" style="margin-bottom:0">${ui.search('cm:ownQ', L('Search unit or owner', 'ابحث عن وحدة أو مالك'), { reset: 'cm-own:page' })}</div>
        ${ui.table({ id: 'cm-own', rows: owners, pageSize: 10, cols: [
          { key: 'number', label: L('Unit', 'الوحدة'), render: (u) => `<b>${unitLbl(u)}</b>`, m: 'title' },
          { key: 'owner', label: L('Owner', 'المالك'), render: (u) => esc(P(u.owner)) + (u.owner === 'p_khaled' ? ` <span class="xs faint">· ${L('proxy → Adel', 'وكالة ← عادل')}</span>` : ''), m: 'sub' },
          { key: 'area', label: L('Area', 'المساحة'), align: 'end', render: (u) => `${u.area} m²`, m: 'meta' },
          { key: 'share', label: L('Share', 'الحصة'), align: 'end', sort: (u) => u.area, render: (u) => shareStr(u), m: 'end' },
          { key: 'status', label: L('Occupancy', 'الإشغال'), render: (u) => ui.status(u.status), m: 'meta' },
        ] })}
      </section>
    </div>`;
  }

  /* ---------------- Maintenance ---------------- */
  function maintenance() {
    const flt = B.get('cm:mF', 'active');
    const all = D.requestsOf(BID).slice().sort(B.by('created', -1));
    const rows = all.filter((q) => (flt === 'all' ? true : flt === 'approval' ? needsApproval(q) : flt === 'active' ? reqOpen(q) : flt === 'common' ? q.scope === 'common' : !reqOpen(q)));
    const assets = D.assetsOf(BID);
    const spend = actualOf('elevator') + actualOf('pumps');
    const card = (q) => {
      const p = prov(q.provider);
      const u = q.unit ? D.unit(q.unit) : null;
      return `<article class="cm-req-card ${needsApproval(q) ? 'attn' : ''}"><span class="li-icon ${q.priority === 'high' ? 'bad' : q.scope === 'common' ? 'navy' : ''}">${icon(D.cat(q.cat).icon)}</span>
        <div style="min-width:0"><div class="row-sm wrap" style="margin-bottom:6px">${needsApproval(q) ? ui.status('cmNeedsApproval') : ui.status(q.status)}${ui.status(q.priority)}<span class="xs faint">${ui.idMono(q.id)}</span></div>
          <h4>${tx(q.title)}</h4>${q.desc ? `<p>${tx(q.desc)}</p>` : ''}
          <div class="cm-kv-inline" style="margin-top:8px"><span>${q.scope === 'common' ? L('Common area', 'منطقة مشتركة') : L('Unit', 'الوحدة') + ' <b>' + (u?.number || '') + '</b>'}</span><span>${L('By', 'بواسطة')} <b>${P(q.by)}</b> · ${B.ago(q.created)}</span>${p ? `<span>${icon('handshake')} <b>${tx(p.name)}</b></span>` : ''}${q.visit ? `<span>${L('Visit', 'الزيارة')} <b>${B.dateShort(q.visit)}</b></span>` : ''}</div></div>
        <div class="cm-req-act">${needsApproval(q) ? ui.btn(L('Approve & assign', 'موافقة وإسناد'), { icon: 'check', kind: 'primary', size: 'sm', act: 'cmApprove', arg: q.id }) : ''}${ui.btn(L('Details', 'التفاصيل'), { size: 'sm', act: 'cmReq', arg: q.id })}</div></article>`;
    };
    return `${ui.pageHead({ eyebrow: tx(bld.name), title: L('Building maintenance', 'صيانة المبنى'), sub: L('Approve requests from residents and owners, assign providers and follow work in common areas.', 'وافق على طلبات السكان والمالكين، وأسند المزوّدين، وتابع الأعمال في المناطق المشتركة.'),
      actions: ui.btn(L('Services marketplace', 'سوق الخدمات'), { icon: 'handshake', go: `${R}-services` }) + ui.btn(L('New request', 'طلب جديد'), { icon: 'plus', kind: 'primary', act: 'cmNewReq' }) })}
    <div class="grid g4" style="margin-bottom:16px">
      ${ui.kpi({ label: L('Awaiting approval', 'بانتظار الموافقة'), value: all.filter(needsApproval).length, icon: 'clipboard', tone: 'warn' })}
      ${ui.kpi({ label: L('In progress', 'قيد التنفيذ'), value: all.filter((q) => ['inProgress', 'assigned', 'scheduled'].includes(q.status)).length, icon: 'wrench', tone: 'violet' })}
      ${ui.kpi({ label: L('Avg. resolution', 'متوسط الإنجاز'), value: '2.8', unit: L('days', 'أيام'), icon: 'clock', tone: 'info', delta: '−0.6', dir: 'up', foot: L('vs last quarter', 'مقابل الربع السابق') })}
      ${ui.kpi({ label: L('Repair spend (Nov)', 'مصاريف الإصلاح (ت٢)'), value: B.money(spend), icon: 'receipt', foot: L('Elevator & pumps', 'المصاعد والمضخات') })}
    </div>
    <div class="grid g-main">
      <div class="stack">
        ${ui.chips('cm:mF', [{ id: 'active', label: L('Active', 'جارية'), count: all.filter(reqOpen).length }, { id: 'approval', label: L('Needs approval', 'بانتظار الموافقة'), count: all.filter(needsApproval).length }, { id: 'common', label: L('Common areas', 'المناطق المشتركة') }, { id: 'done', label: L('Completed', 'مكتملة') }, { id: 'all', label: L('All', 'الكل'), count: all.length }], flt)}
        ${rows.length ? `<div class="cm-req">${rows.map(card).join('')}</div>` : `<div class="card">${ui.empty({ icon: 'checkCircle', title: L('Nothing here', 'لا يوجد شيء هنا'), text: L('No requests match this filter.', 'لا توجد طلبات مطابقة لهذا الفلتر.') })}</div>`}
      </div>
      <div class="stack">
        ${ui.card({ title: L('Building systems', 'أنظمة المبنى'), sub: L('Shared assets maintained by the association', 'الأصول المشتركة التي تصونها الجمعية'), body: ui.list(assets.map((a) => ui.li({ icon: { elevator: 'elevator', generator: 'generator', pump: 'pump', tank: 'tank', fire: 'fireExt', access: 'lock' }[a.cat] || 'settings', tone: a.status === 'fault' ? 'bad' : a.status === 'due' ? 'warn' : '', title: tx(a.name), sub: `${L('Next service', 'الخدمة القادمة')} ${B.dateShort(a.next)} · ${tx(a.loc)}`, end: a.status === 'fault' ? ui.status('alarm') : a.status === 'due' ? ui.status('due') : ui.status(a.cond) }))) })}
        ${ui.card({ title: L('Contracted providers', 'المزوّدون المتعاقدون'), body: ui.list(['sp_sparkle', 'sp_lift', 'sp_guard', 'sp_pure'].map((id) => { const p = D.provider(id); return ui.li({ icon: D.cat(p.cats[0]).icon, tone: 'mint', title: tx(p.name), sub: `${tx(D.cat(p.cats[0]).name)} · ★ ${p.rating}`, end: ui.status('active') }); })), foot: ui.btn(L('Find more providers', 'ابحث عن مزوّدين آخرين'), { icon: 'search', size: 'sm', kind: 'soft', go: `${R}-services` }) })}
      </div>
    </div>`;
  }

  /* ---------------- Announcements ---------------- */
  function announcements() {
    const tf = B.get('cm:annT', 'all');
    const all = D.announcementsOf(BID).slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (a.date < b.date ? 1 : -1));
    const list = all.filter((a) => tf === 'all' || a.tag === tf);
    const TAGS = { notice: [L('Notice', 'إشعار'), 'warn'], meeting: [L('Meeting', 'اجتماع'), 'navy'], maintenance: [L('Maintenance', 'صيانة'), 'info'], community: [L('Community', 'مجتمع'), 'mint'] };
    const seen = (a, i) => Math.max(18, 51 - i * 4 - (a.id.length % 3));
    return `${ui.pageHead({ eyebrow: tx(bld.name), title: L('Announcements', 'الإعلانات'), sub: L('Notices to residents and owners, delivered in the BENA app, by SMS and on the lobby screen.', 'إشعارات للسكان والمالكين عبر تطبيق بينا والرسائل القصيرة وشاشة الردهة.'), actions: ui.btn(L('New announcement', 'إعلان جديد'), { icon: 'plus', kind: 'primary', act: 'cmCompose' }) })}
    <div class="grid g-main">
      <div class="stack">
        ${ui.chips('cm:annT', [{ id: 'all', label: L('All', 'الكل'), count: all.length }].concat(Object.keys(TAGS).map((k) => ({ id: k, label: TAGS[k][0], count: all.filter((a) => a.tag === k).length }))), tf)}
        ${list.length ? list.map((a, i) => `<article class="card pad-0 cm-ann ${a.pinned ? 'pinned' : ''}"><span class="bar"></span><div style="min-width:0">
          <div class="row-sm wrap" style="margin-bottom:8px">${a.pinned ? ui.badge(L('Pinned', 'مثبّت'), 'mint', 'flag') : ''}${TAGS[a.tag] ? ui.badge(TAGS[a.tag][0], TAGS[a.tag][1] === 'navy' ? 'navy' : TAGS[a.tag][1]) : ''}<span class="xs faint">${B.date(a.date)}</span></div>
          <h3>${tx(a.title)}</h3><p>${tx(a.body)}</p>
          <div class="cm-ann-f"><span>${icon('user')}${a.by === 'org_arkan' ? tx(D.org('org_arkan').name) : L('Committee', 'اللجنة') + ' · ' + P('p_samer')}</span><span>${icon('eye')}${L(`Seen by ${seen(a, i)} of 54 units`, `شاهده ${seen(a, i)} من 54 وحدة`)}</span>
            <span class="grow"></span><button class="btn btn-text btn-sm" data-act="cmPin" data-arg="${a.id}">${icon('flag')}${a.pinned ? L('Unpin', 'إلغاء التثبيت') : L('Pin', 'تثبيت')}</button><button class="btn btn-text btn-sm" data-act="cmResend" data-arg="${a.id}">${icon('send')}${L('Resend', 'إعادة إرسال')}</button></div></div></article>`).join('') : `<div class="card">${ui.empty({ icon: 'megaphone', title: L('No announcements', 'لا توجد إعلانات'), text: L('Nothing posted in this category yet.', 'لم يُنشر شيء في هذه الفئة بعد.') })}</div>`}
      </div>
      <div class="stack">
        ${ui.card({ title: L('Reach', 'الوصول'), sub: L('Last 30 days', 'آخر 30 يوماً'), body: `<div class="cm-mini-stats"><div><b>86%</b><span>${L('Open rate', 'نسبة الفتح')}</span></div><div><b>${all.length}</b><span>${L('Posts', 'منشورات')}</span></div><div><b>3</b><span>${L('Channels', 'قنوات')}</span></div></div><div style="margin-top:14px">${B.charts.hbars({ data: [{ label: L('BENA app', 'تطبيق بينا'), value: 46, color: '#36D6A0' }, { label: L('SMS', 'رسائل قصيرة'), value: 31, color: '#142B3B' }, { label: L('Lobby screen', 'شاشة الردهة'), value: 54, color: '#7FA7C2' }], max: 54, format: (v) => L(`${v} units`, `${v} وحدة`) })}</div>` })}
        ${ui.card({ title: L('Templates', 'قوالب'), body: ui.list([[L('Water cut notice', 'إشعار انقطاع المياه'), 'droplet'], [L('Meeting invitation', 'دعوة لاجتماع'), 'calendar'], [L('Contractor visit', 'زيارة مقاول'), 'wrench'], [L('Payment reminder', 'تذكير بالدفع'), 'coins']].map(([t, ic]) => ui.li({ icon: ic, title: t, act: 'cmCompose', arg: t }))) })}
      </div>
    </div>`;
  }

  /* ---------------- Shared delegates ---------------- */
  function services(id, r) {
    if (B.shared.services) return B.shared.services(id, r);
    const ps = D.providers.filter((p) => p.areas.includes('masyoun'));
    return `${ui.pageHead({ eyebrow: L('Marketplace', 'السوق'), title: L('Services marketplace', 'سوق الخدمات'), sub: L('Verified providers serving Al-Masyoun.', 'مزوّدون موثّقون يخدمون الماصيون.') })}
      <div class="grid g3">${ps.map((p) => ui.card({ title: tx(p.name), sub: tx(p.tagline), body: `<div class="row-sm wrap">${p.verified ? ui.status('verified') : ''}${ui.stars(p.rating)}<span class="xs faint">${p.rating} · ${p.reviews}</span></div>`, foot: `<span class="xs muted">${L('From', 'من')} ${B.money(p.from)}</span>${ui.btn(L('Request quote', 'طلب عرض'), { size: 'sm', kind: 'soft', act: 'soon', arg: L('Quote request', 'طلب العرض') })}` })).join('')}</div>`;
  }
  function building(id, r) {
    if (B.shared.building) return B.shared.building(id || BID, r);
    return ui.empty({ icon: 'building', title: tx(bld.name), text: BID });
  }

  /* ======================================================================
     Actions & forms
     ====================================================================== */
  const A = B.act;
  A.cmBackFin = () => { B.vs['cm:fin'] = 'statements'; B.go(`${R}-finance`); };
  A.cmQuickPost = () => {
    const el = document.getElementById('cm-quick');
    const v = el ? el.value.trim() : '';
    if (!v) { B.toast(L('Write a short message first', 'اكتب رسالة قصيرة أولاً'), 'info'); if (el) el.focus(); return; }
    const title = v.length > 70 ? v.slice(0, 67) + '…' : v;
    D.announcements.unshift({ id: 'an' + Date.now(), building: BID, by: 'c_masyoun', date: '2026-11-25', title: { en: title, ar: title }, body: { en: v, ar: v }, tag: 'notice' });
    B.refresh();
    B.toast(L('Announcement posted to 54 units', 'تم نشر الإعلان إلى 54 وحدة'));
  };
  A.cmCompose = (preset) => {
    B.modal({ title: L('New announcement', 'إعلان جديد'), sub: tx(bld.name) + ' · ' + L('54 units', '54 وحدة'), form: 'cmAnn', size: 'md',
      body: `<div class="form-grid">
        ${ui.field({ name: 'title', label: L('Title', 'العنوان'), value: preset || '', required: true, full: true, placeholder: L('e.g. Elevator B maintenance on Wednesday', 'مثال: صيانة المصعد ب يوم الأربعاء') })}
        ${ui.field({ name: 'body', label: L('Message', 'الرسالة'), type: 'textarea', required: true, full: true, placeholder: L('What should residents know?', 'ماذا يجب أن يعرف السكان؟') })}
        ${ui.field({ name: 'tag', label: L('Category', 'الفئة'), type: 'select', options: [{ v: 'notice', l: L('Notice', 'إشعار') }, { v: 'meeting', l: L('Meeting', 'اجتماع') }, { v: 'maintenance', l: L('Maintenance', 'صيانة') }, { v: 'community', l: L('Community', 'مجتمع') }] })}
        ${ui.field({ name: 'aud', label: L('Audience', 'الجمهور'), type: 'select', options: [{ v: 'all', l: L('All residents & owners', 'جميع السكان والمالكين') }, { v: 'owners', l: L('Owners only', 'المالكون فقط') }, { v: 'tenants', l: L('Tenants only', 'المستأجرون فقط') }] })}
        <div class="field full"><span class="label">${L('Channels', 'القنوات')}</span><div class="row wrap" style="gap:16px"><label class="check"><input type="checkbox" name="ch_app" checked>${L('BENA app', 'تطبيق بينا')}</label><label class="check"><input type="checkbox" name="ch_sms">${L('SMS', 'رسالة قصيرة')}</label><label class="check"><input type="checkbox" name="ch_lobby" checked>${L('Lobby screen', 'شاشة الردهة')}</label><label class="check"><input type="checkbox" name="pin">${L('Pin to top', 'تثبيت في الأعلى')}</label></div></div>
      </div>`,
      foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${icon('send')}${L('Publish', 'نشر')}</button>` });
  };
  B.submit.cmAnn = (d) => {
    const t = (d.title || '').trim() || L('Announcement', 'إعلان');
    const b = (d.body || '').trim();
    D.announcements.unshift({ id: 'an' + Date.now(), building: BID, by: 'c_masyoun', date: '2026-11-25', pinned: !!d.pin, title: { en: t, ar: t }, body: { en: b, ar: b }, tag: d.tag || 'notice' });
    B.refresh();
    B.success({ title: L('Announcement published', 'تم نشر الإعلان'), text: L('Residents will see it in the BENA app within a minute.', 'سيراه السكان في تطبيق بينا خلال دقيقة.'), ref: 'AN-' + String(Date.now()).slice(-5) });
  };
  A.cmPin = (id) => { const a = D.announcements.find((x) => x.id === id); if (a) { a.pinned = !a.pinned; B.refresh(); B.toast(a.pinned ? L('Pinned to the top', 'تم التثبيت في الأعلى') : L('Unpinned', 'تم إلغاء التثبيت')); } };
  A.cmResend = () => B.toast(L('Reminder push sent to units that haven\'t opened it', 'تم إرسال تذكير للوحدات التي لم تفتحه'));

  A.cmNewMeeting = () => {
    B.modal({ title: L('Schedule a meeting', 'جدولة اجتماع'), sub: tx(C.name), form: 'cmMeeting', size: 'md',
      body: `<div class="stack">
        ${ui.field({ name: 'kind', label: L('Meeting type', 'نوع الاجتماع'), type: 'radio', options: [{ v: 'committee', l: L('Committee', 'اللجنة'), d: L('5 members · simple majority', '5 أعضاء · أغلبية بسيطة'), icon: 'chat' }, { v: 'ga', l: L('General assembly', 'هيئة عامة'), d: L('All owners · vote by share', 'جميع المالكين · تصويت بالحصص'), icon: 'users' }, { v: 'ega', l: L('Extraordinary', 'غير عادية'), d: L('Urgent matters · 14 days notice', 'أمور عاجلة · إشعار 14 يوماً'), icon: 'gavel' }] })}
        <div class="form-grid">
          ${ui.field({ name: 'title', label: L('Title', 'العنوان'), required: true, full: true, placeholder: L('e.g. Committee meeting — December', 'مثال: اجتماع اللجنة — كانون الأول') })}
          ${ui.field({ name: 'date', label: L('Date', 'التاريخ'), type: 'date', value: '2026-12-18', required: true })}
          ${ui.field({ name: 'time', label: L('Time', 'الوقت'), type: 'time', value: '18:30' })}
          ${ui.field({ name: 'place', label: L('Location', 'المكان'), type: 'select', full: true, options: [{ v: 'lobby', l: L('Lobby meeting room', 'قاعة الاجتماعات في الردهة') }, { v: 'online', l: L('Online — BENA meeting room', 'عبر الإنترنت — غرفة اجتماعات بينا') }, { v: 'hybrid', l: L('Hybrid (lobby + online)', 'مدمج (الردهة + الإنترنت)') }] })}
          ${ui.field({ name: 'agenda', label: L('Agenda (one item per line)', 'جدول الأعمال (بند في كل سطر)'), type: 'textarea', full: true, placeholder: L('Approve previous minutes\nElevator B repair\nAny other business', 'المصادقة على المحضر السابق\nإصلاح المصعد ب\nما يستجد من أعمال') })}
        </div>
        <label class="check"><input type="checkbox" name="notify" checked>${L('Send the invitation to all owners now (app + SMS)', 'إرسال الدعوة لجميع المالكين الآن (التطبيق + الرسائل)')}</label>
      </div>`,
      foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${icon('calendarCheck')}${L('Schedule', 'جدولة')}</button>` });
  };
  B.submit.cmMeeting = (d) => {
    const id = 'MT-' + String(Date.now()).slice(-4);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(d.date || '') ? d.date : '2026-12-18';
    const t = (d.title || '').trim() || L('Committee meeting', 'اجتماع اللجنة');
    const ag = String(d.agenda || '').split('\n').map((s) => s.trim()).filter(Boolean);
    const place = { lobby: T('Lobby meeting room', 'قاعة الاجتماعات في الردهة'), online: T('Online — BENA meeting room', 'عبر الإنترنت — غرفة اجتماعات بينا'), hybrid: T('Hybrid (lobby + online)', 'مدمج (الردهة + الإنترنت)') }[d.place] || T('Lobby meeting room', 'قاعة الاجتماعات في الردهة');
    MEETINGS.push({ id, kind: d.kind || 'committee', status: 'scheduled', date, time: d.time || '18:30', place, title: { en: t, ar: t }, quorumReq: d.kind === 'committee' || !d.kind ? 60 : 50, rsvpShare: 0, rsvpUnits: 0, proxies: 0,
      agenda: (ag.length ? ag : [L('Approve previous minutes', 'المصادقة على المحضر السابق'), L('Any other business', 'ما يستجد من أعمال')]).map((s) => [{ en: s, ar: s }, T('Item', 'بند')]), docs: [T('Invitation.pdf', 'الدعوة.pdf')] });
    B.refresh();
    B.success({ title: L('Meeting scheduled', 'تمت جدولة الاجتماع'), text: d.notify ? L('Invitations were sent to all 54 units.', 'تم إرسال الدعوات إلى جميع الوحدات الـ 54.') : L('Saved as a draft invitation.', 'تم الحفظ كمسودة دعوة.'), ref: id, done: `${R}-meeting-${id}`, doneLabel: L('Open meeting', 'فتح الاجتماع') });
  };
  A.cmNotice = (id) => { const m = meeting(id); B.toast(m && m.kind === 'committee' ? L('Reminder sent to 5 committee members', 'تم إرسال تذكير لأعضاء اللجنة الخمسة') : L('Notice sent to all 54 units', 'تم إرسال الإشعار إلى جميع الوحدات الـ 54')); };
  A.cmShareMinutes = () => B.toast(L('Minutes shared with all owners in the BENA app', 'تمت مشاركة المحضر مع جميع المالكين في تطبيق بينا'));
  A.cmShareStmt = () => B.toast(L('Statement published to 54 owners', 'تم نشر الكشف إلى 54 مالكاً'));
  A.cmProxy = (mid) => {
    const m = meeting(mid) || meeting('MT-2612');
    B.modal({ title: L('Register a proxy', 'تسجيل وكالة'), sub: tx(m.title), form: 'cmProxy', size: 'md',
      body: `<div class="form-grid">
        ${ui.field({ name: 'unit', label: L('Owner\'s unit', 'وحدة المالك'), type: 'select', full: true, options: units.filter((u) => u.kind === 'apartment').slice(0, 40).map((u) => ({ v: u.number, l: `${unitLbl(u)} — ${P(u.owner)}` })) })}
        ${ui.field({ name: 'to', label: L('Proxy holder', 'حامل الوكالة'), type: 'select', full: true, options: C.members.map((x) => ({ v: x.p, l: `${P(x.p)} — ${tx(x.role)}` })).concat([{ v: 'other', l: L('Another owner…', 'مالك آخر…') }]) })}
        ${ui.field({ name: 'scope', label: L('Scope', 'النطاق'), type: 'select', full: true, options: [{ v: 'all', l: L('All agenda items', 'جميع بنود جدول الأعمال') }, { v: 'budget', l: L('Budget vote only', 'التصويت على الموازنة فقط') }] })}
        ${ui.field({ name: 'doc', label: L('Signed proxy form', 'نموذج الوكالة الموقّع'), type: 'file', full: true })}
      </div>`,
      foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${L('Register proxy', 'تسجيل الوكالة')}</button>` });
  };
  B.submit.cmProxy = () => { const m = meeting('MT-2612'); m.proxies += 1; m.rsvpUnits += 1; m.rsvpShare = Math.round((m.rsvpShare + 1.8) * 10) / 10; B.refresh(); B.success({ title: L('Proxy registered', 'تم تسجيل الوكالة'), text: L('The owner and the proxy holder were notified. Attendance projections were updated.', 'تم إشعار المالك وحامل الوكالة وتحديث توقعات الحضور.'), ref: 'PX-' + String(Date.now()).slice(-5) }); };
  A.cmResRegister = () => {
    const all = MEETINGS.filter((m) => m.res).flatMap((m) => m.res.map((r) => ({ ...r, m }))).sort((a, b) => (a.m.date < b.m.date ? 1 : -1));
    B.modal({ title: L('Resolutions register', 'سجل القرارات'), sub: L('All decisions of the general assembly and the committee', 'جميع قرارات الهيئة العامة واللجنة'), size: 'lg',
      body: ui.list(all.map((r) => ui.li({ icon: r.st === 'passed' ? 'checkCircle' : 'xCircle', tone: r.st === 'passed' ? 'mint' : 'bad', title: tx(r.t), sub: `${ui.idMono(r.id)} · ${tx(r.m.title)} · ${B.date(r.m.date)}`, end: r.mode === 'share' ? `<b class="small">${B.num1(r.v[0])}%</b>` : `<b class="small">${r.v[0]}/${B.sum(r.v)}</b>`, go: `${R}-meeting-${r.m.id}` }))),
      foot: ui.btn(L('Export register', 'تصدير السجل'), { icon: 'download', act: 'previewDoc', arg: L('Resolutions register 2026.pdf', 'سجل القرارات 2026.pdf') }) });
  };
  A.cmUpload = () => B.modal({ title: L('Upload document', 'رفع مستند'), form: 'cmUpload', size: 'sm', body: `<div class="stack">${ui.field({ name: 'name', label: L('Document name', 'اسم المستند'), required: true })}${ui.field({ name: 'file', type: 'file' })}</div>`, foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${icon('upload')}${L('Upload', 'رفع')}</button>` });
  B.submit.cmUpload = (d) => B.success({ title: L('Document uploaded', 'تم رفع المستند'), text: esc(d.name || ''), ref: 'DOC-' + String(Date.now()).slice(-5) });

  A.cmRemind = (id) => { const c = contrib.find((x) => x.id === id); if (!c) return; S.reminded[id] = true; B.refresh(); B.toast(L(`Reminder sent to ${P(c.owner)} (unit ${c.number})`, `تم إرسال تذكير إلى ${P(c.owner)} (الوحدة ${c.number})`)); };
  A.cmRemindAll = () => {
    const due = contrib.filter((c) => cOut(c) > 0 && !S.reminded[c.id]);
    if (!due.length) { B.toast(L('All owners with dues have already been reminded', 'تم تذكير جميع المالكين المستحق عليهم'), 'info'); return; }
    B.confirm({ title: L(`Send reminders to ${due.length} owners?`, `إرسال تذكير إلى ${due.length} مالكين؟`), text: L(`Total outstanding ${B.money(B.sum(due, cOut))}. Owners get an app notification and SMS with a BENA Pay link.`, `إجمالي المستحق ${B.money(B.sum(due, cOut))}. يصل للمالكين إشعار ورسالة قصيرة مع رابط الدفع عبر بينا.`), ok: L('Send reminders', 'إرسال التذكيرات'),
      onOk: () => { due.forEach((c) => { S.reminded[c.id] = true; }); B.closeModal(true); B.refresh(); B.toast(L(`${due.length} reminders sent`, `تم إرسال ${due.length} تذكيرات`)); } });
  };
  A.cmPay = (id) => {
    const c = contrib.find((x) => x.id === id); if (!c) return;
    B.modal({ title: L('Record payment', 'تسجيل دفعة'), sub: `${unitLbl(c.u)} · ${P(c.owner)}`, form: 'cmPay', size: 'sm',
      body: `<input type="hidden" name="id" value="${esc(id)}"><div class="stack">${ui.field({ name: 'amount', label: L('Amount (₪)', 'المبلغ (₪)'), type: 'number', value: cOut(c), required: true, min: 1 })}${ui.field({ name: 'method', label: L('Method', 'الطريقة'), type: 'select', options: [{ v: 'bank', l: L('Bank transfer', 'تحويل بنكي') }, { v: 'cash', l: L('Cash — treasurer', 'نقداً — أمين الصندوق') }, { v: 'cheque', l: L('Cheque', 'شيك') }] })}${ui.field({ name: 'date', label: L('Date received', 'تاريخ الاستلام'), type: 'date', value: '2026-11-25' })}</div>`,
      foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${L('Save & issue receipt', 'حفظ وإصدار إيصال')}</button>` });
  };
  B.submit.cmPay = (d) => { const c = contrib.find((x) => x.id === d.id); if (c) { S.paidNow[c.id] = Math.max(1, +d.amount || cOut(c)); c.lastPaid = '2026-11-25'; } B.refresh(); B.success({ title: L('Payment recorded', 'تم تسجيل الدفعة'), text: L('A receipt was sent to the owner and the ledger was updated.', 'تم إرسال إيصال للمالك وتحديث دفتر الحسابات.'), ref: 'RC-142-2611-' + String(Date.now()).slice(-3) }); };
  A.cmExpense = () => B.modal({ title: L('Record an expense', 'تسجيل مصروف'), form: 'cmExpense', size: 'md',
    body: `<div class="form-grid">${ui.field({ name: 'payee', label: L('Payee', 'المستفيد'), required: true, full: true })}${ui.field({ name: 'cat', label: L('Category', 'البند'), type: 'select', options: CATS.map((c) => ({ v: c.id, l: tx(c.n) })) })}${ui.field({ name: 'amount', label: L('Amount (₪)', 'المبلغ (₪)'), type: 'number', required: true, min: 1 })}${ui.field({ name: 'desc', label: L('Description', 'الوصف'), full: true })}${ui.field({ name: 'inv', label: L('Invoice', 'الفاتورة'), type: 'file', full: true })}</div>`,
    foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${L('Save expense', 'حفظ المصروف')}</button>` });
  B.submit.cmExpense = (d) => {
    const amt = Math.max(1, Math.round(+d.amount || 0));
    LEDGER.push({ id: 'EX-26-11' + String(LEDGER.length + 1).padStart(2, '0'), date: '2026-11-25', cat: d.cat || 'cleaning', payee: { en: d.payee || '—', ar: d.payee || '—' }, desc: { en: d.desc || '', ar: d.desc || '' }, amount: amt });
    monthCats[11] = CATS.map((c) => ({ id: c.id, v: actualOf(c.id) }));
    B.refresh();
    B.success({ title: L('Expense recorded', 'تم تسجيل المصروف'), text: amt > 3000 ? L('Above ₪3,000 — sent to the treasurer for a second signature.', 'أعلى من 3,000 ₪ — أُرسل لأمين الصندوق للتوقيع الثاني.') : L('Added to the November ledger.', 'أُضيف إلى دفتر تشرين الثاني.'), ref: LEDGER[LEDGER.length - 1].id });
  };
  A.cmExpDetail = (id) => { const x = LEDGER.find((e) => e.id === id); if (!x) return; B.modal({ title: tx(x.payee), sub: tx(x.desc), size: 'sm', body: ui.kv([[L('Reference', 'المرجع'), ui.idMono(x.id)], [L('Date', 'التاريخ'), B.date(x.date)], [L('Category', 'البند'), tx(cat(x.cat).n)], [L('Amount', 'المبلغ'), `<b>${B.money(x.amount)}</b>`], [L('Approved by', 'اعتمده'), x.amount > 3000 ? `${P('p_samer')} + ${P('p_hiba')}` : P('p_samer')], [L('Paid from', 'الدفع من'), tx(C.bank)]]), foot: ui.btn(L('View invoice', 'عرض الفاتورة'), { icon: 'doc', act: 'previewDoc', arg: `${x.id}.pdf` }) }); };

  A.cmReq = (id) => {
    const q = D.request(id); if (!q) return;
    const p = prov(q.provider);
    const steps = [{ title: L('Request submitted', 'تم تقديم الطلب'), meta: `${P(q.by)} · ${B.date(q.created)}`, state: 'done' }, { title: L('Reviewed by committee', 'مراجعة اللجنة'), meta: needsApproval(q) ? L('Waiting for approval', 'بانتظار الموافقة') : P('p_mona'), state: needsApproval(q) ? 'current' : 'done' }, { title: p ? L(`Assigned to ${tx(p.name)}`, `أُسند إلى ${tx(p.name)}`) : L('Assign a provider', 'إسناد مزوّد'), meta: q.visit ? L(`Visit ${B.date(q.visit)}`, `الزيارة ${B.date(q.visit)}`) : '', state: p ? (q.status === 'completed' ? 'done' : 'current') : '' }, { title: L('Completed & rated', 'مكتمل ومُقيّم'), meta: q.closed ? B.date(q.closed) : '', state: q.status === 'completed' ? 'done' : '' }];
    B.modal({ title: tx(q.title), sub: `${q.id} · ${D.cat(q.cat).name ? tx(D.cat(q.cat).name) : ''}`, size: 'md',
      body: `<div class="row-sm wrap" style="margin-bottom:14px">${ui.status(q.status)}${ui.status(q.priority)}${q.scope === 'common' ? ui.badge(L('Common area', 'منطقة مشتركة'), 'navy', 'building') : ui.badge(L('Unit ', 'الوحدة ') + (D.unit(q.unit)?.number || ''), 'neutral', 'home')}</div>${q.desc ? `<p class="muted" style="margin-bottom:16px">${tx(q.desc)}</p>` : ''}${ui.timeline(steps)}`,
      foot: needsApproval(q) ? `<button class="btn btn-ghost" data-act="closeModal">${L('Close', 'إغلاق')}</button>${ui.btn(L('Approve & assign', 'موافقة وإسناد'), { icon: 'check', kind: 'primary', act: 'cmApprove', arg: q.id })}` : `<button class="btn btn-ghost" data-act="cmMsgProv">${icon('chat')}${L('Message provider', 'مراسلة المزوّد')}</button><button class="btn btn-primary" data-act="closeModal">${L('Done', 'تم')}</button>` });
  };
  A.cmMsgProv = () => B.toast(L('Message thread opened with the provider (demo)', 'تم فتح محادثة مع المزوّد (تجريبي)'), 'info');
  A.cmApprove = (id) => {
    const q = D.request(id); if (!q) return;
    const opts = D.providers.filter((p) => p.areas.includes('masyoun') && (p.cats.includes(q.cat) || p.cats.includes('general')));
    B.modal({ title: L('Approve & assign provider', 'الموافقة وإسناد مزوّد'), sub: `${q.id} · ${tx(q.title)}`, form: 'cmApprove', size: 'md',
      body: `<input type="hidden" name="id" value="${esc(id)}"><div class="stack">
        ${ui.field({ name: 'provider', label: L('Provider', 'المزوّد'), type: 'radio', value: (opts[0] || {}).id, options: opts.map((p) => ({ v: p.id, l: tx(p.name), d: `★ ${p.rating} · ${tx(p.response)} · ${L('from', 'من')} ${B.money(p.from)}`, icon: p.verified ? 'badgeCheck' : 'user' })) })}
        <div class="form-grid">${ui.field({ name: 'cap', label: L('Approved budget (₪)', 'الموازنة المعتمدة (₪)'), type: 'number', value: 800, min: 1 })}${ui.field({ name: 'date', label: L('Preferred visit', 'موعد الزيارة المفضل'), type: 'date', value: '2026-11-27' })}</div>
        ${ui.callout(L('Within the chair\'s delegated authority (≤ ₪3,000). Charged to the common-expenses budget.', 'ضمن صلاحيات الرئيس المفوّضة (≤ 3,000 ₪). يُحمّل على موازنة المصاريف المشتركة.'), 'mint', 'shieldCheck')}
      </div>`,
      foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${icon('check')}${L('Approve', 'موافقة')}</button>` });
  };
  B.submit.cmApprove = (d) => {
    const q = D.request(d.id);
    if (q) { q.status = 'assigned'; q.provider = d.provider || q.provider || 'sp_sparkle'; if (/^\d{4}-\d{2}-\d{2}$/.test(d.date || '')) q.visit = d.date; }
    B.refresh();
    B.success({ title: L('Request approved', 'تمت الموافقة على الطلب'), text: L(`${tx(D.provider(q ? q.provider : 'sp_sparkle').name)} was notified and will confirm the visit.`, `تم إشعار ${tx(D.provider(q ? q.provider : 'sp_sparkle').name)} وسيؤكد موعد الزيارة.`), ref: d.id });
  };
  A.cmNewReq = () => B.modal({ title: L('New common-area request', 'طلب جديد لمنطقة مشتركة'), sub: tx(bld.name), form: 'cmNewReq', size: 'md',
    body: `<div class="form-grid">${ui.field({ name: 'title', label: L('What needs fixing?', 'ما الذي يحتاج إصلاحاً؟'), required: true, full: true })}${ui.field({ name: 'cat', label: L('Category', 'الفئة'), type: 'select', options: D.serviceCats.map((c) => ({ v: c.id, l: tx(c.name) })) })}${ui.field({ name: 'priority', label: L('Priority', 'الأولوية'), type: 'select', options: [{ v: 'low', l: L('Low', 'منخفضة') }, { v: 'medium', l: L('Medium', 'متوسطة') }, { v: 'high', l: L('High', 'عالية') }], value: 'medium' })}${ui.field({ name: 'desc', label: L('Details', 'التفاصيل'), type: 'textarea', full: true })}${ui.field({ name: 'photos', type: 'file', full: true })}</div>`,
    foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${L('Create request', 'إنشاء الطلب')}</button>` });
  B.submit.cmNewReq = (d) => {
    const id = 'MR-' + String(24600 + D.requests.length);
    const t = (d.title || '').trim() || L('Common-area request', 'طلب منطقة مشتركة');
    D.requests.unshift({ id, building: BID, unit: null, by: 'p_samer', cat: d.cat || 'general', title: { en: t, ar: t }, desc: d.desc ? { en: d.desc, ar: d.desc } : null, status: 'open', priority: d.priority || 'medium', created: '2026-11-25', provider: null, scope: 'common' });
    B.refresh();
    B.success({ title: L('Request created', 'تم إنشاء الطلب'), text: L('It is waiting for approval and provider assignment.', 'الطلب بانتظار الموافقة وإسناد مزوّد.'), ref: id });
  };
  A.cmInvite = () => B.modal({ title: L('Invite a member', 'دعوة عضو'), sub: L('Invite an owner to join the committee workspace', 'ادعُ مالكاً للانضمام إلى مساحة عمل اللجنة'), form: 'cmInvite', size: 'sm',
    body: `<div class="stack">${ui.field({ name: 'name', label: L('Full name', 'الاسم الكامل'), required: true })}${ui.field({ name: 'phone', label: L('Mobile', 'الجوال'), type: 'tel', placeholder: '+970 59 …' })}${ui.field({ name: 'role', label: L('Role', 'الدور'), type: 'select', options: [{ v: 'member', l: L('Member', 'عضو') }, { v: 'observer', l: L('Observer (no vote)', 'مراقب (بدون تصويت)') }] })}</div>`,
    foot: `<button type="button" class="btn btn-ghost" data-act="closeModal">${L('Cancel', 'إلغاء')}</button><button type="submit" class="btn btn-primary">${icon('send')}${L('Send invite', 'إرسال الدعوة')}</button>` });
  B.submit.cmInvite = (d) => B.success({ title: L('Invitation sent', 'تم إرسال الدعوة'), text: L(`${esc(d.name || '')} will receive an SMS with a link to verify ownership.`, `سيتلقى ${esc(d.name || '')} رسالة برابط للتحقق من الملكية.`), ref: 'INV-' + String(Date.now()).slice(-5) });
  A.cmMember = (pid) => {
    const m = C.members.find((x) => x.p === pid); if (!m) return;
    const p = D.person(pid);
    B.modal({ title: P(pid), sub: tx(m.role), size: 'sm',
      body: `<div class="row" style="margin-bottom:12px">${ui.avatar(p.name, 'lg')}<div>${m.delegated ? ui.status('cmHolds') : ui.status('active')}</div></div>${ui.kv([[L('Responsibilities', 'المسؤوليات'), tx(RESP[pid] || m.auth)], [L('Authority', 'الصلاحية'), tx(m.auth)], [L('Unit', 'الوحدة'), D.unit(m.unit) ? unitLbl(D.unit(m.unit)) : '—'], [L('Appointed', 'تاريخ التعيين'), B.date(m.since)], [L('Phone', 'الهاتف'), `<span class="ltr">${esc(p.phone || '—')}</span>`]].concat(m.delegated ? [[L('Proxy for', 'وكيل عن'), P(m.delegated)]] : []))}`,
      foot: `${ui.btn(L('Message', 'مراسلة'), { icon: 'chat', act: 'soon', arg: L('Messaging', 'المراسلة') })}${ui.btn(L('Call', 'اتصال'), { icon: 'phone', kind: 'primary', act: 'soon', arg: L('Calling', 'الاتصال') })}` });
  };

  /* ======================================================================
     Register role
     ====================================================================== */
  /* Internals shared with committee2.js (enterprise workspace screens). */
  B._cm = { C, BID, bld, units, totalArea, share, shareStr, unitLbl, contrib, cStatus, cOut, S, CATS, cat, BUDGET, LEDGER, actualOf, MONTHS, monthCats, expOf, incOf, INCOME, LEVY, PROJECT, closing, openingOf, fin, MEETINGS, meeting, kindStatus, upcoming, DELEG, DOCS, RESP, GOV, CAPS, govCard, voteBar, VOTE_C, VOTE_L, dateTile, P, prov, reqOpen, needsApproval,
    pages: { home, finance, statement, meetings, meetingDetail, maintenance, profile, members, announcements, services, building } };

  B.role({
    id: R, icon: 'users', nav: 'drawer',
    name: T('Building Committee', 'لجنة المبنى'),
    short: T('Committee', 'اللجنة'),
    org: T('Al-Masyoun Tower Owners\' Association', 'جمعية مالكي برج الماصيون'),
    tag: T('Governance', 'الحوكمة'),
    desc: T('Owners\' association workspace: finances, meetings, resolutions and building maintenance.', 'مساحة عمل جمعية المالكين: المالية والاجتماعات والقرارات وصيانة المبنى.'),
    personaTitle: T('Samer Khoury · Chair', 'سامر خوري · الرئيس'),
    home: 'home',
    menu: [
      { group: T('Workspace', 'مساحة العمل') },
      { id: 'home', label: T('Dashboard', 'لوحة التحكم'), tabLabel: T('Home', 'الرئيسية'), icon: 'grid', tab: true },
      { id: 'finance', label: T('Finances', 'المالية'), icon: 'wallet', tab: true, match: ['statement'] },
      { id: 'meetings', label: T('Meetings & decisions', 'الاجتماعات والقرارات'), tabLabel: T('Meetings', 'الاجتماعات'), icon: 'gavel', tab: true, match: ['meeting'] },
      { id: 'maintenance', label: T('Maintenance', 'الصيانة'), icon: 'wrench', tab: true },
      { group: T('Association', 'الجمعية') },
      { id: 'profile', label: T('Committee profile', 'ملف اللجنة'), icon: 'badgeCheck' },
      { id: 'members', label: T('Members & owners', 'الأعضاء والمالكون'), icon: 'users' },
      { id: 'announcements', label: T('Announcements', 'الإعلانات'), icon: 'megaphone' },
      { group: T('Building', 'المبنى') },
      { id: 'building', label: T('Building profile', 'ملف المبنى'), icon: 'building' },
      { id: 'services', label: T('Services marketplace', 'سوق الخدمات'), icon: 'handshake' },
    ],
    pages: { home, finance, statement, meetings, meeting: meetingDetail, maintenance, profile, members, announcements, services, building },
    notifications: () => [
      { icon: 'elevator', tone: 'bad', title: L('Elevator B — LiftLine technician on site today', 'المصعد ب — فني لفت لاين في الموقع اليوم'), sub: 'MR-24477', when: L('Today', 'اليوم'), go: `${R}-maintenance` },
      { icon: 'clipboard', tone: 'warn', title: L('Stairwell deep clean awaiting your approval', 'تنظيف الدرج العميق بانتظار موافقتك'), sub: L(`Requested by ${P('p_hiba')}`, `طلبته ${P('p_hiba')}`), when: L('2 days', 'يومان'), go: `${R}-maintenance` },
      { icon: 'userCheck', tone: 'info', title: L('6 proxies registered for the general assembly', 'تسجيل 6 وكالات للهيئة العامة'), sub: L('4 December · 52.3% of shares confirmed', '4 كانون الأول · 52.3% من الحصص مؤكدة'), when: L('Yesterday', 'أمس'), go: `${R}-meeting-MT-2612` },
      { icon: 'coins', tone: 'warn', title: L('3 units have 2+ months of arrears', '3 وحدات متأخرة شهرين فأكثر'), sub: L('Units 902, 1303 and G02', 'الوحدات 902 و1303 وG02'), when: L('3 days', '3 أيام'), go: `${R}-finance` },
      { icon: 'doc', tone: 'mint', title: L('October statement approved by the treasurer', 'اعتمدت أمينة الصندوق كشف تشرين الأول'), sub: L('Ready to share with owners', 'جاهز للمشاركة مع المالكين'), when: L('1 wk', 'أسبوع'), go: `${R}-statement-2026-10` },
    ],
  });
})();
