// PRECIPITATION – tipping-bucket rain gauge and one square metre
(() => {
  'use strict';
  const { C, W, H, FS, clamp, rnd, lerp, fmt, text, circle, simShell, slider, button } = MG;
  const tx = MG.texts('regen');

  MG.sims.regen = host => {
    const ui = simShell(host, { label: tx('aria') });
    const { view, ctx } = ui;
    const STEP = 0.254, SPEED = 2;            // 1 second = 2 minutes
    let rate = 4, minutes = 0, tips = 0, fill = 0, tilt = 1, anim = 0;
    const drops = [], spill = [];
    const PIV = { x: 180, y: 360 }, A = 0.32, ARM = 72;
    const FUN = { x0: 70, x1: 290, y: 130, neck: 230 };   // funnel
    const r1 = ui.row();
    const s = slider(r1, { label: tx('slider'), min: 0, max: 30, step: 0.5, value: rate, format: v => fmt(v, 1) + ' mm/h', onInput: v => { rate = v; } });
    const r2 = ui.row();
    button(r2, tx('btnDrizzle'), () => { rate = 0.5; s.set(rate); });
    button(r2, tx('btnRain'), () => { rate = 4; s.set(rate); });
    button(r2, tx('btnHeavy'), () => { rate = 25; s.set(rate); });
    button(r2, tx('btnReset'), () => { minutes = 0; tips = 0; fill = 0; });
    ui.readout();
    ui.hint(tx('hint'));

    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      minutes += dt * SPEED;
      const mm = rate / 60 * SPEED * dt;
      if (anim > 0) anim = Math.max(0, anim - dt / 0.25);
      else {
        fill += mm / STEP;
        if (fill >= 1) {
          fill -= 1; tips++; tilt = -tilt; anim = 1;
          for (let i = 0; i < 6; i++) spill.push({ x: PIV.x - tilt * ARM + rnd(-6, 6), y: PIV.y + 16, vy: rnd(40, 120) });
        }
      }
      // rain drops
      const spawn = rate * 2.2 * dt;
      for (let i = 0; i < Math.floor(spawn) + (Math.random() < spawn % 1 ? 1 : 0); i++) drops.push({ x: rnd(10, 340), y: rnd(-40, 0) });
      ctx.fillStyle = C.lavender; ctx.fillRect(0, 0, 360, H);
      ctx.fillStyle = C.white; ctx.fillRect(360, 0, 240, H);
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 3;
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]; d.y += 480 * dt;
        const caught = d.y > FUN.y && d.x > FUN.x0 + 2 && d.x < FUN.x1 - 2;
        if (caught || d.y > H) { drops.splice(i, 1); continue; }
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 2, d.y - 14); ctx.stroke();
      }
      // funnel
      const mid = (FUN.x0 + FUN.x1) / 2;
      ctx.fillStyle = C.white; ctx.strokeStyle = C.black; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(FUN.x0, FUN.y); ctx.lineTo(FUN.x1, FUN.y); ctx.lineTo(mid + 12, FUN.neck); ctx.lineTo(mid + 12, FUN.neck + 26); ctx.lineTo(mid - 12, FUN.neck + 26); ctx.lineTo(mid - 12, FUN.neck); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.white; ctx.fillRect(mid - 64, FUN.y - 38, 128, 30);
      text(ctx, tx('funnel'), mid, FUN.y - 15, FS.s, C.black, 500, 'center');
      if (rate > 0) { ctx.strokeStyle = C.cyan; ctx.lineWidth = 4; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -minutes * 20; ctx.beginPath(); ctx.moveTo(mid, FUN.neck + 26); ctx.lineTo(mid, PIV.y - 30); ctx.stroke(); ctx.setLineDash([]); }
      // tipping bucket
      const ang = (anim > 0 ? lerp(tilt * A, -tilt * A, anim) : tilt * A);
      ctx.save(); ctx.translate(PIV.x, PIV.y); ctx.rotate(ang);
      const upSide = -tilt; // −1: left bucket up, +1: right bucket up
      if (anim === 0) {
        ctx.fillStyle = C.cyan;
        const hgt = 26 * clamp(fill, 0, 1);
        if (upSide < 0) ctx.fillRect(-ARM + 6, -hgt, ARM - 9, hgt); else ctx.fillRect(3, -hgt, ARM - 9, hgt);
      }
      ctx.strokeStyle = C.black; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-ARM - 8, -30); ctx.lineTo(-ARM, 0); ctx.lineTo(ARM, 0); ctx.lineTo(ARM + 8, -30); ctx.moveTo(0, 0); ctx.lineTo(0, -38); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = C.black; ctx.beginPath(); ctx.moveTo(PIV.x, PIV.y); ctx.lineTo(PIV.x - 14, PIV.y + 34); ctx.lineTo(PIV.x + 14, PIV.y + 34); ctx.closePath(); ctx.fill();
      text(ctx, tx('seesaw'), PIV.x, PIV.y + 64, FS.s, C.black, 500, 'center');
      for (let i = spill.length - 1; i >= 0; i--) {
        const d = spill[i]; d.vy += 600 * dt; d.y += d.vy * dt;
        if (d.y > H) { spill.splice(i, 1); continue; }
        circle(ctx, d.x, d.y, 4, C.cyan);
      }
      ctx.fillStyle = C.black; ctx.fillRect(12, 12, 150, 76);
      text(ctx, tx('tipped'), 26, 40, FS.s, C.white);
      text(ctx, tx('times', tips), 26, 78, 32, C.white, 300);
      // 1 m²
      const total = tips * STEP, hmax = Math.max(5, Math.ceil((total + 0.01) / 5) * 5), px = 340 / hmax;
      const bx0 = 430, bx1 = 530, by = 520;
      ctx.fillStyle = C.cyan2; ctx.fillRect(bx0, by - total * px, bx1 - bx0, total * px);
      ctx.strokeStyle = C.black; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(bx0, by - 356); ctx.lineTo(bx0, by); ctx.lineTo(bx1, by); ctx.lineTo(bx1, by - 356); ctx.stroke();
      ctx.lineWidth = 2;
      for (let v = 0; v <= hmax; v += hmax / 5) {
        const y = by - v * px;
        ctx.beginPath(); ctx.moveTo(bx0 - 8, y); ctx.lineTo(bx0, y); ctx.stroke();
        text(ctx, fmt(v), bx0 - 12, y + 7, FS.s, C.black, 500, 'right');
        text(ctx, fmt(v), bx1 + 10, y + 7, FS.s, C.black, 500, 'left');
      }
      text(ctx, tx('mm'), bx0 - 12, by - 368, FS.s, C.black, 500, 'right');
      text(ctx, tx('litre'), bx1 + 10, by - 368, FS.s, C.black, 500, 'left');
      text(ctx, tx('floor'), (bx0 + bx1) / 2, by + 34, FS.s, C.black, 500, 'center');
      text(ctx, tx('total', fmt(total, 2)), 480, 54, FS.xl, C.black, 300, 'center');
      text(ctx, tx('perM2', fmt(total, 2)), 480, 84, FS.s, C.black, 500, 'center');
      if (total >= 1) ui.done('mm');
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        const hh = Math.floor(minutes / 60), m = Math.floor(minutes % 60);
        ui.setRead(tx('read', hh, String(m).padStart(2, '0'), tips, fmt(total, 2)));
      }
    }
    return { frame };
  };
})();
