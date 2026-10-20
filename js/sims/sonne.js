// SUNRISE & SUNSET – the path of the sun over the horizon of a chosen place
// for a chosen day, in true local solar time (12:00 = sun highest), with the
// legal clock time of the place for comparison
(() => {
  'use strict';
  const { C, W, H, FS, fmt, text, circle, simShell, slider, button, toggle, seg, dayOfYear, sunSolar, sunPosSolar, hhmm } = MG;
  const tx = MG.texts('sonne');

  MG.sims.sonne = host => {
    const ui = simShell(host, { label: tx('aria') });
    const { view, ctx } = ui;
    const PLACES = MG.data.places;
    const year = new Date().getFullYear();
    const today = dayOfYear(new Date());
    const JUNE = dayOfYear(new Date(year, 5, 21)), DEC = dayOfYear(new Date(year, 11, 21));
    const HY = 380;                                              // horizon
    const dateLabel = (d, opt = { day: 'numeric', month: 'long' }) => new Date(year, 0, d).toLocaleDateString(window.TEXTS.locale, opt);
    let place = PLACES[0], doy = today, tm = 12 * 60, playing = false;
    // a 360° panorama: north of the equator south is in the middle, south of it north
    const centre = () => place.lat >= 0 ? 180 : 0;
    const rel = az => ((az - centre() + 540) % 360) - 180;
    const X = az => 300 + rel(az) / 180 * 280, Y = alt => HY - alt / 90 * 320;

    const r0 = ui.row();
    seg(r0, PLACES.map(p => ({ label: tx('places.' + p.id), value: p.id })), place.id, v => { place = PLACES.find(p => p.id === v); }, tx('placeAria'));
    const r1 = ui.row();
    const sD = slider(r1, { label: tx('sliderDate'), min: 1, max: 365, step: 1, value: doy, format: v => dateLabel(v), onInput: v => { doy = v; } });
    const r2 = ui.row();
    const sH = slider(r2, { label: tx('sliderTime'), min: 0, max: 1435, step: 5, value: tm, info: tx('infoTime'), format: v => tx('time', hhmm(v)), onInput: v => { tm = v; } });
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
      let lastX = null;
      for (let m = 0; m <= 1440; m += 4) {
        const p = sunPosSolar(d, m, place), x = X(p.az);
        if (p.alt < -1) { lastX = null; continue; }
        if (lastX !== null && Math.abs(x - lastX) < 120) ctx.lineTo(x, Y(p.alt)); else ctx.moveTo(x, Y(p.alt));
        lastX = x;
      }
      ctx.stroke(); ctx.setLineDash([]);
    }

    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      if (playing) { tm = (tm + dt * 90) % 1440; sH.set(Math.round(tm / 5) * 5); }
      const st = sunSolar(doy, place), sp = sunPosSolar(doy, tm, place);
      if (Math.abs(doy - JUNE) <= 2) ui.done('longest');
      if (st.polar === 'day') ui.done('polar');
      // sky: day, twilight, night
      const dusk = sp.alt < 0, night = sp.alt < -6;
      ctx.fillStyle = night ? C.navy : dusk ? C.blue2 : C.ice; ctx.fillRect(0, 0, W, HY);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, HY); ctx.clip();
      const ref = dusk ? C.lilac : C.purple2;
      path(JUNE, ref, 2, [7, 7]);
      path(DEC, ref, 2, [7, 7]);
      path(doy, C.orange, 5);
      if (sp.alt > -3) circle(ctx, X(sp.az), Y(sp.alt), 20, C.yellow, C.black, 3);
      ctx.restore();
      const lab = dusk ? C.white : C.black;
      // date labels on the afternoon part of the reference paths
      for (const [d, key] of [[JUNE, 'june'], [DEC, 'dec']]) {
        const p = sunPosSolar(d, 15 * 60, place);
        if (p.alt > 4) text(ctx, tx(key), X(p.az) + 10, Y(p.alt) - 8, FS.s, lab, 500, 'left');
      }
      ctx.fillStyle = C.black; ctx.fillRect(10, 10, 360, 40);
      text(ctx, tx('clock', hhmm(tm), dateLabel(doy, { day: 'numeric', month: 'short' }).toUpperCase()), 22, 38, FS.m, C.white);
      // ground with the compass directions, rise and set marked on the horizon
      ctx.fillStyle = C.green; ctx.fillRect(0, HY, W, H - HY);
      ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, HY); ctx.lineTo(W, HY); ctx.stroke();
      for (const [az, l] of Object.entries(tx('dirs'))) {
        if (Math.abs(rel(+az)) > 170) continue;   // the direction behind us sits at both edges – leave it out
        ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(+az), HY); ctx.lineTo(X(+az), HY + 10); ctx.stroke();
        text(ctx, l, X(+az), HY + 32, FS.s, C.black, 500, 'center');
      }
      if (!st.polar) for (const m of [st.rise, st.set]) {
        const x = X(sunPosSolar(doy, m, place).az);
        ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(x, HY - 2); ctx.lineTo(x - 9, HY - 18); ctx.lineTo(x + 9, HY - 18); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = C.black; ctx.lineWidth = 1.5; ctx.stroke();
      }
      // boxes: local solar time large, the clock time of the place small below
      const zone = tx(st.summer ? 'zoneSummer' : 'zoneStd')[place.id];
      const box = (x, label, val, sub) => {
        ctx.fillStyle = C.black; ctx.fillRect(x, 432, 186, 158);
        text(ctx, label, x + 12, 460, FS.s, C.white);
        text(ctx, val, x + 12, 520, 38, C.white, 300);
        if (sub) text(ctx, sub, x + 12, 572, FS.s, C.white);
      };
      const len = st.polar === 'day' ? 1440 : st.polar === 'night' ? 0 : st.length;
      if (st.polar) {
        ctx.fillStyle = C.black; ctx.fillRect(10, 432, 383, 158);
        text(ctx, tx(st.polar === 'day' ? 'polarDay' : 'polarNight'), 22, 500, 28, C.white, 300);
        text(ctx, tx(st.polar === 'day' ? 'polarDayNote' : 'polarNightNote'), 22, 548, FS.m, C.white);
      } else {
        box(10, tx('rise'), hhmm(st.rise), tx('zoneTime', hhmm(st.toZone(st.rise)), zone));
        box(207, tx('set'), hhmm(st.set), tx('zoneTime', hhmm(st.toZone(st.set)), zone));
      }
      box(404, tx('length'), tx('hm', Math.floor(len / 60), String(Math.round(len % 60)).padStart(2, '0')), '');
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        ui.setRead(st.polar
          ? tx('readPolar', dateLabel(doy), tx('places.' + place.id), tx(st.polar === 'day' ? 'polarDay' : 'polarNight'))
          : tx('read', dateLabel(doy), tx('places.' + place.id), hhmm(st.rise), hhmm(st.set), hhmm(st.toZone(st.rise)), hhmm(st.toZone(st.set)), zone, fmt(st.noonAlt)));
      }
    }
    return { frame };
  };
})();
