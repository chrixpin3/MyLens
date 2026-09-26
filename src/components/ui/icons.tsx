import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: "false" as const,
  ...props,
});

export function ApertureIcon(props: P) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v5M21 12h-5M12 21v-5M3 12h5" />
      <path d="M12 12l6.4-3.7M12 12l3.7 6.4M12 12L8.3 18.4M12 12l-3.7-6.4" />
    </svg>
  );
}

export function InstagramIcon(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M14.5 8.5H17V5h-2.5A4.5 4.5 0 0 0 10 9.5V11H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V9.5A1 1 0 0 1 14.5 8.5Z" />
    </svg>
  );
}

export function WhatsAppIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.6-4.4a8.4 8.4 0 1 1 15.4-4.5Z" />
      <path d="M9 9.2c.3-.6.6-.6.9-.6h.5c.2 0 .4 0 .6.5l.7 1.6c.1.2 0 .4-.1.6l-.4.5c-.1.2-.2.3-.1.5.4.7 1.1 1.3 1.8 1.6.2.1.4 0 .5-.1l.5-.6c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.4 0 .5-.3 1.2-.8 1.4-.4.2-1 .3-1.5.1a7.6 7.6 0 0 1-4.4-3.9c-.3-.6-.3-1.3 0-1.9.1-.2.1-.3.1-.4" />
    </svg>
  );
}

export function TikTokIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M14 4v9.5a3.2 3.2 0 1 1-2.7-3.15" />
      <path d="M14 4c.4 2.2 2 3.8 4.2 4.1" />
    </svg>
  );
}

export function YouTubeIcon(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.5l4.5 2.5-4.5 2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function XIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  );
}

export function VimeoIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M3 8.5c1.6-.6 3-1 3.9-1 .9 0 1.4.7 1.5 2 .2 1.4.4 2.3.7 2.3.3 0 .8-1 1.6-2.4.6-1 1-1.5 1.5-1.4.6.1.7 1 .6 2.3-.1 1.6-.6 3-1 3.9-.4.9-.4 1.4 0 1.8.5.4 1.5.1 2.3-.5 1.2-.9 2.3-2.2 3.1-3.6.8-1.4 1-2.4.7-3-.2-.6-1-.9-1.8-.7-1 .2-2 .7-2.8 1.2-.4.3-.7.4-.9.3-.2-.2-.4-1-.6-2.2-.3-1.6-1-2.4-2.3-2.4-.9 0-2.2.3-4 .9z" />
    </svg>
  );
}

export function PinterestIcon(props: P) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 20l1.8-6.8m-.3-2.2c-.2-1.6.8-3 2.4-3 1.5 0 2.4 1 2.4 2.5 0 2-1.2 3.5-2.8 3.5-.8 0-1.4-.6-1.2-1.4" />
    </svg>
  );
}

export function BehanceIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M3 7h5.2a2.3 2.3 0 0 1 0 4.6H3zm0 4.6h5.6a2.4 2.4 0 0 1 0 4.8H3z" />
      <path d="M14.5 14.2h5.9a3 3 0 0 0-5.9-.8 3 3 0 0 0 .1.8" />
      <path d="M15 8.6h4.6" />
    </svg>
  );
}

export function LinkIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1.2 1.2" />
      <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 1 0 5.7 5.7l1.2-1.2" />
    </svg>
  );
}

export function CameraIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M3 8.5h3l1.5-2.5h9L18 8.5h3v11H3z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </svg>
  );
}

export function MailIcon(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

export function PhoneIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M7 3.5h3l1.5 4-2 1.5a10 10 0 0 0 5.5 5.5L16.5 12l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 6.7 2 2 0 0 1 6 4.5" />
    </svg>
  );
}

export function MapPinIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function ClockIcon(props: P) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.5l3.5 2" />
    </svg>
  );
}

export function SparkIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  );
}

