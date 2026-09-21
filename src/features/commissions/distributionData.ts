import type { IbLedgerRow } from '../../api/ib.api';
import type { AccountTypeId, Distribution, DistributionWindow } from '../../types';

/** Only recorded, positive commission belongs in a share-of-commission chart. */
export const buildDistribution = (ledger: IbLedgerRow[], window: DistributionWindow, now: number): Distribution => {
  const rows = (['standard', 'pro', 'raw', 'zero'] as AccountTypeId[]).map(accountType => ({
    accountType, colour: `var(--account-${accountType})`, commission: 0, lots: 0, perLot: 0, traders: 0,
  }));
  const cutoff = now - Number.parseInt(window, 10) * 86400000;
  for (const entry of ledger) {
    const at = new Date(entry.createdAt).getTime();
    const amount = Number(entry.amount);
    if (!Number.isFinite(at) || at < cutoff || at > now || !Number.isFinite(amount) || amount <= 0) continue;
    const type = (entry.accountType || '').toLowerCase().replace(/[\s_-]/g, '');
    const row = rows.find(r => r.accountType === (type === 'rawspread' ? 'raw' : type));
    if (!row) continue;
    row.commission += Math.round(amount * 100);
    const volume = Number(entry.closedLots);
    row.lots += Number.isFinite(volume) ? Math.max(0, volume) : 0;
  }
  for (const row of rows) row.perLot = row.lots > 0 ? Math.round(row.commission / row.lots) : 0;
  // The ledger has trade IDs, not unique trader IDs: do not infer a trader count.
  return { window, total: rows.reduce((sum, row) => sum + row.commission, 0), activeTraders: 0, rows };
};
