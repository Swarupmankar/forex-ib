import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Medal, MEDAL_MATERIALS } from '../../components/Medal';
import type { TierProgress } from '../../lib/useTierProgress';
import type { Tier } from '../../data/tiers';
import { int, lots, pct0, usdWhole } from '../../lib/format';
import type { TierRank } from '../../types';
import s from './OverviewProgress.module.css';

export const OverviewTier = ({ progress, onSelect }: { progress: TierProgress; onSelect: (rank: TierRank) => void }) => {
  const {current,next} = progress;
  const percent = Math.max(0, Math.min(1, progress.pctToNext));
  return <div className={s.tierPanel}>
    <div className={s.tierIdentity}><Medal tier={current.rank} className={s.medal}/><div><p className={s.eyebrow}>Your partner tier</p><h2>{current.name}</h2><span>{MEDAL_MATERIALS[Math.min(5,Math.max(0,current.rank-1))]} finish · {current.upliftLabel} rates</span></div></div>
    <div className={s.progressHeading}><span>{next ? `Progress to ${next.shortName}` : 'Highest tier reached'}</span><strong>{pct0(percent)}</strong></div>
    <div className={s.meter} role="progressbar" aria-label="Progress to next tier" aria-valuenow={Math.round(percent*100)} aria-valuemin={0} aria-valuemax={100}><i style={{transform:`scaleX(${percent})`}}/></div>
    {next ? <div className={s.gates}>
      <div><span>Volume remaining</span><strong>{lots(progress.lotsRemaining)} <small>lots</small></strong></div>
      <div><span>Traders remaining</span><strong>{int(progress.tradersRemaining)} <small>active</small></strong></div>
    </div> : <p className={s.complete}>You have reached the highest tier in the programme.</p>}
    <button className={s.detailLink} onClick={()=>onSelect(next?.rank ?? current.rank)}>View {next ? 'next tier' : 'tier'} details <span aria-hidden="true">↗</span></button>
  </div>;
};

export const RewardTimeline = ({tiers,current,onSelect,progress}: {tiers:Tier[];current:TierRank;onSelect:(rank:TierRank)=>void;progress?:TierProgress}) => {
  const next = progress?.next ?? tiers.find(tier => tier.rank === current + 1);
  const root = useRef<HTMLElement>(null);
  const [revealed,setRevealed] = useState(false);
  useEffect(()=>{
    const observer = new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setRevealed(true);observer.disconnect();}},{threshold:.15});
    if(root.current)observer.observe(root.current);
    return ()=>observer.disconnect();
  },[]);
  return <section ref={root} data-revealed={revealed} className={`card ${s.timelineCard}`} aria-labelledby="reward-journey-title">
  <div className="card-head"><div><h2 id="reward-journey-title" className="card-title">One-time rewards</h2><p className="card-sub">A new milestone. A one-time reward.</p></div></div>
  <div className={s.nextReward}>
    <div className={s.nextRewardCopy}><span className={s.nextLabel}>{next ? 'Your next milestone' : 'Programme completed'}</span>
      <h3>{next?.name ?? 'Highest tier reached'}</h3>
      <strong>{next?.cashBonus ? usdWhole(next.cashBonus) : next ? 'Tier benefits' : 'All tiers unlocked'}</strong>
      <span className={s.nextCaption}>{next?.cashBonus ? 'One-time qualification bonus' : next ? 'Explore your next tier’s benefits' : 'View each milestone below'}</span>
    </div>
    <Medal tier={next?.rank ?? current} className={s.nextMedal}/>
    {next && progress && <div className={s.nextProgress}>
      {[['Volume',progress.lotsRatio,`${lots(progress.lotsRemaining)} lots to go`],['Active traders',progress.tradersRatio,`${int(progress.tradersRemaining)} to go`]].map(([label,ratio,remaining])=><div key={String(label)}>
        <div><span>{label}</span><span>{Number(ratio)>=1?'Complete':remaining}</span></div>
        <div className={s.nextTrack} role="progressbar" aria-label={`${label} qualification`} aria-valuenow={Math.round(Math.max(0,Math.min(1,Number(ratio)))*100)} aria-valuemin={0} aria-valuemax={100}><i style={{transform:`scaleX(${Math.max(0,Math.min(1,Number(ratio)))})`}}/></div>
      </div>)}
    </div>}
    {next && <button className={s.nextAction} onClick={()=>onSelect(next.rank)}>Explore this reward <span aria-hidden="true">↗</span></button>}
  </div>
  <div className={s.journeyLabel}><span>Reward milestones</span><span>{current} of {tiers.length} tiers</span></div>
  <ol className={s.timeline}>
    {tiers.map((tier,i)=><li key={tier.rank} data-state={tier.rank<current?'reached':tier.rank===current?'current':tier.rank===current+1?'next':'upcoming'} style={{'--step':i} as CSSProperties}>
      <button onClick={()=>onSelect(tier.rank)} aria-label={`View ${tier.name} reward details`}>
        <span className={s.station}><Medal tier={tier.rank}/></span>
        <span className={s.milestone}><span className={s.milestoneName}>{tier.name}</span><span className={s.milestoneDetail}>{tier.rank===1?'Starting tier':`${int(tier.minLots)} lots · ${int(tier.minActiveTraders)} active traders`}</span><span className={s.rewardValue}>{tier.cashBonus ? `${usdWhole(tier.cashBonus)} bonus` : 'Partner benefits'}</span></span>
        <span className={s.milestoneState}>{tier.rank<current?'Reached':tier.rank===current?'Current':tier.rank===current+1?'Next':'Locked'}<span aria-hidden="true">↗</span></span>
      </button>
    </li>)}
  </ol>
  <p className={s.timelineFoot}>Tier milestones are shown here. Payment status is available in your reward history.</p>
</section>;
};
