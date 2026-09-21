import type { ReactNode, SVGProps } from 'react';

/**
 * Inline SVG copied verbatim from ib-platform.html — no icon package.
 * Path data is the visual contract; stroke-width is supplied by CSS for
 * nav/tab icons and inline (as a prop) everywhere else, exactly as the
 * mockup does it.
 */
type Props = SVGProps<SVGSVGElement>;

const Icon = ({ children, ...rest }: Props & { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}>
    {children}
  </svg>
);

/* ---------- navigation ---------- */
export const GridIcon = (p: Props) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </Icon>
);

export const UsersIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="3.2" />
    <path d="M22 20v-2a4 4 0 0 0-3-3.87" />
  </Icon>
);

/** The tab bar drops the third figure. */
export const UsersTabIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="3.2" />
  </Icon>
);

export const DollarIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Icon>
);

export const TrophyIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M6 3h12l1 5a7 7 0 0 1-14 0Z" />
    <path d="M19 5h2a3 3 0 0 1-3 3M5 5H3a3 3 0 0 0 3 3" />
    <path d="M12 13v4M8.5 21h7l-.6-3.2a1 1 0 0 0-1-.8h-3.8a1 1 0 0 0-1 .8Z" />
  </Icon>
);

/** The tab bar drops the trophy handles. */
export const TrophyTabIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M6 3h12l1 5a7 7 0 0 1-14 0Z" />
    <path d="M12 13v4M8.5 21h7l-.6-3.2a1 1 0 0 0-1-.8h-3.8a1 1 0 0 0-1 .8Z" />
  </Icon>
);

export const MegaphoneIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1Z" />
    <path d="M17 9a4 4 0 0 1 0 6" />
  </Icon>
);

export const CardIcon = (p: Props) => (
  <Icon {...p}>
    <rect x="2" y="6" width="20" height="13" rx="2.5" />
    <path d="M2 10.5h20M6 15h4" />
  </Icon>
);

/** Payout buttons use the card without the stripe. */
export const CardPlainIcon = (p: Props) => (
  <Icon {...p}>
    <rect x="2" y="6" width="20" height="13" rx="2.5" />
    <path d="M2 10.5h20" />
  </Icon>
);

export const GearIcon = (p: Props) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.9 15.5a1.6 1.6 0 0 0 .3 1.8 2 2 0 1 1-2.8 2.8 1.6 1.6 0 0 0-2.7 1.1 2 2 0 1 1-4 0 1.6 1.6 0 0 0-2.7-1.1 2 2 0 1 1-2.8-2.8 1.6 1.6 0 0 0-1.1-2.7 2 2 0 1 1 0-4 1.6 1.6 0 0 0 1.1-2.7 2 2 0 1 1 2.8-2.8 1.6 1.6 0 0 0 2.7-1.1 2 2 0 1 1 4 0 1.6 1.6 0 0 0 2.7 1.1 2 2 0 1 1 2.8 2.8 1.6 1.6 0 0 0 1.1 2.7 2 2 0 1 1 0 4 1.6 1.6 0 0 0-1.4 1.9Z" />
  </Icon>
);

export const DotsIcon = (p: Props) => (
  <Icon {...p}>
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </Icon>
);

