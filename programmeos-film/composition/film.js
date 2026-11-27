/*
 * ProgrammeOS product film: frame-accurate composition engine and scenes.
 *
 * Rules this file follows (see docs/production-notes.md):
 *  - Every interface image is a real capture of the ProgrammeOS app from ../footage/. Nothing here
 *    redraws, edits or generates app UI. Screens are only placed, cropped, scaled and transitioned.
 *  - Overlays added by the edit (tap indicators, connecting lines, labels, titles) sit outside the
 *    captured pixels or on top of them, and are listed in the production notes.
 *  - The scene-01 "fragments" are generic illustrations of disconnected tools, not ProgrammeOS UI.
 *
 * window.renderFrame(t) draws the frame at time t in seconds and resolves once every image is decoded.
 * ?mode=vertical renders the 30-second 9:16 cut; ?t=SECONDS renders one frame for preview.
 */
'use strict';

const params = new URLSearchParams(location.search);
const MODE = params.get('mode') === 'vertical' ? 'vertical' : 'film';
const SW = MODE === 'film' ? 1920 : 1080;
const SH = MODE === 'film' ? 1080 : 1920;
const FPS = 24;
const HX = 440; // hero device x offset (film)
const TAP_DUR = 0.46, TAP_PEAK = TAP_DUR * 0.25; // tap indicator length and time to full press

const stage = document.getElementById('stage');
stage.style.width = SW + 'px';
stage.style.height = SH + 'px';
const scenesEl = document.getElementById('scenes');
const bgEl = document.getElementById('bg');

// ── Maths ────────────────────────────────────────────────────────────────────────────────
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  lin: (x) => x,
  inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  out: (x) => 1 - Math.pow(1 - x, 3),
  outQuint: (x) => 1 - Math.pow(1 - x, 5),
  outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  in: (x) => x * x * x,
  sine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
};
const P = (t, a, b, e = E.inOut) => e(clamp((t - a) / (b - a)));

// ── DOM ──────────────────────────────────────────────────────────────────────────────────
function h(tag, cls, parent, css, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (css) Object.assign(e.style, css);
  if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}
