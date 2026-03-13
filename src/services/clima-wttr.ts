export interface ClimaWttr {
  location: {
    name: string
    region: string
    country: string
    lat: number
    lon: number
    tz_id: string
    localtime_epoch: number
    localtime: string
  }
  current: {
    last_updated_epoch: number
    last_updated: string
    temp_c: number
    temp_f: number
    is_day: number
    condition: {
      text: string
      icon: string
      code: number
    }
    wind_mph: number
    wind_kph: number
    wind_degree: number
    wind_dir: string
    pressure_mb: number
    pressure_in: number
    precip_mm: number
    precip_in: number
    humidity: number
    cloud: number
    feelslike_c: number
    feelslike_f: number
    vis_km: number
    vis_miles: number
    uv: number
    gust_mph: number
    gust_kph: number
  }
}

export const fetchClimaWttr = async (location: string): Promise<ClimaWttr | null> => {
  try {
    const response = await fetch(
      `https://wttr.in/${encodeURIComponent(location)}?format=j1`,
      {
        next: { revalidate: 1800 }, // 30 minutes cache
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; miTDF/1.0)',
        },
      }
    )

    if (!response.ok) {
      const text = await response.text();
      console.error(`HTTP error! status: ${response.status}, response: ${text.substring(0, 100)}`);
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`Expected JSON but got: ${contentType}, response: ${text.substring(0, 100)}`);
      return null;
    }

    const data = await response.json()
    
    // Validar que los datos necesarios existan
    if (!data.current_condition || !data.current_condition[0] || !data.nearest_area || !data.nearest_area[0]) {
      throw new Error('Invalid data structure from weather API')
    }
    
    // Transformar la respuesta de wttr.in a nuestro formato
    const current = data.current_condition[0]
    const locationData = data.nearest_area[0]
    
    const now = new Date()
    
    // Extraer valores de forma segura
    const areaName = locationData.areaName?.[0]?.value || locationData.areaName?.value || location
    const region = locationData.region?.[0]?.value || locationData.region?.value || ''
    const country = locationData.country?.[0]?.value || locationData.country?.value || ''
    const timezone = locationData.timezone?.[0]?.value || locationData.timezone?.value || 'UTC'
    const weatherDesc = current.weatherDesc?.[0]?.value || current.weatherDesc?.value || current.weatherDesc || 'Despejado'
    
    // Extraer el icono de forma segura
    let weatherIcon = ''
    if (current.weatherIconUrl) {
      if (Array.isArray(current.weatherIconUrl)) {
        weatherIcon = current.weatherIconUrl[0]?.value || current.weatherIconUrl[0] || ''
      } else if (typeof current.weatherIconUrl === 'string') {
        weatherIcon = current.weatherIconUrl
      } else if (current.weatherIconUrl.value) {
        weatherIcon = current.weatherIconUrl.value
      }
    }
    
    return {
      location: {
        name: areaName,
        region: region,
        country: country,
        lat: parseFloat(locationData.latitude || '0') || 0,
        lon: parseFloat(locationData.longitude || '0') || 0,
        tz_id: timezone,
        localtime_epoch: Math.floor(now.getTime() / 1000),
        localtime: current.localObsDateTime || now.toISOString(),
      },
      current: {
        last_updated_epoch: parseInt(current.epoch || '0') || Math.floor(now.getTime() / 1000),
        last_updated: current.localObsDateTime || now.toISOString(),
        temp_c: parseFloat(current.temp_C || '0') || 0,
        temp_f: parseFloat(current.temp_F || '0') || 0,
        is_day: current.isdaytime === 'Yes' ? 1 : 0,
        condition: {
          text: weatherDesc,
          icon: weatherIcon && typeof weatherIcon === 'string' 
            ? (weatherIcon.startsWith('http') ? weatherIcon : `https:${weatherIcon}`)
            : 'https://cdn.weatherapi.com/weather/64x64/day/113.png',
          code: parseInt(current.weatherCode || '1000') || 1000,
        },
        wind_mph: parseFloat(current.windspeedMiles || '0') || 0,
        wind_kph: parseFloat(current.windspeedKmph || '0') || 0,
        wind_degree: parseInt(current.winddirDegree || '0') || 0,
        wind_dir: current.winddir16Point || 'N',
        pressure_mb: parseFloat(current.pressure || '0') || 0,
        pressure_in: parseFloat(current.pressureInches || '0') || 0,
        precip_mm: parseFloat(current.precipMM || '0') || 0,
        precip_in: parseFloat(current.precipInches || '0') || 0,
        humidity: parseInt(current.humidity || '0') || 0,
        cloud: parseInt(current.cloudcover || '0') || 0,
        feelslike_c: parseFloat(current.FeelsLikeC || current.temp_C || '0') || 0,
        feelslike_f: parseFloat(current.FeelsLikeF || current.temp_F || '0') || 0,
        vis_km: parseFloat(current.visibility || '0') || 0,
        vis_miles: parseFloat(current.visibilityMiles || '0') || 0,
        uv: parseInt(current.uvIndex || '0') || 0,
        gust_mph: parseFloat(current.windGustMiles || '0') || 0,
        gust_kph: parseFloat(current.windGustKmph || '0') || 0,
      },
    }
  } catch (error) {
    console.error(`Error fetching clima for ${location}:`, error)
    return null
  }
}

