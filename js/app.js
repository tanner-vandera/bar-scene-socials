/* ═══════════════════════════════════════════════════════════════════
   BAR SCENE SOCIALS
   ───────────────────────────────────────────────────────────────────
   A handful of small, independent modules. Native scrolling, no scroll
   hijack. Everything that depends on scroll position — the reveals, the
   nav readout, the counting figures, the weather — is driven by
   IntersectionObserver rather than by work on every frame.

   The one rAF loop is the cursor, and it parks itself the moment the
   pointer stops moving.

   Modules are listed in the order they must boot; see init() at the foot
   of the file, which is the only place that order is stated.
   ═══════════════════════════════════════════════════════════════════ */
(() => {
'use strict';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ══════════════════ REVEALS ══════════════════
   Targets are tagged here rather than in the markup: the HTML stays a
   clean document, and what animates is a presentation decision. */
function initReveals() {
  const targets = [
    ...$$('.hero__h1 .line'),
    ...$$('.strip > div'),
    ...$$('.poster'),
    ...$$('.sec__kicker, .sec__title'),
    ...$$('.spec > div'),
    ...$$('.next__side > *'),
    ...$$('.mo__block'),
    ...$$('.cal li'),
    ...$$('.figs > div'),
    ...$$('.give > *'),
    ...$$('.sub > *'),
    ...$$('.foot__mark, .foot__meta')
  ];

  targets.forEach((el, i) => {
    el.classList.add('rv');
    /* Stagger only within a run of siblings, so a group cascades but a
       new group never inherits the previous group's delay. */
    const idx = el.parentElement
      ? Array.from(el.parentElement.children).indexOf(el) : 0;
    if (idx > 0 && idx < 4) el.classList.add('rv-d' + idx);
  });

  if (!('IntersectionObserver' in window) || REDUCED) {
    targets.forEach(t => t.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  targets.forEach(t => io.observe(t));
}

/* ══════════════════ COUNTDOWN ══════════════════ */
function initCountdown() {
  const nodes = $$('[data-countdown]').map(el => ({
    when: new Date(el.dataset.countdown).getTime(),
    d: $('.cd__d', el), h: $('.cd__h', el), m: $('.cd__m', el), s: $('.cd__s', el)
  })).filter(n => !isNaN(n.when));
  if (!nodes.length) return;

  const pad = n => String(Math.max(0, n)).padStart(2, '0');
  const tick = () => {
    const now = Date.now();
    nodes.forEach(n => {
      const sec = Math.floor(Math.max(0, n.when - now) / 1000);
      if (n.d) n.d.textContent = pad(Math.floor(sec / 86400));
      if (n.h) n.h.textContent = pad(Math.floor(sec / 3600) % 24);
      if (n.m) n.m.textContent = pad(Math.floor(sec / 60) % 60);
      if (n.s) n.s.textContent = pad(sec % 60);
    });
  };
  tick();
  setInterval(tick, 1000);
}

/* ══════════════════ FIGURES ══════════════════ */
function initFigures() {
  const nodes = $$('[data-count-to]');
  if (!nodes.length) return;
  const fmt = n => n.toLocaleString('en-US');

  const run = el => {
    const to = Number(el.dataset.countTo) || 0;
    const suffix = el.dataset.countSuffix || '';
    if (REDUCED) { el.textContent = fmt(to) + suffix; return; }
    const dur = 1400, t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 4)))) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.5 });
  nodes.forEach(n => io.observe(n));
}

/* ══════════════════ AGE GATE ══════════════════
   Self-declaration, not verification. It exists because the industry
   codes (Beer Institute, Brewers Association, Wine Institute, DISCUS)
   and the FTC's self-regulation reports treat it as required practice —
   it is not a legal control, and the fine print says where the real
   check happens. Wisconsin's legal drinking age is 21.

   Runs first and synchronously so the page is never briefly readable
   behind it. The answer is remembered for the session only. */
