/**
 * Log levels for validation operations
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log entry structure
 */
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  operation?: string;
  duration?: number;
  error?: Error;
}

/**
 * Validation logger interface
 */
export interface ValidationLogger {
  /**
   * Log a message at the specified level
   */
  log(level: LogLevel, message: string, context?: Record<string, any>): void;

  /**
   * Log debug information
   */
  debug(message: string, context?: Record<string, any>): void;

  /**
   * Log informational message
   */
  info(message: string, context?: Record<string, any>): void;

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>): void;

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Record<string, any>): void;

  /**
   * Log validation operation start
   */
  logValidationStart(operation: string, context?: Record<string, any>): void;

  /**
   * Log validation operation completion
   */
  logValidationEnd(operation: string, duration: number, success: boolean, context?: Record<string, any>): void;

  /**
   * Get recent log entries
   */
  getRecentLogs(count?: number): LogEntry[];
}

/**
 * Monitoring hooks interface
 */
export interface ValidationMonitoringHooks {
  /**
   * Called before validation starts
   */
  onValidationStart?(context: {
    operation: string;
    contractId?: string;
    contractName?: string;
    rulesCount: number;
  }): void;

  /**
   * Called after validation completes
   */
  onValidationComplete?(context: {
    operation: string;
    duration: number;
    success: boolean;
    errorsCount: number;
    warningsCount: number;
    performance: any;
  }): void;

  /**
   * Called when a rule execution fails
   */
  onRuleFailure?(context: {
    ruleName: string;
    error: Error;
    executionTime: number;
  }): void;

  /**
   * Called when performance thresholds are exceeded
   */
  onPerformanceThresholdExceeded?(context: {
    metric: string;
    value: number;
    threshold: number;
    operation: string;
  }): void;

  /**
   * Called when plugins are loaded/unloaded
   */
  onPluginChange?(context: {
    action: 'loaded' | 'unloaded' | 'enabled' | 'disabled';
    pluginName: string;
    pluginVersion?: string;
  }): void;
}