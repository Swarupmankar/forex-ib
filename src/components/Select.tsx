import { ChevronDownIcon } from './icons';
import s from './Select.module.css';

export interface Option<T extends string> {
  value: T;
  label: string;
}

/**
 * Looks exactly like the mockup's `.select` div, but is a real <select>
 * underneath — so it keyboards, announces, and opens the native picker on
 * mobile without reimplementing any of that.
 */
export function Select<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <div className={`select ${s.wrap}`}>
      <select
        className={s.native}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className={s.label}>{current?.label ?? ''}</span>
      <ChevronDownIcon />
    </div>
  );
}
