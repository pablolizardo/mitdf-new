import { prisma } from '@/lib/db'

export async function getConcejales() {
  return await prisma.concejal.findMany({
    where: {
      activo: true,
    },
    orderBy: [
      { ciudad: 'asc' },
      { orden: 'asc' },
    ],
  })
}

export async function getConcejalesByCiudad(ciudad: string) {
  return await prisma.concejal.findMany({
    where: {
      ciudad,
      activo: true,
    },
    orderBy: {
      orden: 'asc',
    },
  })
}

export async function getConcejalesByPartido(partido: string) {
  return await prisma.concejal.findMany({
    where: {
      partido,
      activo: true,
    },
    orderBy: [
      { ciudad: 'asc' },
      { orden: 'asc' },
    ],
  })
}

export async function getConcejalesGroupedByCiudad() {
  const concejales = await getConcejales()
  const grouped: Record<string, typeof concejales> = {}
  
  for (const concejal of concejales) {
    if (!grouped[concejal.ciudad]) {
      grouped[concejal.ciudad] = []
    }
    grouped[concejal.ciudad].push(concejal)
  }
  
  return grouped
}

