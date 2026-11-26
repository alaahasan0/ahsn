/* S08 · One ecosystem — S09 · Built for a connected future — S10 · Final reveal */
import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, sec, prog, inOut, E, lerp, Headline, LogoMark, Icon, Grain, Vignette } from '../lib.jsx';

/* ---------------- S08 (sequence starts 64.1 s) ---------------- */
const T8 = 64.1;
const t8 = (abs) => sec(abs - T8);
const NODES = [
  ['Municipality', 'landmark'], ['Owners', 'key'], ['Residents', 'home'], ['Committees', 'gavel'],
  ['Property managers', 'briefcase'], ['Facility teams', 'settings'], ['Service providers', 'wrench'], ['Marketplaces', 'store'],
];
const CX = 720, CY = 1420;

const MiniHubs = ({ f, o }) => {
  const hubs = React.useMemo(() => {
    let s = 5; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const out = [];
    for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 4; gx++) {
      const x = 180 + gx * 360 + (r() - 0.5) * 140, y = 640 + gy * 300 + (r() - 0.5) * 120;
      if (Math.hypot(x - CX, y - CY) < 230) continue;
      out.push({ x, y, n: 4 + Math.floor(r() * 4), rot: r() * 6, d: r() });
    }
    return out;
  }, []);
  const links = [];
  hubs.forEach((a, i) => hubs.forEach((b, j) => { if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 420) links.push([a, b, (i + j) % 7]); }));
  return (
    <svg width="1440" height="2560" style={{ position: 'absolute', inset: 0, opacity: o }}>
      {links.map(([a, b, k], i) => <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.mint} strokeOpacity={0.18} strokeWidth="2" />)}
      {links.filter((l) => l[2] === 0).map(([a, b], i) => { const p = ((f / 50) + i * 0.17) % 1; return <circle key={'p' + i} cx={lerp(a.x, b.x, p)} cy={lerp(a.y, b.y, p)} r="5" fill={C.mint} />; })}
      {hubs.map((h, i) => {
        const p = prog(f, t8(70.9) + h.d * 30, t8(70.9) + h.d * 30 + 20);
        return (
          <g key={i} opacity={p} transform={`translate(${h.x} ${h.y}) scale(${lerp(0.6, 1, p)})`}>
            {Array.from({ length: h.n }, (_, k) => { const a = h.rot + (k / h.n) * Math.PI * 2; return <g key={k}><line x1="0" y1="0" x2={Math.cos(a) * 46} y2={Math.sin(a) * 46} stroke={C.mint} strokeOpacity=".5" strokeWidth="2" /><circle cx={Math.cos(a) * 46} cy={Math.sin(a) * 46} r="6" fill="#fff" opacity=".75" /></g>; })}
            <rect x="-15" y="-15" width="30" height="30" rx="8" fill={C.mint} />
          </g>
        );
      })}
    </svg>
  );
};

