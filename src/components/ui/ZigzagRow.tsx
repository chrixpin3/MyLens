import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

export interface ZigzagRowProps {
  /** The image (or any media) for this row. */
  media: ReactNode;
  /** The text for this row. */
  copy: ReactNode;
  /** `false` puts the image on the left, `true` flips it to the right. */
  flip?: boolean;
  /**
   * Vertical stagger for the editorial rhythm. Even rows drop 48px on desktop
   * so the two columns never line up — the "zigzag" spine of the page.
   */
  index?: number;
  className?: string;
  id?: string;
  /** Tighter vertical gap between the two columns of media and text. */
  align?: "start" | "center";
  tone?: "dark" | "light";
}

/**
 * One zigzag block: image on one side, text on the other, alternating down the
 * page with an offset on every other row. Collapses to a single stacked column
 * below `md` where the alternating order is dropped entirely.
 */
export function ZigzagRow({
  media,
  copy,
  flip = false,
  index = 0,
  className,
  id,
  align = "center",
  tone = "dark",
}: ZigzagRowProps) {
  const stagger = index % 2 === 1;

  return (
    <div
      id={id}
      className={cn(
        "grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-20",
        align === "start" && "md:items-start",
        stagger && "md:mt-12 lg:mt-16",
        tone === "light" && "on-light",
        className,
      )}
    >
      <Reveal
        direction={flip ? "left" : "right"}
        className={cn(
          "min-w-0",
          flip ? "md:order-2" : "md:order-1",
          stagger && "md:-mt-6",
        )}
      >
        {media}
      </Reveal>
      <Reveal
        direction={flip ? "right" : "left"}
        delay={0.1}
        className={cn("min-w-0", flip ? "md:order-1" : "md:order-2")}
      >
        {copy}
      </Reveal>
    </div>
  );
}

/** Vertical rhythm wrapper for a run of ZigzagRows. */
export function ZigzagStack({
  children,
  className,
  gap = "lg",
}: {
  children: ReactNode;
  className?: string;
  gap?: "sm" | "md" | "lg" | "xl";
}) {
  const gaps = {
    sm: "space-y-12 sm:space-y-16",
    md: "space-y-16 sm:space-y-24",
    lg: "space-y-20 sm:space-y-32",
    xl: "space-y-24 sm:space-y-40",
  } as const;

  return <div className={cn(gaps[gap], className)}>{children}</div>;
}
