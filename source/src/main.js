// E-invite hero: Vijay's slash, and the gold streak becomes a pen that writes the couple's names;
// their portraits land on either side, then the date and countdown rise in.
// Every layer is drawn as a pure function of the timeline time `t`, so it can be replayed or seeked.
import { createLeaderSlash, TRANSITION, ENTER } from './slash.js';
import { createBackdrop } from './backdrop.js';
import { createDecor } from './decor.js';
import { paintFrame } from './frame.js';
import { goldDefs, createName, createHeart } from './write.js';
import { createFx } from './fx.js';
import NAMES from './names.json';
import { createOlai } from './olai.js';
import { createWelcome } from './welcome.js';
import { createVenue } from './venue.js';
import { createCredit } from './credit.js';

const SRC = { start: '__IMG_START__', end: '__IMG_END__', flag: '__IMG_FLAG__', groom: '__IMG_GROOM__', bride: '__IMG_BRIDE__' };
const WEDDING = new Date('2026-11-18T18:00:00+05:30');      // wedding reception: Wed 18 Nov 2026, 6:00 PM

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const io = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const out3 = (x) => 1 - Math.pow(1 - clamp(x), 3);
const backOut = (x) => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const span = (t, a, b) => clamp((t - a) / (b - a));

// ---------- timeline (seconds) ----------
const T = {};
T.enter = 1.15; T.hold = T.enter + ENTER + 0.5; T.slashEnd = T.hold + TRANSITION;
T.retract0 = T.hold + 4 / 12; T.retract1 = T.retract0 + 0.55;
T.fly0 = T.retract0 + 0.3; T.fly1 = T.fly0 + 0.8;
T.glide0 = T.slashEnd + 0.12; T.glide1 = T.glide0 + 1.0;
T.a0 = T.fly1; T.a1 = T.a0 + 1.6;
T.groom = T.a1 - 0.2;
T.h0 = T.a1 + 0.12; T.h1 = T.h0 + 0.55;
T.b0 = T.h1 + 0.1; T.b1 = T.b0 + 1.75;
T.bride = T.b1 - 0.2;
T.bloom = T.b1 + 0.1;
T.meta = T.b1 + 0.3;
T.done = T.meta + 1.3;

const load = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = src; });
const $ = (s) => document.querySelector(s);

