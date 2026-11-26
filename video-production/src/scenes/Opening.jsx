/* S01 · Every building has a story  —  S02 · Introducing BENA */
import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { C, FONT, sec, prog, inOut, E, lerp, Headline, LogoMark, Grain, Vignette } from '../lib.jsx';

/* Tower outline in the tower still's pixel space (1520×2688). */
const TOWER = 'M560 218 L968 218 L968 288 L1222 288 L1222 2556 L298 2556 L298 288 L560 288 Z';
const FLOORS = Array.from({ length: 14 }, (_, i) => 330 + i * 152);

export const TowerIdentity = ({ f, drawFrom, glow = 0, floorsFrom, dim = 0, scale = 1, idFrom = 9999, hideImage = false }) => {
  const draw = prog(f, drawFrom, drawFrom + 54, E.inOut);
  const len = 7400;
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: '50% 48%' }}>
      {!hideImage && <Img src={staticFile('images/tower_a.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `saturate(${1 - dim * 0.7}) brightness(${1 - dim * 0.55})` }} />}
      {!hideImage && <AbsoluteFill style={{ background: C.navy, opacity: dim * 0.55, mixBlendMode: 'multiply' }} />}
      <svg viewBox="0 0 1520 2688" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs><filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10" /></filter></defs>
        {glow > 0 && <path d={TOWER} fill="none" stroke={C.mint} strokeWidth="18" opacity={glow * 0.55} filter="url(#glow)" />}
        <path d={TOWER} fill={C.mint} fillOpacity={glow * 0.06} stroke={C.mint} strokeWidth="6" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
        {FLOORS.map((y, i) => {
          const p = prog(f, floorsFrom + i * 1.6, floorsFrom + i * 1.6 + 16);
          return <line key={y} x1={298} x2={298 + 924 * p} y1={y} y2={y} stroke={C.mint} strokeWidth="2" opacity={0.55 * p} />;
        })}
        {[[298, 288], [1222, 288], [298, 2556], [1222, 2556]].map(([x, y], i) => {
          const p = prog(f, drawFrom + 40 + i * 3, drawFrom + 56 + i * 3);
          return <circle key={i} cx={x} cy={y} r={14 * p} fill={C.navy} stroke={C.mint} strokeWidth="5" opacity={p} />;
        })}
      </svg>
      {f >= idFrom && (
        <div style={{ position: 'absolute', left: '50%', top: 1660, transform: `translateX(-50%) translateY(${(1 - prog(f, idFrom, idFrom + 22)) * 30}px)`, opacity: prog(f, idFrom, idFrom + 22) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '20px 30px', borderRadius: 22, background: 'rgba(13,31,43,.88)', border: '1px solid rgba(54,214,160,.45)', boxShadow: '0 0 60px rgba(54,214,160,.25)' }}>
            <span style={{ fontFamily: FONT.text, fontWeight: 600, fontSize: 26, letterSpacing: '0.14em', color: C.mint }}>BUILDING ID</span>
            <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 38, color: '#fff', letterSpacing: '0.04em' }}>BN-RAM-00142</span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const S01 = () => {
  const f = useCurrentFrame();
  const vIn = prog(f, 10, 80, E.soft);
  const toTower = prog(f, sec(4.9), sec(6.0), E.inOut);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <AbsoluteFill style={{ opacity: vIn * (1 - toTower) }}>
        <AbsoluteFill style={{ transform: `scale(${lerp(1.02, 1.14, prog(f, 0, sec(6.2), E.soft))})` }}>
          <OffthreadVideo src={staticFile('footage/aerial_dusk_1440.mp4')} muted style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.92) contrast(1.05)' }} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(6,16,26,.72) 0%, rgba(6,16,26,.15) 32%, rgba(6,16,26,0) 55%, rgba(6,16,26,.55) 100%)' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: toTower }}>
        <TowerIdentity f={f} drawFrom={sec(5.7)} floorsFrom={sec(6.5)} glow={prog(f, sec(7.0), sec(8.0))} dim={prog(f, sec(6.8), sec(8.2), E.inOut)} scale={lerp(1.0, 1.07, prog(f, sec(4.9), sec(8.2), E.soft))} idFrom={sec(7.2)} />
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(6,16,26,.75) 0%, rgba(6,16,26,0) 30%)' }} />
      </AbsoluteFill>
      <Vignette strength={0.5} />
      <Headline lines={['Every building', 'has a story.']} from={sec(1.15)} to={sec(4.6)} y={330} size={104} shadow />
      <Headline lines={['But what if every building', 'had an identity?']} from={sec(5.4)} to={sec(8.2)} y={330} size={88} accent="had an identity?" shadow stagger={9} />
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};

