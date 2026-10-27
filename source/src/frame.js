// Ornate portrait medallion for the couple, painted procedurally on canvas:
// a ring of marigolds and roses with jasmine, a beaded gold kemp-stone band, a painted glow behind
// the portrait, a gold rim light, a kalasam crest on top and a jasmine-and-pearl drop below.
import { rng } from './backdrop.js';
import { marigold, jasmineBud } from './decor.js';
const TAU = Math.PI * 2;
const canvasOf = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };

export function paintFrame(photo, D, { seed = 1, side = 'groom' } = {}) {
  // canvas is taller than the medallion to fit the crest and the drop
  const W = D, Hc = D * 1.32, c = canvasOf(W, Hc), g = c.getContext('2d'), r = rng(seed * 31);
  const cx = W / 2, cy = D * 0.56, R = D * 0.5;
  const Rp = R * 0.71;                         // photo radius
  const gold = (y0, y1) => { const b = g.createLinearGradient(0, cy - y0, 0, cy + y1);
    b.addColorStop(0, '#fff1b8'); b.addColorStop(0.25, '#f2c25a'); b.addColorStop(0.5, '#a8671a'); b.addColorStop(0.72, '#ffd97a'); b.addColorStop(1, '#8a5410'); return b; };

  // ---- soft shadow behind the whole medallion
  g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = D * 0.06; g.shadowOffsetY = D * 0.025;
  g.fillStyle = '#2a050a'; g.beginPath(); g.arc(cx, cy, R * 0.9, 0, TAU); g.fill(); g.restore();

  // ---- jasmine drop below (drawn first so the ring sits over its top)
  const bud = jasmineBud(D * 0.05, seed);
  for (let s = -1; s <= 1; s++) {
    const len = D * (s ? 0.13 : 0.2), x0 = cx + s * R * 0.22, y0 = cy + R * 0.8;
    for (let k = 0; k < len / (D * 0.03); k++) {
      const y = y0 + k * D * 0.03;
      for (let j = 0; j < 4; j++) { g.save(); g.translate(x0, y); g.rotate(j / 4 * TAU + k * 0.8); g.drawImage(bud, -bud.width / 2, 0); g.restore(); }
    }
    // pearl + ruby drop
    const ey = y0 + len + D * 0.02;
    g.fillStyle = gold(-ey + cy - 10, ey - cy + 10); g.beginPath(); g.arc(x0, ey, D * 0.016, 0, TAU); g.fill();
    const rb = g.createRadialGradient(x0 - D * 0.006, ey + D * 0.03, 0, x0, ey + D * 0.035, D * 0.022);
    rb.addColorStop(0, '#ff8a8a'); rb.addColorStop(0.4, '#c3122c'); rb.addColorStop(1, '#4a0010');
    g.fillStyle = rb; g.beginPath(); g.moveTo(x0, ey + D * 0.012); g.quadraticCurveTo(x0 + D * 0.026, ey + D * 0.04, x0, ey + D * 0.062); g.quadraticCurveTo(x0 - D * 0.026, ey + D * 0.04, x0, ey + D * 0.012); g.fill();
  }

  // ---- marigold ring: two staggered rows of blooms, roses every few, leaves peeking out
  const M = D * 0.105;
  const blooms = { o: [1, 2, 3].map((s) => marigold(M, 'orange', s + seed * 10)), y: [4, 5].map((s) => marigold(M, 'yellow', s + seed * 10)), r: [6, 7].map((s) => marigold(M * 0.95, 'red', s + seed * 10)) };
  // leaves
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * TAU + 0.12, x = cx + Math.cos(a) * R * 0.95, y = cy + Math.sin(a) * R * 0.95;
    g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2 + (r() - 0.5) * 0.6);
    const lg = g.createLinearGradient(-M * 0.2, 0, M * 0.2, 0); lg.addColorStop(0, '#1f3d0e'); lg.addColorStop(0.5, '#4f7a2c'); lg.addColorStop(1, '#1f3d0e');
    g.fillStyle = lg; g.beginPath(); g.ellipse(0, -M * 0.4, M * 0.16, M * 0.42, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(200,220,140,.5)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -M * 0.75); g.stroke();
    g.restore();
  }
  const rows = [[R * 0.88, 42, 0], [R * 0.79, 36, 0.5]];
  for (const [rad, n, off] of rows) {
    for (let i = 0; i < n; i++) {
      const a = (i + off) / n * TAU, x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
      const set = i % 7 === 3 ? blooms.r : (i + (off ? 1 : 0)) % 2 ? blooms.y : blooms.o, m = set[i % set.length];
      const s = M * (0.92 + r() * 0.16);
      g.save(); g.shadowColor = 'rgba(40,5,0,.55)'; g.shadowBlur = M * 0.25; g.shadowOffsetY = M * 0.08;
      g.drawImage(m, x - s / 2, y - s / 2, s, s); g.restore();
    }
  }
  // jasmine buds tucked between the rows
  for (let i = 0; i < 48; i++) {
    const a = i / 48 * TAU + 0.05, rad = R * (0.835 + (i % 2) * 0.02), x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
    g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2); g.drawImage(bud, -bud.width / 2, -bud.height / 2); g.restore();
  }

  // ---- gold band with beads and kemp stones
  const bandR = Rp + R * 0.05;
  g.lineWidth = R * 0.085; g.strokeStyle = gold(bandR, bandR); g.beginPath(); g.arc(cx, cy, bandR, 0, TAU); g.stroke();
  g.lineWidth = R * 0.012; g.strokeStyle = 'rgba(70,30,0,.7)';
  g.beginPath(); g.arc(cx, cy, bandR - R * 0.043, 0, TAU); g.stroke(); g.beginPath(); g.arc(cx, cy, bandR + R * 0.043, 0, TAU); g.stroke();
  // pearls on the outer edge
  for (let i = 0; i < 64; i++) {
    const a = i / 64 * TAU, x = cx + Math.cos(a) * (bandR + R * 0.062), y = cy + Math.sin(a) * (bandR + R * 0.062);
    const pg = g.createRadialGradient(x - R * 0.006, y - R * 0.006, 0, x, y, R * 0.017);
    pg.addColorStop(0, '#ffffff'); pg.addColorStop(0.5, '#f2ead6'); pg.addColorStop(1, '#9d8f72');
    g.fillStyle = pg; g.beginPath(); g.arc(x, y, R * 0.016, 0, TAU); g.fill();
  }
  // kemp stones (ruby + emerald) set in the band
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * TAU - Math.PI / 2, x = cx + Math.cos(a) * bandR, y = cy + Math.sin(a) * bandR, emer = i % 2;
    g.save(); g.translate(x, y); g.rotate(a);
    const sgd = g.createLinearGradient(0, -R * 0.03, 0, R * 0.03); sgd.addColorStop(0, '#fff0b8'); sgd.addColorStop(0.5, '#c88a28'); sgd.addColorStop(1, '#7d4a0c'); g.fillStyle = sgd; g.beginPath(); g.ellipse(0, 0, R * 0.04, R * 0.03, 0, 0, TAU); g.fill();
    const sg = g.createRadialGradient(-R * 0.008, -R * 0.008, 0, 0, 0, R * 0.026);
    sg.addColorStop(0, emer ? '#9cf2b8' : '#ff9ca8'); sg.addColorStop(0.45, emer ? '#127a3a' : '#c0102c'); sg.addColorStop(1, emer ? '#043014' : '#3e0010');
    g.fillStyle = sg; g.beginPath(); g.ellipse(0, 0, R * 0.028, R * 0.02, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(-R * 0.01, -R * 0.006, R * 0.005, 0, TAU); g.fill();
    g.restore();
  }

  // ---- the portrait: painted glow behind, then the photo, then rim light and vignette
  g.save(); g.beginPath(); g.arc(cx, cy, Rp, 0, TAU); g.clip();
  const bg = g.createRadialGradient(cx, cy - Rp * 0.25, 0, cx, cy, Rp * 1.1);
  bg.addColorStop(0, side === 'bride' ? '#f5b25a' : '#f1a64e'); bg.addColorStop(0.45, '#b8481f'); bg.addColorStop(1, '#4a0a12');
  g.fillStyle = bg; g.fillRect(cx - Rp, cy - Rp, Rp * 2, Rp * 2);
  // soft painted bokeh behind the head
  for (let i = 0; i < 14; i++) { const x = cx + (r() - 0.5) * Rp * 1.8, y = cy + (r() - 0.7) * Rp * 1.2, rr = Rp * (0.05 + r() * 0.12);
    const bk = g.createRadialGradient(x, y, 0, x, y, rr); bk.addColorStop(0, 'rgba(255,230,170,.35)'); bk.addColorStop(1, 'rgba(255,230,170,0)'); g.fillStyle = bk; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill(); }
  // kolam lines faintly behind
  g.strokeStyle = 'rgba(255,225,160,.18)'; g.lineWidth = 1;
  for (let i = 0; i < 12; i++) { g.beginPath(); g.ellipse(cx, cy - Rp * 0.1, Rp * 0.95, Rp * 0.35, i / 12 * Math.PI, 0, TAU); g.stroke(); }
  // photo, scaled so the head sits a touch above centre
  const ps = Rp * 2.15, px = cx - ps / 2, py = cy - Rp * 1.0;
  g.shadowColor = 'rgba(40,5,0,.6)'; g.shadowBlur = Rp * 0.08;
  g.drawImage(photo, px, py, ps, ps);
  g.shadowBlur = 0;
  // warm rim light from the top-left, cool shadow bottom-right
  const rim = g.createLinearGradient(cx - Rp, cy - Rp, cx + Rp, cy + Rp);
  rim.addColorStop(0, 'rgba(255,200,110,.22)'); rim.addColorStop(0.5, 'rgba(255,200,110,0)'); rim.addColorStop(1, 'rgba(40,0,20,.25)');
  g.globalCompositeOperation = 'soft-light'; g.fillStyle = rim; g.fillRect(cx - Rp, cy - Rp, Rp * 2, Rp * 2);
  g.globalCompositeOperation = 'source-over';
  const vg = g.createRadialGradient(cx, cy, Rp * 0.7, cx, cy, Rp);
  vg.addColorStop(0, 'rgba(30,2,6,0)'); vg.addColorStop(1, 'rgba(30,2,6,.55)'); g.fillStyle = vg; g.fillRect(cx - Rp, cy - Rp, Rp * 2, Rp * 2);
  g.restore();
  // inner gold hairline
  g.lineWidth = R * 0.018; g.strokeStyle = '#ffe3a0'; g.beginPath(); g.arc(cx, cy, Rp + R * 0.006, 0, TAU); g.stroke();

  // ---- kalasam crest on top
  const ty = cy - R * 0.98, tw = R * 0.32;
  g.save(); g.translate(cx, ty);
  g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = R * 0.04; g.shadowOffsetY = R * 0.015;
  const kg = g.createLinearGradient(-tw, -R * 0.28, tw, R * 0.1);
  kg.addColorStop(0, '#fff3c0'); kg.addColorStop(0.3, '#f2c25a'); kg.addColorStop(0.55, '#9c5f16'); kg.addColorStop(0.75, '#ffd97a'); kg.addColorStop(1, '#7d4a0c');
  g.fillStyle = kg;
  g.beginPath(); g.moveTo(-tw, R * 0.1); g.quadraticCurveTo(-tw * 0.9, -R * 0.02, -tw * 0.45, -R * 0.03);
  g.quadraticCurveTo(-tw * 0.3, -R * 0.16, 0, -R * 0.26); g.quadraticCurveTo(tw * 0.3, -R * 0.16, tw * 0.45, -R * 0.03);
  g.quadraticCurveTo(tw * 0.9, -R * 0.02, tw, R * 0.1); g.closePath(); g.fill();
  g.shadowBlur = 0; g.strokeStyle = 'rgba(80,35,0,.75)'; g.lineWidth = R * 0.01; g.stroke();
  // filigree curls
  g.strokeStyle = 'rgba(90,40,0,.6)'; g.lineWidth = R * 0.008;
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * tw * 0.15, -R * 0.12); g.bezierCurveTo(s * tw * 0.5, -R * 0.1, s * tw * 0.6, R * 0.04, s * tw * 0.85, R * 0.06); g.stroke();
    g.beginPath(); g.arc(s * tw * 0.55, R * 0.0, R * 0.03, 0, TAU); g.stroke(); }
  // central ruby + top bead
  const cr = g.createRadialGradient(-R * 0.01, -R * 0.1, 0, 0, -R * 0.09, R * 0.05);
  cr.addColorStop(0, '#ffb0b8'); cr.addColorStop(0.45, '#c3122c'); cr.addColorStop(1, '#400010');
  g.fillStyle = cr; g.beginPath(); g.ellipse(0, -R * 0.09, R * 0.04, R * 0.05, 0, 0, TAU); g.fill();
  g.fillStyle = '#fff6dd'; g.beginPath(); g.arc(0, -R * 0.28, R * 0.025, 0, TAU); g.fill();
  g.restore();
  return { canvas: c, cx, cy, R, D, Hc };
}