function initGate() {
  const gate = $('#gate');
  if (!gate) return;

  let passed = false;
  try { passed = sessionStorage.getItem('bss-age') === 'ok'; } catch (e) { /* private mode */ }
  if (passed) { gate.remove(); return; }

  gate.hidden = false;
  document.body.classList.add('is-gated');
  $('#gatePanel').focus();

  gate.addEventListener('click', e => {
    const btn = e.target.closest('[data-gate]');
    if (!btn) return;

    if (btn.dataset.gate === 'yes') {
      try { sessionStorage.setItem('bss-age', 'ok'); } catch (e) { /* ignore */ }
      gate.remove();
      document.body.classList.remove('is-gated');
    } else {
      $('#gateAsk').hidden = true;
      $('#gateDenied').hidden = false;
      $('#gatePanel').focus();
    }
  });
}

/* ══════════════════ THE SEASON ══════════════════
   The single source of truth for the calendar. Add a crawl here and its
   month appears, aligned to the real calendar, with the square marked and
   the name printed underneath — there are no dates typed into the markup
   and no day-of-week to work out by hand.

     date  ISO, parsed as plain numbers so it can never shift a day
           across a timezone
     mark  the sticker on the square; matches the cursor art in
           assets/cur-<mark>.png, so the calendar and the pointer agree
     href  where the square sends you

   Only the months named here are printed. Three crawls across eighteen
   months would otherwise be about five hundred empty squares. */
const SEASON = [
  { date: '2026-10-31', name: 'Haunted Bar Hop',      mark: 'bats',       href: '#next'         },
  { date: '2026-12-12', name: '12 Bars of Christmas', mark: 'candy-cane', href: '#e-christmas'  },
  { date: '2027-03-17', name: 'Shamrock Shuffle',     mark: 'clover',     href: '#e-shamrock'   }
];

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
const DAY_INITIAL = ['S','M','T','W','T','F','S'];
const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function initCalendar() {
  const host = $('#months');
  if (!host) return;

  const pad = n => String(n).padStart(2, '0');
  /* Split the string rather than letting Date parse it: 'YYYY-MM-DD' is
     read as UTC and then printed in local time, which lands the whole
     season one day early for anyone west of Greenwich. */
  const parts = iso => iso.split('-').map(Number);
  /* UTC throughout for the same reason — these are calendar facts, not
     moments, and they must not move with the reader's clock. */
  const firstDay = (y, m) => new Date(Date.UTC(y, m, 1)).getUTCDay();
  const monthLen = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

  const now = new Date();
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  /* Group the season by month, keeping the order it was written in. */
  const months = [];
  SEASON.forEach(ev => {
    const [y, m] = parts(ev.date);
    let bucket = months.find(b => b.y === y && b.m === m - 1);
    if (!bucket) months.push(bucket = { y, m: m - 1, events: [] });
    bucket.events.push(ev);
  });

  const esc = str => String(str).replace(/[&<>"]/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const html = months.map(({ y, m, events }) => {
    const lead  = firstDay(y, m);
    const total = monthLen(y, m);
    const cells = [];

    for (let i = 0; i < lead; i++) cells.push('<td></td>');

    for (let d = 1; d <= total; d++) {
      const iso = `${y}-${pad(m + 1)}-${pad(d)}`;
      const ev  = events.find(e => e.date === iso);
      const cls = ['d'];
      if (iso === today) cls.push('d--today');

      if (!ev) {
        cells.push(`<td><span class="${cls.join(' ')}">${d}</span></td>`);
        continue;
      }
      cls.push('d--hit');
      const dow = DAY_NAMES[(lead + d - 1) % 7];
      /* data-cursor is read on pointermove via closest(), so tagging the
         square is the whole integration — hover the date and the pointer
         becomes that crawl's mark. */
      cells.push(
        `<td class="is-ev"><a class="${cls.join(' ')}" href="${esc(ev.href)}"` +
        ` data-cursor="${esc(ev.mark)}"` +
        ` aria-label="${esc(`${dow} ${d} ${MONTH_NAMES[m]} ${y} — ${ev.name}`)}">` +
        `<span aria-hidden="true">${d}</span>` +
        `<i class="d__mark" style="background-image:url(assets/cur-${esc(ev.mark)}.png)" aria-hidden="true"></i>` +
        `</a></td>`
      );
    }

    /* Close the final week so the last rule runs the full width. */
    while (cells.length % 7) cells.push('<td></td>');

    const rows = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push('<tr>' + cells.slice(i, i + 7).join('') + '</tr>');
    }

    const head = DAY_INITIAL.map((ltr, i) =>
      `<th scope="col" abbr="${DAY_NAMES[i]}"><span aria-hidden="true">${ltr}</span>` +
      `<span class="vh">${DAY_NAMES[i]}</span></th>`).join('');

    return '<div class="mo__block">' +
      `<table class="mo">` +
        `<caption class="mo__cap"><b>${MONTH_NAMES[m]}</b> ${y}</caption>` +
        `<thead><tr>${head}</tr></thead>` +
        `<tbody>${rows.join('')}</tbody>` +
      `</table>` +
    '</div>';
  }).join('');

  host.innerHTML = html;
}

