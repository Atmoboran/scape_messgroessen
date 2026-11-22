// SUNRISE & SUNSET – the path of the sun over the horizon at a chosen latitude
// for a chosen day, in true local solar time (12:00 = sun highest), with the
// clock time of Offenbach (MEZ/MESZ) for comparison at 50° N
(() => {
  'use strict';
  const { C, W, H, FS, fmt, text, circle, simShell, slider, iconButton, select, dayOfYear, sunSolar, sunPosSolar, hhmm } = MG;
  const tx = MG.texts('sonne');

  MG.sims.sonne = host => {
    const ui = simShell(host, { label: tx('aria') });
    const { view, ctx } = ui;
    const year = new Date().getFullYear();
    const today = dayOfYear(new Date());
    const JUNE = dayOfYear(new Date(year, 5, 21)), DEC = dayOfYear(new Date(year, 11, 21));
    const HY = 380;                                              // horizon
    const dateLabel = (d, opt = { day: 'numeric', month: 'long' }) => new Date(year, 0, d).toLocaleDateString(window.TEXTS.locale, opt);
    const HOME = MG.data.geo;                                    // the station: Offenbach
    const place = { lat: Math.round(HOME.lat * 2) / 2, lon: HOME.lon, zone: 60, dst: true };
    let doy = today, tm = 12 * 60, playing = false;
    const isHome = () => place.lat === Math.round(HOME.lat * 2) / 2;
    const latLabel = v => fmt(Math.abs(v), v % 1 ? 1 : 0) + '° ' + (v >= 0 ? tx('north') : tx('south')) + (tx('latNames')[v] ? ' · ' + tx('latNames')[v] : '');
    // view onto the sky: we always look towards the sun at noon of the chosen
    // day (south, or north when the sun passes north of us – south of the
    // equator, or in the tropics in summer). The sky is projected onto the
    // vertical plane in front of us (east–west across, height up), so the path
    // of the sun is a hill at every latitude; parts of the path behind us are dotted.
    let facing = 180;
    const centre = () => facing;
    const rel = az => ((az - centre() + 540) % 360) - 180;
    const proj = p => { const a = p.alt * Math.PI / 180, r = rel(p.az) * Math.PI / 180;
      return { x: 300 + Math.cos(a) * Math.sin(r) * 270, y: HY - Math.sin(a) * 320, front: Math.cos(r) >= 0 }; };

    // latitude: slider and a dropdown with well-known places
    const CITIES = [['offenbach', 50], ['tromsoe', 69.5], ['newyork', 40.5], ['kairo', 30], ['singapur', 1.5], ['sydney', -34]];
    const cityOf = v => (CITIES.find(c => c[1] === v) || [''])[0];
    const r0 = ui.row();
    const sL = slider(r0, { label: tx('sliderLat'), min: -80, max: 80, step: 0.5, value: place.lat, info: tx('infoLat'), format: latLabel, onInput: v => { place.lat = v; city.set(cityOf(v)); } });
    const city = select(r0, { aria: tx('cityAria'), options: [{ label: tx('pickCity'), value: '' }].concat(CITIES.map(([id]) => ({ label: tx('cities.' + id), value: id }))), value: cityOf(place.lat),
      onChange: v => { const c = CITIES.find(x => x[0] === v); if (c) { place.lat = c[1]; sL.set(c[1]); } } });
    // date: slider and a dropdown with special days
    const DAYS = [['today', today], ['march', dayOfYear(new Date(year, 2, 21))], ['june', JUNE], ['sept', dayOfYear(new Date(year, 8, 23))], ['dec', DEC]];
    const dayKey = d => (DAYS.find(x => x[1] === d) || [''])[0];
    const r1 = ui.row();
    const sD = slider(r1, { label: tx('sliderDate'), min: 1, max: 365, step: 1, value: doy, format: v => dateLabel(v), onInput: v => { doy = v; dayDrop.set(dayKey(v)); } });
    const dayDrop = select(r1, { aria: tx('dayAria'), options: [{ label: tx('pickDay'), value: '' }].concat(DAYS.map(([k, d]) => ({ label: k === 'today' ? tx('days.today', dateLabel(d, { day: 'numeric', month: 'short' })) : tx('days.' + k), value: k }))), value: 'today',
      onChange: v => { const d = DAYS.find(x => x[0] === v); if (d) { doy = d[1]; sD.set(doy); } } });
    // time of day: slider and play (after 24 hours the next day begins)
    const r2 = ui.row();
    const sH = slider(r2, { label: tx('sliderTime'), min: 0, max: 1435, step: 5, value: tm, info: tx('infoTime'), format: v => tx('time', hhmm(v)), onInput: v => { tm = v; } });
    iconButton(r2, ['pause', 'play'], tx('btnPlay'), v => { playing = v; }, { toggle: true, state: false, pressed: false });
    ui.readout();
    ui.hint(tx('hint'));

    // path of one day: the part in front solid (or with the given dash), the part behind us dashed and thin
    function path(d, color, width, dash) {
      for (const front of [true, false]) {
        ctx.strokeStyle = color; ctx.lineWidth = front ? width : Math.max(1.5, width / 2);
        ctx.setLineDash(front ? (dash || []) : [3, 6]);
        ctx.beginPath();
        let on = false;
        for (let m = 0; m <= 1440; m += 3) {
          const q = proj(sunPosSolar(d, m, place));
          if (sunPosSolar(d, m, place).alt < -1 || q.front !== front) { on = false; continue; }
          if (on) ctx.lineTo(q.x, q.y); else { ctx.moveTo(q.x, q.y); on = true; }
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      if (playing) {
        tm += dt * 90;
        if (tm >= 1440) { tm -= 1440; doy = doy % 365 + 1; sD.set(doy); dayDrop.set(dayKey(doy)); }   // next day
        sH.set(Math.round(tm / 5) * 5);
      }
      const noon = sunPosSolar(doy, 720, place);
      facing = noon.alt > 89.5 ? (place.lat >= 0 ? 180 : 0) : (noon.az > 90 && noon.az < 270 ? 180 : 0);
      const st = sunSolar(doy, place), sp = sunPosSolar(doy, tm, place);
      // sky: day, twilight, night
      const dusk = sp.alt < 0, night = sp.alt < -6;
      ctx.fillStyle = night ? C.navy : dusk ? C.blue2 : C.ice; ctx.fillRect(0, 0, W, HY);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, HY); ctx.clip();
      const ref = dusk ? C.lilac : C.purple2;
      path(JUNE, ref, 2, [7, 7]);
      path(DEC, ref, 2, [7, 7]);
      path(doy, C.orange, 5);
      if (sp.alt > -3) { const q = proj(sp); circle(ctx, q.x, q.y, 20, q.front ? C.yellow : C.yellowPale, C.black, q.front ? 3 : 1.5); }
      ctx.restore();
      const lab = dusk ? C.white : C.black;
      // date labels on the afternoon part of the reference paths
      for (const [d, key, m] of [[JUNE, 'june', 15 * 60], [DEC, 'dec', 9 * 60]]) {
        const p = sunPosSolar(d, m, place), q = proj(p), right = q.x > 300;
        if (p.alt > 4) text(ctx, tx(key), q.x + (right ? 10 : -10), q.y - 8, FS.s, lab, 500, right ? 'left' : 'right');
      }
      ctx.fillStyle = C.black; ctx.fillRect(10, 10, 360, 40);
      text(ctx, tx('clock', hhmm(tm), dateLabel(doy, { day: 'numeric', month: 'short' }).toUpperCase()), 22, 38, FS.m, C.white);
      // ground with the compass directions, rise and set marked on the horizon
      ctx.fillStyle = C.green; ctx.fillRect(0, HY, W, H - HY);
      ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, HY); ctx.lineTo(W, HY); ctx.stroke();
      for (const [az, l] of Object.entries(tx('dirs'))) {
        if (Math.abs(rel(+az)) > 90) continue;   // only the directions in front of us
        const x = proj({ alt: 0, az: +az }).x;
        ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, HY); ctx.lineTo(x, HY + 10); ctx.stroke();
        text(ctx, l, x, HY + 32, FS.s, C.black, 500, 'center');
      }
      if (!st.polar) for (const m of [st.rise, st.set]) {
        const x = proj({ alt: 0, az: sunPosSolar(doy, m, place).az }).x;
        ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(x, HY - 2); ctx.lineTo(x - 9, HY - 18); ctx.lineTo(x + 9, HY - 18); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = C.black; ctx.lineWidth = 1.5; ctx.stroke();
      }
      // boxes: local solar time large, at Offenbach the clock time (MEZ/MESZ) small below
      const zone = st.summer ? 'MESZ' : 'MEZ', home = isHome();
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
        box(10, tx('rise'), hhmm(st.rise), home ? tx('zoneTime', hhmm(st.toZone(st.rise)), zone) : '');
        box(207, tx('set'), hhmm(st.set), home ? tx('zoneTime', hhmm(st.toZone(st.set)), zone) : '');
      }
      box(404, tx('length'), tx('hm', Math.floor(len / 60), String(Math.round(len % 60)).padStart(2, '0')), '');
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        ui.setRead(st.polar
          ? tx('readPolar', dateLabel(doy), latLabel(place.lat), tx(st.polar === 'day' ? 'polarDay' : 'polarNight'))
          : tx('read', dateLabel(doy), latLabel(place.lat), hhmm(st.rise), hhmm(st.set), home ? hhmm(st.toZone(st.rise)) : null, home ? hhmm(st.toZone(st.set)) : null, zone, fmt(st.noonAlt)));
      }
    }
    return { frame };
  };
})();
