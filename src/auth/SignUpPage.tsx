import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import {
  Checkbox, Field, PasswordInput, StrengthMeter, TextInput, isEmail, passwordScore,
} from './fields';
import { useAuth } from './useAuth';
import { useToast } from '../components/Toast';
import { InfoIcon } from '../components/icons';
import { TermsModal } from '../features/rewards/TermsModal';
import { AS_OF } from '../data/fixtures';
import s from './Auth.module.css';

export const SignUpPage = () => {
  useEffect(() => {
    window.location.href = `${import.meta.env.VITE_USER_PANEL_URL}/auth?mode=signup`;
  }, []);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const nameError = !name.trim()
    ? 'Enter your full name.'
    : name.trim().length < 2
      ? 'That name looks too short.'
      : undefined;
  const emailError = !email.trim()
    ? 'Enter your email address.'
    : !isEmail(email)
      ? 'That does not look like an email address.'
      : undefined;
  const passwordError = !password
    ? 'Choose a password.'
    : password.length < 8
      ? 'Use at least 8 characters.'
      : passwordScore(password) < 2
        ? 'Add a capital letter or a number.'
        : undefined;
  const termsError = !accepted ? 'You need to accept the partner terms.' : undefined;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (nameError || emailError || passwordError || termsError) return;

    setBusy(true);
    window.setTimeout(() => {
      signUp(name.trim(), email.trim());
      toast('Account created', 'Identity checks usually clear within a business day.');
      navigate('/', { replace: true });
    }, 600);
  };

  return (
    <AuthLayout>
      <div className={s.eyebrow}>Partner programme</div>
      <h1 className={s.title}>Apply for an account</h1>
      <p className={s.sub}>
        Takes about two minutes. You get your link and code straight away; commission
        starts on your first referred trade.
      </p>

      <form className={s.form} onSubmit={submit} noValidate>
        <Field label="Full name" error={submitted ? nameError : undefined}>
          {({ id, invalid }) => (
            <TextInput
              id={id}
              invalid={invalid}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rohit Kulkarni"
              autoComplete="name"
              autoFocus
            />
          )}
        </Field>

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

        <div>
          <Field label="Password" error={submitted ? passwordError : undefined}>
            {({ id, invalid }) => (
              <PasswordInput
                id={id}
                invalid={invalid}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            )}
          </Field>
          <StrengthMeter value={password} />
        </div>

        <Field
          label="Referral code"
          hint={<span className={s.strengthLab}>Optional</span>}
        >
          {({ id, invalid }) => (
            <TextInput
              id={id}
              invalid={invalid}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Who introduced you?"
              autoComplete="off"
              spellCheck={false}
            />
          )}
        </Field>

        <Checkbox checked={accepted} invalid={submitted && Boolean(termsError)} onChange={setAccepted}>
          I accept the{' '}
          <button type="button" className={s.inlineLink} onClick={() => setTermsOpen(true)}>
            partner terms
          </button>{' '}
          and confirm the traders I introduce will not be incentivised with rebates.
        </Checkbox>
        {submitted && termsError && (
          <div className={s.error} role="alert">{termsError}</div>
        )}

        <button className={`btn btn-dark ${s.submit}`} type="submit" disabled={busy}>
          {busy ? 'Creating account…' : 'Create partner account'}
        </button>
      </form>

      <div className={s.alt}>
        Already a partner? <Link to="/signin">Sign in</Link>
      </div>

      <div className={s.demo}>
        <InfoIcon />
        <div>
          <b>Demo build — nothing is submitted.</b> No account is created on any server;
          the form validates and then drops you into the sample partner portal.
        </div>
      </div>

      <p className={s.legal}>
        Trading involves risk and clients can lose more than they deposit. Partners must
        not provide investment advice or guarantee returns.
      </p>

      <TermsModal open={termsOpen} now={AS_OF} onClose={() => setTermsOpen(false)} />
    </AuthLayout>
  );
};
