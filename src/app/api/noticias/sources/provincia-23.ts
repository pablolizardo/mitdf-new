const url = 'https://www.provincia23.com.ar/wp-json/wp/v2/posts'

import { prisma } from '@/lib/db'
import { slugify, truncateSlug } from "@/lib/utils";
import { COUNT } from "../route";
import { INoticia } from "./types";

export const fetchProvincia23 = async () => {
    const response = await fetch(url,
        {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; NewsAggregator/1.0)',
            },
        }
    )
    const data = await response.json() as WordPressPost[]

    const noticias: INoticia[] = [];
    data.slice(0, COUNT).forEach((noticia: WordPressPost) => {
        if (noticia.content.rendered.match(/<img[^>]+src="([^">]+)"/)?.[1]) {
            noticias.push({
                _id: truncateSlug(slugify(noticia.title.rendered), 100), // Ahora usando title.rendered
                slug: truncateSlug(slugify(noticia.title.rendered), 100),
                bajada: noticia.excerpt.rendered.replace(/<[^>]*>/g, ''), // Removiendo HTML tags
                categoria: "Regionales", // Podrías mapear categories[] a nombres si lo necesitas
                fecha: new Date(noticia.date).toISOString(),
                foto: getHighestQualityImage(noticia.content.rendered) || "",
                longtext: noticia.content.rendered,
                medio: "Provincia 23",
                titulo: noticia.title.rendered,
                url: noticia.link,
                written_at: new Date(noticia.date),
            });
        }

    });
    return noticias;
}

const getHighestQualityImage = (content: string) => {
    const matches = content.match(/srcset="([^"]+)"/);
    if (matches) {
        const srcset = matches[1];
        const urls = srcset.split(', ');
        const scaledImage = urls.find(url => url.includes('-scaled.jpg'));
        if (scaledImage) {
            return scaledImage.split(' ')[0];
        }
    }
    return content.match(/<img[^>]+src="([^">]+)"/)?.[1];
}

interface WordPressPost {
    id: number;
    date: string;
    date_gmt: string;
    guid: {
        rendered: string;
    };
    modified: string;
    modified_gmt: string;
    slug: string;
    status: string;
    type: string;
    link: string;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
        protected: boolean;
    };
    excerpt: {
        rendered: string;
        protected: boolean;
    };
    author: number;
    featured_media: number;
    comment_status: string;
    ping_status: string;
    sticky: boolean;
    template: string;
    format: string;
    meta: {
        _monsterinsights_skip_tracking: boolean;
        _monsterinsights_sitenote_active: boolean;
        _monsterinsights_sitenote_note: string;
        _monsterinsights_sitenote_category: number;
        footnotes: string;
    };
    categories: number[];
    tags: any[];
    yoast_head: string;
    yoast_head_json: {
        title: string;
        og_image: Array<{
            width: number;
            height: number;
            url: string;
            type: string;
        }>;
    };

}
