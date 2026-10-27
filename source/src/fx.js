// Overlay effects, all pure functions of time: the gold pen spark with its ribbon trail and thrown
// sparks, bursts of gold and petals when a portrait lands, twinkles on the names, and a gentle petal rain.
import { rng } from './backdrop.js';
const TAU = Math.PI * 2;
const canvasOf = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };

function petalSprite(kind, size, seed) {
  const r = rng(seed), w = size, h = size * (kind === 'rose' ? 0.9 : 1.25), c = canvasOf(w, h), g = c.getContext('2d');
  g.translate(w / 2, h / 2);
  const pal = kind === 'rose' ? ['#5a0612', '#a3132b', '#d8334a'] : kind === 'jasmine' ? ['#cfc6ae', '#fbf6e6', '#ffffff'] : ['#b84a00', '#f07c0c', '#ffb340'];
  const grd = g.createRadialGradient(-w * 0.1, -h * 0.15, 0, 0, 0, Math.max(w, h) * 0.6);
  grd.addColorStop(0, pal[2]); grd.addColorStop(0.6, pal[1]); grd.addColorStop(1, pal[0]);
  g.fillStyle = grd; g.beginPath();
  if (kind === 'rose') { g.moveTo(0, -h * 0.45); g.bezierCurveTo(w * 0.55, -h * 0.5, w * 0.5, h * 0.3, 0, h * 0.45); g.bezierCurveTo(-w * 0.5, h * 0.3, -w * 0.55, -h * 0.5, 0, -h * 0.45); }
  else { g.moveTo(0, -h * 0.5); g.bezierCurveTo(w * 0.42, -h * 0.3, w * 0.38, h * 0.32, 0, h * 0.5); g.bezierCurveTo(-w * 0.38, h * 0.32, -w * 0.42, -h * 0.3, 0, -h * 0.5); }
  g.fill();
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 0.6;
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(0, h * 0.42); g.quadraticCurveTo((r() - 0.5) * w * 0.4, 0, (i - 1.5) * w * 0.12, -h * 0.38); g.stroke(); }
  return c;
}
function star(g, x, y, s, a, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a;
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, s);
  gr.addColorStop(0, 'rgba(255,255,240,1)'); gr.addColorStop(0.2, 'rgba(255,226,150,.8)'); gr.addColorStop(1, 'rgba(255,190,90,0)');
  g.fillStyle = gr;
  g.beginPath(); for (let i = 0; i < 4; i++) { const an = i / 4 * TAU; g.lineTo(Math.cos(an) * s, Math.sin(an) * s); const an2 = an + TAU / 8; g.lineTo(Math.cos(an2) * s * 0.16, Math.sin(an2) * s * 0.16); } g.closePath(); g.fill();
  g.restore();
}

