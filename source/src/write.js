// The couple's names, "written" in gold: each glyph's outline is traced by the pen, then the embossed
// gold fill flows in behind it. Everything is a pure function of progress, so any moment can be shown.
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

// shared gradient + emboss filter, defined once
export function goldDefs(host) {
  const svg = el('svg', { width: 0, height: 0, style: 'position:absolute', 'aria-hidden': 'true' }, host);
  svg.innerHTML = `<defs>
    <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff6d2"/><stop offset=".22" stop-color="#ffd877"/><stop offset=".48" stop-color="#e9a634"/>
      <stop offset=".62" stop-color="#b8741a"/><stop offset=".8" stop-color="#ffd36a"/><stop offset="1" stop-color="#fff0b0"/></linearGradient>
    <linearGradient id="gShine" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".5" stop-color="#fffbe8" stop-opacity=".95"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <filter id="fEmboss" x="-8%" y="-30%" width="116%" height="170%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="b"/>
      <feSpecularLighting in="b" surfaceScale="5" specularConstant="1.15" specularExponent="24" lighting-color="#fff3cf" result="s"><feDistantLight azimuth="225" elevation="52"/></feSpecularLighting>
      <feComposite in="s" in2="SourceAlpha" operator="in" result="sIn"/>
      <feComposite in="SourceGraphic" in2="sIn" operator="arithmetic" k1="0" k2="1" k3=".75" k4="0" result="lit"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="sh0"/><feOffset in="sh0" dy="5" result="sh1"/>
      <feFlood flood-color="#1d0205" flood-opacity=".85"/><feComposite in2="sh1" operator="in" result="shadow"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="gl0"/>
      <feFlood flood-color="#ffb43c" flood-opacity=".45"/><feComposite in2="gl0" operator="in" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="shadow"/><feMergeNode in="lit"/></feMerge>
    </filter></defs>`;
  return svg;
}

export function createName(host, data, label) {
  const [vx, vy, vw, vh] = data.vb;
  const svg = el('svg', { viewBox: `${vx} ${vy} ${vw} ${vh}`, class: 'name-svg', role: 'img', 'aria-label': label }, host);
  const uid = 'sh' + Math.random().toString(36).slice(2, 7);
  const defs = el('defs', {}, svg);
  const shineGrad = el('linearGradient', { id: uid, gradientUnits: 'userSpaceOnUse', x1: vx, y1: 0, x2: vx + vw * 0.35, y2: vh * 0.25 }, defs);
  [[0, 0], [0.4, 0], [0.5, 0.9], [0.6, 0], [1, 0]].forEach(([o, a]) => el('stop', { offset: o, 'stop-color': '#fffbe8', 'stop-opacity': a }, shineGrad));
  const gFill = el('g', { filter: 'url(#fEmboss)' }, svg);
  const gShine = el('g', { opacity: 0 }, svg);
  const gTrace = el('g', { fill: 'none', stroke: '#fff1c2', 'stroke-width': 2.2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
  const glyphs = data.glyphs.map((gd) => {
    const fill = el('path', { d: gd.d, fill: 'url(#gGold)', opacity: 0 }, gFill);
    el('path', { d: gd.d, fill: `url(#${uid})` }, gShine);
    const tr = el('path', { d: gd.d, opacity: 0 }, gTrace);
    const len = tr.getTotalLength();
    tr.setAttribute('stroke-dasharray', `${len} ${len}`); tr.setAttribute('stroke-dashoffset', len);
    return { fill, tr, len };
  });
  // each glyph gets time in proportion to its outline length (the flourished capitals take longer)
  const w = glyphs.map((g) => Math.pow(g.len, 0.8)), tot = w.reduce((a, b) => a + b, 0);
  let acc = 0; glyphs.forEach((g, i) => { g.a = acc / tot; acc += w[i]; g.b = acc / tot; });
  // pen path samples (in viewBox units) for the spark
  const samples = [];
  glyphs.forEach((g) => { const n = Math.max(12, Math.round(g.len / 14)); for (let k = 0; k <= n; k++) { const p = g.tr.getPointAtLength(g.len * k / n); samples.push([g.a + (g.b - g.a) * k / n, p.x, p.y]); } });
  let shown = -1;
  /** p: 0..1 writing progress; shine: -1..2 position of the light sweep (or null) */
  function set(p, shine = null) {
    const key = Math.round(p * 2000);
    if (key !== shown) {
      shown = key;
      for (const g of glyphs) {
        const lp = clamp((p - g.a) / (g.b - g.a));
        g.tr.setAttribute('stroke-dashoffset', (g.len * (1 - lp)).toFixed(1));
        // the traced line glows while drawing, then settles into the fill
        g.tr.setAttribute('opacity', lp <= 0 ? 0 : (lp < 1 ? 1 : clamp(1 - (p - g.b) * 6)).toFixed(3));
        g.fill.setAttribute('opacity', clamp((lp - 0.3) / 0.7).toFixed(3));
      }
    }
    if (shine === null) gShine.setAttribute('opacity', 0);
    else { gShine.setAttribute('opacity', 0.9); shineGrad.setAttribute('gradientTransform', `translate(${(shine * vw * 1.4 - vw * 0.4).toFixed(1)} 0)`); }
  }
  // pen point at progress p, in page px relative to `origin` (a DOMRect)
  function pen(p, origin) {
    let lo = 0, hi = samples.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (samples[m][0] <= p) lo = m; else hi = m; }
    const s = samples[lo];
    const m = svg.getScreenCTM(); if (!m) return null;
    return { x: m.a * s[1] + m.c * s[2] + m.e - origin.left, y: m.b * s[1] + m.d * s[2] + m.f - origin.top };
  }
  function box(origin) { const r = svg.getBoundingClientRect(); return { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height }; }
  return { svg, set, pen, box };
}

// a small gold heart traced between the names
export function createHeart(host) {
  const svg = el('svg', { viewBox: '-60 -54 120 108', class: 'heart-svg', 'aria-hidden': 'true' }, host);
  const d = 'M0 40 C-34 16 -52 -4 -44 -24 C-36 -44 -10 -44 0 -22 C10 -44 36 -44 44 -24 C52 -4 34 16 0 40 Z';
  const fill = el('path', { d, fill: 'url(#gGold)', filter: 'url(#fEmboss)', opacity: 0 }, svg);
  const tr = el('path', { d, fill: 'none', stroke: '#fff1c2', 'stroke-width': 3, opacity: 0 }, svg);
  const len = tr.getTotalLength(); tr.setAttribute('stroke-dasharray', `${len} ${len}`);
  function set(p) {
    tr.setAttribute('stroke-dashoffset', (len * (1 - clamp(p))).toFixed(1));
    tr.setAttribute('opacity', p <= 0 ? 0 : p < 1 ? 1 : 0.0);
    fill.setAttribute('opacity', clamp((p - 0.5) / 0.5).toFixed(3));
  }
  function pen(p, origin) {
    const pt = tr.getPointAtLength(len * clamp(p)), m = svg.getScreenCTM(); if (!m) return null;
    return { x: m.a * pt.x + m.c * pt.y + m.e - origin.left, y: m.b * pt.x + m.d * pt.y + m.f - origin.top };
  }
  return { svg, set, pen };
}
