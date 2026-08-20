/* =========================================================================
   BAR SCENE SOCIALS — router + choreography
   Four routes on one page: #/ , #/halloween , #/christmas , #/shamrock
   The URL is the single source of truth. Every navigation — click, arrow,
   keyboard, back button — just changes the hash; one pump() loop plays the
   matching transition. That keeps view and URL from ever disagreeing.
   ========================================================================= */

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

/* The card's exact on-screen rect, as a clip-path the panel can grow out of. */
function cardInset(card) {
  const r = card.getBoundingClientRect();
  const radius = getComputedStyle(card).borderTopLeftRadius || '0px';
  return `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round ${radius})`;
}
const FULL_BLEED = 'inset(0px 0px 0px 0px round 0px)';

/* =========================================================================
   HOME → EVENT   (three beats: logo drops out, color consumes, logo drops in)
   ========================================================================= */
async function toEvent(key) {
  const cfg = EVENTS[key];
  const card = cardFor(key);
  const cardLogo = card.querySelector('.card__logo');

  body.dataset.route = key;                 // wordmark starts its color shift

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
  eventView.classList.add('is-active');
  body.classList.add('is-event');

  await settle([
    anim(panel, [{ clipPath: cardInset(card) }, { clipPath: FULL_BLEED }],
      { duration: t(360), easing: EASE }),
    anim(logo, DROP_IN, { duration: t(300), delay: t(190), easing: EASE_BACK }),
  ]);

  homeView.inert = true;
  eventView.inert = false;
}

/* =========================================================================
   EVENT → HOME   (the same three beats, mirrored)
   ========================================================================= */
async function toHome(from) {
  const card = cardFor(from);
  const cardLogo = card.querySelector('.card__logo');

  body.dataset.route = 'home';
  homeView.inert = false;
  eventView.inert = true;

  await settle([anim(logo, DROP_OUT, { duration: t(160), easing: EASE_IN })]);

  await settle([
    anim(panel, [{ clipPath: FULL_BLEED }, { clipPath: cardInset(card) }],
      { duration: t(330), easing: EASE }),
    ...siblings(from).map(c => anim(c,
      [{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'scale(1)' }],
      { duration: t(300), easing: 'ease' })),
  ]);

  eventView.classList.remove('is-active');
  body.classList.remove('is-event');
  reset(panel);
  reset(logo);

  await settle([anim(cardLogo,
    [{ transform: 'translateY(-56px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
    { duration: t(280), easing: EASE_BACK })]);

  reset(cardLogo);
  siblings(from).forEach(reset);
}

/* =========================================================================
   EVENT → EVENT   (arrow navigation: the next color wipes across)
   ========================================================================= */
async function toSibling(key, dir) {
  const cfg = EVENTS[key];
  body.dataset.route = key;

  await settle([anim(logo, DROP_OUT, { duration: t(150), easing: EASE_IN })]);

  wipe.style.background = cfg.color;
  wipe.classList.add('is-live');
  const from = dir === 'prev' ? 'inset(0px 100% 0px 0px)' : 'inset(0px 0px 0px 100%)';

  logo.src = cfg.logo;
  logo.alt = cfg.name;

  await settle([
    anim(wipe, [{ clipPath: from }, { clipPath: 'inset(0px 0px 0px 0px)' }],
      { duration: t(280), easing: EASE }),
    anim(logo, DROP_IN, { duration: t(290), delay: t(190), easing: EASE_BACK }),
  ]);

  panel.style.background = cfg.color;   // commit before removing the wipe
  wipe.classList.remove('is-live');
  reset(wipe);
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
    eventView.classList.add('is-active');
    body.classList.add('is-event');
    homeView.inert = true;
    current = k;
  } else {
    eventView.inert = true;
  }
  syncArrows();
})();
