/*
 * Shared film building blocks: brand tokens, fonts, easing, devices, text.
 */
import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing, continueRender, delayRender } from 'remotion';
import timeline from './data/timeline.json';
import manifest from '../public/shots/manifest.json';

export const T = timeline;
export const FPS = T.fps;
export const W = T.width;
export const H = T.height;
export const sec = (s) => Math.round(s * FPS);

export const C = {
  navy: '#142B3B', navy2: '#1D3B50', navy3: '#0D1F2B', navyInk: '#C9D6DF',
  mint: '#36D6A0', mintInk: '#0B8A60', mint50: '#E8FAF3',
  bg: '#F4F7F6', slate: '#64748B', white: '#FFFFFF', ink: '#142B3B', line: '#E2E9E6',
};
export const FONT = {
  display: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
  text: '"Inter", system-ui, sans-serif',
  ar: '"IBM Plex Sans Arabic", "Noto Sans Arabic", sans-serif',
  mono: '"SF Mono", "JetBrains Mono", Menlo, Consolas, monospace',
};

/* ---------- fonts (loaded once, render waits for them) ---------- */
const FACES = [
  ['Inter', 'inter-latin-300-normal', 300], ['Inter', 'inter-latin-400-normal', 400], ['Inter', 'inter-latin-500-normal', 500], ['Inter', 'inter-latin-600-normal', 600], ['Inter', 'inter-latin-700-normal', 700],
  ['Plus Jakarta Sans', 'plus-jakarta-sans-latin-500-normal', 500], ['Plus Jakarta Sans', 'plus-jakarta-sans-latin-600-normal', 600], ['Plus Jakarta Sans', 'plus-jakarta-sans-latin-700-normal', 700], ['Plus Jakarta Sans', 'plus-jakarta-sans-latin-800-normal', 800],
  ['IBM Plex Sans Arabic', 'ibm-plex-sans-arabic-arabic-400-normal', 400], ['IBM Plex Sans Arabic', 'ibm-plex-sans-arabic-arabic-500-normal', 500], ['IBM Plex Sans Arabic', 'ibm-plex-sans-arabic-arabic-600-normal', 600], ['IBM Plex Sans Arabic', 'ibm-plex-sans-arabic-arabic-700-normal', 700],
];
let fontsLoaded = false;
export const useFonts = () => {
  const [handle] = React.useState(() => (fontsLoaded ? null : delayRender('fonts')));
  React.useEffect(() => {
    if (!handle) return;
    Promise.all(FACES.map(([fam, file, weight]) => {
      const f = new FontFace(fam, `url(${staticFile(`fonts/${file}.woff2`)}) format("woff2")`, { weight: String(weight) });
      return f.load().then((ff) => document.fonts.add(ff));
    })).then(() => { fontsLoaded = true; continueRender(handle); }).catch((e) => { console.error(e); continueRender(handle); });
  }, [handle]);
};

