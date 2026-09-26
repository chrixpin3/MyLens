"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { useGlobalLoader } from "@/components/zip/ZipLoaderProvider";
import { useToast } from "@/components/admin/Toast";
import { apiFetch } from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export interface PendingUpload {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  description: string;
  alt: string;
  category: string;
  pinned: boolean;
}

/**
 * Multi-file drop zone.
 *
 * Files upload to Cloudinary directly through XHR, so the network-aware
 * ZipLoader is driven by genuine progress events. The modal aggregates across
 * the whole batch: each file contributes 0–88% of the total, the remaining 12%
 * is the metadata save.
 */
export function GalleryUploader({ onComplete }: { onComplete: () => void }) {
  const { upload, uploading } = useCloudinaryUpload();
  const loader = useGlobalLoader();
  const { notify } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState<PendingUpload[]>([]);

  const accept = (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      notify("No images found", "error", "Drop JPEG, PNG, WebP, AVIF or GIF files.");
      return;
    }
    setPending((prev) => [
      ...prev,
      ...list.map((file) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 80),
        description: "",
        alt: "",
        category: "",
        pinned: false,
      })),
    ]);
  };

  const update = (id: string, next: Partial<PendingUpload>) =>
    setPending((list) => list.map((item) => (item.id === id ? { ...item, ...next } : item)));

  const remove = (id: string) =>
    setPending((list) => {
      const target = list.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return list.filter((item) => item.id !== id);
    });

  const commit = async () => {
    if (pending.length === 0) return;
    const total = pending.length;

    loader.open({ label: `Unzipping ${total} image${total === 1 ? "" : "s"}…` });

    try {
      for (let i = 0; i < total; i += 1) {
        const item = pending[i];
        if (!item) continue;
        const base = (i / total) * 100;
        const span = 100 / total;

        const result = await upload(item.file, {
          onProgress: (pct) => loader.setProgress(base + (pct / 100) * span * 0.88),
        });

        await apiFetch("/api/admin/gallery", {
          method: "POST",
          body: JSON.stringify({
            imageUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
            title: item.title,
            description: item.description,
            alt: item.alt || item.title,
            category: item.category,
            pinned: item.pinned,
            width: result.width,
            height: result.height,
          }),
        });
      }

      // 88% → 100% covers persisting the last record.
      loader.setProgress(100);
      notify(`${total} image${total === 1 ? "" : "s"} uploaded`, "success", "They are live on the site.");
      setPending([]);
      onComplete();
      router.refresh();
    } catch (err) {
      notify("Upload stopped", "error", err instanceof Error ? err.message : undefined);
    } finally {
      loader.close();
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          accept(e.dataTransfer.files);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-glass-lg border border-dashed px-6 py-12 text-center transition-colors duration-300",
          dragging
            ? "border-white bg-white/10"
            : "border-white/18 bg-white/[0.02] hover:border-white/35",
        )}
      >
        <span className="eyebrow text-white/45">Drop images here</span>
        <p className="max-w-sm text-pretty text-sm text-white/40">
          JPEG, PNG, WebP, AVIF or GIF up to 25 MB. Files go straight to Cloudinary — progress is
          real, not simulated.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 rounded-full border border-white/25 px-5 py-2.5 text-xs uppercase tracking-widest2 text-white/70 transition-colors hover:border-white hover:bg-white hover:text-black"
        >
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          multiple
          className="sr-only"
          onChange={(e) => e.target.files && accept(e.target.files)}
        />
      </div>

      {pending.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="eyebrow text-white/45">
              {pending.length} file{pending.length === 1 ? "" : "s"} staged
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
                  setPending([]);
                }}
                className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-widest2 text-white/50 transition-colors hover:border-white/40 hover:text-white"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => void commit()}
                disabled={uploading}
                className="rounded-full bg-white px-5 py-2 text-xs font-medium uppercase tracking-widest2 text-black transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {uploading ? "Uploading…" : "Upload all"}
              </button>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {pending.map((item) => (
              <li
                key={item.id}
                className="flex gap-4 rounded-glass-sm border border-white/8 p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="h-24 w-20 shrink-0 rounded-lg object-cover"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      value={item.title}
                      onChange={(e) => update(item.id, { title: e.target.value })}
                      placeholder="Title (shown on the card)"
                      aria-label="Title"
                      className="min-w-0 flex-1 rounded-md border border-white/12 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.file.name}`}
                      className="shrink-0 text-white/35 transition-colors hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                  <input
                    value={item.category}
                    onChange={(e) => update(item.id, { category: e.target.value })}
                    placeholder="Category (optional)"
                    aria-label="Category"
                    className="rounded-md border border-white/12 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
                  />
                  <input
                    value={item.description}
                    onChange={(e) => update(item.id, { description: e.target.value })}
                    placeholder="Description (shown in the lightbox panel)"
                    aria-label="Description"
                    className="rounded-md border border-white/12 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
