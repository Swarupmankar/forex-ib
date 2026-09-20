import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Medal } from './Medal';
import { CardPlainIcon, ChatIcon, ChevronRightIcon, GearIcon, LogOutIcon, MegaphoneIcon, LinkIcon, WebIcon } from './icons';
import { useAuth } from '../auth/useAuth';
import { useToast } from './Toast';
import { SECTIONS, TAB_IDS, type SectionId } from '../nav';
import { useDismissable } from '../lib/useDismissable';
import { useNavBadges, usePartner } from '../api/hooks';
import { tierByRank } from '../data/tiers';
import s from './MoreSheet.module.css';
import { CLIENT_LOGIN_URL, PUBLIC_SITE_URL } from '../config/portalLinks';

const ICONS: Partial<Record<SectionId, typeof GearIcon>> = {
  marketing: MegaphoneIcon,
  payouts: CardPlainIcon,
  settings: GearIcon,
};

/** The sections that don't get their own tab. */
const OVERFLOW = SECTIONS.filter((x) => !TAB_IDS.includes(x.id));

export const MoreSheet = ({
  open,
  onClose,
  onContact,
}: {
  open: boolean;
  onClose: () => void;
  onContact: () => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const partner = usePartner();
  const badges = useNavBadges();
  const { signOut } = useAuth();
  const toast = useToast();
  useDismissable(open, onClose, cardRef);

  if (!open) return null;

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  return createPortal(
    <div className={s.sheet}>
      <div className={s.scrim} onClick={onClose} />
      <div className={s.card} role="dialog" aria-modal="true" aria-label="More" tabIndex={-1} ref={cardRef}>
        <div className={s.grab} />

        <div className={s.me}>
          <div className={s.avatar}>{partner.initials}</div>
          <div>
            <div className={s.name}>{partner.name}</div>
            <div className={s.id}>{partner.id} · {tierByRank(partner.tier).name}</div>
          </div>
          <Medal tier={partner.tier} className={s.med} />
        </div>

        {OVERFLOW.map((section) => {
          const Icon = ICONS[section.id] ?? GearIcon;
          return (
            <button className={s.row} key={section.id} onClick={() => go(section.path)}>
              <Icon strokeWidth={1.8} />
              <span>{section.label}</span>
              {badges[section.id] && <b className={s.badge}>{badges[section.id]}</b>}
              <ChevronRightIcon className={s.chev} />
            </button>
          );
        })}

        <button
          className={s.row}
          onClick={() => {
            onClose();
            onContact();
          }}
        >
          <ChatIcon />
          <span>Contact your partner manager</span>
          <ChevronRightIcon className={s.chev} />
        </button>

        <a className={s.row} href={CLIENT_LOGIN_URL}>
          <LinkIcon />
          <span>Open client portal</span>
          <ChevronRightIcon className={s.chev} />
        </a>

        <a className={s.row} href={PUBLIC_SITE_URL}>
          <WebIcon />
          <span>Visit Movement Markets</span>
          <ChevronRightIcon className={s.chev} />
        </a>

        <button
          className={`${s.row} ${s.danger}`}
          onClick={() => {
            onClose();
            signOut();
            toast('Signed out', 'Your session on this device has ended.');
          }}
        >
          <LogOutIcon />
          <span>Log out</span>
        </button>
      </div>
    </div>,
    document.body,
  );
};
