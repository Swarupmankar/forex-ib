import { useMemo, useState } from 'react';
import { PageHead } from '../../components/PageHead';
import { DataList, type Col } from '../../components/DataList';
import { Feed, type FeedRow } from '../../components/Feed';
import { Hero, HeroCta, HeroFoot, HeroLabel, HeroNote, HeroNumber, HeroSplits } from '../../components/Hero';
import { Skeleton } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import {
  BankIcon, CalendarIcon, CardPlainIcon, DollarIcon, DownloadIcon, InfoIcon, PlusIcon,
  ShieldIcon,
} from '../../components/icons';
import { PayoutRequestModal } from './PayoutRequestModal';
import { AddMethodModal } from './AddMethodModal';
import { useNow, usePayouts } from '../../api/hooks';
import { useIbMonthlyCommission, useIbReferralStats } from '../../api/ib.hooks';
import { downloadCsv, stampedName } from '../../lib/download';
import { usePersistentState } from '../../lib/usePersistentState';
import { dayMonth, int, pct0, shortDate, usd, usdWhole } from '../../lib/format';
import type { Payout, PayoutMethod, PayoutMethodKind, PayoutsData } from '../../types';
import s from './Payouts.module.css';

const METHOD_ICON: Record<PayoutMethodKind, typeof BankIcon> = {
  bank: BankIcon,
  crypto: DollarIcon,
  account: CardPlainIcon,
};

const DEST_COLOURS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

const columns: Col<Payout>[] = [
  { key: 'ref', header: 'Reference', render: (p) => <span className="num">{p.id}</span> },
  { key: 'requested', header: 'Requested', mobile: 'secondary', render: (p) => <span className="num">{shortDate(p.requestedAt)}</span> },
  { key: 'method', header: 'Method', mobile: 'primary', render: (p) => p.method },
  { key: 'amount', header: 'Amount', align: 'right', mobile: 'value', render: (p) => usd(p.amount) },
  {
    key: 'settled', header: 'Settled',
    render: (p) => <span className="num">{p.settledAt ? shortDate(p.settledAt) : '—'}</span>,
  },
  {
    key: 'status', header: 'Status', mobile: 'status',
    render: (p) =>
      p.status === 'settled'
        ? <span className="chip c-active">Settled</span>
        : <span className="chip c-dormant">In review</span>,
  },
];

