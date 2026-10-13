// WIND DIRECTION – wind vane and compass
(() => {
  'use strict';
  const { C, W, H, FS, TAU, rnd, text, circle, simShell, button, toggle, dragOn } = MG;
  const tx = MG.texts('windrichtung');
  const dirIdx = deg => Math.round((((deg % 360) + 360) % 360) / 22.5) % 16;

  MG.sims.windrichtung = host => {
    const ui = simShell(host, { label: tx('aria'), drag: true });
    const { view, ctx } = ui;
    const DIR16 = tx('dir16'), DIR16L = tx('dir16Long');
    const cx = 300, cy = 316, RR = 178;
    let from = 248, vane = 200, omega = 0, offset = 0;
    const parts = Array.from({ length: 80 }, () => ({ x: rnd(0, W), y: rnd(0, H), l: rnd(14, 34) }));
    const r = ui.row();
    tx('presets').forEach((lbl, i) => button(r, lbl, () => { from = i * 90; }));
    const r2 = ui.row();
    toggle(r2, tx('btnOffset'), false, v => { offset = v ? 30 : 0; });
    ui.readout();
    ui.hint(tx('hint'));
    const setFrom = p => { from = (Math.atan2(p.x - cx, -(p.y - cy)) * 180 / Math.PI + 360) % 360; };
    dragOn(view, { down: p => setFrom(p), move: setFrom });

    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      // vane: damped turn into the wind
      const diff = ((from - vane + 540) % 360) - 180;
      omega += (diff * 9 - omega * 3.2) * dt;
      vane = (vane + omega * dt + 360) % 360;
      const to = (from + 180) * Math.PI / 180;
      const fx = Math.sin(to), fy = -Math.cos(to);
      if (dirIdx(from) === 12) ui.done('west');
      if (offset) ui.done('offset');
      ctx.fillStyle = C.yellowPale; ctx.fillRect(0, 0, W, H);
      circle(ctx, cx, cy, RR, C.white, C.black, 4);
      // air streaming
      ctx.strokeStyle = C.cyan2; ctx.lineWidth = 3;
      for (const p of parts) {
        p.x += fx * 150 * dt; p.y += fy * 150 * dt;
        if (p.x < -40) p.x += W + 80; if (p.x > W + 40) p.x -= W + 80;
        if (p.y < -40) p.y += H + 80; if (p.y > H + 40) p.y -= H + 80;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - fx * p.l, p.y - fy * p.l); ctx.stroke();
      }
      // scale
      ctx.strokeStyle = C.black;
      for (let i = 0; i < 16; i++) {
        const a = i * 22.5 * Math.PI / 180, big = i % 4 === 0, mid = i % 2 === 0;
        ctx.lineWidth = big ? 4 : 2;
        const r0 = RR - (big ? 24 : mid ? 16 : 10);
        ctx.beginPath(); ctx.moveTo(cx + Math.sin(a) * r0, cy - Math.cos(a) * r0); ctx.lineTo(cx + Math.sin(a) * RR, cy - Math.cos(a) * RR); ctx.stroke();
        const rl = RR + (big ? 26 : 24);
        text(ctx, DIR16[i], cx + Math.sin(a) * rl, cy - Math.cos(a) * rl, big ? 28 : FS.s, C.black, 500, 'center', 'middle');
      }
      for (let d = 0; d < 360; d += 90) {
        const a = d * Math.PI / 180;
        text(ctx, d + '°', cx + Math.sin(a) * (RR - 46), cy - Math.cos(a) * (RR - 46), FS.s, C.black, 500, 'center', 'middle');
      }
      // where the wind comes from
      const fa = from * Math.PI / 180;
      ctx.fillStyle = C.orange;
      ctx.beginPath(); ctx.arc(cx + Math.sin(fa) * (RR - 34), cy - Math.cos(fa) * (RR - 34), 13, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.black; ctx.lineWidth = 2; ctx.stroke();
      // vane
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(vane * Math.PI / 180);
      ctx.fillStyle = C.black;
      ctx.fillRect(-4, -88, 8, 186);
      ctx.beginPath(); ctx.moveTo(0, -122); ctx.lineTo(-17, -84); ctx.lineTo(17, -84); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.orange; ctx.strokeStyle = C.black; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, 48); ctx.lineTo(-34, 122); ctx.lineTo(34, 122); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      circle(ctx, cx, cy, 9, C.white, C.black, 3);
      // display
      const shown = Math.round((vane + offset + 360) % 360);
      ctx.fillStyle = C.black; ctx.fillRect(10, 10, 184, 84);
      text(ctx, tx('display'), 22, 38, FS.s, C.white);
      text(ctx, shown + '° ' + DIR16[dirIdx(shown)], 22, 80, 34, C.white, 300);
      if (offset) { ctx.fillStyle = C.red; ctx.fillRect(10, 98, 184, 34); text(ctx, tx('wrong'), 102, 123, FS.s, C.white, 500, 'center'); }
      text(ctx, tx('from'), 590, 32, FS.s, C.black, 500, 'right');
      text(ctx, DIR16L[dirIdx(from)].toUpperCase(), 590, 60, FS.m, C.black, 500, 'right');
      text(ctx, tx('to'), 590, 560, FS.s, C.black, 500, 'right');
      text(ctx, DIR16L[dirIdx(from + 180)].toUpperCase(), 590, 588, FS.m, C.black, 500, 'right');
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        const i = dirIdx(from);
        ui.setRead(tx('read', DIR16L[i], Math.round(from), DIR16[i], DIR16L[dirIdx(from + 180)], offset ? shown : null));
      }
    }
    return { frame };
  };
})();
