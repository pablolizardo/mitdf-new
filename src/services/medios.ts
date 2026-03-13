import { TVFUEGO_TOKEN } from '@/services/constants'
import { cache } from 'react'

export const fetchMedios = cache(async () => {
    try {
        const res = await fetch(
            "https://bridge.tvfuego.com.ar/api/tvf/prod/datacenter/medios",
            {
                headers: { Authorization: TVFUEGO_TOKEN },
                next: { revalidate: 4800 },
            }
        );
        
        if (!res.ok) {
            const text = await res.text().catch(() => 'Unable to read response');
            console.error(`HTTP error! status: ${res.status}, response: ${text.substring(0, 100)}`);
            return [];
        }
        
        const contentType = res.headers.get('content-type') || '';
        const text = await res.text().catch(() => '');
        
        if (!text || text.trim() === '') {
            console.error('Empty response from medios API');
            return [];
        }
        
        if (!contentType.includes('application/json') && !text.trim().startsWith('[') && !text.trim().startsWith('{')) {
            console.error(`Expected JSON but got: ${contentType}, response: ${text.substring(0, 100)}`);
            return [];
        }
        
        try {
            const medios = JSON.parse(text);
            return Array.isArray(medios) ? medios : [];
        } catch (parseError) {
            console.error(`Failed to parse JSON: ${text.substring(0, 100)}`, parseError);
            return [];
        }
    } catch (error) {
        console.error('Error fetching medios:', error);
        return [];
    }
}); 