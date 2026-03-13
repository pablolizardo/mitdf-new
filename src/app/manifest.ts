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
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/featured.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'miTDF Noticias - Vista de escritorio',
      },
      {
        src: '/featured.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'miTDF Noticias - Vista móvil',
      },
    ],
    shortcuts: [
      {
        name: 'Clima',
        short_name: 'Clima',
        description: 'Ver el clima actual en Tierra del Fuego',
        url: '/clima',
        icons: [{ src: '/icon.png', sizes: '192x192' }],
      },
      {
        name: 'Vuelos',
        short_name: 'Vuelos',
        description: 'Estado de vuelos en Ushuaia y Rio Grande',
        url: '/vuelos/ushuaia',
        icons: [{ src: '/icon.png', sizes: '192x192' }],
      },
      {
        name: 'Farmacias',
        short_name: 'Farmacias',
        description: 'Farmacias de turno en Tierra del Fuego',
        url: '/farmacias',
        icons: [{ src: '/icon.png', sizes: '192x192' }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
    edge_side_panel: {
      preferred_width: 400,
    },
  }
}
