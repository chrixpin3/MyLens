import { NextResponse } from "next/server";
import { connectToDB, errorResponse, isDbConfigured, ok } from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import { fieldErrors, inquirySchema } from "@/lib/validation";
import { getSiteConfig } from "@/lib/data";
import { clientIpFromRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/contact — public contact form endpoint.
 *
 * The document is always stored in MongoDB. If RESEND_API_KEY is configured the
 * notification is also emailed to the studio address; delivery failures are
 * recorded on the doc but never fail the visitor's request.
 */

/** Sliding-window throttle so the form cannot be used to spam the inbox. */
const recentSubmissions = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 4;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (recentSubmissions.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    recentSubmissions.set(ip, recent);
    return true;
  }
  recent.push(now);
  recentSubmissions.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  try {
    if (!isDbConfigured()) {
      return errorResponse(
        "The site is not connected to a database yet. Please try again later.",
        503,
      );
    }

    const ip = clientIpFromRequest(request.headers);
    if (isRateLimited(ip)) {
      return errorResponse("Too many messages sent. Please wait a minute and try again.", 429);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Malformed request body", 400);
    }

    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Please check the highlighted fields", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    // Honeypot tripped: accept silently so bots learn nothing.
    if (parsed.data.company) {
      return ok({ queued: true });
    }

    await connectToDB();

    const inquiry = await Inquiry.create({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone ?? "",
      service: parsed.data.service ?? "",
      message: parsed.data.message,
      read: false,
      userAgent: (request.headers.get("user-agent") ?? "").slice(0, 300),
    });

    // The window was already extended by isRateLimited; nothing to do here.

    // Best-effort email notification.
    const config = await getSiteConfig();
    let notified = false;
    if (process.env.RESEND_API_KEY && config.contact.email) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const result = await resend.emails.send({
          from: process.env.RESEND_FROM || "Portfolio <onboarding@resend.dev>",
          to: config.contact.email,
          replyTo: parsed.data.email,
          subject: `New enquiry — ${parsed.data.name}${parsed.data.service ? ` (${parsed.data.service})` : ""}`,
          text: [
            `Name: ${parsed.data.name}`,
            `Email: ${parsed.data.email}`,
            `Phone: ${parsed.data.phone || "—"}`,
            `Service: ${parsed.data.service || "—"}`,
            "",
            parsed.data.message,
          ].join("\n"),
        });
        notified = !result.error;
        if (result.error) console.error("[api/contact] resend error:", result.error);
      } catch (err) {
        console.error("[api/contact] notification failed:", err);
      }
    }

    if (notified) {
      await Inquiry.updateOne({ _id: inquiry._id }, { $set: { notified: true } }).exec();
    }

    return ok({ id: String(inquiry._id), notified }, 201);
  } catch (err) {
    console.error("[api/contact] POST failed:", err);
    return errorResponse("Could not save your message. Please try again.");
  }
}
