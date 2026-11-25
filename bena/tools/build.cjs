#!/usr/bin/env node
/*
 * Bundle BENA into single self-contained HTML files (no build tooling needed):
 *   dist/bena.html           full standalone document (open directly, host anywhere)
 *   dist/bena-artifact.html  body fragment for hosts that supply their own <html>/<head>
 * Usage: node tools/build.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const scripts = [...index.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
const css = fs.readFileSync(path.join(root, 'css/bena.css'), 'utf8');
const js = scripts.map((s) => `/* ---- ${s} ---- */\n` + fs.readFileSync(path.join(root, s), 'utf8')).join('\n');
if (/<\/script/i.test(js)) throw new Error('A script contains "</script" — escape it before bundling.');
const fonts = index.match(/<link rel="stylesheet" href="(https:\/\/fonts[^"]+)">/)[1];
const langBoot = `try { if (JSON.parse(localStorage.getItem('bena:lang')) === 'ar') { document.documentElement.lang = 'ar'; document.documentElement.dir = 'rtl'; } } catch (e) {}`;

const body = `<div id="app"></div>\n<script>\n${js}\n</script>`;
const full = `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>BENA</title>
<meta name="theme-color" content="#142B3B">
<link rel="stylesheet" href="${fonts}">
<style>${css}</style>
<script>${langBoot}</script>
</head>
<body>
${body}
</body>
</html>
`;
const fragment = `<title>BENA Prototype</title>
<link rel="stylesheet" href="${fonts}">
<style>${css}</style>
<script>${langBoot}</script>
${body}
`;
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/bena.html'), full);
fs.writeFileSync(path.join(root, 'dist/bena-artifact.html'), fragment);
console.log(`dist/bena.html ${(full.length / 1024).toFixed(0)} KB · dist/bena-artifact.html ${(fragment.length / 1024).toFixed(0)} KB · ${scripts.length} scripts`);
