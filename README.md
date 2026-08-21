# Bar Scene Socials — prototype

A raw-HTML prototype for a Milwaukee bar-crawl events brand. Bold and
minimalist: a homepage with the brand mark, three event cards, and a full
marketing site below the fold; each card opens to its own full-bleed color
event page with a bold, snappy transition (the card **consumes the screen**),
plus a countdown, ticket CTA, and event details.

## Screens (one page, four routes)
Everything lives in `index.html`; `js/app.js` swaps views. The URL is the source
of truth, so back/forward and deep links work:

- `#/` — homepage: brand mark + "Our Events" grid, marketing sections, footer
- `#/halloween` — Halloween Bar Crawl (orange `#F48515`)
- `#/christmas` — 12 Bars of Christmas (red `#D01E21`)
- `#/shamrock` — Shamrock Shuffle (green `#11A156`)

`halloween.html` / `christmas.html` / `shamrock.html` are one-line redirects to
the matching route, so the original URLs still work.

Background / logo tone: `#EAEAEA`. Colors sampled straight from the Figma exports.

## Homepage
`<header class="site-header">` is a persistent, always-mounted bar (logo left,
hamburger right) with a transparent background at rest that gains an opaque
backdrop once scrolled — cream on the home route, ink on event routes, so it
never visually collides with whatever's scrolling behind it (which is what
"OUR EVENTS" used to do before this pass).

Below the event grid: a marketing blurb, a looping curved-text ribbon (plain
SVG `<textPath>` + SMIL animation, no libraries), a "why crawl with us"
feature row, an About Us section with count-up stats, placeholder
testimonials, an email signup teaser, and a footer. Sections fade/rise in via
`.reveal` + `IntersectionObserver` as you scroll to them.

The hamburger opens a full-screen nav (`.site-menu`) with smooth-scroll links
to the homepage's sections. It's homepage-only — event pages keep their
existing back-pill + arrow nav.

**Important structural note:** all of that homepage content — the grid *and*
every marketing section *and* the footer — lives inside one wrapper,
`<div data-view="home">`. That wrapper is what `showEvent()` in app.js
toggles to `display:none` when an event is active. If you add a new homepage
section, put it inside that wrapper (between the grid and `</footer>`) — a
section added as a sibling of it, outside the wrapper, won't get hidden when
viewing an event page and will silently push the event content down by its
full height.

## Event pages
The hero — full-bleed color, the event's logo, the side arrows, and the back
pill — is the original, tested transition engine, unchanged in its choreography.
It stays `position: fixed`, covering the full viewport, for as long as the
event view is active (that's what the entrance/exit animations need). Below
it, one screen's worth of scroll space (`.event__hero`, a spacer) reserves
room, and then the real content starts: countdown, "Get Tickets" CTA, event
details, a featured-bars grid, and a photo-placeholder gallery — one hand-authored
block per event (`.event__body[data-for="halloween|christmas|shamrock"]`), so
copy is easy to edit directly without touching JS.

Because the hero's color panel is fixed and full-viewport the whole time, it
would otherwise permanently blanket that new content in solid color no matter
how far you scroll. Past the hero, the panel, the logo, and the side
arrows/back pill all fade out (`.is-faded`, same mechanism, driven by an
`IntersectionObserver` watching `.event__hero`) so the content underneath is
actually visible — and fade back in when you scroll back up.

**Countdown dates are placeholders**, clearly not confirmed: Halloween → Oct
31 2026, Christmas → Dec 12 2026, Shamrock → Mar 17 2027 (next St. Patrick's
Day). **Bar names are invented**, not real Milwaukee businesses. **Ticket CTAs
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
direction of travel, then the lockup drops in. Arrow keys work too; Esc goes home.

**The wordmark never re-renders.** It's a single element (living in
`.site-header`, present on every route) drawn as a stencil — the logo art
masks a solid color block via `mask-image` — so switching routes just
animates `background-color` black ↔ cream. It never moves or swaps out.

Guards: one transition at a time, with a queue that keeps running until the
view matches the URL (fast repeated clicks/arrow-taps can't desync it); every
card + logo is reset to a clean baseline at the start of *every* transition,
not just the ones adjacent to where you're coming from (that gap used to
strand a card's logo invisible if you arrowed between events before hitting
"back"); `history.scrollRestoration = 'manual'` and an explicit `scrollTo(0,0)`
on every route change, so you always land on a fresh hero, never mid-scroll
from wherever you last were. `prefers-reduced-motion` collapses every
duration to ~1ms. Deliberately **not** using global `scroll-behavior: smooth`
— that made *every* programmatic scroll (including the transition engine's
own resets) animate instead of jump, which is its own kind of glitchy; the
nav menu's smooth-scroll opts in explicitly per-link instead.

## Fonts
| Use | Font | Source |
|-----|------|--------|
| Headlines only | **Coral Candy** | self-hosted `fonts/CoralCandy.woff2` |
| Everything else | **Inter** | Google Fonts |
| Shamrock serif | **Richard Samuels** | self-hosted `fonts/RichardSamuels.woff2` |
| Halloween display | **Creepster** | Google Fonts |
| Christmas script | **Meow Script** | Google Fonts |

Coral Candy is reserved for the big headline moments — `.home__title`,
`.section__head h2`, `.event__tagline`, the ribbon, pull-quotes, big stat/countdown
numbers, and the full-screen nav links. Everything else (body copy, labels,
buttons, details, footer) is Inter. Coral Candy and Richard Samuels aren't on
Google Fonts, so they're self-hosted; Coral Candy here is the **free demo**
file (no `®` glyph, which is why the brand wordmark uses the exported PNG
lockup) — swap in the full licensed version for any real use. Every event
logo/wordmark on the cards uses the exported PNG lockups in `assets/`, so the
type is pixel-exact regardless of loaded fonts.

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
