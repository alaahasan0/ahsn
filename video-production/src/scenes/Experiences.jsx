/* S05 · One building, many experiences — S06 · Management — S07 · Services within reach */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, FONT, sec, prog, inOut, E, lerp, Headline, Phone, Tablet, Pill, Dot, Icon, Grain, DemoLabel, phoneMaxScroll, tabletMaxScroll } from '../lib.jsx';

const PH = { w: 416, h: 870 }; // phone frame logical size (incl. bezel)
const TAB_H = (w) => ((1180 + 44) * w) / 864;

/* ---------------- S05 (sequence starts 34.8 s) ---------------- */
const T5 = 34.8;
const t5 = (abs) => sec(abs - T5);
const DEVICES = [
  { id: 'p_owner_home', kind: 'phone', label: 'Owner', icon: 'key', hub: [395, 1080] },
  { id: 'p_res_home', kind: 'phone', label: 'Resident', icon: 'home', hub: [1045, 1080] },
  { id: 'p_committee_home', kind: 'phone', label: 'Committee', icon: 'users', hub: [395, 1840] },
  { id: 't_manager_home', kind: 'tablet', label: 'Property manager', icon: 'briefcase', hub: [1045, 1840] },
];
const FOCUS = [35.0, 35.85, 36.65, 37.55];

