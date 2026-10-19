// TEMPERATURE – particle motion and a thermometer
(() => {
  'use strict';
  const { C, W, H, TAU, rnd, fmt, simShell, slider, tempColor, thermo, collide, particle, speedLegend } = MG;
  const tx = MG.texts('temperatur');

  MG.sims.temperatur = host => {
    const ui = simShell(host, { label: tx('aria') });
    const { view, ctx } = ui;
    const box = { x0: 16, y0: 16, x1: 400, y1: 540 };
    const R = 7;
    const speedOf = T => 40 + 6 * (T + 20);            // shown: −20 °C → 40 px/s, 40 °C → 400 px/s
    const realSpeed = T => Math.sqrt(8 * 8.314 * (T + 273.15) / (Math.PI * 0.02896));
    let T = 14;
    const P = [];
    for (let i = 0; i < 80; i++) {
      const a = rnd(0, TAU), s = speedOf(T);
      P.push({ x: rnd(box.x0 + R, box.x1 - R), y: rnd(box.y0 + R, box.y1 - R), vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: R });
    }
    const r = ui.row();
    slider(r, { label: tx('slider'), min: -20, max: 40, step: 1, value: T, info: tx('info'), format: v => fmt(v) + ' °C', onInput: v => { T = v; } });
    ui.readout();
    ui.hint(tx('hint'));

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

    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      step(dt / 2); step(dt / 2);
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = C.yellowPale; ctx.fillRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      for (const p of P) particle(ctx, p);
      ctx.strokeStyle = C.black; ctx.lineWidth = 4; ctx.strokeRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      thermo(ctx, 500, 100, 410, -20, 40, T, tempColor(T), t('sims.common.thermometer'), fmt(T) + ' °C');
      speedLegend(ctx, W / 2, 570);
      readT -= dt;
      if (readT <= 0) {
        readT = 0.3;
        ui.setRead(tx('read', fmt(T), fmt(Math.round(realSpeed(T) / 5) * 5), fmt(Math.round(realSpeed(T) * 3.6 / 50) * 50)));
      }
    }
    return { frame };
  };
})();
