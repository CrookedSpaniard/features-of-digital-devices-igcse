FD.add({
  id: 'security',
  title: 'Security features',
  tab: 'Security',
  icon: 'security',
  color: '--c9',
  feature: true,
  interactive: true,
  vocab: [
    ['lock', 'to make a device inactive so that it requires a password or PIN to reactivate it'],
    ['wipe', 'to delete data from a device or drive'],
  ],
  mount(el) {
    const MODES = {
      pin4: { name: '4-digit PIN', combos: 10000, code: '2580' },
      pin6: { name: '6-digit PIN', combos: 1000000, code: '258046' },
      pattern: { name: 'Pattern PIN', combos: 389112, code: '0367' },
      finger: { name: 'Fingerprint', combos: null },
    };
    let mode = 'pin4', state = 'home', entry = '', wrong = 0, token = 0, idleT = null, waitUntil = 0;
    const opts = { auto: true, wait: false, wipe: false };

    el.innerHTML = `
      <div class="sec">
        <section class="sec-soft">
          <h4>Software security</h4>
          <div class="seg" id="secMode"><button data-v="pin4">4-digit PIN</button><button data-v="pin6">6-digit PIN</button><button data-v="pattern">Pattern</button><button data-v="finger">Fingerprint</button></div>
          <div class="sec-row">
            <div class="lockphone">
              <div class="lp-scr" id="lpScr"></div>
            </div>
            <div class="sec-side">
              <div class="combos"><span id="combo"></span><small id="comboL"></small></div>
              <p class="note" id="owner"></p>
              <label class="tgl"><input type="checkbox" data-o="auto" checked> Auto-lock after 5 s without use</label>
              <label class="tgl"><input type="checkbox" data-o="wait"> Wait 30 s after 3 wrong attempts</label>
              <label class="tgl"><input type="checkbox" data-o="wipe"> Wipe data after 10 wrong attempts</label>
              <div class="sec-btns"><button class="btn small-btn" id="lockNow">🔒 Lock now</button><button class="btn small-btn ghost" id="thief">🕵️ Let a thief guess</button></div>
              <p class="sec-msg" id="sMsg" aria-live="polite"></p>
            </div>
          </div>
        </section>
        <section class="sec-phys">
          <h4>Physical security</h4>
          <div class="desk-scene" id="deskScene">
            <svg viewBox="0 0 320 170" aria-hidden="true">
              <rect x="10" y="112" width="300" height="10" rx="3" class="desk-top"/>
              <rect x="270" y="122" width="12" height="46" class="desk-leg"/><rect x="38" y="122" width="12" height="46" class="desk-leg"/>
              <g id="lapG"><g transform="translate(60 40) scale(1)">${FD.dev.laptop(FD.screen.laptopHome).replace('<svg', '<svg width="150" height="94"')}</g></g>
              <path id="cable" d="M206 104 C240 140 250 150 272 142" class="cable"/>
              <circle id="lockHead" cx="206" cy="102" r="6" class="lock-head"/>
            </svg>
          </div>
          <label class="tgl"><input type="checkbox" id="kLock" checked> Security cable lock attached</label>
          <button class="btn small-btn" id="steal">🏃 Try to steal it</button>
          <p class="sec-msg" id="pMsg" aria-live="polite">Many devices have a <b>security slot</b>. A lock in the slot is fixed to furniture with a cable.</p>
        </section>
      </div>`;
    const $ = (s) => el.querySelector(s);
    const scr = $('#lpScr'), msg = $('#sMsg'), seg = $('#secMode');

    const keypad = () => `<div class="kp">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((k) => (k === '' ? '<span></span>' : `<button data-k="${k}">${k}</button>`)).join('')}</div>`;
    function render() {
      const M = MODES[mode];
      if (state === 'home') {
        scr.className = 'lp-scr home';
        scr.innerHTML = `<div class="lp-time">10:42</div><div class="lp-apps">${'<i></i>'.repeat(8)}</div><p>Unlocked</p>`;
      } else if (state === 'wiped') {
        scr.className = 'lp-scr wiped';
        scr.innerHTML = '<div class="lp-big">⚠️</div><p><b>Too many wrong attempts.</b><br>All data has been wiped.</p>';
      } else if (mode === 'finger') {
        scr.className = 'lp-scr lock';
        scr.innerHTML = `<div class="lp-time">10:42</div><p>Touch the sensor</p><button class="fp" id="fp" aria-label="Fingerprint sensor"><svg viewBox="0 0 40 40"><path d="M20 6a14 14 0 0 1 14 14M11 9a14 14 0 0 0-5 11v4M20 11a9 9 0 0 1 9 9v6M14 13a9 9 0 0 0-3 7v8M20 16a4 4 0 0 1 4 4v9M16 20a4 4 0 0 1 4-4M16 20v10M20 22v10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>`;
        $('#fp').addEventListener('click', finger);
      } else if (mode === 'pattern') {
        scr.className = 'lp-scr lock';
        scr.innerHTML = `<div class="lp-time">10:42</div><p>Draw your pattern</p><div class="pat" id="pat">${Array.from({ length: 9 }, (_, i) => `<button data-d="${i}" aria-label="Dot ${i + 1}"></button>`).join('')}<svg viewBox="0 0 3 3" class="pat-line"><polyline id="patLine" points=""/></svg></div>`;
        $('#pat').addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (b) press(b.dataset.d); });
        drawPattern();
      } else {
        const n = M.code.length;
        scr.className = 'lp-scr lock';
        scr.innerHTML = `<div class="lp-time">10:42</div><div class="dots">${Array.from({ length: n }, (_, i) => `<i class="${i < entry.length ? 'on' : ''}"></i>`).join('')}</div>${keypad()}`;
        scr.querySelector('.kp').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) press(b.dataset.k); });
      }
      if (state === 'lock' && Date.now() < waitUntil) scr.insertAdjacentHTML('beforeend', '<div class="lp-wait" id="lpWait"></div>');
    }
    function drawPattern() {
      const pts = entry.split('').map((d) => `${(d % 3) + 0.5},${Math.floor(d / 3) + 0.5}`).join(' ');
      const line = $('#patLine');
      if (line) line.setAttribute('points', pts);
      el.querySelectorAll('#pat [data-d]').forEach((b) => b.classList.toggle('on', entry.includes(b.dataset.d)));
    }
    function info() {
      const M = MODES[mode];
      $('#combo').textContent = M.combos ? FD.fmt(M.combos) : 'Unique';
      $('#comboL').textContent = M.combos ? 'possible combinations' : 'your fingerprint belongs only to you';
      $('#owner').innerHTML = M.code ? `Owner’s ${mode === 'pattern' ? 'pattern: an “L” shape (top-left, down, then right)' : 'PIN: <b>' + M.code + '</b>'}` : 'Biometric scanner: only the owner’s finger unlocks it.';
    }
    function setMode(m, { lock = true } = {}) {
      mode = m;
      FD.segSet(seg, m);
      entry = '';
      info();
      if (lock && state !== 'wiped') state = 'lock';
      render();
    }
    function lock(reason = '') {
      if (state === 'wiped') return;
      state = 'lock';
      entry = '';
      render();
      if (reason) msg.innerHTML = reason;
    }
    function unlock(how) {
      state = 'home';
      wrong = 0;
      entry = '';
      render();
      msg.innerHTML = `<strong class="good">✓ Unlocked</strong> ${how}.`;
      armIdle();
    }
    function armIdle() {
      clearTimeout(idleT);
      if (!opts.auto || state !== 'home') return;
      const my = token;
      idleT = setTimeout(() => { if (my === token && state === 'home') lock('<b>🔒 Locked automatically</b> after 5 s without use.'); }, FD.dur(5000));
    }
    function fail() {
      wrong++;
      FD.shake(scr);
      entry = '';
      if (opts.wipe && wrong >= 10) { state = 'wiped'; render(); msg.innerHTML = '<strong class="bad">Data wiped</strong> after 10 wrong attempts. A thief cannot keep guessing.'; return 'wiped'; }
      if (opts.wait && wrong % 3 === 0) { waitUntil = Date.now() + FD.dur(2000); render(); countdown(); msg.innerHTML = `<b>${wrong} wrong attempts.</b> Try again in 30 seconds.`; return 'wait'; }
      render();
      msg.innerHTML = `<strong class="bad">✗ Wrong ${mode === 'pattern' ? 'pattern' : 'PIN'}</strong> · ${wrong} wrong attempt${wrong > 1 ? 's' : ''}.`;
      return 'wrong';
    }
    function countdown() {
      const my = token;
      const tick = () => {
        const w = $('#lpWait');
        if (my !== token || !w) return;
        const left = waitUntil - Date.now();
        if (left <= 0) { w.remove(); return; }
        w.textContent = `Try again in ${Math.ceil(left / FD.dur(2000) * 30)} s`;
        requestAnimationFrame(tick);
      };
      tick();
    }
    function press(k) {
      if (state !== 'lock' || Date.now() < waitUntil) return;
      const M = MODES[mode];
      if (k === '⌫') entry = entry.slice(0, -1);
      else if (!entry.includes(k) || mode !== 'pattern') entry += k;
      if (mode === 'pattern') drawPattern(); else render();
      if (entry.length === M.code.length) {
        if (entry === M.code) setTimeout(() => unlock(mode === 'pattern' ? 'with the correct pattern' : 'with the correct PIN'), 250);
        else setTimeout(fail, 250);
      }
    }
    async function finger() {
      if (state !== 'lock') return;
      const fp = $('#fp');
      fp.classList.add('scan');
      await FD.wait(1100);
      if (!el.isConnected || state !== 'lock') return;
      unlock('· the fingerprint matches the one stored on the device');
    }

    // thief simulation
    const fmtDur = (s) => (s < 3600 ? Math.round(s / 60) + ' minutes' : s < 172800 ? (s / 3600).toFixed(1) + ' hours' : (s / 86400).toFixed(1) + ' days');
    async function thief() {
      if (mode === 'finger') { msg.innerHTML = 'A thief cannot guess a fingerprint. Try a PIN or pattern.'; return; }
      const my = ++token;
      clearTimeout(idleT);
      wrong = 0; waitUntil = 0; state = 'lock'; entry = ''; render();
      const M = MODES[mode];
      for (let i = 0; i < 12; i++) {
        let g;
        do g = mode === 'pattern' ? [...'012345678'].sort(() => Math.random() - 0.5).slice(0, 4).join('') : String(Math.floor(Math.random() * 10 ** M.code.length)).padStart(M.code.length, '0');
        while (g === M.code);
        while (Date.now() < waitUntil) { await FD.wait(100); if (my !== token) return; }
        for (const ch of g) {
          await FD.wait(mode === 'pattern' ? 70 : 45);
          if (my !== token) return;
          if (state !== 'lock') return;
          entry += ch;
          if (mode === 'pattern') drawPattern(); else render();
        }
        await FD.wait(120);
        if (my !== token) return;
        const r = fail();
        if (r === 'wiped') break;
      }
      if (my !== token) return;
      const c = M.combos;
      const lines = [`At 1 guess per second, trying all <b>${FD.fmt(c)}</b> combinations takes about <b>${fmtDur(c)}</b>.`];
      if (opts.wait) lines.push(`With a 30 s wait after every 3 guesses: about <b>${fmtDur(c + (c / 3) * 30)}</b>.`);
      if (opts.wipe) lines.push(`With wipe after 10 attempts, the thief only gets 10 guesses: a <b>${(1000 / c).toFixed(c > 99999 ? 4 : 2)}%</b> chance.`);
      msg.innerHTML += '<br>' + lines.join('<br>');
    }

    // physical security
    async function steal() {
      const g = $('#lapG'), locked = $('#kLock').checked, pm = $('#pMsg');
      $('#steal').disabled = true;
      if (locked) {
        await g.animate([{ transform: 'none' }, { transform: 'translateX(-34px) rotate(-3deg)' }, { transform: 'translateX(-26px)' }, { transform: 'none' }], { duration: FD.dur(900), easing: 'ease-in-out' }).finished.catch(() => {});
        pm.innerHTML = '<strong class="good">✓ The cable lock holds the laptop.</strong> It is fixed to the desk, so it cannot be carried away.';
      } else {
        await g.animate([{ transform: 'none' }, { transform: 'translateX(-260px)', opacity: 0 }], { duration: FD.dur(800), easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
        pm.innerHTML = '<strong class="bad">✗ Stolen!</strong> Without a lock the laptop and all its data are gone.';
        await FD.wait(1400);
        g.getAnimations().forEach((a) => a.cancel());
      }
      if (el.isConnected) $('#steal').disabled = false;
    }
    $('#kLock').addEventListener('change', (e) => { $('#deskScene').classList.toggle('nolock', !e.target.checked); });
    $('#steal').addEventListener('click', steal);

    FD.seg(seg, (v) => { token++; setMode(v); msg.textContent = ''; });
    el.querySelectorAll('[data-o]').forEach((c) => c.addEventListener('change', () => { opts[c.dataset.o] = c.checked; if (c.dataset.o === 'auto') armIdle(); }));
    $('#lockNow').addEventListener('click', () => { token++; lock('<b>🔒 Locked.</b> The PIN is needed to use the device again.'); });
    $('#thief').addEventListener('click', thief);
    scr.addEventListener('pointerdown', () => armIdle());
    setMode('pin4', { lock: false });

    return {
      set({ m = 'pin4', st = 'home', o = {} } = {}) {
        token++;
        clearTimeout(idleT);
        Object.assign(opts, { auto: false, wait: false, wipe: false }, o);
        el.querySelectorAll('[data-o]').forEach((c) => (c.checked = opts[c.dataset.o]));
        wrong = 0; waitUntil = 0; state = st;
        setMode(m, { lock: false });
        msg.textContent = '';
        $('#kLock').checked = true;
        $('#deskScene').classList.remove('nolock');
        $('#pMsg').innerHTML = 'Many devices have a <b>security slot</b>. A lock in the slot is fixed to furniture with a cable.';
      },
      focus(x) { $('.sec-soft').classList.toggle('dim', x === 'phys'); $('.sec-phys').classList.toggle('dim', x === 'soft'); },
      async typeCode(ctx) {
        const code = MODES[mode].code;
        for (const ch of code) { if (!(await ctx.sleep(380))) return; press(ch); }
      },
      armIdle,
      thief,
      finger,
      steal,
      setModeOnly: (m) => setMode(m),
      destroy() { token++; clearTimeout(idleT); },
    };
  },
  steps: [
    {
      title: 'Why do devices need security?',
      text: `<p>The data stored on digital devices may be <strong>private</strong>, <strong>valuable</strong> or both.</p>
             <p>This means devices need <strong>security features</strong> to keep their users’ data safe, from people using them without permission and from theft.</p>`,
      on(a) { a.set({ st: 'home' }); a.focus(null); },
    },
    {
      title: 'Passwords and PINs',
      text: `<p>The operating system can be set so that when the device is turned on, the user must enter a <strong>password</strong> or <strong>PIN</strong> (personal identification number).</p>
             <p>This stops <strong>unauthorised access</strong> to the data.</p>`,
      async on(a, ctx) {
        a.set({ st: 'lock' }); a.focus('soft');
        if (!(await ctx.sleep(500))) return;
        await a.typeCode(ctx);
      },
    },
    {
      title: 'Auto-lock',
      text: `<p>Another common setting <strong>locks</strong> the screen or keyboard if the device has not been used for a set time.</p>
             <p>The password or PIN is then needed to unlock it again. Wait and watch…</p>`,
      on(a) { a.set({ st: 'home', o: { auto: true } }); a.focus('soft'); a.armIdle(); },
    },
    {
      title: 'Too many wrong attempts',
      text: `<p>If a wrong PIN is entered, some devices make the user <strong>wait</strong> a set time before trying again.</p>
             <p>Some even <strong>wipe</strong> the data after only a few failed attempts. This stops criminals from guessing thousands of combinations.</p>`,
      on(a) { a.set({ st: 'lock', o: { wait: true, wipe: true } }); a.focus('soft'); return a.thief(); },
    },
    {
      title: 'Stronger PINs',
      text: `<p>The <strong>longer and more complex</strong> a password is, the better.</p>
             <ul><li>4-digit PIN: <strong>10,000</strong> combinations (0000–9999)</li><li>6-digit PIN: <strong>1,000,000</strong> combinations</li><li>4-point pattern PIN: <strong>389,112</strong> combinations</li></ul>`,
      tip: 'Is your own PIN secure enough? If not, change it!',
      async on(a, ctx) {
        a.set({ st: 'lock' }); a.focus('soft');
        for (const m of ['pin6', 'pattern', 'pin4']) { if (!(await ctx.sleep(1600))) return; a.setModeOnly(m); }
      },
    },
    {
      title: 'Biometrics',
      text: `<p>Some devices use <strong>biometric scanners</strong>, such as fingerprint scanners, so that only authorised users can get to the data on the device.</p>
             <p>A fingerprint cannot be guessed like a PIN.</p>`,
      async on(a, ctx) {
        a.set({ m: 'finger', st: 'lock' }); a.focus('soft');
        if (!(await ctx.sleep(900))) return;
        await a.finger();
      },
    },
    {
      title: 'Physical security',
      text: `<p>Physical security to <strong>prevent theft</strong> is also important.</p>
             <p>Many devices have <strong>security slots</strong>. A lock (such as a Kensington lock) fits into the slot and a cable fixes it to furniture.</p>`,
      async on(a, ctx) {
        a.set(); a.focus('phys');
        if (!(await ctx.sleep(700))) return;
        await a.steal();
      },
    },
    {
      title: 'Try it',
      text: `<p>Unlock the phone with the owner’s PIN, then let the thief guess with different settings.</p>
             <p>Try to steal the laptop with and without the cable lock.</p>`,
      on(a) { a.set({ st: 'lock', o: { auto: true } }); a.focus(null); },
    },
  ],
});
