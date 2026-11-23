// TEMPERATURE – particle motion, a thermometer and the Maxwell-Boltzmann
// distribution of the speeds of real air particles
(() => {
  'use strict';
  const { C, W, H, FS, TAU, clamp, rnd, fmt, text, circle, simShell, slider, dragOn, thermo, collide } = MG;
  const tx = MG.texts('temperatur');
  const R_GAS = 8.314, M_AIR = 0.02896;              // J/(mol·K), kg/mol
  const K = T => T + 273.15;
  // Maxwell-Boltzmann distribution of the speed v (m/s) for air at T (°C), per m/s
  const mb = (v, T) => { const a = M_AIR / (2 * R_GAS * K(T)); return 4 * Math.PI * Math.pow(a / Math.PI, 1.5) * v * v * Math.exp(-a * v * v); };
  const vMean = T => Math.sqrt(8 * R_GAS * K(T) / (Math.PI * M_AIR));
  const vPeak = T => Math.sqrt(2 * R_GAS * K(T) / M_AIR);
  const vRms = T => Math.sqrt(3 * R_GAS * K(T) / M_AIR);
  const TMIN = -273, TMAX = 100, TREF = [-20, 40];
  // thermometer colour from absolute zero to 100 °C: blue – grey – red on the CD temperature
  // scale, centred on everyday temperatures and saturating towards the extremes
  const tcol = T => THEME.tempColor(0.5 + 0.5 * Math.tanh((T - 14) / 35));
  // particle colour from the real speed v (m/s), the same scale in the box and the diagram:
  // 0 m/s blue, the mean speed at 14 °C (≈ 460 m/s) grey, twice that red
  const vcol = v => THEME.tempColor(v / (2 * vMean(14)));

  MG.sims.temperatur = host => {
    const ui = simShell(host, { label: tx('aria'), drag: true });
    const { view, ctx } = ui;
    const box = { x0: 16, y0: 16, x1: 400, y1: 318 };
    const R = 7;
    // speed in the drawing grows with the square root of the absolute temperature, as for real particles
    const V14 = 200, speedOf = T => V14 * Math.sqrt(Math.max(0, K(T)) / K(14));
    const realOf = s => s * vRms(14) / V14;                   // drawn speed → real speed in m/s
    let T = 14;
    const P = [];
    for (let i = 0; i < 52; i++) {
      const a = rnd(0, TAU), s = speedOf(T);
      P.push({ x: rnd(box.x0 + R, box.x1 - R), y: rnd(box.y0 + R, box.y1 - R), vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: R });
    }
    const r = ui.row();
    const sT = slider(r, { label: tx('slider'), min: TMIN, max: TMAX, step: 1, value: T, info: tx('info'), format: v => v <= TMIN ? tx('zero') : fmt(v) + ' °C', onInput: v => { T = v; } });

    // diagram: speeds 0 … 1400 m/s
    const G = { x0: 40, x1: 560, y0: 400, y1: 540, vmax: 1400 };
    const X = v => G.x0 + v / G.vmax * (G.x1 - G.x0);
    // height: the reference curves fit; a very cold, very narrow curve may run out at the top
    const refPeak = mb(vPeak(TREF[0]), TREF[0]);
    let yMax = refPeak * 1.08;
    const Y = f => G.y1 - f / yMax * (G.y1 - G.y0);
    // drag in the diagram: the mean speed follows the finger, the temperature follows
    const tOfMean = v => v * v * Math.PI * M_AIR / (8 * R_GAS) - 273.15;
    dragOn(view, {
      down: p => { if (p.y < G.y0 - 30) return false; setFromX(p.x); },
      move: p => setFromX(p.x)
    });
    function setFromX(x) {
      const v = (x - G.x0) / (G.x1 - G.x0) * G.vmax;
      T = Math.round(clamp(tOfMean(v), TMIN, TMAX)); sT.set(T);
    }

    function step(dt) {
      let rms = 0;
      for (const p of P) rms += p.vx * p.vx + p.vy * p.vy;
      rms = Math.sqrt(rms / P.length);
      if (rms < 0.5 && speedOf(T) > 0.5) for (const p of P) { const a = rnd(0, TAU); p.vx = Math.cos(a); p.vy = Math.sin(a); rms = 1; }   // start again from standstill
      const f = rms < 0.5 ? 0 : 1 + (speedOf(T) / rms - 1) * Math.min(1, dt * 3);
      for (const p of P) {
        p.vx *= f; p.vy *= f;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < box.x0 + R) { p.x = box.x0 + R; p.vx = Math.abs(p.vx); }
        if (p.x > box.x1 - R) { p.x = box.x1 - R; p.vx = -Math.abs(p.vx); }
        if (p.y < box.y0 + R) { p.y = box.y0 + R; p.vy = Math.abs(p.vy); }
        if (p.y > box.y1 - R) { p.y = box.y1 - R; p.vy = -Math.abs(p.vy); }
      }
      collide(P, W, H);
    }

    function curve(Tc, stroke, lw, dash) {
      ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.setLineDash(dash || []);
      ctx.beginPath();
      for (let v = 0; v <= G.vmax; v += 10) { const y = Y(mb(v, Tc)); if (v) ctx.lineTo(X(v), y); else ctx.moveTo(X(v), y); }
      ctx.stroke(); ctx.setLineDash([]);
    }

    function frame(dt) {
      if (!view.fit()) return;
      step(dt / 2); step(dt / 2);
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = C.yellowPale; ctx.fillRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      // every particle in the colour of its speed
      for (const p of P) circle(ctx, p.x, p.y, p.r, vcol(realOf(Math.hypot(p.vx, p.vy))), C.black, 1.2);
      ctx.strokeStyle = C.black; ctx.lineWidth = 4; ctx.strokeRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      thermo(ctx, 500, 70, 262, TMIN, TMAX, T, tcol(T), t('sims.common.thermometer'), T <= TMIN ? tx('zeroShort') : fmt(T) + ' °C', true, 50);
      // legend: slow – fast in the same colours
      const lx = 208 - 2 * 26;
      text(ctx, t('sims.common.slow'), lx - 18, 351, FS.s, C.black, 500, 'right');
      [0, 0.25, 0.5, 0.75, 1].forEach((f, i) => circle(ctx, lx + i * 26, 344, 9, THEME.tempColor(f), C.black, 1.2));
      text(ctx, t('sims.common.fast'), lx + 4 * 26 + 18, 351, FS.s, C.black, 500, 'left');
      // Maxwell-Boltzmann: the area under the curve in the colour of each speed
      const peakNow = mb(vPeak(T), T);
      yMax = Math.max(refPeak, Math.min(peakNow, 3 * refPeak)) * 1.08;
      ctx.save(); ctx.beginPath(); ctx.rect(G.x0, G.y0 - 30, G.x1 - G.x0 + 20, G.y1 - G.y0 + 30); ctx.clip();
      for (let v = 0; v < G.vmax; v += 10) {
        const f = mb(v + 5, T);
        ctx.fillStyle = vcol(v + 5);
        ctx.fillRect(X(v), Y(f), X(v + 10) - X(v) + 0.5, G.y1 - Y(f));
      }
      curve(TREF[0], C.blue2, 2, [6, 5]);
      curve(TREF[1], C.red, 2, [6, 5]);
      curve(T, C.black, 3);
      ctx.restore();
      // mean speed
      const vm = vMean(T);
      ctx.strokeStyle = C.black; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(X(vm), G.y1); ctx.lineTo(X(vm), G.y0 - 6); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, tx('mean', fmt(Math.round(vm / 5) * 5)), X(vm) + 6, G.y0 + 10, FS.s, C.black, 500, 'left');
      // axes
      ctx.strokeStyle = C.black; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(G.x0, G.y0 - 12); ctx.lineTo(G.x0, G.y1); ctx.lineTo(G.x1, G.y1); ctx.stroke();
      for (let v = 0; v <= G.vmax; v += 400) {
        ctx.beginPath(); ctx.moveTo(X(v), G.y1); ctx.lineTo(X(v), G.y1 + 6); ctx.stroke();
        text(ctx, String(v), X(v), G.y1 + 26, FS.s, C.black, 500, 'center');
      }
      text(ctx, tx('axisV'), G.x1, G.y1 + 52, FS.s, C.black, 500, 'right');
      text(ctx, tx('cold'), X(vPeak(TREF[0])) - 40, Y(mb(vPeak(TREF[0]), TREF[0])) - 6, FS.s, C.blue2, 500, 'right');
      text(ctx, tx('hot'), X(1000), Y(mb(1000, TREF[1])) - 14, FS.s, C.red, 500, 'left');
    }
    return { frame };
  };
})();
