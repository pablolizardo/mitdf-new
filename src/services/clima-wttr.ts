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