/* ══════════════════ WEATHER ══════════════════
   The butter panel gets lightning. Everything about the strike itself is
   in CSS — two elements, opacity only, one shared duration — and all this
   does is decide when the cycle is allowed to run.

   Tying it to the section being on screen does two jobs: nothing animates
   while you are elsewhere on the page, and because the class lands as the
   panel arrives, the first strike is always about a second after you get
   there rather than up to five seconds into a cycle you did not see. */
function initStorm() {
  const storm = $('.storm');
  if (!storm || REDUCED) return;

  const panel = storm.parentElement;
  if (!('IntersectionObserver' in window)) { storm.classList.add('is-live'); return; }

  new IntersectionObserver(entries => {
    entries.forEach(e => storm.classList.toggle('is-live', e.isIntersecting));
  }, { threshold: 0 }).observe(panel);
}

/* ══════════════════ TICKET RELEASE STAGE ══════════════════
   The stage is derived from the remaining allocation rather than typed
   in, so the chip can never disagree with the number beside it. */
function initTicketStage() {
  const el = $('.tstat');
  if (!el) return;

  const left = Number(el.dataset.remaining);
  if (!Number.isFinite(left)) return;

  const stage =
    left <= 0   ? { key: 'out',  label: 'Sold out'    } :
    left <= 300 ? { key: 'last', label: 'Last chance' } :
    left <= 800 ? { key: 'hot',  label: 'Going fast'  } :
                  { key: 'open', label: 'Register'    };

  el.dataset.stage = stage.key;
  $('.tstat__label', el).textContent = stage.label;
  $('.tstat__count', el).textContent = left > 0 ? left.toLocaleString('en-US') + ' left' : '';
}

/* ══════════════════ FLIP LABELS ══════════════════
   Duplicates the text of every [data-flip] into a two-line stack the CSS
   can slide. Built here so the markup stays one plain word per link —
   the second copy is presentation, and it must never reach the
   accessibility tree twice. */
function initFlip() {
  $$('[data-flip]').forEach(el => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);

    /* Three slots, not two. The animation ends on slot 3 — identical to
       slot 1 — so restarting is invisible and the cycle can repeat for as
       long as the pointer stays. With two slots it could only run once.

       data-flip="barcode" swaps the middle slot for a barcode sized to
       the word's own footprint, so the label morphs to a strip of code
       and back without the capsule changing width. */
    const mid = el.dataset.flip === 'barcode'
      ? '<i><span class="flip__code"></span></i>'
      : '<i>' + text + '</i>';

    el.innerHTML =
      '<span class="flip" aria-hidden="true">' +
      '<i>' + text + '</i>' + mid + '<i>' + text + '</i></span>';
  });
}

