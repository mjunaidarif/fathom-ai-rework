import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

export const IconHome = (p: P) => (
  <svg {...base(p)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
);
export const IconSearch = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
);
export const IconSparkle = (p: P) => (
  <svg {...base(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="M12 8.5 13.2 11 15.5 12l-2.3 1-1.2 2.5-1.2-2.5L8.5 12l2.3-1z" /></svg>
);
export const IconPlaylist = (p: P) => (
  <svg {...base(p)}><path d="M4 6h11M4 12h11M4 18h7" /><path d="m17 13 4 2.5-4 2.5z" fill="currentColor" stroke="none" /></svg>
);
export const IconCalendar = (p: P) => (
  <svg {...base(p)}><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>
);
export const IconPlay = (p: P) => (
  <svg {...base(p)}><path d="M7 5.5 18.5 12 7 18.5z" fill="currentColor" stroke="none" /></svg>
);
export const IconPause = (p: P) => (
  <svg {...base(p)}><rect x="6.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none" /></svg>
);
export const IconCheck = (p: P) => (
  <svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 6.5" /></svg>
);
export const IconShare = (p: P) => (
  <svg {...base(p)}><circle cx="6" cy="12" r="2.5" /><circle cx="17" cy="6" r="2.5" /><circle cx="17" cy="18" r="2.5" /><path d="m8.3 10.8 6.4-3.6M8.3 13.2l6.4 3.6" /></svg>
);
export const IconStar = (p: P) => (
  <svg {...base(p)}><path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.9 7.2 19l.9-5.4L4.2 9.7l5.4-.8z" /></svg>
);
export const IconClip = (p: P) => (
  <svg {...base(p)}><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="M8 7.5 20 16M8 16.5 20 8" /></svg>
);
export const IconClock = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);
export const IconUsers = (p: P) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><path d="M16 5.5a3 3 0 0 1 0 5.8M17 19a5.5 5.5 0 0 0-2.2-4.4" /></svg>
);
export const IconChevron = (p: P) => (
  <svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>
);
export const IconClose = (p: P) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconCopy = (p: P) => (
  <svg {...base(p)}><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H15" /></svg>
);
export const IconSend = (p: P) => (
  <svg {...base(p)}><path d="M4 12 20 4l-6 16-2.5-6.5z" /><path d="M11.5 13.5 20 4" /></svg>
);
export const IconLightning = (p: P) => (
  <svg {...base(p)}><path d="M13 3 5 13h6l-1 8 8-11h-6z" fill="currentColor" stroke="none" /></svg>
);
export const IconVolume = (p: P) => (
  <svg {...base(p)}><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" stroke="none" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></svg>
);
export const IconMute = (p: P) => (
  <svg {...base(p)}><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" stroke="none" /><path d="m16 9 5 6M21 9l-5 6" /></svg>
);
export const IconTrash = (p: P) => (
  <svg {...base(p)}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" /></svg>
);
export const IconDots = (p: P) => (
  <svg {...base(p)}><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" /></svg>
);
export const IconLogo = (p: P) => (
  <svg width={26} height={26} viewBox="0 0 32 32" fill="none" {...p}>
    <rect width="32" height="32" rx="9" fill="var(--accent)" />
    <path d="M9 20.5c3-9 11-9 14 0" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="16" cy="12" r="2.2" fill="#fff" />
  </svg>
);
