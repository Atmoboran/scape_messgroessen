// UV INDEX – sun height, ozone, clouds
(() => {
  'use strict';
  const { C, W, H, FS, TAU, rnd, fmt, text, circle, simShell, slider, button, seg } = MG;
  const tx = MG.texts('uv');

  MG.sims.uv = host => {
    const ui = simShell(host, { label: tx('aria') });
    const { view, ctx } = ui;
    const CX = 300, CY = 1620, RE = 1100, RCL = RE + 75, RATM = RE + 175;
    let elev = 45, cloud = 0, ozone = 320;
    const ozR = () => [RE + 130, RE + 130 + (ozone - 200) / 200 * 40];
    const P = [];
    const r1 = ui.row();
    const sE = slider(r1, { label: tx('sliderSun'), min: 15, max: 65, step: 1, value: elev, format: v => v + '°', onInput: v => { elev = v; } });
    const r2 = ui.row();
    const sC = slider(r2, { label: tx('sliderCloud'), min: 0, max: 100, step: 1, value: cloud, format: v => v + ' %', onInput: v => { cloud = v; } });
    const r3 = ui.row();
    const oz = seg(r3, [{ label: tx('ozThin'), value: 240 }, { label: tx('ozNormal'), value: 320 }, { label: tx('ozThick'), value: 400 }], ozone, v => { ozone = v; }, tx('ozAria'));
    const r4 = ui.row();
    const preset = (l, e, c, task) => button(r4, l, () => { elev = e; cloud = c; ozone = 320; sE.set(e); sC.set(c); oz.set(320); ui.done(task); });
    preset(tx('presetSpring'), 45, 0, 'spring');
    preset(tx('presetSummer'), 62, 95, 'summer');
    ui.readout();
    ui.hint(tx('hint'));

    function uvi() {
      const mu = Math.sin(elev * Math.PI / 180);
      const cf = 1 - 0.75 * Math.pow(cloud / 100, 3.4);
      return { v: 12.5 * Math.pow(mu, 2.42) * Math.pow(ozone / 300, -1.23) * 0.9 * cf, geo: Math.min(1, 0.9 * Math.pow(mu, 2.42) * Math.pow(ozone / 300, -1.23)), cf };
    }
    // intersection of a line with a circle around the centre of the earth (backwards from the ground)
    function backT(px, py, dx, dy, R) {
      const ox = px - CX, oy = py - CY;
      const b = ox * dx + oy * dy, c = ox * ox + oy * oy - R * R;
      return -b + Math.sqrt(Math.max(0, b * b - c));
    }
    const BAND_RANGES = [[0, 2, C.greenStrong], [3, 5, C.yellowStrong], [6, 7, C.orange], [8, 10, C.red], [11, 11, C.purple2]];
    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      const u = uvi();
      const e = elev * Math.PI / 180, dx = -Math.cos(e), dy = -Math.sin(e); // direction to the sun
      const gx = 300, gy = CY - RE;
      const [o0, o1] = ozR();
      const tSun = backT(gx, gy, dx, dy, RATM + 60) + 30;
      const sx = gx + dx * tSun, sy = gy + dy * tSun;
      // a low sun lies outside the picture; it is drawn on the same ray at the edge
      const tVis = Math.min(tSun, (gx - 44) / Math.cos(e));
      const vx = gx + dx * tVis, vy = gy + dy * tVis;
      // new UV packets
      if (Math.random() < dt * 34) {
        const off = rnd(-30, 30), tgx = gx + rnd(-50, 50);
        const start = { x: sx - dy * off, y: sy + dx * off };
        const len = Math.hypot(tgx - start.x, gy - start.y);
        let die = len + 1;
        if (Math.random() > u.geo) {
          const tOz = backT(tgx, gy, dx, dy, (o0 + o1) / 2);
          die = Math.random() < 0.6 ? len - tOz : rnd(len - backT(tgx, gy, dx, dy, RATM), len - 10);
        } else if (Math.random() > u.cf) die = len - backT(tgx, gy, dx, dy, RCL);
        P.push({ x: start.x, y: start.y, ux: (tgx - start.x) / len, uy: (gy - start.y) / len, s: 0, die, len });
      }
      // background
      ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
      circle(ctx, CX, CY, RATM, C.ice);
      ctx.beginPath(); ctx.arc(CX, CY, o1, 0, TAU); ctx.arc(CX, CY, o0, 0, TAU, true); ctx.fillStyle = C.lilac; ctx.fill();
      // clouds on an arc
      const nCl = Math.round(cloud / 100 * 11);
      for (let i = 0; i < nCl; i++) {
        const a = -Math.PI / 2 + (i - 5) * 0.045;
        const x = CX + Math.cos(a) * RCL, y = CY + Math.sin(a) * RCL;
        circle(ctx, x, y, 24, C.white); circle(ctx, x + 17, y + 6, 18, C.white); circle(ctx, x - 17, y + 8, 16, C.white);
      }
      circle(ctx, CX, CY, RE, C.green);
      // sun
      circle(ctx, vx, vy, 28, C.yellow);
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) { const a = i * TAU / 8; ctx.beginPath(); ctx.moveTo(vx + Math.cos(a) * 35, vy + Math.sin(a) * 35); ctx.lineTo(vx + Math.cos(a) * 47, vy + Math.sin(a) * 47); ctx.stroke(); }
      // UV packets
      ctx.lineWidth = 3;
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i]; p.s += 380 * dt;
        if (p.s > p.die || p.s > p.len) { P.splice(i, 1); continue; }
        const x = p.x + p.ux * p.s, y = p.y + p.uy * p.s;
        const inAtm = (x - CX) ** 2 + (y - CY) ** 2 < RATM * RATM;
        ctx.strokeStyle = inAtm ? C.purple2 : C.lilac;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - p.ux * 14, y - p.uy * 14); ctx.stroke();
      }
      // person
      circle(ctx, gx, gy - 36, 8, C.black); ctx.fillStyle = C.black; ctx.fillRect(gx - 7, gy - 26, 14, 26);
      const ozY = CY - Math.sqrt(o1 * o1 - (CX - 20) * (CX - 20));
      text(ctx, tx('ozone'), 20, ozY + 4, FS.s, C.black, 500, 'left', 'top');
      text(ctx, tx('atmosphere'), 20, 488, FS.s, C.black, 500);
      // UV scale
      const bx = 482, by0 = 52, bh = 22;
      ctx.fillStyle = C.white; ctx.fillRect(bx - 16, 10, 124, bh * 12 + 56);
      text(ctx, tx('index'), bx - 6, by0 - 14, FS.s, C.black);
      const val = Math.round(u.v);
      for (let k = 11; k >= 0; k--) {
        const y = by0 + (11 - k) * bh;
        const band = BAND_RANGES.find(b => k >= b[0] && k <= b[1]);
        ctx.fillStyle = band[2]; ctx.fillRect(bx, y, 32, bh - 2);
        text(ctx, k === 11 ? '11+' : String(k), bx + 42, y + 18, FS.s, C.black);
        if (k === Math.min(11, val)) { ctx.strokeStyle = C.black; ctx.lineWidth = 4; ctx.strokeRect(bx - 4, y - 3, 40, bh + 4); }
      }
      ctx.fillStyle = C.black; ctx.fillRect(10, 10, 190, 86);
      text(ctx, tx('atGround'), 22, 38, FS.s, C.white);
      text(ctx, fmt(u.v, 1), 22, 84, 42, C.white, 300);
      if (u.v >= 2.5) { ctx.fillStyle = C.yellow; ctx.fillRect(10, 100, 190, 36); text(ctx, tx('protect'), 105, 126, FS.s, C.black, 500, 'center'); }
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        const bi = BAND_RANGES.findIndex(b => Math.min(11, val) >= b[0] && Math.min(11, val) <= b[1]);
        ui.setRead(tx('read', fmt(u.v, 1), tx('bandsLower')[bi], u.v >= 2.5));
      }
    }
    return { frame };
  };
})();
