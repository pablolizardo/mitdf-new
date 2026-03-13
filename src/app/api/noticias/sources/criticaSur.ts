import * as cheerio from "cheerio";
import { COUNT } from "../route";
import { INoticia } from "./types";
import { randomTimeGenerator, slugify, truncateSlug } from "@/lib/utils";
import { isBuildTime } from '@/lib/build-utils';

export const fetchCriticaSur = async () => {
  const noticias: INoticia[] = [];

  // Evitar fetch durante el build
  if (isBuildTime()) {
    return noticias;
  }

  const response: Response = await fetch("https://criticasur.com.ar/seccion/provincia/", {
    next: {
      revalidate: 900
    }
  });
  const htmlString: string = await response.text();
  const soup: cheerio.CheerioAPI = cheerio.load(htmlString);

  await Promise.all(
    soup("article.has_image a")
      .toArray()
      .slice(0, COUNT)
      .map(async (link: any) => {
        const _url = `https://criticasur.com.ar${soup(link).attr("href")?.slice(1, -1)}` || "";
        const response: Response = await fetch(String(_url));
        const htmlString: string = await response.text();
        const newsoup: cheerio.CheerioAPI = cheerio.load(htmlString);
        const _titulo = newsoup("h1.ctitle").text().trim();

        const noticia = {
          _id: truncateSlug(slugify(_titulo), 100),
          slug: truncateSlug(slugify(_titulo), 100),
          url: _url,
          titulo: _titulo,
          bajada: newsoup("h2.ctext").text().trim(),
          longtext:
            newsoup("div.wysiwyg")
              .text()
              .replace(/(\r\n|\n|\r)/gm, "")
              .trim() || "",
          categoria: newsoup("h3.cprincipal").text().trim(),
          fecha: newsoup("div.ffalt.fz10.ctext.ttu.bdb.bdtextlight").text().trim().split(" » ")[2],
          foto: `https://criticasur.com.ar${newsoup("section#galeria-noticia img").last()?.attr("src")?.replace("./", "/") || ""
            }`,
          medio: "Critica Sur",
          tags: [],
          written_at: randomTimeGenerator(),
        };
        noticias.push(noticia);
      })
  );
  return noticias;
};
