import type { ComponentType, SVGProps } from 'react';
import type { TierRank } from '../types';
import {
  BankIcon, BoxIcon, CardPlainIcon, CarIcon, ChartIcon, ChatIcon, CopyIcon,
  DollarIcon, LockIcon, PhoneIcon, PlaneIcon, StarIcon, UsersTabIcon, WebIcon,
} from '../components/icons';

export type IconKey =
  | 'cash' | 'link' | 'chart' | 'chat' | 'card' | 'user' | 'box'
  | 'phone' | 'web' | 'plane' | 'bank' | 'lock' | 'car' | 'seat';

export const REWARD_ICONS: Record<IconKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  cash: DollarIcon,
  link: CopyIcon,
  chart: ChartIcon,
  chat: ChatIcon,
  card: CardPlainIcon,
  user: UsersTabIcon,
  box: BoxIcon,
  phone: PhoneIcon,
  web: WebIcon,
  plane: PlaneIcon,
  bank: BankIcon,
  lock: LockIcon,
  car: CarIcon,
  seat: StarIcon,
};

export interface TierReward {
  icon: IconKey;
  /** modal heading */
  title: string;
  detail: string;
  /** ladder chip label, where the mockup shortens it */
  chipLabel?: string;
  /** chip treatment on the ladder: cash = green, star = dark gradient */
  chip?: 'cash' | 'star';
}

export interface Tier {
  rank: TierRank;
  name: string;
  /** ascent-rail label */
  shortName: string;
  minLots: number;
  minActiveTraders: number;
  /** applied to base rates */
  multiplier: number;
  upliftLabel: string;
  /** one-off bonus paid on arrival, minor units */
  cashBonus?: number;
  inviteOnly?: boolean;
  rewards: TierReward[];
  bonusBenefitsText?: string;
  rates?: Record<string, Record<string, number>>;
  note: string;
}

export const parseBenefitsList = (text?: string): string[] => {
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(String).filter((s) => s.trim() !== "");
    }
  } catch {
    const parts = text.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts;
  }
  return text.trim() ? [text.trim()] : [];
};

/**
 * Lifted from the TIERS array + ladder markup in ib-platform.html. The ladder
 * shows the first three rewards as chips; the detail modal shows all of them.
 */
