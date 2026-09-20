import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHead } from '../../components/PageHead';
import { Skeleton } from '../../components/Skeleton';
import {
  BellIcon, BoxFlatIcon, CheckIcon, ClockIcon, DollarIcon, ShieldIcon, UsersTabIcon, WarningIcon,
} from '../../components/icons';
import { useNotifications } from '../../api/hooks';
import { useIbReferralNotifications } from '../../api/ib.hooks';
import { usePersistentState } from '../../lib/usePersistentState';
import { relativeTime } from '../../lib/format';
import type { Notification } from '../../types';
import s from './Notifications.module.css';

const NOTIF_ICON: Record<Notification['icon'], ReactNode> = {
  commission: <DollarIcon strokeWidth={2} />,
  signup: <UsersTabIcon strokeWidth={2} />,
  settled: <CheckIcon />,
  warning: <WarningIcon />,
  upgrade: <BoxFlatIcon />,
  tier: <ShieldIcon />,
  verification: <ClockIcon />,
};

const TONES = { green: s.green, blue: s.lime, amber: s.amber } as const;

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { data: ibNotifications, isLoading } = useIbReferralNotifications();
  const fallbackNotifications = useNotifications();
  const notifications = ibNotifications ?? fallbackNotifications;

  const [readIds, setReadIds] = usePersistentState<string[]>('ib.read-notifications.v1', []);
  const isRead = (id: string) => readIds.includes(id);

  const markAllRead = () => {
    setReadIds(notifications.map((n) => n.id));
  };

  const handleClick = (n: Notification) => {
    if (!isRead(n.id)) {
      setReadIds([...readIds, n.id]);
    }
    navigate(n.to);
  };

  return (
    <section className="wrap view">
      <PageHead
        eyebrow="System"
        title="Notifications"
        sub="All account activity alerts, referral updates, and system notifications."
        actions={
          <button className="btn" onClick={markAllRead} disabled={notifications.every((n) => isRead(n.id))}>
            <CheckIcon /> Mark all read
          </button>
        }
      />

      <div className="card">
        <div className="card-head">
          <div className="card-title">All Notifications ({notifications.length})</div>
        </div>

        {isLoading ? (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={`skel-notif-row-${idx}`} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <Skeleton width="36px" height="36px" borderRadius="10px" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="40%" height="18px" />
                  <div style={{ marginTop: '6px' }}><Skeleton width="70%" height="14px" /></div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className={s.empty}>
            <span className={s.emptyIcon}><BellIcon /></span>
            <h2>You're all caught up</h2>
            <p>Account activity and referral updates will appear here.</p>
          </div>
        ) : (
          <div className={s.list}>
            {notifications.map((n) => {
              const read = isRead(n.id) || !n.unread;
              return (
                <button key={n.id} className={s.row} data-read={read} onClick={() => handleClick(n)}>
                  <span className={`${s.icon} ${TONES[n.tone] || s.lime}`}>{NOTIF_ICON[n.icon] || <BellIcon />}</span>
                  <span className={s.body}>
                    <span className={s.heading}><span className={s.title}>{n.title}</span><span className={s.time}>{relativeTime(n.at, new Date().toISOString())}</span></span>
                    <span className={s.detail}>{n.detail}</span>
                  </span>
                  {!read && <span className={s.unread} aria-label="Unread" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
