import { Medal } from '../../components/Medal';
import { Modal } from '../../components/Modal';
import { REWARD_ICONS, TIERS, rungState, tierFlag, type Tier, type TierReward } from '../../data/tiers';
import { RATE_ROWS, displayRate } from '../../data/rates';
import { int, lots, usd } from '../../lib/format';
import type { TierRank } from '../../types';
import s from './TierModal.module.css';

/** The three instrument groups the modal previews, on Standard accounts. */
const PREVIEW_ROWS = [
  { id: 'fx-major', label: 'Major FX' },
  { id: 'gold', label: 'Gold (XAUUSD)' },
  { id: 'indices', label: 'Indices' },
];

export const TierModal = ({
  rank,
  current,
  volume,
  traders,
  achievedAt,
  tiers = TIERS,
  onClose,
}: {
  rank: TierRank | null;
  current: TierRank;
  volume: number;
  traders: number;
  achievedAt: Record<number, string>;
  tiers?: Tier[];
  onClose: () => void;
}) => {
  if (rank === null) return null;

  const list = tiers.length > 0 ? tiers : TIERS;
  const tier = list.find((t) => t.rank === rank) ?? list[Math.min(rank - 1, list.length - 1)] ?? TIERS[0];
  const currentTier = list.find((t) => t.rank === current) ?? list[0] ?? TIERS[0];
  const flag = tierFlag(tier, current, achievedAt[rank]);
  const isFuture = rank > current;

  return (
    <Modal open onClose={onClose} labelledBy="tier-modal-title">
      <div className={s.hero}>
        <span className={s.orb} />
        <div className={s.medWrap}>
          <Medal tier={rank} className={s.med} />
        </div>
        <div className={s.rank}>Tier 0{rank} of 06</div>
        <h3 className={s.title} id="tier-modal-title">{tier.name}</h3>
        <div className={s.sub}>
          {tier.rank === 1 ? "Base tier · Entry level" : `${int(tier.minLots)} lots · ${tier.minActiveTraders} active traders`}
        </div>
        <span className={s.flag} data-s={rungState(rank, current)}>{flag.label}</span>
      </div>

      <div className={s.body}>
        {isFuture && (
          <div className={s.ms}>
            <div className={s.msH}>What it takes</div>
            <div className={s.mrow}>
              <div className={s.mrowL}>
                Monthly volume
                <small>You have {lots(volume)} lots</small>
              </div>
              <div className={s.mrowV}>
                {int(tier.minLots)}
                <em className={volume >= tier.minLots ? s.gain : undefined}>
                  {volume >= tier.minLots
                    ? 'already met'
                    : `${lots(tier.minLots - volume)} to go`}
                </em>
              </div>
            </div>
            <div className={s.mrow}>
              <div className={s.mrowL}>
                Active traders
                <small>You have {traders}</small>
              </div>
              <div className={s.mrowV}>
                {tier.minActiveTraders}
                <em className={traders >= tier.minActiveTraders ? s.gain : undefined}>
                  {traders >= tier.minActiveTraders
                    ? 'already met'
                    : `${tier.minActiveTraders - traders} to go`}
                </em>
              </div>
            </div>
          </div>
        )}

        <div className={s.ms}>
          <div className={s.msH}>Rates at this tier · {tier.upliftLabel} on base</div>
          {PREVIEW_ROWS.map((preview) => {
            const row = RATE_ROWS.find((r) => r.id === preview.id)!;
            const here = displayRate(row.base.standard, tier.multiplier);
            const today = displayRate(row.base.standard, currentTier.multiplier);
            const diff = here - today;
            return (
              <div className={s.mrow} key={preview.id}>
                <div className={s.mrowL}>{preview.label}</div>
                <div className={s.mrowV}>
                  {usd(here)}
                  {rank === current ? (
                    <em>your rate today</em>
                  ) : (
                    <em className={diff > 0 ? s.gain : undefined}>
                      {diff > 0 ? `+${usd(diff)}` : `−${usd(Math.abs(diff))}`} per lot
                    </em>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className={s.ms}>
          <div className={s.msH}>What you get</div>
          {(tier.rewards || []).map((r: TierReward) => {
            const Icon = REWARD_ICONS[r.icon] || REWARD_ICONS['cash'];
            return (
              <div className={s.mrew} key={r.title}>
                <span className={s.mrewI}><Icon /></span>
                <div>
                  <div className={s.mrewT}>{r.title}</div>
                  <div className={s.mrewD}>{r.detail}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={s.mnote}>{tier.note}</div>
      </div>
    </Modal>
  );
};
