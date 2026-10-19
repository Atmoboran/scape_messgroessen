// Shared tools of the simulations (window.MG): square drawing field, canvas
// text, controls (slider, buttons, toggles, segmented buttons), dragging,
// thermometer, particle collisions, the CD temperature scale for particle
// speeds and the physics formulas (humidity, wind, felt temperature, moon).
//
// Every simulation draws into a square field of 600 × 600 units. Font sizes
// are given in these units (never below 20); on small screens they grow so
// canvas text is never smaller than 12 px (SCAPE.minFont).
(() => {
  'use strict';
  const MG = (window.MG = window.MG || {});
  const FONT = THEME.font;
  const C = THEME.palette;
  const W = 600, H = 600;
  const FS = { s: 20, m: 22, l: 26, xl: 34 };
  const $ = (s, el = document) => el.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * t;
  const TAU = Math.PI * 2;

  // number with decimal comma, real minus, thousands point from 5 digits
  function fmt(n, d = 0) {
    let s = Math.abs(n).toFixed(d);
    const zero = Number(s) === 0;
    let [i, f] = s.split('.');
    if (i.length > 4) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    s = f ? i + ',' + f : i;
    return (n < 0 && !zero ? '−' : '') + s;
  }

  // texts of one simulation: const tx = MG.texts('druck'); tx('low')
  const texts = name => (key, ...args) => t('sims.' + name + '.' + key, ...args);

  function makeView(canvas, w, h) {
    const ctx = canvas.getContext('2d');
    let lw = 0, lh = 0;
    return {
      ctx, W: w, H: h, canvas,
      fit() {
        const cw = canvas.clientWidth, ch = canvas.clientHeight;
        if (!cw || !ch) return false;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (cw !== lw || ch !== lh) {
          lw = cw; lh = ch;
          canvas.width = Math.round(cw * dpr);
          canvas.height = Math.round(ch * dpr);
        }
        ctx.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
        ctx.minFS = SCAPE.minFont(ctx);   // smallest font size (in units) that is still 12 px on screen
        return true;
      },
      local(e) {
        const r = canvas.getBoundingClientRect();
        return { x: (e.clientX - r.left) / r.width * w, y: (e.clientY - r.top) / r.height * h };
      }
    };
  }

  function text(ctx, str, x, y, size, color, weight = 500, align = 'left', base = 'alphabetic') {
    ctx.font = `${weight} ${Math.max(size, ctx.minFS || 0)}px ${FONT}`;
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
  // Frame of every simulation: square canvas in host.view (the .stage-frame),
  // rows of controls, readout and hint in host.ctrl.
  function simShell(host, { label = '', drag = false } = {}) {
    const canvas = el('canvas', drag ? 'drag' : '');
    canvas.width = W; canvas.height = H;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', label);
    host.view.insertBefore(canvas, host.view.firstChild);
    const view = makeView(canvas, W, H);
    const ctrl = host.ctrl;
    let readEl = null, lastRead = '';
    return {
      view, ctx: view.ctx, canvas, ctrl,
      done: id => { if (host.done) host.done(id); },
      row() { const r = el('div', 'controls'); ctrl.appendChild(r); return r; },
      readout() { readEl = el('p', 'readout'); readEl.setAttribute('aria-live', 'polite'); ctrl.appendChild(readEl); },
      setRead(s) { if (readEl && s !== lastRead) { readEl.textContent = s; lastRead = s; } },
      hint(s) { const p = el('p', 'hint'); p.textContent = s; ctrl.appendChild(p); return p; }
    };
  }

  function slider(row, o) {
    const id = 'r' + (++uid);
    const w = el('div', 'range');
    w.innerHTML = `<label for="${id}"></label><input type="range" id="${id}" min="${o.min}" max="${o.max}" step="${o.step}" value="${o.value}"><output for="${id}"></output>`;
    $('label', w).textContent = o.label;
    row.appendChild(w);
    // optional (i) behind the label: a note that explains what the slider changes
    if (o.info) {
      const b = el('button', 'info');
      b.type = 'button';
      b.setAttribute('aria-controls', id + '-note');
      $('label', w).after(b);
      const note = el('div', 'info-note');
      note.id = id + '-note';
      note.textContent = o.info;
      row.appendChild(note);
      SCAPE.wireInfo(row);
    }
    const input = $('input', w), out = $('output', w);
    const upd = () => { out.textContent = o.format ? o.format(+input.value) : input.value; };
    input.addEventListener('input', () => { upd(); if (o.onInput) o.onInput(+input.value); });
    upd();
    return { input, get: () => +input.value, set(v) { input.value = v; upd(); } };
  }

  function button(row, label, onClick, cls = '') {
    const b = el('button', 'btn ' + cls);
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', onClick);
    row.appendChild(b);
    return b;
  }

  // labels = [text while on, text while off]
  function toggle(row, labels, state, onChange, cls = '') {
    const b = button(row, '', () => { state = !state; upd(); onChange(state); }, cls);
    const upd = () => {
      b.textContent = state ? labels[0] : labels[1];
      // a yellow start button stays yellow; other toggles turn black while on
      if (!cls.includes('primary')) b.setAttribute('aria-pressed', state ? 'true' : 'false');
    };
    upd();
    return { el: b, set(v) { state = v; upd(); } };
  }

  function seg(row, options, value, onChange, aria) {
    const g = el('div', 'seg');
    g.setAttribute('role', 'group');
    if (aria) g.setAttribute('aria-label', aria);
    const btns = options.map(o => {
      const b = el('button', 'btn');
      b.type = 'button';
      b.textContent = o.label;
      b.addEventListener('click', () => { set(o.value); onChange(o.value); });
      g.appendChild(b);
      return [o.value, b];
    });
    function set(v) { btns.forEach(([val, b]) => b.setAttribute('aria-pressed', val === v ? 'true' : 'false')); }
    set(value);
    row.appendChild(g);
    return { set };
  }

  // dragging on the canvas (mouse, finger, pen)
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

  // CD temperature scale for a temperature between tMin (blue) and tMax (red)
  const tempColor = (T, tMin = -20, tMax = 40) => THEME.tempColor((T - tMin) / (tMax - tMin));

  // vertical thermometer; ticks = false leaves out the scale numbers
  function thermo(ctx, x, top, bottom, tMin, tMax, T, color, label, value, ticks = true) {
    const w = 24, br = 20;
    const yOf = tt => bottom - (clamp(tt, tMin, tMax) - tMin) / (tMax - tMin) * (bottom - top);
    ctx.fillStyle = C.white; ctx.fillRect(x - w / 2, top, w, bottom - top + 6);
    ctx.fillStyle = color; const y = yOf(T); ctx.fillRect(x - w / 2 + 5, y, w - 10, bottom - y + 8);
    circle(ctx, x, bottom + br - 4, br, color, C.black, 3);
    ctx.strokeStyle = C.black; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x - w / 2, bottom + 2); ctx.lineTo(x - w / 2, top); ctx.lineTo(x + w / 2, top); ctx.lineTo(x + w / 2, bottom + 2); ctx.stroke();
    ctx.lineWidth = 2;
    for (let tt = Math.ceil(tMin / 10) * 10; tt <= tMax; tt += 10) {
      const yy = yOf(tt);
      ctx.beginPath(); ctx.moveTo(x + w / 2, yy); ctx.lineTo(x + w / 2 + 8, yy); ctx.stroke();
      if (ticks) text(ctx, fmt(tt), x + w / 2 + 11, yy + 7, FS.s, C.black, 500);
    }
    if (label) label.split('\n').forEach((l, i, a) => text(ctx, l, x, top - 12 - (a.length - 1 - i) * 23, FS.s, C.black, 500, 'center'));
    if (value) text(ctx, value, x, bottom + br * 2 + 26, FS.m, C.black, 500, 'center');
  }

  // elastic collisions between particles of equal mass
  function collide(P, w, h, cell = 18) {
    const GW = Math.ceil(w / cell), GH = Math.ceil(h / cell);
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

  // particle colour by speed on the CD temperature scale (slow = blue, fast = red)
  const SPEED_SLOW = 60, SPEED_FAST = 340;
  const speedColor = s => THEME.tempColor((s - SPEED_SLOW) / (SPEED_FAST - SPEED_SLOW));
  function particle(ctx, p) { circle(ctx, p.x, p.y, p.r, speedColor(Math.hypot(p.vx, p.vy)), C.black, 1.2); }
  // legend under the box: LANGSAM ● ● ● ● ● SCHNELL, centred on cx
  function speedLegend(ctx, cx, y) {
    const x0 = cx - 2 * 26;
    text(ctx, t('sims.common.slow'), x0 - 18, y + 7, FS.s, C.black, 500, 'right');
    for (let i = 0; i < 5; i++) circle(ctx, x0 + i * 26, y, 9, THEME.tempColor(i / 4), C.black, 1.2);
    text(ctx, t('sims.common.fast'), x0 + 4 * 26 + 18, y + 7, FS.s, C.black, 500, 'left');
  }

  // humidity (Magnus formula)
  const satVap = T => 6.112 * Math.exp(17.62 * T / (243.12 + T));         // hPa
  const satDens = T => 216.7 * satVap(T) / (T + 273.15);                  // g/m³
  function dewPoint(T, RH) {
    const g = Math.log(clamp(RH, 1, 100) / 100) + 17.62 * T / (243.12 + T);
    return 243.12 * g / (17.62 - g);
  }

  // wind and felt temperature
  const BFT = [0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7];
  const beaufort = ms => { let b = 0; while (b < BFT.length && ms >= BFT[b]) b++; return b; };
  function windChill(T, v) {          // v in m/s, formula of Environment Canada / NWS
    const k = v * 3.6;
    if (T > 10 || k <= 4.8) return T;
    const p = Math.pow(k, 0.16);
    return 13.12 + 0.6215 * T - 11.37 * p + 0.3965 * T * p;
  }
  function heatIndex(T, RH) {         // Rothfusz (NOAA), computed in °F
    const F = T * 9 / 5 + 32, R = RH;
    let HI = 0.5 * (F + 61 + (F - 68) * 1.2 + R * 0.094);
    if ((HI + F) / 2 >= 80) {
      HI = -42.379 + 2.04901523 * F + 10.14333127 * R - 0.22475541 * F * R - 0.00683783 * F * F
        - 0.05481717 * R * R + 0.00122874 * F * F * R + 0.00085282 * F * R * R - 0.00000199 * F * F * R * R;
    }
    return (HI - 32) * 5 / 9;
  }
  function apparentT(T, RH, v) {      // Steadman, variant "shade, exposed to the wind"
    const e = RH / 100 * 6.105 * Math.exp(17.27 * T / (237.7 + T));
    return T + 0.33 * e - 0.70 * v - 4.00;
  }
  function feltT(T, RH, v) {          // mode: key of sims.koerper.modes
    if (T < 4.4) return { t: windChill(T, v), mode: 'windChill' };
    if (T > 26.7) return { t: Math.max(T, heatIndex(T, RH)), mode: 'heatIndex' };
    return { t: T, mode: 'air' };
  }

  // moon
  const SYN = 29.530588853;
  function moonAge(date) {
    const ref = Date.UTC(2000, 0, 6, 18, 14);
    const d = (date.getTime() - ref) / 86400000;
    return ((d % SYN) + SYN) % SYN;
  }
  function moonName(age) {
    const f = age / SYN, n = t('moon.names');
    if (f < 0.03 || f > 0.97) return n[0];
    if (f < 0.22) return n[1];
    if (f < 0.28) return n[2];
    if (f < 0.47) return n[3];
    if (f < 0.53) return n[4];
    if (f < 0.72) return n[5];
    if (f < 0.78) return n[6];
    return n[7];
  }
  // the moon as seen from the northern hemisphere (waxing: lit on the right)
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

  // sun: declination and equation of time (Spencer / NOAA), times for the
  // station's place (MG.data.geo) in local time with CET / CEST
  function solarAt(doy, hUTC) {
    const g = TAU / 365 * (doy - 1 + (hUTC - 12) / 24);
    const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
    const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
    return { eq, decl };
  }
  const dayOfYear = d => Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 1)) / 86400000) + 1;
  function utcOffsetMin(doy, year = new Date().getFullYear()) {   // summer time from the last Sunday in March to the last in October
    const lastSun = m => { const d = new Date(Date.UTC(year, m + 1, 0)); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return d; };
    const day = d => Math.round((d - Date.UTC(year, 0, 1)) / 86400000) + 1;
    return doy >= day(lastSun(2)) && doy < day(lastSun(9)) ? 120 : 60;
  }
  // sunrise/sunset in minutes local time: upper rim of the sun, with refraction (−0.833°)
  function sunTimes(doy) {
    const { lat, lon } = MG.data.geo, { eq, decl } = solarAt(doy, 12), phi = lat * Math.PI / 180;
    const cosH = Math.cos(90.833 * Math.PI / 180) / (Math.cos(phi) * Math.cos(decl)) - Math.tan(phi) * Math.tan(decl);
    const Hd = Math.acos(clamp(cosH, -1, 1)) * 180 / Math.PI, off = utcOffsetMin(doy);
    return { rise: 720 - 4 * (lon + Hd) - eq + off, set: 720 - 4 * (lon - Hd) - eq + off, noonAlt: 90 - lat + decl * 180 / Math.PI, summer: off === 120 };
  }
  // height above the horizon and compass direction (0° = north) at a local time in minutes
  function sunPos(doy, localMin) {
    const { lat, lon } = MG.data.geo;
    const utc = localMin - utcOffsetMin(doy);
    const { eq, decl } = solarAt(doy, utc / 60), phi = lat * Math.PI / 180;
    const ha = ((utc + eq + 4 * lon) / 4 - 180) * Math.PI / 180;
    const alt = Math.asin(Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(ha));
    const az = (Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(phi) - Math.tan(decl) * Math.cos(phi)) * 180 / Math.PI + 540) % 360;
    return { alt: alt * 180 / Math.PI, az };
  }
  const hhmm = m => { m = ((Math.round(m) % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };

  Object.assign(MG, {
    C, W, H, FS, TAU, clamp, rnd, lerp, fmt, texts,
    makeView, text, arrow, circle, el, simShell, slider, button, toggle, seg, dragOn,
    tempColor, thermo, collide, speedColor, particle, speedLegend,
    satVap, satDens, dewPoint, beaufort, windChill, heatIndex, apparentT, feltT,
    SYN, moonAge, moonName, drawMoonFace,
    dayOfYear, sunTimes, sunPos, hhmm,
    sims: MG.sims || {}
  });
})();
