// Painted wedding backdrop (behind everything): maroon silk wall with a woven damask, a slowly turning
// gold kolam-mandala, the TVK flag waving behind the leader, silk drapes with zari borders, and warm bokeh.
// Static parts are painted once per resize; the flag, mandala glow and bokeh animate each frame.
const TAU = Math.PI * 2;
const canvasOf = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; };
export function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function paintWall(W, H, dpr) {
  const c = canvasOf(W, H), g = c.getContext('2d'), r = rng(7);
  // deep maroon with a warm pool of light behind the couple
  let grd = g.createRadialGradient(W * 0.5, H * 0.56, 0, W * 0.5, H * 0.56, Math.hypot(W, H) * 0.62);
  grd.addColorStop(0, '#8a1a1f'); grd.addColorStop(0.28, '#5e0d16'); grd.addColorStop(0.62, '#33060d'); grd.addColorStop(1, '#140206');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  // silk weave: fine diagonal threads
  g.globalAlpha = 0.05; g.strokeStyle = '#ffd9a0'; g.lineWidth = 0.6 * dpr;
  for (let x = -H; x < W; x += 3.2 * dpr) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + H * 0.35, H); g.stroke(); }
  g.globalAlpha = 0.035; g.strokeStyle = '#000';
  for (let x = 0; x < W + H; x += 4.6 * dpr) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x - H * 0.35, H); g.stroke(); }
  // damask: rows of small gold mango (paisley) buttis
  g.globalAlpha = 1;
  const step = 58 * dpr;
  for (let y = step * 0.5, row = 0; y < H + step; y += step * 0.86, row++) {
    for (let x = (row % 2) * step * 0.5; x < W + step; x += step) {
      g.save(); g.translate(x, y); g.rotate(row % 2 ? 0.5 : -0.5); g.scale(dpr, dpr);
      g.globalAlpha = 0.07 + r() * 0.03;
      g.fillStyle = '#e8b25a';
      g.beginPath(); g.moveTo(0, 7); g.bezierCurveTo(-8, 4, -7, -7, 0, -7); g.bezierCurveTo(6, -7, 6, 0, 1, 1); g.bezierCurveTo(3, 3, 3, 6, 0, 7); g.fill();
      g.fillStyle = '#5e0d16'; g.beginPath(); g.arc(-1.5, -2, 2.2, 0, TAU); g.fill();
      g.restore();
    }
  }
  // vignette
  grd = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.hypot(W, H) * 0.6);
  grd.addColorStop(0, 'rgba(10,1,3,0)'); grd.addColorStop(1, 'rgba(10,1,3,.75)');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  return c;
}

