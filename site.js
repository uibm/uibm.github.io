// Site interactions: nav scroll-spy, command palette, tilt, tweaks panel.
(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // Smooth scroll + active link (brand link included)
  const allNavLinks = $$('.nav-link, #brand-link');
  allNavLinks.forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) window.scrollTo({ top: el.offsetTop - 20, behavior: 'smooth' });
    });
  });
  const links = $$('.nav-link');
  const sections = $$('.section');

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach((s) => spy.observe(s));

  // Scroll progress rail
  const rail = $('.rail-fill');
  if (rail) {
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
      rail.style.transform = `scaleY(${p})`;
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Reveal on scroll
  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        revealer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  $$('[data-reveal]').forEach((el) => revealer.observe(el));

  // Command palette
  const palette = $('#palette');
  const paletteInput = $('#palette-input');
  const paletteList = $('#palette-list');
  const paletteItems = [
    { label: 'Go to Home', href: '#home' },
    { label: 'Go to About', href: '#about' },
    { label: 'Go to Experience', href: '#experience' },
    { label: 'Go to Skills', href: '#skills' },
    { label: 'Go to Projects', href: '#projects' },
    { label: 'Go to Contact', href: '#contact' },
    { label: 'Email Ujjwal', href: 'mailto:ramuklawjju@outlook.com' },
    { label: 'Open GitHub', href: 'https://github.com/ujjwal-ibm' },
    { label: 'Open LinkedIn', href: 'https://in.linkedin.com/in/ramuklawjju' },
    { label: 'Open Medium', href: 'https://ramuklawjju.medium.com/' },
    { label: 'Toggle theme', action: 'toggleTheme' },
  ];

  function renderPalette(q = '') {
    const norm = q.trim().toLowerCase();
    const filtered = paletteItems.filter((i) => i.label.toLowerCase().includes(norm));
    paletteList.innerHTML = filtered
      .map((i, idx) => `<li role="option" data-idx="${idx}" class="${idx === 0 ? 'sel' : ''}">
        <span>${i.label}</span>
        <span class="k">${i.href ? '↗' : '·'}</span>
      </li>`).join('');
    paletteList._items = filtered;
  }
  function openPalette() {
    palette.classList.add('open');
    paletteInput.value = '';
    renderPalette('');
    setTimeout(() => paletteInput.focus(), 20);
  }
  function closePalette() { palette.classList.remove('open'); }
  function actOn(item) {
    if (!item) return;
    if (item.action === 'toggleTheme') toggleTheme();
    else if (item.href.startsWith('#')) {
      const el = document.getElementById(item.href.slice(1));
      if (el) window.scrollTo({ top: el.offsetTop - 20, behavior: 'smooth' });
    } else {
      window.open(item.href, '_blank');
    }
    closePalette();
  }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); palette.classList.contains('open') ? closePalette() : openPalette(); }
    else if (e.key === 'Escape') closePalette();
    else if (palette.classList.contains('open')) {
      const items = paletteList._items || [];
      const sel = paletteList.querySelector('.sel');
      let idx = sel ? +sel.dataset.idx : 0;
      if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(idx + 1, items.length - 1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(idx - 1, 0); }
      if (e.key === 'Enter') { e.preventDefault(); actOn(items[idx]); return; }
      paletteList.querySelectorAll('li').forEach((li) => li.classList.toggle('sel', +li.dataset.idx === idx));
    }
  });
  paletteInput?.addEventListener('input', () => renderPalette(paletteInput.value));
  paletteList?.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    actOn(paletteList._items[+li.dataset.idx]);
  });
  $('.palette-backdrop')?.addEventListener('click', closePalette);
  $('#open-palette')?.addEventListener('click', openPalette);

  // Tilt on project cards
  $$('.project-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  // Theme toggle
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
    $('#theme-icon-sun') && ($('#theme-icon-sun').style.display = t === 'dark' ? 'block' : 'none');
    $('#theme-icon-moon') && ($('#theme-icon-moon').style.display = t === 'dark' ? 'none' : 'block');
  }
  function toggleTheme() {
    const cur = document.documentElement.dataset.theme || 'light';
    setTheme(cur === 'light' ? 'dark' : 'light');
  }
  try {
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
    else setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } catch (e) { setTheme('light'); }
  $('#theme-toggle')?.addEventListener('click', toggleTheme);

  // Clock removed — kicker shows static text "Indian Standard Time"

  // Magnetic CTAs
  $$('[data-magnet]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.15}px, ${y * 0.2}px)`;
    });
    el.addEventListener('mouseleave', () => (el.style.transform = ''));
  });

  // Tweaks ===============================
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "gold",
    "grain": true,
    "cursorGlow": true
  }/*EDITMODE-END*/;
  const ACCENTS = {
    gold:    { h: 75, c: 0.12 },
    rose:    { h: 25, c: 0.13 },
    ocean:   { h: 230, c: 0.12 },
    matcha:  { h: 145, c: 0.11 },
    violet:  { h: 295, c: 0.13 },
    mono:    { h: 60, c: 0.0 },
  };

  function applyTweak(key, val) {
    if (key === 'accent') {
      const a = ACCENTS[val] || ACCENTS.gold;
      document.documentElement.style.setProperty('--accent-h', a.h);
      document.documentElement.style.setProperty('--accent-c', a.c);
    } else if (key === 'grain') {
      document.documentElement.classList.toggle('no-grain', !val);
    } else if (key === 'cursorGlow') {
      document.documentElement.classList.toggle('no-glow', !val);
    }
  }
  Object.entries(TWEAK_DEFAULTS).forEach(([k, v]) => applyTweak(k, v));

  // Cursor glow
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  window.addEventListener('mousemove', (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });

  // Edit mode host bridge
  const current = { ...TWEAK_DEFAULTS };
  window.addEventListener('message', (ev) => {
    if (ev.data?.type === '__activate_edit_mode') showTweaks(true);
    if (ev.data?.type === '__deactivate_edit_mode') showTweaks(false);
  });
  window.parent.postMessage({ type: '__edit_mode_available' }, '*');

  function showTweaks(on) {
    let panel = $('#tweaks-panel');
    if (!panel && on) panel = buildTweaks();
    if (panel) panel.style.display = on ? 'block' : 'none';
  }
  function buildTweaks() {
    const panel = document.createElement('div');
    panel.id = 'tweaks-panel';
    panel.innerHTML = `
      <div class="tweaks-head">Tweaks</div>
      <div class="tweak-row">
        <label>Accent</label>
        <div class="swatches">
          ${Object.keys(ACCENTS).map((k) => `<button data-accent="${k}" class="sw sw-${k}" aria-label="${k}"></button>`).join('')}
        </div>
      </div>
      <div class="tweak-row">
        <label>Paper grain</label>
        <button class="toggle" data-toggle="grain" aria-pressed="${current.grain}"></button>
      </div>
      <div class="tweak-row">
        <label>Cursor glow</label>
        <button class="toggle" data-toggle="cursorGlow" aria-pressed="${current.cursorGlow}"></button>
      </div>
    `;
    document.body.appendChild(panel);
    panel.querySelectorAll('[data-accent]').forEach((b) => {
      b.addEventListener('click', () => {
        current.accent = b.dataset.accent;
        applyTweak('accent', current.accent);
        window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { accent: current.accent } }, '*');
        markActiveSwatch();
      });
    });
    panel.querySelectorAll('[data-toggle]').forEach((b) => {
      b.addEventListener('click', () => {
        const k = b.dataset.toggle;
        current[k] = !current[k];
        b.setAttribute('aria-pressed', current[k]);
        applyTweak(k, current[k]);
        window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: current[k] } }, '*');
      });
    });
    function markActiveSwatch() {
      panel.querySelectorAll('[data-accent]').forEach((b) => b.classList.toggle('on', b.dataset.accent === current.accent));
    }
    markActiveSwatch();
    return panel;
  }
})();
