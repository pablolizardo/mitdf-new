import { INoticia } from '../sources/types';

/**
 * Valida si una noticia tiene todos los campos requeridos
 */
export function validateNoticia(noticia: INoticia): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!noticia.titulo || noticia.titulo.trim().length === 0) {
    errors.push('Título es requerido');
  }
  
  if (!noticia.slug || noticia.slug.trim().length === 0) {
    errors.push('Slug es requerido');
  }
  
  if (!noticia.medio || noticia.medio.trim().length === 0) {
    errors.push('Medio es requerido');
  }
  
  if (!noticia.ciudad || noticia.ciudad.trim().length === 0) {
    errors.push('Ciudad es requerida');
  }
  
  if (!noticia.categoria || noticia.categoria.trim().length === 0) {
    errors.push('Categoría es requerida');
  }
  
  if (!noticia.url || noticia.url.trim().length === 0) {
    errors.push('URL es requerida');
  }
  
  if (!noticia.written_at) {
    errors.push('Fecha de escritura es requerida');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Normaliza una noticia para asegurar consistencia en los datos
 */
export function normalizeNoticia(noticia: INoticia): INoticia {
  return {
    ...noticia,
    titulo: noticia.titulo?.trim() || '',
    bajada: noticia.bajada?.trim() || '',
    slug: noticia.slug?.trim() || '',
    medio: noticia.medio?.trim() || '',
    ciudad: noticia.ciudad?.trim() || '',
    categoria: noticia.categoria?.trim() || '',
    url: noticia.url?.trim() || '',
    tags: noticia.tags?.filter(tag => tag && tag.trim().length > 0) || [],
    longtext: noticia.longtext?.trim() || '',
    foto: noticia.foto?.trim() || '',
    fecha: noticia.fecha?.trim() || new Date().toISOString(),
    written_at: noticia.written_at || new Date(),
    _id: noticia._id || noticia.slug || '',
  };
}

/**
 * Filtra noticias duplicadas basándose en el slug
 */
export function removeDuplicates(noticias: INoticia[]): INoticia[] {
  const seen = new Set<string>();
  return noticias.filter(noticia => {
    if (seen.has(noticia.slug)) {
      return false;
    }
    seen.add(noticia.slug);
    return true;
  });
}

/**
 * Filtra noticias basándose en criterios de calidad
 */
export function filterByQuality(noticias: INoticia[]): INoticia[] {
  return noticias.filter(noticia => {
    // Filtrar noticias con título muy corto
    if (noticia.titulo.length < 10) return false;
    
    // Filtrar noticias con bajada muy corta
    if (noticia.bajada.length < 20) return false;
    
    // Filtrar noticias sin foto
    if (!noticia.foto || noticia.foto === 'default-image-url') return false;
    
    // Filtrar noticias con fecha muy antigua (más de 30 días)
    const writtenDate = new Date(noticia.written_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (writtenDate < thirtyDaysAgo) return false;
    
    return true;
  });
}

/**
 * Agrupa noticias por categoría
 */
export function groupByCategory(noticias: INoticia[]): Record<string, INoticia[]> {
  return noticias.reduce((groups, noticia) => {
    const category = noticia.categoria || 'Sin categoría';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(noticia);
    return groups;
  }, {} as Record<string, INoticia[]>);
}

/**
 * Agrupa noticias por medio
 */
export function groupByMedium(noticias: INoticia[]): Record<string, INoticia[]> {
  return noticias.reduce((groups, noticia) => {
    const medium = noticia.medio || 'Sin medio';
    if (!groups[medium]) {
      groups[medium] = [];
    }
    groups[medium].push(noticia);
    return groups;
  }, {} as Record<string, INoticia[]>);
}

/**
 * Calcula estadísticas de las noticias
 */
export function calculateNoticiasStats(noticias: INoticia[]): {
  total: number;
  byCategory: Record<string, number>;
  byMedium: Record<string, number>;
  byCity: Record<string, number>;
  averageTitleLength: number;
  averageBajadaLength: number;
} {
  const byCategory: Record<string, number> = {};
  const byMedium: Record<string, number> = {};
  const byCity: Record<string, number> = {};
  
  let totalTitleLength = 0;
  let totalBajadaLength = 0;
  
  noticias.forEach(noticia => {
    // Contar por categoría
    const category = noticia.categoria || 'Sin categoría';
    byCategory[category] = (byCategory[category] || 0) + 1;
    
    // Contar por medio
    const medium = noticia.medio || 'Sin medio';
    byMedium[medium] = (byMedium[medium] || 0) + 1;
    
    // Contar por ciudad
    const city = noticia.ciudad || 'Sin ciudad';
    byCity[city] = (byCity[city] || 0) + 1;
    
    // Acumular longitudes
    totalTitleLength += noticia.titulo?.length || 0;
    totalBajadaLength += noticia.bajada?.length || 0;
  });
  
  return {
    total: noticias.length,
    byCategory,
    byMedium,
    byCity,
    averageTitleLength: noticias.length > 0 ? Math.round(totalTitleLength / noticias.length) : 0,
    averageBajadaLength: noticias.length > 0 ? Math.round(totalBajadaLength / noticias.length) : 0,
  };
}

/**
 * Ordena noticias por fecha (más recientes primero)
 */
export function sortByDate(noticias: INoticia[]): INoticia[] {
  return [...noticias].sort((a, b) => {
    const dateA = new Date(a.written_at);
    const dateB = new Date(b.written_at);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Limita el número de noticias por fuente
 */
export function limitNoticiasPerSource(noticias: INoticia[], limit: number): INoticia[] {
  const bySource = groupByMedium(noticias);
  const limited: INoticia[] = [];
  
  Object.values(bySource).forEach(sourceNoticias => {
    limited.push(...sourceNoticias.slice(0, limit));
  });
  
  return limited;
}
