import { prisma } from '@/lib/db'

export async function getMedios() {
  return await prisma.medio.findMany({
    where: {
      activo: true,
    },
    orderBy: {
      orden: 'asc',
    },
  })
}

export async function getMedioByNombre(nombre: string) {
  return await prisma.medio.findUnique({
    where: {
      nombre,
    },
  })
}

export async function getMediosMap() {
  const medios = await getMedios()
  const mediosMap: Record<string, { color: string; image: string; iconName: string | null }> = {}
  for (const medio of medios) {
    mediosMap[medio.nombre] = {
      color: medio.color,
      image: medio.image,
      iconName: medio.iconName,
    }
  }
  return mediosMap
}

