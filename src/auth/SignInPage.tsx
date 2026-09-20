import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Checkbox, Field, PasswordInput, TextInput, isEmail } from './fields';
import { useAuth } from './useAuth';
import { useToast } from '../components/Toast';
import { normalizeApiError } from '../api/errors';
import s from './Auth.module.css';
import { CLIENT_FORGOT_URL, CLIENT_SIGNUP_URL } from '../config/portalLinks';

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
      <div className={s.eyebrow}>Partner account</div>
      <h1 className={s.title}>Welcome back</h1>
      <p className={s.sub}>
        Sign in to manage your network and keep your partnership moving.
      </p>

      {apiError && (
        <div className={s.apiError} role="alert">
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
            />
          )}
        </Field>

        <Field
          label="Password"
          error={submitted ? passwordError : undefined}
          hint={<a className={s.hint} href={CLIENT_FORGOT_URL} target="_blank" rel="noopener noreferrer">Forgot password?</a>}
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
        <span>Not a partner yet?</span> <a href={CLIENT_SIGNUP_URL} target="_blank" rel="noopener noreferrer">Become a partner <span aria-hidden="true">↗</span></a>
      </div>


    </AuthLayout>
  );
};
