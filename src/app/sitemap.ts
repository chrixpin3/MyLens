import type { MetadataRoute } from "next";
import { getGalleryImages, getSiteConfig } from "@/lib/data";

const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [config, images] = await Promise.all([getSiteConfig(), getGalleryImages()]);
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: config.updatedAt ? new Date(config.updatedAt) : now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/gallery`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  // Every photograph gets its own indexable URL so individual frames can be
  // found in image search.
  for (const image of images) {
    routes.push({
      url: `${base}/gallery?photo=${image._id}`,
      lastModified: image.updatedAt ? new Date(image.updatedAt) : now,
      changeFrequency: "yearly",
      priority: 0.4,
    });
  }

  return routes;
}
