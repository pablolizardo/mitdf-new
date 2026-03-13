import { randomTimeGenerator, slugify, truncateSlug } from "@/lib/utils";
import * as cheerio from "cheerio";
import { COUNT } from "../route";
import { INoticia } from "./types";

export const fetchFinDelMundo = async () => {
  const noticias: INoticia[] = [];

  const response: Response = await fetch("https://www.eldiariodelfindelmundo.com/", {
    next: {
      revalidate: 900
    }
  });
  const htmlString: string = await response.text();
  const soup: cheerio.CheerioAPI = cheerio.load(htmlString);

  await Promise.all(
    soup(".titulo_elemento_noticia a")
      .toArray()
      .slice(0, COUNT)
      .map(async (link: any) => {
        const _url = `https://www.eldiariodelfindelmundo.com${soup(link).attr("href")}`;
        const response: Response = await fetch(String(_url));
        const htmlString: string = await response.text();
        const newsoup: cheerio.CheerioAPI = cheerio.load(htmlString);
        const _titulo = newsoup(".titulo_individual_noticia").text().trim();
        const _firstLetter = newsoup(".contenedor_primera_letra_individual_noticia").text();

        const noticia = {
          _id: truncateSlug(slugify(_titulo), 100),
          slug: truncateSlug(slugify(_titulo), 100),
          url: _url,
          titulo: _titulo,
          bajada: newsoup(".copete_individual_noticia").text().trim(),
          categoria: newsoup(".categoria_individual_noticia").text().trim(),
          fecha: newsoup(".fecha_individual_noticia").text().trim(),
          foto: String(newsoup(".imagen_individual_noticia img").attr("data-src")),
          medio: "El Diario del Fin del Mundo",
          ciudad: "Ushuaia",
          tags: newsoup(".contenedor_tags_individual_noticia")
            .text()
            .trim()
            .split("-")
            .map((tag: string) => tag.trim()),
          longtext: _firstLetter.trim() + newsoup(".contenido_individual_noticia p").html()?.trim(),
          written_at: randomTimeGenerator(),
        };
        noticias.push(noticia);
      })
  );
  return noticias;
};
