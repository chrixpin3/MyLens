import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import { getSiteConfig } from "@/lib/data";
import { ZipLoaderProvider } from "@/components/zip/ZipLoaderProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const name = config.photographerName || "Photographer";
  const description =
    config.shortBio ||
    `${name} — ${config.tagline || "Photography"}`.trim() ||
    "Photography portfolio";
  const ogImage = config.profileImage?.url || config.logo?.url || undefined;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${name} — ${config.tagline || "Photography"}`.trim(),
      template: `%s · ${name}`,
    },
    description,
    applicationName: `${name} Portfolio`,
    authors: [{ name }],
    creator: name,
    keywords: [
      "photographer",
      "photography portfolio",
      config.coverageArea,
      config.photographerName,
      "editorial photography",
      "wedding photography",
      "portrait photography",
    ].filter(Boolean),
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: siteUrl,
      siteName: `${name} Portfolio`,
      title: `${name} — ${config.tagline || "Photography"}`.trim(),
      description,
      locale: "en_GB",
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — ${config.tagline || "Photography"}`.trim(),
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    icons: {
      icon: config.logo?.url || "/favicon.svg",
      apple: config.logo?.url || "/favicon.svg",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-dvh bg-ink text-paper-50 antialiased">
        <Suspense fallback={null}>
          <ZipLoaderProvider>{children}</ZipLoaderProvider>
        </Suspense>
      </body>
    </html>
  );
}
