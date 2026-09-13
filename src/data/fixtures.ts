import type {
  CreativeAsset, Distribution, DistributionWindow, LedgerEntry, Money, Overview,
  OverviewSeriesPoint, Partner, PartnerManager, PayoutsData, Referral, RewardHistoryItem,
} from '../types';

/**
 * FIXTURE CLOCK. Every relative date in the UI ("Today", "21 days ago",
 * "25 days left in the qualifying month") is measured from here rather than
 * from the real clock, so the screen stays identical to the mockup instead of
 * drifting a day at a time. A real backend would send timestamps and this
 * constant would become `new Date().toISOString()`.
 */
export const AS_OF = '2026-08-06T14:36:00Z';

const cents = (dollars: number) => Math.round(dollars * 100);

/* ================= GET /api/partner/me ================= */
export const partner: Partner = {
  id: 'IB-0YNOZ2CF',
  name: 'Rohit Kulkarni',
  initials: 'RK',
  email: 'rohit@example.com',
  entity: 'Individual · India',
  code: '0YNOZ2CF',
  referralLink: 'https://forex-user.vercel.app/auth?ref=0YNOZ2CF',
  joinedAt: '2025-03-14',
  tier: 3,
  tierHeldMonths: 2,
  balance: cents(12_940.6),
  verification: [
    { id: 'identity', label: 'Identity', detail: 'Approved 14 Mar 2025', state: 'approved' },
    { id: 'address', label: 'Address', detail: 'Approved 14 Mar 2025', state: 'approved' },
    { id: 'tax', label: 'Tax form (W-8BEN)', detail: 'Expires 31 Dec 2026 — renew to avoid withholding', state: 'expiring' },
    { id: '2fa', label: 'Two-factor authentication', detail: 'Enabled via authenticator app', state: 'enabled' },
  ],
};

/* ================= referrals ================= */
export const referrals: Referral[] = [
  {
    id: 'r-88214093', name: 'Arjun Mehta', initials: 'AM', email: 'arjun.mehta@example.com', accountId: '#88214093',
    accountType: 'standard', country: 'India', joinedAt: '2026-08-02',
    deposits: cents(12_000), volumeLots: 142.8, lifetime: cents(1_224.66),
    thisMonth: cents(1_224.66), lastTradeAt: '2026-08-06', status: 'active',
  },
  {
    id: 'r-88213877', name: 'Sana Kapoor', initials: 'SK', email: 'sana.kapoor@example.com', accountId: '#88213877',
    accountType: 'raw', country: 'UAE', joinedAt: '2026-07-29',
    deposits: cents(8_500), volumeLots: 96.1, lifetime: cents(506.15),
    thisMonth: cents(506.15), lastTradeAt: '2026-08-05', status: 'active',
  },
  {
    id: 'r-88212998', name: 'Marcus Obi', initials: 'MO', email: 'marcus.obi@example.com', accountId: '#88212998',
    accountType: 'pro', country: 'Nigeria', joinedAt: '2026-07-11',
    deposits: cents(21_400), volumeLots: 388.2, lifetime: cents(4_918.3),
    thisMonth: cents(2_727.11), lastTradeAt: '2026-08-06', status: 'active',
  },
  {
    id: 'r-88212410', name: 'Lucia Costa', initials: 'LC', email: 'lucia.costa@example.com', accountId: '#88212410',
    accountType: 'standard', country: 'Brazil', joinedAt: '2026-06-28',
    deposits: cents(15_900), volumeLots: 274.5, lifetime: cents(3_180.4),
    thisMonth: cents(1_912.55), lastTradeAt: '2026-08-06', status: 'active',
  },
  {
    id: 'r-88213540', name: 'Daniel Voss', initials: 'DV', email: 'daniel.voss@example.com', accountId: '#88213540',
    accountType: 'zero', country: 'Germany', joinedAt: '2026-07-24',
    deposits: cents(3_000), volumeLots: 12.4, lifetime: cents(73.75),
    thisMonth: 0, lastTradeAt: '2026-07-16', status: 'dormant',
  },
  {
    id: 'r-88213402', name: 'Priya Nair', initials: 'PN', email: 'priya.nair@example.com', accountId: '#88213402',
    accountType: null, country: 'India', joinedAt: '2026-07-21',
    deposits: 0, volumeLots: 0, lifetime: 0,
    thisMonth: 0, lastTradeAt: null, status: 'unfunded',
  },
  {
    id: 'r-88211744', name: 'Linh Tran', initials: 'LT', email: 'linh.tran@example.com', accountId: '#88211744',
    accountType: 'standard', country: 'Vietnam', joinedAt: '2026-06-02',
    deposits: cents(5_200), volumeLots: 61.9, lifetime: cents(530.8),
    thisMonth: 0, lastTradeAt: '2026-06-03', status: 'churned',
  },
];

