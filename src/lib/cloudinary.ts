import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  configured = true;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export const UPLOAD_FOLDER = process.env.CLOUDINARY_FOLDER || "photographer-portfolio";

/**
 * Signed direct-upload parameters so the browser can POST straight to Cloudinary.
 *
 * Cloudinary validates the signature against every non-file parameter sent with
 * the request, so `signatureParams` must be appended to the form verbatim.
 */
export function createUploadSignature(folder: string = UPLOAD_FOLDER) {
  ensureConfigured();
  const timestamp = Math.floor(Date.now() / 1000);
  const signatureParams = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(
    signatureParams,
    process.env.CLOUDINARY_API_SECRET as string,
  );
  return {
    ...signatureParams,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  };
}

/** Server-side upload used by the seed script and any non-browser path. */
export async function uploadBuffer(
  buffer: Buffer,
  opts: { folder?: string; filename?: string } = {},
): Promise<UploadApiResponse> {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: opts.folder ?? UPLOAD_FOLDER,
        resource_type: "auto",
        overwrite: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Cloudinary upload failed"));
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
}

/** Destroy an asset (used when an admin deletes a gallery image). */
export async function destroyAsset(publicId: string, resourceType: "image" | "video" = "image") {
  if (!publicId || !isCloudinaryConfigured()) return null;
  ensureConfigured();
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/**
 * Build a tiny inline base64 thumbnail for next/image's blur placeholder.
 * Returns undefined if Cloudinary is unreachable — the UI falls back to a CSS
 * blur-up, so a missing LQIP is never fatal.
 */
export async function buildBlurDataUrl(
  publicId: string,
  resourceType: "image" | "video" = "image",
): Promise<string | undefined> {
  if (!publicId || !isCloudinaryConfigured()) return undefined;
  try {
    ensureConfigured();
    const url = cloudinary.url(publicId, {
      secure: true,
      resource_type: resourceType,
      transformation: [{ width: 20, height: 20, crop: "fill", quality: 30, fetch_format: "auto" }],
    });
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return undefined;
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    return `data:${contentType};base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  }
}

/** A 32px-wide blur-up URL that can be used as a CSS background while loading. */
export function lqipUrl(
  publicId: string,
  resourceType: "image" | "video" = "image",
): string {
  if (!publicId || !isCloudinaryConfigured()) return "";
  try {
    ensureConfigured();
    return cloudinary.url(publicId, {
      secure: true,
      resource_type: resourceType,
      transformation: [{ width: 40, quality: 25, fetch_format: "auto" }],
    });
  } catch {
    return "";
  }
}
