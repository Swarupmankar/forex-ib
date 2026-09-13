# IB Portal

React port of `ib-platform.html`. That mockup is the visual contract: where the
build and the mockup disagree, the mockup is right.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
npm run typecheck
```

`http://localhost:5173/mockup.html` serves the original mockup untransformed,
for side-by-side comparison. It's a symlink in `public/` — delete it before any
real deploy, since `public/` is copied into `dist/`.

## There is no backend

Nothing is fetched. `src/data/fixtures.ts` is the only source of data, and it is
shaped exactly like the API responses documented in `REACT-BUILD-GUIDE.md` §8.
Every component reads through `src/api/hooks.ts`, which is the single seam
between UI and data — if a real API ever appears, each hook body becomes a
`useQuery` and nothing above that file changes.

Two rules the fixtures follow, because they're the ones that are painful to
retrofit:

- **Money is integer minor units** everywhere. It is divided exactly once, at
  the render edge, by the helpers in `src/lib/format.ts`.
- **Rates are stored pre-uplift.** A displayed rate is `base × tier multiplier`.
  Storing the uplifted number would make the rate card's tier preview compound.

There is also a **fixture clock**: `AS_OF` in `fixtures.ts`. Relative dates
("Today", "21 days ago", "25 days left in the qualifying month") are measured
from it rather than the real clock, so the screen stays identical to the mockup
instead of drifting a day at a time.

## Layout

```
src/
  main.tsx                 QueryClientProvider + global CSS
  App.tsx                  MedalSprite (outside the router) + routes
  nav.ts                   the seven sections, shared by sidebar/tabbar/sheet
  types.ts                 API-shaped types
  styles/
    tokens.css             :root, reset, .t1–.t6 tier metals
    base.css               global primitives only (see below)
  components/              MedalSprite, Medal, DataList, Modal, MoreSheet,
                           Hero, Feed, Select, CopyButton, AppShell, …
  features/<section>/      one folder per route
  data/                    tiers.ts, rates.ts, fixtures.ts
  api/hooks.ts             the data seam
  lib/                     format.ts, useTierProgress.ts, useDismissable.ts
```

CSS is plain: tokens, a small global base sheet, and a CSS Module per component.
`base.css` holds **only** class names that genuinely need to be global — page
chrome, `.btn`/`.select`/`.search`, the card family, the chip language, table
primitives, `.field`. Everything else is module-scoped, and modules never rely
on beating a `base.css` rule in the cascade, because stylesheet order between
the two isn't guaranteed.

## Three things that will break if you're careless

1. **`<MedalSprite />` must stay outside the router.** Mount it inside a route
   and it unmounts on navigation, and every `<use href="#medalN">` on the page
   renders blank.
2. **Medallion colour comes from CSS custom properties on the host element.**
   `.t4` sets `--mA/--mB/--mC/--mG`; the gradient stops inside the `<symbol>`
   read them through the `<use>` shadow tree. Hardcoding stop colours breaks all
   six tiers at once.
3. **Each symbol's `<style>` block has to stay inside the symbol.** Document CSS
   does not reach into a `<use>` shadow tree, and a CSS Module's hashed class
   name would never match `.sheen`.

`/medals` (not in the nav) renders all six medallions at the three sizes they
ship at, for eyeballing against the mockup.

**Known, and faithful:** all six tiers currently render in the same silver metal
with only the emblem tinted. That is what `ib-platform.html` does too —
verified side by side in the same browser. The emblems read `var(--mG)` off an
element inside the shadow tree and resolve; the rim/face gradients are
referenced by id (`url(#rim3)`) and resolve to the document-level gradient
outside any shadow tree, so their stops fall back to grey.
`docs/FLATTENING-NOTES.md` explains it and what changing it would take.

## Tier logic

All of it lives in `src/lib/useTierProgress.ts`. The rule that matters: **both
gates — volume and active traders — must clear in the same calendar month**, so
progress is the *lower* of the two ratios, capped at 1. That's why the hero dial
reads 61% while the trader count is already at 103%.

## DataList

Tables are declared once with a column-role API. `mobile` says what each column
becomes under 900px — `primary` (top-left), `secondary` (bottom-left), `value`
(top-right), `status` (bottom-right); everything else is dropped. At most one
column per role, since the roles are grid areas.

