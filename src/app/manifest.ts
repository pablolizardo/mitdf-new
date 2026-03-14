import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'miTDF Noticias de Tierra del Fuego',
    short_name: 'miTDF',
    description:
      'Noticias de Tierra del Fuego, Argentina. Información actualizada de Ushuaia, Rio Grande y Tolhuin. Vuelos, clima, farmacias, directorio y más.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait',
    scope: '/',
    lang: 'es-AR',
    dir: 'ltr',
    categories: ['news', 'weather', 'travel', 'business'],
    icons: [
      {
        src: '/mitdf.webp',
        sizes: '192x192',
        type: 'image/webp',
        purpose: 'any',
      },
      {
        src: '/mitdf.webp',
        sizes: '512x512',
        type: 'image/webp',
        purpose: 'any maskable',
      },
    ],
    screenshots: [
      {
        src: '/banner.jpg',
        sizes: '1280x720',
        type: 'image/jpeg',
        form_factor: 'wide',
        label: 'miTDF Noticias - Vista de escritorio',
      },
    ],
    shortcuts: [
      {
        name: 'Barcaza',
        short_name: 'Barcaza',
        description: 'Horarios y estado de la barcaza Tabsa',
        url: '/barcaza',
        icons: [{ src: '/mitdf.webp', sizes: '192x192' }],
      },
      {
        name: 'Farmacias',
        short_name: 'Farmacias',
        description: 'Farmacia de turno en Tierra del Fuego',
        url: '/farmacias',
        icons: [{ src: '/mitdf.webp', sizes: '192x192' }],
      },
      {
        name: 'Noticias',
        short_name: 'Noticias',
        description: 'Últimas noticias de Tierra del Fuego',
        url: '/',
        icons: [{ src: '/mitdf.webp', sizes: '192x192' }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
    edge_side_panel: {
      preferred_width: 400,
    },
  }
}