// --- Fallback a Open-Meteo (API pública sin token) ---

type BasicCoords = { lat: number; lon: number; displayName: string }

// Coordenadas fijas para las localidades que nos interesan
const FALLBACK_COORDS: Record<string, BasicCoords> = {
  ushuaia: { lat: -54.8019, lon: -68.3030, displayName: "Ushuaia" },
  "rio grande": { lat: -53.7877, lon: -67.7095, displayName: "Río Grande" },
  tolhuin: { lat: -54.5092, lon: -67.1950, displayName: "Tolhuin" },
  antartida: { lat: -64.2380, lon: -56.6260, displayName: "Antártida" },
  "islas malvinas": { lat: -51.7000, lon: -57.8500, displayName: "Islas Malvinas" },
  "islas malvinas argentinas": { lat: -51.7000, lon: -57.8500, displayName: "Islas Malvinas" },
}

async function fetchClimaOpenMeteo(location: string): Promise<ClimaWttr | null> {
  const key = location.toLowerCase()
  const coords = FALLBACK_COORDS[key]
  if (!coords) return null

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`
    const res = await fetch(url, {
      next: { revalidate: 1800 },
    })

    if (!res.ok) {
      console.error(`Open-Meteo error for ${location}:`, res.status)
      return null
    }

    const data = await res.json()
    if (!data.current_weather) return null

    const current = data.current_weather as {
      temperature: number
      windspeed: number
      winddirection: number
      weathercode: number
      is_day?: number
      time: string
    }

    const now = new Date()

    return {
      location: {
        name: coords.displayName,
        region: "",
        country: "Argentina",
        lat: coords.lat,
        lon: coords.lon,
        tz_id: data.timezone || "UTC",
        localtime_epoch: Math.floor(now.getTime() / 1000),
        localtime: current.time || now.toISOString(),
      },
      current: {
        last_updated_epoch: Math.floor(now.getTime() / 1000),
        last_updated: current.time || now.toISOString(),
        temp_c: current.temperature,
        temp_f: current.temperature * 9 / 5 + 32,
        is_day: current.is_day ?? 1,
        condition: {
          text: "Condiciones actuales",
          icon: "https://cdn.weatherapi.com/weather/64x64/day/113.png",
          code: current.weathercode ?? 1000,
        },
        wind_mph: current.windspeed / 1.609,
        wind_kph: current.windspeed,
        wind_degree: current.winddirection,
        wind_dir: "",
        pressure_mb: 0,
        pressure_in: 0,
        precip_mm: 0,
        precip_in: 0,
        humidity: 0,
        cloud: 0,
        feelslike_c: current.temperature,
        feelslike_f: current.temperature * 9 / 5 + 32,
        vis_km: 0,
        vis_miles: 0,
        uv: 0,
        gust_mph: 0,
        gust_kph: 0,
      },
    }
  } catch (error) {
    console.error(`Error fetching fallback clima for ${location}:`, error)
    return null
  }
}

/**
 * Versión robusta: intenta wttr.in y, si falla o devuelve null,
 * usa Open-Meteo como API de clima gratuita.
 */
export const fetchClimaWttrWithFallback = async (location: string): Promise<ClimaWttr | null> => {
  const primary = await fetchClimaWttr(location)
  if (primary) return primary
  return fetchClimaOpenMeteo(location)
}

