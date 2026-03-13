import { INoticia, INoticiaSource, INoticiaProcessingResult, INoticiaProcessingSummary } from '../sources/types';
import { prisma } from '@/lib/db';
import { Noticia } from '@prisma/client';
import { INoticiaSourceBaseConfig } from '../sources/config';

export class NoticiasProcessor {
  private static instance: NoticiasProcessor;
  private processingQueue: Map<string, Promise<INoticiaProcessingResult>> = new Map();
  private rateLimitTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  public static getInstance(): NoticiasProcessor {
    if (!NoticiasProcessor.instance) {
      NoticiasProcessor.instance = new NoticiasProcessor();
    }
    return NoticiasProcessor.instance;
  }

  /**
   * Extrae la ciudad del texto (título, bajada o longtext)
   */
  private extractCityFromText(text: string): string | null {
    if (!text) return null;
    
    const normalizedText = text.toLowerCase();
    
    // Ciudades principales (alta prioridad)
    if (normalizedText.includes('ushuaia')) {
      return 'Ushuaia';
    }
    
    if (normalizedText.includes('rio grande')) {
      return 'Rio Grande';
    }
    
    if (normalizedText.includes('tolhuin')) {
      return 'Tolhuin';
    }
    
    if (normalizedText.includes('buenos aires')) {
      return 'Buenos Aires';
    }
    
    // Ciudades adicionales (menor prioridad)
    if (normalizedText.includes('punta arenas')) {
      return 'Punta Arenas';
    }
    
    if (normalizedText.includes('rio gallegos')) {
      return 'Rio Gallegos';
    }
    
    if (normalizedText.includes('punta maria')) {
      return 'Punta Maria';
    }
    
    if (normalizedText.includes('san sebastian')) {
      return 'San Sebastian';
    }
    
    if (normalizedText.includes('neuquen')) {
      return 'Neuquen';
    }
    
    if (normalizedText.includes('viedma')) {
      return 'Viedma';
    }
    
    if (normalizedText.includes('trelew')) {
      return 'Trelew';
    }
    
    if (normalizedText.includes('esquel')) {
      return 'Esquel';
    }
    
    if (normalizedText.includes('caleta olivia')) {
      return 'Caleta Olivia';
    }
    
    if (normalizedText.includes('calafate')) {
      return 'Calafate';
    }
    
    if (normalizedText.includes('bariloche')) {
      return 'Bariloche';
    }
    
    if (normalizedText.includes('rawson')) {
      return 'Rawson';
    }
    
    if (normalizedText.includes('puerto madryn')) {
      return 'Puerto Madryn';
    }
    
    if (normalizedText.includes('puerto madrin')) {
      return 'Puerto Madrin';
    }
    
    if (normalizedText.includes('porvenir')) {
      return 'Porvenir';
    }
    
    return null;
  }

  /**
   * Extrae la ciudad de una noticia basándose en título, bajada y longtext
   * Siempre intenta extraer la ciudad del texto, ignorando el valor por defecto
   */
  public extractCityFromNoticia(noticia: INoticia, source?: INoticiaSourceBaseConfig): string {
    // Buscar en título
    const cityFromTitle = this.extractCityFromText(noticia.titulo);
    if (cityFromTitle) {
      return cityFromTitle;
    }
    
    // Buscar en bajada
    const cityFromBajada = this.extractCityFromText(noticia.bajada);
    if (cityFromBajada) {
      return cityFromBajada;
    }
    
    // Buscar en longtext
    if (noticia.longtext) {
      const cityFromLongtext = this.extractCityFromText(noticia.longtext);
      if (cityFromLongtext) {
        return cityFromLongtext;
      }
    }
    
    // Si no se encuentra ninguna ciudad, usar la ciudad por defecto de la fuente
    if (source?.defaultCity) {
      return source.defaultCity;
    }
    
    // Fallback a "Nacional" si no hay fuente o ciudad por defecto
    return 'Nacional';
  }

  /**
   * Procesa todas las fuentes de noticias de forma optimizada
   */
  public async processAllSources(sources: INoticiaSource[]): Promise<INoticiaProcessingSummary> {
    const startTime = Date.now();
    const results: INoticiaProcessingResult[] = [];
    
    // Procesar fuentes en paralelo con rate limiting
    const processingPromises = sources.map(source => this.processSourceWithRateLimit(source));
    
    // Esperar a que todas las fuentes se procesen
    const sourceResults = await Promise.allSettled(processingPromises);
    
    // Procesar resultados
    let successfulSources = 0;
    let failedSources = 0;
    let totalNoticias = 0;
    let totalAdded = 0;
    let totalSkipped = 0;

    for (const result of sourceResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
        if (result.value.success) {
          successfulSources++;
          totalNoticias += result.value.noticias.length;
          totalAdded += result.value.added;
          totalSkipped += result.value.skipped;
        } else {
          failedSources++;
        }
      } else {
        failedSources++;
        results.push({
          success: false,
          sourceId: 'unknown',
          noticias: [],
          error: result.reason?.message || 'Unknown error',
          processingTime: 0,
          added: 0,
          skipped: 0,
        });
      }
    }

