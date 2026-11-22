// MOON PHASE – sun, earth and moon from above, the moon as seen from the
// chosen hemisphere, and a side view of the tilted orbit (why there is not
// an eclipse every month)
(() => {
  'use strict';
  const { C, W, H, FS, TAU, clamp, fmt, text, circle, arrow, simShell, slider, iconButton, select, dragOn, SYN, moonAge, moonName, drawMoonFace } = MG;
  const tx = MG.texts('mond');
  const DAY = 86400000;
  // the moon's height above the plane of the earth's orbit (ecliptic latitude), simple series after Meeus
  function moonLat(date) {
    const T = (date.getTime() / DAY + 2440587.5 - 2451545.0) / 36525;
    const F = (93.2720950 + 483202.0175233 * T) * Math.PI / 180;
    return 5.128 * Math.sin(F);
  }

  MG.sims.mond = host => {
    const ui = simShell(host, { label: tx('aria'), drag: true });
    const { view, ctx } = ui;
    const now = Date.now(), ageNow = moonAge(new Date(now));
    let days = 0, playing = false, hemi = 'nord';          // days from today
    const ageOf = d => ((ageNow + d) % SYN + SYN) % SYN;
    const ex = 150, ey = 196, OR = 104, SPLIT = 300, BOT = 404;
    const r0 = ui.row();
    select(r0, { label: tx('viewLabel'), options: ['nord', 'aequator', 'sued'].map(v => ({ label: tx('views.' + v), value: v })), value: hemi, onChange: v => { hemi = v; } });
    const r1 = ui.row();
    const sA = slider(r1, { label: tx('slider'), min: 0, max: 29.5, step: 0.1, value: +ageNow.toFixed(1), format: v => fmt(v, 1), onInput: v => { days += v - ageOf(days); } });
    const r2 = ui.row();
    const todayLbl = tx('btnToday', new Date(now).toLocaleDateString(t('locale'), { day: 'numeric', month: 'short' }));
    iconButton(r2, 'today', todayLbl, () => { days = 0; });
    const play = iconButton(r2, ['pause', 'play'], tx('btnPlay'), v => { playing = v; }, { toggle: true, state: false, pressed: false });
    ui.readout();
    ui.hint(tx('hint'));
    function set(p) {
      const th = Math.atan2(-(p.y - ey), p.x - ex);         // mathematical angle
      let e = th - Math.PI; e = ((e % TAU) + TAU) % TAU;     // elongation: 0 = new moon (towards the sun)
      let d = e / TAU * SYN - ageOf(days);
      if (d > SYN / 2) d -= SYN; if (d < -SYN / 2) d += SYN;  // move to the nearest matching day
      days += d;
      if (playing) { playing = false; play.set(false); }
    }
    dragOn(view, {
      down: p => { if (p.x > SPLIT || p.y > BOT) return false; set(p); },
      move: p => set(p)
    });
    const fmtDate = d => new Date(now + d * DAY).toLocaleDateString(t('locale'), { day: '2-digit', month: '2-digit', year: 'numeric' });

    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      if (playing) days += dt * 2;                             // 2 days per second
      const age = ageOf(days);
      if (document.activeElement !== sA.input) sA.set(+age.toFixed(1));
      const f = age / SYN, e = f * TAU, th = Math.PI + e;
      const mx = ex + Math.cos(th) * OR, my = ey - Math.sin(th) * OR;
      const date = new Date(now + days * DAY), beta = moonLat(date);
      ctx.fillStyle = C.navy; ctx.fillRect(0, 0, SPLIT, BOT);
      ctx.fillStyle = C.paleGreen; ctx.fillRect(SPLIT, 0, W - SPLIT, BOT);
      ctx.fillStyle = C.white; ctx.fillRect(0, BOT, W, H - BOT);
      // top view: sunlight from the left
      ctx.fillStyle = C.yellow; ctx.fillRect(0, 0, 14, BOT);
      for (let y = 90; y < BOT - 30; y += 80) arrow(ctx, 20, y, 28, 0, C.yellow, 3, 10);
      text(ctx, tx('sunlight'), 24, 32, FS.s, C.yellow);
      ctx.setLineDash([6, 8]); circle(ctx, ex, ey, OR, null, C.white, 2); ctx.setLineDash([]);
      circle(ctx, ex, ey, 26, C.blue2);
      ctx.fillStyle = C.black; ctx.beginPath(); ctx.arc(ex, ey, 26, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fill();
      circle(ctx, ex, ey, 26, null, C.white, 2);
      text(ctx, tx('earth'), ex, ey + 50, FS.s, C.white, 500, 'center');
      circle(ctx, mx, my, 16, C.black);
      ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(mx, my, 16, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); ctx.fill();
      circle(ctx, mx, my, 16, null, C.white, 2);
      ctx.strokeStyle = C.yellowPastel; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(mx, my); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, tx('moon'), clamp(mx, 50, SPLIT - 40), my < ey ? my - 26 : my + 40, FS.s, C.white, 500, 'center');
      text(ctx, tx('topView'), 24, BOT - 14, FS.s, C.white);
      // the moon as seen from the chosen hemisphere: the same phase, only turned
      const rot = { nord: 0, aequator: Math.PI / 2, sued: Math.PI }[hemi];
      ctx.save(); ctx.translate(450, 176); ctx.rotate(rot);
      drawMoonFace(ctx, 0, 0, 92, age, C.navy, C.yellowPastel);
      ctx.restore();
      const illum = (1 - Math.cos(e)) / 2;
      text(ctx, tx('asSeen'), 450, 30, FS.s, C.black, 500, 'center');
      text(ctx, tx('viewsShort.' + hemi), 450, 54, FS.s, C.black, 500, 'center');
      text(ctx, moonName(age).toUpperCase(), 450, 306, FS.m, C.black, 500, 'center');
      text(ctx, tx('lit', fmt(illum * 100)), 450, 336, FS.s, C.black, 500, 'center');
      text(ctx, fmtDate(days), 450, 376, FS.m, C.black, 500, 'center');
      // side view: the orbit is tilted by about 5° – the moon usually passes above or below the shadow
      const SY = 512, SX = 300, K = 7;                          // centre line, earth, pixels per degree
      text(ctx, tx('sideView'), 16, BOT + 26, FS.s, C.black);
      ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(0, SY, 46, -Math.PI / 2, Math.PI / 2); ctx.fill();
      ctx.setLineDash([6, 6]); ctx.strokeStyle = C.grey; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(46, SY); ctx.lineTo(W, SY); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.lavender; ctx.beginPath(); ctx.moveTo(SX, SY - 16); ctx.lineTo(W, SY - 6); ctx.lineTo(W, SY + 6); ctx.lineTo(SX, SY + 16); ctx.closePath(); ctx.fill();
      text(ctx, tx('shadow'), W - 8, SY + 30, FS.s, C.purple2, 500, 'right');
      circle(ctx, SX, SY, 16, C.blue2, C.black, 2);
      const mxs = SX - Math.cos(e) * 220, mys = SY - beta * K;
      const nearNew = age < 1.1 || age > SYN - 1.1, nearFull = Math.abs(age - SYN / 2) < 1.1;
      const solar = nearNew && Math.abs(beta) < 1.5, lunar = nearFull && Math.abs(beta) < 1.0;
      circle(ctx, mxs, mys, 9, lunar ? C.rust : C.grey, C.black, 2);
      ctx.strokeStyle = C.black; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(mxs, SY); ctx.lineTo(mxs, mys); ctx.stroke();
      text(ctx, tx('lat', fmt(Math.abs(beta), 1), beta >= 0), clamp(mxs, 130, W - 140), mys + (beta >= 0 ? -16 : 30), FS.s, C.black, 500, 'center');
      const status = solar ? 'solar' : lunar ? 'lunar' : nearNew || nearFull ? 'miss' : 'none';
      if (status !== 'none') {
        ctx.fillStyle = status === 'miss' ? C.white : C.black; ctx.fillRect(0, H - 34, W, 34);
        text(ctx, tx('status.' + status), W / 2, H - 10, FS.s, status === 'miss' ? C.black : C.white, 500, 'center');
      }
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        ui.setRead(tx('read', moonName(age), fmtDate(days), fmt(age, 1), fmt(illum * 100), fmt(SYN - age, 1)));
      }
    }
    return { frame };
  };
})();
