/*
 * BENA simulated GIS map — an SVG city fabric for a sample area of Ramallah.
 * Not connected to any GIS service. Supports pan (drag), wheel / pinch zoom,
 * zoom buttons, colour modes, filtering (dim) and selection.
 *
 * B.map.render({ id, mode, visible:Set|null, selected, onSelect, height, legend, badge, static, focus })
 *   id        unique map id (view state kept in B.vs['map:'+id])
 *   mode      'type' | 'verification' | 'source'
 *   visible   Set of building ids to highlight (others dimmed); null = all
 *   selected  building id to mark with a pin
 *   onSelect  action name called with building id when a footprint is tapped
 *   static    true = no interaction (mini map)
 *   focus     building id to centre on initially
 */
(function () {
  const B = (window.B = window.B || {});
  const { tx, L, icon } = B;
  const W = 1000, H = 700;
  const M = (B.map = {});

  M.colors = {
    type: { residential: '#C5D5E0', commercial: '#F3CF96', office: '#8EA7BA', mixed: '#9FE5CA', public: '#CBC0F2', heritage: '#E3CBAA', industrial: '#C9CED3' },
    verification: { verified: '#5FDCAC', pendingVerification: '#F4B860', unverified: '#D4DBD9' },
    source: { gis: '#7FA7C2', independent: '#B9AAF0' },
  };
  M.fill = (b, mode) => {
    if (mode === 'verification') return M.colors.verification[b.verification] || '#D4DBD9';
    if (mode === 'source') return M.colors.source[b.source];
    return M.colors.type[b.type] || '#D4DBD9';
  };
  M.legendItems = (mode) => {
    const D = B.data;
    if (mode === 'verification') return [['#5FDCAC', L('Verified', 'موثّق')], ['#F4B860', L('Pending verification', 'بانتظار التحقق')], ['#D4DBD9', L('Unverified draft', 'مسودة غير موثّقة')], ['dash', L('Independently submitted', 'مُسجّل بشكل مستقل')]];
    if (mode === 'source') return [['#7FA7C2', L('Municipal GIS record', 'سجل نظم المعلومات البلدية')], ['#B9AAF0', L('Independently submitted', 'مُسجّل بشكل مستقل')]];
    return Object.entries(M.colors.type).map(([k, c]) => [c, tx(D.types[k])]);
  };

  /* terrain contours (Ramallah sits on hills) — generated once */
  let terrain = null;
  const contours = () => {
    if (terrain) return terrain;
    const hills = [[180, 180, 1], [760, 120, 0.9], [420, 620, 0.8], [920, 560, 0.7]];
    const out = [];
    hills.forEach(([cx, cy, s], hi) => {
      for (let k = 1; k <= 7; k++) {
        const rad = k * 46 * s;
        const pts = [];
        for (let a = 0; a <= 64; a++) {
          const t = (a / 64) * Math.PI * 2;
          const wob = 1 + 0.12 * Math.sin(t * 3 + hi + k * 0.7) + 0.07 * Math.sin(t * 5 + k);
          pts.push(`${(cx + Math.cos(t) * rad * wob * 1.25).toFixed(1)},${(cy + Math.sin(t) * rad * wob).toFixed(1)}`);
        }
        out.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="#DCE5E0" stroke-width="${k % 3 === 0 ? 1.1 : 0.6}"/>`);
      }
    });
    terrain = out.join('');
    return terrain;
  };

  const pathOf = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  const centroid = (poly) => { let x = 0, y = 0; poly.forEach((p) => { x += p[0]; y += p[1]; }); return [x / poly.length, y / poly.length]; };

  M.view = (id) => B.vs['map:' + id];
  M.setView = (id, v) => { B.vs['map:' + id] = v; };
  /** Centre a map on a building (call before render or followed by refresh). */
  M.focus = (id, bid, w = 360) => {
    const b = B.data.building(bid);
    if (!b) return;
    const c = centroid(b.poly);
    const h = w * 0.7;
    M.setView(id, { x: c[0] - w / 2, y: c[1] - h / 2, w, h });
  };

  M.render = (o) => {
    const D = B.data;
    const id = o.id;
    if (o.focus && !M.view(id)) M.focus(id, o.focus, o.focusW || 360);
    const v = M.view(id) || { x: 0, y: 0, w: W, h: H };
    const mode = o.mode || 'type';
    const roads = D.roads.map((rd) => {
      const d = pathOf(rd.pts);
      return `<path d="${d}" fill="none" stroke="#D3DCD8" stroke-width="${rd.w + 3}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join('') + D.roads.map((rd) => `<path id="${id}-rd-${rd.id}" d="${pathOf(rd.pts)}" fill="none" stroke="#FFFFFF" stroke-width="${rd.w}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')
      + D.roads.filter((rd) => rd.w >= 8).map((rd) => `<path d="${pathOf(rd.pts)}" fill="none" stroke="#F1D9A8" stroke-width="1" stroke-dasharray="6 8" opacity=".8"/>`).join('');
    const streetLabels = D.roads.filter((rd) => rd.name).map((rd) => `<text class="street-label" dy="2.4"><textPath href="#${id}-rd-${rd.id}" startOffset="${rd.id === 'ring' ? '18%' : '42%'}">${tx(rd.name)}</textPath></text>`).join('');
    const parks = D.parks.map((p) => `<polygon points="${p.pts.map((q) => q.join(',')).join(' ')}" fill="#D9EAD9" stroke="#C7DDC8" stroke-width="1"/><text x="${centroid(p.pts)[0]}" y="${centroid(p.pts)[1] + 3}" text-anchor="middle" font-size="7" fill="#6E9A73" style="pointer-events:none">${tx(p.name)}</text>`).join('');
    const vis = o.visible;
    const blds = D.buildings.map((b) => {
      const dim = vis && !vis.has(b.id);
      const sel = o.selected === b.id;
      const indep = b.source === 'independent' && mode === 'verification';
      const fill = M.fill(b, mode);
      return `<polygon class="bld ${dim ? 'dim' : ''} ${sel ? 'sel' : ''}" points="${b.poly.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ')}" fill="${fill}" ${indep ? 'stroke="#6E56CF" stroke-dasharray="2 1.5" stroke-width="1"' : ''} ${o.static ? '' : `data-act="${o.onSelect || 'mapSelect'}" data-arg="${b.id}"`}><title>${b.id} · ${tx(b.name)}</title></polygon>`;
    }).join('');
    // key buildings get a subtle extrusion shadow to stand out
    const keyShadows = D.keyBuildings.map((b) => `<polygon points="${b.poly.map((q) => (q[0] + 1.6).toFixed(1) + ',' + (q[1] + 2.2).toFixed(1)).join(' ')}" fill="rgba(20,43,59,.16)"/>`).join('');
    const districtLabels = D.districts.map((d) => `<text class="map-label" x="${d.seed[0]}" y="${d.seed[1]}" text-anchor="middle" font-size="${o.static ? 12 : 14}">${tx(d.name)}</text>`).join('');
    let pin = '';
    if (o.selected) {
      const b = D.building(o.selected);
      if (b) {
        const c = centroid(b.poly);
        const s = Math.max(0.5, Math.min(1.6, v.w / 700));
        pin = `<g class="map-pin" transform="translate(${c[0]} ${c[1]}) scale(${s})">
          <circle r="16" fill="#36D6A0" opacity=".22"><animate attributeName="r" values="10;22;10" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".35;0;.35" dur="2.4s" repeatCount="indefinite"/></circle>
          <path d="M0 0 C-7 -10 -12 -15 -12 -22 a12 12 0 0 1 24 0 C12 -15 7 -10 0 0z" fill="#142B3B"/><circle cy="-22" r="5" fill="#36D6A0"/></g>`;
      }
    }
    const legend = o.legend === false ? '' : `<div class="map-legend ${o.legendMobile ? 'show-m' : ''}">${M.legendItems(mode).map(([c, l]) => `<span><i class="${c === 'dash' ? 'dash' : ''}" style="background:${c === 'dash' ? '' : c}"></i>${l}</span>`).join('')}</div>`;
    const ctrls = o.static ? '' : `<div class="map-ctrls">
        <button data-act="mapZoom" data-arg="${id}:in" aria-label="${L('Zoom in', 'تكبير')}">${icon('plus')}</button>
        <button data-act="mapZoom" data-arg="${id}:out" aria-label="${L('Zoom out', 'تصغير')}">${icon('minus')}</button>
        <button data-act="mapZoom" data-arg="${id}:reset" aria-label="${L('Reset view', 'إعادة الضبط')}">${icon('maximize')}</button>
        ${o.selected ? `<button data-act="mapZoom" data-arg="${id}:sel:${o.selected}" aria-label="${L('Go to selected', 'الانتقال للمحدد')}">${icon('locate')}</button>` : ''}
      </div>`;
    const badge = o.badge === false ? '' : `<div class="map-badge">${icon('layers')}${o.badge || L('Simulated GIS · sample area', 'نظم معلومات محاكاة · منطقة نموذجية')}</div>`;
    const scaleM = Math.round((v.w / W) * 250 / 50) * 50 || 50;
    return `<div class="map-shell" data-map="${id}" style="${o.height ? `--map-h:${o.height}` : ''}">
      <svg class="map-svg" viewBox="${v.x} ${v.y} ${v.w} ${v.h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${L('Map of buildings', 'خريطة المباني')}">
        <rect x="-400" y="-400" width="1800" height="1500" fill="#EDF2EF"/>
        <g>${contours()}</g>${parks}${roads}${keyShadows}${blds}${streetLabels}${districtLabels}${pin}
      </svg>${badge}${ctrls}${legend}
      ${o.static ? '' : `<div class="map-scale"><i></i><span>${scaleM} m</span></div>`}
    </div>`;
  };

  /* ---------------- interaction ---------------- */
  const clampV = (v) => {
    const w = Math.max(90, Math.min(1300, v.w));
    const h = w * (v.h / v.w);
    return { x: Math.max(-250, Math.min(W - w + 250, v.x)), y: Math.max(-200, Math.min(H - h + 200, v.y)), w, h };
  };
  const apply = (svg, id, v) => { v = clampV(v); M.setView(id, v); svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`); };
  const curView = (svg, id) => {
    const vb = svg.viewBox.baseVal;
    return M.view(id) || { x: vb.x, y: vb.y, w: vb.width, h: vb.height };
  };
  /** Size the default view to the element's aspect ratio so 'slice' crops sensibly. */
  const fitAspect = (shell, svg, id) => {
    if (M.view(id)) return;
    const r = shell.clientHeight / Math.max(1, shell.clientWidth);
    let w = W, h = W * r;
    if (h < H) { /* wide container: show full width */ } else { h = H; w = H / r; }
    apply(svg, id, { x: (W - w) / 2, y: (H - h) / 2, w, h });
  };

  M.bindAll = () => {
    document.querySelectorAll('.map-shell[data-map]').forEach((shell) => {
      const id = shell.dataset.map;
      const svg = shell.querySelector('svg');
      if (!svg || shell._bound) return;
      shell._bound = true;
      fitAspect(shell, svg, id);
      if (!svg.querySelector('[data-act]')) return; // static map
      const pts = new Map();
      let start = null, moved = false, pinch = null;
      const toWorld = (cx, cy) => {
        const rect = svg.getBoundingClientRect();
        const v = curView(svg, id);
        // account for preserveAspectRatio slice
        const s = Math.max(rect.width / v.w, rect.height / v.h);
        const ox = (rect.width - v.w * s) / 2, oy = (rect.height - v.h * s) / 2;
        return [v.x + (cx - rect.left - ox) / s, v.y + (cy - rect.top - oy) / s, s];
      };
      svg.addEventListener('pointerdown', (e) => {
        pts.set(e.pointerId, [e.clientX, e.clientY]);
        if (pts.size === 1) { start = { x: e.clientX, y: e.clientY, v: { ...curView(svg, id) } }; moved = false; }
        if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), v: { ...curView(svg, id) }, c: toWorld((a[0] + b[0]) / 2, (a[1] + b[1]) / 2) }; }
      });
      svg.addEventListener('pointermove', (e) => {
        if (!pts.has(e.pointerId)) return;
        pts.set(e.pointerId, [e.clientX, e.clientY]);
        if (pts.size === 2 && pinch) {
          const [a, b] = [...pts.values()];
          const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
          const f = pinch.d / Math.max(10, d);
          const w = pinch.v.w * f, h = pinch.v.h * f;
          apply(svg, id, { x: pinch.c[0] - (pinch.c[0] - pinch.v.x) * f, y: pinch.c[1] - (pinch.c[1] - pinch.v.y) * f, w, h });
          moved = true; return;
        }
        if (!start) return;
        const dx = e.clientX - start.x, dy = e.clientY - start.y;
        if (!moved && Math.hypot(dx, dy) < 5) return;
        if (!moved) { try { svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
        moved = true;
        svg.classList.add('dragging');
        const s = toWorld(0, 0)[2];
        apply(svg, id, { ...start.v, x: start.v.x - dx / s, y: start.v.y - dy / s });
      });
      const end = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) { start = null; svg.classList.remove('dragging'); } };
      svg.addEventListener('pointerup', end);
      svg.addEventListener('pointercancel', end);
      svg.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
      svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const [wx, wy] = toWorld(e.clientX, e.clientY);
        const v = curView(svg, id);
        const f = e.deltaY > 0 ? 1.15 : 1 / 1.15;
        apply(svg, id, { x: wx - (wx - v.x) * f, y: wy - (wy - v.y) * f, w: v.w * f, h: v.h * f });
      }, { passive: false });
    });
  };
  B.afterRenderGlobal = B.afterRenderGlobal || [];
  B.afterRenderGlobal.push(M.bindAll);

  B.act.mapZoom = (arg) => {
    const [id, op, bid] = arg.split(':');
    const shell = document.querySelector(`.map-shell[data-map="${id}"]`);
    if (!shell) return;
    const svg = shell.querySelector('svg');
    const v = curView(svg, id);
    if (op === 'reset') { M.setView(id, null); delete B.vs['map:' + id]; shell._bound = false; fitAspect(shell, svg, id); shell._bound = true; return; }
    if (op === 'sel') { const b = B.data.building(bid); if (!b) return; const c = centroid(b.poly); const w = Math.min(v.w, 320); const h = w * (v.h / v.w); svg.style.transition = ''; apply(svg, id, { x: c[0] - w / 2, y: c[1] - h / 2, w, h }); return; }
    const f = op === 'in' ? 0.7 : 1 / 0.7;
    const cx = v.x + v.w / 2, cy = v.y + v.h / 2;
    apply(svg, id, { x: cx - (v.w * f) / 2, y: cy - (v.h * f) / 2, w: v.w * f, h: v.h * f });
  };
  M.centroid = centroid;
})();
