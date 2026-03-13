import { prisma } from '@/lib/db'

export async function getLinks() {
  return await prisma.link.findMany({
    where: {
      active: true,
    },
    orderBy: {
      orden: 'asc',
    },
  })
}

export async function getFeaturedLinks() {
  return await prisma.link.findMany({
    where: {
      active: true,
      featured: true,
    },
    orderBy: {
      orden: 'asc',
    },
  })
}

export async function getLinkByHref(href: string) {
  return await prisma.link.findUnique({
    where: {
      href,
    },
  })
}

