// TEMPERATURE – particle motion, a thermometer and the Maxwell-Boltzmann
// distribution of the speeds of real air particles
(() => {
  'use strict';
  const { C, W, H, FS, TAU, clamp, rnd, fmt, text, simShell, slider, dragOn, tempColor, thermo, collide, particle, speedLegend, speedColor } = MG;
  const tx = MG.texts('temperatur');
  const R_GAS = 8.314, M_AIR = 0.02896;              // J/(mol·K), kg/mol
  const K = T => T + 273.15;
  // Maxwell-Boltzmann distribution of the speed v (m/s) for air at T (°C), per m/s
  const mb = (v, T) => { const a = M_AIR / (2 * R_GAS * K(T)); return 4 * Math.PI * Math.pow(a / Math.PI, 1.5) * v * v * Math.exp(-a * v * v); };
  const vMean = T => Math.sqrt(8 * R_GAS * K(T) / (Math.PI * M_AIR));
  const vPeak = T => Math.sqrt(2 * R_GAS * K(T) / M_AIR);
  const vRms = T => Math.sqrt(3 * R_GAS * K(T) / M_AIR);
  const TMIN = -20, TMAX = 40;

  MG.sims.temperatur = host => {
    const ui = simShell(host, { label: tx('aria'), drag: true });
    const { view, ctx } = ui;
    const box = { x0: 16, y0: 16, x1: 400, y1: 318 };
    const R = 7;
    const speedOf = T => 40 + 6 * (T + 20);            // shown: −20 °C → 40 px/s, 40 °C → 400 px/s
    let T = 14;
    const P = [];
    for (let i = 0; i < 52; i++) {
      const a = rnd(0, TAU), s = speedOf(T);
      P.push({ x: rnd(box.x0 + R, box.x1 - R), y: rnd(box.y0 + R, box.y1 - R), vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: R });
    }
    const r = ui.row();
    const sT = slider(r, { label: tx('slider'), min: TMIN, max: TMAX, step: 1, value: T, info: tx('info'), format: v => fmt(v) + ' °C', onInput: v => { T = v; } });
    ui.readout();
    ui.hint(tx('hint'));

    // diagram: speeds 0 … 1400 m/s
    const G = { x0: 40, x1: 560, y0: 400, y1: 540, vmax: 1400 };
    const X = v => G.x0 + v / G.vmax * (G.x1 - G.x0);
    const yMax = mb(vPeak(TMIN), TMIN) * 1.08;          // the coldest curve is the highest
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
      const f = 1 + (speedOf(T) / rms - 1) * Math.min(1, dt * 3);
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

    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      step(dt / 2); step(dt / 2);
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = C.yellowPale; ctx.fillRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      for (const p of P) particle(ctx, p);
      ctx.strokeStyle = C.black; ctx.lineWidth = 4; ctx.strokeRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      thermo(ctx, 500, 70, 262, TMIN, TMAX, T, tempColor(T), t('sims.common.thermometer'), fmt(T) + ' °C');
      speedLegend(ctx, 208, 344);
      // Maxwell-Boltzmann: the area under the curve coloured like the particles
      // (the drawing exaggerates the speed differences, so the colours use the same scale as the box)
      const toShown = speedOf(T) / vRms(T);
      for (let v = 0; v < G.vmax; v += 20) {
        const f = mb(v + 10, T);
        ctx.fillStyle = speedColor((v + 10) * toShown);
        ctx.fillRect(X(v), Y(f), X(v + 20) - X(v) + 0.5, G.y1 - Y(f));
      }
      curve(TMIN, C.blue2, 2, [6, 5]);
      curve(TMAX, C.red, 2, [6, 5]);
      curve(T, C.black, 3);
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
      text(ctx, tx('cold'), X(vPeak(TMIN)) - 40, Y(mb(vPeak(TMIN), TMIN)) - 6, FS.s, C.blue2, 500, 'right');
      text(ctx, tx('hot'), X(1000), Y(mb(1000, TMAX)) - 14, FS.s, C.red, 500, 'left');
      readT -= dt;
      if (readT <= 0) {
        readT = 0.3;
        ui.setRead(tx('read', fmt(T), fmt(Math.round(vPeak(T) / 5) * 5), fmt(Math.round(vm / 5) * 5), fmt(Math.round(vm * 3.6 / 50) * 50)));
      }
    }
    return { frame };
  };
})();
