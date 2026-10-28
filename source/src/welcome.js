// Family welcome, in the style of the TVK leadership section: each family member lands with a
// stop-motion flash, a breathing gold aura and rising embers, then their AI-animated clip plays the
// vanakkam and their name and welcome slide in as the palms meet. Scroll moves to the next person.
//
// Each clip is one H.264 video with the colour on the left half and the alpha matte on the right
// (works on every phone, including iPhone), composited in a tiny WebGL shader.
import { rng } from './backdrop.js';
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

const VS = `attribute vec2 p; varying vec2 uv; void main(){ uv = vec2(p.x * .5 + .5, .5 - p.y * .5); gl_Position = vec4(p, 0., 1.); }`;
const FS = `precision mediump float; varying vec2 uv; uniform sampler2D v; uniform float white, split, fade, tfade;
  vec4 at(vec2 q){ q.x = clamp(q.x, 0.002, .998); vec3 c = texture2D(v, vec2(q.x * .5, q.y)).rgb; float a = texture2D(v, vec2(.5 + q.x * .5, q.y)).r; return vec4(c, a); }
  void main(){
    vec4 m = at(uv);
    if (split > 0.) { m.r = at(uv - vec2(split, 0.)).r; m.b = at(uv + vec2(split, 0.)).b; m.a = max(m.a, max(at(uv - vec2(split, 0.)).a, at(uv + vec2(split, 0.)).a) * .8); }
    float a = clamp((m.a - .03) / .97, 0., 1.);
    float bf = smoothstep(0., fade, 1. - uv.y) * smoothstep(0., tfade + .0001, uv.y);   // melt the cut-off edges of the frame
    vec3 c = min(m.rgb, vec3(a));                         // colour is already premultiplied (shot on black)
    c = mix(c, vec3(1., .97, .9) * a, white);
    gl_FragColor = vec4(c, a) * bf;
  }`;

function makeLayer(canvas, video) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v));
  const U = { white: gl.getUniformLocation(pr, 'white'), split: gl.getUniformLocation(pr, 'split'), fade: gl.getUniformLocation(pr, 'fade'), tfade: gl.getUniformLocation(pr, 'tfade') };
  gl.clearColor(0, 0, 0, 0);
  return {
    draw({ white = 0, split = 0, fade = 0.1, tfade = 0 } = {}) {
      if (video.readyState < 2) return;
      const w = canvas.clientWidth, h = canvas.clientHeight, d = Math.min(devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(w * d)) { canvas.width = Math.round(w * d); canvas.height = Math.round(h * d); }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.uniform1f(U.white, white); gl.uniform1f(U.split, split); gl.uniform1f(U.fade, fade); gl.uniform1f(U.tfade, tfade);
      gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  };
}

// embers rising off the figure: pure function of time since landing
function drawEmbers(g, W, H, t, dpr) {
  g.clearRect(0, 0, W, H);
  if (t < 0) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  const rate = 14, life = 2.6, n1 = Math.floor(t * rate);
  for (let i = Math.max(0, n1 - Math.ceil(rate * life)); i <= n1; i++) {
    const r = rng(i * 13 + 7), age = t - i / rate; if (age < 0 || age > life) continue;
    // spawn along the silhouette's rough outline: head and shoulders
    const a = Math.PI * (1.05 + r() * 0.9), rx = W * (0.18 + r() * 0.2), ry = H * (0.3 + r() * 0.12);
    const x0 = W * 0.5 + Math.cos(a) * rx, y0 = H * 0.42 + Math.sin(a) * ry;
    const k = age / life, x = x0 + Math.sin(age * 2 + r() * 6) * 10 * dpr + (r() - 0.5) * 30 * dpr * age, y = y0 - (40 + r() * 80) * dpr * age;
    const al = Math.sin(Math.PI * k) * (0.55 + 0.45 * Math.sin(age * 15 + r() * 6));
    g.fillStyle = `rgba(255,${r() < 0.5 ? 196 : 150},${r() < 0.5 ? 92 : 50},${al.toFixed(3)})`;
    g.beginPath(); g.arc(x, y, (0.8 + r() * 2) * dpr * (1 - k * 0.5), 0, TAU); g.fill();
  }
  // landing burst
  if (t < 1) for (let i = 0; i < 60; i++) {
    const r = rng(9000 + i), an = Math.PI * (1 + r()), sp = (150 + r() * 300) * dpr, d = sp * t * (1 - t * 0.4);
    const x = W * 0.5 + Math.cos(an) * (W * 0.2 + d), y = H * 0.45 + Math.sin(an) * (H * 0.25 + d * 0.6) + 200 * dpr * t * t;
    g.fillStyle = `rgba(255,220,140,${(1 - t).toFixed(3)})`; g.beginPath(); g.arc(x, y, (1 + r() * 2) * dpr, 0, TAU); g.fill();
  }
  g.restore();
}

