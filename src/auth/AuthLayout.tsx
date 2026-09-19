import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { ThemeToggle } from '../components/Theme';
import { ChartIcon, LinkIcon, TrophyIcon, LockIcon } from '../components/icons';
import s from './Auth.module.css';

export const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className={s.page}>
    <header className={s.pageHeader}>
      <Link to="/signin" aria-label="Movement Markets partner portal"><Brand /></Link>
      <div className={s.headerActions}>
        <a className={s.clientLink} href={`${import.meta.env.VITE_USER_PANEL_URL}/auth`} aria-label="Open client portal"><span>Client portal</span><span aria-hidden="true">↗</span></a>
        <ThemeToggle />
      </div>
    </header>
    <main className={s.shell}>
      <aside className={s.showcase} aria-label="Movement Markets partnerships">
        <div className={s.showcaseInner}>
          <span className={s.showcaseLabel}><i /> Movement Markets Partners</span>
          <h2 className={s.pitch}>Connections that<br />move you forward.</h2>
          <p className={s.pitchSub}>Your network, earnings and next milestone.<br />One place to bring it all together.</p>
        </div>
        <img className={s.network} src="/art/portal/partner-network-3d.webp" alt="" width="1536" height="1024" />
        <div className={s.platformFeatures}>
          <span><LinkIcon /> Your referrals</span><span><ChartIcon /> Your earnings</span><span><TrophyIcon /> Your progress</span>
        </div>
      </aside>
      <div className={s.formSide}>
        <div className={s.formInner}>{children}</div>
        <p className={s.formFooter}><LockIcon /> Your dedicated partner workspace</p>
      </div>
    </main>
    <footer className={s.pageFooter}><span>© {new Date().getFullYear()} Movement Markets</span><span>Partner portal</span></footer>
  </div>
);
