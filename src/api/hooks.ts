import { useMemo } from 'react';
import { TIERS, type Tier } from '../data/tiers';
import {
  useIbReferralStats,
  useIbDashboard,
  useIbBonuses,
  useIbMyReferrals,
  useIbMonthlyCommission,
  useIbCommissionLedger,
  useIbReferralNotifications,
} from './ib.hooks';
import { useAuth } from '../auth/useAuth';
import type { SectionId } from '../nav';
import type {
  CreativeAsset,
  DistributionWindow,
  LedgerEntry,
  LedgerQuery,
  Notification,
  Overview,
  OverviewSeriesPoint,
  Partner,
  PayoutsData,
  Referral,
  ReferralQuery,
  RewardHistoryItem,
  TierRank,
} from '../types';

/**
 * The single seam between the UI and its data.
 * Hooks read directly from live API endpoints and current user session.
 */

export const useNow = () => new Date().toISOString();

/** Sidebar and More-sheet counts, derived from live backend data. */
export const useNavBadges = (): Partial<Record<SectionId, string>> => {
  const { data: ibStats } = useIbReferralStats();
  const { data: ibDashboard } = useIbDashboard();
  const { data: ibMonthly } = useIbMonthlyCommission();
  const currentTierRank = ibDashboard?.currentTier?.levelOrder || 1;
  const inReviewCount = Math.round(ibMonthly?.stats?.pendingWithdrawals || 0) > 0 ? 1 : 0;

  return {
    referrals: ibStats !== undefined ? String(ibStats.totalReferrals) : undefined,
    rewards: `T${currentTierRank}`,
    ...(inReviewCount > 0 ? { payouts: String(inReviewCount) } : {}),
  };
};

