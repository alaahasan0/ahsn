/*
 * BENA core runtime — namespace, i18n (EN / AR + RTL), formatting, router,
 * event delegation, view state, modals and toasts.
 * Classic script (no modules) so the whole app can be bundled into one file.
 * Everything is frontend-only demo behaviour; nothing is persisted except
 * the chosen language and last role (per browser, best-effort).
 */
(function () {
  'use strict';
  const B = (window.B = window.B || {});

  /* ---------------- storage (best effort) ---------------- */
  B.store = {
    get(k, d) { try { const v = localStorage.getItem('bena:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('bena:' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };

  /* ---------------- i18n ---------------- */
  B.lang = B.store.get('lang', 'en') === 'ar' ? 'ar' : 'en';
  B.isAr = () => B.lang === 'ar';
  /** Inline bilingual string: L('Units', 'الوحدات') */
  B.L = (en, ar) => (B.lang === 'ar' && ar != null ? ar : en);
  /** Pick from {en, ar} object (or pass a plain string through). */
  B.tx = (o) => (o == null ? '' : typeof o === 'object' ? (B.lang === 'ar' ? o.ar ?? o.en : o.en ?? o.ar) ?? '' : String(o));
  B.applyLang = () => {
    document.documentElement.lang = B.lang;
    document.documentElement.dir = B.lang === 'ar' ? 'rtl' : 'ltr';
  };
  B.setLang = (l) => { B.lang = l; B.store.set('lang', l); B.applyLang(); B.render({ keepScroll: true }); };
  B.toggleLang = () => B.setLang(B.lang === 'ar' ? 'en' : 'ar');

  /* ---------------- escaping & formatting ---------------- */
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  B.esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

  B.today = new Date('2026-11-25T10:00:00');
  const nf = new Intl.NumberFormat('en-US');
  const nf1 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
  B.num = (n) => nf.format(Math.round(n));
  B.num1 = (n) => nf1.format(n);
  B.pct = (n, d = 0) => (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)) + '%';
  B.compact = (n) => (Math.abs(n) >= 1e6 ? nf1.format(n / 1e6) + 'M' : Math.abs(n) >= 1e4 ? nf1.format(n / 1e3) + 'K' : nf.format(n));
  /** Money in shekels by default. cur: 'ILS' | 'USD' | 'JOD' */
  B.money = (n, cur = 'ILS') => {
    const sym = { ILS: '₪', USD: '$', JOD: 'JD' }[cur] || cur;
    const v = nf.format(Math.round(n));
    return B.lang === 'ar' ? `${v} ${sym}` : cur === 'JOD' ? `${v} ${sym}` : `${sym}${v}`;
  };
  const MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MON_EN_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  /* Levantine month names, as used in Palestine */
  const MON_AR = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
  const MON_AR_SHORT = ['ك٢', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'ت١', 'ت٢', 'ك١'];
  const DOW_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DOW_AR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  B.mon = (i) => (B.lang === 'ar' ? MON_AR_SHORT[i] : MON_EN[i]);
  B.monLong = (i) => (B.lang === 'ar' ? MON_AR[i] : MON_EN_LONG[i]);
  B.dow = (i) => (B.lang === 'ar' ? DOW_AR[i] : DOW_EN[i]);
  const toD = (d) => (d instanceof Date ? d : new Date(String(d).length <= 10 ? d + 'T12:00:00' : d));
  B.date = (d) => { if (!d) return '—'; const x = toD(d); return B.lang === 'ar' ? `${x.getDate()} ${MON_AR[x.getMonth()]} ${x.getFullYear()}` : `${x.getDate()} ${MON_EN[x.getMonth()]} ${x.getFullYear()}`; };
  B.dateShort = (d) => { if (!d) return '—'; const x = toD(d); return B.lang === 'ar' ? `${x.getDate()} ${MON_AR[x.getMonth()]}` : `${x.getDate()} ${MON_EN[x.getMonth()]}`; };
  B.monthYear = (d) => { const x = toD(d); return `${B.monLong(x.getMonth())} ${x.getFullYear()}`; };
  B.time = (t) => t; // '09:30'
  B.daysBetween = (a, b) => Math.round((toD(b) - toD(a)) / 86400000);
  B.daysFromToday = (d) => B.daysBetween(B.today, d);
  B.ago = (d) => {
    const n = -B.daysFromToday(d);
    if (n <= 0) return B.L('Today', 'اليوم');
    if (n === 1) return B.L('Yesterday', 'أمس');
    if (n < 7) return B.L(`${n} days ago`, `قبل ${n} أيام`);
    if (n < 30) { const w = Math.round(n / 7); return B.L(`${w} wk ago`, `قبل ${w} أسبوع`); }
    return B.date(d);
  };
  B.inDays = (d) => {
    const n = B.daysFromToday(d);
    if (n === 0) return B.L('Today', 'اليوم');
    if (n === 1) return B.L('Tomorrow', 'غداً');
    if (n > 0) return B.L(`in ${n} days`, `خلال ${n} يوم`);
    return B.L(`${-n} days overdue`, `متأخر ${-n} يوم`);
  };
  B.initials = (name) => String(B.tx(name)).replace(/^(Eng\.|Dr\.|م\.|د\.)\s*/, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  /* deterministic random for generated demo data */
  B.rng = (seed) => { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  B.pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length];
  B.uid = (p = 'REQ') => `${p}-${String(Date.now()).slice(-6)}`;
  B.by = (k, dir = 1) => (a, b) => { const x = typeof k === 'function' ? k(a) : a[k]; const y = typeof k === 'function' ? k(b) : b[k]; return (x > y ? 1 : x < y ? -1 : 0) * dir; };
  B.sum = (arr, f = (x) => x) => arr.reduce((s, x) => s + (+f(x) || 0), 0);
  B.match = (q, ...fields) => { if (!q) return true; q = String(q).toLowerCase().trim(); return fields.some((f) => { if (f == null) return false; const s = typeof f === 'object' ? (f.en || '') + ' ' + (f.ar || '') : String(f); return s.toLowerCase().includes(q); }); };

  /* ---------------- view state ---------------- */
  /** Per-session UI state (filters, tabs, selections). Reset on reload. */
  B.vs = {};
  B.get = (k, d) => (k in B.vs ? B.vs[k] : d);
  B.set = (k, v, rerender = true) => { B.vs[k] = v; if (rerender) B.refresh(); };

  /* ---------------- roles & routing ---------------- */
  B.roles = {};
  B.roleOrder = [];
  /** Register a role experience. See README for shape. */
  B.role = (def) => { if (!B.roles[def.id]) B.roleOrder.push(def.id); B.roles[def.id] = def; return def; };
  /** Shared pages reachable from any role: B.shared.building(id) etc. */
  B.shared = B.shared || {};
  /** Mobile app roles (see js/mobile/shell.js): B.mrole(def). */
  B.mroles = B.mroles || {};
  B.mroleOrder = B.mroleOrder || [];
  B.mrole = (def) => { if (!B.mroles[def.id]) B.mroleOrder.push(def.id); B.mroles[def.id] = def; return def; };
  /** Experience renderers: B.exp.hub / B.exp.site / B.exp.mobile / B.exp.app (route) → html */
  B.exp = B.exp || {};

  /*
   * Routes (plain hash names so links survive any host):
   *   #hub                         demo launcher (default; legacy #welcome maps here)
   *   #site[-page[-id]]            public website
   *   #m-<role>[-screen[-id]]      mobile application
   *   #<role>[-page[-id]]          enterprise web application (existing routes)
   */
  const HOME = { exp: 'hub', role: null, page: null, id: null };
  B.route = { ...HOME };
  B.parse = (hash) => {
    const h = String(hash || '').replace(/^#/, '');
    if (!h || h === 'welcome' || h === 'hub') return { ...HOME };
    const p = h.split('-');
    if (p[0] === 'site') return { exp: 'site', role: null, page: p[1] || 'home', id: p.length > 2 ? p.slice(2).join('-') : null };
    if (p[0] === 'm') {
      const mr = B.mroles[p[1]];
      if (!mr) return { exp: 'mobile', role: null, page: null, id: null };
      return { exp: 'mobile', role: p[1], page: p[2] || mr.home || 'home', id: p.length > 3 ? p.slice(3).join('-') : null };
    }
    const role = p[0];
    if (!B.roles[role]) return { ...HOME };
    return { exp: 'app', role, page: p[1] || B.roles[role].home || 'home', id: p.length > 2 ? p.slice(2).join('-') : null };
  };
  B.hashOf = (r) => {
    if (r.exp === 'site') return ['site', r.page !== 'home' ? r.page : null, r.id].filter(Boolean).join('-');
    if (r.exp === 'mobile') return ['m', r.role, r.page, r.id].filter(Boolean).join('-');
    if (r.exp === 'app') return [r.role, r.page, r.id].filter(Boolean).join('-');
    return 'hub';
  };
  /** Absolute target if it starts with hub/welcome/site/m/<role>; otherwise relative to the current experience. */
  B.resolve = (target) => {
    const t = String(target || '');
    if (!t || t === 'welcome' || t === 'hub') return { ...HOME };
    const first = t.split('-')[0];
    if (first === 'site' || first === 'm' || B.roles[first]) return B.parse(t);
    const r = B.route;
    if (r.exp === 'site') return B.parse(`site-${t}`);
    if (r.exp === 'mobile') return B.parse(`m-${r.role}-${t}`);
    if (r.exp === 'app') return B.parse(`${r.role}-${t}`);
    return B.parse(t);
  };
  /** Navigate. Accepts absolute routes ('site-vision', 'm-resident-home', 'owner-leases') or relative ('leases'). */
  B.go = (target) => {
    const r = B.resolve(target);
    const h = B.hashOf(r);
    B._navigating = true;
    try {
      if (location.hash.replace(/^#/, '') !== h) location.hash = h; else B._navigating = false;
    } catch (e) { B._navigating = false; }
    B.route = r;
    if (r.exp === 'app' && r.role) B.store.set('role', r.role);
    B.closeModal(true);
    B.render({ keepScroll: false, animate: true });
  };
  B.back = () => { try { history.back(); } catch (e) { B.go('hub'); } };
  window.addEventListener('hashchange', () => {
    if (B._navigating) { B._navigating = false; return; }
    const r = B.parse(location.hash);
    B.route = r;
    B.closeModal(true);
    B.render({ keepScroll: false, animate: true });
  });

  /* Title override for the current page (set during page render). */
  B.title = (t, sub) => { B._title = t; B._sub = sub; };
  B.navActive = (id) => { B._navActive = id; };

  const after = [];
  /** Run fn after the current render is in the DOM (bind maps etc). */
  B.afterRender = (fn) => after.push(fn);

  B.render = ({ keepScroll = true, animate = false } = {}) => {
    const root = document.getElementById('app');
    const y = window.scrollY;
    B._title = null; B._sub = null; B._navActive = null;
    after.length = 0;
    let markup;
    try {
      const r = B.route;
      document.documentElement.dataset.exp = r.exp;
      if (r.exp === 'app') markup = B.shell.render(r);
      else if (r.exp === 'site' && B.exp.site) markup = B.exp.site(r);
      else if (r.exp === 'mobile' && B.exp.mobile) markup = B.exp.mobile(r);
      else markup = (B.exp.hub || B.welcome)(r);
    } catch (err) {
      console.error(err);
      markup = `<div style="padding:40px;font-family:system-ui"><h2>Something went wrong rendering this screen.</h2><p>${B.esc(err.message)}</p><p><a href="#hub" style="color:#0B8A60">Back to start</a></p></div>`;
    }
    root.innerHTML = markup;
    document.body.classList.toggle('has-tabbar', !!root.querySelector('.tabbar'));
    if (animate) { const v = root.querySelector('.view'); if (v) v.classList.add('view-enter'); }
    after.splice(0).forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
    (B.afterRenderGlobal || []).forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
    window.scrollTo(0, keepScroll ? y : 0);
    onScroll();
  };
  /** Re-render the current screen keeping scroll and input focus. */
  B.refresh = () => {
    const a = document.activeElement;
    const id = a && a.id;
    let s = null, e = null;
    try { s = a.selectionStart; e = a.selectionEnd; } catch (err) { /* not a text input */ }
    B.render({ keepScroll: true });
    if (id) {
      const el = document.getElementById(id);
      if (el) { el.focus({ preventScroll: true }); try { if (s != null) el.setSelectionRange(s, e); } catch (err) { /* ignore */ } }
    }
  };

  function onScroll() {
    const s = window.scrollY > 4;
    document.querySelectorAll('.topbar, .mbar').forEach((el) => el.classList.toggle('scrolled', s));
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- actions & events ---------------- */
  B.act = B.act || {};
  B.submit = B.submit || {};

  document.addEventListener('click', (ev) => {
    const t = ev.target;
    const go = t.closest('[data-go]');
    if (go && !t.closest('[data-stop]')) { ev.preventDefault(); B.go(go.dataset.go); return; }
    const a = t.closest('[data-act]');
    if (a) {
      const fn = B.act[a.dataset.act];
      if (fn) { ev.preventDefault(); fn(a.dataset.arg, a, ev); }
      else console.warn('No action', a.dataset.act);
      return;
    }
    if (t.classList && t.classList.contains('scrim')) B.closeModal();
    if (!t.closest('.menu') && !t.closest('[data-menu]')) closeMenu();
  });
  const onModel = (ev) => {
    const el = ev.target.closest('[data-model]');
    if (!el) return;
    const key = el.dataset.model;
    const v = el.type === 'checkbox' ? el.checked : el.value;
    B.vs[key] = v;
    if (el.dataset.reset) el.dataset.reset.split(',').forEach((k) => { B.vs[k] = 0; });
    if (el.dataset.norender == null) B.refresh();
  };
  document.addEventListener('input', (ev) => { if (ev.target.matches('input[type=text],input[type=search],input:not([type]),textarea')) onModel(ev); });
  document.addEventListener('change', (ev) => { if (!ev.target.matches('input[type=text],input[type=search],input:not([type]),textarea')) onModel(ev); });
  document.addEventListener('submit', (ev) => {
    const f = ev.target.closest('form[data-submit]');
    if (!f) return;
    ev.preventDefault();
    const fn = B.submit[f.dataset.submit];
    const data = Object.fromEntries(new FormData(f).entries());
    if (fn) fn(data, f); else B.success({ title: B.L('Submitted', 'تم الإرسال') });
  });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { B.closeModal(); closeMenu(); } });

  /* Built-in actions */
  B.act.go = (arg) => B.go(arg);
  B.act.back = () => B.back();
  B.act.lang = () => B.toggleLang();
  B.act.closeModal = () => B.closeModal();
  B.act.set = (arg) => { const [k, ...v] = String(arg).split('='); const val = v.join('='); B.set(k, val === 'true' ? true : val === 'false' ? false : /^-?\d+$/.test(val) ? +val : val); };
  B.act.toggle = (k) => B.set(k, !B.get(k, false));
  B.act.toast = (msg) => B.toast(msg);
  B.act.soon = (label) => B.toast(B.L(`${label || 'This action'} is simulated in the demo`, `${label || 'هذا الإجراء'} محاكاة في النسخة التجريبية`), 'info');

  /* ---------------- modal / sheet ---------------- */
  let modalEl = null;
  /**
   * B.modal({ title, sub, body, foot, size: 'sm'|'md'|'lg', form: 'submitName' })
   * foot: HTML string for footer buttons. If form is set, body+foot are wrapped
   * in <form data-submit=form> so a type=submit button submits it.
   */
  B.modal = ({ title = '', sub = '', body = '', foot = '', size = 'md', form = null } = {}) => {
    B.closeModal(true);
    const wrap = document.createElement('div');
    wrap.className = 'scrim';
    const inner = `
      <div class="modal-head"><div class="grow"><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div>
        <button class="icon-btn" data-act="closeModal" aria-label="${B.L('Close', 'إغلاق')}">${B.icon('x')}</button></div>
      <div class="modal-body">${body}</div>
      ${foot ? `<div class="modal-foot">${foot}</div>` : ''}`;
    wrap.innerHTML = `<div class="modal ${size}" role="dialog" aria-modal="true"><div class="grabber"></div>${form ? `<form data-submit="${form}" style="display:contents">${inner}</form>` : inner}</div>`;
    document.body.appendChild(wrap);
    document.body.style.overflow = 'hidden';
    modalEl = wrap;
    const first = wrap.querySelector('input:not([type=hidden]),select,textarea');
    if (first && window.matchMedia('(min-width: 768px)').matches) setTimeout(() => first.focus(), 60);
    return wrap;
  };
  B.closeModal = (instant) => {
    if (!modalEl) return;
    const m = modalEl; modalEl = null;
    document.body.style.overflow = '';
    if (instant) m.remove(); else { m.style.transition = 'opacity .18s'; m.style.opacity = '0'; setTimeout(() => m.remove(), 180); }
  };
  /** Replace the open modal (or open one) with a success confirmation. */
  B.success = ({ title, text = '', ref = '', done = null, doneLabel = null } = {}) => {
    const body = `<div class="success-state"><div class="s-icon">${B.icon('check')}</div><h3>${title}</h3>${text ? `<p>${text}</p>` : ''}
      ${ref ? `<div class="ref-box"><span class="muted">${B.L('Reference', 'المرجع')}</span><b class="id-mono">${B.esc(ref)}</b></div>` : ''}
      <div class="xs faint" style="margin-top:6px">${B.L('Demo only — nothing was sent or saved.', 'نسخة تجريبية — لم يتم إرسال أو حفظ أي بيانات.')}</div></div>`;
    const foot = `<button class="btn btn-primary btn-block" ${done ? `data-go="${done}"` : 'data-act="closeModal"'}>${doneLabel || B.L('Done', 'تم')}</button>`;
    if (modalEl) {
      const m = modalEl.querySelector('.modal');
      m.className = 'modal sm';
      m.innerHTML = `<div class="grabber"></div><div class="modal-body" style="padding-top:22px">${body}</div><div class="modal-foot">${foot}</div>`;
    } else B.modal({ body, foot, size: 'sm' });
  };
  /** In-page confirmation (native confirm() is not used). */
  B.confirm = ({ title, text = '', ok = B.L('Confirm', 'تأكيد'), danger = false, onOk }) => {
    B._confirmOk = onOk;
    B.modal({ title, sub: text, size: 'sm', foot: `<button class="btn btn-ghost" data-act="closeModal">${B.L('Cancel', 'إلغاء')}</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-act="_confirm">${ok}</button>` });
  };
  B.act._confirm = () => { const f = B._confirmOk; B._confirmOk = null; if (f) f(); };

  /* ---------------- toast ---------------- */
  B.toast = (msg, icon = 'check') => {
    let box = document.querySelector('.toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `${B.icon(icon === 'info' ? 'info' : icon)}<span>${msg}</span>`;
    box.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 260); }, 2600);
  };

  /* ---------------- popover menu ---------------- */
  let menuEl = null;
  function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
  /** B.menu(anchorEl, [{label, icon, act, arg, go}]) */
  B.menu = (anchor, items) => {
    closeMenu();
    const r = anchor.getBoundingClientRect();
    const m = document.createElement('div');
    m.className = 'menu';
    m.innerHTML = items.map((i) => `<button ${i.go ? `data-go="${i.go}"` : `data-act="${i.act}" data-arg="${B.esc(i.arg ?? '')}"`}>${B.icon(i.icon || 'chevR')}<span>${i.label}</span></button>`).join('');
    document.body.appendChild(m);
    const w = m.offsetWidth;
    let left = B.isAr() ? r.left : r.right - w;
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    m.style.left = left + 'px';
    m.style.top = Math.min(r.bottom + 6, window.innerHeight - m.offsetHeight - 8) + 'px';
    menuEl = m;
    m.addEventListener('click', () => setTimeout(closeMenu, 0));
  };

  /** Inject extra CSS once (role files use this instead of editing bena.css). */
  B.css = (text) => { const st = document.createElement('style'); st.textContent = text; document.head.appendChild(st); };

  /* ---------------- boot ---------------- */
  B.boot = () => {
    B.applyLang();
    B.route = B.parse(location.hash);
    B.render({ animate: true, keepScroll: false });
  };
})();
