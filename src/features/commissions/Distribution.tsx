import { InfoIcon } from '../../components/icons';
import { accountTypeName } from '../../data/rates';
import { lots, pct0, usd, usdWhole } from '../../lib/format';
import type { Distribution as DistributionData } from '../../types';
import s from './Distribution.module.css';

/**
 * Donut geometry. Each arc is a dash on one circle: `dasharray` is
 * "visible gap", `dashoffset` walks the start point round. The 4-unit gap and
 * the 2.4 trimmed off each arc account for the round line caps, which extend
 * every segment by half the stroke width at both ends.
 */
const R = 54;
const CIRCUMFERENCE = 2 * Math.PI * R;
const GAP = 4;
const CAP_TRIM = 2.4;

const arcs = (data: DistributionData) => {
  let cursor = 0;
  return data.rows.map((row) => {
    const share = row.commission / data.total;
    const length = Math.max(0, share * CIRCUMFERENCE - CAP_TRIM);
    const offset = -cursor;
    cursor += length + GAP;
    return { row, share, length, offset };
  });
};

export const Distribution = ({ data }: { data: DistributionData }) => {
  const segments = arcs(data);
  const totalLots = data.rows.reduce((sum, r) => sum + r.lots, 0);

  const raw = data.rows.find((r) => r.accountType === 'raw');
  const best = data.rows.reduce((a, b) => (a.perLot > b.perLot ? a : b));

  return (
    <>
      <div className={s.dist}>
        <div className={s.donutWrap}>
          <svg className={s.donut} viewBox="0 0 140 140" role="img" aria-label="Commission by account type">
            <circle cx="70" cy="70" r={R} fill="none" stroke="var(--line-soft)" strokeWidth="15" />
            {segments.map(({ row, length, offset }) => (
              <circle
                key={row.accountType}
                cx="70" cy="70" r={R} fill="none"
                stroke={row.colour}
                strokeWidth="15"
                strokeDasharray={`${length.toFixed(1)} ${(CIRCUMFERENCE - length).toFixed(1)}`}
                strokeDashoffset={offset.toFixed(1)}
                strokeLinecap="round"
              />
            ))}
          </svg>
          <div className={s.donutCore}>
            <div className={s.dcNum}>{usdWhole(data.total)}</div>
            <div className={s.dcLab}>last {data.window.replace('d', ' days')}</div>
          </div>
        </div>

        <div className={s.distRows}>
          <div className={`${s.dr} ${s.drHead}`}>
            <span />
            <span>Account type</span>
            <span className="qty">Commission</span>
            <span className={`qty ${s.secondary}`}>Share</span>
            <span className={`qty ${s.secondary}`}>Lots</span>
            <span className="qty">Per lot</span>
          </div>

          {segments.map(({ row, share }) => (
            <div className={s.dr} key={row.accountType}>
              <i style={{ background: row.colour }} />
              <span className={s.drN}>
                {accountTypeName(row.accountType)}
                <small>
                  {row.traders} traders · {row.accountType === 'standard' || row.accountType === 'pro'
                    ? 'spread-based'
                    : 'commission a/c'}
                </small>
              </span>
              <span className="qty">{usd(row.commission)}</span>
              <span className={`qty ${s.secondary}`}>{pct0(share)}</span>
              <span className={`qty ${s.secondary}`}>{lots(row.lots)}</span>
              <span className={`qty ${row.perLot === best.perLot ? s.hi : row.perLot === Math.min(...data.rows.map((r) => r.perLot)) ? s.lo : ''}`}>
                {usd(row.perLot)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {raw && (
        <div className={s.foot}>
          <InfoIcon />
          <div>
            Raw Spread traders account for {pct0(raw.lots / totalLots)} of your volume but only{' '}
            {pct0(raw.commission / data.total)} of your commission — those accounts pay a thinner
            rebate because the client already pays a separate per-lot fee.{' '}
            {accountTypeName(best.accountType)} accounts are where volume is worth the most to you.
          </div>
        </div>
      )}
    </>
  );
};
