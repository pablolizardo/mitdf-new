export interface Pelicula {
  peliculas_codigo: string
  peliculas_nombre: string
  peliculas_duracion: string
  peliculas_genero: string
  peliculas_clasificacion: string
  peliculas_cartelera: string
  peliculas_trailer: string
  director: string
  actores: string
  peliculas_sinopsis: string
  peliculas_tipo: string
  idUltracine: string
  fecha_estreno: string
  peliculaUltracineId: string | null
  imagen: string
  peliculas_imagenes: Array<{ url: string }>
}

export interface Funcion {
  trasnoche: string
  codPelicula: string
  _id: string
  hora: string
  subtitulada: string
  idUltracine: string
  formato: string
  TipoSala: string
}

export interface CarteleraResponse {
  success: boolean
  message: string
  data: {
    datos: Pelicula[]
    funciones: Funcion[]
  }
}

export const fetchCartelera = async (): Promise<CarteleraResponse> => {
  // Temporalmente usar fecha fija para probar
  const fecha = '21/08/2025' // Fecha que sabemos que tiene funciones

  const response = await fetch(
    `https://apifront.cinexo.com.ar/mobile/consultas/peliculas/PeliculasConFuncionesYHorarios?idComplejo=893&fecha=${fecha}`,
    {
      headers: {
        accept: '*/*',
        'accept-language': 'en,es;q=0.9',
        origin: 'https://www.cinemas4riogrande.com.ar',
        referer: 'https://www.cinemas4riogrande.com.ar/',
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      },
      next: { revalidate: 1800 }, // Cache por 30 minutos
    },
  )

  if (!response.ok) {
    const text = await response.text();
    console.error(`HTTP error! status: ${response.status}, response: ${text.substring(0, 100)}`);
    throw new Error(`Error al obtener cartelera: ${response.status}`)
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error(`Expected JSON but got: ${contentType}, response: ${text.substring(0, 100)}`);
    throw new Error(`Expected JSON but got: ${contentType}`)
  }

  const data = await response.json()

  return data
}

export const getFuncionesByPelicula = (funciones: Funcion[], codigoPelicula: string): Funcion[] => {
  return funciones.filter((funcion) => funcion.codPelicula === codigoPelicula)
}

export const formatDuracion = (duracion: string): string => {
  const minutos = parseInt(duracion)
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60

  if (horas > 0) {
    return `${horas}h ${mins}min`
  }
  return `${mins}min`
}
