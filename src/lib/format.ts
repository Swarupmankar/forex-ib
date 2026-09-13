import type { Money } from '../types';

/**
 * One place for every number that reaches the screen. Mismatched decimals are
 * what made the first drafts look amateur.
 *
 * Money arrives as integer minor units and is divided here, at the render edge,
 * and nowhere else.
 */

export const usd = (minor: Money) =>
  (minor / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

/**
 * $12,940 — the hero and stat rows drop the cents.
 * Truncates rather than rounds: the mockup shows $12,940 for a 12,940.60
 * balance, and these are approximate stat figures, not settlement amounts.
 */
export const usdWhole = (minor: Money) =>
  Math.trunc(minor / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

/** 12,940.60 — the topbar pill puts the currency in its own element */
export const decimal = (minor: Money) =>
  (minor / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** signed, for ledger rows: −$6,200.00 uses a real minus sign */
export const usdSigned = (minor: Money) =>
  (minor < 0 ? '−' : '') + usd(Math.abs(minor));

export const lots = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** ledger lot sizes carry two decimals: 3.00, 12.00 */
export const lots2 = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const int = (n: number) => n.toLocaleString('en-US');

export const pct = (ratio: number) => `${(ratio * 100).toFixed(1)}%`;

/** whole-percent, for progress bars and tier dials */
export const pct0 = (ratio: number) => `${Math.round(ratio * 100)}%`;

export const signedPct = (ratio: number) =>
  `${ratio >= 0 ? '+' : '−'}${(Math.abs(ratio) * 100).toFixed(1)}%`;

/* ---------- dates ---------- */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 02 Aug 2026 */
export const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

/** 1 Aug 2026 — no leading zero, used in the activity feed */
export const looseDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

/** 06 Aug 14:22 — ledger timestamps */
export const stamp = (iso: string) => {
  const d = new Date(iso);
  return (
    `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]} ` +
    `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
  );
};

/** 08 Jul — chart axis ticks, zero-padded so they stay the same width */
export const axisDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]}`;
};

/** 1 Sep */
export const dayMonth = (iso: string) => {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
};

const DAY = 86_400_000;

/** Today / Yesterday / 21 days ago / — */
export const relativeDay = (iso: string | null, now: string) => {
  if (!iso) return '—';
  const days = Math.floor((startOfDay(now) - startOfDay(iso)) / DAY);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

/** 14 minutes ago / 2 hours ago — activity feed */
export const relativeTime = (iso: string, now: string) => {
  const mins = Math.round((Date.parse(now) - Date.parse(iso)) / 60_000);
  if (mins < 1) return 'Just now';
  if (mins === 1) return '1 minute ago';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return looseDate(iso);
};

const startOfDay = (iso: string) => {
  const d = new Date(iso);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

export const daysLeftInMonth = (now?: string) => {
  const d = now ? new Date(now) : new Date();
  const year = d.getFullYear();
  const month = d.getMonth();
  const date = d.getDate();
  const last = new Date(year, month + 1, 0).getDate();
  return Math.max(0, last - date);
};

/** "September 2026" */
export const monthYear = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date();
  const full = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${full[d.getMonth()]} ${d.getFullYear()}`;
};

export const initialsOf = (name: string) =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
