# Movement Markets partner portal

The IB application uses the established client portal visual language: Inter for interface text, Space Grotesk for headings and balances, and Montserrat for the Movement Markets wordmark. The exact two-panel brand mark is shared in `Brand.tsx` and the favicon.

## Theme

`src/styles/tokens.css` is the source of truth for surfaces, borders, typography, spacing and semantic colours. Light mode uses white panels on a cool neutral canvas; dark mode uses charcoal panels and quiet borders. Lime is reserved for primary actions, active navigation and progress. Status colours remain separate from the brand accent.

`ThemeProvider` reads the saved `mm-ib-theme` preference, falling back to the operating system. A small script in `index.html` applies it before first paint. The switch is available in both authenticated and sign-in layouts. Reduced motion is respected globally.

## Surfaces and assets

- Shared shell: 224px sidebar, 66px top bar, 32px desktop page margins.
- Buttons: pill shape, 44px normal height. Fields: neutral surfaces, clear focus and error states.
- Tables: 68px desktop rows, semantic status chips; existing mobile row layout retained.
- Balance, commission and payout pages remain focused on financial information.
- Sign-in uses a balanced split layout and the approved metallic globe render from the client portal, with dedicated partner copy and a compact form. The art panel is removed on small screens to keep account access focused.
- Marketing uses the approved referral render. Creative previews and PNG downloads share the same SVG renderer and canonical logo geometry.
- Notification icons use a fixed square viewBox and explicit dimensions. The empty state uses an upright line bell.
- Tier cards form a responsive three/two/one-column comparison grid. Medal viewBoxes retain their original proportions and assets. Existing progress gates and tier detail actions are preserved.

## Scope

Existing authentication, SSO, endpoints, referral calculations, tier rules, local payout state, downloads and settings flows remain in place. This is a presentation update; it does not add server-side payout or recovery implementations. Environment files remain untouched. The referral update adds `qrcode` 1.5.4 and its TypeScript declarations; the lockfile records these additions. QR codes are generated entirely in the browser without sending referral data to an external image service.

## Verification

TypeScript and Vite production build. Isolated browser contexts with intercepted sample data cover all eight workspace pages in light/dark mode, widths 320, 390, 768, 1024 and 1440; theme and preference persistence, referral filters, notification read states, invite/tier/terms/payout dialogs, mobile navigation and sign-in validation. PNG exports verified at 728×90, 1080×1080 and 1080×1920. No real account login, emails, payouts or other external mutations performed.

Local review images and scripts are held outside the production source in the staging workspace's `qa` directory.

## Referral tools

A shared referral card on Overview and Referrals shows the exact personal URL, code and a scannable preview. An accessible modal offers PNG and SVG downloads. The invitation dialog and Marketing link builder use the same QR components; Marketing retains the selected destination and `utm_source` in its exports.

`src/lib/referral.ts` builds and validates HTTP(S) URLs using URLSearchParams, preserving special characters in referral codes. `src/lib/referralQr.ts` encodes the complete URL with medium error correction, an opaque white background and a four-module quiet zone. No logo is placed over the QR modules. PNG exports use integer-sized modules; SVG exports stay scalable. Missing codes produce a disabled state instead of a placeholder URL.

Independent jsQR decoding verified the displayed image and both exported formats against the copied URL, including source tracking and special-character codes. Browser checks also cover missing-code states, clipboard output, downloads, keyboard focus, dark mode and mobile dialogs. Validation tools and sample-data screenshots are kept in staging QA only.
