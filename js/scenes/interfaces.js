FD.add({
  id: 'interfaces',
  title: 'User interfaces',
  tab: 'User interface',
  icon: 'interfaces',
  color: '--c4',
  feature: true,
  interactive: true,
  vocab: [['user interface', 'the system that allows a user to interact with a device']],
  mount(el) {
    const MODES = [
      ['overview', 'Overview'], ['cli', 'Command line'], ['menu', 'Menu-driven'], ['gui', 'GUI'],
      ['voice', 'Voice'], ['gesture', 'Gesture'], ['compare', 'Compare'],
    ];
    el.innerHTML = `
      <div class="ui">
        <div class="ui-tabs" role="tablist">${MODES.map(([k, n]) => `<button role="tab" data-m="${k}">${n}</button>`).join('')}</div>
        <div class="ui-task" id="uiTask"></div>
        <div class="ui-body" id="uiBody"></div>
      </div>`;
    const body = el.querySelector('#uiBody'), task = el.querySelector('#uiTask');
    let mode = null, sim = {}, token = 0;

    const fileTask = 'open the file <code>report.txt</code>';
    function setTask(html) {
      task.hidden = !html;
      task.className = 'ui-task';
      task.innerHTML = html ? `<span><b>Task:</b> ${html}</span><span class="ui-count">Actions: <b id="uiCount">0</b></span>` : '';
    }
    function count() { const c = task.querySelector('#uiCount'); if (c) c.textContent = +c.textContent + 1; }
    function done(text) {
      task.classList.add('done');
      const n = task.querySelector('#uiCount')?.textContent;
      task.innerHTML = `<span><b>✓ Task complete</b> · ${text}</span><span class="ui-count">Actions: <b>${n}</b></span>`;
    }
    const ok = (my) => my === token && el.isConnected;

    // ---------- overview ----------
    function overview() {
      setTask('');
      const C = [
        ['cli', 'Command line interface', 'Type text commands.', '<span class="mono">C:\\&gt;_</span>'],
        ['menu', 'Menu-driven interface', 'Choose options from lists.', '☰'],
        ['gui', 'Graphical user interface', 'Windows, icons, menus, pointer.', '🖱️'],
        ['voice', 'Voice interface', 'Speak commands.', '🎙️'],
        ['gesture', 'Gesture interface', 'Swipe and pinch a touch screen.', '👆'],
      ];
      body.innerHTML = `<div class="ui-over">${C.map(([k, n, d, i]) => `<button class="uo" data-go="${k}"><span class="uo-i">${i}</span><strong>${n}</strong><small>${d}</small></button>`).join('')}</div>`;
      body.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => show(b.dataset.go)));
      return {};
    }

    // ---------- command line ----------
    function cli() {
      setTask(fileTask);
      body.innerHTML = `
        <div class="ui-split">
          <div class="term">
            <div class="term-bar"><span></span><span></span><span></span> Command Prompt</div>
            <div class="term-out" id="tOut"><div>Microsoft-style command line · type HELP for commands</div><div>&nbsp;</div></div>
            <form class="term-line" id="tForm"><span class="prompt">C:\\Users\\Student&gt;</span><input id="tIn" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Type a command"></form>
          </div>
          <div class="ui-side">
            <p class="ui-hint">Click the black window and type a command, then press Enter.</p>
            <p class="ui-hint">Try: <code>HELP</code> · <code>DIR</code> · <code>OPEN report.txt</code></p>
            <ul class="pc"><li class="pro">Needs very little memory, so it is found on older systems and devices with limited storage.</li><li class="con">Commands must be typed <strong>precisely</strong>. It only recognises certain commands.</li></ul>
          </div>
        </div>`;
      const out = body.querySelector('#tOut'), input = body.querySelector('#tIn'), form = body.querySelector('#tForm');
      const FILES = ['report.txt', 'notes.txt', 'photo.jpg'];
      const line = (t, cls = '') => { const d = document.createElement('div'); d.className = cls; d.textContent = t; out.appendChild(d); out.scrollTop = out.scrollHeight; };
      function exec(raw) {
        const cmd = raw.trim();
        line('C:\\Users\\Student>' + cmd, 'echo');
        if (!cmd) return;
        count();
        const [c, ...rest] = cmd.split(/\s+/);
        const arg = rest.join(' ');
        switch (c.toLowerCase()) {
          case 'help':
            line('DIR            List the files in this folder');
            line('OPEN <file>    Open a file');
            line('CLS            Clear the screen');
            line('HELP           Show this list of commands');
            break;
          case 'dir': case 'ls':
            FILES.forEach((f) => line('   ' + f));
            break;
          case 'cls':
            out.innerHTML = '';
            break;
          case 'open':
            if (!arg) line('Which file? Example: OPEN report.txt', 'err');
            else if (FILES.includes(arg.toLowerCase())) {
              line(`Opening ${arg.toLowerCase()}…`, 'okl');
              if (arg.toLowerCase() === 'report.txt') { line('ICT REPORT — Features of digital devices', 'okl'); done('the file opened.'); }
            } else line(`The system cannot find the file "${arg}".`, 'err');
            break;
          default:
            line(`'${c}' is not recognised as a command. Type HELP for a list of commands.`, 'err');
        }
      }
      form.addEventListener('submit', (e) => { e.preventDefault(); exec(input.value); input.value = ''; });
      body.querySelector('.term').addEventListener('click', () => input.focus({ preventScroll: true }));
      async function typeCmd(text, ctx) {
        input.value = '';
        for (const ch of text) {
          if (!(await ctx.sleep(85))) return false;
          input.value += ch;
        }
        if (!(await ctx.sleep(350))) return false;
        exec(input.value);
        input.value = '';
        return true;
      }
      return {
        async demo(ctx) {
          if (!(await ctx.sleep(500))) return;
          if (!(await typeCmd('opne report.txt', ctx))) return;
          if (!(await ctx.sleep(1100))) return;
          if (!(await typeCmd('help', ctx))) return;
          if (!(await ctx.sleep(1300))) return;
          await typeCmd('open report.txt', ctx);
        },
      };
    }

    // ---------- menu-driven ----------
    function menu() {
      setTask(fileTask);
      const leaf = (t) => ({ t, act: 'other' });
      const fileMenu = (name) => ({ title: name, items: [{ t: 'Open', act: name === 'report.txt' ? 'open' : 'other' }, leaf('Print'), leaf('Delete')] });
      const TREE = {
        title: 'Main menu', items: [
          { t: 'Files', sub: { title: 'Files', items: [
            { t: 'Documents', sub: { title: 'Documents', items: [{ t: 'report.txt', sub: fileMenu('report.txt') }, { t: 'notes.txt', sub: fileMenu('notes.txt') }] } },
            { t: 'Pictures', sub: { title: 'Pictures', items: [leaf('beach.jpg'), leaf('school.jpg')] } },
          ] } },
          { t: 'Settings', sub: { title: 'Settings', items: [leaf('Brightness'), leaf('Language'), leaf('Sound')] } },
          { t: 'Media', sub: { title: 'Media', items: [leaf('Music'), leaf('Videos')] } },
        ],
      };
      body.innerHTML = `
        <div class="ui-split">
          <div class="menu-dev">
            <div class="menu-scr" id="mScr"></div>
            <div class="menu-keys">
              <button data-k="up" aria-label="Up">▲</button><button data-k="down" aria-label="Down">▼</button>
              <button data-k="ok" class="okk">OK</button><button data-k="back">◀ Back</button>
            </div>
          </div>
          <div class="ui-side">
            <p class="ui-hint">Use ▲ ▼ and <b>OK</b>, or click an option.</p>
            <ul class="pc"><li class="pro">Easier to use than a command line: you just pick from a list.</li><li class="con">Can take <strong>more time</strong>: you go through the menu structure every time.</li><li class="eg">Used in ATMs (cash machines), televisions and older mobile phones.</li></ul>
          </div>
        </div>`;
      const scr = body.querySelector('#mScr');
      let stack = [TREE], sel = 0, opened = false;
      function render(flash) {
        const m = stack[stack.length - 1];
        const path = stack.map((s) => s.title).join(' › ');
        scr.innerHTML = opened
          ? `<div class="m-path">${path}</div><div class="m-open">📄 report.txt<br><small>ICT REPORT — Features of digital devices</small></div>`
          : `<div class="m-path">${path}</div><ol class="m-list">${m.items.map((it, i) => `<li class="${i === sel ? 'sel' : ''}" data-i="${i}">${it.t}${it.sub ? ' <span>›</span>' : ''}</li>`).join('')}</ol>${flash ? `<div class="m-flash">${flash}</div>` : ''}`;
        scr.querySelectorAll('li').forEach((li) => li.addEventListener('click', () => { sel = +li.dataset.i; press('ok', true); }));
      }
      function press(k, fromClick) {
        if (opened && k !== 'back') return;
        count();
        const m = stack[stack.length - 1];
        let flash = '';
        if (k === 'up') sel = (sel - 1 + m.items.length) % m.items.length;
        if (k === 'down') sel = (sel + 1) % m.items.length;
        if (k === 'back') { opened = false; if (stack.length > 1) { stack.pop(); sel = 0; } }
        if (k === 'ok') {
          const it = m.items[sel];
          if (it.sub) { stack.push(it.sub); sel = 0; }
          else if (it.act === 'open') { opened = true; done('the file opened from the menu.'); }
          else flash = `“${it.t}” is not part of the task.`;
        }
        render(flash);
        const key = body.querySelector(`.menu-keys [data-k="${k}"]`);
        if (key && !fromClick) { key.classList.add('hit'); setTimeout(() => key.classList.remove('hit'), 180); }
      }
      body.querySelectorAll('.menu-keys button').forEach((b) => b.addEventListener('click', () => press(b.dataset.k)));
      render();
      return {
        async demo(ctx) {
          for (const k of ['ok', 'ok', 'down', 'up', 'ok', 'ok']) {
            if (!(await ctx.sleep(900))) return;
            press(k);
          }
        },
      };
    }

    // ---------- GUI ----------
    function gui() {
      setTask(fileTask);
      const folder = '<svg viewBox="0 0 40 32"><path d="M2 6a3 3 0 0 1 3-3h10l4 4h16a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z" fill="#fcc419"/><path d="M2 12h36v15a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z" fill="#ffd43b"/></svg>';
      const bin = '<svg viewBox="0 0 40 40"><path d="M9 11h22l-2 25H11z" fill="#adb5bd"/><rect x="6" y="6" width="28" height="5" rx="2" fill="#868e96"/><path d="M15 15v17M20 15v17M25 15v17" stroke="#fff" stroke-width="2"/></svg>';
      const globe = '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#4dabf7"/><path d="M4 20h32M20 4c-6 6-6 26 0 32M20 4c6 6 6 26 0 32" stroke="#fff" stroke-width="2" fill="none"/></svg>';
      const doc = '<svg viewBox="0 0 30 38"><path d="M3 2h17l7 7v27H3z" fill="#fff" stroke="#adb5bd" stroke-width="2"/><path d="M8 15h14M8 20h14M8 25h10" stroke="#1c7ed6" stroke-width="2"/></svg>';
      body.innerHTML = `
        <div class="gui">
          <div class="desk" id="desk">
            <div class="dicons">
              <button class="dicon" data-a="docs">${folder}<span>Documents</span><em class="wl">Icon</em></button>
              <button class="dicon" data-a="web">${globe}<span>Browser</span></button>
              <button class="dicon" data-a="bin">${bin}<span>Recycle bin</span></button>
            </div>
            <div class="win" id="win" hidden>
              <div class="win-bar"><span>📁 Documents</span><button class="win-x" data-close="win" aria-label="Close">✕</button><em class="wl">Window</em></div>
              <div class="win-menu"><button class="wm" id="wmFile">File</button><span>Edit</span><span>View</span><em class="wl">Menu</em>
                <div class="drop" id="drop" hidden><button data-d="open">Open</button><button data-d="rename">Rename</button><button data-close="win">Close</button></div>
              </div>
              <div class="win-files">
                <button class="wf" data-f="report.txt">${doc}<span>report.txt</span></button>
                <button class="wf" data-f="notes.txt">${doc}<span>notes.txt</span></button>
              </div>
            </div>
            <div class="win win-doc" id="docw" hidden>
              <div class="win-bar"><span>📄 report.txt</span><button class="win-x" data-close="docw" aria-label="Close">✕</button></div>
              <div class="doc-body"><b>ICT REPORT</b><br>Features of digital devices…</div>
            </div>
            <div class="ptr" id="ptr" hidden><svg viewBox="0 0 20 28"><path d="M2 2v21l5.5-5.5 4 8.5 3.5-1.6-4-8.4H18z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg><em class="wl">Pointer</em></div>
          </div>
          <div class="gui-bar">
            <label class="tgl"><input type="checkbox" id="wimp"> Show <b>WIMP</b> labels</label>
            <span class="ui-hint">Click Documents, select report.txt, then <b>File › Open</b> (or double-click it).</span>
          </div>
          <ul class="pc"><li class="pro">The <strong>easiest</strong> type of interface to use.</li><li class="con">Takes up <strong>more memory and storage</strong> than a command line or menu-driven interface.</li></ul>
        </div>`;
      const $ = (s) => body.querySelector(s);
      const desk = $('#desk'), win = $('#win'), docw = $('#docw'), drop = $('#drop'), ptr = $('#ptr');
      let selected = null;
      const openDoc = () => { docw.hidden = false; drop.hidden = true; done('the file opened in a window.'); };
      desk.addEventListener('click', (e) => {
        const t = e.target;
        const icon = t.closest('.dicon');
        if (icon) {
          count();
          if (icon.dataset.a === 'docs') win.hidden = false;
          else FD.shake(icon);
          return;
        }
        const close = t.closest('[data-close]');
        if (close) { count(); $('#' + close.dataset.close).hidden = true; drop.hidden = true; return; }
        if (t.closest('#wmFile')) { count(); drop.hidden = !drop.hidden; return; }
        const d = t.closest('[data-d]');
        if (d) {
          count();
          if (d.dataset.d === 'open' && selected === 'report.txt') openDoc();
          else if (d.dataset.d === 'open') { drop.hidden = true; FD.shake(win); }
          else drop.hidden = true;
          return;
        }
        const f = t.closest('.wf');
        if (f) {
          count();
          selected = f.dataset.f;
          body.querySelectorAll('.wf').forEach((x) => x.classList.toggle('sel', x === f));
          return;
        }
        drop.hidden = true;
      });
      desk.addEventListener('dblclick', (e) => {
        const f = e.target.closest('.wf');
        if (f && f.dataset.f === 'report.txt') openDoc();
      });
      const wimp = $('#wimp');
      wimp.addEventListener('change', () => labels(wimp.checked));
      function labels(on) {
        wimp.checked = on;
        desk.classList.toggle('show-wl', on);
        if (on) { win.hidden = false; ptr.hidden = false; if (!ptr.style.left) movePtr(desk, 0.7, 0.75, 0); }
      }
      function movePtr(target, fx = 0.5, fy = 0.5, ms = 700) {
        const d = desk.getBoundingClientRect(), r = target.getBoundingClientRect();
        ptr.hidden = false;
        ptr.style.transitionDuration = FD.dur(ms) + 'ms';
        ptr.style.left = (r.left - d.left + r.width * fx) + 'px';
        ptr.style.top = (r.top - d.top + r.height * fy) + 'px';
        return FD.wait(ms + 120);
      }
      async function clickAt(sel, ctx, fx, fy) {
        const target = typeof sel === 'string' ? $(sel) : sel;
        await movePtr(target, fx, fy);
        if (!ctx.alive()) return false;
        ptr.classList.add('click');
        setTimeout(() => ptr.classList.remove('click'), 220);
        target.click();
        return ctx.sleep(500);
      }
      return {
        labels,
        async demo(ctx) {
          movePtr(desk, 0.75, 0.8, 0);
          if (!(await ctx.sleep(500))) return;
          if (!(await clickAt('.dicon[data-a="docs"]', ctx))) return;
          if (!(await clickAt('.wf[data-f="report.txt"]', ctx))) return;
          if (!(await clickAt('#wmFile', ctx))) return;
          if (!(await clickAt('[data-d="open"]', ctx))) return;
          if (!(await ctx.sleep(900))) return;
          labels(true);
        },
      };
    }

    // ---------- voice ----------
    function voice() {
      setTask('say a command to open your report');
      const LIB = ['open', 'close', 'report', 'sport', 'play', 'music', 'call', 'weather', 'lights', 'my'];
      body.innerHTML = `
        <div class="voice">
          <div class="v-dev">
            ${FD.dev.speaker()}
            <div class="wave" id="wave">${'<i></i>'.repeat(24)}</div>
            <label class="tgl"><input type="checkbox" id="net" checked> Internet connection</label>
          </div>
          <div class="v-main">
            <p class="ui-hint">What do you say?</p>
            <div class="v-say">
              <button class="btn" data-say="clear">🗣️ “Open my report”</button>
              <button class="btn" data-say="mumble">🗣️ “Opn m’…port” <small>(noisy room)</small></button>
            </div>
            <ol class="v-steps" id="vSteps">
              <li data-s="rec">Record the spoken words</li>
              <li data-s="send">Send them to the online word library ☁️</li>
              <li data-s="match">Match the words against the library</li>
              <li data-s="conf">Check the instruction with the user</li>
            </ol>
            <div class="v-lib" id="vLib">${LIB.map((w) => `<span data-w="${w}">${w}</span>`).join('')}</div>
            <div class="v-conf" id="vConf" hidden><span id="vQ"></span><button class="btn small-btn" data-ans="yes">Yes</button><button class="btn small-btn ghost" data-ans="no">No</button></div>
            <p class="v-msg" id="vMsg" aria-live="polite"></p>
          </div>
        </div>
        <ul class="pc"><li class="pro"><strong>Hands-free</strong>, so it is often used in vehicles to improve road safety, and in smart speakers.</li><li class="con">The software sometimes cannot find a match, or picks the <strong>wrong</strong> match, which produces unwanted results.</li><li class="con">The word library is often stored online, so it usually needs <strong>internet access</strong>.</li></ul>`;
      const $ = (s) => body.querySelector(s);
      const wave = $('#wave'), steps = $('#vSteps'), lib = $('#vLib'), conf = $('#vConf'), msg = $('#vMsg'), net = $('#net');
      let busy = false, answer = null, my = 0;
      const mark = (s, cls) => { const li = steps.querySelector(`[data-s="${s}"]`); li.className = cls; };
      function resetFlow() {
        steps.querySelectorAll('li').forEach((li) => (li.className = ''));
        lib.querySelectorAll('span').forEach((s) => (s.className = ''));
        conf.hidden = true;
        msg.innerHTML = '';
      }
      async function record(ms) {
        wave.classList.add('on');
        const bars = [...wave.children], end = performance.now() + FD.dur(ms);
        while (performance.now() < end) {
          bars.forEach((b) => (b.style.height = (12 + Math.random() * 88) + '%'));
          await new Promise((r) => setTimeout(r, 90));
        }
        bars.forEach((b) => (b.style.height = ''));
        wave.classList.remove('on');
      }
      async function say(kind, auto) {
        if (busy) return;
        busy = true;
        const me = ++my;
        count();
        resetFlow();
        const alive = () => me === my && ok(token0);
        mark('rec', 'now');
        await record(1300);
        if (!alive()) return;
        mark('rec', 'ok');
        mark('send', 'now');
        await FD.wait(700);
        if (!alive()) return;
        if (!net.checked) {
          mark('send', 'bad');
          msg.innerHTML = '<strong class="bad">✗ No internet connection.</strong> The word library is stored online, so the command cannot be matched.';
          busy = false;
          return;
        }
        mark('send', 'ok');
        mark('match', 'now');
        const target = kind === 'clear' ? ['open', 'my', 'report'] : ['open', 'my', 'sport'];
        for (const w of LIB) {
          const s = lib.querySelector(`[data-w="${w}"]`);
          s.className = 'scan';
          await FD.wait(130);
          if (!alive()) return;
          s.className = target.includes(w) ? 'hit' : '';
        }
        mark('match', 'ok');
        mark('conf', 'now');
        const heard = kind === 'clear' ? 'Open my report' : 'Open my sport';
        $('#vQ').innerHTML = `Did you say <b>“${heard}”</b>?`;
        conf.hidden = false;
        answer = null;
        if (auto) { await FD.wait(1400); if (!alive()) return; answer = auto; }
        else await new Promise((r) => { const iv = setInterval(() => { if (answer || !alive()) { clearInterval(iv); r(); } }, 100); });
        if (!alive()) return;
        conf.hidden = true;
        if (answer === 'yes' && kind === 'clear') {
          mark('conf', 'ok');
          msg.innerHTML = '<strong class="good">✓ Opening report.txt.</strong> The device also uses your confirmation to “learn” your voice.';
          done('the voice command was matched and confirmed.');
        } else if (answer === 'yes') {
          mark('conf', 'bad');
          msg.innerHTML = '<strong class="bad">✗ Unwanted result:</strong> searching the web for “sport”… The wrong match was accepted.';
        } else {
          mark('conf', 'ok');
          msg.innerHTML = '<strong>Sorry, please say that again.</strong> Checking with the user stopped a wrong command. The device learns from this to improve future matches.';
        }
        busy = false;
      }
      const token0 = token;
      body.querySelectorAll('[data-say]').forEach((b) => b.addEventListener('click', () => { if (!busy) say(b.dataset.say); }));
      conf.addEventListener('click', (e) => { const b = e.target.closest('[data-ans]'); if (b) answer = b.dataset.ans; });
      return {
        async demo(ctx) {
          if (!(await ctx.sleep(400))) return;
          await say('clear', 'yes');
          if (!(await ctx.sleep(1800))) return;
          busy = false;
          await say('mumble', 'no');
        },
        stop() { my++; busy = false; },
      };
    }

    // ---------- gesture ----------
    function gesture() {
      setTask('swipe to the <b>beach</b> photo, then pinch to zoom in');
      const photos = [
        ['Mountains', '<rect width="100" height="100" fill="#a5d8ff"/><path d="M0 80l28-40 18 22 18-30 36 48v20H0z" fill="#5c7cfa"/><path d="M28 40l6 9-12 0z M64 32l7 10-14 0z" fill="#fff"/>'],
        ['City', '<rect width="100" height="100" fill="#ffd8a8"/><circle cx="76" cy="24" r="10" fill="#ff922b"/>' + [[8, 50], [24, 36], [40, 58], [56, 30], [74, 46]].map(([x, h]) => `<rect x="${x}" y="${100 - h - 10}" width="14" height="${h + 10}" fill="#495057"/>`).join('')],
        ['Beach', '<rect width="100" height="100" fill="#74c0fc"/><circle cx="72" cy="26" r="11" fill="#ffd43b"/><path d="M0 62c20-6 40 6 60 0s30-6 40-2v40H0z" fill="#1c7ed6"/><path d="M0 78c25-8 60-6 100 0v22H0z" fill="#ffe066"/><path d="M22 78c0-14 2-24 6-30" stroke="#8d5524" stroke-width="3" fill="none"/><path d="M28 48c-8-2-14 2-16 6M28 48c6-6 14-4 18 0M28 48c-2-8 4-12 8-12" stroke="#2f9e44" stroke-width="3" fill="none"/>'],
      ];
      body.innerHTML = `
        <div class="ui-split">
          <div class="g-phone">
            <div class="g-scr" id="gScr">
              <div class="g-track" id="gTrack">${photos.map(([n, s]) => `<figure><svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">${s}</svg><figcaption>${n}</figcaption></figure>`).join('')}</div>
              <span class="finger f1" id="f1"></span><span class="finger f2" id="f2"></span>
            </div>
            <div class="g-dots" id="gDots">${photos.map(() => '<i></i>').join('')}</div>
          </div>
          <div class="ui-side">
            <p class="ui-hint"><b>Swipe:</b> drag the photo left or right.</p>
            <p class="ui-hint"><b>Pinch:</b> use two fingers on a touch screen, or these buttons:</p>
            <div class="g-btns"><button class="btn small-btn" data-z="in">Pinch out · zoom in</button><button class="btn small-btn ghost" data-z="out">Pinch in · zoom out</button></div>
            <ul class="pc"><li class="pro">Control the device by <strong>swiping</strong> one or more fingers across the screen, or <strong>pinching</strong> fingers together to zoom in or out.</li><li class="eg">Commonly found on devices with <strong>touch screens</strong>, such as smartphones and tablets.</li></ul>
          </div>
        </div>`;
      const $ = (s) => body.querySelector(s);
      const scr = $('#gScr'), track = $('#gTrack'), f1 = $('#f1'), f2 = $('#f2');
      let idx = 0, zoom = 1, finished = false;
      function render(dx = 0) {
        track.style.transform = `translateX(calc(${-idx * 100}% + ${dx}px))`;
        [...track.children].forEach((f, i) => (f.querySelector('svg').style.transform = i === idx ? `scale(${zoom})` : ''));
        [...$('#gDots').children].forEach((d, i) => d.classList.toggle('on', i === idx));
        if (!finished && idx === 2 && zoom >= 1.8) { finished = true; done('you used a swipe and a pinch.'); }
      }
      function go(d) { const n = Math.max(0, Math.min(photos.length - 1, idx + d)); if (n !== idx) { idx = n; zoom = 1; count(); } track.classList.add('anim'); render(); }
      function setZoom(z) { zoom = Math.max(1, Math.min(3, z)); render(); }
      // pointer gestures
      const pts = new Map();
      let startX = 0, pinch0 = 0, zoom0 = 1;
      scr.addEventListener('pointerdown', (e) => {
        scr.setPointerCapture(e.pointerId);
        pts.set(e.pointerId, e);
        track.classList.remove('anim');
        if (pts.size === 1) startX = e.clientX;
        if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); zoom0 = zoom; }
      });
      scr.addEventListener('pointermove', (e) => {
        if (!pts.has(e.pointerId)) return;
        pts.set(e.pointerId, e);
        if (pts.size === 2) { const [a, b] = [...pts.values()]; setZoom(zoom0 * Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / pinch0); }
        else if (zoom === 1) render(e.clientX - startX);
      });
      const up = (e) => {
        if (!pts.has(e.pointerId)) return;
        const wasPinch = pts.size === 2;
        pts.delete(e.pointerId);
        if (wasPinch) { if (zoom > 1.05) count(); return; }
        if (pts.size === 0) {
          const dx = e.clientX - startX;
          if (zoom === 1 && Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          else { track.classList.add('anim'); render(); }
        }
      };
      scr.addEventListener('pointerup', up);
      scr.addEventListener('pointercancel', up);
      scr.addEventListener('wheel', (e) => { if (e.ctrlKey) { e.preventDefault(); setZoom(zoom * (e.deltaY < 0 ? 1.1 : 0.9)); } }, { passive: false });
      body.querySelectorAll('[data-z]').forEach((b) => b.addEventListener('click', () => { pinchAnim(b.dataset.z === 'in'); count(); }));
      function pinchAnim(zin) {
        scr.classList.add('pinch', zin ? 'zin' : 'zout');
        setZoom(zin ? zoom * 1.5 : zoom / 1.5);
        setTimeout(() => scr.classList.remove('pinch', 'zin', 'zout'), FD.dur(800));
      }
      async function swipeAnim(ctx) {
        scr.classList.add('swipe');
        await FD.wait(450);
        go(1);
        await FD.wait(450);
        scr.classList.remove('swipe');
        return ctx.alive();
      }
      render();
      return {
        async demo(ctx) {
          if (!(await ctx.sleep(500))) return;
          if (!(await swipeAnim(ctx))) return;
          if (!(await ctx.sleep(500))) return;
          if (!(await swipeAnim(ctx))) return;
          if (!(await ctx.sleep(600))) return;
          pinchAnim(true); count();
          if (!(await ctx.sleep(1000))) return;
          pinchAnim(true); count();
        },
      };
    }

    // ---------- compare ----------
    function compare() {
      setTask('');
      const R = [
        ['Command line (CLI)', 'Types text instructions; results are shown as text.', 'Needs little memory and storage.', 'Commands must be typed precisely; only certain commands are recognised.', 'Older systems; devices with limited storage.'],
        ['Menu-driven', 'Selects options from a list (menu); some open more menus.', 'Easier to use than a CLI.', 'Slower: you go through the menu structure each time.', 'ATMs, televisions, older mobile phones.'],
        ['Graphical (GUI)', 'Uses a pointer with windows, icons and menus (WIMP).', 'The easiest type to use.', 'Uses more memory and storage than CLI or menus.', 'Desktop PCs and laptops.'],
        ['Voice', 'Speaks commands; they are matched against a library of words.', 'Hands-free, e.g. safer in vehicles.', 'May fail to match or match wrongly; usually needs internet access.', 'Cars, smart speakers, smartphones.'],
        ['Gesture', 'Swipes fingers across the screen or pinches to zoom.', 'Natural, direct control of what is on screen.', 'Needs a touch screen.', 'Smartphones and tablets.'],
      ];
      body.innerHTML = `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Interface</th><th>How the user gives commands</th><th>Advantage</th><th>Disadvantage</th><th>Found on</th></tr></thead><tbody>${R.map((r) => `<tr>${r.map((c, i) => (i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`)).join('')}</tr>`).join('')}</tbody></table></div>`;
      return {};
    }

    const BUILD = { overview, cli, menu, gui, voice, gesture, compare };
    function show(m) {
      token++;
      if (sim.stop) sim.stop();
      mode = m;
      el.querySelectorAll('.ui-tabs button').forEach((b) => { const on = b.dataset.m === m; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
      body.innerHTML = '';
      body.className = 'ui-body ui-' + m;
      sim = BUILD[m]() || {};
      return sim;
    }
    el.querySelectorAll('.ui-tabs button').forEach((b) => b.addEventListener('click', () => show(b.dataset.m)));
    show('overview');

    return {
      show,
      demo(m, ctx) { const s = show(m); return s.demo ? s.demo(ctx) : null; },
      destroy() { token++; if (sim.stop) sim.stop(); },
    };
  },
  steps: [
    {
      title: 'Talking to a device',
      text: `<p>Users give commands to a device through the <strong>user interface</strong>.</p>
             <p>There are several different types. In each one, you will try the same task: <em>open a file</em>.</p>`,
      on(a) { a.show('overview'); },
    },
    {
      title: 'Command line interface (CLI)',
      text: `<p>Users <strong>type text instructions</strong> and the computer replies with text.</p>
             <p>Commands must be typed <strong>precisely</strong>, because only certain commands are recognised. There is usually a <strong>help</strong> menu that lists them.</p>
             <p>It needs little memory, so it is found on older systems and devices with limited storage.</p>`,
      on: (a, ctx) => a.demo('cli', ctx),
    },
    {
      title: 'Menu-driven interface',
      text: `<p>A list of options is shown as a <strong>menu</strong>. Selecting one either runs a command or opens <strong>another menu</strong>.</p>
             <p>Easier to use than a command line, but it can take <strong>more time</strong> because you go through the menu structure each time.</p>
             <p>Examples: ATMs, televisions and older mobile phones.</p>`,
      on: (a, ctx) => a.demo('menu', ctx),
    },
    {
      title: 'Graphical user interface (GUI)',
      text: `<p>A GUI is controlled by a <strong>pointer</strong> and uses <strong>windows</strong>, <strong>icons</strong> and <strong>menus</strong>: <strong>WIMP</strong>.</p>
             <ul><li><b>Windows</b>: areas of the screen for applications or operating system tasks.</li><li><b>Icons</b>: small images that represent an application.</li><li><b>Menus</b>: options for the operating system or open application.</li></ul>
             <p>The <strong>easiest</strong> to use, but it takes up <strong>more memory and storage</strong>.</p>`,
      on: (a, ctx) => a.demo('gui', ctx),
    },
    {
      title: 'Voice interface',
      text: `<p>The user gives <strong>spoken commands</strong>. Voice recognition software matches the words against a <strong>library of words</strong>, often stored <strong>online</strong>, so internet access is usually needed.</p>
             <p>Sometimes there is no match, or a wrong one, so the device may <strong>check with the user</strong> first. It can use this to learn the user\u2019s voice.</p>
             <p>Advantage: <strong>hands-free</strong>, so it improves road safety in vehicles.</p>`,
      on: (a, ctx) => a.demo('voice', ctx),
    },
    {
      title: 'Gesture interface',
      text: `<p>The user controls the device by <strong>swiping</strong> one or more fingers across the screen, or by <strong>pinching</strong> fingers together to zoom in or out.</p>
             <p>Commonly found on devices with <strong>touch screens</strong>.</p>`,
      on: (a, ctx) => a.demo('gesture', ctx),
    },
    {
      title: 'Compare the interfaces',
      text: `<p>Each interface has advantages and disadvantages, so different devices use different interfaces.</p>
             <p>Use the tabs to try any interface again.</p>`,
      tip: 'Exam tip: a common question asks you to <strong>compare</strong> two interfaces. Give a point for <strong>each</strong> one, linked with words like “whereas”.',
      on(a) { a.show('compare'); },
    },
  ],
});
