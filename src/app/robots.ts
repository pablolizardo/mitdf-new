import type { MetadataRoute } from "next";

const baseUrl = "https://mitdf.com.ar";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/buscar/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
