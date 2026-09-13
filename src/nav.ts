export type SectionId =
  | 'overview'
  | 'referrals'
  | 'commissions'
  | 'rewards'
  | 'marketing'
  | 'payouts'
  | 'settings';

export interface Section {
  id: SectionId;
  path: string;
  /** sidebar + more-sheet label */
  label: string;
  /** mobile app-header title */
  title: string;
  /** bottom tab bar label, where it differs from the sidebar label */
  tabLabel?: string;
  group: 'main' | 'growth';
}

export const SECTIONS: Section[] = [
  { id: 'overview', path: '/', label: 'Overview', title: 'Overview', tabLabel: 'Home', group: 'main' },
  { id: 'referrals', path: '/referrals', label: 'Referrals', title: 'Referrals', group: 'main' },
  { id: 'commissions', path: '/commissions', label: 'Commissions', title: 'Commissions', tabLabel: 'Rates', group: 'main' },
  { id: 'rewards', path: '/rewards', label: 'Rewards', title: 'Rewards', group: 'main' },
  { id: 'marketing', path: '/marketing', label: 'Marketing', title: 'Marketing', group: 'growth' },
  { id: 'payouts', path: '/payouts', label: 'Payouts', title: 'Payouts', group: 'growth' },
  { id: 'settings', path: '/settings', label: 'Settings', title: 'Settings', group: 'growth' },
];

/** The four sections that get their own bottom tab; the rest live behind More. */
export const TAB_IDS: SectionId[] = ['overview', 'referrals', 'commissions', 'rewards'];

export const sectionByPath = (pathname: string): Section =>
  SECTIONS.find((s) => (s.path === '/' ? pathname === '/' : pathname.startsWith(s.path))) ?? SECTIONS[0];
