import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlassTone = "dark" | "light" | "none";

export interface GlassCardProps extends ComponentPropsWithoutRef<"div"> {
  as?: ElementType;
  tone?: GlassTone;
  /** Adds the subtle inset top highlight. */
  sheen?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  radius?: "sm" | "md" | "lg";
  children: ReactNode;
}

const PADDING = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8 sm:p-10",
} as const;

const RADIUS = {
  sm: "rounded-glass-sm",
  md: "rounded-glass",
  lg: "rounded-glass-lg",
} as const;

/**
 * The frosted-glass surface used across the site and the admin dashboard.
 * `tone="light"` inverts the tokens for use on white sections.
 */
export function GlassCard({
  as: Tag = "div",
  tone = "dark",
  sheen = true,
  padding = "md",
  radius = "md",
  className,
  children,
  ...rest
}: GlassCardProps) {
  return (
    <Tag
      className={cn(
        tone === "light" ? "glass-light on-light" : "glass",
        RADIUS[radius],
        PADDING[padding],
        sheen && "relative",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
