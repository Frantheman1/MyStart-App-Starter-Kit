/**
 * Logger
 * 
 * Centralized logging with levels and sensitive data redaction.
 * 
 * Usage:
 *   logger.debug('Debug message', { data });
 *   logger.info('Info message');
 *   logger.error('Error occurred', { error });
 */

import { config } from '@/config';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

// Sensitive data patterns to redact
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /auth/i,
  /credit[_-]?card/i,
  /ssn/i,
  /social[_-]?security/i,
];

class Logger {
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor(level: LogLevel = 'info') {
    this.logLevel = level;
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Redact sensitive data from objects
   */
  private redactSensitiveData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.redactSensitiveData(item));
    }

    const redacted: any = {};
    for (const [key, value] of Object.entries(data)) {
      const isSensitive = SENSITIVE_PATTERNS.some((pattern) =>
        pattern.test(key)
      );

      if (isSensitive) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        redacted[key] = this.redactSensitiveData(value);
      } else {
        redacted[key] = value;
      }
    }

    return redacted;
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Log a message
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      data: data ? this.redactSensitiveData(data) : undefined,
      timestamp: new Date().toISOString(),
    };

    // Store log
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    const logFn = level === 'debug' ? console.log : console[level];
    const prefix = `[${level.toUpperCase()}] ${entry.timestamp}`;
    
    if (data) {
      logFn(prefix, message, entry.data);
    } else {
      logFn(prefix, message);
    }
  }

  /**
   * Debug log
   */
  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  /**
   * Info log
   */
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  /**
   * Warning log
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  /**
   * Error log
   */
  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON string
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create and export singleton instance
export const logger = new Logger(config.logLevel);
