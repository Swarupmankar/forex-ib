import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Medal } from '../../components/Medal';
import { InfoIcon } from '../../components/icons';
import { RATE_ROWS, groupExamples, groupRate } from '../../data/rates';
import { TIERS } from '../../data/tiers';
import { useAccountTypes, useMergedTiers } from '../../api/hooks';
import { usd } from '../../lib/format';
import type { TierRank } from '../../types';
import s from './RateCard.module.css';

export const RateCard = ({ tier }: { tier: TierRank }) => {
  const mergedTiers = useMergedTiers();
  // Account types from Account Types Management
  const accountTypes = useAccountTypes();
  const tiersList = mergedTiers.length > 0 ? mergedTiers : TIERS;
  const previews = tiersList.slice(Math.max(0, tier - 1), Math.max(0, tier - 1) + 3);
  const [selected, setSelected] = useState<TierRank>(tier);
  const active = tiersList.find((t) => t.rank === selected) ?? tiersList[Math.min(selected - 1, tiersList.length - 1)] ?? TIERS[0];
  const isOwnTier = selected === tier;

  /** Rate the admin published for this tier, in cents; null when none is set. */
  const getCellRate = (rowId: string, accId: string): number | null => {
    const v = groupRate(active.rates, rowId, accId);
    return v === null ? null : Math.round(v * 100);
  };

  /** The rate card marks the best-paying account type on each row. */
  const bestAccountType = (rowId: string): string | null => {
    let best: { id: string; v: number } | null = null;
    for (const a of accountTypes) {
      const v = getCellRate(rowId, a.id);
      if (v !== null && v > 0 && (!best || v > best.v)) best = { id: a.id, v };
    }
    return best?.id ?? null;
  };

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Rate card</div>
          <div className="card-sub">USD per standard lot, credited when the trade closes.</div>
        </div>
        <div className={s.tabs}>
          {previews.map((t) => (
            <button
              key={t.rank}
              className={`btn btn-sm${t.rank === selected ? ' btn-dark' : ''}`}
              aria-pressed={t.rank === selected}
              onClick={() => setSelected(t.rank)}
            >
              {t.rank === tier ? 'Your rate' : t.shortName}
            </button>
          ))}
        </div>
      </div>

      <div className={s.tierbanner}>
        <Medal tier={selected} className={s.tbMed} />
        <div className={s.tbnTxt}>
          Showing <b>{active.name}</b> rates — base rates plus {isOwnTier ? 'your' : 'a'}{' '}
          <b>{active.upliftLabel}</b> tier uplift.
        </div>
        <Link className="btn btn-sm" to="/rewards">See tiers</Link>
      </div>

      <div className={s.scroll}>
        <table className={s.tbl}>
          <thead>
            <tr>
              <th>Instrument group</th>
              {accountTypes.map((a) => (
                <th key={a.id} className={s.acct}>
                  {a.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RATE_ROWS.map((row) => {
              const best = bestAccountType(row.id);
              return (
                <tr key={row.id}>
                  <td>
                    <div className={s.sym}>
                      <div>
                        {row.group}
                        <small>{groupExamples(active.rates, row.id) ?? row.examples}</small>
                      </div>
                    </div>
                  </td>
                  {accountTypes.map((a) => {
                    const rate = getCellRate(row.id, a.id);
                    return (
                      <td key={a.id} className={`${s.v}${a.id === best ? ` ${s.best}` : ''}`}>
                        {rate === null ? '—' : usd(rate)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={s.foot}>
        <InfoIcon />
        <div>
          <b>Why Raw Spread and Zero pay less.</b> On those accounts the client pays a separate
          per-lot commission and the spread is close to zero, so there is less broker revenue per
          lot to share. Standard and Pro accounts earn from the spread itself, which is why the
          rebate is higher. Rates apply to closed positions held longer than 3 minutes; scalped and
          arbitrage volume is reviewed before it is credited.
        </div>
      </div>
    </div>
  );
};
