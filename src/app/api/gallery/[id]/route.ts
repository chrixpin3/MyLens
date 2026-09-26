import { getGalleryImage } from "@/lib/data";
import { errorResponse, ok } from "@/lib/db";
import { isMongoId } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Public: a single photograph, used for deep links and share previews. */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isMongoId(params.id)) return errorResponse("Invalid image id", 400);
    const image = await getGalleryImage(params.id);
    if (!image) return errorResponse("Image not found", 404);
    return ok(image);
  } catch (err) {
    console.error("[api/gallery/:id] GET failed:", err);
    return errorResponse("Could not load image");
  }
}
