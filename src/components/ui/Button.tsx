import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const BASE =
  "group relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-wide transition-all duration-300 ease-editorial disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-white text-black shadow-[0_10px_30px_-14px_rgba(255,255,255,0.7)] hover:shadow-[0_16px_44px_-14px_rgba(255,255,255,0.85)] hover:-translate-y-0.5",
  secondary:
    "glass text-white hover:bg-white/12 hover:-translate-y-0.5",
  outline:
    "border border-white/30 text-white hover:border-white hover:bg-white/8 hover:-translate-y-0.5",
  ghost: "text-white/70 hover:bg-white/8 hover:text-white",
  danger:
    "border border-white/25 text-white/80 hover:border-white hover:bg-white hover:text-black",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.78rem]",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-[0.95rem] sm:h-14 sm:px-10",
};

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: Variant;
  size?: Size;
  href?: string;
  external?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  external,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noreferrer noopener" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {/* sheen sweep on hover — pure greyscale */}
      {variant === "primary" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:[animation:shimmer_1.1s_ease-out]"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
}
