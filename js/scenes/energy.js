FD.add({
  id: 'energy',
  title: 'Energy consumption',
  tab: 'Energy',
  icon: 'energy',
  color: '--c7',
  feature: true,
  interactive: true,
  mount(el) {
    const DEFAULT = { bright: 'high', cpu: 'old', save: 'off' };
    let cfg = { ...DEFAULT }, token = 0;
    const hours = () => 7 + (cfg.bright === 'low' ? 3 : 0) + (cfg.cpu === 'new' ? 4 : 0) + (cfg.save === 'on' ? 3 : 0);

    el.innerHTML = `
      <div class="energy">
        <div class="e-phone">
          <div class="batt" id="batt"><i id="battFill"></i><span id="battPct">100%</span></div>
          <div class="e-clock"><span id="eClock">07:00</span><small>Battery life: <b id="eLife"></b></small></div>
          <div class="e-ctl">
            <div class="seg" data-key="bright"><span class="seg-l">Screen brightness</span><button data-v="high">High</button><button data-v="low">Low</button></div>
            <div class="seg" data-key="cpu"><span class="seg-l">Processor</span><button data-v="old">Older design</button><button data-v="new">Energy-efficient</button></div>
            <div class="seg" data-key="save"><span class="seg-l">Power-saving mode</span><button data-v="off">Off</button><button data-v="on">On</button></div>
            <button class="btn primary" id="eRun">▶ Simulate a day</button>
          </div>
        </div>
        <div class="e-why">
          <h4>Why make devices that use less energy?</h4>
          <ul class="why" id="why">
            <li data-w="battery"><span>🔋</span><span><b>Longer battery life</b> for mobile devices.</span></li>
            <li data-w="money"><span>💷</span><span><b>Saves customers money</b>, as the cost of energy keeps rising.</span></li>
            <li data-w="planet"><span>🌍</span><span><b>Social responsibility</b>: less damage to the environment.</span></li>
            <li data-w="pressure"><span>🏛️</span><span><b>Pressure</b> from customers and governments to be environmentally responsible.</span></li>
          </ul>
          <div class="dc" id="dc">
            <div class="dc-racks">${FD.dev.server()}${FD.dev.server()}<span class="heat">〰️〰️</span><span class="fan">✣</span><span class="fan f2">✣</span></div>
            <div class="dc-txt">
              <p><b>Did you know?</b> Computers generate a lot of heat. A <b>large proportion</b> of the energy used in data centres goes on <b>cooling</b> the computers.</p>
              <div class="meter"><span class="meter-l">Computing</span><span class="bar"><i style="--v:55%"></i></span></div>
              <div class="meter cool"><span class="meter-l">Cooling</span><span class="bar"><i style="--v:45%"></i></span></div>
            </div>
          </div>
        </div>
      </div>`;
    const $ = (s) => el.querySelector(s);
    const segs = [...el.querySelectorAll('.seg')];
    const fill = $('#battFill'), pct = $('#battPct'), clock = $('#eClock');
    segs.forEach((s) => FD.seg(s, (v) => { cfg[s.dataset.key] = v; render(); }));

    function setBatt(p) {
      fill.style.width = p + '%';
      pct.textContent = Math.round(p) + '%';
      $('#batt').classList.toggle('low', p < 20);
    }
    const hhmm = (h) => `${String(Math.floor(h) % 24).padStart(2, '0')}:${String(Math.floor((h % 1) * 60)).padStart(2, '0')}`;
    function render() {
      token++;
      segs.forEach((s) => FD.segSet(s, cfg[s.dataset.key]));
      $('#eLife').textContent = hours() + ' hours';
      setBatt(100);
      clock.textContent = '07:00';
      $('#eRun').disabled = false;
    }
    async function day() {
      render();
      const my = token, H = hours(), ms = FD.dur(3200), t0 = performance.now();
      $('#eRun').disabled = true;
      await new Promise((res) => {
        const f = (now) => {
          if (my !== token) return res();
          const k = Math.min(1, (now - t0) / ms);
          setBatt(100 * (1 - k));
          clock.textContent = hhmm(7 + H * k);
          if (k < 1) requestAnimationFrame(f); else res();
        };
        requestAnimationFrame(f);
      });
      if (my !== token) return;
      $('#eRun').disabled = false;
      clock.textContent = hhmm(7 + H) + (7 + H >= 24 ? ' (next day)' : '') + ' · battery flat';
    }
    $('#eRun').addEventListener('click', day);
    render();

    return {
      set(c = {}) { cfg = { ...DEFAULT, ...c }; render(); },
      day,
      why(list) { el.querySelectorAll('#why li').forEach((li) => li.classList.toggle('on', list.includes(li.dataset.w))); },
      dc(on) { $('#dc').classList.toggle('on', on); },
      destroy() { token++; },
    };
  },
  steps: [
    {
      title: 'Devices need electricity',
      text: `<p>Digital devices need <strong>electricity</strong> to work.</p>
             <p>One benefit of <strong>lower energy consumption</strong> in mobile devices is a <strong>longer battery life</strong>. Watch how long this phone lasts.</p>`,
      on(a) { a.set(); a.why(['battery']); a.dc(false); return a.day(); },
    },
    {
      title: 'Using less energy',
      text: `<p>Manufacturers are creating devices that <strong>consume less energy</strong>, for example with energy-efficient processors and power-saving modes.</p>
             <p>The same phone now lasts much longer on one charge.</p>`,
      on(a) { a.set({ bright: 'low', cpu: 'new', save: 'on' }); a.why(['battery']); a.dc(false); return a.day(); },
    },
    {
      title: 'Why do manufacturers care?',
      text: `<p>Because of the <strong>rising cost of energy</strong> and <strong>pressure from customers and governments</strong> to be more environmentally responsible.</p>
             <p>The aim is to <strong>save customers money</strong> and show <strong>social responsibility</strong>, such as reducing environmental damage.</p>`,
      on(a) { a.why(['battery', 'money', 'planet', 'pressure']); a.dc(false); },
    },
    {
      title: 'Data centres',
      text: `<p>Computers generate a lot of <strong>heat</strong>.</p>
             <p>This means that a <strong>large proportion</strong> of the energy consumed in data centres is used to <strong>cool</strong> the computers.</p>`,
      tip: 'You will learn more about sustainability in Unit 3 Operating online.',
      on(a) { a.why(['money', 'planet']); a.dc(true); },
    },
    {
      title: 'Try it',
      text: `<p>Change the three settings and press <strong>Simulate a day</strong>.</p>
             <p>Which setting makes the biggest difference? Can you make the battery last until after midnight?</p>`,
      on(a) { a.set(); a.why([]); a.dc(false); },
    },
  ],
});
