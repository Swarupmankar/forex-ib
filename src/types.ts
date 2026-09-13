/**
 * Shapes match the API surface documented in REACT-BUILD-GUIDE.md §8, even
 * though nothing is fetched — the fixtures are the source. Keeping the shapes
 * honest means a real backend can be dropped in later without a rewrite.
 *
 * MONEY IS ALWAYS INTEGER MINOR UNITS (cents). Format only at the render edge.
 */
export type Money = number;

export type TierRank = number;

export type AccountTypeId = 'standard' | 'pro' | 'raw' | 'zero';
export type ReferralStatus = 'active' | 'dormant' | 'unfunded' | 'churned';

export interface AccountType {
  id: AccountTypeId;
  name: string;
  /** how the broker earns on this account — drives the rate-card subheads */
  model: 'spread-based' | 'commission a/c';
}

/* ---------- GET /api/partner/me ---------- */
export interface Partner {
  id: string;
  name: string;
  initials: string;
  email: string;
  entity: string;
  code: string;
  referralLink: string;
  /** date the partner account was approved */
  joinedAt: string;
  tier: TierRank;
  tierHeldMonths: number;
  balance: Money;
  verification: VerificationItem[];
}

export interface VerificationItem {
  id: string;
  label: string;
  detail: string;
  state: 'approved' | 'expiring' | 'enabled';
}

/* ---------- GET /api/partner/overview ---------- */
export interface OverviewSeriesPoint {
  /** ISO date */
  date: string;
  amount: Money;
}

export interface Overview {
  balance: Money;
  lifetime: Money;
  paidOut: Money;
  avgPerLot: Money;
  commissionDeltaPct: number;
  referrals: number;
  referralsThisMonth: number;
  activeTraders: number;
  volume30d: number;
  volumeDeltaPct: number;
  commission30d: Money;
  series: OverviewSeriesPoint[];
  activity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  tone: 'green' | 'blue' | 'amber';
  icon: 'commission' | 'signup' | 'settled' | 'warning' | 'upgrade';
  /** rendered bold at the start of the line, when present */
  who?: string;
  text: string;
  meta: string;
  amount?: Money;
  /** accruals render +$41.25; a settled payout renders $6,200 */
  amountStyle?: 'signed' | 'whole';
}

/* ---------- GET /api/partner/referrals ---------- */
export interface Referral {
  id: string;
  name: string;
  initials: string;
  email: string;
  accountId: string;
  accountType: AccountTypeId | null;
  country: string;
  joinedAt: string;
  deposits: Money;
  volumeLots: number;
  lifetime: Money;
  thisMonth: Money;
  /** null = never traded */
  lastTradeAt: string | null;
  status: ReferralStatus;
}

export interface ReferralQuery {
  q: string;
  status: ReferralStatus | 'all';
  accountType: AccountTypeId | 'all';
}

/* ---------- GET /api/partner/commissions/ledger ---------- */
export interface LedgerEntry {
  id: string;
  at: string;
  traderId: string | null;
  traderName: string | null;
  accountType: AccountTypeId | null;
  symbol: string;
  lots: number | null;
  /** per-lot rate actually applied, minor units */
  rate: Money | null;
  amount: Money;
  state: 'accrued' | 'paid';
}

export type LedgerWindow = 'this-month' | 'last-month' | 'last-90';

export interface LedgerQuery {
  window: LedgerWindow;
  traderId: string | 'all';
}

/* ---------- GET /api/partner/commissions/distribution ---------- */
export type DistributionWindow = '7d' | '30d' | '90d';

export interface DistributionRow {
  accountType: AccountTypeId;
  traders: number;
  commission: Money;
  lots: number;
  /** commission ÷ lots, minor units — carried so the client never re-derives it */
  perLot: Money;
  colour: string;
}

export interface Distribution {
  window: DistributionWindow;
  total: Money;
  activeTraders: number;
  rows: DistributionRow[];
}

/* ---------- GET /api/partner/rates ---------- */
export interface RateRow {
  id: string;
  group: string;
  examples: string;
  /** BASE values, pre-uplift, minor units. Displayed = base × tier multiplier. */
  base: Record<AccountTypeId, Money>;
}

/* ---------- GET /api/partner/payouts ---------- */
export type PayoutMethodKind = 'bank' | 'crypto' | 'account';

export interface PayoutMethod {
  id: string;
  kind: PayoutMethodKind;
  label: string;
  detail: string;
  terms: string;
  isDefault?: boolean;
  /** settlement window in hours, for sorting and copy */
  etaHours: number;
  /** flat fee charged by the rail itself, minor units */
  railFee: Money;
}

export interface Payout {
  id: string;
  requestedAt: string;
  method: string;
  amount: Money;
  settledAt: string | null;
  status: 'review' | 'settled';
}

export interface PayoutsData {
  balance: Money;
  inReview: Money;
  paidLifetime: Money;
  payoutCount: number;
  nextSettlement: string;
  minimum: Money;
  feeWaivedAbove: Money;
  /** flat fee charged when the request is under `feeWaivedAbove` */
  feeUnderThreshold: Money;
  manualApprovalAbove: Money;
  methods: PayoutMethod[];
  history: Payout[];
}

/* ---------- rewards ---------- */
export interface RewardHistoryItem {
  id: string;
  unlockedAt: string;
  tier: string;
  reward: string;
  /** cash rewards render mono/tabular; physical rewards don't */
  numeric: boolean;
  status: string;
}

/* ---------- partner manager ---------- */
export interface PartnerManager {
  name: string;
  initials: string;
  role: string;
  email: string;
  phone: string;
  telegram: string;
  hours: string;
}

/* ---------- notifications ---------- */
export interface Notification {
  id: string;
  tone: 'green' | 'blue' | 'amber';
  icon: ActivityItem['icon'] | 'tier' | 'verification';
  title: string;
  detail: string;
  at: string;
  unread: boolean;
  /** route this notification is about */
  to: string;
}

/* ---------- marketing ---------- */
export type CreativeFormat = 'png' | 'html' | 'mp4' | 'pdf' | 'hosted';

export interface CreativeAsset {
  id: string;
  kind: string;
  name: string;
  /** display label, e.g. "728 × 90 · PNG" */
  dimensions: string;
  format: CreativeFormat;
  /** pixel size for rasterisable formats */
  width?: number;
  height?: number;
  /** the headline burned into generated creative */
  headline: string;
}
