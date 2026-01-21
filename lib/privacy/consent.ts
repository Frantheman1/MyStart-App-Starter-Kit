/**
 * Privacy Consent Management
 * 
 * Manages user consent for analytics, tracking, and data collection.
 * GDPR/CCPA compliant consent management.
 * 
 * Usage:
 *   const hasConsent = await consentManager.hasConsent('analytics');
 *   await consentManager.grantConsent('analytics');
 */

import { secureStorage } from '@/lib/storage/secure-storage';
import { logger } from '@/lib/logging/logger';
import { analytics } from '@/lib/analytics/analytics';
import { crashReporting } from '@/lib/errors/crash-reporting';

export type ConsentType = 'analytics' | 'crashReporting' | 'marketing' | 'functional';

export interface ConsentPreferences {
  analytics: boolean;
  crashReporting: boolean;
  marketing: boolean;
  functional: boolean;
  lastUpdated: string;
}

const CONSENT_STORAGE_KEY = 'user_consent_preferences';

class ConsentManager {
  private preferences: ConsentPreferences | null = null;

  /**
   * Initialize consent manager
   */
  async initialize(): Promise<void> {
    await this.loadPreferences();
    logger.info('Consent manager initialized', { preferences: this.preferences });
  }

  /**
   * Load consent preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    try {
      const stored = await secureStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        this.preferences = JSON.parse(stored);
        this.applyPreferences();
      }
    } catch (error) {
      logger.error('Failed to load consent preferences', { error });
    }
  }

  /**
   * Save consent preferences to storage
   */
  private async savePreferences(): Promise<void> {
    if (!this.preferences) return;

    try {
      await secureStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify(this.preferences)
      );
      logger.info('Consent preferences saved', { preferences: this.preferences });
    } catch (error) {
      logger.error('Failed to save consent preferences', { error });
    }
  }

  /**
   * Apply consent preferences to services
   */
  private applyPreferences(): void {
    if (!this.preferences) return;

    // Apply analytics consent
    if (analytics) {
      analytics.setEnabled(this.preferences.analytics);
    }

    // Apply crash reporting consent
    if (crashReporting) {
      crashReporting.setEnabled(this.preferences.crashReporting);
    }

    logger.debug('Consent preferences applied');
  }

  /**
   * Check if consent has been given
   */
  hasConsent(type: ConsentType): boolean {
    return this.preferences?.[type] ?? false;
  }

  /**
   * Check if consent has been requested
   */
  hasConsentBeenRequested(): boolean {
    return this.preferences !== null;
  }

  /**
   * Grant consent for a specific type
   */
  async grantConsent(type: ConsentType): Promise<void> {
    if (!this.preferences) {
      this.preferences = {
        analytics: false,
        crashReporting: false,
        marketing: false,
        functional: true, // Functional is typically always allowed
        lastUpdated: new Date().toISOString(),
      };
    }

    this.preferences[type] = true;
    this.preferences.lastUpdated = new Date().toISOString();

    await this.savePreferences();
    this.applyPreferences();

    logger.info(`Consent granted: ${type}`);
  }

  /**
   * Revoke consent for a specific type
   */
  async revokeConsent(type: ConsentType): Promise<void> {
    if (!this.preferences) return;

    this.preferences[type] = false;
    this.preferences.lastUpdated = new Date().toISOString();

    await this.savePreferences();
    this.applyPreferences();

    logger.info(`Consent revoked: ${type}`);
  }

  /**
   * Grant all consents
   */
  async grantAllConsent(): Promise<void> {
    this.preferences = {
      analytics: true,
      crashReporting: true,
      marketing: true,
      functional: true,
      lastUpdated: new Date().toISOString(),
    };

    await this.savePreferences();
    this.applyPreferences();

    logger.info('All consents granted');
  }

  /**
   * Revoke all consents (except functional)
   */
  async revokeAllConsent(): Promise<void> {
    this.preferences = {
      analytics: false,
      crashReporting: false,
      marketing: false,
      functional: true, // Keep functional enabled
      lastUpdated: new Date().toISOString(),
    };

    await this.savePreferences();
    this.applyPreferences();

    logger.info('All consents revoked');
  }

  /**
   * Get all consent preferences
   */
  getPreferences(): ConsentPreferences | null {
    return this.preferences ? { ...this.preferences } : null;
  }

  /**
   * Update multiple consent preferences
   */
  async updatePreferences(preferences: Partial<ConsentPreferences>): Promise<void> {
    if (!this.preferences) {
      await this.grantAllConsent();
    }

    this.preferences = {
      ...this.preferences!,
      ...preferences,
      lastUpdated: new Date().toISOString(),
    };

    await this.savePreferences();
    this.applyPreferences();

    logger.info('Consent preferences updated', { preferences: this.preferences });
  }

  /**
   * Reset all consent preferences
   */
  async reset(): Promise<void> {
    this.preferences = null;
    await secureStorage.removeItem(CONSENT_STORAGE_KEY);
    logger.info('Consent preferences reset');
  }
}

// Create and export singleton instance
export const consentManager = new ConsentManager();
