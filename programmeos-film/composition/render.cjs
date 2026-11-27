/**
 * ProgrammeOS film — frame renderer.
 *
 * Serves programmeos-film/ over a local static server, opens composition/film.html in headless
 * Chromium and captures frames with window.renderFrame(t).
 *
 *   node render.cjs --mode film --out DIR [--dpr 2] [--workers 4] [--from 0] [--to 3599]
 *   node render.cjs --mode film --out DIR --times 6,15,33 --dpr 1      (preview stills, PNG)
 *
 * Frames are written as DIR/000000.jpg (frame index = round(t * 24)).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const MODE = args.mode || 'film';
const OUT = path.resolve(args.out || 'frames');
const DPR = parseFloat(args.dpr || '2');
const WORKERS = parseInt(args.workers || '4', 10);
const QUALITY = parseInt(args.quality || '95', 10);
const ROOT = path.resolve(__dirname, '..');
const FPS = 24;
const VIEW = MODE === 'film' ? { width: 1920, height: 1080 } : { width: 1080, height: 1920 };

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf' };
function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'max-age=3600' });
      fs.createReadStream(p).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await serve();
  const url = `http://127.0.0.1:${server.address().port}/composition/film.html?mode=${MODE}`;
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--force-color-profile=srgb'] });
  const duration = MODE === 'film' ? 150 : 30;
  let jobs;
  if (args.times) jobs = args.times.split(',').map((s) => ({ t: parseFloat(s), name: `t${parseFloat(s).toFixed(2).padStart(7, '0')}.png` }));
  else {
    const from = parseInt(args.from || '0', 10), to = parseInt(args.to || String(duration * FPS - 1), 10);
    jobs = [];
    for (let f = from; f <= to; f++) {
      const name = `${String(f).padStart(6, '0')}.jpg`;
      if (args.resume && fs.existsSync(path.join(OUT, name))) continue;
      jobs.push({ t: f / FPS, name });
    }
  }
  const started = Date.now();
  let done = 0;
  // Contiguous chunks per worker keep each page's image cache warm.
  const chunk = Math.ceil(jobs.length / WORKERS);
  await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const mine = jobs.slice(w * chunk, (w + 1) * chunk);
    if (!mine.length) return;
    const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: DPR });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.error('pageerror', e.message));
    page.on('console', (m) => { if (m.type() === 'error') console.error('console', m.text()); });
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => window.ready);
    for (const job of mine) {
      await page.evaluate((t) => window.renderFrame(t), job.t);
      const file = path.join(OUT, job.name);
      if (job.name.endsWith('.png')) await page.screenshot({ path: file, type: 'png' });
      else await page.screenshot({ path: file, type: 'jpeg', quality: QUALITY });
      done++;
      if (done % 48 === 0) {
        const el = (Date.now() - started) / 1000;
        console.log(`${done}/${jobs.length} frames · ${(done / el).toFixed(2)} fps · eta ${((jobs.length - done) / (done / el) / 60).toFixed(1)} min`);
      }
    }
    await ctx.close();
  }));
  await browser.close();
  server.close();
  console.log(`rendered ${done} frames in ${((Date.now() - started) / 1000).toFixed(1)} s`);
})();
