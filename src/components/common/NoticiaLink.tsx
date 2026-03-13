/* eslint-disable @next/next/no-img-element */

import { cn, diffForHumans } from "@/lib/utils";
import { NoticiaSlim } from "@/types/noticias";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import BadgeCategoria from "./badge-categoria-client";
import BadgeMedio from "./badge-medio-client";
import BadgeNoticia from "./badge-noticia";
import { getNoticiaImage } from "@/lib/youtube-utils";

const BaseNoticiaLink = ({
  children,
  order,
  compact,
}: {
  children: React.ReactNode;
  order?: number;
  compact?: boolean;
}) => (
  <article
    className={cn(
      order && `order-${order}`,
      "group flex flex-col h-full",
      compact ? "gap-1.5" : "gap-3"
    )}
  >
    {children}
  </article>
);

const NoticiaImage = ({
  noticia,
  className,
  noCategory,
  overlay,
}: {
  noticia: NoticiaSlim;
  className?: string;
  noCategory?: boolean;
  overlay?: boolean;
}) => {
  const hasBadge = noticia.badge !== null && noticia.badge !== undefined;

  // Colores del outline según el tipo de badge
  const getBadgeOutlineColor = () => {
    if (!hasBadge) return "";
    switch (noticia.badge) {
      case "URGENTE":
        return "ring-2 ring-red-500 ring-offset-4";
      case "EN_VIVO":
        return "ring-2 ring-orange-500 ring-offset-4";
      case "ULTIMA_HORA":
        return "ring-2 ring-yellow-500 ring-offset-4";
      case "EXCLUSIVO":
        return "ring-2 ring-purple-500 ring-offset-4";
      case "DESARROLLANDO":
        return "ring-2 ring-blue-500 ring-offset-4";
      case "ACTUALIZADO":
        return "ring-2 ring-green-500 ring-offset-4";
      case "VERIFICADO":
        return "ring-2 ring-blue-500 ring-offset-4";
      case "INVESTIGACION":
        return "ring-2 ring-indigo-500 ring-offset-4";
      case "ARCHIVO":
        return "ring-2 ring-gray-500 ring-offset-4";
      case "PREMIUM":
        return "ring-2 ring-amber-500 ring-offset-4";
      default:
        return "";
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg",
        hasBadge && getBadgeOutlineColor()
      )}
    >
      {!noCategory && <BadgeCategoria categoria={noticia.categoria} />}
      <BadgeMedio medio={noticia.medio} />
      <BadgeNoticia badge={noticia.badge} />
      <img
        src={getNoticiaImage(noticia) || "#"}
        alt={noticia.titulo}
        className={cn(
          "w-full bg-gradient-to-br from-muted/50 to-muted text-transparent object-cover",
          "min-h-[180px]",
          className
        )}
        loading="lazy"
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
      )}
    </div>
  );
};

