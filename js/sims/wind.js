// WIND SPEED & GUSTS – cup anemometer, tree and the course over 10 minutes
(() => {
  'use strict';
  const { C, W, H, FS, TAU, clamp, rnd, fmt, text, circle, simShell, slider, button, seg, beaufort } = MG;
  const tx = MG.texts('wind');

  MG.sims.wind = (host, variant) => {
    const boeen = variant === 'boeen';
    const ui = simShell(host, { label: tx('aria') });
    const { view, ctx } = ui;
    const SIM_PER_S = 20, WIN = 600 / SIM_PER_S, MEAN_WIN = 120 / SIM_PER_S; // 10 min course, 2 min mean
    let mean = boeen ? 6 : 4, gusty = boeen ? 0.45 : 0.25, x = 0, gust = 0, rot = 0, now = 0, sampleT = 0;
    const S = [];
    const GROUND = 290;
    const streaks = Array.from({ length: 32 }, () => ({ x: rnd(0, W), y: rnd(20, GROUND - 20), l: rnd(20, 50) }));
    const r1 = ui.row();
    slider(r1, { label: tx('slider'), min: 0, max: 25, step: 0.5, value: mean, format: v => fmt(v, 1) + ' m/s', onInput: v => { mean = v; } });
    const r2 = ui.row();
    seg(r2, [{ label: tx('steady'), value: 0.1 }, { label: tx('restless'), value: 0.25 }, { label: tx('gusty'), value: 0.45 }], gusty, v => { gusty = v; }, tx('gustAria'));
    button(r2, tx('btnGust'), () => { gust = 1; }, boeen ? 'primary' : '');
    ui.readout();
    ui.hint(tx(boeen ? 'hint.boeen' : 'hint.mittel'));

    let readT = 0, cur = mean;
    function frame(dt) {
      if (!view.fit()) return;
      now += dt;
      // Ornstein-Uhlenbeck noise + gust pulse
      x += (-x / 0.5) * dt + gusty * Math.sqrt(2 / 0.5 * dt) * (Math.random() + Math.random() + Math.random() - 1.5) * 2;
      gust = Math.max(0, gust - dt / 1.4);
      const g = gust > 0 ? Math.sin(Math.PI * (1 - gust)) * (mean * 0.9 + 5) : 0;
      cur = Math.max(0, mean * (1 + x) + g);
      sampleT -= dt;
      if (sampleT <= 0) { sampleT = 0.05; S.push({ t: now, v: cur }); while (S.length && S[0].t < now - WIN) S.shift(); }
      const recent = S.filter(s => s.t >= now - MEAN_WIN);
      const avg = recent.reduce((a, s) => a + s.v, 0) / Math.max(1, recent.length);
      let mx = 0, mxS = null; for (const s of S) if (s.v > mx) { mx = s.v; mxS = s; }
      // scene
      ctx.fillStyle = C.ice; ctx.fillRect(0, 0, W, GROUND + 18);
      ctx.fillStyle = C.green; ctx.fillRect(0, GROUND, W, 18);
      ctx.strokeStyle = C.white; ctx.lineWidth = 3;
      const sp = 30 + cur * 28;
      for (const s of streaks) {
        s.x += sp * dt; if (s.x > W + 60) { s.x = -60; s.y = rnd(20, GROUND - 20); }
        const len = s.l * (0.3 + cur / 10);
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - len, s.y); ctx.stroke();
      }
      // cup anemometer (from above)
      rot += cur * 0.45 * dt * TAU / 3;
      const ax = 136, ay = 150;
      ctx.strokeStyle = C.black; ctx.lineWidth = 6;
      for (let i = 0; i < 3; i++) {
        const a = rot + i * TAU / 3, ex = ax + Math.cos(a) * 76, ey = ay + Math.sin(a) * 76;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(ex, ey, 22, a + Math.PI / 2, a + Math.PI * 1.5); ctx.closePath(); ctx.fill();
        ctx.lineWidth = 3; ctx.stroke(); ctx.lineWidth = 6;
      }
      circle(ctx, ax, ay, 11, C.black);
      text(ctx, tx('cups'), ax, 262, FS.s, C.black, 500, 'center');
      // the tree bends with the current value
      const bend = clamp(cur / 28, 0, 1) * 0.7;
      const tx0 = 470, ty = GROUND, th = 170;
      const topX = tx0 + Math.sin(bend) * th, topY = ty - Math.cos(bend) * th;
      ctx.strokeStyle = C.rust; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.moveTo(tx0, ty); ctx.quadraticCurveTo(tx0, ty - th * 0.6, topX, topY); ctx.stroke();
      ctx.fillStyle = C.greenStrong;
      ctx.beginPath(); ctx.ellipse(topX + bend * 26, topY + 8, 58 - bend * 12, 48, bend, 0, TAU); ctx.fill();
      // display
      ctx.fillStyle = C.black; ctx.fillRect(250, 12, 170, 76);
      text(ctx, tx('now'), 264, 40, FS.s, C.white);
      text(ctx, tx('ms', fmt(cur, 1)), 264, 78, 32, C.white, 300);
      // course
      const gx0 = 52, gx1 = 584, gy0 = 352, gy1 = 548;
      const vmax = Math.max(10, Math.ceil((mx + 2) / 5) * 5);
      const X = tt => gx1 - (now - tt) / WIN * (gx1 - gx0), Y = v => gy1 - v / vmax * (gy1 - gy0);
      ctx.fillStyle = C.white; ctx.fillRect(0, GROUND + 18, W, H - GROUND - 18);
      ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, GROUND + 18); ctx.lineTo(W, GROUND + 18); ctx.stroke();
      ctx.lineWidth = 1.5;
      for (let v = 0; v <= vmax; v += vmax > 20 ? 10 : 5) {
        ctx.strokeStyle = v === 0 ? C.black : C.grey; ctx.beginPath(); ctx.moveTo(gx0, Y(v)); ctx.lineTo(gx1, Y(v)); ctx.stroke();
        text(ctx, String(v), gx0 - 8, Y(v) + 7, FS.s, C.black, 500, 'right');
      }
      text(ctx, tx('unit'), gx0 - 8, gy0 - 14, FS.s, C.black, 500, 'right');
      text(ctx, tx('ago'), gx0, 584, FS.s, C.black, 500, 'left');
      text(ctx, tx('now'), gx1, 584, FS.s, C.black, 500, 'right');
      ctx.strokeStyle = C.black; ctx.lineWidth = 2; ctx.beginPath();
      S.forEach((s, i) => { const px = X(s.t), py = Y(s.v); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
      ctx.stroke();
      // mean line
      ctx.strokeStyle = C.orange; ctx.lineWidth = boeen ? 4 : 7;
      ctx.beginPath(); ctx.moveTo(X(now - MEAN_WIN), Y(avg)); ctx.lineTo(gx1, Y(avg)); ctx.stroke();
      text(ctx, tx('mean'), X(now - MEAN_WIN) - 8, Y(avg) + 7, FS.s, C.black, 500, 'right');
      if (mxS && mx > avg * 1.15) {
        circle(ctx, X(mxS.t), Y(mx), boeen ? 9 : 6, C.red, C.black, 2);
        text(ctx, tx('gust', fmt(mx, 1)), clamp(X(mxS.t), gx0 + 50, gx1 - 50), Y(mx) - 14, FS.s, C.black, 500, 'center');
      }
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        const kmh = v => fmt(v * 3.6);
        ui.setRead(boeen
          ? tx('readGusts', fmt(mx, 1), kmh(mx), beaufort(mx), fmt(avg, 1), kmh(avg))
          : tx('readMean', fmt(avg, 1), kmh(avg), beaufort(avg), fmt(cur, 1)));
      }
    }
    return { frame };
  };
})();
