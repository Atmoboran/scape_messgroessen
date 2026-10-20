// Messgrößen – display (start page), "Warum messen?", the page of each of
// the 10 topics (poster, strip, simulation, Merke box, tasks, topics, pager),
// hash routing and the animation loop.
(() => {
  'use strict';
  const { data, sims, moonAge, moonName, drawMoonFace, sunTimes, dayOfYear, hhmm, C } = MG;
  const TH = THEME.messgroessen;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const VARS = data.topics.map((v, index) => ({ ...v, index }));
  const BY_ID = Object.fromEntries(VARS.map(v => [v.id, v]));
  const Q = id => window.TEXTS.topics[id] || {};
  const TL = id => window.TEXTS.tiles[id] || {};
  const SUFFIX = THEME.brand.titleSuffix || '';

  // ---- poster headers: colour fields, solid shape, outline -----------------
  function paintPoster(el, c, l2, l3) {
    ['f1', 'f2', 'f3', 'shape', 'outline'].forEach(k => el.style.setProperty('--' + k, c[k]));
    $('.l2', el).innerHTML = TH.shapes[l2] || '';
    $('.l3', el).innerHTML = TH.outlines[l3] || '';
  }

  // ---- start page: the display of the station, its fields grouped by topic ---
  function buildDisplay() {
    const host = $('#display');
    const now = new Date(), sun = sunTimes(dayOfYear(now));
    for (const v of VARS) {
      const list = data.tiles.filter(x => x.topic === v.id);
      const wrap = document.createElement('div');
      wrap.className = 'group';
      wrap.style.setProperty('--n', list.length);
      const title = document.createElement('a');
      title.className = 'gtitle';
      title.href = '#' + v.id;
      title.textContent = Q(v.id).name;
      const tiles = document.createElement('div');
      tiles.className = 'gtiles';
      wrap.append(title, tiles);
      for (const d of list) {
        const q = TL(d.id);
        const a = document.createElement('a');
        a.className = 'tile';
        a.href = '#' + v.id;
        a.style.setProperty('--tile', TH.groups[v.theme].tile);
        a.innerHTML = `<svg class="ic" viewBox="0 0 100 100" aria-hidden="true">${TH.icons[d.icon] || ''}</svg><span class="go" aria-hidden="true">→</span><span class="t-name"></span>`;
        $('.t-name', a).textContent = q.tileName || q.name;
        const val = document.createElement('span');
        val.className = 't-val';
        let shown;
        if (d.live === 'moon') {
          shown = moonName(moonAge(now));
          val.classList.add('moon-val');
          val.innerHTML = '<canvas class="moon" width="104" height="104" aria-hidden="true"></canvas><span class="t-note"></span>';
          $('.t-note', val).textContent = shown;
        } else {
          const sample = d.live === 'rise' ? hhmm(sun.rise) : d.live === 'set' ? hhmm(sun.set) : q.sample;
          val.innerHTML = '<span class="v"></span><span class="t-unit"></span>' + (q.sampleNote ? '<span class="t-note"></span>' : '');
          $('.v', val).textContent = sample;
          $('.t-unit', val).textContent = q.unit;
          if (q.sampleNote) $('.t-note', val).textContent = q.sampleNote;
          shown = sample ? sample + ' ' + q.unit : '';
        }
        a.setAttribute('aria-label', t('start.tileAria', q.name, shown, Q(v.id).name));
        a.appendChild(val);
        tiles.appendChild(a);
      }
      host.appendChild(wrap);
    }
    const mc = $('#display canvas.moon');
    if (mc) drawMoonFace(mc.getContext('2d'), 52, 52, 46, moonAge(now), C.black, C.white);
  }

  // ---- page of one topic ---------------------------------------------------
  const strip = $('#strip');
  function buildStrip() {
    for (const v of VARS) {
      const a = document.createElement('a');
      a.href = '#' + v.id;
      a.dataset.id = v.id;
      a.textContent = Q(v.id).name;
      strip.appendChild(a);
    }
  }

  const frame = $('#simFrame'), ctrl = $('#simCtrl');
  const badge = SCAPE.badge(frame);
  const tasksBox = $('#mg-tasks'), merke = $('.merke[data-for="mg-tasks"]');
  // the first hint disappears with the first touch on the simulation or its controls
  frame.addEventListener('pointerdown', () => badge.hide());
  ['input', 'click', 'pointerdown'].forEach(ev => ctrl.addEventListener(ev, () => badge.hide()));

  let sim = null, tasks = null;
  // progress in the header of the closed task dropdown, e.g. "1/2"
  function countTasks() {
    const all = $$('li[data-task]', tasksBox), done = all.filter(li => li.classList.contains('done'));
    $('#tasksDrop .count').textContent = done.length + '/' + all.length;
  }
  // one question: { q, answer, tol, unit } (number) or { q, options, answer } (pick one)
  let quizId = 0;
  function buildTask(id, task) {
    const li = document.createElement('li');
    li.dataset.task = id;
    li.innerHTML = '<span class="box"></span><div class="quiz"><p></p><div class="quiz-row"></div><p class="quiz-fb" aria-live="polite"></p></div>';
    $('p', li).textContent = task.q;
    const row = $('.quiz-row', li), fb = $('.quiz-fb', li);
    const answer = ok => {
      fb.textContent = ok ? t('kit.right') : t('kit.wrong');
      fb.classList.toggle('ok', ok); fb.classList.toggle('no', !ok);
      if (ok && tasks && tasks.done(id)) countTasks();
    };
    if (task.options) {
      task.options.forEach((o, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'btn'; b.textContent = o;
        b.addEventListener('click', () => {
          $$('.btn', row).forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
          answer(i === task.answer);
        });
        row.appendChild(b);
      });
    } else {
      const inp = document.createElement('input');
      inp.type = 'text'; inp.inputMode = 'decimal'; inp.id = 'quiz' + (++quizId);
      inp.setAttribute('aria-label', task.q);
      const unit = document.createElement('span'); unit.className = 'quiz-unit'; unit.textContent = task.unit || '';
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn'; b.textContent = t('kit.check');
      const check = () => {
        const v = parseFloat(inp.value.replace(/\s/g, '').replace('−', '-').replace(',', '.'));
        answer(!isNaN(v) && Math.abs(v - task.answer) <= (task.tol || 0));
      };
      b.addEventListener('click', check);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
      row.append(inp, unit, b);
    }
    return li;
  }
  function showDetail(v) {
    const q = Q(v.id);
    const c = TH.groups[v.theme];
    const sec = $('#page-detail');
    sec.style.setProperty('--accent-pale', c.pale);
    paintPoster($('#dPoster'), c, v.l2, v.l3);
    $('#dKicker').textContent = t('detail.kicker', v.index + 1, VARS.length, q.unit);
    $('#dHead').innerHTML = q.head;
    $('#dLead').textContent = q.lead;
    $('#dMerke').textContent = q.merke;
    ['messung', 'einordnung', 'hinweis', 'model'].forEach(k => {
      const d = $('#topic-' + k);
      d.open = false;
      $('.topic-body p', d).textContent = q[k] || '';
      d.hidden = !q[k];
    });

    // tasks: questions answered with a number or by picking an answer; all right → Merke box opens
    const ul = $('ul', tasksBox);
    ul.innerHTML = '';
    if (q.tasks) {
      for (const [id, task] of Object.entries(q.tasks)) ul.appendChild(buildTask(id, task));
      tasksBox.hidden = false;
      $('#tasksDrop').open = false;
      merke.classList.add('locked');
      tasks = SCAPE.tasks(tasksBox);
      countTasks();
    } else {
      tasksBox.hidden = true;
      merke.classList.remove('locked');
      tasks = null;
    }

    const prev = VARS[(v.index - 1 + VARS.length) % VARS.length];
    const next = VARS[(v.index + 1) % VARS.length];
    $('#dPrev').href = '#' + prev.id; $('#dPrev .t').textContent = Q(prev.id).name; $('#dPrev').setAttribute('aria-label', t('detail.prevAria', Q(prev.id).name));
    $('#dNext').href = '#' + next.id; $('#dNext .t').textContent = Q(next.id).name; $('#dNext').setAttribute('aria-label', t('detail.nextAria', Q(next.id).name));

    $$('a', strip).forEach(a => {
      const on = a.dataset.id === v.id;
      if (on) {
        a.setAttribute('aria-current', 'true');
        strip.scrollLeft = a.offsetLeft - (strip.clientWidth - a.offsetWidth) / 2;
      } else a.removeAttribute('aria-current');
    });

    // new simulation: canvas into the stage frame, controls into the right column
    $$('canvas', frame).forEach(cv => cv.remove());
    ctrl.innerHTML = '';
    sim = sims[v.sim]({ view: frame, ctrl });
    badge.show(q.badge);
  }

  // ---- routing ----------------------------------------------------------------
  let current = '';
  function route() {
    let id = location.hash.replace('#', '') || 'start';
    if (data.alias[id]) { location.replace('#' + data.alias[id]); return; }
    if (id !== 'start' && id !== 'warum' && !(id in BY_ID)) id = 'start';
    if (id === current) { window.scrollTo(0, 0); return; }
    current = id;
    const page = id in BY_ID ? 'detail' : id;
    $$('.view-page').forEach(s => { s.hidden = s.id !== 'page-' + page; });
    $$('.nav a').forEach(a => { if (a.dataset.route === page) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (page === 'detail') {
      const v = BY_ID[id];
      showDetail(v);
      document.title = t('titles.detail', Q(v.id).name) + SUFFIX;
    } else {
      sim = null;
      $$('canvas', frame).forEach(cv => cv.remove());
      ctrl.innerHTML = '';
      document.title = t(page === 'warum' ? 'titles.why' : 'titles.start') + SUFFIX;
    }
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event('resize'));   // header height / stage size
  }

  // ---- start ------------------------------------------------------------------
  for (const [key, p] of Object.entries(TH.posters)) paintPoster($(`[data-poster="${key}"]`), p, p.l2, p.l3);
  buildDisplay();
  buildStrip();
  window.addEventListener('hashchange', route);
  route();

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(1 / 30, (now - last) / 1000);
    last = now;
    if (sim && dt > 0) sim.frame(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
