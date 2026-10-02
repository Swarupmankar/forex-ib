import { apiClient } from './client';

/**
 * The IB wallet: the USD balance earned commission is paid into, and the only
 * place it can be withdrawn from. Mirrors the user portal's crypto wallet one
 * for one, on the `/ib/wallet` routes -- same quote, OTP and submit pipeline,
 * drawn on the broker's separate IB payout wallet.
 *
 * Money from these endpoints is in DOLLARS (a plain number), not minor units.
 * It is converted to cents at the render edge with `Math.round(x * 100)`, like
 * every other backend figure on this app.
 */

export interface IbWalletAccount {
  currency: string;
  kind: 'IB';
  balance: number;
  decimals: number;
  /** The wallet must hold at least this before a withdrawal is allowed. */
  minWithdrawBalance: number | null;
}

export interface WalletNetwork {
  /** CoinsBuy currency id. What the quote and the payout are keyed on. */
  currencyId: string;
  /** The chain in full, e.g. "Tron". */
  network: string;
  networkCode: string | null;
  standard: string | null;
  /** "USDT-TRC20", or just "BTC" for a native asset. */
  label: string;
  decimals: number;
  minWithdraw: number;
  needsTag: boolean;
}

export interface WalletCoin {
  coin: string;
  usdPerUnit: number | null;
  networks: WalletNetwork[];
}

export type WalletTransactionAction = 'IB_COMMISSION' | 'WITHDRAW' | 'DEPOSIT' | 'TRANSFER';
export type WalletTransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface WalletTransaction {
  id: number;
  action: WalletTransactionAction;
  status: WalletTransactionStatus;
  /** USD moved. */
  amount: string | number;
  currency: string | null;
  /** Coin sent on a withdrawal, in that coin's own units. */
  coinAmount: string | number | null;
  from: string | null;
  to: string | null;
  txHash: string | null;
  createdAt: string;
}

/**
 * What a withdrawal would cost, straight from the provider's dry run. The user
 * is debited `usdCost`, flat. `receiveAmount` is what lands on-chain -- below
 * `coinAmount` only when the network fee is taken out of the payout
 * (`isFeeIncluded`), which is also the only case the fee is the IB's cost.
 */
export interface WithdrawQuote {
  coin: string;
  network: string;
  label: string;
  decimals: number;
  coinAmount: number;
  receiveAmount: number;
  feeAmount: string | null;
  feeCurrencyCode: string | null;
  feeUsd: number | null;
  isFeeIncluded: boolean;
  serviceFee: number;
  usdCost: number;
  usdPerUnit: number;
  to: string;
  tag: string | null;
}

export interface WithdrawInput {
  currencyId: string;
  to: string;
  tag?: string;
  /** USD to withdraw. */
  amount: number;
}

export interface SubmitWithdrawInput extends WithdrawInput {
  otp: string;
  /** The quoted usdCost, sent back as a ceiling. */
  maxUsd: number;
  /** The quoted receiveAmount, sent back as a floor. */
  minCoinAmount: number;
}

export const walletApi = {
  async getAccount(): Promise<IbWalletAccount> {
    const res = await apiClient.get<{ account: IbWalletAccount }>('/ib/wallet');
    return res.data.account;
  },

  async getCurrencies(): Promise<WalletCoin[]> {
    const res = await apiClient.get<{ coins: WalletCoin[] }>('/ib/wallet/currencies');
    return res.data.coins || [];
  },

  async getTransactions(): Promise<WalletTransaction[]> {
    const res = await apiClient.get<{ data: WalletTransaction[] }>('/ib/wallet/transactions');
    return res.data.data || [];
  },

  async requestWithdrawOtp(): Promise<string> {
    const res = await apiClient.get<{ message: string }>('/ib/wallet/withdraw-otp');
    return res.data.message;
  },

  async quoteWithdraw(input: WithdrawInput): Promise<WithdrawQuote> {
    const res = await apiClient.post<WithdrawQuote>('/ib/wallet/quote-withdraw', input);
    return res.data;
  },

  async submitWithdraw(input: SubmitWithdrawInput): Promise<WalletTransaction> {
    const res = await apiClient.post<{ transaction: WalletTransaction }>('/ib/wallet/submit-withdraw', input);
    return res.data.transaction;
  },
};
