FD.FEATURES = [
  { id: 'portability', name: 'Portability', color: '--c1', line: 'How easy it is to carry and move around.' },
  { id: 'performance', name: 'Performance', color: '--c2', line: 'How quickly it carries out tasks.' },
  { id: 'storage', name: 'Storage', color: '--c3', line: 'How many files and programs it can keep.' },
  { id: 'interfaces', name: 'User interface', color: '--c4', line: 'How the user gives it commands.' },
  { id: 'connectivity', name: 'Connectivity', color: '--c5', line: 'How it connects to networks and other devices.' },
  { id: 'media', name: 'Media support', color: '--c6', line: 'Which memory cards and discs it can use.' },
  { id: 'energy', name: 'Energy consumption', color: '--c7', line: 'How much electricity it uses.' },
  { id: 'expansion', name: 'Expansion capability', color: '--c8', line: 'Whether extra parts can be added.' },
  { id: 'security', name: 'Security features', color: '--c9', line: 'How it keeps its users’ data safe.' },
];

FD.add({
  id: 'intro',
  title: 'Features of digital devices',
  tab: 'Start',
  icon: 'intro',
  color: '--accent',
  vocab: [['connectivity', 'a device’s ability to connect to networks and other devices']],
  mount(el) {
    el.innerHTML = `
      <div class="intro">
        <div class="intro-devs">
          <figure>${FD.dev.phone(FD.screen.phoneHome)}<figcaption>Smartphone</figcaption></figure>
          <figure>${FD.dev.tablet()}<figcaption>Tablet</figcaption></figure>
          <figure>${FD.dev.laptop(FD.screen.laptopHome)}<figcaption>Laptop</figcaption></figure>
          <figure>${FD.dev.desktop(FD.screen.desktopHome)}<figcaption>Desktop PC</figcaption></figure>
        </div>
        <div class="feat-grid">
          ${FD.FEATURES.map((f, i) => `
            <button class="feat" style="--c:var(${f.color})" data-id="${f.id}">
              <span class="feat-ic">${FD.icon[f.id]}</span>
              <span class="feat-txt"><strong><b>${i + 1}</b> ${f.name}</strong><small>${f.line}</small></span>
            </button>`).join('')}
        </div>
      </div>`;
    const cards = [...el.querySelectorAll('.feat')];
    cards.forEach((c) => c.addEventListener('click', () => FD.goto(c.dataset.id)));
    const grid = el.querySelector('.feat-grid');
    return {
      show(n) {
        cards.forEach((c, i) => { c.classList.toggle('hide', i >= n); c.classList.remove('pop'); });
        grid.classList.remove('glow');
      },
      async pop(ctx) {
        this.show(0);
        for (const c of cards) {
          if (!(await ctx.sleep(280))) { this.show(9); return; }
          c.classList.remove('hide');
          c.classList.add('pop');
        }
      },
      glow() { this.show(9); grid.classList.add('glow'); },
    };
  },
  steps: [
    {
      title: 'What makes devices different?',
      text: `<p>The digital devices that you use have a number of <strong>features</strong>, such as portability, performance and <strong>connectivity</strong>.</p>
             <p>Different devices have different features. That is why we choose a smartphone for some jobs and a desktop computer for others.</p>`,
      on: (a) => a.show(0),
    },
    {
      title: 'Nine features to compare',
      text: `<p>In this lab you will explore <strong>nine features</strong>. For each one, ask yourself:</p>
             <p><em>Which devices are good at this, and why?</em></p>`,
      on: (a, ctx) => a.pop(ctx),
    },
    {
      title: 'How to use this lab',
      text: `<ul>
               <li>Press <strong>Next</strong> (→) to go step by step, or <strong>Play</strong> (Space) to watch.</li>
               <li>Scenes marked <span class="try-inline">Interactive</span> have things to click and change.</li>
               <li>Click any feature card to jump straight to it.</li>
               <li>Finish with <strong>Compare</strong>, <strong>Key terms</strong> and the <strong>Quiz</strong>.</li>
             </ul>`,
      tip: 'Teachers: press <strong>P</strong> for projector mode and <strong>F</strong> for full screen.',
      on: (a) => a.glow(),
    },
  ],
});
