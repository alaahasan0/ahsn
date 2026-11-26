#!/usr/bin/env node
/*
 * Audio mix for the BENA film (FFmpeg).
 *  - narration placed on the timeline offsets from src/data/timeline.json
 *  - score ducked under the narration (sidechain compression)
 *  - sound design (ambience, whooshes, interface taps, reveals)
 *  - two-pass loudness normalisation to -14 LUFS integrated, -1.5 dBTP
 * Output: output/_audio_mix.wav (48 kHz stereo) + output/audio-stems/{vo,music,sfx}.wav
 * Usage: node scripts/mix-audio.cjs
 */
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const P = (f) => path.join(ROOT, 'public', f);
const OUT = path.join(ROOT, 'output');
const tl = require(path.join(ROOT, 'src/data/timeline.json'));
const DUR = tl.durationInFrames / tl.fps;
fs.mkdirSync(path.join(OUT, 'audio-stems'), { recursive: true });

const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-y', ...args], { stdio: ['ignore', 'pipe', 'pipe'] }).toString();

/* ---- stems ---- */
function voStem(file) {
  const ins = []; const parts = [];
  tl.voiceover.forEach((v, i) => {
    ins.push('-i', P(v.file));
    const ms = Math.round(v.at * 1000);
    parts.push(`[${i}:a]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,acompressor=threshold=-20dB:ratio=2.2:attack=8:release=180:makeup=1.5,adelay=${ms}|${ms}[v${i}]`);
  });
  const mix = tl.voiceover.map((_, i) => `[v${i}]`).join('') + `amix=inputs=${tl.voiceover.length}:normalize=0,apad=whole_dur=${DUR},atrim=0:${DUR}[out]`;
  ff([...ins, '-filter_complex', parts.join(';') + ';' + mix, '-map', '[out]', '-c:a', 'pcm_s16le', file]);
}
function sfxStem(file) {
  const ins = []; const parts = [];
  tl.sfx.forEach((s, i) => {
    ins.push('-i', P(s.file));
    const ms = Math.round(s.at * 1000);
    let chain = `[${i}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${s.gain}`;
    if (s.fadeIn) chain += `,afade=t=in:d=${s.fadeIn}`;
    if (s.fadeOutAt) chain += `,afade=t=out:st=${s.fadeOutAt}:d=${s.fadeOut || 1}`;
    parts.push(`${chain},adelay=${ms}|${ms}[s${i}]`);
  });
  const mix = tl.sfx.map((_, i) => `[s${i}]`).join('') + `amix=inputs=${tl.sfx.length}:normalize=0,apad=whole_dur=${DUR},atrim=0:${DUR}[out]`;
  ff([...ins, '-filter_complex', parts.join(';') + ';' + mix, '-map', '[out]', '-c:a', 'pcm_s16le', file]);
}

const vo = path.join(OUT, 'audio-stems/vo.wav');
const sfx = path.join(OUT, 'audio-stems/sfx.wav');
const music = path.join(OUT, 'audio-stems/music.wav');
voStem(vo);
sfxStem(sfx);
// score: gentle intro fade, tail fade at the very end
ff(['-i', P('music/score.mp3'), '-af', `aresample=48000,aformat=channel_layouts=stereo,afade=t=in:d=1.2,afade=t=out:st=${DUR - 1.6}:d=1.6,apad=whole_dur=${DUR},atrim=0:${DUR}`, '-c:a', 'pcm_s16le', music]);

/* ---- mix: duck music under narration ---- */
const pre = path.join(OUT, 'audio-stems/premix.wav');
ff(['-i', music, '-i', vo, '-i', sfx, '-filter_complex',
  '[1:a]asplit=2[vo][key];' +
  "[0:a]volume=0.6,volume='1-0.5*clip((t-71.8)/1.6,0,1)*clip((83.6-t)/0.8,0,1)-0.25*clip((t-63.5)/1.5,0,1)*clip((72-t)/1,0,1)':eval=frame[mus];" +
  '[mus][key]sidechaincompress=threshold=0.025:ratio=7:attack=50:release=700:makeup=1[duck];' +
  '[duck][vo][2:a]amix=inputs=3:normalize=0:weights=1 1.25 1[m];' +
  `[m]afade=t=out:st=${DUR - 0.5}:d=0.5,alimiter=limit=0.89:level=false[out]`,
  '-map', '[out]', '-c:a', 'pcm_s16le', pre]);

/* ---- two-pass loudness normalisation ---- */
const meas = (() => {
  try { ff(['-i', pre, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']); } catch (e) { /* ffmpeg prints to stderr */ }
  const r = require('child_process').spawnSync('ffmpeg', ['-hide_banner', '-i', pre, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' });
  const j = r.stderr.slice(r.stderr.lastIndexOf('{'), r.stderr.lastIndexOf('}') + 1);
  return JSON.parse(j);
})();
const final = path.join(OUT, '_audio_mix.wav');
ff(['-i', pre, '-af', `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${meas.input_i}:measured_TP=${meas.input_tp}:measured_LRA=${meas.input_lra}:measured_thresh=${meas.input_thresh}:offset=${meas.target_offset}:linear=true,aresample=48000`, '-ar', '48000', '-c:a', 'pcm_s16le', final]);
const r2 = require('child_process').spawnSync('ffmpeg', ['-hide_banner', '-i', final, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], { encoding: 'utf8' });
const j2 = JSON.parse(r2.stderr.slice(r2.stderr.lastIndexOf('{'), r2.stderr.lastIndexOf('}') + 1));
console.log(`mix: ${final}\n  integrated ${j2.input_i} LUFS · true peak ${j2.input_tp} dBTP · LRA ${j2.input_lra}`);
