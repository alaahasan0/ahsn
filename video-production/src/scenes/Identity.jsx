/* S03 · A digital identity for every building  —  S04 · Connected to cities */
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, sec, prog, inOut, E, lerp, Headline, Phone, Tablet, Pill, Dot, Icon, Grain, DemoLabel, shot } from '../lib.jsx';
import buildings from '../data/buildings.json';
import manifest from '../../public/shots/manifest.json';

const B142 = buildings.find((b) => b.id === 'BN-RAM-00142');
const V1 = manifest.map_city_type.view; // wide view
const V2 = manifest.map_zoom.view;      // zoom view
const S1 = 1440 / V1.w, S2 = 1440 / V2.w;

/* S03 sequence starts at 15.6 s (overlaps the end of S02). */
const T0 = 15.6;
const t = (abs) => sec(abs - T0);

export const S03 = () => {
  const f = useCurrentFrame();
  // circle reveal from the logo dot
  const rev = prog(f, 0, t(16.55), E.inOut);
  const radius = lerp(0, 3200, rev);
  // zoom from the wide map to the tower district
  const z = prog(f, t(17.3), t(19.1), E.inOut);
  const k = lerp(1, S2 / S1, z);
  const tx = lerp(0, (V1.x - V2.x) * S2, z);
  const ty = lerp(0, (V1.y - V2.y) * S2, z);
  const drift = lerp(1.0, 1.035, prog(f, 0, t(17.3), E.soft));
  const sharp = prog(f, t(18.85), t(19.2));
  const push = lerp(1, 1.12, prog(f, t(19.1), t(26.4), E.soft));
  const c = [(B142.c[0] - V2.x) * S2, (B142.c[1] - V2.y) * S2];
  const draw = prog(f, t(19.15), t(20.3), E.inOut);
  const fillP = prog(f, t(19.9), t(20.6));
  const phoneIn = prog(f, t(20.8), t(21.9), E.out);
  const dimMap = prog(f, t(20.7), t(21.8), E.inOut);
  const scrollA = lerp(0, 600, prog(f, t(22.0), t(23.6), E.inOut));
  const crossT = prog(f, t(23.7), t(24.25), E.inOut);
  const scrollB = 690;
  const exit = prog(f, sec(26.0 - T0), sec(26.6 - T0), E.in);
  const len = 400;
  const poly = B142.poly.map((p) => `${((p[0] - V2.x) * S2).toFixed(1)},${((p[1] - V2.y) * S2).toFixed(1)}`).join(' ');
  const callouts = [
    { at: 24.25, label: 'BENA Building ID', x: 40, y: 860, icon: 'fingerprint' },
    { at: 24.55, label: 'Municipal reference', x: 960, y: 1230, icon: 'landmark' },
    { at: 24.85, label: 'Land parcel & permit', x: 30, y: 1460, icon: 'contract' },
    { at: 25.15, label: 'Location', x: 1010, y: 1720, icon: 'pin' },
  ];
  return (
    <AbsoluteFill style={{ clipPath: `circle(${radius}px at 787px 972px)`, background: '#EDF2EF' }}>
      {/* map layers */}
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `${c[0]}px ${c[1]}px`, filter: `blur(${dimMap * 6}px)` }}>
        <AbsoluteFill style={{ transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${k * drift})` }}>
          <Img src={shot('map_city_type').src} style={{ width: 1440, height: 2559 }} />
        </AbsoluteFill>
        <AbsoluteFill style={{ opacity: sharp }}>
          <Img src={shot('map_zoom').src} style={{ width: 1440, height: 2559 }} />
        </AbsoluteFill>
        <svg width="1440" height="2560" style={{ position: 'absolute', inset: 0, opacity: sharp }}>
          {[0, 1, 2].map((i) => {
            const p = ((f - t(19.6) - i * 16) % 48) / 48;
            if (f < t(19.6) + i * 16) return null;
            return <circle key={i} cx={c[0]} cy={c[1]} r={60 + p * 260} fill="none" stroke={C.mint} strokeWidth={4} opacity={(1 - p) * 0.7} />;
          })}
          <polygon points={poly} fill={C.mint} fillOpacity={0.35 * fillP} stroke={C.navy} strokeWidth={6} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} strokeLinejoin="round" />
        </svg>
        {f > t(19.8) && (
          <div style={{ position: 'absolute', left: c[0] - 330, top: c[1] - 300, opacity: prog(f, t(19.8), t(20.3)), transform: `translateY(${(1 - prog(f, t(19.8), t(20.3))) * 20}px)` }}>
            <Pill dark icon={<Dot />}><span style={{ fontFamily: FONT.mono, letterSpacing: '0.02em' }}>BN-RAM-00142</span><span style={{ color: C.navyInk, fontWeight: 500 }}>· Al-Masyoun Tower</span></Pill>
          </div>
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.bg, opacity: dimMap * 0.62 }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(244,247,246,.96) 0%, rgba(244,247,246,.75) 16%, rgba(244,247,246,0) 30%)' }} />
      <Headline lines={['One building.', 'One digital identity.']} from={t(17.0)} to={t(26.3)} y={270} color={C.navy} size={92} accent="One digital identity." accentColor={C.mintInk} />
      {/* phone with the real Building Profile */}
      {phoneIn > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, transform: `translateY(${(1 - phoneIn) * 1500 + exit * 1600}px)` }}>
          <Phone id="p_profile_overview" scroll={scrollA} scale={1.86} style={{ left: (1440 - 416 * 1.86) / 2, top: 600 }} cross={{ id: 'p_profile_identity', scroll: scrollB }} crossT={crossT} />
          {callouts.map((co) => {
            const p = prog(f, t(co.at), t(co.at) + 16);
            if (p <= 0) return null;
            return (
              <div key={co.label} style={{ position: 'absolute', left: co.x, top: co.y, opacity: p, transform: `scale(${lerp(0.9, 1, p)})` }}>
                <Pill icon={<span style={{ color: C.mintInk, display: 'flex' }}><Icon name={co.icon} size={36} /></span>}>{co.label}</Pill>
              </div>
            );
          })}
        </div>
      )}
      <DemoLabel from={t(21.0)} to={t(26.2)} />
      <Grain opacity={0.035} />
    </AbsoluteFill>
  );
};

/* ---------------- S04 · Connected to cities (sequence starts 26.0 s) ---------------- */
const T4 = 26.0;
const t4 = (abs) => sec(abs - T4);
export const S04 = () => {
  const f = useCurrentFrame();
  const bgIn = prog(f, 0, t4(26.7));
  const tab = prog(f, t4(26.5), t4(27.6), E.out);
  const c1 = prog(f, t4(29.9), t4(30.4), E.inOut);
  const c2 = prog(f, t4(32.5), t4(33.0), E.inOut);
  const s1 = lerp(0, 760, prog(f, t4(30.3), t4(32.6), E.inOut));
  const s2 = lerp(0, 330, prog(f, t4(33.0), t4(34.9), E.inOut));
  const exit = prog(f, t4(34.7), t4(35.4), E.in);
  const link = prog(f, t4(27.6), t4(28.4), E.out);
  const linkPulse = (Math.sin(f / 6) + 1) / 2;
  const tabW = 1080, tabX = (1440 - tabW) / 2, tabY = 700;
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: bgIn }}>
      <AbsoluteFill style={{ opacity: 0.16, transform: `scale(${lerp(1.1, 1.18, prog(f, 0, t4(35.4), E.soft))})`, filter: 'blur(2px)' }}>
        <Img src={shot('map_city_ver').src} style={{ width: 1440, height: 2559 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(244,247,246,1) 0%, rgba(244,247,246,.6) 25%, rgba(244,247,246,.2) 60%, rgba(244,247,246,.9) 100%)' }} />
      <Headline lines={['Connecting buildings.', 'Connecting cities.']} from={t4(26.9)} to={t4(34.9)} y={270} color={C.navy} size={88} accent="Connecting cities." accentColor={C.mintInk} />
      {/* municipal reference ⇄ BENA identity */}
      <div style={{ position: 'absolute', top: 520, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: link * (1 - exit), transform: `translateY(${(1 - link) * 24}px)` }}>
        <Pill icon={<span style={{ color: C.navy, display: 'flex' }}><Icon name="landmark" size={34} /></span>} style={{ fontSize: 28, padding: '14px 22px' }}><span style={{ color: C.slate, fontWeight: 500 }}>Municipal ref.</span><span style={{ fontFamily: FONT.mono }}>RM-GIS-48217</span></Pill>
        <div style={{ width: 66, height: 66, borderRadius: 66, background: C.mint, display: 'grid', placeItems: 'center', color: C.navy, boxShadow: `0 0 ${20 + linkPulse * 30}px rgba(54,214,160,.6)` }}><Icon name="link" size={34} stroke={2.2} /></div>
        <Pill dark icon={<Dot />} style={{ fontSize: 28, padding: '14px 22px' }}><span style={{ color: C.navyInk, fontWeight: 500 }}>BENA ID</span><span style={{ fontFamily: FONT.mono }}>BN-RAM-00142</span></Pill>
      </div>
      <svg width="1440" height="2560" style={{ position: 'absolute', inset: 0, opacity: link * (1 - exit) }}>
        {[360, 720, 1080].map((x, i) => {
          const dash = (f * 2.2 + i * 20) % 40;
          return <g key={x}><path d={`M720 600 C720 640 ${x} 640 ${x} ${tabY + 20}`} fill="none" stroke={C.mint} strokeWidth="3" strokeDasharray="10 10" strokeDashoffset={-dash} opacity=".8" /></g>;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, perspective: 2400, transform: `translateY(${exit * 80}px)`, opacity: 1 - exit }}>
        <div style={{ position: 'absolute', inset: 0, transform: `translateX(${(1 - tab) * 900}px) rotateY(${(1 - tab) * -24}deg)`, opacity: tab, transformOrigin: '50% 60%' }}>
          <Tablet id="t_muni_explorer" width={tabW} style={{ left: tabX, top: tabY }} />
          <div style={{ position: 'absolute', left: tabX, top: tabY, opacity: c1 }}>
            <Tablet id="t_muni_home" scroll={s1} width={tabW} style={{ left: 0, top: 0 }} />
          </div>
          <div style={{ position: 'absolute', left: tabX, top: tabY, opacity: c2 }}>
            <Tablet id="t_muni_registry" scroll={s2} width={tabW} style={{ left: 0, top: 0 }} />
          </div>
        </div>
      </div>
      {[[27.9, 'GIS explorer', 'map'], [30.4, 'Municipal dashboard', 'chart'], [33.0, 'Building registry', 'stack']].map(([at, label], i, arr) => {
        const end = i < arr.length - 1 ? arr[i + 1][0] : 34.9;
        const o = inOut(f, t4(at), t4(end), 12, 10);
        if (o <= 0) return null;
        return <div key={label} style={{ position: 'absolute', top: tabY - 6, left: tabX + 36, opacity: o }}><Pill style={{ fontSize: 26, padding: '10px 18px', transform: 'translateY(-50%)' }} icon={<Dot size={12} />}>{label}</Pill></div>;
      })}
      <DemoLabel from={t4(26.8)} to={t4(35.0)} />
      <Grain opacity={0.03} />
    </AbsoluteFill>
  );
};
