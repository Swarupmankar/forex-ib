import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { CheckIcon, CloseIcon, WarningIcon } from './icons';
import s from './Toast.module.css';

export interface Toast {
  id: number;
  title: string;
  detail?: string;
  tone: 'good' | 'warn';
}

type Show = (title: string, detail?: string, tone?: Toast['tone']) => void;

const ToastContext = createContext<Show>(() => {});

/** Confirmation for actions that otherwise leave no trace (exports, saves, copies). */
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<Show>((title, detail, tone = 'good') => {
    const id = nextId.current++;
    setToasts((list) => [...list.slice(-2), { id, title, detail, tone }]);
    timers.current.push(window.setTimeout(() => dismiss(id), 4200));
  }, [dismiss]);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className={s.wrap} role="status" aria-live="polite">
          {toasts.map((t) => (
            <div className={`${s.toast} ${t.tone === 'warn' ? s.warn : s.good}`} key={t.id}>
              <span className={s.ico}>{t.tone === 'warn' ? <WarningIcon /> : <CheckIcon strokeWidth={2.6} />}</span>
              <div className={s.body}>
                <div className={s.title}>{t.title}</div>
                {t.detail && <div className={s.detail}>{t.detail}</div>}
              </div>
              <button className={s.close} onClick={() => dismiss(t.id)} aria-label="Dismiss">
                <CloseIcon />
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
};
