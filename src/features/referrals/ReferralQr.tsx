import { useId, useMemo, useState } from 'react';
import { Brand } from '../../components/Brand';
import { CopyButton } from '../../components/CopyButton';
import { DownloadIcon } from '../../components/icons';
import { Modal } from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { createReferralQr, referralQrPng } from '../../lib/referralQr';
import { downloadFile } from '../../lib/download';
import s from './ReferralQr.module.css';

export const ReferralQrImage = ({ link }: { link: string }) => {
  const qr = useMemo(() => createReferralQr(link), [link]);
  return qr ? <img className={s.qr} src={qr.dataUrl} width="232" height="232" alt="QR code for your referral link" /> : <div className={s.unavailable}>QR code unavailable</div>;
};

export const ReferralQrDownloads = ({ link, code }: { link: string; code: string }) => {
  const qr = useMemo(() => createReferralQr(link), [link]);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const download = async (format: 'png' | 'svg') => {
    if (!qr) return;
    setBusy(true);
    try {
      const name = `movement-markets-referral-${code.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'partner'}.${format}`;
      const data = format === 'svg' ? qr.svg : await referralQrPng(qr);
      downloadFile(name, data, format === 'svg' ? 'image/svg+xml;charset=utf-8' : 'image/png');
      toast('QR code downloaded', `${format.toUpperCase()} file ready to share.`);
    } catch { toast('Could not download the QR code', 'Please try again, or copy your referral link.', 'warn'); }
    finally { setBusy(false); }
  };
  return <div className={s.downloads}>
    <button className="btn btn-dark" disabled={!qr || busy} onClick={() => download('png')}><DownloadIcon /> Download PNG</button>
    <button className="btn" disabled={!qr || busy} onClick={() => download('svg')}>Download SVG</button>
  </div>;
};

export const ReferralQrModal = ({ open, link, code, onClose }: { open: boolean; link: string; code: string; onClose: () => void }) => {
  const titleId = useId();
  return <Modal open={open} onClose={onClose} labelledBy={titleId} darkClose>
    <div className={s.modal}>
      <span className={s.brand}><Brand sub="" /></span>
      <h2 id={titleId}>Your referral QR code</h2>
      <p>Scan to open your link with your referral code included.</p>
      <div className={s.largeQr}><ReferralQrImage link={link} /></div>
      <span className={s.code}>Referral code <b>{code || 'Unavailable'}</b></span>
      <div className={s.link}><span>{link || 'Your referral link is not available yet.'}</span>{link && <CopyButton value={link} label="Copy referral link" />}</div>
      <ReferralQrDownloads link={link} code={code} />
    </div>
  </Modal>;
};
