import type { NoticiaSlim } from "@/types/noticias";

function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1) || null;
    }
    if (u.searchParams.has("v")) {
      return u.searchParams.get("v");
    }
    if (u.pathname.startsWith("/embed/")) {
      return u.pathname.split("/").pop() || null;
    }
  } catch {
    return null;
  }
  return null;
}

export function getNoticiaImage(noticia: Pick<NoticiaSlim, "foto" | "foto_2" | "foto_3" | "video">) {
  if (noticia.foto) return noticia.foto;
  if (noticia.foto_2) return noticia.foto_2;
  if (noticia.foto_3) return noticia.foto_3;

  const videoId = getYouTubeId(noticia.video);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  return null;
}

