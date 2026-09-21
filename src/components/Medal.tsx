import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import type { TierRank } from '../types';
import './Medal.css';

export const MEDAL_MATERIALS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Ruby', 'Diamond'];
const MATERIALS = [
  { light: '#ffdfb5', mid: '#ce8b4f', shade: '#87502c', deep: '#342015' },
  { light: '#ffffff', mid: '#cbd7e0', shade: '#708799', deep: '#203443' },
  { light: '#fff5c8', mid: '#e9bd55', shade: '#93651f', deep: '#33250d' },
  { light: '#ffffff', mid: '#dbe8ec', shade: '#78939e', deep: '#223d49' },
  { light: '#ffc5d4', mid: '#e83362', shade: '#a00a38', deep: '#3a0920' },
  { light: '#ffffff', mid: '#d0ebf5', shade: '#6998b3', deep: '#274d66' },
];
const SHIELD = 'M60 15 108 32v29c0 24-20 43-48 56C32 104 12 85 12 61V32Z';
const SHIELD_FACE = 'm60 25 38 14v22c0 20-17 36-38 47-21-11-38-27-38-47V39Z';
const STAR = 'M60 5 73 39 99 26 86 53 114 65 86 77 99 104 73 91 60 125 47 91 21 104 34 77 6 65 34 53 21 26 47 39Z';
const RUBY = 'M31 15h58l24 24v46l-24 26H31L7 85V39Z';
const DIAMOND = 'M30 24h60l23 29-53 69L7 53Z';
const CROWN = 'm40 32-4-16 15 7 9-13 9 13 15-7-4 16Z';
// The same source geometry as BrandMark; tier materials never alter its proportions.
const GATE_LEFT = 'M4 4 164 125V370L4 491Z';
const GATE_RIGHT = 'M452 4 292 125V370L452 491Z';
const GATE = `${GATE_LEFT} ${GATE_RIGHT}`;
const LEAVES = [
  'M24 44C12 43 8 33 12 26c10 3 15 10 12 18Z',
  'M20 62C7 58 4 47 8 40c11 5 15 13 12 22Z',
  'M23 81C8 79 4 69 6 61c13 3 19 12 17 20Z',
  'M34 98C19 101 10 92 9 84c14-2 23 5 25 14Z',
  'M50 110C36 118 23 111 20 104c13-6 25-3 30 6Z',
];

