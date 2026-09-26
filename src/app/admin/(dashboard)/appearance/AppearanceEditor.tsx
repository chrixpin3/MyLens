"use client";

import { useMemo, useState } from "react";
import { AdminCard, AdminHeader, apiFetch, useAdminAction } from "@/components/admin/AdminUI";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Toggle } from "@/components/ui/Field";
import type { SiteConfigData } from "@/types";

const SECTION_LABELS: Record<string, { label: string; hint: string }> = {
  stats: { label: "Hero stats row", hint: "The three numbers under the hero headline." },
  aboutZigzag: { label: "About zigzag", hint: "The alternating photo/text intro." },
  skills: { label: "Skills pills", hint: "The second zigzag block with the discipline tags." },
  experience: { label: "Experience timeline", hint: "Only appears if you have timeline entries." },
  services: { label: "Services grid", hint: "The service cards on the home page." },
  featured: { label: "Featured gallery", hint: "The most recent or pinned frames." },
  ctaBand: { label: "Call-to-action band", hint: "The closing 'let's work together' panel." },
};

export function AppearanceEditor({ initial }: { initial: SiteConfigData }) {
  const [hero, setHero] = useState(initial.hero);
  const [sections, setSections] = useState(initial.sections);
  const { perform, saving } = useAdminAction();

  const dirty = useMemo(
    () => JSON.stringify({ hero, sections }) !== JSON.stringify({ hero: initial.hero, sections: initial.sections }),
    [hero, sections, initial],
  );

  const save = () =>
    perform(
      () =>
        apiFetch<SiteConfigData>("/api/admin/config", {
          method: "PUT",
          body: JSON.stringify({ ...initial, hero, sections }),
        }),
      { label: "Saving your layout…", success: "Appearance saved" },
    );

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title="Appearance"
        description="Choose the hero treatment and switch individual home-page sections on or off. Everything stays greyscale — the design has no colour accents by design."
        onSave={save}
        saving={saving}
        dirty={dirty}
      />

      <AdminCard title="Hero media">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <Field label="Media type" htmlFor="hero-type">
              <Select
                id="hero-type"
                value={hero.mediaType}
                onChange={(e) =>
                  setHero((h) => ({ ...h, mediaType: e.target.value as "image" | "video" }))
                }
              >
                <option value="image" className="bg-ink-900">
                  Still image
                </option>
                <option value="video" className="bg-ink-900">
                  Looping video
                </option>
              </Select>
            </Field>

            <Field
              label="Video URL"
              htmlFor="hero-video"
              hint="MP4 or WebM. A hosted URL works best; the site falls back to the image if it fails to load."
            >
              <Input
                id="hero-video"
                value={hero.videoUrl}
                onChange={(e) => setHero((h) => ({ ...h, videoUrl: e.target.value }))}
                placeholder="https://res.cloudinary.com/…/hero.mp4"
              />
            </Field>

            <Field label="Text alignment" htmlFor="hero-align">
              <Select
                id="hero-align"
                value={hero.align}
                onChange={(e) => setHero((h) => ({ ...h, align: e.target.value as "left" | "center" }))}
              >
                <option value="left" className="bg-ink-900">
                  Left
                </option>
                <option value="center" className="bg-ink-900">
                  Centre
                </option>
              </Select>
            </Field>

            <Field
              label={`Overlay strength — ${hero.overlay}%`}
              htmlFor="hero-overlay"
              hint="Higher values keep the type legible over busy photographs."
            >
              <input
                id="hero-overlay"
                type="range"
                min={0}
                max={100}
                value={hero.overlay}
                onChange={(e) => setHero((h) => ({ ...h, overlay: Number(e.target.value) }))}
                className="w-full accent-white"
              />
            </Field>

            {hero.mediaType === "video" && (
              <Toggle
                id="hero-autoplay"
                checked={hero.autoplayVideo}
                onChange={(autoplayVideo) => setHero((h) => ({ ...h, autoplayVideo }))}
                label="Autoplay and loop"
                description="Muted autoplay is the only kind browsers allow."
              />
            )}
          </div>

          <div className="flex flex-col gap-5">
            <MediaPicker
              label="Hero image"
              aspect="16 / 9"
              value={hero.image}
              onChange={(image) => setHero((h) => ({ ...h, image }))}
            />
            <MediaPicker
              label="Video poster frame"
              aspect="16 / 9"
              value={hero.poster}
              onChange={(poster) => setHero((h) => ({ ...h, poster }))}
              hint="Shown while the video loads, and on reduced-motion devices."
            />
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title="Home page sections"
        description="Hide anything that does not apply to this photographer. Hidden sections keep their content in the database."
      >
        <div className="flex flex-col gap-5">
          {Object.entries(SECTION_LABELS).map(([key, meta]) => (
            <div key={key} className="rounded-glass-sm border border-white/8 p-4 sm:p-5">
              <Toggle
                id={`section-${key}`}
                checked={sections[key as keyof typeof sections]}
                onChange={(visible) =>
                  setSections((s) => ({ ...s, [key]: visible }))
                }
                label={meta.label}
                description={meta.hint}
              />
            </div>
          ))}
        </div>
      </AdminCard>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button type="button" onClick={save} disabled={saving} size="lg">
          {saving ? "Saving…" : "Save appearance"}
        </Button>
      </div>
    </div>
  );
}
