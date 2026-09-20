import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PageHead } from '../../components/PageHead';
import { DataList, type Col } from '../../components/DataList';
import { Select } from '../../components/Select';
import { Feed, type FeedRow } from '../../components/Feed';
import { StatusChip } from '../../components/StatusChip';
import { Who } from '../../components/Who';
import { Skeleton } from '../../components/Skeleton';
import {
  Hero, HeroCta, HeroFacts, HeroFoot, HeroLabel, HeroNumber, HeroSplits, TierDial, TierMini,
} from '../../components/Hero';
import {
  BoxFlatIcon, CardPlainIcon, DollarIcon, DownloadIcon, TrendUpIcon,
  UsersTabIcon, WarningIcon,
} from '../../components/icons';
import { Credentials } from './Credentials';
import { referralLink } from '../../lib/referral';
import { EarningsChart } from './EarningsChart';
import { useNow, useOverview, usePartner, useSeries, useMergedTiers } from '../../api/hooks';
import { useIbReferralStats, useIbMyReferrals, useIbMonthlyCommission, useIbReferralActivity, useIbDashboard } from '../../api/ib.hooks';
import { useTierProgress } from '../../lib/useTierProgress';
import { accountTypeName } from '../../data/rates';
import {
  daysLeftInMonth, int, lots, monthYear, pct0, shortDate, signedPct, usd, usdWhole,
} from '../../lib/format';
import type { DistributionWindow, Referral } from '../../types';

