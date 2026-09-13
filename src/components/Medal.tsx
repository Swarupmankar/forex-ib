import type { TierRank } from '../types';

/**
 * A tier medallion. The `t{rank}` class is what colours it: it sets
 * --mA/--mB/--mC/--mG on this element, and those inherit into the <use>
 * shadow tree where the gradient stops read them.
 *
 * Sizing comes from the caller — the mockup renders these at eight different
 * sizes and each context sets its own width/height.
 */
export const Medal = ({ tier, className = '' }: { tier: TierRank; className?: string }) => (
  <svg className={`medal t${tier} ${className}`.trim()} viewBox="0 0 120 136" aria-hidden>
    <use href={`#medal${tier}`} />
  </svg>
);
