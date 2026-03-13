import { randomTimeGenerator, slugify, truncateSlug } from "@/lib/utils";
import * as cheerio from "cheerio";
import { COUNT } from "../route";
import { INoticia } from "./types";

export const fetchSur54 = async () => {
  const noticias: INoticia[] = [];

  const response: Response = await fetch("http://www.sur54.com/", { next: { revalidate: 900 } });
  const htmlString: string = await response.text();
  const soup: cheerio.CheerioAPI = cheerio.load(htmlString);

  await Promise.all(
    soup(".header-noticia .titulo p a")
      .toArray()
      .slice(0, COUNT)
      .map(async (link: any) => {
        const _url = String(soup(link).attr("href"));

        const response: Response = await fetch(String(_url));
        const htmlString: string = await response.text();
        const newsoup: cheerio.CheerioAPI = cheerio.load(htmlString);
        const _titulo = newsoup("h2.titulo-noti1").text().trim();

        const noticia = {
          _id: truncateSlug(slugify(_titulo), 100),
          slug: truncateSlug(slugify(_titulo), 100),
          url: _url,
          titulo: _titulo,
          bajada: newsoup("h2.titulo-noti1").next().text().trim(),
          longtext: newsoup("div.copete.sofia p").text().trim(),
          categoria: newsoup("div.col-md-6.col-xs-6.text-left.title-excerpt2.text-expert-interna").text().trim(),
          fecha: newsoup("div.col-md-12.col-sm-12.col-xs-12.margen-section > span:nth-child(1)").text().trim(),
          ///http://www.sur54.com/data/upload/news/96abf949436975f2fb264c34800adbcc-Portada%20Sur54%20-%202022-11-30T155804.921.jpg
          foto: `http://www.sur54.com/${encodeURI(
            newsoup(".img-responsive.text-center.center-img").attr("src") || ""
          )}`,
          medio: "Sur54",
          ciudad: "Ushuaia",
          tags: [],
          written_at: randomTimeGenerator(),
        };
        noticias.push(noticia);
      })
  );
  return noticias;
};
