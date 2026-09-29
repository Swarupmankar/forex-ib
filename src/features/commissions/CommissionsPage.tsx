import { useState, useMemo } from 'react';
import { PageHead } from '../../components/PageHead';
import { DataList, type Col } from '../../components/DataList';
import { Select } from '../../components/Select';
import { DownloadIcon } from '../../components/icons';
import { Skeleton } from '../../components/Skeleton';
import { Distribution } from './Distribution';
import { buildDistribution } from './distributionData';
import { RateCard } from './RateCard';
import { useToast } from '../../components/Toast';
import { useAccountTypes, useNow, usePartner } from '../../api/hooks';
import { useIbCommissionLedger } from '../../api/ib.hooks';
import { accountTypeName } from '../../data/rates';
import { downloadCsv, stampedName } from '../../lib/download';
import { istMonthStart } from '../../lib/istMonth';
import { lots2, stamp, usd, usdSigned } from '../../lib/format';
import type {
  DistributionWindow,
  LedgerEntry,
  LedgerWindow,
} from '../../types';

const WINDOW_OPTIONS: { value: DistributionWindow; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

const LEDGER_WINDOWS: { value: LedgerWindow; label: string }[] = [
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'last-90', label: 'Last 90 days' },
];

const columns: Col<LedgerEntry>[] = [
  { key: 'date', header: 'Date', render: (e) => <span className="num">{stamp(e.at)}</span> },
  { key: 'trader', header: 'Trader', mobile: 'primary', render: (e) => e.traderName ?? '—' },
  { key: 'account', header: 'Account', render: (e) => accountTypeName(e.accountType) },
  { key: 'symbol', header: 'Symbol', mobile: 'secondary', render: (e) => <span className="num">{e.symbol}</span> },
  { key: 'lots', header: 'Lots', align: 'right', render: (e) => (e.lots === null ? '—' : lots2(e.lots)) },
  { key: 'rate', header: 'Rate', align: 'right', render: (e) => (e.rate === null ? '—' : usd(e.rate)) },
  { key: 'amount', header: 'Amount', align: 'right', mobile: 'value', render: (e) => usdSigned(e.amount) },
  {
    key: 'state', header: 'State', mobile: 'status',
    render: (e) =>
      e.state === 'accrued'
        ? <span className="chip c-active">Accrued</span>
        : <span className="chip c-paid">Paid out</span>,
  },
];

/** Start (inclusive) and end (exclusive) of a ledger window, in ms. Months are IST. */
const windowRange = (w: LedgerWindow, nowMs: number): [number, number] => {
  const thisMonth = istMonthStart(nowMs);
  if (w === 'this-month') return [thisMonth, Infinity];
  if (w === 'last-month') return [istMonthStart(nowMs, 1), thisMonth];
  return [nowMs - 90 * 86400000, Infinity];
};

