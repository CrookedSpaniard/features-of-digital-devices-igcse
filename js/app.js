(() => {
  'use strict';
  const FD = window.FD, S = FD.scenes;
  const $ = (s) => document.querySelector(s);
  const tabsEl = $('#tabs'), stageEl = $('#stage'), pageEl = $('#page'), labEl = $('#lab');
  const btnPlay = $('#btnPlay');

  let cur = -1, step = 0, api = {}, playing = false, run = 0, timer = null, demo = false;

  // ---------- tabs ----------
  let featureNo = 0;
  S.forEach((sc, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    const n = sc.feature ? `<b>${++featureNo}</b>` : '';
    b.innerHTML = `${FD.icon[sc.icon] || ''}${n}<span>${sc.tab || sc.title}</span>`;
    b.style.setProperty('--c', `var(${sc.color || '--accent'})`);
    b.addEventListener('click', () => { pause(); go(i, 0); });
    tabsEl.appendChild(b);
  });

  const stepsOf = (sc) => (sc.page ? 1 : sc.steps.length);
  const totalSteps = S.reduce((n, sc) => n + stepsOf(sc), 0);

  // ---------- scenes ----------
  function mount(i) {
    run++;
    clearTimeout(timer);
    demo = false;
    if (api && api.destroy) api.destroy();
    cur = i;
    const sc = S[i];
    document.documentElement.style.setProperty('--scene', `var(${sc.color || '--accent'})`);
    labEl.hidden = !!sc.page;
    pageEl.hidden = !sc.page;
    const host = sc.page ? pageEl : stageEl;
    host.innerHTML = '';
    host.className = sc.page ? 'page page-' + sc.id : 'stage stage-' + sc.id;
    if (!sc.page) {
      $('#sceneTitle').textContent = sc.title;
      $('#sceneIc').innerHTML = FD.icon[sc.icon] || '';
      $('#tryBadge').hidden = !sc.interactive;
      renderVocab(sc);
    }
    api = sc.mount(host) || {};
    [...tabsEl.children].forEach((b, k) => {
      b.classList.toggle('active', k === i);
      if (k === i) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    const tab = tabsEl.children[i];
    const tr = tab.getBoundingClientRect(), nr = tabsEl.getBoundingClientRect();
    tabsEl.scrollBy({ left: tr.left - nr.left - nr.width / 2 + tr.width / 2, behavior: 'smooth' });
    try { history.replaceState(null, '', '#' + sc.id); } catch (e) { /* file:// */ }
  }

  function renderVocab(sc) {
    const box = $('#vocab');
    box.hidden = !(sc.vocab && sc.vocab.length);
    if (box.hidden) return;
    $('#vocabList').innerHTML = sc.vocab.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join('');
  }

  function go(i, k = 0) {
    if (i !== cur) {
      mount(i);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    showStep(k);
  }

  async function showStep(k) {
    const sc = S[cur];
    if (sc.page) {
      step = 0;
      updateProgress();
      if (playing) pause();
      return;
    }
    step = Math.max(0, Math.min(k, sc.steps.length - 1));
    const st = sc.steps[step];
    const id = ++run;
    clearTimeout(timer);

    $('#stepCount').textContent = `Step ${step + 1} of ${sc.steps.length}`;
    $('#stepTitle').textContent = st.title;
    $('#stepText').innerHTML = st.text;
    const tip = $('#stepTip');
    tip.hidden = !st.tip;
    tip.innerHTML = st.tip || '';
    const nar = $('#narration');
    nar.classList.remove('enter');
    void nar.offsetWidth;
    nar.classList.add('enter');
    updateProgress();

    const ctx = {
      alive: () => id === run,
      sleep: async (ms) => { await FD.wait(ms); return id === run; },
    };
    demo = true;
    try { await (st.on && st.on(api, ctx)); } catch (e) { console.error(e); }
    if (id !== run) return;
    demo = false;
    if (playing) timer = setTimeout(() => { if (id === run) next(); }, FD.dur(readTime(st)));
  }

  function readTime(st) {
    const words = (st.title + ' ' + st.text + ' ' + (st.tip || '')).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    return Math.max(4000, words * 330);
  }

  function next() {
    const sc = S[cur];
    if (!sc.page && step < sc.steps.length - 1) return showStep(step + 1);
    if (cur < S.length - 1) go(cur + 1, 0);
    else pause();
  }
  function back() {
    const sc = S[cur];
    if (!sc.page && step > 0) return showStep(step - 1);
    if (cur > 0) {
      const p = S[cur - 1];
      go(cur - 1, p.page ? 0 : p.steps.length - 1);
    }
  }
  function restart() { pause(); mount(cur); showStep(0); }

  function play() {
    if (S[cur].page) return;
    playing = true;
    btnPlay.innerHTML = '❚❚ Pause';
    btnPlay.classList.add('playing');
    if (!demo) { clearTimeout(timer); timer = setTimeout(next, FD.dur(900)); }
  }
  function pause() {
    playing = false;
    clearTimeout(timer);
    btnPlay.innerHTML = '▶ Play';
    btnPlay.classList.remove('playing');
  }
  const toggle = () => (playing ? pause() : play());

  function updateProgress() {
    let n = 0;
    for (let i = 0; i < cur; i++) n += stepsOf(S[i]);
    n += step + 1;
    $('#progressFill').style.width = (100 * n / totalSteps) + '%';
    $('#btnBack').disabled = cur === 0 && step === 0;
    $('#btnNext').disabled = cur === S.length - 1;
  }

  // Any click inside the stage hands control to the user.
  stageEl.addEventListener('pointerdown', () => {
    if (playing) pause();
    if (demo) { run++; demo = false; }
  }, true);

  FD.goto = (id) => {
    const i = S.findIndex((s) => s.id === id);
    if (i >= 0) { pause(); go(i, 0); }
  };

  // ---------- controls ----------
  btnPlay.addEventListener('click', toggle);
  $('#btnNext').addEventListener('click', () => { pause(); next(); });
  $('#btnBack').addEventListener('click', () => { pause(); back(); });
  $('#btnReset').addEventListener('click', restart);
  $('#speed').addEventListener('change', (e) => { FD.speed = +e.target.value; });

  function setProjector(on) {
    document.body.classList.toggle('projector', on);
    $('#btnProjector').setAttribute('aria-pressed', on);
    try { localStorage.setItem('fd-projector', on ? '1' : '0'); } catch (e) { /* ignore */ }
  }
  $('#btnProjector').addEventListener('click', () => setProjector(!document.body.classList.contains('projector')));
  try { if (localStorage.getItem('fd-projector') === '1') setProjector(true); } catch (e) { /* ignore */ }

  function fullScreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  }
  $('#btnFull').addEventListener('click', fullScreen);

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === ' ' && !e.target.closest('button')) { e.preventDefault(); toggle(); }
    else if (k === 'ArrowRight') { pause(); next(); }
    else if (k === 'ArrowLeft') { pause(); back(); }
    else if (k === 'r' || k === 'R') restart();
    else if (k === 'p' || k === 'P') setProjector(!document.body.classList.contains('projector'));
    else if (k === 'f' || k === 'F') fullScreen();
  });

  // ---------- start ----------
  const fromHash = S.findIndex((s) => '#' + s.id === location.hash);
  go(fromHash >= 0 ? fromHash : 0, 0);
})();
