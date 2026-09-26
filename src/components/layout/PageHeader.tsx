import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/**
 * Shared masthead for interior pages: an oversized editorial title with a hair
 * rule, sitting under the fixed header.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
  className,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <header
      className={cn(
        "relative overflow-hidden pb-10 pt-32 sm:pb-14 sm:pt-40",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 h-80 w-80 rounded-full opacity-[0.13] blur-3xl"
        style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />

      <div
        className={cn(
          "relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 sm:px-8 lg:px-12",
          align === "center" && "items-center text-center",
        )}
      >
        {eyebrow && (
          <Reveal>
            <span className="eyebrow text-white/40">{eyebrow}</span>
          </Reveal>
        )}
        <Reveal delay={0.06}>
          <h1 className="max-w-4xl text-balance text-fluid-4xl leading-[0.98]">{title}</h1>
        </Reveal>
        {lede && (
          <Reveal delay={0.12}>
            <p
              className={cn(
                "max-w-2xl text-pretty text-fluid-base leading-relaxed text-white/55",
                align === "center" && "mx-auto",
              )}
            >
              {lede}
            </p>
          </Reveal>
        )}
        {children && <Reveal delay={0.18}>{children}</Reveal>}
      </div>
    </header>
  );
}
