"use client";

import { SessionProvider } from "next-auth/react";

/**
 * `next-auth/react` has no "use client" directive of its own, so it can only be
 * imported from a client module. This wrapper lets server layouts and pages
 * mount the session context without turning them into client components.
 */
export function ClientSessionProvider({
  children,
  refetchOnWindowFocus = false,
}: {
  children: React.ReactNode;
  refetchOnWindowFocus?: boolean;
}) {
  return (
    <SessionProvider refetchOnWindowFocus={refetchOnWindowFocus}>{children}</SessionProvider>
  );
}
