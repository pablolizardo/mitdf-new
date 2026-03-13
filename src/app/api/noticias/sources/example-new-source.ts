/**
 * EJEMPLO: Cómo crear una nueva fuente de noticias
 * 
 * Este archivo muestra el patrón para implementar un nuevo adapter
 * de fuente de noticias. Copia este archivo y modifícalo según tus necesidades.
 */

import { INoticia } from './types';
import { COUNT } from '../route';

/**
 * Adapter para obtener noticias de "Nueva Fuente"
 * 
 * Este es un ejemplo de implementación que puedes usar como base
 * para crear tu propia fuente de noticias.
 */
export const fetchNuevaFuente = async (): Promise<INoticia[]> => {
  const noticias: INoticia[] = [];
  
  try {
    // 1. Hacer request a la API/sitio web de la fuente
    const response = await fetch('https://nueva-fuente.com/api/noticias', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsAggregator/1.0)',
        // Agregar headers adicionales si es necesario
        // 'Authorization': 'Bearer token',
        // 'Accept': 'application/json',
      },
      // Configurar timeout
      signal: AbortSignal.timeout(30000), // 30 segundos
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 2. Parsear la respuesta
    const data = await response.json();
    
    // 3. Transformar los datos al formato INoticia
    // Limitar a COUNT noticias para evitar sobrecargar
    data.slice(0, COUNT).forEach((item: any) => {
      try {
        // Validar que el item tenga los campos mínimos
        if (!item.title || !item.url) {
          console.warn('Item sin título o URL, saltando...', item);
          return;
        }

        // Crear la noticia en el formato estándar
        const noticia: INoticia = {
          _id: generateUniqueId(item.title, item.url),
          slug: generateSlug(item.title),
          titulo: cleanText(item.title),
          bajada: cleanText(item.excerpt || item.description || ''),
          longtext: cleanText(item.content || item.body || ''),
          medio: 'Nueva Fuente', // Nombre de tu fuente
          ciudad: item.city || item.location || 'Todas',
          categoria: item.category || item.section || 'Generales',
          tags: item.tags || item.keywords || [],
          url: item.url,
          foto: item.image || item.thumbnail || item.featured_image || '',
          fecha: item.published_at || item.created_at || new Date().toISOString(),
          written_at: parseDate(item.published_at || item.created_at || new Date()),
        };

        // Validar que la noticia sea válida antes de agregarla
        if (isValidNoticia(noticia)) {
          noticias.push(noticia);
        } else {
          console.warn('Noticia inválida, saltando...', noticia);
        }

      } catch (itemError) {
        console.error('Error procesando item:', itemError, item);
        // Continuar con el siguiente item
      }
    });

    console.log(`Nueva Fuente: ${noticias.length} noticias obtenidas exitosamente`);

  } catch (error) {
    console.error('Error obteniendo noticias de Nueva Fuente:', error);
    
    // Retornar array vacío en caso de error
    // El sistema de retry se encargará de reintentar
    return [];
  }

  return noticias;
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Genera un ID único para la noticia
 */
function generateUniqueId(title: string, url: string): string {
  // Usar una combinación de título y URL para generar un ID único
  const titleHash = title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  const urlHash = url.replace(/[^a-z0-9]/g, '').substring(0, 20);
  return `${titleHash}-${urlHash}`;
}

/**
 * Genera un slug limpio para la noticia
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .substring(0, 100); // Limitar longitud
}

/**
 * Limpia texto de HTML tags y caracteres especiales
 */
function cleanText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '') // Remover HTML tags
    .replace(/&[a-zA-Z]+;/g, '') // Remover entidades HTML
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
}

/**
 * Parsea una fecha a objeto Date
 */
function parseDate(dateString: string | Date): Date {
  if (dateString instanceof Date) {
    return dateString;
  }
  
  try {
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) {
      return new Date(); // Fallback a fecha actual
    }
    return parsed;
  } catch {
    return new Date(); // Fallback a fecha actual
  }
}

/**
 * Valida si una noticia tiene los campos mínimos requeridos
 */
function isValidNoticia(noticia: INoticia): boolean {
  return !!(
    noticia.titulo &&
    noticia.titulo.length >= 10 &&
    noticia.slug &&
    noticia.url &&
    noticia.medio &&
    noticia.ciudad &&
    noticia.categoria
  );
}

// ============================================================================
// CONFIGURACIÓN DE LA FUENTE
// ============================================================================

/**
 * Configuración específica para esta fuente
 * 
 * Puedes ajustar estos valores según las características
 * de la fuente que estés implementando.
 */
export const NUEVA_FUENTE_CONFIG = {
  name: 'Nueva Fuente',
  baseUrl: 'https://nueva-fuente.com',
  rateLimit: {
    requestsPerMinute: 60, // Máximo 60 requests por minuto
    delayBetweenRequests: 1000, // 1 segundo entre requests
  },
  retryConfig: {
    maxRetries: 3, // Máximo 3 reintentos
    backoffMs: 2000, // 2 segundos de backoff inicial
  },
  timeout: 30000, // 30 segundos de timeout
  maxNoticias: COUNT, // Máximo número de noticias a obtener
};

// ============================================================================
// EJEMPLOS DE IMPLEMENTACIÓN PARA DIFERENTES TIPOS DE FUENTES
// ============================================================================

/**
 * EJEMPLO 1: Fuente con API REST
 */
export const fetchFromRestAPI = async (): Promise<INoticia[]> => {
  const response = await fetch('https://api.ejemplo.com/noticias');
  const data = await response.json();
  
  return data.map((item: any) => ({
    _id: item.id,
    slug: item.slug,
    titulo: item.title,
    // ... mapear otros campos
  }));
};

/**
 * EJEMPLO 2: Fuente con scraping HTML
 */
export const fetchFromHTML = async (): Promise<INoticia[]> => {
  const response = await fetch('https://ejemplo.com/noticias');
  const html = await response.text();
  
  // Usar cheerio o similar para parsear HTML
  // const $ = cheerio.load(html);
  // const noticias = $('.noticia').map((i, el) => { ... });
  
  return []; // Implementar lógica de scraping
};

/**
 * EJEMPLO 3: Fuente con RSS
 */
export const fetchFromRSS = async (): Promise<INoticia[]> => {
  const response = await fetch('https://ejemplo.com/feed.xml');
  const xml = await response.text();
  
  // Usar una librería para parsear RSS/XML
  // const feed = new DOMParser().parseFromString(xml, 'text/xml');
  // const items = feed.querySelectorAll('item');
  
  return []; // Implementar lógica de parsing RSS
};

// ============================================================================
// NOTAS IMPORTANTES
// ============================================================================

/*
1. SIEMPRE maneja errores gracefully - nunca dejes que un error en una fuente
   afecte el procesamiento de otras fuentes.

2. Usa rate limiting apropiado para no sobrecargar los sitios externos.

3. Implementa retry logic para manejar fallos temporales de red.

4. Valida y limpia todos los datos antes de retornarlos.

5. Usa timeouts apropiados para evitar que una fuente lenta bloquee todo.

6. Loggea información útil para debugging.

7. Sigue el patrón establecido para mantener consistencia.

8. Testea tu implementación antes de agregarla a producción.

9. Documenta cualquier característica especial o limitación de tu fuente.

10. Considera implementar cache para fuentes que no cambian frecuentemente.
*/
