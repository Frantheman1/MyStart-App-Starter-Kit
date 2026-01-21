/**
 * Analytics
 * 
 * Centralized analytics tracking with consistent event naming.
 * Integration points for services like Firebase Analytics, Amplitude, etc.
 * 
 * Usage:
 *   analytics.track('screen_view', { screen_name: 'Home' });
 *   analytics.identify('user-123', { email: 'user@example.com' });
 */

import { config } from '@/config';
import { logger } from '@/lib/logging/logger';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
}

export interface UserProperties {
  [key: string]: string | number | boolean | null;
}

class Analytics {
  private enabled: boolean;
  private userId: string | null = null;
  private userProperties: UserProperties = {};
  private events: AnalyticsEvent[] = [];

  constructor(enabled: boolean = false) {
    this.enabled = enabled && config.enableAnalytics;
  }

  /**
   * Initialize analytics (connect to your service here)
   */
  async initialize(): Promise<void> {
    if (!this.enabled) return;

    logger.info('Analytics initialized');
    // TODO: Initialize your analytics service here
    // Example: await Analytics.initialize();
  }

  /**
   * Track an event
   */
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        user_id: this.userId,
      },
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);
    logger.debug('Analytics event tracked', event);

    // TODO: Send event to your analytics service
    // Example: Analytics.logEvent(eventName, properties);
  }

  /**
   * Identify a user
   */
  identify(userId: string, properties?: UserProperties): void {
    if (!this.enabled) return;

    this.userId = userId;
    if (properties) {
      this.userProperties = { ...this.userProperties, ...properties };
    }

    logger.debug('User identified', { userId, properties });

    // TODO: Send user identification to your analytics service
    // Example: Analytics.setUserId(userId);
    // Example: Analytics.setUserProperties(properties);
  }

  /**
   * Reset user identity (on logout)
   */
  reset(): void {
    if (!this.enabled) return;

    this.userId = null;
    this.userProperties = {};

    logger.debug('Analytics reset');

    // TODO: Reset analytics service
    // Example: Analytics.resetAnalyticsData();
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    logger.info(`Analytics ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get tracked events (for debugging)
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Clear tracked events
   */
  clearEvents(): void {
    this.events = [];
  }
}

// Create and export singleton instance
export const analytics = new Analytics(config.enableAnalytics);

// Common event names (use these for consistency)
export const AnalyticsEvents = {
  // App lifecycle
  APP_OPEN: 'app_open',
  APP_BACKGROUND: 'app_background',
  APP_FOREGROUND: 'app_foreground',

  // Screen views
  SCREEN_VIEW: 'screen_view',

  // Auth events
  SIGN_UP_STARTED: 'sign_up_started',
  SIGN_UP_COMPLETED: 'sign_up_completed',
  SIGN_IN: 'sign_in',
  SIGN_OUT: 'sign_out',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'password_reset_completed',

  // User actions
  BUTTON_CLICKED: 'button_clicked',
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  ITEM_VIEWED: 'item_viewed',
  ITEM_SHARED: 'item_shared',

  // Errors
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',

  // Feature usage
  FEATURE_USED: 'feature_used',
  TUTORIAL_STARTED: 'tutorial_started',
  TUTORIAL_COMPLETED: 'tutorial_completed',
} as const;
