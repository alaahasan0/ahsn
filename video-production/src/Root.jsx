import React from 'react';
import { Composition } from 'remotion';
import { Film } from './Film.jsx';
import { SubtitleCard } from './subtitles/Subtitles.jsx';
import { T } from './lib.jsx';

export const Root = () => (
  <>
    <Composition id="BenaFilm" component={Film} durationInFrames={T.durationInFrames} fps={T.fps} width={T.width} height={T.height} defaultProps={{ subtitles: false }} />
    <Composition id="SubtitleCard" component={SubtitleCard} durationInFrames={1} fps={T.fps} width={T.width} height={T.height} defaultProps={{ i: 0 }} />
  </>
);