function placeEl(el, { x = 0, y = 0, z = 0, s = 1, rx = 0, ry = 0, rz = 0, op = 1, blur = 0, zi } = {}) {
  el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg) rotateX(${rx.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) scale(${s.toFixed(4)})`;
  el.style.opacity = clamp(op).toFixed(4);
  el.style.display = op <= 0.001 ? 'none' : 'block';
  el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
  if (zi != null) el.style.zIndex = zi;
}

// ── Image loading ────────────────────────────────────────────────────────────────────────
const pending = new Set();
function setSrc(img, src) {
  if (img._src === src) return;
  img._src = src;
  img.src = src;
  const p = img.decode().catch(() => {});
  pending.add(p);
  p.finally(() => pending.delete(p));
}

// ── Footage ──────────────────────────────────────────────────────────────────────────────
let COLORS = null;
const TAPS = {};
const S = (name) => ({ kind: 'still', name });
const Q = (name, start, o = {}) => ({ kind: 'seq', name, start, speed: o.speed || 1, from: o.from || 0, to: o.to });
function resolve(m, t) {
  if (m.kind === 'still') {
    const c = COLORS.stills[m.name];
    if (!c) throw new Error('missing still ' + m.name);
    return { src: `../footage/stills/${m.name}.png`, top: c[0], bot: c[1] };
  }
  const arr = COLORS.sequences[m.name];
  if (!arr) throw new Error('missing sequence ' + m.name);
  const last = m.to ?? arr.length - 1;
  const f = clamp(Math.floor((t - m.start) * FPS * m.speed + 1e-4) + m.from, m.from, last);
  return { src: `../footage/sequences/${m.name}/${String(f).padStart(4, '0')}.jpg`, top: arr[f][0], bot: arr[f][1] };
}
/** Colour for the strip under the captured viewport: the screen's own bottom edge, unless that edge is an accent element. */
function botColor(c) {
  const r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return (mx - mn) / Math.max(mx, 1) > 0.25 ? (mx < 90 ? '#0d0f13' : '#f5f6f7') : c;
}

// ── Device: a generic phone frame presenting a real capture (no status bar, no fake OS chrome) ──
class Device {
  constructor(parent, w) {
    this.w = w;
    const bez = Math.round(w * 0.034), top = Math.round(w * 0.12), bot = Math.round(w * 0.05), ch = (w * 844) / 390;
    const sh = top + ch + bot;
    Object.assign(this, { bez, top, bot, ch, sh, W: w + 2 * bez, H: sh + 2 * bez });
    this.root = h('div', 'dev', parent, { width: this.W + 'px', height: this.H + 'px', left: -this.W / 2 + 'px', top: -this.H / 2 + 'px', display: 'none' });
    this.frame = h('div', 'dev-frame', this.root, { borderRadius: w * 0.175 + 'px' });
    this.screen = h('div', 'dev-screen', this.frame, { left: bez + 'px', top: bez + 'px', width: w + 'px', height: sh + 'px', borderRadius: w * 0.14 + 'px' });
    this.layers = [0, 1, 2].map(() => {
      const L = h('div', 'dev-layer', this.screen, { display: 'none' });
      const img = h('img', '', L, { top: top + 'px', width: w + 'px', height: ch + 'px' });
      const b = h('div', '', L, { position: 'absolute', left: 0, right: 0, bottom: 0, height: bot + 'px' });
      const dim = h('div', '', L, { position: 'absolute', inset: 0, background: '#000', opacity: 0 });
      return { L, img, b, dim };
    });
    this.shade = h('div', '', this.screen, { position: 'absolute', inset: 0, background: '#000', opacity: 0, zIndex: 19 });
    h('div', 'dev-island', this.screen, { width: w * 0.29 + 'px', height: w * 0.082 + 'px', left: w * 0.355 + 'px', top: w * 0.03 + 'px', borderRadius: w * 0.05 + 'px' });
    this.tapEl = h('div', 'dev-tap', this.screen);
    this.glare = h('div', 'dev-glare', this.screen);
    this.visible = false;
  }
  place(o = {}) {
    placeEl(this.root, o);
    this.visible = (o.op ?? 1) > 0.001;
    this.glare.style.transform = `translateX(${((o.ry || 0) * 7 + (o.rz || 0) * 3).toFixed(1)}px)`;
  }
  hide() { this.place({ op: 0 }); }
  dim(v) { this.shade.style.opacity = clamp(v).toFixed(3); }
  /** segs: [{ at, media, tr: 'cut' | 'push' | 'fade', d }] */
  show(t, segs) {
    if (!this.visible) return;
    let i = 0;
    for (let k = 0; k < segs.length; k++) if (t >= segs[k].at) i = k;
    const cur = segs[i], tr = cur.tr || 'cut', d = cur.d ?? 0.55;
    const want = [];
    if (i > 0 && tr !== 'cut' && t < cur.at + d) {
      const p = E.inOut(clamp((t - cur.at) / d)), prev = segs[i - 1];
      if (tr === 'push') { want.push({ m: prev, x: -0.3 * p, dim: 0.22 * p }); want.push({ m: cur, x: 1 - p, shadow: true }); }
      else { want.push({ m: prev, x: 0 }); want.push({ m: cur, x: 0, op: p }); }
    } else want.push({ m: cur, x: 0 });
    const res = want.map((w) => ({ ...w, r: resolve(w.m.media, t) }));
    const used = new Set(), assign = [];
    res.forEach((w, k) => { const li = this.layers.findIndex((l, j) => !used.has(j) && l.img._src === w.r.src); if (li >= 0) { assign[k] = li; used.add(li); } });
    res.forEach((w, k) => { if (assign[k] == null) { const li = this.layers.findIndex((l, j) => !used.has(j)); assign[k] = li; used.add(li); } });
    this.layers.forEach((l, j) => { if (!used.has(j)) l.L.style.display = 'none'; });
    res.forEach((w, k) => {
      const l = this.layers[assign[k]];
      l.L.style.display = 'block';
      l.L.style.zIndex = k + 1;
      setSrc(l.img, w.r.src);
      l.L.style.background = w.r.top;
      l.b.style.background = botColor(w.r.bot);
      l.L.style.transform = `translateX(${(w.x * this.w).toFixed(2)}px)`;
      l.L.style.opacity = (w.op ?? 1).toFixed(4);
      l.dim.style.opacity = (w.dim || 0).toFixed(3);
      l.L.style.boxShadow = w.shadow ? '-24px 0 48px rgba(0,0,0,0.16)' : 'none';
    });
  }
  /** Tap indicator (edit overlay) at app coordinates (390×844 viewport); peak press at t0 + TAP_PEAK s. */
  tapAt(t, t0, x, y) {
    const p = (t - t0) / TAP_DUR, el = this.tapEl;
    if (p < 0 || p > 1) { el.style.display = 'none'; return; }
    const k = this.w / 390, sz = 50 * k * (0.62 + 0.7 * E.out(p));
    Object.assign(el.style, { display: 'block', width: sz + 'px', height: sz + 'px', left: x * k - sz / 2 + 'px', top: this.top + y * k - sz / 2 + 'px', opacity: (p < 0.25 ? p / 0.25 : 1 - (p - 0.25) / 0.75).toFixed(3) });
  }
}

/** A close-up: a rectangle of a real capture, enlarged and floated (pixels unchanged). */
class Crop {
  constructor(parent, name, [sx, sy, sw, sh], dw, radius = 48) {
    const k = dw / sw;
    this.w = dw;
    this.h = sh * k;
    this.root = h('div', 'crop', parent, { width: dw + 'px', height: this.h + 'px', left: -dw / 2 + 'px', top: -this.h / 2 + 'px', borderRadius: radius * k + 'px', display: 'none', background: '#fff' });
    this.img = h('img', '', this.root, { width: 1170 * k + 'px', height: 2532 * k + 'px', left: -sx * k + 'px', top: -sy * k + 'px' });
    this.src = `../footage/stills/${name}.png`;
  }
  place(o) {
    placeEl(this.root, o);
    if ((o.op ?? 1) > 0.001) setSrc(this.img, this.src);
  }
}

// ── Typography ───────────────────────────────────────────────────────────────────────────
function words(parent, text, cls, css) {
  const el = h('div', cls, parent, css);
  const spans = [];
  text.split(' ').forEach((w, i) => {
    if (i) el.appendChild(document.createTextNode(' '));
    spans.push(h('span', 'w', el, null, w));
  });
  return { el, spans };
}
function rv(el, t, tin, tout, o = {}) {
  const dur = o.dur ?? 0.95, dy = o.dy ?? 26, bl = o.blur ?? 10, od = o.outDur ?? 0.6;
  const p = E.outQuint(clamp((t - tin) / dur));
  const q = tout == null ? 0 : E.inOut(clamp((t - tout) / od));
  const op = p * (1 - q) * (o.op ?? 1);
  el.style.opacity = op.toFixed(4);
  el.style.visibility = op < 0.002 ? 'hidden' : 'visible';
  el.style.transform = `${o.base || ''} translateY(${((1 - p) * dy - q * dy * 0.5).toFixed(2)}px)`;
  const b = (1 - p) * bl + q * bl * 0.7;
  el.style.filter = b > 0.05 ? `blur(${b.toFixed(2)}px)` : 'none';
  return op;
}
function rvWords(spans, t, tin, tout, o = {}) {
  const st = o.stagger ?? 0.075;
  spans.forEach((s, i) => rv(s, t, tin + i * st, tout == null ? null : tout + i * 0.025, o));
}
/** Left-column title block: eyebrow + headline lines, vertically centred on cy. */
function column(root, o) {
  let size = o.size || 68;
  const x = o.x ?? 170, maxW = o.maxW ?? 900;
  const probe = o.lines.map((ln) => { const e = h('div', 'txt h1', root, { fontSize: size + 'px', visibility: 'hidden' }, ln); const w = e.offsetWidth; e.remove(); return w; });
  const widest = Math.max(...probe);
  if (widest > maxW) size = Math.floor((size * maxW) / widest);
  const lh = Math.round(size * 1.12), ebH = o.eyebrow ? 48 : 0;
  let y = (o.cy ?? SH / 2) - (ebH + o.lines.length * lh) / 2;
  const out = { lines: [], bottom: 0 };
  if (o.eyebrow) { out.eb = h('div', 'txt eyebrow', root, { left: x + 'px', top: y + 'px' }, o.eyebrow); y += ebH; }
  o.lines.forEach((ln, i) => {
    out.lines.push(words(root, ln, 'txt h1' + (o.dim && i > 0 ? ' dim' : ''), { left: x + 'px', top: y + 'px', fontSize: size + 'px' }));
    y += lh;
  });
  out.bottom = y;
  out.update = (t, tEb, tLines, tOut) => {
    if (out.eb) rv(out.eb, t, tEb, tOut, { dy: 14, blur: 6 });
    out.lines.forEach((L, i) => rvWords(L.spans, t, tLines[i], tOut));
  };
  return out;
}
/** Centred line of text. */
function centred(root, text, cls, css, cy) {
  const L = words(root, text, cls, css);
  L.el.style.left = (SW - L.el.offsetWidth) / 2 + 'px';
  L.el.style.top = cy - L.el.offsetHeight / 2 + 'px';
  return L;
}
/** Small labels under a row of devices. */
function labels(root, texts, xs, y) {
  return texts.map((tx, i) => {
    if (!tx) return null;
    const pill = typeof tx === 'object';
    const e = h('div', 'txt ' + (pill ? 'pill' : 'label'), root, {}, pill ? tx.pill : tx);
    e.style.left = xs[i] - e.offsetWidth / 2 + 'px';
    e.style.top = y - e.offsetHeight / 2 + 'px';
    return e;
  });
}

// ── ProgrammeOS brand: the app's own mark (src/components/brand/Logo.tsx) and wordmark ──────
let logoN = 0;
function logoSVG(size) {
  const id = 'pos' + logoN++;
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" style="display:block"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6F8DFB"/><stop offset="1" stop-color="#3D5FE0"/></linearGradient></defs><rect x="0" y="0" width="48" height="48" rx="13" fill="url(#${id})"/><path d="M14 31.5c3.2 3.4 7.6 5 12.2 4.2 6.1-1 10.4-6.6 9.6-12.7" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M34 16.5c-3.2-3.4-7.6-5-12.2-4.2-6.1 1-10.4 6.6-9.6 12.7" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="24" cy="24" r="4.6" fill="#FFFFFF"/><circle cx="35.6" cy="21.2" r="2.4" fill="#32B995"/></svg>`;
}
function lockup(root, { cx, cy, mark, size, gap }) {
  const m = h('div', 'txt', root, {}, logoSVG(mark));
  const wm = h('div', 'txt wordmark', root, { fontSize: size + 'px', lineHeight: '1' }, 'Programme<b>OS</b>');
  const sh = h('div', 'txt wordmark sheen', root, { fontSize: size + 'px', lineHeight: '1' }, 'ProgrammeOS');
  const ww = wm.offsetWidth, total = mark + gap + ww;
  const markX = cx - total / 2, wmX = markX + mark + gap;
  Object.assign(m.style, { left: markX + 'px', top: cy - mark / 2 + 'px' });
  for (const e of [wm, sh]) Object.assign(e.style, { left: wmX + 'px', top: cy - size * 0.5 + 'px' });
  return { m, wm, sh, markX, wmX, mark, total, cx, cy };
}
/** Drives a lockup reveal: mark resolves (tm), slides into place (tSlide), wordmark wipes in (tw), sheen (ts). */
function lockupAnim(L, t, { tm, tSlide, tw, ts, tout, outDur = 1.0, startCx }) {
  const pm = E.outQuint(clamp((t - tm) / 1.0));
  const mv = tSlide == null ? 1 : E.inOut(clamp((t - tSlide) / 1.05));
  const q = tout == null ? 0 : E.inOut(clamp((t - tout) / outDur));
  const finalCx = L.markX + L.mark / 2;
  const dx = lerp((startCx ?? finalCx) - finalCx, 0, mv);
  L.m.style.transform = `translateX(${dx.toFixed(2)}px) scale(${lerp(0.62, 1, pm).toFixed(4)})`;
  L.m.style.opacity = (pm * (1 - q)).toFixed(4);
  const mb = (1 - pm) * 18 + q * 8;
  L.m.style.filter = mb > 0.05 ? `blur(${mb.toFixed(2)}px)` : 'none';
  const pw = E.outQuint(clamp((t - tw) / 1.25));
  const wipe = lerp(-20, 100, E.inOut(clamp((t - tw + 0.1) / 1.15)));
  const mask = `linear-gradient(90deg, #000 ${wipe.toFixed(1)}%, rgba(0,0,0,0) ${(wipe + 20).toFixed(1)}%)`;
  for (const e of [L.wm, L.sh]) {
    e.style.webkitMaskImage = e.style.maskImage = pw >= 1 && wipe >= 100 ? 'none' : mask;
    e.style.transform = `translateX(${((1 - pw) * -34).toFixed(2)}px)`;
    const b = (1 - pw) * 12 + q * 8;
    e.style.filter = b > 0.05 ? `blur(${b.toFixed(2)}px)` : 'none';
  }
  L.wm.style.opacity = (pw * (1 - q)).toFixed(4);
  const sp = clamp((t - ts) / 1.5);
  L.sh.style.opacity = sp > 0 && sp < 1 ? (Math.sin(Math.PI * sp) * (1 - q)).toFixed(3) : '0';
  L.sh.style.backgroundPosition = `${lerp(100, 0, E.inOut(sp)).toFixed(2)}% 0`;
}

