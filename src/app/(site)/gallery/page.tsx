import type { Metadata } from "next";
import { Container, EmptyState, Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { GalleryGrid, type GalleryCardData } from "@/components/gallery/GalleryGrid";
import { getGalleryCategories, getGalleryImages, getSiteConfig } from "@/lib/data";
import { ApertureIcon } from "@/components/ui/icons";
import { PageHeader } from "@/components/layout/PageHeader";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: "Gallery",
    description: `Selected photographs by ${config.photographerName}. ${config.tagline}`,
    alternates: { canonical: "/gallery" },
  };
}

export default async function GalleryPage() {
  const [images, categories, config] = await Promise.all([
    getGalleryImages(),
    getGalleryCategories(),
    getSiteConfig(),
  ]);

  const cards: GalleryCardData[] = images.map((img) => ({
    _id: String(img._id),
    imageUrl: img.imageUrl,
    title: img.title,
    description: img.description,
    alt: img.alt || img.title,
    category: img.category,
    blurDataUrl: img.blurDataUrl,
    width: img.width,
    height: img.height,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="The gallery"
        lede={
          cards.length > 0
            ? `${cards.length} frame${cards.length === 1 ? "" : "s"} on record. Click any photograph to read the full story behind it.`
            : "A growing archive of recent work."
        }
      />

      <Section padding="lg" className="pt-0">
        <Container>
          {cards.length > 0 ? (
            <GalleryGrid images={cards} categories={categories} />
          ) : (
            <EmptyState
              icon={<ApertureIcon className="h-10 w-10" />}
              title="No photographs yet"
              description="The gallery is empty. Upload images from the admin dashboard and they will appear here as rectangular cards with an overlaid title."
              action={
                <Button href="/admin/gallery" variant="outline" size="sm">
                  Go to gallery manager
                </Button>
              }
            />
          )}
        </Container>
      </Section>

      {cards.length > 0 && (
        <Section padding="none" className="pb-20">
          <Container>
            <SectionHeading
              eyebrow="Commissions"
              align="center"
              title="Like what you see?"
              lede={`Every frame above started with a conversation. Tell ${config.photographerName.split(/\s+/)[0]} what you have in mind.`}
              className="mx-auto items-center"
            />
            <div className="mt-8 flex justify-center">
              <Button href="/contact" size="lg">
                Start a conversation
              </Button>
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
