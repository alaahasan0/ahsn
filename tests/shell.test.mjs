// Guards offline support: every app file must be precached by the service worker.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

test('service worker precaches every JS, CSS and icon file', () => {
  const sw = readFileSync(join(root, 'sw.js'), 'utf8');
  const files = [...walk(join(root, 'js')), ...walk(join(root, 'css')), ...walk(join(root, 'icons'))]
    .filter((f) => /\.(js|css|png)$/.test(f))
    .map((f) => `./${relative(root, f)}`);
  const missing = files.filter((f) => !sw.includes(`'${f}'`));
  assert.deepEqual(missing, [], `Add these to APP_SHELL in sw.js: ${missing.join(', ')}`);
});

test('app version and cache version agree', () => {
  const app = readFileSync(join(root, 'js/app.js'), 'utf8').match(/APP_VERSION = '([\d.]+)'/)[1];
  const sw = readFileSync(join(root, 'sw.js'), 'utf8').match(/salary-v([\d.]+)/)[1];
  assert.equal(app, sw);
});
