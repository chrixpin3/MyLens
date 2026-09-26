"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ApertureIcon,
  CameraIcon,
  CloseIcon,
  EyeIcon,
  InboxIcon,
  LogoutIcon,
  MenuIcon,
  SettingsIcon,
  SparkIcon,
  UsersIcon,
  GridIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export const ADMIN_NAV = [
  { href: "/admin/settings", label: "Site settings", icon: SettingsIcon },
  { href: "/admin/contact", label: "Contact info", icon: UsersIcon },
  { href: "/admin/social", label: "Social & menu", icon: SparkIcon },
  { href: "/admin/services", label: "Services", icon: GridIcon },
  { href: "/admin/gallery", label: "Gallery", icon: CameraIcon },
  { href: "/admin/appearance", label: "Appearance", icon: SparkIcon },
  { href: "/admin/inquiries", label: "Inquiries", icon: InboxIcon, badge: true },
  { href: "/admin/account", label: "Account", icon: SettingsIcon },
] as const;

export function AdminSidebar({
  siteName,
  unreadCount,
}: {
  siteName: string;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = ADMIN_NAV.map((item) => ({
    ...item,
    badgeValue: "badge" in item ? unreadCount : 0,
  }));

  const nav = (
    <nav aria-label="Dashboard" className="flex flex-col gap-1">
      {links.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-glass-sm px-3.5 py-3 text-sm transition-all duration-300",
              active
                ? "bg-white/10 text-white"
                : "text-white/55 hover:bg-white/6 hover:text-white",
            )}
          >
            {active && (
              <motion.span
                layoutId="admin-nav-active"
                className="absolute inset-0 -z-10 rounded-glass-sm border border-white/12"
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
              />
            )}
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badgeValue > 0 && (
              <span className="rounded-full border border-white/25 bg-white/10 px-2 py-0.5 font-mono text-[0.6rem] text-white">
                {item.badgeValue}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ---------- desktop rail ---------- */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col gap-8 border-r border-white/8 bg-black/40 px-5 py-7 backdrop-blur-xl lg:flex">
        <Link href="/admin/settings" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80">
            <ApertureIcon className="h-4 w-4" />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-sm uppercase tracking-[0.16em] text-white">
              {siteName || "Studio"}
            </span>
            <span className="font-mono text-[0.58rem] uppercase tracking-widest2 text-white/30">
              Dashboard
            </span>
          </span>
        </Link>

        {nav}

        <div className="mt-auto flex flex-col gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-glass-sm px-3.5 py-2.5 text-sm text-white/50 transition-colors hover:bg-white/6 hover:text-white"
          >
            <EyeIcon className="h-4 w-4" />
            View live site
          </Link>
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 rounded-glass-sm px-3.5 py-2.5 text-sm text-white/50 transition-colors hover:bg-white/6 hover:text-white"
          >
            <LogoutIcon className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ---------- mobile bar ---------- */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 border-b border-white/8 bg-black/70 px-5 py-3.5 backdrop-blur-xl lg:hidden">
        <Link href="/admin/settings" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15">
            <ApertureIcon className="h-3.5 w-3.5" />
          </span>
          <span className="font-display text-xs uppercase tracking-[0.16em] text-white">Dashboard</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open dashboard menu"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 cursor-default bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-[60] flex w-[min(86vw,20rem)] flex-col gap-7 border-r border-white/10 bg-ink-950/95 px-5 py-6 backdrop-blur-2xl lg:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow text-white/35">Menu</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-white/70"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
              {nav}
              <div className="mt-auto flex flex-col gap-2">
                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-glass-sm px-3.5 py-2.5 text-sm text-white/50 hover:text-white"
                >
                  <EyeIcon className="h-4 w-4" /> View live site
                </Link>
                <button
                  type="button"
                  onClick={() => void signOut({ callbackUrl: "/admin/login" })}
                  className="flex items-center gap-3 rounded-glass-sm px-3.5 py-2.5 text-sm text-white/50 hover:text-white"
                >
                  <LogoutIcon className="h-4 w-4" /> Sign out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
