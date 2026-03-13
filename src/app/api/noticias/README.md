# Sistema de Noticias Optimizado

Este directorio contiene un sistema optimizado y escalable para obtener noticias de múltiples fuentes web y almacenarlas en la base de datos.

## 🚀 Características Principales

### 1. **Arquitectura Modular**
- **Sistema de plugins/adapters** para cada fuente de noticias
- **Configuración centralizada** de fuentes
- **Separación clara de responsabilidades**

### 2. **Performance Optimizada**
- **Procesamiento en lotes** para mejor rendimiento en DB
- **Rate limiting inteligente** para evitar sobrecargar sitios
- **Cache en memoria** para evitar requests innecesarios
- **Procesamiento paralelo** de fuentes

### 3. **Robustez y Confiabilidad**
- **Sistema de retry** con backoff exponencial
- **Manejo de errores robusto** con fallback
- **Logging estructurado** para debugging
- **Health checks** del sistema

### 4. **Escalabilidad**
- **Fácil agregar nuevas fuentes** sin modificar código existente
- **Configuración por fuente** (rate limits, retries, prioridades)
- **Sistema de prioridades** para procesamiento

## 📁 Estructura del Directorio

```
sources/
├── config.ts              # Configuración centralizada de fuentes
├── types.ts               # Tipos TypeScript del sistema
├── actualidadtdf.ts       # Adapter para Actualidad TDF
├── aire-libre.ts          # Adapter para Aire Libre
├── criticaSur.ts          # Adapter para Critica Sur
├── ...                    # Otros adapters
└── index.ts               # Exportaciones (legacy)

services/
├── noticias-processor.ts  # Procesador principal de noticias
├── logger.ts              # Sistema de logging estructurado
└── cache-service.ts       # Servicio de cache en memoria

utils/
├── processing-utils.ts    # Utilidades para procesamiento de noticias

config/
└── system-config.ts       # Configuración global del sistema

route.ts                   # API endpoints principales
```

## 🔧 Cómo Agregar una Nueva Fuente

### 1. Crear el Adapter

```typescript
// sources/nueva-fuente.ts
import { INoticia } from './types';

export const fetchNuevaFuente = async (): Promise<INoticia[]> => {
  const noticias: INoticia[] = [];
  
  try {
    // Tu lógica para obtener noticias
    const response = await fetch('https://nueva-fuente.com/api/noticias');
    const data = await response.json();
    
    // Transformar datos al formato INoticia
    data.forEach((item: any) => {
      noticias.push({
        _id: generateId(item.title),
        slug: generateSlug(item.title),
        titulo: item.title,
        bajada: item.excerpt,
        // ... otros campos
      });
    });
    
  } catch (error) {
    console.error('Error fetching from Nueva Fuente:', error);
  }
  
  return noticias;
};
```

### 2. Agregar a la Configuración

```typescript
// sources/config.ts
import { fetchNuevaFuente } from './nueva-fuente';

export const NOTICIAS_SOURCES_CONFIG: INoticiaSource[] = [
  // ... fuentes existentes
  {
    id: 'nueva-fuente',
    name: 'Nueva Fuente',
    baseUrl: 'https://nueva-fuente.com',
    enabled: true,
    priority: 13, // Prioridad más baja
    rateLimit: {
      requestsPerMinute: 60,
      delayBetweenRequests: 1000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMs: 2000,
    },
    fetch: fetchNuevaFuente,
  },
];
```

### 3. ¡Listo!

La nueva fuente se procesará automáticamente en la próxima ejecución.

## 📊 Endpoints de la API

### POST `/api/fetch/noticias`
Procesa todas las fuentes de noticias habilitadas.

