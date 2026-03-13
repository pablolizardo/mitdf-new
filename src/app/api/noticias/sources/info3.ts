import { randomTimeGenerator, slugify, truncateSlug } from "@/lib/utils";
import { COUNT } from "../route";
import { INoticia } from "./types";

export const fetchInfo3 = async () => {

  const data: Response = await fetch(
    "https://bridge.tvfuego.com.ar/api/tvf/prod/datacenter/noticias/cover?cover=3",
    {
      headers: { Authorization: "jp0c8vB6LcAfR5gIshVRNJ3ZoxnNHfAWIRAOBIfuRls" },
      next: { revalidate: 900 }
    }
  );
  const noticiasOriginal = await data.json();

  const noticias: INoticia[] = [];
  noticiasOriginal.data.slice(0, COUNT).forEach((noticia: { titulo: any; bajada: any; categoria: { nombre: any; }; ciudad: { abreviatura: any; }; created_at: any; foto: any; long_text: any; id: any; }) => {
    noticias.push({
      _id: truncateSlug(slugify(noticia.titulo), 100),
      slug: truncateSlug(slugify(noticia.titulo), 100),
      bajada: noticia.bajada,
      categoria: noticia.categoria.nombre,
      ciudad: noticia.ciudad.abreviatura,
      fecha: noticia.created_at,
      foto: `https://bridge.tvfuego.com.ar/uploads/noticias/${noticia.foto}`,
      longtext: noticia.long_text ?? "",
      medio: "Info3Noticias",
      titulo: noticia.titulo,
      url: `https://www.info3noticias.com.ar/#/noticia/${noticia.id}`,
      written_at: randomTimeGenerator(),
    });
  });
  return noticias;
};
