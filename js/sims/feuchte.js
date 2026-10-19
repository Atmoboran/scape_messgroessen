// HUMIDITY – water vapour and saturation: relative and absolute humidity, dew point
(() => {
  'use strict';
  const { C, W, H, FS, TAU, clamp, rnd, fmt, text, circle, simShell, slider, button, satDens, dewPoint } = MG;
  const tx = MG.texts('feuchte');

  MG.sims.feuchte = host => {
    const ui = simShell(host, { label: tx('aria') });
    const { view, ctx } = ui;
    const box = { x0: 16, y0: 110, x1: 344, y1: 584 };
    let T = 14, Wt = 8.7;
    let Tt = T, Wtt = Wt;
    const PX = 8, GB = 584, GX0 = 384, GX1 = 584;  // vessel: units per g/m³, bottom, width
    const P = [];
    for (let i = 0; i < 110; i++) {
      const a = rnd(0, TAU);
      P.push({ x: rnd(box.x0 + 10, box.x1 - 10), y: rnd(box.y0 + 10, box.y1 - 10), vx: Math.cos(a) * 60, vy: Math.sin(a) * 60 });
    }
    const r1 = ui.row();
    const sT = slider(r1, { label: tx('sliderT'), min: -10, max: 35, step: 0.5, value: T, format: v => fmt(v, 1) + ' °C', onInput: v => { Tt = T = v; } });
    const r2 = ui.row();
    const sW = slider(r2, { label: tx('sliderW'), min: 0, max: 30, step: 0.1, value: Wt, format: v => fmt(v, 1) + ' g/m³', onInput: v => { Wtt = Wt = v; } });
    const r3 = ui.row();
    button(r3, tx('btnDwd'), () => { Tt = 10; Wtt = +satDens(10).toFixed(1); }, 'primary');
    button(r3, tx('btnWarm'), () => { Tt = 20; });
    button(r3, tx('btnDew'), () => { const ps = satDens(T); Tt = clamp(dewPoint(T, Math.min(Wt, ps) / ps * 100), -10, 35); });
    button(r3, tx('btnCook'), () => { Wtt = Math.min(30, Wtt + 4); });
    ui.readout();
    ui.hint(tx('hint'));

    let readT = 0, wasSaturated = false;
    function frame(dt) {
      if (!view.fit()) return;
      const k = Math.min(1, dt * 1.6);
      if (Math.abs(Tt - T) > 0.01) { T += (Tt - T) * k; if (Math.abs(Tt - T) < 0.05) T = Tt; sT.set(Math.round(T * 2) / 2); }
      if (Math.abs(Wtt - Wt) > 0.01) { Wt += (Wtt - Wt) * k; if (Math.abs(Wtt - Wt) < 0.02) Wt = Wtt; sW.set(Math.round(Wt * 10) / 10); }
      const ps = satDens(T), vap = Math.min(Wt, ps), liq = Wt - vap, rh = vap / ps * 100, td = dewPoint(T, rh);
      // tasks: saturate, then warm to 20 °C → about half; cool below the dew point
      if (rh >= 99) wasSaturated = true;
      if (wasSaturated && T >= 19.5 && rh <= 60) ui.done('warm');
      if (liq > 0.3) ui.done('drops');
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
      // header
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
      text(ctx, tx('air'), 16, 34, FS.l, C.black);
      text(ctx, tx('at', fmt(T, 1)), 16, 64, FS.m, C.black);
      circle(ctx, 24, 88, 7, C.teal); text(ctx, tx('vapour'), 40, 95, FS.s, C.black);
      // the three values: relative, absolute, dew point
      text(ctx, tx('rh'), GX0, 26, FS.s, C.black);
      text(ctx, fmt(rh) + ' %', GX0, 74, 48, C.black, 300);
      text(ctx, tx('abs'), GX0, 112, FS.s, C.black);
      text(ctx, fmt(vap, 1) + ' g/m³', GX0, 142, FS.l, C.black);
      text(ctx, tx('dew'), GX0, 180, FS.s, C.black);
      text(ctx, fmt(td, 1) + ' °C', GX0, 210, FS.l, C.black);
      // box
      ctx.fillStyle = T > 22 ? C.pink : T > 8 ? C.paleGreen : C.ice;
      ctx.fillRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      for (let i = 0; i < nV + nL; i++) {
        const p = P[i];
        if (i < nV) circle(ctx, p.x, p.y, 6, C.teal);
        else { circle(ctx, p.x, p.y, 22, 'rgba(255,255,255,0.75)'); circle(ctx, p.x, p.y, 8, C.cyan, C.black, 1.5); }
      }
      ctx.strokeStyle = C.black; ctx.lineWidth = 4; ctx.strokeRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      if (nL > 0) { ctx.fillStyle = C.white; ctx.fillRect(box.x0 + 2, box.y1 - 36, box.x1 - box.x0 - 4, 34); text(ctx, tx('droplets'), box.x1 - 10, box.y1 - 12, FS.s, C.black, 500, 'right'); }
      // vessel: the most water vapour that fits at this temperature
      const gh = ps * PX, top = GB - gh, fillTop = GB - vap * PX;
      ctx.fillStyle = C.white; ctx.fillRect(GX0, top, GX1 - GX0, gh);
      ctx.fillStyle = C.teal; ctx.fillRect(GX0, fillTop, GX1 - GX0, vap * PX);
      ctx.strokeStyle = C.black; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(GX0, top - 8); ctx.lineTo(GX0, GB); ctx.lineTo(GX1, GB); ctx.lineTo(GX1, top - 8); ctx.stroke();
      text(ctx, tx('atMost', fmt(ps, 1)), GX0, top - 16, FS.s, C.black);
      // the water vapour level: the vessel would be full at the dew point
      if (rh < 99.5 && vap * PX > 34) text(ctx, tx('fullAt', fmt(td, 1)), (GX0 + GX1) / 2, fillTop + 26, FS.s, C.white, 500, 'center');
      if (liq > 0.05) text(ctx, tx('plus', fmt(liq, 1)), GX1, top - 42, FS.s, C.black, 500, 'right');
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        ui.setRead(tx('read', fmt(rh), fmt(vap, 1), fmt(td, 1), liq > 0.05 ? fmt(liq, 1) : ''));
      }
    }
    return { frame };
  };
})();
