import { NextRequest, NextResponse } from "next/server";
import { searchNoticias } from "@/services/noticias";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) || 8 : 8;

  const noticias = await searchNoticias(q, Math.min(limit, 20));

  return NextResponse.json(
    noticias.map((n) => ({
      id: n.id,
      slug: n.slug,
      titulo: n.titulo,
      medio: (n as any).medio ?? null,
    })),
  );
}

