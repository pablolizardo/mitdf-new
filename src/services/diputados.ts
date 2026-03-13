import { prisma } from '@/lib/db'

export async function getDiputados() {
  return await prisma.diputado.findMany({
    orderBy: [
      { provincia: 'asc' },
      { apellido: 'asc' },
    ],
  })
}

export async function getDiputadosByProvincia(provincia: string) {
  return await prisma.diputado.findMany({
    where: {
      provincia,
    },
    orderBy: {
      apellido: 'asc',
    },
  })
}

export async function getDiputadosByBloque(bloque: string) {
  return await prisma.diputado.findMany({
    where: {
      bloque,
    },
    orderBy: {
      apellido: 'asc',
    },
  })
}

export async function getDiputadosConfig() {
  const configs = await prisma.diputadoConfig.findMany()
  const configMap: Record<string, string> = {}
  for (const config of configs) {
    configMap[config.bloque] = config.color
  }
  return configMap
}