export function createFx(canvas) {
  const g = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1, sprites = [], portrait = false;
  function resize(cssW, cssH, ratio) {
    dpr = ratio; W = Math.round(cssW * dpr); H = Math.round(cssH * dpr); canvas.width = W; canvas.height = H; portrait = cssW / cssH < 0.8;
    const s = (portrait ? 13 : 16) * dpr;
    sprites = [['marigold', 1], ['marigold', 2], ['rose', 3], ['rose', 4], ['jasmine', 5], ['marigold', 6]].map(([k, sd]) => petalSprite(k, s * (k === 'jasmine' ? 0.8 : 1), sd));
  }
  const clear = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); };

  /** the pen: posAt(time) -> {x,y} css px or null. Draws the head at `t`, a ribbon over the last `tail` s, and thrown sparks. */
  function pen(t, posAt, { from = 0, tail = 0.28, intensity = 1 } = {}) {
    const p = posAt(t); if (!p) return;
    g.save(); g.globalCompositeOperation = 'lighter';
    // ribbon trail
    const N = 26; let prev = null;
    for (let i = N; i >= 0; i--) {
      const tt = t - tail * i / N; if (tt < from) continue;
      const q = posAt(tt); if (!q) continue;
      if (prev) {
        const k = 1 - i / N;
        g.strokeStyle = `rgba(255,${190 + 50 * k | 0},${90 + 110 * k | 0},${(0.75 * k * intensity).toFixed(3)})`;
        g.lineWidth = (0.8 + 5 * k) * dpr; g.lineCap = 'round';
        g.beginPath(); g.moveTo(prev.x * dpr, prev.y * dpr); g.lineTo(q.x * dpr, q.y * dpr); g.stroke();
      }
      prev = q;
    }
    // sparks thrown off the nib (each born at a fixed time, so it is deterministic)
    const rate = 70, life = 0.6, n0 = Math.ceil((t - life - from) * rate), n1 = Math.floor((t - from) * rate);
    for (let i = Math.max(0, n0); i <= n1; i++) {
      const tb = from + i / rate, age = t - tb; if (age < 0 || age > life) continue;
      const o = posAt(tb); if (!o) continue;
      const r = rng(i * 7 + 13), an = r() * TAU, sp = (30 + r() * 90) * dpr, k = age / life;
      const x = o.x * dpr + Math.cos(an) * sp * age, y = o.y * dpr + Math.sin(an) * sp * age + 160 * dpr * age * age;
      g.fillStyle = `rgba(255,${200 + r() * 55 | 0},${120 + r() * 80 | 0},${((1 - k) * intensity).toFixed(3)})`;
      g.beginPath(); g.arc(x, y, (0.6 + r() * 1.6) * dpr * (1 - k * 0.6), 0, TAU); g.fill();
    }
    // head: hot core, halo, rotating flare
    const x = p.x * dpr, y = p.y * dpr, s = 34 * dpr * intensity;
    const halo = g.createRadialGradient(x, y, 0, x, y, s * 1.4);
    halo.addColorStop(0, 'rgba(255,255,245,1)'); halo.addColorStop(0.12, 'rgba(255,236,170,.9)'); halo.addColorStop(0.4, 'rgba(255,170,60,.35)'); halo.addColorStop(1, 'rgba(255,120,30,0)');
    g.fillStyle = halo; g.beginPath(); g.arc(x, y, s * 1.4, 0, TAU); g.fill();
    star(g, x, y, s * 1.1, 0.9 * intensity, t * 2.4);
    star(g, x, y, s * 0.7, 0.7 * intensity, -t * 3.1 + 0.4);
    // anamorphic streak
    const st = g.createLinearGradient(x - s * 3, y, x + s * 3, y);
    st.addColorStop(0, 'rgba(255,200,120,0)'); st.addColorStop(0.5, `rgba(255,240,200,${(0.6 * intensity).toFixed(3)})`); st.addColorStop(1, 'rgba(255,200,120,0)');
    g.fillStyle = st; g.fillRect(x - s * 3, y - 1.2 * dpr, s * 6, 2.4 * dpr);
    g.restore();
  }

  /** a portrait lands: ring of gold sparks + petals bursting out from (cx,cy) css px; age in s */
  function burst(age, cx, cy, rad, seed) {
    if (age < 0 || age > 2.4) return;
    const r0 = rng(seed);
    g.save();
    // shockwave ring
    if (age < 0.6) {
      const k = age / 0.6; g.globalCompositeOperation = 'lighter';
      g.strokeStyle = `rgba(255,214,130,${(0.7 * (1 - k)).toFixed(3)})`; g.lineWidth = (8 * (1 - k) + 1) * dpr;
      g.beginPath(); g.arc(cx * dpr, cy * dpr, (rad * (0.9 + k * 0.9)) * dpr, 0, TAU); g.stroke();
    }
    for (let i = 0; i < 46; i++) {
      const r = rng(seed * 100 + i), an = r() * TAU, sp = (140 + r() * 260) * dpr, petal = i % 3 === 0;
      const life = petal ? 2.4 : 0.9; if (age > life) continue;
      const drag = petal ? 2.2 : 1.4, d = sp * (1 - Math.exp(-drag * age)) / drag;
      const x = cx * dpr + Math.cos(an) * (rad * dpr * 0.8 + d), y = cy * dpr + Math.sin(an) * (rad * dpr * 0.8 + d) + (petal ? 60 : 120) * dpr * age * age;
      const k = age / life;
      if (petal) {
        const sp2 = sprites[i % sprites.length];
        g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1 - k * k;
        g.save(); g.translate(x, y); g.rotate(an + age * (2 + r() * 3)); g.scale(Math.cos(age * (4 + r() * 4)), 1);
        g.drawImage(sp2, -sp2.width / 2, -sp2.height / 2); g.restore();
      } else {
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1;
        g.fillStyle = `rgba(255,${200 + r() * 55 | 0},120,${(1 - k).toFixed(3)})`;
        g.beginPath(); g.arc(x, y, (1 + r() * 2.2) * dpr, 0, TAU); g.fill();
      }
    }
    g.restore(); void r0;
  }

  /** twinkles scattered over a box (css px), staggered so a few are always shining */
  function twinkle(t, b, a, seed) {
    if (a <= 0) return;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) {
      const r = rng(seed * 50 + i), per = 1.6 + r() * 1.6, ph = ((t + r() * per) % per) / per;
      if (ph > 0.35) continue;
      const cyc = Math.floor((t + r() * per) / per), rr = rng(seed * 999 + i * 31 + cyc);
      const x = (b.x + rr() * b.w) * dpr, y = (b.y + b.h * (0.25 + rr() * 0.5)) * dpr;
      star(g, x, y, (6 + rr() * 9) * dpr * Math.sin(Math.PI * ph / 0.35), a, rr() * 0.6);
    }
    g.restore();
  }

  /** gentle petal rain that starts at t0 and continues */
  function rain(t, t0, a) {
    if (t < t0 || a <= 0) return;
    const n = portrait ? 22 : 34;
    g.save(); g.globalAlpha = a;
    for (let i = 0; i < n; i++) {
      const r = rng(4000 + i), born = t0 + r() * 2.2, el = t - born; if (el < 0) continue;
      const v = (40 + r() * 50) * dpr, fall = H + 80 * dpr, y = ((el * v) % fall) - 40 * dpr;
      const x = r() * W + Math.sin(el * (0.6 + r()) + r() * 6) * 40 * dpr;
      const sp = sprites[i % sprites.length];
      g.save(); g.translate(x, y); g.rotate(el * (0.6 + r()) + r() * 6); g.scale(Math.cos(el * (1.2 + r() * 2)), 1);
      g.drawImage(sp, -sp.width / 2, -sp.height / 2); g.restore();
    }
    g.restore();
  }
  return { resize, clear, pen, burst, twinkle, rain };
}
