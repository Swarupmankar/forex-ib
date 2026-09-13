import s from './Toggle.module.css';

/** Labelled switch row. `role="switch"` so it announces its state, not just its name. */
export const Toggle = ({
  label,
  detail,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) => (
  <div className={s.row}>
    <div className={s.text}>
      <div className={s.label}>{label}</div>
      {detail && <div className={s.detail}>{detail}</div>}
    </div>
    <button
      className={s.switch}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    />
  </div>
);
