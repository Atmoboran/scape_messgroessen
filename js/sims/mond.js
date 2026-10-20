// MOON PHASE – sun, earth, moon
(() => {
  'use strict';
  const { C, W, H, FS, TAU, clamp, fmt, text, circle, arrow, simShell, slider, button, toggle, dragOn, SYN, moonAge, moonName, drawMoonFace } = MG;
  const tx = MG.texts('mond');

  MG.sims.mond = host => {
    const ui = simShell(host, { label: tx('aria'), drag: true });
    const { view, ctx } = ui;
    const today = moonAge(new Date());
    let age = today, playing = false;
    const ex = 156, ey = 210, OR = 112, SPLIT = 300, BOT = 420;
    const r1 = ui.row();
    const sA = slider(r1, { label: tx('slider'), min: 0, max: 29.5, step: 0.1, value: +age.toFixed(1), format: v => fmt(v, 1), onInput: v => { age = v; } });
    const r2 = ui.row();
    button(r2, tx('btnToday'), () => { age = today; sA.set(+age.toFixed(1)); });
    const play = toggle(r2, tx('btnPlay'), playing, v => { playing = v; });
    ui.readout();
    ui.hint(tx('hint'));
    function set(p) {
      const th = Math.atan2(-(p.y - ey), p.x - ex);         // mathematical angle
      let e = th - Math.PI; e = ((e % TAU) + TAU) % TAU;     // elongation: 0 = new moon (towards the sun)
      age = e / TAU * SYN; sA.set(+age.toFixed(1));
      if (playing) { playing = false; play.set(false); }
    }
    dragOn(view, {
      down: p => { if (p.x > SPLIT || p.y > BOT) return false; set(p); },
      move: p => set(p)
    });
    const dateOf = a => {
      const d = new Date(Date.now() + (a - today) * 86400000);
      return d.toLocaleDateString(t('locale'), { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      if (playing) { age = (age + dt * 2) % SYN; sA.set(+age.toFixed(1)); }
      const f = age / SYN;
      const e = f * TAU, th = Math.PI + e;
      const mx = ex + Math.cos(th) * OR, my = ey - Math.sin(th) * OR;
      ctx.fillStyle = C.navy; ctx.fillRect(0, 0, SPLIT, BOT);
      ctx.fillStyle = C.paleGreen; ctx.fillRect(SPLIT, 0, W - SPLIT, BOT);
      ctx.fillStyle = C.white; ctx.fillRect(0, BOT, W, H - BOT);
      // sunlight from the left
      ctx.fillStyle = C.yellow; ctx.fillRect(0, 0, 14, BOT);
      for (let y = 80; y < BOT - 30; y += 80) arrow(ctx, 20, y, 28, 0, C.yellow, 3, 10);
      text(ctx, tx('sunlight'), 24, 32, FS.s, C.yellow);
      // orbit
      ctx.setLineDash([6, 8]); circle(ctx, ex, ey, OR, null, C.white, 2); ctx.setLineDash([]);
      // earth: day and night side
      circle(ctx, ex, ey, 28, C.blue2);
      ctx.fillStyle = C.black; ctx.beginPath(); ctx.arc(ex, ey, 28, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fill();
      circle(ctx, ex, ey, 28, null, C.white, 2);
      text(ctx, tx('earth'), ex, ey + 54, FS.s, C.white, 500, 'center');
      // moon (from above): left half lit
      circle(ctx, mx, my, 18, C.black);
      ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(mx, my, 18, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); ctx.fill();
      circle(ctx, mx, my, 18, null, C.white, 2);
      ctx.strokeStyle = C.yellowPastel; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(mx, my); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, tx('moon'), clamp(mx, 50, SPLIT - 40), my < ey ? my - 28 : my + 44, FS.s, C.white, 500, 'center');
      text(ctx, tx('topView'), 24, BOT - 16, FS.s, C.white);
      // view from the earth
      drawMoonFace(ctx, 450, 196, 112, age, C.navy, C.yellowPastel);
      const illum = (1 - Math.cos(e)) / 2;
      text(ctx, tx('asSeen'), 450, 48, FS.s, C.black, 500, 'center');
      text(ctx, moonName(age).toUpperCase(), 450, 352, FS.m, C.black, 500, 'center');
      text(ctx, tx('lit', fmt(illum * 100)), 450, 386, FS.s, C.black, 500, 'center');
      // row of phases
      for (let i = 0; i < 8; i++) drawMoonFace(ctx, 60 + i * 69, 486, 24, i / 8 * SYN, C.navy, C.yellowPastel);
      const idx = Math.round(age / SYN * 8) % 8;
      ctx.strokeStyle = C.black; ctx.lineWidth = 3; ctx.strokeRect(60 + idx * 69 - 32, 454, 64, 64);
      text(ctx, tx('newMoon'), 30, 556, FS.s, C.black, 500, 'left');
      text(ctx, tx('fullMoon'), 60 + 4 * 69, 556, FS.s, C.black, 500, 'center');
      text(ctx, dateOf(age), 584, 590, FS.s, C.black, 500, 'right');
      readT -= dt;
      if (readT <= 0) {
        readT = 0.25;
        ui.setRead(tx('read', moonName(age), fmt(age, 1), fmt(illum * 100), fmt(SYN - age, 1)));
      }
    }
    return { frame };
  };
})();
