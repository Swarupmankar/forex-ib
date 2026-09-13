import type { ReactNode } from 'react';

/**
 * The title block MUST be the first child <div> — under 900px the app header
 * carries the title and `.page-head>div:first-child` is hidden, leaving the
 * actions to stretch full width.
 */
export const PageHead = ({
  eyebrow,
  title,
  sub,
  actions,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  actions?: ReactNode;
}) => (
  <div className="page-head">
    <div>
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {sub && <div className="sub">{sub}</div>}
    </div>
    {actions && <div className="actions">{actions}</div>}
  </div>
);
