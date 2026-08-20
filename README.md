# Bar Scene Socials — prototype

A 4-page raw-HTML prototype for a Milwaukee bar-crawl events brand. Bold and
minimalist: a light-gray home screen with the brand mark and three event cards,
each opening to its own full-bleed color page. Clicking a card makes it **expand
to consume the whole screen** into that event's page (View Transitions API).

## Screens (one page, four routes)
Everything lives in `index.html`; `js/app.js` swaps views. The URL is the source
of truth, so back/forward and deep links work:

- `#/` — brand mark + "Our Events" grid (orange / red / green cards)
- `#/halloween` — Halloween Bar Crawl (orange `#F48515`)
- `#/christmas` — 12 Bars of Christmas (red `#D01E21`)
- `#/shamrock` — Shamrock Shuffle (green `#11A156`)

`halloween.html` / `christmas.html` / `shamrock.html` are one-line redirects to
the matching route, so the original URLs still work.

Background / logo tone: `#EAEAEA`. Colors sampled straight from the Figma exports.

## The transitions
All choreography is in `js/app.js` (Web Animations API — promise-based, so a
sequence can't stall on a dropped event).

**Card → event, three beats (~660ms).** The event's logo drops out and its
neighbours recede; the card's color then *consumes the screen*; the new lockup
drops in from the top with a slight overshoot. The expansion animates
`clip-path: inset(…)` from the card's exact rect rather than scaling a box —
scaling would squash the rounded corners, clipping doesn't. Going home mirrors it.

**Event → event (~600ms).** Side arrows wipe the next color across from the
direction of travel, then the lockup drops in. Arrow keys work too; Esc goes home.

**The wordmark never re-renders.** It's a single fixed element drawn as a stencil
(the logo art masks a solid color block via `mask-image`), so switching routes
just animates `background-color` black ↔ cream. It never moves or swaps out.

Guards: one transition at a time, with a queue that keeps running until the view
matches the URL — so fast repeated clicks can't desync them. `prefers-reduced-motion`
collapses every duration to ~1ms.

## Fonts
| Use | Font | Source |
|-----|------|--------|
| Brand / UI | **Coral Candy** | self-hosted `fonts/CoralCandy.woff2` |
| Shamrock serif | **Richard Samuels** | self-hosted `fonts/RichardSamuels.woff2` |
| Halloween display | **Creepster** | Google Fonts |
| Christmas script | **Meow Script** | Google Fonts |

Coral Candy and Richard Samuels are **not** on Google Fonts, so they're
self-hosted. Coral Candy here is the **free demo** file (no `®` glyph, which is
why the brand wordmark uses the exported PNG lockup) — swap in the full licensed
version for any real use. Every logo/wordmark on the cards uses the exported PNG
lockups in `assets/`, so the type is pixel-exact regardless of loaded fonts.

## Run it
Serve it over http (not `file://`):

```bash
cd prototypes/bar-scene-socials && python3 -m http.server 5177
```

Then open http://localhost:5177 . (There's also a `bar-scene-socials` entry in
`.claude/launch.json`.)

## Reference
`_figma-source/` holds the original Figma exports (the three event frames, the
"Our Events" frame, the font spec, and the isolated vector lockups).
