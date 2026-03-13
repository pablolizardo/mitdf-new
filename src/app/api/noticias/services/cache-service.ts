import { INoticia } from '../sources/types';
import { getConfig } from '../config/system-config';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config = getConfig('cache');

  private constructor() {
    // Limpiar cache expirado cada 5 minutos
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Obtiene un valor del cache
   */
  public get<T>(key: string): T | null {
    if (!this.config.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    // Verificar si el cache ha expirado
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Almacena un valor en el cache
   */
  public set<T>(key: string, data: T, ttl?: number): void {
    if (!this.config.enabled) return;

    // Limpiar cache si excede el tamaño máximo
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttlMs,
    };

    this.cache.set(key, entry);
  }

  /**
   * Verifica si una clave existe en el cache
   */
  public has(key: string): boolean {
    if (!this.config.enabled) return false;

    const entry = this.cache.get(key);
    if (!entry) return false;

    // Verificar si el cache ha expirado
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Elimina una entrada del cache
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Limpia todo el cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Obtiene estadísticas del cache
   */
  public getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    missRate: number;
    totalRequests: number;
    hits: number;
    misses: number;
  } {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;
    const missRate = totalRequests > 0 ? this.misses / totalRequests : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate,
      missRate,
      totalRequests,
      hits: this.hits,
      misses: this.misses,
    };
  }

  /**
   * Genera una clave de cache para noticias
   */
  public generateNoticiasKey(sourceId: string, params?: Record<string, any>): string {
    const baseKey = `noticias:${sourceId}`;
    
    if (!params || Object.keys(params).length === 0) {
      return baseKey;
    }

    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `${baseKey}:${sortedParams}`;
  }

  /**
   * Cachea noticias de una fuente
   */
  public cacheNoticias(sourceId: string, noticias: INoticia[], ttl?: number): void {
    const key = this.generateNoticiasKey(sourceId);
    this.set(key, noticias, ttl);
  }

  /**
   * Obtiene noticias cacheadas de una fuente
   */
  public getCachedNoticias(sourceId: string): INoticia[] | null {
    const key = this.generateNoticiasKey(sourceId);
    return this.get<INoticia[]>(key);
  }

  /**
   * Invalida el cache de una fuente específica
   */
  public invalidateSource(sourceId: string): void {
    const key = this.generateNoticiasKey(sourceId);
    this.delete(key);
  }

  /**
   * Invalida todo el cache de noticias
   */
  public invalidateAllNoticias(): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith('noticias:')) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * Limpia entradas expiradas del cache
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * Elimina las entradas más antiguas del cache
   */
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries());
    
    // Ordenar por timestamp (más antiguos primero)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Eliminar el 20% más antiguo
    const toDelete = Math.ceil(entries.length * 0.2);
    
    for (let i = 0; i < toDelete; i++) {
      this.delete(entries[i][0]);
    }
  }

  // Métricas de cache
  private hits = 0;
  private misses = 0;

  /**
   * Incrementa el contador de hits
   */
  public incrementHits(): void {
    this.hits++;
  }

  /**
   * Incrementa el contador de misses
   */
  public incrementMisses(): void {
    this.misses++;
  }

  /**
   * Resetea las métricas
   */
  public resetMetrics(): void {
    this.hits = 0;
    this.misses = 0;
  }
}

// Exportar instancia singleton
export const cacheService = CacheService.getInstance();
