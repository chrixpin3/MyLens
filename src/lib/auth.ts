import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { connectToDB, isDbConfigured } from "@/lib/db";
import User from "@/models/User";
import { checkLoginLockout, registerFailedAttempt, clearAttempts } from "@/lib/rate-limit";

/** A deliberately invalid bcrypt hash, used to burn time on unknown usernames. */
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

/**
 * The credentials provider cannot read the raw request, so the sign-in route
 * calls `setRequestIp()` before `signIn()` to key the throttle per client IP.
 */
let currentRequestIp = "unknown";
export function setRequestIp(ip: string) {
  currentRequestIp = ip || "unknown";
}
function requestIp() {
  return currentRequestIp;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  jwt: { maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Admin credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!username || !password) return null;

        if (!isDbConfigured()) {
          console.error("[auth] MONGODB_URI missing — cannot verify credentials.");
          return null;
        }

        const key = `${requestIp()}:${username}`;

        // Throttle first, so unknown usernames are rate limited too.
        let lock: Awaited<ReturnType<typeof checkLoginLockout>>;
        try {
          lock = await checkLoginLockout(key);
        } catch (err) {
          console.error("[auth] Lockout lookup failed:", err);
          return null;
        }
        if (lock.locked) return null;

        let user: Awaited<ReturnType<typeof User.findOne>>;
        try {
          await connectToDB();
          user = await User.findOne({ username }).exec();
        } catch (err) {
          // A database outage must read as a failed sign-in, never a 500 page.
          console.error("[auth] Credential lookup failed:", err);
          return null;
        }

        if (!user) {
          // Burn comparable time on unknown users to blunt user enumeration.
          await compare(password, DUMMY_HASH);
          await registerFailedAttempt(key).catch(() => undefined);
          return null;
        }

        if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) return null;

        const valid = await compare(password, user.passwordHash);

        if (!valid) {
          await registerFailedAttempt(key).catch(() => undefined);
          await User.updateOne(
            { _id: user._id },
            {
              $inc: { failedAttempts: 1 },
              $set: {
                lockedUntil: lock.nextLockUntil ?? null,
              },
            },
          )
            .exec()
            .catch((err) => console.error("[auth] Failed to record attempt:", err));
          return null;
        }

        // Bookkeeping is best-effort: a write hiccup must not block a valid login.
        await clearAttempts(key).catch(() => undefined);
        await User.updateOne(
          { _id: user._id },
          {
            $set: { lastLoginAt: new Date(), failedAttempts: 0 },
            $unset: { lockedUntil: 1 },
          },
        )
          .exec()
          .catch((err) => console.error("[auth] Failed to update last login:", err));

        return {
          id: String(user._id),
          name: user.username,
          email: user.email || undefined,
          role: "admin",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "admin";
        token.uid = String(user.id);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as { role?: string; id?: string };
        u.role = String(token.role ?? "admin");
        u.id = String(token.uid ?? token.sub ?? "");
      }
      return session;
    },
  },
};

/* ------------------------------------------------------------------ */
/* Route guards                                                        */
/* ------------------------------------------------------------------ */

/** Server-side guard for every mutating API route. Returns a Response or null. */
export async function requireAdmin(): Promise<Response | null> {
  const { getServerSession } = await import("next-auth");
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ ok: false, error: "Unauthenticated" }, { status: 401 });
  }
  if (String((session.user as { role?: string }).role) !== "admin") {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  return null;
}

/** Server-side guard for admin pages. Redirects to the login screen. */
export async function requireAdminPage(): Promise<{ user: { id: string; name?: string | null } }> {
  const { getServerSession } = await import("next-auth");
  const { redirect } = await import("next/navigation");
  const session = await getServerSession(authOptions);
  if (!session?.user || String(session.user.role) !== "admin") {
    redirect("/admin/login");
  }
  return session as { user: { id: string; name?: string | null } };
}