/* ---------------- S02 ---------------- */
const Network = ({ f, opacity }) => {
  const nodes = React.useMemo(() => {
    let s = 11; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    return Array.from({ length: 34 }, () => [r() * 1440, 300 + r() * 1900, 0.4 + r() * 0.6]);
  }, []);
  const t = f / 30;
  const pts = nodes.map(([x, y, z], i) => [x + Math.sin(t * 0.3 + i) * 14 * z, y + Math.cos(t * 0.25 + i * 1.3) * 18 * z, z]);
  const lines = [];
  pts.forEach((a, i) => pts.forEach((b, j) => { if (j > i && Math.hypot(a[0] - b[0], a[1] - b[1]) < 330) lines.push([a, b]); }));
  return (
    <svg width="1440" height="2560" style={{ position: 'absolute', inset: 0, opacity }}>
      {lines.map(([a, b], i) => <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.mint} strokeOpacity={0.12} strokeWidth="1.5" />)}
      {pts.map(([x, y, z], i) => <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 5 : 3} fill={C.mint} opacity={0.35 + z * 0.4} />)}
    </svg>
  );
};

export const LOGO_CENTER = [720, 1040];
export const LOGO_SIZE = 300;
export const S02 = () => {
  const f = useCurrentFrame();
  // continuity: tower outline collapses into the mark
  const collapse = prog(f, 0, 26, E.inOut);
  const mark = prog(f, 8, 40, E.out);
  const bars = prog(f, 14, 44, E.out);
  const dot = prog(f, 36, 52, E.out);
  const tagT = sec(11.35 - 8.2);
  const words = ['Buildings.', 'People.', 'Services.', 'Connected.'];
  const exit = prog(f, sec(15.2 - 8.2), sec(16.4 - 8.2), E.in);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 55% at 50% 42%, #1E3E54 0%, ${C.navy} 55%, ${C.navy3} 100%)` }}>
      <Network f={f} opacity={prog(f, 10, 60) * 0.9 * (1 - exit * 0.6)} />
      {collapse < 1 && (
        <AbsoluteFill style={{ opacity: 1 - collapse, transform: `scale(${lerp(1.07, 0.16, collapse)})`, transformOrigin: '50% 40%' }}>
          <TowerIdentity f={200} drawFrom={0} floorsFrom={0} glow={1} dim={1} hideImage />
        </AbsoluteFill>
      )}
      <div style={{ position: 'absolute', left: LOGO_CENTER[0] - LOGO_SIZE / 2, top: LOGO_CENTER[1] - LOGO_SIZE / 2, transform: `scale(${lerp(0.55, 1, mark) * (1 + exit * 0.05)})`, opacity: mark, filter: `drop-shadow(0 30px 60px rgba(54,214,160,${0.25 * mark}))` }}>
        <LogoMark size={LOGO_SIZE} bars={bars} dot={dot} />
      </div>
      <div style={{ position: 'absolute', top: 1270, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.display, fontWeight: 700, fontSize: 112, letterSpacing: '-0.02em', color: '#fff', opacity: prog(f, 14, 40) * (1 - exit), transform: `translateY(${(1 - prog(f, 14, 40)) * 30}px)`, filter: `blur(${(1 - prog(f, 14, 40)) * 8}px)` }}>
        <span style={{ color: C.navyInk, fontWeight: 500 }}>Meet </span>BENA.
      </div>
      <div style={{ position: 'absolute', top: 1460, left: 0, right: 0, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 26px', paddingInline: 120 }}>
        {words.map((w, i) => {
          const p = prog(f, tagT + i * 9, tagT + i * 9 + 22);
          return <span key={w} style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 64, color: i === 3 ? C.mint : '#fff', opacity: p * (1 - exit), transform: `translateY(${(1 - p) * 24}px)`, filter: `blur(${(1 - p) * 6}px)`, display: 'inline-block' }}>{w}</span>;
        })}
      </div>
      <div style={{ position: 'absolute', top: 1640, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.text, fontWeight: 500, fontSize: 32, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(201,214,223,.7)', opacity: prog(f, tagT + 46, tagT + 70) * (1 - exit) }}>
        A connected building ecosystem
      </div>
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
