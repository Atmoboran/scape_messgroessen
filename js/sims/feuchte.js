// HUMIDITY – water vapour and saturation. Four linked sliders: temperature,
// relative humidity, absolute humidity and dew point; the drawing shows the
// air with its water vapour and the vessel of the most vapour that fits.
(() => {
  'use strict';
  const { C, W, H, FS, TAU, rnd, fmt, text, circle, simShell, slider, satVap, satDens, dewPoint } = MG;
  const tx = MG.texts('feuchte');
  const TMIN = -10, TMAX = 50, WMAX = 90;

  MG.sims.feuchte = host => {
    const ui = simShell(host, { label: tx('aria') });
    const { view, ctx } = ui;
    const box = { x0: 16, y0: 76, x1: 356, y1: 584 };
    const GX0 = 396, GX1 = 584, GB = 584, GH = 500;     // vessel: left, right, bottom, height for the largest amount
    let T = 14, Wt = 8.7;                               // temperature, water in the air (g/m³, vapour + droplets)
    const P = [];
    for (let i = 0; i < 160; i++) {
      const a = rnd(0, TAU);
      P.push({ x: rnd(box.x0 + 10, box.x1 - 10), y: rnd(box.y0 + 10, box.y1 - 10), vx: Math.cos(a) * 60, vy: Math.sin(a) * 60 });
    }
    const state = () => { const ps = satDens(T), vap = Math.min(Wt, ps); return { ps, vap, liq: Wt - vap, rh: vap / ps * 100, td: dewPoint(T, vap / ps * 100) }; };
    const sT = slider(ui.row(), { label: tx('sliderT'), min: TMIN, max: TMAX, step: 0.5, value: T, info: tx('info.t'), format: v => fmt(v, 1) + ' °C', onInput: v => { T = v; } });
    const sW = slider(ui.row(), { label: tx('sliderW'), min: 0, max: WMAX, step: 0.1, value: Wt, info: tx('info.w'), format: v => fmt(v, 1) + ' g/m³', onInput: v => { Wt = v; } });
    const sR = slider(ui.row(), { label: tx('sliderRh'), min: 1, max: 100, step: 1, value: Math.round(state().rh), info: tx('info.rh'), format: v => v + ' %', onInput: v => { Wt = satDens(T) * v / 100; } });
    const sD = slider(ui.row(), { label: tx('sliderTd'), min: -30, max: TMAX, step: 0.5, value: Math.round(state().td * 2) / 2, info: tx('info.td'), format: v => fmt(v, 1) + ' °C', onInput: v => { Wt = 216.7 * satVap(Math.min(v, T)) / (T + 273.15); } });   // vapour pressure at the dew point, density at the air temperature
    // while one slider is moved, the others follow
    const follow = (sl, v) => { if (document.activeElement !== sl.input) sl.set(v); };
    const wOut = sW.input.parentElement.querySelector('output');
    const rhRange = sR.input.parentElement;

    let condensing = false, alert = 0, time = 0;
    function frame(dt) {
      if (!view.fit()) return;
      const { ps, vap, liq, rh, td } = state();
      follow(sR, Math.round(rh));
      follow(sW, Math.round(Wt * 10) / 10);
      follow(sD, Math.round(td * 2) / 2);
      if (liq > 0.05) wOut.textContent = tx('wWithDrops', fmt(vap, 1), fmt(liq, 1));
      // condensation starts: the relative humidity blinks for a few seconds
      time += dt;
      if (liq > 0.05 && !condensing) alert = 4;
      condensing = liq > 0.05;
      alert = Math.max(0, alert - dt);
      const blink = alert > 0 && Math.sin(time * 10) > 0;
      rhRange.classList.toggle('blink', blink);
      // the points: their number follows the amount of water (droplets drift down slowly)
      const k = 150 / Math.max(40, ps, Wt);
      const nV = Math.min(P.length, Math.round(vap * k)), nL = Math.min(P.length - nV, Math.round(liq * k));
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
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
      // legend: water vapour and droplets
      circle(ctx, 24, 24, 7, C.teal); text(ctx, tx('vapour'), 44, 31, FS.s, C.black);
      circle(ctx, 24, 56, 15, 'rgba(255,255,255,0.75)', C.grey, 1); circle(ctx, 24, 56, 7, C.cyan, C.black, 1.5);
      text(ctx, tx('droplets'), 44, 63, FS.s, C.black);
      // the air
      ctx.fillStyle = C.ice; ctx.fillRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      for (let i = 0; i < nV + nL; i++) {
        const p = P[i];
        if (i < nV) circle(ctx, p.x, p.y, 6, C.teal);
        else { circle(ctx, p.x, p.y, 22, 'rgba(255,255,255,0.75)'); circle(ctx, p.x, p.y, 8, C.cyan, C.black, 1.5); }
      }
      ctx.strokeStyle = C.black; ctx.lineWidth = 4; ctx.strokeRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      text(ctx, tx('air'), box.x1 - 10, box.y1 - 12, FS.s, C.black, 500, 'right');
      if (blink) {
        ctx.fillStyle = C.yellow; ctx.fillRect(box.x0 + 2, box.y0 + 2, box.x1 - box.x0 - 4, 64);
        tx('condensing').forEach((l, i) => text(ctx, l, (box.x0 + box.x1) / 2, box.y0 + 28 + i * 24, FS.m, C.black, 500, 'center'));
      }
      // vessel: the most water vapour that fits at this temperature (the scale grows above 40 g/m³)
      const PX = GH / Math.max(40, ps, Wt);
      const top = GB - ps * PX, fillTop = GB - vap * PX;
      ctx.fillStyle = C.white; ctx.fillRect(GX0, top, GX1 - GX0, ps * PX);
      ctx.fillStyle = C.teal; ctx.fillRect(GX0, fillTop, GX1 - GX0, vap * PX);
      ctx.strokeStyle = C.black; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(GX0, top - 8); ctx.lineTo(GX0, GB); ctx.lineTo(GX1, GB); ctx.lineTo(GX1, top - 8); ctx.stroke();
      if (liq > 0.05) {
        // more water than fits: the surplus sits above the full vessel and turns into droplets
        const oh = liq * PX, oy = top - 8 - oh;
        ctx.fillStyle = C.cyan; ctx.fillRect(GX0 + 6, oy, GX1 - GX0 - 12, oh);
        ctx.setLineDash([6, 5]); ctx.strokeStyle = C.black; ctx.lineWidth = 2; ctx.strokeRect(GX0 + 6, oy, GX1 - GX0 - 12, oh); ctx.setLineDash([]);
        text(ctx, tx('surplus')[0], GX0, oy - 36, FS.s, blink ? C.red : C.black);
        text(ctx, tx('surplus')[1](fmt(liq, 1)), GX0, oy - 12, FS.s, blink ? C.red : C.black);
        text(ctx, tx('atMost', fmt(ps, 1)), (GX0 + GX1) / 2, top + 26, FS.s, C.white, 500, 'center');
      } else text(ctx, tx('atMost', fmt(ps, 1)), GX0, top - 16, FS.s, C.black);
      // the vapour level: the vessel would be full at the dew point
      if (rh < 99.5 && vap * PX > 34) text(ctx, tx('fullAt', fmt(td, 1)), (GX0 + GX1) / 2, fillTop + 26, FS.s, C.white, 500, 'center');
    }
    return { frame };
  };
})();
