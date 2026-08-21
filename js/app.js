/* =========================================================================
   BAR SCENE SOCIALS — router + choreography
   Four routes on one page: #/ , #/halloween , #/christmas , #/shamrock
   The URL is the single source of truth. Every navigation — click, arrow,
   keyboard, back button — just changes the hash; one pump() loop plays the
   matching transition. That keeps view and URL from ever disagreeing.
   ========================================================================= */

// This is a single-page app with real scrollable content now — stop the
// browser from restoring a stale scroll position on reload/back-forward.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const EVENTS = {
  halloween: { color: '#F48515', logo: 'assets/halloween-lockup.png', name: 'Halloween Bar Crawl' },
  christmas: { color: '#D01E21', logo: 'assets/christmas-lockup.png', name: '12 Bars of Christmas' },
  shamrock:  { color: '#11A156', logo: 'assets/shamrock-lockup.png',  name: 'Shamrock Shuffle' },
};
const ORDER = ['halloween', 'christmas', 'shamrock'];

const body      = document.body;
const homeView  = document.querySelector('[data-view="home"]');
const eventView = document.querySelector('[data-view="event"]');
const panel     = document.querySelector('.event__panel');
const wipe      = document.querySelector('.event__wipe');
const logo      = document.querySelector('.event__logo');
const prevArrow = document.querySelector('.arrow--prev');
const nextArrow = document.querySelector('.arrow--next');
const header    = document.querySelector('.site-header');
const wordmark  = document.querySelector('.site-header .wordmark');

/* ---- Motion vocabulary -------------------------------------------------- */
const REDUCED   = matchMedia('(prefers-reduced-motion: reduce)');
const t         = ms => (REDUCED.matches ? 1 : ms);
const EASE      = 'cubic-bezier(.62,.03,.16,1)';   // the house curve
const EASE_IN   = 'cubic-bezier(.55,0,.85,.2)';    // exits: accelerate away
const EASE_BACK = 'cubic-bezier(.22,1.15,.36,1)';  // entrances: land w/ overshoot

const DROP_OUT = [{ transform: 'translateY(0)', opacity: 1 },
                  { transform: 'translateY(46px)', opacity: 0 }];
const DROP_IN  = [{ transform: 'translateY(-72px)', opacity: 0 },
                  { transform: 'translateY(0)', opacity: 1 }];

/* Warm the image cache for all three lockups up front, so the drop-in
   animation never has to wait on a first-time network fetch mid-flight
   (that wait is what makes a transition look glitchy/janky on a real
   network — localhost never shows it, which is why it hid during dev). */
Object.values(EVENTS).forEach(cfg => { new Image().src = cfg.logo; });

/* Every animation is tracked so a new one always supersedes the old, and so
   cancel() can hand an element back to its plain CSS state. */
const tracked = new WeakMap();
function anim(el, frames, opts) {
  (tracked.get(el) || []).forEach(a => a.cancel());
  const a = el.animate(frames, { fill: 'both', ...opts });
  tracked.set(el, [a]);
  return a;
}
function reset(el) {
  (tracked.get(el) || []).forEach(a => a.cancel());
  tracked.delete(el);
}
/* cancel() rejects .finished — swallow it so a sequence never stalls. */
const settle = list => Promise.all(list.map(a => a.finished.catch(() => {})));

