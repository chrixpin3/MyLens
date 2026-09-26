import NextAuth from "next-auth";
import { authOptions, setRequestIp } from "@/lib/auth";
import { clientIpFromRequest } from "@/lib/rate-limit";

/**
 * NextAuth route handler.
 *
 * The credentials provider has no access to the raw request, so we capture the
 * client IP from proxy headers here and hand it to `setRequestIp()` before
 * delegating — that is what keys the per-IP brute-force lockout.
 */
const handler = async (req: Request) => {
  setRequestIp(clientIpFromRequest(req.headers));
  return NextAuth(authOptions)(req as never, {} as never);
};

export { handler as GET, handler as POST };
