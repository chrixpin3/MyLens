import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import { connectToDB, errorResponse, isDbConfigured, ok } from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import { fieldErrors, inquiryPatchSchema } from "@/lib/validation";
import { isMongoId } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Admin: the studio inbox, newest first, unread first. */
export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured()) return ok({ inquiries: [], unread: 0 });

  try {
    await connectToDB();
    const url = new URL(request.url);
    const filter = url.searchParams.get("filter");

    const query =
      filter === "unread" ? { read: false } : filter === "read" ? { read: true } : {};

    const [inquiries, unread] = await Promise.all([
      Inquiry.find(query).sort({ read: 1, createdAt: -1 }).limit(500).lean().exec(),
      Inquiry.countDocuments({ read: false }),
    ]);

    return ok({ inquiries, unread });
  } catch (err) {
    console.error("[api/admin/inquiries] GET failed:", err);
    return errorResponse("Could not load inquiries");
  }
}

/** Admin: mark read / unread. */
export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured()) return errorResponse("Database not configured", 503);

  try {
    const body = await request.json().catch(() => null);
    const parsed = inquiryPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    await connectToDB();
    const { id, read } = parsed.data;
    const updated = await Inquiry.findByIdAndUpdate(id, { $set: { read } }, { new: true })
      .lean()
      .exec();
    if (!updated) return errorResponse("Inquiry not found", 404);

    const unread = await Inquiry.countDocuments({ read: false });
    return ok({ inquiry: updated, unread });
  } catch (err) {
    console.error("[api/admin/inquiries] PATCH failed:", err);
    return errorResponse("Could not update the inquiry");
  }
}

/** Admin: permanently remove an inquiry. */
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured()) return errorResponse("Database not configured", 503);

  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id || !isMongoId(id)) return errorResponse("Invalid inquiry id", 400);

    await connectToDB();
    const deleted = await Inquiry.findByIdAndDelete(id).lean().exec();
    if (!deleted) return errorResponse("Inquiry not found", 404);

    return ok({ id });
  } catch (err) {
    console.error("[api/admin/inquiries] DELETE failed:", err);
    return errorResponse("Could not delete the inquiry");
  }
}
