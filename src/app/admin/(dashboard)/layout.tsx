import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { getSiteConfig } from "@/lib/data";
import { connectToDB, isDbConfigured } from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/components/admin/Toast";
import { ClientSessionProvider } from "@/components/admin/ClientSessionProvider";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Dashboard" },
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * Per-route server-side guard. The edge middleware already blocks
 * unauthenticated requests; this is the second lock, and the only one that
 * survives a misconfigured matcher.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminPage();
  void session;

  const config = await getSiteConfig();

  let unreadCount = 0;
  if (isDbConfigured()) {
    try {
      await connectToDB();
      unreadCount = await Inquiry.countDocuments({ read: false });
    } catch (err) {
      console.error("[admin] unread count failed:", err);
    }
  }

  return (
    <ClientSessionProvider>
      <ToastProvider>
        <div className="min-h-dvh bg-ink">
          <AdminSidebar siteName={config.photographerName} unreadCount={unreadCount} />
          <div className="lg:pl-64">
            <div className="mx-auto w-full max-w-5xl px-5 pb-24 pt-24 sm:px-8 lg:pt-12">
              {children}
            </div>
          </div>
        </div>
      </ToastProvider>
    </ClientSessionProvider>
  );
}

export function redirectToSettings() {
  redirect("/admin/settings");
}
