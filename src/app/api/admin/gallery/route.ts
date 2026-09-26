import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectToDB, errorResponse, isDbConfigured, ok } from "@/lib/db";
import GalleryImage from "@/models/GalleryImage";
import { revalidateSite } from "@/lib/data";
import { destroyAsset, buildBlurDataUrl } from "@/lib/cloudinary";
import { fieldErrors, galleryMetaSchema, galleryReorderSchema, galleryUpdateSchema } from "@/lib/validation";
import { isMongoId } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Admin: every image, including metadata, for the management grid. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured()) return ok([]);

  try {
    await connectToDB();
    const images = await GalleryImage.find({})
      .sort({ pinned: -1, order: 1, uploadedAt: -1 })
      .lean()
      .exec();
    return ok(images);
  } catch (err) {
    console.error("[api/admin/gallery] GET failed:", err);
    return errorResponse("Could not load images");
  }
}

/**
 * Admin: register a freshly uploaded asset.
 * The binary goes browser -> Cloudinary directly (see /api/admin/upload), this
 * endpoint only persists the metadata and returns the Cloudinary URLs.
 */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured()) return errorResponse("Database not configured", 503);

  try {
    const body = await request.json().catch(() => null);
    const parsed = galleryMetaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Some fields need attention", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    await connectToDB();
    const data = parsed.data;

    // Alt text falls back to the title, per the accessibility requirement.
    const alt = data.alt?.trim() || data.title;

    let blurDataUrl = data.blurDataUrl;
    if (!blurDataUrl && data.cloudinaryPublicId) {
      blurDataUrl = (await buildBlurDataUrl(data.cloudinaryPublicId)) || "";
    }

    // Continue the ordering sequence when none was supplied: new frames land
    // at the end of the unpinned sequence.
    let order = data.order;
    if (order == null) {
      const lastUnpinned = await GalleryImage.findOne({ pinned: { $ne: true } })
        .sort({ order: -1 })
        .lean()
        .exec();
      order = (lastUnpinned?.order ?? -1) + 1;
    }

    const created = await GalleryImage.create({
      imageUrl: data.imageUrl,
      cloudinaryPublicId: data.cloudinaryPublicId,
      title: data.title,
      description: data.description,
      alt,
      category: data.category,
      order,
      pinned: data.pinned,
      blurDataUrl,
      width: data.width,
      height: data.height,
      uploadedAt: new Date(),
    });

    await revalidateSite();
    return ok(created.toObject(), 201);
  } catch (err) {
    console.error("[api/admin/gallery] POST failed:", err);
    return errorResponse("Could not save the image");
  }
}

/** Admin: edit metadata / pin / reorder a single image. */
export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured()) return errorResponse("Database not configured", 503);

  try {
    const body = await request.json().catch(() => null);
    const parsed = galleryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Some fields need attention", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    await connectToDB();
    const { id, ...updates } = parsed.data;

    // Keep alt text in sync with the title when the title is the only source.
    if (updates.title && !updates.alt) updates.alt = updates.title;

    const updated = await GalleryImage.findByIdAndUpdate(id, { $set: updates }, { new: true })
      .lean()
      .exec();
    if (!updated) return errorResponse("Image not found", 404);

    await revalidateSite();
    return ok(updated);
  } catch (err) {
    console.error("[api/admin/gallery] PUT failed:", err);
    return errorResponse("Could not update the image");
  }
}

/** Admin: bulk reorder (drag-and-drop) in one round trip. */
export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured()) return errorResponse("Database not configured", 503);

  try {
    const body = await request.json().catch(() => null);
    const parsed = galleryReorderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid reorder payload", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    await connectToDB();
    await GalleryImage.bulkWrite(
      parsed.data.items.map((item) => ({
        updateOne: {
          filter: { _id: item.id },
          update: { $set: { order: item.order } },
        },
      })),
    );

    await revalidateSite();
    return ok({ updated: parsed.data.items.length });
  } catch (err) {
    console.error("[api/admin/gallery] PATCH failed:", err);
    return errorResponse("Could not reorder images");
  }
}

/** Admin: delete an image (metadata + the Cloudinary asset). */
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured()) return errorResponse("Database not configured", 503);

  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id || !isMongoId(id)) return errorResponse("Invalid image id", 400);

    await connectToDB();
    const deleted = await GalleryImage.findByIdAndDelete(id).lean().exec();
    if (!deleted) return errorResponse("Image not found", 404);

    // Asset cleanup is best-effort: a failure here must not orphan the record.
    if (deleted.cloudinaryPublicId) {
      try {
        await destroyAsset(deleted.cloudinaryPublicId, "image");
      } catch (err) {
        console.error("[api/admin/gallery] cloudinary destroy failed:", err);
      }
    }

    await revalidateSite();
    return ok({ id });
  } catch (err) {
    console.error("[api/admin/gallery] DELETE failed:", err);
    return errorResponse("Could not delete the image");
  }
}
