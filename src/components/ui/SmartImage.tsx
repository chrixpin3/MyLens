"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn, placeholderDataUrl } from "@/lib/utils";

export interface SmartImageProps
  extends Omit<ImageProps, "placeholder" | "blurDataURL" | "src"> {
  /** `data:` base64 thumbnail generated at upload time. */
  blurDataUrl?: string;
  /** Optional so callers can pass `media?.url` straight through. */
  src?: string | null;
  /** Wrapper classes; the image itself fills it. */
  wrapperClassName?: string;
  /** Set when no image has been uploaded yet. */
  empty?: boolean;
  aspect?: string;
  /** Overlay slot rendered above the image (e.g. gallery title scrim). */
  overlay?: React.ReactNode;
  sizes?: string;
  priority?: boolean;
}

/**
 * Image with a graceful empty state and blur-up loading.
 *
 * - If a real `blurDataUrl` (LQIP) is present, next/image renders it as a
 *   blurred placeholder.
 * - Otherwise we layer a tiny low-opacity copy behind the image and cross-fade
 *   on load, which gives the same perceived speed without base64 payloads.
 * - With no source at all we render a deterministic greyscale placeholder so
 *   admin-empty sections still look designed rather than broken.
 */
export function SmartImage({
  blurDataUrl,
  wrapperClassName,
  empty,
  aspect = "4 / 5",
  overlay,
  className,
  alt,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
  src,
  ...rest
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const hasSource = Boolean(src) && !empty;

  if (!hasSource) {
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-ink-900",
          wrapperClassName,
        )}
        style={{ aspectRatio: aspect }}
        role="img"
        aria-label={alt || "No image uploaded yet"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={placeholderDataUrl(4 / 5)}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/35 text-center">
          <span className="eyebrow text-white/35">No image yet</span>
          <span className="text-xs text-white/30">Upload one from the dashboard</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden bg-ink-900", wrapperClassName)}
      style={{ aspectRatio: aspect }}
    >
      <Image
        src={src as string}
        alt={alt ?? ""}
        fill
        sizes={sizes}
        className={cn(
          "object-cover transition-opacity duration-700 ease-editorial",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        placeholder={blurDataUrl ? "blur" : "empty"}
        blurDataURL={blurDataUrl || undefined}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        {...rest}
      />
      {overlay}
    </div>
  );
}
