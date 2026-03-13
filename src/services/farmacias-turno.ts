interface FarmaciaTurnoEvent {
  summary: string
  date: string
  location?: string
  ciudad: 'Río Grande' | 'Ushuaia'
}

interface ParsedEvent {
  dtstart: string
  dtend?: string
  summary: string
  location?: string
}

const parseICal = (icalContent: string): ParsedEvent[] => {
  const events: ParsedEvent[] = []
  const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g
  let match

  while ((match = eventRegex.exec(icalContent)) !== null) {
    const eventContent = match[1]
    const event: Partial<ParsedEvent> = {}

    const dtstartMatch = eventContent.match(/DTSTART[^:]*:(.+)/)
    if (dtstartMatch) {
      event.dtstart = dtstartMatch[1].trim()
    }

    const dtendMatch = eventContent.match(/DTEND[^:]*:(.+)/)
    if (dtendMatch) {
      event.dtend = dtendMatch[1].trim()
    }

    const summaryMatch = eventContent.match(/SUMMARY:(.+)/)
    if (summaryMatch) {
      event.summary = summaryMatch[1].trim()
    }

    const locationMatch = eventContent.match(/LOCATION:(.+)/)
    if (locationMatch) {
      event.location = locationMatch[1].trim().replace(/\\,/g, ',')
    }

    if (event.dtstart && event.summary) {
      events.push(event as ParsedEvent)
    }
  }

  return events
}

const parseDate = (dateStr: string): Date | null => {
  if (dateStr.length === 8) {
    const year = parseInt(dateStr.substring(0, 4))
    const month = parseInt(dateStr.substring(4, 6)) - 1
    const day = parseInt(dateStr.substring(6, 8))
    return new Date(year, month, day)
  }
  return null
}

export const extractFarmaciaInfo = (summary: string): { nombre: string; telefono?: string } => {
  const telefonoMatch = summary.match(/Tel\.?\s*([\d\s-]+)/i)
  const telefono = telefonoMatch ? telefonoMatch[1].trim() : undefined
  
  let nombre = summary
  if (telefono) {
    nombre = summary.replace(/Tel\.?\s*[\d\s-]+/i, '').trim()
  }
  
  nombre = nombre.replace(/-\s*$/, '').trim()
  
  return { nombre, telefono }
}

export const limpiarDireccion = (direccion: string): string => {
  if (!direccion) return ''
  
  return direccion
    .replace(/V\d{4}\s*,?\s*/i, '')
    .replace(/Río Grande,?\s*Tierra del Fuego,?\s*Argentina,?/gi, '')
    .replace(/Ushuaia,?\s*Tierra del Fuego,?\s*Argentina,?/gi, '')
    .replace(/Tolhuin,?\s*Tierra del Fuego,?\s*Argentina,?/gi, '')
    .replace(/Tierra del Fuego,?\s*Argentina,?/gi, '')
    .replace(/,\s*Río Grande,?/gi, '')
    .replace(/,\s*Ushuaia,?/gi, '')
    .replace(/,\s*Tolhuin,?/gi, '')
    .replace(/,\s*Tierra del Fuego,?/gi, '')
    .replace(/\s*Tierra del Fuego,?/gi, '')
    .replace(/,\s*Argentina,?/gi, '')
    .replace(/,\s*Argent,?/gi, '')
    .replace(/\s*Argent,?/gi, '')
    .replace(/Argentina,?/gi, '')
    .replace(/,\s*,/g, ',')
    .replace(/,\s*$/, '')
    .trim()
}

export const fetchFarmaciasTurno = async (): Promise<FarmaciaTurnoEvent[]> => {
  const urls = {
    'Río Grande': 'https://calendar.google.com/calendar/ical/aa09pqnjrpe41umut6uu8gi800%40group.calendar.google.com/public/basic.ics',
    'Ushuaia': 'https://calendar.google.com/calendar/ical/f98jsc0cotqr32jqmnku0o1ems%40group.calendar.google.com/public/basic.ics',
  }

  const allEvents: FarmaciaTurnoEvent[] = []

  for (const [ciudad, url] of Object.entries(urls)) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 3600 },
      })
      
      if (!res.ok) continue
      
      const icalContent = await res.text()
      const parsedEvents = parseICal(icalContent)
      
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
      lastDayOfMonth.setHours(23, 59, 59, 999)

      for (const event of parsedEvents) {
        const eventDate = parseDate(event.dtstart)
        if (!eventDate) continue

        if (eventDate >= firstDayOfMonth && eventDate <= lastDayOfMonth) {
          const [year, month, day] = [
            eventDate.getFullYear(),
            String(eventDate.getMonth() + 1).padStart(2, '0'),
            String(eventDate.getDate()).padStart(2, '0')
          ]
          allEvents.push({
            summary: event.summary,
            date: `${year}-${month}-${day}`,
            location: event.location,
            ciudad: ciudad as 'Río Grande' | 'Ushuaia',
          })
        }
      }
    } catch (error) {
      console.error(`Error fetching farmacias turno for ${ciudad}:`, error)
    }
  }

  return allEvents.sort((a, b) => a.date.localeCompare(b.date))
}

export const getFarmaciasTurnoHoy = async (): Promise<FarmaciaTurnoEvent[]> => {
  const eventos = await fetchFarmaciasTurno()
  const hoy = new Date().toISOString().split('T')[0]
  return eventos.filter(e => e.date === hoy)
}

export const getFarmaciasTurnoPorFecha = async (fecha: string): Promise<FarmaciaTurnoEvent[]> => {
  const eventos = await fetchFarmaciasTurno()
  return eventos.filter(e => e.date === fecha)
}

