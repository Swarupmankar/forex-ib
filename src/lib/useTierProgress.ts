import { useMemo } from 'react';
import { TIERS, type Tier } from '../data/tiers';
import { daysLeftInMonth } from './format';
import type { TierRank } from '../types';
import { useIbDashboard } from '../api/ib.hooks';

export interface TierProgress {
  current: Tier;
  next: Tier | null;
  /** raw ratios, uncapped — a gate can read over 100% */
  lotsRatio: number;
  tradersRatio: number;
  lotsRemaining: number;
  tradersRemaining: number;
  lotsGateMet: boolean;
  tradersGateMet: boolean;
  bothGatesMet: boolean;
  /**
   * The LOWER of the two ratios, capped at 1. This is what the hero dial shows,
   * and it is why the dial reads 61% while the trader count is already at 103%.
   */
  pctToNext: number;
  daysLeft: number;
  /** days to clear the remaining volume at the trailing-30-day pace */
  daysAtPace: number | null;
}

/**
 * All tier maths in one place. Both gates — volume AND active traders — have to
 * clear inside the same calendar month, so progress is gated by whichever is
 * further behind, never by an average of the two.
 */
export const useTierProgress = (
  rank: TierRank,
  lots: number,
  activeTraders: number,
  now: string,
  customTiers?: Tier[],
): TierProgress => {
  const { data: ibDashboard } = useIbDashboard();

  return useMemo(() => {
    const tiersList = customTiers ?? TIERS;
    const current = tiersList.find((t) => t.rank === rank) ?? tiersList[0] ?? TIERS[0];
    let next = tiersList.find((t) => t.rank === rank + 1) ?? null;

    if (next && ibDashboard?.nextTier) {
      next = {
        ...next,
        name: ibDashboard.nextTier.name || next.name,
        minLots: ibDashboard.nextTier.minVolumeLots ?? next.minLots,
        minActiveTraders: ibDashboard.nextTier.minActiveTraders ?? next.minActiveTraders,
        bonusBenefitsText: ibDashboard.nextTier.bonusBenefitsText || next.bonusBenefitsText,
      };
    }

    if (!next) {
      return {
        current, next: null,
        lotsRatio: 1, tradersRatio: 1, lotsRemaining: 0, tradersRemaining: 0,
        lotsGateMet: true, tradersGateMet: true, bothGatesMet: true,
        pctToNext: 1, daysLeft: daysLeftInMonth(now), daysAtPace: null,
      };
    }

    const lotsRatio = next.minLots === 0 ? 1 : lots / next.minLots;
    const tradersRatio = next.minActiveTraders === 0 ? 1 : activeTraders / next.minActiveTraders;
    const lotsRemaining = Math.max(0, next.minLots - lots);
    const tradersRemaining = Math.max(0, next.minActiveTraders - activeTraders);
    const dailyPace = lots / 30;

    return {
      current,
      next,
      lotsRatio,
      tradersRatio,
      lotsRemaining,
      tradersRemaining,
      lotsGateMet: lotsRemaining === 0,
      tradersGateMet: tradersRemaining === 0,
      bothGatesMet: lotsRemaining === 0 && tradersRemaining === 0,
      pctToNext: Math.min(1, Math.min(lotsRatio, tradersRatio)),
      daysLeft: daysLeftInMonth(now),
      daysAtPace: dailyPace > 0 ? Math.round(lotsRemaining / dailyPace) : null,
    };
  }, [rank, lots, activeTraders, now, ibDashboard, customTiers]);
};
