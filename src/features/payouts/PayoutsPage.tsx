import { useMemo, useState } from 'react';
import { PageHead } from '../../components/PageHead';
import { DataList, type Col } from '../../components/DataList';
import { Feed, type FeedRow } from '../../components/Feed';
import { Hero, HeroCta, HeroFoot, HeroLabel, HeroNote, HeroNumber, HeroSplits } from '../../components/Hero';
import { Skeleton } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import { CardPlainIcon, DollarIcon, DownloadIcon, ShieldIcon, TrendUpIcon } from '../../components/icons';
import { WithdrawModal } from './WithdrawModal';
import { useNow } from '../../api/hooks';
import { useIbWallet, useIbWalletTransactions } from '../../api/wallet.hooks';
import type { WalletTransaction } from '../../api/wallet.api';
import { downloadCsv, stampedName } from '../../lib/download';
import { int, stamp, usd, usdSigned, usdWhole } from '../../lib/format';

/**
 * The IB wallet. Commission is paid in here the moment a referred client's
 * trade closes, and this is the only place it can be withdrawn from -- drawn
 * on the broker's separate IB payout wallet, never on user deposits.
 *
 * Everything on this page is the backend's number. There is no local history
 * and no saved destinations: the address is entered per withdrawal, the same
 * way the user portal does it.
 */

const cents = (v: string | number | null | undefined) => Math.round(Number(v ?? 0) * 100);

const TYPE: Record<WalletTransaction['action'], string> = {
  IB_COMMISSION: 'IB commission',
  WITHDRAW: 'Withdrawal',
  DEPOSIT: 'Deposit',
  TRANSFER: 'Transfer',
};

const STATUS: Record<WalletTransaction['status'], { label: string; cls: string }> = {
  COMPLETED: { label: 'Completed', cls: 'c-active' },
  PENDING: { label: 'Processing', cls: 'c-dormant' },
  FAILED: { label: 'Rejected', cls: 'c-churned' },
};

/** Commission comes in, a withdrawal goes out. */
const signed = (t: WalletTransaction) => (t.action === 'WITHDRAW' ? -cents(t.amount) : cents(t.amount));

const columns: Col<WalletTransaction>[] = [
  { key: 'when', header: 'Date', mobile: 'secondary', render: (t) => <span className="num">{stamp(t.createdAt)}</span> },
  { key: 'type', header: 'Type', mobile: 'primary', render: (t) => TYPE[t.action] ?? t.action },
  {
    key: 'detail', header: 'Details',
    render: (t) =>
      t.action === 'WITHDRAW'
        ? <span className="num" title={t.to ?? ''}>{t.to ? `${t.to.slice(0, 8)}…${t.to.slice(-6)}` : '—'}</span>
        : (t.from ?? '—'),
  },
  {
    key: 'amount', header: 'Amount', align: 'right', mobile: 'value',
    render: (t) => usdSigned(signed(t)),
  },
  {
    key: 'status', header: 'Status', mobile: 'status',
    render: (t) => <span className={`chip ${STATUS[t.status].cls}`}>{STATUS[t.status].label}</span>,
  },
];

