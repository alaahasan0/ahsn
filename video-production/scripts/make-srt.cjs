#!/usr/bin/env node
/* Writes BENA_Arabic_Subtitles.srt (and an English reference SRT) from src/data/timeline.json. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const tl = require(path.join(ROOT, 'src/data/timeline.json'));
const ts = (s) => { const ms = Math.round(s * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60, r = ms % 1000; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(r).padStart(3, '0')}`; };
const cues = tl.subtitles.map((c) => { const at = tl.voiceover[c.vo].at; return { ...c, start: at + c.from, end: at + c.to }; });
const write = (file, key, rtl) => fs.writeFileSync(path.join(ROOT, file), cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${rtl ? '‫' : ''}${c[key]}${rtl ? '‬' : ''}\n`).join('\n'));
write('BENA_Arabic_Subtitles.srt', 'ar', true);
write('subtitles/BENA_English_Reference.srt', 'en', false);
console.log(`${cues.length} cues written`);
