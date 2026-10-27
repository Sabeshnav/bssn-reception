// Closing title for the organiser: a cinematic end card. The name tracks in letter by letter,
// a light sweeps across the gold, gold dust drifts through an anamorphic flare.
import { rng } from './backdrop.js';
const TAU = Math.PI * 2;
export function createCredit(section) {
  const name = section.querySelector('.cr-name');
  // split the name into letters so each can track in
  const text = name.textContent; name.textContent = '';
  name.setAttribute('aria-label', text);
  [...text].forEach((ch, i) => { const s = document.createElement('span'); s.textContent = ch; s.setAttribute('aria-hidden', 'true'); s.style.setProperty('--i', i); if (ch === ' ') s.className = 'sp'; name.appendChild(s); });
  const cv = section.querySelector('canvas.cr-dust'), g = cv.getContext('2d');
  let on = false, t0 = performance.now();
  const io = new IntersectionObserver((es) => es.forEach((e) => { on = e.isIntersecting; if (on) section.classList.add('in'); }), { threshold: 0.35 });
  io.observe(section);
  const dust = Array.from({ length: 70 }, (_, i) => { const r = rng(700 + i); return { x: r(), y: r(), s: 0.5 + r() * 1.8, v: 0.004 + r() * 0.012, ph: r() * TAU, w: r() }; });
  function frame() {
    if (on) {
      const d = Math.min(devicePixelRatio || 1, 2), W = Math.round(cv.clientWidth * d), H = Math.round(cv.clientHeight * d);
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      const t = (performance.now() - t0) / 1000;
      g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
      for (const p of dust) {
        const x = ((p.x + Math.sin(t * 0.2 + p.ph) * 0.02 + t * p.v * 0.3) % 1) * W, y = ((p.y - t * p.v * 0.5) % 1 + 1) % 1 * H;
        const a = 0.25 + 0.35 * Math.sin(t * (1 + p.w) + p.ph) ** 2, r = p.s * d;
        const gr = g.createRadialGradient(x, y, 0, x, y, r * 4);
        gr.addColorStop(0, `rgba(255,226,150,${a.toFixed(3)})`); gr.addColorStop(1, 'rgba(255,190,90,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 4, 0, TAU); g.fill();
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return { reveal: () => section.classList.add('in') };
}
