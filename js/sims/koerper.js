// HOW DOES IT FEEL? – the thermometer next to wind chill, apparent and felt
// temperature; a person with a warm boundary layer, wind and sweat
(() => {
  'use strict';
  const { C, W, H, FS, TAU, clamp, rnd, fmt, text, circle, simShell, slider, button, tempColor, thermo, windChill, apparentT, feltT } = MG;
  const tx = MG.texts('koerper');

  MG.sims.koerper = host => {
    const ui = simShell(host, { label: tx('aria') });
    const { view, ctx } = ui;
    const SX = 300, BX = 150;   // scene on the left (0..SX, person centred on BX), thermometers on the right
    let T = 14, RH = 60, v = 3, layer = 18;
    const puffs = [], wisps = [], streaks = Array.from({ length: 26 }, () => ({ x: rnd(0, SX), y: rnd(20, 560), l: rnd(20, 50) }));
    const sweat = Array.from({ length: 13 }, (_, i) => ({ x: BX + rnd(-30, 30), y: 230 + i * 14 + rnd(-5, 5) }));
    const r1 = ui.row();
    const sT = slider(r1, { label: tx('sliderT'), min: -20, max: 40, step: 0.5, value: T, format: x => fmt(x, 1) + ' °C', onInput: x => { T = x; } });
    const r2 = ui.row();
    const sV = slider(r2, { label: tx('sliderV'), min: 0, max: 20, step: 0.5, value: v, format: x => fmt(x, 1) + ' m/s', onInput: x => { v = x; } });
    const r3 = ui.row();
    const sR = slider(r3, { label: tx('sliderRh'), min: 10, max: 100, step: 1, value: RH, format: x => fmt(x) + ' %', onInput: x => { RH = x; } });
    const r4 = ui.row();
    [[-5, 10, 70], [10, 9, 70], [15, 2, 50], [32, 1, 75]].forEach(([tt, vv, rh], i) =>
      button(r4, tx('presets')[i], () => { T = tt; v = vv; RH = rh; sT.set(T); sV.set(v); sR.set(RH); }));
    ui.readout();
    ui.hint(tx('hint'));

    function body(c) {
      c.beginPath();
      c.arc(BX, 150, 34, 0, TAU);
      c.moveTo(BX - 48, 470); c.lineTo(BX - 48, 250); c.arc(BX, 250, 48, Math.PI, 0); c.lineTo(BX + 48, 470); c.closePath();
    }
    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      const wc = windChill(T, v), at = apparentT(T, RH, v), fe = feltT(T, RH, v);
      if (fe.mode === 'windChill') ui.done('cold');
      if (fe.mode === 'heatIndex') ui.done('heat');
      layer += (22 / (1 + v * 0.45) - layer) * Math.min(1, dt * 2);
      ctx.fillStyle = T < 5 ? C.ice : T > 26 ? C.pink : C.yellowPale; ctx.fillRect(0, 0, SX, H);
      ctx.fillStyle = C.white; ctx.fillRect(SX, 0, W - SX, H);
      // wind
      ctx.strokeStyle = C.cyan2; ctx.lineWidth = 3;
      const nS = Math.round(clamp(v / 12, 0, 1) * streaks.length);
      for (let i = 0; i < nS; i++) {
        const s = streaks[i]; s.x += (60 + v * 40) * dt; if (s.x > SX + 20) { s.x = -50; s.y = rnd(20, 560); }
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(Math.min(SX, s.x) - s.l, s.y); ctx.stroke();
      }
      // warm boundary layer + blown-off heat
      if (v > 0.5 && Math.random() < v * dt * 2.5) puffs.push({ x: rnd(BX - 40, BX + 40), y: rnd(120, 460), r: rnd(6, 11) });
      ctx.lineJoin = 'round';
      body(ctx); ctx.strokeStyle = C.orange; ctx.lineWidth = layer * 2; ctx.stroke();
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i]; p.x += (40 + v * 30) * dt; p.r -= dt * 3;
        if (p.r <= 0 || p.x > SX - 12) { puffs.splice(i, 1); continue; }
        circle(ctx, p.x, p.y, p.r, C.orange);
      }
      body(ctx); ctx.fillStyle = C.navy; ctx.fill();
      // sweat when warm, evaporation depends on humidity
      if (T > 24) {
        const nSw = Math.round(clamp((T - 24) / 10, 0, 1) * sweat.length);
        for (let i = 0; i < nSw; i++) {
          const d = sweat[i];
          ctx.fillStyle = C.cyan3; ctx.beginPath(); ctx.moveTo(d.x, d.y - 9); ctx.quadraticCurveTo(d.x + 7, d.y + 2, d.x, d.y + 5); ctx.quadraticCurveTo(d.x - 7, d.y + 2, d.x, d.y - 9); ctx.fill();
          if (Math.random() < dt * 1.6 * (1 - RH / 100) * (1 + v / 4)) wisps.push({ x: d.x, y: d.y, a: 1 });
        }
        if (RH > 70) {
          ctx.fillStyle = C.white; ctx.fillRect(10, 500, SX - 20, 76);
          tx('sweat').forEach((l, i) => text(ctx, l, SX / 2, 530 + i * 30, FS.s, C.black, 500, 'center'));
        }
      }
      ctx.strokeStyle = C.white; ctx.lineWidth = 3;
      for (let i = wisps.length - 1; i >= 0; i--) {
        const w = wisps[i]; w.y -= 50 * dt; w.x += (10 + v * 10) * dt; w.a -= dt * 0.8;
        if (w.a <= 0) { wisps.splice(i, 1); continue; }
        ctx.beginPath(); ctx.moveTo(w.x, w.y); ctx.quadraticCurveTo(w.x + 8, w.y - 10, w.x, w.y - 20); ctx.stroke();
      }
      ctx.fillStyle = C.orange; ctx.fillRect(16, 22, 36, 12);
      tx('layer').forEach((l, i) => text(ctx, l, 60, 35 + i * 24, FS.s, C.black));
      // four thermometers on the same scale: measured air, then the three computed values
      const lo = -30, hi = 45, names = tx('names');
      thermo(ctx, 332, 120, 420, lo, hi, T, tempColor(T), names.air, fmt(T) + '°');
      [[408, wc, names.windChill], [474, at, names.apparent], [540, fe.t, names.felt]].forEach(([x, val, nm]) =>
        thermo(ctx, x, 120, 420, lo, hi, val, tempColor(val), nm, fmt(val) + '°', false));
      ctx.fillStyle = C.black; ctx.fillRect(386, 30, 178, 4);
      text(ctx, tx('computed'), 475, 22, FS.s, C.black, 500, 'center');
      ctx.fillStyle = C.black; ctx.fillRect(SX + 12, 516, W - SX - 22, 72);
      text(ctx, tx('range'), SX + 26, 544, FS.s, C.white);
      text(ctx, tx('modes.' + fe.mode).toUpperCase(), SX + 26, 574, FS.m, C.white);
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        ui.setRead(tx('read', fmt(T, 1), fmt(wc, 1), fmt(at, 1), fmt(fe.t, 1), tx('modes.' + fe.mode)));
      }
    }
    return { frame };
  };
})();
