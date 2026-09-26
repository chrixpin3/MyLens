import mongoose, { Schema, type Model, type Types } from "mongoose";

const InquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
    },
    phone: { type: String, default: "", trim: true, maxlength: 40 },
    service: { type: String, default: "", trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    read: { type: Boolean, default: false, index: true },
    /** Set when RESEND_API_KEY is present and delivery succeeded. */
    notified: { type: Boolean, default: false },
    userAgent: { type: String, default: "", maxlength: 300 },
  },
  { timestamps: true },
);

InquirySchema.index({ read: 1, createdAt: -1 });

export type InquiryDocument = mongoose.Document & {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  read: boolean;
  notified: boolean;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
};

const Inquiry: Model<InquiryDocument> =
  (mongoose.models.Inquiry as Model<InquiryDocument>) ||
  mongoose.model<InquiryDocument>("Inquiry", InquirySchema);

export type InquiryLean = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  read: boolean;
  notified?: boolean;
  createdAt: string;
  updatedAt: string;
};

export default Inquiry;
