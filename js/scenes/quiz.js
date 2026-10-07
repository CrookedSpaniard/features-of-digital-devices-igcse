FD.add({
  id: 'quiz',
  title: 'Quiz',
  tab: 'Quiz',
  icon: 'quiz',
  color: '--accent',
  page: true,
  mount(el) {
    // [question, options (first is correct), explanation]
    const Q = [
      ['The portability of a device is directly related to its…', ['size and weight', 'processor speed', 'storage capacity', 'type of user interface'], 'Smaller, lighter devices are easier to carry and move around.'],
      ['What is virtual memory?', ['Storage used as an overflow when RAM is full', 'Extra RAM built into the processor', 'Memory that is stored on the internet', 'A type of memory card'], 'When the space in RAM runs out, storage is used as an overflow. It is slower than RAM.'],
      ['Which upgrade would let a computer run more programs at the same time?', ['More RAM', 'A bigger monitor', 'A wireless connection', 'A longer password'], 'RAM holds the instructions of the programs being run, so more RAM means more programs at once.'],
      ['Why is a command line interface often used on devices with limited storage?', ['It requires little memory', 'It is the easiest interface to use', 'It does not need a keyboard', 'It uses icons instead of text'], 'A CLI only shows text, so it needs very little memory and storage.'],
      ['Which of these devices typically uses a menu-driven interface?', ['An ATM (cash machine)', 'A smart speaker', 'A touch-screen tablet', 'A games console controller'], 'ATMs, televisions and older mobile phones use menu-driven interfaces.'],
      ['What does WIMP stand for?', ['Windows, icons, menus, pointer', 'Wireless internet mobile phone', 'Windows, internet, memory, processor', 'Wired input, media, ports'], 'A GUI uses windows, icons and menus, controlled by a pointer.'],
      ['Why do voice interfaces usually need internet access?', ['The library of words is often stored online', 'The microphone only works online', 'Voice files are too big for RAM', 'To download the user’s voice'], 'Storing the word library online saves storage space on the device.'],
      ['Which is a disadvantage of wired connectivity?', ['Cables can be a tripping hazard', 'It is slower than wireless', 'It is less reliable than wireless', 'It cannot be used to back up files'], 'Wired is usually faster and more reliable, but brings cost, mess, inconvenience and safety risks.'],
      ['A thin laptop has no DVD drive. How can it read a DVD?', ['Connect an external DVD drive with an adapter', 'Install more RAM', 'Use a gesture interface', 'It is impossible'], 'If a device has no native media support, an adapter or external drive can usually be connected.'],
      ['What is one benefit of lower energy consumption in mobile devices?', ['A longer battery life', 'More storage space', 'A faster wired connection', 'A bigger screen'], 'Using less energy means the battery lasts longer between charges.'],
      ['Adding a microSD card to a smartphone is an example of…', ['expansion capability', 'portability', 'a voice interface', 'virtual memory'], 'Expansion slots let a device use flash memory cards to add storage.'],
      ['How many possible combinations does a 4-digit PIN have?', ['10,000', '1,000', '389,112', '1,000,000'], 'From 0000 to 9999 there are 10,000 combinations. A 6-digit PIN has 1,000,000.'],
      ['Which of these is a physical security feature?', ['A cable lock in a security slot', 'A pattern PIN', 'Auto-lock after a set time', 'Wiping data after failed attempts'], 'Physical security prevents theft, for example a Kensington lock fixed to furniture.'],
    ];
    const LONG = [
      { q: 'Explain <b>two</b> ways the performance of a laptop could be improved.', m: 4, s: ['A faster processor (1) so software instructions are carried out more quickly (1).', 'More RAM (1) so more programs can run at the same time / less virtual memory is needed (1).', 'Faster storage, e.g. an SSD (1) so instructions load into RAM faster (1).', 'More efficient software (1) that makes the most of the processor’s capabilities (1).'] },
      { q: 'A car has a voice interface. Describe <b>one</b> advantage and <b>one</b> disadvantage of using it while driving.', m: 4, s: ['Advantage: hands-free operation (1) so the driver keeps their hands on the wheel / improves road safety (1).', 'Disadvantage: the software may not find a match or may pick the wrong one (1) which produces unwanted results (1).', 'Disadvantage: the word library is often stored online (1) so it may not work without an internet connection (1).'] },
      { q: 'A school lends laptops to students. Describe <b>one</b> software and <b>one</b> physical security feature that would protect the laptops and their data.', m: 4, s: ['Software: a password / PIN when the laptop is turned on (1) so only authorised users can access the data (1).', 'Software: auto-lock after a set time / wipe after failed attempts / biometric scanner (1) with a matching reason (1).', 'Physical: a security cable lock in the security slot (1) fixed to furniture so the laptop cannot be stolen (1).'] },
    ];
    const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
    let answered = 0, right = 0;
    function build() {
      answered = 0; right = 0;
      el.innerHTML = `
        <h2>Check your understanding</h2>
        <p class="score" id="score"></p>
        <ol class="quiz" id="quiz">${Q.map(([q, opts], i) => `
          <li class="card qz" data-i="${i}"><p class="qz-q">${q}</p>
            <div class="qz-opts">${shuffle(opts.map((o, k) => [o, k === 0])).map(([o, ok]) => `<button class="opt" data-ok="${ok}">${o}</button>`).join('')}</div>
            <p class="qz-fb" hidden></p></li>`).join('')}</ol>
        <h3 class="mt">Exam-style questions</h3>
        ${LONG.map((l, i) => `
          <div class="card long">
            <p>${l.q} <span class="marks">[${l.m} marks]</span></p>
            <textarea rows="4" placeholder="Write your answer here, then check the mark scheme…" aria-label="Answer ${i + 1}"></textarea>
            <button class="btn small-btn" data-ms="${i}">Show mark scheme</button>
            <ul class="scheme" id="ms${i}" hidden>${l.s.map((s) => `<li>${s}</li>`).join('')}</ul>
          </div>`).join('')}
        <button class="btn ghost" id="retry">↺ Try the quiz again</button>`;
      el.querySelectorAll('.qz').forEach((li) => {
        const i = +li.dataset.i, fb = li.querySelector('.qz-fb');
        li.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
          if (li.classList.contains('done')) return;
          li.classList.add('done');
          const ok = b.dataset.ok === 'true';
          answered++; right += ok;
          b.classList.add(ok ? 'right' : 'wrong');
          li.querySelector('[data-ok="true"]').classList.add('right');
          fb.hidden = false;
          fb.className = 'qz-fb ' + (ok ? 'good' : 'bad');
          fb.textContent = (ok ? '✓ Correct. ' : '✗ Not quite. ') + Q[i][2];
          score();
        }));
      });
      el.querySelectorAll('[data-ms]').forEach((b) => b.addEventListener('click', () => {
        const ul = el.querySelector('#ms' + b.dataset.ms);
        ul.hidden = !ul.hidden;
        b.textContent = ul.hidden ? 'Show mark scheme' : 'Hide mark scheme';
      }));
      el.querySelector('#retry').addEventListener('click', () => { build(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
      score();
    }
    function score() {
      const s = el.querySelector('#score');
      s.innerHTML = answered < Q.length
        ? `Answered <b>${answered}</b> of ${Q.length} · Score <b>${right}</b>`
        : `Finished! You scored <b>${right} / ${Q.length}</b>. ${right >= 11 ? 'Excellent work! 🎉' : right >= 8 ? 'Good job. Review the ones you missed.' : 'Go back through the scenes and try again.'}`;
    }
    build();
  },
});
