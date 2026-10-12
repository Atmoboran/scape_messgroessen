"use strict";
/* =========================================================
   Hilfsfunktionen
   ========================================================= */
/* Schrift und Farben kommen aus dem Theme (theme/theme.js). */
const FONT = THEME.font;
const C = THEME.palette;
/* Alle Simulationen zeichnen in ein quadratisches Feld von 600 × 600
   Einheiten. Quadratisch ist der beste Kompromiss aus Querformat (Desktop)
   und Hochformat (Handy). Schriftgrößen sind in diesen Einheiten angegeben:
   nie unter 20, damit Beschriftungen auch auf dem Handy (≈ 350 px breit)
   noch gut 12 px groß sind. */
const W = 600, H = 600;
const FS = { s: 20, m: 22, l: 26, xl: 34 };
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;
function fmt(n, d = 0) {
  let s = Math.abs(n).toFixed(d);
  const zero = Number(s) === 0;
  let [i, f] = s.split('.');
  if (i.length > 4) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  s = f ? i + ',' + f : i;
  return (n < 0 && !zero ? '−' : '') + s;
}
function makeView(canvas, W, H) {
  const ctx = canvas.getContext('2d');
  let lw = 0, lh = 0;
  return {
    ctx, W, H, canvas,
    fit() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (w !== lw || h !== lh) {
        lw = w; lh = h;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
      return true;
    },
    local(e) {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
    }
  };
}

function text(ctx, str, x, y, size, color, weight = 500, align = 'left', base = 'alphabetic') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
  ctx.fillText(str, x, y);
}

function arrow(ctx, x, y, dx, dy, color, width = 3, head = 10) {
  const len = Math.hypot(dx, dy);
  if (len < 2) return;
  const ux = dx / len, uy = dy / len;
  const h = Math.min(head, len * 0.6);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx - ux * h * 0.8, y + dy - uy * h * 0.8); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + dx, y + dy);
  ctx.lineTo(x + dx - ux * h - uy * h * 0.55, y + dy - uy * h + ux * h * 0.55);
  ctx.lineTo(x + dx - ux * h + uy * h * 0.55, y + dy - uy * h - ux * h * 0.55);
  ctx.closePath(); ctx.fill();
}

function circle(ctx, x, y, r, fill, stroke, lw = 2) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

let uid = 0;
/* Grundgerüst jeder Simulation: quadratische Leinwand (host.view),
   Bedienzeilen, Anzeige und Hinweis (host.ctrl) */
function simShell(host, { label = 'Simulation', drag = false } = {}) {
  const frame = el('div', 'sim-frame');
  const canvas = el('canvas', drag ? 'drag' : '');
  canvas.width = W; canvas.height = H;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', label);
  frame.appendChild(canvas);
  host.view.appendChild(frame);
  const view = makeView(canvas, W, H);
  const ctrl = host.ctrl;
  let readEl = null, lastRead = '';
  return {
    view, ctx: view.ctx, canvas, ctrl,
    row() { const r = el('div', 'controls'); ctrl.appendChild(r); return r; },
    readout() { readEl = el('p', 'readout'); readEl.setAttribute('aria-live', 'polite'); ctrl.appendChild(readEl); },
    setRead(t) { if (readEl && t !== lastRead) { readEl.textContent = t; lastRead = t; } },
    hint(t) { const p = el('p', 'hint', t); ctrl.appendChild(p); return p; }
  };
}

function slider(row, o) {
  const id = 'r' + (++uid);
  const w = el('div', 'range');
  w.innerHTML = `<label for="${id}">${o.label}</label><input type="range" id="${id}" min="${o.min}" max="${o.max}" step="${o.step}" value="${o.value}"><output for="${id}"></output>`;
  row.appendChild(w);
  const input = $('input', w), out = $('output', w);
  const upd = () => { out.textContent = o.format ? o.format(+input.value) : input.value; };
  input.addEventListener('input', () => { upd(); if (o.onInput) o.onInput(+input.value); });
  upd();
  return { input, get: () => +input.value, set(v) { input.value = v; upd(); } };
}

function button(row, label, onClick, cls = '') {
  const b = el('button', 'btn ' + cls, label);
  b.type = 'button';
  b.addEventListener('click', onClick);
  row.appendChild(b);
  return b;
}

function toggle(row, labels, state, onChange) {
  const b = button(row, '', () => { state = !state; upd(); onChange(state); });
  const upd = () => { b.setAttribute('aria-pressed', state ? 'true' : 'false'); b.textContent = state ? labels[0] : labels[1]; };
  upd();
  return { el: b, set(v) { state = v; upd(); } };
}

function seg(row, options, value, onChange, aria = 'Auswahl') {
  const g = el('div', 'seg');
  g.setAttribute('role', 'group'); g.setAttribute('aria-label', aria);
  const btns = options.map(o => {
    const b = el('button', 'btn', o.label);
    b.type = 'button';
    b.addEventListener('click', () => { set(o.value); onChange(o.value); });
    g.appendChild(b);
    return [o.value, b];
  });
  function set(v) { btns.forEach(([val, b]) => b.setAttribute('aria-pressed', val === v ? 'true' : 'false')); }
  set(value);
  row.appendChild(g);
  return { set };
}

/* Ziehen auf der Leinwand (Maus, Finger, Stift) */
function dragOn(view, h) {
  let active = false;
  const c = view.canvas;
  c.addEventListener('pointerdown', e => {
    const p = view.local(e);
    if (h.down(p) === false) return;
    active = true; c.setPointerCapture(e.pointerId); e.preventDefault();
  });
  c.addEventListener('pointermove', e => { if (active) h.move(view.local(e)); });
  const up = () => { if (active) { active = false; if (h.up) h.up(); } };
  c.addEventListener('pointerup', up);
  c.addEventListener('pointercancel', up);
}

/* Thermometer (senkrecht); ticks = false lässt die Skalenzahlen weg */
function thermo(ctx, x, top, bottom, tMin, tMax, T, color, label, value, ticks = true) {
  const w = 24, br = 20;
  const yOf = t => bottom - (clamp(t, tMin, tMax) - tMin) / (tMax - tMin) * (bottom - top);
  ctx.fillStyle = C.white; ctx.fillRect(x - w / 2, top, w, bottom - top + 6);
  ctx.fillStyle = color; const y = yOf(T); ctx.fillRect(x - w / 2 + 5, y, w - 10, bottom - y + 8);
  circle(ctx, x, bottom + br - 4, br, color, C.black, 3);
  ctx.strokeStyle = C.black; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - w / 2, bottom + 2); ctx.lineTo(x - w / 2, top); ctx.lineTo(x + w / 2, top); ctx.lineTo(x + w / 2, bottom + 2); ctx.stroke();
  ctx.lineWidth = 2;
  for (let t = Math.ceil(tMin / 10) * 10; t <= tMax; t += 10) {
    const yy = yOf(t);
    ctx.beginPath(); ctx.moveTo(x + w / 2, yy); ctx.lineTo(x + w / 2 + 8, yy); ctx.stroke();
    if (ticks) text(ctx, fmt(t), x + w / 2 + 11, yy + 7, FS.s, C.black, 500);
  }
  if (label) label.split('\n').forEach((l, i, a) => text(ctx, l, x, top - 12 - (a.length - 1 - i) * 23, FS.s, C.black, 500, 'center'));
  if (value) text(ctx, value, x, bottom + br * 2 + 26, FS.m, C.black, 500, 'center');
}

/* elastische Stöße zwischen gleich schweren Teilchen */
function collide(P, W, H, cell = 18) {
  const GW = Math.ceil(W / cell), GH = Math.ceil(H / cell);
  const grid = new Map();
  for (let i = 0; i < P.length; i++) {
    const p = P[i], k = clamp((p.y / cell) | 0, 0, GH - 1) * GW + clamp((p.x / cell) | 0, 0, GW - 1);
    let a = grid.get(k); if (!a) grid.set(k, a = []); a.push(i);
  }
  for (let i = 0; i < P.length; i++) {
    const a = P[i];
    const gx = clamp((a.x / cell) | 0, 0, GW - 1), gy = clamp((a.y / cell) | 0, 0, GH - 1);
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const cx = gx + ox, cy = gy + oy;
      if (cx < 0 || cy < 0 || cx >= GW || cy >= GH) continue;
      const list = grid.get(cy * GW + cx); if (!list) continue;
      for (const j of list) {
        if (j <= i) continue;
        const b = P[j];
        const dx = b.x - a.x, dy = b.y - a.y, rr = a.r + b.r, d2 = dx * dx + dy * dy;
        if (d2 >= rr * rr || d2 === 0) continue;
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
        const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        if (rel > 0) { a.vx -= rel * nx; a.vy -= rel * ny; b.vx += rel * nx; b.vy += rel * ny; }
        const push = (rr - d) / 2;
        a.x -= nx * push; a.y -= ny * push; b.x += nx * push; b.y += ny * push;
      }
    }
  }
}

/* Farbe nach Geschwindigkeit (blau = langsam/kalt, rot = schnell/warm) */
function speedColor(s) {
  return s > 300 ? C.red : s > 230 ? C.orange : s > 160 ? C.yellowS : s > 100 ? C.cyan3 : C.blue;
}
/* Legende unter dem Kasten: LANGSAM ● ● ● ● ● SCHNELL, zentriert um cx */
function speedLegend(ctx, cx, y) {
  const cols = [C.blue, C.cyan3, C.yellowS, C.orange, C.red];
  const x0 = cx - 2 * 26;
  text(ctx, 'LANGSAM', x0 - 18, y + 7, FS.s, C.black, 500, 'right');
  cols.forEach((c, i) => circle(ctx, x0 + i * 26, y, 9, c));
  text(ctx, 'SCHNELL', x0 + 4 * 26 + 18, y + 7, FS.s, C.black, 500, 'left');
}

/* Feuchte-Physik (Magnus-Formel) */
const satVap = T => 6.112 * Math.exp(17.62 * T / (243.12 + T));         // hPa
const satDens = T => 216.7 * satVap(T) / (T + 273.15);                  // g/m³
function dewPoint(T, RH) {
  const g = Math.log(clamp(RH, 1, 100) / 100) + 17.62 * T / (243.12 + T);
  return 243.12 * g / (17.62 - g);
}

/* Wind & Empfinden */
const BFT = [0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7];
const beaufort = ms => { let b = 0; while (b < BFT.length && ms >= BFT[b]) b++; return b; };
function windChill(T, v) {          // v in m/s, Formel nach Environment Canada / NWS
  const k = v * 3.6;
  if (T > 10 || k <= 4.8) return T;
  const p = Math.pow(k, 0.16);
  return 13.12 + 0.6215 * T - 11.37 * p + 0.3965 * T * p;
}
function heatIndex(T, RH) {         // Rothfusz (NOAA), Rechnung in °F
  const F = T * 9 / 5 + 32, R = RH;
  let HI = 0.5 * (F + 61 + (F - 68) * 1.2 + R * 0.094);
  if ((HI + F) / 2 >= 80) {
    HI = -42.379 + 2.04901523 * F + 10.14333127 * R - 0.22475541 * F * R - 0.00683783 * F * F
      - 0.05481717 * R * R + 0.00122874 * F * F * R + 0.00085282 * F * R * R - 0.00000199 * F * F * R * R;
  }
  return (HI - 32) * 5 / 9;
}
function apparentT(T, RH, v) {      // Steadman, Variante „Schatten, Wind ausgesetzt“
  const e = RH / 100 * 6.105 * Math.exp(17.27 * T / (237.7 + T));
  return T + 0.33 * e - 0.70 * v - 4.00;
}
function feltT(T, RH, v) {
  if (T < 4.4) return { t: windChill(T, v), mode: 'Windkühle' };
  if (T > 26.7) return { t: Math.max(T, heatIndex(T, RH)), mode: 'Hitzeindex' };
  return { t: T, mode: 'Lufttemperatur' };
}

/* Mond */
const SYN = 29.530588853;
function moonAge(date) {
  const ref = Date.UTC(2000, 0, 6, 18, 14);
  const d = (date.getTime() - ref) / 86400000;
  return ((d % SYN) + SYN) % SYN;
}
function moonName(age) {
  const f = age / SYN;
  if (f < 0.03 || f > 0.97) return 'Neumond';
  if (f < 0.22) return 'Zunehmende Sichel';
  if (f < 0.28) return 'Erstes Viertel';
  if (f < 0.47) return 'Zunehmender Mond';
  if (f < 0.53) return 'Vollmond';
  if (f < 0.72) return 'Abnehmender Mond';
  if (f < 0.78) return 'Letztes Viertel';
  return 'Abnehmende Sichel';
}
/* Mond, wie wir ihn auf der Nordhalbkugel sehen (zunehmend: rechts hell) */
function drawMoonFace(ctx, x, y, r, age, dark, lit) {
  const phi = age / SYN * TAU;
  const waxing = phi < Math.PI;
  circle(ctx, x, y, r, dark);
  ctx.fillStyle = lit;
  ctx.beginPath();
  if (waxing) ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2); else ctx.arc(x, y, r, Math.PI / 2, Math.PI * 1.5);
  ctx.closePath(); ctx.fill();
  const c = Math.cos(phi);
  ctx.fillStyle = c > 0 ? dark : lit;
  ctx.beginPath(); ctx.ellipse(x, y, Math.abs(c) * r + 0.5, r + 0.5, 0, 0, TAU); ctx.fill();
  circle(ctx, x, y, r, null, C.black, Math.max(1.5, r / 30));
}

const SIMS = {};

/* =========================================================
   TEMPERATUR – Teilchenbewegung (außen) / Raum mit Heizung & Fenster (innen)
   ========================================================= */
