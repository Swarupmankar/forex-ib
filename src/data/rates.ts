/**
 * Account types and rates come from the backend: account types are the
 * broker's own (Account Types Management in the admin panel) and rates are the
 * ones published per tier in IB Management. Nothing here is hard-coded.
 */

/** Referrals and ledger rows carry the account type's name. */
export const accountTypeName = (name: string | null | undefined) => name || '—';

/** Chart colours cycled across however many account types the broker has. */
export const ACCOUNT_COLOURS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

/**
 * Instrument groups the rate card shows, one row each: the same groups as the
 * admin's Symbol Commission Rate Matrix (Majors, Minors, Metals, Gas & Oil,
 * Indices, Crypto). `symbols` orders which symbol's rate represents the row.
 */
export const RATE_ROWS: { id: string; group: string; examples: string; symbols: string[] }[] = [
  { id: 'MAJORS',   group: 'Forex Majors',           examples: 'EURUSD, GBPUSD, USDJPY', symbols: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'USDCAD', 'AUDUSD', 'NZDUSD'] },
  { id: 'MINORS',   group: 'Forex Minors & Crosses', examples: 'EURGBP, EURJPY, AUDNZD', symbols: ['EURGBP', 'EURJPY', 'AUDNZD'] },
  { id: 'METALS',   group: 'Precious Metals',        examples: 'XAUUSD, XAGUSD, XPTUSD', symbols: ['XAUUSD', 'XAGUSD', 'XPTUSD'] },
  { id: 'ENERGIES', group: 'Gas & Oil',              examples: 'WTIUSD, XNGUSD',         symbols: ['WTIUSD', 'XNGUSD'] },
  { id: 'INDICES',  group: 'Equity Indices',         examples: 'US30, US500, NAS100',    symbols: ['US30', 'US500', 'NAS100'] },
  { id: 'CRYPTO',   group: 'Crypto',                 examples: 'BTCUSD, ETHUSD',         symbols: ['BTCUSD', 'ETHUSD'] },
];

const norm = (sym: string) => sym.toUpperCase().replace(/[\s/._-]/g, '');

const FX_MAJORS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'USDCAD', 'AUDUSD', 'NZDUSD'];

/** Same grouping as the admin rate matrix and the backend. */
const groupOf = (sym: string): string => {
  const s = norm(sym);
  if (FX_MAJORS.includes(s)) return 'MAJORS';
  if (/^(BTC|ETH|LTC|XRP|SOL|DOGE|ADA|BNB)/.test(s)) return 'CRYPTO';
  if (/^(XAU|XAG|XPT|XPD)/.test(s)) return 'METALS';
  if (/(OIL|WTI|BRENT|XNG|NGAS)/.test(s)) return 'ENERGIES';
  if (/^(US\d|US500|NAS|SPX|GER|UK\d|JP\d|HK\d|AUS\d|FRA|EU\d)/.test(s)) return 'INDICES';
  return 'MINORS';
};

/** Symbols with a published rate in a group, e.g. "EURUSD, GBPUSD, USDJPY". */
export const groupExamples = (
  rates: Record<string, Record<string, number>> | undefined,
  rowId: string,
): string | null => {
  const syms = Object.keys(rates ?? {}).filter((sym) => groupOf(sym) === rowId).sort();
  if (syms.length === 0) return null;
  return syms.slice(0, 3).join(', ') + (syms.length > 3 ? ` +${syms.length - 3}` : '');
};

/**
 * The published rate (USD per lot) for an instrument group and account type:
 * the group's first listed symbol that has a rate, else any other symbol in
 * the group. null when the admin has set none.
 */
export const groupRate = (
  rates: Record<string, Record<string, number>> | undefined,
  rowId: string,
  accountTypeId: string,
): number | null => {
  if (!rates) return null;
  const byNorm = new Map(Object.entries(rates).map(([sym, v]) => [norm(sym), v] as const));
  const row = RATE_ROWS.find((r) => r.id === rowId);
  for (const sym of row?.symbols ?? []) {
    const v = byNorm.get(sym)?.[accountTypeId];
    if (typeof v === 'number') return v;
  }
  for (const [sym, v] of byNorm) {
    if (groupOf(sym) === rowId && typeof v[accountTypeId] === 'number') return v[accountTypeId];
  }
  return null;
};

/** Best rate for a group across account types (USD per lot), or null. */
export const bestGroupRate = (
  rates: Record<string, Record<string, number>> | undefined,
  rowId: string,
  accountTypeIds: string[],
): number | null => {
  const values = accountTypeIds
    .map((id) => groupRate(rates, rowId, id))
    .filter((v): v is number => v !== null);
  return values.length ? Math.max(...values) : null;
};
