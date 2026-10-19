// AIR PRESSURE – particle hits on a surface / pressure and height
(() => {
  'use strict';
  const { C, W, H, FS, TAU, clamp, rnd, fmt, text, circle, simShell, slider, seg, dragOn, collide, particle, speedLegend } = MG;
  const tx = MG.texts('druck');
  const LOW = THEME.data.low, HIGH = THEME.data.high;   // T (Tief) red, H (Hoch) blue

  // barometer dial: needle between vMin and vMax, labels left and right below
  function dial(ctx, cx, cy, r, v, vMin, vMax, left, right) {
    circle(ctx, cx, cy, r, C.white, C.black, 4);
    const ang = x => Math.PI * (0.75 + 1.5 * clamp((x - vMin) / (vMax - vMin), 0, 1));
    ctx.lineWidth = 2; ctx.strokeStyle = C.black;
    for (let i = 0; i <= 10; i++) {
      const a = ang(vMin + (vMax - vMin) * i / 10);
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4)); ctx.lineTo(cx + Math.cos(a) * (r - 14), cy + Math.sin(a) * (r - 14)); ctx.stroke();
    }
    if (left) text(ctx, left[0], cx - r * 0.72, cy + r + 24, FS.s, left[1], 500, 'center');
    if (right) text(ctx, right[0], cx + r * 0.72, cy + r + 24, FS.s, right[1], 500, 'center');
    const a = ang(v);
    ctx.strokeStyle = C.orange; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (r - 18), cy + Math.sin(a) * (r - 18)); ctx.stroke();
    circle(ctx, cx, cy, 8, C.black);
  }

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
    // --- height view: landscape 0..SX, ground at GY, 0..12 km
    const P0 = 1013.25, HMAX = 12000, GY = 556, TOPY = 30, SX = 404, BX = 92;
    let h = 100;
    const pAt = hh => P0 * Math.pow(1 - 2.25577e-5 * hh, 5.25588);   // standard atmosphere
    const yOfH = hh => GY - hh / HMAX * (GY - TOPY);
    const hOfY = y => clamp((GY - y) / (GY - TOPY) * HMAX, 0, HMAX);
    const air = [];   // air particles, denser near the ground
    while (air.length < 340) {
      const hh = rnd(0, HMAX);
      if (Math.random() < Math.pow(1 - 2.25577e-5 * hh, 4.25588)) air.push({ x: rnd(52, SX - 6), h: hh, ph: rnd(0, TAU) });
    }
    // mountains: left foot, peak x, right foot, height, colour, snow cap
    const MOUNTAINS = [
      { x0: 130, px: 190, x1: 250, h: 880, c: C.green, key: 'feldberg' },
      { x0: 200, px: 268, x1: 336, h: 2962, c: C.sand, key: 'zugspitze', snow: true },
      { x0: 266, px: 352, x1: 440, h: 8849, c: C.grey, key: 'everest', snow: true }
    ];

    // controls
    const rm = ui.row();
    seg(rm, [{ label: tx('modeParticles'), value: 'teilchen' }, { label: tx('modeHeight'), value: 'hoehe' }], mode, v => { mode = v; show(); }, tx('modeAria'));
    const rA = ui.row(), rA2 = ui.row();
    slider(rA, { label: tx('sliderN'), min: 30, max: 110, step: 1, value: n, info: tx('info.n'), format: v => tx('unitN', v), onInput: v => { n = v; } });
    slider(rA2, { label: tx('sliderT'), min: -20, max: 40, step: 1, value: T, info: tx('info.t'), format: v => fmt(v) + ' °C', onInput: v => { T = v; } });
    const rB = ui.row();
    const sH = slider(rB, { label: tx('sliderH'), min: 0, max: HMAX, step: 10, value: h, info: tx('info.h'), format: v => fmt(v) + ' m', onInput: v => { h = v; } });
    ui.readout();
    const hintEl = ui.hint('');
    function show() {
      const a = mode === 'teilchen';
      [rA, rA2].forEach(r => { r.hidden = !a; });
      rB.hidden = a;
      view.canvas.classList.toggle('drag', !a);
      hintEl.textContent = a ? tx('hintParticles') : tx('hintHeight');
    }
    show();
    dragOn(view, {
      down: p => { if (mode !== 'hoehe' || p.x > SX) return false; h = Math.round(hOfY(p.y) / 10) * 10; sH.set(h); },
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
      const p = P0 * (n / N0) * ((T + 273.15) / 288.15);
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = C.lavender; ctx.fillRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      for (const q of P) particle(ctx, q);
      ctx.strokeStyle = C.black; ctx.lineWidth = 4; ctx.strokeRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      ctx.fillStyle = flash > 0.5 ? C.black : C.orange; ctx.fillRect(box.x1 - 6, MEM[0], 14, MEM[1] - MEM[0]);
      ctx.fillStyle = C.white; ctx.fillRect(box.x1 - 120, MEM[0] - 64, 112, 54);
      text(ctx, tx('mem1'), box.x1 - 14, MEM[0] - 40, FS.s, C.black, 500, 'right');
      text(ctx, tx('mem2'), box.x1 - 14, MEM[0] - 17, FS.s, C.black, 500, 'right');
      dial(ctx, 498, 114, 84, p, 500, 1600, [tx('low'), LOW], [tx('high'), HIGH]);
      text(ctx, tx('approx', fmt(p)), 498, 268, 30, C.black, 500, 'center');
      tx('hits').forEach((l, i) => text(ctx, l, 498, 340 + i * 24, FS.s, C.black, 500, 'center'));
      text(ctx, fmt(rate), 498, 440, 44, C.black, 300, 'center');
      speedLegend(ctx, W / 2, 570);
      if (p > 1100) ui.done('high');
      return p;
    }

    let time = 0;
    function drawHeight(dt) {
      time += dt;
      const pa = pAt(h), frac = pa / P0, by = yOfH(h);
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
      // sky with air particles – denser near the ground
      ctx.fillStyle = C.ice; ctx.fillRect(0, 0, SX, GY);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, SX, GY); ctx.clip();
      for (const a of air) circle(ctx, a.x + Math.sin(time * 1.7 + a.ph) * 3, yOfH(a.h) + Math.cos(time * 1.3 + a.ph) * 3, 3.5, C.purple);
      // mountains (flat shapes) with name and height at the peak
      for (const m of MOUNTAINS) {
        const py = yOfH(m.h);
        ctx.fillStyle = m.c;
        ctx.beginPath(); ctx.moveTo(m.x0, GY); ctx.lineTo(m.px, py); ctx.lineTo(m.x1, GY); ctx.closePath(); ctx.fill();
        if (m.snow) {
          const f = 0.18;
          ctx.fillStyle = C.white;
          ctx.beginPath(); ctx.moveTo(m.px, py); ctx.lineTo(m.px + (m.x0 - m.px) * f, py + (GY - py) * f); ctx.lineTo(m.px + (m.x1 - m.px) * f, py + (GY - py) * f); ctx.closePath(); ctx.fill();
        }
      }
      // aeroplane at cruising height
      const ay = yOfH(11000), ax = 160;
      ctx.fillStyle = C.black;
      ctx.beginPath(); ctx.ellipse(ax, ay, 34, 6, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(ax - 4, ay); ctx.lineTo(ax - 18, ay + 16); ctx.lineTo(ax - 8, ay + 16); ctx.lineTo(ax + 8, ay); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(ax - 28, ay); ctx.lineTo(ax - 36, ay - 12); ctx.lineTo(ax - 30, ay - 12); ctx.lineTo(ax - 20, ay); ctx.closePath(); ctx.fill();
      ctx.restore();
      // labels of the landmarks
      for (const m of MOUNTAINS) {
        const py = yOfH(m.h);
        const lx = clamp(m.px, 60, SX - 60);
        text(ctx, tx('peaks.' + m.key)[0], lx, py - 30, FS.s, C.black, 500, 'center');
        text(ctx, tx('peaks.' + m.key)[1], lx, py - 8, FS.s, C.black, 500, 'center');
      }
      text(ctx, tx('peaks.plane')[0], ax + 44, ay - 4, FS.s, C.black, 500, 'left');
      text(ctx, tx('peaks.plane')[1], ax + 44, ay + 18, FS.s, C.black, 500, 'left');
      // height axis
      ctx.strokeStyle = C.black; ctx.lineWidth = 2;
      for (let k = 2; k <= 12; k += 2) {
        const y = yOfH(k * 1000);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(10, y); ctx.stroke();
        text(ctx, tx('km', k), 14, y + 7, FS.s, C.black, 500, 'left');
      }
      // ground with the town
      ctx.fillStyle = C.green; ctx.fillRect(0, GY, SX, 14);
      ctx.fillStyle = C.rust;
      for (const [x, w, hh] of [[20, 16, 20], [40, 20, 30], [64, 14, 16]]) ctx.fillRect(x, GY - hh, w, hh);
      text(ctx, tx('peaks.town'), 10, 592, FS.s, C.black, 500, 'left');
      ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.strokeRect(0, 0, SX, GY + 14);
      // balloon with its height line
      ctx.setLineDash([6, 6]); ctx.strokeStyle = C.black; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(BX + 26, by); ctx.lineTo(SX, by); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(BX, by - 2); ctx.lineTo(BX, by + 24); ctx.stroke();
      ctx.fillStyle = C.black; ctx.fillRect(BX - 8, by + 24, 16, 12);
      circle(ctx, BX, by - 24, 24, C.orange, C.black, 3);
      ctx.fillStyle = C.white; ctx.fillRect(BX + 30, by - 30, 104, 26);
      text(ctx, fmt(h) + ' m', BX + 36, by - 10, FS.s, C.black, 500, 'left');
      // right: barometer on the balloon
      const X0 = SX + 14, XM = (SX + W) / 2;
      text(ctx, tx('baro'), XM, 26, FS.s, C.black, 500, 'center');
      dial(ctx, XM, 112, 70, pa, 200, 1100);
      text(ctx, tx('hpa', fmt(pa)), XM, 222, 30, C.black, 500, 'center');
      // the whole air above the ground in 10 blocks: filled = still above the balloon
      tx('above').forEach((l, i) => text(ctx, l, X0, 258 + i * 22, FS.s, C.black));
      const bx0 = X0, bw = 54, bh = 15, base = 472;
      for (let i = 0; i < 10; i++) {
        const y = base - (i + 1) * (bh + 2);
        const fill = clamp(frac * 10 - (9 - i), 0, 1);   // the top blocks are the air above
        ctx.fillStyle = C.white; ctx.fillRect(bx0, y, bw, bh);
        if (fill > 0) { ctx.fillStyle = C.purple; ctx.fillRect(bx0, y + bh * (1 - fill), bw, bh * fill); }
        ctx.strokeStyle = C.black; ctx.lineWidth = 2; ctx.strokeRect(bx0, y, bw, bh);
      }
      text(ctx, fmt(frac * 100) + ' %', bx0 + bw + 12, base - 80, 34, C.black, 300, 'left');
      text(ctx, tx('ofAir'), bx0 + bw + 12, base - 54, FS.s, C.black, 500, 'left');
      // the station converts to sea level
      ctx.fillStyle = C.yellow; ctx.fillRect(X0 - 4, 484, W - X0 - 6, 110);
      tx('seaLevel').forEach((l, i) => text(ctx, l, X0 + 4, 508 + i * 24, FS.s, C.black));
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
          : tx('readHeight', fmt(h), fmt(p), fmt(pAt(h) / P0 * 100)));
      }
    }
    return { frame };
  };
})();
