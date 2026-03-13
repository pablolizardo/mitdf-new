import { NextRequest, NextResponse } from "next/server";
import { getEnabledSources } from "../sources/config";
import { NoticiasProcessor } from "../services/noticias-processor";
import { logger } from "../services/logger";

/**
 * POST /api/fetch/noticias/test-full
 * Endpoint de prueba para procesar todas las fuentes con límites
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { maxSources = 3, maxNoticiasPerSource = 2 } = body; // Límites para testing
    
    logger.info('TEST-FULL', 'Iniciando prueba completa con límites', { 
      maxSources, 
      maxNoticiasPerSource 
    });
    
    // Obtener fuentes habilitadas y limitar para testing
    const allSources = getEnabledSources();
    const limitedSources = allSources.slice(0, maxSources);
    
    logger.info('TEST-FULL', `Procesando ${limitedSources.length} fuentes de ${allSources.length} totales`, {
      sources: limitedSources.map(s => s.id),
      totalSources: allSources.length,
    });
    
    // Inicializar procesador
    const processor = NoticiasProcessor.getInstance();
    
    // Procesar fuentes limitadas
    const summary = await processor.processAllSources(limitedSources);
    
    const totalTime = Date.now() - startTime;
    
    logger.info('TEST-FULL', 'Prueba completa finalizada', {
      totalSources: summary.totalSources,
      successfulSources: summary.successfulSources,
      failedSources: summary.failedSources,
      totalNoticias: summary.totalNoticias,
      totalAdded: summary.totalAdded,
      totalSkipped: summary.totalSkipped,
      totalProcessingTime: summary.totalProcessingTime,
      totalTime,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Prueba completa finalizada',
      config: {
        maxSources,
        maxNoticiasPerSource,
        actualSourcesProcessed: limitedSources.length,
        totalSourcesAvailable: allSources.length,
      },
      summary: {
        ...summary,
        apiProcessingTime: totalTime,
      },
      performance: {
        averageTimePerSource: summary.totalProcessingTime / summary.totalSources,
        noticiasPerSecond: summary.totalNoticias / (summary.totalProcessingTime / 1000),
        successRate: (summary.successfulSources / summary.totalSources) * 100,
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    logger.error('TEST-FULL', 'Error durante la prueba completa', error as Error, {
      totalTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error durante la prueba completa',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        processingTime: totalTime,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fetch/noticias/test-full
 * Información sobre el endpoint de prueba completa
 */
export async function GET() {
  const allSources = getEnabledSources();
  
  return NextResponse.json({
    success: true,
    message: 'Endpoint de prueba completa para el sistema de noticias',
    usage: {
      method: 'POST',
      body: {
        maxSources: 'number (opcional, por defecto: 3)',
        maxNoticiasPerSource: 'number (opcional, por defecto: 2)'
      },
      example: {
        curl: 'curl -X POST http://localhost:3000/api/fetch/noticias/test-full -H "Content-Type: application/json" -d \'{"maxSources": 3, "maxNoticiasPerSource": 2}\''
      }
    },
    availableSources: allSources.map(s => ({
      id: s.id,
      name: s.name,
      priority: s.priority,
    })),
    totalSources: allSources.length,
    timestamp: new Date().toISOString(),
  });
}
