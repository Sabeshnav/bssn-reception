// The invitation on olai suvadi (palm-leaf manuscript), driven by scroll:
//   closed bundle between carved rosewood covers, tied with a red cord
//   -> the cord loosens, the covers part, the leaves fan out
//   -> an iron stylus etches the Tamil invitation line by line, ink settling into the scratches
//   -> a gold "சுபம்" seal is pressed at the end.
// Leaves, covers and the cord are painted procedurally on canvas; the text is real, selectable HTML.
import { rng } from './backdrop.js';
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const span = (t, a, b) => clamp((t - a) / (b - a));
const io = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const out3 = (x) => 1 - Math.pow(1 - clamp(x), 3);
const canvasOf = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };

// ---------- palm leaf: tapered ends, lengthwise fibres, age spots, burnt edges, two binding holes ----------
function leafPath(g, w, h) {
  const e = Math.min(h * 0.9, w * 0.06);         // length of the rounded, slightly pointed ends
  g.beginPath();
  g.moveTo(e, 0); g.lineTo(w - e, 0);
  g.bezierCurveTo(w - e * 0.35, 0, w, h * 0.3, w, h * 0.5);
  g.bezierCurveTo(w, h * 0.7, w - e * 0.35, h, w - e, h);
  g.lineTo(e, h);
  g.bezierCurveTo(e * 0.35, h, 0, h * 0.7, 0, h * 0.5);
  g.bezierCurveTo(0, h * 0.3, e * 0.35, 0, e, 0); g.closePath();
}
export const HOLES = [0.085, 0.915];
function paintLeaf(w, h, dpr, seed) {
  const W = Math.round(w * dpr), H = Math.round(h * dpr), c = canvasOf(W, H), g = c.getContext('2d'), r = rng(seed * 97 + 5);
  g.scale(dpr, dpr);
  leafPath(g, w, h); g.save(); g.clip();
  // base: sun-aged palm, lighter through the middle
  let gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#c9984f'); gr.addColorStop(0.18, '#e2bf7c'); gr.addColorStop(0.5, '#efd49a'); gr.addColorStop(0.82, '#ddb671'); gr.addColorStop(1, '#bf8c45');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  gr = g.createLinearGradient(0, 0, w, 0);
  gr.addColorStop(0, 'rgba(120,70,20,.25)'); gr.addColorStop(0.12, 'rgba(120,70,20,0)'); gr.addColorStop(0.5, 'rgba(255,240,200,.08)'); gr.addColorStop(0.88, 'rgba(120,70,20,0)'); gr.addColorStop(1, 'rgba(120,70,20,.28)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  // lengthwise fibres
  for (let i = 0; i < Math.round(h * 2.2); i++) {
    const y = r() * h, dark = r() < 0.55;
    g.strokeStyle = dark ? `rgba(110,62,18,${(0.05 + r() * 0.1).toFixed(3)})` : `rgba(255,244,214,${(0.06 + r() * 0.12).toFixed(3)})`;
    g.lineWidth = 0.4 + r() * 0.9;
    const x0 = r() * w * 0.3, x1 = w - r() * w * 0.3, wob = (r() - 0.5) * 1.6;
    g.beginPath(); g.moveTo(x0, y); g.bezierCurveTo(x0 + (x1 - x0) * 0.33, y + wob, x0 + (x1 - x0) * 0.66, y - wob, x1, y + wob * 0.5); g.stroke();
  }
  // the leaf's parallel veins (a few stronger lines)
  for (let k = 1; k < 4; k++) { const y = h * k / 4 + (r() - 0.5) * 3; g.strokeStyle = 'rgba(140,86,30,.14)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (r() - 0.5) * 2); g.stroke(); }
  // age spots and water marks
  for (let i = 0; i < 10 + w / 90; i++) {
    const x = r() * w, y = r() * h, rad = 4 + r() * Math.min(28, h * 0.5);
    gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, `rgba(120,64,16,${(0.05 + r() * 0.1).toFixed(3)})`); gr.addColorStop(0.7, `rgba(120,64,16,${(0.02 + r() * 0.04).toFixed(3)})`); gr.addColorStop(1, 'rgba(120,64,16,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill();
  }
  // soft lacquer sheen
  gr = g.createLinearGradient(0, 0, w * 0.6, h * 2.5);
  gr.addColorStop(0, 'rgba(255,250,230,0)'); gr.addColorStop(0.45, 'rgba(255,250,230,.13)'); gr.addColorStop(0.55, 'rgba(255,250,230,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.restore();
  // burnt, worn edges
  g.save(); leafPath(g, w, h); g.clip();
  g.shadowColor = 'rgba(90,40,5,.85)'; g.shadowBlur = 7; g.lineWidth = 6; g.strokeStyle = 'rgba(110,55,10,.7)'; leafPath(g, w, h); g.stroke();
  g.restore();
  g.lineWidth = 1; g.strokeStyle = 'rgba(80,38,6,.75)'; leafPath(g, w, h); g.stroke();
  // little nicks along the edges
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < w / 60; i++) { const x = w * (0.08 + r() * 0.84), top = r() < 0.5; g.beginPath(); g.ellipse(x, top ? 0 : h, 1 + r() * 3, 0.8 + r() * 1.6, 0, 0, TAU); g.fill(); }
  // binding holes, punched through (the cord behind shows through them)
  const hr = Math.min(7, h * 0.11);
  for (const fx of HOLES) { g.beginPath(); g.arc(w * fx, h / 2, hr, 0, TAU); g.fill(); }
  g.globalCompositeOperation = 'source-over';
  for (const fx of HOLES) {
    gr = g.createRadialGradient(w * fx, h / 2, hr, w * fx, h / 2, hr * 2.4);
    gr.addColorStop(0, 'rgba(70,30,4,.75)'); gr.addColorStop(1, 'rgba(70,30,4,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(w * fx, h / 2, hr * 2.4, 0, TAU); g.arc(w * fx, h / 2, hr, 0, TAU, true); g.fill();
  }
  return c;
}

// ---------- rosewood cover: grain, carved border, brass studs and a brass "உ" plate ----------
function paintCover(w, h, dpr, seed, top) {
  const W = Math.round(w * dpr), H = Math.round(h * dpr), c = canvasOf(W, H), g = c.getContext('2d'), r = rng(seed);
  g.scale(dpr, dpr);
  const rr = Math.min(16, h * 0.25);
  const shape = () => { g.beginPath(); g.moveTo(rr, 0); g.lineTo(w - rr, 0); g.quadraticCurveTo(w, 0, w, rr); g.lineTo(w, h - rr); g.quadraticCurveTo(w, h, w - rr, h); g.lineTo(rr, h); g.quadraticCurveTo(0, h, 0, h - rr); g.lineTo(0, rr); g.quadraticCurveTo(0, 0, rr, 0); g.closePath(); };
  shape(); g.save(); g.clip();
  let gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5a2a12'); gr.addColorStop(0.5, '#3c1a0a'); gr.addColorStop(1, '#2a1006');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  // wood grain: long wavy lines with knots
  for (let i = 0; i < h * 1.6; i++) {
    const y = r() * h, a = 0.05 + r() * 0.12, light = r() < 0.5;
    g.strokeStyle = light ? `rgba(160,90,45,${a.toFixed(3)})` : `rgba(15,5,0,${(a * 1.5).toFixed(3)})`; g.lineWidth = 0.5 + r() * 1.4;
    g.beginPath(); for (let x = 0; x <= w; x += 20) { const yy = y + Math.sin(x / (60 + r() * 40) + i) * 1.6; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke();
  }
  for (let k = 0; k < 2; k++) { const x = w * (0.25 + r() * 0.5), y = h * (0.3 + r() * 0.4);
    for (let j = 1; j < 6; j++) { g.strokeStyle = `rgba(20,6,0,${(0.25 - j * 0.03).toFixed(3)})`; g.lineWidth = 0.8; g.beginPath(); g.ellipse(x, y, j * 6, j * 2, 0, 0, TAU); g.stroke(); } }
  // polish highlight
  gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,220,180,.18)'); gr.addColorStop(0.3, 'rgba(255,220,180,0)'); gr.addColorStop(1, 'rgba(0,0,0,.25)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.restore();
  // carved border: a recessed groove with a gold inlay line
  const ins = Math.min(10, h * 0.14);
  g.strokeStyle = 'rgba(10,3,0,.7)'; g.lineWidth = 2.4; g.strokeRect(ins, ins, w - ins * 2, h - ins * 2);
  g.strokeStyle = 'rgba(214,160,74,.85)'; g.lineWidth = 1; g.strokeRect(ins + 1.5, ins + 1.5, w - ins * 2 - 3, h - ins * 2 - 3);
  // carved diamonds along the border
  g.fillStyle = 'rgba(214,160,74,.55)';
  for (let x = ins + 18; x < w - ins - 10; x += 22) for (const y of [ins + 1.5, h - ins - 1.5]) { g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillRect(-1.6, -1.6, 3.2, 3.2); g.restore(); }
  // brass studs over the binding holes and at the corners
  const stud = (x, y, s) => { const sg = g.createRadialGradient(x - s * 0.3, y - s * 0.3, 0, x, y, s);
    sg.addColorStop(0, '#fff2b8'); sg.addColorStop(0.4, '#e0a63a'); sg.addColorStop(1, '#6a3f08'); g.fillStyle = sg; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(60,30,0,.6)'; g.lineWidth = 0.8; g.stroke(); };
  for (const fx of HOLES) stud(w * fx, h / 2, Math.min(9, h * 0.14));
  for (const [x, y] of [[ins + 8, ins + 8], [w - ins - 8, ins + 8], [ins + 8, h - ins - 8], [w - ins - 8, h - ins - 8]]) stud(x, y, 3.4);
  // brass plate with "உ" on the top cover
  if (top) {
    const pw = Math.min(150, w * 0.26), ph = Math.min(44, h * 0.5), px = w / 2 - pw / 2, py = h / 2 - ph / 2;
    gr = g.createLinearGradient(0, py, 0, py + ph); gr.addColorStop(0, '#fff0b0'); gr.addColorStop(0.45, '#d9a03a'); gr.addColorStop(0.55, '#b07420'); gr.addColorStop(1, '#f0c868');
    g.fillStyle = gr; g.beginPath(); g.ellipse(w / 2, h / 2, pw / 2, ph / 2, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(70,35,0,.7)'; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = '#5a2a08'; g.font = `700 ${Math.round(ph * 0.62)}px "Arima","Noto Serif Tamil",serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('உ', w / 2, h / 2 + ph * 0.04);
    g.fillStyle = 'rgba(255,250,220,.5)'; g.fillText('உ', w / 2, h / 2 + ph * 0.04 - 1);
    g.fillStyle = '#4a2006'; g.fillText('உ', w / 2, h / 2 + ph * 0.04);
  }
  return c;
}

// ---------- split every .wr block into visual lines, so each line can be etched left to right ----------
function splitLines(el) {
  if (!el.dataset.src) el.dataset.src = el.innerHTML;
  el.innerHTML = el.dataset.src;
  // wrap words (keeping inline markup like <b>) in spans
  const words = [];
  const walk = (node) => {
    for (const n of [...node.childNodes]) {
      if (n.nodeType === 3) {
        const parts = n.textContent.split(/(\s+)/); const frag = document.createDocumentFragment();
        for (const p of parts) { if (!p) continue; if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); continue; }
          const s = document.createElement('span'); s.className = 'ow'; s.textContent = p; frag.appendChild(s); words.push(s); }
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    }
  };
  walk(el);
  // group by line
  const lines = []; let top = null;
  for (const w of words) { const t = Math.round(w.offsetTop); if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; } lines[lines.length - 1].push(w); }
  // rebuild: one block per visual line, keeping each word's wrapper (and its <b> parent styling)
  const out = lines.map((ws) => {
    const vl = document.createElement('span'); vl.className = 'vl'; const vt = document.createElement('span'); vt.className = 'vt'; vl.appendChild(vt);
    ws.forEach((w, i) => { const b = w.parentElement !== el && w.parentElement.tagName === 'B'; const node = b ? Object.assign(document.createElement('b'), { textContent: w.textContent }) : document.createTextNode(w.textContent); vt.appendChild(node); if (i < ws.length - 1) vt.appendChild(document.createTextNode(' ')); });
    return vl;
  });
  el.innerHTML = ''; out.forEach((l) => el.appendChild(l));
  return out.map((l) => l.firstChild);
}

export function createOlai(section) {
  const stage = section.querySelector('.ol-stage');
  const stack = section.querySelector('.ol-stack');
  const leaves = [...section.querySelectorAll('.leaf')];
  const covers = [section.querySelector('.cover.top'), section.querySelector('.cover.bottom')];
  const cordSvg = section.querySelector('.cord.back'), wrapSvg = section.querySelector('.cord.front');
  const stylus = section.querySelector('.stylus');
  const seal = section.querySelector('.seal');
  const heads = [...section.querySelectorAll('.ol-head > *')];
  const eng = section.querySelector('.ol-en');
    let lines = [], home = [], W = 0, H = 0, coverH = 0, stackShift = 0, closedY = 0, fitScale = 1;

  function layout() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = stage.clientWidth; H = stage.clientHeight;
    // reset transforms to measure the natural (open) layout
    leaves.forEach((l) => { l.style.transform = 'none'; });
    stack.style.transform = 'none';
    lines = [];
    leaves.forEach((l) => l.querySelectorAll('.wr').forEach((el) => { splitLines(el).forEach((vt) => lines.push({ vt, leaf: l })); }));
    // paint each leaf's texture at its size
    leaves.forEach((l, i) => {
      const cv = l.querySelector('canvas.tex'); const w = l.offsetWidth, h = l.offsetHeight;
      const t = paintLeaf(w, h, dpr, i + 1); cv.width = t.width; cv.height = t.height; cv.getContext('2d').drawImage(t, 0, 0);
    });
    const sr = stack.getBoundingClientRect(), stR = stage.getBoundingClientRect();
    home = leaves.map((l) => ({ top: l.offsetTop, h: l.offsetHeight }));
    const stackH = stack.offsetHeight;
    coverH = Math.round(clamp(stack.offsetWidth / 7.2, 64, 132));
    covers.forEach((c, i) => {
      const w = stack.offsetWidth * 1.03, cv = c.querySelector('canvas');
      const t = paintCover(w, coverH, dpr, 11 + i, i === 0); cv.width = t.width; cv.height = t.height; cv.getContext('2d').drawImage(t, 0, 0);
      c.style.width = w + 'px'; c.style.height = coverH + 'px';
    });
    closedY = H * 0.52 - (sr.top - stR.top);                    // the bundle sits closed in the middle of the screen
    // if the open stack is taller than the space, scroll it within the stage as the writing advances
    const avail = H - (sr.top - stR.top) - Math.max(24, H * 0.04);
    stackShift = Math.max(0, stackH - avail);
    fitScale = Math.min(1, avail / stackH); if (fitScale < 0.7) fitScale = 1;   // too small to read: keep the scrolled view instead
    // line weights for the writing timeline
    let tot = 0; lines.forEach((ln) => { ln.wt = Math.max(4, ln.vt.textContent.length); tot += ln.wt; });
    let acc = 0; lines.forEach((ln) => { ln.a = acc / tot; acc += ln.wt; ln.b = acc / tot; });
    for (const sv of [cordSvg, wrapSvg]) { sv.setAttribute('viewBox', `0 0 ${stack.offsetWidth} ${stackH}`); sv.style.width = stack.offsetWidth + 'px'; sv.style.height = stackH + 'px'; }
    buildCord();
    render(lastP, true);
  }

  // cord: strings behind the leaves through both holes, plus the wrap and knot of the closed bundle
  let cordParts = null;
  function buildCord() {
    const w = stack.offsetWidth, h = stack.offsetHeight, NS = 'http://www.w3.org/2000/svg';
    cordSvg.innerHTML = ''; wrapSvg.innerHTML = '';
    const mk = (d, cls, front) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('class', cls); (front ? wrapSvg : cordSvg).appendChild(p); return p; };
    const strings = HOLES.map((fx) => {
      const x = w * fx, y0 = home[0].top + home[0].h / 2, y1 = home[home.length - 1].top + home[home.length - 1].h / 2;
      const d = `M${x} ${y0} L${x} ${y1}`;
      return [mk(d, 'c-base'), mk(d, 'c-twist')];
    });
    // tassel hanging from the last hole of the open stack
    const lx = w * HOLES[1], ly = home[home.length - 1].top + home[home.length - 1].h / 2;
    const td = `M${lx} ${ly} C${lx + 16} ${ly + 30} ${lx + 2} ${ly + 52} ${lx + 12} ${ly + 74}`;
    const tassel = [mk(td, 'c-base', 1), mk(td, 'c-twist', 1), mk(`M${lx - 7} ${ly} a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0`, 'c-bead', 1), mk(`M${lx + 6} ${ly + 74} h12 l-2 7 h-8 z`, 'c-cap', 1)];
    const fringe = []; for (let i = 0; i < 11; i++) fringe.push(mk(`M${lx + 12} ${ly + 80} l${((i - 5) * 1.5).toFixed(1)} 30`, 'c-fringe', 1));
    // the wrap around the closed bundle (drawn around the closed position, centred)
    const cy = closedY, hh = coverH * 0.5 + 6;
    const wraps = HOLES.map((fx) => { const x = w * fx; return mk(`M${x - 10} ${cy - hh} C${x - 26} ${cy} ${x - 26} ${cy} ${x - 10} ${cy + hh} M${x + 10} ${cy - hh} C${x + 26} ${cy} ${x + 26} ${cy} ${x + 10} ${cy + hh}`, 'c-wrap', 1); });
    const knot = mk(`M${w * 0.5 - 18} ${cy + hh} c8 -12 28 -12 36 0 c-8 12 -28 12 -36 0 M${w * 0.5} ${cy + hh} c-6 18 -2 34 -10 52 M${w * 0.5} ${cy + hh} c6 18 2 34 10 52`, 'c-wrap', 1);
    const band = mk(`M${w * HOLES[0]} ${cy + hh} L${w * HOLES[1]} ${cy + hh}`, 'c-wrap', 1);
    cordParts = { strings, tassel, fringe, wraps, knot, band };
    [...wraps, knot, band].forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = `${L} ${L}`; p.dataset.len = L; });
  }

  let lastP = -1;
  function render(p, force = false) {
    if (!force && Math.abs(p - lastP) < 0.0004) return;
    lastP = p;
    const open = io(span(p, 0.1, 0.27)), untie = span(p, 0.04, 0.14);
    // headings
    heads.forEach((h, i) => { const k = out3(span(p, 0.0 + i * 0.02, 0.07 + i * 0.02)); h.style.opacity = k; h.style.transform = `translateY(${(14 * (1 - k)).toFixed(1)}px)`; });
    // leaves: from stacked-in-the-bundle to their places, with a little fan rotation as they settle
    const hc = coverH;
    leaves.forEach((l, i) => {
      const hm = home[i]; if (!hm) return;
      const k = io(span(p, 0.12 + i * 0.02, 0.27 + i * 0.02));
      const dyClosed = closedY - (hm.top + hm.h / 2) + (i - (leaves.length - 1) / 2) * 2.5;
      const sy = (hc * 0.82 / hm.h) * (1 - k) + k;
      const rot = (1 - k) * 0 + Math.sin(k * Math.PI) * (i % 2 ? 1.6 : -1.6);
      l.style.transform = `translateY(${(dyClosed * (1 - k)).toFixed(2)}px) scaleY(${sy.toFixed(4)}) rotate(${rot.toFixed(2)}deg)`;
      l.style.zIndex = 10 - i;
      l.style.setProperty('--ink', k.toFixed(3));
    });
    // covers part: top lifts up and away, bottom drops
    const top = covers[0], bot = covers[1];
    top.style.transform = `translate(-50%, ${(closedY - hc / 2 - open * (H * 0.6)).toFixed(1)}px) rotate(${(-open * 9).toFixed(2)}deg)`;
    top.style.opacity = (1 - span(p, 0.2, 0.27)).toFixed(3);
    bot.style.transform = `translate(-50%, ${(closedY - hc / 2 + 6 + open * (H * 0.6)).toFixed(1)}px) rotate(${(open * 7).toFixed(2)}deg)`;
    bot.style.opacity = (1 - span(p, 0.2, 0.27)).toFixed(3);
    // cord: the wrap unwinds, then the strings through the holes appear once the leaves are apart
    if (cordParts) {
      [...cordParts.wraps, cordParts.knot, cordParts.band].forEach((q) => { q.style.strokeDashoffset = (+q.dataset.len * untie).toFixed(1); q.style.opacity = (1 - span(p, 0.12, 0.16)).toFixed(3); });
      const sOp = out3(span(p, 0.22, 0.3)).toFixed(3);
      [...cordParts.strings.flat(), ...cordParts.tassel, ...cordParts.fringe].forEach((q) => { q.style.opacity = sOp; });
    }
    // writing: each visual line etched left to right
    const wp = span(p, 0.28, 0.9);
    let cur = null;
    for (const ln of lines) {
      const k = clamp((wp - ln.a) / (ln.b - ln.a));
      ln.vt.style.clipPath = k >= 1 ? 'none' : `inset(-30% ${((1 - k) * 100).toFixed(2)}% -30% 0)`;
      ln.vt.style.setProperty('--fresh', k > 0 && k < 1 ? 1 : 0);
      if (k > 0 && k < 1) cur = { ln, k };
    }
    // keep the line being written in view on short screens
    const sh = stackShift * io(span(wp, 0.15, 0.95));
    const zo = io(span(p, 0.92, 0.99)), fit = fitScale;
    const sc = 1 - (1 - fit) * zo;
    const keep = fitScale === 1 ? 1 : 1 - zo;                    // when not zooming out, stay scrolled to the end
    stack.style.transform = `translateY(${(-sh * keep).toFixed(1)}px) scale(${sc.toFixed(4)})`;
    const hk = clamp(1 - (sh * keep) / 40);
    heads.forEach((h) => { h.style.opacity = Math.min(+h.style.opacity, hk); });
    // the stylus rides the edge of the line being etched
    if (cur) {
      const r = cur.ln.vt.getBoundingClientRect(), s = stage.getBoundingClientRect();
      const x = r.left - s.left + r.width * cur.k, y = r.top - s.top + r.height * 0.62;
      const jig = Math.sin(performance.now() / 38) * 1.2;
      stylus.style.opacity = 1; stylus.style.transform = `translate(${x.toFixed(1)}px, ${(y + jig).toFixed(1)}px)`;
    } else stylus.style.opacity = 0;
    // seal + english summary
    const sk = span(p, 0.9, 0.95);
    seal.style.opacity = sk > 0 ? 1 : 0; seal.style.transform = `scale(${(1.8 - 0.8 * out3(sk)).toFixed(3)}) rotate(${(-14 + 4 * sk).toFixed(1)}deg)`;
    seal.style.filter = `blur(${((1 - sk) * 3).toFixed(1)}px)`;
    const ek = out3(span(p, 0.9, 0.98)); eng.style.opacity = ek; eng.style.transform = `translateY(${(10 * (1 - ek)).toFixed(1)}px)`;
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function progress() {
    const r = section.getBoundingClientRect(), total = section.offsetHeight - stage.offsetHeight;
    return reduce ? 1 : clamp(-r.top / Math.max(1, total));
  }
  let raf = 0;
  const tick = () => { raf = 0; render(progress()); };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
  // the stylus jiggles while writing even if the scroll pauses
  const idle = () => { if (lastP > 0.28 && lastP < 0.9) render(lastP, true); requestAnimationFrame(idle); };
  requestAnimationFrame(idle);
  addEventListener('resize', () => layout());
  layout();
  return { layout, render, progress: () => lastP };
}
