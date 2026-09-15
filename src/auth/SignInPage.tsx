import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Checkbox, Field, PasswordInput, TextInput, isEmail } from './fields';
import { useAuth } from './useAuth';
import { useToast } from '../components/Toast';
import { InfoIcon } from '../components/icons';
import { normalizeApiError } from '../api/errors';
import s from './Auth.module.css';

export const SignInPage = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const emailError = !email.trim()
    ? 'Enter your email address.'
    : !isEmail(email)
      ? 'That does not look like an email address.'
      : undefined;
  const passwordError = !password
    ? 'Enter your password.'
    : password.length < 4
      ? 'Passwords are at least 4 characters.'
      : undefined;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setApiError(null);

    if (emailError || passwordError) return;

    setBusy(true);
    try {
      await signIn(email.trim(), password);
      toast('Signed in', `Welcome back — ${email.trim()}`);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== '/signin' ? from : '/', { replace: true });
    } catch (err) {
      const normalized = normalizeApiError(err);
      setApiError(normalized.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <div className={s.eyebrow}>Partner portal</div>
      <h1 className={s.title}>Sign in</h1>
      <p className={s.sub}>
        Your referrals, commission ledger and payouts, in one place.
      </p>

      {apiError && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.875rem',
            lineHeight: '1.4',
          }}
        >
          {apiError}
        </div>
      )}

      <form className={s.form} onSubmit={submit} noValidate>
        <Field label="Email" error={submitted ? emailError : undefined}>
          {({ id, invalid }) => (
            <TextInput
              id={id}
              invalid={invalid}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
          )}
        </Field>

        <Field
          label="Password"
          error={submitted ? passwordError : undefined}
          hint={<a className={s.hint} href={`${import.meta.env.VITE_USER_PANEL_URL}/auth?mode=forgot`} target="_blank" rel="noopener noreferrer">Forgot password?</a>}
        >
          {({ id, invalid }) => (
            <PasswordInput
              id={id}
              invalid={invalid}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          )}
        </Field>

        <div className={s.row}>
          <Checkbox checked={remember} onChange={setRemember}>
            Keep me signed in
          </Checkbox>
        </div>

        <button className={`btn btn-dark ${s.submit}`} type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className={s.alt}>
        New partner? <a href={`${import.meta.env.VITE_USER_PANEL_URL}/auth?mode=signup`} target="_blank" rel="noopener noreferrer">Apply for an account</a>
      </div>

      <div className={s.demo}>
        <InfoIcon />
        <div>
          <b>Production API mode enabled.</b> Requests are authenticated against the backend endpoint at <code>/v1/users/auth/ib-login</code>.
        </div>
      </div>
    </AuthLayout>
  );
};
