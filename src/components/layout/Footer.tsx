import Link from "next/link";
import type { ServiceLean } from "@/models/Service";
import { mailtoLink, telLink, whatsappLink } from "@/lib/data";
import { getSocialIcon, MailIcon, MapPinIcon, PhoneIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import type { SocialLink } from "@/types";

export interface FooterProps {
  siteName: string;
  tagline: string;
  logoUrl?: string | null;
  logoAlt?: string;
  nav: { label: string; href: string; visible: boolean }[];
  socials: SocialLink[];
  services: Pick<ServiceLean, "_id" | "title" | "ctaLink">[];
  coverageArea: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
}

export function Footer({
  siteName,
  tagline,
  logoUrl,
  logoAlt,
  nav,
  socials,
  services,
  coverageArea,
  email,
  phone,
  whatsapp,
  address,
}: FooterProps) {
  const year = new Date().getFullYear();
  const wa = whatsappLink(whatsapp);

  return (
    <footer className="relative mt-24 border-t border-white/8 bg-ink-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <Reveal className="lg:col-span-4">
            <div className="flex flex-col gap-5">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={logoAlt || siteName}
                  className="h-9 w-auto max-w-[12rem] object-contain opacity-90"
                />
              ) : (
                <span className="font-display text-2xl uppercase tracking-[0.18em] text-white">
                  {siteName}
                </span>
              )}
              <p className="max-w-sm text-pretty text-sm leading-relaxed text-white/45">
                {tagline}
              </p>
              {socials.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {socials.map((social) => {
                    const Icon = getSocialIcon(social.platform);
                    return (
                      <a
                        key={social.platform}
                        href={social.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={social.label || social.platform}
                        className="group flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[0.7rem] uppercase tracking-widest2 text-white/55 transition-all duration-300 hover:border-white/40 hover:text-white"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {social.label || social.platform}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </Reveal>

          {/* Quick links */}
          <Reveal delay={0.06} className="lg:col-span-2">
            <nav aria-label="Footer">
              <h2 className="eyebrow text-white/35">Explore</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {nav
                  .filter((item) => item.visible)
                  .map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="link-underline text-sm text-white/55 transition-colors hover:text-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                <li>
                  <Link
                    href="/admin/login"
                    className="link-underline text-sm text-white/25 transition-colors hover:text-white/60"
                  >
                    Admin
                  </Link>
                </li>
              </ul>
            </nav>
          </Reveal>

          {/* Services */}
          {services.length > 0 && (
            <Reveal delay={0.12} className="lg:col-span-3">
              <h2 className="eyebrow text-white/35">Services</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {services.slice(0, 6).map((service) => (
                  <li key={String(service._id)}>
                    <Link
                      href={service.ctaLink || "/services"}
                      className="link-underline text-sm text-white/55 transition-colors hover:text-white"
                    >
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {/* Contact */}
          <Reveal delay={0.18} className="lg:col-span-3">
            <h2 className="eyebrow text-white/35">Studio</h2>
            <ul className="mt-5 flex flex-col gap-4 text-sm text-white/55">
              {email && (
                <li>
                  <a
                    href={mailtoLink(email)}
                    className="group flex items-start gap-3 transition-colors hover:text-white"
                  >
                    <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/35 transition-colors group-hover:text-white/70" />
                    <span className="break-all">{email}</span>
                  </a>
                </li>
              )}
              {phone && (
                <li>
                  <a
                    href={telLink(phone)}
                    className="group flex items-start gap-3 transition-colors hover:text-white"
                  >
                    <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/35 transition-colors group-hover:text-white/70" />
                    <span>{phone}</span>
                  </a>
                </li>
              )}
              {(address || coverageArea) && (
                <li className="flex items-start gap-3">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
                  <span>
                    {address}
                    {address && coverageArea && <span className="block text-white/35">{coverageArea}</span>}
                    {!address && coverageArea}
                  </span>
                </li>
              )}
              {wa && (
                <li>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-underline text-white/55 transition-colors hover:text-white"
                  >
                    Chat on WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </Reveal>
        </div>

        <div className="rule-fade my-12" />

        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="font-mono text-[0.7rem] uppercase tracking-widest2 text-white/30">
            © {year} {siteName}. All frames reserved.
          </p>
          <p className="font-mono text-[0.7rem] uppercase tracking-widest2 text-white/20">
            Crafted in black &amp; white
          </p>
        </div>
      </div>
    </footer>
  );
}
