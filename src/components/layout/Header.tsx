"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { CloseIcon, MenuIcon, getSocialIcon } from "@/components/ui/icons";
import type { SocialLink } from "@/types";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  siteName: string;
  logoUrl?: string | null;
  logoAlt?: string;
  nav: { label: string; href: string; visible: boolean }[];
  socials: SocialLink[];
  ctaLabel: string;
  ctaHref: string;
}

export function Header({ siteName, logoUrl, logoAlt, nav, socials, ctaLabel, ctaHref }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile panel on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Lock body scroll + trap focus while the mobile panel is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>("a, button")?.focus(), 60);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-black"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-editorial",
          scrolled || open
            ? "border-b border-white/8 bg-black/55 py-3 backdrop-blur-xl"
            : "border-b border-transparent py-5",
        )}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          {/* Wordmark */}
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label={`${siteName} — home`}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={logoAlt || siteName}
                className="h-8 w-auto max-w-[10rem] object-contain opacity-90 transition-opacity group-hover:opacity-100"
              />
            ) : (
              <span className="font-display text-lg tracking-[0.2em] uppercase text-white sm:text-xl">
                {siteName}
              </span>
            )}
            {!logoUrl && (
              <span
                aria-hidden
                className="hidden h-4 w-px bg-white/20 sm:block"
              />
            )}
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {nav
              .filter((item) => item.visible)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-[0.8rem] uppercase tracking-widest2 transition-colors duration-300",
                    isActive(item.href) ? "text-white" : "text-white/50 hover:text-white",
                  )}
                >
                  {isActive(item.href) && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full border border-white/12 bg-white/8"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {item.label}
                </Link>
              ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 md:flex">
              {socials.slice(0, 3).map((social) => {
                const Icon = getSocialIcon(social.platform);
                return (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label || social.platform}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/55 transition-all duration-300 hover:border-white/35 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>

            <Button href={ctaHref} size="sm" className="hidden sm:inline-flex">
              {ctaLabel}
            </Button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-white transition-colors hover:border-white/35 lg:hidden"
            >
              {open ? <MenuIcon className="hidden" /> : null}
              {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile glass panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 top-24 z-40 lg:hidden"
          >
            <div className="glass glass-lg overflow-hidden rounded-glass-lg p-2">
              <nav aria-label="Mobile" className="flex flex-col">
                {nav
                  .filter((item) => item.visible)
                  .map((item, i) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
                    >
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-glass-sm px-4 py-3.5 text-fluid-base transition-colors",
                          isActive(item.href)
                            ? "bg-white/10 text-white"
                            : "text-white/65 hover:bg-white/6 hover:text-white",
                        )}
                      >
                        <span className="font-display">{item.label}</span>
                        <span className="font-mono text-[0.6rem] uppercase tracking-widest2 text-white/30">
                          0{i + 1}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
              </nav>

              <div className="mt-2 flex flex-col gap-3 border-t border-white/8 p-3">
                <Button href={ctaHref} size="md" className="w-full">
                  {ctaLabel}
                </Button>
                {socials.length > 0 && (
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {socials.map((social) => {
                      const Icon = getSocialIcon(social.platform);
                      return (
                        <a
                          key={social.platform}
                          href={social.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={social.label || social.platform}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white/60 transition-all hover:border-white/40 hover:text-white"
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 cursor-default bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
