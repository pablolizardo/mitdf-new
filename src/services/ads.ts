import { prisma } from '@/lib/db'
import { cache } from 'react'

export interface Ad {
  id: string
  cliente: string
  titulo: string
  link: string
  fechaInicio: Date
  fechaFin: Date
  importancia: number
  layout: 'HORIZONTAL' | 'VERTICAL' | 'CENTERED'
  thumb?: string
  imagen?: string
  activo: boolean
}

export const getActiveAds = cache(async (): Promise<Ad[]> => {
  const now = new Date()
  
  const ads = await prisma.ad.findMany({
    where: {
      activo: true,
      fechaInicio: { lte: now },
      fechaFin: { gte: now }
    },
    orderBy: [
      { importancia: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  return ads
})

export const getRandomAd = async (): Promise<Ad | null> => {
  const ads = await getActiveAds()
  
  if (ads.length === 0) {
    return null
  }

  // Calcular pesos basados en importancia
  const weights = ads.map(ad => ad.importancia)
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  
  if (totalWeight === 0) {
    return ads[Math.floor(Math.random() * ads.length)]
  }

  // Seleccionar ad basado en pesos
  let random = Math.random() * totalWeight
  for (let i = 0; i < ads.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return ads[i]
    }
  }

  return ads[0]
}

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const getAdsByLayout = async (layout: 'HORIZONTAL' | 'VERTICAL' | 'CENTERED'): Promise<Ad[]> => {
  const ads = await getActiveAds()
  return shuffleArray(ads.filter(ad => ad.layout === layout))
}

export const getRandomAdByLayout = async (
  layout: 'HORIZONTAL' | 'VERTICAL' | 'CENTERED',
  excludeIds: string[] = []
): Promise<Ad | null> => {
  const ads = await getActiveAds()
  
  let filteredAds = ads.filter(ad => ad.layout === layout && !excludeIds.includes(ad.id))
  
  if (filteredAds.length === 0) {
    filteredAds = ads.filter(ad => ad.layout === layout)
  }
  
  if (filteredAds.length === 0) {
    return null
  }

  return filteredAds[Math.floor(Math.random() * filteredAds.length)]
}
