import * as cheerio from "cheerio";
import { COUNT } from "../route";
import { INoticia } from "./types";
import { randomTimeGenerator, slugify, truncateSlug } from "@/lib/utils";

export const fetchDiecinueve = async () => {
  const noticias: INoticia[] = [];

  const response: Response = await fetch("https://19640noticias.com/categoria/4/tierra-del-fuego", {
    next: {
      revalidate: 900
    }
  });
  const htmlString: string = await response.text();
  const soup: cheerio.CheerioAPI = cheerio.load(htmlString);

  await Promise.all(
    soup("article.post.post__noticia h3.post__titulo a")
      .toArray()
      .slice(0, COUNT)
      .map(async (link: any) => {
        const _url = `https://19640noticias.com${soup(link).attr("href")}`;
        const response: Response = await fetch(String(_url));
        const htmlString: string = await response.text();
        const newsoup: cheerio.CheerioAPI = cheerio.load(htmlString);
        const _titulo = newsoup("h1.fullpost__titulo").text().trim();

        const noticia = {
          _id: truncateSlug(slugify(_titulo), 100),
          slug: truncateSlug(slugify(_titulo), 100),
          url: _url,
          titulo: _titulo,
          bajada: newsoup("p.fullpost__copete").text().trim(),
          categoria: newsoup("span.fullpost__categoria a").text().trim(),
          fecha: newsoup("span.fullpost__fecha span.fecha").text().trim(),
          foto: "https://19640noticias.com" + newsoup("div.fullpost__imagen img").attr("data-src"),
          longtext:
            newsoup("div.fullpost__cuerpo")
              .text()
              .replace(/(\r\n|\n|\r)/gm, "")
              .trim() || "",
          medio: "19640 Noticias",
          tags: [],
          // tags: newsoup(".fullpost__etiquetas a")
          //   .toArray()
          //   .map((tag: string) => soup(tag).text()),
          written_at: randomTimeGenerator(),
        };
        noticias.push(noticia);
      })
  );
  return noticias;
};
