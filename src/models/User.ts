import mongoose, { Schema, type Model, type Types } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 40,
    },
    email: { type: String, default: "", lowercase: true, trim: true, maxlength: 160 },
    /** bcrypt hash — plaintext passwords are never stored. */
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
    lastLoginAt: { type: Date, default: null },
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
  },
  { timestamps: true },
);

export type UserDocument = mongoose.Document & {
  username: string;
  email: string;
  passwordHash: string;
  role: "admin";
  lastLoginAt: Date | null;
  failedAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const User: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument>) ||
  mongoose.model<UserDocument>("User", UserSchema);

export type UserLean = {
  _id: Types.ObjectId;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export default User;
