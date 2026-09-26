"use client";

import { useEffect, useMemo } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";
import { TIER_LABEL, type SpeedTier } from "@/lib/network";
import { cn } from "@/lib/utils";

export interface ZipLoaderProps {
  /** Controlled progress 0–100. Omit to let the loader self-drive. */
  progress?: number;
  /** When false, the speed estimate falls back to measured timings only. */
  isNetworkAware?: boolean;
  label?: string;
  /** `overlay` = fixed full-screen, `modal` = centred card, `inline` = in flow. */
  variant?: "overlay" | "modal" | "inline";
  className?: string;
  showTierReadout?: boolean;
}

const TIER_DOTS: Record<SpeedTier, number> = { slow: 1, medium: 2, fast: 3 };

const TEETH_Y = Array.from({ length: 13 }, (_, i) => 34 + i * 4.6);

/**
 * "Opening an archive" loader.
 *
 * The case splits along its zipper: the pull slides down the teeth as progress
 * grows, the two halves swing outward once the zip is open, and the contents
 * fan out one photograph at a time. Speed is modulated by the network profile —
 * a struggling connection looks like it is *working* (slower, jittery, with an
 * escalating status line) rather than merely taking longer.
 */
export function ZipLoader({
  progress: controlled,
  isNetworkAware = true,
  label,
  variant = "overlay",
  className,
  showTierReadout = true,
}: ZipLoaderProps) {
  const selfDriven = useNetworkAwareLoading({
    label,
    threshold: 92,
    minVisibleMs: 300,
    networkAware: isNetworkAware,
  });

  const progress = controlled ?? selfDriven.progress;
  const tier = selfDriven.tier;
  const message = label ?? selfDriven.message;
  const reduced = useReducedMotion();

  // Without a controlled value the loader must drive itself — otherwise it
  // renders at a permanent 0%.
  const { start: selfStart, dismiss: selfDismiss } = selfDriven;
  useEffect(() => {
    if (controlled !== undefined) return;
    selfStart();
    return () => selfDismiss();
  }, [controlled, selfStart, selfDismiss]);

  const pct = useMotionValue(0);
  useEffect(() => {
    pct.set(Math.max(0, Math.min(100, progress)) / 100);
  }, [pct, progress]);

  // Zipper pull travels from the top of the case to the bottom.
  const pullY = useTransform(pct, [0, 0.95], [2, 58]);
  const pullOpacity = useTransform(pct, [0, 0.06, 0.94, 1], [0, 1, 1, 0]);

  // Teeth splay outwards once the zip is fully open.
  const teethLeft = useTransform(pct, [0.78, 1], [0, -1.7]);
  const teethRight = useTransform(pct, [0.78, 1], [0, 1.7]);

  // Halves swing outward from the outer edges.
  const flapLeft = useTransform(pct, [0.55, 1], [0, -38]);
  const flapRight = useTransform(pct, [0.55, 1], [0, 38]);
  const flapShiftL = useTransform(pct, [0.55, 1], [0, -7]);
  const flapShiftR = useTransform(pct, [0.55, 1], [0, 7]);

  // Contents fan out behind the opening case.
  const card1 = useTransform(pct, [0.16, 0.5], [0, 1]);
  const card2 = useTransform(pct, [0.32, 0.72], [0, 1]);
  const card3 = useTransform(pct, [0.5, 0.94], [0, 1]);
  const contentsOpacity = useTransform(pct, [0.08, 0.32], [0, 1]);

  // Progress bar + completion glow.
  const barScale = useTransform(pct, [0, 1], [0.02, 1]);
  const glowOpacity = useTransform(pct, [0.62, 1], [0, 0.5]);

  const sweepX = useSweepX();

  const jitter = useMemo(
    () => (tier === "slow" && !reduced && isNetworkAware ? 1 : 0),
    [tier, reduced, isNetworkAware],
  );

  const dots = isNetworkAware ? TIER_DOTS[tier] : 0;
  const rounded = Math.round(progress);

  const shell =
    variant === "overlay"
      ? "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-black/92 backdrop-blur-md"
      : variant === "modal"
        ? "fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
        : "flex flex-col items-center justify-center gap-6 py-16";

  return (
    <div
      className={cn(shell, className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-tier={tier}
      data-variant={variant}
    >
      <div className="relative flex flex-col items-center">
        {variant === "overlay" && (
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-40 opacity-[0.18] blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.2), transparent 62%)",
            }}
          />
        )}

        <motion.svg
          width={168}
          height={168}
          viewBox="0 0 120 120"
          fill="none"
          role="img"
          aria-label={`Loading, ${rounded} percent complete`}
          initial={false}
          animate={jitter ? { x: [0, -0.8, 0.7, -0.4, 0, 0.3, 0] } : { x: 0 }}
          transition={jitter ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
          style={{ overflow: "visible" }}
        >
          <defs>
            <linearGradient id="zip-shell" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="zip-edge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* ---- contents, revealed as the archive opens ---- */}
          <motion.g style={{ opacity: contentsOpacity }}>
            <motion.rect
              x="42"
              y="24"
              width="36"
              height="26"
              rx="3"
              fill="#ffffff"
              fillOpacity="0.07"
              stroke="#ffffff"
              strokeOpacity="0.35"
              style={fanStyle(card1)}
            />
            <motion.rect
              x="38"
              y="34"
              width="44"
              height="30"
              rx="3"
              fill="#ffffff"
              fillOpacity="0.1"
              stroke="#ffffff"
              strokeOpacity="0.4"
              style={fanStyle(card2)}
            />
            <motion.rect
              x="34"
              y="44"
              width="52"
              height="32"
              rx="3"
              fill="#ffffff"
              fillOpacity="0.14"
              stroke="#ffffff"
              strokeOpacity="0.5"
              style={fanStyle(card3)}
            />
            <motion.g style={{ opacity: card3 }}>
              <circle cx="73" cy="51" r="2.3" fill="#ffffff" fillOpacity="0.65" />
              <path d="M39 74 L48 60 L55 70 L60 63 L71 76 Z" fill="#ffffff" fillOpacity="0.45" />
            </motion.g>
          </motion.g>

          {/* ---- left half of the case ---- */}
          <motion.g style={flapStyle(flapLeft, flapShiftL, "24px 63px")}>
            <path
              d="M33 30 H60 V96 H33 Q24 96 24 87 V39 Q24 30 33 30 Z"
              fill="url(#zip-shell)"
              stroke="url(#zip-edge)"
              strokeWidth="1.2"
            />
          </motion.g>

          {/* ---- right half of the case ---- */}
          <motion.g style={flapStyle(flapRight, flapShiftR, "96px 63px")}>
            <path
              d="M87 30 H60 V96 H87 Q96 96 96 87 V39 Q96 30 87 30 Z"
              fill="url(#zip-shell)"
              stroke="url(#zip-edge)"
              strokeWidth="1.2"
            />
          </motion.g>

          {/* ---- zipper: two rows of teeth meeting at the seam ---- */}
          <motion.g style={{ opacity: pullOpacity }}>
            <g stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.1" strokeLinecap="round">
              <motion.g style={{ x: teethLeft }}>
                {TEETH_Y.map((y) => (
                  <line key={`l${y}`} x1={55.4} y1={y} x2={59.2} y2={y} />
                ))}
              </motion.g>
              <motion.g style={{ x: teethRight }}>
                {TEETH_Y.map((y) => (
                  <line key={`r${y}`} x1={60.8} y1={y} x2={64.6} y2={y} />
                ))}
              </motion.g>
            </g>
            <line
              x1="60"
              y1="30"
              x2="60"
              y2="96"
              stroke="#ffffff"
              strokeOpacity="0.26"
              strokeWidth="0.8"
            />
            <motion.g style={{ y: pullY }}>
              <rect x="55.4" y="0" width="9.2" height="4" rx="1.4" fill="#ffffff" fillOpacity="0.92" />
              <rect
                x="57"
                y="3.4"
                width="6"
                height="9"
                rx="2.4"
                fill="#000000"
                fillOpacity="0.92"
                stroke="#ffffff"
                strokeOpacity="0.95"
                strokeWidth="1.2"
              />
              <line
                x1="60"
                y1="6.3"
                x2="60"
                y2="10.3"
                stroke="#ffffff"
                strokeOpacity="0.85"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </motion.g>
          </motion.g>

          {/* ---- latches ---- */}
          <motion.g style={{ opacity: pullOpacity }}>
            <rect
              x="30"
              y="58"
              width="7"
              height="10"
              rx="2"
              fill="#000000"
              fillOpacity="0.5"
              stroke="#ffffff"
              strokeOpacity="0.5"
              strokeWidth="0.9"
            />
            <rect
              x="83"
              y="58"
              width="7"
              height="10"
              rx="2"
              fill="#000000"
              fillOpacity="0.5"
              stroke="#ffffff"
              strokeOpacity="0.5"
              strokeWidth="0.9"
            />
          </motion.g>

          <motion.circle
            cx="60"
            cy="63"
            r="30"
            stroke="#ffffff"
            strokeWidth="0.6"
            fill="none"
            style={{ opacity: glowOpacity }}
          />
        </motion.svg>

        {/* ---- readouts ---- */}
        <div className="relative mt-2 w-[min(78vw,300px)]">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-mono text-[0.7rem] uppercase tracking-widest2 text-white/45">
              {message}
            </span>
            <span className="shrink-0 font-mono text-2xl tabular-nums text-white" aria-hidden>
              {rounded}
              <span className="text-white/40">%</span>
            </span>
          </div>

          <div className="relative mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/12">
            <motion.div
              className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-white"
              style={{ scaleX: barScale }}
            />
            <motion.div
              aria-hidden
              className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              style={{ x: sweepX }}
            />
          </div>

          {showTierReadout && isNetworkAware && (
            <div className="mt-3 flex items-center justify-center gap-2" aria-live="polite">
              <span className="flex items-end gap-[3px]" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "block w-[3px] rounded-full transition-all duration-500",
                      i < dots ? "h-3 bg-white/80" : "h-1.5 bg-white/20",
                    )}
                  />
                ))}
              </span>
              <span className="font-mono text-[0.65rem] uppercase tracking-widest2 text-white/35">
                {TIER_LABEL[tier]}
                {selfDriven.profile.effectiveType ? ` · ${selfDriven.profile.effectiveType}` : ""}
                {selfDriven.profile.source === "measured" ? " · measured" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function fanStyle(opacity: MotionValue<number>) {
  return {
    opacity,
    scale: opacity,
    transformOrigin: "60px 63px",
    transformBox: "fill-box" as const,
  };
}

function flapStyle(
  rotate: MotionValue<number>,
  x: MotionValue<number>,
  transformOrigin: string,
) {
  return {
    rotate,
    x,
    transformOrigin,
    transformBox: "view-box" as const,
  };
}

/** A soft light sweep that travels along the progress bar. */
function useSweepX(): MotionValue<number> {
  const x = useMotionValue(-64);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const cycle = 1500;
    const tick = (now: number) => {
      const t = ((now - start) % cycle) / cycle;
      x.set(-64 + t * 380);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [x]);
  return x;
}