The mockup faked this with per-page `nth-child` rules; those are not ported.
The rate matrix is deliberately **not** a DataList — it's a genuine matrix and
stays horizontally scrollable with scroll-snap on mobile.

## Auth is UI, not authentication

`/signin`, `/signup` and `/forgot-password` are real screens with real
validation, and the portal is behind a route guard. **None of it authenticates
anything.** There is no backend, so no credential is checked and no account is
created. Any valid-looking email with an 8-character password signs you in to
the sample partner. Each screen says so on the screen, not in a footnote.

What is real:
- Field validation (email shape, password length and strength, required fields,
  terms acceptance), shown only after a field is touched or the form submitted.
- Show/hide password, a strength meter, pending states on submit.
- Route guards both ways: signed-out visitors are sent to `/signin`, and the
  guard remembers where they were headed so sign-in returns them there. Signed-in
  visitors are bounced off the auth screens.
- Log out from three places — the topbar account menu, the sidebar, and the
  mobile More sheet.
- The "partner terms" checkbox opens the same terms dialog the Rewards page
  uses, so the terms are readable before you accept them.

`src/auth/useAuth.tsx` is the seam. `signIn`/`signUp` become POSTs that return a
token and nothing above that file changes. The one idea that must **not** carry
over is that a value in `localStorage` means the user is allowed in — that check
belongs on a server.

## Every control does something

No button in the app is decorative. With no backend, "working" means the action
completes entirely in the browser and produces something real:

| Control | What it actually does |
|---|---|
| Export CSV (Referrals) | Downloads the **currently filtered** rows as RFC-4180 CSV |
| Invite trader | Dialog with link, code, a ready-made message, and OS share / WhatsApp / Telegram handoffs |
| Download statement (Commissions) | CSV of the ledger for the selected period and trader, with a net total row |
| Programme terms (Rewards) | Dialog rendered from the same tier data as the ladder, plus a downloadable text copy |
| Get (Marketing) | PNG assets are rasterised through a canvas at their real pixel size, co-branded with your code; HTML gets a standalone email file; everything else gets a brief carrying the tracked link |
| Notifications bell | Panel derived from live payout, referral and verification state; unread count, mark-all-read, each row navigates |
| Global search | Searches traders, payouts and accruals; grouped results navigate to the right page |
| Add method (Payouts) | Validating dialog for bank / USDT / trading account, then adds the destination |
| Make default / Remove | Reorders and deletes destinations, never leaving the account without a default |
| Export history (Payouts) | Payout history as CSV |
| Settings toggles | Real preferences, persisted to `localStorage` |
| Export your data | Full JSON export: profile, tier, performance, payouts, preferences |
| Contact your partner manager | Dialog with mail / tel / Telegram deep links, subject pre-filled with your partner ID |

Two consequences worth knowing. Payout methods and preferences are stored on the
device (`ib.*` keys in `localStorage`) — a method added and then lost on
navigation would be worse than not offering the control. And the payout request
dialog validates fully but submits nothing; there is nowhere to submit to.

## Where the port departs from the mockup

See `docs/FLATTENING-NOTES.md` for the CSS cascade decisions. Behavioural
departures, all deliberate:

- **Filters are real.** Search, status, account type, ledger period and trader,
  and the chart/distribution windows all filter actual data. Extra fixture rows
  exist only outside the default view, so the first paint still matches the
  mockup.
- **The rate-card tier preview follows the partner's own tier** (current + next
  two) instead of being hardcoded to Senior/Elite/Director. Identical output for
  this fixture partner; correct for everyone else.
- **"Request payout" opens a real dialog** enforcing the rules the mockup states
  in prose: $100 minimum, fee waived over $500, manual approval over $5,000,
  capped at the available balance. Nothing leaves the browser on submit.
- **The mobile drawer, burger and scrim are gone.** The final pass in the mockup
  sets `display:none` on all three under 900px; the mobile shell is the tab bar
  plus the More sheet.
- **The earnings chart is generated from the series** rather than being a fixed
  path, so the window selector does something. Same character as the mockup's
  curve, not the same pixel-for-pixel wiggle.
#   f o r e x - i b  
 