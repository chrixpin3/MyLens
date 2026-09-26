import NextAuth from "next-auth";
import { authOptions, setRequestIp } from "@/lib/auth";
import { clientIpFromRequest } from "@/lib/rate-limit";

const authHandler = NextAuth(authOptions);

type AuthRouteContext = { params: { nextauth: string[] } };

/**
 * NextAuth route handler.
 *
 * The credentials provider has no access to the raw request, so we capture the
 * client IP from proxy headers here and hand it to `setRequestIp()` before
 * delegating — that is what keys the per-IP brute-force lockout.
 *
 * The route context MUST be forwarded untouched: next-auth decides between its
 * App Router and Pages Router handlers by checking `context.params`. Handing it
 * `{}` sends Web `Request` objects into the Pages Router path, which then dies
 * on `req.query` being undefined.
 */
const handler = (req: Request, ctx: AuthRouteContext) => {
  setRequestIp(clientIpFromRequest(req.headers));
  return authHandler(req as never, ctx as never);
};

export { handler as GET, handler as POST };