/* ---------- chrome ---------- */
export const SearchIcon = (p: Props) => (
  <Icon strokeWidth={2} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

export const BellIcon = (p: Props) => (
  <Icon strokeWidth={1.8} {...p}>
    <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
    <path d="M13.7 20a2 2 0 0 1-3.4 0" />
  </Icon>
);

export const ChevronDownIcon = (p: Props) => (
  <Icon strokeWidth={2} {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

export const ChevronRightIcon = (p: Props) => (
  <Icon strokeWidth={2} {...p}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);

/* ---------- actions ---------- */
export const DownloadIcon = (p: Props) => (
  <Icon strokeWidth={1.8} {...p}>
    <path d="M12 3v12M8 11l4 4 4-4M4 19h16" />
  </Icon>
);

export const UserPlusIcon = (p: Props) => (
  <Icon strokeWidth={1.8} {...p}>
    <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="3.2" />
    <path d="M19 8v6M22 11h-6" />
  </Icon>
);

export const CopyIcon = (p: Props) => (
  <Icon strokeWidth={1.8} {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2.5" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
);

export const CheckIcon = (p: Props) => (
  <Icon strokeWidth={2} {...p}>
    <path d="m5 13 4 4L19 7" />
  </Icon>
);

export const InfoIcon = (p: Props) => (
  <Icon strokeWidth={1.9} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h.01" />
  </Icon>
);

export const CloseIcon = (p: Props) => (
  <Icon strokeWidth={2} {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);

export const LinkIcon = (p: Props) => (
  <Icon strokeWidth={1.8} {...p}>
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L12 19" />
  </Icon>
);

export const TrendUpIcon = (p: Props) => (
  <Icon strokeWidth={2.2} {...p}>
    <path d="M3 17 10 10l4 4 7-7M15 7h6v6" />
  </Icon>
);

export const ChatIcon = (p: Props) => (
  <Icon strokeWidth={1.8} {...p}>
    <path d="M4 4h16v12H5.5L4 19Z" />
  </Icon>
);

/* ---------- reward + feed glyphs ---------- */
export const ChartIcon = (p: Props) => (
  <Icon strokeWidth={1.9} {...p}>
    <path d="M3 3v18h18" />
    <path d="m7 14 4-4 3 3 5-6" />
  </Icon>
);

export const BoxIcon = (p: Props) => (
  <Icon strokeWidth={1.9} {...p}>
    <path d="M20 7 12 3 4 7v10l8 4 8-4Z" />
    <path d="m4 7 8 4 8-4M12 11v10" />
  </Icon>
);

/** the activity feed's upgrade glyph drops the vertical seam */
export const BoxFlatIcon = (p: Props) => (
  <Icon strokeWidth={2} {...p}>
    <path d="M20 7 12 3 4 7v10l8 4 8-4Z" />
    <path d="m4 7 8 4 8-4" />
  </Icon>
);

export const PhoneIcon = (p: Props) => (
  <Icon strokeWidth={1.9} {...p}>
    <rect x="5" y="2" width="14" height="20" rx="3" />
    <path d="M11 18h2" />
  </Icon>
);

export const WebIcon = (p: Props) => (
  <Icon strokeWidth={1.9} {...p}>
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <path d="M8 21h8M12 18v3" />
  </Icon>
);

export const PlaneIcon = (p: Props) => (
  <Icon strokeWidth={1.9} {...p}>
    <path d="M2 15h20M17.5 15l2-6.5a2 2 0 0 0-1.9-2.5H6.4a2 2 0 0 0-1.9 2.5L6.5 15" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </Icon>
);

export const BankIcon = (p: Props) => (
  <Icon strokeWidth={1.9} {...p}>
    <path d="M4 20V8l8-5 8 5v12" />
    <path d="M9 20v-6h6v6" />
  </Icon>
);

export const LockIcon = (p: Props) => (
  <Icon strokeWidth={1.9} {...p}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Icon>
);

export const CarIcon = (p: Props) => (
  <Icon strokeWidth={1.9} {...p}>
    <path d="M5 17h14M4 17V9.5L6.5 5h11L20 9.5V17" />
    <circle cx="7.5" cy="17" r="2" />
    <circle cx="16.5" cy="17" r="2" />
  </Icon>
);

export const StarIcon = (p: Props) => (
  <Icon strokeWidth={1.9} {...p}>
    <path d="M12 2 9 9l-7 .6 5.3 4.6L5.7 21 12 17.3 18.3 21l-1.6-6.8L22 9.6 15 9Z" />
  </Icon>
);

export const CalendarIcon = (p: Props) => (
  <Icon strokeWidth={1.9} {...p}>
    <rect x="3" y="4" width="18" height="17" rx="2.5" />
    <path d="M3 9h18M8 2v4M16 2v4" />
  </Icon>
);

export const ShieldIcon = (p: Props) => (
  <Icon strokeWidth={1.9} {...p}>
    <path d="M12 22s8-4.5 8-11V5l-8-3-8 3v6c0 6.5 8 11 8 11Z" />
  </Icon>
);

export const ClockIcon = (p: Props) => (
  <Icon strokeWidth={2} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

export const WarningIcon = (p: Props) => (
  <Icon strokeWidth={2} {...p}>
    <path d="M12 9v4M12 17h.01" />
    <circle cx="12" cy="12" r="9" />
  </Icon>
);

export const EyeIcon = (p: Props) => (
  <Icon strokeWidth={1.8} {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const EyeOffIcon = (p: Props) => (
  <Icon strokeWidth={1.8} {...p}>
    <path d="M10.6 6.2A9.9 9.9 0 0 1 12 6c6.5 0 10 6 10 6a17.3 17.3 0 0 1-3.3 3.9M6.3 7.9A17.3 17.3 0 0 0 2 12s3.5 6 10 6c1.5 0 2.8-.3 4-.8" />
    <path d="m3 3 18 18" />
  </Icon>
);

export const LogOutIcon = (p: Props) => (
  <Icon strokeWidth={1.8} {...p}>
    <path d="M15 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v2" />
    <path d="M19 12H9m10 0-3.5-3.5M19 12l-3.5 3.5" />
  </Icon>
);

export const ArrowLeftIcon = (p: Props) => (
  <Icon strokeWidth={1.9} {...p}>
    <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
  </Icon>
);

export const ShareIcon = (p: Props) => (
  <Icon strokeWidth={1.8} {...p}>
    <path d="M12 3v13M8 7l4-4 4 4" />
    <path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
  </Icon>
);

export const MailIcon = (p: Props) => (
  <Icon strokeWidth={1.8} {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="m3 7 9 6 9-6" />
  </Icon>
);

export const PlusIcon = (p: Props) => (
  <Icon strokeWidth={2} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const TrashIcon = (p: Props) => (
  <Icon strokeWidth={1.8} {...p}>
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
  </Icon>
);

export const StarOutlineIcon = (p: Props) => (
  <Icon strokeWidth={1.8} {...p}>
    <path d="M12 3.5 14.7 9l6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.9 9.3 9Z" />
  </Icon>
);

export const TableIcon = (p: Props) => (
  <Icon strokeWidth={1.8} {...p}>
    <path d="M3 6h18M3 12h18M3 18h18M8 3v18" />
  </Icon>
);

export const ProfileIcon = (p: Props) => <Icon {...p}><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2"/></Icon>;
