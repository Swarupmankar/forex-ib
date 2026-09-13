import { PageHead } from '../../components/PageHead';
import { CopyButton } from '../../components/CopyButton';
import { Medal } from '../../components/Medal';
import { Toggle } from '../../components/Toggle';
import { useToast } from '../../components/Toast';
import { ContactModal } from '../../components/ContactModal';
import {
  CheckIcon, ClockIcon, DownloadIcon, LockIcon, MailIcon, PhoneIcon,
} from '../../components/icons';
import { useNow, useOverview, usePartner, usePayouts } from '../../api/hooks';
import { tierByRank } from '../../data/tiers';
import { partnerManager } from '../../data/fixtures';
import { downloadFile, stampedName } from '../../lib/download';
import { usePersistentState } from '../../lib/usePersistentState';
import { pct0, shortDate } from '../../lib/format';
import { useState, type ReactNode } from 'react';
import type { VerificationItem } from '../../types';
import s from './Settings.module.css';

const VERIFICATION_ICON: Record<VerificationItem['state'], { icon: ReactNode; cls: string }> = {
  approved: { icon: <CheckIcon strokeWidth={2.4} />, cls: 'ok' },
  expiring: { icon: <ClockIcon />, cls: 'due' },
  enabled: { icon: <LockIcon strokeWidth={2} />, cls: 'info' },
};

interface Prefs {
  newReferral: boolean;
  payoutSettled: boolean;
  tierChanges: boolean;
  monthlyStatement: boolean;
  marketing: boolean;
}

const DEFAULT_PREFS: Prefs = {
  newReferral: true,
  payoutSettled: true,
  tierChanges: true,
  monthlyStatement: false,
  marketing: false,
};

/** Sessions are local to this device; there is no session service to query. */
const SESSIONS = [
  { id: 'this', title: 'This device', detail: 'Current session · signed in now', current: true },
  { id: 'mobile', title: 'iPhone · Safari', detail: 'Mumbai, IN · 2 days ago', current: false },
];