export const S05 = () => {
  const f = useCurrentFrame();
  const enter = prog(f, 0, t5(35.5), E.out);
  // camera index (float) following the narration
  let cam = 0;
  FOCUS.forEach((at, i) => { if (i > 0) cam += prog(f, t5(at) - 6, t5(at) + 12, E.inOut); });
  const hub = prog(f, t5(39.3), t5(40.6), E.inOut);
  const lines = prog(f, t5(40.5), t5(41.6), E.inOut);
  const exit = prog(f, t5(44.1), t5(44.7), E.in);
  const nativeScalePhone = 1.62, nativeTabW = 980;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg} 0%, #EAF0EE 100%)`, opacity: enter }}>
      <Headline lines={['One connected experience.', 'Multiple perspectives.']} from={t5(35.2)} to={t5(44.4)} y={270} color={C.navy} size={84} accent="Multiple perspectives." accentColor={C.mintInk} />
      {/* hub lines + centre building chip */}
      <svg width="1440" height="2560" style={{ position: 'absolute', inset: 0, opacity: hub * (1 - exit) }}>
        {DEVICES.map((d, i) => {
          const L = Math.hypot(d.hub[0] - 720, d.hub[1] - 1460);
          const dash = (f * 2) % 36;
          return (
            <g key={i}>
              <line x1={720} y1={1460} x2={lerp(720, d.hub[0], lines)} y2={lerp(1460, d.hub[1], lines)} stroke={C.mint} strokeWidth="5" strokeLinecap="round" opacity=".9" />
              <line x1={720} y1={1460} x2={d.hub[0]} y2={d.hub[1]} stroke={C.navy} strokeWidth="2" strokeDasharray="6 12" strokeDashoffset={-dash} opacity={0.25 * lines} />
              {lines >= 1 && <circle cx={lerp(720, d.hub[0], ((f / 40 + i * 0.25) % 1))} cy={lerp(1460, d.hub[1], ((f / 40 + i * 0.25) % 1))} r="9" fill={C.mint} />}
              <title>{L}</title>
            </g>
          );
        })}
      </svg>
      {DEVICES.map((d, i) => {
        const rel = i - cam;
        const close = Math.max(0, 1 - Math.abs(rel));
        const cx = lerp(720 + rel * 800, d.hub[0], hub);
        const cy = lerp(1420, d.hub[1], hub);
        const isPhone = d.kind === 'phone';
        const natW = isPhone ? PH.w * nativeScalePhone : nativeTabW;
        const natH = isPhone ? PH.h * nativeScalePhone : TAB_H(nativeTabW);
        const sCar = lerp(0.74, 1, close) * (isPhone ? 1 : 0.82);
        const sHub = isPhone ? 680 / natH : 580 / natW;
        const s = lerp(sCar, sHub, hub);
        const op = lerp(lerp(0.35, 1, close), 1, hub) * (1 - exit);
        const ms = isPhone ? phoneMaxScroll(d.id) : tabletMaxScroll(d.id);
        const local = prog(f, t5(FOCUS[i]), t5(FOCUS[i]) + 220, E.soft);
        const scroll = Math.min(ms, lerp(0, isPhone ? 520 : 420, local));
        const labelO = Math.max(close * (1 - hub), hub) * (1 - exit);
        return (
          <div key={d.id} style={{ position: 'absolute', left: cx, top: cy, width: 0, height: 0, opacity: op }}>
            <div style={{ position: 'absolute', left: -natW / 2, top: -natH / 2, width: natW, height: natH, transform: `scale(${s})`, filter: `blur(${(1 - close) * (1 - hub) * 3}px)` }}>
              {isPhone ? <Phone id={d.id} scroll={scroll} scale={nativeScalePhone} style={{ left: 0, top: 0 }} /> : <Tablet id={d.id} scroll={scroll} width={nativeTabW} style={{ left: 0, top: 0 }} />}
            </div>
            <div style={{ position: 'absolute', left: 0, top: -(natH * s) / 2 - 64, transform: 'translateX(-50%)', opacity: labelO }}>
              <Pill dark={hub < 0.5} icon={<span style={{ color: hub < 0.5 ? C.mint : C.mintInk, display: 'flex' }}><Icon name={d.icon} size={32} /></span>} style={{ fontSize: lerp(32, 27, hub), padding: lerp(16, 11, hub) + 'px ' + lerp(26, 20, hub) + 'px' }}>{d.label}</Pill>
            </div>
          </div>
        );
      })}
      {hub > 0 && (
        <div style={{ position: 'absolute', left: 720, top: 1460, transform: `translate(-50%,-50%) scale(${lerp(0.6, 1, hub)})`, opacity: hub * (1 - exit) }}>
          <div style={{ width: 300, padding: '26px 22px', borderRadius: 34, background: C.navy, color: '#fff', textAlign: 'center', boxShadow: '0 0 0 12px rgba(54,214,160,.18), 0 30px 60px rgba(8,20,30,.3)' }}>
            <div style={{ width: 70, height: 70, borderRadius: 20, background: C.mint, color: C.navy, display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}><Icon name="building" size={38} stroke={2} /></div>
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 28, lineHeight: 1.2 }}>Al-Masyoun Residence Tower</div>
            <div style={{ fontFamily: FONT.mono, fontSize: 22, color: C.mint, marginTop: 8 }}>BN-RAM-00142</div>
          </div>
        </div>
      )}
      <DemoLabel from={t5(35.3)} to={t5(44.4)} />
      <Grain opacity={0.03} />
    </AbsoluteFill>
  );
};

