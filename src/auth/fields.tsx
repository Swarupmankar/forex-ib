import { useId, useState, type ReactNode } from 'react';
import { CheckIcon, EyeIcon, EyeOffIcon, WarningIcon } from '../components/icons';
import s from './Auth.module.css';

/**
 * Errors are shown only once a field has been touched or the form submitted, so
 * the form doesn't turn red while you are still typing your email.
 */
export const Field = ({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: (props: { id: string; invalid: boolean }) => ReactNode;
}) => {
  const id = useId();
  return (
    <div className={s.field}>
      <label className={s.label} htmlFor={id}>
        <span>{label}</span>
        {hint}
      </label>
      {children({ id, invalid: Boolean(error) })}
      {error && (
        <div className={s.error} role="alert">
          <WarningIcon /> {error}
        </div>
      )}
    </div>
  );
};

export const TextInput = ({
  id,
  invalid,
  ...rest
}: { id: string; invalid: boolean } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className={s.control}>
    <input
      id={id}
      className={`${s.input}${invalid ? ` ${s.invalid}` : ''}`}
      aria-invalid={invalid}
      {...rest}
    />
  </div>
);

export const PasswordInput = ({
  id,
  invalid,
  ...rest
}: { id: string; invalid: boolean } & React.InputHTMLAttributes<HTMLInputElement>) => {
  const [shown, setShown] = useState(false);
  return (
    <div className={s.control}>
      <input
        id={id}
        type={shown ? 'text' : 'password'}
        className={`${s.input} ${s.hasToggle}${invalid ? ` ${s.invalid}` : ''}`}
        aria-invalid={invalid}
        {...rest}
      />
      <button
        type="button"
        className={s.toggle}
        onClick={() => setShown((v) => !v)}
        aria-label={shown ? 'Hide password' : 'Show password'}
        aria-pressed={shown}
        tabIndex={-1}
      >
        {shown ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};

export const Checkbox = ({
  checked,
  invalid,
  onChange,
  children,
}: {
  checked: boolean;
  invalid?: boolean;
  onChange: (next: boolean) => void;
  children: ReactNode;
}) => {
  const id = useId();
  return (
    <div className={s.checkRow}>
      <button
        type="button"
        id={id}
        role="checkbox"
        aria-checked={checked}
        className={`${s.check}${invalid ? ` ${s.invalid}` : ''}`}
        onClick={() => onChange(!checked)}
      >
        <CheckIcon strokeWidth={3} />
      </button>
      <label className={s.checkLab} htmlFor={id}>{children}</label>
    </div>
  );
};

/**
 * Deliberately crude: length plus character variety. A real meter would use
 * zxcvbn, which is 400 kB — far too much for a hint that only nudges.
 */
export const passwordScore = (value: string) => {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
  return Math.min(4, score);
};

const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export const StrengthMeter = ({ value }: { value: string }) => {
  const score = passwordScore(value);
  if (!value) return null;
  return (
    <div className={s.strength}>
      <div className={`${s.bars} ${s[`s${score}`]}`}>
        <i /><i /><i /><i />
      </div>
      <div className={s.strengthLab}>{LABELS[score]} password</div>
    </div>
  );
};

/* Pragmatic, not RFC 5322: catches typos without rejecting valid addresses. */
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