SIMS.temperatur = (host, variant) => {
  const innen = variant === 'innen';
  const ui = simShell(host, { label: innen ? 'Raum mit Heizung, Fenster und verschiebbarem Sensor' : 'Luftteilchen in einem Kasten', drag: innen });
  const { view, ctx } = ui;
  const box = innen ? { x0: 16, y0: 16, x1: 584, y1: 540 } : { x0: 16, y0: 16, x1: 400, y1: 540 };
  const R = 7;
  const speedOf = T => 40 + 6 * (T + 20);            // Darstellung: −20 °C → 40 px/s, 40 °C → 400 px/s
  const HOT = 330, COLD = 110, COLD_OPEN = 50;
  const tOfSpeed = s => innen ? 21 + (s - 220) / 12 : -20 + (s - 40) / 6;
  const realSpeed = T => Math.sqrt(8 * 8.314 * (T + 273.15) / (Math.PI * 0.02896));
  let T = 14, heater = true, windowOpen = false;
  const HOME = { x: 300, y: 278 };
  const sensor = { x: HOME.x, y: HOME.y }, RS = 80;
  let sensorT = 21, roomT = 21, dragging = false;
  const P = [];
  const N = innen ? 115 : 80;
  for (let i = 0; i < N; i++) {
    const a = rnd(0, TAU), s = innen ? 220 : speedOf(T);
    P.push({ x: rnd(box.x0 + R, box.x1 - R), y: rnd(box.y0 + R, box.y1 - R), vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: R });
  }
  const heaterY = [320, 520], windowY = [80, 300];

  function step(dt) {
    let rms = 0;
    for (const p of P) rms += p.vx * p.vx + p.vy * p.vy;
    rms = Math.sqrt(rms / P.length);
    if (!innen) {
      const f = 1 + (speedOf(T) / rms - 1) * Math.min(1, dt * 3);
      for (const p of P) { p.vx *= f; p.vy *= f; }
    }
    for (const p of P) {
      if (innen) { // warme Teilchen steigen auf, kalte sinken ab (stark vereinfacht)
        const s2 = (p.vx * p.vx + p.vy * p.vy) / (220 * 220);
        p.vy -= 55 * (s2 - 1) * dt;
      }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < box.x0 + R) {
        p.x = box.x0 + R; p.vx = Math.abs(p.vx);
        if (innen && heater && p.y > heaterY[0] && p.y < heaterY[1]) { const s = Math.hypot(p.vx, p.vy); p.vx *= HOT / s; p.vy *= HOT / s; }
      }
      if (p.x > box.x1 - R) {
        p.x = box.x1 - R; p.vx = -Math.abs(p.vx);
        if (innen && p.y > windowY[0] && p.y < windowY[1]) { const c = windowOpen ? COLD_OPEN : COLD, s = Math.hypot(p.vx, p.vy); p.vx *= c / s; p.vy *= c / s; }
      }
      if (p.y < box.y0 + R) { p.y = box.y0 + R; p.vy = Math.abs(p.vy); }
      if (p.y > box.y1 - R) { p.y = box.y1 - R; p.vy = -Math.abs(p.vy); }
    }
    collide(P, W, H);
  }

  function draw() {
    ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = innen ? C.cream : C.yellowPale;
    ctx.fillRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
    if (innen) {
      // Heizung
      ctx.fillStyle = heater ? C.orange : C.sand;
      ctx.fillRect(box.x0, heaterY[0], 16, heaterY[1] - heaterY[0]);
      ctx.strokeStyle = C.black; ctx.lineWidth = 2;
      for (let y = heaterY[0] + 14; y < heaterY[1]; y += 22) { ctx.beginPath(); ctx.moveTo(box.x0, y); ctx.lineTo(box.x0 + 16, y); ctx.stroke(); }
      text(ctx, heater ? 'HEIZUNG AN' : 'HEIZUNG AUS', box.x0 + 26, heaterY[0] - 10, FS.s, C.black);
      // Fenster
      ctx.fillStyle = windowOpen ? C.blue2 : C.ice;
      ctx.fillRect(box.x1 - 16, windowY[0], 16, windowY[1] - windowY[0]);
      ctx.strokeStyle = C.black; ctx.strokeRect(box.x1 - 16, windowY[0], 16, windowY[1] - windowY[0]);
      text(ctx, windowOpen ? 'FENSTER OFFEN' : 'KALTES FENSTER', box.x1 - 26, windowY[0] - 10, FS.s, C.black, 500, 'right');
    }
    for (const p of P) circle(ctx, p.x, p.y, p.r, speedColor(Math.hypot(p.vx, p.vy)));
    ctx.strokeStyle = C.black; ctx.lineWidth = 4; ctx.strokeRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
    if (innen) {
      ctx.setLineDash([8, 7]); circle(ctx, sensor.x, sensor.y, RS, null, C.black, 2); ctx.setLineDash([]);
      ctx.fillStyle = C.black; ctx.fillRect(sensor.x - 64, sensor.y - 25, 128, 50);
      text(ctx, fmt(sensorT, 1) + ' °C', sensor.x, sensor.y + 10, 28, C.white, 500, 'center');
      if (!dragging) text(ctx, '↔ ZIEH MICH', sensor.x, sensor.y + 50, FS.s, C.black, 500, 'center');
    } else {
      thermo(ctx, 500, 100, 410, -20, 40, T, T >= 20 ? C.red2 : T >= 5 ? C.orange : C.cyan2, 'THERMO–\nMETER', fmt(T) + ' °C');
    }
    speedLegend(ctx, W / 2, 570);
  }

  let readT = 0;
  function frame(dt) {
    if (!view.fit()) return;
    step(dt / 2); step(dt / 2);
    if (innen) {
      let s = 0, n = 0, all = 0;
      for (const p of P) {
        const v2 = p.vx * p.vx + p.vy * p.vy;
        all += v2;
        if ((p.x - sensor.x) ** 2 + (p.y - sensor.y) ** 2 < RS * RS) { s += v2; n++; }
      }
      if (n) sensorT += (tOfSpeed(Math.sqrt(s / n)) - sensorT) * Math.min(1, dt * 1.2);
      roomT += (tOfSpeed(Math.sqrt(all / P.length)) - roomT) * Math.min(1, dt * 1.2);
    }
    draw();
    readT -= dt;
    if (readT <= 0) {
      readT = 0.3;
      if (innen) ui.setRead(`Sensor: ${fmt(sensorT, 1)} °C · Mittel im ganzen Raum: ${fmt(roomT, 1)} °C`);
      else ui.setRead(`${fmt(T)} °C · Echte Luftteilchen sind dabei im Mittel rund ${fmt(Math.round(realSpeed(T) / 5) * 5)} m/s schnell – etwa ${fmt(Math.round(realSpeed(T) * 3.6 / 50) * 50)} km/h`);
    }
  }

  if (innen) {
    const r = ui.row();
    toggle(r, ['Heizung an', 'Heizung aus'], heater, v => { heater = v; });
    toggle(r, ['Fenster offen', 'Fenster zu'], windowOpen, v => { windowOpen = v; });
    button(r, 'Sensor in die Mitte', () => { sensor.x = HOME.x; sensor.y = HOME.y; });
    dragOn(view, {
      down: p => { if (Math.hypot(p.x - sensor.x, p.y - sensor.y) > RS) return false; dragging = true; },
      move: p => { sensor.x = clamp(p.x, box.x0 + 64, box.x1 - 64); sensor.y = clamp(p.y, box.y0 + 30, box.y1 - 30); },
      up: () => { dragging = false; }
    });
    ui.readout();
    ui.hint('Zieh den Sensor durch den Raum. An der Heizung werden die Teilchen schneller (rot), am kalten Fenster langsamer (blau). Wo würdest du die „Raumtemperatur“ messen?');
  } else {
    const r = ui.row();
    const s = slider(r, { label: 'Temperatur', min: -20, max: 40, step: 1, value: T, format: v => fmt(v) + ' °C', onInput: v => { T = v; } });
    const r2 = ui.row();
    button(r2, 'Frostig: −15 °C', () => { T = -15; s.set(T); });
    button(r2, 'Mild: 14 °C', () => { T = 14; s.set(T); });
    button(r2, 'Hitze: 35 °C', () => { T = 35; s.set(T); });
    ui.readout();
    ui.hint('Schieb den Regler: Bei Wärme flitzen die Teilchen, bei Kälte werden sie träge. Ein Thermometer misst diese mittlere Bewegung. In Wirklichkeit sind Luftteilchen winzig und viel schneller – hier sind sie riesig und stark verlangsamt.');
  }
  return { frame };
};

/* =========================================================
   LUFTFEUCHTE – Wasserdampf und Sättigung
   ========================================================= */
SIMS.feuchte = (host, variant) => {
  const innen = variant === 'innen';
  const ui = simShell(host, { label: 'Ein Kubikmeter Luft mit Wasserdampf und ein Gefäß, das die Höchstmenge zeigt' });
  const { view, ctx } = ui;
  const box = { x0: 16, y0: 110, x1: 344, y1: 584 };
  let T = innen ? 21 : 14, Wt = innen ? 8.9 : 8.7;
  let Tt = T, Wtt = Wt;
  const PX = 8.5, GB = 584, GX0 = 384, GX1 = 584;  // Gefäß: Einheiten pro g/m³, Boden, Breite
  const P = [];
  for (let i = 0; i < 110; i++) {
    const a = rnd(0, TAU);
    P.push({ x: rnd(box.x0 + 10, box.x1 - 10), y: rnd(box.y0 + 10, box.y1 - 10), vx: Math.cos(a) * 60, vy: Math.sin(a) * 60 });
  }
  const r1 = ui.row();
  const sT = slider(r1, { label: 'Temperatur', min: -10, max: 35, step: 0.5, value: T, format: v => fmt(v, 1) + ' °C', onInput: v => { Tt = T = v; } });
  const r2 = ui.row();
  const sW = slider(r2, { label: 'Wasserdampf', min: 0, max: 30, step: 0.1, value: Wt, format: v => fmt(v, 1) + ' g/m³', onInput: v => { Wtt = Wt = v; } });
  const r3 = ui.row();
  if (innen) {
    button(r3, 'Kochen / Duschen', () => { Wtt = Math.min(30, Wtt + 4); });
    button(r3, 'Heizen', () => { Tt = Math.min(35, Tt + 3); });
    button(r3, 'Stoßlüften im Winter', () => { Wtt = 4.8; Tt = 18; });
  } else {
    button(r3, 'DWD-Beispiel: 10 °C, 100 %', () => { Tt = 10; Wtt = +satDens(10).toFixed(1); }, 'primary');
    button(r3, 'Auf 20 °C erwärmen', () => { Tt = 20; });
    button(r3, 'Nachts auf 2 °C abkühlen', () => { Tt = 2; });
  }
  ui.readout();
  ui.hint(innen
    ? 'Probier Kochen, Heizen und Lüften aus. Beim Heizen bleibt das Wasser in der Luft gleich – trotzdem sinkt die Prozentzahl, weil warme Luft mehr Wasserdampf aufnehmen kann.'
    : 'Ändere nur die Temperatur, ohne Wasser dazuzugeben: Die Prozentzahl springt, obwohl die Wassermenge gleich bleibt. Kühlt die Luft unter die Sättigung, wird Wasserdampf zu Tröpfchen.');

  let readT = 0;
  function frame(dt) {
    if (!view.fit()) return;
    const k = Math.min(1, dt * 1.6);
    if (Math.abs(Tt - T) > 0.01) { T += (Tt - T) * k; if (Math.abs(Tt - T) < 0.05) T = Tt; sT.set(Math.round(T * 2) / 2); }
    if (Math.abs(Wtt - Wt) > 0.01) { Wt += (Wtt - Wt) * k; if (Math.abs(Wtt - Wt) < 0.02) Wt = Wtt; sW.set(Math.round(Wt * 10) / 10); }
    const ps = satDens(T), vap = Math.min(Wt, ps), liq = Wt - vap, rh = vap / ps * 100;
    const nV = Math.min(P.length, Math.round(vap * 2.6)), nL = Math.min(P.length - nV, Math.round(liq * 2.6));
    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      const sp = i < nV ? 1 : 0.25;
      p.vx += rnd(-80, 80) * dt; p.vy += rnd(-80, 80) * dt;
      const s = Math.hypot(p.vx, p.vy) || 1; p.vx *= 60 / s; p.vy *= 60 / s;
      p.x += p.vx * dt * sp * 1.6; p.y += p.vy * dt * sp * 1.6 + (i >= nV ? 12 * dt : 0);
      if (p.x < box.x0 + 10) { p.x = box.x0 + 10; p.vx = Math.abs(p.vx); }
      if (p.x > box.x1 - 10) { p.x = box.x1 - 10; p.vx = -Math.abs(p.vx); }
      if (p.y < box.y0 + 10) { p.y = box.y0 + 10; p.vy = Math.abs(p.vy); }
      if (p.y > box.y1 - 10) { p.y = box.y1 - 10; p.vy = -Math.abs(p.vy); }
    }
    // Kopfzeile
    ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
    text(ctx, '1 m³ LUFT', 16, 34, FS.l, C.black);
    text(ctx, 'BEI ' + fmt(T, 1) + ' °C', 16, 64, FS.m, C.black);
    circle(ctx, 24, 88, 7, C.teal); text(ctx, 'WASSERDAMPF', 40, 95, FS.s, C.black);
    text(ctx, fmt(rh) + ' %', 584, 60, 52, C.black, 300, 'right');
    text(ctx, 'RELATIVE FEUCHTE', 584, 90, FS.s, C.black, 500, 'right');
    // Kasten
    ctx.fillStyle = T > 22 ? C.pink : T > 8 ? C.paleGreen : C.ice;
    ctx.fillRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
    for (let i = 0; i < nV + nL; i++) {
      const p = P[i];
      if (i < nV) circle(ctx, p.x, p.y, 6, C.teal);
      else { circle(ctx, p.x, p.y, 22, 'rgba(255,255,255,0.75)'); circle(ctx, p.x, p.y, 8, C.cyan, C.black, 1.5); }
    }
    ctx.strokeStyle = C.black; ctx.lineWidth = 4; ctx.strokeRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
    if (nL > 0) { ctx.fillStyle = C.white; ctx.fillRect(box.x0 + 2, box.y1 - 36, box.x1 - box.x0 - 4, 34); text(ctx, 'TRÖPFCHEN (NEBEL)', box.x1 - 10, box.y1 - 12, FS.s, C.black, 500, 'right'); }
    // Gefäß: so viel Wasserdampf passt höchstens hinein
    const gh = ps * PX, top = GB - gh;
    ctx.fillStyle = C.white; ctx.fillRect(GX0, top, GX1 - GX0, gh);
    ctx.fillStyle = C.teal; ctx.fillRect(GX0, GB - vap * PX, GX1 - GX0, vap * PX);
    if (innen) {
      ctx.setLineDash([6, 6]); ctx.strokeStyle = C.black; ctx.lineWidth = 2;
      for (const f of [0.4, 0.6]) { const y = GB - gh * f; ctx.beginPath(); ctx.moveTo(GX0, y); ctx.lineTo(GX1, y); ctx.stroke(); }
      ctx.setLineDash([]);
      const ym = GB - gh * 0.5;
      ctx.fillStyle = C.white; ctx.fillRect((GX0 + GX1) / 2 - 76, ym - 24, 152, 48);
      text(ctx, 'BEHAGLICH', (GX0 + GX1) / 2, ym - 3, FS.s, C.black, 500, 'center');
      text(ctx, '40–60 %', (GX0 + GX1) / 2, ym + 19, FS.s, C.black, 500, 'center');
    }
    ctx.strokeStyle = C.black; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(GX0, top - 8); ctx.lineTo(GX0, GB); ctx.lineTo(GX1, GB); ctx.lineTo(GX1, top - 8); ctx.stroke();
    text(ctx, 'HÖCHSTENS ' + fmt(ps, 1) + ' g', GX0, top - 16, FS.s, C.black);
    if (liq > 0.05) {
      for (let i = 0; i < Math.min(5, Math.ceil(liq)); i++) circle(ctx, GX0 + 10 + i * 22, top - 52, 7, C.cyan, C.black, 1.5);
      text(ctx, '+ ' + fmt(liq, 1) + ' g', GX1, top - 45, FS.s, C.black, 500, 'right');
    }
    readT -= dt;
    if (readT <= 0) {
      readT = 0.25;
      ui.setRead(`Relative Feuchte ${fmt(rh)} % · absolute Feuchte ${fmt(vap, 1)} g/m³ · bei ${fmt(T, 1)} °C höchstens ${fmt(ps, 1)} g/m³` + (liq > 0.05 ? ` · ${fmt(liq, 1)} g/m³ kondensiert` : ''));
    }
  }
  return { frame };
};

