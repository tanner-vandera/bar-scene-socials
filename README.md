# Bar Scene Socials — prototype

A raw-HTML prototype for a Milwaukee bar-crawl events brand. Bold and
minimalist: a black homepage with the brand mark, three event cards, and a
marketing site below the fold; each card opens to its own event page —
**flooded in that event's own color**, hero through footer — with a bold,
snappy card-consumes-the-screen transition, a countdown, a ticket CTA, and
event details.

## Screens (one page, four routes)
Everything lives in `index.html`; `js/app.js` swaps views. The URL is the source
of truth, so back/forward and deep links work:

- `#/` — homepage: brand mark + "Our Events" grid, marketing sections, footer
- `#/halloween` — Halloween Bar Crawl (orange `#F48515`)
- `#/christmas` — 12 Bars of Christmas (red `#D01E21`)
- `#/shamrock` — Shamrock Shuffle (green `#11A156`)

`halloween.html` / `christmas.html` / `shamrock.html` are one-line redirects to
the matching route, so the original URLs still work.

Colors sampled straight from the Figma exports. No box-shadows or drop-shadows
anywhere on the site — a deliberate, sitewide choice.

## Homepage
Black background, cream type and logo — the event cards' bold colors are the
only color on the page. `<header class="site-header">` is a persistent,
always-mounted bar (logo left, hamburger right), solid black at all times on
the homepage (not conditional on scroll — that flip-flopping used to hide the
logo/hamburger when the menu opened mid-scroll, cream-on-cream).

Below the event grid: a marketing blurb, a "why crawl with us" feature row, an
email signup teaser, and a footer. Sections fade/rise in via `.reveal` +
`IntersectionObserver` as you scroll to them. Each event card carries a live
countdown (`.card__countdown`, reusing the same `[data-countdown]` ticking as
the event pages) and a diagonal arrow badge that appears top-right on hover.

The hamburger opens a full-screen nav (`.site-menu`) — Our Events, all three
crawls individually, Why Crawl With Us, Contact — with smooth-scroll links to
the homepage's sections. It's homepage-only; event pages use the header's
"All Events" link + the side arrows instead.

**Important structural note:** all of that homepage content — the grid *and*
every marketing section *and* the footer — lives inside one wrapper,
`<div data-view="home">`. That wrapper is what `showEvent()` in app.js
toggles to `display:none` when an event is active. If you add a new homepage
section, put it inside that wrapper (between the grid and `</footer>`) — a
section added as a sibling of it, outside the wrapper, won't get hidden when
viewing an event page and will silently push the event content down by its
full height.

## Event pages
The hero — full-bleed color, the event's logo, the side arrows — is the
original, tested transition engine, unchanged in its choreography. It stays
`position: fixed`, covering the full viewport, for as long as the event view
is active (that's what the entrance/exit animations need). Below it, one
screen's worth of scroll space (`.event__hero`, a spacer) reserves room, and
then the real content starts: countdown, "Get Tickets" CTA, event details, a
featured-bars grid, and a photo-placeholder gallery — one hand-authored block
per event (`.event__body[data-for="halloween|christmas|shamrock"]`), so copy
is easy to edit directly without touching JS. `.event__content` sits above the
hero's fixed color panel in z-index and carries that same event's color, so
hero and content read as one unbroken field — there's nothing to visually
"hand off" between them.

The header also carries that event's color, always (not conditional on
scroll) — `body[data-route="halloween"] .site-header { background: ... }` and
so on. The "All Events" link (`.header-back`) lives in the header, so it's
always visible and clickable regardless of scroll position; only the side
arrows fade.

**Scrolling docks the hero logo into the header** (desktop/tablet — on
narrow viewports it just fades, there's no room to dock it next to the
wordmark). This is a direct, continuous scroll → transform mapping (see
"HERO SCROLL EFFECT" in `js/app.js`), not a threshold toggle: scale and
position are `Math.min(1, scrollY / DOCK_DISTANCE)`, applied every frame via
a `requestAnimationFrame`-throttled scroll listener. A toggle-based version
shipped first and felt "touchy" — needed a full screen of scroll to trigger,
and re-triggered the instant you scrolled back up past the same point. A
continuous mapping has no trigger point to get wrong. Two non-obvious things
that made this work correctly:
- The docked logo's on-screen position sits *inside* the header's box, so its
  `z-index` has to be **above** the header's (`61` vs. the header's `60`) —
  otherwise the header's now-opaque background paints right over it.
- A `fill: 'both'` Web Animation holds its properties even after finishing,
  which silently blocks any later plain `el.style.x = ...` write on that same
  property. `reset(logo)` (cancelling the tracked animation) has to run once
  the entrance/exit animation settles, or the scroll effect's writes get
  ignored. `toEvent`/`toSibling` do this right after their `await settle(...)`.