/* ══════════════════ NAVIGATION ══════════════════
   The dock indicator and the top-bar readout are two views of one piece
   of state: which section you're in. Both are driven from a single
   observer, so they can never disagree. */
function initNav() {
  const sections = $$('[data-label]');
  const group    = $('#dockGroup');
  const links    = $$('[data-nav]');
  const ind      = $('.dock__ind');
  const outLabel = $('#readoutLabel');
  if (!sections.length || !group) return;

  let active = null;

  const moveIndicator = link => {
    if (!link) return;
    ind.style.setProperty('--ind-x', link.offsetLeft + 'px');
    ind.style.setProperty('--ind-w', link.offsetWidth + 'px');
    group.classList.add('is-live');
  };

  const setActive = id => {
    if (id === active) return;
    active = id;
    const link = links.find(a => a.getAttribute('href') === '#' + id) || null;
    links.forEach(a => a.classList.toggle('is-active', a === link));

    if (link) moveIndicator(link);
    else group.classList.remove('is-live');   /* above the first section */

    const sec = id ? document.getElementById(id) : null;
    outLabel.textContent = sec ? sec.dataset.label : 'Index';
  };

  /* The active section is the LAST one whose top has passed a line a
     third of the way down the viewport. Written as "has passed" rather
     than "is crossing" on purpose: a crossing test has no answer once
     you scroll past the final section's band, which left the nav blank
     and the readout back at N.000 at the bottom of the page. */
  const sync = () => {
    const line = innerHeight * 0.34;
    let hit = null;
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= line) hit = s;
    }
    setActive(hit ? hit.id : null);
  };

  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; sync(); });
  }, { passive: true });

  /* The indicator is positioned in pixels, so it has to be re-measured
     when the capsule reflows. */
  addEventListener('resize', () => {
    moveIndicator(links.find(a => a.classList.contains('is-active')));
  }, { passive: true });

  sync();
}

/* ══════════════════ CURSOR ══════════════════
   One element, three states. Position is lerped so the mark trails the
   pointer slightly — that lag is what makes it feel like an object being
   carried rather than a graphic pinned to the mouse.

   Zone and interactivity are read from the DOM on pointermove via
   closest(), so nothing needs registering: mark a section
   data-cursor="…" and it just works, including on elements added later. */
/* Genuinely clickable things only. The calendar rows were in here and
   should not be — they are announced-only, and a cursor promising a click
   on something inert is worse than no cue at all. Their own fill-wipe
   already says the row is alive. */
const HOT = 'a, button, input, summary, [role="button"]';

function initCursor() {
  const cur = $('#cur');
  if (!cur) return;
  /* Touch and pen get the native pointer; there is nothing to replace. */
  if (!matchMedia('(pointer: fine)').matches) { cur.remove(); return; }

  document.documentElement.classList.add('has-cur');

  let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty;
  let running = false, zone = null, hot = null;

  const paint = () => {
    cx += (tx - cx) * (REDUCED ? 1 : .22);
    cy += (ty - cy) * (REDUCED ? 1 : .22);
    cur.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    if (!REDUCED && (Math.abs(tx - cx) > .3 || Math.abs(ty - cy) > .3)) {
      requestAnimationFrame(paint);
    } else {
      running = false;
    }
  };

  addEventListener('pointermove', e => {
    tx = e.clientX; ty = e.clientY;
    cur.classList.add('is-live');

    /* Which crawl's ground are we on, and is this thing clickable? */
    const el = e.target instanceof Element ? e.target : null;
    const nextZone = el?.closest('[data-cursor]')?.dataset.cursor || null;
    const nextHot  = !!el?.closest(HOT);

    if (nextZone !== zone) {
      zone = nextZone;
      if (zone) cur.dataset.cursor = zone; else delete cur.dataset.cursor;
    }
    if (nextHot !== hot) {
      hot = nextHot;
      cur.classList.toggle('is-hot', hot);
    }

    if (!running) { running = true; requestAnimationFrame(paint); }
  }, { passive: true });

  /* Browsers stop servicing rAF in a backgrounded tab. The loop parks
     itself with running=true and a frame that never arrives, so without
     this the cursor stays frozen even after you come back — the flag can
     only be cleared by a frame that will never run. Clearing it on
     re-show lets the next pointer move re-arm the loop. */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') running = false;
  });

  /* Leaving the window, or a tab switch, should not strand the cursor. */
  addEventListener('pointerleave', () => cur.classList.remove('is-live'));
  addEventListener('blur', () => cur.classList.remove('is-live'));
  /* Chrome keeps no pointer during a drag-out; catch the return too. */
  addEventListener('pointerenter', () => cur.classList.add('is-live'));
}

