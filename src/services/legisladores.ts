import { prisma } from '@/lib/db'

export async function getLegisladores() {
  return await prisma.legislador.findMany({
    orderBy: [
      { bloque: 'asc' },
      { es_presidente_bloque: 'desc' },
      { apellido: 'asc' },
    ],
  })
}

export async function getLegisladoresByBloque(bloque: string) {
  return await prisma.legislador.findMany({
    where: {
      bloque,
    },
    orderBy: [
      { es_presidente_bloque: 'desc' },
      { apellido: 'asc' },
    ],
  })
}

export async function getLegisladoresConfig() {
  const configs = await prisma.legisladorConfig.findMany()
  const configMap: Record<string, string> = {}
  for (const config of configs) {
    configMap[config.bloque] = config.color
  }
  return configMap
}

