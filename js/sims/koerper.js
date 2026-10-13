// BODY – wind chill, apparent and felt temperature
(() => {
  'use strict';
  const { C, W, H, FS, TAU, clamp, rnd, fmt, text, circle, simShell, slider, button, tempColor, thermo, windChill, apparentT, feltT } = MG;
  const tx = MG.texts('koerper');

  MG.sims.koerper = (host, variant) => {
    const ui = simShell(host, { label: tx('aria') });
    const { view, ctx } = ui;
    const cfg = {
      windkuehle: { T: 0, RH: 70, v: 5, tMin: -20, tMax: 10, rh: false },
      at:         { T: 14, RH: 70, v: 3.4, tMin: -10, tMax: 40, rh: true },
      gefuehlt:   { T: 14, RH: 50, v: 3, tMin: -15, tMax: 40, rh: true }
    }[variant];
    const SX = 380;   // scene on the left (0..SX), thermometers on the right
    let T = cfg.T, RH = cfg.RH, v = cfg.v, layer = 18;
    const puffs = [], streaks = Array.from({ length: 30 }, () => ({ x: rnd(0, SX), y: rnd(20, 560), l: rnd(20, 50) }));
    const sweat = Array.from({ length: 13 }, (_, i) => ({ x: 190 + rnd(-30, 30), y: 230 + i * 14 + rnd(-5, 5) }));
    const wisps = [];
    const r1 = ui.row();
    const sT = slider(r1, { label: tx('sliderT'), min: cfg.tMin, max: cfg.tMax, step: 0.5, value: T, format: x => fmt(x, 1) + ' °C', onInput: x => { T = x; } });
    const r2 = ui.row();
    const sV = slider(r2, { label: tx('sliderV'), min: 0, max: 20, step: 0.5, value: v, format: x => fmt(x, 1) + ' m/s', onInput: x => { v = x; } });
    let sR = null;
    if (cfg.rh) { const r3 = ui.row(); sR = slider(r3, { label: tx('sliderRh'), min: 10, max: 100, step: 1, value: RH, format: x => fmt(x) + ' %', onInput: x => { RH = x; } }); }
    const r4 = ui.row();
    const names = tx('presets.' + variant);
    const preset = (i, tt, vv, rh) => button(r4, names[i], () => { T = tt; v = vv; sT.set(T); sV.set(v); if (sR && rh != null) { RH = rh; sR.set(RH); } });
    if (variant === 'windkuehle') { preset(0, 0, 0); preset(1, 0, 8); preset(2, -10, 18); }
    else if (variant === 'at') { preset(0, 10, 9, 70); preset(1, 30, 1, 75); preset(2, 30, 3, 20); }
    else { preset(0, -5, 10, 70); preset(1, 15, 3, 50); preset(2, 32, 1, 70); }
    ui.readout();
    ui.hint(tx('hint.' + variant));

    let readT = 0;
    function calc() {
      if (variant === 'windkuehle') return { t: windChill(T, v), mode: v * 3.6 <= 4.8 ? 'noWind' : 'windChill' };
      if (variant === 'at') return { t: apparentT(T, RH, v), mode: 'apparent' };
      return feltT(T, RH, v);
    }
    function body(c) {
      c.beginPath();
      c.arc(190, 150, 34, 0, TAU);
      c.moveTo(142, 470); c.lineTo(142, 250); c.arc(190, 250, 48, Math.PI, 0); c.lineTo(238, 470); c.closePath();
    }
    function frame(dt) {
      if (!view.fit()) return;
      const res = calc();
      if (variant === 'gefuehlt') {
        if (res.mode === 'windChill') ui.done('cold');
        if (res.mode === 'heatIndex') ui.done('heat');
      }
      const tgt = 22 / (1 + v * 0.45);
      layer += (tgt - layer) * Math.min(1, dt * 2);
      ctx.fillStyle = T < 5 ? C.ice : T > 26 ? C.pink : C.yellowPale; ctx.fillRect(0, 0, SX, H);
      ctx.fillStyle = C.white; ctx.fillRect(SX, 0, W - SX, H);
      // wind
      ctx.strokeStyle = C.cyan2; ctx.lineWidth = 3;
      const nS = Math.round(clamp(v / 12, 0, 1) * streaks.length);
      for (let i = 0; i < nS; i++) {
        const s = streaks[i]; s.x += (60 + v * 40) * dt; if (s.x > SX + 20) { s.x = -50; s.y = rnd(20, 560); }
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.l, s.y); ctx.stroke();
      }
      // warm boundary layer + blown-off heat
      if (v > 0.5 && Math.random() < v * dt * 2.5) puffs.push({ x: rnd(150, 230), y: rnd(120, 460), r: rnd(6, 11) });
      ctx.lineJoin = 'round';
      body(ctx); ctx.strokeStyle = C.orange; ctx.lineWidth = layer * 2; ctx.stroke();
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i]; p.x += (40 + v * 30) * dt; p.r -= dt * 3;
        if (p.r <= 0 || p.x > SX) { puffs.splice(i, 1); continue; }
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
      ctx.fillStyle = C.orange; ctx.fillRect(16, 22, 44, 12);
      text(ctx, tx('layer'), 70, 35, FS.s, C.black);
      if (variant === 'gefuehlt') {
        ctx.fillStyle = C.black; ctx.fillRect(10, 52, SX - 20, 64);
        text(ctx, tx('range'), 22, 78, FS.s, C.white);
        text(ctx, tx('modes.' + res.mode).toUpperCase(), 22, 104, FS.s, C.white);
      }
      // thermometers: the air on the left, the computed value on the right (same scale),
      // each filled in the colour of its temperature on the CD scale
      const lo = -30, hi = 45;
      thermo(ctx, 432, 120, 430, lo, hi, T, tempColor(T), t('sims.common.thermometer'), fmt(T, 1) + ' °C');
      thermo(ctx, 540, 120, 430, lo, hi, res.t, tempColor(res.t), tx('names.' + variant), fmt(res.t, 1) + ' °C', false);
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        const d = res.t - T;
        ui.setRead(tx('read', fmt(T, 1), tx('modes.' + res.mode), fmt(res.t, 1), Math.abs(d) >= 0.5 ? fmt(Math.abs(d), 1) : '', d < 0));
      }
    }
    return { frame };
  };
})();
