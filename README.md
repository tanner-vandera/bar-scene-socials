# Bar Scene Socials

A Milwaukee bar-crawl site. Paper, ink, and three colours with one job each.

Raw HTML/CSS/JS, no build step. Three files.

```bash
open http://localhost:5178
```

Served by the `bar-scene-socials-v2` entry in `.claude/launch.json`
(`python3 -m http.server 5178`).

**Live at [bar-scene-socials.vercel.app](https://bar-scene-socials.vercel.app).**
The deploy copy lives at `~/bar-scene-socials-site/` — this directory minus
`_dev-viewport.html` and `_brand-source/` — pushed to
`github.com/tanner-vandera/bar-scene-socials`, which Vercel builds on push
to `main` in about fifteen seconds.

> This is a **full visual reset**. Nothing survives from the earlier
> iterations except the logo artwork and the factual content. The previous
> direction — cherry red fields, plum, butter, Shrikhand everywhere, the
> sticky event deck, film grain, seam bleeds — is gone, not layered over.
> The first prototype still exists untouched at
> `prototypes/bar-scene-socials/`.

---

## The rules

Three constraints do most of the design work. They're worth keeping.

### 1. The colour budget

Three colours, each with one job. Two declared exceptions, below.

| | |
|---|---|
| **Red** `#CE1919` | The brand speaking, and the transaction. Brand: the cherry, wherever the mark appears. Transaction: the countdown, the release chip, the ticket on hover, the "Get tickets" link, the dock CTA. |
| **Butter** `#FFFFA7` | The Upcoming panel. One section, edge to edge, nowhere else. |
| **Volt** `#009B3E` | The amount returned to the city. One figure, forever. |

Everything else is `--paper` `#EFECE7`, `--ink` `#111`, and three
opacities of ink for secondary text and hairlines.

**Two things sit outside the budget on purpose:**

| | |
|---|---|
| **White** | The lightning over the Upcoming panel. Light, not pigment — it exists for about a third of a second at a time and leaves nothing behind. |
| **The event marks** | The three stickers on the calendar's marked days, which are the cursor art reused at ~20px. An accent on a monochrome grid, not a palette. If they ever start reading as colour on the page, they are the first thing to cut. |

Before adding anything else — or a red that isn't brand or transaction —
check whether an existing colour already carries the idea.

> Volt was specified as "electric green". `#00C24E` is the electric
> version but measures **2.02:1** on paper, under the 3:1 large-text
> minimum. `#009B3E` is **3.10:1** and still reads as voltage. Swap the
> `--volt` token if the brighter one is worth the trade.

### 2. Shrikhand is rationed

The brand face is set in exactly **two** places as live text:

1. **"Milwaukee's"** in the hero headline — `<b>` inside `.hero__h1`.
   Wrap a word in `<b>` and it takes the brand face; that's the whole
   mechanism.
2. **The three marked day numerals** in the calendar (`.d--hit`) — and
   only those three, out of roughly ninety days on screen.

The rationing is the point. Set on all ninety numerals the face is
wallpaper and the marked days stop reading as marked; set on three, it is
what makes them read as circled.

The lockup SVGs carry the same face in the header and in the large stacked
footer mark, so the brand is present throughout without the typeface being
spent.

> **It runs at `1.09em`, and that number is measured, not chosen.** At the
> same font-size, Inter Tight's caps stand at `.73em` and Shrikhand's at
> `.67em` — so Shrikhand has to be set 1.09× larger for the two faces to
> read as one line. It was at `.84em` for a while, which is exactly why it
> sat visibly short of the grotesque.

Everything else is **Inter Tight** (display) and **Inter** (UI, body,
labels) — the closest Google-served neo-grotesques to the Haas Unica /
Helvetica Now register the reference sites use.

### 3. One information pattern

Every fact on the site is presented the same way: **a rule, a label, a
value.** It appears at three scales — `.strip` (hero), `.spec` (key/value
tables), `.figs` (large figures) — plus `.rows`, `.cal` and the calendar's week
rules as variants.
Hairlines, not boxes, do the organising. There is no card, no panel with a
background, and no shadow anywhere.

---

## Layout

**The Upcoming head is split on the same columns as its body.** The event name
takes `1 / span 5` and the pitch plus the ticket link take `7 / -1` —
exactly the tracks the poster and the detail rail use underneath, so the
head sits *on* the structure it introduces rather than near it. The other
three heads have nothing to put on the right and stay full-width.

> The rule above each section title is its own element (`.sec__rule`),
> not a `border-top` on the title. A border only spans the full grid while
> the title does; once the Upcoming title narrowed to five columns it would
> have dragged the section divider in with it.

**Calendar rows** lead with an eyebrow pairing the date and the status —
`12 DEC 2026 · COMING SOON` — over the outlined name, which is the same
small-label-then-headline order every other section uses. They were a
four-column row (index / name / date / status) before, which made them the
only piece of content on the site reading left-to-right instead of
top-to-bottom.

A 12-column grid (`.grid`) with a fluid page margin (`--m`) and gutter
(`--gap`). Headlines run large and tight (`-.045em`); the small tracked
uppercase labels (`+.1em`) are the counterweight that lets them.

| | |
|---|---|
| Age gate | 21+ self-declaration, shown once per session |
| Hero | Full-bleed photograph, headline set in the bottom-left corner |
| Upcoming | Haunted Bar Hop — butter panel, facts, poster, ticket |
| Calendar | The two announced crawls, one hairline row each |
| History | Figures, and the amount returned to the city |
| Contact | Addresses and a ticket-drop signup |
| Footer | The stacked lockup and colophon |

> Sections were numbered `N.001`–`N.004` for a while and no longer are.
> The top-bar readout lost its numeral with them — with nothing on the page
> numbered, `N.001` there pointed at something that did not exist. The
> readout is now just the section name, and on narrow screens it shows that
> name rather than the hairline, which was the half that survived when the
> numeral went and left an orphaned dash.

Copy is deliberately terse. Facts, dates, counts — no atmosphere-setting.
Where the old site said *"One wristband, sixteen haunted watering holes,
and zero survivors before last call,"* this one says **16 bars. Historic
Third Ward. Wristband, no cover.**

---

## The age gate

`initGate()` runs first and synchronously, so the page is never briefly
readable behind it. The answer is held in `sessionStorage` — one
declaration per session, not a permanent cookie.

> **An age gate is self-declaration, not verification.** It carries no
> legal weight on its own. It exists because the industry codes (Beer
> Institute, Brewers Association, Wine Institute, DISCUS) and the FTC's
> Self-Regulation in the Alcohol Industry reports treat it as required
> practice. The actual control is photo ID at wristband pickup, which the
> fine print states. **Wisconsin's legal drinking age is 21**
> ([Wis. Stat. ch. 125](https://docs.legis.wisconsin.gov/document/statutes/125.07)).
>
> Copy is deliberately flat and declarative. Playful phrasing on an age
> gate creates ambiguity about what's being asserted, which defeats the
> only thing it's good for.

If this ever becomes a real ticketing flow, the gate is not enough on its
own — it needs a verified ID check at purchase or handoff.

---

## The cursor

Three states, one element (`.cur`):

| State | Cursor |
|---|---|
| Default | An ink ring with a centre dot — the same drawing language as every rule on the page, closed into a circle |
| Over an event | The ring recedes and that crawl's mark takes its place, angled like a cursor rather than sitting upright |
| Over something clickable | Whichever is showing grows and leans further |

Zones are declared in the markup, not registered in code — `data-cursor="bats"`
on the Upcoming section, `candy-cane` and `clover` on the calendar rows,
and the same three on the calendar's marked day squares. `app.js` reads
them with `closest()` on pointer move, so tagging a new section — or a
square generated at runtime — is the whole integration.

**The ring and dot are drawn in ink with a light halo on both sides of the
stroke** (`border` + outer and inset `box-shadow`). That sandwich is what
lets one drawing read on paper, butter, ink and photography without a
single per-section override. The event marks are images and sit on top.

> **This replaced `mix-blend-mode: difference`, which was doing nothing.**
> The cursor is positioned with a `transform` and carries `will-change`,
> and *either* of those makes it a stacking context — which isolates its
> descendants' blending. So the ring was compositing against the cursor's
> own empty box and staying pure white, which on pale paper is close to
> invisible. If you reach for `difference` again, check what stacking
> context the blended element is actually inside.

> **The native cursor is hidden by a class JS adds to `<html>`**, never by
> the stylesheet alone. If the script fails you keep the system cursor
> instead of losing the pointer entirely.

> **Only genuinely clickable things get the interactive state.** The
> calendar rows were briefly in that selector and shouldn't have been —
> they're announced-only, and a cursor promising a click on something inert
> is worse than no cue. Their own fill-wipe already says the row is alive.

Position is lerped, so the mark trails the pointer slightly — that lag is
what makes it feel like an object being carried rather than a graphic
pinned to the mouse. The loop parks itself when the pointer settles.

> Browsers stop servicing `requestAnimationFrame` in a backgrounded tab,
> which leaves the loop parked with its "running" flag set and a frame that
> will never arrive — so the cursor stays frozen even after you return. A
> `visibilitychange` handler clears the flag on re-show so the next pointer
> move can re-arm it.

Suppressed entirely on `(pointer: coarse)`; under `prefers-reduced-motion`
the cursor stays but the lerp and the lean are dropped.

---

## Components

Two navigation components, doing different jobs so neither has to do both:

**The header and the dock** share one treatment — translucent over a
blurred backdrop, white contents — so the two fixed elements read as a
single layer floating above the page rather than two kinds of chrome.

**The dock** (`.dock`) — a floating capsule, bottom-centre.

> The backdrop filter includes `saturate(0)`, which desaturates what's
> *behind* the bar before the grey tint lands on it. Without it the butter
> panel bleeds through and the whole capsule turns olive. This keeps it
> neutral over paper, butter and photography alike while staying genuinely
> see-through.

It carries Section links
with a single sliding indicator: JS writes `--ind-x` and `--ind-w` from the
active link's box, so one element *travels* between items rather than four
backgrounds cross-fading. The ticket CTA is an attached but separate
capsule — navigating and acting shouldn't look identical.

**The readout** (`.readout`) — top-right. Reports the section name as you
scroll. It names your position rather than offering to change it, which is
what lets the dock stay to four short words.

Both are views of one piece of state and are driven from one function, so
they cannot disagree.

**`.subhead`** is one step down from `.sec__title`, for the parts of a
section that are their own thing rather than the section itself — the
ticket offer, and the full event list under the calendar. Shared between
the two so they cannot drift apart.

**The ticket** (`.ticket`) is the Upcoming CTA, built in three parts like
the real object: a **rail** carrying the poster, a **body** carrying the
booking (event name, particulars), and a tear-off **stub** with a barcode
and a serial. The perforation is drawn as actual round holes rather than a
dashed rule, and the notches are cut as real holes via `mask-composite` so
the butter panel shows through them. Hover fills it red.

> It is **filled, not outlined**, and that isn't a style choice. A masked
> notch cuts the fill *and* the border, and a border can't trace the curve
> it was cut with — it just stops, which read as a broken box rather than
> a punched ticket. Solid fill has nothing to break.

**The rail carries the poster at the series 2:3 trim**, so the ticket shows
the object it admits you to rather than the mark you have already seen five
times on that screen. Its width is *derived*, not typed: the rail stretches
to the ticket's height and `aspect-ratio: 2/3` gives it its width, so the
artwork is never cropped and there is no number here to keep in sync with
the poster sheet above.

**The ticket and the prices size each other.** `.buy` is a flex row with
`align-items: stretch`, so the two are always exactly level — and because
the prices are the taller of the two, *their* leading is what sets the
ticket's proportions and therefore the rail's width. Shorten a price row
and the ticket gets shorter with it.

> The row wraps by **measurement, not breakpoint**. `.next__side` is 6 of
> 12 columns on a large screen and 12 of 12 on a small one, so a viewport
> query would be asking about the wrong box entirely — a 620px phone in
> landscape has a *wider* column than a 1024px laptop. The flex bases
> (`288px` / `146px`) are tuned against the narrowest column the row
> actually lands in, which is ~469px at 1024. Prices drop underneath below
> that, which is the mobile case.

A butter-coloured raking highlight sweeps the sheet as the fill turns red,
and keeps sweeping while the pointer stays. It leaves the mark immediately,
overshoots the far edge and rocks back once; the bounce is the pull-back
keyframe at 62%, not an easing curve, which is what reads as spring rather
than lag. The red is front-loaded too — most of the way in within about a
tenth of a second, so the ticket answers the pointer instead of easing
toward it. The notch mask clips the light, so it never spills past the trim.

**Arriving at the ticket.** Both ticket links target `#tickets`, and that
anchor scrolls differently from every other: it parks the **foot of the
butter panel on the foot of the viewport**, so the whole offer — ticket,
prices, terms — arrives in one frame instead of at the top of a section you
then have to scroll through.

On arrival the ticket takes a single **butter** pass and stays black. The
red fill belongs to hover, where it answers a pointer; firing it on arrival
made the ticket look pressed by something the visitor never did. A light
passing over it reads as "look here" without claiming an interaction
happened — and butter rather than white makes it read as the panel's own
light, the same gesture as the hover sweep at a different intensity.

> Smooth scrolling has no completion callback, so arrival is detected by
> watching the page go still. That check has to distinguish "hasn't started
> moving yet" from "arrived" — smooth scroll takes several frames to start,
> and without that distinction the flash fires before the scroll does.

### The season calendar

`.months` is generated by `initCalendar()` from **one array** — `SEASON` at
the top of `app.js`. Add a crawl there and its month appears, correctly
aligned, with the square marked, the sticker applied and the link wired.
No dates are typed into the markup and no day-of-week is worked out by hand.

```js
{ date: '2026-10-31', name: 'Haunted Bar Hop', mark: 'bats', href: '#next' }
```

`mark` names the sticker *and* the cursor art — they are the same file
(`assets/cur-<mark>.png`), so the calendar and the pointer can never
disagree about which crawl a square belongs to.

**Only months that carry a crawl are printed** — three, not eighteen.
Three events across a season means printing roughly five hundred empty
squares to mark three of them, and empty squares are exactly what a
three-event calendar has too many of.

> Dates are parsed by **splitting the ISO string**, and every calculation
> runs in UTC. `new Date('2026-10-31')` is parsed as UTC and then read back
> in local time, which lands the whole season one day early for anyone west
> of Greenwich.

**Horizontal rules between weeks, and nowhere else.** A fully ruled grid
turns every day into a box, which is the one thing rule 3 forbids. What
makes it read as a calendar is the alignment, not the cage.

Marked days are ink-filled squares with the numeral in Shrikhand, red on
hover, and the sticker rotated over the corner so it overhangs the square —
pinned rather than set. `.d--today` is a **ring, never a fill**: the fill
can only ever mean "a crawl is here". Months lay out by track width
(`repeat(auto-fill, minmax(240px, 1fr))`), so three-up, two-up and one-up
happen on their own with no breakpoint to maintain.

The list underneath is headed **All events** and carries all three crawls in
order. Those rows are deliberately inert — announcements, not links; the
only crawl with something to sell has a whole section of its own above, and
the state chip (`On sale` in red, `Coming soon` in ink) is the only thing
that separates them.

### The weather

The Upcoming panel gets lightning: two strikes every 5.5s, the second 400ms
after the first. Each strike is a **pair** — a bolt and a wash anchored on
that bolt's head — and the pair shares one `animation-delay`, so the two
halves can never drift apart.

Bolts are drawn as **strokes**, with `vector-effect="non-scaling-stroke"`,
so the weight stays constant however the drawing is scaled: the page's own
hairline language bent into a bolt rather than a filled cartoon. A leans
right and short; B leans left, runs long, and reaches roughly to the top of
the poster.

> **The bolt leads and the sky follows, and that order is load-bearing.**
> White is the ceiling on butter — only the blue channel moves — so a white
> bolt is legible only while the ground under it is still yellow. Firing
> the wash *with* the bolt makes the wash win: the second strike was
> rendering at full opacity, in the right place, and was completely
> invisible. So the wash is held at zero through the bolt's first hit,
> blooms once the bolt has dimmed, clears out of the way of the second hit,
> then blooms again as the bolt leaves. It is also the more truthful
> sequence — you see the strike, then the sky catches up.

The bolt steps between values (`steps(1, end)` — a flash has no in-between);
the wash eases. Only opacity animates, and nothing runs at all until the
panel is on screen: `initStorm()` toggles `.is-live` from an
IntersectionObserver, which keeps the work off the main thread while you
are elsewhere *and* guarantees the first strike lands about a second after
you arrive rather than partway through a cycle you never saw.

> `will-change` is scoped to `.is-live` too. The washes are `inset: 0` on a
> panel over 1600px tall, so promoting all four for the life of the page
> holds four full-panel compositor layers open for a section you are
> usually nowhere near.

### Sticky hover

Every **animated** hover state sits inside
`@media (hover: hover) and (pointer: fine)`.

> A tap leaves `:hover` applied on touch until you tap something else. The
> dock's ticket CTA runs an *infinite* animation on hover, so tapping it on
> a phone left the button cycling forever and looking broken. Gating the
> rule means it does not exist on hardware that cannot un-hover — there is
> nothing left to get stuck. `:focus-visible` keeps the same behaviour for
> keyboard users, outside the guard.

Static colour hovers are deliberately left ungated: a sticky colour change
reads as a selected state, not a fault.

**The hero** is full-bleed media with the site's own furniture laid over
it — hairline rule, tracked caption labels, the same page margin as every
other section. That's what stops it reading as a stock photo hero: it's a
plate with the grid printed on top of it.

The headline sits bottom-left at every size. Stacked, it *is* the
composition; from 1100px up it drops to **a single line along the foot**,
so the footage gets the frame and the words become a caption on it.

> Sizing that line is measured, not guessed. The sentence runs **17.37px
> of width per 1px of font-size** against a frame ~93% of the viewport,
> which makes 5.37vw the exact fitting size; it's set at 5.1vw so a
> rounding difference can't tip it onto a second line.
>
> The `h1` also needs `width: 100%`. It's a flex item, so without it the
> element shrinks to its own content — which makes the width it wraps
> against narrower than the frame, and every size calibrated from it comes
> out a line too big.

The scrim is **two gradients, not one** — a light directional wash to hold
the type, plus a deeper foot so the caption rule always has something to
sit on. A single heavy scrim just made the photograph muddy.

> **Built for video.** `.hero__media` is the only thing that changes when
> a reel replaces the still; nothing above it cares.

It carries no effects. An earlier pass had a cursor lens, a parallax cherry
field, a radial blur that cleared under the pointer, and a cherry standing
in for the full stop; all four were built and then cut. The media is doing
the work now.

> The poster deliberately uses a **different crop of the same photograph**
> — and it has to be sized past `cover` to get one. With `cover` on a 2:3
> box from a 3:2 source the height exactly fills, so the vertical position
> does nothing and only the horizontal crop moves, which left the poster
> showing the same whole room as the hero. `background-size: auto 138%`
> frees both axes.

**The release chip** (`.tstat`) derives its stage from the remaining
allocation rather than a typed-in label, so the chip can never disagree
with the number beside it:

| Remaining | Stage |
|---|---|
| more than 800 | Register |
| 800 or fewer | Going fast |
| 300 or fewer | Last chance |
| 0 | Sold out |

Change `data-remaining` on the element and everything follows. It's the
only thing on the page reporting a live condition, which is why it gets to
spend red.

**The event poster** (`.poster`) is a 2:3 sheet, the same trim every crawl
will use, so a wall of them reads as one campaign rather than a set of
unrelated flyers. Artwork under a scrim, type printed over the foot of it,
cherry top-left, and a caption naming the trim.

> ⚠ **The current artwork is third-party placeholder.**
> `assets/poster-halloween.jpg` is *Halloween Bang!*, design by Jeremy
> Wheeler, © 2012 Bang! Media, LLC — the credit is visible in the sheet's
> left margin. It is **not licensed for use here** and must be replaced
> before this is anything but an internal comp. The site is publicly
> deployed, so this matters.
>
> It's also a *finished* poster, which the slot isn't built for: it carries
> its own title, date and venue ("Oct. 27th / The Blind Pig"), and our
> overlay prints a contradicting date and venue directly beneath it. The
> overlay is correct for real artwork; it's only wrong against this
> particular stand-in. To hide it while the placeholder is up, drop
> `.poster__type` and `.poster__cherry` to `display:none`.

**Coming-soon rows** (`.cal`) use outline type — drawn but not filled in —
on dashed rules, with a slowly pulsing dot. Hover wipes the solid copy
across via `clip-path`. Inert, but it responds.

---

## Motion

One idea, applied uniformly: content lifts 14px and fades in
(`.rv` → `.rv.in`), staggered within a group but never across groups. The
only things that move beyond that are the sliding nav indicator, the hover
states, and the weather over the Upcoming panel.

There is no scroll hijack. The nav is a rAF-throttled scroll listener
reading a handful of rects; the cursor runs a short lerp loop that parks
itself when the pointer settles; everything else is IntersectionObserver.
Restraint in the motion is part of the same argument as restraint in the
colour.

**Under `prefers-reduced-motion` the weather is removed outright** —
`.storm { display: none }` — and every animation is capped at one
iteration.

> The usual blanket `animation-duration: .001ms !important` *stops* a
> one-shot but makes an **infinite** animation run thousands of cycles per
> frame: it samples an arbitrary value each repaint and flickers, which is
> the opposite of what was asked for. Capping the iteration count fixes it
> generally, and the two infinite pulses (`.tstat__dot`, `.cal__state i`)
> are additionally given an explicit resting state rather than whatever
> their last keyframe happens to be.

Nav labels flip on hover: `app.js` builds each `[data-flip]` label into a
**three**-slot stack inside a 1em window. Section links flip once and
settle; only the ticket CTA keeps cycling, because it's the one thing on
the bar asking to be clicked.

> Three slots, not two. The animation ends on slot 3 — identical to slot 1 —
> so the restart is invisible and the cycle can repeat for as long as the
> pointer stays. Two slots can only ever run the transition once.
>
> The window and the slots are **1.65em, not 1em**. At exactly the em
> square the descender on the 'g' in "Upcoming" hung below the box and the
> neighbouring copy's ascenders showed through the top — visible as clipped
> slivers above and below the word. Both share one `--slot` variable so a
> 100% translate still steps exactly one slot.

`data-flip="barcode"` (the dock's ticket CTA) swaps the middle slot for a
barcode cut to the word's own footprint, so **Tickets** morphs into a strip
of code and back without the capsule changing width. The stack is
`aria-hidden` with the real text on the link's `aria-label`, so the word
never reaches the accessibility tree three times.

> **The active section is the last one whose top has passed the line**, not
> the one crossing it. A crossing test has no answer once you scroll past
> the final section's band — which left the nav blank and the readout empty
> at the bottom of the page.

**Anchors measure with `offsetTop`, not `getBoundingClientRect()`.**

> A rect includes transforms, and every reveal target sits translated 14px
> down until it animates in — so an anchor pointing at one lands short and
> parks its target under the fixed bar. `offsetTop` and `offsetHeight`
> ignore transforms, so the landing is identical whether or not the target
> has revealed yet. This only surfaced when the calendar squares started
> linking straight at the event rows, which *are* reveal targets. Every
> target now lands at exactly 76px: the 68px bar plus 8px of air.

---

---

## Assets

The logos ship as SVG with `fill="currentColor"`, used as CSS masks so one
file serves any colour the design needs.

```
assets/cherry.svg              cherry mark      (mask, currentColor)
assets/wordmark.svg            wordmark         (mask, currentColor)
assets/lockup-stacked.svg      stacked lockup   — <img>, keeps its own two colours
assets/lockup-full-color.svg   original lockup  — reference, unused
assets/crowd.jpg               the one photograph
assets/poster-halloween.jpg    poster artwork   — sheet AND ticket rail
assets/cur-bats.png            event mark       — cursor + calendar sticker
assets/cur-candy-cane.png      event mark       — cursor + calendar sticker
assets/cur-clover.png          event mark       — cursor + calendar sticker
_brand-source/                 the six SVGs as delivered
```

The stacked lockup is used as an `<img>` in the age gate and the footer,
not as a mask — a mask would flatten the ink wordmark and the red cherry
into a single colour.

## Content notes

The Upcoming copy came from the client as a long "what you get" list. It was
cut to nine lines, ordered by what actually sells a ticket:

- **Kept and reordered** — no cover, drink specials, the flashing pin,
  the bingo card, costume prizes, daytime DJs, the afterparty,
  photographers, and route/check-in folded into one line.
- **Cut** — *"100's of crawler friends"* (says nothing a photograph
  doesn't say better), and the charity donation, which History already
  carries as a hard number rather than a bullet.
- **Promoted out of the list** — *"only Halloween crawl on Brady Street"*
  is the differentiator, so it's the lead line under the event name, not
  the first of nine bullets.

The event is **Haunted Bar Hop** and the route is **Brady Street**, both
per the new brief. The **16 bars** figure is carried over from the previous
copy — the new brief says "map to participating bars" without a count, so
it is unconfirmed.

## Focus

The site hides the native cursor and its header, dock and ticket are all
dark surfaces, so the UA default focus ring was easy to lose.
`:focus-visible` draws a 2px `currentColor` outline at 3px offset.

**`currentColor` is the right default only where the element's own text
already contrasts with the page**, and three places on this site carry
*light* text on a dark fill — the age gate's primary button, the ticket,
and the calendar's marked days. Each inherited a light outline that then
landed on the pale ground around it and disappeared. All three are named
explicitly and forced to ink; the header and dock, which sit on dark
chrome, are forced to white. If you add another dark object on a pale
ground, it needs the same treatment.

The gate panel is deliberately exempt: it's `tabindex="-1"` and focused
programmatically to move a reader into the dialog, so it should not draw a
ring it never earned by tabbing.

---

## Known gaps

- Every CTA is `href="#"` with `onclick="return false;"`. No ticketing
  partner is wired; the signup posts nowhere.
- **`assets/poster-halloween.jpg` is unlicensed third-party art** —
  *Halloween Bang!*, design Jeremy Wheeler, © 2012 Bang! Media LLC. It now
  appears in two places (the poster sheet and the ticket rail) and the site
  is publicly deployed. It also carries its own printed date and venue,
  which contradict the overlay type set beneath it. Replace before this
  goes any further than a personal prototype.
- Between roughly **900px and 1005px** the prices stack under the ticket
  rather than sitting beside it, because the right-hand column is genuinely
  only ~412px wide in that band. Below 900 the column is full-width and
  they sit beside again. Correct per container, counter-intuitive per
  viewport.
- The background reel was removed when the media panel became a printed
  poster — a 2:3 sheet and an autoplaying video are different objects. The
  YouTube video that was specified for it (`1vJ1RFoitRw`) is age-restricted
  and cannot embed anywhere regardless, so nothing working was lost.
- `python3 -m http.server` sends no cache headers. If an edit doesn't show,
  hard-reload or append `?v=2` — CSS and JS cache separately from the HTML.
- `_dev-viewport.html` is a local harness that iframes the site at a fixed
  size, because the in-app browser pane won't shrink below ~617px. Not part
  of the site, and not deployed.
- The in-app browser pane intermittently stops servicing
  `requestAnimationFrame`. When it does, `scroll-behavior: smooth` and CSS
  animations stop with it — same frame loop — even though instant
  `scrollTop` assignment still works. Click-scroll-animate chains can't be
  verified in that state; probe the CSSOM instead and retest when frames
  are alive.
