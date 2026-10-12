"use strict";
/* =========================================================
   App: Display, Navigation, Detailseiten, Hauptschleife
   ========================================================= */

const { groups: THEMES, shapes: L2, outlines: L3, icons: ICONS } = THEME;
const SUFFIX = THEME.brand.titleSuffix || '';

const BY_ID = Object.fromEntries(VARS.map((v, i) => [v.id, Object.assign(v, { index: i })]));

/* ---------- Display aufbauen ---------- */
function buildDisplay() {
  const host = $('#display');
  for (const g of GROUPS) {
    const list = VARS.filter(x => x.group === g.id);
    const wrap = document.createElement('div');
    wrap.className = 'group';
    wrap.style.setProperty('--n', list.length);
    wrap.innerHTML = `<div class="gtitle">${g.title}</div><div class="gtiles"></div>`;
    const tiles = wrap.querySelector('.gtiles');
    for (const v of list) {
      const a = document.createElement('a');
      a.className = 'tile';
      a.href = '#' + v.id;
      a.style.setProperty('--tile', THEMES[v.theme].tile);
      let val;
      if (v.sim === 'mond') {
        val = `<span class="t-val" style="display:flex;align-items:center;gap:10px"><canvas class="moon" width="104" height="104" aria-hidden="true"></canvas><span class="t-note" style="margin:0;white-space:normal;line-height:1.15">${moonName(moonAge(new Date()))}</span></span>`;
      } else {
        val = `<span class="t-val">${v.sample}<span class="t-unit">${v.unit}</span>${v.sampleNote ? `<span class="t-note">${v.sampleNote}</span>` : ''}</span>`;
      }
      a.innerHTML = `<svg class="ic" viewBox="0 0 100 100" aria-hidden="true">${ICONS[v.icon] || ''}</svg><span class="go" aria-hidden="true">→</span><span class="t-name">${v.name}</span>${val}`;
      a.setAttribute('aria-label', `${v.name}${v.sample ? ': ' + v.sample + ' ' + v.unit : ''} – mehr erfahren`);
      tiles.appendChild(a);
    }
    host.appendChild(wrap);
  }
  const mc = $('#display canvas.moon');
  if (mc) {
    const c = mc.getContext('2d');
    drawMoonFace(c, 52, 52, 46, moonAge(new Date()), C.black, C.white);
  }
}

/* ---------- Detailseite ---------- */
function buildStrip() {
  const strip = $('#strip');
  strip.innerHTML = VARS.map(v => `<a href="#${v.id}" data-id="${v.id}">${v.name}</a>`).join('');
}

let sim = null;
function showDetail(v) {
  const th = THEMES[v.theme];
  const sec = $('#page-detail');
  sec.style.setProperty('--accent', th.accent);
  sec.style.setProperty('--accent-pale', th.pale);
  paintPoster($('#dPoster'), th, v.l2, v.l3);
  const nr = v.index + 1;
  $('#dKicker').textContent = `Messgröße ${nr} von ${VARS.length}${v.unit ? ' · Einheit: ' + v.unit : ''}`;
  $('#dHead').innerHTML = v.head.join('<br>');
  $('#dLead').textContent = v.lead;
  $('#dMessung').textContent = v.messung;
  $('#dEinordnung').textContent = v.einordnung;
  $('#dHinweis').textContent = v.hinweis;

  const prev = VARS[(v.index - 1 + VARS.length) % VARS.length];
  const next = VARS[(v.index + 1) % VARS.length];
  $('#dPrev').href = '#' + prev.id; $('#dPrev .t').textContent = prev.name;
  $('#dNext').href = '#' + next.id; $('#dNext .t').textContent = next.name;

  $$('#strip a').forEach(a => {
    const on = a.dataset.id === v.id;
    if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    if (on) a.scrollIntoView({ block: 'nearest', inline: 'center' });
  });

  if (sim && sim.destroy) sim.destroy();
  const view = $('#simView'), ctrl = $('#simCtrl');
  view.innerHTML = ''; ctrl.innerHTML = '';
  sim = SIMS[v.sim]({ view, ctrl }, v.variant);
}

/* ---------- Navigation ---------- */
let current = '';
function route() {
  let id = location.hash.replace('#', '') || 'start';
  if (id !== 'start' && id !== 'warum' && !(id in BY_ID)) id = 'start';
  if (id === current) { window.scrollTo(0, 0); return; }
  current = id;
  const page = id in BY_ID ? 'detail' : id;
  $$('.stage').forEach(s => { s.hidden = s.id !== 'page-' + page; });
  $$('.nav a').forEach(a => { if (a.dataset.route === page) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  if (page === 'detail') {
    const v = BY_ID[id];
    showDetail(v);
    document.title = `${v.name} – Messgrößen${SUFFIX}`;
  } else {
    if (sim && sim.destroy) sim.destroy();
    sim = null;
    document.title = 'Messgrößen der Wetterstation' + SUFFIX;
  }
  window.scrollTo(0, 0);
}

/* ---------- Ausstellungsmodus: nach längerer Ruhe zurück zum Display ---------- */
const IDLE_MS = 3 * 60 * 1000;
let idleTimer = 0;
function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { if (location.hash && location.hash !== '#start') location.hash = '#start'; }, IDLE_MS);
}
['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => window.addEventListener(ev, resetIdle, { passive: true }));

/* ---------- Plakatköpfe ---------- */
function paintPoster(el, th, l2, l3) {
  el.style.setProperty('--f1', th.f1);
  el.style.setProperty('--f2', th.f2);
  el.style.setProperty('--f3', th.f3);
  $('.l2', el).innerHTML = L2[l2](th.l2);
  const o = $('.l3', el);
  o.innerHTML = L3[l3];
  o.setAttribute('stroke', th.l3);
}

/* ---------- Start ---------- */
for (const [key, p] of Object.entries(THEME.posters)) {
  paintPoster($(`[data-poster="${key}"]`), { f1: p.f1, f2: p.f2, f3: p.f3, l2: p.l2c, l3: p.l3c }, p.l2, p.l3);
}
$('#whyLead').textContent = INTRO.text[0];
$('#why2').textContent = INTRO.text[1];
buildDisplay();
buildStrip();
window.addEventListener('hashchange', route);
route();
resetIdle();

let last = performance.now();
function loop(now) {
  const dt = Math.min(1 / 30, (now - last) / 1000);
  last = now;
  if (sim && dt > 0) sim.frame(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
