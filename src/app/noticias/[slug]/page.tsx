import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNoticiaBySlug, getLatestNews } from "@/services/noticias";
import NoticiaLink from "@/components/common/NoticiaLink";
import { CardShare } from "@/components/common/card-share";
import { SearchWebCard } from "@/components/common/card-ia";
import { estimateReadingTime } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getNoticiaBySlug(slug);

  if (!data?.noticia) {
    return {
      title: "Noticia no encontrada",
    };
  }

  const { noticia } = data;
  const title = noticia.titulo || "Noticia";
  const description =
    noticia.bajada?.replace(/<[^>]+>/g, "").slice(0, 160) ||
    "Noticias y servicios de Tierra del Fuego en miTDF.";

  const image = noticia.foto || noticia.foto_2 || noticia.foto_3 || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function NoticiaPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getNoticiaBySlug(slug);

  if (!data?.noticia) {
    notFound();
  }

  const { noticia, relacionadas } = data;
  const latest = await getLatestNews(6);
  const latestOthers = latest.filter((n) => n.slug !== slug).slice(0, 3);

  const cleanTitle =
    noticia.titulo?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
    "miTDF";

  const plainText =
    noticia.longtext
      ?.replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim() || noticia.bajada?.replace(/<[^>]+>/g, " ").trim() || "";
  const readingTime =
    plainText.length > 0 ? estimateReadingTime(plainText, "compact") : null;

  return (
    <article
      className="space-y-8"
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      <nav aria-label="Miga de pan" className="text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <a href="/" className="hover:text-foreground">
              Inicio
            </a>
          </li>
          <li className="opacity-40">/</li>
          {noticia.categoria && (
            <>
              <li>
                <span className="hover:text-foreground">
                  {noticia.categoria}
                </span>
              </li>
              <li className="opacity-40">/</li>
            </>
          )}
          <li
            className="font-medium text-foreground/80 line-clamp-1"
            aria-current="page"
          >
            {noticia.titulo?.replace(/<[^>]+>/g, "")}
          </li>
        </ol>
      </nav>

      <header className="space-y-3">
        {noticia.categoria && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {noticia.categoria}
          </p>
        )}
        <h1
          className="text-3xl font-serif font-bold leading-tight tracking-tight md:text-4xl"
          dangerouslySetInnerHTML={{ __html: noticia.titulo || "" }}
          itemProp="headline"
        />
        {noticia.bajada && (
          <p
            className="text-base text-muted-foreground md:text-lg"
            dangerouslySetInnerHTML={{ __html: noticia.bajada }}
          />
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {noticia.medio && (
            <span className="font-medium" itemProp="publisher">
              {noticia.medio}
            </span>
          )}
          {noticia.ciudad && (
            <>
              <span className="opacity-40">·</span>
              <span>{noticia.ciudad}</span>
            </>
          )}
          {noticia.written_at && (
            <>
              <span className="opacity-40">·</span>
              <time dateTime={noticia.written_at} itemProp="datePublished">
                {new Date(noticia.written_at).toLocaleString("es-AR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </>
          )}
          {readingTime && (
            <>
              <span className="opacity-40">·</span>
              <span>{readingTime}</span>
            </>
          )}
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-[minmax(0,2.2fr)_minmax(260px,0.9fr)] md:items-start">
        <div className="space-y-6">
          {noticia.foto && (
            <figure className="overflow-hidden rounded-lg border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={noticia.foto}
                alt={noticia.titulo || ""}
                className="h-auto w-full object-cover"
              />
            </figure>
          )}

          {noticia.longtext && (
            <section
              className="prose prose-neutral max-w-none dark:prose-invert whitespace-pre-wrap"
              itemProp="articleBody"
              dangerouslySetInnerHTML={{ __html: noticia.longtext }}
            />
          )}

          {relacionadas.length > 0 && (
            <section aria-label="Notas relacionadas" className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                También puede interesarte
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {relacionadas.map((relacionada, index) => (
                  <NoticiaLink
                    key={relacionada.id}
                    variant={index === 0 ? "normal" : "small"}
                    noticia={relacionada as any}
                  />
                ))}
              </div>
            </section>
          )}

          {latestOthers.length > 0 && (
            <section aria-label="Últimas noticias" className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Últimas noticias
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {latestOthers.map((otra) => (
                  <NoticiaLink
                    key={otra.id}
                    variant="small"
                    noticia={otra as any}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 md:space-y-6 md:pl-2">
          {relacionadas.length > 0 && (
            <section aria-label="Relacionadas" className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Relacionadas
              </h2>
              <div className="space-y-2">
                {relacionadas.slice(0, 4).map((rel) => (
                  <NoticiaLink
                    key={rel.id}
                    variant="minimal"
                    noticia={rel as any}
                  />
                ))}
              </div>
            </section>
          )}

          <CardShare className="w-full" />

          <SearchWebCard
            name={cleanTitle}
            description="Explorá más contexto y antecedentes sobre este tema en la web. Recordá contrastar la información."
          />
        </aside>
      </section>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: noticia.titulo,
            datePublished: noticia.written_at ?? undefined,
            articleBody: noticia.longtext ?? undefined,
            author: noticia.medio
              ? { "@type": "Organization", name: noticia.medio }
              : undefined,
          }),
        }}
      />
    </article>
  );
}
