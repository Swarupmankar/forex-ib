import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon, BoxFlatIcon, CheckIcon, ClockIcon, DollarIcon, GearIcon, LogOutIcon,
  SearchIcon, ShieldIcon, UsersTabIcon, WarningIcon,
} from './icons';
import { useAuth } from '../auth/useAuth';
import { useToast } from './Toast';
import { useNotifications, usePartner, useSearch, type SearchHit } from '../api/hooks';
import { useIbMonthlyCommission, useIbReferralStats, useIbReferralNotifications } from '../api/ib.hooks';
import { Skeleton } from './Skeleton';
import { ThemeToggle } from './Theme';
import { BrandMark } from './Brand';
import { usePopover } from '../lib/usePopover';
import { usePersistentState } from '../lib/usePersistentState';
import { decimal, relativeTime } from '../lib/format';
import type { Notification } from '../types';
import s from './TopBar.module.css';

const NOTIF_ICON: Record<Notification['icon'], ReactNode> = {
  commission: <DollarIcon strokeWidth={2} />,
  signup: <UsersTabIcon strokeWidth={2} />,
  settled: <CheckIcon />,
  warning: <WarningIcon />,
  upgrade: <BoxFlatIcon />,
  tier: <ShieldIcon />,
  verification: <ClockIcon />,
};

const TONE = { green: s.tGreen, blue: s.tBlue, amber: s.tAmber } as const;

export const TopBar = ({ title }: { title: string }) => {
  const partner = usePartner();
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const toast = useToast();

  const { data: monthlyReport, isLoading: isMonthlyLoading } = useIbMonthlyCommission();
  const { data: ibStats, isLoading: isStatsLoading } = useIbReferralStats();
  const { data: ibNotifications } = useIbReferralNotifications();
  const isBalanceLoading = isMonthlyLoading && isStatsLoading;

  const liveBalance = Math.round(
    (monthlyReport?.stats.availableBalance ?? ibStats?.totalCommission ?? 0) * 100
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  usePopover(menuOpen, () => setMenuOpen(false), menuRef);

  const fallbackNotifications = useNotifications();
  const notifications = ibNotifications ?? fallbackNotifications;

  /* An array, not a Set: this is JSON-serialised into localStorage so that
     "read" survives a reload rather than only a navigation. */
  const [readIds, setReadIds] = usePersistentState<string[]>('ib.read-notifications.v1', []);
  const isRead = (id: string) => readIds.includes(id);
  const unreadCount = notifications.filter((n) => n.unread && !isRead(n.id)).length;

  const markRead = (id: string) => {
    if (!isRead(id)) setReadIds([...readIds, id]);
  };

  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  usePopover(bellOpen, () => setBellOpen(false), bellRef);

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  usePopover(searchOpen, () => setSearchOpen(false), searchRef);
  const hits = useSearch(query);

  const grouped = useMemo(() => {
    const map = new Map<SearchHit['group'], SearchHit[]>();
    hits.forEach((h) => map.set(h.group, [...(map.get(h.group) ?? []), h]));
    return [...map];
  }, [hits]);

  const goto = (to: string, notificationId?: string) => {
    if (notificationId) markRead(notificationId);
    setBellOpen(false);
    setSearchOpen(false);
    setQuery('');
    navigate(to);
  };

  const userInitials = useMemo(() => {
    if (!session?.name) return partner.initials;
    const parts = session.name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (parts[0]?.[0] || 'U').toUpperCase();
  }, [session?.name, partner.initials]);

  return (
    <header className={s.top}>
      <div className={s.searchWrap} ref={searchRef}>
        <label className="search">
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search traders, accounts, payouts…"
            aria-label="Search"
          />
        </label>

        {searchOpen && query.trim().length >= 2 && (
          <div className={`${s.panel} ${s.results}`}>
            {grouped.length === 0 ? (
              <div className={s.panelEmpty}>No matches for “{query.trim()}”.</div>
            ) : (
              <div className={s.panelList}>
                {grouped.map(([group, items]) => (
                  <div key={group}>
                    <div className={s.group}>{group}</div>
                    {items.map((h) => (
                      <button className={s.item} key={`${group}-${h.id}`} onClick={() => goto(h.to)}>
                        {/* spans, not divs: a <button>'s content model is phrasing content */}
                        <span className={s.itemBody}>
                          <span className={s.itemTitle}>{h.title}</span>
                          <span className={s.itemDetail}>{h.detail}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={s.mTitle}><BrandMark /><span>Partners</span><span className="sr"> — {title}</span></div>
      <span className={s.spacer} />

      <div className={s.balance}>
        {isBalanceLoading ? <Skeleton width="70px" height="18px" /> : decimal(liveBalance)} <small>USD</small>
      </div>

      <ThemeToggle />
      <div className={s.popAnchor} ref={bellRef}>
        <button
          className={s.iconBtn}
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          aria-expanded={bellOpen}
          onClick={() => setBellOpen((v) => !v)}
        >
          <BellIcon />
          {unreadCount > 0 && <span className={s.dot} />}
        </button>

        {bellOpen && (
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Notifications</span>
              <button
                className={s.panelAct}
                disabled={unreadCount === 0}
                onClick={() => setReadIds(notifications.map((n) => n.id))}
              >
                Mark all read
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className={s.panelEmpty}>Nothing needs your attention.</div>
            ) : (
              <>
                <div className={s.panelList}>
                  {notifications.map((n) => (
                    <button className={s.item} key={n.id} onClick={() => goto(n.to, n.id)}>
                      <span className={`${s.itemIco} ${TONE[n.tone]}`}>{NOTIF_ICON[n.icon]}</span>
                      <span className={s.itemBody}>
                        <span className={s.itemTitle}>{n.title}</span>
                        <span className={s.itemDetail}>{n.detail}</span>
                        <span className={s.itemTime}>{relativeTime(n.at, new Date().toISOString())}</span>
                      </span>
                      {n.unread && !isRead(n.id) && <span className={s.unread} />}
                    </button>
                  ))}
                </div>
                <button className={s.panelFoot} onClick={() => goto('/notifications')}>
                  See all notifications →
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className={s.popAnchor} ref={menuRef}>
        <button
          className={s.avatar}
          aria-label="Account menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {userInitials}
        </button>

        {menuOpen && (
          <div className={`${s.panel} ${s.menu}`}>
            <div className={s.menuMe}>
              <div className={s.menuName}>{session?.name ?? partner.name}</div>
              <div className={s.menuMail}>{session?.email ?? partner.email}</div>
            </div>
            <button
              className={s.menuRow}
              onClick={() => {
                setMenuOpen(false);
                navigate('/settings');
              }}
            >
              <GearIcon /> Settings
            </button>
            <button
              className={`${s.menuRow} ${s.danger}`}
              onClick={() => {
                setMenuOpen(false);
                signOut();
                toast('Signed out', 'Your session on this device has ended.');
              }}
            >
              <LogOutIcon /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
