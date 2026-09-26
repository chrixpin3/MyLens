"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { AdminCard, AdminHeader, apiFetch, useAdminAction } from "@/components/admin/AdminUI";
import { GalleryUploader } from "./GalleryUploader";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Toggle } from "@/components/ui/Field";
import { Chip } from "@/components/ui/Field";
import {
  CloseIcon,
  EditIcon,
  GripIcon,
  StarIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { cn, formatDate } from "@/lib/utils";
import type { GalleryImageData } from "@/types";

export function GalleryManager({
  initial,
  categories,
}: {
  initial: GalleryImageData[];
  categories: string[];
}) {
  const [images, setImages] = useState<GalleryImageData[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<GalleryImageData>>({});
  const [filter, setFilter] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const { perform, saving } = useAdminAction();

  // The page is dynamic, so router.refresh() delivers a fresh `initial` after an
  // upload — adopt it, but never clobber local edits that have not been saved yet.
  useEffect(() => {
    setImages(initial);
  }, [initial]);

  const visible = useMemo(
    () => (filter ? images.filter((img) => img.category === filter) : images),
    [images, filter],
  );

  const openEdit = (image: GalleryImageData) => {
    setEditingId(image._id);
    setDraft({ ...image });
  };

  const closeEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const saveEdit = () =>
    perform(
      async () => {
        if (!editingId) return;
        const updated = await apiFetch<GalleryImageData>("/api/admin/gallery", {
          method: "PUT",
          body: JSON.stringify({
            id: editingId,
            title: draft.title,
            description: draft.description,
            alt: draft.alt,
            category: draft.category,
            pinned: draft.pinned,
          }),
        });
        setImages((list) => list.map((img) => (img._id === editingId ? updated : img)));
      },
      { label: "Saving image details…", success: "Image updated" },
    ).then(() => {
      if (editingId) closeEdit();
    });

  const togglePin = (image: GalleryImageData) => {
    const pinned = !image.pinned;
    setImages((list) => list.map((i) => (i._id === image._id ? { ...i, pinned } : i)));
    void perform(
      () =>
        apiFetch("/api/admin/gallery", {
          method: "PUT",
          body: JSON.stringify({ id: image._id, pinned }),
        }),
      { success: pinned ? "Pinned to the top" : "Unpinned", refresh: false },
    );
  };

  const remove = (image: GalleryImageData) => {
    if (!window.confirm(`Delete "${image.title}"? The Cloudinary asset is removed too.`)) return;
    void perform(
      () => apiFetch(`/api/admin/gallery?id=${image._id}`, { method: "DELETE" }),
      { label: "Removing the image…", success: "Image deleted", refresh: false },
    ).then((result) => {
      if (result !== null) setImages((list) => list.filter((i) => i._id !== image._id));
    });
  };

  /** Native HTML5 drag-and-drop reordering, with a keyboard fallback. */
  const commitOrder = (reordered: GalleryImageData[]) => {
    const withOrder = reordered.map((img, i) => ({ ...img, order: i }));
    setImages(withOrder);
    void perform(
      () =>
        apiFetch("/api/admin/gallery", {
          method: "PATCH",
          body: JSON.stringify({
            items: withOrder.map((img) => ({ id: img._id, order: img.order })),
          }),
        }),
      { label: "Reordering the gallery…", success: "Order saved", refresh: false },
    );
  };

  const onDrop = (target: number) => {
    if (dragIndex === null || dragIndex === target) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...visible];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(target, 0, moved);

    // Merge back into the full list so the filter does not corrupt the order.
    const orderMap = new Map(next.map((img, i) => [img._id, i]));
    const merged = [...images]
      .sort((a, b) => (orderMap.get(a._id) ?? 0) - (orderMap.get(b._id) ?? 0))
      .map((img, i) => ({ ...img, order: i }));

    setDragIndex(null);
    setOverIndex(null);
    commitOrder(merged);
  };

  const nudge = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= visible.length) return;
    const next = [...visible];
    [next[index], next[target]] = [next[target], next[index]];
    const orderMap = new Map(next.map((img, i) => [img._id, i]));
    const merged = [...images]
      .sort((a, b) => (orderMap.get(a._id) ?? 0) - (orderMap.get(b._id) ?? 0))
      .map((img, i) => ({ ...img, order: i }));
    commitOrder(merged);
  };

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title="Gallery"
        description="Upload photographs, then refine titles, descriptions and categories. Drag a card to reorder; pinned frames float to the top everywhere on the site."
      >
        <Button
          type="button"
          variant="secondary"
          onClick={() => document.getElementById("uploader")?.scrollIntoView({ behavior: "smooth" })}
        >
          Upload images
        </Button>
      </AdminHeader>

      <div id="uploader">
        <AdminCard title="Upload" description="Multi-select or drag a batch in. Progress is real.">
          <GalleryUploader onComplete={() => setImages((list) => [...list])} />
        </AdminCard>
      </div>

      <AnimatePresence>
        {editingId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AdminCard
              title="Edit image"
              actions={
                <Button type="button" size="sm" variant="ghost" onClick={closeEdit}>
                  <CloseIcon className="h-3.5 w-3.5" /> Close
                </Button>
              }
            >
              <div className="grid gap-6 sm:grid-cols-[12rem_1fr]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-glass-sm border border-white/10">
                  {draft.imageUrl && (
                    <Image
                      src={draft.imageUrl}
                      alt={draft.alt || draft.title || ""}
                      fill
                      sizes="192px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  <Field
                    label="Title"
                    htmlFor="img-title"
                    required
                    hint="Overlaid at the bottom of the card."
                  >
                    <Input
                      id="img-title"
                      value={draft.title ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                    />
                  </Field>
                  <Field
                    label="Description"
                    htmlFor="img-desc"
                    hint="Shown in the white panel beneath the image in the lightbox."
                  >
                    <Textarea
                      id="img-desc"
                      rows={4}
                      value={draft.description ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Category" htmlFor="img-cat" hint="Groups the filter tabs.">
                      <Input
                        id="img-cat"
                        list="gallery-categories"
                        value={draft.category ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                        placeholder="Editorial"
                      />
                      <datalist id="gallery-categories">
                        {categories.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </Field>
                    <Field label="Alt text" htmlFor="img-alt" hint="Falls back to the title.">
                      <Input
                        id="img-alt"
                        value={draft.alt ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, alt: e.target.value }))}
                      />
                    </Field>
                  </div>
                  <Toggle
                    id="img-pin"
                    checked={draft.pinned ?? false}
                    onChange={(pinned) => setDraft((d) => ({ ...d, pinned }))}
                    label="Pin to the top"
                    description="Pinned frames lead the gallery and the home page."
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Button type="button" onClick={saveEdit} disabled={saving || !draft.title}>
                  {saving ? "Saving…" : "Save image"}
                </Button>
                <Button type="button" variant="ghost" onClick={closeEdit}>
                  Cancel
                </Button>
              </div>
            </AdminCard>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminCard
        title={`${images.length} image${images.length === 1 ? "" : "s"}`}
        description="Drag by the handle to reorder, or use the arrow buttons."
      >
        {categories.length > 0 && (
          <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
            <Chip active={filter === ""} onClick={() => setFilter("")}>
              All
            </Chip>
            {categories.map((cat) => (
              <Chip key={cat} active={filter === cat} onClick={() => setFilter(cat)}>
                {cat}
              </Chip>
            ))}
          </div>
        )}

        {images.length === 0 ? (
          <p className="py-10 text-center text-sm text-white/40">
            Nothing here yet — upload your first photographs above.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((image, i) => (
              <li
                key={image._id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragEnter={() => setOverIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                onDrop={() => onDrop(i)}
                className={cn(
                  "group relative flex flex-col gap-3 rounded-glass-sm border p-3 transition-all duration-300",
                  overIndex === i && dragIndex !== null && dragIndex !== i
                    ? "border-white bg-white/8"
                    : "border-white/8 hover:border-white/22",
                  image.pinned && "ring-1 ring-white/25",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    title="Drag to reorder"
                    className="cursor-grab text-white/25 transition-colors group-hover:text-white/55 active:cursor-grabbing"
                  >
                    <GripIcon className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-[0.6rem] uppercase tracking-widest2 text-white/30">
                    {String(image.order + 1).padStart(2, "0")}
                  </span>
                  {image.pinned && (
                    <span className="flex items-center gap-1 rounded-full border border-white/25 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-widest2 text-white/70">
                      <StarIcon className="h-2.5 w-2.5" /> Pinned
                    </span>
                  )}
                  <span className="ml-auto font-mono text-[0.58rem] uppercase tracking-widest2 text-white/25">
                    {formatDate(image.uploadedAt)}
                  </span>
                </div>

                <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-ink-900">
                  <Image
                    src={image.imageUrl}
                    alt={image.alt || image.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized={!image.imageUrl.includes("res.cloudinary.com")}
                  />
                  {image.category && (
                    <span className="absolute left-2 top-2 rounded-full border border-white/20 bg-black/55 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-widest2 text-white/75 backdrop-blur">
                      {image.category}
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm text-white">{image.title}</span>
                  <span className="truncate text-xs text-white/35">
                    {image.description || "No description yet"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => nudge(i, -1)}
                    disabled={i === 0}
                    aria-label={`Move ${image.title} earlier`}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => nudge(i, 1)}
                    disabled={i === visible.length - 1}
                    aria-label={`Move ${image.title} later`}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => togglePin(image)}
                    aria-label={image.pinned ? `Unpin ${image.title}` : `Pin ${image.title}`}
                    aria-pressed={image.pinned}
                  >
                    <StarIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => openEdit(image)}
                    aria-label={`Edit ${image.title}`}
                  >
                    <EditIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    className="ml-auto"
                    onClick={() => remove(image)}
                    aria-label={`Delete ${image.title}`}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
