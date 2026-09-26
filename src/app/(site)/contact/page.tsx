import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { getServices, getSiteConfig, mailtoLink, telLink, whatsappLink } from "@/lib/data";
import { MailIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: "Contact",
    description: `Get in touch with ${config.photographerName} for photography commissions. ${config.coverageArea}`,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const [config, services] = await Promise.all([getSiteConfig(), getServices()]);
  const { contact } = config;
  const wa = whatsappLink(contact.whatsapp);

  const details = [
    contact.email && {
      icon: MailIcon,
      label: "Email",
      value: contact.email,
      href: mailtoLink(contact.email),
    },
    contact.phone && {
      icon: PhoneIcon,
      label: "Phone",
      value: contact.phone,
      href: telLink(contact.phone),
    },
    wa && {
      icon: WhatsAppIcon,
      label: "WhatsApp",
      value: contact.whatsapp,
      href: wa,
    },
    (contact.address || config.coverageArea) && {
      icon: MapPinIcon,
      label: "Studio",
      value: [contact.address, config.coverageArea].filter(Boolean).join(" · "),
      href: contact.mapUrl || undefined,
    },
  ].filter(Boolean) as Array<{
    icon: typeof MailIcon;
    label: string;
    value: string;
    href?: string;
  }>;

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's plan something"
        lede="Commissions, collaborations or a simple print run — send the details and you'll hear back within two working days."
      />

      <Section padding="lg" className="pt-0">
        <Container>
          <div className="grid gap-6 lg:grid-cols-12">
            {/* ---- details panel ---- */}
            <Reveal direction="right" className="lg:col-span-5">
              <div className="glass flex h-full flex-col gap-8 rounded-glass-lg p-8 sm:p-10">
                <div className="flex flex-col gap-3">
                  <span className="eyebrow text-white/40">Studio details</span>
                  <h2 className="text-fluid-xl leading-tight">Reach {config.photographerName.split(/\s+/)[0]} directly</h2>
                </div>

                <ul className="flex flex-col gap-6">
                  {details.map((detail) => (
                    <li key={detail.label} className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/70">
                        <detail.icon className="h-4 w-4" />
                      </span>
                      <div className="flex flex-col gap-1">
                        <span className="eyebrow text-white/30">{detail.label}</span>
                        {detail.href ? (
                          <a
                            href={detail.href}
                            target={detail.href.startsWith("http") ? "_blank" : undefined}
                            rel="noreferrer noopener"
                            className="link-underline break-all text-sm text-white/80 transition-colors hover:text-white"
                          >
                            {detail.value}
                          </a>
                        ) : (
                          <span className="text-sm text-white/80">{detail.value}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {wa && (
                  <div className="pt-2">
                    <Button href={wa} external variant="outline" size="sm">
                      <WhatsAppIcon className="h-4 w-4" />
                      Chat on WhatsApp
                    </Button>
                  </div>
                )}

                <div className="rule-fade" />

                <p className="text-pretty text-xs leading-relaxed text-white/35">
                  Availability changes with the season. For anything urgent, WhatsApp is the
                  fastest way through.
                </p>
              </div>
            </Reveal>

            {/* ---- form panel ---- */}
            <Reveal direction="left" delay={0.1} className="lg:col-span-7">
              <div className="glass relative flex h-full flex-col rounded-glass-lg p-8 sm:p-10">
                <div className="mb-8 flex flex-col gap-3">
                  <span className="eyebrow text-white/40">Send a note</span>
                  <h2 className="text-fluid-xl leading-tight">Tell me about the project</h2>
                </div>
                <ContactForm services={services.map((s) => s.title)} />
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ---- map ---- */}
      {contact.mapEmbedUrl && (
        <Section padding="none" className="pb-20">
          <Container>
            <Reveal>
              <div className="overflow-hidden rounded-glass-lg border border-white/10">
                <iframe
                  src={contact.mapEmbedUrl}
                  title="Studio location map"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[380px] w-full grayscale contrast-125 sm:h-[460px]"
                  style={{ border: 0, filter: "grayscale(1) contrast(1.1) brightness(0.92)" }}
                />
              </div>
            </Reveal>
          </Container>
        </Section>
      )}
    </>
  );
}