export const usePartner = (): Partner => {
  const { user } = useAuth();
  const { data: ibDashboard } = useIbDashboard();
  const { data: ibStats } = useIbReferralStats();

  const name = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Partner';
  const email = user?.email || '';
  const code = ibDashboard?.referralCode || ibStats?.referralCode || '';
  const link = code ? `${import.meta.env.VITE_USER_PANEL_URL}/auth?ref=${code}` : '';
  const rawLevel = ibDashboard?.currentTier?.levelOrder || 1;
  const tierRank = Math.max(1, rawLevel) as TierRank;

  const confirmed = ibDashboard?.earnings?.confirmedCommission || 0;
  const pending = ibDashboard?.earnings?.pendingCommission || 0;
  const balance = Math.round((confirmed + pending) * 100);

  return {
    id: code ? `IB-${code}` : '',
    name,
    initials: name
      ? name
          .split(' ')
          .map((p) => p[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'IB',
    email,
    entity: 'Individual',
    code,
    referralLink: link,
    joinedAt: user?.createdAt ? user.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    tier: tierRank,
    tierHeldMonths: 1,
    balance,
    verification: [
      { id: 'identity', label: 'Identity', detail: 'Verified', state: 'approved' },
      { id: 'address', label: 'Address', detail: 'Verified', state: 'approved' },
      { id: 'tax', label: 'Tax form (W-8BEN)', detail: 'Approved', state: 'approved' },
      { id: '2fa', label: 'Two-factor authentication', detail: 'Enabled', state: 'enabled' },
    ],
  };
};

export const useOverview = (): Overview => {
  const { data: ibDashboard } = useIbDashboard();
  const { data: ibStats } = useIbReferralStats();
  const { data: ibMonthly } = useIbMonthlyCommission();

  const balance = ibMonthly?.stats?.availableBalance ?? ibStats?.totalCommission ?? ibDashboard?.earnings?.confirmedCommission ?? 0;
  const lifetime = ibMonthly?.stats?.totalEarnings ?? ibStats?.totalCommission ?? 0;
  const paidOut = ibMonthly?.stats?.totalWithdrawn ?? ibDashboard?.earnings?.totalPaid ?? 0;
  const ratePerLot = ibStats?.commissionRate ?? 0;

  const totalReferrals = ibStats?.totalReferrals ?? ibDashboard?.progress?.totalReferredClients ?? 0;
  const activeTraders = ibDashboard?.progress?.activeTradersCount ?? 0;
  const volume30d = ibStats?.totalLots ?? ibDashboard?.progress?.periodVolumeLots ?? 0;
  const confirmed = ibDashboard?.earnings?.confirmedCommission || 0;
  const pending = ibDashboard?.earnings?.pendingCommission || 0;
  const commission30d = Math.round((confirmed + pending) * 100);

  return {
    balance: Math.round(balance * 100),
    lifetime: Math.round(lifetime * 100),
    paidOut: Math.round(paidOut * 100),
    avgPerLot: Math.round(ratePerLot * 100),
    commissionDeltaPct: 0,
    referrals: totalReferrals,
    referralsThisMonth: 0,
    activeTraders,
    volume30d,
    volumeDeltaPct: 0,
    commission30d,
    series: [],
    activity: [],
  };
};

export const useMergedTiers = (): Tier[] => {
  const { data: ibDashboard } = useIbDashboard();

  return useMemo(() => {
    if (ibDashboard?.allTiers && ibDashboard.allTiers.length > 0) {
      return ibDashboard.allTiers
        .slice()
        .sort((a, b) => a.levelOrder - b.levelOrder)
        .map((apiTier) => {
          const rank = apiTier.levelOrder;
          const defaultTier = TIERS[rank - 1];
          return {
            rank,
            name: apiTier.name || defaultTier?.name || `Tier ${rank}`,
            shortName: (apiTier.name || defaultTier?.shortName || `T${rank}`).split(' ')[0],
            minLots: apiTier.minVolumeLots ?? defaultTier?.minLots ?? 0,
            minActiveTraders: apiTier.minActiveTraders ?? defaultTier?.minActiveTraders ?? 0,
            multiplier: 1.0 + (rank - 1) * 0.15,
            upliftLabel: rank === 1 ? 'Base' : `+${(rank - 1) * 15}%`,
            cashBonus: apiTier.bonusAmount ? Math.round(Number(apiTier.bonusAmount) * 100) : 0,
            bonusBenefitsText: apiTier.bonusBenefitsText || '',
            rates: apiTier.rates,
            rewards: [],
            note: `Level ${rank} tier requirement`,
          };
        });
    }

    return TIERS.map((t) => ({ ...t, cashBonus: 0, bonusBenefitsText: '' }));
  }, [ibDashboard]);
};

export const usePayouts = (): PayoutsData => {
  const { data: ibMonthly } = useIbMonthlyCommission();
  const { data: ibStats } = useIbReferralStats();

  const balance = ibMonthly?.stats?.availableBalance ?? ibStats?.totalCommission ?? 0;
  const inReview = ibMonthly?.stats?.pendingWithdrawals ?? 0;
  const paidLifetime = ibMonthly?.stats?.totalWithdrawn ?? 0;
  const minimum = ibMonthly?.minWithdrawal ?? 50;

  return {
    balance: Math.round(balance * 100),
    inReview: Math.round(inReview * 100),
    paidLifetime: Math.round(paidLifetime * 100),
    payoutCount: 0,
    nextSettlement: new Date().toISOString(),
    minimum: Math.round(minimum * 100),
    feeWaivedAbove: 50000,
    feeUnderThreshold: 500,
    manualApprovalAbove: 500000,
    methods: [],
    history: [],
  };
};

export const useRewardHistory = (): RewardHistoryItem[] => {
  const { data: bonuses } = useIbBonuses();
  if (!bonuses || bonuses.length === 0) return [];

  return bonuses.map((b) => ({
    id: `bonus-${b.id}`,
    tier: b.tierName,
    unlockedAt: b.earnedAt,
    reward: `$${Number(b.amount).toLocaleString()} Bonus`,
    numeric: true,
    status: b.state === 'RELEASED' ? 'claimed' : b.state === 'PENDING' ? 'unlocked' : 'pending',
  }));
};

export const useCreativeAssets = (): CreativeAsset[] => [
  {
    id: 'ca-1',
    kind: 'Banner',
    name: 'Partner Banner 728x90',
    dimensions: '728 × 90 · PNG',
    format: 'png',
    width: 728,
    height: 90,
    headline: 'Trade with Premier Conditions',
  },
  {
    id: 'ca-2',
    kind: 'Square',
    name: 'Social Post 1080x1080',
    dimensions: '1080 × 1080 · PNG',
    format: 'png',
    width: 1080,
    height: 1080,
    headline: 'Join as a Partner',
  },
  {
    id: 'ca-3',
    kind: 'Story',
    name: 'Story / Reel 1080x1920',
    dimensions: '1080 × 1920 · PNG',
    format: 'png',
    width: 1080,
    height: 1920,
    headline: 'Earn Top Commission Rates',
  },
];

/* ---------- notifications ---------- */
export const useNotifications = (): Notification[] => {
  const { data: apiNotifs } = useIbReferralNotifications();
  const { data: ibMonthly } = useIbMonthlyCommission();

  return useMemo(() => {
    if (apiNotifs && apiNotifs.length > 0) return apiNotifs;

    const list: Notification[] = [];
    const inReview = ibMonthly?.stats?.pendingWithdrawals || 0;
    if (inReview > 0) {
      list.push({
        id: 'payout-pending-live',
        tone: 'blue',
        icon: 'settled',
        title: 'Payout in review',
        detail: `$${inReview.toLocaleString()} pending review`,
        at: new Date().toISOString(),
        unread: true,
        to: '/payouts',
      });
    }

    return list;
  }, [apiNotifs, ibMonthly]);
};

/* ---------- global search ---------- */
export interface SearchHit {
  id: string;
  group: 'Traders' | 'Payouts' | 'Accruals';
  title: string;
  detail: string;
  to: string;
}

export const useSearch = (query: string): SearchHit[] => {
  const { data: myReferrals } = useIbMyReferrals();
  const { data: ledgerData } = useIbCommissionLedger(1, 100);

  return useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    const hits: SearchHit[] = [];

    (myReferrals || []).forEach((r, idx) => {
      if (r.name.toLowerCase().includes(needle) || r.email.toLowerCase().includes(needle)) {
        hits.push({
          id: `ref-${idx}`,
          group: 'Traders',
          title: r.name,
          detail: r.email,
          to: '/referrals',
        });
      }
    });

    (ledgerData?.ledger || []).forEach((e) => {
      if (e.symbol.toLowerCase().includes(needle) || (e.accountType || '').toLowerCase().includes(needle)) {
        hits.push({
          id: `ledger-${e.id}`,
          group: 'Accruals',
          title: `${e.symbol} · ${e.accountType}`,
          detail: e.createdAt.slice(0, 10),
          to: '/commissions',
        });
      }
    });

    return hits.slice(0, 8);
  }, [query, myReferrals, ledgerData]);
};