Promise.all([load(SRC.start), load(SRC.end), load(SRC.flag), load(SRC.groom), load(SRC.bride), document.fonts.ready]).then(([start, end, flag, groom, bride]) => {
  const hero = $('#hero');
  const vj = createLeaderSlash($('#vj'), { start, end });
  const bg = createBackdrop($('#bg'), { flag });
  const decor = createDecor($('#decor'));
  const fx = createFx($('#fx'));
  goldDefs(hero);
  const nameA = createName($('#nameA'), NAMES.a, 'Bathri Sri');
  const nameB = createName($('#nameB'), NAMES.b, 'Sri Nandhini');
  const heart = createHeart($('#heart'));
  const lines = [...document.querySelectorAll('.w i')];
  const pfs = [{ el: $('.pf.groom'), photo: groom, seed: 1, side: 'groom', at: () => T.groom }, { el: $('.pf.bride'), photo: bride, seed: 2, side: 'bride', at: () => T.bride }];
  const metaKids = [...document.querySelectorAll('.meta > *')];
  const replayBtn = $('#replay');

  let cssW = 0, cssH = 0, portrait = false, L = {};
  function layout() {
    const r = hero.getBoundingClientRect(); cssW = r.width; cssH = r.height; portrait = cssW / cssH < 0.8;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    for (const l of [vj, bg, decor, fx]) l.resize(cssW, cssH, dpr);
    for (const p of pfs) {                     // paint each medallion at its displayed size
      const D = p.el.offsetWidth || 200;
      const cv = p.el.querySelector('canvas'); const f = paintFrame(p.photo, Math.round(D * dpr), { seed: p.seed, side: p.side });
      cv.width = f.canvas.width; cv.height = f.canvas.height; cv.getContext('2d').drawImage(f.canvas, 0, 0); p.f = f;
    }
    // where the leader ends up: small, top centre, above the names
    const couple = $('.couple').getBoundingClientRect();
    for (const p of pfs) { p.cx = couple.left - r.left + p.el.offsetLeft + p.el.offsetWidth / 2; p.cy = couple.top - r.top + p.el.offsetTop + p.el.offsetWidth * (p.f.cy / p.f.canvas.width); }
    const targetH = cssH * (portrait ? 0.25 : 0.32);
    L.zoomF = targetH / vj.figH();
    L.oyF = (couple.top - r.top) + cssH * (portrait ? 0.025 : 0.03) - cssH;     // bust bottom tucked just behind the names block
    L.flagY = cssH * (portrait ? 0.17 : 0.22); L.flagW = Math.min(cssW * (portrait ? 1.05 : 0.6), cssH * (portrait ? 0.62 : 0.85) * 1.5);
    L.mandY = (couple.top - r.top) + couple.height * 0.5;
  }
  // the pen's position at any time (css px within the hero)
  const lerp = (a, b, k) => (a && b ? { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k } : null);
  function posAt(t) {
    const o = hero.getBoundingClientRect();
    if (t < T.fly0) return null;
    if (t <= T.fly1) {
      const tip = vj.tip(), x0 = Math.min(tip.x, cssW - 14), y0 = tip.y + (x0 - tip.x) * Math.tan(tip.ang);
      const p3 = nameA.pen(0, o); if (!p3) return null;
      const k = io(span(t, T.fly0, T.fly1)), u = 1 - k;
      const c1 = { x: x0 - cssW * 0.05, y: y0 - cssH * 0.32 }, c2 = { x: p3.x - cssW * (portrait ? 0.1 : 0.22), y: p3.y - cssH * 0.3 };
      return { x: u * u * u * x0 + 3 * u * u * k * c1.x + 3 * u * k * k * c2.x + k * k * k * p3.x, y: u * u * u * y0 + 3 * u * u * k * c1.y + 3 * u * k * k * c2.y + k * k * k * p3.y };
    }
    if (t <= T.a1) return nameA.pen(span(t, T.a0, T.a1), o);
    if (t < T.h0) return lerp(nameA.pen(1, o), heart.pen(0, o), io(span(t, T.a1, T.h0)));
    if (t <= T.h1) return heart.pen(span(t, T.h0, T.h1), o);
    if (t < T.b0) return lerp(heart.pen(1, o), nameB.pen(0, o), io(span(t, T.h1, T.b0)));
    return nameB.pen(span(t, T.b0, T.b1), o);
  }

  function countdown() {
    let s = Math.max(0, Math.floor((WEDDING - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s -= m * 60;
    const pad = (n) => String(n).padStart(2, '0');
    $('#cd-d').textContent = d; $('#cd-h').textContent = pad(h); $('#cd-m').textContent = pad(m); $('#cd-s').textContent = pad(s);
  }
  countdown(); setInterval(countdown, 1000);

  function frame(t) {
    const o = hero.getBoundingClientRect();
    // backdrop and décor
    const intro = out3(span(t, 0, 1.0)), glow = out3(span(t, T.bloom - 0.3, T.bloom + 1.2));
    const P = window.__prof, pt = () => performance.now(); let q = pt();
    bg.render(t, { intro, glow, flagY: L.flagY, flagW: L.flagW, mandY: L.mandY });
    if (P) { P.bg = (P.bg || 0) + pt() - q; q = pt(); }
    // the leader
    let mode = 'blank', tv = 0;
    if (t >= T.enter && t < T.enter + ENTER) { mode = 'enter'; tv = t - T.enter; }
    else if (t >= T.enter + ENTER && t < T.hold) { mode = 'start'; tv = t - T.enter; }
    else if (t >= T.hold) { mode = 'slash'; tv = t - T.hold; }
    const gl = io(span(t, T.glide0, T.glide1));
    vj.render(tv, { mode, zoom: 1 + (L.zoomF - 1) * gl, oy: L.oyF * gl, retract: span(t, T.retract0, T.retract1), fade: Math.min(1, gl * 6) });
    if (P) { P.vj = (P.vj || 0) + pt() - q; q = pt(); }
    decor.render(t, { thoranam: backOut(span(t, 0.25, 1.15)), strands: out3(span(t, 0.45, 1.6)), lamps: out3(span(t, 0.3, 0.9)), lit: out3(span(t, 0.7, 1.1)) });
    if (P) { P.decor = (P.decor || 0) + pt() - q; q = pt(); }
    // names, heart, lines
    const shineT = t > T.done ? ((t - T.done) % 5.5) / 1.6 : null;
    nameA.set(span(t, T.a0, T.a1), shineT !== null && shineT <= 1 ? shineT : null);
    nameB.set(span(t, T.b0, T.b1), shineT !== null && shineT >= 0.3 && shineT <= 1.3 ? shineT - 0.3 : null);
    heart.set(span(t, T.h0, T.h1));
    const li = out3(span(t, T.h0 - 0.1, T.h1 + 0.2));
    lines.forEach((l) => { l.style.opacity = li; l.style.transform = `scaleX(${li})`; });
    // portraits land with an overshoot
    for (const p of pfs) {
      const k = span(t, p.at(), p.at() + 0.6), s = 0.3 + 0.7 * backOut(k);
      p.el.style.opacity = clamp(k * 3); p.el.style.transform = `scale(${s.toFixed(4)}) rotate(${((1 - backOut(k)) * (p.side === 'groom' ? -8 : 8)).toFixed(2)}deg)`;
    }
    // date + countdown
    metaKids.forEach((m, i) => { const k = out3(span(t, T.meta + i * 0.16, T.meta + i * 0.16 + 0.7)); m.style.opacity = k; m.style.transform = `translateY(${(16 * (1 - k)).toFixed(2)}px)`; });
    if (P) { P.dom = (P.dom || 0) + pt() - q; q = pt(); }
    // effects
    fx.clear();
    fx.rain(t, T.bloom, out3(span(t, T.bloom, T.bloom + 1)) * 0.9);
    for (const p of pfs) {
      fx.burst(t - p.at() - 0.18, p.cx, p.cy, p.el.offsetWidth * 0.5, p.seed);
    }
    if (t >= T.fly0 && t <= T.b1 + 0.35) fx.pen(t, posAt, { from: T.fly0, intensity: t > T.b1 ? 1 - span(t, T.b1, T.b1 + 0.35) : 1 });
    if (t > T.a1) fx.twinkle(t, nameA.box(o), out3(span(t, T.a1, T.a1 + 0.6)), 1);
    if (t > T.b1) fx.twinkle(t + 0.7, nameB.box(o), out3(span(t, T.b1, T.b1 + 0.6)), 2);
    if (P) { P.fx = (P.fx || 0) + pt() - q; }
    replayBtn.classList.toggle('in', t > T.done);
  }

  layout();
  let raf = 0, t0 = performance.now() / 1000, paused = null;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) t0 -= T.done + 0.01;
  addEventListener('resize', () => { layout(); });
  const loop = () => {
    const t = paused !== null ? paused : performance.now() / 1000 - t0;
    frame(reduce ? Math.min(t, T.done + 0.01) : t);
    raf = requestAnimationFrame(loop);
  };
  loop();
  replayBtn.addEventListener('click', () => { t0 = performance.now() / 1000; paused = null; });
  window.__olai = createOlai(document.getElementById('olai'));
  const clipURL = (b64) => { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return URL.createObjectURL(new Blob([u], { type: 'video/mp4' })); };
  window.__welcome = createWelcome(document.getElementById('welcome'), [{ src: clipURL('__VID_APPA__'), meet: 1.7, head: 0.26 }, { src: clipURL('__VID_AMMA__'), meet: 1.15, head: 0.3, tfade: 0.035 }, { src: clipURL('__VID_SIS__'), meet: 1.45, head: 0.38 }]);
  window.__venue = createVenue(document.getElementById('venue'));
  window.__credit = createCredit(document.getElementById('credit'));
  window.__hero = { T, seek: (t) => { paused = t; frame(t); }, play: () => { paused = null; t0 = performance.now() / 1000; }, layout };
});
