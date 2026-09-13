# IB Platform — Design Guide

How to build screens that look like they belong to this platform, in any
product, on any stack.

`design-system/tokens.css` is the machine-readable half — drop it in and
reference the variables. This document is the half that tells you *why*, because
a token file can't stop you from using six shades of grey or right-aligning a
date.

---

## The five rules everything else follows

1. **Money is the loudest thing on screen.** The largest type on any page is a
   figure, not a heading. Headings are 27px; the hero figure is 52px.
2. **One accent, used only for interaction.** Blue means *you can act here* —
   links, focus, selection, the active nav item. It is never decorative.
   Green means *value went up*. Nothing else is coloured.
3. **Dark surfaces are earned.** The forest gradient is expensive attention.
   One per screen, at the top, showing the number that matters. A page with two
   gradients has none.
4. **Numbers are mono, tabular, and right-aligned. Dates are not.** This single
   rule does more for perceived quality than any amount of polish.
5. **Depth comes from stacked shadows and inset highlights, never from borders.**
   A 1px contact shadow keeps the edge crisp; a wide diffuse shadow lifts it.

---

## Colour

### The palette is small on purpose

| Role | Token | Value |
|---|---|---|
| Page background | `--bg` | `#F1F3F7` |
| Card surface | `--surface` | `#FFFFFF` |
| Border | `--line` | `#E8EBF1` |
| Internal divider | `--line-soft` | `#F2F4F8` |
| Sunken / read-only | `--sunken` | `#F6F8FB` |
| Text primary | `--ink` | `#0B1016` |
| Text secondary | `--ink-2` | `#5F6B7C` |
| Text tertiary | `--ink-3` | `#94A0B0` |
| Interaction | `--accent` | `#3B5BFE` |
| Positive | `--positive` | `#18884D` |
| Warning | `--warning` | `#A96D12` |
| Negative | `--negative` | `#E5484D` |

**Three ink steps, and three is enough.** Primary for content, secondary for
labels, tertiary for captions and units. If you reach for a fourth, the
hierarchy is wrong, not the palette.

**Two greys for lines, and the distinction matters.** `--line` separates
things that are genuinely separate (a card from the page, a table header from
its body). `--line-soft` divides rows *within* one thing. Using the strong
line for internal dividers is the single most common way to make a dense screen
look cheap.

### Status colour is never bare

Status colour always appears as **tinted background + darker text**, never as
coloured text on white:

```css
.positive { background: rgba(47,191,113,.1);  color: #18884D; }
.warning  { background: rgba(233,162,59,.13); color: #A96D12; }
.negative { background: rgba(229,72,77,.09);  color: #E5484D; }
.info     { background: rgba(59,91,254,.09);  color: #3B5BFE; }
```

The tint is 9–13% alpha of the same hue. The text is a darkened version of it,
chosen to clear 4.5:1 on the tint.

### On dark surfaces, everything is white at an alpha

Never introduce a grey. The ramp is:

```
Headline        #fff
Body            rgba(255,255,255,.55)
Secondary       rgba(255,255,255,.45)
Micro-label     rgba(255,255,255,.42)
Divider         rgba(255,255,255,.09)
Glass fill      rgba(255,255,255,.07)
```

---

## Type

Two families, and the split is semantic, not aesthetic:

- **Plus Jakarta Sans** — anything a human wrote.
- **JetBrains Mono** — anything countable: money, quantities, IDs, dates in
  tables, codes, timestamps.

Never use mono for prose, and never let a figure fall back to the sans.

### The scale, and the tracking that goes with it

The house rule: **the bigger it sets, the tighter it tracks.** Uppercase
micro-labels invert this and track wide.

| Use | Size | Weight | Tracking |
|---|---|---|---|
| Hero figure | 52px | 800 | −0.05em |
| Page title | 27px | 800 | −0.04em |
| Section / modal title | 22px | 800 | −0.035em |
| Card title | 15.5px | 700 | −0.015em |
| Body | 14px | 400–500 | 0 |
| Secondary | 13px | 400 | 0 |
| Caption | 12px | 500 | 0 |
| **Eyebrow / stat label** | **10–10.5px** | **700** | **+0.15em, uppercase** |
| **Table header** | **10px** | **700** | **+0.14em, uppercase** |

