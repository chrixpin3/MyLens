"use client";

import { useMemo, useState } from "react";
import { AdminCard, AdminHeader, useAdminAction, apiFetch } from "@/components/admin/AdminUI";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Button } from "@/components/ui/Button";
import { Chip, Field, Input, Textarea } from "@/components/ui/Field";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import { DEFAULT_CONFIG } from "@/lib/defaults";
import type { SiteConfigData, StatEntry, TimelineEntry } from "@/types";

export function SettingsForm({ initial }: { initial: SiteConfigData }) {
  const [config, setConfig] = useState<SiteConfigData>(initial);
  const [stats, setStats] = useState<StatEntry[]>(initial.stats.length ? initial.stats : DEFAULT_CONFIG.stats);
  const [skills, setSkills] = useState<string[]>(initial.skills);
  const [skillDraft, setSkillDraft] = useState("");
  const [experience, setExperience] = useState<TimelineEntry[]>(initial.experience);
  const { perform, saving } = useAdminAction();

  const patch = (next: Partial<SiteConfigData>) => setConfig((c) => ({ ...c, ...next }));

  const dirty = useMemo(
    () => JSON.stringify({ config, stats, skills, experience }) !== JSON.stringify({
      config: initial,
      stats: initial.stats,
      skills: initial.skills,
      experience: initial.experience,
    }),
    [config, stats, skills, experience, initial],
  );

  const addSkill = () => {
    const value = skillDraft.trim();
    if (!value || skills.includes(value)) return;
    setSkills([...skills, value]);
    setSkillDraft("");
  };

  const save = () =>
    perform(
      () =>
        apiFetch<SiteConfigData>("/api/admin/config", {
          method: "PUT",
          body: JSON.stringify({ ...config, stats, skills, experience }),
        }),
      { label: "Saving your studio details…", success: "Settings saved" },
    );

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title="Site settings"
        description="The identity of the studio — name, tagline, biography and the numbers shown across the site."
        onSave={save}
        saving={saving}
        dirty={dirty}
      />

      <AdminCard title="Identity">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Photographer / studio name" htmlFor="name" required>
            <Input
              id="name"
              value={config.photographerName}
              onChange={(e) => patch({ photographerName: e.target.value })}
              placeholder="Avery Stone"
            />
          </Field>
          <Field label="Tagline" htmlFor="tagline" hint="Shown under the hero headline.">
            <Input
              id="tagline"
              value={config.tagline}
              onChange={(e) => patch({ tagline: e.target.value })}
              placeholder="Honest frames. Quiet light."
            />
          </Field>
          <Field
            label="Short bio"
            htmlFor="shortBio"
            hint="One or two sentences — used for meta descriptions."
            className="sm:col-span-2"
          >
            <Textarea
              id="shortBio"
              rows={3}
              value={config.shortBio}
              onChange={(e) => patch({ shortBio: e.target.value })}
            />
          </Field>
          <Field
            label="Full biography"
            htmlFor="bio"
            hint="Blank line between paragraphs. Up to 20,000 characters."
            className="sm:col-span-2"
          >
            <Textarea
              id="bio"
              rows={10}
              value={config.bio}
              onChange={(e) => patch({ bio: e.target.value })}
              className="font-mono text-[0.82rem] leading-relaxed"
            />
          </Field>
          <Field label="Coverage area" htmlFor="coverage" hint="City, region, or 'worldwide'.">
            <Input
              id="coverage"
              value={config.coverageArea}
              onChange={(e) => patch({ coverageArea: e.target.value })}
              placeholder="Lisbon · Porto · Worldwide"
            />
          </Field>
          <Field
            label="Featured frames on home"
            htmlFor="featuredCount"
            hint="How many recent photographs the home page pulls."
          >
            <Input
              id="featuredCount"
              type="number"
              min={1}
              max={24}
              value={config.featuredCount}
              onChange={(e) => patch({ featuredCount: Number(e.target.value) || 6 })}
            />
          </Field>
        </div>
      </AdminCard>

      <AdminCard
        title="Images"
        description="Logo falls back to a typographic wordmark. Both are optional."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <MediaPicker
            label="Profile photograph"
            aspect="4 / 5"
            value={config.profileImage}
            onChange={(profileImage) => patch({ profileImage })}
            hint="Also used as the default OG/social share image."
          />
          <MediaPicker
            label="Logo"
            aspect="1 / 1"
            value={config.logo}
            onChange={(logo) => patch({ logo })}
          />
        </div>
      </AdminCard>

      <AdminCard
        title="Stats row"
        description="Up to three numbers work best in the hero band."
        actions={
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setStats([...stats, { label: "", value: "" }])}
            disabled={stats.length >= 12}
          >
            <PlusIcon className="h-3.5 w-3.5" /> Add stat
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Field label={`Label ${i + 1}`} htmlFor={`stat-label-${i}`}>
                <Input
                  id={`stat-label-${i}`}
                  value={stat.label}
                  onChange={(e) => {
                    const next = [...stats];
                    next[i] = { ...stat, label: e.target.value };
                    setStats(next);
                  }}
                  placeholder="Years experience"
                />
              </Field>
              <Field label={`Value ${i + 1}`} htmlFor={`stat-value-${i}`}>
                <Input
                  id={`stat-value-${i}`}
                  value={stat.value}
                  onChange={(e) => {
                    const next = [...stats];
                    next[i] = { ...stat, value: e.target.value };
                    setStats(next);
                  }}
                  placeholder="10"
                />
              </Field>
              <Button
                type="button"
                variant="danger"
                size="sm"
                aria-label={`Remove stat ${i + 1}`}
                onClick={() => setStats(stats.filter((_, idx) => idx !== i))}
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {stats.length === 0 && (
            <p className="text-sm text-white/35">No stats — the hero band will be hidden.</p>
          )}
        </div>
      </AdminCard>

      <AdminCard
        title="Skills & disciplines"
        description="Rendered as pills in the second zigzag block."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="group relative">
                <Chip as="span" className="pr-8">
                  {skill}
                </Chip>
                <button
                  type="button"
                  onClick={() => setSkills(skills.filter((s) => s !== skill))}
                  aria-label={`Remove ${skill}`}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-black/50 transition-colors hover:text-black"
                >
                  <TrashIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
            {skills.length === 0 && (
              <p className="text-sm text-white/35">No skills added yet.</p>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="e.g. Editorial"
              aria-label="New skill"
            />
            <Button type="button" variant="secondary" onClick={addSkill}>
              Add
            </Button>
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title="Experience timeline"
        description="Shown on the home page and the about page."
        actions={
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              setExperience([
                ...experience,
                { period: "", role: "", place: "", description: "" },
              ])
            }
          >
            <PlusIcon className="h-3.5 w-3.5" /> Add entry
          </Button>
        }
      >
        <div className="flex flex-col gap-6">
          {experience.map((entry, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-glass-sm border border-white/8 p-4 sm:p-5"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow text-white/35">Entry {i + 1}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  aria-label={`Remove entry ${i + 1}`}
                  onClick={() => setExperience(experience.filter((_, idx) => idx !== i))}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Period" htmlFor={`exp-period-${i}`}>
                  <Input
                    id={`exp-period-${i}`}
                    value={entry.period}
                    onChange={(e) => {
                      const next = [...experience];
                      next[i] = { ...entry, period: e.target.value };
                      setExperience(next);
                    }}
                    placeholder="2019 — now"
                  />
                </Field>
                <Field label="Role" htmlFor={`exp-role-${i}`}>
                  <Input
                    id={`exp-role-${i}`}
                    value={entry.role}
                    onChange={(e) => {
                      const next = [...experience];
                      next[i] = { ...entry, role: e.target.value };
                      setExperience(next);
                    }}
                    placeholder="Independent Photographer"
                  />
                </Field>
                <Field label="Place" htmlFor={`exp-place-${i}`} className="sm:col-span-2">
                  <Input
                    id={`exp-place-${i}`}
                    value={entry.place ?? ""}
                    onChange={(e) => {
                      const next = [...experience];
                      next[i] = { ...entry, place: e.target.value };
                      setExperience(next);
                    }}
                    placeholder="Lisbon"
                  />
                </Field>
                <Field
                  label="Description"
                  htmlFor={`exp-desc-${i}`}
                  className="sm:col-span-2"
                >
                  <Textarea
                    id={`exp-desc-${i}`}
                    rows={3}
                    value={entry.description ?? ""}
                    onChange={(e) => {
                      const next = [...experience];
                      next[i] = { ...entry, description: e.target.value };
                      setExperience(next);
                    }}
                  />
                </Field>
              </div>
            </div>
          ))}
          {experience.length === 0 && (
            <p className="text-sm text-white/35">
              No timeline entries — the experience section is hidden.
            </p>
          )}
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