/* =========================================================
   TAUPUNKT – beschlagenes Fenster (innen) / Nacht mit Tau & Nebel (außen)
   ========================================================= */
/* Temperaturskala im unteren Drittel (ab y = 400) mit beschrifteten Markern */
function tempScale(ctx, y, tMin, tMax, marks) {
  const x0 = 40, x1 = 560;
  const xOf = t => x0 + (clamp(t, tMin, tMax) - tMin) / (tMax - tMin) * (x1 - x0);
  ctx.fillStyle = C.white; ctx.fillRect(0, 400, W, 200);
  ctx.strokeStyle = C.black; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 400); ctx.lineTo(W, 400); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  ctx.lineWidth = 2;
  for (let t = Math.ceil(tMin / 5) * 5; t <= tMax; t += 5) {
    ctx.beginPath(); ctx.moveTo(xOf(t), y); ctx.lineTo(xOf(t), y + 8); ctx.stroke();
    text(ctx, fmt(t) + '°', xOf(t), y + 30, FS.s, C.black, 500, 'center');
  }
  // Marker: oben die Beschriftung, darunter ein Dreieck; überlappende Beschriftungen rücken eine Zeile höher
  const placed = [];
  for (const m of marks) {
    const x = xOf(m.t);
    let row = 0; while (placed.some(p => p.row === row && Math.abs(p.x - x) < 200)) row++;
    placed.push({ x, row });
    ctx.fillStyle = m.color;
    ctx.beginPath(); ctx.moveTo(x, y - 2); ctx.lineTo(x - 10, y - 20); ctx.lineTo(x + 10, y - 20); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.black; ctx.lineWidth = 1.5; ctx.stroke();
    const ty = y - 30 - row * 28;
    if (row > 0) { ctx.strokeStyle = m.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x, ty + 6); ctx.stroke(); }
    text(ctx, `${m.label} ${fmt(m.t, 1)} °C`, clamp(x, 100, 500), ty, FS.s, C.black, 500, 'center');
  }
}

SIMS.taupunkt = (host, variant) => {
  return variant === 'innen' ? taupunktInnen(host) : taupunktAussen(host);
};

function taupunktInnen(host) {
  const ui = simShell(host, { label: 'Raum, Fensterscheibe und Außenluft – die Scheibe beschlägt, wenn sie kälter als der Taupunkt ist' });
  const { view, ctx } = ui;
  const PX0 = 330, PX1 = 420;     // Scheibe
  let Tin = 21, RH = 50, Tout = 8, glass = 0.45, cover = 0;
  const drops = Array.from({ length: 120 }, () => ({ x: rnd(PX0 + 12, PX1 - 12), y: rnd(36, 380), r: rnd(2, 6), k: Math.random() }));
  const vap = Array.from({ length: 70 }, () => ({ x: rnd(20, 310), y: rnd(100, 380), ph: rnd(0, TAU) }));
  const flakes = Array.from({ length: 22 }, () => ({ x: rnd(430, 592), y: rnd(0, 400), s: rnd(20, 50) }));
  const r1 = ui.row();
  slider(r1, { label: 'Raumluft', min: 16, max: 26, step: 0.5, value: Tin, format: v => fmt(v, 1) + ' °C', onInput: v => { Tin = v; } });
  slider(r1, { label: 'Luftfeuchte', min: 30, max: 85, step: 1, value: RH, format: v => fmt(v) + ' %', onInput: v => { RH = v; } });
  const r2 = ui.row();
  slider(r2, { label: 'Draußen', min: -10, max: 15, step: 0.5, value: Tout, format: v => fmt(v, 1) + ' °C', onInput: v => { Tout = v; } });
  seg(r2, [{ label: 'Einfachglas', value: 0.45 }, { label: 'Doppelglas', value: 0.8 }], glass, v => { glass = v; }, 'Fensterart');
  ui.readout();
  ui.hint('Mach es draußen kälter, bis die Scheibe beschlägt. Dann dreh die Luftfeuchte hoch oder runter: Der Taupunkt wandert mit – und damit die Grenze, ab der Wasser an der Scheibe kondensiert.');

  let readT = 0;
  function frame(dt) {
    if (!view.fit()) return;
    const td = dewPoint(Tin, RH);
    const pane = Tout + glass * (Tin - Tout);
    const target = clamp((td - pane) / 3, 0, 1);
    cover += (target - cover) * Math.min(1, dt * 0.9);
    ctx.fillStyle = C.cream; ctx.fillRect(0, 0, PX0, 400);
    ctx.fillStyle = Tout < 0 ? C.bluePale : C.ice; ctx.fillRect(PX1, 0, W - PX1, 400);
    // Wasserdampf im Raum
    const nv = Math.round(satDens(Tin) * RH / 100 * 4.5);
    for (let i = 0; i < Math.min(nv, vap.length); i++) {
      const v = vap[i]; v.ph += dt;
      circle(ctx, v.x + Math.sin(v.ph * 1.3 + i) * 8, v.y + Math.cos(v.ph + i) * 8, 5, C.teal);
    }
    if (Tout < 0) for (const f of flakes) { f.y = (f.y + f.s * dt) % 400; circle(ctx, f.x, f.y, 3, C.white); }
    // Scheibe
    ctx.fillStyle = C.lavender; ctx.fillRect(PX0, 0, PX1 - PX0, 400);
    ctx.fillStyle = `rgba(255,255,255,${(cover * 0.55).toFixed(3)})`; ctx.fillRect(PX0 + 6, 30, PX1 - PX0 - 12, 356);
    const nd = Math.round(cover * drops.length);
    for (let i = 0; i < nd; i++) { const d = drops[i]; circle(ctx, d.x, d.y, d.r * (0.6 + 0.4 * cover), C.cyan2, C.petrol, 1); }
    ctx.strokeStyle = C.black; ctx.lineWidth = 6; ctx.strokeRect(PX0 + 3, 27, PX1 - PX0 - 6, 362);
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(PX0, 0); ctx.lineTo(PX0, 400); ctx.moveTo(PX1, 0); ctx.lineTo(PX1, 400); ctx.stroke();
    text(ctx, 'RAUM ' + fmt(Tin, 1) + ' °C', 16, 36, FS.l, C.black);
    text(ctx, 'LUFTFEUCHTE ' + fmt(RH) + ' %', 16, 66, FS.s, C.black);
    text(ctx, 'SCHEIBE', (PX0 + PX1) / 2, 20, FS.s, C.black, 500, 'center');
    text(ctx, 'DRAUSSEN', (PX1 + W) / 2, 56, FS.m, C.black, 500, 'center');
    text(ctx, fmt(Tout, 1) + ' °C', (PX1 + W) / 2, 86, FS.m, C.black, 500, 'center');
    if (cover > 0.15) { ctx.fillStyle = C.black; ctx.fillRect(PX0 - 40, 180, PX1 - PX0 + 80, 44); text(ctx, 'BESCHLÄGT', (PX0 + PX1) / 2, 210, FS.m, C.white, 500, 'center'); }
    tempScale(ctx, 545, -10, 30, [
      { t: Tin, label: 'Raumluft', color: C.orange },
      { t: td, label: 'Taupunkt', color: C.teal },
      { t: pane, label: 'Scheibe', color: C.cyan2 }
    ]);
    readT -= dt;
    if (readT <= 0) {
      readT = 0.25;
      ui.setRead(`Taupunkt ${fmt(td, 1)} °C · Scheibe ${fmt(pane, 1)} °C → ` + (pane < td ? 'kälter als der Taupunkt: Kondenswasser!' : `noch ${fmt(pane - td, 1)} °C über dem Taupunkt`));
    }
  }
  return { frame };
}

function taupunktAussen(host) {
  const ui = simShell(host, { label: 'Landschaft in der Nacht: Die Luft kühlt ab, bis Tau und Nebel entstehen' });
  const { view, ctx } = ui;
  let T0 = 18, RH0 = 75, t = 0, playing = false, dew = 0, fog = 0;
  const blades = Array.from({ length: 48 }, (_, i) => ({ x: 8 + i * 12.4 + rnd(-4, 4), h: rnd(16, 34), lean: rnd(-6, 6) }));
  const stars = Array.from({ length: 20 }, () => ({ x: rnd(16, 584), y: rnd(80, 180) }));
  const r1 = ui.row();
  const reset = () => { t = 0; dew = 0; fog = 0; };
  slider(r1, { label: 'Abends', min: 8, max: 28, step: 0.5, value: T0, format: v => fmt(v, 1) + ' °C', onInput: v => { T0 = v; reset(); } });
  slider(r1, { label: 'Luftfeuchte', min: 40, max: 95, step: 1, value: RH0, format: v => fmt(v) + ' %', onInput: v => { RH0 = v; reset(); } });
  const r2 = ui.row();
  const play = toggle(r2, ['Pause', 'Nacht starten'], playing, v => { playing = v; if (v && t >= 10) reset(); });
  button(r2, 'Zurück auf 20 Uhr', () => { reset(); playing = false; play.set(false); });
  ui.readout();
  ui.hint('Lass die Nacht laufen: Die Luft kühlt ab, der Wasserdampf bleibt gleich. Der Taupunkt bleibt darum fast stehen. Das Gras kühlt noch stärker ab – dort bildet sich zuerst Tau. Erreicht auch die Luft den Taupunkt, entsteht Nebel.');

  let readT = 0;
  function frame(dt) {
    if (!view.fit()) return;
    if (playing) { t += dt / 2; if (t >= 10) { t = 10; playing = false; play.set(false); } }
    const td = dewPoint(T0, RH0);
    const air = Math.max(td, T0 - 9 * (1 - Math.exp(-t / 3.5)));
    const grass = air - 2.5 * Math.min(1, t / 2);
    dew += ((grass < td ? clamp((td - grass) / 2, 0.15, 1) : 0) - dew) * Math.min(1, dt * 0.8);
    fog += ((air - td < 0.3 ? 1 : air - td < 1.2 ? 0.35 : 0) - fog) * Math.min(1, dt * 0.5);
    const night = clamp(t / 1.5, 0, 1) * clamp((10 - t) / 1.2, 0, 1);
    ctx.fillStyle = night > 0.5 ? C.navy : C.cyan2; ctx.fillRect(0, 0, W, 320);
    if (night > 0.5) {
      for (const s of stars) circle(ctx, s.x, s.y, 2, C.white);
      ctx.fillStyle = C.yellowPastel; ctx.beginPath(); ctx.arc(520, 60, 30, 0, TAU); ctx.fill();
      ctx.fillStyle = C.navy; ctx.beginPath(); ctx.arc(534, 51, 27, 0, TAU); ctx.fill();
    }
    // Baum und Haus als flache Formen
    ctx.fillStyle = C.greenStrong; ctx.beginPath(); ctx.arc(110, 210, 58, 0, TAU); ctx.fill(); ctx.fillRect(102, 236, 16, 90);
    ctx.fillStyle = C.sand; ctx.fillRect(370, 222, 130, 98);
    ctx.fillStyle = C.rust; ctx.beginPath(); ctx.moveTo(356, 224); ctx.lineTo(435, 170); ctx.lineTo(514, 224); ctx.closePath(); ctx.fill();
    ctx.fillStyle = night > 0.5 ? C.yellow : C.ice; ctx.fillRect(392, 248, 32, 32); ctx.fillRect(448, 248, 32, 32);
    // Wiese
    ctx.fillStyle = C.green; ctx.fillRect(0, 320, W, 80);
    ctx.strokeStyle = C.greenStrong; ctx.lineWidth = 3;
    const nd = Math.round(dew * blades.length);
    blades.forEach((b, i) => {
      ctx.beginPath(); ctx.moveTo(b.x, 394); ctx.lineTo(b.x + b.lean, 394 - b.h); ctx.stroke();
      if (i < nd) circle(ctx, b.x + b.lean, 394 - b.h - 3, 4, C.white, C.cyan, 1.5);
    });
    // Nebel: flache, halbtransparente Bänder
    if (fog > 0.02) {
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = `rgba(255,255,255,${(fog * (0.55 - i * 0.1)).toFixed(3)})`;
        ctx.fillRect(0, 270 - i * 55, W, 130 + i * 55);
      }
    }
    const hh = (20 + Math.floor(t)) % 24, mm = Math.floor((t % 1) * 60);
    ctx.fillStyle = C.black; ctx.fillRect(12, 12, 176, 50);
    text(ctx, `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')} UHR`, 100, 47, FS.l, C.white, 500, 'center');
    if (fog > 0.4) { ctx.fillStyle = C.black; ctx.fillRect(200, 96, 200, 48); text(ctx, 'NEBEL', 300, 129, FS.l, C.white, 500, 'center'); }
    else if (dew > 0.3) { ctx.fillStyle = C.black; ctx.fillRect(170, 96, 260, 48); text(ctx, 'TAU AUF DEM GRAS', 300, 128, FS.m, C.white, 500, 'center'); }
    tempScale(ctx, 545, 0, 30, [
      { t: air, label: 'Luft', color: C.orange },
      { t: td, label: 'Taupunkt', color: C.teal },
      { t: grass, label: 'Gras', color: C.green }
    ]);
    readT -= dt;
    if (readT <= 0) {
      readT = 0.25;
      ui.setRead(`Luft ${fmt(air, 1)} °C · Taupunkt ${fmt(td, 1)} °C · Abstand ${fmt(air - td, 1)} °C` + (air - td < 0.3 ? ' → gesättigt: Nebel' : air - td < 2 ? ' → fast gesättigt' : ''));
    }
  }
  return { frame };
}

