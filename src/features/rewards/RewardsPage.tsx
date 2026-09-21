import { useState } from 'react';
import { PageHead } from '../../components/PageHead';
import { DataList, type Col } from '../../components/DataList';
import { Feed, type FeedRow } from '../../components/Feed';
import {
  Hero, HeroFoot, HeroLabel, HeroNote, HeroNumber, HeroSplits, TierDial, TierMini,
} from '../../components/Hero';
import { CalendarIcon, CheckIcon, ShieldIcon, WarningIcon } from '../../components/icons';
import { AscentRail } from './AscentRail';
import { TierLadder } from './TierLadder';
import { TierModal } from './TierModal';
import { TermsModal } from './TermsModal';
import { useNow, useOverview, usePartner, useRewardHistory, useMergedTiers } from '../../api/hooks';
import { useTierProgress } from '../../lib/useTierProgress';
import { int, lots, pct0, shortDate, usdWhole } from '../../lib/format';
import type { RewardHistoryItem, TierRank } from '../../types';

const HOW_IT_WORKS: FeedRow[] = [
  {
    id: 'monthly', tone: 'blue', icon: <CalendarIcon />,
    body: <b>Assessed monthly</b>,
    time: 'Volume resets on the 1st. Your tier updates within an hour of clearing.',
  },
  {
    id: 'grace', tone: 'green', icon: <ShieldIcon />,
    body: <b>60-day grace period</b>,
    time: 'Miss a threshold once and you keep the tier and its rates for two months.',
  },
  {
    id: 'gates', tone: 'amber', icon: <WarningIcon />,
    body: <b>Both gates, same month</b>,
    time: 'A tier needs its lot volume and its active-trader count together. A trader is active with at least one closed trade in the last 30 days. Bonus-funded volume is excluded.',
  },
];

const historyColumns: Col<RewardHistoryItem>[] = [
  { key: 'unlocked', header: 'Unlocked', render: (r) => <span className="num">{shortDate(r.unlockedAt)}</span> },
  { key: 'tier', header: 'Tier', mobile: 'secondary', render: (r) => r.tier },
  {
    key: 'reward', header: 'Reward', mobile: 'primary',
    render: (r) => (r.numeric ? <span className="num">{r.reward}</span> : r.reward),
  },
  { key: 'status', header: 'Status', mobile: 'status', render: (r) => <span className="chip c-active">{r.status}</span> },
];

export const RewardsPage = () => {
  const now = useNow();
  const partner = usePartner();
  const overview = useOverview();
  const history = useRewardHistory();
  const tiers = useMergedTiers();
  const [openTier, setOpenTier] = useState<TierRank | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);

  const progress = useTierProgress(partner.tier, overview.volume30d, overview.activeTraders, now, tiers);
  const { current, next } = progress;
  const lotsToGo = int(Math.ceil(progress.lotsRemaining));
  const cleared = partner.tier;
  const totalTiers = tiers.length;
  const totalStr = totalTiers < 10 ? `0${totalTiers}` : String(totalTiers);
  const rankStr = partner.tier < 10 ? `0${partner.tier}` : String(partner.tier);

  return (
    <section className="wrap view">
      <PageHead
        eyebrow="Growth"
        title="Rewards"
        sub={`${totalTiers} tiers. Each one raises every rate on your card and pays a bonus on arrival.`}
        actions={<button className="btn" onClick={() => setTermsOpen(true)}>Program terms</button>}
      />

      <div className="stack">
        <Hero>
          <div>
            <HeroLabel>Current tier</HeroLabel>
            <HeroNumber words>{current.name}</HeroNumber>
            <HeroFoot>
              <span className="pill">
                <CheckIcon strokeWidth={2.4} /> Held {partner.tierHeldMonths} months
              </span>
              <HeroNote>
                {current.upliftLabel} on every base rate
                {current.cashBonus ? ` · ${usdWhole(current.cashBonus)} one-time bonus` : ''}
              </HeroNote>
            </HeroFoot>

            <TierMini
              tier={partner.tier}
              name={current.name}
              progress={progress.pctToNext}
              note={
                next
                  ? `${lotsToGo} lots to ${next.shortName} · Tier ${rankStr} of ${totalStr}`
                  : `Top tier · Tier ${rankStr} of ${totalStr}`
              }
            />

            <HeroSplits
              items={[
                {
                  label: 'Volume',
                  value: next ? `${lots(overview.volume30d)} / ${int(next.minLots)}` : lots(overview.volume30d),
                },
                {
                  label: 'Active traders',
                  value: next
                    ? `${overview.activeTraders} / ${next.minActiveTraders}${progress.tradersGateMet ? ' ✓' : ''}`
                    : String(overview.activeTraders),
                  tone: progress.tradersGateMet ? 'mint' : undefined,
                },
                { label: 'Next bonus', value: next?.cashBonus ? usdWhole(next.cashBonus) : '—' },
                { label: 'Days left', value: String(progress.daysLeft) },
              ]}
            />
          </div>

          <TierDial
            tier={partner.tier}
            progress={progress.pctToNext}
            caption={next ? `${pct0(progress.pctToNext)} to ${next.shortName}` : 'Top tier'}
            label={`Tier ${rankStr} of ${totalStr}`}
            name={next ? `${lotsToGo} lots to go` : current.name}
          />
        </Hero>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Your ascent</div>
              <div className="card-sub">
                Assessed on the calendar month. A tier is held for 60 days after a shortfall.
              </div>
            </div>
            <span className="flag f-now">{cleared} of {totalTiers} unlocked</span>
          </div>
          <AscentRail current={partner.tier} progress={progress.pctToNext} tiers={tiers} onSelect={setOpenTier} />
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Tiers and rewards</div>
            <span className="card-sub">Bonuses pay once, within 5 business days</span>
          </div>
          <TierLadder
            current={partner.tier}
            progress={progress}
            volume={overview.volume30d}
            traders={overview.activeTraders}
            achievedAt={{}}
            tiers={tiers}
            onSelect={setOpenTier}
          />
        </div>

        <div className="two">
          <div className="card">
            <div className="card-head"><div className="card-title">Reward history</div></div>
            <DataList columns={historyColumns} rows={history} rowKey={(r) => r.id} minWidth={460} />
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">How tiers work</div></div>
            <Feed rows={HOW_IT_WORKS} />
          </div>
        </div>
      </div>

      <TierModal
        rank={openTier}
        current={partner.tier}
        volume={overview.volume30d}
        traders={overview.activeTraders}
        achievedAt={{}}
        tiers={tiers}
        onClose={() => setOpenTier(null)}
      />
      <TermsModal open={termsOpen} now={now} onClose={() => setTermsOpen(false)} />
    </section>
  );
};
