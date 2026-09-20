import { axisDate } from '../../lib/format';
import type { OverviewSeriesPoint } from '../../types';
import s from './EarningsChart.module.css';

/**
 * Hand-rolled — a charting library would ship more bytes than this file and
 * still not match the design. The path is drawn in a fixed 900×190 user space
 * and stretched by `preserveAspectRatio="none"`, so the stroke width stays
 * visually constant while the card resizes.
 */
const W = 900;
const H = 190;
const BASELINE = 172;
const TOP = 24;
const BOTTOM = 156;
const GRID = [40, 85, 130, 172];

const buildPaths = (points: OverviewSeriesPoint[]) => {
  const values = points.map((p) => p.amount);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);

  const x = (i: number) => (i / (points.length - 1)) * W;
  const y = (v: number) => BOTTOM - ((v - min) / span) * (BOTTOM - TOP);

  // cubic segments with horizontal tangents: smooth, and it never overshoots
  // the data the way a Catmull-Rom spline would on a spiky day
  let line = `M${x(0).toFixed(1)},${y(values[0]).toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const x0 = x(i - 1);
    const x1 = x(i);
    const cp = (x1 - x0) * 0.4;
    line +=
      ` C${(x0 + cp).toFixed(1)},${y(values[i - 1]).toFixed(1)}` +
      ` ${(x1 - cp).toFixed(1)},${y(values[i]).toFixed(1)}` +
      ` ${x1.toFixed(1)},${y(values[i]).toFixed(1)}`;
  }

  return { line, area: `${line} L${W},${BASELINE} L0,${BASELINE} Z` };
};

export const EarningsChart = ({
  points,
  ticks,
}: {
  points: OverviewSeriesPoint[];
  ticks: OverviewSeriesPoint[];
}) => {
  const { line, area } = buildPaths(points);

  return (
    <div className={s.wrap}>
      <svg
        className={s.chart}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Earnings trend"
      >
        <defs>
          <linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--mint)" stopOpacity=".3" />
            <stop offset="100%" stopColor="var(--mint)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="var(--line-soft)" strokeWidth="1">
          {GRID.map((y) => <line key={y} x1="0" y1={y} x2={W} y2={y} />)}
        </g>
        <path d={area} fill="url(#earningsFill)" />
        <path d={line} fill="none" stroke="var(--mint)" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      <div className={s.axis}>
        {ticks.map((t) => <span key={t.date}>{axisDate(t.date)}</span>)}
      </div>
    </div>
  );
};
