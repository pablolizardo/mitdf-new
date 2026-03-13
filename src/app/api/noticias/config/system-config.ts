export const SYSTEM_CONFIG = {
  // Configuración de procesamiento
  processing: {
    batchSize: 50, // Tamaño del lote para procesamiento en DB
    maxConcurrentSources: 5, // Máximo número de fuentes procesándose en paralelo
    timeoutMs: 30000, // Timeout para cada fuente (30 segundos)
  },
  
  // Configuración de rate limiting global
  rateLimiting: {
    globalRequestsPerMinute: 300, // Límite global de requests por minuto
    defaultDelayBetweenRequests: 1000, // Delay por defecto entre requests (1 segundo)
    maxDelayBetweenRequests: 5000, // Delay máximo entre requests (5 segundos)
  },
  
  // Configuración de retry
  retry: {
    defaultMaxRetries: 3, // Número máximo de reintentos por defecto
    defaultBackoffMs: 2000, // Backoff por defecto en milisegundos
    maxBackoffMs: 10000, // Backoff máximo en milisegundos
  },
  
  // Configuración de calidad de noticias
  quality: {
    minTitleLength: 10, // Longitud mínima del título
    minBajadaLength: 20, // Longitud mínima de la bajada
    maxDaysOld: 30, // Máximo número de días de antigüedad
    requireImage: true, // Si se requiere imagen
    defaultImageUrl: 'default-image-url', // URL de imagen por defecto
  },
  
  // Configuración de logging
  logging: {
    level: 'INFO', // Nivel de logging: DEBUG, INFO, WARN, ERROR
    maxLogs: 1000, // Máximo número de logs en memoria
    enableConsoleOutput: true, // Si habilitar output a consola
  },
  
  // Configuración de cache
  cache: {
    enabled: true, // Si habilitar cache
    ttlMs: 300000, // Tiempo de vida del cache (5 minutos)
    maxSize: 100, // Tamaño máximo del cache
  },
  
  // Configuración de monitoreo
  monitoring: {
    enableMetrics: true, // Si habilitar métricas
    enableHealthChecks: true, // Si habilitar health checks
    metricsRetentionDays: 7, // Días de retención de métricas
  },
  
  // Configuración de notificaciones
  notifications: {
    enableSlack: false, // Si habilitar notificaciones de Slack
    enableEmail: false, // Si habilitar notificaciones por email
    slackWebhookUrl: '', // URL del webhook de Slack
    emailRecipients: [], // Lista de destinatarios de email
  },
  
  // Configuración de desarrollo
  development: {
    enableDebugMode: false, // Si habilitar modo debug
    enableSourceMaps: false, // Si habilitar source maps
    enableHotReload: false, // Si habilitar hot reload
  },
} as const;

// Tipos para la configuración
export type SystemConfig = typeof SYSTEM_CONFIG;
export type ProcessingConfig = SystemConfig['processing'];
export type RateLimitingConfig = SystemConfig['rateLimiting'];
export type RetryConfig = SystemConfig['retry'];
export type QualityConfig = SystemConfig['quality'];
export type LoggingConfig = SystemConfig['logging'];
export type CacheConfig = SystemConfig['cache'];
export type MonitoringConfig = SystemConfig['monitoring'];
export type NotificationsConfig = SystemConfig['notifications'];
export type DevelopmentConfig = SystemConfig['development'];

// Función para obtener configuración específica
export function getConfig<K extends keyof SystemConfig>(key: K): SystemConfig[K] {
  return SYSTEM_CONFIG[key];
}

// Función para obtener configuración anidada
export function getNestedConfig<K extends keyof SystemConfig, N extends keyof SystemConfig[K]>(
  section: K,
  key: N
): SystemConfig[K][N] {
  return SYSTEM_CONFIG[section][key];
}

// Función para validar configuración
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validar configuración de procesamiento
  if (SYSTEM_CONFIG.processing.batchSize <= 0) {
    errors.push('batchSize debe ser mayor a 0');
  }
  
  if (SYSTEM_CONFIG.processing.maxConcurrentSources <= 0) {
    errors.push('maxConcurrentSources debe ser mayor a 0');
  }
  
  if (SYSTEM_CONFIG.processing.timeoutMs <= 0) {
    errors.push('timeoutMs debe ser mayor a 0');
  }
  
  // Validar configuración de rate limiting
  if (SYSTEM_CONFIG.rateLimiting.globalRequestsPerMinute <= 0) {
    errors.push('globalRequestsPerMinute debe ser mayor a 0');
  }
  
  if (SYSTEM_CONFIG.rateLimiting.defaultDelayBetweenRequests < 0) {
    errors.push('defaultDelayBetweenRequests no puede ser negativo');
  }
  
  // Validar configuración de retry
  if (SYSTEM_CONFIG.retry.defaultMaxRetries < 0) {
    errors.push('defaultMaxRetries no puede ser negativo');
  }
  
  if (SYSTEM_CONFIG.retry.defaultBackoffMs < 0) {
    errors.push('defaultBackoffMs no puede ser negativo');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Función para obtener configuración en tiempo de ejecución
export function getRuntimeConfig(): SystemConfig {
  // Aquí podrías agregar lógica para obtener configuración
  // desde variables de entorno o archivos de configuración
  return SYSTEM_CONFIG;
}
