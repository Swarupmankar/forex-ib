import type { SVGProps } from 'react';
import s from './Brand.module.css';
export const BrandMark = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 456 495" fill="none" aria-hidden="true" focusable="false" {...props}>
    <polygon points="4,4 164,125 164,370 4,491" fill="currentColor" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
    <polygon points="452,4 292,125 292,370 452,491" fill="#b0f000" stroke="#b0f000" strokeWidth="8" strokeLinejoin="round" />
  </svg>
);
export const Brand = ({ sub = "Partner portal" }: { sub?: string }) => (
  <span className={s.brand}>
    <BrandMark className={s.mark} />
    <span><span className={s.name}><b>Movement</b> Markets</span>{sub && <span className={s.sub}>{sub}</span>}</span>
  </span>
);
