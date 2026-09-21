import { useEffect, useState } from 'react';
import { MotionRegion } from './MotionRegion';
import { Outlet, useLocation } from 'react-router-dom';
import { TAB_IDS, sectionByPath } from '../nav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { TabBar } from './TabBar';
import { MoreSheet } from './MoreSheet';
import { ContactModal } from './ContactModal';
import { usePartner } from '../api/hooks';
import s from './AppShell.module.css';

export const AppShell = () => {
  const { pathname, search } = useLocation();
  const section = sectionByPath(pathname);
  const [moreOpen, setMoreOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const partner = usePartner();

  // Keep the shell in place and reset only the new section’s scroll position.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setMoreOpen(false);
  }, [pathname]);

  return (
    <>
      <div className={s.app}>
        <Sidebar />
        <div className={s.main}>
          <TopBar title={section.title} />
          <MotionRegion motionKey={pathname + search}><Outlet /></MotionRegion>
        </div>
      </div>

      <TabBar moreActive={!TAB_IDS.includes(section.id)} onMore={() => setMoreOpen(true)} />
      <MoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        onContact={() => setContactOpen(true)}
      />
      <ContactModal open={contactOpen} partner={partner} onClose={() => setContactOpen(false)} />
    </>
  );
};
