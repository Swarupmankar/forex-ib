# Responsive layout rules

Updated 18 September 2026. The existing Movement Markets themes, artwork and product flows are preserved.

- Layouts use available width; text is never scaled down with a desktop artboard.
- Phone controls have a 44 px minimum touch area. Mobile form text stays at 16 px to avoid focus zoom.
- Short-screen menus, sheets and dialogs scroll within the dynamic viewport. Safe-area insets protect navigation and controls.
- The public-site navigation becomes a compact menu at 1180 px. The client drawer switches at 1023 px; the IB tab bar switches at 900 px.
- Public account-card headings and minimum deposits wrap cleanly. Data tables scroll inside their own surface, or reflow into mobile summaries.
- All four IB commission figures remain available on phones. The rewards list releases its desktop minimum width on mobile.
- Reduced-motion preferences are respected, including the client navigation drawer.

## Verification

Checked the main page templates from 320 px phones to 2560 px displays in light and dark themes, plus 844 × 390 landscape phones. Dedicated checks cover sign-in, sign-up, menus, balance/notification popovers, account details, referral QR sheets, and cookie preferences. Financial submissions were not performed; portal checks used local sample responses.

The local economic-calendar provider script reports an existing Strict Mode mounting error in development. It was present before this change and is separate from the responsive layout checks.
