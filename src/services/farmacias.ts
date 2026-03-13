import { TVFUEGO_TOKEN } from '@/services/constants';

export const fetchFarmacias = async () => {
    try {
        const res = await fetch(
            "https://bridge.tvfuego.com.ar/api/tvf/prod/datacenter/farmacias",
            {
                headers: { Authorization: TVFUEGO_TOKEN },
                next: { revalidate: 1800 }, // 30 minutes in seconds
            }
        );
        
        if (!res.ok) {
            const text = await res.text();
            console.error(`HTTP error! status: ${res.status}, response: ${text.substring(0, 100)}`);
            return [];
        }
        
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            const text = await res.text();
            console.error(`Expected JSON but got: ${contentType}, response: ${text.substring(0, 100)}`);
            return [];
        }
        
        const farmacias = await res.json();
        return farmacias || [];
    } catch (error) {
        console.error('Error fetching farmacias:', error);
        return [];
    }
}; 
