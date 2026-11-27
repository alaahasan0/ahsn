/*
 * BENA Mobile — Field Technician (Sanad Facility Services).
 * Designed for use while moving around a building: one-handed, big targets,
 * high contrast, glanceable status and a sticky primary action at the bottom.
 * All jobs, assets, people and readings are fictional sample data; status
 * changes, photos, scans, navigation and signatures are simulated in memory.
 */
(function () {
  const B = window.B, M = B.m, D = B.data;
  const { L, tx, icon, esc } = B;
  const T = (en, ar) => ({ en, ar });
  const R = 'tech';

  /* ======================================================================
     Styles (prefix mt-)
     ====================================================================== */
  B.css(`
  .mt-hero { background: var(--navy); color: #fff; border-radius: 24px; padding: 18px; display: flex; flex-direction: column; gap: 14px; position: relative; overflow: hidden; text-align: start; width: 100%; }
  .mt-hero::after { content: ""; position: absolute; inset-inline-end: -60px; top: -60px; width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(circle, rgba(54,214,160,.22), rgba(54,214,160,0) 70%); pointer-events: none; }
  .mt-hero .h-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .mt-hero .h-k { font-size: 13px; font-weight: 600; color: var(--navy-ink); text-transform: uppercase; letter-spacing: .06em; }
  html[dir="rtl"] .mt-hero .h-k { letter-spacing: 0; }
  .mt-hero h2 { color: #fff; font-size: 22px; line-height: 1.22; }
  .mt-hero .h-loc { display: flex; align-items: center; gap: 8px; color: var(--navy-ink); font-size: 15px; line-height: 1.35; }
  .mt-hero .h-loc svg { width: 18px; height: 18px; color: var(--mint); flex: none; }
  .mt-hero .h-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .mt-hero .h-meta > div { background: rgba(255,255,255,.07); border-radius: 14px; padding: 10px 12px; min-width: 0; }
  .mt-hero .h-meta small { display: block; font-size: 12px; color: var(--navy-ink); }
  .mt-hero .h-meta b { display: block; font-size: 16px; color: #fff; font-variant-numeric: tabular-nums; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mt-hero .h-acts { display: flex; gap: 10px; position: relative; z-index: 1; }
  .mt-hero .h-acts .mx-btn { min-height: 56px; font-size: 17px; border-radius: 16px; }
  .mt-hero .h-acts .mx-btn.primary { flex: 1; }
  .mt-hero .h-acts .mx-btn.glass { background: rgba(255,255,255,.1); color: #fff; width: 56px; padding: 0; flex: none; }
  .mt-pill { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 16px; font-size: 14px; font-weight: 700; white-space: nowrap; line-height: 1; }
  .mt-pill svg { width: 16px; height: 16px; }
  .mt-pill.sm { height: 26px; font-size: 12.5px; padding: 0 10px; gap: 5px; }
  .mt-pill.sm svg { width: 14px; height: 14px; }
  .mt-pill.neutral { background: #E3EAE7; color: #34475A; }
  .mt-pill.info { background: var(--info-bg); color: var(--info); }
  .mt-pill.violet { background: var(--violet-bg); color: var(--violet); }
  .mt-pill.mint { background: var(--mint); color: var(--navy); }
  .mt-pill.warn { background: var(--warn-bg); color: var(--warn); }
  .mt-pill.ok { background: var(--ok-bg); color: var(--ok); }
  .mt-pill.bad { background: var(--bad-bg); color: var(--bad); }
  .mt-hero .mt-pill.neutral, .mt-hero .mt-pill.info, .mt-hero .mt-pill.violet { background: rgba(255,255,255,.14); color: #fff; }
  .mt-stats { display: grid; grid-template-columns: repeat(3, 1fr); background: #fff; border: 1px solid var(--line-2); border-radius: 20px; }
  .mt-stats > button, .mt-stats > div { padding: 14px 10px; display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; min-height: 72px; justify-content: center; }
  .mt-stats > * + * { border-inline-start: 1px solid var(--line-2); }
  .mt-stats b { font: 700 24px/1.1 var(--font-display); font-variant-numeric: tabular-nums; }
  .mt-stats small { font-size: 13px; color: var(--text-2); font-weight: 500; }
  .mt-stats .alert b { color: var(--bad); }
  .mt-list { display: flex; flex-direction: column; gap: 10px; }
  .mt-job { position: relative; display: flex; align-items: stretch; gap: 0; width: 100%; text-align: start; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; min-height: 96px; overflow: hidden; }
  .mt-job:active { background: #F6F9F8; }
  .mt-job .j-bar { width: 5px; flex: none; background: var(--line); }
  .mt-job .j-bar.high, .mt-job .j-bar.critical { background: var(--bad); }
  .mt-job .j-bar.medium { background: #E9A23B; }
  .mt-job .j-bar.low { background: #B6C2BD; }
  .mt-job .j-time { width: 72px; flex: none; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; border-inline-end: 1px solid var(--line-2); padding: 10px 4px; }
  .mt-job .j-time b { font: 700 19px/1 var(--font-display); font-variant-numeric: tabular-nums; direction: ltr; }
  .mt-job .j-time small { font-size: 12px; color: var(--text-3); font-weight: 600; text-align: center; }
  .mt-job .j-b { flex: 1; min-width: 0; padding: 13px 14px; display: flex; flex-direction: column; gap: 6px; justify-content: center; }
  .mt-job .j-t { font-size: 17px; font-weight: 700; line-height: 1.25; }
  .mt-job .j-s { font-size: 14px; color: var(--text-2); line-height: 1.35; display: flex; gap: 6px; align-items: center; }
  .mt-job .j-s svg { width: 15px; height: 15px; flex: none; color: var(--text-3); }
  .mt-job .j-tags { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  .mt-job .j-c { align-self: center; width: 20px; height: 20px; color: #B6C2BD; margin-inline-end: 12px; flex: none; }
  .mt-job.cur { border-color: var(--mint); box-shadow: 0 0 0 3px rgba(54,214,160,.18); }
  /* job header */
  .mt-head { display: flex; flex-direction: column; gap: 10px; }
  .mt-head .hd-tags { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .mt-head h2 { font-size: 24px; line-height: 1.2; letter-spacing: -.015em; }
  .mt-head .hd-loc { display: flex; gap: 8px; align-items: flex-start; font-size: 15px; color: var(--text-2); line-height: 1.4; }
  .mt-head .hd-loc svg { width: 18px; height: 18px; flex: none; margin-top: 1px; color: var(--mint-ink); }
  .mt-track { display: flex; align-items: flex-start; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 16px 6px 14px; }
  .mt-track .s { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 600; color: var(--text-3); position: relative; text-align: center; line-height: 1.2; min-width: 0; }
  .mt-track .s i { width: 30px; height: 30px; border-radius: 50%; background: #fff; border: 2px solid var(--line); display: grid; place-items: center; position: relative; z-index: 1; color: var(--text-3); }
  .mt-track .s i svg { width: 16px; height: 16px; }
  .mt-track .s + .s::before { content: ""; position: absolute; top: 14px; inset-inline-end: 50%; width: 100%; height: 2px; background: var(--line); }
  .mt-track .s.done i { background: var(--mint); border-color: var(--mint); color: var(--navy); }
  .mt-track .s.done::before, .mt-track .s.cur::before { background: var(--mint) !important; }
  .mt-track .s.cur { color: var(--ink); }
  .mt-track .s.cur i { border-color: var(--mint-ink); color: var(--mint-ink); box-shadow: 0 0 0 5px rgba(54,214,160,.2); }
  .mt-track .s.paused i { border-color: var(--warn); color: var(--warn); box-shadow: 0 0 0 5px rgba(233,162,59,.18); }
  .mt-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .mt-tile { background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 14px; min-height: 112px; display: flex; flex-direction: column; gap: 8px; text-align: start; position: relative; }
  .mt-tile:active { background: #F6F9F8; }
  .mt-tile .t-i { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; background: var(--line-2); color: var(--navy); }
  .mt-tile .t-i svg { width: 22px; height: 22px; }
  .mt-tile b { font-size: 16px; line-height: 1.25; }
  .mt-tile small { font-size: 13.5px; color: var(--text-2); line-height: 1.3; }
  .mt-tile.ok .t-i { background: var(--mint-50); color: var(--mint-ink); }
  .mt-tile.warn .t-i { background: var(--warn-bg); color: var(--warn); }
  .mt-tile .t-ck { position: absolute; top: 12px; inset-inline-end: 12px; width: 22px; height: 22px; border-radius: 50%; background: var(--mint); color: var(--navy); display: grid; place-items: center; }
  .mt-tile .t-ck svg { width: 14px; height: 14px; }
  .mt-tile .progress { margin-top: auto; }
  .mt-safety { background: #FFF8EC; border: 1px solid #F4D9A8; border-radius: 20px; padding: 16px; display: flex; flex-direction: column; gap: 12px; text-align: start; width: 100%; }
  .mt-safety .sf-h { display: flex; gap: 10px; align-items: center; font-weight: 700; font-size: 16px; color: #8A4108; }
  .mt-safety .sf-h svg { width: 22px; height: 22px; color: var(--warn); flex: none; }
  .mt-safety ul { margin: 0; padding-inline-start: 20px; display: flex; flex-direction: column; gap: 6px; font-size: 14.5px; color: #6B3A0C; line-height: 1.4; }
  .mt-ppe { display: flex; gap: 8px; flex-wrap: wrap; }
  .mt-ppe span { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 16px; background: #fff; border: 1px solid #F0D3A0; font-size: 13.5px; font-weight: 600; color: #7A4A12; }
  .mt-ppe svg { width: 16px; height: 16px; color: var(--warn); }
  /* sticky dock */
  .mx-screen > div:has(.mt-dock) { min-height: 100%; display: flex; flex-direction: column; }
  .mx-screen > div:has(.mt-dock) > .mx-body { flex: 1; }
  .mt-dock { position: sticky; bottom: 0; z-index: 4; margin: auto -16px -28px; padding: 12px 16px 30px; background: rgba(244,247,246,.88); backdrop-filter: saturate(1.6) blur(18px); -webkit-backdrop-filter: saturate(1.6) blur(18px); border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 8px; }
  .mt-dock .d-row { display: flex; gap: 10px; }
  .mt-dock .mx-btn { min-height: 58px; font-size: 17px; border-radius: 17px; }
  .mt-dock .mx-btn svg { width: 22px; height: 22px; }
  .mt-dock .mx-btn.grow { flex: 1; min-width: 0; }
  .mt-dock .mx-btn.sq { width: 58px; padding: 0; flex: none; }
  .mt-dock .d-hint { font-size: 13px; color: var(--text-2); text-align: center; display: flex; gap: 6px; justify-content: center; align-items: center; }
  .mt-dock .d-hint svg { width: 15px; height: 15px; }
  .mx-phone.white .mt-dock { background: rgba(255,255,255,.9); }
  .mx-phone.has-tabs .mx-body:has(> .mt-dock) { padding-bottom: 85px; }
  .mx-phone.has-tabs .mt-dock { bottom: 85px; margin-bottom: 0; padding-bottom: 12px; }
  @media (max-width: 760px) { .mt-dock { padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px)); } }
  /* steps */
  .mt-prog { display: flex; align-items: center; gap: 16px; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 16px; }
  .mt-prog .ring { position: relative; width: 68px; height: 68px; flex: none; }
  .mt-prog .ring svg { width: 68px; height: 68px; transform: rotate(-90deg); }
  html[dir="rtl"] .mt-prog .ring svg { transform: rotate(-90deg) scaleY(-1); }
  .mt-prog .ring b { position: absolute; inset: 0; display: grid; place-items: center; font: 700 17px/1 var(--font-display); font-variant-numeric: tabular-nums; direction: ltr; }
  .mt-prog .p-t { font-size: 18px; font-weight: 700; }
  .mt-prog .p-s { font-size: 14px; color: var(--text-2); margin-top: 2px; }
  .mt-steps { background: #fff; border: 1px solid var(--line-2); border-radius: 20px; overflow: hidden; }
  .mt-step { display: flex; gap: 14px; align-items: flex-start; padding: 16px; min-height: 72px; width: 100%; text-align: start; position: relative; background: #fff; }
  .mt-step + .mt-step::before { content: ""; position: absolute; top: 0; inset-inline: 62px 0; border-top: 1px solid var(--line-2); }
  .mt-step:active { background: #F3F6F5; }
  .mt-step .ck { width: 34px; height: 34px; border-radius: 50%; border: 2px solid #C3CEC9; display: grid; place-items: center; flex: none; font: 700 15px/1 var(--font-display); color: var(--text-2); transition: background .15s, border-color .15s; }
  .mt-step .ck svg { width: 18px; height: 18px; }
  .mt-step.done .ck { background: var(--mint); border-color: var(--mint); color: var(--navy); }
  .mt-step.done .st-t { color: var(--text-3); }
  .mt-step.next { background: #F5FCF9; }
  .mt-step.next .ck { border-color: var(--mint-ink); color: var(--mint-ink); box-shadow: 0 0 0 4px rgba(54,214,160,.16); }
  .mt-step .st-b { flex: 1; min-width: 0; }
  .mt-step .st-t { font-size: 16.5px; font-weight: 600; line-height: 1.35; }
  .mt-step .st-s { font-size: 14px; color: var(--text-2); margin-top: 4px; line-height: 1.4; }
  .mt-step .st-flag { display: inline-flex; align-items: center; gap: 5px; margin-top: 8px; height: 24px; padding: 0 9px; border-radius: 12px; background: var(--warn-bg); color: var(--warn); font-size: 12.5px; font-weight: 700; }
  .mt-step .st-flag svg { width: 13px; height: 13px; }
  /* photos */
  .mt-photos { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .mt-shot { display: flex; flex-direction: column; gap: 7px; text-align: start; position: relative; width: 100%; }
  .mt-shot .mx-photo { aspect-ratio: 4 / 3; border-radius: 18px; position: relative; }
  .mt-shot .mx-photo:not(.filled) { background: #fff; border-color: #BCC9C3; color: var(--mint-ink); }
  .mt-shot .mx-photo:not(.filled) svg { width: 30px; height: 30px; }
  .mt-shot .mx-photo.filled svg { position: absolute; inset: 0; }
  .mt-shot .sh-stamp { position: absolute; inset-inline-start: 8px; bottom: 8px; background: rgba(13,31,43,.72); color: #fff; font-size: 11.5px; font-weight: 600; padding: 3px 8px; border-radius: 8px; font-variant-numeric: tabular-nums; direction: ltr; }
  .mt-shot .sh-ok { position: absolute; top: 8px; inset-inline-end: 8px; width: 26px; height: 26px; border-radius: 50%; background: var(--mint); color: var(--navy); display: grid; place-items: center; box-shadow: 0 2px 6px rgba(0,0,0,.15); }
  .mt-shot .sh-ok svg { width: 15px; height: 15px; }
  .mt-shot .sh-l { font-size: 14.5px; font-weight: 600; line-height: 1.3; }
  .mt-shot .sh-s { font-size: 12.5px; color: var(--text-3); margin-top: -3px; }
  .mt-shot.next .mx-photo { border-color: var(--mint-ink); border-style: solid; box-shadow: 0 0 0 4px rgba(54,214,160,.16); }
  .mt-flash { position: absolute; inset: 0; z-index: 40; background: #fff; pointer-events: none; animation: mtFlash .45s ease-out forwards; }
  @keyframes mtFlash { from { opacity: .95; } to { opacity: 0; } }
  /* location */
  .mt-mapwrap { position: relative; border-radius: 22px; overflow: hidden; }
  .mt-mapwrap .map-shell { border-radius: 22px; border: 0; }
  .mt-nav { background: var(--navy); color: #fff; border-radius: 22px; padding: 16px; display: flex; gap: 14px; align-items: center; }
  .mt-nav .n-i { width: 56px; height: 56px; border-radius: 16px; background: var(--mint); color: var(--navy); display: grid; place-items: center; flex: none; }
  .mt-nav .n-i svg { width: 30px; height: 30px; }
  .mt-nav b { font-size: 19px; color: #fff; display: block; line-height: 1.25; }
  .mt-nav small { font-size: 14px; color: var(--navy-ink); display: block; margin-top: 3px; }
  .mt-addr { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
  .mt-addr h2 { font-size: 21px; line-height: 1.2; }
  .mt-addr p { font-size: 14.5px; color: var(--text-2); margin-top: 3px; }
  .mt-eta { text-align: end; flex: none; }
  .mt-eta b { font: 700 22px/1 var(--font-display); display: block; font-variant-numeric: tabular-nums; }
  .mt-eta small { font-size: 13px; color: var(--text-2); }
  .mt-way { display: grid; grid-template-columns: 92px 1fr; gap: 12px; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 16px 14px; }
  .mt-floors { display: flex; flex-direction: column; gap: 3px; }
  .mt-floors .f { height: 17px; border-radius: 5px; background: #E9EFEC; display: flex; align-items: center; justify-content: space-between; padding: 0 6px; font-size: 10.5px; font-weight: 700; color: var(--text-3); font-variant-numeric: tabular-nums; }
  .mt-floors .f svg { width: 11px; height: 11px; }
  .mt-floors .f.tgt { background: var(--mint); color: var(--navy); height: 22px; font-size: 12px; }
  .mt-floors .f.ent { background: var(--navy); color: #fff; }
  .mt-floors .f.park { background: #DCE4EA; color: var(--navy); }
  .mt-floors .f.roof { background: transparent; border: 1.5px dashed #C3CEC9; }
  .mt-dirs { display: flex; flex-direction: column; }
  .mt-dir { display: flex; gap: 12px; position: relative; padding-bottom: 16px; }
  .mt-dir:last-child { padding-bottom: 0; }
  .mt-dir .d-i { width: 34px; height: 34px; border-radius: 11px; background: var(--line-2); color: var(--navy); display: grid; place-items: center; flex: none; position: relative; z-index: 1; }
  .mt-dir .d-i svg { width: 18px; height: 18px; }
  .mt-dir:not(:last-child)::before { content: ""; position: absolute; inset-inline-start: 16px; top: 34px; bottom: 0; width: 2px; background: var(--line); }
  .mt-dir:last-child .d-i { background: var(--mint); }
  .mt-dir b { font-size: 15px; display: block; line-height: 1.3; }
  .mt-dir small { font-size: 13.5px; color: var(--text-2); display: block; margin-top: 2px; line-height: 1.4; }
  /* asset */
  .mt-tag { background: var(--navy); color: #fff; border-radius: 24px; padding: 18px; display: flex; gap: 16px; align-items: center; }
  .mt-tag .qr { width: 86px; height: 86px; background: #fff; border-radius: 14px; padding: 8px; flex: none; }
  .mt-tag .qr svg { width: 100%; height: 100%; display: block; }
  .mt-tag small { font-size: 12.5px; color: var(--navy-ink); text-transform: uppercase; letter-spacing: .06em; font-weight: 600; display: block; }
  html[dir="rtl"] .mt-tag small { letter-spacing: 0; }
  .mt-tag .id-mono { font-size: 18px; color: var(--mint); margin: 4px 0 6px; font-weight: 600; }
  .mt-tag b { display: block; font-size: 17px; color: #fff; line-height: 1.3; }
  .mt-specs { display: grid; grid-template-columns: 1fr 1fr; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; overflow: hidden; }
  .mt-specs > div { padding: 13px 16px; border-bottom: 1px solid var(--line-2); min-width: 0; }
  .mt-specs > div:nth-child(odd) { border-inline-end: 1px solid var(--line-2); }
  .mt-specs > div:nth-last-child(-n+2) { border-bottom: 0; }
  .mt-specs small { display: block; font-size: 12.5px; color: var(--text-3); font-weight: 600; }
  .mt-specs b { display: block; font-size: 15px; margin-top: 3px; line-height: 1.3; overflow-wrap: anywhere; }
  /* scan */
  .mt-scan { position: relative; background: #0B1218; border-radius: 28px; overflow: hidden; aspect-ratio: 4 / 5; display: grid; place-items: center; }
  .mt-scan .feed { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 45%, #2B3A46 0%, #121C24 60%, #0B1218 100%); }
  .mt-scan .plate { position: relative; width: 46%; aspect-ratio: 1; background: #F4F1EA; border-radius: 12px; padding: 10%; box-shadow: 0 10px 30px rgba(0,0,0,.4); transform: rotate(-4deg); opacity: .9; }
  .mt-scan .plate svg { width: 100%; height: 100%; display: block; }
  .mt-scan .vf { position: absolute; width: 64%; aspect-ratio: 1; }
  .mt-scan .vf i { position: absolute; width: 38px; height: 38px; border: 4px solid var(--mint); }
  .mt-scan .vf i:nth-child(1) { top: 0; left: 0; border-right: 0; border-bottom: 0; border-radius: 12px 0 0 0; }
  .mt-scan .vf i:nth-child(2) { top: 0; right: 0; border-left: 0; border-bottom: 0; border-radius: 0 12px 0 0; }
  .mt-scan .vf i:nth-child(3) { bottom: 0; left: 0; border-right: 0; border-top: 0; border-radius: 0 0 0 12px; }
  .mt-scan .vf i:nth-child(4) { bottom: 0; right: 0; border-left: 0; border-top: 0; border-radius: 0 0 12px 0; }
  .mt-scan .vf .ln { position: absolute; left: 6%; right: 6%; height: 3px; border-radius: 3px; background: var(--mint); box-shadow: 0 0 16px 2px rgba(54,214,160,.7); animation: mtScan 2s ease-in-out infinite alternate; }
  @keyframes mtScan { from { top: 8%; } to { top: 90%; } }
  .mt-scan .cap { position: absolute; top: 16px; inset-inline: 16px; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .mt-scan .cap span { background: rgba(255,255,255,.12); color: #fff; font-size: 12.5px; font-weight: 600; padding: 6px 11px; border-radius: 12px; backdrop-filter: blur(8px); }
  .mt-scan .hint { position: absolute; bottom: 18px; inset-inline: 16px; text-align: center; color: #fff; font-size: 15px; font-weight: 600; }
  .mt-scan.found .vf i { border-color: #fff; }
  .mt-scan.found .vf .ln { display: none; }
  .mt-found { background: #fff; border: 1.5px solid var(--mint); border-radius: 20px; padding: 14px 16px; display: flex; gap: 14px; align-items: center; width: 100%; text-align: start; box-shadow: 0 0 0 4px rgba(54,214,160,.14); }
  .mt-found .f-i { width: 46px; height: 46px; border-radius: 14px; background: var(--mint); color: var(--navy); display: grid; place-items: center; flex: none; }
  .mt-found b { display: block; font-size: 16px; }
  .mt-found small { display: block; font-size: 13.5px; color: var(--text-2); margin-top: 2px; }
  /* status options */
  .mt-opts { display: flex; flex-direction: column; gap: 10px; }
  .mt-opt { display: flex; gap: 14px; align-items: center; min-height: 72px; padding: 14px 16px; background: #fff; border: 1.5px solid var(--line-2); border-radius: 20px; width: 100%; text-align: start; }
  .mt-opt .o-i { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; background: var(--line-2); color: var(--navy); flex: none; }
  .mt-opt .o-i svg { width: 22px; height: 22px; }
  .mt-opt b { display: block; font-size: 16.5px; }
  .mt-opt small { display: block; font-size: 13.5px; color: var(--text-2); margin-top: 2px; line-height: 1.35; }
  .mt-opt .o-r { width: 26px; height: 26px; border-radius: 50%; border: 2px solid #C3CEC9; flex: none; margin-inline-start: auto; display: grid; place-items: center; }
  .mt-opt.on { border-color: var(--mint-ink); background: #F5FCF9; }
  .mt-opt.on .o-r { border-color: var(--mint-ink); background: var(--mint-ink); box-shadow: inset 0 0 0 4px #F5FCF9; }
  .mt-opt.cur .o-i { background: var(--navy); color: var(--mint); }
  .mt-opt .mc-c { width: 20px; height: 20px; color: #B6C2BD; margin-inline-start: auto; flex: none; }
  .mt-opt .o-now { font-size: 12px; font-weight: 700; color: var(--mint-ink); text-transform: uppercase; letter-spacing: .05em; }
  html[dir="rtl"] .mt-opt .o-now { letter-spacing: 0; }
  .mt-switch { width: 51px; height: 31px; border-radius: 16px; background: #D5DEDA; position: relative; flex: none; margin-inline-start: auto; transition: background .2s; }
  .mt-switch::after { content: ""; position: absolute; top: 2px; inset-inline-start: 2px; width: 27px; height: 27px; border-radius: 50%; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,.18); transition: inset-inline-start .2s; }
  .mt-switch.on { background: var(--mint); }
  .mt-switch.on::after { inset-inline-start: 22px; }
  .mt-log { background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 16px; display: flex; flex-direction: column; }
  .mt-log .lg { display: grid; grid-template-columns: 52px 18px 1fr; gap: 10px; position: relative; padding-bottom: 14px; }
  .mt-log .lg:last-child { padding-bottom: 0; }
  .mt-log .lg time { font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; direction: ltr; text-align: end; }
  html[dir="rtl"] .mt-log .lg time { text-align: start; }
  .mt-log .lg .dot { width: 12px; height: 12px; border-radius: 50%; background: var(--mint); margin: 4px auto 0; position: relative; z-index: 1; box-shadow: 0 0 0 3px #fff; }
  .mt-log .lg:not(:last-child)::before { content: ""; position: absolute; top: 10px; bottom: -4px; inset-inline-start: calc(52px + 10px + 8px); width: 2px; background: var(--line); }
  .mt-log .lg b { font-size: 15px; display: block; }
  .mt-log .lg small { font-size: 13px; color: var(--text-2); display: block; margin-top: 2px; }
  /* completion */
  .mt-sum { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .mt-sum > div { background: #fff; border: 1px solid var(--line-2); border-radius: 18px; padding: 14px; }
  .mt-sum small { font-size: 13px; color: var(--text-2); font-weight: 500; display: flex; gap: 6px; align-items: center; }
  .mt-sum small svg { width: 15px; height: 15px; }
  .mt-sum b { font: 700 22px/1.15 var(--font-display); display: block; margin-top: 4px; font-variant-numeric: tabular-nums; }
  .mt-sum .warn b { color: var(--warn); }
  .mt-qty { display: flex; align-items: center; gap: 4px; flex: none; }
  .mt-qty button { width: 40px; height: 40px; border-radius: 12px; background: var(--line-2); display: grid; place-items: center; color: var(--navy); }
  .mt-qty button svg { width: 18px; height: 18px; }
  .mt-qty b { min-width: 30px; text-align: center; font-size: 17px; font-variant-numeric: tabular-nums; }
  .mt-part { display: flex; gap: 12px; align-items: center; padding: 12px 14px 12px 16px; min-height: 64px; position: relative; }
  .mt-part + .mt-part::before { content: ""; position: absolute; top: 0; inset-inline: 16px 0; border-top: 1px solid var(--line-2); }
  .mt-part .p-b { flex: 1; min-width: 0; }
  .mt-part .p-b b { font-size: 15.5px; display: block; line-height: 1.3; }
  .mt-part .p-b small { font-size: 13px; color: var(--text-2); }
  .mt-sig { position: relative; background: #fff; border: 1.5px dashed #BCC9C3; border-radius: 20px; height: 176px; touch-action: none; overflow: hidden; }
  .mt-sig.signed { border-style: solid; border-color: var(--mint); }
  .mt-sig canvas { width: 100%; height: 100%; display: block; cursor: crosshair; }
  .mt-sig .ph { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: var(--text-3); pointer-events: none; font-size: 15px; font-weight: 600; }
  .mt-sig .ph svg { width: 26px; height: 26px; }
  .mt-sig .base { position: absolute; inset-inline: 22px; bottom: 38px; border-bottom: 1.5px solid var(--line); pointer-events: none; }
  .mt-sig .x { position: absolute; inset-inline-start: 22px; bottom: 44px; font-size: 18px; color: var(--text-3); pointer-events: none; }
  #mt-sigclear[hidden] { display: none; }
  .mt-sig-img { background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 12px; }
  .mt-sig-img img, .mt-sig-img svg { width: 100%; height: 120px; object-fit: contain; display: block; }
  .mt-done { background: var(--mint-50); border: 1px solid var(--mint-100); border-radius: 22px; padding: 18px; display: flex; gap: 14px; align-items: center; }
  .mt-done .d-i { width: 52px; height: 52px; border-radius: 16px; background: var(--mint); color: var(--navy); display: grid; place-items: center; flex: none; }
  .mt-done .d-i svg { width: 26px; height: 26px; }
  .mt-done b { font-size: 17px; display: block; }
  .mt-done small { font-size: 14px; color: #0A6E4D; display: block; margin-top: 2px; }
  .mt-me { display: flex; gap: 16px; align-items: center; background: #fff; border: 1px solid var(--line-2); border-radius: 22px; padding: 18px; }
  .mt-me .avatar { width: 64px; height: 64px; font-size: 22px; }
  .mt-me b { font-size: 19px; display: block; }
  .mt-me small { font-size: 14px; color: var(--text-2); display: block; margin-top: 2px; }
  .mt-shift { display: inline-flex; align-items: center; gap: 7px; height: 34px; padding: 0 13px; border-radius: 17px; background: var(--mint-50); color: var(--mint-ink); font-size: 14px; font-weight: 700; white-space: nowrap; }
  .mt-shift i { width: 9px; height: 9px; border-radius: 50%; background: var(--mint); box-shadow: 0 0 0 3px rgba(54,214,160,.25); }
  .mt-shift.off { background: var(--warn-bg); color: var(--warn); }
  .mt-shift.off i { background: #E9A23B; box-shadow: 0 0 0 3px rgba(233,162,59,.25); }
  .mt-note { font-size: 13px; color: var(--text-3); text-align: center; display: flex; gap: 6px; align-items: center; justify-content: center; padding: 0 12px; line-height: 1.4; }
  .mt-note svg { width: 14px; height: 14px; flex: none; }
  .mt-brief { font-size: 15.5px; line-height: 1.55; color: var(--ink); }
  .mt-route .mx-cell .mc-i { font: 700 16px/1 var(--font-display); }
  `);

  /* ======================================================================
     Sample data
     ====================================================================== */
  const ME = { name: T('Mahmoud Darwish', 'محمود درويش'), role: T('HVAC & BMS technician', 'فني تكييف وأنظمة إدارة المباني'), id: 'SND-T-014', org: 'org_sanad', phone: '+970 59 377 2190' };
  const orgName = () => tx((D.org && D.org('org_sanad') && D.org('org_sanad').name) || T('Sanad Facility Services', 'سند لخدمات إدارة المرافق'));
  const bld = (id) => (D.building && D.building(id)) || { id, name: T('Sample building', 'مبنى نموذجي'), floors: 6, street: T('Ramallah', 'رام الله') };
  const bname = (id) => tx(bld(id).name);
  const pname = (p) => (D.pname ? D.pname(p) : p);

  /* Floors per site: [label, kind] from top to bottom */
  const FLOORS = {
    'BN-RAM-00311': { top: 12, base: ['G', 'B1', 'B2'], entrance: 'G', parking: 'B1' },
    'BN-RAM-00415': { top: 9, base: ['G', 'B1'], entrance: 'G', parking: 'B1' },
    'BN-RAM-00618': { top: 7, base: ['G', 'B1'], entrance: 'G', parking: 'B1' },
  };

  const ASSETS = {
    'SND-311-HV-AHU02': { b: 'BN-RAM-00311', cat: 'hvac', name: T('AHU — floors 5–8 (VAV)', 'وحدة مناولة هواء — الطوابق 5–8 (VAV)'), loc: T('Plant room L5 · serves zone 7B', 'غرفة المعدات ط5 · تخدم المنطقة 7ب'), cond: 'fair', year: 2019, last: '2026-11-02', next: '2026-12-02', make: T('Demo AirSystems DAS-160', 'ديمو إير سيستمز DAS-160'), serial: 'DAS16-19-0442', specs: [[T('Airflow', 'تدفق الهواء'), '16,000 m³/h'], [T('Fan motor', 'محرك المروحة'), T('7.5 kW · VFD', '7.5 ك.واط · VFD')], [T('Filters', 'الفلاتر'), 'G4 + F7'], [T('Terminal units', 'الوحدات الطرفية'), T('22 VAV boxes', '22 صندوق VAV')], [T('Controls', 'التحكم'), 'BACnet MS/TP'], [T('Criticality', 'الأهمية'), T('B — comfort', 'ب — راحة')]],
      hist: [['2026-11-02', T('Quarterly PM — filters G4 replaced', 'صيانة ربعية — استبدال فلاتر G4'), 'Mahmoud D.'], ['2026-09-18', T('Fan belt replaced (SPA 1250)', 'استبدال سير المروحة (SPA 1250)'), 'Yazan K.'], ['2026-07-12', T('VFD parameters updated after BMS audit', 'تحديث إعدادات VFD بعد تدقيق BMS'), 'Nour H.'], ['2026-05-03', T('Cooling coil chemical clean', 'تنظيف كيميائي لملف التبريد'), 'Mahmoud D.']] },
    'SND-415-HV-FAU': { b: 'BN-RAM-00415', cat: 'hvac', name: T('Fresh-air unit — retail mall', 'وحدة هواء نقي — المركز التجاري'), loc: T('Plant room L1, retail side', 'غرفة المعدات ط1، جهة المحلات'), cond: 'poor', year: 2015, last: '2026-08-10', next: '2026-11-10', make: T('Demo AirSystems FAU-120', 'ديمو إير سيستمز FAU-120'), serial: 'FAU12-15-0107', specs: [[T('Airflow', 'تدفق الهواء'), '12,000 m³/h'], [T('Drive', 'نظام الإدارة'), T('Belt · 2 × SPA 1400', 'سيور · 2 × SPA 1400')], [T('Filters', 'الفلاتر'), T('G4 panel ×8', 'G4 لوحية ×8')], [T('Heat recovery', 'استرجاع الحرارة'), T('Plate exchanger', 'مبادل صفائحي')], [T('Controls', 'التحكم'), 'BACnet/IP'], [T('Criticality', 'الأهمية'), T('B — air quality', 'ب — جودة الهواء')]],
      hist: [['2026-08-10', T('Quarterly PM — filters & belt tension', 'صيانة ربعية — الفلاتر وشد السيور'), 'Mahmoud D.'], ['2026-05-14', T('Bearing noise — greased, monitored', 'صوت محامل — تشحيم ومتابعة'), 'Ahmad J.'], ['2026-02-09', T('Quarterly PM', 'صيانة ربعية'), 'Mahmoud D.']] },
    'SND-618-HV-AHU02': { b: 'BN-RAM-00618', cat: 'hvac', name: T('AHU with HEPA — day surgery L4', 'وحدة مناولة هواء HEPA — جراحة اليوم الواحد ط4'), loc: T('Plant room L4', 'غرفة المعدات ط4'), cond: 'good', year: 2021, last: '2026-10-27', next: '2026-11-27', make: T('Demo CleanAir CA-80H', 'ديمو كلين إير CA-80H'), serial: 'CA80H-21-0019', specs: [[T('Airflow', 'تدفق الهواء'), '8,000 m³/h'], [T('Final filter', 'الفلتر النهائي'), 'HEPA H14'], [T('Pre-filters', 'الفلاتر الأولية'), 'F7 bag ×4'], [T('Room pressure', 'ضغط الغرفة'), '+15 Pa'], [T('Controls', 'التحكم'), 'BACnet/IP'], [T('Criticality', 'الأهمية'), T('A — clinical', 'أ — طبية')]],
      hist: [['2026-10-30', T('Pressure alarm — damper re-calibrated', 'إنذار ضغط — إعادة معايرة البوابة'), 'Mahmoud D.'], ['2026-10-27', T('Monthly PM — differential pressure log', 'صيانة شهرية — سجل فرق الضغط'), 'Mahmoud D.'], ['2026-07-21', T('HEPA integrity test (DOP)', 'اختبار سلامة HEPA (DOP)'), T('External lab', 'مختبر خارجي')]] },
    'SND-311-HV-AHU01': { b: 'BN-RAM-00311', cat: 'hvac', name: T('AHU — lobby & floors 1–4', 'وحدة مناولة هواء — الردهة والطوابق 1–4'), loc: T('Plant room L1', 'غرفة المعدات ط1'), cond: 'fair', year: 2019, last: '2026-11-02', next: '2026-12-02', make: T('Demo AirSystems DAS-180', 'ديمو إير سيستمز DAS-180'), serial: 'DAS18-19-0438', specs: [[T('Airflow', 'تدفق الهواء'), '18,000 m³/h'], [T('Fan motor', 'محرك المروحة'), T('11 kW · VFD', '11 ك.واط · VFD')], [T('Bearings', 'المحامل'), '6308-2RS ×2'], [T('Filters', 'الفلاتر'), 'G4 + F7'], [T('Controls', 'التحكم'), 'BACnet MS/TP'], [T('Criticality', 'الأهمية'), T('B — comfort', 'ب — راحة')]],
      hist: [['2026-11-24', T('Bearing noise — diagnosed, part ordered', 'صوت محمل — تم التشخيص وطلب القطعة'), 'Mahmoud D.'], ['2026-10-27', T('Filters replaced', 'استبدال الفلاتر'), 'Mahmoud D.']] },
    'SND-311-HV-CH02': { b: 'BN-RAM-00311', cat: 'hvac', name: T('Air-cooled chiller 2 (400 kW)', 'مبرّد هوائي 2 (400 ك.واط)'), loc: T('Roof plant deck', 'منصة المعدات على السطح'), cond: 'fair', year: 2019, last: '2026-08-30', next: '2026-11-30', make: T('Demo Chillers SC-400', 'ديمو تشيلرز SC-400'), serial: 'SC400-19-0071', specs: [[T('Capacity', 'السعة'), '400 kW'], [T('Compressor', 'الضاغط'), T('Screw ×2', 'لولبي ×2')], [T('Refrigerant', 'غاز التبريد'), 'R134a · 96 kg'], [T('Oil', 'الزيت'), 'POE 32'], [T('Contractor', 'المقاول'), T('CoolAir HVAC', 'كول إير للتكييف')], [T('Criticality', 'الأهمية'), T('A — plant', 'أ — معدات رئيسية')]],
      hist: [['2026-08-30', T('Quarterly service with CoolAir', 'صيانة ربعية مع كول إير'), 'Mahmoud D.'], ['2026-05-28', T('Condenser coil wash', 'غسيل ملف المكثف'), 'Mahmoud D.']] },
    'SND-415-HV-VRF2': { b: 'BN-RAM-00415', cat: 'hvac', name: T('VRF outdoor units — retail', 'وحدات VRF خارجية — المحلات'), loc: T('Roof, south side', 'السطح، الجهة الجنوبية'), cond: 'fair', year: 2015, last: '2026-09-01', next: '2026-12-01', make: T('Demo VRF Pro 56', 'ديمو VRF برو 56'), serial: 'VRF56-15-0330', specs: [[T('Units', 'الوحدات'), '4 × 56 kW'], [T('Refrigerant', 'غاز التبريد'), 'R410A'], [T('Indoor units', 'الوحدات الداخلية'), '38'], [T('Controls', 'التحكم'), T('Central controller', 'متحكم مركزي')], [T('Last leak test', 'آخر فحص تسريب'), '3 Nov 2026'], [T('Criticality', 'الأهمية'), T('B — comfort', 'ب — راحة')]],
      hist: [['2026-11-03', T('Refrigerant leak search — flare joint resealed', 'البحث عن تسريب غاز — إعادة إحكام وصلة'), 'Mahmoud D.'], ['2026-09-01', T('Quarterly service', 'صيانة ربعية'), 'Mahmoud D.']] },
    'SND-311-HV-AHU03': { b: 'BN-RAM-00311', cat: 'hvac', name: T('AHU — floors 9–12', 'وحدة مناولة هواء — الطوابق 9–12'), loc: T('Plant room L9', 'غرفة المعدات ط9'), cond: 'good', year: 2019, last: '2026-11-10', next: '2026-12-03', make: T('Demo AirSystems DAS-160', 'ديمو إير سيستمز DAS-160'), serial: 'DAS16-19-0447', specs: [[T('Airflow', 'تدفق الهواء'), '16,000 m³/h'], [T('Fan motor', 'محرك المروحة'), T('7.5 kW · VFD', '7.5 ك.واط · VFD')], [T('Filters', 'الفلاتر'), 'G4 + F7'], [T('Controls', 'التحكم'), 'BACnet MS/TP']],
      hist: [['2026-11-10', T('VFD fault reset & inspection', 'إعادة ضبط وفحص عطل VFD'), 'Mahmoud D.']] },
    'SND-311-PM-CHW': { b: 'BN-RAM-00311', cat: 'pump', name: T('Chilled-water pumps (duty/standby)', 'مضخات المياه المبردة (عاملة/احتياط)'), loc: T('Roof plant deck', 'منصة المعدات على السطح'), cond: 'good', year: 2019, last: '2026-11-06', next: '2026-12-28', make: T('Demo Pumps CP-15', 'ديمو بمبس CP-15'), serial: 'CP15-19-0210', specs: [[T('Pumps', 'المضخات'), '2 × 15 kW'], [T('Seal', 'المانع'), T('Mechanical, 35 mm', 'ميكانيكي، 35 مم')], [T('Flow', 'التدفق'), '68 m³/h'], [T('Controls', 'التحكم'), 'VFD + BMS']],
      hist: [['2026-11-06', T('Pump P2 mechanical seal replaced', 'استبدال المانع الميكانيكي للمضخة P2'), 'Mahmoud D.']] },
  };
  const asset = (tag) => ASSETS[tag] || null;

  const PPE = { glasses: [T('Safety glasses', 'نظارات سلامة'), 'eye'], gloves: [T('Gloves', 'قفازات'), 'shield'], helmet: [T('Hard hat', 'خوذة'), 'shieldCheck'], ladder: [T('Platform ladder', 'سلّم بمنصة'), 'stairs'], loto: [T('Lock-out tag', 'قفل وبطاقة عزل'), 'lock'], mask: [T('FFP3 mask', 'كمامة FFP3'), 'wind'], gown: [T('Clean gown', 'رداء نظيف'), 'user'] };

  const J = (id, o) => ({ id, log: [], photos: { before: [null, null], after: [null, null] }, ...o, done: (o.steps || []).map((_, i) => i < (o.stepsDone || 0)), parts: (o.parts || []).map((p) => ({ ...p, used: p.used ?? p.q })) });
  const JOBS = [
    J('WO-26-1187', { b: 'BN-RAM-00311', asset: 'SND-311-HV-AHU02', pri: 'high', status: 'scheduled', date: '2026-11-25', from: '10:30', to: '12:30', due: '2026-11-26', ref: 'MR-24460', km: 2.4, min: 9,
      kind: T('Corrective', 'تصحيحية'), title: T('Zone 7B VAV not responding', 'وحدة VAV في المنطقة 7ب لا تستجيب'),
      desc: T('Tenant in office 702 reports 27 °C all morning. The BMS shows the zone 7B damper stuck at 0% while the AHU is running normally. VAV actuator suspected.', 'يبلغ المستأجر في المكتب 702 عن حرارة 27 درجة طوال الصباح. يُظهر نظام إدارة المبنى أن بوابة المنطقة 7ب عالقة عند 0% بينما تعمل وحدة المناولة بشكل طبيعي. يُشتبه في محرك VAV.'),
      contact: { p: 'p_karim', role: T('Tenant · office 702', 'مستأجر · المكتب 702') }, floor: 7, short: T('Level 7 · Office 702', 'الطابق 7 · المكتب 702'),
      dirs: [['car', T('Park in basement B1', 'اركن في الطابق السفلي الأول'), T('Contractor bays 12–14, ramp from Al-Irsal St.', 'مواقف المقاولين 12–14، المنحدر من شارع الإرسال')], ['door', T('Service entrance, north side', 'مدخل الخدمة، الجهة الشمالية'), T('Next to the loading bay — ring the security intercom', 'بجانب رصيف التحميل — اضغط جرس الأمن')], ['key', T('Check in at the security desk', 'سجّل حضورك في مكتب الأمن'), T('Show your Sanad ID, collect permit PTW-311-2291', 'أبرز بطاقة سند، واستلم تصريح العمل PTW-311-2291')], ['elevator', T('Service elevator EL-04, Core B', 'مصعد الخدمة EL-04، النواة ب'), T('Go up to level 7, turn left into the east wing', 'اصعد إلى الطابق 7، ثم انعطف يساراً إلى الجناح الشرقي')], ['pin', T('Office 702 — ceiling tile C-14', 'المكتب 702 — بلاطة السقف C-14'), T('Above the meeting table, beside the window', 'فوق طاولة الاجتماعات، بجانب النافذة')]],
      ppe: ['glasses', 'gloves', 'ladder', 'loto'],
      safety: [T('Working above 2 m: use the platform ladder, never a chair or desk.', 'العمل على ارتفاع يزيد عن 2 م: استخدم السلّم ذا المنصة، وليس كرسياً أو مكتباً.'), T('Isolate the 24 V VAV controller and tag it before touching the actuator.', 'اعزل وحدة تحكم VAV بجهد 24 فولت وضع بطاقة العزل قبل لمس المحرك.'), T('Occupied office: keep walkways clear and protect the desks.', 'مكتب مشغول: أبقِ الممرات خالية واحمِ المكاتب.')],
      steps: [{ t: T('Check in & open permit-to-work', 'سجّل الحضور وافتح تصريح العمل'), s: T('PTW-311-2291 at the security desk', 'التصريح PTW-311-2291 لدى مكتب الأمن') }, { t: T('Brief the tenant and cover the desk area', 'أبلغ المستأجر وغطِّ منطقة المكاتب'), s: T('Dust sheet over the meeting table', 'غطاء واقٍ فوق طاولة الاجتماعات') }, { t: T('Isolate VAV controller power and apply lock-out tag', 'افصل كهرباء وحدة تحكم VAV وضع قفل العزل'), s: T('Local 24 V isolator in the riser cupboard', 'العازل المحلي 24 فولت في خزانة الصاعد'), safety: true }, { t: T('Open ceiling tile C-14 from the platform ladder', 'افتح بلاطة السقف C-14 من السلّم ذي المنصة'), s: T('Work at height — keep three points of contact', 'عمل على ارتفاع — حافظ على ثلاث نقاط تماس'), safety: true }, { t: T('Inspect damper linkage and measure the 0–10 V signal', 'افحص وصلة البوابة وقِس إشارة 0–10 فولت'), s: T('Signal present but no movement → actuator fault', 'وجود إشارة دون حركة ← عطل في المحرك') }, { t: T('Replace the actuator (10 Nm) and set its direction', 'استبدل المحرك (10 نيوتن.م) واضبط اتجاه الدوران'), s: T('Part reserved: VAV actuator 10 Nm', 'القطعة محجوزة: محرك VAV ‏10 نيوتن.م') }, { t: T('Restore power and stroke the damper 0 → 100 %', 'أعد الكهرباء وحرّك البوابة من 0 إلى 100%'), s: T('Local override, confirm airflow at the diffuser', 'تشغيل يدوي محلي، وتأكد من تدفق الهواء عند الناشر') }, { t: T('Record zone temperature after 15 minutes', 'سجّل حرارة المنطقة بعد 15 دقيقة'), s: T('Target 22–23 °C · close the permit', 'المستهدف 22–23 درجة · أغلق التصريح') }],
      parts: [{ n: T('VAV actuator 10 Nm, 0–10 V', 'محرك VAV ‏10 نيوتن.م، 0–10 فولت'), q: 1, price: 690 }, { n: T('Control cable 3 × 0.75 mm² (m)', 'كابل تحكم 3 × 0.75 مم² (م)'), q: 2, price: 6 }],
      log: [{ s: 'assigned', t: 492, note: T('Assigned by Omar Saleh · Sanad helpdesk', 'أسندها عمر صالح · مكتب مساعدة سند') }] }),
    J('WO-26-1185', { b: 'BN-RAM-00415', asset: 'SND-415-HV-FAU', pri: 'medium', status: 'scheduled', date: '2026-11-25', from: '13:30', to: '15:30', due: '2026-11-26', km: 1.6, min: 7,
      kind: T('Preventive · overdue', 'وقائية · متأخرة'), title: T('Fresh-air unit — belts & filters', 'وحدة الهواء النقي — السيور والفلاتر'),
      desc: T('Quarterly service missed because of retail access hours. Replace 8 G4 panel filters, check and re-tension both belts, grease bearings and log motor current.', 'فاتت الصيانة الربعية بسبب ساعات عمل المحلات. استبدل 8 فلاتر G4 لوحية، وافحص السيرين وأعد شدّهما، وشحّم المحامل وسجّل تيار المحرك.'),
      contact: { p: 'p_rania', role: T('Property manager · Arkan', 'مديرة عقارات · أركان') }, floor: 1, short: T('Level 1 · Plant room, retail side', 'الطابق 1 · غرفة المعدات، جهة المحلات'),
      dirs: [['car', T('Park at the rear service yard', 'اركن في ساحة الخدمة الخلفية'), T('Gate on Radio St. — open 07:00–17:00', 'البوابة على شارع الإذاعة — مفتوحة 07:00–17:00')], ['door', T('Retail service corridor', 'ممر خدمة المحلات'), T('Door S-2 beside shop G04', 'الباب S-2 بجانب المحل G04')], ['key', T('Plant-room key from mall security', 'مفتاح غرفة المعدات من أمن المركز'), T('Key tag P1-RET, sign the key log', 'بطاقة المفتاح P1-RET، ووقّع سجل المفاتيح')], ['stairs', T('Service stair to level 1', 'درج الخدمة إلى الطابق 1'), T('Do not use the panoramic elevator with tools', 'لا تستخدم المصعد البانورامي مع العدة')], ['pin', T('Plant room P1-03 — FAU', 'غرفة المعدات P1-03 — وحدة الهواء النقي'), T('Unit is on the left, access panel faces the door', 'الوحدة على اليسار، ولوحة الوصول باتجاه الباب')]],
      ppe: ['glasses', 'gloves', 'loto', 'mask'],
      safety: [T('Isolate the FAU at the local isolator and wait for the fan to stop fully.', 'اعزل الوحدة من المفتاح المحلي وانتظر حتى تتوقف المروحة تماماً.'), T('Dusty filters: wear an FFP3 mask and bag the old filters.', 'فلاتر مغبرة: ارتدِ كمامة FFP3 وضع الفلاتر القديمة في أكياس.')],
      steps: [{ t: T('Isolate and lock out the unit', 'اعزل الوحدة وأقفلها'), s: T('Local isolator FAU-L1', 'العازل المحلي FAU-L1'), safety: true }, { t: T('Replace 8 × G4 panel filters', 'استبدل 8 فلاتر G4 لوحية'), s: T('Record pressure drop before and after', 'سجّل هبوط الضغط قبل وبعد') }, { t: T('Inspect belts, replace if cracked', 'افحص السيور واستبدلها إذا كانت متشققة'), s: T('2 × SPA 1400 in stock in the van', '2 × SPA 1400 متوفرة في السيارة') }, { t: T('Re-tension and align pulleys', 'أعد الشد واضبط استقامة البكرات'), s: T('Use the laser alignment tool', 'استخدم أداة الضبط بالليزر') }, { t: T('Grease fan bearings', 'شحّم محامل المروحة'), s: T('2 shots each, lithium grease', 'دفعتان لكل محمل، شحم ليثيوم') }, { t: T('Test run 10 min and log motor current', 'تشغيل تجريبي 10 دقائق وسجّل تيار المحرك'), s: T('Nameplate 9.8 A', 'القيمة الاسمية 9.8 أمبير') }],
      parts: [{ n: T('G4 panel filter 592 × 592', 'فلتر G4 لوحي 592 × 592'), q: 8, price: 38 }, { n: T('V-belt SPA 1400', 'سير SPA 1400'), q: 2, price: 58 }],
      log: [{ s: 'assigned', t: 495, note: T('Night shift moved to today 13:30', 'تم نقل الوردية الليلية إلى اليوم 13:30') }] }),
    J('WO-26-1183', { b: 'BN-RAM-00618', asset: 'SND-618-HV-AHU02', pri: 'medium', status: 'scheduled', date: '2026-11-25', from: '18:30', to: '20:00', due: '2026-11-27', km: 3.1, min: 12,
      kind: T('Preventive', 'وقائية'), title: T('HEPA pre-filter change — day surgery', 'تغيير الفلاتر الأولية HEPA — جراحة اليوم الواحد'),
      desc: T('Differential pressure across the F7 pre-filters is trending up. Change outside theatre hours (after 18:00) and confirm +15 Pa room pressure before handing back.', 'فرق الضغط عبر فلاتر F7 الأولية في ارتفاع. يتم التغيير خارج ساعات العمليات (بعد 18:00) والتأكد من ضغط الغرفة +15 باسكال قبل التسليم.'),
      contact: { p: 'p_omar', role: T('Facility manager · Sanad', 'مدير المرافق · سند') }, floor: 4, short: T('Level 4 · Plant room', 'الطابق 4 · غرفة المعدات'),
      dirs: [['car', T('Staff car park, level B1', 'موقف الموظفين، الطابق السفلي الأول'), T('Bay 31 is reserved for Sanad', 'الموقف 31 محجوز لسند')], ['door', T('Staff entrance, east side', 'مدخل الموظفين، الجهة الشرقية'), T('Badge reader — Sanad card works after 18:00', 'قارئ البطاقات — تعمل بطاقة سند بعد 18:00')], ['key', T('Sign in with the duty nurse', 'سجّل لدى الممرضة المناوبة'), T('Infection-control sign-off for theatre zone', 'موافقة مكافحة العدوى لمنطقة العمليات')], ['elevator', T('Passenger elevator 1 to level 4', 'مصعد الركاب 1 إلى الطابق 4'), T('Not the bed lift', 'وليس مصعد الأسرّة')], ['pin', T('Plant room P4-01', 'غرفة المعدات P4-01'), T('End of the corridor, behind theatre 2', 'نهاية الممر، خلف غرفة العمليات 2')]],
      ppe: ['gown', 'mask', 'gloves', 'loto'],
      safety: [T('Clinical area: clean gown and overshoes past the red line.', 'منطقة طبية: رداء نظيف وأغطية أحذية بعد الخط الأحمر.'), T('Bag used filters inside the plant room before moving them.', 'ضع الفلاتر المستعملة في أكياس داخل غرفة المعدات قبل نقلها.')],
      steps: [{ t: T('Confirm theatres are closed with the duty nurse', 'تأكد من إغلاق غرف العمليات مع الممرضة المناوبة'), s: T('No cases until 07:00', 'لا عمليات حتى 07:00') }, { t: T('Put the AHU into maintenance mode', 'حوّل وحدة المناولة إلى وضع الصيانة'), s: T('BMS handheld — log the time', 'جهاز BMS المحمول — سجّل الوقت'), safety: true }, { t: T('Replace 4 × F7 bag filters', 'استبدل 4 فلاتر F7 كيسية'), s: T('Bag old filters inside the room', 'ضع الفلاتر القديمة في أكياس داخل الغرفة') }, { t: T('Check HEPA frame seals visually', 'افحص موانع إطار HEPA بصرياً'), s: T('Do not touch the HEPA media', 'لا تلمس وسط HEPA') }, { t: T('Restart and confirm +15 Pa room pressure', 'أعد التشغيل وتأكد من ضغط +15 باسكال'), s: T('Wait 20 min for stable reading', 'انتظر 20 دقيقة لقراءة مستقرة') }],
      parts: [{ n: T('F7 bag filter 592 × 592 × 600', 'فلتر F7 كيسي 592 × 592 × 600'), q: 4, price: 145 }],
      log: [{ s: 'assigned', t: 500, note: T('Scheduled after theatre hours', 'مجدولة بعد ساعات العمليات') }] }),
    J('WO-26-1166', { b: 'BN-RAM-00311', asset: 'SND-311-HV-AHU01', pri: 'medium', status: 'paused', date: '2026-11-24', from: '14:00', to: '16:00', due: '2026-11-28', km: 2.4, min: 9,
      kind: T('Corrective', 'تصحيحية'), title: T('AHU-01 supply fan bearing noise', 'صوت في محمل مروحة التغذية AHU-01'),
      desc: T('Grinding noise from the drive-end bearing of the supply fan. Unit kept running at reduced speed. Bearing 6308-2RS ordered.', 'صوت احتكاك من محمل جهة الإدارة في مروحة التغذية. تُركت الوحدة تعمل بسرعة مخفّضة. تم طلب محمل 6308-2RS.'),
      pauseReason: 'parts', pauseNote: T('Bearing 6308-2RS ×2 ordered — ETA 27 Nov', 'تم طلب محمل 6308-2RS ×2 — الوصول المتوقع 27 ت٢'),
      contact: { p: 'p_omar', role: T('Facility manager · Sanad', 'مدير المرافق · سند') }, floor: 1, short: T('Level 1 · Plant room', 'الطابق 1 · غرفة المعدات'),
      dirs: [['car', T('Park in basement B1', 'اركن في الطابق السفلي الأول'), T('Contractor bays 12–14', 'مواقف المقاولين 12–14')], ['key', T('Security desk — key P1', 'مكتب الأمن — المفتاح P1'), T('Sign the key log', 'وقّع سجل المفاتيح')], ['stairs', T('Stair 2 to level 1', 'الدرج 2 إلى الطابق 1'), T('Behind the lobby café', 'خلف مقهى الردهة')], ['pin', T('Plant room P1-02', 'غرفة المعدات P1-02'), T('AHU-01, fan section on the right', 'وحدة AHU-01، قسم المروحة على اليمين')]],
      ppe: ['glasses', 'gloves', 'loto'], safety: [T('Fan can free-wheel after isolation — wait 3 minutes and lock the shaft.', 'قد تستمر المروحة بالدوران بعد العزل — انتظر 3 دقائق وثبّت العمود.')],
      steps: [{ t: T('Isolate and lock out AHU-01', 'اعزل AHU-01 وأقفلها'), s: T('Panel MCC-L1, breaker 7', 'اللوحة MCC-L1، القاطع 7'), safety: true }, { t: T('Measure vibration on both bearings', 'قِس الاهتزاز على المحملين'), s: T('Drive end 9.2 mm/s — high', 'جهة الإدارة 9.2 مم/ث — مرتفع') }, { t: T('Confirm bearing failure, order parts', 'أكّد عطل المحمل واطلب القطع'), s: T('6308-2RS ×2', '6308-2RS ×2') }, { t: T('Remove pulley and replace bearings', 'فك البكرة واستبدل المحامل'), s: T('Use the bearing puller', 'استخدم ساحب المحامل') }, { t: T('Re-align belt and pulleys', 'أعد ضبط السير والبكرات'), s: T('Laser alignment', 'ضبط بالليزر') }, { t: T('Test run and record vibration', 'تشغيل تجريبي وسجّل الاهتزاز'), s: T('Target below 4.5 mm/s', 'المستهدف أقل من 4.5 مم/ث') }],
      stepsDone: 3, parts: [{ n: T('Bearing 6308-2RS', 'محمل 6308-2RS'), q: 2, price: 72, used: 0 }],
      photosInit: { before: [3, 5] },
      log: [{ s: 'enroute', t: 830, d: '2026-11-24' }, { s: 'onsite', t: 852, d: '2026-11-24' }, { s: 'inProgress', t: 860, d: '2026-11-24' }, { s: 'paused', t: 935, d: '2026-11-24', note: T('Waiting for parts — bearing ordered', 'بانتظار القطع — تم طلب المحمل') }] }),
    J('WO-26-1181', { b: 'BN-RAM-00311', asset: 'SND-311-HV-CH02', pri: 'medium', status: 'scheduled', date: '2026-11-26', from: '08:00', to: '10:00', due: '2026-11-30', km: 2.4, min: 9,
      kind: T('Preventive · with CoolAir', 'وقائية · مع كول إير'), title: T('Chiller 2 refrigerant & oil check', 'فحص غاز التبريد والزيت للمبرّد 2'),
      desc: T('Quarterly check with the CoolAir HVAC engineer: refrigerant charge, oil level and acidity, compressor amps, condenser fans.', 'فحص ربعي مع مهندس كول إير: شحنة الغاز، مستوى الزيت وحموضته، تيار الضاغط، ومراوح المكثف.'),
      contact: { p: 'p_omar', role: T('Facility manager · Sanad', 'مدير المرافق · سند') }, floor: 'R', short: T('Roof · plant deck', 'السطح · منصة المعدات'),
      dirs: [['car', T('Park in basement B1', 'اركن في الطابق السفلي الأول'), T('Contractor bays 12–14', 'مواقف المقاولين 12–14')], ['key', T('Roof key from security', 'مفتاح السطح من الأمن'), T('Roof access permit required', 'يلزم تصريح الوصول للسطح')], ['elevator', T('Service elevator EL-04 to roof', 'مصعد الخدمة EL-04 إلى السطح'), T('Core B', 'النواة ب')], ['pin', T('Chiller 2, east plant deck', 'المبرّد 2، منصة المعدات الشرقية'), T('Meet the CoolAir engineer at 08:00', 'قابل مهندس كول إير الساعة 08:00')]],
      ppe: ['glasses', 'gloves', 'helmet'], safety: [T('Roof work: stay inside the guard-railed walkway.', 'العمل على السطح: ابقَ داخل الممر المحمي بالدرابزين.')],
      steps: [{ t: T('Meet contractor and review method statement', 'قابل المقاول وراجع بيان طريقة العمل'), s: T('CoolAir HVAC', 'كول إير للتكييف') }, { t: T('Record suction and discharge pressures', 'سجّل ضغط السحب والطرد'), s: T('Both circuits', 'كلتا الدائرتين') }, { t: T('Oil sample and acidity test', 'عينة زيت واختبار الحموضة'), s: T('Kit in the van', 'العدة في السيارة') }, { t: T('Check condenser fans and coil', 'افحص مراوح وملف المكثف'), s: T('Note fin damage', 'دوّن أي تلف في الزعانف') }],
      parts: [], log: [{ s: 'assigned', t: 480 }] }),
    J('WO-26-1190', { b: 'BN-RAM-00415', asset: 'SND-415-HV-VRF2', pri: 'low', status: 'scheduled', date: '2026-11-28', from: '09:00', to: '12:00', due: '2026-12-01', km: 1.6, min: 7,
      kind: T('Preventive', 'وقائية'), title: T('VRF retail outdoor units — quarterly service', 'وحدات VRF الخارجية للمحلات — صيانة ربعية'),
      desc: T('Clean condenser coils, check fan motors and electrical terminals, download the error log from the central controller.', 'تنظيف ملفات المكثف، وفحص محركات المراوح والأطراف الكهربائية، وتنزيل سجل الأعطال من المتحكم المركزي.'),
      contact: { p: 'p_rania', role: T('Property manager · Arkan', 'مديرة عقارات · أركان') }, floor: 'R', short: T('Roof · south side', 'السطح · الجهة الجنوبية'),
      dirs: [['car', T('Rear service yard', 'ساحة الخدمة الخلفية'), T('Gate on Radio St.', 'البوابة على شارع الإذاعة')], ['key', T('Roof key from mall security', 'مفتاح السطح من أمن المركز'), T('Key tag R-01', 'بطاقة المفتاح R-01')], ['stairs', T('Service stair to roof', 'درج الخدمة إلى السطح'), T('Hatch at level 9', 'الفتحة في الطابق 9')], ['pin', T('VRF units 1–4, south side', 'وحدات VRF ‏1–4، الجهة الجنوبية'), T('Behind the water tanks', 'خلف خزانات المياه')]],
      ppe: ['glasses', 'gloves', 'helmet'], safety: [T('Isolate each outdoor unit before opening panels.', 'اعزل كل وحدة خارجية قبل فتح اللوحات.')],
      steps: [{ t: T('Isolate units one at a time', 'اعزل الوحدات واحدة تلو الأخرى'), s: T('Keep retail cooling on', 'حافظ على تبريد المحلات'), safety: true }, { t: T('Wash condenser coils', 'اغسل ملفات المكثف'), s: T('Low-pressure water only', 'ماء بضغط منخفض فقط') }, { t: T('Check terminals and fan motors', 'افحص الأطراف ومحركات المراوح'), s: T('Torque check', 'فحص عزم الشد') }, { t: T('Download controller error log', 'نزّل سجل أعطال المتحكم'), s: T('USB export', 'تصدير عبر USB') }],
      parts: [], log: [{ s: 'assigned', t: 610, note: T('New job from the Sanad helpdesk', 'مهمة جديدة من مكتب مساعدة سند') }] }),
  ];
  // photos already taken on the paused job
  JOBS.forEach((j) => { if (j.photosInit) Object.keys(j.photosInit).forEach((k) => { j.photosInit[k].forEach((seed, i) => { j.photos[k][i] = { seed, t: 860 + i * 4, d: '2026-11-24' }; }); }); });

  const HIST = [
    { id: 'WO-26-1172', b: 'BN-RAM-00311', asset: 'SND-311-HV-AHU03', title: T('AHU-03 VFD fault reset & inspection', 'إعادة ضبط وفحص عطل VFD لوحدة AHU-03'), date: '2026-11-10', mins: 130, ftf: true, rating: 5 },
    { id: 'WO-26-1168', b: 'BN-RAM-00311', asset: 'SND-311-PM-CHW', title: T('Chilled-water pump P2 seal leak', 'تسريب مانع المضخة P2 للمياه المبردة'), date: '2026-11-06', mins: 185, ftf: true, rating: 4 },
    { id: 'WO-26-1161', b: 'BN-RAM-00415', asset: 'SND-415-HV-VRF2', title: T('VRF retail — refrigerant leak search', 'VRF المحلات — البحث عن تسريب غاز'), date: '2026-11-03', mins: 240, ftf: false, rating: 4 },
    { id: 'WO-26-1158', b: 'BN-RAM-00618', asset: 'SND-618-HV-AHU02', title: T('Day-surgery AHU pressure alarm', 'إنذار ضغط وحدة مناولة جراحة اليوم الواحد'), date: '2026-10-30', mins: 95, ftf: true, rating: 5 },
    { id: 'WO-26-1152', b: 'BN-RAM-00311', asset: 'SND-311-HV-AHU01', title: T('Lobby AHU-01 filter change', 'تغيير فلاتر AHU-01 للردهة'), date: '2026-10-27', mins: 70, ftf: true, rating: 5 },
    { id: 'WO-26-1149', b: 'BN-RAM-00311', asset: 'SND-311-HV-AHU02', title: T('Zone 6A too cold — VAV minimum reset', 'المنطقة 6أ باردة جداً — إعادة ضبط الحد الأدنى لـ VAV'), date: '2026-10-21', mins: 60, ftf: true, rating: 4 },
    { id: 'WO-26-1141', b: 'BN-RAM-00618', asset: 'SND-618-HV-AHU02', title: T('Monthly differential-pressure log', 'سجل فرق الضغط الشهري'), date: '2026-10-27', mins: 45, ftf: true },
  ];

  /* ======================================================================
     Session state (in memory, survives navigation, resets on reload)
     ====================================================================== */
  const S = { clock: 600, shift: true, nav: {}, scanned: {}, verified: {}, sel: {}, sig: {}, signer: {}, notes: {}, done: [], scanFound: null };
  const job = (id) => JOBS.find((j) => j.id === id);
  const histItem = (id) => HIST.find((h) => h.id === id) || S.done.find((h) => h.id === id);
  const today = () => JOBS.filter((j) => j.date === '2026-11-25' && j.status !== 'completed').sort((a, b) => a.from.localeCompare(b.from));
  const upcoming = () => JOBS.filter((j) => j.date > '2026-11-25' && j.status !== 'completed').sort((a, b) => (a.date + a.from).localeCompare(b.date + b.from));
  const paused = () => JOBS.filter((j) => j.status === 'paused');
  const LIVE = ['enroute', 'onsite', 'inProgress'];
  const current = () => JOBS.find((j) => LIVE.includes(j.status)) || today().find((j) => j.status === 'scheduled') || upcoming()[0] || JOBS[0];
  const pick = (id) => job(id) || current();

  /* ======================================================================
     Helpers
     ====================================================================== */
  const hm = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const dur = (m) => { const h = Math.floor(m / 60), n = m % 60; return h ? L(`${h} h ${n ? n + ' min' : ''}`.trim(), `${h} س ${n ? n + ' د' : ''}`.trim()) : L(`${n} min`, `${n} د`); };
  const durShort = (m) => L(`${Math.floor(m / 60)}h ${m % 60}m`, `${Math.floor(m / 60)}س ${m % 60}د`);
  const shortTag = (t) => String(t).split('-').slice(-1)[0].replace(/([A-Z]+)(\d+)/, '$1-$2');
  const DOW = { en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] };
  const dowOf = (d) => DOW[B.isAr() ? 'ar' : 'en'][new Date(d + 'T12:00:00').getDay()];
  const dayLabel = (d) => (d === '2026-11-25' ? L('Today', 'اليوم') : d === '2026-11-26' ? L('Tomorrow', 'غداً') : d === '2026-11-24' ? L('Yesterday', 'أمس') : `${dowOf(d)} ${B.dateShort(d)}`);
  const ST = {
    scheduled: { l: T('Not started', 'لم تبدأ'), tone: 'neutral', icon: 'clock', d: T('Assigned and ready to go', 'مُسندة وجاهزة للبدء') },
    enroute: { l: T('En route', 'في الطريق'), tone: 'info', icon: 'route', d: T('Travelling to the building', 'في الطريق إلى المبنى') },
    onsite: { l: T('On site', 'في الموقع'), tone: 'violet', icon: 'pin', d: T('Arrived and checked in', 'وصلت وسجّلت الحضور') },
    inProgress: { l: T('In progress', 'قيد التنفيذ'), tone: 'mint', icon: 'wrench', d: T('Working on the equipment', 'العمل جارٍ على المعدات') },
    paused: { l: T('Paused', 'متوقفة مؤقتاً'), tone: 'warn', icon: 'clock', d: T('Waiting for parts, access or the customer', 'بانتظار قطع أو إذن دخول أو العميل') },
    completed: { l: T('Completed', 'مكتملة'), tone: 'ok', icon: 'checkCircle', d: T('Work finished and signed off', 'انتهى العمل وتم التوقيع') },
    assigned: { l: T('Assigned', 'أُسندت'), tone: 'neutral', icon: 'clipboard' },
  };
  const PRI = { critical: [T('Critical', 'حرجة'), 'bad'], high: [T('High priority', 'أولوية عالية'), 'bad'], medium: [T('Medium', 'متوسطة'), 'warn'], low: [T('Low', 'منخفضة'), 'neutral'] };
  const PAUSE = { parts: T('Waiting for parts', 'بانتظار القطع'), access: T('No access to the area', 'لا يوجد وصول للمنطقة'), customer: T('Customer asked to pause', 'طلب العميل التوقف'), break: T('Break', 'استراحة'), other: T('Other', 'سبب آخر') };
  const pill = (s, sm) => { const m = ST[s] || ST.scheduled; const lab = s === 'paused' ? L('Paused', 'متوقفة') : tx(m.l); return `<span class="mt-pill ${m.tone} ${sm ? 'sm' : ''}">${icon(m.icon)}${lab}</span>`; };
  const priPill = (p, sm = true) => { const m = PRI[p] || PRI.low; return `<span class="mt-pill ${m[1]} ${sm ? 'sm' : ''}">${p === 'high' || p === 'critical' ? icon('alert') : ''}${tx(m[0])}</span>`; };
  const stepsDone = (j) => j.done.filter(Boolean).length;
  const photoCount = (j) => [...j.photos.before, ...j.photos.after].filter(Boolean).length;
  const photoTotal = (j) => j.photos.before.length + j.photos.after.length;
  const idm = (s) => B.ui.idMono(s);
  const dock = (inner, hint = '') => `<div class="mt-dock">${hint ? `<div class="d-hint">${hint}</div>` : ''}<div class="d-row">${inner}</div></div>`;
  const big = (label, o = {}) => M.btn(label, { kind: 'primary', ...o }).replace('class="mx-btn', `class="mx-btn grow`);
  const sq = (ic, o = {}, aria = '') => `<button type="button" class="mx-btn ghost sq" ${o.go ? `data-go="${o.go}"` : `data-act="${o.act}" data-arg="${esc(o.arg ?? '')}"`} aria-label="${esc(aria)}">${icon(ic)}</button>`;
  const ring = (done, total) => { const r = 28, c = 2 * Math.PI * r, p = total ? done / total : 0; return `<div class="ring"><svg viewBox="0 0 68 68"><circle cx="34" cy="34" r="${r}" fill="none" stroke="#E6ECEA" stroke-width="7"/>${p > 0 ? '' : '<!--'}<circle cx="34" cy="34" r="${r}" fill="none" stroke="${p >= 1 ? '#36D6A0' : '#0B8A60'}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(c * p).toFixed(1)} ${c.toFixed(1)}"/>${p > 0 ? '' : '-->'}</svg><b>${done}/${total}</b></div>`; };
  const tick = (s) => { S.clock += { enroute: 3, onsite: 16, inProgress: 6, paused: 34, completed: 52 }[s] || 4; return S.clock; };
  const setStatus = (j, s, note) => {
    if (j.status === s) return;
    const t = tick(s);
    j.status = s;
    j.log.push({ s, t, note });
    if (s === 'onsite' && j.onsiteAt == null) j.onsiteAt = t;
    if (s === 'inProgress' && j.onsiteAt == null) j.onsiteAt = t - 6;
    if (s === 'completed') j.doneAt = t;
    if (s !== 'paused') { j.pauseReason = null; j.pauseNote = null; }
  };
  const wrapPhoto = (seed, kind, variant) => (kind === 'room' ? B.art.interior(seed) : equip(seed, variant));
  /* simulated "camera" image of mechanical equipment: overview · close-up · repaired */
  const equip = (seed = 1, variant = 'overview') => {
    const r = B.rng(seed * 41 + 3);
    const body = ['#B9C4CB', '#C5CDD2', '#AFBAC2'][Math.floor(r() * 3)];
    const wall = ['#D8DDD9', '#CFD6D2', '#DCDFDB', '#D3D9DE'][Math.floor(r() * 4)];
    const ang = Math.floor(r() * 7) - 3;
    const zoom = variant === 'close' ? 'translate(-250 -170) scale(2.1)' : variant === 'fixed' ? 'translate(-120 -80) scale(1.45)' : '';
    const fault = variant === 'close' ? '<path d="M300 120 l14 10 -8 6 16 14" fill="none" stroke="#C2362F" stroke-width="3" stroke-linecap="round"/><circle cx="268" cy="150" r="47" fill="none" stroke="#E9A23B" stroke-width="3" stroke-dasharray="6 5"/>' : '';
    const part = variant === 'fixed' ? '<rect x="292" y="96" width="34" height="26" rx="4" fill="#2E3A42"/><rect x="298" y="102" width="22" height="6" rx="2" fill="#36D6A0"/><path d="M309 122 v18" stroke="#2E3A42" stroke-width="4"/>' : '<rect x="292" y="96" width="34" height="26" rx="4" fill="#5E6A72"/>';
    return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="400" height="300" fill="${wall}"/><rect y="236" width="400" height="64" fill="#9AA5A0"/>
      <g transform="${zoom}"><g transform="rotate(${ang} 200 150)">
        <path d="M46 70 L20 40 L20 210 L46 240" fill="#A6B1B8" stroke="#8E9AA2" stroke-width="2"/>
        <rect x="46" y="70" width="300" height="170" rx="6" fill="${body}" stroke="#8E9AA2" stroke-width="3"/>
        <rect x="64" y="88" width="120" height="132" rx="4" fill="#9FAAB2"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<line x1="70" y1="${96 + i * 16}" x2="178" y2="${96 + i * 16}" stroke="#86929A" stroke-width="3"/>`).join('')}
        <circle cx="268" cy="150" r="52" fill="#7F8B93"/><circle cx="268" cy="150" r="40" fill="#5E6A72"/>
        ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M268 150 L${(268 + 38 * Math.cos(i * 1.047)).toFixed(1)} ${(150 + 38 * Math.sin(i * 1.047)).toFixed(1)} A38 38 0 0 1 ${(268 + 38 * Math.cos(i * 1.047 + 0.6)).toFixed(1)} ${(150 + 38 * Math.sin(i * 1.047 + 0.6)).toFixed(1)}Z" fill="#9AA6AE"/>`).join('')}
        <circle cx="268" cy="150" r="8" fill="#3C474E"/>${part}${fault}
        <rect x="210" y="210" width="44" height="18" rx="3" fill="#F4F1EA"/><rect x="216" y="214" width="12" height="10" fill="#142B3B"/>
      </g></g>
      <rect width="400" height="300" fill="#000" opacity="${(r() * 0.08).toFixed(2)}"/>
    </svg>`;
  };

  /* ======================================================================
     Shared blocks
     ====================================================================== */
  const jobCard = (j, o = {}) => {
    const b = bld(j.b);
    const timeTop = o.showDay ? `<small>${dayLabel(j.date)}</small><b>${j.from}</b>` : `<b>${j.from}</b><small>${j.to}</small>`;
    return `<button class="mt-job ${o.cur ? 'cur' : ''}" data-go="job-${j.id}">
      <span class="j-bar ${j.pri}"></span>
      <span class="j-time">${timeTop}</span>
      <span class="j-b"><span class="j-tags">${pill(j.status, true)}${j.pri === 'high' || j.pri === 'critical' ? priPill(j.pri) : ''}</span>
        <span class="j-t">${tx(j.title)}</span>
        <span class="j-s">${icon('building')}<span>${tx(b.name)} · ${tx(j.short)}</span></span></span>
      ${icon('chevR', 'j-c flip')}</button>`;
  };
  const nextAction = (j) => {
    switch (j.status) {
      case 'scheduled': return { label: L('Start travel', 'ابدأ التوجّه'), icon: 'car', act: 'mtStatus', arg: `${j.id}:enroute` };
      case 'enroute': return { label: L("I've arrived", 'وصلت إلى الموقع'), icon: 'pin', act: 'mtStatus', arg: `${j.id}:onsite` };
      case 'onsite': return { label: L('Start work', 'ابدأ العمل'), icon: 'wrench', act: 'mtStatus', arg: `${j.id}:inProgress` };
      case 'inProgress': return stepsDone(j) < j.steps.length ? { label: L('Continue instructions', 'تابع خطوات العمل'), icon: 'clipboard', go: `steps-${j.id}` } : photoCount(j) < photoTotal(j) ? { label: L('Add photos', 'أضف الصور'), icon: 'camera', go: `photos-${j.id}` } : { label: L('Complete job', 'أكمل المهمة'), icon: 'checkCircle', go: `complete-${j.id}` };
      case 'paused': return { label: L('Resume work', 'استئناف العمل'), icon: 'play', act: 'mtStatus', arg: `${j.id}:inProgress` };
      default: return { label: L('View report', 'عرض التقرير'), icon: 'doc', go: `complete-${j.id}` };
    }
  };
  const tracker = (j) => {
    const order = ['enroute', 'onsite', 'inProgress', 'completed'];
    const labels = [T('En route', 'في الطريق'), T('On site', 'في الموقع'), T('Working', 'العمل'), T('Done', 'منجزة')];
    const icons = ['route', 'pin', 'wrench', 'check'];
    const idx = j.status === 'paused' ? 2 : order.indexOf(j.status);
    return `<div class="mt-track">${order.map((s, i) => `<div class="s ${i < idx || j.status === 'completed' ? 'done' : i === idx ? (j.status === 'paused' ? 'cur paused' : 'cur') : ''}"><i>${icon(i < idx || j.status === 'completed' ? 'check' : j.status === 'paused' && i === 2 ? 'clock' : icons[i])}</i><span>${i === 2 && j.status === 'paused' ? L('Paused', 'متوقفة') : tx(labels[i])}</span></div>`).join('')}</div>`;
  };

  /* ======================================================================
     Actions
     ====================================================================== */
  const toastAfter = (msg, ic) => setTimeout(() => M.toast(msg, ic), 30);
  B.act.mtStatus = (arg) => {
    const [id, s] = String(arg).split(':');
    const j = job(id);
    if (!j) return;
    if (s === 'paused') return pauseSheet(j);
    if (s === 'completed') return B.go(`complete-${id}`);
    setStatus(j, s);
    B.refresh();
    toastAfter(L(`Status: ${tx(ST[s].l)} · dispatcher notified (simulated)`, `الحالة: ${tx(ST[s].l)} · تم إبلاغ المنسّق (محاكاة)`));
  };
  const pauseSheet = (j) => {
    M.sheet({
      title: L('Pause this job', 'إيقاف المهمة مؤقتاً'), sub: `${esc(j.id)} · ${esc(tx(j.title))}`, form: 'mtPause',
      body: `<input type="hidden" name="id" value="${esc(j.id)}">
        <div class="mt-opts">${Object.keys(PAUSE).map((k, i) => `<label class="mt-opt ${i === 0 ? 'on' : ''}" style="cursor:pointer"><span class="o-i">${icon(k === 'parts' ? 'package' : k === 'access' ? 'lock' : k === 'customer' ? 'user' : k === 'break' ? 'clock' : 'moreV')}</span><span><b>${tx(PAUSE[k])}</b></span><input type="radio" name="reason" value="${k}" ${i === 0 ? 'checked' : ''} style="position:absolute;opacity:0;pointer-events:none"><span class="o-r"></span></label>`).join('')}</div>
        ${M.field({ name: 'note', label: L('Note for the dispatcher (optional)', 'ملاحظة للمنسّق (اختياري)'), type: 'textarea', placeholder: L('e.g. bearing ordered, ETA Friday', 'مثلاً: تم طلب المحمل، يصل الجمعة') })}`,
      foot: M.btn(L('Cancel', 'إلغاء'), { act: 'mxClose' }) + M.btn(L('Pause job', 'إيقاف مؤقت'), { kind: 'dark', type: 'submit', icon: 'clock' }),
    });
    const host = document.querySelector('.mx-sheet');
    if (host) host.addEventListener('change', (e) => { if (e.target.name === 'reason') host.querySelectorAll('.mt-opt').forEach((o) => o.classList.toggle('on', o.querySelector('input').checked)); });
  };
  B.submit.mtPause = (data) => {
    const j = job(data.id);
    if (!j) return M.close();
    setStatus(j, 'paused', data.note ? T(data.note, data.note) : PAUSE[data.reason]);
    j.pauseReason = data.reason || 'other';
    j.pauseNote = data.note ? T(data.note, data.note) : null;
    B.refresh();
    toastAfter(L('Job paused · dispatcher notified (simulated)', 'تم إيقاف المهمة · تم إبلاغ المنسّق (محاكاة)'), 'clock');
  };
  B.act.mtSel = (arg) => { const [id, s] = String(arg).split(':'); S.sel[id] = s; B.refresh(); };
  B.act.mtApplySel = (id) => {
    const j = job(id); const s = S.sel[id];
    if (!j || !s || s === j.status) return M.toast(L('Choose a new status first', 'اختر حالة جديدة أولاً'), 'info');
    S.sel[id] = null;
    B.act.mtStatus(`${id}:${s}`);
  };
  B.act.mtStep = (arg) => {
    const [id, i] = String(arg).split(':');
    const j = job(id);
    if (!j) return;
    const k = +i;
    j.done[k] = !j.done[k];
    let msg = '';
    if (j.done[k] && ['scheduled', 'enroute', 'onsite', 'paused'].includes(j.status)) { setStatus(j, 'inProgress'); msg = L('Work started — status set to In progress', 'بدأ العمل — الحالة الآن قيد التنفيذ'); }
    B.refresh();
    if (msg) toastAfter(msg);
    else if (j.done.every(Boolean)) toastAfter(L('All steps done — great work', 'اكتملت جميع الخطوات — عمل رائع'));
  };
  B.act.mtNextStep = (id) => { const j = job(id); if (!j) return; const k = j.done.findIndex((d) => !d); if (k >= 0) B.act.mtStep(`${id}:${k}`); };
  B.act.mtShot = (arg) => {
    const [id, kind, i] = String(arg).split(':');
    const j = job(id);
    if (!j) return;
    const slot = j.photos[kind];
    if (slot[+i]) return photoSheet(j, kind, +i);
    slot[+i] = { seed: 7 + j.id.charCodeAt(9) + (kind === 'after' ? 20 : 0) + +i * 3, t: S.clock += 1 };
    const ph = document.querySelector('.mx-phone');
    if (ph) { const f = document.createElement('div'); f.className = 'mt-flash'; ph.appendChild(f); }
    setTimeout(() => { B.refresh(); toastAfter(L('Photo saved to the job (simulated)', 'تم حفظ الصورة في المهمة (محاكاة)'), 'camera'); }, 160);
  };
  B.act.mtNextShot = (id) => {
    const j = job(id); if (!j) return;
    const b = j.photos.before.findIndex((x) => !x);
    if (b >= 0) return B.act.mtShot(`${id}:before:${b}`);
    const a = j.photos.after.findIndex((x) => !x);
    if (a >= 0) return B.act.mtShot(`${id}:after:${a}`);
  };
  B.act.mtAddShot = (arg) => { const [id, kind] = String(arg).split(':'); const j = job(id); if (!j) return; if (j.photos[kind].length >= 6) return M.toast(L('Maximum 6 photos per set', 'الحد الأقصى 6 صور لكل مجموعة'), 'info'); j.photos[kind].push(null); B.act.mtShot(`${id}:${kind}:${j.photos[kind].length - 1}`); };
  const SHOT_L = { before: [T('Equipment overview', 'نظرة عامة على المعدات'), T('Close-up of the fault', 'صورة مقرّبة للعطل')], after: [T('Repaired component', 'المكوّن بعد الإصلاح'), T('Area left clean', 'المكان نظيف بعد العمل')] };
  const shotLabel = (kind, i) => (SHOT_L[kind][i] ? tx(SHOT_L[kind][i]) : L(`Extra photo ${i - 1}`, `صورة إضافية ${i - 1}`));
  const photoArt = (kind, i, p) => wrapPhoto(p.seed, kind === 'after' && i === 1 ? 'room' : 'equip', kind === 'after' ? 'fixed' : i === 1 ? 'close' : 'overview');
  const photoSheet = (j, kind, i) => {
    const p = j.photos[kind][i];
    M.sheet({ title: shotLabel(kind, i), sub: `${kind === 'before' ? L('Before', 'قبل') : L('After', 'بعد')} · ${p.d ? B.dateShort(p.d) + ' · ' : ''}${hm(p.t)}`,
      body: `<div class="mx-photo filled" style="aspect-ratio:4/3;border-radius:18px">${photoArt(kind, i, p)}</div><div class="mt-note">${icon('info')}${L('Simulated photo — generated illustration, no camera used.', 'صورة محاكاة — رسم مُولَّد، لم تُستخدم الكاميرا.')}</div>`,
      foot: M.btn(L('Delete', 'حذف'), { kind: 'danger', act: 'mtDelShot', arg: `${j.id}:${kind}:${i}`, icon: 'trash' }) + M.btn(L('Retake', 'إعادة الالتقاط'), { kind: 'dark', act: 'mtRetake', arg: `${j.id}:${kind}:${i}`, icon: 'camera' }) });
  };
  B.act.mtDelShot = (arg) => { const [id, kind, i] = String(arg).split(':'); const j = job(id); if (!j) return; j.photos[kind][+i] = null; B.refresh(); toastAfter(L('Photo removed', 'تم حذف الصورة'), 'trash'); };
  B.act.mtRetake = (arg) => { const [id, kind, i] = String(arg).split(':'); const j = job(id); if (!j) return; j.photos[kind][+i] = null; M.close(true); B.act.mtShot(arg); };
  B.act.mtNav = (id) => {
    const j = job(id); if (!j) return;
    S.nav[id] = !S.nav[id];
    let moved = false;
    if (S.nav[id] && j.status === 'scheduled') { setStatus(j, 'enroute'); moved = true; }
    B.refresh();
    toastAfter(S.nav[id] ? (moved ? L('Navigation started · status set to En route', 'بدأ التوجيه · الحالة الآن في الطريق') : L('Navigation started (simulated)', 'بدأ التوجيه (محاكاة)')) : L('Navigation ended', 'انتهى التوجيه'), 'route');
  };
  B.act.mtArrive = (id) => { const j = job(id); if (!j) return; S.nav[id] = false; B.act.mtStatus(`${id}:onsite`); };
  B.act.mtScan = (tag) => {
    const sc = document.querySelector('.mt-scan');
    if (sc) sc.classList.add('found');
    setTimeout(() => {
      S.scanFound = tag;
      S.scanned[tag] = true;
      const j = JOBS.find((x) => x.asset === tag && x.status !== 'completed');
      if (j) S.verified[j.id] = true;
      B.refresh();
      toastAfter(L(`Tag ${tag} recognised`, `تم التعرّف على البطاقة ${tag}`), 'scan');
    }, 380);
  };
  B.act.mtScanReset = () => { S.scanFound = null; B.refresh(); };
  B.act.mtVerify = (id) => {
    const j = job(id); if (!j) return;
    M.sheet({ title: L('Scan asset tag', 'مسح بطاقة الأصل'), sub: L('Point the camera at the BENA tag on the unit', 'وجّه الكاميرا إلى بطاقة BENA على الوحدة'),
      body: `<div class="mt-scan" style="aspect-ratio:1"><div class="feed"></div><div class="plate">${B.art.qr(j.asset.length + 11)}</div><div class="vf"><i></i><i></i><i></i><i></i><span class="ln"></span></div><div class="hint">${L('Simulated camera', 'كاميرا محاكاة')}</div></div>`,
      foot: M.btn(L('Cancel', 'إلغاء'), { act: 'mxClose' }) + M.btn(L('Simulate scan', 'محاكاة المسح'), { kind: 'primary', icon: 'scan', act: 'mtVerifyDo', arg: id }) });
  };
  B.act.mtVerifyDo = (id) => {
    const j = job(id); if (!j) return;
    const sc = document.querySelector('.mx-sheet .mt-scan'); if (sc) sc.classList.add('found');
    setTimeout(() => { S.verified[id] = true; S.scanned[j.asset] = true; B.refresh(); toastAfter(L(`Tag matches ${j.asset} — asset verified`, `البطاقة تطابق ${j.asset} — تم التحقق من الأصل`), 'checkCircle'); }, 420);
  };
  B.act.mtQty = (arg) => { const [id, i, d] = String(arg).split(':'); const j = job(id); if (!j) return; const p = j.parts[+i]; p.used = Math.max(0, Math.min(99, p.used + +d)); B.refresh(); };
  B.act.mtSigClear = (id) => { S.sig[id] = null; B.refresh(); };
  B.act.mtShift = () => { S.shift = !S.shift; B.refresh(); toastAfter(S.shift ? L('You are on shift — new jobs can be assigned', 'أنت في الوردية — يمكن إسناد مهام جديدة') : L('Break started — dispatcher notified (simulated)', 'بدأت الاستراحة — تم إبلاغ المنسّق (محاكاة)'), S.shift ? 'check' : 'clock'); };
  B.act.mtSubmit = (id) => {
    const j = job(id); if (!j) return;
    const name = (document.getElementById('mt-signer') || {}).value || S.signer[id] || '';
    const notes = (document.getElementById('mt-notes') || {}).value ?? S.notes[id] ?? '';
    S.signer[id] = name; S.notes[id] = notes;
    if (!S.sig[id]) { M.toast(L('Ask the customer to sign first', 'اطلب من العميل التوقيع أولاً'), 'alert'); const el = document.querySelector('.mt-sig'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (!name.trim()) { M.toast(L('Add the name of the person signing', 'أضف اسم الشخص الموقّع'), 'alert'); const el = document.getElementById('mt-signer'); if (el) el.focus(); return; }
    const open = j.steps.length - stepsDone(j);
    if (open > 0 && !S.force) {
      S.force = id;
      M.sheet({ title: L('Some steps are still open', 'بعض الخطوات لم تكتمل'), sub: L(`${open} of ${j.steps.length} instruction steps are not ticked. Submit anyway with a note for the supervisor?`, `${open} من ${j.steps.length} خطوات غير مؤشَّرة. هل تريد الإرسال مع ملاحظة للمشرف؟`),
        foot: M.btn(L('Review steps', 'مراجعة الخطوات'), { go: `steps-${id}` }) + M.btn(L('Submit anyway', 'أرسل على أي حال'), { kind: 'dark', act: 'mtSubmit', arg: id }) });
      return;
    }
    S.force = null;
    if (j.onsiteAt == null) j.onsiteAt = S.clock;
    setStatus(j, 'completed', T('Signed off by ' + name, 'وقّع: ' + name));
    S.done.unshift({ id: j.id, b: j.b, asset: j.asset, title: j.title, date: '2026-11-25', mins: Math.max(20, j.doneAt - j.onsiteAt), ftf: open === 0, live: true });
    B.refresh();
    M.success({ title: L('Job completed', 'اكتملت المهمة'), text: L(`Report sent to ${orgName()} and the building manager. The customer gets a copy by e-mail.`, `تم إرسال التقرير إلى ${orgName()} ومدير المبنى. وسيحصل العميل على نسخة بالبريد الإلكتروني.`), ref: 'RPT-' + j.id.slice(3), done: `m-${R}-home`, doneLabel: L('Back to my jobs', 'العودة إلى مهامي') });
  };

  /* signature pad (simulated sign-off) */
  const bindSig = (id) => B.afterRender(() => {
    const cv = document.getElementById('mt-sigc');
    if (!cv) return;
    const box = cv.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#142B3B';
    if (S.sig[id]) { const im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0, w, h); im.src = S.sig[id]; }
    let drawing = false, last = null;
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener('pointerdown', (e) => { drawing = true; last = pos(e); try { cv.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } box.classList.add('signed'); const ph = box.querySelector('.ph'); if (ph) ph.style.display = 'none'; e.preventDefault(); });
    cv.addEventListener('pointermove', (e) => { if (!drawing) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); last = p; });
    const end = () => { if (!drawing) return; drawing = false; S.sig[id] = cv.toDataURL('image/png'); const c = document.getElementById('mt-sigclear'); if (c) c.hidden = false; };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end); cv.addEventListener('pointerleave', end);
  });
  B.act.mtSigDemo = (id) => {
    // draws a sample signature for one-tap demos
    const cv = document.getElementById('mt-sigc'); if (!cv) return;
    const ctx = cv.getContext('2d'); const w = cv.clientWidth, h = cv.clientHeight;
    ctx.beginPath(); let x = w * 0.18, y = h * 0.6; ctx.moveTo(x, y);
    for (let i = 0; i < 46; i++) { x += w * 0.014; y = h * 0.55 + Math.sin(i / 2.2) * h * 0.16 * (i < 30 ? 1 : 0.5) - (i % 9 === 0 ? h * 0.12 : 0); ctx.lineTo(x, y); }
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.2, h * 0.7); ctx.quadraticCurveTo(w * 0.5, h * 0.78, w * 0.84, h * 0.62); ctx.stroke();
    S.sig[id] = cv.toDataURL('image/png');
    cv.parentElement.classList.add('signed'); const ph = cv.parentElement.querySelector('.ph'); if (ph) ph.style.display = 'none';
    const c = document.getElementById('mt-sigclear'); if (c) c.hidden = false;
  };

  /* ======================================================================
     Screens
     ====================================================================== */
  const bell = { icon: 'bell', go: 'notifications', label: L('Notifications', 'الإشعارات'), dot: true };

  /* --- Assigned jobs (home) --- */
  const home = () => {
    const cur = current();
    const list = B.get('mt:list', 'today');
    const tj = today();
    const doneToday = S.done.filter((d) => d.date === '2026-11-25').length;
    const items = list === 'upcoming' ? upcoming() : list === 'paused' ? paused() : tj;
    const na = nextAction(cur);
    const b = bld(cur.b);
    const live = LIVE.includes(cur.status);
    const hero = cur ? `<div class="mt-hero">
        <div class="h-top"><span class="h-k">${live ? L('Current job', 'المهمة الحالية') : L('Next job', 'المهمة التالية')} · ${dayLabel(cur.date)}</span>${pill(cur.status)}</div>
        <button data-go="job-${cur.id}" style="text-align:start;display:flex;flex-direction:column;gap:8px"><h2>${tx(cur.title)}</h2><span class="h-loc">${icon('pin')}<span>${tx(b.name)} · ${tx(cur.short)}</span></span></button>
        <div class="h-meta"><div><small>${L('Starts', 'يبدأ')}</small><b style="direction:ltr;text-align:start">${cur.from}</b></div><div><small>${L('Distance', 'المسافة')}</small><b>${L(`${cur.km} km`, `${cur.km} كم`)}</b></div><div><small>${L('Steps', 'الخطوات')}</small><b>${stepsDone(cur)}/${cur.steps.length}</b></div></div>
        <div class="h-acts">${M.btn(na.label, { kind: 'primary', icon: na.icon, go: na.go, act: na.act, arg: na.arg })}<button class="mx-btn glass" data-go="location-${cur.id}" aria-label="${L('Directions', 'الاتجاهات')}">${icon('map')}</button></div>
      </div>` : '';
    const stats = `<div class="mt-stats"><button data-act="set" data-arg="mt:list=today"><b>${tj.length}</b><small>${L('Left today', 'متبقية اليوم')}</small></button><div><b>${doneToday}</b><small>${L('Done today', 'منجزة اليوم')}</small></div><button class="${paused().length ? 'alert' : ''}" data-act="set" data-arg="mt:list=paused"><b>${paused().length}</b><small>${L('Paused', 'متوقفة')}</small></button></div>`;
    const seg = M.seg('mt:list', [{ id: 'today', label: L('Today', 'اليوم') }, { id: 'upcoming', label: L('Upcoming', 'القادمة') }, { id: 'paused', label: L('Paused', 'المتوقفة') }], list);
    const cards = items.length ? `<div class="mt-list">${items.map((j) => jobCard(j, { cur: j.id === cur.id, showDay: list !== 'today' })).join('')}</div>` : M.empty('checkCircle', list === 'paused' ? L('Nothing paused', 'لا توجد مهام متوقفة') : L('All jobs done for today', 'أنجزت جميع مهام اليوم'), L('New jobs from the dispatcher appear here.', 'تظهر هنا المهام الجديدة من المنسّق.'));
    const pausedNote = list === 'paused' && items.length ? items.map((j) => `<div class="callout warn">${icon('package')}<div><b>${idm(j.id)}</b> — ${tx(PAUSE[j.pauseReason] || PAUSE.other)}${j.pauseNote ? ` · ${esc(tx(j.pauseNote))}` : ''}</div></div>`).join('') : '';
    return {
      title: L('My jobs', 'مهامي'), large: true, kicker: `${dowOf('2026-11-25')} · ${B.date('2026-11-25')}`,
      largeEnd: `<button class="mt-shift ${S.shift ? '' : 'off'}" data-go="me"><i></i>${S.shift ? L('On shift', 'في الوردية') : L('On break', 'استراحة')}</button>`,
      actions: [bell],
      body: hero + stats + `<div style="display:flex;flex-direction:column;gap:12px">${seg}${pausedNote}${cards}</div>` + `<div class="mt-note">${icon('info')}${L('Sample jobs for a demo technician · no live dispatch connection', 'مهام نموذجية لفني تجريبي · لا يوجد اتصال حي بنظام الإسناد')}</div>`,
    };
  };

  /* --- Job details --- */
  const jobScreen = (id) => {
    const j = job(id);
    if (!j) {
      const h = histItem(id);
      if (h) return histScreen(h);
      return { title: L('Job', 'مهمة'), back: 'home', backLabel: L('Jobs', 'المهام'), body: M.empty('clipboard', L('Job not found', 'المهمة غير موجودة')) };
    }
    const b = bld(j.b);
    const a = asset(j.asset);
    const na = nextAction(j);
    const done = j.status === 'completed';
    const sd = stepsDone(j), pc = photoCount(j);
    const tiles = `<div class="mt-tiles">
      <button class="mt-tile" data-go="location-${j.id}"><span class="t-i">${icon('pin')}</span><b>${L('Location', 'الموقع')}</b><small>${tx(j.short)}</small></button>
      <button class="mt-tile ${sd === j.steps.length ? 'ok' : ''}" data-go="steps-${j.id}">${sd === j.steps.length ? `<span class="t-ck">${icon('check')}</span>` : ''}<span class="t-i">${icon('clipboard')}</span><b>${L('Instructions', 'خطوات العمل')}</b><small>${L(`${sd} of ${j.steps.length} steps`, `${sd} من ${j.steps.length} خطوات`)}</small>${B.ui.progress((sd / j.steps.length) * 100, 'mint')}</button>
      <button class="mt-tile ${S.verified[j.id] ? 'ok' : ''}" data-go="asset-${j.asset}">${S.verified[j.id] ? `<span class="t-ck">${icon('check')}</span>` : ''}<span class="t-i">${icon('tag')}</span><b>${L('Asset', 'الأصل')}</b><small>${shortTag(j.asset)} · ${S.verified[j.id] ? L('verified', 'تم التحقق') : B.ui.statusLabel(a ? a.cond : 'fair')}</small></button>
      <button class="mt-tile ${pc === photoTotal(j) ? 'ok' : ''}" data-go="photos-${j.id}">${pc === photoTotal(j) ? `<span class="t-ck">${icon('check')}</span>` : ''}<span class="t-i">${icon('camera')}</span><b>${L('Photos', 'الصور')}</b><small>${L(`${pc} of ${photoTotal(j)} · before & after`, `${pc} من ${photoTotal(j)} · قبل وبعد`)}</small></button>
      <button class="mt-tile" data-go="status-${j.id}"><span class="t-i">${icon('activity')}</span><b>${L('Status', 'الحالة')}</b><small>${tx(ST[j.status].l)} · ${L('update', 'تحديث')}</small></button>
      <button class="mt-tile ${done ? 'ok' : ''}" data-go="complete-${j.id}"><span class="t-i">${icon('checkCircle')}</span><b>${L('Completion', 'الإنجاز')}</b><small>${done ? L('Signed off', 'تم التوقيع') : L('Summary & signature', 'الملخص والتوقيع')}</small></button>
    </div>`;
    const safety = j.safety && j.safety.length ? `<button class="mt-safety" data-go="steps-${j.id}"><span class="sf-h">${icon('alert')}${L('Safety before you start', 'السلامة قبل البدء')}</span><span class="mt-ppe">${j.ppe.map((k) => `<span>${icon(PPE[k][1])}${tx(PPE[k][0])}</span>`).join('')}</span><ul>${j.safety.map((s) => `<li>${tx(s)}</li>`).join('')}</ul></button>` : '';
    const pausedBox = j.status === 'paused' ? `<div class="callout warn">${icon('package')}<div><b>${tx(PAUSE[j.pauseReason] || PAUSE.other)}</b>${j.pauseNote ? `<br>${esc(tx(j.pauseNote))}` : ''}</div></div>` : '';
    const contact = j.contact ? M.cell({ avatar: D.person(j.contact.p).name, title: pname(j.contact.p), sub: j.contact.role, act: 'mxSoon', arg: L('Calling the customer', 'الاتصال بالعميل'), badge: `<span class="mt-pill ok sm">${icon('phone')}${L('Call', 'اتصال')}</span>`, chevron: false }) : '';
    const brief = M.section(L('Job brief', 'ملخص المهمة'), `<div class="mx-card"><div class="mt-brief">${tx(j.desc)}</div>${B.ui.kv([[L('Type', 'النوع'), tx(j.kind)], [L('Due', 'الاستحقاق'), B.date(j.due)], j.ref ? [L('Resident request', 'طلب الساكن'), idm(j.ref)] : null, [L('Building ID', 'معرّف المبنى'), idm(j.b)]])}</div>${M.group([contact, M.cell({ icon: 'chat', tone: 'info', title: L('Message the dispatcher', 'مراسلة المنسّق'), sub: `${pname('p_omar')} · ${orgName()}`, act: 'mxSoon', arg: L('Messaging', 'المراسلة') })])}`);
    const parts = j.parts.length ? M.section(L('Parts reserved', 'القطع المحجوزة'), M.group(j.parts.map((p) => M.cell({ icon: 'package', tone: 'mint', title: p.n, sub: L('In the van · Sanad stock', 'في السيارة · مخزون سند'), value: `×${p.q}` })))) : '';
    const dk = done ? dock(big(L('View completion report', 'عرض تقرير الإنجاز'), { icon: 'doc', go: `complete-${j.id}`, kind: 'dark' }))
      : dock((j.status === 'inProgress' ? sq('clock', { act: 'mtStatus', arg: `${j.id}:paused` }, L('Pause', 'إيقاف مؤقت')) : j.status === 'onsite' ? sq('scan', { act: 'mtVerify', arg: j.id }, L('Scan asset tag', 'مسح بطاقة الأصل')) : sq('map', { go: `location-${j.id}` }, L('Directions', 'الاتجاهات'))) + big(na.label, { icon: na.icon, go: na.go, act: na.act, arg: na.arg }));
    return {
      title: j.id, back: 'home', backLabel: L('Jobs', 'المهام'), hideTabs: true, tab: 'home',
      actions: [{ icon: 'phone', act: 'mxSoon', arg: L('Calling the dispatcher', 'الاتصال بالمنسّق'), label: L('Call dispatcher', 'اتصل بالمنسّق') }],
      body: `<div class="mt-head"><div class="hd-tags">${pill(j.status)}${priPill(j.pri, false)}</div><h2>${tx(j.title)}</h2><div class="hd-loc">${icon('building')}<span><b style="color:var(--ink)">${tx(b.name)}</b><br>${tx(j.short)}</span></div><div class="hd-loc">${icon('clock')}<span>${dayLabel(j.date)} · <bdi dir="ltr">${j.from}–${j.to}</bdi> · ${L('due', 'الاستحقاق')} ${B.dateShort(j.due)}</span></div></div>`
        + tracker(j) + pausedBox + tiles + safety + brief + parts + dk,
    };
  };

  /* completed history item (read-only) */
  const histScreen = (h) => {
    const a = asset(h.asset);
    return {
      title: h.id, back: 'history', backLabel: L('History', 'السجل'), tab: 'history',
      body: `<div class="mt-done"><span class="d-i">${icon('check')}</span><div><b>${L('Completed', 'مكتملة')} · ${B.date(h.date)}</b><small>${h.ftf ? L('Fixed on the first visit', 'تم الإصلاح من الزيارة الأولى') : L('Needed a follow-up visit', 'احتاجت زيارة متابعة')}</small></div></div>
        <div class="mt-head"><h2>${tx(h.title)}</h2><div class="hd-loc">${icon('building')}<span>${bname(h.b)}</span></div></div>
        <div class="mt-sum"><div><small>${icon('clock')}${L('Time on site', 'الوقت في الموقع')}</small><b>${dur(h.mins)}</b></div><div><small>${icon('star')}${L('Customer rating', 'تقييم العميل')}</small><b>${h.rating ? `${h.rating}/5` : '—'}</b></div></div>
        ${M.group([M.cell({ icon: 'tag', tone: 'mint', title: a ? a.name : h.asset, sub: h.asset, go: `asset-${h.asset}` }), M.cell({ icon: 'doc', title: L('Completion report', 'تقرير الإنجاز'), sub: 'RPT-' + h.id.slice(3) + ' · PDF', act: 'mxSoon', arg: L('Opening the report', 'فتح التقرير') })])}
        <div class="mt-note">${icon('info')}${L('Sample history record', 'سجل نموذجي')}</div>`,
    };
  };

  /* --- Building location --- */
  const location = (id) => {
    const j = pick(id);
    const b = bld(j.b);
    const f = FLOORS[j.b] || { top: b.floors || 6, base: ['G'], entrance: 'G', parking: null };
    const nav = !!S.nav[j.id];
    const floors = [];
    floors.push(['R', 'roof']);
    for (let i = f.top; i >= 1; i--) floors.push([String(i), '']);
    f.base.forEach((x) => floors.push([x, '']));
    const tgt = String(j.floor);
    const fl = floors.map(([n, k]) => {
      const cls = n === tgt ? 'tgt' : n === f.entrance ? 'ent' : n === f.parking ? 'park' : k;
      const ic = n === tgt ? icon('pin') : n === f.entrance ? icon('door') : n === f.parking ? icon('car') : '';
      return `<span class="f ${cls}"><span>${n === 'R' ? L('Roof', 'سطح') : n === 'G' ? L('G', 'أ') : n}</span>${ic}</span>`;
    }).join('');
    const navCard = nav ? `<div class="mt-nav"><span class="n-i">${icon('arrowUp')}</span><div style="min-width:0"><b>${L('In 350 m, turn right onto Al-Irsal St.', 'بعد 350 م، انعطف يميناً إلى شارع الإرسال')}</b><small>${L(`${j.min} min · ${j.km} km · arrive ${hm(S.clock + j.min)}`, `${j.min} د · ${j.km} كم · الوصول ${hm(S.clock + j.min)}`)}</small></div></div>` : '';
    const onSiteNow = ['onsite', 'inProgress', 'paused', 'completed'].includes(j.status);
    return {
      title: L('Location', 'الموقع'), back: `job-${j.id}`, backLabel: L('Job', 'المهمة'), hideTabs: true, tab: 'home',
      body: navCard + `<div class="mt-mapwrap">${B.map.render({ id: 'mtloc' + j.id.replace(/\W/g, ''), static: true, focus: j.b, focusW: nav ? 300 : 170, selected: j.b, legend: false, height: nav ? '260px' : '230px', layers: { parcels: true } })}</div>`
        + `<div class="mt-addr"><div style="min-width:0"><h2>${tx(b.name)}</h2><p>${tx(b.street || b.address || '')}${b.district && D.district ? ' · ' + tx(D.district(b.district).name) : ''}</p></div><div class="mt-eta"><b>${L(`${j.min} min`, `${j.min} د`)}</b><small>${L(`${j.km} km`, `${j.km} كم`)}</small></div></div>`
        + M.section(L('How to get to the equipment', 'كيف تصل إلى المعدات'), `<div class="mt-way"><div class="mt-floors" aria-label="${L('Floor diagram', 'مخطط الطوابق')}">${fl}</div><div class="mt-dirs">${j.dirs.map((d) => `<div class="mt-dir"><span class="d-i">${icon(d[0])}</span><div><b>${tx(d[1])}</b><small>${tx(d[2])}</small></div></div>`).join('')}</div></div>`)
        + M.group([M.cell({ icon: 'shield', tone: 'info', title: L('Security desk', 'مكتب الأمن'), sub: L('Lobby · open 24/7', 'الردهة · على مدار الساعة'), act: 'mxSoon', arg: L('Calling security', 'الاتصال بالأمن'), badge: `<span class="mt-pill ok sm">${icon('phone')}${L('Call', 'اتصال')}</span>`, chevron: false }), M.cell({ icon: 'building', title: L('Building profile', 'ملف المبنى'), sub: `${b.id} · ${L('BENA reference ID', 'معرّف BENA المرجعي')}`, act: 'mxSoon', arg: L('Building profile', 'ملف المبنى') })])
        + `<div class="mt-note">${icon('info')}${L('Simulated map and directions · sample location', 'خريطة واتجاهات محاكاة · موقع نموذجي')}</div>`
        + dock(onSiteNow ? big(L('Back to job', 'العودة إلى المهمة'), { icon: 'clipboard', go: `job-${j.id}`, kind: 'dark' }) : (nav ? M.btn(L('End', 'إنهاء'), { act: 'mtNav', arg: j.id, icon: 'x' }) + big(L("I've arrived", 'وصلت إلى الموقع'), { icon: 'pin', act: 'mtArrive', arg: j.id }) : M.btn(L("I'm here", 'أنا هنا'), { act: 'mtArrive', arg: j.id, icon: 'pin' }) + big(L('Navigate', 'ابدأ التوجيه'), { icon: 'route', act: 'mtNav', arg: j.id }))),
    };
  };

  /* --- Work instructions --- */
  const steps = (id) => {
    const j = pick(id);
    const n = stepsDone(j), total = j.steps.length;
    const next = j.done.findIndex((d) => !d);
    const list = `<div class="mt-steps">${j.steps.map((s, i) => `<button class="mt-step ${j.done[i] ? 'done' : ''} ${i === next ? 'next' : ''}" data-act="mtStep" data-arg="${j.id}:${i}" aria-pressed="${j.done[i] ? 'true' : 'false'}"><span class="ck">${j.done[i] ? icon('check') : i + 1}</span><span class="st-b"><span class="st-t" style="display:block">${tx(s.t)}</span><span class="st-s" style="display:block">${tx(s.s)}</span>${s.safety ? `<span class="st-flag">${icon('alert')}${L('Safety-critical', 'خطوة سلامة حرجة')}</span>` : ''}</span></button>`).join('')}</div>`;
    const safety = `<div class="mt-safety"><span class="sf-h">${icon('alert')}${L('Safety notes', 'ملاحظات السلامة')}</span><span class="mt-ppe">${j.ppe.map((k) => `<span>${icon(PPE[k][1])}${tx(PPE[k][0])}</span>`).join('')}</span><ul>${j.safety.map((s) => `<li>${tx(s)}</li>`).join('')}</ul></div>`;
    const dk = next >= 0 ? dock(big(L(`Done: step ${next + 1}`, `تم: الخطوة ${next + 1}`), { icon: 'check', act: 'mtNextStep', arg: j.id }), `${icon('clipboard')}${tx(j.steps[next].t)}`) : dock(big(L('All steps done · add photos', 'اكتملت الخطوات · أضف الصور'), { icon: 'camera', go: `photos-${j.id}` }));
    return {
      title: L('Work instructions', 'خطوات العمل'), back: `job-${j.id}`, backLabel: L('Job', 'المهمة'), hideTabs: true, tab: 'home',
      body: `<div class="mt-prog">${ring(n, total)}<div><div class="p-t">${n === total ? L('Checklist complete', 'اكتملت قائمة الفحص') : L(`${total - n} steps to go`, `متبقٍ ${total - n} خطوات`)}</div><div class="p-s">${tx(j.title)}</div></div></div>` + safety + list + `<div class="mt-note">${icon('info')}${L('Tap a step to tick or untick it', 'اضغط على الخطوة لتأشيرها أو إلغاء تأشيرها')}</div>` + dk,
    };
  };

  /* --- Asset details --- */
  const assetScreen = (tag) => {
    const t = tag && ASSETS[tag] ? tag : current().asset;
    const a = asset(t);
    const j = JOBS.find((x) => x.asset === t && x.status !== 'completed');
    if (!a) return { title: L('Asset', 'الأصل'), back: 'scan', body: M.empty('tag', L('Asset not in the sample set', 'الأصل غير موجود في البيانات النموذجية')) };
    const verified = S.scanned[t] || (j && S.verified[j.id]);
    const overdue = a.next < '2026-11-25';
    const specs = `<div class="mt-specs"><div><small>${L('Make & model', 'الشركة والطراز')}</small><b>${tx(a.make)}</b></div><div><small>${L('Serial no.', 'الرقم التسلسلي')}</small><b>${idm(a.serial)}</b></div><div><small>${L('Installed', 'سنة التركيب')}</small><b>${a.year}</b></div><div><small>${L('Condition', 'الحالة')}</small><b>${B.ui.status(a.cond)}</b></div>${a.specs.map((s) => `<div><small>${tx(s[0])}</small><b>${tx(s[1])}</b></div>`).join('')}</div>`;
    const svc = `<div class="mt-sum"><div><small>${icon('history')}${L('Last service', 'آخر صيانة')}</small><b style="font-size:18px">${B.dateShort(a.last)}</b></div><div class="${overdue ? 'warn' : ''}"><small>${icon('calendar')}${L('Next due', 'الاستحقاق التالي')}</small><b style="font-size:18px">${B.dateShort(a.next)}</b></div></div>`;
    const hist = M.section(L('Service history', 'سجل الصيانة'), M.group(a.hist.map((h) => M.cell({ icon: 'wrench', tone: 'mint', title: h[1], sub: `${B.date(h[0])} · ${tx(h[2])}` }))));
    const back = j ? `job-${j.id}` : 'scan';
    return {
      title: L('Asset', 'الأصل'), back, backLabel: j ? L('Job', 'المهمة') : L('Scan', 'المسح'), hideTabs: true, tab: j ? 'home' : 'scan',
      body: `<div class="mt-tag"><span class="qr">${B.art.qr(t.length + 11)}</span><div style="min-width:0"><small>${L('BENA asset tag', 'بطاقة أصل BENA')}</small><div>${idm(t)}</div><b>${tx(a.name)}</b></div></div>`
        + (verified ? `<div class="mt-done"><span class="d-i">${icon('checkCircle')}</span><div><b>${L('Tag verified on site', 'تم التحقق من البطاقة في الموقع')}</b><small>${L('Scanned and matched to this job', 'تم مسحها ومطابقتها مع هذه المهمة')}</small></div></div>` : '')
        + (overdue ? `<div class="callout warn">${icon('alert')}<div>${L(`Planned maintenance overdue since ${B.date(a.next)}`, `الصيانة المخططة متأخرة منذ ${B.date(a.next)}`)}</div></div>` : '')
        + M.group([M.cell({ icon: 'pin', tone: 'info', title: a.loc, sub: bname(a.b), chevron: false })])
        + svc + M.section(L('Specifications', 'المواصفات'), specs) + hist
        + `<div class="mt-note">${icon('info')}${L('Sample asset record · no live sensor or BMS connection', 'سجل أصل نموذجي · لا يوجد اتصال حي بحساسات أو بنظام إدارة المبنى')}</div>`
        + dock(verified ? big(j ? L('Back to job', 'العودة إلى المهمة') : L('Scan another tag', 'مسح بطاقة أخرى'), { icon: j ? 'clipboard' : 'scan', go: j ? `job-${j.id}` : 'scan', kind: 'dark' }) : big(L('Scan asset tag', 'مسح بطاقة الأصل'), { icon: 'scan', act: j ? 'mtVerify' : 'mtScan', arg: j ? j.id : t })),
    };
  };

  /* --- Before & after photos --- */
  const photos = (id) => {
    const j = pick(id);
    const nb = j.photos.before.findIndex((x) => !x), na = j.photos.after.findIndex((x) => !x);
    const nextKind = nb >= 0 ? 'before' : na >= 0 ? 'after' : null;
    const nextIdx = nb >= 0 ? nb : na;
    const grid = (kind) => `<div class="mt-photos">${j.photos[kind].map((p, i) => `<button class="mt-shot ${kind === nextKind && i === nextIdx ? 'next' : ''}" data-act="mtShot" data-arg="${j.id}:${kind}:${i}" aria-label="${esc(shotLabel(kind, i))}">
        <span class="mx-photo ${p ? 'filled' : ''}">${p ? photoArt(kind, i, p) + `<span class="sh-stamp">${p.d ? B.dateShort(p.d) + ' ' : ''}${hm(p.t)}</span><span class="sh-ok">${icon('check')}</span>` : icon('camera')}</span>
        <span class="sh-l">${shotLabel(kind, i)}</span><span class="sh-s">${p ? L('Tap to view or retake', 'اضغط للعرض أو إعادة الالتقاط') : i < 2 ? L('Required', 'مطلوبة') : L('Optional', 'اختيارية')}</span></button>`).join('')}</div>`;
    const sec = (kind, title) => M.section(title, grid(kind), { sub: L(`${j.photos[kind].filter(Boolean).length} of ${j.photos[kind].length}`, `${j.photos[kind].filter(Boolean).length} من ${j.photos[kind].length}`), link: { label: L('+ Add', '+ إضافة'), act: 'mtAddShot', arg: `${j.id}:${kind}` } });
    const pc = photoCount(j), tot = photoTotal(j);
    return {
      title: L('Before & after', 'قبل وبعد'), back: `job-${j.id}`, backLabel: L('Job', 'المهمة'), hideTabs: true, tab: 'home',
      body: `<div class="mt-prog">${ring(pc, tot)}<div><div class="p-t">${pc >= tot ? L('All photos captured', 'تم التقاط جميع الصور') : L('Capture the work', 'وثّق العمل بالصور')}</div><div class="p-s">${L('Photos are attached to the report and the asset history.', 'تُرفق الصور بالتقرير وبسجل الأصل.')}</div></div></div>`
        + sec('before', L('Before', 'قبل')) + sec('after', L('After', 'بعد'))
        + `<div class="mt-note">${icon('info')}${L('Simulated camera — photos are generated illustrations', 'كاميرا محاكاة — الصور رسوم مُولَّدة')}</div>`
        + dock(nextKind ? big(nextKind === 'before' ? L(`Take before photo ${nextIdx + 1}`, `التقط صورة «قبل» ${nextIdx + 1}`) : L(`Take after photo ${nextIdx + 1}`, `التقط صورة «بعد» ${nextIdx + 1}`), { icon: 'camera', act: 'mtNextShot', arg: j.id }) : big(j.status === 'completed' ? L('Back to job', 'العودة إلى المهمة') : L('Photos done · complete job', 'اكتملت الصور · أكمل المهمة'), { icon: 'checkCircle', go: j.status === 'completed' ? `job-${j.id}` : `complete-${j.id}` }), nextKind ? `${icon('camera')}${shotLabel(nextKind, nextIdx)}` : ''),
    };
  };

  /* --- Status updates --- */
  const status = (id) => {
    const j = pick(id);
    const sel = S.sel[j.id] || null;
    const opts = ['enroute', 'onsite', 'inProgress', 'paused', 'completed'];
    const list = `<div class="mt-opts">${opts.map((s) => {
      const isCur = j.status === s;
      const on = sel ? sel === s : false;
      const act = s === 'completed' ? `data-go="complete-${j.id}"` : s === 'paused' ? `data-act="mtStatus" data-arg="${j.id}:paused"` : `data-act="mtSel" data-arg="${j.id}:${s}"`;
      return `<button class="mt-opt ${isCur ? 'cur' : ''} ${on ? 'on' : ''}" ${act} ${isCur ? 'aria-current="true"' : ''}><span class="o-i">${icon(ST[s].icon)}</span><span style="min-width:0">${isCur ? `<span class="o-now">${L('Current', 'الحالية')}</span>` : ''}<b>${s === 'paused' ? L('Paused — waiting', 'متوقفة — بانتظار') : tx(ST[s].l)}</b><small>${tx(ST[s].d)}</small></span>${s === 'completed' || s === 'paused' ? icon('chevR', 'mc-c flip') : `<span class="o-r"></span>`}</button>`;
    }).join('')}</div>`;
    const logs = [...j.log].reverse();
    const log = `<div class="mt-log">${logs.map((e) => `<div class="lg"><time>${hm(e.t)}</time><span class="dot" style="${e.s === 'paused' ? 'background:#E9A23B' : e.s === 'assigned' ? 'background:#B6C2BD' : ''}"></span><div><b>${tx(ST[e.s] ? ST[e.s].l : e.s)}</b><small>${e.d ? B.dateShort(e.d) + ' · ' : ''}${e.note ? esc(tx(e.note)) + ' · ' : ''}${L('synced', 'تمت المزامنة')}</small></div></div>`).join('')}</div>`;
    return {
      title: L('Status', 'الحالة'), back: `job-${j.id}`, backLabel: L('Job', 'المهمة'), hideTabs: true, tab: 'home',
      body: `<div class="mt-head"><div class="hd-tags">${pill(j.status)}<span class="muted" style="font-size:14px">${idm(j.id)}</span></div><h2 style="font-size:20px">${tx(j.title)}</h2></div>` + tracker(j)
        + M.section(L('Update status', 'تحديث الحالة'), list) + M.section(L('Timeline', 'التسلسل الزمني'), log)
        + `<div class="mt-note">${icon('info')}${L('Updates are shared with the dispatcher and customer (simulated)', 'تُشارك التحديثات مع المنسّق والعميل (محاكاة)')}</div>`
        + (j.status === 'completed' ? '' : dock(big(sel && sel !== j.status ? L(`Set to: ${tx(ST[sel].l)}`, `تعيين إلى: ${tx(ST[sel].l)}`) : L('Choose a new status', 'اختر حالة جديدة'), { icon: 'check', act: 'mtApplySel', arg: j.id, kind: sel && sel !== j.status ? 'primary' : 'ghost' }))),
    };
  };

  /* --- Completion summary --- */
  const complete = (id) => {
    const j = pick(id);
    const done = j.status === 'completed';
    const sd = stepsDone(j), pc = photoCount(j);
    const onsite = j.onsiteAt != null ? (done ? j.doneAt : S.clock) - j.onsiteAt : 0;
    const partsCost = B.sum(j.parts, (p) => p.used * p.price);
    const sum = `<div class="mt-sum">
      <div><small>${icon('clock')}${L('Time on site', 'الوقت في الموقع')}</small><b>${j.onsiteAt != null ? dur(Math.max(1, onsite)) : '—'}</b></div>
      <div class="${sd < j.steps.length ? 'warn' : ''}"><small>${icon('clipboard')}${L('Steps', 'الخطوات')}</small><b>${sd}/${j.steps.length}</b></div>
      <div class="${pc < 4 ? 'warn' : ''}"><small>${icon('camera')}${L('Photos', 'الصور')}</small><b>${pc}/${photoTotal(j)}</b></div>
      <div><small>${icon('package')}${L('Parts value', 'قيمة القطع')}</small><b>${B.money(partsCost)}</b></div></div>`;
    const missing = [];
    if (j.onsiteAt == null) missing.push([L('Not checked in on site yet', 'لم يتم تسجيل الوصول بعد'), `status-${j.id}`]);
    if (sd < j.steps.length) missing.push([L(`${j.steps.length - sd} instruction steps open`, `${j.steps.length - sd} خطوات غير مكتملة`), `steps-${j.id}`]);
    if (pc < 4) missing.push([L('Before & after photos missing', 'صور قبل وبعد ناقصة'), `photos-${j.id}`]);
    if (!S.verified[j.id]) missing.push([L('Asset tag not scanned', 'لم يتم مسح بطاقة الأصل'), `asset-${j.asset}`]);
    const check = !done && missing.length ? M.group(missing.map((m) => M.cell({ icon: 'alertCircle', tone: 'warn', title: m[0], go: m[1] })), L('Before you submit', 'قبل الإرسال')) : '';
    const parts = j.parts.length ? M.section(L('Parts used', 'القطع المستخدمة'), `<div class="mx-group">${j.parts.map((p, i) => `<div class="mt-part"><div class="p-b"><b>${tx(p.n)}</b><small>${L(`${B.money(p.price)} each · reserved ×${p.q}`, `${B.money(p.price)} للقطعة · محجوز ×${p.q}`)}</small></div>${done ? `<b>×${p.used}</b>` : `<div class="mt-qty"><button data-act="mtQty" data-arg="${j.id}:${i}:-1" aria-label="${L('Less', 'أقل')}">${icon('minus')}</button><b>${p.used}</b><button data-act="mtQty" data-arg="${j.id}:${i}:1" aria-label="${L('More', 'أكثر')}">${icon('plus')}</button></div>`}</div>`).join('')}</div>`) : '';
    const signer = S.signer[j.id] ?? (j.contact ? pname(j.contact.p) : '');
    const notes = S.notes[j.id] ?? '';
    if (done) {
      return {
        title: L('Completion report', 'تقرير الإنجاز'), back: `job-${j.id}`, backLabel: L('Job', 'المهمة'), hideTabs: true, tab: 'home',
        body: `<div class="mt-done"><span class="d-i">${icon('check')}</span><div><b>${L('Completed', 'مكتملة')} · ${hm(j.doneAt)}</b><small>${L('Report', 'التقرير')} ${idm('RPT-' + j.id.slice(3))} · ${L('sent to Sanad and the building manager', 'أُرسل إلى سند ومدير المبنى')}</small></div></div>`
          + sum + parts + (notes ? M.section(L('Technician notes', 'ملاحظات الفني'), `<div class="mx-card"><div class="mt-brief">${esc(notes)}</div></div>`) : '')
          + M.section(L('Customer sign-off', 'توقيع العميل'), `<div class="mt-sig-img">${S.sig[j.id] ? `<img src="${S.sig[j.id]}" alt="${L('Signature', 'التوقيع')}">` : ''}</div><div class="mt-note">${icon('userCheck')}${esc(signer)} · ${hm(j.doneAt)}</div>`)
          + `<div class="mt-note">${icon('info')}${L('Prototype — the report was not actually sent.', 'نموذج أولي — لم يُرسل التقرير فعلياً.')}</div>`
          + dock(big(L('Back to my jobs', 'العودة إلى مهامي'), { icon: 'clipboard', go: 'home', kind: 'dark' })),
      };
    }
    bindSig(j.id);
    return {
      title: L('Complete job', 'إكمال المهمة'), back: `job-${j.id}`, backLabel: L('Job', 'المهمة'), hideTabs: true, tab: 'home',
      body: `<div class="mt-head"><div class="hd-tags">${pill(j.status)}<span class="muted" style="font-size:14px">${idm(j.id)}</span></div><h2 style="font-size:20px">${tx(j.title)}</h2></div>`
        + sum + check + parts
        + M.section(L('Notes for the report', 'ملاحظات للتقرير'), `<textarea class="mx-textarea" id="mt-notes" data-model="mt:notes:${j.id}" data-norender placeholder="${esc(L('What did you find and fix? Any follow-up needed?', 'ماذا وجدت وأصلحت؟ هل تلزم متابعة؟'))}">${esc(notes)}</textarea>`)
        + M.section(L('Customer signature', 'توقيع العميل'), `<div class="mt-sig ${S.sig[j.id] ? 'signed' : ''}"><canvas id="mt-sigc" aria-label="${L('Signature pad', 'لوحة التوقيع')}"></canvas>${S.sig[j.id] ? '' : `<span class="ph">${icon('edit')}${L('Customer signs here', 'يوقّع العميل هنا')}</span>`}<span class="base"></span><span class="x">✕</span></div>
            <div class="row between" style="gap:8px;margin-top:-2px">${M.btn(L('Clear', 'مسح'), { sm: true, act: 'mtSigClear', arg: j.id, icon: 'refresh' }).replace('<button', `<button id="mt-sigclear" ${S.sig[j.id] ? '' : 'hidden'}`)}${M.btn(L('Sample signature', 'توقيع نموذجي'), { sm: true, kind: 'soft', act: 'mtSigDemo', arg: j.id, icon: 'edit' })}</div>
            ${M.field({ name: 'signer', label: L('Signed by', 'اسم الموقّع'), value: signer, placeholder: L('Full name', 'الاسم الكامل') }).replace('id="mxf-signer"', 'id="mt-signer"').replace('for="mxf-signer"', 'for="mt-signer"')}`)
        + `<div class="mt-note">${icon('info')}${L('Simulated sign-off — nothing is sent or stored.', 'توقيع محاكى — لا يُرسل أو يُخزَّن شيء.')}</div>`
        + dock(big(L('Submit completion', 'إرسال الإنجاز'), { icon: 'send', act: 'mtSubmit', arg: j.id })),
    };
  };
  // keep typed notes / signer between re-renders
  document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'mt-signer') { const a = document.querySelector('[data-act="mtSubmit"]'); if (a) S.signer[a.dataset.arg] = e.target.value; }
    if (e.target && e.target.id === 'mt-notes') { const a = document.querySelector('[data-act="mtSubmit"]'); if (a) S.notes[a.dataset.arg] = e.target.value; }
  });

  /* --- Route (today's map) --- */
  const route = () => {
    const tj = today();
    const markers = tj.map((j, i) => ({ id: j.b, label: String(i + 1), tone: LIVE.includes(j.status) ? 'mint' : 'navy' }));
    return {
      title: L('Route', 'المسار'), large: true, kicker: L(`${tj.length} stops today`, `${tj.length} محطات اليوم`), actions: [bell],
      body: `<div class="mt-mapwrap">${B.map.render({ id: 'mtroute', static: true, focus: 'BN-RAM-00311', focusW: 620, markers, legend: false, height: '300px' })}</div>`
        + `<div class="mt-route">${M.group(tj.map((j, i) => M.cell({ icon: 'pin', tone: LIVE.includes(j.status) ? 'mint' : 'navy', title: tx(bld(j.b).name), sub: `${j.from} · ${tx(j.title)}`, value: L(`${j.min} min`, `${j.min} د`), valueSub: L(`${j.km} km`, `${j.km} كم`), go: `location-${j.id}` })).map((c, i) => c.replace(/<span class="mc-i ([a-z]*)">[\s\S]*?<\/span>/, `<span class="mc-i $1">${i + 1}</span>`)), L('Stops in order', 'المحطات بالترتيب'))}</div>`
        + M.kpis([{ label: L('Driving today', 'القيادة اليوم'), value: L(`${B.num1(B.sum(tj, (j) => j.km))} km`, `${B.num1(B.sum(tj, (j) => j.km))} كم`), icon: 'car' }, { label: L('Travel time', 'وقت التنقل'), value: dur(B.sum(tj, (j) => j.min)), icon: 'clock' }])
        + `<div class="mt-note">${icon('info')}${L('Simulated map · sample locations in Ramallah', 'خريطة محاكاة · مواقع نموذجية في رام الله')}</div>`,
    };
  };

  /* --- Scan --- */
  const scan = () => {
    const found = S.scanFound && asset(S.scanFound);
    const target = current().asset;
    const recent = Object.keys(ASSETS).slice(0, 4);
    return {
      title: L('Scan', 'المسح'), large: true, kicker: L('BENA asset tags', 'بطاقات أصول BENA'), actions: [bell],
      body: `<div class="mt-scan ${found ? 'found' : ''}"><div class="feed"></div><div class="plate">${B.art.qr((S.scanFound || target).length + 11)}</div><div class="vf"><i></i><i></i><i></i><i></i><span class="ln"></span></div><div class="cap"><span>${icon('zap', '').replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px"')} ${L('Torch off', 'الضوء مطفأ')}</span><span>${L('Simulated camera', 'كاميرا محاكاة')}</span></div><div class="hint">${found ? L('Tag recognised', 'تم التعرّف على البطاقة') : L('Point at the QR tag on the unit', 'وجّه الكاميرا إلى رمز QR على الوحدة')}</div></div>`
        + (found ? `<button class="mt-found" data-go="asset-${S.scanFound}"><span class="f-i">${icon('tag')}</span><span style="min-width:0;flex:1"><b>${tx(found.name)}</b><small>${idm(S.scanFound)} · ${bname(found.b)}</small></span>${icon('chevR', 'mc-c flip')}</button>` : '')
        + M.group(recent.map((t) => M.cell({ icon: 'tag', title: ASSETS[t].name, sub: t, go: `asset-${t}` })), L('Recent assets', 'الأصول الأخيرة'))
        + dock(found ? M.btn(L('Scan again', 'مسح جديد'), { act: 'mtScanReset', icon: 'refresh' }) + big(L('Open asset', 'فتح الأصل'), { icon: 'tag', go: `asset-${S.scanFound}` }) : big(L('Simulate scan', 'محاكاة المسح'), { icon: 'scan', act: 'mtScan', arg: target })),
    };
  };

  /* --- Work history --- */
  const history = () => {
    const q = B.get('mt:hq', '');
    const all = [...S.done, ...HIST].filter((h) => B.match(q, h.title, h.id, bld(h.b).name));
    const groups = {};
    all.forEach((h) => { const k = h.date.slice(0, 7); (groups[k] = groups[k] || []).push(h); });
    const mins = B.sum([...S.done, ...HIST], (h) => h.mins) / ((S.done.length + HIST.length) || 1);
    const ftf = Math.round(([...S.done, ...HIST].filter((h) => h.ftf).length / ((S.done.length + HIST.length) || 1)) * 100);
    return {
      title: L('History', 'السجل'), large: true, kicker: L('Completed work', 'الأعمال المنجزة'), actions: [bell],
      body: `<div class="mt-stats"><div><b>${S.done.length + 14}</b><small>${L('Jobs in Nov', 'مهام ت٢')}</small></div><div><b>${durShort(Math.round(mins))}</b><small>${L('Avg on site', 'متوسط الوقت')}</small></div><div><b>${ftf}%</b><small>${L('First-time fix', 'إصلاح من أول زيارة')}</small></div></div>`
        + M.search('mt:hq', L('Search jobs, assets, buildings', 'ابحث في المهام والأصول والمباني'))
        + (all.length ? Object.keys(groups).sort().reverse().map((k) => M.group(groups[k].map((h) => M.cell({ icon: h.live ? 'checkCircle' : 'check', tone: 'mint', title: h.title, sub: `${bname(h.b)} · ${h.date === '2026-11-25' ? L('Today', 'اليوم') : B.dateShort(h.date)}`, value: dur(h.mins), valueSub: h.ftf ? L('First visit', 'أول زيارة') : L('Follow-up', 'متابعة'), go: `job-${h.id}` })), B.monthYear(k + '-01'))).join('') : M.empty('search', L('No matching jobs', 'لا توجد مهام مطابقة')))
        + `<div class="mt-note">${icon('info')}${L('Sample work history', 'سجل أعمال نموذجي')}</div>`,
    };
  };

  /* --- Profile & settings --- */
  const me = () => ({
    title: L('Me', 'حسابي'), large: true, kicker: orgName(),
    body: `<div class="mt-me">${B.ui.avatar(ME.name, '', '#CDF4E5')}<div style="min-width:0;flex:1"><b>${tx(ME.name)}</b><small>${tx(ME.role)}</small><small>${idm(ME.id)}</small></div></div>`
      + `<button class="mt-opt" data-act="mtShift"><span class="o-i">${icon(S.shift ? 'checkCircle' : 'clock')}</span><span style="min-width:0"><b>${S.shift ? L('On shift', 'في الوردية') : L('On break', 'في استراحة')}</b><small>${S.shift ? L('Shift 08:00–17:00 · tap to start a break', 'الوردية 08:00–17:00 · اضغط لبدء استراحة') : L('Tap to return to shift', 'اضغط للعودة إلى الوردية')}</small></span><span class="mt-switch ${S.shift ? 'on' : ''}" role="switch" aria-checked="${S.shift}"></span></button>`
      + M.group([M.cell({ icon: 'award', tone: 'mint', title: L('F-Gas handling certificate', 'شهادة التعامل مع غازات التبريد'), sub: L('Valid until Mar 2028 (sample)', 'سارية حتى آذار 2028 (نموذج)') }), M.cell({ icon: 'shieldCheck', tone: 'mint', title: L('Work-at-height training', 'تدريب العمل على المرتفعات'), sub: L('Renew by Jun 2027', 'التجديد قبل حزيران 2027') }), M.cell({ icon: 'car', title: L('Van RAM-SND-07', 'السيارة RAM-SND-07'), sub: L('Stock checked this morning', 'تم فحص المخزون صباح اليوم') })], L('Credentials', 'المؤهلات'))
      + M.group([M.cell({ icon: 'globe', tone: 'info', title: L('Language', 'اللغة'), sub: B.isAr() ? 'العربية' : 'English', value: B.isAr() ? 'English' : 'العربية', act: 'lang', chevron: false }), M.cell({ icon: 'bell', tone: 'info', title: L('Notifications', 'الإشعارات'), go: 'notifications' }), M.cell({ icon: 'refresh', tone: 'info', title: L('Offline sync', 'المزامنة دون اتصال'), sub: L('Jobs, maps and manuals saved for offline use (simulated)', 'المهام والخرائط والأدلة محفوظة للعمل دون اتصال (محاكاة)'), act: 'mxToast', arg: L('Everything is synced (simulated)', 'تمت مزامنة كل شيء (محاكاة)') })], L('Settings', 'الإعدادات'))
      + M.group([M.cell({ icon: 'swap', title: L('Switch profile', 'تبديل الملف'), act: 'mxRoles' }), M.cell({ icon: 'grid', title: L('Open the web app (facility)', 'فتح تطبيق الويب (المرافق)'), go: 'facility-home' }), M.cell({ icon: 'compass', title: L('Demo hub', 'مركز العرض'), go: 'hub' })])
      + `<div class="mt-note">${icon('info')}${L('Prototype · fictional technician and sample data', 'نموذج أولي · فني وهمي وبيانات نموذجية')}</div>`,
  });

  /* notifications list (time shown as a trailing label) */
  const notifScreen = () => {
    const list = (B.mroles[R].notifications && B.mroles[R].notifications()) || [];
    return { title: L('Notifications', 'الإشعارات'), large: true, back: 'home', tab: 'home', actions: [{ icon: 'checkCircle', act: 'mxToast', arg: L('All marked as read', 'تم تعليم الكل كمقروء'), label: L('Mark all read', 'تعليم الكل كمقروء') }],
      body: list.length ? M.group(list.map((n) => M.cell({ icon: n.icon || 'bell', tone: n.tone || 'mint', title: String(tx(n.title)).replace(/\b([A-Z]{2,3}-\d{2}-\d{3,4}|[A-Z]{2,3}-\d{4,5})\b/g, '<span style="white-space:nowrap">$1</span>'), sub: n.sub, go: n.go, badge: `<span style="font-size:12.5px;color:var(--text-3);font-weight:500;white-space:nowrap">${tx(n.when || '')}</span>` }))) + `<div style="font-size:13px;color:var(--text-3);text-align:center">${L('Sample notifications', 'إشعارات نموذجية')}</div>` : M.empty('bell', L('You are all caught up', 'لا توجد إشعارات جديدة')) };
  };

  /* ======================================================================
     Register
     ====================================================================== */
  B.mrole({
    id: R, webRole: 'facility', icon: 'wrench', home: 'home',
    name: T('Field Technician', 'فني ميداني'), short: T('Technician', 'فني'),
    persona: { name: ME.name, sub: T('Sanad Facility Services', 'سند لخدمات إدارة المرافق') },
    tabs: [
      { id: 'home', label: T('Jobs', 'المهام'), icon: 'clipboard' },
      { id: 'route', label: T('Route', 'المسار'), icon: 'route' },
      { id: 'scan', label: T('Scan', 'المسح'), icon: 'scan' },
      { id: 'history', label: T('History', 'السجل'), icon: 'history' },
      { id: 'me', label: T('Me', 'حسابي'), icon: 'user' },
    ],
    more: [
      { id: 'job', label: T('Job details', 'تفاصيل المهمة'), icon: 'clipboard' },
      { id: 'location', label: T('Building location', 'موقع المبنى'), icon: 'pin' },
      { id: 'steps', label: T('Work instructions', 'خطوات العمل'), icon: 'checkSquare' },
      { id: 'asset', label: T('Asset details', 'تفاصيل الأصل'), icon: 'tag' },
      { id: 'photos', label: T('Before & after photos', 'صور قبل وبعد'), icon: 'camera' },
      { id: 'status', label: T('Status updates', 'تحديث الحالة'), icon: 'activity' },
      { id: 'complete', label: T('Completion summary', 'ملخص الإنجاز'), icon: 'checkCircle' },
      { id: 'notifications', label: T('Notifications', 'الإشعارات'), icon: 'bell' },
    ],
    screens: {
      home, route, scan, history, me,
      job: (id) => jobScreen(id || current().id),
      location, steps, photos, status, complete,
      asset: (id) => assetScreen(id),
      notifications: () => notifScreen(),
    },
    notifications: () => [
      { icon: 'chat', tone: 'info', title: L('Customer note on WO-26-1187', 'ملاحظة من العميل على WO-26-1187'), sub: L('“Please avoid 11:00–11:30, we have a client meeting.” — Karim Asfour', '«يرجى تجنّب 11:00–11:30، لدينا اجتماع مع عميل.» — كريم عصفور'), when: L('9:48', '9:48'), go: 'job-WO-26-1187' },
      { icon: 'shieldCheck', tone: 'mint', title: L('Permit PTW-311-2291 approved', 'تمت الموافقة على التصريح PTW-311-2291'), sub: L('Work at height · office 702', 'عمل على ارتفاع · المكتب 702'), when: L('9:30', '9:30'), go: 'steps-WO-26-1187' },
      { icon: 'clipboard', tone: 'mint', title: L('New job assigned: WO-26-1190', 'مهمة جديدة: WO-26-1190'), sub: L('VRF retail service · Sat 28 Nov, 09:00', 'صيانة VRF للمحلات · السبت 28 ت٢، 09:00'), when: L('8:15', '8:15'), go: 'job-WO-26-1190' },
      { icon: 'package', tone: 'warn', title: L('Part ordered for WO-26-1166', 'تم طلب قطعة لـ WO-26-1166'), sub: L('Bearing 6308-2RS ×2 · arrives 27 Nov', 'محمل 6308-2RS ×2 · يصل 27 ت٢'), when: L('Yesterday', 'أمس'), go: 'job-WO-26-1166' },
      { icon: 'clock', tone: 'info', title: L('Evening job reminder', 'تذكير بمهمة مسائية'), sub: L('HEPA change after 18:00 · Ma’ahid Medical Plaza', 'تغيير HEPA بعد 18:00 · مجمع المعاهد الطبي'), when: L('Yesterday', 'أمس'), go: 'job-WO-26-1183' },
    ],
  });
})();
