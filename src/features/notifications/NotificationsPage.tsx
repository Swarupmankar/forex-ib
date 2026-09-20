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

const NOTIF_ICON: Record<Notification['icon'], ReactNode> = {
  commission: <DollarIcon strokeWidth={2} />,
  signup: <UsersTabIcon strokeWidth={2} />,
  settled: <CheckIcon />,
  warning: <WarningIcon />,
  upgrade: <BoxFlatIcon />,
  tier: <ShieldIcon />,
  verification: <ClockIcon />,
};

const TONE_CLASSES: Record<Notification['tone'], { bg: string; color: string }> = {
  green: { bg: 'rgba(47, 191, 113, 0.12)', color: '#18884D' },
  blue: { bg: 'var(--accent-soft)', color: 'var(--accent)' },
  amber: { bg: 'rgba(233, 162, 59, 0.15)', color: '#A96D12' },
};

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
          <div className="notice" style={{ margin: '24px' }}>
            <BellIcon />
            <div>No notifications to display at this time.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n) => {
              const toneStyle = TONE_CLASSES[n.tone] || TONE_CLASSES.blue;
              const read = isRead(n.id) || !n.unread;

              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--line-soft)',
                    cursor: 'pointer',
                    background: read ? 'transparent' : 'rgba(59, 91, 254, 0.03)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--line-soft)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = read ? 'transparent' : 'rgba(59, 91, 254, 0.03)')
                  }
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: toneStyle.bg,
                      color: toneStyle.color,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {NOTIF_ICON[n.icon] || <BellIcon />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <span style={{ fontWeight: read ? 600 : 700, fontSize: '14px', color: 'var(--ink)' }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>
                        {relativeTime(n.at, new Date().toISOString())}
                      </span>
                    </div>

                    <div style={{ fontSize: '12.5px', color: 'var(--ink-2)', marginTop: '4px', lineHeight: 1.4 }}>
                      {n.detail}
                    </div>
                  </div>

                  {!read && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        flexShrink: 0,
                        alignSelf: 'center',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
