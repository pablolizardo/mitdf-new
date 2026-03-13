import { prisma } from '@/lib/db'

export async function getCamaras() {
  return await prisma.camara.findMany({
    where: {
      activo: true,
    },
    orderBy: {
      orden: 'asc',
    },
  })
}

export async function getCamaraBySlug(slug: string) {
  return await prisma.camara.findUnique({
    where: {
      slug,
    },
  })
}

export async function getCamarasByCiudad(ciudad: string) {
  return await prisma.camara.findMany({
    where: {
      ciudad,
      activo: true,
    },
    orderBy: {
      orden: 'asc',
    },
  })
}

