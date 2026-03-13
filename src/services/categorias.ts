import { prisma } from '@/lib/db'

export async function getCategorias() {
  return await prisma.categoria.findMany({
    where: {
      activo: true,
    },
    orderBy: {
      orden: 'asc',
    },
  })
}

export async function getCategoriaByNombre(nombre: string) {
  return await prisma.categoria.findUnique({
    where: {
      nombre,
    },
  })
}

export async function getCategoriasMap() {
  const categorias = await getCategorias()
  const categoriasMap: Record<string, { color: string; iconName: string | null }> = {}
  for (const categoria of categorias) {
    categoriasMap[categoria.nombre] = {
      color: categoria.color,
      iconName: categoria.iconName,
    }
  }
  return categoriasMap
}

