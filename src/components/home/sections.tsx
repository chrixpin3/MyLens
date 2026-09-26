import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { Button } from "@/components/ui/Button";
import { getServiceIcon } from "@/components/ui/icons";
import { ZigzagRow, ZigzagStack } from "@/components/ui/ZigzagRow";
import { splitBlocks, truncate } from "@/lib/utils";
import type { MediaRef, ServiceData, SiteConfigData, TimelineEntry } from "@/types";

/* ------------------------------------------------------------------ */
/* About zigzag                                                        */
/* ------------------------------------------------------------------ */

export function AboutZigzag({
  name,
  bio,
  shortBio,
  profileImage,
  coverageArea,
  skills,
  showSkills,
}: {
  name: string;
  bio: string;
  shortBio: string;
  profileImage: MediaRef | null;
  coverageArea: string;
  skills: string[];
  showSkills: boolean;
}) {
  const blocks = splitBlocks(bio || shortBio);

  return (
    <ZigzagStack gap="xl">
      <ZigzagRow
        index={0}
        id="about"
        media={
          <SmartImage
            src={profileImage?.url}
            blurDataUrl={profileImage?.blurDataUrl}
            alt={profileImage?.alt || `${name}, photographer`}
            aspect="4 / 5"
            sizes="(max-width: 768px) 100vw, 45vw"
            wrapperClassName="rounded-glass-lg border border-white/8"
          />
        }
        copy={
        <div className="flex flex-col gap-6">
          <Reveal>
            <span className="eyebrow text-white/40">About</span>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="text-balance text-fluid-2xl leading-tight">
              The person behind the camera
            </h2>
          </Reveal>
          {blocks.slice(0, 2).map((block, i) => (
            <Reveal key={i} delay={0.1 + i * 0.06}>
              <p className="text-pretty text-fluid-base leading-relaxed text-white/60">{block}</p>
            </Reveal>
          ))}
          {coverageArea && (
            <Reveal delay={0.2}>
              <p className="font-mono text-[0.7rem] uppercase tracking-widest2 text-white/35">
                {coverageArea}
              </p>
            </Reveal>
          )}
          <Reveal delay={0.24}>
            <div>
              <Button href="/about" variant="outline" size="sm">
                More about the studio
              </Button>
            </div>
          </Reveal>
        </div>
        }
      />

      {showSkills && skills.length > 0 && (
        <ZigzagRow
          index={1}
          flip
          media={
          <div className="flex flex-col gap-7">
            <Reveal direction="left">
              <span className="eyebrow text-white/40">What I do</span>
            </Reveal>
            <Reveal direction="left" delay={0.06}>
              <h2 className="text-balance text-fluid-2xl leading-tight">
                Trained eye, borrowed light, honest colour
              </h2>
            </Reveal>
            <Reveal direction="left" delay={0.12}>
              <p className="text-pretty text-fluid-base leading-relaxed text-white/60">
                Every commission starts with a conversation about the light you already have in
                the room, not the kit I brought with me.
              </p>
            </Reveal>
          </div>
          }
          copy={
          <RevealGroup
            className="flex flex-wrap gap-2.5"
            stagger={0.05}
          >
            {skills.map((skill) => (
              <RevealItem key={skill}>
                <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[0.75rem] uppercase tracking-widest2 text-white/70 backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white">
                  {skill}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
          }
        />
      )}
    </ZigzagStack>
  );
}

/* ------------------------------------------------------------------ */
/* Services grid                                                       */
/* ------------------------------------------------------------------ */

export function ServicesSection({
  services,
  name,
}: {
  services: ServiceData[];
  name: string;
}) {
  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-5">
        <Reveal>
          <span className="eyebrow text-white/40">Services</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="max-w-3xl text-balance text-fluid-3xl leading-[1.02]">
            Ways to work together
          </h2>
        </Reveal>
      </div>

      <RevealGroup
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        stagger={0.07}
      >
        {services.map((service, i) => {
          const Icon = getServiceIcon(service.icon);
          return (
            <RevealItem key={service._id} className="h-full">
              <article className="group relative flex h-full flex-col gap-5 overflow-hidden rounded-glass-lg border border-white/10 bg-white/[0.045] p-7 backdrop-blur-md transition-all duration-500 ease-editorial hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08] hover:shadow-glass">
                {/* index watermark */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -top-6 font-display text-[5rem] leading-none text-white/[0.04] transition-all duration-700 group-hover:text-white/[0.09]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {service.image?.url ? (
                  <SmartImage
                    src={service.image.url}
                    blurDataUrl={service.image.blurDataUrl}
                    alt={service.image.alt || service.title}
                    aspect="16 / 10"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    wrapperClassName="rounded-glass-sm"
                    className="transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-glass-sm border border-white/10 bg-white/[0.04] text-white/70 transition-all duration-500 group-hover:border-white/25 group-hover:text-white">
                    <Icon className="h-9 w-9" />
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <h3 className="text-fluid-lg leading-snug">{service.title}</h3>
                  <p className="text-pretty text-sm leading-relaxed text-white/50">
                    {truncate(service.description, 180)}
                  </p>
                </div>

                {service.ctaText && (
                  <div className="mt-auto pt-2">
                    <Button
                      href={service.ctaLink || "/contact"}
                      variant="ghost"
                      size="sm"
                      className="-ml-4"
                    >
                      {service.ctaText}
                    </Button>
                  </div>
                )}
              </article>
            </RevealItem>
          );
        })}
      </RevealGroup>

      <Reveal>
        <p className="text-sm text-white/35">
          Need something bespoke?{" "}
          <a href="/contact" className="link-underline text-white/80">
            Ask {name.split(/\s+/)[0]} directly
          </a>
          .
        </p>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Featured gallery preview                                            */
/* ------------------------------------------------------------------ */

export function FeaturedGallery({
  images,
  title,
}: {
  images: Array<{
    _id: string;
    imageUrl: string;
    title: string;
    alt: string;
    blurDataUrl?: string;
  }>;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-5">
          <Reveal>
            <span className="eyebrow text-white/40">Selected work</span>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="text-balance text-fluid-3xl leading-[1.02]">{title}</h2>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <Button href="/gallery" variant="outline" size="sm">
            View full gallery
          </Button>
        </Reveal>
      </div>

      <RevealGroup
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
        stagger={0.06}
      >
        {images.map((image, i) => (
          <RevealItem
            key={image._id}
            className={i === 0 ? "col-span-2 lg:col-span-2" : ""}
          >
            <a
              href={`/gallery?photo=${image._id}`}
              className="group relative block overflow-hidden rounded-glass border border-white/8"
            >
              <SmartImage
                src={image.imageUrl}
                blurDataUrl={image.blurDataUrl}
                alt={image.alt || image.title}
                aspect={i === 0 ? "16 / 9" : "4 / 3"}
                sizes={
                  i === 0
                    ? "(max-width: 1024px) 100vw, 66vw"
                    : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                }
                wrapperClassName="w-full"
                className="transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.06]"
                overlay={
                  <>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 scrim-bottom opacity-90"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                      <span className="font-display text-sm text-white sm:text-fluid-sm">
                        {image.title}
                      </span>
                      <span
                        aria-hidden
                        className="shrink-0 translate-y-1 font-mono text-[0.6rem] uppercase tracking-widest2 text-white/0 transition-all duration-500 group-hover:translate-y-0 group-hover:text-white/60"
                      >
                        View
                      </span>
                    </span>
                  </>
                }
              />
            </a>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Experience timeline                                                 */
/* ------------------------------------------------------------------ */

export function ExperienceTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div className="flex flex-col gap-5">
      <Reveal>
        <span className="eyebrow text-white/40">Experience</span>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="text-balance text-fluid-2xl">A short history</h2>
      </Reveal>

      <ol className="mt-4 flex flex-col">
        {entries.map((entry, i) => (
          <Reveal key={`${entry.period}-${i}`} delay={0.08 + i * 0.05} as="li">
            <div className="group grid gap-2 border-l border-white/12 py-7 pl-6 transition-colors duration-500 hover:border-white/45 sm:grid-cols-12 sm:gap-6 sm:pl-8">
              <div className="sm:col-span-3">
                <span className="font-mono text-[0.7rem] uppercase tracking-widest2 text-white/40">
                  {entry.period}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-9">
                <h3 className="text-fluid-lg leading-snug">{entry.role}</h3>
                {entry.place && (
                  <span className="text-sm text-white/45">{entry.place}</span>
                )}
                {entry.description && (
                  <p className="mt-1 max-w-2xl text-pretty text-sm leading-relaxed text-white/50">
                    {entry.description}
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CTA band                                                            */
/* ------------------------------------------------------------------ */

export function CtaBand({
  headline,
  subhead,
  primaryText,
  primaryHref,
  secondaryText,
  secondaryHref,
  email,
}: SiteConfigData["cta"] & { email: string }) {
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-glass-lg border border-white/10 bg-white/[0.05] px-6 py-14 backdrop-blur-xl sm:px-12 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-20 -top-24 h-72 opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(255,255,255,0.18), transparent 70%)",
          }}
        />
        <div className="relative flex flex-col items-center gap-7 text-center">
          <h2 className="max-w-3xl text-balance text-fluid-2xl leading-tight sm:text-fluid-3xl">
            {headline}
          </h2>
          {subhead && (
            <p className="max-w-xl text-pretty text-fluid-base leading-relaxed text-white/60">
              {subhead}
            </p>
          )}
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            {primaryText && <Button href={primaryHref} size="lg">{primaryText}</Button>}
            {secondaryText && (
              <Button href={secondaryHref} size="lg" variant="outline">
                {secondaryText}
              </Button>
            )}
          </div>
          {email && (
            <a
              href={`mailto:${email}`}
              className="link-underline mt-1 font-mono text-[0.72rem] uppercase tracking-widest2 text-white/40"
            >
              {email}
            </a>
          )}
        </div>
      </div>
    </Reveal>
  );
}
