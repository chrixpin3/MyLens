import { connectToDB, isDbConfigured } from "@/lib/db";
import GalleryImage from "@/models/GalleryImage";
import { GalleryManager } from "./GalleryManager";
import type { GalleryImageData } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  let images: GalleryImageData[] = [];
  let categories: string[] = [];

  if (isDbConfigured()) {
    await connectToDB();
    images = (await GalleryImage.find({})
      .sort({ pinned: -1, order: 1, uploadedAt: -1 })
      .lean()
      .exec()) as unknown as GalleryImageData[];
    const rows = await GalleryImage.distinct("category", { category: { $nin: ["", null] } });
    categories = (rows as string[]).filter(Boolean).sort();
  }

  return <GalleryManager initial={images} categories={categories} />;
}
