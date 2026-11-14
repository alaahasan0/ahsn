/*
 * Overview dashboard: financial position as of a selectable date.
 */

import { html, raw, frag, $, $$, openSheet } from '../dom.js';
import { positionAsOf, currentMonthSummary, companyHistory, COMPANIES } from '../../engine/ledger.js';
import { money, signed, balanceStatus, formatDate, formatMonth, plural, daysBetween } from '../format.js';
import * as store from '../../state.js';

const RECENT_COUNT = 6;

export function renderHome() {
  const state = store.getState();
  const today = store.today();
  const asOf = store.asOf();
  const isToday = asOf === today;

  const pos = positionAsOf(state, asOf);
  const month = currentMonthSummary(state, asOf);
  const status = balanceStatus(pos.balanceCents);
  const totalDue = pos.openingCents + pos.accruedCents + pos.adjustmentsCents;
  const scale = Math.max(totalDue, pos.paidCents, 1);
  const pct = (c) => `${Math.max(0, Math.min(100, (c / scale) * 100)).toFixed(2)}%`;

  const so = pos.byCompany.smartOffice;
  const cs = pos.byCompany.classSolution;
  const companyTotal = so + cs;
  const share = (c) => (companyTotal ? Math.round((c / companyTotal) * 100) : 0);

  const recent = pos.ledger.slice(-RECENT_COUNT).reverse();

  const node = frag(html`
    <header class="topbar">
      <div>
        <p class="eyebrow">${isToday ? 'Today' : 'Viewing history'}</p>
        <label class="asof-pill ${isToday ? '' : 'is-history'}">
          <span>As of ${formatDate(asOf)}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>
          <input type="date" id="asof-input" value="${asOf}" aria-label="Show balances as of date">
        </label>
      </div>
      ${isToday ? '' : html`<button class="link-btn" id="asof-reset" type="button">Today</button>`}
    </header>

    <section class="hero">
      <p class="eyebrow">Outstanding balance</p>
      <p class="figure-hero" id="hero-figure">${money(pos.balanceCents)}</p>
      <p class="hero-status"><span class="pill pill-${status.tone}">${status.label}</span>
        ${pos.balanceCents < 0 ? html`<span class="muted">${money(pos.advanceCreditCents)} paid ahead of salary</span>` : ''}
        ${pos.balanceCents > 0 ? html`<span class="muted">still to be paid</span>` : ''}
      </p>
    </section>

    <section class="compare" aria-label="Salary due versus cash received">
      <div class="compare-row">
        <div class="compare-head"><span>Total due to date</span><span class="figure">${money(totalDue)}</span></div>
        <div class="bar"><span class="bar-fill bar-due" style="width:${pct(totalDue)}"></span></div>
      </div>
      <div class="compare-row">
        <div class="compare-head"><span>Cash received</span><span class="figure">${money(pos.paidCents)}</span></div>
        <div class="bar"><span class="bar-fill bar-paid" style="width:${pct(pos.paidCents)}"></span></div>
      </div>
      <p class="footnote">Due to date − received = outstanding balance.</p>
    </section>

    <p class="group-label">Financial position</p>
    <div class="group">
      <div class="row"><span class="label">Opening balance</span><span class="value figure">${money(pos.openingCents)}</span></div>
      <div class="row"><span class="label">Salary accrued <span class="subtle">· ${plural(pos.salaryMonths, 'month')}</span></span><span class="value figure">${signed(pos.accruedCents)}</span></div>
      <div class="row"><span class="label">Payments received <span class="subtle">· ${pos.paymentCount}</span></span><span class="value figure">${signed(-pos.paidCents)}</span></div>
      ${pos.adjustmentsCents !== 0 ? html`<div class="row"><span class="label">Adjustments</span><span class="value figure">${signed(pos.adjustmentsCents)}</span></div>` : ''}
      <div class="row row-total"><span class="label">Outstanding</span><span class="value figure">${money(pos.balanceCents)}</span></div>
      ${pos.advanceCreditCents > 0 ? html`<div class="row"><span class="label">Advance credit</span><span class="value figure is-positive">${money(pos.advanceCreditCents)}</span></div>` : ''}
    </div>

    <p class="group-label">${formatMonth(month.month)}</p>
    <div class="group">
      <div class="row"><span class="label">Salary entitlement</span><span class="value figure">${money(month.salaryEntitlementCents)}</span></div>
      <div class="row"><span class="label">Salary due date</span><span class="value">${formatDate(month.dueDate)} <span class="subtle">${dueHint(month, asOf)}</span></span></div>
      <div class="row"><span class="label">Balance at start of month</span><span class="value figure">${money(month.openingCents)}</span></div>
      <div class="row"><span class="label">Received this month <span class="subtle">· ${month.paymentCount}</span></span><span class="value figure">${money(month.paymentsCents)}</span></div>
      <div class="row row-total"><span class="label">Cumulative outstanding</span><span class="value figure">${money(month.balanceCents)}</span></div>
    </div>

    <p class="group-label">Received by company</p>
    <div class="group">
      ${['smartOffice', 'classSolution'].map((key) => {
        const amt = key === 'smartOffice' ? so : cs;
        return html`
          <button class="row row-button" type="button" data-company="${key}">
            <span class="company">
              <span class="label">${COMPANIES[key]}</span>
              <span class="share"><span class="share-fill share-${key}" style="width:${share(amt)}%"></span></span>
            </span>
            <span class="value"><span class="figure">${money(amt)}</span> <span class="subtle">${share(amt)}%</span></span>
            <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>
          </button>`;
      })}
    </div>

    <p class="group-label">Recent activity</p>
    <div class="group timeline">
      ${recent.map(timelineRow)}
    </div>
    <p class="footnote center">The full ledger arrives in Phase 4.</p>
  `);

  $('#asof-input', node).addEventListener('change', (e) => store.setAsOf(e.target.value));
  $('#asof-reset', node)?.addEventListener('click', () => store.setAsOf(null));
  $$('[data-company]', node).forEach((b) => b.addEventListener('click', () => showCompany(b.dataset.company, asOf)));
  return node;
}

