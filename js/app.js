/* ═══════════════════════════════════════════════════════════════════
   BAR SCENE SOCIALS
   ───────────────────────────────────────────────────────────────────
   Five small modules. Native scrolling, no scroll hijack, no rAF loop —
   this design has one motion idea (lift and fade) and two things that
   track scroll position, and IntersectionObserver handles both without
   running code every frame.
   ═══════════════════════════════════════════════════════════════════ */
(() => {
'use strict';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ══════════════════ 1. REVEALS ══════════════════
   Targets are tagged here rather than in the markup: the HTML stays a
   clean document, and what animates is a presentation decision. */
function initReveals() {
  const targets = [
    ...$$('.hero__h1'),
    ...$$('.strip > div'),
    ...$$('.poster'),
    ...$$('.sec__n, .sec__kicker, .sec__title'),
    ...$$('.spec > div'),
    ...$$('.next__side > *'),
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

/* ══════════════════ 2. COUNTDOWN ══════════════════ */
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

/* ══════════════════ 3. FIGURES ══════════════════ */
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

/* ══════════════════ 0. AGE GATE ══════════════════
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

/* ══════════════════ 3a. SMOKE ══════════════════
   The headline exists twice: a blurred copy behind, and the sharp copy
   masked so only its centre — plus wherever the pointer is — reads
   clean. The pointer position is lerped, so the clearing trails the
   cursor and drifts shut behind it. */
function initSmoke() {
  const hero  = $('#hero');
  const h1    = $('#heroH1');
  const sharp = $('.h1__sharp');
  if (!hero || !h1 || !sharp || REDUCED) return;

  /* Clone for the blur layer. initReveals() tags .hero__h1 itself rather
     than the lines, so there is no reveal state to inherit here — but
     strip it anyway in case that ever changes. */
  const blur = sharp.cloneNode(true);
  blur.className = 'h1__blur';
  blur.setAttribute('aria-hidden', 'true');
  blur.querySelectorAll('.rv').forEach(el => el.classList.remove('rv'));
  h1.insertBefore(blur, sharp);

  hero.classList.add('has-smoke');
  if (!matchMedia('(pointer: fine)').matches) return;

  let tx = -999, ty = -999, cx = -999, cy = -999, running = false;

  addEventListener('pointermove', e => {
    const r = sharp.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
    if (cx === -999) { cx = tx; cy = ty; }
    if (!running) { running = true; requestAnimationFrame(frame); }
  }, { passive: true });

  const frame = () => {
    cx += (tx - cx) * .16;
    cy += (ty - cy) * .16;
    sharp.style.setProperty('--sx', cx.toFixed(1) + 'px');
    sharp.style.setProperty('--sy', cy.toFixed(1) + 'px');
    if (Math.abs(tx - cx) > .4 || Math.abs(ty - cy) > .4) requestAnimationFrame(frame);
    else running = false;
  };
}

/* ══════════════════ 3b. FLIP LABELS ══════════════════
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

/* ══════════════════ 4. NAVIGATION ══════════════════
   The dock indicator and the top-bar readout are two views of one piece
   of state: which section you're in. Both are driven from a single
   observer, so they can never disagree. */
function initNav() {
  const sections = $$('[data-sec]');
  const group    = $('#dockGroup');
  const links    = $$('[data-nav]');
  const ind      = $('.dock__ind');
  const outN     = $('#readoutN');
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
    outN.textContent     = sec ? sec.dataset.sec : 'N.000';
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

/* ══════════════════ BOOT ══════════════════ */
function init() {
  initGate();
  initReveals();
  initFlip();
  initSmoke();
  initCountdown();
  initFigures();
  initNav();

  /* Anchor links land below the fixed top bar. */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      const off = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--top-h')) || 68;
      scrollTo({
        top: target.getBoundingClientRect().top + scrollY - (id === 'top' ? 0 : off + 8),
        behavior: REDUCED ? 'auto' : 'smooth'
      });
    });
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
