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

A 12-column grid (`.grid`) with a fluid page margin (`--m`) and gutter
(`--gap`). Headlines run large and tight (`-.045em`); the small tracked
uppercase labels (`+.1em`) are the counterweight that lets them.

| | |
|---|---|
| Age gate | 21+ self-declaration, shown once per session |
| Hero | The headline, and nothing else |
| N.001 · Upcoming | Halloween — butter panel, spec table, countdown, ticket |
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

**The dock** (`.dock`) — a floating capsule, bottom-centre, translucent
over a blurred backdrop.

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

**The ticket** (`.ticket`) is the N.001 CTA: a stub, a dashed perforation
and a barcode, with the notches cut as real holes via `mask-composite`
so the butter panel shows through them. Hover fills it red.

> It is **filled, not outlined**, and that isn't a style choice. A masked
> notch cuts the fill *and* the border, and a border can't trace the curve
> it was cut with — it just stops, which read as a broken box rather than
> a punched ticket. Solid fill has nothing to break.

The cherry runs full-height down the left edge — it sets the ticket's
height, which is what widens the whole object.

A butter-coloured raking highlight sweeps the sheet as the fill turns red,
and keeps sweeping while the pointer stays. It creeps in, sweeps,
overshoots the far edge and rocks back once before leaving; the bounce is
the pull-back keyframe at 74%, not an easing curve. The ticket's own notch
mask clips it, so the light never spills past the trim.

**The cherry as a full stop** (`.cherrydot`) ends the hero headline in
place of the period, running the full height of the line it sits on. It's
an inline element sized in `em` against the headline and set to
`vertical-align: baseline`, so its bottom edge lands on the baseline and
both scale and position hold at every width — no media query, nothing to
re-tune per breakpoint.

**Smoke** (`.h1__blur` / `.h1__sharp`) is the hero's only effect: the
headline exists twice, blurred behind and sharp on top, with the sharp
copy masked by two radial stops that are *unioned* — one fixed at the
centre of the block, one following the pointer. So the middle always reads
clean, the edges sit out of focus, and moving across them clears them like
a hand through smoke. The pointer position is lerped, so it drifts shut
behind you.

> The blur copy must **replicate** the headline's 12 columns, not inherit
> them with `subgrid`. It's absolutely positioned, so it isn't a grid
> item, and subgrid on a non-item resolves against its own box — which
> gave it different column widths, different line breaks, and a visibly
> doubled headline.

The three headline lines are **placed** on that grid rather than stacked:
two left, one pushed to the right edge, so the eye walks across the block
instead of straight down. Below 900px they all return to full width.

**The event poster** (`.poster`) is a 2:3 sheet, the same trim every crawl
will use, so a wall of them reads as one campaign rather than a set of
unrelated flyers. Photo greyscaled, type printed over the foot of it, cherry
top-left, and a caption naming the trim.

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