The eyebrow is the system's signature: a 10px, 700-weight, wide-tracked
uppercase label above a large figure or title. It appears above every page
title, every stat, every modal heading.

---

## Space, radii and elevation

### Spacing is a 4px grid

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40`. Card padding is `22px 24px`; card headers
are `20px 24px`; table cells are `0 22px` with a fixed row height.

### Radii nest downward

```
hero    24px
modal   26px
card    18px
inset   14px   (a panel inside a card)
field   12px
control 11px   (buttons, selects)
small    9px   (small buttons, icon tiles)
pill    999px
```

**A control inside a card always has a smaller radius than the card.** An 11px
button in an 18px card reads correctly; the reverse looks broken.

### Two shadows, both two-part

```css
--shadow:      0 1px 1px rgba(11,16,22,.03), 0 8px 24px -18px rgba(11,16,22,.28);
--shadow-lift: 0 1px 2px rgba(11,16,22,.04), 0 22px 44px -28px rgba(11,16,22,.4);
```

The 1px contact shadow is not optional — it's what keeps the card edge crisp
against the background. The wide shadow has a large negative spread so it reads
as ambient occlusion rather than a drop shadow.

Tracks, wells and progress bars take an **inset** shadow instead:
`inset 0 1px 2px rgba(11,16,22,.14)`.

---

## Component recipes

### Button

One height, three variants. The default is quiet; `dark` is the commit action.

```css
.btn{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  height:38px; padding:0 15px; border-radius:11px;
  font-weight:600; font-size:13px; white-space:nowrap;
  border:1px solid var(--line); background:var(--surface);
  transition:.15s;
}
.btn svg{ width:16px; height:16px; flex:none }
.btn-dark{ background:var(--navy); color:#fff; border-color:var(--navy);
           box-shadow:0 6px 16px -10px rgba(17,24,39,.9) }
.btn-sm{ height:32px; padding:0 12px; font-size:12.5px; border-radius:9px }
```

At most **one** dark button per view. If two things look equally important,
one of them isn't.

### Card

```css
.card{ background:var(--surface); border:1px solid var(--line);
       border-radius:18px; box-shadow:var(--shadow) }
.card-head{ display:flex; align-items:center; justify-content:space-between;
            gap:14px; padding:20px 24px; border-bottom:1px solid var(--line-soft);
            flex-wrap:wrap }
.card-title{ font-size:15.5px; font-weight:700; letter-spacing:-.015em }
.card-sub{ color:var(--ink-3); font-size:12px; margin-top:3px }
```

The card header holds a title, an optional sub, and actions on the right. The
sub is where you put the qualifier that stops the numbers below being
ambiguous — *"Last 30 days · $12,940.60 across 31 active traders"*.

### The chip language

Four shapes, one grammar. All share `border-radius:999px`, `font-size:11px`,
`font-weight:700`, `padding:6px 10px`.

| Shape | Use | Distinguishing mark |
|---|---|---|
| `chip` | row status | 5px dot in `currentColor` before the label |
| `flag` | lifecycle state | uppercase, `letter-spacing:.08em` |
| `pill` | a delta on a dark surface | mint tint + 1px mint border |
| `met` | a cleared threshold | check icon, no background |

Do not invent a fifth. If a new state appears, it takes an existing shape.

### Forms

Inputs are **taller than buttons** — 48px vs 38px — because they receive input.
Resting state is sunken (`--sunken`), focus lifts to white with a 3px accent
ring:

```css
.input{ height:48px; border:1px solid var(--line); border-radius:12px;
        background:var(--sunken); padding:0 14px; font-size:14px }
.input:focus{ border-color:var(--accent); background:var(--surface);
              box-shadow:0 0 0 3px rgba(59,91,254,.12) }