const WINDOW_OPTIONS: { value: DistributionWindow; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

const ACTIVITY_ICONS: Record<string, ReactNode> = {
  commission: <TrendUpIcon strokeWidth={2} />,
  signup: <UsersTabIcon strokeWidth={2} />,
  settled: <CardPlainIcon strokeWidth={2} />,
  warning: <WarningIcon strokeWidth={2} />,
  upgrade: <BoxFlatIcon strokeWidth={2} />,
};

export const OverviewPage = () => {
  const now = useNow();
  const partner = usePartner();
  const overview = useOverview();
  const tiers = useMergedTiers();
  const [window, setWindow] = useState<DistributionWindow>('30d');
  const { points, ticks } = useSeries(window);

  // Live Backend IB Queries
  const { data: ibDashboard, isLoading: isDashboardLoading } = useIbDashboard();
  const { data: ibStats, isLoading: isStatsLoading } = useIbReferralStats();
  const { data: ibReferrals, isLoading: isRefsLoading } = useIbMyReferrals();
  const { data: ibMonthly, isLoading: isMonthlyLoading } = useIbMonthlyCommission();
  const { data: ibActivity, isLoading: isActivityLoading } = useIbReferralActivity();

  const isHeroLoading = isStatsLoading || isMonthlyLoading || isDashboardLoading;

  const balance = ibMonthly?.stats.availableBalance ?? ibStats?.totalCommission ?? 0;
  const lifetime = ibMonthly?.stats.totalEarnings ?? ibStats?.totalCommission ?? 0;
  const totalReferrals = ibStats?.totalReferrals ?? ibDashboard?.progress?.totalReferredClients ?? 0;
  const totalVolumeLots = ibStats?.totalLots ?? ibDashboard?.progress?.periodVolumeLots ?? 0;
  const code = ibStats?.referralCode || ibDashboard?.referralCode || partner.code || '';
  const link = referralLink(import.meta.env.VITE_USER_PANEL_URL, code);

  const referralRows: Referral[] = ibReferrals
    ? ibReferrals.map((r, i) => {
        const parts = r.name.split(' ');
        const initials = parts.map((p) => p[0]).slice(0, 2).join('').toUpperCase();
        return {
          id: `ref-${r.name}-${i}`,
          name: r.name,
          initials,
          email: r.email,
          accountId: r.email,
          accountType: 'standard',
          country: 'Global',
          status: r.status === 'active' ? 'active' : 'dormant',
          joinedAt: r.registeredAt,
          deposits: 0,
          volumeLots: r.totalLots,
          lifetime: Math.round(r.totalCommission * 100),
          thisMonth: Math.round(r.totalCommission * 100),
          lastTradeAt: r.registeredAt,
        };
      })
    : [];

  const mappedRecent = referralRows.slice(0, 5);

  const tier = useTierProgress(partner.tier, totalVolumeLots, totalReferrals, now, tiers);
  const nextName = tier.next?.shortName ?? tier.current.shortName;
  const lotsToGo = int(Math.ceil(tier.lotsRemaining));

  const activityRows: FeedRow[] = (ibActivity || []).slice(0, 5).map((a) => ({
    id: a.id,
    tone: a.tone,
    icon: ACTIVITY_ICONS[a.icon] || <DollarIcon strokeWidth={2} />,
    body: a.who ? <><b>{a.who}</b>{' '}{a.text}</> : a.text,
    time: a.meta,
    amount:
      a.amount === undefined
        ? undefined
        : a.amountStyle === 'whole'
          ? usdWhole(a.amount)
          : `+${usd(a.amount)}`,
  }));

  const columns: Col<Referral>[] = [
    {
      key: 'trader', header: 'Trader', mobile: 'primary',
      render: (r) => <Who initials={r.initials} name={r.name} id={r.accountId} />,
    },
    { key: 'account', header: 'Account', render: (r) => accountTypeName(r.accountType) },
    { key: 'joined', header: 'Joined', render: (r) => <span className="num">{shortDate(r.joinedAt)}</span> },
    { key: 'volume', header: 'Volume', align: 'right', render: (r) => `${lots(r.volumeLots)} lots` },
    { key: 'month', header: 'This month', align: 'right', mobile: 'value', render: (r) => usd(r.thisMonth) },
    { key: 'status', header: 'Status', mobile: 'status', render: (r) => <StatusChip status={r.status} /> },
  ];

  return (
    <section className="wrap view">
      <PageHead
        eyebrow="Partnerships"
        title="Overview"
        sub={`${monthYear(now)} · ${daysLeftInMonth(now)} days left in the qualifying month`}
        actions={
          <>
            <Link className="btn" to="/marketing"><DownloadIcon /> Resources</Link>
            <Link className="btn btn-dark" to="/payouts"><CardPlainIcon /> Request payout</Link>
          </>
        }
      />

      <div className="stack">
        <Hero>
          <div>
            <HeroLabel>Available to withdraw</HeroLabel>
            <HeroNumber>
              {isHeroLoading ? <Skeleton dark width="160px" height="40px" /> : usd(balance * 100)}
            </HeroNumber>
            <HeroFoot>
              <span className="pill">
                <TrendUpIcon /> {signedPct(overview.commissionDeltaPct)} vs last month
              </span>
            </HeroFoot>
            <HeroFacts
              items={[
                {
                  value: isHeroLoading ? <Skeleton dark width="65px" height="16px" /> : usdWhole(lifetime * 100),
                  label: 'lifetime',
                },
                {
                  value: isHeroLoading
                    ? <Skeleton dark width="65px" height="16px" />
                    : usdWhole(ibMonthly?.stats.totalWithdrawn ? Math.round(ibMonthly.stats.totalWithdrawn * 100) : 0),
                  label: 'paid out',
                },
                {
                  value: isHeroLoading
                    ? <Skeleton dark width="65px" height="16px" />
                    : usd(ibStats ? Math.round(ibStats.commissionRate * 100) : 0),
                  label: 'rate per lot',
                },
              ]}
            />
            <HeroCta>
              <Link className="btn btn-white btn-sm" to="/payouts">Withdraw</Link>
              <Link className="btn btn-ghost btn-sm" to="/commissions">View ledger</Link>
            </HeroCta>
            <TierMini
              tier={partner.tier}
              name={tier.current.name}
              progress={tier.pctToNext}
              note={`${lotsToGo} lots to ${nextName} · Tier ${partner.tier < 10 ? `0${partner.tier}` : partner.tier} of ${tiers.length < 10 ? `0${tiers.length}` : tiers.length}`}
            />
            <HeroSplits
              items={[
                {
                  label: 'Referrals',
                  value: isHeroLoading ? <Skeleton dark width="50px" height="20px" /> : int(totalReferrals),
                },
                {
                  label: 'Volume · Total',
                  value: isHeroLoading ? <Skeleton dark width="60px" height="20px" /> : lots(totalVolumeLots),
                },
                {
                  label: 'Commission · Total',
                  value: isHeroLoading ? <Skeleton dark width="60px" height="20px" /> : usdWhole(lifetime * 100),
                },
              ]}
            />
          </div>

          <TierDial
            tier={partner.tier}
            progress={tier.pctToNext}
            caption={`${pct0(tier.pctToNext)} to ${nextName}`}
            label={`Tier ${partner.tier < 10 ? `0${partner.tier}` : partner.tier} of ${tiers.length < 10 ? `0${tiers.length}` : tiers.length}`}
            name={tier.current.name}
          />
        </Hero>

        <Credentials link={link} code={code} loading={isStatsLoading} />

        <div className="two">
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Earnings trend</div>
                <div className="card-sub">Daily commission accrual</div>
              </div>
              <Select
                ariaLabel="Chart period"
                value={window}
                options={WINDOW_OPTIONS}
                onChange={setWindow}
              />
            </div>
            <EarningsChart points={points} ticks={ticks} />
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Activity</div></div>
            <Feed rows={activityRows} loading={isActivityLoading} empty="No referral or trading activity yet." />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Recent referrals</div>
            <Link className="btn btn-sm" to="/referrals">View all {isStatsLoading ? '…' : totalReferrals}</Link>
          </div>
          <DataList
            columns={columns}
            rows={mappedRecent}
            rowKey={(r) => r.id}
            loading={isRefsLoading}
            empty="No referrals registered yet."
          />
        </div>
      </div>
    </section>
  );
};
