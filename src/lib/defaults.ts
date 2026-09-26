import type { SiteConfigData } from "@/types";

/**
 * Placeholder content used when the database has no SiteConfig document yet
 * (fresh clone before `npm run seed`, or DB temporarily unreachable). Keeping
 * this in one place means the public site always renders something coherent and
 * never crashes on a missing document.
 *
 * Every value here is generic and intended to be replaced from /admin.
 */
export const DEFAULT_CONFIG: SiteConfigData = {
  photographerName: "Avery Stone",
  tagline: "Honest frames. Quiet light. Stories that outlast the moment.",
  shortBio:
    "Photographer working across editorial, weddings and portraiture. Available worldwide, based wherever the light is good.",
  bio: [
    "I photograph people the way they actually are — a little wind in the hair, a laugh half-finished, light that does half the work for me.",
    "",
    "Ten years in, the approach has not changed: arrive early, stay late, shoot a lot, show only the frames that still feel like something.",
    "",
    "Available for commissions across the city and well beyond it. Reach out and tell me what you have in mind.",
  ].join("\n"),
  profileImage: null,
  logo: null,
  stats: [
    { label: "Years behind the lens", value: "10" },
    { label: "Events covered", value: "480+" },
    { label: "Based in", value: "Lisbon" },
  ],
  skills: [
    "Editorial",
    "Weddings",
    "Portraits",
    "Architecture",
    "Film",
    "Lighting",
    "Retouching",
    "Art direction",
  ],
  experience: [
    {
      period: "2019 — now",
      role: "Independent Photographer",
      place: "Lisbon",
      description:
        "Editorial, wedding and portrait commissions for studios, brands and private clients.",
    },
    {
      period: "2016 — 2019",
      role: "Senior Photo Editor",
      place: "Atelier Norte",
      description:
        "Led a four-person edit desk across 40+ titles a season, shaping visual identity end to end.",
    },
    {
      period: "2014 — 2016",
      role: "Assistant Photographer",
      place: "Studio Marlow",
      description: "Lighting, grip and location management on commercial sets.",
    },
  ],
  coverageArea: "Lisbon · Porto · Barcelona · Worldwide",
  contact: {
    email: "hello@example.com",
    phone: "+351 900 000 000",
    whatsapp: "",
    address: "Rua do Norte 21, Lisbon, Portugal",
    mapEmbedUrl: "",
    mapUrl: "",
  },
  social: [
    { platform: "instagram", label: "Instagram", url: "https://instagram.com/", visible: true },
    { platform: "facebook", label: "Facebook", url: "https://facebook.com/", visible: true },
    { platform: "whatsapp", label: "WhatsApp", url: "", visible: true },
  ],
  nav: [
    { label: "Home", href: "/", visible: true },
    { label: "Gallery", href: "/gallery", visible: true },
    { label: "Services", href: "/services", visible: true },
    { label: "About", href: "/about", visible: true },
    { label: "Contact", href: "/contact", visible: true },
  ],
  sections: {
    stats: true,
    aboutZigzag: true,
    services: true,
    featured: true,
    ctaBand: true,
    experience: true,
    skills: true,
  },
  hero: {
    mediaType: "image",
    image: null,
    videoUrl: "",
    poster: null,
    autoplayVideo: true,
    overlay: 65,
    align: "left",
  },
  cta: {
    headline: "Let's make something worth keeping",
    subhead:
      "Tell me the date, the place, and what you want to feel when you look at the photos.",
    primaryText: "Book a session",
    primaryHref: "/contact",
    secondaryText: "See the work",
    secondaryHref: "/gallery",
  },
  featuredCount: 6,
};
