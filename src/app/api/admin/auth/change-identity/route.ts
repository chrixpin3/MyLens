import { NextResponse } from "next/server";
import { requireAdmin, authOptions } from "@/lib/auth";
import { connectToDB, errorResponse, isDbConfigured, ok } from "@/lib/db";
import User from "@/models/User";
import { changeIdentitySchema, fieldErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Admin: change the admin username and/or email. */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured()) return errorResponse("Database not configured", 503);

  try {
    const { getServerSession } = await import("next-auth");
    const session = await getServerSession(authOptions);
    const uid = String((session?.user as { id?: string } | undefined)?.id ?? "");

    const body = await request.json().catch(() => null);
    const parsed = changeIdentitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Some fields need attention", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    await connectToDB();

    const user = uid ? await User.findById(uid).exec() : await User.findOne({ role: "admin" }).exec();
    if (!user) return errorResponse("Admin user not found", 404);

    const username = parsed.data.username.toLowerCase();
    const clash = await User.findOne({ username, _id: { $ne: user._id } }).lean().exec();
    if (clash) {
      return NextResponse.json(
        { ok: false, error: "That username is taken", fields: { username: "Already in use" } },
        { status: 409 },
      );
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { username, email: parsed.data.email.toLowerCase() } },
    ).exec();

    // The JWT still carries the old username — force a fresh sign-in.
    return ok({ username, email: parsed.data.email, reauth: true });
  } catch (err) {
    console.error("[api/admin/auth/change-identity] failed:", err);
    return errorResponse("Could not update the account");
  }
}
