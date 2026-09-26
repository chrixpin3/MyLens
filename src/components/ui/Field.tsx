import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const FIELD_BASE =
  "w-full rounded-glass-sm border border-white/14 bg-white/[0.045] px-4 py-3 text-sm text-white placeholder:text-white/30 backdrop-blur-md transition-all duration-300 ease-editorial hover:border-white/22 focus:border-white/45 focus:bg-white/[0.07] focus:outline-none focus:ring-0 disabled:opacity-50";

const LABEL = "eyebrow block text-white/40";

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className={LABEL}>
        {label}
        {required && <span className="ml-1 text-white/70">*</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-white/90">
          <span aria-hidden className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-white align-middle" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-white/35">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass = FIELD_BASE;

/**
 * `forwardRef` is mandatory: react-hook-form reaches the DOM node through
 * `register()`. A plain function component swallows the ref, leaving the form
 * with no values — Zod would then see `undefined` for every field.
 */
export const Input = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(FIELD_BASE, className)} {...rest} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentPropsWithoutRef<"textarea">>(
  function Textarea({ className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(FIELD_BASE, "min-h-32 resize-y leading-relaxed", className)}
        {...rest}
      />
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, ComponentPropsWithoutRef<"select">>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={cn(FIELD_BASE, "cursor-pointer appearance-none bg-[length:0] pr-10", className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23ffffff' stroke-opacity='0.5' stroke-width='1.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
        }}
        {...rest}
      >
        {children}
      </select>
    );
  },
);

/** Accessible on/off switch — greyscale only, state readable without colour. */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  id,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  id?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="cursor-pointer text-sm text-white/85">
          {label}
        </label>
        {description && <p className="text-xs text-white/40">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300",
          checked ? "border-white bg-white" : "border-white/25 bg-white/8",
          disabled && "opacity-40",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-1/2 block h-4 w-4 -translate-y-1/2 rounded-full transition-all duration-300 ease-editorial",
            checked ? "left-[1.6rem] bg-black" : "left-[0.2rem] bg-white/60",
          )}
        />
      </button>
    </div>
  );
}

/** Pill-shaped chip used for skills, categories and filters. */
export function Chip({
  children,
  active,
  onClick,
  as = "button",
  className,
  ...rest
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  as?: "button" | "span";
  className?: string;
} & Record<string, unknown>) {
  const classes = cn(
    "inline-flex items-center rounded-full border px-3.5 py-1.5 text-[0.72rem] uppercase tracking-widest2 transition-all duration-300",
    active
      ? "border-white bg-white text-black"
      : "border-white/18 text-white/60 hover:border-white/45 hover:text-white",
    className,
  );
  if (as === "span") {
    return (
      <span className={classes} {...rest}>
        {children}
      </span>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes} {...rest}>
      {children}
    </button>
  );
}
