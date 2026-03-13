import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'

async function getGeminiModel() {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  return genAI.getGenerativeModel({ model: 'gemini-pro' })
}

export const getEditorialSummaries = async () => {
  const isDevelopment = process.env.NODE_ENV !== 'production'

  const getCachedEditorials = unstable_cache(
    async () => {
      const now = new Date()
      const today = new Date(now)
      today.setHours(0, 0, 0, 0)

      return await prisma.editorial.findMany({
        take: 2,
        // where: {
        //     date: {
        //         // gte: today,
        //         // lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        //     }
        // },
        orderBy: {
          date: 'desc',
        },
      })
    },
    ['editorial-summaries'],
    {
      revalidate: 3600,
      tags: ['editorial'],
    },
  )

  // Obtener editoriales cacheados
  const existingEditorials = (await getCachedEditorials()).map((editorial) => ({
    ...editorial,
    date: new Date(editorial.date),
  }))

  // En desarrollo, simplemente retornamos el último editorial disponible
  if (isDevelopment) {
    return existingEditorials.length > 0 ? existingEditorials : []
  }

  // A partir de aquí solo se ejecuta en producción
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const isMorning = now.getHours() >= 0 && now.getHours() < 14
  const targetHour = isMorning ? 10 : 18

  // Verificar si necesitamos generar uno nuevo
  const latestEditorial = existingEditorials[0]
  if (latestEditorial) {
    const editorialHour = latestEditorial.date.getHours()
    const isCurrentPeriod = isMorning ? editorialHour >= 10 && editorialHour < 14 : editorialHour >= 18

    if (isCurrentPeriod) {
      return existingEditorials
    }
  }

  // Si no hay editorial para este período o no es del período correcto, generamos uno nuevo
  const timeLabel = isMorning ? 'matutino' : 'vespertino'

  // Verificar si es la hora correcta para generar
  const currentHour = now.getHours()
  if ((isMorning && currentHour < 10) || (!isMorning && currentHour < 18)) {
    return existingEditorials.length > 0 ? existingEditorials : []
  }

  const noticias = await prisma.noticia.findMany({
    where: {
      written_at_date: {
        gte: today,
      },
    },
    orderBy: {
      written_at_date: 'desc',
    },
    take: 14,
    select: {
      titulo: true,
      longtext: true,
      bajada: true,
    },
  })

  if (noticias.length === 0) {
    return []
  }

  const prompt = `
    Actuá como un periodista de miTDF, un medio de noticias independiente de Tierra del Fuego ,Argentina.
	1.	Escribí un resumen de las noticias de la jornada.
	3.	Escribí en HTML.
	4.	Redactá una columna editorial analizando y opinando sobre las noticias del día en política, economía, soberanía militar nacional y geopolítica, desde una perspectiva de ciudadano fueguino, enfocándote en nuestra realidad regional.
    5. Enfocate en las noticias de la región.
    6. Encocate en noticias economicas y políticas.
    7. Ten una mirada critica con una posicion conservadora y mas tirado a la derecha.
    8. Sin decirlo, apoyá las políticas del gobierno nacional de Javier Milei.
    9. La columna debe tener 500 palabras.
    
    Noticias del día:
    ${noticias.map((n) => `- ${n.titulo}\n${n.longtext || n.bajada}`).join('\n\n')}
  `

  try {
    const model = await getGeminiModel()
    const result = await model.generateContent(prompt)
    const response = result.response.text()
    const [title, ...contentLines] = response.split('\n')

    const newEditorial = await prisma.editorial.create({
      data: {
        title: title.replace(/^#\s*/, ''),
        content: contentLines.join('\n').trim(),
        date: new Date(),
      },
    })

    return [newEditorial]
  } catch (error) {
    console.error(`❌ Error generando el editorial ${timeLabel}:`, error)
    return existingEditorials.length > 0 ? existingEditorials : []
  }
}
