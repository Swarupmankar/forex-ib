import { Modal } from './Modal';
import { ChevronRightIcon, MailIcon, MegaphoneIcon, PhoneIcon } from './icons';
import { partnerManager } from '../data/fixtures';
import type { Partner } from '../types';
import c from './ContactModal.module.css';
import s from './ModalContent.module.css';

/**
 * Every route here hands off to a real client — mail, phone, Telegram. The
 * partner's own id and tier are pre-filled into the subject so the manager
 * doesn't have to ask who is writing.
 */
export const ContactModal = ({
  open,
  partner,
  onClose,
}: {
  open: boolean;
  partner: Partner;
  onClose: () => void;
}) => {
  const m = partnerManager;
  const subject = encodeURIComponent(`Partner ${partner.id} — question`);
  const body = encodeURIComponent(`Hi ${m.name.split(' ')[0]},\n\n\n\n—\n${partner.name}\nPartner ${partner.id}`);

  const routes = [
    { icon: <MailIcon />, title: 'Email', value: m.email, href: `mailto:${m.email}?subject=${subject}&body=${body}` },
    { icon: <PhoneIcon />, title: 'Phone', value: m.phone, href: `tel:${m.phone.replace(/\s/g, '')}` },
    { icon: <MegaphoneIcon />, title: 'Telegram', value: m.telegram, href: `https://t.me/${m.telegram.replace('@', '')}` },
  ];

  return (
    <Modal open={open} onClose={onClose} labelledBy="contact-title" darkClose>
      <div className={c.who}>
        <div className={c.avatar}>{m.initials}</div>
        <div>
          <div className={c.name} id="contact-title">{m.name}</div>
          <div className={c.role}>{m.role} · {m.hours}</div>
        </div>
      </div>

      <div className={s.body}>
        <div className={s.section}>
          <div className={s.sectionH}>Reach them</div>
          <div className={c.routes}>
            {routes.map((r) => (
              <a className={c.route} key={r.title} href={r.href} target="_blank" rel="noopener noreferrer">
                {r.icon}
                <span className={c.routeBody}>
                  <span className={c.routeT}>{r.title}</span>
                  <span className={c.routeV}>{r.value}</span>
                </span>
                <ChevronRightIcon className={c.chev} />
              </a>
            ))}
          </div>
        </div>

        <div className={s.note}>
          A dedicated manager comes with Senior Partner and above. Rate changes, custom
          terms and payout escalations go through them rather than general support.
        </div>
      </div>
    </Modal>
  );
};
