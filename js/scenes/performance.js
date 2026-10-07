FD.add({
  id: 'performance',
  title: 'Performance',
  icon: 'performance',
  color: '--c2',
  feature: true,
  interactive: true,
  vocab: [
    ['processor', 'one or more Central Processing Units (CPUs) that carry out software instructions'],
    ['RAM', 'Random Access Memory: the memory used for running software'],
    ['virtual memory', 'storage used by the processor once the space in RAM has run out'],
  ],
  mount(el) {
    const PROGS = [
      ['Browser', '#1c7ed6'], ['Music', '#e64980'], ['Game', '#7048e8'], ['Editor', '#2b8a3e'], ['Chat', '#f08c00'],
    ];
    const DEFAULT = { cpu: '1.5', ram: '6', store: 'ssd', soft: 'good' };
    let cfg = { ...DEFAULT }, token = 0, running = false, t = 0;

    el.innerHTML = `
      <div class="perf">
        <div class="perf-flow">
          <div class="pbox" data-part="storage">
            <h4>Storage <span class="tag" id="stTag"></span></h4>
            <div class="chips" id="pStore"></div>
            <div class="vm" id="pVM"><span class="vm-l">Virtual memory <small>(overflow on storage)</small></span><div class="chips" id="pVMc"></div></div>
          </div>
          <div class="parrow" aria-hidden="true">➜</div>
          <div class="pbox" data-part="ram">
            <h4>RAM <span class="tag" id="ramTag"></span></h4>
            <div class="slots" id="pRAM"></div>
          </div>
          <div class="parrow" aria-hidden="true">➜</div>
          <div class="pbox" data-part="cpu">
            <h4>Processor <span class="tag" id="cpuTag"></span></h4>
            <div class="cpu" id="cpu">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <g class="pins">${[22, 38, 54, 70].map((p) => `<rect x="${p}" y="4" width="6" height="12" rx="2"/><rect x="${p}" y="84" width="6" height="12" rx="2"/><rect x="4" y="${p}" width="12" height="6" rx="2"/><rect x="84" y="${p}" width="12" height="6" rx="2"/>`).join('')}</g>
                <rect x="16" y="16" width="68" height="68" rx="10" class="chip-body"/>
                <circle cx="50" cy="50" r="20" class="cpu-ring"/>
                <text x="50" y="55" text-anchor="middle" class="cpu-txt">CPU</text>
              </svg>
            </div>
            <p class="cpu-now" id="cpuNow">Idle</p>
          </div>
        </div>
        <div class="perf-ctl">
          <div class="seg" data-key="cpu"><span class="seg-l">Processor</span><button data-v="1.5">1.5 GHz</button><button data-v="3.5">3.5 GHz</button></div>
          <div class="seg" data-key="ram"><span class="seg-l">RAM</span><button data-v="3">4 GB</button><button data-v="6">16 GB</button></div>
          <div class="seg" data-key="store"><span class="seg-l">Storage</span><button data-v="hdd">HDD · slow</button><button data-v="ssd">SSD · fast</button></div>
          <div class="seg" data-key="soft"><span class="seg-l">Software</span><button data-v="bad">Inefficient</button><button data-v="good">Efficient</button></div>
          <button class="btn primary" id="pRun">▶ Open 5 programs</button>
        </div>
        <div class="perf-out">
          <div class="timer" aria-live="off"><span id="pTime">0.0</span><small> s</small><em>simulated time</em></div>
          <ol class="runs" id="pRuns"><li class="empty">Results of each run appear here.</li></ol>
        </div>
      </div>`;

    const $ = (s) => el.querySelector(s);
    const segs = [...el.querySelectorAll('.seg')];
    const store = $('#pStore'), vm = $('#pVM'), vmc = $('#pVMc'), ram = $('#pRAM'), cpuEl = $('#cpu'), now = $('#cpuNow');
    const timeEl = $('#pTime'), runsEl = $('#pRuns'), runBtn = $('#pRun');

    segs.forEach((s) => FD.seg(s, (v) => { cfg[s.dataset.key] = v; reset(); }));

    function reset() {
      token++;
      running = false;
      segs.forEach((s) => FD.segSet(s, cfg[s.dataset.key]));
      el.querySelectorAll('.seg button, #pRun').forEach((b) => (b.disabled = false));
      $('#stTag').textContent = cfg.store === 'ssd' ? 'SSD' : 'HDD';
      $('#ramTag').textContent = cfg.ram === '6' ? '16 GB' : '4 GB';
      $('#cpuTag').textContent = cfg.cpu + ' GHz';
      store.innerHTML = PROGS.map(([n, c]) => `<span class="pchip" style="--pc:${c}">${n}</span>`).join('');
      vmc.innerHTML = '';
      vm.classList.remove('used');
      ram.innerHTML = Array.from({ length: +cfg.ram }, () => '<span class="slot"></span>').join('');
      cpuEl.classList.remove('busy');
      cpuEl.style.setProperty('--spin', (cfg.cpu === '3.5' ? 0.45 : 1.1) + 's');
      now.textContent = 'Idle';
      t = 0;
      timeEl.textContent = '0.0';
    }

    function addTime(sec, ms, my) {
      const start = t, t0 = performance.now(), d = FD.dur(ms);
      return new Promise((res) => {
        const f = (n) => {
          if (my !== token) return res(false);
          const k = Math.min(1, (n - t0) / d);
          timeEl.textContent = (start + sec * k).toFixed(1);
          if (k < 1) requestAnimationFrame(f);
          else { t = start + sec; res(true); }
        };
        requestAnimationFrame(f);
      });
    }

    async function runSim() {
      if (running) return null;
      reset();
      const my = token;
      running = true;
      el.querySelectorAll('.seg button, #pRun').forEach((b) => (b.disabled = true));
      const ssd = cfg.store === 'ssd';
      const loadSec = ssd ? 0.3 : 0.9;
      const cpuSec = (1.2 / (+cfg.cpu / 1.5)) * (cfg.soft === 'bad' ? 1.6 : 1);
      const swapSec = ssd ? 0.8 : 2.0;
      const chips = [...store.children];
      const slots = [...ram.children];
      // 1. load programs from storage into RAM (or virtual memory when RAM is full)
      for (let i = 0; i < chips.length; i++) {
        const slot = slots[i];
        now.textContent = `Loading ${chips[i].textContent}…`;
        const dest = slot || vmc;
        if (!slot) { vm.classList.add('used'); chips[i].classList.add('in-vm'); }
        const move = FD.flip(chips[i], dest, loadSec * 600);
        if (!(await addTime(loadSec, loadSec * 600, my))) return null;
        await move;
      }
      // 2. the processor carries out each program's instructions
      cpuEl.classList.add('busy');
      for (const c of chips) {
        if (my !== token) return null;
        const inVM = c.classList.contains('in-vm');
        c.classList.add('active');
        if (inVM) {
          now.innerHTML = `<span class="bad">Fetching ${c.textContent} from virtual memory…</span>`;
          if (!(await addTime(swapSec, swapSec * 380, my))) return null;
        }
        now.textContent = `Running ${c.textContent}`;
        if (!(await addTime(cpuSec, cpuSec * 380, my))) return null;
        c.classList.remove('active');
        c.classList.add('done');
      }
      cpuEl.classList.remove('busy');
      now.textContent = 'All programs open ✓';
      running = false;
      el.querySelectorAll('.seg button, #pRun').forEach((b) => (b.disabled = false));
      logRun(t);
      return t;
    }

    function logRun(sec) {
      runsEl.querySelector('.empty')?.remove();
      const label = `${cfg.cpu} GHz · ${cfg.ram === '6' ? '16' : '4'} GB RAM · ${cfg.store.toUpperCase()} · ${cfg.soft === 'good' ? 'efficient' : 'inefficient'}`;
      const li = FD.h(`<li><span class="run-l">${label}</span><span class="bar"><i style="--v:${Math.min(100, sec / 18 * 100)}%"></i></span><b>${sec.toFixed(1)} s</b></li>`);
      if (sec < 5) li.classList.add('fast');
      runsEl.prepend(li);
      while (runsEl.children.length > 4) runsEl.lastElementChild.remove();
    }

    runBtn.addEventListener('click', () => runSim());
    reset();

    return {
      set(c = {}, { clear = false } = {}) {
        cfg = { ...DEFAULT, ...c };
        reset();
        if (clear) runsEl.innerHTML = '<li class="empty">Results of each run appear here.</li>';
      },
      focus(part) {
        el.querySelectorAll('[data-part]').forEach((b) => b.classList.toggle('focus', b.dataset.part === part));
        const key = part === 'storage' ? 'store' : part;
        el.querySelectorAll('.seg').forEach((s) => s.classList.toggle('focus', !!part && s.dataset.key === key));
      },
      run: runSim,
      destroy() { token++; },
    };
  },
  steps: [
    {
      title: 'What is performance?',
      text: `<p>A <strong>high-performance</strong> device performs its job or tasks <strong>quickly</strong>.</p>
             <p>Its speed depends on how fast it can carry out the <strong>instructions</strong> in its software. Instructions travel from <strong>storage</strong> → <strong>RAM</strong> → <strong>processor</strong>.</p>`,
      on(a) { a.set({}, { clear: true }); a.focus(null); },
    },
    {
      title: 'The processor',
      text: `<p>Software instructions are carried out by the <strong>processor</strong>.</p>
             <p>A <strong>faster processor</strong> will increase performance. Watch the same 5 programs open on a 1.5 GHz and then a 3.5 GHz processor.</p>`,
      async on(a, ctx) {
        a.set({}, { clear: true }); a.focus('cpu');
        if (!(await ctx.sleep(400))) return;
        await a.run();
        if (!(await ctx.sleep(700))) return;
        a.set({ cpu: '3.5' }); a.focus('cpu');
        await a.run();
      },
    },
    {
      title: 'RAM',
      text: `<p>Instructions are loaded into the processor from <strong>RAM</strong>, so <strong>faster RAM</strong> lets instructions be loaded more quickly.</p>
             <p>RAM holds the instructions of every program that is running, so <strong>more RAM</strong> lets the device run <strong>more programs at the same time</strong>.</p>`,
      async on(a, ctx) {
        a.set({ cpu: '3.5' }, { clear: true }); a.focus('ram');
        if (!(await ctx.sleep(400))) return;
        await a.run();
      },
    },
    {
      title: 'Storage speed',
      text: `<p>Instructions are loaded into RAM from <strong>storage</strong>, such as a hard disk.</p>
             <p><strong>Faster storage</strong> (for example an SSD instead of an HDD) means programs load into RAM faster.</p>`,
      async on(a, ctx) {
        a.set({ cpu: '3.5', store: 'hdd' }, { clear: true }); a.focus('storage');
        if (!(await ctx.sleep(400))) return;
        await a.run();
        if (!(await ctx.sleep(700))) return;
        a.set({ cpu: '3.5', store: 'ssd' }); a.focus('storage');
        await a.run();
      },
    },
    {
      title: 'Virtual memory',
      text: `<p>When the space in RAM runs out, <strong>storage is used as an overflow</strong>. This is called <strong>virtual memory</strong>.</p>
             <p>Storage is much slower than RAM, so the device slows down. <strong>Fast storage</strong> means faster access to instructions in virtual memory.</p>`,
      tip: 'Here the 4 GB of RAM only has space for 3 programs, so the other 2 go into virtual memory.',
      async on(a, ctx) {
        a.set({ cpu: '3.5', ram: '3', store: 'hdd' }, { clear: true }); a.focus('ram');
        if (!(await ctx.sleep(400))) return;
        await a.run();
        if (!(await ctx.sleep(700))) return;
        a.set({ cpu: '3.5', ram: '3', store: 'ssd' }); a.focus('storage');
        await a.run();
      },
    },
    {
      title: 'Efficient software',
      text: `<p>Software can be written in an <strong>efficient</strong> way that makes the most of the processor’s capabilities.</p>
             <p><strong>Inefficient software</strong> can slow down the whole system, even on good hardware.</p>`,
      async on(a, ctx) {
        a.set({ cpu: '3.5', soft: 'bad' }, { clear: true }); a.focus('soft');
        if (!(await ctx.sleep(400))) return;
        await a.run();
        if (!(await ctx.sleep(700))) return;
        a.set({ cpu: '3.5', soft: 'good' }); a.focus('soft');
        await a.run();
      },
    },
    {
      title: 'Try it: build a faster computer',
      text: `<p>This computer is <strong>slow</strong>. Change the four settings and press <strong>Open 5 programs</strong>.</p>
             <p>Can you get the time <strong>below 5 seconds</strong>? Explain which change helped most, and why.</p>`,
      on(a) { a.set({ cpu: '1.5', ram: '3', store: 'hdd', soft: 'bad' }, { clear: true }); a.focus(null); },
    },
  ],
});