export const S08 = () => {
  const f = useCurrentFrame();
  const enter = prog(f, 0, t8(64.7), E.inOut);
  const rot = lerp(-6, 10, prog(f, 0, t8(74.3), E.soft)) * (Math.PI / 180);
  const zoom = prog(f, t8(70.6), t8(72.6), E.inOut);
  const sys = lerp(1, 0.34, zoom);
  const exit = prog(f, t8(73.7), t8(74.3), E.in);
  const center = prog(f, t8(64.4), t8(65.2), E.out);
  const ring = prog(f, t8(67.0), t8(68.4), E.inOut);
  const rx = 470, ry = 560;
  const pos = NODES.map((_, i) => { const a = -Math.PI / 2 + (i / NODES.length) * Math.PI * 2 + rot; return [CX + Math.cos(a) * rx, CY + Math.sin(a) * ry]; });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 85% 60% at 50% 55%, #1F4158 0%, ${C.navy} 50%, ${C.navy3} 100%)`, opacity: enter }}>
      <MiniHubs f={f} o={zoom * (1 - exit)} />
      <AbsoluteFill style={{ transform: `scale(${sys})`, transformOrigin: `${CX}px ${CY}px`, opacity: 1 - exit }}>
        <svg width="1440" height="2560" style={{ position: 'absolute', inset: 0 }}>
          {pos.map(([x, y], i) => {
            const p = prog(f, t8(64.8) + i * 7, t8(64.8) + i * 7 + 18, E.inOut);
            return <line key={'s' + i} x1={CX} y1={CY} x2={lerp(CX, x, p)} y2={lerp(CY, y, p)} stroke={C.mint} strokeWidth="3" strokeOpacity=".55" />;
          })}
          {pos.map(([x, y], i) => {
            const n = pos[(i + 1) % pos.length];
            return <line key={'r' + i} x1={x} y1={y} x2={lerp(x, n[0], ring)} y2={lerp(y, n[1], ring)} stroke="#fff" strokeOpacity=".16" strokeWidth="2" />;
          })}
          {f > t8(67.6) && pos.map(([x, y], i) => {
            const p = ((f - t8(67.6)) / 34 + i * 0.13) % 1;
            const out = i % 2 === 0;
            return <circle key={'d' + i} cx={lerp(out ? CX : x, out ? x : CX, p)} cy={lerp(out ? CY : y, out ? y : CY, p)} r="8" fill={C.mint} opacity={Math.sin(p * Math.PI)} />;
          })}
        </svg>
        {pos.map(([x, y], i) => {
          const p = prog(f, t8(64.95) + i * 7, t8(64.95) + i * 7 + 18);
          return (
            <div key={NODES[i][0]} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${lerp(0.5, 1, p)})`, opacity: p, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 150, height: 150, borderRadius: 150, background: '#fff', display: 'grid', placeItems: 'center', color: C.navy, boxShadow: '0 0 0 10px rgba(255,255,255,.06), 0 20px 50px rgba(0,0,0,.3)' }}><Icon name={NODES[i][1]} size={64} stroke={1.6} /></div>
              <div style={{ fontFamily: FONT.text, fontWeight: 600, fontSize: 32, color: '#fff', whiteSpace: 'nowrap', textShadow: '0 2px 20px rgba(0,0,0,.4)' }}>{NODES[i][0]}</div>
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: CX, top: CY, transform: `translate(-50%,-50%) scale(${lerp(0.4, 1, center)})`, opacity: center }}>
          <div style={{ width: 230, height: 230, borderRadius: 64, background: C.mint, display: 'grid', placeItems: 'center', color: C.navy, boxShadow: `0 0 0 ${18 + Math.sin(f / 12) * 6}px rgba(54,214,160,.16), 0 0 90px rgba(54,214,160,.45)` }}><Icon name="building" size={120} stroke={1.5} /></div>
        </div>
      </AbsoluteFill>
      <Headline lines={['Beyond buildings.', 'An entire ecosystem.']} from={t8(64.9)} to={t8(74.1)} y={270} size={88} accent="An entire ecosystem." />
      <Grain opacity={0.045} />
    </AbsoluteFill>
  );
};

/* ---------------- S09 (sequence starts 73.8 s) ---------------- */
const T9 = 73.8;
const t9 = (abs) => sec(abs - T9);
const MARKS = [
  [0.21, 0.63, 'BN-RAM-00142'], [0.58, 0.57, 'BN-RAM-00311'], [0.80, 0.68, 'BN-RAM-00415'], [0.36, 0.77, 'BN-RAM-00087'],
  [0.68, 0.81, 'BN-RAM-00203'], [0.14, 0.88, 'BN-RAM-00266'], [0.88, 0.51, 'BN-RAM-00618'], [0.47, 0.67, 'BN-RAM-00391'],
];
export const S09 = () => {
  const f = useCurrentFrame();
  const enter = prog(f, 0, t9(74.4), E.inOut);
  const drift = prog(f, 0, t9(83.5), E.soft);
  const exit = prog(f, t9(82.9), t9(83.5), E.in);
  const pts = MARKS.map(([x, y]) => [x * 1440, (y + drift * 0.06) * 2560]);
  const arcs = [[0, 7], [7, 1], [1, 2], [3, 7], [4, 2], [5, 3], [6, 1]];
  return (
    <AbsoluteFill style={{ opacity: enter, background: '#000' }}>
      <AbsoluteFill style={{ transform: `scale(${lerp(1.02, 1.08, drift)})` }}>
        <OffthreadVideo src={staticFile('footage/dawn_rise_1440.mp4')} muted playbackRate={0.85} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.95) contrast(1.03)' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(8,24,40,.78) 0%, rgba(8,24,40,.42) 18%, rgba(8,24,40,0) 36%, rgba(8,24,40,0) 55%, rgba(8,24,40,.5) 100%)' }} />
      <svg width="1440" height="2560" style={{ position: 'absolute', inset: 0 }}>
        {arcs.map(([a, b], i) => {
          const p = prog(f, t9(77.2) + i * 6, t9(77.2) + i * 6 + 24, E.inOut);
          const A = pts[a], Bp = pts[b];
          const mx = (A[0] + Bp[0]) / 2, my = Math.min(A[1], Bp[1]) - 90;
          const d = `M${A[0]} ${A[1]} Q${mx} ${my} ${Bp[0]} ${Bp[1]}`;
          return <path key={i} d={d} fill="none" stroke={C.mint} strokeWidth="3" strokeOpacity={0.75} strokeDasharray="1400" strokeDashoffset={1400 * (1 - p)} />;
        })}
        {pts.map(([x, y], i) => {
          const p = prog(f, t9(75.3) + i * 8, t9(75.3) + i * 8 + 18);
          const pulse = ((f + i * 9) % 60) / 60;
          return (
            <g key={i} opacity={p}>
              <circle cx={x} cy={y} r={22 + pulse * 40} fill="none" stroke={C.mint} strokeWidth="3" opacity={(1 - pulse) * 0.8} />
              <circle cx={x} cy={y} r="13" fill={C.mint} stroke="#fff" strokeWidth="4" />
            </g>
          );
        })}
      </svg>
      {pts.map(([x, y], i) => {
        const p = prog(f, t9(75.6) + i * 8, t9(75.6) + i * 8 + 18);
        if (i % 2 === 1 || p <= 0) return null;
        return <div key={i} style={{ position: 'absolute', left: x, top: y - 70, transform: 'translateX(-50%)', opacity: p, fontFamily: FONT.mono, fontSize: 24, fontWeight: 600, color: '#fff', padding: '6px 14px', borderRadius: 10, background: 'rgba(13,31,43,.72)', border: '1px solid rgba(54,214,160,.5)', whiteSpace: 'nowrap' }}>{MARKS[i][2]}</div>;
      })}
      <Vignette strength={0.35} />
      <Headline lines={['A connected future', 'starts with a building.']} from={t9(75.0)} to={t9(83.3)} y={300} size={90} shadow accent="starts with a building." accentColor="#5FE6B6" />
      <AbsoluteFill style={{ background: C.bg, opacity: exit }} />
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

/* ---------------- S10 (sequence starts 82.9 s) ---------------- */
const T10 = 82.9;
const t10 = (abs) => sec(abs - T10);
const WORDS = [['Buildings.', 84.8], ['People.', 85.85], ['Services.', 86.72], ['Connected.', 87.95]];
export const S10 = () => {
  const f = useCurrentFrame();
  const bg = prog(f, 0, t10(83.5), E.inOut);
  const mark = prog(f, t10(83.4), t10(84.3), E.out);
  const bars = prog(f, t10(83.5), t10(84.4), E.out);
  const dot = prog(f, t10(84.1), t10(84.5), E.out);
  const word = prog(f, t10(83.75), t10(84.6), E.out);
  const rule = prog(f, t10(84.4), t10(85.4), E.inOut);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 55% at 50% 45%, #FFFFFF 0%, ${C.bg} 70%)`, opacity: bg }}>
      <div style={{ position: 'absolute', left: 720 - 130, top: 1000 - 130, transform: `scale(${lerp(0.6, 1, mark)})`, opacity: mark, filter: `drop-shadow(0 30px 60px rgba(20,43,59,${0.18 * mark}))` }}>
        <LogoMark size={260} bars={bars} dot={dot} />
      </div>
      <div style={{ position: 'absolute', top: 1190, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 176, letterSpacing: '0.16em', paddingLeft: '0.16em', color: C.navy, opacity: word, filter: `blur(${(1 - word) * 10}px)`, transform: `translateY(${(1 - word) * 24}px)` }}>BENA</div>
      <div style={{ position: 'absolute', top: 1430, left: 720 - 160 * rule, width: 320 * rule, height: 5, borderRadius: 5, background: C.mint }} />
      <div style={{ position: 'absolute', top: 1500, left: 0, right: 0, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 24px', paddingInline: 100 }}>
        {WORDS.map(([w, at], i) => {
          const base = prog(f, t10(84.3), t10(84.9));
          const p = prog(f, t10(at) - 3, t10(at) + 12);
          return <span key={w} style={{ fontFamily: FONT.display, fontWeight: i === 3 ? 700 : 600, fontSize: 62, color: i === 3 ? C.mintInk : C.navy, opacity: base * lerp(0.16, 1, p), transform: `translateY(${(1 - p) * 6}px)`, display: 'inline-block' }}>{w}</span>;
        })}
      </div>
      <div style={{ position: 'absolute', top: 2405, left: 0, right: 0, textAlign: "center", fontFamily: FONT.text, fontWeight: 500, fontSize: 25, letterSpacing: '0.06em', color: C.slate, opacity: prog(f, t10(86.0), t10(87.0)) * 0.85 }}>
        Concept film · interfaces shown with demonstration data
      </div>
      <Grain opacity={0.025} />
    </AbsoluteFill>
  );
};
