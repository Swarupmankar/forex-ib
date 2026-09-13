import { apiClient } from './client';
import type { ActivityItem, Notification } from '../types';

export interface IbReferralStats {
  referralCode: string;
  totalReferrals: number;
  totalLots: number;
  totalCommission: number;
  commissionRate: number;
  canWithdraw: boolean;
}

export interface ReferredUserItem {
  name: string;
  email: string;
  registeredAt: string;
  status: 'active' | 'inactive';
  totalLots: number;
  totalCommission: number;
  monthlyCommission?: Record<string, number>;
}

export interface MonthlyCommissionRow {
  month: string;
  referrals: number;
  totalLots: number;
  commission: number;
  status: string;
  paymentDate?: string | null;
  method?: string | null;
  paidForMonth: number;
  pendingForMonth: number;
  remainingForMonth: number;
}

export interface MonthlyCommissionReport {
  monthlyData: MonthlyCommissionRow[];
  stats: {
    availableBalance: number;
    pendingWithdrawals: number;
    grossAvailable: number;
    readyForWithdrawal: number;
    totalEarnings: number;
    totalWithdrawn: number;
    currentMonth: {
      earnings: number;
      lots: number;
    };
  };
  minWithdrawal: number;
}

export interface CommissionTierItem {
  id: number;
  brokerId: number;
  minLots: number;
  maxLots: number | null;
  ratePerLot: number;
  benefits?: string;
}

export interface IbDashboardData {
  referralCode: string;
  assignedManager: string;
  payoutHold: boolean;
  isSuspended: boolean;
  currentTier: {
    id: number;
    name: string;
    levelOrder: number;
    effectiveFrom: string;
    bonusBenefitsText: string;
  };
  nextTier: {
    id: number;
    name: string;
    minVolumeLots: number;
    minActiveTraders: number;
    bonusBenefitsText?: string;
  } | null;
  allTiers?: Array<{
    id: number;
    name: string;
    levelOrder: number;
    minVolumeLots: number;
    minActiveTraders: number;
    bonusAmount: number;
    bonusBenefitsText?: string;
    rates?: Record<string, Record<string, number>>;
  }>;
  progress: {
    periodVolumeLots: number;
    activeTradersCount: number;
    totalReferredClients: number;
    volumeProgressPercent: number;
    tradersProgressPercent: number;
  };
  riskStatus: {
    isAtRisk: boolean;
    firstFailedAt?: string;
    consecutiveFailedEvaluations?: number;
  };
  earnings: {
    pendingCommission: number;
    confirmedCommission: number;
    paidCommission: number;
    totalPaid: number;
    bonusPending: number;
  };
}

export interface IbLedgerRow {
  id: number;
  tradeCloseEventId?: string;
  symbol: string;
  accountType: string;
  closedLots: number;
  rate: number;
  amount: number;
  state: string;
  skipReason?: string;
  createdAt: string;
}

export interface IbBonusRow {
  id: number;
  tierName: string;
  amount: number;
  awardType: string;
  state: string;
  notes?: string;
  earnedAt: string;
  paidAt?: string;
}

export const ibApi = {
  async getReferralStats(): Promise<IbReferralStats> {
    const res = await apiClient.get<IbReferralStats>('/ib/referral/stats');
    return res.data;
  },

  async getMyReferrals(): Promise<ReferredUserItem[]> {
    const res = await apiClient.get<{ referrals: ReferredUserItem[] }>('/ib/referral/my-referrals');
    return res.data.referrals || [];
  },

  async getMonthlyCommission(): Promise<MonthlyCommissionReport> {
    const res = await apiClient.get<MonthlyCommissionReport>('/ib/referral/commission/monthly');
    return res.data;
  },

  async getCommissionTiers(): Promise<CommissionTierItem[]> {
    const res = await apiClient.get<{ tiers: CommissionTierItem[] }>('/ib/referral/commission-tiers');
    return res.data.tiers || [];
  },

  async getReferralActivity(): Promise<ActivityItem[]> {
    const res = await apiClient.get<{ activity: ActivityItem[] }>('/ib/referral/activity');
    return res.data.activity || [];
  },

  async getReferralNotifications(): Promise<Notification[]> {
    const res = await apiClient.get<{ notifications: Notification[] }>('/ib/referral/notifications');
    return res.data.notifications || [];
  },

  async getIbDashboard(): Promise<IbDashboardData> {
    const res = await apiClient.get<{ success: boolean; data: IbDashboardData }>('/ib/referral/dashboard');
    return res.data.data;
  },

  async getIbCommissionLedger(page = 1, limit = 20): Promise<{ ledger: IbLedgerRow[]; pagination: any }> {
    const res = await apiClient.get<{ success: boolean; data: { ledger: IbLedgerRow[]; pagination: any } }>(
      `/ib/referral/commission-ledger?page=${page}&limit=${limit}`
    );
    return res.data.data;
  },

  async getIbBonuses(): Promise<IbBonusRow[]> {
    const res = await apiClient.get<{ success: boolean; data: IbBonusRow[] }>('/ib/referral/bonuses');
    return res.data.data;
  },
};