/* ---- Route helpers ------------------------------------------------------ */
const routeOf = () => {
  const k = location.hash.replace(/^#\/?/, '');
  return EVENTS[k] ? k : 'home';
};
const cardFor = k => document.querySelector(`.card[data-event="${k}"]`);
const siblings = k => ORDER.filter(x => x !== k).map(cardFor);

/* The card's exact on-screen rect. Kept as a plain rectangular clip-path with
   the rounding animated separately via border-radius — Safari interpolates
   a bare `inset()` and a `border-radius` far more reliably than the combined
   `inset(... round Xpx)` shorthand, which can stutter mid-animation. */
function cardRect(card) {
  const r = card.getBoundingClientRect();
  return {
    clip: `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px)`,
    radius: getComputedStyle(card).borderTopLeftRadius || '0px',
  };
}
const FULL_BLEED = { clip: 'inset(0px 0px 0px 0px)', radius: '0px' };

/* Which top-level view (home grid vs. event) is on screen. Event pages now
   scroll, so — unlike a pure viewport overlay — home has to be fully taken
   out of flow (display:none) whenever an event is showing, or both would be
   stacked in the document at once. */
function showEvent(show) {
  eventView.classList.toggle('is-active', show);
  homeView.classList.toggle('is-hidden', show);
}
/* Which event's content section (countdown/CTA/details/bars) is showing —
   independent of the hero, which is one shared set of elements reused
   across all three routes. */
function showBody(key) {
  document.querySelectorAll('.event__body').forEach(b => b.classList.toggle('is-shown', b.dataset.for === key));
}
/* =========================================================================
   HERO SCROLL EFFECT — side arrows fade, and the big hero logo shrinks and
   docks down into a small mark centered in the header, both mapped 1:1 to
   scroll position rather than toggled at a threshold. The whole event page
   is one continuous color field now (hero and content match), so there's
   nothing left to "reveal" by wiping the panel away — only the logo needs
   to go somewhere, and a direct scroll-linked transform is what fixes the
   earlier version's biggest complaint: a threshold trigger either needs a
   full screen of scroll to fire, or re-fires the instant you nudge back
   up past it. A continuous mapping has no trigger point to get wrong.
   On narrow viewports there's no room to dock a logo into the header
   alongside the wordmark, so it just fades there instead.
   ========================================================================= */
const DOCK_DISTANCE = 260;                             // px of scroll the effect completes over
const DOCK_MEDIA = matchMedia('(min-width: 721px)');   // dock on desktop/tablet; fade-only below that
let logoRestHeight = 0, dockHeight = 0;

/* Natural (undocked) logo height + the wordmark's height as the dock
   target, so the docked mark visually matches the wordmark's scale. Must
   run only once the entrance/exit animation has fully settled — reading
   geometry mid-animation would capture a transient frame, not the resting
   size (harmless here since the entrance only translates, never scales,
   but this is the correct place for it regardless). */
function measureDockGeometry() {
  logoRestHeight = logo.getBoundingClientRect().height || 1;
  dockHeight = wordmark.getBoundingClientRect().height || 1;
}

function applyHeroScroll() {
  if (!EVENTS[routeOf()]) return;
  const p = REDUCED.matches ? 0 : Math.min(1, Math.max(0, scrollY / DOCK_DISTANCE));

  const arrowStyle = el => { el.style.opacity = String(1 - p); el.style.pointerEvents = p > 0.85 ? 'none' : ''; };
  arrowStyle(prevArrow);
  arrowStyle(nextArrow);

  if (DOCK_MEDIA.matches && logoRestHeight) {
    const scale = 1 - p * (1 - dockHeight / logoRestHeight);
    const dockTranslate = (header.getBoundingClientRect().height / 2) - (innerHeight / 2);
    logo.style.transform = `translateY(${p * dockTranslate}px) scale(${scale})`;
    logo.style.opacity = '';
  } else {
    logo.style.transform = '';
    logo.style.opacity = String(1 - p);
  }
}

let scrollTicking = false;
function queueHeroScroll() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => { applyHeroScroll(); scrollTicking = false; });
}
addEventListener('scroll', queueHeroScroll, { passive: true });
addEventListener('resize', () => { measureDockGeometry(); applyHeroScroll(); });

/* Instant reset for the moments a transition already places panel/logo
   itself — clears any inline transform/opacity this scroll effect left
   behind (a WAAPI animation's own keyframes override a plain style write
   like this while it's actively running, so calling it early, before the
   entrance/exit animation claims these properties, is what makes this
   safe rather than a fight over the same CSS properties). */
function clearHeroScrollStyles() {
  logo.style.transform = '';
  logo.style.opacity = '';
  [prevArrow, nextArrow].forEach(el => { el.style.opacity = ''; el.style.pointerEvents = ''; });
}

