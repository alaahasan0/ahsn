/* Arabic subtitles: shared style for the in-frame preview layer and the burned-in cue cards. */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { T, FONT, sec, prog, E, useFonts } from '../lib.jsx';

/** Absolute cue list in seconds. */
export const cues = () => T.subtitles.map((c) => {
  const at = T.voiceover[c.vo].at;
  return { ...c, start: +(at + c.from).toFixed(2), end: +(at + c.to).toFixed(2) };
});

/** Bottom of the subtitle box sits at y = 2340 (above the iPhone home-indicator zone). */
export const SubtitleBox = ({ text, opacity = 1, lift = 0 }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 2560 - 2340, display: 'flex', justifyContent: 'center', paddingInline: 110, opacity, transform: `translateY(${lift}px)` }}>
    <div dir="rtl" lang="ar" style={{ fontFamily: FONT.ar, fontWeight: 500, fontSize: 52, lineHeight: 1.62, color: '#fff', textAlign: 'center', background: 'rgba(9,20,30,.58)', borderRadius: 26, padding: '16px 34px 20px', maxWidth: 1220, textShadow: '0 2px 8px rgba(0,0,0,.35)', unicodeBidi: 'plaintext', textWrap: 'balance' }}>{text}</div>
  </div>
);

export const SubtitleLayer = () => {
  const f = useCurrentFrame();
  const list = cues();
  const c = list.find((x) => f >= sec(x.start) - 4 && f <= sec(x.end) + 4);
  if (!c) return null;
  const o = Math.min(prog(f, sec(c.start) - 4, sec(c.start) + 4, E.out), 1 - prog(f, sec(c.end) - 2, sec(c.end) + 4, E.in));
  return <AbsoluteFill style={{ pointerEvents: 'none' }}><SubtitleBox text={c.ar} opacity={o} /></AbsoluteFill>;
};

/** Transparent full-frame card for one cue (burned in with FFmpeg). */
export const SubtitleCard = ({ i = 0 }) => {
  useFonts();
  const c = cues()[i];
  return <AbsoluteFill style={{ background: 'transparent' }}><SubtitleBox text={c.ar} /></AbsoluteFill>;
};