/* ================= earnings series =================
   Deterministic daily accrual for 90 days, scaled so the trailing 30 days sum
   to exactly the headline commission figure. Generated rather than hand-typed
   because the window selector needs 7d / 30d / 90d to be genuinely different. */
const buildSeries = (days: number, trailing30Total: Money): OverviewSeriesPoint[] => {
  let seed = 20260806;
  const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

  // Gentle noise on a rising trend. The band is deliberately narrow: the
  // mockup's curve is a calm rise, and ±25% daily swing renders as chatter
  // that reads nothing like it.
  const weights = Array.from({ length: days }, (_, i) => {
    const trend = 0.5 + (1.05 * i) / (days - 1);
    return trend * (0.95 + rand() * 0.1);
  });

  const tailSum = weights.slice(-30).reduce((a, b) => a + b, 0);
  const scale = trailing30Total / tailSum;

  const end = Date.parse('2026-08-06T00:00:00Z');
  const points = weights.map((w, i) => ({
    date: new Date(end - (days - 1 - i) * 86_400_000).toISOString().slice(0, 10),
    amount: Math.round(w * scale),
  }));

  // absorb rounding drift into the final day so the 30d total stays exact
  const drift = trailing30Total - points.slice(-30).reduce((a, p) => a + p.amount, 0);
  points[points.length - 1].amount += drift;
  return points;
};

export const series90 = buildSeries(90, cents(12_940.6));

/* ================= GET /api/partner/overview ================= */
export const overview: Overview = {
  balance: cents(12_940.6),
  lifetime: cents(148_290),
  paidOut: cents(135_349),
  avgPerLot: cents(7.02),
  commissionDeltaPct: 0.124,
  referrals: 48,
  referralsThisMonth: 6,
  activeTraders: 31,
  volume30d: 1842.4,
  volumeDeltaPct: 0.081,
  commission30d: cents(12_940.6),
  series: series90,
  activity: [
    {
      id: 'a1', tone: 'green', icon: 'commission', who: 'Arjun Mehta',
      text: ' traded XAUUSD', meta: '14 minutes ago · Standard account',
      amount: cents(41.25), amountStyle: 'signed',
    },
    {
      id: 'a2', tone: 'blue', icon: 'signup', who: 'Priya Nair',
      text: ' signed up with your code', meta: '2 hours ago · not funded yet',
    },
    {
      id: 'a3', tone: 'green', icon: 'settled',
      text: 'Payout settled to HDFC ••4471', meta: '1 Aug 2026',
      amount: cents(6_200), amountStyle: 'whole',
    },
    {
      id: 'a4', tone: 'amber', icon: 'warning', who: 'Daniel Voss',
      text: ' quiet for 21 days', meta: 'Was worth $36.90/mo',
    },
    {
      id: 'a5', tone: 'blue', icon: 'upgrade', who: 'Marcus Obi',
      text: ' upgraded to a Pro account', meta: '28 Jul · lowers your per-lot rate',
    },
  ],
};

/* ================= accrual ledger =================
   The five August rows are the mockup's default view. July rows exist so the
   period filter has somewhere to go. */
