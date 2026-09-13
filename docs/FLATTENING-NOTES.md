# CSS flattening notes

`ib-platform.html` carries one top-level `<style>` (lines 10–1033) made of eight
successive design passes, plus six `<style>` blocks living *inside* the medallion
`<symbol>` elements. Later rules deliberately override earlier ones. Everything
ported here keeps the **last** declaration of any duplicated property, in source
order — so the React build renders what the mockup renders, not what any single
pass says.

This file records the decisions that aren't obvious from reading either sheet,
so the phase-8 audit against the mockup has something to check against.

## The passes, in order

| # | Lines | What it does |
|---|---|---|
| 1 | 11–396 | Base system: tokens, shell, cards, tables, hero, ladder, responsive |
| 2 | 398–475 | Table + spacing rebuild — fixed row heights, aligned metric strip |
| 3 | 477–630 | Refinement — quieter cards, bigger radii, tighter type, new shadows |
| 4 | 632–701 | 3D pass — richer metals, glass dial, card material, inset bars |
| 5 | 703–724 | Commission distribution (donut + rows) |
| 6 | 726–802 | Mobile tier-mini, dist stacking, per-rung medal sizes, ascent fixes |
| 7 | 804–901 | Tier detail modal, hero facts/CTA on small screens |
| 8 | 903–1032 | Native app shell — mobile header, tab bar, list rows, More sheet |

## Token overrides (pass 3 wins)

| Token | Pass 1 | Final |
|---|---|---|
| `--bg` | `#EEF1F5` | `#F1F3F7` |
| `--line` | `#E5E8EF` | `#E8EBF1` |
| `--line-soft` | `#F1F3F7` | `#F2F4F8` |
| `--shadow` | heavier | `0 1px 1px …/.03, 0 8px 24px -18px …/.28` |
| `--shadow-lift` | heavier | `0 1px 2px …/.04, 0 22px 44px -28px …/.4` |

Tier metals `.t1`–`.t6` are entirely replaced by pass 4. Only the pass-4 values
are ported. They stay **global** (not module-scoped) because they set
`--mA/--mB/--mC/--mG` on the host `<svg>`, and the gradient stops inside each
`<symbol>` read them through the `<use>` shadow tree.

## Rules that are dead after flattening — dropped, not ported

1. **Burger button.** `.burger{display:none}` (pass 1) → `display:grid` under
   900px (pass 1) → `display:none` again under 900px (pass 8). Never visible.
2. **Sidebar drawer + `.scrim`.** Pass 1 makes `.side` a slide-in drawer under
   900px; pass 8 sets `.side,.scrim{display:none!important}` there. The mobile
   shell is the tab bar + More sheet, so the drawer, its transform transition
   and the scrim are all unreachable.
3. **Sticky first table column** (`.table-scroll td:first-child{position:sticky}`).
   Under 900px every table is `.mlist`, whose cells are `display:block` inside a
   grid row, and `.table-scroll:has(.mlist){overflow:visible}` removes the
   scroll container sticky needs. No effect.
4. **Per-page `nth-child` mobile row layout** (`#overview .mlist td:nth-child(5)`
   and friends). Replaced by `DataList`'s column-role API per the build guide.
5. **`.rc-ico`** — the coloured instrument-group badges in the rate card. Pass 3
   sets `display:none`. Not rendered.
6. **`.card-title svg`** — pass 3 hides icons in card titles. The rule is kept so
   any stray icon stays hidden; no card title renders one.
7. **`h1{font-size:23px}` under 900px** — pass 3's unconditional `27px` is later
   and wins at equal specificity. Moot anyway: `.page-head>div:first-child` is
   hidden on mobile, so the `<h1>` isn't visible there.

## Cascade results worth knowing about

These look like mistakes but are what the mockup actually renders, so they are
ported as-is. Flagging them for the phase-8 audit rather than silently
"correcting" them:

- **Ghost button hover.** `.btn-ghost:hover` (pass 1, line 107) sets a
  translucent white background, but `.btn:hover{background:#FAFBFD}` (pass 3,
  line 520) has equal specificity and comes later — so hovering **View ledger**
  on the dark hero turns it near-white, not translucent.
- **Dark button hover border.** Same mechanism: `.btn:hover{border-color:var(--line)}`
  lands after `.btn-dark:hover{border-color:#1E2739}`, so a hovered dark button
  keeps a light 1px rim.
- **Search hidden on mobile.** `@media(max-width:900px){.search{display:none}}`
  matches the topbar search *and* the Referrals toolbar search. Under 900px the
  Referrals card shows only its two selects.
- **`td{height:62px}`** (pass 3) is unconditional and lands after the mobile
  `td{height:56px}` (pass 2), so 62px applies at every width — invisible in
  practice because mobile tables become `.mlist` rows with `height:auto`.

## The tier metals don't reach the gradient stops — in the mockup either

The build guide says colour reaches the medallions through CSS custom
properties inheriting into the `<use>` shadow tree, and warns against
"simplifying" it by hardcoding stop colours. Half of that mechanism works and
half of it doesn't, and it's worth knowing which half:

- **Emblems are tinted correctly.** The star, chevron, crown and so on carry
  `fill="var(--mG,#fff)"` directly on an element inside the shadow tree, and
  those resolve against the host's `.t3`/`.t4`/… custom properties.
- **Rim, face and glow gradients fall back to their defaults** — `#bbb`, `#777`,
  `#333`, i.e. plain silver — on all six tiers. The stops say
  `stop-color="var(--mA,#bbb)"`, but the shapes reference the paint server by
  id (`fill="url(#rim3)"`), and that id resolves to the original
  `<linearGradient>` sitting in the hidden sprite at document level, outside
  any shadow tree. That gradient never sees `--mA`, so every stop takes its
  fallback.

Verified by screenshotting `ib-platform.html` and the React build side by side
in the same browser: **both render identically**, with silver metal and a
tinted emblem. So the port is faithful and nothing here needs "fixing" to match
the contract.

If the intended six-metal look is wanted later, the fix is to stop sharing one
document-level gradient per rank and instead give each rendered medallion its
own gradients — either inlined per instance instead of `<use>`, or with the
stop colours written per rank at build time. That's a design decision, not a
port bug, which is why it hasn't been made here.

## Where the CSS lives now

- `src/styles/tokens.css` — `:root`, reset, `.t1`–`.t6`.
- `src/styles/base.css` — only class names that must stay global: page chrome,
  `.btn`/`.select`/`.search`, `.card` family, the chip language
  (`.chip`/`.flag`/`.pill`/`.met`), table primitives, `.field`, `.notice`.
- Everything else — CSS Modules beside their component. A global rule cannot
  reach a hashed module class, so anything a global selector needs to target
  (e.g. `.page-head .actions .btn`) stays global on both sides.
