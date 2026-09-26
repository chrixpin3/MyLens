import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectToDB, errorResponse, isDbConfigured, ok } from "@/lib/db";
import SiteConfig, { CONFIG_KEY } from "@/models/SiteConfig";
import { getSiteConfig, revalidateSite } from "@/lib/data";
import { fieldErrors, siteConfigSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Admin: read the full configuration, including anything hidden from the API. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    return ok(await getSiteConfig());
  } catch (err) {
    console.error("[api/admin/config] GET failed:", err);
    return errorResponse("Could not load configuration");
  }
}

/** Admin: upsert the singleton SiteConfig document. */
export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isDbConfigured()) return errorResponse("Database not configured", 503);

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Malformed request body", 400);
    }

    const parsed = siteConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Some fields need attention", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    await connectToDB();

    const payload = parsed.data;
    // `key` is immutable, so it is set once on insert only.
    await SiteConfig.findOneAndUpdate(
      { key: CONFIG_KEY },
      { $set: payload, $setOnInsert: { key: CONFIG_KEY } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )
      .lean()
      .exec();

    await revalidateSite();

    return ok(await getSiteConfig());
  } catch (err) {
    console.error("[api/admin/config] PUT failed:", err);
    return errorResponse("Could not save configuration");
  }
}
