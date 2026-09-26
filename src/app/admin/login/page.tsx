import type { Metadata } from "next";
import { Suspense } from "react";
import { ClientSessionProvider } from "@/components/admin/ClientSessionProvider";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="grain relative flex min-h-dvh items-center justify-center overflow-hidden bg-ink px-5 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 opacity-[0.16] blur-3xl"
        style={{ background: "radial-gradient(ellipse at 50% 0%, #ffffff 0%, transparent 65%)" }}
      />
      {/* Zigzag hairline motif, echoing the site's editorial rhythm. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.05]">
        <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1200 800">
          <path
            d="M-50 700 L350 500 L750 660 L1250 420"
            stroke="#ffffff"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M-50 780 L350 580 L750 740 L1250 500"
            stroke="#ffffff"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      <ClientSessionProvider refetchOnWindowFocus={false}>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </ClientSessionProvider>
    </main>
  );
}
