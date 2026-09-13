# IB Portal — React Port Guide

Companion to `ib-platform.html`. That file is the visual contract: if the React
build and the mockup disagree, the mockup is right.

---

## 1. Stack

| Concern | Choice | Why |
|---|---|---|
| Build | Vite + React 18 + TypeScript | Fast, no framework opinions to fight |
| Routing | React Router v6 | Seven flat routes, nothing exotic |
| Data | TanStack Query | Server state, caching, background refetch |
| Styling | **Plain CSS — tokens + CSS Modules** | See below |
| Charts | Hand-rolled SVG (already written) | The chart is 12 lines of path data |
| Icons | Inline SVG, copied from the mockup | No icon library needed |

### Do not use Tailwind for this port

The mockup's look comes from a tuned token set — specific gradients, shadow
stacks, letter-spacing on numerals, inset highlights. Reimplementing that as
utility classes guarantees drift, and you will spend longer approximating it than
you would moving the CSS across. Copy `:root` into `styles/tokens.css`, then split
the rest into modules per component. The CSS is already written and correct.

---

## 2. Extract the tokens first

Before any component work, pull the `:root` block plus the tier metal classes
(`.t1`–`.t6`) into `src/styles/tokens.css` and import it once in `main.tsx`.
Everything else references these. Note the mockup has **several appended `<style>`
blocks** from successive passes — later rules intentionally override earlier ones.
Flatten them in order, keeping the last declaration of any duplicated property.

---

## 3. File layout

```
src/
  main.tsx
  App.tsx                    # router + AppShell
  styles/
    tokens.css               # :root, tier metals, resets
    base.css                 # typography, buttons, chips, tables
  components/
    MedalSprite.tsx          # ← renders all 6 <symbol> defs ONCE at app root
    Medal.tsx                # <Medal tier={3} size="lg" />
    AppShell.tsx             # sidebar + topbar + tabbar + outlet
    Sidebar.tsx
    TopBar.tsx
    TabBar.tsx               # mobile only
    MoreSheet.tsx            # mobile overflow nav
    BottomSheet.tsx          # shared sheet primitive (modal on desktop)
    DataList.tsx             # ← table on desktop, list rows on mobile
    Card.tsx  StatChip.tsx  ProgressGate.tsx  Hero.tsx
  features/
    overview/  referrals/  commissions/  rewards/  marketing/
    payouts/   settings/
  data/
    tiers.ts                 # the TIERS array, lifted from the mockup script
    rates.ts                 # rate matrix, base values (pre-uplift)
  api/
    client.ts  hooks.ts      # useOverview, useReferrals, usePayouts, ...
  types.ts
```

---

## 4. The medallion system — read this before touching it

Six `<symbol>` elements, one per tier, each with its own gradients, filters and
clip path, all id-suffixed (`rim3`, `face3`, `clip3`…). They are consumed as
`<svg class="medal t3"><use href="#medal3"/></svg>`.

Three things will break if you're not careful:

1. **The sprite must be in the DOM before any `<use>` renders.** Render
   `<MedalSprite />` once at the top of `App.tsx`, outside the router.
2. **Colour comes from CSS custom properties on the host element**, not from the
   symbol. `.t4` sets `--mA/--mB/--mC/--mG`; the gradient stops inside the symbol
   read `var(--mA)`. Custom properties inherit into the `<use>` shadow tree — this
   is the whole trick. Don't "simplify" it by hardcoding stop colours.
3. **Each symbol contains a `<style>` element** driving the sheen sweep. In JSX
   write it as `<style>{`...`}</style>` — React accepts a single string child on
   `<style>`. Do not move these rules to a global sheet; document CSS does not
   reach into a `<use>` shadow tree.

