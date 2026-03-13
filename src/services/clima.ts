import { TVFUEGO_TOKEN } from '@/services/constants';

type Clima = {
    temp: number
    viento: number
    humedad: string
    visibilidad: string
    presion: number
    code: number
    img: number
    lluvia: string
    texto: string
    salida_sol: string
    puesta_sol: string
    location: string
    lat: number
    long: number
    link: string
    hoy_min: number
    hoy_max: number
    hoy_img: number
    man_min: number
    man_max: number
    man_img: number
    actualizacion: {
        dia: string
        mes: string
        anio: string
        hora: string
        min: string
    }
    day: {
        [key: string]: {
            min: number
            max: number
            img: number | string
            text: string
        }
    }
    text: string
    id: string
    localidad: string
}

export const fetchClimas = async () => {
    try {
        const res = await fetch(
            "https://bridge.tvfuego.com.ar/api/tvf/prod/datacenter/climas",
            {
                headers: { Authorization: TVFUEGO_TOKEN },
                next: { revalidate: 1800 }, // 30 minutes in seconds
            }
        );
        
        if (!res.ok) {
            const text = await res.text();
            console.error(`HTTP error! status: ${res.status}, response: ${text.substring(0, 100)}`);
            return null;
        }
        
        const contentType = res.headers.get('content-type') || '';
        const text = await res.text();
        
        if (!contentType.includes('application/json')) {
            console.error(`Expected JSON but got: ${contentType}, response: ${text.substring(0, 100)}`);
            return null;
        }
        
        try {
            const climas = JSON.parse(text);
            return climas;
        } catch (parseError) {
            console.error(`Failed to parse JSON: ${text.substring(0, 100)}`, parseError);
            return null;
        }
    } catch (error) {
        console.error('Error fetching climas:', error);
        return null;
    }
};

export const fetchClimas2 = async () => {
    try {
        const res = await fetch(
            "https://www.minutofueguino.com.ar/extras/js/clima.php",
            {
                next: { revalidate: 1800 },
            }
        );
        
        if (!res.ok) {
            const text = await res.text().catch(() => 'Unable to read response');
            console.error(`HTTP error! status: ${res.status}, response: ${text.substring(0, 100)}`);
            return {};
        }
        
        const contentType = res.headers.get('content-type') || '';
        const text = await res.text().catch(() => '');
        
        if (!text || text.trim() === '') {
            console.error('Empty response from clima API');
            return {};
        }
        
        if (!contentType.includes('application/json') && !text.trim().startsWith('{')) {
            console.error(`Expected JSON but got: ${contentType}, response: ${text.substring(0, 100)}`);
            return {};
        }
        
        try {
            const climas: Record<string, Clima> = JSON.parse(text);
            return climas;
        } catch (parseError) {
            console.error(`Failed to parse JSON: ${text.substring(0, 100)}`, parseError);
            return {};
        }
    } catch (error) {
        console.error('Error fetching climas2:', error);
        return {};
    }
};

