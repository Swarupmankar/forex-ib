import { TIERS, type Tier } from '../../data/tiers';
import { int } from '../../lib/format';
import type { TierRank } from '../../types';
import s from './AscentRail.module.css';

/**
 * Six checkpoints on one rail. The fill reaches the current tier's dot plus
 * the fraction of the way to the next — with six marks there are five gaps, so
 * tier 3 at 61% sits at (2 + 0.61) / 5 = 52.2% along.
 */
export const AscentRail = ({
  current,
  progress,
  tiers = TIERS,
  onSelect,
}: {
  current: TierRank;
  progress: number;
  tiers?: Tier[];
  onSelect: (rank: TierRank) => void;
}) => {
  const list = tiers.length > 0 ? tiers : TIERS;
  const gaps = Math.max(1, list.length - 1);
  const fill = Math.min(100, Math.max(0, ((current - 1 + progress) / gaps) * 100));

  return (
    <div className={s.ascent}>
      <div className={s.ascentIn}>
        <div className={s.rail}>
          <div className={s.fill} style={{ width: `${fill.toFixed(1)}%` }} />
        </div>
        <div className={s.marks}>
          {list.map((t) => (
            <button
              key={t.rank}
              className={s.mark}
              data-s={t.rank < current ? 'done' : t.rank === current ? 'now' : 'lock'}
              onClick={() => onSelect(t.rank)}
            >
              <span className={s.dot}><i /></span>
              <span className={s.name}>{t.shortName}</span>
              <span className={s.req}>
                {t.rank === 1 ? (
                  <>Base tier<br />Entry level</>
                ) : (
                  <>{int(t.minLots)} lots<br />{t.minActiveTraders} traders</>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
