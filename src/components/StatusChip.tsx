import type { ReferralStatus } from '../types';

const REFERRAL: Record<ReferralStatus, { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'c-active' },
  dormant: { label: 'Dormant', cls: 'c-dormant' },
  unfunded: { label: 'Unfunded', cls: 'c-unfunded' },
  churned: { label: 'Churned', cls: 'c-churned' },
};

export const StatusChip = ({ status }: { status: ReferralStatus }) => (
  <span className={`chip ${REFERRAL[status].cls}`}>{REFERRAL[status].label}</span>
);

/** Generic chip for the ledger, payout and reward tables. */
export const Chip = ({ tone, children }: { tone: string; children: string }) => (
  <span className={`chip ${tone}`}>{children}</span>
);
