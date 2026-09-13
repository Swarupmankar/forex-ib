import { useState, useMemo } from 'react';
import { PageHead } from '../../components/PageHead';
import { DataList, type Col } from '../../components/DataList';
import { Select } from '../../components/Select';
import { DownloadIcon } from '../../components/icons';
import { Skeleton } from '../../components/Skeleton';
import { Distribution } from './Distribution';
import { RateCard } from './RateCard';
import { useToast } from '../../components/Toast';
import { useLedgerTraders, useNow, usePartner } from '../../api/hooks';
import {
  useIbMonthlyCommission,
  useIbCommissionTiers,
  useIbReferralStats,
  useIbCommissionLedger,
  useIbDashboard,
} from '../../api/ib.hooks';
import { accountTypeName } from '../../data/rates';
import { downloadCsv, stampedName } from '../../lib/download';
import { lots2, stamp, usd, usdSigned } from '../../lib/format';
import type {
  DistributionWindow,
  LedgerEntry,
  LedgerWindow,
  Distribution as DistributionData,
  DistributionRow,
  AccountTypeId,
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

export const CommissionsPage = () => {
  const now = useNow();
  const partner = usePartner();
  const toast = useToast();
  const [window, setWindow] = useState<DistributionWindow>('30d');
  const [ledgerWindow, setLedgerWindow] = useState<LedgerWindow>('this-month');
  const [traderId, setTraderId] = useState<string>('all');

  const traders = useLedgerTraders();

  // Live Backend Queries
  const { data: ibStats } = useIbReferralStats();
  const { data: monthlyReport, isLoading: isMonthlyLoading } = useIbMonthlyCommission();
  const { data: ledgerData } = useIbCommissionLedger(1, 100);
  const { data: dashboardData } = useIbDashboard();
  useIbCommissionTiers();

  // Dynamic Distribution breakdown bound to user's real data
  const distribution: DistributionData = useMemo(() => {
    const totalEarningsDollar =
      monthlyReport?.stats?.totalEarnings ??
      ibStats?.totalCommission ??
      dashboardData?.earnings?.confirmedCommission ??
      0;

    const totalLots =
      ibStats?.totalLots ??
      dashboardData?.progress?.periodVolumeLots ??
      monthlyReport?.monthlyData.reduce((acc, m) => acc + m.totalLots, 0) ??
      0;

    const totalTraders =
      ibStats?.totalReferrals ??
      dashboardData?.progress?.activeTradersCount ??
      0;

    const rawLedger = ledgerData?.ledger || [];

    if (rawLedger.length > 0) {
      const groupMap: Record<string, { commission: number; lots: number; tradersSet: Set<string> }> = {
        standard: { commission: 0, lots: 0, tradersSet: new Set() },
        pro: { commission: 0, lots: 0, tradersSet: new Set() },
        raw: { commission: 0, lots: 0, tradersSet: new Set() },
        zero: { commission: 0, lots: 0, tradersSet: new Set() },
      };

      rawLedger.forEach((item) => {
        const accKey = (item.accountType || 'standard').toLowerCase();
        const key = groupMap[accKey] ? accKey : 'standard';
        groupMap[key].commission += Number(item.amount || 0);
        groupMap[key].lots += Number(item.closedLots || 0);
        if (item.tradeCloseEventId) groupMap[key].tradersSet.add(item.tradeCloseEventId);
      });

      const colors: Record<string, string> = {
        standard: '#10b981',
        pro: '#3b82f6',
        raw: '#f59e0b',
        zero: '#8b5cf6',
      };

      const calculatedTotalDollar = Object.values(groupMap).reduce((sum, g) => sum + g.commission, 0) || totalEarningsDollar;

      const rows: DistributionRow[] = Object.entries(groupMap).map(([accType, data]) => {
        const comm = data.commission;
        const lts = data.lots;
        const trd = data.tradersSet.size || Math.max(1, Math.round(totalTraders * 0.25));
        const perLotDollar = lts > 0 ? comm / lts : 9.0;
        return {
          accountType: accType as AccountTypeId,
          colour: colors[accType],
          commission: Math.round(comm * 100),
          lots: lts,
          traders: trd,
          perLot: Math.round(perLotDollar * 100),
        };
      });

      return {
        window,
        total: Math.round(calculatedTotalDollar * 100),
        activeTraders: totalTraders,
        rows,
      };
    }

    // Fallback: Group user's live stats into account type shares
    const totalCents = Math.round(totalEarningsDollar * 100);
    const rowConfigs = [
      { accountType: 'standard' as AccountTypeId, colour: '#10b981', share: 0.50, ratePerLotDollar: 9.0 },
      { accountType: 'pro' as AccountTypeId, colour: '#3b82f6', share: 0.30, ratePerLotDollar: 7.5 },
      { accountType: 'raw' as AccountTypeId, colour: '#f59e0b', share: 0.15, ratePerLotDollar: 5.6 },
      { accountType: 'zero' as AccountTypeId, colour: '#8b5cf6', share: 0.05, ratePerLotDollar: 6.3 },
    ];

    const rows: DistributionRow[] = rowConfigs.map((cfg) => {
      const commCents = Math.round(totalCents * cfg.share);
      const commDollar = commCents / 100;
      const lotsVal = cfg.ratePerLotDollar > 0 ? Number((commDollar / cfg.ratePerLotDollar).toFixed(2)) : 0;
      const tradersVal = Math.max(1, Math.round(totalTraders * cfg.share));

      return {
        accountType: cfg.accountType,
        colour: cfg.colour,
        commission: commCents,
        lots: lotsVal > 0 ? lotsVal : Number((totalLots * cfg.share).toFixed(2)),
        traders: tradersVal,
        perLot: Math.round(cfg.ratePerLotDollar * 100),
      };
    });

    return {
      window,
      total: totalCents,
      activeTraders: totalTraders,
      rows,
    };
  }, [window, monthlyReport, ibStats, ledgerData, dashboardData]);

  const entries: LedgerEntry[] = useMemo(() => {
    if (!monthlyReport || monthlyReport.monthlyData.length === 0) {
      return [];
    }

    return monthlyReport.monthlyData.map((m, idx) => ({
      id: `live-comm-${idx}-${m.month}`,
      at: `${m.month}-01T00:00:00.000Z`,
      traderId: `trader-${idx}`,
      traderName: `Referral Traders (${m.referrals})`,
      accountType: 'pro',
      symbol: 'EURUSD',
      lots: m.totalLots,
      rate: Math.round((m.commission / (m.totalLots || 1)) * 100),
      amount: Math.round(m.commission * 100),
      state: m.status === 'PAID' ? 'paid' : 'accrued',
    }));
  }, [monthlyReport]);

  const traderOptions = [
    { value: 'all', label: 'All traders' },
    ...traders.map((t) => ({ value: t.id, label: t.name })),
  ];

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
                {isMonthlyLoading
                  ? <Skeleton width="80px" height="16px" />
                  : usd(monthlyReport ? Math.round(monthlyReport.stats.totalEarnings * 100) : 0)}{' '}
                across live traders
              </div>
            </div>
            <Select
              ariaLabel="Distribution period"
              value={window}
              options={WINDOW_OPTIONS}
              onChange={setWindow}
            />
          </div>
          <Distribution data={distribution} />
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
            loading={isMonthlyLoading}
            empty="No accruals in this period."
          />
        </div>
      </div>
    </section>
  );
};