export const PayoutsPage = () => {
  const now = useNow();
  const baseData = usePayouts();
  const toast = useToast();

  const { data: ibMonthly, isLoading: isMonthlyLoading } = useIbMonthlyCommission();
  const { data: ibStats, isLoading: isStatsLoading } = useIbReferralStats();
  const isLoading = isMonthlyLoading && isStatsLoading;

  const [requesting, setRequesting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [methods, setMethods] = usePersistentState<PayoutMethod[]>('ib.payout-methods.v1', []);
  const [history, setHistory] = usePersistentState<Payout[]>('ib.payout-history.v1', []);

  const data: PayoutsData = useMemo(() => {
    const balance = ibMonthly?.stats?.availableBalance ?? ibStats?.totalCommission ?? 0;
    const inReview = ibMonthly?.stats?.pendingWithdrawals ?? 0;
    const paidLifetime = ibMonthly?.stats?.totalWithdrawn ?? 0;
    const minimum = ibMonthly?.minWithdrawal ?? 50;

    return {
      ...baseData,
      balance: Math.round(balance * 100),
      inReview: Math.round(inReview * 100),
      paidLifetime: Math.round(paidLifetime * 100),
      minimum: Math.round(minimum * 100),
      payoutCount: history.length,
      methods,
      history,
    };
  }, [baseData, ibMonthly, ibStats, history, methods]);

  /** Where the money has actually gone, by destination. */
  const destinations = useMemo(() => {
    const totals = new Map<string, { total: number; count: number }>();
    data.history.forEach((p) => {
      const prev = totals.get(p.method) ?? { total: 0, count: 0 };
      totals.set(p.method, { total: prev.total + p.amount, count: prev.count + 1 });
    });
    const rows = [...totals].sort((a, b) => b[1].total - a[1].total);
    const sum = rows.reduce((acc, [, v]) => acc + v.total, 0);
    return { rows, sum };
  }, [data.history]);

  const setDefault = (id: string) => {
    setMethods(methods.map((m) => ({ ...m, isDefault: m.id === id })));
    toast('Default updated', `${methods.find((m) => m.id === id)?.label} will be pre-selected.`);
  };

  const remove = (id: string) => {
    const target = methods.find((m) => m.id === id);
    const rest = methods.filter((m) => m.id !== id);
    if (target?.isDefault && rest.length > 0) rest[0] = { ...rest[0], isDefault: true };
    setMethods(rest);
    toast('Method removed', `${target?.label} is no longer a destination.`, 'warn');
  };

  const exportHistory = () => {
    if (data.history.length === 0) {
      toast('Nothing to export', 'No payouts history yet.', 'warn');
      return;
    }
    downloadCsv(
      stampedName('ib-payout-history', now, 'csv'),
      ['Reference', 'Requested', 'Method', 'Amount (USD)', 'Settled', 'Status'],
      data.history.map((p) => [
        p.id, p.requestedAt, p.method, (p.amount / 100).toFixed(2), p.settledAt ?? '', p.status,
      ]),
    );
    toast('Payout history downloaded', `${data.history.length} payouts as CSV.`);
  };

  const handlePayoutSuccess = (amount: number, method: PayoutMethod) => {
    const newPayout: Payout = {
      id: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      requestedAt: new Date().toISOString().slice(0, 10),
      method: method.label,
      amount,
      settledAt: null,
      status: 'review',
    };
    setHistory([newPayout, ...history]);
  };

  const rules: FeedRow[] = [
    {
      id: 'schedule', tone: 'blue', icon: <CalendarIcon />,
      body: <b>Weekly payouts</b>,
      time: `Withdraw any Monday instead of monthly. Next scheduled settlement ${dayMonth(data.nextSettlement)}.`,
    },
    {
      id: 'fees', tone: 'green', icon: <ShieldIcon />,
      body: <b>Fees and minimums</b>,
      time: `Minimum ${usdWhole(data.minimum)} per request. Fee waived above ${usdWhole(data.feeWaivedAbove)}.`,
    },
    {
      id: 'approval', tone: 'amber', icon: <InfoIcon />,
      body: <b>Manual approval over {usdWhole(data.manualApprovalAbove)}</b>,
      time: 'Larger payouts settle next business day after review.',
    },
  ];

  return (
    <section className="wrap view">
      <PageHead
        eyebrow="Growth"
        title="Payouts"
        sub="Move your partner balance out, and track what's in flight."
        actions={
          <>
            <button className="btn" onClick={exportHistory}><DownloadIcon /> Export history</button>
            <button className="btn btn-dark" onClick={() => setRequesting(true)}>
              <CardPlainIcon /> Request payout
            </button>
          </>
        }
      />

      <div className="stack">
        <Hero single secondOrb={false}>
          <div>
            <HeroLabel>Available to withdraw</HeroLabel>
            <HeroNumber>
              {isLoading ? <Skeleton dark width="160px" height="40px" /> : usd(data.balance)}
            </HeroNumber>
            <HeroFoot>
              <HeroNote>
                Minimum {usdWhole(data.minimum)} · no fee over {usdWhole(data.feeWaivedAbove)}
              </HeroNote>
            </HeroFoot>
            <HeroCta>
              <button className="btn btn-white btn-sm" onClick={() => setRequesting(true)}>Withdraw</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setAdding(true)}>Add method</button>
            </HeroCta>
            <HeroSplits
              items={[
                {
                  label: 'In review',
                  value: isLoading ? <Skeleton dark width="60px" height="20px" /> : usd(data.inReview),
                },
                {
                  label: 'Paid lifetime',
                  value: isLoading ? <Skeleton dark width="60px" height="20px" /> : usdWhole(data.paidLifetime),
                },
                {
                  label: 'Payouts',
                  value: isLoading ? <Skeleton dark width="40px" height="20px" /> : int(data.payoutCount),
                },
                { label: 'Next settle', value: dayMonth(data.nextSettlement) },
              ]}
            />
          </div>
        </Hero>

        {/* ---------- where the money went ---------- */}
        {destinations.rows.length > 0 && (
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Where your payouts go</div>
                <div className="card-sub">
                  Last {data.history.length} payouts · {usd(destinations.sum)} across{' '}
                  {destinations.rows.length} destination{destinations.rows.length === 1 ? '' : 's'}
                </div>
              </div>
            </div>
            <div className={s.dest}>
              {destinations.rows.map(([method, v], i) => (
                <div className={s.drow} key={method}>
                  <i style={{ background: DEST_COLOURS[i % DEST_COLOURS.length] }} />
                  <span className={s.dname}>
                    {method}
                    <small>{v.count} payout{v.count === 1 ? '' : 's'}</small>
                  </span>
                  <span className={s.dbar}>
                    <i
                      style={{
                        width: pct0(v.total / destinations.sum),
                        background: DEST_COLOURS[i % DEST_COLOURS.length],
                      }}
                    />
                  </span>
                  <span className="qty">{usd(v.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------- destinations ---------- */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Payout methods</div>
              <div className="card-sub">Verified against your partner name before first use</div>
            </div>
            <button className="btn btn-sm" onClick={() => setAdding(true)}><PlusIcon /> Add method</button>
          </div>

          {methods.length === 0 ? (
            <div className={s.mempty}>
              No payout destinations yet. Add one to withdraw your balance.
            </div>
          ) : (
            <div className={s.methods}>
              {methods.map((m) => {
                const Icon = METHOD_ICON[m.kind];
                return (
                  <div className={s.method} key={m.id} data-sel={m.isDefault ?? false}>
                    <div className={s.mtop}>
                      <span className={s.mico}><Icon /></span>
                      <div className={s.mhead}>
                        <div className={s.mlabel}>
                          {m.label}
                          {m.isDefault && <span className="chip c-paid">Default</span>}
                        </div>
                        <div className={s.mdetail}>{m.detail}</div>
                      </div>
                    </div>

                    <div className={s.mterms}>{m.terms}</div>

                    <div className={s.mactions}>
                      <button
                        className={s.mact}
                        disabled={m.isDefault}
                        onClick={() => setDefault(m.id)}
                      >
                        {m.isDefault ? 'Default' : 'Make default'}
                      </button>
                      <button
                        className={`${s.mact} ${s.danger}`}
                        disabled={methods.length === 1}
                        onClick={() => remove(m.id)}
                        aria-label={`Remove ${m.label}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="notice">
            <InfoIcon />
            <div>
              Payouts above {usdWhole(data.manualApprovalAbove)} need manual approval and settle the next
              business day. Bank details must match your verified name.
            </div>
          </div>
        </div>

        {/* ---------- rules ---------- */}
        <div className="two">
          <div className="card">
            <div className="card-head"><div className="card-title">Payout history</div></div>
            <DataList columns={columns} rows={data.history} rowKey={(p) => p.id} empty="No payouts history yet." />
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">How payouts work</div></div>
            <Feed rows={rules} />
          </div>
        </div>
      </div>

      <PayoutRequestModal
        open={requesting}
        data={{ ...data, methods }}
        onClose={() => setRequesting(false)}
        onSuccess={handlePayoutSuccess}
      />
      <AddMethodModal
        open={adding}
        onClose={() => setAdding(false)}
        onAdd={(method) => setMethods([...methods, method])}
      />
    </section>
  );
};
