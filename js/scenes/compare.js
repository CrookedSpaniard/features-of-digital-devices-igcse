FD.add({
  id: 'compare',
  title: 'Compare devices',
  tab: 'Compare',
  icon: 'compare',
  color: '--accent',
  page: true,
  mount(el) {
    const DEV = ['Smartphone', 'Tablet', 'Laptop', 'Desktop PC'];
    // [feature id, label, [rating 1–3 or null, note] × 4]
    const ROWS = [
      ['portability', 'Portability', [[3, 'Fits in a pocket'], [3, 'Light, fits in a bag'], [2, 'Carried in a bag'], [1, 'Stays on a desk']]],
      ['performance', 'Performance', [[2, 'Good for everyday apps'], [2, 'Good for everyday apps'], [2, 'Good to very good'], [3, 'Fastest processors, most RAM']]],
      ['storage', 'Storage', [[1, 'Smallest capacity'], [1, 'Small capacity'], [2, 'Medium capacity'], [3, 'Largest capacity']]],
      ['interfaces', 'User interface', [[null, 'Gesture + voice'], [null, 'Gesture + voice'], [null, 'GUI (some touch)'], [null, 'GUI with mouse']]],
      ['connectivity', 'Connectivity', [[null, 'Wireless + mobile data'], [null, 'Mostly wireless'], [null, 'Wireless + some ports'], [null, 'Wired + wireless']]],
      ['media', 'Media support', [[null, 'Often microSD'], [null, 'Sometimes microSD'], [null, 'Often SD; DVD by adapter'], [null, 'Often DVD; card reader']]],
      ['energy', 'Energy consumption', [[3, 'Very low · battery'], [3, 'Low · battery'], [2, 'Medium · battery'], [1, 'Highest · mains power']]],
      ['expansion', 'Expansion capability', [[1, 'microSD slot at most'], [1, 'Limited'], [2, 'USB ports'], [3, 'Internal slots + many ports']]],
      ['security', 'Security features', [[null, 'PIN, pattern, biometrics'], [null, 'PIN, biometrics'], [null, 'Password, fingerprint, security slot'], [null, 'Password, security slot lock']]],
    ];
    const dots = (r) => (r ? `<span class="dots3" aria-label="${r} out of 3">${[1, 2, 3].map((i) => `<i class="${i <= r ? 'on' : ''}"></i>`).join('')}</span>` : '');
    const SCEN = [
      { q: 'A sales rep travels all day and needs to show photos to clients and reply to emails on the move.', a: ['Smartphone', 'Tablet'], why: 'Portability and wireless connectivity matter most. Both are light, run on battery and connect to mobile data.' },
      { q: 'A film editor works with huge 4K video files and has many programs open at the same time.', a: ['Desktop PC'], why: 'Performance, storage and expansion capability matter most: a fast processor, lots of RAM and room to add drives and graphics cards.' },
      { q: 'A student types long essays at home and in the school library.', a: ['Laptop'], why: 'It is portable enough to carry, has a keyboard and good performance, and works on battery.' },
      { q: 'A driver wants to send messages without taking their hands off the wheel.', a: ['Smartphone'], why: 'A smartphone with a voice interface allows hands-free operation, which improves road safety.' },
    ];
    el.innerHTML = `
      <h2>Compare the devices</h2>
      <p class="lead">Typical features of four common devices. Ratings: <span class="dots3"><i class="on"></i><i class="on"></i><i class="on"></i></span> = best for this feature. Click a feature to go back to its scene.</p>
      <div class="tbl-wrap"><table class="tbl cmp">
        <thead><tr><th>Feature</th>${DEV.map((d) => `<th>${d}</th>`).join('')}</tr></thead>
        <tbody>${ROWS.map(([id, n, cells]) => `<tr><th scope="row"><button class="link-btn" data-go="${id}" style="--c:var(${FD.FEATURES.find((f) => f.id === id).color})">${FD.icon[id]}${n}</button></th>${cells.map(([r, t]) => `<td>${dots(r)}<span>${t}</span></td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>
      <p class="small muted">These are typical devices. Real models vary: a gaming laptop can outperform a basic desktop PC.</p>
      <h3 class="mt">Which device would you choose?</h3>
      <div class="scen">${SCEN.map((s, i) => `
        <div class="card sc" data-i="${i}">
          <p>${s.q}</p>
          <div class="sc-btns">${DEV.map((d) => `<button class="btn small-btn ghost" data-d="${d}">${d}</button>`).join('')}</div>
          <p class="sc-fb" hidden></p>
        </div>`).join('')}</div>`;
    el.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => FD.goto(b.dataset.go)));
    el.querySelectorAll('.sc').forEach((card) => {
      const s = SCEN[+card.dataset.i], fb = card.querySelector('.sc-fb');
      card.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('click', () => {
        const right = s.a.includes(b.dataset.d);
        card.querySelectorAll('[data-d]').forEach((x) => x.classList.remove('right', 'wrong'));
        b.classList.add(right ? 'right' : 'wrong');
        fb.hidden = false;
        fb.className = 'sc-fb ' + (right ? 'good' : 'bad');
        fb.innerHTML = (right ? '✓ Good choice. ' : `✗ Not the best choice. Best: ${s.a.join(' or ')}. `) + s.why;
      }));
    });
  },
});