/* =========================================================
   LUFTDRUCK – Teilchenstöße / Druck und Höhe
   ========================================================= */
SIMS.druck = (host) => {
  const ui = simShell(host, { label: 'Luftdruck: Teilchen stoßen gegen eine Messfläche, oder: Luftsäule über der Erde', drag: true });
  const { view, ctx } = ui;
  let mode = 'teilchen';
  // --- Teilchen-Modus
  const box = { x0: 16, y0: 16, x1: 392, y1: 540 }, R = 7, MEM = [190, 370];
  const N0 = 70;
  const speedOf = T => 40 + 6 * (T + 20);
  let n = N0, T = 15, rate = 0, flash = 0;
  const P = [];
  const add = () => { const a = rnd(0, TAU), s = speedOf(T); P.push({ x: rnd(box.x0 + R, box.x1 - R), y: rnd(box.y0 + R, box.y1 - R), vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: R }); };
  for (let i = 0; i < n; i++) add();
  // --- Höhen-Modus
  const HMAX = 12000, Y0 = 560, Y1 = 40, CX0 = 64, CX1 = 380;
  let h = 100, p0 = 1013.25;
  const pAt = (hh, base) => base * Math.pow(1 - 2.25577e-5 * hh, 5.25588);
  const yOfH = hh => Y0 - hh / HMAX * (Y0 - Y1);
  const hOfY = y => clamp((Y0 - y) / (Y0 - Y1) * HMAX, 0, HMAX);
  const air = [];
  while (air.length < 380) {
    const hh = rnd(0, HMAX);
    if (Math.random() < Math.pow(1 - 2.25577e-5 * hh, 4.25588)) air.push({ x: rnd(CX0 + 4, CX1 - 4), h: hh, ph: rnd(0, TAU) });
  }
  const MARKS = [[100, 'Offenbach, 100 m'], [880, 'Gr. Feldberg, 880 m'], [2962, 'Zugspitze, 2.962 m'], [4806, 'Mont Blanc, 4.806 m'], [8849, 'Everest, 8.849 m'], [11000, 'Flugzeug, ca. 11 km']];

  // Bedienung
  const rm = ui.row();
  seg(rm, [{ label: 'Teilchen-Stöße', value: 'teilchen' }, { label: 'Druck und Höhe', value: 'hoehe' }], mode, v => { mode = v; show(); }, 'Ansicht');
  const rA = ui.row(), rA2 = ui.row();
  const sN = slider(rA, { label: 'Teilchen', min: 30, max: 110, step: 1, value: n, format: v => v + ' Stück', onInput: v => { n = v; } });
  const sT = slider(rA2, { label: 'Temperatur', min: -20, max: 40, step: 1, value: T, format: v => fmt(v) + ' °C', onInput: v => { T = v; } });
  const rA3 = ui.row();
  button(rA3, 'Tief: weniger Luft', () => { n = 50; sN.set(n); });
  button(rA3, 'Normal', () => { n = N0; T = 15; sN.set(n); sT.set(T); });
  button(rA3, 'Hoch: mehr Luft', () => { n = 92; sN.set(n); });
  const rB = ui.row();
  const sH = slider(rB, { label: 'Höhe', min: 0, max: HMAX, step: 10, value: h, format: v => fmt(v) + ' m', onInput: v => { h = v; } });
  const rB2 = ui.row();
  seg(rB2, [{ label: 'Tief 995 hPa', value: 995 }, { label: 'Normal 1013 hPa', value: 1013.25 }, { label: 'Hoch 1030 hPa', value: 1030 }], p0, v => { p0 = v; }, 'Wetterlage');
  ui.readout();
  const hintEl = ui.hint('');
  function show() {
    const a = mode === 'teilchen';
    [rA, rA2, rA3].forEach(r => { r.hidden = !a; });
    [rB, rB2].forEach(r => { r.hidden = a; });
    view.canvas.classList.toggle('drag', !a);
    hintEl.textContent = a
      ? 'Mehr Teilchen oder schnellere (wärmere) Teilchen bedeuten mehr und heftigere Stöße auf die Messfläche – der Druck steigt. Die Unterschiede sind hier stark übertrieben: Beim echten Wetter schwankt der Luftdruck nur um wenige Prozent.'
      : 'Zieh den Ballon nach oben. Je höher er steigt, desto weniger Luft liegt über ihm – der Druck sinkt. Die Station rechnet ihren Messwert darum auf Meereshöhe um: So lassen sich Orte in verschiedenen Höhen vergleichen.';
  }
  show();
  dragOn(view, {
    down: p => { if (mode !== 'hoehe' || p.x > 392) return false; h = Math.round(hOfY(p.y) / 10) * 10; sH.set(h); },
    move: p => { h = Math.round(hOfY(p.y) / 10) * 10; sH.set(h); }
  });

  function stepGas(dt) {
    while (P.length < n) add();
    while (P.length > n) P.pop();
    let rms = 0; for (const p of P) rms += p.vx * p.vx + p.vy * p.vy;
    rms = Math.sqrt(rms / P.length);
    const f = 1 + (speedOf(T) / rms - 1) * Math.min(1, dt * 3);
    let hits = 0;
    for (const p of P) {
      p.vx *= f; p.vy *= f;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < box.x0 + R) { p.x = box.x0 + R; p.vx = Math.abs(p.vx); }
      if (p.x > box.x1 - R) { p.x = box.x1 - R; p.vx = -Math.abs(p.vx); if (p.y > MEM[0] && p.y < MEM[1]) { hits++; } }
      if (p.y < box.y0 + R) { p.y = box.y0 + R; p.vy = Math.abs(p.vy); }
      if (p.y > box.y1 - R) { p.y = box.y1 - R; p.vy = -Math.abs(p.vy); }
    }
    collide(P, W, H);
    return hits;
  }

  function drawGas(dt) {
    const hits = stepGas(dt / 2) + stepGas(dt / 2);
    rate += (hits / dt - rate) * Math.min(1, dt * 1.2);
    if (hits) flash = 1; else flash = Math.max(0, flash - dt * 6);
    const p = 1013.25 * (n / N0) * ((T + 273.15) / 288.15);
    ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = C.lavender; ctx.fillRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
    for (const q of P) circle(ctx, q.x, q.y, q.r, speedColor(Math.hypot(q.vx, q.vy)));
    ctx.strokeStyle = C.black; ctx.lineWidth = 4; ctx.strokeRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
    ctx.fillStyle = flash > 0.5 ? C.black : C.orange; ctx.fillRect(box.x1 - 6, MEM[0], 14, MEM[1] - MEM[0]);
    ctx.fillStyle = C.white; ctx.fillRect(box.x1 - 120, MEM[0] - 64, 112, 54);
    text(ctx, 'MESS–', box.x1 - 14, MEM[0] - 40, FS.s, C.black, 500, 'right');
    text(ctx, 'FLÄCHE', box.x1 - 14, MEM[0] - 17, FS.s, C.black, 500, 'right');
    // Zeigerinstrument
    const cx = 498, cy = 114, r = 84;
    circle(ctx, cx, cy, r, C.white, C.black, 4);
    const ang = v => Math.PI * (0.75 + 1.5 * clamp((v - 500) / 1100, 0, 1));
    ctx.lineWidth = 2; ctx.strokeStyle = C.black;
    for (let v = 500; v <= 1600; v += 100) {
      const a = ang(v);
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4)); ctx.lineTo(cx + Math.cos(a) * (r - 16), cy + Math.sin(a) * (r - 16)); ctx.stroke();
    }
    text(ctx, 'TIEF', cx - 62, cy + r + 26, FS.s, C.black, 500, 'center');
    text(ctx, 'HOCH', cx + 62, cy + r + 26, FS.s, C.black, 500, 'center');
    const a = ang(p);
    ctx.strokeStyle = C.orange; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (r - 20), cy + Math.sin(a) * (r - 20)); ctx.stroke();
    circle(ctx, cx, cy, 9, C.black);
    text(ctx, '≈ ' + fmt(p) + ' hPa', cx, cy + r + 70, 30, C.black, 500, 'center');
    text(ctx, 'STÖSSE PRO', cx, 340, FS.s, C.black, 500, 'center');
    text(ctx, 'SEKUNDE AUF', cx, 364, FS.s, C.black, 500, 'center');
    text(ctx, 'DIE FLÄCHE', cx, 388, FS.s, C.black, 500, 'center');
    text(ctx, fmt(rate), cx, 440, 44, C.black, 300, 'center');
    speedLegend(ctx, W / 2, 570);
    return p;
  }

  let time = 0;
  function drawHeight(dt) {
    time += dt;
    ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = C.ice; ctx.fillRect(CX0, Y1, CX1 - CX0, Y0 - Y1);
    for (const a of air) circle(ctx, a.x + Math.sin(time * 1.7 + a.ph) * 3, yOfH(a.h) + Math.cos(time * 1.3 + a.ph) * 3, 3.5, C.purple);
    ctx.fillStyle = C.green; ctx.fillRect(CX0, Y0, CX1 - CX0, 16);
    ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.strokeRect(CX0, Y1, CX1 - CX0, Y0 - Y1 + 16);
    // Achse
    ctx.lineWidth = 2;
    for (let k = 0; k <= 12; k += 2) {
      const y = yOfH(k * 1000);
      ctx.beginPath(); ctx.moveTo(CX0 - 8, y); ctx.lineTo(CX0, y); ctx.stroke();
      text(ctx, k + ' km', CX0 - 10, y + 7, FS.s, C.black, 500, 'right');
    }
    ctx.setLineDash([5, 6]);
    for (const [mh, label] of MARKS) {
      const y = yOfH(mh);
      ctx.strokeStyle = C.black; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(CX0 + 4, y); ctx.lineTo(CX1 - 4, y); ctx.stroke();
      if (mh > 200) text(ctx, label, CX0 + 8, y - 7, FS.s, C.black, 500);
    }
    ctx.setLineDash([]);
    text(ctx, MARKS[0][1], CX0 + 8, Y0 - 12, FS.s, C.black, 500);
    // Ballon (rechts in der Säule, damit er die Beschriftungen nicht verdeckt)
    const by = yOfH(h), bx = CX1 - 34;
    ctx.strokeStyle = C.black; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + 26); ctx.stroke();
    ctx.fillStyle = C.black; ctx.fillRect(bx - 8, by + 26, 16, 12);
    circle(ctx, bx, by - 22, 22, C.orange, C.black, 3);
    // rechte Seite
    const pa = pAt(h, p0), frac = pa / p0, X = 404;
    text(ctx, 'ABSOLUT IN', X, 50, FS.s, C.black);
    text(ctx, fmt(h) + ' m HÖHE', X, 74, FS.s, C.black);
    text(ctx, fmt(pa) + ' hPa', X, 128, 44, C.black, 300);
    text(ctx, 'LUFT ÜBER', X, 176, FS.s, C.black);
    text(ctx, 'DEM BALLON', X, 200, FS.s, C.black);
    ctx.fillStyle = C.white; ctx.fillRect(X, 214, 584 - X, 32);
    ctx.fillStyle = C.purple; ctx.fillRect(X, 214, (584 - X) * frac, 32);
    ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.strokeRect(X, 214, 584 - X, 32);
    text(ctx, fmt(frac * 100) + ' %', X, 276, FS.l, C.black);
    ctx.fillStyle = C.yellow; ctx.fillRect(X - 8, 320, 592 - X, 170);
    text(ctx, 'AUF MEERES–', X + 6, 352, FS.s, C.black);
    text(ctx, 'HÖHE UMGE–', X + 6, 376, FS.s, C.black);
    text(ctx, 'RECHNET', X + 6, 400, FS.s, C.black);
    text(ctx, fmt(p0) + ' hPa', X + 6, 446, 36, C.black, 300);
    text(ctx, p0 > 1014 ? 'HOCHDRUCK' : p0 < 1012 ? 'TIEFDRUCK' : 'STANDARD', X + 6, 476, FS.s, C.black);
    return pa;
  }

  let readT = 0;
  function frame(dt) {
    if (!view.fit()) return;
    const p = mode === 'teilchen' ? drawGas(dt) : drawHeight(dt);
    readT -= dt;
    if (readT <= 0) {
      readT = 0.3;
      ui.setRead(mode === 'teilchen'
        ? `${n} Teilchen bei ${fmt(T)} °C · Druck im Modell ≈ ${fmt(p)} hPa`
        : `In ${fmt(h)} m Höhe: ${fmt(p)} hPa absolut · ${fmt(pAt(h, p0) / p0 * 100)} % der Luft liegt noch darüber`);
    }
  }
  return { frame };
};

