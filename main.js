/* ==========================================================================
   nickbeattie.com — main.js
   --------------------------------------------------------------------------
   EDIT HERE: the three blocks below (CONFIG, LOGOS, WRITING) are the only
   parts you should need to touch. Everything under "Site behaviour" is code.
   ========================================================================== */

const CONFIG = {
  // Web3Forms access key (free at https://web3forms.com). Messages are sent
  // to the address you register there; it never appears in this code.
  WEB3FORMS_KEY: 'YOUR_WEB3FORMS_KEY',

  // Flip each to true once the file(s) are in place. See README "Assets".
  ASSETS: {
    headshot: false,     // assets/img/headshot-{480,800,1200}.{avif,webp,jpg}  (run tools/optimise-images.mjs)
    resume: false,       // assets/Nick-Beattie-Resume.pdf
    hoshinVideo: false,  // assets/video/hoshin.mp4 + assets/video/hoshin-poster.jpg
  },

  // Case study screenshots. Set a key to true once
  // assets/img/cases/<key>-{640,1280}.{avif,webp,jpg} exist (run tools/optimise-images.mjs).
  // While false, the drawn diagram is shown instead.
  CASE_SHOTS: {
    'digital-sales-browser': false,
    'digital-sales-phone': false,
    'merger': false,
    'integration': false,
    'parts': false,
    'people': false,
  },

  // true = company names as small-caps text. false = use the SVG files below
  // (any file that fails to load falls back to text automatically).
  LOGOS_AS_TEXT: true,
};

const LOGOS = [
  { name: 'Honda', file: 'assets/logos/honda.svg' },
  { name: 'GM Holden', file: 'assets/logos/holden.svg' },
  { name: 'Futuris', file: 'assets/logos/futuris.svg' },
];

// LinkedIn posts. Newest first. Three cards look best.
//   url:      the post's normal LinkedIn link
//   embedUrl: optional. On the post, choose "… > Embed this post" and copy the
//             src from the code, e.g. https://www.linkedin.com/embed/feed/update/urn:li:share:123
//             Leave '' to hide the "Show post" button.
//   tbc:      set to false once the card holds real content.
const WRITING = [
  {
    title: '[TBC] Post title',
    summary: '[TBC] One-line summary of the post.',
    date: '[TBC] Month 2026',
    url: 'https://www.linkedin.com/in/nicholas-beattie-981b15412/recent-activity/all/',
    embedUrl: '',
    tbc: true,
  },
  {
    title: '[TBC] Post title',
    summary: '[TBC] One-line summary of the post.',
    date: '[TBC] Month 2026',
    url: 'https://www.linkedin.com/in/nicholas-beattie-981b15412/recent-activity/all/',
    embedUrl: '',
    tbc: true,
  },
  {
    title: '[TBC] Post title',
    summary: '[TBC] One-line summary of the post.',
    date: '[TBC] Month 2026',
    url: 'https://www.linkedin.com/in/nicholas-beattie-981b15412/recent-activity/all/',
    embedUrl: '',
    tbc: true,
  },
];

/* ==========================================================================
   Site behaviour
   ========================================================================== */