function dueHint(month, asOf) {
  if (month.isDue) return month.dueDate === asOf ? '· due today' : '· accrued';
  const d = daysBetween(asOf, month.dueDate);
  return `· in ${plural(d, 'day')}`;
}

const TYPE_META = {
  opening: { dot: 'dot-opening', title: () => 'Opening balance' },
  salary: { dot: 'dot-salary', title: (e) => `Salary · ${formatMonth(e.month, { short: true })}` },
  payment: { dot: 'dot-payment', title: () => 'Payment received' },
  adjustment: { dot: 'dot-adjustment', title: (e) => `Adjustment` },
};

export function timelineRow(e) {
  const meta = TYPE_META[e.type];
  let detail = '';
  if (e.type === 'payment') {
    const parts = [];
    if (e.smartOfficeCents) parts.push(`SO ${money(e.smartOfficeCents)}`);
    if (e.classSolutionCents) parts.push(`TCS ${money(e.classSolutionCents)}`);
    if (e.advanceCents) parts.push(`${money(e.advanceCents)} advance`);
    detail = parts.join(' · ');
  } else if (e.type === 'adjustment') detail = e.reason;
  else if (e.type === 'salary') detail = 'Salary due';
  const amount = e.type === 'opening' ? money(e.effectCents) : signed(e.effectCents);
  return html`
    <div class="row tl-row">
      <span class="dot ${meta.dot}" aria-hidden="true"></span>
      <span class="tl-main">
        <span class="label">${meta.title(e)}</span>
        <span class="subtle">${formatDate(e.date)}${detail ? raw(' · ') : ''}${detail}</span>
      </span>
      <span class="tl-amounts">
        <span class="figure ${e.effectCents < 0 ? 'is-positive' : ''}">${amount}</span>
        <span class="subtle">Bal. ${money(e.balanceCents)}</span>
      </span>
    </div>`;
}

function showCompany(key, asOf) {
  const hist = companyHistory(store.getState(), key, asOf);
  openSheet({
    title: hist.label,
    content: html`
      <div class="sheet-hero">
        <p class="eyebrow">Total received</p>
        <p class="figure-hero figure-medium">${money(hist.totalCents)}</p>
        <p class="muted">${plural(hist.rows.length, 'transfer')} up to ${formatDate(asOf)}</p>
      </div>
      ${hist.rows.length ? html`
        <div class="group">
          ${hist.rows.map((r) => html`
            <div class="row">
              <span class="tl-main">
                <span class="label">${formatDate(r.date)}</span>
                <span class="subtle">${r.reference || ''}${r.reference && r.amountCents !== r.totalCents ? raw(' · ') : ''}${r.amountCents !== r.totalCents ? `of ${money(r.totalCents)} transfer` : ''}</span>
              </span>
              <span class="value figure">${money(r.amountCents)}</span>
            </div>`)}
        </div>` : html`<p class="placeholder">No payments received through ${hist.label} yet.</p>`}
    `,
  });
}
