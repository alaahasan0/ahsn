/*
 * BENA illustrations — generated SVG artwork (no external images).
 * Facades use Ramallah's white-limestone palette; offices get curtain walls.
 */
(function () {
  const B = (window.B = window.B || {});
  const A = (B.art = {});
  let gid = 0;
  const uid = (p) => `${p}${++gid}`;

  /** facade(seed, {type, floors, sky:'day'|'dusk'|'navy'}) → SVG (viewBox 400×300) */
  A.facade = (seed = 1, o = {}) => {
    const r = B.rng(seed * 97 + 13);
    const type = o.type || 'residential';
    const floors = Math.max(2, Math.min(o.floors || 6, 14));
    const sky = o.sky || 'day';
    const g1 = uid('sky'), g2 = uid('glass');
    const skyStops = sky === 'navy' ? ['#183448', '#142B3B'] : sky === 'dusk' ? ['#F6E7D6', '#DDE9F0'] : ['#E8F3EF', '#F7FAF9'];
    const stone = ['#EFE8DB', '#E8DFCF', '#F2ECE1', '#E4DACA'][Math.floor(r() * 4)];
    const stoneDark = '#D3C7B3';
    const bw = type === 'office' ? 170 : type === 'heritage' ? 190 : 150 + r() * 40;
    const fh = type === 'heritage' ? 38 : Math.min(26, 200 / floors);
    const bh = floors * fh + 18;
    const bx = 200 - bw / 2 + (r() - 0.5) * 30, by = 262 - bh;
    let s = `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><linearGradient id="${g1}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skyStops[0]}"/><stop offset="1" stop-color="${skyStops[1]}"/></linearGradient>
      <linearGradient id="${g2}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9FB8C9"/><stop offset=".55" stop-color="#5E7F96"/><stop offset="1" stop-color="#2F4C61"/></linearGradient></defs>
      <rect width="400" height="300" fill="url(#${g1})"/>`;
    // hills
    s += `<path d="M0 210 C60 180 110 196 160 182 S260 160 310 178 S380 172 400 168 V300 H0Z" fill="${sky === 'navy' ? '#1D3B50' : '#DCE8E2'}"/>`;
    s += `<path d="M0 236 C80 214 140 228 210 218 S330 206 400 214 V300 H0Z" fill="${sky === 'navy' ? '#21425A' : '#D2E1DA'}"/>`;
    // background buildings
    for (let i = 0; i < 5; i++) {
      const w = 34 + r() * 30, h = 50 + r() * 80, x = r() * 380 - 10;
      s += `<rect x="${x}" y="${250 - h}" width="${w}" height="${h}" fill="${sky === 'navy' ? '#27506A' : '#E3E9E6'}" rx="2"/>`;
    }
    // shadow
    s += `<rect x="${bx + 10}" y="${by + 8}" width="${bw}" height="${bh}" fill="rgba(20,43,59,.10)" rx="3"/>`;
    if (type === 'office') {
      s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#${g2})" rx="3"/>`;
      for (let f = 0; f < floors; f++) s += `<rect x="${bx}" y="${by + 14 + f * fh}" width="${bw}" height="2" fill="rgba(255,255,255,.35)"/>`;
      for (let c = 1; c < 6; c++) s += `<rect x="${bx + (bw / 6) * c}" y="${by + 14}" width="1.4" height="${bh - 14}" fill="rgba(255,255,255,.22)"/>`;
      s += `<rect x="${bx}" y="${by}" width="${bw}" height="14" fill="#142B3B" rx="3"/><rect x="${bx + 12}" y="${by + 5}" width="40" height="4" rx="2" fill="#36D6A0"/>`;
      s += `<path d="M${bx + bw * .55} ${by + 14} L${bx + bw} ${by + 14} L${bx + bw} ${by + bh * .55}Z" fill="rgba(255,255,255,.14)"/>`;
    } else {
      s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${stone}" rx="3"/>`;
      // stone coursing
      for (let y = by + 6; y < by + bh; y += 6) s += `<line x1="${bx}" x2="${bx + bw}" y1="${y}" y2="${y}" stroke="${stoneDark}" stroke-width=".35" opacity=".6"/>`;
      s += `<rect x="${bx - 4}" y="${by - 4}" width="${bw + 8}" height="6" fill="${stoneDark}" rx="1.5"/>`;
      const cols = type === 'heritage' ? 3 : Math.max(3, Math.round(bw / 34));
      const cw = bw / cols;
      for (let f = 0; f < floors; f++) {
        const fy = by + 10 + f * fh;
        for (let c = 0; c < cols; c++) {
          const wx = bx + c * cw + cw * 0.22, ww = cw * 0.56, wh = fh * (type === 'heritage' ? 0.62 : 0.58);
          const lit = r() < (sky === 'navy' ? 0.45 : 0.12);
          if (type === 'heritage') {
            s += `<path d="M${wx} ${fy + wh} V${fy + wh * 0.35} a${ww / 2} ${ww / 2} 0 0 1 ${ww} 0 V${fy + wh}Z" fill="${lit ? '#F6E2A8' : '#3E5A6E'}"/>`;
          } else {
            s += `<rect x="${wx}" y="${fy}" width="${ww}" height="${wh}" fill="${lit ? '#F6E2A8' : '#46657A'}" rx="1.2"/>`;
            s += `<rect x="${wx}" y="${fy}" width="${ww * 0.45}" height="${wh}" fill="rgba(255,255,255,.12)"/>`;
          }
        }
        if ((type === 'residential' || type === 'mixed') && f % 1 === 0 && f < floors - (type === 'mixed' ? 2 : 0)) {
          s += `<rect x="${bx + 2}" y="${fy + fh * 0.6}" width="${bw - 4}" height="2.2" fill="${stoneDark}"/>`;
          s += `<rect x="${bx + 2}" y="${fy + fh * 0.6 - 5}" width="${bw - 4}" height="5" fill="none" stroke="#9DAAB3" stroke-width=".6" opacity=".55"/>`;
        }
      }
      if (type === 'mixed' || type === 'commercial') {
        s += `<rect x="${bx}" y="${by + bh - 26}" width="${bw}" height="26" fill="#142B3B"/>`;
        for (let c = 0; c < 4; c++) s += `<rect x="${bx + 6 + c * (bw - 12) / 4}" y="${by + bh - 21}" width="${(bw - 12) / 4 - 6}" height="18" fill="${c === 1 ? '#36D6A0' : '#5E7F96'}" opacity="${c === 1 ? .9 : .8}" rx="1"/>`;
      } else {
        s += `<rect x="${bx + bw / 2 - 12}" y="${by + bh - 22}" width="24" height="22" fill="#142B3B" rx="2"/><rect x="${bx + bw / 2 - 2}" y="${by + bh - 22}" width="1.2" height="22" fill="#36D6A0"/>`;
      }
      // rooftop tanks & solar
      for (let t = 0; t < 3; t++) s += `<rect x="${bx + 14 + t * 14}" y="${by - 14}" width="10" height="10" rx="2" fill="${t === 1 ? '#C4CDD2' : '#2A2F33'}" opacity=".85"/>`;
      s += `<path d="M${bx + bw - 60} ${by - 4} l12 -10 h36 l-12 10z" fill="#2F4C61" opacity=".85"/>`;
    }
    // olive trees
    const tree = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><rect x="-1.5" y="-4" width="3" height="16" fill="#7D6A55"/><ellipse cx="0" cy="-10" rx="15" ry="10" fill="#8FA97F"/><ellipse cx="-6" cy="-13" rx="8" ry="6" fill="#9DB78C"/></g>`;
    s += tree(bx - 22, 262, 1) + tree(bx + bw + 24, 264, 0.85);
    s += `<rect x="0" y="262" width="400" height="38" fill="${sky === 'navy' ? '#0D1F2B' : '#E7ECEA'}"/><rect x="0" y="262" width="400" height="2" fill="${sky === 'navy' ? '#36D6A0' : '#D2DAD6'}" opacity="${sky === 'navy' ? .5 : 1}"/>`;
    s += '</svg>';
    return s;
  };

  /** Interior view (living room) for listing galleries. */
  A.interior = (seed = 1) => {
    const r = B.rng(seed * 31 + 7);
    const wall = ['#F4EFE7', '#EEF2EF', '#F1ECE4'][Math.floor(r() * 3)];
    const sofa = ['#7FA7C2', '#C9A27A', '#8FA97F', '#142B3B'][Math.floor(r() * 4)];
    return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="400" height="300" fill="${wall}"/><path d="M0 220 L400 220 L400 300 L0 300Z" fill="#D9CCB8"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<line x1="${i * 60 - 40}" y1="300" x2="${i * 50}" y2="220" stroke="#CDBFA9" stroke-width="1"/>`).join('')}
      <rect x="230" y="50" width="130" height="130" fill="#DCEAF0" stroke="#FFFFFF" stroke-width="6"/><line x1="295" y1="50" x2="295" y2="180" stroke="#fff" stroke-width="4"/>
      <path d="M230 150 C260 128 290 140 320 120 S350 118 360 112 V180 H230Z" fill="#BFD7C8"/>
      <rect x="236" y="56" width="20" height="118" fill="#E8DCC8" opacity=".9"/>
      <rect x="40" y="170" width="170" height="40" rx="10" fill="${sofa}"/><rect x="34" y="150" width="182" height="34" rx="12" fill="${sofa}" opacity=".85"/>
      <rect x="52" y="160" width="40" height="22" rx="6" fill="#F6E2A8"/><rect x="40" y="210" width="8" height="10" fill="#5A4A3A"/><rect x="200" y="210" width="8" height="10" fill="#5A4A3A"/>
      <ellipse cx="290" cy="236" rx="56" ry="10" fill="#C5B49B"/><rect x="250" y="212" width="80" height="8" rx="4" fill="#8C7660"/>
      <rect x="66" y="70" width="80" height="56" fill="#fff" stroke="#E2D8C8" stroke-width="3"/><path d="M72 120 L96 92 L112 108 L124 96 L140 120Z" fill="#9FE5CA"/>
      <circle cx="370" cy="214" r="12" fill="#8FA97F"/><rect x="364" y="214" width="12" height="20" rx="3" fill="#C9A27A"/>
    </svg>`;
  };

  /** Simple floor plan drawing. */
  A.floorplan = (seed = 1) => {
    const r = B.rng(seed * 53 + 3);
    const sx = 140 + r() * 30;
    return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="400" height="300" fill="#F8FAF9"/>
      <g fill="none" stroke="#142B3B" stroke-width="5" stroke-linecap="square">
        <rect x="40" y="40" width="320" height="220"/><line x1="${sx}" y1="40" x2="${sx}" y2="150"/><line x1="40" y1="150" x2="${sx + 40}" y2="150"/>
        <line x1="260" y1="40" x2="260" y2="130"/><line x1="260" y1="130" x2="360" y2="130"/><line x1="${sx + 90}" y1="150" x2="${sx + 90}" y2="260"/>
      </g>
      <g fill="#F8FAF9"><rect x="${sx - 2}" y="90" width="9" height="30"/><rect x="${sx + 6}" y="146" width="28" height="9"/><rect x="256" y="70" width="9" height="30"/><rect x="${sx + 86}" y="190" width="9" height="30"/></g>
      <g font-family="Inter, sans-serif" font-size="11" fill="#55667A" text-anchor="middle">
        <text x="${(40 + sx) / 2}" y="98">${B.L('Bedroom', 'غرفة نوم')}</text><text x="${(sx + 260) / 2}" y="98">${B.L('Bedroom', 'غرفة نوم')}</text>
        <text x="310" y="88">${B.L('Bath', 'حمّام')}</text><text x="${(40 + sx + 90) / 2}" y="210">${B.L('Living', 'المعيشة')}</text><text x="${(sx + 90 + 360) / 2}" y="200">${B.L('Kitchen', 'المطبخ')}</text>
      </g>
      <rect x="44" y="44" width="${sx - 48}" height="102" fill="#36D6A0" opacity=".08"/>
      <g stroke="#36D6A0" stroke-width="1.2"><line x1="40" y1="276" x2="360" y2="276"/><line x1="40" y1="270" x2="40" y2="282"/><line x1="360" y1="270" x2="360" y2="282"/></g>
      <text x="200" y="292" font-family="Inter, sans-serif" font-size="10" fill="#0B8A60" text-anchor="middle">${Math.round(10 + r() * 4)}.${Math.floor(r() * 9)} m</text>
    </svg>`;
  };

  /** Welcome-screen backdrop: hills, a stone skyline and a mesh of connected nodes. */
  A.skyline = () => {
    const r = B.rng(42);
    let blds = '';
    let x = -10;
    while (x < 1440) {
      const w = 40 + r() * 70, h = 60 + r() * 220;
      const y = 700 - h - (Math.sin(x / 260) * 40 + 60);
      blds += `<rect x="${x}" y="${y}" width="${w}" height="${h + 200}" fill="#1B3A4E" stroke="#21455C" stroke-width="1"/>`;
      for (let fy = y + 10; fy < y + h - 6; fy += 16) for (let fx = x + 8; fx < x + w - 10; fx += 14) if (r() < 0.16) blds += `<rect x="${fx}" y="${fy}" width="6" height="8" fill="${r() < 0.35 ? '#36D6A0' : '#2E5670'}" opacity="${r() < 0.35 ? .85 : .9}"/>`;
      x += w + 4 + r() * 14;
    }
    const nodes = [];
    for (let i = 0; i < 26; i++) nodes.push([60 + r() * 1320, 80 + r() * 420]);
    let lines = '';
    nodes.forEach((a, i) => nodes.forEach((b, j) => { if (j > i && Math.hypot(a[0] - b[0], a[1] - b[1]) < 230) lines += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#36D6A0" stroke-opacity=".16" stroke-width="1"/>`; }));
    const dots = nodes.map((n, i) => `<circle cx="${n[0]}" cy="${n[1]}" r="${i % 5 === 0 ? 3.5 : 2}" fill="#36D6A0" opacity="${i % 5 === 0 ? .9 : .5}"/>`).join('');
    return `<svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 640 C220 560 420 620 640 560 S1040 520 1440 580 V900 H0Z" fill="#183448"/>${lines}${dots}<g opacity=".9">${blds}</g>
      <path d="M0 820 C300 780 520 810 760 790 S1200 770 1440 800 V900 H0Z" fill="#0F2331"/></svg>`;
  };

  /** Decorative QR-like identity code. */
  A.qr = (seed = 1) => {
    const r = B.rng(seed * 7 + 1);
    let s = '';
    const n = 21;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const finder = (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8);
      if (finder) continue;
      if (r() < 0.48) s += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
    const f = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="none" stroke="#142B3B" stroke-width="1" transform="translate(.5 .5) scale(.857)" /><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
    return `<svg viewBox="0 0 21 21" shape-rendering="crispEdges" fill="#142B3B" aria-hidden="true">${s}${f(0, 0)}${f(14, 0)}${f(0, 14)}</svg>`;
  };

  /** Banner art: abstract floor stack + nodes (used in page banners). */
  A.banner = () => `<svg viewBox="0 0 400 240" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${170 + i * 6}" y="${40 + i * 30}" width="${180 - i * 12}" height="24" rx="5" fill="none" stroke="#36D6A0" stroke-opacity="${0.25 + i * 0.1}" stroke-width="1.5"/>`).join('')}
    <circle cx="120" cy="70" r="5" fill="#36D6A0"/><circle cx="80" cy="160" r="4" fill="#36D6A0" opacity=".6"/><circle cx="150" cy="200" r="3" fill="#36D6A0" opacity=".5"/>
    <path d="M120 70 L230 100 M80 160 L200 160 M150 200 L220 190" stroke="#36D6A0" stroke-opacity=".35"/></svg>`;
})();
