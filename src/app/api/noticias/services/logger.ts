export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  data?: any;
  error?: Error;
}

export class NoticiasLogger {
  private static instance: NoticiasLogger;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000; // Mantener solo los últimos 1000 logs
  private currentLevel: LogLevel = LogLevel.INFO;

  private constructor() {}

  public static getInstance(): NoticiasLogger {
    if (!NoticiasLogger.instance) {
      NoticiasLogger.instance = new NoticiasLogger();
    }
    return NoticiasLogger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  public debug(source: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, source, message, data);
  }

  public info(source: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, source, message, data);
  }

  public warn(source: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, source, message, data);
  }

  public error(source: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, source, message, data, error);
  }

  private log(level: LogLevel, source: string, message: string, data?: any, error?: Error): void {
    if (level < this.currentLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      data,
      error,
    };

    this.logs.push(entry);

    // Limpiar logs antiguos si excedemos el límite
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // También loggear a la consola
    this.logToConsole(entry);
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const levelStr = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${levelStr}] [${entry.source}]`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.error || '', entry.data || '');
        break;
    }
  }

  public getLogs(level?: LogLevel, source?: string, limit?: number): LogEntry[] {
    let filtered = this.logs;

    if (level !== undefined) {
      filtered = filtered.filter(log => log.level >= level);
    }

    if (source) {
      filtered = filtered.filter(log => log.source === source);
    }

    if (limit) {
      filtered = filtered.slice(-limit);
    }

    return filtered;
  }

  public getLogsBySource(source: string, limit?: number): LogEntry[] {
    return this.getLogs(undefined, source, limit);
  }

  public getRecentLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public getStats(): { total: number; byLevel: Record<string, number>; bySource: Record<string, number> } {
    const byLevel: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    this.logs.forEach(log => {
      const levelStr = LogLevel[log.level];
      byLevel[levelStr] = (byLevel[levelStr] || 0) + 1;
      bySource[log.source] = (bySource[log.source] || 0) + 1;
    });

    return {
      total: this.logs.length,
      byLevel,
      bySource,
    };
  }
}

// Exportar instancia singleton
export const logger = NoticiasLogger.getInstance();