export const TIERS: Tier[] = [
  {
    rank: 1,
    name: 'Associate',
    shortName: 'Associate',
    minLots: 0,
    minActiveTraders: 0,
    multiplier: 1.0,
    upliftLabel: 'Base',
    note: 'Where every partner starts. No volume requirement — the account is live the moment your identity check clears.',
    rewards: [
      { icon: 'link', title: 'Referral link & code', chipLabel: 'Referral link & code', detail: 'Your unique tracking link and short code, ready to share.' },
      { icon: 'chart', title: 'Live reporting', detail: 'Trader list, volume and commission updated in real time.' },
    ],
  },
  {
    rank: 2,
    name: 'Partner',
    shortName: 'Partner',
    minLots: 500,
    minActiveTraders: 5,
    multiplier: 1.12,
    upliftLabel: '+12%',
    cashBonus: 25000,
    note: 'Cleared June 2026. The first tier that pays a cash bonus and shortens your payout cycle.',
    rewards: [
      { icon: 'cash', title: '$250 cash bonus', detail: 'Paid once, within 5 business days of clearing.', chip: 'cash' },
      { icon: 'chat', title: 'Priority support', detail: 'Partner queue, answered ahead of general support.' },
      { icon: 'card', title: 'Weekly payouts', detail: 'Withdraw every Monday instead of monthly.' },
    ],
  },
  {
    rank: 3,
    name: 'Senior Partner',
    shortName: 'Senior',
    minLots: 1500,
    minActiveTraders: 15,
    multiplier: 1.25,
    upliftLabel: '+25%',
    cashBonus: 100000,
    note: 'Your current tier, held for 2 months. You keep these rates for 60 days even if a month falls short.',
    rewards: [
      { icon: 'cash', title: '$1,000 cash bonus', chipLabel: '$1,000 cash · paid', detail: 'Paid 2 June 2026.', chip: 'cash' },
      { icon: 'user', title: 'Dedicated partner manager', detail: 'A named contact who knows your book.' },
      { icon: 'box', title: 'Branded merch kit', detail: 'Co-branded materials for events and client meetings.' },
    ],
  },
  {
    rank: 4,
    name: 'Elite Partner',
    shortName: 'Elite',
    minLots: 3000,
    minActiveTraders: 30,
    multiplier: 1.4,
    upliftLabel: '+40%',
    cashBonus: 350000,
    note: 'Your trader count already qualifies. Volume is the only gate left.',
    rewards: [
      { icon: 'cash', title: '$3,500 cash bonus', detail: 'The largest single jump in the programme.', chip: 'star' },
      { icon: 'phone', title: 'Flagship phone or laptop', detail: 'Your choice of device, shipped on unlock.' },
      { icon: 'web', title: 'Co-branded landing pages', detail: 'Hosted pages carrying your own brand alongside ours.' },
    ],
  },
  {
    rank: 5,
    name: 'Director',
    shortName: 'Director',
    minLots: 7500,
    minActiveTraders: 60,
    multiplier: 1.6,
    upliftLabel: '+60%',
    cashBonus: 1000000,
    note: 'The tier where terms stop being fixed. Directors negotiate their own rate card instead of taking the published one.',
    rewards: [
      { icon: 'cash', title: '$10,000 cash bonus', detail: 'Paid on first arrival at this tier.', chip: 'star' },
      { icon: 'plane', title: 'Partner summit, Dubai', detail: 'Two nights, flights and accommodation covered.' },
      { icon: 'bank', title: 'Negotiated custom rate card', detail: 'Rates agreed directly rather than from the table.' },
      { icon: 'lock', title: 'White-label client portal', detail: 'Your brand end to end, including the trader login.' },
    ],
  },
  {
    rank: 6,
    name: 'Managing Partner',
    shortName: 'Managing',
    minLots: 15000,
    minActiveTraders: 120,
    multiplier: 1.85,
    upliftLabel: '+85%',
    cashBonus: 3000000,
    inviteOnly: true,
    note: 'By invitation only. Managing Partners are treated as commercial partners of the business, not participants in a programme.',
    rewards: [
      { icon: 'cash', title: '$30,000 cash bonus', detail: 'Paid on invitation and acceptance.', chip: 'star' },
      { icon: 'car', title: '$2,000/mo vehicle allowance', detail: 'Paid monthly for as long as the tier is held.', chipLabel: '$2,000/mo vehicle allowance' },
      { icon: 'bank', title: 'Revenue-share agreement', detail: 'A share of net revenue on your book, above per-lot rebates.' },
      { icon: 'seat', title: 'Seat on the partner council', detail: 'Direct input on pricing and product decisions.' },
    ],
  },
];

export const tierByRank = (rank: TierRank): Tier => TIERS[rank - 1];

/**
 * Ladder rung state — three visual states only. The *flag* is finer-grained
 * (it distinguishes "next up" from "locked"), which is why they're separate.
 */
export const rungState = (rank: TierRank, current: TierRank) =>
  rank < current ? 'done' : rank === current ? 'now' : 'locked';

export const tierFlag = (tier: Tier, current: TierRank, achievedAt?: string) => {
  if (tier.rank < current) return { label: achievedAt ? `Cleared ${achievedAt}` : 'Cleared', cls: 'f-done' };
  if (tier.rank === current) return { label: 'You are here', cls: 'f-now' };
  if (tier.rank === current + 1) return { label: 'Next up', cls: 'f-next' };
  return { label: tier.inviteOnly ? 'By invitation' : 'Locked', cls: 'f-lock' };
};
