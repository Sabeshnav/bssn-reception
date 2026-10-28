// Foreground wedding décor drawn in front of the leader: a mango-leaf thoranam with marigold balls,
// marigold + jasmine strands hanging at the sides, and two brass kuthuvilakku lamps with live flames.
// Flowers and leaves are painted once as sprites (many tiny petals each), then placed and swayed per frame.
import { rng } from './backdrop.js';
const TAU = Math.PI * 2;
const canvasOf = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };

// ---------- sprites ----------
export function marigold(size, hue = 'orange', seed = 1) {
  const S = Math.ceil(size), c = canvasOf(S, S), g = c.getContext('2d'), r = rng(seed), R = S / 2;
  const pal = hue === 'yellow' ? ['#7e4600', '#cf8200', '#f0a800', '#ffc61a', '#ffe166'] : hue === 'red' ? ['#4a0410', '#850b1c', '#b3172b', '#d8343f', '#f2685a'] : ['#6e2200', '#bd4300', '#e86400', '#ff860a', '#ffad33'];
  g.translate(R, R);
  // body shadow
  let grd = g.createRadialGradient(R * 0.1, R * 0.15, R * 0.2, 0, 0, R);
  grd.addColorStop(0, pal[1]); grd.addColorStop(1, pal[0]); g.fillStyle = grd; g.beginPath(); g.arc(0, 0, R * 0.92, 0, TAU); g.fill();
  // ruffled petals, outside in; brighter towards the light (top-left)
  const rings = Math.max(4, Math.round(R / 3.2));
  for (let k = 0; k < rings; k++) {
    const rr = R * 0.9 * (1 - k / rings), n = Math.max(6, Math.round(rr * 1.6));
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + r() * 0.3, x = Math.cos(a) * rr * (0.85 + r() * 0.12), y = Math.sin(a) * rr * (0.85 + r() * 0.12);
      const lit = 0.5 - (x + y) / (R * 4);
      const ci = Math.max(0, Math.min(4, Math.round(1 + lit * 2.4 + k / rings * 1.6 + (r() - 0.5))));
      g.fillStyle = pal[ci]; g.globalAlpha = 1;
      g.beginPath(); g.ellipse(x, y, R * (0.13 + r() * 0.08), R * (0.07 + r() * 0.05), a + Math.PI / 2 + (r() - 0.5), 0, TAU); g.fill();
      g.strokeStyle = 'rgba(70,18,0,.55)'; g.lineWidth = Math.max(0.5, R * 0.025); g.stroke();      // dark crevice between petals
      g.fillStyle = 'rgba(255,236,170,.35)';                                                       // lit petal rim
      g.beginPath(); g.ellipse(x - R * 0.02, y - R * 0.03, R * 0.07, R * 0.025, a + Math.PI / 2, 0, TAU); g.fill();
      g.fillStyle = 'rgba(60,10,0,.35)'; g.globalAlpha = 0.5;            // petal crease
      g.beginPath(); g.ellipse(x + 0.6, y + 0.8, R * 0.05, R * 0.015, a, 0, TAU); g.fill();
    }
  }
  g.globalAlpha = 1;
  grd = g.createRadialGradient(-R * 0.35, -R * 0.4, 0, -R * 0.35, -R * 0.4, R * 0.9);
  grd.addColorStop(0, 'rgba(255,240,190,.18)'); grd.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = grd; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
  grd = g.createRadialGradient(R * 0.3, R * 0.35, R * 0.2, 0, 0, R);
  grd.addColorStop(0, 'rgba(40,5,0,0)'); grd.addColorStop(1, 'rgba(40,5,0,.35)'); g.fillStyle = grd; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
  return c;
}
export function jasmineBud(len, seed = 1) {
  const c = canvasOf(len * 0.5, len), g = c.getContext('2d'), w = len * 0.5;
  const grd = g.createLinearGradient(0, 0, w, 0); grd.addColorStop(0, '#d9d2bf'); grd.addColorStop(0.45, '#fffdf4'); grd.addColorStop(1, '#cfc6ae');
  g.fillStyle = grd; g.beginPath(); g.moveTo(w / 2, 0); g.bezierCurveTo(w * 1.05, len * 0.3, w * 0.8, len * 0.85, w / 2, len); g.bezierCurveTo(w * 0.2, len * 0.85, -w * 0.05, len * 0.3, w / 2, 0); g.fill();
  g.strokeStyle = 'rgba(120,110,80,.35)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(w / 2, len * 0.1); g.lineTo(w / 2, len * 0.9); g.stroke();
  g.fillStyle = '#7d9a3a'; g.beginPath(); g.ellipse(w / 2, len * 0.04, w * 0.2, len * 0.06, 0, 0, TAU); g.fill();
  return c;
}
function mangoLeaf(len, seed) {
  const r = rng(seed), w = len * 0.3, c = canvasOf(w + 4, len + 4), g = c.getContext('2d');
  g.translate(w / 2 + 2, 2);
  const tone = r();
  const grd = g.createLinearGradient(-w / 2, 0, w / 2, 0);
  grd.addColorStop(0, tone < 0.5 ? '#21420f' : '#2c5214'); grd.addColorStop(0.5, tone < 0.5 ? '#4f7a2c' : '#5f8d33'); grd.addColorStop(1, '#2a4b12');
  g.fillStyle = grd;
  g.beginPath(); g.moveTo(0, 0);
  g.bezierCurveTo(w * 0.75, len * 0.2, w * 0.62, len * 0.7, 0, len);
  g.bezierCurveTo(-w * 0.62, len * 0.7, -w * 0.75, len * 0.2, 0, 0); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 0.8; g.stroke();
  // midrib and veins
  g.strokeStyle = 'rgba(214,230,150,.75)'; g.lineWidth = Math.max(0.8, len * 0.014);
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(w * 0.04, len * 0.5, 0, len * 0.98); g.stroke();
  g.lineWidth = Math.max(0.5, len * 0.006); g.strokeStyle = 'rgba(200,220,140,.4)';
  for (let i = 1; i < 9; i++) { const y = len * i / 10, s = w * 0.42 * Math.sin(Math.PI * y / len);
    g.beginPath(); g.moveTo(0, y); g.quadraticCurveTo(s * 0.5, y + len * 0.02, s, y + len * 0.07); g.stroke();
    g.beginPath(); g.moveTo(0, y); g.quadraticCurveTo(-s * 0.5, y + len * 0.02, -s, y + len * 0.07); g.stroke(); }
  // glossy highlight on one half
  const hl = g.createLinearGradient(-w / 2, 0, 0, 0); hl.addColorStop(0, 'rgba(255,255,220,0)'); hl.addColorStop(1, 'rgba(255,255,220,.16)');
  g.fillStyle = hl; g.beginPath(); g.moveTo(0, len * 0.05); g.bezierCurveTo(-w * 0.6, len * 0.3, -w * 0.5, len * 0.7, 0, len * 0.95); g.fill();
  return c;
}

