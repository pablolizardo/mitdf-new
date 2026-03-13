import { prisma } from '@/lib/db'

export async function getCandidatos() {
  return await prisma.candidato.findMany({
    orderBy: {
      alianza: 'asc',
    },
  })
}

export async function getCandidatosByTipo(tipo: 'senado' | 'diputados') {
  return await prisma.candidato.findMany({
    where: {
      tipo,
    },
    orderBy: {
      alianza: 'asc',
    },
  })
}

export async function getCandidatosByAlianza(alianza: string) {
  return await prisma.candidato.findMany({
    where: {
      alianza,
    },
  })
}

export async function getCandidatosGrouped() {
  const candidatos = await getCandidatos()
  const grouped: Record<string, { 
    nombre: string
    color: string
    lista: string
    logo: string
    senado: any[]
    diputados: any[]
  }> = {}
  
  for (const candidato of candidatos) {
    if (!grouped[candidato.alianza]) {
      grouped[candidato.alianza] = {
        nombre: candidato.alianza,
        color: candidato.color,
        lista: candidato.lista,
        logo: candidato.logo,
        senado: [],
        diputados: [],
      }
    }
    
    if (candidato.tipo === 'senado') {
      grouped[candidato.alianza].senado = candidato.candidatos as any[]
    } else if (candidato.tipo === 'diputados') {
      grouped[candidato.alianza].diputados = candidato.candidatos as any[]
    }
  }
  
  return Object.values(grouped).map(alianza => ({
    nombre: alianza.nombre,
    color: alianza.color,
    lista: alianza.lista,
    logo: alianza.logo,
    candidatos: {
      senado: alianza.senado,
      diputados: alianza.diputados,
    },
  }))
}