export function UsersIcon(props: P) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19.5c0-3 2.7-4.8 6-4.8s6 1.8 6 4.8" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 14.9c2 .6 3.5 2 3.5 4.6" />
    </svg>
  );
}

export function HeartIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M12 20s-7.5-4.6-7.5-9.5A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z" />
    </svg>
  );
}

export function RingIcon(props: P) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" />
    </svg>
  );
}

export function FilmIcon(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M7.5 4.5v15M16.5 4.5v15M3 12h18M3 8.2h4.5M3 15.8h4.5M16.5 8.2H21M16.5 15.8H21" />
    </svg>
  );
}

export function ArrowRightIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowLeftIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M20 12H4M10 6l-6 6 6 6" />
    </svg>
  );
}

export function CloseIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function MenuIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
    </svg>
  );
}

export function ChevronDownIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="m5 9 7 7 7-7" />
    </svg>
  );
}

export function CheckIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

export function AlertIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 22 20H2z" />
      <path d="M12 10v4.5M12 17.2v.1" />
    </svg>
  );
}

export function UploadIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M12 16V4M8 8l4-4 4 4" />
      <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
    </svg>
  );
}

export function TrashIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M4 6.5h16M9.5 6.5V4h5v2.5M6 6.5l1 13.5h10l1-13.5" />
      <path d="M10 10v6.5M14 10v6.5" />
    </svg>
  );
}

export function EditIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M4 20h4L20 8l-4-4L4 16z" />
      <path d="m14.5 5.5 4 4" />
    </svg>
  );
}

export function PlusIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M12 4v16M4 12h16" />
    </svg>
  );
}

export function GripIcon(props: P) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function StarIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="m12 3.8 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9L3.5 10l5.9-.8z" />
    </svg>
  );
}

export function LockoutIcon(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 7.6-1.8" />
      <circle cx="12" cy="15.5" r="1.4" />
      <path d="M12 16.9V18.4" />
    </svg>
  );
}

export function SettingsIcon(props: P) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.8 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1.1Z" />
    </svg>
  );
}

export function InboxIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M3 13.5 5.5 5h13L21 13.5V19a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19z" />
      <path d="M3 13.5h5l1 2.5h6l1-2.5h5" />
    </svg>
  );
}

export function GridIcon(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function LogoutIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14" />
      <path d="M17 8.5 20.5 12 17 15.5M20 12h-9" />
    </svg>
  );
}

export function EyeIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

export function EyeOffIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M9.9 5.2A9.6 9.6 0 0 1 12 5c6 0 9.5 6 9.5 6a17 17 0 0 1-3.2 3.9M6.3 7.5A16.6 16.6 0 0 0 2.5 11s3.5 6 9.5 6a9.4 9.4 0 0 0 3.6-.7" />
      <path d="M10 10a2.8 2.8 0 0 0 4 4M3 3l18 18" />
    </svg>
  );
}

export const SERVICE_ICONS = {
  aperture: ApertureIcon,
  camera: CameraIcon,
  ring: RingIcon,
  heart: HeartIcon,
  users: UsersIcon,
  film: FilmIcon,
  spark: SparkIcon,
  clock: ClockIcon,
} as const;

export type ServiceIconKey = keyof typeof SERVICE_ICONS;

export const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  whatsapp: WhatsAppIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
  x: XIcon,
  vimeo: VimeoIcon,
  pinterest: PinterestIcon,
  behance: BehanceIcon,
  link: LinkIcon,
} as const;

export type SocialIconKey = keyof typeof SOCIAL_ICONS;

export function getServiceIcon(key?: string | null) {
  if (!key) return ApertureIcon;
  return SERVICE_ICONS[key as ServiceIconKey] ?? ApertureIcon;
}

export function getSocialIcon(key?: string | null) {
  if (!key) return LinkIcon;
  return SOCIAL_ICONS[key as SocialIconKey] ?? LinkIcon;
}
