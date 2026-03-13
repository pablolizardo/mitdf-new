import { INoticiaSource } from './types';

// Tipo para la configuración base (sin la función fetch)
export interface INoticiaSourceBaseConfig {
  id: string;
  name: string;
  baseUrl: string;
  enabled: boolean;
  priority: number;
  defaultCity: string;
  rateLimit: {
    requestsPerMinute: number;
    delayBetweenRequests: number;
  };
  retryConfig: {
    maxRetries: number;
    backoffMs: number;
  };
}

// Configuración base sin las funciones fetch para evitar dependencias circulares
export const NOTICIAS_SOURCES_CONFIG_BASE: INoticiaSourceBaseConfig[] = [
  {
    id: 'actualidadtdf',
    name: 'Actualidad TDF',
    baseUrl: 'https://www.actualidadtdf.com.ar',
    enabled: true,
    priority: 1,
    defaultCity: 'Ushuaia',
    rateLimit: {
      requestsPerMinute: 60,
      delayBetweenRequests: 1000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMs: 2000,
    },
  },
  {
    id: 'aire-libre',
    name: 'Aire Libre',
    baseUrl: 'https://www.airelibre.com.ar',
    enabled: true,
    priority: 2,
    defaultCity: 'Río Grande',
    rateLimit: {
      requestsPerMinute: 60,
      delayBetweenRequests: 1000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMs: 2000,
    },
  },
  {
    id: 'criticasur',
    name: 'Critica Sur',
    baseUrl: 'https://criticasur.com.ar',
    enabled: true,
    priority: 3,
    defaultCity: 'Ushuaia',
    rateLimit: {
      requestsPerMinute: 30,
      delayBetweenRequests: 2000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMs: 2000,
    },
  },
  {
    id: 'diecinueve',
    name: 'Diecinueve',
    baseUrl: 'https://www.diecinueve.com.ar',
    enabled: true,
    priority: 4,
    defaultCity: 'Río Grande',
    rateLimit: {
      requestsPerMinute: 60,
      delayBetweenRequests: 1000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMs: 2000,
    },
  },
  {
    id: 'fin-del-mundo',
    name: 'Fin del Mundo',
    baseUrl: 'https://www.findelmundo.com.ar',
    enabled: true,
    priority: 5,
    defaultCity: 'Ushuaia',
    rateLimit: {
      requestsPerMinute: 60,
      delayBetweenRequests: 1000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMs: 2000,
    },
  },
  {
    id: 'info3',
    name: 'Info3',
    baseUrl: 'https://www.info3.com.ar',
    enabled: true,
    priority: 6,
    defaultCity: 'Río Grande',
    rateLimit: {
      requestsPerMinute: 60,
      delayBetweenRequests: 1000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMs: 2000,
    },
  },
  {
    id: 'minuto-fueguino',
    name: 'Minuto Fueguino',
    baseUrl: 'https://www.minutofueguino.com.ar',
    enabled: true,
    priority: 7,
    defaultCity: 'Río Grande',
    rateLimit: {
      requestsPerMinute: 60,
      delayBetweenRequests: 1000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMs: 2000,
    },
  },
  {
    id: 'notitdf',
    name: 'Noti TDF',
    baseUrl: 'https://www.notitdf.com.ar',
    enabled: true,
    priority: 8,
    defaultCity: 'Ushuaia',
    rateLimit: {
      requestsPerMinute: 60,
      delayBetweenRequests: 1000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMs: 2000,
    },
  },
  {
    id: 'provincia-23',
    name: 'Provincia 23',
    baseUrl: 'https://www.provincia23.com.ar',
    enabled: true,
    priority: 9,
    defaultCity: 'Río Grande',
    rateLimit: {
      requestsPerMinute: 60,
      delayBetweenRequests: 1000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMs: 2000,
    },
  },
  {
    id: 'resumen-policial',
    name: 'Resumen Policial',
    baseUrl: 'https://www.resumenpolicial.com.ar',
    enabled: true,
    priority: 10,
    defaultCity: 'Nacional',
    rateLimit: {
      requestsPerMinute: 60,
      delayBetweenRequests: 1000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMs: 2000,
    },
  },
  {
    id: 'sur54',
    name: 'Sur 54',
    baseUrl: 'https://www.sur54.com.ar',
    enabled: true,
    priority: 11,
    defaultCity: 'Río Grande',
    rateLimit: {
      requestsPerMinute: 60,
      delayBetweenRequests: 1000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMs: 2000,
    },
  },
  {
    id: 'surenio',
    name: 'Surenio',
    baseUrl: 'https://www.surenio.com.ar',
    enabled: true,
    priority: 12,
    defaultCity: 'Ushuaia',
    rateLimit: {
      requestsPerMinute: 60,
      delayBetweenRequests: 1000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMs: 2000,
    },
  },
];

// Función helper para obtener fuentes habilitadas ordenadas por prioridad
export const getEnabledSources = (): INoticiaSourceBaseConfig[] => {
  return NOTICIAS_SOURCES_CONFIG_BASE
    .filter((source) => source.enabled)
    .sort((a, b) => a.priority - b.priority);
};

// Función helper para obtener una fuente específica
export const getSourceById = (id: string): INoticiaSourceBaseConfig | undefined => {
  return NOTICIAS_SOURCES_CONFIG_BASE.find((source) => source.id === id);
};
