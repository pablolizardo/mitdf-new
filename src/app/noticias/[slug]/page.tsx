import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNoticiaBySlug, getLatestNews } from "@/services/noticias";
import NoticiaLink from "@/components/common/NoticiaLink";
import { CardShare } from "@/components/common/card-share";
import { SearchWebCard } from "@/components/common/card-ia";
import { cleanArticleHtml, estimateReadingTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderOpen, MapPin, Tags } from "lucide-react";

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

  const baseUrl = "https://mitdf.com.ar";
  const canonicalUrl = `${baseUrl}/noticias/${slug}`;

  const rawImage =
    noticia.foto || noticia.foto_2 || noticia.foto_3 || undefined;
  const imageUrl = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${baseUrl}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`
    : undefined;

  const ampUrl = `${baseUrl}/noticias/${slug}/amp`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      types: { "application/amphtml": ampUrl },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      images: imageUrl
        ? [{ url: imageUrl, alt: noticia.titulo?.replace(/<[^>]+>/g, "") ?? "Noticia" }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
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
    noticia.titulo
      ?.replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "miTDF";

  const plainText =
    noticia.longtext
      ?.replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim() ||
    noticia.bajada?.replace(/<[^>]+>/g, " ").trim() ||
    "";
  const readingTime =
    plainText.length > 0 ? estimateReadingTime(plainText, "compact") : null;

  const tagsList = noticia.tags
    ? noticia.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

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
              className="prose prose-neutral max-w-none dark:prose-invert whitespace-pre-wrap
                [&_p:first-of-type]:text-lg [&_p:first-of-type]:leading-relaxed [&_p:first-of-type]:font-medium [&_p:first-of-type]:text-foreground/95
                [&_.article-quote]:border-l-4 [&_.article-quote]:border-primary/50 [&_.article-quote]:pl-4 [&_.article-quote]:italic [&_.article-quote]:text-muted-foreground
                [&_.article-link]:underline [&_.article-link]:decoration-primary/50 [&_.article-link]:underline-offset-2 hover:[&_.article-link]:decoration-primary"
              itemProp="articleBody"
              dangerouslySetInnerHTML={{
                __html: cleanArticleHtml(noticia.longtext),
              }}
            />
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
          {(noticia.categoria || noticia.ciudad || tagsList.length > 0) && (
            <Card size="sm" className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <FileText className="size-3.5" aria-hidden />
                  Esta nota
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                {noticia.categoria && (
                  <div className="flex gap-2">
                    <FolderOpen
                      className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Categoría
                      </span>
                      <div className="mt-0.5">
                        <Badge
                          variant="secondary"
                          className="text-xs font-semibold"
                        >
                          {noticia.categoria}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
                {noticia.ciudad && (
                  <div className="flex gap-2">
                    <MapPin
                      className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Ciudad
                      </span>
                      <div className="mt-0.5">
                        <Badge
                          variant="outline"
                          className="text-xs font-medium"
                        >
                          {noticia.ciudad}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
                {tagsList.length > 0 && (
                  <div className="flex gap-2">
                    <Tags
                      className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Etiquetas
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {tagsList.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[11px] font-normal opacity-90"
                          >
                            {tag.replace(/-/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <CardShare className="w-full" />

          <SearchWebCard
            name={cleanTitle}
            description="Explorá más contexto y antecedentes sobre este tema en la web. Recordá contrastar la información."
          />

          {relacionadas.length > 0 && (
            <section aria-label="Notas relacionadas" className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                También puede interesarte
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
            description:
              noticia.bajada?.replace(/<[^>]+>/g, "").slice(0, 160) ||
              undefined,
            image:
              [noticia.foto, noticia.foto_2, noticia.foto_3].filter(Boolean)
                .length > 0
                ? [noticia.foto, noticia.foto_2, noticia.foto_3].filter(Boolean)
                : undefined,
            datePublished:
              noticia.written_at ??
              noticia.written_at_date?.toISOString() ??
              undefined,
            dateModified:
              noticia.written_at ??
              noticia.written_at_date?.toISOString() ??
              undefined,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://mitdf.com.ar/noticias/${slug}`,
            },
            author: noticia.medio
              ? { "@type": "Organization", name: noticia.medio }
              : undefined,
            publisher: {
              "@type": "Organization",
              name: "miTDF",
              logo: {
                "@type": "ImageObject",
                url: "https://mitdf.com.ar/icon-512.png",
              },
            },
            articleBody: noticia.longtext ?? undefined,
          }),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Inicio",
                item: "https://mitdf.com.ar",
              },
              ...(noticia.categoria
                ? [
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: noticia.categoria,
                      item: `https://mitdf.com.ar/categoria/${encodeURIComponent(
                        noticia.categoria.toLowerCase()
                      )}`,
                    },
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: cleanTitle,
                      item: `https://mitdf.com.ar/noticias/${slug}`,
                    },
                  ]
                : [
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: cleanTitle,
                      item: `https://mitdf.com.ar/noticias/${slug}`,
                    },
                  ]),
            ],
          }),
        }}
      />
    </article>
  );
}
