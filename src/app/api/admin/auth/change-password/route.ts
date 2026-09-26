import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { requireAdmin } from "@/lib/auth";
import { connectToDB, errorResponse, isDbConfigured, ok } from "@/lib/db";
import User from "@/models/User";
import { changePasswordSchema, fieldErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

const BCRYPT_ROUNDS = 12;

/** Admin: rotate the admin password. The new hash is stored, never plaintext. */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured()) return errorResponse("Database not configured", 503);

  try {
    const session = await (await import("next-auth")).getServerSession(
      (await import("@/lib/auth")).authOptions,
    );
    const uid = String((session?.user as { id?: string } | undefined)?.id ?? "");

    const body = await request.json().catch(() => null);
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Some fields need attention", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    await connectToDB();

    const user = uid
      ? await User.findById(uid).exec()
      : await User.findOne({ role: "admin" }).exec();
    if (!user) return errorResponse("Admin user not found", 404);

    const valid = await compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Current password is incorrect", fields: { currentPassword: "Incorrect password" } },
        { status: 401 },
      );
    }

    const passwordHash = await hash(parsed.data.newPassword, BCRYPT_ROUNDS);
    await User.updateOne(
      { _id: user._id },
      { $set: { passwordHash, failedAttempts: 0 }, $unset: { lockedUntil: 1 } },
    ).exec();

    return ok({ changed: true });
  } catch (err) {
    console.error("[api/admin/auth/change-password] failed:", err);
    return errorResponse("Could not change the password");
  }
}
