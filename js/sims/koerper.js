// HOW DOES IT FEEL? – the thermometer next to wind chill, apparent and felt
// temperature; a person with a warm boundary layer, wind and sweat
(() => {
  'use strict';
  const { C, W, H, FS, TAU, clamp, rnd, fmt, text, arrow, circle, simShell, slider, tempColor, thermo, windChill, apparentT, feltT } = MG;
  // wet-bulb temperature (Stull 2011): the lowest temperature sweating can cool the skin to
  const wetBulb = (T, RH) => T * Math.atan(0.151977 * Math.sqrt(RH + 8.313659)) + Math.atan(T + RH) - Math.atan(RH - 1.676331)
    + 0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) - 4.686035;
  const tx = MG.texts('koerper');

  MG.sims.koerper = host => {
    const ui = simShell(host, { label: tx('aria') });
    const { view, ctx } = ui;
    const SX = 300, BX = 150;   // scene on the left (0..SX, person centred on BX), thermometers on the right
    const S = 0.75, FY = 506;   // the person is drawn at 75 %, feet stay at FY
    const sy = y => FY + (y - FY) * S;
    let T = 14, RH = 60, v = 3, layer = 18;
    const puffs = [], wisps = [], streaks = Array.from({ length: 18 }, () => ({ x: rnd(0, SX), y: rnd(60, 520), l: rnd(0.8, 1.2) }));
    const sweat = Array.from({ length: 13 }, (_, i) => ({ x: BX + rnd(-21, 21), y: sy(176 + i * 12 + rnd(-4, 4)) }));
    const r1 = ui.row();
    const sT = slider(r1, { label: tx('sliderT'), min: -40, max: 50, step: 0.5, value: T, info: tx('infoT'), format: x => fmt(x, 1) + ' °C', onInput: x => { T = x; } });
    const r2 = ui.row();
    const sV = slider(r2, { label: tx('sliderV'), min: 0, max: 20, step: 0.5, value: v, info: tx('infoV'), format: x => fmt(x, 1) + ' m/s', onInput: x => { v = x; } });
    const r3 = ui.row();
    const sR = slider(r3, { label: tx('sliderRh'), min: 10, max: 100, step: 1, value: RH, info: tx('infoRh'), format: x => fmt(x) + ' %', onInput: x => { RH = x; } });
    ui.readout();
    ui.hint(tx('hint'));

    // pictogram of a person: head, torso, arms, legs
    function body(c) {
      c.save(); c.translate(BX, FY); c.scale(S, S); c.translate(-BX, -FY);
      c.beginPath();
      c.arc(BX, 112, 32, 0, TAU);
      c.roundRect(BX - 42, 154, 84, 176, 12);        // torso
      c.roundRect(BX - 66, 156, 20, 166, 9);         // arms
      c.roundRect(BX + 46, 156, 20, 166, 9);
      c.roundRect(BX - 38, 324, 34, 182, 9);         // legs
      c.roundRect(BX + 4, 324, 34, 182, 9);
      c.restore();   // the path keeps its size, line widths stay unscaled
    }
    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      const wc = windChill(T, v), at = apparentT(T, RH, v), fe = feltT(T, RH, v);
      layer += (18 / (1 + v * 0.45) - layer) * Math.min(1, dt * 2);
      ctx.fillStyle = T < 5 ? C.ice : T > 26 ? C.pink : C.yellowPale; ctx.fillRect(0, 0, SX, H);
      ctx.fillStyle = C.white; ctx.fillRect(SX, 0, W - SX, H);
      // wind
      // wind arrows as in the wind simulation: longer with stronger wind
      const nS = v > 0.2 ? Math.round(clamp(0.3 + v / 12, 0, 1) * streaks.length) : 0;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, SX, H); ctx.clip();
      for (let i = 0; i < nS; i++) {
        const s = streaks[i], len = s.l * (24 + v * 3);
        s.x += (40 + v * 30) * dt; if (s.x > SX + 60) { s.x = -60; s.y = rnd(60, 520); }
        arrow(ctx, s.x - len, s.y, len, 0, C.purple2, 4, 13);
      }
      ctx.restore();
      // warm boundary layer + blown-off heat
      if (v > 0.5 && Math.random() < v * dt * 2.5) puffs.push({ x: rnd(BX - 32, BX + 32), y: rnd(sy(120), sy(460)), r: rnd(5, 9) });
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

      }
      ctx.strokeStyle = C.white; ctx.lineWidth = 3;
      for (let i = wisps.length - 1; i >= 0; i--) {
        const w = wisps[i]; w.y -= 50 * dt; w.x += (10 + v * 10) * dt; w.a -= dt * 0.8;
        if (w.a <= 0) { wisps.splice(i, 1); continue; }
        ctx.beginPath(); ctx.moveTo(w.x, w.y); ctx.quadraticCurveTo(w.x + 8, w.y - 10, w.x, w.y - 20); ctx.stroke();
      }
      // cold: how fast unprotected skin freezes at this wind chill (Environment Canada)
      if (T < 10 && wc < 5) {
        const lvl = wc <= -40 ? 3 : wc <= -28 ? 2 : wc <= -10 ? 1 : 0;
        const blink = lvl === 3 && Math.sin(performance.now() / 120) > 0;
        ctx.fillStyle = lvl === 3 ? (blink ? C.red : C.black) : lvl === 2 ? C.red : C.white;
        ctx.fillRect(10, 516, SX - 20, 72);
        const ink = lvl >= 2 ? C.white : C.black;
        text(ctx, tx('chillBox', fmt(wc, 1)), 22, 544, FS.s, ink);
        text(ctx, tx('cold')[lvl], 22, 572, FS.s, ink);
      }
      // heat the body can no longer get rid of: wet-bulb temperature
      if (T > 24) {
        const tw = wetBulb(T, RH), lvl = tw >= 35 ? 2 : tw >= 31 ? 1 : 0;
        const blink = lvl === 2 && Math.sin(performance.now() / 120) > 0;
        ctx.fillStyle = lvl === 2 ? (blink ? C.red : C.black) : lvl === 1 ? C.red : C.white;
        ctx.fillRect(10, 516, SX - 20, 72);
        const ink = lvl ? C.white : C.black;
        text(ctx, tx('wetBulb', fmt(tw, 1)), 22, 544, FS.s, ink);
        text(ctx, tx('danger')[lvl], 22, 572, FS.s, ink);
      }
      ctx.fillStyle = C.orange; ctx.fillRect(16, 22, 36, 12);
      tx('layer').forEach((l, i) => text(ctx, l, 60, 35 + i * 24, FS.s, C.black));
      // four thermometers on the same scale: measured air, then the three computed values
      const lo = -50, hi = 60, names = tx('names');
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
