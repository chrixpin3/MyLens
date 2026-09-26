"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface LightboxImage {
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

export interface LightboxProps {
  images: LightboxImage[];
  /** Index into `images`, or -1 when closed. */
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

/**
 * Glass lightbox: full image plus a white description panel beneath it.
 * Fully keyboard driven — Escape closes, ← / → step through the set, Tab is
 * trapped inside the dialog, and focus returns to the trigger on close.
 */
export function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const open = index >= 0 && index < images.length;
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const go = useCallback(
    (delta: number) => {
      if (!open) return;
      const next = (index + delta + images.length) % images.length;
      onNavigate(next);
    },
    [index, images.length, onNavigate, open],
  );

  // Remember what had focus so we can hand it back on close.
  useEffect(() => {
    if (open) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
    } else {
      restoreFocusRef.current?.focus?.();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    }, 40);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
    };
  }, [open, go, onClose]);

  const image = open ? images[index] : null;

  return (
    <AnimatePresence>
      {open && image && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/88 p-3 backdrop-blur-lg sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${image.title} — photograph ${index + 1} of ${images.length}`}
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="glass glass-lg relative my-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-glass-lg"
          >
            {/* close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close viewer"
              className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
            >
              <CloseIcon className="h-5 w-5" />
            </button>

            {/* prev / next */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous photograph"
                  className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next photograph"
                  className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
                >
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </>
            )}

            {/* image */}
            <div className="relative bg-black">
              <AnimatePresence mode="wait">
                <motion.div
                  key={image._id}
                  initial={{ opacity: 0, scale: 1.01 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.alt || image.title}
                    width={image.width}
                    height={image.height}
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="max-h-[74svh] w-full object-contain"
                    placeholder={image.blurDataUrl ? "blur" : "empty"}
                    blurDataURL={image.blurDataUrl}
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* description panel — white, per the editorial lightbox design */}
            <div className="flex flex-col gap-4 bg-white px-6 py-7 text-black sm:px-9 sm:py-9">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h2 className="font-display text-fluid-xl leading-tight">{image.title}</h2>
                <div className="flex items-center gap-4 font-mono text-[0.65rem] uppercase tracking-widest2 text-black/40">
                  {image.category && <span>{image.category}</span>}
                  <span>
                    {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <div className="rule-fade !bg-black/12" />
              <p
                className={cn(
                  "max-w-3xl text-pretty text-[0.95rem] leading-relaxed text-black/70",
                  !image.description && "italic text-black/35",
                )}
              >
                {image.description || "No description provided for this frame yet."}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
