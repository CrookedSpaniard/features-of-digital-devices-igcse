FD.add({
  id: 'expansion',
  title: 'Expansion capability',
  tab: 'Expansion',
  icon: 'expansion',
  color: '--c8',
  feature: true,
  interactive: true,
  mount(el) {
    const PARTS = {
      ram: { name: 'RAM module', icon: '<svg viewBox="0 0 80 24"><rect x="2" y="2" width="76" height="16" rx="2" fill="#2b8a3e"/>' + [8, 22, 36, 50, 64].map((x) => `<rect x="${x}" y="5" width="9" height="9" rx="1" fill="#1b1f29"/>`).join('') + '<path d="M4 18h72v4H4z" fill="#fcc419"/></svg>', slot: 'pcRam2', spec: ['sRam', '16 GB'] },
      gpu: { name: 'Graphics card', icon: '<svg viewBox="0 0 80 34"><rect x="2" y="2" width="76" height="24" rx="3" fill="#495057"/><circle cx="24" cy="14" r="9" fill="#212529"/><circle cx="54" cy="14" r="9" fill="#212529"/><path d="M8 26h50v6H8z" fill="#fcc419"/></svg>', slot: 'pcGpu', spec: ['sGpu', 'Dedicated card'] },
      hdd: { name: 'Hard drive', icon: '<svg viewBox="0 0 60 40"><rect x="2" y="2" width="56" height="36" rx="3" fill="#868e96"/><circle cx="24" cy="20" r="12" fill="#ced4da"/><circle cx="24" cy="20" r="3" fill="#495057"/><path d="M42 10l6 18" stroke="#495057" stroke-width="3"/></svg>', slot: 'pcBay', spec: ['sDisk', '512 GB + 2 TB'] },
      sd: { name: 'microSD card (128 GB)', icon: '<svg viewBox="0 0 30 40"><path d="M4 2h18v8l4 4v22a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#343a40"/><rect x="6" y="20" width="16" height="12" rx="2" fill="#fa5252"/></svg>', slot: 'phSlot', spec: ['sPhone', '64 GB + 128 GB'] },
    };
    const PERIPH = { printer: ['Printer', FD.dev.printer()], webcam: ['Webcam', FD.dev.webcam()], drive: ['External drive', FD.dev.drive()], keyboard: ['Keyboard', '<svg viewBox="0 0 90 40" class="dev"><rect x="2" y="4" width="86" height="32" rx="5" class="dv-body"/>' + [0, 1, 2].map((r) => Array.from({ length: 9 }, (_, c) => `<rect x="${8 + c * 8.6}" y="${9 + r * 8}" width="6" height="5.5" rx="1" class="dv-unit"/>`).join('')).join('') + '</svg>'] };
    let token = 0;

    el.innerHTML = `
      <div class="exp">
        <section class="xp" data-x="pc">
          <h4>Desktop PC · install components</h4>
          <div class="pc-case">
            <div class="mobo">
              <span class="xslot ram filled" title="RAM slot 1">${PARTS.ram.icon}</span>
              <span class="xslot ram" id="pcRam2" title="RAM slot 2"><em>RAM slot</em></span>
              <span class="xslot pcie" id="pcGpu"><em>Expansion slot</em></span>
              <span class="xslot bay" id="pcBay"><em>Drive bay</em></span>
            </div>
          </div>
          <dl class="specs"><div><dt>RAM</dt><dd id="sRam">8 GB</dd></div><div><dt>Graphics</dt><dd id="sGpu">Built-in</dd></div><div><dt>Storage</dt><dd id="sDisk">512 GB</dd></div></dl>
          <div class="ptray">${['ram', 'gpu', 'hdd'].map((k) => `<button class="part" data-p="${k}">${PARTS[k].icon}<span>${PARTS[k].name}</span></button>`).join('')}</div>
        </section>
        <section class="xp" data-x="phone">
          <h4>Smartphone · expansion slot</h4>
          <div class="ph-wrap">${FD.dev.phone(FD.screen.phoneHome)}<span class="xslot sdslot" id="phSlot"><em>microSD slot</em></span></div>
          <dl class="specs"><div><dt>Storage</dt><dd id="sPhone">64 GB</dd></div></dl>
          <div class="ptray"><button class="part" data-p="sd">${PARTS.sd.icon}<span>${PARTS.sd.name}</span></button></div>
        </section>
        <section class="xp" data-x="usb">
          <h4>Laptop · USB ports</h4>
          <div class="usb-wrap">${FD.dev.laptop(FD.screen.laptopHome)}<div class="ports" id="ports"><span class="uport"></span><span class="uport"></span><span class="uport"></span></div></div>
          <div class="plugged" id="plugged"></div>
          <div class="ptray">${Object.entries(PERIPH).map(([k, [n, s]]) => `<button class="periph" data-u="${k}">${s}<span>${n}</span></button>`).join('')}</div>
          <p class="small" id="uMsg"></p>
        </section>
      </div>`;
    const $ = (s) => el.querySelector(s);
    const original = el.querySelector('.exp').innerHTML;

    function bind() {
      el.querySelectorAll('.part').forEach((b) => b.addEventListener('click', () => install(b.dataset.p)));
      el.querySelectorAll('.periph').forEach((b) => b.addEventListener('click', () => plug(b.dataset.u)));
    }
    function reset() {
      token++;
      el.querySelector('.exp').innerHTML = original;
      bind();
      focus(null);
    }
    async function install(k) {
      const p = PARTS[k], btn = el.querySelector(`.part[data-p="${k}"]`), slot = $('#' + p.slot);
      if (!btn || btn.classList.contains('used')) return;
      btn.classList.add('used');
      slot.innerHTML = p.icon;
      slot.classList.add('filled');
      await FD.flyFrom(btn, slot, 700);
      const [id, v] = p.spec;
      $('#' + id).textContent = v;
      $('#' + id).classList.add('up');
    }
    function plug(k) {
      const btn = el.querySelector(`.periph[data-u="${k}"]`);
      const free = el.querySelector('.uport:not(.used)');
      if (btn.classList.contains('used')) return;
      if (!free) { FD.shake($('#ports')); $('#uMsg').innerHTML = '<strong class="bad">No free ports!</strong> A USB hub would add more.'; return; }
      free.classList.add('used');
      btn.classList.add('used');
      const chip = FD.h(`<span class="pl">${PERIPH[k][1]}<small>${PERIPH[k][0]}</small></span>`);
      $('#plugged').appendChild(chip);
      FD.flyFrom(btn, chip, 650);
      $('#uMsg').innerHTML = `<strong class="good">✓ ${PERIPH[k][0]} connected</strong> through a USB port.`;
    }
    function focus(x) { el.querySelectorAll('.xp').forEach((s) => s.classList.toggle('dim', !!x && s.dataset.x !== x)); }
    bind();

    return { reset, install, plug, focus, destroy() { token++; } };
  },
  steps: [
    {
      title: 'Adding components to a PC',
      text: `<p>Some PCs allow users to <strong>install additional components</strong>, such as more RAM, a graphics card or another hard drive.</p>
             <p>This makes the computer more powerful without buying a new one.</p>`,
      async on(a, ctx) {
        a.reset(); a.focus('pc');
        for (const k of ['ram', 'gpu', 'hdd']) { if (!(await ctx.sleep(800))) return; await a.install(k); }
      },
    },
    {
      title: 'Memory card slots',
      text: `<p>Some smartphones and tablets have <strong>expansion slots</strong> so they can use <strong>flash memory cards</strong>, such as microSD cards.</p>
             <p>This adds more storage space.</p>`,
      async on(a, ctx) {
        a.reset(); a.focus('phone');
        if (!(await ctx.sleep(800))) return;
        await a.install('sd');
      },
    },
    {
      title: 'Ports such as USB',
      text: `<p>Systems can also be expanded using <strong>ports</strong> such as <strong>USB ports</strong>.</p>
             <p>These let the user connect extra devices called <strong>peripheral devices</strong>.</p>`,
      async on(a, ctx) {
        a.reset(); a.focus('usb');
        for (const k of ['printer', 'webcam']) { if (!(await ctx.sleep(900))) return; a.plug(k); }
      },
    },
    {
      title: 'Try it',
      text: `<p>Upgrade the PC, add a memory card to the phone and plug peripherals into the laptop.</p>
             <p>What happens when you try to connect a <strong>fourth</strong> USB device?</p>`,
      on(a) { a.reset(); },
    },
  ],
});