/* ══════════════════ ANCHORS ══════════════════
   Most links land just below the fixed bar. #tickets is different: it
   parks the FOOT of the butter panel on the foot of the viewport, so the
   whole offer — ticket, prices, terms — arrives in one frame instead of
   at the top of a section you then have to scroll through.

   On arrival the ticket runs its own hover state once. Same fill, same
   sweep, so the cue that draws the eye and the affordance that invites
   the click are the same gesture rather than two different ideas. */
function initAnchors() {
  const flash = () => {
    const t = $('.ticket');
    if (!t || REDUCED) return;
    t.classList.remove('is-flashing');
    void t.offsetWidth;                 /* restart, so repeat clicks re-fire */
    t.classList.add('is-flashing');
    setTimeout(() => t.classList.remove('is-flashing'), 1900);
  };

  /* Smooth scrolling has no completion callback and its duration is the
     browser's business, so watch for the page going still instead. */
  const onScrollSettled = (cb) => {
    let last = scrollY, still = 0, frames = 0, moved = false;
    const tick = () => {
      if (++frames > 240) return cb();                  /* ~4s ceiling */
      if (Math.abs(scrollY - last) >= 1) { moved = true; still = 0; }
      /* Smooth scrolling takes a few frames to start, so "not moving yet"
         has to be distinguished from "arrived". Only settle once movement
         has actually happened — or once enough frames have passed that
         there clearly wasn't going to be any, which is the case when the
         page is already parked at the target. */
      else if (++still > 4 && (moved || frames > 20)) return cb();
      last = scrollY;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* Layout position, walked from offsetTop rather than read off a
     bounding rect. A rect includes transforms, and every reveal target
     sits translated 14px down until it animates in — measuring one
     mid-reveal lands the scroll short and parks the target under the
     fixed bar. offsetTop and offsetHeight ignore transforms, so the
     landing is the same whether or not the target has revealed yet.
     This matters now that the calendar squares link straight at the
     announced rows, which are reveal targets. */
  const docTop = el => {
    let y = 0;
    for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
    return y;
  };

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();

      const off = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--top-h')) || 68;
      const underBar = docTop(target) - off - 8;
      let top = id === 'top' ? docTop(target) : underBar;

      if (id === 'tickets') {
        const panel = $('.sec--feature');
        if (panel) {
          /* Park the panel's foot on the viewport's foot. Take whichever
             is the smaller scroll: if the tail is taller than the screen,
             that lands the heading under the bar instead of pushing it
             off the top. */
          const foot = docTop(panel) + panel.offsetHeight - innerHeight;
          top = Math.min(foot, underBar);
        }
      }

      scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' });
      if (id === 'tickets') onScrollSettled(flash);
    });
  });
}

/* ══════════════════ BOOT ══════════════════ */
function init() {
  initGate();
  /* Before initReveals and initAnchors: the month squares are links and
     reveal targets, and both of those walk the DOM once at boot. */
  initCalendar();
  initReveals();
  initFlip();
  initTicketStage();
  initCountdown();
  initFigures();
  initNav();
  initCursor();
  initStorm();
  initAnchors();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
