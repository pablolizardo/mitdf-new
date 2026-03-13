import type { Metadata } from "next";
import {
  getFeaturedNews,
  getLatestNews,
  getNewsByCategory,
} from "@/services/noticias";
import Marquee from "@/components/common/Marquee";
import NoticiaLink from "@/components/common/NoticiaLink";
import { WeatherCard } from "@/components/common/WeatherCard";
import { BarcazaCard } from "@/components/common/BarcazaCard";
import { type NoticiaSlim } from "@/types/noticias";

export const metadata: Metadata = {
  title: "Noticias hoy en Tierra del Fuego",
  description:
    "Las últimas noticias y servicios de Tierra del Fuego: actualidad, política, sociedad, clima, colectivos, vuelos y más en miTDF.",
};

/** Revalidar la página principal cada 15 minutos (ISR). */
export const revalidate = 900;

export default async function Home() {
  const [featured, latest, actualidad, politica, sociedad] = await Promise.all([
    getFeaturedNews(),
    getLatestNews(40),
    getNewsByCategory("Actualidad", 8),
    getNewsByCategory("Política", 8),
    getNewsByCategory("Sociedad", 9),
  ]);

  const latestForMarquee = latest.slice(0, 16);
  const gridNoticias = latest.filter(
    (n: NoticiaSlim) => !featured || n.slug !== featured.slug
  );
  const sidebarExtra = gridNoticias.slice(27, 39);
  const sidebarCloud = sidebarExtra.slice(0, 4);
  const sidebarSearch = sidebarExtra.slice(4, 8);

  return (
    <div className="space-y-6 md:space-y-8">
      {latestForMarquee.length > 0 && <Marquee noticias={latestForMarquee} />}

      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(260px,0.9fr)] md:items-start">
        <section className="space-y-6">
          {featured && (
            <section aria-label="Noticia destacada" className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Destacada
              </p>
              <NoticiaLink variant="featured" noticia={featured as any} />
            </section>
          )}

          {/* Clima y barcaza: en mobile van después de la noticia principal */}
          <div className="flex flex-col gap-6 md:hidden">
            <div id="clima-mobile" className="scroll-mt-20">
              <WeatherCard />
            </div>
            <div id="barcaza-mobile" className="scroll-mt-20">
              <BarcazaCard />
            </div>
          </div>

          <section id="ultimas-noticias" aria-label="Últimas noticias" className="space-y-3 scroll-mt-20">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Últimas noticias
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {gridNoticias
                .slice(0, 12)
                .map((noticia: NoticiaSlim, index: number) => (
                  <NoticiaLink
                    key={noticia.id}
                    variant={index < 4 ? "normal" : "small"}
                    noticia={noticia as any}
                  />
                ))}
            </div>
          </section>

          <section
            aria-label="Actualidad y política"
            className="grid gap-6 md:grid-cols-2"
          >
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Actualidad
              </h2>
              <div className="space-y-3">
                {actualidad.map((noticia: NoticiaSlim, index: number) => (
                  <NoticiaLink
                    key={noticia.id}
                    variant={index === 0 ? "normal" : "minimal"}
                    noticia={noticia as any}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Política
              </h2>
              <div className="space-y-3">
                {politica.map((noticia: NoticiaSlim, index: number) => (
                  <NoticiaLink
                    key={noticia.id}
                    variant={index === 0 ? "normal" : "minimal"}
                    noticia={noticia as any}
                  />
                ))}
              </div>
            </div>
          </section>

          <section aria-label="Sociedad" className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Sociedad
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {sociedad.map((noticia: NoticiaSlim) => (
                <NoticiaLink
                  key={noticia.id}
                  variant="small"
                  noticia={noticia as any}
                />
              ))}
            </div>
          </section>

          {gridNoticias.length > 12 && (
            <section aria-label="Más noticias" className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Más noticias
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {gridNoticias.slice(12, 27).map((noticia: NoticiaSlim) => (
                  <NoticiaLink
                    key={noticia.id}
                    variant="small"
                    noticia={noticia as any}
                  />
                ))}
              </div>
            </section>
          )}
        </section>

        <aside
          className="space-y-6 md:pt-1"
          aria-label="Módulos complementarios"
        >
          {/* Clima y barcaza: en desktop van en la sidebar */}
          <div className="hidden md:block space-y-6">
            <div id="clima-desktop" className="scroll-mt-20">
              <WeatherCard />
            </div>
            <div id="barcaza-desktop" className="scroll-mt-20">
              <BarcazaCard />
            </div>
          </div>

          <section className="space-y-3 rounded-lg border bg-card/60 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Colectivos y servicios
            </h2>
            <p className="text-sm text-muted-foreground">
              Estamos preparando recorridos de colectivos, teléfonos útiles y
              más servicios prácticos del día a día.
            </p>
          </section>

          <section className="space-y-3 rounded-lg border bg-card/60 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Más leídas
            </h2>
            <div className="space-y-2">
              {latest.slice(0, 5).map((noticia: NoticiaSlim, index: number) => (
                <NoticiaLink
                  key={noticia.id}
                  variant="minimal"
                  noticia={noticia as any}
                  order={index}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-lg border bg-card/60 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Nube de temas
            </h2>
            <p className="text-xs text-muted-foreground">
              Próximamente: visualización de las palabras y categorías más
              frecuentes en las noticias recientes para entender rápido de qué
              se está hablando en miTDF.
            </p>
            {sidebarCloud.length > 0 && (
              <div className="space-y-1 pt-1">
                {sidebarCloud.map((noticia: NoticiaSlim) => (
                  <NoticiaLink
                    key={noticia.id}
                    variant="minimal"
                    noticia={noticia as any}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3 rounded-lg border bg-card/60 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Buscador avanzado
            </h2>
            <p className="text-xs text-muted-foreground">
              Usá el buscador de la barra superior para encontrar noticias por
              tema, lugar o medio. En breve vas a tener filtros avanzados desde
              esta tarjeta.
            </p>
            {sidebarSearch.length > 0 && (
              <div className="space-y-1 pt-1">
                {sidebarSearch.map((noticia: NoticiaSlim) => (
                  <NoticiaLink
                    key={noticia.id}
                    variant="minimal"
                    noticia={noticia as any}
                  />
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
