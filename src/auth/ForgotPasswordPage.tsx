import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Field, TextInput, isEmail } from './fields';
import { ArrowLeftIcon, CheckIcon, InfoIcon } from '../components/icons';
import s from './Auth.module.css';
import { CLIENT_FORGOT_URL } from '../config/portalLinks';

export const ForgotPasswordPage = () => {
  useEffect(() => {
    window.location.replace(CLIENT_FORGOT_URL);
  }, []);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const emailError = !email.trim()
    ? 'Enter your email address.'
    : !isEmail(email)
      ? 'That does not look like an email address.'
      : undefined;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (emailError) return;
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setSent(true);
    }, 450);
  };

  return (
    <AuthLayout>
      <div className={s.eyebrow}>Partner portal</div>
      <h1 className={s.title}>{sent ? 'Check your email' : 'Reset your password'}</h1>

      {sent ? (
        <>
          <p className={s.sub}>
            If <b>{email.trim()}</b> matches a partner account, a reset link is on its way.
            It expires in 30 minutes.
          </p>
          <div className={s.demo} style={{ marginTop: 22 }}>
            <CheckIcon strokeWidth={2.4} />
            <div>
              Didn’t get it? Check spam, or{' '}
              <Link to="/forgot-password" onClick={() => setSent(false)} className={s.hint}>
                try another address
              </Link>
              .
            </div>
          </div>
        </>
      ) : (
        <>
          <p className={s.sub}>
            Enter the email on your partner account and we’ll send a reset link.
          </p>

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

            <button className={`btn btn-dark ${s.submit}`} type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        </>
      )}

      <div className={s.alt}>
        <Link to="/signin"><ArrowLeftIcon style={{ width: 14, height: 14, verticalAlign: -2 }} /> Back to sign in</Link>
      </div>

      {!sent && (
        <div className={s.demo}>
          <InfoIcon />
          <div>
            <b>Demo build.</b> No email is sent — there is no backend to send it.
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
