import { prisma } from '@/lib/db'
import { fetchNoticias } from './noticias'
import { slugify, truncateSlug } from '@/lib/utils'

async function getGeminiModel() {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  return genAI.getGenerativeModel({ model: 'gemini-pro' })
}

interface NoticiaData {
  titulo: string
  bajada?: string
  fecha: Date | string
  categoria?: string
  imagen?: string
  foto?: string
  longtext?: string
}

type NoticiaTemplate = {
  hora: number
  categoria: string
  tipo: string
  prompt: string
}

const HORARIOS: NoticiaTemplate[] = [
  {
    hora: 8,
    categoria: 'Política',
    tipo: 'nacional',
    prompt: 'Escribe una noticia política nacional basada en estos hechos, con un estilo periodístico profesional y objetivo:',
  },
  {
    hora: 11,
    categoria: 'Economía',
    tipo: 'economia',
    prompt: 'Redacta una noticia sobre economía basada en esta información, enfocándote en el impacto local y usando un lenguaje claro y preciso:',
  },
  {
    hora: 14,
    categoria: 'Política',
    tipo: 'provincial',
    prompt: 'Genera una noticia sobre política provincial a partir de estos eventos, manteniendo un tono informativo y equilibrado:',
  },
  {
    hora: 17,
    categoria: 'Local',
    tipo: 'local',
    prompt: 'Escribe una noticia local basada en estos acontecimientos, destacando su relevancia para la comunidad:',
  },
  {
    hora: 20,
    categoria: 'Cultura y Deportes',
    tipo: 'cultural',
    prompt: 'Redacta una noticia cultural o deportiva a partir de esta información, con un estilo dinámico y atractivo:',
  },
  {
    hora: 23,
    categoria: 'Resumen',
    tipo: 'resumen',
    prompt: 'Genera un resumen de las noticias más importantes del día, organizando la información de manera clara y concisa:',
  },
] as const

const CIUDADES = ['Río Grande', 'Ushuaia', 'Tolhuin'] as const

function seleccionarCiudad(tipo: string): string {
  if (tipo === 'local') {
    return CIUDADES[Math.floor(Math.random() * CIUDADES.length)]
  }
  return 'Ushuaia' // Default para noticias provinciales/nacionales
}

export async function generarNoticia(template: NoticiaTemplate): Promise<void> {
  try {
    const ultimasNoticias = (await fetchNoticias(48)) as NoticiaData[]

    const noticiasRelevantes = ultimasNoticias.filter((noticia: NoticiaData) => {
      if (template.tipo === 'resumen') return true
      return noticia.bajada?.toLowerCase().includes(template.tipo) ?? false
    })

    if (noticiasRelevantes.length === 0) {
      return
    }

    const contexto = noticiasRelevantes.map((n) => `${n.titulo}\n${n.bajada || ''}\n${n.longtext || ''}\n`).join('\n---\n')

    const prompt = `${template.prompt}\n\nContexto:\n${contexto}\n\nGenera una noticia completa con título, bajada (máximo 100 caracteres) y cuerpo.`

    const model = await getGeminiModel()
    const result = await model.generateContent(prompt)
    const response = result.response.text()
    const [title, ...contentLines] = response.split('\n')
    const titulo = title.replace(/^#\s*/, '')
    const bajada = contentLines[0].replace(/^#\s*/, '').substring(0, 100)
    const longText = contentLines.slice(1).join('\n\n')

    const imagen = noticiasRelevantes[0].imagen || noticiasRelevantes[0].foto || ''
    const ciudad = seleccionarCiudad(template.tipo)
    const slug = truncateSlug(slugify(titulo), 100)

    await prisma.noticia.create({
      data: {
        titulo,
        bajada,
        longtext: longText,
        foto: imagen,
        medio: 'miTDF',
        categoria: template.categoria,
        ciudad,
        fecha: new Date().toISOString(),
        slug,
        written_at: new Date().toISOString(),
        written_at_date: new Date(),
      },
    })
  } catch (error) {
    console.error(`Error generando noticia ${template.tipo}:`, error)
  }
}

// export async function programarGeneracionNoticias() {
//     const now = new Date();

//     for (const template of HORARIOS) {
//         const scheduledTime = new Date();
//         scheduledTime.setHours(template.hora, 0, 0, 0);

//         if (scheduledTime < now) {
//             scheduledTime.setDate(scheduledTime.getDate() + 1);
//         }

//         const delay = scheduledTime.getTime() - now.getTime();

//         setTimeout(async () => {
//             await generarNoticia(template);
//             setInterval(async () => {
//                 await generarNoticia(template);
//             }, 24 * 60 * 60 * 1000);
//         }, delay);
//     }
// }
