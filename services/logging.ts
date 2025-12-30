/**
 * Logging Service
 * Handles error tracking, analytics, and debugging
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log a message
   */
  log(message: string, level: LogLevel = LogLevel.INFO, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
    };

    this.logs.push(entry);

    // Keep logs bounded
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (this.isDevelopment) {
      console.log(`[${level}] ${message}`, context);
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(message, LogLevel.DEBUG, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(message, LogLevel.INFO, context);
  }

  /**
   * Log warning
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(message, LogLevel.WARN, context);
  }

  /**
   * Log error
   */
  error(message: string, error?: Error | any, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.ERROR,
      message,
      context,
      error: error instanceof Error ? error : new Error(String(error)),
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context);
    }

    // In production, send to analytics/error tracking service
    if (!this.isDevelopment) {
      this.reportError(message, error, context);
    }
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Report error to external service
   */
  private reportError(message: string, error: any, context?: Record<string, any>): void {
    // TODO: Implement error reporting to service like Sentry, LogRocket, etc.
    // Example: Sentry.captureException(error, { tags: { context } });
    try {
      console.error('Error Report:', {
        message,
        error: error?.message || String(error),
        context,
      });
    } catch (e) {
      // Prevent logging from breaking the app
    }
  }
}

export const logger = new LoggingService();

/**
 * Convenience functions
 */
export const addErrorLog = (message: string, error?: Error | any, context?: Record<string, any>) => {
  logger.error(message, error, context);
};

export const addWarningLog = (message: string, context?: Record<string, any>) => {
  logger.warn(message, context);
};

export const addInfoLog = (message: string, context?: Record<string, any>) => {
  logger.info(message, context);
};

export const addDebugLog = (message: string, context?: Record<string, any>) => {
  logger.debug(message, context);
};
