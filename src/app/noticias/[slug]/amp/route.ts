import { NextRequest } from "next/server";
import { getNoticiaBySlug } from "@/services/noticias";

const BASE_URL = "https://mitdf.com.ar";

function absoluteImageUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  if (raw.startsWith("http")) return raw;
  return `${BASE_URL}${raw.startsWith("/") ? "" : "/"}${raw}`;
}

/** Sanitiza HTML para AMP: quita scripts/estilos y convierte img a amp-img. */
function ampSafeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/<img\s+([^>]*?)>/gi, (_, attrs) => {
      const src = /src=["']([^"']+)["']/i.exec(attrs)?.[1] ?? "";
      const alt = /alt=["']([^"']*)["']/i.exec(attrs)?.[1] ?? "";
      const absSrc = src.startsWith("http") ? src : `${BASE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
      return `<amp-img src="${escapeHtml(absSrc)}" width="1200" height="630" layout="responsive" alt="${escapeHtml(alt)}"></amp-img>`;
    });
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const data = await getNoticiaBySlug(slug);

  if (!data?.noticia) {
    return new Response("Not found", { status: 404 });
  }

  const n = data.noticia;
  const title = (n.titulo ?? "Noticia").replace(/<[^>]+>/g, "").trim();
  const description =
    (n.bajada ?? "")
      .replace(/<[^>]+>/g, "")
      .trim()
      .slice(0, 160) || undefined;
  const canonicalUrl = `${BASE_URL}/noticias/${slug}`;
  const ampUrl = `${BASE_URL}/noticias/${slug}/amp`;
  const imageUrl = absoluteImageUrl(n.foto ?? n.foto_2 ?? n.foto_3);
  const datePublished =
    n.written_at ?? n.written_at_date?.toISOString() ?? undefined;
  const bodyHtml = ampSafeHtml(n.longtext ?? "");

  const doc = `<!doctype html>
<html ⚡ lang="es-AR">
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <meta name="description" content="${escapeHtml(description ?? "")}">
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
  <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <script type="application/ld+json">
${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline: title,
  description: description ?? undefined,
  image: imageUrl ? [imageUrl] : undefined,
  datePublished: datePublished ?? undefined,
  dateModified: datePublished ?? undefined,
  mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  author: n.medio ? { "@type": "Organization", name: n.medio } : undefined,
  publisher: {
    "@type": "Organization",
    name: "miTDF",
    logo: { "@type": "ImageObject", url: `${BASE_URL}/icon-512.png` },
  },
})}
  </script>
</head>
<body>
  <header>
    <a href="${escapeHtml(BASE_URL)}">miTDF</a> · <a href="${escapeHtml(canonicalUrl)}">Ver nota completa</a>
  </header>
  <article>
    <h1>${escapeHtml(title)}</h1>
    ${n.medio ? `<p class="meta">${escapeHtml(n.medio)}</p>` : ""}
    ${datePublished ? `<time datetime="${escapeHtml(datePublished)}">${escapeHtml(datePublished)}</time>` : ""}
    ${imageUrl ? `<amp-img src="${escapeHtml(imageUrl)}" width="1200" height="630" layout="responsive" alt="${escapeHtml(title)}"></amp-img>` : ""}
    ${n.bajada ? `<p class="bajada">${escapeHtml((n.bajada ?? "").replace(/<[^>]+>/g, ""))}</p>` : ""}
    <div class="body">
      ${bodyHtml}
    </div>
  </article>
  <footer>
    <a href="${escapeHtml(canonicalUrl)}">Ver en miTDF</a>
  </footer>
</body>
</html>`;

  return new Response(doc, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
