import { Modal } from '../../components/Modal';
import { CopyField } from '../../components/CopyField';
import { ChatIcon, MegaphoneIcon, ShareIcon } from '../../components/icons';
import { useToast } from '../../components/Toast';
import type { Partner } from '../../types';
import s from './InviteModal.module.css';

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
          Anyone who signs up through your link or code is attributed to you for life,
          and starts earning you commission on their first closed trade.
        </div>
      </div>

      <div className={s.body}>
        <CopyField label="Your link" value={partner.referralLink} />
        <CopyField label="Your code" value={partner.code} />
        <CopyField label="Ready-made message" value={body} multiline />

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
