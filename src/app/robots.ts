import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Only public marketing/doc pages should be indexed
        allow: ["/", "/docs"],
        // Block all authenticated app routes and API endpoints
        disallow: [
          "/api/",
          "/dashboard",
          "/scan/",
          "/scans",
          "/reports",
          "/login",
          "/signup",
        ],
      },
    ],
    sitemap: "https://fuzzx.app/sitemap.xml",
  };
}
