# Prompt for Claude Code

Attach `ib-platform.html` and `REACT-BUILD-GUIDE.md` to the session, then paste
the block below.

---

## The prompt

```
I'm building an IB (introducing broker) partner portal in React. I've attached two files:

- ib-platform.html — a complete, working single-file mockup. This is the visual
  contract. Where the build and the mockup disagree, the mockup wins.
- REACT-BUILD-GUIDE.md — architecture decisions, component API designs, data
  shapes, and a list of pitfalls specific to this port.

Read both fully before writing any code, including the guide's sections on the
medallion sprite and the DataList component — those two carry most of the risk.

## Task

Port the mockup to a Vite + React 18 + TypeScript app with React Router and
TanStack Query. Styling stays as plain CSS: extract the tokens into
styles/tokens.css and split the rest into CSS Modules per component. Do not
introduce Tailwind, a UI kit, an icon package, or a charting library — the mockup's
look depends on a tuned token set and hand-written SVG, and reimplementing it in
utilities will drift.

Note the mockup contains several appended <style> blocks from successive design
passes. Later rules deliberately override earlier ones. Flatten them in source
order and keep the last declaration of any duplicated property.

## Build in this order, stopping after each phase for me to review

1. Scaffold: Vite + TS, tokens.css, base.css, AppShell (sidebar + topbar +
   mobile tab bar), routing for the seven sections, empty page shells.
2. MedalSprite + Medal components. Render all six tier medallions at three sizes
   on a scratch page and confirm they match the mockup before continuing. The
   colour-via-CSS-custom-properties mechanism is load-bearing — read the guide.
3. DataList component with the column-role API from the guide, then the Referrals
   page. This proves the desktop-table / mobile-list split works.
4. Overview: hero with the tier dial, facts row, activity feed, earnings chart.
5. Commissions: distribution donut, account-type rows, rate matrix with the
   working tier preview (Senior / Elite / Director).
6. Rewards: ascent rail, tier ladder, tier detail modal.
7. Payouts, Marketing, Settings.
8. TanStack Query hooks against the API surface in the guide, swapping out the
   fixtures.
9. Mobile pass: More sheet, safe-area insets, tap feedback, reduced-motion.

## Rules

- Fixtures in src/data/fixtures.ts must match the documented API response shapes
  exactly, so phase 8 is a swap and not a rewrite.
- Money crosses the API as integer minor units; format only at the render edge.
- Rate values are stored pre-uplift. Displayed rate = base × tier multiplier.
- Tier progress uses the LOWER of the two gate ratios (volume, active traders),
  capped at 1. Both gates must clear in the same calendar month.
- All money and quantity columns are right-aligned with tabular figures. Dates are
  left-aligned and muted.
- Every interactive element needs a visible focus state, and modals need Esc,
  backdrop close, body scroll lock, and focus restoration to the trigger.
- Respect prefers-reduced-motion everywhere animation appears.
- Sub-IB / downline features are explicitly out of scope for now. Don't scaffold
  them, but don't design the tier or commission models in a way that blocks adding
  a parent_partner_id and an override rate later.

## Before you start

Ask me about anything in the mockup whose intended behaviour isn't obvious from
the markup — particularly around what should be server-driven versus static, and
where you'd expect real interactivity that the mockup only fakes. I'd rather answer
five questions now than review a wrong assumption later.
```

---

## Two follow-up prompts worth keeping

**After phase 2**, if the medallions look off:

```
The medallions don't match the mockup. Diff your symbol markup against the
<symbol id="medalN"> blocks in ib-platform.html and report what differs before
changing anything. Check especially: the id suffixes on gradients/filters/clip
paths, whether the CSS custom properties reach the gradient stops, and whether the
<style> block inside each symbol survived the JSX conversion.
```

**After phase 8**, before you ship:

```
Audit the app against ib-platform.html at 1440px, 900px and 390px. List every
visual difference you find — spacing, alignment, type scale, colour, shadow —
without fixing anything yet. Then we'll decide which are bugs and which are
improvements.
```
