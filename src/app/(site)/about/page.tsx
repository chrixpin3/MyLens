import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { ZigzagRow, ZigzagStack } from "@/components/ui/ZigzagRow";
import { SmartImage } from "@/components/ui/SmartImage";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ExperienceTimeline } from "@/components/home/sections";
import { getGalleryImages, getSiteConfig } from "@/lib/data";
import { splitBlocks, truncate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: "About",
    description: config.shortBio || `About ${config.photographerName} — ${config.tagline}`,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const config = await getSiteConfig();
  const blocks = splitBlocks(config.bio);
  const gallery = await getGalleryImages({ limit: 3 });

  return (
    <>
      <PageHeader eyebrow="About" title={config.photographerName} lede={config.tagline} />

      <Section padding="lg" className="pt-0">
        <Container>
          {/* Story, alternating with supporting frames */}
          <ZigzagStack gap="xl">
            <ZigzagRow
              index={0}
              media={
                <SmartImage
                  src={config.profileImage?.url}
                  blurDataUrl={config.profileImage?.blurDataUrl}
                  alt={config.profileImage?.alt || config.photographerName}
                  aspect="4 / 5"
                  sizes="(max-width: 768px) 100vw, 45vw"
                  wrapperClassName="rounded-glass-lg border border-white/8"
                />
              }
              copy={
              <div className="flex flex-col gap-5">
                <Reveal>
                  <span className="eyebrow text-white/40">The short version</span>
                </Reveal>
                {blocks.length > 0 ? (
                  blocks.map((block, i) => (
                    <Reveal key={i} delay={0.06 + i * 0.05}>
                      <p className="text-pretty text-fluid-base leading-relaxed text-white/60">
                        {block}
                      </p>
                    </Reveal>
                  ))
                ) : (
                  <Reveal delay={0.06}>
                    <p className="text-pretty text-fluid-base leading-relaxed text-white/60">
                      {config.shortBio}
                    </p>
                  </Reveal>
                )}
                {config.coverageArea && (
                  <Reveal delay={0.14}>
                    <p className="font-mono text-[0.7rem] uppercase tracking-widest2 text-white/35">
                      {config.coverageArea}
                    </p>
                  </Reveal>
                )}
              </div>
              }
            />

            {config.skills.length > 0 && (
              <ZigzagRow
                index={1}
                flip
                media={
                <div className="flex flex-col gap-6">
                  <Reveal direction="right">
                    <span className="eyebrow text-white/40">Capabilities</span>
                  </Reveal>
                  <Reveal direction="right" delay={0.06}>
                    <h2 className="text-balance text-fluid-2xl leading-tight">
                      What I bring to a commission
                    </h2>
                  </Reveal>
                </div>
                }
                copy={
                <RevealGroup className="flex flex-wrap gap-2.5" stagger={0.05}>
                  {config.skills.map((skill) => (
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

            {gallery.length > 0 && (
              <ZigzagRow
                index={2}
                media={
                <div className="flex flex-col gap-6">
                  <Reveal>
                    <span className="eyebrow text-white/40">In frame</span>
                  </Reveal>
                  <Reveal delay={0.06}>
                    <h2 className="text-balance text-fluid-2xl leading-tight">
                      A few frames from recent work
                    </h2>
                  </Reveal>
                  <Reveal delay={0.12}>
                    <Button href="/gallery" variant="outline" size="sm">
                      See everything
                    </Button>
                  </Reveal>
                </div>
                }
                copy={
                <RevealGroup className="grid grid-cols-3 gap-3" stagger={0.06}>
                  {gallery.map((image) => (
                    <RevealItem key={String(image._id)}>
                      <SmartImage
                        src={image.imageUrl}
                        blurDataUrl={image.blurDataUrl}
                        alt={image.alt || image.title}
                        aspect="3 / 4"
                        sizes="(max-width: 768px) 33vw, 16vw"
                        wrapperClassName="rounded-glass-sm border border-white/8"
                      />
                    </RevealItem>
                  ))}
                </RevealGroup>
                }
              />
            )}
          </ZigzagStack>
        </Container>
      </Section>

      {config.experience.length > 0 && (
        <Section padding="md" className="bg-ink-950">
          <Container>
            <ExperienceTimeline entries={config.experience} />
          </Container>
        </Section>
      )}

      {config.sections.ctaBand && (
        <Section padding="lg">
          <Container>
            <Reveal>
              <div className="flex flex-col items-center gap-6 text-center">
                <p className="max-w-2xl text-pretty text-fluid-lg text-white/70">
                  {truncate(config.cta.subhead || config.shortBio, 200)}
                </p>
                <Button href="/contact" size="lg">
                  {config.cta.primaryText || "Get in touch"}
                </Button>
              </div>
            </Reveal>
          </Container>
        </Section>
      )}
    </>
  );
}
