import { Medal } from '../../components/Medal';
import { PageHead } from '../../components/PageHead';
import { TIERS } from '../../data/tiers';
import s from './MedalsScratchPage.module.css';

/**
 * Not linked from the nav — /medals is a bench for checking all six medallions
 * at the three sizes they ship at (ladder station, hero dial, tier modal)
 * against the mockup, including the staggered sheen sweep.
 */
const SIZES = [
  { key: 'station', label: 'Station · 54×61', cls: s.station },
  { key: 'dial', label: 'Dial · 86×97', cls: s.dial },
  { key: 'modal', label: 'Modal · 104×118', cls: s.modal },
];

export const MedalsScratchPage = () => (
  <section className="wrap view">
    <PageHead eyebrow="Scratch" title="Medallions" sub="All six tiers, at the three sizes in use." />

    <div className="stack">
      {SIZES.map((size) => (
        <div className="card" key={size.key}>
          <div className="card-head"><div className="card-title">{size.label}</div></div>
          <div className={s.row}>
            {TIERS.map((t) => (
              <div className={s.cell} key={t.rank}>
                <Medal tier={t.rank} className={size.cls} />
                <div className={s.label}>t{t.rank} · {t.shortName}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);
