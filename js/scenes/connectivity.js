FD.add({
  id: 'connectivity',
  title: 'Connectivity',
  icon: 'connectivity',
  color: '--c5',
  feature: true,
  interactive: true,
  vocab: [
    ['connectivity', 'a device’s ability to connect to networks and other devices'],
    ['back up', 'to make a copy of information stored on a computer in case the original is lost or damaged'],
  ],
  mount(el) {
    // node positions in a 1000 × 560 coordinate space
    const N = {
      hub: { x: 500, y: 330, label: 'Laptop', svg: FD.dev.laptop(FD.screen.laptopHome), w: 22 },
      cloud: { x: 500, y: 80, label: 'Update server', svg: FD.dev.cloud(), w: 14 },
      drive: { x: 130, y: 330, label: 'Backup drive', svg: FD.dev.drive(), w: 8 },
      tv: { x: 870, y: 330, label: 'Smart TV', svg: FD.dev.tv(FD.screen.tvShow), w: 20 },
    };
    const LINKS = [['cloud', 'hub'], ['hub', 'drive'], ['hub', 'tv']];
    const ACTIONS = {
      update: { from: 'cloud', to: 'hub', label: 'Update software', doing: 'Downloading a software update…', icon: '⬇️' },
      backup: { from: 'hub', to: 'drive', label: 'Back up files', doing: 'Backing up files…', icon: '💾' },
      media: { from: 'hub', to: 'tv', label: 'Play media on the TV', doing: 'Streaming a film to the TV…', icon: '🎬' },
    };
    const M = {
      wired: { speed: 92, rel: 92, conv: 30, safe: 35, ms: 1500, sec: 4 },
      wireless: { speed: 60, rel: 62, conv: 92, safe: 90, ms: 2800, sec: 9 },
    };
    let mode = 'wireless', busy = false, token = 0;

    el.innerHTML = `
      <div class="conn">
        <div class="conn-top">
          <div class="seg" id="cMode"><span class="seg-l">Connection</span><button data-v="wired">🔌 Wired</button><button data-v="wireless">📶 Wireless</button></div>
          <div class="conn-acts">${Object.entries(ACTIONS).map(([k, a]) => `<button class="btn small-btn" data-act="${k}">${a.icon} ${a.label}</button>`).join('')}</div>
        </div>
        <div class="conn-map" id="cMap">
          <svg viewBox="0 0 1000 560" class="conn-svg" aria-hidden="true">
            ${LINKS.map(([a, b]) => `<line class="link" data-l="${a}-${b}" x1="${N[a].x}" y1="${N[a].y}" x2="${N[b].x}" y2="${N[b].y}"/>`).join('')}
            <g id="cPk"></g>
          </svg>
          ${Object.entries(N).map(([k, n]) => `<div class="cnode" data-n="${k}" style="left:${n.x / 10}%;top:${n.y / 5.6}%;--w:${n.w}%">${n.svg}<span>${n.label}</span><i class="wifi">📶</i></div>`).join('')}
          <div class="hazards" id="hz"><span>⚠️ Trip hazard</span><span>🧶 Messy cables</span><span>💷 Extra cost</span></div>
        </div>
        <div class="conn-bottom">
          <div class="meters" id="cMeters">
            ${[['speed', 'Speed'], ['rel', 'Reliability'], ['conv', 'Convenience'], ['safe', 'Safety']].map(([k, n]) => `<div class="meter"><span class="meter-l">${n}</span><span class="bar"><i data-m="${k}"></i></span></div>`).join('')}
          </div>
          <p class="conn-msg" id="cMsg" aria-live="polite">Choose wired or wireless, then press an action.</p>
        </div>
      </div>`;
    const $ = (s) => el.querySelector(s);
    const map = $('#cMap'), pk = $('#cPk'), msg = $('#cMsg'), seg = $('#cMode');

    function setMode(m) {
      mode = m;
      token++;
      busy = false;
      pk.innerHTML = '';
      FD.segSet(seg, m);
      map.className = 'conn-map ' + m;
      el.querySelectorAll('[data-m]').forEach((i) => i.style.setProperty('--v', M[m][i.dataset.m] + '%'));
      el.querySelectorAll('[data-act]').forEach((b) => (b.disabled = false));
      msg.innerHTML = m === 'wired'
        ? '<b>Wired:</b> usually faster and more reliable, but cables bring cost, mess, inconvenience and safety risks such as tripping.'
        : '<b>Wireless:</b> no cables, so it is more convenient, but usually slower and less reliable than wired.';
    }
    FD.seg(seg, setMode);

    async function transfer(k) {
      if (busy) return;
      busy = true;
      const my = token, a = ACTIONS[k], m = M[mode];
      const A = N[a.from], B = N[a.to];
      el.querySelectorAll('[data-act]').forEach((b) => (b.disabled = true));
      el.querySelectorAll('.link').forEach((l) => l.classList.toggle('active', l.dataset.l.includes(a.from) && l.dataset.l.includes(a.to)));
      msg.textContent = a.doing;
      // wireless: packet 3 is lost half-way and an extra packet resends it at the end
      const lost = mode === 'wireless' ? 2 : -1;
      const n = mode === 'wireless' ? 7 : 6, dur = FD.dur(m.ms), gap = dur / n / 1.4;
      const travel = dur - gap * (n - 1);
      const t0 = performance.now();
      const dots = Array.from({ length: n }, (_, i) => {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('r', 11);
        c.setAttribute('class', 'packet' + (i === lost ? ' lost' : '') + (lost >= 0 && i === n - 1 ? ' resend' : ''));
        c.style.opacity = 0;
        pk.appendChild(c);
        return c;
      });
      await new Promise((res) => {
        const f = (now) => {
          if (my !== token) return res();
          let all = true;
          dots.forEach((c, i) => {
            let p = (now - t0 - i * gap) / travel;
            if (p < 1) all = false;
            if (i === lost && p > 0.5) { c.classList.add('drop'); p = 0.5; }
            const q = Math.max(0, Math.min(1, p));
            const gone = i === lost ? (now - t0 - i * gap) / travel > 0.8 : p >= 1;
            c.style.opacity = p > 0 && !gone ? 1 : 0;
            c.setAttribute('cx', A.x + (B.x - A.x) * q);
            c.setAttribute('cy', A.y + (B.y - A.y) * q);
          });
          if (!all) requestAnimationFrame(f); else res();
        };
        requestAnimationFrame(f);
      });
      if (my !== token) return;
      pk.innerHTML = '';
      el.querySelectorAll('.link').forEach((l) => l.classList.remove('active'));
      el.querySelectorAll('[data-act]').forEach((b) => (b.disabled = false));
      busy = false;
      msg.innerHTML = `<strong class="good">✓ ${a.label} · done</strong> in ${m.sec} s (simulated) using a <b>${mode}</b> connection.` +
        (mode === 'wireless' ? ' One packet was lost and had to be sent again.' : '');
    }
    el.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => transfer(b.dataset.act)));
    setMode('wireless');

    return { setMode, transfer, destroy() { token++; } };
  },
  steps: [
    {
      title: 'What is connectivity?',
      text: `<p><strong>Connectivity</strong> is a device’s ability to connect to <strong>networks</strong> and <strong>other devices</strong>.</p>
             <p>Devices share data by connecting to each other with a <strong>wired</strong> or <strong>wireless</strong> connection.</p>`,
      on(a) { a.setMode('wireless'); },
    },
    {
      title: 'Why connect?',
      text: `<p>Connectivity can be used to:</p>
             <ul><li><strong>update software</strong></li><li><strong>back up</strong> files</li><li><strong>play media</strong> from one device on another</li></ul>`,
      async on(a, ctx) {
        a.setMode('wireless');
        for (const k of ['update', 'backup', 'media']) {
          if (!(await ctx.sleep(400))) return;
          await a.transfer(k);
          if (!ctx.alive()) return;
        }
      },
    },
    {
      title: 'Wired connections',
      text: `<p>Wired connectivity is usually <strong>faster</strong> and <strong>more reliable</strong>.</p>
             <p>But it introduces <strong>cost</strong>, <strong>mess</strong>, <strong>inconvenience</strong> and <strong>safety risks</strong> such as tripping, especially for young children.</p>`,
      async on(a, ctx) {
        a.setMode('wired');
        if (!(await ctx.sleep(500))) return;
        await a.transfer('backup');
      },
    },
    {
      title: 'Wireless connections',
      text: `<p>Wireless connectivity is more <strong>convenient</strong>: there are no cables and devices can move around.</p>
             <p>It is usually <strong>slower</strong> and <strong>less reliable</strong>, so data sometimes has to be sent again.</p>`,
      tip: 'Different connectivity types give different speeds of data transfer and levels of convenience. You will study them in Unit 2.',
      async on(a, ctx) {
        a.setMode('wireless');
        if (!(await ctx.sleep(500))) return;
        await a.transfer('backup');
      },
    },
    {
      title: 'Try it',
      text: `<p>Switch between <strong>wired</strong> and <strong>wireless</strong> and run each action.</p>
             <p>Which would you choose at home with young children? Which for backing up a huge video project?</p>`,
      on(a) { a.setMode('wired'); },
    },
  ],
});
