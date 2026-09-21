import { Medal } from '../../components/Medal';
import { CheckIcon } from '../../components/icons';
import { REWARD_ICONS, TIERS, parseBenefitsList, rungState, tierFlag, type Tier, type TierReward } from '../../data/tiers';
import { int, lots, usdWhole } from '../../lib/format';
import type { TierProgress } from '../../lib/useTierProgress';
import type { TierRank } from '../../types';
import s from './TierLadder.module.css';

const RewardChips = ({ tier }: { tier: Tier }) => {
  const benefits = parseBenefitsList(tier.bonusBenefitsText);
  const rewards: TierReward[] = benefits.length ? benefits.map(title => ({icon: 'box' as const,title,detail:''})) : tier.rewards.filter(r=>r.icon !== 'cash');
  return (
  <span className={s.rewards}>
    {/* the ladder shows three; the detail modal shows the full list */}
    {Boolean(tier.cashBonus) && <span className={`${s.rw} ${s.cash}`}>{usdWhole(tier.cashBonus!)} one-time bonus</span>}
    {rewards.slice(0, 2).map((r) => {
      const Icon = REWARD_ICONS[r.icon];
      const tone = r.chip === 'cash' ? ` ${s.cash}` : r.chip === 'star' ? ` ${s.star}` : '';
      return (
        <span className={`${s.rw}${tone}`} key={r.title}>
          <Icon /> {r.chipLabel ?? r.title}
        </span>
      );
    })}
  </span>
);
};

/** Both gates toward the next tier, shown on the rung you're standing on. */
const CurrentGates = ({ progress, volume, traders }: {
  progress: TierProgress;
  volume: number;
  traders: number;
}) => {
  if (!progress.next) return null;
  const target = progress.next;

  return (
    <div className={s.prog}>
      <div className={s.gate} data-met={progress.lotsGateMet}>
        <div className={s.gateTop}>
          <span className={s.gateLab}>Volume toward {target.shortName}</span>
          {progress.lotsGateMet ? (
            <span className="met"><CheckIcon strokeWidth={3} /> {lots(volume)} / {int(target.minLots)} met</span>
          ) : (
            <span className={s.gateVal}>
              <em>{lots(volume)}</em> / {int(target.minLots)} lots
            </span>
          )}
        </div>
        <div className={s.gbar}><i style={{ width: `${Math.min(1, progress.lotsRatio) * 100}%` }} /></div>
      </div>

      <div className={s.gate} data-met={progress.tradersGateMet}>
        <div className={s.gateTop}>
          <span className={s.gateLab}>Active traders toward {target.shortName}</span>
          {progress.tradersGateMet ? (
            <span className="met"><CheckIcon strokeWidth={3} /> {traders} / {target.minActiveTraders} met</span>
          ) : (
            <span className={s.gateVal}>
              <em>{traders}</em> / {target.minActiveTraders} traders
            </span>
          )}
        </div>
        <div className={s.gbar}><i style={{ width: `${Math.min(1, progress.tradersRatio) * 100}%` }} /></div>
      </div>
    </div>
  );
};



export const TierLadder = ({
  current,
  progress,
  volume,
  traders,
  achievedAt,
  tiers = TIERS,
  onSelect,
}: {
  current: TierRank;
  progress: TierProgress;
  volume: number;
  traders: number;
  achievedAt: Record<number, string>;
  tiers?: Tier[];
  onSelect: (rank: TierRank) => void;
}) => {
  const list = tiers.length > 0 ? tiers : TIERS;
  // Progress gates belong on the next target tier (Partner or higher)
  const targetRank = progress.next ? progress.next.rank : Math.min(current + 1, list.length);

  return (
    <div className={s.ladder}>
      {list.map((tier) => {
        const state = rungState(tier.rank, current);
        const flag = tierFlag(tier, current, achievedAt[tier.rank]);
        const isBaseTier = tier.rank === 1;

        return (
          <article className={s.rung} data-s={state} key={tier.rank}>
            <button className={s.card} onClick={() => onSelect(tier.rank)} aria-label={`View ${tier.name} tier details`}>
              <span className={s.top}>
                <Medal tier={tier.rank} className={s.station} />
                <span className={`flag ${flag.cls}`}>{flag.label}</span>
              </span>
              <span className={s.title}>{tier.name}</span>
              <span className={s.req}>
                {isBaseTier ? 'Your starting point' : `${int(tier.minLots)} lots · ${tier.minActiveTraders} active traders`}
              </span>
              <span className={s.uplift}><small>Rate uplift</small><b>{tier.upliftLabel}</b></span>
              <RewardChips tier={tier} />
              <span className={s.details}>View tier details <span aria-hidden="true">↗</span></span>
            </button>
            {!isBaseTier && tier.rank === targetRank && progress.next && (
              <CurrentGates progress={progress} volume={volume} traders={traders} />
            )}
          </article>
        );
      })}
    </div>
  );
};