/* =========================================================
   NIEDERSCHLAG – Kipp-Regenmesser und 1 m²
   ========================================================= */
SIMS.regen = (host) => {
  const ui = simShell(host, { label: 'Kipp-Regenmesser mit Trichter und Wippe, daneben eine Fläche von einem Quadratmeter' });
  const { view, ctx } = ui;
  const STEP = 0.254, SPEED = 2;            // 1 Sekunde = 2 Minuten
  let rate = 4, minutes = 0, tips = 0, fill = 0, tilt = 1, anim = 0;
  const drops = [], spill = [];
  const PIV = { x: 180, y: 360 }, A = 0.32, ARM = 72;
  const FUN = { x0: 70, x1: 290, y: 130, neck: 230 };   // Trichter
  const r1 = ui.row();
  const s = slider(r1, { label: 'Regenstärke', min: 0, max: 30, step: 0.5, value: rate, format: v => fmt(v, 1) + ' mm/h', onInput: v => { rate = v; } });
  const r2 = ui.row();
  button(r2, 'Niesel 0,5', () => { rate = 0.5; s.set(rate); });
  button(r2, 'Regen 4', () => { rate = 4; s.set(rate); });
  button(r2, 'Starkregen 25', () => { rate = 25; s.set(rate); });
  button(r2, 'Zurücksetzen', () => { minutes = 0; tips = 0; fill = 0; });
  ui.readout();
  ui.hint('Der Trichter sammelt den Regen. Ist eine Seite der Wippe voll (0,254 mm), kippt sie und leert sich – die Station zählt mit. Rechts siehst du, was das bedeutet: Jeder Millimeter ist ein Liter Wasser auf einem Quadratmeter. Die Zeit läuft im Zeitraffer.');

  let readT = 0;
  function frame(dt) {
    if (!view.fit()) return;
    minutes += dt * SPEED;
    const mm = rate / 60 * SPEED * dt;
    if (anim > 0) anim = Math.max(0, anim - dt / 0.25);
    else {
      fill += mm / STEP;
      if (fill >= 1) {
        fill -= 1; tips++; tilt = -tilt; anim = 1;
        for (let i = 0; i < 6; i++) spill.push({ x: PIV.x - tilt * ARM + rnd(-6, 6), y: PIV.y + 16, vy: rnd(40, 120) });
      }
    }
    // Regentropfen
    const spawn = rate * 2.2 * dt;
    for (let i = 0; i < Math.floor(spawn) + (Math.random() < spawn % 1 ? 1 : 0); i++) drops.push({ x: rnd(10, 340), y: rnd(-40, 0) });
    ctx.fillStyle = C.lavender; ctx.fillRect(0, 0, 360, H);
    ctx.fillStyle = C.white; ctx.fillRect(360, 0, 240, H);
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 3;
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i]; d.y += 480 * dt;
      const caught = d.y > FUN.y && d.x > FUN.x0 + 2 && d.x < FUN.x1 - 2;
      if (caught || d.y > H) { drops.splice(i, 1); continue; }
      ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 2, d.y - 14); ctx.stroke();
    }
    // Trichter
    const mid = (FUN.x0 + FUN.x1) / 2;
    ctx.fillStyle = C.white; ctx.strokeStyle = C.black; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(FUN.x0, FUN.y); ctx.lineTo(FUN.x1, FUN.y); ctx.lineTo(mid + 12, FUN.neck); ctx.lineTo(mid + 12, FUN.neck + 26); ctx.lineTo(mid - 12, FUN.neck + 26); ctx.lineTo(mid - 12, FUN.neck); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.white; ctx.fillRect(mid - 64, FUN.y - 38, 128, 30);
    text(ctx, 'TRICHTER', mid, FUN.y - 15, FS.s, C.black, 500, 'center');
    if (rate > 0) { ctx.strokeStyle = C.cyan; ctx.lineWidth = 4; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -minutes * 20; ctx.beginPath(); ctx.moveTo(mid, FUN.neck + 26); ctx.lineTo(mid, PIV.y - 30); ctx.stroke(); ctx.setLineDash([]); }
    // Wippe
    const ang = (anim > 0 ? lerp(tilt * A, -tilt * A, anim) : tilt * A);
    ctx.save(); ctx.translate(PIV.x, PIV.y); ctx.rotate(ang);
    const upSide = -tilt; // −1: linke Schale oben, +1: rechte Schale oben
    if (anim === 0) {
      ctx.fillStyle = C.cyan;
      const hgt = 26 * clamp(fill, 0, 1);
      if (upSide < 0) ctx.fillRect(-ARM + 6, -hgt, ARM - 9, hgt); else ctx.fillRect(3, -hgt, ARM - 9, hgt);
    }
    ctx.strokeStyle = C.black; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-ARM - 8, -30); ctx.lineTo(-ARM, 0); ctx.lineTo(ARM, 0); ctx.lineTo(ARM + 8, -30); ctx.moveTo(0, 0); ctx.lineTo(0, -38); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = C.black; ctx.beginPath(); ctx.moveTo(PIV.x, PIV.y); ctx.lineTo(PIV.x - 14, PIV.y + 34); ctx.lineTo(PIV.x + 14, PIV.y + 34); ctx.closePath(); ctx.fill();
    text(ctx, 'WIPPE', PIV.x, PIV.y + 64, FS.s, C.black, 500, 'center');
    for (let i = spill.length - 1; i >= 0; i--) {
      const d = spill[i]; d.vy += 600 * dt; d.y += d.vy * dt;
      if (d.y > H) { spill.splice(i, 1); continue; }
      circle(ctx, d.x, d.y, 4, C.cyan);
    }
    ctx.fillStyle = C.black; ctx.fillRect(12, 12, 150, 76);
    text(ctx, 'GEKIPPT', 26, 40, FS.s, C.white);
    text(ctx, tips + ' ×', 26, 78, 32, C.white, 300);
    // 1 m²
    const total = tips * STEP, hmax = Math.max(5, Math.ceil((total + 0.01) / 5) * 5), px = 340 / hmax;
    const bx0 = 430, bx1 = 530, by = 520;
    ctx.fillStyle = C.cyan2; ctx.fillRect(bx0, by - total * px, bx1 - bx0, total * px);
    ctx.strokeStyle = C.black; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(bx0, by - 356); ctx.lineTo(bx0, by); ctx.lineTo(bx1, by); ctx.lineTo(bx1, by - 356); ctx.stroke();
    ctx.lineWidth = 2;
    for (let v = 0; v <= hmax; v += hmax / 5) {
      const y = by - v * px;
      ctx.beginPath(); ctx.moveTo(bx0 - 8, y); ctx.lineTo(bx0, y); ctx.stroke();
      text(ctx, fmt(v), bx0 - 12, y + 7, FS.s, C.black, 500, 'right');
      text(ctx, fmt(v), bx1 + 10, y + 7, FS.s, C.black, 500, 'left');
    }
    text(ctx, 'mm', bx0 - 12, by - 368, FS.s, C.black, 500, 'right');
    text(ctx, 'Liter', bx1 + 10, by - 368, FS.s, C.black, 500, 'left');
    text(ctx, 'BODEN 1 m × 1 m', (bx0 + bx1) / 2, by + 34, FS.s, C.black, 500, 'center');
    text(ctx, fmt(total, 2) + ' mm', 480, 54, FS.xl, C.black, 300, 'center');
    text(ctx, '= ' + fmt(total, 2) + ' l / m²', 480, 84, FS.s, C.black, 500, 'center');
    readT -= dt;
    if (readT <= 0) {
      readT = 0.25;
      const hh = Math.floor(minutes / 60), m = Math.floor(minutes % 60);
      ui.setRead(`Zeitraffer ${hh} h ${String(m).padStart(2, '0')} min · ${tips} × gekippt × 0,254 mm = ${fmt(total, 2)} mm = ${fmt(total, 2)} Liter pro m²`);
    }
  }
  return { frame };
};

/* =========================================================
   WINDRICHTUNG – Windfahne und Kompass
   ========================================================= */
const DIR16 = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const DIR16L = ['Nord', 'Nordnordost', 'Nordost', 'Ostnordost', 'Ost', 'Ostsüdost', 'Südost', 'Südsüdost', 'Süd', 'Südsüdwest', 'Südwest', 'Westsüdwest', 'West', 'Westnordwest', 'Nordwest', 'Nordnordwest'];
const dirIdx = deg => Math.round((((deg % 360) + 360) % 360) / 22.5) % 16;

SIMS.windrichtung = (host) => {
  const ui = simShell(host, { label: 'Kompass mit Windfahne – zieh, um die Windrichtung zu ändern', drag: true });
  const { view, ctx } = ui;
  const cx = 300, cy = 316, RR = 178;
  let from = 248, vane = 200, omega = 0, offset = 0;
  const parts = Array.from({ length: 80 }, () => ({ x: rnd(0, W), y: rnd(0, H), l: rnd(14, 34) }));
  const r = ui.row();
  for (const [lbl, d] of [['Nordwind', 0], ['Ostwind', 90], ['Südwind', 180], ['Westwind', 270]]) button(r, lbl, () => { from = d; });
  const r2 = ui.row();
  toggle(r2, ['Sensor 30° verdreht', 'Sensor richtig ausgerichtet'], false, v => { offset = v ? 30 : 0; });
  ui.readout();
  ui.hint('Zieh mit dem Finger um den Kompass: Dort, wo du hinziehst, kommt der Wind her. Die Windfahne dreht sich, bis ihre Spitze in den Wind zeigt. Probier auch aus, was passiert, wenn der Sensor beim Aufbau verdreht wurde.');
  const setFrom = p => { from = (Math.atan2(p.x - cx, -(p.y - cy)) * 180 / Math.PI + 360) % 360; };
  dragOn(view, { down: p => setFrom(p), move: setFrom });

  let readT = 0;
  function frame(dt) {
    if (!view.fit()) return;
    // Windfahne: gedämpfte Drehung in den Wind
    let diff = ((from - vane + 540) % 360) - 180;
    omega += (diff * 9 - omega * 3.2) * dt;
    vane = (vane + omega * dt + 360) % 360;
    const to = (from + 180) * Math.PI / 180;
    const fx = Math.sin(to), fy = -Math.cos(to);
    ctx.fillStyle = C.yellowPale; ctx.fillRect(0, 0, W, H);
    circle(ctx, cx, cy, RR, C.white, C.black, 4);
    // Luftteilchen strömen
    ctx.strokeStyle = C.cyan2; ctx.lineWidth = 3;
    for (const p of parts) {
      p.x += fx * 150 * dt; p.y += fy * 150 * dt;
      if (p.x < -40) p.x += W + 80; if (p.x > W + 40) p.x -= W + 80;
      if (p.y < -40) p.y += H + 80; if (p.y > H + 40) p.y -= H + 80;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - fx * p.l, p.y - fy * p.l); ctx.stroke();
    }
    // Skala
    ctx.strokeStyle = C.black;
    for (let i = 0; i < 16; i++) {
      const a = i * 22.5 * Math.PI / 180, big = i % 4 === 0, mid = i % 2 === 0;
      ctx.lineWidth = big ? 4 : 2;
      const r0 = RR - (big ? 24 : mid ? 16 : 10);
      ctx.beginPath(); ctx.moveTo(cx + Math.sin(a) * r0, cy - Math.cos(a) * r0); ctx.lineTo(cx + Math.sin(a) * RR, cy - Math.cos(a) * RR); ctx.stroke();
      const rl = RR + (big ? 26 : 24);
      text(ctx, DIR16[i], cx + Math.sin(a) * rl, cy - Math.cos(a) * rl, big ? 28 : FS.s, C.black, 500, 'center', 'middle');
    }
    for (let d = 0; d < 360; d += 90) {
      const a = d * Math.PI / 180;
      text(ctx, d + '°', cx + Math.sin(a) * (RR - 46), cy - Math.cos(a) * (RR - 46), FS.s, C.black, 500, 'center', 'middle');
    }
    // Herkunftsmarke
    const fa = from * Math.PI / 180;
    ctx.fillStyle = C.orange;
    ctx.beginPath(); ctx.arc(cx + Math.sin(fa) * (RR - 34), cy - Math.cos(fa) * (RR - 34), 13, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.black; ctx.lineWidth = 2; ctx.stroke();
    // Windfahne
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(vane * Math.PI / 180);
    ctx.fillStyle = C.black;
    ctx.fillRect(-4, -88, 8, 186);
    ctx.beginPath(); ctx.moveTo(0, -122); ctx.lineTo(-17, -84); ctx.lineTo(17, -84); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.orange; ctx.strokeStyle = C.black; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 48); ctx.lineTo(-34, 122); ctx.lineTo(34, 122); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    circle(ctx, cx, cy, 9, C.white, C.black, 3);
    // Anzeige
    const shown = Math.round((vane + offset + 360) % 360);
    ctx.fillStyle = C.black; ctx.fillRect(10, 10, 184, 84);
    text(ctx, 'ANZEIGE', 22, 38, FS.s, C.white);
    text(ctx, shown + '° ' + DIR16[dirIdx(shown)], 22, 80, 34, C.white, 300);
    if (offset) { ctx.fillStyle = C.red2; ctx.fillRect(10, 98, 184, 34); text(ctx, '30° FALSCH!', 102, 123, FS.s, C.white, 500, 'center'); }
    text(ctx, 'WIND KOMMT AUS', 590, 32, FS.s, C.black, 500, 'right');
    text(ctx, DIR16L[dirIdx(from)].toUpperCase(), 590, 60, FS.m, C.black, 500, 'right');
    text(ctx, 'WEHT NACH', 590, 560, FS.s, C.black, 500, 'right');
    text(ctx, DIR16L[dirIdx(from + 180)].toUpperCase(), 590, 588, FS.m, C.black, 500, 'right');
    readT -= dt;
    if (readT <= 0) {
      readT = 0.25;
      const i = dirIdx(from);
      ui.setRead(`${DIR16L[i]}wind: Er kommt aus ${Math.round(from)}° (${DIR16[i]}) und weht nach ${DIR16L[dirIdx(from + 180)]}` + (offset ? ` · Anzeige zeigt ${shown}° – das ist falsch` : ''));
    }
  }
  return { frame };
};

