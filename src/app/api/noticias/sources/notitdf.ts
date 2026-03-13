const url = 'https://www.notitdf.com/wp-json/wp/v2/posts'


import { prisma } from '@/lib/db'
import { slugify, truncateSlug } from "@/lib/utils";
import { COUNT } from "../route";
import { INoticia } from "./types";

export const fetchNotiTdf = async () => {
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
        noticias.push({
            _id: truncateSlug(slugify(noticia.title.rendered), 100), // Ahora usando title.rendered
            slug: truncateSlug(slugify(noticia.title.rendered), 100),
            bajada: noticia.excerpt.rendered.replace(/<[^>]*>/g, ''), // Removiendo HTML tags
            categoria: "Regionales", // Podrías mapear categories[] a nombres si lo necesitas
            fecha: new Date(noticia.date).toISOString(),
            foto: noticia.yoast_head_json.og_image[0]?.url ?? "default-image-url",
            longtext: noticia.content.rendered,
            medio: "NotiTDF",
            titulo: noticia.title.rendered,
            url: noticia.link,
            written_at: new Date(noticia.date),
        });
    });
    return noticias;
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
        robots?: {
            index: string;
            follow: string;
            "max-snippet": string;
            "max-image-preview": string;
            "max-video-preview": string;
        };
        canonical?: string;
        og_locale?: string;
        og_type?: string;
        og_title?: string;
        og_description?: string;
        og_url?: string;
        og_site_name?: string;
        article_published_time?: string;
        og_image: Array<{
            width: number;
            height: number;
            url: string;
            type: string;
        }>;
        author?: string;
        twitter_card?: string;
        twitter_misc?: {
            [key: string]: string;
        };
        schema?: any;
    };
    class_list: string[];
    acf: any[];
    _links: {
        self: Array<{
            href: string;
            targetHints?: {
                allow: string[];
            };
        }>;
        collection: Array<{ href: string; }>;
        about: Array<{ href: string; }>;
        author: Array<{
            embeddable: boolean;
            href: string;
        }>;
    };
}
