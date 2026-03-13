import { Vuelo } from '@prisma/client'
import * as cheerio from 'cheerio'
import * as https from 'https'

const FETCH_TIMEOUT_MS = 8000

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  const res = await fetch(url, { ...options, signal: controller.signal })
  clearTimeout(timeout)
  return res
}
// import * as fs from 'fs';
// import vuelosHtml from './vuelos.txt';
// Función auxiliar para procesar vuelos
async function processFlights(url: string, flightType: 'arr' | 'dep', cityCode: string): Promise<Vuelo[]> {
  try {
    const proxyUrl = `/api/vuelos?url=${encodeURIComponent(url)}`
    const response = await fetchWithTimeout(url, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const htmlString: string = await response.text()
    // const htmlString = fs.readFileSync('./vuelos.txt', 'utf8');
    const soup: cheerio.CheerioAPI = cheerio.load(htmlString)
    const flights = soup('section.data li.dl').toArray()
    const extractCity = (airport: string): { cityName: string; cityCode: string } => {
      const match = airport.match(/\(([^)]+)\)\s*(.+)/)
      if (match) {
        const cityCode = match[1]
        const cityName = match[2]
        return { cityName, cityCode }
      }
      return { cityName: '', cityCode: '' } // Return empty strings if no match is found
    }
    const processedFlights: Vuelo[] = flights.map((flight) => {
      const flightData: Vuelo = { type: flightType, airline_logo: '' }
      const cells = soup(flight).find('div').toArray()

      cells.forEach((cell) => {
        const classname = soup(cell).attr('class')
        if (classname?.includes('c1')) {
          const base = 'https://flightstats.londonsupplygroup.com'
          flightData.airline_logo = base + soup(cell).find('img').attr('src') || ''
        }
        if (classname?.includes('c2')) {
          flightData.cs_flight_iata = soup(cell).text()
          flightData.flight_iata = soup(cell).text()
          flightData.flight_icao = soup(cell).text()
        }

        if (classname?.includes('c3')) {
          if (flightType === 'arr') {
            flightData.arr_iata = extractCity(soup(cell).text().trim()).cityCode
            flightData.arr_icao = extractCity(soup(cell).text().trim()).cityCode
          } else {
            flightData.dep_iata = extractCity(soup(cell).text().trim()).cityCode
            flightData.dep_icao = extractCity(soup(cell).text().trim()).cityCode
          }
          flightData.city = extractCity(soup(cell).text().trim()).cityName
        }
        if (classname?.includes('c4')) {
          flightData[flightType === 'arr' ? 'arr_time' : 'dep_time'] = soup(cell).text()
        }
        if (classname?.includes('c5')) {
          flightData[flightType === 'arr' ? 'arr_estimated' : 'dep_estimated'] = soup(cell).text()
        }
        if (classname?.includes('c6')) {
          flightData.status = soup(cell).text()
        }
        if (classname?.includes('c7')) {
          flightData[flightType === 'arr' ? 'arr_gate' : 'dep_gate'] = soup(cell).text()
        }
      })

      return flightData
    })

    return processedFlights
  } catch (error) {
    console.error('Error fetching flights:', error)
    return [] // Retornar array vacío en caso de error
  }
}

// Función para traducir estados de vuelo
const translateFlightStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    scheduled: 'Programado',
    active: 'En Vuelo',
    landed: 'Aterrizó',
    cancelled: 'Cancelado',
    diverted: 'Desviado',
    delayed: 'Demorado',
    boarding: 'Abordando',
    departed: 'Partió',
    arrived: 'Llegó',
    unknown: 'Desconocido',
  }
  return statusMap[status.toLowerCase()] || status
}

// Función para obtener logo de aerolínea usando múltiples servicios
const getAirlineLogo = (airlineIata: string): string => {
  const code = airlineIata

  // Múltiples servicios de logos de aerolíneas
  const logoUrls = [
    `https://pics.avs.io/120/60/${code}.png`,
    `https://daisycon.io/images/airline/?width=120&height=60&color=ffffff&iata=${code}`,
    `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`,
    `https://cdn.jetphotos.com/airline_logo/${code}.png`,
  ]

  // Retorna el primer servicio (pics.avs.io es generalmente el más confiable)
  return logoUrls[0]
}

// Funciones específicas para arribos y partidas de Ushuaia usando AirLabs API
export const readArribosUsh = async () => {
  try {
    const api_key = 'a984fd1e-27b5-44f2-8f4d-c5fbe439eac8'
    const url = `https://airlabs.co/api/v9/schedules?arr_iata=USH&api_key=${api_key}`

    const response = await fetchWithTimeout(url, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      const text = await response.text();
      console.error(`HTTP error! status: ${response.status}, response: ${text.substring(0, 100)}`);
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`Expected JSON but got: ${contentType}, response: ${text.substring(0, 100)}`);
      return [];
    }

    const data = await response.json()

    if (!data.response || !Array.isArray(data.response)) {
      return []
    }

    const processedFlights: Vuelo[] = data.response.map((flight: any, index: number) => {
      return {
        id: `${flight.flight_number || 'flight'}_${index}_${Date.now()}`,
        type: 'arr',
        ciudad: 'USH',
        airline_iata: flight.airline_iata,
        airline_icao: flight.airline_icao,
        airline_logo: getAirlineLogo(flight.airline_iata),
        flight_iata: flight.flight_number,
        flight_icao: flight.flight_number,
        arr_iata: flight.arr_iata,
        arr_icao: flight.arr_icao,
        arr_time: flight.arr_time,
        arr_estimated: flight.arr_estimated,
        status: translateFlightStatus(flight.status || 'scheduled'),
        city: flight.dep_city || flight.dep_iata, // Para arribos, mostramos de donde viene
        city_code: flight.dep_iata,
        aircraft_icao: flight.aircraft_icao,
      }
    })

    return processedFlights
  } catch (error) {
    console.error('Error in readArribosUsh:', error)
    return []
  }
}

