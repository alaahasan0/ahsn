/*
 * First-run setup: salary, start date and opening outstanding balance.
 */

import { html, frag, $ } from '../dom.js';
import { parseToCents, centsToPlain } from '../../engine/money.js';
import { isValidDate, monthOf, monthEnd } from '../../engine/dates.js';
import { DEFAULT_CONFIG, validateConfig, COMPANIES } from '../../engine/ledger.js';
import { formatDate, money } from '../format.js';
import * as store from '../../state.js';

export function renderSetup({ onDone }) {
  const node = frag(html`
    <div class="setup">
      <div class="setup-mark" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <h1 class="title-large setup-title">Salary Tracker</h1>
      <p class="muted setup-lead">Track what you are owed against what you actually receive. Set up the basics below. Everything stays on this iPhone.</p>

      <form id="setup-form" novalidate>
        <p class="group-label">Salary</p>
        <div class="group">
          <label class="row field">
            <span class="label">Monthly salary</span>
            <span class="input-wrap"><span class="prefix">$</span>
              <input name="salary" class="input input-money" inputmode="decimal" autocomplete="off"
                value="${centsToPlain(DEFAULT_CONFIG.salarySchedule[0].amountCents)}">
            </span>
          </label>
          <label class="row field">
            <span class="label">Tracking starts</span>
            <input name="start" type="date" class="input input-date" value="${DEFAULT_CONFIG.startDate}" required>
          </label>
          <div class="row">
            <span class="label">First salary due</span>
            <span class="value" id="first-due"></span>
          </div>
        </div>
        <p class="footnote">Salary falls due on the last calendar day of each month.</p>

        <p class="group-label">Opening outstanding balance</p>
        <div class="group">
          <div class="row">
            <div class="segmented" role="radiogroup" aria-label="Opening balance type">
              <label><input type="radio" name="direction" value="owed" checked><span>Owed to me</span></label>
              <label><input type="radio" name="direction" value="advance"><span>Advance credit</span></label>
            </div>
          </div>
          <label class="row field">
            <span class="label">Amount</span>
            <span class="input-wrap"><span class="prefix">$</span>
              <input name="opening" class="input input-money" inputmode="decimal" autocomplete="off" placeholder="0.00">
            </span>
          </label>
        </div>
        <p class="footnote" id="opening-help"></p>

        <p class="group-label">Paying companies</p>
        <div class="group">
          <div class="row"><span class="label">${COMPANIES.smartOffice}</span><span class="value">USD</span></div>
          <div class="row"><span class="label">${COMPANIES.classSolution}</span><span class="value">USD</span></div>
        </div>

        <p class="form-error" id="setup-error" role="alert" hidden></p>
        <button class="btn btn-block" type="submit">Start Tracking</button>
        <p class="footnote center">You can correct the opening balance later with <em>Adjust Balance</em>. Every change is recorded.</p>
      </form>
    </div>
  `);

  const form = $('#setup-form', node);
  const firstDue = $('#first-due', node);
  const help = $('#opening-help', node);
  const errorBox = $('#setup-error', node);

  function update() {
    const start = form.start.value;
    firstDue.textContent = isValidDate(start) ? formatDate(monthEnd(monthOf(start))) : '—';
    const dir = form.direction.value;
    const when = isValidDate(start) ? formatDate(start) : 'the start date';
    help.textContent = dir === 'owed'
      ? `Salary you were already owed before ${when}. Enter 0 if nothing was outstanding.`
      : `Money you had already received in advance before ${when}.`;
  }
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const salary = parseToCents(form.salary.value);
    const openingAbs = form.opening.value.trim() === '' ? 0 : parseToCents(form.opening.value);
    const errors = [];
    if (salary === null || salary <= 0) errors.push('Enter a valid monthly salary.');
    if (openingAbs === null || openingAbs < 0) errors.push('Enter the opening balance as a positive amount (or leave it empty for 0), then choose its type.');
    const start = form.start.value;
    const config = {
      ...DEFAULT_CONFIG,
      startDate: start,
      openingBalanceCents: form.direction.value === 'advance' ? -(openingAbs || 0) : (openingAbs || 0),
      salarySchedule: [{ fromMonth: isValidDate(start) ? monthOf(start) : '', amountCents: salary ?? 0 }],
    };
    if (!errors.length) errors.push(...validateConfig(config));
    if (errors.length) {
      errorBox.textContent = errors[0];
      errorBox.hidden = false;
      return;
    }
    errorBox.hidden = true;
    form.querySelector('button[type=submit]').disabled = true;
    try {
      await store.saveConfig(config);
      onDone?.(config);
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.hidden = false;
      form.querySelector('button[type=submit]').disabled = false;
    }
  });

  return node;
}

export const describeOpening = (cents) =>
  cents > 0 ? `${money(cents)} owed to you` : cents < 0 ? `${money(-cents)} advance credit` : 'None';
