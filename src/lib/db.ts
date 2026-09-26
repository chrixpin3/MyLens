import mongoose, { type ConnectOptions } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI && process.env.NODE_ENV === "production") {
  // Fail loudly in production rather than rendering a permanently empty site.
  throw new Error("MONGODB_URI is not defined. Copy .env.example to .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Reuse the connection across hot reloads in dev so we don't open a new pool
// on every file save.
let cached: MongooseCache = (global as unknown as { __mongoose?: MongooseCache })
  .__mongoose ?? { conn: null, promise: null };
(global as unknown as { __mongoose?: MongooseCache }).__mongoose = cached;

const options: ConnectOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 8000,
  dbName: process.env.MONGODB_DB || undefined,
};

export async function connectToDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) return mongoose;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, options)
      .then((m) => m)
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export function isDbConfigured(): boolean {
  return Boolean(MONGODB_URI);
}

export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached = { conn: null, promise: null };
  }
}

/** Standard error shape for API routes. */
export function errorResponse(message: string, status = 500) {
  return Response.json({ ok: false, error: message }, { status });
}

export function ok<T>(data: T, status = 200) {
  return Response.json({ ok: true, data }, { status });
}
