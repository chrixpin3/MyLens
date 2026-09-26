import mongoose, { Schema, type Model, type Types } from "mongoose";

const ServiceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 2000 },
    image: {
      type: new Schema(
        {
          url: { type: String, default: "" },
          publicId: { type: String, default: "" },
          alt: { type: String, default: "" },
          width: Number,
          height: Number,
          blurDataUrl: { type: String, default: "" },
        },
        { _id: false },
      ),
      default: () => ({}),
    },
    ctaText: { type: String, default: "", trim: true, maxlength: 40 },
    ctaLink: { type: String, default: "", trim: true, maxlength: 300 },
    /** Optional monogram/emoji-free glyph key rendered by the icon set. */
    icon: { type: String, default: "aperture", trim: true, maxlength: 40 },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

ServiceSchema.index({ order: 1 });

export type ServiceDocument = mongoose.Document & {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  icon: string;
  order: number;
  active: boolean;
};

const Service: Model<ServiceDocument> =
  (mongoose.models.Service as Model<ServiceDocument>) ||
  mongoose.model<ServiceDocument>("Service", ServiceSchema);

export type ServiceLean = {
  _id: Types.ObjectId;
  title: string;
  description: string;
  image: {
    url: string;
    publicId: string;
    alt: string;
    width?: number;
    height?: number;
    blurDataUrl?: string;
  } | null;
  ctaText: string;
  ctaLink: string;
  icon: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export default Service;
