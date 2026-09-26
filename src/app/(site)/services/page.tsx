import type { Metadata } from "next";
import { Container, EmptyState, Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { Button } from "@/components/ui/Button";
import { getServiceIcon, ApertureIcon } from "@/components/ui/icons";
import { getServices, getSiteConfig } from "@/lib/data";
import type { ServiceData } from "@/types";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: "Services",
    description: `Photography services from ${config.photographerName} — editorial, weddings, portraits and more.`,
    alternates: { canonical: "/services" },
  };
}

export default async function ServicesPage() {
  const [config, services] = await Promise.all([getSiteConfig(), getServices()]);
  const list = services as unknown as ServiceData[];

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="What I photograph"
        lede="Every commission is shaped around the brief. Here is what that usually looks like — and what it includes."
      />

      <Section padding="lg" className="pt-0">
        <Container>
          {list.length === 0 ? (
            <EmptyState
              icon={<ApertureIcon className="h-10 w-10" />}
              title="No services published yet"
              description="Services are fully managed from the dashboard — add as many as you like, reorder them, and each card gets its own image and call to action."
              action={
                <Button href="/admin/services" variant="outline" size="sm">
                  Manage services
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-20 sm:gap-28">
              {list.map((service, i) => {
                const Icon = getServiceIcon(service.icon);
                const flip = i % 2 === 1;
                return (
                  <article
                    key={service._id}
                    className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14"
                  >
                    <Reveal
                      direction={flip ? "left" : "right"}
                      className={flip ? "md:order-2" : "md:order-1"}
                    >
                      {service.image?.url ? (
                        <SmartImage
                          src={service.image.url}
                          blurDataUrl={service.image.blurDataUrl}
                          alt={service.image.alt || service.title}
                          aspect="4 / 3"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          wrapperClassName="rounded-glass-lg border border-white/8"
                        />
                      ) : (
                        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-glass-lg border border-dashed border-white/15 bg-white/[0.03]">
                          <Icon className="h-14 w-14 text-white/25" />
                        </div>
                      )}
                    </Reveal>

                    <Reveal
                      direction={flip ? "right" : "left"}
                      delay={0.1}
                      className={`flex flex-col gap-5 ${flip ? "md:order-1" : "md:order-2"}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[0.7rem] uppercase tracking-widest2 text-white/35">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span aria-hidden className="h-px flex-1 bg-white/12" />
                        <Icon className="h-4 w-4 text-white/35" />
                      </div>
                      <h2 className="text-balance text-fluid-2xl leading-tight">{service.title}</h2>
                      {service.description && (
                        <p className="max-w-xl whitespace-pre-line text-pretty text-fluid-base leading-relaxed text-white/60">
                          {service.description}
                        </p>
                      )}
                      {service.ctaText && (
                        <div className="pt-2">
                          <Button href={service.ctaLink || "/contact"} size="sm">
                            {service.ctaText}
                          </Button>
                        </div>
                      )}
                    </Reveal>
                  </article>
                );
              })}
            </div>
          )}
        </Container>
      </Section>

      {list.length > 0 && (
        <Section padding="md" className="bg-ink-950">
          <Container>
            <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
              {[
                "Pre-shoot call",
                "Shot list & timing",
                "Edited high-res set",
                "Print release",
              ].map((item) => (
                <RevealItem key={item}>
                  <div className="flex h-full items-center gap-3 rounded-glass border border-white/8 bg-white/[0.035] px-5 py-4 backdrop-blur-md">
                    <span aria-hidden className="block h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                    <span className="text-sm text-white/65">{item}</span>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
            <p className="mt-8 text-center font-mono text-[0.68rem] uppercase tracking-widest2 text-white/25">
              Included with every {config.photographerName.split(/\s+/)[0]} commission
            </p>
          </Container>
        </Section>
      )}
    </>
  );
}