export const ledger: LedgerEntry[] = [
  { id: 'l-1', at: '2026-08-06T14:22:00Z', traderId: 'r-88214093', traderName: 'Arjun Mehta', accountType: 'standard', symbol: 'XAUUSD', lots: 3.0, rate: 1375, amount: cents(41.25), state: 'accrued' },
  { id: 'l-2', at: '2026-08-06T11:04:00Z', traderId: 'r-88212998', traderName: 'Marcus Obi', accountType: 'pro', symbol: 'EURUSD', lots: 12.0, rate: 750, amount: cents(90), state: 'accrued' },
  { id: 'l-3', at: '2026-08-05T19:47:00Z', traderId: 'r-88213877', traderName: 'Sana Kapoor', accountType: 'raw', symbol: 'BTCUSD', lots: 1.4, rate: 940, amount: cents(13.16), state: 'accrued' },
  { id: 'l-4', at: '2026-08-05T16:31:00Z', traderId: 'r-88212410', traderName: 'Lucia Costa', accountType: 'standard', symbol: 'US30', lots: 8.6, rate: 690, amount: cents(59.34), state: 'accrued' },
  { id: 'l-5', at: '2026-08-01T00:00:00Z', traderId: null, traderName: null, accountType: null, symbol: 'Settlement', lots: null, rate: null, amount: -cents(6_200), state: 'paid' },

  { id: 'l-6', at: '2026-07-30T21:12:00Z', traderId: 'r-88212998', traderName: 'Marcus Obi', accountType: 'pro', symbol: 'NAS100', lots: 6.5, rate: 560, amount: cents(36.4), state: 'accrued' },
  { id: 'l-7', at: '2026-07-28T13:55:00Z', traderId: 'r-88212410', traderName: 'Lucia Costa', accountType: 'standard', symbol: 'XAUUSD', lots: 4.2, rate: 1375, amount: cents(57.75), state: 'accrued' },
  { id: 'l-8', at: '2026-07-22T09:18:00Z', traderId: 'r-88213877', traderName: 'Sana Kapoor', accountType: 'raw', symbol: 'EURUSD', lots: 15.0, rate: 560, amount: cents(84), state: 'accrued' },
  { id: 'l-9', at: '2026-07-16T17:40:00Z', traderId: 'r-88213540', traderName: 'Daniel Voss', accountType: 'zero', symbol: 'USOIL', lots: 2.1, rate: 605, amount: cents(12.71), state: 'accrued' },
  { id: 'l-10', at: '2026-07-01T00:00:00Z', traderId: null, traderName: null, accountType: null, symbol: 'Settlement', lots: null, rate: null, amount: -cents(4_850), state: 'paid' },
];

/* ================= commission distribution =================
   The 30d set is the mockup's; 7d and 90d exist so the window select is real. */
export const distributions: Record<DistributionWindow, Distribution> = {
  '7d': {
    window: '7d',
    total: cents(3_186.4),
    activeTraders: 22,
    rows: [
      { accountType: 'standard', traders: 10, commission: cents(1_512.18), lots: 176.3, perLot: cents(8.58), colour: '#0E3628' },
      { accountType: 'pro', traders: 6, commission: cents(742.9), lots: 105.8, perLot: cents(7.02), colour: '#1E7A55' },
      { accountType: 'raw', traders: 4, commission: cents(586.44), lots: 111.3, perLot: cents(5.27), colour: '#4FD394' },
      { accountType: 'zero', traders: 2, commission: cents(344.88), lots: 58.0, perLot: cents(5.95), colour: '#C6D0DC' },
    ],
  },
  '30d': {
    window: '30d',
    total: cents(12_940.6),
    activeTraders: 31,
    rows: [
      { accountType: 'standard', traders: 13, commission: cents(5_952.68), lots: 694.2, perLot: cents(8.58), colour: '#0E3628' },
      { accountType: 'pro', traders: 8, commission: cents(3_105.74), lots: 442.1, perLot: cents(7.02), colour: '#1E7A55' },
      { accountType: 'raw', traders: 6, commission: cents(2_458.71), lots: 466.8, perLot: cents(5.27), colour: '#4FD394' },
      { accountType: 'zero', traders: 4, commission: cents(1_423.47), lots: 239.3, perLot: cents(5.95), colour: '#C6D0DC' },
    ],
  },
  '90d': {
    window: '90d',
    total: cents(31_884.15),
    activeTraders: 37,
    rows: [
      { accountType: 'standard', traders: 15, commission: cents(13_760.42), lots: 1604.2, perLot: cents(8.58), colour: '#0E3628' },
      { accountType: 'pro', traders: 10, commission: cents(8_012.6), lots: 1141.4, perLot: cents(7.02), colour: '#1E7A55' },
      { accountType: 'raw', traders: 7, commission: cents(6_290.19), lots: 1194.0, perLot: cents(5.27), colour: '#4FD394' },
      { accountType: 'zero', traders: 5, commission: cents(3_820.94), lots: 642.2, perLot: cents(5.95), colour: '#C6D0DC' },
    ],
  },
};

