import type { ReactNode } from 'react';
import { Medal } from './Medal';
import { pct0 } from '../lib/format';
import type { TierRank } from '../types';
import s from './Hero.module.css';

export const Hero = ({
  children,
  single,
  className = '',
  secondOrb = true,
}: {
  children: ReactNode;
  /** single-column hero (Payouts) */
  single?: boolean;
  className?: string;
  secondOrb?: boolean;
}) => (
  <div className={`${s.hero} ${className}`}>
    <span className={`${s.orb} ${s.orbA}`} />
    {secondOrb && <span className={`${s.orb} ${s.orbB}`} />}
    <div className={`${s.heroIn}${single ? ` ${s.single}` : ''}`}>{children}</div>
  </div>
);

export const HeroLabel = ({ children }: { children: ReactNode }) => (
  <div className={s.heroLab}>{children}</div>
);

export const HeroNumber = ({ children, words }: { children: ReactNode; words?: boolean }) => (
  <div className={`${s.heroNum}${words ? ` ${s.words}` : ''}`}>{children}</div>
);

export const HeroFoot = ({ children }: { children: ReactNode }) => (
  <div className={s.heroFoot}>{children}</div>
);

export const HeroNote = ({ children }: { children: ReactNode }) => (
  <span className={s.heroNote}>{children}</span>
);

export const HeroCta = ({ children }: { children: ReactNode }) => (
  <div className={s.heroCta}>{children}</div>
);

export const HeroFacts = ({ items }: { items: { value: ReactNode; label: string }[] }) => (
  <div className={s.heroFacts}>
    {items.map((f) => (
      <span className={s.fact} key={f.label}>
        <em>{f.value}</em>
        <i>{f.label}</i>
      </span>
    ))}
  </div>
);

export const HeroSplits = ({
  items,
}: {
  items: { label: string; value: ReactNode; detail?: string; tone?: 'mint' }[];
}) => (
  <div className={s.heroSplits}>
    {items.map((it) => (
      <div className={s.hs} key={it.label}>
        <div className={s.heroLab}>{it.label}</div>
        <div className={s.hsV} style={it.tone === 'mint' ? { color: 'var(--mint-lt)' } : undefined}>
          {it.value}
        </div>
        {it.detail && <div className={s.hsD}>{it.detail}</div>}
      </div>
    ))}
  </div>
);

/**
 * The progress ring. `progress` is the LOWER of the two tier gates, capped at
 * 1 — which is why this can read 61% while the trader gate is already cleared.
 */
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const TierDial = ({
  tier,
  progress,
  caption,
  label,
  name,
}: {
  tier: TierRank;
  progress: number;
  /** e.g. "61% to Elite" */
  caption: string;
  /** e.g. "Tier 03 of 06" */
  label: string;
  /** the pill under the ring */
  name: string;
}) => (
  <div className={s.dial}>
    <svg className={s.ring} viewBox="0 0 120 120">
      <circle className={s.ringBg} cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="9" />
      <circle
        className={s.ringFg}
        cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="9"
        strokeDasharray={CIRCUMFERENCE.toFixed(1)}
        strokeDashoffset={(CIRCUMFERENCE * (1 - progress)).toFixed(1)}
      />
    </svg>
    <div className={s.dialCore}>
      <Medal tier={tier} className={s.dialMed} />
      <div className={s.dialPct}>{caption}</div>
      <div className={s.dialCap}>{label}</div>
    </div>
    <div className={s.dialName}>{name}</div>
  </div>
);

/** The dial's mobile stand-in — same numbers, a fraction of the height. */
export const TierMini = ({
  tier,
  name,
  progress,
  note,
}: {
  tier: TierRank;
  name: string;
  progress: number;
  note: string;
}) => (
  <div className={s.tierMini}>
    <Medal tier={tier} className={s.tmMed} />
    <div className={s.tmBody}>
      <div className={s.tmTop}>
        <span className={s.tmName}>{name}</span>
        <span className={s.tmPct}>{pct0(progress)}</span>
      </div>
      <div className={s.tmBar}><i style={{ width: pct0(progress) }} /></div>
      <div className={s.tmNote}>{note}</div>
    </div>
  </div>
);
