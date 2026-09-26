"use client";

import { useMemo, useState } from "react";
import { AdminCard, AdminHeader, apiFetch, useAdminAction } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { MailIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";
import type { ContactInfo, SiteConfigData } from "@/types";

export function ContactForm_({ initial }: { initial: SiteConfigData }) {
  const [contact, setContact] = useState<ContactInfo>(initial.contact);
  const [cta, setCta] = useState(initial.cta);
  const { perform, saving } = useAdminAction();

  const set = <K extends keyof ContactInfo>(key: K, value: ContactInfo[K]) =>
    setContact((c) => ({ ...c, [key]: value }));

  const dirty = useMemo(
    () => JSON.stringify({ contact, cta }) !== JSON.stringify({ contact: initial.contact, cta: initial.cta }),
    [contact, cta, initial],
  );

  const waDigits = contact.whatsapp.replace(/\D/g, "");
  const waPreview = waDigits ? `https://wa.me/${waDigits}` : "Add a number to generate the link";

  const save = () =>
    perform(
      () =>
        apiFetch<SiteConfigData>("/api/admin/config", {
          method: "PUT",
          body: JSON.stringify({ ...initial, contact, cta }),
        }),
      { label: "Saving contact details…", success: "Contact details saved" },
    );

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title="Contact info"
        description="Where enquiries are sent and how clients reach you. The contact form writes to the studio inbox and emails these details when RESEND_API_KEY is set."
        onSave={save}
        saving={saving}
        dirty={dirty}
      />

      <AdminCard title="Direct lines">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Email" htmlFor="email" hint="Where enquiries are delivered.">
            <Input
              id="email"
              type="email"
              value={contact.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="hello@studio.com"
            />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input
              id="phone"
              value={contact.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+351 900 000 000"
            />
          </Field>
          <Field
            label="WhatsApp number"
            htmlFor="whatsapp"
            hint="Digits only. The wa.me link is generated automatically."
          >
            <Input
              id="whatsapp"
              value={contact.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder="+351 900 000 000"
            />
          </Field>
          <Field label="Generated WhatsApp link" htmlFor="wa-preview">
            <Input id="wa-preview" value={waPreview} readOnly className="opacity-60" />
          </Field>
        </div>

        <ul className="mt-6 flex flex-wrap gap-2">
          {contact.email && (
            <li className="flex items-center gap-2 rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/60">
              <MailIcon className="h-3.5 w-3.5" /> {contact.email}
            </li>
          )}
          {contact.phone && (
            <li className="flex items-center gap-2 rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/60">
              <PhoneIcon className="h-3.5 w-3.5" /> {contact.phone}
            </li>
          )}
          {waDigits && (
            <li className="flex items-center gap-2 rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/60">
              <WhatsAppIcon className="h-3.5 w-3.5" /> wa.me/{waDigits}
            </li>
          )}
        </ul>
      </AdminCard>

      <AdminCard
        title="Studio location"
        description="Address text, plus an optional embedded map. Maps are forced to greyscale in the UI."
      >
        <div className="grid gap-6">
          <Field label="Address" htmlFor="address">
            <Textarea
              id="address"
              rows={2}
              value={contact.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Rua do Norte 21, Lisbon, Portugal"
            />
          </Field>
          <Field
            label="Map embed URL"
            htmlFor="mapEmbed"
            hint="Google Maps → Share → Embed a map → copy the src URL only."
          >
            <Input
              id="mapEmbed"
              value={contact.mapEmbedUrl ?? ""}
              onChange={(e) => set("mapEmbedUrl", e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=…"
            />
          </Field>
          <Field label="Map link" htmlFor="mapUrl" hint="Opened when someone taps the address.">
            <Input
              id="mapUrl"
              value={contact.mapUrl ?? ""}
              onChange={(e) => set("mapUrl", e.target.value)}
              placeholder="https://maps.app.goo.gl/…"
            />
          </Field>
        </div>

        {contact.mapEmbedUrl && (
          <div className="mt-6 overflow-hidden rounded-glass-sm border border-white/10">
            <iframe
              src={contact.mapEmbedUrl}
              title="Map preview"
              loading="lazy"
              className="h-64 w-full"
              style={{ border: 0, filter: "grayscale(1) contrast(1.1)" }}
            />
          </div>
        )}
      </AdminCard>

      <AdminCard
        title="Call to action band"
        description="The closing band on the home page and the button in the header."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Headline" htmlFor="cta-headline" className="sm:col-span-2">
            <Input
              id="cta-headline"
              value={cta.headline}
              onChange={(e) => setCta({ ...cta, headline: e.target.value })}
            />
          </Field>
          <Field label="Sub-headline" htmlFor="cta-sub" className="sm:col-span-2">
            <Textarea
              id="cta-sub"
              rows={2}
              value={cta.subhead}
              onChange={(e) => setCta({ ...cta, subhead: e.target.value })}
            />
          </Field>
          <Field label="Primary button text" htmlFor="cta-primary-text">
            <Input
              id="cta-primary-text"
              value={cta.primaryText}
              onChange={(e) => setCta({ ...cta, primaryText: e.target.value })}
              placeholder="Book a session"
            />
          </Field>
          <Field label="Primary button link" htmlFor="cta-primary-link" hint="Path or full URL.">
            <Input
              id="cta-primary-link"
              value={cta.primaryHref}
              onChange={(e) => setCta({ ...cta, primaryHref: e.target.value })}
              placeholder="/contact"
            />
          </Field>
          <Field label="Secondary button text" htmlFor="cta-secondary-text">
            <Input
              id="cta-secondary-text"
              value={cta.secondaryText}
              onChange={(e) => setCta({ ...cta, secondaryText: e.target.value })}
              placeholder="See the work"
            />
          </Field>
          <Field label="Secondary button link" htmlFor="cta-secondary-link">
            <Input
              id="cta-secondary-link"
              value={cta.secondaryHref}
              onChange={(e) => setCta({ ...cta, secondaryHref: e.target.value })}
              placeholder="/gallery"
            />
          </Field>
        </div>
      </AdminCard>

      <div className="flex items-center gap-3 rounded-glass border border-white/8 px-5 py-4 text-xs text-white/40">
        <MapPinIcon className="h-4 w-4 shrink-0" />
        Coverage area text is edited under Site settings.
      </div>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button type="button" onClick={save} disabled={saving} size="lg">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
