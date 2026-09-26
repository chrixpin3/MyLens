import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getServices, getSiteConfig, visibleSocials } from "@/lib/data";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [config, services] = await Promise.all([getSiteConfig(), getServices()]);
  const socials = visibleSocials(config);

  return (
    <div className="relative flex min-h-dvh flex-col">
      <Header
        siteName={config.photographerName}
        logoUrl={config.logo?.url}
        logoAlt={config.logo?.alt}
        nav={config.nav}
        socials={socials}
        ctaLabel={config.cta.primaryText || "Book a session"}
        ctaHref={config.cta.primaryHref || "/contact"}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer
        siteName={config.photographerName}
        tagline={config.tagline}
        logoUrl={config.logo?.url}
        logoAlt={config.logo?.alt}
        nav={config.nav}
        socials={socials}
        services={services}
        coverageArea={config.coverageArea}
        email={config.contact.email}
        phone={config.contact.phone}
        whatsapp={config.contact.whatsapp}
        address={config.contact.address}
      />
    </div>
  );
}
