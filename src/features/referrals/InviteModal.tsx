import { Modal } from '../../components/Modal';
import { CopyField } from '../../components/CopyField';
import { ChatIcon, MegaphoneIcon, ShareIcon } from '../../components/icons';
import { useToast } from '../../components/Toast';
import type { Partner } from '../../types';
import s from './InviteModal.module.css';
import { ReferralQrImage, ReferralQrDownloads } from './ReferralQr';

const message = (partner: Partner) =>
  `Trade with my partner link and get onboarded in minutes.\n\n${partner.referralLink}\n\nUse code ${partner.code} at sign-up.`;

/**
 * Every channel here is a real handoff: the OS share sheet where the browser
 * supports it, otherwise a deep link that opens the actual app or client.
 * Nothing is sent from this page.
 */
export const InviteModal = ({
  open,
  partner,
  onClose,
}: {
  open: boolean;
  partner: Partner;
  onClose: () => void;
}) => {
  const toast = useToast();
  const body = message(partner);

  const share = async () => {
    if (!navigator.share) {
      toast('Sharing not available here', 'Use the copy buttons or a channel below.', 'warn');
      return;
    }
    try {
      await navigator.share({ title: 'Trade with my partner link', text: body, url: partner.referralLink });
    } catch {
      /* the user dismissed the sheet — not an error worth reporting */
    }
  };

  const open_ = (href: string) => {
    const win = window.open(href, '_blank', 'noopener,noreferrer');
    if (!win) toast('Popup blocked', 'Allow popups, or copy the message above.', 'warn');
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="invite-title" darkClose>
      <div className={s.head}>
        <div className={s.eyebrow}>Referrals</div>
        <h3 className={s.title} id="invite-title">Invite a trader</h3>
        <div className={s.sub}>
          Share your personal link or let a trader scan your QR code to register with your referral code.
        </div>
      </div>

      <div className={s.body}>
        <div className={s.qrPass}><div><ReferralQrImage link={partner.referralLink} /></div><span><b>Scan to register</b><span>Movement Markets</span><small>Your code is included automatically.</small></span></div>
        <CopyField label="Your link" value={partner.referralLink} />
        <CopyField label="Your code" value={partner.code} />
        <ReferralQrDownloads link={partner.referralLink} code={partner.code} />
        <details className={s.message}><summary>Ready-made invitation</summary><CopyField label="Message" value={body} multiline /></details>

        <div className={s.channels}>
          <button className={s.channel} onClick={share}>
            <ShareIcon /> Share
          </button>
          <button
            className={s.channel}
            onClick={() => open_(`https://wa.me/?text=${encodeURIComponent(body)}`)}
          >
            <ChatIcon /> WhatsApp
          </button>
          <button
            className={s.channel}
            onClick={() =>
              open_(`https://t.me/share/url?url=${encodeURIComponent(partner.referralLink)}&text=${encodeURIComponent('Trade with my partner link')}`)
            }
          >
            <MegaphoneIcon /> Telegram
          </button>
        </div>
      </div>
    </Modal>
  );
};