    const totalProcessingTime = Date.now() - startTime;

    return {
      totalSources: sources.length,
      successfulSources,
      failedSources,
      totalNoticias,
      totalAdded,
      totalSkipped,
      totalProcessingTime,
      results,
    };
  }

  /**
   * Procesa una fuente individual con rate limiting
   */
  private async processSourceWithRateLimit(source: INoticiaSource): Promise<INoticiaProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Aplicar rate limiting
      await this.applyRateLimit(source);
      
      // Procesar la fuente
      const noticias = await this.fetchWithRetry(source);
      
      // Procesar noticias en lotes para mejor performance
      const { added, skipped } = await this.processNoticiasInBatches(noticias, source);
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        sourceId: source.id,
        noticias,
        processingTime,
        added,
        skipped,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        sourceId: source.id,
        noticias: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
        added: 0,
        skipped: 0,
      };
    }
  }

  /**
   * Aplica rate limiting basado en la configuración de la fuente
   */
  private async applyRateLimit(source: INoticiaSource): Promise<void> {
    const { delayBetweenRequests } = source.rateLimit;
    
    if (delayBetweenRequests > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
    }
  }

  /**
   * Intenta obtener noticias con retry logic
   */
  private async fetchWithRetry(source: INoticiaSource): Promise<INoticia[]> {
    const { maxRetries, backoffMs } = source.retryConfig;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await source.fetch();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < maxRetries) {
          const delay = backoffMs * Math.pow(2, attempt); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Procesa noticias en lotes para mejor performance
   */
  public async processNoticiasInBatches(noticias: INoticia[], source?: INoticiaSourceBaseConfig): Promise<{ added: number; skipped: number }> {
    const BATCH_SIZE = 50; // Procesar en lotes de 50
    let added = 0;
    let skipped = 0;

    // Procesar en lotes
    for (let i = 0; i < noticias.length; i += BATCH_SIZE) {
      const batch = noticias.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(noticia => this.processSingleNoticia(noticia, source))
      );

      batchResults.forEach(result => {
        if (result.added) added++;
        if (result.skipped) skipped++;
      });
    }

    return { added, skipped };
  }

  /**
   * Procesa una noticia individual
   */
  private async processSingleNoticia(noticia: INoticia, source?: INoticiaSourceBaseConfig): Promise<{ added: boolean; skipped: boolean }> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Verificar si ya existe
        const exists = await tx.noticia.findFirst({
          where: { slug: noticia.slug },
          select: { id: true },
        });

        if (exists) {
          return { added: false, skipped: true };
        }

        // Crear nueva noticia
        await tx.noticia.create({
          data: {
            titulo: noticia.titulo,
            slug: noticia.slug,
            bajada: noticia.bajada,
            foto: noticia.foto,
            longtext: noticia.longtext,
            medio: noticia.medio,
            ciudad: this.extractCityFromNoticia(noticia, source),
            categoria: noticia.categoria,
            tags: noticia.tags?.join(",") || "",
            written_at: noticia.written_at.toString(),
            written_at_date: noticia.written_at,
            created_at: new Date()
          },
        });

        return { added: true, skipped: false };
      });
    } catch (error) {
      // Si es un error de constraint único, la noticia ya existe
      if (error instanceof Error && error.message.includes('Unique constraint failed')) {
        return { added: false, skipped: true };
      }
      
      // Para otros errores, loggear y continuar
      console.error(`Error processing noticia ${noticia.slug}:`, error);
      return { added: false, skipped: false };
    }
  }

  /**
   * Procesa una fuente específica por ID
   */
  public async processSourceById(sourceId: string, sources: INoticiaSource[]): Promise<INoticiaProcessingResult | null> {
    const source = sources.find(s => s.id === sourceId);
    if (!source) {
      return null;
    }

    return this.processSourceWithRateLimit(source);
  }

  /**
   * Obtiene estadísticas de procesamiento
   */
  public getProcessingStats(): { queueSize: number; activeTimers: number } {
    return {
      queueSize: this.processingQueue.size,
      activeTimers: this.rateLimitTimers.size,
    };
  }

  /**
   * Limpia recursos
   */
  public cleanup(): void {
    this.processingQueue.clear();
    this.rateLimitTimers.forEach(timer => clearTimeout(timer));
    this.rateLimitTimers.clear();
  }

  /**
   * Método público para probar la extracción de ciudad (solo para debugging)
   */
  public testCityExtraction(text: string): string | null {
    return this.extractCityFromText(text);
  }
}
