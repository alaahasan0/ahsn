/*
 * BENA Mobile — Property Owner (B.mrole id `owner`).
 * Persona: Khaled Mansour (p_khaled) — six units in five buildings: three rented,
 * two vacant (one listed by his manager, one not), one family home co-owned with
 * Rana Mansour. Shares the owner data set defined by the web portal
 * (B.data.ownerX in js/roles/owner.js) so both experiences stay consistent.
 * Phone-first: glanceable portfolio, what needs attention, one-tap detail.
 * All data is fictional sample data; payments and authorisations are simulated.
 */
(function () {
  const B = window.B, M = B.m;
  const { L, tx, esc, icon } = B;
  const ui = B.ui;
  const D = B.data;
  const T = (en, ar) => ({ en, ar });
  const ME = 'p_khaled';
  const TODAY = '2026-11-25';
  const OX = (D.ownerX = D.ownerX || {});
  OX.unitIds = OX.unitIds || [];
  OX.meta = OX.meta || {}; OX.history = OX.history || {}; OX.pastLeases = OX.pastLeases || []; OX.leaseX = OX.leaseX || {};
  OX.renewals = OX.renewals || {}; OX.payOverride = OX.payOverride || {}; OX.payDay = OX.payDay || {}; OX.lateOn = OX.lateOn || {}; OX.payMethod = OX.payMethod || {}; OX.received = OX.received || {};
  OX.charges = OX.charges || []; OX.reps = OX.reps || []; OX.scopes = OX.scopes || {}; OX.relLabels = OX.relLabels || {}; OX.proxies = OX.proxies || []; OX.docs = OX.docs || []; OX.docCats = OX.docCats || [];
  Object.assign(B.statuses, {
    tenantPays: B.statuses.tenantPays || { en: 'Paid by tenant', ar: 'يدفعها المستأجر', tone: 'outline', icon: 'user' },
    proposed: B.statuses.proposed || { en: 'Proposed', ar: 'مقترحة', tone: 'violet', icon: 'vote' },
    late: B.statuses.late || { en: 'Paid late', ar: 'دُفعت متأخرة', tone: 'warn' },
    offerSent: B.statuses.offerSent || { en: 'Renewal offer sent', ar: 'تم إرسال عرض التجديد', tone: 'info', icon: 'send' },
    revoked: B.statuses.revoked || { en: 'Revoked', ar: 'ملغاة', tone: 'neutral' },
  });
  const st = { seenNotifs: false, seq: 1 };

  /* ---------------- helpers ---------------- */
  const myUnits = () => OX.unitIds.map((id) => D.unit(id)).filter((u) => u && u.owner === ME);
  const meta = (u) => OX.meta[u.id || u] || {};
  const bld = (id) => D.building(id);
  const share = (u) => meta(u).share || 100;
  const allLeases = () => D.leases.filter((l) => l.owner === ME);
  const leaseById = (id) => D.lease(id) || OX.pastLeases.find((l) => l.id === id);
  const leaseOf = (u) => D.leases.find((l) => l.unit === u.id && l.owner === ME);
  const unitName = (u) => D.unitLabel(u);
  const bName = (bid) => tx(bld(bid).name);
  const iso = (y, m, d = 1) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const ymLabel = (ym, short) => { const [y, m] = ym.split('-').map(Number); return short ? B.mon(m - 1) : `${B.monLong(m - 1)} ${y}`; };
  const moneyC = (n) => (B.isAr() ? `${B.compact(n)} ₪` : `₪${B.compact(n)}`);
  const seedOf = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 997; };
  const facade = (bid, sky = 'day') => { const b = bld(bid); return B.art.facade(seedOf(b.id) + 3, { type: b.type, floors: b.floors, sky }); };
  const id = (s) => `<bdi class="id-mono">${esc(s)}</bdi>`;
  const statusOf = (u) => (meta(u).listing?.state === 'listed' && u.status === 'vacant' ? 'listed' : u.status);
  const leaseStatus = (l) => (OX.renewals[l.id] ? 'offerSent' : l.status);
  const greet = () => { const h = B.today.getHours(); return h < 12 ? L('Good morning', 'صباح الخير') : h < 18 ? L('Good afternoon', 'نهارك سعيد') : L('Good evening', 'مساء الخير'); };
  const ownerChargeAmt = (c) => Math.round((c.amount * c.share) / 100);
  const chargesDue = () => OX.charges.filter((c) => c.status === 'due' || c.status === 'overdue');
  const repName = (r) => (r.org ? tx(D.org(r.org).name) : D.pname(r.p));
  const repsFor = (uid) => OX.reps.filter((r) => r.units.includes(uid) && r.status !== 'expired' && r.status !== 'revoked');
  const ownerLine = (o) => (o.p ? D.pname(o.p) : tx(o.org));
  const kindIcon = (u) => ({ apartment: 'home', office: 'briefcase', shop: 'store', clinic: 'heart' }[u.kind] || 'door');
  const myBuildings = () => [...new Set(myUnits().map((u) => u.building))];
  const DEF_UNIT = 'BN-RAM-00142-803';
  const DEF_LEASE = 'L-2026-0803';

  /** Monthly rent schedule — same rules as the owner web portal. */
  const schedule = (l) => {
    const out = [];
    let [y, m] = l.start.split('-').map(Number);
    const [ey, em] = l.end.split('-').map(Number);
    while (y < ey || (y === ey && m <= em)) {
      const ym = `${y}-${String(m).padStart(2, '0')}`;
      const due = iso(y, m, l.payDay || 1);
      const k = `${l.id}|${ym}`;
      let status, paidOn = null;
      if (due > TODAY) status = B.daysBetween(TODAY, due) <= 7 ? 'due' : 'upcoming';
      else if (OX.payOverride[k] && !OX.received[k]) status = OX.payOverride[k];
      else { status = OX.lateOn[k] ? 'late' : 'paid'; paidOn = OX.received[k] || OX.lateOn[k] || iso(y, m, OX.payDay[l.id] || 1); }
      let amount = l.rent;
      if (l.id === 'L-2024-0415') amount = ym < '2025-06' ? 4525 : ym < '2026-06' ? 4660 : 4800;
      if (l.id === 'L-2025-0702' && ym < '2026-03') amount = 5400;
      out.push({ id: `${l.id}-${ym}`, lease: l.id, unit: l.unit, tenant: l.tenant, ym, due, amount, status, paidOn, method: paidOn ? OX.payMethod[l.id] : null });
      m++; if (m > 12) { m = 1; y++; }
    }
    return out;
  };
  const allPayments = () => allLeases().concat(OX.pastLeases).flatMap(schedule);
  const monthStats = (ym = '2026-11') => {
    const rows = allPayments().filter((p) => p.ym === ym);
    const expected = B.sum(rows, (p) => p.amount);
    const got = B.sum(rows.filter((p) => p.status === 'paid' || p.status === 'late'), (p) => p.amount);
    return { rows, expected, got, overdue: B.sum(rows.filter((p) => p.status === 'overdue'), (p) => p.amount) };
  };
  const overdueRows = () => allPayments().filter((p) => p.status === 'overdue');
  const value = () => B.sum(myUnits(), (u) => ((meta(u).value || 0) * share(u)) / 100);
  const counts = () => { const us = myUnits(); return { all: us.length, rented: us.filter((u) => u.status === 'rented').length, vacant: us.filter((u) => u.status === 'vacant').length, own: us.filter((u) => u.status === 'ownerOccupied').length }; };

  /* back-stack: Back returns to wherever you came from; tab roots reset it */
  const stack = [];
  const ROOTS = ['home', 'properties', 'tenancy', 'income', 'more'];
  const track = (key, page) => {
    if (ROOTS.includes(page)) { stack.length = 0; stack.push(key); return null; }
    if (stack[stack.length - 1] === key) { /* re-render */ } else if (stack[stack.length - 2] === key) stack.pop(); else stack.push(key);
    return stack[stack.length - 2] || null;
  };

  /* ---------------- styles (prefix mo-) ---------------- */
  B.css(`
  /* shell's '.mx-tab span' rule clips tab badges; keep the icon wrapper unclipped for this role */
  .mx-tabs:has([data-go^="m-owner-"]) .mx-tab .mt-i { overflow: visible; max-width: none; }
  .mo-num { font-family: var(--font-display); font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
  .mo-ava { border-radius: 50%; }
  .mo-ava .avatar { width: 44px; height: 44px; font-size: 15px; box-shadow: 0 0 0 3px #fff, 0 2px 8px rgba(20,43,59,.12); }
  .mo-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--mint-ink); display: block; }
  html[dir="rtl"] .mo-eyebrow { letter-spacing: 0; }
  .mo-hero { background: var(--navy); color: var(--navy-ink); border-radius: 26px; padding: 20px; display: flex; flex-direction: column; gap: 18px; position: relative; overflow: hidden; width: 100%; text-align: start; }
  .mo-hero::before { content: ""; position: absolute; width: 260px; height: 260px; border-radius: 50%; inset-inline-end: -90px; top: -120px; background: radial-gradient(circle, rgba(54,214,160,.24), rgba(54,214,160,0) 70%); }
  .mo-hero > * { position: relative; }
  .mo-hero .h-top { display: flex; align-items: center; gap: 18px; }
  .mo-hero .h-l { font-size: 13.5px; font-weight: 600; }
  .mo-hero .h-v { font-size: 34px; color: #fff; line-height: 1.05; display: block; margin-top: 4px; }
  .mo-hero .h-s { font-size: 13.5px; margin-top: 4px; display: block; }
  .mo-hero .h-s b { color: #fff; white-space: nowrap; }
  .mo-ring { width: 92px; height: 92px; border-radius: 50%; flex: none; display: grid; place-items: center; background: conic-gradient(var(--mint) calc(var(--p) * 1%), rgba(255,255,255,.12) 0); position: relative; }
  .mo-ring::before { content: ""; position: absolute; inset: 9px; border-radius: 50%; background: var(--navy); }
  .mo-ring span { position: relative; font: 700 21px/1 var(--font-display); color: #fff; }
  .mo-ring small { font-size: 12px; color: var(--navy-ink); }
  .mo-hstats { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid rgba(255,255,255,.1); padding-top: 14px; }
  .mo-hstats div { display: flex; flex-direction: column; gap: 2px; }
  .mo-hstats div + div { border-inline-start: 1px solid rgba(255,255,255,.1); padding-inline-start: 14px; }
  .mo-hstats b { color: #fff; font: 700 19px/1.15 var(--font-display); font-variant-numeric: tabular-nums; }
  .mo-hstats span { font-size: 12px; }
  .mo-occ { display: flex; height: 8px; border-radius: 6px; overflow: hidden; gap: 2px; }
  .mo-occ i { display: block; height: 100%; }
  .mo-legend { display: flex; gap: 6px 14px; flex-wrap: wrap; font-size: 12.5px; }
  .mo-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .mo-legend i { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
  .mo-rail { display: flex; gap: 12px; overflow-x: auto; scrollbar-width: none; margin-inline: -16px; padding: 2px 16px 4px; scroll-snap-type: x mandatory; scroll-padding-inline: 16px; }
  .mo-rail::-webkit-scrollbar { display: none; }
  .mo-pc { flex: none; width: 236px; scroll-snap-align: start; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; overflow: hidden; text-align: start; display: flex; flex-direction: column; }
  .mo-pc .p-art { height: 128px; position: relative; background: var(--surface-2); }
  .mo-pc .p-art > svg { width: 100%; height: 100%; display: block; }
  .mo-pc .p-art .badge { position: absolute; top: 10px; inset-inline-start: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.12); }
  .mo-pc .p-b { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 3px; }
  .mo-pc b { font-size: 15.5px; }
  .mo-pc small { font-size: 13px; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mo-pc .p-v { font-size: 14px; font-weight: 600; margin-top: 4px; }
  .mo-big { display: flex; flex-direction: column; width: 100%; text-align: start; background: #fff; border: 1px solid var(--line-2); border-radius: 22px; overflow: hidden; }
  .mo-big:active, .mo-pc:active { transform: scale(.99); }
  .mo-big .p-art { height: 168px; position: relative; }
  .mo-big .p-art > svg { width: 100%; height: 100%; display: block; }
  .mo-big .p-art .tags { position: absolute; top: 12px; inset-inline: 12px; display: flex; gap: 6px; flex-wrap: wrap; }
  .mo-big .p-art .tags .badge { box-shadow: 0 2px 8px rgba(0,0,0,.12); }
  .mo-big .p-b { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 10px; }
  .mo-big .p-t { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .mo-big .p-t b { font-size: 17px; }
  .mo-big .p-t span { font-size: 13px; color: var(--text-3); }
  .mo-big .p-s { font-size: 13.5px; color: var(--text-2); margin-top: -6px; }
  .mo-big .p-k { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; border-top: 1px solid var(--line-2); padding-top: 12px; }
  .mo-big .p-k > span { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .mo-big .p-k > span > span { font-size: 12px; color: var(--text-3); font-weight: 500; }
  .mo-big .p-k > span > b { color: var(--ink); font-size: 14.5px; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mo-note { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; color: var(--text-2); line-height: 1.45; padding: 0 6px; }
  .mo-note svg { width: 16px; height: 16px; flex: none; margin-top: 2px; color: var(--text-3); }
  .mo-legal { display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border-radius: 18px; background: #fff; border: 1.5px dashed #B9C6CF; font-size: 13.5px; color: var(--text-2); line-height: 1.45; }
  .mo-legal svg { width: 20px; height: 20px; color: var(--navy); flex: none; margin-top: 1px; }
  .mo-legal b { color: var(--ink); }
  .mo-chead { display: flex; align-items: flex-start; gap: 12px; }
  .mo-chead h3 { font-size: 17px; line-height: 1.3; }
  .mo-chead p { font-size: 13.5px; color: var(--text-2); margin-top: 2px; }
  .mo-chead > .mc-c { width: 18px; height: 18px; color: #B6C2BD; flex: none; align-self: center; }
  .mo-ci { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; background: var(--mint-50); color: var(--mint-ink); flex: none; }
  .mo-ci svg { width: 22px; height: 22px; }
  .mo-ci.navy { background: var(--navy); color: var(--mint); }
  .mo-kv { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 12px; }
  .mo-kv div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .mo-kv span { font-size: 12.5px; color: var(--text-3); font-weight: 500; }
  .mo-kv b { font-size: 15px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
  .mo-term { display: flex; flex-direction: column; gap: 8px; }
  .mo-term .t-row { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-3); font-weight: 600; }
  .mo-actions { display: flex; gap: 10px; }
  .mo-actions .mx-btn { flex: 1; }
  .mo-shares { display: flex; height: 14px; border-radius: 8px; overflow: hidden; gap: 3px; }
  .mo-shares i { display: block; height: 100%; }
  .mo-tl { display: flex; flex-direction: column; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 16px 16px 2px; }
  .mo-tl .t { display: flex; gap: 14px; position: relative; padding-bottom: 18px; }
  .mo-tl .t::before { content: ""; position: absolute; inset-inline-start: 11px; top: 26px; bottom: 2px; width: 2px; background: var(--line); border-radius: 2px; }
  .mo-tl .t:last-child::before { display: none; }
  .mo-tl .t-i { width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--line); background: #fff; flex: none; display: grid; place-items: center; }
  .mo-tl .t-i svg { width: 12px; height: 12px; }
  .mo-tl .t.on .t-i { background: var(--mint); border-color: var(--mint); color: var(--navy); }
  .mo-tl .t-b { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .mo-tl b { font-size: 15px; line-height: 1.3; }
  .mo-tl .t-d { font-size: 12.5px; color: var(--text-3); font-weight: 600; }
  .mo-tl .t-x { font-size: 13.5px; color: var(--text-2); line-height: 1.4; }
  .mo-tl .t-r { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-top: 2px; }
  .mo-rep { display: flex; flex-direction: column; gap: 12px; width: 100%; text-align: start; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 16px; }
  .mo-rep:active { background: #F7FAF9; }
  .mo-rep .r-h { display: flex; gap: 12px; align-items: center; }
  .mo-rep .avatar { width: 46px; height: 46px; font-size: 15px; }
  .mo-rep .r-h b { font-size: 16px; display: block; line-height: 1.25; }
  .mo-rep .r-h small { font-size: 13px; color: var(--text-2); display: block; margin-top: 2px; }
  .mo-scopes { display: flex; gap: 6px; flex-wrap: wrap; }
  .mo-scope { display: inline-flex; align-items: center; height: 28px; padding: 0 11px; border-radius: 14px; background: var(--surface-2); border: 1px solid var(--line-2); font-size: 12.5px; font-weight: 600; color: var(--text-2); }
  .mo-rep .r-f { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 13px; color: var(--text-2); border-top: 1px solid var(--line-2); padding-top: 12px; }
  .mo-rep.dim { opacity: .72; }
  .mo-opt { display: flex; align-items: center; gap: 12px; padding: 12px 14px; min-height: 56px; border-radius: 16px; border: 1.5px solid var(--line); background: #fff; cursor: pointer; }
  .mo-opt input { position: absolute; opacity: 0; pointer-events: none; }
  .mo-opt .o-b { flex: 1; min-width: 0; }
  .mo-opt b { font-size: 15px; display: block; }
  .mo-opt small { font-size: 13px; color: var(--text-2); }
  .mo-opt .o-r { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #C3CEC9; flex: none; }
  .mo-opt.chk .o-r { border-radius: 7px; }
  .mo-opt:has(input:checked) { border-color: var(--mint); background: var(--mint-50); }
  .mo-opt:has(input:checked) .o-r { border-color: var(--mint-ink); background: var(--mint-ink); box-shadow: inset 0 0 0 4px #fff; }
  .mo-opt.chk:has(input:checked) .o-r { box-shadow: inset 0 0 0 3px var(--mint-ink); background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12l5 5 9-10'/%3E%3C/svg%3E") center / 14px no-repeat; background-color: var(--mint-ink); }
  .mo-opts { display: flex; flex-direction: column; gap: 8px; }
  .mo-sheet-amt { text-align: center; padding: 4px 0; }
  .mo-sheet-amt b { font-size: 38px; line-height: 1.05; display: block; }
  .mo-sheet-amt span { font-size: 14px; color: var(--text-2); }
  .mo-sum { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .mo-me { display: flex; align-items: center; gap: 14px; width: 100%; text-align: start; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 16px; }
  .mo-me .avatar { width: 60px; height: 60px; font-size: 20px; }
  .mo-me b { font-size: 19px; display: block; }
  .mo-me small { font-size: 13.5px; color: var(--text-2); display: block; margin-top: 2px; }
  .mo-foot { text-align: center; font-size: 12.5px; color: var(--text-3); line-height: 1.5; padding: 0 12px; }
  .mo-bhero { position: relative; border-radius: 24px; overflow: hidden; height: 220px; background: var(--navy); }
  .mo-bhero > svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .mo-bhero::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(13,31,43,0) 22%, rgba(13,31,43,.72) 60%, rgba(13,31,43,.96) 100%); }
  .mo-bhero .bh-b { position: absolute; inset-inline: 18px; bottom: 16px; z-index: 1; color: #fff; display: flex; flex-direction: column; gap: 6px; }
  .mo-bhero h2 { color: #fff; font-size: 23px; line-height: 1.15; }
  .mo-bhero .bh-a { font-size: 13.5px; color: var(--navy-ink); }
  .mo-bhero .tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .mo-plan { background: #fff; border: 1px solid var(--line-2); border-radius: 22px; overflow: hidden; }
  .mo-plan .p-art { height: 190px; position: relative; }
  .mo-plan .p-art > svg { width: 100%; height: 100%; display: block; }
  .mo-specs { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--line-2); }
  .mo-specs div { padding: 12px 6px; text-align: center; display: flex; flex-direction: column; gap: 2px; }
  .mo-specs div + div { border-inline-start: 1px solid var(--line-2); }
  .mo-specs b { font-size: 15px; font-variant-numeric: tabular-nums; }
  .mo-specs span { font-size: 12px; color: var(--text-3); }
  .mo-stat3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .mo-stat3 div { background: var(--surface-2); border-radius: 14px; padding: 10px; text-align: center; }
  .mo-stat3 b { display: block; font: 700 20px/1.1 var(--font-display); }
  .mo-stat3 span { font-size: 12px; color: var(--text-3); }
  .mo-bars .chart { margin-top: 4px; }
  .mo-doc { aspect-ratio: 3 / 3.6; max-height: 320px; margin: 0 auto; width: 74%; background: #fff; border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 10px 30px rgba(20,43,59,.1); padding: 22px 20px; display: flex; flex-direction: column; gap: 9px; }
  .mo-doc i { display: block; height: 7px; border-radius: 4px; background: #E8EEEB; }
  .mo-doc .d-h { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .mo-doc .d-h svg { width: 22px; height: 22px; color: var(--mint-ink); flex: none; }
  .mo-doc .d-h b { font-size: 12px; }
  .mo-doc .d-s { margin-top: auto; display: flex; justify-content: flex-end; }
  .mo-doc .d-s span { width: 46px; height: 46px; border-radius: 50%; border: 2px solid var(--mint); display: grid; place-items: center; color: var(--mint-ink); }
  .mo-doc .d-s span svg { width: 22px; height: 22px; }
  .mo-sw { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-inline-end: 8px; }
  `);

  /* ---------------- shared pieces ---------------- */
  const note = (text, ic = 'info') => `<div class="mo-note">${icon(ic)}<span>${text}</span></div>`;
  const legalNote = () => `<div class="mo-legal">${icon('gavel')}<span><b>${L('BENA records relationships for coordination — not a legal title record.', 'تسجّل بينا العلاقات لأغراض التنسيق — وليست سجلاً قانونياً لسندات الملكية.')}</b> ${L('The land registry deed is the legal reference. The BENA ID is a digital reference, not proof of ownership.', 'سند تسجيل الأراضي هو المرجع القانوني. ورقم بينا مرجع رقمي وليس إثباتاً للملكية.')}</span></div>`;
  const radio = (name, v, title, sub, checked, chk) => `<label class="mo-opt ${chk ? 'chk' : ''}"><input type="${chk ? 'checkbox' : 'radio'}" name="${name}" value="${esc(v)}" ${checked ? 'checked' : ''}><span class="o-b"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span><span class="o-r"></span></label>`;
  const occColor = { rented: 'var(--mint)', ownerOccupied: '#7FA7C2', vacant: '#F2B35A', listed: '#F2B35A', maintenance: '#F2B35A' };
  const unitLine = (u) => {
    const l = leaseOf(u), m = meta(u);
    if (u.status === 'rented' && l) return L(`${D.pname(l.tenant)} · ${B.money(l.rent)}/mo`, `${D.pname(l.tenant)} · ${B.money(l.rent)} شهرياً`);
    if (u.status === 'ownerOccupied') return L('Your family home', 'منزل عائلتك');
    if (u.status === 'vacant') return m.vacantSince ? L(`Vacant since ${B.dateShort(m.vacantSince)}`, `شاغرة منذ ${B.dateShort(m.vacantSince)}`) : L('Vacant', 'شاغرة');
    return ui.statusLabel(u.status);
  };
  const shareBadge = (u) => (share(u) < 100 ? ui.badge(L(`${share(u)}% share`, `حصة ${share(u)}%`), 'navy', 'users') : '');
  const pcard = (u) => `<button class="mo-pc" data-go="unit-${u.id}"><span class="p-art">${facade(u.building)}${ui.status(statusOf(u))}</span><span class="p-b"><b>${unitName(u)}</b><small>${esc(bName(u.building))}</small><span class="p-v">${unitLine(u)}</span></span></button>`;
  const leaseCard = (l) => {
    const u = D.unit(l.unit);
    const total = B.daysBetween(l.start, l.end), gone = Math.max(0, Math.min(total, B.daysBetween(l.start, TODAY))), left = B.daysFromToday(l.end);
    return M.card(`<div class="mo-chead">${ui.avatar(D.person(l.tenant).name)}<div style="flex:1;min-width:0"><h3>${esc(D.pname(l.tenant))}</h3><p>${unitName(u)} · ${esc(bName(l.building))}</p></div>${ui.status(leaseStatus(l))}</div>
      <div class="mo-term"><div class="t-row"><span>${B.dateShort(l.start)}</span><span>${left > 0 ? L(`${left} days left`, `متبقٍ ${left} يوماً`) : L('Ended', 'انتهى')}</span><span>${B.dateShort(l.end)}</span></div>${ui.progress(Math.round((gone / total) * 100), l.status === 'expiring' && !OX.renewals[l.id] ? 'warn' : l.past ? 'navy' : '')}</div>
      <div class="mo-kv"><div><span>${L('Monthly rent', 'الإيجار الشهري')}</span><b>${B.money(l.rent)}</b></div><div><span>${L('Contract', 'العقد')}</span><b>${id(l.id)}</b></div></div>`, '', { go: `lease-${l.id}` });
  };
  const payCell = (p) => M.cell({ icon: p.status === 'overdue' ? 'alertCircle' : p.status === 'paid' || p.status === 'late' ? 'checkCircle' : 'clock', tone: p.status === 'overdue' ? 'bad' : p.status === 'paid' ? 'mint' : p.status === 'late' ? 'warn' : 'info', title: `${ymLabel(p.ym)}`, sub: p.paidOn ? `${L('Received', 'استُلم')} ${B.dateShort(p.paidOn)}${p.method ? ' · ' + tx(p.method) : ''}` : `${L('Due', 'يستحق')} ${B.dateShort(p.due)}`, value: B.money(p.amount), badge: ui.status(p.status), act: p.status === 'overdue' ? 'moReceive' : p.paidOn ? 'moRentReceipt' : '', arg: p.id });

  /* ---------------- notifications ---------------- */
  const notifs = () => {
    const od = overdueRows();
    const cd = chargesDue();
    return [
      od.length && { icon: 'alertCircle', tone: 'bad', title: L(`Rent overdue — ${unitName(D.unit(od[0].unit))}`, `إيجار متأخر — ${unitName(D.unit(od[0].unit))}`), sub: `${D.pname(od[0].tenant)} · ${B.money(od[0].amount)}`, when: L('Today', 'اليوم'), go: `lease-${od[0].lease}`, fresh: true },
      { icon: 'key', tone: 'warn', title: L('Firas Awwad’s authorisation is pending verification', 'تفويض فراس عواد بانتظار التحقق'), sub: L('Limited power of attorney · Shop G02', 'وكالة محدودة · محل G02'), when: B.ago('2026-11-20'), go: 'reps', fresh: true },
      cd.length && { icon: 'building', tone: 'warn', title: L(`${cd.length} building charges due`, `${cd.length} رسوم مبانٍ مستحقة`), sub: L(`Your share ${B.money(B.sum(cd, ownerChargeAmt))}`, `حصتك ${B.money(B.sum(cd, ownerChargeAmt))}`), when: L('This week', 'هذا الأسبوع'), go: 'income', fresh: true },
      { icon: 'contract', tone: 'info', title: L('Lina Haddad’s lease ends 31 Jan 2027', 'ينتهي عقد لينا حداد في 31 كانون الثاني 2027'), sub: L('Send a renewal offer', 'أرسل عرض تجديد'), when: L('This week', 'هذا الأسبوع'), go: `lease-${DEF_LEASE}` },
      { icon: 'vote', tone: 'violet', title: L('Elevator levy vote — 4 Dec', 'التصويت على مساهمة المصاعد — 4 ك١'), sub: L('Al-Masyoun Tower general assembly', 'الهيئة العامة لبرج الماصيون'), when: B.ago('2026-11-18'), go: 'building-BN-RAM-00142' },
      { icon: 'eye', tone: 'mint', title: L('Apartment 604 had 148 listing views', 'حققت الشقة 604 148 مشاهدة'), sub: L('5 inquiries · 2 viewings booked by Arkan', '5 استفسارات · معاينتان حجزتهما أركان'), when: B.ago('2026-11-12'), go: 'unit-BN-RAM-00266-604' },
    ].filter(Boolean);
  };

  /* =====================================================================
   * Screens
   * ===================================================================== */
  const S = {};

  /* 1 · Owner dashboard */
  S.home = () => {
    const ms = monthStats('2026-11');
    const pct = ms.expected ? Math.round((ms.got / ms.expected) * 100) : 0;
    const c = counts(), us = myUnits();
    const od = overdueRows();
    const cd = chargesDue();
    const exp = allLeases().filter((l) => l.status === 'expiring');
    const pendingRep = OX.reps.find((r) => r.status === 'pendingVerification');
    const unlisted = us.find((u) => u.status === 'vacant' && meta(u).listing?.state !== 'listed');
    const attn = [
      ...od.map((p) => M.cell({ icon: 'alertCircle', tone: 'bad', title: L(`Rent overdue · ${unitName(D.unit(p.unit))}`, `إيجار متأخر · ${unitName(D.unit(p.unit))}`), sub: `${D.pname(p.tenant)} · ${ymLabel(p.ym)}`, value: B.money(p.amount), go: `lease-${p.lease}` })),
      cd.length ? M.cell({ icon: 'building', tone: 'warn', title: L(`${cd.length} building charges due`, `${cd.length} رسوم مبانٍ مستحقة`), sub: L('Your share across 4 buildings', 'حصتك في 4 مبانٍ'), value: B.money(B.sum(cd, ownerChargeAmt)), go: 'income' }) : '',
      ...exp.map((l) => M.cell({ icon: 'contract', tone: OX.renewals[l.id] ? 'info' : 'warn', title: OX.renewals[l.id] ? L('Renewal offer sent', 'تم إرسال عرض التجديد') : L(`Lease ends in ${B.daysFromToday(l.end)} days`, `ينتهي العقد خلال ${B.daysFromToday(l.end)} يوماً`), sub: `${D.pname(l.tenant)} · ${unitName(D.unit(l.unit))}`, go: `lease-${l.id}` })),
      unlisted ? M.cell({ icon: 'door', tone: 'warn', title: L(`${unitName(unlisted)} is vacant and not listed`, `${unitName(unlisted)} شاغرة وغير معروضة`), sub: L(`Since ${B.dateShort(meta(unlisted).vacantSince)} · needs your authorisation`, `منذ ${B.dateShort(meta(unlisted).vacantSince)} · تحتاج تفويضك`), go: `unit-${unlisted.id}` }) : '',
      pendingRep ? M.cell({ icon: 'key', tone: 'violet', title: L('Representative pending verification', 'ممثل بانتظار التحقق'), sub: `${repName(pendingRep)} · ${tx(pendingRep.role)}`, go: 'reps' }) : '',
    ].filter(Boolean);
    const body = `
      <button class="mo-hero" data-go="income">
        <span class="h-top"><span class="mo-ring" style="--p:${pct}"><span>${pct}%</span></span>
          <span style="flex:1;min-width:0"><span class="h-l">${L('Rent collected · November', 'الإيجار المحصّل · تشرين الثاني')}</span><span class="h-v mo-num">${B.money(ms.got)}</span><span class="h-s">${L(`of ${B.money(ms.expected)} expected`, `من ${B.money(ms.expected)} متوقعة`)}${ms.overdue ? ` · <b>${L(`${B.money(ms.overdue)} overdue`, `${B.money(ms.overdue)} متأخرة`)}</b>` : ''}</span></span></span>
        <span class="mo-hstats"><span style="display:flex;flex-direction:column;gap:2px"><b>${c.all}</b><span>${L('Units', 'وحدات')}</span></span><span style="display:flex;flex-direction:column;gap:2px;border-inline-start:1px solid rgba(255,255,255,.1);padding-inline-start:14px"><b>${c.rented}/${c.all - c.own}</b><span>${L('Let', 'مؤجّرة')}</span></span><span style="display:flex;flex-direction:column;gap:2px;border-inline-start:1px solid rgba(255,255,255,.1);padding-inline-start:14px"><b>${moneyC(value())}</b><span>${L('Indicative value', 'قيمة تقديرية')}</span></span></span>
        <span class="mo-occ">${us.map((u) => `<i style="flex:1;background:${occColor[statusOf(u)] || '#7FA7C2'}"></i>`).join('')}</span>
        <span class="mo-legend"><span><i style="background:var(--mint)"></i>${L(`Rented ${c.rented}`, `مؤجّرة ${c.rented}`)}</span><span><i style="background:#F2B35A"></i>${L(`Vacant ${c.vacant}`, `شاغرة ${c.vacant}`)}</span><span><i style="background:#7FA7C2"></i>${L(`Own use ${c.own}`, `سكن خاص ${c.own}`)}</span></span>
      </button>
      ${attn.length ? M.section(L('Needs your attention', 'يحتاج انتباهك'), M.group(attn), { sub: L(`${attn.length} items`, `${attn.length} بنود`) }) : ''}
      ${M.quick([
        { label: L('Units', 'الوحدات'), icon: 'door', go: 'units', mint: true },
        { label: L('Ownership', 'الملكية'), icon: 'award', go: 'ownership' },
        { label: L('Documents', 'المستندات'), icon: 'folder', go: 'documents' },
        { label: L('Representatives', 'الممثلون'), icon: 'key', go: 'reps' },
      ])}
      ${M.section(L('Your properties', 'عقاراتك'), `<div class="mo-rail">${us.map(pcard).join('')}</div>`, { link: { label: L('See all', 'عرض الكل'), go: 'properties' } })}
      ${M.section(L('Recent activity', 'آخر النشاطات'), M.group([
        M.cell({ icon: 'banknote', tone: 'mint', title: L('Rent received · Shop G02', 'استلام إيجار · محل G02'), sub: `${D.pname('p_basel')} · ${B.dateShort('2026-11-03')}`, value: B.money(4800), go: 'lease-L-2024-0415' }),
        M.cell({ icon: 'banknote', tone: 'mint', title: L('Rent received · Apartment 803', 'استلام إيجار · شقة 803'), sub: `${D.pname('p_lina')} · ${B.dateShort('2026-11-01')}`, value: B.money(3200), go: `lease-${DEF_LEASE}` }),
        M.cell({ icon: 'megaphone', tone: 'info', title: L('Apartment 604 listed by Arkan', 'عرضت أركان الشقة 604'), sub: L(`With your authorisation · ${B.dateShort('2026-11-12')}`, `بتفويض منك · ${B.dateShort('2026-11-12')}`), go: 'unit-BN-RAM-00266-604' }),
        M.cell({ icon: 'upload', tone: 'violet', title: L('Power of attorney uploaded', 'رُفعت وكالة'), sub: `${D.pname('p_firas')} · ${B.dateShort('2026-11-20')}`, go: 'reps' }),
      ]))}
      <div class="mo-foot">${L('Prototype · fictional sample data · values are indicative, not valuations', 'نموذج أولي · بيانات نموذجية وهمية · القيم تقديرية وليست تثميناً')}</div>`;
    return {
      title: L('Portfolio', 'محفظتي'), large: true, kicker: `${greet()}${L(', ', '، ')}${D.pname(ME).split(' ')[0]}`, body,
      actions: [{ icon: 'bell', go: 'notifications', label: L('Notifications', 'الإشعارات'), dot: !st.seenNotifs }],
      largeEnd: `<button class="mo-ava" data-go="more" aria-label="${L('Account', 'الحساب')}">${ui.avatar(D.person(ME).name)}</button>`,
    };
  };

  /* 2 · My Properties (portfolio view) */
  S.properties = () => {
    const f = B.get('mo:propF', 'all');
    const us = myUnits();
    const list = us.filter((u) => f === 'all' || (f === 'vacant' ? u.status === 'vacant' : u.status === f));
    const kinds = {};
    us.forEach((u) => { kinds[u.kind] = (kinds[u.kind] || 0) + 1; });
    const kcol = { apartment: '#36D6A0', office: '#142B3B', shop: '#F2B35A', clinic: '#9B8AE0' };
    const rentRoll = B.sum(allLeases(), (l) => l.rent);
    const body = `
      ${M.card(`<div class="mo-chead"><div style="flex:1"><span class="mo-eyebrow">${L('Your share · indicative', 'حصتك · تقديرية')}</span><div class="mo-num" style="font-size:32px;margin-top:4px">${B.money(value())}</div><p>${L(`${us.length} units in ${myBuildings().length} buildings · rent roll ${B.money(rentRoll)}/mo`, `${us.length} وحدات في ${myBuildings().length} مبانٍ · إيجارات ${B.money(rentRoll)} شهرياً`)}</p></div></div>
        <div class="mo-occ" style="height:10px">${Object.entries(kinds).map(([k, n]) => `<i style="flex:${n};background:${kcol[k]}"></i>`).join('')}</div>
        <div class="mo-legend" style="color:var(--text-2)">${Object.entries(kinds).map(([k, n]) => `<span><i style="background:${kcol[k]}"></i>${tx(D.unitKinds[k])} ${n}</span>`).join('')}</div>`)}
      ${M.seg('mo:propF', [{ id: 'all', label: L('All', 'الكل') }, { id: 'rented', label: L('Rented', 'مؤجّرة') }, { id: 'vacant', label: L('Vacant', 'شاغرة') }, { id: 'ownerOccupied', label: L('Own use', 'سكن خاص') }], f)}
      ${list.map((u) => { const m = meta(u), l = leaseOf(u); return `<button class="mo-big" data-go="unit-${u.id}"><span class="p-art">${facade(u.building, u.status === 'vacant' ? 'dusk' : 'day')}<span class="tags">${ui.status(statusOf(u))}${shareBadge(u)}</span></span>
        <span class="p-b"><span class="p-t"><b>${unitName(u)}</b><span>${L(`Floor ${u.floor}`, `الطابق ${u.floor}`)}</span></span><span class="p-s">${esc(bName(u.building))} · ${esc(tx(D.district(bld(u.building).district).name))}</span>
          <span class="p-k"><span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span>${L('Your value', 'قيمة حصتك')}</span><b>${moneyC(((m.value || 0) * share(u)) / 100)}</b></span><span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span>${u.status === 'rented' ? L('Rent', 'الإيجار') : L('Status', 'الحالة')}</span><b>${u.status === 'rented' && l ? B.money(l.rent) : u.status === 'vacant' ? L(`${B.daysBetween(m.vacantSince || TODAY, TODAY)} days`, `${B.daysBetween(m.vacantSince || TODAY, TODAY)} يوماً`) : L('Own use', 'سكن خاص')}</b></span><span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span>${L('Owned since', 'تملك منذ')}</span><b>${(m.acquired || '').slice(0, 4)}</b></span></span></span></button>`; }).join('') || M.empty('home', L('No properties here', 'لا توجد عقارات هنا'))}
      ${M.group([
        M.cell({ icon: 'building', tone: 'mint', title: L('My buildings', 'مبانيّ'), value: `<span class="faint">${myBuildings().length}</span>`, go: 'buildings' }),
        M.cell({ icon: 'door', tone: 'mint', title: L('All units', 'كل الوحدات'), value: `<span class="faint">${us.length}</span>`, go: 'units' }),
        M.cell({ icon: 'award', tone: 'mint', title: L('Ownership relationships', 'علاقات الملكية'), go: 'ownership' }),
      ])}
      ${note(L('Values are indicative sample figures for the prototype — not a professional valuation.', 'القيم أرقام نموذجية تقديرية للنموذج الأولي — وليست تثميناً مهنياً.'))}`;
    return { title: L('Properties', 'العقارات'), large: true, body };
  };

  /* 3 · My Buildings */
  S.buildings = (_, __, back) => {
    const body = `${myBuildings().map((bid) => {
      const b = bld(bid), c = D.committeeOf(bid), mine = myUnits().filter((u) => u.building === bid);
      return `<button class="mo-big" data-go="building-${bid}"><span class="p-art" style="height:140px">${facade(bid, 'day')}<span class="tags">${b.verification === 'verified' ? ui.badge(L('Verified', 'موثّق'), 'mint', 'shieldCheck') : ui.status(b.verification)}</span></span>
        <span class="p-b"><span class="p-t"><b>${esc(tx(b.name))}</b><span>${D.typeLabel(b.type)}</span></span><span class="p-s">${esc(tx(b.address))}</span>
        <span class="p-k"><span style="display:flex;flex-direction:column;gap:2px"><span>${L('Your units', 'وحداتك')}</span><b>${mine.length}</b></span><span style="display:flex;flex-direction:column;gap:2px"><span>${L('Building', 'المبنى')}</span><b>${L(`${b.units} units`, `${b.units} وحدة`)}</b></span><span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span>${L('Governance', 'الإدارة')}</span><b>${c ? (c.kind === 'legal' ? L('Association', 'جمعية') : c.kind === 'informal' ? L('Committee', 'لجنة') : L('Manager', 'مدير')) : L('None', 'لا يوجد')}</b></span></span></span></button>`;
    }).join('')}${note(L('Buildings appear here because you own at least one unit in them.', 'تظهر المباني هنا لأنك تملك وحدة واحدة على الأقل فيها.'))}`;
    return { title: L('My Buildings', 'مبانيّ'), large: true, back: back || 'more', body };
  };
  S.building = (bidIn, __, back) => {
    const bid = bld(bidIn || '') ? bidIn : 'BN-RAM-00142';
    const b = bld(bid), c = D.committeeOf(bid), mgr = b.manager ? D.org(b.manager) : null;
    const mine = myUnits().filter((u) => u.building === bid);
    const ch = OX.charges.filter((x) => x.building === bid && x.status !== 'paid').slice(0, 4);
    const anns = D.announcementsOf(bid).slice(0, 2);
    const reqs = D.requestsOf(bid).filter((q) => !['completed', 'resolved', 'cancelled'].includes(q.status)).slice(0, 3);
    const body = `
      <div class="mo-bhero">${facade(bid, 'dusk')}<div class="bh-b"><div class="tags">${b.verification === 'verified' ? ui.badge(L('Verified municipal record', 'سجل بلدي موثّق'), 'mint', 'shieldCheck') : ui.status(b.verification)}${b.source === 'independent' ? ui.badge(L('Independently submitted', 'مُسجّل بشكل مستقل'), 'outline') : ''}</div><h2>${esc(tx(b.name))}</h2><span class="bh-a">${esc(tx(b.address))}</span></div></div>
      <div class="mo-stat3"><div><b>${b.floors}</b><span>${L('Floors', 'طوابق')}</span></div><div><b>${b.units}</b><span>${L('Units', 'وحدات')}</span></div><div><b>${b.year}</b><span>${L('Built', 'البناء')}</span></div></div>
      ${M.section(L('Your units here', 'وحداتك هنا'), M.group(mine.map((u) => M.cell({ icon: kindIcon(u), tone: 'mint', title: unitName(u), sub: unitLine(u), badge: ui.status(statusOf(u)), go: `unit-${u.id}` }))))}
      ${M.section(L('Governance', 'الإدارة'), M.group([
        c ? M.cell({ icon: 'gavel', tone: 'navy', title: tx(c.name), sub: tx(c.basis), act: 'moCommittee', arg: bid }) : M.cell({ icon: 'gavel', title: L('No association recorded', 'لا توجد جمعية مسجّلة'), sub: L('Owners can start one — BENA never assigns legal status automatically', 'يمكن للمالكين تأسيس واحدة — ولا تمنح بينا صفة قانونية تلقائياً') }),
        mgr ? M.cell({ icon: 'briefcase', tone: 'info', title: tx(mgr.name), sub: L(`Property manager · since ${mgr.since.slice(0, 4)}`, `مدير العقار · منذ ${mgr.since.slice(0, 4)}`), act: 'moCall', arg: tx(mgr.name) }) : '',
      ].filter(Boolean)))}
      ${c ? `<div class="row-sm wrap" style="padding:0 4px;margin-top:-12px">${ui.status(c.kind)}${c.regNo ? ui.badge(c.regNo, 'outline') : ''}</div>` : ''}
      ${ch.length ? M.section(L('Charges for your units', 'رسوم وحداتك'), M.group(ch.map((x) => M.cell({ icon: x.levy ? 'vote' : 'receipt', tone: x.status === 'overdue' ? 'bad' : x.levy ? 'violet' : 'warn', title: x.levy ? tx(x.label) : L(`Service charge · ${ymLabel(x.period)}`, `رسوم خدمات · ${ymLabel(x.period)}`), sub: unitName(D.unit(x.unit)), value: B.money(ownerChargeAmt(x)), badge: ui.status(x.status), act: x.status === 'due' || x.status === 'overdue' ? 'moPayCharge' : '', arg: x.id })))) : ''}
      ${reqs.length ? M.section(L('Open maintenance', 'صيانة مفتوحة'), M.group(reqs.map((q) => M.cell({ icon: D.cat(q.cat).icon, tone: 'info', title: tx(q.title), sub: `${q.id} · ${q.scope === 'common' ? L('Common area', 'منطقة مشتركة') : L('Unit', 'وحدة')}`, badge: ui.status(q.status), act: 'moReq', arg: q.id })))) : ''}
      ${anns.length ? M.section(L('Announcements', 'الإعلانات'), M.group(anns.map((a) => M.cell({ icon: a.tag === 'meeting' ? 'calendar' : 'megaphone', tone: a.pinned ? 'warn' : 'mint', title: tx(a.title), sub: B.date(a.date), act: 'moAnn', arg: a.id })))) : ''}
      ${M.section(L('Identity', 'الهوية'), M.group([
        M.cell({ icon: 'fingerprint', tone: 'navy', title: L('BENA Building ID', 'رقم المبنى في بينا'), sub: id(b.id), badge: ui.prov(b.source === 'gis' ? 'official' : 'submitted') }),
        b.gis ? M.cell({ icon: 'landmark', title: L('Municipal GIS reference', 'مرجع نظم المعلومات البلدية'), sub: `${id(b.gis)} · ${L('sample', 'نموذج')}` }) : '',
        M.cell({ icon: 'map', title: L('Land parcel', 'قطعة الأرض'), sub: L(`Basin ${b.parcel.basin} · Parcel ${b.parcel.parcel}`, `حوض ${b.parcel.basin} · قطعة ${b.parcel.parcel}`) }),
      ].filter(Boolean)))}
      ${legalNote()}`;
    return { title: tx(b.name), back: back || 'buildings', body };
  };

  /* 4 · My Units */
  S.units = (_, __, back) => {
    const q = B.get('mo:unitQ', '');
    const us = myUnits().filter((u) => B.match(q, unitName(u), bld(u.building).name, u.id, leaseOf(u) ? D.person(leaseOf(u).tenant).name : ''));
    const body = `${M.search('mo:unitQ', L('Search unit, building or tenant', 'ابحث عن وحدة أو مبنى أو مستأجر'))}
      ${us.length ? myBuildings().map((bid) => { const r = us.filter((u) => u.building === bid); return r.length ? M.group(r.map((u) => M.cell({ icon: kindIcon(u), tone: u.status === 'rented' ? 'mint' : u.status === 'vacant' ? 'warn' : 'info', title: `${unitName(u)}${share(u) < 100 ? ` · ${share(u)}%` : ''}`, sub: unitLine(u), badge: ui.status(statusOf(u)), go: `unit-${u.id}` })), bName(bid)) : ''; }).join('') : M.empty('search', L('No units match', 'لا توجد وحدات مطابقة'))}`;
    return { title: L('My Units', 'وحداتي'), large: true, back: back || 'properties', body };
  };
  S.unit = (uidIn, __, back) => {
    const u = D.unit(uidIn || '') && OX.unitIds.includes(uidIn) ? D.unit(uidIn) : D.unit(DEF_UNIT);
    const m = meta(u), l = leaseOf(u), b = bld(u.building);
    const h = (OX.history[u.id] || [])[0];
    const ch = OX.charges.filter((x) => x.unit === u.id).slice(0, 3);
    const reps = repsFor(u.id);
    const docs = OX.docs.filter((d) => d.unit === u.id).slice(0, 3);
    const ls = m.listing;
    let listing = '';
    if (u.status === 'vacant') {
      listing = ls?.state === 'listed'
        ? M.card(`<div class="mo-chead"><span class="mo-ci">${icon('megaphone')}</span><div style="flex:1"><h3>${L('Listed for rent', 'معروضة للإيجار')}</h3><p>${L(`${B.money(ls.ask)}/mo · by ${ls.by === ME ? 'you' : tx(D.org(ls.by).name)} · since ${B.dateShort(ls.since)}`, `${B.money(ls.ask)} شهرياً · عبر ${ls.by === ME ? 'أنت' : tx(D.org(ls.by).name)} · منذ ${B.dateShort(ls.since)}`)}</p></div>${ui.status('listed')}</div>
          <div class="mo-stat3"><div><b>${ls.views}</b><span>${L('Views', 'مشاهدات')}</span></div><div><b>${ls.inquiries}</b><span>${L('Inquiries', 'استفسارات')}</span></div><div><b>${ls.viewings}</b><span>${L('Viewings', 'معاينات')}</span></div></div>
          <div class="mo-actions">${M.btn(L('Edit', 'تعديل'), { icon: 'edit', act: 'moList', arg: u.id })}${M.btn(L('Withdraw', 'سحب العرض'), { kind: 'danger', act: 'moUnlist', arg: u.id })}</div>`)
        : M.card(`<div class="mo-chead"><span class="mo-ci" style="background:var(--warn-bg);color:var(--warn)">${icon('eye')}</span><div style="flex:1"><h3>${L('Not listed', 'غير معروضة')}</h3><p>${L(`Vacant since ${B.date(m.vacantSince)}. BENA never lists a vacant unit without your authorisation.`, `شاغرة منذ ${B.date(m.vacantSince)}. لا تعرض بينا أي وحدة شاغرة دون تفويضك.`)}</p></div></div>
          ${m.suggested ? `<div class="mo-kv"><div><span>${L('Suggested rent', 'الإيجار المقترح')}</span><b>${B.money(m.suggested)}</b></div><div><span>${L('Based on', 'بناءً على')}</span><b>${L('Similar units nearby', 'وحدات مشابهة قريبة')}</b></div></div>` : ''}
          ${M.btn(L('Authorise listing', 'تفويض العرض'), { kind: 'primary', block: true, icon: 'checkCircle', act: 'moList', arg: u.id })}`);
    }
    const body = `
      <div class="mo-plan"><div class="p-art">${u.kind === 'apartment' ? B.art.floorplan(seedOf(u.id)) : B.art.interior(seedOf(u.id))}</div>
        <div class="mo-specs"><div><b>${u.area}</b><span>${L('m²', 'م²')}</span></div><div><b>${u.floor || L('G', 'أرضي')}</b><span>${L('Floor', 'الطابق')}</span></div><div><b>${u.beds || '—'}</b><span>${L('Bedrooms', 'غرف')}</span></div><div><b>${m.parking ? esc(m.parking.split(',')[0]) : '—'}</b><span>${L('Parking', 'الموقف')}</span></div></div></div>
      <div class="row-sm wrap" style="padding:0 2px">${ui.status(statusOf(u))}${shareBadge(u)}<span class="faint" style="font-size:13px">${esc(bName(u.building))}</span></div>
      ${listing}
      ${l ? M.section(L('Current lease', 'العقد الحالي'), leaseCard(l)) : u.status === 'ownerOccupied' ? M.card(`<div class="mo-chead"><span class="mo-ci navy">${icon('home')}</span><div><h3>${L('Your family home', 'منزل عائلتك')}</h3><p>${L('Owner-occupied · not available for rent', 'يسكنها المالك · غير متاحة للإيجار')}</p></div></div>`) : ''}
      ${M.section(L('Ownership', 'الملكية'), M.group([
        M.cell({ icon: 'award', tone: 'navy', title: h ? h.owners.map((o) => `${esc(ownerLine(o))}${o.share ? ` ${o.share}%` : ''}`).join(' · ') : D.pname(ME), sub: h ? `${tx(h.basis)} · ${B.dateShort(h.from)}` : '', go: `ownership-${u.id}` }),
        M.cell({ icon: 'doc', title: L('Deed reference', 'مرجع السند'), sub: id(m.deed || '—'), badge: ui.prov('submitted') }),
        M.cell({ icon: 'fingerprint', title: L('BENA unit reference', 'مرجع الوحدة في بينا'), sub: id(u.id) }),
      ]))}
      ${ch.length ? M.section(L('Building charges', 'رسوم المبنى'), M.group(ch.map((x) => M.cell({ icon: x.levy ? 'vote' : 'receipt', tone: x.status === 'overdue' ? 'bad' : x.status === 'paid' ? 'mint' : 'warn', title: x.levy ? tx(x.label) : ymLabel(x.period), sub: x.status === 'tenantPays' ? L('Paid by the tenant under the lease', 'يدفعها المستأجر وفق العقد') : x.paidOn ? L(`Paid ${B.dateShort(x.paidOn)}`, `دُفعت ${B.dateShort(x.paidOn)}`) : L(`Your share ${x.share}%`, `حصتك ${x.share}%`), value: B.money(ownerChargeAmt(x)), badge: ui.status(x.status), act: x.status === 'due' || x.status === 'overdue' ? 'moPayCharge' : '', arg: x.id })))) : ''}
      ${reps.length ? M.section(L('Representatives for this unit', 'ممثلون لهذه الوحدة'), M.group(reps.map((r) => M.cell({ avatar: r.org ? D.org(r.org).name : D.person(r.p).name, title: repName(r), sub: tx(r.role), badge: ui.status(r.status), act: 'moRep', arg: r.id })))) : ''}
      ${docs.length ? M.section(L('Documents', 'المستندات'), M.group(docs.map((d, i) => M.cell({ icon: d.icon || 'doc', tone: 'info', title: tx(d.name), sub: `${B.date(d.date)} · <bdi>${d.size}</bdi>`, act: 'moDoc', arg: OX.docs.indexOf(d) }))), { link: { label: L('All', 'الكل'), go: 'documents' } }) : ''}`;
    return { title: unitName(u), back: back || 'units', body, actions: [{ icon: 'share', act: 'mxSoon', arg: L('Share unit', 'مشاركة الوحدة'), label: L('Share', 'مشاركة') }] };
  };

  /* 5 · Ownership relationships */
  S.ownership = (uidIn, __, back) => {
    if (uidIn && OX.unitIds.includes(uidIn)) B.vs['mo:own'] = uidIn;
    const uid = B.get('mo:own', DEF_UNIT);
    const u = D.unit(uid), m = meta(u);
    const hist = OX.history[uid] || [];
    const cur = hist[0];
    const prev = hist.slice(1);
    const cols = ['var(--mint)', '#7FA7C2', '#F2B35A', '#9B8AE0'];
    const reps = repsFor(uid);
    B.afterRender(() => { const c = document.querySelector('.mx-chips .mx-chip.on'); if (c) { const r = c.parentElement; r.scrollLeft += c.getBoundingClientRect().left - r.getBoundingClientRect().left - (r.clientWidth - c.offsetWidth) / 2; } });
    const body = `
      ${M.chips('mo:own', myUnits().map((x) => ({ id: x.id, label: `${unitName(x)}` })), uid)}
      <div class="faint" style="font-size:13.5px;padding:0 4px;margin-top:-10px">${esc(bName(u.building))} · ${id(u.id)}</div>
      ${cur ? M.section(L('Current owners', 'المالكون الحاليون'), M.card(`
        <div class="mo-shares">${cur.owners.map((o, i) => `<i style="flex:${o.share || 100};background:${cols[i % cols.length]}"></i>`).join('')}</div>
        ${M.group(cur.owners.map((o, i) => M.cell({ avatar: o.p ? D.person(o.p).name : o.org, title: `<span class="mo-sw" style="background:${cols[i % cols.length]}"></span>${esc(ownerLine(o))}`, sub: o.p === ME ? L('You', 'أنت') : o.p ? L('Co-owner', 'مالك مشارك') : L('Company', 'شركة'), value: `${o.share || 100}%` })))}
        <div class="mo-kv"><div><span>${L('Since', 'منذ')}</span><b>${B.date(cur.from)}</b></div><div><span>${L('Basis', 'الأساس')}</span><b>${esc(tx(cur.basis))}</b></div><div><span>${L('Deed reference', 'مرجع السند')}</span><b>${id(cur.doc)}</b></div><div><span>${L('Record', 'السجل')}</span><b>${ui.prov('submitted')}</b></div></div>`)) : ''}
      ${prev.length ? M.section(L('Previous owners', 'المالكون السابقون'), `<div class="mo-tl">${prev.map((h) => `<div class="t"><span class="t-i"></span><div class="t-b"><span class="t-d">${B.date(h.from)} – ${h.to ? B.date(h.to) : ''}</span><b>${h.owners.map((o) => esc(ownerLine(o))).join(' · ')}</b><span class="t-x">${esc(tx(h.basis))}</span><span class="t-r">${id(h.doc)}</span></div></div>`).join('')}</div>`, { sub: L(`${prev.length} earlier records`, `${prev.length} سجلات سابقة`) }) : ''}
      ${reps.length ? M.section(L('Authorised to act on this unit', 'مفوّضون بالتصرف في هذه الوحدة'), M.group(reps.map((r) => M.cell({ avatar: r.org ? D.org(r.org).name : D.person(r.p).name, title: repName(r), sub: r.scope.map((s) => tx(OX.scopes[s])).join(' · '), badge: ui.status(r.status), act: 'moRep', arg: r.id })))) : ''}
      ${OX.proxies.length ? M.section(L('You act for', 'أنت تمثّل'), M.group(OX.proxies.map((p) => M.cell({ avatar: D.person(p.p).name, title: D.pname(p.p), sub: tx(p.scope), valueSub: L(`until ${B.dateShort(p.to)}`, `حتى ${B.dateShort(p.to)}`) })))) : ''}
      ${legalNote()}
      <div class="mo-actions">${M.btn(L('Report a correction', 'الإبلاغ عن تصحيح'), { icon: 'edit', act: 'moCorrect', arg: uid })}${M.btn(L('Registry extract', 'إخراج القيد'), { kind: 'dark', icon: 'download', act: 'mxSoon', arg: L('Registry extract', 'إخراج القيد') })}</div>`;
    return { title: L('Ownership', 'الملكية'), large: true, back: back || 'more', body };
  };

  /* 6 · Tenancy overview */
  S.tenancy = () => {
    const ls = allLeases().slice().sort((a, b) => (a.end < b.end ? -1 : 1));
    const c = counts();
    const vac = myUnits().filter((u) => u.status === 'vacant');
    const exp = ls.filter((l) => l.status === 'expiring').length;
    const body = `
      ${M.kpis([
        { label: L('Occupancy', 'الإشغال'), value: `${Math.round((c.rented / (c.all - c.own)) * 100)}%`, sub: L(`${c.rented} of ${c.all - c.own} lettable units`, `${c.rented} من ${c.all - c.own} وحدات قابلة للتأجير`), icon: 'users' },
        { label: L('Rent roll', 'الإيجارات'), value: B.money(B.sum(ls, (l) => l.rent)), sub: L('per month', 'شهرياً'), icon: 'banknote' },
        { label: L('Expiring', 'تنتهي قريباً'), value: exp, sub: L('within 75 days', 'خلال 75 يوماً'), icon: 'contract', alert: exp > 0, go: exp ? `lease-${ls.find((l) => l.status === 'expiring').id}` : null },
        { label: L('Vacant', 'شاغرة'), value: vac.length, sub: L(`${vac.filter((u) => meta(u).listing?.state === 'listed').length} listed`, `${vac.filter((u) => meta(u).listing?.state === 'listed').length} معروضة`), icon: 'door' },
      ])}
      ${M.section(L('Active leases', 'العقود السارية'), `<div style="display:flex;flex-direction:column;gap:10px">${ls.map(leaseCard).join('')}</div>`)}
      ${vac.length ? M.section(L('Vacant units', 'الوحدات الشاغرة'), M.group(vac.map((u) => M.cell({ icon: 'door', tone: 'warn', title: unitName(u), sub: `${bName(u.building)} · ${unitLine(u)}`, badge: ui.status(statusOf(u)), go: `unit-${u.id}` })))) : ''}
      ${OX.pastLeases.length ? M.section(L('Past leases', 'العقود السابقة'), M.group(OX.pastLeases.map((l) => M.cell({ avatar: D.person(l.tenant).name, title: D.pname(l.tenant), sub: `${unitName(D.unit(l.unit))} · ${B.dateShort(l.start)} – ${B.date(l.end)}`, badge: ui.status('expired'), go: `lease-${l.id}` })))) : ''}
      ${note(L('Leases are recorded in BENA by you or your manager. The signed contract remains the legal reference.', 'تُسجَّل العقود في بينا من قبلك أو من قبل مديرك. ويبقى العقد الموقّع هو المرجع القانوني.'))}`;
    return { title: L('Tenancy', 'الإيجارات'), large: true, body };
  };

  /* 7 · Lease details */
  S.lease = (lidIn, __, back) => {
    const l = leaseById(lidIn || '') || leaseById(DEF_LEASE);
    const u = D.unit(l.unit), x = OX.leaseX[l.id] || {};
    const total = B.daysBetween(l.start, l.end), gone = Math.max(0, Math.min(total, B.daysBetween(l.start, TODAY))), left = B.daysFromToday(l.end);
    const sch = schedule(l);
    const shown = l.past ? sch.slice(-4).reverse() : sch.filter((p) => p.due <= '2026-12-31').slice(-5).reverse();
    const rn = OX.renewals[l.id];
    const mgr = l.manager ? D.org(l.manager) : null;
    const body = `
      ${M.card(`<div class="mo-chead">${ui.avatar(D.person(l.tenant).name)}<div style="flex:1;min-width:0"><h3>${esc(D.pname(l.tenant))}</h3><p>${L('Tenant', 'المستأجر')} · <bdi>${esc(D.person(l.tenant).phone || '')}</bdi></p></div>${ui.status(leaseStatus(l))}</div>
        <button class="mx-cell" data-go="unit-${u.id}" style="padding:12px 0;min-height:0;border-top:1px solid var(--line-2)"><span class="mc-i">${icon(kindIcon(u))}</span><span class="mc-b"><span class="mc-t" style="display:block">${unitName(u)}</span><span class="mc-s" style="display:block">${esc(bName(u.building))}</span></span>${icon('chevR', 'mc-c flip')}</button>
        <div class="mo-term"><div class="t-row"><span>${B.date(l.start)}</span><span>${B.date(l.end)}</span></div>${ui.progress(Math.round((gone / total) * 100), l.status === 'expiring' && !rn ? 'warn' : l.past ? 'navy' : '')}<div class="t-row" style="justify-content:center">${left > 0 ? L(`${left} days left · ${Math.round((gone / total) * 100)}% of term`, `متبقٍ ${left} يوماً · ${Math.round((gone / total) * 100)}% من المدة`) : L('Ended', 'انتهى')}</div></div>`)}
      ${!l.past && l.status === 'expiring' ? (rn ? `<div class="callout mint">${icon('send')}<div>${L(`<b>Renewal offer sent ${B.dateShort(rn.sent)}.</b> ${B.money(rn.rent)}/mo for ${rn.term} months — waiting for ${D.pname(l.tenant)}.`, `<b>أُرسل عرض التجديد ${B.dateShort(rn.sent)}.</b> ${B.money(rn.rent)} شهرياً لمدة ${rn.term} شهراً — بانتظار رد ${D.pname(l.tenant)}.`)}</div></div>` : M.btn(L('Send renewal offer', 'إرسال عرض تجديد'), { kind: 'primary', block: true, icon: 'refresh', act: 'moRenew', arg: l.id })) : ''}
      ${M.section(L('Key terms', 'الشروط الأساسية'), M.card(`<div class="mo-kv">
        <div><span>${L('Monthly rent', 'الإيجار الشهري')}</span><b>${B.money(l.rent)}</b></div><div><span>${L('Deposit', 'التأمين')}</span><b>${B.money(l.deposit)}</b></div>
        <div><span>${L('Payment day', 'يوم الدفع')}</span><b>${L(`Day ${OX.payDay[l.id] || l.payDay || 1}`, `اليوم ${OX.payDay[l.id] || l.payDay || 1}`)}</b></div><div><span>${L('Notice period', 'مدة الإشعار')}</span><b>${L(`${x.notice || 60} days`, `${x.notice || 60} يوماً`)}</b></div>
        <div><span>${L('Service charge', 'رسوم الخدمات')}</span><b>${x.charges === 'tenant' ? L('Paid by tenant', 'يدفعها المستأجر') : L('Paid by you', 'تدفعها أنت')}</b></div><div><span>${L('Escalation', 'الزيادة')}</span><b>${esc(tx(x.escalation) || '—')}</b></div>
        <div><span>${L('Use', 'الاستخدام')}</span><b>${esc(tx(x.use) || '—')}</b></div><div><span>${L('Managed by', 'الإدارة')}</span><b>${mgr ? esc(tx(mgr.name)) : L('You', 'أنت')}</b></div></div>
        <div class="row-sm wrap">${id(l.id)}${ui.prov('submitted')}</div>`))}
      ${M.section(L('Rent payments', 'دفعات الإيجار'), M.group(shown.map(payCell)), { sub: OX.payMethod[l.id] ? tx(OX.payMethod[l.id]) : '' })}
      ${x.history ? M.section(L('History', 'السجل'), `<div class="mo-tl">${x.history.map((h, i) => `<div class="t ${i === 0 ? 'on' : ''}"><span class="t-i">${i === 0 ? icon('check') : ''}</span><div class="t-b"><span class="t-d">${B.date(h.date)}</span><b>${esc(tx(h.title))}</b><span class="t-x">${esc(tx(h.body))}</span></div></div>`).join('')}</div>`) : ''}
      <div class="mo-actions">${M.btn(L('Contract', 'العقد'), { icon: 'doc', act: 'moLeaseDoc', arg: l.id })}${M.btn(L('Message', 'مراسلة'), { kind: 'dark', icon: 'chat', act: 'moMsg', arg: l.tenant })}</div>`;
    return { title: L('Lease', 'عقد الإيجار'), back: back || 'tenancy', tab: 'tenancy', body };
  };

  /* 8 · Income & receivables */
  S.income = () => {
    const ym = B.get('mo:ym', '2026-11');
    const ms = monthStats(ym);
    const months = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
    const od = overdueRows();
    const cd = chargesDue();
    const ytd = B.sum(allPayments().filter((p) => p.ym.startsWith('2026') && (p.status === 'paid' || p.status === 'late')), (p) => p.amount);
    const chPaid = B.sum(OX.charges.filter((c) => c.status === 'paid' && c.period.startsWith('2026')), ownerChargeAmt);
    const pct = ms.expected ? Math.round((ms.got / ms.expected) * 100) : 0;
    const body = `
      ${M.seg('mo:ym', [{ id: '2026-09', label: ymLabel('2026-09', true) }, { id: '2026-10', label: ymLabel('2026-10', true) }, { id: '2026-11', label: ymLabel('2026-11', true) }, { id: '2026-12', label: ymLabel('2026-12', true) }], ym)}
      ${M.card(`<div class="mo-chead"><div style="flex:1"><span class="mo-eyebrow">${ym > '2026-11' ? L('Expected', 'المتوقع') : L('Collected', 'المحصّل')} · ${ymLabel(ym)}</span><div class="mo-num" style="font-size:34px;margin-top:4px">${B.money(ym > '2026-11' ? ms.expected : ms.got)}</div><p>${ym > '2026-11' ? L(`${ms.rows.length} payments scheduled`, `${ms.rows.length} دفعات مجدولة`) : L(`of ${B.money(ms.expected)} expected · ${pct}%`, `من ${B.money(ms.expected)} متوقعة · ${pct}%`)}</p></div>${ms.overdue ? ui.badge(L(`${B.money(ms.overdue)} overdue`, `${B.money(ms.overdue)} متأخرة`), 'bad', 'alertCircle') : ''}</div>
        ${ym > '2026-11' ? '' : ui.progress(pct, ms.overdue ? 'warn' : '')}
        ${M.group(ms.rows.map((p) => M.cell({ avatar: D.person(p.tenant).name, title: unitName(D.unit(p.unit)), sub: `${D.pname(p.tenant)} · ${p.paidOn ? L(`received ${B.dateShort(p.paidOn)}`, `استُلم ${B.dateShort(p.paidOn)}`) : L(`due ${B.dateShort(p.due)}`, `يستحق ${B.dateShort(p.due)}`)}`, value: B.money(p.amount), badge: ui.status(p.status), go: `lease-${p.lease}` })))}`)}
      ${od.length ? M.section(L('Receivables', 'المستحقات'), M.group(od.map((p) => M.cell({ icon: 'alertCircle', tone: 'bad', title: `${unitName(D.unit(p.unit))} · ${ymLabel(p.ym)}`, sub: L(`${D.pname(p.tenant)} · ${-B.daysFromToday(p.due)} days late`, `${D.pname(p.tenant)} · متأخر ${-B.daysFromToday(p.due)} يوماً`), value: B.money(p.amount), valueSub: L('Record', 'تسجيل'), act: 'moReceive', arg: p.id }))), { sub: L('Overdue rent', 'إيجارات متأخرة') }) : ''}
      ${M.section(L('Building charges you owe', 'رسوم مبانٍ مستحقة عليك'), cd.length ? M.group(cd.map((c) => M.cell({ icon: 'receipt', tone: c.status === 'overdue' ? 'bad' : 'warn', title: unitName(D.unit(c.unit)), sub: `${ymLabel(c.period)} · ${bName(c.building)}${c.share < 100 ? L(` · your ${c.share}%`, ` · حصتك ${c.share}%`) : ''}`, value: B.money(ownerChargeAmt(c)), badge: ui.status(c.status), act: 'moPayCharge', arg: c.id }))) : M.empty('checkCircle', L('All building charges paid', 'تم دفع كل رسوم المباني')), { sub: cd.length ? L(`Total ${B.money(B.sum(cd, ownerChargeAmt))}`, `المجموع ${B.money(B.sum(cd, ownerChargeAmt))}`) : '' })}
      ${M.section(L('Last 6 months', 'آخر 6 أشهر'), M.card(`<div class="mo-bars">${B.charts.bars({ labels: months.map((x) => ymLabel(x, true)), series: [{ name: L('Collected', 'المحصّل'), color: '#36D6A0', values: months.map((x) => monthStats(x).got) }, { name: L('Outstanding', 'غير محصّل'), color: '#F2B35A', values: months.map((x) => monthStats(x).overdue) }], height: 150, format: moneyC })}</div>`))}
      ${M.kpis([
        { label: L('Rent received 2026', 'الإيجار المستلم 2026'), value: moneyC(ytd), sub: L('all leases', 'كل العقود'), icon: 'banknote' },
        { label: L('Charges paid 2026', 'الرسوم المدفوعة 2026'), value: moneyC(chPaid), sub: L('your share', 'حصتك'), icon: 'receipt' },
      ])}
      ${note(L('Indicative figures from sample data — not accounting or tax advice. Payments are simulated.', 'أرقام تقديرية من بيانات نموذجية — وليست استشارة محاسبية أو ضريبية. المدفوعات محاكاة.'), 'lock')}`;
    return { title: L('Income', 'الدخل'), large: true, body };
  };

  /* 9 · Documents */
  S.documents = (_, __, back) => {
    const f = B.get('mo:docF', 'all');
    const q = B.get('mo:docQ', '');
    const docs = OX.docs.map((d, i) => ({ ...d, i })).filter((d) => (f === 'all' || d.cat === f) && B.match(q, d.name));
    const cats = OX.docCats.filter((c) => f === 'all' || c.id === f);
    const body = `${M.search('mo:docQ', L('Search documents', 'ابحث في المستندات'))}
      ${M.chips('mo:docF', [{ id: 'all', label: L('All', 'الكل') }, ...OX.docCats.map((c) => ({ id: c.id, label: c.label, icon: c.icon }))], f)}
      ${docs.length ? cats.map((c) => { const r = docs.filter((d) => d.cat === c.id); return r.length ? M.group(r.map((d) => M.cell({ icon: d.icon || c.icon, tone: d.pending ? 'warn' : c.id === 'deeds' ? 'navy' : c.id === 'receipts' ? 'mint' : 'info', title: tx(d.name), sub: `${B.date(d.date)} · <bdi>${d.size}</bdi>`, badge: d.pending ? ui.prov('pending') : '', act: 'moDoc', arg: d.i })), c.label) : ''; }).join('') : M.empty('search', L('No matching documents', 'لا توجد مستندات مطابقة'))}
      ${note(L('Copies stored for coordination. Originals held by the land registry, courts or the parties remain the legal reference.', 'نسخ محفوظة للتنسيق. وتبقى الأصول لدى دائرة الأراضي أو المحاكم أو الأطراف هي المرجع القانوني.'), 'lock')}`;
    return { title: L('Documents', 'المستندات'), large: true, back: back || 'more', body, actions: [{ icon: 'upload', act: 'moUpload', label: L('Upload', 'رفع') }] };
  };

  /* 10 · Authorised representatives */
  const repCard = (r) => `<button class="mo-rep ${r.status === 'expired' || r.status === 'revoked' ? 'dim' : ''}" data-act="moRep" data-arg="${r.id}">
    <span class="r-h">${ui.avatar(r.org ? D.org(r.org).name : D.person(r.p).name)}<span style="flex:1;min-width:0"><b>${esc(repName(r))}</b><small>${esc(tx(r.role))}</small></span>${ui.status(r.status)}</span>
    <span class="mo-scopes">${r.scope.map((s) => `<span class="mo-scope">${esc(tx(OX.scopes[s] || s))}</span>`).join('')}</span>
    <span class="r-f"><span>${L(`${r.units.length} unit${r.units.length > 1 ? 's' : ''}`, `${r.units.length} وحدات`)} · ${r.to ? L(`until ${B.date(r.to)}`, `حتى ${B.date(r.to)}`) : L('No end date', 'دون تاريخ انتهاء')}</span>${id(r.doc)}</span></button>`;
  S.reps = (_, __, back) => {
    const act = OX.reps.filter((r) => r.status === 'active'), pend = OX.reps.filter((r) => r.status === 'pendingVerification'), ended = OX.reps.filter((r) => r.status === 'expired' || r.status === 'revoked');
    const col = (arr) => `<div style="display:flex;flex-direction:column;gap:10px">${arr.map(repCard).join('')}</div>`;
    const body = `
      ${pend.length ? M.section(L('Pending verification', 'بانتظار التحقق'), col(pend), { sub: L('Their authority starts once the document is checked', 'تبدأ صلاحيتهم بعد التحقق من الوثيقة') }) : ''}
      ${act.length ? M.section(L('Active', 'سارية'), col(act)) : ''}
      ${OX.proxies.length ? M.section(L('People you act for', 'أشخاص تمثّلهم'), M.group(OX.proxies.map((p) => M.cell({ avatar: D.person(p.p).name, title: D.pname(p.p), sub: tx(p.scope), valueSub: L(`until ${B.dateShort(p.to)}`, `حتى ${B.dateShort(p.to)}`) })))) : ''}
      ${ended.length ? M.section(L('Ended', 'منتهية'), col(ended)) : ''}
      ${M.btn(L('Add a representative', 'إضافة ممثل'), { kind: 'dark', block: true, icon: 'userPlus', act: 'moAddRep' })}
      ${note(L('Representatives act only within the scope you grant. BENA records authorisations for coordination; their legal effect comes from the signed power of attorney.', 'يتصرف الممثلون ضمن الصلاحيات التي تمنحها فقط. تسجّل بينا التفويضات للتنسيق؛ ويستمد أثرها القانوني من الوكالة الموقّعة.'), 'gavel')}`;
    return { title: L('Representatives', 'الممثلون المفوّضون'), large: true, back: back || 'more', body, actions: [{ icon: 'plus', act: 'moAddRep', label: L('Add', 'إضافة') }] };
  };

  /* More (hub for the remaining screens) */
  S.more = () => {
    const p = D.person(ME);
    const body = `
      <div class="mo-me">${ui.avatar(p.name)}<div style="flex:1;min-width:0"><b>${esc(tx(p.name))}</b><small>${L(`Owner · ${myUnits().length} units · ${myBuildings().length} buildings`, `مالك · ${myUnits().length} وحدات · ${myBuildings().length} مبانٍ`)}</small><small><bdi>${esc(p.phone)}</bdi></small></div></div>
      ${M.group([
        M.cell({ icon: 'building', tone: 'mint', title: L('My buildings', 'مبانيّ'), go: 'buildings' }),
        M.cell({ icon: 'door', tone: 'mint', title: L('My units', 'وحداتي'), go: 'units' }),
        M.cell({ icon: 'award', tone: 'mint', title: L('Ownership relationships', 'علاقات الملكية'), sub: L('Owners, co-owners, shares and deeds', 'المالكون والشركاء والحصص والسندات'), go: 'ownership' }),
        M.cell({ icon: 'folder', tone: 'mint', title: L('Documents', 'المستندات'), value: `<span class="faint">${OX.docs.length}</span>`, go: 'documents' }),
        M.cell({ icon: 'key', tone: 'mint', title: L('Authorised representatives', 'الممثلون المفوّضون'), value: OX.reps.some((r) => r.status === 'pendingVerification') ? `<span class="badge warn">${OX.reps.filter((r) => r.status === 'pendingVerification').length}</span>` : '', go: 'reps' }),
      ], L('Portfolio', 'المحفظة'))}
      ${M.group([
        M.cell({ icon: 'bell', title: L('Notifications', 'الإشعارات'), go: 'notifications' }),
        M.cell({ icon: 'globe', title: L('Language', 'اللغة'), value: B.isAr() ? 'العربية' : 'English', valueSub: B.isAr() ? 'English' : 'العربية', act: 'lang' }),
        M.cell({ icon: 'card', title: L('Payout account', 'حساب الاستلام'), sub: L('Bank of Palestine •••• 7720', 'بنك فلسطين •••• 7720'), act: 'mxSoon', arg: L('Payout account', 'حساب الاستلام') }),
      ], L('Account', 'الحساب'))}
      ${M.group([
        M.cell({ icon: 'swap', tone: 'navy', title: L('Switch profile', 'تبديل الملف'), sub: L('Try the app as a resident, committee or technician', 'جرّب التطبيق كساكن أو لجنة أو فني'), act: 'mxRoles' }),
        M.cell({ icon: 'grid', tone: 'navy', title: L('Demo hub', 'مركز العرض'), go: 'hub' }),
        M.cell({ icon: 'globe', tone: 'navy', title: L('Owner web portal', 'بوابة المالك على الويب'), go: 'owner-home' }),
      ], L('Prototype', 'النموذج الأولي'))}
      ${M.btn(L('Sign out', 'تسجيل الخروج'), { kind: 'danger', block: true, icon: 'logout', act: 'mxSoon', arg: L('Sign out', 'تسجيل الخروج') })}
      <div class="mo-foot">${L('BENA · prototype · all people, buildings and figures are fictional.<br>BENA records relationships for coordination — not a legal title record.', 'بينا · نموذج أولي · جميع الأشخاص والمباني والأرقام وهمية.<br>تسجّل بينا العلاقات للتنسيق — وليست سجلاً قانونياً للملكية.')}</div>`;
    return { title: L('More', 'المزيد'), large: true, body };
  };

  S.notifications = (_, __, back) => {
    st.seenNotifs = true;
    const list = notifs();
    const cells = (arr) => M.group(arr.map((n) => M.cell({ icon: n.icon, tone: n.tone, title: n.title, sub: n.sub, valueSub: n.when, go: n.go })));
    const fresh = list.filter((n) => n.fresh), older = list.filter((n) => !n.fresh);
    return { title: L('Notifications', 'الإشعارات'), large: true, back: back || 'home', body: `${fresh.length ? M.section(L('New', 'جديدة'), cells(fresh)) : ''}${older.length ? M.section(L('Earlier', 'سابقاً'), cells(older)) : ''}` };
  };

  /* =====================================================================
   * Actions & forms (prefix mo)
   * ===================================================================== */
  const A = B.act, F = B.submit;
  const payById = (pid) => allPayments().find((p) => p.id === pid);
  A.moCall = (n) => M.toast(L(`Calling ${n} — simulated`, `جارٍ الاتصال بـ ${n} — محاكاة`), 'phone');
  A.moMsg = (p) => M.sheet({ title: L(`Message ${D.pname(p)}`, `مراسلة ${D.pname(p)}`), sub: L('Sent through BENA · your number stays private', 'تُرسل عبر بينا · يبقى رقمك خاصاً'), form: 'moMsg', body: M.field({ name: 'msg', type: 'textarea', label: L('Message', 'الرسالة'), placeholder: L('Write your message…', 'اكتب رسالتك…'), required: true }), foot: M.btn(L('Send', 'إرسال'), { kind: 'dark', type: 'submit', icon: 'send' }) });
  F.moMsg = () => M.success({ title: L('Message sent', 'تم إرسال الرسالة'), text: L('You’ll be notified when they reply.', 'سيصلك إشعار عند الرد.') });
  A.moReceive = (pid) => {
    const p = payById(pid);
    if (!p) return;
    M.sheet({ title: L('Record payment', 'تسجيل دفعة'), sub: `${unitName(D.unit(p.unit))} · ${D.pname(p.tenant)}`, form: 'moReceive',
      body: `<input type="hidden" name="id" value="${p.id}"><div class="mo-sheet-amt"><b class="mo-num">${B.money(p.amount)}</b><span>${L(`Rent — ${ymLabel(p.ym)} · due ${B.date(p.due)}`, `الإيجار — ${ymLabel(p.ym)} · استحق ${B.date(p.due)}`)}</span></div>
        <div class="mo-opts">${radio('method', 'bank', L('Bank transfer', 'تحويل بنكي'), L('Received in your account', 'وصل إلى حسابك'), true)}${radio('method', 'cheque', L('Cheque', 'شيك'), '')}${radio('method', 'cash', L('Cash', 'نقداً'), L('A receipt is issued to the tenant', 'يُصدر إيصال للمستأجر'))}</div>
        <div class="row-sm" style="justify-content:center">${M.btn(L('Send a reminder instead', 'إرسال تذكير بدلاً من ذلك'), { sm: true, icon: 'bell', act: 'moRemind', arg: p.tenant })}</div>`,
      foot: M.btn(L('Mark as received', 'تعليم كمستلمة'), { kind: 'primary', type: 'submit', icon: 'check' }) });
  };
  F.moReceive = (data) => {
    const p = payById(data.id);
    if (!p) return;
    OX.received[`${p.lease}|${p.ym}`] = TODAY;
    B.refresh();
    M.success({ title: L('Payment recorded', 'تم تسجيل الدفعة'), text: L(`${B.money(p.amount)} from ${D.pname(p.tenant)} — a receipt was added to documents.`, `${B.money(p.amount)} من ${D.pname(p.tenant)} — أُضيف إيصال إلى المستندات.`), ref: `RC-${p.ym.replace('-', '').slice(2)}-${p.unit.slice(-3)}` });
    OX.docs.unshift({ cat: 'receipts', name: T(`Rent receipt — ${p.ym}, ${D.unitLabel(D.unit(p.unit))}`, `إيصال إيجار — ${p.ym}، ${D.unitLabel(D.unit(p.unit))}`), date: TODAY, unit: p.unit, size: '92 KB', icon: 'receipt' });
  };
  A.moRemind = (p) => { M.close(); M.toast(L(`Friendly reminder sent to ${D.pname(p)}`, `أُرسل تذكير ودي إلى ${D.pname(p)}`), 'bell'); };
  A.moRentReceipt = (pid) => {
    const p = payById(pid);
    if (!p) return;
    M.sheet({ title: L('Rent receipt', 'إيصال الإيجار'), body: `<div class="mo-sheet-amt"><b class="mo-num">${B.money(p.amount)}</b><span>${ymLabel(p.ym)}</span></div>${M.group([M.cell({ icon: 'user', title: L('From', 'من'), sub: D.pname(p.tenant) }), M.cell({ icon: 'door', title: L('Unit', 'الوحدة'), sub: `${unitName(D.unit(p.unit))} · ${bName(D.unit(p.unit).building)}` }), M.cell({ icon: 'calendar', title: L('Received', 'تاريخ الاستلام'), sub: `${B.date(p.paidOn)}${p.method ? ' · ' + tx(p.method) : ''}` }), M.cell({ icon: 'contract', title: L('Lease', 'العقد'), sub: id(p.lease) })])}${note(L('Simulated receipt · sample data.', 'إيصال محاكى · بيانات نموذجية.'))}`, foot: M.btn(L('Share', 'مشاركة'), { icon: 'share', act: 'mxSoon', arg: L('Share receipt', 'مشاركة الإيصال') }) });
  };
  A.moPayCharge = (cid) => {
    const c = OX.charges.find((x) => x.id === cid);
    if (!c) return;
    const com = D.committeeOf(c.building);
    M.sheet({ title: L('Pay building charge', 'دفع رسوم المبنى'), sub: `${unitName(D.unit(c.unit))} · ${bName(c.building)}`, form: 'moPayCharge',
      body: `<input type="hidden" name="id" value="${c.id}"><div class="mo-sheet-amt"><b class="mo-num">${B.money(ownerChargeAmt(c))}</b><span>${L(`Service charge — ${ymLabel(c.period)}`, `رسوم الخدمات — ${ymLabel(c.period)}`)}${c.share < 100 ? L(` · your ${c.share}% of ${B.money(c.amount)}`, ` · حصتك ${c.share}% من ${B.money(c.amount)}`) : ''}</span></div>
        ${M.group([M.cell({ icon: 'gavel', title: L('Paid to', 'إلى'), sub: com ? tx(com.name) : L('Building management', 'إدارة المبنى') })])}
        <div class="mo-opts">${radio('method', 'card', 'Visa •••• 0458', L('Instant', 'فوري'), true)}${radio('method', 'bank', L('Bank transfer', 'تحويل بنكي'), L('1–2 working days', 'يوم إلى يومي عمل'))}</div>
        ${note(L('Simulated payment — no money moves.', 'دفع محاكى — لا تنتقل أي أموال.'), 'lock')}`,
      foot: M.btn(L(`Pay ${B.money(ownerChargeAmt(c))}`, `ادفع ${B.money(ownerChargeAmt(c))}`), { kind: 'primary', type: 'submit', icon: 'lock' }) });
  };
  F.moPayCharge = (data) => {
    const c = OX.charges.find((x) => x.id === data.id);
    if (!c) return;
    c.status = 'paid'; c.paidOn = TODAY;
    B.refresh();
    M.success({ title: L('Charge paid', 'تم دفع الرسوم'), text: L(`${B.money(ownerChargeAmt(c))} to ${bName(c.building)}. The receipt is in Documents.`, `${B.money(ownerChargeAmt(c))} إلى ${bName(c.building)}. الإيصال في المستندات.`), ref: c.id });
  };
  A.moRenew = (lid) => {
    const l = leaseById(lid);
    M.sheet({ title: L('Renewal offer', 'عرض التجديد'), sub: L(`To ${D.pname(l.tenant)} · current rent ${B.money(l.rent)}`, `إلى ${D.pname(l.tenant)} · الإيجار الحالي ${B.money(l.rent)}`), form: 'moRenew',
      body: `<input type="hidden" name="lease" value="${l.id}">${M.field({ name: 'rent', type: 'number', label: L('New monthly rent (₪)', 'الإيجار الشهري الجديد (₪)'), value: String(l.rent + 100) })}
        <div class="mo-opts">${radio('term', '12', L('12 months', '12 شهراً'), L(`From ${B.date('2027-02-01')}`, `ابتداءً من ${B.date('2027-02-01')}`), true)}${radio('term', '24', L('24 months', '24 شهراً'), L('Longer stability for both sides', 'استقرار أطول للطرفين'))}</div>
        ${note(L(`${D.pname(l.tenant)} has asked about renewing. The offer is shared through Arkan and needs her acceptance.`, `استفسرت ${D.pname(l.tenant)} عن التجديد. يُشارك العرض عبر أركان ويحتاج موافقتها.`), 'info')}`,
      foot: M.btn(L('Send offer', 'إرسال العرض'), { kind: 'primary', type: 'submit', icon: 'send' }) });
  };
  F.moRenew = (data) => { OX.renewals[data.lease] = { rent: +data.rent || 0, start: '2027-02-01', term: data.term, sent: TODAY }; B.refresh(); M.success({ title: L('Offer sent', 'تم إرسال العرض'), text: L('You’ll be notified when the tenant responds.', 'سيصلك إشعار عند رد المستأجر.'), ref: `RN-${data.lease.slice(-4)}` }); };
  A.moLeaseDoc = (lid) => { const i = OX.docs.findIndex((d) => tx(d.name).includes(lid)); if (i >= 0) A.moDoc(i); else M.toast(L('The signed contract is held by your manager', 'العقد الموقّع لدى مدير العقار'), 'info'); };
  A.moDoc = (i) => {
    const d = OX.docs[+i];
    if (!d) return;
    M.sheet({ title: esc(tx(d.name)), sub: `${B.date(d.date)} · <bdi>${d.size}</bdi>${d.unit ? ' · ' + unitName(D.unit(d.unit)) : ''}`, body: `<div class="mo-doc"><div class="d-h">${icon(d.icon || 'doc')}<b>${esc(tx(d.name))}</b></div>${[94, 100, 82, 96, 70, 100, 86, 58].map((w) => `<i style="width:${w}%"></i>`).join('')}<div class="d-s"><span>${icon('check')}</span></div></div><div class="row-sm" style="justify-content:center">${ui.prov(d.pending ? 'pending' : 'submitted', true)}</div>`,
      foot: `${M.btn(L('Share', 'مشاركة'), { icon: 'share', act: 'mxSoon', arg: L('Share', 'مشاركة') })}${M.btn(L('Download', 'تنزيل'), { kind: 'dark', icon: 'download', act: 'mxSoon', arg: L('Download', 'تنزيل') })}` });
  };
  A.moUpload = () => M.sheet({ title: L('Add a document', 'إضافة مستند'), form: 'moUpload',
    body: `${M.field({ name: 'name', label: L('Name', 'الاسم'), placeholder: L('e.g. Insurance policy 2027', 'مثال: بوليصة التأمين 2027'), required: true })}${M.field({ name: 'cat', type: 'select', label: L('Category', 'الفئة'), options: OX.docCats.map((c) => ({ v: c.id, l: c.label })) })}${M.field({ name: 'unit', type: 'select', label: L('Unit', 'الوحدة'), options: [{ v: '', l: L('Whole portfolio', 'كل المحفظة') }, ...myUnits().map((u) => ({ v: u.id, l: `${unitName(u)} · ${bName(u.building)}` }))] })}`,
    foot: M.btn(L('Upload', 'رفع'), { kind: 'dark', type: 'submit', icon: 'upload' }) });
  F.moUpload = (data) => { const n = String(data.name || '').trim() || L('Document', 'مستند'); OX.docs.unshift({ cat: data.cat || 'building', name: T(n, n), date: TODAY, unit: data.unit || undefined, size: '380 KB', icon: 'paperclip', pending: true }); B.refresh(); M.success({ title: L('Document added', 'تمت إضافة المستند'), text: L('Shown as pending verification until it is reviewed.', 'يظهر بانتظار التحقق حتى تتم مراجعته.') }); };
  A.moRep = (rid) => {
    const r = OX.reps.find((x) => x.id === rid);
    if (!r) return;
    const live = r.status === 'active' || r.status === 'pendingVerification';
    M.sheet({ title: esc(repName(r)), sub: `${esc(tx(r.role))} · ${esc(tx(OX.relLabels[r.rel] || ''))}`, body: `<div class="row-sm wrap">${ui.status(r.status)}${ui.badge(r.doc, 'outline', 'doc')}</div>
      ${M.group(r.scope.map((s) => M.cell({ icon: 'check', tone: 'mint', title: tx(OX.scopes[s] || s) })), L('Can act on', 'صلاحياته'))}
      ${M.group([M.cell({ icon: 'shield', title: L('Limit', 'الحدود'), sub: tx(r.limit) }), M.cell({ icon: 'calendar', title: L('Valid', 'السريان'), sub: `${B.date(r.from)} – ${r.to ? B.date(r.to) : L('no end date', 'دون تاريخ انتهاء')}` })])}
      ${M.group(r.units.map((uid) => M.cell({ icon: kindIcon(D.unit(uid)), title: unitName(D.unit(uid)), sub: bName(D.unit(uid).building), go: `unit-${uid}` })), L('Units', 'الوحدات'))}`,
      foot: live ? `${M.btn(L('Revoke', 'إلغاء التفويض'), { kind: 'danger', act: 'moRevoke', arg: r.id })}${M.btn(L('Done', 'تم'), { kind: 'dark', act: 'mxClose' })}` : M.btn(L('Done', 'تم'), { kind: 'dark', act: 'mxClose' }) });
  };
  A.moRevoke = (rid) => { const r = OX.reps.find((x) => x.id === rid); M.sheet({ title: L('Revoke this authorisation?', 'إلغاء هذا التفويض؟'), sub: esc(repName(r)), body: note(L('They will no longer be able to act for you in BENA. Also cancel the power of attorney with the issuing authority if needed.', 'لن يتمكن من التصرف نيابة عنك في بينا. ألغِ الوكالة لدى الجهة المصدرة أيضاً عند الحاجة.'), 'alert'), foot: `${M.btn(L('Keep', 'إبقاء'), { act: 'mxClose' })}${M.btn(L('Revoke', 'إلغاء التفويض'), { kind: 'danger', act: 'moRevokeOk', arg: rid })}` }); };
  A.moRevokeOk = (rid) => { const r = OX.reps.find((x) => x.id === rid); if (r) r.status = 'revoked'; B.refresh(); M.toast(L('Authorisation revoked', 'تم إلغاء التفويض')); };
  A.moAddRep = () => M.sheet({ title: L('Add a representative', 'إضافة ممثل'), sub: L('Upload the power of attorney — it is verified before it takes effect.', 'ارفع الوكالة — يتم التحقق منها قبل سريانها.'), form: 'moAddRep',
    body: `${M.field({ name: 'name', label: L('Full name', 'الاسم الكامل'), placeholder: L('e.g. Nadia Habash', 'مثال: نادية حبش'), required: true })}${M.field({ name: 'rel', type: 'select', label: L('Relationship', 'العلاقة'), options: Object.entries(OX.relLabels).map(([v, l]) => ({ v, l })) })}
      <div class="mx-field"><label>${L('Can act on', 'الصلاحيات')}</label><div class="mo-opts">${['collection', 'tenants', 'maintenance', 'committee'].map((s, i) => radio(`s_${s}`, '1', tx(OX.scopes[s]), '', i === 0, true)).join('')}</div></div>
      ${M.field({ name: 'to', type: 'date', label: L('Valid until', 'صالح حتى'), value: '2027-11-30' })}`,
    foot: M.btn(L('Submit for verification', 'إرسال للتحقق'), { kind: 'dark', type: 'submit', icon: 'send' }) });
  F.moAddRep = (data) => {
    const n = String(data.name || '').trim() || L('Representative', 'ممثل');
    const pid = `p_rep${st.seq++}`;
    D.people[pid] = { id: pid, name: T(n, n) };
    const scope = ['collection', 'tenants', 'maintenance', 'committee'].filter((s) => data[`s_${s}`]);
    OX.reps.unshift({ id: `REP-${1000 + st.seq}`, p: pid, rel: data.rel || 'other', role: OX.relLabels[data.rel] || T('Representative', 'ممثل'), scope: scope.length ? scope : ['collection'], limit: T('As stated in the power of attorney', 'وفق ما تنص عليه الوكالة'), units: OX.unitIds.slice(0, 1), from: TODAY, to: data.to || null, status: 'pendingVerification', doc: `POA-RAM-2026-${String(400 + st.seq).padStart(4, '0')}` });
    B.refresh();
    M.success({ title: L('Submitted for verification', 'أُرسل للتحقق'), text: L(`${n} can act for you once the document is verified.`, `يمكن لـ ${n} التصرف نيابة عنك بعد التحقق من الوثيقة.`) });
  };
  A.moList = (uid) => {
    const m = meta(uid), ls = m.listing || {};
    M.sheet({ title: ls.state === 'listed' ? L('Edit listing', 'تعديل العرض') : L('Authorise listing', 'تفويض العرض'), sub: `${unitName(D.unit(uid))} · ${bName(D.unit(uid).building)}`, form: 'moList',
      body: `<input type="hidden" name="uid" value="${uid}">${M.field({ name: 'ask', type: 'number', label: L('Asking rent (₪ / month)', 'الإيجار المطلوب (₪ شهرياً)'), value: String(ls.ask || m.suggested || 2500) })}${M.field({ name: 'available', type: 'date', label: L('Available from', 'متاحة من'), value: ls.available || '2026-12-01' })}
        <div class="mo-opts">${radio('by', 'org_arkan', L('Arkan Property Management', 'أركان لإدارة العقارات'), L('Handles inquiries and viewings', 'تتولى الاستفسارات والمعاينات'), ls.by !== ME)}${radio('by', ME, L('I’ll handle it myself', 'سأتولى ذلك بنفسي'), '', ls.by === ME)}</div>
        ${note(L('You decide. The unit appears on the BENA property marketplace only with this authorisation, and you can withdraw it any time.', 'القرار لك. تظهر الوحدة في سوق العقارات على بينا فقط بهذا التفويض، ويمكنك سحبه في أي وقت.'), 'shieldCheck')}`,
      foot: M.btn(ls.state === 'listed' ? L('Save', 'حفظ') : L('Authorise & list', 'تفويض وعرض'), { kind: 'primary', type: 'submit', icon: 'check' }) });
  };
  F.moList = (data) => {
    const m = OX.meta[data.uid]; const was = m.listing?.state === 'listed';
    m.listing = Object.assign({ views: 0, inquiries: 0, viewings: 0, ref: `PL-26-${data.uid.slice(-4)}`, furnished: 'no' }, was ? m.listing : {}, { state: 'listed', since: was ? m.listing.since : TODAY, ask: +data.ask || m.suggested || 2500, available: data.available || '2026-12-01', by: data.by || 'org_arkan' });
    B.refresh();
    M.success({ title: was ? L('Listing updated', 'تم تحديث العرض') : L('Unit listed', 'تم عرض الوحدة'), text: L('Visible on the BENA property marketplace (prototype).', 'ظاهرة في سوق العقارات على بينا (نموذج).'), ref: m.listing.ref });
  };
  A.moUnlist = (uid) => M.sheet({ title: L('Withdraw listing?', 'سحب العرض؟'), sub: unitName(D.unit(uid)), body: note(L('The unit disappears from the marketplace. Open inquiries are told it is no longer available.', 'تختفي الوحدة من السوق. ويُبلَّغ أصحاب الاستفسارات بأنها لم تعد متاحة.')), foot: `${M.btn(L('Keep', 'إبقاء'), { act: 'mxClose' })}${M.btn(L('Withdraw', 'سحب'), { kind: 'danger', act: 'moUnlistOk', arg: uid })}` });
  A.moUnlistOk = (uid) => { OX.meta[uid].listing = { state: 'notListed' }; B.refresh(); M.toast(L('Listing withdrawn', 'تم سحب العرض')); };
  A.moCorrect = (uid) => M.sheet({ title: L('Report a correction', 'الإبلاغ عن تصحيح'), sub: `${unitName(D.unit(uid))} · ${id(uid)}`, form: 'moCorrect',
    body: `<div class="mo-opts">${radio('what', 'share', L('Ownership shares', 'حصص الملكية'), '', true)}${radio('what', 'owner', L('Owner name or co-owner', 'اسم المالك أو الشريك'), '')}${radio('what', 'deed', L('Deed reference or date', 'مرجع السند أو تاريخه'), '')}</div>${M.field({ name: 'msg', type: 'textarea', label: L('Details', 'التفاصيل'), placeholder: L('What should it say? Attach the deed if you can.', 'ما الصحيح؟ أرفق السند إن أمكن.') })}`,
    foot: M.btn(L('Send to data steward', 'إرسال إلى مسؤول البيانات'), { kind: 'dark', type: 'submit', icon: 'send' }) });
  F.moCorrect = () => M.success({ title: L('Correction submitted', 'تم إرسال التصحيح'), text: L('A data steward reviews it against the deed. The record shows “pending verification” meanwhile.', 'يراجعه مسؤول البيانات مقابل السند. ويظهر السجل «بانتظار التحقق» خلال ذلك.'), ref: 'COR-26-0142' });
  A.moCommittee = (bid) => { const c = D.committeeOf(bid); M.sheet({ title: esc(tx(c.name)), sub: esc(tx(c.basis)), body: `<div class="row-sm wrap">${ui.status(c.kind)}${c.regNo ? ui.badge(c.regNo, 'outline') : ''}</div>${M.group(c.members.map((m) => M.cell({ avatar: D.person(m.p).name, title: D.pname(m.p), sub: tx(m.role) })))}${note(c.kind === 'legal' ? L('A registered owners’ association: decisions follow its by-laws and the general assembly.', 'جمعية مالكين مسجّلة: تخضع قراراتها لنظامها الداخلي والهيئة العامة.') : L('An informal committee: it coordinates by agreement and has no legal status.', 'لجنة غير رسمية: تنسّق بالتوافق ولا تملك صفة قانونية.'), 'gavel')}`, foot: M.btn(L('Done', 'تم'), { kind: 'dark', act: 'mxClose' }) }); };
  A.moReq = (qid) => { const q = D.request(qid); M.sheet({ title: esc(tx(q.title)), sub: `${q.id} · ${B.date(q.created)}`, body: `<div class="row-sm wrap">${ui.status(q.status)}${ui.status(q.priority)}</div>${q.desc ? `<p style="font-size:15px;line-height:1.5">${esc(tx(q.desc))}</p>` : ''}${M.group([M.cell({ icon: D.cat(q.cat).icon, title: tx(D.cat(q.cat).name), sub: q.provider ? tx(D.provider(q.provider).name) : L('Provider to be assigned', 'سيُسند إلى مزوّد') }), q.visit ? M.cell({ icon: 'calendar', title: L('Visit', 'الزيارة'), sub: B.date(q.visit) }) : ''].filter(Boolean))}${note(L('Managed by the building manager. Costs above your approval limit come to you first.', 'يديرها مدير المبنى. وتصلك التكاليف التي تتجاوز حد اعتمادك أولاً.'))}`, foot: M.btn(L('Done', 'تم'), { kind: 'dark', act: 'mxClose' }) }); };
  A.moAnn = (aid) => { const a = D.announcements.find((x) => x.id === aid); M.sheet({ title: esc(tx(a.title)), sub: B.date(a.date), body: `<p style="font-size:16px;line-height:1.55">${esc(tx(a.body))}</p>`, foot: M.btn(L('Got it', 'حسناً'), { kind: 'dark', act: 'mxClose' }) }); };

  /* =====================================================================
   * Registration
   * ===================================================================== */
  const screens = {};
  Object.keys(S).forEach((k) => { screens[k] = (rid, route) => { const back = track(rid ? `${k}-${rid}` : k, k); return S[k](rid, route, back); }; });
  B.mrole({
    id: 'owner', webRole: 'owner', icon: 'key', home: 'home',
    name: T('Property Owner', 'مالك عقار'), short: T('Owner', 'مالك'),
    persona: { name: T('Khaled Mansour', 'خالد منصور'), sub: T('Owner · 6 units', 'مالك · 6 وحدات') },
    tabs: [
      { id: 'home', label: T('Portfolio', 'المحفظة'), icon: 'grid' },
      { id: 'properties', label: T('Properties', 'العقارات'), icon: 'building' },
      { id: 'tenancy', label: T('Tenancy', 'الإيجارات'), icon: 'contract', get badge() { return allLeases().filter((l) => l.status === 'expiring' && !OX.renewals[l.id]).length || ''; } },
      { id: 'income', label: T('Income', 'الدخل'), icon: 'wallet', get badge() { return overdueRows().length || ''; } },
      { id: 'more', label: T('More', 'المزيد'), icon: 'menu' },
    ],
    more: [
      { id: 'buildings', label: T('My buildings', 'مبانيّ'), icon: 'building' },
      { id: 'building', label: T('Building details', 'تفاصيل المبنى'), icon: 'building' },
      { id: 'units', label: T('My units', 'وحداتي'), icon: 'door' },
      { id: 'unit', label: T('Unit details', 'تفاصيل الوحدة'), icon: 'door' },
      { id: 'ownership', label: T('Ownership', 'الملكية'), icon: 'award' },
      { id: 'lease', label: T('Lease details', 'تفاصيل العقد'), icon: 'contract' },
      { id: 'documents', label: T('Documents', 'المستندات'), icon: 'folder' },
      { id: 'reps', label: T('Representatives', 'الممثلون'), icon: 'key' },
      { id: 'notifications', label: T('Notifications', 'الإشعارات'), icon: 'bell' },
    ],
    screens,
    notifications: notifs,
  });
})();
