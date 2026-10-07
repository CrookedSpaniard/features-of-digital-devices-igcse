FD.add({
  id: 'media',
  title: 'Media support',
  icon: 'media',
  color: '--c6',
  feature: true,
  interactive: true,
  vocab: [['media', 'items such as memory cards and CD-ROMs that make information available to people and devices']],
  mount(el) {
    const MEDIA = {
      sd: { name: 'SD card', svg: '<svg viewBox="0 0 40 50" class="m-sd"><path d="M5 2h22l10 10v34a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><rect x="9" y="5" width="3" height="8" rx="1"/><rect x="14" y="5" width="3" height="8" rx="1"/><rect x="19" y="5" width="3" height="8" rx="1"/><rect x="8" y="22" width="24" height="16" rx="2" class="lbl"/></svg>' },
      micro: { name: 'microSD card', svg: '<svg viewBox="0 0 30 40" class="m-micro"><path d="M4 2h18v8l4 4v22a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><rect x="6" y="5" width="2.5" height="6" rx="1"/><rect x="10.5" y="5" width="2.5" height="6" rx="1"/><rect x="15" y="5" width="2.5" height="6" rx="1"/><rect x="6" y="20" width="16" height="12" rx="2" class="lbl"/></svg>' },
      dvd: { name: 'DVD', svg: '<svg viewBox="0 0 50 50" class="m-dvd"><defs><linearGradient id="dvdg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d0ebff"/><stop offset=".35" stop-color="#e5dbff"/><stop offset=".6" stop-color="#fff3bf"/><stop offset="1" stop-color="#c3fae8"/></linearGradient></defs><circle cx="25" cy="25" r="23" fill="url(#dvdg)" stroke="#adb5bd"/><circle cx="25" cy="25" r="7" fill="#f1f3f5" stroke="#adb5bd"/><circle cx="25" cy="25" r="3" fill="none" stroke="#adb5bd"/></svg>' },
    };
    const DEVS = {
      phone: { name: 'Smartphone', svg: FD.dev.phone(FD.screen.phoneHome), native: 'micro', slot: 'microSD slot' },
      laptop: { name: 'Thin laptop', svg: FD.dev.laptop(FD.screen.laptopHome), native: 'sd', slot: 'SD card slot' },
      desktop: { name: 'Desktop PC', svg: FD.dev.desktop(FD.screen.desktopHome), native: 'dvd', slot: 'DVD drive' },
    };
    const ADAPT = {
      card: { name: 'USB card reader', svg: '<svg viewBox="0 0 70 40"><rect x="2" y="8" width="48" height="26" rx="5" class="ad-body"/><rect x="50" y="14" width="16" height="14" rx="2" class="ad-plug"/><rect x="10" y="14" width="30" height="4" rx="2" class="ad-slot"/></svg>' },
      dvd: { name: 'External DVD drive', svg: '<svg viewBox="0 0 90 44"><rect x="2" y="6" width="74" height="32" rx="5" class="ad-body"/><rect x="8" y="24" width="50" height="4" rx="2" class="ad-slot"/><circle cx="68" cy="16" r="2.5" class="ad-led"/><path d="M76 22h12" class="ad-cable"/></svg>' },
    };
    let pick = null, token = 0;

    el.innerHTML = `
      <div class="media">
        <div class="m-tray">
          <span class="seg-l">1 · Choose media</span>
          ${Object.entries(MEDIA).map(([k, m]) => `<button class="m-item" data-m="${k}">${m.svg}<span>${m.name}</span></button>`).join('')}
        </div>
        <span class="seg-l">2 · Choose a device</span>
        <div class="m-devs">
          ${Object.entries(DEVS).map(([k, d]) => `
            <button class="m-dev" data-d="${k}">
              <span class="m-dimg">${d.svg}</span>
              <strong>${d.name}</strong>
              <small class="native">Built-in: <b>${d.slot}</b></small>
              <span class="m-slot" data-slot="${k}"></span>
              <span class="m-adapter" data-ad="${k}"></span>
            </button>`).join('')}
        </div>
        <p class="m-msg" id="mMsg" aria-live="polite">Pick a memory card or disc, then a device to put it in.</p>
      </div>`;
    const $ = (s) => el.querySelector(s);
    const msg = $('#mMsg');

    function choose(k) {
      pick = k;
      el.querySelectorAll('.m-item').forEach((b) => b.classList.toggle('on', b.dataset.m === k));
      if (k) msg.innerHTML = `<b>${MEDIA[k].name}</b> selected. Now choose a device.`;
    }
    function reset({ natives = false } = {}) {
      token++;
      choose(null);
      el.querySelectorAll('.m-slot, .m-adapter').forEach((s) => (s.innerHTML = ''));
      el.querySelectorAll('.m-dev').forEach((d) => d.classList.remove('ok', 'adapt'));
      el.querySelector('.m-devs').classList.toggle('show-native', natives);
      msg.textContent = 'Pick a memory card or disc, then a device to put it in.';
    }
    async function insert(dk, mk = pick) {
      if (!mk) { msg.textContent = 'First choose a memory card or a disc.'; FD.shake(el.querySelector('.m-tray')); return; }
      const my = token, d = DEVS[dk], m = MEDIA[mk];
      const devEl = el.querySelector(`[data-d="${dk}"]`), slot = devEl.querySelector('.m-slot'), ad = devEl.querySelector('.m-adapter');
      slot.innerHTML = ''; ad.innerHTML = '';
      devEl.classList.remove('ok', 'adapt');
      el.querySelector('.m-devs').classList.add('show-native');
      const src = el.querySelector(`.m-item[data-m="${mk}"]`);
      const chip = FD.h(`<span class="m-in">${m.svg}</span>`);
      if (d.native === mk) {
        slot.appendChild(chip);
        await FD.flyFrom(src, chip, 700);
        if (my !== token) return;
        devEl.classList.add('ok');
        msg.innerHTML = `<strong class="good">✓ Native support.</strong> The ${d.name.toLowerCase()} has a built-in ${d.slot}, so it can read and write the ${m.name} directly.`;
      } else {
        const a = mk === 'dvd' ? ADAPT.dvd : ADAPT.card;
        msg.innerHTML = `<strong class="bad">✗ No built-in slot for a ${m.name}.</strong> Connecting an adapter…`;
        FD.shake(devEl.querySelector('.m-dimg'));
        await FD.wait(700);
        if (my !== token) return;
        ad.innerHTML = `<span class="ad">${a.svg}<small>${a.name}</small></span>`;
        ad.firstElementChild.animate([{ transform: 'translateY(30px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: FD.dur(500), easing: 'ease-out' });
        await FD.wait(600);
        if (my !== token) return;
        ad.firstElementChild.appendChild(chip);
        await FD.flyFrom(src, chip, 700);
        if (my !== token) return;
        devEl.classList.add('adapt');
        msg.innerHTML = `<strong class="good">✓ Supported with an adapter.</strong> The ${a.name.replace(/^\w/, (c) => c.toLowerCase())} plugs into a USB port, so the ${d.name.toLowerCase()} can use the ${m.name}.`;
      }
    }
    el.querySelectorAll('.m-item').forEach((b) => b.addEventListener('click', () => choose(b.dataset.m)));
    el.querySelectorAll('.m-dev').forEach((b) => b.addEventListener('click', () => insert(b.dataset.d)));

    return { reset, choose, insert, destroy() { token++; } };
  },
  steps: [
    {
      title: 'What is media?',
      text: `<p><strong>Media</strong> are items such as <strong>memory cards</strong> and <strong>discs</strong> that make information available to people and devices.</p>
             <p>Examples include <strong>SD</strong> and <strong>microSD</strong> flash memory cards, and <strong>DVDs</strong>.</p>`,
      on(a) { a.reset(); },
    },
    {
      title: 'Built-in (native) media',
      text: `<p>Different devices can read data from, and write data to, <strong>different types of media</strong>.</p>
             <p>Many smartphones have a built-in <strong>microSD</strong> slot.</p>`,
      async on(a, ctx) {
        a.reset({ natives: true });
        if (!(await ctx.sleep(600))) return;
        a.choose('micro');
        if (!(await ctx.sleep(700))) return;
        await a.insert('phone', 'micro');
      },
    },
    {
      title: 'No slot? Use an adapter',
      text: `<p>If a device does not have <strong>built-in (native)</strong> support for a type of media, an <strong>adapter</strong> can usually be connected.</p>
             <p>Some laptops are too thin to have an optical disc drive, so they need an <strong>external DVD drive</strong>.</p>`,
      async on(a, ctx) {
        a.reset({ natives: true });
        if (!(await ctx.sleep(600))) return;
        a.choose('dvd');
        if (!(await ctx.sleep(700))) return;
        await a.insert('laptop', 'dvd');
      },
    },
    {
      title: 'Try it',
      text: `<p>Put each card and disc into each device.</p>
             <p>Which devices support each type of media <strong>natively</strong>, and which need an <strong>adapter</strong>?</p>`,
      on(a) { a.reset(); },
    },
  ],
});
