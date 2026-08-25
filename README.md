# Bar Scene Socials

A Milwaukee bar-crawl site. Paper, ink, and three colours with one job each.

Raw HTML/CSS/JS, no build step. Three files.

```bash
open http://localhost:5178
```

Served by the `bar-scene-socials-v2` entry in `.claude/launch.json`
(`python3 -m http.server 5178`).

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

Three colours, each with one job. Nothing else on the page is coloured.

| | |
|---|---|
| **Red** `#CE1919` | The brand speaking, and the transaction. Brand: the cherry (lockup + hero field), the two Shrikhand words in the headline. Transaction: the nav dot, the countdown, the ticket, the dock CTA. |
| **Butter** `#FFFFA7` | The N.001 panel. One section, edge to edge, nowhere else. |
| **Volt** `#009B3E` | The amount returned to the city. One figure, forever. |

Everything else is `--paper` `#EFECE7`, `--ink` `#111`, and three
opacities of ink for secondary text and hairlines. Before adding a fourth
colour — or a red that isn't brand or transaction — check whether an
existing one already carries the idea.

> Volt was specified as "electric green". `#00C24E` is the electric
> version but measures **2.02:1** on paper, under the 3:1 large-text
> minimum. `#009B3E` is **3.10:1** and still reads as voltage. Swap the
> `--volt` token if the brighter one is worth the trade.

### 2. Shrikhand appears in one place

The brand face is set on **"Milwaukee's"** in the hero headline — `<b>`
inside `.hero__h1` — and nowhere else as live text. Wrap a word in `<b>`
and it takes the brand face; that's the whole mechanism.

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
tables), `.figs` (large figures) — plus `.rows` and `.cal` as variants.
Hairlines, not boxes, do the organising. There is no card, no panel with a
background, and no shadow anywhere.

---

## Layout

**N.001's head is split on the same columns as its body.** The event name
takes `1 / span 5` and the pitch plus the ticket link take `7 / -1` —
exactly the tracks the poster and the detail rail use underneath, so the
head sits *on* the structure it introduces rather than near it. The other
three heads have nothing to put on the right and stay full-width.

> The rule above each section title is its own element (`.sec__rule`),
> not a `border-top` on the title. A border only spans the full grid while
> the title does; once N.001's title narrowed to five columns it would
> have dragged the section divider in with it.

A 12-column grid (`.grid`) with a fluid page margin (`--m`) and gutter
(`--gap`). Headlines run large and tight (`-.045em`); the small tracked
uppercase labels (`+.1em`) are the counterweight that lets them.

| | |
|---|---|
| Age gate | 21+ self-declaration, shown once per session |
| Hero | Full-bleed photograph, headline set in the bottom-left corner |
| N.001 · Upcoming | Haunted Bar Hop — butter panel, facts, poster, ticket |
| N.002 · Calendar | The two announced crawls, one hairline row each |
| N.003 · History | Figures, and the amount returned to the city |
| N.004 · Contact | Addresses and a ticket-drop signup |
| Footer | The stacked lockup and colophon |

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

**The readout** (`.readout`) — top-right. Reports `N.001 / NEXT` as you
scroll. It names your position rather than offering to change it, which is
what lets the dock stay to four short words.

Both are views of one piece of state and are driven from one function, so
they cannot disagree.

**Buttons** (`.btn`) are squared with a hairline border, the fill wiping up
from the bottom and the arrow stepping diagonally on hover. Deliberately
unlike the nav capsules: **rounded = navigate, squared = act.**

**The ticket** (`.ticket`) is the N.001 CTA, built in three parts like the
real object: a **rail** carrying the mark, a **body** carrying the booking
(eyebrow, event name, particulars), and a tear-off **stub** with a barcode
and a serial. The perforation is drawn as actual round holes rather than a
dashed rule, and the notches are cut as real holes via `mask-composite` so
the butter panel shows through them. Hover fills it red.

> It is **filled, not outlined**, and that isn't a style choice. A masked
> notch cuts the fill *and* the border, and a border can't trace the curve
> it was cut with — it just stops, which read as a broken box rather than
> a punched ticket. Solid fill has nothing to break.

The cherry runs full-height down the left edge — it sets the ticket's
height, which is what widens the whole object.

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
then have to scroll through. On arrival the ticket runs its hover state
once. Same fill, same sweep, so the cue that draws the eye and the
affordance that invites the click are one gesture rather than two ideas.

> Smooth scrolling has no completion callback, so arrival is detected by
> watching the page go still. That check has to distinguish "hasn't started
> moving yet" from "arrived" — smooth scroll takes several frames to start,
> and without that distinction the flash fires before the scroll does.

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
(`.rv` → `.rv.in`), staggered within a group but never across groups.
Nothing else moves except the sliding nav indicator and the button hovers.

There is no scroll hijack. The nav is a rAF-throttled scroll listener
reading five rects; the cherry field runs a short lerp loop only while the
hero is on screen; everything else is IntersectionObserver. Restraint in
the motion is part of the same argument as restraint in the colour.

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
> the final section's band — which left the nav blank and the readout back
> at `N.000` at the bottom of the page.

---

---

## Assets

The logos ship as SVG with `fill="currentColor"`, used as CSS masks so one
file serves any colour the design needs.

```
assets/cherry.svg              cherry mark      (mask, currentColor)
assets/wordmark.svg            wordmark         (mask, currentColor)
assets/lockup-full-color.svg   original lockup  — reference, unused
assets/crowd.jpg               the one photograph
_brand-source/                 the six SVGs as delivered
```

## Content notes

The N.001 copy came from the client as a long "what you get" list. It was
cut to nine lines, ordered by what actually sells a ticket:

- **Kept and reordered** — no cover, drink specials, the flashing pin,
  the bingo card, costume prizes, daytime DJs, the afterparty,
  photographers, and route/check-in folded into one line.
- **Cut** — *"100's of crawler friends"* (says nothing a photograph
  doesn't say better), and the charity donation, which N.003 already
  carries as a hard number rather than a bullet.
- **Promoted out of the list** — *"only Halloween crawl on Brady Street"*
  is the differentiator, so it's the lead line under the event name, not
  the first of nine bullets.

The event is **Haunted Bar Hop** and the route is **Brady Street**, both
per the new brief. The **16 bars** figure is carried over from the previous
copy — the new brief says "map to participating bars" without a count, so
it is unconfirmed.

## Known gaps

- Every CTA is `href="#"` with `onclick="return false;"`. No ticketing
  partner is wired; the signup posts nowhere.
- Not deployed. The first prototype is at `bar-scene-socials.vercel.app`;
  this needs its own Vercel project.
- The background reel was removed when the media panel became a printed
  poster — a 2:3 sheet and an autoplaying video are different objects. The
  YouTube video that was specified for it (`1vJ1RFoitRw`) is age-restricted
  and cannot embed anywhere regardless, so nothing working was lost.
- `python3 -m http.server` sends no cache headers. If an edit doesn't show,
  hard-reload or append `?v=2` — CSS and JS cache separately from the HTML.
- `_dev-viewport.html` is a local harness that iframes the site at a fixed
  size, because the in-app browser pane won't shrink below ~617px. Not part
  of the site.
