import { useCallback, useEffect, useState } from 'react';

/**
 * State that survives a reload, in localStorage.
 *
 * With no backend, preferences would otherwise reset on every navigation and
 * the toggles would be theatre. Reads are guarded: localStorage throws in
 * private-mode Safari and when storage is disabled, and a preference is never
 * worth taking the page down for.
 */
export const usePersistentState = <T,>(key: string, initial: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — the value still works for this session */
    }
  }, [key, value]);

  const reset = useCallback(() => setValue(initial), [initial]);

  return [value, setValue, reset] as const;
};