(function () {
  'use strict';

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => reduceMQ.matches;
  const hasIO = 'IntersectionObserver' in window;
  const tbcOff = root.classList.contains('tbc-off');

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v);
    }
    for (const c of [].concat(children)) if (c) node.append(c);
    return node;
  }

  // Build a responsive <picture> from a base path: base-{w}.{avif,webp,jpg}
  function picture(base, widths, sizes, alt, { lazy = true, width, height } = {}) {
    const srcset = (ext) => widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');
    const img = el('img', {
      src: `${base}-${widths[widths.length - 1]}.jpg`,
      srcset: srcset('jpg'), sizes, alt, decoding: 'async',
    });
    if (lazy) img.loading = 'lazy';
    if (width) { img.width = width; img.height = height; }
    return el('picture', {}, [
      el('source', { type: 'image/avif', srcset: srcset('avif'), sizes }),
      el('source', { type: 'image/webp', srcset: srcset('webp'), sizes }),
      img,
    ]);
  }

  /* ---------- Theme toggle ---------- */
  function initTheme() {
    const btn = $('[data-theme-toggle]');
    if (!btn) return;
    const darkMQ = window.matchMedia('(prefers-color-scheme: dark)');
    const current = () => root.getAttribute('data-theme') || (darkMQ.matches ? 'dark' : 'light');
    const label = () => btn.setAttribute('aria-label', current() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    label();
    btn.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set('theme', next);
      label();
    });
    darkMQ.addEventListener?.('change', label);
  }

  /* ---------- Nav: menu, hide on scroll down, active section ---------- */
  function initNav() {
    const header = $('[data-header]');
    const menuBtn = $('[data-menu]');
    const links = $('[data-nav-links]');
    if (!header) return;

    const closeMenu = () => { links.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); };
    menuBtn?.addEventListener('click', () => {
      const open = !links.classList.contains('is-open');
      links.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && links.classList.contains('is-open')) { closeMenu(); menuBtn.focus(); }
    });

    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 8);
      const menuOpen = links.classList.contains('is-open');
      const focused = header.contains(document.activeElement);
      if (y > lastY + 4 && y > 160 && !menuOpen && !focused) header.classList.add('is-hidden');
      else if (y < lastY - 4 || y <= 160) header.classList.remove('is-hidden');
      lastY = y;
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
    onScroll();

    if (!hasIO) return;
    const navLinks = $$('a[href^="#"]', links);
    const map = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        const a = map.get(entry.target.id);
        if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => io.observe(s));
  }

  /* ---------- Optional assets ---------- */
  function initAssets() {
    const A = CONFIG.ASSETS;

    // Headshot
    const portrait = $('[data-portrait] .portrait');
    if (A.headshot && portrait) {
      const pic = picture('assets/img/headshot', [480, 800, 1200],
        '(min-width: 1024px) 40vw, 60vw', 'Nick Beattie', { lazy: false, width: 1200, height: 1500 });
      const img = $('img', pic);
      img.setAttribute('fetchpriority', 'high');
      img.addEventListener('load', () => portrait.classList.add('has-photo'));
      img.addEventListener('error', () => pic.remove());
      portrait.prepend(pic);
      if (img.complete && img.naturalWidth) portrait.classList.add('has-photo');
    }

    // Resume
    if (!A.resume) {
      $$('[data-resume]').forEach((a) => {
        a.classList.add('is-missing');
        a.title = 'Resume PDF not added yet (assets/Nick-Beattie-Resume.pdf)';
      });
    }

    // Case study screenshots
    $$('[data-shot]').forEach((screen) => {
      const key = screen.getAttribute('data-shot');
      if (!CONFIG.CASE_SHOTS[key]) return;
      const diagram = $('svg', screen);
      // Alt text: set data-alt on the .frame__screen in index.html to describe your screenshot
      const alt = screen.dataset.alt || diagram?.querySelector('title')?.textContent.replace(/^Diagram:\s*/, 'Screenshot: ') || '';
      const pic = picture(`assets/img/cases/${key}`, [640, 1280], '(min-width: 1024px) 40vw, 90vw', alt);
      $('img', pic).addEventListener('error', () => { pic.remove(); if (diagram) diagram.hidden = false; });
      if (diagram) diagram.hidden = true;
      screen.append(pic);
    });
  }

  /* ---------- Hoshin video: loads only when in view ---------- */
  function initVideo() {
    const screen = $('[data-video="hoshin"]');
    if (!screen || !CONFIG.ASSETS.hoshinVideo) return;
    const diagram = $('svg', screen);
    const poster = 'assets/video/hoshin-poster.jpg';
    const alt = 'Hoshin Kanri web app: objectives cascading to team goals, with performance tracked';

    if (reduced() || !hasIO) {
      const img = el('img', { src: poster, alt, loading: 'lazy', decoding: 'async' });
      img.addEventListener('error', () => { img.remove(); diagram.hidden = false; });
      diagram.hidden = true;
      screen.append(img);
      return;
    }
    const video = el('video', {
      muted: '', loop: '', playsinline: '', preload: 'none', poster, 'aria-label': alt,
    });
    video.muted = true;
    diagram.hidden = true;
    screen.append(video);
    let loaded = false;
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!loaded) {
          video.append(el('source', { src: 'assets/video/hoshin.mp4', type: 'video/mp4' }));
          video.load();
          loaded = true;
        }
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }, { threshold: 0.25 }).observe(screen);
    video.addEventListener('error', () => { video.remove(); diagram.hidden = false; }, true);
  }

  /* ---------- Logos ---------- */
  function initLogos() {
    const list = $('[data-logos]');
    if (!list || CONFIG.LOGOS_AS_TEXT) return;
    list.replaceChildren(...LOGOS.map(({ name, file }) => {
      const li = el('li', { class: 'logo' });
      const img = el('img', { src: file, alt: name, height: '24', loading: 'lazy', decoding: 'async' });
      img.addEventListener('error', () => img.replaceWith(el('span', { class: 'logo__text', text: name })));
      li.append(img);
      return li;
    }));
  }

  /* ---------- Writing cards + click-to-load LinkedIn embeds ---------- */
  function initWriting() {
    const wrap = $('[data-writing]');
    if (!wrap) return;
    const posts = WRITING.filter((p) => !(tbcOff && p.tbc));
    if (!posts.length) {
      $('[data-writing-section]').hidden = true;
      $$('[data-writing-link]').forEach((a) => a.closest('li').remove());
      return;
    }
    const txt = (value, isTbc) => (isTbc ? el('span', { class: 'tbc', text: value }) : value);
    wrap.replaceChildren(...posts.map((p, i) => {
      const card = el('article', { class: 'card', 'data-reveal': '', style: `--i:${i}` });
      card.append(
        el('p', { class: 'card__date' }, [txt(p.date, p.tbc)]),
        el('h3', { class: 'card__title' }, [txt(p.title, p.tbc)]),
        el('p', { class: 'card__summary' }, [txt(p.summary, p.tbc)]),
      );
      const actions = el('p', { class: 'card__actions' }, [
        el('a', { class: 'link', href: p.url, rel: 'noopener', text: 'Read on LinkedIn →' }),
      ]);
      const embedOk = /^https:\/\/www\.linkedin\.com\/embed\//.test(p.embedUrl || '');
      if (embedOk) {
        const btn = el('button', { class: 'card__show', type: 'button', text: 'Show post' });
        btn.addEventListener('click', () => {
          const frame = el('iframe', {
            src: p.embedUrl, title: `LinkedIn post: ${p.title}`, loading: 'lazy',
            allowfullscreen: '', referrerpolicy: 'strict-origin-when-cross-origin',
          });
          const box = el('div', { class: 'card__embed' }, [frame]);
          actions.after(box);
          btn.remove();
          frame.focus();
        });
        actions.append(btn);
      }
      card.append(actions);
      return card;
    }));
  }

  /* ---------- Scroll reveals ---------- */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!hasIO || reduced()) { items.forEach((n) => n.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((n) => io.observe(n));
  }

  /* ---------- Count-ups ---------- */
  function initCounts() {
    const nodes = $$('[data-count]');
    if (!hasIO || reduced()) return; // final values are already in the HTML
    const fmt = (node, v) => {
      const d = +(node.dataset.decimals || 0);
      node.textContent = `${node.dataset.prefix || ''}${v.toFixed(d)}${node.dataset.suffix || ''}`;
    };
    const run = (node, delay) => {
      const from = +(node.dataset.from || 0);
      const to = +node.dataset.to;
      const dur = 900;
      let start;
      const step = (t) => {
        if (start === undefined) start = t + delay;
        const p = Math.min(1, Math.max(0, (t - start) / dur));
        const eased = 1 - Math.pow(1 - p, 3);
        fmt(node, from + (to - from) * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    nodes.forEach((node) => {
      // Lock width at the final value so the layout doesn't jitter
      if (node instanceof HTMLElement) node.style.minWidth = `${node.getBoundingClientRect().width}px`;
      fmt(node, +(node.dataset.from || 0));
    });
    const firstLoad = !root.classList.contains('seen');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const i = +(entry.target.closest('[style*="--i"]')?.style.getPropertyValue('--i') || 0);
        const inHero = entry.target.closest('.glance') && firstLoad && window.scrollY < 50;
        run(entry.target, (inHero ? 420 : 120) + i * 70);
      });
    }, { threshold: 0.6 });
    nodes.forEach((n) => io.observe(n));
  }

  /* ---------- Parallax on device frames (max 30px) ---------- */
  function initParallax() {
    const layers = $$('[data-parallax]');
    if (!layers.length || reduced()) return;
    const visible = new Set();
    if (hasIO) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        schedule();
      }, { rootMargin: '10% 0px' });
      layers.forEach((l) => io.observe(l));
    } else {
      layers.forEach((l) => visible.add(l));
    }
    let ticking = false;
    function update() {
      ticking = false;
      const vh = window.innerHeight;
      visible.forEach((layer) => {
        const r = layer.getBoundingClientRect();
        const centre = r.top + r.height / 2;
        const p = Math.max(-1, Math.min(1, (centre - vh / 2) / (vh / 2 + r.height / 2)));
        const k = Math.min(1, +layer.dataset.parallax || 1);
        layer.style.transform = `translate3d(0, ${(p * 30 * k).toFixed(1)}px, 0)`;
      });
    }
    function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
  }

  /* ---------- Timeline progress line + current year ---------- */
  function initTimeline() {
    const list = $('[data-timeline]');
    if (!list) return;
    const roles = $$('.role', list);
    let ticking = false;
    function update() {
      ticking = false;
      const vh = window.innerHeight;
      const mark = vh * 0.5;
      const r = list.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (mark - r.top) / r.height));
      list.style.setProperty('--progress', progress.toFixed(4));
      let current = -1;
      roles.forEach((role, i) => { if (role.getBoundingClientRect().top < mark) current = i; });
      roles.forEach((role, i) => {
        role.classList.toggle('is-current', i === current);
        role.classList.toggle('is-past', i < current);
      });
    }
    const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();

    // Expand/collapse with the View Transitions API where available
    roles.forEach((role, i) => { role.style.viewTransitionName = `role-${i}`; });
    $$('summary', list).forEach((summary) => {
      summary.addEventListener('click', (e) => {
        if (!document.startViewTransition || reduced()) return;
        e.preventDefault();
        const details = summary.parentElement;
        document.startViewTransition(() => { details.open = !details.open; });
      });
    });
  }

  /* ---------- Contact form (Web3Forms) ---------- */
  function initForm() {
    const form = $('[data-form]');
    if (!form) return;
    const status = $('[data-status]', form);
    const submit = $('[data-submit]', form);
    const submitLabel = $('[data-submit-label]', form);
    const done = $('[data-done]');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const rules = {
      name: (v) => (v.trim() ? '' : 'Please add your name.'),
      email: (v) => (!v.trim() ? 'Please add your email so I can reply.' : emailRe.test(v.trim()) ? '' : 'That email address doesn’t look right.'),
      message: (v) => (v.trim().length >= 10 ? '' : 'Please write a short message (10 characters or more).'),
    };

    function check(field) {
      const rule = rules[field.name];
      if (!rule) return true;
      const msg = rule(field.value);
      const err = document.getElementById(`${field.id}-err`);
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg;
      return !msg;
    }

    Object.keys(rules).forEach((name) => {
      const f = form.elements[name];
      f.addEventListener('blur', () => { if (f.value) check(f); });
      f.addEventListener('input', () => { if (f.getAttribute('aria-invalid') === 'true') check(f); });
    });

    function setLoading(on) {
      submit.classList.toggle('is-loading', on);
      submit.disabled = on;
      form.setAttribute('aria-busy', String(on));
      submitLabel.textContent = on ? 'Sending…' : 'Send message';
    }
    function fail(msg) {
      status.classList.add('is-error');
      status.textContent = msg;
      submitLabel.textContent = 'Try again';
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
      status.classList.remove('is-error');

      const fields = Object.keys(rules).map((n) => form.elements[n]);
      const results = fields.map(check);
      const firstBad = fields[results.indexOf(false)];
      if (firstBad) {
        status.classList.add('is-error');
        status.textContent = 'Please fix the highlighted fields.';
        firstBad.focus();
        return;
      }

      // Honeypot: bots tick it, people never see it. Pretend all is well.
      if (form.elements.botcheck.checked) { showDone(); return; }

      if (!CONFIG.WEB3FORMS_KEY || CONFIG.WEB3FORMS_KEY === 'YOUR_WEB3FORMS_KEY') {
        fail('The form isn’t connected yet. Please reach me on LinkedIn for now.');
        return;
      }

      const data = Object.fromEntries(new FormData(form));
      delete data.botcheck;
      data.access_key = CONFIG.WEB3FORMS_KEY;
      if (data.organisation) data.subject = `New message from nickbeattie.com (${data.organisation})`;

      setLoading(true);
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json().catch(() => ({}));
        setLoading(false);
        if (res.ok && json.success) showDone();
        else fail('Sorry, that didn’t send. Please try again, or message me on LinkedIn.');
      } catch (err) {
        setLoading(false);
        fail('Couldn’t reach the server. Check your connection and try again.');
      }
    });

    function showDone() {
      form.hidden = true;
      done.hidden = false;
      done.focus();
    }
  }

  /* ---------- Boot ---------- */
  initTheme();
  initNav();
  initAssets();
  initVideo();
  initLogos();
  initWriting();
  initReveal();
  initCounts();
  initParallax();
  initTimeline();
  initForm();
  try { sessionStorage.setItem('nb-seen', '1'); } catch (e) { /* ignore */ }
})();
