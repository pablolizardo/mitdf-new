import { NextRequest, NextResponse } from "next/server";
import { getEnabledSources, INoticiaSourceBaseConfig } from "./sources/config";
import { logger } from "./services/logger";
import { cacheService } from "./services/cache-service";
import { validateConfig } from "./config/system-config";
import { INoticiaProcessingResult, INoticiaProcessingSummary } from "./sources/types";
import { NoticiasProcessor } from "./services/noticias-processor";

// Validar configuración del sistema al iniciar
const configValidation = validateConfig();
if (!configValidation.isValid) {
  console.error('Error en configuración del sistema:', configValidation.errors);
}

export const COUNT = 1; // Mantener compatibilidad con el código existente

// Importaciones dinámicas para evitar dependencias circulares
const getSourceFunction = async (sourceId: string) => {
  try {
    switch (sourceId) {
      case 'actualidadtdf':
        const { fetchActualidadTdf } = await import('./sources/actualidadtdf');
        return fetchActualidadTdf;
      case 'criticasur':
        const { fetchCriticaSur } = await import('./sources/criticaSur');
        return fetchCriticaSur;
      case 'diecinueve':
        const { fetchDiecinueve } = await import('./sources/diecinueve');
        return fetchDiecinueve;
      case 'findelmundo':
        const { fetchFinDelMundo } = await import('./sources/finDelMundo');
        return fetchFinDelMundo;
      case 'info3':
        const { fetchInfo3 } = await import('./sources/info3');
        return fetchInfo3;
      case 'notitdf':
        const { fetchNotiTdf } = await import('./sources/notitdf');
        return fetchNotiTdf;
      case 'resumenpolicial':
        const { fetchResumenPolicial } = await import('./sources/resumen-policial');
        return fetchResumenPolicial;
      case 'sur54':
        const { fetchSur54 } = await import('./sources/sur54');
        return fetchSur54;
      case 'surenio':
        const { fetchSurenio } = await import('./sources/surenio');
        return fetchSurenio;
      case 'airelibre':
        const { fetchAireLibre } = await import('./sources/aire-libre');
        return fetchAireLibre;
      case 'minutofueguino':
        const { fetchMinutoFueguino } = await import('./sources/minutoFueguino');
        return fetchMinutoFueguino;
      case 'provincia23':
        const { fetchProvincia23 } = await import('./sources/provincia-23');
        return fetchProvincia23;
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error importing source ${sourceId}:`, error);
    return null;
  }
};

async function processSource(sourceId: string): Promise<INoticiaProcessingResult> {
  const startTime = Date.now();
  
  try {
    const fetchFunction = await getSourceFunction(sourceId);
    if (!fetchFunction) {
      throw new Error(`Fuente no encontrada: ${sourceId}`);
    }

    const noticias = await fetchFunction();
    const processingTime = Date.now() - startTime;

    return {
      success: true,
      sourceId,
      noticias,
      processingTime,
      added: noticias.length,
      skipped: 0,
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    return {
      success: false,
      sourceId,
      noticias: [],
      error: error instanceof Error ? error.message : 'Error desconocido',
      processingTime,
      added: 0,
      skipped: 0,
    };
  }
}

/**
 * POST /api/fetch/noticias
 * Endpoint principal para obtener y procesar noticias de todas las fuentes
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const TIMEOUT_MS = 30000; // 30 segundos máximo para procesamiento en servidor propio
  
  try {
    logger.info('API', 'Iniciando procesamiento de noticias', { timestamp: new Date().toISOString() });
    
    // Obtener fuentes habilitadas
    const sources = getEnabledSources();
    logger.info('API', `Procesando ${sources.length} fuentes de noticias`, { sources: sources.map(s => s.id) });
    
    // Crear un timeout para evitar que la función se ejecute más de 8 segundos
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Procesamiento excedió el límite de tiempo')), TIMEOUT_MS);
    });
    
    // Inicializar el procesador de noticias
    const processor = NoticiasProcessor.getInstance();
    
    // Procesar todas las fuentes en paralelo con timeout
    const processingPromises = sources.map(source => processSource(source.id));
    const sourceResults = await Promise.race([
      Promise.allSettled(processingPromises),
      timeoutPromise
    ]) as PromiseSettledResult<INoticiaProcessingResult>[];
    
    // Procesar resultados y guardar en DB usando el procesador
    let successfulSources = 0;
    let failedSources = 0;
    let totalNoticias = 0;
    let totalAdded = 0;
    let totalSkipped = 0;
    const results: INoticiaProcessingResult[] = [];

    for (const result of sourceResults) {
      if (result.status === 'fulfilled') {
        const processedResult = result.value;
        
        // Si la fuente fue exitosa, procesar las noticias con el procesador
        if (processedResult.success && processedResult.noticias.length > 0) {
          // Obtener la configuración de la fuente para pasar al procesador
          const sourceConfig = sources.find(s => s.id === processedResult.sourceId);
          const { added, skipped } = await processor.processNoticiasInBatches(processedResult.noticias, sourceConfig);
          processedResult.added = added;
          processedResult.skipped = skipped;
        }
        
        results.push(processedResult);
        if (processedResult.success) {
          successfulSources++;
          totalNoticias += processedResult.noticias.length;
          totalAdded += processedResult.added;
          totalSkipped += processedResult.skipped;
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
    const summary: INoticiaProcessingSummary = {
      totalSources: sources.length,
      successfulSources,
      failedSources,
      totalNoticias,
      totalAdded,
      totalSkipped,
      totalProcessingTime,
      results,
    };
    
    // Loggear resultados
    logger.info('API', 'Procesamiento completado', {
      totalSources: summary.totalSources,
      successfulSources: summary.successfulSources,
      failedSources: summary.failedSources,
      totalNoticias: summary.totalNoticias,
      totalAdded: summary.totalAdded,
      totalSkipped: summary.totalSkipped,
      totalProcessingTime: summary.totalProcessingTime,
    });
    
    // Loggear errores si los hay
    if (summary.failedSources > 0) {
      const failedResults = summary.results.filter(r => !r.success);
      failedResults.forEach(result => {
        logger.error('API', `Error en fuente ${result.sourceId}`, new Error(result.error || 'Unknown error'), {
          sourceId: result.sourceId,
          error: result.error,
        });
      });
    }
    
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      message: 'Procesamiento de noticias completado',
      summary: {
        ...summary,
        apiProcessingTime: totalTime,
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    logger.error('API', 'Error durante el procesamiento de noticias', error as Error, {
      totalTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    // Si es un timeout, retornar un error específico
    if (error instanceof Error && error.message.includes('Timeout')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Timeout: El procesamiento tomó demasiado tiempo',
          error: 'FUNCTION_INVOCATION_TIMEOUT',
          timestamp: new Date().toISOString(),
          processingTime: totalTime,
        },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error durante el procesamiento de noticias',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        processingTime: totalTime,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fetch/noticias
 * Endpoint para obtener estadísticas y estado del sistema
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    
    switch (action) {
      case 'stats':
        return await getSystemStats();
      case 'sources':
        return await getSourcesInfo();
      case 'cache':
        return await getCacheStats();
      case 'logs':
        return await getRecentLogs(request);
      case 'health':
        return await getHealthCheck();
      default:
        return await getDefaultInfo();
    }
  } catch (error) {
    logger.error('API', 'Error en GET request', error as Error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error obteniendo información del sistema',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Obtiene estadísticas del sistema
 */
async function getSystemStats() {
  const sources = getEnabledSources();
  const cacheStats = cacheService.getStats();
  const logStats = logger.getStats();
  
  return NextResponse.json({
    success: true,
    data: {
      system: {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
      },
      sources: {
        total: sources.length,
        enabled: sources.filter(s => s.enabled).length,
        disabled: sources.filter(s => !s.enabled).length,
      },
      processing: {
        // Estadísticas básicas del procesamiento
        lastRun: new Date().toISOString(),
        sourcesProcessed: sources.length,
      },
      cache: cacheStats,
      logging: logStats,
    },
  });
}

/**
 * Obtiene información de las fuentes
 */
async function getSourcesInfo() {
  const sources = getEnabledSources();
  
  return NextResponse.json({
    success: true,
    data: {
      sources: sources.map(source => ({
        id: source.id,
        name: source.name,
        baseUrl: source.baseUrl,
        enabled: source.enabled,
        priority: source.priority,
        rateLimit: source.rateLimit,
        retryConfig: source.retryConfig,
      })),
      total: sources.length,
    },
  });
}

/**
 * Obtiene estadísticas del cache
 */
async function getCacheStats() {
  const stats = cacheService.getStats();
  
  return NextResponse.json({
    success: true,
    data: stats,
  });
}

/**
 * Obtiene logs recientes
 */
async function getRecentLogs(request: NextRequest) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '100');
  const level = url.searchParams.get('level');
  const source = url.searchParams.get('source');
  
  let logs;
  if (source) {
    logs = logger.getLogsBySource(source, limit);
  } else if (level) {
    // Mapear string a LogLevel
    let logLevel: any = undefined;
    switch (level.toUpperCase()) {
      case 'DEBUG':
        logLevel = 0;
        break;
      case 'INFO':
        logLevel = 1;
        break;
      case 'WARN':
        logLevel = 2;
        break;
      case 'ERROR':
        logLevel = 3;
        break;
    }
    logs = logger.getLogs(logLevel, undefined, limit);
  } else {
    logs = logger.getRecentLogs(limit);
  }
  
  return NextResponse.json({
    success: true,
    data: {
      logs,
      total: logs.length,
      limit,
      level,
      source,
    },
  });
}

/**
 * Health check del sistema
 */
async function getHealthCheck() {
  const sources = getEnabledSources();
  const cacheStats = cacheService.getStats();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      sources: sources.length > 0,
      processor: true, // Simplificado para evitar dependencias
      cache: cacheStats.size < cacheStats.maxSize,
      database: true, // Aquí podrías agregar un check real de la DB
    },
  };
  
  // Determinar estado general
  const allChecksPassed = Object.values(health.checks).every(check => check);
  health.status = allChecksPassed ? 'healthy' : 'unhealthy';
  
  const statusCode = allChecksPassed ? 200 : 503;
  
  return NextResponse.json(health, { status: statusCode });
}

/**
 * Información por defecto
 */
async function getDefaultInfo() {
  return NextResponse.json({
    success: true,
    message: 'API de noticias funcionando',
    endpoints: {
      'POST /': 'Procesar todas las fuentes de noticias',
      'GET /?action=stats': 'Obtener estadísticas del sistema',
      'GET /?action=sources': 'Obtener información de las fuentes',
      'GET /?action=cache': 'Obtener estadísticas del cache',
      'GET /?action=logs': 'Obtener logs recientes',
      'GET /?action=health': 'Health check del sistema',
    },
    timestamp: new Date().toISOString(),
  });
}
