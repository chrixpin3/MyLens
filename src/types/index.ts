/**
 * Shared domain types. These describe the *plain* (lean) shapes that leave
 * MongoDB so that server components, API routes and client components all
 * agree on one contract.
 */

export type MediaRef = {
  url: string;
  publicId?: string;
  alt?: string;
  width?: number;
  height?: number;
  blurDataUrl?: string;
};

export type StatEntry = {
  label: string;
  value: string;
};

export type SocialLink = {
  platform: string;
  url: string;
  visible: boolean;
  label?: string;
};

export type NavItem = {
  label: string;
  href: string;
  visible: boolean;
};

export type TimelineEntry = {
  period: string;
  role: string;
  place?: string;
  description?: string;
};

export type ContactInfo = {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  mapEmbedUrl?: string;
  mapUrl?: string;
};

export type SectionVisibility = {
  stats: boolean;
  aboutZigzag: boolean;
  services: boolean;
  featured: boolean;
  ctaBand: boolean;
  experience: boolean;
  skills: boolean;
};

export type HeroSettings = {
  mediaType: "image" | "video";
  image: MediaRef | null;
  videoUrl: string;
  poster: MediaRef | null;
  autoplayVideo: boolean;
  overlay: number;
  align: "left" | "center";
};

export type CtaSettings = {
  headline: string;
  subhead: string;
  primaryText: string;
  primaryHref: string;
  secondaryText: string;
  secondaryHref: string;
};

export type SiteConfigData = {
  photographerName: string;
  tagline: string;
  bio: string;
  shortBio: string;
  profileImage: MediaRef | null;
  logo: MediaRef | null;
  stats: StatEntry[];
  skills: string[];
  experience: TimelineEntry[];
  coverageArea: string;
  contact: ContactInfo;
  social: SocialLink[];
  nav: NavItem[];
  sections: SectionVisibility;
  hero: HeroSettings;
  cta: CtaSettings;
  featuredCount: number;
  updatedAt?: string;
};

export type ServiceData = {
  _id: string;
  title: string;
  description: string;
  image: MediaRef | null;
  ctaText: string;
  ctaLink: string;
  order: number;
  icon: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type GalleryImageData = {
  _id: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  title: string;
  alt: string;
  description: string;
  category: string;
  order: number;
  pinned: boolean;
  blurDataUrl?: string;
  width?: number;
  height?: number;
  uploadedAt: string;
  updatedAt?: string;
};

export type InquiryData = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  read: boolean;
  notified?: boolean;
  createdAt: string;
  updatedAt?: string;
};

export const SOCIAL_PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "x", label: "X" },
  { id: "vimeo", label: "Vimeo" },
  { id: "pinterest", label: "Pinterest" },
  { id: "behance", label: "Behance" },
  { id: "link", label: "Link" },
] as const;

export type SocialPlatformId = (typeof SOCIAL_PLATFORMS)[number]["id"];
