#!/usr/bin/env node
/*
 * Render helper (Remotion Node API, uses the machine's headless Chromium).
 *   node scripts/render.cjs stills 30,300,600            → output/stills/frame-XXXX.png
 *   node scripts/render.cjs preview                      → output/_video_preview.mp4 (540×960, subtitles in-frame)
 *   node scripts/render.cjs master                       → output/_video_master.mp4 (1440×2560, clean, no audio)
 *   node scripts/render.cjs cards                        → output/subtitle-cards/cue-XX.png (transparent)
 * Env: BROWSER=/path/to/chrome-headless-shell  CONCURRENCY=3
 */
const path = require('path');
const fs = require('fs');
const { bundle } = require('@remotion/bundler');
const { renderMedia, renderStill, selectComposition } = require('@remotion/renderer');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'output');
const BROWSER = process.env.BROWSER || '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const CONC = +(process.env.CONCURRENCY || 3);
const chromiumOptions = { gl: 'swangle', headless: true };
const common = { browserExecutable: fs.existsSync(BROWSER) ? BROWSER : null, chromiumOptions, logLevel: 'warn' };

(async () => {
  const [mode, arg] = process.argv.slice(2);
  fs.mkdirSync(OUT, { recursive: true });
  console.time('bundle');
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src/index.jsx'), publicDir: path.join(ROOT, 'public') });
  console.timeEnd('bundle');
  const comp = (id, inputProps = {}) => selectComposition({ serveUrl, id, inputProps, ...common });

  if (mode === 'stills') {
    const frames = String(arg || '30').split(',').map(Number);
    const c = await comp('BenaFilm', { subtitles: true });
    fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true });
    for (const fr of frames) {
      const file = path.join(OUT, 'stills', `frame-${String(fr).padStart(4, '0')}.png`);
      await renderStill({ composition: c, serveUrl, frame: fr, output: file, inputProps: { subtitles: true }, scale: +(process.env.SCALE || 0.5), ...common });
      console.log('still', fr);
    }
  } else if (mode === 'preview' || mode === 'master') {
    const subs = mode === 'preview';
    const c = await comp('BenaFilm', { subtitles: subs });
    const file = path.join(OUT, mode === 'preview' ? '_video_preview.mp4' : '_video_master.mp4');
    let last = 0;
    console.time(mode);
    await renderMedia({
      composition: c, serveUrl, codec: 'h264', outputLocation: file, inputProps: { subtitles: subs }, concurrency: CONC,
      scale: mode === 'preview' ? 0.375 : 1, crf: mode === 'preview' ? 23 : 14, x264Preset: mode === 'preview' ? 'veryfast' : 'slow', muted: true,
      frameRange: arg ? arg.split('-').map(Number) : undefined, timeoutInMilliseconds: 120000,
      onProgress: ({ progress }) => { const p = Math.floor(progress * 100); if (p >= last + 5) { last = p; console.log(`${mode} ${p}%`); } },
      ...common,
    });
    console.timeEnd(mode);
  } else if (mode === 'cards') {
    const tl = require(path.join(ROOT, 'src/data/timeline.json'));
    fs.mkdirSync(path.join(OUT, 'subtitle-cards'), { recursive: true });
    for (let i = 0; i < tl.subtitles.length; i++) {
      const c = await comp('SubtitleCard', { i });
      await renderStill({ composition: c, serveUrl, frame: 0, output: path.join(OUT, 'subtitle-cards', `cue-${String(i).padStart(2, '0')}.png`), inputProps: { i }, imageFormat: 'png', ...common });
    }
    console.log('cards', tl.subtitles.length);
  }
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
