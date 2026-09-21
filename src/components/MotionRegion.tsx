import { useLayoutEffect, useRef, type ReactNode } from 'react';

/** Animate the visible content, without remounting forms or delaying navigation. */
export const MotionRegion = ({ motionKey, children }: { motionKey: string; children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = ref.current?.animate(
      [{ opacity: .35, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' },
    );
    return () => animation?.cancel();
  }, [motionKey]);
  return <div ref={ref} className="motion-region">{children}</div>;
};
