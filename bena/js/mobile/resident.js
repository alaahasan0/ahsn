/*
 * BENA Mobile — Resident / Tenant (B.mrole id `resident`).
 * Persona: Lina Haddad (p_lina), tenant of Apartment 803, Al-Masyoun Residence Tower.
 * Designed for the phone, not compressed from the web portal: one-thumb tasks
 * (pay, report, follow a repair), native large titles on tab roots, stack
 * navigation with back, bottom sheets for actions, simulated state changes.
 * All data is fictional sample data; payments and messages are simulated.
 */
(function () {
  const B = window.B, M = B.m;
  const { L, tx, esc, icon } = B;
  const ui = B.ui;
  const D = B.data;
  const T = (en, ar) => ({ en, ar });
  const BID = 'BN-RAM-00142', UID = 'BN-RAM-00142-803', ME = 'p_lina';
  const TODAY = '2026-11-25';

  /* ---------------- session state (resets on reload) ---------------- */
  const st = {
    joined: false, photos: [], read: new Set(['an4', 'an5']), seenNotifs: false, msgs: {}, elec: 84, renew: false, docs: [], affected: new Set(), seq: 24519, last: null,
    upcoming: [
      { id: 'RC-26-1201', date: '2026-12-01', kind: 'rent', label: T('Rent — December 2026', 'الإيجار — كانون الأول 2026'), amount: 3200, status: 'upcoming' },
      { id: 'SC-26-1201', date: '2026-12-05', kind: 'charge', label: T('Building service charge — December', 'رسوم خدمات المبنى — كانون الأول'), amount: 180, status: 'upcoming' },
    ],
  };
  const both = (fn) => { const o = B.lang; B.lang = 'en'; const en = fn(); B.lang = 'ar'; const ar = fn(); B.lang = o; return { en, ar }; };
  const stamp = (d, t) => both(() => `${B.dateShort(d)}${t ? ' · ' + t : ''}`);
  const NOW = T('Just now', 'الآن');
  const resetDraft = () => { Object.keys(B.vs).filter((k) => k.startsWith('mrb:')).forEach((k) => delete B.vs[k]); st.photos = []; };

  /* ---------------- helpers ---------------- */
  const bld = () => D.building(BID);
  const unit = () => D.unit(UID);
  const lease = () => D.leaseOfUnit(UID);
  const meName = () => tx(D.person(ME).name);
  const first = () => meName().split(' ')[0];
  const com = () => D.committeeOf(BID);
  const mgr = () => D.org(bld().manager);
  const myReqs = () => D.requests.filter((q) => q.by === ME || (q.building === BID && q.scope === 'common'));
  const isOpen = (q) => !['completed', 'resolved', 'cancelled'].includes(q.status);
  const pays = () => D.residentPayments;
  const dues = () => pays().filter((p) => p.status === 'due' || p.status === 'overdue');
  const payOf = (id) => pays().find((p) => p.id === id) || st.upcoming.find((p) => p.id === id);
  const STEP = { open: 0, new: 0, submitted: 0, quoted: 1, assigned: 1, scheduled: 1, inProgress: 2, completed: 3, resolved: 3, cancelled: -1 };
  const VISIT = { 'MR-24518': '10:00–12:00', 'MR-24477': '09:00–11:00', 'MR-24390': '08:00–12:00' };
  const tagMeta = () => ({ notice: ['alert', 'warn', L('Notice', 'تنبيه')], meeting: ['calendar', 'info', L('Meeting', 'اجتماع')], maintenance: ['wrench', 'mint', L('Maintenance', 'صيانة')], community: ['users', 'violet', L('Community', 'مجتمع')] });
  const greet = () => { const h = B.today.getHours(); return h < 12 ? L('Good morning', 'صباح الخير') : h < 18 ? L('Good afternoon', 'نهارك سعيد') : L('Good evening', 'مساء الخير'); };
  const dayLine = () => `${B.dow(B.today.getDay())} ${B.dateShort(B.today)}`;
  const id = (s) => `<bdi class="id-mono">${esc(s)}</bdi>`;
  const num = (v) => `<span class="mr-num">${v}</span>`;
  const anns = () => D.announcementsOf(BID).slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (a.date < b.date ? 1 : -1));
  const byName = (by) => (D.committees[by] ? tx(D.committees[by].name) : D.org(by) ? tx(D.org(by).name) : '');
  const expenses = () => [
    { label: L('Common electricity', 'كهرباء المناطق المشتركة'), value: 53, color: '#36D6A0', icon: 'zap' },
    { label: L('Cleaning', 'التنظيف'), value: 39, color: '#7FA7C2', icon: 'sparkles' },
    { label: L('Elevators', 'المصاعد'), value: 31, color: '#142B3B', icon: 'elevator' },
    { label: L('Reserve fund', 'صندوق الاحتياط'), value: 25, color: '#C9D6DF', icon: 'shield' },
    { label: L('Water & pumps', 'المياه والمضخات'), value: 17, color: '#F2B35A', icon: 'droplet' },
    { label: L('Security', 'الأمن'), value: 15, color: '#9B8AE0', icon: 'lock' },
  ];

  /* Back-stack so “Back” returns to wherever you came from (tab roots reset it). */
  const stack = [];
  const ROOTS = ['home', 'building', 'requests', 'payments', 'profile', 'welcome'];
  const track = (key, page) => {
    if (ROOTS.includes(page)) { stack.length = 0; stack.push(key); return null; }
    if (stack[stack.length - 1] === key) { /* re-render */ } else if (stack[stack.length - 2] === key) stack.pop(); else stack.push(key);
    return stack[stack.length - 2] || null;
  };

  /* ---------------- styles (prefix mr-) ---------------- */
  B.css(`
  .mr-num { font-family: var(--font-display); font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
  .mr-ava { border-radius: 50%; padding: 0; }
  .mr-ava .avatar { width: 44px; height: 44px; font-size: 15px; box-shadow: 0 0 0 3px #fff, 0 2px 8px rgba(20,43,59,.12); }
  .mr-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--mint-ink); display: block; }
  html[dir="rtl"] .mr-eyebrow { letter-spacing: 0; }
  /* home hero */
  .mr-hero { position: relative; display: block; width: 100%; text-align: start; border-radius: 24px; overflow: hidden; background: var(--navy); color: #fff; min-height: 192px; isolation: isolate; }
  .mr-hero:active { transform: scale(.99); }
  .mr-hero .h-art { position: absolute; inset-block: 0; inset-inline-end: -10px; width: 62%; z-index: -1; }
  .mr-hero .h-art svg { width: 100%; height: 100%; display: block; }
  .mr-hero .h-art::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, var(--navy) 6%, rgba(20,43,59,.55) 46%, rgba(20,43,59,.05) 100%); }
  html[dir="rtl"] .mr-hero .h-art::after { background: linear-gradient(270deg, var(--navy) 6%, rgba(20,43,59,.55) 46%, rgba(20,43,59,.05) 100%); }
  .mr-hero .h-b { display: flex; flex-direction: column; gap: 5px; padding: 20px; max-width: 74%; }
  .mr-hero .mr-eyebrow { color: var(--mint); }
  .mr-hero .h-t { font: 700 21px/1.2 var(--font-display); color: #fff; letter-spacing: -.01em; }
  html[dir="rtl"] .mr-hero .h-t { font-family: var(--font-ar); }
  .mr-hero .h-s { font-size: 14px; color: var(--navy-ink); }
  .mr-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
  .mr-pills span { display: inline-flex; align-items: center; gap: 5px; height: 26px; padding: 0 10px; border-radius: 13px; background: rgba(255,255,255,.12); font-size: 12.5px; font-weight: 600; color: #fff; backdrop-filter: blur(6px); }
  .mr-pills svg { width: 14px; height: 14px; color: var(--mint); }
  .mr-hero .h-id { margin-top: 12px; font-size: 12.5px; color: var(--navy-ink); display: flex; align-items: center; gap: 6px; }
  .mr-hero .h-id svg { width: 15px; height: 15px; color: var(--mint); }
  .mr-hero .h-id .id-mono { color: #fff; }
  /* due card */
  .mr-due { background: #fff; border: 1px solid var(--line-2); border-radius: 22px; overflow: hidden; }
  .mr-due .d-top { display: flex; align-items: center; gap: 14px; padding: 18px 18px 16px; }
  .mr-due .d-amt { font-size: 34px; line-height: 1.05; margin: 8px 0 4px; display: block; }
  .mr-due .d-s { font-size: 14px; color: var(--text-2); }
  .mr-due .d-next { display: flex; align-items: center; gap: 12px; width: 100%; text-align: start; padding: 14px 18px; border-top: 1px solid var(--line-2); background: var(--surface-2); font-size: 14.5px; min-height: 52px; }
  .mr-due .d-next > svg:first-child { width: 20px; height: 20px; color: var(--text-3); flex: none; }
  .mr-due .d-next .mc-c { width: 18px; height: 18px; color: #B6C2BD; }
  .mr-due.ok .d-top { background: var(--mint-50); }
  .mr-tick { width: 48px; height: 48px; border-radius: 16px; display: grid; place-items: center; background: var(--mint); color: var(--navy); flex: none; }
  .mr-tick svg { width: 24px; height: 24px; }
  /* request card */
  .mr-req { display: flex; flex-direction: column; gap: 14px; width: 100%; text-align: start; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 16px; }
  .mr-req:active { background: #F7FAF9; }
  .mr-req .r-h { display: flex; gap: 12px; align-items: flex-start; }
  .mr-ci { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; background: var(--mint-50); color: var(--mint-ink); flex: none; }
  .mr-ci svg { width: 22px; height: 22px; }
  .mr-ci.done { background: var(--line-2); color: var(--text-2); }
  .mr-req .r-t { font-size: 16px; font-weight: 600; line-height: 1.3; display: block; }
  .mr-req .r-s { font-size: 13px; color: var(--text-3); margin-top: 3px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
  .mr-req .r-f { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--text-2); }
  .mr-req .r-f svg { width: 16px; height: 16px; color: var(--mint-ink); flex: none; }
  .mr-prog { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
  .mr-prog i { height: 5px; border-radius: 5px; background: var(--line); display: block; }
  .mr-prog i.on { background: var(--mint); }
  .mr-prog i.cur { background: linear-gradient(90deg, var(--mint) 55%, var(--line) 55%); }
  html[dir="rtl"] .mr-prog i.cur { background: linear-gradient(270deg, var(--mint) 55%, var(--line) 55%); }
  .mr-prog span { font-size: 11.5px; color: var(--text-3); font-weight: 600; margin-top: 6px; display: block; }
  .mr-prog span.on { color: var(--ink); }
  /* announcement card */
  .mr-ann { display: flex; gap: 14px; width: 100%; text-align: start; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 16px; position: relative; }
  .mr-ann:active { background: #F7FAF9; }
  .mr-ann .a-d { width: 50px; flex: none; text-align: center; border-radius: 14px; background: var(--surface-2); border: 1px solid var(--line-2); padding: 8px 0 7px; align-self: flex-start; }
  .mr-ann .a-d b { display: block; font: 700 20px/1 var(--font-display); }
  .mr-ann .a-d span { font-size: 11.5px; color: var(--text-3); font-weight: 600; }
  .mr-ann .a-b { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
  .mr-ann .a-t { font-size: 16px; font-weight: 600; line-height: 1.3; }
  .mr-ann .a-x { font-size: 14px; color: var(--text-2); line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .mr-ann .a-m { font-size: 12.5px; color: var(--text-3); }
  .mr-ann.pin { background: #FFFBF3; border-color: #F4E2BF; }
  .mr-ann.pin .a-d { background: #fff; border-color: #F4E2BF; }
  .mr-unread { position: absolute; top: 18px; inset-inline-end: 16px; width: 9px; height: 9px; border-radius: 50%; background: var(--mint); box-shadow: 0 0 0 3px var(--mint-50); }
  .mr-tags { display: flex; gap: 6px; flex-wrap: wrap; padding-inline-end: 18px; }
  /* generic */
  .mr-note { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; color: var(--text-2); line-height: 1.45; padding: 0 6px; }
  .mr-note svg { width: 16px; height: 16px; flex: none; margin-top: 2px; color: var(--text-3); }
  .mr-soft { display: flex; gap: 14px; align-items: center; width: 100%; text-align: start; padding: 16px; border-radius: 20px; background: var(--mint-50); border: 1px solid var(--mint-100); }
  .mr-soft .s-i { width: 44px; height: 44px; border-radius: 14px; background: #fff; color: var(--mint-ink); display: grid; place-items: center; flex: none; }
  .mr-soft .s-i svg { width: 22px; height: 22px; }
  .mr-soft b { font-size: 15.5px; display: block; }
  .mr-soft small { font-size: 13.5px; color: #2D6B55; display: block; margin-top: 2px; line-height: 1.4; }
  .mr-soft .mc-c { width: 18px; height: 18px; color: #7DBFA6; flex: none; }
  .mr-stack { display: flex; height: 10px; border-radius: 6px; overflow: hidden; gap: 2px; }
  .mr-stack i { display: block; height: 100%; }
  .mr-sw { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-inline-end: 8px; vertical-align: 1px; }
  .mr-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 13px; color: var(--text-2); }
  .mr-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .mr-legend i { width: 9px; height: 9px; border-radius: 3px; display: inline-block; }
  .mr-stats { display: grid; grid-template-columns: repeat(4, 1fr); background: #fff; border: 1px solid var(--line-2); border-radius: 18px; padding: 14px 4px; }
  .mr-stats div { text-align: center; display: flex; flex-direction: column; gap: 2px; }
  .mr-stats div + div { border-inline-start: 1px solid var(--line-2); }
  .mr-stats b { font: 700 20px/1.1 var(--font-display); font-variant-numeric: tabular-nums; }
  .mr-stats span { font-size: 12px; color: var(--text-3); font-weight: 600; }
  .mr-bhero { position: relative; border-radius: 24px; overflow: hidden; height: 236px; background: var(--navy); }
  .mr-bhero > svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .mr-bhero::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(13,31,43,0) 22%, rgba(13,31,43,.72) 58%, rgba(13,31,43,.96) 100%); }
  .mr-bhero .bh-b { position: absolute; inset-inline: 18px; bottom: 16px; z-index: 1; color: #fff; display: flex; flex-direction: column; gap: 6px; }
  .mr-bhero h2 { color: #fff; font-size: 23px; line-height: 1.15; }
  .mr-bhero .bh-a { font-size: 13.5px; color: var(--navy-ink); display: flex; gap: 6px; align-items: center; }
  .mr-bhero .bh-a svg { width: 15px; height: 15px; color: var(--mint); flex: none; }
  .mr-bhero .badge { align-self: flex-start; }
  .mr-tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .mr-tile { background: #fff; border: 1px solid var(--line-2); border-radius: 18px; padding: 14px; display: flex; flex-direction: column; gap: 8px; text-align: start; min-height: 104px; }
  .mr-tile > svg { width: 24px; height: 24px; color: var(--mint-ink); }
  .mr-tile b { font-size: 15px; line-height: 1.25; }
  .mr-tile span { font-size: 12.5px; color: var(--text-2); line-height: 1.35; }
  .mr-tile.warn > svg { color: var(--warn); }
  .mr-live { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--text-3); }
  .mr-live i { width: 7px; height: 7px; border-radius: 50%; background: var(--mint); animation: mrPulse 2s infinite; }
  @keyframes mrPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(54,214,160,.5); } 50% { box-shadow: 0 0 0 5px rgba(54,214,160,0); } }
  .mr-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex: none; }
  .mr-dot.ok { background: var(--ok); } .mr-dot.bad { background: var(--bad); } .mr-dot.warn { background: #E9A23B; }
  .mr-plan { background: #fff; border: 1px solid var(--line-2); border-radius: 22px; overflow: hidden; }
  .mr-plan .p-art { aspect-ratio: 4 / 3; background: var(--surface-2); }
  .mr-plan .p-art svg { width: 100%; height: 100%; display: block; }
  .mr-specs { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--line-2); }
  .mr-specs div { padding: 12px 8px; text-align: center; display: flex; flex-direction: column; gap: 3px; align-items: center; }
  .mr-specs div:nth-child(n+4) { border-top: 1px solid var(--line-2); }
  .mr-specs div:not(:nth-child(3n+1)) { border-inline-start: 1px solid var(--line-2); }
  .mr-specs svg { width: 18px; height: 18px; color: var(--text-3); }
  .mr-specs b { font-size: 15.5px; font-variant-numeric: tabular-nums; }
  .mr-specs span { font-size: 12px; color: var(--text-3); }
  .mr-kv { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 12px; }
  .mr-kv div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .mr-kv span { font-size: 12.5px; color: var(--text-3); font-weight: 500; }
  .mr-kv b { font-size: 15.5px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
  .mr-term { display: flex; flex-direction: column; gap: 8px; }
  .mr-term .t-row { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-3); font-weight: 600; }
  .mr-card-h { display: flex; align-items: flex-start; gap: 12px; }
  .mr-card-h > .mc-c { width: 18px; height: 18px; color: #B6C2BD; flex: none; align-self: center; }
  .mr-card-h h3 { font-size: 17px; line-height: 1.3; }
  .mr-card-h p { font-size: 13.5px; color: var(--text-2); margin-top: 2px; }
  .mr-actions { display: flex; gap: 10px; }
  .mr-actions .mx-btn { flex: 1; }
  .mr-id-note { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 14px; background: var(--surface-2); border: 1px dashed #C9D5D0; font-size: 13px; color: var(--text-2); line-height: 1.45; }
  .mr-id-note svg { width: 17px; height: 17px; color: var(--text-3); flex: none; margin-top: 1px; }
  /* balance (payments) */
  .mr-bal { background: var(--navy); color: var(--navy-ink); border-radius: 24px; padding: 20px; display: flex; flex-direction: column; gap: 14px; position: relative; overflow: hidden; }
  .mr-bal::before { content: ""; position: absolute; width: 220px; height: 220px; border-radius: 50%; inset-inline-end: -70px; top: -90px; background: radial-gradient(circle, rgba(54,214,160,.28), rgba(54,214,160,0) 70%); }
  .mr-bal > * { position: relative; }
  .mr-bal .b-l { font-size: 14px; font-weight: 600; display: flex; gap: 8px; align-items: center; }
  .mr-bal .b-l svg { width: 18px; height: 18px; color: var(--mint); flex: none; }
  .mr-pill svg { width: 16px; height: 16px; }
  .mr-bal .b-v { font-size: 42px; color: #fff; line-height: 1; }
  .mr-bal .b-s { font-size: 13.5px; }
  .mr-bal .mx-btn.ghost { background: rgba(255,255,255,.1); color: #fff; border-color: rgba(255,255,255,.16); }
  /* receipt */
  .mr-rcpt { border-radius: 20px; border: 1px solid var(--line); background: #fff; overflow: hidden; }
  .mr-rcpt .rc-top { padding: 22px 18px 18px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; background: var(--surface-2); border-bottom: 1px dashed #C9D5D0; }
  .mr-rcpt .rc-v { font-size: 38px; line-height: 1.05; }
  .mr-rcpt .rc-rows { padding: 6px 18px 14px; }
  .mr-rcpt .rc-rows div { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--line-2); font-size: 14px; }
  .mr-rcpt .rc-rows div:last-child { border-bottom: 0; }
  .mr-rcpt .rc-rows span { color: var(--text-2); }
  .mr-rcpt .rc-rows b { text-align: end; font-weight: 600; }
  .mr-rcpt .rc-qr { width: 84px; height: 84px; margin: 0 auto 16px; }
  .mr-rcpt .rc-qr svg { width: 100%; height: 100%; }
  /* options (radio rows in sheets) */
  .mr-opts { display: flex; flex-direction: column; gap: 8px; }
  .mr-opt { display: flex; align-items: center; gap: 12px; padding: 12px 14px; min-height: 58px; border-radius: 16px; border: 1.5px solid var(--line); background: #fff; cursor: pointer; }
  .mr-opt input { position: absolute; opacity: 0; pointer-events: none; }
  .mr-opt .o-i { width: 36px; height: 36px; border-radius: 10px; background: var(--line-2); display: grid; place-items: center; color: var(--navy); flex: none; }
  .mr-opt .o-i svg { width: 19px; height: 19px; }
  .mr-opt .o-b { flex: 1; min-width: 0; }
  .mr-opt b { font-size: 15px; display: block; }
  .mr-opt small { font-size: 13px; color: var(--text-2); }
  .mr-opt .o-r { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #C3CEC9; flex: none; display: grid; place-items: center; }
  .mr-opt:has(input:checked) { border-color: var(--mint); background: var(--mint-50); }
  .mr-opt:has(input:checked) .o-r { border-color: var(--mint-ink); background: var(--mint-ink); box-shadow: inset 0 0 0 4px #fff; }
  .mr-opt:has(input:focus-visible) { outline: 2px solid var(--mint-ink); outline-offset: 2px; }
  .mr-amts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .mr-amts .mr-opt { justify-content: center; text-align: center; }
  .mr-sheet-amt { text-align: center; padding: 6px 0 2px; }
  .mr-sheet-amt b { font-size: 40px; line-height: 1.05; display: block; }
  .mr-sheet-amt span { font-size: 14px; color: var(--text-2); }
  .mr-toggle { display: flex; align-items: center; gap: 12px; min-height: 52px; font-size: 15px; font-weight: 500; }
  .mr-toggle span { flex: 1; }
  .mr-toggle input { appearance: none; -webkit-appearance: none; width: 51px; height: 31px; border-radius: 16px; background: #DDE5E2; position: relative; transition: background .2s; flex: none; cursor: pointer; }
  .mr-toggle input::after { content: ""; position: absolute; top: 2px; inset-inline-start: 2px; width: 27px; height: 27px; border-radius: 50%; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,.18); transition: inset-inline-start .2s var(--ease); }
  .mr-toggle input:checked { background: var(--mint); }
  .mr-toggle input:checked::after { inset-inline-start: 22px; }
  /* request detail */
  .mr-rq-h { display: flex; flex-direction: column; gap: 12px; }
  .mr-rq-h .q-t { font-size: 22px; line-height: 1.2; letter-spacing: -.01em; }
  .mr-rq-h .q-m { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  .mr-visit { display: flex; gap: 14px; align-items: center; padding: 16px; border-radius: 20px; background: var(--navy); color: var(--navy-ink); }
  .mr-visit .v-d { width: 56px; flex: none; text-align: center; background: rgba(255,255,255,.08); border-radius: 14px; padding: 8px 0; }
  .mr-visit .v-d small { display: block; font-size: 11.5px; font-weight: 700; color: var(--mint); text-transform: uppercase; }
  .mr-visit .v-d b { display: block; font: 700 22px/1.1 var(--font-display); color: #fff; }
  .mr-visit .v-b { flex: 1; min-width: 0; }
  .mr-visit .v-b b { color: #fff; font-size: 16px; display: block; }
  .mr-visit .v-b span { font-size: 13.5px; }
  .mr-visit .mx-btn { background: rgba(255,255,255,.1); color: #fff; border-color: rgba(255,255,255,.16); }
  .mr-tl { display: flex; flex-direction: column; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 16px 16px 4px; }
  .mr-tl .t { display: flex; gap: 14px; position: relative; padding-bottom: 16px; }
  .mr-tl .t::before { content: ""; position: absolute; inset-inline-start: 11px; top: 26px; bottom: 2px; width: 2px; background: var(--line); border-radius: 2px; }
  .mr-tl .t:last-child::before { display: none; }
  .mr-tl .t.done::before { background: var(--mint); }
  .mr-tl .t-i { width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--line); background: #fff; display: grid; place-items: center; flex: none; }
  .mr-tl .t-i svg { width: 13px; height: 13px; }
  .mr-tl .t.done .t-i { background: var(--mint); border-color: var(--mint); color: var(--navy); }
  .mr-tl .t.cur .t-i { border-color: var(--mint-ink); box-shadow: 0 0 0 4px var(--mint-50); }
  .mr-tl .t.cur .t-i::after { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--mint-ink); }
  .mr-tl b { font-size: 15px; display: block; line-height: 1.3; }
  .mr-tl .t:not(.done):not(.cur) b { color: var(--text-3); font-weight: 600; }
  .mr-tl span { font-size: 13px; color: var(--text-2); }
  .mr-chat { display: flex; flex-direction: column; gap: 8px; }
  .mr-msg { max-width: 84%; display: flex; flex-direction: column; gap: 3px; }
  .mr-msg .m-who { font-size: 12px; font-weight: 600; color: var(--text-3); padding: 0 12px; }
  .mr-msg .m-b { padding: 10px 14px; border-radius: 20px; background: #fff; border: 1px solid var(--line-2); font-size: 15px; line-height: 1.4; border-end-start-radius: 6px; }
  .mr-msg .m-t { font-size: 11.5px; color: var(--text-3); padding: 0 12px; }
  .mr-msg.me { align-self: flex-end; align-items: flex-end; }
  .mr-msg.me .m-b { background: var(--navy); color: #fff; border-color: var(--navy); border-end-start-radius: 20px; border-end-end-radius: 6px; }
  .mr-compose { display: flex; gap: 8px; align-items: center; background: #fff; border: 1px solid var(--line); border-radius: 26px; padding: 4px 4px 4px 16px; }
  html[dir="rtl"] .mr-compose { padding: 4px 16px 4px 4px; }
  .mr-compose input { flex: 1; min-width: 0; border: 0; outline: none; font-size: 16px; background: transparent; min-height: 42px; }
  .mr-compose button { width: 42px; height: 42px; border-radius: 50%; background: var(--mint); color: var(--navy); display: grid; place-items: center; flex: none; }
  .mr-compose button svg { width: 19px; height: 19px; }
  html[dir="rtl"] .mr-compose button svg { transform: scaleX(-1); }
  .mr-rate { display: flex; gap: 6px; justify-content: center; }
  .mr-rate button { width: 48px; height: 48px; display: grid; place-items: center; color: #D9E1DE; border-radius: 14px; }
  .mr-rate button svg { width: 32px; height: 32px; }
  .mr-rate button.on { color: #E9A23B; }
  .mr-photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .mr-photos .mx-photo { border-radius: 16px; }
  .mr-person { display: flex; align-items: center; gap: 12px; }
  .mr-person .avatar { width: 48px; height: 48px; font-size: 16px; }
  .mr-person b { font-size: 16px; display: block; }
  .mr-person small { font-size: 13px; color: var(--text-2); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
  .mr-person .stars svg { width: 13px; height: 13px; }
  .mr-round { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: var(--mint-50); color: var(--mint-ink); flex: none; }
  .mr-round svg { width: 20px; height: 20px; }
  /* services & booking */
  .mr-cats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .mr-cat { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; min-height: 100px; padding: 12px 6px; border-radius: 18px; background: #fff; border: 1.5px solid var(--line-2); font-size: 13.5px; font-weight: 600; text-align: center; line-height: 1.25; }
  .mr-cat .c-i { width: 44px; height: 44px; border-radius: 14px; background: var(--mint-50); color: var(--mint-ink); display: grid; place-items: center; }
  .mr-cat .c-i svg { width: 23px; height: 23px; }
  .mr-cat.on { border-color: var(--mint); background: var(--mint-50); }
  .mr-cat.on .c-i { background: var(--mint); color: var(--navy); }
  .mr-cat:active { transform: scale(.97); }
  .mr-prov { display: flex; flex-direction: column; gap: 12px; width: 100%; text-align: start; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 16px; }
  .mr-prov .p-h { display: flex; gap: 12px; align-items: center; }
  .mr-prov .p-l { width: 48px; height: 48px; border-radius: 14px; background: var(--navy); color: var(--mint); display: grid; place-items: center; font: 700 16px/1 var(--font-display); flex: none; }
  .mr-prov b { font-size: 16px; display: block; }
  .mr-prov small { font-size: 13px; color: var(--text-2); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-top: 2px; }
  .mr-prov .p-f { display: flex; gap: 8px; flex-wrap: wrap; }
  .mr-meta { display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 10px; border-radius: 14px; background: var(--surface-2); border: 1px solid var(--line-2); font-size: 12.5px; font-weight: 600; color: var(--text-2); }
  .mr-meta svg { width: 14px; height: 14px; }
  .mr-flowhead { display: flex; flex-direction: column; gap: 14px; padding: 4px 4px 0; }
  .mr-flowhead h2 { font-size: 26px; line-height: 1.15; letter-spacing: -.02em; }
  .mr-flowhead p { font-size: 15px; color: var(--text-2); margin-top: -6px; }
  .mr-flowhead .f-k { font-size: 13px; font-weight: 700; color: var(--mint-ink); }
  .mx-screen:has(.mr-flow) > div { min-height: 100%; display: flex; flex-direction: column; }
  .mx-screen:has(.mr-flow) .mx-body { flex: 1; }
  .mr-flowbar { margin-top: auto; position: sticky; bottom: 0; margin-inline: -16px; margin-bottom: -28px; padding: 14px 16px 30px; background: linear-gradient(to top, var(--bg) 72%, rgba(244,247,246,0)); display: flex; flex-direction: column; gap: 8px; z-index: 3; }
  .mr-seg2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .mr-choice { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; text-align: start; padding: 14px; border-radius: 18px; border: 1.5px solid var(--line); background: #fff; min-height: 92px; }
  .mr-choice svg { width: 22px; height: 22px; color: var(--text-2); }
  .mr-choice b { font-size: 15px; }
  .mr-choice span { font-size: 12.5px; color: var(--text-2); line-height: 1.35; }
  .mr-choice.on { border-color: var(--mint); background: var(--mint-50); }
  .mr-choice.on svg { color: var(--mint-ink); }
  .mr-pills2 { display: flex; gap: 8px; flex-wrap: wrap; }
  .mr-pill { min-height: 40px; padding: 0 16px; border-radius: 20px; border: 1.5px solid var(--line); background: #fff; font-size: 14.5px; font-weight: 600; color: var(--text-2); display: inline-flex; align-items: center; gap: 6px; }
  .mr-pill.on { border-color: var(--navy); background: var(--navy); color: #fff; }
  .mr-pill.on.urgent { border-color: var(--bad); background: var(--bad); }
  .mr-days { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; margin-inline: -16px; padding: 2px 16px; }
  .mr-days::-webkit-scrollbar { display: none; }
  .mr-day { flex: none; width: 62px; height: 76px; border-radius: 18px; border: 1.5px solid var(--line); background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; }
  .mr-day small { font-size: 12px; font-weight: 600; color: var(--text-3); }
  .mr-day b { font: 700 22px/1.1 var(--font-display); }
  .mr-day.on { background: var(--navy); border-color: var(--navy); color: #fff; }
  .mr-day.on small { color: var(--mint); }
  .mr-slots { display: flex; flex-direction: column; gap: 8px; }
  .mr-slot { display: flex; align-items: center; gap: 12px; min-height: 58px; padding: 0 16px; border-radius: 16px; border: 1.5px solid var(--line); background: #fff; text-align: start; }
  .mr-slot svg { width: 20px; height: 20px; color: var(--text-3); }
  .mr-slot b { flex: 1; font-size: 15px; }
  .mr-slot span { font-size: 13px; color: var(--text-2); }
  .mr-slot.on { border-color: var(--mint); background: var(--mint-50); }
  .mr-slot.on svg { color: var(--mint-ink); }
  .mr-label { font-size: 15px; font-weight: 700; padding: 0 4px; }
  .mr-input { width: 100%; min-height: 52px; border-radius: 16px; border: 1px solid var(--line); background: #fff; padding: 0 16px; font-size: 16px; color: var(--ink); }
  .mr-input.ta { min-height: 120px; padding: 14px 16px; resize: none; line-height: 1.45; }
  .mr-input:focus { outline: none; border-color: var(--mint); box-shadow: 0 0 0 4px rgba(54,214,160,.18); }
  .mr-ph { position: relative; }
  .mr-ph .mx-photo { width: 100%; }
  .mr-ph .x { position: absolute; top: 6px; inset-inline-end: 6px; width: 28px; height: 28px; border-radius: 50%; background: rgba(13,31,43,.7); color: #fff; display: grid; place-items: center; }
  .mr-ph .x svg { width: 15px; height: 15px; }
  .mr-ph button.mx-photo { cursor: pointer; }
  .mr-done { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; padding: 30px 8px 8px; }
  .mr-done .s-i { width: 96px; height: 96px; border-radius: 50%; background: var(--mint); color: var(--navy); display: grid; place-items: center; animation: pop .5s var(--ease); box-shadow: 0 0 0 12px var(--mint-50); }
  .mr-done .s-i svg { width: 46px; height: 46px; }
  .mr-done h2 { font-size: 26px; margin-top: 14px; }
  .mr-done p { color: var(--text-2); font-size: 15px; max-width: 34ch; }
  /* welcome */
  .mx-phone:has(.mr-wel) { --mx-top: var(--navy); }
  .mx-phone:has(.mr-wel) .mx-status { color: #fff; }
  .mx-phone:has(.mr-wel) .mx-home-ind { background: rgba(20,43,59,.5); }
  .mr-wel { min-height: 100%; display: flex; flex-direction: column; background: var(--navy); }
  .mr-wel .w-art { position: relative; height: 300px; flex: none; }
  .mr-wel .w-art > svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .mr-wel .w-art::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,43,59,.1), rgba(20,43,59,.2) 50%, rgba(20,43,59,.95)); }
  .mr-wel .w-hi { position: absolute; inset-inline: 22px; bottom: 44px; z-index: 1; display: flex; flex-direction: column; gap: 10px; }
  .mr-wel .w-hi h1 { color: #fff; font-size: 31px; line-height: 1.12; letter-spacing: -.02em; }
  .mr-wel .w-hi p { color: var(--navy-ink); font-size: 15px; }
  .mr-wel .w-body { flex: 1; background: var(--bg); border-radius: 28px 28px 0 0; margin-top: -26px; position: relative; z-index: 2; padding: 24px 16px 34px; display: flex; flex-direction: column; gap: 18px; }
  .mr-invite { background: #fff; border: 1px solid var(--line-2); border-radius: 22px; overflow: hidden; }
  .mr-invite .i-top { display: flex; gap: 14px; align-items: center; padding: 16px; }
  .mr-invite .i-art { width: 64px; height: 64px; border-radius: 16px; overflow: hidden; flex: none; background: var(--navy); }
  .mr-invite .i-art svg { width: 100%; height: 100%; display: block; }
  .mr-invite .mx-group { border: 0; border-radius: 0; border-top: 1px solid var(--line-2); }
  .mr-invite .i-top b { font-size: 17px; display: block; line-height: 1.25; }
  .mr-invite .i-top small { font-size: 13px; color: var(--text-2); display: block; margin-top: 3px; }
  .mr-benefits { display: flex; flex-direction: column; gap: 14px; padding: 4px 6px; }
  .mr-benefits div { display: flex; gap: 14px; align-items: center; }
  .mr-benefits .b-i { width: 40px; height: 40px; border-radius: 12px; background: var(--navy); color: var(--mint); display: grid; place-items: center; flex: none; }
  .mr-benefits .b-i svg { width: 20px; height: 20px; }
  .mr-benefits b { font-size: 15px; display: block; }
  .mr-benefits span { font-size: 13.5px; color: var(--text-2); }
  /* profile */
  .mr-me { display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; padding: 6px 0 2px; }
  .mr-me .avatar { width: 88px; height: 88px; font-size: 28px; box-shadow: 0 0 0 4px #fff, 0 6px 20px rgba(20,43,59,.12); }
  .mr-me h2 { font-size: 24px; margin-top: 6px; }
  .mr-me p { font-size: 14.5px; color: var(--text-2); }
  .mr-foot { text-align: center; font-size: 12.5px; color: var(--text-3); line-height: 1.5; padding: 0 12px; }
  .mr-doc { aspect-ratio: 3 / 3.6; max-height: 330px; margin: 0 auto; width: 76%; background: #fff; border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 10px 30px rgba(20,43,59,.1); padding: 22px 20px; display: flex; flex-direction: column; gap: 9px; }
  .mr-doc i { display: block; height: 7px; border-radius: 4px; background: #E8EEEB; }
  .mr-doc .d-h { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .mr-doc .d-h svg { width: 22px; height: 22px; color: var(--mint-ink); }
  .mr-doc .d-h b { font-size: 12px; }
  .mr-doc .d-s { margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; }
  .mr-doc .d-s em { font-style: italic; font-family: Georgia, serif; color: var(--navy); font-size: 15px; }
  .mr-doc .d-s span { width: 46px; height: 46px; border-radius: 50%; border: 2px solid var(--mint); display: grid; place-items: center; color: var(--mint-ink); }
  .mr-doc .d-s span svg { width: 22px; height: 22px; }
  `);

  /* ---------------- shared pieces ---------------- */
  const prog = (q) => {
    const s = STEP[q.status] ?? 0;
    const labels = [L('Sent', 'أُرسل'), L('Assigned', 'أُسند'), L('In progress', 'قيد التنفيذ'), L('Done', 'تم')];
    return `<div class="mr-prog">${labels.map((_, i) => `<i class="${i < s || (i === s && s === 3) ? 'on' : i === s ? 'cur' : ''}"></i>`).join('')}${labels.map((l, i) => `<span class="${i <= s ? 'on' : ''}">${l}</span>`).join('')}</div>`;
  };
  const nextLine = (q) => {
    if (q.status === 'cancelled') return [icon('x'), L('Cancelled', 'أُلغي')];
    if (q.status === 'completed' || q.status === 'resolved') return [icon('checkCircle'), L(`Completed ${B.dateShort(q.closed || TODAY)}`, `اكتمل ${B.dateShort(q.closed || TODAY)}`)];
    if (q.visit) { const w = whenWord(q.visit); return [icon('calendar'), L(`Technician visit ${w.en}${VISIT[q.id] ? ` · ${VISIT[q.id]}` : ''}`, `زيارة الفني ${w.ar}${VISIT[q.id] ? ` · ${VISIT[q.id]}` : ''}`)]; }
    return [icon('clock'), L(`Reported ${B.ago(q.created).toLowerCase()} · waiting for a provider`, `أُبلغ ${B.ago(q.created)} · بانتظار تعيين مزوّد`)];
  };
  const whenWord = (d) => { const n = B.daysFromToday(d); return n === 0 ? { en: 'today', ar: 'اليوم' } : n === 1 ? { en: 'tomorrow', ar: 'غداً' } : { en: B.dateShort(d), ar: B.dateShort(d) }; };
  const reqCard = (q) => {
    const c = D.cat(q.cat);
    const done = !isOpen(q);
    const [ni, nt] = nextLine(q);
    return `<button class="mr-req" data-go="request-${q.id}">
      <span class="r-h"><span class="mr-ci ${done ? 'done' : ''}">${icon(c.icon)}</span><span style="flex:1;min-width:0"><span class="r-t">${esc(tx(q.title))}</span><span class="r-s">${id(q.id)}<span>·</span><span>${q.scope === 'common' ? L('Common area', 'منطقة مشتركة') : L('My unit', 'وحدتي')}</span></span></span>${ui.status(q.status)}</span>
      ${done ? '' : prog(q)}
      <span class="r-f">${ni}<span>${nt}</span></span>
    </button>`;
  };
  const annCard = (a) => {
    const d = new Date(a.date + 'T12:00:00');
    const m = tagMeta()[a.tag] || tagMeta().notice;
    return `<button class="mr-ann ${a.pinned ? 'pin' : ''}" data-act="mrAnn" data-arg="${a.id}">
      <span class="a-d"><b>${d.getDate()}</b><span>${B.mon(d.getMonth())}</span></span>
      <span class="a-b"><span class="mr-tags">${ui.badge(m[2], m[1], m[0])}${a.pinned ? ui.badge(L('Pinned', 'مثبّت'), 'navy', 'flag') : ''}</span><span class="a-t">${esc(tx(a.title))}</span><span class="a-x">${esc(tx(a.body))}</span><span class="a-m">${esc(byName(a.by))}</span></span>
      ${st.read.has(a.id) ? '' : '<span class="mr-unread"></span>'}
    </button>`;
  };
  const note = (text, ic = 'info') => `<div class="mr-note">${icon(ic)}<span>${text}</span></div>`;
  const idNote = () => `<div class="mr-id-note">${icon('fingerprint')}<span>${L('The BENA ID is a digital reference identity for coordination — it is not proof of legal ownership or tenancy.', 'رقم بينا هوية مرجعية رقمية للتنسيق — وليس إثباتاً قانونياً للملكية أو الإيجار.')}</span></div>`;
  const payIcon = (p) => (p.kind === 'rent' ? 'key' : p.kind === 'special' ? 'sparkles' : 'building');
  const payee = (p) => (p.kind === 'rent' ? L('Khaled Mansour · collected by Arkan', 'خالد منصور · تحصيل عبر أركان') : tx(com().name));
  const radio = (name, value, title, sub, ic, checked) => `<label class="mr-opt"><input type="radio" name="${name}" value="${esc(value)}" ${checked ? 'checked' : ''}>${ic ? `<span class="o-i">${icon(ic)}</span>` : ''}<span class="o-b"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span><span class="o-r"></span></label>`;
  const unreadAnns = () => anns().filter((a) => !st.read.has(a.id)).length;

  /* ---------------- notifications ---------------- */
  const notifs = () => {
    const l = lease();
    const days = B.daysFromToday(l.end);
    const due = dues();
    return [
      due.length && { icon: 'wallet', tone: 'warn', title: L(`${B.money(B.sum(due, (p) => p.amount))} building charge is due`, `رسوم مبنى مستحقة بقيمة ${B.money(B.sum(due, (p) => p.amount))}`), sub: L('November service charge · tap to pay', 'رسوم خدمات تشرين الثاني · اضغط للدفع'), when: L('Today', 'اليوم'), go: 'payments', fresh: true },
      { icon: 'wrench', tone: 'mint', title: L('Ali visits tomorrow, 10:00–12:00', 'يزورك علي غداً، 10:00–12:00'), sub: L('Kitchen sink leak · MR-24518', 'تسريب مغسلة المطبخ · MR-24518'), when: L('2 h ago', 'قبل ساعتين'), go: 'request-MR-24518', fresh: true },
      { icon: 'megaphone', tone: 'info', title: tx(D.announcements[0].title), sub: L('Pinned by the owners’ association', 'ثبّتته جمعية المالكين'), when: B.ago('2026-11-23'), go: 'announcements', fresh: true },
      { icon: 'contract', tone: 'violet', title: L(`Your lease ends in ${days} days`, `ينتهي عقد إيجارك خلال ${days} يوماً`), sub: L('Ask your landlord about renewal', 'اسأل المالك عن التجديد'), when: L('This week', 'هذا الأسبوع'), go: 'unit' },
      { icon: 'calendar', tone: 'info', title: L('General assembly on 4 December', 'الهيئة العامة في 4 كانون الأول'), sub: L('Owners vote; residents may attend', 'يصوّت المالكون؛ ويمكن للسكان الحضور'), when: B.ago('2026-11-18'), go: 'announcements' },
      { icon: 'receipt', tone: 'mint', title: L('November rent received', 'تم استلام إيجار تشرين الثاني'), sub: `${B.money(3200)} · RC-26-1101`, when: B.dateShort('2026-11-01'), go: 'payments' },
    ].filter(Boolean);
  };

  /* =====================================================================
   * Screens
   * ===================================================================== */
  const S = {};

  /* 1 · Welcome / join confirmation */
  S.welcome = () => {
    const b = bld(), u = unit(), l = lease();
    const body = `<div class="mr-wel">
      <div class="w-art">${B.art.facade(142, { type: 'residential', floors: 14, sky: 'navy' })}
        <div class="w-hi">${B.logo(40)}<h1>${L(`Welcome home,<br>${first()}.`, `أهلاً بكِ في بيتك،<br>${first()}.`)}</h1><p>${L('Your building is ready for you on BENA.', 'مبناك جاهز لكِ على بينا.')}</p></div></div>
      <div class="w-body">
        <div><span class="mr-eyebrow">${L('Invitation · Arkan Property Management', 'دعوة · أركان لإدارة العقارات')}</span><div style="font-size:21px;font-weight:700;margin-top:6px;line-height:1.25">${L('Confirm your home to join the building', 'أكّدي منزلك للانضمام إلى المبنى')}</div></div>
        <div class="mr-invite">
          <div class="i-top"><span class="i-art">${B.art.facade(142, { type: 'residential', floors: 14, sky: 'day' })}</span><span style="min-width:0"><b>${esc(tx(b.name))}</b><small>${esc(tx(b.address))}</small><small>${id(b.id)}</small></span></div>
          ${M.group([
            M.cell({ icon: 'door', tone: 'mint', title: L(`Apartment ${u.number} · Floor ${u.floor}`, `شقة ${u.number} · الطابق ${u.floor}`), sub: L(`${u.area} m² · ${u.beds} bedrooms`, `${u.area} م² · ${u.beds} غرف نوم`) }),
            M.cell({ icon: 'key', tone: 'mint', title: L('You are the tenant', 'أنتِ المستأجرة'), sub: L(`Confirmed by the owner, ${D.pname(l.owner)}`, `أكّدها المالك، ${D.pname(l.owner)}`), badge: ui.badge(L('Confirmed', 'مؤكّد'), 'ok', 'check') }),
            M.cell({ icon: 'contract', tone: 'mint', title: L(`Lease until ${B.date(l.end)}`, `العقد حتى ${B.date(l.end)}`), sub: id(l.id) }),
          ])}
        </div>
        <div class="mr-benefits">
          <div><span class="b-i">${icon('wallet')}</span><span><b>${L('Pay rent & building charges', 'ادفعي الإيجار ورسوم المبنى')}</b><span>${L('See exactly where your service charge goes', 'اعرفي أين تذهب رسوم الخدمات بالتفصيل')}</span></span></div>
          <div><span class="b-i">${icon('wrench')}</span><span><b>${L('Report and track repairs', 'أبلغي عن الأعطال وتابعيها')}</b><span>${L('Photos, technician visits and updates in one place', 'الصور وزيارات الفنيين والتحديثات في مكان واحد')}</span></span></div>
          <div><span class="b-i">${icon('megaphone')}</span><span><b>${L('Building news & documents', 'أخبار المبنى ووثائقه')}</b><span>${L('Notices from your owners’ association', 'إشعارات من جمعية المالكين')}</span></span></div>
        </div>
        ${M.btn(L('Join building', 'انضمّي إلى المبنى'), { kind: 'primary', block: true, act: 'mrJoin', icon: 'check' })}
        ${M.btn(L('This isn’t my home', 'هذا ليس منزلي'), { kind: 'ghost', block: true, act: 'mrMismatch' })}
        ${idNote()}
        <div class="mr-foot">${L('Prototype · fictional sample data', 'نموذج أولي · بيانات نموذجية وهمية')}</div>
      </div></div>`;
    return { bare: true, hideTabs: true, body };
  };

  /* 2 · Home */
  S.home = () => {
    const b = bld(), u = unit(), l = lease();
    const due = dues();
    const owed = B.sum(due, (p) => p.amount);
    const rent = st.upcoming.find((p) => p.kind === 'rent');
    const mine = myReqs().filter(isOpen).sort((a, z) => (a.by === ME ? -1 : 1) - (z.by === ME ? -1 : 1));
    const a = anns()[0];
    const days = B.daysFromToday(l.end);
    const exp = expenses();
    const dueCard = owed
      ? `<div class="mr-due"><div class="d-top"><div style="flex:1;min-width:0">${ui.badge(L('Due now', 'مستحق الآن'), 'warn', 'alertCircle')}<span class="d-amt mr-num">${B.money(owed)}</span><span class="d-s">${due.length === 1 ? esc(tx(due[0].label)) : L(`${due.length} items`, `${due.length} بنود`)}</span></div>${M.btn(L('Pay', 'ادفع'), { kind: 'primary', act: 'mrPay', arg: due[0].id })}</div>
        ${rent ? `<button class="d-next" data-go="payments">${icon('calendar')}<span style="flex:1">${L('Next rent', 'الإيجار القادم')} <b class="mr-num">${B.money(rent.amount)}</b> · ${B.dateShort(rent.date)}</span><span class="faint" style="font-size:13px">${B.inDays(rent.date)}</span>${icon('chevR', 'mc-c flip')}</button>` : ''}</div>`
      : `<div class="mr-due ok"><div class="d-top"><span class="mr-tick">${icon('check')}</span><div style="flex:1"><b style="font-size:17px">${L('You’re all paid up', 'لا مستحقات عليكِ')}</b><div class="d-s">${L('Thank you — receipts are in Payments', 'شكراً — الإيصالات في المدفوعات')}</div></div></div>
        ${rent ? `<button class="d-next" data-go="payments">${icon('calendar')}<span style="flex:1">${L('Next rent', 'الإيجار القادم')} <b class="mr-num">${B.money(rent.amount)}</b> · ${B.dateShort(rent.date)}</span><span class="faint" style="font-size:13px">${B.inDays(rent.date)}</span>${icon('chevR', 'mc-c flip')}</button>` : ''}</div>`;
    const body = `
      <button class="mr-hero" data-go="building"><span class="h-art">${B.art.facade(142, { type: 'residential', floors: 14, sky: 'navy' })}</span>
        <span class="h-b"><span class="mr-eyebrow">${L('My home', 'منزلي')}</span><span class="h-t">${esc(tx(b.name))}</span><span class="h-s">${L(`Apartment ${u.number} · Floor ${u.floor}`, `شقة ${u.number} · الطابق ${u.floor}`)}</span>
          <span class="mr-pills"><span>${icon('key')}${L('Tenant', 'مستأجرة')}</span><span>${icon('shieldCheck')}${L('Verified building', 'مبنى موثّق')}</span></span>
          <span class="h-id">${icon('fingerprint')}${L('BENA ID', 'رقم بينا')} ${id(b.id)}</span></span></button>
      ${dueCard}
      ${M.quick([
        { label: L('Report issue', 'إبلاغ عن عطل'), icon: 'wrench', go: 'book', mint: true },
        { label: L('Payments', 'المدفوعات'), icon: 'wallet', go: 'payments' },
        { label: L('Services', 'الخدمات'), icon: 'sparkles', go: 'services' },
        { label: L('Documents', 'المستندات'), icon: 'folder', go: 'documents' },
      ])}
      ${M.section(L('Your request', 'طلبك'), mine.length ? reqCard(mine[0]) : `<button class="mr-soft" data-go="book"><span class="s-i">${icon('wrench')}</span><span style="flex:1"><b>${L('Nothing open', 'لا توجد طلبات مفتوحة')}</b><small>${L('Something broken? Report it in under a minute.', 'هل هناك عطل؟ أبلغي عنه في أقل من دقيقة.')}</small></span>${icon('chevR', 'mc-c flip')}</button>`, { link: { label: L('All requests', 'كل الطلبات'), go: 'requests' } })}
      ${a ? M.section(L('From your building', 'من مبناك'), annCard(a), { link: { label: L('See all', 'عرض الكل'), go: 'announcements' } }) : ''}
      ${days > 0 && days < 90 ? `<button class="mr-soft" data-go="unit"><span class="s-i">${icon('contract')}</span><span style="flex:1"><b>${st.renew ? L('Renewal request sent', 'تم إرسال طلب التجديد') : L(`Lease ends in ${days} days`, `ينتهي العقد خلال ${days} يوماً`)}</b><small>${st.renew ? L('Waiting for your landlord’s reply', 'بانتظار رد المالك') : L(`${B.date(l.end)} · ask your landlord about renewing`, `${B.date(l.end)} · اسألي المالك عن التجديد`)}</small></span>${icon('chevR', 'mc-c flip')}</button>` : ''}
      ${M.card(`<div class="mr-card-h"><div style="flex:1"><h3>${L(`Where your ${B.money(180)} goes`, `أين تذهب الـ ${B.money(180)}`)}</h3><p>${L('Monthly building service charge', 'رسوم خدمات المبنى الشهرية')}</p></div>${icon('chevR', 'mc-c flip')}</div>
        <div class="mr-stack">${exp.map((e) => `<i style="width:${(e.value / 180) * 100}%;background:${e.color}"></i>`).join('')}</div>
        <div class="mr-legend">${exp.slice(0, 4).map((e) => `<span><i style="background:${e.color}"></i>${e.label}</span>`).join('')}<span>+${exp.length - 4}</span></div>`, '', { go: 'expenses' })}
      <div class="mr-foot">${L('Prototype · fictional sample data · payments are simulated', 'نموذج أولي · بيانات نموذجية وهمية · المدفوعات محاكاة')}</div>`;
    return {
      title: `${greet()}, ${first()}`, large: true, kicker: `${dayLine()} · ${L('Ramallah 14°', 'رام الله 14°')}`, body,
      actions: [{ icon: 'bell', go: 'notifications', label: L('Notifications', 'الإشعارات'), dot: !st.seenNotifs }],
      largeEnd: `<button class="mr-ava" data-go="profile" aria-label="${L('Profile', 'الملف الشخصي')}">${ui.avatar(D.person(ME).name)}</button>`,
    };
  };

  /* 3 · My Building */
  S.building = () => {
    const b = bld(), c = com(), m = mgr();
    const chair = c.members[0];
    const fac = [
      ['car', L('Parking', 'موقف السيارات'), L('Level −1 · your space P-14', 'الطابق −1 · موقفك P-14')],
      ['generator', L('Backup generator', 'مولد احتياطي'), L('250 kVA · auto start', '250 ك.ف.أ · تشغيل تلقائي')],
      ['tree', L('Roof garden', 'حديقة السطح'), L('Open 07:00–22:00', 'مفتوحة 07:00–22:00')],
      ['users', L('Meeting room', 'قاعة الاجتماعات'), L('Lobby · book ahead', 'الردهة · بحجز مسبق')],
    ];
    const body = `
      <div class="mr-bhero">${B.art.facade(142, { type: 'residential', floors: 14, sky: 'dusk' })}
        <div class="bh-b">${ui.badge(L('Verified municipal record', 'سجل بلدي موثّق'), 'mint', 'shieldCheck')}<h2>${esc(tx(b.name))}</h2><span class="bh-a">${icon('pin')}${esc(tx(b.address))}</span></div></div>
      <div class="mr-stats"><div><b>${b.floors}</b><span>${L('Floors', 'طوابق')}</span></div><div><b>${b.units}</b><span>${L('Units', 'وحدات')}</span></div><div><b>${b.year}</b><span>${L('Built', 'البناء')}</span></div><div><b>${b.elevators}</b><span>${L('Elevators', 'مصاعد')}</span></div></div>
      ${M.section(L('Right now', 'الآن'), M.group([
        M.cell({ icon: 'elevator', tone: 'bad', title: L('Elevator B out of service', 'المصعد ب متوقف'), sub: L('LiftLine technician on site today · use Elevator A', 'فني لفت لاين في الموقع اليوم · استخدموا المصعد أ'), go: 'request-MR-24477' }),
        M.cell({ icon: 'droplet', tone: 'warn', title: L('Water cut Thursday 09:00–13:00', 'انقطاع المياه الخميس 09:00–13:00'), sub: L('Rooftop tanks cover normal use', 'خزانات السطح تغطي الاستخدام العادي'), act: 'mrAnn', arg: 'an1' }),
        M.cell({ icon: 'generator', tone: 'mint', title: L('Generator ready', 'المولد جاهز'), sub: L('Last tested 14 Nov', 'آخر اختبار 14 ت٢'), badge: '<span class="mr-dot ok"></span>' }),
      ]), { sub: `<span class="mr-live"><i></i>${L('Simulated preview — no live sensors', 'معاينة محاكاة — لا توجد حساسات حية')}</span>` })}
      ${M.section(L('Identity', 'الهوية'), M.group([
        M.cell({ icon: 'fingerprint', tone: 'navy', title: L('BENA Building ID', 'رقم المبنى في بينا'), sub: id(b.id), badge: ui.prov('official') }),
        M.cell({ icon: 'landmark', title: L('Municipal GIS reference', 'مرجع نظم المعلومات البلدية'), sub: `${id(b.gis)} · ${L('sample', 'نموذج')}` }),
        M.cell({ icon: 'map', title: L('Land parcel', 'قطعة الأرض'), sub: L(`Basin ${b.parcel.basin} · Parcel ${b.parcel.parcel}`, `حوض ${b.parcel.basin} · قطعة ${b.parcel.parcel}`) }),
      ]) + idNote())}
      ${M.section(L('Location', 'الموقع'), `<div class="mx-card" style="padding:0;overflow:hidden;gap:0">${B.map.render({ id: 'mr-loc', static: true, focus: BID, focusW: 220, selected: BID, legend: false, badge: false, height: '176px' })}<div style="display:flex;align-items:center;gap:12px;padding:12px 16px"><span style="flex:1;font-size:14px;color:var(--text-2)">${esc(tx(b.address))}</span>${M.btn(L('Directions', 'الاتجاهات'), { sm: true, icon: 'route', act: 'mxSoon', arg: L('Directions', 'الاتجاهات') })}</div></div>`)}
      ${M.section(L('Who runs the building', 'من يدير المبنى'), M.group([
        M.cell({ icon: 'gavel', tone: 'navy', title: tx(c.name), sub: L(`Registered association · chair ${D.pname(chair.p)}`, `جمعية مسجّلة · الرئيس ${D.pname(chair.p)}`), act: 'mrCommittee' }),
        M.cell({ icon: 'briefcase', tone: 'info', title: tx(m.name), sub: L('Property management · day-to-day operations', 'إدارة العقار · التشغيل اليومي'), act: 'mrContact', arg: 'mgr' }),
      ]))}
      ${M.section(L('Shared facilities', 'المرافق المشتركة'), `<div class="mr-tiles">${fac.map(([i, t, s]) => `<div class="mr-tile">${icon(i)}<b>${t}</b><span>${s}</span></div>`).join('')}</div>`)}
      ${M.group([
        M.cell({ icon: 'megaphone', tone: 'mint', title: L('Announcements', 'الإعلانات'), value: unreadAnns() ? `<span class="badge mint">${unreadAnns()}</span>` : '', go: 'announcements' }),
        M.cell({ icon: 'pie', tone: 'mint', title: L('Building expenses', 'مصاريف المبنى'), sub: L('Where the service charge goes', 'أين تذهب رسوم الخدمات'), go: 'expenses' }),
        M.cell({ icon: 'folder', tone: 'mint', title: L('Building documents', 'وثائق المبنى'), go: 'documents' }),
        M.cell({ icon: 'door', tone: 'mint', title: L('My apartment', 'شقتي'), sub: L('Apartment 803 · lease & utilities', 'شقة 803 · العقد والخدمات'), go: 'unit' }),
      ])}
      ${M.section(L('Contacts', 'جهات الاتصال'), M.group([
        M.cell({ icon: 'alert', tone: 'bad', title: L('Building emergency line', 'خط طوارئ المبنى'), sub: '<bdi>+970 2 296 4499</bdi>', act: 'mrCall', arg: '+970 2 296 4499' }),
        M.cell({ icon: 'briefcase', title: L('Management office', 'مكتب الإدارة'), sub: L('Sun–Thu 08:30–16:30', 'الأحد–الخميس 08:30–16:30'), act: 'mrCall', arg: tx(m.phone) }),
        M.cell({ icon: 'shield', title: L('Lobby security', 'أمن الردهة'), sub: L('24/7 · intercom 0', 'على مدار الساعة · الاتصال الداخلي 0'), act: 'mrCall', arg: L('intercom 0', 'الاتصال الداخلي 0') }),
      ]))}`;
    return { title: L('My Building', 'مبناي'), large: true, body, actions: [{ icon: 'share', act: 'mxSoon', arg: L('Share building', 'مشاركة المبنى'), label: L('Share', 'مشاركة') }] };
  };

  /* 4 · My Unit */
  S.unit = (_, __, back) => {
    const u = unit(), l = lease(), meta = (D.ownerX && D.ownerX.meta && D.ownerX.meta[UID]) || {};
    const total = B.daysBetween(l.start, l.end), gone = B.daysBetween(l.start, TODAY), left = B.daysFromToday(l.end);
    const pct = Math.round((gone / total) * 100);
    const body = `
      <div class="mr-plan"><div class="p-art">${B.art.floorplan(803)}</div>
        <div class="mr-specs">
          <div>${icon('ruler')}<b>${u.area} ${L('m²', 'م²')}</b><span>${L('Area', 'المساحة')}</span></div>
          <div>${icon('bed')}<b>${u.beds}</b><span>${L('Bedrooms', 'غرف النوم')}</span></div>
          <div>${icon('bath')}<b>2</b><span>${L('Bathrooms', 'الحمّامات')}</span></div>
          <div>${icon('stairs')}<b>${u.floor}</b><span>${L('Floor', 'الطابق')}</span></div>
          <div>${icon('car')}<b>${meta.parking || 'P-14'}</b><span>${L('Parking', 'الموقف')}</span></div>
          <div>${icon('sun')}<b>${L('East', 'شرقية')}</b><span>${L('Facing', 'الواجهة')}</span></div>
        </div></div>
      ${M.section(L('My relationship', 'علاقتي بالوحدة'), M.group([
        M.cell({ icon: 'key', tone: 'mint', title: L('Tenant', 'مستأجرة'), sub: L('Confirmed by the owner through BENA', 'أكّدها المالك عبر بينا'), badge: ui.badge(L('Confirmed', 'مؤكّد'), 'ok', 'check') }),
        M.cell({ avatar: D.person(l.owner).name, title: D.pname(l.owner), sub: L('Owner · contact through Arkan', 'المالك · التواصل عبر أركان'), act: 'mrContact', arg: 'owner' }),
        M.cell({ icon: 'users', title: L('Household', 'أفراد الأسرة'), sub: L('2 adults, 1 child', 'شخصان بالغان وطفل'), act: 'mrHousehold' }),
      ]))}
      ${M.section(L('Lease', 'عقد الإيجار'), M.card(`
        <div class="mr-card-h"><span class="mr-ci">${icon('contract')}</span><div style="flex:1;min-width:0"><h3>${id(l.id)}</h3><p>${L('Residential · 12 months', 'سكني · 12 شهراً')}</p></div>${ui.status(l.status)}</div>
        <div class="mr-term"><div class="t-row"><span>${B.dateShort(l.start)}</span><span>${L(`${left} days left`, `متبقٍ ${left} يوماً`)}</span><span>${B.dateShort(l.end)}</span></div>${ui.progress(pct, left < 75 ? 'warn' : '')}</div>
        <div class="mr-kv"><div><span>${L('Monthly rent', 'الإيجار الشهري')}</span><b>${B.money(l.rent)}</b></div><div><span>${L('Deposit held', 'التأمين المحجوز')}</span><b>${B.money(l.deposit)}</b></div><div><span>${L('Payment day', 'يوم الدفع')}</span><b>${L('1st of month', 'الأول من الشهر')}</b></div><div><span>${L('Service charge', 'رسوم الخدمات')}</span><b>${L('Paid by you', 'تدفعينها أنتِ')}</b></div></div>
        ${st.renew ? ui.callout(L('<b>Renewal request sent.</b> Khaled Mansour usually replies within a few days.', '<b>تم إرسال طلب التجديد.</b> يرد خالد منصور عادة خلال أيام.'), 'mint', 'send') : ''}
        <div class="mr-actions">${M.btn(L('Contract', 'العقد'), { icon: 'doc', act: 'mrDoc', arg: 'd-lease' })}${st.renew ? M.btn(L('Message', 'مراسلة'), { icon: 'chat', act: 'mrContact', arg: 'owner' }) : M.btn(L('Ask to renew', 'طلب التجديد'), { kind: 'dark', icon: 'refresh', act: 'mrRenew' })}</div>`))}
      ${M.section(L('Utilities', 'الخدمات'), M.group([
        M.cell({ icon: 'zap', tone: st.elec < 60 ? 'warn' : 'mint', title: L('Electricity · prepaid meter', 'الكهرباء · عداد مسبق الدفع'), sub: L(`About ${Math.max(1, Math.round(st.elec / 7))} days left at your usage`, `يكفي نحو ${Math.max(1, Math.round(st.elec / 7))} أيام حسب استهلاكك`), value: B.money(st.elec), valueSub: L('Top up', 'شحن'), act: 'mrTopup' }),
        M.cell({ icon: 'droplet', tone: 'info', title: L('Water sub-meter', 'عداد المياه الفرعي'), sub: L('Billed with the service charge', 'تُحتسب مع رسوم الخدمات') }),
        M.cell({ icon: 'wifi', tone: 'violet', title: L('Fibre internet', 'إنترنت الألياف'), sub: L('Building backbone · 100 Mbps', 'شبكة المبنى · 100 ميغابت') }),
      ]))}
      ${M.section(L('Unit identity', 'هوية الوحدة'), M.group([M.cell({ icon: 'fingerprint', tone: 'navy', title: L('BENA unit reference', 'مرجع الوحدة في بينا'), sub: id(UID), badge: ui.prov('official') })]) + idNote())}`;
    return { title: L(`Apartment ${u.number}`, `شقة ${u.number}`), back: back || 'home', body };
  };

  /* 5 · Announcements */
  S.announcements = (_, __, back) => {
    const f = B.get('mr:annF', 'all');
    const list = anns().filter((a) => f === 'all' || a.tag === f);
    const tm = tagMeta();
    const body = `
      ${M.chips('mr:annF', [{ id: 'all', label: L('All', 'الكل') }, ...Object.keys(tm).map((k) => ({ id: k, label: tm[k][2], icon: tm[k][0] }))], f)}
      ${list.length ? `<div style="display:flex;flex-direction:column;gap:10px">${list.map(annCard).join('')}</div>` : M.empty('megaphone', L('Nothing in this category', 'لا شيء في هذه الفئة'), L('New notices from your building will appear here.', 'ستظهر هنا الإشعارات الجديدة من مبناك.'))}
      ${note(L('Posted by the Al-Masyoun Tower Owners’ Association and Arkan Property Management.', 'تنشرها جمعية مالكي برج الماصيون وأركان لإدارة العقارات.'), 'megaphone')}`;
    return { title: L('Announcements', 'الإعلانات'), large: true, back: back || 'building', body, actions: unreadAnns() ? [{ icon: 'checkCircle', act: 'mrReadAll', label: L('Mark all read', 'تعليم الكل كمقروء') }] : [] };
  };

  /* 6 · Maintenance requests */
  S.requests = () => {
    const f = B.get('mr:reqF', 'active');
    const all = myReqs();
    const act = all.filter(isOpen), done = all.filter((q) => !isOpen(q));
    const list = f === 'active' ? act : done;
    const mine = list.filter((q) => q.scope !== 'common'), common = list.filter((q) => q.scope === 'common');
    const col = (arr) => `<div style="display:flex;flex-direction:column;gap:10px">${arr.map(reqCard).join('')}</div>`;
    const body = `
      ${M.seg('mr:reqF', [{ id: 'active', label: L(`Active · ${act.length}`, `نشطة · ${act.length}`) }, { id: 'done', label: L('Completed', 'المكتملة') }], f)}
      ${f === 'active' ? `<button class="mr-soft" data-go="book"><span class="s-i">${icon('plus')}</span><span style="flex:1"><b>${L('Report an issue', 'الإبلاغ عن عطل')}</b><small>${L('Photos and a time that suits you — about a minute', 'صور ووقت يناسبك — نحو دقيقة')}</small></span>${icon('chevR', 'mc-c flip')}</button>` : ''}
      ${!list.length ? M.empty('wrench', f === 'active' ? L('No open requests', 'لا توجد طلبات مفتوحة') : L('Nothing completed yet', 'لا طلبات مكتملة بعد'), L('Requests for your unit and the building’s common areas appear here.', 'تظهر هنا طلبات وحدتك والمناطق المشتركة.')) : ''}
      ${mine.length ? M.section(L('My apartment', 'شقتي'), col(mine)) : ''}
      ${common.length ? M.section(L('Common areas', 'المناطق المشتركة'), col(common), { sub: L('Reported by residents of your building', 'أبلغ عنها سكان مبناك') }) : ''}`;
    return { title: L('Requests', 'الطلبات'), large: true, body, actions: [{ icon: 'plus', go: 'book', label: L('New request', 'طلب جديد') }] };
  };

  /* 7 · Request details */
  const seedMsgs = (q) => {
    if (q.id === 'MR-24518') return [
      { by: 'me', text: T('Water keeps collecting in the cabinet — I put a bucket under it.', 'المياه تتجمع في الخزانة — وضعت دلواً تحتها.'), when: stamp('2026-11-22', '18:40') },
      { by: 'mgr', text: T('Thanks Lina — Jaber Technical Services is assigned. Ali will visit on Thursday morning.', 'شكراً لينا — تم إسناد الطلب إلى جابر للخدمات الفنية. سيزورك علي صباح الخميس.'), when: stamp('2026-11-23', '09:12') },
      { by: 'tech', text: T('I’ll bring a new trap and seals. Please empty the cabinet before 10:00.', 'سأحضر سيفوناً وجلدات جديدة. يرجى إفراغ الخزانة قبل الساعة 10:00.'), when: stamp('2026-11-24', '16:05') },
    ];
    if (!isOpen(q)) return [{ by: 'mgr', text: T('Job closed — the fixture was replaced. Tell us how it went.', 'أُغلقت المهمة — تم تبديل وحدة الإنارة. أخبرينا برأيك.'), when: stamp(q.closed || TODAY) }];
    if (q.provider) return [{ by: 'mgr', text: both(() => L(`${tx(D.provider(q.provider).name)} is assigned${q.visit ? ` — visit on ${B.date(q.visit)}` : ''}. We’ll keep you posted.`, `تم الإسناد إلى ${tx(D.provider(q.provider).name)}${q.visit ? ` — الزيارة في ${B.date(q.visit)}` : ''}. سنوافيكم بالمستجدات.`)), when: stamp(q.created) }];
    return [{ by: 'mgr', text: T('We received the request and will assign a provider shortly.', 'استلمنا الطلب وسنُسند مزوّد خدمة قريباً.'), when: stamp(q.created) }];
  };
  const msgsOf = (q) => (st.msgs[q.id] = st.msgs[q.id] || seedMsgs(q));
  S.request = (rid, __, back) => {
    const q = D.request(rid) || D.request('MR-24518');
    const c = D.cat(q.cat);
    const p = q.provider ? D.provider(q.provider) : null;
    const s = STEP[q.status] ?? 0;
    const mineQ = q.by === ME;
    const open = isOpen(q);
    const v = q.visit ? new Date(q.visit + 'T12:00:00') : null;
    const tl = [
      { t: L('Request sent', 'تم إرسال الطلب'), s: `${B.date(q.created)} · ${mineQ ? L('by you', 'بواسطتك') : L('by a resident', 'بواسطة أحد السكان')}`, ok: true },
      { t: L('Reviewed by building management', 'راجعته إدارة المبنى'), s: tx(mgr().name), ok: s >= 1 || !!q.provider },
      { t: p ? L(`Assigned to ${tx(p.name)}`, `أُسند إلى ${tx(p.name)}`) : L('Provider to be assigned', 'سيُسند إلى مزوّد'), s: p ? `${tx(p.response)} ${L('typical response', 'متوسط الاستجابة')}` : L('Usually within a day', 'عادة خلال يوم'), ok: s >= 1 },
      { t: L('Technician visit', 'زيارة الفني'), s: q.visit ? `${B.date(q.visit)}${VISIT[q.id] ? ` · ${VISIT[q.id]}` : ''}${q.status === 'open' ? L(' · your preference', ' · حسب تفضيلك') : ''}` : q.closed ? B.date(q.closed) : L('To be scheduled', 'سيُحدَّد لاحقاً'), ok: s >= 3 || (s >= 2 && (!q.visit || B.daysFromToday(q.visit) <= 0)) },
      { t: q.status === 'cancelled' ? L('Cancelled', 'أُلغي') : L('Completed', 'مكتمل'), s: q.closed ? B.date(q.closed) : '', ok: s >= 3 || q.status === 'cancelled' },
    ];
    const curI = tl.findIndex((x) => !x.ok);
    const msgs = msgsOf(q);
    const who = (m) => (m.by === 'me' ? L('You', 'أنتِ') : m.by === 'tech' ? (q.tech ? tx(q.tech) : L('Technician', 'الفني')) : tx(mgr().name));
    const rated = q.rating || 0;
    const photos = q.id === 'MR-24518' ? [B.art.interior(5), B.art.interior(9)] : q.photos || [];
    const body = `
      <div class="mr-rq-h"><div class="row" style="gap:12px"><span class="mr-ci ${open ? '' : 'done'}" style="width:52px;height:52px;border-radius:16px">${icon(c.icon)}</span><div class="grow"><div class="mr-eyebrow">${esc(tx(c.name))}</div><div class="faint" style="font-size:13px;margin-top:2px">${id(q.id)} · ${q.scope === 'common' ? L('Common area', 'منطقة مشتركة') : L('Apartment 803', 'شقة 803')}</div></div></div>
        <h2 class="q-t">${esc(tx(q.title))}</h2><div class="q-m">${ui.status(q.status)}${ui.status(q.priority)}</div></div>
      ${open ? prog(q) : ''}
      ${open && v ? `<div class="mr-visit"><span class="v-d"><small>${B.dow(v.getDay())}</small><b>${v.getDate()}</b></span><span class="v-b"><b>${q.status === 'open' ? L('Preferred visit time', 'موعد الزيارة المفضّل') : L('Technician visit', 'زيارة الفني')}</b><span>${B.inDays(q.visit)}${VISIT[q.id] ? ` · ${VISIT[q.id]}` : ''}</span></span>${mineQ ? M.btn(L('Change', 'تغيير'), { sm: true, act: 'mrResched', arg: q.id }) : ''}</div>` : ''}
      ${p ? M.card(`<div class="mr-person">${ui.avatar(q.tech ? tx(q.tech).split(' (')[0] : p.name)}<div class="grow"><b>${q.tech ? esc(tx(q.tech)) : esc(tx(p.name))}</b><small>${q.tech ? esc(tx(p.name)) + ' · ' : ''}${ui.stars(p.rating)} ${p.rating}</small></div>${p.verified ? ui.badge(L('Verified', 'موثّق'), 'ok', 'badgeCheck') : ''}</div>
        <div class="mr-actions">${M.btn(L('Call', 'اتصال'), { icon: 'phone', act: 'mrCall', arg: q.tech ? tx(q.tech) : tx(p.name) })}${M.btn(L('Message', 'رسالة'), { icon: 'chat', act: 'mrFocus' })}</div>`) : ''}
      ${q.desc || photos.length ? M.section(L('Details', 'التفاصيل'), M.card(`${q.desc ? `<p style="font-size:15px;line-height:1.5">${esc(tx(q.desc))}</p>` : ''}${photos.length ? `<div class="mr-photos">${photos.map((a) => M.photo(a)).join('')}</div>` : ''}`)) : ''}
      ${M.section(L('Progress', 'مراحل الطلب'), `<div class="mr-tl">${tl.map((x, i) => `<div class="t ${x.ok ? 'done' : i === curI && q.status !== 'cancelled' ? 'cur' : ''}"><span class="t-i">${x.ok ? icon('check') : ''}</span><div><b>${x.t}</b>${x.s ? `<span>${x.s}</span>` : ''}</div></div>`).join('')}</div>`)}
      ${M.section(L('Updates', 'التحديثات'), `<div class="mr-chat">${msgs.map((m) => `<div class="mr-msg ${m.by === 'me' ? 'me' : ''}">${m.by === 'me' ? '' : `<span class="m-who">${esc(who(m))}</span>`}<span class="m-b">${esc(tx(m.text))}</span><span class="m-t">${esc(tx(m.when))}</span></div>`).join('')}</div>
        ${open ? `<form class="mr-compose" data-submit="mrMsg"><input type="hidden" name="id" value="${q.id}"><input id="mr-compose" name="text" placeholder="${esc(L('Write an update…', 'اكتبي تحديثاً…'))}" autocomplete="off" aria-label="${esc(L('Message', 'رسالة'))}"><button type="submit" aria-label="${esc(L('Send', 'إرسال'))}">${icon('send')}</button></form>` : ''}`)}
      ${!open && q.status !== 'cancelled' ? M.card(`<div style="text-align:center"><h3 style="font-size:17px">${rated ? L('Thanks for your rating', 'شكراً على تقييمك') : L('How did it go?', 'كيف كانت الخدمة؟')}</h3><p class="muted" style="font-size:13.5px;margin-top:2px">${p ? esc(tx(p.name)) : ''}</p></div><div class="mr-rate">${[1, 2, 3, 4, 5].map((n) => `<button class="${n <= rated ? 'on' : ''}" data-act="mrRate" data-arg="${q.id}|${n}" aria-label="${n}">${icon('star')}</button>`).join('')}</div>`) : ''}
      ${open && mineQ ? `<div style="display:flex;flex-direction:column;gap:10px">${s >= 2 ? M.btn(L('It’s fixed — close request', 'تم الإصلاح — أغلقي الطلب'), { kind: 'primary', block: true, icon: 'checkCircle', act: 'mrResolve', arg: q.id }) : ''}${M.btn(L('Cancel request', 'إلغاء الطلب'), { kind: 'danger', block: true, act: 'mrCancel', arg: q.id })}</div>` : ''}
      ${open && !mineQ ? M.btn(st.affected.has(q.id) ? L('You’re following this issue', 'أنتِ تتابعين هذا العطل') : L('This affects me too', 'هذا يؤثر عليّ أيضاً'), { kind: st.affected.has(q.id) ? 'soft' : 'ghost', block: true, icon: st.affected.has(q.id) ? 'check' : 'plus', act: 'mrAffected', arg: q.id }) : ''}`;
    return { title: L('Request', 'الطلب'), back: back || 'requests', tab: 'requests', body };
  };

  /* 8 · Building expenses */
  S.expenses = (_, __, back) => {
    const exp = expenses();
    const spend = [
      { icon: 'zap', t: L('Common-area electricity · October', 'كهرباء المناطق المشتركة · تشرين الأول'), s: L('Electricity company · EL-3381', 'شركة الكهرباء · EL-3381'), v: 2860, d: '2026-11-08', prov: 'official' },
      { icon: 'sparkles', t: L('Cleaning contract · November', 'عقد التنظيف · تشرين الثاني'), s: 'Sparkle Building Care', v: 2100, d: '2026-11-05', prov: 'submitted' },
      { icon: 'droplet', t: L('Municipal water · bulk meter', 'مياه البلدية · العداد الرئيسي'), s: L('Due — association will pay', 'مستحقة — ستدفعها الجمعية'), v: 1940, d: '2026-11-20', prov: 'official' },
      { icon: 'elevator', t: L('Elevator B emergency call-out', 'استدعاء طارئ للمصعد ب'), s: 'LiftLine Elevators', v: 650, d: '2026-11-21', prov: 'submitted' },
      { icon: 'generator', t: L('Generator service & test', 'صيانة واختبار المولد'), s: L('Arkan Property Management', 'أركان لإدارة العقارات'), v: 480, d: '2026-11-14', prov: 'submitted' },
    ];
    const body = `
      ${M.card(`<div style="text-align:center"><span class="mr-eyebrow">${L('Your monthly share', 'حصتك الشهرية')}</span></div>
        <div style="display:flex;justify-content:center">${B.charts.donut({ data: exp.map((e) => ({ label: e.label, value: e.value, color: e.color })), center: { value: B.money(180), label: L('per month', 'شهرياً') }, size: 176, thick: 13, legend: false })}</div>
        ${M.group(exp.map((e) => M.cell({ icon: e.icon, title: `<span class="mr-sw" style="background:${e.color}"></span>${e.label}`, value: B.money(e.value), valueSub: `${Math.round((e.value / 180) * 100)}%` })))}`)}
      ${M.kpis([
        { label: L('Building budget', 'موازنة المبنى'), value: B.money(9720), sub: L('per month · 54 units', 'شهرياً · 54 وحدة'), icon: 'building' },
        { label: L('Reserve fund', 'صندوق الاحتياط'), value: B.money(48200), sub: L('64% of ₪75k target', '64% من هدف 75 ألف ₪'), icon: 'shield' },
      ])}
      ${M.section(L('Recent spending', 'آخر المصاريف'), M.group(spend.map((x) => M.cell({ icon: x.icon, title: x.t, sub: `${x.s} · ${B.dateShort(x.d)}<span style="display:block;margin-top:6px">${ui.prov(x.prov)}</span>`, value: B.money(x.v) }))), { sub: L('November 2026 · from the association ledger', 'تشرين الثاني 2026 · من سجل الجمعية') })}
      ${M.section(L('Coming up', 'قريباً'), M.card(`<div class="mr-card-h"><span class="mr-ci">${icon('elevator')}</span><div style="flex:1"><h3>${L('Elevator modernisation levy', 'مساهمة تحديث المصاعد')}</h3><p>${L(`${B.money(420)} per unit · vote at the general assembly, 4 Dec`, `${B.money(420)} لكل وحدة · التصويت في الهيئة العامة، 4 ك١`)}</p></div>${ui.badge(L('Proposed', 'مقترح'), 'violet', 'vote')}</div>
        ${ui.callout(L('Special levies are normally paid by the owner, not the tenant — your lease (L-2026-0803) says the same.', 'تُدفع المساهمات الخاصة عادةً من المالك لا المستأجر — وهذا ما ينص عليه عقدك (L-2026-0803).'), 'mint', 'info')}`))}
      ${note(L('Figures published by the Al-Masyoun Tower Owners’ Association · sample data for the prototype.', 'أرقام تنشرها جمعية مالكي برج الماصيون · بيانات نموذجية للنموذج الأولي.'))}`;
    return { title: L('Building expenses', 'مصاريف المبنى'), back: back || 'payments', body };
  };

  /* 9 · Payments */
  const groupByMonth = (arr) => { const g = {}; arr.forEach((p) => { const k = p.date.slice(0, 7); (g[k] = g[k] || []).push(p); }); return Object.entries(g).sort((a, b) => (a[0] < b[0] ? 1 : -1)); };
  S.payments = () => {
    const due = dues();
    const owed = B.sum(due, (p) => p.amount);
    const f = B.get('mr:payF', 'all');
    const hist = pays().filter((p) => p.status === 'paid' && (f === 'all' || (f === 'rent' ? p.kind === 'rent' : p.kind !== 'rent')));
    const year = B.sum(pays().filter((p) => p.status === 'paid' && p.date.startsWith('2026')), (p) => p.amount);
    const body = `
      <div class="mr-bal">
        <span class="b-l">${icon(owed ? 'alertCircle' : 'checkCircle')}${owed ? L('Outstanding balance', 'الرصيد المستحق') : L('Balance', 'الرصيد')}</span>
        <span class="b-v mr-num">${B.money(owed)}</span>
        <span class="b-s">${owed ? due.map((p) => esc(tx(p.label))).join(' · ') : L('Nothing to pay right now', 'لا يوجد ما يُدفع الآن')}</span>
        ${owed ? `<div class="mr-actions">${M.btn(L(`Pay ${B.money(owed)}`, `ادفعي ${B.money(owed)}`), { kind: 'primary', icon: 'card', act: 'mrPay', arg: due[0].id })}${M.btn(L('Details', 'التفاصيل'), { kind: 'ghost', go: 'expenses' })}</div>` : ''}
      </div>
      ${st.upcoming.length ? M.section(L('Upcoming', 'القادمة'), M.group(st.upcoming.map((p) => M.cell({ icon: payIcon(p), tone: 'info', title: tx(p.label), sub: `${payee(p)} · ${B.dateShort(p.date)}`, value: B.money(p.amount), valueSub: B.inDays(p.date), act: 'mrPay', arg: p.id })))) : ''}
      ${M.kpis([{ label: L('Paid in 2026', 'مدفوع في 2026'), value: B.money(year), sub: L('rent and charges', 'إيجار ورسوم'), icon: 'receipt' }, { label: L('On-time', 'في الموعد'), value: '100%', sub: L('last 12 months', 'آخر 12 شهراً'), icon: 'checkCircle' }])}
      ${M.section(L('History', 'السجل'), `${M.seg('mr:payF', [{ id: 'all', label: L('All', 'الكل') }, { id: 'rent', label: L('Rent', 'الإيجار') }, { id: 'charge', label: L('Building', 'المبنى') }], f)}
        ${hist.length ? groupByMonth(hist).map(([ym, rows]) => M.group(rows.map((p) => M.cell({ icon: payIcon(p), tone: p.kind === 'rent' ? 'navy' : 'mint', title: tx(p.label), sub: `${B.dateShort(p.date)} · ${tx(p.method) || '—'}`, value: B.money(p.amount), valueSub: L('Receipt', 'إيصال'), act: 'mrReceipt', arg: p.id })), B.monthYear(ym + '-01'))).join('') : M.empty('receipt', L('No payments yet', 'لا مدفوعات بعد'))}`)}
      ${M.group([
        M.cell({ icon: 'pie', tone: 'mint', title: L('Where does my service charge go?', 'أين تذهب رسوم الخدمات؟'), go: 'expenses' }),
        M.cell({ icon: 'card', title: L('Payment methods', 'طرق الدفع'), sub: L('Visa •••• 2291 · bank transfer', 'فيزا •••• 2291 · تحويل بنكي'), act: 'mxSoon', arg: L('Payment methods', 'طرق الدفع') }),
      ])}
      ${note(L('Payments in this prototype are simulated — no money moves and no bank is connected.', 'المدفوعات في هذا النموذج محاكاة — لا تنتقل أي أموال ولا يوجد ربط بأي بنك.'), 'lock')}`;
    return { title: L('Payments', 'المدفوعات'), large: true, body };
  };

  /* 10 · Documents */
  const DOCS = () => [
    { id: 'd-lease', g: 'tenancy', icon: 'contract', t: L('Lease contract L-2026-0803', 'عقد الإيجار L-2026-0803'), d: '2026-01-18', size: '1.1 MB', prov: 'submitted', by: L('Signed by both parties', 'موقّع من الطرفين') },
    { id: 'd-amend', g: 'tenancy', icon: 'edit', t: L('Amendment 1 — parking space P-14', 'التعديل 1 — الموقف P-14'), d: '2026-05-01', size: '320 KB', prov: 'submitted', by: L('Added by Arkan', 'أضافته أركان') },
    { id: 'd-move', g: 'tenancy', icon: 'clipboard', t: L('Move-in inspection report', 'تقرير الفحص عند الاستلام'), d: '2026-02-01', size: '2.6 MB', prov: 'submitted', by: L('14 photos · signed', '14 صورة · موقّع') },
    { id: 'd-rc11', g: 'receipts', icon: 'receipt', t: L('Rent receipt — November 2026', 'إيصال الإيجار — تشرين الثاني 2026'), d: '2026-11-01', size: '96 KB', prov: 'demo', pay: 'RC-26-1101' },
    { id: 'd-sc10', g: 'receipts', icon: 'receipt', t: L('Service charge receipt — October', 'إيصال رسوم الخدمات — تشرين الأول'), d: '2026-10-04', size: '88 KB', prov: 'demo', pay: 'SC-26-1001' },
    { id: 'd-rules', g: 'building', icon: 'gavel', t: L('Building rules & bylaws 2025', 'أنظمة المبنى ولوائحه 2025'), d: '2025-03-10', size: '1.3 MB', prov: 'submitted', by: L('Owners’ association', 'جمعية المالكين') },
    { id: 'd-fire', g: 'building', icon: 'fireExt', t: L('Fire safety certificate (sample)', 'شهادة السلامة من الحريق (نموذج)'), d: '2026-07-20', size: '540 KB', prov: 'official', by: L('Civil defence reference', 'مرجع الدفاع المدني') },
    { id: 'd-elev', g: 'building', icon: 'elevator', t: L('Elevator inspection — Sep 2026', 'فحص المصاعد — أيلول 2026'), d: '2026-09-14', size: '780 KB', prov: 'submitted', by: 'LiftLine Elevators' },
    ...st.docs,
  ];
  S.documents = (_, __, back) => {
    const q = B.get('mr:docQ', '');
    const docs = DOCS().filter((d) => B.match(q, d.t));
    const groups = [['mine', L('Added by you', 'أضفتِها أنتِ')], ['tenancy', L('Tenancy', 'الإيجار')], ['receipts', L('Receipts', 'الإيصالات')], ['building', L('Building', 'المبنى')]];
    const body = `${M.search('mr:docQ', L('Search documents', 'ابحثي في المستندات'))}
      ${docs.length ? groups.map(([g, label]) => { const r = docs.filter((d) => d.g === g); return r.length ? M.group(r.map((d) => M.cell({ icon: d.icon, tone: g === 'receipts' ? 'mint' : g === 'building' ? 'info' : g === 'mine' ? 'warn' : 'navy', title: d.t, sub: `${B.date(d.d)} · ${d.size}`, badge: ui.prov(d.prov), act: d.pay ? 'mrReceipt' : 'mrDoc', arg: d.pay || d.id })), label) : ''; }).join('') : M.empty('search', L('No matching documents', 'لا توجد مستندات مطابقة'))}
      ${note(L('Uploaded files stay “pending review” until your building manager checks them. Nothing leaves this device in the prototype.', 'تبقى الملفات المرفوعة «قيد المراجعة» حتى تتحقق منها إدارة المبنى. لا يغادر أي شيء هذا الجهاز في النموذج.'), 'lock')}`;
    return { title: L('Documents', 'المستندات'), large: true, back: back || 'profile', body, actions: [{ icon: 'upload', act: 'mrUpload', label: L('Upload', 'رفع') }] };
  };

  /* 11 · Services */
  const near = () => D.providers.filter((p) => p.areas.includes('masyoun'));
  const provCard = (p) => `<button class="mr-prov" data-act="mrProv" data-arg="${p.id}"><span class="p-h"><span class="p-l">${esc(B.initials(p.name))}</span><span style="flex:1;min-width:0"><b>${esc(tx(p.name))}</b><small>${ui.stars(p.rating)}<span>${p.rating}</span><span>·</span><span>${L(`${p.reviews} reviews`, `${p.reviews} تقييماً`)}</span></small></span>${p.verified ? ui.badge(L('Verified', 'موثّق'), 'ok', 'badgeCheck') : ''}</span>
    <span class="p-f"><span class="mr-meta">${icon('clock')}${esc(tx(p.response))}</span><span class="mr-meta">${icon('coins')}${L(`from ${B.money(p.from)}`, `ابتداءً من ${B.money(p.from)}`)}</span><span class="mr-meta">${icon(D.cat(p.cats[0]).icon)}${esc(tx(D.cat(p.cats[0]).name))}${p.cats.length > 1 ? ` +${p.cats.length - 1}` : ''}</span></span></button>`;
  S.services = (_, __, back) => {
    const f = B.get('mr:svcF', 'all');
    const list = near().filter((p) => f === 'all' || p.cats.includes(f));
    const body = `
      <div class="mr-cats">${D.serviceCats.map((c) => `<button class="mr-cat" data-act="mrBookCat" data-arg="${c.id}"><span class="c-i">${icon(c.icon)}</span>${esc(tx(c.name))}</button>`).join('')}</div>
      <button class="mr-soft" data-go="book"><span class="s-i">${icon('building')}</span><span style="flex:1"><b>${L('Repairs covered by your lease', 'إصلاحات يغطيها عقدك')}</b><small>${L('Arkan picks a vetted provider and you approve any cost first.', 'تختار أركان مزوّداً معتمداً وتوافقين على أي تكلفة أولاً.')}</small></span>${icon('chevR', 'mc-c flip')}</button>
      ${M.section(L('Providers near you', 'مزوّدون بالقرب منك'), `${M.chips('mr:svcF', [{ id: 'all', label: L('All', 'الكل') }, ...D.serviceCats.filter((c) => near().some((p) => p.cats.includes(c.id))).map((c) => ({ id: c.id, label: c.name }))], f)}<div style="display:flex;flex-direction:column;gap:10px">${list.map(provCard).join('') || M.empty('search', L('No provider in this category nearby', 'لا يوجد مزوّد قريب في هذه الفئة'))}</div>`, { sub: L('Serving Al-Masyoun', 'يخدمون الماصيون') })}
      ${note(L('Providers are independent businesses listed for the demo. Ratings are sample data; BENA does not endorse any provider.', 'المزوّدون شركات مستقلة مدرجة للعرض. التقييمات بيانات نموذجية؛ ولا تُزكّي بينا أي مزوّد.'))}`;
    return { title: L('Services', 'الخدمات'), large: true, back: back || 'home', body };
  };

  /* 12 · Service request flow (category → details → photos → time → review → done) */
  const STEPS = 5;
  const draft = () => ({ cat: B.get('mrb:cat', ''), where: B.get('mrb:where', 'unit'), title: B.get('mrb:title', ''), desc: B.get('mrb:desc', ''), urg: B.get('mrb:urg', 'normal'), date: B.get('mrb:date', '2026-11-26'), slot: B.get('mrb:slot', 'am'), access: B.get('mrb:access', 'home'), prov: B.get('mrb:prov', '') });
  const SLOTS = () => [{ id: 'am', t: L('Morning', 'صباحاً'), s: '08:00–12:00', i: 'sun' }, { id: 'pm', t: L('Afternoon', 'بعد الظهر'), s: '12:00–16:00', i: 'clock' }, { id: 'eve', t: L('Evening', 'مساءً'), s: '16:00–19:00', i: 'calendar' }];
  const URG = () => [{ id: 'low', t: L('Can wait', 'يمكن أن ينتظر') }, { id: 'normal', t: L('Soon', 'قريباً') }, { id: 'urgent', t: L('Urgent', 'عاجل') }];
  const flow = (n, title, sub, inner, bar) => `<div class="mr-flow" style="display:contents">
      <div class="mr-flowhead">${M.steps(STEPS, n - 1)}<div><div class="f-k">${L(`Step ${n} of ${STEPS}`, `الخطوة ${n} من ${STEPS}`)}</div><h2 style="margin-top:4px">${title}</h2></div>${sub ? `<p>${sub}</p>` : ''}</div>
      ${inner}<div class="mr-flowbar">${bar}</div></div>`;
  S.book = (step, __, back) => {
    const d = draft();
    const c = d.cat ? D.cat(d.cat) : null;
    const n = step === 'done' ? 6 : Math.max(1, Math.min(STEPS, +step || 1));
    const cfg = (body, extra = {}) => ({ title: L('New request', 'طلب جديد'), back: back || 'requests', tab: 'requests', hideTabs: true, body, ...extra });
    if (n > 1 && n < 6 && !c) return S.book('1', __, back);
    if (n === 1) return cfg(flow(1, L('What needs fixing?', 'ما الذي يحتاج إلى إصلاح؟'), L('Pick the closest match — the provider can adjust it.', 'اختاري الأقرب — ويمكن للمزوّد تعديله.'),
      `<div class="mr-cats">${D.serviceCats.map((x) => `<button class="mr-cat ${d.cat === x.id ? 'on' : ''}" data-act="mrBookCat" data-arg="${x.id}"><span class="c-i">${icon(x.icon)}</span>${esc(tx(x.name))}</button>`).join('')}</div>`,
      d.cat ? M.btn(L('Continue', 'متابعة'), { kind: 'dark', block: true, go: 'book-2' }) : `<div class="mr-foot">${L('Tap a category to continue', 'اضغطي على فئة للمتابعة')}</div>`), { back: back || 'requests' });
    if (n === 2) return cfg(flow(2, L('Tell us what’s happening', 'أخبرينا بما يحدث'), '', `
      <div class="mr-seg2">
        <button class="mr-choice ${d.where === 'unit' ? 'on' : ''}" data-act="set" data-arg="mrb:where=unit">${icon('door')}<b>${L('My apartment', 'شقتي')}</b><span>${L('Inside unit 803', 'داخل الوحدة 803')}</span></button>
        <button class="mr-choice ${d.where === 'common' ? 'on' : ''}" data-act="set" data-arg="mrb:where=common">${icon('building')}<b>${L('Common area', 'منطقة مشتركة')}</b><span>${L('Lobby, stairs, roof, parking…', 'الردهة، الدرج، السطح، الموقف…')}</span></button>
      </div>
      <label class="mr-label" for="mrb-title">${L('Short title', 'عنوان مختصر')}</label>
      <input class="mr-input" id="mrb-title" data-model="mrb:title" data-norender value="${esc(d.title)}" placeholder="${esc(L(`e.g. ${tx(c.name)} problem in the kitchen`, `مثال: مشكلة ${tx(c.name)} في المطبخ`))}" autocomplete="off" style="margin-top:-12px">
      <label class="mr-label" for="mrb-desc">${L('What did you notice?', 'ماذا لاحظتِ؟')}</label>
      <textarea class="mr-input ta" id="mrb-desc" data-model="mrb:desc" data-norender placeholder="${esc(L('Since when, how often, anything you already tried…', 'منذ متى، وكم مرة، وما الذي جرّبتِه…'))}" style="margin-top:-12px">${esc(d.desc)}</textarea>
      <div class="mr-label">${L('How urgent?', 'ما مدى الاستعجال؟')}</div>
      <div class="mr-pills2" style="margin-top:-12px">${URG().map((u) => `<button class="mr-pill ${d.urg === u.id ? 'on' : ''} ${u.id === 'urgent' ? 'urgent' : ''}" data-act="set" data-arg="mrb:urg=${u.id}">${u.id === 'urgent' ? icon('alert') : ''}${u.t}</button>`).join('')}</div>
      ${d.urg === 'urgent' ? ui.callout(L('For leaks, gas smells or power sparks call the building emergency line now: <bdi>+970 2 296 4499</bdi>.', 'في حالات التسريب أو رائحة الغاز أو الشرر الكهربائي اتصلي فوراً بخط طوارئ المبنى: <bdi>+970 2 296 4499</bdi>.'), 'warn', 'alert') : ''}`,
      M.btn(L('Continue', 'متابعة'), { kind: 'dark', block: true, act: 'mrBookNext', arg: '3' })));
    if (n === 3) return cfg(flow(3, L('Add photos', 'أضيفي صوراً'), L('Photos help the technician bring the right parts. Optional.', 'تساعد الصور الفني على إحضار القطع المناسبة. اختياري.'), `
      <div class="mr-photos">${[0, 1, 2].map((i) => st.photos[i] != null ? `<div class="mr-ph">${M.photo(B.art.interior(st.photos[i]))}<button class="x" data-act="mrPhotoDel" data-arg="${i}" aria-label="${esc(L('Remove photo', 'إزالة الصورة'))}">${icon('x')}</button></div>` : `<div class="mr-ph"><button class="mx-photo" style="width:100%" data-act="mrPhotoAdd" aria-label="${esc(L('Add photo', 'إضافة صورة'))}">${icon(i === st.photos.length ? 'camera' : 'plus')}</button></div>`).join('')}</div>
      ${note(L('In the prototype a sample photo is added — the camera is not used.', 'في النموذج تُضاف صورة نموذجية — لا يتم استخدام الكاميرا.'), 'camera')}`,
      M.btn(st.photos.length ? L(`Continue with ${st.photos.length} photo${st.photos.length > 1 ? 's' : ''}`, `متابعة مع ${st.photos.length} صور`) : L('Skip for now', 'تخطّي الآن'), { kind: st.photos.length ? 'dark' : 'ghost', block: true, go: 'book-4' })));
    if (n === 4) {
      const days = [1, 2, 3, 4, 5, 6, 7].map((k) => { const x = new Date(B.today); x.setDate(x.getDate() + k); return x; }).filter((x) => x.getDay() !== 5);
      const isoOf = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
      return cfg(flow(4, L('When suits you?', 'ما الوقت المناسب لكِ؟'), L('The provider confirms the exact time.', 'يؤكد المزوّد الوقت بالضبط.'), `
        <div class="mr-days">${days.map((x) => `<button class="mr-day ${d.date === isoOf(x) ? 'on' : ''}" data-act="set" data-arg="mrb:date=${isoOf(x)}"><small>${B.dow(x.getDay())}</small><b>${x.getDate()}</b></button>`).join('')}</div>
        <div class="mr-slots">${SLOTS().map((s) => `<button class="mr-slot ${d.slot === s.id ? 'on' : ''}" data-act="set" data-arg="mrb:slot=${s.id}">${icon(s.i)}<b>${s.t}</b><span>${s.s}</span></button>`).join('')}</div>
        <div class="mr-label">${L('Access', 'الدخول')}</div>
        <div class="mr-seg2" style="margin-top:-12px">
          <button class="mr-choice ${d.access === 'home' ? 'on' : ''}" data-act="set" data-arg="mrb:access=home">${icon('user')}<b>${L('I’ll be home', 'سأكون في المنزل')}</b><span>${L('Call me on arrival', 'اتصلوا بي عند الوصول')}</span></button>
          <button class="mr-choice ${d.access === 'security' ? 'on' : ''}" data-act="set" data-arg="mrb:access=security">${icon('shield')}<b>${L('Lobby security', 'أمن الردهة')}</b><span>${L('Can let them in with me on the phone', 'يمكنهم إدخاله بحضوري هاتفياً')}</span></button>
        </div>`, M.btn(L('Review request', 'مراجعة الطلب'), { kind: 'dark', block: true, go: 'book-5' })));
    }
    if (n === 5) {
      const slot = SLOTS().find((s) => s.id === d.slot);
      const p = d.prov ? D.provider(d.prov) : null;
      return cfg(flow(5, L('Check and send', 'راجعي وأرسلي'), '', `
        ${M.group([
          M.cell({ icon: c.icon, tone: 'mint', title: tx(c.name), sub: d.where === 'unit' ? L('My apartment · 803', 'شقتي · 803') : L('Common area', 'منطقة مشتركة'), go: 'book-1', chevron: false, valueSub: L('Edit', 'تعديل') }),
          M.cell({ icon: 'edit', tone: 'mint', title: d.title ? esc(d.title) : L(`${tx(c.name)} issue`, `مشكلة ${tx(c.name)}`), sub: d.desc ? esc(d.desc.slice(0, 90)) + (d.desc.length > 90 ? '…' : '') : L('No description', 'دون وصف'), go: 'book-2', valueSub: L('Edit', 'تعديل'), chevron: false }),
          M.cell({ icon: 'camera', tone: 'mint', title: st.photos.length ? L(`${st.photos.length} photo${st.photos.length > 1 ? 's' : ''}`, st.photos.length === 1 ? 'صورة واحدة' : st.photos.length === 2 ? 'صورتان' : `${st.photos.length} صور`) : L('No photos', 'دون صور'), go: 'book-3', valueSub: L('Edit', 'تعديل'), chevron: false }),
          M.cell({ icon: 'calendar', tone: 'mint', title: `${B.dow(new Date(d.date + 'T12:00:00').getDay())} ${B.dateShort(d.date)} · ${slot.t}`, sub: `${slot.s} · ${d.access === 'home' ? L('You’ll be home', 'ستكونين في المنزل') : L('Lobby security lets them in', 'يُدخلهم أمن الردهة')}`, go: 'book-4', valueSub: L('Edit', 'تعديل'), chevron: false }),
          M.cell({ icon: 'briefcase', tone: 'mint', title: p ? tx(p.name) : L('Arkan assigns a provider', 'تُسند أركان مزوّداً'), sub: p ? L('Requested by you', 'اخترتِه أنتِ') : L('Recommended for repairs covered by your lease', 'موصى به للإصلاحات التي يغطيها عقدك') }),
          M.cell({ icon: d.urg === 'urgent' ? 'alert' : 'clock', tone: d.urg === 'urgent' ? 'bad' : 'mint', title: URG().find((u) => u.id === d.urg).t, sub: L('Priority', 'الأولوية'), go: 'book-2', valueSub: L('Edit', 'تعديل'), chevron: false }),
        ])}
        ${ui.callout(L('<b>No surprise costs.</b> If the repair isn’t covered by your lease, you’ll get a quote to approve before any work starts.', '<b>لا تكاليف مفاجئة.</b> إن لم يغطِّ عقدك الإصلاح، سيصلك عرض سعر للموافقة عليه قبل بدء العمل.'), 'mint', 'shieldCheck')}`,
        `${M.btn(L('Send request', 'إرسال الطلب'), { kind: 'primary', block: true, icon: 'send', act: 'mrBookSubmit' })}<div class="mr-foot">${L('Prototype — the request is added to your list only on this device.', 'نموذج أولي — يُضاف الطلب إلى قائمتك على هذا الجهاز فقط.')}</div>`));
    }
    const q = st.last && D.request(st.last);
    if (!q) return S.book('1', __, back);
    return { title: '', hideTabs: true, actions: [{ icon: 'x', go: 'home', label: L('Close', 'إغلاق') }], body: `<div class="mr-flow" style="display:contents"><div class="mr-done"><span class="s-i">${icon('check')}</span><h2>${L('Request sent', 'تم إرسال الطلب')}</h2><p>${L('Arkan Property Management will review it and assign a provider — usually within a day.', 'ستراجعه أركان لإدارة العقارات وتُسند مزوّداً — عادة خلال يوم.')}</p><div class="ref-box"><span class="muted">${L('Reference', 'المرجع')}</span><b class="id-mono">${q.id}</b></div></div>
      <div class="mr-tl">${[[L('Sent', 'أُرسل'), L('Just now', 'الآن'), 'done'], [L('Review by building management', 'مراجعة إدارة المبنى'), L('Usually within a day', 'عادة خلال يوم'), 'cur'], [L('Technician visit', 'زيارة الفني'), `${B.dateShort(q.visit)} · ${SLOTS().find((s) => s.id === q.slot)?.s || ''}`, '']].map(([t, s, k]) => `<div class="t ${k}"><span class="t-i">${k === 'done' ? icon('check') : ''}</span><div><b>${t}</b><span>${s}</span></div></div>`).join('')}</div>
      <div class="mr-flowbar">${M.btn(L('View request', 'عرض الطلب'), { kind: 'dark', block: true, act: 'mrViewNew' })}${M.btn(L('Back to home', 'العودة للرئيسية'), { kind: 'ghost', block: true, go: 'home' })}</div></div>` };
  };

  /* 13 · Notifications */
  S.notifications = (_, __, back) => {
    st.seenNotifs = true;
    const list = notifs();
    const fresh = list.filter((n) => n.fresh), older = list.filter((n) => !n.fresh);
    const cells = (arr) => M.group(arr.map((n) => M.cell({ icon: n.icon, tone: n.tone, title: n.title, sub: n.sub, valueSub: n.when, go: n.go })));
    return { title: L('Notifications', 'الإشعارات'), large: true, back: back || 'home', body: `${fresh.length ? M.section(L('New', 'جديدة'), cells(fresh)) : ''}${older.length ? M.section(L('Earlier', 'سابقاً'), cells(older)) : ''}${M.group([M.cell({ icon: 'settings', title: L('Notification settings', 'إعدادات الإشعارات'), act: 'mrNotifPrefs' })])}` };
  };

  /* 14 · Profile */
  S.profile = () => {
    const p = D.person(ME), l = lease();
    const body = `
      <div class="mr-me">${ui.avatar(p.name)}<h2>${esc(tx(p.name))}</h2><p>${L('Tenant · Apartment 803', 'مستأجرة · شقة 803')}</p><div class="row-sm wrap" style="justify-content:center">${ui.badge(L('Phone verified', 'الهاتف موثّق'), 'ok', 'check')}${ui.badge(L('Tenancy confirmed', 'الإيجار مؤكّد'), 'ok', 'key')}</div></div>
      ${M.group([
        M.cell({ icon: 'building', tone: 'mint', title: tx(bld().name), sub: id(BID), go: 'building' }),
        M.cell({ icon: 'door', tone: 'mint', title: L('Apartment 803', 'شقة 803'), sub: L(`Tenant until ${B.date(l.end)}`, `مستأجرة حتى ${B.date(l.end)}`), go: 'unit' }),
        M.cell({ icon: 'contract', tone: 'mint', title: L('Lease', 'عقد الإيجار'), sub: id(l.id), value: ui.status(l.status), act: 'mrDoc', arg: 'd-lease' }),
      ], L('My home', 'منزلي'))}
      ${M.group([
        M.cell({ icon: 'user', title: L('Personal information', 'المعلومات الشخصية'), sub: `<bdi>${esc(p.phone)}</bdi>`, act: 'mrInfo' }),
        M.cell({ icon: 'users', title: L('Household', 'أفراد الأسرة'), sub: L('2 adults, 1 child', 'شخصان بالغان وطفل'), act: 'mrHousehold' }),
        M.cell({ icon: 'card', title: L('Payment methods', 'طرق الدفع'), sub: 'Visa •••• 2291', act: 'mxSoon', arg: L('Payment methods', 'طرق الدفع') }),
        M.cell({ icon: 'bell', title: L('Notifications', 'الإشعارات'), go: 'notifications' }),
        M.cell({ icon: 'globe', title: L('Language', 'اللغة'), value: B.isAr() ? 'العربية' : 'English', valueSub: B.isAr() ? 'English' : 'العربية', act: 'lang' }),
      ], L('Account', 'الحساب'))}
      ${M.group([
        M.cell({ icon: 'folder', tone: 'info', title: L('Documents', 'المستندات'), go: 'documents' }),
        M.cell({ icon: 'sparkles', tone: 'info', title: L('Services', 'الخدمات'), go: 'services' }),
        M.cell({ icon: 'pie', tone: 'info', title: L('Building expenses', 'مصاريف المبنى'), go: 'expenses' }),
        M.cell({ icon: 'megaphone', tone: 'info', title: L('Announcements', 'الإعلانات'), go: 'announcements' }),
      ], L('Shortcuts', 'اختصارات'))}
      ${M.group([
        M.cell({ icon: 'swap', tone: 'navy', title: L('Switch profile', 'تبديل الملف'), sub: L('Try the app as an owner, committee or technician', 'جرّبي التطبيق كمالك أو لجنة أو فني'), act: 'mxRoles' }),
        M.cell({ icon: 'compass', tone: 'navy', title: L('Replay welcome', 'إعادة شاشة الترحيب'), go: 'welcome' }),
        M.cell({ icon: 'grid', tone: 'navy', title: L('Demo hub', 'مركز العرض'), go: 'hub' }),
        M.cell({ icon: 'globe', tone: 'navy', title: L('Resident web portal', 'بوابة السكان على الويب'), go: 'resident-home' }),
      ], L('Prototype', 'النموذج الأولي'))}
      ${M.btn(L('Sign out', 'تسجيل الخروج'), { kind: 'danger', block: true, icon: 'logout', act: 'mxSoon', arg: L('Sign out', 'تسجيل الخروج') })}
      <div class="mr-foot">${L('BENA · prototype v0.9 · all people, buildings and figures are fictional.<br>The BENA ID is a digital reference, not proof of ownership.', 'بينا · نموذج أولي 0.9 · جميع الأشخاص والمباني والأرقام وهمية.<br>رقم بينا مرجع رقمي وليس إثباتاً للملكية.')}</div>`;
    return { title: L('Profile', 'الملف الشخصي'), large: true, body };
  };

  /* =====================================================================
   * Actions & forms (prefix mr)
   * ===================================================================== */
  const A = B.act, F = B.submit;
  A.mrJoin = () => { st.joined = true; B.go('m-resident-home'); M.toast(L('Welcome to Al-Masyoun Residence Tower', 'أهلاً بكِ في برج الماصيون السكني')); };
  A.mrMismatch = () => M.sheet({ title: L('Not your home?', 'ليس منزلك؟'), sub: L('Tell Arkan what’s wrong and they’ll correct the invitation.', 'أخبري أركان بالخطأ لتصحيح الدعوة.'), form: 'mrMismatch',
    body: `<div class="mr-opts">${radio('why', 'unit', L('Wrong apartment', 'شقة خاطئة'), L('I live in another unit', 'أسكن في وحدة أخرى'), 'door', true)}${radio('why', 'bld', L('Wrong building', 'مبنى خاطئ'), '', 'building')}${radio('why', 'moved', L('I moved out', 'انتقلت من السكن'), '', 'logout')}</div>`,
    foot: M.btn(L('Send to Arkan', 'إرسال إلى أركان'), { kind: 'dark', type: 'submit' }) });
  F.mrMismatch = () => M.success({ title: L('Thanks — we’ll check', 'شكراً — سنتحقق'), text: L('Arkan Property Management will contact you to fix the invitation.', 'ستتواصل معك أركان لإدارة العقارات لتصحيح الدعوة.'), ref: 'INV-26-0803' });

  A.mrPay = (pid) => {
    const p = payOf(pid);
    if (!p) return;
    const early = p.status === 'upcoming';
    M.sheet({
      title: early ? L('Pay early', 'الدفع المبكر') : L('Pay now', 'ادفعي الآن'), form: 'mrPay',
      body: `<input type="hidden" name="id" value="${p.id}"><div class="mr-sheet-amt"><b class="mr-num">${B.money(p.amount)}</b><span>${esc(tx(p.label))}</span></div>
        ${M.group([M.cell({ icon: p.kind === 'rent' ? 'user' : 'gavel', title: L('Paid to', 'إلى'), sub: payee(p) }), M.cell({ icon: 'calendar', title: early ? L('Due', 'تاريخ الاستحقاق') : L('Due since', 'مستحقة منذ'), sub: B.date(p.date) })])}
        <div class="mr-opts">${radio('method', 'card', L('Visa •••• 2291', 'فيزا •••• 2291'), L('Instant', 'فوري'), 'card', true)}${radio('method', 'bank', L('Bank transfer', 'تحويل بنكي'), L('1–2 working days', 'يوم إلى يومي عمل'), 'landmark')}${radio('method', 'wallet', L('Mobile wallet', 'المحفظة الإلكترونية'), L('Pay with your phone', 'ادفعي بهاتفك'), 'phone')}</div>
        ${note(L('Simulated payment — no money moves.', 'دفع محاكى — لا تنتقل أي أموال.'), 'lock')}`,
      foot: M.btn(L(`Pay ${B.money(p.amount)}`, `ادفعي ${B.money(p.amount)}`), { kind: 'primary', type: 'submit', icon: 'lock' }),
    });
  };
  F.mrPay = (data) => {
    const p = payOf(data.id);
    if (!p) return;
    const method = { card: T('Card', 'بطاقة'), bank: T('Bank transfer', 'تحويل بنكي'), wallet: T('Mobile wallet', 'محفظة إلكترونية') }[data.method] || T('Card', 'بطاقة');
    if (p.status === 'upcoming') { st.upcoming = st.upcoming.filter((x) => x.id !== p.id); D.residentPayments.unshift(p); }
    Object.assign(p, { status: 'paid', method, date: TODAY });
    B.refresh();
    M.success({ title: L('Payment complete', 'تم الدفع'), text: L(`${B.money(p.amount)} · ${tx(p.label)}. Your receipt is in Payments.`, `${B.money(p.amount)} · ${tx(p.label)}. الإيصال في المدفوعات.`), ref: p.id });
  };
  A.mrReceipt = (pid) => {
    const p = payOf(pid);
    if (!p) return;
    M.sheet({ title: L('Receipt', 'الإيصال'), body: `<div class="mr-rcpt"><div class="rc-top">${B.logo(30)}<b class="rc-v mr-num">${B.money(p.amount)}</b>${ui.status('paid')}</div>
      <div class="rc-rows"><div><span>${L('For', 'عن')}</span><b>${esc(tx(p.label))}</b></div><div><span>${L('Paid to', 'إلى')}</span><b>${payee(p)}</b></div><div><span>${L('Date', 'التاريخ')}</span><b>${B.date(p.date)}</b></div><div><span>${L('Method', 'الطريقة')}</span><b>${esc(tx(p.method))}</b></div><div><span>${L('Unit', 'الوحدة')}</span><b>${id(UID)}</b></div><div><span>${L('Receipt no.', 'رقم الإيصال')}</span><b>${id(p.id)}</b></div></div>
      <div class="rc-qr">${B.art.qr(p.amount + p.id.length)}</div></div>${note(L('Simulated receipt · sample data — not an official tax invoice.', 'إيصال محاكى · بيانات نموذجية — ليس فاتورة ضريبية رسمية.'))}`,
      foot: `${M.btn(L('Share', 'مشاركة'), { icon: 'share', act: 'mxSoon', arg: L('Share receipt', 'مشاركة الإيصال') })}${M.btn(L('Save PDF', 'حفظ PDF'), { kind: 'dark', icon: 'download', act: 'mxSoon', arg: L('Save PDF', 'حفظ PDF') })}` });
  };
  A.mrAnn = (aid, el) => {
    const a = D.announcements.find((x) => x.id === aid);
    if (!a) return;
    st.read.add(aid);
    if (el) el.querySelector('.mr-unread')?.remove();
    const m = tagMeta()[a.tag] || tagMeta().notice;
    M.sheet({ title: esc(tx(a.title)), sub: `${esc(byName(a.by))} · ${B.date(a.date)}`, body: `<div class="mr-tags">${ui.badge(m[2], m[1], m[0])}${a.pinned ? ui.badge(L('Pinned', 'مثبّت'), 'navy', 'flag') : ''}</div><p style="font-size:16px;line-height:1.55">${esc(tx(a.body))}</p>`,
      foot: a.tag === 'meeting' ? `${M.btn(L('Close', 'إغلاق'), { act: 'mxClose' })}${M.btn(L('Add to calendar', 'إضافة إلى التقويم'), { kind: 'dark', icon: 'calendar', act: 'mxSoon', arg: L('Add to calendar', 'إضافة إلى التقويم') })}` : M.btn(L('Got it', 'حسناً'), { kind: 'dark', act: 'mxClose' }) });
  };
  A.mrReadAll = () => { anns().forEach((a) => st.read.add(a.id)); B.refresh(); M.toast(L('All announcements marked as read', 'تم تعليم كل الإعلانات كمقروءة')); };
  A.mrCommittee = () => {
    const c = com();
    M.sheet({ title: esc(tx(c.name)), sub: esc(tx(c.basis)), body: `<div class="row-sm wrap">${ui.status('legal')}${ui.badge(c.regNo, 'outline')}</div>${M.group(c.members.map((m) => M.cell({ avatar: D.person(m.p).name, title: D.pname(m.p), sub: tx(m.role) })))}${note(L('A registered owners’ association. Tenants can attend general assemblies; owners vote.', 'جمعية مالكين مسجّلة. يمكن للمستأجرين حضور الهيئة العامة؛ ويصوّت المالكون.'), 'gavel')}`,
      foot: M.btn(L('Message the committee', 'مراسلة اللجنة'), { kind: 'dark', icon: 'chat', act: 'mrContactSend', arg: 'com' }) });
  };
  A.mrContact = (who) => {
    const isOwner = who === 'owner';
    M.sheet({ title: isOwner ? L('Message your landlord', 'مراسلة المالك') : L('Message Arkan', 'مراسلة أركان'), sub: isOwner ? L('Delivered to Khaled Mansour through Arkan Property Management', 'تُسلَّم إلى خالد منصور عبر أركان لإدارة العقارات') : L('Property management · replies Sun–Thu', 'إدارة العقار · الرد من الأحد إلى الخميس'), form: 'mrContact',
      body: `<input type="hidden" name="who" value="${who}">${M.field({ name: 'msg', type: 'textarea', label: L('Message', 'الرسالة'), placeholder: L('Write your message…', 'اكتبي رسالتك…'), required: true })}`,
      foot: `${M.btn(L('Call', 'اتصال'), { icon: 'phone', act: 'mrCall', arg: isOwner ? 'Arkan' : '+970 2 296 4410' })}${M.btn(L('Send', 'إرسال'), { kind: 'dark', type: 'submit', icon: 'send' })}` });
  };
  A.mrContactSend = () => A.mrContact('mgr');
  F.mrContact = () => M.success({ title: L('Message sent', 'تم إرسال الرسالة'), text: L('You’ll get a notification when they reply.', 'ستصلك إشعارات عند الرد.') });
  A.mrCall = (n) => M.toast(L(`Calling ${n} — simulated`, `جارٍ الاتصال بـ ${n} — محاكاة`), 'phone');
  A.mrHousehold = () => M.sheet({ title: L('Household', 'أفراد الأسرة'), sub: L('People who live with you in Apartment 803', 'من يسكن معكِ في شقة 803'), body: M.group([M.cell({ avatar: D.person(ME).name, title: meName(), sub: L('Tenant · lease holder', 'مستأجرة · صاحبة العقد') }), M.cell({ avatar: T('Nabil Haddad', 'نبيل حداد'), title: L('Nabil Haddad', 'نبيل حداد'), sub: L('Adult · spouse', 'بالغ · الزوج') }), M.cell({ avatar: T('Yara Haddad', 'يارا حداد'), title: L('Yara Haddad', 'يارا حداد'), sub: L('Child', 'طفلة') })]) + note(L('Household members are visible only to building management.', 'لا يرى أفراد الأسرة إلا إدارة المبنى.'), 'lock'), foot: M.btn(L('Add member', 'إضافة فرد'), { kind: 'dark', icon: 'userPlus', act: 'mxSoon', arg: L('Add member', 'إضافة فرد') }) });
  A.mrRenew = () => M.sheet({ title: L('Ask to renew', 'طلب التجديد'), sub: L('Your request goes to Khaled Mansour through Arkan.', 'يصل طلبك إلى خالد منصور عبر أركان.'), form: 'mrRenew',
    body: `<div class="mr-opts">${radio('term', '12', L('12 months', '12 شهراً'), L(`From ${B.date('2027-02-01')}`, `ابتداءً من ${B.date('2027-02-01')}`), 'calendar', true)}${radio('term', '24', L('24 months', '24 شهراً'), L('Longer stability, ask for a fixed rent', 'استقرار أطول، مع طلب تثبيت الإيجار'), 'calendarCheck')}</div>${M.field({ name: 'msg', type: 'textarea', label: L('Note (optional)', 'ملاحظة (اختياري)'), placeholder: L('We’d love to stay…', 'نرغب في البقاء…') })}`,
    foot: M.btn(L('Send request', 'إرسال الطلب'), { kind: 'dark', type: 'submit', icon: 'send' }) });
  F.mrRenew = () => { st.renew = true; B.refresh(); M.success({ title: L('Renewal request sent', 'تم إرسال طلب التجديد'), text: L('We’ll notify you when your landlord replies with an offer.', 'سنُعلمك عندما يرد المالك بعرض.'), ref: 'RN-26-0803' }); };
  A.mrTopup = () => M.sheet({ title: L('Top up electricity', 'شحن الكهرباء'), sub: L(`Prepaid meter · balance ${B.money(st.elec)}`, `عداد مسبق الدفع · الرصيد ${B.money(st.elec)}`), form: 'mrTopup',
    body: `<div class="mr-amts">${[50, 100, 200].map((v, i) => `<label class="mr-opt"><input type="radio" name="amt" value="${v}" ${i === 1 ? 'checked' : ''}><span class="o-b"><b class="mr-num" style="font-size:19px">${B.money(v)}</b></span></label>`).join('')}</div>${note(L('Simulated top-up — the meter code is shown instantly in the prototype.', 'شحن محاكى — يظهر رمز العداد فوراً في النموذج.'), 'zap')}`,
    foot: M.btn(L('Top up', 'شحن'), { kind: 'primary', type: 'submit', icon: 'zap' }) });
  F.mrTopup = (data) => { const v = +data.amt || 100; st.elec += v; B.refresh(); M.success({ title: L(`${B.money(v)} added`, `تمت إضافة ${B.money(v)}`), text: L(`New balance ${B.money(st.elec)}. Enter the code on your meter keypad.`, `الرصيد الجديد ${B.money(st.elec)}. أدخلي الرمز على لوحة العداد.`), ref: '4417-2093-8851-0620' }); };
  A.mrDoc = (did) => {
    const d = DOCS().find((x) => x.id === did);
    if (!d) return;
    M.sheet({ title: d.t, sub: `${B.date(d.d)} · ${d.size}${d.by ? ' · ' + d.by : ''}`, body: `<div class="mr-doc"><div class="d-h">${icon(d.icon)}<b>${d.t}</b></div>${[92, 100, 84, 96, 70, 100, 88, 60].map((w) => `<i style="width:${w}%"></i>`).join('')}<div class="d-s"><em>${d.g === 'tenancy' ? 'L. Haddad' : ''}</em><span>${icon('check')}</span></div></div><div class="row-sm" style="justify-content:center">${ui.prov(d.prov, true)}</div>`,
      foot: `${M.btn(L('Share', 'مشاركة'), { icon: 'share', act: 'mxSoon', arg: L('Share', 'مشاركة') })}${M.btn(L('Download', 'تنزيل'), { kind: 'dark', icon: 'download', act: 'mxSoon', arg: L('Download', 'تنزيل') })}` });
  };
  A.mrUpload = () => M.sheet({ title: L('Add a document', 'إضافة مستند'), sub: L('Shared with your building manager for review.', 'يُشارك مع إدارة المبنى للمراجعة.'), form: 'mrUpload',
    body: `${M.field({ name: 'name', label: L('Name', 'الاسم'), placeholder: L('e.g. Renters insurance 2027', 'مثال: تأمين المستأجر 2027'), required: true })}${M.field({ name: 'kind', type: 'select', label: L('Type', 'النوع'), options: [{ v: 'ins', l: L('Insurance', 'تأمين') }, { v: 'id', l: L('ID document', 'وثيقة هوية') }, { v: 'other', l: L('Other', 'أخرى') }] })}<div class="mx-photo" style="aspect-ratio:auto;height:96px;flex-direction:column;gap:6px;display:flex;align-items:center;justify-content:center">${icon('upload')}<span style="font-size:13px">${L('Sample file attached', 'تم إرفاق ملف نموذجي')}</span></div>`,
    foot: M.btn(L('Upload', 'رفع'), { kind: 'dark', type: 'submit', icon: 'upload' }) });
  F.mrUpload = (data) => { st.docs.unshift({ id: 'd-u' + (st.docs.length + 1), g: 'mine', icon: 'paperclip', t: esc(data.name || L('Document', 'مستند')), d: TODAY, size: '420 KB', prov: 'pending', by: L('Uploaded by you', 'رفعتِه أنتِ') }); B.refresh(); M.success({ title: L('Document added', 'تمت إضافة المستند'), text: L('It shows as “pending review” until Arkan checks it.', 'يظهر «قيد المراجعة» حتى تتحقق منه أركان.') }); };
  A.mrProv = (pid) => {
    const p = D.provider(pid);
    M.sheet({ title: esc(tx(p.name)), sub: esc(tx(p.tagline)), body: `<div class="row-sm wrap">${ui.stars(p.rating)}<b>${p.rating}</b><span class="muted">${L(`${p.reviews} reviews · ${p.jobs} jobs · since ${p.since}`, `${p.reviews} تقييماً · ${p.jobs} مهمة · منذ ${p.since}`)}</span></div>
      ${M.group(p.cats.map((cid) => M.cell({ icon: D.cat(cid).icon, tone: 'mint', title: tx(D.cat(cid).name), valueSub: L(`from ${B.money(p.from)}`, `من ${B.money(p.from)}`), act: 'mrBookProv', arg: `${p.id}|${cid}` })))}
      <div class="row-sm wrap"><span class="mr-meta">${icon('clock')}${esc(tx(p.response))}</span>${p.verified ? ui.badge(L('Verified business', 'نشاط موثّق'), 'ok', 'badgeCheck') : ui.badge(L('Not yet verified', 'غير موثّق بعد'), 'outline')}</div>
      ${note(L('Sample provider and ratings · BENA does not endorse providers.', 'مزوّد وتقييمات نموذجية · لا تُزكّي بينا المزوّدين.'))}`,
      foot: M.btn(L('Request this provider', 'اطلبي هذا المزوّد'), { kind: 'primary', icon: 'send', act: 'mrBookProv', arg: `${p.id}|${p.cats[0]}` }) });
  };
  A.mrBookProv = (arg) => { const [pid, cid] = String(arg).split('|'); resetDraft(); B.vs['mrb:prov'] = pid; B.vs['mrb:cat'] = cid; B.go('book-2'); };
  A.mrBookCat = (cid) => { const fromFlow = B.route.page === 'book'; if (!fromFlow) resetDraft(); B.vs['mrb:cat'] = cid; B.go('book-2'); };
  A.mrBookNext = (n) => {
    const t = document.getElementById('mrb-title'), d = document.getElementById('mrb-desc');
    if (t) B.vs['mrb:title'] = t.value.trim();
    if (d) B.vs['mrb:desc'] = d.value.trim();
    B.go('book-' + n);
  };
  A.mrPhotoAdd = () => { if (st.photos.length < 3) st.photos.push([3, 7, 11][st.photos.length]); B.refresh(); };
  A.mrPhotoDel = (i) => { st.photos.splice(+i, 1); B.refresh(); };
  A.mrBookSubmit = () => {
    const d = draft(), c = D.cat(d.cat);
    const rid = `MR-${st.seq++}`;
    const title = d.title || L(`${tx(c.name)} issue`, `مشكلة ${tx(c.name)}`);
    D.requests.unshift({ id: rid, building: BID, unit: d.where === 'unit' ? UID : null, by: ME, cat: d.cat, title: T(title, title), desc: d.desc ? T(d.desc, d.desc) : null, status: 'open', priority: d.urg === 'urgent' ? 'high' : d.urg === 'low' ? 'low' : 'medium', created: TODAY, provider: d.prov || null, visit: d.date, slot: d.slot, scope: d.where === 'unit' ? 'unit' : 'common', photos: st.photos.map((s) => B.art.interior(s)) });
    st.msgs[rid] = [{ by: 'mgr', text: T('Thanks — we received your request and will assign a provider shortly.', 'شكراً — استلمنا طلبك وسنُسند مزوّداً قريباً.'), when: NOW }];
    st.last = rid;
    VISIT[rid] = (SLOTS().find((x) => x.id === d.slot) || SLOTS()[0]).s;
    resetDraft();
    stack.length = 0;
    B.go('book-done');
  };
  A.mrViewNew = () => { stack.length = 0; stack.push('requests'); B.go('request-' + st.last); };
  A.mrFocus = () => { const i = document.getElementById('mr-compose'); if (i) { i.scrollIntoView({ block: 'center', behavior: 'smooth' }); i.focus({ preventScroll: true }); } else M.toast(L('This request is closed', 'هذا الطلب مغلق'), 'info'); };
  F.mrMsg = (data) => {
    const text = String(data.text || '').trim();
    if (!text) return;
    const q = D.request(data.id);
    msgsOf(q).push({ by: 'me', text, when: NOW });
    B.refresh();
    const s2 = document.querySelector('.mx-screen'); if (s2) s2.scrollTop = s2.scrollHeight;
    setTimeout(() => {
      msgsOf(q).push({ by: 'mgr', text: T('Noted — we’ve passed this to the technician.', 'تم — أبلغنا الفني بذلك.'), when: NOW });
      if (B.route.exp === 'mobile' && B.route.role === 'resident' && B.route.page === 'request' && !document.querySelector('.mx-scrim')) { B.refresh(); M.toast(L('New reply from Arkan', 'رد جديد من أركان'), 'chat'); }
    }, 1600);
  };
  A.mrRate = (arg) => { const [rid, n] = String(arg).split('|'); const q = D.request(rid); if (q) q.rating = +n; B.refresh(); M.toast(L('Thanks — your rating helps neighbours choose', 'شكراً — تقييمك يساعد جيرانك على الاختيار'), 'star'); };
  A.mrResolve = (rid) => {
    const q = D.request(rid);
    q.status = 'completed'; q.closed = TODAY;
    msgsOf(q).push({ by: 'me', text: T('All fixed — thank you!', 'تم الإصلاح — شكراً لكم!'), when: NOW });
    B.refresh();
    M.sheet({ title: L('Rate the service', 'قيّمي الخدمة'), sub: q.provider ? esc(tx(D.provider(q.provider).name)) : '', body: `<div class="mr-rate" style="padding:8px 0">${[1, 2, 3, 4, 5].map((n) => `<button data-act="mrRateSheet" data-arg="${rid}|${n}" aria-label="${n}">${icon('star')}</button>`).join('')}</div>${note(L('Your rating is shared with the provider and other residents.', 'يُشارك تقييمك مع المزوّد وبقية السكان.'), 'star')}`, foot: M.btn(L('Not now', 'ليس الآن'), { act: 'mxClose' }) });
  };
  A.mrRateSheet = (arg) => { const [rid, n] = String(arg).split('|'); const q = D.request(rid); if (q) q.rating = +n; B.refresh(); M.toast(L('Request closed — thanks for rating', 'أُغلق الطلب — شكراً على التقييم'), 'star'); };
  A.mrCancel = (rid) => M.sheet({ title: L('Cancel this request?', 'إلغاء هذا الطلب؟'), sub: L('The provider will be told not to come.', 'سيُبلَّغ المزوّد بعدم الحضور.'), body: note(L('You can always report the issue again later.', 'يمكنكِ الإبلاغ عن العطل مجدداً لاحقاً.')), foot: `${M.btn(L('Keep it', 'إبقاء'), { act: 'mxClose' })}${M.btn(L('Cancel request', 'إلغاء الطلب'), { kind: 'danger', act: 'mrCancelOk', arg: rid })}` });
  A.mrCancelOk = (rid) => { const q = D.request(rid); q.status = 'cancelled'; q.closed = TODAY; B.refresh(); M.toast(L('Request cancelled', 'تم إلغاء الطلب')); };
  A.mrAffected = (rid) => { if (st.affected.has(rid)) st.affected.delete(rid); else st.affected.add(rid); B.refresh(); if (st.affected.has(rid)) M.toast(L('Added — you’ll get updates on this issue', 'تمت الإضافة — ستصلك تحديثات هذا العطل'), 'bell'); };
  const RESCHED = [['2026-11-26', '14:00–16:00'], ['2026-11-28', '10:00–12:00'], ['2026-11-29', '09:00–11:00']];
  A.mrResched = (rid) => M.sheet({ title: L('Change visit time', 'تغيير موعد الزيارة'), sub: L('The technician will confirm the new time.', 'سيؤكد الفني الموعد الجديد.'), form: 'mrResched',
    body: `<input type="hidden" name="id" value="${rid}"><div class="mr-opts">${RESCHED.map(([d, t], i) => radio('slot', `${d}|${t}`, `${B.dow(new Date(d + 'T12:00:00').getDay())} ${B.dateShort(d)}`, t, 'clock', i === 0)).join('')}</div>`,
    foot: M.btn(L('Request change', 'طلب التغيير'), { kind: 'dark', type: 'submit' }) });
  F.mrResched = (data) => {
    const q = D.request(data.id);
    const [d, t] = String(data.slot || '').split('|');
    if (q && d) { q.visit = d; VISIT[q.id] = t; msgsOf(q).push({ by: 'me', text: both(() => L(`Could we move the visit to ${B.date(d)}, ${t}?`, `هل يمكن نقل الزيارة إلى ${B.date(d)}، ${t}؟`)), when: NOW }); }
    B.refresh();
    M.success({ title: L('Change requested', 'تم طلب التغيير'), text: L('The visit shows the new time; the technician will confirm.', 'تظهر الزيارة بالموعد الجديد؛ وسيؤكد الفني.') });
  };
  A.mrInfo = () => { const p = D.person(ME); M.sheet({ title: L('Personal information', 'المعلومات الشخصية'), form: 'mrInfo', body: `${M.field({ name: 'name', label: L('Full name', 'الاسم الكامل'), value: p.name })}${M.field({ name: 'phone', type: 'tel', label: L('Mobile', 'الجوال'), value: p.phone })}${M.field({ name: 'email', label: L('Email', 'البريد الإلكتروني'), value: p.email })}${note(L('Shared only with your building manager and landlord.', 'تُشارك فقط مع إدارة المبنى والمالك.'), 'lock')}`, foot: M.btn(L('Save', 'حفظ'), { kind: 'dark', type: 'submit' }) }); };
  F.mrInfo = () => { M.close(); M.toast(L('Saved', 'تم الحفظ')); };
  A.mrNotifPrefs = () => M.sheet({ title: L('Notification settings', 'إعدادات الإشعارات'), form: 'mrPrefs', body: `<div>${[[L('Payments & receipts', 'المدفوعات والإيصالات'), 1], [L('Repair updates', 'تحديثات الإصلاح'), 1], [L('Building announcements', 'إعلانات المبنى'), 1], [L('Meetings & votes', 'الاجتماعات والتصويت'), 0]].map(([t, on], i) => `<label class="mr-toggle"><span>${t}</span><input type="checkbox" name="p${i}" ${on ? 'checked' : ''}></label>`).join('')}</div>`, foot: M.btn(L('Done', 'تم'), { kind: 'dark', type: 'submit' }) });
  F.mrPrefs = () => { M.close(); M.toast(L('Preferences updated', 'تم تحديث التفضيلات')); };

  /* =====================================================================
   * Registration
   * ===================================================================== */
  const screens = {};
  Object.keys(S).forEach((k) => { screens[k] = (rid, route) => { const back = track(rid ? `${k}-${rid}` : k, k); return S[k](rid, route, back); }; });
  B.mrole({
    id: 'resident', webRole: 'resident', icon: 'home',
    name: T('Resident / Tenant', 'ساكن / مستأجر'), short: T('Resident', 'ساكن'),
    persona: { name: T('Lina Haddad', 'لينا حداد'), sub: T('Tenant · Apartment 803', 'مستأجرة · شقة 803') },
    get home() { return st.joined ? 'home' : 'welcome'; },
    tabs: [
      { id: 'home', label: T('Home', 'الرئيسية'), icon: 'home' },
      { id: 'building', label: T('Building', 'المبنى'), icon: 'building' },
      { id: 'requests', label: T('Requests', 'الطلبات'), icon: 'wrench', get badge() { return myReqs().filter((q) => isOpen(q) && q.by === ME).length || ''; } },
      { id: 'payments', label: T('Payments', 'المدفوعات'), icon: 'wallet', get badge() { return dues().length || ''; } },
      { id: 'profile', label: T('Profile', 'حسابي'), icon: 'user' },
    ],
    more: [
      { id: 'welcome', label: T('Welcome', 'الترحيب'), icon: 'compass' },
      { id: 'unit', label: T('My unit', 'وحدتي'), icon: 'door' },
      { id: 'announcements', label: T('Announcements', 'الإعلانات'), icon: 'megaphone' },
      { id: 'request', label: T('Request details', 'تفاصيل الطلب'), icon: 'wrench' },
      { id: 'expenses', label: T('Building expenses', 'مصاريف المبنى'), icon: 'pie' },
      { id: 'documents', label: T('Documents', 'المستندات'), icon: 'folder' },
      { id: 'services', label: T('Services', 'الخدمات'), icon: 'sparkles' },
      { id: 'book', label: T('Service request', 'طلب خدمة'), icon: 'plus' },
      { id: 'notifications', label: T('Notifications', 'الإشعارات'), icon: 'bell' },
    ],
    screens,
    notifications: notifs,
  });
})();
