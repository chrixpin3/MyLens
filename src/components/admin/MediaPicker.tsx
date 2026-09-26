"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { useGlobalLoader } from "@/components/zip/ZipLoaderProvider";
import { useToast } from "@/components/admin/Toast";
import { Button } from "@/components/ui/Button";
import { CheckIcon, CloseIcon, UploadIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { MediaRef } from "@/types";

export interface MediaPickerProps {
  label: string;
  hint?: string;
  value: MediaRef | null;
  onChange: (next: MediaRef | null) => void;
  aspect?: "4 / 5" | "1 / 1" | "16 / 9" | "16 / 10" | "3 / 2" | "3 / 4";
  /** Local preview before it is saved. */
  preview?: boolean;
  className?: string;
}

/**
 * Single-image picker that uploads straight to Cloudinary.
 *
 * During the transfer the network-aware ZipLoader takes over as a modal and is
 * driven by real XHR progress events — not a timer.
 */
export function MediaPicker({
  label,
  hint,
  value,
  onChange,
  aspect = "4 / 5",
  className,
}: MediaPickerProps) {
  const { upload, uploading } = useCloudinaryUpload();
  const loader = useGlobalLoader();
  const { notify } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState(value?.alt ?? "");

  useEffect(() => setAlt(value?.alt ?? ""), [value?.alt]);

  const handleFile = async (file: File) => {
    loader.open({ label: "Unzipping your upload…" });
    try {
      const result = await upload(file, {
        // Map the 0–100 transfer onto 0–88; the remaining 12% covers the
        // metadata save, so the bar never sits at a fake 100.
        onProgress: (pct) => loader.setProgress(pct * 0.88),
      });
      const next: MediaRef = {
        url: result.secure_url,
        publicId: result.public_id,
        alt: alt || label,
        width: result.width,
        height: result.height,
        blurDataUrl: "",
      };
      onChange(next);
      notify("Image uploaded", "success", "Save the form to apply it to the site.");
    } catch (err) {
      notify("Upload failed", "error", err instanceof Error ? err.message : undefined);
    } finally {
      loader.close();
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <span className="eyebrow text-white/40">{label}</span>

      <div
        className="relative overflow-hidden rounded-glass-sm border border-dashed border-white/18 bg-white/[0.03]"
        style={{ aspectRatio: aspect }}
      >
        {value?.url ? (
          <>
            <Image
              src={value.url}
              alt={value.alt || label}
              fill
              sizes="320px"
              className="object-cover"
              unoptimized={!value.url.includes("res.cloudinary.com")}
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-gradient-to-t from-black/85 to-transparent p-3">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                Replace
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                onClick={() => onChange(null)}
                aria-label={`Remove ${label}`}
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-full w-full flex-col items-center justify-center gap-2.5 text-white/40 transition-colors hover:text-white/70"
          >
            <UploadIcon className="h-6 w-6" />
            <span className="eyebrow">Upload</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {value?.url && (
        <label className="flex flex-col gap-2">
          <span className="text-xs text-white/40">Alt text (accessibility)</span>
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Describe the image"
            className="w-full rounded-glass-sm border border-white/14 bg-white/[0.045] px-3.5 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/45 focus:outline-none"
            onBlur={() => onChange({ ...value, alt })}
          />
        </label>
      )}

      {hint && <p className="text-xs text-white/30">{hint}</p>}

      {value?.url && (
        <p className="flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-widest2 text-white/30">
          <CheckIcon className="h-3 w-3" /> {value.publicId || "external url"}
        </p>
      )}
    </div>
  );
}
