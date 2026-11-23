// WIND – direction, speed and gusts: wind vane and cup anemometer seen from
// above, the course over 10 minutes below (on phones the drawing is 25 % taller)
(() => {
  'use strict';
  const { C, W, H, FS, TAU, clamp, rnd, fmt, text, arrow, circle, simShell, slider, button, dragOn, beaufort } = MG;
  const tx = MG.texts('wind');
  const dirIdx = deg => Math.round((((deg % 360) + 360) % 360) / 22.5) % 16;

  MG.sims.wind = host => {
    const ui = simShell(host, { label: tx('aria'), drag: true, mobileH: 750 });
    const { view, ctx } = ui;
    const DIR16 = tx('dir16'), DIR16L = tx('dir16Long');
    const SIM_PER_S = 20, WIN = 600 / SIM_PER_S, MEAN_WIN = 120 / SIM_PER_S; // 10 min course, 2 min mean
    let TOP = 318;                           // scene above, course below (scaled with the height of the drawing)
    const KX = 150, KR = 100;                // compass
    const AX = 450;                          // cup anemometer
    let KY = 158, AY = 158;
    let from = 248, vane = 200, omega = 0;
    let meanS = 4, curS = 4;   // smoothed wind: number and length of the arrows (no flicker)
    let mean = 4, gusty = 0.25, x = 0, gust = 0, rot = 0, now = 0, sampleT = 0, cur = mean;
    let dn = 0, dir = from;   // the direction also wobbles: about as many degrees as the turbulence in % × 0.57
    const S = [];
    const streaks = Array.from({ length: 34 }, () => ({ x: rnd(0, W), y: rnd(0, TOP), l: rnd(0.8, 1.2) }));
    const r1 = ui.row();
    slider(r1, { label: tx('slider'), min: 0, max: 25, step: 0.5, value: mean, info: tx('infoMean'), format: v => fmt(v, 1) + ' m/s', onInput: v => { mean = v; } });
    const r2 = ui.row();
    slider(r2, { label: tx('sliderTurb'), min: 0, max: 50, step: 1, value: Math.round(gusty * 100), info: tx('infoTurb'), format: v => v + ' %', onInput: v => { gusty = v / 100; } });
    const r3 = ui.row();
    button(r3, tx('btnGust'), () => { gust = 1; }, 'primary');
    ui.readout();
    ui.hint(tx('hint'));
    const setFrom = p => { from = (Math.atan2(p.x - KX, -(p.y - KY)) * 180 / Math.PI + 360) % 360; };
    dragOn(view, { down: p => { if (Math.hypot(p.x - KX, p.y - KY) > KR + 40) return false; setFrom(p); }, move: setFrom });

    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      const HH = view.H, k = HH / 600;
      TOP = 318 * k; KY = AY = 158 * k;
      now += dt;
      // speed: Ornstein-Uhlenbeck noise + gust pulse
      x += (-x / 0.5) * dt + gusty * Math.sqrt(2 / 0.5 * dt) * (Math.random() + Math.random() + Math.random() - 1.5) * 2;
      gust = Math.max(0, gust - dt / 1.4);
      const g = gust > 0 ? Math.sin(Math.PI * (1 - gust)) * (mean * 0.9 + 5) : 0;
      cur = Math.max(0, mean * (1 + x) + g);
      // direction: its own Ornstein-Uhlenbeck noise, spread σ ≈ turbulence intensity in radians
      dn += (-dn / 1.2) * dt + gusty * 57 * Math.sqrt(2 / 1.2 * dt) * (Math.random() + Math.random() + Math.random() - 1.5) * 2;
      dir = (from + dn + 360) % 360;
      sampleT -= dt;
      if (sampleT <= 0) { sampleT = 0.05; S.push({ t: now, v: cur, d: dir }); while (S.length && S[0].t < now - WIN) S.shift(); }
      const recent = S.filter(s => s.t >= now - MEAN_WIN);
      const avg = recent.reduce((a, s) => a + s.v, 0) / Math.max(1, recent.length);
      let mx = 0, mxS = null; for (const s of S) if (s.v > mx) { mx = s.v; mxS = s; }
      // vane: damped turn into the wind (stands still without wind)
      const diff = ((dir - vane + 540) % 360) - 180;
      omega += (diff * 9 * clamp(cur / 2, 0, 1) - omega * 3.2) * dt;
      vane = (vane + omega * dt + 360) % 360;
      const to = (dir + 180) * Math.PI / 180, fx = Math.sin(to), fy = -Math.cos(to);
      // scene: air streaming in the wind direction, faster with stronger wind
      ctx.fillStyle = C.yellowPale; ctx.fillRect(0, 0, W, TOP);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, TOP); ctx.clip();
      meanS += (mean - meanS) * Math.min(1, dt * 2);
      curS += (cur - curS) * Math.min(1, dt * 4);
      const sp = 30 + cur * 30, nS = Math.round(clamp(0.4 + meanS / 12, 0, 1) * streaks.length);
      streaks.forEach((p, i) => {
        p.x += fx * sp * dt; p.y += fy * sp * dt;
        if (p.x < -40) p.x += W + 80; if (p.x > W + 40) p.x -= W + 80;
        if (p.y < -40) p.y += TOP + 80; if (p.y > TOP + 40) p.y -= TOP + 80;
        if (i >= nS) return;
        const len = p.l * (24 + curS * 3);   // wind arrows: longer with stronger wind
        arrow(ctx, p.x - fx * len, p.y - fy * len, fx * len, fy * len, C.purple2, 4, 13);
      });
      ctx.restore();
      // compass with vane
      circle(ctx, KX, KY, KR, C.white, C.black, 3);
      ctx.strokeStyle = C.black;
      for (let i = 0; i < 16; i++) {
        const a = i * 22.5 * Math.PI / 180, big = i % 4 === 0;
        ctx.lineWidth = big ? 3 : 1.5;
        const r0 = KR - (big ? 16 : i % 2 === 0 ? 11 : 7);
        ctx.beginPath(); ctx.moveTo(KX + Math.sin(a) * r0, KY - Math.cos(a) * r0); ctx.lineTo(KX + Math.sin(a) * KR, KY - Math.cos(a) * KR); ctx.stroke();
        if (big) text(ctx, DIR16[i], KX + Math.sin(a) * (KR + 20), KY - Math.cos(a) * (KR + 20), FS.m, C.black, 500, 'center', 'middle');
      }
      const fa = from * Math.PI / 180;
      circle(ctx, KX + Math.sin(fa) * (KR - 26), KY - Math.cos(fa) * (KR - 26), 11, C.orange, C.black, 2);
      ctx.save(); ctx.translate(KX, KY); ctx.rotate(vane * Math.PI / 180);
      ctx.fillStyle = C.black; ctx.fillRect(-3, -54, 6, 110);
      ctx.beginPath(); ctx.moveTo(0, -76); ctx.lineTo(-12, -50); ctx.lineTo(12, -50); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.orange; ctx.strokeStyle = C.black; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(0, 28); ctx.lineTo(-22, 74); ctx.lineTo(22, 74); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      circle(ctx, KX, KY, 7, C.white, C.black, 2.5);
      text(ctx, tx('vane'), KX, TOP - 8, FS.s, C.black, 500, 'center');
      // cup anemometer seen from above: three half-spherical cups on arms. Each cup
      // shows its round back in the direction of travel; the open side trails, so
      // the cup whose opening faces into the wind is pushed – it turns anticlockwise
      // whatever the direction of the wind.
      rot -= cur * 0.45 * dt * TAU / 3;
      for (let i = 0; i < 3; i++) {
        const a = rot + i * TAU / 3, ca = Math.cos(a), sa = Math.sin(a);
        const ex = AX + ca * 74, ey = AY + sa * 74, rc = 26;
        ctx.strokeStyle = C.black; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(AX, AY); ctx.lineTo(AX + ca * 50, AY + sa * 50); ctx.stroke();
        // the cup: half circle (back) and its open rim along the arm
        ctx.fillStyle = C.orange; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(ex, ey, rc, a - Math.PI, a); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.cream;
        ctx.beginPath(); ctx.ellipse(ex, ey, rc, 6, a, 0, TAU); ctx.fill();
        ctx.lineWidth = 3.5; ctx.stroke();
      }
      circle(ctx, AX, AY, 13, C.grey, C.black, 3);
      circle(ctx, AX, AY, 4, C.black);
      text(ctx, tx('cups'), AX, TOP - 8, FS.s, C.black, 500, 'center');
      // course over 10 minutes: speed above, direction below
      const gx0 = 52, gx1 = 510, gy0 = 346 * k, gy1 = 428 * k, dy0 = 458 * k, dy1 = 562 * k;
      const vmax = Math.max(10, Math.ceil((mx + 2) / 5) * 5);
      const X = tt => gx1 - (now - tt) / WIN * (gx1 - gx0), Y = v => gy1 - v / vmax * (gy1 - gy0);
      const YD = d => dy1 - d / 360 * (dy1 - dy0);
      ctx.fillStyle = C.white; ctx.fillRect(0, TOP, W, HH - TOP);
      ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, TOP); ctx.lineTo(W, TOP); ctx.stroke();
      ctx.lineWidth = 1.5;
      for (let v = 0; v <= vmax; v += vmax > 20 ? 10 : 5) {
        ctx.strokeStyle = v === 0 ? C.black : C.grey; ctx.beginPath(); ctx.moveTo(gx0, Y(v)); ctx.lineTo(gx1, Y(v)); ctx.stroke();
        text(ctx, String(v), gx0 - 8, Y(v) + 7, FS.s, C.black, 500, 'right');
      }
      text(ctx, tx('unit'), gx0 + 6, gy0 - 4, FS.s, C.black, 500, 'left');
      ctx.strokeStyle = C.black; ctx.lineWidth = 2; ctx.beginPath();
      S.forEach((s, i) => { const px = X(s.t), py = Y(s.v); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
      ctx.stroke();
      // mean over the last 2 minutes, labelled at the right edge
      ctx.strokeStyle = C.orange; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(X(now - MEAN_WIN), Y(avg)); ctx.lineTo(gx1, Y(avg)); ctx.stroke();
      text(ctx, tx('mean'), gx1 + 8, Y(avg) + 7, FS.s, C.orange, 500, 'left');
      if (mxS && mx > avg * 1.15) {
        circle(ctx, X(mxS.t), Y(mx), 8, C.red, C.black, 2);
        text(ctx, tx('gust', fmt(mx, 1)), clamp(X(mxS.t), gx0 + 50, gx1 - 40), Y(mx) - 14, FS.s, C.black, 500, 'center');
      }
      // direction: 0° … 360° (N, O, S, W, N)
      ctx.lineWidth = 1.5;
      [0, 90, 180, 270, 360].forEach((d, i) => {
        ctx.strokeStyle = i % 4 === 0 ? C.black : C.grey; ctx.beginPath(); ctx.moveTo(gx0, YD(d)); ctx.lineTo(gx1, YD(d)); ctx.stroke();
        if (d < 360) text(ctx, DIR16[d / 22.5], gx0 - 8, YD(d) + 7, FS.s, C.black, 500, 'right');
      });
      text(ctx, tx('dirAxis'), gx0 + 6, dy0 - 6, FS.s, C.black, 500, 'left');
      ctx.fillStyle = C.purple2;
      for (let i = 0; i < S.length; i += 2) ctx.fillRect(X(S[i].t) - 1.5, YD(S[i].d) - 1.5, 3, 3);
      [0, 90, 180, 270, 360].forEach(d => text(ctx, d + '°', gx1 + 8, YD(d) + 7, FS.s, C.black, 500, 'left'));   // right axis in degrees
      text(ctx, tx('ago'), gx0, HH - 8, FS.s, C.black, 500, 'left');
      text(ctx, tx('now'), gx1, HH - 8, FS.s, C.black, 500, 'right');
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        const kmh = v => fmt(v * 3.6);
        ui.setRead(tx('read', DIR16L[dirIdx(from)], Math.round(from), fmt(avg, 1), kmh(avg), beaufort(avg), fmt(mx, 1), kmh(mx)));
      }
    }
    return { frame };
  };
})();
