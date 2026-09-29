/**
 * Commission months follow India time (IST, UTC+5:30, no daylight saving), the
 * same as the backend: a month starts at 00:00 IST on the 1st, not 00:00 UTC.
 */
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

/** "YYYY-MM" of the IST month a moment falls in. */
export const istMonth = (at: string | number | Date): string =>
  new Date(new Date(at).getTime() + IST_OFFSET_MS).toISOString().slice(0, 7);

/**
 * Start of an IST month, in ms: 00:00 IST on the 1st. `monthsBack` 0 is the
 * month `nowMs` falls in, 1 the month before it.
 */
export const istMonthStart = (nowMs: number, monthsBack = 0): number => {
  const ist = new Date(nowMs + IST_OFFSET_MS);
  return Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth() - monthsBack, 1) - IST_OFFSET_MS;
};