// A big kolam / mandala in thin gold lines, drawn once and turned slowly.
function paintMandala(R, dpr) {
  const S = Math.ceil(R * 2 + 8), c = canvasOf(S, S), g = c.getContext('2d');
  g.translate(S / 2, S / 2); g.strokeStyle = '#f0c46a'; g.fillStyle = '#f0c46a'; g.lineCap = 'round';
  const ring = (rad, w, a) => { g.globalAlpha = a; g.lineWidth = w * dpr; g.beginPath(); g.arc(0, 0, rad, 0, TAU); g.stroke(); };
  ring(R * 0.99, 1.2, 0.55); ring(R * 0.95, 0.6, 0.4); ring(R * 0.52, 1, 0.5); ring(R * 0.49, 0.5, 0.35); ring(R * 0.2, 0.8, 0.5);
  // outer lotus petals
  for (let i = 0; i < 32; i++) {
    g.save(); g.rotate(i / 32 * TAU); g.globalAlpha = 0.5; g.lineWidth = 0.9 * dpr;
    g.beginPath(); g.moveTo(0, -R * 0.53); g.bezierCurveTo(R * 0.09, -R * 0.66, R * 0.06, -R * 0.84, 0, -R * 0.93);
    g.bezierCurveTo(-R * 0.06, -R * 0.84, -R * 0.09, -R * 0.66, 0, -R * 0.53); g.stroke();
    g.globalAlpha = 0.3; g.beginPath(); g.moveTo(0, -R * 0.58); g.lineTo(0, -R * 0.86); g.stroke();
    g.globalAlpha = 0.55; g.beginPath(); g.arc(0, -R * 0.97, 2 * dpr, 0, TAU); g.fill();
    g.restore();
  }
  // kolam dots and looping lines in the middle band
  for (let i = 0; i < 16; i++) {
    g.save(); g.rotate(i / 16 * TAU + 0.1);
    g.globalAlpha = 0.45; g.lineWidth = 0.8 * dpr;
    g.beginPath(); g.ellipse(0, -R * 0.35, R * 0.07, R * 0.13, 0, 0, TAU); g.stroke();
    g.globalAlpha = 0.6; g.beginPath(); g.arc(0, -R * 0.35, 1.8 * dpr, 0, TAU); g.fill();
    g.beginPath(); g.arc(0, -R * 0.235, 1.4 * dpr, 0, TAU); g.fill();
    g.restore();
  }
  for (let i = 0; i < 8; i++) { g.save(); g.rotate(i / 8 * TAU); g.globalAlpha = 0.5; g.lineWidth = 0.9 * dpr;
    g.beginPath(); g.moveTo(0, -R * 0.06); g.quadraticCurveTo(R * 0.08, -R * 0.13, 0, -R * 0.19); g.quadraticCurveTo(-R * 0.08, -R * 0.13, 0, -R * 0.06); g.stroke(); g.restore(); }
  return c;
}