export const CommissionsPage = () => {
  const now = useNow();
  const partner = usePartner();
  const toast = useToast();
  const [window, setWindow] = useState<DistributionWindow>('30d');
  const [ledgerWindow, setLedgerWindow] = useState<LedgerWindow>('this-month');
  const [traderId, setTraderId] = useState<string>('all');

  const accountTypes = useAccountTypes();

  // Live Backend Queries
  const { data: ledgerData, isLoading: isLedgerLoading, isError: isDistributionError } = useIbCommissionLedger(1, 100);

  const distribution = useMemo(
    () => buildDistribution(ledgerData?.ledger ?? [], window, new Date(now).getTime(), accountTypes),
    [ledgerData, window, now, accountTypes],
  );

  const allEntries: LedgerEntry[] = useMemo(
    () =>
      // Closed trades that earned nothing (no rate / not eligible) are not accruals
      (ledgerData?.ledger ?? []).filter((e) => e.state !== 'SKIPPED').map((e) => ({
        id: `ledger-${e.id}`,
        at: e.createdAt,
        traderId: e.clientId != null ? String(e.clientId) : null,
        traderName: e.clientName ?? null,
        accountType: e.accountType || null,
        symbol: e.symbol,
        lots: e.closedLots,
        rate: Math.round(e.rate * 100),
        amount: Math.round(e.amount * 100),
        state: e.state === 'PAID' ? 'paid' : 'accrued',
      })),
    [ledgerData],
  );

  const entries = useMemo(() => {
    const [from, to] = windowRange(ledgerWindow, new Date(now).getTime());
    return allEntries.filter((e) => {
      const at = new Date(e.at).getTime();
      if (at < from || at >= to) return false;
      return traderId === 'all' || e.traderId === traderId;
    });
  }, [allEntries, ledgerWindow, traderId, now]);

  const traderOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of allEntries) {
      if (e.traderId && !seen.has(e.traderId)) seen.set(e.traderId, e.traderName ?? `Client ${e.traderId}`);
    }
    return [
      { value: 'all', label: 'All traders' },
      ...Array.from(seen, ([value, label]) => ({ value, label })),
    ];
  }, [allEntries]);

  const downloadStatement = () => {
    if (entries.length === 0) {
      toast('Nothing to download', 'No accruals in the selected period.', 'warn');
      return;
    }
    const net = entries.reduce((sum, e) => sum + e.amount, 0);
    downloadCsv(
      stampedName(`ib-statement-${ledgerWindow}`, now, 'csv'),
      ['Date (UTC)', 'Trader', 'Account', 'Symbol', 'Lots', 'Rate (USD/lot)', 'Amount (USD)', 'State'],
      [
        ...entries.map((e) => [
          e.at.replace('T', ' ').replace('Z', ''),
          e.traderName ?? '', accountTypeName(e.accountType), e.symbol,
          e.lots === null ? '' : e.lots.toFixed(2),
          e.rate === null ? '' : (e.rate / 100).toFixed(2),
          (e.amount / 100).toFixed(2), e.state,
        ]),
        ['', '', '', '', '', 'Net', (net / 100).toFixed(2), ''],
      ],
    );
    const label = LEDGER_WINDOWS.find((w) => w.value === ledgerWindow)?.label.toLowerCase();
    toast(`Statement downloaded`, `${entries.length} entries · ${label}, net ${usdSigned(net)}.`);
  };

  return (
    <section className="wrap view">
      <PageHead
        eyebrow="Partnerships"
        title="Commissions"
        sub="What you earn per lot, by account type — and where it's coming from."
        actions={
          <button className="btn" onClick={downloadStatement}>
            <DownloadIcon /> Download statement
          </button>
        }
      />

      <div className="stack">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Where your commission comes from</div>
              <div className="card-sub">
                {WINDOW_OPTIONS.find((w) => w.value === window)?.label} ·{' '}
                {isLedgerLoading
                  ? <Skeleton width="80px" height="16px" />
                  : usd(distribution.total)}{' '}
                in recorded commission
              </div>
            </div>
            <Select
              ariaLabel="Distribution period"
              value={window}
              options={WINDOW_OPTIONS}
              onChange={setWindow}
            />
          </div>
          {isLedgerLoading ? <div className="card-pad" role="status" aria-label="Loading commission breakdown"><Skeleton width="100%" height="260px" /></div>
            : isDistributionError ? <p className="card-pad sub" role="status">Commission breakdown could not be loaded. Please try again shortly.</p>
            : <Distribution data={distribution} />}
          <p className="distribution-note">Based on positive commission in the latest {ledgerData?.ledger.length ?? 0} loaded ledger entries. {Number(ledgerData?.pagination?.totalPages) > 1 ? 'More entries exist; this is a partial breakdown.' : 'Reversals are excluded.'}</p>
        </div>

        <RateCard tier={partner.tier} />

        <div className="card">
          <div className="card-head">
            <div className="card-title">Accrual ledger</div>
            <div className="actions">
              <Select
                ariaLabel="Ledger period"
                value={ledgerWindow}
                options={LEDGER_WINDOWS}
                onChange={setLedgerWindow}
              />
              <Select
                ariaLabel="Filter by trader"
                value={traderId}
                options={traderOptions}
                onChange={setTraderId}
              />
            </div>
          </div>
          <DataList
            columns={columns}
            rows={entries}
            rowKey={(e) => e.id}
            loading={isLedgerLoading}
            empty="No accruals in this period."
          />
        </div>
      </div>
    </section>
  );
};
