import { requireAdmin } from "@/lib/auth";
import { errorResponse, ok } from "@/lib/db";
import { createUploadSignature, isCloudinaryConfigured, UPLOAD_FOLDER } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

/**
 * Admin: short-lived Cloudinary signature so the browser can upload straight to
 * Cloudinary with XHR progress events (no proxying image bytes through Vercel,
 * no fake progress bars).
 */
export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isCloudinaryConfigured()) {
    return errorResponse(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
      503,
    );
  }

  try {
    return ok({
      ...createUploadSignature(UPLOAD_FOLDER),
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
    });
  } catch (err) {
    console.error("[api/admin/upload/signature] failed:", err);
    return errorResponse("Could not create an upload signature");
  }
}
