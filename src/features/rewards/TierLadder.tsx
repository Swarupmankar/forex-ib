import { Medal } from '../../components/Medal';
import { CheckIcon } from '../../components/icons';
import { REWARD_ICONS, TIERS, rungState, tierFlag, type Tier } from '../../data/tiers';
import { int, lots } from '../../lib/format';
import type { TierProgress } from '../../lib/useTierProgress';
import type { TierRank } from '../../types';
import s from './TierLadder.module.css';

const RewardChips = ({ tier }: { tier: Tier }) => (
  <div className={s.rewards}>
    {/* the ladder shows three; the detail modal shows the full list */}
    {tier.rewards.slice(0, 3).map((r) => {
      const Icon = REWARD_ICONS[r.icon];
      const tone = r.chip === 'cash' ? ` ${s.cash}` : r.chip === 'star' ? ` ${s.star}` : '';
      return (
        <span className={`${s.rw}${tone}`} key={r.title}>
          <Icon /> {r.chipLabel ?? r.title}
        </span>
      );
    })}
  </div>
);

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
          <div className={s.rung} data-s={state} key={tier.rank}>
            <div className={s.rail}>
              <Medal tier={tier.rank} className={s.station} />
            </div>

            <button className={s.card} onClick={() => onSelect(tier.rank)}>
              <div className={s.head}>
                <div>
                  <div className={s.title}>
                    {tier.name} <span className={`flag ${flag.cls}`}>{flag.label}</span>
                  </div>
                  <div className={s.req}>
                    {isBaseTier
                      ? "Base tier · Entry level"
                      : `${int(tier.minLots)} lots · ${tier.minActiveTraders} active traders`}
                  </div>
                </div>
                <div className={s.uplift}>
                  <small>Uplift</small>
                  {tier.upliftLabel}
                </div>
              </div>

              <RewardChips tier={tier} />

              {/* Progress gates show on Partner (Tier 2) or whichever next target tier is being pursued */}
              {!isBaseTier && tier.rank === targetRank && progress.next && (
                <CurrentGates progress={progress} volume={volume} traders={traders} />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};
