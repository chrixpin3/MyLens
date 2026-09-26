import { withAuth } from "next-auth/middleware";

/**
 * Edge guard for the dashboard.
 *
 * Two layers protect /admin:
 *  1. This middleware — cheap, edge-level, redirects unauthenticated visitors
 *     before any server component or database call happens.
 *  2. `requireAdminPage()` in the admin layout, which re-checks the session
 *     server-side (defence in depth, and the only thing that survives a
 *     misconfigured matcher).
 *
 * API routes are additionally guarded per-route by `requireAdmin()`.
 */
export default withAuth({
  pages: { signIn: "/admin/login", error: "/admin/login" },
  callbacks: {
    authorized: ({ token }) => Boolean(token && token.role === "admin"),
  },
});

export const config = {
  matcher: [
    /*
     * Everything under /admin except the login screen and the NextAuth
     * endpoints it depends on. `/admin` itself is listed separately because
     * the pattern below requires the trailing segment.
     */
    "/admin",
    "/admin/((?!login|api).*)",
  ],
};
