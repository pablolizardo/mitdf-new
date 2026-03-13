import { TVFUEGO_TOKEN } from '@/services/constants';
import { slugify } from "@/lib/utils";

type Diario = {
    nombre: string;
    adj_tapa: string;
}

export const fetchDiarios = async () => {
    try {
        const res = await fetch(
            "https://bridge.tvfuego.com.ar/api/tvf/prod/datacenter/diarios",
            {
                headers: { Authorization: TVFUEGO_TOKEN },
                next: { revalidate: 300 },
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
        
        const diariosJson = await res.json();
        const diarios = await diariosJson.map((diario: Diario) => ({
            _id: slugify(diario.nombre),
            nombre: diario.nombre,
            img: `https://bridge.tvfuego.com.ar/uploads/diarios/${diario.adj_tapa}`,
        }));
        return diarios;
    } catch (error) {
        console.error('Error fetching diarios:', error);
        return [];
    }
}; 