export const readDeparturesUsh = async () => {
  try {
    const api_key = 'a984fd1e-27b5-44f2-8f4d-c5fbe439eac8'
    const url = `https://airlabs.co/api/v9/schedules?dep_iata=USH&api_key=${api_key}`

    const response = await fetchWithTimeout(url, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      const text = await response.text();
      console.error(`HTTP error! status: ${response.status}, response: ${text.substring(0, 100)}`);
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`Expected JSON but got: ${contentType}, response: ${text.substring(0, 100)}`);
      return [];
    }

    const data = await response.json()

    if (!data.response || !Array.isArray(data.response)) {
      return []
    }

    const processedFlights: Vuelo[] = data.response.map((flight: any, index: number) => {
      return {
        id: `${flight.flight_number || 'flight'}_${index}_${Date.now()}`,
        type: 'dep',
        ciudad: 'USH',
        airline_iata: flight.airline_iata,
        airline_icao: flight.airline_icao,
        airline_logo: getAirlineLogo(flight.airline_iata),
        flight_iata: flight.flight_number,
        flight_icao: flight.flight_number,
        dep_iata: flight.dep_iata,
        dep_icao: flight.dep_icao,
        dep_time: flight.dep_time,
        dep_estimated: flight.dep_estimated,
        status: translateFlightStatus(flight.status || 'scheduled'),
        city: flight.arr_city || flight.arr_iata, // Para partidas, mostramos a donde va
        city_code: flight.arr_iata,
        aircraft_icao: flight.aircraft_icao,
      }
    })

    return processedFlights
  } catch (error) {
    console.error('Error in readDeparturesUsh:', error)
    return []
  }
}

// Configuración común para las peticiones a AA2000
const AA2000_CONFIG = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'es-AR',
    key: 'HieGcY2nFreIsNLuo5EbXCwE7g0aRzTN',
    Origin: 'https://www.aa2000.com.ar',
    DNT: '1',
    Connection: 'keep-alive',
    Pragma: 'no-cache',
    'Cache-Control': 'no-cache',
  },
}

// Función base para obtener vuelos de AA2000
async function fetchAA2000Flights(movtp: 'A' | 'D'): Promise<Vuelo[]> {
  try {
    const url = `https://webaa-api-h4d5amdfcze7hthn.a02.azurefd.net/web-prod/v1/api-aa/all-flights?c=7&idarpt=RGA&movtp=${movtp}`
    const proxyUrl = `/api/vuelos?url=${encodeURIComponent(url)}&json=true`

    const response = await fetchWithTimeout(url, {
      headers: AA2000_CONFIG.headers,
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      const text = await response.text();
      console.error(`HTTP error! status: ${response.status}, response: ${text.substring(0, 100)}`);
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`Expected JSON but got: ${contentType}, response: ${text.substring(0, 100)}`);
      return [];
    }

    const flights = await response.json()
    return flights.map((flight: any) => {
      const baseVuelo = {
        id: flight.id,
        ciudad: 'RGA',
        type: movtp === 'A' ? 'arr' : 'dep',
        airline_iata: flight.idaerolinea,
        airline_icao: flight.idaerolinea,
        airline_logo: getAirlineLogo(flight.idaerolinea),
        flight_iata: flight.aerolinea,
        flight_icao: flight.nro,
        status: flight.estes || 'Programado',
        aircraft_icao: flight.matricula,
        city: flight.destorig,
        city_code: flight.IATAdestorig,
      }

      const [date] = (flight.stda || flight.arr_time).split(' ')
      const [day, month] = date.split('/')
      const formattedDate = `${day}-${month}-2025`
      if (movtp === 'A') {
        return {
          ...baseVuelo,
          arr_iata: flight.IATAdestorig,
          arr_time: flight.stda,
          arr_estimated: flight.etda,
          arr_gate: flight.gate,
          arr_baggage: flight.belt,
          city: flight.destorig, // Para arribos, mostramos de donde viene
          city_code: flight.IATAdestorig,
          link: `https://www.aa2000.com.ar/es/vuelos/vuelo?flight=${flight.nro}&fecha=${formattedDate}&movtp=arribos&idarpt=R%C3%ADo%20Grande,%20RGA`,
        }
      } else {
        return {
          ...baseVuelo,
          dep_iata: flight.IATAdestorig,
          dep_time: flight.stda,
          dep_estimated: flight.etda,
          dep_gate: flight.gate,
          city: flight.destorig, // Para partidas, mostramos a donde va
          city_code: flight.IATAdestorig,
          link: `https://www.aa2000.com.ar/es/vuelos/vuelo?flight=${flight.nro}&fecha=${formattedDate}&movtp=partidas&idarpt=R%C3%ADo%20Grande,%20RGA`,
        }
      }
    })
  } catch (error) {
    console.error('Error fetching AA2000 flights:', error)
    return [] // Retornar array vacío en caso de error
  }
}

// Funciones específicas que utilizan la función base
export const fetchArribosRga = () => fetchAA2000Flights('A')
export const fetchPartidasRga = () => fetchAA2000Flights('D')
