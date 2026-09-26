"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lightbox, type LightboxImage } from "@/components/gallery/Lightbox";
import { SmartImage } from "@/components/ui/SmartImage";
import { Chip } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

export interface GalleryCardData {
  _id: string;
  imageUrl: string;
  title: string;
  description: string;
  alt: string;
  category: string;
  blurDataUrl?: string;
  width?: number;
  height?: number;
}

export interface GalleryGridProps {
  images: GalleryCardData[];
  categories: string[];
  /** Aspect ratio shared by every card, so rows stay rectangular and aligned. */
  aspect?: "4 / 3" | "4 / 5" | "3 / 2" | "1 / 1" | "16 / 9";
}

/**
 * Rectangular gallery grid with bottom-overlay titles and category filters.
 * Opens <Lightbox> on click, and supports deep-linking via ?photo=<id>.
 */
export function GalleryGrid({ images, categories, aspect = "4 / 3" }: GalleryGridProps) {
  const [category, setCategory] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const reduced = useReducedMotion();

  const filtered = useMemo(
    () => (category ? images.filter((img) => img.category === category) : images),
    [images, category],
  );

  // Deep link: /gallery?photo=<id>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const photo = params.get("photo");
    if (!photo) return;
    const idx = images.findIndex((img) => img._id === photo);
    if (idx >= 0) setActiveIndex(idx);
  }, [images]);

  const openAt = (index: number) => setActiveIndex(index);

  const close = () => {
    setActiveIndex(-1);
    const url = new URL(window.location.href);
    url.searchParams.delete("photo");
    window.history.replaceState({}, "", url.toString());
  };

  const lightboxImages: LightboxImage[] = filtered.map((img) => ({
    _id: img._id,
    imageUrl: img.imageUrl,
    title: img.title,
    description: img.description,
    alt: img.alt || img.title,
    category: img.category,
    blurDataUrl: img.blurDataUrl,
    width: img.width,
    height: img.height,
  }));

  if (images.length === 0) return null;

  return (
    <div className="flex flex-col gap-10">
      {categories.length > 1 && (
        <div
          className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          role="tablist"
          aria-label="Filter gallery by category"
        >
          <Chip active={category === ""} onClick={() => setCategory("")} role="tab" aria-selected={category === ""}>
            All work
          </Chip>
          {categories.map((cat) => (
            <Chip
              key={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
              role="tab"
              aria-selected={category === cat}
            >
              {cat}
            </Chip>
          ))}
        </div>
      )}

      <motion.ul
        layout={!reduced}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filtered.map((image, i) => (
          <motion.li
            key={image._id}
            layout={!reduced}
            initial={reduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: reduced ? 0 : Math.min(i, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className={cn("group relative")}
          >
            <button
              type="button"
              onClick={() => openAt(i)}
              aria-haspopup="dialog"
              aria-label={`Open ${image.title}${image.description ? "" : " (no description yet)"}`}
              className="relative block w-full overflow-hidden rounded-glass border border-white/10 text-left transition-all duration-500 ease-editorial hover:border-white/30 hover:shadow-glass focus-visible:border-white/60"
            >
              <SmartImage
                src={image.imageUrl}
                blurDataUrl={image.blurDataUrl}
                alt={image.alt || image.title}
                aspect={aspect}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.05]"
                overlay={
                  <>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 scrim-bottom"
                    />
                    {image.category && (
                      <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/25 bg-black/45 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-widest2 text-white/80 backdrop-blur-md">
                        {image.category}
                      </span>
                    )}
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5">
                      <span className="font-display text-fluid-sm leading-snug text-white">
                        {image.title}
                      </span>
                      <span className="translate-y-1 font-mono text-[0.6rem] uppercase tracking-widest2 text-white/0 transition-all duration-500 group-hover:translate-y-0 group-hover:text-white/55">
                        View frame
                      </span>
                    </span>
                  </>
                }
              />
            </button>
          </motion.li>
        ))}
      </motion.ul>

      <Lightbox
        images={lightboxImages}
        index={activeIndex}
        onClose={close}
        onNavigate={setActiveIndex}
      />
    </div>
  );
}
