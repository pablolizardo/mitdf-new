import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const baseUrl = "https://mitdf.com.ar";

/** Rutas estáticas principales para SEO. */
const staticRoutes: MetadataRoute.Sitemap = [
  { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
  { url: `${baseUrl}/clima`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
  { url: `${baseUrl}/barcaza`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
  { url: `${baseUrl}/farmacias`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${baseUrl}/colectivos`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: `${baseUrl}/vuelos`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: `${baseUrl}/telefonos-utiles`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${baseUrl}/eventos`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: `${baseUrl}/contacto`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${baseUrl}/auspiciar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let noticiaUrls: MetadataRoute.Sitemap = [];

  try {
    const noticias = await prisma.noticia.findMany({
      select: { slug: true, written_at_date: true },
      orderBy: { written_at_date: "desc" },
      take: 10000,
    });
    noticiaUrls = noticias.map((n) => ({
      url: `${baseUrl}/noticias/${n.slug}`,
      lastModified: n.written_at_date ? new Date(n.written_at_date) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.error("Sitemap: error fetching noticias", e);
  }

  return [...staticRoutes, ...noticiaUrls];
}
