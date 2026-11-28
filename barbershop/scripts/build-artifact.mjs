#!/usr/bin/env node
/**
 * Packs the web export into ONE self-contained HTML page (scripts and fonts inlined) so the
 * prototype can be shared as a hosted page that allows no external or relative asset loads.
 *
 *   ARTIFACT_BUILD=1 npx expo export --platform web --output-dir dist-artifact
 *   node scripts/build-artifact.mjs dist-artifact artifact/barber-house.html
 *
 * The page content is written without <html>/<head>/<body>; the host adds that skeleton.
 * Deep links: append #owner, #barber, #assistant, #portal or #welcome to open a specific area.
 */
import fs from 'node:fs';
import path from 'node:path';

const [distDir, outFile] = process.argv.slice(2);
if (!distDir || !outFile) {
  console.error('usage: node scripts/build-artifact.mjs <dist-dir> <out.html>');
  process.exit(1);
}

const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const reset = (indexHtml.match(/<style id="expo-reset">([\s\S]*?)<\/style>/) ?? [, ''])[1];
const scripts = [...indexHtml.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
if (scripts.length !== 1) throw new Error(`expected one bundle (build with ARTIFACT_BUILD=1), found ${scripts.length}`);
const bundle = fs.readFileSync(path.join(distDir, scripts[0]), 'utf8').replace(/<\/script/gi, '<\\/script');

// Fonts the app registers at runtime (expo-font). Keyed by file name without the content hash.
const WANTED = [/^Inter_(400Regular|500Medium|600SemiBold|700Bold)\./, /^IBMPlexSansArabic_(400Regular|500Medium|600SemiBold|700Bold)\./, /^Feather\./, /^Ionicons\./];
const fonts = {};
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.ttf') && WANTED.some((re) => re.test(entry.name))) {
      const key = entry.name.replace(/\.[0-9a-f]{32}(?=\.ttf$)/, '');
      fonts[key] = `data:font/ttf;base64,${fs.readFileSync(full).toString('base64')}`;
    }
  }
};
walk(path.join(distDir, 'assets'));
if (Object.keys(fonts).length !== 10) throw new Error(`expected 10 fonts, found ${Object.keys(fonts).join(', ')}`);

const shim = `(function () {
  var FONTS = ${JSON.stringify(fonts)};
  // expo-font registers @font-face rules with insertRule(url(/assets/...)). Serve them inline instead.
  function swap(css) {
    return css.replace(/url\\((["']?)([^)"']+)\\1\\)/g, function (m, q, u) {
      var name = u.split('/').pop().split('?')[0].replace(/\\.[0-9a-f]{32}(?=\\.ttf$)/, '');
      return FONTS[name] ? 'url("' + FONTS[name] + '")' : m;
    });
  }
  var insert = CSSStyleSheet.prototype.insertRule;
  CSSStyleSheet.prototype.insertRule = function (rule, index) { return insert.call(this, swap(String(rule)), index); };
  // The router reads the URL path; start it at the requested area regardless of where the page is hosted.
  var areas = { owner: '/owner', barber: '/barber', assistant: '/barber/assistant', portal: '/book/the-barber-house', welcome: '/welcome' };
  var start = areas[(location.hash || '').slice(1)] || '/';
  try { history.replaceState(null, '', start); } catch (e) {}
})();`;

const page = `<title>Barber House OS</title>
<style>
:root { --bg: #F7F6F4; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #0F0E0D; color-scheme: dark; } }
:root[data-theme="dark"] { --bg: #0F0E0D; color-scheme: dark; }
${reset.trim()}
html, body { height: 100%; }
body { background: var(--bg); }
</style>
<script>${shim}</script>
<div id="root"></div>
<script>${bundle}</script>
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, page);
console.log(`wrote ${outFile} (${(Buffer.byteLength(page) / 1024 / 1024).toFixed(1)} MB, ${Object.keys(fonts).length} fonts inlined)`);
