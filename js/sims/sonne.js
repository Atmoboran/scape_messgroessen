// SUNRISE & SUNSET – the path of the sun over the horizon of the station for
// a chosen day, with the longest and the shortest day for comparison
(() => {
  'use strict';
  const { C, W, H, FS, fmt, text, circle, simShell, slider, button, toggle, dayOfYear, sunTimes, sunPos, hhmm } = MG;
  const tx = MG.texts('sonne');

  MG.sims.sonne = host => {
    const ui = simShell(host, { label: tx('aria') });
    const { view, ctx } = ui;
    const year = new Date().getFullYear();
    const today = dayOfYear(new Date());
    const JUNE = dayOfYear(new Date(year, 5, 21)), DEC = dayOfYear(new Date(year, 11, 21));
    const HY = 390;                                              // horizon
    const X = az => 20 + (az - 40) / 280 * 560, Y = alt => HY - alt / 70 * 330;
    const dateLabel = (d, opt = { day: 'numeric', month: 'long' }) => new Date(year, 0, d).toLocaleDateString(window.TEXTS.locale, opt);
    let doy = today, tm = 13 * 60, playing = false;
    const r1 = ui.row();
    const sD = slider(r1, { label: tx('sliderDate'), min: 1, max: 365, step: 1, value: doy, format: v => dateLabel(v), onInput: v => { doy = v; } });
    const r2 = ui.row();
    const sH = slider(r2, { label: tx('sliderTime'), min: 0, max: 1435, step: 5, value: tm, format: v => tx('time', hhmm(v)), onInput: v => { tm = v; } });
    toggle(r2, tx('btnPlay'), playing, v => { playing = v; });
    const r3 = ui.row();
    const setDay = d => { doy = d; sD.set(d); };
    button(r3, tx('btnToday'), () => setDay(today));
    button(r3, tx('btnMarch'), () => setDay(dayOfYear(new Date(year, 2, 21))));
    button(r3, tx('btnJune'), () => setDay(JUNE));
    button(r3, tx('btnDec'), () => setDay(DEC));
    ui.readout();
    ui.hint(tx('hint'));

    function path(d, color, width, dash) {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash || []);
      ctx.beginPath();
      let on = false;
      for (let m = 0; m <= 1440; m += 4) {
        const p = sunPos(d, m);
        if (p.alt < -1 || p.az < 30 || p.az > 330) { on = false; continue; }
        if (on) ctx.lineTo(X(p.az), Y(p.alt)); else { ctx.moveTo(X(p.az), Y(p.alt)); on = true; }
      }
      ctx.stroke(); ctx.setLineDash([]);
    }

    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      if (playing) { tm = (tm + dt * 90) % 1440; sH.set(Math.round(tm / 5) * 5); }
      const st = sunTimes(doy), sp = sunPos(doy, tm), len = st.set - st.rise;
      if (Math.abs(doy - JUNE) <= 2) ui.done('longest');
      if (st.set < 17 * 60) ui.done('early');
      // sky: day, twilight, night
      const dusk = sp.alt < 0, night = sp.alt < -6;
      ctx.fillStyle = night ? C.navy : dusk ? C.blue2 : C.ice; ctx.fillRect(0, 0, W, HY);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, HY); ctx.clip();
      const ref = dusk ? C.lilac : C.purple2;
      path(JUNE, ref, 2, [7, 7]);
      path(DEC, ref, 2, [7, 7]);
      path(doy, C.orange, 5);
      if (sp.alt > -3 && sp.az > 30 && sp.az < 330) circle(ctx, X(sp.az), Y(sp.alt), 20, C.yellow, C.black, 3);
      ctx.restore();
      const lab = dusk ? C.white : C.black;
      const pJ = sunPos(JUNE, 13 * 60 + 30), pD = sunPos(DEC, 12 * 60 + 20);
      text(ctx, tx('june'), X(pJ.az), Y(pJ.alt) - 12, FS.s, lab, 500, 'center');
      text(ctx, tx('dec'), X(pD.az), Y(pD.alt) - 12, FS.s, lab, 500, 'center');
      ctx.fillStyle = C.black; ctx.fillRect(10, 10, 300, 40);
      text(ctx, tx('clock', hhmm(tm), dateLabel(doy, { day: 'numeric', month: 'short' }).toUpperCase()), 22, 38, FS.m, C.white);
      // ground with the compass directions, rise and set marked on the horizon
      ctx.fillStyle = C.green; ctx.fillRect(0, HY, W, H - HY);
      ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, HY); ctx.lineTo(W, HY); ctx.stroke();
      for (const [az, l] of Object.entries(tx('dirs'))) {
        ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(+az), HY); ctx.lineTo(X(+az), HY + 10); ctx.stroke();
        text(ctx, l, X(+az), HY + 32, FS.s, C.black, 500, 'center');
      }
      for (const m of [st.rise, st.set]) {
        const p = sunPos(doy, m), x = X(p.az);
        ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(x, HY - 2); ctx.lineTo(x - 9, HY - 18); ctx.lineTo(x + 9, HY - 18); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = C.black; ctx.lineWidth = 1.5; ctx.stroke();
      }
      const box = (x, label, val) => {
        ctx.fillStyle = C.black; ctx.fillRect(x, 448, 186, 140);
        text(ctx, label, x + 12, 478, FS.s, C.white);
        text(ctx, val, x + 12, 540, 38, C.white, 300);
      };
      box(10, tx('rise'), hhmm(st.rise));
      box(207, tx('set'), hhmm(st.set));
      box(404, tx('length'), tx('hm', Math.floor(len / 60), String(Math.round(len % 60)).padStart(2, '0')));
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        ui.setRead(tx('read', dateLabel(doy), hhmm(st.rise), hhmm(st.set), st.summer, fmt(st.noonAlt), fmt(sp.alt)));
      }
    }
    return { frame };
  };
})();
