import { NextRequest, NextResponse } from 'next/server';
import { INoticiaProcessingResult, INoticiaProcessingSummary } from '../sources/types';

// Importaciones dinámicas para evitar dependencias circulares
const getSourceFunction = async (sourceId: string) => {
  try {
    switch (sourceId) {
      case 'actualidadtdf':
        const { fetchActualidadTdf } = await import('../sources/actualidadtdf');
        return fetchActualidadTdf;
      case 'criticasur':
        const { fetchCriticaSur } = await import('../sources/criticaSur');
        return fetchCriticaSur;
      case 'diecinueve':
        const { fetchDiecinueve } = await import('../sources/diecinueve');
        return fetchDiecinueve;
      case 'findelmundo':
        const { fetchFinDelMundo } = await import('../sources/finDelMundo');
        return fetchFinDelMundo;
      case 'info3':
        const { fetchInfo3 } = await import('../sources/info3');
        return fetchInfo3;
      case 'notitdf':
        const { fetchNotiTdf } = await import('../sources/notitdf');
        return fetchNotiTdf;
      case 'resumenpolicial':
        const { fetchResumenPolicial } = await import('../sources/resumen-policial');
        return fetchResumenPolicial;
      case 'sur54':
        const { fetchSur54 } = await import('../sources/sur54');
        return fetchSur54;
      case 'surenio':
        const { fetchSurenio } = await import('../sources/surenio');
        return fetchSurenio;
      case 'airelibre':
        const { fetchAireLibre } = await import('../sources/aire-libre');
        return fetchAireLibre;
      case 'minutofueguino':
        const { fetchMinutoFueguino } = await import('../sources/minutoFueguino');
        return fetchMinutoFueguino;
      case 'provincia23':
        const { fetchProvincia23 } = await import('../sources/provincia-23');
        return fetchProvincia23;
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error importing source ${sourceId}:`, error);
    return null;
  }
};

// Nombres de las fuentes para mostrar en los resultados
const sourceNames: { [key: string]: string } = {
  actualidadtdf: 'Actualidad TDF',
  criticasur: 'Crítica Sur',
  diecinueve: '19640',
  findelmundo: 'Fin del Mundo',
  info3: 'Info3',
  notitdf: 'NotiTDF',
  resumenpolicial: 'Resumen Policial',
  sur54: 'Sur54',
  surenio: 'Surenio',
  airelibre: 'Aire Libre',
  minutofueguino: 'Minuto Fueguino',
  provincia23: 'Provincia 23',
};

async function testSource(sourceId: string): Promise<INoticiaProcessingResult> {
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
      added: noticias.length, // En testing, todas las noticias se consideran "agregadas"
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

async function testAllSources(): Promise<INoticiaProcessingSummary> {
  const startTime = Date.now();
  const results: INoticiaProcessingResult[] = [];
  
  // Lista de todas las fuentes disponibles
  const allSourceIds = Object.keys(sourceNames);
  
  // Testear todas las fuentes en paralelo
  const testPromises = allSourceIds.map(sourceId => testSource(sourceId));
  const sourceResults = await Promise.all(testPromises);
  
  // Calcular estadísticas
  const successfulSources = sourceResults.filter(r => r.success).length;
  const failedSources = sourceResults.filter(r => !r.success).length;
  const totalNoticias = sourceResults.reduce((sum, r) => sum + r.noticias.length, 0);
  const totalAdded = sourceResults.reduce((sum, r) => sum + r.added, 0);
  const totalSkipped = sourceResults.reduce((sum, r) => sum + r.skipped, 0);
  const totalProcessingTime = Date.now() - startTime;

  return {
    totalSources: sourceResults.length,
    successfulSources,
    failedSources,
    totalNoticias,
    totalAdded,
    totalSkipped,
    totalProcessingTime,
    results: sourceResults,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceId } = body;

    if (!sourceId) {
      return NextResponse.json(
        { error: 'sourceId es requerido' },
        { status: 400 }
      );
    }

    if (sourceId === 'all') {
      // Testear todas las fuentes
      const summary = await testAllSources();
      return NextResponse.json({
        summary,
        results: summary.results.map(result => ({
          ...result,
          sourceName: sourceNames[result.sourceId] || result.sourceId,
        })),
      });
    } else {
      // Testear una fuente específica
      const result = await testSource(sourceId);
      const summary: INoticiaProcessingSummary = {
        totalSources: 1,
        successfulSources: result.success ? 1 : 0,
        failedSources: result.success ? 0 : 1,
        totalNoticias: result.noticias.length,
        totalAdded: result.added,
        totalSkipped: result.skipped,
        totalProcessingTime: result.processingTime,
        results: [result],
      };

      return NextResponse.json({
        summary,
        results: [{
          ...result,
          sourceName: sourceNames[result.sourceId] || result.sourceId,
        }],
      });
    }
  } catch (error) {
    console.error('Error en testing de fuentes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fetch/noticias/test
 * Información sobre el endpoint de prueba
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Endpoint de prueba para el sistema de noticias',
    usage: {
      method: 'POST',
      body: {
        sourceId: 'string (opcional, por defecto: info3)'
      },
      example: {
        curl: 'curl -X POST http://localhost:3000/api/fetch/noticias/test -H "Content-Type: application/json" -d \'{"sourceId": "info3"}\''
      }
    },
    availableSources: [
      'actualidadtdf',
      'aire-libre', 
      'criticasur',
      'diecinueve',
      'fin-del-mundo',
      'info3',
      'minuto-fueguino',
      'notitdf',
      'provincia-23',
      'resumen-policial',
      'sur54',
      'surenio'
    ],
    timestamp: new Date().toISOString(),
  });
}
