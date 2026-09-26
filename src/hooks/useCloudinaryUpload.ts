"use client";

import { useCallback, useRef, useState } from "react";

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  original_filename?: string;
  bytes?: number;
}

interface SignatureResponse {
  ok: boolean;
  data: {
    timestamp: number;
    signature: string;
    folder: string;
    cloudName: string;
    apiKey: string;
    uploadUrl: string;
  };
  error?: string;
}

export interface UploadOptions {
  /** 0–100 progress from the browser's real XHR upload events. */
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
  maxBytes?: number;
}

const DEFAULT_MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

/**
 * Direct browser -> Cloudinary upload.
 *
 * The file never touches the Next.js server, so the progress bar is driven by
 * genuine `xhr.upload.onprogress` events rather than an estimated timer. That
 * is what the ZipLoader renders during an upload.
 */
export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const abortRef = useRef<XMLHttpRequest | null>(null);

  const upload = useCallback(
    async (file: File, opts: UploadOptions = {}): Promise<CloudinaryUploadResult> => {
      const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES;

      if (!ACCEPTED.includes(file.type)) {
        throw new Error("Use a JPEG, PNG, WebP, AVIF or GIF file.");
      }
      if (file.size > maxBytes) {
        throw new Error(`That file is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${Math.round(maxBytes / 1024 / 1024)} MB.`);
      }

      setError("");
      setProgress(0);
      setUploading(true);

      try {
        const sigRes = await fetch("/api/admin/upload/signature", { method: "POST" });
        const sigJson = (await sigRes.json()) as SignatureResponse;
        if (!sigRes.ok || !sigJson.ok) {
          throw new Error(sigJson.error || "Could not authorise the upload.");
        }
        const { signature, timestamp, folder, apiKey, uploadUrl } = sigJson.data;

        const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
          const form = new FormData();
          form.append("file", file);
          form.append("api_key", apiKey);
          form.append("timestamp", String(timestamp));
          form.append("signature", signature);
          form.append("folder", folder);

          const xhr = new XMLHttpRequest();
          abortRef.current = xhr;
          xhr.open("POST", uploadUrl, true);

          xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            const percent = Math.min(99, (event.loaded / event.total) * 100);
            setProgress(percent);
            opts.onProgress?.(percent);
          };

          xhr.onload = () => {
            abortRef.current = null;
            try {
              const body = JSON.parse(xhr.responseText) as CloudinaryUploadResult & {
                error?: { message?: string };
              };
              if (xhr.status >= 200 && xhr.status < 300 && body.secure_url) {
                setProgress(100);
                opts.onProgress?.(100);
                resolve(body);
              } else {
                reject(new Error(body.error?.message || "Cloudinary rejected the upload."));
              }
            } catch {
              reject(new Error("Unexpected response from the image host."));
            }
          };

          xhr.onerror = () => {
            abortRef.current = null;
            reject(new Error("Network error during upload. Check your connection and retry."));
          };
          xhr.onabort = () => {
            abortRef.current = null;
            reject(new Error("Upload cancelled."));
          };

          opts.signal?.addEventListener("abort", () => xhr.abort());
          xhr.send(form);
        });

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed.";
        setError(message);
        throw err;
      } finally {
        setUploading(false);
        abortRef.current = null;
      }
    },
    [],
  );

  const abort = useCallback(() => abortRef.current?.abort(), []);

  return { upload, abort, uploading, progress, error, setError };
}
