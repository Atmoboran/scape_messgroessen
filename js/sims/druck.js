// AIR PRESSURE – particle hits on a surface / pressure and height
(() => {
  'use strict';
  const { C, W, H, FS, TAU, clamp, rnd, fmt, text, circle, simShell, slider, button, seg, dragOn, collide, particle, speedLegend } = MG;
  const tx = MG.texts('druck');
  const LOW = THEME.data.low, HIGH = THEME.data.high;   // T (Tief) red, H (Hoch) blue

  MG.sims.druck = host => {
    const ui = simShell(host, { label: tx('aria'), drag: true });
    const { view, ctx } = ui;
    let mode = 'teilchen';
    // --- particle view
    const box = { x0: 16, y0: 16, x1: 392, y1: 540 }, R = 7, MEM = [190, 370];
    const N0 = 70;
    const speedOf = T => 40 + 6 * (T + 20);
    let n = N0, T = 15, rate = 0, flash = 0;
    const P = [];
    const add = () => { const a = rnd(0, TAU), s = speedOf(T); P.push({ x: rnd(box.x0 + R, box.x1 - R), y: rnd(box.y0 + R, box.y1 - R), vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: R }); };
    for (let i = 0; i < n; i++) add();
    // --- height view
    const HMAX = 12000, Y0 = 560, Y1 = 40, CX0 = 64, CX1 = 380;
    let h = 100, p0 = 1013.25;
    const pAt = (hh, base) => base * Math.pow(1 - 2.25577e-5 * hh, 5.25588);
    const yOfH = hh => Y0 - hh / HMAX * (Y0 - Y1);
    const hOfY = y => clamp((Y0 - y) / (Y0 - Y1) * HMAX, 0, HMAX);
    const air = [];
    while (air.length < 380) {
      const hh = rnd(0, HMAX);
      if (Math.random() < Math.pow(1 - 2.25577e-5 * hh, 4.25588)) air.push({ x: rnd(CX0 + 4, CX1 - 4), h: hh, ph: rnd(0, TAU) });
    }
    const MARK_H = [100, 880, 2962, 4806, 8849, 11000];

    // controls
    const rm = ui.row();
    seg(rm, [{ label: tx('modeParticles'), value: 'teilchen' }, { label: tx('modeHeight'), value: 'hoehe' }], mode, v => { mode = v; show(); }, tx('modeAria'));
    const rA = ui.row(), rA2 = ui.row();
    const sN = slider(rA, { label: tx('sliderN'), min: 30, max: 110, step: 1, value: n, format: v => tx('unitN', v), onInput: v => { n = v; } });
    const sT = slider(rA2, { label: tx('sliderT'), min: -20, max: 40, step: 1, value: T, format: v => fmt(v) + ' °C', onInput: v => { T = v; } });
    const rA3 = ui.row();
    button(rA3, tx('btnLow'), () => { n = 50; sN.set(n); });
    button(rA3, tx('btnNormal'), () => { n = N0; T = 15; sN.set(n); sT.set(T); });
    button(rA3, tx('btnHigh'), () => { n = 92; sN.set(n); });
    const rB = ui.row();
    const sH = slider(rB, { label: tx('sliderH'), min: 0, max: HMAX, step: 10, value: h, format: v => fmt(v) + ' m', onInput: v => { h = v; } });
    const rB2 = ui.row();
    seg(rB2, [{ label: tx('wxLow'), value: 995 }, { label: tx('wxNormal'), value: 1013.25 }, { label: tx('wxHigh'), value: 1030 }], p0, v => { p0 = v; }, tx('wxAria'));
    ui.readout();
    const hintEl = ui.hint('');
    function show() {
      const a = mode === 'teilchen';
      [rA, rA2, rA3].forEach(r => { r.hidden = !a; });
      [rB, rB2].forEach(r => { r.hidden = a; });
      view.canvas.classList.toggle('drag', !a);
      hintEl.textContent = a ? tx('hintParticles') : tx('hintHeight');
    }
    show();
    dragOn(view, {
      down: p => { if (mode !== 'hoehe' || p.x > 392) return false; h = Math.round(hOfY(p.y) / 10) * 10; sH.set(h); },
      move: p => { h = Math.round(hOfY(p.y) / 10) * 10; sH.set(h); }
    });

    function stepGas(dt) {
      while (P.length < n) add();
      while (P.length > n) P.pop();
      let rms = 0; for (const p of P) rms += p.vx * p.vx + p.vy * p.vy;
      rms = Math.sqrt(rms / P.length);
      const f = 1 + (speedOf(T) / rms - 1) * Math.min(1, dt * 3);
      let hits = 0;
      for (const p of P) {
        p.vx *= f; p.vy *= f;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < box.x0 + R) { p.x = box.x0 + R; p.vx = Math.abs(p.vx); }
        if (p.x > box.x1 - R) { p.x = box.x1 - R; p.vx = -Math.abs(p.vx); if (p.y > MEM[0] && p.y < MEM[1]) { hits++; } }
        if (p.y < box.y0 + R) { p.y = box.y0 + R; p.vy = Math.abs(p.vy); }
        if (p.y > box.y1 - R) { p.y = box.y1 - R; p.vy = -Math.abs(p.vy); }
      }
      collide(P, W, H);
      return hits;
    }

    function drawGas(dt) {
      const hits = stepGas(dt / 2) + stepGas(dt / 2);
      rate += (hits / dt - rate) * Math.min(1, dt * 1.2);
      if (hits) flash = 1; else flash = Math.max(0, flash - dt * 6);
      const p = 1013.25 * (n / N0) * ((T + 273.15) / 288.15);
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = C.lavender; ctx.fillRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      for (const q of P) particle(ctx, q);
      ctx.strokeStyle = C.black; ctx.lineWidth = 4; ctx.strokeRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      ctx.fillStyle = flash > 0.5 ? C.black : C.orange; ctx.fillRect(box.x1 - 6, MEM[0], 14, MEM[1] - MEM[0]);
      ctx.fillStyle = C.white; ctx.fillRect(box.x1 - 120, MEM[0] - 64, 112, 54);
      text(ctx, tx('mem1'), box.x1 - 14, MEM[0] - 40, FS.s, C.black, 500, 'right');
      text(ctx, tx('mem2'), box.x1 - 14, MEM[0] - 17, FS.s, C.black, 500, 'right');
      // dial
      const cx = 498, cy = 114, r = 84;
      circle(ctx, cx, cy, r, C.white, C.black, 4);
      const ang = v => Math.PI * (0.75 + 1.5 * clamp((v - 500) / 1100, 0, 1));
      ctx.lineWidth = 2; ctx.strokeStyle = C.black;
      for (let v = 500; v <= 1600; v += 100) {
        const a = ang(v);
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4)); ctx.lineTo(cx + Math.cos(a) * (r - 16), cy + Math.sin(a) * (r - 16)); ctx.stroke();
      }
      text(ctx, tx('low'), cx - 62, cy + r + 26, FS.s, LOW, 500, 'center');
      text(ctx, tx('high'), cx + 62, cy + r + 26, FS.s, HIGH, 500, 'center');
      const a = ang(p);
      ctx.strokeStyle = C.orange; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (r - 20), cy + Math.sin(a) * (r - 20)); ctx.stroke();
      circle(ctx, cx, cy, 9, C.black);
      text(ctx, tx('approx', fmt(p)), cx, cy + r + 70, 30, C.black, 500, 'center');
      tx('hits').forEach((l, i) => text(ctx, l, cx, 340 + i * 24, FS.s, C.black, 500, 'center'));
      text(ctx, fmt(rate), cx, 440, 44, C.black, 300, 'center');
      speedLegend(ctx, W / 2, 570);
      if (p > 1100) ui.done('high');
      return p;
    }

    let time = 0;
    function drawHeight(dt) {
      time += dt;
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = C.ice; ctx.fillRect(CX0, Y1, CX1 - CX0, Y0 - Y1);
      for (const a of air) circle(ctx, a.x + Math.sin(time * 1.7 + a.ph) * 3, yOfH(a.h) + Math.cos(time * 1.3 + a.ph) * 3, 3.5, C.purple);
      ctx.fillStyle = C.green; ctx.fillRect(CX0, Y0, CX1 - CX0, 16);
      ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.strokeRect(CX0, Y1, CX1 - CX0, Y0 - Y1 + 16);
      // axis
      ctx.lineWidth = 2;
      for (let k = 0; k <= 12; k += 2) {
        const y = yOfH(k * 1000);
        ctx.beginPath(); ctx.moveTo(CX0 - 8, y); ctx.lineTo(CX0, y); ctx.stroke();
        text(ctx, tx('km', k), CX0 - 10, y + 7, FS.s, C.black, 500, 'right');
      }
      const labels = tx('marks');
      ctx.setLineDash([5, 6]);
      MARK_H.forEach((mh, i) => {
        const y = yOfH(mh);
        ctx.strokeStyle = C.black; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(CX0 + 4, y); ctx.lineTo(CX1 - 4, y); ctx.stroke();
        if (mh > 200) text(ctx, labels[i], CX0 + 8, y - 7, FS.s, C.black, 500);
      });
      ctx.setLineDash([]);
      text(ctx, labels[0], CX0 + 8, Y0 - 12, FS.s, C.black, 500);
      // balloon (on the right of the column so it does not hide the labels)
      const by = yOfH(h), bx = CX1 - 34;
      ctx.strokeStyle = C.black; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + 26); ctx.stroke();
      ctx.fillStyle = C.black; ctx.fillRect(bx - 8, by + 26, 16, 12);
      circle(ctx, bx, by - 22, 22, C.orange, C.black, 3);
      // right side
      const pa = pAt(h, p0), frac = pa / p0, X = 404;
      text(ctx, tx('absIn'), X, 50, FS.s, C.black);
      text(ctx, tx('height', fmt(h)), X, 74, FS.s, C.black);
      text(ctx, tx('hpa', fmt(pa)), X, 128, 44, C.black, 300);
      tx('above').forEach((l, i) => text(ctx, l, X, 176 + i * 24, FS.s, C.black));
      ctx.fillStyle = C.white; ctx.fillRect(X, 214, 584 - X, 32);
      ctx.fillStyle = C.purple; ctx.fillRect(X, 214, (584 - X) * frac, 32);
      ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.strokeRect(X, 214, 584 - X, 32);
      text(ctx, fmt(frac * 100) + ' %', X, 276, FS.l, C.black);
      ctx.fillStyle = C.yellow; ctx.fillRect(X - 8, 320, 592 - X, 170);
      tx('seaLevel').forEach((l, i) => text(ctx, l, X + 6, 352 + i * 24, FS.s, C.black));
      text(ctx, tx('hpa', fmt(p0)), X + 6, 446, 36, C.black, 300);
      if (p0 > 1014) text(ctx, tx('highP'), X + 6, 476, FS.s, HIGH);
      else if (p0 < 1012) text(ctx, tx('lowP'), X + 6, 476, FS.s, LOW);
      else text(ctx, tx('std'), X + 6, 476, FS.s, C.black);
      if (frac <= 0.5) ui.done('half');
      return pa;
    }

    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      const p = mode === 'teilchen' ? drawGas(dt) : drawHeight(dt);
      readT -= dt;
      if (readT <= 0) {
        readT = 0.3;
        ui.setRead(mode === 'teilchen'
          ? tx('readParticles', n, fmt(T), fmt(p))
          : tx('readHeight', fmt(h), fmt(p), fmt(pAt(h, p0) / p0 * 100)));
      }
    }
    return { frame };
  };
})();
