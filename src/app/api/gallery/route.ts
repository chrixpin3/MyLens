import { getGalleryCategories, getGalleryImages } from "@/lib/data";
import { errorResponse, ok } from "@/lib/db";

export const revalidate = 60;
// Query params are read from the request URL, so this route is never static.
export const dynamic = "force-dynamic";

/**
 * Public: the gallery.
 * Optional query params: `?category=wedding`, `?limit=6`.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category") || undefined;
    const limitRaw = Number(url.searchParams.get("limit") || 0);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 200) : undefined;

    const [images, categories] = await Promise.all([
      getGalleryImages({ category, limit }),
      category ? Promise.resolve([]) : getGalleryCategories(),
    ]);

    return ok({ images, categories, total: images.length });
  } catch (err) {
    console.error("[api/gallery] GET failed:", err);
    return errorResponse("Could not load gallery");
  }
}