// ── Scene 01 fragments: generic illustrations of disconnected tools (not ProgrammeOS UI) ───
const ICON = {
  sheet: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12Z"/></svg>',
  doc: '<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  note: '<svg viewBox="0 0 24 24"><path d="M5 3h14v12l-6 6H5z"/><path d="M13 21v-6h6"/></svg>',
};
const FRAGS = [
  { icon: 'sheet', tint: 'rgba(50,185,149,0.16)', color: '#5fd0ae', title: 'ELP_rooming_list_v7_FINAL(2).xlsx', meta: 'Edited by 4 people · conflicting rows' },
  { icon: 'mail', tint: 'rgba(88,124,250,0.18)', color: '#93a9ff', title: 'Re: Fwd: Re: Flight options', meta: '3 travellers still missing', dot: '#587cfa' },
  { icon: 'cal', tint: 'rgba(216,93,101,0.16)', color: '#ef8a91', title: 'Faculty briefing · moved (again)', meta: 'Tue 10:00 → Wed 15:30' },
  { icon: 'chat', tint: 'rgba(122,130,144,0.22)', color: '#c3c8d0', title: 'Has the venue contract been signed?', meta: 'Ops group · 14 unread', dot: '#d85d65' },
  { icon: 'doc', tint: 'rgba(122,130,144,0.22)', color: '#c3c8d0', title: 'Venue_contract_v4_signed?.pdf', meta: 'Which version is final?' },
  { icon: 'note', tint: 'rgba(217,164,65,0.22)', color: '#e8bd63', title: 'Hotel deposit due Thursday', meta: 'Reminder · no owner', note: true },
  { icon: 'mail', tint: 'rgba(88,124,250,0.18)', color: '#93a9ff', title: 'Budget tracker: which version is current?', meta: 'Finance · 2 attachments', dot: '#587cfa' },
  { icon: 'cal', tint: 'rgba(217,164,65,0.18)', color: '#e8bd63', title: 'Go / No-Go review · TBC', meta: 'Awaiting 5 confirmations' },
];
function fragCard(parent, f) {
  const c = h('div', 'frag' + (f.note ? ' note' : ''), parent);
  c.innerHTML = `<div class="frag-ico" style="background:${f.tint};color:${f.color}">${ICON[f.icon]}</div><div><div class="frag-title">${f.title}</div><div class="frag-meta">${f.meta}</div></div>${f.dot ? `<div class="frag-dot" style="background:${f.dot}"></div>` : ''}`;
  c.style.left = '-200px';
  c.style.top = -c.offsetHeight / 2 + 'px';
  return c;
}