export function createWelcome(section, clips) {
  const stage = section.querySelector('.wl-stage');
  const people = [...section.querySelectorAll('.wl-person')];
  const dots = [...section.querySelectorAll('.wl-dots i')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const P = people.map((el, i) => {
    const video = document.createElement('video');
    video.muted = true; video.playsInline = true; video.setAttribute('playsinline', ''); video.setAttribute('muted', ''); video.preload = 'auto'; video.crossOrigin = 'anonymous';
    video.src = clips[i].src;
    const canvas = el.querySelector('canvas.wl-fig'), emb = el.querySelector('canvas.wl-emb');
    const layer = makeLayer(canvas, video);
    return { el, video, canvas, emb, eg: emb.getContext('2d'), layer, copy: el.querySelector('.wl-copy'), meet: clips[i].meet, head: clips[i].head || 0.3, tfade: clips[i].tfade || 0, state: 'idle', t0: 0 };
  });
  let active = -1;
  const now = () => performance.now() / 1000;
  function enter(i) {
    const p = P[i]; if (!p || p.state !== 'idle') return;
    p.state = 'enter'; p.t0 = now();
    p.video.currentTime = 0;
    const go = p.video.play(); if (go && go.catch) go.catch(() => { /* autoplay blocked: start on first touch */ addEventListener('pointerdown', () => p.video.play(), { once: true }); });
  }
  function reset(i) { const p = P[i]; if (!p) return; p.state = 'idle'; p.video.pause(); p.video.currentTime = 0; p.copy.classList.remove('in'); }
  // keep each figure clear of its text at every screen size: shrink the figure if they would touch
  function fit() {
    const W = stage.clientWidth, H = stage.clientHeight, phone = W / H < 0.8;
    const dots = section.querySelector('.wl-dots'), topLimit = dots.offsetTop + dots.offsetHeight + 10;
    for (const p of P) {
      const fb = p.el.querySelector('.wl-figbox'), copy = p.copy;
      fb.style.height = ''; copy.style.top = ''; copy.style.translate = ''; copy.style.setProperty('--wk', 1);
      // text block: scale it down until it fits between the dots and the bottom of the screen
      const room = H - topLimit - 14;
      for (let i = 0; i < 4 && copy.offsetHeight > room; i++) copy.style.setProperty('--wk', Math.max(0.55, (+copy.style.getPropertyValue('--wk') || 1) * room / copy.offsetHeight * 0.98).toFixed(3));
      if (!phone && copy.offsetTop - copy.offsetHeight / 2 < topLimit) { copy.style.top = topLimit + 'px'; copy.style.translate = '0 0'; }
      const ar = fb.offsetWidth / Math.max(1, fb.offsetHeight);
      if (phone) {
        const copyBottom = copy.offsetTop + copy.offsetHeight;          // copy sits above the figure
        const maxH = H - copyBottom - 12;
        if (fb.offsetHeight > maxH) fb.style.height = Math.max(H * 0.22, maxH) + 'px';
      } else {
        const fx = fb.offsetLeft + fb.offsetWidth / 2;                    // figure centre (translate -50% is already in offsetLeft? no: compute)
        const cxp = parseFloat(getComputedStyle(fb).left);                // the anchor, before the -50% shift
        const copyLeft = copy.offsetLeft;
        const copyTop = copy.style.top ? copy.offsetTop : copy.offsetTop - copy.offsetHeight / 2;
        const half = fb.offsetWidth / 2, room = copyLeft - 24 - cxp;     // space between the anchor and the text
        if (half * 0.94 > room) fb.style.height = Math.max(H * 0.3, (room / 0.94) * 2 / ar) + 'px';
        // a figure taller than the stage would push the head under the heading
        const maxH = H - 70; if (fb.offsetHeight > maxH) fb.style.height = maxH + 'px';
        void fx;
      }
    }
  }
  // the gold ring and rays sit behind the current person's head
  function aimHalo() {
    const p = P[Math.max(0, active)]; const fb = p.el.querySelector('.wl-figbox');
    const H = stage.clientHeight, fh = fb.offsetHeight, top = H - fh;
    stage.style.setProperty('--fy', ((top + fh * p.head) / H * 100).toFixed(2) + '%');
  }
  // which person is on stage, from the scroll position inside the pinned section
  function onScroll() {
    const r = section.getBoundingClientRect(), total = section.offsetHeight - stage.offsetHeight;
    const prog = clamp(-r.top / Math.max(1, total));
    const visible = r.top < innerHeight * 0.35 && r.bottom > innerHeight * 0.5;
    const idx = visible ? Math.min(P.length - 1, Math.floor(prog * P.length * 0.999)) : -1;
    if (idx !== active) {
      if (active >= 0 && idx < active) reset(active);
      active = idx;
      people.forEach((el, k) => { el.classList.toggle('on', k === idx || (idx < 0 && k === 0)); el.classList.toggle('past', idx >= 0 && k < idx); });
      dots.forEach((d, k) => d.classList.toggle('on', k === Math.max(0, idx)));
      if (idx >= 0) enter(idx);
      aimHalo();
    }
    if (r.top > innerHeight * 0.9) P.forEach((_, k) => reset(k));    // scrolled back above: replay next time
  }
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', () => { fit(); onScroll(); aimHalo(); });

  function frame() {
    for (const p of P) {
      if (!p.layer || !p.el.classList.contains('on')) continue;
      const t = p.state === 'idle' ? -1 : now() - p.t0;
      // stop-motion entry at 12 fps: white silhouette drops in, colour split, overshoot, settle
      const k = Math.floor(Math.max(0, t) * 12);
      let white = 0, split = 0, dy = 0, s = 1, op = 1;
      if (p.state === 'idle') { op = 0; }
      else if (k === 0) { white = 1; dy = 26; s = 0.95; op = 0.7; }
      else if (k === 1) { split = 0.012; dy = 8; s = 0.985; }
      else if (k === 2) { dy = -6; s = 1.03; }
      else if (k === 3) { dy = 2; s = 0.995; }
      if (reduce && p.state !== 'idle') { white = 0; split = 0; dy = 0; s = 1; op = 1; }
      p.canvas.style.opacity = op;
      p.canvas.style.transform = `translateY(${dy}%) scale(${s})`;
      // breathing gold aura, brightest just after landing
      const glow = p.state === 'idle' ? 0 : 0.55 + 0.25 * Math.sin(t * 1.7) + (t < 1 ? (1 - t) * 0.8 : 0);
      p.canvas.style.filter = `drop-shadow(0 0 ${(10 + 8 * glow).toFixed(1)}px rgba(255,176,46,${(0.55 * glow).toFixed(3)})) drop-shadow(0 0 ${(34 + 16 * glow).toFixed(1)}px rgba(255,140,40,${(0.32 * glow).toFixed(3)}))`;
      p.layer.draw({ white, split, fade: 0.14, tfade: p.tfade });
      // embers
      const ew = p.emb.clientWidth, eh = p.emb.clientHeight, d = Math.min(devicePixelRatio || 1, 2);
      if (p.emb.width !== Math.round(ew * d)) { p.emb.width = Math.round(ew * d); p.emb.height = Math.round(eh * d); }
      drawEmbers(p.eg, p.emb.width, p.emb.height, p.state === 'idle' ? -1 : t - 0.25, d);
      // name and welcome arrive as the palms meet
      if (p.state !== 'idle' && (p.video.currentTime >= p.meet || p.video.ended || reduce)) p.copy.classList.add('in');
      if (p.video.ended && p.state !== 'held') p.state = 'held';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  fit(); onScroll(); aimHalo();
  return { fit, people: P, enter, reset, onScroll };
}
