FD.add({
  id: 'portability',
  title: 'Portability',
  icon: 'portability',
  color: '--c1',
  feature: true,
  interactive: true,
  mount(el) {
    const D = [
      { k: 'phone', name: 'Smartphone', svg: FD.dev.phone(FD.screen.phoneHome), size: '15 cm', weight: '0.2 kg', p: 95 },
      { k: 'laptop', name: 'Laptop', svg: FD.dev.laptop(FD.screen.laptopHome), size: '35 cm', weight: '1.5 kg', p: 70 },
      { k: 'desktop', name: 'Desktop PC', svg: FD.dev.desktop(FD.screen.desktopHome), size: '45 cm + monitor', weight: '10 kg', p: 12 },
      { k: 'tv', name: 'Television', svg: FD.dev.tv(FD.screen.tvShow), size: '120 cm', weight: '15 kg', p: 5 },
    ];
    el.innerHTML = `
      <div class="port">
        <div class="port-devs">
          ${D.map((d) => `
            <button class="pdev" data-k="${d.k}" aria-label="Pack the ${d.name}">
              <span class="pdev-img pdev-${d.k}">${d.svg}</span>
              <strong>${d.name}</strong>
              <span class="pdev-m"><span>Size <b>${d.size}</b></span><span>Weight <b>${d.weight}</b></span></span>
              <span class="meter"><span class="meter-l">Portability</span><span class="bar"><i style="--v:${d.p}%"></i></span></span>
            </button>`).join('')}
        </div>
        <div class="bag">
          <div class="bag-img">${FD.dev.backpack()}<div class="bag-in" id="bagIn"></div></div>
          <div class="bag-txt">
            <p class="bag-title">Pack your bag</p>
            <p class="small" id="bagMsg">Tap a device to put it in the backpack.</p>
          </div>
        </div>
      </div>`;
    const root = el.querySelector('.port'), msg = el.querySelector('#bagMsg'), bagIn = el.querySelector('#bagIn');
    const btn = (k) => el.querySelector(`.pdev[data-k="${k}"]`);
    const packed = new Set();

    function pack(k) {
      const d = D.find((x) => x.k === k), b = btn(k);
      if (packed.has(k)) {
        packed.delete(k);
        bagIn.querySelector(`[data-k="${k}"]`)?.remove();
        b.classList.remove('packed');
        msg.textContent = `${d.name} taken out of the bag.`;
        return;
      }
      if (d.p < 50) {
        FD.shake(b);
        msg.innerHTML = `<strong class="bad">✗ The ${d.name.replace(/^\w/, (c) => c.toLowerCase())} is too big and heavy to carry around.</strong>`;
        return;
      }
      packed.add(k);
      b.classList.add('packed');
      const mini = FD.h(`<span class="mini mini-${k}" data-k="${k}">${d.svg}</span>`);
      bagIn.appendChild(mini);
      FD.flyFrom(b.querySelector('.pdev-img'), mini);
      msg.innerHTML = `<strong class="good">✓ ${d.name} packed!</strong> Small and light enough to carry.`;
    }
    el.querySelectorAll('.pdev').forEach((b) => b.addEventListener('click', () => pack(b.dataset.k)));

    return {
      set({ measures = false, focus = null } = {}) {
        root.classList.toggle('show-m', measures);
        el.querySelectorAll('.pdev').forEach((b) => b.classList.toggle('dim', !!focus && !focus.includes(b.dataset.k)));
      },
      empty() {
        packed.clear();
        bagIn.innerHTML = '';
        el.querySelectorAll('.pdev').forEach((b) => b.classList.remove('packed'));
        msg.textContent = 'Tap a device to put it in the backpack.';
      },
      pack,
    };
  },
  steps: [
    {
      title: 'What is portability?',
      text: `<p>For a device to be <strong>portable</strong>, it needs to be <strong>easy to carry and move around</strong>.</p>
             <p>Which of these devices would you take to school in your bag?</p>`,
      on(a) { a.empty(); a.set(); },
    },
    {
      title: 'Size and weight',
      text: `<p>The portability of a device is <strong>directly related to its size and weight</strong>.</p>
             <p>Smaller, lighter devices are more portable. Look at the portability bars.</p>`,
      tip: 'Exam tip: when you explain portability, mention <strong>both</strong> size and weight.',
      on(a) { a.empty(); a.set({ measures: true }); },
    },
    {
      title: 'Pack your bag',
      text: `<p>Smartphones and laptops are designed to be carried around.</p>
             <p>A desktop computer is <strong>too big and heavy</strong> to carry around.</p>`,
      async on(a, ctx) {
        a.empty(); a.set({ measures: true });
        if (!(await ctx.sleep(500))) return;
        a.pack('phone');
        if (!(await ctx.sleep(1100))) return;
        a.pack('laptop');
        if (!(await ctx.sleep(1300))) return;
        a.pack('desktop');
      },
    },
    {
      title: 'Not always a priority',
      text: `<p>For some devices, such as a <strong>television</strong> or a <strong>desktop computer</strong>, portability is unlikely to be a priority.</p>
             <p>They stay in one place, so they can be bigger. For example, they can have a larger screen or more powerful parts.</p>`,
      on(a) { a.set({ measures: true, focus: ['desktop', 'tv'] }); },
    },
    {
      title: 'Try it',
      text: `<p>Tap each device to pack it or take it out of the backpack.</p>
             <p>Can you explain <strong>why</strong> the TV and the desktop PC will not fit?</p>`,
      on(a) { a.empty(); a.set({ measures: true }); },
    },
  ],
});
