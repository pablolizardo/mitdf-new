import { randomTimeGenerator, slugify, truncateSlug } from "@/lib/utils";
import * as cheerio from "cheerio";
import { COUNT } from "../route";
import { INoticia } from "./types";
import { isBuildTime } from '@/lib/build-utils';

export const fetchMinutoFueguino = async () => {
  const noticias: INoticia[] = [];

  // Evitar fetch durante el build
  if (isBuildTime()) {
    return noticias;
  }

  const response: Response = await fetch("https://www.minutofueguino.com.ar/provinciales", { next: { revalidate: 900 } });
  const htmlString: string = await response.text();
  const soup: cheerio.CheerioAPI = cheerio.load(htmlString);
  const noticiaSelector: cheerio.SelectorType = "#main .listado-article article a";
  await Promise.all(
    soup(noticiaSelector)
      .toArray()
      .slice(0, COUNT)
      .map(async (link: any) => {
        const _url = `https://www.minutofueguino.com.ar${soup(link).attr("href")}`;
        const response: Response = await fetch(String(_url));
        const htmlString: string = await response.text();
        const newsoup: cheerio.CheerioAPI = cheerio.load(htmlString);
        const _titulo = newsoup("h2#nota-title").text().trim();
        const slug = truncateSlug(slugify(_titulo), 100);

        const noticia = {
          _id: slug,
          slug: slug,
          url: _url,
          titulo: _titulo,
          bajada: newsoup("#main article.cont-cuerpo section.texto p").text().trim().slice(0, 500),
          longtext: newsoup("#main article.cont-cuerpo section.texto > *:not(div)").text() || "",
          categoria: "PROVINCIALES",
          fecha: newsoup("time.fecha-nota").text().trim(),
          foto: newsoup("#main article figure.nota-foto img").last()?.attr("data-src") || "",
          medio: "Minuto Fueguino",
          tags: [],
          written_at: randomTimeGenerator(),
        };
        noticias.push(noticia);
      })
  );
  // console.log(noticias);
  // console.log(noticias[0].bajada);
  // console.log(noticias[0].longtext);
  return noticias;
};

// fetchMinutoFueguino();