/* =========================================================================
   HOME → EVENT   (three beats: logo drops out, color consumes, logo drops in)
   ========================================================================= */
async function toEvent(key) {
  const cfg = EVENTS[key];
  const card = cardFor(key);
  const cardLogo = card.querySelector('.card__logo');

  // Every card + its logo starts from a known-clean baseline, no matter what
  // earlier navigation did. Safe to snap instantly — nothing is visible yet.
  ORDER.forEach(k => { reset(cardFor(k)); reset(cardFor(k).querySelector('.card__logo')); });
  const from = cardRect(card);              // measured only once truly at rest

  body.dataset.route = key;                 // wordmark starts its color shift
  body.classList.add('is-transitioning');   // no scrolling mid-animation

  // Beat 1 — the event's logo drops away, its neighbours recede.
  await settle([
    anim(cardLogo, DROP_OUT, { duration: t(170), easing: EASE_IN }),
    ...siblings(key).map(c => anim(c,
      [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.96)' }],
      { duration: t(190), easing: 'ease' })),
  ]);

  // Beat 2 + 3 — the card consumes the screen, then the logo drops in.
  panel.style.background = cfg.color;
  logo.src = cfg.logo;
  logo.alt = cfg.name;
  showBody(key);
  showEvent(true);
  scrollTo(0, 0);   // always land on the hero, never mid-scroll from home
  clearHeroScrollStyles();

  await settle([
    anim(panel, [{ clipPath: from.clip, borderRadius: from.radius }, { clipPath: FULL_BLEED.clip, borderRadius: FULL_BLEED.radius }],
      { duration: t(360), easing: EASE }),
    anim(logo, DROP_IN, { duration: t(300), delay: t(190), easing: EASE_BACK }),
  ]);

  // Hand transform/opacity back to plain styles (the scroll effect can't
  // touch them while this finished-but-uncancelled animation still holds
  // them), then measure the now-settled, now-correct logo for docking.
  reset(panel);
  reset(logo);
  measureDockGeometry();
  applyHeroScroll();

  homeView.inert = true;
  eventView.inert = false;
  body.classList.remove('is-transitioning');
}

/* =========================================================================
   EVENT → HOME   (the same three beats, mirrored)
   ========================================================================= */