```tsx
type Props = { tier: 1|2|3|4|5|6; className?: string };
export const Medal = ({ tier, className = '' }: Props) => (
  <svg className={`medal t${tier} ${className}`} viewBox="0 0 120 136" aria-hidden>
    <use href={`#medal${tier}`} />
  </svg>
);
```

React 16+ supports plain `href` on `<use>` — no `xlinkHref` needed.

---

## 5. DataList — the one component worth designing properly

The mockup fakes the mobile list with per-page `nth-child` CSS. Do not port that.
Replace it with a column-role API so each table is declared once:

```tsx
type Col<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right';          // 'right' ⇒ numeric, tabular figures
  mobile?: 'primary' | 'secondary' | 'value' | 'status' | 'hidden';
};
```

- Desktop: renders a `<table>`, every column shown, `align:'right'` cells get the
  mono/tabular treatment.
- Mobile (<900px): renders a two-line row — `primary` top-left, `secondary`
  bottom-left, `value` top-right, `status` bottom-right, everything else dropped.

Exactly one column per table should carry each mobile role. The five existing
tables map like this:

| Table | primary | secondary | value | status |
|---|---|---|---|---|
| Recent referrals | Trader | — | This month | Status |
| Referrals | Trader | Account type | This month | Status |
| Accrual ledger | Trader | Symbol | Amount | State |
| Payout history | Method | Requested | Amount | Status |
| Reward history | Reward | Tier | — | Status |

The rate matrix is **not** a DataList — it's a genuine matrix and stays
horizontally scrollable on mobile with scroll-snap.

---

## 6. Number formatting

Money and quantities are right-aligned, mono, `font-variant-numeric: tabular-nums`.
Centralise it — mismatched decimals are what made the first drafts look amateur:

```ts
export const usd  = (n: number) => n.toLocaleString('en-US', {style:'currency', currency:'USD', minimumFractionDigits:2});
export const lots = (n: number) => n.toLocaleString('en-US', {minimumFractionDigits:1, maximumFractionDigits:1});
export const pct  = (n: number) => `${(n*100).toFixed(1)}%`;
```

Dates stay **left**-aligned and muted. Only quantities go right.

---

## 7. Tier logic — put it in one module

```ts
export type TierRank = 1|2|3|4|5|6;
export interface Tier {
  rank: TierRank; name: string;
  minLots: number; minActiveTraders: number;
  multiplier: number;        // 1.00 … 1.85, applied to base rates
  upliftLabel: string;       // '+25%'
  inviteOnly?: boolean;
  rewards: { icon: IconKey; title: string; detail: string }[];
  note: string;
}
```

Derived state, computed in a `useTierProgress()` hook — never scattered through
components:

```ts
{ current, next, lotsProgress, tradersProgress,
  lotsRemaining, tradersRemaining, bothGatesMet, pctToNext, daysLeftInMonth }
```

**Both gates must clear in the same calendar month.** `pctToNext` is the *lower*
of the two ratios, capped at 1 — that's what the hero dial shows, and it's why the
dial reads 61% even though trader count is already at 103%.

Rate cells are stored as **base** values. Displayed rate = `base × multiplier`.
Never store the uplifted number; the rate card's tier preview depends on this.

---

## 8. API surface to build against

```
GET  /api/partner/me                → profile, code, tier, kyc, verification
GET  /api/partner/overview          → balance, lifetime, paidOut, counts, series[]
GET  /api/partner/referrals?status&accountType&q&cursor
GET  /api/partner/commissions/ledger?from&to&traderId&cursor
GET  /api/partner/commissions/distribution?window=30d   → per accountType
GET  /api/partner/rates              → base matrix + this partner's multiplier
GET  /api/partner/tiers              → ladder + achievedAt/grantState per tier
GET  /api/partner/payouts            → balance, methods, history
POST /api/partner/payouts            → { amount, methodId }
```

Money crosses the wire as **integer minor units** (cents), formatted client-side.
Floating-point currency in JSON is how ledgers end up off by a penny.

---

## 9. Behaviour to preserve

- **Copy buttons**: `navigator.clipboard.writeText`, 1.2s success state. Wrap in
  try/catch — it throws on insecure origins.
- **Tier modal**: bottom sheet under 900px, centred dialog above. Portal to
  `document.body`, lock body scroll, close on Esc and backdrop, restore focus to
  the trigger on close.
- **Rate card tier preview**: swaps both the numbers *and* the medallion symbol.
- **`prefers-reduced-motion`**: kills the sheen, bob and entrance animations.
- **Safe areas**: keep `viewport-fit=cover` in the meta tag or
  `env(safe-area-inset-*)` returns 0.

---

## 10. Things that will bite you

1. Reusing `id` attributes — the six symbols each define `rim`, `face`, `clip`
   etc. suffixed by rank. Keep the suffixes.
2. Rendering `<MedalSprite />` inside a route — it unmounts on navigation and
   every medal on the page goes blank.
3. Porting the `<style>` blocks in symbols to CSS Modules — the hashed class names
   won't match `.sheen` inside the shadow tree.
4. `overflow: hidden` on a card clipping the medallion's drop shadow. The mockup
   sets `overflow: visible` on medal SVGs deliberately.
5. Letting a chart library render the earnings trend. The hand-written path is
   fewer bytes than the library's import and matches the design exactly.

---

## 11. Suggested order

1. Tokens + base CSS + `AppShell` with routing and empty pages
2. `MedalSprite` + `Medal` — verify all six render at three sizes before moving on
3. `DataList` + Referrals page (proves the desktop/mobile split)
4. Overview: hero, dial, facts, activity, chart
5. Commissions: donut, distribution rows, rate matrix with tier preview
6. Rewards: ascent rail, ladder, tier modal
7. Payouts, Marketing, Settings
8. Wire TanStack Query, replace fixtures with the API
9. Mobile pass: tab bar, More sheet, safe areas, tap feedback

Keep fixtures in `src/data/fixtures.ts` matching the API response shapes exactly,
so step 8 is a swap rather than a refactor.
