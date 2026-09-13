import { useEffect, useRef, useState } from 'react';
import { CopyIcon } from './icons';
import { useToast } from './Toast';
import { copyText } from '../lib/download';
import s from './CopyButton.module.css';

/**
 * `navigator.clipboard` rejects on insecure origins and when the permission is
 * denied. Rather than silently doing nothing — which reads as a broken button —
 * a failed copy raises a toast explaining why.
 */
export const CopyButton = ({ value, label }: { value: string; label: string }) => {
  const [done, setDone] = useState(false);
  const timer = useRef<number>();
  const toast = useToast();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    if (!(await copyText(value))) {
      // insecure origin or denied permission — say so rather than no-op
      toast('Could not copy', 'Your browser blocked clipboard access.', 'warn');
      return;
    }
    setDone(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 1200);
  };

  return (
    <button
      className={`${s.copy}${done ? ` ${s.done}` : ''}`}
      onClick={copy}
      aria-label={done ? 'Copied' : label}
    >
      <CopyIcon />
    </button>
  );
};