async function toHome(from) {
  const card = cardFor(from);
  const cardLogo = card.querySelector('.card__logo');

  // Same defensive baseline as toEvent(). This is the fix for cards coming
  // back with a missing logo: previously only the two cards adjacent to
  // `from` got cleaned up here, so a card you'd clicked earlier and then
  // arrowed away from — its logo animation was never reset by anyone and
  // stayed invisible forever. Resetting all three, every time, closes that
  // gap regardless of how many arrow-hops happened in between.
  ORDER.forEach(k => { reset(cardFor(k)); reset(cardFor(k).querySelector('.card__logo')); });
  const to = cardRect(card);

  body.dataset.route = 'home';
  body.classList.add('is-transitioning');
  homeView.inert = false;
  eventView.inert = true;
  // The logo may currently be scrolled-down/docked if the user was reading
  // content further down. Clear that back to plain styles and jump to the
  // top *before* the drop-out plays — otherwise a docked (small, tucked in
  // the header) logo would visibly snap to full size against whatever was
  // scrolled into view, instead of against the hero it actually belongs to.
  clearHeroScrollStyles();
  scrollTo(0, 0);

  await settle([anim(logo, DROP_OUT, { duration: t(160), easing: EASE_IN })]);

  await settle([
    anim(panel, [{ clipPath: FULL_BLEED.clip, borderRadius: FULL_BLEED.radius }, { clipPath: to.clip, borderRadius: to.radius }],
      { duration: t(330), easing: EASE }),
    ...siblings(from).map(c => anim(c,
      [{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'scale(1)' }],
      { duration: t(300), easing: 'ease' })),
  ]);

  showEvent(false);
  reset(panel);
  reset(logo);

  await settle([anim(cardLogo,
    [{ transform: 'translateY(-56px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
    { duration: t(280), easing: EASE_BACK })]);

  reset(cardLogo);
  siblings(from).forEach(reset);
  body.classList.remove('is-transitioning');
}

/* =========================================================================
   EVENT → EVENT   (arrow navigation: the next color wipes across)
   ========================================================================= */
async function toSibling(key, dir) {
  const cfg = EVENTS[key];
  body.classList.add('is-transitioning');
  // Arrow-key navigation can fire from anywhere on the page (it doesn't
  // need the visible, hover-only arrow buttons) — including while the logo
  // is currently docked small. Same fix as toHome: clear + jump to the top
  // before the drop-out plays, so it snaps against the hero, not wherever
  // the page happened to be scrolled.
  clearHeroScrollStyles();
  scrollTo(0, 0);
  // body.dataset.route is deliberately NOT set yet — it drives the header's
  // (now always-opaque, per-event) color, and the header sits above the
  // wipe in stacking order. Flipping it now would snap the header to the
  // new color instantly, well before the wipe has actually swept that far —
  // a visible mismatch the whole 280ms the wipe takes. Set it down by the
  // panel instead, right as the wipe finishes, so header and page change
  // color at exactly the same moment.

  await settle([anim(logo, DROP_OUT, { duration: t(150), easing: EASE_IN })]);

  wipe.style.background = cfg.color;
  wipe.classList.add('is-live');
  const from = dir === 'prev' ? 'inset(0px 100% 0px 0px)' : 'inset(0px 0px 0px 100%)';

  logo.src = cfg.logo;
  logo.alt = cfg.name;
  showBody(key);

  await settle([
    anim(wipe, [{ clipPath: from }, { clipPath: 'inset(0px 0px 0px 0px)' }],
      { duration: t(280), easing: EASE }),
    anim(logo, DROP_IN, { duration: t(290), delay: t(190), easing: EASE_BACK }),
  ]);

  body.dataset.route = key;             // header recolors right as the wipe hands off
  panel.style.background = cfg.color;   // commit before removing the wipe
  wipe.classList.remove('is-live');
  reset(wipe);
  reset(logo);
  measureDockGeometry();
  applyHeroScroll();
  body.classList.remove('is-transitioning');
}

/* =========================================================================
   Router
   ========================================================================= */
let current = 'home';
let busy = false;
let dirHint = null;

function syncArrows() {
  const k = routeOf();
  if (!EVENTS[k]) return;
  const i = ORDER.indexOf(k);
  const prev = ORDER[(i + ORDER.length - 1) % ORDER.length];
  const next = ORDER[(i + 1) % ORDER.length];
  prevArrow.setAttribute('href', '#/' + prev);
  nextArrow.setAttribute('href', '#/' + next);
  prevArrow.setAttribute('aria-label', 'Previous event: ' + EVENTS[prev].name);
  nextArrow.setAttribute('aria-label', 'Next event: ' + EVENTS[next].name);
}

/* One transition at a time. If the hash moved again mid-flight (fast clicks,
   held-down arrow key), the loop simply keeps going until view === URL. */
async function pump() {
  if (busy) return;
  busy = true;
  try {
    let guard = 0;
    while (routeOf() !== current && guard++ < 8) {
      const next = routeOf();
      const dir = dirHint ||
        (ORDER.indexOf(next) > ORDER.indexOf(current) ? 'next' : 'prev');
      dirHint = null;

      if (current === 'home')      await toEvent(next);
      else if (next === 'home')    await toHome(current);
      else                         await toSibling(next, dir);

      current = next;
      syncArrows();
    }
  } finally {
    busy = false;
  }
}

/* ---- Wiring ------------------------------------------------------------- */
addEventListener('hashchange', pump);

prevArrow.addEventListener('click', () => { dirHint = 'prev'; });
nextArrow.addEventListener('click', () => { dirHint = 'next'; });

addEventListener('keydown', e => {
  const k = routeOf();
  if (e.key === 'Escape' && k !== 'home') { location.hash = '/'; return; }
  if (!EVENTS[k]) return;
  const i = ORDER.indexOf(k);
  if (e.key === 'ArrowRight') { dirHint = 'next'; location.hash = '/' + ORDER[(i + 1) % ORDER.length]; }
  if (e.key === 'ArrowLeft')  { dirHint = 'prev'; location.hash = '/' + ORDER[(i + ORDER.length - 1) % ORDER.length]; }
});

/* ---- First paint: land directly on whatever the URL says, no animation --- */
(function boot() {
  const k = routeOf();
  body.dataset.route = k;
  if (EVENTS[k]) {
    const cfg = EVENTS[k];
    panel.style.background = cfg.color;
    logo.src = cfg.logo;
    logo.alt = cfg.name;
    showBody(k);
    showEvent(true);
    scrollTo(0, 0);   // a saved scroll position (bfcache, extensions) shouldn't land mid-page
    clearHeroScrollStyles();
    // No entrance animation to wait for on a direct/deep-link boot — but
    // defer a frame anyway so the just-set logo image has definitely
    // completed layout before its resting height is measured.
    requestAnimationFrame(() => { measureDockGeometry(); applyHeroScroll(); });
    homeView.inert = true;
    current = k;
  } else {
    eventView.inert = true;
  }
  syncArrows();
})();

/* =========================================================================
   SITE CHROME — header backdrop, hamburger menu, in-page smooth scroll
   (homepage only; event pages keep their existing arrow/back nav)
   ========================================================================= */
const menuToggle = document.querySelector('.menu-toggle');
const siteMenu   = document.querySelector('.site-menu');
if (menuToggle && siteMenu) {
  const setMenu = open => {
    menuToggle.setAttribute('aria-expanded', String(open));
    siteMenu.classList.toggle('is-open', open);
    siteMenu.inert = !open;
    body.classList.toggle('menu-open', open);
  };
  menuToggle.addEventListener('click', () => setMenu(!siteMenu.classList.contains('is-open')));
  siteMenu.addEventListener('click', e => {
    if (e.target === siteMenu || e.target.closest('a')) setMenu(false);
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && siteMenu.classList.contains('is-open')) setMenu(false);
  });
}

/* Smooth-scroll same-page anchors (nav menu + footer links). Router links
   (#/halloween etc.) are left alone — only bare #id anchors are intercepted. */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  const id = a.getAttribute('href');
  if (!id || id.length < 2 || id.startsWith('#/')) return;
  a.addEventListener('click', e => {
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: REDUCED.matches ? 'auto' : 'smooth', block: 'start' });
  });
});

