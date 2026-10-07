"use strict";
/* =========================================================
   App: Display, Navigation, Detailseiten, Hauptschleife
   ========================================================= */

/* Linien-Icons für die Display-Felder (Ebene 3, angeschnitten) */
const ICONS = {
  sonne:   '<circle cx="50" cy="50" r="22"/><path d="M50 8V20M50 80V92M8 50H20M80 50H92M20 20L29 29M71 71L80 80M20 80L29 71M71 29L80 20"/>',
  haus:    '<path d="M12 48L50 14L88 48V90H12Z"/><rect x="40" y="58" width="20" height="32"/>',
  tropfen: '<path d="M50 8C50 8 20 48 20 64a30 30 0 0 0 60 0C80 48 50 8 50 8Z"/>',
  fenster: '<rect x="14" y="10" width="72" height="80"/><path d="M50 10V90M14 50H86"/><circle cx="30" cy="70" r="3"/><circle cx="66" cy="30" r="3"/><circle cx="70" cy="66" r="3"/>',
  nebel:   '<path d="M8 36H70M24 52H92M8 68H76M30 84H90"/>',
  druck:   '<circle cx="50" cy="50" r="40"/><path d="M50 50L76 30"/><circle cx="50" cy="50" r="4"/>',
  regen:   '<path d="M22 60a16 16 0 0 1 4 -32a22 22 0 0 1 42 4a14 14 0 0 1 -2 28Z"/><path d="M34 70L30 82M52 70L48 82M70 70L66 82"/>',
  kompass: '<circle cx="50" cy="50" r="40"/><path d="M50 14L58 50L50 86L42 50Z"/>',
  wind:    '<path d="M8 40H64a12 12 0 1 0 -12 -12M8 60H80a12 12 0 1 1 -12 12"/>',
  boee:    '<path d="M6 70L22 60L34 66L48 30L60 62L74 54L94 58"/>',
  person:  '<circle cx="50" cy="22" r="12"/><path d="M28 92V58a22 22 0 0 1 44 0V92"/>',
  licht:   '<circle cx="50" cy="44" r="22"/><path d="M40 72H60M42 82H58"/>',
  mond:    '<path d="M62 12a40 40 0 1 0 0 76a32 32 0 1 1 0 -76Z"/>'
};

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
  const poster = $('#dPoster');
  poster.style.setProperty('--f1', th.f1);
  poster.style.setProperty('--f2', th.f2);
  poster.style.setProperty('--f3', th.f3);
  $('#dL2').innerHTML = L2[v.l2](th.l2);
  const l3 = $('#dL3');
  l3.innerHTML = L3[v.l3];
  l3.setAttribute('stroke', th.l3);
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
  const host = $('#simHost');
  host.innerHTML = '';
  sim = SIMS[v.sim](host, v.variant);
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
    document.title = `${v.name} – Messgrößen – SCAPE°`;
  } else {
    if (sim && sim.destroy) sim.destroy();
    sim = null;
    document.title = 'Messgrößen der Wetterstation – SCAPE°';
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

/* ---------- Start ---------- */
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