**Response:**
```json
{
  "success": true,
  "message": "Procesamiento de noticias completado",
  "summary": {
    "totalSources": 12,
    "successfulSources": 11,
    "failedSources": 1,
    "totalNoticias": 156,
    "totalAdded": 23,
    "totalSkipped": 133,
    "totalProcessingTime": 45000,
    "apiProcessingTime": 46000
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET `/api/fetch/noticias?action=stats`
Obtiene estadísticas del sistema.

### GET `/api/fetch/noticias?action=sources`
Lista todas las fuentes configuradas.

### GET `/api/fetch/noticias?action=cache`
Estadísticas del sistema de cache.

### GET `/api/fetch/noticias?action=logs`
Logs recientes del sistema.

### GET `/api/fetch/noticias?action=health`
Health check del sistema.

## ⚙️ Configuración del Sistema

### Configuración de Procesamiento
```typescript
processing: {
  batchSize: 50,                    // Tamaño del lote para DB
  maxConcurrentSources: 5,          // Máximo fuentes en paralelo
  timeoutMs: 30000,                 // Timeout por fuente (30s)
}
```

### Configuración de Rate Limiting
```typescript
rateLimiting: {
  globalRequestsPerMinute: 300,     // Límite global
  defaultDelayBetweenRequests: 1000, // Delay por defecto (1s)
  maxDelayBetweenRequests: 5000,    // Delay máximo (5s)
}
```

### Configuración de Calidad
```typescript
quality: {
  minTitleLength: 10,               // Longitud mínima del título
  minBajadaLength: 20,              // Longitud mínima de la bajada
  maxDaysOld: 30,                   // Máximo días de antigüedad
  requireImage: true,                // Si requiere imagen
}
```

## 🔍 Monitoreo y Debugging

### Logs Estructurados
El sistema genera logs detallados para cada operación:

```typescript
logger.info('API', 'Procesando fuente', { 
  sourceId: 'criticasur', 
  startTime: new Date() 
});

logger.error('API', 'Error en fuente', error, { 
  sourceId: 'criticasur', 
  retryCount: 2 
});
```

### Métricas de Cache
```typescript
const cacheStats = cacheService.getStats();
console.log('Hit rate:', cacheStats.hitRate);
console.log('Cache size:', cacheStats.size);
```

### Health Checks
```typescript
// GET /api/fetch/noticias?action=health
{
  "status": "healthy",
  "checks": {
    "sources": true,
    "processor": true,
    "cache": true,
    "database": true
  }
}
```

## 🚨 Manejo de Errores

### Errores de Fuente Individual
- Si una fuente falla, las demás continúan procesándose
- Sistema de retry automático con backoff exponencial
- Logs detallados de errores para debugging

### Errores del Sistema
- Validación de configuración al inicio
- Fallback graceful para operaciones críticas
- Notificaciones de errores (configurables)

## 📈 Optimizaciones de Performance

### 1. **Procesamiento en Lotes**
- Las noticias se procesan en lotes de 50 para optimizar DB
- Reduce el número de conexiones y transacciones

### 2. **Cache Inteligente**
- Cache en memoria con TTL configurable
- Evita requests duplicados a las mismas fuentes
- Métricas de hit/miss rate

### 3. **Rate Limiting por Fuente**
- Cada fuente tiene su propia configuración de rate limiting
- Evita sobrecargar sitios web externos
- Configuración granular por prioridad

### 4. **Procesamiento Paralelo**
- Múltiples fuentes se procesan simultáneamente
- Control de concurrencia configurable
- Timeouts individuales por fuente

## 🔧 Configuración de Producción

### Variables de Entorno Recomendadas
```bash
# Logging
LOG_LEVEL=INFO
ENABLE_DEBUG_MODE=false

# Cache
CACHE_ENABLED=true
CACHE_TTL_MS=300000
CACHE_MAX_SIZE=100

# Rate Limiting
GLOBAL_RATE_LIMIT=300
DEFAULT_DELAY_MS=1000

# Monitoreo
ENABLE_METRICS=true
ENABLE_HEALTH_CHECKS=true
```

### Cron Job Recomendado
```bash
# Ejecutar cada hora
0 * * * * curl -X POST https://tu-dominio.com/api/fetch/noticias
```

## 🧪 Testing

### Probar Fuente Individual
```bash
# Procesar solo una fuente específica
curl -X POST https://tu-dominio.com/api/fetch/noticias \
  -H "Content-Type: application/json" \
  -d '{"sourceId": "criticasur"}'
```

### Verificar Estado del Sistema
```bash
# Health check
curl https://tu-dominio.com/api/fetch/noticias?action=health

# Estadísticas
curl https://tu-dominio.com/api/fetch/noticias?action=stats
```

## 🔮 Roadmap Futuro

- [ ] **Sistema de notificaciones** (Slack, Email)
- [ ] **Métricas avanzadas** (Prometheus, Grafana)
- [ ] **Cache distribuido** (Redis)
- [ ] **Queue de procesamiento** (Bull, Agenda)
- [ ] **Dashboard de administración** web
- [ ] **Machine Learning** para categorización automática
- [ ] **Sistema de alertas** inteligentes

## 📝 Contribuir

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-fuente`)
3. **Commit** tus cambios (`git commit -am 'Agregar nueva fuente'`)
4. **Push** a la rama (`git push origin feature/nueva-fuente`)
5. **Crea** un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.
