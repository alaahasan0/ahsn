/*
 * BENA Mobile — Building Committee (Al-Masyoun Tower Owners' Association).
 * Persona: Samer Khoury, chair. Personal, task-oriented: approvals, votes,
 * announcements and the building's money at a glance.
 * Legal status is shown exactly as documented (c_masyoun is a registered
 * owners' association) — BENA never assigns legal status itself.
 * All people, figures and documents are fictional sample data; voting,
 * approvals and payments are simulated in memory.
 */
(function () {
  const B = window.B, M = B.m, D = B.data;
  const { L, tx, icon, esc } = B;
  const T = (en, ar) => ({ en, ar });
  const R = 'committee';

  /* ======================================================================
     Styles (prefix mc- ; avoids the shell's .mc-i/.mc-b/.mc-t/.mc-s/.mc-v/.mc-c)
     ====================================================================== */
  B.css(`
  .mc-assoc { background: var(--navy); color: var(--navy-ink); border-radius: 24px; padding: 18px; display: flex; flex-direction: column; gap: 14px; position: relative; overflow: hidden; text-align: start; width: 100%; }
  .mc-assoc::after { content: ""; position: absolute; inset-inline-end: -50px; bottom: -70px; width: 200px; height: 200px; border-radius: 50%; border: 28px solid rgba(54,214,160,.08); pointer-events: none; }
  .mc-assoc .a-top { display: flex; gap: 12px; align-items: center; }
  .mc-assoc .a-logo { width: 46px; height: 46px; border-radius: 14px; background: rgba(255,255,255,.08); display: grid; place-items: center; color: var(--mint); flex: none; }
  .mc-assoc .a-logo svg { width: 24px; height: 24px; }
  .mc-assoc h2 { color: #fff; font-size: 18px; line-height: 1.25; }
  .mc-assoc .a-sub { font-size: 13.5px; margin-top: 2px; }
  .mc-assoc .a-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .mc-assoc .badge.navy { background: rgba(54,214,160,.16); color: #9FF0D2; }
  .mc-assoc .badge.navy svg { color: var(--mint); }
  .mc-assoc .a-chip { display: inline-flex; align-items: center; height: 24px; padding: 0 9px; border-radius: 12px; background: rgba(255,255,255,.08); font-size: 12px; font-weight: 600; color: #DDE6EC; }
  .mc-assoc .a-note { font-size: 13px; line-height: 1.45; display: flex; gap: 8px; color: #AFC0CC; }
  .mc-assoc .a-note svg { width: 16px; height: 16px; flex: none; margin-top: 1px; color: var(--mint); }
  .mc-assoc .a-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; position: relative; z-index: 1; }
  .mc-assoc .a-stats div { background: rgba(255,255,255,.06); border-radius: 14px; padding: 10px 12px; }
  .mc-assoc .a-stats b { display: block; color: #fff; font: 700 18px/1.15 var(--font-display); font-variant-numeric: tabular-nums; }
  .mc-assoc .a-stats small { font-size: 12px; }
  .mc-livecard { background: #fff; border: 1.5px solid var(--mint); border-radius: 22px; padding: 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 0 0 4px rgba(54,214,160,.12); text-align: start; width: 100%; }
  .mc-live { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; color: var(--bad); text-transform: uppercase; letter-spacing: .06em; }
  html[dir="rtl"] .mc-live { letter-spacing: 0; }
  .mc-live i { width: 9px; height: 9px; border-radius: 50%; background: #E5484D; animation: mcPulse 1.6s ease-in-out infinite; }
  @keyframes mcPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(229,72,77,.45); } 50% { box-shadow: 0 0 0 6px rgba(229,72,77,0); } }
  .mc-livecard h3 { font-size: 17px; line-height: 1.3; }
  .mc-livecard p { font-size: 14px; color: var(--text-2); }
  .mc-faces { display: flex; align-items: center; }
  .mc-faces .avatar { width: 32px; height: 32px; font-size: 11.5px; border: 2px solid #fff; }
  .mc-faces .avatar + .avatar { margin-inline-start: -8px; }
  .mc-faces small { margin-inline-start: 10px; font-size: 13px; color: var(--text-2); }
  .mc-dt { width: 50px; height: 54px; border-radius: 14px; background: var(--line-2); display: flex; flex-direction: column; align-items: center; justify-content: center; flex: none; color: var(--navy); }
  .mc-dt small { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--mint-ink); line-height: 1; }
  .mc-dt b { font: 700 20px/1.1 var(--font-display); }
  .mc-dt.live { background: var(--bad-bg); }
  .mc-dt.live small { color: var(--bad); }
  .mc-dt.past { background: #F1F4F3; color: var(--text-3); }
  .mc-dt.past small { color: var(--text-3); }
  .mc-meet { display: flex; gap: 14px; align-items: center; padding: 12px 16px; min-height: 76px; width: 100%; text-align: start; position: relative; background: #fff; }
  .mc-meet + .mc-meet::before { content: ""; position: absolute; top: 0; inset-inline: 80px 0; border-top: 1px solid var(--line-2); }
  .mc-meet:active { background: #F3F6F5; }
  .mc-meet .m-b { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .mc-meet .m-t { font-size: 16px; font-weight: 600; line-height: 1.3; }
  .mc-meet .m-s { font-size: 13.5px; color: var(--text-2); }
  .mc-meet .chev { width: 18px; height: 18px; color: #B6C2BD; flex: none; }
  .mc-vote { background: #fff; border: 1.5px solid var(--line-2); border-radius: 22px; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
  .mc-vote.open { border-color: var(--mint); box-shadow: 0 0 0 4px rgba(54,214,160,.12); }
  .mc-vote .v-k { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .mc-vote h3 { font-size: 17px; line-height: 1.35; }
  .mc-vote .v-rule { font-size: 13px; color: var(--text-2); display: flex; gap: 6px; align-items: center; }
  .mc-vote .v-rule svg { width: 15px; height: 15px; flex: none; }
  .mc-tally { display: flex; height: 12px; border-radius: 6px; overflow: hidden; background: var(--line-2); gap: 2px; }
  .mc-tally i { display: block; height: 100%; transition: width .4s var(--ease); }
  .mc-legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 13px; color: var(--text-2); }
  .mc-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .mc-legend i { width: 10px; height: 10px; border-radius: 3px; }
  .mc-legend b { color: var(--ink); font-variant-numeric: tabular-nums; }
  .mc-vbtns { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .mc-vbtn { min-height: 68px; border-radius: 16px; border: 1.5px solid var(--line); background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-weight: 700; font-size: 15px; color: var(--ink); }
  .mc-vbtn svg { width: 22px; height: 22px; }
  .mc-vbtn:active { transform: scale(.98); }
  .mc-vbtn.for { color: var(--mint-ink); } .mc-vbtn.against { color: var(--bad); } .mc-vbtn.abstain { color: var(--warn); }
  .mc-vbtn.on.for { background: var(--mint); border-color: var(--mint); color: var(--navy); }
  .mc-vbtn.on.against { background: var(--bad); border-color: var(--bad); color: #fff; }
  .mc-vbtn.on.abstain { background: #E9A23B; border-color: #E9A23B; color: #fff; }
  .mc-voters { display: flex; flex-direction: column; border-top: 1px solid var(--line-2); padding-top: 4px; }
  .mc-voter { display: flex; align-items: center; gap: 10px; padding: 7px 0; font-size: 14.5px; }
  .mc-voter .avatar { width: 30px; height: 30px; font-size: 11px; }
  .mc-voter .nm { flex: 1; min-width: 0; }
  .mc-voter .nm small { display: block; font-size: 12.5px; color: var(--text-3); }
  .mc-vv { font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px; }
  .mc-vv svg { width: 15px; height: 15px; }
  .mc-vv.for { color: var(--mint-ink); } .mc-vv.against { color: var(--bad); } .mc-vv.abstain { color: var(--warn); } .mc-vv.pending { color: var(--text-3); } .mc-vv.absent { color: var(--text-3); font-weight: 600; }
  .mc-result { border-radius: 16px; padding: 14px; display: flex; gap: 12px; align-items: center; }
  .mc-result.ok { background: var(--mint-50); color: #0A6E4D; }
  .mc-result.bad { background: var(--bad-bg); color: var(--bad); }
  .mc-result svg { width: 24px; height: 24px; flex: none; }
  .mc-result b { font-size: 16px; display: block; color: inherit; }
  .mc-result small { font-size: 13px; display: block; }
  .mc-agenda { background: #fff; border: 1px solid var(--line-2); border-radius: 20px; overflow: hidden; }
  .mc-ag { display: flex; gap: 12px; padding: 14px 16px; position: relative; align-items: flex-start; }
  .mc-ag + .mc-ag::before { content: ""; position: absolute; top: 0; inset-inline: 58px 0; border-top: 1px solid var(--line-2); }
  .mc-ag .n { width: 28px; height: 28px; border-radius: 50%; background: var(--line-2); display: grid; place-items: center; font: 700 13px/1 var(--font-display); flex: none; color: var(--text-2); }
  .mc-ag .n svg { width: 15px; height: 15px; }
  .mc-ag.done .n { background: var(--mint-50); color: var(--mint-ink); }
  .mc-ag.current { background: #F5FCF9; }
  .mc-ag.current .n { background: var(--mint); color: var(--navy); }
  .mc-ag b { font-size: 15px; display: block; line-height: 1.35; font-weight: 600; }
  .mc-ag small { font-size: 13px; color: var(--text-2); display: block; margin-top: 2px; }
  .mc-ag .now { font-size: 11.5px; font-weight: 700; color: var(--mint-ink); text-transform: uppercase; letter-spacing: .05em; margin-top: 4px; display: block; }
  html[dir="rtl"] .mc-ag .now { letter-spacing: 0; }
  .mc-att { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 14px 8px; }
  .mc-att div { display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; min-width: 0; }
  .mc-att .avatar { width: 46px; height: 46px; font-size: 15px; box-shadow: 0 0 0 2.5px #fff, 0 0 0 4.5px var(--mint); }
  .mc-att .off .avatar { box-shadow: 0 0 0 2.5px #fff, 0 0 0 4.5px #D5DEDA; opacity: .6; }
  .mc-att b { font-size: 12.5px; line-height: 1.2; font-weight: 600; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .mc-att small { font-size: 11.5px; color: var(--mint-ink); font-weight: 600; }
  .mc-att .off small { color: var(--text-3); }
  .mc-mhead { display: flex; flex-direction: column; gap: 10px; }
  .mc-mhead h2 { font-size: 23px; line-height: 1.22; letter-spacing: -.015em; }
  .mc-mhead .mh-meta { display: flex; flex-direction: column; gap: 6px; font-size: 14.5px; color: var(--text-2); }
  .mc-mhead .mh-meta span { display: flex; gap: 8px; align-items: center; }
  .mc-mhead .mh-meta svg { width: 17px; height: 17px; color: var(--mint-ink); flex: none; }
  .mc-quorum { background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .mc-quorum .q-top { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
  .mc-quorum b { font: 700 24px/1 var(--font-display); font-variant-numeric: tabular-nums; }
  .mc-quorum small { font-size: 13px; color: var(--text-2); }
  .mc-qbar { position: relative; height: 10px; border-radius: 5px; background: var(--line-2); }
  .mc-qbar i { position: absolute; inset-block: 0; inset-inline-start: 0; border-radius: 5px; background: var(--mint); }
  .mc-qbar em { position: absolute; top: -4px; bottom: -4px; width: 2px; background: var(--navy); border-radius: 1px; }
  .mc-exp { background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .mc-exp .e-top { display: flex; gap: 12px; align-items: flex-start; }
  .mc-exp .e-i { width: 42px; height: 42px; border-radius: 13px; background: var(--warn-bg); color: var(--warn); display: grid; place-items: center; flex: none; }
  .mc-exp .e-i svg { width: 21px; height: 21px; }
  .mc-exp .e-b { flex: 1; min-width: 0; }
  .mc-exp .e-b b { font-size: 16px; display: block; line-height: 1.3; }
  .mc-exp .e-b small { font-size: 13.5px; color: var(--text-2); display: block; margin-top: 2px; }
  .mc-exp .e-amt { font: 700 19px/1.1 var(--font-display); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .mc-exp .e-acts { display: flex; gap: 8px; }
  .mc-exp .e-acts .mx-btn { flex: 1; }
  .mc-exp .e-lock { font-size: 13px; color: var(--violet); background: var(--violet-bg); border-radius: 12px; padding: 9px 12px; display: flex; gap: 8px; align-items: center; }
  .mc-exp .e-lock svg { width: 16px; height: 16px; flex: none; }
  .mc-amount { text-align: center; padding: 6px 0 2px; }
  .mc-amount b { font: 700 38px/1.1 var(--font-display); font-variant-numeric: tabular-nums; display: block; letter-spacing: -.02em; }
  .mc-amount small { font-size: 14px; color: var(--text-2); }
  .mc-bud { background: #fff; border: 1px solid var(--line-2); border-radius: 20px; overflow: hidden; }
  .mc-bl { display: flex; gap: 12px; padding: 14px 16px; align-items: center; position: relative; }
  .mc-bl + .mc-bl::before { content: ""; position: absolute; top: 0; inset-inline: 66px 0; border-top: 1px solid var(--line-2); }
  .mc-bl .b-i { width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; flex: none; color: #fff; }
  .mc-bl .b-i svg { width: 19px; height: 19px; }
  .mc-bl .b-b { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 7px; }
  .mc-bl .b-top { display: flex; justify-content: space-between; gap: 8px; font-size: 15px; font-weight: 600; }
  .mc-bl .b-top span:last-child { font-variant-numeric: tabular-nums; color: var(--text-2); font-weight: 500; font-size: 14px; white-space: nowrap; }
  .mc-bl .b-top span:last-child b { color: var(--ink); }
  .mc-bar { height: 8px; border-radius: 4px; background: var(--line-2); overflow: hidden; }
  .mc-bar i { display: block; height: 100%; border-radius: 4px; }
  .mc-bl.over .b-top span:last-child b { color: var(--bad); }
  .mc-big { background: #fff; border: 1px solid var(--line-2); border-radius: 22px; padding: 18px; display: flex; flex-direction: column; gap: 14px; }
  .mc-big .bg-top { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; }
  .mc-big small { font-size: 13.5px; color: var(--text-2); display: block; }
  .mc-big .bg-v { font: 700 30px/1.1 var(--font-display); font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
  .mc-big .bg-r { text-align: end; }
  .mc-big .bg-r b { font-size: 16px; font-variant-numeric: tabular-nums; }
  .mc-ring { position: relative; width: 64px; height: 64px; flex: none; }
  .mc-ring svg { width: 64px; height: 64px; transform: rotate(-90deg); }
  .mc-ring b { position: absolute; inset: 0; display: grid; place-items: center; font: 700 15px/1 var(--font-display); }
  .mc-ann { background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 16px; display: flex; flex-direction: column; gap: 8px; text-align: start; width: 100%; }
  .mc-ann .an-top { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .mc-ann h3 { font-size: 16.5px; line-height: 1.3; }
  .mc-ann p { font-size: 14.5px; color: var(--text-2); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .mc-ann .an-foot { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; color: var(--text-3); align-items: center; }
  .mc-ann .an-foot span { display: inline-flex; gap: 5px; align-items: center; }
  .mc-ann .an-foot svg { width: 15px; height: 15px; }
  .mc-ann.pinned { border-color: var(--mint-100); background: linear-gradient(180deg, #F3FCF8, #fff 60%); }
  .mc-tag { display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 9px; border-radius: 12px; font-size: 12px; font-weight: 700; background: var(--line-2); color: var(--text-2); }
  .mc-tag svg { width: 13px; height: 13px; }
  .mc-tag.notice { background: var(--info-bg); color: var(--info); }
  .mc-tag.meeting { background: var(--violet-bg); color: var(--violet); }
  .mc-tag.maintenance { background: var(--warn-bg); color: var(--warn); }
  .mc-tag.community { background: var(--mint-50); color: var(--mint-ink); }
  .mc-tag.pin { background: var(--navy); color: #fff; }
  .mc-tag.pin svg { color: var(--mint); }
  .mc-req { background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 14px 16px; display: flex; gap: 12px; align-items: flex-start; width: 100%; text-align: start; }
  .mc-req:active { background: #F6F9F8; }
  .mc-req .r-i { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; flex: none; background: var(--line-2); color: var(--navy); }
  .mc-req .r-i svg { width: 21px; height: 21px; }
  .mc-req .r-b { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
  .mc-req .r-b b { font-size: 16px; line-height: 1.3; }
  .mc-req .r-b small { font-size: 13.5px; color: var(--text-2); }
  .mc-req .r-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .mc-req .chev { width: 18px; height: 18px; color: #B6C2BD; align-self: center; flex: none; }
  .mc-req.need { border-color: #F4D9A8; }
  .mc-req.need .r-i { background: var(--warn-bg); color: var(--warn); }
  .mc-prov { display: flex; gap: 12px; align-items: center; padding: 12px 14px; border: 1.5px solid var(--line); border-radius: 16px; cursor: pointer; background: #fff; }
  .mc-prov.on { border-color: var(--mint-ink); background: #F5FCF9; }
  .mc-prov b { font-size: 15px; display: block; }
  .mc-prov small { font-size: 13px; color: var(--text-2); }
  .mc-prov .p-r { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #C3CEC9; flex: none; margin-inline-start: auto; }
  .mc-prov.on .p-r { border-color: var(--mint-ink); background: var(--mint-ink); box-shadow: inset 0 0 0 4px #F5FCF9; }
  .mc-doc { aspect-ratio: 3 / 3.4; max-height: 300px; margin: 0 auto; width: 78%; background: #fff; border: 1px solid var(--line); border-radius: 10px; box-shadow: var(--shadow-2); padding: 22px 20px; display: flex; flex-direction: column; gap: 9px; }
  .mc-doc .dh { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .mc-doc i { display: block; height: 7px; border-radius: 4px; background: #E6ECEA; }
  .mc-doc .seal { width: 46px; height: 46px; border-radius: 50%; border: 2px solid var(--mint); display: grid; place-items: center; color: var(--mint-ink); margin-top: auto; align-self: flex-end; }
  .mc-doc .seal svg { width: 22px; height: 22px; }
  .mc-me { display: flex; gap: 16px; align-items: center; background: #fff; border: 1px solid var(--line-2); border-radius: 22px; padding: 18px; }
  .mc-me .avatar { width: 64px; height: 64px; font-size: 22px; }
  .mc-me b { font-size: 19px; display: block; }
  .mc-me small { font-size: 14px; color: var(--text-2); display: block; margin-top: 2px; }
  .mc-note { font-size: 13px; color: var(--text-3); text-align: center; display: flex; gap: 6px; align-items: center; justify-content: center; padding: 0 12px; line-height: 1.4; }
  .mc-note svg { width: 14px; height: 14px; flex: none; }
  .mc-text { font-size: 15.5px; line-height: 1.6; color: var(--ink); }
  .mc-check { display: flex; align-items: center; gap: 12px; min-height: 50px; padding: 0 14px; border: 1px solid var(--line); border-radius: 14px; background: #fff; font-size: 15px; font-weight: 600; cursor: pointer; }
  .mc-check input { width: 22px; height: 22px; accent-color: #0B8A60; margin: 0; }
  .mc-sum { display: flex; justify-content: space-between; align-items: center; padding: 4px 6px 0; font-size: 14px; color: var(--text-2); }
  .mc-sum b { color: var(--ink); font-variant-numeric: tabular-nums; }
  `);

  /* ======================================================================
     Sample data (mirrors the web committee portal, kept self-contained)
     ====================================================================== */
  const C = (D.committees && D.committees.c_masyoun) || { id: 'c_masyoun', kind: 'legal', building: 'BN-RAM-00142', name: T("Al-Masyoun Tower Owners' Association", 'جمعية مالكي برج الماصيون'), regNo: 'OA-RAM-2018-0217', formed: '2018-04-12', term: T('2025 – 2027', '2025 – 2027'), monthly: 180, members: [] };
  const BID = C.building || 'BN-RAM-00142';
  const BLD = (D.building && D.building(BID)) || { id: BID, name: T('Al-Masyoun Residence Tower', 'برج الماصيون السكني'), units: 54, floors: 14 };
  const UNITS = BLD.units || 54;
  const pname = (p) => (D.pname ? D.pname(p) : p);
  const pobj = (p) => (D.person ? D.person(p) : { name: T(p, p) });
  const me = 'p_samer';
  const MEMBERS = (C.members && C.members.length ? C.members : [{ p: 'p_samer', role: T('Chair', 'الرئيس'), unit: 'BN-RAM-00142-1201', since: '2025-01-15' }]);
  const RESP = {
    p_samer: T('Chairs meetings, signs contracts up to ₪15,000, represents the association', 'يرأس الاجتماعات، يوقّع العقود حتى 15,000 ₪، يمثّل الجمعية'),
    p_hiba: T('Collections, bank account, co-signs payments', 'التحصيل، الحساب البنكي، التوقيع المشترك على الدفعات'),
    p_fadi: T('Notices, minutes and the owners’ register', 'الإشعارات والمحاضر وسجل المالكين'),
    p_mona: T('Contractors, inspections, maintenance approvals', 'المقاولون، الكشوفات، الموافقة على الصيانة'),
    p_adel: T('Community, recycling and the lobby', 'المجتمع وإعادة التدوير والردهة'),
  };
  const unitNo = (u) => (u ? String(u).split('-').pop() : '—');

  const CATS = [
    { id: 'cleaning', n: T('Cleaning', 'التنظيف'), icon: 'sparkles', budget: 1650, color: '#7FA7C2' },
    { id: 'elevator', n: T('Elevator contract', 'عقد المصاعد'), icon: 'elevator', budget: 1350, color: '#142B3B' },
    { id: 'electricity', n: T('Common electricity', 'كهرباء المناطق المشتركة'), icon: 'zap', budget: 2600, color: '#F2B35A' },
    { id: 'pumps', n: T('Water pumps', 'مضخات المياه'), icon: 'pump', budget: 650, color: '#5FB7D4' },
    { id: 'diesel', n: T('Generator diesel', 'سولار المولد'), icon: 'generator', budget: 700, color: '#E58A7B' },
    { id: 'security', n: T('Security', 'الأمن والحراسة'), icon: 'shield', budget: 1400, color: '#9B8AE0' },
    { id: 'insurance', n: T('Insurance', 'التأمين'), icon: 'shieldCheck', budget: 410, color: '#9AAAB6' },
    { id: 'reserve', n: T('Reserve fund', 'صندوق الاحتياط'), icon: 'coins', budget: 980, color: '#36D6A0' },
  ];
  const cat = (id) => CATS.find((c) => c.id === id) || CATS[0];
  const BUDGET = B.sum(CATS, (c) => c.budget);
  const LEDGER = [
    { id: 'EX-26-1101', date: '2026-11-03', cat: 'cleaning', payee: T('Sparkle Building Care', 'سباركل للعناية بالمباني'), desc: T('Common-area cleaning — November', 'تنظيف المناطق المشتركة — تشرين الثاني'), amount: 1650 },
    { id: 'EX-26-1102', date: '2026-11-05', cat: 'elevator', payee: T('LiftLine Elevators', 'لفت لاين للمصاعد'), desc: T('Monthly maintenance — 2 cars', 'الصيانة الشهرية — مصعدان'), amount: 1350 },
    { id: 'EX-26-1103', date: '2026-11-06', cat: 'electricity', payee: T('Electricity utility', 'شركة الكهرباء'), desc: T('Common-area meter — October bill', 'عداد المناطق المشتركة — فاتورة تشرين الأول'), amount: 2860 },
    { id: 'EX-26-1104', date: '2026-11-08', cat: 'security', payee: T('Guardian Security', 'الحارس للأمن'), desc: T('Night concierge & CCTV monitoring', 'حارس ليلي ومراقبة الكاميرات'), amount: 1400 },
    { id: 'EX-26-1105', date: '2026-11-09', cat: 'diesel', payee: T('Masyoun Fuel Supplies', 'الماصيون لتوريد المحروقات'), desc: T('Diesel 300 L — winter top-up', 'سولار 300 لتر — تعبئة شتوية'), amount: 920 },
    { id: 'EX-26-1106', date: '2026-11-12', cat: 'insurance', payee: T('Demo Insurance Co.', 'شركة التأمين التجريبية'), desc: T('Building & liability — instalment', 'تأمين المبنى والمسؤولية — قسط'), amount: 410 },
    { id: 'EX-26-1107', date: '2026-11-14', cat: 'pumps', payee: T('PureTank Water Services', 'بيور تانك لخدمات المياه'), desc: T('Booster pump service', 'صيانة مضخة التعزيز'), amount: 380 },
    { id: 'EX-26-1108', date: '2026-11-20', cat: 'elevator', payee: T('LiftLine Elevators', 'لفت لاين للمصاعد'), desc: T('Emergency callout — Elevator B', 'زيارة طارئة — المصعد ب'), amount: 450 },
    { id: 'EX-26-1109', date: '2026-11-25', cat: 'reserve', payee: T('Association reserve account', 'حساب احتياط الجمعية'), desc: T('Monthly transfer to reserve (10%)', 'التحويل الشهري للاحتياط (10%)'), amount: 980 },
  ];
  const PENDING = [
    { id: 'EX-26-1110', date: '2026-11-24', cat: 'cleaning', payee: T('Sparkle Building Care', 'سباركل للعناية بالمباني'), desc: T('Stairwell deep clean after unit 301 works', 'تنظيف عميق للدرج بعد أعمال الوحدة 301'), amount: 680, by: 'p_mona', ref: 'MR-24502', status: 'pending' },
    { id: 'EX-26-1111', date: '2026-11-24', cat: 'elevator', payee: T('LiftLine Elevators', 'لفت لاين للمصاعد'), desc: T('Elevator B door-operator replacement', 'استبدال محرك أبواب المصعد ب'), amount: 4800, by: 'p_mona', ref: 'MR-24477', needs: 'D-26-17', status: 'pending' },
    { id: 'EX-26-1112', date: '2026-11-25', cat: 'diesel', payee: T('Masyoun Fuel Supplies', 'الماصيون لتوريد المحروقات'), desc: T('Diesel 200 L — generator top-up', 'سولار 200 لتر — تعبئة المولد'), amount: 640, by: 'p_hiba', status: 'pending' },
  ];
  const CASH = 18640, RESERVE = 46300, CHARGES = UNITS * (C.monthly || 180), COLLECTED = 9140;

  const MEETINGS = [
    { id: 'MT-2613', kind: 'committee', status: 'live', date: '2026-11-25', time: '09:30', place: T('Online — BENA meeting room', 'عبر الإنترنت — غرفة اجتماعات BENA'), title: T('Urgent committee call — Elevator B', 'اجتماع طارئ للجنة — المصعد ب'),
      agenda: [[T('LiftLine fault report on Elevator B', 'تقرير لفت لاين عن عطل المصعد ب'), T('Mona Daoud', 'منى داود'), 'done'], [T('Approve door-operator replacement (₪4,800)', 'الموافقة على استبدال محرك الأبواب (4,800 ₪)'), T('Resolution D-26-17 · vote', 'القرار D-26-17 · تصويت'), 'current'], [T('Notice to residents about the outage', 'إشعار السكان بتوقف المصعد'), T('Fadi Qassis', 'فادي قسيس'), 'next']],
      attend: { p_samer: 'present', p_hiba: 'present', p_fadi: 'present', p_mona: 'present', p_adel: 'apology' } },
    { id: 'MT-2611', kind: 'committee', status: 'scheduled', date: '2026-11-27', time: '18:30', place: T('Online — BENA meeting room', 'عبر الإنترنت — غرفة اجتماعات BENA'), title: T('Monthly committee meeting — November', 'اجتماع اللجنة الشهري — تشرين الثاني'),
      agenda: [[T('Elevator B — follow-up after repair', 'المصعد ب — متابعة بعد الإصلاح'), T('Mona Daoud', 'منى داود')], [T('Stairwell deep clean after unit 301 works', 'تنظيف الدرج بعد أعمال الوحدة 301'), T('Approve quote', 'الموافقة على العرض')], [T('Arrears follow-up — 3 units with 2+ months', 'متابعة المتأخرات — 3 وحدات بأكثر من شهرين'), T('Hiba Nasser', 'هبة ناصر')], [T('Prepare the general assembly pack', 'تحضير ملف الهيئة العامة'), T('Fadi Qassis', 'فادي قسيس')]],
      rsvp: { p_samer: 'yes', p_hiba: 'yes', p_fadi: 'yes', p_mona: 'maybe', p_adel: 'yes' } },
    { id: 'MT-2612', kind: 'ga', status: 'scheduled', date: '2026-12-04', time: '19:00', place: T('Lobby meeting room, ground floor', 'قاعة الاجتماعات في الردهة، الطابق الأرضي'), title: T('General assembly — 2027 budget', 'الهيئة العامة — موازنة 2027'), quorumReq: 50, rsvpShare: 52.3, rsvpUnits: 29, proxies: 6,
      agenda: [[T('Approve minutes of the July assembly', 'المصادقة على محضر هيئة تموز'), T('Secretary', 'أمين السر')], [T('2027 budget and monthly service charge', 'موازنة 2027 ورسوم الخدمات الشهرية'), T('Vote by unit share', 'تصويت حسب الحصص')], [T('Elevator modernisation — three quotes', 'تحديث المصاعد — ثلاثة عروض'), T('Vote', 'تصويت')], [T('Rooftop solar panels for common areas', 'ألواح شمسية على السطح للمناطق المشتركة'), T('Discussion', 'نقاش')]] },
    { id: 'MT-2610', kind: 'committee', status: 'completed', date: '2026-10-28', time: '18:30', place: T('Lobby meeting room', 'قاعة الاجتماعات في الردهة'), title: T('Monthly committee meeting — October', 'اجتماع اللجنة الشهري — تشرين الأول'),
      attend: { p_samer: 'present', p_hiba: 'present', p_fadi: 'present', p_mona: 'present', p_adel: 'apology' },
      agenda: [[T('September accounts and collection rate', 'حسابات أيلول ونسبة التحصيل'), T('Treasurer', 'أمين الصندوق')], [T('Quarterly rooftop tank cleaning', 'التنظيف الربعي لخزانات السطح'), T('Quote from PureTank', 'عرض من بيور تانك')], [T('Units with arrears of 2+ months', 'الوحدات المتأخرة شهرين فأكثر'), T('Formal reminders', 'إنذارات رسمية')]],
      minutes: T('Four of five members present (quorum met). September collection was 96.3%. Tank cleaning approved; formal reminders to be sent; three quotes to be collected for elevator modernisation.', 'حضر أربعة من خمسة أعضاء (النصاب مكتمل). بلغت نسبة التحصيل في أيلول 96.3%. تمت الموافقة على تنظيف الخزانات، وتقرر إرسال إنذارات رسمية وجمع ثلاثة عروض لتحديث المصاعد.') },
    { id: 'MT-2609', kind: 'committee', status: 'completed', date: '2026-09-16', time: '18:30', place: T('Lobby meeting room', 'قاعة الاجتماعات في الردهة'), title: T('Monthly committee meeting — September', 'اجتماع اللجنة الشهري — أيلول'),
      attend: { p_samer: 'present', p_hiba: 'present', p_fadi: 'present', p_mona: 'present', p_adel: 'present' },
      agenda: [[T('Lobby renovation — final handover', 'ترميم الردهة — التسليم النهائي'), T('Inspection', 'معاينة')], [T('New cleaning contract', 'عقد التنظيف الجديد'), T('Two offers', 'عرضان')]],
      minutes: T('All five members present. Lobby works accepted with two minor snags. Sparkle Building Care selected for cleaning at ₪1,650 per month.', 'حضر جميع الأعضاء الخمسة. تم استلام أعمال الردهة مع ملاحظتين بسيطتين. واختيرت سباركل للتنظيف بقيمة 1,650 ₪ شهرياً.') },
    { id: 'MT-2607', kind: 'ega', status: 'completed', date: '2026-07-09', time: '19:00', place: T('Lobby meeting room', 'قاعة الاجتماعات في الردهة'), title: T('Extraordinary assembly — lobby renovation', 'هيئة عامة غير عادية — ترميم الردهة'), present: 87.8,
      agenda: [[T('Lobby renovation scope and contractor', 'نطاق ترميم الردهة والمقاول'), T('⅔ of shares present', 'ثلثا الحصص الحاضرة')], [T('Special levy of ₪240 per apartment', 'مساهمة خاصة 240 ₪ لكل شقة'), T('Vote', 'تصويت')], [T('Replace the CCTV system now', 'استبدال نظام الكاميرات الآن'), T('Vote', 'تصويت')]],
      minutes: T('Owners of 46 units (87.8% of shares) present in person or by proxy. Renovation and levy approved; CCTV replacement deferred to the 2027 budget.', 'حضر مالكو 46 وحدة (87.8% من الحصص) شخصياً أو بالوكالة. تمت الموافقة على الترميم والمساهمة، وأُجّل استبدال الكاميرات إلى موازنة 2027.') },
  ];
  const meeting = (id) => MEETINGS.find((m) => m.id === id);
  const KIND = { committee: T('Committee', 'لجنة'), ga: T('General assembly', 'هيئة عامة'), ega: T('Extraordinary assembly', 'هيئة غير عادية') };

  // decisions: [id, meeting, title, mode, votes[for,against,abstain,absent], status]
  const DECISIONS = [
    { id: 'D-26-14', mt: 'MT-2610', date: '2026-10-28', t: T('Approve quarterly tank cleaning with PureTank (₪1,140)', 'الموافقة على التنظيف الربعي للخزانات مع بيور تانك (1,140 ₪)'), mode: 'count', v: [4, 0, 0, 1], st: 'passed' },
    { id: 'D-26-15', mt: 'MT-2610', date: '2026-10-28', t: T('Send formal reminders to units with 2+ months of arrears', 'إرسال إنذارات رسمية للوحدات المتأخرة شهرين فأكثر'), mode: 'count', v: [4, 0, 0, 1], st: 'passed' },
    { id: 'D-26-16', mt: 'MT-2610', date: '2026-10-28', t: T('Collect three quotes for elevator modernisation', 'جمع ثلاثة عروض لتحديث المصاعد'), mode: 'count', v: [3, 0, 1, 1], st: 'passed' },
    { id: 'D-26-11', mt: 'MT-2609', date: '2026-09-16', t: T('Release final payment for lobby works (₪5,900)', 'صرف الدفعة النهائية لأعمال الردهة (5,900 ₪)'), mode: 'count', v: [5, 0, 0, 0], st: 'passed' },
    { id: 'D-26-12', mt: 'MT-2609', date: '2026-09-16', t: T('Award 12-month cleaning contract to Sparkle (₪1,650/month)', 'ترسية عقد التنظيف لمدة 12 شهراً على سباركل (1,650 ₪ شهرياً)'), mode: 'count', v: [4, 0, 1, 0], st: 'passed' },
    { id: 'R-26-04', mt: 'MT-2607', date: '2026-07-09', t: T('Renovate the lobby (₪12,100) — contractor: Bait Fix', 'ترميم الردهة (12,100 ₪) — المقاول: بيت فيكس'), mode: 'share', v: [68.3, 14.9, 4.6, 12.2], thr: 66.7, st: 'passed' },
    { id: 'R-26-05', mt: 'MT-2607', date: '2026-07-09', t: T('Special levy of ₪240 per apartment', 'مساهمة خاصة 240 ₪ لكل شقة'), mode: 'share', v: [64.1, 17.8, 5.9, 12.2], thr: 50, st: 'passed' },
    { id: 'R-26-06', mt: 'MT-2607', date: '2026-07-09', t: T('Replace the CCTV system now (₪18,500)', 'استبدال نظام الكاميرات الآن (18,500 ₪)'), mode: 'share', v: [31.0, 49.2, 7.6, 12.2], thr: 50, st: 'failed' },
  ];

  const DOCS = [
    { id: 'd1', cat: 'legal', name: T('Association bylaws (2018, amended 2025)', 'النظام الداخلي للجمعية (2018، معدّل 2025)'), date: '2025-01-15', size: '640 KB', icon: 'doc' },
    { id: 'd2', cat: 'legal', name: T('Registration certificate OA-RAM-2018-0217', 'شهادة التسجيل OA-RAM-2018-0217'), date: '2018-04-12', size: '310 KB', icon: 'badgeCheck', tone: 'mint' },
    { id: 'd3', cat: 'legal', name: T('Minutes appointing the 2025–2027 committee', 'محضر تعيين لجنة 2025–2027'), date: '2025-01-15', size: '420 KB', icon: 'gavel' },
    { id: 'd4', cat: 'finance', name: T('Bank mandate — dual signatories', 'تفويض البنك — توقيع مزدوج'), date: '2025-02-03', size: '190 KB', icon: 'banknote' },
    { id: 'd5', cat: 'finance', name: T('Draft 2027 budget', 'مسودة موازنة 2027'), date: '2026-11-20', size: '280 KB', icon: 'chart' },
    { id: 'd6', cat: 'finance', name: T('October 2026 statement', 'كشف حساب تشرين الأول 2026'), date: '2026-11-02', size: '160 KB', icon: 'receipt' },
    { id: 'd7', cat: 'minutes', name: T('Minutes — committee meeting 28 Oct 2026', 'محضر اجتماع اللجنة 28 تشرين الأول 2026'), date: '2026-10-29', size: '210 KB', icon: 'doc' },
    { id: 'd8', cat: 'minutes', name: T('Minutes — extraordinary assembly 9 Jul 2026', 'محضر الهيئة غير العادية 9 تموز 2026'), date: '2026-07-10', size: '330 KB', icon: 'doc' },
    { id: 'd9', cat: 'contracts', name: T('LiftLine maintenance contract 2026', 'عقد صيانة لفت لاين 2026'), date: '2026-01-05', size: '520 KB', icon: 'contract' },
    { id: 'd10', cat: 'contracts', name: T('Building insurance policy 2026', 'بوليصة تأمين المبنى 2026'), date: '2026-01-01', size: '880 KB', icon: 'shieldCheck' },
    { id: 'd11', cat: 'legal', name: T('Proxy — Khaled Mansour to Adel Shami', 'وكالة — خالد منصور إلى عادل شامي'), date: '2026-03-02', size: '150 KB', icon: 'userCheck', tone: 'violet' },
  ];
  const DOC_CATS = { legal: T('Legal', 'قانونية'), finance: T('Finance', 'مالية'), minutes: T('Minutes', 'محاضر'), contracts: T('Contracts', 'عقود') };

  const reqBase = (id, extra) => { const r = D.request ? D.request(id) : null; return { ...(r || {}), id, ...extra }; };
  const REQS = [
    reqBase('MR-24502', { cat: 'cleaning', title: T('Stairwell deep clean after renovation', 'تنظيف عميق للدرج بعد الترميم'), status: 'open', created: '2026-11-23', by: 'p_hiba', provider: null, scope: 'common', loc: T('Stairwell, floors 2–4', 'الدرج، الطوابق 2–4') }),
    reqBase('MR-24496', { cat: 'plumbing', title: T('Booster pump pressure switch replacement', 'استبدال مفتاح ضغط مضخة التعزيز'), desc: T('Duty pump short-cycles at night. Fixed quote requested before the general assembly.', 'المضخة العاملة تعمل وتتوقف بشكل متكرر ليلاً. طُلب عرض ثابت قبل الهيئة العامة.'), status: 'quoted', created: '2026-11-18', by: 'p_mona', provider: 'sp_jaber', quote: 922, quoteId: 'QT-3376', scope: 'common', loc: T('Roof plant room', 'غرفة المعدات على السطح') }),
    reqBase('MR-24477', { cat: 'elevators', status: 'inProgress', provider: 'sp_lift', scope: 'common', loc: T('Elevator B, core', 'المصعد ب، النواة'), title: T('Elevator B stops between floors 9 and 10', 'المصعد ب يتوقف بين الطابقين 9 و10'), created: '2026-11-20', by: 'p_fadi' }),
    reqBase('JB-3103', { cat: 'electrical', title: T('Lobby lighting retrofit to LED', 'تحويل إنارة الردهة إلى LED'), desc: T('Replace 22 downlights and add a motion sensor.', 'استبدال 22 سبوت وإضافة حساس حركة.'), status: 'scheduled', visit: '2026-11-25', created: '2026-11-12', by: 'p_samer', provider: 'sp_jaber', scope: 'common', loc: T('Lobby', 'الردهة') }),
    reqBase('MR-24390', { cat: 'tanks', status: 'scheduled', provider: 'sp_pure', scope: 'common', visit: '2026-12-03', loc: T('Roof', 'السطح'), title: T('Quarterly rooftop tank cleaning', 'التنظيف الربعي لخزانات السطح'), created: '2026-11-10', by: 'p_mona' }),
    reqBase('MR-24170', { cat: 'general', title: T('Parking ramp drain cleared', 'تسليك تصريف منحدر الموقف'), status: 'completed', closed: '2026-11-04', created: '2026-11-02', by: 'p_adel', provider: 'sp_handy', scope: 'common', loc: T('Parking level −1', 'الطابق السفلي الأول'), rating: 4 }),
    reqBase('MR-24102', { cat: 'electrical', title: T('Winter generator test', 'اختبار المولد الشتوي'), status: 'completed', closed: '2026-11-14', created: '2026-11-09', by: 'p_mona', provider: 'sp_volt', scope: 'common', loc: T('Parking level −1', 'الطابق السفلي الأول'), rating: 5 }),
  ];
  const req = (id) => REQS.find((r) => r.id === id);
  const prov = (id) => (id && D.provider ? D.provider(id) : null);
  const catOf = (id) => (D.cat ? D.cat(id) : { name: T(id, id), icon: 'wrench' });

  /* ======================================================================
     Session state
     ====================================================================== */
  const S = {
    vote: { p_hiba: 'for', p_mona: 'for' }, voteClosed: false, voteResult: null,
    anns: [], rsvp: {}, read: {},
  };
  const VOTERS = ['p_samer', 'p_hiba', 'p_fadi', 'p_mona', 'p_adel'];
  const ABSENT = ['p_adel'];

  /* ======================================================================
     Helpers
     ====================================================================== */
  const idm = (s) => B.ui.idMono(s);
  const note = (t) => `<div class="mc-note">${icon('info')}${t}</div>`;
  const dt = (d, cls = '') => { const x = new Date(d + 'T12:00:00'); return `<span class="mc-dt ${cls}"><small>${B.mon(x.getMonth())}</small><b>${x.getDate()}</b></span>`; };
  const legalBadge = () => B.ui.status(C.kind === 'legal' ? 'legal' : C.kind === 'authorized' ? 'authorized' : 'informal');
  const pendingExp = () => PENDING.filter((e) => e.status === 'pending');
  const needsReq = () => REQS.filter((r) => r.status === 'open' || r.status === 'quoted');
  const live = () => MEETINGS.find((m) => m.status === 'live');
  const tallyNums = () => { const v = Object.values(S.vote); return { for: v.filter((x) => x === 'for').length, against: v.filter((x) => x === 'against').length, abstain: v.filter((x) => x === 'abstain').length }; };
  const decisions = () => [...(S.voteResult ? [S.voteResult] : []), ...DECISIONS];
  const spentOf = (id) => B.sum([...LEDGER, ...PENDING.filter((e) => e.status === 'approved')].filter((x) => x.cat === id), (x) => x.amount);
  const spent = () => B.sum(CATS, (c) => spentOf(c.id));
  const ring = (pct, color = '#36D6A0') => { const r = 26, c = 2 * Math.PI * r; return `<div class="mc-ring"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="${r}" fill="none" stroke="#E6ECEA" stroke-width="7"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(c * pct / 100).toFixed(1)} ${c.toFixed(1)}"/></svg><b>${Math.round(pct)}%</b></div>`; };
  const TAGS = { notice: [T('Notice', 'إشعار'), 'info'], meeting: [T('Meeting', 'اجتماع'), 'calendar'], maintenance: [T('Maintenance', 'صيانة'), 'wrench'], community: [T('Community', 'مجتمع'), 'users'] };
  const tag = (k) => (TAGS[k] ? `<span class="mc-tag ${k}">${icon(TAGS[k][1])}${tx(TAGS[k][0])}</span>` : '');
  const anns = () => [...S.anns, ...((D.announcementsOf && D.announcementsOf(BID)) || [])];
  const readOf = (a) => S.read[a.id] ?? (a.mine ? 0 : 54 - (a.id.charCodeAt(2) * 7) % 19);
  const bell = () => ({ icon: 'bell', go: 'notifications', label: L('Notifications', 'الإشعارات'), dot: true });
  const seg2 = (cur) => `<div class="mx-seg"><button class="${cur === 'expenses' ? 'on' : ''}" data-go="expenses">${L('Expenses', 'المصروفات')}</button><button class="${cur === 'budget' ? 'on' : ''}" data-go="budget">${L('Budget', 'الموازنة')}</button></div>`;
  const VCOL = { for: '#36D6A0', against: '#E5484D', abstain: '#E9A23B', absent: '#D5DEDA' };

  /* ======================================================================
     Actions
     ====================================================================== */
  const later = (fn) => setTimeout(fn, 30);
  /* live vote */
  B.act.mcVote = (v) => {
    if (S.voteClosed) return;
    const first = !S.vote[me];
    S.vote[me] = v;
    B.refresh();
    later(() => M.toast(L(`Your vote “${v === 'for' ? 'For' : v === 'against' ? 'Against' : 'Abstain'}” is recorded (simulated)`, `تم تسجيل صوتك «${v === 'for' ? 'مع' : v === 'against' ? 'ضد' : 'امتناع'}» (محاكاة)`), 'vote'));
    if (first && !S.vote.p_fadi) setTimeout(() => {
      if (S.voteClosed || S.vote.p_fadi) return;
      S.vote.p_fadi = 'for';
      if (B.route.exp === 'mobile' && B.route.role === R && B.route.page === 'meeting' && !document.querySelector('.mx-scrim')) { B.refresh(); later(() => M.toast(L('Fadi Qassis voted', 'صوّت فادي قسيس'), 'userCheck')); }
    }, 1800);
  };
  B.act.mcCloseVote = () => {
    const t = tallyNums();
    const present = VOTERS.length - ABSENT.length;
    const passed = t.for > present / 2;
    S.voteClosed = true;
    S.voteResult = { id: 'D-26-17', mt: 'MT-2613', date: '2026-11-25', t: T('Replace Elevator B door operator — LiftLine (₪4,800)', 'استبدال محرك أبواب المصعد ب — لفت لاين (4,800 ₪)'), mode: 'count', v: [t.for, t.against, t.abstain, ABSENT.length + (present - t.for - t.against - t.abstain)], st: passed ? 'passed' : 'failed', fresh: true };
    const m = live(); if (m) m.agenda.forEach((a) => { if (a[2] === 'current') a[2] = 'done'; else if (a[2] === 'next') { a[2] = 'current'; } });
    B.refresh();
    M.success({ title: passed ? L('Resolution D-26-17 passed', 'أُقرّ القرار D-26-17') : L('Resolution D-26-17 not passed', 'لم يُقرّ القرار D-26-17'), text: L(`${t.for} for · ${t.against} against · ${t.abstain} abstain. Recorded in Decisions and the meeting minutes draft.`, `${t.for} مع · ${t.against} ضد · ${t.abstain} امتناع. سُجّل في القرارات وفي مسودة المحضر.`), ref: 'D-26-17', done: `m-${R}-decisions`, doneLabel: L('View decisions', 'عرض القرارات') });
  };
  B.act.mcRsvp = (arg) => { const [id, v] = String(arg).split(':'); S.rsvp[id] = v; B.refresh(); later(() => M.toast(v === 'yes' ? L('You’re attending — RSVP sent (simulated)', 'ستحضر — تم إرسال الرد (محاكاة)') : L('Apology sent to the secretary (simulated)', 'تم إرسال الاعتذار لأمين السر (محاكاة)'), 'calendarCheck')); };

  /* expenses */
  B.act.mcExp = (id) => {
    const e = PENDING.find((x) => x.id === id);
    if (!e) return;
    const c = cat(e.cat);
    const used = spentOf(e.cat);
    const after = used + e.amount;
    const over = after > c.budget;
    const blocked = e.needs && !(S.voteResult && S.voteResult.st === 'passed');
    const body = `<div class="mc-amount"><b>${B.money(e.amount)}</b><small>${tx(e.payee)}</small></div>
      ${M.group([M.cell({ icon: c.icon, tone: 'mint', title: tx(e.desc), sub: `${tx(c.n)} · ${idm(e.id)}` }), M.cell({ icon: 'user', title: L('Requested by', 'مقدَّم من'), sub: `${pname(e.by)} · ${B.dateShort(e.date)}` }), M.cell({ icon: 'paperclip', title: L('Invoice attached', 'الفاتورة مرفقة'), sub: `${e.id}.pdf · 120 KB`, act: 'mxSoon', arg: L('Opening the invoice', 'فتح الفاتورة') })])}
      <div class="mc-big" style="padding:14px 16px;gap:10px"><div class="bg-top"><div><small>${L('Budget line this month', 'بند الموازنة هذا الشهر')}</small><b style="font-size:15px">${tx(c.n)}</b></div><div class="bg-r"><b style="color:${over ? 'var(--bad)' : 'var(--ink)'}">${B.money(after)}</b><small>${L('of', 'من')} ${B.money(c.budget)}</small></div></div><div class="mc-bar"><i style="width:${Math.min(100, (after / c.budget) * 100)}%;background:${over ? '#E5484D' : c.color}"></i></div>${over ? `<small style="color:var(--bad)">${L(`Over budget by ${B.money(after - c.budget)} — covered from the operating balance`, `تجاوز الموازنة بمقدار ${B.money(after - c.budget)} — يُغطّى من الرصيد التشغيلي`)}</small>` : ''}</div>
      ${blocked ? `<div class="callout" style="background:var(--violet-bg);color:var(--violet)">${icon('vote')}<div>${L('Bylaws: repairs above ₪3,000 need a committee resolution. Resolution D-26-17 is being voted on now.', 'النظام الداخلي: الإصلاحات التي تزيد عن 3,000 ₪ تحتاج قراراً من اللجنة. يجري الآن التصويت على القرار D-26-17.')}</div></div>` : `<div class="callout mint">${icon('shieldCheck')}<div>${L(`Within your signing authority (up to ₪15,000). ${pname('p_hiba')} co-signs the payment.`, `ضمن صلاحية توقيعك (حتى 15,000 ₪). وتوقّع ${pname('p_hiba')} على الدفعة بشكل مشترك.`)}</div></div>`}
      ${note(L('Approval and payment are simulated — no money moves.', 'الموافقة والدفع محاكاة — لا تنتقل أي أموال.'))}`;
    M.sheet({ title: L('Approve expense', 'الموافقة على مصروف'), sub: esc(tx(e.desc)), body,
      foot: blocked ? M.btn(L('Go to the live vote', 'انتقل إلى التصويت المباشر'), { kind: 'dark', go: 'meeting-MT-2613', icon: 'vote' }) : M.btn(L('Reject', 'رفض'), { kind: 'danger', act: 'mcExpReject', arg: e.id }) + M.btn(L('Approve', 'موافقة'), { kind: 'primary', act: 'mcExpOk', arg: e.id, icon: 'check' }) });
  };
  B.act.mcExpOk = (id) => {
    const e = PENDING.find((x) => x.id === id); if (!e) return;
    e.status = 'approved'; e.approved = '2026-11-25';
    B.refresh();
    M.success({ title: L('Expense approved', 'تمت الموافقة على المصروف'), text: L(`${B.money(e.amount)} to ${tx(e.payee)}. ${pname('p_hiba')} has been asked to co-sign the payment.`, `${B.money(e.amount)} إلى ${tx(e.payee)}. طُلب من ${pname('p_hiba')} التوقيع المشترك على الدفعة.`), ref: e.id });
  };
  B.act.mcExpReject = (id) => {
    const e = PENDING.find((x) => x.id === id); if (!e) return;
    M.sheet({ title: L('Reject expense', 'رفض المصروف'), sub: esc(tx(e.desc)), form: 'mcReject',
      body: `<input type="hidden" name="id" value="${esc(e.id)}">${M.field({ name: 'reason', label: L('Reason (shared with the requester)', 'السبب (يُرسل لمقدّم الطلب)'), type: 'select', options: [{ v: 'quote', l: L('Need a second quote', 'نحتاج عرضاً ثانياً') }, { v: 'budget', l: L('Not in this month’s budget', 'خارج موازنة هذا الشهر') }, { v: 'info', l: L('Missing invoice details', 'تفاصيل الفاتورة ناقصة') }, { v: 'other', l: L('Other', 'سبب آخر') }] })}${M.field({ name: 'note', label: L('Note', 'ملاحظة'), type: 'textarea', placeholder: L('Optional', 'اختياري') })}`,
      foot: M.btn(L('Cancel', 'إلغاء'), { act: 'mxClose' }) + M.btn(L('Reject expense', 'رفض المصروف'), { kind: 'danger', type: 'submit' }) });
  };
  B.submit.mcReject = (d) => { const e = PENDING.find((x) => x.id === d.id); if (e) e.status = 'rejected'; B.refresh(); later(() => M.toast(L('Expense rejected — requester notified (simulated)', 'تم رفض المصروف — أُبلغ مقدّم الطلب (محاكاة)'), 'xCircle')); };
  B.act.mcLedger = (id) => {
    const e = [...LEDGER, ...PENDING].find((x) => x.id === id); if (!e) return;
    const c = cat(e.cat);
    M.sheet({ title: tx(e.payee), sub: idm(e.id), body: `<div class="mc-amount"><b>${B.money(e.amount)}</b><small>${tx(e.desc)}</small></div>${B.ui.kv([[L('Category', 'الفئة'), tx(c.n)], [L('Date', 'التاريخ'), B.date(e.date)], [L('Status', 'الحالة'), e.status === 'rejected' ? B.ui.status('rejected') : B.ui.status('paid')], [L('Signatories', 'الموقّعون'), `${pname('p_samer')} · ${pname('p_hiba')}`]])}${note(L('Sample ledger entry', 'قيد نموذجي'))}`,
      foot: M.btn(L('Receipt (PDF)', 'الإيصال (PDF)'), { act: 'mxSoon', arg: L('Downloading the receipt', 'تنزيل الإيصال'), icon: 'download' }) + M.btn(L('Done', 'تم'), { kind: 'primary', act: 'mxClose' }) });
  };

  /* announcements */
  B.act.mcCompose = () => {
    M.sheet({ title: L('New announcement', 'إعلان جديد'), sub: L(`To residents and owners of ${tx(BLD.name)}`, `إلى سكان ومالكي ${tx(BLD.name)}`), form: 'mcAnn',
      body: M.field({ name: 'title', label: L('Title', 'العنوان'), required: true, placeholder: L('e.g. Elevator B out of service today', 'مثلاً: المصعد ب متوقف اليوم') })
        + M.field({ name: 'body', label: L('Message', 'الرسالة'), type: 'textarea', required: true, placeholder: L('Keep it short and clear', 'اجعلها قصيرة وواضحة') })
        + `<div class="row" style="gap:10px">${M.field({ name: 'tag', label: L('Type', 'النوع'), type: 'select', options: Object.keys(TAGS).map((k) => ({ v: k, l: tx(TAGS[k][0]) })) })}${M.field({ name: 'aud', label: L('Audience', 'الجمهور'), type: 'select', options: [{ v: 'all', l: L('Everyone', 'الجميع') }, { v: 'owners', l: L('Owners only', 'المالكون فقط') }, { v: 'committee', l: L('Committee', 'اللجنة') }] })}</div>`
        + `<label class="mc-check"><input type="checkbox" name="pin" value="1"><span>${L('Pin to the top of the building feed', 'تثبيت أعلى صفحة المبنى')}</span></label>`
        + `<label class="mc-check"><input type="checkbox" name="push" value="1" checked><span>${L('Send a push notification', 'إرسال إشعار فوري')}</span></label>`,
      foot: M.btn(L('Cancel', 'إلغاء'), { act: 'mxClose' }) + M.btn(L('Publish', 'نشر'), { kind: 'primary', type: 'submit', icon: 'send' }) });
    const row = document.querySelector('.mx-sheet .row'); if (row) row.querySelectorAll('.mx-field').forEach((f) => { f.style.flex = '1'; f.style.minWidth = '0'; });
  };
  B.submit.mcAnn = (d) => {
    const id = 'an-m' + (S.anns.length + 1);
    S.anns.unshift({ id, building: BID, by: C.id, date: '2026-11-25', title: T(d.title, d.title), body: T(d.body, d.body), tag: d.tag || 'notice', pinned: !!d.pin, aud: d.aud, mine: true });
    S.read[id] = 0;
    B.refresh();
    M.success({ title: L('Announcement published', 'تم نشر الإعلان'), text: d.push ? L(`Sent to ${UNITS} units in the building app.`, `أُرسل إلى ${UNITS} وحدة عبر تطبيق المبنى.`) : L('Visible in the building feed.', 'ظاهر في صفحة المبنى.'), ref: id.toUpperCase() });
  };
  B.act.mcAnnOpen = (id) => {
    const a = anns().find((x) => x.id === id); if (!a) return;
    const by = a.by === 'org_arkan' ? tx((D.org && D.org('org_arkan') || {}).name || T('Property manager', 'مدير العقار')) : tx(C.name);
    M.sheet({ title: tx(a.title), sub: `${by} · ${B.date(a.date)}`, body: `<div class="row" style="gap:8px">${a.pinned ? `<span class="mc-tag pin">${icon('flag')}${L('Pinned', 'مثبّت')}</span>` : ''}${tag(a.tag)}</div><div class="mc-text">${esc(tx(a.body))}</div>${M.group([M.cell({ icon: 'eye', tone: 'info', title: L(`Read by ${readOf(a)} of ${UNITS} units`, `قرأه ${readOf(a)} من ${UNITS} وحدة`), sub: L('Sample read receipts', 'إشعارات قراءة نموذجية') })])}`,
      foot: M.btn(a.pinned ? L('Unpin', 'إلغاء التثبيت') : L('Pin', 'تثبيت'), { act: 'mcPin', arg: a.id, icon: 'flag' }) + M.btn(L('Done', 'تم'), { kind: 'primary', act: 'mxClose' }) });
  };
  B.act.mcPin = (id) => { const a = anns().find((x) => x.id === id); if (!a) return; a.pinned = !a.pinned; B.refresh(); later(() => M.toast(a.pinned ? L('Pinned to the top', 'تم التثبيت في الأعلى') : L('Unpinned', 'تم إلغاء التثبيت'), 'flag')); };

  /* members, decisions, docs */
  B.act.mcMember = (p) => {
    const m = MEMBERS.find((x) => x.p === p); if (!m) return;
    const per = pobj(p);
    M.sheet({ title: pname(p), sub: `${tx(m.role)} · ${L('unit', 'الوحدة')} ${unitNo(m.unit)}`,
      body: `<div class="mc-me" style="border:0;padding:0">${B.ui.avatar(per.name)}<div><b>${pname(p)}</b><small>${tx(m.role)} · ${L('since', 'منذ')} ${B.dateShort(m.since)} ${new Date(m.since).getFullYear()}</small></div></div>`
        + M.group([M.cell({ icon: 'briefcase', tone: 'mint', title: L('Responsibilities', 'المسؤوليات'), sub: tx(RESP[p] || m.auth || T('—', '—')) }), m.auth ? M.cell({ icon: 'key', tone: 'info', title: L('Authority (bylaws)', 'الصلاحيات (النظام الداخلي)'), sub: tx(m.auth) }) : '', m.delegated ? M.cell({ icon: 'userCheck', tone: 'violet', title: L('Holds a proxy', 'يحمل وكالة'), sub: L(`From ${pname(m.delegated)} — general assemblies`, `من ${pname(m.delegated)} — الهيئات العامة`) }) : ''].filter(Boolean))
        + note(L('Contact details are shared only with committee members (sample).', 'تُشارك بيانات الاتصال مع أعضاء اللجنة فقط (نموذج).')),
      foot: M.btn(L('Message', 'رسالة'), { act: 'mxSoon', arg: L('Messaging', 'المراسلة'), icon: 'chat' }) + M.btn(L('Call', 'اتصال'), { kind: 'primary', act: 'mxSoon', arg: L('Calling', 'الاتصال'), icon: 'phone' }) });
  };
  const voteBar = (d) => { const tot = d.v.reduce((a, b) => a + b, 0) || 1; return `<div class="mc-tally">${['for', 'against', 'abstain', 'absent'].map((k, i) => d.v[i] ? `<i style="width:${(d.v[i] / tot) * 100}%;background:${VCOL[k]}"></i>` : '').join('')}</div>`; };
  const voteLegend = (d) => { const u = d.mode === 'share' ? '%' : ''; return `<div class="mc-legend">${[[L('For', 'مع'), 'for'], [L('Against', 'ضد'), 'against'], [L('Abstain', 'امتناع'), 'abstain'], [L('Absent', 'غائب'), 'absent']].map((x, i) => `<span><i style="background:${VCOL[x[1]]}"></i>${x[0]} <b>${d.v[i]}${u}</b></span>`).join('')}</div>`; };
  B.act.mcDecision = (id) => {
    const d = decisions().find((x) => x.id === id); if (!d) return;
    const m = meeting(d.mt);
    M.sheet({ title: idm(d.id), sub: m ? `${tx(m.title)} · ${B.date(d.date)}` : B.date(d.date),
      body: `<div class="mc-text" style="font-weight:600">${tx(d.t)}</div><div>${B.ui.status(d.st)}</div>${voteBar(d)}${voteLegend(d)}`
        + `<div class="callout">${icon('info')}<div>${d.mode === 'share' ? L(`Assembly vote by unit share · threshold ${d.thr}% of shares present`, `تصويت الهيئة حسب الحصص · العتبة ${d.thr}% من الحصص الحاضرة`) : L('Committee vote · simple majority of members present', 'تصويت اللجنة · أغلبية بسيطة من الأعضاء الحاضرين')}</div></div>`
        + note(L('Digital record for reference — the signed minutes remain the legal record.', 'سجل رقمي للرجوع إليه — يبقى المحضر الموقّع هو السجل القانوني.')),
      foot: (m ? M.btn(L('Open meeting', 'فتح الاجتماع'), { go: `meeting-${m.id}`, icon: 'calendar' }) : '') + M.btn(L('Done', 'تم'), { kind: 'primary', act: 'mxClose' }) });
  };
  B.act.mcDoc = (id) => {
    const d = DOCS.find((x) => x.id === id); if (!d) return;
    M.sheet({ title: tx(d.name), sub: `${tx(DOC_CATS[d.cat])} · ${B.date(d.date)} · ${d.size}`,
      body: `<div class="mc-doc"><div class="dh">${B.logo(22)}<span class="mc-tag">${tx(DOC_CATS[d.cat])}</span></div><b style="font-size:13px;line-height:1.35;color:var(--ink)">${tx(d.name)}</b><small style="font-size:11px;color:var(--text-3)">${tx(C.name)}</small><i style="width:92%"></i><i style="width:86%"></i><i style="width:90%"></i><i style="width:60%"></i><i style="width:88%;margin-top:8px"></i><i style="width:80%"></i><i style="width:45%"></i>${d.cat === 'legal' ? `<span class="seal">${icon('badgeCheck')}</span>` : ''}</div>${note(L('Preview of a sample document', 'معاينة مستند نموذجي'))}`,
      foot: M.btn(L('Share', 'مشاركة'), { act: 'mxSoon', arg: L('Sharing', 'المشاركة'), icon: 'share' }) + M.btn(L('Download', 'تنزيل'), { kind: 'primary', act: 'mxSoon', arg: L('Download', 'التنزيل'), icon: 'download' }) });
  };

  /* maintenance */
  B.act.mcReq = (id) => {
    const r = req(id); if (!r) return;
    const c = catOf(r.cat);
    const p = prov(r.provider);
    const rows = [M.cell({ icon: c.icon, tone: 'mint', title: tx(c.name), sub: tx(r.loc || T('Common area', 'منطقة مشتركة')) }), M.cell({ icon: 'user', title: L('Reported by', 'أبلغ عنه'), sub: `${pname(r.by)} · ${B.dateShort(r.created)}` })];
    if (p) rows.push(M.cell({ icon: 'briefcase', tone: 'info', title: tx(p.name), sub: `★ ${p.rating} · ${tx(p.response)}` }));
    if (r.visit) rows.push(M.cell({ icon: 'calendar', tone: 'info', title: L('Visit', 'الزيارة'), sub: B.date(r.visit) }));
    let foot = M.btn(L('Done', 'تم'), { kind: 'primary', act: 'mxClose' });
    let extra = '';
    if (r.status === 'quoted') {
      extra = `<div class="mc-big" style="padding:14px 16px;gap:6px"><small>${L('Fixed quote', 'عرض سعر ثابت')} · ${idm(r.quoteId || '')}</small><div class="bg-top"><span class="bg-v">${B.money(r.quote)}</span><span class="badge violet">${L('Awaiting your approval', 'بانتظار موافقتك')}</span></div><small>${L('Incl. parts, labour and 16% VAT · valid until 3 Dec', 'يشمل القطع والعمل وضريبة 16% · ساري حتى 3 ك١')}</small></div>`;
      foot = M.btn(L('Decline', 'رفض'), { kind: 'danger', act: 'mcQuote', arg: `${r.id}:no` }) + M.btn(L('Approve quote', 'الموافقة على العرض'), { kind: 'primary', act: 'mcQuote', arg: `${r.id}:yes`, icon: 'check' });
    } else if (r.status === 'open') {
      foot = M.btn(L('Close', 'إغلاق'), { act: 'mxClose' }) + M.btn(L('Assign provider', 'إسناد مزوّد'), { kind: 'primary', act: 'mcAssign', arg: r.id, icon: 'userPlus' });
    } else if (r.status === 'inProgress' && r.id === 'MR-24477') {
      extra = `<div class="callout" style="background:var(--violet-bg);color:var(--violet)">${icon('vote')}<div>${S.voteResult ? L(`Repair resolution ${S.voteResult.st === 'passed' ? 'passed' : 'not passed'} — D-26-17`, `قرار الإصلاح ${S.voteResult.st === 'passed' ? 'أُقرّ' : 'لم يُقرّ'} — D-26-17`) : L('Repair (₪4,800) is being voted on in today’s committee call.', 'يجري التصويت على الإصلاح (4,800 ₪) في اجتماع اللجنة اليوم.')}</div></div>`;
      foot = M.btn(L('Close', 'إغلاق'), { act: 'mxClose' }) + M.btn(L('Open the vote', 'فتح التصويت'), { kind: 'dark', go: 'meeting-MT-2613', icon: 'vote' });
    }
    M.sheet({ title: tx(r.title), sub: `${idm(r.id)} · ${B.ui.statusLabel(r.status)}`, body: (r.desc ? `<div class="mc-text">${tx(r.desc)}</div>` : '') + M.group(rows) + extra, foot });
  };
  B.act.mcQuote = (arg) => {
    const [id, v] = String(arg).split(':'); const r = req(id); if (!r) return;
    if (v === 'yes') { r.status = 'scheduled'; r.visit = '2026-11-29'; B.refresh(); M.success({ title: L('Quote approved', 'تمت الموافقة على العرض'), text: L(`${tx(prov(r.provider).name)} will visit on 29 Nov. The expense is added for co-signature.`, `ستزور ${tx(prov(r.provider).name)} يوم 29 ت٢. وأُضيف المصروف للتوقيع المشترك.`), ref: r.quoteId }); }
    else { r.status = 'open'; r.provider = null; B.refresh(); later(() => M.toast(L('Quote declined — request reopened', 'تم رفض العرض — أُعيد فتح الطلب'), 'xCircle')); }
  };
  B.act.mcAssign = (id) => {
    const r = req(id); if (!r) return;
    const list = (D.providers || []).filter((p) => (p.cats || []).includes(r.cat) && (p.areas || []).includes('masyoun'));
    const opts = list.length ? list : (D.providers || []).slice(0, 3);
    M.sheet({ title: L('Assign a provider', 'إسناد مزوّد خدمة'), sub: tx(r.title), form: 'mcAssign',
      body: `<input type="hidden" name="id" value="${esc(r.id)}"><div style="display:flex;flex-direction:column;gap:8px">${opts.map((p, i) => `<label class="mc-prov ${i === 0 ? 'on' : ''}"><input type="radio" name="prov" value="${p.id}" ${i === 0 ? 'checked' : ''} style="position:absolute;opacity:0;pointer-events:none"><span class="avatar" style="background:#E8FAF3">${esc(B.initials(p.name))}</span><span style="min-width:0"><b>${tx(p.name)}</b><small>★ ${p.rating} · ${p.reviews} ${L('reviews', 'تقييم')} · ${tx(p.response)}</small></span><span class="p-r"></span></label>`).join('')}</div>`
        + M.field({ name: 'when', label: L('Preferred visit', 'موعد الزيارة المفضّل'), type: 'select', options: [{ v: '2026-11-26', l: L('Tomorrow morning', 'صباح الغد') }, { v: '2026-11-28', l: L('Saturday 28 Nov', 'السبت 28 ت٢') }, { v: '2026-11-30', l: L('Monday 30 Nov', 'الإثنين 30 ت٢') }] })
        + note(L('Providers are sample marketplace listings.', 'المزوّدون عروض نموذجية من السوق.')),
      foot: M.btn(L('Cancel', 'إلغاء'), { act: 'mxClose' }) + M.btn(L('Request quote', 'طلب عرض سعر'), { kind: 'primary', type: 'submit', icon: 'send' }) });
    const host = document.querySelector('.mx-sheet');
    if (host) host.addEventListener('change', (e) => { if (e.target.name === 'prov') host.querySelectorAll('.mc-prov').forEach((o) => o.classList.toggle('on', o.querySelector('input').checked)); });
  };
  B.submit.mcAssign = (d) => {
    const r = req(d.id); if (!r) return;
    r.provider = d.prov; r.status = 'assigned'; r.visit = d.when;
    B.refresh();
    M.success({ title: L('Provider assigned', 'تم إسناد المزوّد'), text: L(`${tx(prov(d.prov).name)} has been asked for a quote and a visit on ${B.date(d.when)}.`, `طُلب من ${tx(prov(d.prov).name)} تقديم عرض سعر وزيارة بتاريخ ${B.date(d.when)}.`), ref: r.id });
  };

  /* ======================================================================
     Screens
     ====================================================================== */
  const assocCard = (full = false) => `<div class="mc-assoc">
      <div class="a-top"><span class="a-logo">${icon('landmark')}</span><div style="min-width:0"><h2>${tx(C.name)}</h2><div class="a-sub">${tx(BLD.name)} · ${idm(BID)}</div></div></div>
      <div class="a-row">${legalBadge()}${C.regNo ? `<span class="a-chip">${idm(C.regNo)}</span>` : ''}${C.term ? `<span class="a-chip">${L('Term', 'الدورة')} ${tx(C.term)}</span>` : ''}</div>
      ${full ? `<div class="a-note">${icon('info')}<span>${C.kind === 'legal' ? L('Formally documented owners’ association — status taken from the registration certificate on file (sample). BENA records documented status; it never assigns legal status.', 'جمعية مالكين موثّقة رسمياً — الحالة مأخوذة من شهادة التسجيل المحفوظة (نموذج). تسجّل BENA الحالة الموثّقة فقط ولا تمنح أي صفة قانونية.') : L('Informal committee — no legal registration on file. BENA never assigns legal status.', 'لجنة غير رسمية — لا يوجد تسجيل قانوني محفوظ. لا تمنح BENA أي صفة قانونية.')}</span></div>` : ''}
      <div class="a-stats"><div><b>${UNITS}</b><small>${L('Units', 'وحدة')}</small></div><div><b>${MEMBERS.length}</b><small>${L('Committee', 'أعضاء اللجنة')}</small></div><div><b>${Math.round((COLLECTED / CHARGES) * 100)}%</b><small>${L('Collected', 'التحصيل')}</small></div></div>
    </div>`;

  const liveCard = () => {
    const m = live(); if (!m) return '';
    const t = tallyNums();
    const mine = S.vote[me];
    return `<button class="mc-livecard" data-go="meeting-${m.id}"><span class="row between" style="gap:8px;width:100%"><span class="mc-live"><i></i>${L('Live now', 'مباشر الآن')}</span><span class="muted" style="font-size:13px">${L('since', 'منذ')} ${m.time}</span></span>
      <h3>${tx(m.title)}</h3><p>${S.voteClosed ? L('Vote closed — decision recorded', 'أُغلق التصويت — تم تسجيل القرار') : mine ? L(`You voted · ${t.for} for, ${t.against} against so far`, `صوّتَ · ${t.for} مع، ${t.against} ضد حتى الآن`) : L('Vote open: Elevator B repair (₪4,800) — your vote is needed', 'التصويت مفتوح: إصلاح المصعد ب (4,800 ₪) — صوتك مطلوب')}</p>
      <span class="row between" style="width:100%;gap:10px"><span class="mc-faces">${VOTERS.filter((p) => !ABSENT.includes(p)).map((p) => B.ui.avatar(pobj(p).name)).join('')}<small>${L('4 of 5 present', '4 من 5 حاضرون')}</small></span>${S.voteClosed || mine ? `<span class="mx-btn soft sm">${L('Open', 'فتح')}</span>` : `<span class="mx-btn primary sm">${icon('vote')}${L('Vote now', 'صوّت الآن')}</span>`}</span></button>`;
  };

  /* --- Home --- */
  const home = () => {
    const pe = pendingExp();
    const nr = needsReq();
    const up = MEETINGS.find((m) => m.status === 'scheduled');
    const lastAnn = anns()[0];
    const actions = [];
    if (live() && !S.vote[me] && !S.voteClosed) actions.push(M.cell({ icon: 'vote', tone: 'violet', title: L('Cast your vote on D-26-17', 'أدلِ بصوتك على القرار D-26-17'), sub: L('Elevator B repair · voting open now', 'إصلاح المصعد ب · التصويت مفتوح الآن'), go: 'meeting-MT-2613' }));
    if (pe.length) actions.push(M.cell({ icon: 'receipt', tone: 'warn', title: L(`${pe.length} expenses to approve`, `${pe.length} مصروفات بانتظار الموافقة`), sub: B.money(B.sum(pe, (e) => e.amount)) + L(' in total', ' إجمالاً'), go: 'expenses', badge: `<span class="badge warn">${pe.length}</span>` }));
    if (nr.length) actions.push(M.cell({ icon: 'wrench', tone: 'warn', title: L(`${nr.length} maintenance items need a decision`, `${nr.length} طلبات صيانة بحاجة لقرار`), sub: nr.map((r) => tx(r.title)).join(' · '), go: 'maintenance', badge: `<span class="badge warn">${nr.length}</span>` }));
    if (!S.rsvp['MT-2612']) actions.push(M.cell({ icon: 'calendarCheck', tone: 'info', title: L('RSVP to the general assembly', 'أكّد حضور الهيئة العامة'), sub: L('Thursday 4 Dec, 19:00 · 2027 budget', 'الخميس 4 ك١، 19:00 · موازنة 2027'), go: 'meeting-MT-2612' }));
    const sp = spent();
    return {
      title: L('Committee', 'اللجنة'), large: true, kicker: L(`Good morning, ${pname(me).split(' ')[0]} · Chair`, `صباح الخير يا ${pname(me).split(' ')[0]} · الرئيس`), actions: [bell()],
      body: liveCard() + assocCard()
        + (actions.length ? M.section(L('Needs your action', 'بانتظار إجرائك'), M.group(actions)) : `<div class="callout mint">${icon('checkCircle')}<div>${L('You’re all caught up — nothing waiting for you.', 'لا شيء بانتظارك — كل شيء محدّث.')}</div></div>`)
        + M.quick([{ label: L('Announce', 'إعلان'), icon: 'megaphone', act: 'mcCompose', mint: true }, { label: L('Members', 'الأعضاء'), icon: 'users', go: 'members' }, { label: L('Decisions', 'القرارات'), icon: 'gavel', go: 'decisions' }, { label: L('Documents', 'المستندات'), icon: 'folder', go: 'documents' }])
        + M.section(L('Money this month', 'الأموال هذا الشهر'), M.kpis([{ label: L('Operating balance', 'الرصيد التشغيلي'), value: B.money(CASH), sub: L('Association account', 'حساب الجمعية'), icon: 'wallet', go: 'budget' }, { label: L('Spent in November', 'مصروف تشرين الثاني'), value: B.money(sp), sub: L(`of ${B.money(BUDGET)} budget`, `من موازنة ${B.money(BUDGET)}`), icon: 'receipt', go: 'expenses', alert: sp > BUDGET }, { label: L('Collected', 'المحصَّل'), value: B.money(COLLECTED), sub: L(`of ${B.money(CHARGES)} charges`, `من رسوم ${B.money(CHARGES)}`), icon: 'coins', go: 'budget' }, { label: L('Reserve fund', 'صندوق الاحتياط'), value: B.money(RESERVE), sub: L('Long-term repairs', 'للإصلاحات طويلة الأمد'), icon: 'shieldCheck', go: 'budget' }]), { link: { label: L('Budget', 'الموازنة'), go: 'budget' } })
        + (up ? M.section(L('Next meeting', 'الاجتماع القادم'), `<div class="mx-group">${meetRow(up)}</div>`, { link: { label: L('All', 'الكل'), go: 'meetings' } }) : '')
        + (lastAnn ? M.section(L('Latest announcement', 'آخر إعلان'), annCard(lastAnn), { link: { go: 'announcements' } }) : '')
        + note(L('Sample association · fictional people and figures', 'جمعية نموذجية · أشخاص وأرقام وهمية')),
    };
  };

  /* --- Members --- */
  const members = () => ({
    title: L('Members', 'الأعضاء'), back: 'menu', backLabel: L('More', 'المزيد'), tab: 'menu',
    body: assocCard(true)
      + M.group(MEMBERS.map((m) => M.cell({ avatar: pobj(m.p).name, title: pname(m.p) + (m.p === me ? L(' (you)', ' (أنت)') : ''), sub: `${tx(m.role)} · ${L('unit', 'الوحدة')} ${unitNo(m.unit)}`, act: 'mcMember', arg: m.p, badge: m.p === me ? `<span class="badge navy">${icon('crown')}${L('Chair', 'الرئيس')}</span>` : m.delegated ? `<span class="badge violet">${L('Proxy', 'وكالة')}</span>` : '' })), L(`Committee ${tx(C.term || '')}`, `اللجنة ${tx(C.term || '')}`))
      + M.group([M.cell({ icon: 'userCheck', tone: 'violet', title: L(`${pname('p_khaled')} → ${pname('p_adel')}`, `${pname('p_khaled')} ← ${pname('p_adel')}`), sub: L('Units 1102 and 803 · general assemblies · until 1 Mar 2027', 'الوحدتان 1102 و803 · الهيئات العامة · حتى 1 آذار 2027'), act: 'mcDoc', arg: 'd11' })], L('Proxies on file', 'الوكالات المسجّلة'))
      + M.group([M.cell({ icon: 'building', title: L(`${UNITS} units · 49 owners`, `${UNITS} وحدة · 49 مالكاً`), sub: L('Owners’ register kept by the secretary', 'سجل المالكين يحفظه أمين السر'), value: '46', valueSub: L('on BENA', 'على BENA') }), M.cell({ icon: 'userPlus', tone: 'mint', title: L('Invite an owner to BENA', 'دعوة مالك إلى BENA'), act: 'mxSoon', arg: L('Invitations', 'الدعوات') })], L('Owners', 'المالكون'))
      + note(L('Membership shown as recorded by the association · sample data', 'العضوية كما سجّلتها الجمعية · بيانات نموذجية')),
  });

  /* --- Announcements --- */
  const annCard = (a) => `<button class="mc-ann ${a.pinned ? 'pinned' : ''}" data-act="mcAnnOpen" data-arg="${a.id}"><span class="an-top">${a.pinned ? `<span class="mc-tag pin">${icon('flag')}${L('Pinned', 'مثبّت')}</span>` : ''}${tag(a.tag)}${a.mine ? `<span class="mc-tag">${L('Just now', 'الآن')}</span>` : ''}</span><h3>${esc(tx(a.title))}</h3><p>${esc(tx(a.body))}</p><span class="an-foot"><span>${a.by === 'org_arkan' ? L('Property manager', 'مدير العقار') : L('Committee', 'اللجنة')} · ${B.ago(a.date)}</span><span>${icon('eye')}${readOf(a)}/${UNITS}</span></span></button>`;
  const announcements = () => {
    const f = B.get('mc:an', 'all');
    const list = anns().filter((a) => f === 'all' || a.tag === f).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.date.localeCompare(a.date));
    return {
      title: L('Announcements', 'الإعلانات'), large: true, back: 'menu', backLabel: L('More', 'المزيد'), tab: 'menu',
      actions: [{ icon: 'plus', act: 'mcCompose', label: L('New announcement', 'إعلان جديد') }],
      body: M.btn(L('New announcement', 'إعلان جديد'), { kind: 'primary', icon: 'megaphone', act: 'mcCompose', block: true })
        + M.chips('mc:an', [{ id: 'all', label: L('All', 'الكل') }, ...Object.keys(TAGS).map((k) => ({ id: k, label: TAGS[k][0] }))], f)
        + (list.length ? `<div style="display:flex;flex-direction:column;gap:10px">${list.map(annCard).join('')}</div>` : M.empty('megaphone', L('No announcements here yet', 'لا توجد إعلانات هنا بعد')))
        + note(L('Read counts are sample figures', 'أرقام القراءة نموذجية')),
    };
  };

  /* --- Meetings --- */
  const meetRow = (m) => {
    const isLive = m.status === 'live', past = m.status === 'completed';
    return `<button class="mc-meet" data-go="meeting-${m.id}">${dt(m.date, isLive ? 'live' : past ? 'past' : '')}<span class="m-b"><span class="m-t">${tx(m.title)}</span><span class="m-s">${isLive ? `<span class="mc-live" style="font-size:12px"><i></i>${L('Live', 'مباشر')}</span> · ` : ''}${tx(KIND[m.kind])} · ${m.time}</span></span>${icon('chevR', 'chev flip')}</button>`;
  };
  const meetings = () => {
    const lv = MEETINGS.filter((m) => m.status === 'live');
    const up = MEETINGS.filter((m) => m.status === 'scheduled').sort((a, b) => a.date.localeCompare(b.date));
    const past = MEETINGS.filter((m) => m.status === 'completed');
    return {
      title: L('Meetings', 'الاجتماعات'), large: true, actions: [{ icon: 'plus', act: 'mxSoon', arg: L('Scheduling a meeting', 'جدولة اجتماع'), label: L('Schedule', 'جدولة') }],
      body: (lv.length ? liveCard() : '')
        + M.section(L('Upcoming', 'القادمة'), `<div class="mx-group">${up.map(meetRow).join('')}</div>`)
        + M.section(L('Past meetings', 'الاجتماعات السابقة'), `<div class="mx-group">${past.map(meetRow).join('')}</div>`)
        + note(L('Online meetings and votes are simulated', 'الاجتماعات والتصويت عبر الإنترنت محاكاة')),
    };
  };

  /* --- Meeting detail --- */
  const voteCard = () => {
    const t = tallyNums();
    const present = VOTERS.length - ABSENT.length;
    const mine = S.vote[me];
    const pending = present - t.for - t.against - t.abstain;
    const tot = present + ABSENT.length;
    const bar = `<div class="mc-tally">${[['for', t.for], ['against', t.against], ['abstain', t.abstain]].map(([k, n]) => n ? `<i style="width:${(n / tot) * 100}%;background:${VCOL[k]}"></i>` : '').join('')}</div>`;
    const res = S.voteResult;
    const voters = `<div class="mc-voters">${VOTERS.map((p) => { const v = ABSENT.includes(p) ? 'absent' : S.vote[p] || 'pending'; const lab = { for: L('For', 'مع'), against: L('Against', 'ضد'), abstain: L('Abstain', 'امتناع'), pending: L('Not voted yet', 'لم يصوّت بعد'), absent: L('Apology', 'معتذر') }[v]; const ic = { for: 'checkCircle', against: 'xCircle', abstain: 'minus', pending: 'clock', absent: 'minus' }[v]; const m = MEMBERS.find((x) => x.p === p); return `<div class="mc-voter">${B.ui.avatar(pobj(p).name)}<span class="nm">${pname(p)}${p === me ? L(' (you)', ' (أنت)') : ''}<small>${m ? tx(m.role) : ''}</small></span><span class="mc-vv ${v}">${icon(ic)}${lab}</span></div>`; }).join('')}</div>`;
    return `<div class="mc-vote ${S.voteClosed ? '' : 'open'}">
      <div class="v-k"><span class="mc-live" style="${S.voteClosed ? 'color:var(--text-2)' : ''}">${S.voteClosed ? icon('lock').replace('<svg', '<svg style="width:14px;height:14px"') : '<i></i>'}${S.voteClosed ? L('Vote closed', 'أُغلق التصويت') : L('Voting open', 'التصويت مفتوح')}</span>${idm('D-26-17')}</div>
      <h3>${L('Replace the Elevator B door operator — LiftLine Elevators, ₪4,800', 'استبدال محرك أبواب المصعد ب — لفت لاين للمصاعد، 4,800 ₪')}</h3>
      <div class="v-rule">${icon('gavel')}${L(`Simple majority of members present · ${Math.floor(present / 2) + 1} of ${present} needed`, `أغلبية بسيطة من الحاضرين · يلزم ${Math.floor(present / 2) + 1} من ${present}`)}</div>
      ${bar}
      <div class="mc-legend"><span><i style="background:${VCOL.for}"></i>${L('For', 'مع')} <b>${t.for}</b></span><span><i style="background:${VCOL.against}"></i>${L('Against', 'ضد')} <b>${t.against}</b></span><span><i style="background:${VCOL.abstain}"></i>${L('Abstain', 'امتناع')} <b>${t.abstain}</b></span><span><i style="background:#E6ECEA"></i>${L('Waiting', 'بانتظار')} <b>${pending}</b></span></div>
      ${res ? `<div class="mc-result ${res.st === 'passed' ? 'ok' : 'bad'}">${icon(res.st === 'passed' ? 'checkCircle' : 'xCircle')}<div><b>${res.st === 'passed' ? L('Passed', 'أُقرّ') : L('Not passed', 'لم يُقرّ')}</b><small>${L(`Recorded at ${'10:0' + Math.min(9, 4 + t.for)} · added to Decisions`, `سُجّل الساعة ${'10:0' + Math.min(9, 4 + t.for)} · أُضيف إلى القرارات`)}</small></div></div>`
        : `<div><div style="font-size:14px;font-weight:600;margin-bottom:8px">${mine ? L('Your vote — tap to change', 'صوتك — اضغط للتغيير') : L('Your vote', 'صوتك')}</div><div class="mc-vbtns">${[['for', 'checkCircle', L('For', 'مع')], ['against', 'xCircle', L('Against', 'ضد')], ['abstain', 'minus', L('Abstain', 'امتناع')]].map(([k, ic, lab]) => `<button class="mc-vbtn ${k} ${mine === k ? 'on' : ''}" data-act="mcVote" data-arg="${k}" aria-pressed="${mine === k}">${icon(ic)}${lab}</button>`).join('')}</div></div>`}
      ${voters}
      ${!res ? M.btn(L('Close vote & record decision', 'إغلاق التصويت وتسجيل القرار'), { kind: 'dark', block: true, icon: 'gavel', act: 'mcCloseVote' }) + `<div class="mc-note" style="margin-top:-6px">${icon('crown')}${L('As chair you can close the vote', 'بصفتك الرئيس يمكنك إغلاق التصويت')}</div>` : ''}
    </div>`;
  };
  const meetingScreen = (id) => {
    const m = meeting(id) || live() || MEETINGS[0];
    const isLive = m.status === 'live', past = m.status === 'completed';
    const head = `<div class="mc-mhead"><div class="row" style="gap:8px;flex-wrap:wrap">${isLive ? `<span class="badge bad"><i class="bd"></i>${L('Live now', 'مباشر الآن')}</span>` : past ? B.ui.status('completed') : B.ui.status('scheduled')}<span class="badge">${tx(KIND[m.kind])}</span></div><h2>${tx(m.title)}</h2>
      <div class="mh-meta"><span>${icon('calendar')}${dowFull(m.date)} ${B.date(m.date)} · ${m.time}</span><span>${icon(m.place.en.startsWith('Online') ? 'globe' : 'pin')}${tx(m.place)}</span></div></div>`;
    const agenda = `<div class="mc-agenda">${m.agenda.map((a, i) => `<div class="mc-ag ${a[2] || (past ? 'done' : '')}"><span class="n">${a[2] === 'done' || past ? icon('check') : i + 1}</span><div><b>${tx(a[0])}</b><small>${tx(a[1])}</small>${a[2] === 'current' ? `<span class="now">${L('Now discussing', 'قيد النقاش الآن')}</span>` : ''}</div></div>`).join('')}</div>`;
    let att = '';
    if (m.attend) att = M.section(L('Attendance', 'الحضور'), `<div class="mc-att">${VOTERS.map((p) => { const st = m.attend[p] || 'present'; const ok = st === 'present'; return `<div class="${ok ? '' : 'off'}">${B.ui.avatar(pobj(p).name)}<b>${pname(p).split(' ')[0]}</b><small>${ok ? L('Present', 'حاضر') : L('Apology', 'معتذر')}</small></div>`; }).join('')}</div>`, { sub: L(`${Object.values(m.attend).filter((x) => x === 'present').length} of ${VOTERS.length} · quorum met`, `${Object.values(m.attend).filter((x) => x === 'present').length} من ${VOTERS.length} · النصاب مكتمل`) });
    let rsvp = '';
    if (m.status === 'scheduled') {
      const my = S.rsvp[m.id] || (m.rsvp && m.rsvp[me]);
      if (m.kind === 'ga') {
        const share = m.rsvpShare + (S.rsvp[m.id] === 'yes' ? 1.9 : 0);
        rsvp = `<div class="mc-quorum"><div class="q-top"><div><small>${L('Expected attendance (RSVP + proxies)', 'الحضور المتوقع (التأكيدات + الوكالات)')}</small><br><b>${B.num1(share)}%</b> <small>${L('of unit shares', 'من الحصص')}</small></div>${B.ui.status(share >= m.quorumReq ? 'approved' : 'pending')}</div><div class="mc-qbar"><i style="width:${share}%"></i><em style="inset-inline-start:${m.quorumReq}%"></em></div><small>${L(`Quorum ${m.quorumReq}% of shares · ${m.rsvpUnits + (S.rsvp[m.id] === 'yes' ? 1 : 0)} units confirmed · ${m.proxies} proxies`, `النصاب ${m.quorumReq}% من الحصص · ${m.rsvpUnits + (S.rsvp[m.id] === 'yes' ? 1 : 0)} وحدة أكدت · ${m.proxies} وكالات`)}</small></div>`;
      } else {
        rsvp = M.section(L('Who’s coming', 'من سيحضر'), `<div class="mc-att">${VOTERS.map((p) => { const st = p === me ? (S.rsvp[m.id] || m.rsvp[p]) : m.rsvp[p]; return `<div class="${st === 'yes' ? '' : 'off'}">${B.ui.avatar(pobj(p).name)}<b>${pname(p).split(' ')[0]}</b><small>${st === 'yes' ? L('Going', 'سيحضر') : st === 'no' ? L('Apology', 'معتذر') : L('Maybe', 'ربما')}</small></div>`; }).join('')}</div>`);
      }
      rsvp += `<div class="row" style="gap:10px">${M.btn(L('Send apology', 'إرسال اعتذار'), { kind: my === 'no' ? 'danger' : 'ghost', act: 'mcRsvp', arg: `${m.id}:no` }).replace('class="mx-btn', 'style="flex:1" class="mx-btn')}${M.btn(my === 'yes' ? L('Attending ✓', 'سأحضر ✓') : L('I’ll attend', 'سأحضر'), { kind: my === 'yes' ? 'soft' : 'primary', act: 'mcRsvp', arg: `${m.id}:yes`, icon: 'calendarCheck' }).replace('class="mx-btn', 'style="flex:1" class="mx-btn')}</div>`;
    }
    const resList = DECISIONS.filter((d) => d.mt === m.id);
    const res = resList.length ? M.section(L('Resolutions', 'القرارات'), `<div style="display:flex;flex-direction:column;gap:10px">${resList.map((d) => `<button class="mc-vote" data-act="mcDecision" data-arg="${d.id}" style="text-align:start;gap:10px"><span class="v-k">${B.ui.status(d.st)}${idm(d.id)}</span><span style="font-size:15px;font-weight:600;line-height:1.35">${tx(d.t)}</span>${voteBar(d)}</button>`).join('')}</div>`) : '';
    const minutes = m.minutes ? M.section(L('Minutes (summary)', 'المحضر (ملخص)'), `<div class="mx-card"><div class="mc-text">${tx(m.minutes)}</div></div>`) : '';
    const docs = M.group([M.cell({ icon: 'doc', title: past ? L('Signed minutes (PDF)', 'المحضر الموقّع (PDF)') : L('Meeting pack (PDF)', 'ملف الاجتماع (PDF)'), sub: L('Sample document', 'مستند نموذجي'), act: 'mcDoc', arg: past ? 'd7' : 'd5' }), m.status === 'scheduled' ? M.cell({ icon: 'calendar', title: L('Add to calendar', 'أضف إلى التقويم'), act: 'mxSoon', arg: L('Calendar export', 'تصدير التقويم') }) : '', isLive ? M.cell({ icon: 'globe', tone: 'mint', title: L('Rejoin the call', 'العودة إلى المكالمة'), sub: L('Audio only · simulated', 'صوت فقط · محاكاة'), act: 'mxSoon', arg: L('Joining the call', 'الانضمام للمكالمة') }) : ''].filter(Boolean));
    return {
      title: L('Meeting', 'الاجتماع'), back: 'meetings', backLabel: L('Meetings', 'الاجتماعات'), tab: 'meetings',
      body: head + (isLive ? voteCard() : '') + att + rsvp + M.section(L('Agenda', 'جدول الأعمال'), agenda) + res + minutes + docs
        + note(isLive ? L('Simulated live vote — nothing is legally recorded.', 'تصويت مباشر محاكى — لا يُسجَّل أي شيء قانونياً.') : L('Sample meeting record', 'سجل اجتماع نموذجي')),
    };
  };
  const DOWF = { en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] };
  const dowFull = (d) => DOWF[B.isAr() ? 'ar' : 'en'][new Date(d + 'T12:00:00').getDay()];

  /* --- Decisions --- */
  const decisionsScreen = () => {
    const f = B.get('mc:dec', 'all');
    const list = decisions().filter((d) => f === 'all' || (f === 'passed' ? d.st === 'passed' : f === 'failed' ? d.st === 'failed' : f === 'assembly' ? d.mode === 'share' : d.mode === 'count'));
    return {
      title: L('Decisions', 'القرارات'), large: true, back: 'menu', backLabel: L('More', 'المزيد'), tab: 'menu',
      body: M.chips('mc:dec', [{ id: 'all', label: L('All', 'الكل') }, { id: 'passed', label: L('Passed', 'أُقرّت') }, { id: 'failed', label: L('Not passed', 'لم تُقرّ') }, { id: 'committee', label: L('Committee', 'اللجنة') }, { id: 'assembly', label: L('Assembly', 'الهيئة العامة') }], f)
        + (list.length ? M.group(list.map((d) => M.cell({ icon: d.st === 'passed' ? 'checkCircle' : 'xCircle', tone: d.st === 'passed' ? 'mint' : 'bad', title: d.t, sub: `${d.id} · ${B.dateShort(d.date)} · ${d.mode === 'share' ? L('assembly', 'هيئة عامة') : L('committee', 'لجنة')}`, act: 'mcDecision', arg: d.id, badge: d.fresh ? `<span class="badge mint">${L('New', 'جديد')}</span>` : '' }))) : M.empty('gavel', L('No decisions match', 'لا توجد قرارات مطابقة')))
        + note(L('Digital register for reference — signed minutes remain the legal record.', 'سجل رقمي للرجوع إليه — يبقى المحضر الموقّع هو السجل القانوني.')),
    };
  };

  /* --- Expenses --- */
  const expenses = () => {
    const pe = pendingExp();
    const done = PENDING.filter((e) => e.status !== 'pending');
    const sp = spent();
    const card = (e) => {
      const blocked = e.needs && !(S.voteResult && S.voteResult.st === 'passed');
      const c = cat(e.cat);
      return `<div class="mc-exp"><div class="e-top"><span class="e-i">${icon(c.icon)}</span><div class="e-b"><b>${tx(e.desc)}</b><small>${tx(e.payee)} · ${idm(e.id)}</small></div><span class="e-amt">${B.money(e.amount)}</span></div>
        ${blocked ? `<div class="e-lock">${icon('vote')}${L('Needs resolution D-26-17 — vote open now', 'يحتاج القرار D-26-17 — التصويت مفتوح الآن')}</div>` : ''}
        <div class="e-acts">${blocked ? M.btn(L('Review', 'مراجعة'), { act: 'mcExp', arg: e.id }) + M.btn(L('Go to vote', 'انتقل للتصويت'), { kind: 'dark', go: 'meeting-MT-2613', icon: 'vote' }) : M.btn(L('Review', 'مراجعة'), { act: 'mcExp', arg: e.id }) + M.btn(L('Approve', 'موافقة'), { kind: 'primary', act: 'mcExp', arg: e.id, icon: 'check' })}</div></div>`;
    };
    const ledger = [...done.filter((e) => e.status === 'approved'), ...LEDGER].sort((a, b) => b.date.localeCompare(a.date));
    return {
      title: L('Finance', 'المالية'), large: true, actions: [{ icon: 'download', act: 'mxSoon', arg: L('Statement export', 'تصدير الكشف'), label: L('Export', 'تصدير') }],
      body: seg2('expenses')
        + `<div class="mc-big"><div class="bg-top"><div><small>${L('Spent in November', 'مصروف تشرين الثاني')}</small><div class="bg-v">${B.money(sp)}</div></div><div class="bg-r"><small>${L('Monthly budget', 'الموازنة الشهرية')}</small><b>${B.money(BUDGET)}</b></div></div><div class="mc-bar" style="height:10px"><i style="width:${Math.min(100, (sp / BUDGET) * 100)}%;background:${sp > BUDGET ? '#E5484D' : '#36D6A0'}"></i></div><small>${sp > BUDGET ? L(`${B.money(sp - BUDGET)} over budget`, `تجاوز بمقدار ${B.money(sp - BUDGET)}`) : L(`${B.money(BUDGET - sp)} left this month`, `متبقٍ ${B.money(BUDGET - sp)} هذا الشهر`)}</small></div>`
        + M.section(L('Awaiting your approval', 'بانتظار موافقتك'), pe.length ? `<div style="display:flex;flex-direction:column;gap:10px">${pe.map(card).join('')}</div>` : `<div class="callout mint">${icon('checkCircle')}<div>${L('No expenses waiting for approval.', 'لا مصروفات بانتظار الموافقة.')}</div></div>`, { sub: pe.length ? L(`${pe.length} · ${B.money(B.sum(pe, (e) => e.amount))}`, `${pe.length} · ${B.money(B.sum(pe, (e) => e.amount))}`) : '' })
        + (done.filter((e) => e.status === 'rejected').length ? M.group(done.filter((e) => e.status === 'rejected').map((e) => M.cell({ icon: 'xCircle', tone: 'bad', title: tx(e.desc), sub: tx(e.payee), value: B.money(e.amount), badge: B.ui.status('rejected'), act: 'mcLedger', arg: e.id })), L('Rejected', 'مرفوضة')) : '')
        + M.section(L('Paid this month', 'المدفوع هذا الشهر'), M.group(ledger.map((e) => { const c = cat(e.cat); return M.cell({ icon: c.icon, tone: 'mint', title: tx(e.payee), sub: `${tx(e.desc)} · ${B.dateShort(e.date)}`, value: B.money(e.amount), act: 'mcLedger', arg: e.id }); })) + `<div class="mc-sum"><span>${L('Total', 'الإجمالي')}</span><b>${B.money(B.sum(ledger, (e) => e.amount))}</b></div>`)
        + note(L('Sample ledger · approvals and payments are simulated', 'دفتر نموذجي · الموافقات والدفعات محاكاة')),
    };
  };

  /* --- Budget --- */
  const budget = () => {
    const sp = spent();
    const coll = (COLLECTED / CHARGES) * 100;
    return {
      title: L('Finance', 'المالية'), large: true, tab: 'expenses',
      body: seg2('budget')
        + `<div class="mc-big"><div class="bg-top"><div><small>${L('2026 operating budget', 'الموازنة التشغيلية 2026')}</small><div class="bg-v">${B.money(BUDGET * 12)}</div><small>${L(`${B.money(BUDGET)} per month · approved R-26-03`, `${B.money(BUDGET)} شهرياً · أُقرّت بالقرار R-26-03`)}</small></div></div></div>`
        + `<div class="mx-kpis"><div class="mx-kpi" style="flex-direction:row;align-items:center;gap:12px">${ring(coll)}<div><span class="k-l">${L('Collection rate', 'نسبة التحصيل')}</span><span class="k-s">${L(`${B.money(COLLECTED)} of ${B.money(CHARGES)}`, `${B.money(COLLECTED)} من ${B.money(CHARGES)}`)}</span></div></div><div class="mx-kpi"><span class="k-l">${icon('shieldCheck')}${L('Reserve fund', 'صندوق الاحتياط')}</span><span class="k-v">${B.money(RESERVE)}</span><span class="k-s">${L('+₪980 this month', '+980 ₪ هذا الشهر')}</span></div></div>`
        + M.section(L('November by category', 'تشرين الثاني حسب البند'), `<div class="mc-bud">${CATS.map((c) => { const a = spentOf(c.id); const over = a > c.budget; return `<div class="mc-bl ${over ? 'over' : ''}"><span class="b-i" style="background:${c.color}">${icon(c.icon)}</span><div class="b-b"><div class="b-top"><span>${tx(c.n)}</span><span><b>${B.money(a)}</b> / ${B.money(c.budget)}</span></div><div class="mc-bar"><i style="width:${Math.min(100, (a / c.budget) * 100)}%;background:${over ? '#E5484D' : c.color}"></i></div></div></div>`; }).join('')}</div>`, { sub: L(`${B.money(sp)} of ${B.money(BUDGET)}`, `${B.money(sp)} من ${B.money(BUDGET)}`) })
        + M.group([M.cell({ icon: 'chart', tone: 'violet', title: L('Draft 2027 budget', 'مسودة موازنة 2027'), sub: L('To be voted at the general assembly on 4 Dec', 'للتصويت في الهيئة العامة يوم 4 ك١'), go: 'meeting-MT-2612' }), M.cell({ icon: 'receipt', title: L('October statement', 'كشف تشرين الأول'), sub: 'PDF · 160 KB', act: 'mcDoc', arg: 'd6' }), M.cell({ icon: 'alertCircle', tone: 'warn', title: L('3 units with 2+ months of arrears', '3 وحدات متأخرة شهرين فأكثر'), sub: L('Formal reminders sent (D-26-15)', 'أُرسلت إنذارات رسمية (D-26-15)'), act: 'mcDecision', arg: 'D-26-15' })])
        + note(L('Sample figures for a fictional association', 'أرقام نموذجية لجمعية وهمية')),
    };
  };

  /* --- Maintenance --- */
  const reqCard = (r) => {
    const c = catOf(r.cat);
    const p = prov(r.provider);
    const need = r.status === 'open' || r.status === 'quoted';
    return `<button class="mc-req ${need ? 'need' : ''}" data-act="mcReq" data-arg="${r.id}"><span class="r-i">${icon(c.icon)}</span><span class="r-b"><b>${tx(r.title)}</b><small>${tx(r.loc || T('Common area', 'منطقة مشتركة'))}${p ? ' · ' + tx(p.name) : ''}</small><span class="r-tags">${B.ui.status(r.status)}${r.status === 'quoted' ? `<span class="badge violet">${B.money(r.quote)}</span>` : ''}${r.status === 'open' ? `<span class="badge warn">${L('No provider yet', 'لا مزوّد بعد')}</span>` : ''}${r.visit && r.status !== 'completed' ? `<span class="badge">${icon('calendar')}${B.dateShort(r.visit)}</span>` : ''}</span></span>${icon('chevR', 'chev flip')}</button>`;
  };
  const maintenance = () => {
    const f = B.get('mc:mt', 'need');
    const groups = { need: REQS.filter((r) => r.status === 'open' || r.status === 'quoted'), active: REQS.filter((r) => ['assigned', 'inProgress', 'scheduled'].includes(r.status)), done: REQS.filter((r) => r.status === 'completed') };
    const list = groups[f] || [];
    return {
      title: L('Maintenance', 'الصيانة'), large: true, kicker: L('Common areas', 'المناطق المشتركة'), actions: [{ icon: 'plus', act: 'mxSoon', arg: L('New request', 'طلب جديد'), label: L('New request', 'طلب جديد') }],
      body: M.seg('mc:mt', [{ id: 'need', label: L(`Needs action · ${groups.need.length}`, `بحاجة لإجراء · ${groups.need.length}`) }, { id: 'active', label: L('Active', 'جارية') }, { id: 'done', label: L('Done', 'منجزة') }], f)
        + (list.length ? `<div style="display:flex;flex-direction:column;gap:10px">${list.map(reqCard).join('')}</div>` : M.empty('checkCircle', L('Nothing waiting here', 'لا شيء بانتظارك هنا'), L('New requests from residents appear here.', 'تظهر هنا الطلبات الجديدة من السكان.')))
        + M.group([M.cell({ icon: 'elevator', tone: 'warn', title: L('Elevator B — fault reported', 'المصعد ب — عطل مُبلغ عنه'), sub: L('Asset AS-142-EL2 · next service due today', 'الأصل AS-142-EL2 · الصيانة التالية مستحقة اليوم'), act: 'mcReq', arg: 'MR-24477' }), M.cell({ icon: 'tank', tone: 'info', title: L('Rooftop tanks — cleaning due 3 Dec', 'خزانات السطح — التنظيف مستحق 3 ك١'), sub: 'AS-142-TNK', act: 'mcReq', arg: 'MR-24390' })], L('Building assets to watch', 'أصول تحتاج متابعة'))
        + note(L('Unit-level requests stay with owners and tenants · sample data', 'طلبات الوحدات تبقى لدى المالكين والمستأجرين · بيانات نموذجية')),
    };
  };

  /* --- Documents --- */
  const documents = () => {
    const f = B.get('mc:doc', 'all');
    const q = B.get('mc:dq', '');
    const list = DOCS.filter((d) => (f === 'all' || d.cat === f) && B.match(q, d.name));
    return {
      title: L('Documents', 'المستندات'), large: true, back: 'menu', backLabel: L('More', 'المزيد'), tab: 'menu', actions: [{ icon: 'upload', act: 'mxSoon', arg: L('Upload', 'الرفع'), label: L('Upload', 'رفع') }],
      body: M.search('mc:dq', L('Search documents', 'ابحث في المستندات'))
        + M.chips('mc:doc', [{ id: 'all', label: L('All', 'الكل') }, ...Object.keys(DOC_CATS).map((k) => ({ id: k, label: DOC_CATS[k] }))], f)
        + (list.length ? M.group(list.map((d) => M.cell({ icon: d.icon, tone: d.tone || (d.cat === 'legal' ? 'navy' : d.cat === 'finance' ? 'warn' : d.cat === 'minutes' ? 'info' : ''), title: d.name, sub: `${B.dateShort(d.date)} ${new Date(d.date).getFullYear()} · ${d.size}`, act: 'mcDoc', arg: d.id }))) : M.empty('folder', L('No documents found', 'لا توجد مستندات')))
        + `<div class="callout dashed">${icon('shieldCheck')}<div>${L('The registration certificate is the basis of the “Legally documented” status shown for this association. BENA does not verify or grant legal status.', 'شهادة التسجيل هي أساس صفة «موثّقة قانونياً» الظاهرة لهذه الجمعية. لا تتحقق BENA من الصفة القانونية ولا تمنحها.')}</div></div>`,
    };
  };

  /* --- More / profile --- */
  const menu = () => ({
    title: L('More', 'المزيد'), large: true,
    body: `<div class="mc-me">${B.ui.avatar(pobj(me).name)}<div style="min-width:0"><b>${pname(me)}</b><small>${L('Chair', 'الرئيس')} · ${tx(C.name)}</small><small>${L('Unit 1201', 'الوحدة 1201')} · ${(pobj(me).phone || '')}</small></div></div>`
      + M.group([M.cell({ icon: 'users', tone: 'navy', title: L('Members', 'الأعضاء'), sub: L(`${MEMBERS.length} committee members · proxies`, `${MEMBERS.length} أعضاء · الوكالات`), go: 'members' }), M.cell({ icon: 'megaphone', tone: 'navy', title: L('Announcements', 'الإعلانات'), go: 'announcements' }), M.cell({ icon: 'gavel', tone: 'navy', title: L('Decisions', 'القرارات'), go: 'decisions' }), M.cell({ icon: 'pie', tone: 'navy', title: L('Budget', 'الموازنة'), go: 'budget' }), M.cell({ icon: 'folder', tone: 'navy', title: L('Documents', 'المستندات'), go: 'documents' })], L('Association', 'الجمعية'))
      + M.group([M.cell({ icon: 'globe', tone: 'info', title: L('Language', 'اللغة'), sub: B.isAr() ? 'العربية' : 'English', value: B.isAr() ? 'English' : 'العربية', act: 'lang', chevron: false }), M.cell({ icon: 'bell', tone: 'info', title: L('Notifications', 'الإشعارات'), go: 'notifications' }), M.cell({ icon: 'swap', tone: 'info', title: L('Switch profile', 'تبديل الملف'), act: 'mxRoles' })], L('Settings', 'الإعدادات'))
      + M.group([M.cell({ icon: 'grid', title: L('Open the committee web portal', 'فتح بوابة اللجنة على الويب'), go: 'committee-home' }), M.cell({ icon: 'compass', title: L('Demo hub', 'مركز العرض'), go: 'hub' })])
      + note(L('Prototype · fictional association and sample data', 'نموذج أولي · جمعية وهمية وبيانات نموذجية')),
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
    id: R, webRole: 'committee', icon: 'users', home: 'home',
    name: T('Building Committee', 'لجنة المبنى'), short: T('Committee', 'اللجنة'),
    persona: { name: T('Samer Khoury', 'سامر خوري'), sub: T('Chair · Al-Masyoun Tower', 'الرئيس · برج الماصيون') },
    tabs: [
      { id: 'home', label: T('Home', 'الرئيسية'), icon: 'home' },
      { id: 'meetings', label: T('Meetings', 'الاجتماعات'), icon: 'calendar' },
      { id: 'expenses', label: T('Finance', 'المالية'), icon: 'wallet' },
      { id: 'maintenance', label: T('Repairs', 'الصيانة'), icon: 'wrench' },
      { id: 'menu', label: T('More', 'المزيد'), icon: 'menu' },
    ],
    more: [
      { id: 'members', label: T('Members', 'الأعضاء'), icon: 'users' },
      { id: 'announcements', label: T('Announcements', 'الإعلانات'), icon: 'megaphone' },
      { id: 'meeting', label: T('Meeting', 'اجتماع'), icon: 'vote' },
      { id: 'decisions', label: T('Decisions', 'القرارات'), icon: 'gavel' },
      { id: 'budget', label: T('Budget', 'الموازنة'), icon: 'pie' },
      { id: 'documents', label: T('Documents', 'المستندات'), icon: 'folder' },
      { id: 'notifications', label: T('Notifications', 'الإشعارات'), icon: 'bell' },
    ],
    screens: {
      home, members, announcements, meetings, decisions: decisionsScreen, expenses, budget, maintenance, documents, menu,
      meeting: (id) => meetingScreen(id),
      notifications: () => notifScreen(),
    },
    notifications: () => [
      { icon: 'vote', tone: 'violet', title: L('Vote open: Elevator B repair', 'التصويت مفتوح: إصلاح المصعد ب'), sub: L('Urgent committee call · started 09:30', 'اجتماع طارئ للجنة · بدأ 09:30'), when: '09:31', go: 'meeting-MT-2613' },
      { icon: 'receipt', tone: 'warn', title: L('New expense to approve', 'مصروف جديد بانتظار الموافقة'), sub: L('Diesel 200 L · ₪640 · from Hiba Nasser', 'سولار 200 لتر · 640 ₪ · من هبة ناصر'), when: '08:50', go: 'expenses' },
      { icon: 'doc', tone: 'info', title: L('Quote received from Jaber Technical', 'تم استلام عرض من جابر الفنية'), sub: L('Booster pump pressure switch · ₪922 incl. VAT', 'مفتاح ضغط مضخة التعزيز · 922 ₪ شاملة الضريبة'), when: L('Yesterday', 'أمس'), go: 'maintenance' },
      { icon: 'calendarCheck', tone: 'mint', title: L('29 units confirmed for the general assembly', '29 وحدة أكدت حضور الهيئة العامة'), sub: L('52.3% of shares — quorum reached', '52.3% من الحصص — اكتمل النصاب'), when: L('Yesterday', 'أمس'), go: 'meeting-MT-2612' },
      { icon: 'megaphone', tone: 'mint', title: L('Water-cut notice read by 47 units', 'إشعار انقطاع المياه قرأته 47 وحدة'), sub: L('Pinned announcement', 'إعلان مثبّت'), when: L('2 days ago', 'قبل يومين'), go: 'announcements' },
    ],
  });
})();
