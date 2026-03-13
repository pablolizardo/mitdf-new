import { BarcazaApiResponse } from './types';

export const fetchBarcaza = async () => {
    try {
        const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
        const url = `https://api-cruce.tabsa.cl/api/cruce/20/fecha/${fecha}/embarcadero/0`
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
        
        const res = await fetch(url, {
            signal: controller.signal,
            next: { revalidate: 1800 }, // 30 minutes in seconds
        })
        
        clearTimeout(timeoutId)
        
        if (!res.ok) {
            const text = await res.text()
            console.error(`HTTP error! status: ${res.status}, response: ${text}`)
            return null
        }
        
        const contentType = res.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            const text = await res.text()
            console.error(`Expected JSON but got: ${contentType}, response: ${text.substring(0, 100)}`)
            return null
        }
        
        const barcaza: BarcazaApiResponse = await res.json()
        return barcaza
    } catch (error) {
        console.error('Error fetching barcaza data:', error)
        return null
    }
}

