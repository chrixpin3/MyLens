import type { MetadataRoute } from "next";

const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The dashboard, the auth callback and every admin endpoint stay out of
        // the index — no reason for a search engine to know they exist.
        disallow: ["/admin", "/admin/", "/api/", "/api/admin/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
