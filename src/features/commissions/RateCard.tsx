import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Medal } from '../../components/Medal';
import { InfoIcon } from '../../components/icons';
import { ACCOUNT_TYPES, RATE_ROWS, bestAccountType, displayRate } from '../../data/rates';
import { TIERS } from '../../data/tiers';
import { useMergedTiers } from '../../api/hooks';
import { usd } from '../../lib/format';
import type { AccountTypeId, TierRank } from '../../types';
import s from './RateCard.module.css';

export const RateCard = ({ tier }: { tier: TierRank }) => {
  const mergedTiers = useMergedTiers();
  const tiersList = mergedTiers.length > 0 ? mergedTiers : TIERS;
  const previews = tiersList.slice(Math.max(0, tier - 1), Math.max(0, tier - 1) + 3);
  const [selected, setSelected] = useState<TierRank>(tier);
  const active = tiersList.find((t) => t.rank === selected) ?? tiersList[Math.min(selected - 1, tiersList.length - 1)] ?? TIERS[0];
  const isOwnTier = selected === tier;

  const getCellRate = (rowId: string, accId: string): number => {
    const accKey = accId.toUpperCase();
    if (active.rates && Object.keys(active.rates).length > 0) {
      const symIdMap: Record<string, string[]> = {
        'fx-major': ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'],
        'fx-minor': ['EURGBP', 'EURJPY', 'EURAUD', 'AUDNZD'],
        'fx-exotic': ['USDTRY', 'USDZAR', 'USDMXN'],
        'gold': ['XAUUSD'],
        'metals': ['XAGUSD', 'XPTUSD'],
        'indices': ['US30', 'US500', 'NAS100'],
        'energies': ['WTIUSD', 'XNG/USD', 'UKOIL'],
        'equities': ['US500'],
      };
      const candidates = symIdMap[rowId] || ['EURUSD'];
      for (const sym of candidates) {
        if (active.rates[sym] && typeof active.rates[sym][accKey] === 'number') {
          return Math.round(active.rates[sym][accKey] * 100);
        }
      }
    }
    const baseRate = RATE_ROWS.find((r) => r.id === rowId)?.base[accId as AccountTypeId] ?? 720;
    return displayRate(baseRate, active.multiplier);
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
              {ACCOUNT_TYPES.map((a) => (
                <th key={a.id} className={s.acct}>
                  {a.name}<span>{a.model}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RATE_ROWS.map((row) => {
              const best = bestAccountType(row);
              return (
                <tr key={row.id}>
                  <td>
                    <div className={s.sym}>
                      <div>
                        {row.group}
                        <small>{row.examples}</small>
                      </div>
                    </div>
                  </td>
                  {ACCOUNT_TYPES.map((a) => (
                    <td key={a.id} className={`${s.v}${a.id === best ? ` ${s.best}` : ''}`}>
                      {usd(getCellRate(row.id, a.id))}
                    </td>
                  ))}
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
