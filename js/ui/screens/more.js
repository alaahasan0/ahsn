/*
 * More: configuration summary, appearance, demo mode and data management.
 */

import { html, frag, $, confirmSheet, toast } from '../dom.js';
import { COMPANIES, salaryForMonth } from '../../engine/ledger.js';
import { monthOf, monthEnd } from '../../engine/dates.js';
import { money, formatDate } from '../format.js';
import { describeOpening } from './setup.js';
import { getTheme, setTheme } from '../theme.js';
import * as store from '../../state.js';

export function renderMore({ version }) {
  const { config } = store.getState();
  const theme = getTheme();
  const demo = store.isDemo();
  const currentSalary = salaryForMonth(config, monthOf(store.today()));

  const node = frag(html`
    <h1 class="title-large">More</h1>

    <p class="group-label">Salary configuration</p>
    <div class="group">
      <div class="row"><span class="label">Monthly salary</span><span class="value figure">${money(currentSalary)}</span></div>
      <div class="row"><span class="label">Salary due</span><span class="value">Last day of each month</span></div>
      <div class="row"><span class="label">Tracking started</span><span class="value">${formatDate(config.startDate)}</span></div>
      <div class="row"><span class="label">First salary due</span><span class="value">${formatDate(monthEnd(monthOf(config.startDate)))}</span></div>
      <div class="row"><span class="label">Opening balance</span><span class="value">${describeOpening(config.openingBalanceCents)}</span></div>
      <div class="row"><span class="label">Currency</span><span class="value">USD</span></div>
    </div>
    <p class="footnote">To change the opening balance, use <em>Adjust Balance</em> (coming in Phase 4). Adjustments are recorded separately, so your history stays intact.</p>

    <p class="group-label">Companies</p>
    <div class="group">
      <div class="row"><span class="label">${COMPANIES.smartOffice}</span></div>
      <div class="row"><span class="label">${COMPANIES.classSolution}</span></div>
    </div>

    <p class="group-label">Appearance</p>
    <div class="group">
      <div class="row">
        <div class="segmented segmented-3" role="radiogroup" aria-label="Appearance">
          ${['system', 'light', 'dark'].map((t) => html`
            <label><input type="radio" name="theme" value="${t}" ${theme === t ? 'checked' : ''}><span>${t[0].toUpperCase() + t.slice(1)}</span></label>`)}
        </div>
      </div>
    </div>

    <p class="group-label">Preview</p>
    <div class="group">
      <label class="row">
        <span class="label">Show sample data</span>
        <input type="checkbox" class="switch" id="demo-toggle" ${demo ? 'checked' : ''}>
      </label>
    </div>
    <p class="footnote">See how the app looks with a few months of example transfers. Your real data is not changed, and nothing is saved while this is on.</p>

    <p class="group-label">Data</p>
    <div class="group">
      <div class="row"><span class="label">Stored</span><span class="value">On this device only</span></div>
      <div class="row"><span class="label">Persistent storage</span><span class="value" id="persist-status">—</span></div>
      <button class="row row-button row-destructive" type="button" id="erase" ${demo ? 'disabled' : ''}>Erase All Data…</button>
    </div>
    <p class="footnote">Backup, restore and exports arrive in Phase 6.</p>

    <p class="group-label">About</p>
    <div class="group">
      <div class="row"><span class="label">Version</span><span class="value">${version}</span></div>
    </div>
  `);

  node.querySelectorAll('input[name=theme]').forEach((r) => r.addEventListener('change', () => setTheme(r.value)));

  $('#demo-toggle', node).addEventListener('change', (e) => {
    store.setDemo(e.target.checked);
    toast(e.target.checked ? 'Showing sample data' : 'Back to your data');
  });

  $('#erase', node).addEventListener('click', async () => {
    const ok = await confirmSheet({
      title: 'Erase all data?',
      message: 'This permanently deletes your configuration, payments, adjustments and history from this device. It cannot be undone.',
      confirmLabel: 'Erase Everything',
      destructive: true,
    });
    if (!ok) return;
    const sure = await confirmSheet({
      title: 'Are you absolutely sure?',
      message: 'Unless you have a backup, your records will be gone for good.',
      confirmLabel: 'Yes, Erase',
      destructive: true,
    });
    if (!sure) return;
    await store.eraseAll();
    toast('All data erased');
  });

  const ps = $('#persist-status', node);
  navigator.storage?.persisted?.().then((granted) => { ps.textContent = granted ? 'Granted' : 'Best effort'; })
    .catch(() => { ps.textContent = 'Unknown'; });

  return node;
}