// ---------- brass kuthuvilakku ----------
function paintLamp(h) {
  const w = h * 0.5, c = canvasOf(w, h), g = c.getContext('2d'), cx = w / 2;
  const brass = (x0, x1) => { const b = g.createLinearGradient(x0, 0, x1, 0);
    b.addColorStop(0, '#5a3507'); b.addColorStop(0.22, '#c8891f'); b.addColorStop(0.4, '#ffe39a'); b.addColorStop(0.55, '#e0a63a'); b.addColorStop(0.8, '#8a5410'); b.addColorStop(1, '#3d2304'); return b; };
  const disc = (y, rw, rh, th) => { g.fillStyle = brass(cx - rw, cx + rw); g.beginPath(); g.ellipse(cx, y + th, rw, rh, 0, 0, TAU); g.fill(); g.fillRect(cx - rw, y, rw * 2, th); g.beginPath(); g.ellipse(cx, y, rw, rh, 0, 0, TAU);
    const tg = g.createLinearGradient(0, y - rh, 0, y + rh); tg.addColorStop(0, '#fff0b8'); tg.addColorStop(1, '#b77a22'); g.fillStyle = tg; g.fill(); };
  // base: stepped discs
  disc(h * 0.9, w * 0.46, h * 0.03, h * 0.05); disc(h * 0.84, w * 0.36, h * 0.025, h * 0.05); disc(h * 0.79, w * 0.22, h * 0.02, h * 0.04);
  // stem with knops
  g.fillStyle = brass(cx - w * 0.05, cx + w * 0.05); g.fillRect(cx - w * 0.05, h * 0.36, w * 0.1, h * 0.44);
  for (const [y, rw] of [[0.72, 0.12], [0.6, 0.09], [0.48, 0.11], [0.4, 0.08]]) { g.fillStyle = brass(cx - w * rw, cx + w * rw); g.beginPath(); g.ellipse(cx, h * y, w * rw, h * 0.022, 0, 0, TAU); g.fill(); }
  // oil bowl with five spouts
  g.fillStyle = brass(cx - w * 0.44, cx + w * 0.44);
  g.beginPath(); g.moveTo(cx - w * 0.44, h * 0.3); g.quadraticCurveTo(cx, h * 0.42, cx + w * 0.44, h * 0.3); g.lineTo(cx + w * 0.4, h * 0.28); g.lineTo(cx - w * 0.4, h * 0.28); g.fill();
  g.beginPath(); g.ellipse(cx, h * 0.29, w * 0.44, h * 0.025, 0, 0, TAU); const rim = g.createLinearGradient(0, h * 0.27, 0, h * 0.31); rim.addColorStop(0, '#fff2bf'); rim.addColorStop(1, '#a86d1d'); g.fillStyle = rim; g.fill();
  g.fillStyle = '#3a1d02'; g.beginPath(); g.ellipse(cx, h * 0.29, w * 0.36, h * 0.014, 0, 0, TAU); g.fill();
  // crown: annam (swan) finial
  g.fillStyle = brass(cx - w * 0.04, cx + w * 0.04); g.fillRect(cx - w * 0.03, h * 0.12, w * 0.06, h * 0.17);
  g.fillStyle = brass(cx - w * 0.1, cx + w * 0.1);
  g.beginPath(); g.moveTo(cx - w * 0.1, h * 0.12); g.quadraticCurveTo(cx - w * 0.06, h * 0.03, cx + w * 0.02, h * 0.02); g.quadraticCurveTo(cx + w * 0.1, h * 0.03, cx + w * 0.06, h * 0.07);
  g.quadraticCurveTo(cx + w * 0.02, h * 0.06, cx + w * 0.05, h * 0.1); g.quadraticCurveTo(cx + w * 0.1, h * 0.12, cx - w * 0.1, h * 0.12); g.fill();
  // spout tips (where flames sit), returned in lamp-local coords
  const tips = [-0.4, -0.2, 0, 0.2, 0.4].map((f) => [cx + w * f, h * 0.282 - Math.abs(f) * h * 0.012]);
  return { c, tips };
}

