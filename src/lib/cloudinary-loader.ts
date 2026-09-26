import type { ImageLoaderProps } from "next/image";

/**
 * Cloudinary image loader registered in next.config.mjs
 * (`images.loader = "custom"`).
 *
 * Every transformation happens on Cloudinary's edge CDN, so the Next.js server
 * never proxies image bytes. Non-Cloudinary sources (e.g. a pasted external
 * URL) are passed through untouched, which keeps the admin flexible.
 */
export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src) return src;
  if (!src.startsWith("http://") && !src.startsWith("https://")) return src;

  const isVideoAsset = src.includes("/video/upload/") || src.includes("/raw/upload/");
  if (isVideoAsset) return src;

  const uploadMatch = src.match(/\/upload\/(.*)$/);
  if (!uploadMatch) return src;

  const host = src.match(/^https?:\/\/([^/]+)/)?.[1] ?? "res.cloudinary.com";
  const [path, existingQuery] = src.split("?");
  void path;

  const target = Math.min(width, 4000);
  const q = quality && quality !== 72 ? `,q_${quality}` : "";

  const delivery = `f_auto,q_auto:good,c_limit,dpr_auto,w_${target}${q}`;
  const query = [delivery, existingQuery].filter(Boolean).join(",");

  return `https://${host}/image/upload/${query}/${uploadMatch[1]}`;
}
