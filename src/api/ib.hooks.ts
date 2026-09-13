import { useQuery } from '@tanstack/react-query';
import { ibApi, type IbReferralStats, type ReferredUserItem, type MonthlyCommissionReport, type CommissionTierItem } from './ib.api';
import { useAuth } from '../auth/useAuth';
import type { ActivityItem, Notification } from '../types';

export function useIbReferralStats() {
  const { isAuthenticated } = useAuth();
  return useQuery<IbReferralStats>({
    queryKey: ['ib', 'referral', 'stats'],
    queryFn: () => ibApi.getReferralStats(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useIbMyReferrals() {
  const { isAuthenticated } = useAuth();
  return useQuery<ReferredUserItem[]>({
    queryKey: ['ib', 'referral', 'my-referrals'],
    queryFn: () => ibApi.getMyReferrals(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useIbMonthlyCommission() {
  const { isAuthenticated } = useAuth();
  return useQuery<MonthlyCommissionReport>({
    queryKey: ['ib', 'referral', 'commission', 'monthly'],
    queryFn: () => ibApi.getMonthlyCommission(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useIbCommissionTiers() {
  const { isAuthenticated } = useAuth();
  return useQuery<CommissionTierItem[]>({
    queryKey: ['ib', 'referral', 'commission-tiers'],
    queryFn: () => ibApi.getCommissionTiers(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useIbReferralActivity() {
  const { isAuthenticated } = useAuth();
  return useQuery<ActivityItem[]>({
    queryKey: ['ib', 'referral', 'activity'],
    queryFn: () => ibApi.getReferralActivity(),
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}

export function useIbReferralNotifications() {
  const { isAuthenticated } = useAuth();
  return useQuery<Notification[]>({
    queryKey: ['ib', 'referral', 'notifications'],
    queryFn: () => ibApi.getReferralNotifications(),
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}

export function useIbDashboard() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['ib', 'referral', 'dashboard'],
    queryFn: () => ibApi.getIbDashboard(),
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}

export function useIbCommissionLedger(page = 1, limit = 20) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['ib', 'referral', 'commission-ledger', page, limit],
    queryFn: () => ibApi.getIbCommissionLedger(page, limit),
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}

export function useIbBonuses() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['ib', 'referral', 'bonuses'],
    queryFn: () => ibApi.getIbBonuses(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}
