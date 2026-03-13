import { prisma } from '@/lib/db'

export async function getSenadores() {
  return await prisma.senador.findMany({
    orderBy: [
      { provincia: 'asc' },
      { apellido: 'asc' },
    ],
  })
}

export async function getSenadoresByProvincia(provincia: string) {
  return await prisma.senador.findMany({
    where: {
      provincia,
    },
    orderBy: {
      apellido: 'asc',
    },
  })
}

export async function getSenadoresByBloque(bloque: string) {
  return await prisma.senador.findMany({
    where: {
      bloque,
    },
    orderBy: {
      apellido: 'asc',
    },
  })
}

export async function getSenadoresConfig() {
  const configs = await prisma.senadorConfig.findMany()
  const configMap: Record<string, string> = {}
  for (const config of configs) {
    configMap[config.bloque] = config.color
  }
  return configMap
}

