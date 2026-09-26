import { z } from "zod";

/**
 * Validation schemas shared by the contact form (react-hook-form + zodResolver)
 * and every API route, so client and server can never disagree.
 */

const trimmed = (max: number) => z.string().trim().max(max);
const url = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => v === "" || /^https?:\/\/.+/.test(v) || v.startsWith("/") || v.startsWith("#"), {
      message: "Enter a full URL (https://…) or a path starting with /",
    });

/* ------------------------------------------------------------------ */
/* Contact form                                                        */
/* ------------------------------------------------------------------ */

export const inquirySchema = z.object({
  name: trimmed(120).min(2, "Tell us your name"),
  email: z.string().trim().min(1, "An email is required").email("That email looks off").max(160),
  phone: trimmed(40).optional().default(""),
  service: trimmed(120).optional().default(""),
  message: trimmed(5000).min(10, "A little more detail, please (10+ characters)"),
  /** Honeypot — must stay empty. */
  company: z.string().max(0, "Rejected").optional().default(""),
});
/** Shape the form renders (optional honeypot/phone). */
export type InquiryInput = z.input<typeof inquirySchema>;
/** Shape the server receives after zod applies defaults. */
export type InquiryOutput = z.output<typeof inquirySchema>;

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export const loginSchema = z.object({
  username: trimmed(40).min(1, "Username is required"),
  password: z.string().min(1, "Password is required").max(200),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(10, "Use at least 10 characters")
      .max(200, "That password is too long"),
    confirmPassword: z.string().min(1, "Confirm the new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "Choose a password you have not used here before",
    path: ["newPassword"],
  });

export const changeIdentitySchema = z
  .object({
    username: trimmed(40)
      .min(3, "At least 3 characters")
      .regex(/^[a-z0-9._-]+$/i, "Letters, numbers, dot, dash and underscore only"),
    email: z.union([z.string().trim().email("That email looks off").max(160), z.literal("")]),
  });

/* ------------------------------------------------------------------ */
/* Shared field pieces                                                 */
/* ------------------------------------------------------------------ */

export const mediaRefSchema = z.object({
  url: z.string().trim().max(800).default(""),
  publicId: z.string().trim().max(300).default(""),
  alt: trimmed(300).optional().default(""),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  blurDataUrl: z.string().max(20000).optional().default(""),
});

export const socialSchema = z.object({
  platform: trimmed(40).min(1),
  label: trimmed(40).optional().default(""),
  url: url(),
  visible: z.boolean().default(true),
});

export const navSchema = z.object({
  label: trimmed(40).min(1, "Label is required"),
  href: trimmed(200).min(1, "Destination is required"),
  visible: z.boolean().default(true),
});

export const statSchema = z.object({
  label: trimmed(60).min(1),
  value: trimmed(60).min(1),
});

export const timelineSchema = z.object({
  period: trimmed(60).default(""),
  role: trimmed(120).default(""),
  place: trimmed(120).optional().default(""),
  description: trimmed(600).optional().default(""),
});

export const contactSchema = z.object({
  email: z.union([z.string().trim().email("Enter a valid email").max(160), z.literal("")]),
  phone: trimmed(40).default(""),
  whatsapp: trimmed(40).default(""),
  address: trimmed(300).default(""),
  mapEmbedUrl: url(800).default(""),
  mapUrl: url(800).default(""),
});

/* ------------------------------------------------------------------ */
/* Site config                                                         */
/* ------------------------------------------------------------------ */

export const siteConfigSchema = z.object({
  photographerName: trimmed(80).min(1, "A name is required"),
  tagline: trimmed(200).default(""),
  bio: z.string().max(20000).default(""),
  shortBio: trimmed(600).default(""),
  profileImage: mediaRefSchema.nullable().optional(),
  logo: mediaRefSchema.nullable().optional(),
  stats: z.array(statSchema).max(12).default([]),
  skills: z.array(trimmed(60)).max(40).default([]),
  experience: z.array(timelineSchema).max(20).default([]),
  coverageArea: trimmed(200).default(""),
  contact: contactSchema.default({} as never),
  social: z.array(socialSchema).max(20).default([]),
  nav: z.array(navSchema).max(12).default([]),
  sections: z
    .object({
      stats: z.boolean().default(true),
      aboutZigzag: z.boolean().default(true),
      services: z.boolean().default(true),
      featured: z.boolean().default(true),
      ctaBand: z.boolean().default(true),
      experience: z.boolean().default(true),
      skills: z.boolean().default(true),
    })
    .default({} as never),
  hero: z
    .object({
      mediaType: z.enum(["image", "video"]).default("image"),
      image: mediaRefSchema.nullable().optional(),
      videoUrl: url(800).default(""),
      poster: mediaRefSchema.nullable().optional(),
      autoplayVideo: z.boolean().default(true),
      overlay: z.number().int().min(0).max(100).default(65),
      align: z.enum(["left", "center"]).default("left"),
    })
    .default({} as never),
  cta: z
    .object({
      headline: trimmed(160).default(""),
      subhead: trimmed(300).default(""),
      primaryText: trimmed(40).default(""),
      primaryHref: url(300).default(""),
      secondaryText: trimmed(40).default(""),
      secondaryHref: url(300).default(""),
    })
    .default({} as never),
  featuredCount: z.number().int().min(1).max(24).default(6),
});

export type SiteConfigInput = z.infer<typeof siteConfigSchema>;

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export const serviceSchema = z.object({
  title: trimmed(120).min(1, "A title is required"),
  description: trimmed(2000).default(""),
  image: mediaRefSchema.nullable().optional(),
  ctaText: trimmed(40).default(""),
  ctaLink: url(300).default(""),
  icon: trimmed(40).default("aperture"),
  order: z.number().int().min(0).max(100000).default(0),
  active: z.boolean().default(true),
});
export type ServiceInput = z.infer<typeof serviceSchema>;

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

export const galleryMetaSchema = z.object({
  imageUrl: z.string().trim().min(1, "Upload an image first").max(800),
  cloudinaryPublicId: trimmed(300).default(""),
  title: trimmed(160).min(1, "A title is required"),
  description: trimmed(4000).default(""),
  alt: trimmed(300).optional().default(""),
  category: trimmed(60).optional().default(""),
  order: z.number().int().min(0).max(100000).optional(),
  pinned: z.boolean().optional().default(false),
  blurDataUrl: z.string().max(20000).optional().default(""),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const galleryUpdateSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Unknown image"),
  title: trimmed(160).min(1, "A title is required").optional(),
  description: trimmed(4000).optional(),
  alt: trimmed(300).optional(),
  category: trimmed(60).optional(),
  pinned: z.boolean().optional(),
  order: z.number().int().min(0).max(100000).optional(),
});

export const galleryReorderSchema = z.object({
  items: z.array(z.object({ id: z.string().regex(/^[a-f\d]{24}$/i), order: z.number().int().min(0) })).min(1),
});

/** Bulk reorder — a swap moves two services, so both orders must be written. */
export const serviceReorderSchema = z.object({
  items: z.array(z.object({ id: z.string().regex(/^[a-f\d]{24}$/i), order: z.number().int().min(0) })).min(1),
});

/* ------------------------------------------------------------------ */
/* Inquiries                                                           */
/* ------------------------------------------------------------------ */

export const inquiryPatchSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Unknown inquiry"),
  read: z.boolean(),
});

/** Formats a ZodError into `{ field: message }` for RHF + API responses. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