export const FeaturedNoticia = ({
  noticia,
  order,
}: {
  noticia: NoticiaSlim;
  order?: number;
}) => (
  <BaseNoticiaLink order={order}>
    <NoticiaImage
      noticia={noticia}
      className="aspect-[16/9] min-h-[280px]"
      overlay
    />
    <div className="flex flex-col gap-1 p-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground ">
        <time
          className="font-medium text-muted-foreground flex items-center gap-1"
          dateTime={noticia.written_at}
        >
          <Clock className="w-3 h-3" />
          {diffForHumans(new Date(noticia.written_at))}
        </time>
        {(noticia as any).ciudad && (
          <>
            <span className="opacity-40">·</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {(noticia as any).ciudad}
            </span>
          </>
        )}
      </div>
      <Link href={`/noticias/${noticia.slug}`} className="group/link">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight group-hover/link:text-primary transition-colors duration-200"
          dangerouslySetInnerHTML={{ __html: noticia.titulo }}
        />
      </Link>
      {noticia.bajada && (
        <div className="flex flex-col gap-2">
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: noticia.bajada }} />
          </p>
          <Link
            href={`/noticias/${noticia.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors w-fit"
          >
            Leer más
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </div>
  </BaseNoticiaLink>
);

export const NormalNoticia = ({
  noticia,
  order,
}: {
  noticia: NoticiaSlim;
  order?: number;
}) => (
  <BaseNoticiaLink order={order} compact>
    <article
      itemScope
      itemType="https://schema.org/NewsArticle"
      className="flex flex-col gap-1.5"
    >
      <NoticiaImage
        noticia={noticia}
        className="aspect-[4/3] min-h-[160px] max-h-[220px]"
        overlay
      />
      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <time
            itemProp="datePublished"
            className="font-medium text-muted-foreground flex items-center gap-1"
            dateTime={noticia.written_at}
          >
            <Clock className="w-3 h-3" />
            {diffForHumans(new Date(noticia.written_at))}
          </time>
          {(noticia as any).ciudad && (
            <>
              <span className="opacity-40">·</span>
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {(noticia as any).ciudad}
              </span>
            </>
          )}
        </div>
        <Link
          href={`/noticias/${noticia.slug}`}
          itemProp="url"
          className="group/link"
        >
          <h2
            className="text-lg md:text-xl font-semibold leading-snug group-hover/link:text-primary transition-colors duration-200 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: noticia.titulo }}
            itemProp="headline"
          />
        </Link>
        {noticia.bajada && (
          <p
            className="text-sm text-muted-foreground line-clamp-2 mt-0.5"
            itemProp="description"
          >
            <span dangerouslySetInnerHTML={{ __html: noticia.bajada }} />
          </p>
        )}
      </div>
      <meta itemProp="publisher" content={noticia.medio} />
    </article>
  </BaseNoticiaLink>
);

export const SmallNoticia = ({
  noticia,
  order,
}: {
  noticia: NoticiaSlim;
  order?: number;
}) => (
  <BaseNoticiaLink order={order} compact>
    <NoticiaImage
      noticia={noticia}
      className="aspect-[16/10] min-h-[100px] max-h-[130px]"
      noCategory
    />
    <div className="flex flex-col gap-0.5 px-1 pt-0.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <time
          className="text-muted-foreground flex items-center gap-1"
          dateTime={noticia.written_at}
        >
          <Clock className="w-3 h-3" />
          {diffForHumans(new Date(noticia.written_at))}
        </time>
        {(noticia as any).ciudad && (
          <>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {(noticia as any).ciudad}
            </span>
          </>
        )}
      </div>
      <Link href={`/noticias/${noticia.slug}`} className="group/link">
        <h4
          className="text-sm font-semibold leading-tight line-clamp-2 group-hover/link:text-primary transition-colors duration-200"
          dangerouslySetInnerHTML={{ __html: noticia.titulo }}
        />
      </Link>
    </div>
  </BaseNoticiaLink>
);

export const MinimalNoticia = ({
  noticia,
  order,
}: {
  noticia: NoticiaSlim;
  order?: number;
}) => (
  <BaseNoticiaLink order={order}>
    <div className="flex flex-col gap-1.5 py-2 border-l-2 border-transparent hover:border-primary pl-3 transition-all duration-200">
      <div className="flex items-center gap-1.5 flex-wrap">
        {noticia.badge && (
          <BadgeNoticia badge={noticia.badge} absolute={false} />
        )}
        <time
          className="text-xs text-muted-foreground flex items-center gap-1"
          dateTime={noticia.written_at}
        >
          <Clock className="w-3 h-3" />
          {diffForHumans(new Date(noticia.written_at))}
        </time>
        {(noticia as any).ciudad && (
          <>
            <span className="text-xs text-muted-foreground opacity-40">·</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {(noticia as any).ciudad}
            </span>
          </>
        )}
      </div>
      <Link href={`/noticias/${noticia.slug}`} className="group/link">
        <h4
          className="font-semibold leading-tight line-clamp-2 group-hover/link:text-primary transition-colors duration-200"
          dangerouslySetInnerHTML={{ __html: noticia.titulo }}
        />
      </Link>
      <p className="text-xs text-muted-foreground line-clamp-2">
        <span className="font-medium text-foreground/70">{noticia.medio}</span>
        <span className="mx-1.5 opacity-40">·</span>
        <span
          dangerouslySetInnerHTML={{
            __html:
              noticia.bajada.length > 100
                ? noticia.bajada.slice(0, 100) + "..."
                : noticia.bajada,
          }}
        />
      </p>
    </div>
  </BaseNoticiaLink>
);

export const HorizontalNoticia = ({
  noticia,
  order,
}: {
  noticia: NoticiaSlim;
  order?: number;
}) => (
  <BaseNoticiaLink order={order}>
    <div className="flex flex-row gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors duration-200">
      <div className="w-24 h-16 shrink-0 overflow-hidden rounded-md relative">
        <img
          src={getNoticiaImage(noticia) || "#"}
          alt={noticia.titulo}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <BadgeNoticia badge={noticia.badge} absolute={true} />
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0 justify-center">
        <div className="flex items-center gap-1.5 flex-wrap">
          <BadgeMedio medio={noticia.medio} absolute={false} />
          <time
            className="text-xs text-muted-foreground flex items-center gap-1"
            dateTime={noticia.written_at}
          >
            <Clock className="w-3 h-3" />
            {diffForHumans(new Date(noticia.written_at))}
          </time>
        </div>
        <Link href={`/noticias/${noticia.slug}`} className="group/link">
          <h5
            className="font-semibold text-sm leading-tight line-clamp-2 group-hover/link:text-primary transition-colors duration-200"
            dangerouslySetInnerHTML={{ __html: noticia.titulo }}
          />
        </Link>
      </div>
    </div>
  </BaseNoticiaLink>
);

type NoticiaVariant =
  | "featured"
  | "normal"
  | "small"
  | "horizontal"
  | "minimal";

const NoticiaLink = ({
  variant = "normal",
  noticia,
  order,
}: {
  variant?: NoticiaVariant;
  noticia: NoticiaSlim;
  order?: number;
}) => {
  const components = {
    featured: FeaturedNoticia,
    normal: NormalNoticia,
    small: SmallNoticia,
    horizontal: HorizontalNoticia,
    minimal: MinimalNoticia,
  } as const;

  const Component = components[variant];
  return <Component noticia={noticia} order={order} />;
};

NoticiaLink.Featured = FeaturedNoticia;
NoticiaLink.Normal = NormalNoticia;
NoticiaLink.Small = SmallNoticia;
NoticiaLink.Horizontal = HorizontalNoticia;
NoticiaLink.Minimal = MinimalNoticia;

export default NoticiaLink;
