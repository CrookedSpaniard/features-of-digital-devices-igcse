FD.add({
  id: 'storage',
  title: 'Storage',
  icon: 'storage',
  color: '--c3',
  feature: true,
  interactive: true,
  vocab: [
    ['file', 'a collection of data that represents a document, image, database or similar'],
    ['program', 'a set of instructions that are carried out by the processor'],
  ],
  mount(el) {
    const ITEMS = [
      { k: 'docs', label: 'Documents', e: '📄', gb: 1, type: 'file' },
      { k: 'photos', label: 'Photos', e: '📷', gb: 8, type: 'file' },
      { k: 'music', label: 'Music', e: '🎵', gb: 6, type: 'file' },
      { k: 'film', label: 'Film', e: '🎬', gb: 4, type: 'file' },
      { k: 'app', label: 'App', e: '🧩', gb: 2, type: 'prog' },
      { k: 'game', label: 'Game', e: '🎮', gb: 60, type: 'prog' },
    ];
    let cap = 128, used = [], token = 0;

    el.innerHTML = `
      <div class="store">
        <div class="store-top">
          <div class="seg" id="capSeg"><span class="seg-l">Device storage</span><button data-v="32">32 GB</button><button data-v="128">128 GB</button><button data-v="512">512 GB</button></div>
          <p class="store-read"><b id="sUsed">0</b> GB used of <b id="sCap"></b> GB · <span id="sFree"></span> GB free</p>
        </div>
        <div class="sbar" id="sBar" aria-label="Storage used"></div>
        <div class="slegend"><span><i class="file"></i>Files (data)</span><span><i class="prog"></i>Programs (instructions)</span><span class="muted">Click a block on the bar to delete it.</span></div>
        <div class="sadd">
          ${ITEMS.map((it) => `<button class="sitem ${it.type}" data-k="${it.k}"><span class="e">${it.e}</span><span>${it.label}<small>${it.type === 'file' ? 'file' : 'program'} · ${it.gb} GB</small></span></button>`).join('')}
        </div>
        <p class="smsg" id="sMsg" aria-live="polite"></p>
        <div class="race" id="race" hidden>
          <p class="race-t">Loading the same game into RAM…</p>
          <div class="race-row"><span>HDD</span><span class="bar"><i id="rHdd"></i></span><b id="rHddT"></b></div>
          <div class="race-row"><span>SSD</span><span class="bar"><i id="rSsd"></i></span><b id="rSsdT"></b></div>
          <button class="btn small-btn" id="raceBtn">▶ Race again</button>
        </div>
      </div>`;
    const $ = (s) => el.querySelector(s);
    const bar = $('#sBar'), msg = $('#sMsg'), seg = $('#capSeg');

    function render() {
      const total = used.reduce((n, u) => n + u.gb, 0);
      $('#sUsed').textContent = total;
      $('#sCap').textContent = cap;
      $('#sFree').textContent = cap - total;
      [...bar.children].forEach((s) => s.style.setProperty('--w', (s._item.gb / cap * 100) + '%'));
      bar.classList.toggle('full', cap - total < 1);
    }
    function add(k) {
      const it = ITEMS.find((x) => x.k === k);
      const total = used.reduce((n, u) => n + u.gb, 0);
      if (total + it.gb > cap) {
        FD.shake(bar);
        msg.innerHTML = `<strong class="bad">✗ Storage full!</strong> The ${it.label.toLowerCase()} needs ${it.gb} GB but only ${cap - total} GB is free. Delete something or choose a device with more storage.`;
        return false;
      }
      const u = { ...it };
      used.push(u);
      const s = FD.h(`<button class="sseg ${it.type}" title="${it.label} (${it.gb} GB) · click to delete"><span>${it.e}</span></button>`);
      s._item = u;
      s.style.setProperty('--w', '0%');
      s.addEventListener('click', () => {
        used = used.filter((x) => x !== u);
        s.remove();
        render();
        msg.textContent = `${it.label} deleted · ${it.gb} GB freed.`;
      });
      bar.appendChild(s);
      requestAnimationFrame(() => render());
      msg.innerHTML = `<strong class="good">✓ ${it.label} saved</strong> (${it.type === 'file' ? 'a file' : 'a program'}, ${it.gb} GB).`;
      return true;
    }
    function setCap(c) {
      cap = +c;
      FD.segSet(seg, cap);
      used = [];
      bar.innerHTML = '';
      msg.textContent = '';
      render();
    }
    FD.seg(seg, (v) => setCap(v));
    el.querySelectorAll('.sitem').forEach((b) => b.addEventListener('click', () => add(b.dataset.k)));

    async function race() {
      const my = ++token;
      const rows = [['#rHdd', '#rHddT', 3200], ['#rSsd', '#rSsdT', 900]];
      rows.forEach(([b, tt]) => { $(b).style.transition = 'none'; $(b).style.width = '0%'; $(tt).textContent = ''; });
      void bar.offsetWidth;
      rows.forEach(([b, tt, ms]) => {
        $(b).style.transition = `width ${FD.dur(ms)}ms linear`;
        $(b).style.width = '100%';
        setTimeout(() => { if (my === token) $(tt).textContent = 'loaded ✓'; }, FD.dur(ms));
      });
      await FD.wait(3300);
    }
    $('#raceBtn').addEventListener('click', race);
    setCap(128);

    return {
      setCap,
      add,
      race(show) { $('#race').hidden = !show; return show ? race() : null; },
      destroy() { token++; },
    };
  },
  steps: [
    {
      title: 'What is storage?',
      text: `<p><strong>Files</strong> and <strong>programs</strong> are kept in storage.</p>
             <ul><li>A <strong>file</strong> is data, such as a document, photo or song.</li><li>A <strong>program</strong> is a set of instructions carried out by the processor.</li></ul>`,
      async on(a, ctx) {
        a.race(false); a.setCap(128);
        for (const k of ['docs', 'app', 'photos']) { if (!(await ctx.sleep(600))) return; a.add(k); }
      },
    },
    {
      title: 'More storage, more files',
      text: `<p><strong>More available storage</strong> allows users to store <strong>more files and programs</strong>.</p>
             <p>A 512 GB device has room for a big game <em>and</em> lots of photos, music and films.</p>`,
      async on(a, ctx) {
        a.race(false); a.setCap(512);
        for (const k of ['game', 'photos', 'music', 'film', 'app', 'game', 'photos']) { if (!(await ctx.sleep(450))) return; a.add(k); }
      },
    },
    {
      title: 'Running out of space',
      text: `<p>A device with <strong>less storage</strong> fills up quickly.</p>
             <p>When it is full, you cannot save new files or install new programs until you delete something.</p>`,
      async on(a, ctx) {
        a.race(false); a.setCap(32);
        for (const k of ['photos', 'music', 'film', 'app', 'photos', 'game']) { if (!(await ctx.sleep(550))) return; a.add(k); }
      },
    },
    {
      title: 'Storage speed matters too',
      text: `<p>Storage <strong>speed</strong> also affects <strong>performance</strong>, as you saw in the previous section.</p>
             <p>Programs and files load into RAM faster from fast storage, such as an SSD.</p>`,
      on(a) { a.setCap(128); return a.race(true); },
    },
    {
      title: 'Try it',
      text: `<p>Choose a storage size, then add files and programs until the device is full.</p>
             <p>Click a block on the bar to delete it. Which device would suit a gamer?</p>`,
      on(a) { a.race(false); a.setCap(128); },
    },
  ],
});