/* ================= payouts ================= */
export const payouts: PayoutsData = {
  balance: cents(12_940.6),
  inReview: cents(1_200),
  paidLifetime: cents(135_349),
  payoutCount: 9,
  nextSettlement: '2026-09-01',
  minimum: cents(100),
  feeWaivedAbove: cents(500),
  // the mockup states "no fee over $500" but never names the fee below it —
  // this is a fixture value, not something lifted from the design
  feeUnderThreshold: cents(5),
  manualApprovalAbove: cents(5_000),
  methods: [
    { id: 'bank', kind: 'bank', label: 'Bank transfer', detail: 'HDFC Bank ••4471', terms: '1–3 business days · free', isDefault: true, etaHours: 48, railFee: 0 },
    { id: 'usdt', kind: 'crypto', label: 'USDT (TRC-20)', detail: 'TQn9•••••7fXd', terms: 'under 1 hour · 1.0 USDT', etaHours: 1, railFee: 100 },
    { id: 'account', kind: 'account', label: 'Trading account', detail: 'Credit to #88200114', terms: 'instant · free', etaHours: 0, railFee: 0 },
  ],
  history: [
    { id: 'PO-2026-0912', requestedAt: '2026-08-04', method: 'USDT TRC-20', amount: cents(1_200), settledAt: null, status: 'review' },
    { id: 'PO-2026-0847', requestedAt: '2026-07-31', method: 'HDFC ••4471', amount: cents(6_200), settledAt: '2026-08-01', status: 'settled' },
    { id: 'PO-2026-0790', requestedAt: '2026-06-30', method: 'HDFC ••4471', amount: cents(4_850), settledAt: '2026-07-02', status: 'settled' },
  ],
};

/* ================= rewards ================= */
export const rewardHistory: RewardHistoryItem[] = [
  { id: 'rh-1', unlockedAt: '2026-06-02', tier: 'Senior Partner', reward: '$1,000 cash', numeric: true, status: 'Paid' },
  { id: 'rh-2', unlockedAt: '2026-06-02', tier: 'Senior Partner', reward: 'Merch kit', numeric: false, status: 'Delivered' },
  { id: 'rh-3', unlockedAt: '2026-05-01', tier: 'Partner', reward: '$250 cash', numeric: true, status: 'Paid' },
];

/** month a tier was cleared, keyed by rank — drives the ladder flag copy */
export const tierAchievedAt: Record<number, string> = { 2: 'Jun 2026' };

/* ================= partner manager =================
   A named contact is the Senior Partner tier reward, so this only exists
   because the fixture partner is tier 3 or above. */
export const partnerManager: PartnerManager = {
  name: 'Aisha Rahman',
  initials: 'AR',
  role: 'Partner manager',
  email: 'aisha.rahman@example.com',
  phone: '+971 4 555 0142',
  telegram: '@aisha_partners',
  hours: 'Sun–Thu, 09:00–18:00 GST',
};

/* ================= marketing ================= */
export const creativeAssets: CreativeAsset[] = [
  { id: 'c1', kind: 'Leaderboard', name: 'Zero-spread promo', dimensions: '728 × 90 · PNG', format: 'png', width: 728, height: 90, headline: 'Zero-spread accounts. Trade from 0.0 pips.' },
  { id: 'c2', kind: 'Square', name: 'Gold trading', dimensions: '1080 × 1080 · PNG', format: 'png', width: 1080, height: 1080, headline: 'Trade gold with institutional spreads.' },
  { id: 'c3', kind: 'Story', name: 'Fast withdrawals', dimensions: '1080 × 1920 · MP4', format: 'mp4', width: 1080, height: 1920, headline: 'Withdrawals in under an hour.' },
  { id: 'c4', kind: 'Landing page', name: 'Co-branded page', dimensions: 'Hosted · your logo', format: 'hosted', headline: 'Your brand, our execution.' },
  { id: 'c5', kind: 'Deck', name: 'Broker overview', dimensions: '14 slides · PDF', format: 'pdf', headline: 'Broker overview for prospective traders.' },
  { id: 'c6', kind: 'Email', name: 'Welcome sequence', dimensions: '3 emails · HTML', format: 'html', headline: 'Welcome aboard — here is how to start.' },
];

export const linkDestinations = [
  { id: 'auth', label: '/auth', path: '/auth' },
  { id: 'markets', label: '/markets', path: '/markets' },
  { id: 'promo', label: '/promo/zero-spread', path: '/promo/zero-spread' },
];

export const linkSources = ['telegram', 'youtube', 'instagram', 'whatsapp', 'email'];
