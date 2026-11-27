/*
 * BENA UI components. Every helper returns an HTML string.
 * Labels passed in may be plain strings or {en, ar} objects.
 */
(function () {
  const B = (window.B = window.B || {});
  const { esc, tx, L, icon } = B;
  const ui = (B.ui = {});

  /* ---------------- statuses ---------------- */
  // tone: ok | warn | bad | info | violet | neutral | navy | mint | outline
  B.statuses = Object.assign(B.statuses || {}, {
    verified: { en: 'Verified', ar: 'موثّق', tone: 'ok', icon: 'shieldCheck' },
    pending: { en: 'Pending', ar: 'قيد الانتظار', tone: 'warn' },
    pendingVerification: { en: 'Pending verification', ar: 'بانتظار التحقق', tone: 'warn', icon: 'clock' },
    unverified: { en: 'Unverified', ar: 'غير موثّق', tone: 'neutral' },
    rejected: { en: 'Rejected', ar: 'مرفوض', tone: 'bad' },
    registered: { en: 'Registered', ar: 'مسجّل', tone: 'ok' },
    draft: { en: 'Draft', ar: 'مسودة', tone: 'neutral' },
    submitted: { en: 'Submitted', ar: 'مُقدّم', tone: 'info' },
    underReview: { en: 'Under review', ar: 'قيد المراجعة', tone: 'info', icon: 'eye' },
    needsInfo: { en: 'Needs info', ar: 'بحاجة لمعلومات', tone: 'warn', icon: 'alertCircle' },
    approved: { en: 'Approved', ar: 'مُعتمد', tone: 'ok', icon: 'check' },
    linked: { en: 'Linked', ar: 'مرتبط', tone: 'ok', icon: 'link' },
    active: { en: 'Active', ar: 'ساري', tone: 'ok' },
    expiring: { en: 'Expiring soon', ar: 'ينتهي قريباً', tone: 'warn' },
    expired: { en: 'Expired', ar: 'منتهي', tone: 'bad' },
    terminated: { en: 'Terminated', ar: 'منتهي بالفسخ', tone: 'neutral' },
    renewed: { en: 'Renewed', ar: 'مُجدّد', tone: 'info' },
    paid: { en: 'Paid', ar: 'مدفوع', tone: 'ok' },
    due: { en: 'Due', ar: 'مستحق', tone: 'warn' },
    upcoming: { en: 'Upcoming', ar: 'قادم', tone: 'info' },
    overdue: { en: 'Overdue', ar: 'متأخر', tone: 'bad' },
    partial: { en: 'Partially paid', ar: 'مدفوع جزئياً', tone: 'warn' },
    open: { en: 'Open', ar: 'مفتوح', tone: 'info' },
    new: { en: 'New', ar: 'جديد', tone: 'mint' },
    inProgress: { en: 'In progress', ar: 'قيد التنفيذ', tone: 'violet' },
    assigned: { en: 'Assigned', ar: 'مُسند', tone: 'info' },
    scheduled: { en: 'Scheduled', ar: 'مُجدول', tone: 'info', icon: 'calendar' },
    completed: { en: 'Completed', ar: 'مكتمل', tone: 'ok', icon: 'check' },
    resolved: { en: 'Resolved', ar: 'تم الحل', tone: 'ok', icon: 'check' },
    cancelled: { en: 'Cancelled', ar: 'ملغى', tone: 'neutral' },
    onHold: { en: 'On hold', ar: 'معلّق', tone: 'neutral' },
    occupied: { en: 'Occupied', ar: 'مشغول', tone: 'ok' },
    vacant: { en: 'Vacant', ar: 'شاغر', tone: 'neutral' },
    ownerOccupied: { en: 'Owner-occupied', ar: 'يسكنه المالك', tone: 'navy' },
    rented: { en: 'Rented', ar: 'مؤجّر', tone: 'ok' },
    maintenance: { en: 'Under maintenance', ar: 'تحت الصيانة', tone: 'warn', icon: 'wrench' },
    critical: { en: 'Critical', ar: 'حرج', tone: 'bad' },
    high: { en: 'High', ar: 'عالية', tone: 'bad' },
    medium: { en: 'Medium', ar: 'متوسطة', tone: 'warn' },
    low: { en: 'Low', ar: 'منخفضة', tone: 'neutral' },
    good: { en: 'Good', ar: 'جيدة', tone: 'ok' },
    fair: { en: 'Fair', ar: 'مقبولة', tone: 'warn' },
    poor: { en: 'Poor', ar: 'ضعيفة', tone: 'bad' },
    excellent: { en: 'Excellent', ar: 'ممتازة', tone: 'ok' },
    online: { en: 'Online', ar: 'متصل', tone: 'ok' },
    offline: { en: 'Offline', ar: 'غير متصل', tone: 'neutral' },
    warning: { en: 'Warning', ar: 'تحذير', tone: 'warn', icon: 'alert' },
    alarm: { en: 'Alarm', ar: 'إنذار', tone: 'bad', icon: 'alert' },
    quoted: { en: 'Quoted', ar: 'تم التسعير', tone: 'violet' },
    accepted: { en: 'Accepted', ar: 'مقبول', tone: 'ok' },
    declined: { en: 'Declined', ar: 'مرفوض', tone: 'neutral' },
    listed: { en: 'Listed', ar: 'معروض', tone: 'mint' },
    notListed: { en: 'Not listed', ar: 'غير معروض', tone: 'outline' },
    legal: { en: 'Legally documented', ar: 'موثّقة قانونياً', tone: 'navy', icon: 'badgeCheck' },
    informal: { en: 'Informal committee', ar: 'لجنة غير رسمية', tone: 'outline', icon: 'users' },
    authorized: { en: 'Authorized manager', ar: 'مدير مفوّض', tone: 'info', icon: 'key' },
    enabled: { en: 'Enabled', ar: 'مفعّل', tone: 'ok' },
    disabled: { en: 'Disabled', ar: 'معطّل', tone: 'neutral' },
    invited: { en: 'Invited', ar: 'تمت الدعوة', tone: 'info' },
    suspended: { en: 'Suspended', ar: 'موقوف', tone: 'bad' },
    passed: { en: 'Passed', ar: 'أُقرّ', tone: 'ok', icon: 'check' },
    failed: { en: 'Not passed', ar: 'لم يُقرّ', tone: 'bad' },
    current: { en: 'Current', ar: 'حالي', tone: 'mint' },
    previous: { en: 'Previous', ar: 'سابق', tone: 'neutral' },
  });

  ui.status = (key, extra = '') => {
    const s = B.statuses[key] || { en: key, ar: key, tone: 'neutral' };
    return `<span class="badge ${s.tone} ${extra}">${s.icon ? icon(s.icon) : '<i class="bd"></i>'}${tx(s)}</span>`;
  };
  ui.statusLabel = (key) => tx(B.statuses[key] || key);
  ui.badge = (text, tone = 'neutral', ic = null, extra = '') => `<span class="badge ${tone} ${extra}">${ic ? icon(ic) : ''}${tx(text)}</span>`;
  /** Data source tag: municipal GIS record vs independently submitted record. */
  ui.sourceTag = (source) => source === 'gis'
    ? `<span class="source-tag gis">${icon('landmark')}${L('Municipal GIS record', 'سجل نظم المعلومات البلدية')}</span>`
    : `<span class="source-tag independent">${icon('userCheck')}${L('Independently submitted', 'مُسجّل بشكل مستقل')}</span>`;
  ui.sourceBadge = (source) => source === 'gis'
    ? `<span class="badge navy">${icon('landmark')}${L('GIS-linked', 'مرتبط بالبلدية')}</span>`
    : `<span class="badge outline">${icon('userCheck')}${L('Independent', 'مستقل')}</span>`;

  /** Data provenance marker: official (source-linked) · submitted (user) · pending (verification) · demo (simulated). */
  ui.PROV = {
    official: { en: 'Official source', ar: 'مصدر رسمي', icon: 'landmark', hint: { en: 'Linked to an authorised external record (sample)', ar: 'مرتبط بسجل خارجي معتمد (نموذج)' } },
    submitted: { en: 'User-submitted', ar: 'مُقدَّم من مستخدم', icon: 'userCheck', hint: { en: 'Provided by an owner, resident or manager', ar: 'قدّمه مالك أو ساكن أو مدير' } },
    pending: { en: 'Pending verification', ar: 'بانتظار التحقق', icon: 'clock', hint: { en: 'Awaiting review by the data steward', ar: 'بانتظار مراجعة مسؤول البيانات' } },
    demo: { en: 'Sample data', ar: 'بيانات نموذجية', icon: 'info', hint: { en: 'Simulated demonstration data', ar: 'بيانات عرض محاكاة' } },
  };
  ui.prov = (kind, withHint = false) => { const p = ui.PROV[kind] || ui.PROV.demo; return `<span class="prov prov-${kind}" title="${esc(tx(p.hint))}">${icon(p.icon)}${tx(p)}</span>${withHint ? `<span class="prov-hint">${tx(p.hint)}</span>` : ''}`; };
  ui.provLegend = () => `<div class="prov-legend">${Object.keys(ui.PROV).map((k) => ui.prov(k)).join('')}</div>`;

  /* ---------------- layout pieces ---------------- */
  ui.pageHead = ({ title, sub = '', actions = '', eyebrow = '' }) => `
    <div class="page-head"><div class="grow">${eyebrow ? `<div class="eyebrow" style="margin-bottom:6px">${tx(eyebrow)}</div>` : ''}<h1>${tx(title)}</h1>${sub ? `<p>${tx(sub)}</p>` : ''}</div>
    ${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;

  /** btn(label, {icon, kind:'primary'|'ghost'|'dark'|'soft'|'text'|'danger', go, act, arg, size:'sm'|'lg', block, type}) */
  ui.btn = (label, o = {}) => {
    const cls = ['btn', 'btn-' + (o.kind || 'ghost'), o.size ? 'btn-' + o.size : '', o.block ? 'btn-block' : '', !label ? 'btn-icon' : '', o.cls || ''].join(' ');
    const attrs = o.go ? `data-go="${o.go}"` : o.act ? `data-act="${o.act}" data-arg="${esc(o.arg ?? '')}"` : '';
    return `<button type="${o.type || 'button'}" class="${cls}" ${attrs} ${o.disabled ? 'disabled' : ''} ${o.title ? `title="${esc(o.title)}" aria-label="${esc(o.title)}"` : ''}>${o.icon ? icon(o.icon, o.iconCls || '') : ''}${label ? `<span>${tx(label)}</span>` : ''}</button>`;
  };

  /** card({title, sub, link:{label, go|act, arg}, body, cls, foot, headExtra}) */
  ui.card = ({ title = '', sub = '', link = null, body = '', cls = '', foot = '', headExtra = '' }) => `
    <section class="card ${cls}">
      ${title || link || headExtra ? `<div class="card-head"><div class="grow"><h3>${tx(title)}</h3>${sub ? `<div class="sub">${tx(sub)}</div>` : ''}</div>${headExtra}
        ${link ? `<button class="link-btn" ${link.go ? `data-go="${link.go}"` : `data-act="${link.act}" data-arg="${esc(link.arg ?? '')}"`}>${tx(link.label || L('View all', 'عرض الكل'))}${icon('chevR', 'flip')}</button>` : ''}</div>` : ''}
      ${body}
      ${foot ? `<div class="card-foot">${foot}</div>` : ''}
    </section>`;

  /** kpi({label, value, unit, icon, tone:'mint'|'warn'|'bad'|'info'|'violet', delta:'+4.2%', dir:'up'|'down'|'flat', foot, spark:[...], cls, go}) */
  ui.kpi = (o) => {
    const inner = `<div class="kpi">
      <div class="k-top"><span class="k-label">${tx(o.label)}</span>${o.icon ? `<span class="k-icon ${o.tone || ''}">${icon(o.icon)}</span>` : ''}</div>
      <div class="k-value">${o.value}${o.unit ? `<small>${tx(o.unit)}</small>` : ''}</div>
      ${o.spark ? B.charts.spark(o.spark, o.sparkColor) : ''}
      ${o.delta || o.foot ? `<div class="k-foot">${o.delta ? `<span class="delta ${o.dir || 'up'}">${icon(o.dir === 'down' ? 'arrowDown' : o.dir === 'flat' ? 'minus' : 'arrowUp')}${o.delta}</span>` : ''}${o.foot ? `<span>${tx(o.foot)}</span>` : ''}</div>` : ''}
    </div>`;
    return o.go ? `<button class="card link ${o.cls || ''}" data-go="${o.go}">${inner}</button>` : `<div class="card ${o.cls || ''}">${inner}</div>`;
  };

  ui.avatar = (name, cls = '', color = null) => {
    const palette = ['#CDF4E5', '#DCE6EE', '#E6E1FA', '#FDF1DC', '#E5EEFC', '#FBE7E5'];
    const n = String(tx(name));
    const c = color || palette[(n.charCodeAt(0) + n.length) % palette.length];
    return `<span class="avatar ${cls}" style="background:${c}">${esc(B.initials(name))}</span>`;
  };

  /** li({icon, tone, avatar, title, sub, end, go, act, arg, chev}) */
  ui.li = (o) => {
    const lead = o.avatar ? ui.avatar(o.avatar, o.avatarCls || '') : o.icon ? `<span class="li-icon ${o.tone || ''}">${icon(o.icon)}</span>` : o.lead || '';
    const attrs = o.go ? `data-go="${o.go}"` : o.act ? `data-act="${o.act}" data-arg="${esc(o.arg ?? '')}"` : '';
    const tag = attrs ? 'button' : 'div';
    return `<${tag} class="li" ${attrs}>${lead}<div class="li-body"><div class="li-title">${tx(o.title)}</div>${o.sub ? `<div class="li-sub">${tx(o.sub)}</div>` : ''}</div>
      ${o.end || attrs ? `<div class="li-end">${o.end || ''}${attrs && o.chev !== false && !o.end ? icon('chevR', 'chev flip') : ''}</div>` : ''}</${tag}>`;
  };
  ui.list = (items, cls = '') => `<div class="list ${cls}">${items.join('')}</div>`;

  ui.empty = ({ icon: ic = 'inbox', title, text = '', action = '' }) => `<div class="empty"><div class="e-icon">${icon(ic)}</div><h3>${tx(title)}</h3>${text ? `<p>${tx(text)}</p>` : ''}${action}</div>`;
  ui.callout = (text, tone = '', ic = 'info') => `<div class="callout ${tone}">${icon(ic)}<div>${text}</div></div>`;
  ui.kv = (pairs) => `<div class="kv-list">${pairs.filter(Boolean).map(([k, v]) => `<div class="kv"><span>${tx(k)}</span><span>${v}</span></div>`).join('')}</div>`;
  ui.kvGrid = (pairs) => `<div class="kv-grid">${pairs.filter(Boolean).map(([k, v]) => `<div class="kv-cell"><div class="l">${tx(k)}</div><div class="v">${v}</div></div>`).join('')}</div>`;
  ui.progress = (pct, tone = '', cls = '') => `<div class="progress ${tone} ${cls}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`;
  ui.meter = (label, value, pct, tone = '') => `<div class="meter-row"><div class="mr-top"><span class="muted">${tx(label)}</span><b>${value}</b></div>${ui.progress(pct, tone)}</div>`;
  ui.stars = (n) => `<span class="stars" aria-label="${n} / 5">${[1, 2, 3, 4, 5].map((i) => icon('star', i <= Math.round(n) ? '' : 'off')).join('')}</span>`;
  ui.idMono = (s) => `<span class="id-mono">${esc(s)}</span>`;
  ui.demoNote = (text) => `<div class="callout dashed small">${icon('info')}<div>${text || L('All names, buildings and figures on this screen are fictional demonstration data.', 'جميع الأسماء والمباني والأرقام في هذه الشاشة بيانات تجريبية وهمية.')}</div></div>`;
  ui.simRibbon = (text) => `<div class="sim-ribbon">${icon('activity')}<span>${text || L('Simulated preview — not a live integration. Readings are generated sample data.', 'معاينة محاكاة — ليست تكاملاً حياً. القراءات بيانات نموذجية.')}</span></div>`;

  ui.timeline = (items) => `<div class="timeline">${items.map((i) => `
    <div class="tl-item ${i.state || ''}"><div class="tl-dot">${icon(i.icon || (i.state === 'done' ? 'check' : i.state === 'current' ? 'clock' : 'minus'))}</div>
      <div><div class="tl-title">${tx(i.title)}</div>${i.meta ? `<div class="tl-meta">${tx(i.meta)}</div>` : ''}${i.body ? `<div class="tl-body">${tx(i.body)}</div>` : ''}</div></div>`).join('')}</div>`;

  ui.stepper = (steps, current) => `<div class="stepper">${steps.map((s, i) => `<div class="st ${i < current ? 'done' : i === current ? 'current' : ''}"><i></i><span>${tx(s)}</span></div>`).join('')}</div>`;

  /* ---------------- controls ---------------- */
  /** tabs(stateKey, [{id,label,icon,count}], current) */
  ui.tabs = (key, items, current) => `<div class="tabs" role="tablist">${items.map((t) => `<button class="t ${t.id === current ? 'active' : ''}" role="tab" aria-selected="${t.id === current}" data-act="set" data-arg="${key}=${t.id}">${t.icon ? icon(t.icon) : ''}${tx(t.label)}${t.count != null ? `<span class="c">${t.count}</span>` : ''}</button>`).join('')}</div>`;
  ui.seg = (key, items, current) => `<div class="seg">${items.map((t) => `<button class="${t.id === current ? 'active' : ''}" data-act="set" data-arg="${key}=${t.id}">${t.icon ? icon(t.icon) : ''}${t.label ? `<span>${tx(t.label)}</span>` : ''}</button>`).join('')}</div>`;
  ui.chips = (key, items, current, resetKey = '') => `<div class="chips">${items.map((t) => `<button class="chip ${String(t.id) === String(current) ? 'active' : ''}" data-act="set" data-arg="${key}=${t.id}">${t.icon ? icon(t.icon) : ''}${tx(t.label)}${t.count != null ? `<span class="c">${t.count}</span>` : ''}</button>`).join('')}</div>`;
  /** search input bound to view-state key (id is required for focus restore) */
  ui.search = (key, placeholder, opts = {}) => `<div class="input-icon">${icon('search')}<input class="input" type="search" id="f-${key.replace(/[^a-z0-9]/gi, '')}" data-model="${key}" ${opts.reset ? `data-reset="${opts.reset}"` : ''} value="${esc(B.get(key, ''))}" placeholder="${esc(tx(placeholder))}" autocomplete="off"></div>`;
  /** select bound to view-state key: options [{v, l}] */
  ui.select = (key, options, opts = {}) => {
    const cur = B.get(key, opts.def ?? options[0]?.v);
    return `<select class="select" id="f-${key.replace(/[^a-z0-9]/gi, '')}" data-model="${key}" ${opts.reset ? `data-reset="${opts.reset}"` : ''} aria-label="${esc(tx(opts.label || ''))}">${options.map((o) => `<option value="${esc(o.v)}" ${String(o.v) === String(cur) ? 'selected' : ''}>${tx(o.l)}</option>`).join('')}</select>`;
  };

  /** Form field (unbound; read via FormData on submit).
   *  field({name, label, type:'text'|'textarea'|'select'|'date'|'number'|'file'|'radio'|'tel'|'email', value, placeholder, options:[{v,l}], hint, full, required}) */
  ui.field = (o) => {
    const id = 'fld-' + o.name;
    let ctl;
    if (o.type === 'textarea') ctl = `<textarea class="textarea" id="${id}" name="${o.name}" placeholder="${esc(tx(o.placeholder || ''))}" ${o.required ? 'required' : ''}>${esc(tx(o.value || ''))}</textarea>`;
    else if (o.type === 'select') ctl = `<select class="select" id="${id}" name="${o.name}" ${o.required ? 'required' : ''}>${(o.options || []).map((op) => `<option value="${esc(op.v)}" ${String(op.v) === String(o.value) ? 'selected' : ''}>${tx(op.l)}</option>`).join('')}</select>`;
    else if (o.type === 'radio') ctl = `<div class="radio-cards">${(o.options || []).map((op, i) => `<label class="radio-card"><input type="radio" name="${o.name}" value="${esc(op.v)}" ${(o.value ? String(op.v) === String(o.value) : i === 0) ? 'checked' : ''}>${op.icon ? icon(op.icon) : ''}<b>${tx(op.l)}</b>${op.d ? `<span>${tx(op.d)}</span>` : ''}</label>`).join('')}</div>`;
    else if (o.type === 'file') ctl = `<label class="callout dashed" style="cursor:pointer;justify-content:center;text-align:center">${icon('upload')}<div><b style="color:var(--ink)">${L('Attach files', 'إرفاق ملفات')}</b><div class="xs">${tx(o.placeholder || L('PDF, JPG or PNG — up to 10 MB (demo)', 'PDF أو JPG أو PNG — حتى 10 ميغابايت (تجريبي)'))}</div></div><input type="file" name="${o.name}" id="${id}" class="sr-only" multiple></label>`;
    else ctl = `<input class="input" id="${id}" name="${o.name}" type="${o.type || 'text'}" value="${esc(tx(o.value ?? ''))}" placeholder="${esc(tx(o.placeholder || ''))}" ${o.required ? 'required' : ''} ${o.min != null ? `min="${o.min}"` : ''}>`;
    return `<div class="field ${o.full ? 'full' : ''}">${o.label ? `<label for="${id}">${tx(o.label)}</label>` : ''}${ctl}${o.hint ? `<span class="hint">${tx(o.hint)}</span>` : ''}</div>`;
  };

  /** pager(stateKey, total, pageSize) */
  ui.pager = (key, total, size) => {
    const pages = Math.max(1, Math.ceil(total / size));
    const cur = Math.min(B.get(key, 0), pages - 1);
    const from = total ? cur * size + 1 : 0, to = Math.min(total, (cur + 1) * size);
    const nums = [];
    for (let i = 0; i < pages; i++) if (i === 0 || i === pages - 1 || Math.abs(i - cur) <= 1) nums.push(i); else if (nums[nums.length - 1] !== '…') nums.push('…');
    return `<div class="pager"><span>${L(`Showing ${from}–${to} of ${total}`, `عرض ${from}–${to} من ${total}`)}</span><div class="pg">
      <button data-act="set" data-arg="${key}=${cur - 1}" ${cur === 0 ? 'disabled' : ''} aria-label="prev">${icon('chevL', 'flip')}</button>
      ${nums.map((n) => (n === '…' ? '<button disabled>…</button>' : `<button class="${n === cur ? 'active' : ''}" data-act="set" data-arg="${key}=${n}">${n + 1}</button>`)).join('')}
      <button data-act="set" data-arg="${key}=${cur + 1}" ${cur >= pages - 1 ? 'disabled' : ''} aria-label="next">${icon('chevR', 'flip')}</button></div></div>`;
  };

  /**
   * Responsive table. On phones it becomes a card list.
   * table({ id, cols:[{key,label,render,sort,align:'end',m:'title'|'sub'|'meta'|'end'|'hide', w}], rows,
   *         rowGo:(r)=>route, rowAct:(r)=>({act,arg}), pageSize, empty:{title,text,icon} })
   * Sorting: column with `sort` (fn or true) gets clickable header; state key `${id}:sort`.
   */
  ui.table = (o) => {
    const sk = `${o.id}:sort`, pk = `${o.id}:page`;
    let rows = o.rows.slice();
    const sort = B.get(sk, o.defaultSort || '');
    if (sort) {
      const desc = sort.startsWith('-');
      const key = desc ? sort.slice(1) : sort;
      const col = o.cols.find((c) => c.key === key);
      if (col) { const f = typeof col.sort === 'function' ? col.sort : (r) => { const v = r[key]; return typeof v === 'object' && v ? tx(v) : v; }; rows.sort(B.by(f, desc ? -1 : 1)); }
    }
    const total = rows.length;
    if (o.pageSize) { const p = Math.min(B.get(pk, 0), Math.max(0, Math.ceil(total / o.pageSize) - 1)); rows = rows.slice(p * o.pageSize, (p + 1) * o.pageSize); }
    const cell = (c, r) => (c.render ? c.render(r) : esc(tx(r[c.key])));
    const rowAttr = (r) => { if (o.rowGo) return `data-go="${o.rowGo(r)}"`; if (o.rowAct) { const a = o.rowAct(r); return `data-act="${a.act}" data-arg="${esc(a.arg)}"`; } return ''; };
    const clickable = o.rowGo || o.rowAct ? 'clickable' : '';
    if (!total) return `<div class="card pad-0">${ui.empty(o.empty || { icon: 'search', title: L('No results', 'لا توجد نتائج'), text: L('Try changing the filters or search terms.', 'جرّب تغيير عوامل التصفية أو كلمات البحث.') })}</div>`;
    const head = o.cols.map((c) => {
      if (!c.sort) return `<th class="${c.align === 'end' ? 't-end' : ''}" ${c.w ? `style="width:${c.w}"` : ''}>${tx(c.label)}</th>`;
      const on = sort === c.key || sort === '-' + c.key;
      const next = sort === c.key ? '-' + c.key : c.key;
      return `<th class="sortable ${on ? 'sorted' : ''} ${c.align === 'end' ? 't-end' : ''}" data-act="set" data-arg="${sk}=${next}">${tx(c.label)}${icon(on ? (sort.startsWith('-') ? 'arrowDown' : 'arrowUp') : 'sort', 'sort-i')}</th>`;
    }).join('');
    const desk = `<div class="table-wrap responsive"><table class="table"><thead><tr>${head}</tr></thead><tbody>${rows.map((r) => `<tr class="${clickable}" ${rowAttr(r)}>${o.cols.map((c) => `<td class="${c.align === 'end' ? 't-end' : ''}">${cell(c, r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    const tCol = o.cols.find((c) => c.m === 'title') || o.cols[0];
    const subs = o.cols.filter((c) => c.m === 'sub');
    const metas = o.cols.filter((c) => c.m === 'meta');
    const endC = o.cols.find((c) => c.m === 'end');
    const lead = o.mLead;
    const mob = `<div class="m-list">${rows.map((r) => `<div class="m-row ${clickable}" ${clickable ? 'role="button" tabindex="0"' : ''} ${rowAttr(r)}>${lead ? lead(r) : ''}<div class="m-body">
        <div class="m-title"><span>${tCol.mRender ? tCol.mRender(r) : cell(tCol, r)}</span>${endC ? `<span class="nowrap">${cell(endC, r)}</span>` : ''}</div>
        ${subs.map((c) => `<div class="m-sub">${cell(c, r)}</div>`).join('')}
        ${metas.length ? `<div class="m-meta">${metas.map((c) => `<span>${cell(c, r)}</span>`).join('')}</div>` : ''}
      </div></div>`).join('')}</div>`;
    return `<div class="card pad-0 ${o.cls || ''}">${desk}${mob}${o.pageSize ? ui.pager(pk, total, o.pageSize) : ''}</div>`;
  };

  /** Month calendar. events: [{date:'2026-11-28', label, tone:'mint'|'warn'|'info'|'bad'|'', act, arg}] */
  ui.calendar = ({ year, month, events = [] }) => {
    const first = new Date(year, month, 1);
    const start = new Date(year, month, 1 - first.getDay());
    const todayKey = B.today.toISOString().slice(0, 10);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const evs = events.filter((e) => e.date === key);
      cells.push(`<div class="day ${d.getMonth() !== month ? 'out' : ''} ${key === todayKey ? 'today' : ''}"><span class="dn">${d.getDate()}</span>${evs.slice(0, 3).map((e) => `<button class="ev ${e.tone || ''}" ${e.act ? `data-act="${e.act}" data-arg="${esc(e.arg ?? '')}"` : ''} title="${esc(tx(e.label))}">${tx(e.label)}</button>`).join('')}${evs.length > 3 ? `<span class="xs faint">+${evs.length - 3}</span>` : ''}</div>`);
      if (i >= 34 && d.getMonth() !== month && d.getDay() === 6) break;
    }
    return `<div class="cal">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<div class="dow">${B.dow(i)}</div>`).join('')}${cells.join('')}</div>`;
  };

  /** Document row */
  ui.doc = (d) => ui.li({ icon: d.icon || 'doc', tone: d.tone || '', title: `<bdi>${tx(d.name)}</bdi>`, sub: d.sub || `${d.type || 'PDF'} · ${d.size || '1.2 MB'} · ${B.date(d.date)}`, act: 'previewDoc', arg: tx(d.name), end: icon('download', 'chev') });
  B.act.previewDoc = (name) => B.modal({
    title: esc(name), sub: L('Document preview (sample)', 'معاينة المستند (نموذج)'), size: 'md',
    body: `<div style="border:1px solid var(--line);border-radius:14px;padding:24px;background:var(--surface-2)"><div class="row between" style="margin-bottom:18px"><div class="brand dark">${B.logo(26)}<span>BENA</span></div><span class="badge">${L('Sample', 'نموذج')}</span></div>
      <div style="display:flex;flex-direction:column;gap:9px">${[92, 100, 76, 88, 64, 95, 40].map((w) => `<i style="display:block;height:9px;border-radius:5px;background:#DDE5E2;width:${w}%"></i>`).join('')}</div>
      <div class="row between" style="margin-top:26px"><span class="xs faint">${esc(name)}</span><span class="xs faint">1 / 3</span></div></div>`,
    foot: `${ui.btn(L('Share', 'مشاركة'), { icon: 'share', act: 'soon', arg: L('Sharing', 'المشاركة') })}${ui.btn(L('Download', 'تنزيل'), { icon: 'download', kind: 'primary', act: 'soon', arg: L('Download', 'التنزيل') })}`,
  });
})();
