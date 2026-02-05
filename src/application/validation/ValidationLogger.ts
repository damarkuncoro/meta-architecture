import { ValidationLogger as IValidationLogger, LogEntry, LogLevel } from './interfaces/ValidationLogger';

/**
 * Default console-based validation logger implementation
 */
export class ValidationLogger implements IValidationLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000; // Keep last 1000 entries

  log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context
    };

    this.logs.push(entry);

    // Maintain log limit
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output for development
    const consoleMethod = level === 'debug' ? 'debug' :
                         level === 'info' ? 'info' :
                         level === 'warn' ? 'warn' : 'error';

    console[consoleMethod](`[Validation:${level.toUpperCase()}] ${message}`, context || '');
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };
    this.log('error', message, errorContext);
  }

  logValidationStart(operation: string, context?: Record<string, any>): void {
    this.info(`Validation started: ${operation}`, {
      ...context,
      operation,
      event: 'validation_start'
    });
  }

  logValidationEnd(operation: string, duration: number, success: boolean, context?: Record<string, any>): void {
    const level: LogLevel = success ? 'info' : 'error';
    this.log(level, `Validation completed: ${operation}`, {
      ...context,
      operation,
      duration,
      success,
      event: 'validation_end'
    });
  }

  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel, count?: number): LogEntry[] {
    const filtered = this.logs.filter(log => log.level === level);
    return count ? filtered.slice(-count) : filtered;
  }

  /**
   * Get logs for a specific operation
   */
  getLogsByOperation(operation: string, count?: number): LogEntry[] {
    const filtered = this.logs.filter(log => log.operation === operation);
    return count ? filtered.slice(-count) : filtered;
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs to JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}