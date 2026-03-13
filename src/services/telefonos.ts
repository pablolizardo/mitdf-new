import { prisma } from '@/lib/db'

const ciudadMap: Record<string, number> = {
  'rio-grande': 1,
  'ushuaia': 2,
  'tolhuin': 3,
}

export async function getTelefonosByCiudad(ciudad: string) {
  const ciudadId = ciudadMap[ciudad] || 1
  return await prisma.telefono.findMany({
    where: {
      ciudad_id: ciudadId,
    },
    orderBy: {
      nom: 'asc',
    },
  })
}

export async function getAllTelefonos() {
  return await prisma.telefono.findMany({
    orderBy: [
      { ciudad_id: 'asc' },
      { nom: 'asc' },
    ],
  })
}

