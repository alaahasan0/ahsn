#!/usr/bin/env node
/* Writes BENA_Arabic_Subtitles.srt (and an English reference SRT) from src/data/timeline.json. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const tl = require(path.join(ROOT, 'src/data/timeline.json'));
const ts = (s) => { const ms = Math.round(s * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60, r = ms % 1000; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(r).padStart(3, '0')}`; };
const cues = tl.subtitles.map((c) => { const at = tl.voiceover[c.vo].at; return { ...c, start: at + c.from, end: at + c.to }; });
// Right-to-left embedding only for lines that begin with Arabic, so "BENA." keeps its period on the right.
const isAr = (txt) => /^[؀-ۿ]/.test(txt);
const write = (file, key, rtl) => fs.writeFileSync(path.join(ROOT, file), cues.map((c, i) => {
  const wrap = rtl && isAr(c[key]);
  return `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${wrap ? '‫' : ''}${c[key]}${wrap ? '‬' : ''}\n`;
}).join('\n'));
fs.mkdirSync(path.join(ROOT, 'subtitles'), { recursive: true });
write('BENA_Arabic_Subtitles.srt', 'ar', true);
write('subtitles/BENA_English_Reference.srt', 'en', false);
console.log(`${cues.length} cues written`);
