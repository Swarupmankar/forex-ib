import { CopyButton } from './CopyButton';
import s from './CopyField.module.css';

/**
 * Labelled value with a copy affordance — the pattern the credentials strip and
 * the link builder already use, extracted so the invite and contact dialogs
 * don't reinvent it.
 */
export const CopyField = ({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  /** render the value as wrapped prose rather than a single mono line */
  multiline?: boolean;
}) => (
  <div className={s.block}>
    <div className={s.lab}>{label}</div>
    <div className={s.row}>
      <div className={`field-val${multiline ? ` ${s.multiline}` : ''}`}>{value}</div>
      <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} />
    </div>
  </div>
);