**Countdown dates are placeholders**, clearly not confirmed: Halloween → Oct
31 2026, Christmas → Dec 12 2026, Shamrock → Mar 17 2027 (next St. Patrick's
Day) — kept in sync between each home card and its matching event page.
**Bar names are invented**, not real Milwaukee businesses. **Ticket CTAs
are inert** (`onclick="return false"`) with a note underneath — wire up the
real ticketing link when there is one.

## The transitions
All choreography is in `js/app.js` (Web Animations API — promise-based, so a
sequence can't stall on a dropped event).

**Card → event, three beats (~660ms).** The event's logo drops out and its
neighbours recede; the card's color then *consumes the screen*; the new lockup
drops in from the top with a slight overshoot. The expansion animates a plain
`clip-path: inset()` from the card's exact rect (not `scale`, which would
squash the rounded corners) with the corner radius animated separately via
`border-radius` — Safari interpolates that combination far more reliably than
the `inset(... round Xpx)` shorthand. Going home mirrors it.

**Event → event (~600ms).** Side arrows wipe the next color across from the
direction of travel, then the lockup drops in. The header's color-change is
deliberately delayed until the wipe actually finishes (`body.dataset.route`
is set alongside `panel.style.background`, not at the top of `toSibling`) —
otherwise, since the header is always-opaque now, it would snap to the new
event's color well before the wipe had visually swept that far. Arrow keys
work too; Esc goes home — both can fire from anywhere on the page (not just
by clicking the visible controls), including mid-scroll with the logo docked,
which is its own edge case: the logo is reset to plain styles and the page
jumps to the top *before* the drop-out animation plays, or a docked (small)
logo would visibly snap to full size against whatever was scrolled into view.

**The wordmark never re-renders.** It's a single element (living in
`.site-header`, present on every route) drawn as a stencil — the logo art
masks a solid color block via `mask-image` — always cream, since the header
now always has a dark or bold-color backdrop behind it.

Guards: one transition at a time, with a queue that keeps running until the
view matches the URL (fast repeated clicks/arrow-taps can't desync it); every
card + logo is reset to a clean baseline at the start of *every* transition,
not just the ones adjacent to where you're coming from (that gap used to
strand a card's logo invisible if you arrowed between events before hitting
"back"); `history.scrollRestoration = 'manual'` and an explicit `scrollTo(0,0)`
on every route change, so you always land on a fresh hero, never mid-scroll
from wherever you last were. `prefers-reduced-motion` collapses every
duration to ~1ms and holds the hero-scroll effect at its resting state.
Deliberately **not** using global `scroll-behavior: smooth` — that made
*every* programmatic scroll (including the transition engine's own resets)
animate instead of jump, which is its own kind of glitchy; the nav menu's
smooth-scroll opts in explicitly per-link instead.

## Fonts
| Use | Font | Source |
|-----|------|--------|
| Headlines only | **Coral Candy** | self-hosted `fonts/CoralCandy.woff2` |
| Everything else | **Inter** | Google Fonts |
| Shamrock serif | **Richard Samuels** | self-hosted `fonts/RichardSamuels.woff2` |
| Halloween display | **Creepster** | Google Fonts |
| Christmas script | **Meow Script** | Google Fonts |

Coral Candy is reserved for the big headline moments — `.home__title`,
`.section__head h2`, `.event__tagline`, `.event__subhead h2`, and the
full-screen nav links. Everything else (body copy, labels, buttons, details,
footer) is Inter. Coral Candy and Richard Samuels aren't on Google Fonts, so
they're self-hosted; Coral Candy here is the **free demo** file (no `®` glyph,
which is why the brand wordmark uses the exported PNG lockup) — swap in the
full licensed version for any real use. Every event logo/wordmark on the
cards uses the exported PNG lockups in `assets/`, so the type is pixel-exact
regardless of loaded fonts.

## Run it
Serve it over http (not `file://`):

```bash
cd prototypes/bar-scene-socials && python3 -m http.server 5177
```

Then open http://localhost:5177 . (There's also a `bar-scene-socials` entry in
`.claude/launch.json`.)

## Deploying
Pushing `main` on `github.com/tanner-vandera/bar-scene-socials` auto-deploys
to Vercel (`bar-scene-socials.vercel.app`). The deploy copy lives separately at
`~/bar-scene-socials-site/` — after editing files here in the repo, copy the
changed files there, commit, and push (see git history for the exact pattern).

## Reference
`_figma-source/` holds the original Figma exports (the three event frames, the
"Our Events" frame, the font spec, and the isolated vector lockups).
