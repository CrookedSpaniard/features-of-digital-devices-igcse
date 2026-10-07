// Shared namespace, helpers, icons and device drawings.
window.FD = (() => {
  'use strict';
  const FD = { scenes: [], speed: 1 };

  FD.add = (scene) => FD.scenes.push(scene);

  // Build one element from an HTML string.
  FD.h = (html) => {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };

  // Durations are divided by the playback speed.
  FD.dur = (ms) => ms / FD.speed;
  FD.wait = (ms) => new Promise((r) => setTimeout(r, FD.dur(ms)));
  FD.fmt = (n) => Math.round(n).toLocaleString('en-GB');

  // Move an element into a new parent with a smooth FLIP animation.
  FD.flip = (el, parent, ms = 650, before = null) => {
    const a = el.getBoundingClientRect();
    parent.insertBefore(el, before);
    const b = el.getBoundingClientRect();
    const anim = el.animate(
      [{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: 'none' }],
      { duration: FD.dur(ms), easing: 'cubic-bezier(.2,.7,.2,1)' }
    );
    return anim.finished.catch(() => {});
  };

  // Animate a clone of `from` flying to where `to` sits.
  FD.flyFrom = (fromEl, toEl, ms = 650) => {
    const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    if (!b.width) return Promise.resolve();
    const s = a.width / b.width || 1;
    const anim = toEl.animate(
      [{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${s})`, transformOrigin: '0 0' },
       { transform: 'none', transformOrigin: '0 0' }],
      { duration: FD.dur(ms), easing: 'cubic-bezier(.2,.7,.2,1)' }
    );
    return anim.finished.catch(() => {});
  };

  FD.shake = (el) => {
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  };

  // Segmented control: <div class="seg" data-key> with <button data-v> children.
  FD.seg = (root, onChange) => {
    root.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]');
      if (!b || b.disabled) return;
      FD.segSet(root, b.dataset.v);
      onChange && onChange(b.dataset.v);
    });
  };
  FD.segSet = (root, v) => {
    root.querySelectorAll('button[data-v]').forEach((b) => {
      const on = b.dataset.v === String(v);
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
    });
  };

  // ---------- feature icons (24×24 line icons) ----------
  const ic = (p) => `<svg viewBox="0 0 24 24" class="ic" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  FD.icon = {
    intro: ic('<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18h2"/>'),
    portability: ic('<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8.5 7V5.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V7"/><path d="M3 12.5h18"/>'),
    performance: ic('<path d="M3.5 17a8.5 8.5 0 1 1 17 0"/><path d="M12 17l4.2-5.2"/><circle cx="12" cy="17" r="1.4"/>'),
    storage: ic('<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>'),
    interfaces: ic('<rect x="2.5" y="3.5" width="19" height="14" rx="2"/><path d="M2.5 7.5h19"/><path d="M11 11l1.8 7 1.3-2.7 2.9-.4z"/>'),
    connectivity: ic('<path d="M2.5 9a14 14 0 0 1 19 0"/><path d="M5.8 12.5a9.5 9.5 0 0 1 12.4 0"/><path d="M9 16a4.6 4.6 0 0 1 6 0"/><circle cx="12" cy="19.5" r="1"/>'),
    media: ic('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.4"/><path d="M12 5.5a6.5 6.5 0 0 1 6.5 6.5"/>'),
    energy: ic('<rect x="2.5" y="7" width="16.5" height="10" rx="2"/><path d="M21.5 10.5v3"/><path d="M11.5 8.8l-2.3 3.4h3.3l-2.3 3.4"/>'),
    expansion: ic('<rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M12 8v8M8 12h8"/>'),
    security: ic('<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.3"/>'),
    compare: ic('<path d="M3.5 3.5v17h17"/><path d="M8 16v-3M12 16V9M16 16v-5M20 16V6"/>'),
    terms: ic('<path d="M3.5 5h6a2.5 2.5 0 0 1 2.5 2.5V20a2 2 0 0 0-2-2H3.5z"/><path d="M20.5 5h-6A2.5 2.5 0 0 0 12 7.5V20a2 2 0 0 1 2-2h6.5z"/>'),
    quiz: ic('<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.6"/><circle cx="12" cy="16.8" r=".5"/>'),
    check: ic('<path d="M4.5 12.5l5 5 10-11"/>'),
    cross: ic('<path d="M6 6l12 12M18 6L6 18"/>'),
  };

  // ---------- device drawings ----------
  const sv = (vb, cls, body) => `<svg viewBox="${vb}" class="dev ${cls}" aria-hidden="true">${body}</svg>`;
  FD.dev = {
    // screen area: x6 y12 w48 h84
    phone: (inner = '') => sv('0 0 60 110', 'dev-phone',
      `<rect x="2" y="2" width="56" height="106" rx="9" class="dv-body"/><rect x="6" y="12" width="48" height="84" rx="3" class="dv-screen"/>${inner}<rect x="23" y="6" width="14" height="2.5" rx="1.25" class="dv-detail"/><rect x="24" y="100" width="12" height="3" rx="1.5" class="dv-detail"/>`),
    // screen area: x8 y10 w76 h100
    tablet: (inner = '') => sv('0 0 92 120', 'dev-tablet',
      `<rect x="2" y="2" width="88" height="116" rx="10" class="dv-body"/><rect x="8" y="10" width="76" height="100" rx="3" class="dv-screen"/>${inner}<circle cx="46" cy="6" r="1.6" class="dv-detail"/>`),
    // screen area: x28 y10 w104 h62
    laptop: (inner = '') => sv('0 0 160 100', 'dev-laptop',
      `<rect x="22" y="4" width="116" height="74" rx="5" class="dv-body"/><rect x="28" y="10" width="104" height="62" rx="2" class="dv-screen"/>${inner}<path d="M6 80H154L146 94H14Z" class="dv-body"/><rect x="66" y="83" width="28" height="3" rx="1.5" class="dv-detail"/>`),
    // screen area: x10 y12 w98 h62
    desktop: (inner = '') => sv('0 0 170 120', 'dev-desktop',
      `<rect x="4" y="6" width="110" height="74" rx="5" class="dv-body"/><rect x="10" y="12" width="98" height="62" rx="2" class="dv-screen"/>${inner}<rect x="52" y="80" width="14" height="18" class="dv-body"/><rect x="34" y="98" width="50" height="6" rx="3" class="dv-body"/><rect x="124" y="20" width="42" height="96" rx="5" class="dv-body"/><rect x="131" y="30" width="28" height="4" rx="2" class="dv-detail"/><rect x="131" y="40" width="28" height="4" rx="2" class="dv-detail"/><circle cx="145" cy="102" r="4" class="dv-detail"/>`),
    // screen area: x8 y8 w164 h92
    tv: (inner = '') => sv('0 0 180 124', 'dev-tv',
      `<rect x="2" y="2" width="176" height="104" rx="5" class="dv-body"/><rect x="8" y="8" width="164" height="92" rx="2" class="dv-screen"/>${inner}<path d="M80 106h20l6 13H74z" class="dv-body"/><rect x="58" y="118" width="64" height="4" rx="2" class="dv-body"/>`),
    speaker: () => sv('0 0 50 90', 'dev-speaker',
      `<rect x="4" y="4" width="42" height="82" rx="18" class="dv-body"/><ellipse cx="25" cy="12" rx="15" ry="4" class="dv-ring"/>${[30, 40, 50, 60, 70].map((y) => [14, 21, 28, 35].map((x) => `<circle cx="${x + (y % 20 ? 0 : 3)}" cy="${y}" r="1.6" class="dv-detail"/>`).join('')).join('')}`),
    server: () => sv('0 0 70 120', 'dev-server',
      `<rect x="3" y="3" width="64" height="114" rx="5" class="dv-body"/>${[12, 32, 52, 72, 92].map((y) => `<rect x="9" y="${y}" width="52" height="15" rx="2" class="dv-unit"/><circle cx="16" cy="${y + 7.5}" r="2.2" class="dv-led"/><rect x="24" y="${y + 6}" width="30" height="3" rx="1.5" class="dv-detail"/>`).join('')}`),
    drive: () => sv('0 0 64 84', 'dev-drive',
      `<rect x="3" y="3" width="58" height="78" rx="8" class="dv-body"/><rect x="12" y="14" width="40" height="5" rx="2.5" class="dv-detail"/><circle cx="32" cy="50" r="13" class="dv-unit"/><circle cx="32" cy="50" r="3" class="dv-detail"/><circle cx="50" cy="72" r="2.4" class="dv-led"/>`),
    printer: () => sv('0 0 90 78', 'dev-printer',
      `<rect x="22" y="3" width="46" height="22" rx="2" class="dv-paper"/><rect x="4" y="20" width="82" height="38" rx="7" class="dv-body"/><rect x="16" y="50" width="58" height="24" rx="2" class="dv-paper"/><path d="M24 60h40M24 66h28" class="dv-ink"/><circle cx="74" cy="31" r="3" class="dv-led"/>`),
    webcam: () => sv('0 0 60 72', 'dev-webcam',
      `<circle cx="30" cy="27" r="24" class="dv-body"/><circle cx="30" cy="27" r="12" class="dv-unit"/><circle cx="30" cy="27" r="5" class="dv-lens"/><path d="M22 51l-6 15h28l-6-15" class="dv-body"/>`),
    cloud: () => sv('0 0 110 72', 'dev-cloud',
      `<path d="M28 64h56a20 20 0 0 0 3-39.8A27 27 0 0 0 36 18 22 22 0 0 0 28 64z" class="dv-cloud"/><path d="M47 44l8-9 8 9M55 35v18" class="dv-arrow"/>`),
    backpack: () => sv('0 0 120 140', 'dev-backpack',
      `<path d="M42 24a18 18 0 0 1 36 0" class="bp-strap"/><rect x="16" y="20" width="88" height="116" rx="28" class="bp-body"/><path d="M16 58h88" class="bp-line"/><rect x="32" y="80" width="56" height="44" rx="12" class="bp-pocket"/><rect x="52" y="76" width="16" height="7" rx="3" class="bp-zip"/>`),
  };

  // Small screen fragments reused inside device screens.
  FD.screen = {
    phoneHome: `<g class="scr-ui"><rect x="12" y="20" width="10" height="10" rx="2.5" fill="#4dabf7"/><rect x="25" y="20" width="10" height="10" rx="2.5" fill="#69db7c"/><rect x="38" y="20" width="10" height="10" rx="2.5" fill="#ffa94d"/><rect x="12" y="34" width="10" height="10" rx="2.5" fill="#f783ac"/><rect x="25" y="34" width="10" height="10" rx="2.5" fill="#9775fa"/><rect x="38" y="34" width="10" height="10" rx="2.5" fill="#ffd43b"/></g>`,
    laptopHome: `<g class="scr-ui"><rect x="28" y="66" width="104" height="6" fill="#1c3d73" opacity=".55"/><rect x="34" y="16" width="9" height="8" rx="1.5" fill="#ffd43b"/><rect x="34" y="28" width="9" height="8" rx="1.5" fill="#4dabf7"/><rect x="56" y="18" width="62" height="40" rx="2" fill="#fff" opacity=".9"/><rect x="56" y="18" width="62" height="5" rx="2" fill="#1c7ed6"/></g>`,
    desktopHome: `<g class="scr-ui"><rect x="10" y="68" width="98" height="6" fill="#1c3d73" opacity=".55"/><rect x="16" y="18" width="9" height="8" rx="1.5" fill="#ffd43b"/><rect x="16" y="30" width="9" height="8" rx="1.5" fill="#4dabf7"/><rect x="36" y="20" width="62" height="40" rx="2" fill="#fff" opacity=".9"/><rect x="36" y="20" width="62" height="5" rx="2" fill="#1c7ed6"/></g>`,
    tvShow: `<g class="scr-ui"><path d="M8 80l40-30 30 22 30-26 64 44v10H8z" fill="#2f9e44" opacity=".75"/><circle cx="140" cy="30" r="10" fill="#ffd43b"/></g>`,
  };

  return FD;
})();
