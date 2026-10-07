FD.add({
  id: 'terms',
  title: 'Key terms',
  tab: 'Key terms',
  icon: 'terms',
  color: '--accent',
  page: true,
  mount(el) {
    const T = [
      ['portability', 'Portability', 'How easy a device is to carry and move around. It depends on the device’s size and weight.'],
      ['performance', 'Performance', 'How quickly a device carries out its tasks. It depends on the processor, RAM, storage speed and how efficient the software is.'],
      ['performance', 'Processor', 'One or more Central Processing Units (CPUs) that carry out software instructions.'],
      ['performance', 'RAM', 'Random Access Memory: the memory used for running software. More RAM lets more programs run at the same time.'],
      ['performance', 'Virtual memory', 'Storage used by the processor once the space in RAM has run out. It is slower than RAM.'],
      ['storage', 'File', 'A collection of data that represents a document, image, database or similar.'],
      ['storage', 'Program', 'A set of instructions that are carried out by the processor.'],
      ['interfaces', 'User interface', 'The system that allows a user to interact with (give commands to) a device.'],
      ['interfaces', 'Command line interface (CLI)', 'The user types text instructions and gets text results. Needs little memory; commands must be typed precisely.'],
      ['interfaces', 'Menu-driven interface', 'Options are shown as a list (menu). Selecting one runs a command or opens another menu. Used in ATMs and TVs.'],
      ['interfaces', 'GUI / WIMP', 'Graphical user interface controlled by a pointer, using windows, icons and menus. Easiest to use, but needs more memory and storage.'],
      ['interfaces', 'Voice interface', 'Spoken commands are matched against a library of words, often stored online. Allows hands-free use.'],
      ['interfaces', 'Gesture interface', 'The user swipes or pinches fingers on a touch screen to control the device.'],
      ['connectivity', 'Connectivity', 'A device’s ability to connect to networks and other devices, using wired or wireless connections.'],
      ['connectivity', 'Back up', 'To make a copy of information stored on a computer in case the original is lost or damaged.'],
      ['media', 'Media', 'Items such as memory cards (SD, microSD) and discs (CD, DVD) that make information available to people and devices.'],
      ['media', 'Adapter', 'An extra device, often connected by USB, that lets a device use media it has no built-in (native) slot for.'],
      ['energy', 'Energy consumption', 'How much electricity a device uses. Lower consumption gives a longer battery life and saves money.'],
      ['expansion', 'Expansion capability', 'The ability to add extra components, memory cards or peripheral devices (for example through USB ports).'],
      ['expansion', 'Peripheral device', 'An extra device connected to a computer, such as a printer, webcam or external drive.'],
      ['security', 'PIN', 'Personal identification number: a numeric code needed to use a device. Longer PINs have more combinations.'],
      ['security', 'Lock', 'To make a device inactive so that it requires a password or PIN to reactivate it.'],
      ['security', 'Wipe', 'To delete data from a device or drive, for example after too many wrong PIN attempts.'],
      ['security', 'Biometric scanner', 'A device, such as a fingerprint scanner, that recognises a person’s body features to allow access.'],
      ['security', 'Security slot', 'A slot on a device for a physical lock (such as a Kensington lock) that is fixed to furniture with a cable.'],
    ];
    el.innerHTML = `
      <h2>Key terms</h2>
      <div class="terms-tools"><input type="search" id="tq" placeholder="Search a term…" aria-label="Search terms"><span class="small muted" id="tn"></span></div>
      <div class="terms" id="terms">${T.map(([f, t, d]) => {
        const c = FD.FEATURES.find((x) => x.id === f).color;
        return `<article class="term" style="--c:var(${c})"><h3>${t}</h3><p>${d}</p><button class="link-btn" data-go="${f}">${FD.icon[f]} See it</button></article>`;
      }).join('')}</div>`;
    const cards = [...el.querySelectorAll('.term')];
    const q = el.querySelector('#tq'), n = el.querySelector('#tn');
    const filter = () => {
      const s = q.value.trim().toLowerCase();
      let k = 0;
      cards.forEach((c) => { const show = !s || c.textContent.toLowerCase().includes(s); c.hidden = !show; k += show; });
      n.textContent = `${k} of ${cards.length} terms`;
    };
    q.addEventListener('input', filter);
    filter();
    el.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => FD.goto(b.dataset.go)));
  },
});
