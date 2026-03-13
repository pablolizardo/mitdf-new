import { prisma } from '@/lib/db'

// Función para normalizar strings (quitar acentos y convertir a minúsculas)
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar diacríticos (acentos)
    .trim()
}

export async function getDirectorioByCiudadAndTitulo(ciudad: string, titulo: string) {
  // Obtener todos los registros de la ciudad activos
  const resultados = await prisma.directorio.findMany({
    where: {
      ciudad,
      activo: true,
    },
    orderBy: {
      orden: 'asc',
    },
  })
  
  // Normalizar el título buscado (sin acentos, minúsculas)
  const tituloNormalizado = normalizeString(titulo)
  
  // Filtrar para asegurar coincidencia exacta (ignorando mayúsculas/minúsculas y acentos)
  const filtrados = resultados.filter(p => normalizeString(p.titulo) === tituloNormalizado)
  
  // Debug logging (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('getDirectorioByCiudadAndTitulo Debug:', {
      ciudad,
      titulo,
      tituloNormalizado,
      totalEnCiudad: resultados.length,
      filtrados: filtrados.length,
      titulosEnCiudad: resultados.map(p => ({ original: p.titulo, normalizado: normalizeString(p.titulo) })).slice(0, 5)
    })
  }
  
  return filtrados
}

export async function getDirectorioByCiudad(ciudad: string) {
  return await prisma.directorio.findMany({
    where: {
      ciudad,
      activo: true,
    },
    orderBy: {
      titulo: 'asc',
    },
  })
}

export async function getAllDirectorio() {
  return await prisma.directorio.findMany({
    where: {
      activo: true,
    },
    orderBy: {
      ciudad: 'asc',
    },
  })
}

