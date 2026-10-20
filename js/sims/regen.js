// PRECIPITATION – how much rain is a certain intensity (mm/h)? Rain falls in
// real time on one square metre; optionally the tipping-bucket gauge of the
// station is shown.
(() => {
  'use strict';
  const { C, W, H, FS, clamp, rnd, lerp, fmt, text, circle, simShell, slider, button, toggle } = MG;
  const tx = MG.texts('regen');

  // a falling rain drop: round at the bottom, pointed at the top
  function drop(ctx, x, y, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - 2.4 * s);
    ctx.bezierCurveTo(x + 0.35 * s, y - 1.4 * s, x + s, y - 0.6 * s, x + s, y);
    ctx.arc(x, y, s, 0, Math.PI);
    ctx.bezierCurveTo(x - s, y - 0.6 * s, x - 0.35 * s, y - 1.4 * s, x, y - 2.4 * s);
    ctx.fill();
  }

  // slider position 0…1000 → rain rate 0 … 300 mm/h (fine steps for light rain)
  const RMAX = 300;
  const rateOf = u => u <= 0 ? 0 : 0.1 * Math.pow(RMAX / 0.1, u / 1000);
  const posOf = r => r <= 0 ? 0 : 1000 * Math.log(r / 0.1) / Math.log(RMAX / 0.1);
  const fmtRate = r => fmt(r, r < 10 ? 1 : 0);

  MG.sims.regen = host => {
    const ui = simShell(host, { label: tx('aria') });
    const { view, ctx } = ui;
    const STEP = 0.254;                       // mm per tip of the seesaw
    const SX = 372, GROUND = 548;             // scene on the left
    let rate = 4, seconds = 0, total = 0, tips = 0, fill = 0, tilt = 1, anim = 0;
    let gauge = false, fast = false;
    const drops = [], splash = [], spill = [];
    const PIV = { x: 186, y: 420 }, A = 0.32, ARM = 66;
    const FUN = { x0: 86, x1: 286, y: 220, neck: 310 };   // funnel
    const r1 = ui.row();
    slider(r1, { label: tx('slider'), min: 0, max: 1000, step: 1, value: Math.round(posOf(rate)), info: tx('info'), format: v => tx('rate', fmtRate(rateOf(v))), onInput: v => { rate = rateOf(v); } });
    const r2 = ui.row();
    toggle(r2, tx('btnGauge'), gauge, v => { gauge = v; });
    toggle(r2, tx('btnFast'), fast, v => { fast = v; });
    button(r2, tx('btnReset'), () => { seconds = 0; total = 0; tips = 0; fill = 0; });
    ui.readout();
    ui.hint(tx('hint'));

    // intensity classes (DWD): name for the current rate
    function category(r) {
      const c = tx('classes');
      if (r <= 0) return c[0];
      if (r < 0.5) return c[1];
      if (r < 2.5) return c[2];
      if (r < 10) return c[3];
      if (r < 15) return c[4];
      if (r < 25) return c[5];
      if (r < 40) return c[6];
      if (r < 150) return c[7];
      return c[8];
    }

    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      const sim = dt * (fast ? 60 : 1);            // simulated seconds
      seconds += sim;
      const mm = rate / 3600 * sim;
      total += mm;
      // tipping bucket of the station
      if (anim > 0) anim = Math.max(0, anim - dt / 0.25);
      fill += mm / STEP;
      if (fill >= 1 && anim === 0) {
        fill -= 1; tips++; tilt = -tilt; anim = 1;
        if (gauge) for (let i = 0; i < 6; i++) spill.push({ x: PIV.x - tilt * ARM + rnd(-6, 6), y: PIV.y + 16, vy: rnd(40, 120) });
      }
      // rain: more and bigger drops with stronger rain
      const k = clamp(Math.log10(1 + rate) / Math.log10(1 + RMAX), 0, 1);
      const size = 2.6 + 4.4 * k, speed = 300 + 420 * k;
      const spawn = rate > 0 ? (4 + 150 * k * k) * dt : 0;
      for (let i = 0; i < Math.floor(spawn) + (Math.random() < spawn % 1 ? 1 : 0); i++) drops.push({ x: rnd(8, SX - 8), y: rnd(-30, 0), s: size * rnd(0.8, 1.15) });
      ctx.fillStyle = rate >= 25 ? C.bluePale : C.ice; ctx.fillRect(0, 0, SX, GROUND);
      ctx.fillStyle = C.grey; ctx.fillRect(0, GROUND, SX, H - GROUND);
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]; d.y += speed * dt;
        const caught = gauge && d.y > FUN.y && d.x > FUN.x0 + 2 && d.x < FUN.x1 - 2;
        if (caught || d.y > GROUND) {
          if (!caught) splash.push({ x: d.x, s: d.s, t: 0 });
          drops.splice(i, 1); continue;
        }
        drop(ctx, d.x, d.y, d.s, C.blue2);
      }
      ctx.strokeStyle = C.blue2; ctx.lineWidth = 2;
      for (let i = splash.length - 1; i >= 0; i--) {
        const s = splash[i]; s.t += dt;
        if (s.t > 0.25) { splash.splice(i, 1); continue; }
        const r = s.s * (1 + s.t * 10);
        ctx.beginPath(); ctx.arc(s.x, GROUND, r, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      }
      if (gauge) {
        // funnel and seesaw of the station
        const mid = (FUN.x0 + FUN.x1) / 2;
        ctx.fillStyle = C.white; ctx.strokeStyle = C.black; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(FUN.x0, FUN.y); ctx.lineTo(FUN.x1, FUN.y); ctx.lineTo(mid + 12, FUN.neck); ctx.lineTo(mid + 12, FUN.neck + 24); ctx.lineTo(mid - 12, FUN.neck + 24); ctx.lineTo(mid - 12, FUN.neck); ctx.closePath(); ctx.fill(); ctx.stroke();
        text(ctx, tx('funnel'), mid, FUN.y + 30, FS.s, C.black, 500, 'center');
        if (rate > 0) { ctx.strokeStyle = C.blue2; ctx.lineWidth = 4; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -seconds * 20; ctx.beginPath(); ctx.moveTo(mid, FUN.neck + 24); ctx.lineTo(mid, PIV.y - 28); ctx.stroke(); ctx.setLineDash([]); }
        const ang = anim > 0 ? lerp(tilt * A, -tilt * A, anim) : tilt * A;
        ctx.save(); ctx.translate(PIV.x, PIV.y); ctx.rotate(ang);
        if (anim === 0) {
          ctx.fillStyle = C.blue2;
          const hgt = 24 * clamp(fill, 0, 1);
          if (tilt > 0) ctx.fillRect(-ARM + 6, -hgt, ARM - 9, hgt); else ctx.fillRect(3, -hgt, ARM - 9, hgt);
        }
        ctx.strokeStyle = C.black; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(-ARM - 8, -28); ctx.lineTo(-ARM, 0); ctx.lineTo(ARM, 0); ctx.lineTo(ARM + 8, -28); ctx.moveTo(0, 0); ctx.lineTo(0, -36); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = C.black; ctx.beginPath(); ctx.moveTo(PIV.x, PIV.y); ctx.lineTo(PIV.x - 14, PIV.y + 32); ctx.lineTo(PIV.x + 14, PIV.y + 32); ctx.closePath(); ctx.fill();
        text(ctx, tx('seesaw'), PIV.x, PIV.y + 58, FS.s, C.black, 500, 'center');
        for (let i = spill.length - 1; i >= 0; i--) {
          const d = spill[i]; d.vy += 600 * dt; d.y += d.vy * dt;
          if (d.y > GROUND) { spill.splice(i, 1); continue; }
          circle(ctx, d.x, d.y, 4, C.blue2);
        }
        ctx.fillStyle = C.black; ctx.fillRect(SX - 136, 128, 124, 64);
        text(ctx, tx('tipped'), SX - 124, 152, FS.s, C.white);
        text(ctx, tx('times', tips), SX - 124, 184, 28, C.white, 300);
      }
      // how strong is the rain?
      ctx.fillStyle = C.black; ctx.fillRect(12, 12, SX - 24, 92);
      text(ctx, category(rate).toUpperCase(), 26, 46, FS.m, C.white);
      text(ctx, tx('rate', fmtRate(rate)), 26, 88, 34, C.white, 300);
      // right: one square metre, filled in real time
      const X0 = SX + 12;
      ctx.fillStyle = C.white; ctx.fillRect(SX, 0, W - SX, H);
      ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(SX, 0); ctx.lineTo(SX, H); ctx.stroke();
      text(ctx, tx('clockLabel'), X0, 30, FS.s, C.black);
      const hh = Math.floor(seconds / 3600), mi = Math.floor(seconds / 60) % 60, se = Math.floor(seconds) % 60;
      text(ctx, hh + ':' + String(mi).padStart(2, '0') + ':' + String(se).padStart(2, '0'), X0, 66, 32, C.black, 300);
      if (fast) text(ctx, tx('fastNote'), X0, 92, FS.s, C.red);
      // logarithmic scale 0,01 … 300 mm: every step is ten times as much water
      const LMIN = -2, LMAX = Math.log10(300), top = 150, by = 492;
      const yOf = v => by - (clamp(Math.log10(Math.max(v, 1e-9)), LMIN, LMAX) - LMIN) / (LMAX - LMIN) * (by - top);
      const tx0 = X0 + 66, tx1 = W - 52;
      if (total > 0) { const y = yOf(total); ctx.fillStyle = C.blue2; ctx.fillRect(tx0, y, tx1 - tx0, by - y); }
      ctx.strokeStyle = C.black; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(tx0, top - 10); ctx.lineTo(tx0, by); ctx.lineTo(tx1, by); ctx.lineTo(tx1, top - 10); ctx.stroke();
      ctx.lineWidth = 2;
      for (const v of [0.01, 0.1, 1, 10, 100]) {
        const y = yOf(v);
        ctx.beginPath(); ctx.moveTo(tx0 - 8, y); ctx.lineTo(tx0, y); ctx.stroke();
        text(ctx, fmt(v, v < 1 ? (v < 0.1 ? 2 : 1) : 0), tx0 - 12, y + 7, FS.s, C.black, 500, 'right');
      }
      ctx.lineWidth = 1;
      for (let e = -2; e < 3; e++) for (let m = 2; m <= 9; m++) {   // small ticks in between
        const v = m * Math.pow(10, e); if (v > 300) break;
        const y = yOf(v); ctx.beginPath(); ctx.moveTo(tx0 - 4, y); ctx.lineTo(tx0, y); ctx.stroke();
      }
      text(ctx, tx('mmLog'), X0, top - 22, FS.s, C.black, 500, 'left');
      if (rate > 0) {
        const y = yOf(rate);
        ctx.setLineDash([7, 6]); ctx.strokeStyle = C.red; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(tx0, y); ctx.lineTo(tx1 + 6, y); ctx.stroke(); ctx.setLineDash([]);
        text(ctx, tx('afterHour')[0], tx1 + 2, y - 26, FS.s, C.red, 500, 'right');
        text(ctx, tx('afterHour')[1], tx1 + 2, y - 6, FS.s, C.red, 500, 'right');
      }
      text(ctx, tx('floor'), (tx0 + tx1) / 2, by + 28, FS.s, C.black, 500, 'center');
      text(ctx, tx('total', fmt(total, total < 10 ? 2 : 1)), X0, 566, 32, C.black, 300);
      text(ctx, tx('perM2', fmt(total, total < 10 ? 2 : 1)), X0, 592, FS.s, C.black);
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        const rr = rate < 10 ? Math.round(rate * 10) / 10 : Math.round(rate);   // the rate as shown
        ui.setRead(rate > 0 ? tx('read', fmtRate(rr), fmt(rr * 100), fmt(rr * 100 / 150, 1)) : tx('readDry'));
      }
    }
    return { frame };
  };
})();
