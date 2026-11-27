/*
 * BENA Mobile Application — shell.
 * A separately designed, touch-first experience (not the web app resized):
 * native-style large titles, stack navigation with back, bottom tab bar,
 * in-device bottom sheets and toasts, grouped lists and big touch targets.
 * On desktop it renders inside a phone frame with a prototype control panel;
 * on phones it is full-screen.
 *
 * Register a role:
 *   B.mrole({ id, name:{en,ar}, short, icon, persona:{ name:{en,ar}, sub:{en,ar} }, home:'home',
 *             tabs:[{ id, label:{en,ar}, icon }],      // max 5, shown in the tab bar
 *             more:[{ id, label:{en,ar}, icon }],       // other top-level screens (listed by check tool)
 *             screens:{ id: (id) => string | { title, large, back, actions:[{icon, go|act, arg, label}], tab, body, bg } },
 *             notifications: () => [{ icon, title, sub, when, go }] })
 * Screens return a body string, or an object to configure the header:
 *   large: true → big iOS-style title; back: 'home' (relative screen route) shows a back button;
 *   tab: 'home' marks the active tab for sub-screens; bg: 'white' for a white canvas.
 */
(function () {
  const B = (window.B = window.B || {});
  const { tx, L, icon, esc } = B;
  const M = (B.m = B.m || {});

  B.css(`
  :root { --mx-w: 430px; --mx-h: 932px; }
  .mx-stage { min-height: 100vh; min-height: 100dvh; display: grid; grid-template-columns: minmax(280px, 380px) auto; justify-content: center; align-items: center; gap: 56px; padding: 24px 32px; background: radial-gradient(ellipse 70% 60% at 65% 45%, #FFFFFF 0%, #E7EEEB 60%, #DDE7E3 100%); }
  .mx-panel { display: flex; flex-direction: column; gap: 22px; max-width: 380px; }
  .mx-panel .brand { color: var(--navy); }
  .mx-panel h1 { font-size: 34px; line-height: 1.12; }
  .mx-panel p { color: var(--text-2); font-size: 14.5px; }
  .mx-panel .mxp-label { font-size: 11.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--text-3); margin-bottom: 8px; }
  html[dir="rtl"] .mx-panel .mxp-label { letter-spacing: 0; }
  .mx-roles { display: flex; flex-direction: column; gap: 6px; }
  .mx-role { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 14px; border: 1px solid transparent; text-align: start; width: 100%; transition: background .2s, border-color .2s; }
  .mx-role:hover { background: rgba(255,255,255,.7); }
  .mx-role.on { background: #fff; border-color: var(--line); box-shadow: var(--shadow-1); }
  .mx-role .ri { width: 36px; height: 36px; border-radius: 11px; background: var(--navy); color: var(--mint); display: grid; place-items: center; flex: none; }
  .mx-role .ri svg { width: 18px; height: 18px; }
  .mx-role b { font-size: 14px; display: block; }
  .mx-role small { font-size: 12px; color: var(--text-3); display: block; }
  .mx-links { display: flex; gap: 8px; flex-wrap: wrap; }
  .mx-device { position: relative; width: calc(min(var(--mx-h), 100dvh - 48px) * 430 / 932); height: min(var(--mx-h), calc(100dvh - 48px)); border-radius: 58px; background: #0B1218; padding: 12px; box-shadow: 0 50px 100px rgba(13,31,43,.28), 0 0 0 1.5px #2B3A46 inset; }
  .mx-phone { position: relative; width: 100%; height: 100%; border-radius: 46px; overflow: hidden; background: var(--bg); display: flex; flex-direction: column; isolation: isolate; }
  .mx-status { height: 50px; flex: none; display: flex; align-items: center; justify-content: space-between; padding: 0 30px 0 36px; font: 600 15px/1 var(--font); color: var(--ink); position: relative; z-index: 6; background: var(--mx-top, var(--bg)); }
  .mx-island { position: absolute; left: 50%; top: 11px; width: 120px; height: 34px; margin-left: -60px; border-radius: 20px; background: #05080B; }
  .mx-status .st-i { display: flex; gap: 6px; align-items: center; }
  .mx-status .st-i svg { width: 18px; height: 12px; }
  .mx-head { flex: none; position: relative; z-index: 5; background: var(--mx-top, var(--bg)); padding: 6px 16px 10px; display: flex; align-items: center; gap: 8px; min-height: 52px; border-bottom: 1px solid transparent; transition: border-color .2s; }
  .mx-head.line { border-bottom-color: var(--line); }
  .mx-head .mh-title { flex: 1; text-align: center; font: 600 17px/1.25 var(--font); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
  html[dir="rtl"] .mx-head .mh-title { font-family: var(--font-ar); }
  .mx-head .mh-side { width: 118px; display: flex; gap: 2px; align-items: center; flex: none; }
  .mx-head .mh-side.end { justify-content: flex-end; }
  .mx-iconbtn { width: 44px; height: 44px; border-radius: 22px; display: grid; place-items: center; color: var(--ink); flex: none; }
  .mx-iconbtn:active { background: rgba(20,43,59,.06); }
  .mx-iconbtn svg { width: 23px; height: 23px; }
  .mx-iconbtn.dot::after { content: ""; position: absolute; width: 9px; height: 9px; border-radius: 9px; background: var(--mint); border: 2px solid var(--bg); transform: translate(10px, -10px); }
  .mx-back { display: inline-flex; align-items: center; gap: 2px; height: 44px; padding-inline-end: 6px; color: var(--mint-ink); font-weight: 600; font-size: 16px; }
  .mx-back svg { width: 26px; height: 26px; }
  .mx-large { padding: 2px 20px 14px; display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; background: var(--mx-top, var(--bg)); }
  .mx-large h1 { font-size: 32px; line-height: 1.12; letter-spacing: -.02em; }
  .mx-large small { display: block; font-size: 14px; color: var(--text-2); margin-bottom: 4px; font-weight: 500; }
  .mx-screen { flex: 1; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; scrollbar-width: none; position: relative; }
  .mx-screen::-webkit-scrollbar { display: none; }
  .mx-screen.white, .mx-phone.white .mx-head, .mx-phone.white .mx-status, .mx-phone.white .mx-large { background: #fff; }
  .mx-body { padding: 4px 16px 28px; display: flex; flex-direction: column; gap: 22px; }
  .mx-phone.has-tabs .mx-body { padding-bottom: 104px; }
  .mx-tabs { position: absolute; inset-inline: 0; bottom: 0; z-index: 8; display: flex; padding: 8px 8px 26px; background: rgba(255,255,255,.92); backdrop-filter: saturate(1.6) blur(20px); -webkit-backdrop-filter: saturate(1.6) blur(20px); border-top: 1px solid var(--line); }
  .mx-tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 4px 0; font-size: 11px; font-weight: 600; color: var(--text-3); min-width: 0; min-height: 50px; }
  .mx-tab svg { width: 25px; height: 25px; }
  .mx-tab > span:last-child { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .mx-tab.on { color: var(--navy); }
  .mx-tab.on .mt-i { color: var(--mint-ink); }
  .mx-tab .mt-i { position: relative; }
  .mx-tab .mt-b { position: absolute; top: -3px; inset-inline-end: -8px; min-width: 18px; height: 18px; border-radius: 9px; background: #E5484D; color: #fff; font-size: 10.5px; display: grid; place-items: center; padding: 0 4px; border: 2px solid #fff; }
  .mx-home-ind { position: absolute; bottom: 8px; left: 50%; width: 140px; height: 5px; margin-left: -70px; border-radius: 3px; background: rgba(20,43,59,.85); z-index: 9; pointer-events: none; }
  .mx-enter { animation: mxIn .32s var(--ease) both; }
  .mx-enter.back { animation-name: mxInBack; }
  @keyframes mxIn { from { transform: translateX(28px); opacity: .001; } to { transform: none; opacity: 1; } }
  @keyframes mxInBack { from { transform: translateX(-28px); opacity: .001; } to { transform: none; opacity: 1; } }
  html[dir="rtl"] .mx-enter { animation-name: mxInBack; }
  html[dir="rtl"] .mx-enter.back { animation-name: mxIn; }
  /* sheets & toasts (inside the phone) */
  .mx-scrim { position: absolute; inset: 0; z-index: 20; background: rgba(13,31,43,.42); animation: fade .2s; display: flex; align-items: flex-end; }
  .mx-sheet { width: 100%; max-height: 90%; background: #fff; border-radius: 26px 26px 0 0; display: flex; flex-direction: column; animation: sheetIn .34s var(--ease); box-shadow: 0 -10px 40px rgba(0,0,0,.12); }
  .mx-sheet .ms-grab { width: 40px; height: 5px; border-radius: 3px; background: #D3DCD8; margin: 8px auto 2px; flex: none; }
  .mx-sheet .ms-head { display: flex; align-items: flex-start; gap: 10px; padding: 10px 20px 8px; }
  .mx-sheet .ms-head h3 { font-size: 20px; flex: 1; }
  .mx-sheet .ms-head p { font-size: 14px; color: var(--text-2); margin-top: 3px; }
  .mx-sheet .ms-body { padding: 6px 20px 18px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
  .mx-sheet .ms-foot { padding: 12px 20px 30px; display: flex; gap: 10px; border-top: 1px solid var(--line-2); }
  .mx-sheet .ms-foot .mx-btn { flex: 1; }
  .mx-toast { position: absolute; z-index: 30; left: 16px; right: 16px; bottom: 112px; display: flex; gap: 10px; align-items: center; padding: 14px 16px; border-radius: 16px; background: var(--navy); color: #fff; font-size: 14.5px; font-weight: 500; box-shadow: var(--shadow-3); animation: toastIn .3s var(--ease); }
  .mx-toast svg { width: 20px; height: 20px; color: var(--mint); flex: none; }
  /* primitives */
  .mx-sec { display: flex; flex-direction: column; gap: 10px; }
  .mx-sec-h { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; padding: 0 4px; }
  .mx-sec-h h2 { font-size: 20px; letter-spacing: -.01em; }
  .mx-sec-h button { font-size: 15px; font-weight: 600; color: var(--mint-ink); }
  .mx-sec-h .sub { font-size: 13px; color: var(--text-3); }
  .mx-group { background: #fff; border-radius: 18px; overflow: hidden; border: 1px solid var(--line-2); }
  .mx-glabel { font-size: 13px; font-weight: 600; color: var(--text-3); padding: 0 6px 6px; text-transform: uppercase; letter-spacing: .05em; }
  html[dir="rtl"] .mx-glabel { letter-spacing: 0; }
  .mx-cell { display: flex; align-items: center; gap: 14px; padding: 13px 16px; min-height: 58px; width: 100%; text-align: start; position: relative; background: #fff; }
  .mx-cell + .mx-cell::before { content: ""; position: absolute; top: 0; inset-inline: 66px 0; border-top: 1px solid var(--line-2); }
  .mx-cell.noicon + .mx-cell.noicon::before { inset-inline-start: 16px; }
  button.mx-cell:active, .mx-cell[data-go]:active { background: #F3F6F5; }
  .mx-cell .mc-i { width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; background: var(--line-2); color: var(--navy); flex: none; }
  .mx-cell .mc-i svg { width: 21px; height: 21px; }
  .mx-cell .mc-i.mint { background: var(--mint-50); color: var(--mint-ink); }
  .mx-cell .mc-i.warn { background: var(--warn-bg); color: var(--warn); }
  .mx-cell .mc-i.bad { background: var(--bad-bg); color: var(--bad); }
  .mx-cell .mc-i.info { background: var(--info-bg); color: var(--info); }
  .mx-cell .mc-i.violet { background: var(--violet-bg); color: var(--violet); }
  .mx-cell .mc-i.navy { background: var(--navy); color: var(--mint); }
  .mx-cell .mc-b { flex: 1; min-width: 0; }
  .mx-cell .mc-t { font-size: 16px; font-weight: 600; line-height: 1.3; overflow-wrap: anywhere; }
  .mx-cell .mc-s { font-size: 13.5px; color: var(--text-2); margin-top: 2px; line-height: 1.35; overflow-wrap: anywhere; }
  .mx-cell .mc-v { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 14.5px; color: var(--text-2); text-align: end; }
  .mx-cell .mc-v b { color: var(--ink); font-variant-numeric: tabular-nums; }
  .mx-cell .mc-c { width: 18px; height: 18px; color: #B6C2BD; flex: none; }
  .mx-card { background: #fff; border-radius: 20px; padding: 18px; border: 1px solid var(--line-2); display: flex; flex-direction: column; gap: 12px; text-align: start; width: 100%; }
  .mx-card.navy { background: var(--navy); border-color: var(--navy); color: var(--navy-ink); }
  .mx-card.navy h3, .mx-card.navy b { color: #fff; }
  .mx-card.mint { background: var(--mint-50); border-color: var(--mint-100); }
  .mx-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 50px; padding: 0 20px; border-radius: 14px; font-size: 16px; font-weight: 600; border: 1px solid transparent; transition: transform .1s; white-space: nowrap; }
  .mx-btn:active { transform: scale(.98); }
  .mx-btn svg { width: 20px; height: 20px; }
  .mx-btn.primary { background: var(--mint); color: var(--navy); }
  .mx-btn.dark { background: var(--navy); color: #fff; }
  .mx-btn.ghost { background: #fff; border-color: var(--line); color: var(--ink); }
  .mx-btn.soft { background: var(--mint-50); color: var(--mint-ink); }
  .mx-btn.danger { background: var(--bad-bg); color: var(--bad); }
  .mx-btn.block { width: 100%; }
  .mx-btn.sm { min-height: 40px; font-size: 14.5px; padding: 0 14px; border-radius: 12px; }
  .mx-seg { display: flex; padding: 3px; border-radius: 12px; background: #E6ECEA; gap: 2px; }
  .mx-seg button { flex: 1; min-height: 36px; border-radius: 10px; font-size: 14px; font-weight: 600; color: var(--text-2); }
  .mx-seg button.on { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(20,43,59,.12); }
  .mx-chips { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; margin-inline: -16px; padding-inline: 16px; }
  .mx-chips::-webkit-scrollbar { display: none; }
  .mx-chip { flex: none; min-height: 38px; padding: 0 16px; border-radius: 19px; background: #fff; border: 1px solid var(--line); font-size: 14px; font-weight: 600; color: var(--text-2); display: inline-flex; align-items: center; gap: 6px; }
  .mx-chip svg { width: 16px; height: 16px; }
  .mx-chip.on { background: var(--navy); border-color: var(--navy); color: #fff; }
  .mx-kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .mx-kpi { background: #fff; border: 1px solid var(--line-2); border-radius: 18px; padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; text-align: start; }
  .mx-kpi .k-l { font-size: 13px; color: var(--text-2); font-weight: 500; display: flex; align-items: center; gap: 6px; }
  .mx-kpi .k-l svg { width: 15px; height: 15px; }
  .mx-kpi .k-v { font-family: var(--font-display); font-size: 24px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.1; }
  .mx-kpi .k-s { font-size: 12.5px; color: var(--text-3); }
  .mx-kpi.alert { border-color: #F4D9A8; background: #FFFBF3; }
  .mx-kpi.alert .k-l { color: var(--warn); }
  .mx-quick { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .mx-qa { display: flex; flex-direction: column; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 600; text-align: center; padding: 4px 0; }
  .mx-qa .q-i { width: 60px; height: 60px; border-radius: 20px; background: #fff; border: 1px solid var(--line); display: grid; place-items: center; color: var(--navy); }
  .mx-qa .q-i svg { width: 26px; height: 26px; }
  .mx-qa .q-i.mint { background: var(--mint); border-color: var(--mint); }
  .mx-search { display: flex; align-items: center; gap: 8px; height: 44px; border-radius: 12px; background: #E6ECEA; padding: 0 12px; }
  .mx-search svg { width: 19px; height: 19px; color: var(--text-3); flex: none; }
  .mx-search input { flex: 1; border: 0; background: transparent; font-size: 16px; outline: none; min-width: 0; }
  .mx-field { display: flex; flex-direction: column; gap: 6px; }
  .mx-field label { font-size: 14px; font-weight: 600; }
  .mx-input, .mx-select, .mx-textarea { width: 100%; min-height: 50px; border-radius: 14px; border: 1px solid var(--line); background: #fff; padding: 0 14px; font-size: 16px; color: var(--ink); }
  .mx-textarea { min-height: 110px; padding: 12px 14px; resize: none; }
  .mx-input:focus, .mx-select:focus, .mx-textarea:focus { outline: none; border-color: var(--mint); box-shadow: 0 0 0 4px rgba(54,214,160,.18); }
  .mx-photo { aspect-ratio: 1; border-radius: 14px; background: #E6ECEA; display: grid; place-items: center; color: var(--text-3); border: 1.5px dashed #C3CEC9; overflow: hidden; }
  .mx-photo svg { width: 26px; height: 26px; }
  .mx-photo.filled { border: 0; }
  .mx-photo.filled svg { width: 100%; height: 100%; }
  .mx-steps { display: flex; gap: 4px; }
  .mx-steps i { flex: 1; height: 4px; border-radius: 4px; background: var(--line); }
  .mx-steps i.on { background: var(--mint); }
  .mx-empty { text-align: center; padding: 36px 20px; display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-2); }
  .mx-empty .e-i { width: 64px; height: 64px; border-radius: 20px; background: var(--mint-50); color: var(--mint-ink); display: grid; place-items: center; }
  .mx-empty .e-i svg { width: 28px; height: 28px; }
  .mx-empty h3 { font-size: 17px; color: var(--ink); }
  .mx-welcome { min-height: 100%; display: flex; flex-direction: column; background: var(--navy); color: var(--navy-ink); }
  .mx-welcome .w-art { height: 330px; position: relative; flex: none; }
  .mx-welcome .w-art svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .mx-welcome .w-body { flex: 1; background: var(--bg); color: var(--ink); border-radius: 28px 28px 0 0; margin-top: -28px; position: relative; padding: 26px 18px 34px; display: flex; flex-direction: column; gap: 16px; }
  @media (max-width: 760px) {
    .mx-stage { display: block; padding: 0; background: var(--bg); }
    .mx-panel { display: none; }
    .mx-device { width: 100%; height: 100vh; height: 100dvh; border-radius: 0; padding: 0; box-shadow: none; background: var(--bg); }
    .mx-phone { border-radius: 0; }
    .mx-status { display: none; }
    .mx-head { padding-top: calc(6px + env(safe-area-inset-top, 0px)); }
    .mx-home-ind { display: none; }
    .mx-tabs { padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px)); }
    .mx-sheet .ms-foot { padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
    .mx-mswitch { display: inline-grid !important; }
  }
  @media (min-width: 761px) and (max-height: 760px) { .mx-device { border-radius: 46px; padding: 9px; } .mx-phone { border-radius: 38px; } }
  `);

  /* ---------------- primitives (all return HTML strings) ---------------- */
  const attrs = (o) => (o.go ? `data-go="${o.go}"` : o.act ? `data-act="${o.act}" data-arg="${esc(o.arg ?? '')}"` : '');
  /** cell({ icon, tone, title, sub, value, valueSub, badge, go|act+arg, chevron, avatar }) */
  M.cell = (o) => {
    const a = attrs(o);
    const tag = a ? 'button' : 'div';
    const lead = o.avatar ? B.ui.avatar(o.avatar, '') : o.icon ? `<span class="mc-i ${o.tone || ''}">${icon(o.icon)}</span>` : '';
    return `<${tag} class="mx-cell ${lead ? '' : 'noicon'}" ${a}>${lead}<span class="mc-b"><span class="mc-t" style="display:block">${tx(o.title)}</span>${o.sub ? `<span class="mc-s" style="display:block">${tx(o.sub)}</span>` : ''}</span>${o.value || o.badge || o.valueSub ? `<span class="mc-v">${o.value ? `<b>${o.value}</b>` : ''}${o.badge || ''}${o.valueSub ? `<span>${tx(o.valueSub)}</span>` : ''}</span>` : ''}${a && o.chevron !== false ? icon('chevR', 'mc-c flip') : ''}</${tag}>`;
  };
  /** group(cells[], label?) — inset grouped list */
  M.group = (cells, label = '') => `<div>${label ? `<div class="mx-glabel">${tx(label)}</div>` : ''}<div class="mx-group">${cells.join('')}</div></div>`;
  /** section(title, body, { link:{label, go|act}, sub }) */
  M.section = (title, body, o = {}) => `<section class="mx-sec"><div class="mx-sec-h"><div><h2>${tx(title)}</h2>${o.sub ? `<div class="sub">${tx(o.sub)}</div>` : ''}</div>${o.link ? `<button ${attrs(o.link)}>${tx(o.link.label || L('See all', 'عرض الكل'))}</button>` : ''}</div>${body}</section>`;
  M.card = (body, cls = '', o = {}) => { const a = attrs(o); return a ? `<button class="mx-card ${cls}" ${a}>${body}</button>` : `<div class="mx-card ${cls}">${body}</div>`; };
  /** btn(label, { kind:'primary'|'dark'|'ghost'|'soft'|'danger', icon, go|act+arg, block, sm, type }) */
  M.btn = (label, o = {}) => `<button type="${o.type || 'button'}" class="mx-btn ${o.kind || 'ghost'} ${o.block ? 'block' : ''} ${o.sm ? 'sm' : ''}" ${attrs(o)}>${o.icon ? icon(o.icon, o.iconCls || '') : ''}${label ? `<span>${tx(label)}</span>` : ''}</button>`;
  /** seg(stateKey, [{id,label}], current) */
  M.seg = (key, items, cur) => `<div class="mx-seg">${items.map((t) => `<button class="${t.id === cur ? 'on' : ''}" data-act="set" data-arg="${key}=${t.id}">${tx(t.label)}</button>`).join('')}</div>`;
  M.chips = (key, items, cur) => `<div class="mx-chips">${items.map((t) => `<button class="mx-chip ${String(t.id) === String(cur) ? 'on' : ''}" data-act="set" data-arg="${key}=${t.id}">${t.icon ? icon(t.icon) : ''}${tx(t.label)}</button>`).join('')}</div>`;
  /** kpis([{ label, value, sub, icon, alert, go }]) */
  M.kpis = (items) => `<div class="mx-kpis">${items.map((k) => `<${k.go ? 'button' : 'div'} class="mx-kpi ${k.alert ? 'alert' : ''}" ${k.go ? `data-go="${k.go}"` : ''}><span class="k-l">${k.icon ? icon(k.icon) : ''}${tx(k.label)}</span><span class="k-v">${k.value}</span>${k.sub ? `<span class="k-s">${tx(k.sub)}</span>` : ''}</${k.go ? 'button' : 'div'}>`).join('')}</div>`;
  /** quick([{ label, icon, go|act, mint }]) — 4-up quick actions */
  M.quick = (items) => `<div class="mx-quick">${items.map((q) => `<button class="mx-qa" ${attrs(q)}><span class="q-i ${q.mint ? 'mint' : ''}">${icon(q.icon)}</span>${tx(q.label)}</button>`).join('')}</div>`;
  M.search = (key, ph) => `<label class="mx-search">${icon('search')}<input type="search" id="mx-${key.replace(/[^a-z0-9]/gi, '')}" data-model="${key}" value="${esc(B.get(key, ''))}" placeholder="${esc(tx(ph))}" autocomplete="off"></label>`;
  M.empty = (ic, title, text = '') => `<div class="mx-empty"><span class="e-i">${icon(ic)}</span><h3>${tx(title)}</h3>${text ? `<p>${tx(text)}</p>` : ''}</div>`;
  M.steps = (n, cur) => `<div class="mx-steps">${Array.from({ length: n }, (_, i) => `<i class="${i <= cur ? 'on' : ''}"></i>`).join('')}</div>`;
  /** form field for sheets: field({ name, label, type:'text'|'textarea'|'select'|'date'|'number'|'tel', options:[{v,l}], value, placeholder, required }) */
  M.field = (o) => {
    const id = 'mxf-' + o.name;
    let c;
    if (o.type === 'textarea') c = `<textarea class="mx-textarea" id="${id}" name="${o.name}" placeholder="${esc(tx(o.placeholder || ''))}" ${o.required ? 'required' : ''}>${esc(tx(o.value || ''))}</textarea>`;
    else if (o.type === 'select') c = `<select class="mx-select" id="${id}" name="${o.name}">${(o.options || []).map((op) => `<option value="${esc(op.v)}" ${String(op.v) === String(o.value) ? 'selected' : ''}>${tx(op.l)}</option>`).join('')}</select>`;
    else c = `<input class="mx-input" id="${id}" name="${o.name}" type="${o.type || 'text'}" value="${esc(tx(o.value ?? ''))}" placeholder="${esc(tx(o.placeholder || ''))}" ${o.required ? 'required' : ''}>`;
    return `<div class="mx-field">${o.label ? `<label for="${id}">${tx(o.label)}</label>` : ''}${c}</div>`;
  };
  /** photo slot (empty dashed, or filled with art) */
  M.photo = (art = '') => `<div class="mx-photo ${art ? 'filled' : ''}">${art || icon('camera')}</div>`;

  /* ---------------- in-device sheet / toast ---------------- */
  const phone = () => document.querySelector('.mx-phone');
  M.sheet = ({ title = '', sub = '', body = '', foot = '', form = null } = {}) => {
    M.close(true);
    const host = phone();
    if (!host) return B.modal({ title, sub, body, foot, form });
    const el = document.createElement('div');
    el.className = 'mx-scrim';
    const inner = `<div class="ms-grab"></div><div class="ms-head"><div style="flex:1;min-width:0"><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div><button class="mx-iconbtn" data-act="mxClose" aria-label="${L('Close', 'إغلاق')}">${icon('x')}</button></div><div class="ms-body">${body}</div>${foot ? `<div class="ms-foot">${foot}</div>` : ''}`;
    el.innerHTML = `<div class="mx-sheet" role="dialog" aria-modal="true">${form ? `<form data-submit="${form}" style="display:contents">${inner}</form>` : inner}</div>`;
    el.addEventListener('click', (e) => { if (e.target === el) M.close(); });
    host.appendChild(el);
    return el;
  };
  M.close = (instant) => {
    document.querySelectorAll('.mx-scrim').forEach((s) => { if (instant) s.remove(); else { s.style.transition = 'opacity .18s'; s.style.opacity = '0'; setTimeout(() => s.remove(), 180); } });
  };
  B.act.mxClose = () => M.close();
  /** success({ title, text, ref, done, doneLabel }) — replaces the open sheet (or opens one) */
  M.success = ({ title, text = '', ref = '', done = null, doneLabel = null } = {}) => {
    const body = `<div class="success-state"><div class="s-icon">${icon('check')}</div><h3>${title}</h3>${text ? `<p>${text}</p>` : ''}${ref ? `<div class="ref-box"><span class="muted">${L('Reference', 'المرجع')}</span><b class="id-mono">${esc(ref)}</b></div>` : ''}<div class="xs faint">${L('Prototype — nothing was sent or saved.', 'نموذج أولي — لم يُرسل أو يُحفظ شيء.')}</div></div>`;
    const foot = M.btn(doneLabel || L('Done', 'تم'), { kind: 'primary', block: true, ...(done ? { go: done } : { act: 'mxClose' }) });
    M.sheet({ body, foot });
  };
  M.toast = (msg, ic = 'check') => {
    const host = phone();
    if (!host) return B.toast(msg, ic);
    host.querySelectorAll('.mx-toast').forEach((t) => t.remove());
    const t = document.createElement('div');
    t.className = 'mx-toast';
    t.innerHTML = `${icon(ic)}<span>${msg}</span>`;
    host.appendChild(t);
    setTimeout(() => { t.style.transition = 'opacity .25s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 260); }, 2300);
  };
  B.act.mxToast = (msg) => M.toast(msg);
  B.act.mxSoon = (label) => M.toast(L(`${label || 'This action'} is simulated in the prototype`, `${label || 'هذا الإجراء'} محاكاة في النموذج`), 'info');

  /* ---------------- welcome / role selection ---------------- */
  const welcome = () => `<div class="mx-welcome">
      <div class="w-art">${B.art.facade(142, { type: 'residential', floors: 12, sky: 'navy' })}
        <div style="position:absolute;inset-inline:22px;bottom:48px;display:flex;flex-direction:column;gap:8px">${B.logo(46)}<h1 style="color:#fff;font-size:30px;line-height:1.15">${L('Your building,<br>in your pocket.', 'مبناك،<br>في جيبك.')}</h1></div></div>
      <div class="w-body">
        <div><div style="font-size:20px;font-weight:700">${L('How do you use BENA?', 'كيف تستخدم BENA؟')}</div><div class="muted" style="font-size:14.5px;margin-top:4px">${L('Pick a demo profile. You can switch any time.', 'اختر ملفاً تجريبياً. يمكنك التبديل في أي وقت.')}</div></div>
        ${M.group(B.mroleOrder.map((id) => { const r = B.mroles[id]; return M.cell({ icon: r.icon, tone: 'navy', title: r.name, sub: r.persona ? `${tx(r.persona.name)} · ${tx(r.persona.sub)}` : '', go: `m-${id}-${r.home || 'home'}` }); }))}
        <div class="row between wrap" style="gap:8px">${M.btn(B.isAr() ? 'English' : 'العربية', { icon: 'globe', act: 'lang', sm: true })}${M.btn(L('Demo hub', 'مركز العرض'), { icon: 'grid', go: 'hub', sm: true })}</div>
        <div class="xs faint" style="text-align:center">${L('Prototype · all data is fictional sample data', 'نموذج أولي · جميع البيانات نموذجية وهمية')}</div>
      </div></div>`;

  /* ---------------- render ---------------- */
  let lastKey = null, lastScroll = 0, lastDepth = 0;
  B.exp.mobile = (route) => {
    const r = route.role ? B.mroles[route.role] : null;
    const key = `${route.role}-${route.page}-${route.id}`;
    const old = document.querySelector('.mx-screen');
    const sameScreen = key === lastKey;
    if (old && sameScreen) lastScroll = old.scrollTop;
    let cfg = { body: '' };
    let tabsHtml = '';
    if (!r) { cfg = { body: welcome(), bare: true }; }
    else {
      const fn = r.screens[route.page];
      const out = fn ? fn(route.id, route) : M.empty('compass', L('Screen not in this prototype', 'هذه الشاشة ليست ضمن النموذج'));
      cfg = typeof out === 'string' ? { body: out } : out;
      const curTab = cfg.tab || route.page;
      if (r.tabs && r.tabs.length && !cfg.hideTabs) tabsHtml = `<nav class="mx-tabs">${r.tabs.slice(0, 5).map((t) => `<button class="mx-tab ${t.id === curTab ? 'on' : ''}" data-go="m-${r.id}-${t.id}"><span class="mt-i">${icon(t.icon)}${t.badge ? `<span class="mt-b">${t.badge}</span>` : ''}</span><span>${tx(t.label)}</span></button>`).join('')}</nav>`;
    }
    const depth = cfg.back ? 1 : 0;
    const dirBack = !sameScreen && depth < lastDepth;
    lastDepth = depth;
    lastKey = key;
    if (sameScreen) B.afterRender(() => { const s = document.querySelector('.mx-screen'); if (s) s.scrollTop = lastScroll; });
    const title = cfg.title ? tx(cfg.title) : '';
    const actions = (cfg.actions || []).map((a) => `<button class="mx-iconbtn ${a.dot ? 'dot' : ''}" ${attrs(a)} aria-label="${esc(tx(a.label || ''))}" style="position:relative">${icon(a.icon)}</button>`).join('');
    const head = cfg.bare ? '' : `<header class="mx-head">
        <div class="mh-side">${cfg.back ? `<button class="mx-back" data-go="${cfg.back.startsWith('m-') ? cfg.back : `m-${route.role}-${cfg.back}`}">${icon('chevL', 'flip')}<span>${tx(cfg.backLabel || L('Back', 'رجوع'))}</span></button>` : `<button class="mx-iconbtn mx-mswitch" style="display:none" data-act="mxRoles" aria-label="${L('Switch profile', 'تبديل الملف')}">${icon('swap')}</button>`}</div>
        <div class="mh-title">${cfg.large ? '' : title}</div>
        <div class="mh-side end">${actions}</div></header>
      ${cfg.large ? `<div class="mx-large"><div>${cfg.kicker ? `<small>${tx(cfg.kicker)}</small>` : ''}<h1>${title}</h1></div>${cfg.largeEnd || ''}</div>` : ''}`;
    const phoneCls = `${tabsHtml ? 'has-tabs' : ''} ${cfg.bg === 'white' ? 'white' : ''}`;
    const device = `<div class="mx-device"><div class="mx-phone ${phoneCls}">
        <div class="mx-status"><span>9:41</span><span class="mx-island"></span><span class="st-i"><svg viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor"/><rect x="4.5" y="5" width="3" height="6" rx="1" fill="currentColor"/><rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="currentColor"/><rect x="13.5" y="0" width="3" height="11" rx="1" fill="currentColor"/></svg><svg viewBox="0 0 25 12" style="width:25px"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/></svg></span></div>
        ${head}
        <main class="mx-screen ${cfg.bg === 'white' ? 'white' : ''}"><div class="${sameScreen ? '' : `mx-enter ${dirBack ? 'back' : ''}`}">${cfg.bare ? cfg.body : `<div class="mx-body">${cfg.body}</div>`}</div></main>
        ${tabsHtml}<span class="mx-home-ind"></span>
      </div></div>`;
    const panel = `<aside class="mx-panel">
        <div class="brand dark">${B.logo(34)}<span>BENA<small style="color:var(--text-3)">${L('Mobile application · prototype', 'تطبيق الجوال · نموذج أولي')}</small></span></div>
        <div><h1>${L('Built for the moments you are in the building.', 'مصمَّم للحظات وجودك في المبنى.')}</h1><p style="margin-top:10px">${L('A separate, touch-first experience for residents, owners, committees, technicians and service providers.', 'تجربة مستقلة تعتمد على اللمس للسكان والمالكين واللجان والفنيين ومزودي الخدمات.')}</p></div>
        <div><div class="mxp-label">${L('Demo profile', 'الملف التجريبي')}</div><div class="mx-roles">${B.mroleOrder.map((id) => { const x = B.mroles[id]; return `<button class="mx-role ${id === route.role ? 'on' : ''}" data-go="m-${id}-${x.home || 'home'}"><span class="ri">${icon(x.icon)}</span><span style="min-width:0"><b>${tx(x.name)}</b><small>${x.persona ? tx(x.persona.name) : ''}</small></span></button>`; }).join('')}</div></div>
        <div class="mx-links">${B.ui.btn(B.isAr() ? 'English' : 'العربية', { icon: 'globe', act: 'lang', size: 'sm' })}${B.ui.btn(L('Website', 'الموقع'), { icon: 'globe', go: 'site', size: 'sm' })}${B.ui.btn(L('Web app', 'تطبيق الويب'), { icon: 'grid', go: r && B.roles[r.webRole] ? `${r.webRole}-home` : 'municipality-home', size: 'sm' })}${B.ui.btn(L('Demo hub', 'مركز العرض'), { icon: 'compass', go: 'hub', size: 'sm' })}</div>
        <div class="xs faint">${L('Prototype · fictional sample data · interactions are simulated.', 'نموذج أولي · بيانات نموذجية وهمية · التفاعلات محاكاة.')}</div>
      </aside>`;
    return `<div data-exp-root="mobile" class="mx-stage">${panel}${device}</div>`;
  };

  B.act.mxRoles = () => M.sheet({ title: L('Switch profile', 'تبديل الملف'), body: M.group(B.mroleOrder.map((id) => { const r = B.mroles[id]; return M.cell({ icon: r.icon, tone: 'navy', title: r.name, sub: r.persona ? tx(r.persona.name) : '', go: `m-${id}-${r.home || 'home'}` }); })) + `<div class="row wrap" style="gap:8px">${M.btn(B.isAr() ? 'English' : 'العربية', { icon: 'globe', act: 'lang', sm: true })}${M.btn(L('Demo hub', 'مركز العرض'), { icon: 'grid', go: 'hub', sm: true })}</div>` });
  /** Standard notifications screen for a role (roles can override). */
  M.notificationsScreen = (role) => {
    const r = B.mroles[role];
    const list = (r.notifications && r.notifications()) || [];
    return { title: L('Notifications', 'الإشعارات'), large: true, back: r.home || 'home', body: list.length ? M.group(list.map((n) => M.cell({ icon: n.icon || 'bell', tone: n.tone || 'mint', title: n.title, sub: n.sub, valueSub: n.when, go: n.go }))) : M.empty('bell', L('You are all caught up', 'لا توجد إشعارات جديدة')) };
  };
})();