/* =========================================================
   WINDGESCHWINDIGKEIT & BÖEN – Windschalen und Verlauf
   ========================================================= */
SIMS.wind = (host, variant) => {
  const boeen = variant === 'boeen';
  const ui = simShell(host, { label: 'Schalenkreuz-Windmesser, Baum und Verlauf der Windgeschwindigkeit' });
  const { view, ctx } = ui;
  const SIM_PER_S = 20, WIN = 600 / SIM_PER_S, MEAN_WIN = 120 / SIM_PER_S; // 10 min Verlauf, 2 min Mittel
  let mean = boeen ? 6 : 4, gusty = boeen ? 0.45 : 0.25, x = 0, gust = 0, rot = 0, now = 0, sampleT = 0;
  const S = [];
  const GROUND = 290;
  const streaks = Array.from({ length: 32 }, () => ({ x: rnd(0, W), y: rnd(20, GROUND - 20), l: rnd(20, 50) }));
  const r1 = ui.row();
  slider(r1, { label: 'Mittlerer Wind', min: 0, max: 25, step: 0.5, value: mean, format: v => fmt(v, 1) + ' m/s', onInput: v => { mean = v; } });
  const r2 = ui.row();
  seg(r2, [{ label: 'Gleichmäßig', value: 0.1 }, { label: 'Unruhig', value: 0.25 }, { label: 'Böig', value: 0.45 }], gusty, v => { gusty = v; }, 'Böigkeit');
  button(r2, 'Böe!', () => { gust = 1; }, boeen ? 'primary' : '');
  ui.readout();
  ui.hint(boeen
    ? 'Tipp auf „Böe!“ oder stell den Wind auf „böig“. Achte auf den Baum: Er reagiert auf jede Spitze, nicht auf den Mittelwert. Im Verlauf unten markiert der rote Punkt die stärkste Böe der letzten 10 Minuten.'
    : 'Die Windschalen drehen sich umso schneller, je stärker der Wind ist. Der Momentanwert (schwarz) zappelt ständig – der Mittelwert über 2 Minuten (dicke Linie) ist viel ruhiger. Der Verlauf läuft im Zeitraffer.');

  let readT = 0, cur = mean;
  function frame(dt) {
    if (!view.fit()) return;
    now += dt;
    // Ornstein-Uhlenbeck-Rauschen + Böen-Impuls
    x += (-x / 0.5) * dt + gusty * Math.sqrt(2 / 0.5 * dt) * (Math.random() + Math.random() + Math.random() - 1.5) * 2;
    gust = Math.max(0, gust - dt / 1.4);
    const g = gust > 0 ? Math.sin(Math.PI * (1 - gust)) * (mean * 0.9 + 5) : 0;
    cur = Math.max(0, mean * (1 + x) + g);
    sampleT -= dt;
    if (sampleT <= 0) { sampleT = 0.05; S.push({ t: now, v: cur }); while (S.length && S[0].t < now - WIN) S.shift(); }
    const recent = S.filter(s => s.t >= now - MEAN_WIN);
    const avg = recent.reduce((a, s) => a + s.v, 0) / Math.max(1, recent.length);
    let mx = 0, mxS = null; for (const s of S) if (s.v > mx) { mx = s.v; mxS = s; }
    // Szene
    ctx.fillStyle = C.ice; ctx.fillRect(0, 0, W, GROUND + 18);
    ctx.fillStyle = C.green; ctx.fillRect(0, GROUND, W, 18);
    ctx.strokeStyle = C.white; ctx.lineWidth = 3;
    const sp = 30 + cur * 28;
    for (const s of streaks) {
      s.x += sp * dt; if (s.x > W + 60) { s.x = -60; s.y = rnd(20, GROUND - 20); }
      const len = s.l * (0.3 + cur / 10);
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - len, s.y); ctx.stroke();
    }
    // Schalenkreuz (von oben)
    rot += cur * 0.45 * dt * TAU / 3;
    const ax = 136, ay = 150;
    ctx.strokeStyle = C.black; ctx.lineWidth = 6;
    for (let i = 0; i < 3; i++) {
      const a = rot + i * TAU / 3, ex = ax + Math.cos(a) * 76, ey = ay + Math.sin(a) * 76;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(ex, ey, 22, a + Math.PI / 2, a + Math.PI * 1.5); ctx.closePath(); ctx.fill();
      ctx.lineWidth = 3; ctx.stroke(); ctx.lineWidth = 6;
    }
    circle(ctx, ax, ay, 11, C.black);
    text(ctx, 'WINDSCHALEN', ax, 262, FS.s, C.black, 500, 'center');
    // Baum biegt sich mit dem Momentanwert
    const bend = clamp(cur / 28, 0, 1) * 0.7;
    const tx = 470, ty = GROUND, th = 170;
    const topX = tx + Math.sin(bend) * th, topY = ty - Math.cos(bend) * th;
    ctx.strokeStyle = C.rust; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx, ty - th * 0.6, topX, topY); ctx.stroke();
    ctx.fillStyle = C.greenStrong;
    ctx.beginPath(); ctx.ellipse(topX + bend * 26, topY + 8, 58 - bend * 12, 48, bend, 0, TAU); ctx.fill();
    // Anzeige
    ctx.fillStyle = C.black; ctx.fillRect(250, 12, 170, 76);
    text(ctx, 'JETZT', 264, 40, FS.s, C.white);
    text(ctx, fmt(cur, 1) + ' m/s', 264, 78, 32, C.white, 300);
    // Verlauf
    const gx0 = 52, gx1 = 584, gy0 = 352, gy1 = 548;
    const vmax = Math.max(10, Math.ceil((mx + 2) / 5) * 5);
    const X = t => gx1 - (now - t) / WIN * (gx1 - gx0), Y = v => gy1 - v / vmax * (gy1 - gy0);
    ctx.fillStyle = C.white; ctx.fillRect(0, GROUND + 18, W, H - GROUND - 18);
    ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, GROUND + 18); ctx.lineTo(W, GROUND + 18); ctx.stroke();
    ctx.lineWidth = 1.5;
    for (let v = 0; v <= vmax; v += vmax > 20 ? 10 : 5) {
      ctx.strokeStyle = v === 0 ? C.black : C.grey; ctx.beginPath(); ctx.moveTo(gx0, Y(v)); ctx.lineTo(gx1, Y(v)); ctx.stroke();
      text(ctx, String(v), gx0 - 8, Y(v) + 7, FS.s, C.black, 500, 'right');
    }
    text(ctx, 'm/s', gx0 - 8, gy0 - 14, FS.s, C.black, 500, 'right');
    text(ctx, '−10 MIN', gx0, 584, FS.s, C.black, 500, 'left');
    text(ctx, 'JETZT', gx1, 584, FS.s, C.black, 500, 'right');
    ctx.strokeStyle = C.black; ctx.lineWidth = 2; ctx.beginPath();
    S.forEach((s, i) => { const px = X(s.t), py = Y(s.v); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
    ctx.stroke();
    // Mittelwert-Linie
    ctx.strokeStyle = C.orange; ctx.lineWidth = boeen ? 4 : 7;
    ctx.beginPath(); ctx.moveTo(X(now - MEAN_WIN), Y(avg)); ctx.lineTo(gx1, Y(avg)); ctx.stroke();
    text(ctx, 'MITTEL 2 MIN', X(now - MEAN_WIN) - 8, Y(avg) + 7, FS.s, C.black, 500, 'right');
    if (mxS && mx > avg * 1.15) {
      circle(ctx, X(mxS.t), Y(mx), boeen ? 9 : 6, C.red, C.black, 2);
      text(ctx, 'BÖE ' + fmt(mx, 1), clamp(X(mxS.t), gx0 + 50, gx1 - 50), Y(mx) - 14, FS.s, C.black, 500, 'center');
    }
    readT -= dt;
    if (readT <= 0) {
      readT = 0.25;
      const kmh = v => fmt(v * 3.6);
      ui.setRead(boeen
        ? `Stärkste Böe ${fmt(mx, 1)} m/s (${kmh(mx)} km/h, ${beaufort(mx)} Bft) · Mittel ${fmt(avg, 1)} m/s (${kmh(avg)} km/h)`
        : `Mittel (2 min) ${fmt(avg, 1)} m/s = ${kmh(avg)} km/h = Windstärke ${beaufort(avg)} Bft · jetzt ${fmt(cur, 1)} m/s`);
    }
  }
  return { frame };
};

/* =========================================================
   KÖRPER – Windkühle, scheinbare und gefühlte Temperatur
   ========================================================= */
SIMS.koerper = (host, variant) => {
  const ui = simShell(host, { label: 'Ein Mensch im Wind mit warmer Luftschicht um die Haut, daneben Thermometer und berechneter Wert' });
  const { view, ctx } = ui;
  const cfg = {
    windkuehle: { T: 0, RH: 70, v: 5, tMin: -20, tMax: 10, rh: false, name: 'WIND–\nKÜHLE' },
    at:         { T: 14, RH: 70, v: 3.4, tMin: -10, tMax: 40, rh: true, name: 'SCHEIN–\nBAR' },
    gefuehlt:   { T: 14, RH: 50, v: 3, tMin: -15, tMax: 40, rh: true, name: 'GE–\nFÜHLT' }
  }[variant];
  const SX = 380;   // linke Szene 0..SX, rechts die Thermometer
  let T = cfg.T, RH = cfg.RH, v = cfg.v, layer = 18;
  const puffs = [], streaks = Array.from({ length: 30 }, () => ({ x: rnd(0, SX), y: rnd(20, 560), l: rnd(20, 50) }));
  const sweat = Array.from({ length: 13 }, (_, i) => ({ x: 190 + rnd(-30, 30), y: 230 + i * 14 + rnd(-5, 5) }));
  const wisps = [];
  const r1 = ui.row();
  const sT = slider(r1, { label: 'Lufttemperatur', min: cfg.tMin, max: cfg.tMax, step: 0.5, value: T, format: x => fmt(x, 1) + ' °C', onInput: x => { T = x; } });
  const r2 = ui.row();
  const sV = slider(r2, { label: 'Wind', min: 0, max: 20, step: 0.5, value: v, format: x => fmt(x, 1) + ' m/s', onInput: x => { v = x; } });
  let sR = null;
  if (cfg.rh) { const r3 = ui.row(); sR = slider(r3, { label: 'Luftfeuchte', min: 10, max: 100, step: 1, value: RH, format: x => fmt(x) + ' %', onInput: x => { RH = x; } }); }
  const r4 = ui.row();
  const preset = (label, t, vv, rh) => button(r4, label, () => { T = t; v = vv; sT.set(T); sV.set(v); if (sR && rh != null) { RH = rh; sR.set(RH); } });
  if (variant === 'windkuehle') { preset('Windstill', 0, 0); preset('Frische Brise', 0, 8); preset('Wintersturm', -10, 18); }
  else if (variant === 'at') { preset('Windiger Herbsttag', 10, 9, 70); preset('Schwüler Sommertag', 30, 1, 75); preset('Trockene Hitze', 30, 3, 20); }
  else { preset('Eisiger Wind', -5, 10, 70); preset('Milder Tag', 15, 3, 50); preset('Schwüle Hitze', 32, 1, 70); }
  ui.readout();
  ui.hint({
    windkuehle: 'Erhöhe den Wind: Die warme Luftschicht um die Haut (orange) wird weggeblasen, der Körper verliert schneller Wärme. Das linke Thermometer bleibt trotzdem stehen – die Luft wird nicht kälter.',
    at: 'Spiel mit Wind und Feuchte: Wind bläst die warme Hautschicht weg, feuchte Luft lässt Schweiß schlechter verdunsten. Die scheinbare Temperatur fasst beides in einer Zahl zusammen – die Luft selbst bleibt gleich warm.',
    gefuehlt: 'Unter 4,4 °C rechnet die Station mit der Windkühle, über 26,7 °C mit dem Hitzeindex (Temperatur und Feuchte), dazwischen mit der Lufttemperatur. Probier die drei Bereiche aus.'
  }[variant]);

  let readT = 0, time = 0;
  function calc() {
    if (variant === 'windkuehle') return { t: windChill(T, v), mode: v * 3.6 <= 4.8 ? 'kaum Wind: keine Windkühle' : 'Windkühle' };
    if (variant === 'at') return { t: apparentT(T, RH, v), mode: 'scheinbare Temperatur' };
    return feltT(T, RH, v);
  }
  function body(c) {
    c.beginPath();
    c.arc(190, 150, 34, 0, TAU);
    c.moveTo(142, 470); c.lineTo(142, 250); c.arc(190, 250, 48, Math.PI, 0); c.lineTo(238, 470); c.closePath();
  }
  function frame(dt) {
    if (!view.fit()) return;
    time += dt;
    const res = calc();
    const tgt = 22 / (1 + v * 0.45);
    layer += (tgt - layer) * Math.min(1, dt * 2);
    ctx.fillStyle = T < 5 ? C.ice : T > 26 ? C.pink : C.yellowPale; ctx.fillRect(0, 0, SX, H);
    ctx.fillStyle = C.white; ctx.fillRect(SX, 0, W - SX, H);
    // Wind
    ctx.strokeStyle = C.cyan2; ctx.lineWidth = 3;
    const nS = Math.round(clamp(v / 12, 0, 1) * streaks.length);
    for (let i = 0; i < nS; i++) {
      const s = streaks[i]; s.x += (60 + v * 40) * dt; if (s.x > SX + 20) { s.x = -50; s.y = rnd(20, 560); }
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.l, s.y); ctx.stroke();
    }
    // warme Grenzschicht + abgeblasene Wärme
    if (v > 0.5 && Math.random() < v * dt * 2.5) puffs.push({ x: rnd(150, 230), y: rnd(120, 460), r: rnd(6, 11) });
    ctx.lineJoin = 'round';
    body(ctx); ctx.strokeStyle = C.orange; ctx.lineWidth = layer * 2; ctx.stroke();
    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i]; p.x += (40 + v * 30) * dt; p.r -= dt * 3;
      if (p.r <= 0 || p.x > SX) { puffs.splice(i, 1); continue; }
      circle(ctx, p.x, p.y, p.r, C.orange);
    }
    body(ctx); ctx.fillStyle = C.navy; ctx.fill();
    // Schweiß bei Wärme, Verdunstung je nach Feuchte
    if (T > 24) {
      const nSw = Math.round(clamp((T - 24) / 10, 0, 1) * sweat.length);
      for (let i = 0; i < nSw; i++) {
        const d = sweat[i];
        ctx.fillStyle = C.cyan3; ctx.beginPath(); ctx.moveTo(d.x, d.y - 9); ctx.quadraticCurveTo(d.x + 7, d.y + 2, d.x, d.y + 5); ctx.quadraticCurveTo(d.x - 7, d.y + 2, d.x, d.y - 9); ctx.fill();
        if (Math.random() < dt * 1.6 * (1 - RH / 100) * (1 + v / 4)) wisps.push({ x: d.x, y: d.y, a: 1 });
      }
      if (RH > 70) { ctx.fillStyle = C.white; ctx.fillRect(10, 500, SX - 20, 76); text(ctx, 'SCHWEISS VERDUN–', SX / 2, 530, FS.s, C.black, 500, 'center'); text(ctx, 'STET SCHLECHT', SX / 2, 560, FS.s, C.black, 500, 'center'); }
    }
    ctx.strokeStyle = C.white; ctx.lineWidth = 3;
    for (let i = wisps.length - 1; i >= 0; i--) {
      const w = wisps[i]; w.y -= 50 * dt; w.x += (10 + v * 10) * dt; w.a -= dt * 0.8;
      if (w.a <= 0) { wisps.splice(i, 1); continue; }
      ctx.beginPath(); ctx.moveTo(w.x, w.y); ctx.quadraticCurveTo(w.x + 8, w.y - 10, w.x, w.y - 20); ctx.stroke();
    }
    ctx.fillStyle = C.orange; ctx.fillRect(16, 22, 44, 12);
    text(ctx, 'WARME LUFTSCHICHT', 70, 35, FS.s, C.black);
    if (variant === 'gefuehlt') {
      ctx.fillStyle = C.black; ctx.fillRect(10, 52, SX - 20, 64);
      text(ctx, 'BEREICH:', 22, 78, FS.s, C.white);
      text(ctx, res.mode.toUpperCase(), 22, 104, FS.s, C.white);
    }
    // Thermometer: links die Luft, rechts der berechnete Wert (gleiche Skala)
    const lo = -30, hi = 45;
    thermo(ctx, 432, 120, 430, lo, hi, T, C.cyan2, 'THERMO–\nMETER', fmt(T, 1) + ' °C');
    thermo(ctx, 540, 120, 430, lo, hi, res.t, C.orange, cfg.name, fmt(res.t, 1) + ' °C', false);
    readT -= dt;
    if (readT <= 0) {
      readT = 0.25;
      const d = res.t - T;
      ui.setRead(`Luft ${fmt(T, 1)} °C · ${res.mode} ${fmt(res.t, 1)} °C` + (Math.abs(d) >= 0.5 ? ` · fühlt sich ${fmt(Math.abs(d), 1)} °C ${d < 0 ? 'kälter' : 'wärmer'} an` : ''));
    }
  }
  return { frame };
};

