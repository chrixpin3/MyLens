import mongoose, { Schema, type Model, type Types } from "mongoose";

const MediaRefSchema = new Schema(
  {
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
    alt: { type: String, default: "" },
    width: { type: Number },
    height: { type: Number },
    blurDataUrl: { type: String, default: "" },
  },
  { _id: false },
);

const StatSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 60 },
    value: { type: String, required: true, trim: true, maxlength: 60 },
  },
  { _id: false },
);

const SocialSchema = new Schema(
  {
    platform: { type: String, required: true, trim: true, lowercase: true },
    label: { type: String, trim: true, maxlength: 40 },
    url: { type: String, default: "", trim: true, maxlength: 500 },
    visible: { type: Boolean, default: true },
  },
  { _id: false },
);

const NavSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 40 },
    href: { type: String, required: true, trim: true, maxlength: 200 },
    visible: { type: Boolean, default: true },
  },
  { _id: false },
);

const TimelineSchema = new Schema(
  {
    period: { type: String, default: "", trim: true, maxlength: 60 },
    role: { type: String, default: "", trim: true, maxlength: 120 },
    place: { type: String, default: "", trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 600 },
  },
  { _id: false },
);

const ContactSchema = new Schema(
  {
    email: { type: String, default: "", trim: true, maxlength: 160 },
    phone: { type: String, default: "", trim: true, maxlength: 40 },
    whatsapp: { type: String, default: "", trim: true, maxlength: 40 },
    address: { type: String, default: "", trim: true, maxlength: 300 },
    mapEmbedUrl: { type: String, default: "", trim: true, maxlength: 800 },
    mapUrl: { type: String, default: "", trim: true, maxlength: 800 },
  },
  { _id: false },
);

const SectionsSchema = new Schema(
  {
    stats: { type: Boolean, default: true },
    aboutZigzag: { type: Boolean, default: true },
    services: { type: Boolean, default: true },
    featured: { type: Boolean, default: true },
    ctaBand: { type: Boolean, default: true },
    experience: { type: Boolean, default: true },
    skills: { type: Boolean, default: true },
  },
  { _id: false },
);

const HeroSchema = new Schema(
  {
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    image: { type: MediaRefSchema, default: () => ({}) },
    videoUrl: { type: String, default: "", trim: true, maxlength: 800 },
    poster: { type: MediaRefSchema, default: () => ({}) },
    autoplayVideo: { type: Boolean, default: true },
    overlay: { type: Number, min: 0, max: 100, default: 65 },
    align: { type: String, enum: ["left", "center"], default: "left" },
  },
  { _id: false },
);

const CtaSchema = new Schema(
  {
    headline: { type: String, default: "", trim: true, maxlength: 160 },
    subhead: { type: String, default: "", trim: true, maxlength: 300 },
    primaryText: { type: String, default: "", trim: true, maxlength: 40 },
    primaryHref: { type: String, default: "", trim: true, maxlength: 300 },
    secondaryText: { type: String, default: "", trim: true, maxlength: 40 },
    secondaryHref: { type: String, default: "", trim: true, maxlength: 300 },
  },
  { _id: false },
);

const SiteConfigSchema = new Schema(
  {
    /** Singleton discriminator – only one document ever exists. */
    key: { type: String, default: "default", unique: true, immutable: true },

    photographerName: { type: String, default: "", trim: true, maxlength: 80 },
    tagline: { type: String, default: "", trim: true, maxlength: 200 },
    bio: { type: String, default: "", maxlength: 20000 },
    shortBio: { type: String, default: "", maxlength: 600 },
    profileImage: { type: MediaRefSchema, default: () => ({}) },
    logo: { type: MediaRefSchema, default: () => ({}) },

    stats: { type: [StatSchema], default: () => [] },
    skills: { type: [String], default: () => [] },
    experience: { type: [TimelineSchema], default: () => [] },
    coverageArea: { type: String, default: "", trim: true, maxlength: 200 },

    contact: { type: ContactSchema, default: () => ({}) },
    social: { type: [SocialSchema], default: () => [] },
    nav: { type: [NavSchema], default: () => [] },
    sections: { type: SectionsSchema, default: () => ({}) },
    hero: { type: HeroSchema, default: () => ({}) },
    cta: { type: CtaSchema, default: () => ({}) },

    featuredCount: { type: Number, default: 6, min: 1, max: 24 },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

export type SiteConfigDocument = mongoose.Document & {
  key: string;
  photographerName: string;
};

const SiteConfig: Model<SiteConfigDocument> =
  (mongoose.models.SiteConfig as Model<SiteConfigDocument>) ||
  mongoose.model<SiteConfigDocument>("SiteConfig", SiteConfigSchema);

export const CONFIG_KEY = "default";
export type SiteConfigLean = {
  _id: Types.ObjectId;
  photographerName: string;
  tagline: string;
  bio: string;
  shortBio: string;
  profileImage: { url: string; publicId: string; alt: string } | null;
  logo: { url: string; publicId: string; alt: string } | null;
  stats: { label: string; value: string }[];
  skills: string[];
  experience: {
    period: string;
    role: string;
    place?: string;
    description?: string;
  }[];
  coverageArea: string;
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    mapEmbedUrl?: string;
    mapUrl?: string;
  };
  social: { platform: string; label?: string; url: string; visible: boolean }[];
  nav: { label: string; href: string; visible: boolean }[];
  sections: {
    stats: boolean;
    aboutZigzag: boolean;
    services: boolean;
    featured: boolean;
    ctaBand: boolean;
    experience: boolean;
    skills: boolean;
  };
  hero: {
    mediaType: "image" | "video";
    image: { url: string; publicId: string; alt: string };
    videoUrl: string;
    poster: { url: string; publicId: string; alt: string };
    autoplayVideo: boolean;
    overlay: number;
    align: "left" | "center";
  };
  cta: {
    headline: string;
    subhead: string;
    primaryText: string;
    primaryHref: string;
    secondaryText: string;
    secondaryHref: string;
  };
  featuredCount: number;
  createdAt: string;
  updatedAt: string;
};

export default SiteConfig;
