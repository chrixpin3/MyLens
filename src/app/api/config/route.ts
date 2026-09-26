import { getSiteConfig } from "@/lib/data";
import { errorResponse, ok } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 60;

/** Public: the singleton site configuration that drives every page. */
export async function GET() {
  try {
    return ok(await getSiteConfig());
  } catch (err) {
    console.error("[api/config] GET failed:", err);
    return errorResponse("Could not load site configuration");
  }
}
