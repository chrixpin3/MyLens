import { getServices } from "@/lib/data";
import { errorResponse, ok } from "@/lib/db";
import { connectToDB, isDbConfigured } from "@/lib/db";
import Service from "@/models/Service";

export const revalidate = 60;
// `?all=1` reads the request URL, so this route can never be prerendered.
export const dynamic = "force-dynamic";

/** Public: ordered list of published services. */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const all = url.searchParams.get("all") === "1";
    if (!all) return ok(await getServices(false));
    if (!isDbConfigured()) return ok([]);
    await connectToDB();
    const services = await Service.find({}).sort({ order: 1, createdAt: 1 }).lean().exec();
    return ok(services);
  } catch (err) {
    console.error("[api/services] GET failed:", err);
    return errorResponse("Could not load services");
  }
}
