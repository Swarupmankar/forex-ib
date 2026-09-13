import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Medal } from '../components/Medal';
import { CardPlainIcon, ChartIcon, TrophyIcon } from '../components/icons';
import { TIERS } from '../data/tiers';
import { int, usdWhole } from '../lib/format';
import s from './Auth.module.css';

const PROPS = [
  {
    icon: <ChartIcon />,
    title: 'Paid per closed lot, not per signup',
    detail: 'Commission is credited when the trade closes, and shows in your ledger the same day.',
  },
  {
    icon: <TrophyIcon />,
    title: 'Six tiers, each one raises every rate',
    detail: 'Clear a tier and the uplift applies to your whole rate card, not just new traders.',
  },
  {
    icon: <CardPlainIcon />,
    title: 'Withdraw weekly from Senior Partner',
    detail: 'Bank, USDT or straight to a trading account. No fee over $500.',
  },
];

const top = TIERS[TIERS.length - 1];

/** The two-panel shell every auth screen shares. */
export const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className={s.page}>
    <div className={s.formSide}>
      <Link className={s.brand} to="/signin" aria-label="IB Portal">
        <div className={s.brandMark}>IB</div>
        <div>
          <div className={s.brandName}>IB Portal</div>
          <div className={s.brandSub}>Partnerships</div>
        </div>
      </Link>
      <div className={s.formInner}>{children}</div>
    </div>

    <aside className={s.showcase}>
      <span className={s.orb} />
      <div className={s.showcaseInner}>
        <Medal tier={4} className={s.medal} />

        <h2 className={s.pitch}>
          Introduce traders.<br />Earn on <em>every lot</em> they close.
        </h2>
        <p className={s.pitchSub}>
          A partner programme with published rates, a tier ladder you can see the whole
          of, and a ledger that reconciles to the cent.
        </p>

        <div className={s.props}>
          {PROPS.map((p) => (
            <div className={s.prop} key={p.title}>
              {p.icon}
              <div>
                <div className={s.propT}>{p.title}</div>
                <div className={s.propD}>{p.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={s.stats}>
          <div>
            <div className={s.statV}>{TIERS.length}</div>
            <div className={s.statL}>Tiers</div>
          </div>
          <div>
            <div className={s.statV}>{top.upliftLabel}</div>
            <div className={s.statL}>Top uplift</div>
          </div>
          <div>
            <div className={s.statV}>{top.cashBonus ? usdWhole(top.cashBonus) : int(0)}</div>
            <div className={s.statL}>Top bonus</div>
          </div>
        </div>
      </div>
    </aside>
  </div>
);
