import { Noticia } from '@prisma/client'

// Configuración centralizada para la distribución de noticias
// Cada número representa la cantidad de noticias para esa sección
export const NOTICIAS_RANGES = {
  FEATURED: 1, // 1 noticia destacada
  MAIN_SECTION: 2, // 3 noticias principales
  RIGHT_COLUMN: 2, // 4 noticias de la columna derecha
  MORE_NEWS: 2, // 2 noticias adicionales
  ARCHIVE_NEWS: 20, // 20 noticias del archivo
  HORIZONTAL_NEWS: 20, // 20 noticias horizontales
  MINIMAL_NEWS: 20, // 20 noticias mínimas
  EXTRA_NEWS: 26, // 26 noticias extra (total: 96)
} as const

export interface NoticiasDistribution {
  urgent: Noticia | null
  featured: Noticia[]
  mainSection: Noticia[]
  rightColumn: Noticia[]
  moreNews: Noticia[]
  archiveNews: Noticia[]
  horizontalNews: Noticia[]
  minimalNews: Noticia[]
  extraNews: Noticia[]
}

export function distributeNoticias(noticias: Noticia[]): NoticiasDistribution {
  // Buscar noticia urgente
  const urgentNoticia = noticias.find((noticia) => noticia.badge === 'URGENTE') || null

  // Filtrar noticias sin la urgente para el resto de la distribución
  const noticiasSinUrgente = urgentNoticia ? noticias.filter((noticia) => noticia.id !== urgentNoticia.id) : noticias

  let currentIndex = 0

  return {
    // Noticia urgente (solo una)
    urgent: urgentNoticia,

    // Noticia destacada (primera de las no urgentes)
    featured: noticiasSinUrgente.slice(currentIndex, (currentIndex += NOTICIAS_RANGES.FEATURED)),

    // Sección principal
    mainSection: noticiasSinUrgente.slice(currentIndex, (currentIndex += NOTICIAS_RANGES.MAIN_SECTION)),

    // Columna derecha
    rightColumn: noticiasSinUrgente.slice(currentIndex, (currentIndex += NOTICIAS_RANGES.RIGHT_COLUMN)),

    // Más noticias
    moreNews: noticiasSinUrgente.slice(currentIndex, (currentIndex += NOTICIAS_RANGES.MORE_NEWS)),

    // Noticias del archivo
    archiveNews: noticiasSinUrgente.slice(currentIndex, (currentIndex += NOTICIAS_RANGES.ARCHIVE_NEWS)),

    // Noticias horizontales
    horizontalNews: noticiasSinUrgente.slice(currentIndex, (currentIndex += NOTICIAS_RANGES.HORIZONTAL_NEWS)),

    // Noticias mínimas
    minimalNews: noticiasSinUrgente.slice(currentIndex, (currentIndex += NOTICIAS_RANGES.MINIMAL_NEWS)),

    // Noticias extra
    extraNews: noticiasSinUrgente.slice(currentIndex, (currentIndex += NOTICIAS_RANGES.EXTRA_NEWS)),
  }
}

export function getNoticiasForSection(noticias: Noticia[], section: keyof NoticiasDistribution): Noticia[] {
  const distribution = distributeNoticias(noticias)
  return distribution[section]
}

// Función helper para obtener noticias de una sección específica
export function getNoticiasBySection(noticias: Noticia[], section: keyof NoticiasDistribution): Noticia[] {
  const distribution = distributeNoticias(noticias)
  return distribution[section]
}

// Función para obtener estadísticas de distribución
export function getDistributionStats(noticias: Noticia[]): { total: number; used: number; unused: number } {
  const total = noticias.length
  const used = Math.min(96, total) // Usamos hasta 96 noticias
  const unused = Math.max(0, total - used)

  return { total, used, unused }
}
