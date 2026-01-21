/**
 * Crash Reporting
 * 
 * Integration point for crash reporting services like Sentry, Bugsnag, etc.
 * 
 * Usage:
 *   crashReporting.initialize();
 *   crashReporting.captureException(error);
 */

import { config } from '@/config';
import { logger } from '@/lib/logging/logger';

export interface CrashReportContext {
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

class CrashReporting {
  private enabled: boolean;
  private context: CrashReportContext = {};

  constructor(enabled: boolean = false) {
    this.enabled = enabled && config.enableCrashReporting;
  }

  /**
   * Initialize crash reporting (connect to your service here)
   */
  async initialize(): Promise<void> {
    if (!this.enabled) return;

    logger.info('Crash reporting initialized');
    
    // TODO: Initialize your crash reporting service here
    // Example with Sentry:
    // import * as Sentry from '@sentry/react-native';
    // Sentry.init({
    //   dsn: 'YOUR_DSN',
    //   environment: config.env,
    //   enableAutoSessionTracking: true,
    //   tracesSampleRate: 1.0,
    // });
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: CrashReportContext): void {
    if (!this.enabled) {
      logger.error('Exception captured (crash reporting disabled)', {
        error: error.message,
        stack: error.stack,
      });
      return;
    }

    logger.error('Exception captured', {
      error: error.message,
      stack: error.stack,
      context,
    });

    // TODO: Send exception to your crash reporting service
    // Example: Sentry.captureException(error, { contexts: context });
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.enabled) {
      logger[level === 'warning' ? 'warn' : level](`Message captured: ${message}`);
      return;
    }

    logger[level === 'warning' ? 'warn' : level](`Message captured: ${message}`);

    // TODO: Send message to your crash reporting service
    // Example: Sentry.captureMessage(message, level);
  }

  /**
   * Set user context
   */
  setUser(user: CrashReportContext['user']): void {
    if (!this.enabled) return;

    this.context.user = user;
    logger.debug('Crash reporting user context set', { user });

    // TODO: Set user context in your crash reporting service
    // Example: Sentry.setUser(user);
  }

  /**
   * Set tags
   */
  setTags(tags: Record<string, string>): void {
    if (!this.enabled) return;

    this.context.tags = { ...this.context.tags, ...tags };
    logger.debug('Crash reporting tags set', { tags });

    // TODO: Set tags in your crash reporting service
    // Example: Sentry.setTags(tags);
  }

  /**
   * Set extra context
   */
  setExtra(extra: Record<string, any>): void {
    if (!this.enabled) return;

    this.context.extra = { ...this.context.extra, ...extra };
    logger.debug('Crash reporting extra context set', { extra });

    // TODO: Set extra context in your crash reporting service
    // Example: Object.entries(extra).forEach(([key, value]) => {
    //   Sentry.setExtra(key, value);
    // });
  }

  /**
   * Clear user context (on logout)
   */
  clearUser(): void {
    if (!this.enabled) return;

    this.context.user = undefined;
    logger.debug('Crash reporting user context cleared');

    // TODO: Clear user context in your crash reporting service
    // Example: Sentry.setUser(null);
  }

  /**
   * Add breadcrumb (for debugging context)
   */
  addBreadcrumb(message: string, data?: Record<string, any>): void {
    if (!this.enabled) return;

    logger.debug('Breadcrumb added', { message, data });

    // TODO: Add breadcrumb to your crash reporting service
    // Example: Sentry.addBreadcrumb({ message, data });
  }

  /**
   * Enable/disable crash reporting
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    logger.info(`Crash reporting ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Create and export singleton instance
export const crashReporting = new CrashReporting(config.enableCrashReporting);
