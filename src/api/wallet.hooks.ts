import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletApi, type SubmitWithdrawInput, type WithdrawInput } from './wallet.api';
import { useAuth } from '../auth/useAuth';

const KEY = ['ib', 'wallet'] as const;

export function useIbWallet() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...KEY, 'account'],
    queryFn: () => walletApi.getAccount(),
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}

export function useIbWalletCurrencies() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...KEY, 'currencies'],
    queryFn: () => walletApi.getCurrencies(),
    enabled: isAuthenticated,
    // The coin menu changes when the broker does, not minute to minute. Rates
    // on it are a preview only; the quote is what prices a withdrawal.
    staleTime: 5 * 60_000,
  });
}

export function useIbWalletTransactions() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...KEY, 'transactions'],
    queryFn: () => walletApi.getTransactions(),
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}

/** Re-priced on every input change; nothing is cached, nothing is invalidated. */
export function useQuoteWithdraw() {
  return useMutation({ mutationFn: (input: WithdrawInput) => walletApi.quoteWithdraw(input) });
}

export function useRequestWithdrawOtp() {
  return useMutation({ mutationFn: () => walletApi.requestWithdrawOtp() });
}

/** A submitted withdrawal moves the balance and adds a row, so both are refetched. */
export function useSubmitWithdraw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitWithdrawInput) => walletApi.submitWithdraw(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEY });
    },
  });
}
