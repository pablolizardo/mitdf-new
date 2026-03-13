import { ArrowDownIcon, Equal } from 'lucide-react'
import { ArrowUpIcon } from 'lucide-react'

export interface DolarResponse {
  compra: string
  venta: string
  fecha: string
  variacion: string
  'class-variacion': string
  valor_cierre_ant: string
}

const url_informal = 'https://mercados.ambito.com//dolar/informal/variacion'
const url_nacion = 'https://mercados.ambito.com//dolarnacion//variacion'
const url_turista = 'https://mercados.ambito.com//dolarturista/variacion'
const url_cripto = 'https://mercados.ambito.com//dolarcripto/variacion'
const url_rava_cl = 'https://mercados.ambito.com//dolarrava/cl/variacion'
const url_oficial = 'https://mercados.ambito.com//dolar/oficial/variacion'
const url_rava_mep = 'https://mercados.ambito.com//dolarrava/mep/variacion'
const url_mayorista = 'https://mercados.ambito.com//dolar/mayorista/variacion'
const url_futuro = 'https://mercados.ambito.com//dolarfuturo/variacion'

export const fetchMonedas = async () => {
  const [informal, nacion, turista, cripto, rava_cl, oficial, rava_mep, mayorista, futuro] = await Promise.all([
    fetch(url_informal, { next: { revalidate: 3600 } }),
    fetch(url_nacion, { next: { revalidate: 3600 } }),
    fetch(url_turista, { next: { revalidate: 3600 } }),
    fetch(url_cripto, { next: { revalidate: 3600 } }),
    fetch(url_rava_cl, { next: { revalidate: 3600 } }),
    fetch(url_oficial, { next: { revalidate: 3600 } }),
    fetch(url_rava_mep, { next: { revalidate: 3600 } }),
    fetch(url_mayorista, { next: { revalidate: 3600 } }),
    fetch(url_futuro, { next: { revalidate: 3600 } }),
  ])

  const responses = [informal, nacion, turista, cripto, rava_cl, oficial, rava_mep, mayorista, futuro]

  const data = await Promise.all(
    responses.map(async (response, index) => {
      try {
        if (!response.ok) {
          const text = await response.text()
          console.error(`HTTP error! status: ${response.status}, response: ${text.substring(0, 100)}`)
          return null
        }

        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          const text = await response.text()
          console.error(`Expected JSON but got: ${contentType}, response: ${text.substring(0, 100)}`)
          return null
        }

        return await response.json()
      } catch (error) {
        console.error(`Error parsing JSON for response ${index}:`, error)
        return null
      }
    }),
  ).then((results) =>
    results.map((result, index) => ({
      ...result,
      nombre: [
        'Dolar Informal',
        'Dolar Nación',
        'Dolar Turista',
        'Dolar Cripto',
        'Dolar CCL',
        'Dolar Oficial',
        'Dolar MEP',
        'Dolar Mayor.',
        'Dolar Futuro',
      ][index],
    })),
  )
  return data
}
