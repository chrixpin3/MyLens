"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useGlobalLoader } from "@/components/zip/ZipLoaderProvider";
import { useToast } from "@/components/admin/Toast";
import { cn } from "@/lib/utils";

/** Page header with a consistent save action for admin sections. */
export function AdminHeader({
  title,
  description,
  onSave,
  saving,
  dirty,
  saveLabel = "Save changes",
  children,
}: {
  title: string;
  description?: string;
  /** Accepts the `perform(...)` helper, whose promise resolves to `T | null`. */
  onSave?: () => unknown;
  saving?: boolean;
  dirty?: boolean;
  saveLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-white/8 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2.5">
        <h1 className="text-fluid-2xl leading-tight">{title}</h1>
        {description && (
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-white/45">
            {description}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {children}
        {onSave && (
          <Button type="button" onClick={onSave} disabled={saving || (dirty === false)}>
            {saving ? "Saving…" : saveLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export function AdminCard({
  title,
  description,
  children,
  className,
  actions,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section
      className={cn("glass rounded-glass-lg p-6 sm:p-8", className)}
      {...(title ? { "aria-label": title } : {})}
    >
      {(title || actions) && (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            {title && <h2 className="text-fluid-lg leading-snug">{title}</h2>}
            {description && (
              <p className="max-w-xl text-pretty text-xs leading-relaxed text-white/40">
                {description}
              </p>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Wraps a mutation in the network-aware ZipLoader + toast feedback.
 * Every admin save goes through this so the UX is uniform.
 */
export function useAdminAction() {
  const router = useRouter();
  const loader = useGlobalLoader();
  const { notify } = useToast();
  const [saving, setSaving] = useState(false);

  async function perform<T>(
    task: () => Promise<T>,
    opts: { label?: string; success?: string; detail?: string; refresh?: boolean } = {},
  ): Promise<T | null> {
    setSaving(true);
    try {
      const result = await loader.run(task(), {
        label: opts.label ?? "Unzipping your changes…",
      });
      if (opts.success) notify(opts.success, "success", opts.detail);
      if (opts.refresh !== false) router.refresh();
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      notify("Could not save", "error", message);
      return null;
    } finally {
      setSaving(false);
    }
  }

  return { perform, saving, notify };
}

/** JSON fetch helper that throws the server's error message. */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    const fieldMsg = json?.fields ? Object.values(json.fields as Record<string, string>)[0] : null;
    throw new Error(fieldMsg || json?.error || `Request failed (${res.status})`);
  }
  return json.data as T;
}
