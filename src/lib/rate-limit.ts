import { connectToDB, isDbConfigured } from "@/lib/db";
import LoginAttempt from "@/models/LoginAttempt";

/**
 * Login throttle. The default NextAuth password is public knowledge, so the
 * login route is the single most attacked endpoint in the app — after N failed
 * attempts the key is locked for a cooling-off window that doubles each time.
 *
 * Counters live in MongoDB (with a TTL index) so they survive serverless cold
 * starts; an in-memory mirror absorbs repeat hits inside one warm instance.
 */

export const MAX_ATTEMPTS = 6;
const BASE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_WINDOW_MS = 12 * 60 * 60 * 1000; // cap the lockout at 12h

type MemoryEntry = { count: number; lockedUntil: number; windowEndsAt: number };
const memory = new Map<string, MemoryEntry>();

const memKey = (key: string) => `la:${key}`;

export type LockoutState = {
  locked: boolean;
  remaining: number;
  retryAfterSeconds: number;
  nextLockUntil: Date | null;
};

export async function checkLoginLockout(key: string): Promise<LockoutState> {
  const now = Date.now();
  const local = memory.get(memKey(key));

  if (local?.lockedUntil && local.lockedUntil > now) {
    return {
      locked: true,
      remaining: 0,
      retryAfterSeconds: Math.ceil((local.lockedUntil - now) / 1000),
      nextLockUntil: new Date(local.lockedUntil),
    };
  }

  if (!isDbConfigured()) {
    return { locked: false, remaining: MAX_ATTEMPTS, retryAfterSeconds: 0, nextLockUntil: null };
  }

  try {
    await connectToDB();
    const doc = await LoginAttempt.findOne({ key }).lean().exec();
    if (!doc) {
      return { locked: false, remaining: MAX_ATTEMPTS, retryAfterSeconds: 0, nextLockUntil: null };
    }
    if (doc.lockedUntil && doc.lockedUntil.getTime() > now) {
      return {
        locked: true,
        remaining: 0,
        retryAfterSeconds: Math.ceil((doc.lockedUntil.getTime() - now) / 1000),
        nextLockUntil: doc.lockedUntil,
      };
    }
    const windowExpired = doc.firstAt.getTime() + BASE_WINDOW_MS < now;
    return {
      locked: false,
      remaining: windowExpired ? MAX_ATTEMPTS : Math.max(0, MAX_ATTEMPTS - doc.count),
      retryAfterSeconds: 0,
      nextLockUntil: null,
    };
  } catch (err) {
    // Never let a throttle read take the login route down.
    console.error("[rate-limit] check failed:", err);
    return { locked: false, remaining: MAX_ATTEMPTS, retryAfterSeconds: 0, nextLockUntil: null };
  }
}

export async function registerFailedAttempt(key: string): Promise<LockoutState> {
  const now = Date.now();
  const localKey = memKey(key);
  const local = memory.get(localKey) ?? { count: 0, lockedUntil: 0, windowEndsAt: now + BASE_WINDOW_MS };

  local.count += 1;
  let lockUntil = 0;
  if (local.count >= MAX_ATTEMPTS) {
    // Exponential backoff, capped.
    const over = local.count - MAX_ATTEMPTS;
    lockUntil = now + Math.min(BASE_WINDOW_MS * 2 ** Math.min(over, 4), MAX_WINDOW_MS);
    local.lockedUntil = lockUntil;
  }
  memory.set(localKey, local);

  if (isDbConfigured()) {
    try {
      await connectToDB();
      const existing = await LoginAttempt.findOne({ key }).exec();
      if (!existing) {
        await LoginAttempt.create({
          key,
          count: 1,
          firstAt: new Date(now),
          lockedUntil: null,
          expiresAt: new Date(now + MAX_WINDOW_MS),
        });
      } else {
        const windowExpired = existing.firstAt.getTime() + BASE_WINDOW_MS < now;
        const count = windowExpired ? 1 : existing.count + 1;
        const nextLock = count >= MAX_ATTEMPTS
          ? new Date(now + Math.min(BASE_WINDOW_MS * 2 ** Math.min(count - MAX_ATTEMPTS, 4), MAX_WINDOW_MS))
          : null;
        await LoginAttempt.updateOne(
          { _id: existing._id },
          {
            $set: {
              count,
              firstAt: windowExpired ? new Date(now) : existing.firstAt,
              lockedUntil: nextLock,
              expiresAt: new Date(now + MAX_WINDOW_MS),
            },
          },
        ).exec();
      }
    } catch (err) {
      console.error("[rate-limit] persist failed:", err);
    }
  }

  return {
    locked: lockUntil > 0,
    remaining: Math.max(0, MAX_ATTEMPTS - local.count),
    retryAfterSeconds: lockUntil ? Math.ceil((lockUntil - now) / 1000) : 0,
    nextLockUntil: lockUntil ? new Date(lockUntil) : null,
  };
}

export async function clearAttempts(key: string) {
  memory.delete(memKey(key));
  if (!isDbConfigured()) return;
  try {
    await connectToDB();
    await LoginAttempt.deleteOne({ key }).exec();
  } catch (err) {
    console.error("[rate-limit] clear failed:", err);
  }
}

/** Best-effort client IP from proxy headers. */
export function clientIpFromRequest(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? headers.get("x-vercel-forwarded-for") ?? "unknown";
}
