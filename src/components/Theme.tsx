import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import s from './Theme.module.css';
type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} });
const readTheme = (): Theme => {
  try { const saved = localStorage.getItem('mm-ib-theme'); if (saved === 'light' || saved === 'dark') return saved; } catch { /* Storage can be unavailable in private contexts. */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(readTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('mm-ib-theme', theme); } catch { /* The current session still changes theme. */ }
  }, [theme]);
  return <ThemeContext.Provider value={{ theme, toggle: () => setTheme(t => t === 'light' ? 'dark' : 'light') }}>{children}</ThemeContext.Provider>;
};
export const ThemeToggle = () => {
  const { theme, toggle } = useContext(ThemeContext);
  const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
  return <button className={s.toggle} onClick={toggle} aria-label={label} title={label}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {theme === 'dark' ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></> : <path d="M20.4 14.8A9 9 0 0 1 9.2 3.6 9 9 0 1 0 20.4 14.8Z" />}
    </svg>
  </button>;
};
