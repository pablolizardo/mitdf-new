export type INoticias = {
  noticias: INoticia[];
};

export type INoticia = {
  _id: string;
  bajada: string;
  categoria: string;
  ciudad?: string | null;
  fecha: string;
  foto: string;
  longtext?: string;
  medio: string;
  slug: string;
  tags?: string[];
  titulo: string;
  url: string;
  written_at: string | Date;
};

// Nuevos tipos para el sistema optimizado
export interface INoticiaSource {
  id: string;
  name: string;
  baseUrl: string;
  enabled: boolean;
  priority: number;
  defaultCity: string; // Ciudad por defecto para esta fuente
  rateLimit: {
    requestsPerMinute: number;
    delayBetweenRequests: number;
  };
  retryConfig: {
    maxRetries: number;
    backoffMs: number;
  };
  fetch: () => Promise<INoticia[]>;
}

export interface INoticiaProcessingResult {
  success: boolean;
  sourceId: string;
  noticias: INoticia[];
  error?: string;
  processingTime: number;
  added: number;
  skipped: number;
}

export interface INoticiaProcessingSummary {
  totalSources: number;
  successfulSources: number;
  failedSources: number;
  totalNoticias: number;
  totalAdded: number;
  totalSkipped: number;
  totalProcessingTime: number;
  results: INoticiaProcessingResult[];
}
