/*
 * App bootstrap and router.
 *
 * Architecture (kept strictly separate):
 *   js/engine/  – pure financial calculation engine (integer cents, no DOM, no storage)   [Phase 2]
 *   js/db/      – IndexedDB persistence layer                                         [Phase 2]
 *   js/ui/      – screens and components                                               [Phase 3+]
 *   js/app.js   – wires the three together
 */

export const APP_VERSION = '0.2.0';

const routes = {
  home: renderHome,
  ledger: () => placeholder('Ledger', 'Transaction history arrives in Phase 4.'),
  months: () => placeholder('Months', 'Monthly statements arrive in Phase 5.'),
  more: renderMore,
};

const view = document.getElementById('view');
const tabs = [...document.querySelectorAll('.tab')];

function navigate(route) {
  if (!routes[route]) route = 'home';
  tabs.forEach((t) => {
    const active = t.dataset.route === route;
    t.classList.toggle('is-active', active);
    if (active) t.setAttribute('aria-current', 'page');
    else t.removeAttribute('aria-current');
  });
  view.innerHTML = '';
  // Restart the entrance animation
  view.style.animation = 'none';
  void view.offsetWidth;
  view.style.animation = '';
  view.append(routes[route]());
  window.scrollTo(0, 0);
  if (location.hash.slice(1) !== route) history.replaceState(null, '', `#${route}`);
  if (route === 'home') refreshStatus();
}

tabs.forEach((t) => t.addEventListener('click', () => navigate(t.dataset.route)));
window.addEventListener('hashchange', () => navigate(location.hash.slice(1)));

/* ---------- Screens ---------- */

function el(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content;
}

function renderHome() {
  return el(`
    <p class="eyebrow">Outstanding balance</p>
    <p class="figure-hero">$0.00</p>
    <p class="muted" style="margin:6px 0 32px">Setup and live figures arrive in Phase 3.</p>

    <p class="group-label">Phase 1 checklist</p>
    <div class="group">
      <div class="row"><span class="label">App shell</span><span class="value is-positive">Ready</span></div>
      <div class="row"><span class="label">Offline support</span><span class="value" id="sw-status">Checking…</span></div>
      <div class="row"><span class="label">Opened from Home Screen</span><span class="value" id="standalone-status">—</span></div>
      <div class="row"><span class="label">Persistent storage</span><span class="value" id="persist-status">—</span></div>
    </div>
  `);
}

function renderMore() {
  return el(`
    <h1 class="title-large">More</h1>
    <p class="group-label">About</p>
    <div class="group">
      <div class="row"><span class="label">Version</span><span class="value">${APP_VERSION}</span></div>
      <div class="row"><span class="label">Data location</span><span class="value">This iPhone only</span></div>
    </div>
    <p class="subtle" style="margin:0 4px">Settings, adjustments, backup and exports arrive in later phases.</p>
  `);
}

function placeholder(title, text) {
  return el(`
    <h1 class="title-large">${title}</h1>
    <div class="placeholder">${text}</div>
  `);
}

/* ---------- Environment status (Phase 1 diagnostics) ---------- */

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

async function refreshStatus() {
  const sw = document.getElementById('sw-status');
  const sa = document.getElementById('standalone-status');
  const ps = document.getElementById('persist-status');
  if (sa) sa.textContent = isStandalone() ? 'Yes' : 'Not yet';
  if (sw) {
    const ready = 'serviceWorker' in navigator && navigator.serviceWorker.controller;
    sw.textContent = ready ? 'Active' : ('serviceWorker' in navigator ? 'Installing…' : 'Unsupported');
    sw.classList.toggle('is-positive', !!ready);
  }
  if (ps && navigator.storage?.persisted) {
    ps.textContent = (await navigator.storage.persisted()) ? 'Granted' : 'Requested';
  }
}

/* ---------- Boot ---------- */

async function boot() {
  navigate(location.hash.slice(1) || 'home');

  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js', { scope: './' });
      navigator.serviceWorker.addEventListener('controllerchange', refreshStatus);
    } catch (err) {
      console.warn('Service worker registration failed', err);
    }
  }
  // Ask the browser not to evict our data under storage pressure.
  try { await navigator.storage?.persist?.(); } catch { /* not critical */ }

  refreshStatus();
}

boot();
