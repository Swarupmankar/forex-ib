import { useState } from 'react';
import { CopyButton } from '../../components/CopyButton';
import { LinkIcon } from '../../components/icons';
import { Skeleton } from '../../components/Skeleton';
import { ReferralQrImage, ReferralQrModal } from '../referrals/ReferralQr';
import { validReferralLink } from '../../lib/referral';
import s from './Credentials.module.css';

export const Credentials = ({ link, code, loading = false }: { link: string; code: string; loading?: boolean }) => {
  const [qrOpen, setQrOpen] = useState(false);
  const ready = !loading && !!code && validReferralLink(link);
  return <>
    <section className={s.card} aria-label="Your referral link and QR code">
      <div className={s.content}>
        <div className={s.heading}><span className={s.icon}><LinkIcon /></span><div><h2>Grow your network</h2><p>Your personal link. Every introduction connected to you.</p></div></div>
        <div className={s.link}>
          {loading ? <Skeleton width="70%" height="18px" /> : <span className={s.url} title={link}>{ready ? link : 'Your referral link will appear when your partner code is available.'}</span>}
          {ready && <CopyButton value={link} label="Copy referral link" />}
        </div>
        <div className={s.footer}>
          <span className={s.code}>Referral code <b>{loading ? '…' : code || 'Not available'}</b>{ready && <CopyButton value={code} label="Copy referral code" />}</span>
          <button className={s.qrLink} disabled={!ready} onClick={() => setQrOpen(true)}>View & download QR <span aria-hidden="true">↗</span></button>
        </div>
      </div>
      <button className={s.qrButton} disabled={!ready} onClick={() => setQrOpen(true)} aria-label="Enlarge referral QR code">
        {ready ? <ReferralQrImage link={link} /> : <div className={s.qrPlaceholder}><LinkIcon /></div>}
        <span>Scan to register</span>
      </button>
    </section>
    {qrOpen && <ReferralQrModal open link={link} code={code} onClose={() => setQrOpen(false)} />}
  </>;
};
