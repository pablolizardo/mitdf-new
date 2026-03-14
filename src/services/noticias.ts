import { prisma } from "@/lib/db";
import { NoticiaSlim } from "@/types/noticias";

const baseSelect = {
  id: true,
  slug: true,
  titulo: true,
  bajada: true,
  categoria: true,
  written_at: true,
  written_at_date: true,
  foto: true,
  foto_2: true,
  foto_3: true,
  video: true,
  medio: true,
  badge: true,
  ciudad: true,
  views: true,
  likes: true,
} satisfies Record<string, boolean>;

export async function getLatestNews(
  limit: number = 24
): Promise<NoticiaSlim[]> {
  try {
    const noticias = await prisma.noticia.findMany({
      take: limit,
      select: baseSelect,
      orderBy: {
        written_at_date: "desc",
      },
    });

    return noticias as unknown as NoticiaSlim[];
  } catch (error) {
    console.error("Error fetching latest news", error);
    return [];
  }
}

export async function getFeaturedNews(): Promise<NoticiaSlim | null> {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const featured = await prisma.noticia.findFirst({
      where: {
        AND: [
          {
            OR: [
              { badge: { in: ["URGENTE", "ULTIMA_HORA", "EXCLUSIVO"] } },
              { views: { gt: 0 } },
            ],
          },
          {
            written_at_date: {
              gte: threeDaysAgo,
            },
          },
        ],
      },
      select: baseSelect,
      orderBy: [
        { badge: "asc" },
        { written_at_date: "desc" },
        { views: "desc" },
      ],
    });

    if (!featured) {
      const latest = await prisma.noticia.findFirst({
        select: baseSelect,
        orderBy: { written_at_date: "desc" },
      });
      return latest as unknown as NoticiaSlim | null;
    }

    return featured as unknown as NoticiaSlim | null;
  } catch (error) {
    console.error("Error fetching featured news", error);
    return null;
  }
}

export async function getNewsByCategory(
  categoria: string,
  limit: number = 6
): Promise<NoticiaSlim[]> {
  try {
    const noticias = await prisma.noticia.findMany({
      where: { categoria },
      take: limit,
      select: baseSelect,
      orderBy: {
        written_at_date: "desc",
      },
    });

    return noticias as unknown as NoticiaSlim[];
  } catch (error) {
    console.error("Error fetching news by category", { categoria, error });
    return [];
  }
}

export async function getNoticiaBySlug(slug: string) {
  try {
    const noticia = await prisma.noticia.findUnique({
      where: { slug },
    });

    if (!noticia) return null;

    const relacionadas = await prisma.noticia.findMany({
      where: {
        slug: { not: slug },
        categoria: noticia.categoria ?? undefined,
      },
      take: 6,
      select: baseSelect,
      orderBy: { written_at_date: "desc" },
    });

    return {
      noticia,
      relacionadas: relacionadas as unknown as NoticiaSlim[],
    };
  } catch (error) {
    console.error("Error fetching noticia by slug", { slug, error });
    return null;
  }
}

export async function searchNoticias(
  query: string,
  limit: number = 50
): Promise<NoticiaSlim[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const noticias = await prisma.noticia.findMany({
      where: {
        OR: [
          { titulo: { contains: q, mode: "insensitive" } },
          { bajada: { contains: q, mode: "insensitive" } },
          { longtext: { contains: q, mode: "insensitive" } },
          { tags: { contains: q, mode: "insensitive" } },
          { ciudad: { contains: q, mode: "insensitive" } },
        ],
      },
      take: limit,
      select: baseSelect,
      orderBy: {
        written_at_date: "desc",
      },
    });

    return noticias as unknown as NoticiaSlim[];
  } catch (error) {
    console.error("Error searching noticias", { query: q, error });
    return [];
  }
}
