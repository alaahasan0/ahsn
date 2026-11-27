/*
 * BENA — Municipality workspace (sample tenant, fictional data).
 * Persona: Eng. Maha Awad, GIS & Building Registry Unit.
 * The municipality, its staff, references, requests and figures are fictional
 * demonstration data. BENA is designed to connect to municipal systems; nothing
 * here is connected to any real municipality.
 *
 * This file: shared helpers + data + components (exposed as B.mu) and the screens
 *   home (Municipal Overview), registry, explorer (GIS workspace), requests / request,
 *   analytics, data (Data Sources).
 * js/roles/municipality2.js adds the remaining screens and registers the roles
 * `municipality` and `muniadmin`.
 */
(function () {
  const B = window.B;
  const { L, tx, esc, icon } = B;
  const ui = B.ui;
  const D = B.data;
  const R = 'municipality';
  const T = (en, ar) => ({ en, ar });

  /* ---------------- statuses used by this workspace ---------------- */
  Object.assign(B.statuses, {
    synced: { en: 'Synced', ar: 'متزامن', tone: 'ok', icon: 'check' },
    syncing: { en: 'Syncing', ar: 'قيد المزامنة', tone: 'info', icon: 'refresh' },
    delayed: { en: 'Delayed', ar: 'متأخر', tone: 'warn', icon: 'clock' },
    syncError: { en: 'Sync error', ar: 'خطأ في المزامنة', tone: 'bad', icon: 'alertCircle' },
    paused: { en: 'Paused', ar: 'متوقف مؤقتاً', tone: 'neutral' },
    deferred: { en: 'Deferred', ar: 'مؤجّل', tone: 'neutral', icon: 'clock' },
    toReview: { en: 'To review', ar: 'للمراجعة', tone: 'info', icon: 'eye' },
    matched: { en: 'Matched', ar: 'مُطابَق', tone: 'ok', icon: 'link' },
    escalated: { en: 'Escalated', ar: 'مُصعّد', tone: 'violet', icon: 'flag' },
    applied: { en: 'Applied', ar: 'مُطبّق', tone: 'ok', icon: 'check' },
    partiallyApplied: { en: 'Partly applied', ar: 'مُطبّق جزئياً', tone: 'info', icon: 'check' },
  });

  /* ---------------- fictional municipal staff (sample) ---------------- */
  const STAFF = [
    { id: 'p_maha', role: 'lead', unit: T('GIS & Building Registry', 'نظم المعلومات وسجل المباني'), ws: ['ramallah', 'albireh'], last: '2026-11-25', mfa: true, status: 'active' },
    { id: 'p_mu_samah', en: 'Eng. Samah Daher', ar: 'م. سماح ضاهر', role: 'admin', unit: T('IT & Digital Services', 'تقنية المعلومات والخدمات الرقمية'), ws: ['ramallah', 'albireh', 'birzeit'], last: '2026-11-25', mfa: true, status: 'active', email: 'admin.office@sample-municipality.example' },
    { id: 'p_mu_tamer', en: 'Tamer Zoubi', ar: 'تامر الزعبي', role: 'analyst', unit: T('GIS & Building Registry', 'نظم المعلومات وسجل المباني'), ws: ['ramallah'], last: '2026-11-25', mfa: true, status: 'active' },
    { id: 'p_mu_rasha', en: 'Rasha Hamdan', ar: 'رشا حمدان', role: 'officer', unit: T('Building Registry', 'سجل المباني'), ws: ['ramallah'], last: '2026-11-24', mfa: true, status: 'active' },
    { id: 'p_mu_odai', en: 'Odai Kanaan', ar: 'عُدي كنعان', role: 'reviewer', unit: T('Verification desk', 'مكتب التحقق'), ws: ['ramallah'], last: '2026-11-25', mfa: true, status: 'active' },
    { id: 'p_mu_lubna', en: 'Lubna Shaheen', ar: 'لبنى شاهين', role: 'reviewer', unit: T('Verification desk', 'مكتب التحقق'), ws: ['ramallah', 'albireh'], last: '2026-11-22', mfa: false, status: 'active' },
    { id: 'p_mu_khalil', en: 'Khalil Daraghmeh', ar: 'خليل دراغمة', role: 'surveyor', unit: T('Field survey', 'المسح الميداني'), ws: ['ramallah'], last: '2026-11-23', mfa: true, status: 'active' },
    { id: 'p_mu_ghada', en: 'Ghada Rimawi', ar: 'غادة الريماوي', role: 'surveyor', unit: T('Field survey', 'المسح الميداني'), ws: ['birzeit'], last: null, mfa: false, status: 'invited' },
    { id: 'p_mu_mazen', en: 'Mazen Abu Ali', ar: 'مازن أبو علي', role: 'viewer', unit: T('Planning department', 'دائرة التخطيط'), ws: ['ramallah'], last: '2026-11-19', mfa: true, status: 'active' },
    { id: 'p_mu_sawsan', en: 'Sawsan Masri', ar: 'سوسن المصري', role: 'officer', unit: T('Building Registry', 'سجل المباني'), ws: ['albireh'], last: '2026-10-02', mfa: false, status: 'suspended' },
  ];
  STAFF.forEach((s) => { if (!D.people[s.id]) D.people[s.id] = { id: s.id, name: T(s.en, s.ar), email: s.email }; });
  D.me.muniadmin = D.me.muniadmin || 'p_mu_samah';

  const WORKSPACES = [
    { id: 'ramallah', label: T('Ramallah (sample)', 'رام الله (نموذج)') },
    { id: 'albireh', label: T('Al-Bireh (sample)', 'البيرة (نموذج)') },
    { id: 'birzeit', label: T('Birzeit (sample)', 'بيرزيت (نموذج)') },
  ];

  /* ---------------- helpers ---------------- */
  const hash = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  /** Deterministic data-quality flags for a building (demo). */
  const qfCache = new Map();
  const qf = (b) => {
    if (qfCache.has(b.id) && !b._touched) return qfCache.get(b.id);
    const h = hash(b.id);
    const f = {
      dup: h % 43 === 0,
      geom: h % 57 === 3,
      noParcel: b.source === 'independent' && b.verification !== 'verified' && h % 3 === 0,
      noUnits: b.source === 'independent' && h % 4 === 1,
      outdated: (b.updated || '2026-11-25') < '2026-03-01',
    };
    f.any = f.dup || f.geom || f.noParcel || f.noUnits;
    qfCache.set(b.id, f);
    return f;
  };
  const months = () => Array.from({ length: 12 }, (_, i) => B.mon((11 + i) % 12));
  const dName = (id) => tx(D.district(id).name);
  const typeIcon = (t) => (D.types[t] && D.types[t].icon) || 'building';
  const sw = (c) => `<i class="mu-sw" style="background:${c}"></i>`;
  const sampleTag = (t) => `<span class="mu-tag" title="${esc(tx(D.municipality.note))}">${t || L('Sample tenant', 'جهة تجريبية')}</span>`;
  const pct = (a, b) => (b ? (a / b) * 100 : 0);
  const upd = (b) => (b.updated > '2026-11-25' ? '2026-11-25' : b.updated); // data has a few post-today dates
  const units = (n) => `<span class="num">${B.num(n)}</span><span class="mu-m-only"> ${L('units', 'وحدة')}</span>`;
  const parcelTxt = (p) => (p ? L(`Basin ${p.basin} · Parcel ${p.parcel}`, `حوض ${p.basin} · قطعة ${p.parcel}`) : null);
  const srcLabel = (s) => (s === 'gis' ? L('Municipal GIS (sample)', 'نظم المعلومات البلدية (نموذج)') : L('Independently submitted', 'مُسجّل بشكل مستقل'));
  const orgName = () => L('Ramallah Municipality (sample)', 'بلدية رام الله (نموذج)');

  /** Route helper: stay in the current role when it has the page, otherwise use the municipality role. */
  const rgo = (p) => {
    const r = B.route && B.route.role;
    const def = r && B.roles[r];
    const base = String(p).split('-')[0];
    return def && ((def.pages && def.pages[base]) || B.shared[base]) ? `${r}-${p}` : `${R}-${p}`;
  };
  const roleName = () => { const r = B.roles[(B.route && B.route.role) || R]; return r ? tx(r.name) : L('Municipality', 'البلدية'); };
  /** Breadcrumbs: crumbs([[label, page], …, [label]]) — first crumb is the role home. */
  const crumbs = (items) => {
    if (!B.crumbs) return;
    const r = (B.route && B.route.role) || R;
    const home = (B.roles[r] && B.roles[r].home) || 'home';
    B.crumbs([{ label: roleName(), go: `${r}-${home}` }].concat(items.map(([label, page]) => (page ? { label, go: rgo(page) } : { label }))));
  };

  /** Compact enterprise page header. */
  const hdr = ({ title, sub = '', actions = '', unit = null, extra = '' }) => `<div class="mu-ph">
      <div class="grow" style="min-width:0">
        <div class="mu-eb">${orgName()} · ${unit || L('GIS & Building Registry Unit', 'وحدة نظم المعلومات وسجل المباني')}${sampleTag()}</div>
        <h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}${extra}
      </div>${actions ? `<div class="mu-ph-a">${actions}</div>` : ''}</div>`;

  /** KPI strip: [{label, value, sub, tone, go}] */
  const strip = (items) => `<div class="card pad-0 mu-kstrip" style="--n:${items.length}">${items.map((k) => {
    const inner = `<span class="kl">${k.label}</span><b class="${k.tone ? 't-' + k.tone : ''}">${k.value}</b>${k.sub ? `<small>${k.sub}</small>` : ''}`;
    return k.go ? `<button class="ki" data-go="${k.go}">${inner}</button>` : k.act ? `<button class="ki" data-act="${k.act}" data-arg="${esc(k.arg || '')}">${inner}</button>` : `<div class="ki">${inner}</div>`;
  }).join('')}</div>`;

  /** Saved-view chips. items [{id, label, count}] */
  const views = (key, items, cur, opts = {}) => `<div class="mu-views">${items.map((t) => `<button class="mu-vchip ${String(t.id) === String(cur) ? 'on' : ''}" data-act="set" data-arg="${key}=${t.id}">${t.icon ? icon(t.icon) : ''}<span>${tx(t.label)}</span>${t.count != null ? `<i>${B.num(t.count)}</i>` : ''}</button>`).join('')}
    ${opts.save === false ? '' : `<button class="mu-vsave" data-act="soon" data-arg="${esc(L('Saving a custom view', 'حفظ عرض مخصص'))}">${icon('plus')}<span>${L('Save view', 'حفظ العرض')}</span></button>`}</div>`;

  /* ---------------- dense data table with selection ---------------- */
  const DTV = {};
  const selOf = (id) => B.get(id + ':sel', []);
  B.act.muRowSel = (arg) => { const i = arg.indexOf('|'); const tid = arg.slice(0, i), rid = arg.slice(i + 1); const s = new Set(selOf(tid)); if (s.has(rid)) s.delete(rid); else s.add(rid); B.vs[tid + ':sel'] = [...s]; B.refresh(); };
  B.act.muSelAll = (tid) => { const ids = DTV[tid] || []; const s = selOf(tid); const all = ids.length && ids.every((i) => s.includes(i)); B.vs[tid + ':sel'] = all ? s.filter((i) => !ids.includes(i)) : [...new Set(s.concat(ids))]; B.refresh(); };
  B.act.muSelClear = (tid) => { B.vs[tid + ':sel'] = []; B.refresh(); };
  const cb = (on, act, arg, label) => `<button type="button" class="mu-cb ${on === 'some' ? 'some' : on ? 'on' : ''}" data-stop data-act="${act}" data-arg="${esc(arg)}" aria-pressed="${!!on}" aria-label="${esc(label || L('Select', 'تحديد'))}">${icon(on === 'some' ? 'minus' : 'check')}</button>`;

  /**
   * dt({ id, rows, cols:[{key,label,render,sort,align,w,hide,m}], key:(r)=>id, select, rowAct:(r)=>({act,arg}), rowGo,
   *      active, pageSize, defaultSort, empty, bulk:(ids)=>html, maxH, cls, foot })
   */
  const dt = (o) => {
    const key = o.key || ((r) => r.id);
    const sk = `${o.id}:sort`, pk = `${o.id}:page`;
    const cols = o.cols.filter((c) => !c.hide);
    let rows = o.rows.slice();
    const sort = B.get(sk, o.defaultSort || '');
    if (sort) {
      const desc = sort.startsWith('-');
      const k = desc ? sort.slice(1) : sort;
      const col = o.cols.find((c) => c.key === k);
      if (col) { const f = typeof col.sort === 'function' ? col.sort : (r) => { const v = r[k]; return typeof v === 'object' && v ? tx(v) : v; }; rows.sort(B.by(f, desc ? -1 : 1)); }
    }
    const total = rows.length;
    const allIds = new Set(rows.map(key));
    const sel = selOf(o.id).filter((i) => allIds.has(i));
    if (o.pageSize) { const p = Math.min(B.get(pk, 0), Math.max(0, Math.ceil(total / o.pageSize) - 1)); rows = rows.slice(p * o.pageSize, (p + 1) * o.pageSize); }
    DTV[o.id] = rows.map(key);
    const pageSel = DTV[o.id].filter((i) => sel.includes(i)).length;
    const headState = pageSel && pageSel === rows.length ? true : pageSel ? 'some' : false;
    const rowAttr = (r) => { if (o.rowGo) return `data-go="${o.rowGo(r)}"`; if (o.rowAct) { const a = o.rowAct(r); return `data-act="${a.act}" data-arg="${esc(a.arg)}"`; } return ''; };
    const clickable = o.rowGo || o.rowAct ? 'clickable' : '';
    const cell = (c, r) => (c.render ? c.render(r) : esc(tx(r[c.key])));
    if (!total) return `<div class="card pad-0 mu-dt ${o.cls || ''}">${ui.empty(o.empty || { icon: 'search', title: L('No results', 'لا توجد نتائج'), text: L('Try changing the filters or search terms.', 'جرّب تغيير عوامل التصفية أو كلمات البحث.') })}</div>`;
    const head = (o.select ? `<th class="mu-th-cb">${cb(headState, 'muSelAll', o.id, L('Select all on this page', 'تحديد الكل في هذه الصفحة'))}</th>` : '') + cols.map((c) => {
      const st = c.w ? `style="width:${c.w}"` : '';
      if (!c.sort) return `<th class="${c.align === 'end' ? 't-end' : ''}" ${st}>${tx(c.label)}</th>`;
      const on = sort === c.key || sort === '-' + c.key;
      const next = sort === c.key ? '-' + c.key : c.key;
      return `<th class="sortable ${on ? 'sorted' : ''} ${c.align === 'end' ? 't-end' : ''}" ${st} data-act="set" data-arg="${sk}=${next}">${tx(c.label)}${icon(on ? (sort.startsWith('-') ? 'arrowDown' : 'arrowUp') : 'sort', 'sort-i')}</th>`;
    }).join('');
    const body = rows.map((r) => { const id = key(r); const on = sel.includes(id); return `<tr class="${clickable} ${o.active === id ? 'active' : ''} ${on ? 'picked' : ''}" ${rowAttr(r)}>${o.select ? `<td class="mu-td-cb">${cb(on, 'muRowSel', `${o.id}|${id}`)}</td>` : ''}${cols.map((c) => `<td class="${c.align === 'end' ? 't-end' : ''} ${c.cls || ''}">${cell(c, r)}</td>`).join('')}</tr>`; }).join('');
    const tCol = cols.find((c) => c.m === 'title') || cols[0];
    const subs = cols.filter((c) => c.m === 'sub'), metas = cols.filter((c) => c.m === 'meta'), endC = cols.find((c) => c.m === 'end');
    const mob = `<div class="m-list">${rows.map((r) => `<div class="m-row ${clickable} ${o.active === key(r) ? 'mu-m-active' : ''}" ${clickable ? 'role="button" tabindex="0"' : ''} ${rowAttr(r)}>${o.select ? cb(sel.includes(key(r)), 'muRowSel', `${o.id}|${key(r)}`) : ''}<div class="m-body">
        <div class="m-title"><span>${tCol.mRender ? tCol.mRender(r) : cell(tCol, r)}</span>${endC ? `<span class="nowrap">${cell(endC, r)}</span>` : ''}</div>
        ${subs.map((c) => `<div class="m-sub">${cell(c, r)}</div>`).join('')}
        ${metas.length ? `<div class="m-meta">${metas.map((c) => `<span>${cell(c, r)}</span>`).join('')}</div>` : ''}</div></div>`).join('')}</div>`;
    const bulk = o.select && sel.length ? `<div class="mu-bulk"><span class="n">${cb('some', 'muSelClear', o.id, L('Clear selection', 'مسح التحديد'))}<b>${L(`${sel.length} selected`, `${sel.length} محدد`)}</b></span><div class="mu-bulk-a">${o.bulk ? o.bulk(sel) : ''}</div><button class="mu-bulk-x" data-act="muSelClear" data-arg="${o.id}">${L('Clear', 'مسح')}</button></div>` : '';
    return `<div class="card pad-0 mu-dt ${o.cls || ''}">${bulk}<div class="table-wrap responsive mu-dt-scroll" style="${o.maxH ? `max-height:${o.maxH}` : ''}"><table class="table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>${mob}${o.pageSize ? ui.pager(pk, total, o.pageSize) : o.foot || ''}</div>`;
  };

  /** Attribute list (dense label/value rows, GIS-popup style). rows: [label, value, provKind?] */
  const attrs = (rows) => `<dl class="mu-attrs">${rows.filter(Boolean).map(([k, v, p]) => `<div><dt>${k}</dt><dd>${v == null || v === '' ? `<span class="faint">—</span>` : v}${p ? ` ${ui.prov(p)}` : ''}</dd></div>`).join('')}</dl>`;

  /* ---------------- fictional registration requests ---------------- */
  const pickB = (f, n = 0) => D.buildings.filter(f)[n] || D.buildings[n];
  const nearest = (bid, f) => {
    const a = D.building(bid); let best = null, bd = 1e9;
    D.buildings.forEach((b) => { if (b.id === bid || !f(b)) return; const d = Math.hypot(b.c[0] - a.c[0], b.c[1] - a.c[1]); if (d < bd) { bd = d; best = b; } });
    return best || D.buildings[0];
  };
  const bNew1 = pickB((b) => b.source === 'independent' && b.verification === 'unverified' && b.district === 'batnalhawa');
  const bNew2 = pickB((b) => b.source === 'independent' && b.verification === 'pendingVerification' && b.district === 'oldcity' && !b.key);
  const bNew3 = pickB((b) => b.source === 'independent' && b.verification === 'pendingVerification' && b.district === 'tireh' && !b.key);
  const bMiss1 = pickB((b) => b.district === 'batnalhawa' && b.source === 'gis', 3);
  const bMiss2 = pickB((b) => b.district === 'tireh' && b.source === 'gis' && b.type === 'residential', 5);
  const bDupA = D.building('BN-RAM-00266') || pickB((b) => b.district === 'masyoun' && b.source === 'gis', 2);
  const bDupB = nearest(bDupA.id, (b) => b.source === 'independent');
  const bDup2A = pickB((b) => b.district === 'manara' && b.source === 'gis' && !b.key, 6);
  const bDup2B = nearest(bDup2A.id, (b) => b.source === 'gis' && !b.key);
  const bCorr3 = pickB((b) => b.district === 'irsal' && b.source === 'gis' && b.type === 'commercial' && !b.key);

  const RT = {
    newReg: { en: 'New building registration', ar: 'تسجيل مبنى جديد', short: T('New registration', 'تسجيل جديد'), icon: 'plus', tone: 'mint' },
    missing: { en: 'Missing building report', ar: 'بلاغ عن مبنى غير مُدرج', short: T('Missing building', 'مبنى غير مُدرج'), icon: 'flag', tone: 'warn' },
    correction: { en: 'Information correction', ar: 'تصحيح معلومات', short: T('Correction', 'تصحيح'), icon: 'edit', tone: 'info' },
    duplicate: { en: 'Duplicate report', ar: 'بلاغ تكرار سجل', short: T('Duplicate', 'تكرار'), icon: 'layers', tone: 'violet' },
    link: { en: 'Link to municipal reference', ar: 'ربط بمرجع بلدي', short: T('Link to reference', 'ربط بمرجع'), icon: 'link', tone: 'navy' },
  };
  const CH = {
    app: T('BENA app — owner', 'تطبيق بينا — مالك'),
    committee: T('Committee portal', 'بوابة اللجنة'),
    manager: T('Property manager portal', 'بوابة مدير العقار'),
    field: T('Municipal field survey', 'مسح ميداني بلدي'),
    citizen: T('Citizen report', 'بلاغ مواطن'),
    import: T('Bulk import (sample)', 'استيراد مجمّع (نموذج)'),
  };
  const docs = {
    deed: T('Ownership deed (Tabu extract)', 'سند الملكية (إخراج قيد طابو)'),
    permit: T('Building permit', 'رخصة البناء'),
    plan: T('Site plan & survey', 'مخطط الموقع والمساحة'),
    photos: T('Site photos', 'صور الموقع'),
    id: T('Applicant ID', 'هوية مقدّم الطلب'),
    letter: T('Committee letter', 'كتاب اللجنة'),
    poa: T('Power of attorney', 'وكالة'),
    asbuilt: T('As-built drawings', 'مخططات التنفيذ'),
  };
  const dd = (k, date, type = 'PDF', size = '1.4 MB', icn = 'doc') => ({ name: docs[k], date, type, size, icon: icn });

  const REQ = [
    { id: 'RR-2026-0418', type: 'newReg', status: 'new', priority: 'medium', building: bNew1.id, by: 'p_ahmad', channel: 'app', date: '2026-11-24',
      title: T(`New residential building — ${tx(bNew1.name)}`, `مبنى سكني جديد — ${bNew1.name.ar}`),
      note: T('Completed in 2025; owner requests a municipal reference so units can be listed and leased.', 'اكتمل البناء عام 2025؛ يطلب المالك مرجعاً بلدياً ليتمكن من عرض الوحدات وتأجيرها.'),
      fields: () => [[L('Address', 'العنوان'), tx(bNew1.address), null], [L('Building type', 'نوع المبنى'), D.typeLabel('residential'), null], [L('Floors', 'الطوابق'), '4', null], [L('Units', 'الوحدات'), '8', null], [L('Parcel', 'القطعة'), parcelTxt(bNew1.parcel), null], [L('Building permit', 'رخصة البناء'), 'RM-BP-2024-0912', null], [L('Footprint', 'المسقط'), L('Drawn in app · 214 m²', 'مرسوم في التطبيق · 214 م²'), null]],
      docs: [dd('deed', '2026-11-24'), dd('permit', '2026-11-24'), dd('plan', '2026-11-24', 'DWG', '3.8 MB', 'map'), dd('photos', '2026-11-24', 'JPG ×6', '9.1 MB', 'image')],
      checks: [['ok', T('Parcel exists in land registry layer (sample)', 'القطعة موجودة في طبقة تسجيل الأراضي (نموذج)')], ['ok', T('No overlap with existing footprints', 'لا تداخل مع مساقط قائمة')], ['warn', T('Permit year differs from completion year', 'سنة الرخصة تختلف عن سنة الإنجاز')]] },
    { id: 'RR-2026-0416', type: 'link', status: 'new', priority: 'high', building: 'BN-RAM-00529', by: 'p_issa', channel: 'app', date: '2026-11-22',
      title: T('Link Old Town Stone House to a sample municipal reference', 'ربط البيت الحجري في البلدة القديمة بمرجع بلدي نموذجي'),
      note: T('Independent record created by the owner. A matching heritage footprint exists in the sample municipal layer.', 'سجل مستقل أنشأه المالك. يوجد مسقط تراثي مطابق في الطبقة البلدية النموذجية.'),
      gis: 'RM-GIS-41877', ref: 'RM/OC/1998/0529',
      fields: () => { const b = D.building('BN-RAM-00529') || bNew2; return [[L('Sample GIS ID', 'رقم GIS النموذجي'), 'RM-GIS-41877', null], [L('Sample municipal ref.', 'المرجع البلدي النموذجي'), 'RM/OC/1998/0529', null], [L('Address', 'العنوان'), tx(b.address), L('7 Market Ln., Old City', '7 زقاق السوق، البلدة القديمة')], [L('Building type', 'نوع المبنى'), D.typeLabel(b.type), D.typeLabel('heritage')], [L('Parcel', 'القطعة'), parcelTxt(b.parcel), parcelTxt(b.parcel)], [L('Footprint match', 'تطابق المسقط'), '94%', '94%']]; },
      docs: [dd('deed', '2026-11-22'), dd('photos', '2026-11-22', 'JPG ×4', '6.3 MB', 'image')],
      checks: [['ok', T('Footprint overlap 94% with RM-GIS-41877', 'تطابق المسقط 94% مع RM-GIS-41877')], ['ok', T('Parcel matches', 'القطعة مطابقة')], ['warn', T('Heritage layer — conservation unit must be notified', 'طبقة تراثية — يجب إبلاغ وحدة الحفاظ')]] },
    { id: 'RR-2026-0415', type: 'duplicate', status: 'underReview', priority: 'high', building: bDupB.id, other: bDupA.id, by: 'p_zaid', channel: 'committee', date: '2026-11-21',
      title: T(`Possible duplicate of ${tx(bDupA.name)}`, `تكرار محتمل لـ ${bDupA.name.ar}`),
      note: T('Committee reports that an independent record appears to describe the same building.', 'تفيد اللجنة بأن سجلاً مستقلاً يبدو أنه يصف المبنى نفسه.'),
      cols: () => [L('Reported record', 'السجل المُبلّغ عنه'), L('Existing municipal record (sample)', 'السجل البلدي القائم (نموذج)')],
      fields: () => [[L('BENA ID', 'رقم بينا'), bDupB.id, bDupA.id], [L('Source', 'المصدر'), L('Independent', 'مستقل'), L('Municipal GIS (sample)', 'نظم المعلومات البلدية (نموذج)')], [L('Address', 'العنوان'), tx(bDupB.address), tx(bDupA.address)], [L('Parcel', 'القطعة'), parcelTxt({ basin: 12, parcel: 140 }), parcelTxt(bDupA.parcel)], [L('Units', 'الوحدات'), String(bDupB.units), String(bDupA.units)], [L('Footprint overlap', 'تداخل المسقط'), '71%', '71%']],
      docs: [dd('letter', '2026-11-21'), dd('photos', '2026-11-21', 'JPG ×2', '2.2 MB', 'image')],
      checks: [['warn', T('Footprints overlap by 71%', 'تتداخل المساقط بنسبة 71%')], ['warn', T('Same parcel number on both records', 'رقم القطعة نفسه في السجلين')]] },
    { id: 'RR-2026-0414', type: 'missing', status: 'needsInfo', priority: 'medium', building: bMiss1.id, by: 'p_hani', channel: 'citizen', date: '2026-11-20',
      title: T('Building on Valley Rd. not shown on the map', 'مبنى على طريق الوادي غير ظاهر على الخريطة'),
      note: T('Three-storey building behind the reported footprint; access from the terrace stairs.', 'مبنى من ثلاثة طوابق خلف المسقط المُبلّغ عنه؛ الدخول من درج المصاطب.'),
      fields: () => [[L('Reported location', 'الموقع المُبلّغ عنه'), L(`Behind ${tx(bMiss1.name)}`, `خلف ${bMiss1.name.ar}`), L('No footprint at this point', 'لا يوجد مسقط في هذه النقطة')], [L('Estimated floors', 'الطوابق التقديرية'), '3', null], [L('Building type', 'نوع المبنى'), D.typeLabel('residential'), null], [L('Year built (approx.)', 'سنة البناء (تقريباً)'), '2019', null]],
      docs: [dd('photos', '2026-11-20', 'JPG ×2', '3.1 MB', 'image')],
      checks: [['warn', T('No parcel supplied', 'لم تُرفق بيانات القطعة')], ['ok', T('Location inside the sample municipal boundary', 'الموقع ضمن حدود البلدية النموذجية')]],
      extra: [{ date: '2026-11-21', title: T('Additional information requested', 'طُلبت معلومات إضافية'), body: T('Please share the parcel number or the owner\'s contact.', 'يرجى تزويدنا برقم القطعة أو بيانات التواصل مع المالك.'), who: 'p_maha' }] },
    { id: 'RR-2026-0413', type: 'newReg', status: 'underReview', priority: 'low', building: bNew2.id, by: 'p_layla', channel: 'app', date: '2026-11-19',
      title: T(`Register stone house — ${tx(bNew2.name)}`, `تسجيل بيت حجري — ${bNew2.name.ar}`),
      note: T('Older building with no digital record; owner holds an old deed copy.', 'مبنى قديم دون سجل رقمي؛ يحتفظ المالك بنسخة من سند قديم.'),
      fields: () => [[L('Address', 'العنوان'), tx(bNew2.address), null], [L('Building type', 'نوع المبنى'), D.typeLabel(bNew2.type), null], [L('Floors', 'الطوابق'), String(bNew2.floors), null], [L('Units', 'الوحدات'), String(bNew2.units), null], [L('Parcel', 'القطعة'), parcelTxt(bNew2.parcel), null]],
      docs: [dd('deed', '2026-11-19'), dd('id', '2026-11-19', 'JPG', '0.6 MB', 'image'), dd('photos', '2026-11-19', 'JPG ×5', '7.4 MB', 'image')],
      checks: [['ok', T('Parcel exists', 'القطعة موجودة')], ['warn', T('Located in heritage zone', 'يقع ضمن منطقة تراثية')]] },
    { id: 'RR-2026-0411', type: 'link', status: 'needsInfo', priority: 'medium', building: 'BN-RAM-00744', by: 'p_rania', channel: 'manager', date: '2026-11-12',
      title: T('Link Batn Al-Hawa Villas to a sample municipal reference', 'ربط فلل بطن الهوا بمرجع بلدي نموذجي'),
      note: T('Registered independently by the developer in 2022; footprint added in the 2026 survey.', 'سُجّلت بشكل مستقل من المطوّر عام 2022؛ أضيف المسقط في مسح 2026.'),
      gis: 'RM-GIS-52210', ref: 'RM/BH/2022/0744',
      fields: () => { const b = D.building('BN-RAM-00744') || bNew1; return [[L('Sample GIS ID', 'رقم GIS النموذجي'), 'RM-GIS-52210', null], [L('Address', 'العنوان'), tx(b.address), tx(b.address)], [L('Units', 'الوحدات'), String(b.units), '5'], [L('Parcel', 'القطعة'), parcelTxt(b.parcel), parcelTxt(b.parcel)], [L('Footprint match', 'تطابق المسقط'), '88%', '88%']]; },
      docs: [dd('poa', '2026-11-12'), dd('permit', '2026-11-12')],
      checks: [['ok', T('Footprint overlap 88%', 'تطابق المسقط 88%')], ['warn', T('Unit count differs (6 vs 5)', 'عدد الوحدات مختلف (6 مقابل 5)')]],
      extra: [{ date: '2026-11-16', title: T('Additional information requested', 'طُلبت معلومات إضافية'), body: T('Please confirm whether the annex is a separate unit.', 'يرجى تأكيد ما إذا كان الملحق وحدة مستقلة.'), who: 'p_maha' }] },
    { id: 'RR-2026-0410', type: 'duplicate', status: 'rejected', priority: 'low', building: bDup2A.id, other: bDup2B.id, by: 'p_hala', channel: 'citizen', date: '2026-11-06', decided: '2026-11-08',
      title: T('Two records on one plot in Al-Manara', 'سجلان على قطعة واحدة في المنارة'),
      cols: () => [L('Reported record', 'السجل المُبلّغ عنه'), L('Other record', 'السجل الآخر')],
      note: T('Reporter believed the two footprints are the same building.', 'اعتقد المُبلّغ أن المسقطين لمبنى واحد.'),
      fields: () => [[L('BENA ID', 'رقم بينا'), bDup2A.id, bDup2B.id], [L('Address', 'العنوان'), tx(bDup2A.address), tx(bDup2B.address)], [L('Parcel', 'القطعة'), parcelTxt(bDup2A.parcel), parcelTxt(bDup2B.parcel)], [L('Footprint overlap', 'تداخل المسقط'), '0%', '0%']],
      docs: [dd('photos', '2026-11-06', 'JPG', '1.1 MB', 'image')],
      checks: [['ok', T('No footprint overlap', 'لا يوجد تداخل في المساقط')], ['ok', T('Different parcels', 'قطع مختلفة')]],
      extra: [{ date: '2026-11-08', title: T('Rejected — not a duplicate', 'مرفوض — ليس تكراراً'), body: T('Adjacent buildings on separate parcels.', 'مبنيان متجاوران على قطعتين منفصلتين.'), who: 'p_maha', done: true }] },
    { id: 'RR-2026-0409', type: 'missing', status: 'approved', priority: 'low', building: bMiss2.id, by: 'p_firas', channel: 'field', date: '2026-11-03', decided: '2026-11-05',
      title: T('New annex not in the map layer — Al-Tireh', 'ملحق جديد غير مُدرج في طبقة الخريطة — الطيرة'),
      note: T('Captured during the autumn field survey.', 'تم رصده خلال المسح الميداني الخريفي.'),
      fields: () => [[L('Reported location', 'الموقع المُبلّغ عنه'), L(`Next to ${tx(bMiss2.name)}`, `بجانب ${bMiss2.name.ar}`), L('No footprint', 'لا يوجد مسقط')], [L('Floors', 'الطوابق'), '2', null], [L('Building type', 'نوع المبنى'), D.typeLabel('residential'), null]],
      docs: [dd('plan', '2026-11-03', 'GeoJSON', '0.2 MB', 'map'), dd('photos', '2026-11-03', 'JPG ×3', '4.4 MB', 'image')],
      checks: [['ok', T('Survey GPS accuracy ±0.8 m', 'دقة GPS للمسح ±0.8 م')]],
      extra: [{ date: '2026-11-05', title: T('Approved — footprint added to layer', 'تمت الموافقة — أضيف المسقط إلى الطبقة'), who: 'p_maha', done: true }] },
    { id: 'RR-2026-0407', type: 'newReg', status: 'approved', priority: 'low', building: bNew3.id, by: 'p_nadia', channel: 'app', date: '2026-10-29', decided: '2026-11-02',
      title: T(`Register family building — ${tx(bNew3.name)}`, `تسجيل مبنى عائلي — ${bNew3.name.ar}`),
      fields: () => [[L('Address', 'العنوان'), tx(bNew3.address), null], [L('Floors', 'الطوابق'), String(bNew3.floors), null], [L('Units', 'الوحدات'), String(bNew3.units), null], [L('Parcel', 'القطعة'), parcelTxt(bNew3.parcel), null]],
      docs: [dd('deed', '2026-10-29'), dd('permit', '2026-10-29'), dd('photos', '2026-10-29', 'JPG ×4', '5.0 MB', 'image')],
      checks: [['ok', T('Parcel exists', 'القطعة موجودة')], ['ok', T('No overlap', 'لا تداخل')]],
      extra: [{ date: '2026-11-02', title: T('Approved — field verification scheduled', 'تمت الموافقة — جُدول التحقق الميداني'), who: 'p_maha', done: true }] },
  ];
  const OPEN = ['new', 'underReview', 'needsInfo'];
  const openCount = () => REQ.filter((q) => OPEN.includes(q.status)).length;
  const reqOf = (id) => REQ.find((q) => q.id === id);
  B.data.muniRequests = REQ; // exposed for other screens (read-only use)

  /* ================================================================= styles */
  B.css(`
  .mu { --mu-gap: 16px; }
  .mu-tag { display: inline-flex; align-items: center; margin-inline-start: 8px; padding: 1px 8px; border-radius: 99px; background: var(--warn-bg); color: var(--warn); font-size: 11px; font-weight: 600; letter-spacing: .02em; text-transform: none; vertical-align: 1px; cursor: help; }
  .mu-sw { width: 12px; height: 12px; border-radius: 4px; display: inline-block; flex: none; }
  .mu-m-only { display: none; }
  @media (max-width: 767px) { .mu-m-only { display: inline; } .mu-d-only { display: none !important; } }
  .mu .faint { color: var(--text-3); }
  .mu-ph { display: flex; align-items: flex-end; gap: 16px; padding: 6px 0 16px; flex-wrap: wrap; }
  .mu-eb { font-size: 11.5px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--text-3); margin-bottom: 6px; }
  html[dir="rtl"] .mu-eb { letter-spacing: 0; }
  .mu-ph h1 { font-size: 24px; font-weight: 700; line-height: 1.2; letter-spacing: -.02em; }
  .mu-ph p { color: var(--text-2); font-size: 13.5px; margin-top: 4px; max-width: 80ch; }
  .mu-ph > .grow { flex: 1 1 460px; }
  .mu-ph-a { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .mu-ph-a .btn { height: 36px; padding: 0 14px; font-size: 13.5px; border-radius: 10px; }
  .mu-ph-a .btn svg { width: 16px; height: 16px; }
  @media (max-width: 767px) { .mu-ph { padding: 4px 0 12px; } .mu-ph h1 { font-size: 21px; } .mu-ph-a { width: 100%; } .mu-ph-a .btn { flex: 1; } }

  /* KPI strip */
  .mu-kstrip { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); }
  .mu-kstrip .ki { padding: 14px 18px; border-inline-start: 1px solid var(--line-2); min-width: 0; text-align: start; display: block; width: 100%; }
  .mu-kstrip .ki:first-child { border-inline-start: 0; }
  .mu-kstrip button.ki:hover { background: var(--surface-2); }
  .mu-kstrip .kl { display: block; font-size: 12px; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mu-kstrip b { display: block; font-family: var(--font-display); font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.2; margin-top: 4px; }
  .mu-kstrip b.t-warn { color: var(--warn); } .mu-kstrip b.t-bad { color: var(--bad); } .mu-kstrip b.t-ok { color: var(--ok); }
  .mu-kstrip small { display: block; font-size: 11.5px; color: var(--text-3); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  @media (max-width: 1180px) { .mu-kstrip { grid-template-columns: repeat(3, minmax(0, 1fr)); } .mu-kstrip .ki:nth-child(3n+1) { border-inline-start: 0; } .mu-kstrip .ki:nth-child(n+4) { border-top: 1px solid var(--line-2); } }
  @media (max-width: 640px) { .mu-kstrip { grid-template-columns: repeat(2, minmax(0, 1fr)); } .mu-kstrip .ki { padding: 12px 14px; border-inline-start: 1px solid var(--line-2) !important; border-top: 1px solid var(--line-2); } .mu-kstrip .ki:nth-child(odd) { border-inline-start: 0 !important; } .mu-kstrip .ki:nth-child(-n+2) { border-top: 0; } .mu-kstrip b { font-size: 19px; } }

  /* Saved views + filter bar */
  .mu-views { display: flex; gap: 6px; align-items: center; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
  .mu-views::-webkit-scrollbar { display: none; }
  .mu-vchip { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px; border-radius: 8px; font-size: 13px; font-weight: 550; color: var(--text-2); white-space: nowrap; flex: none; border: 1px solid transparent; }
  .mu-vchip:hover { background: var(--hover); color: var(--ink); }
  .mu-vchip svg { width: 14px; height: 14px; }
  .mu-vchip i { font-style: normal; font-size: 11.5px; color: var(--text-3); font-variant-numeric: tabular-nums; }
  .mu-vchip.on { background: #fff; color: var(--ink); border-color: var(--line); box-shadow: var(--shadow-1); }
  .mu-vchip.on i { color: var(--mint-ink); font-weight: 700; }
  .mu-vsave { display: inline-flex; align-items: center; gap: 4px; height: 30px; padding: 0 10px; font-size: 12.5px; color: var(--mint-ink); font-weight: 600; flex: none; white-space: nowrap; }
  .mu-vsave svg { width: 14px; height: 14px; }
  .mu-fbar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .mu-fbar .input-icon { flex: 1 1 240px; min-width: 0; }
  .mu-fbar .input, .mu-fbar .select { height: 36px; font-size: 13.5px; border-radius: 10px; }
  .mu-fbar .input-icon svg { width: 16px; height: 16px; }
  .mu-fbar .select { width: auto; min-width: 136px; flex: 0 1 auto; padding-inline-end: 30px; }
  .mu-fbar .mu-count { margin-inline-start: auto; }
  .mu-count { font-size: 12.5px; color: var(--text-3); white-space: nowrap; font-variant-numeric: tabular-nums; }
  .mu-toolrow { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin: 12px 0 10px; }
  @media (max-width: 767px) { .mu-fbar .input-icon { flex-basis: 100%; } .mu-fbar .select { flex: 1 1 calc(50% - 4px); min-width: 0; } }

  /* Dense table */
  .mu-dt .table { font-size: 13.5px; }
  .mu-dt .table th { padding: 9px 12px; font-size: 11.5px; letter-spacing: .02em; z-index: 2; }
  .mu-dt .table td { padding: 7px 12px; height: 44px; line-height: 1.35; }
  .mu-dt-scroll { overflow: auto; }
  .mu-dt .table tbody tr.active { background: var(--mint-50); box-shadow: inset 3px 0 0 var(--mint); }
  html[dir="rtl"] .mu-dt .table tbody tr.active { box-shadow: inset -3px 0 0 var(--mint); }
  .mu-dt .table tbody tr.picked { background: #F3F8F6; }
  .mu-th-cb, .mu-td-cb { width: 40px; padding-inline-end: 0 !important; }
  .mu-cb { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid #B8C6C0; background: #fff; display: grid; place-items: center; color: transparent; flex: none; transition: all .12s; }
  .mu-cb svg { width: 12px; height: 12px; stroke-width: 3; }
  .mu-cb.on, .mu-cb.some { background: var(--navy); border-color: var(--navy); color: #fff; }
  .mu-cb:hover { border-color: var(--navy); }
  .mu-bulk { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: var(--navy); color: #fff; font-size: 13px; flex-wrap: wrap; }
  .mu-bulk .n { display: inline-flex; align-items: center; gap: 10px; }
  .mu-bulk .mu-cb { border-color: #fff; background: #fff; color: var(--navy); }
  .mu-bulk-a { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }
  .mu-bulk-a .btn { height: 30px; padding: 0 10px; font-size: 12.5px; border-radius: 8px; background: rgba(255,255,255,.1); color: #fff; border-color: rgba(255,255,255,.16); }
  .mu-bulk-a .btn:hover { background: rgba(255,255,255,.18); }
  .mu-bulk-a .btn.btn-primary { background: var(--mint); color: var(--navy); border-color: var(--mint); }
  .mu-bulk-a .btn svg { width: 14px; height: 14px; }
  .mu-bulk-x { color: var(--navy-ink); font-size: 12.5px; font-weight: 600; }
  .mu-dt .pager { padding: 10px 14px; border-top: 1px solid var(--line-2); }
  .mu-dt .m-row .mu-cb { margin-top: 2px; }
  .mu-dt .m-row.mu-m-active { background: var(--mint-50); }
  .mu-2l small { display: block; font-size: 11.5px; color: var(--text-3); margin-top: 1px; white-space: nowrap; }
  .mu-2l b { font-weight: 600; }
  .mu-ti { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; background: var(--line-2); color: var(--navy); flex: none; }
  .mu-ti svg { width: 15px; height: 15px; }
  .mu-ti.ind { background: var(--violet-bg); color: var(--violet); }
  .mu-cell { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .mu-cell > div { min-width: 0; }
  .mu-cell b { display: block; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px; }
  .mu-cell small { display: block; font-size: 11.5px; color: var(--text-3); white-space: nowrap; }
  .mu-flags { display: inline-flex; gap: 4px; flex-wrap: wrap; }
  .mu-fl { display: inline-flex; align-items: center; gap: 3px; height: 20px; padding: 0 6px; border-radius: 5px; font-size: 11px; font-weight: 600; background: var(--warn-bg); color: var(--warn); white-space: nowrap; }
  .mu-fl.v { background: var(--violet-bg); color: var(--violet); }
  .mu-fl.b { background: var(--bad-bg); color: var(--bad); }
  .mu-fl.n { background: var(--neutral-bg); color: var(--neutral); }
  .mu-fl svg { width: 11px; height: 11px; }

  /* Split view */
  .mu-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(360px, 420px); gap: var(--mu-gap); align-items: start; }
  .mu-split.wide { grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); }
  .mu-split.narrow { grid-template-columns: minmax(300px, 380px) minmax(0, 1fr); }
  .mu-pane { position: sticky; top: calc(var(--topbar-h) + 12px); max-height: calc(100dvh - var(--topbar-h) - 24px); overflow-y: auto; padding: 0; }
  .mu-pane-h { display: flex; align-items: flex-start; gap: 10px; padding: 16px 18px 12px; border-bottom: 1px solid var(--line-2); position: sticky; top: 0; background: #fff; z-index: 2; }
  .mu-pane-b { padding: 16px 18px; }
  .mu-pane-f { display: flex; gap: 8px; flex-wrap: wrap; padding: 12px 18px; border-top: 1px solid var(--line-2); position: sticky; bottom: 0; background: #fff; z-index: 2; }
  .mu-pane-f .btn { height: 36px; font-size: 13.5px; padding: 0 12px; }
  .mu-sec { font-size: 11.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--text-3); margin: 16px 0 8px; display: flex; align-items: center; gap: 8px; }
  html[dir="rtl"] .mu-sec { letter-spacing: 0; }
  .mu-sec:first-child { margin-top: 0; }
  .mu-sec .grow { flex: 1; }
  @media (max-width: 1180px) { .mu-split, .mu-split.wide, .mu-split.narrow { grid-template-columns: minmax(0, 1fr); } .mu-pane { position: static; max-height: none; } }

  /* Attribute list */
  .mu-attrs { margin: 0; display: flex; flex-direction: column; }
  .mu-attrs > div { display: grid; grid-template-columns: minmax(110px, 40%) minmax(0, 1fr); gap: 12px; padding: 7px 0; border-bottom: 1px solid var(--line-2); font-size: 13.5px; align-items: center; }
  .mu-attrs > div:last-child { border-bottom: 0; }
  .mu-attrs dt { color: var(--text-3); font-size: 12.5px; }
  .mu-attrs dd { margin: 0; font-weight: 550; min-width: 0; overflow-wrap: anywhere; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

  /* Building quick view */
  .mu-qv-id { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--line-2); margin-bottom: 12px; }
  .mu-qv-id .l { font-size: 11px; color: var(--text-3); font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
  html[dir="rtl"] .mu-qv-id .l { letter-spacing: 0; }
  .mu-qv-id .v { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 15px; font-weight: 700; color: var(--ink); direction: ltr; unicode-bidi: isolate; }
  .mu-qv-id .grow { min-width: 0; }
  .mu-qv-t { display: flex; align-items: flex-start; gap: 10px; min-width: 0; }
  .mu-qv-t h3 { font-size: 16px; line-height: 1.3; }
  .mu-qv-t small { display: block; font-size: 12.5px; color: var(--text-2); margin-top: 2px; }
  .mu-qv-acts { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .mu-qv-acts .btn { height: 34px; font-size: 13px; padding: 0 10px; border-radius: 9px; }
  .mu-qv-acts .btn svg { width: 15px; height: 15px; }
  .mu-qv-acts .full { grid-column: 1 / -1; }
  .mu-own { display: flex; gap: 8px; align-items: flex-start; font-size: 12px; color: var(--text-3); margin-top: 12px; line-height: 1.45; }
  .mu-own svg { width: 14px; height: 14px; flex: none; margin-top: 1px; }

  /* Overview */
  .mu-hero { background: var(--navy); border-radius: var(--r-lg); color: var(--navy-ink); padding: 22px 26px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.9fr); gap: 26px; align-items: center; }
  .mu-hero .eyebrow { color: var(--navy-ink); opacity: .8; }
  .mu-big { font-family: var(--font-display); font-size: 42px; font-weight: 700; color: #fff; line-height: 1; letter-spacing: -.03em; margin-top: 8px; font-variant-numeric: tabular-nums; }
  .mu-big small { font-size: 13px; font-weight: 500; color: var(--navy-ink); letter-spacing: 0; margin-inline-start: 8px; }
  .mu-hsplit { display: flex; height: 7px; border-radius: 99px; overflow: hidden; background: rgba(255,255,255,.08); margin-top: 16px; gap: 2px; }
  .mu-hsplit i { display: block; height: 100%; }
  .mu-split-l { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 9px; font-size: 12px; }
  .mu-split-l span { display: inline-flex; align-items: center; gap: 6px; }
  .mu-split-l i { width: 8px; height: 8px; border-radius: 50%; }
  .mu-hstats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .mu-hstats > div { padding: 4px 18px; border-inline-start: 1px solid rgba(255,255,255,.1); min-width: 0; }
  .mu-hstats b { display: block; font-family: var(--font-display); font-size: 24px; color: #fff; font-variant-numeric: tabular-nums; line-height: 1.15; margin-top: 5px; }
  .mu-hstats span { font-size: 12px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mu-hstats small { display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; color: var(--mint); margin-top: 5px; white-space: nowrap; }
  .mu-hstats small svg { width: 12px; height: 12px; }
  @media (max-width: 1180px) { .mu-hero { grid-template-columns: 1fr; gap: 20px; } .mu-hstats > div:first-child { border-inline-start: 0; padding-inline-start: 0; } }
  @media (max-width: 640px) {
    .mu-hero { padding: 18px; border-radius: 16px; } .mu-big { font-size: 36px; }
    .mu-hstats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 0; padding-top: 16px; border-top: 1px solid rgba(255,255,255,.1); }
    .mu-hstats > div { padding: 0 12px; } .mu-hstats > div:nth-child(odd) { border-inline-start: 0; padding-inline-start: 0; } .mu-hstats b { font-size: 20px; }
  }
  .mu-wq { display: flex; flex-direction: column; }
  .mu-wq button { display: grid; grid-template-columns: 34px minmax(0, 1fr) auto auto; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line-2); text-align: start; width: 100%; }
  .mu-wq button:last-child { border-bottom: 0; }
  .mu-wq button:hover b.t { color: var(--mint-ink); }
  .mu-wq .li-icon { width: 34px; height: 34px; border-radius: 10px; }
  .mu-wq .li-icon svg { width: 16px; height: 16px; }
  .mu-wq b.t { display: block; font-size: 13.5px; font-weight: 600; transition: color .15s; }
  .mu-wq small { display: block; font-size: 12px; color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mu-wq .n { font-family: var(--font-display); font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .mu-wq > button > svg { width: 16px; height: 16px; color: var(--text-3); }
  .mu-cov { display: flex; flex-direction: column; }
  .mu-cov-row { display: grid; grid-template-columns: minmax(120px, 1fr) minmax(0, 2fr) 56px; gap: 14px; align-items: center; padding: 9px 0; border-bottom: 1px solid var(--line-2); text-align: start; width: 100%; }
  .mu-cov-row:last-child { border-bottom: 0; }
  .mu-cov-row:hover b.n { color: var(--mint-ink); }
  .mu-cov-row b.n { display: block; font-size: 13.5px; font-weight: 600; transition: color .15s; }
  .mu-cov-row small { display: block; font-size: 11.5px; color: var(--text-3); font-variant-numeric: tabular-nums; }
  .mu-cov-row .p { text-align: end; font-weight: 700; font-variant-numeric: tabular-nums; font-size: 13.5px; }
  .mu-track { height: 8px; border-radius: 99px; background: var(--line-2); display: flex; overflow: hidden; gap: 2px; }
  .mu-track i { display: block; height: 100%; }
  @media (max-width: 640px) { .mu-cov-row { grid-template-columns: minmax(0, 1fr) 56px; gap: 6px 12px; } .mu-cov-row .mu-track { grid-column: 1 / -1; order: 3; } }
  @media (max-width: 767px) { .mu .bars .col .tip, .mu .line-chart .hz .tip { display: none; } }
  .mu-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .mu-strip > div { padding: 14px 18px; border-inline-start: 1px solid var(--line-2); min-width: 0; }
  .mu-strip > div:first-child { border-inline-start: 0; }
  .mu-strip b { display: block; font-family: var(--font-display); font-size: 22px; font-variant-numeric: tabular-nums; line-height: 1.15; }
  .mu-strip span { display: block; font-size: 12px; color: var(--text-2); }
  .mu-strip small { display: block; font-size: 11.5px; color: var(--text-3); margin-top: 2px; }
  @media (max-width: 640px) { .mu-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); } .mu-strip > div { padding: 12px 14px; } .mu-strip > div:nth-child(3) { border-inline-start: 0; } .mu-strip > div:nth-child(n+3) { border-top: 1px solid var(--line-2); } .mu-strip b { font-size: 19px; } }

  /* ======================= GIS workspace ======================= */
  .content:has(.mu-gisw) { max-width: none; padding-inline: 16px; padding-bottom: 14px; }
  .mu-gisw { display: flex; flex-direction: column; height: calc(100dvh - var(--topbar-h) - 22px); min-height: 600px; background: #fff; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
  .mu-gbar { display: flex; align-items: center; gap: 12px; padding: 8px 12px 8px 16px; border-bottom: 1px solid var(--line); min-height: 52px; flex: none; }
  html[dir="rtl"] .mu-gbar { padding: 8px 16px 8px 12px; }
  .mu-gbar h1 { font-size: 16px; font-weight: 700; white-space: nowrap; }
  .mu-gbar .sub { font-size: 12px; color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mu-gbar .ttl { min-width: 0; display: flex; flex-direction: column; }
  .mu-gbar .seg button { height: 28px; padding: 0 10px; font-size: 12.5px; }
  .mu-gbar .seg button svg { width: 14px; height: 14px; }
  .mu-gbar .btn { height: 32px; padding: 0 12px; font-size: 13px; border-radius: 9px; }
  .mu-gbar .btn svg { width: 15px; height: 15px; }
  .mu-gbar .lbl { font-size: 12px; color: var(--text-3); white-space: nowrap; }
  .mu-gbody { flex: 1; min-height: 0; display: grid; grid-template-columns: 52px 300px minmax(0, 1fr); }
  .mu-gbody.pc { grid-template-columns: 52px 0 minmax(0, 1fr); }
  .mu-gbody.pc .mu-gpanel { visibility: hidden; border: 0; }
  .mu-rail { background: var(--navy); display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 0; }
  .mu-rail button { width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center; color: var(--navy-ink); position: relative; }
  .mu-rail button svg { width: 18px; height: 18px; }
  .mu-rail button:hover { background: rgba(255,255,255,.08); color: #fff; }
  .mu-rail button.on { background: rgba(54,214,160,.16); color: var(--mint); }
  .mu-rail button i { position: absolute; top: 4px; inset-inline-end: 4px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 8px; background: var(--mint); color: var(--navy); font-size: 10px; font-weight: 700; font-style: normal; display: grid; place-items: center; }
  .mu-rail .sp { flex: 1; }
  .mu-rail .tip { position: absolute; inset-inline-start: 48px; background: var(--navy); color: #fff; font-size: 12px; padding: 4px 8px; border-radius: 6px; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity .15s; z-index: 10; }
  .mu-rail button:hover .tip { opacity: 1; }
  .mu-gpanel { border-inline-end: 1px solid var(--line); display: flex; flex-direction: column; min-height: 0; min-width: 0; background: #fff; overflow: hidden; }
  .mu-gp-h { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px 10px; border-bottom: 1px solid var(--line-2); }
  .mu-gp-h b { font-size: 13.5px; font-weight: 700; }
  .mu-gp-h .icon-btn { width: 30px; height: 30px; border-radius: 8px; }
  .mu-gp-h .icon-btn svg { width: 16px; height: 16px; }
  .mu-gp-b { flex: 1; overflow-y: auto; padding: 12px 14px 16px; }
  .mu-gp-b .input, .mu-gp-b .select { height: 36px; font-size: 13.5px; border-radius: 9px; }
  .mu-gp-b .input-icon svg { width: 16px; height: 16px; }
  .mu-gp-b .select { width: 100%; }
  .mu-glab { display: block; font-size: 12px; font-weight: 600; color: var(--text-2); margin: 12px 0 5px; }
  .mu-gres { display: flex; flex-direction: column; margin-inline: -6px; }
  .mu-gres button { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 7px 6px; border-radius: 8px; text-align: start; width: 100%; }
  .mu-gres button:hover { background: var(--hover); }
  .mu-gres button.on { background: var(--mint-50); }
  .mu-gres .lead { width: 28px; height: 28px; border-radius: 7px; display: grid; place-items: center; border: 1px solid rgba(20,43,59,.12); }
  .mu-gres .lead svg { width: 14px; height: 14px; color: var(--navy); opacity: .8; }
  .mu-gres b { display: block; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mu-gres small { display: block; font-size: 11.5px; color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mu-gres .st { width: 8px; height: 8px; border-radius: 50%; }
  .mu-gsum { display: flex; align-items: baseline; gap: 6px; margin: 12px 0 6px; }
  .mu-gsum b { font-family: var(--font-display); font-size: 20px; font-variant-numeric: tabular-nums; }
  .mu-gsum span { font-size: 12px; color: var(--text-3); }
  .mu-bm { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .mu-bm button { height: 30px; border-radius: 8px; border: 1px solid var(--line); font-size: 12.5px; font-weight: 550; color: var(--text-2); padding: 0 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: start; }
  .mu-bm button:hover { border-color: var(--navy); color: var(--ink); }
  .mu-bm button.on { border-color: var(--mint-ink); background: var(--mint-50); color: var(--mint-ink); }
  .mu-lyr { display: flex; flex-direction: column; }
  .mu-lyr label { display: grid; grid-template-columns: 20px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--line-2); cursor: pointer; font-size: 13.5px; }
  .mu-lyr label:last-child { border-bottom: 0; }
  .mu-lyr label small { display: block; font-size: 11.5px; color: var(--text-3); }
  .mu-lyr .switch { width: 34px; height: 20px; }
  .mu-lyr .switch i::after { width: 14px; height: 14px; }
  .mu-lyr .switch input:checked + i::after { transform: translateX(14px); }
  html[dir="rtl"] .mu-lyr .switch input:checked + i::after { transform: translateX(-14px); }
  .mu-lsym { width: 20px; height: 14px; border-radius: 3px; display: block; }
  .mu-leg { display: flex; flex-direction: column; gap: 2px; }
  .mu-leg button, .mu-leg div { display: grid; grid-template-columns: 14px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 6px 6px; border-radius: 7px; font-size: 13px; text-align: start; width: 100%; }
  .mu-leg button:hover { background: var(--hover); }
  .mu-leg button.on { background: var(--mint-50); }
  .mu-leg b { font-variant-numeric: tabular-nums; font-size: 12.5px; }
  .mu-leg .bar { grid-column: 2 / -1; height: 3px; border-radius: 3px; background: var(--line-2); overflow: hidden; margin-top: -3px; }
  .mu-leg .bar i { display: block; height: 100%; }
  .mu-gmap { position: relative; min-width: 0; min-height: 0; display: flex; flex-direction: column; background: #E9EFEC; }
  .mu-gmap .mu-gm { flex: 1; min-height: 0; position: relative; }
  .mu-gmap .map-shell { border-radius: 0; border: 0; height: 100%; }
  .mu-gmap .map-ctrls, .mu-gmap .map-scale, .mu-gmap .map-legend, .mu-gmap .map-badge { display: none !important; }
  .mu-gmap.measure .map-shell svg { cursor: crosshair; }
  .mu-gmap.measure .bld { cursor: crosshair; }
  .mu-gtools { position: absolute; top: 12px; inset-inline-start: 12px; z-index: 4; display: flex; gap: 6px; flex-wrap: wrap; }
  .mu-gtg { display: flex; background: #fff; border-radius: 10px; box-shadow: var(--shadow-2); padding: 3px; gap: 2px; }
  .mu-gtg button { width: 34px; height: 34px; border-radius: 8px; display: grid; place-items: center; color: var(--ink); position: relative; }
  .mu-gtg button svg { width: 17px; height: 17px; }
  .mu-gtg button:hover { background: var(--hover); }
  .mu-gtg button.on { background: var(--navy); color: var(--mint); }
  .mu-gtg button[disabled] { opacity: .35; cursor: default; }
  .mu-gtg button .tip { position: absolute; top: 40px; inset-inline-start: 50%; transform: translateX(-50%); background: var(--navy); color: #fff; font-size: 11.5px; padding: 3px 7px; border-radius: 6px; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity .15s; }
  html[dir="rtl"] .mu-gtg button .tip { transform: translateX(50%); }
  .mu-gtg button:hover .tip { opacity: 1; }
  .mu-gbadge { position: absolute; top: 14px; inset-inline-end: 12px; z-index: 3; background: rgba(20,43,59,.9); color: #fff; font-size: 11.5px; font-weight: 600; padding: 6px 10px; border-radius: 8px; display: flex; gap: 6px; align-items: center; }
  .mu-gbadge svg { width: 13px; height: 13px; color: var(--mint); }
  .mu-gmini { position: absolute; bottom: 12px; inset-inline-start: 12px; z-index: 3; background: rgba(255,255,255,.95); border-radius: 10px; box-shadow: var(--shadow-2); padding: 8px 10px; font-size: 11.5px; display: flex; flex-direction: column; gap: 4px; color: var(--text-2); max-width: 220px; }
  .mu-gmini b { font-size: 11px; color: var(--text-3); text-transform: uppercase; letter-spacing: .05em; font-weight: 700; }
  html[dir="rtl"] .mu-gmini b { letter-spacing: 0; }
  .mu-gmini span { display: flex; align-items: center; gap: 7px; }
  .mu-gmini i { width: 11px; height: 11px; border-radius: 3px; flex: none; }
  .mu-gmini i.dash { background: #fff !important; border: 1.5px dashed var(--violet); }
  .mu-gsb { display: flex; align-items: center; gap: 16px; height: 30px; padding: 0 12px; background: #fff; border-top: 1px solid var(--line); font-size: 11.5px; color: var(--text-2); flex: none; white-space: nowrap; overflow: hidden; }
  .mu-gsb span { display: inline-flex; align-items: center; gap: 6px; }
  .mu-gsb svg { width: 13px; height: 13px; color: var(--text-3); }
  .mu-gsb .mono { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 11.5px; direction: ltr; unicode-bidi: isolate; color: var(--ink); }
  .mu-gsb .sp { flex: 1; }
  .mu-sbar { display: inline-block; height: 6px; border: 1.5px solid var(--text-2); border-top: 0; width: 60px; }
  .mu-feat { position: absolute; top: 12px; inset-inline-end: 12px; bottom: 12px; width: 344px; z-index: 5; background: #fff; border-radius: 12px; box-shadow: var(--shadow-3); display: flex; flex-direction: column; overflow: hidden; animation: muIn .22s var(--ease); }
  @keyframes muIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  .mu-feat .mu-pane-h { position: static; }
  .mu-feat-b { flex: 1; overflow-y: auto; padding: 14px 16px; }
  .mu-feat-f { padding: 10px 16px 12px; border-top: 1px solid var(--line-2); }
  .mu-ghint { position: absolute; top: 56px; inset-inline-end: 12px; z-index: 3; background: rgba(255,255,255,.95); border-radius: 9px; box-shadow: var(--shadow-1); padding: 7px 10px; font-size: 12px; color: var(--text-2); display: flex; align-items: center; gap: 6px; }
  .mu-ghint svg { width: 14px; height: 14px; color: var(--mint-ink); }
  .mu-meas { position: absolute; top: 60px; inset-inline-start: 12px; z-index: 4; background: var(--navy); color: #fff; border-radius: 10px; padding: 10px 12px; font-size: 12.5px; box-shadow: var(--shadow-2); min-width: 220px; }
  .mu-meas b { font-family: var(--font-display); font-size: 18px; color: var(--mint); display: block; margin: 2px 0; font-variant-numeric: tabular-nums; }
  .mu-meas .row-sm button { color: var(--navy-ink); font-size: 12px; font-weight: 600; }
  .mu-meas .row-sm button:hover { color: #fff; }
  @media (max-width: 1100px) { .mu-gbody { grid-template-columns: 52px 260px minmax(0, 1fr); } .mu-feat { width: 310px; } }
  @media (max-width: 767px) {
    .content:has(.mu-gisw) { padding-inline: 12px; }
    .mu-gisw { height: auto; min-height: 0; border-radius: 12px; }
    .mu-gbar { flex-wrap: wrap; padding: 10px 12px; }
    .mu-gbar .seg { order: 3; width: 100%; }
    .mu-gbar .seg button { flex: 1; justify-content: center; }
    .mu-gbody, .mu-gbody.pc { display: flex; flex-direction: column; }
    .mu-rail { flex-direction: row; justify-content: space-around; padding: 4px 6px; order: 2; }
    .mu-rail .sp, .mu-rail .tip, .mu-rail .mu-rail-col { display: none; }
    .mu-gmap { order: 1; height: 58dvh; min-height: 360px; flex: none; }
    .mu-gpanel, .mu-gbody.pc .mu-gpanel { order: 3; visibility: visible; border-inline-end: 0; max-height: none; }
    .mu-gp-b { overflow: visible; }
    .mu-feat { position: static; width: auto; box-shadow: none; border-top: 1px solid var(--line); border-radius: 0; order: 4; animation: none; }
    .mu-gbody > .mu-feat-m { order: 2; }
    .mu-gsb .hide-m { display: none; }
    .mu-gmini { display: none; }
    .mu-gbadge { display: none; }
  }

  /* Request detail */
  .rq-cmp { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13.5px; }
  .rq-cmp th { text-align: start; font-size: 11.5px; color: var(--text-3); font-weight: 600; padding: 0 10px 8px; }
  .rq-cmp td { padding: 9px 10px; border-top: 1px solid var(--line-2); vertical-align: top; overflow-wrap: anywhere; }
  .rq-cmp td:first-child, .rq-cmp th:first-child { padding-inline-start: 0; color: var(--text-2); width: 28%; }
  .rq-cmp td.diff { background: var(--warn-bg); color: #8A4108; font-weight: 600; border-radius: 6px; }
  .rq-cmp td.old { color: var(--text-3); text-decoration: line-through; text-decoration-color: rgba(138,153,168,.6); }
  .rq-cmp td.same { background: var(--mint-50); color: #0A6E4D; font-weight: 600; border-radius: 6px; }
  .rq-cmp td.none { color: var(--text-3); font-style: italic; }
  .rq-cmp .dm { display: none; }
  @media (max-width: 640px) {
    .rq-cmp thead { display: none; }
    .rq-cmp tr { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 10px; padding: 10px 0; border-top: 1px solid var(--line-2); }
    .rq-cmp td { border: 0; padding: 4px 8px; }
    .rq-cmp td:first-child { grid-column: 1 / -1; width: auto; padding: 0; font-size: 12px; font-weight: 600; }
    .rq-cmp .dm { display: block; font-size: 10.5px; font-weight: 600; color: var(--text-3); font-style: normal; text-transform: uppercase; letter-spacing: .04em; }
    html[dir="rtl"] .rq-cmp .dm { letter-spacing: 0; }
  }
  .rq-actbar { display: flex; gap: 8px; flex-wrap: wrap; }
  .rq-actbar .btn { height: 36px; font-size: 13.5px; }
  .rq-mob { display: none; }
  @media (max-width: 767px) { .rq-desk { display: none !important; } .rq-mob { display: block; margin-top: 16px; } }
  .rq-checks { display: flex; flex-direction: column; gap: 9px; }
  .rq-checks div { display: flex; gap: 10px; align-items: flex-start; font-size: 13.5px; }
  .rq-checks svg { width: 17px; height: 17px; flex: none; margin-top: 1px; }
  .rq-checks .ok svg { color: var(--ok); }
  .rq-checks .warn svg { color: var(--warn); }
  .rq-meta { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 13px; color: var(--text-2); margin-top: 8px; }
  .rq-meta span { display: inline-flex; align-items: center; gap: 6px; }
  .rq-meta svg { width: 14px; height: 14px; color: var(--text-3); }
  @media (max-width: 767px) { .rq-actbar { position: sticky; bottom: 0; z-index: 5; background: rgba(244,247,246,.94); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); margin-inline: -16px; padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid var(--line); } .rq-actbar .btn { flex: 1; padding: 0 10px; } }

  /* Data sources */
  .ds-layer { display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; gap: 14px; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--line-2); }
  .ds-layer:last-child { border-bottom: 0; }
  .ds-layer .li-icon { width: 40px; height: 40px; }
  .ds-layer b { font-size: 14px; display: block; }
  .ds-layer small { display: block; font-size: 12.5px; color: var(--text-2); margin-top: 2px; }
  .ds-end { display: flex; align-items: center; gap: 10px; }
  @media (max-width: 640px) { .ds-layer { grid-template-columns: 40px minmax(0, 1fr); } .ds-end { grid-column: 2; flex-wrap: wrap; } }
  .ds-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 11px 0; border-bottom: 1px solid var(--line-2); }
  .ds-row:last-child { border-bottom: 0; }
  .ds-row b { display: block; font-size: 13.5px; font-weight: 600; }
  .ds-row small { display: block; font-size: 12px; color: var(--text-2); }
  .mu-heat { display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 6px 12px; align-items: center; }
  .mu-heat .hl { font-size: 12.5px; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mu-heat .heat i { aspect-ratio: auto; height: 20px; }
  .mu-heat .mx { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 4px; font-size: 10.5px; color: var(--text-3); text-align: center; }
  @media (max-width: 640px) { .mu-heat { grid-template-columns: 76px minmax(0, 1fr); } .mu-heat .heat { gap: 2px; } .mu-heat .heat i { height: 18px; border-radius: 3px; } .mu-heat .mx span:nth-child(even) { visibility: hidden; } }
  `);

  /* ---------------- shared computations ---------------- */
  const C = D.city;
  const cityVer = () => { const unver = 127; return { verified: C.total - C.pending - unver, pendingVerification: C.pending, unverified: unver }; };
  const sampleQ = () => {
    const all = D.buildings; const n = all.length; let dup = 0, geom = 0, noParcel = 0, noUnits = 0, outdated = 0;
    all.forEach((b) => { const f = qf(b); if (f.dup) dup++; if (f.geom) geom++; if (f.noParcel) noParcel++; if (f.noUnits) noUnits++; if (f.outdated) outdated++; });
    return { n, dup, geom, noParcel, noUnits, outdated, parcelPct: pct(n - noParcel, n), unitsPct: pct(n - noUnits, n), gisPct: pct(all.filter((b) => b.source === 'gis').length, n) };
  };
  const MAPID = 'muni';
  const districtView = (id) => { const d = D.district(id); return { x: d.seed[0] - 190, y: d.seed[1] - 133, w: 380, h: 266 }; };
  const goDistrict = (id) => {
    B.vs['gx:dist'] = id; B.vs['gx:_ld'] = id; B.vs['gx:sel'] = '';
    B.map.setView(MAPID, districtView(id));
    B.go(`${R}-explorer`);
  };
  B.act.muDistrict = (id) => goDistrict(id);
  B.act.muDq = (flag) => { B.vs['rg:view'] = 'all'; B.vs['rg:dq'] = flag; B.vs['rg:page'] = 0; B.go(rgo('registry')); };
  B.act.muShowOnMap = (bid) => { B.vs['gx:sel'] = bid; B.vs['gx:_ld'] = B.get('gx:dist', 'all'); B.map.focus(MAPID, bid, 400); const v = B.map.view(MAPID); if (v && window.innerWidth > 767) v.x += (B.isAr() ? -1 : 1) * v.w * 0.2; B.go(`${R}-explorer`); };

  /* ---------------- flags & building quick view ---------------- */
  const flagChips = (b, max = 3) => {
    const f = qf(b);
    const out = [];
    if (f.dup) out.push(`<span class="mu-fl v">${icon('layers')}${L('Duplicate?', 'تكرار؟')}</span>`);
    if (f.geom) out.push(`<span class="mu-fl b">${icon('alert')}${L('Geometry', 'المسقط')}</span>`);
    if (f.noParcel) out.push(`<span class="mu-fl">${icon('grid')}${L('No parcel', 'بلا قطعة')}</span>`);
    if (f.noUnits) out.push(`<span class="mu-fl">${icon('hash')}${L('Units?', 'الوحدات؟')}</span>`);
    if (f.outdated) out.push(`<span class="mu-fl n">${icon('clock')}${L('Outdated', 'قديم')}</span>`);
    return out.length ? `<span class="mu-flags">${out.slice(0, max).join('')}${out.length > max ? `<span class="mu-fl n">+${out.length - max}</span>` : ''}</span>` : `<span class="faint">—</span>`;
  };
  const refCell = (b) => (b.ref ? `<div class="mu-2l">${ui.idMono(b.ref)}<small>${esc(b.gis)}</small></div>` : `<span class="badge outline">${icon('userCheck')}${L('Not linked', 'غير مرتبط')}</span>`);
  const verProv = (b) => (b.verification === 'verified' ? '' : b.verification === 'pendingVerification' ? 'pending' : 'submitted');

  /**
   * Building quick view (used in the GIS panel, registry split view, quality drill-down, details).
   * opts: { close: actionName, ctx: 'gis'|'registry'|'details', head: false }
   */
  const quickView = (b, opts = {}) => {
    const f = qf(b);
    const flags = [f.dup && L('Possible duplicate record', 'سجل مكرر محتمل'), f.geom && L('Footprint geometry needs review', 'المسقط بحاجة لمراجعة هندسية'), f.noParcel && L('Parcel reference missing', 'مرجع القطعة مفقود'), f.noUnits && L('Unit count not confirmed', 'عدد الوحدات غير مؤكد'), f.outdated && L('Not reviewed for 9+ months', 'لم يُراجع منذ أكثر من 9 أشهر')].filter(Boolean);
    const verified = b.verification === 'verified';
    const head = opts.head === false ? '' : `<div class="mu-pane-h"><span class="mu-ti ${b.source === 'independent' ? 'ind' : ''}" style="width:36px;height:36px;border-radius:10px">${icon(typeIcon(b.type))}</span>
      <div class="mu-qv-t grow"><div style="min-width:0"><h3>${esc(tx(b.name))}</h3><small>${esc(tx(b.address))}</small></div></div>
      ${opts.close ? `<button class="icon-btn" style="width:32px;height:32px;margin:-4px" data-act="${opts.close}" aria-label="${L('Close', 'إغلاق')}">${icon('x')}</button>` : ''}</div>`;
    const body = `<div class="mu-qv-id"><div class="grow"><div class="l">${L('BENA Building ID', 'رقم بينا للمبنى')}</div><div class="v">${esc(b.id)}</div></div>
        <button class="icon-btn" style="width:30px;height:30px" data-act="muCopy" data-arg="${esc(b.id)}" title="${esc(L('Copy ID', 'نسخ الرقم'))}" aria-label="${esc(L('Copy ID', 'نسخ الرقم'))}">${icon('clipboard')}</button></div>
      <div class="row-sm wrap" style="margin-bottom:10px">${ui.status(b.verification)}${ui.sourceBadge(b.source)}${f.any ? ui.badge(L('Quality flags', 'مؤشرات جودة'), 'warn', 'alert') : ''}</div>
      ${attrs([
        [L('Sample municipal ref.', 'المرجع البلدي النموذجي'), b.ref ? ui.idMono(b.ref) : `<span class="faint">${L('Not linked', 'غير مرتبط')}</span>`, b.ref ? 'official' : 'submitted'],
        [L('Sample GIS ID', 'رقم GIS النموذجي'), b.gis ? ui.idMono(b.gis) : null],
        [L('Verification', 'التحقق'), verified ? L('Verified · GIS & Registry Unit', 'موثّق · وحدة نظم المعلومات والسجل') : b.verification === 'pendingVerification' ? L('In the verification queue', 'في قائمة التحقق') : L('Draft — not yet submitted', 'مسودة — لم تُقدَّم بعد'), verified ? 'official' : verProv(b)],
        [L('Building type', 'نوع المبنى'), D.typeLabel(b.type)],
        [L('Floors', 'الطوابق'), B.num(b.floors)],
        [L('Units', 'الوحدات'), B.num(b.units), f.noUnits ? 'pending' : ''],
        [L('Parcel', 'القطعة'), f.noParcel ? `<span class="faint">${L('Missing', 'مفقود')}</span>` : parcelTxt(b.parcel)],
        [L('District', 'الحي'), dName(b.district)],
        [L('Data source', 'مصدر البيانات'), srcLabel(b.source)],
        [L('Year built', 'سنة البناء'), b.year ? String(b.year) : null],
        [L('Last update', 'آخر تحديث'), B.date(upd(b))],
      ])}
      ${flags.length ? `<div style="margin-top:12px">${ui.callout(`<b>${L('Data quality', 'جودة البيانات')}</b><br>${flags.join(' · ')}`, 'warn', 'alert')}</div>` : ''}
      <div class="mu-own">${icon('info')}<span>${L('The BENA Building ID is a digital reference identity — not proof of legal ownership. Municipal references shown are sample data.', 'رقم بينا للمبنى هوية رقمية مرجعية — وليس إثباتاً للملكية القانونية. المراجع البلدية المعروضة بيانات نموذجية.')}</span></div>`;
    const acts = `<div class="mu-qv-acts">
        ${ui.btn(L('Open Building Identity workspace', 'فتح مساحة هوية المبنى'), { kind: 'primary', icon: 'fingerprint', go: rgo(`building-${b.id}`), cls: 'full' })}
        ${verified ? ui.btn(L('Verified', 'موثّق'), { kind: 'soft', icon: 'shieldCheck', act: 'toast', arg: L('This record is already verified', 'هذا السجل موثّق مسبقاً') }) : ui.btn(L('Verify', 'توثيق'), { kind: 'dark', icon: 'shieldCheck', act: 'muVerify', arg: b.id })}
        ${ui.btn(L('Request correction', 'طلب تصحيح'), { icon: 'edit', act: 'muCorrect', arg: b.id })}
        ${b.source === 'independent' ? ui.btn(L('Link reference', 'ربط بمرجع'), { icon: 'link', act: 'muLink', arg: b.id }) : ui.btn(L('Reference linked', 'المرجع مرتبط'), { icon: 'link', act: 'toast', arg: L('Already linked to a sample municipal reference', 'مرتبط مسبقاً بمرجع بلدي نموذجي') })}
        ${opts.ctx === 'gis' ? ui.btn(L('Details', 'التفاصيل'), { icon: 'doc', go: rgo(`details-${b.id}`) }) : ui.btn(L('Show on map', 'عرض على الخريطة'), { icon: 'map', act: 'muShowOnMap', arg: b.id })}
      </div>`;
    return { head, body, acts };
  };
  B.act.muCopy = (id) => { try { navigator.clipboard && navigator.clipboard.writeText(id); } catch (e) { /* ignore */ } B.toast(L(`${id} copied`, `تم نسخ ${id}`)); };

  /* building actions (shared) */
  B.act.muVerify = (id) => {
    const b = D.building(id);
    B.confirm({ title: L('Verify this building record?', 'توثيق سجل هذا المبنى؟'), text: L(`${b.id} · ${esc(tx(b.name))} will be marked as verified by the GIS & Building Registry Unit (demo).`, `سيتم توثيق ${b.id} · ${esc(tx(b.name))} من قبل وحدة نظم المعلومات وسجل المباني (تجريبي).`), ok: L('Verify record', 'توثيق السجل'),
      onOk: () => { b.verification = 'verified'; b.status = 'registered'; b.updated = '2026-11-25'; B.closeModal(true); B.refresh(); B.toast(L('Building verified (demo)', 'تم توثيق المبنى (تجريبي)')); } });
  };
  B.act.muCorrect = (id) => {
    const b = D.building(id);
    B.modal({ title: L('Request a correction', 'طلب تصحيح'), sub: `${b.id} · ${esc(tx(b.name))}`, form: 'muCorrection',
      body: `<input type="hidden" name="id" value="${esc(id)}"><div class="form-grid">
        ${ui.field({ name: 'field', label: L('What needs correcting?', 'ما الذي يحتاج للتصحيح؟'), type: 'select', full: true, options: [{ v: 'units', l: L('Unit count', 'عدد الوحدات') }, { v: 'floors', l: L('Number of floors', 'عدد الطوابق') }, { v: 'type', l: L('Building type / use', 'نوع / استخدام المبنى') }, { v: 'address', l: L('Address', 'العنوان') }, { v: 'parcel', l: L('Parcel reference', 'مرجع القطعة') }, { v: 'geometry', l: L('Footprint geometry', 'هندسة المسقط') }] })}
        ${ui.field({ name: 'to', label: L('Send to', 'إرسال إلى'), type: 'select', full: true, options: [{ v: 'owner', l: L('Registered owner(s)', 'المالك/المالكون المسجّلون') }, { v: 'committee', l: L('Building committee', 'لجنة المبنى') }, { v: 'gis', l: L('GIS team (internal)', 'فريق نظم المعلومات (داخلي)') }] })}
        ${ui.field({ name: 'note', label: L('Note', 'ملاحظة'), type: 'textarea', full: true, required: true, placeholder: L('Describe what looks wrong and what evidence is needed.', 'صف ما يبدو خاطئاً والمستندات المطلوبة.') })}
      </div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Send request', 'إرسال الطلب'), { kind: 'primary', type: 'submit', icon: 'send' })}` });
  };
  B.submit.muCorrection = () => B.success({ title: L('Correction requested', 'تم طلب التصحيح'), text: L('The recipient will be notified in BENA and the record stays flagged until resolved.', 'سيتم إشعار المستلم في بينا وسيبقى السجل مؤشراً حتى المعالجة.'), ref: B.uid('CR') });
  B.act.muLink = (id) => {
    const b = D.building(id);
    B.modal({ title: L('Link to a sample municipal reference', 'ربط بمرجع بلدي نموذجي'), sub: `${b.id} · ${esc(tx(b.name))}`, form: 'muLinkGis',
      body: `<input type="hidden" name="id" value="${esc(id)}">${ui.callout(L('Linking keeps the BENA ID and attaches the external municipal reference. BENA is designed to connect to municipal systems — this demo uses sample references only.', 'يحافظ الربط على رقم بينا ويُرفق المرجع البلدي الخارجي. صُممت بينا للاتصال بالأنظمة البلدية — تستخدم هذه النسخة مراجع نموذجية فقط.'), 'mint', 'link')}
        <div class="form-grid" style="margin-top:14px">
        ${ui.field({ name: 'gis', label: L('Sample GIS ID', 'رقم GIS النموذجي'), required: true, value: `RM-GIS-${41000 + (hash(b.id) % 9000)}` })}
        ${ui.field({ name: 'ref', label: L('Sample municipal reference', 'المرجع البلدي النموذجي'), value: `RM/${b.district.slice(0, 2).toUpperCase()}/2026/${b.id.slice(-4)}` })}
        </div>`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Link record', 'ربط السجل'), { kind: 'primary', type: 'submit', icon: 'link' })}` });
  };
  B.submit.muLinkGis = (d) => {
    const b = D.building(d.id);
    if (b) { b.gis = d.gis || b.gis; b.ref = d.ref || b.ref; b.source = 'gis'; b.updated = '2026-11-25'; }
    B.refresh();
    B.success({ title: L('Record linked', 'تم ربط السجل'), text: L('The building now carries the sample municipal reference.', 'يحمل المبنى الآن المرجع البلدي النموذجي.'), ref: d.gis });
  };

  /* =================================================================
     1 · Municipal Overview
     ================================================================= */
  const reqLi = (q) => ui.li({ icon: RT[q.type].icon, tone: RT[q.type].tone, title: tx(q.title), sub: `${ui.idMono(q.id)} · ${tx(RT[q.type].short)} · ${B.ago(q.date)}`, end: ui.status(q.status), go: rgo(`request-${q.id}`) });

  function home() {
    crumbs([[L('Municipal Overview', 'نظرة عامة على البلدية')]]);
    const q = sampleQ();
    const cov = pct(C.gis, C.total);
    const lastM = C.trend[11], prevM = C.trend[10];
    const qs = (B.mu.queueStats && B.mu.queueStats()) || {};
    const hero = `<section class="mu-hero">
      <div>
        <div class="eyebrow">${L('Registered buildings · sample city', 'المباني المسجّلة · مدينة نموذجية')}</div>
        <div class="mu-big">${B.num(C.total)}<small>${L('in 8 districts', 'في 8 أحياء')}</small></div>
        <div class="mu-hsplit"><i style="width:${cov}%;background:var(--mint)"></i><i style="flex:1;background:#B9AAF0"></i></div>
        <div class="mu-split-l"><span><i style="background:var(--mint)"></i>${L('Linked to sample municipal ref.', 'مرتبطة بمرجع بلدي نموذجي')} ${B.pct(cov, 1)}</span><span><i style="background:#B9AAF0"></i>${L('Independent', 'مستقلة')} ${B.pct(100 - cov, 1)}</span></div>
      </div>
      <div class="mu-hstats">
        <div><span>${L('Linked', 'مرتبطة')}</span><b>${B.num(C.gis)}</b><small>${icon('arrowUp')}${L('+184 this month', '+184 هذا الشهر')}</small></div>
        <div><span>${L('Independent', 'مستقلة')}</span><b>${B.num(C.independent)}</b><small>${icon('arrowUp')}${L(`+${C.trendIndependent[11]} this month`, `+${C.trendIndependent[11]} هذا الشهر`)}</small></div>
        <div><span>${L('Pending', 'بانتظار التحقق')}</span><b>${B.num(C.pending)}</b><small style="color:#F6C77E">${icon('clock')}${L('42 over SLA', '42 تجاوزت المهلة')}</small></div>
        <div><span>${L('Units', 'الوحدات')}</span><b>${B.num(C.units)}</b><small>${icon('arrowUp')}${L('+1.8% this month', '+1.8% هذا الشهر')}</small></div>
        <div><span>${L('Quality score', 'مؤشر الجودة')}</span><b>${qs.score != null ? qs.score : '—'}<span style="display:inline;font-size:13px;color:var(--navy-ink)">/100</span></b><small>${icon('arrowUp')}${L('+2.1 pts this quarter', '+2.1 نقطة هذا الربع')}</small></div>
      </div>
    </section>`;

    const wqRow = (ic, tone, title, sub, n, go) => `<button data-go="${go}"><span class="li-icon ${tone}">${icon(ic)}</span><span style="min-width:0"><b class="t">${title}</b><small>${sub}</small></span><span class="n">${n}</span>${icon('chevR', 'flip')}</button>`;
    const queues = ui.card({
      title: L('Work queues', 'قوائم العمل'), sub: L('What needs your unit today', 'ما يحتاج وحدتك اليوم'),
      body: `<div class="mu-wq">
        ${wqRow('shieldCheck', 'warn', L('Building verification', 'التحقق من المباني'), L(`${qs.vOver || 0} over SLA · ${qs.vHigh || 0} high risk`, `${qs.vOver || 0} تجاوزت المهلة · ${qs.vHigh || 0} عالية المخاطر`), qs.vOpen || 0, rgo('verify'))}
        ${wqRow('inbox', 'mint', L('Registration requests', 'طلبات التسجيل'), L(`${REQ.filter((x) => x.status === 'new').length} not yet opened`, `${REQ.filter((x) => x.status === 'new').length} لم تُفتح بعد`), openCount(), rgo('requests'))}
        ${wqRow('edit', 'info', L('Correction requests', 'طلبات التصحيح'), L(`${qs.cFields || 0} field changes proposed`, `${qs.cFields || 0} تغييراً مقترحاً على الحقول`), qs.cOpen || 0, rgo('corrections'))}
        ${wqRow('link', 'navy', L('Matching candidates', 'مرشحو المطابقة'), L(`${qs.mHigh || 0} with confidence ≥ 85%`, `${qs.mHigh || 0} بثقة ≥ 85%`), qs.mOpen || 0, rgo('matching'))}
        ${wqRow('alert', 'violet', L('Data quality issues', 'مشكلات جودة البيانات'), L(`${q.dup} duplicates · ${q.noParcel} missing parcel`, `${q.dup} تكرار · ${q.noParcel} بلا قطعة`), q.dup + q.geom + q.noParcel + q.noUnits, rgo('quality'))}
      </div>`,
    });

    const trend = ui.card({
      title: L('Registration trend', 'اتجاه التسجيل'), sub: L('New registrations per month, last 12 months', 'التسجيلات الجديدة شهرياً خلال آخر 12 شهراً'),
      headExtra: `<span class="delta up">${icon('arrowUp')}${B.pct(((lastM - prevM) / prevM) * 100, 1)}</span>`,
      body: B.charts.line({ labels: months(), height: 214, series: [{ name: L('All registrations', 'جميع التسجيلات'), color: '#142B3B', values: C.trend, area: true }, { name: L('Independent submissions', 'التسجيلات المستقلة'), color: '#9B8AE0', values: C.trendIndependent, dashed: true }] }),
    });

    const covRows = D.districts.slice().sort(B.by((d) => d.gis / d.buildings, -1)).map((d) => {
      const g = pct(d.gis, d.buildings);
      return `<button class="mu-cov-row" data-act="muDistrict" data-arg="${d.id}">
        <div><b class="n">${tx(d.name)}</b><small>${B.num(d.buildings)} ${L('buildings', 'مبنى')} · ${B.num(d.units)} ${L('units', 'وحدة')}</small></div>
        <div class="mu-track"><i style="width:${g}%;background:var(--navy)"></i><i style="flex:1;background:#D9D1F7"></i></div>
        <span class="p">${B.pct(g, 1)}</span></button>`;
    }).join('');
    const coverage = ui.card({
      title: L('Coverage by district', 'التغطية حسب الحي'), sub: L('Share of buildings linked to a sample municipal reference — select a district to open it on the map', 'نسبة المباني المرتبطة بمرجع بلدي نموذجي — اختر حياً لفتحه على الخريطة'),
      link: { label: L('Analytics', 'التحليلات'), go: rgo('analytics') },
      body: `<div class="mu-cov">${covRows}</div>${B.charts.legend([{ name: L('Linked', 'مرتبطة'), color: '#142B3B' }, { name: L('Independent', 'مستقلة'), color: '#D9D1F7' }])}`,
    });
    const recent = ui.card({
      title: L('Recent registration requests', 'أحدث طلبات التسجيل'), sub: L(`${openCount()} awaiting review`, `${openCount()} بانتظار المراجعة`),
      link: { label: L('Open inbox', 'فتح الوارد'), go: rgo('requests') },
      body: ui.list(REQ.slice().sort(B.by('date', -1)).slice(0, 4).map(reqLi)),
    });
    const mini = ui.card({
      cls: 'pad-0',
      body: `<div style="position:relative">${B.map.render({ id: 'muni-mini', static: true, mode: 'verification', height: '230px', legend: false, badge: L('Verification status · sample area', 'حالة التحقق · منطقة نموذجية') })}
        <div style="position:absolute;inset-inline-end:12px;bottom:12px">${ui.btn(L('Open GIS Building Explorer', 'فتح مستكشف المباني الجغرافي'), { kind: 'dark', size: 'sm', icon: 'map', go: `${R}-explorer` })}</div></div>`,
    });

    return `${hdr({ title: L('Good morning, Maha', 'صباح الخير، مها'), sub: L('Municipal building registry at a glance — sample municipality with demonstration data. BENA is designed to connect to municipal systems.', 'سجل المباني البلدي في لمحة — بلدية نموذجية ببيانات توضيحية. صُممت بينا للاتصال بالأنظمة البلدية.'),
      actions: ui.btn(L('Reports', 'التقارير'), { icon: 'doc', go: rgo('reports') }) + ui.btn(L('GIS Building Explorer', 'مستكشف المباني الجغرافي'), { kind: 'primary', icon: 'map', go: `${R}-explorer` }) })}
      <div class="stack-lg">
        ${hero}
        <div class="grid g-main">${trend}${queues}</div>
        <div class="grid g-main">${coverage}<div class="stack">${mini}${recent}</div></div>
        ${ui.demoNote(tx(D.municipality.note) + ' ' + L('Figures, requests, staff and records shown are fictional.', 'الأرقام والطلبات والموظفون والسجلات المعروضة وهمية.'))}
      </div>`;
  }

  /* =================================================================
     2 · Building Registry
     ================================================================= */
  const DQ = { dup: T('Possible duplicates', 'سجلات مكررة محتملة'), geom: T('Geometry issues', 'مشكلات في المساقط'), noParcel: T('Parcel reference missing', 'مرجع القطعة مفقود'), noUnits: T('Unit count not confirmed', 'عدد الوحدات غير مؤكد'), outdated: T('Outdated records', 'سجلات قديمة'), any: T('Any quality flag', 'أي مؤشر جودة') };
  const optsType = () => [{ v: 'all', l: L('All categories', 'جميع الفئات') }].concat(Object.keys(D.types).map((k) => ({ v: k, l: D.types[k] })));
  const optsVer = () => [{ v: 'all', l: L('Any verification', 'أي حالة تحقق') }, { v: 'verified', l: B.statuses.verified }, { v: 'pendingVerification', l: B.statuses.pendingVerification }, { v: 'unverified', l: L('Unverified draft', 'مسودة غير موثّقة') }];
  const optsSrc = () => [{ v: 'all', l: L('Any source', 'أي مصدر') }, { v: 'gis', l: L('Municipal GIS (sample)', 'نظم المعلومات البلدية (نموذج)') }, { v: 'independent', l: L('Independent', 'مستقل') }];
  const optsDist = () => [{ v: 'all', l: L('All districts', 'جميع الأحياء') }].concat(D.districts.map((d) => ({ v: d.id, l: d.name })));
  const RG_VIEWS = {
    all: () => true,
    needs: (b) => b.verification !== 'verified',
    independent: (b) => b.source === 'independent',
    flagged: (b) => qf(b).any,
    recent: (b) => upd(b) >= '2026-11-01',
  };

  B.act.muRgQv = (id) => { B.vs['rg:qv'] = B.vs['rg:qv'] === id ? '' : id; B.refresh(); };
  B.act.muBulkVerify = (tid) => {
    const ids = selOf(tid).filter((id) => { const b = D.building(id); return b && b.verification !== 'verified'; });
    if (!ids.length) { B.toast(L('All selected records are already verified', 'جميع السجلات المحددة موثّقة مسبقاً'), 'info'); return; }
    B.confirm({ title: L(`Verify ${ids.length} building records?`, `توثيق ${ids.length} سجلات مبانٍ؟`), text: L('Each record will be marked verified by the GIS & Building Registry Unit (demo, in-memory only).', 'سيتم توثيق كل سجل من قبل وحدة نظم المعلومات وسجل المباني (تجريبي، في الذاكرة فقط).'), ok: L('Verify records', 'توثيق السجلات'),
      onOk: () => { ids.forEach((id) => { const b = D.building(id); b.verification = 'verified'; b.status = 'registered'; b.updated = '2026-11-25'; }); B.vs[tid + ':sel'] = []; B.closeModal(true); B.refresh(); B.toast(L(`${ids.length} records verified (demo)`, `تم توثيق ${ids.length} سجلات (تجريبي)`)); } });
  };
  B.act.muBulkField = (tid) => { const n = selOf(tid).length; B.vs[tid + ':sel'] = []; B.refresh(); B.toast(L(`${n} records queued for field verification (demo)`, `أُدرج ${n} سجلاً للتحقق الميداني (تجريبي)`)); };

  function registry() {
    crumbs([[L('Building Registry', 'سجل المباني')]]);
    const q = B.get('rg:q', ''), t = B.get('rg:type', 'all'), v = B.get('rg:ver', 'all'), s = B.get('rg:src', 'all'), d = B.get('rg:dist', 'all'), dq = B.get('rg:dq', ''), view = B.get('rg:view', 'all');
    const base = D.buildings.filter((b) => (t === 'all' || b.type === t) && (v === 'all' || b.verification === v) && (s === 'all' || b.source === s) && (d === 'all' || b.district === d) && (!dq || qf(b)[dq])
      && B.match(q, b.id, b.gis, b.ref, b.name, b.address, D.district(b.district).name));
    const rows = base.filter(RG_VIEWS[view] || RG_VIEWS.all);
    let qv = B.get('rg:qv', '');
    const qb = qv ? D.building(qv) : null;
    if (!qb) qv = '';
    const reset = { reset: 'rg:page' };
    const table = dt({
      id: 'rg', rows, pageSize: 18, defaultSort: '-updated', select: true, active: qv, maxH: 'calc(100dvh - 330px)',
      rowAct: (r) => ({ act: 'muRgQv', arg: r.id }),
      bulk: () => `${ui.btn(L('Verify', 'توثيق'), { kind: 'primary', icon: 'shieldCheck', act: 'muBulkVerify', arg: 'rg' })}${ui.btn(L('Queue field check', 'إدراج للتحقق الميداني'), { icon: 'pin', act: 'muBulkField', arg: 'rg' })}${ui.btn(L('Export selection', 'تصدير المحدد'), { icon: 'download', act: 'soon', arg: L('Export', 'التصدير') })}`,
      cols: [
        { key: 'id', label: L('BENA ID', 'رقم بينا'), sort: true, w: '128px', render: (r) => ui.idMono(r.id), m: 'sub' },
        { key: 'name', label: L('Building', 'المبنى'), sort: (r) => tx(r.name), m: 'title', mRender: (r) => esc(tx(r.name)),
          render: (r) => `<div class="mu-cell"><span class="mu-ti ${r.source === 'independent' ? 'ind' : ''}">${icon(typeIcon(r.type))}</span><div><b>${esc(tx(r.name))}</b><small>${dName(r.district)} · ${D.typeLabel(r.type)}</small></div></div>` },
        { key: 'ref', label: L('Sample municipal ref.', 'المرجع البلدي النموذجي'), sort: (r) => r.ref || '~', render: refCell, hide: !!qv },
        { key: 'units', label: L('Units', 'الوحدات'), sort: true, align: 'end', w: '72px', render: (r) => units(r.units), m: 'meta', hide: !!qv },
        { key: 'verification', label: L('Verification', 'التحقق'), sort: true, render: (r) => ui.status(r.verification), m: 'end' },
        { key: 'flags', label: L('Quality', 'الجودة'), sort: (r) => { const f = qf(r); return (f.dup ? 4 : 0) + (f.geom ? 3 : 0) + (f.noParcel ? 2 : 0) + (f.noUnits ? 1 : 0); }, render: (r) => flagChips(r, qv ? 1 : 2), hide: !!qv && window.innerWidth < 1500 },
        { key: 'updated', label: L('Updated', 'التحديث'), sort: true, w: '96px', render: (r) => `<span class="nowrap">${B.dateShort(upd(r))}</span>`, m: 'meta' },
      ],
    });
    const vc = (k) => base.filter(RG_VIEWS[k]).length;
    const pane = qb ? (() => { const v2 = quickView(qb, { close: 'muRgQvX', ctx: 'registry' }); return `<aside class="card mu-pane">${v2.head}<div class="mu-pane-b">${v2.body}</div><div class="mu-pane-f" style="display:block">${v2.acts}</div></aside>`; })() : '';
    return `${hdr({ title: L('Building Registry', 'سجل المباني'), sub: L(`${B.num(D.buildings.length)} records in the mapped sample area · ${B.num(C.total)} city-wide (sample)`, `${B.num(D.buildings.length)} سجلاً في المنطقة النموذجية · ${B.num(C.total)} على مستوى المدينة (نموذج)`),
      actions: ui.btn(L('Export CSV', 'تصدير CSV'), { icon: 'download', act: 'soon', arg: L('CSV export', 'تصدير CSV') }) + ui.btn(L('Open in GIS', 'فتح في الخريطة'), { icon: 'map', go: `${R}-explorer` }) + ui.btn(L('Register building', 'تسجيل مبنى'), { kind: 'primary', icon: 'plus', act: 'muNewBuilding' }) })}
      ${views('rg:view', [{ id: 'all', label: L('All records', 'جميع السجلات'), count: vc('all') }, { id: 'needs', label: L('Needs verification', 'بحاجة للتحقق'), count: vc('needs') }, { id: 'independent', label: L('Independent', 'مستقلة'), count: vc('independent') }, { id: 'flagged', label: L('Quality flags', 'مؤشرات الجودة'), count: vc('flagged') }, { id: 'recent', label: L('Updated this month', 'حُدّثت هذا الشهر'), count: vc('recent') }], view)}
      <div class="mu-toolrow"><div class="mu-fbar" style="flex:1">
        ${ui.search('rg:q', L('Search BENA ID, sample ref., street or area', 'ابحث برقم بينا أو المرجع النموذجي أو الشارع أو المنطقة'), reset)}
        ${ui.select('rg:type', optsType(), { def: 'all', label: L('Category', 'الفئة'), ...reset })}
        ${ui.select('rg:ver', optsVer(), { def: 'all', label: L('Verification', 'التحقق'), ...reset })}
        ${ui.select('rg:src', optsSrc(), { def: 'all', label: L('Source', 'المصدر'), ...reset })}
        ${ui.select('rg:dist', optsDist(), { def: 'all', label: L('District', 'الحي'), ...reset })}
        ${dq ? `<span class="mu-fl" style="height:28px;padding:0 6px 0 10px;font-size:12px">${icon('filter')}${tx(DQ[dq])}<button data-act="set" data-arg="rg:dq=" aria-label="${L('Remove filter', 'إزالة التصفية')}" style="margin-inline-start:4px;display:grid">${icon('x')}</button></span>` : ''}
        <span class="mu-count">${L(`${B.num(rows.length)} buildings`, `${B.num(rows.length)} مبنى`)}</span>
      </div></div>
      ${qb ? `<div class="mu-split">${table}${pane}</div>` : table}`;
  }
  B.act.muRgQvX = () => { B.vs['rg:qv'] = ''; B.refresh(); };
  B.act.muNewBuilding = () => B.modal({
    title: L('Register a building', 'تسجيل مبنى'), sub: L('Creates a municipal record and a BENA ID (demo).', 'ينشئ سجلاً بلدياً ورقم بينا (تجريبي).'), form: 'muNewB', size: 'md',
    body: `<div class="form-grid">
      ${ui.field({ name: 'name', label: L('Building name or number', 'اسم المبنى أو رقمه'), required: true, full: true, placeholder: L('e.g. 32 Park St.', 'مثال: 32 شارع الحديقة') })}
      ${ui.field({ name: 'district', label: L('District', 'الحي'), type: 'select', options: D.districts.map((d) => ({ v: d.id, l: d.name })) })}
      ${ui.field({ name: 'type', label: L('Type', 'النوع'), type: 'select', options: Object.keys(D.types).map((k) => ({ v: k, l: D.types[k] })) })}
      ${ui.field({ name: 'floors', label: L('Floors', 'الطوابق'), type: 'number', min: 1, value: '4' })}
      ${ui.field({ name: 'units', label: L('Units', 'الوحدات'), type: 'number', min: 1, value: '8' })}
      ${ui.field({ name: 'basin', label: L('Basin no.', 'رقم الحوض'), type: 'number', min: 1 })}
      ${ui.field({ name: 'parcel', label: L('Parcel no.', 'رقم القطعة'), type: 'number', min: 1 })}
      ${ui.field({ name: 'docs', label: L('Documents', 'المستندات'), type: 'file', full: true })}
    </div>`,
    foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(L('Create record', 'إنشاء السجل'), { kind: 'primary', type: 'submit', icon: 'check' })}`,
  });
  B.submit.muNewB = () => B.success({ title: L('Building registered', 'تم تسجيل المبنى'), text: L('A draft record was created and queued for footprint capture.', 'تم إنشاء سجل مسودة وإدراجه لالتقاط المسقط.'), ref: 'BN-RAM-' + String(Date.now()).slice(-5) });

  /* =================================================================
     3 · GIS Building Explorer — full-width GIS workspace
     ================================================================= */
  const M_PER_UNIT = 2.75; // simulated ground distance per map unit
  const gxFilter = () => {
    const q = B.get('gx:q', '').trim(), t = B.get('gx:type', 'all'), v = B.get('gx:ver', 'all'), s = B.get('gx:src', 'all'), d = B.get('gx:dist', 'all'), fl = B.get('gx:flag', false);
    const active = !!q || t !== 'all' || v !== 'all' || s !== 'all' || d !== 'all' || fl;
    const list = D.buildings.filter((b) => (t === 'all' || b.type === t) && (v === 'all' || b.verification === v) && (s === 'all' || b.source === s) && (d === 'all' || b.district === d) && (!fl || qf(b).any)
      && (!q || B.match(q, b.id, b.gis, b.ref, b.name, b.address, D.district(b.district).name)));
    return { q, t, v, s, d, fl, active, list, nf: [t, v, s, d].filter((x) => x !== 'all').length + (fl ? 1 : 0) };
  };
  const LY = [
    ['fp', 'footprints', true], ['pc', 'parcels', false], ['st', 'streets', true], ['sl', 'streetLabels', true], ['dl', 'districtLabels', true], ['pk', 'parks', true], ['tr', 'terrain', true], ['qf', 'flags', false], ['rq', 'requests', false],
  ];
  const ly = (k) => B.get('gx:l:' + k, LY.find((x) => x[0] === k)[2]);

  B.act.muSelect = (id) => { B.vs['gx:sel'] = B.vs['gx:sel'] === id ? '' : id; B.refresh(); };
  /** Centre a building in the part of the map not covered by the feature panel. */
  const focusVisible = (id) => { B.map.focus(MAPID, id, 400); const v = B.map.view(MAPID); if (v && window.innerWidth > 767) v.x += (B.isAr() ? -1 : 1) * v.w * 0.2; };
  B.act.muPick = (id) => { focusVisible(id); B.vs['gx:sel'] = id; B.refresh(); };
  B.act.muClear = () => { B.vs['gx:sel'] = ''; B.refresh(); };
  B.act.muFilt = (arg) => { const [k, v] = arg.split('='); B.vs[k] = B.vs[k] === v ? 'all' : v; B.refresh(); };
  B.act.muResetF = () => { ['gx:type', 'gx:ver', 'gx:src', 'gx:dist'].forEach((k) => { B.vs[k] = 'all'; }); B.vs['gx:q'] = ''; B.vs['gx:flag'] = false; B.vs['gx:_ld'] = 'all'; B.map.setView(MAPID, null); B.refresh(); };
  B.act.muGxTab = (t) => { if (B.get('gx:tab', 'search') === t && !B.get('gx:pc', false)) B.vs['gx:pc'] = true; else { B.vs['gx:tab'] = t; B.vs['gx:pc'] = false; } B.refresh(); };
  B.act.muGxTool = (t) => { B.vs['gx:tool'] = B.get('gx:tool', 'select') === t ? 'select' : t; if (B.vs['gx:tool'] !== 'measure') B.vs['gx:meas'] = []; B.refresh(); };
  B.act.muGxReset = () => { B.act.mapZoom(`${MAPID}:reset`); };
  B.act.muGxZoomSel = () => { const s = B.get('gx:sel', ''); if (!s) { B.toast(L('Select a building first', 'اختر مبنى أولاً'), 'info'); return; } B.act.mapZoom(`${MAPID}:sel:${s}`); };
  B.act.muMeasNoop = () => {};
  B.act.muMeasUndo = () => { B.vs['gx:meas'] = B.get('gx:meas', []).slice(0, -1); B.refresh(); };
  B.act.muMeasClear = () => { B.vs['gx:meas'] = []; B.refresh(); };
  B.act.muGxBm = (id) => { if (id === 'all') { B.vs['gx:dist'] = 'all'; B.vs['gx:_ld'] = 'all'; B.map.setView(MAPID, null); } else { B.vs['gx:dist'] = id; B.vs['gx:_ld'] = id; B.map.setView(MAPID, districtView(id)); } B.vs['gx:sel'] = ''; B.refresh(); };

  const gxBreakdown = (list, mode) => {
    const n = list.length || 1;
    let rows;
    if (mode === 'verification') rows = [['verified', L('Verified', 'موثّق'), 'gx:ver'], ['pendingVerification', L('Pending verification', 'بانتظار التحقق'), 'gx:ver'], ['unverified', L('Unverified draft', 'مسودة غير موثّقة'), 'gx:ver']].map(([k, l, f]) => ({ k, l, f, c: B.map.colors.verification[k], n: list.filter((b) => b.verification === k).length }));
    else if (mode === 'source') rows = [['gis', L('Municipal GIS record (sample)', 'سجل نظم المعلومات البلدية (نموذج)'), 'gx:src'], ['independent', L('Independently submitted', 'مُسجّل بشكل مستقل'), 'gx:src']].map(([k, l, f]) => ({ k, l, f, c: B.map.colors.source[k], n: list.filter((b) => b.source === k).length }));
    else rows = Object.keys(D.types).map((k) => ({ k, l: tx(D.types[k]), f: 'gx:type', c: B.map.colors.type[k], n: list.filter((b) => b.type === k).length })).sort(B.by('n', -1));
    return `<div class="mu-leg">${rows.map((r) => `<button class="${B.get(r.f, 'all') === r.k ? 'on' : ''}" data-act="muFilt" data-arg="${r.f}=${r.k}">${sw(r.c)}<span class="truncate">${r.l}</span><b>${B.num(r.n)}</b><span class="bar"><i style="width:${pct(r.n, n)}%;background:${r.c}"></i></span></button>`).join('')}</div>`;
  };
  const resBtn = (b, mode, sel) => `<button class="${sel === b.id ? 'on' : ''}" data-act="muPick" data-arg="${b.id}"><span class="lead" style="background:${B.map.fill(b, mode)}">${icon(typeIcon(b.type))}</span><span style="min-width:0"><b>${esc(tx(b.name))}</b><small><bdi>${b.id}</bdi> · ${dName(b.district)}</small></span><span class="st" style="background:${B.map.colors.verification[b.verification]}" title="${esc(ui.statusLabel(b.verification))}"></span></button>`;

  /** Strip label layers the core map draws together (street labels vs district labels). */
  const stripLabels = (html, sl, dl) => {
    let h = html;
    if (!dl) h = h.replace(/<text class="map-label"[^>]*>[^<]*<\/text>/g, '');
    if (!sl) h = h.replace(/<text class="street-label"[^>]*><textPath[^>]*>[^<]*<\/textPath><\/text>/g, '');
    return h;
  };
  const measOverlay = (pts, w) => {
    if (!pts.length) return '';
    const s = Math.max(0.5, Math.min(1.6, w / 600));
    let total = 0;
    const segs = pts.slice(1).map((p, i) => { const a = pts[i]; const d = Math.hypot(p[0] - a[0], p[1] - a[1]) * M_PER_UNIT; total += d; const mx = (a[0] + p[0]) / 2, my = (a[1] + p[1]) / 2; const lab = `${B.num1(d)} m`; return `<g transform="translate(${mx} ${my}) scale(${s})"><rect x="${-(lab.length * 3.3 + 6)}" y="-17" width="${lab.length * 6.6 + 12}" height="15" rx="4" fill="#142B3B"/><text text-anchor="middle" y="-6.5" font-size="9.5" font-weight="700" fill="#fff" font-family="Inter, sans-serif">${lab}</text></g>`; }).join('');
    return `<g pointer-events="none"><polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#142B3B" stroke-width="${2 * s}" stroke-dasharray="${5 * s} ${3 * s}"/>${pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="${3.6 * s}" fill="#36D6A0" stroke="#142B3B" stroke-width="${1.4 * s}"/>`).join('')}${segs}</g>`;
  };
  const measTotal = (pts) => pts.slice(1).reduce((t, p, i) => t + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]) * M_PER_UNIT, 0);

  function explorer() {
    crumbs([[L('GIS Building Explorer', 'مستكشف المباني الجغرافي')]]);
    B.title(L('GIS Building Explorer', 'مستكشف المباني الجغرافي'));
    const mode = B.get('gx:mode', 'type'), tool = B.get('gx:tool', 'select'), tab = B.get('gx:tab', 'search'), pc = B.get('gx:pc', false);
    const f = gxFilter();
    if (f.d !== B.get('gx:_ld', 'all')) { B.vs['gx:_ld'] = f.d; B.map.setView(MAPID, f.d === 'all' ? null : districtView(f.d)); }
    if (f.q !== B.get('gx:_lq', '')) {
      B.vs['gx:_lq'] = f.q;
      if (f.q && f.list.length && f.list.length <= 80) {
        const xs = [], ys = [];
        f.list.forEach((b) => b.poly.forEach((p) => { xs.push(p[0]); ys.push(p[1]); }));
        const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
        const w = Math.max(260, (x1 - x0) * 1.4, ((y1 - y0) * 1.4) / 0.7);
        B.map.setView(MAPID, { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - (w * 0.7) / 2, w, h: w * 0.7 });
      }
    }
    let sel = B.get('gx:sel', '');
    const sb = sel ? D.building(sel) : null;
    if (!sb) sel = '';
    const vis = f.active ? new Set(f.list.map((b) => b.id)) : null;
    const markers = [];
    if (ly('qf')) (f.active ? f.list : D.buildings).filter((b) => { const q = qf(b); return q.dup || q.geom; }).slice(0, 60).forEach((b) => markers.push({ id: b.id, tone: 'warn' }));
    if (ly('rq')) REQ.filter((x) => OPEN.includes(x.status)).forEach((x) => markers.push({ id: x.building, tone: 'navy', label: x.id.slice(-4) }));
    const meas = tool === 'measure' ? B.get('gx:meas', []) : [];
    const view = B.map.view(MAPID) || { w: 1000 };
    let map = B.map.render({ id: MAPID, mode, visible: vis, selected: sel || null, onSelect: tool === 'measure' ? 'muMeasNoop' : 'muSelect', legend: false, badge: false, height: '100%',
      layers: { footprints: ly('fp'), parcels: ly('pc'), streets: ly('st'), labels: ly('sl') || ly('dl'), parks: ly('pk'), terrain: ly('tr') }, markers });
    map = stripLabels(map, ly('st') && ly('sl'), ly('dl'));
    if (meas.length) map = map.replace('</svg>', measOverlay(meas, view.w) + '</svg>');

    /* left panel content */
    const modeLbl = mode === 'type' ? L('Building type', 'نوع المبنى') : mode === 'source' ? L('Data source', 'مصدر البيانات') : L('Verification status', 'حالة التحقق');
    const list = f.active ? f.list : D.keyBuildings;
    const panels = {
      search: [L('Search', 'البحث'), `
        ${ui.search('gx:q', L('ID, ref., street or area', 'الرقم أو المرجع أو الشارع أو المنطقة'))}
        <div class="mu-gsum"><b>${B.num(f.active ? f.list.length : D.buildings.length)}</b><span>${f.active ? L(`of ${B.num(D.buildings.length)} footprints match`, `من ${B.num(D.buildings.length)} مسقطاً مطابقاً`) : L('footprints in the sample area', 'مسقطاً في المنطقة النموذجية')}</span></div>
        ${f.active ? `<button class="btn btn-text" style="padding:0;height:24px;font-size:12.5px" data-act="muResetF">${icon('x')}<span>${L('Clear search & filters', 'مسح البحث والتصفية')}</span></button>` : `<p class="xs faint">${L('Try “BN-RAM-00142”, “RM/MA”, “Rukab” or “Old City”.', 'جرّب «BN-RAM-00142» أو «RM/MA» أو «ركب» أو «البلدة القديمة».')}</p>`}
        <span class="mu-glab">${f.active ? L('Matches', 'النتائج') : L('Key buildings', 'مبانٍ رئيسية')}</span>
        ${list.length ? `<div class="mu-gres">${list.slice(0, 30).map((b) => resBtn(b, mode, sel)).join('')}</div>${list.length > 30 ? `<p class="xs faint" style="padding-top:6px">${L(`Showing 30 of ${B.num(list.length)} — refine to narrow down.`, `عرض 30 من ${B.num(list.length)} — حسّن البحث للتضييق.`)}</p>` : ''}` : ui.empty({ icon: 'search', title: L('No buildings match', 'لا توجد مبانٍ مطابقة'), text: L('Try another ID, street or district.', 'جرّب رقماً أو شارعاً أو حياً آخر.') })}
        <span class="mu-glab">${L('Zoom to district', 'التكبير إلى حي')}</span>
        <div class="mu-bm"><button class="${f.d === 'all' ? 'on' : ''}" data-act="muGxBm" data-arg="all">${L('Full extent', 'كامل النطاق')}</button>${D.districts.map((d) => `<button class="${f.d === d.id ? 'on' : ''}" data-act="muGxBm" data-arg="${d.id}">${tx(d.name)}</button>`).join('')}</div>`],
      filter: [L('Filters', 'التصفية'), `
        <span class="mu-glab" style="margin-top:0">${L('Category', 'الفئة')}</span>${ui.select('gx:type', optsType(), { def: 'all', label: L('Category', 'الفئة') })}
        <span class="mu-glab">${L('Verification', 'التحقق')}</span>${ui.select('gx:ver', optsVer(), { def: 'all', label: L('Verification', 'التحقق') })}
        <span class="mu-glab">${L('Data source', 'مصدر البيانات')}</span>${ui.select('gx:src', optsSrc(), { def: 'all', label: L('Data source', 'مصدر البيانات') })}
        <span class="mu-glab">${L('District', 'الحي')}</span>${ui.select('gx:dist', optsDist(), { def: 'all', label: L('District', 'الحي') })}
        <div class="mu-lyr" style="margin-top:10px"><label><span>${icon('alert')}</span><span>${L('Only records with quality flags', 'السجلات ذات مؤشرات الجودة فقط')}<small>${L('Duplicates, geometry, parcel, units', 'تكرار، مسقط، قطعة، وحدات')}</small></span><span class="switch"><input type="checkbox" data-model="gx:flag" ${f.fl ? 'checked' : ''}><i></i></span></label></div>
        <div class="mu-gsum"><b>${B.num(f.list.length)}</b><span>${L('features match', 'معلماً مطابقاً')}</span></div>
        ${ui.btn(L('Reset all filters', 'إعادة ضبط التصفية'), { icon: 'refresh', act: 'muResetF', size: 'sm', block: true })}`],
      layers: [L('Layers', 'الطبقات'), `
        <span class="mu-glab" style="margin-top:0">${L('Colour footprints by', 'تلوين المساقط حسب')}</span>
        ${ui.seg('gx:mode', [{ id: 'type', label: L('Type', 'النوع') }, { id: 'verification', label: L('Verification', 'التحقق') }, { id: 'source', label: L('Source', 'المصدر') }], mode)}
        <span class="mu-glab">${L('Operational layers', 'الطبقات التشغيلية')}</span>
        <div class="mu-lyr">${[
          ['fp', `<span class="mu-lsym" style="background:#C5D5E0;border:1px solid rgba(20,43,59,.35)"></span>`, L('Building footprints', 'مساقط المباني'), L(`${B.num(D.buildings.length)} features · sample`, `${B.num(D.buildings.length)} معلماً · نموذج`)],
          ['pc', `<span class="mu-lsym" style="border:1.5px dashed #A9B9B2"></span>`, L('Parcel boundaries', 'حدود القطع'), L('Demo geometry — not cadastral data', 'هندسة توضيحية — ليست بيانات مساحية')],
          ['qf', `<span class="mu-lsym" style="background:radial-gradient(circle,#E9A23B 45%,transparent 50%)"></span>`, L('Quality flags', 'مؤشرات الجودة'), L('Duplicate & geometry issues', 'التكرار ومشكلات المساقط')],
          ['rq', `<span class="mu-lsym" style="background:radial-gradient(circle,#142B3B 45%,transparent 50%)"></span>`, L('Open requests', 'الطلبات المفتوحة'), L(`${openCount()} registration requests`, `${openCount()} طلبات تسجيل`)],
        ].map(([k, s, l, d]) => `<label>${s}<span>${l}<small>${d}</small></span><span class="switch"><input type="checkbox" data-model="gx:l:${k}" ${ly(k) ? 'checked' : ''}><i></i></span></label>`).join('')}</div>
        <span class="mu-glab">${L('Basemap', 'الخريطة الأساسية')}</span>
        <div class="mu-lyr">${[
          ['st', `<span class="mu-lsym" style="background:#fff;border:2px solid #D3DCD8"></span>`, L('Streets', 'الشوارع')],
          ['sl', `<span class="mu-lsym" style="display:grid;place-items:center;font-size:9px;font-weight:700;color:#55667A">Aa</span>`, L('Street labels', 'أسماء الشوارع')],
          ['dl', `<span class="mu-lsym" style="display:grid;place-items:center;font-size:9px;font-weight:800;color:#8A99A8;letter-spacing:.1em">AB</span>`, L('District labels', 'أسماء الأحياء')],
          ['pk', `<span class="mu-lsym" style="background:#D9EAD9;border:1px solid #C7DDC8"></span>`, L('Parks & green areas', 'الحدائق والمساحات الخضراء')],
          ['tr', `<span class="mu-lsym" style="background:repeating-radial-gradient(circle at 30% 50%,#fff 0 2px,#DCE5E0 2px 3px)"></span>`, L('Terrain contours', 'خطوط الكنتور')],
        ].map(([k, s, l]) => `<label>${s}<span>${l}</span><span class="switch"><input type="checkbox" data-model="gx:l:${k}" ${ly(k) ? 'checked' : ''}><i></i></span></label>`).join('')}</div>`],
      legend: [L('Legend', 'مفتاح الخريطة'), `
        <span class="mu-glab" style="margin-top:0">${modeLbl} · ${L('click to filter', 'انقر للتصفية')}</span>
        ${gxBreakdown(f.active ? f.list : D.buildings, mode)}
        <span class="mu-glab">${L('Symbols', 'الرموز')}</span>
        <div class="mu-leg">
          <div><span class="mu-lsym" style="width:14px;background:#fff;border:1.5px dashed #6E56CF"></span><span>${L('Independently submitted (verification view)', 'مُسجّل بشكل مستقل (عرض التحقق)')}</span><span></span></div>
          <div><span class="mu-lsym" style="width:14px;border:1.5px solid #0B8A60;background:rgba(54,214,160,.1)"></span><span>${L('Selected parcel', 'القطعة المحددة')}</span><span></span></div>
          <div><span class="mu-lsym" style="width:14px;background:radial-gradient(circle,#E9A23B 45%,transparent 50%)"></span><span>${L('Quality flag', 'مؤشر جودة')}</span><span></span></div>
          <div><span class="mu-lsym" style="width:14px;background:radial-gradient(circle,#142B3B 45%,transparent 50%)"></span><span>${L('Open request', 'طلب مفتوح')}</span><span></span></div>
        </div>
        <span class="mu-glab">${L('Data provenance', 'مصدر البيانات')}</span>
        ${ui.provLegend()}
        <p class="xs faint" style="margin-top:10px">${L('Simulated municipal GIS for a sample area. Not connected to any municipal server.', 'نظم معلومات بلدية محاكاة لمنطقة نموذجية. غير متصلة بأي خادم بلدي.')}</p>`],
    };
    const cur = panels[tab] ? tab : 'search';
    const railBtn = (id, ic, label, badge) => `<button class="${cur === id && !pc ? 'on' : ''}" data-act="muGxTab" data-arg="${id}" aria-label="${esc(label)}">${icon(ic)}${badge ? `<i>${badge}</i>` : ''}<span class="tip">${label}</span></button>`;
    const rail = `<nav class="mu-rail" aria-label="${L('GIS tools', 'أدوات الخريطة')}">
      ${railBtn('search', 'search', L('Search', 'البحث'), f.q ? '•' : '')}
      ${railBtn('filter', 'filter', L('Filters', 'التصفية'), f.nf || '')}
      ${railBtn('layers', 'layers', L('Layers', 'الطبقات'), '')}
      ${railBtn('legend', 'list', L('Legend', 'مفتاح الخريطة'), '')}
      <span class="sp"></span>
      <button class="mu-rail-col" data-act="toggle" data-arg="gx:pc" aria-label="${esc(pc ? L('Expand panel', 'توسيع اللوحة') : L('Collapse panel', 'طي اللوحة'))}">${icon(pc ? 'chevR' : 'chevL', 'flip')}<span class="tip">${pc ? L('Expand panel', 'توسيع اللوحة') : L('Collapse panel', 'طي اللوحة')}</span></button>
    </nav>`;
    const gpanel = `<aside class="mu-gpanel"><div class="mu-gp-h"><b>${panels[cur][0]}</b><button class="icon-btn mu-d-only" data-act="toggle" data-arg="gx:pc" aria-label="${L('Collapse panel', 'طي اللوحة')}">${icon('chevL', 'flip')}</button></div><div class="mu-gp-b">${panels[cur][1]}</div></aside>`;

    const tbtn = (ic, label, attrs, on) => `<button class="${on ? 'on' : ''}" ${attrs} aria-label="${esc(label)}">${icon(ic)}<span class="tip">${label}</span></button>`;
    const tools = `<div class="mu-gtools">
      <div class="mu-gtg">${tbtn('target', L('Select', 'تحديد'), `data-act="muGxTool" data-arg="select"`, tool === 'select')}${tbtn('ruler', L('Measure distance (simulated)', 'قياس المسافة (محاكاة)'), `data-act="muGxTool" data-arg="measure"`, tool === 'measure')}</div>
      <div class="mu-gtg">${tbtn('plus', L('Zoom in', 'تكبير'), `data-act="mapZoom" data-arg="${MAPID}:in"`)}${tbtn('minus', L('Zoom out', 'تصغير'), `data-act="mapZoom" data-arg="${MAPID}:out"`)}${tbtn('maximize', L('Full extent', 'كامل النطاق'), `data-act="muGxReset"`)}${tbtn('locate', L('Zoom to selection', 'التكبير إلى المحدد'), `data-act="muGxZoomSel"`)}</div>
      <div class="mu-gtg">${tbtn('download', L('Export map view', 'تصدير عرض الخريطة'), `data-act="soon" data-arg="${esc(L('Map export', 'تصدير الخريطة'))}"`)}${tbtn('share', L('Share view link', 'مشاركة رابط العرض'), `data-act="soon" data-arg="${esc(L('Sharing a map view', 'مشاركة عرض الخريطة'))}"`)}</div>
    </div>`;
    const measCard = tool === 'measure' ? `<div class="mu-meas"><span class="xs" style="color:var(--navy-ink)">${L('Measure distance · simulated', 'قياس المسافة · محاكاة')}</span><b>${meas.length > 1 ? `${B.num1(measTotal(meas))} m` : '—'}</b><span class="xs" style="color:var(--navy-ink)">${meas.length ? L(`${meas.length} point(s) — click to add more`, `${meas.length} نقطة — انقر للإضافة`) : L('Click on the map to add points', 'انقر على الخريطة لإضافة نقاط')}</span>
      <div class="row-sm" style="margin-top:8px;gap:14px"><button data-act="muMeasUndo">${L('Undo', 'تراجع')}</button><button data-act="muMeasClear">${L('Clear', 'مسح')}</button><button data-act="muGxTool" data-arg="measure">${L('Done', 'تم')}</button></div></div>` : '';
    const mini = `<div class="mu-gmini"><b>${modeLbl}</b>${B.map.legendItems(mode).slice(0, 7).map(([c, l]) => `<span><i class="${c === 'dash' ? 'dash' : ''}" style="background:${c === 'dash' ? '' : c}"></i>${l}</span>`).join('')}</div>`;
    let feat = '';
    if (sb) { const qv = quickView(sb, { close: 'muClear', ctx: 'gis' }); feat = `<aside class="mu-feat">${qv.head}<div class="mu-feat-b">${qv.body}</div><div class="mu-feat-f">${qv.acts}</div></aside>`; }
    const hint = !sb && tool === 'select' ? `<div class="mu-ghint">${icon('target')}${L('Click a footprint to inspect it', 'انقر على مسقط لعرض تفاصيله')}</div>` : '';
    const statusBar = `<div class="mu-gsb">
      <span>${icon('locate')}<span class="mono" id="gx-xy">E —  N —</span></span>
      <span class="hide-m">${icon('ruler')}<span class="mono" id="gx-scale">1:—</span><i class="mu-sbar" id="gx-sbar"></i><span class="mono" id="gx-sbl">—</span></span>
      <span class="hide-m">${icon('layers')}${L('Zoom', 'التكبير')} <span class="mono" id="gx-zoom">—</span></span>
      <span class="sp"></span>
      <span class="hide-m">${L(`${B.num(vis ? vis.size : D.buildings.length)} of ${B.num(D.buildings.length)} features`, `${B.num(vis ? vis.size : D.buildings.length)} من ${B.num(D.buildings.length)} معلماً`)}</span>
      ${sb ? `<span>${L('Selected', 'المحدد')}: <span class="mono">${esc(sb.id)}</span></span>` : ''}
      <span class="hide-m faint">${L('Simulated grid coordinates', 'إحداثيات شبكية محاكاة')}</span>
    </div>`;

    B.afterRender(bindGis);
    return `<div class="mu-gisw">
      <div class="mu-gbar">
        <span class="li-icon navy" style="width:32px;height:32px;border-radius:9px">${icon('map')}</span>
        <div class="ttl grow"><h1>${L('GIS Building Explorer', 'مستكشف المباني الجغرافي')}</h1><span class="sub">${orgName()} · ${L('footprints and independently submitted records', 'المساقط والسجلات المُقدّمة بشكل مستقل')} ${sampleTag(L('Sample data', 'بيانات نموذجية'))}</span></div>
        <span class="lbl mu-d-only">${L('Colour by', 'التلوين حسب')}</span>
        ${ui.seg('gx:mode', [{ id: 'type', label: L('Type', 'النوع'), icon: 'layers' }, { id: 'verification', label: L('Verification', 'التحقق'), icon: 'shieldCheck' }, { id: 'source', label: L('Source', 'المصدر'), icon: 'database' }], mode)}
        <span class="mu-d-only">${ui.btn(L('Registry', 'السجل'), { icon: 'list', go: rgo('registry') })}</span>
      </div>
      <div class="mu-gbody ${pc ? 'pc' : ''}">
        ${rail}${gpanel}
        <div class="mu-gmap ${tool === 'measure' ? 'measure' : ''}">
          <div class="mu-gm">${map}${tools}${measCard}<div class="mu-gbadge">${icon('layers')}${L('Simulated municipal GIS · sample area', 'نظم معلومات بلدية محاكاة · منطقة نموذجية')}</div>${hint}${mini}${feat}</div>
          ${statusBar}
        </div>
      </div>
    </div>`;
  }

  const niceNum = (v) => { const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * p; };
  function bindGis() {
    const shell = document.querySelector('.mu-gmap .map-shell');
    if (!shell) return;
    const svg = shell.querySelector('svg');
    const $ = (id) => document.getElementById(id);
    const world = (e) => { try { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const m = svg.getScreenCTM(); if (!m) return null; const p = pt.matrixTransform(m.inverse()); return [p.x, p.y]; } catch (err) { return null; } };
    const fmt = (n) => B.num1(Math.round(n * 10) / 10);
    svg.addEventListener('pointermove', (e) => { const p = world(e); const el = $('gx-xy'); if (p && el) el.textContent = `E ${fmt(167400 + p[0] * M_PER_UNIT)}   N ${fmt(146900 - p[1] * M_PER_UNIT)}`; });
    const upd2 = () => {
      const vb = svg.viewBox.baseVal; const rect = svg.getBoundingClientRect();
      if (!vb || !rect.width) return;
      const s = Math.max(rect.width / vb.width, rect.height / vb.height);
      const mpp = M_PER_UNIT / s;
      const ratio = mpp / 0.0002645833;
      const sc = $('gx-scale'); if (sc) sc.textContent = '1:' + B.num(niceNum(ratio) >= 1000 ? Math.round(ratio / 100) * 100 : Math.round(ratio));
      const dist = niceNum(mpp * 70); const bar = $('gx-sbar'); if (bar) bar.style.width = Math.round(dist / mpp) + 'px';
      const bl = $('gx-sbl'); if (bl) bl.textContent = dist >= 1000 ? `${dist / 1000} km` : `${dist} m`;
      const zl = $('gx-zoom'); if (zl) zl.textContent = String(Math.max(1, Math.round((14 + Math.log2(1300 / vb.width)) * 10) / 10));
    };
    try { new MutationObserver(upd2).observe(svg, { attributes: true, attributeFilter: ['viewBox'] }); } catch (e) { /* ignore */ }
    upd2(); setTimeout(upd2, 0);
    if (B.get('gx:tool', 'select') === 'measure') {
      svg.addEventListener('click', (e) => { const p = world(e); if (!p) return; B.vs['gx:meas'] = B.get('gx:meas', []).concat([[+p[0].toFixed(1), +p[1].toFixed(1)]]); B.refresh(); });
    }
  }

  /* =================================================================
     6 · Registration Requests (+ detail)
     ================================================================= */
  const RQ_VIEWS = { open: (x) => OPEN.includes(x.status), new: (x) => x.status === 'new', needsInfo: (x) => x.status === 'needsInfo', high: (x) => OPEN.includes(x.status) && x.priority === 'high', decided: (x) => ['approved', 'rejected'].includes(x.status), all: () => true };
  function requests() {
    crumbs([[L('Registration Requests', 'طلبات التسجيل')]]);
    const st = B.get('rq:st', 'open'), ty = B.get('rq:type', 'all'), q = B.get('rq:q', ''), ch = B.get('rq:ch', 'all');
    const base = REQ.filter((x) => x.type !== 'correction' && (ty === 'all' || x.type === ty) && (ch === 'all' || x.channel === ch) && B.match(q, x.id, x.title, x.building, D.pname(x.by)));
    const rows = base.filter(RQ_VIEWS[st] || RQ_VIEWS.open);
    const regs = REQ.filter((x) => x.type !== 'correction');
    const table = dt({
      id: 'rqt', rows, rowGo: (r) => rgo(`request-${r.id}`), defaultSort: '-date', select: true,
      bulk: () => `${ui.btn(L('Assign to…', 'إسناد إلى…'), { icon: 'userPlus', act: 'soon', arg: L('Assignment', 'الإسناد') })}${ui.btn(L('Export', 'تصدير'), { icon: 'download', act: 'soon', arg: L('Export', 'التصدير') })}`,
      cols: [
        { key: 'title', label: L('Request', 'الطلب'), sort: (r) => tx(r.title), m: 'title', mRender: (r) => esc(tx(r.title)),
          render: (r) => `<div class="mu-cell"><span class="li-icon ${RT[r.type].tone}" style="width:30px;height:30px;border-radius:8px">${icon(RT[r.type].icon)}</span><div><b style="max-width:360px">${esc(tx(r.title))}</b><small><bdi>${r.id}</bdi> · ${tx(RT[r.type].short)} · <bdi>${r.building}</bdi></small></div></div>` },
        { key: 'building', label: L('Building', 'المبنى'), render: (r) => ui.idMono(r.building), m: 'sub', hide: true },
        { key: 'by', label: L('Submitted by', 'مقدّم الطلب'), sort: (r) => D.pname(r.by), render: (r) => `<div class="mu-2l"><span class="nowrap">${esc(D.pname(r.by))}</span><small>${tx(CH[r.channel])}</small></div>`, m: 'meta' },
        { key: 'prov', label: L('Provenance', 'المصدر'), render: (r) => ui.prov(r.channel === 'field' ? 'official' : 'submitted') },
        { key: 'priority', label: L('Priority', 'الأولوية'), sort: (r) => ({ high: 0, medium: 1, low: 2 }[r.priority]), render: (r) => ui.status(r.priority) },
        { key: 'date', label: L('Submitted', 'تاريخ التقديم'), sort: true, render: (r) => `<span class="nowrap">${B.dateShort(r.date)}</span>`, m: 'meta' },
        { key: 'status', label: L('Status', 'الحالة'), sort: true, render: (r) => ui.status(r.status), m: 'end' },
      ],
      empty: { icon: 'inbox', title: L('Inbox zero', 'لا توجد طلبات'), text: L('No requests match these filters.', 'لا توجد طلبات مطابقة لعوامل التصفية.') },
    });
    const vc = (k) => base.filter(RQ_VIEWS[k]).length;
    return `${hdr({ title: L('Registration Requests', 'طلبات التسجيل'), sub: L('New registrations, missing-building reports, duplicates and links to sample municipal references. Information corrections are handled in Correction Requests.', 'التسجيلات الجديدة وبلاغات المباني غير المُدرجة والتكرارات والربط بمراجع بلدية نموذجية. تُعالج تصحيحات المعلومات في طلبات التصحيح.'),
      actions: ui.btn(L('Correction Requests', 'طلبات التصحيح'), { icon: 'edit', go: rgo('corrections') }) + ui.btn(L('Assignment rules', 'قواعد الإسناد'), { icon: 'sliders', act: 'soon', arg: L('Assignment rules', 'قواعد الإسناد') }) })}
      <div class="stack">
        ${strip([
          { label: L('Open requests', 'طلبات مفتوحة'), value: regs.filter((x) => OPEN.includes(x.status)).length, sub: L(`${regs.filter((x) => x.status === 'new').length} not yet opened`, `${regs.filter((x) => x.status === 'new').length} لم تُفتح بعد`) },
          { label: L('Avg. review time', 'متوسط مدة المراجعة'), value: L('2.6 d', '2.6 يوم'), sub: L('Target: 5 days', 'الهدف: 5 أيام') },
          { label: L('Needs applicant info', 'بحاجة لمعلومات'), value: regs.filter((x) => x.status === 'needsInfo').length, sub: L('Waiting on applicant', 'بانتظار المتقدّم'), tone: 'warn' },
          { label: L('High priority', 'أولوية عالية'), value: regs.filter(RQ_VIEWS.high).length, sub: L('Review first', 'راجعها أولاً'), tone: 'bad' },
          { label: L('Decided this month', 'تم البت فيها هذا الشهر'), value: regs.filter((x) => ['approved', 'rejected'].includes(x.status)).length, sub: L('Approval rate 75%', 'نسبة الموافقة 75%') },
        ])}
        ${views('rq:st', [{ id: 'open', label: L('Open', 'مفتوحة'), count: vc('open') }, { id: 'new', label: B.statuses.new, count: vc('new') }, { id: 'high', label: L('High priority', 'أولوية عالية'), count: vc('high') }, { id: 'needsInfo', label: B.statuses.needsInfo, count: vc('needsInfo') }, { id: 'decided', label: L('Decided', 'تم البت'), count: vc('decided') }, { id: 'all', label: L('All', 'الكل'), count: vc('all') }], st)}
        <div class="mu-fbar">${ui.search('rq:q', L('Search request, building or applicant', 'ابحث بالطلب أو المبنى أو مقدّم الطلب'))}
          ${ui.select('rq:type', [{ v: 'all', l: L('All request types', 'جميع أنواع الطلبات') }].concat(Object.keys(RT).filter((k) => k !== 'correction').map((k) => ({ v: k, l: RT[k] }))), { def: 'all', label: L('Type', 'النوع') })}
          ${ui.select('rq:ch', [{ v: 'all', l: L('All channels', 'جميع القنوات') }].concat(Object.keys(CH).map((k) => ({ v: k, l: CH[k] }))), { def: 'all', label: L('Channel', 'القناة') })}
          <span class="mu-count">${L(`${rows.length} requests`, `${rows.length} طلبات`)}</span></div>
        ${table}
      </div>`;
  }

  function requestDetail(id) {
    const r = reqOf(id);
    if (!r) return ui.empty({ icon: 'inbox', title: L('Request not found', 'الطلب غير موجود'), action: ui.btn(L('Back to requests', 'العودة للطلبات'), { kind: 'primary', go: rgo('requests') }) });
    B.title(r.id); B.navActive('requests');
    crumbs([[L('Registration Requests', 'طلبات التسجيل'), 'requests'], [r.id]]);
    const b = D.building(r.building);
    const meta = RT[r.type];
    const cols = r.cols ? r.cols() : [L('Submitted data', 'البيانات المقدّمة'), L('Municipal record (sample)', 'السجل البلدي (نموذج)')];
    const dupMode = r.type === 'duplicate';
    const fields = r.fields();
    const rows = fields.map(([k, s, m]) => {
      const both = m != null && s != null;
      const diff = both && String(s) !== String(m);
      const cls = (v, i) => (v == null ? 'none' : dupMode ? (both && !diff ? 'same' : '') : diff ? (i ? 'old' : 'diff') : '');
      const cell = (v, c, i) => `<td class="${cls(v, i)}"><span class="dm">${c}</span>${v == null ? L('No record', 'لا يوجد سجل') : esc(v)}</td>`;
      return `<tr><td>${k}</td>${cell(s, cols[0], 0)}${cell(m, cols[1], 1)}</tr>`;
    }).join('');
    const ndiff = fields.filter(([, s, m]) => m != null && s != null && String(s) !== String(m)).length;
    const nsame = fields.filter(([, s, m]) => m != null && s != null && String(s) === String(m)).length;
    const decided = ['approved', 'rejected'].includes(r.status);
    const person = D.person(r.by);
    const tl = [
      { state: 'done', icon: 'send', title: L('Submitted', 'تم التقديم'), meta: `${B.date(r.date)} · ${esc(D.pname(r.by))} · ${tx(CH[r.channel])}` },
      { state: 'done', icon: 'cpu', title: L('Automated checks completed', 'اكتملت الفحوصات الآلية'), meta: B.date(r.date), body: (r.checks || []).map((c) => tx(c[1])).join(' · ') },
      { state: decided || (r.extra || []).length ? 'done' : 'current', icon: 'userCheck', title: L('Assigned to Eng. Maha Awad', 'أُسند إلى م. مها عوض'), meta: B.date(r.date) },
    ].concat((r.extra || []).map((e) => ({ state: e.done ? 'done' : 'current', icon: e.done ? 'check' : 'alertCircle', title: tx(e.title), meta: `${B.date(e.date)} · ${esc(D.pname(e.who))}`, body: e.body ? tx(e.body) : '' })));
    if (!decided) tl.push({ state: '', icon: 'gavel', title: L('Decision', 'القرار'), meta: L('Approve, request info or reject', 'موافقة أو طلب معلومات أو رفض') });

    const actions = decided
      ? `<div class="rq-actbar">${ui.btn(L('Reopen review', 'إعادة فتح المراجعة'), { icon: 'refresh', act: 'muReopen', arg: r.id })}${b ? ui.btn(L('Open Building Identity', 'فتح هوية المبنى'), { kind: 'dark', icon: 'fingerprint', go: rgo(`building-${b.id}`) }) : ''}</div>`
      : `<div class="rq-actbar">${ui.btn(L('Reject', 'رفض'), { kind: 'danger', icon: 'xCircle', act: 'muDecide', arg: `${r.id}:rejected` })}${ui.btn(L('Request info', 'طلب معلومات'), { icon: 'alertCircle', act: 'muDecide', arg: `${r.id}:needsInfo` })}${ui.btn(L('Approve', 'موافقة'), { kind: 'primary', icon: 'check', act: 'muDecide', arg: `${r.id}:approved` })}</div>`;

    const headHtml = `<div class="mu-ph"><div class="grow" style="min-width:0">
        <div class="row-sm wrap" style="margin-bottom:8px">${ui.badge(meta, meta.tone, meta.icon)}${ui.status(r.status)}${ui.status(r.priority)}${ui.prov(r.channel === 'field' ? 'official' : 'submitted')}${sampleTag(L('Demo request', 'طلب تجريبي'))}</div>
        <h1>${esc(tx(r.title))}</h1>
        <div class="rq-meta"><span>${icon('hash')}${ui.idMono(r.id)}</span><span>${icon('user')}${esc(D.pname(r.by))}</span><span>${icon('calendar')}${B.date(r.date)}</span><span>${icon('inbox')}${tx(CH[r.channel])}</span></div>
      </div><div class="mu-ph-a rq-desk">${actions}</div></div>`;

    const cmp = ui.card({
      title: L('Submitted data vs municipal record', 'البيانات المقدّمة مقابل السجل البلدي'),
      sub: dupMode ? L(`${nsame} matching field(s) suggest the same building`, `${nsame} حقل/حقول متطابقة تشير إلى المبنى نفسه`) : ndiff ? L(`${ndiff} field(s) differ`, `${ndiff} حقل/حقول مختلفة`) : L('No conflicting fields', 'لا توجد حقول متعارضة'),
      headExtra: dupMode ? (nsame ? ui.badge(L('Matches highlighted', 'التطابقات مظللة'), 'mint', 'layers') : '') : ndiff ? ui.badge(L('Changes highlighted', 'التغييرات مظللة'), 'warn', 'alert') : '',
      body: `${r.note ? `<p class="small muted" style="margin:-4px 0 14px">${tx(r.note)}</p>` : ''}<table class="rq-cmp"><thead><tr><th>${L('Field', 'الحقل')}</th><th>${cols[0]} ${ui.prov('submitted')}</th><th>${cols[1]} ${ui.prov('official')}</th></tr></thead><tbody>${rows}</tbody></table>`,
    });
    const checks = ui.card({ title: L('Automated checks', 'الفحوصات الآلية'), body: `<div class="rq-checks">${(r.checks || []).map(([s, t]) => `<div class="${s}">${icon(s === 'ok' ? 'checkCircle' : 'alert')}<span>${tx(t)}</span></div>`).join('')}</div>` });
    const att = ui.card({ title: L('Attachments', 'المرفقات'), sub: L(`${r.docs.length} files`, `${r.docs.length} ملفات`), body: ui.list(r.docs.map((d) => ui.doc(d))) });
    const mapCard = ui.card({
      cls: 'pad-0',
      body: `${B.map.render({ id: 'rq' + r.id.replace(/\D/g, ''), static: true, mode: 'verification', focus: r.building, focusW: 220, selected: r.building, height: '220px', legend: false, badge: L('Location · sample area', 'الموقع · منطقة نموذجية') })}
        <div style="padding:12px 16px" class="row between">
          <div style="min-width:0"><div class="strong small truncate">${b ? esc(tx(b.name)) : '—'}</div><div class="xs faint">${b ? `${ui.idMono(b.id)} · ${dName(b.district)}` : ''}</div></div>
          ${ui.btn(L('GIS', 'الخريطة'), { size: 'sm', icon: 'map', act: 'muShowOnMap', arg: r.building })}
        </div>`,
    });
    const applicant = ui.card({ title: L('Applicant', 'مقدّم الطلب'), body: `${ui.li({ avatar: person.name, title: tx(person.name), sub: tx(CH[r.channel]) })}${ui.kv([[L('Phone', 'الهاتف'), `<span class="ltr">${esc(person.phone || `+970 59 ${100 + (hash(person.id) % 900)} ${1000 + (hash(person.id + 'x') % 9000)}`)}</span>`], [L('Email', 'البريد الإلكتروني'), person.email ? esc(person.email) : `<span class="faint">${L('Not shared', 'غير مُشارك')}</span>`], [L('BENA identity', 'هوية بينا'), ui.status('verified')]])}` });
    const timeline = ui.card({ title: L('Review timeline', 'مسار المراجعة'), body: ui.timeline(tl) });

    return `${headHtml}
      ${decided ? `<div style="margin-bottom:16px">${ui.callout(L(`Decision recorded on ${B.date(r.decided || '2026-11-25')}: <b>${ui.statusLabel(r.status)}</b>.`, `تم تسجيل القرار في ${B.date(r.decided || '2026-11-25')}: <b>${ui.statusLabel(r.status)}</b>.`), r.status === 'approved' ? 'mint' : '', r.status === 'approved' ? 'checkCircle' : 'info')}</div>` : ''}
      <div class="grid g-main">
        <div class="stack">${cmp}${checks}${att}</div>
        <div class="stack">${mapCard}${timeline}${applicant}</div>
      </div>
      <div class="rq-mob">${actions}</div>`;
  }
  B.act.muReopen = (id) => { const r = reqOf(id); r.status = 'underReview'; r.decided = null; (r.extra = r.extra || []).push({ date: '2026-11-25', title: T('Review reopened', 'أعيد فتح المراجعة'), who: 'p_maha' }); B.refresh(); B.toast(L('Review reopened', 'أعيد فتح المراجعة')); };
  B.act.muDecide = (arg) => {
    const [id, dec] = arg.split(':');
    const r = reqOf(id);
    const cfg = {
      approved: { t: L('Approve request', 'الموافقة على الطلب'), ok: L('Approve', 'موافقة'), kind: 'primary', ic: 'check', ph: L('Optional note to the applicant', 'ملاحظة اختيارية لمقدّم الطلب'),
        extra: ['link', 'correction', 'newReg'].includes(r.type) ? `<label class="check" style="margin-top:12px"><input type="checkbox" name="apply" checked><span>${r.type === 'link' ? L('Link the BENA record to the sample municipal reference', 'ربط سجل بينا بالمرجع البلدي النموذجي') : r.type === 'newReg' ? L('Mark the building as verified and registered', 'اعتماد المبنى كموثّق ومسجّل') : L('Apply the submitted values to the municipal record', 'تطبيق القيم المقدّمة على السجل البلدي')}</span></label>` : '' },
      needsInfo: { t: L('Request more information', 'طلب معلومات إضافية'), ok: L('Send request', 'إرسال الطلب'), kind: 'dark', ic: 'send', ph: L('What should the applicant provide?', 'ما الذي يجب أن يقدّمه المتقدّم؟'), extra: '' },
      rejected: { t: L('Reject request', 'رفض الطلب'), ok: L('Reject', 'رفض'), kind: 'danger', ic: 'xCircle', ph: L('Reason for rejection (shared with the applicant)', 'سبب الرفض (يُرسل لمقدّم الطلب)'), extra: '' },
    }[dec];
    B.modal({ title: cfg.t, sub: `${r.id} · ${esc(tx(r.title))}`, size: 'sm', form: 'muDecision',
      body: `<input type="hidden" name="id" value="${r.id}"><input type="hidden" name="dec" value="${dec}">${ui.field({ name: 'note', label: L('Note', 'ملاحظة'), type: 'textarea', placeholder: cfg.ph, required: dec !== 'approved' })}${cfg.extra}`,
      foot: `${ui.btn(L('Cancel', 'إلغاء'), { act: 'closeModal' })}${ui.btn(cfg.ok, { kind: cfg.kind, type: 'submit', icon: cfg.ic })}` });
  };
  B.submit.muDecision = (d) => {
    const r = reqOf(d.id);
    if (!r) return;
    r.status = d.dec;
    if (d.dec !== 'needsInfo') r.decided = '2026-11-25';
    const titles = { approved: T('Approved', 'تمت الموافقة'), needsInfo: T('Additional information requested', 'طُلبت معلومات إضافية'), rejected: T('Rejected', 'مرفوض') };
    (r.extra = r.extra || []).push({ date: '2026-11-25', title: titles[d.dec], body: d.note ? { en: d.note, ar: d.note } : null, who: 'p_maha', done: d.dec !== 'needsInfo' });
    const b = D.building(r.building);
    if (d.dec === 'approved' && d.apply && b) {
      if (r.type === 'link') { b.gis = r.gis; b.ref = r.ref; b.source = 'gis'; }
      if (r.type === 'newReg') { b.verification = 'verified'; b.status = 'registered'; }
      b.updated = '2026-11-25';
    }
    B.refresh();
    const msg = { approved: [L('Request approved', 'تمت الموافقة على الطلب'), L('The applicant has been notified and the record updated.', 'تم إشعار مقدّم الطلب وتحديث السجل.')], needsInfo: [L('Information requested', 'تم طلب المعلومات'), L('The request is paused until the applicant replies.', 'تم تعليق الطلب حتى يرد مقدّم الطلب.')], rejected: [L('Request rejected', 'تم رفض الطلب'), L('The applicant will see your reason in BENA.', 'سيرى مقدّم الطلب سبب الرفض في بينا.')] }[d.dec];
    B.success({ title: msg[0], text: msg[1], ref: r.id });
  };

  /* =================================================================
     10 · Municipal Analytics
     ================================================================= */
  function analytics() {
    crumbs([[L('Municipal Analytics', 'التحليلات البلدية')]]);
    const per = B.get('an:per', '12');
    const n = per === '6' ? 6 : 12;
    const mlab = months().slice(12 - n);
    const sampleTypes = {};
    D.buildings.forEach((b) => { sampleTypes[b.type] = (sampleTypes[b.type] || 0) + 1; });
    const typeData = Object.keys(D.types).map((k) => ({ label: D.types[k], value: Math.round(((sampleTypes[k] || 0) / D.buildings.length) * C.total), color: D.types[k].color })).sort(B.by('value', -1));
    const res = typeData.find((t) => t.label === D.types.residential).value;
    const com = B.sum(typeData.filter((t) => [D.types.commercial, D.types.office, D.types.mixed].includes(t.label)), (t) => t.value);
    const byDist = D.districts.slice().sort(B.by('buildings', -1));
    const ver = cityVer();
    const sumN = B.sum(C.trend.slice(12 - n));

    const distBars = ui.card({ title: L('Buildings by district', 'المباني حسب الحي'), sub: L('Registered buildings, city-wide (sample)', 'المباني المسجّلة على مستوى المدينة (نموذج)'),
      body: B.charts.hbars({ data: byDist.map((d, i) => ({ label: d.name, value: d.buildings, sub: L(`${B.num(d.units)} units`, `${B.num(d.units)} وحدة`), color: i === 0 ? '#142B3B' : '#7FA7C2' })) }) });
    const types = ui.card({ title: L('Residential vs commercial', 'السكني مقابل التجاري'), sub: L('By building type (estimated from mapped sample)', 'حسب نوع المبنى (تقدير من العينة المرسومة)'),
      body: `${B.charts.donut({ data: typeData, size: 160, center: { value: B.pct(pct(res, C.total), 0), label: L('residential', 'سكني') } })}
        <div class="row between" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line-2)"><span class="small muted">${L('Commercial, office & mixed-use', 'تجاري ومكاتب ومتعدد الاستخدامات')}</span><b>${B.num(com)}</b></div>` });
    const stacked = ui.card({ title: L('Linked vs independent by district', 'المرتبطة مقابل المستقلة حسب الحي'), sub: L('Independent records are candidates for matching', 'السجلات المستقلة مرشّحة للمطابقة'), link: { label: L('Matching workspace', 'مساحة المطابقة'), go: rgo('matching') },
      body: B.charts.bars({ labels: D.districts.map((d) => d.name), height: 230, series: [{ name: L('Linked to sample ref.', 'مرتبطة بمرجع نموذجي'), color: '#142B3B', values: D.districts.map((d) => d.gis) }, { name: L('Independent', 'مستقلة'), color: '#B9AAF0', values: D.districts.map((d) => d.buildings - d.gis) }] }) });
    const trend = ui.card({ title: L('Registration trends', 'اتجاهات التسجيل'), sub: L(`${B.num(sumN)} new registrations in ${n} months`, `${B.num(sumN)} تسجيلاً جديداً خلال ${n} أشهر`),
      headExtra: ui.seg('an:per', [{ id: '6', label: L('6 mo', '6 أشهر') }, { id: '12', label: L('12 mo', '12 شهراً') }], per),
      body: B.charts.bars({ labels: mlab, height: 210, series: [{ name: L('Via municipal GIS (sample)', 'عبر نظم المعلومات البلدية (نموذج)'), color: '#36D6A0', values: C.trend.slice(12 - n).map((v, i) => v - C.trendIndependent.slice(12 - n)[i]) }, { name: L('Independent submissions', 'تسجيلات مستقلة'), color: '#9B8AE0', values: C.trendIndependent.slice(12 - n) }] }) });
    const verC = ui.card({ title: L('Verification status', 'حالة التحقق'), sub: L('All registered buildings', 'جميع المباني المسجّلة'), link: { label: L('Queue', 'القائمة'), go: rgo('verify') },
      body: B.charts.donut({ data: [{ label: L('Verified', 'موثّق'), value: ver.verified, color: '#36D6A0' }, { label: L('Pending verification', 'بانتظار التحقق'), value: ver.pendingVerification, color: '#F2B35A' }, { label: L('Unverified draft', 'مسودة غير موثّقة'), value: ver.unverified, color: '#C9D6DF' }], size: 160, center: { value: B.pct(pct(ver.verified, C.total), 1), label: L('verified', 'موثّق') } }) });
    const hr = B.rng(99);
    const heat = ui.card({ title: L('Registration activity by district', 'نشاط التسجيل حسب الحي'), sub: L('Relative monthly volume', 'الحجم الشهري النسبي'),
      body: `<div class="mu-heat">${D.districts.map((d) => `<span class="hl">${tx(d.name)}</span>${B.charts.heat({ cols: 12, values: Array.from({ length: 12 }, (_, i) => Math.min(1, (0.25 + (i / 14)) * (0.6 + hr() * 0.7) * ((d.buildings - d.gis) / 600 + 0.4))), color: '#0B8A60' })}`).join('')}
        <span></span><div class="mx">${months().map((m) => `<span>${m}</span>`).join('')}</div></div>` });

    return `${hdr({ title: L('Municipal Analytics', 'التحليلات البلدية'), sub: L('Coverage, categories and registration trends for the municipal building registry (sample data).', 'التغطية والفئات واتجاهات التسجيل في سجل المباني البلدي (بيانات نموذجية).'),
      actions: ui.btn(L('Reports', 'التقارير'), { icon: 'doc', go: rgo('reports') }) + ui.btn(L('Download PDF', 'تنزيل PDF'), { icon: 'download', act: 'soon', arg: L('PDF report', 'تقرير PDF') }) })}
      <div class="stack-lg">
        ${strip([
          { label: L('Coverage (linked)', 'التغطية (مرتبطة)'), value: B.pct(pct(C.gis, C.total), 1), sub: L('+0.6 pts this quarter', '+0.6 نقطة هذا الربع') },
          { label: L('Avg. units per building', 'متوسط الوحدات لكل مبنى'), value: B.num1(C.units / C.total), sub: L('City-wide', 'على مستوى المدينة') },
          { label: L('Independent share', 'نسبة السجلات المستقلة'), value: B.pct(pct(C.independent, C.total), 1), sub: L('Highest: Batn Al-Hawa', 'الأعلى: بطن الهوا') },
          { label: L('Verified', 'موثّق'), value: B.pct(pct(ver.verified, C.total), 1), sub: L(`${B.num(C.pending)} pending`, `${B.num(C.pending)} بانتظار التحقق`), go: rgo('verify') },
          { label: L('New this year', 'جديدة هذا العام'), value: B.num(B.sum(C.trend)), sub: L('Dec 2025 – Nov 2026', 'ك١ 2025 – ت٢ 2026') },
        ])}
        <div class="grid g-main">${trend}${verC}</div>
        ${stacked}
        <div class="grid g2">${distBars}${types}</div>
        ${heat}
      </div>`;
  }

  /* =================================================================
     12 · Data Sources (designed-to-connect integrations, simulated)
     ================================================================= */
  const LAYERS = [
    { id: 'fp', icon: 'building', name: T('Building footprints', 'مساقط المباني'), feed: 'WFS · buildings_2026', features: 12417, last: '2026-11-25 06:00', status: 'synced', auto: true },
    { id: 'pc', icon: 'grid', name: T('Basins & parcels', 'الأحواض والقطع'), feed: 'WFS · cadastre', features: 18904, last: '2026-11-25 06:05', status: 'synced', auto: true },
    { id: 'ad', icon: 'pin', name: T('Address points', 'نقاط العناوين'), feed: 'REST · addressing/v2', features: 15230, last: '2026-11-25 09:40', status: 'syncing', auto: true },
    { id: 'st', icon: 'route', name: T('Street centrelines', 'محاور الشوارع'), feed: 'WFS · streets', features: 1288, last: '2026-11-24 22:00', status: 'synced', auto: true },
    { id: 'zn', icon: 'layers', name: T('Zoning & heritage zones', 'التنظيم والمناطق التراثية'), feed: 'WMS · planning (read-only)', features: 214, last: '2026-11-18 03:00', status: 'delayed', auto: false },
    { id: 'bp', icon: 'doc', name: T('Building permits', 'رخص البناء'), feed: 'CSV drop · permits_export', features: 6402, last: '2026-11-21 23:10', status: 'syncError', auto: true },
  ];
  B.act.muSync = (id) => {
    const l = LAYERS.find((x) => x.id === id);
    if (l) { l.status = 'synced'; l.last = '2026-11-25 10:02'; }
    B.refresh(); B.toast(L(`${l ? tx(l.name) : 'Layer'} synced (simulated)`, `تمت مزامنة ${l ? tx(l.name) : 'الطبقة'} (محاكاة)`));
  };
  B.act.muSyncAll = () => { LAYERS.forEach((l) => { l.status = 'synced'; l.last = '2026-11-25 10:02'; }); B.refresh(); B.toast(L('All layers synced (simulated)', 'تمت مزامنة جميع الطبقات (محاكاة)')); };
  function data() {
    crumbs([[L('Data Sources', 'مصادر البيانات')]]);
    const ok = LAYERS.filter((l) => l.status === 'synced').length;
    const layers = LAYERS.map((l) => `<div class="ds-layer"><span class="li-icon ${l.status === 'syncError' ? 'bad' : l.status === 'delayed' ? 'warn' : 'navy'}">${icon(l.icon)}</span>
      <div style="min-width:0"><b>${tx(l.name)} ${ui.prov('official')}</b><small><span class="id-mono" style="font-size:11.5px;color:var(--text-2)">${esc(l.feed)}</span> · ${B.num(l.features)} ${L('features', 'معلم')} · ${L('last sync', 'آخر مزامنة')} ${B.dateShort(l.last.slice(0, 10))} <span class="ltr">${esc(l.last.slice(11))}</span></small></div>
      <div class="ds-end">${ui.status(l.status)}${ui.btn('', { size: 'sm', icon: 'refresh', act: 'muSync', arg: l.id, title: L('Sync now', 'مزامنة الآن') })}<label class="switch" title="${esc(L('Automatic sync', 'مزامنة تلقائية'))}"><input type="checkbox" data-model="ds:auto:${l.id}" data-norender ${B.get('ds:auto:' + l.id, l.auto) ? 'checked' : ''}><i></i></label></div></div>`).join('');
    const indep = D.districts.map((d) => `<div class="ds-row"><div><b>${tx(d.name)}</b><small>${L(`${B.num(d.buildings - d.gis)} independent records`, `${B.num(d.buildings - d.gis)} سجل مستقل`)}</small></div><label class="switch"><input type="checkbox" data-model="ds:ind:${d.id}" data-norender ${B.get('ds:ind:' + d.id, d.id !== 'oldcity') ? 'checked' : ''}><i></i></label></div>`).join('');
    const isAdmin = B.route && B.route.role === 'muniadmin';
    return `${hdr({ title: L('Data Sources', 'مصادر البيانات'), unit: isAdmin ? L('Municipal Administration', 'الإدارة البلدية') : null, sub: L('Municipal GIS layers BENA is designed to connect to, and how independent submissions are handled. All feeds here are simulated.', 'طبقات نظم المعلومات البلدية التي صُممت بينا للاتصال بها، وكيفية التعامل مع التسجيلات المستقلة. جميع المصادر هنا محاكاة.'),
      actions: ui.btn(L('Add source', 'إضافة مصدر'), { icon: 'plus', act: 'soon', arg: L('Adding a data source', 'إضافة مصدر بيانات') }) + ui.btn(L('Sync all layers', 'مزامنة جميع الطبقات'), { kind: 'primary', icon: 'refresh', act: 'muSyncAll' }) })}
      <div class="stack-lg">
        ${ui.simRibbon(L('Simulated integration — designed to connect, but not connected to any real municipal GIS server.', 'تكامل محاكى — مصمم للاتصال، لكنه غير متصل بأي خادم نظم معلومات بلدي حقيقي.'))}
        ${strip([
          { label: L('Connected layers', 'الطبقات المتصلة'), value: `${ok}/${LAYERS.length}`, sub: L('Up to date', 'محدّثة') },
          { label: L('Features synced', 'المعالم المتزامنة'), value: B.compact(B.sum(LAYERS, (l) => l.features)), sub: L('All layers', 'جميع الطبقات') },
          { label: L('Changes today', 'تغييرات اليوم'), value: '233', sub: L('214 updated · 19 added', '214 تحديثاً · 19 إضافة') },
          { label: L('Failed feeds', 'مصادر فاشلة'), value: LAYERS.filter((l) => l.status === 'syncError').length, sub: L('Needs attention', 'بحاجة لمتابعة'), tone: LAYERS.some((l) => l.status === 'syncError') ? 'bad' : '' },
        ])}
        <div class="grid g-main">
          <div class="stack">${ui.card({ title: L('GIS layers', 'طبقات نظم المعلومات'), sub: L(`${ok} of ${LAYERS.length} layers up to date`, `${ok} من ${LAYERS.length} طبقات محدّثة`), body: layers })}
          ${ui.card({ title: L('Sync activity', 'نشاط المزامنة'), sub: L('Features changed per day, last 14 days', 'المعالم المتغيّرة يومياً خلال آخر 14 يوماً'),
            body: B.charts.bars({ labels: Array.from({ length: 14 }, (_, i) => String(12 + i)), height: 150, series: [{ name: L('Updated', 'مُحدّث'), color: '#7FA7C2', values: [180, 142, 96, 210, 188, 64, 40, 230, 176, 158, 201, 122, 90, 214] }, { name: L('Added', 'مُضاف'), color: '#36D6A0', values: [12, 9, 4, 18, 11, 2, 1, 21, 14, 8, 16, 7, 5, 19] }] })
              + `<div class="divider" style="margin:16px 0 4px"></div>` + ui.list([
                ui.li({ icon: 'check', tone: 'mint', title: L('Footprints: 214 updated, 19 added', 'المساقط: تحديث 214 وإضافة 19'), sub: L('Today 06:00 · automatic', 'اليوم 06:00 · تلقائي') }),
                ui.li({ icon: 'alertCircle', tone: 'bad', title: L('Building permits: file could not be parsed', 'رخص البناء: تعذرت قراءة الملف'), sub: L('21 Nov 23:10 · column “permit_no” missing', '21 تشرين الثاني 23:10 · العمود «permit_no» مفقود'), act: 'muSync', arg: 'bp', end: `<span class="xs mint-ink strong">${L('Retry', 'إعادة المحاولة')}</span>` }),
                ui.li({ icon: 'clock', tone: 'warn', title: L('Zoning layer: source not updated since 18 Nov', 'طبقة التنظيم: لم يُحدَّث المصدر منذ 18 تشرين الثاني'), sub: L('Planning department publishes weekly', 'تنشر دائرة التخطيط أسبوعياً') }),
              ]) })}</div>
          <div class="stack">
            ${ui.card({ title: L('Sync schedule', 'جدول المزامنة'), body: `<div class="stack">
              ${ui.field({ name: 'freq', label: L('Footprint sync frequency', 'تكرار مزامنة المساقط'), type: 'select', value: 'daily', options: [{ v: 'hourly', l: L('Every hour', 'كل ساعة') }, { v: 'daily', l: L('Daily at 06:00', 'يومياً الساعة 06:00') }, { v: 'weekly', l: L('Weekly (Sunday)', 'أسبوعياً (الأحد)') }] })}
              ${ui.field({ name: 'conflict', label: L('When records conflict', 'عند تعارض السجلات'), type: 'select', value: 'review', options: [{ v: 'review', l: L('Send to review queue', 'إرسال لقائمة المراجعة') }, { v: 'gis', l: L('Municipal GIS wins', 'الأولوية لنظم المعلومات البلدية') }] })}
              ${ui.field({ name: 'mail', label: L('Sync alerts to', 'إرسال تنبيهات المزامنة إلى'), type: 'email', value: 'gis.office@sample-municipality.example' })}
              ${ui.btn(L('Save settings', 'حفظ الإعدادات'), { kind: 'dark', icon: 'check', act: 'toast', arg: L('Settings saved (demo)', 'تم حفظ الإعدادات (تجريبي)') })}</div>` })}
            ${ui.card({ title: L('Independent registration', 'التسجيل المستقل'), sub: L('Allow owners to register buildings without a municipal record', 'السماح للمالكين بتسجيل مبانٍ دون سجل بلدي'), body: indep })}
          </div>
        </div>
      </div>`;
  }

  /* ---------------- expose for municipality2.js ---------------- */
  B.mu = {
    R, T, STAFF, WORKSPACES, REQ, RT, CH, OPEN, LAYERS, DQ, MAPID, M_PER_UNIT,
    hash, qf, months, dName, typeIcon, sw, sampleTag, pct, upd, units, parcelTxt, srcLabel, orgName, rgo, crumbs, hdr, strip, views, dt, selOf, cb, attrs,
    flagChips, refCell, verProv, quickView, sampleQ, cityVer, districtView, openCount, reqOf, optsType, optsVer, optsSrc, optsDist,
    pages: { home, registry, explorer, requests, request: requestDetail, analytics, data },
    queueStats: null,
  };
})();
