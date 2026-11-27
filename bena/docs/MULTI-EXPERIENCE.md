# BENA — Multi-experience architecture (website · enterprise web app · mobile app)

One static, frontend-only prototype (`bena/index.html`, no build step) containing **three distinct experiences** that share one design language, one data set (`B.data`) and one router. Read `bena/README.md` first (conventions: `L(en, ar)`, `B.tx`, `B.ui.*`, `B.act`, `B.modal`, `B.css`, `B.map`, `tools/check.cjs`).

## Routes (hash, ASCII letters/digits/hyphens only)

| Route | Experience | Rendered by |
|---|---|---|
| `#hub` (default; `#welcome` alias) | Demo hub: choose experience + demo role + language | `js/hub.js` → `B.exp.hub(route)` |
| `#site`, `#site-<page>[-<id>]` | Public website | `js/site/*.js` → `B.exp.site(route)` |
| `#<role>-<page>[-<id>]` | Enterprise web application (desktop-first) | `js/shell.js` + `js/roles/*.js` |
| `#m-<role>-<screen>[-<id>]` | Mobile application (phone frame on desktop, full-screen on phones) | `js/mobile/shell.js` + `js/mobile/*.js` |

`route = { exp: 'hub'|'site'|'app'|'mobile', role, page, id }` is in `B.route`.
`data-go` / `B.go(target)`: an absolute target starts with `hub`, `site`, `m` or an enterprise role id; anything else is **relative to the current experience** (`data-go="vision"` on the website → `#site-vision`; `data-go="job-WO-26-1187"` in the mobile technician app → `#m-tech-job-WO-26-1187`).

Every experience root element carries `data-exp-root="site|mobile|hub"` (the enterprise shell uses `.view`) — `tools/check.cjs` relies on it.

## The three experiences must feel different
- **Website** — editorial, brand-led, immersive storytelling: large type, generous whitespace, scroll reveals, architectural imagery (generated SVG via `B.art`, the BENA map), no app chrome.
- **Enterprise app** — information-dense, structured, desktop-first: collapsible sidebar, top bar with workspace selector, breadcrumbs, dense tables with filters/sort, split views with detail panels, map workspaces, analytics. Compact adaptation on phones only.
- **Mobile app** — personal, task-oriented, touch-first: native-style large titles, stack navigation with back, bottom tab bar, bottom sheets, big touch targets (≥ 44px), cards, simple forms.
They share tokens (colours, type, icons, `B.ui` primitives where they fit) but NOT layouts or navigation.

## Design tokens (css/bena.css)
Navy `#142B3B` · Mint `#36D6A0` (accent only — selected states, primary actions, highlights; use `--mint-ink #0B8A60` for mint text on light backgrounds) · Background `#F4F7F6` · White · Slate `#64748B`. Fonts: Inter / Plus Jakarta Sans (display) / IBM Plex Sans Arabic. No heavy shadows, no gradient overload, no tiny text (≥ 12px, body 14–15px desktop, 15–17px mobile), no card walls.

## Bilingual + RTL
Every string via `L('English', 'العربية')` (MSA, natural — not word-for-word). `B.toggleLang()` switches; `html[dir=rtl]` flips layout. Use logical CSS properties only (`margin-inline-start`, `inset-inline-end`, `text-align: start`), add class `flip` to directional icons, wrap IDs/codes in `B.ui.idMono()` or `<bdi>`. Dates `B.date()`, money `B.money()` (₪).

## Honesty rules (must be visible in the UI)
- BENA is a **vision / prototype**: never present it as an official national registry or as connected to any real municipality. Municipal links are "designed to connect" / "sample municipal reference".
- **BENA Building ID is a digital reference identity, not proof of legal ownership** — say so wherever identity and ownership meet.
- Distinguish data provenance with the shared helper `B.ui.prov(kind)` → `official` (source-linked), `submitted` (user-submitted), `pending` (pending verification), `demo` (simulated demonstration data).
- Ramallah / Al-Bireh / Birzeit are **sample locations**; all people, IDs, buildings and figures are fictional. Label sample data.
- No live IoT/BMS: sensor views are "simulated preview".
- Vacant units are never auto-listed; listing requires the owner's authorisation.
- Committees: distinguish formally documented owners' associations from informal committees; never auto-assign legal status.

## File ownership (one owner per file — do not edit files you do not own)
| Owner | Files |
|---|---|
| Lead (core) | `js/core.js`, `js/ui.js`, `js/map.js`, `js/data.js`, `js/shell.js`, `js/building.js`, `js/hub.js`, `js/mobile/shell.js`, `css/bena.css`, `index.html`, `tools/*` |
| Website | `js/site/site-shell.js`, `js/site/site-home.js`, `js/site/site-pages.js` |
| Enterprise · Municipality | `js/roles/municipality.js`, `js/roles/municipality2.js` (also registers role `muniadmin`) |
| Enterprise · Property & Facility | `js/roles/manager.js`, `js/roles/manager2.js`, `js/roles/facility.js`, `js/roles/facility2.js` |
| Enterprise · Committee, Provider, Admin, Marketplaces | `js/roles/committee.js`, `js/roles/committee2.js`, `js/roles/provider.js`, `js/roles/provider2.js`, `js/roles/admin.js`, `js/roles/admin2.js`, `js/market/services.js`, `js/market/property.js` |
| Mobile · Resident & Owner | `js/mobile/resident.js`, `js/mobile/owner.js` |
| Mobile · Committee, Technician, Provider | `js/mobile/committee.js`, `js/mobile/tech.js`, `js/mobile/provider.js` |

`js/roles/owner.js` and `js/roles/resident.js` (enterprise web portals for owners/residents) stay as they are.
Need something in a core file? Work around it in your own file and report it — do not edit core files.

## Testing
```
node tools/check.cjs --role municipality --w 1440 --h 900      # enterprise, desktop
node tools/check.cjs --role municipality --w 1280 --h 800 --ar
node tools/check.cjs --site --w 1440 --h 900 ; node tools/check.cjs --site --w 430 --h 932
node tools/check.cjs --mrole tech --w 430 --h 932 ; --w 1440 --h 900 (phone frame) ; --ar
node tools/check.cjs --routes <routes> --click                  # press every control
```
Screenshots: add `--shots <dir>` and LOOK at them (Read tool). Viewports to verify: 1440×900, 1280×800, 768×1024, 430×932.
