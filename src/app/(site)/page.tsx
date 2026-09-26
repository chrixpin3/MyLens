import Link from "next/link";
import { Container, EmptyState, Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Hero } from "@/components/home/Hero";
import {
  AboutZigzag,
  CtaBand,
  ExperienceTimeline,
  FeaturedGallery,
  ServicesSection,
} from "@/components/home/sections";
import { getGalleryImages, getServices, getSiteConfig } from "@/lib/data";
import { ApertureIcon } from "@/components/ui/icons";
import type { ServiceData } from "@/types";

export const revalidate = 60;

export default async function HomePage() {
  const [config, services] = await Promise.all([getSiteConfig(), getServices(true)]);
  const visibleServices = services.filter((s) => s.active) as unknown as ServiceData[];

  const featured = config.sections.featured
    ? await getGalleryImages({ limit: Math.max(3, config.featuredCount) })
    : [];

  const sections = config.sections;

  return (
    <>
      <Hero
        name={config.photographerName}
        tagline={config.tagline}
        hero={config.hero}
        stats={config.stats}
        showStats={sections.stats}
        primaryText={config.cta.primaryText}
        primaryHref={config.cta.primaryHref || "/contact"}
        secondaryText={config.cta.secondaryText}
        secondaryHref={config.cta.secondaryHref || "/gallery"}
      />

      {sections.aboutZigzag && (
        <Section id="about-zigzag" padding="lg">
          <Container>
            <AboutZigzag
              name={config.photographerName}
              bio={config.bio}
              shortBio={config.shortBio}
              profileImage={config.profileImage}
              coverageArea={config.coverageArea}
              skills={config.skills}
              showSkills={sections.skills}
            />
          </Container>
        </Section>
      )}

      {sections.experience && config.experience.length > 0 && (
        <Section id="experience" padding="md" className="bg-ink-950">
          <Container>
            <ExperienceTimeline entries={config.experience} />
          </Container>
        </Section>
      )}

      {sections.services && (
        <Section id="services" padding="lg">
          <Container>
            {visibleServices.length > 0 ? (
              <ServicesSection services={visibleServices} name={config.photographerName} />
            ) : (
              <EmptyState
                icon={<ApertureIcon className="h-10 w-10" />}
                title="Services are being arranged"
                description="No services have been published yet. Add them from the admin dashboard and they will appear here."
                action={
                  <Button href="/admin/services" variant="outline" size="sm">
                    Open the dashboard
                  </Button>
                }
              />
            )}
          </Container>
        </Section>
      )}

      {sections.featured && (
        <Section id="featured" padding="lg" className="bg-ink-950">
          <Container>
            {featured.length > 0 ? (
              <FeaturedGallery
                images={featured.map((img) => ({
                  _id: String(img._id),
                  imageUrl: img.imageUrl,
                  title: img.title,
                  alt: img.alt || img.title,
                  blurDataUrl: img.blurDataUrl,
                }))}
                title="Recent frames"
              />
            ) : (
              <EmptyState
                icon={<ApertureIcon className="h-10 w-10" />}
                title="The gallery is waiting"
                description="Upload your first photographs and the featured grid will fill itself."
                action={
                  <Button href="/admin/gallery" variant="outline" size="sm">
                    Upload photographs
                  </Button>
                }
              />
            )}
          </Container>
        </Section>
      )}

      {sections.ctaBand && (
        <Section padding="lg">
          <Container>
            <CtaBand {...config.cta} email={config.contact.email} />
          </Container>
        </Section>
      )}

      {/* Quiet nudge to the dashboard when the site has never been configured. */}
      {services.length === 0 && (
        <Section padding="none" className="pb-16">
          <Container>
            <p className="text-center font-mono text-[0.68rem] uppercase tracking-widest2 text-white/25">
              Running on seed data ·{" "}
              <Link href="/admin/login" className="link-underline text-white/60">
                open the dashboard
              </Link>{" "}
              to make this your own
            </p>
          </Container>
        </Section>
      )}
    </>
  );
}
