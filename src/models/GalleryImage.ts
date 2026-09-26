import mongoose, { Schema, type Model, type Types } from "mongoose";

const GalleryImageSchema = new Schema(
  {
    imageUrl: { type: String, required: true, trim: true, maxlength: 800 },
    cloudinaryPublicId: { type: String, default: "", trim: true, maxlength: 300 },
    /** Card overlay title. */
    title: { type: String, required: true, trim: true, maxlength: 160 },
    /** Lightbox body copy. */
    description: { type: String, default: "", trim: true, maxlength: 4000 },
    alt: { type: String, default: "", trim: true, maxlength: 300 },
    category: { type: String, default: "", trim: true, maxlength: 60, index: true },
    order: { type: Number, default: 0, index: true },
    pinned: { type: Boolean, default: false, index: true },
    blurDataUrl: { type: String, default: "" },
    width: Number,
    height: Number,
    uploadedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

GalleryImageSchema.index({ category: 1, order: 1 });
GalleryImageSchema.index({ pinned: -1, order: 1, uploadedAt: -1 });

export type GalleryImageDocument = mongoose.Document & {
  imageUrl: string;
  cloudinaryPublicId: string;
  title: string;
  description: string;
  alt: string;
  category: string;
  order: number;
  pinned: boolean;
  blurDataUrl: string;
  width?: number;
  height?: number;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

const GalleryImage: Model<GalleryImageDocument> =
  (mongoose.models.GalleryImage as Model<GalleryImageDocument>) ||
  mongoose.model<GalleryImageDocument>("GalleryImage", GalleryImageSchema);

export type GalleryImageLean = {
  _id: Types.ObjectId;
  imageUrl: string;
  cloudinaryPublicId: string;
  title: string;
  description: string;
  alt: string;
  category: string;
  order: number;
  pinned: boolean;
  blurDataUrl?: string;
  width?: number;
  height?: number;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
};

export default GalleryImage;
