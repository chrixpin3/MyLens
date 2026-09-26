import mongoose, { Schema, type Model } from "mongoose";

/**
 * Durable brute-force counter for the login route. In-memory throttling alone
 * resets on every serverless cold start, so the authoritative counter lives in
 * MongoDB and expires via a TTL index.
 */
const LoginAttemptSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    count: { type: Number, default: 0 },
    firstAt: { type: Date, default: () => new Date() },
    lockedUntil: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true },
);

export type LoginAttemptDocument = mongoose.Document & {
  key: string;
  count: number;
  firstAt: Date;
  lockedUntil: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

const LoginAttempt: Model<LoginAttemptDocument> =
  (mongoose.models.LoginAttempt as Model<LoginAttemptDocument>) ||
  mongoose.model<LoginAttemptDocument>("LoginAttempt", LoginAttemptSchema);

export default LoginAttempt;
