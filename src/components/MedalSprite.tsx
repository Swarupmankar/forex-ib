import type { ReactNode } from 'react';

/**
 * The six tier medallions, as <symbol> defs, rendered ONCE at the app root.
 *
 * Three things here are load-bearing — see REACT-BUILD-GUIDE.md §4:
 *
 * 1. This must sit outside the router. Mount it inside a route and it unmounts
 *    on navigation, and every <use href="#medalN"> on the page goes blank.
 * 2. Colour comes from CSS custom properties on the *host* element (`.t3` sets
 *    --mA/--mB/--mC/--mG), not from the symbol. Custom properties inherit into
 *    the <use> shadow tree; the stops below read them. Hardcoding stop colours
 *    would break every tier at once.
 * 3. Each symbol carries its own <style> for the sheen sweep. Document CSS does
 *    not reach into a shadow tree, so these cannot move to a global sheet or a
 *    CSS Module — the hashed class name would never match `.sheen`.
 *
 * Every gradient, filter and clip path is id-suffixed by rank (`rim3`, `face3`,
 * `clip3`…). Reusing a bare `rim` across six symbols would make all six resolve
 * to whichever was defined last.
 */

const Defs = ({ n, clip }: { n: number; clip: ReactNode }) => (
  <defs>
    <linearGradient id={`rim${n}`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="var(--mG,#fff)" />
      <stop offset="14%" stopColor="var(--mA,#bbb)" />
      <stop offset="30%" stopColor="var(--mB,#777)" />
      <stop offset="46%" stopColor="var(--mA,#bbb)" />
      <stop offset="58%" stopColor="var(--mG,#fff)" />
      <stop offset="72%" stopColor="var(--mA,#bbb)" />
      <stop offset="88%" stopColor="var(--mB,#777)" />
      <stop offset="100%" stopColor="var(--mC,#333)" />
    </linearGradient>
    <linearGradient id={`face${n}`} x1=".15" y1="0" x2=".85" y2="1">
      <stop offset="0%" stopColor="var(--mA,#bbb)" />
      <stop offset="52%" stopColor="var(--mB,#777)" />
      <stop offset="100%" stopColor="var(--mC,#333)" />
    </linearGradient>
    <linearGradient id={`gloss${n}`} x1="0" y1="0" x2=".35" y2="1">
      <stop offset="0%" stopColor="#fff" stopOpacity=".5" />
      <stop offset="40%" stopColor="#fff" stopOpacity=".07" />
      <stop offset="58%" stopColor="#fff" stopOpacity="0" />
    </linearGradient>
    <radialGradient id={`glow${n}`} cx=".36" cy=".28" r=".85">
      <stop offset="0%" stopColor="var(--mG,#fff)" stopOpacity=".62" />
      <stop offset="55%" stopColor="var(--mG,#fff)" stopOpacity=".06" />
      <stop offset="100%" stopColor="#000" stopOpacity=".32" />
    </radialGradient>
    <filter id={`soft${n}`} x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3" />
    </filter>
    <filter id={`cast${n}`} x="-50%" y="-30%" width="200%" height="180%">
      <feGaussianBlur stdDeviation="5" />
    </filter>
    <clipPath id={`clip${n}`}>{clip}</clipPath>
  </defs>
);

/** Ground shadow under every medallion. */
const Cast = ({ n }: { n: number }) => (
  <ellipse cx="60" cy="126" rx="32" ry="6.5" fill="#000" opacity=".26" filter={`url(#cast${n})`} />
);

/** Clipped highlight pass: broad gloss, specular ellipse, travelling sheen. */
const Gloss = ({ n, shape }: { n: number; shape: ReactNode }) => (
  <g clipPath={`url(#clip${n})`}>
    {shape}
    <ellipse cx="38" cy="30" rx="19" ry="10" fill="#fff" opacity=".45"
      filter={`url(#soft${n})`} transform="rotate(-28 38 30)" />
    <rect className="sheen" x="-72" y="-12" width="30" height="164" fill="#fff"
      opacity=".15" transform="skewX(-22)" />
  </g>
);

/** Staggered so the six medallions on the rewards ladder don't flash in unison. */
const Sheen = ({ n, delay }: { n: number; delay: string }) => (
  <style>{`
        .sheen{animation:sw${n} 7.5s cubic-bezier(.5,0,.5,1) infinite;animation-delay:${delay}}
        @keyframes sw${n}{0%,70%{transform:skewX(-22deg) translateX(0)}100%{transform:skewX(-22deg) translateX(215px)}}
        @media (prefers-reduced-motion:reduce){.sheen{animation:none;opacity:0}}
      `}</style>
);

/* ---------- per-rank geometry ---------- */
const HEX = 'M60.0 6.0 108.5 34.0 108.5 90.0 60.0 118.0 11.5 90.0 11.5 34.0Z';
const HEX_FACE = 'M60.0 22.8 93.9 42.4 93.9 81.6 60.0 101.2 26.1 81.6 26.1 42.4Z';

const SHIELD = 'M60.0 8.0 104.0 21.0 104.0 64.0 88.0 98.0 60.0 118.0 32.0 98.0 16.0 64.0 16.0 21.0Z';
const SHIELD_FACE = 'M60.0 23.1 91.7 32.5 91.7 63.4 80.2 87.9 60.0 102.3 39.8 87.9 28.3 63.4 28.3 32.5Z';

const OCT = 'M38.0 10.0 82.0 10.0 112.0 40.0 112.0 84.0 82.0 114.0 38.0 114.0 8.0 84.0 8.0 40.0Z';
const OCT_FACE = 'M45.0 26.6 75.0 26.6 95.4 47.0 95.4 77.0 75.0 97.4 45.0 97.4 24.6 77.0 24.6 47.0Z';

const STAR8 = 'M60.0 6.0 75.3 25.0 99.6 22.4 97.0 46.7 116.0 62.0 97.0 77.3 99.6 101.6 75.3 99.0 60.0 118.0 44.7 99.0 20.4 101.6 23.0 77.3 4.0 62.0 23.0 46.7 20.4 22.4 44.7 25.0Z';
const STAR8_FACE = 'M60.0 27.3 69.5 39.1 84.6 37.4 82.9 52.5 94.7 62.0 82.9 71.5 84.6 86.6 69.5 84.9 60.0 96.7 50.5 84.9 35.4 86.6 37.1 71.5 25.3 62.0 37.1 52.5 35.4 37.4 50.5 39.1Z';

const GEAR = 'M60.0 5.0 69.8 13.0 81.8 9.3 87.8 20.4 100.3 21.7 101.6 34.2 112.7 40.2 109.0 52.2 117.0 62.0 109.0 71.8 112.7 83.8 101.6 89.8 100.3 102.3 87.8 103.6 81.8 114.7 69.8 111.0 60.0 119.0 50.2 111.0 38.2 114.7 32.2 103.6 19.7 102.3 18.4 89.8 7.3 83.8 11.0 71.8 3.0 62.0 11.0 52.2 7.3 40.2 18.4 34.2 19.7 21.7 32.2 20.4 38.2 9.3 50.2 13.0Z';
const GEAR_FACE = 'M44.0 28.0 76.0 28.0 94.0 46.0 94.0 78.0 76.0 96.0 44.0 96.0 26.0 78.0 26.0 46.0Z';

/** back plates: the same outline offset down 6 and 3 units, giving the edge depth */
const shift = (d: string, dy: number) =>
  d.replace(/(\d+\.\d+) (\d+\.\d+)/g, (_, x: string, y: string) => `${x} ${(parseFloat(y) + dy).toFixed(1)}`);

const Back = ({ d }: { d: string }) => (
  <>
    <path d={shift(d, 6)} fill="var(--mC,#333)" />
    <path d={shift(d, 3)} fill="var(--mC,#333)" opacity=".6" />
  </>
);

/** face plate: tinted gradient, radial glow, hairline edge */
const Face = ({ n, d }: { n: number; d: string }) => (
  <>
    <path d={d} fill={`url(#face${n})`} opacity=".5" />
    <path d={d} fill={`url(#glow${n})`} />
    <path d={d} fill="none" stroke="var(--mG,#fff)" strokeOpacity=".4" strokeWidth="1.2" />
  </>
);

/**
 * Every emblem is drawn twice: a blurred BLACK copy offset down 2.4 units for
 * the cast shadow, then the metal copy on top. `draw` receives the fill/stroke
 * to use so both copies stay structurally identical — only the colour differs.
 */
const Emblem = ({ n, draw }: { n: number; draw: (metal: string) => ReactNode }) => (
  <>
    <g transform="translate(0,2.4)" opacity=".4" filter={`url(#soft${n})`}>{draw('#000')}</g>
    {draw('var(--mG,#fff)')}
  </>
);

export const MedalSprite = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
    <defs>
      <linearGradient id="dialgrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#18884D" />
        <stop offset="100%" stopColor="#6DE3A4" />
      </linearGradient>

      {/* ---------- 1 · Associate — disc + chevron ---------- */}
      <symbol id="medal1" viewBox="0 0 120 136">
        <Defs n={1} clip={<circle cx="60" cy="62" r="52" />} />
        <Cast n={1} />
        <circle cx="60" cy="68" r="52" fill="var(--mC,#333)" />
        <circle cx="60" cy="65" r="52" fill="var(--mC,#333)" opacity=".6" />
        <circle cx="60" cy="62" r="52" fill="url(#rim1)" />
        <circle cx="60" cy="62" r="45" fill="none" stroke="var(--mC,#333)" strokeOpacity=".45" strokeWidth="1.4" />
        <circle cx="60" cy="62" r="48.5" fill="none" stroke="var(--mG,#fff)" strokeOpacity=".5" strokeWidth="3.4" strokeDasharray="1.6 5.2" />
        <circle cx="60" cy="62" r="37" fill="url(#face1)" opacity=".6" />
        <circle cx="60" cy="62" r="37" fill="url(#glow1)" />
        <circle cx="60" cy="62" r="37" fill="none" stroke="var(--mG,#fff)" strokeOpacity=".4" strokeWidth="1.3" />
        <Emblem n={1} draw={(m) => (
          <path d="M44 72 60 55 76 72" fill="none" stroke={m} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        )} />
        <Gloss n={1} shape={<circle cx="60" cy="62" r="52" fill="url(#gloss1)" />} />
        <path d="M23.1 25.1A52 52 0 0 1 96.9 25.1" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.5" strokeLinecap="round" />
        <Sheen n={1} delay="0.4s" />
      </symbol>

      {/* ---------- 2 · Partner — hexagon + double chevron ---------- */}
      <symbol id="medal2" viewBox="0 0 120 136">
        <Defs n={2} clip={<path d={HEX} />} />
        <Cast n={2} />
        <Back d={HEX} />
        <path d={HEX} fill="url(#rim2)" />
        {[[60.0, 13.8], [101.7, 37.9], [101.7, 86.1], [60.0, 110.2], [18.3, 86.1], [18.3, 37.9]].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.4" fill="var(--mG,#fff)" opacity=".55" />
        ))}
        <g>
          <path d="M60 62 60.0 22.8 93.9 42.4Z" fill="#fff" opacity="0.15" />
          <path d="M60 62 93.9 42.4 93.9 81.6Z" fill="#000" opacity="0.18" />
          <path d="M60 62 93.9 81.6 60.0 101.2Z" fill="#000" opacity="0.26" />
          <path d="M60 62 60.0 101.2 26.1 81.6Z" fill="#000" opacity="0.12" />
          <path d="M60 62 26.1 81.6 26.1 42.4Z" fill="#fff" opacity="0.21" />
          <path d="M60 62 26.1 42.4 60.0 22.8Z" fill="#fff" opacity="0.30" />
        </g>
        <Face n={2} d={HEX_FACE} />
        <Emblem n={2} draw={(m) => (
          <>
            <path d="M44 78 60 62 76 78" fill="none" stroke={m} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M44 62 60 46 76 62" fill="none" stroke={m} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )} />
        <Gloss n={2} shape={<path d={HEX} fill="url(#gloss2)" />} />
        <path d="M11.5 34.0 L60.0 6.0 L108.5 34.0" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" strokeLinecap="round" />
        <Sheen n={2} delay="0.8s" />
      </symbol>

      {/* ---------- 3 · Senior Partner — shield + star ---------- */}
      <symbol id="medal3" viewBox="0 0 120 136">
        <Defs n={3} clip={<path d={SHIELD} />} />
        <Cast n={3} />
        <Back d={SHIELD} />
        <path d={SHIELD} fill="url(#rim3)" />
        <path d="M60 14 98 25v38c0 24-18 40-38 49-20-9-38-25-38-49V25Z" fill="none" stroke="var(--mG,#fff)" strokeOpacity=".38" strokeWidth="1.5" />
        <g>
          <path d="M60 62 60.0 23.1 91.7 32.5Z" fill="#fff" opacity="0.17" />
          <path d="M60 62 91.7 32.5 91.7 63.4Z" fill="#000" opacity="0.10" />
          <path d="M60 62 91.7 63.4 80.2 87.9Z" fill="#000" opacity="0.24" />
          <path d="M60 62 80.2 87.9 60.0 102.3Z" fill="#000" opacity="0.24" />
          <path d="M60 62 60.0 102.3 39.8 87.9Z" fill="#000" opacity="0.16" />
          <path d="M60 62 39.8 87.9 28.3 63.4Z" fill="#fff" opacity="0.10" />
          <path d="M60 62 28.3 63.4 28.3 32.5Z" fill="#fff" opacity="0.27" />
          <path d="M60 62 28.3 32.5 60.0 23.1Z" fill="#fff" opacity="0.29" />
        </g>
        <Face n={3} d={SHIELD_FACE} />
        <Emblem n={3} draw={(m) => (
          <path d="M60.0 40.0 65.9 55.9 82.8 56.6 69.5 67.1 74.1 83.4 60.0 74.0 45.9 83.4 50.5 67.1 37.2 56.6 54.1 55.9Z" fill={m} />
        )} />
        <Gloss n={3} shape={<path d={SHIELD} fill="url(#gloss3)" />} />
        <path d="M16.0 21.0 L60.0 8.0 L104.0 21.0" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" strokeLinecap="round" />
        <Sheen n={3} delay="1.2s" />
      </symbol>

      {/* ---------- 4 · Elite Partner — octagon + gem ---------- */}
      <symbol id="medal4" viewBox="0 0 120 136">
        <Defs n={4} clip={<path d={OCT} />} />
        <Cast n={4} />
        <Back d={OCT} />
        <path d={OCT} fill="url(#rim4)" />
        <path d="M38 18 82 18 104 40v44l-22 22H38L16 84V40Z" fill="none" stroke="var(--mG,#fff)" strokeOpacity=".34" strokeWidth="1.4" />
        <g>
          <path d="M60 62 45.0 26.6 75.0 26.6Z" fill="#fff" opacity="0.25" />
          <path d="M60 62 75.0 26.6 95.4 47.0Z" fill="#fff" opacity="0.09" />
          <path d="M60 62 95.4 47.0 95.4 77.0Z" fill="#000" opacity="0.18" />
          <path d="M60 62 95.4 77.0 75.0 97.4Z" fill="#000" opacity="0.26" />
          <path d="M60 62 75.0 97.4 45.0 97.4Z" fill="#000" opacity="0.21" />
          <path d="M60 62 45.0 97.4 24.6 77.0Z" fill="#000" opacity="0.06" />
          <path d="M60 62 24.6 77.0 24.6 47.0Z" fill="#fff" opacity="0.21" />
          <path d="M60 62 24.6 47.0 45.0 26.6Z" fill="#fff" opacity="0.30" />
        </g>
        <Face n={4} d={OCT_FACE} />
        <Emblem n={4} draw={(m) => (
          <>
            <path d="M60 34 86 54 60 90 34 54Z" fill={m} />
            <path d="M60 34 86 54 60 60 34 54Z" fill="#fff" opacity=".45" />
            <path d="M34 54 60 60 60 90Z" fill="#000" opacity=".18" />
          </>
        )} />
        <Gloss n={4} shape={<path d={OCT} fill="url(#gloss4)" />} />
        <path d="M8.0 40.0 L38.0 10.0 L82.0 10.0" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" strokeLinecap="round" />
        <Sheen n={4} delay="1.6s" />
      </symbol>

      {/* ---------- 5 · Director — eight-point star + laurel ---------- */}
      <symbol id="medal5" viewBox="0 0 120 136">
        <Defs n={5} clip={<path d={STAR8} />} />
        <Cast n={5} />
        <Back d={STAR8} />
        <path d={STAR8} fill="url(#rim5)" />
        <circle cx="60" cy="62" r="34" fill="none" stroke="var(--mG,#fff)" strokeOpacity=".4" strokeWidth="1.5" />
        <g>
          <path d="M60 62 60.0 27.3 69.5 39.1Z" fill="#fff" opacity="0.22" />
          <path d="M60 62 69.5 39.1 84.6 37.4Z" fill="#fff" opacity="0.13" />
          <path d="M60 62 84.6 37.4 82.9 52.5Z" fill="#000" opacity="0.05" />
          <path d="M60 62 82.9 52.5 94.7 62.0Z" fill="#000" opacity="0.15" />
          <path d="M60 62 94.7 62.0 82.9 71.5Z" fill="#000" opacity="0.20" />
          <path d="M60 62 82.9 71.5 84.6 86.6Z" fill="#000" opacity="0.25" />
          <path d="M60 62 84.6 86.6 69.5 84.9Z" fill="#000" opacity="0.26" />
          <path d="M60 62 69.5 84.9 60.0 96.7Z" fill="#000" opacity="0.23" />
          <path d="M60 62 60.0 96.7 50.5 84.9Z" fill="#000" opacity="0.19" />
          <path d="M60 62 50.5 84.9 35.4 86.6Z" fill="#000" opacity="0.10" />
          <path d="M60 62 35.4 86.6 37.1 71.5Z" fill="#fff" opacity="0.07" />
          <path d="M60 62 37.1 71.5 25.3 62.0Z" fill="#fff" opacity="0.18" />
          <path d="M60 62 25.3 62.0 37.1 52.5Z" fill="#fff" opacity="0.24" />
          <path d="M60 62 37.1 52.5 35.4 37.4Z" fill="#fff" opacity="0.29" />
          <path d="M60 62 35.4 37.4 50.5 39.1Z" fill="#fff" opacity="0.30" />
          <path d="M60 62 50.5 39.1 60.0 27.3Z" fill="#fff" opacity="0.27" />
        </g>
        <Face n={5} d={STAR8_FACE} />
        <Emblem n={5} draw={(m) => (
          <>
            <path d="M60.0 43.0 64.7 55.5 78.1 56.1 67.6 64.5 71.2 77.4 60.0 70.0 48.8 77.4 52.4 64.5 41.9 56.1 55.3 55.5Z" fill={m} />
            <path d="M32 50c-6 12-4 26 6 34" fill="none" stroke={m} strokeWidth="4" strokeLinecap="round" opacity=".85" />
            <path d="M88 50c6 12 4 26-6 34" fill="none" stroke={m} strokeWidth="4" strokeLinecap="round" opacity=".85" />
          </>
        )} />
        <Gloss n={5} shape={<path d={STAR8} fill="url(#gloss5)" />} />
        <path d="M44.7 25.0 L60.0 6.0 L75.3 25.0" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" strokeLinecap="round" />
        <Sheen n={5} delay="2.0s" />
      </symbol>

      {/* ---------- 6 · Managing Partner — cogged disc + crown ---------- */}
      <symbol id="medal6" viewBox="0 0 120 136">
        <Defs n={6} clip={<path d={GEAR} />} />
        <Cast n={6} />
        <Back d={GEAR} />
        <path d={GEAR} fill="url(#rim6)" />
        <circle cx="60" cy="62" r="47" fill="none" stroke="var(--mC,#333)" strokeOpacity=".5" strokeWidth="2" />
        <circle cx="60" cy="62" r="43.5" fill="none" stroke="var(--mG,#fff)" strokeOpacity=".42" strokeWidth="1.3" />
        {[[60.0, 22.0], [88.3, 33.7], [100.0, 62.0], [88.3, 90.3], [60.0, 102.0], [31.7, 90.3], [20.0, 62.0], [31.7, 33.7]].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.9" fill="var(--mG,#fff)" opacity=".6" />
        ))}
        <g>
          <path d="M60 62 44.0 28.0 76.0 28.0Z" fill="#fff" opacity="0.25" />
          <path d="M60 62 76.0 28.0 94.0 46.0Z" fill="#fff" opacity="0.09" />
          <path d="M60 62 94.0 46.0 94.0 78.0Z" fill="#000" opacity="0.18" />
          <path d="M60 62 94.0 78.0 76.0 96.0Z" fill="#000" opacity="0.26" />
          <path d="M60 62 76.0 96.0 44.0 96.0Z" fill="#000" opacity="0.21" />
          <path d="M60 62 44.0 96.0 26.0 78.0Z" fill="#000" opacity="0.06" />
          <path d="M60 62 26.0 78.0 26.0 46.0Z" fill="#fff" opacity="0.21" />
          <path d="M60 62 26.0 46.0 44.0 28.0Z" fill="#fff" opacity="0.30" />
        </g>
        <Face n={6} d={GEAR_FACE} />
        <Emblem n={6} draw={(m) => (
          <>
            <path d="M40 76 45 47 55 60 60 38 65 60 75 47 80 76Z" fill={m} />
            <path d="M40 76 45 47 55 60 60 38 60 76Z" fill="#fff" opacity=".38" />
            <rect x="39" y="79" width="42" height="7.5" rx="3.2" fill={m} />
            <circle cx="60" cy="53" r="4.2" fill="var(--mC,#333)" opacity=".6" />
          </>
        )} />
        <Gloss n={6} shape={<path d={GEAR} fill="url(#gloss6)" />} />
        <path d="M50.2 13.0 L60.0 5.0 L69.8 13.0" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" strokeLinecap="round" />
        <Sheen n={6} delay="2.4s" />
      </symbol>

      <linearGradient id="bevel" x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0%" stopColor="#fff" stopOpacity=".35" />
        <stop offset="55%" stopColor="#fff" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity=".25" />
      </linearGradient>
    </defs>
  </svg>
);
