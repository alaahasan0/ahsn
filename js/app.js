/*
 * App bootstrap and router.
 *
 * Architecture (kept strictly separate):
 *   js/engine/  – pure financial calculation engine (integer cents, no DOM, no storage)
 *   js/db/      – IndexedDB persistence layer
 *   js/state.js – loads data, runs mutations, notifies screens
 *   js/ui/      – screens and components
 *   js/app.js   – boots the app and routes between screens
 */

import * as store from './state.js';
import { html, frag, toast } from './ui/dom.js';
import { applyTheme } from './ui/theme.js';
import { renderSetup } from './ui/screens/setup.js';
import { renderHome } from './ui/screens/home.js';
import { renderMore } from './ui/screens/more.js';

export const APP_VERSION = '0.3.0';

const placeholder = (title, text) => () => frag(html`
  <h1 class="title-large">${title}</h1>
  <div class="placeholder">${text}</div>
`);

const routes = {
  home: renderHome,
  ledger: placeholder('Ledger', 'Transaction history, payment entry and balance adjustments arrive in Phase 4.'),
  months: placeholder('Months', 'Monthly statements arrive in Phase 5.'),
  more: () => renderMore({ version: APP_VERSION }),
};

const view = document.getElementById('view');
const tabs = [...document.querySelectorAll('.tab')];
let current = null;

function currentRoute() {
  const r = location.hash.slice(1);
  return routes[r] ? r : 'home';
}

function render({ animate = false, keepScroll = true } = {}) {
  const banner = document.getElementById('demo-banner');
  banner.hidden = !store.isDemo();

  if (!store.isConfigured()) {
    document.body.classList.add('is-setup');
    view.replaceChildren(renderSetup({
      onDone: () => {
        toast('You’re all set');
        location.hash = 'home';
        render({ animate: true, keepScroll: false });
      },
    }));
    current = 'setup';
    return;
  }
  document.body.classList.remove('is-setup');

  const route = currentRoute();
  const changed = route !== current;
  current = route;
  tabs.forEach((t) => {
    const active = t.dataset.route === route;
    t.classList.toggle('is-active', active);
    if (active) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
  });

  const y = window.scrollY;
  view.replaceChildren(routes[route]());
  if (animate || changed) {
    view.classList.remove('enter');
    void view.offsetWidth;
    view.classList.add('enter');
  }
  window.scrollTo(0, keepScroll && !changed ? y : 0);
}

tabs.forEach((t) => t.addEventListener('click', () => {
  if (location.hash.slice(1) === t.dataset.route) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  location.hash = t.dataset.route;
}));
window.addEventListener('hashchange', () => render({ keepScroll: false }));
store.subscribe(() => render());

/* ---------- Boot ---------- */

async function boot() {
  applyTheme();
  try {
    await store.load();
  } catch (err) {
    view.replaceChildren(frag(html`
      <h1 class="title-large">Can’t open data</h1>
      <p class="muted">${err.message || err}</p>
      <p class="muted">Close the app completely and open it again. If this keeps happening, check that Safari is not in Private Browsing.</p>
    `));
    return;
  }
  render({ animate: true });
  registerServiceWorker();
  try { await navigator.storage?.persist?.(); } catch { /* not critical */ }
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('./sw.js', { scope: './' }).catch((err) => console.warn('SW registration failed', err));
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) {
      toast('A new version is ready', { action: 'Reload', onAction: () => location.reload(), duration: 0 });
    }
  });
}

boot();
