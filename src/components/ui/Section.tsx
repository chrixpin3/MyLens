import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

export interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /** `dark` = the default black canvas, `light` = inverted editorial page. */
  tone?: "dark" | "light";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  /** Skip the built-in vertical rhythm when used inside a stagger. */
  bare?: boolean;
  as?: "section" | "div" | "footer" | "article";
}

const PADDING = {
  none: "",
  sm: "py-12 sm:py-16",
  md: "py-16 sm:py-20 lg:py-28",
  lg: "py-20 sm:py-28 lg:py-36",
  xl: "py-24 sm:py-32 lg:py-44",
} as const;

export function Section({
  children,
  className,
  id,
  tone = "dark",
  padding = "md",
  bare = false,
  as: Tag = "section",
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cn(
        "relative",
        tone === "light" && "on-light bg-paper text-black",
        !bare && PADDING[padding],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Container({
  children,
  className,
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "narrow" | "default" | "wide" | "full";
}) {
  const widths = {
    narrow: "max-w-3xl",
    default: "max-w-6xl",
    wide: "max-w-7xl",
    full: "max-w-none",
  } as const;

  return (
    <div className={cn("mx-auto w-full px-5 sm:px-8 lg:px-12", widths[size], className)}>
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  tone = "dark",
  className,
  as = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const TitleTag = as;
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className={cn("eyebrow", tone === "light" ? "text-black/45" : "text-white/40")}>
          {eyebrow}
        </span>
      )}
      <TitleTag
        className={cn(
          "text-balance text-fluid-2xl",
          tone === "light" ? "text-black" : "text-white",
        )}
      >
        {title}
      </TitleTag>
      {lede && (
        <p
          className={cn(
            "max-w-2xl text-pretty text-fluid-base font-normal leading-relaxed",
            align === "center" && "mx-auto",
            tone === "light" ? "text-black/60" : "text-white/55",
          )}
        >
          {lede}
        </p>
      )}
    </Reveal>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  tone = "dark",
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col items-center justify-center gap-5 rounded-glass border border-dashed p-10 text-center sm:p-16",
        tone === "light"
          ? "border-black/15 bg-black/[0.03] text-black"
          : "glass text-white",
        className,
      )}
    >
      {icon && <div className="opacity-50">{icon}</div>}
      <div className="flex flex-col gap-2">
        <p className="font-display text-fluid-lg">{title}</p>
        {description && (
          <p
            className={cn(
              "max-w-md text-pretty text-sm leading-relaxed",
              tone === "light" ? "text-black/55" : "text-white/50",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action}
    </Reveal>
  );
}