/* ---------------- S06 (sequence starts 44.3 s) ---------------- */
const T6 = 44.3;
const t6 = (abs) => sec(abs - T6);
const TAGS = [
  { at: 45.4, label: 'Buildings & units', icon: 'building', x: 70, y: 690 },
  { at: 45.9, label: 'Occupancy', icon: 'chart', x: 930, y: 760 },
  { at: 46.6, label: 'Leases', icon: 'contract', x: 90, y: 1960 },
  { at: 47.3, label: 'Maintenance', icon: 'wrench', x: 900, y: 1210 },
  { at: 47.9, label: 'Work orders', icon: 'calendar', x: 60, y: 1420 },
  { at: 48.4, label: 'Assets', icon: 'cpu', x: 990, y: 1700 },
  { at: 49.0, label: 'Preventive maintenance', icon: 'shieldCheck', x: 560, y: 2080 },
  { at: 49.8, label: 'Building expenses', icon: 'wallet', x: 120, y: 1060 },
];
export const S06 = () => {
  const f = useCurrentFrame();
  const enter = prog(f, 0, t6(44.9), E.inOut);
  const swap = prog(f, t6(49.1), t6(49.9), E.inOut);
  const exit = prog(f, t6(54.3), t6(54.9), E.in);
  const drift = prog(f, 0, t6(54.9), E.soft);
  const sFront = lerp(0, tabletMaxScroll('t_manager_workspace'), prog(f, t6(45.0), t6(49.3), E.inOut)) * 0.5;
  const sFront2 = lerp(0, 900, prog(f, t6(49.5), t6(54.6), E.inOut));
  const back = (id, scroll, x, y, w, depth) => (
    <div style={{ position: 'absolute', left: x + drift * depth * 40, top: y - drift * depth * 60, opacity: 0.55, filter: 'blur(1.5px)' }}>
      <Tablet id={id} scroll={scroll} width={w} style={{ left: 0, top: 0 }} />
    </div>
  );
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 45%, #1E3E54 0%, ${C.navy} 55%, ${C.navy3} 100%)`, opacity: enter * (1 - exit * 0.0) }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - exit }}>
        <div style={{ opacity: 1 - swap }}>
          {back('t_facility_assets', 240 * drift, -230, 980, 760, 1)}
          {back('t_facility_pm', 300 * drift, 910, 900, 760, -1)}
        </div>
        <div style={{ opacity: swap }}>
          {back('t_manager_home', 400 * drift, -230, 980, 760, 1)}
          {back('t_facility_wo', 200 * drift, 910, 900, 760, -1)}
        </div>
        <div style={{ position: 'absolute', left: (1440 - 940) / 2, top: 740 - drift * 30, transform: `scale(${lerp(0.96, 1.02, drift)})`, transformOrigin: '50% 30%' }}>
          <Tablet id="t_manager_workspace" scroll={sFront} width={940} style={{ left: 0, top: 0 }} cross={{ id: 't_facility_home', scroll: sFront2 }} crossT={swap} />
        </div>
        {TAGS.map((tg) => {
          const p = prog(f, t6(tg.at), t6(tg.at) + 14);
          if (p <= 0) return null;
          return <div key={tg.label} style={{ position: 'absolute', left: tg.x, top: tg.y - drift * 30, opacity: p, transform: `scale(${lerp(0.88, 1, p)})` }}><Pill icon={<span style={{ color: C.mintInk, display: 'flex' }}><Icon name={tg.icon} size={34} /></span>} style={{ fontSize: 30 }}>{tg.label}</Pill></div>;
        })}
        {[[45.2, 'Property management', 'briefcase'], [49.4, 'Facility management', 'settings']].map(([at, label, ic], i, arr) => {
          const end = i < arr.length - 1 ? arr[i + 1][0] : 54.4;
          const o = inOut(f, t6(at), t6(end), 14, 10);
          return o > 0 ? <div key={label} style={{ position: 'absolute', top: 700 - drift * 30, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o }}><Pill dark style={{ fontSize: 28, padding: '11px 22px', transform: 'translateY(-60%)' }} icon={<span style={{ color: C.mint, display: 'flex' }}><Icon name={ic} size={30} /></span>}>{label}</Pill></div> : null;
        })}
      </div>
      <Headline lines={['Property management.', 'Facility management.', 'Simplified.']} from={t6(44.9)} to={t6(54.5)} y={250} size={76} accent="Simplified." stagger={8} />
      <DemoLabel from={t6(45.0)} to={t6(54.5)} dark />
      <Grain opacity={0.04} />
    </AbsoluteFill>
  );
};

