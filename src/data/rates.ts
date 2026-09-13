import type { AccountType, AccountTypeId, Money, RateRow } from '../types';

export const ACCOUNT_TYPES: AccountType[] = [
  { id: 'standard', name: 'Standard', model: 'spread-based' },
  { id: 'pro', name: 'Pro', model: 'spread-based' },
  { id: 'raw', name: 'Raw Spread', model: 'commission a/c' },
  { id: 'zero', name: 'Zero', model: 'commission a/c' },
];

export const accountTypeName = (id: AccountTypeId | null) =>
  id ? (ACCOUNT_TYPES.find((a) => a.id === id)?.name ?? '—') : '—';

/**
 * BASE rates, pre-uplift, in minor units per standard lot.
 *
 * The mockup prints Senior Partner rates (×1.25); these are those figures
 * divided back down, which is why they are round numbers — $9.00 shown is
 * 720¢ base. Never store the uplifted value: the rate card's tier preview
 * multiplies from here, and storing post-uplift would compound.
 */
export const RATE_ROWS: RateRow[] = [
  { id: 'fx-major',  group: 'Major FX',          examples: 'EURUSD, GBPUSD, USDJPY',      base: { standard: 720,  pro: 600,  raw: 448, zero: 504 } },
  { id: 'fx-minor',  group: 'Minors & crosses',  examples: 'EURGBP, AUDNZD, CADJPY',      base: { standard: 648,  pro: 540,  raw: 404, zero: 452 } },
  { id: 'fx-exotic', group: 'Exotics',           examples: 'USDTRY, USDZAR, USDMXN',      base: { standard: 1000, pro: 832,  raw: 624, zero: 700 } },
  { id: 'gold',      group: 'Gold',              examples: 'XAUUSD',                      base: { standard: 1100, pro: 900,  raw: 672, zero: 752 } },
  { id: 'metals',    group: 'Silver & metals',   examples: 'XAGUSD, platinum, copper',    base: { standard: 900,  pro: 752,  raw: 560, zero: 628 } },
  { id: 'indices',   group: 'Indices',           examples: 'US30, NAS100, GER40',         base: { standard: 552,  pro: 448,  raw: 336, zero: 376 } },
  { id: 'energies',  group: 'Energies',          examples: 'UKOIL, USOIL, NGAS',          base: { standard: 700,  pro: 576,  raw: 432, zero: 484 } },
  { id: 'equities',  group: 'Share CFDs',        examples: 'Single stocks',               base: { standard: 352,  pro: 288,  raw: 216, zero: 240 } },
];

/** Displayed rate = base × tier multiplier, rounded to the cent. */
export const displayRate = (base: Money, multiplier: number): Money => Math.round(base * multiplier);

/** The rate card marks the best-paying account type on each row. */
export const bestAccountType = (row: RateRow): AccountTypeId =>
  (Object.entries(row.base) as [AccountTypeId, Money][])
    .reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0];