.input.invalid{ border-color:var(--rose); background:#FFF7F7 }
```

**Show errors only after a field is touched or the form is submitted.** A form
that turns red while you type is hostile.

---

## Patterns

### The hero

One per page, at the top, dark. Structure, in order:

```
eyebrow  →  the figure  →  a delta pill  →  supporting facts
         →  actions  →  a divider  →  a row of stats
```

The right column carries a single visual — a progress dial, a medallion. On
mobile it is replaced by a compact row, not hidden: the information survives,
the ornament doesn't.

### Tables become lists, not scrollbars

Under 900px a data table stops being a table and becomes a two-line row. Declare
each column's mobile role once:

```
primary    top-left      (who or what)
secondary  bottom-left   (qualifier)
value      top-right     (the number)
status     bottom-right  (the state)
```

Everything else is dropped. Exactly one column per role. A genuinely
two-dimensional matrix (a rate card) is the exception — it stays a matrix and
scrolls horizontally with `scroll-snap-type:x proximity`.

### Modals

Centred dialog above 900px, bottom sheet below — same component, CSS swaps the
presentation. Every dialog must handle four things: **Escape, backdrop click,
body scroll lock, and returning focus to whatever opened it.** Tab stays
trapped inside while open.

### Empty states

An empty state names the filter, not the void: *"No referrals match those
filters"*, not *"No data"*. If an action would fix it, offer it.

---

## Motion

Nothing exceeds 300ms. Two easings:

- `cubic-bezier(.4,0,.2,1)` — travel and fades
- `cubic-bezier(.34,1.3,.5,1)` — anything that should feel physical (sheets,
  medallions, hover lifts). The overshoot is the point.

Page transitions are a 240ms fade plus a 7px rise. Hover lifts are 4px maximum.
Everything collapses under `prefers-reduced-motion` — that rule is already in
the token file and is not optional.

---

## Responsive: one breakpoint

**900px.** Not three, not five. Above it, desktop. Below it, the product behaves
like an app: bottom tab bar, safe-area insets, 44px minimum tap targets,
`:active` scale feedback instead of hover.

```css
@media(max-width:900px){
  .btn:active{ transform:scale(.97) }
  .btn{ -webkit-user-select:none; user-select:none }
}
```

Use `env(safe-area-inset-*)` on anything fixed to an edge, and keep
`viewport-fit=cover` in the viewport meta or those insets resolve to zero.

A second breakpoint is allowed only where content genuinely reflows (a
two-panel auth screen collapses at 980px). Never add one for spacing.

---

## Numbers, money and dates

These are house rules, not preferences. They are what make a financial product
read as trustworthy.

- **Store money as integer minor units.** Divide once, at the render edge.
  Floating-point currency is how ledgers end up off by a penny.
- **Format in one place.** One module owns every number that reaches the
  screen; components never call `toLocaleString` themselves.
- **Right-align quantities. Left-align dates.** Dates are read, not compared.
- **Use tabular figures everywhere** so digits don't shift as values update.
- **Use a real minus sign** (`−`, U+2212) for negatives, not a hyphen.
- **Percentages carry one decimal** (`64.6%`); progress readouts round to whole
  (`61%`).
- **Whole-dollar stat figures truncate**, they don't round: a $12,940.60 balance
  displays as `$12,940`.

---

## Accessibility

- One focus style platform-wide: `2px solid var(--accent)`, `2px` offset.
  Never remove it; restyle it if you must.
- Icon-only controls need `aria-label`. Toggles use `role="switch"` and
  `aria-checked`, not a styled checkbox.
- Status must never be colour alone — the chip's dot, the flag's text and the
  check icon all carry the meaning independently.
- Body text is 14px minimum. 10px is reserved for uppercase, 700-weight,
  wide-tracked labels, where it stays legible.

---

## Porting this to a new product

1. **Copy `design-system/tokens.css` unchanged.** Do not fork the brand layer.
2. **Load both fonts.** The system falls apart without the mono.
3. **Retune only Layer 3** — density: row heights, control heights, page
   measure. Colour, radii and shadows stay.
4. **Rebuild components from the recipes above**, in whatever framework you
   use. The CSS is plain; nothing here needs React.
5. **Adopt the number rules on day one.** They are painful to retrofit.

For non-web surfaces (native, email, print), the values transfer directly —
they are plain hex, px and cubic-béziers. The forest gradient, the eyebrow
label, the mono numerals and the chip language are what carry the identity.

---

## What not to do

- Don't introduce a fourth ink step or a second accent.
- Don't put two dark gradient surfaces on one screen.
- Don't use `--line` for dividers inside a card.
- Don't colour text without a background tint for status.
- Don't let a control's radius exceed its container's.
- Don't right-align dates or left-align money.
- Don't add a breakpoint to fix spacing.
- Don't animate anything past 300ms.
- Don't hardcode a hex value that already exists as a token.
