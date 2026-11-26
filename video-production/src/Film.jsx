/* BENA — cinematic product launch film. 90 s · 1440×2560 · 30 fps. */
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { sec, prog, useFonts } from './lib.jsx';
import { S01, S02 } from './scenes/Opening.jsx';
import { S03, S04 } from './scenes/Identity.jsx';
import { S05, S06, S07 } from './scenes/Experiences.jsx';
import { S08, S09, S10 } from './scenes/Ecosystem.jsx';
import { SubtitleLayer } from './subtitles/Subtitles.jsx';

/* Visual sequences (seconds). Neighbouring scenes overlap for dissolves; the
   storyboard timings live in src/data/timeline.json. */
export const SEQ = [
  ['S01', S01, 0.0, 8.4], ['S02', S02, 8.2, 16.4], ['S03', S03, 15.6, 26.6], ['S04', S04, 26.0, 35.4],
  ['S05', S05, 34.8, 44.7], ['S06', S06, 44.3, 54.9], ['S07', S07, 54.4, 64.6], ['S08', S08, 64.1, 74.3],
  ['S09', S09, 73.8, 83.5], ['S10', S10, 82.9, 90.0],
];

const FadeIn = ({ frames, children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: prog(f, 0, frames) }}>{children}</AbsoluteFill>;
};

export const Film = ({ subtitles = false }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {SEQ.map(([id, Comp, a, b]) => (
        <Sequence key={id} name={id} from={sec(a)} durationInFrames={sec(b) - sec(a)}>
          {id === 'S02' ? <FadeIn frames={6}><Comp /></FadeIn> : <Comp />}
        </Sequence>
      ))}
      {subtitles ? <SubtitleLayer /> : null}
    </AbsoluteFill>
  );
};
