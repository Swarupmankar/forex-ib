import type { ReactNode } from 'react';
import { Skeleton } from './Skeleton';
import s from './Feed.module.css';

export interface FeedRow {
  id: string;
  tone: 'green' | 'blue' | 'amber';
  icon: ReactNode;
  body: ReactNode;
  time: ReactNode;
  amount?: ReactNode;
}

const TONE = { green: s.fiGreen, blue: s.fiBlue, amber: s.fiAmber } as const;

/** Shared by the activity stream, "how tiers work", and the verification list. */
export const Feed = ({
  rows,
  loading = false,
  empty = 'No recent activity yet.',
}: {
  rows: FeedRow[];
  loading?: boolean;
  empty?: ReactNode;
}) => {
  if (loading) {
    return (
      <div className={s.feed}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div className={s.feedItem} key={`skel-feed-${idx}`}>
            <div className={s.feedIco}>
              <Skeleton width="32px" height="32px" borderRadius="50%" />
            </div>
            <div className={s.feedTxt} style={{ width: '100%' }}>
              <Skeleton width="75%" height="16px" />
              <div className={s.feedTime} style={{ marginTop: '4px' }}>
                <Skeleton width="40%" height="12px" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return <div className="notice">{empty}</div>;
  }

  return (
    <div className={s.feed}>
      {rows.map((r) => (
        <div className={s.feedItem} key={r.id}>
          <div className={`${s.feedIco} ${TONE[r.tone]}`}>{r.icon}</div>
          <div className={s.feedTxt}>
            {r.body}
            <div className={s.feedTime}>{r.time}</div>
          </div>
          {r.amount !== undefined && <div className={s.feedAmt}>{r.amount}</div>}
        </div>
      ))}
    </div>
  );
};
