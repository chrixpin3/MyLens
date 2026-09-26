import { connectToDB, isDbConfigured } from "@/lib/db";
import SiteConfig, { CONFIG_KEY, type SiteConfigLean } from "@/models/SiteConfig";
import Service, { type ServiceLean } from "@/models/Service";
import GalleryImage, { type GalleryImageLean } from "@/models/GalleryImage";
import { DEFAULT_CONFIG } from "@/lib/defaults";
import type { SiteConfigData } from "@/types";

/**
 * Data access layer.
 *
 * Public server components read straight from MongoDB (one less network hop than
 * calling our own API routes) while the REST endpoints in /api expose the exact
 * same serialised shapes for external consumers. `unstable_cache` gives us ISR
 * so the marketing pages stay fast; admin mutations call `revalidateSite()` to
 * purge those caches.
 */

const CACHE_TAGS = ["site-config", "services", "gallery"] as const;

const FALLBACK_REVALIDATE = 60;

/* ------------------------------------------------------------------ */
/* Site config                                                         */
/* ------------------------------------------------------------------ */

export async function getSiteConfig(): Promise<SiteConfigData> {
  if (!isDbConfigured()) return DEFAULT_CONFIG;

  const { unstable_cache } = await import("next/cache");
  const load = unstable_cache(
    async (): Promise<SiteConfigData> => {
      try {
        await connectToDB();
        const doc = (await SiteConfig.findOne({ key: CONFIG_KEY })
          .lean()
          .exec()) as SiteConfigLean | null;
        return doc ? normaliseConfig(doc) : DEFAULT_CONFIG;
      } catch (err) {
        console.error("[data] getSiteConfig failed:", err);
        return DEFAULT_CONFIG;
      }
    },
    ["site-config"],
    { revalidate: FALLBACK_REVALIDATE, tags: ["site-config"] },
  );

  return load();
}

function normaliseConfig(doc: SiteConfigLean): SiteConfigData {
  const d = DEFAULT_CONFIG;
  return {
    photographerName: doc.photographerName || d.photographerName,
    tagline: doc.tagline || d.tagline,
    bio: doc.bio || d.bio,
    shortBio: doc.shortBio || d.shortBio,
    profileImage: doc.profileImage?.url ? doc.profileImage : null,
    logo: doc.logo?.url ? doc.logo : null,
    stats: doc.stats?.length ? doc.stats : d.stats,
    skills: doc.skills?.length ? doc.skills : d.skills,
    experience: doc.experience?.length ? doc.experience : d.experience,
    coverageArea: doc.coverageArea || d.coverageArea,
    contact: { ...d.contact, ...(doc.contact ?? {}) },
    social: doc.social?.length
      ? doc.social.map((s) => ({
          platform: s.platform,
          url: s.url,
          visible: s.visible,
          label: s.label,
        }))
      : d.social,
    nav: doc.nav?.length
      ? doc.nav
      : d.nav,
    sections: { ...d.sections, ...(doc.sections ?? {}) },
    hero: {
      ...d.hero,
      ...(doc.hero ?? {}),
      image: doc.hero?.image?.url ? doc.hero.image : null,
      poster: doc.hero?.poster?.url ? doc.hero.poster : null,
    },
    cta: { ...d.cta, ...(doc.cta ?? {}) },
    featuredCount: doc.featuredCount || d.featuredCount,
    updatedAt: doc.updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export async function getServices(includeInactive = false): Promise<ServiceLean[]> {
  if (!isDbConfigured()) return [];

  const { unstable_cache } = await import("next/cache");
  const load = unstable_cache(
    async (): Promise<ServiceLean[]> => {
      try {
        await connectToDB();
        return (await Service.find(includeInactive ? {} : { active: true })
          .sort({ order: 1, createdAt: 1 })
          .lean()
          .exec()) as unknown as ServiceLean[];
      } catch (err) {
        console.error("[data] getServices failed:", err);
        return [];
      }
    },
    [`services-${includeInactive ? "all" : "active"}`],
    { revalidate: FALLBACK_REVALIDATE, tags: ["services"] },
  );

  return load();
}

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

const GALLERY_SORT = { pinned: -1, order: 1, uploadedAt: -1 } as const;

export async function getGalleryImages(
  opts: { category?: string; limit?: number } = {},
): Promise<GalleryImageLean[]> {
  if (!isDbConfigured()) return [];

  const { unstable_cache } = await import("next/cache");
  const category = opts.category ?? "";
  const limit = opts.limit ?? 0;

  const load = unstable_cache(
    async (): Promise<GalleryImageLean[]> => {
      try {
        await connectToDB();
        const filter = category ? { category } : {};
        let q = GalleryImage.find(filter).sort(GALLERY_SORT).lean();
        if (limit > 0) q = q.limit(limit);
        return (await q.exec()) as unknown as GalleryImageLean[];
      } catch (err) {
        console.error("[data] getGalleryImages failed:", err);
        return [];
      }
    },
    [`gallery-${category}-${limit}`],
    { revalidate: FALLBACK_REVALIDATE, tags: ["gallery"] },
  );

  return load();
}

export async function getGalleryImage(id: string) {
  if (!isDbConfigured()) return null;
  try {
    await connectToDB();
    return (await GalleryImage.findById(id).lean().exec()) as unknown as
      | GalleryImageLean
      | null;
  } catch {
    return null;
  }
}

export async function getGalleryCategories(): Promise<string[]> {
  if (!isDbConfigured()) return [];
  try {
    await connectToDB();
    const rows = await GalleryImage.distinct("category", { category: { $nin: ["", null] } });
    return (rows as string[]).filter(Boolean).sort();
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Derived helpers                                                     */
/* ------------------------------------------------------------------ */

/** Normalise a WhatsApp number into a digits-only string (no +, spaces, dashes). */
export function normaliseWhatsapp(value?: string | null): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  return digits;
}

export function whatsappLink(value?: string | null): string {
  const digits = normaliseWhatsapp(value);
  return digits ? `https://wa.me/${digits}` : "";
}

export function telLink(value?: string | null): string {
  if (!value) return "";
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

export function mailtoLink(value?: string | null): string {
  return value ? `mailto:${value}` : "";
}

/** Social links with a non-empty URL, used by header + footer. */
export function visibleSocials(config: SiteConfigData) {
  return config.social.filter((s) => s.visible && s.url && s.url.trim().length > 0);
}

/** Cache invalidation, called after every admin mutation. */
export async function revalidateSite() {
  const { revalidatePath, revalidateTag } = await import("next/cache");
  for (const tag of CACHE_TAGS) revalidateTag(tag);
  revalidatePath("/", "layout");
  revalidatePath("/gallery");
  revalidatePath("/services");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/api/config");
  revalidatePath("/api/services");
  revalidatePath("/api/gallery");
}

export type { ServiceLean, GalleryImageLean };
