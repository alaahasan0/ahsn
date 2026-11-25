/*
 * BENA charts — lightweight HTML/SVG charts that stay crisp at any width.
 * Bars are HTML (labels never shrink); lines use a stretched SVG with
 * non-scaling strokes and HTML axes.
 */
(function () {
  const B = (window.B = window.B || {});
  const { tx, esc } = B;
  const C = (B.charts = {});
  C.palette = ['#142B3B', '#36D6A0', '#7FA7C2', '#F2B35A', '#9B8AE0', '#C9D6DF', '#E58A7B'];

  const niceMax = (v) => { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; };
  const fmtDefault = (v) => B.compact(v);

  /**
   * Vertical (optionally stacked) bars.
   * bars({ labels:[..], series:[{name, color, values:[..]}], height, format, showValues, axis })
   * or bars({ data:[{label, value, color}] })
   */
  C.bars = (o) => {
    const labels = o.labels || o.data.map((d) => d.label);
    const series = o.series || [{ name: o.name || '', color: o.color || C.palette[0], values: o.data.map((d) => d.value), colors: o.data.map((d) => d.color) }];
    const totals = labels.map((_, i) => series.reduce((s, se) => s + (se.values[i] || 0), 0));
    const max = niceMax(o.max || Math.max(...totals));
    const fmt = o.format || fmtDefault;
    const axis = o.axis !== false;
    const dense = labels.length > 8;
    const ticks = [max, max * 0.75, max * 0.5, max * 0.25, 0];
    const highlight = o.highlight != null ? o.highlight : -1;
    return `<div class="chart"><div class="bars ${axis ? 'with-axis' : ''} ${dense ? 'dense' : ''}" style="--h:${o.height || 200}px">
      ${axis ? `<div class="grid-lines">${ticks.map((t) => `<i><span>${fmt(t)}</span></i>`).join('')}</div>` : ''}
      ${labels.map((l, i) => {
        const h = (totals[i] / max) * 100;
        const segs = series.map((se) => { const v = se.values[i] || 0; const c = (se.colors && se.colors[i]) || se.color; return v ? `<i style="height:${(v / (totals[i] || 1)) * 100}%;background:${c};${highlight >= 0 && i !== highlight ? 'opacity:.35' : ''}"></i>` : ''; }).join('');
        const tip = series.length > 1 ? series.map((se) => `${tx(se.name)}: ${fmt(se.values[i] || 0)}`).join('<br>') : fmt(totals[i]);
        return `<div class="col ${i % 2 ? 'alt' : ''}">${o.showValues ? `<span class="val">${fmt(totals[i])}</span>` : ''}<div class="stackc" style="height:${h}%">${segs}</div><span class="lbl">${tx(l)}</span><span class="tip">${tx(l)}<br>${tip}</span></div>`;
      }).join('')}
    </div>${series.length > 1 && o.legend !== false ? C.legend(series) : ''}</div>`;
  };

  C.legend = (series) => `<div class="legend">${series.map((s, i) => `<span><i style="background:${s.color || C.palette[i]}"></i>${tx(s.name || s.label)}</span>`).join('')}</div>`;

  /** Horizontal bars: hbars({ data:[{label, value, color, sub}], max, format, total }) */
  C.hbars = (o) => {
    const max = o.max || Math.max(...o.data.map((d) => d.value));
    const fmt = o.format || ((v) => B.num(v));
    return `<div class="hbars">${o.data.map((d, i) => `<div class="hbar"><div class="hb-top"><span>${tx(d.label)}${d.sub ? ` <span class="faint xs">${tx(d.sub)}</span>` : ''}</span><b>${fmt(d.value)}</b></div>
      <div class="hb-track"><i style="width:${(d.value / max) * 100}%;background:${d.color || o.color || C.palette[i % C.palette.length]}"></i></div></div>`).join('')}</div>`;
  };

  /** Stacked single-row share bars: shares({rows:[{label, parts:[{value,color,name}]}]}) */
  C.shares = (o) => `<div class="hbars">${o.rows.map((r) => { const t = r.parts.reduce((s, p) => s + p.value, 0); return `<div class="hbar"><div class="hb-top"><span>${tx(r.label)}</span><b>${B.num(t)}</b></div><div class="hb-track">${r.parts.map((p) => `<i style="width:${(p.value / t) * 100}%;background:${p.color}" title="${esc(tx(p.name))}: ${B.num(p.value)}"></i>`).join('')}</div></div>`; }).join('')}${o.legend ? C.legend(o.legend) : ''}</div>`;

  /**
   * Line / area chart.
   * line({ labels:[..], series:[{name, color, values:[..], area:true, dashed}], height, format, min })
   */
  C.line = (o) => {
    const W = 600, H = 200;
    const all = o.series.flatMap((s) => s.values);
    const min = o.min != null ? o.min : 0;
    const max = niceMax(Math.max(...all));
    const n = o.labels.length;
    const fmt = o.format || fmtDefault;
    const x = (i) => (n === 1 ? W / 2 : (i / (n - 1)) * W);
    const y = (v) => H - ((v - min) / (max - min || 1)) * H;
    const rtl = B.isAr();
    const xx = (i) => (rtl ? W - x(i) : x(i));
    const paths = o.series.map((s, si) => {
      const c = s.color || C.palette[si];
      const pts = s.values.map((v, i) => [xx(i), y(v)]);
      const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
      const gid = 'g' + Math.random().toString(36).slice(2, 8);
      const area = s.area ? `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".22"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient></defs><path d="${d} L${pts[pts.length - 1][0]} ${H} L${pts[0][0]} ${H} Z" fill="url(#${gid})" stroke="none"/>` : '';
      const last = pts[pts.length - 1];
      return `${area}<path d="${d}" fill="none" stroke="${c}" stroke-width="2.4" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" ${s.dashed ? 'stroke-dasharray="5 5"' : ''}/>
        <circle cx="${last[0]}" cy="${last[1]}" r="4" fill="${c}" stroke="#fff" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
    }).join('');
    const grid = [0, .25, .5, .75, 1].map((f) => `<line x1="0" x2="${W}" y1="${H * f}" y2="${H * f}" stroke="#E2E9E6" stroke-dasharray="3 4" vector-effect="non-scaling-stroke"/>`).join('');
    const ticks = [max, min + (max - min) * .75, min + (max - min) * .5, min + (max - min) * .25, min];
    const step = n > 8 ? Math.ceil(n / 6) : 1;
    const xl = o.labels.map((l, i) => `<span style="${i % step && i !== n - 1 ? 'visibility:hidden' : ''}">${tx(l)}</span>`);
    const zones = o.labels.map((l, i) => `<div class="hz"><span class="tip">${tx(l)}<br>${o.series.map((s) => `${o.series.length > 1 ? tx(s.name) + ': ' : ''}<b>${fmt(s.values[i])}</b>`).join('<br>')}</span></div>`);
    return `<div class="chart"><div class="line-chart" style="--h:${o.height || 220}px">
      <div class="y-axis">${ticks.map((t) => `<span>${fmt(t)}</span>`).join('')}</div>
      <svg class="plot" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${grid}${paths}</svg>
      <div class="x-axis">${xl.join('')}</div><div class="hover-zones">${zones.join('')}</div>
    </div>${o.series.length > 1 && o.legend !== false ? C.legend(o.series) : ''}</div>`;
  };

  /** Donut: donut({ data:[{label, value, color}], center:{value, label}, size, legend:true, format }) */
  C.donut = (o) => {
    const total = o.data.reduce((s, d) => s + d.value, 0) || 1;
    const r = 42, c = 2 * Math.PI * r;
    let off = 0;
    const segs = o.data.map((d, i) => {
      const len = (d.value / total) * c;
      const gap = o.data.length > 1 ? 1.6 : 0;
      const s = `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${d.color || C.palette[i]}" stroke-width="${o.thick || 12}" stroke-dasharray="${Math.max(0, len - gap)} ${c}" stroke-dashoffset="${-off}"><title>${esc(tx(d.label))}: ${B.num(d.value)}</title></circle>`;
      off += len; return s;
    }).join('');
    const fmt = o.format || ((v) => B.num(v));
    const legend = o.legend === false ? '' : `<div class="donut-legend">${o.data.map((d, i) => `<div class="dl"><i style="background:${d.color || C.palette[i]}"></i><span>${tx(d.label)}</span><b>${fmt(d.value)}</b><em>${Math.round((d.value / total) * 100)}%</em></div>`).join('')}</div>`;
    return `<div class="donut-wrap"><div class="donut" style="--s:${o.size || 160}px"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="${r}" fill="none" stroke="#EDF2F0" stroke-width="${o.thick || 12}"/>${segs}</svg>
      ${o.center ? `<div class="center"><b>${o.center.value}</b><small>${tx(o.center.label)}</small></div>` : ''}</div>${legend}</div>`;
  };

  /** Progress ring: ring(pct, {size, color, label}) */
  C.ring = (pct, o = {}) => {
    const r = 42, c = 2 * Math.PI * r;
    return `<div class="ring" style="--s:${o.size || 64}px"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="${r}" fill="none" stroke="#EDF2F0" stroke-width="10"/><circle cx="50" cy="50" r="${r}" fill="none" stroke="${o.color || '#36D6A0'}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(pct / 100) * c} ${c}"/></svg><b>${o.label ?? Math.round(pct) + '%'}</b></div>`;
  };

  /** Sparkline: spark(values, color) */
  C.spark = (vals, color = '#36D6A0') => {
    const W = 120, H = 32, max = Math.max(...vals), min = Math.min(...vals);
    const rtl = B.isAr();
    const pts = vals.map((v, i) => [rtl ? W - (i / (vals.length - 1)) * W : (i / (vals.length - 1)) * W, H - 3 - ((v - min) / (max - min || 1)) * (H - 6)]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const gid = 's' + Math.random().toString(36).slice(2, 8);
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".25"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${d} L${pts[pts.length - 1][0]} ${H} L${pts[0][0]} ${H}Z" fill="url(#${gid})"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round"/></svg>`;
  };

  /** Heat strip (e.g. 12 months × status): heat({cols, values:[0..1], color}) */
  C.heat = (o) => `<div class="heat" style="grid-template-columns:repeat(${o.cols},minmax(0,1fr))">${o.values.map((v) => `<i style="background:${v < 0 ? '#EDF2F0' : `color-mix(in srgb, ${o.color || '#36D6A0'} ${Math.round(15 + v * 85)}%, #EDF2F0)`}" title="${Math.round(v * 100)}%"></i>`).join('')}</div>`;
})();