/** Light point that the fragments converge into, then the bloom. */
function lightRig(root, cx, cy) {
  const glow = h('div', '', root, { position: 'absolute', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(205,216,255,0.85) 7%, rgba(111,141,251,0.38) 26%, rgba(88,124,250,0) 64%)' });
  const core = h('div', '', root, { position: 'absolute', borderRadius: '50%', background: '#fff', boxShadow: '0 0 40px 14px rgba(220,228,255,0.85)' });
  const flash = h('div', '', root, { position: 'absolute', inset: 0, background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(225,232,255,0.95), rgba(88,124,250,0.28) 42%, rgba(0,0,0,0) 78%)` });
  return (t, tGrow, tBloom) => {
    const a = E.in(clamp((t - tGrow) / (tBloom - tGrow)));
    const b = E.outExpo(clamp((t - tBloom) / 0.45));
    const decay = E.inOut(clamp((t - tBloom - 0.45) / 1.3));
    const gs = lerp(0, 420, a) + b * 1500;
    Object.assign(glow.style, { width: gs + 'px', height: gs + 'px', left: cx - gs / 2 + 'px', top: cy - gs / 2 + 'px', opacity: (a * (1 - decay)).toFixed(4) });
    const cs = 3 + 15 * a + 26 * b;
    Object.assign(core.style, { width: cs + 'px', height: cs + 'px', left: cx - cs / 2 + 'px', top: cy - cs / 2 + 'px', opacity: (a * (1 - E.inOut(clamp((t - tBloom) / 0.7)))).toFixed(4) });
    flash.style.opacity = (b * 0.5 * (1 - decay)).toFixed(4);
  };
}

/** Thin connecting lines between real screens, with travelling light (edit overlay). */
function connector(root, segs) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'lines');
  svg.setAttribute('width', SW);
  svg.setAttribute('height', SH);
  root.appendChild(svg);
  const items = segs.map(([x1, y1, x2, y2]) => {
    const ln = document.createElementNS(svg.namespaceURI, 'line');
    Object.entries({ x1, y1, x2, y2, stroke: 'rgba(147,169,255,0.55)', 'stroke-width': 2, 'stroke-linecap': 'round' }).forEach(([k, v]) => ln.setAttribute(k, v));
    const len = Math.hypot(x2 - x1, y2 - y1);
    ln.setAttribute('stroke-dasharray', `${len} ${len}`);
    svg.appendChild(ln);
    const dot = document.createElementNS(svg.namespaceURI, 'circle');
    dot.setAttribute('r', 5);
    dot.setAttribute('fill', '#cdd7ff');
    dot.style.filter = 'drop-shadow(0 0 6px rgba(147,169,255,0.95))';
    svg.appendChild(dot);
    return { ln, dot, x1, y1, x2, y2, len };
  });
  return (t, tin, tout, period = 1.6) => {
    const p = E.inOut(clamp((t - tin) / 0.8));
    const q = tout == null ? 0 : E.inOut(clamp((t - tout) / 0.5));
    svg.style.opacity = (1 - q).toFixed(3);
    items.forEach((it, k) => {
      it.ln.setAttribute('stroke-dashoffset', (it.len * (1 - p)).toFixed(1));
      const f = (((t - tin) / period + k * 0.37) % 1 + 1) % 1;
      it.dot.setAttribute('cx', lerp(it.x1, it.x2, f).toFixed(1));
      it.dot.setAttribute('cy', lerp(it.y1, it.y2, f).toFixed(1));
      it.dot.setAttribute('opacity', (p >= 1 ? Math.sin(Math.PI * f) : 0).toFixed(3));
    });
  };
}

// ── Scene registry ───────────────────────────────────────────────────────────────────────
const scenes = [];
function addScene(t0, t1, build) {
  const root = h('div', 'scene', scenesEl);
  root.style.display = 'block'; // measurable while building
  const upd = build(root);
  root.style.display = 'none';
  scenes.push({ t0, t1, root, upd });
}
function sceneOut(root, t, tout, dur = 0.9) {
  const q = E.inOut(clamp((t - tout) / dur));
  root.style.opacity = (1 - q).toFixed(4);
  return q;
}
/** Three-device composition: the hero moves to the centre while two related screens join it. */
function trio(t, t0, hero, L, R, from, o = {}) {
  const p = E.inOut(clamp((t - t0) / 1.0));
  const sc = o.s ?? 0.84, y = o.y ?? -26;
  hero.place({ x: lerp(from.x, 0, p), y: lerp(from.y ?? 0, y, p), s: lerp(from.s ?? 1, sc, p), ry: lerp(from.ry ?? -6, 0, p), rx: lerp(from.rx ?? 0, 0, p), zi: 3 });
  const q = E.outQuint(clamp((t - t0 - 0.12) / 1.15));
  L.place({ x: lerp(-900, -560, q), y, z: -170, s: sc, ry: lerp(26, 16, q), op: q, zi: 1 });
  R.place({ x: lerp(900, 560, q), y, z: -170, s: sc, ry: lerp(-26, -16, q), op: q, zi: 1 });
  return q;
}
const TRIO_LABEL_XS = [960 - 528, 960, 960 + 528];

// ── Background glow keyframes: [t, x, y, alpha, radius] ───────────────────────────────────
const BG_FILM = [
  [0, 960, 540, 0, 900], [11.4, 960, 540, 0, 900], [12.3, 960, 520, 0.16, 1000], [22.6, 960, 520, 0.11, 1000], [24.0, 1400, 560, 0, 900],
  [26, 1400, 560, 0.12, 900], [36.2, 1380, 560, 0.12, 900], [37.4, 960, 560, 0.10, 1150], [39.8, 960, 560, 0.06, 1150], [41, 960, 600, 0.10, 1250],
  [47, 960, 600, 0.10, 1250], [48.3, 1400, 560, 0.12, 900], [54.5, 1400, 560, 0.11, 900], [56, 1400, 560, 0.12, 900], [64, 1400, 560, 0.12, 900],
  [65.2, 960, 560, 0.10, 1150], [68.6, 960, 560, 0.08, 1150], [69.8, 1400, 560, 0.12, 900], [82.2, 1400, 560, 0.12, 900], [83.2, 960, 600, 0.10, 1300],
  [84.9, 960, 600, 0.06, 1300], [86, 1400, 560, 0.12, 900], [95.2, 1400, 560, 0.12, 900], [96.4, 960, 560, 0.10, 1150], [98.8, 960, 560, 0.07, 1150],
  [100, 1400, 560, 0.12, 900], [111.1, 1400, 560, 0.12, 900], [112.2, 960, 560, 0.10, 1150], [115.8, 960, 560, 0.07, 1150], [117, 960, 560, 0.11, 1000],
  [127, 960, 640, 0.13, 1500], [131, 960, 640, 0.08, 1500], [132.2, 960, 540, 0, 1000], [134.2, 960, 450, 0.08, 1150], [150, 960, 450, 0.10, 1150],
];
const BG_VERT = [
  [0, 540, 960, 0, 900], [2.0, 540, 960, 0, 900], [2.6, 540, 920, 0.16, 1000], [6.2, 540, 920, 0.10, 1000], [7.0, 540, 1150, 0.12, 1100],
  [21, 540, 1150, 0.12, 1100], [22, 540, 1100, 0.12, 1400], [24.3, 540, 1100, 0.08, 1400], [25, 540, 900, 0.09, 1100], [30, 540, 900, 0.10, 1100],
];
function updateBG(t) {
  const K = MODE === 'film' ? BG_FILM : BG_VERT;
  let i = 0;
  while (i < K.length - 2 && t >= K[i + 1][0]) i++;
  const a = K[i], b = K[i + 1], u = E.sine(clamp((t - a[0]) / (b[0] - a[0])));
  const v = a.map((x, k) => lerp(x, b[k], u));
  bgEl.style.background = `radial-gradient(ellipse ${v[4].toFixed(0)}px ${(v[4] * 0.62).toFixed(0)}px at ${v[1].toFixed(1)}px ${v[2].toFixed(1)}px, rgba(70,100,232,${v[3].toFixed(4)}), rgba(0,0,0,0) 72%), #000`;
}

// ══════════════════════════════════════════════════════════════════════════════════════════
//  FILM (16:9, 150 s)
// ══════════════════════════════════════════════════════════════════════════════════════════
function buildFilm() {
  // S01 · The complexity (00:00–00:12)
  addScene(0, 11.9, (root) => {
    const world = h('div', 'world', root, { perspective: '1600px' });
    const POS = [
      [-600, -300, -120, -3], [430, -330, 0, 2], [-740, 200, -260, 2], [760, 175, -60, -2],
      [-380, 300, -40, 1.5], [330, 320, -200, -4], [-80, -420, -420, -1], [820, -200, -380, 1.5],
    ];
    const ORDER = [1, 2, 5, 0, 3, 6, 4, 7];
    const cards = FRAGS.map((f) => fragCard(world, f));
    const head = centred(root, 'Behind every exceptional programme…', 'txt h1', { fontSize: '64px', fontWeight: 500 }, SH / 2);
    return (t) => {
      const dolly = 60 * E.sine(clamp(t / 9.4));
      cards.forEach((c, i) => {
        const [fx, fy, fz, rot] = POS[i];
        const a = 0.9 + ORDER.indexOf(i) * 0.85;
        const pin = E.outQuint(clamp((t - a) / 0.8));
        const cv = E.inOut(clamp((t - 9.3 - i * 0.05) / 2.1));
        const fade = 1 - E.in(clamp((t - 10.5) / 1.0));
        const dx = Math.sin(t * 0.31 + i * 1.7) * 10, dy = Math.cos(t * 0.27 + i * 2.3) * 8;
        const depthBlur = fz < -300 ? 1.6 : fz < -150 ? 0.7 : 0;
        placeEl(c, {
          x: lerp(fx + dx, 0, cv), y: lerp(fy + dy + (1 - pin) * 18, 0, cv), z: lerp(fz + dolly, -320, cv),
          s: lerp(0.93 + 0.07 * pin, 0.2, cv), rz: lerp(rot, 0, cv), op: pin * fade, blur: depthBlur + (1 - pin) * 10 + cv * 4,
        });
      });
      rvWords(head.spans, t, 2.9, 8.9, { stagger: 0.09, dur: 1.1 });
    };
  });

  // S02 · The reveal (00:12–00:24)
  addScene(11.9, 24.0, (root) => {
    const grp = h('div', '', root, { position: 'absolute', inset: 0, transformOrigin: '50% 47%' });
    const streak = h('div', '', grp, { position: 'absolute', width: '1500px', height: '300px', borderRadius: '50%', background: 'radial-gradient(ellipse at center, rgba(130,155,255,0.20), rgba(88,124,250,0) 70%)' });
    const line = h('div', '', grp, { position: 'absolute', height: '1.5px', top: SH / 2 + 66 + 'px', background: 'linear-gradient(90deg, rgba(147,169,255,0), rgba(196,208,255,0.9), rgba(147,169,255,0))' });
    const L = lockup(grp, { cx: SW / 2, cy: SH / 2 - 30, mark: 132, size: 124, gap: 38 });
    const sub = centred(grp, 'One unified operating environment.', 'txt', { fontSize: '40px', fontWeight: 400, color: '#a1a1a6', letterSpacing: '-0.01em' }, SH / 2 + 128);
    return (t) => {
      const q = sceneOut(root, t, 22.7, 1.0);
      grp.style.transform = `scale(${(1 + 0.035 * E.sine(clamp((t - 12) / 11)) + q * 0.02).toFixed(4)})`;
      lockupAnim(L, t, { tm: 12.12, tSlide: 13.25, tw: 13.5, ts: 14.8, startCx: SW / 2 });
      const sx = lerp(-700, 700, E.sine(clamp((t - 12.5) / 4.3)));
      Object.assign(streak.style, { left: SW / 2 + sx - 750 + 'px', top: SH / 2 - 30 - 150 + 'px', opacity: (Math.sin(Math.PI * clamp((t - 12.5) / 4.3)) * 0.9).toFixed(3) });
      const lw = 900 * E.outQuint(clamp((t - 13.0) / 1.6));
      Object.assign(line.style, { width: lw + 'px', left: SW / 2 - lw / 2 + 'px', opacity: (clamp((t - 13.0) / 0.3) * (1 - P(t, 15.2, 16.8))).toFixed(3) });
      rvWords(sub.spans, t, 17.2, null, { stagger: 0.08, dur: 1.1 });
    };
  });

  // Light point → bloom (bridges S01 → S02)
  addScene(9.9, 13.8, (root) => {
    const light = lightRig(root, SW / 2, SH / 2 - 30);
    return (t) => light(t, 10.0, 11.62);
  });

  // S03 · One programme. One workspace. (00:24–00:40)
  addScene(23.8, 40.3, (root) => {
    const world = h('div', 'world', root);
    const DL = new Device(world, 389), DR = new Device(world, 389), D = new Device(world, 389);
    const col = column(root, { eyebrow: 'Programme workspace', lines: ['One programme.', 'One workspace.'] });
    const labs = labels(root, ['Timeline', 'Programme overview', 'Readiness'], TRIO_LABEL_XS, 958);
    const row = TAPS.home.row;
    const segs = [
      { at: 0, media: S('s03_home') },
      { at: 27.45, media: Q('s03_home_scroll_elp', 27.45) },
      { at: 31.6, media: S('s03_elp_overview'), tr: 'push' },
      { at: 32.9, media: Q('s03_elp_overview_scroll', 32.9) },
    ];
    return (t) => {
      sceneOut(root, t, 39.3, 0.9);
      const e = E.outQuint(clamp((t - 23.9) / 2.3));
      const pi = E.inOut(clamp((t - 32.3) / 3.8));
      const from = {
        x: lerp(HX, HX - 30, pi), y: lerp(780, 0, e) + 78 * pi, s: lerp(1, 1.16, pi),
        rx: lerp(lerp(26, 3, e), 0, pi), ry: lerp(-24, -8, e) + 4 * E.sine(clamp((t - 26) / 6)),
      };
      if (t < 36.4) {
        D.place({ ...from, z: lerp(-200, 0, e), op: clamp(e * 2.5), zi: 3 });
        DL.hide(); DR.hide();
        labs.forEach((l) => rv(l, t, 99, null));
      } else {
        const q = trio(t, 36.4, D, DL, DR, from);
        labs.forEach((l, i) => rv(l, t, 37.0 + i * 0.1, null, { dy: 10, blur: 4 }));
        void q;
      }
      D.show(t, segs);
      D.tapAt(t, 31.42 - TAP_PEAK, row.x + row.width / 2, row.y + row.height / 2);
      DL.show(t, [{ at: 0, media: S('s03_elp_timeline') }]);
      DR.show(t, [{ at: 0, media: S('s08_readiness_before') }]);
      col.update(t, 26.2, [26.5, 27.1], 35.9);
    };
  });

  // S04 · People. Connected. (00:40–00:55)
  addScene(39.8, 55.3, (root) => {
    const world = h('div', 'world', root);
    const A = new Device(world, 330), B = new Device(world, 330), C = new Device(world, 330);
    const H2 = new Device(world, 389), H1 = new Device(world, 389);
    const W3 = ['Faculty.', 'Learners.', 'Teams.'].map((w) => h('div', 'txt h1', root, { fontSize: '72px', left: '0px', top: '0px', transformOrigin: '0 0' }, w));
    const widths = W3.map((e) => e.offsetWidth), gap = 30;
    let xx = (SW - widths.reduce((a, b) => a + b) - 2 * gap) / 2;
    const rowPos = widths.map((w) => { const p = [xx, 104]; xx += w + gap; return p; });
    const colPos = W3.map((e, i) => [170, 540 + (i - 1) * 92 - 44]);
    const eb = h('div', 'txt eyebrow', root, { left: '170px', top: 540 - 92 - 44 - 50 + 'px' }, 'People, connected');
    const lines = connector(root, [[600, 470, 778, 470], [1142, 470, 1320, 470]]);
    const learnerLab = labels(root, ['Participants · Executive Leadership Programme'], [960 + HX], 1046);
    const segsH1 = [{ at: 0, media: Q('s04_elp_participants_scroll', 48.0) }];
    return (t) => {
      sceneOut(root, t, 54.3, 0.9);
      // words: appear in a row, then re-flow into the left column as the learner view takes over
      const times = [41.9, 42.9, 44.1];
      W3.forEach((e, i) => {
        const m = E.inOut(clamp((t - 47.15 - i * 0.07) / 1.0));
        const x = lerp(rowPos[i][0], colPos[i][0], m), y = lerp(rowPos[i][1], colPos[i][1], m);
        rv(e, t, times[i], null, { base: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)` });
      });
      rv(eb, t, 48.1, null, { dy: 14, blur: 6 });
      // faculty trio
      const push = 1 + 0.03 * E.sine(clamp((t - 40) / 7.2));
      const out1 = E.inOut(clamp((t - 46.9) / 0.9));
      [A, B, C].forEach((d, i) => {
        const e = E.outQuint(clamp((t - 40.1 - i * 0.25) / 1.3));
        d.place({ x: [-560, 0, 560][i] * push, y: lerp(260, 70, e) + 90 * out1, z: i === 1 ? 0 : -120, s: push * (1 - 0.04 * out1), ry: [14, 0, -14][i], op: e * (1 - out1), zi: i === 1 ? 2 : 1 });
      });
      A.show(t, [{ at: 0, media: S('s04_faculty_directory') }]);
      B.show(t, [{ at: 0, media: S('s04_faculty_vasquez') }]);
      C.show(t, [{ at: 0, media: S('s04_elp_faculty') }]);
      lines(t, 42.4, 46.6);
      // learners
      const e1 = E.outQuint(clamp((t - 47.5) / 1.2));
      const m2 = E.inOut(clamp((t - 51.2) / 1.1));
      H1.place({ x: lerp(lerp(780, HX, e1), 270, m2), y: 0, ry: lerp(-14, -8, e1) + 4 * m2, op: e1, zi: 4 });
      H1.show(t, segsH1);
      const e2 = E.outQuint(clamp((t - 51.4) / 1.2));
      H2.place({ x: lerp(980, 760, e2), y: 10, z: -220, ry: -18, op: e2, zi: 3 });
      H2.show(t, [{ at: 0, media: S('s04_learner_noor') }]);
      learnerLab.forEach((l) => rv(l, t, 48.6, 51.0, { dy: 10, blur: 4 }));
    };
  });

  // S05 · The academic experience (00:55–01:09)
  addScene(54.9, 69.3, (root) => {
    const world = h('div', 'world', root);
    const L = new Device(world, 389), R = new Device(world, 389), D = new Device(world, 389);
    const col = column(root, { eyebrow: 'Academic experience', lines: ['Every session.', 'Every milestone.'] });
    const labs = labels(root, ['Academic structure', 'Sessions', 'Module'], TRIO_LABEL_XS, 958);
    const segs = [
      { at: 0, media: S('s05_calendar_week_elp') },
      { at: 60.08, media: S('s05_session_keynote'), tr: 'push' },
      { at: 64.35, media: Q('s05_elp_sessions_scroll', 64.7), tr: 'push' },
    ];
    return (t) => {
      sceneOut(root, t, 68.3, 0.9);
      const e = E.outQuint(clamp((t - 55.0) / 1.4));
      const pi = E.inOut(clamp((t - 60.6) / 3.4));
      const from = { x: lerp(HX + 140, HX, e), y: 70 * pi, s: lerp(1, 1.14, pi), ry: lerp(-16, -7, e) };
      if (t < 64.2) { D.place({ ...from, op: e, zi: 3 }); L.hide(); R.hide(); labs.forEach((l) => rv(l, t, 99, null)); }
      else { trio(t, 64.2, D, L, R, from); labs.forEach((l, i) => rv(l, t, 64.9 + i * 0.1, null, { dy: 10, blur: 4 })); }
      D.show(t, segs);
      D.tapAt(t, 60.0 - TAP_PEAK, 240, 700);
      L.show(t, [{ at: 0, media: S('s05_elp_academics') }]);
      R.show(t, [{ at: 0, media: S('s05_module_strategy') }]);
      col.update(t, 55.5, [55.8, 56.4], 63.6);
    };
  });

  // S06 · Every detail. Orchestrated. (01:09–01:25)
  addScene(68.9, 85.3, (root) => {
    const world = h('div', 'world', root);
    const minis = [0, 1, 2, 3].map(() => new Device(world, 230));
    const D = new Device(world, 389);
    const pass = new Crop(world, 's06_itinerary_vasquez', [48, 742, 1074, 658], 640);
    const W4 = ['Travel.', 'Accommodation.', 'Venues.', 'Logistics.'].map((w) => h('div', 'txt h1', root, { fontSize: '84px', left: '0px', top: '0px', transformOrigin: '0 0' }, w));
    const colPos = W4.map((e, i) => [170, 540 + (i - 1.5) * 100 - 46]);
    const rowLine = centred(root, 'Travel. Accommodation. Venues. Logistics.', 'txt h1', { fontSize: '56px' }, 151);
    const eb = h('div', 'txt eyebrow', root, { left: '170px', top: colPos[0][1] - 56 + 'px' }, 'Every detail. Orchestrated.');
    const lines = connector(root, [[530, 600, 650, 600], [900, 600, 1020, 600], [1270, 600, 1390, 600]]);
    const caption = centred(root, 'Executive Leadership Programme · 12–16 April 2027 · Creekside Grand Hotel, Dubai', 'txt label', { fontSize: '21px' }, 930);
    const appear = [69.4, 73.0, 76.6, 80.2];
    const segs = [
      { at: 0, media: S('s06_itinerary_vasquez') },
      { at: 73.0, media: Q('s06_rooming_elp_scroll', 73.25), tr: 'push' },
      { at: 76.6, media: S('s06_venue_booking'), tr: 'push' },
      { at: 80.2, media: S('s06_checklist_elp'), tr: 'push' },
    ];
    const miniMedia = ['s06_itinerary_vasquez', 's06_rooming_elp', 's06_venue_booking', 's06_checklist_elp'];
    return (t) => {
      sceneOut(root, t, 84.5, 0.8);
      // The column builds word by word; at the finale it gives way to the full line above the four screens.
      W4.forEach((e, i) => {
        const dim = E.inOut(clamp((t - (appear[i + 1] ?? 999)) / 0.6));
        rv(e, t, appear[i], 82.3, { base: `translate(${colPos[i][0]}px, ${colPos[i][1]}px)`, op: 1 - 0.6 * dim, outDur: 0.45 });
      });
      rvWords(rowLine.spans, t, 82.85, null, { stagger: 0.06, dur: 0.9 });
      rv(eb, t, 69.2, 82.3, { dy: 14, blur: 6, outDur: 0.45 });
      const e = E.outQuint(clamp((t - 69.0) / 1.3));
      const hout = E.inOut(clamp((t - 82.3) / 0.5));
      D.place({ x: lerp(HX + 140, HX, e), y: -20 * hout, s: 1 - 0.18 * hout, ry: lerp(-16, -7, e) + 3 * Math.sin(t * 0.35), op: e * (1 - hout), zi: 3 });
      D.show(t, segs);
      const pin = E.outQuint(clamp((t - 70.4) / 0.9)), pout = E.inOut(clamp((t - 72.4) / 0.6));
      pass.place({ x: lerp(HX - 10, 140, pin) + 60 * pout, y: lerp(-20, 30, pin), z: 120, s: lerp(0.62, 1, pin) * (1 - 0.15 * pout), op: pin * (1 - pout), zi: 5 });
      minis.forEach((m, i) => {
        const q = E.outQuint(clamp((t - 82.65 - i * 0.09) / 1.0));
        m.place({ x: [-555, -185, 185, 555][i], y: lerp(120, 60, q), op: q, zi: 1 });
        m.show(t, [{ at: 0, media: S(miniMedia[i]) }]);
      });
      lines(t, 83.3, null, 1.3);
      rvWords(caption.spans, t, 83.4, null, { stagger: 0.03, dy: 10, blur: 4 });
    };
  });

  // S07 · Financial control (01:25–01:39)
  addScene(84.9, 99.3, (root) => {
    const world = h('div', 'world', root);
    const L = new Device(world, 389), R = new Device(world, 389), D = new Device(world, 389);
    const TW = 300, k = TW / 522, TH = 268 * k, G = 22;
    const tiles = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
      tiles.push({ r, c, crop: new Crop(world, 's07_elp_finance', [c ? 600 : 48, 742 + r * 306, 522, 268], TW), x: HX + (c ? 1 : -1) * (TW + G) / 2, y: (r - 1.5) * (TH + G) });
    }
    const col = column(root, { eyebrow: 'Financial control', lines: ['Financial visibility.', 'Operational control.'] });
    const labs = labels(root, ['Transactions', 'Programme finance', 'Budget vs actual'], TRIO_LABEL_XS, 958);
    const segs = [{ at: 0, media: S('s07_elp_finance') }, { at: 92.9, media: Q('s07_elp_finance_scroll', 92.9) }];
    return (t) => {
      sceneOut(root, t, 98.3, 0.9);
      const e = E.outQuint(clamp((t - 85.0) / 1.4));
      const pi = E.inOut(clamp((t - 85.6) / 3.0));
      const from = { x: lerp(HX + 140, HX, e), y: 0, s: lerp(1, 1.05, pi), ry: lerp(-16, -7, e) };
      if (t < 95.4) { D.place({ ...from, op: e, zi: 3 }); L.hide(); R.hide(); labs.forEach((l) => rv(l, t, 99, null)); }
      else { trio(t, 95.4, D, L, R, from); labs.forEach((l, i) => rv(l, t, 96.0 + i * 0.1, null, { dy: 10, blur: 4 })); }
      D.dim(0.5 * P(t, 88.5, 89.2) * (1 - P(t, 92.5, 93.2)));
      D.show(t, segs);
      L.show(t, [{ at: 0, media: S('s07_transactions') }]);
      R.show(t, [{ at: 0, media: S('s07_report_budget') }]);
      tiles.forEach(({ r, c, crop, x, y }) => {
        const p = E.outQuint(clamp((t - 88.7 - r * 0.13 - c * 0.06) / 0.9));
        const q = E.inOut(clamp((t - 92.5 - (3 - r) * 0.06) / 0.55));
        crop.place({ x, y: y + (1 - p) * 36 + q * 18, z: 60, s: lerp(0.94, 1, p) * (1 - 0.05 * q), op: p * (1 - q), blur: (1 - p) * 8, zi: 6 });
      });
      col.update(t, 85.5, [85.8, 86.4], 94.7);
    };
  });

  // S08 · Intelligence at work (01:39–01:56)
  addScene(98.9, 116.3, (root) => {
    const world = h('div', 'world', root);
    const L = new Device(world, 389), R = new Device(world, 389), D = new Device(world, 389);
    const ring = new Crop(world, 's08_readiness_before', [48, 405, 1074, 867], 540);
    const toast = new Crop(world, 's08_tap_after', [48, 18, 1074, 222], 640);
    const col = column(root, { eyebrow: 'Readiness engine', lines: ['See what is ready.', 'Know what needs attention.'] });
    const cap1 = h('div', 'txt', root, { left: '170px', top: col.bottom + 26 + 'px', fontSize: '24px', fontWeight: 500, color: '#f5f5f7' }, 'One record updated. Readiness recalculated.');
    const cap2 = h('div', 'txt', root, { left: '170px', top: col.bottom + 64 + 'px', fontSize: '22px', fontWeight: 400, color: '#a1a1a6' }, 'Travel 65% → 70%  ·  Overall readiness 82% → 83%');
    const labs = labels(root, ['Smart alerts', 'Approvals', { pill: 'Concept prototype · simulated responses' }], TRIO_LABEL_XS, 958);
    const btn = TAPS.readiness.button;
    const segs = [
      { at: 0, media: Q('s08_readiness_to_alert', 103.1) },
      { at: 107.52, media: S('s08_tap_before') },
      { at: 108.34, media: S('s08_tap_after') },
      { at: 110.0, media: Q('s08_after_to_top', 110.0) },
      { at: 111.45, media: S('s08_approval_deposit'), tr: 'push' },
    ];
    return (t) => {
      sceneOut(root, t, 115.3, 0.9);
      const e = E.outQuint(clamp((t - 99.0) / 1.4));
      const p1 = E.inOut(clamp((t - 99.6) / 3.2)), p2 = E.inOut(clamp((t - 103.1) / 2.0)), p3 = E.inOut(clamp((t - 108.3) / 1.4));
      const from = {
        x: lerp(HX + 140, HX, e), ry: lerp(-16, -7, e),
        s: lerp(lerp(lerp(1, 1.12, p1), 1.06, p2), 1.12, p3), y: lerp(lerp(lerp(0, 60, p1), 30, p2), 84, p3),
      };
      if (t < 111.3) { D.place({ ...from, op: e, zi: 3 }); L.hide(); R.hide(); labs.forEach((l) => l && rv(l, t, 999, null)); }
      else { trio(t, 111.3, D, L, R, from); labs.forEach((l, i) => l && rv(l, t, 112.0 + i * 0.12, null, { dy: 10, blur: 4 })); }
      D.show(t, segs);
      D.tapAt(t, 108.22 - TAP_PEAK, btn.x + btn.width / 2, btn.y + btn.height / 2);
      L.show(t, [{ at: 0, media: S('s08_alerts') }]);
      R.show(t, [{ at: 0, media: S('s08_assistant') }]);
      const rin = E.outQuint(clamp((t - 101.35) / 0.9)), rout = E.inOut(clamp((t - 102.75) / 0.5));
      ring.place({ x: lerp(HX, 300, rin) + 80 * rout, y: lerp(-150, -70, rin) - 60 * rout, z: 120, s: lerp(0.7, 1, rin) * (1 - 0.2 * rout), op: rin * (1 - rout), zi: 6 });
      const tin = E.outQuint(clamp((t - 108.55) / 0.8)), tout = E.inOut(clamp((t - 110.0) / 0.45));
      toast.place({ x: lerp(HX, 330, tin), y: lerp(-380, -330, tin) - 20 * tout, z: 120, s: lerp(0.66, 1, tin), op: tin * (1 - tout), zi: 6 });
      col.update(t, 101.0, [101.4, 103.0], 110.7);
      rv(cap1, t, 109.0, 110.7, { dy: 12, blur: 5 });
      rv(cap2, t, 109.25, 110.7, { dy: 12, blur: 5 });
    };
  });

  // S09 · From programmes to portfolio (01:56–02:12)
  addScene(115.9, 132.2, (root) => {
    const world = h('div', 'world', root, { perspective: '2200px' });
    const grid = h('div', '', world, { position: 'absolute', left: '0px', top: '0px' });
    const NAMES = [
      's03_home', 's09_report_executive', 's07_finance', 'dk_elp_overview', 's09_report_readiness', 's05_calendar_month', 's04_faculty_directory',
      's06_travel_elp', 's06_hotel_creekside', 's07_report_budget', null, 's04_elp_participants', 'dk_report_executive', 's09_home_exec',
      's09_reports', 's08_alerts', 'dk_home', 's05_calendar_agenda', 's07_transactions', 'dk_readiness', 's06_rooming_elp',
    ];
    const devs = NAMES.map(() => new Device(grid, 389));
    const scrim = h('div', '', root, { position: 'absolute', left: 0, right: 0, top: 0, height: '470px', background: 'linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 45%, rgba(0,0,0,0) 100%)' });
    const eb = centred(root, 'Portfolio', 'txt eyebrow', {}, 92);
    const l1 = centred(root, 'From individual programmes', 'txt h1', { fontSize: '62px' }, 160);
    const l2 = centred(root, 'to your entire portfolio.', 'txt h1', { fontSize: '62px' }, 234);
    const heroSegs = [{ at: 0, media: Q('s09_programmes_scroll', 116.4) }];
    return (t) => {
      sceneOut(root, t, 131.0, 1.0);
      const e = E.outQuint(clamp((t - 116.0) / 1.2));
      const z = E.inOut(clamp((t - 121.0) / 6.0));
      const drift = -70 * clamp((t - 121) / 10.5);
      grid.style.transform = `translate3d(${drift.toFixed(2)}px, ${lerp(0, 150, z).toFixed(2)}px, 0) rotateX(${lerp(0, 24, z).toFixed(3)}deg) rotateZ(${lerp(0, -7, z).toFixed(3)}deg) scale(${(lerp(1, 0.4, z) * lerp(0.94, 1, e)).toFixed(4)})`;
      devs.forEach((d, k) => {
        const r = Math.floor(k / 7), c = k % 7;
        if (k === 10) { d.place({ op: e, zi: 5 }); d.show(t, heroSegs); return; }
        const dist = Math.hypot(c - 3, r - 1);
        const op = E.out(clamp((t - 121.2 - dist * 0.25) / 0.9));
        d.place({ x: (c - 3) * 485 + (r - 1) * 30 * clamp((t - 121) / 10), y: (r - 1) * 1004, op, zi: 1 });
        d.show(t, [{ at: 0, media: S(NAMES[k]) }]);
      });
      scrim.style.opacity = P(t, 121.5, 123.0).toFixed(3);
      rv(eb.el, t, 122.2, null, { dy: 12, blur: 6 });
      rvWords(l1.spans, t, 122.5, null, { stagger: 0.07 });
      rvWords(l2.spans, t, 123.1, null, { stagger: 0.07 });
    };
  });

  // S10 · The product statement (02:12–02:30)
  addScene(131.9, 150.01, (root) => {
    const grp = h('div', '', root, { position: 'absolute', inset: 0, transformOrigin: '50% 50%' });
    const sweep = h('div', '', grp, { position: 'absolute', width: '900px', height: '1600px', top: '-260px', background: 'linear-gradient(90deg, rgba(111,141,251,0), rgba(140,165,255,0.12), rgba(111,141,251,0))', transform: 'rotate(18deg)' });
    const L = lockup(grp, { cx: SW / 2, cy: 382, mark: 104, size: 96, gap: 30 });
    const beyond = centred(grp, 'Beyond Training Management.', 'txt', { fontSize: '46px', fontWeight: 500, letterSpacing: '-0.02em', color: '#f5f5f7' }, 520);
    const ph = ['One Platform.', 'Every Programme.', 'Complete Control.'].map((s, i) => h('div', 'txt h1' + (i === 2 ? ' grad' : ''), grp, { fontSize: '56px', top: '600px' }, s));
    const pw = ph.map((e) => e.offsetWidth), pg = 26;
    let xx = (SW - pw.reduce((a, b) => a + b) - 2 * pg) / 2;
    ph.forEach((e, i) => { e.style.left = xx + 'px'; xx += pw[i] + pg; });
    const sheen = h('div', 'txt h1 sheen', grp, { fontSize: '56px', top: '600px', left: ph[2].style.left }, 'Complete Control.');
    const support = centred(grp, 'Designed for the complexity of modern executive education.', 'txt', { fontSize: '26px', fontWeight: 400, color: '#86868b' }, 776);
    const W = TL.vo10Words;
    return (t) => {
      grp.style.transform = `scale(${(1 + 0.022 * E.sine(clamp((t - 134) / 16))).toFixed(4)})`;
      root.style.opacity = P(t, 131.9, 132.4).toFixed(3);
      const sp = clamp((t - 132.3) / 2.8);
      Object.assign(sweep.style, { left: lerp(-900, 1900, E.sine(sp)) + 'px', opacity: Math.sin(Math.PI * sp).toFixed(3) });
      lockupAnim(L, t, { tm: W.programmeos - 0.22, tSlide: null, tw: W.programmeos - 0.02, ts: W.programmeos + 1.2 });
      rvWords(beyond.spans, t, W.beyond - 0.05, null, { stagger: 0.09, dur: 1.1 });
      [W.onePlatform, W.everyProgramme, W.completeControl].forEach((at, i) => rv(ph[i], t, at - 0.08, null, { dur: 1.0, dy: 22 }));
      const s = clamp((t - (W.completeControl + 0.15)) / 1.3);
      sheen.style.opacity = s > 0 && s < 1 ? Math.sin(Math.PI * s).toFixed(3) : '0';
      sheen.style.backgroundPosition = `${lerp(100, 0, E.inOut(s)).toFixed(2)}% 0`;
      rvWords(support.spans, t, 144.2, null, { stagger: 0.05, dur: 1.2, dy: 14 });
    };
  });
}

// ══════════════════════════════════════════════════════════════════════════════════════════
//  VERTICAL (9:16, 30 s)
// ══════════════════════════════════════════════════════════════════════════════════════════
function buildVertical() {
  const VW = 600; // hero device screen width
  // V1 · complexity hook
  addScene(0, 2.6, (root) => {
    const world = h('div', 'world', root, { perspective: '1600px' });
    const POS = [[-210, -620, -100, -3], [220, -400, 0, 2], [-230, 420, -60, 2], [210, 640, -160, -3], [-240, -190, -380, 1], [250, 210, -320, -2]];
    const pick = [0, 1, 3, 5, 6, 7];
    const cards = pick.map((i) => fragCard(world, FRAGS[i]));
    const l1 = centred(root, 'Behind every', 'txt h1', { fontSize: '68px', fontWeight: 500 }, SH / 2 - 42);
    const l2 = centred(root, 'exceptional programme…', 'txt h1', { fontSize: '68px', fontWeight: 500 }, SH / 2 + 42);
    return (t) => {
      cards.forEach((c, i) => {
        const [fx, fy, fz, rot] = POS[i];
        const pin = E.outQuint(clamp((t - 0.1 - i * 0.2) / 0.6));
        const cv = E.inOut(clamp((t - 1.3 - i * 0.03) / 0.9));
        placeEl(c, { x: lerp(fx, 0, cv), y: lerp(fy + (1 - pin) * 16, 0, cv), z: lerp(fz, -320, cv), s: lerp(0.93 + 0.07 * pin, 0.2, cv), rz: lerp(rot, 0, cv), op: pin * (1 - E.in(clamp((t - 1.75) / 0.5))), blur: (1 - pin) * 8 + cv * 4 });
      });
      rvWords(l1.spans, t, 0.3, 1.5, { stagger: 0.07, dur: 0.8 });
      rvWords(l2.spans, t, 0.5, 1.5, { stagger: 0.07, dur: 0.8 });
    };
  });
  // V2 · reveal
  addScene(2.2, 6.6, (root) => {
    const L = lockup(root, { cx: SW / 2, cy: SH / 2 - 40, mark: 112, size: 100, gap: 30 });
    const sub = centred(root, 'One unified operating environment.', 'txt', { fontSize: '42px', fontWeight: 400, color: '#a1a1a6', letterSpacing: '-0.01em' }, SH / 2 + 90);
    return (t) => {
      sceneOut(root, t, 6.0, 0.6);
      lockupAnim(L, t, { tm: 2.55, tSlide: 3.4, tw: 3.55, ts: 4.3, startCx: SW / 2 });
      rvWords(sub.spans, t, 4.4, null, { stagger: 0.07, dur: 0.9 });
    };
  });
  addScene(1.3, 4.2, (root) => {
    const light = lightRig(root, SW / 2, SH / 2 - 40);
    return (t) => light(t, 1.4, 2.15);
  });
  // V3–V6 · one continuous device: workspace → readiness → operations → finance
  addScene(6.2, 21.7, (root) => {
    const world = h('div', 'world', root);
    const D = new Device(world, VW);
    const TW = 420, k = TW / 522, TH = 268 * k, G = 20;
    const tiles = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) tiles.push({ r, c, crop: new Crop(world, 's07_elp_finance', [c ? 600 : 48, 742 + r * 306, 522, 268], TW), x: (c ? 1 : -1) * (TW + G) / 2, y: 190 + (r - 1.5) * (TH + G) });
    const blocks = [
      [['One programme.', 'One workspace.'], 76, 6.6, 10.6],
      [['See what is ready.'], 76, 11.2, 14.7],
      [['Travel. Accommodation.', 'Venues. Logistics.'], 64, 15.2, 18.2],
      [['Financial visibility.', 'Operational control.'], 66, 18.7, 21.2],
    ].map(([lines, size, tin, tout]) => ({ lines: lines.map((ln, i) => centred(root, ln, 'txt h1', { fontSize: size + 'px' }, 230 + i * size * 1.12 - ((lines.length - 1) * size * 1.12) / 2)), tin, tout }));
    const cap = centred(root, 'Travel 65% → 70%  ·  Readiness 82% → 83%', 'txt', { fontSize: '34px', fontWeight: 500, color: '#a1a1a6' }, 336);
    const btn = TAPS.readiness.button;
    const segs = [
      { at: 0, media: Q('s03_elp_overview_scroll', 6.9) },
      { at: 11.0, media: S('s08_tap_before'), tr: 'push' },
      { at: 12.42, media: S('s08_tap_after') },
      { at: 13.6, media: Q('s08_after_to_top', 13.6) },
      { at: 15.0, media: S('s06_itinerary_vasquez'), tr: 'push' },
      { at: 16.6, media: Q('s06_rooming_elp_scroll', 16.7), tr: 'push' },
      { at: 18.5, media: S('s07_elp_finance'), tr: 'push' },
    ];
    return (t) => {
      sceneOut(root, t, 21.1, 0.6);
      const e = E.outQuint(clamp((t - 6.3) / 1.2));
      const pt = E.inOut(clamp((t - 12.4) / 1.0)) * (1 - E.inOut(clamp((t - 13.9) / 0.8)));
      D.place({ x: 0, y: lerp(1200, 200, e) + 160 * pt, s: 1 + 0.12 * pt, rx: lerp(18, 0, e), op: clamp(e * 2) });
      D.dim(0.5 * P(t, 18.9, 19.4) * (1 - P(t, 21.0, 21.6)));
      D.show(t, segs);
      D.tapAt(t, 12.35 - TAP_PEAK, btn.x + btn.width / 2, btn.y + btn.height / 2);
      blocks.forEach((b) => b.lines.forEach((L, i) => rvWords(L.spans, t, b.tin + i * 0.3, b.tout, { stagger: 0.06, dur: 0.8 })));
      rvWords(cap.spans, t, 12.7, 14.7, { stagger: 0.03, dy: 12, blur: 5 });
      tiles.forEach(({ r, c, crop, x, y }) => {
        const p = E.outQuint(clamp((t - 19.0 - r * 0.12 - c * 0.05) / 0.8));
        crop.place({ x, y: y + (1 - p) * 30, z: 60, s: lerp(0.94, 1, p), op: p, blur: (1 - p) * 8, zi: 6 });
      });
    };
  });
  // V7 · portfolio
  addScene(21.1, 24.9, (root) => {
    const world = h('div', 'world', root, { perspective: '2200px' });
    const grid = h('div', '', world, { position: 'absolute', left: '0px', top: '0px' });
    const NAMES = [
      's03_home', 's09_report_executive', 's07_finance', 'dk_elp_overview', 's09_report_readiness',
      's06_travel_elp', 's06_hotel_creekside', 'dk_report_executive', 's04_elp_participants', 's09_home_exec',
      's09_reports', 's08_alerts', null, 's05_calendar_month', 's07_report_budget',
      'dk_home', 's05_calendar_agenda', 's07_transactions', 'dk_readiness', 's06_rooming_elp',
      's04_faculty_directory', 's05_elp_sessions', 's03_elp_timeline', 's06_venue_booking', 'dk_elp_finance',
    ];
    const PX = VW * 1.068 + 70, PY = VW * 2.4 + 70;
    const devs = NAMES.map(() => new Device(grid, VW));
    const scrim = h('div', '', root, { position: 'absolute', left: 0, right: 0, top: 0, height: '560px', background: 'linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0) 100%)' });
    const l1 = centred(root, 'From individual programmes', 'txt h1', { fontSize: '60px' }, 210);
    const l2 = centred(root, 'to your entire portfolio.', 'txt h1', { fontSize: '60px' }, 282);
    return (t) => {
      sceneOut(root, t, 24.3, 0.6);
      root.style.opacity = (P(t, 21.1, 21.6) * (1 - P(t, 24.3, 24.9))).toFixed(3);
      const z = E.inOut(clamp((t - 21.5) / 2.8));
      grid.style.transform = `translate3d(0px, ${lerp(200, 330, z).toFixed(2)}px, 0) rotateX(${lerp(0, 22, z).toFixed(3)}deg) rotateZ(${lerp(0, -6, z).toFixed(3)}deg) scale(${lerp(1, 0.36, z).toFixed(4)})`;
      devs.forEach((d, k) => {
        const r = Math.floor(k / 5), c = k % 5;
        if (k === 12) { d.place({ op: 1, zi: 5 }); d.show(t, [{ at: 0, media: S('s09_programmes') }]); return; }
        const op = E.out(clamp((t - 21.6 - Math.hypot(c - 2, r - 2) * 0.18) / 0.7));
        d.place({ x: (c - 2) * PX, y: (r - 2) * PY, op, zi: 1 });
        d.show(t, [{ at: 0, media: S(NAMES[k]) }]);
      });
      scrim.style.opacity = P(t, 21.6, 22.4).toFixed(3);
      rvWords(l1.spans, t, 21.9, null, { stagger: 0.06, dur: 0.8 });
      rvWords(l2.spans, t, 22.3, null, { stagger: 0.06, dur: 0.8 });
    };
  });
  // V8 · end card (closing line of the narration at 24.8 s)
  addScene(24.3, 30.01, (root) => {
    const L = lockup(root, { cx: SW / 2, cy: 700, mark: 104, size: 92, gap: 28 });
    const beyond = centred(root, 'Beyond Training Management.', 'txt', { fontSize: '46px', fontWeight: 500, letterSpacing: '-0.02em' }, 840);
    const ph = ['One Platform.', 'Every Programme.', 'Complete Control.'].map((s) => centred(root, s, 'txt h1', { fontSize: '76px' }, 1000 + 92 * ['One Platform.', 'Every Programme.', 'Complete Control.'].indexOf(s)));
    ph[2].spans.forEach((sp) => sp.classList.add('grad'));
    const support1 = centred(root, 'Designed for the complexity of', 'txt', { fontSize: '30px', color: '#86868b' }, 1340);
    const support2 = centred(root, 'modern executive education.', 'txt', { fontSize: '30px', color: '#86868b' }, 1384);
    const at = [24.87, 26.15, 27.51];
    return (t) => {
      root.style.opacity = P(t, 24.3, 24.7).toFixed(3);
      lockupAnim(L, t, { tm: 24.35, tSlide: null, tw: 24.5, ts: 25.3 });
      rvWords(beyond.spans, t, 24.6, null, { stagger: 0.06, dur: 0.9 });
      ph.forEach((p, i) => p.spans.forEach((s) => rv(s, t, at[i] - 0.08, null, { dur: 0.9, dy: 22 })));
      rvWords(support1.spans, t, 28.4, null, { stagger: 0.04, dy: 12 });
      rvWords(support2.spans, t, 28.6, null, { stagger: 0.04, dy: 12 });
    };
  });
}

// ── Boot ─────────────────────────────────────────────────────────────────────────────────
let TL = null;
async function settle() {
  while (pending.size) await Promise.all([...pending]);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}
window.renderFrame = async (t) => {
  for (const sc of scenes) {
    const on = t >= sc.t0 && t < sc.t1;
    if (on) { sc.root.style.display = 'block'; sc.upd(t); }
    else if (sc.root.style.display !== 'none') sc.root.style.display = 'none';
  }
  updateBG(t);
  await settle();
  return true;
};
window.ready = (async () => {
  await Promise.all([300, 400, 500, 600, 700].map((w) => document.fonts.load(`${w} 40px Inter`)));
  const j = (u) => fetch(u).then((r) => r.json());
  [TL, COLORS, TAPS.readiness, TAPS.home] = await Promise.all([j('timeline.json'), j('../footage/colors.json'), j('../footage/s08_tap.json'), j('../footage/s03_home_tap.json')]);
  if (MODE === 'film') buildFilm(); else buildVertical();
  window.DURATION = MODE === 'film' ? TL.duration : 30;
  if (params.has('t')) await window.renderFrame(parseFloat(params.get('t')));
  return true;
})();
