# BENA — UI/UX prototype

Interactive frontend prototype of **BENA**, a national building identity and
connected building-services ecosystem. Frontend only: all data is fictional
sample data in memory and resets on reload. No backend, no auth, no external
services.

Open `bena/index.html` in a browser (works straight from the file system, or
served by any static server). `node tools/build.cjs` bundles everything into
a single self-contained HTML file in `dist/`.

## Three experiences, one product

| Route | Experience |
|---|---|
| `#hub` (default) | **Demo hub** — choose an experience, a demo role and the language |
| `#site`, `#site-vision`, `#site-solutions`, `#site-identity`, `#site-ecosystem`, `#site-contact`, `#site-login` | **Public website** — editorial, brand-led storytelling |
| `#municipality-home`, `#muniadmin-home`, `#manager-home`, `#facility-home`, `#committee-home`, `#provider-home`, `#owner-home`, `#resident-home`, `#admin-home` | **Enterprise web application** — desktop-first workspaces |
| `#m`, `#m-resident-home`, `#m-owner-home`, `#m-committee-home`, `#m-tech-home`, `#m-provider-home` | **Mobile application** — phone frame on desktop, full-screen on phones |

Language: the EN / عربي switch in every experience (full RTL). Architecture,
file ownership and honesty rules: `docs/MULTI-EXPERIENCE.md`.

## Architecture (classic scripts, no build step)

All code shares one global namespace `window.B`. Files load in the order
listed in `index.html`:

| File | Purpose |
|---|---|
| `css/bena.css` | Design system: tokens, shell, components, charts, map |
| `js/core.js` | i18n (`B.L`, `B.tx`), formatters, router, events, modals, toasts |
| `js/icons.js` | `B.icon(name)` — see `B.icons` for names; `B.logo()` |
| `js/ui.js` | HTML-string components (`B.ui.*`) and the status dictionary |
| `js/charts.js` | `B.charts.bars/line/donut/hbars/shares/ring/spark/heat` |
| `js/art.js` | Generated illustrations: `B.art.facade(seed,{type,floors})`, `interior`, `floorplan`, `qr`, `banner` |
| `js/data.js` | Shared demo data `B.data` (buildings, units, people, leases, committees, providers, requests…) |
| `js/map.js` | Simulated GIS map `B.map.render({...})` |
| `js/shell.js` | Welcome screen, sidebar / bottom tabs / drawer, role switcher |
| `js/building.js` | Shared building profile page (`B.shared.building`) |
| `js/market/*.js` | Shared marketplace pages |
| `js/roles/*.js` | One file per role experience |

## Conventions

### Bilingual text and RTL
* Every visible string is bilingual: `L('Units', 'الوحدات')`, or `tx({en, ar})` for data objects.
* Layout uses CSS logical properties (`margin-inline-start`, `inset-inline-end`, `text-align: start`). Never `left/right` for layout.
* Directional icons get the `flip` class: `icon('chevR', 'flip')`.
* IDs and codes: wrap in `B.ui.idMono(id)` (stays LTR inside Arabic text).
* Money: `B.money(n)` (₪). Dates: `B.date('2026-11-25')` (Levantine month names in Arabic). `B.today` is 25 Nov 2026.

### Routing
* Hash routes are `role-page[-id]`, e.g. `#resident-home`, `#owner-property-BN-RAM-00142-803`. Page names: ASCII letters and digits only (no hyphens).
* Navigate with `data-go="owner-leases"` on any element, or `B.go('owner-leases')`. A target without a known role prefix is relative to the current role: `data-go="lease-L-2026-0803"`.
* Shared pages (any role can use them): `building` (`role-building-<BENA ID>`), plus marketplace pages registered in `B.shared`.

### Registering a role
```js
B.role({
  id: 'owner', icon: 'key', nav: 'tabs' /* phone bottom tabs */ | 'drawer' /* admin roles */,
  name: {en, ar}, short: {en, ar}, org: {en, ar}, tag: {en, ar}, desc: {en, ar}, personaTitle: {en, ar},
  home: 'home',
  menu: [ { group: {en, ar} }, { id: 'home', label: {en, ar}, icon: 'grid', tab: true, match: ['subpage'] }, … ],
  pages: { home: (id) => html, … },
  notifications: () => [{ icon, title, sub, when, go }],
});
```
A page function returns an HTML string. Call `B.title(text)` inside a page to override the bar title
(sub-pages), and `B.navActive('leases')` to highlight a menu item.

### State, events and forms
* `B.vs` holds view state (filters, tabs). `B.get(key, default)` / `B.set(key, value)` (re-renders).
* Bind inputs with `data-model="key"` and a unique `id` (focus survives re-render). `B.ui.search()`, `B.ui.select()`, `B.ui.tabs()`, `B.ui.chips()`, `B.ui.seg()` already do this.
* Buttons: `data-act="name" data-arg="…"` calls `B.act.name(arg, el, ev)`. Built-ins: `set` (`data-arg="key=value"`), `toggle`, `go`, `back`, `closeModal`, `soon` (toast "simulated"), `toast`.
* Modals: `B.modal({ title, sub, body, foot, size: 'sm'|'md'|'lg', form: 'submitName' })`. With `form`, a `type="submit"` button submits it and `B.submit.submitName(data, formEl)` runs. Confirm with `B.success({ title, text, ref })`.
* Toasts: `B.toast(msg)`. Never use `alert/confirm/prompt`; use `B.confirm({ title, text, onOk })`.
* After-render hooks: `B.afterRender(fn)` for one render.
* Extra styles: `B.css(`...`)` inside your own file (prefix class names, use the tokens in `bena.css`).

### Components (`B.ui.*`, all return strings)
`pageHead`, `btn`, `card`, `kpi`, `status(key)`, `badge`, `sourceTag/sourceBadge`, `li/list`, `avatar`,
`empty`, `callout`, `kv`, `kvGrid`, `progress`, `meter`, `stars`, `timeline`, `stepper`, `tabs`, `seg`,
`chips`, `search`, `select`, `field`, `table` (responsive: becomes a card list on phones), `pager`,
`calendar`, `doc`, `demoNote`, `simRibbon`. Layout classes: `grid g2|g3|g4|g-main|g-side`, `stack`, `row`.

## Checking your work
```
node tools/check.cjs --role owner                 # every menu page, phone size
node tools/check.cjs --role owner --w 1440 --h 900 --shots /tmp/shots
node tools/check.cjs --routes owner-home --click  # click every control, report broken actions
node tools/check.cjs --role owner --ar            # Arabic / RTL
```
