import { useState, useMemo } from 'react';
import { PageHead } from '../../components/PageHead';
import { DataList, type Col } from '../../components/DataList';
import { Select } from '../../components/Select';
import { StatusChip } from '../../components/StatusChip';
import { Who } from '../../components/Who';
import { useToast } from '../../components/Toast';
import { DownloadIcon, SearchIcon, UserPlusIcon } from '../../components/icons';
import { InviteModal } from './InviteModal';
import { useNow, usePartner } from '../../api/hooks';
import { useIbMyReferrals, useIbReferralStats } from '../../api/ib.hooks';
import { accountTypeName } from '../../data/rates';
import { downloadCsv, stampedName } from '../../lib/download';
import { lots, relativeDay, shortDate, usd, usdWhole } from '../../lib/format';
import type { AccountTypeId, Referral, ReferralStatus } from '../../types';

const STATUS_OPTIONS: { value: ReferralStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All status' },
  { value: 'active', label: 'Active' },
  { value: 'dormant', label: 'Dormant' },
  { value: 'unfunded', label: 'Unfunded' },
  { value: 'churned', label: 'Churned' },
];

const ACCOUNT_OPTIONS: { value: AccountTypeId | 'all'; label: string }[] = [
  { value: 'all', label: 'All accounts' },
  { value: 'standard', label: 'Standard' },
  { value: 'pro', label: 'Pro' },
  { value: 'raw', label: 'Raw Spread' },
  { value: 'zero', label: 'Zero' },
];

export const ReferralsPage = () => {
  const now = useNow();
  const partner = usePartner();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<ReferralStatus | 'all'>('all');
  const [accountType, setAccountType] = useState<AccountTypeId | 'all'>('all');
  const [inviting, setInviting] = useState(false);

  const { data: myReferrals, isLoading: isReferralsLoading } = useIbMyReferrals();
  const { data: ibStats } = useIbReferralStats();

  const code = ibStats?.referralCode || partner.code;
  const link = `https://aznxt.com/register?ref=${code}`;
  const partnerCreds = { ...partner, code, referralLink: link };

  const rows: Referral[] = useMemo(() => {
    if (!myReferrals || myReferrals.length === 0) {
      return [];
    }

    const needle = q.trim().toLowerCase();

    return myReferrals
      .map((r, idx) => {
        const initials = r.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'TR';

        const itemStatus: ReferralStatus = r.status === 'active' ? 'active' : 'dormant';
        const accountId = `ACC-${1000 + idx}`;

        return {
          id: `ref-live-${idx}-${r.email}`,
          name: r.name,
          initials,
          accountId,
          email: r.email,
          country: 'Global',
          accountType: 'pro' as AccountTypeId,
          status: itemStatus,
          joinedAt: r.registeredAt,
          deposits: 0,
          volumeLots: r.totalLots,
          lifetime: Math.round(r.totalCommission * 100),
          thisMonth: Math.round(r.totalCommission * 100),
          lastTradeAt: r.registeredAt,
        };
      })
      .filter((r) => {
        if (status !== 'all' && r.status !== status) return false;
        if (needle) {
          return (
            r.name.toLowerCase().includes(needle) ||
            r.email.toLowerCase().includes(needle) ||
            r.accountId.toLowerCase().includes(needle)
          );
        }
        return true;
      });
  }, [myReferrals, q, status]);

  const filtered = q.trim() !== '' || status !== 'all' || accountType !== 'all';

  const exportCsv = () => {
    if (rows.length === 0) {
      toast('Nothing to export', 'No referrals match the current filters.', 'warn');
      return;
    }
    downloadCsv(
      stampedName('ib-referrals', now, 'csv'),
      ['Trader', 'Account', 'Email', 'Account type', 'Joined',
        'Deposits (USD)', 'Volume (lots)', 'Lifetime (USD)', 'This month (USD)', 'Last trade', 'Status'],
      rows.map((r) => [
        r.name, r.accountId, r.email, accountTypeName(r.accountType), r.joinedAt,
        (r.deposits / 100).toFixed(2), r.volumeLots.toFixed(1),
        (r.lifetime / 100).toFixed(2), (r.thisMonth / 100).toFixed(2),
        r.lastTradeAt ?? '', r.status,
      ]),
    );
    toast(
      `Exported ${rows.length} referral${rows.length === 1 ? '' : 's'}`,
      filtered ? 'Current filters were applied.' : undefined,
    );
  };

  const columns: Col<Referral>[] = [
    {
      key: 'trader', header: 'Trader', mobile: 'primary',
      render: (r) => <Who initials={r.initials} name={r.name} id={r.accountId} />,
    },
    { key: 'account', header: 'Account type', mobile: 'secondary', render: (r) => accountTypeName(r.accountType) },
    { key: 'joined', header: 'Joined', render: (r) => <span className="num">{shortDate(r.joinedAt)}</span> },
    { key: 'deposits', header: 'Deposits', align: 'right', render: (r) => usdWhole(r.deposits) },
    { key: 'volume', header: 'Volume', align: 'right', render: (r) => lots(r.volumeLots) },
    { key: 'lifetime', header: 'Lifetime', align: 'right', render: (r) => usd(r.lifetime) },
    { key: 'month', header: 'This month', align: 'right', mobile: 'value', render: (r) => usd(r.thisMonth) },
    {
      key: 'last', header: 'Last trade',
      render: (r) => <span className="num">{relativeDay(r.lastTradeAt, now)}</span>,
    },
    { key: 'status', header: 'Status', mobile: 'status', render: (r) => <StatusChip status={r.status} /> },
  ];

  return (
    <section className="wrap view">
      <PageHead
        eyebrow="Partnerships"
        title="Referrals"
        sub="Every trader onboarded with your code, and what they earn you."
        actions={
          <>
            <button className="btn" onClick={exportCsv}><DownloadIcon /> Export CSV</button>
            <button className="btn btn-dark" onClick={() => setInviting(true)}>
              <UserPlusIcon /> Invite trader
            </button>
          </>
        }
      />

      <div className="card">
        <div className="toolbar">
          <label className="search">
            <SearchIcon />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email or account…"
            />
          </label>
          <Select ariaLabel="Filter by status" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
          <Select ariaLabel="Filter by account type" value={accountType} options={ACCOUNT_OPTIONS} onChange={setAccountType} />
        </div>

        <DataList
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          indentSecondary
          loading={isReferralsLoading}
          empty="No referrals match those filters."
        />
      </div>

      <InviteModal open={inviting} partner={partnerCreds} onClose={() => setInviting(false)} />
    </section>
  );
};
