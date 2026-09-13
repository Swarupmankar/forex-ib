import { useEffect, type RefObject } from 'react';

/**
 * Dismiss-on-outside-click and Escape for lightweight popovers.
 *
 * Deliberately not useDismissable: that locks body scroll and traps focus,
 * which is right for a modal and wrong for a dropdown you can scroll past.
 * Listens on pointerdown so the popover closes before a click lands behind it.
 */
export const usePopover = (
  open: boolean,
  onClose: () => void,
  ref: RefObject<HTMLElement | null>,
) => {
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose, ref]);
};
