// DEW POINT – window pane that fogs up (inside) / night with dew and fog (outside)
(() => {
  'use strict';
  const { C, W, FS, TAU, clamp, rnd, fmt, text, circle, simShell, slider, button, toggle, seg, dewPoint, satDens } = MG;
  const tx = MG.texts('taupunkt');

  // temperature scale in the lower third (from y = 400) with labelled markers
  function tempScale(ctx, y, tMin, tMax, marks) {
    const x0 = 40, x1 = 560;
    const xOf = tt => x0 + (clamp(tt, tMin, tMax) - tMin) / (tMax - tMin) * (x1 - x0);
    ctx.fillStyle = C.white; ctx.fillRect(0, 400, W, 200);
    ctx.strokeStyle = C.black; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 400); ctx.lineTo(W, 400); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.lineWidth = 2;
    for (let tt = Math.ceil(tMin / 5) * 5; tt <= tMax; tt += 5) {
      ctx.beginPath(); ctx.moveTo(xOf(tt), y); ctx.lineTo(xOf(tt), y + 8); ctx.stroke();
      text(ctx, fmt(tt) + '°', xOf(tt), y + 30, FS.s, C.black, 500, 'center');
    }
    // marker: label on top, triangle below; overlapping labels move one row up
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

  function taupunktInnen(host) {
    const ui = simShell(host, { label: tx('ariaInnen') });
    const { view, ctx } = ui;
    const PX0 = 330, PX1 = 420;     // pane
    let Tin = 21, RH = 50, Tout = 8, glass = 0.45, cover = 0;
    const drops = Array.from({ length: 120 }, () => ({ x: rnd(PX0 + 12, PX1 - 12), y: rnd(36, 380), r: rnd(2, 6), k: Math.random() }));
    const vap = Array.from({ length: 70 }, () => ({ x: rnd(20, 310), y: rnd(100, 380), ph: rnd(0, TAU) }));
    const flakes = Array.from({ length: 22 }, () => ({ x: rnd(430, 592), y: rnd(0, 400), s: rnd(20, 50) }));
    const r1 = ui.row();
    slider(r1, { label: tx('sliderRoom'), min: 16, max: 26, step: 0.5, value: Tin, format: v => fmt(v, 1) + ' °C', onInput: v => { Tin = v; } });
    slider(r1, { label: tx('sliderRh'), min: 30, max: 85, step: 1, value: RH, format: v => fmt(v) + ' %', onInput: v => { RH = v; } });
    const r2 = ui.row();
    slider(r2, { label: tx('sliderOut'), min: -10, max: 15, step: 0.5, value: Tout, format: v => fmt(v, 1) + ' °C', onInput: v => { Tout = v; } });
    seg(r2, [{ label: tx('single'), value: 0.45 }, { label: tx('double'), value: 0.8 }], glass, v => { glass = v; }, tx('glassAria'));
    ui.readout();
    ui.hint(tx('hint.innen'));

    let readT = 0, foggedAt = null;
    function frame(dt) {
      if (!view.fit()) return;
      const td = dewPoint(Tin, RH);
      const pane = Tout + glass * (Tin - Tout);
      const target = clamp((td - pane) / 3, 0, 1);
      cover += (target - cover) * Math.min(1, dt * 0.9);
      // tasks: fog the pane, then clear it without making it warmer outside
      if (cover > 0.4 && foggedAt === null) { foggedAt = Tout; ui.done('fog'); }
      if (foggedAt !== null && Tout <= foggedAt && cover < 0.08 && pane > td) ui.done('dry');
      ctx.fillStyle = C.cream; ctx.fillRect(0, 0, PX0, 400);
      ctx.fillStyle = Tout < 0 ? C.bluePale : C.ice; ctx.fillRect(PX1, 0, W - PX1, 400);
      // water vapour in the room
      const nv = Math.round(satDens(Tin) * RH / 100 * 4.5);
      for (let i = 0; i < Math.min(nv, vap.length); i++) {
        const v = vap[i]; v.ph += dt;
        circle(ctx, v.x + Math.sin(v.ph * 1.3 + i) * 8, v.y + Math.cos(v.ph + i) * 8, 5, C.teal);
      }
      if (Tout < 0) for (const f of flakes) { f.y = (f.y + f.s * dt) % 400; circle(ctx, f.x, f.y, 3, C.white); }
      // pane
      ctx.fillStyle = C.lavender; ctx.fillRect(PX0, 0, PX1 - PX0, 400);
      ctx.fillStyle = `rgba(255,255,255,${(cover * 0.55).toFixed(3)})`; ctx.fillRect(PX0 + 6, 30, PX1 - PX0 - 12, 356);
      const nd = Math.round(cover * drops.length);
      for (let i = 0; i < nd; i++) { const d = drops[i]; circle(ctx, d.x, d.y, d.r * (0.6 + 0.4 * cover), C.cyan2, C.petrol, 1); }
      ctx.strokeStyle = C.black; ctx.lineWidth = 6; ctx.strokeRect(PX0 + 3, 27, PX1 - PX0 - 6, 362);
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(PX0, 0); ctx.lineTo(PX0, 400); ctx.moveTo(PX1, 0); ctx.lineTo(PX1, 400); ctx.stroke();
      text(ctx, tx('room', fmt(Tin, 1)), 16, 36, FS.l, C.black);
      text(ctx, tx('rh', fmt(RH)), 16, 66, FS.s, C.black);
      text(ctx, tx('pane'), (PX0 + PX1) / 2, 20, FS.s, C.black, 500, 'center');
      text(ctx, tx('outside'), (PX1 + W) / 2, 56, FS.m, C.black, 500, 'center');
      text(ctx, fmt(Tout, 1) + ' °C', (PX1 + W) / 2, 86, FS.m, C.black, 500, 'center');
      if (cover > 0.15) { ctx.fillStyle = C.black; ctx.fillRect(PX0 - 40, 180, PX1 - PX0 + 80, 44); text(ctx, tx('fogging'), (PX0 + PX1) / 2, 210, FS.m, C.white, 500, 'center'); }
      tempScale(ctx, 545, -10, 30, [
        { t: Tin, label: tx('markRoom'), color: C.orange },
        { t: td, label: tx('markDew'), color: C.teal },
        { t: pane, label: tx('markPane'), color: C.cyan2 }
      ]);
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        ui.setRead(tx('readInnen', fmt(td, 1), fmt(pane, 1), pane < td, fmt(pane - td, 1)));
      }
    }
    return { frame };
  }

  function taupunktAussen(host) {
    const ui = simShell(host, { label: tx('ariaAussen') });
    const { view, ctx } = ui;
    let T0 = 18, RH0 = 75, time = 0, playing = false, dew = 0, fog = 0;
    const blades = Array.from({ length: 48 }, (_, i) => ({ x: 8 + i * 12.4 + rnd(-4, 4), h: rnd(16, 34), lean: rnd(-6, 6) }));
    const stars = Array.from({ length: 20 }, () => ({ x: rnd(16, 584), y: rnd(80, 180) }));
    const r1 = ui.row();
    const reset = () => { time = 0; dew = 0; fog = 0; };
    slider(r1, { label: tx('sliderEvening'), min: 8, max: 28, step: 0.5, value: T0, format: v => fmt(v, 1) + ' °C', onInput: v => { T0 = v; reset(); } });
    slider(r1, { label: tx('sliderRh'), min: 40, max: 95, step: 1, value: RH0, format: v => fmt(v) + ' %', onInput: v => { RH0 = v; reset(); } });
    const r2 = ui.row();
    // the night run is part of the experiment: big yellow start button
    const play = toggle(r2, tx('btnNight'), playing, v => { playing = v; if (v && time >= 10) reset(); }, 'primary big');
    button(r2, tx('btnReset'), () => { reset(); playing = false; play.set(false); }, 'big');
    ui.readout();
    ui.hint(tx('hint.aussen'));

    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      if (playing) { time += dt / 2; if (time >= 10) { time = 10; playing = false; play.set(false); } }
      const td = dewPoint(T0, RH0);
      const air = Math.max(td, T0 - 9 * (1 - Math.exp(-time / 3.5)));
      const grass = air - 2.5 * Math.min(1, time / 2);
      dew += ((grass < td ? clamp((td - grass) / 2, 0.15, 1) : 0) - dew) * Math.min(1, dt * 0.8);
      fog += ((air - td < 0.3 ? 1 : air - td < 1.2 ? 0.35 : 0) - fog) * Math.min(1, dt * 0.5);
      if (dew > 0.3) ui.done('dew');
      if (fog > 0.4) ui.done('fog');
      const night = clamp(time / 1.5, 0, 1) * clamp((10 - time) / 1.2, 0, 1);
      ctx.fillStyle = night > 0.5 ? C.navy : C.cyan2; ctx.fillRect(0, 0, W, 320);
      if (night > 0.5) {
        for (const s of stars) circle(ctx, s.x, s.y, 2, C.white);
        ctx.fillStyle = C.yellowPastel; ctx.beginPath(); ctx.arc(520, 60, 30, 0, TAU); ctx.fill();
        ctx.fillStyle = C.navy; ctx.beginPath(); ctx.arc(534, 51, 27, 0, TAU); ctx.fill();
      }
      // tree and house as flat shapes
      ctx.fillStyle = C.greenStrong; ctx.beginPath(); ctx.arc(110, 210, 58, 0, TAU); ctx.fill(); ctx.fillRect(102, 236, 16, 90);
      ctx.fillStyle = C.sand; ctx.fillRect(370, 222, 130, 98);
      ctx.fillStyle = C.rust; ctx.beginPath(); ctx.moveTo(356, 224); ctx.lineTo(435, 170); ctx.lineTo(514, 224); ctx.closePath(); ctx.fill();
      ctx.fillStyle = night > 0.5 ? C.yellow : C.ice; ctx.fillRect(392, 248, 32, 32); ctx.fillRect(448, 248, 32, 32);
      // meadow
      ctx.fillStyle = C.green; ctx.fillRect(0, 320, W, 80);
      ctx.strokeStyle = C.greenStrong; ctx.lineWidth = 3;
      const nd = Math.round(dew * blades.length);
      blades.forEach((b, i) => {
        ctx.beginPath(); ctx.moveTo(b.x, 394); ctx.lineTo(b.x + b.lean, 394 - b.h); ctx.stroke();
        if (i < nd) circle(ctx, b.x + b.lean, 394 - b.h - 3, 4, C.white, C.cyan, 1.5);
      });
      // fog: flat, half-transparent bands
      if (fog > 0.02) {
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = `rgba(255,255,255,${(fog * (0.55 - i * 0.1)).toFixed(3)})`;
          ctx.fillRect(0, 270 - i * 55, W, 130 + i * 55);
        }
      }
      const hh = (20 + Math.floor(time)) % 24, mm = Math.floor((time % 1) * 60);
      ctx.fillStyle = C.black; ctx.fillRect(12, 12, 176, 50);
      text(ctx, tx('clock', String(hh).padStart(2, '0'), String(mm).padStart(2, '0')), 100, 47, FS.l, C.white, 500, 'center');
      if (fog > 0.4) { ctx.fillStyle = C.black; ctx.fillRect(200, 96, 200, 48); text(ctx, tx('fog'), 300, 129, FS.l, C.white, 500, 'center'); }
      else if (dew > 0.3) { ctx.fillStyle = C.black; ctx.fillRect(170, 96, 260, 48); text(ctx, tx('dew'), 300, 128, FS.m, C.white, 500, 'center'); }
      tempScale(ctx, 545, 0, 30, [
        { t: air, label: tx('markAir'), color: C.orange },
        { t: td, label: tx('markDew'), color: C.teal },
        { t: grass, label: tx('markGrass'), color: C.green }
      ]);
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        const gap = air - td;
        ui.setRead(tx('readAussen', fmt(air, 1), fmt(td, 1), fmt(gap, 1), gap < 0.3 ? 'fog' : gap < 2 ? 'near' : ''));
      }
    }
    return { frame };
  }

  MG.sims.taupunkt = (host, variant) => (variant === 'innen' ? taupunktInnen(host) : taupunktAussen(host));
})();
