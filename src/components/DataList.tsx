import type { CSSProperties, ReactNode } from 'react';
import { Skeleton } from './Skeleton';
import s from './DataList.module.css';

/**
 * `mobile` declares what a column becomes under 900px, where the table is laid
 * out as a two-line list row:
 *
 *   primary   top-left      secondary  bottom-left
 *   value     top-right     status     bottom-right
 *
 * Anything else is dropped. At most one column should claim each role — the
 * roles are grid areas, so two columns claiming `value` would stack on top of
 * each other.
 */
export type MobileRole = 'primary' | 'secondary' | 'value' | 'status' | 'hidden';

export interface Col<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** 'right' ⇒ numeric: mono, tabular figures, right-aligned */
  align?: 'left' | 'right';
  mobile?: MobileRole;
}

export function DataList<T>({
  columns,
  rows,
  rowKey,
  minWidth,
  indentSecondary,
  empty = 'Nothing to show.',
  loading = false,
}: {
  columns: Col<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** desktop only; the list layout ignores it */
  minWidth?: number;
  /** true when the primary cell carries an avatar and the secondary should clear it */
  indentSecondary?: boolean;
  empty?: ReactNode;
  loading?: boolean;
}) {
  const roles = new Set(columns.map((c) => c.mobile));

  if (loading) {
    return (
      <div className={s.scroll}>
        <table
          className={s.list}
          style={minWidth ? { '--table-min-width': `${minWidth}px` } as CSSProperties : undefined}
          data-secondary={roles.has('secondary')}
          data-value={roles.has('value')}
          data-indent={indentSecondary ? 'true' : undefined}
        >
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={c.align === 'right' ? 'qty' : undefined}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rIdx) => (
              <tr key={`skel-row-${rIdx}`}>
                {columns.map((c, cIdx) => (
                  <td
                    key={c.key}
                    className={c.align === 'right' ? 'qty' : undefined}
                    data-role={c.mobile ?? 'hidden'}
                  >
                    <Skeleton
                      width={
                        cIdx === 0
                          ? '70%'
                          : c.align === 'right'
                            ? '50%'
                            : '45%'
                      }
                      height="18px"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (rows.length === 0) return <div className={s.empty}>{empty}</div>;

  return (
    <div className={s.scroll}>
      <table
        className={s.list}
        style={minWidth ? { '--table-min-width': `${minWidth}px` } as CSSProperties : undefined}
        data-secondary={roles.has('secondary')}
        data-value={roles.has('value')}
        data-indent={indentSecondary ? 'true' : undefined}
      >
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.align === 'right' ? 'qty' : undefined}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={c.align === 'right' ? 'qty' : undefined}
                  data-role={c.mobile ?? 'hidden'}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
