import { Fragment, type ComponentType, type SVGProps } from 'react';
import { NavLink } from 'react-router-dom';
import { Medal } from './Medal';
import { Brand } from './Brand';
import { SECTIONS, type SectionId } from '../nav';
import {
  GridIcon, UsersIcon, DollarIcon, TrophyIcon, MegaphoneIcon, CardIcon, GearIcon, LogOutIcon, LinkIcon, WebIcon,
} from './icons';
import { useAuth } from '../auth/useAuth';
import { useToast } from './Toast';
import { useNavBadges, useNow, useOverview, usePartner, useMergedTiers } from '../api/hooks';
import { useTierProgress } from '../lib/useTierProgress';
import { int, usdWhole } from '../lib/format';
import s from './Sidebar.module.css';
import { CLIENT_LOGIN_URL, PUBLIC_SITE_URL } from '../config/portalLinks';

const ICONS: Record<SectionId, ComponentType<SVGProps<SVGSVGElement>>> = {
  overview: GridIcon,
  referrals: UsersIcon,
  commissions: DollarIcon,
  rewards: TrophyIcon,
  marketing: MegaphoneIcon,
  payouts: CardIcon,
  settings: GearIcon,
};

export const Sidebar = () => {
  const { signOut } = useAuth();
  const toast = useToast();
  const now = useNow();
  const partner = usePartner();
  const overview = useOverview();
  const badges = useNavBadges();
  const tiers = useMergedTiers();
  const progress = useTierProgress(partner.tier, overview.volume30d, overview.activeTraders, now, tiers);
  const { current, next } = progress;

  return (
    <aside className={s.side}>
      <NavLink to="/" className={s.brand} aria-label="Movement Markets partner overview"><Brand /></NavLink>

      <nav className={s.nav}>
        {SECTIONS.map((section, i) => {
          const Icon = ICONS[section.id];
          const startsGrowth = section.group === 'growth' && SECTIONS[i - 1]?.group !== 'growth';
          const badge = badges[section.id];
          return (
            <Fragment key={section.id}>
              {startsGrowth && <div className={s.navLabel}>Growth</div>}
              <NavLink to={section.path} end={section.path === '/'} className={s.navItem}>
                <Icon />
                {section.label}
                {badge && <span className={s.navBadge}>{badge}</span>}
              </NavLink>
            </Fragment>
          );
        })}
      </nav>

      <NavLink to="/rewards" className={s.sideTier}>
        <div className={s.stRow}>
          <Medal tier={partner.tier} className={s.stMed} />
          <div>
            <div className={s.stName}>{current.name}</div>
            <div className={s.stSub}>
              Tier 0{partner.tier} · {current.upliftLabel} rates
            </div>
          </div>
        </div>
        <div className={s.stBar}><i style={{ width: `${progress.pctToNext * 100}%` }} /></div>
        <div className={s.stNote}>
          {next ? (
            <>
              <b>{int(Math.ceil(progress.lotsRemaining))}</b> lots to {next.shortName}
              {next.cashBonus ? ` — unlocks ${usdWhole(next.cashBonus)}` : ''}
            </>
          ) : (
            <>Top tier — <b>{current.upliftLabel}</b> on every base rate</>
          )}
        </div>
      </NavLink>

      <div className={s.ecosystemLinks} aria-label="Movement Markets products">
        <a className={s.ecosystemLink} href={CLIENT_LOGIN_URL}><LinkIcon /><span>Client portal</span><span aria-hidden="true">↗</span></a>
        <a className={s.ecosystemLink} href={PUBLIC_SITE_URL}><WebIcon /><span>Main website</span><span aria-hidden="true">↗</span></a>
      </div>

      <button
        className={s.signOut}
        onClick={() => {
          signOut();
          toast('Signed out', 'Your session on this device has ended.');
        }}
      >
        <LogOutIcon /> Log out
      </button>
    </aside>
  );
};
