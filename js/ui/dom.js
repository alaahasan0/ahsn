/*
 * Tiny DOM toolkit: safe HTML templating, bottom sheets, confirmations, toasts.
 */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
/** Mark a string as trusted HTML (not escaped by `html`). */
export const raw = (s) => new Raw(s);

/**
 * Tagged template that escapes every interpolated value unless it is raw()
 * or an array of raw() values. Returns a raw() value so templates can nest.
 */
export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((v, i) => {
    if (Array.isArray(v)) out += v.map((x) => (x instanceof Raw ? x.s : esc(x))).join('');
    else if (v instanceof Raw) out += v.s;
    else if (v === false || v === null || v === undefined) out += '';
    else out += esc(v);
    out += strings[i + 1];
  });
  return new Raw(out);
}

/** Turn an html`` result (or string) into a DocumentFragment. */
export function frag(markup) {
  const tpl = document.createElement('template');
  tpl.innerHTML = String(markup).trim();
  return tpl.content;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------- Bottom sheet ---------- */

let sheetDepth = 0;

/**
 * Open a modal bottom sheet.
 * content: html`` result or Node. Returns { el, body, close }.
 */
export function openSheet({ title = '', content = '', onClose, actionLabel, onAction } = {}) {
  const root = frag(html`
    <div class="sheet-backdrop" data-close></div>
    <section class="sheet" role="dialog" aria-modal="true" aria-label="${title}">
      <header class="sheet-header">
        <button class="sheet-btn" data-close type="button">Close</button>
        <h2 class="sheet-title">${title}</h2>
        ${actionLabel ? html`<button class="sheet-btn sheet-btn-strong" data-action type="button">${actionLabel}</button>` : html`<span class="sheet-btn" aria-hidden="true"></span>`}
      </header>
      <div class="sheet-body"></div>
    </section>
  `);
  const backdrop = root.querySelector('.sheet-backdrop');
  const el = root.querySelector('.sheet');
  const body = root.querySelector('.sheet-body');
  if (content instanceof Node) body.append(content);
  else body.append(frag(content));

  document.body.append(backdrop, el);
  sheetDepth++;
  document.documentElement.classList.add('has-sheet');
  requestAnimationFrame(() => { backdrop.classList.add('is-open'); el.classList.add('is-open'); });

  let closed = false;
  function close(reason) {
    if (closed) return;
    closed = true;
    backdrop.classList.remove('is-open');
    el.classList.remove('is-open');
    setTimeout(() => {
      backdrop.remove(); el.remove();
      if (--sheetDepth <= 0) { sheetDepth = 0; document.documentElement.classList.remove('has-sheet'); }
    }, 280);
    onClose?.(reason);
  }
  backdrop.addEventListener('click', () => close('backdrop'));
  el.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => close('cancel')));
  el.querySelector('[data-action]')?.addEventListener('click', () => onAction?.({ el, body, close }));
  return { el, body, close };
}

/** Promise-based confirmation sheet. Resolves true when confirmed. */
export function confirmSheet({ title, message = '', confirmLabel = 'Confirm', destructive = false }) {
  return new Promise((resolve) => {
    let answered = false;
    const s = openSheet({
      title,
      content: html`
        <p class="confirm-text">${message}</p>
        <button type="button" class="btn btn-block ${destructive ? 'btn-destructive' : ''}" data-confirm>${confirmLabel}</button>
        <button type="button" class="btn btn-block btn-plain" data-cancel>Cancel</button>
      `,
      onClose: () => { if (!answered) resolve(false); },
    });
    s.body.querySelector('[data-confirm]').addEventListener('click', () => { answered = true; resolve(true); s.close(); });
    s.body.querySelector('[data-cancel]').addEventListener('click', () => s.close());
  });
}

/* ---------- Toast ---------- */

let toastTimer;
export function toast(message, { action, onAction, duration = 2600 } = {}) {
  document.querySelector('.toast')?.remove();
  const node = frag(html`<div class="toast" role="status"><span>${message}</span>${action ? html`<button type="button">${action}</button>` : ''}</div>`).firstElementChild;
  document.body.append(node);
  node.querySelector('button')?.addEventListener('click', () => { onAction?.(); node.remove(); });
  requestAnimationFrame(() => node.classList.add('is-visible'));
  clearTimeout(toastTimer);
  if (duration) {
    toastTimer = setTimeout(() => {
      node.classList.remove('is-visible');
      setTimeout(() => node.remove(), 300);
    }, duration);
  }
}
