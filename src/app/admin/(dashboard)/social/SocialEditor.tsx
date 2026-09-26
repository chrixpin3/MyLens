"use client";

import { useMemo, useState } from "react";
import { AdminCard, AdminHeader, apiFetch, useAdminAction } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Toggle } from "@/components/ui/Field";
import { EyeIcon, PlusIcon, TrashIcon, getSocialIcon } from "@/components/ui/icons";
import { SOCIAL_PLATFORMS, type NavItem, type SiteConfigData, type SocialLink } from "@/types";

export function SocialEditor({ initial }: { initial: SiteConfigData }) {
  const [social, setSocial] = useState<SocialLink[]>(initial.social);
  const [nav, setNav] = useState<NavItem[]>(initial.nav);
  const { perform, saving } = useAdminAction();

  const dirty = useMemo(
    () => JSON.stringify({ social, nav }) !== JSON.stringify({ social: initial.social, nav: initial.nav }),
    [social, nav, initial],
  );

  const update = (i: number, next: Partial<SocialLink>) =>
    setSocial((list) => list.map((item, idx) => (idx === i ? { ...item, ...next } : item)));

  const updateNav = (i: number, next: Partial<NavItem>) =>
    setNav((list) => list.map((item, idx) => (idx === i ? { ...item, ...next } : item)));

  const addPlatform = () => {
    const unused = SOCIAL_PLATFORMS.find((p) => !social.some((s) => s.platform === p.id));
    setSocial([
      ...social,
      {
        platform: unused?.id ?? "link",
        label: unused?.label ?? "Link",
        url: "",
        visible: true,
      },
    ]);
  };

  const save = () =>
    perform(
      () =>
        apiFetch<SiteConfigData>("/api/admin/config", {
          method: "PUT",
          body: JSON.stringify({ ...initial, social, nav }),
        }),
      { label: "Saving your links…", success: "Links saved" },
    );

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title="Social & menu"
        description="Social profiles appear in the header and footer. A link with an empty URL is hidden automatically — toggles give you explicit control on top of that."
        onSave={save}
        saving={saving}
        dirty={dirty}
      />

      <AdminCard
        title="Social profiles"
        actions={
          <Button type="button" size="sm" variant="secondary" onClick={addPlatform}>
            <PlusIcon className="h-3.5 w-3.5" /> Add platform
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          {social.map((item, i) => {
            const Icon = getSocialIcon(item.platform);
            const known = SOCIAL_PLATFORMS.find((p) => p.id === item.platform);
            return (
              <div
                key={`${item.platform}-${i}`}
                className="grid items-end gap-3 rounded-glass-sm border border-white/8 p-4 sm:grid-cols-[auto_10rem_1fr_auto_auto] sm:p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white/70">
                  <Icon className="h-4 w-4" />
                </span>

                <Field label="Platform" htmlFor={`platform-${i}`}>
                  <Select
                    id={`platform-${i}`}
                    value={item.platform}
                    onChange={(e) => {
                      const next = SOCIAL_PLATFORMS.find((p) => p.id === e.target.value);
                      update(i, {
                        platform: e.target.value,
                        label: item.label || next?.label || "",
                      });
                    }}
                  >
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p.id} value={p.id} className="bg-ink-900">
                        {p.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Profile URL" htmlFor={`url-${i}`} hint={known ? undefined : "Custom link"}>
                  <Input
                    id={`url-${i}`}
                    value={item.url}
                    onChange={(e) => update(i, { url: e.target.value })}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </Field>

                <div className="flex items-center gap-2 pb-1">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${item.label || item.platform} profile in a new tab`}
                      title="Open link"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/14 text-white/60 transition-colors hover:border-white/40 hover:text-white"
                    >
                      <EyeIcon className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span
                      aria-hidden
                      title="Add a URL to preview it"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/8 text-white/20"
                    >
                      <EyeIcon className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    aria-label={`Remove ${item.label || item.platform}`}
                    onClick={() => setSocial(social.filter((_, idx) => idx !== i))}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="sm:col-span-5">
                  <Toggle
                    id={`visible-${i}`}
                    checked={item.visible}
                    onChange={(visible) => update(i, { visible })}
                    label="Show in header and footer"
                  />
                </div>
              </div>
            );
          })}
          {social.length === 0 && (
            <p className="text-sm text-white/35">No social profiles yet.</p>
          )}
        </div>
      </AdminCard>

      <AdminCard
        title="Navigation menu"
        description="Labels and destinations for the header, the mobile panel and the footer. Hide an item instead of deleting it to preserve the order."
      >
        <div className="flex flex-col gap-3">
          {nav.map((item, i) => (
            <div
              key={i}
              className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto] sm:gap-4"
            >
              <Field label="Label" htmlFor={`nav-label-${i}`}>
                <Input
                  id={`nav-label-${i}`}
                  value={item.label}
                  onChange={(e) => updateNav(i, { label: e.target.value })}
                  placeholder="Gallery"
                />
              </Field>
              <Field label="Destination" htmlFor={`nav-href-${i}`}>
                <Input
                  id={`nav-href-${i}`}
                  value={item.href}
                  onChange={(e) => updateNav(i, { href: e.target.value })}
                  placeholder="/gallery"
                />
              </Field>
              <div className="flex items-center gap-2 pb-1">
                <Button
                  type="button"
                  size="sm"
                  variant={item.visible ? "secondary" : "ghost"}
                  aria-pressed={item.visible}
                  onClick={() => updateNav(i, { visible: !item.visible })}
                >
                  {item.visible ? "Shown" : "Hidden"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  aria-label={`Remove ${item.label}`}
                  onClick={() => setNav(nav.filter((_, idx) => idx !== i))}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {nav.length === 0 && <p className="text-sm text-white/35">No menu items.</p>}
          <div className="pt-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setNav([...nav, { label: "", href: "/", visible: true }])}
            >
              <PlusIcon className="h-3.5 w-3.5" /> Add menu item
            </Button>
          </div>
        </div>
      </AdminCard>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button type="button" onClick={save} disabled={saving} size="lg">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