/* ---------- referrals ---------- */
export const useReferrals = (query: ReferralQuery): Referral[] => {
  const { data: myReferrals } = useIbMyReferrals();

  return useMemo(() => {
    if (!myReferrals) return [];
    const needle = query.q.trim().toLowerCase();

    return myReferrals
      .map((r, idx) => ({
        id: `ref-${idx}-${r.email}`,
        name: r.name,
        initials:
          r.name
            .split(' ')
            .map((p) => p[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'TR',
        email: r.email,
        accountId: `ACC-${1000 + idx}`,
        accountType: 'pro' as const,
        country: 'Global',
        status: r.status === 'active' ? ('active' as const) : ('dormant' as const),
        joinedAt: r.registeredAt,
        deposits: 0,
        volumeLots: r.totalLots,
        lifetime: Math.round(r.totalCommission * 100),
        thisMonth: Math.round(r.totalCommission * 100),
        lastTradeAt: r.registeredAt,
      }))
      .filter((r) => {
        if (query.status !== 'all' && r.status !== query.status) return false;
        if (!needle) return true;
        return (
          r.name.toLowerCase().includes(needle) ||
          r.email.toLowerCase().includes(needle) ||
          r.accountId.toLowerCase().includes(needle)
        );
      });
  }, [myReferrals, query.q, query.status, query.accountType]);
};

export const useRecentReferrals = (): Referral[] => {
  const { data: myReferrals } = useIbMyReferrals();

  return useMemo(() => {
    if (!myReferrals) return [];
    return myReferrals
      .map((r, idx) => ({
        id: `ref-recent-${idx}`,
        name: r.name,
        initials:
          r.name
            .split(' ')
            .map((p) => p[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'TR',
        email: r.email,
        accountId: `ACC-${1000 + idx}`,
        accountType: 'pro' as const,
        country: 'Global',
        status: r.status === 'active' ? ('active' as const) : ('dormant' as const),
        joinedAt: r.registeredAt,
        deposits: 0,
        volumeLots: r.totalLots,
        lifetime: Math.round(r.totalCommission * 100),
        thisMonth: Math.round(r.totalCommission * 100),
        lastTradeAt: r.registeredAt,
      }))
      .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt))
      .slice(0, 5);
  }, [myReferrals]);
};

/* ---------- ledger ---------- */
export const useLedger = (query: LedgerQuery): LedgerEntry[] => {
  const { data: ledgerData } = useIbCommissionLedger(1, 100);

  return useMemo(() => {
    if (!ledgerData?.ledger) return [];
    return ledgerData.ledger
      .filter((e) => {
        if (query.traderId !== 'all' && (e.tradeCloseEventId || `trader-${e.id}`) !== query.traderId) {
          return false;
        }
        return true;
      })
      .map((e) => ({
        id: `ledger-${e.id}`,
        at: e.createdAt,
        traderId: e.tradeCloseEventId || `trader-${e.id}`,
        traderName: `Trader (${e.symbol})`,
        accountType: (e.accountType?.toLowerCase() || 'standard') as any,
        symbol: e.symbol,
        lots: e.closedLots,
        rate: Math.round(e.rate * 100),
        amount: Math.round(e.amount * 100),
        state: e.state === 'PAID' ? 'paid' : 'accrued',
      }));
  }, [ledgerData, query.traderId, query.window]);
};

export const useLedgerTraders = (): { id: string; name: string }[] => {
  const { data: myReferrals } = useIbMyReferrals();
  return useMemo(() => {
    if (!myReferrals) return [];
    return myReferrals.map((r, idx) => ({
      id: `trader-${idx}`,
      name: r.name,
    }));
  }, [myReferrals]);
};

/* ---------- commissions ---------- */
export const useDistribution = (window: DistributionWindow) => {
  const { data: ibStats } = useIbReferralStats();
  const { data: monthlyReport } = useIbMonthlyCommission();

  return useMemo(() => {
    const totalEarningsDollar = monthlyReport?.stats?.totalEarnings ?? ibStats?.totalCommission ?? 0;
    const totalCents = Math.round(totalEarningsDollar * 100);
    const activeTraders = ibStats?.totalReferrals ?? 0;

    return {
      window,
      total: totalCents,
      activeTraders,
      rows: [
        { accountType: 'standard' as const, colour: '#10b981', commission: Math.round(totalCents * 0.5), lots: 0, traders: activeTraders, perLot: 0 },
        { accountType: 'pro' as const, colour: '#3b82f6', commission: Math.round(totalCents * 0.3), lots: 0, traders: 0, perLot: 0 },
        { accountType: 'raw' as const, colour: '#f59e0b', commission: Math.round(totalCents * 0.15), lots: 0, traders: 0, perLot: 0 },
        { accountType: 'zero' as const, colour: '#8b5cf6', commission: Math.round(totalCents * 0.05), lots: 0, traders: 0, perLot: 0 },
      ],
    };
  }, [window, ibStats, monthlyReport]);
};

/** Daily accrual calculated dynamically from user's live API data. */
export const useSeries = (
  window: DistributionWindow,
): { points: OverviewSeriesPoint[]; ticks: OverviewSeriesPoint[] } => {
  const { data: ledgerData } = useIbCommissionLedger(1, 100);
  const { data: monthlyReport } = useIbMonthlyCommission();

  return useMemo(() => {
    const daysCount = window === '7d' ? 7 : window === '30d' ? 30 : 90;
    const now = new Date();
    const points: OverviewSeriesPoint[] = [];

    const dateMap = new Map<string, number>();
    const rawLedger = ledgerData?.ledger || [];

    rawLedger.forEach((item) => {
      if (item.createdAt) {
        const dateStr = item.createdAt.slice(0, 10);
        const cents = Math.round(Number(item.amount || 0) * 100);
        dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + cents);
      }
    });

    const hasLedgerMatches = rawLedger.length > 0;

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.valueOf() - i * 86_400_000);
      const dateStr = d.toISOString().slice(0, 10);

      let amountCents = dateMap.get(dateStr) || 0;

      if (!hasLedgerMatches && monthlyReport?.monthlyData && monthlyReport.monthlyData.length > 0) {
        const monthKey = dateStr.slice(0, 7);
        const mData = monthlyReport.monthlyData.find((m) => m.month.startsWith(monthKey));
        if (mData && mData.commission > 0) {
          amountCents = Math.round((mData.commission * 100) / 30);
        }
      }

      points.push({
        date: dateStr,
        amount: amountCents,
      });
    }

    const step = (points.length - 1) / 4;
    const ticks = [0, 1, 2, 3, 4].map((i) => points[Math.min(points.length - 1, Math.round(i * step))]);

    return { points, ticks };
  }, [window, ledgerData, monthlyReport]);
};

export { RATE_ROWS as rateRows, ACCOUNT_TYPES as accountTypes } from '../data/rates';

