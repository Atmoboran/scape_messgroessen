// TEMPERATURE – particle motion (outside) / room with heater and window (inside)
(() => {
  'use strict';
  const { C, W, H, FS, TAU, clamp, rnd, fmt, text, circle, simShell, slider, button, toggle, dragOn, tempColor, thermo, collide, particle, speedLegend } = MG;
  const tx = MG.texts('temperatur');

  MG.sims.temperatur = (host, variant) => {
    const innen = variant === 'innen';
    const ui = simShell(host, { label: innen ? tx('ariaInnen') : tx('ariaAussen'), drag: innen });
    const { view, ctx } = ui;
    const box = innen ? { x0: 16, y0: 16, x1: 584, y1: 540 } : { x0: 16, y0: 16, x1: 400, y1: 540 };
    const R = 7;
    const speedOf = T => 40 + 6 * (T + 20);            // shown: −20 °C → 40 px/s, 40 °C → 400 px/s
    const HOT = 330, COLD = 110, COLD_OPEN = 50;
    const tOfSpeed = s => innen ? 21 + (s - 220) / 12 : -20 + (s - 40) / 6;
    const realSpeed = T => Math.sqrt(8 * 8.314 * (T + 273.15) / (Math.PI * 0.02896));
    let T = 14, heater = true, windowOpen = false;
    const HOME = { x: 300, y: 278 };
    const sensor = { x: HOME.x, y: HOME.y }, RS = 80;
    let sensorT = 21, roomT = 21, dragging = false;
    const P = [];
    const N = innen ? 115 : 80;
    for (let i = 0; i < N; i++) {
      const a = rnd(0, TAU), s = innen ? 220 : speedOf(T);
      P.push({ x: rnd(box.x0 + R, box.x1 - R), y: rnd(box.y0 + R, box.y1 - R), vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: R });
    }
    const heaterY = [320, 520], windowY = [80, 300];

    function step(dt) {
      let rms = 0;
      for (const p of P) rms += p.vx * p.vx + p.vy * p.vy;
      rms = Math.sqrt(rms / P.length);
      if (!innen) {
        const f = 1 + (speedOf(T) / rms - 1) * Math.min(1, dt * 3);
        for (const p of P) { p.vx *= f; p.vy *= f; }
      }
      for (const p of P) {
        if (innen) { // warm particles rise, cold ones sink (strongly simplified)
          const s2 = (p.vx * p.vx + p.vy * p.vy) / (220 * 220);
          p.vy -= 55 * (s2 - 1) * dt;
        }
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < box.x0 + R) {
          p.x = box.x0 + R; p.vx = Math.abs(p.vx);
          if (innen && heater && p.y > heaterY[0] && p.y < heaterY[1]) { const s = Math.hypot(p.vx, p.vy); p.vx *= HOT / s; p.vy *= HOT / s; }
        }
        if (p.x > box.x1 - R) {
          p.x = box.x1 - R; p.vx = -Math.abs(p.vx);
          if (innen && p.y > windowY[0] && p.y < windowY[1]) { const c = windowOpen ? COLD_OPEN : COLD, s = Math.hypot(p.vx, p.vy); p.vx *= c / s; p.vy *= c / s; }
        }
        if (p.y < box.y0 + R) { p.y = box.y0 + R; p.vy = Math.abs(p.vy); }
        if (p.y > box.y1 - R) { p.y = box.y1 - R; p.vy = -Math.abs(p.vy); }
      }
      collide(P, W, H);
    }

    function draw() {
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = innen ? C.cream : C.yellowPale;
      ctx.fillRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      if (innen) {
        // heater
        ctx.fillStyle = heater ? C.red : C.sand;
        ctx.fillRect(box.x0, heaterY[0], 16, heaterY[1] - heaterY[0]);
        ctx.strokeStyle = C.black; ctx.lineWidth = 2;
        for (let y = heaterY[0] + 14; y < heaterY[1]; y += 22) { ctx.beginPath(); ctx.moveTo(box.x0, y); ctx.lineTo(box.x0 + 16, y); ctx.stroke(); }
        text(ctx, heater ? tx('heaterOn') : tx('heaterOff'), box.x0 + 26, heaterY[0] - 10, FS.s, C.black);
        // window
        ctx.fillStyle = windowOpen ? C.blue2 : C.ice;
        ctx.fillRect(box.x1 - 16, windowY[0], 16, windowY[1] - windowY[0]);
        ctx.strokeStyle = C.black; ctx.strokeRect(box.x1 - 16, windowY[0], 16, windowY[1] - windowY[0]);
        text(ctx, windowOpen ? tx('windowOpen') : tx('windowCold'), box.x1 - 26, windowY[0] - 10, FS.s, C.black, 500, 'right');
      }
      for (const p of P) particle(ctx, p);
      ctx.strokeStyle = C.black; ctx.lineWidth = 4; ctx.strokeRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      if (innen) {
        ctx.setLineDash([8, 7]); circle(ctx, sensor.x, sensor.y, RS, null, C.black, 2); ctx.setLineDash([]);
        ctx.fillStyle = C.black; ctx.fillRect(sensor.x - 64, sensor.y - 25, 128, 50);
        text(ctx, fmt(sensorT, 1) + ' °C', sensor.x, sensor.y + 10, 28, C.white, 500, 'center');
        if (!dragging) text(ctx, tx('dragMe'), sensor.x, sensor.y + 50, FS.s, C.black, 500, 'center');
      } else {
        thermo(ctx, 500, 100, 410, -20, 40, T, tempColor(T), t('sims.common.thermometer'), fmt(T) + ' °C');
      }
      speedLegend(ctx, W / 2, 570);
    }

    let readT = 0;
    function frame(dt) {
      if (!view.fit()) return;
      step(dt / 2); step(dt / 2);
      if (innen) {
        let s = 0, n = 0, all = 0;
        for (const p of P) {
          const v2 = p.vx * p.vx + p.vy * p.vy;
          all += v2;
          if ((p.x - sensor.x) ** 2 + (p.y - sensor.y) ** 2 < RS * RS) { s += v2; n++; }
        }
        if (n) sensorT += (tOfSpeed(Math.sqrt(s / n)) - sensorT) * Math.min(1, dt * 1.2);
        roomT += (tOfSpeed(Math.sqrt(all / P.length)) - roomT) * Math.min(1, dt * 1.2);
      }
      draw();
      readT -= dt;
      if (readT <= 0) {
        readT = 0.3;
        if (innen) ui.setRead(tx('readInnen', fmt(sensorT, 1), fmt(roomT, 1)));
        else ui.setRead(tx('readAussen', fmt(T), fmt(Math.round(realSpeed(T) / 5) * 5), fmt(Math.round(realSpeed(T) * 3.6 / 50) * 50)));
      }
    }

    if (innen) {
      const r = ui.row();
      toggle(r, tx('btnHeater'), heater, v => { heater = v; });
      toggle(r, tx('btnWindow'), windowOpen, v => { windowOpen = v; });
      button(r, tx('btnCenter'), () => { sensor.x = HOME.x; sensor.y = HOME.y; });
      dragOn(view, {
        down: p => { if (Math.hypot(p.x - sensor.x, p.y - sensor.y) > RS) return false; dragging = true; },
        move: p => { sensor.x = clamp(p.x, box.x0 + 64, box.x1 - 64); sensor.y = clamp(p.y, box.y0 + 30, box.y1 - 30); },
        up: () => { dragging = false; }
      });
      ui.readout();
      ui.hint(tx('hint.innen'));
    } else {
      const r = ui.row();
      const s = slider(r, { label: tx('slider'), min: -20, max: 40, step: 1, value: T, format: v => fmt(v) + ' °C', onInput: v => { T = v; } });
      const r2 = ui.row();
      button(r2, tx('presetFrost'), () => { T = -15; s.set(T); });
      button(r2, tx('presetMild'), () => { T = 14; s.set(T); });
      button(r2, tx('presetHot'), () => { T = 35; s.set(T); });
      ui.readout();
      ui.hint(tx('hint.aussen'));
    }
    return { frame };
  };
})();
