// LIGHT – lux and W/m²
(() => {
  'use strict';
  const { C, W, H, FS, clamp, rnd, fmt, text, circle, simShell, slider, button, seg } = MG;
  const tx = MG.texts('licht');

  MG.sims.licht = host => {
    const ui = simShell(host, { label: tx('aria') });
    const { view, ctx } = ui;
    const L0 = 250, L1 = 1500;
    const V = l => 1.019 * Math.exp(-285.4 * Math.pow(l / 1000 - 0.559, 2));
    const planck = (l, T) => { const m = l * 1e-9; return 1 / (Math.pow(m, 5) * (Math.exp(1.4388e-2 / (m * T)) - 1)); };
    const gauss = (l, m, s) => Math.exp(-0.5 * ((l - m) / s) ** 2);
    const SRC = {
      sonne: { f: l => (l < 295 ? 0 : planck(l, 5778)) },
      led:   { f: l => 0.55 * gauss(l, 450, 11) + gauss(l, 565, 60) },
      heizer:{ f: l => planck(l, 1700) }
    };
    // luminous efficacy (lux per W/m²) computed from the spectrum
    for (const k in SRC) {
      let all = 0, vis = 0, mx = 0;
      for (let l = 250; l <= 4000; l += 2) { const s = SRC[k].f(l); all += s; vis += s * V(l); if (l <= L1) mx = Math.max(mx, s); }
      SRC[k].eff = 683 * vis / all; SRC[k].max = mx;
      SRC[k].name = tx('sources.' + k);
    }
    let src = 'sonne', logW = Math.log10(170);
    const P = [];
    const wFmt = w => fmt(w, w < 1 ? 3 : w < 10 ? 1 : 0);
    const r1 = ui.row();
    const sg = seg(r1, ['sonne', 'led', 'heizer'].map(k => ({ label: SRC[k].name, value: k })), src, v => { src = v; }, tx('sourceAria'));
    const r2 = ui.row();
    const sW = slider(r2, { label: tx('slider'), min: -3, max: 3.1, step: 0.01, value: logW, format: v => tx('wm2', wFmt(Math.pow(10, v))), onInput: v => { logW = v; } });
    const r3 = ui.row();
    const names = tx('presets');
    const preset = (i, s, w) => button(r3, names[i], () => { src = s; logW = Math.log10(w); sg.set(s); sW.set(logW); });
    preset(0, 'sonne', 0.0027);
    preset(1, 'led', 1);
    preset(2, 'sonne', 110);
    preset(3, 'sonne', 1050);
    preset(4, 'heizer', 300);
    ui.readout();
    ui.hint(tx('hint'));

    function wavelengthColor(l) {
      if (l < 380) return null;
      if (l < 450) return C.purple2; if (l < 495) return C.blue2; if (l < 520) return C.cyan; if (l < 570) return C.greenStrong;
      if (l < 590) return C.yellowStrong; if (l < 625) return C.orange; if (l <= 780) return C.red; return null;
    }
    function sampleL() {
      const s = SRC[src];
      for (let k = 0; k < 40; k++) { const l = rnd(L0, L1); if (Math.random() * s.max < s.f(l)) return l; }
      return 1000;
    }
    const SKY = [C.navy, C.purple2, C.blue2, C.cyan2, C.ice, C.yellowPale];
    const TOP = 300;   // upper half: scene, lower half: spectrum
    const SCALE = [Math.log10(0.2), Math.log10(300), 4, 5];
    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      const w = Math.pow(10, logW), lux = w * SRC[src].eff;
      const ll = Math.log10(Math.max(0.01, lux));
      ctx.fillStyle = SKY[clamp(Math.floor((ll + 1) / 1.1), 0, SKY.length - 1)]; ctx.fillRect(0, 0, 392, TOP);
      const dark = ll < 2.2;
      // source
      const qx = 62, qy = 62;
      if (src === 'sonne') { circle(ctx, qx, qy, 36, C.yellow, C.black, 2); }
      else if (src === 'led') { circle(ctx, qx, qy, 28, C.white, C.black, 3); ctx.fillStyle = C.black; ctx.fillRect(qx - 12, 0, 24, qy - 26); }
      else { ctx.fillStyle = C.black; ctx.fillRect(qx - 50, qy - 26, 100, 52); ctx.fillStyle = C.red2; for (let i = 0; i < 3; i++) ctx.fillRect(qx - 42, qy - 19 + i * 15, 84, 8); }
      // photons
      const rate = Math.max(0, logW + 3) * 11;
      if (Math.random() < rate * dt) for (let k = 0; k < 1 + Math.floor(rate * dt); k++) {
        const l = sampleL(), tgx = rnd(200, 370), tgy = rnd(232, 272);
        const len = Math.hypot(tgx - qx, tgy - qy);
        P.push({ l, x: qx, y: qy, ux: (tgx - qx) / len, uy: (tgy - qy) / len, s: 0, len });
      }
      // surface
      ctx.fillStyle = C.white; ctx.beginPath(); ctx.moveTo(176, 286); ctx.lineTo(384, 286); ctx.lineTo(356, 226); ctx.lineTo(204, 226); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.stroke();
      text(ctx, tx('m2'), 280, 266, FS.m, C.black, 500, 'center');
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i]; p.s += 340 * dt;
        if (p.s > p.len) { P.splice(i, 1); continue; }
        const x = p.x + p.ux * p.s, y = p.y + p.uy * p.s, c = wavelengthColor(p.l);
        if (c) circle(ctx, x, y, 5, c, C.black, 1);
        else circle(ctx, x, y, 5, null, p.l < 380 ? C.purple2 : (dark ? C.salmon : C.rust), 2);
      }
      // display
      ctx.fillStyle = C.black; ctx.fillRect(10, 150, 156, 74);
      text(ctx, lux > 200000 ? tx('over') : tx('lux'), 22, 176, FS.s, C.white);
      text(ctx, lux >= 1000 ? tx('klx', fmt(lux / 1000, 1)) : tx('lx', fmt(lux, lux < 10 ? 2 : 0)), 22, 212, 30, C.white, 300);
      // lux scale
      const sx = 552, sy0 = 284, sy1 = 50, lmin = -1, lmax = Math.log10(200000);
      const Y = v => sy0 - (v - lmin) / (lmax - lmin) * (sy0 - sy1);
      ctx.fillStyle = C.white; ctx.fillRect(392, 0, 208, TOP);
      ctx.fillStyle = C.yellowPale; ctx.fillRect(sx, Y(clamp(ll, lmin, lmax)), 26, sy0 - Y(clamp(ll, lmin, lmax)));
      ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.strokeRect(sx, sy1, 26, sy0 - sy1);
      tx('scale').forEach((l, i) => {
        const v = i < 4 ? SCALE[i] : lmax;
        ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx - 8, Y(v)); ctx.lineTo(sx, Y(v)); ctx.stroke();
        text(ctx, l, sx - 12, Y(v) + (v === lmax ? -12 : v === 5 ? 18 : 7), FS.s, C.black, 500, 'right');
      });
      ctx.fillStyle = C.black; ctx.beginPath(); const my = Y(clamp(ll, lmin, lmax)); ctx.moveTo(sx + 28, my); ctx.lineTo(sx + 42, my - 8); ctx.lineTo(sx + 42, my + 8); ctx.closePath(); ctx.fill();
      // spectrum
      const gx0 = 30, gx1 = 580, gy1 = 520, gy0 = 360;
      const X = l => gx0 + (l - L0) / (L1 - L0) * (gx1 - gx0);
      ctx.fillStyle = C.white; ctx.fillRect(0, TOP, W, H - TOP);
      ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, TOP); ctx.lineTo(W, TOP); ctx.stroke();
      for (let l = 380; l < 780; l += 5) { ctx.fillStyle = wavelengthColor(l); ctx.fillRect(X(l), gy1 + 2, X(l + 5) - X(l) + 0.5, 10); }
      // eye
      ctx.fillStyle = C.yellowPastel; ctx.beginPath(); ctx.moveTo(X(380), gy1);
      for (let l = 380; l <= 780; l += 4) ctx.lineTo(X(l), gy1 - V(l) * (gy1 - gy0)); ctx.lineTo(X(780), gy1); ctx.closePath(); ctx.fill();
      // source spectrum
      const s = SRC[src];
      ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(X(380), gy1);
      for (let l = 380; l <= 780; l += 4) ctx.lineTo(X(l), gy1 - Math.min(V(l), s.f(l) / s.max) * (gy1 - gy0)); ctx.lineTo(X(780), gy1); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.beginPath();
      for (let l = L0; l <= L1; l += 4) { const y = gy1 - s.f(l) / s.max * (gy1 - gy0); if (l === L0) ctx.moveTo(X(l), y); else ctx.lineTo(X(l), y); }
      ctx.stroke();
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx0, gy1); ctx.lineTo(gx1, gy1); ctx.stroke();
      text(ctx, tx('uv'), X(315), gy1 + 40, FS.s, C.black, 500, 'center');
      text(ctx, tx('visible'), X(580), gy1 + 40, FS.s, C.black, 500, 'center');
      text(ctx, tx('ir'), X(1150), gy1 + 40, FS.s, C.black, 500, 'center');
      text(ctx, s.name.toUpperCase(), gx0, 334, FS.s, C.black);
      ctx.fillStyle = C.yellowPastel; ctx.fillRect(300, 318, 18, 18); text(ctx, tx('eye'), 324, 334, FS.s, C.black);
      ctx.fillStyle = C.orange; ctx.fillRect(400, 318, 18, 18); text(ctx, tx('counts'), 424, 334, FS.s, C.black);
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        ui.setRead(tx('read', s.name, wFmt(w), fmt(lux, lux < 10 ? 2 : 0), fmt(s.eff)));
      }
    }
    return { frame };
  };
})();