// Silk drape hanging at one side, gathered and tied, with a zari border and soft folds.
function paintDrape(w, h, dpr, flip) {
  const c = canvasOf(w, h), g = c.getContext('2d');
  if (flip) { g.translate(w, 0); g.scale(-1, 1); }
  const tieY = h * 0.62;
  const edge = (y) => { // inner edge x: wide at top, pinched at the tie, flares at the floor
    if (y < tieY) { const k = y / tieY; return w * (0.98 - 0.66 * Math.pow(k, 1.6)); }
    const k = (y - tieY) / (h - tieY); return w * (0.32 + 0.5 * Math.pow(k, 0.7));
  };
  g.beginPath(); g.moveTo(0, 0);
  for (let y = 0; y <= h; y += 6) g.lineTo(edge(y), y);
  g.lineTo(0, h); g.closePath(); g.save(); g.clip();
  const base = g.createLinearGradient(0, 0, w, 0);
  base.addColorStop(0, '#2a0409'); base.addColorStop(0.6, '#5a0b14'); base.addColorStop(1, '#7a1420');
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  // folds: light and shadow bands that follow the drape
  for (let i = 0; i < 9; i++) {
    const f = (i + 0.5) / 9;
    g.beginPath();
    for (let y = 0; y <= h; y += 8) { const x = edge(y) * f; if (y === 0) g.moveTo(x, y); else g.lineTo(x, y); }
    g.lineWidth = (6 + 10 * (1 - f)) * dpr; g.strokeStyle = i % 2 ? 'rgba(0,0,0,.28)' : 'rgba(255,190,150,.09)'; g.stroke();
  }
  // zari border along the inner edge: gold band + woven diamonds
  g.restore();
  const bw = 11 * dpr;
  g.lineJoin = 'round';
  g.beginPath(); for (let y = 0; y <= h; y += 6) { const x = edge(y) - bw * 0.5; if (y === 0) g.moveTo(x, y); else g.lineTo(x, y); }
  const zg = g.createLinearGradient(0, 0, 0, h); zg.addColorStop(0, '#b77a22'); zg.addColorStop(0.5, '#f5cf72'); zg.addColorStop(1, '#a86d1d');
  g.strokeStyle = zg; g.lineWidth = bw; g.stroke();
  g.fillStyle = '#5a0b14';
  for (let y = 8 * dpr; y < h; y += 16 * dpr) { const x = edge(y) - bw * 0.5; g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillRect(-2.2 * dpr, -2.2 * dpr, 4.4 * dpr, 4.4 * dpr); g.restore(); }
  // gold tie with a tassel
  const tx = edge(tieY) * 0.5, ty = tieY;
  g.fillStyle = zg; g.beginPath(); g.ellipse(tx, ty, edge(tieY) * 0.62, 7 * dpr, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(80,30,0,.6)'; g.lineWidth = 1 * dpr; g.stroke();
  g.fillStyle = '#f5cf72'; g.beginPath(); g.arc(edge(tieY) + 2 * dpr, ty, 6 * dpr, 0, TAU); g.fill();
  for (let i = 0; i < 9; i++) { g.strokeStyle = i % 2 ? '#e3a83c' : '#ffd77a'; g.lineWidth = 1.4 * dpr; g.beginPath(); g.moveTo(edge(tieY) + 2 * dpr, ty + 4 * dpr); g.lineTo(edge(tieY) + (i - 4) * 1.6 * dpr + 2 * dpr, ty + 34 * dpr); g.stroke(); }
  return c;
}

export function createBackdrop(canvas, { flag }) {
  const g = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1, wall, mandala, dL, dR, mandR = 0, portrait = false;
  const bokeh = Array.from({ length: 34 }, (_, i) => { const r = rng(300 + i); return { x: r(), y: r(), s: 0.4 + r(), ph: r() * TAU, sp: 0.2 + r() * 0.5, hue: r() }; });
  // the flag, pre-darkened into the maroon so it reads as a silk banner, not a logo
  let flagTex = null;
  const bokSprite = (col) => { const c = canvasOf(64, 64), b = c.getContext('2d'), gr = b.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `rgba(${col},1)`); gr.addColorStop(0.7, `rgba(${col},.6)`); gr.addColorStop(1, `rgba(${col},0)`); b.fillStyle = gr; b.fillRect(0, 0, 64, 64); return c; };
  const bokA = bokSprite('255,190,110'), bokB = bokSprite('255,120,80');
  function resize(cssW, cssH, ratio) {
    dpr = ratio; W = Math.round(cssW * dpr); H = Math.round(cssH * dpr); canvas.width = W; canvas.height = H;
    portrait = cssW / cssH < 0.8;
    wall = paintWall(W, H, dpr);
    mandR = Math.min(W, H) * (portrait ? 0.62 : 0.5); mandala = paintMandala(mandR, dpr);
    const dw = Math.round(W * (portrait ? 0.1 : 0.12)), dh = H;
    dL = paintDrape(dw, dh, dpr, false); dR = paintDrape(dw, dh, dpr, true);
    const fw = 540, fh = 360; flagTex = canvasOf(fw, fh);
    const fg = flagTex.getContext('2d'); fg.drawImage(flag, 0, 0, fw, fh);
    fg.globalCompositeOperation = 'multiply'; fg.fillStyle = '#7c4a40'; fg.fillRect(0, 0, fw, fh);
  }
  // flag waving: vertical strips displaced by a travelling sine, shaded as cloth, feathered into the wall
  let fbuf = null, fmask = null;
  function drawFlag(t, a, cx, cy, fw) {
    if (a <= 0) return;
    const q = 1 / dpr, FW = fw * q;                       // soft background: paint at css-px resolution
    const fh = FW * 2 / 3, pad = fh * 0.12, bw = Math.ceil(FW), bh = Math.ceil(fh + pad * 2);
    if (!fbuf || fbuf.width !== bw || fbuf.height !== bh) {
      fbuf = canvasOf(bw, bh); fmask = canvasOf(bw, bh); const m = fmask.getContext('2d');
      const fx = m.createLinearGradient(0, 0, bw, 0); fx.addColorStop(0, 'rgba(0,0,0,0)'); fx.addColorStop(0.22, 'rgba(0,0,0,1)'); fx.addColorStop(0.78, 'rgba(0,0,0,1)'); fx.addColorStop(1, 'rgba(0,0,0,0)');
      m.fillStyle = fx; m.fillRect(0, 0, bw, bh); m.globalCompositeOperation = 'destination-in';
      const fy = m.createLinearGradient(0, 0, 0, bh); fy.addColorStop(0, 'rgba(0,0,0,0)'); fy.addColorStop(0.3, 'rgba(0,0,0,1)'); fy.addColorStop(0.62, 'rgba(0,0,0,.85)'); fy.addColorStop(1, 'rgba(0,0,0,0)');
      m.fillStyle = fy; m.fillRect(0, 0, bw, bh);
    }
    const b = fbuf.getContext('2d'), N = 72, sw = FW / N, tw = flagTex.width / N;
    b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-over'; b.globalAlpha = 1; b.clearRect(0, 0, bw, bh);
    const wave = (u) => u * 9 - t * 2.4;
    for (let i = 0; i < N; i++) {
      const u = i / N, amp = fh * 0.04 * (0.25 + u), dy = Math.sin(wave(u)) * amp;
      b.drawImage(flagTex, i * tw, 0, tw, flagTex.height, i * sw, pad + dy, sw + 1.2, fh);
    }
    // cloth shading: one smooth gradient across the banner (no seams)
    b.globalCompositeOperation = 'source-atop';
    const sh = b.createLinearGradient(0, 0, bw, 0);
    for (let k = 0; k <= 24; k++) { const u = k / 24, c = Math.cos(wave(u)); sh.addColorStop(u, c > 0 ? `rgba(255,220,170,${(c * 0.12).toFixed(3)})` : `rgba(0,0,0,${(-c * 0.32).toFixed(3)})`); }
    b.fillStyle = sh; b.fillRect(0, 0, bw, bh);
    // feather all four edges
    b.globalCompositeOperation = 'destination-in'; b.drawImage(fmask, 0, 0);
    g.save(); g.globalAlpha = a; g.drawImage(fbuf, cx - fw / 2, cy - bh * dpr / 2, fw, bh * dpr); g.restore();
  }
  /** t: seconds; o: { intro 0..1, glow 0..1 (pool of light under the names), flagY, flagW } */
  function render(t, o) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#0b0104'; g.fillRect(0, 0, W, H);
    g.globalAlpha = o.intro; g.drawImage(wall, 0, 0); g.globalAlpha = 1;
    drawFlag(t, 0.62 * o.intro, W / 2, o.flagY * dpr, o.flagW * dpr);
    // mandala, slowly turning, glowing brighter once the names are written
    const mc = o.mandY * dpr;
    g.save(); g.translate(W / 2, mc); g.rotate(t * 0.035); g.globalAlpha = (0.13 + 0.17 * o.glow) * o.intro;
    g.drawImage(mandala, -mandala.width / 2, -mandala.height / 2); g.restore();
    // pool of warm light behind the names
    const pg = g.createRadialGradient(W / 2, mc, 0, W / 2, mc, mandR * 1.1);
    pg.addColorStop(0, `rgba(255,170,70,${(0.16 * o.glow).toFixed(3)})`); pg.addColorStop(1, 'rgba(255,140,60,0)');
    g.fillStyle = pg; g.fillRect(0, 0, W, H);
    // bokeh
    g.globalCompositeOperation = 'lighter';
    for (const b of bokeh) {
      const x = ((b.x + Math.sin(t * 0.1 * b.sp + b.ph) * 0.02) * W), y = ((b.y - t * 0.006 * b.sp) % 1 + 1) % 1 * H;
      const rad = (8 + b.s * 22) * dpr, a = (0.05 + 0.06 * Math.sin(t * b.sp + b.ph) ** 2) * o.intro;
      g.globalAlpha = a; g.drawImage(b.hue < 0.6 ? bokA : bokB, x - rad, y - rad, rad * 2, rad * 2);
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    // drapes slide in from the sides
    const sl = 1 - Math.pow(1 - o.intro, 3);
    g.globalAlpha = 1;
    g.drawImage(dL, -dL.width * (1 - sl), 0); g.drawImage(dR, W - dR.width * sl, 0);
  }
  return { resize, render };
}