/* ---------------- S07 (sequence starts 54.4 s) ---------------- */
const T7 = 54.4;
const t7 = (abs) => sec(abs - T7);
const CATS = [
  ['Cleaning', 'sparkles', 120, 760], ['Plumbing', 'droplet', 960, 720], ['Electrical', 'zap', 1010, 1020],
  ['HVAC', 'wind', 60, 1180], ['Elevators', 'elevator', 1000, 1360], ['Security', 'shield', 80, 1590], ['Maintenance', 'wrench', 940, 1700],
];
export const S07 = () => {
  const f = useCurrentFrame();
  const enter = prog(f, 0, t7(55.0), E.inOut);
  const split = prog(f, t7(56.9), t7(57.9), E.inOut);
  const focus = prog(f, t7(59.2), t7(60.3), E.inOut);
  const exit = prog(f, t7(64.0), t7(64.6), E.in);
  const sv = lerp(0, 700, prog(f, t7(55.0), t7(59.5), E.soft));
  const pr = lerp(0, 800, prog(f, t7(57.4), t7(60.0), E.soft));
  const li = lerp(0, 1350, prog(f, t7(60.4), t7(64.2), E.inOut));
  const scale = 1.6;
  const pw = PH.w * scale, ph = PH.h * scale;
  // services phone: centre → left; properties: off right → right; listing: rises in front
  const svX = lerp(lerp(720, 420, split), 260, focus), svR = lerp(0, -7, split), svS = lerp(1, 0.78, split) * lerp(1, 0.86, focus);
  const prX = lerp(1700, 1020, split), prR = lerp(10, 7, split), prS = lerp(0.78, 0.78, split) * lerp(1, 0.86, focus);
  const devTop = 1500;
  const dev = (id, x, rot, s, scroll, extra = {}) => (
    <div style={{ position: 'absolute', left: x, top: devTop, width: 0, height: 0, ...extra }}>
      <div style={{ position: 'absolute', left: -pw / 2, top: -ph / 2, transform: `rotate(${rot}deg) scale(${s})` }}>
        <Phone id={id} scroll={scroll} scale={scale} style={{ left: 0, top: 0 }} />
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg} 0%, #E6EFEC 100%)`, opacity: enter }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - exit }}>
        {CATS.map(([label, ic, x, y], i) => {
          const at = t7(55.15) + i * 4;
          const p = prog(f, at, at + 14);
          const out = prog(f, t7(58.6), t7(59.4), E.in);
          if (p <= 0 || out >= 1) return null;
          return <div key={label} style={{ position: 'absolute', left: x, top: y + Math.sin(f / 30 + i) * 8, opacity: p * (1 - out), transform: `scale(${lerp(0.85, 1, p)})`, zIndex: 3 }}><Pill icon={<span style={{ width: 54, height: 54, borderRadius: 16, background: C.mint50, color: C.mintInk, display: 'grid', placeItems: 'center' }}><Icon name={ic} size={32} /></span>} style={{ padding: '10px 24px 10px 10px', fontSize: 30 }}>{label}</Pill></div>;
        })}
        <div style={{ filter: `blur(${focus * 3}px)`, opacity: lerp(1, 0.55, focus) }}>
          {dev('p_services', svX, svR, svS, sv)}
          {split > 0 && dev('p_properties', prX, prR, prS, pr)}
        </div>
        {focus > 0 && dev('p_listing', 720, 0, lerp(0.7, 1.02, focus), li, { opacity: focus, transform: `translateY(${(1 - focus) * 400}px)` })}
        {[[55.1, 'Services marketplace', 'sparkles', svX], [57.4, 'Property marketplace', 'store', prX]].map(([at, label, ic, x]) => {
          const o = prog(f, t7(at), t7(at) + 14) * (1 - focus);
          return o > 0 ? <div key={label} style={{ position: 'absolute', left: x, top: 620, transform: 'translateX(-50%)', opacity: o }}><Pill dark style={{ fontSize: 27, padding: '11px 20px' }} icon={<span style={{ color: C.mint, display: 'flex' }}><Icon name={ic} size={30} /></span>}>{label}</Pill></div> : null;
        })}
      </div>
      <Headline lines={['Services and opportunities,', 'connected.']} from={t7(55.0)} to={t7(64.2)} y={270} color={C.navy} size={84} accent="connected." accentColor={C.mintInk} />
      <DemoLabel from={t7(55.0)} to={t7(64.2)} />
      <Grain opacity={0.03} />
    </AbsoluteFill>
  );
};