/* ---------- easing helpers ---------- */
export const E = {
  out: Easing.bezier(0.22, 1, 0.36, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  soft: Easing.bezier(0.33, 0, 0.2, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
};
/** progress 0..1 between frames a and b with easing */
export const prog = (f, a, b, ease = E.out) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
export const lerp = (a, b, t) => a + (b - a) * t;
/** fade in over [a, a+d] and out over [b-d2, b] */
export const inOut = (f, a, b, d = 18, d2 = 14) => Math.min(prog(f, a, a + d), 1 - prog(f, b - d2, b, E.in));

export const shot = (id) => ({ src: staticFile(`shots/${id}.png`), ...(manifest[id] || {}) });

/* ---------- on-screen headline ---------- */
/** Headline: lines reveal with rise + de-blur, staggered. */
export const Headline = ({ lines, from, to, y = 300, color = C.white, size = 92, accent = null, accentColor = C.mint, align = 'center', weight = 700, stagger = 7, shadow = false, maxWidth = 1180 }) => {
  const f = useCurrentFrame();
  if (f < from - 2 || f > to + 2) return null;
  return (
    <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', paddingInline: 130, gap: size * 0.08 }}>
      {lines.map((ln, i) => {
        const a = from + i * stagger;
        const p = prog(f, a, a + 26);
        const out = prog(f, to - 14, to, E.in);
        return (
          <div key={i} style={{
            fontFamily: FONT.display, fontWeight: weight, fontSize: size, lineHeight: 1.08, letterSpacing: '-0.025em', color: accent && ln === accent ? accentColor : color,
            textAlign: align, maxWidth, opacity: p * (1 - out), transform: `translateY(${(1 - p) * 34 - out * 10}px)`, filter: `blur(${(1 - p) * 10 + out * 6}px)`,
            textShadow: shadow ? '0 4px 40px rgba(5,15,25,.45)' : 'none', textWrap: 'balance',
          }}>{ln}</div>
        );
      })}
    </div>
  );
};

export const Eyebrow = ({ text, from, to, y, color = C.mint }) => {
  const f = useCurrentFrame();
  const o = inOut(f, from, to, 20, 12);
  if (o <= 0) return null;
  return <div style={{ position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.text, fontWeight: 600, fontSize: 30, letterSpacing: '0.18em', textTransform: 'uppercase', color, opacity: o }}>{text}</div>;
};

/** Small persistent honesty label for interface scenes. */
export const DemoLabel = ({ from, to, dark = false }) => {
  const f = useCurrentFrame();
  const o = inOut(f, from, to, 20, 12) * 0.9;
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', top: 196, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT.text, fontWeight: 500, fontSize: 25, letterSpacing: '0.04em', color: dark ? 'rgba(201,214,223,.8)' : C.slate, padding: '9px 20px', borderRadius: 99, border: `1px solid ${dark ? 'rgba(255,255,255,.14)' : 'rgba(20,43,59,.12)'}`, background: dark ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.6)' }}>
        <span style={{ width: 9, height: 9, borderRadius: 9, background: C.mint }} />
        Prototype interface · demonstration data
      </div>
    </div>
  );
};

