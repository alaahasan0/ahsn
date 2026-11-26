#!/usr/bin/env node
/*
 * Final assembly (FFmpeg). Inputs: output/_video_master.mp4 (clean 1440×2560, from
 * `node scripts/render.cjs master`), output/subtitle-cards/*.png (`render.cjs cards`)
 * and output/_audio_mix.wav (`node scripts/mix-audio.cjs`).
 * Outputs in output/:
 *   BENA_Product_Film_90s.mp4               1440×2560, Arabic subtitles burned in, AAC
 *   BENA_Product_Film_90s_NoSubtitles.mp4   clean master + audio
 *   BENA_Product_Film_1080x1920.mp4         mobile export
 *   BENA_Product_Film_Preview.mp4           lightweight review copy (540×960)
 */
const { execFileSync } = require('child_process');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'output');
const tl = require(path.join(ROOT, 'src/data/timeline.json'));
const run = (args) => { console.log('ffmpeg', args.slice(-1)[0]); execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' }); };
const master = path.join(OUT, '_video_master.mp4');
const audio = path.join(OUT, '_audio_mix.wav');
const color = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv'];
const enc = (crf, preset = 'slow') => ['-c:v', 'libx264', '-profile:v', 'high', '-preset', preset, '-crf', String(crf), '-pix_fmt', 'yuv420p', ...color, '-r', '30'];
const aac = (br) => ['-c:a', 'aac', '-b:a', br, '-ar', '48000'];

/* 1 · burn subtitles */
const cues = tl.subtitles.map((c, i) => ({ i, start: tl.voiceover[c.vo].at + c.from, end: tl.voiceover[c.vo].at + c.to }));
const ins = ['-i', master];
const parts = [];
let last = '0:v';
cues.forEach((c, k) => {
  const dur = c.end - c.start + 0.3;
  ins.push('-loop', '1', '-t', dur.toFixed(2), '-i', path.join(OUT, 'subtitle-cards', `cue-${String(c.i).padStart(2, '0')}.png`));
  const st = Math.max(0, c.start - 0.12);
  parts.push(`[${k + 1}:v]format=rgba,fade=t=in:st=0:d=0.16:alpha=1,fade=t=out:st=${(dur - 0.2).toFixed(2)}:d=0.2:alpha=1,setpts=PTS-STARTPTS+${st.toFixed(3)}/TB[c${k}]`);
  parts.push(`[${last}][c${k}]overlay=0:0:eof_action=pass:enable='between(t,${st.toFixed(3)},${(st + dur).toFixed(3)})'[o${k}]`);
  last = `o${k}`;
});
const subbed = path.join(OUT, '_video_subtitled.mp4');
run([...ins, '-filter_complex', parts.join(';'), '-map', `[${last}]`, ...enc(14), '-an', subbed]);

/* 2 · mux */
const final = path.join(OUT, 'BENA_Product_Film_90s.mp4');
run(['-i', subbed, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', ...aac('256k'), '-t', '90', '-movflags', '+faststart', final]);
run(['-i', master, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', ...aac('256k'), '-t', '90', '-movflags', '+faststart', path.join(OUT, 'BENA_Product_Film_90s_NoSubtitles.mp4')]);

/* 3 · derived exports */
run(['-i', final, '-vf', 'scale=1080:1920:flags=lanczos', ...enc(17), ...aac('192k'), '-movflags', '+faststart', path.join(OUT, 'BENA_Product_Film_1080x1920.mp4')]);
run(['-i', final, '-vf', 'scale=540:960:flags=lanczos', ...enc(26, 'medium'), ...aac('128k'), '-movflags', '+faststart', path.join(OUT, 'BENA_Product_Film_Preview.mp4')]);
console.log('done');
