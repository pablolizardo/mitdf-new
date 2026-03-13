import type { Metadata } from "next";
import { searchNoticias } from "@/services/noticias";
import NoticiaLink from "@/components/common/NoticiaLink";
import { type NoticiaSlim } from "@/types/noticias";

type PageProps = {
  params: { q: string };
};

export function generateMetadata({ params }: PageProps): Metadata {
  const raw = decodeURIComponent(params.q || "").trim();
  const q = raw || "noticias";

  return {
    title: `Resultados para "${q}"`,
    description: `Resultados de noticias en miTDF para la búsqueda "${q}".`,
  };
}

export default async function BuscarPage({ params }: PageProps) {
  const raw = decodeURIComponent(params.q || "");
  const query = raw.trim();

  const results = query ? await searchNoticias(query, 60) : [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Buscar
        </p>
        <h1 className="text-2xl font-serif font-semibold tracking-tight">
          Resultados para &quot;{query || "..."}&quot;
        </h1>
        <p className="text-sm text-muted-foreground">
          {query
            ? results.length > 0
              ? `${results.length} resultado${results.length === 1 ? "" : "s"} encontrados.`
              : "No encontramos noticias que coincidan con tu búsqueda. Probá con otras palabras o menos términos."
            : "Ingresá una búsqueda en el campo superior para ver resultados de noticias."}
        </p>
      </header>

      {results.length > 0 && (
        <section aria-label="Resultados de noticias" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((noticia: NoticiaSlim, index: number) => (
              <NoticiaLink
                key={noticia.id}
                variant={index < 3 ? "normal" : "small"}
                noticia={noticia as any}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

