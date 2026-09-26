"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { CheckIcon, CloseIcon, UploadIcon } from "@/components/ui/icons";
import { inquirySchema, type InquiryInput, type InquiryOutput } from "@/lib/validation";
import { useGlobalLoader } from "@/components/zip/ZipLoaderProvider";
import { cn } from "@/lib/utils";

export function ContactForm({ services }: { services: string[] }) {
  const loader = useGlobalLoader();
  const [serverError, setServerError] = useState("");
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryInput, unknown, InquiryOutput>({
    resolver: zodResolver(inquirySchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: "",
      message: "",
      company: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");
    await loader.run(
      (async () => {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || "Something went wrong. Please try again.");
        }
        return json;
      })(),
      { label: "Sending your note…" },
    ).then(() => {
      setSent(true);
      reset();
    }).catch((err: unknown) => {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    });
  });

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start gap-5"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10">
          <CheckIcon className="h-5 w-5" />
        </div>
        <h3 className="text-fluid-xl">Message received</h3>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-white/55">
          Thank you — your note is in the studio inbox. Expect a reply within two working days.
        </p>
        <Button variant="outline" size="sm" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-glass-sm border border-white/25 bg-white/8 px-4 py-3 text-sm"
        >
          <CloseIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" required error={errors.name?.message}>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </Field>

        <Field label="Email" htmlFor="email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Phone"
          htmlFor="phone"
          hint="Optional"
          error={errors.phone?.message}
        >
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+351 …"
            {...register("phone")}
          />
        </Field>

        {services.length > 0 && (
          <Field label="Interested in" htmlFor="service" hint="Optional">
            <Select id="service" {...register("service")}>
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service} value={service} className="bg-ink-900">
                  {service}
                </option>
              ))}
              <option value="Something else" className="bg-ink-900">
                Something else
              </option>
            </Select>
          </Field>
        )}
      </div>

      <Field
        label="Message"
        htmlFor="message"
        required
        error={errors.message?.message}
        hint="Dates, location, what you have in mind — anything helps."
      >
        <Textarea
          id="message"
          rows={7}
          placeholder="Tell me about the project…"
          aria-invalid={Boolean(errors.message)}
          {...register("message")}
        />
      </Field>

      {/* Honeypot: invisible to humans, tempting to bots. */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="company">Company</label>
        <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          <UploadIcon className="h-4 w-4" />
          {isSubmitting ? "Sending…" : "Send message"}
        </Button>
        <p className={cn("text-xs text-white/35")}>
          Replies usually land within two working days.
        </p>
      </div>
    </form>
  );
}
