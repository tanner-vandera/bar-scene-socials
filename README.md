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
the event pages) and a diagonal arrow badge that appears on the active card.

**Card hover expand.** Pointing at a card widens its column and squeezes its
neighbours (desktop), or grows its row and shrinks the others (tablet, where
the cards stack). Neighbours hold their lockup at full size and let the card
crop it — that crop is the look, not a bug. Two things here are easy to
re-break:
- **Which card is active is tracked in JS via `[data-active]`, not CSS
  `:hover`.** The grid's gaps belong to no card, so a `:hover` version had a
  dead strip between every pair: sweeping across, the row sprang back toward
  even and re-expanded once per gap. `pointerover` on the grid sets the active
  index and only `pointerleave` of the whole grid clears it, so crossing a gap
  holds the current card. `showEvent()` also clears it — hiding the grid
  mid-hover means its `pointerleave` never fires.
- **The resting track list must be written out explicitly** (`1fr 1fr 1fr`,
  not `repeat(3, 1fr)`). A track list only animates into another list of the
  same form, so with `repeat()` the card→card change animated but entering and
  leaving the grid *snapped* — the bounce was silently missing on exactly
  those two interactions. Same applies to the stacked `grid-template-rows`.

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
The hero — the event's logo and the side arrows over a full-bleed color field
— is the original, tested transition engine, unchanged in its choreography.
The color panel stays `position: fixed`, covering the full viewport, for as
long as the event view is active (that's what the entrance/exit animations
need).

**The page color is owned by `html` + `body`,** set from `setPageColor()` in
app.js on every route change; `.event__content` is transparent. This is not
incidental: driving the resting background off a fixed, `clip-path`-animated
panel left a stale-color artifact in iOS Safari's overscroll/toolbar zone
(flip from Shamrock to Christmas and the bottom of the screen stayed green).
`html`/`body` is the one surface iOS paints reliably everywhere, so it's the
single source of truth — keep it that way.

**Layout.** `--hero-band` (48svh) is the upper band the logo is centered in;
`.event__hero` is a spacer of exactly that height, so the intro content
starts right below it. That puts the tagline, countdown and "Get Tickets"
above the fold on both desktop and mobile. The side arrows key off the same
variable so they stay centered on the logo automatically. Below the intro:
event details, a featured-bars grid, and a photo-placeholder gallery — one
hand-authored block per event
(`.event__body[data-for="halloween|christmas|shamrock"]`), so copy is easy to
edit without touching JS.

**The header is transparent at rest** and fades in a solid same-color backdrop
once you scroll (`.site-header.is-scrolled`). Transparency is what lets the
arrow-navigation wipe sweep *behind* the header and recolor it for free — an
earlier version animated the header's own `background-color` alongside the
wipe, and keeping the two in sync was a recurring source of snap/lag bugs.
There's nothing to sync now. The "All Events" link (`.header-back`) lives in
the header, so it's always visible and clickable regardless of scroll; only
the side arrows fade.

**Side arrows.** Desktop: pinned to the left/right margins, vertically
centered on the logo. Mobile: paired and centered just *above* where the intro
starts. Two fixed bugs worth not reintroducing:
- They must clear `--hero-band`, not sit below it. Anchored below, they landed
  on the intro, and since `.event__content` stacks above them, taps hit the
  headline text instead of the button — the arrows simply didn't work on
  mobile. They're now `z-index: 6` (above content) as a belt-and-braces so a
  short viewport can't make them unreachable.
- The hover nudge is a custom property (`--arrow-nudge`), *not* a replacement
  `transform`. A `:hover { transform: ... }` rule wiped out the mobile
  centering transform and re-applied `translateY(-50%)`, so the button jumped
  out from under the cursor, un-hovered itself, snapped back and re-hovered —
  a visible vibration. Positioning lives in `left`, the nudge lives in the
  variable, and the two never collide.

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
direction of travel, then the lockup drops in; the page color is committed to
`html`/`body` as the wipe lands. The header needs no coordination at all here
— it's transparent at the top of the page, so the wipe passing behind it
recolors it for free. (Earlier revisions animated the header's own background
in step with the wipe, and mistimings there caused first a premature snap,
then a visible lag. Going transparent removed the whole class of bug.) Arrow
keys work too; Esc goes home — both can fire from anywhere on the page (not
just by clicking the visible controls), including mid-scroll with the logo
docked, which is its own edge case: the logo is reset to plain styles and the
page jumps to the top *before* the drop-out animation plays, or a docked
(small) logo would visibly snap to full size against whatever was scrolled
into view.

**The wordmark never re-renders.** It's a single element (living in
`.site-header`, present on every route) drawn as a stencil — the logo art
masks a solid color block via `mask-image` — always cream, since whatever sits
behind the header is always dark or a bold event color.

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
`.section__head h2`, `.event__tagline`, `.event__subhead h2`, the countdown
and card numbers, and the full-screen nav links. Everything else (body copy,
labels, buttons, details, footer) is Inter.

**Eyebrows are one shared treatment.** Every all-caps micro-label on the site
— `.eyebrow`, `.detail dt` (DATE & TIME), `.countdown__label` (DAYS/HRS/…),
`.card__countdown-label`, `.footer__col h4`, `.site-menu__meta` — is covered
by a single selector list at the top of `styles.css`: Inter 800, `.12em`
tracking, `clamp(12px, 1vw, 14px)`, full-opacity cream. They previously
drifted apart via one-off `opacity`/`font-size` overrides at each usage site,
which read as several different styles doing the same job. If something needs
to sit back visually, do it with `opacity` at the usage site — don't fork the
size/weight/color.

Coral Candy and Richard Samuels aren't on Google Fonts, so
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
