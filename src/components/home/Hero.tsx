"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import type { HeroSettings, StatEntry } from "@/types";

export interface HeroProps {
  name: string;
  tagline: string;
  hero: HeroSettings;
  stats: StatEntry[];
  showStats: boolean;
  primaryText: string;
  primaryHref: string;
  secondaryText: string;
  secondaryHref: string;
}

export function Hero({
  name,
  tagline,
  hero,
  stats,
  showStats,
  primaryText,
  primaryHref,
  secondaryText,
  secondaryHref,
}: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "18%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.12]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduced ? 1 : 0.15]);

  const useVideo = hero.mediaType === "video" && Boolean(hero.videoUrl) && !videoFailed;
  const firstName = name.trim().split(/\s+/)[0] ?? name;

  return (
    <section
      ref={sectionRef}
      className="grain relative isolate flex min-h-[100svh] items-end overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* ---- background media ---- */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={reduced ? undefined : { y: mediaY, scale: mediaScale }}
      >
        {useVideo ? (
          <video
            className="h-full w-full object-cover"
            autoPlay={hero.autoplayVideo}
            muted
            loop
            playsInline
            preload="metadata"
            poster={hero.poster?.url || undefined}
            onError={() => setVideoFailed(true)}
          >
            <source src={hero.videoUrl} type="video/mp4" />
          </video>
        ) : hero.image?.url ? (
          <Image
            src={hero.image.url}
            alt={hero.image.alt || `${name} — portfolio cover`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(120% 90% at 20% 0%, #1a1a1a 0%, #0a0a0a 45%, #000 100%)",
            }}
          />
        )}
      </motion.div>

      {/* Legibility scrim — greyscale only. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,${(hero.overlay / 100) * 0.7}) 0%, rgba(0,0,0,${(hero.overlay / 100) * 0.75}) 45%, rgba(0,0,0,0.95) 100%)`,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black to-transparent"
      />

      <motion.div
        className={cn(
          "mx-auto w-full max-w-7xl px-5 pb-14 pt-32 sm:px-8 sm:pb-20 lg:px-12",
          hero.align === "center" && "flex flex-col items-center text-center",
        )}
        style={reduced ? undefined : { opacity: copyOpacity }}
      >
        <Reveal direction="up" duration={0.8}>
          <span className="eyebrow inline-flex items-center gap-3 text-white/45">
            <span aria-hidden className="block h-px w-8 bg-white/30" />
            Photographer
            <span aria-hidden className="block h-px w-8 bg-white/30" />
          </span>
        </Reveal>

        <Reveal direction="up" delay={0.08} duration={0.9}>
          <h1 id="hero-title" className="mt-6 text-balance text-fluid-4xl leading-[0.95]">
            <span className="block text-white/35">{firstName}</span>
            <span className="block text-gradient-paper">
              {name.trim().split(/\s+/).slice(1).join(" ") || name}
            </span>
          </h1>
        </Reveal>

        {tagline && (
          <Reveal direction="up" delay={0.16} duration={0.9}>
            <p
              className={cn(
                "mt-7 max-w-2xl text-pretty text-fluid-lg font-light leading-relaxed text-white/70",
                hero.align === "center" && "mx-auto",
              )}
            >
              {tagline}
            </p>
          </Reveal>
        )}

        {(primaryText || secondaryText) && (
          <Reveal direction="up" delay={0.24} duration={0.9}>
            <div
              className={cn(
                "mt-10 flex flex-col gap-3 sm:flex-row sm:items-center",
                hero.align === "center" && "justify-center",
              )}
            >
              {primaryText && <Button href={primaryHref} size="lg">{primaryText}</Button>}
              {secondaryText && (
                <Button href={secondaryHref} size="lg" variant="outline">
                  {secondaryText}
                </Button>
              )}
            </div>
          </Reveal>
        )}

        {showStats && stats.length > 0 && (
          <Reveal direction="up" delay={0.32} duration={0.9} className="mt-16 w-full">
            <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-glass border border-white/10 bg-white/8 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-1.5 bg-black/40 px-6 py-7 backdrop-blur-xl"
                >
                  <dt className="order-2 text-center text-[0.68rem] uppercase tracking-widest2 text-white/40">
                    {stat.label}
                  </dt>
                  <dd className="order-1 font-display text-fluid-xl leading-none text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </motion.div>

      {/* Scroll cue */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
      >
        <span className="font-mono text-[0.6rem] uppercase tracking-widest2 text-white/30">Scroll</span>
        <span className="relative block h-10 w-px overflow-hidden bg-white/15">
          <motion.span
            className="absolute inset-x-0 top-0 block h-4 bg-white"
            animate={reduced ? {} : { y: ["-100%", "260%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </div>
    </section>
  );
}
