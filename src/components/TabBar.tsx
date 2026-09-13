import type { ComponentType, SVGProps } from 'react';
import { NavLink } from 'react-router-dom';
import { SECTIONS, TAB_IDS, type SectionId } from '../nav';
import { GridIcon, UsersTabIcon, DollarIcon, TrophyTabIcon, DotsIcon } from './icons';
import s from './TabBar.module.css';

const TAB_ICONS: Record<SectionId, ComponentType<SVGProps<SVGSVGElement>>> = {
  overview: GridIcon,
  referrals: UsersTabIcon,
  commissions: DollarIcon,
  rewards: TrophyTabIcon,
  marketing: DotsIcon,
  payouts: DotsIcon,
  settings: DotsIcon,
};

/** `moreActive` is true when the current section lives behind the More sheet. */
export const TabBar = ({ moreActive, onMore }: { moreActive: boolean; onMore: () => void }) => (
  <nav className={s.tabbar}>
    {TAB_IDS.map((id) => {
      const section = SECTIONS.find((x) => x.id === id)!;
      const Icon = TAB_ICONS[id];
      return (
        <NavLink key={id} to={section.path} end={section.path === '/'} className={s.tab}>
          <Icon />
          {section.tabLabel ?? section.label}
        </NavLink>
      );
    })}
    <button className={s.tab} aria-current={moreActive ? 'page' : undefined} onClick={onMore}>
      <DotsIcon />
      More
    </button>
  </nav>
);
