import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from './icons';
import { useDismissable } from '../lib/useDismissable';
import s from './Modal.module.css';

/**
 * Centred dialog above 900px, bottom sheet below — same component, the CSS
 * swaps the presentation. Escape, scroll lock, focus trap and focus
 * restoration come from useDismissable; the backdrop click is wired here.
 */
export const Modal = ({
  open,
  onClose,
  labelledBy,
  darkClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  /** true when the dialog's own header is light, so the X needs contrast */
  darkClose?: boolean;
  children: ReactNode;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  useDismissable(open, onClose, cardRef);

  if (!open) return null;

  return createPortal(
    <div className={s.modal}>
      <div className={s.scrim} onClick={onClose} />
      <div
        className={s.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        ref={cardRef}
      >
        <button
          className={`${s.x}${darkClose ? ` ${s.xDark}` : ''}`}
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
};