/** Six distinct forms with a shared light source, relief depth and brand mark. */
export const Medal = ({ tier, className = '' }: { tier: TierRank; className?: string }) => {
  const id = `medal-${useId().replace(/:/g, '')}`;
  const root = useRef<SVGSVGElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const node = root.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) { setRevealed(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: .5 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const index = Math.max(0, Math.min(5, tier - 1));
  const { light, mid, shade, deep } = MATERIALS[index];
  const relief = index === 4 ? { light: '#fff7fa', mid: '#dec5cf', shade: '#986f80', deep: '#4c2334' } : { light, mid, shade, deep };
  const paint = (name: string) => `url(#${id}-${name})`;
  const goldLeaves = (detailed = false) => [false, true].map(mirror => (
    <g key={String(mirror)} transform={mirror ? 'translate(120 0) scale(-1 1)' : undefined}>
      {LEAVES.map((d, i) => <g key={i}>
        <path d={d} fill={detailed ? paint('leaf') : undefined} stroke={detailed ? light : undefined} strokeWidth=".45" />
        {detailed && <path d={[
          'm13 31 10 11', 'm9 45 10 15', 'm9 66 13 13', 'm14 88 18 9', 'm26 106 22 4',
        ][i]} fill="none" stroke={deep} opacity=".35" strokeWidth=".5" />}
      </g>)}
    </g>
  ));
  const outline = index === 0 ? <circle cx="60" cy="64" r="47" />
    : index === 1 ? <path d={SHIELD} />
    : index === 2 ? <><circle cx="60" cy="67" r="37" /><path d={CROWN} />{goldLeaves()}</>
    : <path d={index === 3 ? STAR : index === 4 ? RUBY : DIAMOND} />;
  const mark = (x: number, y: number, scale: number, engraved = false) => (
    <g filter={`url(#${id}-relief-shadow)`}>
      <g className="jewel-mark" transform={`translate(${x} ${y}) scale(${scale})`}>
        <path d={GATE} transform="translate(0 22)" fill={engraved ? '#466c7e' : relief.deep} />
        <path d={GATE_LEFT} fill={engraved ? paint('engraving') : paint('mark-left')} />
        <path d={GATE_RIGHT} fill={engraved ? paint('engraving') : paint('mark-right')} />
        <path d="M4 4 164 125 153 131 14 24V474L4 491ZM452 4 292 125 303 131 442 24V474L452 491Z" fill={engraved ? '#e7faff' : relief.light} opacity=".85" />
        <path d="M164 125V370L4 491M292 125V370L452 491" fill="none" stroke={engraved ? '#e9fbff' : relief.deep} strokeWidth="7" strokeLinejoin="round" opacity=".65" />
        <path d="M13 21V470M443 21V470" stroke={engraved ? '#fff' : relief.light} strokeWidth="3" opacity=".7" />
      </g>
    </g>
  );

  return <svg ref={root} data-revealed={revealed} className={`medal tier-jewel t${tier} ${className}`.trim()} viewBox="0 0 120 136" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" data-material={MEDAL_MATERIALS[index]} style={{ '--jewel-delay': `${index * 65}ms` } as CSSProperties}>
    <defs>
      <linearGradient id={`${id}-metal`} x1=".12" y1="0" x2=".82" y2="1">
        <stop stopColor={light} /><stop offset=".2" stopColor={mid} /><stop offset=".45" stopColor={shade} /><stop offset=".58" stopColor={light} /><stop offset=".77" stopColor={mid} /><stop offset="1" stopColor={shade} />
      </linearGradient>
      <linearGradient id={`${id}-face`} x1=".12" y1="0" x2=".8" y2="1">
        <stop stopColor={light} /><stop offset=".24" stopColor={mid} /><stop offset=".65" stopColor={shade} /><stop offset="1" stopColor={mid} />
      </linearGradient>
      <linearGradient id={`${id}-dark`} x1=".1" y1="0" x2=".8" y2="1"><stop stopColor={shade} /><stop offset=".6" stopColor={deep} /><stop offset="1" stopColor={shade} /></linearGradient>
      <linearGradient id={`${id}-mark-left`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor={relief.light} /><stop offset=".26" stopColor={relief.mid} /><stop offset=".47" stopColor={relief.light} /><stop offset=".5" stopColor={relief.mid} /><stop offset="1" stopColor={relief.shade} /></linearGradient>
      <linearGradient id={`${id}-mark-right`} x1="0" y1="0" x2="1" y2=".85"><stop stopColor={relief.shade} /><stop offset=".35" stopColor={relief.mid} /><stop offset=".7" stopColor={relief.light} /><stop offset="1" stopColor={relief.mid} /></linearGradient>
      <linearGradient id={`${id}-engraving`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={deep} /><stop offset="1" stopColor={shade} /></linearGradient>
      <linearGradient id={`${id}-gem`} x1="0" y1="0" x2=".85" y2="1"><stop stopColor={light} /><stop offset=".35" stopColor={mid} /><stop offset="1" stopColor={deep} /></linearGradient>
      <linearGradient id={`${id}-reflection`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".45" /><stop offset=".46" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity=".08" /></linearGradient>
      <linearGradient id={`${id}-sheen`}><stop stopColor="#fff" stopOpacity="0" /><stop offset=".42" stopColor="#fff" stopOpacity=".08" /><stop offset=".55" stopColor="#fff" stopOpacity=".42" /><stop offset=".63" stopColor="#fff" stopOpacity=".12" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
      <radialGradient id={`${id}-enamel`} cx=".32" cy=".16" r=".95"><stop stopColor={shade} /><stop offset=".38" stopColor={deep} /><stop offset=".8" stopColor="#111b20" /><stop offset="1" stopColor={shade} /></radialGradient>
      <linearGradient id={`${id}-leaf`} x1="0" y1=".1" x2="1" y2=".75"><stop stopColor={shade} /><stop offset=".18" stopColor={mid} /><stop offset=".46" stopColor={light} /><stop offset=".58" stopColor={mid} /><stop offset="1" stopColor={shade} /></linearGradient>
      <linearGradient id={`${id}-glass`} x1=".15" y1="0" x2=".7" y2="1"><stop stopColor="#fff" stopOpacity=".3" /><stop offset=".4" stopColor="#fff" stopOpacity=".05" /><stop offset=".41" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity=".08" /></linearGradient>
      <linearGradient id={`${id}-ruby-table`} x1=".1" y1="0" x2=".8" y2="1"><stop stopColor="#e64f79" /><stop offset=".28" stopColor="#a91746" /><stop offset=".65" stopColor="#600f30" /><stop offset="1" stopColor="#c32255" /></linearGradient>
      <linearGradient id={`${id}-ice-table`} x1=".05" y1="0" x2=".75" y2="1"><stop stopColor="#f7fdff" /><stop offset=".3" stopColor="#cce5ee" /><stop offset=".62" stopColor="#8cb9cf" /><stop offset="1" stopColor="#e5f6fc" /></linearGradient>
      <pattern id={`${id}-brushed`} patternUnits="userSpaceOnUse" width="3" height="1.4" patternTransform="rotate(-24)"><path d="M0 0H3" stroke={light} strokeOpacity=".16" strokeWidth=".22" /></pattern>
      <filter id={`${id}-relief-shadow`} x="-30%" y="-25%" width="160%" height="175%" colorInterpolationFilters="sRGB"><feDropShadow dx="0" dy="1.2" stdDeviation=".65" floodColor={deep} floodOpacity=".65" /></filter>
      <linearGradient id={`${id}-cut`} x1="0" y1="0" x2="1" y2=".85"><stop stopColor={light} /><stop offset=".32" stopColor={mid} /><stop offset=".33" stopColor={shade} /><stop offset=".68" stopColor={deep} /><stop offset="1" stopColor={mid} /></linearGradient>
      <radialGradient id={`${id}-shadow`}><stop stopColor="#000" stopOpacity=".18" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
      <clipPath id={`${id}-clip`}>{outline}</clipPath>
    </defs>
    <ellipse cx="60" cy="129" rx="35" ry="4" fill={paint('shadow')} />
    <g className="jewel-body">
      {index === 0 && <>
        <circle cx="60" cy="69" r="47" fill={paint('cut')} />
        <circle cx="60" cy="64" r="47" fill={paint('metal')} stroke={light} strokeWidth=".8" />
        <circle cx="60" cy="64" r="46" fill={paint('brushed')} />
        <circle cx="60" cy="64" r="43.5" fill="none" stroke={deep} strokeWidth=".75" />
        <g className="jewel-fine-detail">{Array.from({ length: 40 }, (_, i) => <path key={i} d="M60 19v2.8" stroke={i % 2 ? shade : light} strokeWidth=".8" transform={`rotate(${i * 9} 60 64)`} />)}</g>
        <circle cx="60" cy="64" r="39.5" fill={paint('enamel')} stroke={light} strokeWidth=".8" />
        <circle cx="60" cy="64" r="38" fill={paint('glass')} />
        <circle cx="60" cy="64" r="36.5" fill="none" stroke={mid} opacity=".5" strokeWidth=".65" />
        <path d="M27 82a38 38 0 0 0 66 0" fill="none" stroke={mid} strokeWidth=".65" opacity=".65" />
        <path d="M18 47a45 45 0 0 1 71-19" fill="none" stroke={light} strokeWidth="1.8" strokeLinecap="round" />
        {mark(36.5, 36, .104)}
        <path d="m47 96 13 3 13-3" fill="none" stroke={mid} strokeWidth="1" />
      </>}
      {index === 1 && <>
        <path d={SHIELD} transform="translate(0 5)" fill={paint('cut')} /><path d={SHIELD} fill={paint('metal')} stroke={light} strokeWidth=".8" />
        <path d={SHIELD} fill={paint('brushed')} />
        <path d={SHIELD_FACE} fill={paint('enamel')} stroke={deep} strokeWidth="1" />
        <path d={SHIELD_FACE} fill={paint('glass')} />
        <path d="m60 28 35 13v20c0 18-15 33-35 44-20-11-35-26-35-44V41Z" fill="none" stroke={mid} strokeWidth=".6" opacity=".45" />
        <path d="m33 86 27 17 27-17" fill="none" stroke={paint('metal')} strokeWidth="3" strokeLinejoin="round" />
        <path d="m17 34 43-15 43 15M17 34v27c0 22 19 40 43 51" stroke={light} opacity=".9" strokeWidth="1" fill="none" />
        {mark(36.5, 34, .104)}
      </>}
      {index === 2 && <>
        <path d="M60 115C24 105 10 80 20 40M60 115c36-10 50-35 40-75" fill="none" stroke={shade} strokeWidth="2.5" />
        {goldLeaves(true)}
        <circle cx="60" cy="71" r="36" fill={paint('cut')} /><circle cx="60" cy="67" r="36" fill={paint('metal')} stroke={light} strokeWidth=".8" />
        <circle cx="60" cy="67" r="35" fill={paint('brushed')} />
        <circle cx="60" cy="67" r="29.5" fill={paint('enamel')} stroke={light} strokeWidth=".6" />
        <circle cx="60" cy="67" r="28.5" fill={paint('glass')} />
        <circle cx="60" cy="67" r="26.5" fill="none" stroke={mid} strokeWidth=".6" opacity=".45" />
        <path d={CROWN} fill={paint('metal')} stroke={light} strokeWidth=".7" strokeLinejoin="round" /><path d="M40 32h40" stroke={deep} strokeWidth="1.8" />
        <path d="m38 21 13 8 9-13 9 13 13-8" fill="none" stroke={light} strokeWidth=".8" />
        <path d="M40 29h40v3H40Z" fill={paint('leaf')} /><path d="M43 30h34" stroke={light} strokeWidth=".5" />
        {mark(41, 42, .084)}
      </>}
      {index === 3 && <>
        <path d={STAR} transform="translate(0 4)" fill={paint('cut')} /><path d={STAR} fill={paint('metal')} stroke={light} strokeWidth=".7" />
        <path d="M60 5v60l13-26ZM99 26 60 65l26-12ZM114 65H60l26 12ZM99 104 60 65l13 26ZM60 125V65L47 91ZM21 104 60 65 34 77ZM6 65h54L34 53ZM21 26 60 65 47 39Z" fill={paint('face')} />
        <path d="M60 5v60l-13-26ZM114 65H60l26-12ZM60 125V65l13 26ZM6 65h54L34 77Z" fill={deep} opacity=".5" />
        <circle cx="60" cy="65" r="34" fill={paint('metal')} stroke={light} strokeWidth=".8" />
        <path d="M60 8v28M111 65H91M60 122V99M9 65h20" stroke={light} strokeWidth=".85" opacity=".8" />
        <circle cx="60" cy="65" r="32.5" fill={paint('brushed')} />
        <circle cx="60" cy="65" r="28.5" fill={paint('enamel')} stroke={deep} strokeWidth=".9" />
        <circle cx="60" cy="65" r="27.5" fill={paint('glass')} />
        <circle cx="60" cy="65" r="25.5" fill="none" stroke={light} opacity=".4" strokeWidth=".6" />
        {mark(40.5, 42, .086)}
      </>}
      {index === 4 && <>
        <path d={RUBY} transform="translate(0 4)" fill={paint('cut')} /><path d={RUBY} fill={paint('metal')} stroke={light} strokeWidth=".8" />
        <path d="M33 21h54l20 21v41l-20 22H33L13 83V42Z" fill={paint('dark')} />
        <path d="M33 21h54L76 37H44Z" fill={paint('face')} />
        <path d="M33 21 13 42 34 50 44 37Z" fill={paint('gem')} /><path d="m87 21 20 21-21 8-10-13Z" fill={paint('face')} />
        <path d="M13 42v41l21-9V50Z" fill={paint('face')} /><path d="M107 42v41l-21-9V50Z" fill={paint('cut')} />
        <path d="m13 83 20 22 11-16-10-15Z" fill={paint('dark')} /><path d="m107 83-20 22-11-16 10-15Z" fill={paint('gem')} />
        <path d="M33 105h54L76 89H44Z" fill={paint('face')} />
        <path d="M44 37h32l10 13v24L76 89H44L34 74V50Z" fill={paint('enamel')} stroke={light} strokeWidth=".7" />
        <path d="M45 40h30l8 11v22L75 86H45L37 73V51Z" fill={paint('ruby-table')} />
        <path d="M33 26h54l15 18v37l-17 19H35L18 81V44Z" fill="none" stroke={light} strokeOpacity=".3" strokeWidth=".65" />
        <path d="M45 40h30l8 11v22L75 86H45L37 73V51Z" fill={paint('glass')} />
        <path d="M33 21 44 37m43-16L76 37M13 42l21 8m73-8-21 8M13 83l21-9m73 9-21-9M33 105l11-16m43 16L76 89" fill="none" stroke={light} opacity=".45" strokeWidth=".8" />
        {mark(43, 43, .075)}
        <path d="m29 18 7 8m55-8-7 8M29 108l7-8m55 8-7-8" stroke="#f2dde5" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M34 17h52" stroke="#fff2f7" strokeWidth="1.2" />
      </>}
      {index === 5 && <>
        <path d={DIAMOND} transform="translate(0 4)" fill={paint('cut')} /><path d={DIAMOND} fill={paint('metal')} stroke={light} strokeWidth=".8" strokeLinejoin="round" />
        <path d="M30 24 60 24 44 43 19 43Z" fill={light} /><path d="M60 24 90 24 101 43H76Z" fill={mid} />
        <path d="M60 24 44 43h32Z" fill={paint('cut')} />
        <path d="M19 43 7 53h28l9-10Z" fill={shade} /><path d="m101 43 12 10H85l-9-10Z" fill={light} />
        <path d="m44 43-9 10 25 9 25-9-9-10Z" fill={light} />
        <path d="M7 53h28l25 69Z" fill={paint('cut')} /><path d="M113 53H85l-25 69Z" fill={paint('face')} />
        <path d="M35 53 60 62 85 53 60 122Z" fill={paint('ice-table')} />
        <path d="M7 53 31 77 60 122 25 64Z" fill={light} opacity=".38" />
        <path d="M113 53 89 77 60 122 95 64Z" fill={deep} opacity=".24" />
        <path d="M35 53 60 122 49 80Z" fill={light} opacity=".75" /><path d="M85 53 60 122 71 80Z" fill={shade} opacity=".6" />
        <path d="M30 24 19 43 7 53m23-29 14 19-9 10L60 122 85 53l-9-10L90 24M7 53h28l25 9 25-9h28M19 43h82M60 24 44 43m16-19 16 19" fill="none" stroke={light} strokeWidth=".8" opacity=".85" />
        <path d="M30 25h59" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M29 28h62M12 54l48 65" stroke={light} strokeWidth=".65" opacity=".65" />
        {mark(40.5, 44, .086, true)}
      </>}
      <g clipPath={`url(#${id}-clip)`}>
        <path className="jewel-sheen" d="M-65-20H-30L45 150H10Z" fill={paint('sheen')} />
        <path className="jewel-hover-sheen" d="M-65-20H-30L45 150H10Z" fill={paint('sheen')} />
      </g>
    </g>
  </svg>;
};
