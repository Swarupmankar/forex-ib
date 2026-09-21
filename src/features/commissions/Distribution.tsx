import { useState, type CSSProperties } from 'react';
import { accountTypeName } from '../../data/rates';
import { lots, pct0, usd } from '../../lib/format';
import type { Distribution as DistributionData, AccountTypeId } from '../../types';
import s from './Distribution.module.css';

const R = 94;
const C = 2 * Math.PI * R;
const CENTER = 120;

export const Distribution = ({ data }: { data: DistributionData }) => {
  const [selected,setSelected] = useState<AccountTypeId|null>(null);
  const [hovered,setHovered] = useState<AccountTypeId|null>(null);
  const [focused,setFocused] = useState<AccountTypeId|null>(null);
  const total = data.rows.reduce((sum,row)=>sum+Math.max(0,row.commission),0);
  const active = data.rows.find(row=>row.accountType===(hovered??focused??selected));
  const positiveCount = data.rows.filter(row=>row.commission>0).length;
  let cursor = 0;
  const segments = data.rows.map(row=>{
    const share = total>0?Math.max(0,row.commission)/total:0;
    const gap = positiveCount>1?Math.min(4,share*C*.2):0;
    const start = cursor+gap/2;
    const middle = (cursor+share*C/2)/C*Math.PI*2-Math.PI/2;
    cursor+=share*C;
    return {row,share,start,length:Math.max(0,share*C-gap),x:CENTER+Math.cos(middle)*R,y:CENTER+Math.sin(middle)*R};
  });
  return <div className={s.dist}>
    <div className={s.visual}>
      <div className={s.donutWrap}>
        <svg className={s.donut} viewBox="0 0 240 240" role="img" aria-label={total?`Commission by account type, total ${usd(total)}`:'No commission recorded in this period'}>
          <circle cx={CENTER} cy={CENTER} r={R} fill="none" stroke="var(--line-soft)" strokeWidth="27"/>
          <g transform="rotate(-90 120 120)">{segments.filter(seg=>seg.length>0).map(({row,length,start})=><circle key={row.accountType}
            className={s.segment} data-muted={!!active&&active.accountType!==row.accountType}
            cx={CENTER} cy={CENTER} r={R} fill="none" stroke={row.colour} strokeWidth="27"
            strokeDasharray={`${length} ${C-length}`} strokeDashoffset={-start}
            onMouseEnter={()=>setHovered(row.accountType)} onMouseLeave={()=>setHovered(null)}
          ><title>{accountTypeName(row.accountType)}: {usd(row.commission)}</title></circle>)}</g>
          {segments.filter(seg=>seg.share>=.08).map(({row,share,x,y})=><text key={row.accountType} x={x} y={y} className={s.arcLabel} data-muted={!!active&&active.accountType!==row.accountType} textAnchor="middle" dominantBaseline="central" aria-hidden="true">{pct0(share)}</text>)}
        </svg>
        <div className={s.donutCore}>
          <span className={s.dcLab}>{active?accountTypeName(active.accountType):'Total commission'}</span>
          <strong key={active?.accountType??'total'} className={s.dcNum} data-long={usd(active?.commission??total).length>11}>{usd(active?.commission??total)}</strong>
          <span className={s.dcDetail}>{active?`${pct0(total?active.commission/total:0)} of total`:`Last ${data.window.replace('d',' days')}`}</span>
        </div>
      </div>
      <div className={s.chartCaption}>{selected?<button onClick={()=>{setSelected(null);setHovered(null);setFocused(null)}}>Show total</button>:<span>{total?'Commission by account type':'No commission in this period'}</span>}</div>
    </div>
    <div className={s.breakdown}>
      <div className={s.legendHead}><span>Account type</span><span>Commission</span></div>
      <div className={s.distRows}>
        {segments.map(({row,share})=><button type="button" key={row.accountType} className={s.dr}
          aria-pressed={selected===row.accountType} aria-label={`Explore ${accountTypeName(row.accountType)} commission`}
          onClick={()=>setSelected(value=>value===row.accountType?null:row.accountType)}
          onMouseEnter={()=>setHovered(row.accountType)} onMouseLeave={()=>setHovered(null)}
          onFocus={()=>setFocused(row.accountType)} onBlur={()=>setFocused(null)}
          data-active={active?.accountType===row.accountType} style={{'--segment-color':row.colour} as CSSProperties}>
          <span className={s.legendDot}/>
          <span className={s.drName}>{accountTypeName(row.accountType)}<small>{lots(row.lots)} lots <span aria-hidden="true">·</span> {usd(row.perLot)} / lot</small></span>
          <span className={s.amount}>{usd(row.commission)}<small>{pct0(share)}</small></span>
        </button>)}
      </div>
      <p className={s.legendHint}>{total?'Select an account type to see its share.':'Recorded commissions will appear here.'}</p>
    </div>
  </div>;
};