/* =========================================================================
   DELIGHT — reveal-on-scroll + number count-up (homepage), shared by
   whatever sections happen to use them.
   ========================================================================= */
if ('IntersectionObserver' in window) {
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); revealIO.unobserve(en.target); }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

  function animateCount(el) {
    const target = parseInt(el.dataset.countTo, 10) || 0;
    const suffix = el.dataset.countSuffix || '';
    const dur = t(1200);
    const start = performance.now();
    (function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { animateCount(en.target); countIO.unobserve(en.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count-to]').forEach(el => countIO.observe(el));
}

/* =========================================================================
   COUNTDOWNS — data-countdown="<ISO date>" on any element containing
   .cd__d / .cd__h / .cd__m / .cd__s spans. Placeholder dates; see README.
   ========================================================================= */
(function countdowns() {
  const els = document.querySelectorAll('[data-countdown]');
  if (!els.length) return;
  const DAY = 86400000, HOUR = 3600000, MIN = 60000;
  function tick() {
    const now = Date.now();
    els.forEach(el => {
      let diff = Math.max(0, new Date(el.dataset.countdown).getTime() - now);
      const d = Math.floor(diff / DAY);  diff -= d * DAY;
      const h = Math.floor(diff / HOUR); diff -= h * HOUR;
      const m = Math.floor(diff / MIN);  diff -= m * MIN;
      const s = Math.floor(diff / 1000);
      const set = (cls, v) => { const n = el.querySelector(cls); if (n) n.textContent = String(v).padStart(2, '0'); };
      set('.cd__d', d); set('.cd__h', h); set('.cd__m', m); set('.cd__s', s);
    });
  }
  tick();
  setInterval(tick, 1000);
})();
