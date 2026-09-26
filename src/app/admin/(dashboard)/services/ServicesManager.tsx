"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AdminCard, AdminHeader, apiFetch, useAdminAction } from "@/components/admin/AdminUI";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea, Toggle } from "@/components/ui/Field";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CloseIcon,
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  PlusIcon,
  TrashIcon,
  getServiceIcon,
} from "@/components/ui/icons";
import { SERVICE_ICON_OPTIONS } from "@/components/admin/serviceIcons";
import type { ServiceData } from "@/types";

const emptyDraft = (order: number): Partial<ServiceData> => ({
  title: "",
  description: "",
  image: null,
  ctaText: "Enquire",
  ctaLink: "/contact",
  icon: "aperture",
  order,
  active: true,
});

export function ServicesManager({ initial }: { initial: ServiceData[] }) {
  const [services, setServices] = useState<ServiceData[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<ServiceData>>(emptyDraft(0));
  const { perform, saving } = useAdminAction();

  useEffect(() => {
    setServices(initial);
  }, [initial]);

  const openCreate = () => {
    setEditingId("new");
    setDraft(emptyDraft(services.length));
  };

  const openEdit = (service: ServiceData) => {
    setEditingId(service._id);
    setDraft({ ...service });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeEditor = () => {
    setEditingId(null);
    setDraft(emptyDraft(services.length));
  };

  const saveDraft = () =>
    perform(
      async () => {
        if (editingId === "new") {
          const created = await apiFetch<ServiceData>("/api/admin/services", {
            method: "POST",
            body: JSON.stringify(draft),
          });
          setServices((list) =>
            [...list, created].sort((a, b) => a.order - b.order),
          );
        } else if (editingId) {
          const updated = await apiFetch<ServiceData>("/api/admin/services", {
            method: "PUT",
            body: JSON.stringify({ ...draft, id: editingId }),
          });
          setServices((list) => list.map((s) => (s._id === editingId ? updated : s)));
        }
      },
      {
        label: "Unzipping your service…",
        success: editingId === "new" ? "Service created" : "Service updated",
      },
    ).then(() => {
      if (editingId) closeEditor();
    });

  const remove = (service: ServiceData) => {
    if (!window.confirm(`Delete "${service.title}"? This cannot be undone.`)) return;
    void perform(
      () => apiFetch(`/api/admin/services?id=${service._id}`, { method: "DELETE" }),
      {
        label: "Removing the service…",
        success: "Service deleted",
        refresh: false,
      },
    ).then((result) => {
      if (result !== null) {
        setServices((list) => list.filter((s) => s._id !== service._id));
      }
    });
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= services.length) return;
    const next = [...services];
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((s, i) => ({ ...s, order: i }));
    setServices(reordered);

    // A swap touches two rows, so the whole new sequence goes in one write.
    const result = await perform(
      () =>
        apiFetch("/api/admin/services", {
          method: "PATCH",
          body: JSON.stringify({
            items: reordered.map((s) => ({ id: s._id, order: s.order })),
          }),
        }),
      { label: "Reordering…", success: "Order updated", refresh: false },
    );
    if (result === null) setServices(services); // roll back on failure
  };

  const toggleActive = (service: ServiceData) => {
    const next = !service.active;
    setServices((list) =>
      list.map((s) => (s._id === service._id ? { ...s, active: next } : s)),
    );
    void perform(
      () =>
        apiFetch("/api/admin/services", {
          method: "PUT",
          body: JSON.stringify({ id: service._id, active: next }),
        }),
      { success: next ? "Service published" : "Service hidden", refresh: false },
    );
  };

  const editing = editingId !== null;

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title="Services"
        description="Cards shown on the home page and detailed on the services page. Order here is the order everywhere."
      >
        <Button type="button" onClick={openCreate} disabled={editing}>
          <PlusIcon className="h-4 w-4" /> New service
        </Button>
      </AdminHeader>

      <AnimatePresence mode="popLayout">
        {editing && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <AdminCard
              title={editingId === "new" ? "New service" : "Edit service"}
              actions={
                <Button type="button" size="sm" variant="ghost" onClick={closeEditor}>
                  <CloseIcon className="h-3.5 w-3.5" /> Close
                </Button>
              }
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
                <div className="flex flex-col gap-5">
                  <Field label="Title" htmlFor="svc-title" required>
                    <Input
                      id="svc-title"
                      value={draft.title ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                      placeholder="Wedding photography"
                    />
                  </Field>
                  <Field
                    label="Description"
                    htmlFor="svc-desc"
                    hint="Blank lines are preserved on the services page."
                  >
                    <Textarea
                      id="svc-desc"
                      rows={6}
                      value={draft.description ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                    />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Button text" htmlFor="svc-cta">
                      <Input
                        id="svc-cta"
                        value={draft.ctaText ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, ctaText: e.target.value }))}
                        placeholder="Enquire"
                      />
                    </Field>
                    <Field label="Button link" htmlFor="svc-link" hint="Path or full URL.">
                      <Input
                        id="svc-link"
                        value={draft.ctaLink ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, ctaLink: e.target.value }))}
                        placeholder="/contact"
                      />
                    </Field>
                  </div>
                  <Toggle
                    id="svc-active"
                    checked={draft.active ?? true}
                    onChange={(active) => setDraft((d) => ({ ...d, active }))}
                    label="Visible on the site"
                    description="Hidden services stay saved but are not rendered."
                  />
                </div>

                <div className="flex flex-col gap-5">
                  <Field label="Icon" htmlFor="svc-icon" hint="Used when no image is set.">
                    <Select
                      id="svc-icon"
                      value={draft.icon ?? "aperture"}
                      onChange={(e) => setDraft((d) => ({ ...d, icon: e.target.value }))}
                    >
                      {SERVICE_ICON_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-ink-900">
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <MediaPicker
                    label="Card image"
                    aspect="16 / 10"
                    value={draft.image ?? null}
                    onChange={(image) => setDraft((d) => ({ ...d, image }))}
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Button type="button" onClick={saveDraft} disabled={saving || !draft.title}>
                  {saving ? "Saving…" : editingId === "new" ? "Create service" : "Save service"}
                </Button>
                <Button type="button" variant="ghost" onClick={closeEditor}>
                  Cancel
                </Button>
              </div>
            </AdminCard>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminCard title={`${services.length} service${services.length === 1 ? "" : "s"}`}>
        {services.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="text-sm text-white/40">
              No services yet. Create one and it appears on the home page and the services page.
            </p>
            <Button type="button" size="sm" onClick={openCreate}>
              <PlusIcon className="h-3.5 w-3.5" /> Create the first service
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {services.map((service, i) => {
              const Icon = getServiceIcon(service.icon);
              return (
                <li
                  key={service._id}
                  className="group flex flex-col gap-4 rounded-glass-sm border border-white/8 p-4 transition-colors hover:border-white/20 sm:flex-row sm:items-center sm:p-5"
                >
                  <span
                    aria-hidden
                    className="font-mono text-[0.65rem] uppercase tracking-widest2 text-white/25"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 text-white/60">
                    {service.image?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={service.image.url}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span
                      className={`truncate text-sm ${service.active ? "text-white" : "text-white/35 line-through"}`}
                    >
                      {service.title}
                    </span>
                    <span className="truncate text-xs text-white/35">
                      {service.description || "No description"}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => void move(i, -1)}
                      disabled={i === 0}
                      aria-label={`Move ${service.title} up`}
                    >
                      <ArrowLeftIcon className="h-3.5 w-3.5 -rotate-90" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => void move(i, 1)}
                      disabled={i === services.length - 1}
                      aria-label={`Move ${service.title} down`}
                    >
                      <ArrowRightIcon className="h-3.5 w-3.5 -rotate-90" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleActive(service)}
                      aria-label={service.active ? `Hide ${service.title}` : `Show ${service.title}`}
                      title={service.active ? "Visible" : "Hidden"}
                    >
                      {service.active ? (
                        <EyeIcon className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOffIcon className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => openEdit(service)}
                      aria-label={`Edit ${service.title}`}
                    >
                      <EditIcon className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => remove(service)}
                      aria-label={`Delete ${service.title}`}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>

      <p className="text-center font-mono text-[0.65rem] uppercase tracking-widest2 text-white/25">
        {services.length > 0
          ? `${services.filter((s) => s.active).length} published`
          : "Nothing published yet"}
      </p>
    </div>
  );
}