export const PayoutsPage = () => {
  const now = useNow();
  const toast = useToast();
  const { data: account, isLoading: accountLoading } = useIbWallet();
  const { data: rows = [], isLoading: rowsLoading } = useIbWalletTransactions();
  const [withdrawing, setWithdrawing] = useState(false);

  const balance = account?.balance ?? 0;
  // The server gates on this too; here it only keeps the button honest.
  const minBalance = account?.minWithdrawBalance ?? 10;
  const canWithdraw = balance >= minBalance;

  const totals = useMemo(() => {
    let received = 0; let withdrawn = 0; let inFlight = 0;
    rows.forEach((t) => {
      if (t.action === 'IB_COMMISSION' && t.status === 'COMPLETED') received += cents(t.amount);
      if (t.action === 'WITHDRAW' && t.status === 'COMPLETED') withdrawn += cents(t.amount);
      if (t.action === 'WITHDRAW' && t.status === 'PENDING') inFlight += cents(t.amount);
    });
    return { received, withdrawn, inFlight };
  }, [rows]);

  const exportHistory = () => {
    if (rows.length === 0) {
      toast('Nothing to export', 'No wallet activity yet.', 'warn');
      return;
    }
    downloadCsv(
      stampedName('ib-wallet-history', now, 'csv'),
      ['Date', 'Type', 'Details', 'Amount (USD)', 'Status', 'Tx hash'],
      rows.map((t) => [
        t.createdAt, TYPE[t.action] ?? t.action, t.action === 'WITHDRAW' ? (t.to ?? '') : (t.from ?? ''),
        (signed(t) / 100).toFixed(2), STATUS[t.status].label, t.txHash ?? '',
      ]),
    );
    toast('Wallet history downloaded', `${rows.length} rows as CSV.`);
  };

  const rules: FeedRow[] = [
    {
      id: 'credit', tone: 'green', icon: <TrendUpIcon />,
      body: <b>Paid in as it is earned</b>,
      time: 'Every closed trade by a referred client credits this wallet straight away. No monthly request, no waiting for approval.',
    },
    {
      id: 'fees', tone: 'blue', icon: <DollarIcon />,
      body: <b>Fees are shown before you confirm</b>,
      time: 'You enter dollars. The quote shows the coin you receive, the service fee, and the network fee — which on most coins your broker covers.',
    },
    {
      id: 'otp', tone: 'amber', icon: <ShieldIcon />,
      body: <b>Every withdrawal is verified</b>,
      time: 'A six-digit code goes to your email before anything leaves the wallet.',
    },
    {
      id: 'floor', tone: 'amber', icon: <CardPlainIcon />,
      body: <b>Withdrawals open at {usd(cents(minBalance))}</b>,
      time: 'Below that the balance keeps building. Small payouts are not worth the network fee.',
    },
  ];

  return (
    <section className="wrap view">
      <PageHead
        eyebrow="Growth"
        title="IB Wallet"
        sub="Where your commission lands, and where you withdraw it from."
        actions={
          <>
            <button className="btn" onClick={exportHistory}><DownloadIcon /> Export history</button>
            <button className="btn btn-dark" onClick={() => setWithdrawing(true)} disabled={!canWithdraw}>
              <CardPlainIcon /> Withdraw
            </button>
          </>
        }
      />

      <div className="stack">
        <Hero single secondOrb={false}>
          <div>
            <HeroLabel>Available to withdraw</HeroLabel>
            <HeroNumber>
              {accountLoading ? <Skeleton dark width="160px" height="40px" /> : usd(cents(balance))}
            </HeroNumber>
            <HeroFoot>
              <HeroNote>
                {canWithdraw
                  ? 'Withdraw to any supported coin · fees quoted before you confirm'
                  : `Withdrawals open once your balance reaches ${usd(cents(minBalance))}`}
              </HeroNote>
            </HeroFoot>
            <HeroCta>
              <button className="btn btn-white btn-sm" onClick={() => setWithdrawing(true)} disabled={!canWithdraw}>
                Withdraw
              </button>
            </HeroCta>
            <HeroSplits
              items={[
                { label: 'Commission received', value: rowsLoading ? <Skeleton dark width="60px" height="20px" /> : usdWhole(totals.received) },
                { label: 'Withdrawn', value: rowsLoading ? <Skeleton dark width="60px" height="20px" /> : usdWhole(totals.withdrawn) },
                { label: 'In flight', value: rowsLoading ? <Skeleton dark width="60px" height="20px" /> : usd(totals.inFlight) },
                { label: 'Transactions', value: rowsLoading ? <Skeleton dark width="40px" height="20px" /> : int(rows.length) },
              ]}
            />
          </div>
        </Hero>

        <div className="two">
          <div className="card">
            <div className="card-head"><div className="card-title">Wallet activity</div></div>
            <DataList columns={columns} rows={rows} rowKey={(t) => String(t.id)} empty="No wallet activity yet. Commission appears here as your clients trade." />
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">How the IB wallet works</div></div>
            <Feed rows={rules} />
          </div>
        </div>
      </div>

      <WithdrawModal open={withdrawing} balance={balance} onClose={() => setWithdrawing(false)} />
    </section>
  );
};