export const SettingsPage = () => {
  const now = useNow();
  const partner = usePartner();
  const overview = useOverview();
  const payouts = usePayouts();
  const toast = useToast();
  const [prefs, setPrefs] = usePersistentState<Prefs>('ib.prefs', DEFAULT_PREFS);
  const [twoFactor, setTwoFactor] = usePersistentState('ib.2fa', true);
  const [contactOpen, setContactOpen] = useState(false);

  const tier = tierByRank(partner.tier);
  const complete = partner.verification.filter((v) => v.state !== 'expiring').length;
  const ratio = complete / partner.verification.length;

  const setPref = (key: keyof Prefs) => (next: boolean) => {
    setPrefs({ ...prefs, [key]: next });
    toast('Preference saved', `${next ? 'On' : 'Off'} — stored on this device.`);
  };

  /** A real export of everything the portal holds about this partner. */
  const exportData = () => {
    downloadFile(
      stampedName('ib-partner-data', now, 'json'),
      JSON.stringify(
        {
          exportedAt: now,
          profile: partner,
          tier: { rank: tier.rank, name: tier.name, multiplier: tier.multiplier, heldMonths: partner.tierHeldMonths },
          performance: {
            referrals: overview.referrals,
            activeTraders: overview.activeTraders,
            volume30d: overview.volume30d,
            commission30dMinor: overview.commission30d,
            lifetimeMinor: overview.lifetime,
            paidOutMinor: overview.paidOut,
          },
          payouts: { balanceMinor: payouts.balance, history: payouts.history },
          preferences: { ...prefs, twoFactor },
        },
        null,
        2,
      ),
      'application/json',
    );
    toast('Data exported', 'Profile, performance, payouts and preferences as JSON.');
  };

  return (
    <section className="wrap view">
      <PageHead eyebrow="Account" title="Settings" sub="Partner profile, verification and access." />

      <div className="stack">
        {/* ---------- who you are ---------- */}
        <div className="card">
          <div className={s.profile}>
            <Medal tier={partner.tier} className={s.med} />
            <div className={s.identity}>
              <div className={s.name}>{partner.name}</div>
              <div className={s.meta}>
                <span>{tier.name}</span>
                <span>{partner.entity}</span>
                <span>{partner.email}</span>
                <span>Partner since {shortDate(partner.joinedAt)}</span>
              </div>
            </div>
            <div className={s.idRow}>
              <div className={s.idVal}>{partner.id}</div>
              <CopyButton value={partner.id} label="Copy partner ID" />
            </div>
          </div>
        </div>

        <div className="two">
          {/* ---------- verification ---------- */}
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Verification</div>
                <div className="card-sub">Required to keep payouts flowing without withholding</div>
              </div>
            </div>

            <div className={s.meterWrap}>
              <div className={s.meterTop}>
                <span className={s.meterLab}>
                  {complete} of {partner.verification.length} complete
                </span>
                <span className={s.meterVal}>{pct0(ratio)}</span>
              </div>
              <div className={`${s.meter}${ratio < 1 ? ` ${s.warn}` : ''}`}>
                <i style={{ width: pct0(ratio) }} />
              </div>
            </div>

            <div className="card-pad">
              {partner.verification.map((v) => {
                const style = VERIFICATION_ICON[v.state];
                return (
                  <div className={s.vrow} key={v.id}>
                    <span className={`${s.vico} ${s[style.cls]}`}>{style.icon}</span>
                    <div className={s.vbody}>
                      <div className={s.vlabel}>{v.label}</div>
                      <div className={s.vdetail}>{v.detail}</div>
                    </div>
                    {v.state === 'expiring' && (
                      <button
                        className="btn btn-sm"
                        onClick={() =>
                          toast('Renewal started', 'Your partner manager will send the W-8BEN form.')
                        }
                      >
                        Renew
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---------- security ---------- */}
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Security</div>
                <div className="card-sub">Access to the partner account and its balance</div>
              </div>
            </div>
            <div className="card-pad">
              <Toggle
                label="Two-factor authentication"
                detail="Required for payouts over the manual-approval threshold."
                checked={twoFactor}
                onChange={(next) => {
                  setTwoFactor(next);
                  toast(
                    next ? 'Two-factor enabled' : 'Two-factor disabled',
                    next ? 'Authenticator app.' : 'Large payouts will need manual review.',
                    next ? 'good' : 'warn',
                  );
                }}
              />

              {SESSIONS.map((session) => (
                <div className={s.session} key={session.id}>
                  <span className={`${s.vico} ${session.current ? s.ok : s.info}`}>
                    {session.current ? <CheckIcon strokeWidth={2.4} /> : <PhoneIcon />}
                  </span>
                  <div className={s.sbody}>
                    <div className={s.stitle}>{session.title}</div>
                    <div className={s.sdetail}>{session.detail}</div>
                  </div>
                  {!session.current && (
                    <button
                      className="btn btn-sm"
                      onClick={() => toast('Session revoked', `${session.title} was signed out.`)}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="two">
          {/* ---------- notifications ---------- */}
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Notifications</div>
                <div className="card-sub">Saved on this device</div>
              </div>
            </div>
            <div className="card-pad">
              <Toggle label="New referral signs up" checked={prefs.newReferral} onChange={setPref('newReferral')} />
              <Toggle label="Payout settled" checked={prefs.payoutSettled} onChange={setPref('payoutSettled')} />
              <Toggle label="Tier changes" detail="When you clear a tier or enter the grace period." checked={prefs.tierChanges} onChange={setPref('tierChanges')} />
              <Toggle label="Monthly statement" detail="A commission statement on the 1st." checked={prefs.monthlyStatement} onChange={setPref('monthlyStatement')} />
              <Toggle label="Programme news" detail="Rate changes and new creative." checked={prefs.marketing} onChange={setPref('marketing')} />
            </div>
          </div>

          {/* ---------- support and data ---------- */}
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Support and data</div>
                <div className="card-sub">Your named contact, and everything we hold</div>
              </div>
            </div>
            <div className="card-pad">
              <div className={s.vrow}>
                <span className={`${s.vico} ${s.info}`}><MailIcon /></span>
                <div className={s.vbody}>
                  <div className={s.vlabel}>{partnerManager.name}</div>
                  <div className={s.vdetail}>{partnerManager.role} · {partnerManager.hours}</div>
                </div>
                <button className="btn btn-sm" onClick={() => setContactOpen(true)}>Contact</button>
              </div>

              <div className={s.vrow}>
                <span className={`${s.vico} ${s.ok}`}><DownloadIcon /></span>
                <div className={s.vbody}>
                  <div className={s.vlabel}>Export your data</div>
                  <div className={s.vdetail}>Profile, performance, payout history and preferences as JSON.</div>
                </div>
                <button className="btn btn-sm" onClick={exportData}>Export</button>
              </div>

              <div className={s.actions}>
                <a className="btn" href={partner.referralLink} target="_blank" rel="noopener noreferrer">
                  View your landing page
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContactModal open={contactOpen} partner={partner} onClose={() => setContactOpen(false)} />
    </section>
  );
};