/* =========================================================
   UV-INDEX – Sonnenstand, Ozon, Wolken
   ========================================================= */
SIMS.uv = (host) => {
  const ui = simShell(host, { label: 'Sonne, Ozonschicht, Wolken und UV-Strahlung, die am Boden ankommt' });
  const { view, ctx } = ui;
  const CX = 300, CY = 1620, RE = 1100, RCL = RE + 75, RATM = RE + 175;
  let elev = 45, cloud = 0, ozone = 320;
  const ozR = () => [RE + 130, RE + 130 + (ozone - 200) / 200 * 40];
  const P = [];
  const r1 = ui.row();
  const sE = slider(r1, { label: 'Sonnenhöhe', min: 15, max: 65, step: 1, value: elev, format: v => v + '°', onInput: v => { elev = v; } });
  const r2 = ui.row();
  const sC = slider(r2, { label: 'Bewölkung', min: 0, max: 100, step: 1, value: cloud, format: v => v + ' %', onInput: v => { cloud = v; } });
  const r3 = ui.row();
  const oz = seg(r3, [{ label: 'Ozon dünn', value: 240 }, { label: 'normal', value: 320 }, { label: 'dick', value: 400 }], ozone, v => { ozone = v; }, 'Ozonschicht');
  const r4 = ui.row();
  const preset = (l, e, c) => button(r4, l, () => { elev = e; cloud = c; ozone = 320; sE.set(e); sC.set(c); oz.set(320); });
  preset('Kühler, klarer Frühlingstag (15 °C)', 45, 0);
  preset('Heißer, bewölkter Sommertag (31 °C)', 62, 95);
  ui.readout();
  ui.hint('Die Sonne steht im Sommer mittags in Offenbach etwa 63° hoch, im Winter nur etwa 17°. Je tiefer sie steht, desto länger ist der Weg der Strahlung durch die Atmosphäre – mehr UV wird unterwegs geschluckt. Die Temperatur spielt dabei keine Rolle.');

  function uvi() {
    const mu = Math.sin(elev * Math.PI / 180);
    const cf = 1 - 0.75 * Math.pow(cloud / 100, 3.4);
    return { v: 12.5 * Math.pow(mu, 2.42) * Math.pow(ozone / 300, -1.23) * 0.9 * cf, geo: Math.min(1, 0.9 * Math.pow(mu, 2.42) * Math.pow(ozone / 300, -1.23)), cf };
  }
  // Schnittpunkt einer Geraden mit einem Kreis um den Erdmittelpunkt (vom Boden aus rückwärts)
  function backT(px, py, dx, dy, R) {
    const ox = px - CX, oy = py - CY;
    const b = ox * dx + oy * dy, c = ox * ox + oy * oy - R * R;
    return -b + Math.sqrt(Math.max(0, b * b - c));
  }
  let readT = 0;
  function frame(dt) {
    if (!view.fit()) return;
    const u = uvi();
    const e = elev * Math.PI / 180, dx = -Math.cos(e), dy = -Math.sin(e); // Richtung zur Sonne
    const gx = 300, gy = CY - RE;
    const [o0, o1] = ozR();
    const tSun = backT(gx, gy, dx, dy, RATM + 60) + 30;
    const sx = gx + dx * tSun, sy = gy + dy * tSun;
    // Die Sonne liegt bei tiefem Stand außerhalb des Bildes; gezeichnet wird sie auf demselben Strahl am Bildrand.
    const tVis = Math.min(tSun, (gx - 44) / Math.cos(e));
    const vx = gx + dx * tVis, vy = gy + dy * tVis;
    // neue UV-Pakete
    if (Math.random() < dt * 34) {
      const off = rnd(-30, 30), tx = gx + rnd(-50, 50);
      const start = { x: sx - dy * off, y: sy + dx * off };
      const len = Math.hypot(tx - start.x, gy - start.y);
      let die = len + 1;
      if (Math.random() > u.geo) {
        const tOz = backT(tx, gy, dx, dy, (o0 + o1) / 2);
        die = Math.random() < 0.6 ? len - tOz : rnd(len - backT(tx, gy, dx, dy, RATM), len - 10);
      } else if (Math.random() > u.cf) die = len - backT(tx, gy, dx, dy, RCL);
      P.push({ x: start.x, y: start.y, ux: (tx - start.x) / len, uy: (gy - start.y) / len, s: 0, die, len });
    }
    // Hintergrund
    ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
    circle(ctx, CX, CY, RATM, C.ice);
    ctx.beginPath(); ctx.arc(CX, CY, o1, 0, TAU); ctx.arc(CX, CY, o0, 0, TAU, true); ctx.fillStyle = C.lilac; ctx.fill();
    // Wolken auf einem Bogen
    const nCl = Math.round(cloud / 100 * 11);
    for (let i = 0; i < nCl; i++) {
      const a = -Math.PI / 2 + (i - 5) * 0.045;
      const x = CX + Math.cos(a) * RCL, y = CY + Math.sin(a) * RCL;
      circle(ctx, x, y, 24, C.white); circle(ctx, x + 17, y + 6, 18, C.white); circle(ctx, x - 17, y + 8, 16, C.white);
    }
    circle(ctx, CX, CY, RE, C.green);
    // Sonne
    circle(ctx, vx, vy, 28, C.yellow);
    ctx.strokeStyle = C.yellow; ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) { const a = i * TAU / 8; ctx.beginPath(); ctx.moveTo(vx + Math.cos(a) * 35, vy + Math.sin(a) * 35); ctx.lineTo(vx + Math.cos(a) * 47, vy + Math.sin(a) * 47); ctx.stroke(); }
    // UV-Pakete
    ctx.lineWidth = 3;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.s += 380 * dt;
      if (p.s > p.die || p.s > p.len) { P.splice(i, 1); continue; }
      const x = p.x + p.ux * p.s, y = p.y + p.uy * p.s;
      const inAtm = (x - CX) ** 2 + (y - CY) ** 2 < RATM * RATM;
      ctx.strokeStyle = inAtm ? C.purple2 : C.lilac;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - p.ux * 14, y - p.uy * 14); ctx.stroke();
    }
    // Mensch
    circle(ctx, gx, gy - 36, 8, C.black); ctx.fillStyle = C.black; ctx.fillRect(gx - 7, gy - 26, 14, 26);
    const ozY = CY - Math.sqrt(o1 * o1 - (CX - 20) * (CX - 20));
    text(ctx, 'OZONSCHICHT', 20, ozY + 4, FS.s, C.black, 500, 'left', 'top');
    text(ctx, 'ATMOSPHÄRE', 20, 488, FS.s, C.black, 500);
    // UV-Skala
    const bx = 482, by0 = 52, bh = 22;
    const BANDS = [[0, 2, C.greenStrong, 'NIEDRIG'], [3, 5, C.yellowStrong, 'MÄSSIG'], [6, 7, C.orange, 'HOCH'], [8, 10, C.red, 'SEHR HOCH'], [11, 11, C.purple2, 'EXTREM']];
    ctx.fillStyle = C.white; ctx.fillRect(bx - 16, 10, 124, bh * 12 + 56);
    text(ctx, 'UV-INDEX', bx - 6, by0 - 14, FS.s, C.black);
    const val = Math.round(u.v);
    for (let k = 11; k >= 0; k--) {
      const y = by0 + (11 - k) * bh;
      const band = BANDS.find(b => k >= b[0] && k <= b[1]);
      ctx.fillStyle = band[2]; ctx.fillRect(bx, y, 32, bh - 2);
      text(ctx, k === 11 ? '11+' : String(k), bx + 42, y + 18, FS.s, C.black);
      if (k === Math.min(11, val)) { ctx.strokeStyle = C.black; ctx.lineWidth = 4; ctx.strokeRect(bx - 4, y - 3, 40, bh + 4); }
    }
    ctx.fillStyle = C.black; ctx.fillRect(10, 10, 190, 86);
    text(ctx, 'UV AM BODEN', 22, 38, FS.s, C.white);
    text(ctx, fmt(u.v, 1), 22, 84, 42, C.white, 300);
    if (u.v >= 2.5) { ctx.fillStyle = C.yellow; ctx.fillRect(10, 100, 190, 36); text(ctx, 'SONNENSCHUTZ!', 105, 126, FS.s, C.black, 500, 'center'); }
    readT -= dt;
    if (readT <= 0) {
      readT = 0.25;
      const band = BANDS.find(b => Math.min(11, val) >= b[0] && Math.min(11, val) <= b[1]);
      ui.setRead(`UV-Index ${fmt(u.v, 1)} – ${band[3].toLowerCase()}` + (u.v >= 2.5 ? ' · ab 3 empfiehlt die WHO Sonnenschutz' : ''));
    }
  }
  return { frame };
};

/* =========================================================
   LICHT – Lux und W/m²
   ========================================================= */