/* ---------- devices ---------- */
const StatusBar = ({ dark = false, bg = '#F4F7F6' }) => (
  <div style={{ height: 44, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px 0 34px', fontFamily: FONT.text, fontWeight: 600, fontSize: 15, color: dark ? '#fff' : '#142B3B', position: 'relative' }}>
    <span>9:41</span>
    <div style={{ position: 'absolute', left: '50%', top: 9, width: 112, height: 30, marginLeft: -56, borderRadius: 20, background: '#05080B' }} />
    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor" /><rect x="4.5" y="5" width="3" height="6" rx="1" fill="currentColor" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="currentColor" /><rect x="13.5" y="0" width="3" height="11" rx="1" fill="currentColor" /></svg>
      <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".45" /><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" /><rect x="23" y="4" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".45" /></svg>
    </span>
  </div>
);

/**
 * iPhone-style frame showing a captured BENA screen.
 * id: shot id (phone capture); scroll: logical px scrolled (0..max); scale: logical→px.
 */
export const Phone = ({ id, scroll = 0, scale = 2.1, style = {}, children, overlay = null, cross = null, crossT = 0 }) => {
  const s = shot(id);
  const screenW = 390, screenH = 844, bezel = 13;
  const contentH = screenH - 44;
  const imgH = (s.h || 2532) / 3;
  const maxScroll = Math.max(0, imgH - contentH);
  const y = Math.min(scroll, maxScroll);
  const layer = (sid, yy, op) => {
    const ss = shot(sid);
    const ih = (ss.h || 2532) / 3;
    const ms = Math.max(0, ih - contentH);
    return (
      <div style={{ position: 'absolute', inset: 0, opacity: op }}>
        <Img src={ss.src} style={{ position: 'absolute', left: 0, top: -Math.min(yy, ms), width: screenW, height: ih }} />
        {ss.bar ? <Img src={staticFile(`shots/${sid}_bar.png`)} style={{ position: 'absolute', left: 0, top: 0, width: screenW, height: ss.bar / 3 }} /> : null}
        {ss.tab ? <Img src={staticFile(`shots/${sid}_tab.png`)} style={{ position: 'absolute', left: 0, bottom: 0, width: screenW, height: ss.tab / 3 }} /> : null}
      </div>
    );
  };
  return (
    <div style={{ position: 'absolute', width: (screenW + bezel * 2) * scale, height: (screenH + bezel * 2) * scale, ...style }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0', width: screenW + bezel * 2, height: screenH + bezel * 2, borderRadius: 64, background: 'linear-gradient(145deg,#2B3A46,#0B1218 40%,#1A252E)', padding: bezel, boxShadow: '0 40px 80px rgba(8,20,30,.35), 0 0 0 1.2px rgba(255,255,255,.12) inset', position: 'relative' }}>
        <div style={{ width: screenW, height: screenH, borderRadius: 52, overflow: 'hidden', background: '#F4F7F6', position: 'relative' }}>
          <StatusBar />
          <div style={{ position: 'absolute', top: 44, left: 0, width: screenW, height: contentH, overflow: 'hidden' }}>
            {layer(id, y, 1)}
            {cross ? layer(cross.id, cross.scroll || 0, crossT) : null}
            {overlay}
          </div>
          <div style={{ position: 'absolute', bottom: 8, left: '50%', width: 134, marginLeft: -67, height: 5, borderRadius: 3, background: 'rgba(20,43,59,.85)' }} />
        </div>
        {children}
      </div>
    </div>
  );
};
export const phoneMaxScroll = (id) => Math.max(0, (shot(id).h || 2532) / 3 - 800);

/** Tablet frame for 820-wide captures (2x). */
export const Tablet = ({ id, scroll = 0, width = 1080, style = {}, cross = null, crossT = 0, viewH = 1180 }) => {
  const bez = 22;
  const sw = 820, sh = viewH;
  const scale = width / (sw + bez * 2);
  const layer = (sid, yy, op) => {
    const ss = shot(sid);
    const ih = (ss.h || 2360) / 2;
    return <Img src={ss.src} style={{ position: 'absolute', left: 0, top: -Math.min(yy, Math.max(0, ih - sh)), width: sw, height: ih, opacity: op }} />;
  };
  return (
    <div style={{ position: 'absolute', width, height: (sh + bez * 2) * scale, ...style }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0', width: sw + bez * 2, height: sh + bez * 2, borderRadius: 54, background: 'linear-gradient(145deg,#2B3A46,#0B1218 45%,#1A252E)', padding: bez, boxShadow: '0 50px 100px rgba(8,20,30,.32), 0 0 0 1.2px rgba(255,255,255,.1) inset' }}>
        <div style={{ width: sw, height: sh, borderRadius: 34, overflow: 'hidden', position: 'relative', background: '#F4F7F6' }}>
          {layer(id, scroll, 1)}
          {cross ? layer(cross.id, cross.scroll || 0, crossT) : null}
        </div>
      </div>
    </div>
  );
};
export const tabletMaxScroll = (id, viewH = 1180) => Math.max(0, (shot(id).h || 2360) / 2 - viewH);

/* ---------- brand mark ---------- */
export const LogoMark = ({ size = 300, bars = 1, dot = 1, square = 1, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
    <rect width="40" height="40" rx="11" fill={C.mint} opacity={square} />
    <g opacity={Math.min(1, bars * 2)} transform={`translate(${(1 - Math.min(1, bars * 2)) * -6} 0)`}><path d="M12 10h10.5a5 5 0 0 1 0 10H12z" fill={C.navy} /><rect x="15.5" y="13.5" width="3" height="3" rx=".8" fill={C.mint} /></g>
    <g opacity={Math.max(0, Math.min(1, bars * 2 - 1))} transform={`translate(${(1 - Math.max(0, Math.min(1, bars * 2 - 1))) * -6} 0)`}><path d="M12 20h12a5 5 0 0 1 0 10H12z" fill={C.navy} opacity=".72" /><rect x="15.5" y="23.5" width="3" height="3" rx=".8" fill={C.mint} /></g>
    <circle cx="29" cy="11" r={2.6 * dot} fill="#fff" />
  </svg>
);

/* ---------- pills / chips ---------- */
export const Pill = ({ children, dark = false, icon = null, style = {}, mono = false }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '16px 26px', borderRadius: 99, background: dark ? 'rgba(20,43,59,.92)' : 'rgba(255,255,255,.96)', color: dark ? '#fff' : C.ink, fontFamily: mono ? FONT.mono : FONT.text, fontWeight: 600, fontSize: 32, boxShadow: '0 18px 40px rgba(8,20,30,.18)', border: dark ? '1px solid rgba(255,255,255,.12)' : '1px solid rgba(20,43,59,.06)', whiteSpace: 'nowrap', ...style }}>
    {icon}
    {children}
  </div>
);
export const Dot = ({ color = C.mint, size = 14 }) => <span style={{ width: size, height: size, borderRadius: size, background: color, display: 'inline-block', flex: 'none' }} />;

/* ---------- atmosphere ---------- */
export const Grain = ({ opacity = 0.05 }) => {
  const f = useCurrentFrame();
  const x = (f * 137) % 512, y = (f * 251) % 512;
  return <AbsoluteFill style={{ backgroundImage: `url(${staticFile('images/grain.png')})`, backgroundPosition: `${x}px ${y}px`, opacity, mixBlendMode: 'overlay', pointerEvents: 'none' }} />;
};
export const Vignette = ({ strength = 0.45 }) => <AbsoluteFill style={{ background: `radial-gradient(ellipse 85% 70% at 50% 48%, rgba(0,0,0,0) 55%, rgba(4,12,20,${strength}) 100%)`, pointerEvents: 'none' }} />;

/* ---------- icons (subset of the BENA icon set) ---------- */
export const ICONS = {
  landmark: '<path d="M3 21h18M4 10h16M12 3l8 5H4z"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/>',
  key: '<circle cx="8" cy="15" r="4.5"/><path d="m11.2 11.8 8.3-8.3M16.5 6.5l2.5 2.5M14.5 8.5l2 2"/>',
  home: '<path d="M3.5 10.5 12 4l8.5 6.5"/><path d="M5.5 9v10.5h13V9"/><path d="M10 19.5v-5h4v5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.4-3.4a6 6 0 0 1-7.9 7.9L6.3 20.7a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
  store: '<path d="M4 9.5V20h16V9.5"/><path d="M3 9.5 5 4h14l2 5.5c0 1.4-1.1 2.5-2.5 2.5S16 10.9 16 9.5c0 1.4-1.1 2.5-2.5 2.5h-3C9.1 12 8 10.9 8 9.5 8 10.9 6.9 12 5.5 12S3 10.9 3 9.5z"/><path d="M10 20v-4.5h4V20"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10.5 21v-3h3v3"/>',
  sparkles: '<path d="M10 3.5 11.6 8 16 9.6 11.6 11.2 10 15.6 8.4 11.2 4 9.6 8.4 8z"/><path d="M17.5 13.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  droplet: '<path d="M12 3s6.5 6.6 6.5 11.3a6.5 6.5 0 0 1-13 0C5.5 9.6 12 3 12 3z"/>',
  zap: '<path d="M13 2.5 4.5 13.5H12l-1 8 8.5-11H12z"/>',
  wind: '<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h7"/>',
  elevator: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M7.5 9.5 9 8l1.5 1.5M13.5 14.5 15 16l1.5-1.5"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6z"/>',
  shieldCheck: '<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12 2.2 2.2 4.3-4.4"/>',
  fingerprint: '<path d="M6.5 6.5A7.8 7.8 0 0 1 19.8 12c0 1.5-.2 3-.6 4.3M4.2 10.5a8 8 0 0 0-.2 1.5c0 2.6.6 4.6 1.6 6.3"/><path d="M8 18.8A11 11 0 0 1 8 12a4 4 0 0 1 8 0c0 2.4-.3 4.6-1 6.6M12 12c0 3.4-.6 6.2-1.8 8.5"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  stack: '<rect x="4" y="13" width="16" height="7" rx="1.5"/><path d="M6 13V9.5h12V13M8 9.5V6h8v3.5"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  gavel: '<path d="m14 4 6 6M11.5 6.5l6 6M13 5l-5 5 6 6 5-5M10.5 13.5 3.5 20.5"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  contract: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M8.5 17c1.5-2 2.5-2 3 0s1.8 1.5 3.5-.5M9 9h3M9 12.5h6"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
  wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><rect x="4" y="8" width="16.5" height="11" rx="2.5"/><path d="M16 13.5h1.5"/>',
};
export const Icon = ({ name, size = 40, color = 'currentColor', stroke = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }} />
);