export function createDecor(canvas) {
  const g = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1, portrait = false;
  let leaves = [], golds = {}, buds = null, lamp = null, lampH = 0;
  function resize(cssW, cssH, ratio) {
    dpr = ratio; W = Math.round(cssW * dpr); H = Math.round(cssH * dpr); canvas.width = W; canvas.height = H;
    portrait = cssW / cssH < 0.8;
    const L = (portrait ? 46 : 64) * dpr;
    leaves = [1, 2, 3, 4, 5].map((s) => mangoLeaf(L, s));
    const M = (portrait ? 22 : 28) * dpr;
    golds = { o: [1, 2, 3].map((s) => marigold(M, 'orange', s)), y: [4, 5, 6].map((s) => marigold(M, 'yellow', s)), r: [7, 8].map((s) => marigold(M * 0.9, 'red', s)) };
    buds = [1, 2].map((s) => jasmineBud(12 * dpr, s));
    lampH = Math.min(H * (portrait ? 0.2 : 0.28), W * (portrait ? 0.34 : 0.15)); lamp = paintLamp(lampH);
  }
  // ---- thoranam across the top
  function thoranam(t, drop) {
    const M = golds.o[0].width, L = leaves[0].height;
    const y0 = -L * 1.3 * (1 - drop) + 6 * dpr, sag = H * 0.025;
    const cordY = (x) => y0 + sag * Math.sin(Math.PI * x / W);
    // twisted cord
    g.lineWidth = 3 * dpr; g.strokeStyle = '#d9a441'; g.beginPath(); for (let x = 0; x <= W; x += 10) { const y = cordY(x); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    g.lineWidth = 1.2 * dpr; g.strokeStyle = '#7a1420'; g.setLineDash([4 * dpr, 4 * dpr]); g.stroke(); g.setLineDash([]);
    const step = L * 0.36;
    let i = 0;
    for (let x = step * 0.5; x < W; x += step, i++) {
      const y = cordY(x), sw = Math.sin(t * 1.4 + i * 0.7) * 0.06;
      if (i % 3 === 2) {                                    // marigold pair dangling between leaves
        const set = i % 2 ? golds.y : golds.o, m = set[i % set.length];
        g.drawImage(m, x - M / 2, y + 2 * dpr, M, M); g.drawImage(golds.r[i % 2], x - M * 0.4, y + M * 0.85, M * 0.8, M * 0.8);
        continue;
      }
      const lf = leaves[i % leaves.length];
      g.save(); g.translate(x, y); g.rotate(sw + (i % 2 ? 0.05 : -0.05));
      g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 6 * dpr; g.shadowOffsetY = 3 * dpr;
      g.drawImage(lf, -lf.width / 2, -2 * dpr); g.restore();
    }
  }
  // ---- marigold + jasmine strands hanging down the sides
  function strands(t, drop) {
    const M = golds.o[0].width;
    const xs = portrait ? [0.035, 0.965] : [0.03, 0.075, 0.925, 0.97];
    xs.forEach((fx, si) => {
      const len = H * (portrait ? 0.34 : 0.62) * (si % 2 ? 0.82 : 1) * drop;
      const x0 = fx * W, y0 = 4 * dpr, sway = Math.sin(t * 1.1 + si * 1.3) * 0.025;
      const n = Math.floor(len / (M * 0.72));
      for (let k = 0; k < n; k++) {
        const d = k * M * 0.72, x = x0 + Math.sin(sway) * d, y = y0 + d;
        const band = Math.floor(k / 4) % 3;                     // orange / jasmine / yellow bands
        if (band === 1) { const b = buds[k % 2]; for (let j = 0; j < 5; j++) { g.save(); g.translate(x, y); g.rotate(j / 5 * TAU + k); g.drawImage(b, -b.width / 2, 0); g.restore(); } }
        else { const set = band ? golds.y : golds.o; g.drawImage(set[k % 3], x - M / 2, y - M / 2, M, M); }
      }
      // rose and gold tassel at the end
      const ex = x0 + Math.sin(sway) * n * M * 0.72, ey = y0 + n * M * 0.72;
      g.drawImage(golds.r[si % 2], ex - M * 0.5, ey - M * 0.4, M, M);
      for (let j = 0; j < 7; j++) { g.strokeStyle = j % 2 ? '#e3a83c' : '#ffd77a'; g.lineWidth = 1.2 * dpr; g.beginPath(); g.moveTo(ex, ey + M * 0.5); g.lineTo(ex + (j - 3) * 1.5 * dpr, ey + M * 1.5); g.stroke(); }
    });
  }
  // ---- lamps with flames
  function lamps(t, lit, show) {
    if (show <= 0) return;
    const lw = lamp.c.width, lh = lamp.c.height;
    const spots = [[W * (portrait ? 0.0 : 0.06) - lw * (portrait ? 0.18 : 0.5), H - lh * (portrait ? 0.92 : 1.0)], [W * (portrait ? 1 : 0.94) - lw * (portrait ? 0.82 : 0.5), H - lh * (portrait ? 0.92 : 1.0)]];
    spots.forEach(([lx, ly], li) => {
      g.globalAlpha = show;
      // floor glow
      const fg = g.createRadialGradient(lx + lw / 2, ly + lh * 0.25, 0, lx + lw / 2, ly + lh * 0.25, lh * 0.9);
      fg.addColorStop(0, `rgba(255,170,60,${(0.28 * lit).toFixed(3)})`); fg.addColorStop(1, 'rgba(255,140,40,0)');
      g.globalCompositeOperation = 'lighter'; g.fillStyle = fg; g.fillRect(lx - lh, ly - lh, lw + lh * 2, lh * 2.4); g.globalCompositeOperation = 'source-over';
      g.drawImage(lamp.c, lx, ly);
      if (lit <= 0) return;
      lamp.tips.forEach(([tx, ty], k) => {
        const fl = 1 + 0.12 * Math.sin(t * 13 + k * 2 + li) + 0.08 * Math.sin(t * 23 + k);
        const fh = lh * 0.09 * fl * lit, fw = fh * 0.38, x = lx + tx + Math.sin(t * 7 + k) * fw * 0.12, y = ly + ty;
        g.save(); g.globalCompositeOperation = 'lighter';
        const halo = g.createRadialGradient(x, y - fh * 0.5, 0, x, y - fh * 0.5, fh * 1.6);
        halo.addColorStop(0, 'rgba(255,200,90,.5)'); halo.addColorStop(1, 'rgba(255,120,30,0)');
        g.fillStyle = halo; g.beginPath(); g.arc(x, y - fh * 0.5, fh * 1.6, 0, TAU); g.fill();
        const fgd = g.createLinearGradient(0, y - fh, 0, y);
        fgd.addColorStop(0, 'rgba(255,240,180,0)'); fgd.addColorStop(0.35, 'rgba(255,214,110,.95)'); fgd.addColorStop(0.8, 'rgba(255,140,30,.95)'); fgd.addColorStop(1, 'rgba(120,60,255,.6)');
        g.fillStyle = fgd; g.beginPath(); g.moveTo(x, y - fh); g.bezierCurveTo(x + fw, y - fh * 0.45, x + fw * 0.8, y, x, y); g.bezierCurveTo(x - fw * 0.8, y, x - fw, y - fh * 0.45, x, y - fh); g.fill();
        g.fillStyle = 'rgba(255,255,240,.9)'; g.beginPath(); g.ellipse(x, y - fh * 0.3, fw * 0.25, fh * 0.22, 0, 0, TAU); g.fill();
        g.restore();
      });
    });
    g.globalAlpha = 1;
  }
  function render(t, o) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    strands(t, o.strands);
    thoranam(t, o.thoranam);
    lamps(t, o.lit, o.lamps);
  }
  // how far the side décor reaches into the screen (css px), so content can keep clear of it
  function sides() {
    const lw = lamp.c.width, M = golds.o[0].width;
    const lampRight = portrait ? lw * 0.82 : W * 0.06 + lw * 0.5;
    const strandRight = (portrait ? W * 0.035 : W * 0.075) + M * 0.6;
    return { lamp: lampRight / dpr, strand: strandRight / dpr, lampTop: (H - lamp.c.height * (portrait ? 0.92 : 1)) / dpr, strandBottom: H * (portrait ? 0.34 : 0.62) / dpr };
  }
  return { resize, render, sides };
}