SIMS.licht = (host) => {
  const ui = simShell(host, { label: 'Lichtquelle, Fläche von einem Quadratmeter, Lux-Skala und Spektrum mit Empfindlichkeit des Auges' });
  const { view, ctx } = ui;
  const L0 = 250, L1 = 1500;
  const V = l => 1.019 * Math.exp(-285.4 * Math.pow(l / 1000 - 0.559, 2));
  const planck = (l, T) => { const m = l * 1e-9; return 1 / (Math.pow(m, 5) * (Math.exp(1.4388e-2 / (m * T)) - 1)); };
  const gauss = (l, m, s) => Math.exp(-0.5 * ((l - m) / s) ** 2);
  const SRC = {
    sonne: { name: 'Sonne', f: l => (l < 295 ? 0 : planck(l, 5778)) },
    led:   { name: 'LED-Lampe', f: l => 0.55 * gauss(l, 450, 11) + gauss(l, 565, 60) },
    heizer:{ name: 'Wärmestrahler', f: l => planck(l, 1700) }
  };
  // Lichtausbeute (Lux pro W/m²) numerisch aus dem Spektrum
  for (const k in SRC) {
    let all = 0, vis = 0, mx = 0;
    for (let l = 250; l <= 4000; l += 2) { const s = SRC[k].f(l); all += s; vis += s * V(l); if (l <= L1) mx = Math.max(mx, s); }
    SRC[k].eff = 683 * vis / all; SRC[k].max = mx;
  }
  let src = 'sonne', logW = Math.log10(170);
  const P = [];
  const r1 = ui.row();
  const sg = seg(r1, [{ label: 'Sonne', value: 'sonne' }, { label: 'LED-Lampe', value: 'led' }, { label: 'Wärmestrahler', value: 'heizer' }], src, v => { src = v; }, 'Lichtquelle');
  const r2 = ui.row();
  const sW = slider(r2, { label: 'Strahlung', min: -3, max: 3.1, step: 0.01, value: logW, format: v => { const w = Math.pow(10, v); return fmt(w, w < 1 ? 3 : w < 10 ? 1 : 0) + ' W/m²'; }, onInput: v => { logW = v; } });
  const r3 = ui.row();
  const preset = (l, s, w) => button(r3, l, () => { src = s; logW = Math.log10(w); sg.set(s); sW.set(logW); });
  preset('Vollmondnacht', 'sonne', 0.0027);
  preset('Wohnzimmer', 'led', 1);
  preset('Bedeckter Tag', 'sonne', 110);
  preset('Pralle Sonne', 'sonne', 1050);
  preset('Wärmestrahler', 'heizer', 300);
  ui.readout();
  ui.hint('Lux zählt nur das Licht, das unser Auge sieht – gewichtet mit seiner Empfindlichkeit (gelbe Kurve). W/m² zählt die ganze Strahlungsleistung. Vergleich mal Sonne, LED und Wärmestrahler: Der Wärmestrahler liefert viel Leistung, aber kaum Lux.');

  function wavelengthColor(l) {
    if (l < 380) return null;
    if (l < 450) return C.purple2; if (l < 495) return C.blue2; if (l < 520) return C.cyan; if (l < 570) return C.greenStrong;
    if (l < 590) return C.yellowStrong; if (l < 625) return C.orange; if (l <= 780) return C.red; return null;
  }
  function sampleL() {
    const s = SRC[src];
    for (let k = 0; k < 40; k++) { const l = rnd(L0, L1); if (Math.random() * s.max < s.f(l)) return l; }
    return 1000;
  }
  const SKY = [C.navy, C.purple2, C.blue2, C.cyan2, C.ice, C.yellowPale];
  const TOP = 300;   // obere Hälfte: Szene, untere: Spektrum
  let readT = 0;
  function frame(dt) {
    if (!view.fit()) return;
    const w = Math.pow(10, logW), lux = w * SRC[src].eff;
    const ll = Math.log10(Math.max(0.01, lux));
    ctx.fillStyle = SKY[clamp(Math.floor((ll + 1) / 1.1), 0, SKY.length - 1)]; ctx.fillRect(0, 0, 392, TOP);
    const dark = ll < 2.2;
    // Quelle
    const qx = 62, qy = 62;
    if (src === 'sonne') { circle(ctx, qx, qy, 36, C.yellow, C.black, 2); }
    else if (src === 'led') { circle(ctx, qx, qy, 28, C.white, C.black, 3); ctx.fillStyle = C.black; ctx.fillRect(qx - 12, 0, 24, qy - 26); }
    else { ctx.fillStyle = C.black; ctx.fillRect(qx - 50, qy - 26, 100, 52); ctx.fillStyle = C.red2; for (let i = 0; i < 3; i++) ctx.fillRect(qx - 42, qy - 19 + i * 15, 84, 8); }
    // Photonen
    const rate = Math.max(0, logW + 3) * 11;
    if (Math.random() < rate * dt) for (let k = 0; k < 1 + Math.floor(rate * dt); k++) {
      const l = sampleL(), tx = rnd(200, 370), ty = rnd(232, 272);
      const len = Math.hypot(tx - qx, ty - qy);
      P.push({ l, x: qx, y: qy, ux: (tx - qx) / len, uy: (ty - qy) / len, s: 0, len });
    }
    // Fläche
    ctx.fillStyle = C.white; ctx.beginPath(); ctx.moveTo(176, 286); ctx.lineTo(384, 286); ctx.lineTo(356, 226); ctx.lineTo(204, 226); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.stroke();
    text(ctx, '1 m²', 280, 266, FS.m, C.black, 500, 'center');
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.s += 340 * dt;
      if (p.s > p.len) { P.splice(i, 1); continue; }
      const x = p.x + p.ux * p.s, y = p.y + p.uy * p.s, c = wavelengthColor(p.l);
      if (c) circle(ctx, x, y, 5, c, C.black, 1);
      else circle(ctx, x, y, 5, null, p.l < 380 ? C.purple2 : (dark ? C.salmon : C.rust), 2);
    }
    // Anzeige
    ctx.fillStyle = C.black; ctx.fillRect(10, 150, 156, 74);
    text(ctx, lux > 200000 ? 'ÜBER MAX.' : 'LUX', 22, 176, FS.s, C.white);
    text(ctx, lux >= 1000 ? fmt(lux / 1000, 1) + ' klx' : fmt(lux, lux < 10 ? 2 : 0) + ' lx', 22, 212, 30, C.white, 300);
    // Lux-Skala
    const sx = 552, sy0 = 284, sy1 = 50, lmin = -1, lmax = Math.log10(200000);
    const Y = v => sy0 - (v - lmin) / (lmax - lmin) * (sy0 - sy1);
    ctx.fillStyle = C.white; ctx.fillRect(392, 0, 208, TOP);
    ctx.fillStyle = C.yellowPale; ctx.fillRect(sx, Y(clamp(ll, lmin, lmax)), 26, sy0 - Y(clamp(ll, lmin, lmax)));
    ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.strokeRect(sx, sy1, 26, sy0 - sy1);
    for (const [v, l] of [[Math.log10(0.2), 'Mond 0,2 lx'], [Math.log10(300), 'Zimmer 300 lx'], [4, 'bedeckt 10 klx'], [5, 'Sonne 100 klx'], [lmax, 'max. 200 klx']]) {
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx - 8, Y(v)); ctx.lineTo(sx, Y(v)); ctx.stroke();
      text(ctx, l, sx - 12, Y(v) + (v === lmax ? -12 : v === 5 ? 18 : 7), FS.s, C.black, 500, 'right');
    }
    ctx.fillStyle = C.black; ctx.beginPath(); const my = Y(clamp(ll, lmin, lmax)); ctx.moveTo(sx + 28, my); ctx.lineTo(sx + 42, my - 8); ctx.lineTo(sx + 42, my + 8); ctx.closePath(); ctx.fill();
    // Spektrum
    const gx0 = 30, gx1 = 580, gy1 = 520, gy0 = 360;
    const X = l => gx0 + (l - L0) / (L1 - L0) * (gx1 - gx0);
    ctx.fillStyle = C.white; ctx.fillRect(0, TOP, W, H - TOP);
    ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, TOP); ctx.lineTo(W, TOP); ctx.stroke();
    for (let l = 380; l < 780; l += 5) { ctx.fillStyle = wavelengthColor(l); ctx.fillRect(X(l), gy1 + 2, X(l + 5) - X(l) + 0.5, 10); }
    // Auge
    ctx.fillStyle = C.yellowPastel; ctx.beginPath(); ctx.moveTo(X(380), gy1);
    for (let l = 380; l <= 780; l += 4) ctx.lineTo(X(l), gy1 - V(l) * (gy1 - gy0)); ctx.lineTo(X(780), gy1); ctx.closePath(); ctx.fill();
    // Quelle
    const s = SRC[src];
    ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(X(380), gy1);
    for (let l = 380; l <= 780; l += 4) ctx.lineTo(X(l), gy1 - Math.min(V(l), s.f(l) / s.max) * (gy1 - gy0)); ctx.lineTo(X(780), gy1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.beginPath();
    for (let l = L0; l <= L1; l += 4) { const y = gy1 - s.f(l) / s.max * (gy1 - gy0); if (l === L0) ctx.moveTo(X(l), y); else ctx.lineTo(X(l), y); }
    ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx0, gy1); ctx.lineTo(gx1, gy1); ctx.stroke();
    text(ctx, 'UV', X(315), gy1 + 40, FS.s, C.black, 500, 'center');
    text(ctx, 'SICHTBAR', X(580), gy1 + 40, FS.s, C.black, 500, 'center');
    text(ctx, 'INFRAROT (WÄRME)', X(1150), gy1 + 40, FS.s, C.black, 500, 'center');
    text(ctx, s.name.toUpperCase(), gx0, 334, FS.s, C.black);
    ctx.fillStyle = C.yellowPastel; ctx.fillRect(300, 318, 18, 18); text(ctx, 'AUGE', 324, 334, FS.s, C.black);
    ctx.fillStyle = C.orange; ctx.fillRect(400, 318, 18, 18); text(ctx, 'ZÄHLT (LUX)', 424, 334, FS.s, C.black);
    readT -= dt;
    if (readT <= 0) {
      readT = 0.25;
      ui.setRead(`${s.name}: ${fmt(w, w < 1 ? 3 : w < 10 ? 1 : 0)} W/m² Strahlung → ${fmt(lux, lux < 10 ? 2 : 0)} Lux sichtbares Licht (≈ ${fmt(s.eff)} Lux pro W/m²)`);
    }
  }
  return { frame };
};

/* =========================================================
   MONDPHASE – Sonne, Erde, Mond
   ========================================================= */
SIMS.mond = (host) => {
  const ui = simShell(host, { label: 'Mondbahn von oben und der Mond, wie wir ihn von der Erde sehen', drag: true });
  const { view, ctx } = ui;
  const today = moonAge(new Date());
  let age = today, playing = false;
  const ex = 156, ey = 210, OR = 112, SPLIT = 300, BOT = 420;
  const r1 = ui.row();
  const sA = slider(r1, { label: 'Tage seit Neumond', min: 0, max: 29.5, step: 0.1, value: +age.toFixed(1), format: v => fmt(v, 1), onInput: v => { age = v; } });
  const r2 = ui.row();
  button(r2, 'Heute', () => { age = today; sA.set(+age.toFixed(1)); });
  const play = toggle(r2, ['Pause', 'Monat abspielen'], playing, v => { playing = v; });
  ui.readout();
  ui.hint('Zieh den Mond auf seiner Bahn um die Erde. Die Sonne scheint von links – immer ist eine Hälfte des Mondes beleuchtet. Rechts siehst du, wie viel davon wir von der Erde aus sehen. Die Station rechnet die Phase einfach aus dem Datum aus.');
  dragOn(view, {
    down: p => { if (p.x > SPLIT || p.y > BOT) return false; set(p); },
    move: p => set(p)
  });
  function set(p) {
    const th = Math.atan2(-(p.y - ey), p.x - ex);         // mathematischer Winkel
    let e = th - Math.PI; e = ((e % TAU) + TAU) % TAU;     // Elongation: 0 = Neumond (zur Sonne)
    age = e / TAU * SYN; sA.set(+age.toFixed(1));
    if (playing) { playing = false; play.set(false); }
  }
  const dateOf = a => { const d = new Date(Date.now() + (a - today) * 86400000); return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
  let readT = 0;
  function frame(dt) {
    if (!view.fit()) return;
    if (playing) { age = (age + dt * 2) % SYN; sA.set(+age.toFixed(1)); }
    const e = age / SYN * TAU, th = Math.PI + e;
    const mx = ex + Math.cos(th) * OR, my = ey - Math.sin(th) * OR;
    ctx.fillStyle = C.navy; ctx.fillRect(0, 0, SPLIT, BOT);
    ctx.fillStyle = C.paleGreen; ctx.fillRect(SPLIT, 0, W - SPLIT, BOT);
    ctx.fillStyle = C.white; ctx.fillRect(0, BOT, W, H - BOT);
    // Sonnenlicht von links
    ctx.fillStyle = C.yellow; ctx.fillRect(0, 0, 14, BOT);
    for (let y = 80; y < BOT - 30; y += 80) arrow(ctx, 20, y, 28, 0, C.yellow, 3, 10);
    text(ctx, 'SONNENLICHT', 24, 32, FS.s, C.yellow);
    // Bahn
    ctx.setLineDash([6, 8]); circle(ctx, ex, ey, OR, null, C.white, 2); ctx.setLineDash([]);
    // Erde: Tag- und Nachtseite
    circle(ctx, ex, ey, 28, C.blue2);
    ctx.fillStyle = C.black; ctx.beginPath(); ctx.arc(ex, ey, 28, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fill();
    circle(ctx, ex, ey, 28, null, C.white, 2);
    text(ctx, 'ERDE', ex, ey + 54, FS.s, C.white, 500, 'center');
    // Mond (von oben): linke Hälfte beleuchtet
    circle(ctx, mx, my, 18, C.black);
    ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(mx, my, 18, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); ctx.fill();
    circle(ctx, mx, my, 18, null, C.white, 2);
    ctx.strokeStyle = C.yellowPastel; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(mx, my); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, 'MOND', clamp(mx, 50, SPLIT - 40), my < ey ? my - 28 : my + 44, FS.s, C.white, 500, 'center');
    text(ctx, 'BLICK VON OBEN', 24, BOT - 16, FS.s, C.white);
    // Ansicht von der Erde
    drawMoonFace(ctx, 450, 196, 112, age, C.navy, C.yellowPastel);
    const illum = (1 - Math.cos(e)) / 2;
    text(ctx, 'SO SEHEN WIR IHN', 450, 48, FS.s, C.black, 500, 'center');
    text(ctx, moonName(age).toUpperCase(), 450, 352, FS.m, C.black, 500, 'center');
    text(ctx, fmt(illum * 100) + ' % beleuchtet', 450, 386, FS.s, C.black, 500, 'center');
    // Phasenleiste
    for (let i = 0; i < 8; i++) drawMoonFace(ctx, 60 + i * 69, 486, 24, i / 8 * SYN, C.navy, C.yellowPastel);
    const idx = Math.round(age / SYN * 8) % 8;
    ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.strokeRect(60 + idx * 69 - 32, 454, 64, 64);
    text(ctx, 'NEUMOND', 30, 556, FS.s, C.black, 500, 'left');
    text(ctx, 'VOLLMOND', 60 + 4 * 69, 556, FS.s, C.black, 500, 'center');
    text(ctx, dateOf(age), 584, 590, FS.s, C.black, 500, 'right');
    readT -= dt;
    if (readT <= 0) {
      readT = 0.25;
      ui.setRead(`${moonName(age)} · ${fmt(age, 1)} Tage nach Neumond · ${fmt(illum * 100)} % der sichtbaren Seite beleuchtet · ${fmt(SYN - age, 1)} Tage bis zum nächsten Neumond`);
    }
  }
  return { frame };
};
